import { z } from "zod";
import { LOCALES } from "@/lib/i18n/locales";

/**
 * Type-specific options for transport bookings (docs/15-transport-product.md
 * §15.6). Referential checks (package belongs to product, prices, totals) are
 * done in the server action against the DB, not just this shape.
 */
export const transportBookingOptionsSchema = z.object({
  pricingPackageId: z.number().int().positive("Paket harga tidak valid"),
  extraChargeIds: z.array(z.number().int().positive()).max(20).default([]),
  vehicleQty: z.number().int().min(1, "Minimal 1 kendaraan").max(20),
  pickupDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  pickupTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:MM"),
  pickupLocation: z
    .string()
    .trim()
    .min(2, "Lokasi penjemputan wajib diisi")
    .max(200),
  dropoffLocation: z.string().trim().max(200).optional().or(z.literal("")),
});

export const bookingBaseSchema = z.object({
  packageCode: z.string().min(1, "Kode paket wajib"),
  locale: z.enum(LOCALES).optional(),
  itemType: z.enum(["tour", "transport", "hotel"]).optional().default("tour"),
  bookingOptions: transportBookingOptionsSchema.optional(),
  customerName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().regex(/^[0-9+]{9,15}$/, "Nomor HP tidak valid"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  participants: z.number().int().min(1).max(50),
  notes: z.string().max(1000).optional(),
});

export const bookingSchema = bookingBaseSchema.refine(
  (d) => !d.returnDate || d.returnDate >= d.departureDate,
  {
    message: "Tanggal pulang tidak boleh sebelum tanggal berangkat",
    path: ["returnDate"],
  }
);

export const bookingFormSchema = bookingBaseSchema
  .omit({ packageCode: true })
  .refine((d) => d.returnDate >= d.departureDate, {
    message: "Tanggal pulang tidak boleh sebelum tanggal berangkat",
    path: ["returnDate"],
  });

/** Client-side form schema for the transport booking dialog. */
export const transportBookingFormSchema = z.object({
  customerName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().regex(/^[0-9+]{9,15}$/, "Nomor HP tidak valid"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  pickupDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  pickupTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:MM"),
  pickupLocation: z
    .string()
    .trim()
    .min(2, "Lokasi penjemputan wajib diisi")
    .max(200),
  dropoffLocation: z.string().trim().max(200).optional().or(z.literal("")),
  vehicleQty: z.coerce.number().int().min(1, "Minimal 1 kendaraan").max(20),
  notes: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
export type TransportBookingFormValues = z.infer<
  typeof transportBookingFormSchema
>;
export type TransportBookingOptionsInput = z.infer<
  typeof transportBookingOptionsSchema
>;
