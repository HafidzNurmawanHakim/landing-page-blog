import type { Package } from "./schema";

/**
 * Initial transport products (docs/15-transport-product.md). Prices are stored
 * as integer whole units per currency. Pricing packages + extra charges are
 * inserted alongside each product on first run.
 */
export type SeedTransportProduct = {
  code: string;
  title: { id: string; ms?: string; en?: string; zh?: string };
  slug: string;
  category: string;
  capacity: number;
  capacityUnit: string;
  description?: { id: string; ms?: string; en?: string; zh?: string };
  featuredImage?: string;
  images?: string[];
  includedServices: string[];
  isActive?: number;
  pricingPackages: {
    name: { id: string; ms?: string; en?: string; zh?: string };
    type: "HOURLY" | "ONE_WAY";
    durationHours?: number | null;
    coveredAreas?: string[];
    price: number;
    currency: string;
  }[];
  extraCharges: {
    name: { id: string; ms?: string; en?: string; zh?: string };
    type: "LOCATION_SURCHARGE" | "EXTRA_HOUR";
    price: number;
    currency: string;
    unit?: string;
  }[];
};

export const seedTransportProducts: SeedTransportProduct[] = [
  {
    code: "TR-MPV-6",
    title: {
      id: "MPV 6 Seaters",
      ms: "MPV 6 Tempat Duduk",
      en: "MPV 6 Seaters",
      zh: "MPV 6 座",
    },
    slug: "mpv-6-seaters",
    category: "MPV",
    capacity: 6,
    capacityUnit: "Seaters",
    description: {
      id: "MPV nyaman untuk 6 penumpang, cocok untuk keluarga atau grup kecil. Dilengkapi AC dan driver berpengalaman.",
      en: "Comfortable MPV for 6 passengers, ideal for families or small groups. Air-conditioned with an experienced driver.",
      zh: "舒适 MPV，可容纳 6 名乘客，适合家庭或小团体。配备空调和资深司机。",
    },
    featuredImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
    ],
    includedServices: ["DRIVER_ONLY"],
    isActive: 1,
    pricingPackages: [
      {
        name: {
          id: "10 Hours Usage",
          ms: "Penggunaan 10 Jam",
          en: "10 Hours Usage",
          zh: "10 小时使用",
        },
        type: "HOURLY",
        durationHours: 10,
        coveredAreas: ["Batam Centre", "Nagoya", "Nongsa"],
        price: 100,
        currency: "SGD",
      },
      {
        name: {
          id: "8 Hours Usage",
          ms: "Penggunaan 8 Jam",
          en: "8 Hours Usage",
          zh: "8 小时使用",
        },
        type: "HOURLY",
        durationHours: 8,
        coveredAreas: ["Batam Centre", "Nagoya", "Nongsa"],
        price: 80,
        currency: "SGD",
      },
      {
        name: {
          id: "4 Hours Usage",
          ms: "Penggunaan 4 Jam",
          en: "4 Hours Usage",
          zh: "4 小时使用",
        },
        type: "HOURLY",
        durationHours: 4,
        coveredAreas: ["Batam Centre", "Nagoya"],
        price: 65,
        currency: "SGD",
      },
      {
        name: {
          id: "1 Way Transfer",
          ms: "Pemindahan 1 Hala",
          en: "1 Way Transfer",
          zh: "单程接送",
        },
        type: "ONE_WAY",
        coveredAreas: ["Airport", "Ferry Terminal", "Hotel"],
        price: 35,
        currency: "SGD",
      },
    ],
    extraCharges: [
      {
        name: {
          id: "Additional Charge Enter Barelang",
          ms: "Caj Tambahan Masuk Barelang",
          en: "Additional Charge for Enter Barelang",
          zh: "进入巴兰桥附加费",
        },
        type: "LOCATION_SURCHARGE",
        price: 10,
        currency: "SGD",
        unit: "per entry",
      },
      {
        name: {
          id: "Additional Hour",
          ms: "Jam Tambahan",
          en: "Additional Hour",
          zh: "额外小时",
        },
        type: "EXTRA_HOUR",
        price: 15,
        currency: "SGD",
        unit: "per hour",
      },
    ],
  },
  {
    code: "TR-VAN-13",
    title: {
      id: "Mini Van 13 Seaters",
      ms: "Mini Van 13 Tempat Duduk",
      en: "Mini Van 13 Seaters",
      zh: "小型面包车 13 座",
    },
    slug: "mini-van-13-seaters",
    category: "MINI_VAN",
    capacity: 13,
    capacityUnit: "Seaters",
    description: {
      id: "Mini van untuk 13 penumpang, cocok untuk grup menengah dan antar-jemput rombongan.",
      en: "Mini van for 13 passengers, ideal for mid-size groups and group transfers.",
      zh: "可容纳 13 名乘客的小型面包车，适合中型团体和团体接送。",
    },
    featuredImage: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1489824904134-891ab64532f1?q=80&w=800&auto=format&fit=crop",
    ],
    includedServices: ["DRIVER_ONLY"],
    isActive: 1,
    pricingPackages: [
      {
        name: {
          id: "10 Hours Usage",
          ms: "Penggunaan 10 Jam",
          en: "10 Hours Usage",
          zh: "10 小时使用",
        },
        type: "HOURLY",
        durationHours: 10,
        coveredAreas: ["Batam Centre", "Nagoya", "Nongsa"],
        price: 130,
        currency: "SGD",
      },
      {
        name: {
          id: "8 Hours Usage",
          ms: "Penggunaan 8 Jam",
          en: "8 Hours Usage",
          zh: "8 小时使用",
        },
        type: "HOURLY",
        durationHours: 8,
        coveredAreas: ["Batam Centre", "Nagoya", "Nongsa"],
        price: 110,
        currency: "SGD",
      },
      {
        name: {
          id: "1 Way Transfer",
          ms: "Pemindahan 1 Hala",
          en: "1 Way Transfer",
          zh: "单程接送",
        },
        type: "ONE_WAY",
        coveredAreas: ["Airport", "Ferry Terminal", "Hotel"],
        price: 45,
        currency: "SGD",
      },
    ],
    extraCharges: [
      {
        name: {
          id: "Additional Charge Enter Barelang",
          ms: "Caj Tambahan Masuk Barelang",
          en: "Additional Charge for Enter Barelang",
          zh: "进入巴兰桥附加费",
        },
        type: "LOCATION_SURCHARGE",
        price: 10,
        currency: "SGD",
        unit: "per entry",
      },
      {
        name: {
          id: "Additional Hour",
          ms: "Jam Tambahan",
          en: "Additional Hour",
          zh: "额外小时",
        },
        type: "EXTRA_HOUR",
        price: 18,
        currency: "SGD",
        unit: "per hour",
      },
    ],
  },
  {
    code: "TR-BUS-22",
    title: {
      id: "Mini Bus 22 Seaters",
      ms: "Mini Bas 22 Tempat Duduk",
      en: "Mini Bus 22 Seaters",
      zh: "小型巴士 22 座",
    },
    slug: "mini-bus-22-seaters",
    category: "MINI_BUS",
    capacity: 22,
    capacityUnit: "Seaters",
    description: {
      id: "Mini bus untuk 22 penumpang, pilihan utama untuk rombongan besar dan corporate trip. Bisa dengan driver & guide.",
      en: "Mini bus for 22 passengers, the top choice for large groups and corporate trips. Available with driver & guide.",
      zh: "可容纳 22 名乘客的小型巴士，是大型团体和企业旅行的首选。可配备司机与导游。",
    },
    featuredImage: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop",
    ],
    includedServices: ["DRIVER_ONLY", "DRIVER_AND_GUIDE"],
    isActive: 1,
    pricingPackages: [
      {
        name: {
          id: "10 Hours Usage",
          ms: "Penggunaan 10 Jam",
          en: "10 Hours Usage",
          zh: "10 小时使用",
        },
        type: "HOURLY",
        durationHours: 10,
        coveredAreas: ["Batam Centre", "Nagoya", "Nongsa", "Barelang"],
        price: 180,
        currency: "SGD",
      },
      {
        name: {
          id: "1 Way Transfer",
          ms: "Pemindahan 1 Hala",
          en: "1 Way Transfer",
          zh: "单程接送",
        },
        type: "ONE_WAY",
        coveredAreas: ["Airport", "Ferry Terminal", "Hotel"],
        price: 65,
        currency: "SGD",
      },
    ],
    extraCharges: [
      {
        name: {
          id: "Additional Charge Enter Barelang",
          ms: "Caj Tambahan Masuk Barelang",
          en: "Additional Charge for Enter Barelang",
          zh: "进入巴兰桥附加费",
        },
        type: "LOCATION_SURCHARGE",
        price: 15,
        currency: "SGD",
        unit: "per entry",
      },
      {
        name: {
          id: "Additional Hour",
          ms: "Jam Tambahan",
          en: "Additional Hour",
          zh: "额外小时",
        },
        type: "EXTRA_HOUR",
        price: 25,
        currency: "SGD",
        unit: "per hour",
      },
    ],
  },
];

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
} as const;

