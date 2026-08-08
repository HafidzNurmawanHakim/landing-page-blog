# 5. API & Server Actions

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 5.1 Server Action: Create Booking

```ts
// src/app/actions/booking.ts
"use server";

export async function createBooking(data: {
  packageCode: string;
  customerName: string;
  phone: string;
  email?: string;
  departureDate: string;
  returnDate: string;
  participants: number;
  notes?: string;
}) {
  // 1. Validasi (zod schema)
  // 2. Generate booking_code
  // 3. Insert ke D1
  // 4. Trigger WhatsApp
  // 5. Trigger Email
  // 6. Return { success: true, bookingCode }
}
```

## 5.2 Admin Actions

| Action                                         | Keterangan                              |
| ---------------------------------------------- | --------------------------------------- |
| `getBookings({ status, page, limit })`         | List booking dengan filter + pagination |
| `getBookingById(id)`                           | Detail satu booking                     |
| `updateBookingStatus(id, status, adminNotes?)` | Ubah status booking                     |
| `createGalleryItemAction(input)`               | Tambah foto galeri (admin session)      |
| `updateGalleryItemAction(id, input)`           | Edit foto galeri (admin session)        |
| `deleteGalleryItemAction(id)`                  | Hapus foto galeri (admin session)       |
| `createTestimonialAction(input)`               | Tambah testimoni (admin session)        |
| `updateTestimonialAction(id, input)`           | Edit testimoni (admin session)          |
| `deleteTestimonialAction(id)`                  | Hapus testimoni (admin session)         |

Public page reads gallery via repository `listGalleryItems` (server component), no public write endpoint.
Public homepage reads testimonials via repository `listTestimonials({ activeOnly: true })` (server component) → no public write endpoint.
Semua action testimoni memakai `requireAdmin()` + redirect `/admin/login`, validasi zod di sisi server, dan `try/catch` agar error DB tidak bocor ke client.

## 5.3 Daftar Endpoint Publik (Route Handlers)

