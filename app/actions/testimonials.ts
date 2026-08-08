"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonialById,
  updateTestimonial,
} from "@/lib/db/repositories/testimonials";
import { testimonialSchema } from "@/lib/validations/testimonials";
import type { Locale, LocalizedString } from "@/lib/i18n/locales";

export type TestimonialActionResult =
  | { success: true; id: number }
  | { success: false; message: string };

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

function toDbInput(
  data: z.output<typeof testimonialSchema>
): Parameters<typeof createTestimonial>[0] {
  return {
    name: data.name,
    role: cleanLocalized(data.role),
    comment: cleanLocalized(data.comment),
    rating: data.rating,
    avatarUrl: data.avatarUrl || null,
    isActive: data.isActive === false ? 0 : 1,
    sortOrder: data.sortOrder ?? 0,
  };
}

const idSchema = z.coerce.number().int().positive();

export async function createTestimonialAction(
  input: z.input<typeof testimonialSchema>
): Promise<TestimonialActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    const item = await createTestimonial(toDbInput(parsed.data));
    return { success: true, id: item.id };
  } catch (err) {
    console.error("createTestimonialAction failed:", err);
    return {
      success: false,
      message: "Gagal menyimpan testimoni. Coba lagi.",
    };
  }
}

export async function updateTestimonialAction(
  id: number,
  input: z.input<typeof testimonialSchema>
): Promise<TestimonialActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID testimoni tidak valid." };
  }

  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    const existing = await getTestimonialById(id);
    if (!existing) {
      return { success: false, message: "Testimoni tidak ditemukan." };
    }

    const updated = await updateTestimonial(id, toDbInput(parsed.data));
    if (!updated) {
      return { success: false, message: "Testimoni tidak ditemukan." };
    }

    return { success: true, id: updated.id };
  } catch (err) {
    console.error("updateTestimonialAction failed:", err);
    return {
      success: false,
      message: "Gagal menyimpan testimoni. Coba lagi.",
    };
  }
}

export async function deleteTestimonialAction(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID testimoni tidak valid." };
  }

  try {
    const deleted = await deleteTestimonial(id);
    if (!deleted) {
      return { success: false, message: "Testimoni tidak ditemukan." };
    }
    return { success: true };
  } catch (err) {
    console.error("deleteTestimonialAction failed:", err);
    return {
      success: false,
      message: "Gagal menghapus testimoni. Coba lagi.",
    };
  }
}
