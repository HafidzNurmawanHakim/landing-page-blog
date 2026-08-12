# 17. Infrastructure

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

Dokumen ini menjelaskan **infrastruktur lengkap** platform Destitour dari sisi
non-fungsional: apa saja komponennya, bagaimana mereka saling terhubung, bagaimana
data mengalir, cara kerja backup/recovery, dan estimasi biaya. Ini adalah dokumen
"as-is" — ditulis berdasarkan konfigurasi nyata yang ada di repo (`wrangler.jsonc`,
`package.json`, `lib/`), bukan target ideal.

---

## 1. Prinsip Infrastruktur

1. **Satu kodebase, semua layanan.** Frontend dan backend (Server Actions, API
   routes, migrasi DB, notifikasi) hidup dalam **satu** repo Next.js. Tidak ada
   server terpisah, tidak ada microservice.
2. **Serverless + edge.** Seluruh aplikasi berjalan di Cloudflare Workers —
   tanpa VM, tanpa container, tanpa manajemen proses. Scale otomatis ke 0.
3. **Murah sampai skala besar.** Kombinasi Workers (free tier) + D1 (free tier) +
   R2 + Resend menahan biaya di bawah **$15/bulan** di 1jt request (lihat §15).
4. **Data terpisah dari kode.** Database (D1) dan objek (R2) adalah resource
   Cloudflare yang berdiri sendiri — rollback kode tidak menyentuh data.
5. **Tidak ada server pihak ketiga untuk runtime.** Satu-satunya dependency
   eksternal adalah **Resend** (email). WhatsApp memakai link `wa.me` (bukan API).

---

## 2. Arsitektur Keseluruhan

```
                        Registrar: Hostinger
                        (hanya kepemilikan domain)
                                │  nameservers → ns1/ns2.cloudflare.com
                                ▼
                    Cloudflare (akun: destitours)
                    ├── DNS zone: destitours.com
                    │    ├── A/AAAA   destitours.com        → Workers
                    │    ├── CNAME    www                   → Workers
                    │    ├── CNAME    staging               → Workers
                    │    └── TXT      _domainconnect, email (Resend: DNS record
                    │                  sender policy + verified domain)
                    │
                    ├── Workers (Next.js via OpenNext)
                    │    ├── destitour            (prod)     custom domain
                    │    └── destitour-staging    (staging)  custom domain
                    │         └── getCloudflareContext().env.DB ──► D1
                    │
                    ├── D1 (SQLite)
                    │    ├── destitour-db            (prod)
                    │    └── destitour-db-staging    (staging)
                    │
                    └── R2 (object storage, S3-compatible)
                         └── bucket (images paket/galeri/blog) via @aws-sdk/client-s3
                                  public URL → served lewat next/image

    External:
      Resend  (api.resend.com) ── email konfirmasi customer + notif admin
      WhatsApp wa.me ── link chat, bukan API (tidak ada dependency runtime)
```

Keterangan penting:

- **DNS & email tidak di-host di Hostinger.** Hostinger hanya tempat Anda membeli
  domain (registrar). Nameserver domain diarahkan ke Cloudflare, sehingga seluruh
  pengelolaan DNS ada di dashboard Cloudflare.
- **Email dikirim lewat Resend**, bukan lewat server email Hostinger. Domain
  `destitours.com` perlu diverifikasi di dashboard Resend (TXT record) supaya
  `RESEND_FROM_EMAIL` bisa memakai domain sendiri (bukan `@resend.dev`).

---

## 3. Inventory Komponen (as-is)

