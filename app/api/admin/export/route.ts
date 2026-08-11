import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  buildCsv,
  buildXlsx,
  type ExportColumn,
  type ExportRow,
} from "@/lib/export/build";
import {
  EXPORT_DEFINITIONS,
  exportFileBaseName,
  isExportResource,
  EXPORT_RESOURCE_LABELS,
} from "@/lib/export/resources";

export const dynamic = "force-dynamic";

const FORMATS = ["csv", "xlsx"] as const;
type ExportFormat = (typeof FORMATS)[number];

const MIME: Record<ExportFormat, string> = {
  csv: "text/csv; charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const EXTENSION: Record<ExportFormat, string> = {
  csv: "csv",
  xlsx: "xlsx",
};

/**
 * GET /api/admin/export?resource=bookings&format=csv&status=pending&search=...
 *
 * Admin-only export of the given resource as CSV or XLSX. Returns a file
 * download (attachment) built server-side so column definitions stay in one
 * place (lib/export/resources.ts). 401 when the admin session is invalid.
 */
export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 401 });
  }

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") ?? "";
  const format = (url.searchParams.get("format") ?? "csv") as ExportFormat;

  if (!isExportResource(resource)) {
    return NextResponse.json(
      { error: `Resource '${resource}' tidak dikenal.` },
      { status: 400 }
    );
  }
  if (!FORMATS.includes(format)) {
    return NextResponse.json(
      { error: `Format '${format}' tidak didukung.` },
      { status: 400 }
    );
  }

  try {
    const { columns, fetchRows } = EXPORT_DEFINITIONS[resource];
    const rows = await fetchRows(url.searchParams);
    const file = buildFile(columns, rows, format);
    const baseName = exportFileBaseName(resource);
    const fileName = `${baseName}.${EXTENSION[format]}`;

    const blob = new Blob(
      [
        file.buffer.slice(
          file.byteOffset,
          file.byteOffset + file.byteLength
        ) as ArrayBuffer,
      ],
      { type: MIME[format] }
    );

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": MIME[format],
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(file.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[api/admin/export] failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : `Gagal mengekspor ${EXPORT_RESOURCE_LABELS[resource]}.`,
      },
      { status: 500 }
    );
  }
}

function buildFile(
  columns: ExportColumn[],
  rows: ExportRow[],
  format: ExportFormat
): Uint8Array {
  if (format === "csv") {
    return new TextEncoder().encode(buildCsv(columns, rows));
  }
  return buildXlsx(columns, rows);
}
