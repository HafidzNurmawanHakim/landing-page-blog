import { env } from "../env";
import type { Booking } from "../db/schema";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

/**
 * Notification service. Design contract (docs/07-notifications.md):
 *
 * - Never throws into the booking pipeline. All providers are best-effort.
 * - Failures are logged; the booking itself is never rolled back because a
 *   notification failed (docs/04-user-flow.md).
 * - In local development without API keys configured, notifications are logged
 *   as "skipped" so the flow stays testable end-to-end.
 * - Templates follow the customer's locale (docs/06-i18n.md §6.4).
 */

type SendResult = { ok: true; provider: string } | { ok: false; error: string };

type TemplateStrings = {
  alert: string;
  code: string;
  package: string;
  name: string;
  phone: string;
  dates: string;
  participants: string;
  notes: string;
  view: string;
  subject: string;
  hello: string;
  received: string;
  bookingCode: string;
  depDate: string;
  retDate: string;
  guests: string;
  wait: string;
  contact: string;
  pickup: string;
  dropoff: string;
  time: string;
  vehicles: string;
  extras: string;
  estTotal: string;
};

const TEMPLATES: Record<Locale, TemplateStrings> = {
  id: {
    alert: "🚨 BOOKING BARU",
    code: "Kode",
    package: "Paket",
    name: "Nama",
    phone: "HP",
    dates: "Tanggal",
    participants: "Peserta",
    notes: "Catatan",
    view: "Lihat detail",
    subject: "Konfirmasi Booking",
    hello: "Halo",
    received: "Kami sudah menerima booking kamu dengan detail berikut:",
    bookingCode: "Nomor Booking",
    depDate: "Tanggal Berangkat",
    retDate: "Tanggal Pulang",
    guests: "orang",
    wait: "Tunggu konfirmasi admin via WhatsApp/telepon.",
    contact: "Hubungi kami:",
    pickup: "Jemput",
    dropoff: "Antar",
    time: "Jam",
    vehicles: "Kendaraan",
    extras: "Ekstra",
    estTotal: "Estimasi Total",
  },
  ms: {
    alert: "🚨 TEMPAHAN BARU",
    code: "Kod",
    package: "Pakej",
    name: "Nama",
    phone: "HP",
    dates: "Tarikh",
    participants: "Peserta",
    notes: "Catatan",
    view: "Lihat butiran",
    subject: "Pengesahan Tempahan",
    hello: "Halo",
    received: "Kami sudah menerima tempahan anda dengan butiran berikut:",
    bookingCode: "Nombor Tempahan",
    depDate: "Tarikh Berlepas",
    retDate: "Tarikh Pulang",
    guests: "orang",
    wait: "Tunggu pengesahan admin melalui WhatsApp/telefon.",
    contact: "Hubungi kami:",
    pickup: "Jemput",
    dropoff: "Hantar",
    time: "Masa",
    vehicles: "Kenderaan",
    extras: "Ekstra",
    estTotal: "Anggaran Jumlah",
  },
  en: {
    alert: "🚨 NEW BOOKING",
    code: "Code",
    package: "Package",
    name: "Name",
    phone: "Phone",
    dates: "Dates",
    participants: "Participants",
    notes: "Notes",
    view: "View details",
    subject: "Booking Confirmation",
    hello: "Hello",
    received: "We have received your booking with the following details:",
    bookingCode: "Booking Code",
    depDate: "Departure Date",
    retDate: "Return Date",
    guests: "people",
    wait: "Wait for admin confirmation via WhatsApp/phone.",
    contact: "Contact us:",
    pickup: "Pickup",
    dropoff: "Drop-off",
    time: "Time",
    vehicles: "Vehicles",
    extras: "Extras",
    estTotal: "Estimated Total",
  },
  zh: {
    alert: "🚨 新预订",
    code: "预订代码",
    package: "套餐",
    name: "姓名",
    phone: "电话",
    dates: "日期",
    participants: "人数",
    notes: "备注",
    view: "查看详情",
    subject: "预订确认",
    hello: "您好",
    received: "我们已收到您的预订，详细信息如下：",
    bookingCode: "预订编号",
    depDate: "出发日期",
    retDate: "返回日期",
    guests: "人",
    wait: "请等待管理员通过 WhatsApp/电话确认。",
    contact: "联系我们：",
    pickup: "接车",
    dropoff: "下车",
    time: "时间",
    vehicles: "车辆",
    extras: "附加",
    estTotal: "预计总额",
  },
};

