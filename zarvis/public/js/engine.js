/**
 * Zarvis engine v2: project (blocks + design + brand) → complete static website.
 * Pure string rendering: the same code builds the live preview and the ZIP.
 */
import { BLOCKS, normalizeBlock } from './blocks.js';
import { STYLES, resolveDesign, styleCss } from './styles.js';
import { fontsUrls, fontStack } from './fonts.js';
import { SPRITE } from './sprite.js';

export const LIBS = {
  gsap: { src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', sri: 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt' },
  st:   { src: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', sri: 'sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d' },
  lenis:{ src: 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js', sri: 'sha384-B2WBjDzEjJpYvhmi2UyEn7rektqkf5suS6sNoyyrf0EBAwBHdkiXxIlU0V5Ru2ed' }
};

/* ================================================================= helpers */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const safeUrl = u => { const s = String(u || '').trim(); return /^(https?:|mailto:|tel:|#)/i.test(s) ? s : ''; };
const digits = s => String(s || '').replace(/\D/g, '');
export const slug = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const initials = name => String(name || 'Z').replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'Z';
const pad2 = n => String(n).padStart(2, '0');

/** Tiny safe markdown: **bold**, *italic*, [text](url), blank line = paragraph, single newline = <br> */
export function md(text, cls = '') {
  const inline = t => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => { const h = safeUrl(u.replace(/&amp;/g, '&')); return h ? `<a href="${esc(h)}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>` : t; })
    .replace(/\n/g, '<br>');
  return String(text || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p${cls ? ` class="${cls}"` : ''}>${inline(p)}</p>`).join('');
}
const titleHtml = (t, em) => `${esc(t)}${t && em ? ' ' : ''}${em ? `<em>${esc(em)}</em>` : ''}`;

/* ---------- colour ---------- */
const hexOk = h => /^#[0-9a-f]{6}$/i.test(h || '');
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = h => { const [r, g, b] = rgb(h).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export const mixHex = (a, b, t) => '#' + rgb(a).map((c, i) => Math.round((c * (1 - t) + rgb(b)[i] * t) * 255).toString(16).padStart(2, '0')).join('');
const onColor = bg => contrast(bg, '#ffffff') >= contrast(bg, '#111111') ? '#ffffff' : '#111111';
/** accent readable on a background: darken/lighten toward the text colour until 3:1 */
function readable(accent, bg, fg) { let c = accent, t = 0; while (contrast(c, bg) < 3 && t < 0.9) { t += 0.1; c = mixHex(accent, fg, t); } return c; }
export function validPalette(p) {
  if (!p || !['bg', 'surface', 'text', 'accent', 'accent2', 'dark', 'darkText'].every(k => hexOk(p[k]))) return false;
  return contrast(p.text, p.bg) >= 4.5 && contrast(p.text, p.surface) >= 4.5 && contrast(p.darkText, p.dark) >= 4.5;
}

/* ---------- media ---------- */
export const isCld = u => /^https:\/\/res\.cloudinary\.com\/[^/]+\/(image|video)\/upload\//.test(u || '');
const tx = (u, t) => u.replace('/upload/', `/upload/${t}/`);
export const isVideoUrl = u => /\/video\/upload\/|\.(mp4|mov|webm|m4v)(\?|$)/i.test(u || '');
const embedVideo = u => {
  const y = String(u || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (y) return `https://www.youtube-nocookie.com/embed/${y[1]}?autoplay=1&rel=0`;
  const v = String(u || '').match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (v) return `https://player.vimeo.com/video/${v[1]}?autoplay=1`;
  return '';
};
/** resize-aware URL for Cloudinary, Unsplash and Pexels; other hosts unchanged */
function sized(u, w, ar) {
  if (isCld(u)) return tx(u, ar ? `f_auto,q_auto,c_fill,g_auto,ar_${ar},w_${w}` : `f_auto,q_auto,c_limit,w_${w}`);
  try {
    const url = new URL(u);
    if (url.hostname === 'images.unsplash.com') { url.searchParams.set('w', w); url.searchParams.set('auto', 'format'); url.searchParams.set('q', '75'); if (ar) { const [a, b] = ar.split(':').map(Number); url.searchParams.set('h', Math.round(w * b / a)); url.searchParams.set('fit', 'crop'); } return url.toString(); }
    if (url.hostname === 'images.pexels.com') { url.searchParams.set('auto', 'compress'); url.searchParams.set('cs', 'tinysrgb'); url.searchParams.set('w', w); if (ar) { const [a, b] = ar.split(':').map(Number); url.searchParams.set('h', Math.round(w * b / a)); url.searchParams.set('fit', 'crop'); } return url.toString(); }
  } catch { /* not a URL */ }
  return u;
}
const resizable = u => isCld(u) || /^https:\/\/images\.(unsplash|pexels)\.com\//.test(u || '');
const WS = [480, 800, 1200, 1800];

/**
 * <figure> with a responsive image, a looping video, or (no URL) a generative art placeholder.
 * ar "4:5"; shape adds the design's image-shape class; parallax adds data-parallax.
 */
function media(u, { alt = '', ar = '4:5', sizes = '50vw', eager = false, cls = '', seed = 1, shape = false, anim = true, w = 1200, parallax = false, fit = 'cover' } = {}) {
  const [aw, ah] = ar.split(':').map(Number);
  const attrs = `class="m${shape ? ' shape' : ''}${cls ? ' ' + cls : ''}" style="--ar:${aw}/${ah}"${anim ? ' data-a="img"' : ''}`;
  if (!u) return `<figure ${attrs}><div class="art" style="--s:${seed % 7};--r:${(seed * 47) % 360}deg" aria-hidden="true"></div></figure>`;
  if (isVideoUrl(u)) {
    const src = isCld(u) ? tx(u, 'f_auto:video,q_auto,c_limit,w_1280').replace(/\.(mov|mp4|webm|m4v)$/i, '.mp4') : u;
    const poster = isCld(u) ? tx(u, `so_1,f_jpg,q_auto,c_fill,g_auto,ar_${ar},w_900`).replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg') : '';
    return `<figure ${attrs}><video muted loop playsinline preload="none" data-auto${poster ? ` poster="${esc(poster)}"` : ''} data-src="${esc(src)}"${parallax ? ' data-parallax' : ''}></video></figure>`;
  }
  const ss = resizable(u) ? WS.map(x => `${esc(sized(u, x, fit === 'cover' ? `${aw}:${ah}` : ''))} ${x}w`).join(', ') : '';
  return `<figure ${attrs}><img src="${esc(sized(u, w, fit === 'cover' ? `${aw}:${ah}` : ''))}"${ss ? ` srcset="${ss}" sizes="${esc(sizes)}"` : ''} width="${w}" height="${Math.round(w * ah / aw)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}${fit !== 'cover' ? ' style="object-fit:contain"' : ''}${parallax ? ' data-parallax' : ''}></figure>`;
}

/* ================================================================ context */
function buildCtx(project) {
  const d = resolveDesign(project.design || {});
  const st = STYLES[d.style];
  const brand = project.brand || {};
  const blocks = (project.blocks || []).map(normalizeBlock).filter(b => !b.hidden);
  // anchors + auto tones
  const used = new Set(['home', 'main', 'menu', 'top']);
  let cyc = 0;
  blocks.forEach((b, i) => {
    if (b.type === 'hero' && !used.has('_hero')) { b.anchor = 'home'; used.add('_hero'); }
    else {
      let a = slug(b.menu.show ? b.menu.label : '') || b.type, k = a, n = 2;
      while (used.has(k)) k = `${a}-${n++}`;
      used.add(k); b.anchor = k;
    }
    if (b.tone === 'auto') {
      if (b.type === 'hero') b.t = b.variant === 'fullbleed' ? 'dark' : st.heroTone;
      else if (b.type === 'marquee') b.t = st.marqueeTone || 'accent';
      else if (b.type === 'cta' && b.variant !== 'banner') b.t = st.ctaTone || 'dark';
      else if (b.type === 'html') b.t = 'light';
      else b.t = st.toneCycle[cyc++ % st.toneCycle.length];
    } else b.t = b.tone;
    b.n = i;
  });
  const menu = blocks.filter(b => b.menu.show && b.type !== 'hero');
  const contactBlock = blocks.find(b => b.type === 'contact');
  const anchorOf = type => blocks.find(b => b.type === type)?.anchor;
  const wa = digits(brand.whatsapp);
  return { project, d, st, brand, blocks, menu, contactBlock, anchorOf, wa, name: brand.name || project.name || 'Website', credits: new Set() };
}

/** Resolve button/link targets: #type anchors, "whatsapp", "email", "call" keywords, plain URLs */
function href(h, ctx) {
  const s = String(h || '').trim();
  if (!s) return ctx.contactBlock ? '#' + ctx.contactBlock.anchor : '#home';
  const low = s.toLowerCase();
  if (low === 'whatsapp' && ctx.wa) return `https://wa.me/${ctx.wa}`;
  if ((low === 'email' || low === 'mail') && ctx.brand.email) return `mailto:${ctx.brand.email}`;
  if ((low === 'call' || low === 'phone') && ctx.brand.phone) return `tel:${ctx.brand.phone.replace(/[^\d+]/g, '')}`;
  if (s.startsWith('#')) {
    const k = slug(s.slice(1));
    if (!k || k === 'home' || k === 'top') return '#home';
    const hit = ctx.blocks.find(b => b.anchor === k) || ctx.blocks.find(b => b.type === k) || ctx.blocks.find(b => slug(b.menu.label) === k)
      || (/(contact|book|enquir|inquir|order|reach|touch)/.test(k) && ctx.contactBlock);
    return hit ? '#' + hit.anchor : (ctx.contactBlock ? '#' + ctx.contactBlock.anchor : '#home');
  }
  if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(s)) return 'mailto:' + s;
  if (/^www\./i.test(s)) return 'https://' + s;
  return safeUrl(s) || '#home';
}
const ext = h => /^https?:/i.test(h) ? ' target="_blank" rel="noopener"' : '';
function btns(list, ctx, { cls = '' } = {}) {
  const b = (list || []).filter(x => x.label);
  if (!b.length) return '';
  return `<div class="btns${cls ? ' ' + cls : ''}" data-a="up">${b.map((x, i) => { const h = href(x.href, ctx); return `<a class="btn ${i ? 'btn-2' : 'btn-1'}" href="${esc(h)}"${ext(h)} data-magnetic><span class="btn-t">${esc(x.label)}</span>${icon(/^https?:/.test(h) ? 'arrow-ur' : 'arrow-r')}</a>`; }).join('')}</div>`;
}
/** section heading */
function head(b, ctx, { center = false, lead = true, tag = 'h2' } = {}) {
  if (!b.eyebrow && !b.title && !b.titleEm && !(lead && b.text)) return '';
  const num = pad2(ctx.menu.indexOf(b) + 1 > 0 ? ctx.menu.indexOf(b) + 1 : b.n);
  return `<header class="sh${center ? ' sh-c' : ''}">
    ${b.eyebrow ? `<p class="eyebrow" data-a="up"><span class="sh-n">${num}</span><span class="sh-e">${esc(b.eyebrow)}</span></p>` : ''}
    ${b.title || b.titleEm ? `<${tag} class="h2" data-a="head">${titleHtml(b.title, b.titleEm)}</${tag}>` : ''}
    ${lead && b.text ? `<div class="lead" data-a="up">${md(b.text)}</div>` : ''}
  </header>`;
}
const sectionOpen = (b, extra = '', ctx) => `<section id="${esc(b.anchor)}" class="blk b-${b.type} v-${b.variant} t-${b.t}${extra ? ' ' + extra : ''}" data-section="${esc(b.anchor)}" data-block="${esc(b.id)}"${b.menu.show ? ` aria-label="${esc(b.menu.label)}"` : ''}>`;
function orderLink(it, ctx) {
  const l = safeUrl(it.link);
  if (l) return { h: l, label: 'Buy now', ext: true };
  if (ctx.wa) return { h: `https://wa.me/${ctx.wa}?text=${encodeURIComponent(`Hello! I'd like to order: ${it.title}${it.meta ? ` (${it.meta})` : ''}`)}`, label: 'Order', ext: true };
  if (ctx.brand.email) return { h: `mailto:${ctx.brand.email}?subject=${encodeURIComponent('Order: ' + it.title)}`, label: 'Order', ext: false };
  return null;
}
const numeric = v => { const m = String(v).trim().match(/^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/); return m ? { pre: m[1], n: m[2].replace(/,/g, ''), post: m[3] } : null; };

/* ================================================================= blocks */
const R = {};

R.hero = (b, ctx) => {
  const d = ctx.d;
  const rot = b.items.filter(i => i.title).length ? `<p class="rot-line" data-a="up"><span class="rot" aria-label="${esc(b.items.map(i => i.title).join(', '))}">${b.items.filter(i => i.title).map((i, k) => `<span${k ? '' : ' class="is-on"'} aria-hidden="true">${esc(i.title)}</span>`).join('')}</span></p>` : '';
  const h1 = `<h1 class="h1 hero-t" data-hero="${d.heroText}">${b.title ? `<span class="hl">${esc(b.title)}</span>` : ''}${b.title && b.titleEm ? ' ' : ''}${b.titleEm ? `<em class="hl">${esc(b.titleEm)}</em>` : ''}${!b.title && !b.titleEm ? `<span class="hl">${esc(ctx.name)}</span>` : ''}</h1>`;
  const eb = b.eyebrow ? `<p class="eyebrow hero-eb" data-a="up"><span class="sh-e">${esc(b.eyebrow)}</span></p>` : '';
  const lead = b.text ? `<div class="lead" data-a="up">${md(b.text)}</div>` : '';
  const main = b.video || b.image;
  const cue = `<a class="cue" href="#${esc(ctx.blocks[1]?.anchor || 'home')}" aria-label="Scroll down"><span></span></a>`;
  const v = b.variant;
  if (v === 'fullbleed') return `${sectionOpen(b, 'hero', ctx)}
    <div class="hero-bg">${media(main, { ar: '16:9', sizes: '100vw', eager: true, w: 1800, anim: false, parallax: true, seed: 3 })}</div><div class="hero-shade"></div>
    <div class="wrap hero-in">${eb}${h1}${rot}${lead}${btns(b.buttons, ctx)}</div>${cue}</section>`;
  if (v === 'split') return `${sectionOpen(b, 'hero', ctx)}
    <div class="wrap hero-grid"><div class="hero-copy">${eb}${h1}${rot}${lead}${btns(b.buttons, ctx)}</div>
    <div class="hero-media">${media(main, { ar: '4:5', sizes: '(max-width:900px) 100vw, 45vw', eager: true, shape: true, seed: 2, parallax: true })}${b.images[0] ? media(b.images[0], { ar: '1:1', cls: 'hero-mini', sizes: '220px', w: 480, seed: 5 }) : ''}</div></div>${cue}</section>`;
  if (v === 'type') return `${sectionOpen(b, 'hero', ctx)}
    <div class="wrap hero-type">${eb}${h1}<div class="hero-row">${rot}${lead}${btns(b.buttons, ctx)}</div></div>
    ${main || !b.items.length ? `<div class="hero-strip wrap">${media(main, { ar: '21:9', sizes: '100vw', w: 1800, seed: 4, parallax: true })}</div>` : ''}
    ${b.items.length ? marqueeTrack(b.items.map(i => i.title), ctx, 'hero-mq') : ''}</section>`;
  if (v === 'centered') return `${sectionOpen(b, 'hero', ctx)}<div class="hero-glow" aria-hidden="true"></div>
    <div class="wrap hero-c">${eb}${h1}${rot}${lead}${btns(b.buttons, ctx, { cls: 'btns-c' })}</div>
    <div class="wrap hero-frame" data-tilt>${media(main, { ar: '16:9', sizes: '(max-width:1240px) 100vw, 1200px', eager: true, w: 1600, seed: 6 })}</div></section>`;
  // collage
  const imgs = [main, ...b.images].filter(Boolean);
  while (imgs.length < 5) imgs.push('');
  return `${sectionOpen(b, 'hero', ctx)}
    <div class="collage" aria-hidden="true">${imgs.slice(0, 6).map((u, i) => `<div class="cl cl-${i}" data-depth="${(0.4 + (i % 3) * 0.35).toFixed(2)}">${media(u, { ar: i % 2 ? '1:1' : '4:5', sizes: '30vw', w: 700, eager: i < 2, seed: i + 1, anim: false })}</div>`).join('')}</div>
    <div class="wrap hero-c">${eb}${h1}${rot}${lead}${btns(b.buttons, ctx, { cls: 'btns-c' })}</div></section>`;
};

R.about = (b, ctx) => {
  const ticks = b.items.length ? `<ul class="ticks" data-a="stagger">${b.items.map(i => `<li>${icon('check')}<span><b>${esc(i.title)}</b>${i.text ? ` ${esc(i.text)}` : ''}</span></li>`).join('')}</ul>` : '';
  if (b.variant === 'statement') return `${sectionOpen(b, '', ctx)}<div class="wrap narrow">
      ${b.eyebrow ? `<p class="eyebrow" data-a="up"><span class="sh-e">${esc(b.eyebrow)}</span></p>` : ''}
      <h2 class="statement" data-words>${titleHtml(b.title, b.titleEm)}</h2>
      ${b.text ? `<div class="lead cols-text" data-a="up">${md(b.text)}</div>` : ''}${ticks}${btns(b.buttons, ctx)}</div></section>`;
  if (b.variant === 'columns') return `${sectionOpen(b, '', ctx)}<div class="wrap cols2"><div class="cols2-h">${head(b, ctx, { lead: false })}</div>
      <div class="prose" data-a="up">${md(b.text)}${ticks}${btns(b.buttons, ctx)}</div></div></section>`;
  if (b.variant === 'quote') return `${sectionOpen(b, '', ctx)}<div class="wrap narrow center">
      ${b.eyebrow ? `<p class="eyebrow" data-a="up"><span class="sh-e">${esc(b.eyebrow)}</span></p>` : ''}
      ${icon('quote', 'i qmark')}<blockquote class="bq" data-a="head">${md(b.text || b.title)}</blockquote>
      ${b.title && b.text ? `<p class="cite" data-a="up">${titleHtml(b.title, b.titleEm)}</p>` : ''}</div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap ab-grid">
      <div class="ab-media">${media(b.image, { ar: '4:5', sizes: '(max-width:900px) 100vw, 45vw', shape: true, seed: b.n + 1, parallax: true })}${b.images[0] ? media(b.images[0], { ar: '1:1', cls: 'ab-mini', sizes: '240px', w: 480, seed: b.n + 3 }) : ''}</div>
      <div class="ab-copy">${head(b, ctx, { lead: false })}<div class="prose" data-a="up">${md(b.text)}</div>${ticks}${btns(b.buttons, ctx)}</div></div></section>`;
};

const itemLink = (it, ctx, inner, cls, attrs = '') => { const h = it.link ? href(it.link, ctx) : ''; return h ? `<a class="${cls}" href="${esc(h)}"${ext(h)}${attrs}>${inner}</a>` : `<div class="${cls}"${attrs}>${inner}</div>`; };
const imgAttr = it => it.image ? ` data-img="${esc(sized(it.image, 700, '4:5'))}"` : '';

R.features = (b, ctx) => {
  const its = b.items;
  if (b.variant === 'list') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      <div class="rows hover-list" data-hover-list>${its.map((it, i) => itemLink(it, ctx, `<span class="row-n">${pad2(i + 1)}</span><h3 class="h3 row-t">${esc(it.title)}</h3><p class="row-d">${esc(it.text)}</p><span class="row-go">${icon('arrow-ur')}</span>`, 'row', ' data-a="up"' + imgAttr(it))).join('')}</div>
      ${btns(b.buttons, ctx)}</div></section>`;
  if (b.variant === 'bento') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      <div class="bento n${Math.min(its.length, 6)}" data-a="stagger">${its.map((it, i) => itemLink(it, ctx, `${i === 0 || it.image ? media(it.image, { ar: i === 0 ? '4:3' : '16:9', sizes: '40vw', w: 900, seed: i + 2, anim: false }) : ''}<div class="bt-c">${it.icon ? `<span class="ic">${icon(it.icon)}</span>` : ''}<h3 class="h3">${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`, `card bt bt-${i}`, ' data-spot')).join('')}</div>
      ${btns(b.buttons, ctx)}</div></section>`;
  if (b.variant === 'icons') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: true })}
      <div class="icons-row" data-a="stagger">${its.map(it => `<div class="ir">${`<span class="ic ic-lg">${icon(it.icon || 'sparkles')}</span>`}<h3 class="h3">${esc(it.title)}</h3><p>${esc(it.text)}</p></div>`).join('')}</div>
      ${btns(b.buttons, ctx, { cls: 'btns-c' })}</div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      <div class="cards g${Math.min(Math.max(its.length, 2), 4)}" data-a="stagger">${its.map((it, i) => itemLink(it, ctx, `${it.image ? media(it.image, { ar: '16:10', sizes: '33vw', w: 800, seed: i + 1, anim: false }) : ''}${it.icon ? `<span class="ic">${icon(it.icon)}</span>` : `<span class="card-n">${pad2(i + 1)}</span>`}<h3 class="h3">${esc(it.title)}</h3><p>${esc(it.text)}</p>${it.link ? `<span class="more">Learn more ${icon('arrow-r')}</span>` : ''}`, 'card f-card', ' data-spot')).join('')}</div>
      ${btns(b.buttons, ctx)}</div></section>`;
};

R.stats = (b, ctx) => {
  const one = it => { const n = numeric(it.value); return `<div class="stat"><p class="num">${n ? `${esc(n.pre)}<span data-count="${esc(n.n)}">${esc(n.n)}</span>${esc(n.post)}` : esc(it.value)}<span class="suf">${esc(it.meta)}</span></p><p class="stat-l">${esc(it.title)}</p>${it.text ? `<p class="stat-d">${esc(it.text)}</p>` : ''}</div>`; };
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: b.variant === 'row' })}<div class="stats ${b.variant === 'big' ? 'stats-big' : 'g' + Math.min(Math.max(b.items.length, 2), 4)}" data-a="stagger">${b.items.map(one).join('')}</div></div></section>`;
};

R.work = (b, ctx) => {
  const its = b.items;
  const card = (it, i, ar = '4:5', cls = 'w-card') => itemLink(it, ctx, `${media(it.image, { ar, sizes: '(max-width:900px) 100vw, 50vw', w: 1200, seed: i + 2 })}<div class="w-meta"><span>${esc(it.meta)}</span>${it.link ? icon('arrow-ur') : ''}</div><h3 class="h3">${esc(it.title)}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}`, cls, ' data-cursor="View"');
  if (b.variant === 'list') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      <div class="rows hover-list work-list" data-hover-list>${its.map((it, i) => itemLink(it, ctx, `<span class="row-n">${pad2(i + 1)}</span><h3 class="h3 row-t">${esc(it.title)}</h3><p class="row-d">${esc(it.meta || it.text)}</p><span class="row-go">${icon('arrow-ur')}</span>`, 'row', ' data-a="up" data-cursor="View"' + imgAttr(it))).join('')}</div>${btns(b.buttons, ctx)}</div></section>`;
  if (b.variant === 'horizontal') return `${sectionOpen(b, 'hs-sec', ctx)}<div class="wrap">${head(b, ctx)}</div>
      <div class="hs" data-hscroll><div class="hs-track">${its.map((it, i) => card(it, i, '4:3', 'w-card hs-card')).join('')}</div></div><div class="wrap">${btns(b.buttons, ctx)}</div></section>`;
  if (b.variant === 'stack') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      <div class="stack">${its.map((it, i) => `<article class="stk card" style="--i:${i}" data-stack>${media(it.image, { ar: '16:10', sizes: '(max-width:900px) 100vw, 55vw', w: 1200, seed: i + 3, anim: false })}<div class="stk-c"><span class="stk-n">${pad2(i + 1)}${it.meta ? ` · ${esc(it.meta)}` : ''}</span><h3 class="h3">${esc(it.title)}</h3><p>${esc(it.text)}</p>${it.link ? `<a class="more" href="${esc(href(it.link, ctx))}"${ext(href(it.link, ctx))}>Open ${icon('arrow-ur')}</a>` : ''}</div></article>`).join('')}</div>${btns(b.buttons, ctx)}</div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="w-grid">${its.map((it, i) => card(it, i, i % 3 === 0 ? '4:5' : '1:1')).join('')}</div>${btns(b.buttons, ctx)}</div></section>`;
};

R.gallery = (b, ctx) => {
  const imgs = b.images.length ? b.images : ['', '', '', '', '', ''];
  const btn = (u, i, ar, sizes = '30vw') => `<button class="g-it" type="button" data-lb="${i}"${u ? '' : ' disabled'} aria-label="Open image ${i + 1}">${media(u, { ar, sizes, w: 900, seed: i + 1, anim: false })}</button>`;
  const lbData = `<script type="application/json" class="lb-data">${JSON.stringify(b.images.map(u => sized(u, 1800, ''))).replace(/</g, '\\u003c')}</script>`;
  let inner;
  if (b.variant === 'masonry') inner = `<div class="wrap"><div class="masonry" data-a="stagger">${imgs.map((u, i) => btn(u, i, ['4:5', '1:1', '3:4', '4:3'][i % 4])).join('')}</div></div>`;
  else if (b.variant === 'grid') inner = `<div class="wrap"><div class="g-grid" data-a="stagger">${imgs.map((u, i) => btn(u, i, '1:1', '25vw')).join('')}</div></div>`;
  else if (b.variant === 'horizontal') inner = `<div class="hs" data-hscroll><div class="hs-track">${imgs.map((u, i) => `<div class="hs-card">${btn(u, i, i % 2 ? '4:5' : '3:2', '60vw')}</div>`).join('')}</div></div>`;
  else {
    const half = Math.ceil(imgs.length / 2), rows = [imgs.slice(0, half), imgs.slice(half)].filter(r => r.length);
    inner = rows.map((r, k) => `<div class="mq mq-img${k ? ' mq-rev' : ''}" data-mq><div class="mq-track"><div class="mq-set">${r.map((u, i) => btn(u, k ? half + i : i, i % 2 ? '1:1' : '4:5', '320px')).join('')}</div></div></div>`).join('');
  }
  return `${sectionOpen(b, 'gal', ctx)}${b.title || b.eyebrow ? `<div class="wrap">${head(b, ctx, { center: b.variant === 'marquee' })}</div>` : ''}${inner}${lbData}</section>`;
};

R.products = (b, ctx) => {
  const its = b.items;
  const buy = it => { const o = orderLink(it, ctx); return o ? `<a class="btn btn-1 btn-sm" href="${esc(o.h)}"${o.ext ? ' target="_blank" rel="noopener"' : ''}><span class="btn-t">${o.label}</span>${icon(o.label === 'Order' && ctx.wa ? 'whatsapp' : 'arrow-ur')}</a>` : ''; };
  if (b.variant === 'menu') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: true })}
      <div class="mlist" data-a="stagger">${its.map((it, i) => `<div class="mi">${it.image ? media(it.image, { ar: '1:1', sizes: '96px', w: 240, seed: i, anim: false, cls: 'mi-img' }) : ''}<div class="mi-c"><p class="mi-h"><span class="mi-t">${esc(it.title)}${it.tag ? ` <span class="tag">${esc(it.tag)}</span>` : ''}</span><span class="mi-dots" aria-hidden="true"></span><span class="mi-p">${esc(it.meta)}</span></p>${it.text ? `<p class="mi-d">${esc(it.text)}</p>` : ''}</div></div>`).join('')}</div>
      ${btns(b.buttons, ctx, { cls: 'btns-c' })}</div></section>`;
  if (b.variant === 'feature') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      ${its.map((it, i) => `<article class="pf${i % 2 ? ' pf-r' : ''}"><div class="pf-m">${media(it.image, { ar: '4:5', sizes: '(max-width:900px) 100vw, 45vw', shape: true, seed: i + 2, parallax: true, fit: 'cover' })}</div><div class="pf-c" data-a="up">${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : ''}<h3 class="h2 pf-t">${esc(it.title)}</h3><div class="prose">${md(it.text)}</div>${it.meta ? `<p class="price">${esc(it.meta)}</p>` : ''}${buy(it)}</div></article>`).join('')}
      ${btns(b.buttons, ctx)}</div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}
      <div class="cards g${Math.min(Math.max(its.length, 2), 4)} p-grid" data-a="stagger">${its.map((it, i) => `<article class="card p-card" data-spot>${media(it.image, { ar: '4:5', sizes: '(max-width:700px) 100vw, 33vw', w: 800, seed: i + 1, anim: false })}${it.tag ? `<span class="tag p-tag">${esc(it.tag)}</span>` : ''}<div class="p-c"><h3 class="h3">${esc(it.title)}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}<div class="p-foot">${it.meta ? `<span class="price">${esc(it.meta)}</span>` : '<span></span>'}${buy(it)}</div></div></article>`).join('')}</div>
      ${btns(b.buttons, ctx)}</div></section>`;
};

