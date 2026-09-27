# Zarvis: AI website studio

Type a name and one sentence, and Zarvis designs a complete, animated, Awwwards-style website: structure, copy, fonts, colours and motion. You can then change anything by dragging blocks, clicking through design options or telling the AI what you want. Export a ZIP and upload it to Cloudflare Pages.

- **10 design systems**, each a complete art direction with its own fonts, palettes, layouts, headings, buttons, cards, image shapes, menus and animation personality:
  - Maison (editorial luxury)
  - Brutal (neo-brutalist)
  - Swiss (international grid)
  - Aurora (tech glass)
  - Bloom (organic)
  - Pop (playful)
  - Noir (cinematic)
  - Studio (agency minimal)
  - Gazette (magazine)
  - Retro (70s)
- **20 block types with 50+ layouts**:
  - hero, about, services, numbers, portfolio, gallery, products/menu, pricing
  - testimonials, team, logos, timeline/steps/events, FAQ, call to action
  - moving text, video, contact, newsletter, map, custom HTML
- **Drag and drop:** reorder blocks, drag new ones in from the library, and show or hide them. Blocks marked "Menu" automatically appear in the left hamburger menu, the mobile and tablet bottom bar, and the footer.
- **Any kind of website.** There are 12 starter templates (personal brand, restaurant, agency, SaaS, photographer, event, shop, architecture, writer, café, wellness, nonprofit) plus blank projects and AI-generated structures.
- **Fine control:**
  - 50+ Google Fonts, or type any other Google Font name
  - weights, sizes and heading case
  - seven editable colours, corner radius
  - heading, button, card and image styles; menu type; spacing
  - hero text effect (rise, typewriter, scramble, blur, letter wave, fade), reveal and image animations
  - cursor, intro splash, film grain, custom CSS
- **AI everywhere, optional:**
  - "Build with AI" designs the whole site from a sentence.
  - The command bar applies changes such as "make it more luxurious" or "add pricing with 3 plans".
  - Each block has its own "Rewrite with AI".
  - Choose Claude, OpenAI, Gemini or Groq in Settings.
- **🎲 Shuffle design** gives a new random design system, palette and font pairing instantly, with no AI tokens.
- **Every exported site includes:**
  - left hamburger menu and bottom tab bar on mobile and tablet
  - full-bleed or alternative animated hero
  - moving marquees, smooth scrolling, OG image, social icons and contact channels
  - WhatsApp/email forms and order buttons
  - SEO tags, JSON-LD, sitemap, robots.txt, a strict security policy, a 404 page and favicon

The AI only produces content and design choices as data. The Zarvis engine renders the HTML, CSS and animations, so quality stays the same with any AI provider, or with none.

### Honesty built in

- The AI is instructed to use only facts you provide.
- Anything specific it doesn't know (prices, names, numbers, quotes, hours) becomes a `[placeholder]`.
- Templates mark demo text the same way.
- **Publish → Content check** lists everything still to fill in, and the export asks before downloading a site with placeholders.

---

## 1. Deploy Zarvis on Cloudflare Pages

**Drag and drop (fastest)**

1. In the Cloudflare dashboard, open **Workers & Pages → Create → Pages → Upload assets**.
2. Name the project `zarvis`.
3. Unzip `zarvis.zip` and drop the folder. `index.html` and `_worker.js` must be at the top level.
4. Deploy. Zarvis is live at `https://zarvis.pages.dev` (or similar).

**From Git**

Use framework preset **None**, an empty build command, and build output directory `zarvis/public`. The built `_worker.js` is committed. Run `npm run build` only if you edit `src/`.

## 2. Add keys (secrets)

Go to **Pages → zarvis → Settings → Variables and Secrets** and add these as **Secret** values for Production. Add only the ones you use, then redeploy.

