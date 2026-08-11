"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { upsertSiteConfig } from "@/lib/db/repositories/site-config";
import { siteConfigSchema } from "@/lib/validations/site-config";
import type { Locale } from "@/lib/i18n/locales";

export type SiteConfigActionResult =
  | { success: true }
  | { success: false; message: string };

function cleanLocalized(
  obj: Record<string, string | undefined> | undefined
): Record<Locale, string> | null {
  const out: Record<Locale, string> = { id: "", ms: "", en: "", zh: "" };
  if (!obj) return null;
  for (const [key, value] of Object.entries(obj)) {
    if (value && value.trim()) out[key as Locale] = value.trim();
  }
  return out;
}

export async function updateSiteConfigAction(
  input: z.input<typeof siteConfigSchema>
): Promise<SiteConfigActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = siteConfigSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    await upsertSiteConfig({
      contactPhone: parsed.data.contactPhone,
      contactPhoneDisplay: parsed.data.contactPhoneDisplay,
      contactEmail: parsed.data.contactEmail,
      whatsappNumber: parsed.data.whatsappNumber,
      adminEmail: parsed.data.adminEmail,
      address: cleanLocalized(parsed.data.address),
      hoursWeekday: cleanLocalized(parsed.data.hoursWeekday),
      hoursTime: cleanLocalized(parsed.data.hoursTime),
      social: parsed.data.social,
    });
    return { success: true };
  } catch (err) {
    console.error("updateSiteConfigAction failed:", err);
    return {
      success: false,
      message: "Gagal menyimpan konfigurasi. Coba lagi.",
    };
  }
}
