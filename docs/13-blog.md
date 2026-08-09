Berikut **PRD Blog** yang production-ready, berdasarkan best practice industri 2026 (khusus stack Next.js + Cloudflare Workers + D1).

# Product Requirements Document (PRD)

## Blog Feature – Destitour Platform

**Versi:** 1.0  
**Tanggal:** 5 Agustus 2026  
**Status:** Ready for Development  
**Prioritas:** High (SEO & Content Marketing)  
**Dependensi:** Main Platform (Next.js + Cloudflare Workers + D1)

---

## 1. Ringkasan Eksekutif

Blog adalah fitur content marketing utama untuk meningkatkan organic traffic, authority, dan konversi booking tour Batam.

Admin harus bisa menulis, mengedit, dan publish artikel melalui **admin panel** tanpa perlu deploy ulang.

Pendekatan yang dipilih: **Database-driven CMS** (bukan file-based Markdown) karena:

- Admin non-teknis bisa manage content
- Publish instan tanpa rebuild
- Cocok dengan stack D1 yang sudah dipakai
- SEO metadata & structured data mudah dikontrol

---

## 2. Tujuan Bisnis

| Tujuan                          | Metrik Sukses                                                     |
| ------------------------------- | ----------------------------------------------------------------- |
| Meningkatkan organic traffic    | 30% traffic dari blog dalam 6 bulan                               |
| Support SEO long-tail           | Ranking untuk keyword "tour batam 3d2n", "hotel batam murah", dll |
| Meningkatkan trust & conversion | CTR dari blog → halaman paket ≥ 8%                                |
| Mudah dikelola admin            | Waktu publish artikel < 10 menit                                  |

---

## 3. Analisis Industri & Keputusan Teknis

### 3.1 Pilihan Content Format

| Format                           | Kelebihan                                                   | Kekurangan                                    | Cocok untuk Kasus Kita? |
| -------------------------------- | ----------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| **Markdown / MDX**               | Ringan, version control bagus, developer-friendly           | Admin non-teknis kesulitan, butuh rebuild     | ❌ Tidak                |
| **HTML mentah**                  | Sederhana                                                   | Rentan XSS, sulit di-query, tidak terstruktur | ❌ Tidak                |
| **JSON (ProseMirror / TipTap)**  | Structured, type-safe, extensible, mudah di-render ke React | Sedikit lebih kompleks                        | ✅ **Dipilih**          |
| **Portable Text (Sanity-style)** | Sangat fleksibel                                            | Overkill untuk skala kita                     | ❌ Tidak                |

**Keputusan:** Simpan konten sebagai **TipTap JSON** (ProseMirror document).

### 3.2 Pilihan Rich Text Editor

| Editor             | Bundle | Ecosystem                   | Cocok Edge/Workers | Rekomendasi              |
| ------------------ | ------ | --------------------------- | ------------------ | ------------------------ |
| **TipTap**         | Medium | Sangat bagus                | Ya                 | ✅ **Dipilih**           |
| Lexical            | Ringan | Bagus tapi steeper learning | Ya                 | Alternatif bagus         |
| Plate              | Medium | Plugin-heavy                | Ya                 | Overkill                 |
| TinyMCE / CKEditor | Berat  | Enterprise                  | Ya                 | Terlalu berat & berbayar |

**Alasan memilih TipTap:**

- Paling mature di 2026 untuk production CMS
- Output JSON yang bersih & predictable
- Extension ecosystem lengkap (image, table, code, youtube, dll)
- Banyak contoh production dengan Next.js + Cloudflare
- Core MIT (gratis)

### 3.3 Rendering Strategy

- **Admin Editor** → Client Component (`'use client'`) + TipTap
- **Public Blog Page** → Server Component
  - Ambil JSON dari D1
  - Render menggunakan `@tiptap/html` atau custom React renderer (lebih recommended)
- **Image** → Upload ke **Cloudflare R2** + serve via custom domain / Cloudflare Images

---

## 4. User Stories

### Admin

- Sebagai Admin, saya ingin membuat artikel baru dengan rich text editor yang mirip Notion/Google Docs
- Saya ingin upload gambar langsung dari editor
- Saya ingin set SEO title, meta description, OG image secara terpisah
- Saya ingin publish / unpublish / schedule artikel
- Saya ingin melihat daftar artikel dengan filter status & kategori

### Visitor

- Sebagai visitor, saya ingin membaca artikel yang cepat loading dan SEO-friendly
- Saya ingin melihat artikel terkait
- Saya ingin share artikel ke social media dengan preview yang bagus

---

