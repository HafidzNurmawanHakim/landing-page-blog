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

/**
 * Initial gallery photos seeded on first run. Square crops fit the
 * Instagram-style grid best.
 */
export const seedGalleryItems = [
  {
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    caption: {
      id: "Pantai tropis favorit untuk relaksasi",
      en: "Favorite tropical beach for relaxing",
    },
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=800&auto=format&fit=crop",
    caption: {
      id: "Skyline kota saat matahari terbenam",
      en: "City skyline at sunset",
    },
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
    caption: {
      id: "Perjalanan darat seru",
      en: "Scenic road trip",
    },
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
    caption: {
      id: "Penginapan resort dengan nuansa alam",
      en: "Nature-themed resort stay",
    },
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
    caption: {
      id: "Kuliner lokal yang wajib dicoba",
      en: "Must-try local cuisine",
    },
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    caption: {
      id: "Spot foto ikonik",
      en: "Iconic photo spot",
    },
  },
];

/**
 * Initial testimonials seeded on first run. Each comment is a localized
 * object resolved via `pickLocale` (docs/06-i18n.md); `id` is required.
 */
export const seedTestimonials = [
  {
    name: "Budi Santoso",
    role: {
      id: "Tour Batam 3D2N",
      ms: "Tour Batam 3D2N",
      en: "Batam 3D2N Tour",
      zh: "巴淡 3 天 2 夜之旅",
    },
    comment: {
      id: "Bookingnya gampang banget, konfirmasi admin cepat via WhatsApp. Paket lengkap, guide ramah!",
      ms: "Tempahan memang mudah, pengesahan admin pantas melalui WhatsApp. Pakej lengkap, pemandu mesra!",
      en: "Booking was super easy, admin confirmation fast via WhatsApp. Complete package, friendly guide!",
      zh: "预订非常简单，管理员通过 WhatsApp 快速确认。套餐齐全，导游友好！",
    },
    rating: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&auto=format&fit=crop",
    isActive: 1,
    sortOrder: 1,
  },
  {
    name: "Siti Aminah",
    role: {
      id: "City Tour & Barelang",
      ms: "City Tour & Barelang",
      en: "City Tour & Barelang",
      zh: "城市观光与巴兰桥",
    },
    comment: {
      id: "City tour satu hari pas buat yang waktu terbatas. Armada nyaman dan itinerary jelas.",
      ms: "City tour sehari sesuai untuk yang masa terhad. Armada selesa dan itinerary jelas.",
      en: "One-day city tour is perfect for those with limited time. Comfortable fleet and clear itinerary.",
      zh: "一日城市观光非常适合时间有限的人。车队舒适，行程清晰。",
    },
    rating: 4.8,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop",
    isActive: 1,
    sortOrder: 2,
  },
  {
    name: "John Tan",
    role: {
      id: "Airport Transfer",
      ms: "Airport Transfer",
      en: "Airport Transfer",
      zh: "机场接送",
    },
    comment: {
      id: "Penjemputan bandara tepat waktu, driver ramah. Recommended buat yang butuh transport di Batam.",
      ms: "Jemputan lapangan terbang tepat masa, pemandu mesra. Disyorkan untuk yang perlukan pengangkutan di Batam.",
      en: "Airport pickup on time, friendly driver. Recommended for those needing transport in Batam.",
      zh: "机场接机准时，司机友好。推荐给需要在巴淡岛交通的人。",
    },
    rating: 4.9,
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop",
    isActive: 1,
    sortOrder: 3,
  },
  {
    name: "Ethan Parker",
    role: {
      id: "Eco Stay Resort",
      ms: "Eco Stay Resort",
      en: "Eco Stay Resort",
      zh: "生态度假村",
    },
    comment: {
      id: "Suasana resort tenang, cocok banget buat relaksasi. Proses booking aman dan jelas.",
      ms: "Suasana resort tenang, sesuai untuk relaksasi. Proses tempahan selamat dan jelas.",
      en: "Calm resort atmosphere, perfect for relaxing. The booking process is safe and clear.",
      zh: "度假村氛围宁静，非常适合放松。预订过程安全清晰。",
    },
    rating: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&auto=format&fit=crop",
    isActive: 1,
    sortOrder: 4,
  },
  {
    name: "Ava Mitchell",
    role: {
      id: "City Tour & Barelang",
      ms: "City Tour & Barelang",
      en: "City Tour & Barelang",
      zh: "城市观光与巴兰桥",
    },
    comment: {
      id: "Jembatan Barelang sunrise view-nya juara. Guide tau spot foto terbaik.",
      ms: "Pemandangan matahari terbit Jambatan Barelang memang juara. Pemandu tahu spot foto terbaik.",
      en: "Barelang Bridge sunrise view is the best. The guide knows the best photo spots.",
      zh: "巴兰桥的日出景色太棒了。导游知道最好的拍照地点。",
    },
    rating: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop",
    isActive: 1,
    sortOrder: 5,
  },
  {
    name: "Isabella Reed",
    role: {
      id: "Tour Batam 3D2N",
      ms: "Tour Batam 3D2N",
      en: "Batam 3D2N Tour",
      zh: "巴淡 3 天 2 夜之旅",
    },
    comment: {
      id: "Semua beres: hotel, makan, transport. Tinggal jalan aja. Konfirmasi via WA cepat banget.",
      ms: "Semua beres: hotel, makanan, pengangkutan. Tinggal jalan sahaja. Pengesahan melalui WA pantas.",
      en: "Everything handled: hotel, meals, transport. Just show up. WhatsApp confirmation super fast.",
      zh: "一切都安排好了：酒店、餐饮、交通。只管去就行。WhatsApp 确认超快。",
    },
    rating: 4.9,
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    isActive: 1,
    sortOrder: 6,
  },
];
