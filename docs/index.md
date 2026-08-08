# Destitour Booking Platform

**Dokumentasi Utama**

**Versi:** 1.1
**Tanggal:** 8 Agustus 2026
**Tech Stack:** Next.js 15 + Cloudflare Workers (OpenNext) + Cloudflare D1 + Drizzle ORM
**Target Scale:** 1.000.000 request / bulan
**Bahasa dokumen:** Bahasa Indonesia

---

## Tentang Proyek

Platform marketplace paket tour Batam. Customer bisa memilih paket (Tour, Transport, Hotel), booking online, dan admin menerima notifikasi real-time via WhatsApp + email konfirmasi otomatis ke customer.

**Tujuan utama:**

1. Konversi booking langsung (bukan lewat OTA)
2. Admin kelola pesanan dari satu dashboard
3. Multi-bahasa: Indonesia, Melayu, English, Mandarin
4. Infrastruktur sangat murah: ≤ $15/bulan di 1jt request

---

## Status Repo Saat Ini

| Item                     | Status                                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Next.js version          | ✅ 15.5.22 (React 19)                                                                                    |
| Landing page template    | ✅ Ada (14 section + shadcn/ui)                                                                          |
| Boilerplate per docs     | ✅ Route katalog, booking, admin, actions, DB layer                                                      |
| Booking platform (fitur) | ✅ MVP: katalog+filter, booking real (D1/SQLite), notif fire-and-forget, admin auth + dashboard + status |
| Gallery (fitur)          | ✅ Grid Instagram-style `/gallery`, caption per bahasa, CRUD admin (upload via image-uploadr)            |

Repo berisi **shadcn landing page template** (14 section) + **platform booking MVP** yang dibangun di atasnya mengikuti dokumen ini.

**Struktur kode saat ini:**

```
destitour/
├── app/
│   ├── layout.tsx            # Root layout (Navbar + ThemeProvider + I18nProvider + Poppins)
│   ├── page.tsx              # Homepage (semua section)
│   ├── globals.css
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # 404 custom
│   ├── loading.tsx           # Loading state global
│   ├── actions/booking.ts    # Server Action createBooking (zod + rate limit + D1 + notif)
│   ├── actions/admin.ts      # login/logout/updateBookingStatus (auth session)
│   ├── actions/packages.ts   # create/update/delete/toggle paket (auth session)
│   ├── actions/gallery.ts    # create/update/delete foto galeri (auth session)
│   ├── (marketing)/packages/ # Katalog paket (filter kategori) + detail [slug] (real data)
│   │   └── [slug]/           # Detail paket + BookingDialog modal (form + sukses)
│   ├── (marketing)/gallery/  # Grid galeri publik (Instagram-style, caption per bahasa)
│   ├── (marketing)/about/    # Halaman tentang kami
│   ├── admin/
│   │   ├── layout.tsx        # Guard auth admin (redirect kalau belum login)
│   │   ├── login/            # Login admin (real auth, rate limited)
│   │   ├── bookings/         # Dashboard booking (real data, filter, pagination, search)
│   │   │   └── [id]/         # Detail booking + ubah status + admin notes
│   │   ├── packages/         # CRUD paket (list, new, [id]/edit)
│   │   └── gallery/          # CRUD galeri (list, new, [id]/edit)
│   └── api/
│       ├── packages/         # GET /api/packages (+ filter category)
│       ├── packages/[slug]/  # GET /api/packages/[slug]
│       └── bookings/         # POST /api/bookings (fallback tanpa JS)
├── components/
│   ├── layout/               # Navbar, Footer, ThemeProvider, LanguageSwitcher
│   ├── booking/              # StatusBadge helper
│   ├── ui/                   # shadcn/ui (design rules: rounded-full, flat, borderless)
│   └── icons/
├── lib/
│   ├── auth/                 # password.ts (PBKDF2 WebCrypto), session.ts (HMAC cookie)
│   ├── db/
│   │   ├── schema.ts         # Drizzle: packages, bookings, admins, gallery_items
│   │   ├── client.ts         # D1 (production) + better-sqlite3 (local dev), auto-migrate
│   │   ├── seed.ts           # Data paket + galeri awal
│   │   └── repositories/     # packages.ts, bookings.ts, admins.ts, gallery.ts
│   ├── services/
│   │   ├── booking-code.ts   # Generator kode booking BT-YYYYMMDD-NNN
│   │   └── notifications.ts  # WA admin + Resend email (fire-and-forget, never block)
│   ├── validations/          # booking.ts, packages.ts, gallery.ts (zod schema)
│   ├── security/rate-limit.ts# In-memory sliding window per IP
│   ├── i18n/provider.tsx     # Lightweight i18n (id/ms/en/zh) via messages/
│   ├── env.ts                # Validasi env (zod)
│   ├── validations/booking.ts# Zod schema booking
│   └── utils/
├── messages/                 # id.json, ms.json, en.json, zh.json
├── scripts/                  # seed.ts, hash-password.ts
├── drizzle/                  # Folder hasil db:generate
├── drizzle.config.ts
└── docs/                     # Dokumentasi ini
```

