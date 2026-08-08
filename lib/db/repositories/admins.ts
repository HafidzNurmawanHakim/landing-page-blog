import { eq, sql } from "drizzle-orm";
import { getDb } from "../client";
import { admins } from "../schema";

export async function getAdminByEmail(email: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(admins)
    .where(eq(admins.email, email))
    .limit(1);
  return rows[0] ?? null;
}

export async function createAdmin(data: {
  email: string;
  passwordHash: string;
  name?: string;
}) {
  const db = getDb();
  const rows = await db
    .insert(admins)
    .values(data)
    .onConflictDoNothing({ target: admins.email })
    .returning();
  return rows[0] ?? null;
}

export async function countAdmins() {
  const db = getDb();
  const rows = await db.select({ count: sql<number>`count(*)` }).from(admins);
  return Number(rows[0]?.count ?? 0);
}
