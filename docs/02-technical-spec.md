# 2. Technical Specification

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 2.1 Architecture Overview

```
┌─────────────────┐
│ Browser         │
│ (Customer /     │
│  Admin)         │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────┐
│ Cloudflare Workers          │
│ (Next.js via OpenNext)      │
│  - SSR / Server Actions     │
│  - API Routes               │
└────────┬────────────────────┘
         │ Binding
         ▼
┌─────────────────┐   ┌──────────────────┐
│ Cloudflare D1   │   │ External         │
│ (SQLite)        │   │ - Resend (Email) │
│                 │   │ - WhatsApp API   │
└─────────────────┘   └──────────────────┘
```

## 2.2 Tech Stack Detail

| Layer            | Teknologi                     | Alasan                              |
| ---------------- | ----------------------------- | ----------------------------------- |
| Framework        | Next.js 15 (App Router)       | Modern, Server Actions, bagus i18n  |
| Runtime / Deploy | Cloudflare Workers + OpenNext | Edge, murah, scaling bagus          |
| Database         | Cloudflare D1                 | SQLite edge, gratis & murah         |
| ORM              | Drizzle ORM                   | Type-safe, sangat ringan di Workers |
| i18n             | next-intl                     | Support 4 bahasa dengan baik        |
| Auth Admin       | Auth.js (Credentials) + D1    | Sederhana, cukup untuk 1-2 admin    |
| Email            | Resend                        | Free tier bagus, mudah              |
| WhatsApp         | Wati / AiSensy / Interakt     | Support template message            |

## 2.3 Environment Variables

```env
# Cloudflare (otomatis via binding)
# DB → D1 binding

# Public
NEXT_PUBLIC_SITE_URL=https://destitour.com
NEXT_PUBLIC_DEFAULT_LOCALE=id

# Secret
AUTH_SECRET=...
ADMIN_EMAIL=admin@destitour.com
ADMIN_PASSWORD_HASH=...

RESEND_API_KEY=...
WHATSAPP_API_KEY=...
WHATSAPP_ADMIN_NUMBER=628xxxxxxxxxx
```

## 2.4 Repo / Folder Structure (Target)

```
destitour/
├── app/
│   ├── layout.tsx            # Root layout (Navbar + ThemeProvider)
│   ├── page.tsx              # Homepage
│   ├── (marketing)/
│   │   ├── packages/         # Katalog paket
│   │   └── packages/[slug]/  # Detail paket (BookingDialog modal)
│   ├── admin/
│   │   ├── login/            # Login admin
│   │   └── bookings/         # Dashboard booking
│   └── actions/              # Server Actions (booking, admin)
├── components/
│   ├── layout/               # Navbar, Footer, ThemeProvider
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── db/                   # Drizzle client + schema
│   └── utils.ts
├── messages/                 # id.json, ms.json, en.json, zh.json
└── docs/                     # Dokumentasi ini
```

> Catatan: repo saat ini masih landing page template (Next.js 14 + shadcn). Folder `app/actions`, `(marketing)`, `admin`, dan `messages/` adalah target setelah implementasi.

---

**Lanjutkan ke:** [3. Database Schema](./03-database-schema.md)