---

## Quickstart (Dev Lokal)

```bash
# 1. Install dependencies
npm install

# 2. Siapkan env lokal (dari template)
cp .env.example .env.local

# 3. Seed DB lokal (membuat data/destitour.db + auto-migrate + seed paket/admin/booking contoh)
npm run db:seed
#   → Admin default (dev): admin@destitour.com / admin123
#   → Ganti password admin: npm run hash-password -- "passwordbaru" lalu update ADMIN_PASSWORD_HASH di .env.local + re-seed

# 4. Jalankan dev server
npm run dev
# → http://localhost:3000

# 5. Build produksi
npm run build

# 6. Lint
npm run lint

# 7. Generate & apply DB migration (Drizzle)
npm run db:generate   # buat SQL migration baru dari perubahan schema
npm run db:migrate    # apply ke D1 remote (butuh CLOUDFLARE_* env)

# 8. Buka Drizzle Studio (explore data lokal)
npm run db:studio
```

> **Catatan DB:** `getDb()` otomatis memilih **D1 binding** saat di-deploy ke Cloudflare Workers (binding `DB`), atau **SQLite lokal** (`data/destitour.db`) di local dev — migration diaplikasikan otomatis saat pertama akses. Test end-to-end alur booking, notif, dan admin langsung jalan di local dev tanpa API key eksternal (notif di-log "skipped").

> **Notifikasi:** WhatsApp (Wati/AiSensy/Interakt) & Resend adalah **fire-and-forget** — kalau gagal, booking TIDAK dibatalkan (lihat [07-notifications.md](./07-notifications.md)). Isi `RESEND_API_KEY` + `WHATSAPP_*` di `.env.local` untuk mengaktifkan pengiriman nyata.

---

## Navigasi Dokumen

| #   | Dokumen                                                  | Isi Singkat                                                                            |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | [01-prd.md](./01-prd.md)                                 | Ringkasan produk, tujuan bisnis, target user, fitur MVP, out of scope, success metrics |
| 2   | [02-technical-spec.md](./02-technical-spec.md)           | Arsitektur, tech stack, env variables, struktur folder target                          |
| 3   | [03-database-schema.md](./03-database-schema.md)         | Schema D1: `packages`, `bookings`, `admins` + index                                    |
| 4   | [04-user-flow.md](./04-user-flow.md)                     | Alur customer booking & admin, pipeline booking, state status                          |
| 5   | [05-api-server-actions.md](./05-api-server-actions.md)   | Server actions, endpoint, validasi zod, keamanan                                       |
| 6   | [06-i18n.md](./06-i18n.md)                               | 4 bahasa, struktur messages, routing locale                                            |
| 7   | [07-notifications.md](./07-notifications.md)             | Template WA admin, email customer, provider, failure handling                          |
| 8   | [08-roadmap.md](./08-roadmap.md)                         | Phase MVP → Improvement → Scale                                                        |
| 9   | [09-non-functional.md](./09-non-functional.md)           | Performance, security, cost estimation, scalability                                    |
| 10  | [10-acceptance-criteria.md](./10-acceptance-criteria.md) | Kriteria MVP + checklist QA manual                                                     |
| 11  | [11-appendix.md](./11-appendix.md)                       | Contoh data, status booking, format kode, glosarium                                    |
| 12  | [12-design-rules.md](./12-design-rules.md)               | Design rules: Google Material, rounded full, flat, modern, simple                      |
| 13  | [13-blog.md](./13-blog.md)                               | PRD Blog: TipTap JSON, R2, SEO, roadmap                                                |
| 14  | [14-deployment.md](./14-deployment.md)                   | Panduan deploy ke Cloudflare: env, migration, verifikasi, rollback                     |

---

## Ringkasan Cepat per Topik

### Arsitektur

```
Browser (Customer/Admin)
   │ HTTPS
   ▼
Cloudflare Workers (Next.js via OpenNext)
   │ Binding
   ▼
Cloudflare D1 (SQLite)      External: Resend + WhatsApp API
```

Detail lengkap: [02-technical-spec.md](./02-technical-spec.md)

### Database

| Tabel          | Fungsi                                     | Status |
| -------------- | ------------------------------------------ | ------ |
| `packages`     | Katalog paket (tour/transport/hotel)       | ✅     |
| `bookings`     | Semua data booking customer                | ✅     |
| `gallery_items`| Foto galeri publik (image_url + caption)   | ✅     |
| `admins`       | Kredensial admin (opsional)                | ✅     |

Detail lengkap: [03-database-schema.md](./03-database-schema.md)

### Alur Utama

- **Customer:** homepage → pilih kategori → detail paket → form booking → submit → sukses + nomor booking
- **Sistem saat submit:** generate booking_code → simpan D1 → WA admin → email customer
- **Admin:** login → dashboard → filter → detail → ubah status

