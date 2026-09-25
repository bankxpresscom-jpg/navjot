# Dr. Navjot Kaur: personal brand site

A one-page, cinematic portfolio built for **Cloudflare Pages**, with a **Pages Function + D1** backend for direct book orders over UPI.

```
public/                     ← Pages build output (deploy this folder)
  index.html                critical CSS inline, SVG icon sprite, JSON-LD, all sections
  assets/app.js             CONFIG → LIB → ASSETS at the top, then all behaviour
  assets/monogram.svg       splash monogram
  _headers                  security headers, CSP, cache rules
  robots.txt  sitemap.xml  site.webmanifest  og.jpg
  favicon.svg favicon.ico favicon-16.png favicon-32.png apple-touch-icon.png
  icon-192.png icon-512.png icon-maskable-192.png icon-maskable-512.png
functions/api/order.js      POST /api/order (validation, honeypot, D1 insert, ZeptoMail)
schema.sql                  D1 migration for the `orders` table
scripts/generate-assets.mjs favicon set + og.jpg from favicon.svg (sharp)
scripts/csp-hash.mjs        re-hashes the inline boot script into _headers
scripts/set-domain.mjs      swaps the placeholder domain everywhere
wrangler.example.toml       optional bindings-as-code
```

No framework and no build step. Libraries load from jsDelivr at pinned versions with SRI:
GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13, and qrcode-generator 1.4.4 (only loaded when the order drawer shows a QR code).

## Deploy

1. **Pages project**: connect the repo. Framework preset: *None*. Build command: *(empty)*. Output directory: `public`.
   Or run `npx wrangler pages deploy public --project-name navjot`.
2. **D1**
   ```bash
   npx wrangler d1 create navjot-orders
   npx wrangler d1 execute navjot-orders --remote --file=schema.sql
   ```
   Pages → Settings → Bindings → add a **D1 database** binding named `DB`.
3. **ZeptoMail**: Pages → Settings → Variables and Secrets:
   - `ZEPTOMAIL_TOKEN` (secret): the Send Mail token
   - `MAIL_FROM`: a sender on a domain verified in ZeptoMail
   - `MAIL_TO`: the inbox that receives order notifications
   - optional: `ZEPTOMAIL_API` (defaults to the India DC, `api.zeptomail.in`), `BOOK_PRICE_INR`, `SHIPPING_INR`, `BOOK_TITLE`
4. **Domain**: `npm run set-domain -- https://www.your-domain.com` replaces the placeholder `https://drnavjotkaur.example` in the canonical, OG, JSON-LD, robots.txt, sitemap.xml and CONFIG.

Local dev: `cp wrangler.example.toml wrangler.toml` (set a D1 id), then run `npx wrangler d1 execute navjot-orders --local --file=schema.sql` and `npm run dev`.

## Before launch: things only you can fill in

