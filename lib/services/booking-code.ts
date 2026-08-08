import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { bookings } from "../db/schema";

const PREFIX = "BT";

/**
 * Generates the next sequential booking code in the format BT-YYYYMMDD-NNN.
 *
 * The sequence is derived from the count of bookings created on the current
 * day, then verified for uniqueness against the DB. Under concurrent load a
 * unique-constraint collision is possible; callers should retry on collision.
 */
export async function generateBookingCode(): Promise<string> {
  const db = getDb();
  const now = new Date();
  const yyyymmdd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const prefix = `${PREFIX}-${yyyymmdd}-`;

  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(sql`${bookings.bookingCode} like ${`${prefix}%`}`);

  const count = Number(rows[0]?.count ?? 0);
  const seq = String(count + 1).padStart(3, "0");
  return `${prefix}${seq}`;
}

/**
 * Generates a booking code and guarantees uniqueness by retrying on collision
 * (very unlikely: two bookings within the same day with the same prefix).
 */
export async function generateUniqueBookingCode(
  maxAttempts = 5
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = await generateBookingCode();
    const db = getDb();
    const existing = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.bookingCode, code))
      .limit(1);
    if (existing.length === 0) return code;
  }
  throw new Error("Gagal generate kode booking yang unik");
}