R.pricing = (b, ctx) => {
  const its = b.items;
  const plan = (it, i) => { const h = href(it.link || '', ctx); const feats = String(it.text || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
    return `<article class="card plan${it.tag ? ' is-feat' : ''}" data-spot>${it.tag ? `<span class="tag plan-tag">${esc(it.tag)}</span>` : ''}<h3 class="h3">${esc(it.title)}</h3><p class="plan-p"><span class="plan-v">${esc(it.value)}</span>${it.meta ? `<span class="plan-m">/ ${esc(it.meta)}</span>` : ''}</p><ul class="plan-f">${feats.map(f => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul><a class="btn ${it.tag ? 'btn-1' : 'btn-2'}" href="${esc(h)}"${ext(h)}><span class="btn-t">Get started</span>${icon('arrow-r')}</a></article>`; };
  if (b.variant === 'simple') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="rows plan-rows" data-a="stagger">${its.map(it => `<div class="row"><h3 class="h3 row-t">${esc(it.title)}${it.tag ? ` <span class="tag">${esc(it.tag)}</span>` : ''}</h3><p class="row-d">${esc(String(it.text || '').split(/\n+/).join(' · '))}</p><p class="price">${esc(it.value)}${it.meta ? ` <small>/ ${esc(it.meta)}</small>` : ''}</p></div>`).join('')}</div></div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: true })}<div class="plans g${Math.min(Math.max(its.length, 1), 4)}" data-a="stagger">${its.map(plan).join('')}</div></div></section>`;
};

R.testimonials = (b, ctx) => {
  const its = b.items;
  const who = it => `<figcaption class="who">${it.image ? media(it.image, { ar: '1:1', sizes: '56px', w: 160, anim: false, cls: 'av' }) : `<span class="av av-i">${esc(initials(it.title))}</span>`}<span><b>${esc(it.title)}</b>${it.meta ? `<small>${esc(it.meta)}</small>` : ''}</span></figcaption>`;
  if (b.variant === 'grid') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="t-grid" data-a="stagger">${its.map(it => `<figure class="card tq">${icon('quote', 'i qmark')}<blockquote>${md(it.text)}</blockquote>${who(it)}</figure>`).join('')}</div></div></section>`;
  const big = b.variant === 'big';
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: true })}
    <div class="slider${big ? ' slider-big' : ''}" data-slider aria-roledescription="carousel">
      <div class="sl-track">${its.map((it, i) => `<figure class="sl${i ? '' : ' is-on'}" aria-roledescription="slide" aria-label="${i + 1} of ${its.length}">${icon('quote', 'i qmark')}<blockquote class="${big ? 'bq' : 'tq-t'}">${md(it.text)}</blockquote>${who(it)}</figure>`).join('')}</div>
      ${its.length > 1 ? `<div class="sl-nav"><button type="button" class="sl-b" data-prev aria-label="Previous">${icon('chev-l')}</button><span class="sl-dots">${its.map((_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</span><button type="button" class="sl-b" data-next aria-label="Next">${icon('chev-r')}</button></div>` : ''}
    </div></div></section>`;
};

R.team = (b, ctx) => {
  if (b.variant === 'list') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="rows hover-list" data-hover-list>${b.items.map((it, i) => itemLink(it, ctx, `<span class="row-n">${pad2(i + 1)}</span><h3 class="h3 row-t">${esc(it.title)}</h3><p class="row-d">${esc(it.meta)}${it.text ? ` · ${esc(it.text)}` : ''}</p><span class="row-go">${icon('arrow-ur')}</span>`, 'row', ' data-a="up"' + imgAttr(it))).join('')}</div></div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="team g${Math.min(Math.max(b.items.length, 2), 4)}" data-a="stagger">${b.items.map((it, i) => itemLink(it, ctx, `${media(it.image, { ar: '3:4', sizes: '(max-width:700px) 50vw, 25vw', w: 700, seed: i + 2, anim: false })}<h3 class="h3">${esc(it.title)}</h3><p class="tm-r">${esc(it.meta)}</p>${it.text ? `<p class="tm-b">${esc(it.text)}</p>` : ''}`, 'tm')).join('')}</div></div></section>`;
};

