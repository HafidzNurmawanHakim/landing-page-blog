"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getAdminByEmail } from "@/lib/db/repositories/admins";
import { verifyPassword } from "@/lib/auth/password";
import {
  createSession,
  destroySession,
  requireAdmin,
} from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  isBookingStatus,
  updateBookingStatusRecord,
} from "@/lib/db/repositories/bookings";
import type { BookingStatus } from "@/lib/db/repositories/bookings";

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.string(),
  adminNotes: z.string().max(2000).optional(),
});

export async function loginAdmin(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const ip = await getClientIp();
  const limit = checkRateLimit(`admin-login:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return {
      success: false,
      message: `Terlalu banyak percobaan. Coba lagi dalam ${limit.retryAfterSeconds} detik.`,
    };
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid",
    };
  }

  const { email, password } = parsed.data;

  // Generic error to avoid leaking which field was wrong (and user enumeration).
  const failMessage = "Email atau password salah.";
  const admin = await getAdminByEmail(email);
  if (!admin) return { success: false, message: failMessage };

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return { success: false, message: failMessage };

  await createSession(admin.email, admin.name);
  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export type UpdateStatusResult =
  | { success: true; status: BookingStatus }
  | { success: false; message: string };

export async function updateBookingStatus(input: {
  id: number;
  status: string;
  adminNotes?: string;
}): Promise<UpdateStatusResult> {
  const session = await requireAdmin();
  if (!session) {
    redirect("/admin/login");
  }

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "Input tidak valid." };
  }

  const { id, status, adminNotes } = parsed.data;

  // Docs/04-user-flow.md: confirmed -> cancelled requires admin notes.
  if (status === "cancelled" && !adminNotes?.trim()) {
    return {
      success: false,
      message: "Wajib mengisi catatan saat membatalkan booking.",
    };
  }

  if (!isBookingStatus(status)) {
    return { success: false, message: "Status tidak valid." };
  }

  const updated = await updateBookingStatusRecord(id, status, adminNotes);
  if (!updated) {
    return { success: false, message: "Booking tidak ditemukan." };
  }

  return { success: true, status: updated.status as BookingStatus };
}
