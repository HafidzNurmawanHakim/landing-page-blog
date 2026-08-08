import { asc, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../client";
import { testimonials, type Testimonial } from "../schema";
import type { LocalizedString } from "@/lib/i18n/locales";

export type TestimonialListResult = {
  items: Testimonial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TestimonialFilters = {
  page?: number;
  limit?: number;
  activeOnly?: boolean;
};

export function serializeTestimonial(row: Testimonial) {
  return {
    ...row,
    role: row.role ?? {},
    comment: row.comment ?? {},
  };
}

export type SerializedTestimonial = Omit<
  Testimonial,
  "role" | "comment"
> & {
  role: LocalizedString;
  comment: LocalizedString;
};

export async function listTestimonials(
  filters: TestimonialFilters = {}
): Promise<TestimonialListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 24));
  const offset = (page - 1) * limit;
  const where = filters.activeOnly
    ? eq(testimonials.isActive, 1)
    : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(testimonials)
      .where(where)
      .orderBy(asc(testimonials.sortOrder), desc(testimonials.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(testimonials).where(where),
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  return {
    items: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTestimonialById(
  id: number
): Promise<Testimonial | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export type TestimonialInput = {
  name: string;
  role?: LocalizedString | null;
  comment: LocalizedString;
  rating: number;
  avatarUrl?: string | null;
  isActive: number;
  sortOrder: number;
};

export async function createTestimonial(
  data: TestimonialInput
): Promise<Testimonial> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const rows = await db
    .insert(testimonials)
    .values({
      name: data.name,
      role: data.role ?? {},
      comment: data.comment,
      rating: data.rating,
      avatarUrl: data.avatarUrl || null,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return rows[0];
}

export async function updateTestimonial(
  id: number,
  data: TestimonialInput
): Promise<Testimonial | null> {
  const db = getDb();
  const existing = await getTestimonialById(id);
  if (!existing) return null;

  const rows = await db
    .update(testimonials)
    .set({
      name: data.name,
      role: data.role ?? {},
      comment: data.comment,
      rating: data.rating,
      avatarUrl: data.avatarUrl || null,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(testimonials.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteTestimonial(id: number): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .delete(testimonials)
    .where(eq(testimonials.id, id))
    .returning({ id: testimonials.id });
  return rows.length > 0;
}
