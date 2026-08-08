import { NextRequest, NextResponse } from "next/server";
import {
  getTransportProductBySlug,
  localizeTransportProduct,
} from "@/lib/db/repositories/transport";
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
    : "id";

  try {
    const product = await getTransportProductBySlug(slug);
    if (!product) {
      return NextResponse.json(
        { error: "Produk transport tidak ditemukan." },
        { status: 404 }
      );
    }
    return NextResponse.json({
      data: localizeTransportProduct(product, locale),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/transport/slug] failed:", err);
    return NextResponse.json(
      { error: "Gagal mengambil detail transport." },
      { status: 500 }
    );
  }
}