| Komponen                    | Teknologi / Nama                     | Peran                                                              | Dimana dikonfigurasi         |
| --------------------------- | ------------------------------------ | ------------------------------------------------------------------ | ---------------------------- |
| Kodebase                    | Next.js 15.5.22 (React 19)           | Frontend + backend (satu repo)                                     | `package.json`               |
| Backend                     | Server Actions + Route Handlers      | Semua logika bisnis, validasi, DB access, notifikasi               | `app/actions/*`, `app/api/*` |
| Runtime & deploy            | Cloudflare Workers + OpenNext        | Menjalankan Next.js di edge serverless                             | `wrangler.jsonc`, `open-next.config.ts` |
| Database (prod)             | Cloudflare D1 `destitour-db`         | SQLite relational: semua data aplikasi                             | `wrangler.jsonc` (binding `DB`) |
| Database (staging)          | Cloudflare D1 `destitour-db-staging` | Isolasi data staging vs prod                                       | `wrangler.jsonc` (env staging) |
| ORM & migration             | Drizzle ORM 0.45 + drizzle-kit       | Type-safe query + SQL migration                                    | `drizzle.config.ts`, `drizzle/`, `migrations/` |
| Object storage              | Cloudflare R2 (S3 API)               | Upload gambar paket/galeri/blog + logo/OG                          | `lib/media/upload.ts`, `R2_*` env |
| Email                       | Resend                               | Email konfirmasi customer + notif admin                            | `lib/services/notifications.ts`, `RESEND_*` |
| WhatsApp                    | Link `wa.me` (tanpa API)             | CTA chat customer → admin (nomor dari site config)                 | `lib/config/site.ts`         |
| Domain                      | `destitours.com` (+ `www`, `staging.`) | Registrar: Hostinger · DNS: Cloudflare                             | `wrangler.jsonc` routes      |
| Dev database lokal          | better-sqlite3 (`data/destitour.db`) | Parity dengan D1 saat `next dev`, auto-migrate                     | `lib/db/client.ts`           |
| Validasi env                | zod (`lib/env.ts`)                   | Fail-fast kalau env produksi salah                                 | `lib/env.ts`                 |

---

## 4. Source Code: Satu Kodebase Next.js

Keputusan utama infra: **frontend dan backend tidak dipisah.**

| Aspek            | Detail                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| Frontend         | React 19 + App Router + Tailwind + shadcn/ui (halaman publik + admin)                                                |
| Backend          | Server Actions (`app/actions/*`) untuk mutasi (booking, CRUD admin, login), Route Handlers (`app/api/*`) untuk read |
| DB access        | `lib/db/client.ts` → `getDb()` otomatis memilih D1 (di Worker) atau SQLite lokal (di dev)                             |
| Notifikasi       | `lib/services/notifications.ts` (Resend) dipanggil dari server action                                               |
| Semua dalam repo | `app/`, `components/`, `lib/`, `messages/`, `migrations/`, `drizzle/`                                                |

Konsekuensinya:

- **Satu build, satu deploy.** `next build` menghasilkan satu artefak; OpenNext
  membungkusnya jadi Worker.
- **Tidak ada masalah CORS internal** — client dan server satu origin.
- **Rate limit & validasi di sisi server** tidak bisa dilewati dari client
  (semua mutasi lewat Server Actions).

---

## 5. Runtime & Deploy: Cloudflare Workers (OpenNext)

### 5.1 Cara kerjanya

Next.js tidak bisa jalan mentah di Workers. `@opennextjs/cloudflare` membangun
aplikasi menjadi:

- `.open-next/worker.js` — entry point Worker (di `wrangler.jsonc` sebagai `main`)
- `.open-next/assets` — static assets (JS/CSS/img) yang di-serve via binding `ASSETS`

Build & deploy dijalankan script npm (`package.json`):

```bash
npm run deploy:staging   # cf-typegen → cp .env.staging .env → build → deploy --env staging
npm run deploy:prod      # cf-typegen → cp .env.prod .env → build → deploy
```

### 5.2 Identitas Worker

