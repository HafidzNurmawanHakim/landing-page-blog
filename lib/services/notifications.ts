import { env } from "../env";
import type { Booking } from "../db/schema";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { getPackageByCode } from "@/lib/db/repositories/packages";
import { siteConfig } from "@/lib/config/site";
import { formatIDR } from "@/lib/utils/format";

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
  price: string;
  total: string;
  follow: string;
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
    price: "Harga",
    total: "Total",
    follow: "Ikuti kami:",
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
    price: "Harga",
    total: "Jumlah",
    follow: "Ikuti kami:",
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
    price: "Price",
    total: "Total",
    follow: "Follow us:",
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
    price: "价格",
    total: "总额",
    follow: "关注我们：",
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
        html: await buildEmailTemplate(booking),
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

async function buildEmailTemplate(booking: Booking): Promise<string> {
  const T = strings(booking.locale);

  const summaryRows = `
        <tr><td style="padding: 6px 0;">${T.bookingCode}</td><td><strong>${booking.bookingCode}</strong></td></tr>
        <tr><td style="padding: 6px 0;">${T.package}</td><td>${escapeHtml(booking.packageName)}</td></tr>
        ${booking.itemType === "transport" && booking.bookingOptions ? transportEmailRows(booking) : await tourEmailRows(booking)}`;

  const socialLinks = siteConfig.social
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}" style="color:#4f46e5;text-decoration:none;margin-right:12px;">${escapeHtml(link.label)}</a>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; background:#f8fafc;">
      <div style="background:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e2e8f0;">
        <div style="background:#4f46e5; padding:24px 32px;">
          <h1 style="margin:0; color:#ffffff; font-size:20px;">Destitour</h1>
          <p style="margin:4px 0 0; color:#c7d2fe; font-size:14px;">${T.alert}</p>
        </div>
        <div style="padding:24px 32px;">
          <h2 style="margin:0 0 8px; color:#0f172a; font-size:18px;">${T.subject} - ${booking.bookingCode}</h2>
          <p style="margin:0 0 16px; color:#475569;">${T.hello} <strong>${escapeHtml(booking.customerName)}</strong>,</p>
          <p style="margin:0 0 16px; color:#475569;">${T.received}</p>
          <table style="border-collapse: collapse; width: 100%; color:#334155;">
            ${summaryRows}
            ${booking.notes ? `<tr><td style="padding: 6px 0;">${T.notes}</td><td>${escapeHtml(booking.notes)}</td></tr>` : ""}
          </table>
          <div style="margin-top:20px; padding:16px; background:#f1f5f9; border-radius:12px;">
            <p style="margin:0 0 4px; color:#475569;">${T.wait}</p>
            <p style="margin:0; color:#334155;"><strong>${T.contact}</strong> ${siteConfig.contact.phoneDisplay} · <a href="mailto:${siteConfig.contact.email}" style="color:#4f46e5;text-decoration:none;">${siteConfig.contact.email}</a></p>
          </div>
        </div>
        <div style="border-top:1px solid #e2e8f0; padding:16px 32px; text-align:center;">
          <p style="margin:0 0 8px; color:#94a3b8; font-size:13px;">${T.follow}</p>
          <div>${socialLinks}</div>
          <p style="margin:12px 0 0; color:#94a3b8; font-size:12px;">&copy; ${new Date().getFullYear()} ${siteConfig.name} · ${siteConfig.url.replace(/^https?:\/\//, "")}</p>
        </div>
      </div>
    </div>
  `;
}

async function tourEmailRows(booking: Booking): Promise<string> {
  const T = strings(booking.locale);
  let priceRow = "";
  if (booking.itemType === "hotel" || booking.itemType === "tour") {
    try {
      const pkg = await getPackageByCode(booking.packageCode);
      if (pkg && pkg.price) {
        priceRow = `<tr><td style="padding: 6px 0;"><strong>${T.price}</strong></td><td><strong>${formatIDR(pkg.price)}</strong></td></tr>`;
      }
    } catch {
      // Price is best-effort; never fail the email over a lookup error.
    }
  }
  return `
    <tr><td style="padding: 6px 0;">${T.depDate}</td><td>${booking.departureDate}</td></tr>
    <tr><td style="padding: 6px 0;">${T.retDate}</td><td>${booking.returnDate}</td></tr>
    <tr><td style="padding: 6px 0;">${T.participants}</td><td>${booking.participants} ${T.guests}</td></tr>
    ${priceRow}`;
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
