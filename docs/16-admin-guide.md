# 16. Panduan Penggunaan Admin Dashboard (untuk Owner)

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

Panduan ini ditulis untuk **pemilik bisnis / operator non-teknis** yang
mengelola website Destitour. Tidak perlu tahu kode — ikuti langkah-langkah
berikut untuk mengelola pesanan, paket, galeri, testimoni, blog, dan
pengaturan website.

---

## 16.1 Cara Masuk ke Panel Admin

1. Buka website Destitour: `https://destitours.com`
2. Tambahkan `/admin` di belakangnya: `https://destitours.com/admin`
3. Masukkan **Email** dan **Password** yang sudah diberikan oleh tim teknis.
4. Klik tombol **Masuk**.

Setelah masuk, kamu akan diarahkan ke **Dashboard**. Halaman admin tidak
terlihat oleh pengunjung biasa — setiap orang yang membuka `/admin` tanpa
login akan otomatis dibawa ke halaman login.

> Jika lupa password, hubungi tim teknis. Password tidak bisa direset dari
> dashboard (demi keamanan).

---

## 16.2 Mengenal Layout Panel Admin

Setelah login, panel admin punya beberapa bagian:

- **Menu samping (kiri)** — navigasi utama. Isinya:
  - **Dashboard** — ringkasan angka bisnis.
  - **Booking** — daftar semua pesanan customer.
  - **Paket Tour** — katalog paket wisata.
  - **Transport** — produk rental kendaraan.
  - **Galeri** — foto yang tampil di halaman galeri publik.
  - **Testimoni** — ulasan customer di halaman utama.
  - **Blog** — artikel di halaman blog.
  - **Konfigurasi** — data kontak, WhatsApp, sosmed, alamat.
- **Tombol "Lihat Situs" (kanan atas)** — membuka website publik di tab baru,
  untuk mengecek hasil perubahanmu.
- **Tombol keluar (Logout)** — di paling bawah menu samping.

> Di layar kecil (HP/tablet), menu samping disembunyikan. Klik ikon menu (☰)
> di kiri atas untuk membukanya.

---

## 16.3 Dashboard — Ringkasan Bisnis

Halaman pertama setelah login. Menampilkan 4 angka utama:

| Kartu              | Artinya                                                                      |
| ------------------ | ---------------------------------------------------------------------------- |
| **Total Booking**  | Jumlah seluruh pesanan yang pernah masuk.                                    |
| **Menunggu Konfirmasi** | Berapa pesanan yang belum kamu proses (status *Pending*).              |
| **Estimasi Pendapatan** | Total nilai pesanan (belum termasuk biaya operasional / yang dibatalkan). |
| **Paket Aktif**    | Berapa paket yang tampil di website dari total paket (contoh: `4 / 6`).       |

Klik salah satu kartu untuk langsung ke halaman terkait (misal klik
"Menunggu Konfirmasi" untuk membuka daftar pesanan yang harus diproses).

Di bawahnya ada **"Booking Terbaru"** — 5 pesanan terakhir. Klik kode booking
untuk membuka detail pesanan.

---

## 16.4 Mengelola Booking (Pesanan Customer)

### Melihat Daftar Pesanan

Menu **Booking** → daftar semua pesanan. Fitur di halaman ini:

- **Filter status** (pill di atas tabel): *Semua*, *Pending* (menunggu),
  *Dikonfirmasi*, *Selesai*, *Dibatalkan*. Klik untuk menyaring.
- **Pencarian** (kotak di kanan atas): ketik nama customer / nomor HP untuk
  mencari pesanan tertentu.
- **Export**: unduh data pesanan (Excel/CSV) — berguna untuk laporan.
- **Paginasi**: tombol halaman di bawah tabel jika pesanan lebih dari 10.

Kolom di tabel: **Kode Booking**, **Paket**, **Customer** (nama + HP),
**Tanggal** (keberangkatan), **Peserta** (jumlah orang), **Status**.

> Kode booking contoh: `BT-20260812-001`. Pakai kode ini untuk berkomunikasi
> dengan customer atau mencari pesanan.

### Membuka & Memproses Satu Pesanan

Klik **kode booking** atau tombol **Detail** → halaman berisi 3 bagian:

1. **Data Customer** — nama, nomor HP/WA, email. Nomor HP dan email bisa
   langsung diklik (otomatis memanggil / membuka email).
2. **Detail Booking** — tipe (Paket Tour / Transport), nama paket, kode paket,
   tanggal berangkat/pulang, jumlah peserta, catatan customer. Untuk booking
   transport: lokasi jemput/antar, jumlah kendaraan, paket harga, biaya
   tambahan, estimasi total.
