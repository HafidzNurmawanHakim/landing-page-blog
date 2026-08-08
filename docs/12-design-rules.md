# 12. Design Rules

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

**Prinsip:** _Google Material Design_ — **rounded full, flat, modern, simple.**

Desain harus terasa seperti produk Google modern (Gmail, Maps, Workspace): netral, bersih, tanpa hiasan berlebihan, dan setiap elemen punya alasan.

---

## 12.1 Prinsip Utama

| Prinsip | Arti                                                                  |
| ------- | --------------------------------------------------------------------- |
| Rounded | Semua elemen interaktif pakai sudut **sangat bulat** (`rounded-full`) |
| Flat    | Tanpa shadow/drop-shadow. Batasi diri pakai **border 1px**            |
| Modern  | Material 3 look: pill button, chip filter, surface netral             |
| Simple  | Satu aksi utama per layar. Hapus elemen yang tidak perlu              |

> Aturan emas: **kalau bisa dihilangkan tanpa mengurangi fungsi, hilangkan.**

---

## 12.2 Shape & Radius

| Elemen                  | Radius yang dipakai                      |
| ----------------------- | ---------------------------------------- |
| Button (semua ukuran)   | `rounded-full`                           |
| Input, Select, Textarea | `rounded-full` (textarea: `rounded-3xl`) |
| Chip / filter / badge   | `rounded-full`                           |
| Card / container besar  | `rounded-3xl`                            |
| Dropdown / popover      | `rounded-2xl`                            |
| Circle icon container   | `rounded-full` (ratio 1:1)               |

Contoh:

```tsx
<Button className="rounded-full" size="lg">Booking Sekarang</Button>
<Input className="rounded-full" />
<Card className="rounded-3xl">...</Card>
```

---

## 12.3 Elevation (Flat)

- **Hindari `shadow-*`** pada elemen utama. Card, button, dan surface **flat**.
- Pemisah antar permukaan pakai **kontras warna latar** (`bg-card` di atas `bg-background`), bukan shadow/border.
- Satu-satunya pengecualian: dropdown/popover (`shadow-md`) supaya "mengambang" di atas konten.
- Hover state cukup ubah **warna latar** (`hover:bg-accent`, `hover:bg-primary/90`), bukan naikkan shadow.

```
✅ bg-card (tanpa border/shadow)
❌ shadow-lg + bg-card
❌ border + bg-card
```

---

## 12.4 Warna

- Basis **netral** (zinc/neutral scale): `background`, `foreground`, `muted`, `accent`.
- **Satu warna aksen** (`primary`) untuk CTA dan elemen penting. Jangan warna-warni.
- Status pakai warna semantik:
  - `emerald` → success / confirmed
  - `amber` → pending / warning
  - `red` → destructive / cancelled
  - `sky` → completed
- Surface: `bg-card` untuk container, `bg-secondary` untuk area terisolasi / placeholder.

### Contoh status badge

```tsx
<Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
  Dikonfirmasi
</Badge>
```

---

## 12.5 Tipografi

- Font: **Poppins** (sudah di-set di `app/layout.tsx` via `next/font/google`).
- Berat font: `font-medium` / `font-semibold` untuk penekanan. Hindari `font-bold` berlebihan.
- Heading: `tracking-tight`, ukuran besar, tanpa dekorasi.
- Hierarchy:
  - H1: `text-3xl` / `text-4xl` + `font-semibold tracking-tight`
  - Body: `text-sm` / `text-base` `text-foreground` / `text-muted-foreground`
  - Label form: `text-sm font-medium`
- Angka harga pakai `Intl.NumberFormat("id-ID")`.

---

## 12.6 Borderless (Aturan Baru)

**Prinsip:** _default borderless._ UI bersih tanpa border kecuali elemen yang **fungsional butuh pemisah** atau butuh "garis batas" untuk dikenali sebagai area isian/klik.

### Aturan Emas

- **Jangan** pasang `border` sebagai dekorasi. Pemisah antar permukaan utamanya pakai **kontras warna latar** (`bg-card` di atas `bg-background`, `bg-secondary` untuk area terisolasi).
- Border **boleh** dipakai hanya di:
  1. **Input / Select / Textarea** — area isian wajib terlihat (`border-input`), karena membedakan "bisa diisi" dari teks biasa.
  2. **Tabel** — hanya garis pemisah baris (`border-b border-secondary`), **bukan** kotak keliling.
  3. **Divider** antar section (mis. `Separator`, atau `border-t` pada header tabel).
  4. **Fokus state** — pakai `focus-visible:ring-2 ring-ring`, bukan border tambahan.
  5. **Error state input** — `border-destructive` sebagai sinyal kesalahan.
- **Larangan:**
  - `border` pada Card / container → ganti dengan `bg-card` + `rounded-3xl`.
  - `border` pada Badge → cukup `bg-*` + `rounded-full`.
  - `border` pada chip/filter → aktif `bg-primary`, nonaktif `bg-secondary`.
  - `border` pada Navbar → cukup `bg-card/80` + `backdrop-blur`.

### Ringkasan

```
✅ Input (border-input)  ✅ Baris tabel (border-b)  ✅ Divider
❌ Card      ❌ Badge     ❌ Chip filter   ❌ Navbar   ❌ Button outline (kecuali variant outline)
```

### Contoh

```tsx
<Card className="rounded-3xl bg-card">            // tanpa border
<Input className="rounded-full border-input" />   // border hanya di input
<Badge className="rounded-full bg-secondary" />   // tanpa border
<tr className="border-b border-secondary" />      // separator baris saja
```

---

## 12.7 Spacing & Layout

