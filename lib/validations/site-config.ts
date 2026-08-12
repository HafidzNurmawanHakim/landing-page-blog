import { z } from "zod";

const localeField = z.object({
  id: z.string().trim().max(300).optional(),
  ms: z.string().trim().max(300).optional(),
  en: z.string().trim().max(300).optional(),
  zh: z.string().trim().max(300).optional(),
});

const socialItemSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label sosial media wajib diisi")
    .max(40, "Label maksimal 40 karakter"),
  href: z
    .string()
    .trim()
    .min(1, "URL wajib diisi")
    .max(500, "URL maksimal 500 karakter")
    .refine((v) => /^https?:\/\//.test(v), "URL harus dimulai http(s)://"),
});

const whatsappItemSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Label WhatsApp wajib diisi")
    .max(40, "Label maksimal 40 karakter"),
  number: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi")
    .max(20, "Maksimal 20 karakter")
    .regex(/^\d+$/, "Nomor WhatsApp hanya angka (kode negara tanpa +)"),
});

export const siteConfigSchema = z.object({
  contactPhone: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi")
    .max(40, "Maksimal 40 karakter"),
  contactPhoneDisplay: z
    .string()
    .trim()
    .min(1, "Tampilan nomor wajib diisi")
    .max(60, "Maksimal 60 karakter"),
  contactEmail: z
    .string()
    .trim()
    .email("Email kontak tidak valid")
    .max(200, "Maksimal 200 karakter"),
  whatsappNumbers: z
    .array(whatsappItemSchema)
    .min(1, "Minimal 1 nomor WhatsApp")
    .max(5, "Maksimal 5 nomor WhatsApp"),
  adminEmail: z
    .string()
    .trim()
    .email("Email admin tidak valid")
    .max(200, "Maksimal 200 karakter"),
  address: localeField,
  hoursWeekday: localeField,
  hoursTime: localeField,
  social: z.array(socialItemSchema).max(10, "Maksimal 10 sosial media"),
});

export type SiteConfigFormValues = z.infer<typeof siteConfigSchema>;
