/**
 * Prompts and JSON schemas for Zarvis v2. The model designs the site as data:
 * design system, palette, fonts, and an ordered list of universal blocks.
 * The deterministic engine turns that into HTML, so quality never depends on
 * the model writing markup.
 */
import { BLOCKS, BLOCK_TYPES, ICONS } from '../public/js/blocks.js';
import { STYLES, STYLE_IDS, OPTIONS } from '../public/js/styles.js';
import { FONT_NAMES } from '../public/js/fonts.js';

const str = { type: 'string' };
const ITEM = {
  type: 'object', additionalProperties: false,
  required: ['title', 'text', 'meta', 'value', 'icon', 'tag', 'link', 'image', 'imageQuery'],
  properties: { title: str, text: str, meta: str, value: str, icon: { type: 'string', enum: ['', ...ICONS] }, tag: str, link: str, image: str, imageQuery: str }
};
const BLOCK = {
  type: 'object', additionalProperties: false,
  required: ['id', 'type', 'variant', 'tone', 'menuLabel', 'showInMenu', 'eyebrow', 'title', 'titleEm', 'text', 'image', 'imageQuery', 'buttons', 'items'],
  properties: {
    id: str, type: { type: 'string', enum: BLOCK_TYPES }, variant: str,
    tone: { type: 'string', enum: ['auto', 'light', 'alt', 'dark', 'accent'] },
    menuLabel: str, showInMenu: { type: 'boolean' },
    eyebrow: str, title: str, titleEm: str, text: str, image: str, imageQuery: str,
    buttons: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['label', 'href'], properties: { label: str, href: str } } },
    items: { type: 'array', items: ITEM }
  }
};
const PALETTE = { type: 'object', additionalProperties: false, required: ['bg', 'surface', 'text', 'accent', 'accent2', 'dark', 'darkText'], properties: Object.fromEntries(['bg', 'surface', 'text', 'accent', 'accent2', 'dark', 'darkText'].map(k => [k, str])) };
export const SITE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['style', 'palette', 'fonts', 'heroText', 'tagline', 'seoTitle', 'seoDescription', 'blocks', 'notes'],
  properties: {
    style: { type: 'string', enum: STYLE_IDS }, palette: PALETTE,
    fonts: { type: 'object', additionalProperties: false, required: ['display', 'body'], properties: { display: { type: 'string', enum: FONT_NAMES }, body: { type: 'string', enum: FONT_NAMES } } },
    heroText: { type: 'string', enum: Object.keys(OPTIONS.heroText) },
    tagline: str, seoTitle: str, seoDescription: str,
    blocks: { type: 'array', items: BLOCK },
    notes: str
  }
};
export const BLOCK_SCHEMA = { type: 'object', additionalProperties: false, required: ['block', 'notes'], properties: { block: BLOCK, notes: str } };