| Method | Path                      | Deskripsi                                                                    |
| ------ | ------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/packages`           | List paket aktif (+ filter kategori, **pagination**)                         |
| GET    | `/api/packages/[slug]`    | Detail satu paket                                                            |
| POST   | `/api/bookings`           | Buat booking baru (fallback tanpa JS)                                        |
| POST   | `/api/admin/media/upload` | Upload gambar produk (admin session, multipart `file`) → `{ data: { url } }` |

> Preferensi utama: pakai Server Actions (form action) daripada API route untuk alur booking, supaya aman dari CSRF dan terintegrasi dengan form state.

## 5.3b Aksi Publik: Like & Share Galeri (Server Actions)

Reaksi galeri (like/share) dihitung **per IP visitor** — data disimpan di
`gallery_reactions` (lihat [03-database-schema.md](./03-database-schema.md) §3.3b),
bukan cookie/localStorage (bisa dihapus/diubah user, dan tidak konsisten lintas device).

| Action                            | Perilaku                                                                  |
| --------------------------------- | ------------------------------------------------------------------------- |
| `toggleGalleryLikeAction(id)`     | Toggle like. 1 IP = 1 like per foto (unique index `gallery_id+ip+type`). Returns `{ liked, likeCount }`. |
| `shareGalleryItemAction(id)`      | Catat share. 1 IP = 1 count per foto (dedupe). Returns `{ counted, shareCount }`. |

- Penulisan hanya lewat Server Action (bukan API route) → aman CSRF (lihat §5.6).
- **Rate limiting per IP** dengan key `gallery-like:<ip>` (max 20/menit) dan
  `gallery-share:<ip>` (max 30/menit) memakai `checkRateLimit` di
  `lib/security/rate-limit.ts` (D1-backed, konsisten lintas worker).
- Insert memakai `INSERT ... ON CONFLICT DO NOTHING` + `UPDATE ... SET counter = counter + 1`
  supaya counter tetap benar saat ada race.
- Halaman `/gallery` (server component) membaca state reaksi IP saat ini via
  `getGalleryReactionStates(ids, ip)` → button sudah benar sejak first paint.
- Error dikembalikan sebagai kode pendek (`invalid_id` / `not_found` /
  `rate_limited` / `server_error`) dan di-map ke string lokal di client —
  action tidak perlu tahu locale request.
- Share client memakai Web Share API (`navigator.share`), fallback ke
  `navigator.clipboard.writeText`, dan hanya menghitung saat share benar-benar
  berhasil (cancel native sheet ≠ dihitung).

## 5.4 Kontrak Response API

Semua response memakai bentuk konsisten `{ data, meta }`.

### Koleksi (list) — `GET /api/packages`

```jsonc
// 200 OK
{
  "data": [
    {
      "id": 1,
      "code": "BATAM-3D2N",
      "name": "Batam 3 Hari 2 Malam",
      "slug": "batam-3d2n",
      "category": "tour",
      "duration": "3D2N",
      "price": 1850000,
      "description": "...",
      "itinerary": ["Hari 1: ...", "Hari 2: ..."],
      "includes": ["Hotel 2 malam", "..."],
      "excludes": ["..."],
      "is_active": 1,
    },
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "totalPages": 3,
  },
}
```

**Parameter query:**

| Param      | Tipe    | Default | Keterangan                                |
| ---------- | ------- | ------- | ----------------------------------------- |
| `category` | string  | `all`   | `tour` \| `transport` \| `hotel` \| `all` |
| `page`     | integer | `1`     | Halaman (mulai dari 1)                    |
| `limit`    | integer | `10`    | Item per halaman, maksimal 100            |

`meta` menjelaskan posisi & ukuran data:

| Field        | Arti                                       |
| ------------ | ------------------------------------------ |
| `page`       | Halaman yang sedang diminta                |
| `limit`      | Jumlah item per halaman yang diterapkan    |
| `total`      | Total item (semua halaman)                 |
| `totalPages` | Total halaman (`Math.ceil(total / limit)`) |

### Single resource — `GET /api/packages/[slug]`

```jsonc
// 200 OK
{ "data": { "id": 1, "code": "BATAM-3D2N", "...": "..." } }
// 404 Not Found
{ "error": "Paket tidak ditemukan." }
```

### Aksi — `POST /api/bookings`

```jsonc
// 201 Created
{ "data": { "bookingCode": "BT-20260805-004" } }
// 400 Bad Request (validasi zod)
{ "errors": [{ "field": "phone", "message": "Nomor HP tidak valid" }] }
```

### Aturan Error

- Selalu HTTP status yang sesuai (`400`, `404`, `500`).
- Response error memakai `{ error: string }`, atau `{ errors: [...] }` untuk validasi per-field.
- Error dari API tidak pernah memakai bentuk `{ data, meta }`.

## 5.5 Validasi Input (Zod)

Contoh schema booking:

```ts
import { z } from "zod";

export const bookingSchema = z.object({
  packageCode: z.string().min(1),
  customerName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().regex(/^[0-9+]{9,15}$/, "Nomor HP tidak valid"),
  email: z.string().email().optional().or(z.literal("")),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  participants: z.number().int().min(1).max(50),
  notes: z.string().max(1000).optional(),
});
```

## 5.6 Keamanan

- Semua input divalidasi zod sebelum masuk DB
- Server Action `createBooking` dilindungi rate limiting (mis. max 10/menit per IP)
- Aksi like/share galeri dilindungi rate limiting per IP (max 20/menit like, 30/menit share) + unique index per IP
- Admin routes butuh sesi Auth.js; cek sesi di setiap action
- XSS dicegah: render data via React (auto-escape), jangan pakai `dangerouslySetInnerHTML`

---

**Lanjutkan ke:** [6. Multi Language (i18n)](./06-i18n.md)
