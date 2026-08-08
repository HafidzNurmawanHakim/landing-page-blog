# 15. Produk Transport & Rental Kendaraan

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 15.1 Masalah Desain Saat Ini

Tabel `packages` (lihat [03-database-schema.md](./03-database-schema.md) §3.1)
berisi `category` = `tour | transport | hotel` dengan satu harga flat `price`
dan satu `duration`. Model ini **tidak cocok** untuk produk rental kendaraan:

| Kebutuhan Transport                    | Yang dimiliki `packages`                 |
| -------------------------------------- | ---------------------------------------- |
| 1 produk = banyak pilihan harga        | 1 baris = 1 harga                        |
| Harga per durasi (10h / 8h / 4h)       | Satu `duration` bebas teks               |
| 1-way transfer (tanpa durasi)          | Tidak bisa                               |
| Area cakupan per paket harga           | Tidak ada                                |
| Biaya tambahan (surcharge / extra hour)| Tidak ada                                |
| Kapasitas kendaraan (6/13/22 seaters)  | Tidak ada                                |
| Layanan termasuk (driver/guide/self)   | Tidak ada                                |
| Multi mata uang (SGD/IDR/USD)          | Hanya Rupiah (`formatIDR`)               |
| Galeri gambar kendaraan                | Hanya 1 `image_url`                      |

**Keputusan (best practice):** `packages` menjadi **katalog paket tour saja**.
`transport` dan `hotel` keluar dari tabel ini menjadi produk mandiri dengan
tabel sendiri. Kolom `category` di `packages` dipertahankan untuk kompatibilitas
(baris lama bertipe `transport`/`hotel` bisa dimigrasi bertahap), tapi ke depan
hanya `tour` yang dipakai; dropdown kategori di admin-form tidak lagi menawarkan
`transport`/`hotel` (lihat §15.10).

## 15.2 Model Data (Target, sejalan dengan contoh)

```ts
// Enum mata uang — harga disimpan sebagai INTEGER satuan penuh
// (100 = SGD 100). Lihat §15.4 untuk aturan uang.
type Currency = "SGD" | "IDR" | "USD";

enum ServiceType {
  DRIVER_ONLY = "Driver Only",
  DRIVER_AND_GUIDE = "Driver & Guide",
  SELF_DRIVE = "Self Drive",
}

// Kategori kendaraan — extensible, tambah saat armada berkembang
const TRANSPORT_CATEGORIES = [
  "MPV", "MINI_VAN", "MINI_BUS", "SUV", "SEDAN", "VAN", "BUS",
] as const;

enum PackageType {
  HOURLY = "HOURLY",        // 10 Hours, 8 Hours, 4 Hours
  ONE_WAY = "ONE_WAY",      // 1 Way Transfer
}

enum ExtraType {
  LOCATION_SURCHARGE = "LOCATION_SURCHARGE", // Enter Barelang
  EXTRA_HOUR = "EXTRA_HOUR",                 // Additional Hour
}

// 1. Produk kendaraan
interface TransportProduct {
  id: number;
  code: string;             // TR-MPV-6 (unique)
  title: LocalizedString;   // { id, ms, en, zh } — wajib id
  slug: string;             // unique, lowercase-kebab
  category: TransportCategory; // "MPV", "MINI_VAN", ...
  capacity: number;         // 6, 13, 22
  capacityUnit: string;     // "Seaters"
  description?: LocalizedString;
  featuredImage?: string;   // gambar utama
  images: string[];         // galeri kendaraan
  includedServices: ServiceType[]; // [DRIVER_ONLY] | [DRIVER_AND_GUIDE] | [SELF_DRIVE]
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

// 2. Paket harga (durasi / transfer) — 1 produk punya banyak baris
interface TransportPricingPackage {
  id: number;
  productId: number;        // FK → transport_products.id (cascade delete)
  name: LocalizedString;    // "10 Hours Usage", "1 Way Transfer"
  type: PackageType;
  durationHours?: number;   // 10, 8, 4 — null jika ONE_WAY
  coveredAreas: string[];   // ["Batam Centre", "Nagoya", "Nongsa"]
  price: number;            // 100, 80, 65, 35
  currency: Currency;       // "SGD"
  sortOrder: number;
}

// 3. Biaya tambahan — opsional, 0..n per produk
interface TransportExtraCharge {
  id: number;
  productId: number;        // FK → transport_products.id (cascade delete)
  name: LocalizedString;    // "Additional Charge Enter Barelang"
  type: ExtraType;
  price: number;            // 10, 15
  currency: Currency;
  unit?: string;            // "per entry", "per hour"
  sortOrder: number;
}
```

