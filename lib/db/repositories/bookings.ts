import { and, desc, eq, like, ne, or, sql } from "drizzle-orm";
import { getDb } from "../client";
import { bookings, packages, type Booking } from "../schema";

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingFilters = {
  status?: BookingStatus | "all";
  search?: string;
  page?: number;
  limit?: number;
};

export type BookingListResult = {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export function normalizeStatus(value: string | null | undefined) {
  return value && isBookingStatus(value) ? value : "all";
}

export async function listBookings(
  filters: BookingFilters = {}
): Promise<BookingListResult> {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.status && filters.status !== "all") {
    conditions.push(eq(bookings.status, filters.status));
  }
  if (filters.search) {
    const term = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        like(bookings.bookingCode, term),
        like(bookings.customerName, term),
        like(bookings.packageName, term),
        like(bookings.phone, term)
      )!
    );
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(bookings)
      .where(where)
      .orderBy(desc(bookings.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(where),
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

export async function getBookingById(id: number): Promise<Booking | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBookingByCode(code: string): Promise<Booking | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.bookingCode, code))
    .limit(1);
  return rows[0] ?? null;
}

export async function createBookingRecord(data: {
  bookingCode: string;
  packageCode: string;
  packageName: string;
  customerName: string;
  phone: string;
  email?: string;
  departureDate: string;
  returnDate: string;
  participants: number;
  notes?: string;
}): Promise<Booking> {
  const db = getDb();
  const rows = await db
    .insert(bookings)
    .values({
      ...data,
      status: "pending",
    })
    .returning();
  return rows[0];
}

export async function updateBookingStatusRecord(
  id: number,
  status: BookingStatus,
  adminNotes?: string
): Promise<Booking | null> {
  const db = getDb();
  const existing = await getBookingById(id);
  if (!existing) return null;

  const rows = await db
    .update(bookings)
    .set({
      status,
      adminNotes: adminNotes ?? existing.adminNotes,
      updatedAt: Math.floor(Date.now() / 1000),
    })
    .where(eq(bookings.id, id))
    .returning();
  return rows[0] ?? null;
}

export type DashboardStats = {
  totalBookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
  totalPackages: number;
  activePackages: number;
  recentBookings: Booking[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getDb();

  const [countRows, statusRows, revenueRows, packageRows, recent] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(bookings),
      db
        .select({ status: bookings.status, count: sql<number>`count(*)` })
        .from(bookings)
        .groupBy(bookings.status),
      db
        .select({ total: sql<number>`coalesce(sum(${packages.price}), 0)` })
        .from(bookings)
        .leftJoin(packages, eq(bookings.packageCode, packages.code))
        .where(ne(bookings.status, "cancelled")),
      db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`sum(case when ${packages.isActive} = 1 then 1 else 0 end)`,
        })
        .from(packages),
      listBookings({ page: 1, limit: 5 }),
    ]);

  const byStatus = new Map(
    statusRows.map((r) => [r.status, Number(r.count)])
  );
  const pkg = packageRows[0];

  return {
    totalBookings: Number(countRows[0]?.count ?? 0),
    pending: byStatus.get("pending") ?? 0,
    confirmed: byStatus.get("confirmed") ?? 0,
    completed: byStatus.get("completed") ?? 0,
    cancelled: byStatus.get("cancelled") ?? 0,
    revenue: Number(revenueRows[0]?.total ?? 0),
    totalPackages: Number(pkg?.total ?? 0),
    activePackages: Number(pkg?.active ?? 0),
    recentBookings: recent.items,
  };
}