| Properti          | Prod                                | Staging                          |
| ----------------- | ----------------------------------- | -------------------------------- |
| Nama worker       | `destitour`                         | `destitour-staging`              |
| Custom domain     | `destitours.com`, `www.destitours.com` | `staging.destitours.com`      |
| `workers.dev`     | aktif (URL `destitour.<acct>.workers.dev`) | aktif                      |
| D1 binding (`DB`) | `destitour-db`                      | `destitour-db-staging`           |
| Env vars runtime  | dari `.env.prod` + dashboard        | dari `.env.staging` + dashboard  |

`wrangler.jsonc` memakai `env.staging` untuk menimpa `name`, `routes`, dan
`d1_databases` saat deploy staging — kode yang sama, konfigurasi berbeda.

### 5.3 Runtime vars vs build

- `NEXT_PUBLIC_*` di-inline saat build (client bundle). Ganti nilai → wajib redeploy.
- Var server dibaca `process.env` saat runtime; OpenNext menyalin `.env` hasil build
  ke `.open-next/server-functions/default/.env` lalu di-inject ke Worker saat deploy.
- Secret yang ingin diputar tanpa rebuild bisa di-set sebagai **Worker Secret** di
  dashboard Cloudflare (nilai dashboard menimpa nilai build).

> Detail deploy, migration, verifikasi & rollback: [14-deployment.md](./14-deployment.md).

---

## 6. Database: Cloudflare D1 (SQLite)

### 6.1 Profil

| Aspek          | Nilai                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Engine         | SQLite (single-writer, replicated reads)                               |
| Prod           | `destitour-db` (binding `DB`)                                          |
| Staging        | `destitour-db-staging`                                                 |
| Akses kode     | `getCloudflareContext().env.DB` → Drizzle `drizzleD1` (async API)      |
| Lokal          | `data/destitour.db` (better-sqlite3), auto-migrate saat pertama akses  |
| Migrasi        | dua folder sinkron: `drizzle/` (Drizzle) + `migrations/` (wrangler)    |

### 6.2 Tabel utama

`packages`, `transport_products`, `transport_pricing_packages`,
`transport_extra_charges`, `bookings`, `gallery_items`, `gallery_reactions`,
`testimonials`, `blog_posts`, `blog_categories`, `blog_post_reactions`,
`rate_limits`, `site_config`, `admins`.

> Schema lengkap: [03-database-schema.md](./03-database-schema.md).

### 6.3 Karakteristik yang memengaruhi operasional

- **Rate limiting berbasis DB**: `checkRateLimit()` memakai tabel `rate_limits`
  (bukan in-memory) → konsisten di semua edge, tapi membebani D1. Tuning
  `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` jika traffic naik.
- **Free tier D1**: 5 GB storage, 5 juta read rows/hari, 100k write rows/hari.
- **Point-in-time restore**: D1 punya fitur *Time Travel* (snapshot) di dashboard.

---

## 7. Object Storage: Cloudflare R2

### 7.1 Profil

| Aspek           | Nilai                                                             |
| --------------- | ----------------------------------------------------------------- |
| Akses           | S3-compatible via `@aws-sdk/client-s3` (`lib/media/upload.ts`)    |
| Endpoint        | `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` (region `auto`) |
| Public          | `R2_PUBLIC_URL` → bucket public URL / custom domain               |
| Penulisan       | `PutObjectCommand`, key `packages/<uuid>.<ext>`                   |
| Cache header    | `public, max-age=31536000, immutable` (1 tahun, kunci immutable)  |
| Limit file      | 5 MB (`MAX_MEDIA_BYTES`), MIME di-detect dari magic bytes         |
| Serving         | `next/image` (remotePatterns otomatis dari `R2_PUBLIC_URL`)       |

### 7.2 Alur upload (semua upload memakai satu jalur)

```
Browser ──(multipart)──► Server Action upload ──► storeMedia()
   ├─ validasi: ukuran ≤5MB + magic bytes (JPG/PNG/WebP/AVIF/GIF)
   ├─ jika R2_* lengkap → PutObjectCommand ke R2, simpan URL ke D1
   └─ jika R2_* kosong (dev) → tulis ke public/uploads, URL /uploads/...
```

