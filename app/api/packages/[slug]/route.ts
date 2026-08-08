import { NextRequest, NextResponse } from "next/server";
import {
  getPackageBySlug,
  localizePackage,
  serializePackage,
} from "@/lib/db/repositories/packages";
import { LOCALES, type Locale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const localeParam = req.nextUrl.searchParams.get("locale");
  const locale = (LOCALES as readonly string[]).includes(localeParam ?? "")
    ? (localeParam as Locale)
    : null;

  try {
    const pkg = await getPackageBySlug(slug);
    if (!pkg) {
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 });
    }
    const serialized = serializePackage(pkg);
    return NextResponse.json({
      data: locale ? localizePackage(serialized, locale) : serialized,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/packages/slug] failed:", err);
    return NextResponse.json(
      { error: "Gagal mengambil detail paket." },
      { status: 500 }
    );
  }
}
