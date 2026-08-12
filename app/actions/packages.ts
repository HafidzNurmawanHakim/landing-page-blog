"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  createPackage,
  deletePackage,
  getPackageByCode,
  getPackageById,
  getPackageBySlug,
  togglePackageActive,
  updatePackage,
} from "@/lib/db/repositories/packages";
import { packageFormSchema, localizedName } from "@/lib/validations/packages";
import type { Locale, LocalizedString } from "@/lib/i18n/locales";

/**
 * Drop empty locales so stored objects only carry real values. Keeps the DB
 * tidy and lets `pickLocale` fall back cleanly.
 */
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

export type PackageActionResult =
  | { success: true; id: number }
  | { success: false; message: string };

const idSchema = z.coerce.number().int().positive();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPackageAction(
  input: z.infer<typeof packageFormSchema>
): Promise<PackageActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = packageFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(localizedName(data));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { success: false, message: "Slug tidak valid." };
  }

  if (await getPackageByCode(data.code)) {
    return { success: false, message: `Kode "${data.code}" sudah dipakai.` };
  }
  if (await getPackageBySlug(slug, false)) {
    return { success: false, message: `Slug "${slug}" sudah dipakai.` };
  }

  const pkg = await createPackage({
    code: data.code,
    name: cleanLocalized(data.name),
    slug,
    duration: data.duration || null,
    price: data.price,
    description: cleanLocalized(data.description),
    imageUrl: data.imageUrl || null,
    imageAlt: cleanLocalized(data.imageAlt),
    itinerary: data.itinerary ?? {},
    includes: data.includes ?? {},
    excludes: data.excludes ?? {},
    isActive: data.isActive ?? 1,
  });

  return { success: true, id: pkg.id };
}

export async function updatePackageAction(
  id: number,
  input: z.infer<typeof packageFormSchema>
): Promise<PackageActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID paket tidak valid." };
  }

  const parsed = packageFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const existing = await getPackageById(id);
  if (!existing) return { success: false, message: "Paket tidak ditemukan." };

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(localizedName(data));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { success: false, message: "Slug tidak valid." };
  }

  const byCode = await getPackageByCode(data.code);
  if (byCode && byCode.id !== id) {
    return { success: false, message: `Kode "${data.code}" sudah dipakai.` };
  }
  const bySlug = await getPackageBySlug(slug, false);
  if (bySlug && bySlug.id !== id) {
    return { success: false, message: `Slug "${slug}" sudah dipakai.` };
  }

  const updated = await updatePackage(id, {
    code: data.code,
    name: cleanLocalized(data.name),
    slug,
    duration: data.duration || null,
    price: data.price,
    description: cleanLocalized(data.description),
    imageUrl: data.imageUrl || null,
    imageAlt: cleanLocalized(data.imageAlt),
    itinerary: data.itinerary ?? {},
    includes: data.includes ?? {},
    excludes: data.excludes ?? {},
    isActive: data.isActive ?? existing.isActive,
  });
  if (!updated) return { success: false, message: "Paket tidak ditemukan." };

  return { success: true, id: updated.id };
}

export type TogglePackageResult =
  | { success: true }
  | { success: false; message: string };

export async function togglePackageActiveAction(
  id: number
): Promise<TogglePackageResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID paket tidak valid." };
  }

  const updated = await togglePackageActive(id);
  if (!updated) return { success: false, message: "Paket tidak ditemukan." };

  return { success: true };
}

export async function deletePackageAction(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID paket tidak valid." };
  }

  const deleted = await deletePackage(id);
  if (!deleted) return { success: false, message: "Paket tidak ditemukan." };

  return { success: true };
}
