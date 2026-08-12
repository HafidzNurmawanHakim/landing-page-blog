import { NextRequest, NextResponse } from "next/server";
import {
  listPackages,
  localizePackage,
  serializePackage,
} from "@/lib/db/repositories/packages";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

/**
 * GET /api/packages?page=1&limit=10&locale=en
 *
 * Response contract (docs/05-api-server-actions.md):
 *   { data: Package[], meta: { page, limit, total, totalPages } }
 * Localized fields are resolved when a valid `locale` is provided.
 */
export async function GET(req: NextRequest) {
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
    const { items, total, totalPages } = await listPackages({
      page,
      limit,
    });

    const data = items.map((pkg) => {
      const serialized = serializePackage(pkg);
      return locale ? localizePackage(serialized, locale) : serialized;
    });

    return NextResponse.json({
      data,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/packages] failed:", err);
    return NextResponse.json(
      { error: "Gagal mengambil daftar paket." },
      { status: 500 }
    );
  }
}
