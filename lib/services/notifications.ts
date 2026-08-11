import { env } from "../env";
import type { Booking } from "../db/schema";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { getPackageByCode } from "@/lib/db/repositories/packages";
import { siteConfig, buildWhatsAppLink } from "@/lib/config/site";
import {
  getSiteConfig,
  type ResolvedSiteConfig,
} from "@/lib/services/site-config";
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
 * - Two emails fire on booking: confirmation to the customer (only when an
 *   email was provided) + a new-booking alert to the admin (ADMIN_EMAIL).
 */

type SendResult = { ok: true; provider: string } | { ok: false; error: string };

type TemplateStrings = {
  alert: string;
  code: string;
  package: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  pending: string;
  dates: string;
  participants: string;
  notes: string;
  view: string;
  dashboard: string;
  subject: string;
  hello: string;
  received: string;
  bookingCode: string;
  depDate: string;
  retDate: string;
  guests: string;
  wait: string;
  contact: string;
  chat: string;
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
    alert: "BOOKING BARU",
    code: "Kode",
    package: "Paket",
    name: "Nama",
    phone: "HP",
    email: "Email",
    status: "Status",
    pending: "Menunggu Konfirmasi",
    dates: "Tanggal",
    participants: "Peserta",
    notes: "Catatan",
    view: "Lihat detail",
    dashboard: "Buka di Dashboard",
    subject: "Konfirmasi Booking",
    hello: "Halo",
    received: "Kami sudah menerima booking kamu dengan detail berikut:",
    bookingCode: "Nomor Booking",
    depDate: "Tanggal Berangkat",
    retDate: "Tanggal Pulang",
    guests: "orang",
    wait: "Tunggu konfirmasi admin via WhatsApp/telepon.",
    contact: "Hubungi kami:",
    chat: "Chat WhatsApp",
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
    alert: "TEMPAHAN BARU",
    code: "Kod",
    package: "Pakej",
    name: "Nama",
    phone: "HP",
    email: "Email",
    status: "Status",
    pending: "Menunggu Pengesahan",
    dates: "Tarikh",
    participants: "Peserta",
    notes: "Catatan",
    view: "Lihat butiran",
    dashboard: "Buka di Papan Pemuka",
    subject: "Pengesahan Tempahan",
    hello: "Halo",
    received: "Kami sudah menerima tempahan anda dengan butiran berikut:",
    bookingCode: "Nombor Tempahan",
    depDate: "Tarikh Berlepas",
    retDate: "Tarikh Pulang",
    guests: "orang",
    wait: "Tunggu pengesahan admin melalui WhatsApp/telefon.",
    contact: "Hubungi kami:",
    chat: "Chat WhatsApp",
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
    alert: "NEW BOOKING",
    code: "Code",
    package: "Package",
    name: "Name",
    phone: "Phone",
    email: "Email",
    status: "Status",
    pending: "Pending Confirmation",
    dates: "Dates",
    participants: "Participants",
    notes: "Notes",
    view: "View details",
    dashboard: "Open in Dashboard",
    subject: "Booking Confirmation",
    hello: "Hello",
    received: "We have received your booking with the following details:",
    bookingCode: "Booking Code",
    depDate: "Departure Date",
    retDate: "Return Date",
    guests: "people",
    wait: "Wait for admin confirmation via WhatsApp/phone.",
    contact: "Contact us:",
    chat: "Chat on WhatsApp",
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
    alert: "新预订",
    code: "预订代码",
    package: "套餐",
    name: "姓名",
    phone: "电话",
    email: "邮箱",
    status: "状态",
    pending: "等待确认",
    dates: "日期",
    participants: "人数",
    notes: "备注",
    view: "查看详情",
    dashboard: "在后台查看",
    subject: "预订确认",
    hello: "您好",
    received: "我们已收到您的预订，详细信息如下：",
    bookingCode: "预订编号",
    depDate: "出发日期",
    retDate: "返回日期",
    guests: "人",
    wait: "请等待管理员通过 WhatsApp/电话确认。",
    contact: "联系我们：",
    chat: "WhatsApp 咨询",
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

/**
 * Web palette (docs/12-design-rules.md) — orange accent, flat & borderless.
 * Matches `app/globals.css` (orange theme): primary hsl(24.6 95% 53.1%).
 */
const C = {
  primary: "#f97316",
  onPrimary: "#ffffff",
  page: "#f5f5f4",
  card: "#ffffff",
  fg: "#1c1917",
  muted: "#78716c",
  soft: "#f5f5f4",
  amberBg: "#fef3c7",
  amberFg: "#b45309",
  radiusLg: "24px",
  radiusMd: "16px",
} as const;

const FONT_STACK =
  "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

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

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendResult> {
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
        to: [to],
        subject,
        html,
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

export async function sendBookingEmail(booking: Booking): Promise<SendResult> {
  if (!booking.email) {
    logSkipped("email", "customer email not provided");
    return { ok: false, error: "no email" };
  }
  const T = strings(booking.locale);
  const cfg = await getSiteConfig();
  return sendEmail(
    booking.email,
    `${T.subject} - ${booking.bookingCode}`,
    await buildCustomerEmail(booking, cfg),
  );
}

export async function sendAdminNotificationEmail(
  booking: Booking,
): Promise<SendResult> {
  const T = strings(booking.locale);
  const cfg = await getSiteConfig();
  return sendEmail(
    cfg.adminEmail,
    `${T.alert} - ${booking.bookingCode}`,
    await buildAdminEmail(booking, cfg),
  );
}

/**
 * Fires the booking notifications inside `after()` (Next.js) so they are not
 * killed when the request ends in serverless. Booking pipeline must NOT await
 * this. Two emails: admin alert (always) + customer confirmation (only when
 * the guest provided an email).
 */
export async function dispatchBookingNotifications(
  booking: Booking,
): Promise<void> {
  await Promise.allSettled([
    sendBookingEmail(booking),
    sendAdminNotificationEmail(booking),
  ]);
}

// ---------------------------------------------------------------------------
// Email shell
// ---------------------------------------------------------------------------

function logoUrl(): string {
  return `${siteConfig.url}/img/logo/long.webp`;
}

function shell(cfg: ResolvedSiteConfig, children: string): string {
  const socialLinks = cfg.social
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}" style="color:${C.muted};text-decoration:none;margin:0 10px;font-size:13px;">${escapeHtml(link.label)}</a>`,
    )
    .join("");
  const T = strings();

  return `
    <div style="background:${C.page}; padding:32px 16px;">
      <div style="max-width:560px; margin:0 auto; background:${C.card}; border-radius:${C.radiusLg}; overflow:hidden;">
        <div style="padding:32px 32px 8px; text-align:center;">
          <img
            src="${logoUrl()}"
            alt="${escapeHtml(siteConfig.name)}"
            width="168"
            style="width:168px; height:auto; display:inline-block;"
          />
        </div>
        <div style="padding:8px 32px 16px;">${children}</div>
        <div style="background:${C.soft}; padding:20px 32px; text-align:center;">
          <p style="margin:0 0 8px; color:${C.muted}; font-size:12px; letter-spacing:0.02em;">${T.follow}</p>
          <div style="margin-bottom:12px;">${socialLinks}</div>
          <p style="margin:0; color:${C.muted}; font-size:12px;">&copy; ${new Date().getFullYear()} ${escapeHtml(siteConfig.name)} · ${escapeHtml(siteConfig.url.replace(/^https?:\/\//, ""))}</p>
        </div>
      </div>
    </div>
  `;
}