- D1 hanya menyimpan **public URL**, bukan blob. R2 = penyimpanan, D1 = referensi.
- Tanpa `R2_*` lengkap di production, `storeMedia()` melempar `"R2 belum
  dikonfigurasi"` → semua upload gagal. Ini safeguard, bukan bug.
- **R2 tidak punya biaya egress** — trafik baca gratis (beda dengan S3).

---

## 8. Email: Resend

| Aspek              | Nilai                                                              |
| ------------------ | ------------------------------------------------------------------ |
| API                | `POST https://api.resend.com/emails` (fetch native, timeout 10s)   |
| Kredensial         | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (wajib di production)       |
| Sender             | `no-reply@destitours.com` — domain harus verified di dashboard Resend |
| Email yang dikirim | 1) konfirmasi ke customer, 2) notif booking baru ke admin          |
| Keandalan          | Fire-and-forget: gagal → di-log, booking **tidak** dibatalkan       |
| Free tier          | 3.000 email/bulan                                                   |

> Template & konten: [07-notifications.md](./07-notifications.md). Desain
> "never block the pipeline": [04-user-flow.md](./04-user-flow.md).

### 8.1 Setup domain di Resend

1. Tambah domain `destitours.com` di dashboard Resend → Resend memberi 2–3 TXT records.
2. Tambahkan record tersebut di DNS Cloudflare (nama yang sama: `_amazonses.destitours.com`, dll).
3. Tunggu status *Verified* → `RESEND_FROM_EMAIL` siap dipakai.

---

## 9. WhatsApp

- **Bukan API eksternal.** Tidak ada dependency `WHATSAPP_API_KEY` di runtime.
- CTA "Chat WhatsApp" menghasilkan `https://wa.me/<nomor>?text=...` lewat
  `buildWhatsAppLink()`.
- Nomor default diambil dari `site_config` di DB (bisa multi nomor, dipilih per
  booking), lihat [16-admin-guide.md](./16-admin-guide.md).
- Admin menerima notifikasi booking via **email Resend**, bukan push WA.

---

## 10. Domain & DNS

### 10.1 Pembagian tanggung jawab

| Lapisan        | Penyedia          | Peran                                                     |
| -------------- | ----------------- | --------------------------------------------------------- |
| Registrar      | **Hostinger**     | Kepemilikan domain `destitours.com`, perpanjangan          |
| Nameserver     | **Cloudflare**    | `ns1.cloudflare.com` / `ns2.cloudflare.com` di-set di Hostinger |
| DNS zone       | **Cloudflare**    | Semua record dikelola dashboard Cloudflare                |
| CDN/Proxy      | Cloudflare        | Record A/AAAA proxy "orange cloud" → Workers + cache edge |
| Hosting        | Cloudflare        | Workers (aplikasi), D1 (DB), R2 (gambar)                  |

### 10.2 Kenapa nama (record) yang penting

- `A destitours.com` / `AAAA` → proxy ke Worker `destitour` (custom domain).
- `CNAME www` → ke domain utama (redirect `www` → root).
- `CNAME staging` → ke Worker `destitour-staging`.
- `TXT` → verifikasi Resend (email) + SPF/DKIM bila dipakai sender lain.
- Record email (MX) **tidak perlu** dibuat selama semua email keluar lewat Resend
  (Resend mengirim atas nama domain via TXT verification, tanpa mail server sendiri).

> Jangan ubah nameserver Cloudflare ke lain — itu akan memutus seluruh situs,
> staging, dan verifikasi email sekaligus. Nameserver diganti hanya dari panel Hostinger.

---

## 11. Environment & Secrets