export const seedPackages: SeedPackage[] = [
  {
    code: "BATAM-3D2N",
    name: L.id,
    slug: "batam-3d2n",
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

/** Initial blog categories seeded on first run. */
export const seedBlogCategories = [
  {
    name: {
      id: "Tips Wisata",
      ms: "Tips Pelancongan",
      en: "Travel Tips",
      zh: "旅行贴士",
    },
    slug: "tips-wisata",
    description: {
      id: "Tips praktis untuk liburan ke Batam.",
      ms: "Tips praktikal untuk percutian ke Batam.",
      en: "Practical tips for your Batam holiday.",
      zh: "巴淡岛度假的实用贴士。",
    },
  },
  {
    name: {
      id: "Itinerary",
      ms: "Itinerari",
      en: "Itinerary",
      zh: "行程",
    },
    slug: "itinerary",
    description: {
      id: "Contoh itinerary & rencana perjalanan.",
      ms: "Contoh itinerari & rancangan perjalanan.",
      en: "Sample itineraries & travel plans.",
      zh: "示例行程与旅行计划。",
    },
  },
  {
    name: {
      id: "Kuliner",
      ms: "Kulinari",
      en: "Food",
      zh: "美食",
    },
    slug: "kuliner",
    description: {
      id: "Rekomendasi kuliner khas Batam.",
      ms: "Cadangan kulinari khas Batam.",
      en: "Must-try Batam food spots.",
      zh: "巴淡岛必尝美食推荐。",
    },
  },
];

type SeedBlogPost = {
  title: {
    id: string;
    ms?: string;
    en?: string;
    zh?: string;
  };
  slug: string;
  excerpt: {
    id: string;
    ms?: string;
    en?: string;
    zh?: string;
  };
  content: {
    id: string;
    ms?: string;
    en?: string;
    zh?: string;
  };
  contentType: "html";
  featuredImageUrl: string;
  featuredImageAlt: {
    id: string;
    ms?: string;
    en?: string;
    zh?: string;
  };
  categorySlug: string;
  tags: string[];
  status: "published";
  seoTitle?: {
    id: string;
    ms?: string;
    en?: string;
    zh?: string;
  };
  seoDescription?: {
    id: string;
    ms?: string;
    en?: string;
    zh?: string;
  };
};

/** Initial blog posts seeded on first run (published so /blog has content). */
export const seedBlogPosts: SeedBlogPost[] = [
  {
    title: {
      id: "Itinerary Batam 3 Hari 2 Malam Terbaik untuk Keluarga",
      ms: "Itinerari Batam 3 Hari 2 Malam Terbaik untuk Keluarga",
      en: "Best 3D2N Batam Itinerary for Families",
      zh: "适合家庭的巴淡岛3天2夜最佳行程",
    },
    slug: "itinerary-batam-3d2n-keluarga",
    excerpt: {
      id: "Rencana jalan-jalan 3 hari 2 malam ke Batam yang pas untuk keluarga: dari city tour, Barelang, sampai kuliner. Lengkap dengan estimasi biaya.",
      ms: "Rancangan percutian 3 hari 2 malam ke Batam yang sesuai untuk keluarga: dari city tour, Barelang, sampai kulinari. Lengkap dengan anggaran kos.",
      en: "A 3-day, 2-night Batam getaway that fits the family: city tour, Barelang, and great food. Complete with a cost estimate.",
      zh: "适合家庭的巴淡岛3天2夜行程：城市观光、巴莱朗大桥与美食，附预算参考。",
    },
    content: {
      id: "<h2>Hari Pertama: Tiba dan City Tour</h2><p>Mulai perjalanan dari ferry Singapura atau pelabuhan lokal. Setelah tiba, langsung cek in ke hotel dan lanjut <strong>city tour</strong> ke ikon Batam seperti Masjid Agung dan Maha Vihara Duta Maitreya.</p><blockquote><p>Tips: booking paket tour dari Destitour supaya transport & guide sudah termasuk, jadi tinggal nikmati saja.</p></blockquote><h2>Hari Kedua: Jembatan Barelang & Pantai</h2><p>Dedikasikan hari kedua untuk <strong>Jembatan Barelang</strong> — spot sunrise terbaik di Batam. Lanjut ke pantai seperti Nongsa atau Tanjung Pinggir untuk bersantai.</p><h2>Hari Ketiga: Kuliner & Belanja</h2><p>Sebelum pulang, mampir ke pusat oleh-oleh dan kuliner khas seperti <em>gonggong</em> dan <em>seafood</em>. Selesai, kembali ke ferry.</p>",
      ms: "<h2>Hari Pertama: Tiba dan City Tour</h2><p>Mulakan perjalanan dari feri Singapura atau pelabuhan tempatan. Selepas tiba, terus daftar masuk ke hotel dan teruskan <strong>city tour</strong> ke ikon Batam seperti Masjid Agung dan Maha Vihara Duta Maitreya.</p><blockquote><p>Tips: tempah pakej pelancongan daripada Destitour supaya pengangkutan & pemandu sudah termasuk, tinggal nikmati sahaja.</p></blockquote><h2>Hari Kedua: Jambatan Barelang & Pantai</h2><p>Luangkan hari kedua untuk <strong>Jambatan Barelang</strong> — spot matahari terbit terbaik di Batam. Teruskan ke pantai seperti Nongsa atau Tanjung Pinggir untuk bersantai.</p><h2>Hari Ketiga: Kulinari & Membeli-belah</h2><p>Sebelum pulang, singgah di pusat cenderamata dan kulinari khas seperti <em>gonggong</em> dan <em>seafood</em>. Selesai, kembali ke feri.</p>",
      en: "<h2>Day One: Arrival and City Tour</h2><p>Start from the Singapore ferry or a local jetty. After arriving, check in to your hotel and continue with a <strong>city tour</strong> of Batam icons such as the Grand Mosque and Maha Vihara Duta Maitreya.</p><blockquote><p>Tip: book a tour package from Destitour so transport and a guide are included — just sit back and enjoy.</p></blockquote><h2>Day Two: Barelang Bridge & Beach</h2><p>Spend day two on the <strong>Barelang Bridge</strong> — Batam's best sunrise spot. Head to beaches like Nongsa or Tanjung Pinggir to relax.</p><h2>Day Three: Food & Shopping</h2><p>Before heading home, stop by souvenir centres and local favourites such as <em>gonggong</em> and <em>seafood</em>. Then catch your ferry back.</p>",
      zh: "<h2>第一天：抵达与市区观光</h2><p>从新加坡渡轮或本地码头出发。抵达后入住酒店，接着进行<strong>市区观光</strong>，参观巴淡地标如大清真寺和天恩弥勒佛院。</p><blockquote><p>贴士：预订巴淡之旅的旅游配套，交通和导游都已包含，尽情享受即可。</p></blockquote><h2>第二天：巴莱朗大桥与海滩</h2><p>第二天留给<strong>巴莱朗大桥</strong>——巴淡岛最佳日出地点。接着前往农萨或丹绒平吉尔等海滩放松。</p><h2>第三天：美食与购物</h2><p>返程前逛逛伴手礼中心和当地美食如<em>gonggong</em>海螺与<em>海鲜</em>。之后乘渡轮返回。</p>",
    },
    contentType: "html",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1200&auto=format&fit=crop",
    featuredImageAlt: {
      id: "Pemandangan kota Batam saat senja",
      ms: "Pemandangan bandar Batam ketika senja",
      en: "Batam city skyline at dusk",
      zh: "巴淡岛黄昏城市景观",
    },
    categorySlug: "itinerary",
    tags: ["itinerary", "keluarga", "3d2n"],
    status: "published",
    seoTitle: {
      id: "Itinerary Batam 3D2N untuk Keluarga - Destitour",
      ms: "Itinerari Batam 3D2N untuk Keluarga - Destitour",
      en: "3D2N Batam Itinerary for Families - Destitour",
      zh: "家庭巴淡岛3天2夜行程 - 巴淡之旅",
    },
    seoDescription: {
      id: "Itinerary Batam 3 hari 2 malam untuk keluarga: city tour, Jembatan Barelang, dan kuliner. Lengkap dengan estimasi biaya.",
      ms: "Itinerari Batam 3 hari 2 malam untuk keluarga: city tour, Jambatan Barelang, dan kulinari. Lengkap dengan anggaran kos.",
      en: "A 3-day, 2-night Batam itinerary for families: city tour, Barelang Bridge, and food. Includes a cost estimate.",
      zh: "家庭巴淡岛3天2夜行程：市区观光、巴莱朗大桥与美食，附预算参考。",
    },
  },
  {
    title: {
      id: "Tips Naik Ferry ke Batam dari Singapura",
      ms: "Tips Naik Feri ke Batam dari Singapura",
      en: "How to Take the Ferry from Singapore to Batam",
      zh: "从新加坡乘渡轮前往巴淡岛指南",
    },
    slug: "tips-ferry-singapura-ke-batam",
    excerpt: {
      id: "Bingung cara ke Batam dari Singapura? Simak panduan lengkap naik ferry, bandingkan harga, dan tips hemat antrean di terminal.",
      ms: "Keliru cara ke Batam dari Singapura? Ikuti panduan lengkap menaiki feri, bandingkan harga, dan tips menjimatkan masa di terminal.",
      en: "Confused about getting from Singapore to Batam? Here's a complete ferry guide, price comparisons, and tips to skip the queues.",
      zh: "不知道如何从新加坡前往巴淡岛？完整渡轮指南、价格对比与排队省时贴士。",
    },
    content: {
      id: "<h2>Terminal & Operator Ferry</h2><p>Ada beberapa operator seperti <strong>Batam Fast</strong> dan <strong>Sindo Ferry</strong> yang melayani rute Singapura (HarbourFront / Tanah Merah) ke Batam (Sekupang, Batam Centre, Nongsa).</p><h2>Tips Hemat Waktu</h2><ul><li>Beli tiket online minimal sehari sebelumnya.</li><li>Datang 60–90 menit sebelum jadwal keberangkatan.</li><li>Pilih Batam Centre kalau tujuanmu dekat pusat kota.</li></ul><p>Setelah tiba, kamu bisa langsung booking transport dari Destitour untuk penjemputan di pelabuhan.</p>",
      ms: "<h2>Terminal & Pengendali Feri</h2><p>Terdapat beberapa pengendali seperti <strong>Batam Fast</strong> dan <strong>Sindo Ferry</strong> yang melayani laluan Singapura (HarbourFront / Tanah Merah) ke Batam (Sekupang, Batam Centre, Nongsa).</p><h2>Tips Menjimatkan Masa</h2><ul><li>Beli tiket dalam talian sekurang-kurangnya sehari sebelum perjalanan.</li><li>Datang 60–90 minit sebelum jadual berlepas.</li><li>Pilih Batam Centre jika destinasi anda dekat pusat bandar.</li></ul><p>Selepas tiba, anda boleh terus menempah pengangkutan daripada Destitour untuk penjemputan di pelabuhan.</p>",
      en: "<h2>Ferry Terminals & Operators</h2><p>Several operators such as <strong>Batam Fast</strong> and <strong>Sindo Ferry</strong> run routes from Singapore (HarbourFront / Tanah Merah) to Batam (Sekupang, Batam Centre, Nongsa).</p><h2>Time-Saving Tips</h2><ul><li>Buy your ticket online at least a day ahead.</li><li>Arrive 60–90 minutes before departure.</li><li>Choose Batam Centre if your destination is near the city centre.</li></ul><p>Once you arrive, you can book transport with Destitour for pickup at the jetty.</p>",
      zh: "<h2>渡轮码头与运营商</h2><p>多家运营商如<strong>Batam Fast</strong>和<strong>Sindo Ferry</strong>提供新加坡（港湾/丹那美拉）至巴淡岛（塞库邦、巴淡中心、农萨）的航线。</p><h2>省时贴士</h2><ul><li>至少提前一天在线购票。</li><li>提前60至90分钟到达。</li><li>若目的地靠近市中心，选择巴淡中心码头。</li></ul><p>抵达后，可直接预订巴淡之旅的接送服务。</p>",
    },
    contentType: "html",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?q=80&w=1200&auto=format&fit=crop",
    featuredImageAlt: {
      id: "Kapal ferry melintasi laut",
      ms: "Kapal feri melintasi laut",
      en: "A ferry crossing the sea",
      zh: "渡轮横渡大海",
    },
    categorySlug: "tips-wisata",
    tags: ["ferry", "singapura", "transport"],
    status: "published",
    seoTitle: {
      id: "Cara Naik Ferry dari Singapura ke Batam - Destitour",
      ms: "Cara Naik Feri dari Singapura ke Batam - Destitour",
      en: "Singapore to Batam Ferry Guide - Destitour",
      zh: "新加坡至巴淡岛渡轮指南 - 巴淡之旅",
    },
    seoDescription: {
      id: "Panduan naik ferry dari Singapura ke Batam: terminal, operator, tips antrean, dan rekomendasi transportasi lokal.",
      ms: "Panduan menaiki feri dari Singapura ke Batam: terminal, pengendali, tips antrean, dan cadangan pengangkutan tempatan.",
      en: "A Singapore-to-Batam ferry guide: terminals, operators, queue tips, and local transport recommendations.",
      zh: "新加坡至巴淡岛渡轮指南：码头、运营商、排队贴士与当地交通推荐。",
    },
  },
  {
    title: {
      id: "7 Kuliner Batam yang Wajib Dicoba",
      ms: "7 Kulinari Batam yang Wajib Dicuba",
      en: "7 Must-Try Batam Dishes",
      zh: "巴淡岛必尝的7种美食",
    },
    slug: "kuliner-batam-wajib-dicoba",
    excerpt: {
      id: "Dari gonggong rebus sampai seafood malam hari — ini daftar kuliner khas Batam yang sayang dilewatkan saat liburan.",
      ms: "Dari gonggong rebus sampai seafood malam hari — ini senarai kulinari khas Batam yang sayang dilepaskan ketika bercuti.",
      en: "From boiled gonggong to late-night seafood — the Batam specialities you shouldn't miss on your trip.",
      zh: "从水煮海螺到深夜海鲜——巴淡岛不容错过的特色美食清单。",
    },
    content: {
      id: "<h2>1. Gonggong</h2><p>Siput laut khas Batam, biasanya disajikan rebus dengan saus. Cocok untuk pencinta seafood.</p><h2>2. Seafood Malam di Nagoya</h2><p>Nagoya terkenal dengan deretan restoran seafood segar dengan harga bersahabat.</p><h2>3. Mie Tarempa</h2><p>Mie dengan kuah kental dan topping seafood — wajib coba di sore hari.</p><blockquote><p>Biar lebih irit, gabungkan kuliner dengan paket city tour dari Destitour supaya lokasi makan sudah diatur.</p></blockquote>",
      ms: "<h2>1. Gonggong</h2><p>Siput laut khas Batam, biasanya dihidangkan rebus bersama sos. Sesuai untuk peminat seafood.</p><h2>2. Seafood Malam di Nagoya</h2><p>Nagoya terkenal dengan deretan restoran seafood segar dengan harga mesra.</p><h2>3. Mie Tarempa</h2><p>Mi dengan kuah pekat dan topping seafood — wajib dicuba pada waktu petang.</p><blockquote><p>Supaya lebih jimat, gabungkan kulinari dengan pakej city tour daripada Destitour supaya lokasi makan sudah diatur.</p></blockquote>",
      en: "<h2>1. Gonggong</h2><p>Batam's signature sea snail, usually served boiled with sauce. Perfect for seafood lovers.</p><h2>2. Nagoya Night Seafood</h2><p>Nagoya is famous for rows of fresh-seafood restaurants at friendly prices.</p><h2>3. Mie Tarempa</h2><p>Noodles in a rich broth topped with seafood — a must-try in the afternoon.</p><blockquote><p>To save money, pair your food crawl with a Destitour city tour so dining spots are already arranged.</p></blockquote>",
      zh: "<h2>1. Gonggong海螺</h2><p>巴淡岛特色海螺，通常水煮配酱料食用，海鲜爱好者必试。</p><h2>2. Nagoya夜市海鲜</h2><p>Nagoya以一排排新鲜海鲜餐厅闻名，价格亲民。</p><h2>3. Tarempa面</h2><p>浓汤面条搭配海鲜配料——下午必尝。</p><blockquote><p>想更省钱，可将美食之旅与巴淡之旅城市观光配套结合，用餐地点已安排妥当。</p></blockquote>",
    },
    contentType: "html",
    featuredImageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop",
    featuredImageAlt: {
      id: "Hidangan seafood khas Batam",
      ms: "Hidangan seafood khas Batam",
      en: "Batam-style seafood dishes",
      zh: "巴淡岛特色海鲜菜肴",
    },
    categorySlug: "kuliner",
    tags: ["kuliner", "seafood", "makanan"],
    status: "published",
    seoTitle: {
      id: "7 Kuliner Batam yang Wajib Dicoba - Destitour",
      ms: "7 Kulinari Batam yang Wajib Dicuba - Destitour",
      en: "7 Must-Try Batam Dishes - Destitour",
      zh: "巴淡岛必尝7种美食 - 巴淡之旅",
    },
    seoDescription: {
      id: "Daftar kuliner khas Batam yang wajib dicoba: gonggong, seafood Nagoya, mie Tarempa, dan lainnya.",
      ms: "Senarai kulinari khas Batam yang wajib dicuba: gonggong, seafood Nagoya, mie Tarempa, dan lain-lain.",
      en: "Must-try Batam dishes: gonggong, Nagoya seafood, Mie Tarempa, and more.",
      zh: "巴淡岛必尝美食清单：gonggong海螺、Nagoya海鲜、Tarempa面等。",
    },
  },
];
