import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "../client";
import { galleryItems, type GalleryItem } from "../schema";
import type { LocalizedString } from "@/lib/i18n/locales";

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
