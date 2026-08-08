import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../client";
import {
  galleryItems,
  galleryReactions,
  type GalleryItem,
} from "../schema";
import type { LocalizedString } from "@/lib/i18n/locales";

export const GALLERY_REACTION_LIKE = "like";
export const GALLERY_REACTION_SHARE = "share";

export type GalleryListResult = {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GalleryFilters = {
  page?: number;
  limit?: number;
};

export function serializeGalleryItem(row: GalleryItem) {
  return { ...row, caption: row.caption ?? {} };
}

export type SerializedGalleryItem = Omit<GalleryItem, "caption"> & {
  caption: LocalizedString;
};

export async function listGalleryItems(
  filters: GalleryFilters = {}
): Promise<GalleryListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 24));
  const offset = (page - 1) * limit;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(galleryItems)
      .orderBy(desc(galleryItems.createdAt), desc(galleryItems.id))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(galleryItems),
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  return {
    items: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getGalleryItemById(
  id: number
): Promise<GalleryItem | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type GalleryItemInput = {
  imageUrl: string;
  caption?: LocalizedString | null;
};

export async function createGalleryItem(
  data: GalleryItemInput
): Promise<GalleryItem> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const rows = await db
    .insert(galleryItems)
    .values({
      imageUrl: data.imageUrl,
      caption: data.caption ?? {},
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0];
}

export async function updateGalleryItem(
  id: number,
  data: GalleryItemInput
): Promise<GalleryItem | null> {
  const db = getDb();
  const existing = await getGalleryItemById(id);
  if (!existing) return null;

  const rows = await db
    .update(galleryItems)
    .set({
      imageUrl: data.imageUrl,
      caption: data.caption ?? {},
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(galleryItems.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteGalleryItem(id: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(galleryItems)
    .where(eq(galleryItems.id, id))
    .returning({ id: galleryItems.id });
  return rows.length > 0;
}

/**
 * Reactions (docs/09-non-functional.md: spam protection + per-user uniqueness).
 *
 * The counters on `gallery_items` are denormalized for O(1) reads in the grid;
 * `gallery_reactions` enforces at-most-one reaction per (photo, IP, type) via a
 * unique index. Inserts use `onConflictDoNothing` so concurrent duplicates are
 * swallowed instead of double-counting.
 */

export type GalleryReactionState = {
  liked: boolean;
  shared: boolean;
};

export async function getGalleryReactionStates(
  ids: number[],
  ip: string
): Promise<Map<number, GalleryReactionState>> {
  const map = new Map<number, GalleryReactionState>();
  for (const id of ids) map.set(id, { liked: false, shared: false });
  if (ids.length === 0) return map;

  const db = getDb();
  const rows = await db
    .select({
      galleryId: galleryReactions.galleryId,
      type: galleryReactions.type,
    })
    .from(galleryReactions)
    .where(
      and(
        eq(galleryReactions.ip, ip),
        inArray(galleryReactions.galleryId, ids)
      )
    );

  for (const row of rows) {
    const state = map.get(row.galleryId);
    if (!state) continue;
    if (row.type === GALLERY_REACTION_LIKE) state.liked = true;
    if (row.type === GALLERY_REACTION_SHARE) state.shared = true;
  }
  return map;
}

export type ToggleLikeResult = { liked: boolean; likeCount: number };

export async function toggleGalleryLike(
  id: number,
  ip: string
): Promise<ToggleLikeResult | null> {
  const db = getDb();
  const existing = await db
    .select({ id: galleryReactions.id })
    .from(galleryReactions)
    .where(
      and(
        eq(galleryReactions.galleryId, id),
        eq(galleryReactions.ip, ip),
        eq(galleryReactions.type, GALLERY_REACTION_LIKE)
      )
    )
    .limit(1);

  // Unlike: remove the reaction and decrement the counter (floor at 0).
  if (existing[0]) {
    await db.delete(galleryReactions).where(eq(galleryReactions.id, existing[0].id));
    const [updated] = await db
      .update(galleryItems)
      .set({ likeCount: sql`max(${galleryItems.likeCount} - 1, 0)` })
      .where(eq(galleryItems.id, id))
      .returning({ likeCount: galleryItems.likeCount });
    return { liked: false, likeCount: Number(updated?.likeCount ?? 0) };
  }

  // Like: insert the reaction; only count when the insert actually won the race.
  const inserted = await db
    .insert(galleryReactions)
    .values({ galleryId: id, ip, type: GALLERY_REACTION_LIKE })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    const [updated] = await db
      .update(galleryItems)
      .set({ likeCount: sql`${galleryItems.likeCount} + 1` })
      .where(eq(galleryItems.id, id))
      .returning({ likeCount: galleryItems.likeCount });
    return { liked: true, likeCount: Number(updated?.likeCount ?? 0) };
  }

  const [row] = await db
    .select({ likeCount: galleryItems.likeCount })
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);
  return { liked: true, likeCount: Number(row?.likeCount ?? 0) };
}

export type ShareResult = { counted: boolean; shareCount: number };

export async function recordGalleryShare(
  id: number,
  ip: string
): Promise<ShareResult | null> {
  const db = getDb();
  const inserted = await db
    .insert(galleryReactions)
    .values({ galleryId: id, ip, type: GALLERY_REACTION_SHARE })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    const [updated] = await db
      .update(galleryItems)
      .set({ shareCount: sql`${galleryItems.shareCount} + 1` })
      .where(eq(galleryItems.id, id))
      .returning({ shareCount: galleryItems.shareCount });
    return { counted: true, shareCount: Number(updated?.shareCount ?? 0) };
  }

  const [row] = await db
    .select({ shareCount: galleryItems.shareCount })
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);
  return { counted: false, shareCount: Number(row?.shareCount ?? 0) };
}