function pillBadge(text: string, bg: string, fg: string): string {
  return `
    <span style="display:inline-block; background:${bg}; color:${fg}; border-radius:9999px; padding:6px 16px; font-size:13px; font-weight:600; letter-spacing:0.02em;">
      ${text}
    </span>
  `;
}

function ctaButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td align="center" style="border-radius:9999px; background:${C.primary};">
          <a href="${escapeHtml(href)}" style="display:inline-block; padding:12px 28px; border-radius:9999px; background:${C.primary}; color:${C.onPrimary}; font-size:14px; font-weight:600; text-decoration:none;">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function summaryTable(rows: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse; width:100%; font-size:14px; color:${C.fg};">
      ${rows}
    </table>
  `;
}

function summaryRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0; color:${C.muted}; width:45%; vertical-align:top;">${label}</td>
      <td style="padding:8px 0; font-weight:500; color:${C.fg};">${value}</td>
    </tr>
  `;
}

function summaryRowStrong(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:10px 0; color:${C.muted}; width:45%; vertical-align:top;">${label}</td>
      <td style="padding:10px 0; font-weight:600; color:${C.fg}; font-size:15px;">${value}</td>
    </tr>
  `;
}

// ---------------------------------------------------------------------------
// Customer confirmation email
// ---------------------------------------------------------------------------

async function buildCustomerEmail(
  booking: Booking,
  cfg: ResolvedSiteConfig,
): Promise<string> {
  const T = strings(booking.locale);

  const summaryRows = `
    ${summaryRow(T.bookingCode, escapeHtml(booking.bookingCode))}
    ${summaryRow(T.package, escapeHtml(booking.packageName))}
    ${booking.itemType === "transport" && booking.bookingOptions ? transportEmailRows(booking, T) : await tourEmailRows(booking, T)}
    ${summaryRow(T.participants, `${booking.participants} ${T.guests}`)}
    ${booking.notes ? summaryRow(T.notes, escapeHtml(booking.notes)) : ""}`;

  const waLink = buildWhatsAppLink(
    cfg.whatsapp,
    (booking.locale as Locale) ?? DEFAULT_LOCALE,
  );

  return shell(
    cfg,
    `
    <h2 style="margin:16px 0 6px; color:${C.fg}; font-size:20px; font-weight:600; letter-spacing:-0.01em; text-align:center;">
      ${T.subject}
    </h2>
    <p style="margin:0 0 24px; text-align:center;">${pillBadge(T.pending, C.amberBg, C.amberFg)}</p>
    <p style="margin:0 0 16px; color:${C.fg}; font-size:14px;">
      ${T.hello} <strong>${escapeHtml(booking.customerName)}</strong>,
    </p>
    <p style="margin:0 0 16px; color:${C.muted}; font-size:14px;">${T.received}</p>
    ${summaryTable(summaryRows)}
    <div style="margin-top:20px; padding:16px 20px; background:${C.soft}; border-radius:${C.radiusMd};">
      <p style="margin:0 0 4px; color:${C.muted}; font-size:14px;">${T.wait}</p>
      <p style="margin:0 0 12px; color:${C.fg}; font-size:14px;">
        <strong>${T.contact}</strong> ${escapeHtml(cfg.contact.phoneDisplay)} · <a href="mailto:${escapeHtml(cfg.contact.email)}" style="color:${C.primary}; text-decoration:none;">${escapeHtml(cfg.contact.email)}</a>
      </p>
      ${ctaButton(waLink, T.chat)}
    </div>
  `,
  );
}

// ---------------------------------------------------------------------------
// Admin notification email
// ---------------------------------------------------------------------------

async function buildAdminEmail(
  booking: Booking,
  cfg: ResolvedSiteConfig,
): Promise<string> {
  // Admin notification is always Indonesian (docs/07-notifications.md §7.1).
  const T = strings("id");

  const summaryRows = `
    ${summaryRow(T.bookingCode, escapeHtml(booking.bookingCode))}
    ${summaryRow(T.package, escapeHtml(booking.packageName))}
    ${booking.itemType === "transport" && booking.bookingOptions ? transportEmailRows(booking, T) : await tourEmailRows(booking, T)}
    ${summaryRow(T.name, escapeHtml(booking.customerName))}
    ${summaryRow(T.phone, escapeHtml(booking.phone))}
    ${booking.email ? summaryRow(T.email, escapeHtml(booking.email)) : ""}
    ${summaryRow(T.participants, `${booking.participants} ${T.guests}`)}
    ${booking.notes ? summaryRow(T.notes, escapeHtml(booking.notes)) : ""}`;

  const adminUrl = `${siteConfig.url}/admin/bookings/${booking.id}`;

  return shell(
    cfg,
    `
    <h2 style="margin:16px 0 6px; color:${C.fg}; font-size:20px; font-weight:600; letter-spacing:-0.01em; text-align:center;">
      ${T.alert}
    </h2>
    <p style="margin:0 0 24px; text-align:center;">${pillBadge(T.pending, C.amberBg, C.amberFg)}</p>
    <p style="margin:0 0 16px; color:${C.muted}; font-size:14px;">
      ${T.bookingCode} <strong style="color:${C.fg};">${escapeHtml(booking.bookingCode)}</strong>
    </p>
    ${summaryTable(summaryRows)}
    <div style="margin-top:24px; text-align:center;">
      ${ctaButton(adminUrl, `${T.view} ${T.dashboard}`)}
    </div>
  `,
  );
}

// ---------------------------------------------------------------------------
// Shared row builders
// ---------------------------------------------------------------------------

async function tourEmailRows(
  booking: Booking,
  T: TemplateStrings,
): Promise<string> {
  let priceRow = "";
  if (booking.itemType === "hotel" || booking.itemType === "tour") {
    try {
      const pkg = await getPackageByCode(booking.packageCode);
      if (pkg && pkg.price) {
        priceRow = summaryRowStrong(T.price, formatIDR(pkg.price));
      }
    } catch {
      // Price is best-effort; never fail the email over a lookup error.
    }
  }
  return `
    ${summaryRow(T.depDate, escapeHtml(booking.departureDate))}
    ${summaryRow(T.retDate, escapeHtml(booking.returnDate))}
    ${priceRow}`;
}

function transportEmailRows(
  booking: Booking,
  T: TemplateStrings,
): string {
  const o = booking.bookingOptions;
  if (!o) return "";
  const unitTotal = o.price + o.extraTotal;
  const grandTotal = unitTotal * o.vehicleQty;
  const extras = o.extraCharges
    .map((e) => `${escapeHtml(e.name)} +${e.price} ${e.currency}`)
    .join(", ");
  return `
    ${summaryRow(T.pickup, escapeHtml(o.pickupLocation))}
    ${summaryRow(T.time, `${escapeHtml(o.pickupDate)} ${escapeHtml(o.pickupTime)}`)}
    ${o.dropoffLocation ? summaryRow(T.dropoff, escapeHtml(o.dropoffLocation)) : ""}
    ${summaryRow(T.vehicles, `${o.vehicleQty}`)}
    ${summaryRow(T.package, `${escapeHtml(o.pricingPackageName)} ${o.price} ${escapeHtml(o.currency)}`)}
    ${summaryRow(T.extras, extras || "-")}
    ${summaryRowStrong(T.estTotal, `${grandTotal} ${escapeHtml(o.currency)}`)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
