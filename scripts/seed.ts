/**
 * DB seed script. Run with: npm run db:seed
 *
 * - Ensures the local SQLite DB is migrated (client auto-migrates).
 * - Inserts packages if the table is empty.
 * - Inserts the default admin if none exist, hashing the password from env
 *   (ADMIN_PASSWORD_HASH if provided, else a dev default).
 */

import { getDb } from "../lib/db/client";
import {
  packages,
  admins,
  bookings,
  galleryItems,
  testimonials,
  transportProducts,
} from "../lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  seedPackages,
  seedGalleryItems,
  seedTestimonials,
  seedTransportProducts,
} from "../lib/db/seed";
import { createTransportProduct } from "../lib/db/repositories/transport";
import { hashPassword } from "../lib/auth/password";
import { env } from "../lib/env";

async function seed() {
  console.log("🌱 Seeding database...");
  const db = getDb();

  // --- Packages ---
  const existingPackages = await db
    .select({ count: sql<number>`count(*)` })
    .from(packages);
  if (Number(existingPackages[0]?.count ?? 0) === 0) {
    await db.insert(packages).values(seedPackages);
    console.log(`✅ Inserted ${seedPackages.length} packages`);
  } else {
    console.log("ℹ️  Packages already present, skipping");
  }

  // --- Transport products ---
  const existingTransport = await db
    .select({ count: sql<number>`count(*)` })
    .from(transportProducts);
  if (Number(existingTransport[0]?.count ?? 0) === 0) {
    const now = Math.floor(Date.now() / 1000);
    for (const item of seedTransportProducts) {
      await createTransportProduct({
        code: item.code,
        title: item.title,
        slug: item.slug,
        category: item.category as never,
        capacity: item.capacity,
        capacityUnit: item.capacityUnit,
        description: item.description ?? null,
        featuredImage: item.featuredImage ?? null,
        images: item.images ?? [],
        includedServices: item.includedServices as never,
        isActive: item.isActive ?? 1,
        pricingPackages: item.pricingPackages.map((p, index) => ({
          name: p.name,
          type: p.type,
          durationHours: p.durationHours ?? null,
          coveredAreas: p.coveredAreas ?? [],
          price: p.price,
          currency: p.currency as never,
          sortOrder: index,
        })),
        extraCharges: item.extraCharges.map((e, index) => ({
          name: e.name,
          type: e.type,
          price: e.price,
          currency: e.currency as never,
          unit: e.unit ?? null,
          sortOrder: index,
        })),
      });
    }
    console.log(
      `✅ Inserted ${seedTransportProducts.length} transport products (created_at=${now})`
    );
  } else {
    console.log("ℹ️  Transport products already present, skipping");
  }

  // --- Admin ---
  const existingAdmins = await db
    .select({ count: sql<number>`count(*)` })
    .from(admins);
  if (Number(existingAdmins[0]?.count ?? 0) === 0) {
    let passwordHash = env.ADMIN_PASSWORD_HASH;
    if (!passwordHash) {
      if (env.NODE_ENV === "production") {
        console.error(
          "❌ Production seed: set ADMIN_PASSWORD_HASH (pbkdf2 hash) to seed the admin."
        );
        process.exit(1);
      }
      passwordHash = await hashPassword("admin123");
    }
    await db
      .insert(admins)
      .values({
        email: env.ADMIN_EMAIL,
        passwordHash,
        name: "Admin",
      })
      .onConflictDoNothing();
    console.log(`✅ Inserted admin ${env.ADMIN_EMAIL}`);
  } else {
    console.log("ℹ️  Admins already present, skipping");
  }

  // --- Sample bookings (dev only) so dashboard has data ---
  if (env.NODE_ENV !== "production") {
    const existingBookings = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings);
    if (Number(existingBookings[0]?.count ?? 0) === 0) {
      const now = Math.floor(Date.now() / 1000);
      const sample = [
        {
          bookingCode: "BT-20260805-001",
          packageCode: "BATAM-3D2N",
          packageName: "Batam 3 Hari 2 Malam",
          customerName: "Budi Santoso",
          phone: "08123456789",
          email: "budi@example.com",
          departureDate: "2026-08-12",
          returnDate: "2026-08-14",
          participants: 4,
          notes: "Minta hotel dekat pusat kota",
          status: "pending",
        },
        {
          bookingCode: "BT-20260805-002",
          packageCode: "BATAM-CITY-TOUR",
          packageName: "City Tour & Barelang",
          customerName: "Siti Aminah",
          phone: "082233445566",
          email: "siti@example.com",
          departureDate: "2026-08-16",
          returnDate: "2026-08-16",
          participants: 2,
          status: "confirmed",
        },
        {
          bookingCode: "BT-20260804-003",
          packageCode: "BATAM-ECO-STAY",
          packageName: "Eco Stay Resort",
          customerName: "John Tan",
          phone: "+6588112233",
          email: "john.tan@example.com",
          departureDate: "2026-08-20",
          returnDate: "2026-08-21",
          participants: 2,
          status: "cancelled",
        },
      ];
      await db.insert(bookings).values(
        sample.map((s) => ({ ...s, createdAt: now, updatedAt: now }))
      );
      console.log(`✅ Inserted ${sample.length} sample bookings`);
    }
  }

  // --- Gallery ---
  const existingGallery = await db
    .select({ count: sql<number>`count(*)` })
    .from(galleryItems);
  if (Number(existingGallery[0]?.count ?? 0) === 0) {
    const now = Math.floor(Date.now() / 1000);
    await db.insert(galleryItems).values(
      seedGalleryItems.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
    console.log(`✅ Inserted ${seedGalleryItems.length} gallery items`);
  } else {
    console.log("ℹ️  Gallery items already present, skipping");
  }

  // --- Testimonials ---
  const existingTestimonials = await db
    .select({ count: sql<number>`count(*)` })
    .from(testimonials);
  if (Number(existingTestimonials[0]?.count ?? 0) === 0) {
    const now = Math.floor(Date.now() / 1000);
    await db.insert(testimonials).values(
      seedTestimonials.map((item) => ({ ...item, createdAt: now, updatedAt: now }))
    );
    console.log(`✅ Inserted ${seedTestimonials.length} testimonials`);
  } else {
    console.log("ℹ️  Testimonials already present, skipping");
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

export {};
