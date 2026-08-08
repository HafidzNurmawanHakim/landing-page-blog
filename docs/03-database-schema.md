# 3. Database Schema (D1 + Drizzle)

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 3.1 Tabel `packages`

```sql
CREATE TABLE packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,           -- BATAM-3D2N
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,              -- tour | transport | hotel
  duration TEXT,                       -- 3D2N
  price INTEGER NOT NULL,              -- dalam Rupiah
  description TEXT,
  image_url TEXT,                      -- URL gambar (R2 public / Unsplash / dll)
  image_alt TEXT,                      -- teks alt untuk aksesibilitas
  itinerary TEXT,                      -- JSON string
  includes TEXT,                       -- JSON string
  excludes TEXT,                       -- JSON string
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);
```

### Deskripsi Kolom

| Kolom         | Tipe    | Keterangan                                                                                                                                          |
| ------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`          | INTEGER | Primary key auto-increment                                                                                                                          |
| `code`        | TEXT    | Kode unik paket, contoh `BATAM-3D2N`                                                                                                                |
| `name`        | TEXT    | JSON object `{ id, ms, en, zh }` — nama tampilan per bahasa. Minimal `id` terisi.                                                                     |
| `slug`        | TEXT    | Slug URL, contoh `batam-3d2n`                                                                                                                       |
| `category`    | TEXT    | Salah satu: `tour` \| `transport` \| `hotel`                                                                                                        |
| `duration`    | TEXT    | Durasi, contoh `3D2N`                                                                                                                               |
| `price`       | INTEGER | Harga dalam Rupiah (integer, hindari float)                                                                                                         |
| `description` | TEXT    | JSON object `{ id, ms, en, zh }` — deskripsi panjang paket per bahasa.                                                                               |
| `image_url`   | TEXT    | URL gambar paket. Disimpan **di DB hanya URL-nya** — binary di Cloudflare R2 (atau `/public/uploads` di local dev). Kosong = tampilkan placeholder. |
| `image_alt`   | TEXT    | JSON object `{ id, ms, en, zh }` — teks alternatif gambar per bahasa (SEO/aksesibilitas).                                                            |
| `itinerary`   | TEXT    | JSON object `{ id, ms, en, zh }` — tiap locale berisi array langkah itinerary.                                                                        |
| `includes`    | TEXT    | JSON object `{ id, ms, en, zh }` — tiap locale berisi array item yang termasuk.                                                                       |
| `excludes`    | TEXT    | JSON object `{ id, ms, en, zh }` — tiap locale berisi array item yang tidak termasuk.                                                                 |
| `is_active`   | INTEGER | `1` tampil di publik, `0` hidden                                                                                                                    |
| `created_at`  | INTEGER | Unix timestamp (detik)                                                                                                                              |
| `updated_at`  | INTEGER | Unix timestamp (detik)                                                                                                                              |

## 3.2 Tabel `bookings`

```sql
CREATE TABLE bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_code TEXT NOT NULL UNIQUE,   -- BT-20260805-001
  package_code TEXT NOT NULL,
  package_name TEXT NOT NULL,          -- denormalized untuk history
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  departure_date TEXT NOT NULL,        -- YYYY-MM-DD
  return_date TEXT NOT NULL,
  participants INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending',       -- pending | confirmed | cancelled | completed
  admin_notes TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_package_code ON bookings(package_code);
```

### Deskripsi Kolom

| Kolom            | Tipe    | Keterangan                                              |
| ---------------- | ------- | ------------------------------------------------------- |
| `id`             | INTEGER | Primary key auto-increment                              |
| `booking_code`   | TEXT    | Kode unik booking, format `BT-YYYYMMDD-NNN`             |
| `package_code`   | TEXT    | Referensi ke `packages.code`                            |
| `package_name`   | TEXT    | Denormalisasi nama paket (aman jika paket dihapus/ubah) |
| `customer_name`  | TEXT    | Nama lengkap customer                                   |
| `phone`          | TEXT    | Nomor WA / HP                                           |
| `email`          | TEXT    | Opsional, untuk konfirmasi                              |
| `departure_date` | TEXT    | Tanggal berangkat `YYYY-MM-DD`                          |
| `return_date`    | TEXT    | Tanggal pulang `YYYY-MM-DD`                             |
| `participants`   | INTEGER | Jumlah peserta                                          |
| `notes`          | TEXT    | Catatan customer (opsional)                             |
| `status`         | TEXT    | `pending` \| `confirmed` \| `cancelled` \| `completed`  |
| `admin_notes`    | TEXT    | Catatan internal admin (opsional)                       |
| `created_at`     | INTEGER | Unix timestamp (detik)                                  |
| `updated_at`     | INTEGER | Unix timestamp (detik)                                  |

### Catatan Index

- `idx_bookings_status` → mempercepat filter status di dashboard
- `idx_bookings_created_at` → mempercepat sort "terbaru dulu"
- `idx_bookings_package_code` → mempercepat lookup per paket

## 3.3 Tabel `gallery_items`

```sql
CREATE TABLE gallery_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT NOT NULL,           -- URL gambar (R2 public / /uploads di local dev)
  caption TEXT,                      -- JSON object { id, ms, en, zh } — caption per bahasa
  like_count INTEGER NOT NULL DEFAULT 0,   -- denormalized counter (reaksi per IP)
  share_count INTEGER NOT NULL DEFAULT 0,  -- denormalized counter (reaksi per IP)
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_gallery_created_at ON gallery_items(created_at);
```

### Deskripsi Kolom

| Kolom       | Tipe    | Keterangan                                                                               |
| ----------- | ------- | ---------------------------------------------------------------------------------------- |
| `id`        | INTEGER | Primary key auto-increment                                                               |
| `image_url` | TEXT    | URL gambar galeri. Disimpan **di DB hanya URL-nya** — binary di R2 (atau `/public/uploads` di local dev). |
| `caption`   | TEXT    | JSON object `{ id, ms, en, zh }` — caption per bahasa. Minimal `id` terisi (fallback).    |
| `like_count` | INTEGER | Counter like. **Denormalized** agar grid terbaca O(1) — sumber kebenaran ada di `gallery_reactions`. |
| `share_count` | INTEGER | Counter share. Denormalized (lihat `like_count`).                                         |
| `created_at` | INTEGER | Unix timestamp (detik), dipakai untuk urutan grid (terbaru dulu)                         |
| `updated_at` | INTEGER | Unix timestamp (detik)                                                                  |

### Catatan

- Galeri hanya dikelola admin (lihat [05-api-server-actions.md](./05-api-server-actions.md)).
- Halaman publik `/gallery` menampilkan grid persegi (Instagram-style): `image_url` + `caption` (di-resolve via `pickLocale`).
- `idx_gallery_created_at` → mempercepat sort "terbaru dulu" di grid publik.
- Like & share publik (per IP) memakai tabel `gallery_reactions` di bawah.

## 3.3b Tabel `gallery_reactions` (like & share per IP)

```sql
CREATE TABLE gallery_reactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gallery_id INTEGER NOT NULL,       -- FK logis → gallery_items.id
  ip TEXT NOT NULL,                  -- identitas visitor (cf-connecting-ip / x-forwarded-for)
  type TEXT NOT NULL DEFAULT 'like', -- 'like' | 'share'
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_gallery_reactions_gallery_ip_type
  ON gallery_reactions(gallery_id, ip, type);
