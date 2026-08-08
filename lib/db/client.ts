import { drizzle as drizzleD1, type DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleLocal } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

/**
 * The async SQLite database type is the single type used across the app.
 *
 * Both D1 (Cloudflare) and better-sqlite3 (local dev) share the same Drizzle
 * query-builder API, so all repository code is written against the async
 * interface. The local driver is sync under the hood, but `await`-ing its
 * results is harmless and keeps one code path.
 */
export type Db = DrizzleD1Database<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __drizzleLocal: Db | undefined;
  // eslint-disable-next-line no-var
  var __drizzleD1: Db | undefined;
}

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LOCAL_DB_DIR = join(ROOT_DIR, "data");
const LOCAL_DB_FILE = join(LOCAL_DB_DIR, "destitour.db");
const MIGRATIONS_DIR = join(ROOT_DIR, "drizzle");

function createLocalDb(): Db {
  mkdirSync(LOCAL_DB_DIR, { recursive: true });
  const sqlite = new Database(LOCAL_DB_FILE);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzleLocal(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  // Cast sync driver to the async type — identical builder API.
  return db as unknown as Db;
}

/**
 * Factory database accessor.
 *
 * - Production (Cloudflare Workers): reads the injected `DB` D1 binding.
 * - Local development: file-backed SQLite (better-sqlite3), auto-migrated on
 *   first access.
 */
export function getDb(): Db {
  // 1) Cloudflare Workers / production: D1 binding (name `DB`) via OpenNext.
  try {
    const d1 = getCloudflareContext().env.DB;
    if (d1) {
      if (!globalThis.__drizzleD1) {
        globalThis.__drizzleD1 = drizzleD1(d1, { schema });
      }
      return globalThis.__drizzleD1;
    }
  } catch {
    // Not running inside a Cloudflare Worker (next dev / scripts) → fall through.
  }

  // 2) Local SQLite fallback (dev server / scripts)
  if (!globalThis.__drizzleLocal) {
    globalThis.__drizzleLocal = createLocalDb();
  }
  return globalThis.__drizzleLocal!;
}

export { schema };
