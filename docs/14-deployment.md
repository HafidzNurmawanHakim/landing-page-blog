# 14. Deployment & Best Practices

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

Dokumen ini adalah panduan deploy resmi ke Cloudflare Workers (OpenNext) + D1,
dengan best practice yang dikumpulkan dari pengalaman produksi + staging.

---

## 1. Prasyarat

| Item                          | Keterangan                                                              |
| ----------------------------- | ----------------------------------------------------------------------- |
| Wrangler login                | `npx wrangler whoami` — harus menunjuk akun yang benar (OAuth token)    |
| D1 database                   | Sudah dibuat: `destitour-db` (binding `DB` di `wrangler.jsonc`)         |
| Env file target               | `.env.staging` atau `.env.prod` (lihat §2)                              |
| R2 bucket + public URL        | Wajib untuk upload gambar (paket & galeri), lihat §2.2                  |
| Cloudflare dashboard (opsional)| Akses untuk set runtime secrets / rollback                              |

> Sebelum deploy, pastikan `npm run lint` dan `npm run build` hijau.
> `next build` lokal butuh env production yang valid (AUTH_SECRET, RESEND_API_KEY,
> NEXT_PUBLIC_SITE_URL non-localhost) — kalau tidak, build gagal di validasi `lib/env.ts`.

---

## 2. Environment Management

### 2.1 Aturan Env

| File                    | Dipakai saat                                        | Git        |
| ----------------------- | --------------------------------------------------- | ---------- |
| `.env.development.local`| `next dev` (lokal)                                  | di-ignore  |
| `.env`                  | Build deploy — di-copy otomatis dari env target     | di-ignore  |
| `.env.staging` / `.env.prod` | Deploy target (`cp <file> .env`)              | di-ignore  |
| `.env.example`          | Template semua var                                  | **tracked**|

Script deploy (`package.json`) melakukan `cp .env.staging .env` / `cp .env.prod .env`
**sebelum** `opennextjs-cloudflare build`. Jadi nilai yang di-build adalah isi env target.

> ⚠️ Jangan pernah commit `.env*` berisi secret. Hanya `.env.example` yang tracked.

### 2.2 Variabel yang Wajib Benar per Environment

| Var                   | Staging / Prod                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`| **URL worker yang benar-benar aktif** (hasil `opennextjs-cloudflare deploy`). URL lama/asal-asalan → canonical & OG salah. |
| `AUTH_SECRET`         | Min 32 char, kuat, berbeda tiap environment                                               |
| `RESEND_API_KEY`      | Wajib di production (email customer)                                                       |
| `R2_*` (4 var + ACCOUNT_ID) | Wajib untuk upload gambar. Kalau kosong, `storeMedia` throw `"R2 belum dikonfigurasi"` dan upload gagal. |

> **Cara validasi URL worker:** jalankan deploy, lalu buka URL yang dicetak wrangler
> (`https://<nama>.<account>.workers.dev`). Pakai URL itu sebagai `NEXT_PUBLIC_SITE_URL`.

### 2.3 Runtime Vars vs Build

- `NEXT_PUBLIC_*` → di-inline saat build (client bundle).
- Var server (`AUTH_SECRET`, `RESEND_API_KEY`, `R2_*`) → dibaca `process.env` di runtime.
  OpenNext menyalin `.env` build ke `.open-next/server-functions/default/.env`
  dan meng-inject ke worker saat deploy.
- Kalau mau var yang tidak ikut build (diputar per deploy), set sebagai **Worker Secret
  di Cloudflare dashboard** — nilai dashboard menimpa nilai build.

---

## 3. Pipeline Deploy

```bash
# Preview lokal (Worker runtime + D1 lokal)
npm run preview

# Staging
npm run deploy:staging    # = cf-typegen → cp .env.staging .env → build → deploy

# Production
npm run deploy:prod       # = cf-typegen → cp .env.prod .env → build → deploy
```

Urutan kerja yang disarankan:

1. **Beri tanda di changelog docs** (lihat [index.md](./index.md) → Log Perubahan).
2. Jalankan lint + build lokal untuk validasi tipe.
3. Generate + sync migration (`db:generate`, lalu sync `migrations/` — lihat §4).
4. Apply migration ke D1 remote.
5. Deploy.
6. Verifikasi (lihat §5).

---

## 4. Database Migration (D1)

Ada **dua sumber migration** yang harus selalu sinkron:

| Folder         | Dipakai oleh                                      |
| -------------- | ------------------------------------------------- |
| `drizzle/`     | Migrator lokal (`lib/db/client.ts`) — auto-apply di `next dev` |
| `migrations/`  | `wrangler d1 migrations apply` ke D1 remote (folder default wrangler) |

### 4.1 Workflow Tambah Kolom / Tabel Baru

```bash
# 1. Ubah lib/db/schema.ts, lalu generate migration ke drizzle/
npm run db:generate

# 2. SYNC ke migrations/ — folder ini TIDAK otomatis ter-update!
cp drizzle/XXXX_*.sql migrations/

# 3. Apply ke D1 remote
npx wrangler d1 migrations apply destitour-db --remote
```

