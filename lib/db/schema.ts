import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { LocalizedList, LocalizedString } from "@/lib/i18n/locales";

export const packages = sqliteTable(
  "packages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    name: text("name", { mode: "json" }).$type<LocalizedString>().notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    duration: text("duration"),
    price: integer("price").notNull(),
    description: text("description", { mode: "json" }).$type<LocalizedString>(),
    imageUrl: text("image_url"),
    imageAlt: text("image_alt", { mode: "json" }).$type<LocalizedString>(),
    itinerary: text("itinerary", { mode: "json" }).$type<LocalizedList>(),
    includes: text("includes", { mode: "json" }).$type<LocalizedList>(),
    excludes: text("excludes", { mode: "json" }).$type<LocalizedList>(),
    isActive: integer("is_active").notNull().default(1),
    createdAt: integer("created_at").default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").default(sql`(unixepoch())`),
  }
);

export const bookings = sqliteTable(
  "bookings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookingCode: text("booking_code").notNull().unique(),
    packageCode: text("package_code").notNull(),
    packageName: text("package_name").notNull(),
    locale: text("locale").notNull().default("id"),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    departureDate: text("departure_date").notNull(),
    returnDate: text("return_date").notNull(),
    participants: integer("participants").notNull(),
    notes: text("notes"),
    status: text("status").notNull().default("pending"),
    adminNotes: text("admin_notes"),
    createdAt: integer("created_at").default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_bookings_status").on(t.status),
    index("idx_bookings_created_at").on(t.createdAt),
    index("idx_bookings_package_code").on(t.packageCode),
  ]
);

export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  timestamps: text("timestamps", { mode: "json" }).$type<number[]>().notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

export type Package = typeof packages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
