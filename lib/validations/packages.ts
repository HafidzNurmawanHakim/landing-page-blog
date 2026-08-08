import { z } from "zod";
import { LOCALES } from "@/lib/i18n/locales";

export const PACKAGE_CATEGORIES = ["tour", "transport", "hotel"] as const;

/**
 * Per-locale content fields (docs/06-i18n.md). Every locale is optional;
 * `name.id` is required so there is always a resolvable default.
 */
const localeText = (max: number) =>
  z.object({
    id: z.string().trim().max(max).optional(),
    ms: z.string().trim().max(max).optional(),
    en: z.string().trim().max(max).optional(),
    zh: z.string().trim().max(max).optional(),
  });

const localeList = z.object({
  id: z.array(z.string()).max(50).optional(),
  ms: z.array(z.string()).max(50).optional(),
  en: z.array(z.string()).max(50).optional(),
  zh: z.array(z.string()).max(50).optional(),
});

export const packageFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter")
    .max(50, "Kode maksimal 50 karakter"),
  name: z.object({
    id: z
      .string()
      .trim()
      .min(3, "Nama (ID) minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    ms: z.string().trim().max(100).optional(),
    en: z.string().trim().max(100).optional(),
    zh: z.string().trim().max(100).optional(),
  }),
  slug: z
    .string()
    .trim()
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya huruf kecil, angka, dan tanda strip"
    )
    .optional()
    .or(z.literal("")),
  category: z.enum(PACKAGE_CATEGORIES),
  duration: z.string().trim().max(20).optional().or(z.literal("")),
  price: z.coerce
    .number()
    .int("Harga harus angka bulat")
    .positive("Harga harus lebih dari 0"),
  description: localeText(2000).optional(),
  imageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || /^https?:\/\//.test(v), "URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  imageAlt: localeText(200).optional(),
  itinerary: localeList.optional(),
  includes: localeList.optional(),
  excludes: localeList.optional(),
  isActive: z.coerce.number().int().min(0).max(1).optional(),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;

/** Pick the first non-empty localized value, preferring the default locale. */
export function localizedName(values: Pick<PackageFormValues, "name">): string {
  for (const code of [LOCALES[0], ...LOCALES] as const) {
    const value = values.name[code];
    if (value && value.trim()) return value;
  }
  return "";
}