- Grid dasar **4px / 8px**.
- Container: `max-w-7xl` dengan padding konsisten (`container` class sudah di-set Tailwind).
- Jarak antar section: `py-12` / `py-24`.
- Jarak antar form field: `space-y-5`.
- Card grid: `gap-6`.
- Selalu `mobile-first`: satu kolom di mobile → 2-4 kolom di desktop.

---

## 12.8 Ikon

- Pakai **lucide-react** (sudah dependency).
- Style outline, stroke width default (2), ukuran 16–24px.
- Ikon = pendukung teks, bukan pengganti teks (kecuali yang sudah umum, mis. icon search).
- Ikon di dalam button: `mr-2 h-4 w-4`.

---

## 12.9 Motion

- Transisi konsisten `transition-colors` untuk hover/focus.
- Durasi pendek: **150–200ms**.
- Tidak ada animasi berlebihan, scroll-jack, atau parallax.
- Loading state: spinner (Loader2 + `animate-spin`) + teks "Memproses...".

---

## 12.10 Komponen yang Dilarang

| Larangan                        | Ganti dengan                                     |
| ------------------------------- | ------------------------------------------------ |
| Button `rounded-md` persegi     | `rounded-full`                                   |
| Shadow tebal (`shadow-lg`/`xl`) | Hapus (borderless) atau border 1px               |
| Border dekoratif di Card/Badge  | Hapus — cukup kontras `bg-card` / `bg-secondary` |
| Gradasi warna-warni             | Warna solid netral + satu aksen                  |
| Border-radius campur aduk       | Radius sesuai tabel section 12.2                 |
| Font dekoratif / serif          | Poppins                                          |

---

## 12.11 Image Uploader (Aturan Wajib)

**Setiap upload gambar** (paket, galeri, blog, logo, dsb.) **WAJIB** memakai
`ModalImageUploader` (`components/ui/image-uploader/index.tsx`).
Dilarang bikin uploader sendiri atau `<input type="file">` mentah di halaman admin.

### Kenapa

- Satu jalur upload → konsisten, mudah dimaintain, minim bug.
- **Kompresi otomatis ke WebP** (target ±500 KB) → hemat bandwidth, storage, dan waktu load.
- **Crop sebelum upload** → rasio selalu pas dengan tempat tampil.
- Validasi tipe & ukuran di client (toast) + server (magic-byte check).
- Upload lewat endpoint `POST /api/admin/media/upload` yang dijaga session admin.

### Pola Baku

```tsx
const uploaderRef = useRef<ImageUploadModalRef>(null);

// Tombol trigger (rounded-full, ikon lucide)
<Button type="button" variant="secondary" className="rounded-full" onClick={() => uploaderRef.current?.open()}>
  <ImageUp className="mr-2 h-4 w-4" />
  Pilih / Upload Gambar
</Button>

<ModalImageUploader
  ref={uploaderRef}
  title="Upload Gambar"
  description="Pilih gambar. Dikompres otomatis ke WebP dan bisa dipotong."
  config={{
    maxFiles: 1,
    maxFileSize: 5,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
    enableCrop: true,
    cropAspectRatio: 16 / 9, // sesuaikan konteks (lihat tabel)
    enableCompression: true,
    compressionOptions: { targetMaxSizeKB: 500, maxWidth: 1600, initialWebPQuality: 0.9 },
    enableMultiple: false,
  }}
  onUploadComplete={(images) => setValue("imageUrl", images[0]?.url, { shouldValidate: true })}
/>
```

### Rasio Crop per Konteks

| Konteks      | `cropAspectRatio` | Alasan                                 |
| ------------ | ----------------- | -------------------------------------- |
| Gambar paket | `16 / 9`          | Kartu produk & detail lebar            |
| Galeri       | `1` (persegi)     | Grid Instagram-style (`aspect-square`) |
| Featured blog | `16 / 9` atau `1200:630` | OG image & header artikel       |

### Alur Upload (jangan dipersingkat)

1. Client: pilih file → crop → kompres (WebP) → `POST /api/admin/media/upload` (multipart, admin session).
2. Server (`lib/media/upload.ts`): validasi session + magic-byte → simpan ke **R2** (prod) / `public/uploads` (dev) → return `{ data: { url } }`.
3. Client: simpan **URL** ke form → submit ke DB.
4. DB menyimpan **URL saja** — binary gambar **tidak pernah masuk DB**.

### Larangan

| Larangan                                                     | Alasan                                   |
| ------------------------------------------------------------ | ---------------------------------------- |
| `<input type="file">` mentah di admin                        | Bypass kompresi/crop/validasi            |
| Base64 gambar masuk DB / state                               | Boros storage, SSR tak terpakai          |
| Upload client langsung ke R2 tanpa session admin             | Bocor kredensial, tanpa kontrol          |
| `dangerouslySetInnerHTML` untuk gambar/alt                   | XSS                                      |

---

## 12.12 Checklist Review Desain

- [ ] Semua button & input `rounded-full`?
- [ ] Tidak ada `shadow-sm/lg/xl` di card/button utama?
- [ ] **Tidak ada border dekoratif** di Card/Badge/chip? Border hanya di input & separator tabel?
- [ ] Hanya satu warna aksen yang menonjol?
- [ ] Hierarchy tipografi jelas (heading vs body)?
- [ ] Responsive: cek breakpoint mobile & desktop?
- [ ] Ikon konsisten lucide outline, tidak ada yang beda style?
- [ ] Semua teks masih terbaca di dark mode?
- [ ] Semua upload gambar pakai `ModalImageUploader` (bukan input file mentah)?
- [ ] Gambar tampil sebagai **URL** di DB (bukan base64), rasio crop sesuai konteks?

---

**Kembali ke:** [Dokumentasi Utama](./index.md)