| Lingkungan | DB              | Media         | Email/notif         | Cara jalan                    |
| ---------- | --------------- | ------------- | ------------------- | ----------------------------- |
| Lokal      | SQLite `data/` | `public/uploads` | di-log "skipped"   | `npm run dev`                 |
| Staging    | `destitour-db-staging` | R2 bucket staging | aktif (Resend real) | `npm run deploy:staging` |
| Prod       | `destitour-db` | R2 bucket prod | aktif               | `npm run deploy:prod`         |

Aturan env (`lib/env.ts` zod, fail-fast):

- Production **wajib** punya `AUTH_SECRET` kuat (≥32 char, bukan default),
  `NEXT_PUBLIC_SITE_URL` bukan localhost, dan `RESEND_API_KEY`.
- R2 butuh **5 var**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.
- `.env*` berisi secret **tidak boleh di-commit**; hanya `.env.example` yang tracked.
- Staging & prod memakai env file terpisah (`.env.staging` / `.env.prod`) yang
  di-copy ke `.env` saat build — nilai yang di-build adalah isi env target.

---

## 12. Alur Data

### 12.1 Request publik (read)

```
Browser ──HTTPS──► Cloudflare edge (cache) ──► Worker (Next.js)
   ├─ halaman statis / ISR → dari ASSETS / cache → cepat
   └─ halaman dinamis (data DB) → D1 query → render SSR → response
```

### 12.2 Booking (write)

```
Customer submit ──► Server Action createBooking (zod + rate limit D1)
   ├─ generate booking code BT-YYYYMMDD-NNN
   ├─ INSERT ke D1
   └─ dispatchBookingNotifications (fire-and-forget)
        ├─ Resend → email customer (konfirmasi)
        └─ Resend → email admin (alert, link dashboard)
Response sukses + kode booking
```

### 12.3 Upload media (write)

```
Admin upload ──► action upload (auth session) ──► storeMedia()
   ├─ validasi ukuran + tipe
   ├─ PUT objek ke R2
   └─ simpan public URL ke D1
```

---

## 13. Keamanan

| Lapisan     | Mekanisme                                                                          |
| ----------- | ---------------------------------------------------------------------------------- |
| Transport   | HTTPS-only (custom domain), HSTS `max-age=63072000; includeSubDomains; preload`     |
| Headers     | CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (`next.config.mjs`) |
| Auth admin  | Session HMAC cookie + PBKDF2 password hash, guard di `app/admin/layout.tsx`         |
| Upload      | Admin-only (401 tanpa session), size + magic-byte check, key random UUID            |
| Input       | Zod validation di semua action; HTML konten di-sanitize server (`sanitize-html`)    |
| Abuse       | Rate limit per key di D1 (booking, login, like/share)                               |
| Secrets     | Tidak di-commit; Worker Secrets dashboard untuk var yang diputar                    |
| SEO guard   | `/admin/*` diberi `X-Robots-Tag: noindex`                                           |

---

## 14. Backup & Disaster Recovery

### 14.1 Backup data

| Resource | Cara backup                                              | Frekuensi saran |
| -------- | -------------------------------------------------------- | --------------- |
| D1       | `npx wrangler d1 export destitour-db --remote --output backup.sql` | mingguan + sebelum operasi berisiko |
| D1       | Time Travel (snapshot) via dashboard Cloudflare          | otomatis        |
| R2       | Versioning / lifecycle rule di dashboard R2 (jika perlu) | on-demand       |
| Code     | Git repo (push remote)                                   | per commit      |

### 14.2 Skenario recovery

| Skenario                 | Tindakan                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- |
| Kode error               | Rollback Worker: `npx wrangler rollback --name destitour <version-id>`          |
| Data korup / terhapus    | Restore snapshot D1 via Time Travel (kode tidak ikut ter-restore)               |
| Verifikasi email rusak   | Cek TXT records di DNS Cloudflare + status verified di dashboard Resend         |
| Domain kena masalah      | Jangan sentuh nameserver; periksa proxy/record di Cloudflare, status di Hostinger |
| R2 bucket ketinggalan    | Sinkronkan env `R2_*` staging & prod; deploy ulang                             |

