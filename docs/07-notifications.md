# 7. Notifikasi

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 7.1 WhatsApp ke Admin (Template)

```
🚨 BOOKING BARU

Kode: BT-20260805-001
Paket: Batam 3D2N
Nama: Budi Santoso
HP: 08123456789
Tanggal: 12-14 Agustus 2026
Peserta: 4 orang
Catatan: Minta hotel dekat pusat kota

Lihat detail: https://destitour.com/admin/bookings/123
```

### Provider WhatsApp

| Provider | Kelebihan                     | Catatan                 |
| -------- | ----------------------------- | ----------------------- |
| Wati     | Template message, mudah setup | Ada free trial          |
| AiSensy  | Dashboard bagus, WhatsApp API | Pricing per bulan       |
| Interakt | Support banyak negara         | Baik untuk multi-region |

> Saran: mulai dari provider yang mendukung **template message** supaya terhindar dari spam-lock WhatsApp Business.

## 7.2 Email ke Customer

- **Subject:** `Konfirmasi Booking - BT-20260805-001`
- **Isi:**
  - Ringkasan booking (paket, tanggal, jumlah peserta, harga)
  - Nomor booking
  - Instruksi selanjutnya: tunggu konfirmasi admin via WhatsApp/telepon
  - Kontak admin (WA + email)
- **Provider:** Resend (free tier hingga 3.000 email/bulan, cukup untuk MVP)

### Flow Pengiriman

```
Booking saved (status pending)
        │
        ├──► WhatsApp → Admin (template message)
        └──► Email → Customer (via Resend)
```

## 7.3 Failure Handling

- Gagal kirim WhatsApp / Email → jangan gagalkan booking
- Log error + tambah kolom status notifikasi di tabel booking (opsional)
- Notifikasi admin tetap bisa dibuka dari dashboard (data ada di D1)
- Retry manual: tombol "Kirim ulang notifikasi" di detail booking (opsional)

---

**Lanjutkan ke:** [8. Roadmap](./08-roadmap.md)
