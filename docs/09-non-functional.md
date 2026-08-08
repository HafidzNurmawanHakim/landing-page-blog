# 9. Non-Functional Requirements

> Bagian dari dokumentasi [Destitour Booking Platform](./index.md).

## 9.1 Target

| Aspek          | Target                                                      |
| -------------- | ----------------------------------------------------------- |
| Performance    | LCP < 1.5s, TTFB < 200ms                                    |
| Availability   | 99.5%+                                                      |
| Security       | HTTPS only, Rate limiting, Input validation, XSS protection |
| Cost (1jt req) | ≤ $15 / bulan                                               |
| Scalability    | Siap hingga 5jt request/bulan                               |

## 9.2 Performance

- Static pages (katalog, detail paket) di-generate saat build atau ISR
- Gunakan Cloudflare CDN / edge caching
- Gambar paket pakai `next/image` + format modern (WebP/AVIF)
- Bundle size kecil: import komponen secara selective (tree-shaking)

## 9.3 Security

| Threat       | Mitigasi                                             |
| ------------ | ---------------------------------------------------- |
| Injection    | Drizzle ORM (parameterized query)                    |
| XSS          | React auto-escape, hindari `dangerouslySetInnerHTML` |
| CSRF         | Server Actions (built-in origin check)               |
| Brute force  | Rate limiting login admin + timeout cooldown         |
| Spam booking | Rate limiting per IP pada `createBooking`            |
| Data leak    | Admin routes wajib sesi Auth.js                      |

## 9.4 Cost Estimation (1jt request/bulan)

| Komponen                  | Estimasi / bulan                     |
| ------------------------- | ------------------------------------ |
| Cloudflare Workers (free) | $0 (batas free 100k req/hari)        |
| Cloudflare D1 (free tier) | $0 (5GB storage, 5jt read rows/hari) |
| Resend free tier          | $0 (3.000 email)                     |
| WhatsApp provider         | $5–10                                |
| **Total**                 | **≤ $15**                            |

> Catatan: jika traffic naik ke 5jt req/bulan, upgrade ke paid Workers/D1 tetap masuk akal (< $10 untuk tier awal).

---

**Lanjutkan ke:** [10. Acceptance Criteria (MVP)](./10-acceptance-criteria.md)
