# Dr. Navjot Kaur: personal brand site

A one-page, editorial brand portfolio. Pure static files: no build step, no server, no database.
Deploy the `public/` folder (or `navjot-site.zip`) to **Cloudflare Pages**.

```
public/
  index.html            page, inline critical CSS, icon sprite, SEO + JSON-LD
  assets/app.js         CONFIG → LIB → ASSETS at the top, then all behaviour
  _headers              security headers, CSP, cache rules
  _redirects            /favicon.ico → the NK logo on black (Cloudinary)
  robots.txt  sitemap.xml  site.webmanifest  og.jpg
scripts/                og.jpg generator (sharp), CSP hash, domain swap
```

Libraries load from jsDelivr at pinned versions with SRI: GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.13.
Fonts come from Google Fonts (Cormorant Garamond, Bebas Neue, Jost), with the `@font-face` rules inlined.

## Deploy to Cloudflare Pages

**Direct upload (no Git):** Cloudflare dashboard → Workers & Pages → Create → Pages → *Upload assets*, then drop in `navjot-site.zip`.
`index.html`, `_worker.js` and `_routes.json` sit at the root of the zip.

**From Git:** connect the repo. Framework preset: *None*. Build command: *(empty)*. Output directory: `public`.

To rebuild the zip after edits, run `npm run zip`.

## The Studio (`/admin`): edit everything visually

Open `https://your-site/admin/` and sign in. The website appears in the Studio exactly as visitors see it:

- **Texts:** click any text in the preview and type. Use the toolbar for bold, gold italic and line breaks.
- **Photos:** click any photo to replace it. You can upload, pick from your Cloudinary library or paste a Cloudinary link, then add a description and set the focus point.
- **Lists:** the **Photos** panel reorders, adds or removes photos in every gallery, slideshow and magazine wall.
- **Podcasts:** paste YouTube links.
- **Contact & links:** WhatsApp, email, phone, Instagram, LinkedIn and book links update everywhere at once.
- **Sections:** show or hide whole sections.
- **Google & sharing:** page title and description, with a live Google preview.
- **Safety net:**
  - undo and redo
  - drafts saved automatically in the browser
  - a version history that can reopen any published version, or the original site
  - nothing goes live until **Publish**

**Setup (once).** In Cloudflare go to Workers & Pages → this project → Settings → Variables and Secrets, add these for Production, then redeploy (upload the ZIP again).

| Variable | What it is |
|---|---|
| `ADMIN_USER` | Studio login ID |
| `ADMIN_PASSWORD` | Studio password (choose type *Secret*) |
| `CLOUDINARY_API_KEY` | Cloudinary → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Same page (type *Secret*) |
| `CLOUDINARY_CLOUD_NAME` | Optional, defaults to `dhn6pvsr1` |

**How it works.** The site runs on Cloudflare Pages alone, with no KV, R2, D1 or other Cloudflare services.

- `public/_worker.js` serves the page, the Studio API and the login. The login is an HttpOnly cookie signed with the password, and expires after 12 hours.
- Published content is one JSON file (`navjot-site/content.json`) in the site's own Cloudinary account, next to the photos. Every publish also keeps a copy in `navjot-site/history/`.
- Uploaded photos go to the `navjot-site/media` folder.
- Visitors get the published texts and links applied on the server, so Google sees them too. Changes appear within about a minute.
- Every photo must be a Cloudinary link; the server refuses anything else.

**For developers.**
- Editable texts carry `data-e` keys and external links carry `data-l` keys. After adding new HTML, run `python3 scripts/tag-editables.py`: existing keys never change.
- `npm run csp-hash` updates the boot-script hash in both `_headers` and `_worker.js`.

## How ordering works (no payments on the site)

- **Order on WhatsApp** (Books section, the hero book card, or clicking the 3D book) opens a short form: book, copies, name, phone, pincode, address.
  Submitting opens WhatsApp (the app on phones, WhatsApp Web on desktop) with the complete order message addressed to `CONFIG.WHATSAPP_NUMBER`.
  Her team confirms the book price, payment and delivery in the chat.
- **Book an appointment** (Appointments section) sends the chosen healing / guidance session, name, phone and preferred date and time on WhatsApp.
  The team coordinates the slot and payment.
- **Invite to speak** (top bar, hero, Speaker section, Contact) works the same way: name, phone, organisation, event, date, city and message are sent as a WhatsApp invitation.
- Every form also offers **"Prefer email?"**, which opens the same message pre-filled in the visitor's email app.

## Edit these in `public/assets/app.js` → `CONFIG`

| What | Key |
|---|---|
| WhatsApp number for orders, appointments and invitations | `WHATSAPP_NUMBER` (currently `919814724488`) |
| Email | `CONTACT_EMAIL` (currently `Drnavjotkaur2211@gmail.com`; also update the fallback text in `index.html` and the JSON-LD) |
| Book list in the order form | `BOOKS` (the featured book, the three Mother Trilogy books, a "whole trilogy" option, and Gratitude, Wisdom & Blessing) |
| Footer credit | `CRAFTED_BY` |
| Real domain | run `npm run set-domain -- https://www.your-domain.com` |

After editing `app.js`, bump `?v=` on its `<script>` tag in `index.html` (it's cached for a year).

## Books

- **Featured:** *Cosmic Map of Answers* (3D cover, Amazon + WhatsApp).
- **The Library** (`#library` in `index.html`): *The Mother Trilogy*, whose three covers fan out as you scroll (Blessing and Creation link to Amazon, Gift to PNP Academy), and *Gratitude, Wisdom & Blessing* (Amazon).
  Each has its own WhatsApp order button with the title preselected. Covers come from `ASSETS.books`; the buy links are in the HTML.

## Logo and favicons

The gold NK logo (`LIB.logo`, a transparent PNG) is used on black in the splash, the header and the footer.
The favicons, Apple touch icon and app icons are the same logo padded on black by Cloudinary (the URLs are in `index.html` and `site.webmanifest`).

## Photos (`ASSETS` in `app.js`)

- **Hero:** `LIB.hero` only (her chosen photo). If you change it, also update the `preload` link, `<img>`, social images and JSON-LD in `index.html`.
- **About:** `LIB.aboutPortrait` in the arch, plus `author_photo_2`.
- **Speaker ("On stage"):** a story-style slideshow (`ASSETS.speaker.slides`): `author_photo_3`, three stage photos and one stage video, all shown whole.
- **Media:** the EdTalk World Conference interview (`author_photo_1`) as the featured photo, then `ASSETS.mediaInteractions` (media interactions and panel discussions) and the YouTube podcasts in `PODCASTS` (add a YouTube ID to add an episode).
- **Magazines:** `ASSETS.magazines`, covers and feature pages, never cropped.
- **Contact:** `author_photo_5`. The winning picture leads the gallery.
- **Leadership:** the organisation logos.
- **Moments of Honor, Impact and the moving gallery rows:** the event, award and community photos and videos. Each photo appears once on the site.

Her portraits (hero, about, speaker, contact) use face-aware crops. **Event, award and community photos and videos are never cropped**: each is shown whole over a soft blurred copy of itself, so no one's head is cut off.
Logos and the book cover are never cropped. The ChatGPT screenshot is kept but disabled (`enabled: false`).

## Maintenance

- Edit the tiny inline `<script>` in `<head>`? Run `npm run csp-hash` (the CSP whitelists it by hash).
- Regenerate the local `og.jpg` share fallback with `npm install && npm run og`.
