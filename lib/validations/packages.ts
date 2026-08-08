import { z } from "zod";

export const PACKAGE_CATEGORIES = ["tour", "transport", "hotel"] as const;

export const packageFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter")
    .max(50, "Kode maksimal 50 karakter"),
  name: z
    .string()
    .trim()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
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
  description: z.string().max(2000).optional().or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || /^https?:\/\//.test(v), "URL gambar tidak valid")
    .optional()
    .or(z.literal("")),
  imageAlt: z.string().trim().max(200).optional().or(z.literal("")),
  itinerary: z.array(z.string().trim()).max(50).optional(),
  includes: z.array(z.string().trim()).max(50).optional(),
  excludes: z.array(z.string().trim()).max(50).optional(),
  isActive: z.coerce.number().int().min(0).max(1).optional(),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;
