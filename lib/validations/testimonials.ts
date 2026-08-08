import { z } from "zod";

const roleField = z.object({
  id: z.string().trim().max(120).optional(),
  ms: z.string().trim().max(120).optional(),
  en: z.string().trim().max(120).optional(),
  zh: z.string().trim().max(120).optional(),
});

const commentField = z.object({
  id: z
    .string()
    .trim()
    .min(1, "Komentar wajib diisi minimal bahasa Indonesia (ID)")
    .max(1000, "Komentar maksimal 1000 karakter"),
  ms: z.string().trim().max(1000).optional(),
  en: z.string().trim().max(1000).optional(),
  zh: z.string().trim().max(1000).optional(),
});

const urlOrEmpty = z
  .string()
  .trim()
  .max(1000, "URL avatar maksimal 1000 karakter")
  .refine((v) => v === "" || /^https?:\/\//.test(v), "URL avatar tidak valid");

export const testimonialSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(120, "Nama maksimal 120 karakter"),
  role: roleField,
  comment: commentField,
  rating: z
    .number()
    .min(0, "Rating minimal 0")
    .max(5, "Rating maksimal 5"),
  avatarUrl: urlOrEmpty,
  isActive: z.boolean().optional(),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0)
    .max(9999)
    .optional(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;