R.logos = (b, ctx) => {
  const one = it => { const inner = it.image ? `<img src="${esc(sized(it.image, 320, ''))}" alt="${esc(it.title)}" width="160" height="60" loading="lazy" decoding="async">` : `<span class="wm">${esc(it.title)}</span>`; const h = it.link ? href(it.link, ctx) : ''; return h ? `<a class="lg" href="${esc(h)}"${ext(h)}>${inner}</a>` : `<span class="lg">${inner}</span>`; };
  const h = b.title || b.eyebrow ? `<div class="wrap">${head(b, ctx, { center: true })}</div>` : '';
  if (b.variant === 'grid') return `${sectionOpen(b, 'logos', ctx)}${h}<div class="wrap"><div class="lg-grid" data-a="stagger">${b.items.map(one).join('')}</div></div></section>`;
  return `${sectionOpen(b, 'logos', ctx)}${h}<div class="mq mq-logos" data-mq><div class="mq-track"><div class="mq-set">${b.items.map(one).join('')}</div></div></div></section>`;
};

R.timeline = (b, ctx) => {
  const its = b.items;
  if (b.variant === 'steps') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<ol class="steps g${Math.min(Math.max(its.length, 2), 4)}" data-a="stagger">${its.map((it, i) => `<li class="card step"><span class="step-n">${esc(it.meta || pad2(i + 1))}</span><h3 class="h3">${esc(it.title)}</h3><p>${esc(it.text)}</p></li>`).join('')}</ol></div></section>`;
  if (b.variant === 'agenda') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="rows agenda" data-a="stagger">${its.map(it => itemLink(it, ctx, `<span class="ag-d">${esc(it.meta)}</span><div class="ag-c"><h3 class="h3">${esc(it.title)}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}</div>${it.link ? `<span class="row-go">${icon('arrow-ur')}</span>` : '<span></span>'}`, 'row ag')).join('')}</div></div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<ol class="tl">${its.map(it => `<li class="tl-i" data-a="up"><span class="tl-y">${esc(it.meta)}</span><div class="tl-c"><h3 class="h3">${esc(it.title)}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}</div></li>`).join('')}</ol></div></section>`;
};

R.faq = (b, ctx) => {
  if (b.variant === 'columns') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx)}<div class="faq-cols" data-a="stagger">${b.items.map(it => `<div class="fq"><h3 class="h3">${esc(it.title)}</h3>${md(it.text)}</div>`).join('')}</div></div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap faq-wrap">${head(b, ctx)}<div class="faq" data-a="stagger">${b.items.map(it => `<details class="qa"><summary><span>${esc(it.title)}</span><i class="pm" aria-hidden="true"></i></summary><div class="qa-a">${md(it.text)}</div></details>`).join('')}</div></div></section>`;
};

R.cta = (b, ctx) => {
  if (b.variant === 'marquee') { const h = href(b.buttons[0]?.href, ctx); return `${sectionOpen(b, '', ctx)}<a class="cta-mq" href="${esc(h)}"${ext(h)} data-cursor="${esc(b.buttons[0]?.label || 'Go')}">${marqueeTrack([`${b.title} ${b.titleEm}`.trim() || ctx.name], ctx, 'mq-giant')}</a>${b.text ? `<div class="wrap center"><div class="lead" data-a="up">${md(b.text)}</div></div>` : ''}</section>`; }
  if (b.variant === 'banner') return `${sectionOpen(b, 'cta-ban', ctx)}<div class="wrap"><div class="banner">${media(b.image, { ar: '21:9', sizes: '100vw', w: 1800, seed: 5, anim: false, parallax: true })}<div class="banner-c">${b.eyebrow ? `<p class="eyebrow"><span class="sh-e">${esc(b.eyebrow)}</span></p>` : ''}<h2 class="h2" data-a="head">${titleHtml(b.title, b.titleEm)}</h2>${b.text ? `<div class="lead">${md(b.text)}</div>` : ''}${btns(b.buttons, ctx)}</div></div></div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap center cta-big">${b.eyebrow ? `<p class="eyebrow" data-a="up"><span class="sh-e">${esc(b.eyebrow)}</span></p>` : ''}<h2 class="h1 cta-t" data-a="head">${titleHtml(b.title, b.titleEm)}</h2>${b.text ? `<div class="lead" data-a="up">${md(b.text)}</div>` : ''}${btns(b.buttons, ctx, { cls: 'btns-c' })}</div></section>`;
};

function marqueeTrack(words, ctx, cls = '') {
  const sep = `<span class="mq-sep" aria-hidden="true">${esc(ctx.st.sep || '✦')}</span>`;
  const w = words.filter(Boolean);
  return `<div class="mq ${cls}" data-mq><div class="mq-track"><div class="mq-set">${w.map(x => `<span class="mq-w">${esc(x)}</span>${sep}`).join('')}</div></div></div>`;
}
R.marquee = (b, ctx) => `${sectionOpen(b, 'ribbon', ctx)}${marqueeTrack(b.items.map(i => i.title), ctx, 'mq-' + b.variant)}</section>`;

