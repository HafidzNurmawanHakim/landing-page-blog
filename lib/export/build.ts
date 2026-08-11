/**
 * Dependency-free CSV + XLSX builders for admin exports.
 *
 * The XLSX writer produces a minimal OPC (Office Open XML) package: a stored
 * (uncompressed) ZIP container with the required workbook/worksheet parts and
 * inline strings. No node stream / Buffer APIs are used, so it runs on Node,
 * the edge runtime, and Cloudflare Workers alike.
 */

export type ExportCellValue = string | number | boolean | null | undefined;

export type ExportColumn = {
  key: string;
  label: string;
};

export type ExportRow = Record<string, ExportCellValue>;

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

function escapeCsv(value: ExportCellValue): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * RFC 4180 CSV with a UTF-8 BOM so Excel opens Indonesian text correctly.
 */
export function buildCsv(columns: ExportColumn[], rows: ExportRow[]): string {
  const header = columns.map((c) => escapeCsv(c.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsv(row[c.key])).join(",")
  );
  return `\uFEFF${[header, ...lines].join("\r\n")}\r\n`;
}

// ---------------------------------------------------------------------------
// XLSX (minimal OPC package)
// ---------------------------------------------------------------------------

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function xmlEscape(value: string): string {
  // Strip control chars that are illegal in XML 1.0 (keeps tab/LF/CR).
  const clean = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  return clean.replace(/[&<>"']/g, (ch) => XML_ESCAPES[ch]!);
}

function colLetter(index: number): string {
  let result = "";
  let i = index + 1;
  while (i > 0) {
    const rem = (i - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    i = Math.floor((i - 1) / 26);
  }
  return result;
}

function isNumeric(value: ExportCellValue): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

const XML_DECL = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;

function buildRowXml(
  rowNum: number,
  columns: ExportColumn[],
  row?: ExportRow
): string {
  const cells = columns.map((column, colIndex) => {
    const ref = `${colLetter(colIndex)}${rowNum}`;
    if (!row) {
      return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(column.label)}</t></is></c>`;
    }
    const value = row[column.key];
    if (isNumeric(value)) {
      return `<c r="${ref}"><v>${value}</v></c>`;
    }
    const text = value == null ? "" : String(value);
    return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(text)}</t></is></c>`;
  });

  return `<row r="${rowNum}">${cells.join("")}</row>`;
}

function buildSheetXml(columns: ExportColumn[], rows: ExportRow[]): string {
  const body = [buildRowXml(1, columns)];
  rows.forEach((row, index) => body.push(buildRowXml(index + 2, columns, row)));

  return [
    XML_DECL,
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`,
    body.join(""),
    `</sheetData></worksheet>`,
  ].join("");
}

// --- CRC32 (standard table) ------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// --- Minimal ZIP writer (stored method) ------------------------------------

type ZipEntry = { name: string; data: Uint8Array };

function concatBytes(parts: Uint8Array[]): Uint8Array {
  let size = 0;
  for (const part of parts) size += part.length;
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function writeZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

  const localParts: Uint8Array[] = [];
  const central: { name: string; offset: number; crc: number; size: number }[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed to extract
    local.setUint16(6, 0, true); // general purpose flag
    local.setUint16(8, 0, true); // method: stored
    local.setUint16(10, dosTime, true);
    local.setUint16(12, dosDate, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, entry.data.length, true); // compressed size
    local.setUint32(22, entry.data.length, true); // uncompressed size
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true); // extra field length

    localParts.push(new Uint8Array(local.buffer), nameBytes, entry.data);
    central.push({
      name: entry.name,
      offset,
      crc,
      size: entry.data.length,
    });
    offset += 30 + nameBytes.length + entry.data.length;
  }

  const centralOffset = offset;
  const centralParts: Uint8Array[] = [];

  for (const c of central) {
    const nameBytes = encoder.encode(c.name);
    const view = new DataView(new ArrayBuffer(46));
    view.setUint32(0, 0x02014b50, true); // central directory sig
    view.setUint16(4, 20, true); // version made by
    view.setUint16(6, 20, true); // version needed to extract
    view.setUint16(8, 0, true); // flag
    view.setUint16(10, 0, true); // method: stored
    view.setUint16(12, dosTime, true);
    view.setUint16(14, dosDate, true);
    view.setUint32(16, c.crc, true);
    view.setUint32(20, c.size, true);
    view.setUint32(24, c.size, true);
    view.setUint16(28, nameBytes.length, true);
    view.setUint16(30, 0, true); // extra field length
    view.setUint16(32, 0, true); // comment length
    view.setUint16(34, 0, true); // disk number start
    view.setUint16(36, 0, true); // internal attributes
    view.setUint32(38, 0, true); // external attributes
    view.setUint32(42, c.offset, true); // local header offset
    centralParts.push(new Uint8Array(view.buffer), nameBytes);
    offset += 46 + nameBytes.length;
  }

  const centralSize = offset - centralOffset;

  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); // EOCD sig
  eocd.setUint16(4, 0, true); // disk number
  eocd.setUint16(6, 0, true); // disk with central dir
  eocd.setUint16(8, entries.length, true); // entries on this disk
  eocd.setUint16(10, entries.length, true); // total entries
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, centralOffset, true);
  eocd.setUint16(20, 0, true); // comment length

  return concatBytes([...localParts, ...centralParts, new Uint8Array(eocd.buffer)]);
}

function buildXlsxParts(columns: ExportColumn[], rows: ExportRow[]) {
  const contentType = (name: string, data: string) => ({ name, data: new TextEncoder().encode(data) });
  return [
    contentType(
      "[Content_Types].xml",
      [
        XML_DECL,
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`,
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`,
        `<Default Extension="xml" ContentType="application/xml"/>`,
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>`,
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
        `</Types>`,
      ].join("")
    ),
    contentType(
      "_rels/.rels",
      [
        XML_DECL,
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`,
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>`,
        `</Relationships>`,
      ].join("")
    ),
    contentType(
      "xl/workbook.xml",
      [
        XML_DECL,
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">`,
        `<sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets>`,
        `</workbook>`,
      ].join("")
    ),
    contentType(
      "xl/_rels/workbook.xml.rels",
      [
        XML_DECL,
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`,
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>`,
        `</Relationships>`,
      ].join("")
    ),
    contentType("xl/worksheets/sheet1.xml", buildSheetXml(columns, rows)),
  ];
}

export function buildXlsx(columns: ExportColumn[], rows: ExportRow[]): Uint8Array {
  return writeZip(buildXlsxParts(columns, rows));
}