Detail lengkap: [04-user-flow.md](./04-user-flow.md)

### Stack Inti

| Layer    | Teknologi                          |
| -------- | ---------------------------------- |
| Frontend | Next.js 15 (App Router) + Tailwind |
| Backend  | Server Actions + API Routes        |
| DB       | Cloudflare D1 + Drizzle ORM        |
| i18n     | next-intl (id/ms/en/zh)            |
| Notif    | WhatsApp API + Resend (email)      |

---

## Kontribusi / Update Dokumen

Dokumen ini adalah **living document**. Ikuti aturan berikut saat mengupdate:

1. **Satu topik = satu file.** Jangan tambah section baru langsung di `index.md`.
2. **Penomoran file:** `NN-nama-file.md` (01, 02, ...) supaya urutan jelas.
3. Setiap file seksi diawali blokquote `> Bagian dari dokumentasi Destitour Booking Platform.` dan diakhiri link ke file berikutnya.
4. Update **ringkasan per topik** di `index.md` jika ada perubahan besar di section manapun.
5. Update **versi** & **tanggal** di header `index.md` setiap ada perubahan.

---

## Log Perubahan

| Tanggal        | Perubahan                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5 Agustus 2026 | Split dokumentasi monolitik jadi multi-file; index.md jadi hub navigasi                                                                                                                                                                                                                                                                           |
| 5 Agustus 2026 | Upgrade Next.js 14 → 15.1.11 (React 19); siapkan boilerplate per docs (routes, actions, DB layer, messages); tambah 12-design-rules.md + terapkan design rules ke UI                                                                                                                                                                              |
| 5 Agustus 2026 | Perbaikan deps: install tanpa `--legacy-peer-deps`, hilangkan warning `element.ref` React 19, upgrade next → 15.5.22 (fix CVE critical) + drizzle-orm → 0.45.2 + drizzle-kit → 0.31.10 (fix CVE high)                                                                                                                                             |
| 5 Agustus 2026 | **MVP production-ready**: DB dual-mode (D1 + SQLite lokal), seed + migration otomatis, createBooking real (rate limit + zod + booking code + notif fire-and-forget), admin auth (PBKDF2 + HMAC session), dashboard real (filter/pagination/search/status), API routes, error boundaries, i18n lightweight, design rules borderless + font Poppins |
| 8 Agustus 2026 | **Fitur Galeri**: tabel `gallery_items` + migration, CRUD admin `/admin/gallery` (upload via image-uploadr, crop 1:1), grid publik `/gallery` Instagram-style (square tile + caption per bahasa), seed sample, i18n + SEO 4 bahasa |
| 8 Agustus 2026 | **Deploy staging**: sync env R2 ke staging, apply migration 0002–0004 + seed galeri ke D1 remote, fix `NEXT_PUBLIC_SITE_URL`, verifikasi guard/upload/canonical. Tambah [14-deployment.md](./14-deployment.md) (panduan + best practices deploy) |
| 8 Agustus 2026 | Docs: [12-design-rules.md](./12-design-rules.md) — aturan wajib pakai `ModalImageUploader` untuk semua upload gambar (pola, rasio crop per konteks, larangan) |

---

## Next Steps (Top Prioritas)

1. ✅ Setup schema D1 + migration ([03-database-schema.md](./03-database-schema.md))
2. ✅ Build homepage + katalog paket
3. ✅ Form booking + notifikasi WA/email
4. ✅ Admin dashboard + auth
5. ✅ i18n 4 bahasa (lightweight; upgrade ke next-intl + locale routing = Phase 2)

**Deploy ke Cloudflare:** pakai OpenNext Cloudflare adapter.

```bash
npm install                     # sekali: @opennextjs/cloudflare + wrangler (sudah terpasang)
# 1. Siapkan env deploy (.env.staging / .env.prod), isi AUTH_SECRET, RESEND_API_KEY, dll
# 2. Preview lokal (Worker runtime + D1 lokal):
npm run preview
# 3. Apply migration + seed ke D1 (remote):
npx wrangler d1 migrations apply destitour-db --remote
# 4. Deploy ke Cloudflare Workers:
npm run deploy:staging   # atau deploy:prod
```

- `wrangler.jsonc` mengikat D1 `destitour-db` sebagai binding `DB`; `getDb()` otomatis memakainya via `getCloudflareContext()` di production, atau SQLite lokal (`data/destitour.db`) di `next dev`.
- Isi `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` (hash dari `npm run hash-password`) di `.env.staging`/`.env.prod` sebelum deploy.
- Set vars runtime (AUTH_SECRET, RESEND_API_KEY, R2_*, dll) juga di Cloudflare dashboard supaya tetap ada saat redeploy, atau pakai `opennextjs-cloudflare deploy -- --keep-vars`.

Detail di [02-technical-spec.md](./02-technical-spec.md).
