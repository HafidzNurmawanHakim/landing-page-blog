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
    itemType: text("item_type").notNull().default("tour"),
    bookingOptions: text("booking_options", { mode: "json" }).$type<BookingOptions>(),
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

/** A single social link pair stored on site_config.social. */
export type SiteConfigSocialLink = {
  label: string;
  href: string;
};

/** A WhatsApp contact (label + number) stored on site_config.whatsapp_number. */
export type SiteConfigWhatsApp = {
  label: string;
  number: string;
};

/**
 * Single-row (id = 1) runtime site configuration. Source of truth for
 * contact info, social links, WhatsApp admin number and the notification
 * admin email (admin page `/admin/config`). Empty/null cells fall back to the
 * static defaults in `lib/config/site.ts`.
 */
export const siteConfigTable = sqliteTable("site_config", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contactPhone: text("contact_phone"),
  contactPhoneDisplay: text("contact_phone_display"),
  contactEmail: text("contact_email"),
  whatsappNumber: text("whatsapp_number"),
  adminEmail: text("admin_email"),
  address: text("address", { mode: "json" }).$type<LocalizedString>(),
  hoursWeekday: text("hours_weekday", { mode: "json" }).$type<LocalizedString>(),
  hoursTime: text("hours_time", { mode: "json" }).$type<LocalizedString>(),
  social: text("social", { mode: "json" }).$type<SiteConfigSocialLink[]>(),
  updatedAt: integer("updated_at"),
});

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

/**
 * Blog feature (docs/13-blog.md). Content is stored as sanitized HTML
 * (written via the TipTap editor, mirrored from podzy-manager). Categories are
 * a flat table; tags are a JSON array on the post for MVP simplicity.
 */
export const blogCategories = sqliteTable("blog_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { mode: "json" }).$type<LocalizedString>().notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description", { mode: "json" }).$type<LocalizedString>(),
  createdAt: integer("created_at").default(sql`(unixepoch())`),
  updatedAt: integer("updated_at").default(sql`(unixepoch())`),
});

export const blogPosts = sqliteTable(
  "blog_posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title", { mode: "json" }).$type<LocalizedString>().notNull(),
    slug: text("slug").notNull().unique(),
    excerpt: text("excerpt", { mode: "json" }).$type<LocalizedString>(),
    content: text("content", { mode: "json" }).$type<LocalizedString>().notNull(),
    contentType: text("content_type").notNull().default("html"), // 'html' | 'markdown'
    featuredImageUrl: text("featured_image_url"),
    featuredImageAlt: text("featured_image_alt", { mode: "json" }).$type<LocalizedString>(),
    categoryId: integer("category_id"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default([]),
    status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'archived'
    publishedAt: integer("published_at"),
    seoTitle: text("seo_title", { mode: "json" }).$type<LocalizedString>(),
    seoDescription: text("seo_description", { mode: "json" }).$type<LocalizedString>(),
    ogImageUrl: text("og_image_url"),
    canonicalUrl: text("canonical_url"),
    noindex: integer("noindex").notNull().default(0),
    authorId: integer("author_id"),
    readingTime: integer("reading_time").notNull().default(1),
    viewCount: integer("view_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    createdAt: integer("created_at").default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").default(sql`(unixepoch())`),
  },
  (t) => [
    index("idx_blog_posts_status_published").on(t.status, t.publishedAt),
    index("idx_blog_posts_category").on(t.categoryId),
    index("idx_blog_posts_created_at").on(t.createdAt),
  ]
);

/**
 * Per-IP reactions on blog posts (like / share). Same uniqueness model as
 * `gallery_reactions` (docs/09-non-functional.md): a visitor can like / count
 * a share at most once per post. `like_count` / `share_count` on `blog_posts`
 * are denormalized counters for O(1) reads.
 */
export const blogPostReactions = sqliteTable(
  "blog_post_reactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id").notNull(),
    ip: text("ip").notNull(),
    type: text("type").notNull().default("like"), // 'like' | 'share'
    createdAt: integer("created_at").default(sql`(unixepoch())`),
  },
  (t) => [
    uniqueIndex("idx_blog_reactions_post_ip_type").on(
      t.postId,
      t.ip,
      t.type
    ),
    index("idx_blog_reactions_post_type").on(t.postId, t.type),
  ]
);

