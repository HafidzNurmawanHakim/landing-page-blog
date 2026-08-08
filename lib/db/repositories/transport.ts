import { and, asc, eq, sql, inArray } from "drizzle-orm";
import { getDb, type Db } from "../client";
import {
  transportExtraCharges,
  transportPricingPackages,
  transportProducts,
  type TransportCategory,
  type TransportExtraCharge,
  type TransportPricingPackage,
  type TransportProduct,
  type TransportServiceType,
} from "../schema";
import { pickLocale, type LocalizedString, type Locale } from "@/lib/i18n/locales";

export const TRANSPORT_CATEGORIES = [
  "MPV",
  "MINI_VAN",
  "MINI_BUS",
  "SUV",
  "SEDAN",
  "VAN",
  "BUS",
] as const;

export type { TransportCategory, TransportServiceType };

export function isTransportCategory(value: string): value is TransportCategory {
  return (TRANSPORT_CATEGORIES as readonly string[]).includes(value);
}

export type TransportListResult = {
  items: SerializedTransportProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TransportFilters = {
  category?: TransportCategory | "all";
  activeOnly?: boolean;
  page?: number;
  limit?: number;
};

/** A transport product with its pricing packages and extra charges attached. */
export type TransportProductWithDetails = TransportProduct & {
  pricingPackages: TransportPricingPackage[];
  extraCharges: TransportExtraCharge[];
};

/** Pricing package with localized name resolved for display. */
export type LocalizedPricingPackage = {
  id: number;
  name: string;
  type: string;
  durationHours: number | null;
  coveredAreas: string[];
  price: number;
  currency: string;
};

/** Extra charge with localized name resolved for display. */
export type LocalizedExtraCharge = {
  id: number;
  name: string;
  type: string;
  price: number;
  currency: string;
  unit: string | null;
};

/** Transport product with all localized content + cheapest price resolved. */
export type LocalizedTransportProduct = Omit<
  TransportProductWithDetails,
  "pricingPackages" | "extraCharges"
> & {
  title: string;
  description: string;
  pricingPackages: LocalizedPricingPackage[];
  extraCharges: LocalizedExtraCharge[];
  priceFrom: number;
  currency: string;
};

export function serializeTransportProduct(
  row: TransportProduct
): TransportProductWithDetails {
  return {
    ...row,
    images: row.images ?? [],
    includedServices: row.includedServices ?? [],
    pricingPackages: [],
    extraCharges: [],
  };
}

export type SerializedTransportProduct = ReturnType<
  typeof serializeTransportProduct
>;

/**
 * Resolve localized display fields for a product (with packages/extras) and
 * attach the cheapest package price so cards can render "from S$XX".
 */
export function localizeTransportProduct(
  product: TransportProductWithDetails,
  locale: Locale = "id"
): LocalizedTransportProduct {
  const pricingPackages: LocalizedPricingPackage[] =
    product.pricingPackages.map((p) => ({
      id: p.id,
      name: pickLocale(p.name, locale),
      type: p.type,
      durationHours: p.durationHours,
      coveredAreas: p.coveredAreas ?? [],
      price: p.price,
      currency: p.currency,
    }));
  const extraCharges: LocalizedExtraCharge[] = product.extraCharges.map(
    (e) => ({
      id: e.id,
      name: pickLocale(e.name, locale),
      type: e.type,
      price: e.price,
      currency: e.currency,
      unit: e.unit,
    })
  );
  const cheapest = [...pricingPackages].sort(
    (a, b) => a.price - b.price
  )[0];

  return {
    ...product,
    title: pickLocale(product.title, locale),
    description: pickLocale(product.description, locale),
    pricingPackages,
    extraCharges,
    priceFrom: cheapest?.price ?? 0,
    currency: cheapest?.currency ?? "SGD",
  };
}

async function loadDetails(
  db: Db,
  rows: TransportProduct[]
): Promise<TransportProductWithDetails[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const [pricing, extras] = await Promise.all([
    db
      .select()
      .from(transportPricingPackages)
      .where(inArray(transportPricingPackages.productId, ids))
      .orderBy(
        asc(transportPricingPackages.sortOrder),
        asc(transportPricingPackages.id)
      ),
    db
      .select()
      .from(transportExtraCharges)
      .where(inArray(transportExtraCharges.productId, ids))
      .orderBy(
        asc(transportExtraCharges.sortOrder),
        asc(transportExtraCharges.id)
      ),
  ]);

  const pricingByProduct = new Map<number, TransportPricingPackage[]>();
  for (const p of pricing) {
    const list = pricingByProduct.get(p.productId) ?? [];
    list.push(p);
    pricingByProduct.set(p.productId, list);
  }
  const extrasByProduct = new Map<number, TransportExtraCharge[]>();
  for (const e of extras) {
    const list = extrasByProduct.get(e.productId) ?? [];
    list.push(e);
    extrasByProduct.set(e.productId, list);
  }

  return rows.map((row) => ({
    ...row,
    images: row.images ?? [],
    includedServices: row.includedServices ?? [],
    pricingPackages: pricingByProduct.get(row.id) ?? [],
    extraCharges: extrasByProduct.get(row.id) ?? [],
  }));
}

export async function listTransportProducts(
  filters: TransportFilters = {}
): Promise<TransportListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = filters.limit
    ? Math.min(100, Math.max(1, Math.floor(filters.limit)))
    : undefined;
  const offset = limit ? (page - 1) * limit : undefined;

  const conditions = [];
  if (filters.category && filters.category !== "all") {
    conditions.push(eq(transportProducts.category, filters.category));
  }
  if (filters.activeOnly ?? true) {
    conditions.push(eq(transportProducts.isActive, 1));
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    limit
      ? db
          .select()
          .from(transportProducts)
          .where(where)
          .orderBy(asc(transportProducts.createdAt))
          .limit(limit)
          .offset(offset!)
      : db
          .select()
          .from(transportProducts)
          .where(where)
          .orderBy(asc(transportProducts.createdAt)),
    db
      .select({ count: sql<number>`count(*)` })
      .from(transportProducts)
      .where(where),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const effectiveLimit = limit ?? total;
  const items = await loadDetails(db, rows);

  return {
    items,
    total,
    page,
    limit: effectiveLimit,
    totalPages: effectiveLimit > 0 ? Math.ceil(total / effectiveLimit) : 0,
  };
}

export async function getTransportProductBySlug(
  slug: string,
  activeOnly = true
): Promise<TransportProductWithDetails | null> {
  const db = getDb();
  const conditions = [eq(transportProducts.slug, slug)];
  if (activeOnly) conditions.push(eq(transportProducts.isActive, 1));

  const rows = await db
    .select()
    .from(transportProducts)
    .where(and(...conditions))
    .limit(1);
  if (!rows[0]) return null;

  const [details] = await loadDetails(db, rows);
  return details;
}

export async function getTransportProductByCode(
  code: string
): Promise<TransportProductWithDetails | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(transportProducts)
    .where(eq(transportProducts.code, code))
    .limit(1);
  if (!rows[0]) return null;

  const [details] = await loadDetails(db, rows);
  return details;
}