R.video = (b, ctx) => {
  const em = embedVideo(b.video), file = !em && b.video ? b.video : '';
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: true })}<div class="vid" data-a="img">${media(b.image || (isCld(b.video) ? tx(b.video, 'so_2,f_jpg').replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg') : ''), { ar: '16:9', sizes: '(max-width:1240px) 100vw, 1200px', w: 1600, seed: 4, anim: false })}
    ${em || file ? `<button class="vid-play" type="button" data-video="${esc(em || file)}" data-kind="${em ? 'embed' : 'file'}" aria-label="Play video">${icon('play')}</button>` : ''}</div></div></section>`;
};

function contactRows(ctx, extra = []) {
  const c = ctx.brand, rows = [];
  if (c.email) rows.push(['mail', 'Email', c.email, `mailto:${c.email}`]);
  if (ctx.wa) rows.push(['whatsapp', 'WhatsApp', c.whatsapp, `https://wa.me/${ctx.wa}`]);
  if (c.phone) rows.push(['phone', 'Phone', c.phone, `tel:${c.phone.replace(/[^\d+]/g, '')}`]);
  if (c.address) rows.push(['pin', 'Address', c.address, safeUrl(c.mapUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.address)}`]);
  if (c.bookingUrl) rows.push(['calendar', 'Book a time', 'Pick a slot online', safeUrl(c.bookingUrl)]);
  extra.forEach(it => rows.push(['clock', it.title, it.text, '']));
  return rows;
}
const SOC = { instagram: 'instagram', linkedin: 'linkedin', x: 'x-social', facebook: 'facebook', youtube: 'youtube', tiktok: 'tiktok', threads: 'threads', pinterest: 'pinterest', behance: 'behance', dribbble: 'dribbble', github: 'github', website: 'globe' };
export function socials(brand) { return Object.entries(SOC).map(([k, ic]) => ({ k, ic, u: safeUrl(brand?.social?.[k]) })).filter(x => x.u && /^https?:/.test(x.u)); }
const socialIcons = ctx => { const s = socials(ctx.brand); return s.length ? `<ul class="soc">${s.map(x => `<li><a href="${esc(x.u)}" target="_blank" rel="noopener me" aria-label="${esc(x.k)}">${icon(x.ic)}</a></li>`).join('')}</ul>` : ''; };
function contactForm(ctx) {
  return `<form class="card form" data-form novalidate>
    <div class="fg"><label for="f-name">Name</label><input id="f-name" name="name" autocomplete="name" required></div>
    <div class="fg"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
    <div class="fg"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="4" required></textarea></div>
    <button class="btn btn-1" type="submit"><span class="btn-t">${ctx.project.features?.formEndpoint ? 'Send message' : ctx.wa ? 'Send on WhatsApp' : 'Send email'}</span>${icon(ctx.wa && !ctx.project.features?.formEndpoint ? 'whatsapp' : 'send')}</button>
    <p class="form-note" role="status" aria-live="polite"></p></form>`;
}
R.contact = (b, ctx) => {
  const rows = contactRows(ctx, b.items);
  const list = rows.length ? `<div class="clinks" data-a="stagger">${rows.map(([ic, l, v, h]) => h ? `<a href="${esc(h)}"${ext(h)}><span class="ic">${icon(ic)}</span><span><b>${esc(l)}</b><small>${esc(v)}</small></span>${icon('arrow-ur')}</a>` : `<div><span class="ic">${icon(ic)}</span><span><b>${esc(l)}</b><small>${esc(v)}</small></span></div>`).join('')}</div>` : '';
  if (b.variant === 'centered') { const e = ctx.brand.email; return `${sectionOpen(b, '', ctx)}<div class="wrap center ct-c">${head(b, ctx, { center: true })}${e ? `<a class="big-mail" href="mailto:${esc(e)}" data-a="up">${esc(e)}</a>` : ''}${list}${socialIcons(ctx)}</div></section>`; }
  if (b.variant === 'cards') return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { center: true })}<div class="cards g${Math.min(Math.max(rows.length, 2), 4)}" data-a="stagger">${rows.map(([ic, l, v, h]) => `${h ? `<a class="card cc" href="${esc(h)}"${ext(h)}>` : '<div class="card cc">'}<span class="ic ic-lg">${icon(ic)}</span><h3 class="h3">${esc(l)}</h3><p>${esc(v)}</p>${h ? '</a>' : '</div>'}`).join('')}</div><div class="center">${socialIcons(ctx)}</div></div></section>`;
  return `${sectionOpen(b, '', ctx)}<div class="wrap ct-grid"><div>${head(b, ctx)}${list}${socialIcons(ctx)}</div><div data-a="up">${contactForm(ctx)}</div></div></section>`;
};

R.newsletter = (b, ctx) => {
  const action = safeUrl(b.buttons[0]?.href);
  return `${sectionOpen(b, '', ctx)}<div class="wrap narrow center">${head(b, ctx, { center: true })}
    <form class="nl" data-a="up" ${/^https?:/.test(action) ? `action="${esc(action)}" method="post" target="_blank"` : 'data-nl'}><label class="sr" for="nl-${esc(b.id)}">Email address</label><input id="nl-${esc(b.id)}" type="email" name="email" placeholder="you@example.com" autocomplete="email" required><button class="btn btn-1" type="submit"><span class="btn-t">${esc(b.buttons[0]?.label || 'Subscribe')}</span>${icon('arrow-r')}</button></form></div></section>`;
};

R.map = (b, ctx) => {
  const addr = b.text || ctx.brand.address || '';
  return `${sectionOpen(b, '', ctx)}<div class="wrap">${head(b, ctx, { lead: false })}<div class="map-w" data-a="img">${addr ? `<iframe title="Map: ${esc(addr)}" src="https://www.google.com/maps?q=${encodeURIComponent(addr)}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>` : '<div class="art" style="--s:2"></div>'}</div>${addr ? `<p class="map-a" data-a="up">${icon('pin')} ${esc(addr)}</p>` : ''}</div></section>`;
};

R.html = (b, ctx) => `<section id="${esc(b.anchor)}" class="blk b-html" data-section="${esc(b.anchor)}" data-block="${esc(b.id)}">${b.text}</section>`;

/* ================================================================ chrome */
function chrome(ctx) {
  const { d, brand, menu, name } = ctx;
  const logo = brand.logo ? `<img src="${esc(sized(brand.logo, 240, ''))}" alt="${esc(name)}" width="120" height="40" class="logo-img">` : `<span class="logo-t">${esc(name)}</span>`;
  const cta = ctx.contactBlock ? { h: '#' + ctx.contactBlock.anchor, l: ctx.project.chrome?.cta || 'Contact' } : ctx.wa ? { h: `https://wa.me/${ctx.wa}`, l: 'WhatsApp' } : brand.email ? { h: `mailto:${brand.email}`, l: 'Email' } : null;
  const links = menu.map((b, i) => `<a href="#${esc(b.anchor)}">${esc(b.menu.label)}</a>`).join('');
  const header = `<header class="top" id="top">
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span class="bl" aria-hidden="true"><i></i><i></i></span><span class="bt">Menu</span></button>
    <a class="brand" href="#home" aria-label="${esc(name)}, home">${logo}</a>
    <div class="top-end">${d.headerLinks && menu.length ? `<nav class="top-links" aria-label="Sections">${links}</nav>` : ''}${cta ? `<a class="btn btn-1 btn-sm top-cta" href="${esc(cta.h)}"${ext(cta.h)}><span class="btn-t">${esc(cta.l)}</span>${icon('arrow-r')}</a>` : ''}</div>
  </header>`;
  const imgFor = b => b.image || b.items.find(i => i.image)?.image || b.images[0] || '';
  const menuHtml = `<div class="menu mn-${d.menu}" id="menu" role="dialog" aria-modal="true" aria-label="Site menu" data-lenis-prevent>
    <div class="menu-bg" aria-hidden="true"></div>
    <div class="menu-in">
      <nav class="menu-nav" aria-label="Main"><ol>
        <li><a href="#home" data-img="${esc(imgFor(ctx.blocks[0] || { items: [], images: [] }) ? sized(imgFor(ctx.blocks[0]), 900, '4:5') : '')}"><span class="mn-n">00</span><span class="mn-l">Home</span></a></li>
        ${menu.map((b, i) => `<li><a href="#${esc(b.anchor)}" data-img="${esc(imgFor(b) ? sized(imgFor(b), 900, '4:5') : '')}"><span class="mn-n">${pad2(i + 1)}</span><span class="mn-l">${esc(b.menu.label)}</span></a></li>`).join('')}
      </ol></nav>
      <aside class="menu-aside">${brand.tagline ? `<p class="menu-tag">${esc(brand.tagline)}</p>` : ''}
        ${brand.email ? `<a href="mailto:${esc(brand.email)}">${esc(brand.email)}</a>` : ''}${brand.phone ? `<a href="tel:${esc(brand.phone.replace(/[^\d+]/g, ''))}">${esc(brand.phone)}</a>` : ''}
        ${socialIcons(ctx)}</aside>
      <div class="menu-media" aria-hidden="true"></div>
    </div></div>`;
  // bottom tab bar (mobile + tablet): home + up to 3 sections + contact
  const tabs = [{ a: 'home', l: 'Home', ic: 'home' }, ...menu.filter(b => b.type !== 'contact').slice(0, ctx.contactBlock ? 3 : 4).map(b => ({ a: b.anchor, l: b.menu.label, ic: BLOCKS[b.type].icon })), ...(ctx.contactBlock && ctx.contactBlock.menu.show ? [{ a: ctx.contactBlock.anchor, l: ctx.contactBlock.menu.label, ic: 'send' }] : [])];
  const tabbar = tabs.length > 1 ? `<nav class="tabbar" id="tabbar" aria-label="Quick navigation"><span class="tb-pill" aria-hidden="true"></span>${tabs.map((t, i) => `<a href="#${esc(t.a)}" data-tab="${esc(t.a)}" style="--n:${i}">${icon(t.ic)}<span>${esc(t.l.split(' ')[0].slice(0, 11))}</span></a>`).join('')}</nav>` : '';
  return { header, menuHtml, tabbar, tabCount: tabs.length };
}

function footer(ctx) {
  const { brand, menu, name, project } = ctx;
  const rows = contactRows(ctx);
  const credits = [...ctx.credits];
  return `<footer class="foot t-${ctx.st.footTone || 'dark'}">
    <div class="wrap">
      <div class="foot-top"><p class="foot-big" data-a="head" style="--len:${Math.max(4, Math.max(...name.split(/\s+/).map(w => w.length)))}">${esc(name)}</p>${brand.tagline ? `<p class="foot-tag">${esc(brand.tagline)}</p>` : ''}</div>
      <div class="foot-grid">
        ${menu.length ? `<nav aria-label="Footer"><p class="foot-h">Explore</p>${menu.map(b => `<a href="#${esc(b.anchor)}">${esc(b.menu.label)}</a>`).join('')}</nav>` : ''}
        ${rows.length ? `<div><p class="foot-h">Contact</p>${rows.slice(0, 4).map(([, , v, h]) => h ? `<a href="${esc(h)}"${ext(h)}>${esc(v)}</a>` : `<span>${esc(v)}</span>`).join('')}</div>` : ''}
        ${socials(brand).length ? `<div><p class="foot-h">Follow</p>${socialIcons(ctx)}</div>` : ''}
      </div>
      <div class="foot-bot"><span>© <span data-year>${new Date().getFullYear()}</span> ${esc(name)}${project.footer?.credit ? ` · ${esc(project.footer.credit)}` : ''}</span>${credits.length ? `<span class="credits">Photos: ${credits.map(c => esc(c)).join(', ')}</span>` : ''}<a href="#home" class="foot-up">Back to top ${icon('arrow-up')}</a></div>
    </div></footer>`;
}

/* ================================================================== CSS */
function baseCss(d) {
  return `
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;background:var(--bg);scroll-padding-top:90px}
html.lenis,html.lenis body{height:auto}.lenis.lenis-smooth{scroll-behavior:auto!important}.lenis.lenis-stopped{overflow:hidden}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--fb);font-weight:var(--bw);font-size:calc(clamp(15.5px,1.02vw,18px) * var(--fs));line-height:1.68;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body.is-locked{overflow:hidden}main{overflow-x:clip;display:block}
img,svg,video,iframe{display:block;max-width:100%}
a{color:inherit;text-decoration-thickness:1px;text-underline-offset:.2em}
button,input,textarea,select{font:inherit;color:inherit}
p{margin:0 0 1em}p:last-child{margin-bottom:0}
h1,h2,h3{margin:0;font-weight:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.sr,.skip:not(:focus){position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.skip{position:fixed;left:12px;top:12px;z-index:200;padding:10px 16px;background:var(--text);color:var(--bg);border-radius:8px}
.i{width:1.1em;height:1.1em;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.wrap{width:min(100% - 2 * var(--pad),var(--maxw));margin-inline:auto}.narrow{max-width:900px}.center{text-align:center}
/* tones */
.t-light{--c-bg:var(--bg);--c-fg:var(--text);--c-card:var(--surface);--c-em:var(--em-l)}
.t-alt{--c-bg:var(--surface);--c-fg:var(--text);--c-card:var(--bg);--c-em:var(--em-s)}
.t-dark{--c-bg:var(--dark);--c-fg:var(--dark-text);--c-card:color-mix(in srgb,var(--dark-text) 7%,var(--dark));--c-em:var(--em-d)}
.t-accent{--c-bg:var(--accent);--c-fg:var(--on-accent);--c-card:color-mix(in srgb,var(--on-accent) 10%,var(--accent));--c-em:var(--on-accent)}
.blk,.foot{--c-mu:color-mix(in srgb,var(--c-fg) 64%,var(--c-bg));--c-line:color-mix(in srgb,var(--c-fg) 13%,transparent);--c-line2:color-mix(in srgb,var(--c-fg) 30%,transparent);background:var(--c-bg);color:var(--c-fg)}
.blk{position:relative;padding-block:var(--sp)}
.t-accent .btn-1{--btn-bg:var(--on-accent);--btn-fg:var(--accent)}
/* type */
.h1,.h2,.h3,.statement,.foot-big,.num,.bq{font-family:var(--fd);font-weight:var(--dw);text-transform:var(--dcase);letter-spacing:var(--dls)}
.h1{font-size:calc(clamp(3rem,8.4vw,8.8rem) * var(--ts));line-height:.94}
.h2{font-size:calc(clamp(2.2rem,5.2vw,4.8rem) * var(--ts));line-height:1}
.h3{font-size:calc(clamp(1.2rem,1.7vw,1.6rem) * var(--ts3));line-height:1.18}
.h1 em,.h2 em,.statement em,.bq em{font-style:var(--em-style);color:var(--c-em)}
.eyebrow{display:flex;align-items:center;gap:.9em;margin:0 0 1.2em;font:500 .74rem/1.2 var(--fl);letter-spacing:.2em;text-transform:uppercase;color:var(--c-mu)}
.sh-c .eyebrow,.center .eyebrow{justify-content:center}
.sh-n{display:none}
.lead{max-width:62ch;color:var(--c-mu);font-size:1.08em}
.sh{display:grid;gap:clamp(14px,1.6vw,22px);margin-bottom:clamp(36px,5vw,76px);max-width:980px}.sh .eyebrow{margin:0}
.sh-c{margin-inline:auto;text-align:center;justify-items:center}
.prose{max-width:62ch}.prose p{color:var(--c-mu)}.prose p:first-child{color:var(--c-fg);font-size:1.08em}
.tag{display:inline-flex;align-items:center;padding:.3em .8em;border-radius:999px;background:var(--accent);color:var(--on-accent);font:600 .68rem/1.2 var(--fl);letter-spacing:.08em;text-transform:uppercase;vertical-align:middle}
.price{font:600 1.15rem var(--fl);margin:0}
/* buttons */
.btns{display:flex;flex-wrap:wrap;gap:12px;margin-top:clamp(24px,3vw,40px)}.btns-c{justify-content:center}
.btn{--btn-bg:var(--accent);--btn-fg:var(--on-accent);position:relative;display:inline-flex;align-items:center;justify-content:center;gap:.7em;min-height:3.25em;padding:0 1.7em;border:1px solid transparent;border-radius:var(--rb);font:600 .86rem/1 var(--fl);letter-spacing:var(--btn-ls);text-transform:var(--btn-case);text-decoration:none;cursor:pointer;isolation:isolate;overflow:hidden;transition:transform .5s var(--ease),background-color .4s,color .4s,border-color .4s,box-shadow .4s}
.btn-1{background:var(--btn-bg);color:var(--btn-fg)}
.btn-2{background:transparent;color:var(--c-fg,var(--text));border-color:var(--c-line2,currentColor)}
.btn-sm{min-height:2.7em;padding:0 1.2em;font-size:.8rem}
.btn .i{transition:transform .5s var(--ease)}
.btn::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--c-fg,var(--text));transform:translateY(101%);transition:transform .55s var(--ease)}
.btn-1::before{background:color-mix(in srgb,var(--btn-fg) 18%,var(--btn-bg))}
@media (hover:hover){.btn:hover::before{transform:none}.btn:hover .i{transform:translateX(3px)}.btn-2:hover{color:var(--c-bg,var(--bg));border-color:var(--c-fg)}}
/* media */
figure.m{position:relative;margin:0;overflow:hidden;aspect-ratio:var(--ar);border-radius:var(--ri);background:var(--c-card,var(--surface))}
figure.m img,figure.m video{width:100%;height:100%;object-fit:cover}
figure.m.shape{border-radius:var(--rshape)}
.art{position:absolute;inset:0}
/* cards */
.cards,.plans,.team,.stats,.steps{display:grid;gap:var(--gap)}
.g2{grid-template-columns:repeat(2,1fr)}.g3{grid-template-columns:repeat(3,1fr)}.g4{grid-template-columns:repeat(4,1fr)}
.card{position:relative;display:block;padding:clamp(22px,2.4vw,36px);border-radius:var(--rc);background:var(--c-card);color:inherit;text-decoration:none;transition:transform .6s var(--ease),box-shadow .6s var(--ease),border-color .4s}
a.card:hover,a.tm:hover{transform:translateY(-4px)}
.card>figure.m{margin:calc(-1 * clamp(22px,2.4vw,36px)) calc(-1 * clamp(22px,2.4vw,36px)) 24px;border-radius:var(--rc) var(--rc) 0 0}
.card p{color:var(--c-mu);margin-top:.6em}
.ic{display:inline-grid;place-items:center;width:52px;height:52px;margin-bottom:22px;border-radius:calc(var(--rc) * .6 + 6px);background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--c-em)}.ic .i{width:24px;height:24px}
.ic-lg{width:64px;height:64px}.ic-lg .i{width:28px;height:28px}
.card-n{display:block;margin-bottom:26px;font:500 .8rem var(--fl);color:var(--c-mu);letter-spacing:.1em}
.more{display:inline-flex;align-items:center;gap:.4em;margin-top:18px;font:600 .82rem var(--fl);color:var(--c-em);text-decoration:none}
/* rows (numbered list, hover list, agenda) */
.rows{border-top:1px solid var(--c-line)}
.row{position:relative;display:grid;grid-template-columns:70px minmax(0,1.1fr) minmax(0,1fr) 40px;gap:24px;align-items:center;padding:clamp(22px,2.6vw,38px) 0;border-bottom:1px solid var(--c-line);color:inherit;text-decoration:none;transition:padding .5s var(--ease),color .3s}
.row-n{font:500 .8rem var(--fl);color:var(--c-mu);letter-spacing:.1em}.row-d{margin:0;color:var(--c-mu)}.row-go{justify-self:end;opacity:.5;transition:transform .5s var(--ease),opacity .3s}
.row-t{font-size:calc(clamp(1.5rem,2.6vw,2.5rem) * var(--ts3))}
@media (hover:hover){a.row:hover .row-go,.row:hover .row-go{opacity:1;transform:rotate(45deg)}.hover-list .row:hover{padding-left:16px}}
.hover-img{position:fixed;left:0;top:0;z-index:40;width:clamp(200px,20vw,300px);aspect-ratio:4/5;border-radius:var(--ri);overflow:hidden;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.8);transition:opacity .35s,transform .45s var(--ease)}
.hover-img.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.hover-img img{width:100%;height:100%;object-fit:cover}
/* hero */
.hero{min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding-block:clamp(110px,14vh,160px) clamp(60px,9vh,110px);overflow:hidden}
.hero .eyebrow{margin-bottom:clamp(18px,2.4vw,32px)}
.hero .lead{margin-top:clamp(20px,2.6vw,34px);font-size:1.12em}
.h1 .hl{display:inline}
.h1 em.hl{display:block}
.rot-line{margin:clamp(16px,2vw,24px) 0 0;font:400 clamp(1.1rem,1.8vw,1.6rem)/1.3 var(--fd);color:var(--c-em)}
.rot{position:relative;display:inline-grid}.rot>span{grid-area:1/1;opacity:0;transform:translateY(60%);transition:opacity .6s,transform .8s var(--ease)}
.rot>span.is-on{opacity:1;transform:none}.rot>span.is-out{opacity:0;transform:translateY(-60%)}
.v-fullbleed{justify-content:flex-end;color:#fff;--c-fg:#fff;--c-mu:rgba(255,255,255,.78);--c-line2:rgba(255,255,255,.4);--c-em:var(--em-d)}
.hero-bg{position:absolute;inset:0;z-index:0}.hero-bg figure.m{height:100%;aspect-ratio:auto;border-radius:0}
.hero-bg img,.hero-bg video{transform:scale(1.08)}
.hero-shade{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.35),transparent 30%,transparent 45%,rgba(0,0,0,.72))}
.hero-in{position:relative;z-index:2}
.cue{position:absolute;z-index:3;left:50%;bottom:26px;width:1px;height:56px;background:color-mix(in srgb,currentColor 25%,transparent);overflow:hidden}
.cue span{position:absolute;inset:0;background:currentColor;animation:cue 2.2s var(--ease-io) infinite}
@keyframes cue{0%{transform:translateY(-100%)}60%,100%{transform:translateY(100%)}}
.hero-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(32px,6vw,100px);align-items:center}
.hero-media{position:relative}.hero-mini{position:absolute;left:-12%;bottom:8%;width:38%;border:6px solid var(--c-bg);box-shadow:0 30px 60px -30px rgba(0,0,0,.45)}
.v-split .h1{font-size:calc(clamp(2.8rem,6.4vw,7rem) * var(--ts))}
.hero-type .h1{font-size:calc(clamp(3.4rem,12.5vw,13.5rem) * var(--ts));line-height:.86}
.hero-row{display:grid;grid-template-columns:1fr auto;gap:30px;align-items:end;margin-top:clamp(28px,4vw,56px)}.hero-row .btns,.hero-row .lead{margin:0}.hero-row .rot-line{grid-column:1/-1;margin:0}
.hero-strip{margin-top:clamp(40px,6vw,80px)}.hero-strip figure.m{border-radius:var(--ri)}
.hero-mq{margin-top:clamp(30px,4vw,60px)}
.v-centered,.v-collage{text-align:center}.hero-c{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center}.hero-c .lead{margin-inline:auto}.hero-c .eyebrow{justify-content:center}
.hero-c .h1{font-size:calc(clamp(2.8rem,7.4vw,7.6rem) * var(--ts))}
.hero-frame{position:relative;z-index:2;margin-top:clamp(40px,6vw,80px);perspective:1400px}.hero-frame figure.m{border-radius:calc(var(--rc) + 4px);box-shadow:0 40px 120px -40px rgba(0,0,0,.5);transform-origin:50% 0}
.hero-glow{position:absolute;left:50%;top:-10%;width:min(1100px,120vw);aspect-ratio:1;transform:translateX(-50%);background:radial-gradient(closest-side,color-mix(in srgb,var(--accent) 34%,transparent),transparent);pointer-events:none;z-index:0}
.v-collage{min-height:100svh}.collage{position:absolute;inset:0;z-index:0;pointer-events:none}
.cl{position:absolute;width:clamp(120px,17vw,260px)}.cl figure.m{border-radius:var(--ri);box-shadow:0 30px 70px -30px rgba(0,0,0,.45)}
.cl-0{left:4%;top:14%}.cl-1{right:6%;top:10%;width:clamp(100px,13vw,200px)}.cl-2{left:10%;bottom:8%;width:clamp(100px,12vw,190px)}.cl-3{right:4%;bottom:12%}.cl-4{left:38%;top:4%;width:clamp(80px,9vw,150px)}.cl-5{right:34%;bottom:2%;width:clamp(80px,9vw,140px)}
.v-collage .hero-c{padding:clamp(20px,4vw,50px);}
/* about */
.ab-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(36px,7vw,120px);align-items:center}
.ab-media{position:relative}.ab-mini{position:absolute;right:-10%;bottom:-8%;width:42%;border:6px solid var(--c-bg)}
.ticks{list-style:none;margin:28px 0 0;padding:0;display:grid;gap:14px}.ticks li{display:flex;gap:12px;align-items:flex-start}.ticks .i{color:var(--c-em);margin-top:.3em}
.ticks b{font-weight:600}
.statement{font-size:calc(clamp(2rem,4.6vw,4.4rem) * var(--ts));line-height:1.08;margin:0 0 clamp(26px,4vw,50px)}
.cols-text{columns:2 320px;column-gap:48px;max-width:none}
.cols2{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(36px,6vw,100px)}.cols2-h{position:sticky;top:110px;align-self:start}
.bq{font-size:calc(clamp(1.6rem,3.4vw,3rem) * var(--ts));line-height:1.2;margin:0 auto}.bq p{margin:0}
.qmark{width:48px;height:48px;margin:0 auto 20px;color:var(--c-em);stroke-width:1.2}
.cite{margin-top:26px;font:500 .9rem var(--fl);letter-spacing:.12em;text-transform:uppercase;color:var(--c-mu)}.cite em{font-style:normal;color:var(--c-em)}
/* features */
.bento{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(200px,auto);gap:var(--gap)}
.bento .bt{display:flex;flex-direction:column;overflow:hidden}.bento .bt>figure.m{margin-bottom:20px}
.bento .bt-0{grid-column:span 2;grid-row:span 2}.bento .bt-1{grid-column:span 2}.bento .bt-4{grid-column:span 2}
.bento.n3 .bt-2{grid-column:span 2}.bento.n2 .bt-1{grid-column:span 2;grid-row:span 2}
.icons-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:var(--gap);text-align:center}.icons-row .ic{margin-inline:auto}.icons-row p{color:var(--c-mu);margin-top:.5em}
/* stats */
.stat{padding:clamp(16px,2vw,28px) 0;border-top:1px solid var(--c-line)}
.num{margin:0;font-size:calc(clamp(2.8rem,6vw,5.6rem) * var(--ts));line-height:1;color:var(--c-fg)}.suf{color:var(--c-em)}
.stat-l{margin:14px 0 0;font:500 .78rem/1.4 var(--fl);letter-spacing:.14em;text-transform:uppercase;color:var(--c-mu)}.stat-d{color:var(--c-mu);font-size:.92em;margin-top:8px}
.stats-big .stat{display:grid;grid-template-columns:1fr 1fr;align-items:end;gap:20px}.stats-big .num{font-size:calc(clamp(3.6rem,11vw,11rem) * var(--ts))}
/* work */
.w-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(24px,4vw,64px) var(--gap)}
.w-grid .w-card:nth-child(even){margin-top:clamp(40px,10vw,160px)}
.w-card{display:block;color:inherit;text-decoration:none}.w-card figure.m img{transition:transform 1.2s var(--ease)}
@media (hover:hover){.w-card:hover figure.m img{transform:scale(1.05)}}
.w-meta{display:flex;justify-content:space-between;align-items:center;margin:18px 0 8px;font:500 .74rem var(--fl);letter-spacing:.16em;text-transform:uppercase;color:var(--c-mu)}
.w-card p{color:var(--c-mu);margin-top:.5em}
.hs{overflow-x:auto;scrollbar-width:none;scroll-snap-type:x mandatory;padding-inline:var(--pad)}.hs::-webkit-scrollbar{display:none}
.hs-track{display:flex;gap:var(--gap);width:max-content}.hs-card{width:clamp(280px,42vw,640px);scroll-snap-align:start}
.hs.is-pinned{overflow:visible}
.stack{display:grid;gap:30px}.stk{position:sticky;top:calc(90px + var(--i) * 18px);display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(24px,4vw,56px);align-items:center;padding:clamp(16px,2vw,24px);box-shadow:0 -20px 60px -30px rgba(0,0,0,.35)}
.stk>figure.m{margin:0;border-radius:calc(var(--rc) * .7)}.stk-n{font:500 .78rem var(--fl);letter-spacing:.16em;text-transform:uppercase;color:var(--c-mu)}.stk .h3{font-size:calc(clamp(1.6rem,3vw,2.8rem) * var(--ts3));margin:14px 0}
/* gallery */
.g-it{display:block;padding:0;border:0;background:none;cursor:zoom-in;width:100%}.g-it[disabled]{cursor:default}
.g-it figure.m img{transition:transform 1s var(--ease)}@media (hover:hover){.g-it:hover figure.m img{transform:scale(1.06)}}
.masonry{columns:3 260px;column-gap:var(--gap)}.masonry .g-it{margin-bottom:var(--gap);break-inside:avoid}
.g-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:var(--gap)}
.gal .mq{margin-top:var(--gap)}
/* marquee */
.mq{overflow:hidden;display:flex;user-select:none}
.mq-track{display:flex;width:max-content;animation:mq var(--mq-dur,40s) linear infinite}.mq-rev .mq-track{animation-direction:reverse}
.mq-set{display:flex;align-items:center;flex:none}
@keyframes mq{to{transform:translateX(-50%)}}
@media (hover:hover){.mq-img:hover .mq-track,.mq-logos:hover .mq-track{animation-play-state:paused}}
.mq-img .g-it{width:clamp(200px,22vw,320px);margin-right:var(--gap)}
.mq-w{font:var(--dw) calc(clamp(2rem,5vw,4.6rem) * var(--ts))/1.1 var(--fd);text-transform:var(--dcase);letter-spacing:var(--dls);white-space:nowrap}
.mq-sep{margin:0 clamp(18px,3vw,44px);color:var(--c-em);font-size:clamp(1.2rem,2.4vw,2rem)}
.ribbon{padding-block:clamp(18px,2.4vw,30px)}
.mq-outline .mq-w{color:transparent;-webkit-text-stroke:1.2px var(--c-fg)}
.mq-tape{transform:rotate(-2deg);margin-inline:-2%;padding-block:12px;background:var(--c-bg)}
.mq-giant .mq-w{font-size:calc(clamp(4rem,14vw,14rem) * var(--ts))}.cta-mq{display:block;color:inherit;text-decoration:none}
@media (hover:hover){.cta-mq:hover .mq-w{color:var(--c-em)}}
.mq-logos .lg{margin-right:clamp(40px,6vw,90px)}
.lg{display:grid;place-items:center;min-height:60px;color:var(--c-mu);text-decoration:none}.lg img{max-height:46px;width:auto;filter:grayscale(1);opacity:.7;transition:filter .4s,opacity .4s}
@media (hover:hover){a.lg:hover img{filter:none;opacity:1}}
.wm{font:600 clamp(1.1rem,1.8vw,1.5rem) var(--fd);letter-spacing:.02em;white-space:nowrap}
.lg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));border-top:1px solid var(--c-line);border-left:1px solid var(--c-line)}.lg-grid .lg{padding:30px;border-right:1px solid var(--c-line);border-bottom:1px solid var(--c-line)}
/* products */
.p-card{padding:0;overflow:hidden;display:flex;flex-direction:column}.p-card>figure.m{margin:0;border-radius:0}.p-c{padding:22px 24px 26px;display:flex;flex-direction:column;flex:1}
.p-tag{position:absolute;left:16px;top:16px;z-index:2}.p-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:20px}
.mlist{display:grid;grid-template-columns:repeat(2,1fr);gap:8px clamp(30px,5vw,80px);max-width:1100px;margin-inline:auto}
.mi{display:flex;gap:18px;align-items:flex-start;padding:18px 0;border-bottom:1px dashed var(--c-line2)}.mi-img{width:72px;flex:none;border-radius:calc(var(--ri) * .6)}
.mi-c{flex:1;min-width:0}.mi-h{display:flex;align-items:baseline;gap:10px;margin:0}.mi-t{font:var(--dw) calc(1.25rem * var(--ts3)) var(--fd);text-transform:var(--dcase)}.mi-dots{flex:1;border-bottom:1px dotted var(--c-line2);transform:translateY(-4px)}.mi-p{font:600 1rem var(--fl);color:var(--c-em)}.mi-d{margin:6px 0 0;color:var(--c-mu);font-size:.94em}
.pf{display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,7vw,120px);align-items:center;margin-bottom:clamp(60px,9vw,140px)}.pf:last-of-type{margin-bottom:0}
.pf-r .pf-m{order:2}.pf-t{margin:16px 0 20px}.pf .price{margin:22px 0}
/* pricing */
.plans{align-items:stretch}.plan{display:flex;flex-direction:column;border:1px solid var(--c-line)}.plans .plan.is-feat,.plans .card.plan.is-feat{background:var(--dark);color:var(--dark-text);--c-fg:var(--dark-text);--c-mu:color-mix(in srgb,var(--dark-text) 64%,var(--dark));--c-line2:color-mix(in srgb,var(--dark-text) 30%,transparent);--c-em:var(--em-d)}
.plan-tag{position:absolute;right:20px;top:20px}.plan-p{display:flex;align-items:baseline;gap:8px;margin:18px 0 24px}.plan-v{font:var(--dw) calc(clamp(2.4rem,4vw,3.4rem) * var(--ts))/1 var(--fd)}.plan-m{color:var(--c-mu)}
.plan-f{list-style:none;padding:0;margin:0 0 28px;display:grid;gap:10px;flex:1}.plan-f li{display:flex;gap:10px}.plan-f .i{color:var(--c-em);margin-top:.3em}
.plan-rows .row{grid-template-columns:1fr 1.4fr auto}
/* testimonials */
.slider{position:relative;max-width:1000px;margin-inline:auto;text-align:center}
.sl-track{display:grid}.sl{grid-area:1/1;margin:0;opacity:0;visibility:hidden;transform:translateY(20px);transition:opacity .8s,transform .9s var(--ease),visibility 0s .8s}.sl.is-on{opacity:1;visibility:visible;transform:none;transition:opacity .8s,transform .9s var(--ease),visibility 0s}
.tq-t{font:400 calc(clamp(1.3rem,2.4vw,2rem) * var(--ts3))/1.4 var(--fd);margin:0}.slider .qmark{margin-bottom:26px}
.who{display:inline-flex;align-items:center;gap:14px;margin-top:30px;text-align:left}.who small{display:block;color:var(--c-mu);font-size:.85em}
.av{width:52px;height:52px;border-radius:50%;flex:none;aspect-ratio:1}.av-i{display:grid;place-items:center;background:var(--accent);color:var(--on-accent);font:600 .9rem var(--fl)}
.sl-nav{display:flex;align-items:center;justify-content:center;gap:18px;margin-top:36px}.sl-b{width:46px;height:46px;border-radius:50%;border:1px solid var(--c-line2);background:transparent;display:grid;place-items:center;cursor:pointer}
.sl-dots{display:flex;gap:8px}.sl-dots i{width:7px;height:7px;border-radius:9px;background:var(--c-line2);transition:width .4s var(--ease),background .4s}.sl-dots i.is-on{width:26px;background:var(--c-em)}
.t-grid{columns:3 280px;column-gap:var(--gap)}.tq{break-inside:avoid;margin:0 0 var(--gap)}.tq .qmark{margin:0 0 14px;width:32px;height:32px}.tq blockquote{margin:0}
/* team */
.tm{display:block;color:inherit;text-decoration:none}.tm figure.m{margin-bottom:16px}.tm-r{margin:6px 0 0;color:var(--c-mu);font-size:.92em}.tm-b{color:var(--c-mu);font-size:.9em;margin-top:8px}
.tm figure.m img{filter:grayscale(.2);transition:filter .6s,transform 1s var(--ease)}@media (hover:hover){.tm:hover figure.m img{filter:none;transform:scale(1.04)}}
/* timeline */
.tl{list-style:none;margin:0;padding:0;position:relative;max-width:980px}
.tl::before{content:"";position:absolute;left:clamp(90px,14vw,170px);top:8px;bottom:8px;width:1px;background:var(--c-line2)}
.tl-i{display:grid;grid-template-columns:clamp(90px,14vw,170px) 1fr;gap:clamp(24px,4vw,60px);padding:0 0 clamp(30px,4vw,56px)}
.tl-y{font:var(--dw) calc(clamp(1.4rem,2.6vw,2.4rem) * var(--ts3))/1 var(--fd);color:var(--c-em);text-align:right;padding-right:clamp(12px,2vw,30px)}
.tl-c{position:relative}.tl-c::before{content:"";position:absolute;left:calc(-1 * clamp(24px,4vw,60px) - 5px);top:.5em;width:9px;height:9px;border-radius:50%;background:var(--c-em)}
.tl-c p{color:var(--c-mu);margin-top:8px}
.steps{list-style:none;margin:0;padding:0}.step-n{display:block;font:var(--dw) calc(clamp(2.6rem,4vw,3.6rem) * var(--ts))/1 var(--fd);color:var(--c-em);margin-bottom:26px}
.agenda .row{grid-template-columns:170px 1fr 40px}.ag-d{font:600 .86rem var(--fl);letter-spacing:.08em;color:var(--c-em);text-transform:uppercase}.ag-c p{color:var(--c-mu);margin:6px 0 0}
/* faq */
.faq-wrap{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(30px,6vw,100px);align-items:start}.faq-wrap .sh{position:sticky;top:110px}
.faq{border-top:1px solid var(--c-line)}.qa{border-bottom:1px solid var(--c-line)}
.qa summary{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:24px 0;cursor:pointer;list-style:none;font:500 calc(1.12rem * var(--ts3))/1.35 var(--fl)}.qa summary::-webkit-details-marker{display:none}
.pm{position:relative;width:16px;height:16px;flex:none}.pm::before,.pm::after{content:"";position:absolute;left:0;top:50%;width:100%;height:1.5px;background:currentColor;transition:transform .4s var(--ease)}.pm::after{transform:rotate(90deg)}.qa[open] .pm::after{transform:none}
.qa-a{padding:0 0 26px;color:var(--c-mu);max-width:62ch}
.faq-cols{display:grid;grid-template-columns:repeat(2,1fr);gap:40px clamp(30px,5vw,80px)}.fq p{color:var(--c-mu);margin-top:10px}
/* cta */
.cta-big .cta-t{font-size:calc(clamp(3rem,9vw,9rem) * var(--ts))}.cta-big .lead{margin:24px auto 0}
.banner{position:relative;border-radius:calc(var(--rc) + 6px);overflow:hidden;color:#fff;--c-fg:#fff;--c-mu:rgba(255,255,255,.8);--c-line2:rgba(255,255,255,.4)}
.banner>figure.m{position:absolute;inset:0;aspect-ratio:auto;border-radius:0}.banner::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.7),rgba(0,0,0,.2))}
.banner-c{position:relative;z-index:2;padding:clamp(40px,8vw,120px) clamp(24px,6vw,90px);max-width:820px}
/* video */
.vid{position:relative;border-radius:calc(var(--rc) + 4px);overflow:hidden}.vid figure.m{border-radius:0}.vid iframe,.vid video{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}
.vid-play{position:absolute;left:50%;top:50%;width:clamp(72px,9vw,110px);height:clamp(72px,9vw,110px);transform:translate(-50%,-50%);border-radius:50%;border:0;background:var(--accent);color:var(--on-accent);display:grid;place-items:center;cursor:pointer;transition:transform .5s var(--ease)}.vid-play .i{width:32%;height:32%;fill:currentColor}
@media (hover:hover){.vid-play:hover{transform:translate(-50%,-50%) scale(1.08)}}
/* contact */
.ct-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,6vw,100px);align-items:start}
.clinks{display:grid;border-top:1px solid var(--c-line);margin-top:10px}
.clinks>*{display:flex;align-items:center;gap:16px;padding:18px 0;border-bottom:1px solid var(--c-line);color:inherit;text-decoration:none}
.clinks .ic{width:44px;height:44px;margin:0}.clinks b{display:block;font:600 .74rem var(--fl);letter-spacing:.16em;text-transform:uppercase;color:var(--c-mu)}.clinks small{font-size:1em}
.clinks>a>.i:last-child{margin-left:auto;opacity:.5;transition:transform .4s var(--ease)}@media (hover:hover){.clinks>a:hover>.i:last-child{opacity:1;transform:rotate(45deg)}}
.soc{list-style:none;display:flex;flex-wrap:wrap;gap:10px;padding:0;margin:24px 0 0}.soc a{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--c-line2,currentColor);border-radius:50%;color:inherit;transition:background .3s,color .3s,transform .4s var(--ease)}
@media (hover:hover){.soc a:hover{background:var(--c-fg,var(--text));color:var(--c-bg,var(--bg));transform:translateY(-3px)}}
.center .soc,.ct-c .soc{justify-content:center}
.big-mail{display:inline-block;margin:10px 0 30px;font:var(--dw) calc(clamp(1.8rem,5.4vw,5rem) * var(--ts))/1.1 var(--fd);color:var(--c-fg);text-decoration:none;background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;transition:background-size .7s var(--ease);word-break:break-word}
@media (hover:hover){.big-mail:hover{background-size:100% 2px}}
.ct-c .clinks{max-width:640px;margin:20px auto 0;text-align:left}
.cc{text-align:center;display:block}.cc .ic{margin-inline:auto}
.form{display:grid;gap:18px}.fg{display:grid;gap:8px}.fg label{font:600 .74rem var(--fl);letter-spacing:.14em;text-transform:uppercase;color:var(--c-mu)}
.fg input,.fg textarea,.nl input{width:100%;min-height:52px;padding:14px 16px;border-radius:calc(var(--rc) * .5 + 4px);border:1px solid var(--c-line2);background:transparent;color:var(--c-fg);font-size:16px}
.fg input:focus,.fg textarea:focus,.nl input:focus{outline:none;border-color:var(--c-em)}
.form-note{margin:0;min-height:1.4em;color:var(--c-mu);font-size:.9em}
.nl{display:flex;gap:10px;max-width:560px;margin:10px auto 0}.nl input{flex:1}
.map-w{position:relative;aspect-ratio:21/9;border-radius:var(--rc);overflow:hidden;background:var(--c-card)}.map-w iframe{width:100%;height:100%;border:0;filter:grayscale(.3)}
.map-a{display:flex;gap:10px;align-items:center;margin-top:18px;color:var(--c-mu)}
/* header */
.top{position:fixed;inset:0 0 auto;z-index:60;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;padding:clamp(12px,1.6vw,20px) var(--pad);color:var(--text);transition:transform .6s var(--ease),background-color .4s,color .4s,padding .4s,box-shadow .4s}
html[data-herotone=dark] .top:not(.is-solid){color:#fff}
.top.is-solid{background:color-mix(in srgb,var(--bg) 84%,transparent);-webkit-backdrop-filter:blur(16px) saturate(1.4);backdrop-filter:blur(16px) saturate(1.4);box-shadow:0 1px 0 color-mix(in srgb,var(--text) 10%,transparent);padding-block:10px}
.top.is-hidden{transform:translateY(-110%)}
.burger{justify-self:start;display:inline-flex;align-items:center;gap:12px;padding:10px 0;border:0;background:none;cursor:pointer;color:inherit;font:600 .74rem var(--fl);letter-spacing:.2em;text-transform:uppercase}
.bl{position:relative;display:grid;gap:7px;width:28px}.bl i{display:block;height:1.5px;background:currentColor;transition:transform .5s var(--ease),width .5s var(--ease)}.bl i:last-child{width:65%}
@media (hover:hover){.burger:hover .bl i:last-child{width:100%}}
.menu-open .bl i:first-child{transform:translateY(4.25px) rotate(45deg)}.menu-open .bl i:last-child{width:100%;transform:translateY(-4.25px) rotate(-45deg)}
.brand{justify-self:center;display:flex;align-items:center;color:inherit;text-decoration:none}.logo-t{font:var(--dw) clamp(1.1rem,1.6vw,1.45rem)/1 var(--fd);text-transform:var(--dcase);letter-spacing:var(--dls);white-space:nowrap}
.logo-img{height:clamp(30px,3.4vw,42px);width:auto;max-width:170px;object-fit:contain}
.top-end{justify-self:end;display:flex;align-items:center;gap:clamp(14px,2vw,30px)}
.top-links{display:flex;gap:clamp(14px,1.8vw,28px)}.top-links a{font:500 .84rem var(--fl);text-decoration:none;opacity:.85;background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .5s var(--ease),opacity .3s}.top-links a:hover{opacity:1;background-size:100% 1px}
html[data-logo=left] .top{grid-template-columns:auto 1fr auto}html[data-logo=left] .brand{justify-self:start}
.progress{position:fixed;left:0;top:0;right:0;height:2px;z-index:70;pointer-events:none}.progress span{display:block;height:100%;background:var(--accent);transform:scaleX(0);transform-origin:0 50%}
/* menu (overlay; mn-split, mn-panel, mn-tiles, mn-curtain) */
.menu{position:fixed;inset:0;z-index:55;visibility:hidden;pointer-events:none;color:var(--dark-text);transition:visibility 0s .9s}
.menu.is-open{visibility:visible;pointer-events:auto;transition:visibility 0s}
.menu-bg{position:absolute;inset:0;background:var(--dark);clip-path:inset(0 0 100% 0);transition:clip-path .9s var(--ease-io)}
.menu.is-open .menu-bg{clip-path:inset(0)}
.menu-in{position:relative;height:100%;overflow:auto;display:grid;grid-template-columns:1.3fr .8fr .9fr;gap:clamp(24px,4vw,70px);align-items:center;padding:clamp(100px,14vh,140px) var(--pad) clamp(40px,8vh,80px)}
.menu-nav ol{list-style:none;margin:0;padding:0}
.menu-nav a{display:flex;align-items:baseline;gap:18px;padding:.08em 0;color:inherit;text-decoration:none;overflow:hidden}
.mn-n{font:500 .78rem var(--fl);letter-spacing:.1em;opacity:.5;min-width:2ch}
.mn-l{display:inline-block;font:var(--dw) calc(clamp(2.2rem,5.2vw,5rem) * var(--ts))/1.08 var(--fd);text-transform:var(--dcase);letter-spacing:var(--dls);transform:translateY(110%);transition:transform .9s var(--ease),color .3s}
.menu.is-open .mn-l{transform:none;transition-delay:calc(.25s + var(--mi,0) * .05s)}
@media (hover:hover){.menu-nav a:hover .mn-l{color:var(--em-d);font-style:var(--em-style)}}
.menu-aside{display:grid;gap:10px;align-content:center;opacity:0;transition:opacity .6s .1s}.menu.is-open .menu-aside{opacity:1;transition-delay:.5s}
.menu-aside a{color:inherit;text-decoration:none;opacity:.8}.menu-tag{font:400 1.3rem/1.35 var(--fd);opacity:.9;margin-bottom:10px}.menu-aside .soc{margin-top:14px}.menu-aside .soc a{border-color:color-mix(in srgb,var(--dark-text) 30%,transparent)}
.menu-media{position:relative;aspect-ratio:4/5;border-radius:var(--ri);overflow:hidden;opacity:0;transform:scale(.94);transition:opacity .8s .3s,transform 1.2s .3s var(--ease)}.menu.is-open .menu-media{opacity:1;transform:none}
.menu-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s}.menu-media img.on{opacity:1}
.mn-panel .menu-bg{clip-path:inset(0 100% 0 0);right:auto;width:min(620px,100%)}.mn-panel.is-open .menu-bg{clip-path:inset(0)}
.mn-panel .menu-in{grid-template-columns:1fr;width:min(620px,100%);align-content:center}.mn-panel .menu-media{display:none}.mn-panel::before{content:"";position:absolute;inset:0;background:rgba(0,0,0,.45);opacity:0;transition:opacity .6s}.mn-panel.is-open::before{opacity:1}
.mn-tiles .menu-in{grid-template-columns:1fr;align-content:center}.mn-tiles .menu-media{display:none}
.mn-tiles .menu-nav ol{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr));gap:12px}
.mn-tiles .menu-nav a{flex-direction:column;gap:30px;padding:22px;border-radius:var(--rc);background:color-mix(in srgb,var(--dark-text) 8%,transparent);transition:background .3s,color .3s}
.mn-tiles .mn-l{font-size:calc(clamp(1.6rem,2.8vw,2.4rem) * var(--ts))}
@media (hover:hover){.mn-tiles .menu-nav a:hover{background:var(--accent);color:var(--on-accent)}.mn-tiles .menu-nav a:hover .mn-l{color:inherit}}
.mn-curtain .menu-bg{clip-path:none;transform:translateY(-100%);border-radius:0 0 50% 50%/0 0 12% 12%;transition:transform 1s var(--ease-io),border-radius 1s var(--ease-io)}.mn-curtain.is-open .menu-bg{transform:none;border-radius:0}
.mn-curtain .menu-in{grid-template-columns:1fr;text-align:center;justify-items:center;align-content:center}.mn-curtain .menu-nav a{justify-content:center}.mn-curtain .mn-n{display:none}.mn-curtain .menu-media{display:none}.mn-curtain .menu-aside{justify-items:center;text-align:center}
.menu-open .top{color:var(--dark-text)!important;background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none;backdrop-filter:none}
.menu-open .top-cta{opacity:0;pointer-events:none}
/* tab bar */
.tabbar{display:none}
@media (max-width:1024px){
  body{--tabbar-h:74px}
  .tabbar{position:fixed;z-index:58;left:50%;bottom:calc(10px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:grid;grid-auto-flow:column;grid-auto-columns:1fr;width:min(520px,calc(100% - 20px));padding:6px;border-radius:calc(var(--rc) + 10px);background:color-mix(in srgb,var(--dark) 88%,transparent);color:var(--dark-text);-webkit-backdrop-filter:blur(18px) saturate(1.5);backdrop-filter:blur(18px) saturate(1.5);box-shadow:0 20px 50px -20px rgba(0,0,0,.6);transition:transform .5s var(--ease)}
  .tabbar a{position:relative;z-index:1;display:grid;justify-items:center;gap:3px;padding:8px 2px;color:inherit;text-decoration:none;font:600 .6rem/1 var(--fl);letter-spacing:.06em;text-transform:uppercase;opacity:.7;transition:opacity .3s,color .3s}
  .tabbar a .i{width:20px;height:20px}.tabbar a[aria-current=true]{opacity:1;color:var(--on-accent)}
  .tb-pill{position:absolute;z-index:0;left:6px;top:6px;bottom:6px;width:calc((100% - 12px) / var(--tabs));border-radius:calc(var(--rc) + 4px);background:var(--accent);transform:translateX(calc(var(--ti,0) * 100%));transition:transform .6s var(--ease),opacity .3s}
  .tabbar.no-active .tb-pill{opacity:0}
  .menu-open .tabbar{transform:translate(-50%,140%)}
  .top-links{display:none}
  .foot{padding-bottom:calc(var(--sp) * .6 + 90px)}
  .wa-fab,.to-top{bottom:calc(96px + env(safe-area-inset-bottom,0px))!important}
}
/* footer */
.foot{position:relative;padding-block:var(--sp) calc(var(--sp) * .5);overflow:hidden}
.foot-top{padding-bottom:clamp(40px,6vw,80px);border-bottom:1px solid var(--c-line)}
.foot-big{--fit:calc((min(100vw,var(--maxw)) - 2 * var(--pad)) / (var(--len,8) * .62));margin:0;font-size:min(calc(clamp(3rem,10vw,10rem) * var(--ts)),var(--fit));line-height:.9;overflow-wrap:anywhere}
.foot-tag{margin-top:20px;color:var(--c-mu);max-width:50ch}
.foot-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:40px;padding-block:clamp(40px,5vw,70px)}
.foot-grid a,.foot-grid span{display:block;color:inherit;text-decoration:none;opacity:.8;margin-bottom:8px;overflow-wrap:anywhere}.foot-grid a:hover{opacity:1}
.foot-grid .soc{margin:0}.foot-grid .soc a{display:grid;margin:0;opacity:1}
.foot-h{font:600 .72rem var(--fl);letter-spacing:.2em;text-transform:uppercase;color:var(--c-mu);margin-bottom:16px}
.foot-bot{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding-top:24px;border-top:1px solid var(--c-line);font-size:.84em;color:var(--c-mu)}.foot-bot a{color:inherit;text-decoration:none;display:inline-flex;gap:6px;align-items:center}
/* floating UI */
.wa-fab{position:fixed;right:clamp(14px,2vw,26px);bottom:clamp(14px,2vw,26px);z-index:57;display:grid;place-items:center;width:58px;height:58px;border-radius:50%;background:#25D366;color:#fff;box-shadow:0 14px 34px -10px rgba(0,0,0,.45);transition:transform .5s var(--ease)}
.wa-fab .i{width:28px;height:28px}@media (hover:hover){.wa-fab:hover{transform:scale(1.08)}}
.to-top{position:fixed;left:clamp(14px,2vw,26px);bottom:clamp(14px,2vw,26px);z-index:57;width:48px;height:48px;border-radius:50%;border:1px solid color-mix(in srgb,var(--text) 20%,transparent);background:color-mix(in srgb,var(--bg) 85%,transparent);color:var(--text);display:grid;place-items:center;cursor:pointer;opacity:0;transform:translateY(20px);pointer-events:none;transition:opacity .4s,transform .5s var(--ease);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.to-top.is-on{opacity:1;transform:none;pointer-events:auto}
.ann{position:relative;z-index:61;padding:9px var(--pad);background:var(--accent);color:var(--on-accent);text-align:center;font:500 .82rem/1.4 var(--fl)}.ann a{color:inherit}
html.has-ann .top{top:var(--ann-h,38px)}html.has-ann .top.is-solid{top:0}
.cookie{position:fixed;left:50%;bottom:calc(16px + var(--tabbar-h,0px));z-index:80;transform:translateX(-50%);width:min(560px,calc(100% - 24px));display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:16px 18px;border-radius:var(--rc);background:var(--dark);color:var(--dark-text);box-shadow:0 20px 60px -20px rgba(0,0,0,.6);font-size:.9em}.cookie[hidden]{display:none}.cookie p{margin:0;flex:1 1 260px}.cookie div{display:flex;gap:8px}
.lb{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:clamp(16px,4vw,60px);background:rgba(8,8,10,.94);opacity:0;visibility:hidden;transition:opacity .4s,visibility 0s .4s}.lb.is-open{opacity:1;visibility:visible;transition:opacity .4s,visibility 0s}
.lb img{max-width:100%;max-height:86vh;width:auto;height:auto;border-radius:6px;object-fit:contain}
.lb button{position:absolute;display:grid;place-items:center;width:50px;height:50px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.4);color:#fff;cursor:pointer}.lb-x{right:20px;top:20px}.lb-p{left:20px;top:50%}.lb-n{right:20px;top:50%}
.share{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:28px}.share button{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;border:1px solid var(--c-line2);background:transparent;color:inherit;cursor:pointer;font:500 .82rem var(--fl)}
.cursor{position:fixed;left:0;top:0;z-index:100;pointer-events:none;display:none}
html.has-cursor .cursor{display:block}
.cursor span{position:absolute;left:0;top:0;display:grid;place-items:center;border-radius:50%;transform:translate(-50%,-50%);transition:width .35s var(--ease),height .35s var(--ease),background-color .3s,opacity .3s;font:600 .66rem var(--fl);letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.cur-dot .cursor span{width:10px;height:10px;background:var(--accent)}.cur-dot .cursor.is-hover span{width:46px;height:46px;background:color-mix(in srgb,var(--accent) 30%,transparent)}
.cur-ring .cursor span{width:34px;height:34px;border:1px solid var(--accent)}.cur-ring .cursor.is-hover span{width:64px;height:64px;background:color-mix(in srgb,var(--accent) 16%,transparent)}
.cur-blend .cursor span{width:20px;height:20px;background:#fff;mix-blend-mode:difference}.cur-blend .cursor.is-hover span{width:80px;height:80px}
.cur-label .cursor span{width:12px;height:12px;background:var(--accent);color:transparent}.cur-label .cursor.is-label span{width:86px;height:86px;color:var(--on-accent)}
.cur-label .cursor.is-hover:not(.is-label) span{width:36px;height:36px}
/* splash */
.splash{position:fixed;inset:0;z-index:150;display:grid;place-items:center;background:var(--dark);color:var(--dark-text);pointer-events:none}
.no-splash .splash{display:none}
.sp-logo .sp-in{font:var(--dw) clamp(2rem,6vw,4.6rem)/1 var(--fd);text-transform:var(--dcase);letter-spacing:var(--dls);animation:spIn 1s var(--ease) both}
.sp-logo .sp-in img{max-height:110px;width:auto}
.sp-counter .sp-in{position:absolute;left:var(--pad);bottom:clamp(20px,5vh,60px);font:var(--dw) clamp(4rem,16vw,14rem)/.9 var(--fd)}
.sp-curtain .sp-in{font:var(--dw) clamp(1.6rem,4vw,3rem) var(--fd);animation:spIn .8s var(--ease) both}
.splash{animation:spOut .9s var(--ease-io) 1.15s both}
.sp-curtain{animation-name:spUp}
@keyframes spIn{from{opacity:0;transform:translateY(24px)}}
@keyframes spOut{to{opacity:0;visibility:hidden}}
@keyframes spUp{to{transform:translateY(-100%)}}
/* grain */
.grain::after{content:"";position:fixed;inset:-50%;z-index:120;pointer-events:none;opacity:.06;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");animation:grain 1s steps(4) infinite}
@keyframes grain{25%{transform:translate(-4%,3%)}50%{transform:translate(3%,-5%)}75%{transform:translate(-2%,-3%)}}
/* ============ design options ============ */
/* headings */
.hd-numbered .sh:not(.sh-c){grid-template-columns:minmax(120px,.35fr) 1fr;max-width:none;column-gap:clamp(24px,5vw,80px);align-items:start}
.hd-numbered .sh:not(.sh-c)>*{grid-column:2}.hd-numbered .sh:not(.sh-c) .eyebrow{grid-column:1;grid-row:1/span 3;padding-top:.8em;border-top:1px solid var(--c-line2)}
.hd-numbered .sh-n{display:inline;color:var(--c-em)}
.hd-pill .sh .eyebrow,.hd-pill .hero-eb{display:inline-flex;width:fit-content;padding:.6em 1.1em;border:1px solid var(--c-line2);border-radius:999px;letter-spacing:.12em}
.hd-pill .sh .eyebrow::before,.hd-pill .hero-eb::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--c-em);box-shadow:0 0 12px var(--c-em)}
.hd-stamp .sh .eyebrow,.hd-stamp .hero-eb{display:inline-flex;width:fit-content;padding:.55em .9em;background:var(--c-fg);color:var(--c-bg);letter-spacing:.14em}
.hd-stamp .sh-n{display:inline;opacity:.6}
.hd-giant .sh .h2{font-size:calc(clamp(3rem,9vw,9.5rem) * var(--ts));line-height:.88}
.hd-giant .sh{max-width:none}.hd-giant .sh .eyebrow::after{content:"";flex:1;height:1px;background:var(--c-line2)}
.hd-editorial .sh .eyebrow::before,.hd-editorial .hero-eb::before{content:"";width:clamp(28px,4vw,56px);height:1px;background:currentColor}
.hd-editorial .sh-c .eyebrow::after{content:"";width:clamp(28px,4vw,56px);height:1px;background:currentColor}
.hd-rule .sh{padding-top:18px;border-top:3px double var(--c-line2);max-width:none}.hd-rule .sh .eyebrow{color:var(--c-em);font-weight:700}
/* buttons */
.bt-pill{--rb:999px}.bt-square{--rb:0px}.bt-soft{--rb:12px}
.bt-shadow .btn{border:2px solid var(--c-fg,var(--text));border-radius:var(--rb);box-shadow:4px 4px 0 var(--c-fg,var(--text))}.bt-shadow .btn::before{display:none}
@media (hover:hover){.bt-shadow .btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--c-fg,var(--text))}.bt-shadow .btn:active{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--c-fg,var(--text))}.bt-shadow .btn-2:hover{color:var(--c-fg);background:var(--c-card)}}
.bt-underline .btn{min-height:auto;padding:.6em 0;border:0;border-radius:0;background:linear-gradient(currentColor,currentColor) 0 100%/100% 1.5px no-repeat;color:var(--c-fg,var(--text))}.bt-underline .btn::before{display:none}.bt-underline .btns{gap:34px}
.bt-underline .btn-1{color:var(--c-em)}@media (hover:hover){.bt-underline .btn:hover{background-size:0 1.5px;background-position:100% 100%}.bt-underline .btn-2:hover{color:var(--c-fg)}}
.bt-underline .top-cta,.bt-underline .p-foot .btn,.bt-underline .vid-play{padding-inline:0}
.bt-glow .btn-1{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 60%,transparent),0 10px 40px -8px color-mix(in srgb,var(--accent) 70%,transparent)}
.bt-glow .btn-2{-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);background:color-mix(in srgb,var(--c-fg,#fff) 6%,transparent)}
/* cards */
.cd-border .card{background:transparent;border:1px solid var(--c-line2)}
.cd-shadow .card{box-shadow:0 1px 2px rgba(0,0,0,.04),0 18px 50px -24px rgba(0,0,0,.22)}
.cd-glass .card{background:color-mix(in srgb,var(--c-fg) 5%,transparent);border:1px solid color-mix(in srgb,var(--c-fg) 12%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.cd-offset .card{border:2px solid var(--c-fg);box-shadow:6px 6px 0 var(--c-fg)}
@media (hover:hover){.cd-offset a.card:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--c-fg)}}
.cd-flat .card{background:var(--c-card)}
[data-spot]{--mx:50%;--my:50%}
.spot [data-spot]::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(400px circle at var(--mx) var(--my),color-mix(in srgb,var(--accent) 16%,transparent),transparent 45%);opacity:0;transition:opacity .4s}
@media (hover:hover){.spot [data-spot]:hover::after{opacity:1}}
/* image shapes */
.im-rect{--rshape:var(--ri)}.im-rounded{--rshape:calc(var(--ri) + 18px)}.im-arch{--rshape:999px 999px var(--ri) var(--ri)}.im-circle{--rshape:50%}.im-circle .shape{aspect-ratio:1}.im-blob{--rshape:58% 42% 52% 48%/48% 56% 44% 52%}
/* spacing */
.sp-compact{--sp:clamp(56px,7vw,100px)}.sp-normal{--sp:clamp(80px,10vw,150px)}.sp-airy{--sp:clamp(100px,13vw,200px)}
/* ============ motion states (only when the runtime is running) ============ */
.anim [data-a="up"],.anim [data-a="stagger"]>*{opacity:0}
html.anim [data-a].in,html.anim [data-a="stagger"].in>*{opacity:1;transform:none;filter:none;clip-path:inset(0)}
.anim[data-rv=up] [data-a="up"],.anim[data-rv=up] [data-a="stagger"]>*{transform:translateY(40px)}
.anim[data-rv=blur] [data-a="up"],.anim[data-rv=blur] [data-a="stagger"]>*{transform:translateY(20px);filter:blur(12px)}
.anim[data-rv=scale] [data-a="up"],.anim[data-rv=scale] [data-a="stagger"]>*{transform:scale(.92)}
.anim[data-rv=pop] [data-a="up"],.anim[data-rv=pop] [data-a="stagger"]>*{transform:translateY(40px) rotate(-3deg) scale(.9)}
.anim[data-rv=slide] [data-a="up"],.anim[data-rv=slide] [data-a="stagger"]>*{transform:translateX(-50px)}
.anim[data-rv=step] [data-a="up"],.anim[data-rv=step] [data-a="stagger"]>*{transform:translateY(30px)}
.anim [data-a="up"],.anim [data-a="stagger"]>*{transition:opacity var(--rv-d) var(--rv-e),transform var(--rv-d) var(--rv-e),filter var(--rv-d) var(--rv-e);transition-delay:calc(var(--si,0) * var(--stag))}
.anim[data-rv=step] [data-a="up"],.anim[data-rv=step] [data-a="stagger"]>*{transition-timing-function:steps(4,end)}
.anim[data-rv=pop] [data-a="up"],.anim[data-rv=pop] [data-a="stagger"]>*{transition-timing-function:cubic-bezier(.34,1.56,.64,1)}
/* images */
.anim[data-im=clip] [data-a="img"]{clip-path:inset(100% 0 0 0)}.anim[data-im=curtain] [data-a="img"]{clip-path:inset(0 100% 0 0)}
.anim[data-im=clip] [data-a="img"],.anim[data-im=curtain] [data-a="img"]{transition:clip-path 1.4s var(--ease-io)}
.anim[data-im=clip] [data-a="img"] img,.anim[data-im=curtain] [data-a="img"] img{transform:scale(1.25);transition:transform 2s var(--ease)}
.anim[data-im=clip] [data-a="img"].in img,.anim[data-im=curtain] [data-a="img"].in img{transform:scale(1)}
.anim[data-im=scale] [data-a="img"]{transform:scale(.86);opacity:0;transition:transform 1.4s var(--ease),opacity 1s}
.anim[data-im=fade] [data-a="img"]{opacity:0;transition:opacity 1.2s}
.anim[data-im=pop] [data-a="img"]{transform:translateY(50px) rotate(4deg) scale(.9);opacity:0;transition:transform .9s cubic-bezier(.34,1.56,.64,1),opacity .6s}
/* headings */
.w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em}.wi{display:inline-block;will-change:transform}
.anim[data-hd=rise] [data-a="head"]:not(.in) .wi{transform:translateY(110%)}
.anim[data-hd=blur] [data-a="head"]:not(.in) .wi{opacity:0;filter:blur(14px);transform:translateY(.2em)}
.anim[data-hd=pop] [data-a="head"]:not(.in) .wi{transform:translateY(80%) rotate(8deg) scale(.6);opacity:0}
.anim[data-hd=fade] [data-a="head"]:not(.in) .wi{opacity:0}
.anim[data-hd=wipe] [data-a="head"]{clip-path:inset(0 100% 0 0);transition:clip-path 1.3s var(--ease-io)}.anim[data-hd=wipe] [data-a="head"].in{clip-path:inset(0 -5% 0 0)}
.anim [data-a="head"] .wi{transition:transform var(--hd-d) var(--hd-e),opacity var(--hd-d),filter var(--hd-d);transition-delay:calc(var(--wi,0) * var(--hd-s))}
.anim[data-hd=pop] [data-a="head"] .wi{transition-timing-function:cubic-bezier(.34,1.56,.64,1)}
[data-words] .wi{transition:color .3s}.anim [data-words] .wi{color:color-mix(in srgb,currentColor 22%,transparent)}.anim [data-words] .wi.lit{color:inherit}
.anim [data-words] em .wi.lit{color:var(--c-em)}
/* hero text */
.anim .hero-t:not(.go) .hl{opacity:0}
.hero-t .ch{display:inline-block;white-space:pre}
.anim [data-hero=rise].go .wi,.anim [data-hero=wave].go .ch{animation:hRise 1.2s var(--ease) both;animation-delay:calc(var(--wi,0) * .08s + .1s)}
.anim [data-hero=wave].go .ch{animation:hWave 1s cubic-bezier(.34,1.56,.64,1) both;animation-delay:calc(var(--ci,0) * .03s)}
.anim [data-hero=blur].go .wi{animation:hBlur 1.4s var(--ease) both;animation-delay:calc(var(--wi,0) * .09s)}
.anim [data-hero=fade].go .hl{animation:hFade 1.6s var(--ease) both}.anim [data-hero=fade].go .hl+.hl{animation-delay:.25s}
@keyframes hRise{from{transform:translateY(110%)}}@keyframes hWave{from{transform:translateY(.8em) scale(.4);opacity:0}}@keyframes hBlur{from{opacity:0;filter:blur(18px);transform:scale(1.1)}}@keyframes hFade{from{opacity:0;transform:translateY(30px)}}
.hero-t.glitching .hl{position:relative}.hero-t.glitching span.hl{display:inline-block}
.hero-t.glitching .hl::before,.hero-t.glitching .hl::after{content:attr(data-text);position:absolute;left:0;top:0;width:100%;overflow:hidden;pointer-events:none}
.hero-t.glitching .hl::before{color:var(--accent);animation:gl1 3.2s steps(2,end) infinite;clip-path:inset(0 0 55% 0)}
.hero-t.glitching .hl::after{color:var(--accent-2);animation:gl2 2.7s steps(2,end) infinite;clip-path:inset(55% 0 0 0)}
@keyframes gl1{0%,88%,100%{transform:none;opacity:0}90%{transform:translate(-4px,-2px);opacity:.9}94%{transform:translate(3px,1px);opacity:.9}}
@keyframes gl2{0%,84%,100%{transform:none;opacity:0}86%{transform:translate(4px,2px);opacity:.9}91%{transform:translate(-3px,0);opacity:.9}}
.tw-caret{display:inline-block;width:.06em;height:.85em;margin-left:.05em;background:currentColor;vertical-align:baseline;animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.mq-track,.cue span,.grain::after{animation:none}.splash{display:none}}
/* ============ responsive ============ */
@media (max-width:1100px){.g4{grid-template-columns:repeat(2,1fr)}.bento{grid-template-columns:repeat(2,1fr)}.bento .bt-0{grid-column:span 2;grid-row:auto}}
@media (max-width:900px){
  .hero-grid,.ab-grid,.cols2,.ct-grid,.faq-wrap,.pf,.stk{grid-template-columns:1fr}
  .pf-r .pf-m{order:0}.cols2-h,.faq-wrap .sh{position:static}
  .hero-mini{left:auto;right:-4%;width:34%}.ab-mini{right:-2%}
  .g3{grid-template-columns:repeat(2,1fr)}
  .menu-in{grid-template-columns:1fr;align-content:start}.menu-media{display:none}
  .row{grid-template-columns:44px 1fr 30px}.row-d{grid-column:2}.row-go{grid-row:1;grid-column:3}
  .plan-rows .row,.agenda .row{grid-template-columns:1fr}.agenda .row>*{grid-column:auto}
  .tl::before{left:6px}.tl-i{grid-template-columns:1fr;padding-left:34px;gap:8px}.tl-y{text-align:left;padding:0}.tl-c::before{left:-33px;top:-1.6em}
  .hero-row{grid-template-columns:1fr}
  .stats-big .stat{grid-template-columns:1fr}
  .mlist,.faq-cols{grid-template-columns:1fr}
  .w-grid{grid-template-columns:1fr}.w-grid .w-card:nth-child(even){margin-top:0}
  .stk{position:relative;top:auto}
  .collage .cl-4,.collage .cl-5{display:none}.cl{width:clamp(90px,24vw,160px)}
  .v-collage .hero-c{background:color-mix(in srgb,var(--c-bg) 70%,transparent);border-radius:var(--rc);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  .map-w{aspect-ratio:4/3}
}
@media (max-width:600px){
  .g2,.g3,.g4,.bento{grid-template-columns:1fr}.bento .bt{grid-column:auto!important;grid-row:auto!important}
  .top .bt,.top-cta .i{display:none}.top-cta{padding:0 1em}
  .hd-numbered .sh:not(.sh-c){grid-template-columns:1fr}.hd-numbered .sh:not(.sh-c)>*{grid-column:1}.hd-numbered .sh:not(.sh-c) .eyebrow{grid-row:auto}
  .nl{flex-direction:column}
  .foot-bot{flex-direction:column}
  .team.g3,.team.g4{grid-template-columns:repeat(2,1fr)}
}
`;
}

/* ================================================================= boot */
function bootJs() {
  // runs in <head>: js class, splash once per session, non-blocking fonts, motion safety net
  return "(function(h){h.className=h.className.replace('no-js','js');try{if(sessionStorage.getItem('z-splash')||matchMedia('(prefers-reduced-motion: reduce)').matches||window.__ZP)h.classList.add('no-splash')}catch(e){h.classList.add('no-splash')}[].forEach.call(document.querySelectorAll('link[data-gf]'),function(l){var f=function(){l.media='all'};if(l.sheet)f();else l.addEventListener('load',f)});setTimeout(function(){if(!window.__zr)h.classList.remove('anim')},3500)})(document.documentElement);";
}
async function sha256b64(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  let b = ''; new Uint8Array(buf).forEach(x => { b += String.fromCharCode(x); }); return btoa(b);
}

/* =============================================================== render */
export async function renderSite(project, { runtimeJs = '', preview = null } = {}) {
  const ctx = buildCtx(project);
  const { d, st, brand, name } = ctx;
  const P = d.palette;
  const F = project.features || {};
  const seo = project.seo || {};
  const siteUrl = (seo.domain || '').trim().replace(/\/+$/, '').replace(/^(?!https?:\/\/)(.+)$/, 'https://$1') || 'https://example.com';

  // body of the page
  const blocksHtml = ctx.blocks.map(b => { try { return (R[b.type] || R.about)(b, ctx); } catch (e) { return `<!-- block ${esc(b.type)} failed: ${esc(e.message)} -->`; } }).join('\n');
  const { header, menuHtml, tabbar, tabCount } = chrome(ctx);
  const hero = ctx.blocks[0]?.type === 'hero' ? ctx.blocks[0] : null;
  const heroDark = hero ? (hero.variant === 'fullbleed' || hero.t === 'dark' || (hero.t === 'accent' && onColor(P.accent) === '#ffffff')) : false;

  // credits for stock photos
  (project.credits || []).forEach(c => c && ctx.credits.add(String(c)));

  // fonts + variables
  const fReq = [
    { name: d.fonts.display, weights: [d.displayWeight, 400], italic: d.emItalic },
    { name: d.fonts.body, weights: [400, 500, 600] },
    { name: d.fonts.label, weights: [500, 600] },
    d.fonts.em ? { name: d.fonts.em, weights: [400], italic: d.emItalic } : null
  ];
  const gfs = fontsUrls(fReq);
  const vars = `:root{--bg:${P.bg};--surface:${P.surface};--text:${P.text};--accent:${P.accent};--accent-2:${P.accent2};--on-accent:${onColor(P.accent)};--dark:${P.dark};--dark-text:${P.darkText};
--em-l:${readable(P.accent, P.bg, P.text)};--em-s:${readable(P.accent, P.surface, P.text)};--em-d:${readable(P.accent2 || P.accent, P.dark, P.darkText)};
--fd:${fontStack(d.fonts.display)};--fb:${fontStack(d.fonts.body)};--fl:${fontStack(d.fonts.label)};--dw:${d.displayWeight};--bw:400;--dcase:${d.displayCase};--dls:${d.displayTracking};--em-style:${d.emItalic ? 'italic' : 'normal'};
--fs:${d.scale};--ts:${d.titleScale};--ts3:${Math.min(1.1, d.titleScale)};--r:${d.radius}px;--rc:${d.radius}px;--ri:${Math.round(d.radius * 0.8)}px;--rb:${d.radius}px;--btn-ls:${d.btnTracking};--btn-case:${d.btnCase};
--gap:clamp(14px,1.8vw,26px);--pad:clamp(18px,4.6vw,64px);--maxw:${d.maxWidth}px;--ease:cubic-bezier(.22,1,.36,1);--ease-io:cubic-bezier(.76,0,.24,1);
--rv-d:${d.motionLevel === 'subtle' ? '.8s' : '1.1s'};--rv-e:cubic-bezier(.22,1,.36,1);--stag:.08s;--hd-d:1.1s;--hd-e:cubic-bezier(.22,1,.36,1);--hd-s:.045s;--tabs:${tabCount};--fe:${d.fonts.em ? fontStack(d.fonts.em) : 'var(--fd)'}}`;
  const custom = sanitizeCss(d.customCss);
  const css = `${vars}${baseCss(d)}${styleCss(d.style)}${custom ? `\n/* custom */\n${custom}` : ''}`.replace(/\n\s*/g, '\n');

  // classes
  const bodyCls = [`st-${d.style}`, `hd-${d.heading}`, `bt-${d.buttons}`, `cd-${d.cards}`, `im-${d.imageShape}`, `sp-${d.spacing}`, `cur-${d.cursor}`, d.grain ? 'grain' : '', d.spotlight ? 'spot' : ''].filter(Boolean).join(' ');
  const motionOn = d.motionLevel !== 'none';
  const useGsap = motionOn && d.motionLevel !== 'subtle';
  const htmlAttrs = `class="no-js${motionOn ? ' anim' : ''}${F.announcement ? ' has-ann' : ''}" data-herotone="${heroDark ? 'dark' : 'light'}" data-logo="${d.logoPos}" data-rv="${d.reveal}" data-hd="${d.headAnim}" data-im="${d.imgReveal}"`;

  // SEO
  const title = (seo.title || `${name}${brand.tagline ? ' | ' + brand.tagline : ''}`).slice(0, 70);
  const desc = (seo.description || brand.tagline || (hero && hero.text) || `${name}`).replace(/\s+/g, ' ').slice(0, 170);
  const ogSrc = seo.ogImage || hero?.image || ctx.blocks.find(b => b.image)?.image || '';
  const og = ogSrc ? (isCld(ogSrc) ? tx(ogSrc, 'c_fill,w_1200,h_630,g_auto,f_jpg,q_auto') : sized(ogSrc, 1200, '1200:630')) : '';
  const kind = String(project.brief?.kind || '').toLowerCase();
  const personKinds = /person|portfolio|creator|speaker|author|artist|photograph|musician|coach|freelanc|resume|personal/;
  const sameAs = socials(brand).map(s => s.u);
  const org = { '@type': personKinds.test(kind) ? 'Person' : /restaurant|cafe|café|bar|food/.test(kind) ? 'Restaurant' : /shop|store|clinic|salon|gym|hotel|local|studio|spa/.test(kind) ? 'LocalBusiness' : 'Organization', name, url: siteUrl + '/',
    ...(brand.tagline ? { description: brand.tagline } : {}), ...(brand.email ? { email: brand.email } : {}), ...(brand.phone ? { telephone: brand.phone } : {}),
    ...(brand.address ? { address: brand.address } : {}), ...(sameAs.length ? { sameAs } : {}), ...(brand.logo ? { [personKinds.test(kind) ? 'image' : 'logo']: sized(brand.logo, 512, '') } : {}) };
  const jsonld = { '@context': 'https://schema.org', '@graph': [org, { '@type': 'WebSite', name, url: siteUrl + '/', inLanguage: project.brief?.language || 'en' }] };

  // favicon
  const favSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${Math.min(d.radius, 20)}" fill="${P.dark}"/><text x="32" y="42" font-family="Georgia,serif" font-size="28" font-weight="700" text-anchor="middle" fill="${P.accent}">${esc(initials(name))}</text></svg>`;
  const favLink = brand.logo && isCld(brand.logo) ? `<link rel="icon" type="image/png" sizes="64x64" href="${esc(tx(brand.logo, 'c_pad,b_black,w_52,h_52/c_pad,b_black,w_64,h_64,f_png'))}"><link rel="apple-touch-icon" href="${esc(tx(brand.logo, 'c_pad,b_black,w_150,h_150/c_pad,b_black,w_180,h_180,f_png'))}">` : `<link rel="icon" href="favicon.svg" type="image/svg+xml">`;

  // runtime data
  const siteData = {
    motion: { level: d.motionLevel, heroText: d.heroText, parallax: d.parallax, hscroll: true, magnetic: d.magnetic, style: d.style, skew: !!st.skew },
    f: { smooth: !!F.smooth && motionOn, progress: !!F.progress, toTop: !!F.backToTop, cookie: !!F.cookie && !!(F.ga4 || F.plausible), ga4: /^G-[A-Z0-9]{4,}$/i.test(F.ga4 || '') ? F.ga4 : '', plausible: F.plausible || '', chat: F.chatProvider && F.chatId ? { p: F.chatProvider, id: F.chatId } : null, share: !!F.share, formEndpoint: /^https:\/\//.test(F.formEndpoint || '') ? F.formEndpoint : '' },
    cursor: d.cursor, splash: d.splash, wa: ctx.wa, email: brand.email || '', name
  };
  const sprite = (() => { const used = new Set(); const all = blocksHtml + header + menuHtml + tabbar + footer(ctx); all.replace(/#i-([\w-]+)/g, (m, id) => used.add(id)); ['whatsapp', 'arrow-up', 'x', 'chev-l', 'chev-r', 'share', 'copy', 'link'].forEach(i => used.add(i)); return SPRITE.replace(/<symbol id="i-([\w-]+)"[^>]*>.*?<\/symbol>/g, (s, id) => used.has(id) ? s : ''); })();

  const splashHtml = d.splash !== 'none' ? `<div class="splash sp-${d.splash}" aria-hidden="true"><div class="sp-in">${d.splash === 'counter' ? '<span data-sp-count>0</span>' : brand.logo ? `<img src="${esc(sized(brand.logo, 400, ''))}" alt="" width="200" height="110">` : esc(name)}</div></div>` : '';
  const floating = `${F.whatsappBubble && ctx.wa ? `<a class="wa-fab" href="https://wa.me/${ctx.wa}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${icon('whatsapp')}</a>` : ''}
${F.backToTop ? `<button class="to-top" type="button" aria-label="Back to top">${icon('arrow-up')}</button>` : ''}
${siteData.f.cookie ? `<div class="cookie" role="region" aria-label="Cookie consent" hidden><p>We use analytics cookies to understand how the site is used.</p><div><button class="btn btn-2 btn-sm" type="button" data-cookie="no">Decline</button><button class="btn btn-1 btn-sm" type="button" data-cookie="yes">Accept</button></div></div>` : ''}
<div class="lb" role="dialog" aria-modal="true" aria-label="Image viewer" data-lenis-prevent><button class="lb-x" type="button" aria-label="Close">${icon('x')}</button><button class="lb-p" type="button" aria-label="Previous">${icon('chev-l')}</button><img alt=""><button class="lb-n" type="button" aria-label="Next">${icon('chev-r')}</button></div>
${d.cursor !== 'none' ? '<div class="cursor" aria-hidden="true"><span></span></div>' : ''}`;

  const libs = useGsap ? `<script defer src="${LIBS.gsap.src}" integrity="${LIBS.gsap.sri}" crossorigin="anonymous"></script><script defer src="${LIBS.st.src}" integrity="${LIBS.st.sri}" crossorigin="anonymous"></script>` : '';
  const lenis = siteData.f.smooth ? `<script defer src="${LIBS.lenis.src}" integrity="${LIBS.lenis.sri}" crossorigin="anonymous"></script>` : '';
  const boot = bootJs();
  const pv = preview ? `<script>window.__ZP=${JSON.stringify(preview).replace(/</g, '\\u003c')}</script>` : '';

  const html = `<!doctype html>
<html lang="${esc(project.brief?.language || 'en')}" ${htmlAttrs}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(siteUrl)}/">
<meta name="theme-color" content="${P.dark}">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(siteUrl)}/"><meta property="og:site_name" content="${esc(name)}">
${og ? `<meta property="og:image" content="${esc(og)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="${esc(og)}">` : ''}
<meta name="twitter:card" content="${og ? 'summary_large_image' : 'summary'}"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}">
${favLink}
<link rel="manifest" href="site.webmanifest">
${gfs.length ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${gfs.map(u => `<link rel="stylesheet" data-gf href="${esc(u)}" media="print">`).join('')}<noscript>${gfs.map(u => `<link rel="stylesheet" href="${esc(u)}">`).join('')}</noscript>` : ''}
${pv}<script>${boot}</script>
<style>${css}</style>
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
<script type="application/json" id="site-data">${JSON.stringify(siteData).replace(/</g, '\\u003c')}</script>
${libs}${lenis}
__RUNTIME__
</head>
<body class="${bodyCls}">
${sprite}
${splashHtml}
<a class="skip" href="#main">Skip to content</a>
${F.progress ? '<div class="progress" aria-hidden="true"><span></span></div>' : ''}
${F.announcement ? `<div class="ann">${md(F.announcement).replace(/<\/?p>/g, '')}</div>` : ''}
${header}
${menuHtml}
<main id="main">
${blocksHtml}
</main>
${footer(ctx)}
${tabbar}
${floating}
</body>
</html>`;

  const thirdParty = !!(siteData.f.ga4 || siteData.f.plausible || siteData.f.chat || ctx.blocks.some(b => b.type === 'html'));
  const hash = await sha256b64(boot);
  const csp = thirdParty
    ? `default-src 'self' https: data: blob: wss:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; frame-src https:; frame-ancestors 'self'; base-uri 'self'; object-src 'none'`
    : `default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'sha256-${hash}'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob: https:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://www.google.com; connect-src 'self'${siteData.f.formEndpoint ? ' ' + new URL(siteData.f.formEndpoint).origin : ''}; frame-ancestors 'self'; base-uri 'self'; form-action 'self' https:; object-src 'none'; upgrade-insecure-requests`;

  const files = {
    'index.html': html.replace('__RUNTIME__', () => '<script defer src="assets/site.js?v=' + Date.now().toString(36) + '"></script>'),
    'assets/site.js': runtimeJs,
    '_headers': `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Content-Security-Policy: ${csp}\n\n/\n  Cache-Control: public, max-age=0, must-revalidate\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
    'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${esc(siteUrl)}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
    'site.webmanifest': JSON.stringify({ name, short_name: name.slice(0, 24), start_url: '/', display: 'standalone', background_color: P.bg, theme_color: P.dark, icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2),
    'favicon.svg': favSvg,
    '404.html': `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found · ${esc(name)}</title><meta name="robots" content="noindex"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:${P.dark};color:${P.darkText};font:18px/1.6 system-ui,sans-serif;text-align:center;padding:24px}a{color:${P.accent}}h1{font-size:4rem;margin:0}</style></head><body><div><h1>404</h1><p>This page doesn't exist.</p><p><a href="/">Back to ${esc(name)}</a></p></div></body></html>`,
    'README.txt': `${name}: website made with Zarvis\n\nDeploy: Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets → drop this folder.\nDomain: ${siteUrl}${siteUrl.includes('example.com') ? '  (set your real domain in Zarvis → SEO and export again)' : ''}\nDesign: ${st.name} · Motion: ${d.motionLevel}\n\nzarvis-project.json holds the whole project: import it into Zarvis to keep editing.\n`,
    'zarvis-project.json': JSON.stringify({ zarvis: 2, project }, null, 2)
  };
  const previewHtml = html.replace('__RUNTIME__', () => `<script>${runtimeJs.replace(/<\/script/gi, '<\\/script')}</script>`).replace(/<link rel="manifest"[^>]*>/, '');
  return { files, previewHtml, meta: { style: st.name, sections: ctx.menu.map(b => b.menu.label), blocks: ctx.blocks.length } };
}

/** Strip anything dangerous from user/AI CSS */
export function sanitizeCss(css) {
  return String(css || '').slice(0, 12000)
    .replace(/<\/?\s*style[^>]*>/gi, '')
    .replace(/@import[^;]*;?/gi, '')
    .replace(/url\s*\(\s*(['"]?)(?!data:image\/(png|svg\+xml|jpeg|webp)|https:\/\/)[^)]*\)/gi, 'none')
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript:/gi, '');
}

/** Placeholder / demo-content check before export */
export function contentWarnings(project) {
  const out = [];
  (project.blocks || []).forEach(b => {
    if (b.hidden) return;
    const label = (BLOCKS[b.type]?.label || b.type) + (b.title ? ` “${b.title.slice(0, 30)}”` : '');
    const txt = JSON.stringify([b.eyebrow, b.title, b.titleEm, b.text, b.items, b.buttons]);
    const brackets = txt.match(/\[[^\]\n"]{2,60}\]/g);
    if (brackets) out.push({ id: b.id, msg: `${label}: ${brackets.length} placeholder${brackets.length > 1 ? 's' : ''} like ${brackets[0]}` });
    else if (b.demo) out.push({ id: b.id, msg: `${label}: still has template demo text` });
  });
  if (!project.brand?.email && !project.brand?.whatsapp && !project.brand?.phone) out.push({ id: '', msg: 'No email, WhatsApp or phone in Brand settings, so visitors cannot contact you.' });
  return out;
}