| What | Where |
|---|---|
| **Book title** (exact text from the cover) | `CONFIG.BOOK_TITLE` in `public/assets/app.js`, the Book `name` in the JSON-LD in `index.html`, and `BOOK_TITLE` env var |
| **Direct price + shipping** (placeholders ₹499 / ₹60) | `CONFIG.BOOK_PRICE_INR`, `CONFIG.SHIPPING_INR` **and** the `BOOK_PRICE_INR` / `SHIPPING_INR` env vars (the server recomputes the amount and flags mismatches in the email) |
| **UPI**: `deifiedbooks@okicici` is TEMPORARY | `CONFIG.UPI_ID` and `CONFIG.UPI_PAYEE_NAME` (payee name should match the VPA's registered name) |
| **Email** (`hello@example.com` is a dummy) | `CONFIG.CONTACT_EMAIL`, plus the static fallbacks and JSON-LD in `index.html` (search for `hello@example.com`) |
| Footer credit | `CONFIG.CRAFTED_BY` |
| Real domain | `npm run set-domain -- https://…` |

Contact links and text in the page read from `CONFIG` at runtime (`data-cfg-href` / `data-cfg-text`). The HTML keeps the same values as no-JS fallbacks. Head metadata (OG, JSON-LD) has to stay static for crawlers, so it mirrors CONFIG.

## Asset mapping (`ASSETS` in `app.js`)

**Important:** this build environment's network policy blocked `res.cloudinary.com`, so the images could **not** be opened and inspected. The mapping below is inferred from filenames, and it was built to be safe without seeing the photos:

- Every photo slot requests a **face-aware server-side crop** (`c_fill,g_auto,ar_…`) at the exact aspect ratio of the slot, so faces are kept in frame on every breakpoint. `pos` (CSS object-position) is a second safety net.
- Transparent PNGs are shown uncropped (`c_limit`, `object-fit: contain`) as floating cutouts. If a PNG turns out to be opaque, it still reads as a framed photo.
- WhatsApp-compressed files (`IMG-2024…`, `IMG-2025…`, `IMG-2026…`, `VID-2025…`) are marked `small: true` and only used in small tiles.
- `Screenshot_…_ChatGPT.jpg` is in `LIB` but **disabled** (`enabled: false` in `ASSETS.moments`). Enable it only if it's a clean image.

| Slot | Asset | Why |
|---|---|---|
| Hero video / poster | `IMG_2677.mov` (as .mp4) + `so_1` frame grab | iPhone original: best quality for full-bleed |
| Hero fallback, OG image | `navjot-05.jpg` | named portrait |
| About portrait | `DSC_4230.JPG` | DSLR, likely studio |
| About cutout | `DR._NAVJOT.png` | PNG → floating cutout |
| Leadership visual | `file_…2ca8….png` | PNG |
| Journey visual | `file_…f774….png` | PNG |
| Contact cutout | `file_…f3dc….png` | PNG |
| Awards rail photos | `DSC_4235.JPG`, `20231201_141109.jpg`, `2243.JPG` | DSLR + Dec 2023 (awards year) |
| Book | `71to1VD6NoL._SL1500_` | cover |
| Media cover frame | `navjot-07.jpg` | named portrait (Diva Planet feature frame) |
| Impact bento | `ayam_2022`, `1000250327`, `20250325_085754`, `IMG-20240919-WA0015`*, `IMG-20250325-WA0007`* + videos `1000416510`, `1000416969.mov`, `1000418113` | events / social work |
| Moments | `20240713`, `20251206`, `IMG_20220511`, `20250705_121907`, `20250705_122055`, `1000381797`, `IMG-20260922-WA0026`* + videos `1000211837`, `1000424527`, `VID-20251206-WA0006`* | remaining gallery |

\* small tiles only. To re-map, change the `LIB.*` reference in `ASSETS`. If you change `ASSETS.hero.video`, also update the two poster `preload` links and the `<picture>` in `index.html` (they mirror it so the LCP image starts downloading before JS).

Alt text and captions are written to be accurate without having seen the photos ("at an event", "on stage"). Once you've viewed them, make them more specific in `ASSETS`.

## Maintenance

- **Edit `app.js`?** Bump `?v=` on its `<script>` tag in `index.html` (`/assets/*` is cached for a year, immutable).
- **Edit the inline boot `<script>` in `<head>`?** Run `npm run csp-hash` (the CSP whitelists it by hash).
- **Change the monogram?** Edit `public/favicon.svg`, then `npm install && npm run icons` regenerates the favicon PNGs, the ICO and `og.jpg`.
- **Fonts**: Google Fonts files from fonts.gstatic.com, with the `@font-face` rules (latin + latin-ext, `font-display: swap`) inlined in `index.html`, so there's no render-blocking stylesheet round trip. Preconnect warms the origin.

## Orders

`upi://pay?pa=<UPI_ID>&pn=<payee>&am=<total>&cu=INR&tn=<order ref>`: a deep link on phones, a QR code of the same link on desktop, plus a copy-UPI-ID button. The buyer then submits the UTR. `/api/order`:
- rejects cross-origin posts, non-JSON and oversized bodies
- validates every field; the honeypot returns fake success
- recomputes the amount on the server
- inserts `status='pending'`; `utr` is UNIQUE, so the same payment can't be claimed twice
- emails you via ZeptoMail with `reply_to` set to the buyer

Verify each UTR against your UPI statement, then `UPDATE orders SET status='verified' WHERE id='NK-…'`.
