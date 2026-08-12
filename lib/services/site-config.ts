import {
  siteConfig as defaults,
  type LocalizedText,
} from "@/lib/config/site";
import type { SiteConfigWhatsApp } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getSiteConfigRow } from "@/lib/db/repositories/site-config";
import type { LocalizedString, Locale } from "@/lib/i18n/locales";

/**
 * Runtime site configuration (admin page `/admin/config`).
 *
 * DB row (`site_config`, editable in admin `/admin/config`) is the source of
 * truth; empty cells fall back to the static defaults in `lib/config/site.ts`.
 * Public consumers must use `getPublicSiteConfig()` (never exposes the admin
 * notification email).
 */

export type ResolvedSiteConfig = {
  contact: {
    phone: string;
    phoneDisplay: string;
    email: string;
    address: LocalizedText;
    hours: {
      weekday: LocalizedText;
      time: LocalizedText;
    };
  };
  whatsappNumbers: SiteConfigWhatsApp[];
  adminEmail: string;
  social: { label: string; href: string }[];
};

export type PublicSiteConfig = Omit<ResolvedSiteConfig, "adminEmail">;

function pick(value: string | null | undefined, fallback: string): string {
  const v = value?.trim();
  return v ? v : fallback;
}

function pickLocalized(
  value: LocalizedString | null | undefined,
  fallback: LocalizedText
): LocalizedText {
  const out: LocalizedText = { ...fallback };
  if (!value) return out;
  for (const key of Object.keys(value) as Locale[]) {
    const v = value[key];
    if (v && v.trim()) out[key] = v.trim();
  }
  return out;
}

/**
 * Parses the `whatsapp_number` column, which stores a JSON array of
 * `{ label, number }`. Legacy rows (single plain number, pre-multi-number
 * config) fall back to one entry with the default label.
 */
function parseWhatsAppNumbers(
  raw: string | null | undefined
): SiteConfigWhatsApp[] {
  const value = raw?.trim();
  if (value) {
    if (value.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const list = parsed
            .filter(
              (w): w is Record<string, unknown> =>
                !!w &&
                typeof w === "object" &&
                typeof (w as Record<string, unknown>).number === "string" &&
                ((w as Record<string, unknown>).number as string).trim().length >
                  0
            )
            .map((w) => ({
              label:
                typeof w.label === "string" && w.label.trim()
                  ? w.label.trim()
                  : "",
              number: (w.number as string).trim(),
            }));
          if (list.length > 0) return list;
        }
      } catch {
        // Fall through to defaults below.
      }
    } else {
      return [
        {
          label: defaults.whatsapp.numbers[0]?.label ?? "",
          number: value,
        },
      ];
    }
  }
  return defaults.whatsapp.numbers.map((w) => ({ ...w }));
}

export async function getSiteConfig(): Promise<ResolvedSiteConfig> {
  const row = await getSiteConfigRow();

  const social =
    row?.social !== null && row?.social !== undefined && row.social.length > 0
      ? row.social.map((s) => ({ label: s.label, href: s.href }))
      : defaults.social.map((s) => ({ label: s.label, href: s.href }));

  return {
    contact: {
      phone: pick(row?.contactPhone, defaults.contact.phone),
      phoneDisplay: pick(row?.contactPhoneDisplay, defaults.contact.phoneDisplay),
      email: pick(row?.contactEmail, defaults.contact.email),
      address: pickLocalized(row?.address, defaults.contact.address),
      hours: {
        weekday: pickLocalized(row?.hoursWeekday, defaults.contact.hours.weekday),
        time: pickLocalized(row?.hoursTime, defaults.contact.hours.time),
      },
    },
    whatsappNumbers: parseWhatsAppNumbers(row?.whatsappNumber),
    adminEmail: pick(row?.adminEmail, env.ADMIN_EMAIL),
    social,
  };
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const { adminEmail: _adminEmail, ...rest } = await getSiteConfig();
  return rest;
}