function strings(locale?: string | null): TemplateStrings {
  const code =
    locale && locale in TEMPLATES ? (locale as Locale) : DEFAULT_LOCALE;
  return TEMPLATES[code];
}

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
    const T = strings(booking.locale);
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to: [booking.email],
        subject: `${T.subject} - ${booking.bookingCode}`,
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
 * Fires the booking confirmation email. Call this inside `after()` (Next.js) or
 * another background context so it is not killed when the request ends in
 * serverless. Booking pipeline must NOT await this.
 *
 * WhatsApp booking is handled client-side via wa.me links (see
 * `getWhatsAppLink` + booking dialogs); no server-side WhatsApp provider.
 */
export async function dispatchBookingNotifications(booking: Booking): Promise<void> {
  await sendBookingEmail(booking);
}

function buildEmailTemplate(booking: Booking): string {
  const T = strings(booking.locale);
  const extraRows =
    booking.itemType === "transport" && booking.bookingOptions
      ? transportEmailRows(booking)
      : `
        <tr><td style="padding: 6px 0;">${T.depDate}</td><td>${booking.departureDate}</td></tr>
        <tr><td style="padding: 6px 0;">${T.retDate}</td><td>${booking.returnDate}</td></tr>
        <tr><td style="padding: 6px 0;">${T.participants}</td><td>${booking.participants} ${T.guests}</td></tr>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px;">
      <h2 style="margin: 0 0 16px;">${T.subject}</h2>
      <p>${T.hello} <strong>${escapeHtml(booking.customerName)}</strong>,</p>
      <p>${T.received}</p>
      <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 6px 0;">${T.bookingCode}</td><td><strong>${booking.bookingCode}</strong></td></tr>
        <tr><td style="padding: 6px 0;">${T.package}</td><td>${escapeHtml(booking.packageName)}</td></tr>
        ${extraRows}
      </table>
      <p style="margin-top: 16px;">${T.wait}</p>
      <p style="color: #777;">${T.contact} ${env.WHATSAPP_ADMIN_NUMBER || ""}</p>
    </div>
  `;
}

function transportEmailRows(booking: Booking): string {
  const T = strings(booking.locale);
  const o = booking.bookingOptions;
  if (!o) return "";
  const unitTotal = o.price + o.extraTotal;
  const grandTotal = unitTotal * o.vehicleQty;
  const extras = o.extraCharges
    .map((e) => `${escapeHtml(e.name)} +${e.price} ${e.currency}`)
    .join(", ");
  return `
    <tr><td style="padding: 6px 0;">${T.pickup}</td><td>${escapeHtml(o.pickupLocation)}</td></tr>
    <tr><td style="padding: 6px 0;">${T.time}</td><td>${o.pickupDate} ${o.pickupTime}</td></tr>
    ${o.dropoffLocation ? `<tr><td style="padding: 6px 0;">${T.dropoff}</td><td>${escapeHtml(o.dropoffLocation)}</td></tr>` : ""}
    <tr><td style="padding: 6px 0;">${T.vehicles}</td><td>${o.vehicleQty}</td></tr>
    <tr><td style="padding: 6px 0;">${T.package}</td><td>${escapeHtml(o.pricingPackageName)} ${o.price} ${o.currency}</td></tr>
    <tr><td style="padding: 6px 0;">${T.extras}</td><td>${extras || "-"}</td></tr>
    <tr><td style="padding: 6px 0;"><strong>${T.estTotal}</strong></td><td><strong>${grandTotal} ${o.currency}</strong></td></tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
