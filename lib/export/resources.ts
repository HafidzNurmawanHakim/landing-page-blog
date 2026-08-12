/**
 * Export definitions per admin resource (docs/12-design-rules.md is UI-only;
 * these are the server-side column mappings for the export API).
 *
 * One definition per resource: a stable column list plus a function that
 * fetches ALL rows matching the given query (ignoring pagination) and maps
 * them to plain export rows. Kept in one place so the export format stays
 * consistent with the admin tables.
 */
import { inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { packages } from "@/lib/db/schema";
import {
  listBookings,
  normalizeStatus,
} from "@/lib/db/repositories/bookings";
import { listPackages } from "@/lib/db/repositories/packages";
import {
  BLOG_POST_STATUSES,
  getAllBlogCategories,
  listBlogPosts,
  type BlogPostStatus,
} from "@/lib/db/repositories/blog";
import { listGalleryItems } from "@/lib/db/repositories/gallery";
import { listTestimonials } from "@/lib/db/repositories/testimonials";
import {
  listTransportProducts,
  localizeTransportProduct,
} from "@/lib/db/repositories/transport";
import { pickLocale } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils/format";
import type { Booking, BlogPost } from "@/lib/db/schema";
import type { ExportColumn, ExportRow } from "@/lib/export/build";

export const EXPORT_RESOURCES = [
  "bookings",
  "packages",
  "blogs",
  "gallery",
  "testimonials",
  "transport",
] as const;

export type ExportResource = (typeof EXPORT_RESOURCES)[number];

export function isExportResource(value: string): value is ExportResource {
  return (EXPORT_RESOURCES as readonly string[]).includes(value);
}

export const EXPORT_RESOURCE_LABELS: Record<ExportResource, string> = {
  bookings: "Booking",
  packages: "Paket Tour",
  blogs: "Artikel Blog",
  gallery: "Galeri",
  testimonials: "Testimoni",
  transport: "Produk Transport",
};

// --- helpers ----------------------------------------------------------------

/** Loop the (paged) list functions until every matching row is collected. */
async function fetchAll<T>(
  page: (page: number) => Promise<{ items: T[]; total: number; page: number }>,
  perPage = 50
): Promise<T[]> {
  const rows: T[] = [];
  const first = await page(1);
  rows.push(...first.items);
  const totalPages = Math.ceil(first.total / perPage);
  for (let i = 2; i <= totalPages; i++) {
    const next = await page(i);
    rows.push(...next.items);
  }
  return rows;
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  tour: "Paket Tour",
  transport: "Transport",
  hotel: "Hotel",
};

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Dikonfirmasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
};

const BLOG_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

// --- bookings ---------------------------------------------------------------

function bookingEstimatedPrice(booking: Booking, priceMap: Map<string, number>) {
  if (booking.itemType === "transport" && booking.bookingOptions) {
    const o = booking.bookingOptions;
    return (o.price + o.extraTotal) * o.vehicleQty;
  }
  const pkgPrice = priceMap.get(booking.packageCode);
  return pkgPrice ? pkgPrice * booking.participants : null;
}

async function fetchBookings(query: URLSearchParams): Promise<ExportRow[]> {
  const status = normalizeStatus(query.get("status"));
  const search = query.get("search")?.trim() || undefined;

  const all = await fetchAll<Booking>((page) =>
    listBookings({ status, search, page, limit: 50 })
  );

  const codes = [...new Set(all.map((b) => b.packageCode))];
  const priceRows =
    codes.length > 0
      ? await getDb()
          .select({ code: packages.code, price: packages.price })
          .from(packages)
          .where(inArray(packages.code, codes))
      : [];
  const priceMap = new Map(priceRows.map((r) => [r.code, r.price]));

  return all.map((b) => ({
    bookingCode: b.bookingCode,
    itemType: ITEM_TYPE_LABELS[b.itemType] ?? b.itemType,
    packageName: b.packageName,
    customerName: b.customerName,
    phone: b.phone,
    email: b.email ?? "",
    departureDate: formatDate(b.departureDate),
    returnDate: formatDate(b.returnDate),
    participants: b.participants,
    estimatedPrice: bookingEstimatedPrice(b, priceMap),
    status: BOOKING_STATUS_LABELS[b.status] ?? b.status,
    notes: b.notes ?? "",
    adminNotes: b.adminNotes ?? "",
    createdAt: formatDate(b.createdAt),
  }));
}

// --- packages ---------------------------------------------------------------

async function fetchPackages(_query: URLSearchParams): Promise<ExportRow[]> {
  const { items } = await listPackages({ activeOnly: false });
  return items.map((p) => ({
    code: p.code,
    name: pickLocale(p.name),
    slug: p.slug,
    duration: p.duration ?? "",
    price: p.price,
    isActive: p.isActive === 1 ? "Aktif" : "Nonaktif",
    createdAt: formatDate(p.createdAt),
  }));
}

// --- blog posts -------------------------------------------------------------

async function fetchBlogs(query: URLSearchParams): Promise<ExportRow[]> {
  const rawStatus = query.get("status");
  const status: BlogPostStatus | "all" = (
    BLOG_POST_STATUSES as readonly string[]
  ).includes(rawStatus ?? "")
    ? (rawStatus as BlogPostStatus)
    : "all";
  const keyword = query.get("search")?.trim() || undefined;

  const all = await fetchAll<BlogPost>((page) =>
    listBlogPosts({ status, keyword, page, limit: 100 })
  );

  const categories = await getAllBlogCategories();
  const categoryNames = new Map(categories.map((c) => [c.id, pickLocale(c.name)]));

  return all.map((p) => ({
    id: p.id,
    title: pickLocale(p.title),
    slug: p.slug,
    category: p.categoryId ? (categoryNames.get(p.categoryId) ?? "") : "",
    tags: (p.tags ?? []).join("; "),
    status: BLOG_STATUS_LABELS[p.status] ?? p.status,
    viewCount: p.viewCount,
    likeCount: p.likeCount,
    shareCount: p.shareCount,
    publishedAt: formatDate(p.publishedAt ?? p.createdAt),
    createdAt: formatDate(p.createdAt),
  }));
}

