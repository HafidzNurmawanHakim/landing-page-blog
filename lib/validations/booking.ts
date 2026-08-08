import { z } from "zod";

export const bookingBaseSchema = z.object({
  packageCode: z.string().min(1, "Kode paket wajib"),
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

export type BookingInput = z.infer<typeof bookingSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;