3. **Ubah Status** — bagian terpenting untuk memproses pesanan.

### Mengubah Status Pesanan

Di bagian **Ubah Status**, pilih status baru lalu klik **Simpan Perubahan**:

| Status            | Kapan dipakai                                                                  |
| ----------------- | ------------------------------------------------------------------------------ |
| **Pending**       | Pesanan baru masuk, belum diproses (status awal otomatis).                     |
| **Dikonfirmasi**  | Kamu sudah menghubungi customer dan menyetujui pesanan.                        |
| **Selesai**       | Perjalanan sudah selesai dilakukan.                                            |
| **Dibatalkan**    | Pesanan batal. **Wajib** mengisi *Catatan Admin* (alasan pembatalan).          |

Setelah dibatalkan, status tidak bisa diubah lagi. Catatan admin hanya terlihat
di panel admin (tidak terlihat customer).

---

## 16.5 Mengelola Paket Tour

Menu **Paket Tour** → daftar paket wisata yang dijual. Setiap baris menampilkan
gambar, nama, kode, kategori, durasi, harga, dan status (Aktif/Nonaktif).

### Menambah Paket Baru

Klik **Tambah Paket** → isi form:

| Kolom               | Penjelasan                                                                 |
| ------------------- | -------------------------------------------------------------------------- |
| **Kode Paket**      | Singkatan unik, contoh `BT-TUR-01`. Dipakai di komunikasi internal.        |
| **Nama Paket**      | Nama yang tampil di website — **wajib diisi untuk 4 bahasa** (lihat §16.8).|
| **Slug**            | Identitas URL, contoh `barelang-city-tour`. Otomatis terisi, biarkan saja. |
| **Durasi**          | Contoh `3D2N`, `1 Hari`.                                                   |
| **Harga**           | Harga paket dalam Rupiah.                                                  |
| **Deskripsi**       | Teks panjang yang menjelaskan paket. Isi untuk 4 bahasa.                   |
| **Gambar**          | Klik **Upload Gambar** → pilih file → crop. Rekomendasi rasio 16:9.        |
| **Alternatif Teks (Alt)** | Teks untuk aksesibilitas & SEO, menggambarkan gambar.               |
| **Itinerary**       | Rangkaian kegiatan (hari per hari). Ketik satu item per baris, klik **+**. |
| **Termasuk (Includes)** | Fasilitas yang sudah termasuk dalam harga (transport, makan, dll).   |
| **Tidak Termasuk (Excludes)** | Yang tidak termasuk biaya.                                   |

Setelah selesai, klik **Simpan** di bagian bawah form.

> Setiap field teks (nama, deskripsi, itinerary, dll) bisa diisi per bahasa.
> Di bagian atas form ada tab bahasa: Indonesia (🇮🇩), Melayu (🇲🇾), English (🇬🇧),
> Mandarin (🇨🇳). **Biar lengkap, isi minimal Bahasa Indonesia** — bahasa lain
> yang kosong otomatis memakai Bahasa Indonesia.

### Mengedit, Menonaktifkan, Menghapus Paket

Di baris paket, ada 3 tombol:

- **Edit** (ikon pensil) → ubah data paket.
- **Aktifkan / Nonaktifkan** (ikon daya) → mengontrol apakah paket tampil di
  website publik. Paket nonaktif tetap tersimpan, tapi tidak muncul di katalog.
- **Hapus** (ikon tempat sampah) → menghapus paket **permanen** (tidak bisa
  dikembalikan). Selalu muncul konfirmasi sebelum terhapus.

> Saran: untuk sementara menyembunyikan paket, pakai **Nonaktifkan** (bukan
> Hapus). Hapus hanya jika benar-benar tidak dipakai lagi.

---

## 16.6 Mengelola Transport (Rental Kendaraan)

Menu **Transport** → produk kendaraan yang bisa dirental customer. Konsepnya
mirip paket, tapi 1 produk punya **beberapa pilihan harga** dan **biaya
tambahan**.

### Menambah / Mengedit Produk Transport

Klik **Tambah Produk** → isi form:

| Bagian Form                 | Penjelasan                                                               |
| --------------------------- | ------------------------------------------------------------------------ |
| **Info Dasar**              | Kode produk (contoh `TR-MPV-6`), kategori (MPV, Mini Van, Mini Bus, dll), kapasitas (jumlah seat), nama, slug, deskripsi, layanan termasuk (driver/guide/self-drive). |
| **Gambar**                  | **Gambar Utama** (foto tampilan utama) + **Galeri Gambar** (foto tambahan). |
| **Paket Harga**             | Satu produk bisa punya beberapa harga: jenis (per jam / transfer), durasi, area cakupan, harga + mata uang (SGD/IDR). Klik **+** untuk menambah paket harga. |
| **Biaya Tambahan (opsional)** | Biaya ekstra yang bisa dipilih customer saat booking: contoh *surcharge hotel*, *extra hour*. |

