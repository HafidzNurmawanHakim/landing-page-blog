"use server";

import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  recordBlogShare,
  toggleBlogLike,
} from "@/lib/db/repositories/blog";

/**
 * Public blog reactions (like / share), tied to the visitor IP.
 *
 * Same design as the gallery (docs/05-api-server-actions.md §5.6):
 * - Server Actions instead of API routes → CSRF-safe, no extra endpoints.
 * - Rate limited per IP to prevent vote/share spam.
 * - Uniqueness per (post, IP, type) enforced by the DB unique index.
 * - Errors returned as short codes; the client maps them to localized strings.
 */

const postIdSchema = z.coerce.number().int().positive();

const LIKE_RATE_LIMIT_MAX = 20;
const SHARE_RATE_LIMIT_MAX = 30;

export type ToggleLikeActionResult =
  | { success: true; liked: boolean; likeCount: number }
  | { success: false; error: "invalid_id" | "not_found" | "rate_limited" | "server_error" };

export async function toggleBlogPostLikeAction(
  postId: number
): Promise<ToggleLikeActionResult> {
  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) return { success: false, error: "invalid_id" };

  const ip = await getClientIp();
  const limit = await checkRateLimit(`blog-like:${ip}`, LIKE_RATE_LIMIT_MAX);
  if (!limit.ok) return { success: false, error: "rate_limited" };

  try {
    const result = await toggleBlogLike(parsed.data, ip);
    if (!result) return { success: false, error: "not_found" };
    return { success: true, liked: result.liked, likeCount: result.likeCount };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[blog-reactions] like failed:", err);
    return { success: false, error: "server_error" };
  }
}

export type ShareActionResult =
  | { success: true; counted: boolean; shareCount: number }
  | { success: false; error: "invalid_id" | "not_found" | "rate_limited" | "server_error" };

export async function shareBlogPostAction(
  postId: number
): Promise<ShareActionResult> {
  const parsed = postIdSchema.safeParse(postId);
  if (!parsed.success) return { success: false, error: "invalid_id" };

  const ip = await getClientIp();
  const limit = await checkRateLimit(`blog-share:${ip}`, SHARE_RATE_LIMIT_MAX);
  if (!limit.ok) return { success: false, error: "rate_limited" };

  try {
    const result = await recordBlogShare(parsed.data, ip);
    if (!result) return { success: false, error: "not_found" };
    return {
      success: true,
      counted: result.counted,
      shareCount: result.shareCount,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[blog-reactions] share failed:", err);
    return { success: false, error: "server_error" };
  }
}