export async function getTransportProductById(
  id: number
): Promise<TransportProductWithDetails | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(transportProducts)
    .where(eq(transportProducts.id, id))
    .limit(1);
  if (!rows[0]) return null;

  const [details] = await loadDetails(db, rows);
  return details;
}

export type PricingPackageInput = {
  name: LocalizedString;
  type: TransportPricingPackage["type"];
  durationHours?: number | null;
  coveredAreas?: string[];
  price: number;
  currency: TransportPricingPackage["currency"];
  sortOrder: number;
};

export type ExtraChargeInput = {
  name: LocalizedString;
  type: TransportExtraCharge["type"];
  price: number;
  currency: TransportExtraCharge["currency"];
  unit?: string | null;
  sortOrder: number;
};

export type TransportProductInput = {
  code: string;
  title: LocalizedString;
  slug: string;
  category: TransportCategory;
  capacity: number;
  capacityUnit: string;
  description?: LocalizedString | null;
  featuredImage?: string | null;
  images?: string[];
  includedServices?: TransportServiceType[];
  isActive?: number;
  pricingPackages: PricingPackageInput[];
  extraCharges: ExtraChargeInput[];
};

const now = () => Math.floor(Date.now() / 1000);

function insertChildren(
  db: Db,
  productId: number,
  data: TransportProductInput
) {
  return Promise.all([
    ...data.pricingPackages.map((p) =>
      db.insert(transportPricingPackages).values({
        productId,
        name: p.name,
        type: p.type,
        durationHours: p.durationHours || null,
        coveredAreas: p.coveredAreas ?? [],
        price: p.price,
        currency: p.currency,
        sortOrder: p.sortOrder,
      })
    ),
    ...data.extraCharges.map((e) =>
      db.insert(transportExtraCharges).values({
        productId,
        name: e.name,
        type: e.type,
        price: e.price,
        currency: e.currency,
        unit: e.unit || null,
        sortOrder: e.sortOrder,
      })
    ),
  ]);
}