### Alasan perbedaan dengan contoh

- `id`/`code`/`title`/`slug` meniru pola `packages` (kode unik + slug URL + nama
  terlokalisasi) supaya admin & URL konsisten antar produk.
- `title` memakai `LocalizedString`, bukan `string` polos, mengikuti aturan i18n
  [06-i18n.md](./06-i18n.md).
- `images` diganti `featuredImage` (1 gambar utama untuk kartu/hero) +
  `images` (galeri). Ini pola standar marketplace dan hemat query di kartu.
- `includedServices` disimpan sebagai JSON `ServiceType[]` — pilihan terbatas
  enum, cukup & aman (tidak butuh tabel relasi untuk ini).

## 15.3 Skema SQL (D1 + Drizzle)

```sql
CREATE TABLE transport_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,                  -- TR-MPV-6
  title TEXT NOT NULL,                        -- JSON { id, ms, en, zh }
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,                     -- MPV | MINI_VAN | MINI_BUS | ...
  capacity INTEGER NOT NULL DEFAULT 0,
  capacity_unit TEXT NOT NULL DEFAULT 'Seaters',
  description TEXT,                           -- JSON LocalizedString
  featured_image TEXT,                        -- URL utama (R2 / uploads)
  images TEXT NOT NULL DEFAULT '[]',          -- JSON string[]
  included_services TEXT NOT NULL DEFAULT '[]', -- JSON ServiceType[]
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_transport_products_active ON transport_products(is_active);

CREATE TABLE transport_pricing_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,                         -- JSON LocalizedString
  type TEXT NOT NULL,                         -- HOURLY | ONE_WAY
  duration_hours INTEGER,                     -- NULL jika ONE_WAY
  covered_areas TEXT NOT NULL DEFAULT '[]',   -- JSON string[]
  price INTEGER NOT NULL,                     -- satuan penuh, lihat §15.4
  currency TEXT NOT NULL DEFAULT 'SGD',
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES transport_products(id) ON DELETE CASCADE
);

CREATE INDEX idx_transport_pricing_product ON transport_pricing_packages(product_id);
CREATE INDEX idx_transport_pricing_price ON transport_pricing_packages(product_id, price);

CREATE TABLE transport_extra_charges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,                         -- JSON LocalizedString
  type TEXT NOT NULL,                         -- LOCATION_SURCHARGE | EXTRA_HOUR
  price INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'SGD',
  unit TEXT,                                  -- "per entry", "per hour"
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES transport_products(id) ON DELETE CASCADE
);

CREATE INDEX idx_transport_extra_product ON transport_extra_charges(product_id);
```

### Catatan Drizzle

- `foreignKey` di deklarasi tabel child; D1/SQLite mendukung `ON DELETE CASCADE`
  (aktifkan pragma `foreign_keys` di koneksi bila belum).
- Hapus produk = cascade hapus semua paket harga & biaya tambahan — admin tidak
  perlu cleanup manual.
- Gunakan `drizzle-kit generate` (migration `0007_*`) dengan pola yang sama
  seperti tabel existing.

## 15.4 Strategi Penyimpanan: Normalisasi vs JSON

| Opsi                       | Kelebihan                                  | Kekurangan                                   |
| -------------------------- | ------------------------------------------ | -------------------------------------------- |
| **A. Tabel anak (dipilih)**| FK + cascade, query harga, CRUD per baris di admin, rapi | 3 tabel baru |
| B. JSON kolom di `transport_products` | Satu insert sederhana | Sulit query/sort harga, bloat baris, validasi manual, risiko ukuran |

