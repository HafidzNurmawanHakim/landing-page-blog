import type { Package } from "./schema";

/**
 * Initial catalog seeded on first run. Matches the sample data documented in
 * docs/11-appendix.md and the marketing pages.
 *
 * Localized fields (docs/06-i18n.md) are stored as `{ id, ms, en, zh }`
 * objects. Missing locales fall back to `id` at render time, so partial
 * translations are safe.
 */
type SeedPackage = Omit<
  Package,
  "id" | "createdAt" | "updatedAt" | "isActive"
> & { isActive?: number };

const L = {
  id: { id: "Batam 3 Hari 2 Malam", ms: "Batam 3 Hari 2 Malam", en: "Batam 3 Days 2 Nights", zh: "巴淡 3 天 2 夜" },
  city: { id: "City Tour & Barelang", ms: "City Tour & Barelang", en: "City Tour & Barelang", zh: "城市观光与巴兰桥" },
  transfer: { id: "Airport Transfer", ms: "Airport Transfer", en: "Airport Transfer", zh: "机场接送" },
  eco: { id: "Eco Stay Resort", ms: "Eco Stay Resort", en: "Eco Stay Resort", zh: "生态度假村" },
} as const;

export const seedPackages: SeedPackage[] = [
  {
    code: "BATAM-3D2N",
    name: L.id,
    slug: "batam-3d2n",
    category: "tour",
    duration: "3D2N",
    price: 1_850_000,
    description: {
      id: "Paket lengkap wisata Batam: akomodasi, makan, transport lokal, dan tur ke destinasi populer.",
      ms: "Pakej lengkap pelancongan Batam: penginapan, makanan, pengangkutan tempatan, dan lawatan ke destinasi popular.",
      en: "Complete Batam tour package: accommodation, meals, local transport, and tours to popular destinations.",
      zh: "完整的巴淡岛旅游套餐：住宿、餐饮、当地交通以及热门景点游览。",
    },
    itinerary: {
      id: [
        "Hari 1: Penjemputan dari pelabuhan/bandara, check-in hotel",
        "Hari 2: City tour Nagoya, Wisata Kuliner, Belanja",
        "Hari 3: Sarapan, check-out, antar ke pelabuhan/bandara",
      ],
      en: [
        "Day 1: Pickup from ferry terminal/airport, hotel check-in",
        "Day 2: Nagoya city tour, culinary tour, shopping",
        "Day 3: Breakfast, check-out, drop off at ferry terminal/airport",
      ],
    },
    includes: {
      id: ["Hotel 2 malam", "Makan sesuai itinerary", "Transport lokal AC", "Guide lokal"],
      en: ["2 nights hotel", "Meals as per itinerary", "Air-conditioned local transport", "Local guide"],
    },
    excludes: {
      id: ["Tiket ferry / pesawat", "Pengeluaran pribadi", "Tip guide"],
      en: ["Ferry / flight tickets", "Personal expenses", "Guide tips"],
    },
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    imageAlt: L.id,
    isActive: 1,
  },
  {
    code: "BATAM-CITY-TOUR",
    name: L.city,
    slug: "batam-city-tour",
    category: "tour",
    duration: "1D",
    price: 450_000,
    description: {
      id: "Tur satu hari menjelajahi ikon Kota Batam: Jembatan Barelang dan Vihara Maha Vihara.",
      ms: "Lawatan sehari meneroka ikon Bandar Batam: Jambatan Barelang dan Maha Vihara.",
      en: "A one-day tour exploring Batam's icons: Barelang Bridge and Maha Vihara.",
      zh: "一日游探索巴淡岛地标：巴兰桥和大雄宝殿。",
    },
    itinerary: {
      id: [
        "08:00 Penjemputan di hotel",
        "10:00 Jembatan Barelang 1-6",
        "14:00 Maha Vihara Duta Maitreya",
        "17:00 Kembali ke hotel",
      ],
      en: [
        "08:00 Hotel pickup",
        "10:00 Barelang Bridge 1-6",
        "14:00 Maha Vihara Duta Maitreya",
        "17:00 Return to hotel",
      ],
    },
    includes: {
      id: ["Transport lokal AC", "Guide lokal", "Air mineral"],
      en: ["Air-conditioned local transport", "Local guide", "Mineral water"],
    },
    excludes: {
      id: ["Tiket masuk objek wisata", "Makan siang"],
      en: ["Attraction entrance tickets", "Lunch"],
    },
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop",
    imageAlt: L.city,
    isActive: 1,
  },
  {
    code: "BATAM-TRANSFER",
    name: L.transfer,
    slug: "batam-transfer",
    category: "transport",
    duration: "Flexible",
    price: 250_000,
    description: {
      id: "Layanan antar-jemput bandara Hang Nadim ke seluruh area Batam dengan armada nyaman.",
      ms: "Perkhidmatan jemputan dan hantaran lapangan terbang Hang Nadim ke seluruh kawasan Batam dengan armada selesa.",
      en: "Hang Nadim airport pickup and drop-off across Batam with comfortable vehicles.",
      zh: "汉纳丁机场接送服务，覆盖巴淡岛全境，车队舒适。",
    },
    itinerary: {
      id: [
        "Penjemputan dari Hang Nadim Airport",
        "Antar ke tujuan di Batam (Nagoya, Batam Center, dll)",
      ],
      en: [
        "Pickup from Hang Nadim Airport",
        "Drop off anywhere in Batam (Nagoya, Batam Center, etc.)",
      ],
    },
    includes: {
      id: ["Armada AC", "Driver berpengalaman", "Bensin / tol"],
      en: ["Air-conditioned vehicle", "Experienced driver", "Fuel / toll"],
    },
    excludes: {
      id: ["Tiket pesawat", "Parkir tambahan"],
      en: ["Flight tickets", "Extra parking"],
    },
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
    imageAlt: L.transfer,
    isActive: 1,
  },
  {
    code: "BATAM-ECO-STAY",
    name: L.eco,
    slug: "batam-eco-stay",
    category: "hotel",
    duration: "2D1N",
    price: 980_000,
    description: {
      id: "Penginapan resort dengan nuansa alam di kawasan Turi Beach, cocok untuk relaksasi.",
      ms: "Penginapan resort bernuansa alam di kawasan Turi Beach, sesuai untuk relaksasi.",
      en: "A nature-themed resort stay in the Turi Beach area, perfect for relaxing.",
      zh: "图里海滩地区的自然风度假村住宿，非常适合放松。",
    },
    itinerary: {
      id: [
        "Check-in dan berenang di private beach",
        "BBQ malam dan santai",
        "Check-out sore hari",
      ],
      en: [
        "Check-in and swim at the private beach",
        "Evening BBQ and leisure",
        "Afternoon check-out",
      ],
    },
    includes: {
      id: ["Kamar resort 1 malam", "Sarapan 2x", "Akses fasilitas resort"],
      en: ["1 night resort room", "Breakfast x2", "Resort facility access"],
    },
    excludes: {
      id: ["Transport", "Makan siang", "Spa / extra"],
      en: ["Transport", "Lunch", "Spa / extras"],
    },
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    imageAlt: L.eco,
    isActive: 1,
  },
];
