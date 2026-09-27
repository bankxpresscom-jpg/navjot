/**
 * Zarvis engine: turns a project spec (+ AI or default copy) into a complete,
 * deployable static website. Pure functions, no DOM required, so the same code
 * renders the live preview and the downloadable zip.
 */
import { THEMES, fontsUrl } from './themes.js';
import { SPRITE } from './sprite.js';

export const LIBS = {
  gsap: { src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', sri: 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt' },
  st:   { src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', sri: 'sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d' },
  lenis:{ src: 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js', sri: 'sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed' }
};

/* =============================================================== helpers */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const list = v => (Array.isArray(v) ? v : String(v || '').split(/[,\n;]/)).map(x => String(x).trim()).filter(Boolean);
const lines = v => String(v || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
const icon = id => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const safeUrl = u => { const s = String(u || '').trim(); return /^(https?:|mailto:|tel:)/i.test(s) ? s : ''; };
const digits = s => String(s || '').replace(/\D/g, '');
const initials = name => list(String(name || '').replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '').split(/\s+/)).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'Z';
const slug = s => String(s || 'site').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
const titleHtml = (t, em) => `${esc(t)}${em ? ` <em>${esc(em)}</em>` : ''}`;

/* ---------- Cloudinary-aware media ---------- */
export const isCld = u => /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//.test(u || '');
const tx = (u, t) => u.replace('/upload/', `/upload/${t}/`);
const isVideoUrl = u => /\/video\/upload\/|\.(mp4|mov|webm|m4v)(\?|$)/i.test(u || '');
const W = [480, 800, 1200, 1600];
function cimg(u, w, ar, mode = 'fill') {
  if (!isCld(u)) return u;
  if (mode === 'limit' || !ar) return tx(u, `f_auto,q_auto,c_limit,w_${w}`);
  return tx(u, `f_auto,q_auto,c_fill,g_auto,ar_${ar},w_${w}`);
}
const srcset = (u, ar, mode, ws = W) => isCld(u) ? ws.map(w => `${cimg(u, w, ar, mode)} ${w}w`).join(', ') : '';
const cvideo = (u, w) => isCld(u) ? tx(u, `f_auto:video,q_auto,c_limit,w_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.mp4') : u;
const cposter = (u, w, ar) => isCld(u) ? tx(u, `so_1,f_jpg,q_auto,${ar ? `c_fill,g_auto,ar_${ar}` : 'c_limit'},w_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg') : '';
const cblur = (u, video) => !isCld(u) ? '' : video
  ? tx(u, 'so_1,f_jpg,q_30,c_limit,w_64,e_blur:600').replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg')
  : tx(u, 'f_auto,q_30,c_limit,w_64,e_blur:600');

/** <img> string. ar "4:5" → face-aware crop on Cloudinary; mode 'limit' never crops. */
function img(u, { alt = '', ar = '4:5', sizes = '50vw', eager = false, mode = 'fill', pos = '', cls = '', w = 800 } = {}) {
  if (!u) return '';
  const [aw, ah] = (ar || '4:5').split(':').map(Number);
  const ss = srcset(u, ar, mode);
  return `<img${cls ? ` class="${cls}"` : ''} src="${esc(cimg(u, w, ar, mode))}"${ss ? ` srcset="${esc(ss)}" sizes="${esc(sizes)}"` : ''} width="${w}" height="${Math.round(w * ah / aw)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}${pos ? ` style="object-position:${esc(pos)}"` : ''}>`;
}
/** Full, uncropped photo (object-fit: contain) over a soft blurred copy of itself */
function fullPhoto(u, { alt = '', sizes = '50vw', video = false } = {}) {
  const main = video
    ? (isCld(u) ? `<img src="${esc(cposter(u, 800))}" width="800" height="1000" alt="${esc(alt)}" loading="lazy" decoding="async">` : '')
    : `<img src="${esc(cimg(u, 800, null, 'limit'))}"${isCld(u) ? ` srcset="${esc(srcset(u, null, 'limit'))}" sizes="${esc(sizes)}"` : ''} width="800" height="1000" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  const bg = isCld(u) ? `<img class="bgblur" src="${esc(cblur(u, video))}" alt="" width="64" height="80" loading="lazy" decoding="async">` : (video ? '' : `<img class="bgblur css-blur" src="${esc(u)}" alt="" width="64" height="80" loading="lazy" decoding="async">`);
  return `<div class="inner">${bg}${main}</div>`;
}

/* =============================================================== copy */
const SECTION_DEFAULTS = {
  about:        { nav: 'About', eyebrow: 'About', title: 'The story behind', em: 'the name.' },
  stats:        { nav: 'Numbers', eyebrow: 'At a glance', title: 'A record in', em: 'numbers.' },
  services:     { nav: 'Services', eyebrow: 'What I do', title: 'Work with', em: 'purpose.' },
  speaking:     { nav: 'Speaking', eyebrow: 'On stage', title: 'A voice that', em: 'moves rooms.' },
  books:        { nav: 'Books', eyebrow: 'Books', title: 'Words that', em: 'stay.' },
  orgs:         { nav: 'Leadership', eyebrow: 'Leadership', title: 'Roles that', em: 'build futures.' },
  awards:       { nav: 'Honours', eyebrow: 'Recognition', title: 'Recognised on', em: 'global stages.' },
  testimonials: { nav: 'Words', eyebrow: 'Kind words', title: 'What people', em: 'say.' },
  timeline:     { nav: 'Journey', eyebrow: 'Journey', title: 'Milestones along', em: 'the way.' },
  gallery:      { nav: 'Gallery', eyebrow: 'Gallery', title: 'Life in', em: 'frames.' },
  press:        { nav: 'Media', eyebrow: 'In the media', title: 'In the', em: 'headlines.' },
  faq:          { nav: 'FAQ', eyebrow: 'Questions', title: 'Good to', em: 'know.' },
  newsletter:   { nav: 'Newsletter', eyebrow: 'Newsletter', title: 'Letters worth', em: 'opening.' },
  contact:      { nav: 'Contact', eyebrow: 'Contact', title: "Let's create something", em: 'meaningful.' }
};
export const SECTION_IDS = Object.keys(SECTION_DEFAULTS);

/** Deterministic copy straight from the user's inputs (used without AI, and as the fallback for any missing AI field) */
export function defaultCopy(spec) {
  const b = spec.brand || {};
  const name = (b.name || 'Your Name').trim();
  const words = name.split(/\s+/);
  const split = words.length > 2 ? Math.ceil(words.length / 2) : words.length === 2 ? 1 : words.length;
  const roles = list(b.roles);
  return {
    seo_title: `${name}${roles[0] ? ` | ${roles.slice(0, 2).join(' & ')}` : ''}`.slice(0, 60),
    seo_description: (b.tagline ? `${b.tagline}. ` : '') + (lines(b.bio)[0] || '').slice(0, 150),
    hero_eyebrow: roles.slice(0, 3).join(' · '),
    hero_line1: words.slice(0, split).join(' '),
    hero_line2: words.slice(split).join(' '),
    hero_roles: roles.length ? roles.slice(0, 6) : [b.tagline || ''].filter(Boolean),
    hero_intro: b.tagline ? `${b.tagline}${b.mission ? ` ${b.mission}` : ''}` : (b.mission || ''),
    cta_primary: 'Get in touch',
    cta_secondary: 'Discover more',
    marquee_words: roles.length ? roles : [name],
    about_eyebrow: 'About',
    about_title: 'The story behind',
    about_title_em: 'the name.',
    about_paragraphs: lines(b.bio),
    about_quote: b.mission || '',
    about_quote_label: b.mission ? 'Mission' : '',
    section_copy: [],
    services: [], speaking_formats: [], book_blurbs: [], faq: [], custom_sections: [],
    footer_tagline: b.tagline || '',
    custom_css: '', notes: ''
  };
}
/** AI copy wins field by field; empty AI fields fall back to defaults */
export function mergeCopy(base, ai) {
  if (!ai || typeof ai !== 'object') return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(ai)) {
    if (Array.isArray(v) ? v.length : (v !== undefined && v !== null && String(v).trim() !== '')) out[k] = v;
  }
  return out;
}
function sectionCopy(copy, id) {
  const d = SECTION_DEFAULTS[id] || {};
  const c = (copy.section_copy || []).find(s => s.id === id) || {};
  return { eyebrow: c.eyebrow || d.eyebrow, title: c.title || d.title, em: c.title_em || d.em, intro: c.intro || '', nav: d.nav };
}

/** Strip anything dangerous from AI/user-provided CSS */
export function sanitizeCss(css) {
  return String(css || '').slice(0, 8000)
    .replace(/<\/?\s*style[^>]*>/gi, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/url\s*\(\s*(['"]?)(?!data:image\/(png|svg\+xml|jpeg|webp))[^)]*\)/gi, 'none')
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript:/gi, '');
}

/* =============================================================== CSS */
function css(theme, spec) {
  const c = theme.c, t = theme.t, f = theme.fonts;
  const accentOverride = /^#[0-9a-f]{6}$/i.test(spec.design?.accent || '') ? spec.design.accent : '';
  const q = n => `'${n}'`;
  return `
:root{--bg:${c.bg};--paper:${c.paper};--sand:${c.sand};--ink:${c.ink};--ink-2:${c.ink2};--text:${c.text};--muted:${c.muted};--text-l:${c.textL};--muted-l:${c.mutedL};--accent:${accentOverride || c.accent};--accent-2:${accentOverride || c.accent2};--on-accent:${c.onAccent};
--line-d:color-mix(in srgb,var(--text) 14%,transparent);--line-l:color-mix(in srgb,var(--text-l) 16%,transparent);
--display:${q(f.display[0])},Georgia,serif;--label:${q(f.label[0])},system-ui,sans-serif;--body:${q(f.body[0])},system-ui,-apple-system,'Segoe UI',sans-serif;
--dw:${t.displayWeight};--bw:${t.bodyWeight};--ltt:${t.labelTransform};--lls:${t.labelSpacing};--lsz:${t.labelSize};--radius:${t.radius};--ts:${t.titleScale};--dls:${t.tight ? '-.035em' : '-.01em'};
--ease:cubic-bezier(.22,1,.36,1);--ease-io:cubic-bezier(.76,0,.24,1);--pad:clamp(20px,5vw,72px);--maxw:1240px;--tabbar-h:0px;--safe-b:env(safe-area-inset-bottom,0px)}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;background:var(--ink)}
html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-stopped{overflow:hidden}
body{margin:0;background:var(--bg);color:var(--text);font:var(--bw) clamp(16px,1.05vw,18px)/1.72 var(--body);overflow-x:hidden;-webkit-font-smoothing:antialiased}
body.is-locked{overflow:hidden}main{overflow-x:clip}
img,video,svg{display:block;max-width:100%}img{height:auto}
a{color:inherit;text-decoration:none}button,input,select,textarea{font:inherit;color:inherit}button{background:none;border:0;padding:0;cursor:pointer}
h1,h2,h3,h4,p,ol,ul,figure,blockquote{margin:0}ol,ul{padding:0;list-style:none}b,strong{font-weight:600}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}[tabindex="-1"]:focus{outline:none}
.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:fixed;left:12px;top:12px;z-index:400;padding:10px 18px;background:var(--accent-2);color:var(--on-accent);transform:translateY(-160%);transition:transform .3s var(--ease)}.skip:focus{transform:none}
svg.i{width:1.2em;height:1.2em;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex:none}
.label{display:inline-flex;align-items:center;gap:14px;font:500 var(--lsz)/1.2 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt);color:var(--accent)}
.label::before{content:"";width:34px;height:1px;background:currentColor;opacity:.6}
.dark .label{color:var(--accent-2)}
.h2{font:var(--dw) calc(clamp(2.3rem,4.8vw,4.3rem)*var(--ts))/1.04 var(--display);letter-spacing:var(--dls);margin:18px 0 0;text-wrap:balance}
.h2 em,.h1 em,.quote em{font-style:italic;font-weight:400;color:var(--accent)}
.dark .h2 em,.dark .quote em,.hero .h1 em{color:var(--accent-2)}
.lead{font-size:clamp(1.02rem,1.25vw,1.18rem);color:var(--muted);max-width:58ch;margin-top:22px}
.dark .lead{color:var(--muted-l)}
.section{position:relative;padding:clamp(88px,11vw,160px) var(--pad)}
.wrap{max-width:var(--maxw);margin:0 auto;position:relative}
.dark{background:var(--ink);color:var(--text-l)}.paper{background:var(--paper)}.sand{background:var(--sand)}
.cv{content-visibility:auto;contain-intrinsic-size:auto 1000px}
.center{text-align:center}.center .lead{margin-left:auto;margin-right:auto}.center .label::after{content:"";width:34px;height:1px;background:currentColor;opacity:.6}
.w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em}.wi{display:inline-block}
em.is-split .w{padding-right:.06em;margin-right:-.06em}
/* buttons */
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:54px;padding:0 30px;font:500 calc(var(--lsz)*.98)/1 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt);border-radius:999px;white-space:nowrap;overflow:hidden;isolation:isolate;transition:color .45s var(--ease),border-color .45s,background .45s}
.btn::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;transform:translateY(101%);transition:transform .55s var(--ease)}
@media (hover:hover){.btn:hover::after{transform:none}.btn:hover .i-go{transform:translateX(4px)}}
.btn .i{transition:transform .45s var(--ease)}
.btn-solid{background:var(--accent);color:#fff}.btn-solid::after{background:var(--ink)}
.dark .btn-solid,.hero .btn-solid{background:var(--accent-2);color:var(--on-accent)}.dark .btn-solid::after,.hero .btn-solid::after{background:var(--bg)}
.btn-line{border:1px solid currentColor}.btn-line::after{background:var(--ink)}
@media (hover:hover){.btn-line:hover{color:var(--bg);border-color:var(--ink)}.dark .btn-line:hover,.hero .btn-line:hover{color:var(--ink);border-color:var(--bg)}}
.dark .btn-line::after,.hero .btn-line::after{background:var(--bg)}
.btn-row{display:flex;flex-wrap:wrap;gap:12px}
.link{display:inline-flex;align-items:center;gap:8px;font:500 var(--lsz)/1 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt);border-bottom:1px solid currentColor;padding-bottom:6px;transition:color .3s,gap .3s var(--ease)}
.link:hover{color:var(--accent);gap:12px}.dark .link:hover{color:var(--accent-2)}
.chip{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--line-d);border-radius:999px;font-size:.93rem}
.dark .chip{border-color:var(--line-l)}.chip .i{color:var(--accent)}
.icon-btn{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;border:1px solid currentColor;transition:background .3s,color .3s,border-color .3s}
.icon-btn:hover{background:var(--accent);border-color:var(--accent);color:#fff}
.socials{display:flex;flex-wrap:wrap;gap:10px}
/* frames */
.frame{position:relative;overflow:hidden;background:color-mix(in srgb,var(--ink) 88%,var(--accent));aspect-ratio:var(--ar,4/5);border-radius:var(--radius)}
.frame .inner{position:absolute;inset:0}
.frame img,.frame video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.frame.fit .inner>img:not(.bgblur),.frame.fit>video{object-fit:contain}
.frame.fit .bgblur{inset:-12%;width:124%;height:124%;opacity:.9}.frame.fit .css-blur{filter:blur(22px) brightness(.8)}
.arch .frame.arch,.frame.arch{border-radius:999px 999px var(--radius) var(--radius)}
.clip-reveal{clip-path:inset(0 0 0 0)}
/* splash */
.splash{position:fixed;inset:0;z-index:300;display:grid;place-items:center;pointer-events:none;background:#000;clip-path:inset(0 0 0 0);animation:curtain .7s var(--ease-io) 1.05s forwards}
.splash-inner{display:grid;justify-items:center;gap:12px;text-align:center;width:min(92vw,700px)}
.splash .mono{width:clamp(120px,26vw,150px);height:clamp(120px,26vw,150px);object-fit:contain;opacity:.25;transform:scale(.9);animation:sIn .8s var(--ease) forwards}
.splash .mono-t{display:grid;place-items:center;font:var(--dw) clamp(3rem,10vw,4.6rem)/1 var(--display);color:var(--accent-2);border:1px solid color-mix(in srgb,var(--accent-2) 50%,transparent);border-radius:50%}
.splash-name{width:100%;font:var(--dw) clamp(1.8rem,5vw,2.8rem)/1.1 var(--display);color:var(--text-l);opacity:0;transform:translateY(10px);animation:sIn .8s var(--ease) .2s forwards}
.splash-tag{width:100%;font:500 var(--lsz)/1 var(--label);letter-spacing:.3em;text-transform:uppercase;color:var(--accent-2);opacity:0;animation:sIn .8s var(--ease) .38s forwards}
@keyframes sIn{to{opacity:1;transform:none}}@keyframes curtain{to{clip-path:inset(0 0 100% 0);visibility:hidden}}
.no-splash .splash{display:none}
/* top bar */
.progress{position:fixed;left:0;right:0;top:0;height:2px;z-index:260;pointer-events:none}.progress span{display:block;height:100%;background:var(--accent-2);transform-origin:0 50%;transform:scaleX(0)}
.topbar{position:fixed;z-index:220;left:0;right:0;top:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:calc(12px + env(safe-area-inset-top,0px)) var(--pad) 12px;color:var(--text-l);transition:transform .5s var(--ease),background .4s,box-shadow .4s}
.topbar.is-hidden{transform:translateY(-110%)}
.topbar.is-solid{background:color-mix(in srgb,var(--ink) 88%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 1px 0 var(--line-l)}
.menu-open .topbar{background:transparent;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
.burger{justify-self:start;display:inline-flex;align-items:center;gap:14px;height:48px;font:500 var(--lsz)/1 var(--label);letter-spacing:.18em;text-transform:uppercase}
.burger .bars{position:relative;width:30px;height:12px}
.burger .bars span{position:absolute;left:0;right:0;height:1.5px;background:currentColor;transition:transform .5s var(--ease),top .5s var(--ease),width .4s var(--ease)}
.burger .bars span:first-child{top:0}.burger .bars span:last-child{top:10px;width:70%}.burger:hover .bars span:last-child{width:100%}
.menu-open .burger .bars span:first-child{top:5px;transform:rotate(45deg)}.menu-open .burger .bars span:last-child{top:5px;width:100%;transform:rotate(-45deg)}
.burger .word{display:none}@media (min-width:700px){.burger .word{display:inline}}
.brand{justify-self:center;display:flex;align-items:center;gap:12px}
.brand img{width:44px;height:44px;object-fit:contain}.brand .mark{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;border:1px solid var(--accent-2);color:var(--accent-2);font:var(--dw) 1rem/1 var(--display)}
.brand b{display:none;font:var(--dw) 1.3rem/1 var(--display);letter-spacing:var(--dls)}@media (min-width:1025px){.brand b{display:inline}}
.top-cta{justify-self:end;display:inline-flex;align-items:center;gap:10px;height:44px;padding:0 20px;border:1px solid color-mix(in srgb,var(--accent-2) 60%,transparent);border-radius:999px;font:500 calc(var(--lsz)*.95)/1 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt);color:var(--accent-2);transition:background .35s,color .35s}
.top-cta:hover{background:var(--accent-2);color:var(--on-accent)}
@media (max-width:699px){.top-cta span{display:none}.top-cta{width:44px;padding:0;justify-content:center}}
/* menu */
.menu{position:fixed;inset:0;z-index:210;overflow:auto;overscroll-behavior:contain;background:var(--ink);color:var(--text-l);clip-path:inset(0 0 100% 0);visibility:hidden;transition:clip-path .9s var(--ease-io),visibility 0s linear .9s}
.menu.is-open{clip-path:inset(0 0 0 0);visibility:visible;transition:clip-path .9s var(--ease-io),visibility 0s}
.menu-wrap{min-height:100%;display:grid;gap:36px;padding:calc(92px + env(safe-area-inset-top,0px)) var(--pad) calc(30px + var(--safe-b))}
.menu-links li{overflow:hidden;border-bottom:1px solid var(--line-l)}
.menu-links a{display:flex;align-items:baseline;gap:18px;padding:clamp(6px,1.1vh,12px) 0;font:var(--dw) clamp(1.7rem,min(4.6vw,5vh),3.2rem)/1.1 var(--display);letter-spacing:var(--dls);transition:color .35s,padding .5s var(--ease)}
.menu-links a .mn{font:500 calc(var(--lsz)*.9)/1 var(--label);letter-spacing:.12em;color:var(--accent-2);min-width:2.2em}
.menu-links a:hover,.menu-links a:focus-visible{color:var(--accent-2);padding-left:14px;font-style:italic}
.menu-side{display:none}.menu-foot{display:grid;gap:16px;align-content:end;color:var(--muted-l)}
.menu-contact{display:flex;flex-wrap:wrap;gap:10px 26px}.menu-contact a{display:inline-flex;gap:10px;align-items:center}.menu-contact a:hover{color:var(--accent-2)}
@media (min-width:1025px){.menu-wrap{grid-template-columns:1.25fr .75fr;align-items:center;column-gap:6vw}
.menu-side{display:block;position:relative;aspect-ratio:4/5;max-height:70vh;overflow:hidden;border-radius:${t.arch ? '999px 999px var(--radius) var(--radius)' : 'var(--radius)'};background:var(--ink-2)}
.menu-side img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.menu-foot{grid-column:1/-1;grid-template-columns:1fr auto;align-items:center;border-top:1px solid var(--line-l);padding-top:22px}}
/* tab bar */
.tabbar{display:none}
@media (max-width:1024px){:root{--tabbar-h:70px}
.tabbar{position:fixed;z-index:215;left:10px;right:10px;bottom:calc(10px + var(--safe-b));display:grid;grid-template-columns:repeat(var(--tabs,5),1fr);height:62px;padding:5px;border-radius:20px;background:color-mix(in srgb,var(--ink) 92%,transparent);border:1px solid var(--line-l);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);box-shadow:0 16px 40px rgba(0,0,0,.35);transition:transform .5s var(--ease)}
.tabbar a{position:relative;z-index:1;display:grid;place-items:center;align-content:center;gap:4px;border-radius:15px;font:500 .66rem/1 var(--label);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-l);transition:color .3s,transform .2s var(--ease);-webkit-tap-highlight-color:transparent}
.tabbar a .i{width:21px;height:21px}.tabbar a[aria-current="true"]{color:var(--on-accent)}.tabbar a:active{transform:scale(.9)}
.tab-pill{position:absolute;z-index:0;top:5px;bottom:5px;left:5px;width:calc((100% - 10px)/var(--tabs,5));border-radius:15px;background:var(--accent-2);transform:translateX(calc(var(--ti,0)*100%));transition:transform .55s var(--ease),opacity .3s}
.tabbar.no-active .tab-pill{opacity:0}.menu-open .tabbar{transform:translateY(calc(100% + 30px))}
body{padding-bottom:calc(var(--tabbar-h) + var(--safe-b))}}
/* floating buttons */
.fab{position:fixed;z-index:205;right:18px;bottom:calc(22px + var(--tabbar-h) + var(--safe-b));width:56px;height:56px;border-radius:50%;display:grid;place-items:center;background:#25D366;color:#fff;box-shadow:0 12px 30px rgba(0,0,0,.28);transition:transform .4s var(--ease)}
.fab:hover{transform:translateY(-4px) scale(1.04)}.fab .i{width:26px;height:26px}
.to-top{position:fixed;z-index:204;right:22px;bottom:calc(92px + var(--tabbar-h) + var(--safe-b));width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:var(--text-l);border:1px solid var(--line-l);opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .4s,transform .4s var(--ease)}
.to-top.is-on{opacity:1;transform:none;pointer-events:auto}.no-fab .to-top{bottom:calc(22px + var(--tabbar-h) + var(--safe-b))}
.cursor{display:none}
@media (hover:hover) and (pointer:fine){.has-cursor .cursor{display:grid;place-items:center;position:fixed;left:0;top:0;z-index:280;width:86px;height:86px;margin:-43px 0 0 -43px;border-radius:50%;background:var(--accent-2);color:var(--on-accent);font:500 .8rem/1 var(--label);letter-spacing:.14em;text-transform:uppercase;pointer-events:none;scale:0;transition:scale .45s var(--ease)}.has-cursor .cursor.is-on{scale:1}}
.cookie{position:fixed;z-index:250;left:12px;right:12px;bottom:calc(12px + var(--tabbar-h) + var(--safe-b));max-width:520px;margin:0 auto;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:16px 18px;border-radius:14px;background:var(--ink);color:var(--text-l);box-shadow:0 20px 50px rgba(0,0,0,.35);font-size:.92rem}
.cookie[hidden]{display:none}.cookie .btn{min-height:42px;padding:0 20px}
/* hero */
.hero{position:relative;background:var(--ink);color:var(--text-l);overflow:hidden;isolation:isolate}
.hero .label{color:var(--accent-2)}
.h1{font:var(--dw) calc(clamp(3.1rem,8vw,7.6rem)*var(--ts))/.94 var(--display);letter-spacing:var(--dls);margin:18px 0 0}
.h1 .ln{display:block;overflow:hidden;padding-bottom:.1em;margin-bottom:-.06em}
.h1 .ch{display:inline-block;animation:charUp 1.1s var(--ease) both;animation-delay:calc(var(--hd,1.05s) + var(--ci,0)*var(--cs,22ms))}
@keyframes charUp{from{transform:translate3d(0,108%,0)}}
.m-cinematic{--cs:42ms}.m-subtle{--cs:0ms}.m-subtle .h1 .ch{animation-name:fadeIn}
@keyframes fadeIn{from{opacity:0}}
.roles{display:flex;align-items:center;gap:14px;margin-top:18px;font:italic 400 clamp(1.25rem,2vw,1.7rem)/1.25 var(--display);color:var(--accent-2)}
.roles::before{content:"";width:40px;height:1px;background:currentColor;opacity:.7}
.role-rot{position:relative;display:inline-grid;height:1.3em;overflow:hidden;contain:paint}
.role-rot>span{grid-area:1/1;white-space:nowrap;transform:translateY(105%);opacity:0;transition:transform .9s var(--ease),opacity .6s}
.role-rot>span.is-on{transform:none;opacity:1}.role-rot>span.is-out{transform:translateY(-105%);opacity:0}.role-rot:not(.is-running)>span:first-child{transform:none;opacity:1}
.hero-p{margin:22px 0 32px;max-width:48ch;color:var(--muted-l);font-size:clamp(1rem,1.15vw,1.12rem)}
[data-hero]{animation:rise 1.3s var(--ease) both;animation-delay:calc(var(--hd,1.05s) + var(--i,0)*90ms)}
.no-splash{--hd:.05s}
@keyframes rise{from{transform:translate3d(0,36px,0)}}
.hero-media{position:absolute;inset:0;z-index:-2;overflow:hidden}
.hero-media img,.hero-media video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 25%}
.hero-media img{transform-origin:50% 35%;animation:heroImg 2.4s var(--ease) var(--hd,1.05s) both,kb 30s ease-in-out calc(var(--hd,1.05s) + 2.4s) infinite alternate}
.hero-media video{opacity:0;transition:opacity 1.2s}.hero-media video.is-playing{opacity:1}
@keyframes heroImg{from{transform:scale(1.14)}}@keyframes kb{to{transform:scale(1.07) translate3d(-1%,-1%,0)}}
.hero-shade{position:absolute;inset:0;z-index:-1}
.hero-foot{display:none}
@media (min-width:900px){.hero-foot{position:absolute;right:var(--pad);bottom:34px;z-index:2;display:flex;align-items:center;gap:22px;color:var(--muted-l);font:500 var(--lsz)/1 var(--label);letter-spacing:.2em;text-transform:uppercase}
.hero-foot .icon-btn{width:38px;height:38px;border-color:var(--line-l)}
.hero-foot .cue{display:inline-flex;align-items:center;gap:12px}.hero-foot .cue::before{content:"";width:1px;height:34px;background:linear-gradient(var(--accent-2),transparent);transform-origin:top;animation:cue 2.4s var(--ease-io) infinite}}
@keyframes cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(1);opacity:0}}
/* hero: full-bleed */
.hero--fullbleed{min-height:100vh;min-height:100svh;display:grid;align-items:end}
.hero--fullbleed .hero-shade{background:linear-gradient(180deg,color-mix(in srgb,var(--ink) 55%,transparent) 0%,transparent 28%,transparent 45%,color-mix(in srgb,var(--ink) 88%,transparent) 82%,var(--ink) 100%)}
.hero--fullbleed .hero-inner{width:100%;max-width:1500px;margin:0 auto;padding:120px var(--pad) calc(clamp(40px,8vh,90px) + var(--tabbar-h))}
/* hero: centered */
.hero--centered{min-height:100vh;min-height:100svh;display:grid;place-items:center;text-align:center}
.hero--centered .hero-shade{background:radial-gradient(80% 70% at 50% 50%,color-mix(in srgb,var(--ink) 55%,transparent),color-mix(in srgb,var(--ink) 88%,transparent))}
.hero--centered .hero-inner{padding:120px var(--pad) calc(80px + var(--tabbar-h));max-width:1100px}
.hero--centered .roles,.hero--centered .btn-row{justify-content:center}.hero--centered .roles::before{display:none}.hero--centered .hero-p{margin-left:auto;margin-right:auto}
.hero--centered .label::before{display:none}
/* hero: split */
.hero--split{display:grid}
.hero--split .hero-media{position:relative;inset:auto;z-index:0;height:60svh;min-height:380px}
.hero--split .hero-media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,var(--ink) 99%)}
.hero--split .hero-inner{position:relative;z-index:2;padding:0 var(--pad) calc(48px + var(--tabbar-h));margin-top:-12svh}
@media (min-width:900px){.hero--split{grid-template-columns:1fr 1fr;min-height:100vh;min-height:100svh}.hero--split .hero-media{order:2;height:auto;min-height:100%}
.hero--split .hero-media::after{background:linear-gradient(90deg,var(--ink) 0%,transparent 24%)}.hero--split .hero-inner{order:1;align-self:center;margin:0;padding:120px 4vw 100px var(--pad)}
.hero--split .hero-foot{right:auto;left:var(--pad)}}
@media (max-width:599px){.hero .btn-row{flex-wrap:nowrap}.hero .btn{padding:0 18px;flex:1 1 auto;font-size:.82rem}}
/* ribbon */
.marquee{overflow:hidden}.marquee-track{display:flex;width:max-content;animation:marq var(--dur,40s) linear infinite}
.marquee:hover .marquee-track{animation-play-state:paused}.marquee.rev .marquee-track{animation-direction:reverse}
.marquee-set{display:flex;align-items:center;flex:none}
.m-item{display:inline-flex;align-items:center;gap:26px;padding-right:26px;font:500 clamp(1rem,1.6vw,1.35rem)/1 var(--label);letter-spacing:var(--lls);text-transform:uppercase;white-space:nowrap}
.m-item .star{width:11px;height:11px;fill:currentColor;stroke:none;opacity:.8}
@keyframes marq{to{transform:translate3d(-50%,0,0)}}
.ribbon{background:var(--accent-2);color:var(--on-accent);padding:16px 0}
/* about */
.about-grid{display:grid;gap:clamp(56px,7vw,110px);align-items:center}@media (min-width:900px){.about-grid{grid-template-columns:.95fr 1.05fr}}
.stack{position:relative;max-width:500px;width:100%;margin:0 auto;padding:0 12% 14% 0}
.stack .main .inner{transition:opacity 1.8s var(--ease)}.stack .main .inner.is-off{opacity:0}
.stack .second{position:absolute;right:0;bottom:0;width:46%;border:8px solid var(--bg);box-shadow:0 30px 60px -20px rgba(0,0,0,.35)}
.stack .ring{position:absolute;left:-7%;top:6%;width:30%;aspect-ratio:1;border:1px solid var(--accent);border-radius:50%;opacity:.5;animation:float 9s ease-in-out infinite alternate}
@keyframes float{to{transform:translate3d(10px,-16px,0)}}@keyframes spin{to{transform:rotate(360deg)}}
.quote{margin:34px 0;padding:6px 0 6px 28px;border-left:1px solid var(--accent);font:italic 400 clamp(1.4rem,2.2vw,1.9rem)/1.35 var(--display)}
.quote cite{display:block;margin-top:12px;font:500 var(--lsz)/1 var(--label);font-style:normal;letter-spacing:var(--lls);text-transform:var(--ltt);color:var(--accent)}
.about-text p+p{margin-top:14px}
/* stats */
.stats{padding:clamp(64px,8vw,110px) var(--pad)}
.num-grid{display:grid;grid-template-columns:repeat(2,1fr);max-width:var(--maxw);margin:0 auto}
.num{padding:22px clamp(14px,2vw,30px);border-left:1px solid var(--line-l)}.num:nth-child(odd){border-left:0}
@media (min-width:900px){.num-grid{grid-template-columns:repeat(var(--n,4),1fr)}.num:nth-child(odd){border-left:1px solid var(--line-l)}.num:first-child{border-left:0}}
.num .v{display:block;font:var(--dw) clamp(3.2rem,6.5vw,5.6rem)/.9 var(--display);color:var(--accent-2);letter-spacing:var(--dls)}
.num .l{display:block;margin-top:10px;font:italic 400 clamp(1.1rem,1.5vw,1.35rem)/1.2 var(--display)}
/* cards */
.cards{display:grid;gap:18px;margin-top:clamp(40px,5vw,70px)}@media (min-width:700px){.cards{grid-template-columns:repeat(2,1fr)}}@media (min-width:1100px){.cards{grid-template-columns:repeat(3,1fr)}}
.card{display:grid;gap:12px;align-content:start;padding:clamp(26px,3vw,40px);background:var(--paper);border:1px solid var(--line-d);border-radius:var(--radius);transition:transform .6s var(--ease),box-shadow .6s var(--ease)}
.card:hover{transform:translateY(-6px);box-shadow:0 30px 60px -30px rgba(0,0,0,.3)}
.card .k{font:500 var(--lsz)/1 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt);color:var(--accent)}
.card h3{font:var(--dw) clamp(1.45rem,2vw,1.85rem)/1.12 var(--display);letter-spacing:var(--dls)}.card p{color:var(--muted);font-size:.98rem}
.dark .card{background:var(--ink-2);border-color:var(--line-l)}.dark .card p{color:var(--muted-l)}.dark .card .k{color:var(--accent-2)}
.card .logo{position:relative;width:84px;height:84px;border-radius:50%;background:#fff;border:1px solid var(--line-d);overflow:hidden}.card .logo img{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);object-fit:contain}
/* speaking */
.split-top{display:grid;gap:clamp(40px,6vw,90px);align-items:center}@media (min-width:900px){.split-top{grid-template-columns:1.15fr .85fr}}
.topics{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
.formats{display:grid;margin-top:clamp(56px,7vw,96px);border-top:1px solid var(--line-l)}@media (min-width:900px){.formats{grid-template-columns:repeat(3,1fr)}}
.format{padding:32px 0;border-bottom:1px solid var(--line-l);display:grid;gap:12px;align-content:start}
@media (min-width:900px){.format{border-bottom:0;padding:40px 34px}.format+.format{border-left:1px solid var(--line-l)}.format:first-child{padding-left:0}}
.format .k{font:500 var(--lsz)/1 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt);color:var(--accent-2)}
.format h3{font:var(--dw) clamp(1.6rem,2.3vw,2.1rem)/1.1 var(--display)}.format p{color:var(--muted-l)}
/* books */
.books-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(20px,3vw,40px);margin-top:clamp(40px,5vw,70px);align-items:start}
@media (min-width:900px){.books-grid{grid-template-columns:repeat(var(--bn,3),1fr)}}
.book{display:grid;gap:12px;align-content:start}
.bk-cover{position:relative;aspect-ratio:2/3;border-radius:2px 7px 7px 2px;overflow:hidden;background:linear-gradient(160deg,var(--ink-2),var(--ink));box-shadow:0 30px 50px -22px rgba(0,0,0,.5);transform:perspective(1000px) rotateY(-14deg);transform-origin:40% 50%;transition:transform .8s var(--ease)}
.bk-cover img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bk-cover::before{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(90deg,rgba(0,0,0,.35) 0,rgba(255,255,255,.18) 2.5%,rgba(0,0,0,.08) 5%,transparent 9%),linear-gradient(110deg,rgba(255,255,255,.2),transparent 30%)}
.book:hover .bk-cover{transform:perspective(1000px) rotateY(0) translateY(-10px)}
.bk-cover .typo{position:absolute;inset:0;display:grid;align-content:space-between;padding:18px;color:var(--text-l);font:var(--dw) 1.3rem/1.1 var(--display)}
.book h3{font:var(--dw) clamp(1.15rem,1.6vw,1.4rem)/1.2 var(--display);margin-top:8px}.book p{font-size:.95rem;color:var(--muted)}
.bk-actions{display:flex;flex-wrap:wrap;gap:8px 18px}.bk-actions .link{font-size:calc(var(--lsz)*.85)}
.books-feature{display:grid;gap:clamp(40px,6vw,90px);align-items:center;margin-top:clamp(40px,5vw,70px)}
@media (min-width:900px){.books-feature{grid-template-columns:.8fr 1.2fr}}
.books-feature .bk-cover{width:min(300px,64vw);margin:0 auto}
/* orgs */
.org-row{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(24px,5vw,60px);margin-top:clamp(40px,5vw,70px)}
.org{display:grid;justify-items:center;gap:10px;text-align:center;max-width:220px}
.org .logo{position:relative;width:108px;height:108px;border-radius:50%;background:#fff;border:1px solid var(--line-d);overflow:hidden}.org .logo img{position:absolute;inset:10px;width:calc(100% - 20px);height:calc(100% - 20px);object-fit:contain}
.org .logo .mark{display:grid;place-items:center;height:100%;font:var(--dw) 1.8rem/1 var(--display);color:var(--accent)}
.org b{font:var(--dw) 1.2rem/1.2 var(--display)}.org span{font-size:.9rem;color:var(--muted)}
/* awards rail */
.rail-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:26px}
.rail-pin{margin-top:clamp(40px,5vw,70px)}.rail{display:grid;gap:18px}
.hcard{display:flex;flex-direction:column;gap:12px;padding:30px 28px;min-height:280px;background:var(--ink-2);border:1px solid var(--line-l);border-radius:var(--radius)}
.hcard .y{font:var(--dw) 3rem/.9 var(--display);color:var(--accent-2)}
.hcard h3{font:var(--dw) clamp(1.4rem,2vw,1.75rem)/1.15 var(--display)}.hcard .by{color:var(--muted-l);font-size:.95rem}
.hcard .at{margin-top:auto;display:inline-flex;align-items:center;gap:8px;font:500 calc(var(--lsz)*.9)/1 var(--label);letter-spacing:var(--lls);text-transform:uppercase}.hcard .at .i{color:var(--accent-2)}
.hphoto{margin:0}.hphoto .frame{--ar:4/5}
@media (min-width:640px) and (max-width:1024px){.rail{grid-template-columns:repeat(2,1fr)}}
@media (min-width:1025px){.is-pinnable .rail{display:flex;gap:20px;width:max-content;align-items:stretch;padding-right:var(--pad)}
.is-pinnable.awards{height:100vh;height:100svh;min-height:600px;display:flex;flex-direction:column;justify-content:center;padding-top:calc(70px + 2vh);padding-bottom:3vh}
.is-pinnable .h2{font-size:calc(clamp(2rem,3.3vw,3.2rem)*var(--ts))}.is-pinnable .rail-pin{margin-top:clamp(18px,3.5vh,44px)}
.is-pinnable .hcard,.is-pinnable .hphoto{width:clamp(270px,21vw,330px);height:clamp(270px,50vh,430px);min-height:0;flex:none}
.is-pinnable .hphoto .frame{height:100%;aspect-ratio:auto}
.awards:not(.is-pinnable) .rail{grid-template-columns:repeat(3,1fr)}}
/* testimonials */
.quotes{display:grid;gap:18px;margin-top:clamp(40px,5vw,70px)}@media (min-width:900px){.quotes{grid-template-columns:repeat(var(--qn,3),1fr)}}
.tq{padding:clamp(26px,3vw,38px);border:1px solid var(--line-d);border-radius:var(--radius);background:var(--paper);display:grid;gap:18px;align-content:space-between}
.tq blockquote{font:italic 400 clamp(1.2rem,1.7vw,1.45rem)/1.4 var(--display)}.tq figcaption b{display:block;font-weight:600}.tq figcaption span{font-size:.9rem;color:var(--muted)}
/* timeline */
.tl{margin-top:clamp(40px,5vw,70px);border-top:1px solid var(--line-d)}
.tl li{display:grid;grid-template-columns:90px 1fr;gap:18px;padding:22px 0;border-bottom:1px solid var(--line-d)}
.tl .y{font:var(--dw) 1.6rem/1 var(--display);color:var(--accent)}.tl b{display:block;font:var(--dw) 1.3rem/1.25 var(--display)}.tl span{color:var(--muted);font-size:.95rem}
/* gallery rows */
.rows{display:grid;gap:14px;margin-top:clamp(40px,5vw,70px)}
.rows .marquee-set{gap:14px;padding-right:14px;align-items:center}
.gi{position:relative;flex:none;margin:0;width:clamp(160px,19vw,270px)}
.gi .frame{--ar:4/5}.gi:nth-child(3n) .frame{--ar:1/1}
.open{position:absolute;inset:0;z-index:4;width:100%;height:100%}
.play{position:absolute;z-index:3;right:12px;top:12px;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.92);color:#111}.play .i{width:14px;height:14px;fill:currentColor}
.gi img{transition:transform 1s var(--ease)}.gi:hover .inner>img:not(.bgblur){transform:scale(1.05)}
/* press */
.outlets{margin-top:clamp(40px,5vw,70px);border-block:1px solid var(--line-l);padding:22px 0}
.outlets .m-item{font:italic 400 clamp(1.8rem,3vw,2.6rem)/1.1 var(--display);letter-spacing:0;text-transform:none;gap:40px;padding-right:40px}
.outlets .star{color:var(--accent-2)}
/* faq */
.faq{margin-top:clamp(40px,5vw,70px);border-top:1px solid var(--line-d);max-width:900px}
.faq details{border-bottom:1px solid var(--line-d)}
.faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:20px;align-items:center;padding:22px 0;font:var(--dw) clamp(1.2rem,1.8vw,1.5rem)/1.3 var(--display)}
.faq summary::-webkit-details-marker{display:none}.faq summary .i{transition:transform .4s var(--ease);color:var(--accent)}.faq details[open] summary .i{transform:rotate(180deg)}
.faq details p{padding:0 0 22px;color:var(--muted);max-width:70ch}
/* custom */
.custom-body p+p{margin-top:14px}.custom-body ul{margin-top:22px;display:grid;gap:10px}
.custom-body li{display:flex;gap:12px;align-items:flex-start}.custom-body li .i{color:var(--accent);margin-top:5px}
/* newsletter */
.nl{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px;max-width:560px}
.nl input{flex:1 1 240px;min-height:54px;padding:0 20px;border-radius:999px;border:1px solid var(--line-d);background:#fff;font-size:16px}
.center .nl{margin-left:auto;margin-right:auto}
/* contact */
.contact-grid{display:grid;gap:clamp(48px,6vw,90px);align-items:center}@media (min-width:900px){.contact-grid{grid-template-columns:1.2fr .8fr}}
.contact .h2{font-size:calc(clamp(2.6rem,5.6vw,5rem)*var(--ts))}
.clinks{margin-top:clamp(34px,4vw,56px);border-top:1px solid var(--line-l)}
.clinks a,.clinks button{width:100%;display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:18px;padding:18px 0;border-bottom:1px solid var(--line-l);text-align:left;transition:padding .5s var(--ease),color .3s}
.clinks a:hover,.clinks button:hover{padding-left:12px;color:var(--accent-2)}
.clinks .ic{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-l);color:var(--accent-2)}
.clinks b{display:block;font:var(--dw) clamp(1.3rem,1.8vw,1.6rem)/1.1 var(--display)}.clinks small{font-size:.9rem;color:var(--muted-l);word-break:break-word}.clinks .go{color:var(--accent-2)}
.contact .frame{max-width:460px;width:100%;margin:0 auto}
/* footer */
.footer{background:color-mix(in srgb,var(--ink) 92%,#000);color:var(--muted-l);padding:64px var(--pad) calc(40px + var(--tabbar-h))}
.foot-grid{max-width:var(--maxw);margin:0 auto;display:grid;gap:34px}@media (min-width:900px){.foot-grid{grid-template-columns:1.3fr 1fr auto;align-items:start}}
.foot-brand{display:flex;gap:16px;align-items:center}.foot-brand img{width:60px;height:60px;object-fit:contain}
.foot-brand b{display:block;font:var(--dw) 1.6rem/1.1 var(--display);color:var(--text-l)}.foot-brand em{font:italic 400 1.1rem/1.3 var(--display);color:var(--accent-2)}
.foot-links{display:grid;grid-template-columns:repeat(2,auto);gap:8px 34px;justify-content:start;font:500 var(--lsz)/1.5 var(--label);letter-spacing:var(--lls);text-transform:var(--ltt)}
.foot-links a:hover,.foot-base a:hover{color:var(--accent-2)}
.foot-base{max-width:var(--maxw);margin:40px auto 0;padding-top:22px;border-top:1px solid var(--line-l);display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;font-size:.88rem}
.share{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
/* drawer */
.scrim{position:fixed;inset:0;z-index:230;background:rgba(0,0,0,.5);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;visibility:hidden;transition:opacity .4s,visibility .4s}
.scrim.is-open{opacity:1;visibility:visible;transition:opacity .4s,visibility 0s}
.drawer{position:fixed;z-index:240;left:0;right:0;bottom:0;max-height:94vh;max-height:94dvh;overflow-y:auto;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain;background:var(--bg);color:var(--text);border-radius:22px 22px 0 0;padding:14px clamp(20px,4vw,40px) calc(26px + var(--safe-b));box-shadow:0 -30px 80px rgba(0,0,0,.35);transform:translateY(105%);visibility:hidden;transition:transform .6s var(--ease),visibility .6s}
.drawer.is-open{transform:none;visibility:visible;transition:transform .6s var(--ease),visibility 0s}
@media (min-width:900px){.drawer{left:auto;top:0;width:min(540px,100%);max-height:none;border-radius:0;transform:translateX(105%);padding-top:34px}}
.grab{width:44px;height:4px;border-radius:4px;background:var(--line-d);margin:0 auto 14px}@media (min-width:900px){.grab{display:none}}
.d-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:6px}.d-head h2{font:var(--dw) clamp(1.8rem,3vw,2.3rem)/1.1 var(--display)}
.d-sub{color:var(--muted);font-size:.95rem;margin-bottom:22px}
.mode{display:none}.mode.is-on{display:block}
.field{display:grid;gap:6px;margin-bottom:14px}.field label,.field .fl{font:500 calc(var(--lsz)*.9)/1 var(--label);letter-spacing:var(--lls);text-transform:uppercase;color:var(--muted)}
.field input,.field textarea,.field select{width:100%;min-height:50px;padding:12px 14px;border:1px solid var(--line-d);border-radius:8px;background:#fff;font-size:16px;color:#111}
.field textarea{min-height:88px;resize:vertical}.field input:focus,.field textarea:focus,.field select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 20%,transparent)}
.field [aria-invalid="true"]{border-color:#b54a4a}.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.qty{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--line-d);border-radius:999px;padding:4px;background:#fff;color:#111}.qty button{width:40px;height:40px;border-radius:50%;display:grid;place-items:center}.qty output{min-width:30px;text-align:center;font-weight:600}
.err{min-height:1.4em;margin:2px 0 10px;color:#9b3b3b;font-size:.9rem}.w100{width:100%}
.alt-mail{display:block;margin-top:14px;text-align:center;font-size:.92rem;color:var(--muted);text-decoration:underline;text-underline-offset:3px}
/* lightbox */
.lightbox{position:fixed;inset:0;z-index:245;display:grid;grid-template-rows:auto 1fr auto;background:rgba(10,10,12,.96);color:#eee;opacity:0;visibility:hidden;transition:opacity .4s,visibility .4s;touch-action:pan-y}
.lightbox.is-open{opacity:1;visibility:visible;transition:opacity .4s,visibility 0s}
.lb-top{display:flex;justify-content:space-between;align-items:center;padding:calc(14px + env(safe-area-inset-top,0px)) var(--pad) 10px;font:500 var(--lsz)/1 var(--label);letter-spacing:.16em}
.lb-stage{position:relative;display:grid;place-items:center;padding:0 clamp(8px,6vw,90px);min-height:0}
.lb-stage img,.lb-stage video{max-width:100%;max-height:calc(100svh - 170px);width:auto;height:auto}
.lb-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2;background:rgba(0,0,0,.5)}.lb-prev{left:clamp(6px,2vw,24px)}.lb-next{right:clamp(6px,2vw,24px)}
.lb-cap{padding:12px var(--pad) calc(18px + var(--safe-b));text-align:center;font:italic 400 1.15rem/1.3 var(--display);color:#bbb}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.2s!important}.splash{display:none}.marquee-track{animation:none!important;flex-wrap:wrap}}
`;
}

/* =============================================================== sections */
function sectionHead(sc, n, { center = false, split = true } = {}) {
  return `<p class="label" data-reveal><span>${String(n).padStart(2, '0')}</span> ${esc(sc.eyebrow)}</p>
    <h2 class="h2"${split ? ' data-split' : ''}>${titleHtml(sc.title, sc.em)}</h2>
    ${sc.intro ? `<p class="lead" data-reveal>${esc(sc.intro)}</p>` : ''}`;
}

function heroHtml(ctx) {
  const { spec, copy, layout } = ctx;
  const m = spec.media || {};
  const heroSrc = m.hero || (m.portraits || [])[0] || '';
  let chIndex = 0;
  const lineChars = text => [...String(text)].map(ch => ch === ' ' ? ' ' : `<span class="ch" style="--ci:${chIndex++}">${esc(ch)}</span>`).join('');
  const l1 = copy.hero_line1 || spec.brand?.name || '', l2 = copy.hero_line2 || '';
  const roles = (copy.hero_roles || []).filter(Boolean);
  const name = [l1, l2].filter(Boolean).join(' ');
  let media = '';
  if (heroSrc) {
    if (isCld(heroSrc) && layout !== 'split') {
      const mob = cimg(heroSrc, 900, '9:16'), d = [1280, 1920, 2560].map(w => `${cimg(heroSrc, w, '16:9')} ${w}w`).join(', ');
      media = `<picture><source media="(max-width: 767px)" srcset="${esc(mob)}" width="900" height="1600"><img src="${esc(cimg(heroSrc, 1600, '16:9'))}" srcset="${esc(d)}" sizes="100vw" width="1600" height="900" alt="${esc(spec.brand?.name || '')}" fetchpriority="high" decoding="async"></picture>`;
    } else {
      media = img(heroSrc, { alt: spec.brand?.name || '', ar: layout === 'split' ? '4:5' : '16:9', sizes: layout === 'split' ? '(min-width: 900px) 50vw, 100vw' : '100vw', eager: true, w: 1600 });
    }
  }
  const vid = m.heroVideo ? `<video class="hero-video" muted loop playsinline preload="none" aria-hidden="true" data-src="${esc(cvideo(m.heroVideo, 1280))}" data-src-m="${esc(cvideo(m.heroVideo, 720))}"></video>` : '';
  const socials = socialLinks(spec).slice(0, 3).map(s => `<a class="icon-btn" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.icon)}</a>`).join('');
  return `<section class="hero hero--${layout}" id="home" data-section="home" aria-labelledby="heroTitle">
  <div class="hero-media">${media}${vid}</div>
  <div class="hero-shade" aria-hidden="true"></div>
  <div class="hero-inner">
    ${copy.hero_eyebrow ? `<p class="label" data-hero style="--i:0">${esc(copy.hero_eyebrow)}</p>` : ''}
    <h1 class="h1" id="heroTitle"><span class="sr-only">${esc(name)}</span><span class="ln" aria-hidden="true">${lineChars(l1)}</span>${l2 ? `<span class="ln" aria-hidden="true"><em>${lineChars(l2)}</em></span>` : ''}</h1>
    ${roles.length ? `<p class="roles" data-hero style="--i:3"><span class="sr-only">${esc(roles.join(', '))}</span><span class="role-rot" id="roleRot" aria-hidden="true">${roles.map(r => `<span>${esc(r)}</span>`).join('')}</span></p>` : ''}
    ${copy.hero_intro ? `<p class="hero-p" data-hero style="--i:4">${esc(copy.hero_intro)}</p>` : ''}
    <div class="btn-row" data-hero style="--i:5">
      <a class="btn btn-solid" href="#contact">${esc(copy.cta_primary || 'Get in touch')}${icon('arrow-r').replace('class="i"', 'class="i i-go"')}</a>
      ${ctx.firstSection ? `<a class="btn btn-line" href="#${ctx.firstSection}">${esc(copy.cta_secondary || 'Discover more')}</a>` : ''}
    </div>
  </div>
  <div class="hero-foot"><div class="socials">${socials}</div><a class="cue" href="#${ctx.firstSection || 'contact'}">Scroll</a></div>
</section>`;
}

function ribbonHtml(copy) {
  const words = (copy.marquee_words || []).filter(Boolean);
  if (!words.length) return '';
  return `<div class="ribbon marquee" style="--dur:30s" aria-hidden="true"><div class="marquee-track"><div class="marquee-set">${words.map(w => `<span class="m-item">${esc(w)}${icon('star').replace('class="i"', 'class="i star"')}</span>`).join('')}</div></div></div>`;
}

function aboutHtml(ctx, n) {
  const { spec, copy } = ctx;
  const p = (spec.media?.portraits || []).filter(Boolean);
  const main = p[1] || p[0] || spec.media?.hero, alt = p[2], second = p[3] || p[0];
  const arch = ctx.theme.t.arch ? ' arch' : '';
  const paras = (copy.about_paragraphs || []).filter(Boolean);
  const vcard = spec.features?.vcard ? `<button class="btn btn-line" type="button" data-vcard>${icon('contact')}Save contact</button>` : '';
  const insta = socialLinks(spec).find(s => s.icon === 'instagram');
  return `<section class="section" id="about" data-section="about" aria-labelledby="about-h">
  <div class="wrap about-grid">
    ${main ? `<div class="stack"><span class="ring" aria-hidden="true"></span>
      <div class="frame main clip-reveal${arch}"${alt ? ` data-crossfade` : ''}><div class="inner">${img(main, { alt: spec.brand?.name, ar: '4:5', sizes: '(min-width: 900px) 34vw, 80vw', pos: '50% 20%' })}</div>${alt ? `<div class="inner is-off">${img(alt, { alt: spec.brand?.name, ar: '4:5', sizes: '(min-width: 900px) 34vw, 80vw', pos: '50% 20%' })}</div>` : ''}</div>
      ${second && second !== main ? `<div class="frame second clip-reveal" style="--ar:3/4"><div class="inner">${img(second, { alt: spec.brand?.name, ar: '3:4', sizes: '(min-width: 900px) 16vw, 40vw', pos: '50% 20%' })}</div></div>` : ''}
    </div>` : ''}
    <div class="about-text">
      <p class="label" data-reveal><span>${String(n).padStart(2, '0')}</span> ${esc(copy.about_eyebrow || 'About')}</p>
      <h2 class="h2" id="about-h" data-split>${titleHtml(copy.about_title, copy.about_title_em)}</h2>
      ${paras.map((t, i) => `<p class="${i === 0 ? 'lead' : ''}" data-reveal${i ? ' style="margin-top:14px"' : ''}>${esc(t)}</p>`).join('')}
      ${copy.about_quote ? `<blockquote class="quote" data-reveal>${esc(copy.about_quote)}${copy.about_quote_label ? `<cite>${esc(copy.about_quote_label)}</cite>` : ''}</blockquote>` : ''}
      ${vcard || insta ? `<div class="btn-row" data-reveal style="margin-top:26px;align-items:center">${vcard}${insta ? `<a class="link" href="${esc(insta.url)}" target="_blank" rel="noopener">Follow ${icon('arrow-ur')}</a>` : ''}</div>` : ''}
    </div>
  </div>
</section>`;
}

function statsHtml(ctx) {
  const stats = (ctx.spec.data?.stats || []).filter(s => s.label && String(s.value).trim() !== '');
  if (!stats.length) return '';
  return `<section class="stats dark" id="stats" data-section="stats" aria-label="At a glance">
  <div class="num-grid" style="--n:${Math.min(stats.length, 4)}">${stats.slice(0, 8).map(s => {
    const num = parseFloat(String(s.value).replace(/[^\d.]/g, ''));
    const isNum = /^\s*[\d.,]+\s*$/.test(String(s.value)) && Number.isFinite(num);
    return `<div class="num" data-reveal><span class="v">${isNum ? `<span data-count="${num}">${esc(s.value)}</span>` : esc(s.value)}${esc(s.suffix || '')}</span><span class="l">${esc(s.label)}</span></div>`;
  }).join('')}</div>
</section>`;
}

function servicesHtml(ctx, n) {
  const sc = sectionCopy(ctx.copy, 'services');
  const given = (ctx.spec.data?.services || []).filter(s => s.title);
  const items = given.length ? given.map(g => ({ title: g.title, text: g.text || (ctx.copy.services || []).find(x => x.title === g.title)?.text || '' })) : (ctx.copy.services || []);
  if (!items.length) return '';
  return `<section class="section paper cv" id="services" data-section="services" aria-labelledby="services-h">
  <div class="wrap">${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="services-h"')}
    <div class="cards">${items.map((s, i) => `<article class="card" data-reveal><span class="k">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s.title)}</h3>${s.text ? `<p>${esc(s.text)}</p>` : ''}</article>`).join('')}</div>
  </div></section>`;
}

function speakingHtml(ctx, n) {
  const { spec, copy } = ctx;
  const sc = sectionCopy(copy, 'speaking');
  const topics = list(spec.data?.topics);
  const formats = (copy.speaking_formats || []).filter(f => f.title).slice(0, 3);
  const photo = (spec.media?.portraits || [])[0] || spec.media?.hero;
  const video = (spec.media?.videos || [])[0];
  return `<section class="section dark" id="speaking" data-section="speaking" aria-labelledby="speaking-h">
  <div class="wrap">
    <div class="split-top"><div>${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="speaking-h"')}
      ${topics.length ? `<div class="topics" data-reveal>${topics.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="btn-row" data-reveal style="margin-top:30px"><button class="btn btn-solid" type="button" data-open="inquiry" data-topic="Speaking invitation">${icon('mic')}Invite to speak</button></div></div>
      ${photo ? `<div class="frame clip-reveal${ctx.theme.t.arch ? ' arch' : ''}" data-reel style="--ar:4/5"><div class="inner">${img(photo, { alt: spec.brand?.name, ar: '4:5', sizes: '(min-width: 900px) 36vw, 90vw', pos: '50% 20%' })}</div>${video ? `<video muted loop playsinline preload="none" aria-hidden="true" data-src="${esc(cvideo(video, 1080))}"></video>` : ''}</div>` : ''}
    </div>
    ${formats.length ? `<div class="formats">${formats.map((f, i) => `<article class="format" data-reveal><span class="k">${String(i + 1).padStart(2, '0')}</span><h3>${esc(f.title)}</h3><p>${esc(f.text)}</p></article>`).join('')}</div>` : ''}
  </div></section>`;
}

function bookCard(b, ctx, big = false) {
  const blurb = b.note || (ctx.copy.book_blurbs || []).find(x => x.title === b.title)?.blurb || '';
  const cover = b.cover ? img(b.cover, { alt: `Cover of ${b.title}`, ar: '2:3', mode: 'limit', sizes: big ? '300px' : '(min-width: 900px) 24vw, 45vw' }) : `<div class="typo"><small>${esc(ctx.spec.brand?.name || '')}</small><span>${esc(b.title)}</span></div>`;
  const buy = safeUrl(b.buyUrl) ? `<a class="link" href="${esc(b.buyUrl)}" target="_blank" rel="noopener">${esc(b.buyLabel || 'Buy online')} ${icon('arrow-ur')}</a>` : '';
  const wa = ctx.canOrder ? `<button class="link" type="button" data-open="order" data-item="${esc(b.title)}">${ctx.orderLabel} ${icon('arrow-r')}</button>` : '';
  return { cover: `<div class="bk-cover">${cover}</div>`, info: `<h3>${esc(b.title)}</h3>${blurb ? `<p>${esc(blurb)}</p>` : ''}<div class="bk-actions">${buy}${wa}</div>`, blurb, buy, wa };
}
function booksHtml(ctx, n) {
  const books = (ctx.spec.data?.books || []).filter(b => b.title);
  if (!books.length) return '';
  const sc = sectionCopy(ctx.copy, 'books');
  const [first, ...rest] = books;
  const f = bookCard(first, ctx, true);
  return `<section class="section paper" id="books" data-section="books" aria-labelledby="books-h">
  <div class="wrap">${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="books-h"')}
    <div class="books-feature"><div data-reveal>${f.cover}</div><div data-reveal><p class="label">Featured</p><h3 class="h2" style="font-size:calc(clamp(2rem,3.6vw,3.2rem)*var(--ts))">${esc(first.title)}</h3>${f.blurb ? `<p class="lead">${esc(f.blurb)}</p>` : ''}
      <div class="btn-row" style="margin-top:28px">${ctx.canOrder ? `<button class="btn btn-solid" type="button" data-open="order" data-item="${esc(first.title)}">${icon('whatsapp')}${ctx.orderLabel}</button>` : ''}${safeUrl(first.buyUrl) ? `<a class="btn btn-line" href="${esc(first.buyUrl)}" target="_blank" rel="noopener">${esc(first.buyLabel || 'Buy online')}${icon('arrow-ur')}</a>` : ''}</div></div></div>
    ${rest.length ? `<div class="books-grid" style="--bn:${Math.min(rest.length, 4)}">${rest.map(b => { const c = bookCard(b, ctx); return `<article class="book" data-reveal>${c.cover}${c.info}</article>`; }).join('')}</div>` : ''}
  </div></section>`;
}

function orgsHtml(ctx, n) {
  const orgs = (ctx.spec.data?.orgs || []).filter(o => o.name);
  if (!orgs.length) return '';
  const sc = sectionCopy(ctx.copy, 'orgs');
  return `<section class="section sand cv" id="orgs" data-section="orgs" aria-labelledby="orgs-h">
  <div class="wrap center">${sectionHead(sc, n, { center: true }).replace('<h2 class="h2"', '<h2 class="h2" id="orgs-h"')}
    <div class="org-row">${orgs.map(o => { const inner = `<span class="logo">${o.logo ? img(o.logo, { alt: `${o.name} logo`, ar: '1:1', mode: 'limit', sizes: '108px', w: 240 }) : `<span class="mark">${esc(initials(o.name))}</span>`}</span><b>${esc(o.name)}</b>${o.role ? `<span>${esc(o.role)}</span>` : ''}`; return safeUrl(o.url) ? `<a class="org" href="${esc(o.url)}" target="_blank" rel="noopener" data-reveal>${inner}</a>` : `<div class="org" data-reveal>${inner}</div>`; }).join('')}</div>
  </div></section>`;
}

function awardsHtml(ctx, n) {
  const awards = (ctx.spec.data?.awards || []).filter(a => a.title);
  if (!awards.length) return '';
  const sc = sectionCopy(ctx.copy, 'awards');
  const items = [];
  awards.forEach(a => {
    items.push(`<article class="hcard" data-reveal>${a.year ? `<span class="y">${esc(a.year)}</span>` : ''}<h3>${esc(a.title)}</h3>${a.org ? `<p class="by">${esc(a.org)}</p>` : ''}${a.place ? `<span class="at">${icon('pin')}${esc(a.place)}</span>` : ''}</article>`);
    if (a.image) items.push(`<figure class="hphoto" data-reveal><div class="frame fit clip-reveal">${fullPhoto(a.image, { alt: a.title, sizes: '(min-width: 1025px) 330px, 90vw' })}</div></figure>`);
  });
  return `<section class="section dark awards" id="awards" data-section="awards" aria-labelledby="awards-h">
  <div class="wrap rail-head"><div>${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="awards-h"')}</div></div>
  <div class="rail-pin"><div class="rail">${items.join('')}</div></div>
</section>`;
}

function testimonialsHtml(ctx, n) {
  const t = (ctx.spec.data?.testimonials || []).filter(x => x.quote);
  if (!t.length) return '';
  const sc = sectionCopy(ctx.copy, 'testimonials');
  return `<section class="section cv" id="testimonials" data-section="testimonials" aria-labelledby="testimonials-h">
  <div class="wrap">${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="testimonials-h"')}
    <div class="quotes" style="--qn:${Math.min(t.length, 3)}">${t.map(x => `<figure class="tq" data-reveal><blockquote>“${esc(x.quote)}”</blockquote><figcaption><b>${esc(x.name || '')}</b>${x.role ? `<span>${esc(x.role)}</span>` : ''}</figcaption></figure>`).join('')}</div>
  </div></section>`;
}

function timelineHtml(ctx, n) {
  const t = (ctx.spec.data?.timeline || []).filter(x => x.title);
  if (!t.length) return '';
  const sc = sectionCopy(ctx.copy, 'timeline');
  return `<section class="section paper cv" id="timeline" data-section="timeline" aria-labelledby="timeline-h">
  <div class="wrap">${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="timeline-h"')}
    <ol class="tl">${t.map(x => `<li data-reveal><span class="y">${esc(x.year || '')}</span><div><b>${esc(x.title)}</b>${x.text ? `<span>${esc(x.text)}</span>` : ''}</div></li>`).join('')}</ol>
  </div></section>`;
}

function galleryHtml(ctx, n) {
  const m = ctx.spec.media || {};
  const items = [...(m.gallery || []).filter(Boolean).map(u => ({ type: 'image', src: u })), ...(m.videos || []).filter(Boolean).map(u => ({ type: 'video', src: u }))];
  if (!items.length) return '';
  const sc = sectionCopy(ctx.copy, 'gallery');
  // interleave videos into the image flow, then split into two moving rows
  const imgs = items.filter(i => i.type === 'image'), vids = items.filter(i => i.type === 'video');
  const mixed = [];
  imgs.forEach((x, i) => { mixed.push(x); if (vids.length && i % 3 === 2) mixed.push(vids.shift()); });
  mixed.push(...vids);
  const rowA = mixed.filter((_, i) => i % 2 === 0), rowB = mixed.filter((_, i) => i % 2 === 1);
  const tile = it => {
    const i = ctx.lightbox.push({ type: it.type, src: it.type === 'video' ? cvideo(it.src, 1280) : cimg(it.src, 1600, null, 'limit'), poster: it.type === 'video' ? cposter(it.src, 1080) : '', alt: ctx.spec.brand?.name || '' }) - 1;
    return `<figure class="gi"><div class="frame fit">${fullPhoto(it.src, { alt: ctx.spec.brand?.name || '', sizes: '(min-width: 900px) 19vw, 45vw', video: it.type === 'video' })}</div>${it.type === 'video' ? `<span class="play" aria-hidden="true">${icon('play')}</span>` : ''}<button class="open" type="button" data-lb="${i}" aria-label="Open ${it.type === 'video' ? 'video' : 'photo'} ${i + 1}" data-cursor="${it.type === 'video' ? 'Play' : 'View'}"></button></figure>`;
  };
  const row = (arr, rev, dur) => arr.length ? `<div class="marquee${rev ? ' rev' : ''}" style="--dur:${dur}s" data-row><div class="marquee-track"><div class="marquee-set">${arr.map(tile).join('')}</div></div></div>` : '';
  return `<section class="section cv" id="gallery" data-section="gallery" aria-labelledby="gallery-h" style="overflow:hidden">
  <div class="wrap center">${sectionHead(sc, n, { center: true }).replace('<h2 class="h2"', '<h2 class="h2" id="gallery-h"')}</div>
  <div class="rows">${row(rowA, false, Math.max(24, rowA.length * 7))}${row(rowB, true, Math.max(26, rowB.length * 8))}</div>
</section>`;
}

function pressHtml(ctx, n) {
  const outlets = list(ctx.spec.data?.press);
  if (!outlets.length) return '';
  const sc = sectionCopy(ctx.copy, 'press');
  return `<section class="section dark cv" id="press" data-section="press" aria-labelledby="press-h">
  <div class="wrap">${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="press-h"')}</div>
  <div class="outlets marquee" style="--dur:26s"><div class="marquee-track"><div class="marquee-set">${outlets.map(o => `<span class="m-item">${esc(o)}${icon('star').replace('class="i"', 'class="i star"')}</span>`).join('')}</div></div></div>
</section>`;
}

function faqHtml(ctx, n) {
  const given = (ctx.spec.data?.faqs || []).filter(f => f.q && f.a);
  const items = given.length ? given : (ctx.copy.faq || []).filter(f => f.q && f.a);
  if (!items.length) return '';
  const sc = sectionCopy(ctx.copy, 'faq');
  return `<section class="section paper cv" id="faq" data-section="faq" aria-labelledby="faq-h">
  <div class="wrap">${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="faq-h"')}
    <div class="faq">${items.map(f => `<details data-reveal><summary>${esc(f.q)}${icon('chev-d')}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
  </div></section>`;
}

function customHtml(ctx, startN) {
  const all = [...(ctx.spec.data?.customSections || []).filter(c => c.title).map(c => ({ eyebrow: c.eyebrow, title: c.title, title_em: c.em, paragraphs: lines(c.body), bullets: list(c.bullets) })), ...(ctx.copy.custom_sections || [])];
  return all.filter(c => c.title).map((c, i) => {
    const id = `more-${i + 1}`;
    return `<section class="section ${i % 2 ? 'paper' : 'sand'} cv" id="${id}" data-section="${id}" aria-labelledby="${id}-h">
  <div class="wrap" style="max-width:900px">
    <p class="label" data-reveal><span>${String(startN + i).padStart(2, '0')}</span> ${esc(c.eyebrow || '')}</p>
    <h2 class="h2" id="${id}-h" data-split>${titleHtml(c.title, c.title_em)}</h2>
    <div class="custom-body" style="margin-top:24px">${(c.paragraphs || []).map((p, j) => `<p class="${j === 0 ? 'lead' : ''}" data-reveal>${esc(p)}</p>`).join('')}
    ${(c.bullets || []).length ? `<ul>${c.bullets.map(b => `<li data-reveal>${icon('check')}<span>${esc(b)}</span></li>`).join('')}</ul>` : ''}</div>
  </div></section>`;
  });
}

function newsletterHtml(ctx, n) {
  const url = safeUrl(ctx.spec.data?.newsletterUrl);
  const sc = sectionCopy(ctx.copy, 'newsletter');
  const form = url ? `<form class="nl" action="${esc(url)}" method="post" target="_blank" data-reveal><label class="sr-only" for="nl-email">Email</label><input id="nl-email" type="email" name="EMAIL" required placeholder="Your email" autocomplete="email"><button class="btn btn-solid" type="submit">Subscribe</button></form>`
    : ctx.spec.contact?.email ? `<div class="btn-row" data-reveal style="margin-top:30px;justify-content:center"><a class="btn btn-solid" href="mailto:${esc(ctx.spec.contact.email)}?subject=${encodeURIComponent('Please add me to the newsletter')}">Join by email</a></div>` : '';
  if (!form) return '';
  return `<section class="section sand cv" id="newsletter" data-section="newsletter" aria-labelledby="newsletter-h">
  <div class="wrap center" style="max-width:820px">${sectionHead(sc, n, { center: true }).replace('<h2 class="h2"', '<h2 class="h2" id="newsletter-h"')}${form}</div></section>`;
}

function contactHtml(ctx, n) {
  const { spec } = ctx;
  const c = spec.contact || {};
  const sc = sectionCopy(ctx.copy, 'contact');
  const wa = digits(c.whatsapp);
  const rows = [];
  if (ctx.canInquire) rows.push(`<button type="button" data-open="inquiry" data-reveal><span class="ic">${icon('send')}</span><span><b>Send an enquiry</b><small>Opens ${wa ? 'WhatsApp' : 'email'} with your message ready</small></span>${icon('arrow-r')}</button>`);
  if (safeUrl(c.bookingUrl)) rows.push(`<a href="${esc(c.bookingUrl)}" target="_blank" rel="noopener" data-reveal><span class="ic">${icon('calendar')}</span><span><b>Book a call</b><small>Pick a time that suits you</small></span>${icon('arrow-ur')}</a>`);
  if (wa) rows.push(`<a href="https://wa.me/${wa}" target="_blank" rel="noopener" data-reveal><span class="ic">${icon('whatsapp')}</span><span><b>WhatsApp</b><small>Quick messages</small></span>${icon('arrow-ur')}</a>`);
  if (c.phone) rows.push(`<a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}" data-reveal><span class="ic">${icon('phone')}</span><span><b>Call</b><small>${esc(c.phone)}</small></span>${icon('arrow-ur')}</a>`);
  if (c.email) rows.push(`<a href="mailto:${esc(c.email)}" data-reveal><span class="ic">${icon('mail')}</span><span><b>Email</b><small>${esc(c.email)}</small></span>${icon('arrow-ur')}</a>`);
  if (safeUrl(c.mapUrl)) rows.push(`<a href="${esc(c.mapUrl)}" target="_blank" rel="noopener" data-reveal><span class="ic">${icon('pin')}</span><span><b>Visit</b><small>${esc(c.address || 'Open in maps')}</small></span>${icon('arrow-ur')}</a>`);
  else if (c.address) rows.push(`<div class="clinks-static" data-reveal style="display:grid;grid-template-columns:48px 1fr;gap:18px;align-items:center;padding:18px 0;border-bottom:1px solid var(--line-l)"><span class="ic" style="width:48px;height:48px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line-l);color:var(--accent-2)">${icon('pin')}</span><span><b style="display:block;font:var(--dw) 1.4rem/1.1 var(--display)">Visit</b><small style="color:var(--muted-l)">${esc(c.address)}</small></span></div>`);
  socialLinks(spec).forEach(s => rows.push(`<a href="${esc(s.url)}" target="_blank" rel="noopener" data-reveal><span class="ic">${icon(s.icon)}</span><span><b>${esc(s.label)}</b><small>${esc(s.handle)}</small></span>${icon('arrow-ur')}</a>`));
  const photo = (spec.media?.portraits || [])[3] || (spec.media?.portraits || [])[0];
  return `<section class="section dark contact" id="contact" data-section="contact" aria-labelledby="contact-h">
  <div class="wrap contact-grid"><div>${sectionHead(sc, n).replace('<h2 class="h2"', '<h2 class="h2" id="contact-h"')}<div class="clinks">${rows.join('')}</div></div>
    ${photo ? `<div class="frame clip-reveal${ctx.theme.t.arch ? ' arch' : ''}" style="--ar:4/5"><div class="inner">${img(photo, { alt: spec.brand?.name, ar: '4:5', sizes: '(min-width: 900px) 34vw, 90vw', pos: '50% 20%' })}</div></div>` : ''}
  </div></section>`;
}

const SOCIAL_META = {
  instagram: ['Instagram', 'instagram'], linkedin: ['LinkedIn', 'linkedin'], x: ['X', 'x-social'], facebook: ['Facebook', 'facebook'],
  youtube: ['YouTube', 'youtube'], tiktok: ['TikTok', 'tiktok'], threads: ['Threads', 'threads'], website: ['Website', 'globe']
};
export function socialLinks(spec) {
  return Object.entries(SOCIAL_META).map(([k, [label, ic]]) => {
    const url = safeUrl(spec.social?.[k]);
    if (!url) return null;
    let handle = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    const m = handle.match(/^[^/]+\/(?:in\/|@)?([^/?#]+)/);
    if (m && k !== 'website') handle = '@' + m[1].replace(/^@/, '');
    return { key: k, label, icon: ic, url, handle };
  }).filter(Boolean);
}

/* =============================================================== page */
const NAV_ICONS = { home: 'home', about: 'user', services: 'briefcase', speaking: 'mic', books: 'book-open', orgs: 'landmark', awards: 'award', testimonials: 'quote', timeline: 'calendar', gallery: 'image', press: 'news', faq: 'chat', newsletter: 'mail', contact: 'send' };

function boot() {
  return "(function(h){h.className=h.className.replace('no-js','js');try{if(sessionStorage.getItem('z-splash')||matchMedia('(prefers-reduced-motion: reduce)').matches)h.classList.add('no-splash')}catch(e){h.classList.add('no-splash')}var l=document.getElementById('gf');if(l){var f=function(){l.media='all'};if(l.sheet)f();else l.addEventListener('load',f)}})(document.documentElement);";
}

async function sha256b64(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  let bin = ''; new Uint8Array(buf).forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin);
}

/**
 * Render a full site.
 * @returns {Promise<{files: Record<string,string>, previewHtml: string, meta: object}>}
 */
export async function renderSite({ spec, copy: aiCopy, runtimeJs, forPreview = false }) {
  const theme = THEMES[spec.design?.theme] || THEMES.luxe;
  const layout = ['fullbleed', 'split', 'centered'].includes(spec.design?.heroLayout) ? spec.design.heroLayout : 'fullbleed';
  const motion = ['subtle', 'standard', 'cinematic'].includes(spec.design?.motion) ? spec.design.motion : 'standard';
  const copy = mergeCopy(defaultCopy(spec), aiCopy);
  const feats = spec.features || {};
  const b = spec.brand || {};
  const c = spec.contact || {};
  const m = spec.media || {};
  const name = (b.name || 'Your Name').trim();
  const siteUrl = (spec.seo?.domain || '').replace(/\/+$/, '') || 'https://example.com';
  const wa = digits(c.whatsapp);
  const ctx = {
    spec, copy, theme, layout, lightbox: [],
    canOrder: !!(wa || c.email), orderLabel: wa ? 'Order on WhatsApp' : 'Order by email',
    canInquire: !!(wa || c.email)
  };
  const on = id => spec.sections?.[id] !== false && (spec.sections?.[id] || ['about', 'contact'].includes(id));

  // ---- sections in narrative order
  const order = ['about', 'stats', 'services', 'speaking', 'books', 'orgs', 'awards', 'testimonials', 'timeline', 'gallery', 'press', 'faq'];
  const builders = { about: aboutHtml, stats: statsHtml, services: servicesHtml, speaking: speakingHtml, books: booksHtml, orgs: orgsHtml, awards: awardsHtml, testimonials: testimonialsHtml, timeline: timelineHtml, gallery: galleryHtml, press: pressHtml, faq: faqHtml };
  const blocks = []; const nav = [{ id: 'home', label: 'Home' }];
  let n = 1;
  for (const id of order) {
    if (!on(id)) continue;
    const html = builders[id](ctx, n);
    if (!html) continue;
    blocks.push(html);
    if (id !== 'stats') { nav.push({ id, label: SECTION_DEFAULTS[id].nav }); n++; }
  }
  customHtml(ctx, n).forEach((h, i) => { blocks.push(h); const cs = [...(spec.data?.customSections || []).filter(x => x.title), ...(copy.custom_sections || [])][i]; nav.push({ id: `more-${i + 1}`, label: (cs.eyebrow || cs.title || 'More').slice(0, 22) }); n++; });
  if (on('newsletter')) { const h = newsletterHtml(ctx, n); if (h) { blocks.push(h); nav.push({ id: 'newsletter', label: 'Newsletter' }); n++; } }
  blocks.push(contactHtml(ctx, n)); nav.push({ id: 'contact', label: 'Contact' });
  ctx.firstSection = nav[1]?.id;

  // tab bar: home + up to 3 highlights + contact
  const pref = ['speaking', 'books', 'services', 'awards', 'gallery', 'about', 'orgs', 'testimonials'];
  const tabIds = ['home', ...pref.filter(p => nav.some(x => x.id === p)).slice(0, 3), 'contact'];
  const tabs = tabIds.map(id => nav.find(x => x.id === id)).filter(Boolean);

  // ---- head assets
  const logo = m.logo || '';
  const favicons = logo && isCld(logo)
    ? `<link rel="icon" type="image/png" sizes="32x32" href="${esc(tx(logo, 'c_pad,b_black,w_28,h_28/c_pad,b_black,w_32,h_32,f_png'))}">\n<link rel="icon" type="image/png" sizes="192x192" href="${esc(tx(logo, 'c_pad,b_black,w_164,h_164/c_pad,b_black,w_192,h_192,f_png'))}">\n<link rel="apple-touch-icon" href="${esc(tx(logo, 'c_pad,b_black,w_140,h_140/c_pad,b_black,w_180,h_180,f_png'))}">`
    : logo ? `<link rel="icon" href="${esc(logo)}">\n<link rel="apple-touch-icon" href="${esc(logo)}">`
    : `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`;
  const heroSrc = m.hero || (m.portraits || [])[0] || '';
  const ogSrc = m.ogImage || heroSrc;
  const og = ogSrc && isCld(ogSrc) && !m.ogImage
    ? tx(ogSrc, `c_fill,w_1200,h_630,g_face,f_jpg,q_auto/e_gradient_fade,y_-0.6,b_rgb:${theme.c.ink.slice(1)}/co_rgb:FFFFFF,l_text:Georgia_60:${encodeURIComponent(name).replace(/%2C/g, '%252C')}/fl_layer_apply,g_south,y_90`)
    : (ogSrc && isCld(ogSrc) ? tx(ogSrc, 'c_fill,w_1200,h_630,g_auto,f_jpg,q_auto') : ogSrc);
  const heroPreload = heroSrc && isCld(heroSrc) && layout !== 'split'
    ? `<link rel="preload" as="image" fetchpriority="high" media="(max-width: 767px)" href="${esc(cimg(heroSrc, 900, '9:16'))}">\n<link rel="preload" as="image" fetchpriority="high" media="(min-width: 768px)" imagesrcset="${esc([1280, 1920, 2560].map(w => `${cimg(heroSrc, w, '16:9')} ${w}w`).join(', '))}" imagesizes="100vw">`
    : heroSrc ? `<link rel="preload" as="image" fetchpriority="high" href="${esc(isCld(heroSrc) ? cimg(heroSrc, 1200, '4:5') : heroSrc)}">` : '';
  const title = (spec.seo?.title || copy.seo_title || name).slice(0, 70);
  const desc = (spec.seo?.description || copy.seo_description || b.tagline || '').slice(0, 170);
  const socials = socialLinks(spec);
  const jsonld = {
    '@context': 'https://schema.org', '@graph': [
      b.kind === 'business'
        ? { '@type': 'Organization', '@id': `${siteUrl}/#org`, name, url: `${siteUrl}/`, logo: logo || undefined, description: desc, email: c.email || undefined, telephone: c.phone || undefined, sameAs: socials.map(s => s.url), address: c.address ? { '@type': 'PostalAddress', streetAddress: c.address } : undefined }
        : { '@type': 'Person', '@id': `${siteUrl}/#person`, name, url: `${siteUrl}/`, image: heroSrc || undefined, jobTitle: list(b.roles).slice(0, 4), description: desc, email: c.email ? `mailto:${c.email}` : undefined, telephone: c.phone || undefined, sameAs: socials.map(s => s.url), award: (spec.data?.awards || []).filter(a => a.title).map(a => [a.title, a.org, a.year].filter(Boolean).join(', ')) },
      ...(spec.sections?.books ? (spec.data?.books || []).filter(x => x.title).map(x => ({ '@type': 'Book', name: x.title, author: { '@id': `${siteUrl}/#person` }, image: x.cover || undefined, url: safeUrl(x.buyUrl) || undefined })) : []),
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name, url: `${siteUrl}/`, inLanguage: b.language || 'en' }
    ]
  };
  const bootJs = boot();
  const gfUrl = fontsUrl(theme);

  // ---- site data consumed by the runtime
  const siteData = {
    name, siteUrl, whatsapp: wa, email: c.email || '', phone: c.phone || '',
    motion, features: {
      splash: feats.splash !== false, smooth: feats.smoothScroll !== false, cursor: !!feats.cursor, pinned: feats.pinnedRail !== false,
      cookie: !!feats.cookie, ga4: /^G-[A-Z0-9]+$/.test(feats.ga4 || '') ? feats.ga4 : '', plausible: (feats.plausible || '').trim(),
      chat: ['tawk', 'crisp'].includes(feats.chatProvider) && (feats.chatId || '').trim() ? { provider: feats.chatProvider, id: feats.chatId.trim() } : null
    },
    items: (spec.data?.books || []).filter(x => x.title).map(x => x.title),
    lightbox: ctx.lightbox,
    vcard: { name, org: b.kind === 'business' ? name : (spec.data?.orgs?.[0]?.name || ''), title: list(b.roles)[0] || '', phone: c.phone || '', email: c.email || '', url: siteUrl, socials: socials.map(s => s.url) },
    menuImages: Object.fromEntries(nav.map((x, i) => [x.id, cimg([heroSrc, ...(m.portraits || []), ...(m.gallery || [])].filter(Boolean)[i % Math.max(1, [heroSrc, ...(m.portraits || []), ...(m.gallery || [])].filter(Boolean).length)] || '', 800, '4:5')]))
  };

  const mark = logo ? `<img src="${esc(isCld(logo) ? cimg(logo, 120, null, 'limit') : logo)}" width="44" height="44" alt="">` : `<span class="mark">${esc(initials(name))}</span>`;
  const splash = siteData.features.splash ? `<div class="splash" aria-hidden="true"><div class="splash-inner">${logo ? `<img class="mono" src="${esc(isCld(logo) ? cimg(logo, 320, null, 'limit') : logo)}" width="150" height="150" alt="" fetchpriority="high">` : `<span class="mono mono-t">${esc(initials(name))}</span>`}<p class="splash-name">${esc(name)}</p>${b.tagline ? `<p class="splash-tag">${esc(b.tagline)}</p>` : ''}</div></div>` : '';
  const topCta = ctx.canInquire ? `<button class="top-cta" type="button" data-open="inquiry" aria-haspopup="dialog">${icon('send')}<span>${esc(copy.cta_primary || 'Get in touch')}</span></button>` : (c.phone ? `<a class="top-cta" href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${icon('phone')}<span>Call</span></a>` : '<span></span>');
  const menuFoot = `<div class="menu-contact">${c.phone ? `<a href="tel:${esc(c.phone.replace(/[^\d+]/g, ''))}">${icon('phone')}${esc(c.phone)}</a>` : ''}${c.email ? `<a href="mailto:${esc(c.email)}">${icon('mail')}${esc(c.email)}</a>` : ''}</div><div class="socials">${socials.map(s => `<a class="icon-btn" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.icon)}</a>`).join('')}</div>`;
  const share = feats.share ? `<div class="share"><span>Share</span><a class="icon-btn" href="https://wa.me/?text=${encodeURIComponent(siteUrl)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp">${icon('whatsapp')}</a><a class="icon-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}" target="_blank" rel="noopener" aria-label="Share on LinkedIn">${icon('linkedin')}</a><a class="icon-btn" href="https://x.com/intent/post?url=${encodeURIComponent(siteUrl)}" target="_blank" rel="noopener" aria-label="Share on X">${icon('x-social')}</a><button class="icon-btn" type="button" data-copy-link aria-label="Copy link">${icon('link')}</button></div>` : '';
  const credit = (spec.footer?.credit || '').trim();

  const drawer = ctx.canInquire ? `<div class="scrim" id="scrim" aria-hidden="true"></div>
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-h" data-lenis-prevent hidden>
  <div class="grab" aria-hidden="true"></div>
  <div class="d-head"><h2 id="drawer-h">Get in touch</h2><button class="icon-btn" type="button" data-close aria-label="Close">${icon('x')}</button></div>
  <p class="d-sub" id="drawerSub"></p>
  <form id="dForm" novalidate>
    <div class="mode" data-mode="order">
      <div class="field"><label for="o-item">Item</label><select id="o-item" name="item"></select></div>
      <div class="field" style="grid-template-columns:1fr auto;align-items:center"><span class="fl" id="qty-l">Quantity</span><div class="qty" role="group" aria-labelledby="qty-l"><button type="button" data-qty="-1" aria-label="Less">${icon('minus')}</button><output id="qtyOut">1</output><button type="button" data-qty="1" aria-label="More">${icon('plus')}</button></div></div>
      <div class="field"><label for="o-name">Full name</label><input id="o-name" name="name" type="text" autocomplete="name" maxlength="80"></div>
      <div class="row2"><div class="field"><label for="o-phone">Phone</label><input id="o-phone" name="phone" type="tel" autocomplete="tel" maxlength="20"></div><div class="field"><label for="o-pin">Postcode</label><input id="o-pin" name="pincode" type="text" autocomplete="postal-code" maxlength="12"></div></div>
      <div class="field"><label for="o-addr">Delivery address</label><textarea id="o-addr" name="address" autocomplete="street-address" maxlength="400"></textarea></div>
      <div class="field"><label for="o-note">Note (optional)</label><input id="o-note" name="note" type="text" maxlength="160"></div>
    </div>
    <div class="mode" data-mode="inquiry">
      <div class="row2"><div class="field"><label for="i-name">Your name</label><input id="i-name" name="iname" type="text" autocomplete="name" maxlength="80"></div><div class="field"><label for="i-phone">Phone</label><input id="i-phone" name="iphone" type="tel" autocomplete="tel" maxlength="20"></div></div>
      <div class="field"><label for="i-email">Email</label><input id="i-email" name="iemail" type="email" autocomplete="email" maxlength="120"></div>
      <div class="field"><label for="i-topic">Topic</label><input id="i-topic" name="topic" type="text" maxlength="120"></div>
      <div class="field"><label for="i-msg">Message</label><textarea id="i-msg" name="msg" maxlength="800"></textarea></div>
    </div>
    <p class="err" id="dErr" role="alert"></p>
    <button class="btn btn-solid w100" type="submit">${icon(wa ? 'whatsapp' : 'mail')}${wa ? 'Send on WhatsApp' : 'Send by email'}</button>
    ${wa && c.email ? `<a class="alt-mail" id="altMail" href="mailto:${esc(c.email)}">Prefer email? Send the same details by email</a>` : ''}
  </form>
</div>` : '';

  const htmlBody = `
<a class="skip" href="#main">Skip to content</a>
${splash}
<div class="progress" aria-hidden="true"><span></span></div>
<div class="cursor" aria-hidden="true"></div>
<header class="topbar" id="topbar">
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span class="bars" aria-hidden="true"><span></span><span></span></span><span class="word" aria-hidden="true">Menu</span></button>
  <a class="brand" href="#home" aria-label="${esc(name)}, back to top">${mark}<b>${esc(name)}</b></a>
  ${topCta}
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" data-lenis-prevent>
  <div class="menu-wrap">
    <nav aria-label="Primary"><ol class="menu-links">${nav.map((x, i) => `<li><a href="#${x.id}" data-preview="${x.id}"><span class="mn">${String(i + 1).padStart(2, '0')}</span>${esc(x.label)}</a></li>`).join('')}</ol></nav>
    <div class="menu-side" aria-hidden="true"></div>
    <div class="menu-foot">${menuFoot}</div>
  </div>
</div>
<nav class="tabbar" id="tabbar" aria-label="Quick navigation" style="--tabs:${tabs.length}"><span class="tab-pill" aria-hidden="true"></span>${tabs.map(t => `<a href="#${t.id}" data-tab="${t.id}">${icon(NAV_ICONS[t.id] || 'arrow-r')}<span>${esc(t.label)}</span></a>`).join('')}</nav>
<main id="main">
${heroHtml(ctx)}
${ribbonHtml(copy)}
${blocks.join('\n')}
</main>
<footer class="footer">
  <div class="foot-grid">
    <div class="foot-brand">${logo ? `<img src="${esc(isCld(logo) ? cimg(logo, 160, null, 'limit') : logo)}" width="60" height="60" alt="">` : ''}<div><b>${esc(name)}</b>${copy.footer_tagline ? `<em>${esc(copy.footer_tagline)}</em>` : ''}</div></div>
    <nav class="foot-links" aria-label="Footer">${nav.slice(1).map(x => `<a href="#${x.id}">${esc(x.label)}</a>`).join('')}</nav>
    <div class="socials">${socials.map(s => `<a class="icon-btn" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">${icon(s.icon)}</a>`).join('')}</div>
  </div>
  <div class="foot-base"><span>© <span data-year>${new Date().getFullYear()}</span> ${esc(name)}. All rights reserved.</span>${share}${credit ? `<span>${esc(credit)}</span>` : ''}</div>
</footer>
${wa && feats.whatsappBubble !== false ? `<a class="fab" href="https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${name}!`)}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon('whatsapp')}</a>` : ''}
${feats.backToTop !== false ? `<a class="to-top" href="#home" aria-label="Back to top">${icon('arrow-up')}</a>` : ''}
${feats.cookie ? `<div class="cookie" id="cookie" role="region" aria-label="Cookie notice" hidden><span>This site uses cookies for analytics.</span><div class="btn-row"><button class="btn btn-line" type="button" data-cookie="no">Decline</button><button class="btn btn-solid" type="button" data-cookie="yes">Accept</button></div></div>` : ''}
${drawer}
<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Gallery viewer" data-lenis-prevent hidden>
  <div class="lb-top"><span id="lbCount" aria-live="polite"></span><button class="icon-btn" type="button" data-lb-close aria-label="Close viewer">${icon('x')}</button></div>
  <div class="lb-stage" id="lbStage"><button class="icon-btn lb-nav lb-prev" type="button" data-lb-go="-1" aria-label="Previous">${icon('chev-l')}</button><div id="lbMedia"></div><button class="icon-btn lb-nav lb-next" type="button" data-lb-go="1" aria-label="Next">${icon('chev-r')}</button></div>
  <p class="lb-cap" id="lbCap"></p>
</div>`;

  // keep only the icons this page uses
  const used = new Set([...htmlBody.matchAll(/#i-([\w-]+)/g)].map(x => x[1]));
  const sprite = SPRITE.replace(/<symbol id="i-([\w-]+)"[^>]*>.*?<\/symbol>/g, (s, id) => used.has(id) ? s : '');
  const fabClass = wa && feats.whatsappBubble !== false ? '' : ' no-fab';
  const customCss = sanitizeCss([copy.custom_css, spec.design?.customCss].filter(Boolean).join('\n'));

  const head = `<!doctype html>
<html lang="${esc(b.language || 'en')}" class="no-js m-${motion}${fabClass}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(siteUrl)}/">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="${theme.c.ink}">
<meta property="og:type" content="${b.kind === 'business' ? 'website' : 'profile'}">
<meta property="og:site_name" content="${esc(name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(siteUrl)}/">
${og ? `<meta property="og:image" content="${esc(og)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="${esc(name)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
${og ? `<meta name="twitter:image" content="${esc(og)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${[heroSrc, logo, ...(m.portraits || [])].some(isCld) ? '<link rel="preconnect" href="https://res.cloudinary.com" crossorigin>' : ''}
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
${heroPreload}
<link id="gf" rel="stylesheet" media="print" href="${esc(gfUrl)}">
<noscript><link rel="stylesheet" href="${esc(gfUrl)}"></noscript>
<script>${bootJs}</script>
${favicons}
<link rel="manifest" href="/site.webmanifest">
<style>${css(theme, spec).replace(/\n/g, '')}${customCss ? `\n/* custom */\n${customCss}` : ''}</style>
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
<script type="application/json" id="site-data">${JSON.stringify(siteData).replace(/</g, '\\u003c')}</script>
${motion !== 'subtle' || siteData.features.smooth ? `<script defer src="${LIBS.gsap.src}" integrity="${LIBS.gsap.sri}" crossorigin="anonymous"></script>
<script defer src="${LIBS.st.src}" integrity="${LIBS.st.sri}" crossorigin="anonymous"></script>` : ''}
${siteData.features.smooth ? `<script defer src="${LIBS.lenis.src}" integrity="${LIBS.lenis.sri}" crossorigin="anonymous"></script>` : ''}
__RUNTIME__
</head>
<body>
${sprite}`;
  const html = `${head}${htmlBody}\n</body>\n</html>\n`;

  // ---- supporting files
  const thirdParty = siteData.features.ga4 || siteData.features.plausible || siteData.features.chat;
  const hash = await sha256b64(bootJs);
  const csp = thirdParty
    ? `default-src 'self' https: data: blob: wss:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`
    : `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'sha256-${hash}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https:; object-src 'none'; upgrade-insecure-requests`;
  const files = {
    'index.html': html.replace('__RUNTIME__', () => '<script defer src="/assets/site.js?v=' + Date.now().toString(36) + '"></script>'),
    'assets/site.js': runtimeJs || '',
    '_headers': `/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Content-Security-Policy: ${csp}\n\n/\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
    'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${esc(siteUrl)}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>1.0</priority></url>\n</urlset>\n`,
    'site.webmanifest': JSON.stringify({ name, short_name: name.slice(0, 24), start_url: '/', display: 'standalone', background_color: theme.c.ink, theme_color: theme.c.ink, icons: logo && isCld(logo) ? [{ src: tx(logo, 'c_pad,b_black,w_164,h_164/c_pad,b_black,w_192,h_192,f_png'), sizes: '192x192', type: 'image/png' }, { src: tx(logo, 'c_pad,b_black,w_440,h_440/c_pad,b_black,w_512,h_512,f_png'), sizes: '512x512', type: 'image/png' }] : [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2),
    'favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${theme.c.ink}"/><text x="32" y="41" font-family="Georgia,serif" font-size="26" text-anchor="middle" fill="${theme.c.accent2}">${esc(initials(name))}</text></svg>`,
    '404.html': `<!doctype html><html lang="${esc(b.language || 'en')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · ${esc(name)}</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:${theme.c.ink};color:${theme.c.textL};font:18px/1.6 Georgia,serif;text-align:center;padding:24px}a{color:${theme.c.accent2}}</style></head><body><div><h1 style="font-size:3rem;margin:0">404</h1><p>This page doesn't exist.</p><p><a href="/">Back to ${esc(name)}</a></p></div></body></html>`,
    'README.txt': `${name}: website generated by Zarvis\n\nDeploy: Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets → drop in this zip.\nDomain: ${siteUrl}${siteUrl.includes('example.com') ? '  (set your real domain in Zarvis → SEO and regenerate)' : ''}\nTheme: ${theme.name} · Hero: ${layout} · Motion: ${motion}\n\nzarvis-project.json holds the full project: import it back into Zarvis to edit and regenerate.\n`,
    'zarvis-project.json': JSON.stringify({ zarvis: 1, spec, copy: aiCopy || null }, null, 2)
  };
  const previewHtml = html
    .replace('__RUNTIME__', () => `<script>${(runtimeJs || '').replace(/<\/script/gi, '<\\/script')}</script>`)
    .replace(/<link rel="manifest"[^>]*>/, '');
  return { files, previewHtml: forPreview ? previewHtml : previewHtml, meta: { theme: theme.name, layout, motion, sections: nav.map(x => x.label), notes: copy.notes || '' } };
}