**Dipilih A** karena harga adalah data **terstruktur & perlu di-query**
(mis. "harga mulai dari" di kartu = `MIN(price)` per produk; sort katalog oleh
harga). JSON kolom bagus untuk konten fleksibel (itinerary, includes,
`covered_areas`, `images`) — tetap dipakai di sana.

**Aturan uang:** simpan `price` sebagai `INTEGER` satuan penuh sesuai mata
uang (100 = SGD 100, 250000 = IDR 250.000). Hindari float. Jika kelak perlu
desimal/sen, migrasi ke minor unit dengan pembulatan eksplisit.

**Format tampilan:** tambah `formatCurrency(value, currency)` di
`lib/utils/format.ts` (selain `formatIDR` yang tetap untuk tour):

```ts
const CURRENCY_SYMBOL: Record<string, string> = { IDR: "Rp", SGD: "S$", USD: "$" };
export function formatCurrency(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? currency + " ";
  return `${symbol}${new Intl.NumberFormat("id-ID").format(value)}`;
}
```

## 15.5 Lokalisasi (i18n)

- `title`, `description`, `name` (paket harga & biaya tambahan) → `LocalizedString`
  `{ id, ms, en, zh }`, resolusi via `pickLocale` — mengikuti [06-i18n.md](./06-i18n.md).
- `covered_areas` dan `unit` → string polos (nama area/unit proper noun, sama di
  semua bahasa).
- `ServiceType`, `PackageType`, `ExtraType` → nilai enum; **label tampilan**
  ditaruh di `messages/*.json` (mis. `transport.serviceTypes.driverOnly`) agar
  bisa diterjemahkan, bukan hardcode di DB.
- Tambah key i18n baru di 4 file `messages/`:
  `transport.title`, `transport.subtitle`, `transport.capacity`,
  `transport.includedServices`, `transport.pricingPackages`,
  `transport.extraCharges`, `transport.perHour`, `transport.transfer`,
  `transport.from` (harga mulai dari), dst.

## 15.6 Integrasi Booking

`bookings` (schema.ts:34) memakai `package_code`/`package_name` sebagai identitas
item yang di-denormalisasi. Untuk mendukung produk polymorphic (tour, transport,
nanti hotel), ditambahkan **dua kolom baru** tanpa migrasi destruktif:

```sql
ALTER TABLE bookings ADD COLUMN item_type TEXT NOT NULL DEFAULT 'tour';
ALTER TABLE bookings ADD COLUMN booking_options TEXT; -- JSON, detail per tipe
```

- `item_type`: `tour | transport | hotel` (default `tour` → baris lama aman).
- `package_code` / `package_name` tetap dipakai sebagai **identitas item generik**
  (`packages.code` untuk tour, `transport_products.code` untuk transport) — tidak
  direname untuk menghindari perubahan kolom existing di semua kode (list admin,
  detail, dashboard, notif). Sifatnya sudah generic sejak awal.
- `booking_options` (JSON), contoh untuk transport:

```jsonc
{
  "pricingPackageId": 1,
  "pricingPackageName": "10 Hours Usage",      // di-localize saat booking
  "price": 100,
  "currency": "SGD",
  "extraCharges": [{ "id": 1, "name": "Enter Barelang", "price": 10, "currency": "SGD", "unit": "per entry" }],
  "extraTotal": 10,
  "vehicleQty": 1,                              // jumlah kendaraan (bukan participants)
  "pickupLocation": "Hang Nadim Airport",
  "pickupDate": "2026-08-20",
  "pickupTime": "09:30",
  "dropoffLocation": "Batam Centre"
}
```

- Untuk tour, `participants` tetap dipakai; untuk transport, `departure_date`/
  `return_date` = `pickup_date` (sehari) dan `participants` diisi `vehicle_qty`.
  `createBooking` memvalidasi `bookingOptions` terhadap DB (paket harga milik
  produk, extra valid, harga/`extra_total` dihitung ulang server-side) — client
  **tidak** bisa menanipulasi harga (lihat [05-api-server-actions.md](./05-api-server-actions.md) §5.5).
- Notifikasi WA/email menampilkan blok transport: lokasi/tanggal/jam jemput,
  jumlah kendaraan, paket harga + biaya tambahan, estimasi total.

## 15.7 Alur Customer & Admin