## 5. Functional Requirements

### 5.1 Admin – Editor

**Fitur Editor (MVP):**

- Heading (H1–H3)
- Bold, Italic, Underline, Strike
- Bullet & Ordered List
- Blockquote
- Code block (syntax highlight)
- Link
- Image upload (drag & drop + paste)
- YouTube / Video embed
- Horizontal rule
- Undo / Redo
- Character / word count
- Auto-save draft (optional tapi recommended)

**Fitur Non-Editor:**

- Title
- Slug (auto-generate + editable)
- Excerpt / Summary
- Featured Image
- Category (single)
- Tags (multiple)
- Status: `draft` | `published` | `archived`
- Published At (bisa dijadwalkan)
- SEO fields (lihat section 6)
- Author (default ke admin yang login)

### 5.2 Public Blog

- List artikel (pagination / infinite scroll)
- Filter by Category & Tag
- Detail artikel (`/blog/[slug]`)
- Related posts
- Reading time estimate
- Table of Contents (opsional)
- Share buttons
- RSS Feed (`/feed.xml`)
- Sitemap otomatis

---

## 6. Data Model (D1 + Drizzle)

### 6.1 Tabel `posts`

> **Lokalisasi (docs/06-i18n.md):** konten editorial disimpan sebagai **JSON object per field** — `{ id, ms, en, zh }` — pada kolom yang butuh terjemahan: `title`, `excerpt`, `content`, `featured_image_alt`, `seo_title`, `seo_description`. Field lain (`slug`, `content_type`, `category_id`, `status`, `published_at`, dst.) tetap tunggal. Fallback: locale diminta → `id` (default). Pola sama dengan `gallery_items.caption` & `packages.name`.

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Core Content (semua JSON { id, ms, en, zh })
  title TEXT NOT NULL,                     -- LocalizedString
  slug TEXT NOT NULL UNIQUE,               -- tunggal, dari judul ID
  excerpt TEXT,                            -- LocalizedString | null
  content JSON NOT NULL,                   -- LocalizedString (HTML/markdown per bahasa)
  content_type TEXT NOT NULL DEFAULT 'html', -- TUNGGAL: 'html' | 'markdown' utk semua locale
  content_html TEXT,                       -- optional pre-rendered HTML (cache)
  content_text TEXT,                       -- plain text for search & reading time

  -- Media
  featured_image_url TEXT,
  featured_image_alt TEXT,                 -- LocalizedString | null

  -- Taxonomy
  category_id INTEGER REFERENCES categories(id),

  -- Publishing
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | published | archived
  published_at INTEGER,                  -- unix timestamp
  scheduled_at INTEGER,                  -- untuk schedule publish

  -- SEO (title/description LocalizedString; sisanya tunggal)
  seo_title TEXT,                        -- max 60 chars
  seo_description TEXT,                  -- max 160 chars
  og_image_url TEXT,
  canonical_url TEXT,
  noindex INTEGER DEFAULT 0,             -- boolean

  -- Meta
  author_id INTEGER,                     -- reference ke admins
  reading_time INTEGER,                  -- menit (dihitung dari content.id)
  view_count INTEGER DEFAULT 0,

  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status_published ON posts(status, published_at);
CREATE INDEX idx_posts_category ON posts(category_id);
```

`CONTENT_TYPE` disimpan **tunggal** (keputusan implementasi 9 Agustus 2026) — editor visual memakai satu format untuk semua locale; konten per-bahasa disimpan dalam `content: { id, ms, en, zh }`. Migrasi `0010_blog_localization` membungkus nilai legacy `TEXT` menjadi `{ "id": <nilai> }` (data-only, kolom tetap TEXT).

````

### 6.2 Tabel `categories`

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                  -- LocalizedString { id, ms, en, zh }
  slug TEXT NOT NULL UNIQUE,
  description TEXT,                    -- LocalizedString | null
  created_at INTEGER DEFAULT (unixepoch())
);
```

### 6.3 Tabel `tags` + Pivot

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
```

### 6.4 Tabel `media` (opsional tapi recommended)

```sql
CREATE TABLE media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,                     -- R2 public URL
  alt TEXT,
  width INTEGER,
  height INTEGER,
  size INTEGER,                          -- bytes
  mime_type TEXT,
  uploaded_by INTEGER,
  created_at INTEGER DEFAULT (unixepoch())
);
```

---

## 7. Technical Specification – Editor & Rendering

### 7.1 Library yang Digunakan

```bash
# Core Editor
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit

# Extensions yang dibutuhkan
npm install @tiptap/extension-image
npm install @tiptap/extension-link
npm install @tiptap/extension-placeholder
npm install @tiptap/extension-youtube
npm install @tiptap/extension-code-block-lowlight
npm install @tiptap/extension-character-count
npm install lowlight                  # untuk syntax highlighting
```

### 7.2 Cara Kerja Editor (Admin)

```tsx
// components/admin/PostEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
// ... extensions lain

export function PostEditor({ initialContent, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }), // upload ke R2
      // ...
    ],
    content: initialContent, // TipTap JSON
    immediatelyRender: false, // penting untuk Next.js SSR
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  return <EditorContent editor={editor} />;
}
```

### 7.3 Cara Render di Public Page (Best Practice)

**Opsi A – Recommended (Custom React Renderer)**

- Convert TipTap JSON → React components
- Lebih aman, lebih fleksibel, SEO-friendly
- Bisa pakai library seperti `tiptap-react-renderer` atau tulis sendiri

**Opsi B – HTML**

- Simpan `content_html` saat save
- Render dengan `dangerouslySetInnerHTML` + sanitization (DOMPurify)
- Lebih simple tapi kurang fleksibel

**Keputusan untuk proyek ini:**
Gunakan **Opsi A** (React renderer) + simpan `content_text` untuk search & reading time.

### 7.4 Image Upload Flow

1. User drag/paste image di TipTap
2. Client upload ke `/api/admin/upload` (Server Action / Route Handler)
3. File disimpan ke **Cloudflare R2**
4. Return public URL
5. TipTap insert node Image dengan URL tersebut

---

## 8. SEO Requirements (Production Ready)

Setiap post **wajib** punya:

| Field             | Max Length | Keterangan            |
| ----------------- | ---------- | --------------------- |
| `seo_title`       | 60         | Override title tag    |
| `seo_description` | 160        | Meta description      |
| `og_image_url`    | -          | 1200×630 recommended  |
| `canonical_url`   | -          | Optional              |
| `noindex`         | boolean    | Untuk draft / private |

**Structured Data (JSON-LD):**

- `BlogPosting`
- `BreadcrumbList`
- `Organization` (global)

**Lainnya:**

- Automatic sitemap.xml
- RSS 2.0 feed
- Open Graph + Twitter Card
- Canonical URL selalu self-referencing kecuali di-override

---

## 9. Non-Functional Requirements

| Aspek              | Target                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Editor load time   | < 1.2 detik                                                       |
| Public post TTFB   | < 200ms (edge)                                                    |
| Image optimization | WebP / AVIF via Cloudflare                                        |
| Security           | Sanitize semua HTML, rate limit upload, auth required untuk admin |
| Backup             | D1 Time Travel (7 hari free)                                      |

---

## 10. Out of Scope (MVP)

- Collaborative editing real-time
- Version history / revision
- Comment system
- Multi-author dengan role granular
- AI writing assistant
- Newsletter integration

---

## 11. Acceptance Criteria

- [ ] Admin bisa membuat & edit post dengan TipTap
- [ ] Image bisa di-upload ke R2 dari editor
- [ ] Post bisa di-publish & langsung muncul di frontend tanpa redeploy
- [ ] SEO fields tersimpan & ter-render dengan benar
- [ ] Structured data BlogPosting valid
- [ ] Reading time terhitung otomatis
- [ ] Related posts muncul berdasarkan category/tag
- [ ] RSS & Sitemap berfungsi
- [ ] Mobile editor usable

---

## 12. Estimasi Development

| Modul                       | Estimasi              |
| --------------------------- | --------------------- |
| Database schema + migration | 0.5 hari              |
| TipTap editor + toolbar     | 2–3 hari              |
| Image upload ke R2          | 1 hari                |
| Admin CRUD posts            | 2 hari                |
| Public blog list + detail   | 1.5 hari              |
| SEO + structured data + RSS | 1 hari                |
| Polish & testing            | 1 hari                |
| **Total**                   | **± 9–10 hari kerja** |

---

## 13. Rekomendasi Implementasi Prioritas

**Phase 1 (MVP Blog)**

1. Schema + TipTap basic
2. Create / Edit / Publish
3. Public list + detail
4. SEO dasar

**Phase 2**

- Categories & Tags
- Related posts
- Reading time
- RSS + Sitemap

**Phase 3**

- Advanced extensions (table, youtube, dll)
- View count
- Scheduled publish

---

**Dokumen ini siap digunakan sebagai acuan development.**
Semua keputusan teknis sudah mempertimbangkan keterbatasan Cloudflare Workers (edge runtime) dan best practice industri 2026.

```

---
````
