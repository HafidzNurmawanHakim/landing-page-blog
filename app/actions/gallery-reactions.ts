"use server";

import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  recordGalleryShare,
  toggleGalleryLike,
} from "@/lib/db/repositories/gallery";

/**
 * Public gallery reactions (like / share), tied to the visitor IP.
 *
 * Design (docs/05-api-server-actions.md §5.6, docs/09-non-functional.md):
 * - Server Actions instead of API routes → CSRF-safe, no extra endpoints.
 * - Rate limited per IP to prevent vote/share spam.
 * - Uniqueness per (photo, IP, type) enforced by the DB unique index.
 * - Errors are returned as short codes; the client maps them to localized
 *   strings so this file never depends on the request locale.
 */

const itemIdSchema = z.coerce.number().int().positive();

const LIKE_RATE_LIMIT_MAX = 20;
const SHARE_RATE_LIMIT_MAX = 30;

export type ToggleLikeActionResult =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; error: "invalid_id" | "not_found" | "rate_limited" | "server_error" };

export async function toggleGalleryLikeAction(
  itemId: number
): Promise<ToggleLikeActionResult> {
  const parsed = itemIdSchema.safeParse(itemId);
  if (!parsed.success) return { success: false, error: "invalid_id" };

  const ip = await getClientIp();
  const limit = await checkRateLimit(`gallery-like:${ip}`, LIKE_RATE_LIMIT_MAX);
  if (!limit.ok) return { success: false, error: "rate_limited" };

  try {
    const result = await toggleGalleryLike(parsed.data, ip);
    if (!result) return { success: false, error: "not_found" };
    return { success: true, liked: result.liked, likeCount: result.likeCount };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[gallery-reactions] like failed:", err);
    return { success: false, error: "server_error" };
  }
}

export type ShareGalleryActionResult =
  | { success: true; counted: boolean; shareCount: number }
  | { success: false; error: "invalid_id" | "not_found" | "rate_limited" | "server_error" };

export async function shareGalleryItemAction(
  itemId: number
): Promise<ShareGalleryActionResult> {
  const parsed = itemIdSchema.safeParse(itemId);
  if (!parsed.success) return { success: false, error: "invalid_id" };

  const ip = await getClientIp();
  const limit = await checkRateLimit(`gallery-share:${ip}`, SHARE_RATE_LIMIT_MAX);
  if (!limit.ok) return { success: false, error: "rate_limited" };

  try {
    const result = await recordGalleryShare(parsed.data, ip);
    if (!result) return { success: false, error: "not_found" };
    return {
      success: true,
      counted: result.counted,
      shareCount: result.shareCount,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[gallery-reactions] share failed:", err);
    return { success: false, error: "server_error" };
  }
}
