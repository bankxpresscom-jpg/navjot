/**
 * The copywriting contract shared by every AI provider.
 * The AI only writes words (as JSON). Layout, motion, SEO and code come from
 * the Zarvis engine, which keeps every generated site fast and consistent.
 */
const str = { type: 'string' };
const strs = { type: 'array', items: str };
const obj = (props) => ({ type: 'object', additionalProperties: false, required: Object.keys(props), properties: props });

export const COPY_SCHEMA = obj({
  seo_title: str,
  seo_description: str,
  hero_eyebrow: str,
  hero_line1: str,
  hero_line2: str,
  hero_roles: strs,
  hero_intro: str,
  cta_primary: str,
  cta_secondary: str,
  marquee_words: strs,
  about_eyebrow: str,
  about_title: str,
  about_title_em: str,
  about_paragraphs: strs,
  about_quote: str,
  about_quote_label: str,
  section_copy: { type: 'array', items: obj({ id: str, eyebrow: str, title: str, title_em: str, intro: str }) },
  services: { type: 'array', items: obj({ title: str, text: str }) },
  speaking_formats: { type: 'array', items: obj({ title: str, text: str }) },
  book_blurbs: { type: 'array', items: obj({ title: str, blurb: str }) },
  faq: { type: 'array', items: obj({ q: str, a: str }) },
  custom_sections: { type: 'array', items: obj({ eyebrow: str, title: str, title_em: str, paragraphs: strs, bullets: strs }) },
  footer_tagline: str,
  custom_css: str,
  notes: str
});

export const SYSTEM_PROMPT = `You are the senior copywriter and creative director of an award-winning web studio that ships Awwwards "Site of the Day" winners.
You write the words for a single-page personal-brand or business website. A separate engine handles layout, animation and code, so you return JSON only, matching the schema exactly.

Voice: confident, warm, specific, premium. Short sentences. No clichés ("unlock", "elevate", "journey" used loosely, "in today's fast-paced world"), no emoji, no hashtags.
Honesty rules (critical):
- Use ONLY facts given in the brief. Never invent numbers, awards, clients, dates, quotes, testimonials, prices or claims.
- If a fact is missing, write around it gracefully rather than guessing.
- Book blurbs: describe only what the title and brief support; do not invent plot or chapter content.
- FAQ: only questions whose answers are fully supported by the brief (e.g. how to book, how to order, where based). Return an empty array if unsure.
Headline craft:
- hero_line1 / hero_line2: the brand or person's name split across two lines (line 2 may be empty). Keep it the name unless the brief asks otherwise.
- Titles use a "title" + "title_em" pair: title_em is ONE evocative word or short phrase that the design sets in italic accent (e.g. title "A voice that", title_em "moves rooms."). Keep titles under 8 words total.
- hero_roles: 3 to 6 short role labels (2 to 4 words each) drawn from the brief.
- marquee_words: 5 to 8 short uppercase-friendly phrases from the brief.
- section_copy: one entry for EACH section id listed under ENABLED SECTIONS, with an eyebrow label (1 to 3 words), title, title_em and a one or two sentence intro.
- services / speaking_formats: only when those sections are enabled; 3 to 6 items, each text under 30 words. Use items given in the brief when present.
- custom_sections: use this for anything in the UNIQUE REQUEST that needs its own section; otherwise an empty array.
- custom_css: empty string unless the UNIQUE REQUEST asks for a visual change. If you write CSS, keep it under 60 lines, use only these variables: --bg --paper --ink --accent --accent-2 --text --muted --display --label --body, never import fonts or external URLs.
- notes: one or two sentences for the site owner about choices you made or facts you could not verify.
Write in the language requested in the brief.`;

/** Turn the Zarvis brief into a compact, explicit prompt */
export function buildUserPrompt(b) {
  const lines = [];
  const add = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== '' && !(Array.isArray(v) && !v.length)) lines.push(`${k}: ${Array.isArray(v) ? v.join('; ') : v}`); };
  lines.push('BRIEF');
  add('Language', b.language || 'English');
  add('Brand / person name', b.name);
  add('Kind of site', b.kind);
  add('Tagline', b.tagline);
  add('Roles / titles', b.roles);
  add('Location', b.location);
  add('Audience', b.audience);
  add('Tone', b.tone);
  add('Bio (facts)', b.bio);
  add('Mission', b.mission);
  add('Stats (facts)', (b.stats || []).map(s => `${s.value}${s.suffix || ''} ${s.label}`));
  add('Services given', (b.services || []).map(s => s.title + (s.text ? ` (${s.text})` : '')));
  add('Speaking topics', b.topics);
  add('Books / products', (b.books || []).map(x => x.title + (x.note ? ` (${x.note})` : '')));
  add('Awards (facts)', (b.awards || []).map(a => [a.title, a.org, a.place, a.year].filter(Boolean).join(', ')));
  add('Organisations / clients', (b.orgs || []).map(o => o.role ? `${o.name} (${o.role})` : o.name));
  add('Press outlets', b.press);
  add('Journey / timeline', (b.timeline || []).map(t => `${t.year}: ${t.title}`));
  add('How people contact or order', b.contactModes);
  lines.push('');
  lines.push(`ENABLED SECTIONS: ${(b.sections || []).join(', ')}`);
  lines.push('');
  lines.push('UNIQUE REQUEST (follow it where it does not break the honesty rules):');
  lines.push(b.unique ? String(b.unique) : '(none)');
  return lines.join('\n');
}
