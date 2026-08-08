import { env } from "../env";
import type { Booking } from "../db/schema";

/**
 * Notification service. Design contract (docs/07-notifications.md):
 *
 * - Never throws into the booking pipeline. All providers are best-effort.
 * - Failures are logged; the booking itself is never rolled back because a
 *   notification failed (docs/04-user-flow.md).
 * - In local development without API keys configured, notifications are logged
 *   as "skipped" so the flow stays testable end-to-end.
 */

type SendResult = { ok: true; provider: string } | { ok: false; error: string };

function logSkipped(kind: string, reason: string): void {
  // eslint-disable-next-line no-console
  console.info(`[notif] ${kind} skipped: ${reason}`);
}

function logError(kind: string, err: unknown): void {
  // eslint-disable-next-line no-console
  console.error(
    `[notif] ${kind} failed:`,
    err instanceof Error ? err.message : err,
  );
}

export async function sendWhatsAppToAdmin(
  booking: Booking,
): Promise<SendResult> {
  const apiKey = env.WHATSAPP_API_KEY;
  const adminNumber = env.WHATSAPP_ADMIN_NUMBER;

  if (!apiKey || !adminNumber) {
    logSkipped("whatsapp", "WHATSAPP_API_KEY / WHATSAPP_ADMIN_NUMBER not set");
    return { ok: false, error: "not configured" };
  }

  const message = buildWhatsAppTemplate(booking);

  try {
    // Provider-agnostic: plug in Wati / AiSensy / Interakt endpoint here.
    // Kept as a clearly marked integration point; does not block booking.
    const res = await fetch("https://api.whatsapp.com/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: adminNumber,
        text: message,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`WhatsApp API responded ${res.status}`);
    }
    return { ok: true, provider: "whatsapp" };
  } catch (err) {
    logError("whatsapp", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function sendBookingEmail(booking: Booking): Promise<SendResult> {
  if (!booking.email) {
    logSkipped("email", "customer email not provided");
    return { ok: false, error: "no email" };
  }
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    logSkipped("email", "RESEND_API_KEY not set");
    return { ok: false, error: "not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [booking.email],
        subject: `Konfirmasi Booking - ${booking.bookingCode}`,
        html: buildEmailTemplate(booking),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      throw new Error(`Resend API responded ${res.status}`);
    }
    return { ok: true, provider: "resend" };
  } catch (err) {
    logError("email", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

/**
 * Fires both notifications. Call this inside `after()` (Next.js) or another
 * background context so it is not killed when the request ends in serverless.
 * Booking pipeline must NOT await this.
 */
export async function dispatchBookingNotifications(booking: Booking): Promise<void> {
  await Promise.allSettled([sendWhatsAppToAdmin(booking), sendBookingEmail(booking)]);
}

function buildWhatsAppTemplate(booking: Booking): string {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const adminLink = `${siteUrl}/admin/bookings/${booking.id}`;

  return [
    "🚨 BOOKING BARU",
    "",
    `Kode: ${booking.bookingCode}`,
    `Paket: ${booking.packageName}`,
    `Nama: ${booking.customerName}`,
    `HP: ${booking.phone}`,
    `Tanggal: ${booking.departureDate} → ${booking.returnDate}`,
    `Peserta: ${booking.participants} orang`,
    ...(booking.notes ? [`Catatan: ${booking.notes}`] : []),
    "",
    `Lihat detail: ${adminLink}`,
  ].join("\n");
}

function buildEmailTemplate(booking: Booking): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px;">
      <h2 style="margin: 0 0 16px;">Konfirmasi Booking</h2>
      <p>Halo <strong>${escapeHtml(booking.customerName)}</strong>,</p>
      <p>Kami sudah menerima booking kamu dengan detail berikut:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 6px 0;">Nomor Booking</td><td><strong>${booking.bookingCode}</strong></td></tr>
        <tr><td style="padding: 6px 0;">Paket</td><td>${escapeHtml(booking.packageName)}</td></tr>
        <tr><td style="padding: 6px 0;">Tanggal Berangkat</td><td>${booking.departureDate}</td></tr>
        <tr><td style="padding: 6px 0;">Tanggal Pulang</td><td>${booking.returnDate}</td></tr>
        <tr><td style="padding: 6px 0;">Peserta</td><td>${booking.participants} orang</td></tr>
      </table>
      <p style="margin-top: 16px;">Tunggu konfirmasi admin via WhatsApp/telepon.</p>
      <p style="color: #777;">Hubungi kami: ${env.WHATSAPP_ADMIN_NUMBER || ""}</p>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