---

## 15. Cost Analysis

| Komponen             | Perkiraan / bulan                       |
| -------------------- | --------------------------------------- |
| Workers + static     | $0 (free tier 100k req/hari)            |
| D1                   | $0 (free tier 5GB, 5jt read rows/hari)  |
| R2                   | $0 (10GB free, no egress fee)           |
| Resend               | $0 (free tier 3.000 email)              |
| Domain destitours.com| ~$10–15 / tahun (Hostinger)             |
| **Total runtime**    | **≤ $15/bulan** di 1jt request          |

> Scale lanjutan (>5jt req/bulan): upgrade ke paid Workers ($5–10) + D1 masih masuk akal.

---

## 16. Skalabilitas

- **Worker** men-serve semua request tanpa provisioning — batas konkurensi edge
  otomatis; satu-satunya pembatas adalah kuota CPU/durasi per request.
- **D1** adalah bottleneck alami (single-writer). Mitigasi:
  - Halaman publik di-static-kan / di-cache edge (kanonikal di build).
  - `rate_limits` & like/share tulis per IP — pastikan tetap di bawah kuota
    write rows; naikkan interval rate limit bila perlu.
  - Bila nanti butuh read scale besar: pertimbangkan KV untuk cache read-hot
    (fase berikutnya, lihat [08-roadmap.md](./08-roadmap.md)).
- **R2** tanpa batas praktis untuk konten statis; siap untuk growth katalog.
- **Email (Resend)** gratis 3.000/bulan; di atas itu berbayar — mulai ~$20 per
  50k email, relevan jika volume booking naik signifikan.

---

## 17. Operasional Harian

### 17.1 Checklist berkala

- [ ] `npm run lint` hijau sebelum deploy.
- [ ] Migration `drizzle/` ↔ `migrations/` sinkron (`diff drizzle migrations`).
- [ ] `.env.staging` / `.env.prod` punya secret lengkap (AUTH_SECRET, RESEND_API_KEY, R2_*).
- [ ] `NEXT_PUBLIC_SITE_URL` = URL aktif yang benar.
- [ ] Verifikasi pasca-deploy (curl, lihat [14-deployment.md](./14-deployment.md) §5).
- [ ] Backup D1 mingguan.

### 17.2 Monitoring

Tidak ada external monitor terpasang. Saran:

- Cloudflare dashboard → tab Worker → log real-time (`wrangler tail` untuk debug).
- Resend dashboard → Delivery log (email gagal terlihat di sini).
- D1 dashboard → metrik queries & size.
- Opsional: Uptime check Cloudflare gratis untuk `https://destitours.com`.

---

## 18. Troubleshooting

| Gejala                              | Kemungkinan penyebab                                   | Solusi                                                          |
| ----------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| Situs down total                    | Nameserver/record/proxy rusak                          | Cek DNS Cloudflare + status domain Hostinger                    |
| Upload gambar gagal "R2 belum dikonfigurasi" | `R2_*` tidak lengkap di env target        | Isi 5 var R2, redeploy                                          |
| Email tidak terkirim                | `RESEND_API_KEY`/domain belum verified, kuota habis    | Cek Delivery log Resend + TXT verification                      |
| Data beda staging vs prod           | Migration belum di-apply di salah satu D1              | `wrangler d1 migrations apply` per database                     |
| Canonical/OG salah                  | `NEXT_PUBLIC_SITE_URL` stale                           | Set URL benar, redeploy                                         |
| Build gagal `AUTH_SECRET must be set` | Build tanpa env production valid                    | Isi env target lengkap sebelum `npm run deploy:*`               |
| Rate limit keputus semua user       | `RATE_LIMIT_MAX` terlalu rendah untuk traffic          | Naikkan nilai, redeploy                                         |

---

**Kembali ke:** [Dokumentasi Utama](./index.md)
