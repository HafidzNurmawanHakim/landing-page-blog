"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  createTransportProduct,
  deleteTransportProduct,
  getTransportProductByCode,
  getTransportProductById,
  getTransportProductBySlug,
  toggleTransportProductActive,
  updateTransportProduct,
  type PricingPackageInput,
  type ExtraChargeInput,
} from "@/lib/db/repositories/transport";
import {
  localizedTransportTitle,
  transportFormSchema,
} from "@/lib/validations/transport";
import type { LocalizedString } from "@/lib/i18n/locales";

export type TransportActionResult =
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

function cleanLocalized(
  obj: Record<string, string | undefined> | undefined
): LocalizedString {
  const out: LocalizedString = {};
  if (!obj) return out;
  for (const [key, value] of Object.entries(obj)) {
    if (value && value.trim()) out[key as keyof LocalizedString] = value.trim();
  }
  return out;
}

type ParsedInput = z.infer<typeof transportFormSchema>;

function toRepoInput(data: ParsedInput) {
  return {
    code: data.code,
    title: cleanLocalized(data.title),
    slug: data.slug || "",
    category: data.category,
    capacity: data.capacity,
    capacityUnit: data.capacityUnit || "Seaters",
    description: cleanLocalized(data.description),
    featuredImage: data.featuredImage || null,
    images: (data.images ?? [])
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim()),
    includedServices: data.includedServices,
    isActive: data.isActive ?? 1,
    pricingPackages: (data.pricingPackages ?? []).map(
      (p, index): PricingPackageInput => ({
        name: cleanLocalized(p.name),
        type: p.type,
        durationHours: p.durationHours || null,
        coveredAreas: (p.coveredAreas ?? [])
          .map((a) => a.trim())
          .filter((a) => a.length > 0),
        price: p.price,
        currency: p.currency,
        sortOrder: index,
      })
    ),
    extraCharges: (data.extraCharges ?? []).map(
      (e, index): ExtraChargeInput => ({
        name: cleanLocalized(e.name),
        type: e.type,
        price: e.price,
        currency: e.currency,
        unit: e.unit || null,
        sortOrder: index,
      })
    ),
  };
}

function requireValidSlug(slug: string): string | null {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? null : "Slug tidak valid.";
}

export async function createTransportProductAction(
  input: ParsedInput
): Promise<TransportActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = transportFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(localizedTransportTitle(data));
  const slugError = requireValidSlug(slug);
  if (slugError) return { success: false, message: slugError };

  if (await getTransportProductByCode(data.code)) {
    return { success: false, message: `Kode "${data.code}" sudah dipakai.` };
  }
  if (await getTransportProductBySlug(slug, false)) {
    return { success: false, message: `Slug "${slug}" sudah dipakai.` };
  }

  const product = await createTransportProduct({
    ...toRepoInput(data),
    slug,
  });
  return { success: true, id: product.id };
}

export async function updateTransportProductAction(
  id: number,
  input: ParsedInput
): Promise<TransportActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID produk tidak valid." };
  }

  const parsed = transportFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  const existing = await getTransportProductById(id);
  if (!existing) return { success: false, message: "Produk tidak ditemukan." };

  const data = parsed.data;
  const slug = data.slug?.trim() || slugify(localizedTransportTitle(data));
  const slugError = requireValidSlug(slug);
  if (slugError) return { success: false, message: slugError };

  const byCode = await getTransportProductByCode(data.code);
  if (byCode && byCode.id !== id) {
    return { success: false, message: `Kode "${data.code}" sudah dipakai.` };
  }
  const bySlug = await getTransportProductBySlug(slug, false);
  if (bySlug && bySlug.id !== id) {
    return { success: false, message: `Slug "${slug}" sudah dipakai.` };
  }

  const updated = await updateTransportProduct(id, {
    ...toRepoInput(data),
    slug,
  });
  if (!updated) return { success: false, message: "Produk tidak ditemukan." };

  return { success: true, id: updated.id };
}

export type ToggleTransportResult =
  | { success: true }
  | { success: false; message: string };

export async function toggleTransportProductActiveAction(
  id: number
): Promise<ToggleTransportResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID produk tidak valid." };
  }

  const updated = await toggleTransportProductActive(id);
  if (!updated) return { success: false, message: "Produk tidak ditemukan." };

  return { success: true };
}

export async function deleteTransportProductAction(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID produk tidak valid." };
  }

  const deleted = await deleteTransportProduct(id);
  if (!deleted) return { success: false, message: "Produk tidak ditemukan." };

  return { success: true };
}