const styleList = STYLE_IDS.map(id => `- ${id}: ${STYLES[id].name}, ${STYLES[id].tag}. ${STYLES[id].desc} Default fonts ${STYLES[id].fonts.display} / ${STYLES[id].fonts.body}.`).join('\n');
const ITEM_HELP = {
  hero: 'items = rotating words under the headline (title only). Leave empty for none.',
  about: 'text = story paragraphs (blank line between). items = optional highlights (title + text). "statement": title+titleEm is one big sentence. "quote": text is the quote, title the person.',
  features: 'items = services/features: icon, title, text (1–2 sentences), optional link.',
  stats: 'items: value = the number (digits only, e.g. "25"), meta = suffix ("+", "%", "k"), title = label. ONLY real numbers from the facts.',
  work: 'items = projects: title, meta (category or year), text, link. Needs images.',
  gallery: 'no items; the images come from the user. Give imageQuery.',
  products: 'items = products / dishes / books / packages: title, text, meta = price (only if given, else "[Price]"), tag = badge, link = buy URL (empty = order via WhatsApp/email).',
  pricing: 'items = plans: title, value = price (only if given, else "[Price]"), meta = period ("month"), text = features one per line, tag = badge on the featured plan, link = "#contact" or URL.',
  testimonials: 'items = quotes: text = quote, title = name, meta = role. ONLY real quotes from the facts; otherwise use one or two "[Add a real client quote]" items, or leave this block out.',
  team: 'items = people: title = name, meta = role, text = short bio. Only real names; otherwise "[Name]" / "[Role]".',
  logos: 'items = client/press names (title). Only real names from the facts.',
  timeline: 'items: meta = year / step number / date / time, title, text. "steps" suits a process, "agenda" suits events or a schedule.',
  faq: 'items: title = question, text = answer. Answers must not invent facts; use [placeholders] for specifics.',
  cta: 'title + titleEm = the invitation; buttons = 1–2 actions.',
  marquee: 'items = 3–6 short words or phrases (title only) that capture the brand.',
  video: 'the user adds the video link later; write the title.',
  contact: 'contact details come from the brand settings automatically. items = extra info rows only (e.g. opening hours: title "Hours", text only if given).',
  newsletter: 'title + text; buttons[0].label = button text, buttons[0].href = "" unless a form URL was given.',
  map: 'shows the address from brand settings; title only.',
  html: 'do not use.'
};
const blockList = BLOCK_TYPES.filter(t => t !== 'html').map(t => `- ${t} (${BLOCKS[t].label}). Variants: ${Object.entries(BLOCKS[t].variants).map(([k, v]) => `${k} = ${v}`).join('; ')}. ${ITEM_HELP[t]}`).join('\n');

export const SYSTEM_PROMPT = `You are the creative director and senior copywriter of an Awwwards "Site of the Day" studio. You design one-page websites with Zarvis: you choose a design system, palette, fonts and an ordered list of content blocks, and you write all the copy. A rendering engine turns your JSON into a fully animated website, so you never write HTML or CSS.

HONESTY (most important)
- Use only facts the user gave. Never invent numbers, years of experience, awards, client or brand names, prices, dates, addresses, opening hours, team members, press mentions, certifications or testimonials.
- You may write descriptive, persuasive copy about what they offer and why it matters, in general terms. No superlatives presented as fact ("best in Dubai", "#1", "award-winning") unless the facts say so.
- When a block needs a specific fact you do not have, write a short placeholder in square brackets, e.g. [Price], [Client name], [Add a real client quote], [Opening hours]. Prefer leaving out stats, testimonials, logos and team blocks entirely when there are no facts for them.

DESIGN SYSTEMS (pick the one that fits the brief; if the user fixed one, use it)
${styleList}

PALETTE
Seven hex colours (#RRGGBB): bg (page), surface (tinted sections and cards), text, accent, accent2, dark (dark sections, footer, menu), darkText. Contrast must pass WCAG AA: text on bg and on surface at least 4.5:1, darkText on dark at least 4.5:1. Make it specific to the brand and the design system's character (not generic blue). A dark design system may use a dark bg with light text.

FONTS
Choose display and body fonts from the allowed list. The display font carries the personality; the body font must be very readable. Pairings that suit the design system work best.

BLOCKS
Each block uses the same fields: eyebrow (small label above the title), title and titleEm (the heading is title followed by titleEm, which is rendered highlighted, so put the 1–4 most evocative words in titleEm), text, image, imageQuery, buttons, items. Leave unused fields as "" or [].
${blockList}

STRUCTURE
- 6 to 11 blocks. Start with hero. End with contact (the contact details are filled in automatically).
- Pick blocks that fit this kind of business (a restaurant needs products with variant "menu", a SaaS needs features, pricing and faq, a photographer needs work and gallery, an event needs timeline "agenda" and pricing for tickets...).
- Vary layouts: prefer the variant that suits the design system; do not use the same variant for consecutive blocks of the same type.
- showInMenu true for 4–6 main blocks (never for hero, marquee, cta, logos or stats). menuLabel 1–2 words.
- tone: use "auto" unless you have a clear reason (e.g. "accent" for one bold cta).
- Buttons: href is "#<block type>" for a block on the page (e.g. "#contact", "#pricing", "#work"), or "whatsapp", "email", "call" when those channels exist, or an https URL the user gave.

IMAGES
- image fields may only contain URLs from the user's image list (exact strings). Otherwise use "".
- For hero, about, work items, products items, gallery and a banner cta, always give imageQuery: 3–6 concrete English words for a stock-photo search (e.g. "candlelit trattoria table pasta"). Never describe a real person's face.

WRITING
- Write in the requested language. Headlines short and striking: hero title + titleEm at most 8 words. Body copy tight, concrete, human.
- Avoid clichés: "Welcome to", "Unleash", "Elevate", "Unlock", "In today's fast-paced world", "Look no further", "one-stop shop".
- Every site must feel unique: let the seed nudge your choices of structure, variants, palette and fonts.
- notes: one or two sentences to the user about your design choices and which placeholders to fill in.

OUTPUT
Return only JSON matching this shape:
{"style":"…","palette":{"bg":"#…","surface":"#…","text":"#…","accent":"#…","accent2":"#…","dark":"#…","darkText":"#…"},"fonts":{"display":"…","body":"…"},"heroText":"rise|typewriter|scramble|blur|wave|fade","tagline":"…","seoTitle":"…","seoDescription":"…","blocks":[{"id":"","type":"hero","variant":"…","tone":"auto","menuLabel":"","showInMenu":false,"eyebrow":"…","title":"…","titleEm":"…","text":"…","image":"","imageQuery":"…","buttons":[{"label":"…","href":"#contact"}],"items":[{"title":"…","text":"","meta":"","value":"","icon":"","tag":"","link":"","image":"","imageQuery":""}]}],"notes":"…"}
Allowed icons: ${ICONS.join(', ')}.
Allowed fonts: ${FONT_NAMES.join(', ')}.`;

