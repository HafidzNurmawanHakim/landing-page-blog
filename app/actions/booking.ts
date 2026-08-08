"use server";

import { after } from "next/server";
import { bookingSchema, type BookingInput } from "@/lib/validations/booking";
import { getPackageByCode } from "@/lib/db/repositories/packages";
import { getTransportProductByCode } from "@/lib/db/repositories/transport";
import {
  createBookingRecord,
  getBookingByCode,
} from "@/lib/db/repositories/bookings";
import { generateUniqueBookingCode } from "@/lib/services/booking-code";
import { dispatchBookingNotifications } from "@/lib/services/notifications";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import {
  DEFAULT_LOCALE,
  pickLocale,
  type Locale,
} from "@/lib/i18n/locales";
import type { BookingOptions } from "@/lib/db/schema";

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
  const limit = await checkRateLimit(`booking:${ip}`);
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
  const locale: Locale = data.locale ?? DEFAULT_LOCALE;

  // 3. Resolve the item being booked (package vs transport product) and the
  //    denormalized booking payload (docs/15-transport-product.md §15.6).
  let itemType: "tour" | "transport" | "hotel" = "tour";
  let itemCode: string;
  let itemName: string;
  let bookingOptions: BookingOptions | null = null;

  if (data.itemType === "transport") {
    const product = await getTransportProductByCode(data.packageCode);
    if (!product || product.isActive !== 1) {
      return {
        success: false,
        status: 404,
        message: "Produk transport tidak ditemukan atau tidak aktif.",
      };
    }
    const options = data.bookingOptions;
    if (!options) {
      return {
        success: false,
        status: 422,
        errors: [{ field: "bookingOptions", message: "Opsi booking tidak lengkap." }],
      };
    }

    const pricingPackage = product.pricingPackages.find(
      (p) => p.id === options.pricingPackageId
    );
    if (!pricingPackage) {
      return {
        success: false,
        status: 422,
        errors: [{ field: "pricingPackageId", message: "Paket harga tidak valid." }],
      };
    }

    const selectedExtras = product.extraCharges.filter((e) =>
      options.extraChargeIds.includes(e.id)
    );
    const extraTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);

    itemType = "transport";
    itemCode = product.code;
    itemName = pickLocale(product.title, locale);
    bookingOptions = {
      pricingPackageId: pricingPackage.id,
      pricingPackageName: pickLocale(pricingPackage.name, locale),
      price: pricingPackage.price,
      currency: pricingPackage.currency as BookingOptions["currency"],
      extraCharges: selectedExtras.map((e) => ({
        id: e.id,
        name: pickLocale(e.name, locale),
        price: e.price,
        currency: e.currency as BookingOptions["currency"],
        unit: e.unit ?? undefined,
      })),
      extraTotal,
      vehicleQty: options.vehicleQty,
      pickupLocation: options.pickupLocation.trim(),
      pickupDate: options.pickupDate,
      pickupTime: options.pickupTime,
      dropoffLocation: options.dropoffLocation?.trim() || undefined,
    };
  } else {
    const pkg = await getPackageByCode(data.packageCode);
    if (!pkg || pkg.isActive !== 1) {
      return {
        success: false,
        status: 404,
        message: "Paket tidak ditemukan atau tidak aktif.",
      };
    }
    itemType = data.itemType === "hotel" ? "hotel" : "tour";
    itemCode = pkg.code;
    itemName = pickLocale(pkg.name, locale);
  }

  // 4. Persist booking (status pending)
  let bookingCode: string;
  try {
    const departureDate =
      itemType === "transport"
        ? (bookingOptions as NonNullable<BookingOptions>).pickupDate
        : data.departureDate;
    const returnDate =
      itemType === "transport"
        ? departureDate
        : data.returnDate;

    bookingCode = await generateUniqueBookingCode();
    await createBookingRecord({
      bookingCode,
      packageCode: itemCode,
      packageName: itemName,
      itemType,
      bookingOptions,
      locale,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email || undefined,
      departureDate,
      returnDate,
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
