import { z } from "zod";

const localeCaption = z.object({
  id: z.string().trim().max(500).optional(),
  ms: z.string().trim().max(500).optional(),
  en: z.string().trim().max(500).optional(),
  zh: z.string().trim().max(500).optional(),
});

export const galleryItemSchema = z.object({
  imageUrl: z
    .string()
    .trim()
    .min(1, "Gambar wajib diisi")
    .max(1000, "URL gambar maksimal 1000 karakter")
    .refine(
      (v) => /^https?:\/\//.test(v),
      "URL gambar tidak valid"
    ),
  caption: localeCaption,
});

export type GalleryItemFormValues = z.infer<typeof galleryItemSchema>;
