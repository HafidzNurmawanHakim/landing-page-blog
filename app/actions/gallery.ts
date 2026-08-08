"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  createGalleryItem,
  deleteGalleryItem,
  getGalleryItemById,
  updateGalleryItem,
} from "@/lib/db/repositories/gallery";
import { galleryItemSchema } from "@/lib/validations/gallery";
import type { Locale, LocalizedString } from "@/lib/i18n/locales";

function cleanLocalized(
  obj: Record<string, string | undefined> | undefined
): LocalizedString {
  const out: LocalizedString = {};
  if (!obj) return out;
  for (const [key, value] of Object.entries(obj)) {
    if (value && value.trim()) out[key as Locale] = value.trim();
  }
  return out;
}

export type GalleryActionResult =
  | { success: true; id: number }
  | { success: false; message: string };

const idSchema = z.coerce.number().int().positive();

export async function createGalleryItemAction(
  input: z.infer<typeof galleryItemSchema>
): Promise<GalleryActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = galleryItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const item = await createGalleryItem({
    imageUrl: parsed.data.imageUrl,
    caption: cleanLocalized(parsed.data.caption),
  });

  return { success: true, id: item.id };
}

export async function updateGalleryItemAction(
  id: number,
  input: z.infer<typeof galleryItemSchema>
): Promise<GalleryActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID gambar tidak valid." };
  }

  const parsed = galleryItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const existing = await getGalleryItemById(id);
  if (!existing) {
    return { success: false, message: "Gambar tidak ditemukan." };
  }

  const updated = await updateGalleryItem(id, {
    imageUrl: parsed.data.imageUrl,
    caption: cleanLocalized(parsed.data.caption),
  });
  if (!updated) {
    return { success: false, message: "Gambar tidak ditemukan." };
  }

  return { success: true, id: updated.id };
}

export async function deleteGalleryItemAction(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID gambar tidak valid." };
  }

  const deleted = await deleteGalleryItem(id);
  if (!deleted) {
    return { success: false, message: "Gambar tidak ditemukan." };
  }

  return { success: true };
}
