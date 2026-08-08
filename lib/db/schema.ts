import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
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

export const galleryItems = sqliteTable(
  "gallery_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    imageUrl: text("image_url").notNull(),
    caption: text("caption", { mode: "json" }).$type<LocalizedString>(),
    likeCount: integer("like_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    createdAt: integer("created_at").default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").default(sql`(unixepoch())`),
  },
  (t) => [index("idx_gallery_created_at").on(t.createdAt)]
);

/**
 * Per-IP reactions on gallery photos (docs/09-non-functional.md: uniqueness per
 * user is enforced by the unique index `gallery_id + ip + type`, so a visitor
 * can like / count as shared at most once per photo).
 *
 * `like_count` / `share_count` on `gallery_items` are denormalized counters for
 * O(1) reads in the grid; this table is the source of truth for "who reacted".
 */
export const galleryReactions = sqliteTable(
  "gallery_reactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    galleryId: integer("gallery_id").notNull(),
    ip: text("ip").notNull(),
    type: text("type").notNull().default("like"), // 'like' | 'share'
    createdAt: integer("created_at").default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("idx_gallery_reactions_gallery_ip_type").on(
      t.galleryId,
      t.ip,
      t.type
    ),
    index("idx_gallery_reactions_gallery_type").on(t.galleryId, t.type),
  ]
);

export const testimonials = sqliteTable(
  "testimonials",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    role: text("role", { mode: "json" }).$type<LocalizedString>(),
    comment: text("comment", { mode: "json" }).$type<LocalizedString>().notNull(),
    rating: real("rating").notNull().default(5),
    avatarUrl: text("avatar_url"),
    isActive: integer("is_active").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: integer("created_at").default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_testimonials_active_sort").on(t.isActive, t.sortOrder),
    index("idx_testimonials_created_at").on(t.createdAt),
  ]
);

export const admins = sqliteTable("admins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
});

export type Package = typeof packages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type GalleryReaction = typeof galleryReactions.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