### Customer

```
/transport (katalog) → /transport/[slug] (detail)
  → pilih paket harga (mis. "10 Hours Usage")
  → pilih biaya tambahan opsional (mis. Enter Barelang)
  → form booking: tanggal + jam jemput, lokasi jemput/antar, jumlah kendaraan
  → submit → kode booking (BT-...) + WA admin + email customer
```

Detail page menampilkan: galeri gambar, kapasitas, layanan termasuk (driver/
guide/self-drive), daftar paket harga per tipe (`HOURLY`/`ONE_WAY`) + area
cakupan, daftar biaya tambahan, estimasi total live, tombol "Booking Sekarang".

### Admin

```
/admin/transport        → list produk (gambar, kategori, kapasitas, status, paket harga)
/admin/transport/new    → form produk + editor paket harga + biaya tambahan
/admin/transport/[id]/edit → edit (aktif/nonaktif, paket harga CRUD per baris)
```

Form memakai `ModalImageUploader` untuk `featuredImage` (crop 16:9) dan galeri
`images` (crop 1:1 atau 4:3) — **wajib** sesuai [12-design-rules.md](./12-design-rules.md).

## 15.8 API

| Method | Path                     | Deskripsi                                                        |
| ------ | ------------------------ | ---------------------------------------------------------------- |
| GET    | `/api/transport`         | List produk aktif (+ filter `category`, **pagination**)          |
| GET    | `/api/transport/[slug]`  | Detail produk + `pricingPackages` + `extraCharges`               |
| POST   | `/api/bookings`          | Sama; payload kini menerima `itemType` + `bookingOptions`        |

Response list menyertakan `priceFrom` (harga paket termurah, dari
`MIN(price)`) dan `currency` untuk kartu. Detail menyertakan array lengkap
paket harga & biaya tambahan yang sudah di-localize.

## 15.9 Skema Repo (Struktur Target)

```
app/
├── actions/transport.ts                 # CRUD produk (admin session, zod)
├── (site)/(marketing)/transport/        # Katalog + detail produk
│   ├── page.tsx
│   └── [slug]/page.tsx
├── admin/(protected)/transport/         # CRUD admin (list, new, [id]/edit)
├── api/transport/                       # GET list + GET [slug]
lib/
├── db/repositories/transport.ts         # list/getBySlug/create/update/delete
├── db/schema.ts                         # + 3 tabel (see §15.3)
├── validations/transport.ts             # zod (produk + paket harga + extra)
└── utils/format.ts                      # + formatCurrency
```

Server Action & repository mengikuti pola `packages` yang ada
(`requireAdmin()` + redirect, zod server-side, `try/catch`, slugify dari title).

## 15.10 Roadmap Implementasi

| # | Langkah                                                       | Status  |
| - | ------------------------------------------------------------- | ------- |
| 1 | Schema: 3 tabel + migration `0007_breezy_stature`             | ✅      |
| 2 | Repository + validasi zod (`lib/db/repositories/transport.ts`) | ✅      |
| 3 | Actions CRUD admin + halaman `/admin/transport/*`             | ✅      |
| 4 | Halaman publik `/transport` + `/transport/[slug]`             | ✅      |
| 5 | Booking polymorphic: `item_type` + `booking_options`          | ✅      |
| 6 | Deprecate `transport`/`hotel` di katalog publik (filter `/packages` tour-only; legacy seed non-aktif) | ✅ |
| 7 | (Fase lanjut) Produk `hotel_products` — pola sama: properti/room + rate plan | ⏳ |

### Checklist migrasi existing data

- [x] Baris `packages` ber-`category='transport'` / `'hotel'` di seed di-set
      non-aktif (`isActive=0`) sebagai arsip — produk transport baru punya
      tabel & halaman sendiri.
- [x] Booking lama tetap `item_type='tour'` (default kolom) — tidak perlu backfill.
- [x] Filter publik `/packages` hanya `all | tour`; `/transport` jadi halaman sendiri.
      Dropdown kategori di admin-form `packages` dipertahankan untuk backward
      compat mengedit baris legacy.

---

**Kembali ke:** [Dokumentasi Utama](./index.md)
