# Dr. Navjot Kaur: personal brand site

A one-page, editorial brand portfolio. Pure static files: no build step, no server, no database.
Deploy the `public/` folder (or `navjot-site.zip`) to **Cloudflare Pages**.

```
public/
  index.html            page, inline critical CSS, icon sprite, SEO + JSON-LD
  assets/app.js         CONFIG → LIB → ASSETS at the top, then all behaviour
  assets/monogram.svg   crown + NK monogram
  _headers              security headers, CSP, cache rules
  robots.txt  sitemap.xml  site.webmanifest  og.jpg  favicon set
scripts/                icon/OG generator (sharp), CSP hash, domain swap
```

Libraries load from jsDelivr at pinned versions with SRI: GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.13.
Fonts come from Google Fonts (Cormorant Garamond, Bebas Neue, Jost), with the `@font-face` rules inlined.

## Deploy to Cloudflare Pages

**Direct upload (no Git):** Cloudflare dashboard → Workers & Pages → Create → Pages → *Upload assets*, then drop in `navjot-site.zip`.
`index.html` sits at the root of the zip.

**From Git:** connect the repo. Framework preset: *None*. Build command: *(empty)*. Output directory: `public`.

To rebuild the zip after edits, run `npm run zip`.

## How ordering works (no payments on the site)

- **Order on WhatsApp** (Books section, the hero book card, or clicking the 3D book) opens a short form: book, copies, name, phone, pincode, address.
  Submitting opens WhatsApp (the app on phones, WhatsApp Web on desktop) with the complete order message addressed to `CONFIG.WHATSAPP_NUMBER`.
  She confirms price, payment and delivery in the chat.
- **Invite to speak** (top bar, hero, Speaker section, Contact) works the same way: name, phone, organisation, event, date, city and message are sent as a WhatsApp invitation.
- Every form also offers **"Prefer email?"**, which opens the same message pre-filled in the visitor's email app.

## Edit these in `public/assets/app.js` → `CONFIG`

| What | Key |
|---|---|
| WhatsApp number for orders and invitations | `WHATSAPP_NUMBER` (currently `917743031578`) |
| **Email**: `hello@example.com` is a dummy | `CONTACT_EMAIL` (also update the fallback text in `index.html` and the JSON-LD) |
| **The 4 other books** | `BOOKS`: fill in `title` (and optionally `cover` and `amazon`) for `book-2` … `book-5`. They appear on an "Also by Dr. Navjot Kaur" shelf and in the order form automatically. With no cover image, an elegant typographic cover is drawn. |
| Footer credit | `CRAFTED_BY` |
| Real domain | run `npm run set-domain -- https://www.your-domain.com` |

After editing `app.js`, bump `?v=` on its `<script>` tag in `index.html` (it's cached for a year).

## Photos (`ASSETS` in `app.js`)

- **Hero:** `hero_image` only (her photo, as requested). If you change it, also update the `preload` link and `<img>` in `index.html`.
- **About:** `author_photo_1`, which slowly cross-fades with `author_photo_6`, plus `author_photo_2`.
- **Speaker:** `author_photo_3`, with the stage video playing over it when in view.
- **Contact:** `author_photo_5`. `author_photo_4` opens the gallery.
- **Leadership:** the three organisation logos.
- **Moments of Honor, Impact, Media and the moving gallery rows:** the event, award and community photos and videos.

Every photo slot requests a face-aware crop from Cloudinary (`c_fill,g_auto`), so her face stays in frame at any screen size.
Logos and the book cover are never cropped. The ChatGPT screenshot is kept but disabled (`enabled: false`).

## Maintenance

- Edit the tiny inline `<script>` in `<head>`? Run `npm run csp-hash` (the CSP whitelists it by hash).
- Change the monogram? Edit `public/favicon.svg`, then `npm install && npm run icons` regenerates the favicons and `og.jpg`.
