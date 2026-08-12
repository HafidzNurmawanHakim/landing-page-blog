# 4. User Flow

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 4.1 Customer Booking Flow

```
1. Customer buka homepage
2. Pilih bahasa
3. Pilih paket tour dari daftar (transport/hotel punya halaman terpisah)
4. Buka detail paket
5. Klik "Booking Sekarang" → form terbuka di modal/drawer
6. Isi form (di modal):
   - Nama
   - No. HP / WA
   - Tanggal berangkat & pulang (date picker)
   - Jumlah peserta
   - Catatan
7. Submit
8. Sistem:
   a. Generate booking_code
   b. Simpan ke D1
   c. Kirim WhatsApp ke Admin
   d. Kirim Email konfirmasi ke Customer
9. Tampilkan halaman sukses + nomor booking (di dalam modal)
```

### Detail Langkah 8 (Pipeline Booking)

```
Submit form (validasi zod)
        │
        ▼
Generate booking_code (BT-YYYYMMDD-NNN)
        │
        ▼
INSERT ke D1 (status = pending)
        │
        ▼
┌───────┴────────┐
│ Partial fail?  │──► Rollback + tampilkan error ke customer
└───────┬────────┘
        │ success
        ▼
Fire WhatsApp notif ke admin (fire-and-forget, jangan block)
        │
        ▼
Fire Email konfirmasi ke customer (via Resend)
        │
        ▼
Tampilkan step sukses di dalam modal booking
```

### Aturan Penting

- **Order penting:** simpan ke DB dulu, baru kirim notifikasi. Jangan sebaliknya.
- **Notifikasi jangan blocking:** kalau WhatsApp/Email gagal, booking tetap tersimpan; kegagalan dicatat dan bisa retry manual.

## 4.2 Admin Flow

```
1. Login di /admin/login
2. Dashboard → list booking terbaru
3. Filter by status / tanggal
4. Klik detail → lihat data lengkap
5. Ubah status (Confirmed / Cancelled)
6. (Opsional) Tambah admin notes
```

### State Transisi Status

```
 pending ──► confirmed ──► completed
    │            │
    └─────► cancelled
```

- `pending` → `confirmed`: admin setujui
- `pending` → `cancelled`: dibatalkan (belum dikonfirmasi)
- `confirmed` → `completed`: tour selesai
- `confirmed` → `cancelled`: batal setelah konfirmasi (harus tulis admin_notes)

---

**Lanjutkan ke:** [5. API & Server Actions](./05-api-server-actions.md)
