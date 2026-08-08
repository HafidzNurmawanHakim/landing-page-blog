import type { Package } from "./schema";

/**
 * Initial catalog seeded on first run. Matches the sample data documented in
 * docs/11-appendix.md and the marketing pages.
 *
 * `itinerary`, `includes`, `excludes` are stored via drizzle `mode: "json"`
 * (serialized as TEXT in SQLite, decoded to arrays on read).
 */

type SeedPackage = Omit<
  Package,
  "id" | "createdAt" | "updatedAt" | "isActive"
> & { isActive?: number };

export const seedPackages: SeedPackage[] = [
  {
    code: "BATAM-3D2N",
    name: "Batam 3 Hari 2 Malam",
    slug: "batam-3d2n",
    category: "tour",
    duration: "3D2N",
    price: 1_850_000,
    description:
      "Paket lengkap wisata Batam: akomodasi, makan, transport lokal, dan tur ke destinasi populer.",
    itinerary: [
      "Hari 1: Penjemputan dari pelabuhan/bandara, check-in hotel",
      "Hari 2: City tour Nagoya, Wisata Kuliner, Belanja",
      "Hari 3: Sarapan, check-out, antar ke pelabuhan/bandara",
    ],
    includes: [
      "Hotel 2 malam",
      "Makan sesuai itinerary",
      "Transport lokal AC",
      "Guide lokal",
    ],
    excludes: ["Tiket ferry / pesawat", "Pengeluaran pribadi", "Tip guide"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Batam 3 Hari 2 Malam",
    isActive: 1,
  },
  {
    code: "BATAM-CITY-TOUR",
    name: "City Tour & Barelang",
    slug: "batam-city-tour",
    category: "tour",
    duration: "1D",
    price: 450_000,
    description:
      "Tur satu hari menjelajahi ikon Kota Batam: Jembatan Barelang dan Vihara Maha Vihara.",
    itinerary: [
      "08:00 Penjemputan di hotel",
      "10:00 Jembatan Barelang 1-6",
      "14:00 Maha Vihara Duta Maitreya",
      "17:00 Kembali ke hotel",
    ],
    includes: ["Transport lokal AC", "Guide lokal", "Air mineral"],
    excludes: ["Tiket masuk objek wisata", "Makan siang"],
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "City Tour & Barelang",
    isActive: 1,
  },
  {
    code: "BATAM-TRANSFER",
    name: "Airport Transfer",
    slug: "batam-transfer",
    category: "transport",
    duration: "Flexible",
    price: 250_000,
    description:
      "Layanan antar-jemput bandara Hang Nadim ke seluruh area Batam dengan armada nyaman.",
    itinerary: [
      "Penjemputan dari Hang Nadim Airport",
      "Antar ke tujuan di Batam (Nagoya, Batam Center, dll)",
    ],
    includes: ["Armada AC", "Driver berpengalaman", "Bensin / tol"],
    excludes: ["Tiket pesawat", "Parkir tambahan"],
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Airport Transfer",
    isActive: 1,
  },
  {
    code: "BATAM-ECO-STAY",
    name: "Eco Stay Resort",
    slug: "batam-eco-stay",
    category: "hotel",
    duration: "2D1N",
    price: 980_000,
    description:
      "Penginapan resort dengan nuansa alam di kawasan Turi Beach, cocok untuk relaksasi.",
    itinerary: [
      "Check-in dan berenang di private beach",
      "BBQ malam dan santai",
      "Check-out sore hari",
    ],
    includes: ["Kamar resort 1 malam", "Sarapan 2x", "Akses fasilitas resort"],
    excludes: ["Transport", "Makan siang", "Spa / extra"],
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    imageAlt: "Eco Stay Resort",
    isActive: 1,
  },
];