Setiap item paket harga bisa diaktifkan/nonaktifkan. Biaya tambahan yang
dipilih customer otomatis dihitung di estimasi total saat booking.

### Tips Mengisi Paket Harga

- Untuk **per jam**: buat beberapa baris — contoh *4 Jam*, *8 Jam*, *10 Jam*,
  masing-masing dengan harga berbeda.
- Untuk **transfer (1 arah)**: pilih jenis transfer, isi area cakupan
  (contoh *Batam Center → Hang Nadim Airport*), isi harga tetap.
- Tambahkan baris biaya tambahan jika ada situasi harga berbeda
  (contoh antar hotel di luar area, atau jam di atas durasi).

---

## 16.7 Mengelola Galeri

Menu **Galeri** → foto yang tampil di halaman `/gallery` (gaya Instagram).
Setiap foto menampilkan kolom **Engagement**: jumlah ❤️ like dan ↗️ share
dari pengunjung website.

### Menambah Foto

Klik **Tambah Foto**:

1. Pilih **Gambar** (klik *Upload Gambar*, crop **1:1 persegi**).
2. Isi **Caption** per bahasa (teks pendek di bawah foto).

### Mengedit / Menghapus Foto

Di baris foto: tombol **Edit** untuk mengubah gambar/caption, tombol **Hapus**
untuk menghapus (permanen, ada konfirmasi).

---

## 16.8 Mengelola Testimoni

Menu **Testimoni** → ulasan customer yang tampil di carousel halaman utama.
Setiap testimoni punya kolom **Aktif/Nonaktif** untuk mengontrol tampil atau
tidaknya.

### Menambah Testimoni

Klik **Tambah Testimoni** → isi form:

| Kolom            | Penjelasan                                                             |
| ---------------- | ---------------------------------------------------------------------- |
| **Nama**         | Nama customer yang memberi ulasan.                                     |
| **Foto Avatar**  | Opsional. Foto profil kecil (crop 1:1).                                |
| **Rating**       | Bintang 0–5 (misal `5`).                                               |
| **Urutan**       | Posisi tampil di carousel. Angka kecil tampil duluan (0, 1, 2, ...).    |
| **Peran**        | Konteks ulasan, contoh `Tour Batam 3D2N`.                              |
| **Komentar**     | Isi ulasan — isi untuk 4 bahasa.                                       |
| **Aktif**        | Centang untuk menampilkan testimoni di website.                        |

> Untuk menyembunyikan sementara testimoni, matikan **Aktif** (jangan hapus).

---

## 16.9 Mengelola Blog

Menu **Blog** → artikel di halaman `/blog`. Di dalamnya ada sub-menu
**Kategori** untuk mengelola kelompok artikel (contoh: *Tips Wisata*,
*Kuliner*).

### Status Artikel

Setiap artikel punya status:

| Status        | Artinya                                                        |
| ------------- | -------------------------------------------------------------- |
| **Draft**     | Disimpan tapi belum terlihat publik.                           |
| **Published** | Tampil di halaman blog untuk semua orang.                      |
| **Archived**  | Tidak tampil, tapi tersimpan (bukan hapus).                    |

### Menulis Artikel Baru

Klik **Tambah Artikel** → isi form:

1. **Judul** per bahasa (wajib minimal Bahasa Indonesia).
2. **Slug** — otomatis dari judul, biarkan saja.
3. **Ringkasan (Excerpt)** per bahasa — teks singkat di daftar blog & hasil
   pencarian Google.
4. **Kategori** — pilih dari yang sudah dibuat (atau buat baru via
   **Kategori**).
5. **Tag** — kata kunci, ketik lalu tekan Enter (contoh: `batam`, `barelang`).
6. **Gambar Utama (Featured Image)** — upload gambar pembuka artikel.
7. **Status** — pilih *Draft* dulu kalau belum selesai.
8. **Konten** — editor teks: ketik seperti Word, ada tombol bold, list, dll.
   Gunakan tab **Tulis / Preview** untuk melihat hasil. Bisa juga mode HTML
   atau Markdown untuk yang sudah terbiasa.
9. **SEO (opsional)** — bagian lanjutan untuk optimasi pencarian:
   - *SEO Title*: judul khusus untuk Google (kalau kosong, pakai judul biasa).
   - *SEO Description*: kalimat pendek di hasil pencarian Google.
   - *Tidak Diindeks (No Index)*: centang kalau artikel ini TIDAK mau muncul
     di Google (misal artikel internal).

