import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { siteConfigTable, type SiteConfigSocialLink } from "../schema";
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
  contactPhone?: string | null;
  contactPhoneDisplay?: string | null;
  contactEmail?: string | null;
  whatsappNumber?: string | null;
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

export async function upsertSiteConfig(
  data: SiteConfigInput
): Promise<SiteConfigRow> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const existing = await getSiteConfigRow();

  const values = {
    contactPhone: toNull(data.contactPhone),
    contactPhoneDisplay: toNull(data.contactPhoneDisplay),
    contactEmail: toNull(data.contactEmail),
    whatsappNumber: toNull(data.whatsappNumber),
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