CREATE INDEX idx_gallery_reactions_gallery_type
  ON gallery_reactions(gallery_id, type);
```

### Deskripsi Kolom

| Kolom        | Tipe    | Keterangan                                                              |
| ------------ | ------- | ----------------------------------------------------------------------- |
| `id`         | INTEGER | Primary key auto-increment                                              |
| `gallery_id` | INTEGER | Photo yang direaksi                                                      |
| `ip`         | TEXT    | IP visitor — unik per `(gallery_id, ip, type)`, jadi 1 like & 1 share per IP per foto |
| `type`       | TEXT    | `like` (toggle, bisa di-unlike) \| `share` (dihitung sekali per IP)     |
| `created_at` | INTEGER | Unix timestamp (detik)                                                  |

### Catatan

- **Unique index** `(gallery_id, ip, type)` adalah penjamin "1 IP = 1 like/share per foto".
  Penulisan memakai `INSERT ... ON CONFLICT DO NOTHING` supaya race antar request
  tidak menggandakan counter.
- `like_count` / `share_count` di `gallery_items` adalah **counter denormalized**
  (sumber kebenaran tetap tabel ini); di-update atomik via `UPDATE ... SET col = col + 1`.
- Semua penulisan publik dilindungi rate limit per IP (lihat [05-api-server-actions.md](./05-api-server-actions.md))
  dan dokumen keamanan [09-non-functional.md](./09-non-functional.md).

## 3.4 Tabel `testimonials`

```sql
CREATE TABLE testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,             -- nama customer
  role TEXT,                      -- JSON object { id, ms, en, zh } — peran/paket, opsional
  comment TEXT NOT NULL,          -- JSON object { id, ms, en, zh } — komentar, minimal id
  rating REAL NOT NULL DEFAULT 5, -- 0–5, mendukung desimal (mis. 4.8)
  avatar_url TEXT,                -- URL avatar (opsional; fallback = inisial nama)
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0, -- kecil = tampil lebih dulu
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_testimonials_active_sort ON testimonials(is_active, sort_order);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at);
```

### Deskripsi Kolom

| Kolom        | Tipe    | Keterangan                                                                                        |
| ------------ | ------- | ------------------------------------------------------------------------------------------------- |
| `id`         | INTEGER | Primary key auto-increment                                                                        |
| `name`       | TEXT    | Nama customer, wajib                                                                              |
| `role`       | TEXT    | JSON object `{ id, ms, en, zh }` — peran/paket di bawah nama (opsional, fallback `id`)            |
| `comment`    | TEXT    | JSON object `{ id, ms, en, zh }` — komentar per bahasa. Minimal `id` terisi (fallback)            |
| `rating`     | REAL    | 0–5, bisa desimal (4.8, 4.9, 5.0). Render bintang partial-fill di UI                              |
| `avatar_url` | TEXT    | URL avatar (opsional). Kosong → inisial nama sebagai fallback                                     |
| `is_active`  | INTEGER | 1 = tampil di beranda, 0 = disembunyikan                                                          |
| `sort_order` | INTEGER | Urutan manual; angka kecil tampil lebih dulu                                                      |
| `created_at` | INTEGER | Unix timestamp (detik)                                                                           |
| `updated_at` | INTEGER | Unix timestamp (detik)                                                                           |

### Catatan

- Testimoni hanya dikelola admin (lihat [05-api-server-actions.md](./05-api-server-actions.md)).
- Beranda memanggil `listTestimonials({ activeOnly: true })` (server component) → prop ke carousel.
- `idx_testimonials_active_sort` → mempercepat query aktif + urutan di beranda.

## 3.5 Tabel `admins` (opsional)

```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);
```

### Catatan Auth

- Password disimpan sebagai hash (bcrypt/argon2), **jangan** plaintext
- `ADMIN_PASSWORD_HASH` di env vars hanya untuk seed admin pertama
- Auth memakai Auth.js Credentials provider yang membaca tabel ini

---

**Lanjutkan ke:** [4. User Flow](./04-user-flow.md)
