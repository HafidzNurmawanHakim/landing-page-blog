import { headers } from "next/headers";
import { env } from "../env";

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Suitable for a single-instance deployment (OpenNext on Cloudflare Workers,
 * local dev). For multi-region/multi-instance scale, swap the backing store
 * for Cloudflare KV/Durable Object counters — the interface stays the same.
 *
 * NOTE: per docs/09-non-functional.md, `createBooking` is limited to
 * max 10/min per IP. Configurable via env RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS.
 */

type Bucket = { timestamps: number[] };

const store = new Map<string, Bucket>();

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  max = env.RATE_LIMIT_MAX,
  windowMs = env.RATE_LIMIT_WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key) ?? { timestamps: [] };

  // Drop expired timestamps
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= max) {
    const oldest = bucket.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, bucket);
    return { ok: false, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);
  return { ok: true, remaining: max - bucket.timestamps.length };
}

/** Reads the client IP from headers; falls back to "unknown". */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}
