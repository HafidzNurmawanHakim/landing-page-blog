# 10. Acceptance Criteria (MVP)

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 10.1 Kriteria

- [x] Customer bisa melihat daftar paket Tour, Transport, Hotel (filter kategori)
- [x] Customer bisa submit booking lengkap (validasi zod + rate limit)
- [x] Data booking tersimpan (D1 di prod / SQLite lokal)
- [x] Admin menerima WhatsApp notifikasi (fire-and-forget, saat API key di-set)
- [x] Customer menerima email konfirmasi (via Resend, saat API key di-set)
- [x] Admin bisa login dan melihat list booking (session HMAC + PBKDF2)
- [x] Admin bisa mengubah status booking (+ admin notes wajib saat cancel)
- [x] Website responsive (mobile first)
- [x] Customer bisa ganti bahasa (ID / MS / EN / ZH via switcher)

## 10.2 Uji Manual (Checklist QA)

### Customer Path

- [ ] Buka homepage → pilih bahasa EN → konten berubah ke English
- [ ] Klik kategori Hotel → list paket hotel tampil
- [ ] Buka detail paket → itinerary, include/exclude terlihat
- [ ] Submit form booking tanpa email → berhasil (email opsional)
- [ ] Submit form dengan tanggal pulang sebelum berangkat → muncul error validasi
- [ ] Setelah submit → muncul step sukses + nomor booking (di modal)
- [ ] Di browser lain / incognito → data booking tampil di dashboard admin

### Admin Path

- [ ] Login dengan kredensial benar → masuk dashboard
- [ ] Login dengan kredensial salah → error
- [ ] Filter booking by status `pending` → hanya pending yang tampil
- [ ] Ubah status booking → status berubah di list & detail
- [ ] Halaman dashboard diakses tanpa login → redirect ke login

### Notifikasi

- [ ] Booking baru → WA admin masuk dalam < 1 menit
- [ ] Booking baru → email customer masuk (jika email diisi)
- [ ] WhatsApp API gagal (simulasi) → booking tetap tersimpan di DB

## 10.3 Definisi Done

Sebuah fitur dianggap selesai jika:

1. Kode sudah di-review dan merge
2. Lint & typecheck lolos (`npm run lint`)
3. Checklist QA di atas lolos untuk fitur terkait
4. Sudah di-deploy ke staging/preview dan diverifikasi

---

**Lanjutkan ke:** [11. Lampiran](./11-appendix.md)