> ⚠️ **Penyebab umum bug:** `drizzle/` punya file yang `migrations/` belum punya.
> Sebelum deploy, pastikan kedua folder punya file migration yang sama persis
> (`diff drizzle migrations`). Kalau tidak, lokal jalan tapi remote error/behavior beda.

### 4.2 Pengecekan

```bash
# Cek migration yang sudah ter-apply di remote
npx wrangler d1 execute destitour-db --remote --command "SELECT * FROM d1_migrations;"

# Cek tabel remote
npx wrangler d1 execute destitour-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### 4.3 Seed Data ke Remote

`npm run db:seed` hanya meng-seed **SQLite lokal**. Untuk seed D1 remote:

```bash
# Tulis INSERT ke file SQL, lalu:
npx wrangler d1 execute destitour-db --remote --file=./seed-gallery.sql
```

---

## 5. Checklist Verifikasi Pasca-Deploy

```bash
# URL worker (dari output deploy)
URL=https://destitour.destitours.workers.dev

# 1. Halaman publik
curl -s -o /dev/null -w "%{http_code}\n" $URL/gallery          # → 200
curl -s -o /dev/null -w "%{http_code}\n" $URL/packages         # → 200

# 2. Canonical & OG (NEXT_PUBLIC_SITE_URL benar)
curl -s -H "Cache-Control: no-cache" $URL/gallery \
  | grep -oE '<link rel="canonical" href="[^"]*"'              # host = $URL

# 3. Guard admin (tanpa cookie harus redirect ke login)
curl -s $URL/admin/gallery | grep -o "url=/admin/login"        # harus ketemu
curl -s $URL/admin/testimonials | grep -o "url=/admin/login"   # harus ketemu

# 4. Upload route terkunci (tanpa session → 401)
curl -s -o /dev/null -w "%{http_code}\n" \
  -F "file=@test.jpg;type=image/jpeg" $URL/api/admin/media/upload   # → 401

# 5. Data dari D1 remote tampil
curl -s $URL/gallery | grep -o "Pantai tropis"                  # caption hasil seed
curl -s $URL | grep -o "Bookingnya gampang banget"              # testimoni hasil seed
```

Checklist manual:

- [ ] Semua halaman publik 200 (home, packages, about, gallery)
- [ ] Canonical + OG URL mengarah ke URL yang benar
- [ ] `/admin/*` redirect ke `/admin/login` saat belum login
- [ ] Login admin berhasil, CRUD jalan
- [ ] Upload gambar (paket & galeri) tersimpan di R2 dan tampil
- [ ] CRUD testimoni jalan; testimoni baru muncul di beranda setelah aktif
- [ ] Booking baru masuk ke D1 remote
- [ ] Error boundaries tidak muncul di konsol / halaman

---

## 6. Rollback

```bash
# Daftar versi & pilih versi sebelumnya
npx wrangler deployments list --name destitour

# Rollback ke versi spesifik
npx wrangler rollback --name destitour <version-id>
```

> Rollback kode tidak mengembalikan data D1. Untuk data:
> - D1 punya **Time Travel** (restore snapshot) — pakai Cloudflare dashboard.
> - Buat backup manual sebelum operasi berisiko:
>   `npx wrangler d1 export destitour-db --remote --output backup.sql`

---

## 7. Troubleshooting

| Gejala                                        | Kemungkinan Penyebab                                   | Solusi                                                            |
| --------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Build gagal: `AUTH_SECRET must be set...`     | Build tanpa env production                              | Isi `AUTH_SECRET` + `RESEND_API_KEY` + `NEXT_PUBLIC_SITE_URL` valid |
| Upload gambar gagal `R2 belum dikonfigurasi`  | `R2_*` kosong di env target                             | Isi 5 var R2 di env target, redeploy                               |
| Canonical / OG pakai URL lama                 | `NEXT_PUBLIC_SITE_URL` salah atau stale                 | Set ke URL worker asli, redeploy                                  |
| Galeri tampil kosong / data beda              | Migration belum di-apply / seed belum jalan             | `wrangler d1 migrations apply` + seed via `--file`                 |
| Perubahan tampilan baru tidak muncul          | Edge cache                                             | `curl -H "Cache-Control: no-cache" <url>?t=<timestamp>`            |
| Error `table already exists` saat apply       | Migration sudah sebagian ter-apply manual               | Hapus baris terkait di `d1_migrations`, atau rename migration      |

---

## 8. Best Practices Ringkas

1. **Sync `drizzle/` ↔ `migrations/`** setiap ganti schema — dua-duanya source of truth.
2. **Validasi `NEXT_PUBLIC_SITE_URL`** dari output deploy, bukan menebak URL.
3. **Uji upload ke R2** sebelum release (lihat §5 poin 5 + test S3 client langsung).
4. **Jangan commit secret**; gunakan dashboard untuk var yang harus diputar.
5. **Rollback kode ≠ rollback data** — backup D1 sebelum operasi berisiko.
6. **Catat deploy di changelog docs** (index.md) supaya jejak fitur jelas.
7. **Staging harus mirror production** — env staging yang beda (mis. R2 kosong)
   bikin bug upload tidak terdeteksi sebelum rilis.
8. **Verifikasi dengan curl** (bukan cuma buka browser) untuk memastikan guard auth,
   canonical, dan data remote benar.

---

**Kembali ke:** [Dokumentasi Utama](./index.md)
