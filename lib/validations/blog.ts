import { z } from "zod";
import { LOCALES, type LocalizedString } from "@/lib/i18n/locales";

export const BLOG_POST_STATUSES = ["draft", "published", "archived"] as const;

const urlOrEmpty = z
  .string()
  .trim()
  .max(2000, "URL maksimal 2000 karakter")
  .refine((v) => v === "" || /^https?:\/\//.test(v), "URL tidak valid. Gunakan http(s)://");

const slugField = z
  .string()
  .trim()
  .min(1, "Slug wajib diisi")
  .max(160, "Slug maksimal 160 karakter")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug hanya huruf kecil, angka, dan tanda hubung (contoh: cara-booking-tour)"
  );

/**
 * Per-locale content fields (docs/06-i18n.md). Every locale is optional;
 * `id` is required so there is always a resolvable default.
 */
const localeText = (max: number) =>
  z.object({
    id: z.string().trim().max(max).optional(),
    ms: z.string().trim().max(max).optional(),
    en: z.string().trim().max(max).optional(),
    zh: z.string().trim().max(max).optional(),
  });

const localeTitle = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Judul wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  ms: z.string().trim().max(200).optional(),
  en: z.string().trim().max(200).optional(),
  zh: z.string().trim().max(200).optional(),
});

const localeContent = z.object({
  id: z.string().min(1, "Konten artikel wajib diisi"),
  ms: z.string().optional(),
  en: z.string().optional(),
  zh: z.string().optional(),
});

export const blogPostSchema = z.object({
  title: localeTitle,
  slug: slugField,
  excerpt: localeText(300).optional(),
  content: localeContent,
  contentType: z.enum(["html", "markdown"]),
  featuredImageUrl: urlOrEmpty.optional(),
  featuredImageAlt: localeText(200).optional(),
  categoryId: z.coerce.number().int().positive().nullish(),
  tags: z
    .array(z.string().trim().max(40))
    .max(10, "Maksimal 10 tag")
    .optional(),
  status: z.enum(BLOG_POST_STATUSES),
  seoTitle: localeText(60).optional(),
  seoDescription: localeText(160).optional(),
  ogImageUrl: urlOrEmpty.optional(),
  canonicalUrl: urlOrEmpty.optional(),
  noindex: z.boolean().optional(),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export const blogCategorySchema = z.object({
  name: z.object({
    id: z
      .string()
      .trim()
      .min(1, "Nama kategori wajib diisi")
      .max(120, "Nama kategori maksimal 120 karakter"),
    ms: z.string().trim().max(120).optional(),
    en: z.string().trim().max(120).optional(),
    zh: z.string().trim().max(120).optional(),
  }),
  slug: slugField,
  description: localeText(300).optional(),
});

export type BlogCategoryFormValues = z.infer<typeof blogCategorySchema>;

/** Pick the first non-empty localized value, preferring the default locale. */
export function localizedFirst(
  value: LocalizedString | string | null | undefined
): string {
  if (typeof value === "string") return value;
  if (!value) return "";
  for (const code of [LOCALES[0], ...LOCALES] as const) {
    const candidate = value[code];
    if (candidate && candidate.trim()) return candidate;
  }
  return "";
}