// --- gallery ----------------------------------------------------------------

async function fetchGallery(_query: URLSearchParams): Promise<ExportRow[]> {
  const all = await fetchAll((page) => listGalleryItems({ page, limit: 100 }));
  return all.map((g) => ({
    id: g.id,
    caption: pickLocale(g.caption),
    imageUrl: g.imageUrl,
    likeCount: g.likeCount,
    shareCount: g.shareCount,
    createdAt: formatDate(g.createdAt),
  }));
}

// --- testimonials -----------------------------------------------------------

async function fetchTestimonials(_query: URLSearchParams): Promise<ExportRow[]> {
  const all = await fetchAll((page) =>
    listTestimonials({ page, limit: 100 })
  );
  return all.map((t) => ({
    id: t.id,
    name: t.name,
    role: pickLocale(t.role),
    comment: pickLocale(t.comment),
    rating: t.rating,
    isActive: t.isActive === 1 ? "Aktif" : "Nonaktif",
    sortOrder: t.sortOrder,
    createdAt: formatDate(t.createdAt),
  }));
}

// --- transport --------------------------------------------------------------

async function fetchTransport(_query: URLSearchParams): Promise<ExportRow[]> {
  const { items } = await listTransportProducts({ activeOnly: false });
  return items.map((p) => {
    const localized = localizeTransportProduct(p, "id");
    return {
      code: p.code,
      title: localized.title,
      slug: p.slug,
      category: p.category,
      capacity: p.capacity,
      capacityUnit: p.capacityUnit,
      priceFrom: localized.priceFrom,
      currency: localized.currency,
      isActive: p.isActive === 1 ? "Aktif" : "Nonaktif",
      createdAt: formatDate(p.createdAt),
    };
  });
}

// --- registry ---------------------------------------------------------------

export type ExportDefinition = {
  columns: ExportColumn[];
  fetchRows: (query: URLSearchParams) => Promise<ExportRow[]>;
};

export const EXPORT_DEFINITIONS: Record<ExportResource, ExportDefinition> = {
  bookings: {
    columns: [
      { key: "bookingCode", label: "Kode Booking" },
      { key: "itemType", label: "Jenis" },
      { key: "packageName", label: "Paket" },
      { key: "customerName", label: "Customer" },
      { key: "phone", label: "No. HP / WA" },
      { key: "email", label: "Email" },
      { key: "departureDate", label: "Berangkat" },
      { key: "returnDate", label: "Kembali" },
      { key: "participants", label: "Peserta" },
      { key: "estimatedPrice", label: "Estimasi Harga" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Catatan Customer" },
      { key: "adminNotes", label: "Catatan Admin" },
      { key: "createdAt", label: "Dibuat" },
    ],
    fetchRows: fetchBookings,
  },
  packages: {
    columns: [
      { key: "code", label: "Kode" },
      { key: "name", label: "Nama Paket" },
      { key: "slug", label: "Slug" },
      { key: "duration", label: "Durasi" },
      { key: "price", label: "Harga" },
      { key: "isActive", label: "Status" },
      { key: "createdAt", label: "Dibuat" },
    ],
    fetchRows: fetchPackages,
  },
  blogs: {
    columns: [
      { key: "id", label: "ID" },
      { key: "title", label: "Judul" },
      { key: "slug", label: "Slug" },
      { key: "category", label: "Kategori" },
      { key: "tags", label: "Tag" },
      { key: "status", label: "Status" },
      { key: "viewCount", label: "Dilihat" },
      { key: "likeCount", label: "Like" },
      { key: "shareCount", label: "Share" },
      { key: "publishedAt", label: "Dipublikasi" },
      { key: "createdAt", label: "Dibuat" },
    ],
    fetchRows: fetchBlogs,
  },
  gallery: {
    columns: [
      { key: "id", label: "ID" },
      { key: "caption", label: "Caption" },
      { key: "imageUrl", label: "URL Gambar" },
      { key: "likeCount", label: "Like" },
      { key: "shareCount", label: "Share" },
      { key: "createdAt", label: "Ditambahkan" },
    ],
    fetchRows: fetchGallery,
  },
  testimonials: {
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nama" },
      { key: "role", label: "Peran" },
      { key: "comment", label: "Komentar" },
      { key: "rating", label: "Rating" },
      { key: "isActive", label: "Status" },
      { key: "sortOrder", label: "Urutan" },
      { key: "createdAt", label: "Ditambahkan" },
    ],
    fetchRows: fetchTestimonials,
  },
  transport: {
    columns: [
      { key: "code", label: "Kode" },
      { key: "title", label: "Judul" },
      { key: "slug", label: "Slug" },
      { key: "category", label: "Kategori" },
      { key: "capacity", label: "Kapasitas" },
      { key: "capacityUnit", label: "Satuan" },
      { key: "priceFrom", label: "Harga Mulai" },
      { key: "currency", label: "Mata Uang" },
      { key: "isActive", label: "Status" },
      { key: "createdAt", label: "Dibuat" },
    ],
    fetchRows: fetchTransport,
  },
};

/** Human-readable file name, e.g. "booking-2026-08-11". */
export function exportFileBaseName(resource: ExportResource): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${resource}-${date}`;
}
