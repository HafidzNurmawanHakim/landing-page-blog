# 1. Product Requirements Document (PRD)

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 1.1 Ringkasan Produk

Website marketplace paket tour Batam yang memungkinkan customer memilih paket (Tour, Transport, Hotel), melakukan booking online, dan admin menerima notifikasi real-time melalui WhatsApp + email konfirmasi otomatis ke customer.

## 1.2 Tujuan Bisnis

- Meningkatkan konversi booking langsung (bukan lewat OTA)
- Mempermudah admin mengelola pesanan
- Support multi-bahasa (Indonesia, Melayu, English, Mandarin)
- Biaya infrastruktur sangat rendah (< $15/bulan pada skala 1jt request)

## 1.3 Target Pengguna

| Persona              | Deskripsi                                   | Kebutuhan Utama                                        |
| -------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Customer (Wisatawan) | Individu / grup yang ingin liburan ke Batam | Cari paket, booking cepat, konfirmasi jelas            |
| Admin                | Pemilik / staf tour operator                | Lihat booking masuk, ubah status, terima notifikasi WA |

## 1.4 Fitur Utama (MVP)

### Customer Facing

1. **Homepage**
   - Highlight 3 kategori utama: Paket Tour, Transport, Hotel
   - Language switcher (ID / MS / EN / ZH)

2. **Katalog Paket**
   - List paket dengan filter (durasi, harga)
   - Detail paket (itinerary, harga, include/exclude)

3. **Form Booking**
   - Field wajib:
     - Kode Paket (otomatis terisi)
     - Nama Lengkap
     - Nomor WhatsApp / HP
     - Tanggal Keberangkatan
     - Tanggal Kepulangan
     - Jumlah Peserta
     - Catatan (opsional)
   - Setelah submit:
     - Data masuk database
     - Notifikasi WhatsApp ke Admin
     - Email konfirmasi ke Customer

### Admin Facing

1. **Login Admin** (simple auth)
2. **Dashboard Booking**
   - List semua booking (pagination + filter status & tanggal)
   - Ubah status: `pending` → `confirmed` → `cancelled`
   - Lihat detail lengkap booking

## 1.5 Out of Scope (MVP)

- Payment gateway online
- Invoice PDF otomatis
- Multi-admin dengan role
- Customer account / history booking
- Live chat

## 1.6 Success Metrics

- Booking conversion rate > 3%
- Time to first response admin < 15 menit
- Page load < 1.5 detik (LCP)
- Infrastruktur cost ≤ $15/bulan di 1jt request

---

**Lanjutkan ke:** [2. Technical Specification](./02-technical-spec.md)
