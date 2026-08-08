import { z } from "zod";
import {
  CURRENCIES,
  EXTRA_CHARGE_TYPES,
  PRICING_PACKAGE_TYPES,
  TRANSPORT_CATEGORIES,
  TRANSPORT_SERVICE_TYPES,
} from "@/lib/db/schema";

const localeText = (max: number) =>
  z.object({
    id: z.string().trim().max(max).optional(),
    ms: z.string().trim().max(max).optional(),
    en: z.string().trim().max(max).optional(),
    zh: z.string().trim().max(max).optional(),
  });

const urlField = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^https?:\/\//.test(v), "URL gambar tidak valid")
  .optional()
  .or(z.literal(""));

/** Shared price fields for pricing packages and extra charges. */
const priceFields = {
  price: z.coerce
    .number()
    .int("Harga harus angka bulat")
    .positive("Harga harus lebih dari 0"),
  currency: z.enum(CURRENCIES),
};

export const transportPricingPackageSchema = z
  .object({
    name: localeText(100),
    type: z.enum(PRICING_PACKAGE_TYPES),
    durationHours: z.coerce
      .number()
      .int()
      .min(1, "Durasi minimal 1 jam")
      .max(168)
      .nullable()
      .optional(),
    coveredAreas: z.array(z.string().trim().max(100)).max(50).optional(),
    ...priceFields,
  })
  .refine(
    (p) => p.type !== "HOURLY" || (p.durationHours ?? 0) > 0,
    {
      message: "Durasi (jam) wajib diisi untuk paket per jam (HOURLY)",
      path: ["durationHours"],
    }
  );

export const transportExtraChargeSchema = z.object({
  name: localeText(100),
  type: z.enum(EXTRA_CHARGE_TYPES),
  unit: z.string().trim().max(50).optional().or(z.literal("")),
  ...priceFields,
});

export const transportFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Kode minimal 2 karakter")
    .max(50, "Kode maksimal 50 karakter"),
  title: z.object({
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
  category: z.enum(TRANSPORT_CATEGORIES),
  capacity: z.coerce
    .number()
    .int("Kapasitas harus angka bulat")
    .min(1, "Kapasitas minimal 1")
    .max(200, "Kapasitas maksimal 200"),
  capacityUnit: z.string().trim().max(50).optional().or(z.literal("")),
  description: localeText(2000).optional(),
  featuredImage: urlField,
  images: z.array(urlField).max(12, "Maksimal 12 gambar").optional(),
  includedServices: z
    .array(z.enum(TRANSPORT_SERVICE_TYPES))
    .min(1, "Pilih minimal satu layanan (driver/guide/self-drive)"),
  pricingPackages: z
    .array(transportPricingPackageSchema)
    .min(1, "Minimal satu paket harga wajib diisi"),
  extraCharges: z.array(transportExtraChargeSchema).optional(),
  isActive: z.coerce.number().int().min(0).max(1).optional(),
});

export type TransportFormValues = z.infer<typeof transportFormSchema>;
export type TransportPricingPackageFormValues = z.infer<
  typeof transportPricingPackageSchema
>;
export type TransportExtraChargeFormValues = z.infer<
  typeof transportExtraChargeSchema
>;

/** Pick the first non-empty localized value, preferring the default locale. */
export function localizedTransportTitle(
  values: Pick<TransportFormValues, "title">
): string {
  const order = ["id", "ms", "en", "zh"] as const;
  for (const code of order) {
    const value = values.title[code];
    if (value && value.trim()) return value;
  }
  return "";
}
