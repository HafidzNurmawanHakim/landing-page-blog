import { NextResponse } from "next/server";
import { getPackageBySlug, serializePackage } from "@/lib/db/repositories/packages";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const pkg = await getPackageBySlug(slug);
    if (!pkg) {
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ data: serializePackage(pkg) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/packages/slug] failed:", err);
    return NextResponse.json(
      { error: "Gagal mengambil detail paket." },
      { status: 500 }
    );
  }
}