| Secret | What it enables |
|---|---|
| `ANTHROPIC_API_KEY` | Claude |
| `OPENAI_API_KEY` | OpenAI |
| `GEMINI_API_KEY` | Google Gemini |
| `GROQ_API_KEY` | Groq |
| `PEXELS_API_KEY` or `UNSPLASH_ACCESS_KEY` | Optional stock photos for empty image slots, plus a "Find a photo" search on every image field. Photographers are credited in the site footer. |
| `ZARVIS_PASSWORD` | Optional second lock on the AI endpoints |

Keys stay on Cloudflare's server; the browser never sees them. Without any AI key, Zarvis still works fully with templates, blocks, design controls and Shuffle. Without a photo key, empty image slots show designed artwork in the site's colours.

## 3. Password-protect it

Use **Cloudflare Access** (free for up to 50 users):

1. Go to **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Domain: `zarvis.pages.dev` (add `*.zarvis.pages.dev` to cover preview deployments).
3. Policy: **Allow**, with a rule like *Emails → you@example.com*.

`ZARVIS_PASSWORD` is optional. When set, the studio asks for it once per browser session before any AI call.

## 4. Choose the AI and the cost

In **Settings**, choose the provider, the model (type any model name your account has) and the effort level.

| Provider | Default | Notes |
|---|---|---|
| Claude | `claude-opus-5` | Best design and writing. Uses adaptive thinking and strict JSON-schema output, with Anthropic's server-side fallback if a request is declined. `claude-sonnet-5` is a good balance; `claude-haiku-4-5` is the cheapest. |
| OpenAI | `gpt-4.1-mini` | JSON mode. Change it to any chat model you have. |
| Gemini | `gemini-2.5-flash` | Low cost. |
| Groq | `llama-3.3-70b-versatile` | Very fast. |

Model names change often. If a provider replies "model not found", type the current name from its dashboard.

## 5. Make a website

1. **Home:** type the name and a sentence, pick the kind of website, and pick a design (or "Let AI decide").
   - Optionally open **Add your details**: email, WhatsApp, links, your image links, and facts (prices, awards, real testimonials…).
2. Click **✦ Build with AI**, or **Use template** / **Blank**.
3. **Editor:**
   - **Blocks:** drag ⋮⋮ to reorder, **+ Add block** (click or drag in), toggle *Menu* and visibility. Click a block, or double-click it in the preview, to edit its layout, background, texts, images, buttons and items.
   - **Design:** switch the design system, palette, colours, fonts, shapes and motion.
   - **Brand:** logo, contact channels, social links, and the facts for the AI.
   - **Features:** smooth scroll, progress bar, WhatsApp bubble, share buttons, announcement bar, form endpoint (e.g. Formspree), live chat (Tawk.to / Crisp), GA4 / Plausible with cookie consent.
   - **Publish:** domain, SEO, social image, content check, **Download ZIP**.
4. Upload the ZIP as a new Cloudflare Pages project. The site is live.

Projects are saved in your browser. Use **Export** to back them up, and **Import** to continue on another computer. Every exported ZIP also contains `zarvis-project.json`, which you can import.

Keyboard: Ctrl/⌘+Z undo, Ctrl/⌘+Shift+Z redo, Alt+↑/↓ move the focused block.

## Files

```
public/                 what Cloudflare serves (this is the ZIP)
  _worker.js            built API worker: AI, stock photos, password, security headers
  index.html, zarvis.css
  js/app.js             studio (home, editor, drag and drop, AI flows, export)
  js/engine.js          renderer: project → complete website files
  js/styles.js          the 10 design systems and design options
  js/blocks.js          block types, layouts and fields
  js/templates.js       starter templates
  js/fonts.js           curated Google Fonts and pairings
  js/sprite.js, zip.js  icons, ZIP writer
  engine/site.js        runtime included in every generated site
src/worker.js, src/prompt.js   worker source and AI prompts/schemas
scripts/build.mjs       bundles src/ into public/_worker.js
```

Local development: `npm install`, `npm run build`, then `npx wrangler pages dev public`. `npm run zip` builds `zarvis.zip`.