> Konten diisi **per bahasa**. Ganti tab bahasa untuk menulis versi tiap
> bahasa. Artikel tampil dalam bahasa sesuai pilihan pengunjung.

### Mengelola Kategori

Menu **Blog → Kategori**: daftar kategori artikel. Bisa menambah/mengedit
kategori (nama per bahasa + slug). Artikel yang memakai kategori yang dihapus
akan kehilangan kategori-nya.

---

## 16.10 Konfigurasi Situs

Menu **Konfigurasi** → data umum yang langsung diterapkan di seluruh website.
Perubahan di sini langsung terlihat publik (tanpa deploy).

| Bagian                  | Isi                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Kontak**              | Nomor telepon yang ditampilkan (contoh `+62 819 4143 433`), nomor untuk tombol `tel:` (contoh `+628194143343`), email kontak. |
| **WhatsApp & Notifikasi Admin** | Nomor WhatsApp admin (untuk menerima notifikasi booking) & email admin.    |
| **Sosial Media**        | Akun Instagram, Facebook, TikTok, YouTube — tampil di footer. Klik **Tambah Sosial Media** untuk menambah, ikon 🗑 untuk menghapus. |
| **Alamat & Jam Operasional** | Alamat, hari operasional, dan jam — isi per bahasa (tab bahasa di atas).    |

Setelah mengubah, klik **Simpan Konfigurasi**. Perubahan langsung aktif.

> ⚠️ **Nomor WhatsApp admin** sangat penting — notifikasi booking baru
> dikirim ke nomor ini. Formatnya hanya angka dengan kode negara, tanpa `+`
> (contoh `628194143343`).

---

## 16.11 Export Data (Excel / CSV)

Di halaman **Booking, Paket Tour, Transport, Galeri, Testimoni, dan Blog** ada
tombol **Export**. Cara pakai:

1. Klik **Export** → pilih **Export Excel** (.xlsx) atau **Export CSV**.
2. File terunduh otomatis, bernama sesuai tanggal (contoh `booking-2026-08-12.xlsx`).
3. File bisa dibuka di Microsoft Excel / Google Sheets.

Export selalu mengikuti **filter yang sedang aktif**. Contoh: di halaman
Booking dengan filter *Pending* → export hanya berisi pesanan *Pending*.
Export mengambil **semua data** (bukan hanya halaman yang sedang dibuka).

---

## 16.12 Ringkasan Alur Kerja Harian (Cheat Sheet)

1. **Cek pesanan baru**: Dashboard → kartu *Menunggu Konfirmasi* (atau menu
   Booking → filter *Pending*).
2. **Hubungi customer** (klik nomor HP di detail booking), konfirmasi paket.
3. **Ubah status** booking menjadi *Dikonfirmasi*.
4. Setelah perjalanan selesai → ubah status menjadi *Selesai*.
5. Jika batal → ubah ke *Dibatalkan* dan isi alasan.
6. **Jaga katalog**: paket/transport yang habis dipakai → Nonaktifkan;
   yang baru → tambahkan lewat menu masing-masing.
7. **Jawab ulasan**: tambahkan testimoni pelanggan yang puas (menu Testimoni).
8. **Update kontak jika berubah** (menu Konfigurasi) — misal ganti nomor WA.

---

## 16.13 Hal yang Perlu Diingat

| Hal                     | Penjelasan                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- |
| **Hapus = permanen**    | Tombol hapus (ikon 🗑) menghapus data selamanya. Untuk menyembunyikan sementara, gunakan **Nonaktifkan/Aktif** atau status *Archived*. |
| **Bahasa**              | Field per bahasa yang dikosongkan otomatis menampilkan Bahasa Indonesia. Isi minimal Bahasa Indonesia, lengkapi bahasa lain jika sempat. |
| **Harga**               | Pastikan harga yang kamu masukkan sudah benar & final — ini yang dibayar customer. |
| **Notifikasi booking**  | Notifikasi baru dikirim ke **nomor WhatsApp admin** di Konfigurasi. Jika tidak menerima notifikasi, cek nomor tersebut. |
| **Data rahasia**        | Jangan bagikan password admin ke siapa pun. Logout saat selesai, apalagi di perangkat bersama. |
| **Bantuan teknis**      | Jika menemukan halaman error / data aneh, hubungi tim teknis. Jangan mencoba mengubah hal yang tidak kamu kenali. |

---

**Kembali ke:** [Dokumentasi Utama](./index.md)