/**
 * Transport / vehicle rental products (docs/15-transport-product.md).
 *
 * Unlike `packages` (flat single price), a transport product carries multiple
 * pricing packages (HOURLY / ONE_WAY) and optional extra charges. Pricing and
 * extras live in child tables with a cascade FK so a deleted product cleans up
 * after itself.
 */
export const transportProducts = sqliteTable(
  "transport_products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    code: text("code").notNull().unique(),
    title: text("title", { mode: "json" }).$type<LocalizedString>().notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    capacity: integer("capacity").notNull().default(0),
    capacityUnit: text("capacity_unit").notNull().default("Seaters"),
    description: text("description", { mode: "json" }).$type<LocalizedString>(),
    featuredImage: text("featured_image"),
    images: text("images", { mode: "json" }).$type<string[]>().notNull().default([]),
    includedServices: text("included_services", { mode: "json" })
      .$type<TransportServiceType[]>()
      .notNull()
      .default([]),
    isActive: integer("is_active").notNull().default(1),
    createdAt: integer("created_at").default(sql`(unixepoch())`),
    updatedAt: integer("updated_at").default(sql`(unixepoch())`),
  },
  (t) => [index("idx_transport_products_active").on(t.isActive)]
);

export const transportPricingPackages = sqliteTable(
  "transport_pricing_packages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => transportProducts.id, { onDelete: "cascade" }),
    name: text("name", { mode: "json" }).$type<LocalizedString>().notNull(),
    type: text("type").notNull(),
    durationHours: integer("duration_hours"),
    coveredAreas: text("covered_areas", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default([]),
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("SGD"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [
    index("idx_transport_pricing_product").on(t.productId),
    index("idx_transport_pricing_price").on(t.productId, t.price),
  ]
);

export const transportExtraCharges = sqliteTable(
  "transport_extra_charges",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productId: integer("product_id")
      .notNull()
      .references(() => transportProducts.id, { onDelete: "cascade" }),
    name: text("name", { mode: "json" }).$type<LocalizedString>().notNull(),
    type: text("type").notNull(),
    price: integer("price").notNull(),
    currency: text("currency").notNull().default("SGD"),
    unit: text("unit"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("idx_transport_extra_product").on(t.productId)]
);

export type Package = typeof packages.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type GalleryItem = typeof galleryItems.$inferSelect;
export type GalleryReaction = typeof galleryReactions.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type BlogPostReaction = typeof blogPostReactions.$inferSelect;
export type TransportProduct = typeof transportProducts.$inferSelect;
export type TransportPricingPackage = typeof transportPricingPackages.$inferSelect;
export type TransportExtraCharge = typeof transportExtraCharges.$inferSelect;

export const CURRENCIES = ["SGD", "IDR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const TRANSPORT_CATEGORIES = [
  "MPV",
  "MINI_VAN",
  "MINI_BUS",
  "SUV",
  "SEDAN",
  "VAN",
  "BUS",
] as const;
export type TransportCategory = (typeof TRANSPORT_CATEGORIES)[number];

export const TRANSPORT_SERVICE_TYPES = [
  "DRIVER_ONLY",
  "DRIVER_AND_GUIDE",
  "SELF_DRIVE",
] as const;
export type TransportServiceType = (typeof TRANSPORT_SERVICE_TYPES)[number];

export const PRICING_PACKAGE_TYPES = ["HOURLY", "ONE_WAY"] as const;
export type PricingPackageType = (typeof PRICING_PACKAGE_TYPES)[number];

export const EXTRA_CHARGE_TYPES = ["LOCATION_SURCHARGE", "EXTRA_HOUR"] as const;
export type ExtraChargeType = (typeof EXTRA_CHARGE_TYPES)[number];

export type BookingItemType = "tour" | "transport" | "hotel";

/** Type-specific options stored on a transport booking (docs/15-transport-product.md §15.6). */
export type TransportBookingOptions = {
  pricingPackageId: number;
  pricingPackageName: string;
  price: number;
  currency: Currency;
  extraCharges: {
    id: number;
    name: string;
    price: number;
    currency: Currency;
    unit?: string;
  }[];
  extraTotal: number;
  vehicleQty: number;
  pickupLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffLocation?: string;
};

export type BookingOptions = TransportBookingOptions;
