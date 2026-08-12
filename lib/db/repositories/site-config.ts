import { eq } from "drizzle-orm";
import { getDb } from "../client";
import {
  siteConfigTable,
  type SiteConfigSocialLink,
  type SiteConfigWhatsApp,
} from "../schema";
import type { LocalizedString } from "@/lib/i18n/locales";

/**
 * Single-row site config repository (admin page `/admin/config`). The row id is
 * fixed at `SITE_CONFIG_ID`; `upsertSiteConfig` inserts it on first save.
 */

export const SITE_CONFIG_ID = 1;

export type SiteConfigRow = typeof siteConfigTable.$inferSelect;

export async function getSiteConfigRow(): Promise<SiteConfigRow | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(siteConfigTable)
    .where(eq(siteConfigTable.id, SITE_CONFIG_ID))
    .limit(1);
  return rows[0] ?? null;
}

export type SiteConfigInput = {
  contactEmail?: string | null;
  whatsappNumbers?: SiteConfigWhatsApp[] | null;
  adminEmail?: string | null;
  address?: LocalizedString | null;
  hoursWeekday?: LocalizedString | null;
  hoursTime?: LocalizedString | null;
  social?: SiteConfigSocialLink[] | null;
};

function toNull(value: string | null | undefined): string | null {
  const v = value?.trim();
  return v ? v : null;
}

/**
 * The `whatsapp_number` column stores the list of WhatsApp contacts as JSON.
 * Legacy rows may still hold a single plain number; `parseWhatsAppNumbers` in
 * the service layer handles that fallback.
 */
function toWhatsAppNumbers(value: SiteConfigWhatsApp[] | null | undefined): string | null {
  const list = Array.isArray(value)
    ? value.filter((w) => w && w.number && w.number.trim())
    : [];
  if (list.length === 0) return null;
  return JSON.stringify(
    list.map((w) => ({
      label: w.label?.trim() ?? "",
      number: w.number.trim(),
      ...(w.isDefault ? { isDefault: true } : {}),
    }))
  );
}

export async function upsertSiteConfig(
  data: SiteConfigInput
): Promise<SiteConfigRow> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const existing = await getSiteConfigRow();

  const values = {
    contactEmail: toNull(data.contactEmail),
    whatsappNumber: toWhatsAppNumbers(data.whatsappNumbers),
    adminEmail: toNull(data.adminEmail),
    address: data.address ?? null,
    hoursWeekday: data.hoursWeekday ?? null,
    hoursTime: data.hoursTime ?? null,
    social: data.social ?? null,
    updatedAt: now,
  };

  if (!existing) {
    const rows = await db
      .insert(siteConfigTable)
      .values({ id: SITE_CONFIG_ID, ...values })
      .returning();
    return rows[0];
  }

  const rows = await db
    .update(siteConfigTable)
    .set(values)
    .where(eq(siteConfigTable.id, SITE_CONFIG_ID))
    .returning();
  return rows[0];
}