const clip = (s, n) => String(s ?? '').slice(0, n);
export function buildUserPrompt(mode, input = {}) {
  if (mode === 'site') {
    const i = input;
    return [
      'MODE: design a complete new website.',
      `Name: ${clip(i.name, 120)}`,
      `Description: ${clip(i.description, 2000) || '(none, infer from the name and kind)'}`,
      `Kind: ${clip(i.kind, 120) || '(infer)'}`,
      `Design system: ${i.style && i.style !== 'auto' ? `${i.style} (fixed by the user)` : 'your choice'}`,
      `Language: ${clip(i.language, 20) || 'en'}`,
      `Contact channels available: ${Object.entries(i.contact || {}).filter(([k, v]) => v && k !== 'address').map(([k]) => k).join(', ') || 'none yet'}${i.contact?.address ? `; address: ${clip(i.contact.address, 200)}` : ''}`,
      `Social profiles: ${(i.social || []).join(', ') || 'none'}`,
      `User images (use exact URLs only):\n${(i.images || []).slice(0, 40).map((u, k) => `${k + 1}. ${clip(u, 400)}`).join('\n') || '(none)'}`,
      `FACTS (the only facts you may state):\n${clip(i.facts, 12000) || '(none given: use placeholders for anything specific)'}`,
      `Seed: ${Number(i.seed) || 1}`
    ].join('\n\n');
  }
  const project = JSON.stringify(input.project || {}).slice(0, 90000);
  if (mode === 'block') {
    return [
      'MODE: rewrite ONE block. Return {"block": {...}, "notes": "..."} with the same type unless the instruction asks for a different type. Keep its id. Keep image URLs that are already set.',
      `Block id to rewrite: ${clip(input.blockId, 60)}`,
      `INSTRUCTION: ${clip(input.instruction, 1500)}`,
      `CURRENT PROJECT (for context; facts in brief.facts are the only facts you may state):\n${project}`
    ].join('\n\n');
  }
  return [
    'MODE: edit an existing website. Apply the instruction and return the COMPLETE updated site in the output shape.',
    '- Keep the "id" of every block you keep (new blocks get id ""). Keep block order unless asked. Keep the user\'s text unless the instruction asks to change it. Keep image URLs that are already set.',
    '- Keep style, palette and fonts unless the instruction is about the look. If it is about the look, you may change any of them.',
    `INSTRUCTION: ${clip(input.instruction, 1500)}`,
    `CURRENT PROJECT (facts in brief.facts are the only facts you may state):\n${project}`,
    `Seed: ${Number(input.seed) || 1}`
  ].join('\n\n');
}
