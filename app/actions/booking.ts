"use server";

import { after } from "next/server";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { getPackageByCode } from "@/lib/db/repositories/packages";
import {
  createBookingRecord,
  getBookingByCode,
} from "@/lib/db/repositories/bookings";
import { generateUniqueBookingCode } from "@/lib/services/booking-code";
import { dispatchBookingNotifications } from "@/lib/services/notifications";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

export type CreateBookingResult =
  | { success: true; bookingCode: string }
  | { success: false; status: 422; errors: { field: string; message: string }[] }
  | { success: false; status: number; message: string };

const DB_ERROR_MESSAGES: Record<string, string> = {
  // SQLITE / D1 error codes surfaced to the customer
  SQLITE_CONSTRAINT_UNIQUE: "Kode booking sudah terpakai, coba lagi.",
  SQLITE_BUSY: "Sistem sedang sibuk, coba beberapa saat lagi.",
};

export async function createBooking(
  input: BookingInput
): Promise<CreateBookingResult> {
  // 1. Rate limiting per IP (docs/09-non-functional.md: spam protection)
  const ip = await getClientIp();
  const limit = checkRateLimit(`booking:${ip}`);
  if (!limit.ok) {
    return {
      success: false,
      status: 429,
      message: `Terlalu banyak permintaan. Coba lagi dalam ${limit.retryAfterSeconds} detik.`,
    };
  }

  // 2. Server-side validation (never trust the client)
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      status: 422,
      errors: parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? "form"),
        message: issue.message,
      })),
    };
  }

  const data = parsed.data;

  // 3. Verify the package exists & is active
  const pkg = await getPackageByCode(data.packageCode);
  if (!pkg || pkg.isActive !== 1) {
    return {
      success: false,
      status: 404,
      message: "Paket tidak ditemukan atau tidak aktif.",
    };
  }

  // 4. Persist booking (status pending)
  let bookingCode: string;
  try {
    bookingCode = await generateUniqueBookingCode();
    await createBookingRecord({
      bookingCode,
      packageCode: pkg.code,
      packageName: pkg.name,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || undefined,
      departureDate: data.departureDate,
      returnDate: data.returnDate,
      participants: data.participants,
      notes: data.notes,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[createBooking] persist failed:", err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";
    const message = DB_ERROR_MESSAGES[code];
    if (message) {
      return { success: false, status: 409, message };
    }
    return {
      success: false,
      status: 500,
      message: "Gagal menyimpan booking. Coba lagi.",
    };
  }

  // 5. Fire notifications after the response is sent. `after()` keeps the
  //    dispatch alive in serverless runtimes; it never blocks the booking.
  //    Re-fetch the row so the notification layer has the full record.
  try {
    const saved = await getBookingByCode(bookingCode);
    if (saved) {
      after(() => dispatchBookingNotifications(saved));
    }
  } catch {
    // Notification failure must never fail the booking (docs/04-user-flow.md).
  }

  return { success: true, bookingCode };
}
