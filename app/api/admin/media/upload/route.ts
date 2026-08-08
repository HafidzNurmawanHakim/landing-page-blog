import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { MAX_MEDIA_BYTES, storeMedia } from "@/lib/media/upload";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/media/upload
 *
 * Admin-only multipart upload for product images.
 * Response: { data: { url } } (201) or { error } (4xx/5xx).
 */
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Body harus berupa multipart form." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Field 'file' wajib diisi." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong." }, { status: 400 });
  }
  if (file.size > MAX_MEDIA_BYTES) {
    return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 413 });
  }

  try {
    const media = await storeMedia({
      name: file.name,
      type: file.type,
      size: file.size,
      arrayBuffer: () => file.arrayBuffer(),
    });
    return NextResponse.json({ data: { url: media.url } }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/admin/media/upload] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal upload gambar." },
      { status: 400 }
    );
  }
}
