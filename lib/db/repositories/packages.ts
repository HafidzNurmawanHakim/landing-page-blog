import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "../client";
import { packages, type Package } from "../schema";
import {
  type LocalizedList,
  type LocalizedString,
} from "@/lib/i18n/locales";

export { localizePackage, type LocalizedFields } from "@/lib/i18n/localize";
export type { LocalizedPackage } from "@/lib/i18n/localize";

export type PackageListResult = {
  items: Package[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PackageFilters = {
  activeOnly?: boolean;
  page?: number;
  limit?: number;
};

/** Decode a raw DB row into the shape the UI expects. */
export function serializePackage(row: Package) {
  return {
    ...row,
    itinerary: row.itinerary ?? {},
    includes: row.includes ?? {},
    excludes: row.excludes ?? {},
  };
}

export type SerializedPackage = Omit<
  Package,
  "itinerary" | "includes" | "excludes"
> & {
  itinerary: LocalizedList;
  includes: LocalizedList;
  excludes: LocalizedList;
};

export async function listPackages(
  filters: PackageFilters = {}
): Promise<PackageListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = filters.limit
    ? Math.min(100, Math.max(1, Math.floor(filters.limit)))
    : undefined;
  const offset = limit ? (page - 1) * limit : undefined;

  const conditions = [];

  if (filters.activeOnly ?? true) {
    conditions.push(eq(packages.isActive, 1));
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    limit
      ? db
          .select()
          .from(packages)
          .where(where)
          .orderBy(asc(packages.createdAt))
          .limit(limit)
          .offset(offset!)
      : db.select().from(packages).where(where).orderBy(asc(packages.createdAt)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(packages)
      .where(where),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const effectiveLimit = limit ?? total;

  return {
    items: rows,
    total,
    page,
    limit: effectiveLimit,
    totalPages: effectiveLimit > 0 ? Math.ceil(total / effectiveLimit) : 0,
  };
}

export async function getPackageBySlug(
  slug: string,
  activeOnly = true
): Promise<Package | null> {
  const db = getDb();
  const conditions = [eq(packages.slug, slug)];
  if (activeOnly) conditions.push(eq(packages.isActive, 1));

  const rows = await db
    .select()
    .from(packages)
    .where(and(...conditions))
    .limit(1);

  return rows[0] ?? null;
}

export async function getPackageByCode(code: string): Promise<Package | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(packages)
    .where(eq(packages.code, code))
    .limit(1);

  return rows[0] ?? null;
}

export async function getPackageById(id: number): Promise<Package | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(packages)
    .where(eq(packages.id, id))
    .limit(1);

  return rows[0] ?? null;
}

export type PackageInput = {
  code: string;
  name: LocalizedString;
  slug: string;
  duration?: string | null;
  price: number;
  description?: LocalizedString | null;
  imageUrl?: string | null;
  imageAlt?: LocalizedString | null;
  itinerary?: LocalizedList;
  includes?: LocalizedList;
  excludes?: LocalizedList;
  isActive?: number;
};

export async function createPackage(data: PackageInput): Promise<Package> {
  const db = getDb();
  const rows = await db
    .insert(packages)
    .values({
      ...data,
      duration: data.duration || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      imageAlt: data.imageAlt || null,
      itinerary: data.itinerary ?? {},
      includes: data.includes ?? {},
      excludes: data.excludes ?? {},
      isActive: data.isActive ?? 1,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .returning();

  return rows[0];
}

export async function updatePackage(
  id: number,
  data: PackageInput
): Promise<Package | null> {
  const db = getDb();
  const existing = await getPackageById(id);
  if (!existing) return null;

  const rows = await db
    .update(packages)
    .set({
      ...data,
      duration: data.duration || null,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      imageAlt: data.imageAlt || null,
      itinerary: data.itinerary ?? {},
      includes: data.includes ?? {},
      excludes: data.excludes ?? {},
      isActive: data.isActive ?? existing.isActive,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(packages.id, id))
    .returning();

  return rows[0] ?? null;
}

export async function deletePackage(id: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(packages)
    .where(eq(packages.id, id))
    .returning({ id: packages.id });

  return rows.length > 0;
}

export async function togglePackageActive(id: number): Promise<Package | null> {
  const db = getDb();
  const existing = await getPackageById(id);
  if (!existing) return null;

  const rows = await db
    .update(packages)
    .set({
      isActive: existing.isActive === 1 ? 0 : 1,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(packages.id, id))
    .returning();

  return rows[0] ?? null;
}
