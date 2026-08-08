import { NextRequest, NextResponse } from "next/server";
import { listPackages, serializePackage } from "@/lib/db/repositories/packages";

export const dynamic = "force-dynamic";

/**
 * GET /api/packages?category=tour&page=1&limit=10
 *
 * Response contract (docs/05-api-server-actions.md):
 *   { data: Package[], meta: { page, limit, total, totalPages } }
 */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page")) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 10)
  );

  try {
    const valid = ["tour", "transport", "hotel", "all"];
    const resolved = valid.includes(category ?? "") ? category : "all";

    const { items, total, totalPages } = await listPackages({
      category: resolved as "all" | "tour" | "transport" | "hotel",
      page,
      limit,
    });

    return NextResponse.json({
      data: items.map(serializePackage),
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
