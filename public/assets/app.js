/* =============================================================================
   Dr. Navjot Kaur: site script
   -----------------------------------------------------------------------------
   1. CONFIG  : every contact / commerce value used on the page
   2. LIB     : every source asset on Cloudinary, keyed once
   3. ASSETS  : which asset goes in which slot (re-map here in seconds)
   4. Cloudinary helpers, then modules (splash, nav, motion, media, order…)
   Depends on (deferred, optional): gsap, ScrollTrigger, Lenis. The page stays
   fully usable if any of them fail to load.
   ========================================================================== */
(() => {
'use strict';

/* ---------------------------------------------------------------------------
   1. CONFIG
   ------------------------------------------------------------------------ */
const CONFIG = {
  SITE_URL: 'https://drnavjotkaur.example',          // placeholder domain (see README: npm run set-domain)
  CLOUD_NAME: 'dhn6pvsr1',
  NAME: 'Dr. Navjot Kaur',

  // UPI: TEMPORARY test account. Replace both lines with her own VPA + registered name after testing.
  UPI_ID: 'deifiedbooks@okicici',
  UPI_PAYEE_NAME: 'Deified Books',

  // Book: set BOOK_TITLE to the exact title printed on the cover.
  BOOK_TITLE: 'Her Amazon bestseller',
  BOOK_PRICE_INR: 499,                                  // placeholder: set the real direct price
  SHIPPING_INR: 60,                                     // placeholder: flat shipping per order
  MAX_QTY: 10,
  AMAZON_URL: 'https://amzn.in/d/0aum2eAt',

  CONTACT_PHONE: '+917743031578',
  CONTACT_PHONE_DISPLAY: '+91 77430 31578',
  WHATSAPP_NUMBER: '917743031578',
  CONTACT_EMAIL: 'hello@example.com',                   // dummy, replace
  INSTAGRAM_URL: 'https://www.instagram.com/kaaurdrnavjot',
  LINKEDIN_URL: 'https://www.linkedin.com/in/dr-navjot-kaur-087a85318/',
  ORG: 'Quest International School',
  JOB_TITLE: 'Director of Administration',

  ORDER_ENDPOINT: '/api/order',
  QR_LIB: {
    src: 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js',
    integrity: 'sha384-8FWZA6BGMXhsfO+BLtrJK0We6gg5o1JyO8xQm6peWDEUs17ACA5ziE/NIAkl9z2k'
  },
  CRAFTED_BY: { label: 'Crafted by', name: 'Your Studio', url: '' },  // footer credit
  MAX_PLAYING_VIDEOS: 2,
  PARTICLES: 40
};

/* ---------------------------------------------------------------------------
   2. LIB: every uploaded asset. (Screenshot_…_ChatGPT is kept but disabled.)
   ------------------------------------------------------------------------ */
const C = `https://res.cloudinary.com/${CONFIG.CLOUD_NAME}`;
const LIB = {
  bookCover:  `${C}/image/upload/v1790247244/71to1VD6NoL._SL1500__mxv5zk.jpg`,
  dsc4230:    `${C}/image/upload/v1790248009/DSC_4230.JPG_vzqbab.jpg`,
  pngF3dc:    `${C}/image/upload/v1790248009/file_00000000f3dc7207821deb2fc9ad53ca_kf3vhd.png`,
  img2243:    `${C}/image/upload/v1790248006/2243.JPG_qkcfad.jpg`,
  png2ca8:    `${C}/image/upload/v1790248005/file_000000002ca87206b60a14e4c7c15940_gbrrga.png`,
  dsc4235:    `${C}/image/upload/v1790248003/DSC_4235.JPG_tcaqwh.jpg`,
  navjot05:   `${C}/image/upload/v1790248001/navjot-05.jpg_kjhfs3.jpg`,
  pngF774:    `${C}/image/upload/v1790248000/file_00000000f774821188521d9e4ead005b_jlajt7.png`,
  screenshot: `${C}/image/upload/v1790247996/Screenshot_20260516_105328_ChatGPT.jpg_lltc0n.jpg`,
  img20220511:`${C}/image/upload/v1790247994/IMG_20220511_111105_1.jpg_rzwwxl.jpg`,
  ayaam2022:  `${C}/image/upload/v1790247994/ayam_2022-1-1.jpg_cugy16.jpg`,
  p1000250327:`${C}/image/upload/v1790247993/1000250327.jpg_ymehoq.jpg`,
  wa20240919: `${C}/image/upload/v1790247991/IMG-20240919-WA0015.jpg_qfulbr.jpg`,
  navjot07:   `${C}/image/upload/v1790247699/navjot-07.jpg_oa4wml.jpg`,
  p1000381797:`${C}/image/upload/v1790247680/1000381797.jpg_v6eqxd.jpg`,
  drNavjotPng:`${C}/image/upload/v1790247661/DR._NAVJOT_ud6jom.png`,
  wa20260922: `${C}/image/upload/v1790247660/IMG-20260922-WA0026.jpg_ztj4bw.jpg`,
  p20240713:  `${C}/image/upload/v1790247659/20240713_120931_1.jpg_vh6opi.jpg`,
  p20251206:  `${C}/image/upload/v1790247657/20251206_145715.jpg_jqvwqr.jpg`,
  p20250705b: `${C}/image/upload/v1790247657/20250705_122055.jpg_pxvimo.jpg`,
  wa20250325: `${C}/image/upload/v1790247656/IMG-20250325-WA0007.jpg_dxoieq.jpg`,
  p20250705a: `${C}/image/upload/v1790247654/20250705_121907.jpg_tvsxs9.jpg`,
  p20250325:  `${C}/image/upload/v1790247654/20250325_085754.jpg_vefo2i.jpg`,
  p20231201:  `${C}/image/upload/v1790247653/20231201_141109.jpg_te5row.jpg`,
  // videos
  vHero:      `${C}/video/upload/v1790248003/IMG_2677_uatv8n.mov`,
  v211837:    `${C}/video/upload/v1790247763/1000211837_z2l8zl.mp4`,
  v418113:    `${C}/video/upload/v1790247723/1000418113_xltbgr.mp4`,
  v424527:    `${C}/video/upload/v1790247719/1000424527_ubi3fk.mp4`,
  v416510:    `${C}/video/upload/v1790247708/1000416510_j7odyb.mp4`,
  vWa251206:  `${C}/video/upload/v1790247699/VID-20251206-WA0006_1_2_ru2zyw.mp4`,
  v416969:    `${C}/video/upload/v1790247697/1000416969_goj4gu.mov`
};

/* ---------------------------------------------------------------------------
   3. ASSETS: slot mapping. `pos` = CSS object-position (face-safe fallback;
   crops are also face-aware server-side via c_fill,g_auto). `small: true`
   marks compressed WhatsApp media: they are only placed in small tiles.
   ------------------------------------------------------------------------ */
const ASSETS = {
  hero: {
    video: LIB.vHero,               // cinematic loop (poster = Cloudinary frame grab)
    fallback: LIB.navjot05,         // used if the frame grab fails
    alt: 'Dr. Navjot Kaur, educationist and Mrs. India Planet 2022',
    posMobile: '50% 28%', posDesktop: '50% 32%'
  },
  about: {
    portrait: { src: LIB.dsc4230, alt: 'Portrait of Dr. Navjot Kaur', pos: '50% 22%' },
    cutout:   { src: LIB.drNavjotPng, alt: 'Dr. Navjot Kaur' }
  },
  leadership: { visual: { src: LIB.png2ca8, alt: 'Dr. Navjot Kaur, founder and chairperson', pos: '50% 25%' } },
  journey:    { visual: { src: LIB.pngF774, alt: 'Dr. Navjot Kaur, educationist and researcher', pos: '50% 25%' } },
  awards: {
    photos: [
      { src: LIB.dsc4235,   alt: 'Dr. Navjot Kaur, Mrs. India Planet 2022', caption: 'Mrs. India Planet 2022', pos: '50% 20%' },
      { src: LIB.p20231201, alt: 'Dr. Navjot Kaur at an awards ceremony', caption: 'Recognised on the global stage', pos: '50% 25%' },
      { src: LIB.img2243,   alt: 'Dr. Navjot Kaur receiving recognition', caption: 'Honoured for leadership in education', pos: '50% 25%' }
    ]
  },
  book: { cover: { src: LIB.bookCover, alt: 'Cover of the book by Dr. Navjot Kaur' } },
  media: { cover: { src: LIB.navjot07, alt: 'Dr. Navjot Kaur, featured on the cover of Diva Planet Magazine', pos: '50% 20%' } },
  contact: { cutout: { src: LIB.pngF3dc, alt: 'Dr. Navjot Kaur' } },

  // Impact bento. `span` = grid spans, `order` interleaves with the static text tiles (2, 5, 8).
  impact: [
    { type: 'image', src: LIB.ayaam2022,   alt: 'Dr. Navjot Kaur as Chief Guest at Ayaam 2022', caption: 'Chief Guest · Ayaam 2022', span: 'w2 h2', order: 1, pos: '50% 30%' },
    { type: 'video', src: LIB.v416510,     alt: 'Video of Dr. Navjot Kaur at a community event', caption: 'In the community', span: 'h2', order: 3 },
    { type: 'image', src: LIB.p1000250327, alt: 'Dr. Navjot Kaur with women at a social event', caption: 'Women empowerment', span: '', order: 4, pos: '50% 30%' },
    { type: 'image', src: LIB.wa20240919,  alt: 'Dr. Navjot Kaur at an awareness programme', caption: 'Awareness drive', span: '', order: 6, small: true, pos: '50% 30%' },
    { type: 'video', src: LIB.v416969,     alt: 'Video from a women empowerment programme', caption: 'Workshop moments', span: 'h2', order: 7 },
    { type: 'image', src: LIB.p20250325,   alt: 'Dr. Navjot Kaur addressing a gathering', caption: 'Encouraging every woman', span: 'w2', order: 9, pos: '50% 30%' },
    { type: 'video', src: LIB.v418113,     alt: 'Video of Dr. Navjot Kaur speaking at an event', caption: 'On stage', span: '', order: 10 },
    { type: 'image', src: LIB.wa20250325,  alt: 'Dr. Navjot Kaur with participants at a social event', caption: 'Together', span: '', order: 11, small: true, pos: '50% 30%' }
  ],

  // Moments masonry. `ar` = tile aspect ratio.
  moments: [
    { type: 'image', src: LIB.p20240713,   alt: 'Dr. Navjot Kaur at an education summit', caption: 'Summit', ar: '4:5', pos: '50% 30%' },
    { type: 'video', src: LIB.v211837,     alt: 'Video highlight of Dr. Navjot Kaur', caption: 'Highlight reel', ar: '9:16' },
    { type: 'image', src: LIB.p20251206,   alt: 'Dr. Navjot Kaur at an event in December 2025', caption: 'December 2025', ar: '3:4', pos: '50% 30%' },
    { type: 'image', src: LIB.img20220511, alt: 'Dr. Navjot Kaur in 2022', caption: '2022', ar: '4:5', pos: '50% 30%' },
    { type: 'image', src: LIB.p20250705a,  alt: 'Dr. Navjot Kaur at an event in July 2025', caption: 'July 2025', ar: '1:1', pos: '50% 30%' },
    { type: 'video', src: LIB.v424527,     alt: 'Video of Dr. Navjot Kaur at an event', caption: 'Behind the scenes', ar: '9:16' },
    { type: 'image', src: LIB.p1000381797, alt: 'Dr. Navjot Kaur at a public event', caption: 'On the road', ar: '4:5', pos: '50% 30%' },
    { type: 'image', src: LIB.p20250705b,  alt: 'Dr. Navjot Kaur with guests in July 2025', caption: 'With guests', ar: '3:4', pos: '50% 30%' },
    { type: 'image', src: LIB.wa20260922,  alt: 'Dr. Navjot Kaur at a recent event', caption: 'Recently', ar: '1:1', small: true, pos: '50% 30%' },
    { type: 'video', src: LIB.vWa251206,   alt: 'Short video clip from December 2025', caption: 'December 2025', ar: '4:5', small: true },
    // Disabled: likely a screenshot. Flip `enabled` to true only if the image is clean.
    { type: 'image', src: LIB.screenshot,  alt: 'Dr. Navjot Kaur', caption: '', ar: '4:5', enabled: false }
  ],

  // Hover previews in the full-screen menu
  menu: {
    home: LIB.navjot05, about: LIB.dsc4230, leadership: LIB.png2ca8, journey: LIB.pngF774,
    awards: LIB.p20231201, book: LIB.bookCover, impact: LIB.ayaam2022, media: LIB.navjot07,
    moments: LIB.p20240713, contact: LIB.dsc4235
  }
};

/* ---------------------------------------------------------------------------
   4. Cloudinary helpers
   ------------------------------------------------------------------------ */
const WIDTHS = [480, 800, 1200, 1800];
const tx = (url, t) => url.replace('/upload/', `/upload/${t}/`);
/** Image URL. `ar` ("4:5") → face-aware fill crop; otherwise c_limit (no crop). */
const cImg = (url, w, ar) => tx(url, ar ? `f_auto,q_auto,c_fill,g_auto,ar_${ar},w_${w}` : `f_auto,q_auto,c_limit,w_${w}`);
const cSrcset = (url, ar, widths = WIDTHS) => widths.map(w => `${cImg(url, w, ar)} ${w}w`).join(', ');
/** Video URL. .mov is requested as .mp4 so Cloudinary transcodes to H.264. */
const cVideo = (url, w) => tx(url, `f_auto:video,q_auto,c_limit,w_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.mp4');
/** Poster frame grab from a video: same path, so_1, .jpg */
const cPoster = (url, w, ar) => tx(url, `so_1,f_jpg,q_auto,${ar ? `c_fill,g_auto,ar_${ar}` : 'c_limit'},w_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg');

/* ---------------------------------------------------------------------------
   Environment
   ------------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const html = document.documentElement;
const mq = q => window.matchMedia(q);
const reduced = mq('(prefers-reduced-motion: reduce)').matches;
const finePointer = mq('(hover: hover) and (pointer: fine)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);
const gsap = window.gsap;
const ST = window.ScrollTrigger;
const hasGSAP = !!(gsap && ST);
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const resolve = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), ASSETS);

if (reduced) html.classList.add('reduced');
if (hasGSAP) { gsap.registerPlugin(ST); html.classList.add('motion'); }
else html.classList.add('no-gsap');

/* ---------------------------------------------------------------------------
   CONFIG → DOM bindings (links + text)
   ------------------------------------------------------------------------ */
function bindConfig() {
  const hrefs = {
    tel: `tel:${CONFIG.CONTACT_PHONE}`,
    mailto: `mailto:${CONFIG.CONTACT_EMAIL}`,
    whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`,
    instagram: CONFIG.INSTAGRAM_URL,
    linkedin: CONFIG.LINKEDIN_URL,
    amazon: CONFIG.AMAZON_URL
  };
  const texts = {
    phoneDisplay: CONFIG.CONTACT_PHONE_DISPLAY,
    email: CONFIG.CONTACT_EMAIL,
    bookTitle: CONFIG.BOOK_TITLE,
    bookPrice: inr(CONFIG.BOOK_PRICE_INR),
    shipping: inr(CONFIG.SHIPPING_INR)
  };
  $$('[data-cfg-href]').forEach(a => { const v = hrefs[a.dataset.cfgHref]; if (v) a.href = v; });
  $$('[data-cfg-text]').forEach(el => { const v = texts[el.dataset.cfgText]; if (v != null) el.textContent = v; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  const cb = $('#craftedBy');
  if (cb) {
    const { label, name, url } = CONFIG.CRAFTED_BY;
    cb.innerHTML = url ? `${esc(label)} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>` : `${esc(label)} ${esc(name)}`;
  }
}

/* ---------------------------------------------------------------------------
   Media mounting
   ------------------------------------------------------------------------ */
function makeImg(item, { ar, sizes = '100vw', eager = false } = {}) {
  const img = new Image();
  const [aw, ah] = (ar || '4:5').split(':').map(Number);
  img.width = 800; img.height = Math.round(800 * ah / aw);
  img.decoding = 'async';
  img.loading = eager ? 'eager' : 'lazy';
  img.sizes = sizes;
  img.srcset = cSrcset(item.src, ar);
  img.src = cImg(item.src, 800, ar);
  img.alt = item.alt || '';
  if (item.pos) img.style.objectPosition = item.pos;
  return img;
}
function failSafe(img, host) {
  const fail = () => host.classList.add('is-failed');
  img.addEventListener('error', fail, { once: true });
  if (img.complete && img.naturalWidth === 0 && img.src) fail();
}
/** Fill every [data-slot] frame from ASSETS */
function mountSlots() {
  $$('[data-slot]').forEach(host => {
    const item = resolve(host.dataset.slot);
    if (!item || item.enabled === false) { host.classList.add('is-failed'); return; }
    const isCutout = host.classList.contains('cutout');
    const fit = host.dataset.fit === 'limit' || isCutout;
    const ar = fit ? null : (host.dataset.ar || '4:5');
    const img = makeImg(item, { ar, sizes: host.dataset.sizes || (isCutout ? '240px' : '50vw') });
    if (fit) { img.width = 600; img.height = 900; }
    failSafe(img, host);
    if (isCutout || host.classList.contains('face')) host.prepend(img);
    else {
      const inner = document.createElement('div');
      inner.className = 'inner';
      if (host.hasAttribute('data-parallax')) inner.style.inset = '-8% 0';
      inner.appendChild(img);
      host.prepend(inner);
    }
  });
  $$('[data-slot-caption]').forEach(el => { const it = resolve(el.dataset.slotCaption); if (it) el.textContent = it.caption || ''; });
}

/** Hero: poster from ASSETS (identical URLs to the preloaded ones → cache hit), fallback, video */
function mountHero() {
  const media = $('#heroMedia'); if (!media) return;
  const h = ASSETS.hero;
  media.style.setProperty('--pos-m', h.posMobile);
  media.style.setProperty('--pos-d', h.posDesktop);
  const source = $('source', media);
  const poster = $('#heroPoster');
  if (source) source.srcset = cPoster(h.video, 720, '9:16');
  poster.srcset = `${cPoster(h.video, 1280, '16:9')} 1280w, ${cPoster(h.video, 1920, '16:9')} 1920w`;
  poster.alt = h.alt;
  let triedFallback = false;
  const onFail = () => {
    if (triedFallback) { media.classList.add('is-failed'); return; }
    triedFallback = true;
    $$('source', media).forEach(s => s.remove());                 // let <img> pick the fallback
    const mobile = mq('(max-width: 767px)').matches;
    poster.srcset = cSrcset(h.fallback, mobile ? '9:16' : '16:9', [800, 1200, 1800]);
    poster.src = cImg(h.fallback, 1200, mobile ? '9:16' : '16:9');
  };
  poster.addEventListener('error', onFail);
  if (poster.complete && poster.naturalWidth === 0) onFail();

  if (saveData || reduced) return;                                  // posters only
  // Attach the video after `load` so it never competes with first paint on slow networks
  const attach = () => setTimeout(() => attachHeroVideo(media, h), 250);
  if (document.readyState === 'complete') attach(); else window.addEventListener('load', attach, { once: true });
}
function attachHeroVideo(media, h) {
  const v = document.createElement('video');
  v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
  v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
  v.preload = 'auto';
  v.disablePictureInPicture = true;
  v.src = cVideo(h.video, mq('(max-width: 767px)').matches ? 720 : 1280);
  v.addEventListener('playing', () => v.classList.add('is-playing'));
  v.addEventListener('error', () => v.remove());
  media.appendChild(v);
  Videos.register(v, $('.hero'), { autoplay: true });
}

/* ---------------------------------------------------------------------------
   Videos: IntersectionObserver play/pause + max concurrent playback
   ------------------------------------------------------------------------ */
const Videos = {
  playing: [],
  play(v) {
    if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src;
    if (this.playing.includes(v)) return;
    while (this.playing.length >= CONFIG.MAX_PLAYING_VIDEOS) this.pause(this.playing[0]);
    this.playing.push(v);
    const p = v.play();
    if (p && p.catch) p.catch(() => { this.playing = this.playing.filter(x => x !== v); });
  },
  pause(v) { v.pause(); this.playing = this.playing.filter(x => x !== v); },
  pauseAll() { [...this.playing].forEach(v => this.pause(v)); },
  /** autoplay: play whenever visible. Otherwise hover/focus on desktop, visibility on touch. */
  register(v, host, { autoplay = false } = {}) {
    const tile = host.closest('.vtile') || host;
    v.addEventListener('playing', () => tile.classList.add('is-playing'));
    v.addEventListener('pause', () => tile.classList.remove('is-playing'));
    if (saveData && !autoplay) return;
    if (autoplay || !finePointer) {
      const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !document.hidden) this.play(v); else this.pause(v);
      }, { threshold: autoplay ? 0.15 : 0.6 });
      io.observe(host);
    } else {
      host.addEventListener('pointerenter', () => this.play(v));
      host.addEventListener('pointerleave', () => this.pause(v));
      host.addEventListener('focusin', () => this.play(v));
      host.addEventListener('focusout', () => this.pause(v));
    }
  }
};
document.addEventListener('visibilitychange', () => { if (document.hidden) Videos.pauseAll(); });

/* ---------------------------------------------------------------------------
   Galleries (Impact bento + Moments masonry) + lightbox items
   ------------------------------------------------------------------------ */
const LB_ITEMS = [];
function tileHTML(item, { ar, sizes, cls = '' }) {
  const idx = LB_ITEMS.push(item) - 1;
  const isVideo = item.type === 'video';
  const cap = item.caption ? `<figcaption class="cap">${icon(isVideo ? 'video' : 'camera')}${esc(item.caption)}</figcaption>` : '';
  return `<figure class="tile ${isVideo ? 'vtile' : ''} ${cls}" data-reveal data-lb-index="${idx}">
    <div class="frame" style="--ar:${(ar || '4:5').replace(':', '/')}" data-tile-media></div>
    ${isVideo ? `<span class="play-badge" aria-hidden="true">${icon('play')}</span>` : ''}
    ${cap}
    <button class="open" type="button" aria-label="Open ${isVideo ? 'video' : 'photo'}: ${esc(item.caption || item.alt)}" data-cursor="${isVideo ? 'Play' : 'View'}"></button>
  </figure>`;
}
function hydrateTile(fig, item, { ar, sizes }) {
  const frame = $('[data-tile-media]', fig);
  const inner = document.createElement('div'); inner.className = 'inner';
  let img;
  if (item.type === 'video') {
    img = new Image();
    const [aw, ah] = ar.split(':').map(Number);
    img.width = 720; img.height = Math.round(720 * ah / aw);
    img.loading = 'lazy'; img.decoding = 'async';
    img.srcset = [480, 720, 1080].map(w => `${cPoster(item.src, w, ar)} ${w}w`).join(', ');
    img.sizes = sizes; img.src = cPoster(item.src, 720, ar); img.alt = item.alt;
    inner.appendChild(img);
    frame.appendChild(inner);
    if (!saveData) {
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
      v.dataset.src = cVideo(item.src, finePointer ? 720 : 480);
      v.style.objectPosition = item.pos || '50% 30%';
      frame.appendChild(v);
      Videos.register(v, fig);
    }
  } else {
    img = makeImg(item, { ar, sizes });
    inner.appendChild(img);
    frame.appendChild(inner);
  }
  failSafe(img, frame);
}
function mountGalleries() {
  const bento = $('#impactGrid');
  if (bento) {
    const sizes = '(min-width: 900px) 25vw, 50vw';
    const statics = $$('.tile.text', bento).map(el => ({ el, order: +el.dataset.order }));
    const gen = ASSETS.impact.filter(i => i.enabled !== false).map(item => {
      const ar = item.span.includes('w2') && !item.span.includes('h2') ? '2:1' : item.span.includes('h2') && !item.span.includes('w2') ? '1:2' : '1:1';
      const wrap = document.createElement('div');
      wrap.innerHTML = tileHTML(item, { ar, sizes, cls: item.span });
      const fig = wrap.firstElementChild;
      hydrateTile(fig, item, { ar, sizes: item.span.includes('w2') ? '(min-width: 900px) 50vw, 100vw' : sizes });
      return { el: fig, order: item.order };
    });
    [...statics, ...gen].sort((a, b) => a.order - b.order).forEach(({ el }) => bento.appendChild(el));
  }
  const masonry = $('#momentsGrid');
  if (masonry) {
    const sizes = '(min-width: 900px) 25vw, 50vw';
    ASSETS.moments.filter(i => i.enabled !== false).forEach(item => {
      const ar = item.ar || '4:5';
      const wrap = document.createElement('div');
      wrap.innerHTML = tileHTML(item, { ar, sizes, cls: item.small ? 'is-small' : '' });
      const fig = wrap.firstElementChild;
      hydrateTile(fig, item, { ar, sizes });
      masonry.appendChild(fig);
    });
  }
}

/* ---------------------------------------------------------------------------
   Marquees: fill + clone for a seamless -50% loop
   ------------------------------------------------------------------------ */
function initMarquees() {
  if (reduced) return;
  $$('.marquee-track').forEach(track => {
    const set = $('.marquee-set', track);
    const base = set.innerHTML;
    let guard = 0;
    while (set.scrollWidth < window.innerWidth * 1.1 && guard++ < 6) set.insertAdjacentHTML('beforeend', base);
    const clone = set.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
}

/* ---------------------------------------------------------------------------
   Splash
   ------------------------------------------------------------------------ */
const splashShown = !html.classList.contains('no-splash');
try { sessionStorage.setItem('nk-splash', '1'); } catch (e) { /* storage blocked */ }
const heroDelay = splashShown ? Math.max(0, 1150 - performance.now()) / 1000 : 0.05;
if (splashShown) setTimeout(() => { const s = $('.splash'); if (s) s.remove(); }, Math.max(0, 1750 - performance.now()));

/* ---------------------------------------------------------------------------
   Text splitting (words keep their <em> parents, chars for the hero name)
   ------------------------------------------------------------------------ */
function splitWords(el, wordClass = 'w', innerClass = 'wi') {
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = wordClass;
          if (innerClass) { const i = document.createElement('span'); i.className = innerClass; i.textContent = part; w.appendChild(i); }
          else w.textContent = part;
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        if (n.tagName === 'EM') n.classList.add('is-split');
        walk(n);
      }
    });
  };
  walk(el);
}
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; el.appendChild(s); });
}

/* ---------------------------------------------------------------------------
   Smooth scroll (Lenis) + ScrollTrigger wiring
   ------------------------------------------------------------------------ */
let lenis = null;
function initLenis() {
  if (reduced || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
  if (hasGSAP) {
    lenis.on('scroll', ST.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
const lockScroll = on => {
  document.body.classList.toggle('is-locked', on);
  if (lenis) on ? lenis.stop() : lenis.start();
};
function scrollToTarget(target) {
  if (!target) return;
  const done = () => {
    // content-visibility sections may resize while scrolling: correct once on arrival
    const off = target.getBoundingClientRect().top;
    if (Math.abs(off) > 2) lenis ? lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView();
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };
  if (lenis) lenis.scrollTo(target, { duration: 1.4, onComplete: done });
  else { target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); setTimeout(done, reduced ? 50 : 900); }
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = document.getElementById(id.slice(1));
  if (!target) return;
  e.preventDefault();
  if (Menu.isOpen) { Menu.close(false); setTimeout(() => scrollToTarget(target), 420); }
  else scrollToTarget(target);
  history.replaceState(null, '', id === '#home' ? location.pathname : id);
});

/* ---------------------------------------------------------------------------
   Scroll UI: progress bar, hide-on-scroll top bar, tab bar active pill
   ------------------------------------------------------------------------ */
function initScrollUI() {
  const bar = $('.progress span');
  const topbar = $('#topbar');
  let lastY = window.scrollY, ticking = false, docH = 1;
  const measure = () => { docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
  measure();
  window.addEventListener('resize', measure, { passive: true });
  new ResizeObserver(measure).observe(document.body);
  const update = () => {
    const y = window.scrollY;
    bar.style.transform = `scaleX(${Math.min(1, y / docH)})`;
    if (!Menu.isOpen) {
      topbar.classList.toggle('is-hidden', y > lastY && y > 140);
      topbar.classList.toggle('is-solid', y > 40);
    }
    lastY = y; ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // Tab bar: section crossing the viewport centre sets the active tab
  const tabbar = $('#tabbar');
  const tabs = $$('[data-tab]', tabbar);
  const keys = tabs.map(t => t.dataset.tab);
  const setActive = key => {
    const i = keys.indexOf(key);
    tabbar.classList.toggle('no-active', i < 0);
    tabs.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
    if (i >= 0) tabbar.style.setProperty('--ti', i);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section); });
  }, { rootMargin: '-50% 0px -49% 0px' });
  $$('[data-section]').forEach(s => io.observe(s));
  setActive('home');
}

/* ---------------------------------------------------------------------------
   Focus trap utility
   ------------------------------------------------------------------------ */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([tabindex="-1"]),textarea:not([disabled]),select,[tabindex]:not([tabindex="-1"])';
function trap(e, nodes) {
  if (e.key !== 'Tab') return;
  const f = nodes.flatMap(n => (n.matches(FOCUSABLE) ? [n] : $$(FOCUSABLE, n))).filter(el => el.offsetParent !== null || el === document.activeElement);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---------------------------------------------------------------------------
   Menu (circular clip-path reveal from the burger)
   ------------------------------------------------------------------------ */
const Menu = {
  isOpen: false,
  init() {
    this.el = $('#menu'); this.btn = $('.burger');
    this.el.removeAttribute('hidden');
    this.el.style.transition = reduced ? 'clip-path .01s, visibility 0s' : 'clip-path .85s cubic-bezier(.76,0,.24,1), visibility 0s linear .85s';
    this.btn.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
    this.el.addEventListener('keydown', e => trap(e, [this.btn, this.el]));
    this.btn.addEventListener('keydown', e => { if (this.isOpen) trap(e, [this.btn, this.el]); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen) this.close(); });
    // Hover previews
    const prev = $('.menu-preview', this.el);
    let built = false;
    this.buildPreviews = () => {
      if (built || !mq('(min-width: 1025px)').matches) return;
      built = true;
      Object.entries(ASSETS.menu).forEach(([k, src]) => {
        const img = new Image(); img.alt = ''; img.decoding = 'async'; img.width = 600; img.height = 750;
        img.src = cImg(src, 800, '4:5'); img.dataset.k = k;
        img.addEventListener('error', () => img.remove());
        prev.appendChild(img);
      });
    };
    const show = k => $$('img', prev).forEach(i => i.classList.toggle('is-on', i.dataset.k === k));
    $$('.menu-links a', this.el).forEach(a => {
      a.addEventListener('pointerenter', () => show(a.dataset.preview));
      a.addEventListener('focus', () => show(a.dataset.preview));
    });
    this.show = show;
  },
  open() {
    const r = this.btn.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 20;
    this.el.style.setProperty('--mx', x + 'px'); this.el.style.setProperty('--my', y + 'px');
    this.buildPreviews();
    this.isOpen = true;
    html.classList.add('menu-open');
    $('#topbar').classList.remove('is-hidden');
    this.el.style.transition = reduced ? 'none' : 'clip-path .85s cubic-bezier(.76,0,.24,1), visibility 0s';
    this.el.classList.add('is-open');
    this.el.style.clipPath = `circle(${rad}px at ${x}px ${y}px)`;
    this.btn.setAttribute('aria-expanded', 'true');
    this.btn.setAttribute('aria-label', 'Close menu');
    lockScroll(true);
    this.show('home');
    if (hasGSAP && !reduced) {
      gsap.fromTo($$('.menu-links .mlabel, .menu-links .mnum', this.el), { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.035, delay: 0.25 });
      gsap.fromTo($('.menu-foot', this.el), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6, ease: 'expo.out' });
    }
    setTimeout(() => { const f = $('.menu-links a', this.el); if (f) f.focus({ preventScroll: true }); }, reduced ? 0 : 350);
  },
  close(restoreFocus = true) {
    const x = this.el.style.getPropertyValue('--mx'), y = this.el.style.getPropertyValue('--my');
    this.isOpen = false;
    html.classList.remove('menu-open');
    this.el.style.transition = reduced ? 'none' : 'clip-path .7s cubic-bezier(.76,0,.24,1), visibility 0s linear .7s';
    this.el.style.clipPath = `circle(0px at ${x} ${y})`;
    this.el.classList.remove('is-open');
    this.btn.setAttribute('aria-expanded', 'false');
    this.btn.setAttribute('aria-label', 'Open menu');
    lockScroll(false);
    if (restoreFocus) this.btn.focus({ preventScroll: true });
  }
};

/* ---------------------------------------------------------------------------
   Motion (GSAP): hero intro, reveals, parallax, pins, counters
   ------------------------------------------------------------------------ */
function initHeroIntro() {
  const chars = [];
  $$('[data-split-chars]').forEach(el => { splitChars(el); chars.push(...$$('.ch', el)); });
  if (!hasGSAP) { startRoles(0); return; }

  /* Hero intro: letters rise as the splash curtain lifts (other hero copy is CSS-animated) */
  if (reduced) { startRoles(0); return; }
  const tl = gsap.timeline({ delay: heroDelay, onStart: () => startRoles(1.2) });
  gsap.set(chars, { yPercent: 115, rotate: 6 });
  tl.fromTo('.hero-shade', { opacity: 0.4 }, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0)
    .to(chars, { yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: 0.045 }, 0.1);
}

function initMotion() {
  $$('[data-split]').forEach(el => splitWords(el));
  $$('[data-scrub]').forEach(el => splitWords(el, 'sw', null));
  if (!hasGSAP) { countersStatic(); return; }

  /* Split headings: word mask reveal */
  const headings = $$('[data-split]');
  const clips = $$('.clip-reveal');
  const reveals = $$('[data-reveal]');
  if (!reduced) {
    headings.forEach(h => gsap.set($$('.wi', h), { yPercent: 115 }));
    clips.forEach(c => { gsap.set(c, { clipPath: 'inset(100% 0% 0% 0%)' }); const im = $('.inner img', c); if (im) gsap.set(im, { scale: 1.3 }); });
  }
  gsap.set(reveals, { opacity: 0, y: reduced ? 0 : 50 });
  $$('[data-count]').forEach(el => { el.textContent = '0'; });

  const io = new IntersectionObserver(entries => {
    const batch = entries.filter(e => e.isIntersecting).map(e => e.target);
    batch.forEach(el => io.unobserve(el));
    const rev = batch.filter(el => el.hasAttribute('data-reveal'));
    if (rev.length) gsap.to(rev, { opacity: 1, y: 0, duration: reduced ? 0.6 : 1.1, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' });
    batch.filter(el => el.hasAttribute('data-split')).forEach(h =>
      gsap.to($$('.wi', h), { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.05 }));
    batch.filter(el => el.hasAttribute('data-count')).forEach(countUp);
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
  [...headings, ...reveals, ...$$('[data-count]')].forEach(el => io.observe(el));

  /* Clip reveals: an element fully hidden by its own clip-path never "intersects",
     so observe a proxy (its parent) and reveal the frame. */
  if (!reduced) {
    const proxyOf = new Map();
    const cio = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      (proxyOf.get(e.target) || []).forEach(c => {
        gsap.to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' });
        const im = $('.inner img', c); if (im) gsap.to(im, { scale: 1, duration: 1.8, ease: 'expo.out' });
      });
    }), { rootMargin: '0px 0px -10% 0px', threshold: 0.01 });
    clips.forEach(c => {
      const proxy = c.parentElement;
      proxyOf.set(proxy, [...(proxyOf.get(proxy) || []), c]);
      cio.observe(proxy);
    });
  }

  if (reduced) return;

  /* Scroll-highlight paragraph */
  $$('[data-scrub]').forEach(p => {
    gsap.to($$('.sw', p), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 45%', scrub: true } });
  });

  /* Parallax portrait */
  $$('[data-parallax] .inner').forEach(inner => {
    gsap.fromTo(inner, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: inner.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.to('.about .cutout', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.hero-inner', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* Timeline line draws on scroll */
  gsap.fromTo('.tl-line span', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: true } });

  /* Awards: pinned horizontal rail on desktop */
  const mmx = gsap.matchMedia();
  mmx.add('(min-width: 1025px)', () => {
    const sec = $('#awards'), rail = $('#awardsRail'), pin = $('#awardsPin');
    sec.classList.add('is-pinnable');
    pin.style.paddingLeft = 'var(--pad)';
    const dist = () => Math.max(0, rail.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(pin).paddingLeft));
    const tween = gsap.to(rail, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    return () => { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); gsap.set(rail, { clearProps: 'transform' }); sec.classList.remove('is-pinnable'); pin.style.paddingLeft = ''; };
  });

  /* Statement parallax */
  gsap.fromTo('.statement', { xPercent: 4 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.impact', start: 'top bottom', end: 'bottom top', scrub: true } });
}
function countUp(el) {
  const end = +el.dataset.count, o = { v: 0 };
  gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
}
function countersStatic() { $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; }); }

/* Rotating hero roles */
function startRoles(delaySec) {
  const wrap = $('#roleRot'); if (!wrap) return;
  const items = $$('span', wrap); let i = 0;
  items[0].classList.add('is-on');
  wrap.classList.add('is-running');
  if (reduced) return;
  setTimeout(() => setInterval(() => {
    if (document.hidden) return;
    items[i].classList.remove('is-on'); items[i].classList.add('is-out');
    const prev = items[i];
    setTimeout(() => prev.classList.remove('is-out'), 800);
    i = (i + 1) % items.length;
    items[i].classList.add('is-on');
  }, 2400), delaySec * 1000);
}

/* ---------------------------------------------------------------------------
   Pointer effects: custom cursor, magnetic buttons, 3D tilt (desktop only)
   ------------------------------------------------------------------------ */
function initPointer() {
  if (!finePointer || reduced || !hasGSAP) return;
  html.classList.add('has-cursor');
  const cur = $('.cursor'), dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a,button,[data-cursor]');
    cur.classList.toggle('is-hover', !!t);
    label.textContent = t && t.dataset.cursor ? t.dataset.cursor : '';
  });
  document.addEventListener('pointerleave', () => gsap.to(cur, { opacity: 0, duration: 0.2 }));
  document.addEventListener('pointerenter', () => gsap.to(cur, { opacity: 1, duration: 0.2 }));

  $$('.magnetic').forEach(el => {
    const mx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .4)' }); });
  });

  $$('[data-tilt]').forEach(el => {
    gsap.set(el, { transformPerspective: 900 });
    const tX = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }), tY = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      tY(((e.clientX - r.left) / r.width - 0.5) * 12); tX(-((e.clientY - r.top) / r.height - 0.5) * 12);
    });
    el.addEventListener('pointerleave', () => { tX(0); tY(0); });
  });

  // The book: floating 3D tilt
  const book = $('#book3d'), stage = $('.book-stage');
  if (book && stage) {
    gsap.set(book, { rotationY: -24, rotationX: 6 });
    const bY = gsap.quickTo(book, 'rotationY', { duration: 0.8, ease: 'power3' }), bX = gsap.quickTo(book, 'rotationX', { duration: 0.8, ease: 'power3' });
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      bY(-24 + ((e.clientX - r.left) / r.width - 0.5) * 40); bX(6 - ((e.clientY - r.top) / r.height - 0.5) * 20);
    });
    stage.addEventListener('pointerleave', () => { bY(-24); bX(6); });
    book.addEventListener('click', () => Order.open());
  }
}

/* ---------------------------------------------------------------------------
   Hero particle field (≤40 particles, paused off-screen, DPR ≤ 2)
   ------------------------------------------------------------------------ */
function initParticles() {
  const cvs = $('#particles'); if (!cvs || reduced) return;
  const ctx = cvs.getContext('2d'); if (!ctx) return;
  const N = Math.min(40, CONFIG.PARTICLES);
  let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
  const pts = [];
  // Pre-rendered glow sprite (cheaper than shadowBlur)
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
  const sg = sprite.getContext('2d'), grd = sg.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, 'rgba(255,241,201,1)'); grd.addColorStop(0.25, 'rgba(241,201,107,.7)'); grd.addColorStop(1, 'rgba(241,201,107,0)');
  sg.fillStyle = grd; sg.fillRect(0, 0, 32, 32);
  const size = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = cvs.clientWidth; h = cvs.clientHeight;
    cvs.width = Math.round(w * dpr); cvs.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  for (let i = 0; i < N; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: -0.1 - Math.random() * 0.3, r: 4 + Math.random() * 10, a: 0.3 + Math.random() * 0.6 });
  new ResizeObserver(size).observe(cvs);
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < N; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
      for (let j = i + 1; j < N; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
        if (d2 < 12000) { ctx.strokeStyle = `rgba(241,201,107,${0.12 * (1 - d2 / 12000)})`; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      ctx.globalAlpha = p.a; ctx.drawImage(sprite, p.x - p.r / 2, p.y - p.r / 2, p.r, p.r); ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(tick);
  };
  const run = () => { cancelAnimationFrame(raf); if (visible && !document.hidden) raf = requestAnimationFrame(tick); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; run(); }).observe(cvs);
  document.addEventListener('visibilitychange', run);
}

/* ---------------------------------------------------------------------------
   vCard download
   ------------------------------------------------------------------------ */
function initVCard() {
  const btn = $('#saveContact'); if (!btn) return;
  btn.addEventListener('click', () => {
    const v = [
      'BEGIN:VCARD', 'VERSION:3.0',
      'N:Kaur;Navjot;;Dr.;', `FN:${CONFIG.NAME}`,
      `ORG:${CONFIG.ORG}`, `TITLE:${CONFIG.JOB_TITLE}`,
      `TEL;TYPE=CELL,VOICE:${CONFIG.CONTACT_PHONE}`,
      `EMAIL;TYPE=INTERNET:${CONFIG.CONTACT_EMAIL}`,
      `URL:${CONFIG.SITE_URL}/`,
      `X-SOCIALPROFILE;TYPE=instagram:${CONFIG.INSTAGRAM_URL}`,
      `X-SOCIALPROFILE;TYPE=linkedin:${CONFIG.LINKEDIN_URL}`,
      'NOTE:Educationist · Author · Keynote Speaker · Mrs. India Planet 2022',
      'END:VCARD'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'Dr-Navjot-Kaur.vcf' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
}

/* ---------------------------------------------------------------------------
   Lightbox (keyboard + swipe)
   ------------------------------------------------------------------------ */
const Lightbox = {
  i: 0, isOpen: false, opener: null,
  init() {
    this.el = $('#lightbox'); this.media = $('#lbMedia'); this.cap = $('#lbCap'); this.count = $('#lbCount');
    document.addEventListener('click', e => {
      const b = e.target.closest('.tile button.open'); if (!b) return;
      this.opener = b; this.open(+b.closest('[data-lb-index]').dataset.lbIndex);
    });
    $$('[data-lb]', this.el).forEach(b => b.addEventListener('click', () => this.go(+b.dataset.lb)));
    $('[data-lb-close]', this.el).addEventListener('click', () => this.close());
    this.el.addEventListener('click', e => { if (e.target === this.el || e.target.id === 'lbStage') this.close(); });
    this.el.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
      else if (e.key === 'ArrowRight') this.go(1);
      else if (e.key === 'ArrowLeft') this.go(-1);
      else trap(e, [this.el]);
    });
    let sx = 0, sy = 0;
    this.el.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    this.el.addEventListener('pointerup', e => {
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && e.pointerType !== 'mouse') this.go(dx < 0 ? 1 : -1);
    });
  },
  render() {
    const it = LB_ITEMS[this.i];
    if (it.type === 'video') {
      this.media.innerHTML = `<video controls playsinline autoplay muted loop poster="${cPoster(it.src, 1080)}" aria-label="${esc(it.alt)}"><source src="${cVideo(it.src, finePointer ? 1280 : 720)}" type="video/mp4"></video>`;
    } else {
      this.media.innerHTML = `<img src="${cImg(it.src, 1800)}" srcset="${cSrcset(it.src, null, [800, 1200, 1800])}" sizes="90vw" alt="${esc(it.alt)}" width="1200" height="1500">`;
    }
    this.cap.textContent = it.caption ? `${it.caption} · ${it.alt}` : it.alt;
    this.count.textContent = `${this.i + 1} / ${LB_ITEMS.length}`;
  },
  open(i) {
    Videos.pauseAll();
    this.i = i; this.isOpen = true;
    this.el.hidden = false;
    this.render();
    lockScroll(true);
    requestAnimationFrame(() => { this.el.classList.add('is-open'); $('[data-lb-close]', this.el).focus({ preventScroll: true }); });
  },
  go(d) { this.i = (this.i + d + LB_ITEMS.length) % LB_ITEMS.length; this.render(); },
  close() {
    this.isOpen = false;
    this.el.classList.remove('is-open');
    this.media.innerHTML = '';
    lockScroll(false);
    setTimeout(() => { if (!this.isOpen) this.el.hidden = true; }, 400);
    if (this.opener) this.opener.focus({ preventScroll: true });
  }
};

/* ---------------------------------------------------------------------------
   Order drawer: details → UPI pay (deep link / QR) → UTR → /api/order
   ------------------------------------------------------------------------ */
const Order = {
  qty: 1, ref: null, step: 1, isOpen: false,
  total() { return this.qty * CONFIG.BOOK_PRICE_INR + CONFIG.SHIPPING_INR; },
  init() {
    this.d = $('#drawer'); this.scrim = $('#scrim'); this.form = $('#orderForm');
    $('#buyDirect').addEventListener('click', () => this.open());
    this.scrim.addEventListener('click', () => this.close());
    $$('[data-close]', this.d).forEach(b => b.addEventListener('click', () => this.close()));
    this.d.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); else trap(e, [this.d]); });
    $$('[data-qty]', this.d).forEach(b => b.addEventListener('click', () => {
      this.qty = Math.min(CONFIG.MAX_QTY, Math.max(1, this.qty + +b.dataset.qty)); this.sum();
    }));
    $$('[data-next]', this.d).forEach(b => b.addEventListener('click', () => this.goto(+b.dataset.next)));
    $('#copyUpi').addEventListener('click', () => this.copy());
    $('#showQr').addEventListener('click', () => { $('#payBox').className = 'pay-box is-desktop-pay'; this.qr(); });
    this.form.addEventListener('submit', e => { e.preventDefault(); this.submit(); });
    $('#upiIdText').textContent = CONFIG.UPI_ID;
    $('#payeeName').textContent = CONFIG.UPI_PAYEE_NAME;
    $$('input,textarea', this.form).forEach(i => i.addEventListener('input', () => i.removeAttribute('aria-invalid')));
    this.sum();
  },
  sum() {
    $('#qtyOut').textContent = this.qty;
    $('#sumQty').textContent = this.qty;
    $('#sumSub').textContent = inr(this.qty * CONFIG.BOOK_PRICE_INR);
    $('#sumShip').textContent = inr(CONFIG.SHIPPING_INR);
    $('#sumTot').textContent = inr(this.total());
  },
  open() {
    if (this.step === 4) { this.form.reset(); this.qty = 1; this.ref = null; this.sum(); this.goto(1, true); }
    this.opener = document.activeElement;
    this.isOpen = true;
    this.d.hidden = false;
    requestAnimationFrame(() => { this.d.classList.add('is-open'); this.scrim.classList.add('is-open'); });
    lockScroll(true);
    setTimeout(() => { const f = $('.step.is-active input:not([tabindex="-1"]), .step.is-active button', this.d); if (f) f.focus({ preventScroll: true }); }, 350);
  },
  close() {
    this.isOpen = false;
    this.d.classList.remove('is-open'); this.scrim.classList.remove('is-open');
    lockScroll(false);
    setTimeout(() => { if (!this.isOpen) this.d.hidden = true; }, 600);
    if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true });
  },
  goto(n, silent) {
    if (!silent && n === 2 && this.step === 1 && !this.validate1()) return;
    if (n === 2) this.preparePay();
    this.step = n;
    $$('.step', this.d).forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
    $$('[data-step-ind]', this.d).forEach(li => {
      const k = +li.dataset.stepInd;
      li.classList.toggle('is-active', k === n); li.classList.toggle('is-done', k < n);
      if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    this.d.scrollTop = 0;
    if (!silent) setTimeout(() => { const f = $('.step.is-active input, .step.is-active a.btn, .step.is-active button', this.d); if (f) f.focus({ preventScroll: true }); }, 60);
  },
  field(n) { return this.form.elements[n]; },
  validate1() {
    const err = $('#err1'); err.textContent = '';
    const checks = [
      ['name', v => v.trim().length >= 2, 'Please enter your full name.'],
      ['phone', v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '')), 'Please enter a valid 10-digit Indian mobile number.'],
      ['pincode', v => /^[1-9]\d{5}$/.test(v.trim()), 'Please enter a valid 6-digit pincode.'],
      ['email', v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), 'Please enter a valid email address.'],
      ['address', v => v.trim().length >= 10, 'Please enter your full delivery address.']
    ];
    for (const [n, ok, msg] of checks) {
      const el = this.field(n);
      if (!ok(el.value)) { el.setAttribute('aria-invalid', 'true'); err.textContent = msg; el.focus(); return false; }
    }
    return true;
  },
  upiLink() {
    const p = new URLSearchParams({ pa: CONFIG.UPI_ID, pn: CONFIG.UPI_PAYEE_NAME, am: this.total().toFixed(2), cu: 'INR', tn: this.ref });
    return 'upi://pay?' + p.toString().replace(/\+/g, '%20').replace(/%40/g, '@');
  },
  preparePay() {
    if (!this.ref) this.ref = 'NK-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase();
    $('#orderRef').textContent = this.ref;
    $('#payAmt').textContent = inr(this.total());
    $('#payAmt2').textContent = inr(this.total());
    $('#upiLink').href = this.upiLink();
    const mobile = mq('(pointer: coarse)').matches && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    $('#payBox').className = 'pay-box ' + (mobile ? 'is-mobile-pay' : 'is-desktop-pay');
    if (!mobile) this.qr();
  },
  loadQrLib() {
    if (window.qrcode) return Promise.resolve();
    if (this._qrP) return this._qrP;
    this._qrP = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = CONFIG.QR_LIB.src; s.integrity = CONFIG.QR_LIB.integrity; s.crossOrigin = 'anonymous'; s.async = true;
      s.onload = res; s.onerror = () => { this._qrP = null; rej(); };
      document.head.appendChild(s);
    });
    return this._qrP;
  },
  qr() {
    const box = $('#qrBox');
    const link = this.upiLink();
    if (box.dataset.for === link) return;
    this.loadQrLib().then(() => {
      const q = window.qrcode(0, 'M'); q.addData(link); q.make();
      box.innerHTML = `<img src="${q.createDataURL(6, 2)}" alt="UPI QR code to pay ${esc(inr(this.total()))}" width="196" height="196">`;
      box.dataset.for = link;
    }).catch(() => { box.innerHTML = '<p class="note" style="color:#333">QR unavailable. Use the UPI ID below.</p>'; });
  },
  copy() {
    const btn = $('#copyUpi span');
    const ok = () => { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy UPI ID'; }, 1800); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(CONFIG.UPI_ID).then(ok, () => {});
    else {
      const t = Object.assign(document.createElement('textarea'), { value: CONFIG.UPI_ID });
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* ignore */ }
      t.remove();
    }
  },
  async submit() {
    const err = $('#err3'); err.textContent = '';
    const utrEl = this.field('utr');
    const utr = utrEl.value.replace(/\s/g, '');
    if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) { utrEl.setAttribute('aria-invalid', 'true'); err.textContent = 'Please enter the UTR / transaction ID from your UPI app (usually 12 digits).'; utrEl.focus(); return; }
    const btn = $('#submitOrder');
    btn.disabled = true; btn.lastChild.textContent = 'Submitting…';
    const f = n => this.field(n).value.trim();
    try {
      const res = await fetch(CONFIG.ORDER_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: this.ref, name: f('name'), phone: f('phone'), email: f('email'), address: f('address'), pincode: f('pincode'), qty: this.qty, amount: this.total(), utr, company: f('company') })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      $('#successRef').textContent = data.ref || this.ref;
      this.goto(4);
      $('#successBox').focus();
      confetti();
    } catch (e) {
      err.innerHTML = `${esc(e.message === 'Failed to fetch' ? 'Network error. Please check your connection.' : e.message)} You can also <a href="https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(`Book order ${this.ref}, UTR ${utr}`)}" target="_blank" rel="noopener" style="text-decoration:underline">send it on WhatsApp</a>.`;
    } finally {
      btn.disabled = false; btn.lastChild.textContent = 'Submit order';
    }
  }
};

/* Confetti burst (skipped for reduced motion) */
function confetti() {
  if (reduced) return;
  const c = Object.assign(document.createElement('canvas'), { className: 'confetti' });
  c.setAttribute('aria-hidden', 'true');
  document.body.appendChild(c);
  const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  c.width = W * dpr; c.height = H * dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
  const cols = ['#F1C96B', '#FFF1C9', '#FF6FAE', '#8B6CFF', '#5CD3F5', '#ffffff'];
  const P = Array.from({ length: 150 }, () => ({ x: W / 2, y: H * 0.55, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6, s: 5 + Math.random() * 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0] }));
  const t0 = performance.now();
  const f = t => {
    ctx.clearRect(0, 0, W, H);
    P.forEach(p => { p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
    if (t - t0 < 2600) requestAnimationFrame(f); else c.remove();
  };
  requestAnimationFrame(f);
}

/* ---------------------------------------------------------------------------
   Boot
   ------------------------------------------------------------------------ */
/* Critical work first, then yield between chunks so no single task blocks input */
const yieldToMain = () => new Promise(r => setTimeout(r, 0));
async function boot() {
  bindConfig();
  mountHero();
  initLenis();
  Menu.init();
  initScrollUI();
  initHeroIntro();
  for (const step of [mountSlots, mountGalleries, initMarquees, initMotion, initPointer, () => { initVCard(); Lightbox.init(); Order.init(); }]) {
    await yieldToMain();
    step();
  }
  // Particles are pure decoration: start them once the hero intro has played
  setTimeout(initParticles, (heroDelay + 1.6) * 1000);

  if (hasGSAP) {
    // Keep trigger positions right when fonts swap or content-visibility sections render
    const refresh = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => ST.refresh(), 250); }; })();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    let lastH = 0;
    new ResizeObserver(() => { const hgt = document.body.scrollHeight; if (Math.abs(hgt - lastH) > 2) { lastH = hgt; refresh(); } }).observe(document.body);
  }
  if (location.hash && location.hash.length > 1) {
    const t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(() => scrollToTarget(t), splashShown ? 1200 : 100);
  }
}
boot().catch(err => console.error(err));
})();
