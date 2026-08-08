import { NextRequest, NextResponse } from "next/server";
import {
  listTransportProducts,
  localizeTransportProduct,
  TRANSPORT_CATEGORIES,
} from "@/lib/db/repositories/transport";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

/**
 * GET /api/transport?category=MPV&page=1&limit=10&locale=en
 *
 * Response contract (docs/05-api-server-actions.md):
 *   { data: TransportProduct[], meta: { page, limit, total, totalPages } }
 * Localized fields (title/description/package names) are resolved when a
 * valid `locale` is provided. Each item carries `priceFrom` + `currency`.
 */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 10)
  );
  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale = (LOCALES as readonly string[]).includes(localeParam ?? "")
    ? (localeParam as Locale)
    : null;

  try {
    const valid = [...TRANSPORT_CATEGORIES, "all"] as const;
    const resolved = valid.includes((category ?? "") as (typeof valid)[number])
      ? category
      : "all";

    const { items, total, totalPages } = await listTransportProducts({
      category: resolved as (typeof valid)[number],
      page,
      limit,
    });

    const data = items.map((item) =>
      locale
        ? localizeTransportProduct(item, locale)
        : localizeTransportProduct(item, "id")
    );

    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/transport] failed:", err);
    return NextResponse.json(
      { error: "Gagal mengambil daftar transport." },
      { status: 500 }
    );
  }
}
