import { NextResponse } from "next/server";
import { getPublicSiteConfig } from "@/lib/services/site-config";

export const dynamic = "force-dynamic";

/**
 * GET /api/site-config
 *
 * Public runtime config (contact, social, WhatsApp number) — source of truth
 * edited from admin `/admin/config`. Fetched by client components via
 * `useSiteConfig()`. Admin notification email is never exposed here.
 */
export async function GET() {
  try {
    const config = await getPublicSiteConfig();
    return NextResponse.json(config, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("GET /api/site-config failed:", err);
    return NextResponse.json(
      { message: "Gagal membaca konfigurasi situs." },
      { status: 500 }
    );
  }
}
