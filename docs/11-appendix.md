# 11. Lampiran

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## A. Contoh Data Paket Awal

```json
{
  "code": "BATAM-3D2N",
  "name": "Batam 3 Hari 2 Malam",
  "category": "tour",
  "duration": "3D2N",
  "price": 1850000,
  "description": "Paket lengkap wisata Batam..."
}
```

## B. Status Booking

| Status      | Arti                     |
| ----------- | ------------------------ |
| `pending`   | Baru masuk               |
| `confirmed` | Sudah dikonfirmasi admin |
| `cancelled` | Dibatalkan               |
| `completed` | Tour selesai             |

## C. Format Kode Booking

```
BT-20260805-001
│  │       │
│  │       └─ urutan (001, 002, ...)
│  └─ tanggal (YYYYMMDD)
└─ prefix "BT" (Batam)
```

## D. Glosarium

| Istilah       | Arti                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| OTA           | Online Travel Agency (mis. Traveloka, Tiket.com)                       |
| D1            | Database SQLite serverless dari Cloudflare                             |
| OpenNext      | Tool untuk deploy Next.js ke Cloudflare Workers                        |
| Server Action | Fungsi server yang dipanggil langsung dari form                        |
| denormalisasi | Menyimpan data duplikat (mis. nama paket di booking) agar history aman |
| ISR           | Incremental Static Regeneration (cache halaman)                        |

---

**Kembali ke:** [Dokumentasi Utama](./index.md)
