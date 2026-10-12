# Dr. Navjot Kaur: personal brand site + Studio

A one-page, editorial brand portfolio with a visual editor (the **Studio**) at `/admin`.
It runs on **Cloudflare Pages only**: no KV, R2, D1 or any other Cloudflare service, and no build step.
Deploy `navjot-site.zip` (the contents of `public/`).

```
public/
  index.html            page, inline critical CSS, icon sprite, SEO + JSON-LD
  assets/app.js         CONFIG → LIB → ASSETS at the top, then all behaviour
  _worker.js            Pages worker: applies published edits, Studio login + API, real domain in SEO tags
  _routes.json          which paths the worker handles (static assets skip it)
  admin/                the Studio (index.html, admin.css, admin.js)
  _headers              security headers, CSP, cache rules
  _redirects            /favicon.ico → the NK logo on black (Cloudinary)
  robots.txt  sitemap.xml  site.webmanifest  og.jpg
scripts/                CSP hash, editable-text tagging, og.jpg generator, domain swap
```

Libraries load from jsDelivr at pinned versions with SRI: GSAP 3.12.5 + ScrollTrigger and Lenis 1.1.13.
Fonts come from Google Fonts (Cormorant Garamond, Bebas Neue, Jost), with the `@font-face` rules inlined.

## Deploy to Cloudflare Pages

**Direct upload (no Git):** Cloudflare dashboard → Workers & Pages → Create → Pages → *Upload assets*, then drop in `navjot-site.zip`.
`index.html`, `_worker.js` and `_routes.json` sit at the root of the zip. Then follow the setup checklist below.

**From Git:** connect the repo. Framework preset: *None*. Build command: *(empty)*. Output directory: `public`.

To rebuild the zip after edits, run `npm run zip`.

## Setup checklist (once, about 5 minutes)

1. **Upload** `navjot-site.zip` to the Pages project (Workers & Pages → the project → *Create deployment*).
2. **Variables:** Workers & Pages → the project → **Settings → Variables and Secrets** → *Production*. Add:

   | Variable | Required | What it is |
   |---|---|---|
   | `ADMIN_USER` | yes | Studio login ID you give the client |
   | `ADMIN_PASSWORD` | yes | Studio password (type **Secret**) |
   | `CLOUDINARY_API_KEY` | yes | **Your** Cloudinary → Settings → API Keys |
   | `CLOUDINARY_API_SECRET` | yes | Same page (type **Secret**) |
   | `CLOUDINARY_CLOUD_NAME` | no | Defaults to `dhn6pvsr1` |
   | `SITE_URL` | recommended | The real address, e.g. `https://www.drnavjotkaur.com`. It sets the canonical link, social URLs, sitemap and robots.txt. Without it, the custom domain in use is detected automatically. |
   | `SUPPORT_NAME` | no | Your studio name shown in the Studio (default `Infinity`) |
   | `SUPPORT_WHATSAPP` | recommended | Your WhatsApp (digits with country code). Help and DNS requests from the Studio come here. |
   | `SUPPORT_EMAIL` | optional | Used if no WhatsApp is set |

3. **Redeploy:** variables apply to new deployments, so upload the same ZIP once more.
4. **Check:** open `https://<domain>/admin/`, sign in, change a word, press **Publish**, then open the site.

The Cloudinary keys are used **only** to store the published content (one small JSON file, plus its history). The client never sees them. They don't need your Cloudflare or Cloudinary login.

## The Studio (`/admin`): what the client gets

- **Home:**
  - a personal greeting and live counts of everything they control
  - site health score
  - their domain shown as connected
  - quick actions and a "Need anything?" link to you
- **Domain & DNS:**
  - their domain, with HTTPS and response time
  - live DNS records, read-only, looked up through public DNS-over-HTTPS
  - a friendly **Request a change** form (presets for business email, Google verification and subdomains) that sends the request to your WhatsApp or email
  - no Cloudflare access needed or shared
- **Text:** click any text in the live preview and type (bold, gold italic, line breaks). All 322 texts are editable.
- **Photos & videos:**
  - click any photo, or use the Photos panel to replace, reorder, add or remove, with a description and focus point
  - new photos come from **the client's own Cloudinary**: the Studio walks them through uploading there, copying the link (*Copy URL*) and pasting it
  - any `https://res.cloudinary.com/...` link from any account works
  - the existing photos (in your Cloudinary) keep working
- **Podcasts:** paste YouTube links; titles optional.
- **Contact & links:** WhatsApp, email, phone, Instagram, LinkedIn and book links, updated everywhere at once.
- **Sections:** show or hide whole sections; edit the menu, footer and phone tab bar.
- **Google & sharing:** title and description, with a live Google preview.
- **Safety net:**
  - undo and redo
  - drafts saved automatically in the browser
  - nothing goes live until **Publish** (with a summary of changes)
  - **Version history** can reopen any published version, or the original site
- **Shortcuts:** Ctrl/⌘ + K searches everything; Ctrl/⌘ + Z undoes; Ctrl/⌘ + S publishes.

**How publishing works.**
- The worker saves `navjot-site/content.json` (plus a copy in `navjot-site/history/`) to the Cloudinary account in the variables.
- Visitors get the published texts and links applied on the server, so Google sees them too, within about a minute.
- Every photo must be a Cloudinary link; the server refuses anything else.
- Login is an HttpOnly, signed cookie that expires after 12 hours. Changing `ADMIN_PASSWORD` signs everyone out. Repeated wrong passwords are slowed down.

**Troubleshooting.**
- *"Publishing switches on after one last setup step"*: the Cloudinary variables are missing, or the ZIP wasn't redeployed after adding them.
- *A pasted photo shows no preview*: the link is incomplete, or the file is private in Cloudinary.
- *Changes not visible yet*: wait a minute, then hard-refresh.

**For developers.**
- Editable texts carry `data-e` keys and external links carry `data-l` keys. After adding new HTML, run `python3 scripts/tag-editables.py`: existing keys never change.
- After editing the inline boot `<script>`, run `npm run csp-hash`: it updates both `_headers` and `_worker.js`.

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
