# Zarvis: AI website studio

Zarvis builds animated, Awwwards-style portfolio websites from your own data and gives you a ZIP you can upload straight to Cloudflare Pages.

- **You give it facts:** name, bio, roles, image and video links, social links, books, awards, stats, contact details.
- **The AI writes the copy (optional):** headlines, section titles, FAQ, SEO text. You pick Claude, OpenAI, Gemini or Groq in Settings.
- **The Zarvis engine builds the site.** Six art directions, three hero layouts and three motion levels. Every site gets:
  - a left hamburger menu, and a bottom tab bar on mobile and tablet
  - a full-bleed animated hero
  - moving image rows
  - Open Graph image, social icons, contact links, SEO files and a strict security policy

The AI only writes words. The layout, animation and speed come from the engine, so every site keeps the same quality whichever AI (or none) you use.

---

## 1. Deploy Zarvis on Cloudflare Pages

**Option A: drag and drop (fastest)**

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Upload assets**.
2. Name the project `zarvis`.
3. Upload the contents of `zarvis.zip`: unzip it and drop the folder. `index.html` and `_worker.js` must be at the top level.
4. Deploy. Your studio is live at `https://zarvis.pages.dev` (or `zarvis-xxx.pages.dev`).

**Option B: from Git**

Connect the repository with these build settings:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `zarvis/public` |

The built `_worker.js` is committed, so no build step runs on Cloudflare. Run `npm run build` locally only if you change the files in `src/`.

## 2. Add your AI keys (secrets)

Go to **Pages → zarvis → Settings → Variables and Secrets**. Add the keys you use as **Secret** values for **Production**. You only need one.

| Secret | Provider |
|---|---|
| `ANTHROPIC_API_KEY` | Claude (console.anthropic.com) |
| `OPENAI_API_KEY` | OpenAI |
| `GEMINI_API_KEY` | Google Gemini (aistudio.google.com) |
| `GROQ_API_KEY` | Groq |
| `ZARVIS_PASSWORD` | Optional second lock for the AI endpoints |

Redeploy after adding secrets: **Deployments → … → Retry deployment**, or upload again. Keys stay on Cloudflare's server and never reach the browser.

## 3. Password-protect it

Use **Cloudflare Access**. It is free for up to 50 users.

1. Open **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Application domain: `zarvis.pages.dev` (and `*.zarvis.pages.dev` to cover preview deployments).
3. Policy: **Allow**, with a rule such as *Emails → your@email.com*. Cloudflare then emails you a one-time code at login.

A shortcut: **Pages → zarvis → Settings → General → Access policy → Enable** protects preview URLs. Add the production domain in Zero Trust as above.

`ZARVIS_PASSWORD` is optional. When set, the studio asks for it once per browser session before it can call the AI, so even a leaked Access session cannot spend your tokens.

## 4. Switch AI provider or model

In the studio, go to **Settings**:

- **Provider:** the list shows which ones have a key configured.
- **Model:** type any model your account supports. Suggestions are listed.
- **Effort:** Low is cheapest and fastest; Max is best quality.

| Provider | Default model | Notes |
|---|---|---|
| Claude | `claude-opus-5` | Best writing quality. Uses adaptive thinking and structured JSON output. If Opus 5 declines a request, Anthropic's server-side fallback reruns it on their recommended model. Use `claude-haiku-4-5` for low cost. |
| OpenAI | `gpt-4.1-mini` | Change it to any chat model on your account. |
| Gemini | `gemini-2.5-flash` | Good low-cost option. |
| Groq | `llama-3.3-70b-versatile` | Very fast and cheap. |

Model names change often. If a provider says "model not found", type the current name from that provider's dashboard.

## 5. Make a website

1. **Brand:** name, kind of site, tagline, roles (they rotate in the hero), bio, mission, tone.
2. **Contact & social:** email, WhatsApp, phone, booking link, and Instagram / LinkedIn / Facebook / YouTube / X / TikTok / Threads links.
3. **Images & video:** hero image, logo, optional hero video, gallery and video links, and an optional share-image override.
   - Cloudinary links get automatic face-aware crops, responsive sizes and an auto-generated OG image.
   - Other image links work as they are.
4. **Sections:** tick what you want: about, stats, services, speaking, books, organisations, awards, testimonials, timeline, gallery, press, FAQ, newsletter, contact. Each shows its fields when ticked.
5. **Features:** tick boxes for:
   - splash intro, smooth scrolling, custom cursor, pinned awards rail
   - WhatsApp chat bubble, live chat widget (Tawk.to or Crisp)
   - share buttons, save-contact (vCard), back-to-top
   - Google Analytics 4 or Plausible, with an optional cookie consent banner

   Order and inquiry forms send the message to WhatsApp, or to email if no WhatsApp number is set.
6. **Design:** six themes (Editorial Luxe, Noir Cinema, Swiss Precision, Terracotta Warmth, Midnight Aurora, Blush Couture), hero layout (full-bleed / split / centered), motion (subtle / standard / cinematic), accent colour, and optional custom CSS.
7. **AI brief & SEO:**
   - **Unique request:** free text for anything special, such as "make it feel like a fashion magazine" or "add a section about my foundation".
   - Domain, SEO title and description, footer.
8. **Build & download:**
   - **Write copy with AI** (optional).
   - **Render theme previews** compares all six designs; click one to apply it.
   - **Download website ZIP.**

Upload that ZIP as a new Cloudflare Pages project and the website is live.

The ZIP contains `zarvis-project.json`. Import it in **Projects** to edit the site later. Projects are saved in your browser; use **Export JSON** to back them up.

### Honesty rules

The AI is told to use only the facts you enter:

- no invented numbers, awards, clients or quotes
- stats appear only if you type them

Always read the copy before publishing.

## Files

```
public/            ← what Cloudflare serves (this is the ZIP)
  _worker.js       built API worker (AI calls, password check, security headers)
  index.html       the studio
  zarvis.css
  js/              studio app, engine, themes, icons, zip writer, sample project
  engine/site.js   runtime shipped inside every generated website
src/               worker source (edit here, then npm run build)
scripts/build.mjs  bundles src/ into public/_worker.js with esbuild
```

Local development:

```
npm install
npm run build
npx wrangler pages dev public
```

`npm run zip` rebuilds and creates `zarvis.zip`.
