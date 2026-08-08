import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb } from "../db/client";
import { rateLimits } from "../db/schema";
import { env } from "../env";

/**
 * Sliding-window rate limiter backed by D1 (table `rate_limits`).
 *
 * Persisting counters in the database (instead of in-memory) keeps the limit
 * effective across serverless instances — see docs/09-non-functional.md.
 *
 * NOTE: `createBooking` is limited to max 10/min per IP, and `loginAdmin` to
 * 5/min. Configurable via env RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS.
 */

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

async function persist(
  key: string,
  timestamps: number[],
  now: number
): Promise<void> {
  const db = getDb();
  const updatedAt = Math.floor(now / 1000);
  await db
    .insert(rateLimits)
    .values({ key, timestamps, updatedAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { timestamps, updatedAt },
    });
}

export async function checkRateLimit(
  key: string,
  max = env.RATE_LIMIT_MAX,
  windowMs = env.RATE_LIMIT_WINDOW_MS
): Promise<RateLimitResult> {
  const db = getDb();
  const now = Date.now();

  const rows = await db
    .select({ timestamps: rateLimits.timestamps })
    .from(rateLimits)
    .where(eq(rateLimits.key, key))
    .limit(1);

  let timestamps = rows[0]?.timestamps ?? [];
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= max) {
    const oldest = timestamps[0] ?? now;
    await persist(key, timestamps, now);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  timestamps.push(now);
  await persist(key, timestamps, now);
  return { ok: true, remaining: max - timestamps.length };
}

/**
 * Reads the client IP. `cf-connecting-ip` is set by Cloudflare and cannot be
 * spoofed by clients; other headers fall back for local development.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const cf = headerStore.get("cf-connecting-ip");
  if (cf) return cf;
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return headerStore.get("x-real-ip") || "unknown";
}