export async function createTransportProduct(
  data: TransportProductInput
): Promise<TransportProduct> {
  const db = getDb();
  const rows = await db
    .insert(transportProducts)
    .values({
      code: data.code,
      title: data.title,
      slug: data.slug,
      category: data.category,
      capacity: data.capacity,
      capacityUnit: data.capacityUnit || "Seaters",
      description: data.description || null,
      featuredImage: data.featuredImage || null,
      images: data.images ?? [],
      includedServices: data.includedServices ?? [],
      isActive: data.isActive ?? 1,
      createdAt: now(),
      updatedAt: now(),
    })
    .returning();

  const product = rows[0];
  await insertChildren(db, product.id, data);
  return product;
}

export async function updateTransportProduct(
  id: number,
  data: TransportProductInput
): Promise<TransportProduct | null> {
  const db = getDb();
  const existing = await getTransportProductById(id);
  if (!existing) return null;

  // Replace children: drop old pricing/extras first, then insert the new set.
  // Done sequentially (not `db.transaction`) so the same code path works on
  // both D1 (async) and better-sqlite3 (sync) drivers. On failure the admin
  // sees an error and can retry; worst case the product keeps its header row.
  await db
    .delete(transportPricingPackages)
    .where(eq(transportPricingPackages.productId, id));
  await db
    .delete(transportExtraCharges)
    .where(eq(transportExtraCharges.productId, id));

  const rows = await db
    .update(transportProducts)
    .set({
      code: data.code,
      title: data.title,
      slug: data.slug,
      category: data.category,
      capacity: data.capacity,
      capacityUnit: data.capacityUnit || "Seaters",
      description: data.description || null,
      featuredImage: data.featuredImage || null,
      images: data.images ?? [],
      includedServices: data.includedServices ?? [],
      isActive: data.isActive ?? existing.isActive,
      updatedAt: now(),
    })
    .where(eq(transportProducts.id, id))
    .returning();

  const updated = rows[0];
  await insertChildren(db, id, data);
  return updated ?? null;
}

export async function deleteTransportProduct(id: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(transportProducts)
    .where(eq(transportProducts.id, id))
    .returning({ id: transportProducts.id });
  return rows.length > 0;
}

export async function toggleTransportProductActive(
  id: number
): Promise<TransportProduct | null> {
  const db = getDb();
  const existing = await db
    .select()
    .from(transportProducts)
    .where(eq(transportProducts.id, id))
    .limit(1);
  if (!existing[0]) return null;

  const rows = await db
    .update(transportProducts)
    .set({
      isActive: existing[0].isActive === 1 ? 0 : 1,
      updatedAt: now(),
    })
    .where(eq(transportProducts.id, id))
    .returning();
  return rows[0] ?? null;
}
