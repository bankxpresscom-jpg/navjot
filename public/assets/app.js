/* =============================================================================
   Dr. Navjot Kaur: site script
   -----------------------------------------------------------------------------
   1. CONFIG  : contact details, WhatsApp ordering, books (edit here)
   2. LIB     : every source asset on Cloudinary, keyed once
   3. ASSETS  : which asset goes in which slot (re-map in seconds)
   4. Modules : media, galleries, menu, motion, WhatsApp drawer, lightbox
   Optional deferred libraries: gsap, ScrollTrigger, Lenis. The page stays
   fully usable if any of them fail to load.
   ========================================================================== */
(() => {
'use strict';

/* ---------------------------------------------------------------------------
   1. CONFIG
   ------------------------------------------------------------------------ */
const C = 'https://res.cloudinary.com/dhn6pvsr1';
const CONFIG = {
  SITE_URL: 'https://drnavjotkaur.example',            // placeholder domain (npm run set-domain)
  NAME: 'Dr. Navjot Kaur',

  // Orders and speaking invitations are sent to this WhatsApp number (country code, no +)
  WHATSAPP_NUMBER: '917743031578',
  CONTACT_PHONE: '+917743031578',
  CONTACT_PHONE_DISPLAY: '+91 77430 31578',
  CONTACT_EMAIL: 'hello@example.com',                   // dummy: replace with her email
  INSTAGRAM_URL: 'https://www.instagram.com/kaaurdrnavjot',
  LINKEDIN_URL: 'https://www.linkedin.com/in/dr-navjot-kaur-087a85318/',
  ORG: 'Quest International School',
  JOB_TITLE: 'Keynote Speaker · Author · Educationist',
  MAX_QTY: 20,

  /* Books. The featured book is the hero of the Books section.
     The other four appear on the "Also by" shelf as soon as a title is filled in.
     `cover` is optional (a typographic cover is drawn without one); `amazon` is optional. */
  BOOKS: [
    { id: 'cosmic', title: 'Cosmic Map of Answers', featured: true,
      cover: `${C}/image/upload/v1790247244/71to1VD6NoL._SL1500__mxv5zk.jpg`, amazon: 'https://amzn.in/d/0aum2eAt' },
    { id: 'book-2', title: '', cover: '', amazon: '' },
    { id: 'book-3', title: '', cover: '', amazon: '' },
    { id: 'book-4', title: '', cover: '', amazon: '' },
    { id: 'book-5', title: '', cover: '', amazon: '' }
  ],

  CRAFTED_BY: { label: 'Crafted by', name: 'Your Studio', url: '' },
  MAX_PLAYING_VIDEOS: 2
};

/* ---------------------------------------------------------------------------
   2. LIB: every uploaded asset
   ------------------------------------------------------------------------ */
const LIB = {
  // Brand photographs (her own)
  hero:        `${C}/image/upload/v1790510343/hero_image_iadrrl.jpg`,
  author1:     `${C}/image/upload/v1790510349/author_photo_1_isytai.jpg`,
  author2:     `${C}/image/upload/v1790510351/author_photo_2_t5pztb.jpg`,
  author3:     `${C}/image/upload/v1790510346/author_photo_3_ww7rlr.jpg`,
  author4:     `${C}/image/upload/v1790510341/author_photo_4_bbqvwu.jpg`,
  author5:     `${C}/image/upload/v1790510342/author_photo_5_jq8mq8.jpg`,
  author6:     `${C}/image/upload/v1790510342/author_photo_6_xlogdn.jpg`,
  // Organisation logos
  logoWAAF:    `${C}/image/upload/v1790510338/world_academic_achievers_logo_geu0ea.jpg`,
  logoGWAC:    `${C}/image/upload/v1790510338/the_global_women_achievers_circle_logo_tmtstx.jpg`,
  logoYDC:     `${C}/image/upload/v1790510342/youth_diplomatic_conclave_logo_klpqwl.png`,
  // Book
  bookCover:   `${C}/image/upload/v1790247244/71to1VD6NoL._SL1500__mxv5zk.jpg`,
  // Events, awards, community
  dsc4230:     `${C}/image/upload/v1790248009/DSC_4230.JPG_vzqbab.jpg`,
  pngF3dc:     `${C}/image/upload/v1790248009/file_00000000f3dc7207821deb2fc9ad53ca_kf3vhd.png`,
  img2243:     `${C}/image/upload/v1790248006/2243.JPG_qkcfad.jpg`,
  png2ca8:     `${C}/image/upload/v1790248005/file_000000002ca87206b60a14e4c7c15940_gbrrga.png`,
  dsc4235:     `${C}/image/upload/v1790248003/DSC_4235.JPG_tcaqwh.jpg`,
  navjot05:    `${C}/image/upload/v1790248001/navjot-05.jpg_kjhfs3.jpg`,
  pngF774:     `${C}/image/upload/v1790248000/file_00000000f774821188521d9e4ead005b_jlajt7.png`,
  screenshot:  `${C}/image/upload/v1790247996/Screenshot_20260516_105328_ChatGPT.jpg_lltc0n.jpg`,
  img20220511: `${C}/image/upload/v1790247994/IMG_20220511_111105_1.jpg_rzwwxl.jpg`,
  ayaam2022:   `${C}/image/upload/v1790247994/ayam_2022-1-1.jpg_cugy16.jpg`,
  p1000250327: `${C}/image/upload/v1790247993/1000250327.jpg_ymehoq.jpg`,
  wa20240919:  `${C}/image/upload/v1790247991/IMG-20240919-WA0015.jpg_qfulbr.jpg`,
  navjot07:    `${C}/image/upload/v1790247699/navjot-07.jpg_oa4wml.jpg`,
  p1000381797: `${C}/image/upload/v1790247680/1000381797.jpg_v6eqxd.jpg`,
  drNavjotPng: `${C}/image/upload/v1790247661/DR._NAVJOT_ud6jom.png`,
  wa20260922:  `${C}/image/upload/v1790247660/IMG-20260922-WA0026.jpg_ztj4bw.jpg`,
  p20240713:   `${C}/image/upload/v1790247659/20240713_120931_1.jpg_vh6opi.jpg`,
  p20251206:   `${C}/image/upload/v1790247657/20251206_145715.jpg_jqvwqr.jpg`,
  p20250705b:  `${C}/image/upload/v1790247657/20250705_122055.jpg_pxvimo.jpg`,
  wa20250325:  `${C}/image/upload/v1790247656/IMG-20250325-WA0007.jpg_dxoieq.jpg`,
  p20250705a:  `${C}/image/upload/v1790247654/20250705_121907.jpg_tvsxs9.jpg`,
  p20250325:   `${C}/image/upload/v1790247654/20250325_085754.jpg_vefo2i.jpg`,
  p20231201:   `${C}/image/upload/v1790247653/20231201_141109.jpg_te5row.jpg`,
  // Videos
  vStage:      `${C}/video/upload/v1790248003/IMG_2677_uatv8n.mov`,
  v211837:     `${C}/video/upload/v1790247763/1000211837_z2l8zl.mp4`,
  v418113:     `${C}/video/upload/v1790247723/1000418113_xltbgr.mp4`,
  v424527:     `${C}/video/upload/v1790247719/1000424527_ubi3fk.mp4`,
  v416510:     `${C}/video/upload/v1790247708/1000416510_j7odyb.mp4`,
  vWa251206:   `${C}/video/upload/v1790247699/VID-20251206-WA0006_1_2_ru2zyw.mp4`,
  v416969:     `${C}/video/upload/v1790247697/1000416969_goj4gu.mov`
};

/* ---------------------------------------------------------------------------
   3. ASSETS: slot mapping. `pos` = CSS object-position (crops are also
   face-aware server-side). `small: true` = compressed WhatsApp media.
   ------------------------------------------------------------------------ */
const img = (src, alt, extra = {}) => ({ type: 'image', src, alt, ...extra });
const vid = (src, alt, extra = {}) => ({ type: 'video', src, alt, ...extra });
const ASSETS = {
  hero: { src: LIB.hero, alt: 'Portrait of Dr. Navjot Kaur', pos: '50% 22%' },   // keep in sync with the <img> + preload in index.html
  about: {
    portrait:    img(LIB.author1, 'Dr. Navjot Kaur', { pos: '50% 20%' }),
    portraitAlt: img(LIB.author6, 'Dr. Navjot Kaur', { pos: '50% 20%' }),         // cross-fades with the portrait
    second:      img(LIB.author2, 'Dr. Navjot Kaur', { pos: '50% 20%' })
  },
  speaker: {
    portrait: img(LIB.author3, 'Dr. Navjot Kaur speaking', { pos: '50% 20%' }),
    video: LIB.vStage                                                           // plays over the portrait when in view
  },
  books: { cover: img(LIB.bookCover, 'Cover of Cosmic Map of Answers by Dr. Navjot Kaur') },
  leadership: {
    waaf: img(LIB.logoWAAF, 'World Academic Achievers Forum logo'),
    ydc:  img(LIB.logoYDC,  'Youth Diplomatic Conclave logo'),
    gwac: img(LIB.logoGWAC, 'The Global Women Achievers Circle logo')
  },
  honors: {
    photos: [
      img(LIB.dsc4235,     'Dr. Navjot Kaur, Mrs. India Planet 2022', { caption: 'Mrs. India Planet 2022', pos: '50% 20%' }),
      img(LIB.p20231201,   'Dr. Navjot Kaur at an awards ceremony', { caption: 'Honoured on an international stage', pos: '50% 25%' }),
      img(LIB.img2243,     'Dr. Navjot Kaur receiving an honour', { caption: 'Recognised for leadership in education', pos: '50% 25%' }),
      img(LIB.p1000381797, 'Dr. Navjot Kaur at an award event', { caption: 'A moment of honour', pos: '50% 25%' })
    ]
  },
  media: { cover: img(LIB.navjot07, 'Dr. Navjot Kaur, cover feature of Diva Planet Magazine', { pos: '50% 20%' }) },
  contact: { portrait: img(LIB.author5, 'Dr. Navjot Kaur', { pos: '50% 20%' }) },

  // Speaker section: moving film strip
  stageStrip: [
    img(LIB.navjot05,   'Dr. Navjot Kaur', { ar: '3:4' }),
    img(LIB.p20240713,  'Dr. Navjot Kaur at an education summit', { ar: '4:5' }),
    img(LIB.dsc4230,    'Dr. Navjot Kaur', { ar: '3:4' }),
    img(LIB.p20251206,  'Dr. Navjot Kaur at an event', { ar: '4:5' }),
    img(LIB.p20250705a, 'Dr. Navjot Kaur addressing guests', { ar: '3:4' }),
    img(LIB.img20220511,'Dr. Navjot Kaur at an event in 2022', { ar: '4:5' })
  ],

  // Impact bento. `span` = grid spans; `order` interleaves with the static text tiles (2, 5, 8)
  impact: [
    img(LIB.ayaam2022,   'Dr. Navjot Kaur as Chief Guest at Ayaam 2022', { caption: 'Chief Guest · Ayaam 2022', span: 'w2 h2', order: 1 }),
    vid(LIB.v416510,     'Video from a community event', { caption: 'In the community', span: 'h2', order: 3 }),
    img(LIB.p1000250327, 'Dr. Navjot Kaur with women at a social event', { caption: 'Women empowerment', order: 4 }),
    img(LIB.wa20240919,  'Dr. Navjot Kaur at an awareness programme', { caption: 'Awareness drive', order: 6, small: true }),
    vid(LIB.v416969,     'Video from a women empowerment programme', { caption: 'Workshop moments', span: 'h2', order: 7 }),
    img(LIB.p20250325,   'Dr. Navjot Kaur addressing a gathering', { caption: 'Encouraging every woman', span: 'w2', order: 9 }),
    vid(LIB.v418113,     'Video of Dr. Navjot Kaur speaking', { caption: 'On stage', order: 10 }),
    img(LIB.wa20250325,  'Dr. Navjot Kaur with participants', { caption: 'Together', order: 11, small: true })
  ],

  // Gallery: two rows of moving images (open in the lightbox)
  galleryA: [
    img(LIB.author4,     'Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.p20250705b,  'Dr. Navjot Kaur with guests', { ar: '1:1' }),
    vid(LIB.v211837,     'Highlight video of Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.pngF3dc,     'Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.pngF774,     'Dr. Navjot Kaur', { ar: '1:1' }),
    vid(LIB.vWa251206,   'Short video clip, December 2025', { ar: '4:5', small: true })
  ],
  galleryB: [
    img(LIB.drNavjotPng, 'Dr. Navjot Kaur', { ar: '1:1' }),
    vid(LIB.v424527,     'Video of Dr. Navjot Kaur at an event', { ar: '4:5' }),
    img(LIB.png2ca8,     'Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.wa20260922,  'Dr. Navjot Kaur at a recent event', { ar: '1:1', small: true }),
    img(LIB.author2,     'Dr. Navjot Kaur', { ar: '4:5' }),
    // Disabled: probably a screenshot. Set enabled: true only if it is a clean photo.
    img(LIB.screenshot,  'Dr. Navjot Kaur', { ar: '4:5', enabled: false })
  ],

  menu: {
    home: LIB.hero, about: LIB.author1, speaker: LIB.author3, books: LIB.bookCover, leadership: LIB.author6,
    honors: LIB.dsc4235, impact: LIB.ayaam2022, media: LIB.navjot07, gallery: LIB.author4, contact: LIB.author5
  }
};

/* ---------------------------------------------------------------------------
   Cloudinary helpers
   ------------------------------------------------------------------------ */
const WIDTHS = [480, 800, 1200, 1600];
const tx = (url, t) => url.replace('/upload/', `/upload/${t}/`);
/** `ar` ("4:5") → face-aware fill crop; no `ar` → c_limit (no crop, for logos, covers, cutouts) */
const cImg = (url, w, ar) => tx(url, ar ? `f_auto,q_auto,c_fill,g_auto,ar_${ar},w_${w}` : `f_auto,q_auto,c_limit,w_${w}`);
const cSrcset = (url, ar, widths = WIDTHS) => widths.map(w => `${cImg(url, w, ar)} ${w}w`).join(', ');
/** Video: .mov is requested as .mp4 so Cloudinary transcodes to H.264 */
const cVideo = (url, w) => tx(url, `f_auto:video,q_auto,c_limit,w_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.mp4');
/** Poster frame grab: same path, so_1, .jpg */
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
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = id => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const resolve = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), ASSETS);
const books = () => CONFIG.BOOKS.filter(b => b.title && b.title.trim());
const featured = () => books().find(b => b.featured) || books()[0];

if (reduced) html.classList.add('reduced');
if (hasGSAP) { gsap.registerPlugin(ST); html.classList.add('motion'); } else html.classList.add('no-gsap');

/* ---------------------------------------------------------------------------
   CONFIG → DOM
   ------------------------------------------------------------------------ */
function bindConfig() {
  const f = featured();
  const hrefs = {
    tel: `tel:${CONFIG.CONTACT_PHONE}`, mailto: `mailto:${CONFIG.CONTACT_EMAIL}`,
    whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`, instagram: CONFIG.INSTAGRAM_URL,
    linkedin: CONFIG.LINKEDIN_URL, amazon: (f && f.amazon) || ''
  };
  const texts = { phoneDisplay: CONFIG.CONTACT_PHONE_DISPLAY, email: CONFIG.CONTACT_EMAIL, featuredTitle: f ? f.title : '' };
  $$('[data-cfg-href]').forEach(a => { const v = hrefs[a.dataset.cfgHref]; if (v) a.href = v; else if (a.dataset.cfgHref === 'amazon') a.hidden = true; });
  $$('[data-cfg-text]').forEach(el => { const v = texts[el.dataset.cfgText]; if (v) el.textContent = v; });
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  const cb = $('#craftedBy');
  if (cb) {
    const { label, name, url } = CONFIG.CRAFTED_BY;
    cb.innerHTML = url ? `${esc(label)} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(name)}</a>` : `${esc(label)} ${esc(name)}`;
  }
  if (f && f.cover) ASSETS.books.cover.src = f.cover;
}

/* ---------------------------------------------------------------------------
   Media
   ------------------------------------------------------------------------ */
function makeImg(item, { ar, sizes = '100vw', eager = false } = {}) {
  const im = new Image();
  const [aw, ah] = (ar || '4:5').split(':').map(Number);
  im.width = 800; im.height = Math.round(800 * ah / aw);
  im.decoding = 'async';
  im.loading = eager ? 'eager' : 'lazy';
  im.sizes = sizes;
  im.srcset = cSrcset(item.src, ar);
  im.src = cImg(item.src, 800, ar);
  im.alt = item.alt || '';
  if (item.pos) im.style.objectPosition = item.pos;
  return im;
}
function failSafe(im, host) {
  const fail = () => host.classList.add('is-failed');
  im.addEventListener('error', fail, { once: true });
  if (im.complete && im.naturalWidth === 0 && im.src) fail();
}
function wrapInner(im) { const d = document.createElement('div'); d.className = 'inner'; d.appendChild(im); return d; }

function mountSlots() {
  $$('[data-slot]').forEach(host => {
    const item = resolve(host.dataset.slot);
    if (!item || item.enabled === false) { host.classList.add('is-failed'); return; }
    const fit = host.dataset.fit === 'limit';
    const ar = fit ? null : (host.dataset.ar || '4:5');
    const im = makeImg(item, { ar, sizes: host.dataset.sizes || '50vw' });
    if (fit) { im.width = 600; im.height = 900; }
    failSafe(im, host);
    if (fit) host.prepend(im); else host.prepend(wrapInner(im));
    // Cross-fading portrait
    if (host.dataset.crossfade) {
      const alt = resolve(host.dataset.crossfade);
      if (alt) {
        const im2 = makeImg(alt, { ar, sizes: host.dataset.sizes });
        const layer = wrapInner(im2); layer.classList.add('is-off');
        host.insertBefore(layer, host.firstChild.nextSibling);
        const first = host.firstChild;
        let on = false;
        setInterval(() => {
          if (document.hidden || !inView(host)) return;
          on = !on; layer.classList.toggle('is-off', !on); first.classList.toggle('is-off', on);
        }, 5200);
      }
    }
  });
  $$('[data-slot-caption]').forEach(el => { const it = resolve(el.dataset.slotCaption); if (it) el.textContent = it.caption || ''; });
}
const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };

function mountHero() {
  const media = $('#heroMedia'), im = $('#heroImg'); if (!media || !im) return;
  const h = ASSETS.hero;
  im.srcset = cSrcset(h.src, '4:5');       // identical to the preloaded URLs → cache hit
  im.alt = h.alt;
  media.style.setProperty('--pos', h.pos);
  failSafe(im, media);
}

/* ---------------------------------------------------------------------------
   Videos: IntersectionObserver play/pause, max concurrent playback
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
  make(src, w) {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    v.dataset.src = cVideo(src, w);
    v.addEventListener('error', () => v.remove());
    return v;
  },
  register(v, host, { threshold = 0.6, hover = finePointer } = {}) {
    v.addEventListener('playing', () => host.classList.add('is-playing'));
    v.addEventListener('pause', () => host.classList.remove('is-playing'));
    if (saveData || reduced) return;
    if (!hover) {
      new IntersectionObserver(([e]) => { if (e.isIntersecting && !document.hidden) this.play(v); else this.pause(v); }, { threshold }).observe(host);
    } else {
      host.addEventListener('pointerenter', () => this.play(v));
      host.addEventListener('pointerleave', () => this.pause(v));
    }
  }
};
document.addEventListener('visibilitychange', () => { if (document.hidden) Videos.pauseAll(); });

function mountReel() {
  const reel = $('#reel'); if (!reel || !ASSETS.speaker.video || saveData || reduced) return;
  const v = Videos.make(ASSETS.speaker.video, finePointer ? 1080 : 720);
  v.style.objectPosition = '50% 25%';
  reel.insertBefore(v, $('.tag', reel));
  Videos.register(v, reel, { threshold: 0.35, hover: false });
}

/* ---------------------------------------------------------------------------
   Galleries: bento, film strip, gallery rows (all share the lightbox)
   ------------------------------------------------------------------------ */
const LB_ITEMS = [];
function tile(item, { ar, sizes, cls = '', tag = 'figure', caption = true, hover = true }) {
  const idx = LB_ITEMS.push(item) - 1;
  const el = document.createElement(tag);
  const isVideo = item.type === 'video';
  el.className = `${cls} ${isVideo ? 'vtile' : ''}`.trim();
  el.dataset.lbIndex = idx;
  el.setAttribute('data-reveal', '');
  const frame = document.createElement('div');
  frame.className = 'frame';
  frame.style.setProperty('--ar', ar.replace(':', '/'));
  let im;
  if (isVideo) {
    im = new Image();
    const [aw, ah] = ar.split(':').map(Number);
    im.width = 720; im.height = Math.round(720 * ah / aw);
    im.loading = 'lazy'; im.decoding = 'async'; im.sizes = sizes;
    im.srcset = [480, 720, 1080].map(w => `${cPoster(item.src, w, ar)} ${w}w`).join(', ');
    im.src = cPoster(item.src, 720, ar); im.alt = item.alt;
    frame.appendChild(wrapInner(im));
    if (hover && !saveData) {
      const v = Videos.make(item.src, finePointer ? 720 : 480);
      frame.appendChild(v);
      Videos.register(v, el);
    }
  } else {
    im = makeImg(item, { ar, sizes });
    frame.appendChild(wrapInner(im));
  }
  failSafe(im, frame);
  el.appendChild(frame);
  el.insertAdjacentHTML('beforeend',
    (isVideo ? `<span class="play" aria-hidden="true">${icon('play')}</span>` : '') +
    (caption && item.caption ? `<figcaption class="cap">${icon(isVideo ? 'video' : 'camera')}${esc(item.caption)}</figcaption>` : '') +
    `<button class="open" type="button" aria-label="Open ${isVideo ? 'video' : 'photo'}: ${esc(item.caption || item.alt)}" data-cursor="${isVideo ? 'PLAY' : 'VIEW'}"></button>`);
  return el;
}
function marqueeRow(host, items, { ar = null, sizes = '280px', cls = 'gi' }) {
  if (!host) return;
  const track = document.createElement('div'); track.className = 'marquee-track';
  const set = document.createElement('div'); set.className = 'marquee-set';
  items.filter(i => i.enabled !== false).forEach(item => set.appendChild(tile(item, { ar: ar || item.ar || '4:5', sizes, cls, caption: false, hover: false })));
  track.appendChild(set);
  host.appendChild(track);
  if (reduced) return;
  // Clone for a seamless -50% loop; clones are decorative for assistive tech
  const clone = set.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  $$('[data-reveal]', clone).forEach(n => n.removeAttribute('data-reveal'));
  $$('button', clone).forEach(b => b.tabIndex = -1);
  track.appendChild(clone);
  $$('[data-reveal]', set).forEach(n => n.removeAttribute('data-reveal'));   // rows move on their own
}
function mountGalleries() {
  const bento = $('#impactGrid');
  if (bento) {
    const statics = $$('.tile.text', bento).map(el => ({ el, order: +el.dataset.order }));
    const gen = ASSETS.impact.filter(i => i.enabled !== false).map(item => {
      const span = item.span || '';
      const ar = span.includes('w2') && !span.includes('h2') ? '2:1' : span.includes('h2') && !span.includes('w2') ? '1:2' : '1:1';
      const sizes = span.includes('w2') ? '(min-width: 900px) 50vw, 100vw' : '(min-width: 900px) 25vw, 50vw';
      return { el: tile(item, { ar, sizes, cls: `tile ${span}` }), order: item.order };
    });
    [...statics, ...gen].sort((a, b) => a.order - b.order).forEach(({ el }) => bento.appendChild(el));
  }
  marqueeRow($('#stageStrip'), ASSETS.stageStrip, { sizes: '(min-width: 900px) 19vw, 45vw' });
  marqueeRow($('#rowA'), ASSETS.galleryA, { sizes: '(min-width: 900px) 18vw, 45vw' });
  marqueeRow($('#rowB'), ASSETS.galleryB, { sizes: '(min-width: 900px) 18vw, 45vw' });
}
function initMarquees() {
  if (reduced) return;
  $$('.ribbon .marquee-track, .outlets .marquee-track').forEach(track => {
    const set = $('.marquee-set', track), base = set.innerHTML;
    let g = 0;
    while (set.scrollWidth < innerWidth * 1.1 && g++ < 6) set.insertAdjacentHTML('beforeend', base);
    const clone = set.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone);
  });
}

/* ---------------------------------------------------------------------------
   Book shelf (the four other titles appear once named in CONFIG.BOOKS)
   ------------------------------------------------------------------------ */
function mountShelf() {
  const others = books().filter(b => !b.featured);
  const shelf = $('#shelf'), grid = $('#shelfGrid');
  if (!shelf || !others.length) return;
  others.forEach(b => {
    const el = document.createElement('article');
    el.className = 'shelf-book'; el.setAttribute('data-reveal', '');
    el.innerHTML = `<div class="cover-b">${b.cover ? '' : `<div class="typo"><small>DR. NAVJOT KAUR</small><b>${esc(b.title)}</b></div>`}</div>
      <h3>${esc(b.title)}</h3>
      <div class="btn-row"><button class="link" type="button" data-open="order" data-book="${esc(b.id)}">ORDER ${icon('arrow-r')}</button>${b.amazon ? `<a class="link" href="${esc(b.amazon)}" target="_blank" rel="noopener">AMAZON ${icon('arrow-ur')}</a>` : ''}</div>`;
    if (b.cover) { const im = makeImg({ src: b.cover, alt: `Cover of ${b.title}` }, { ar: null, sizes: '(min-width: 900px) 22vw, 45vw' }); $('.cover-b', el).appendChild(im); }
    grid.appendChild(el);
  });
  shelf.hidden = false;
}

/* ---------------------------------------------------------------------------
   Splash + text splitting
   ------------------------------------------------------------------------ */
const splashShown = !html.classList.contains('no-splash');
try { sessionStorage.setItem('nk-splash', '1'); } catch (e) { /* storage blocked */ }
if (splashShown) setTimeout(() => { const s = $('.splash'); if (s) s.remove(); }, Math.max(0, 1900 - performance.now()));
const heroDelay = splashShown ? Math.max(0, 1150 - performance.now()) / 1000 : 0.05;

function splitWords(el) {
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w';
        const i = document.createElement('span'); i.className = 'wi'; i.textContent = part;
        w.appendChild(i); frag.appendChild(w);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) { if (n.tagName === 'EM') n.classList.add('is-split'); walk(n); }
  });
  walk(el);
}

/* ---------------------------------------------------------------------------
   Smooth scroll + anchors
   ------------------------------------------------------------------------ */
let lenis = null;
function initLenis() {
  if (reduced || !window.Lenis) return;
  lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
  if (hasGSAP) { lenis.on('scroll', ST.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
  else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
}
const lockScroll = on => { document.body.classList.toggle('is-locked', on); if (lenis) on ? lenis.stop() : lenis.start(); };
function scrollToTarget(target) {
  if (!target) return;
  const done = () => {
    if (Math.abs(target.getBoundingClientRect().top) > 2) lenis ? lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView();
    target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
  };
  if (lenis) lenis.scrollTo(target, { duration: 1.4, onComplete: done });
  else { target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); setTimeout(done, reduced ? 50 : 900); }
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const target = document.getElementById(id.slice(1)); if (!target) return;
  e.preventDefault();
  if (Menu.isOpen) { Menu.close(false); setTimeout(() => scrollToTarget(target), 500); } else scrollToTarget(target);
  history.replaceState(null, '', id === '#home' ? location.pathname : id);
});

/* ---------------------------------------------------------------------------
   Scroll UI: progress, top bar, tab bar
   ------------------------------------------------------------------------ */
function initScrollUI() {
  const bar = $('.progress span'), topbar = $('#topbar');
  let lastY = scrollY, ticking = false, docH = 1;
  const measure = () => { docH = Math.max(1, document.documentElement.scrollHeight - innerHeight); };
  measure(); addEventListener('resize', measure, { passive: true }); new ResizeObserver(measure).observe(document.body);
  const update = () => {
    const y = scrollY;
    bar.style.transform = `scaleX(${Math.min(1, y / docH)})`;
    if (!Menu.isOpen) { topbar.classList.toggle('is-hidden', y > lastY && y > 160); topbar.classList.toggle('is-solid', y > 40); }
    lastY = y; ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
  const tabbar = $('#tabbar'), tabs = $$('[data-tab]', tabbar), keys = tabs.map(t => t.dataset.tab);
  const setActive = key => {
    const i = keys.indexOf(key);
    tabbar.classList.toggle('no-active', i < 0);
    tabs.forEach((t, j) => t.setAttribute('aria-current', String(j === i)));
    if (i >= 0) tabbar.style.setProperty('--ti', i);
  };
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(e.target.dataset.section); }), { rootMargin: '-50% 0px -49% 0px' });
  $$('[data-section]').forEach(s => io.observe(s));
  setActive('home');
}

/* ---------------------------------------------------------------------------
   Focus trap
   ------------------------------------------------------------------------ */
const FOCUSABLE = 'a[href]:not([hidden]),button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select,[tabindex]:not([tabindex="-1"])';
function trap(e, nodes) {
  if (e.key !== 'Tab') return;
  const f = nodes.flatMap(n => (n.matches(FOCUSABLE) ? [n] : $$(FOCUSABLE, n))).filter(el => el.offsetParent !== null || el === document.activeElement);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---------------------------------------------------------------------------
   Menu
   ------------------------------------------------------------------------ */
const Menu = {
  isOpen: false,
  init() {
    this.el = $('#menu'); this.btn = $('.burger');
    this.btn.addEventListener('click', () => (this.isOpen ? this.close() : this.open()));
    this.el.addEventListener('keydown', e => trap(e, [this.btn, this.el]));
    this.btn.addEventListener('keydown', e => { if (this.isOpen) trap(e, [this.btn, this.el]); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && this.isOpen) this.close(); });
    const side = $('.menu-side', this.el);
    let built = false;
    this.build = () => {
      if (built || !mq('(min-width: 1025px)').matches) return;
      built = true;
      Object.entries(ASSETS.menu).forEach(([k, src]) => {
        const im = new Image(); im.alt = ''; im.decoding = 'async'; im.width = 600; im.height = 750;
        im.src = cImg(src, 800, '4:5'); im.dataset.k = k; im.addEventListener('error', () => im.remove());
        side.appendChild(im);
      });
    };
    this.show = k => $$('img', side).forEach(i => i.classList.toggle('is-on', i.dataset.k === k));
    $$('.menu-links a', this.el).forEach(a => {
      a.addEventListener('pointerenter', () => this.show(a.dataset.preview));
      a.addEventListener('focus', () => this.show(a.dataset.preview));
    });
  },
  open() {
    this.build();
    this.isOpen = true;
    html.classList.add('menu-open');
    $('#topbar').classList.remove('is-hidden');
    this.el.classList.add('is-open');
    this.btn.setAttribute('aria-expanded', 'true'); this.btn.setAttribute('aria-label', 'Close menu');
    lockScroll(true);
    this.show('home');
    if (hasGSAP && !reduced) gsap.fromTo($$('.menu-links a', this.el), { yPercent: 105 }, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.04, delay: 0.3 });
    setTimeout(() => { const f = $('.menu-links a', this.el); if (f) f.focus({ preventScroll: true }); }, reduced ? 0 : 400);
  },
  close(restoreFocus = true) {
    this.isOpen = false;
    html.classList.remove('menu-open');
    this.el.classList.remove('is-open');
    this.btn.setAttribute('aria-expanded', 'false'); this.btn.setAttribute('aria-label', 'Open menu');
    lockScroll(false);
    if (restoreFocus) this.btn.focus({ preventScroll: true });
  }
};

/* ---------------------------------------------------------------------------
   Motion
   ------------------------------------------------------------------------ */
function startRoles() {
  const wrap = $('#roleRot'); if (!wrap) return;
  const items = $$('span', wrap); let i = 0;
  items[0].classList.add('is-on'); wrap.classList.add('is-running');
  if (reduced) return;
  setInterval(() => {
    if (document.hidden) return;
    const prev = items[i];
    prev.classList.remove('is-on'); prev.classList.add('is-out');
    setTimeout(() => prev.classList.remove('is-out'), 900);
    i = (i + 1) % items.length; items[i].classList.add('is-on');
  }, 2600);
}
function countersStatic() { $$('[data-count]').forEach(el => { el.textContent = el.dataset.count; }); }
function countUp(el) {
  const end = +el.dataset.count, o = { v: 0 };
  gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
}

function initMotion() {
  $$('[data-split]').forEach(splitWords);
  if (!hasGSAP) { countersStatic(); return; }

  const headings = $$('[data-split]'), reveals = $$('[data-reveal]'), clips = $$('.clip-reveal');
  if (!reduced) {
    headings.forEach(h => gsap.set($$('.wi', h), { yPercent: 110 }));
    clips.forEach(c => { gsap.set(c, { clipPath: 'inset(100% 0% 0% 0%)' }); $$('.inner img', c).forEach(im => gsap.set(im, { scale: 1.25 })); });
  }
  gsap.set(reveals, { opacity: 0, y: reduced ? 0 : 36 });
  $$('[data-count]').forEach(el => { el.textContent = '0'; });

  const io = new IntersectionObserver(entries => {
    const batch = entries.filter(e => e.isIntersecting).map(e => e.target);
    batch.forEach(el => io.unobserve(el));
    const rev = batch.filter(el => el.hasAttribute('data-reveal'));
    if (rev.length) gsap.to(rev, { opacity: 1, y: 0, duration: reduced ? 0.6 : 1.1, ease: 'expo.out', stagger: 0.07, clearProps: 'transform' });
    batch.filter(el => el.hasAttribute('data-split')).forEach(h => gsap.to($$('.wi', h), { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.05 }));
    batch.filter(el => el.hasAttribute('data-count')).forEach(countUp);
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  [...headings, ...reveals, ...$$('[data-count]')].forEach(el => io.observe(el));

  // Clip reveals: a fully clipped element never "intersects", so observe its parent
  if (!reduced) {
    const proxyOf = new Map();
    const cio = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      (proxyOf.get(e.target) || []).forEach(c => {
        gsap.to(c, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' });
        $$('.inner img', c).forEach(im => gsap.to(im, { scale: 1, duration: 2, ease: 'expo.out' }));
      });
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    clips.forEach(c => { const p = c.parentElement; proxyOf.set(p, [...(proxyOf.get(p) || []), c]); cio.observe(p); });
  }

  if (reduced) return;

  // Gentle parallax
  gsap.to('.hero-copy', { yPercent: -10, opacity: 0.35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.fromTo('.stack .second', { yPercent: 12 }, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.stack', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.statement', { xPercent: 3 }, { xPercent: -2, ease: 'none', scrollTrigger: { trigger: '#impact', start: 'top bottom', end: 'bottom top', scrub: true } });

  // Moments of Honor: pinned horizontal rail on desktop
  gsap.matchMedia().add('(min-width: 1025px)', () => {
    const sec = $('#honors'), rail = $('#rail'), pin = $('#railPin');
    sec.classList.add('is-pinnable');
    pin.style.paddingLeft = 'var(--pad)';
    const dist = () => Math.max(0, rail.scrollWidth - innerWidth + parseFloat(getComputedStyle(pin).paddingLeft));
    const tw = gsap.to(rail, { x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(rail, { clearProps: 'transform' }); sec.classList.remove('is-pinnable'); pin.style.paddingLeft = ''; };
  });
}

/* ---------------------------------------------------------------------------
   Pointer: label cursor + book tilt (desktop only)
   ------------------------------------------------------------------------ */
function initPointer() {
  if (!finePointer || reduced || !hasGSAP) return;
  html.classList.add('has-cursor');
  const cur = $('.cursor');
  const cx = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('[data-cursor]');
    cur.classList.toggle('is-on', !!t);
    if (t) cur.textContent = t.dataset.cursor;
  });
  const book = $('#book3d'), stage = $('.book-stage');
  if (book && stage) {
    gsap.set(book, { rotationY: -22, rotationX: 4 });
    const bY = gsap.quickTo(book, 'rotationY', { duration: 0.9, ease: 'power3' }), bX = gsap.quickTo(book, 'rotationX', { duration: 0.9, ease: 'power3' });
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); bY(-22 + ((e.clientX - r.left) / r.width - 0.5) * 36); bX(4 - ((e.clientY - r.top) / r.height - 0.5) * 18); });
    stage.addEventListener('pointerleave', () => { bY(-22); bX(4); });
  }
  if (book) book.addEventListener('click', () => Drawer.open('order'));
}

/* ---------------------------------------------------------------------------
   vCard
   ------------------------------------------------------------------------ */
function initVCard() {
  const btn = $('#saveContact'); if (!btn) return;
  btn.addEventListener('click', () => {
    const v = ['BEGIN:VCARD', 'VERSION:3.0', 'N:Kaur;Navjot;;Dr.;', `FN:${CONFIG.NAME}`, `ORG:${CONFIG.ORG}`, `TITLE:${CONFIG.JOB_TITLE}`,
      `TEL;TYPE=CELL,VOICE:${CONFIG.CONTACT_PHONE}`, `EMAIL;TYPE=INTERNET:${CONFIG.CONTACT_EMAIL}`, `URL:${CONFIG.SITE_URL}/`,
      `X-SOCIALPROFILE;TYPE=instagram:${CONFIG.INSTAGRAM_URL}`, `X-SOCIALPROFILE;TYPE=linkedin:${CONFIG.LINKEDIN_URL}`, 'END:VCARD'].join('\r\n');
    const url = URL.createObjectURL(new Blob([v], { type: 'text/vcard;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'Dr-Navjot-Kaur.vcf' });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
}

/* ---------------------------------------------------------------------------
   Lightbox
   ------------------------------------------------------------------------ */
const Lightbox = {
  i: 0, isOpen: false, opener: null,
  init() {
    this.el = $('#lightbox'); this.media = $('#lbMedia'); this.cap = $('#lbCap'); this.count = $('#lbCount');
    document.addEventListener('click', e => {
      const b = e.target.closest('button.open'); if (!b) return;
      this.opener = b; this.open(+b.closest('[data-lb-index]').dataset.lbIndex);
    });
    $$('[data-lb]', this.el).forEach(b => b.addEventListener('click', () => this.go(+b.dataset.lb)));
    $('[data-lb-close]', this.el).addEventListener('click', () => this.close());
    this.el.addEventListener('click', e => { if (e.target === this.el || e.target.id === 'lbStage') this.close(); });
    this.el.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close(); else if (e.key === 'ArrowRight') this.go(1); else if (e.key === 'ArrowLeft') this.go(-1); else trap(e, [this.el]);
    });
    let sx = 0, sy = 0;
    this.el.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    this.el.addEventListener('pointerup', e => { const dx = e.clientX - sx, dy = e.clientY - sy; if (e.pointerType !== 'mouse' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) this.go(dx < 0 ? 1 : -1); });
  },
  render() {
    const it = LB_ITEMS[this.i];
    this.media.innerHTML = it.type === 'video'
      ? `<video controls playsinline autoplay muted loop poster="${cPoster(it.src, 1080)}" aria-label="${esc(it.alt)}"><source src="${cVideo(it.src, finePointer ? 1280 : 720)}" type="video/mp4"></video>`
      : `<img src="${cImg(it.src, 1600)}" srcset="${cSrcset(it.src, null, [800, 1200, 1600])}" sizes="90vw" alt="${esc(it.alt)}" width="1200" height="1500">`;
    this.cap.textContent = it.caption || it.alt;
    this.count.textContent = `${this.i + 1} / ${LB_ITEMS.length}`;
  },
  open(i) {
    Videos.pauseAll();
    this.i = i; this.isOpen = true; this.el.hidden = false; this.render(); lockScroll(true);
    requestAnimationFrame(() => { this.el.classList.add('is-open'); $('[data-lb-close]', this.el).focus({ preventScroll: true }); });
  },
  go(d) { this.i = (this.i + d + LB_ITEMS.length) % LB_ITEMS.length; this.render(); },
  close() {
    this.isOpen = false; this.el.classList.remove('is-open'); this.media.innerHTML = ''; lockScroll(false);
    setTimeout(() => { if (!this.isOpen) this.el.hidden = true; }, 400);
    if (this.opener) this.opener.focus({ preventScroll: true });
  }
};

/* ---------------------------------------------------------------------------
   Drawer: book order / speaking invitation → WhatsApp (email fallback).
   Nothing is stored or paid on the website.
   ------------------------------------------------------------------------ */
const Drawer = {
  mode: 'order', qty: 1, isOpen: false, lastUrl: '',
  COPY: {
    order: { title: 'Order a copy', sub: 'Add your details and send the order to Dr. Navjot Kaur on WhatsApp. She will confirm price, payment and delivery with you directly.' },
    speak: { title: 'Invite to speak', sub: 'Share a few details about your event. The invitation opens in WhatsApp, ready to send to Dr. Navjot Kaur.' }
  },
  init() {
    this.d = $('#drawer'); this.scrim = $('#scrim'); this.form = $('#dForm'); this.err = $('#dErr'); this.mail = $('#altMail');
    const sel = $('#o-book');
    books().forEach(b => sel.add(new Option(b.title, b.id, b.featured, b.featured)));
    document.addEventListener('click', e => { const t = e.target.closest('[data-open]'); if (t) { e.preventDefault(); this.open(t.dataset.open, t.dataset.book, t); } });
    this.scrim.addEventListener('click', () => this.close());
    $$('[data-close]', this.d).forEach(b => b.addEventListener('click', () => this.close()));
    this.d.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); else trap(e, [this.d]); });
    $$('[data-qty]', this.d).forEach(b => b.addEventListener('click', () => { this.qty = Math.min(CONFIG.MAX_QTY, Math.max(1, this.qty + +b.dataset.qty)); $('#qtyOut').textContent = this.qty; this.syncMail(); }));
    this.form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); this.err.textContent = ''; this.syncMail(); });
    this.form.addEventListener('submit', e => { e.preventDefault(); this.send(); });
  },
  open(mode, bookId, opener) {
    this.mode = mode === 'speak' ? 'speak' : 'order';
    this.opener = opener || document.activeElement;
    $('#drawer-h').textContent = this.COPY[this.mode].title;
    $('#drawerSub').textContent = this.COPY[this.mode].sub;
    $$('.mode', this.d).forEach(m => m.classList.toggle('is-on', m.dataset.mode === this.mode));
    if (bookId) $('#o-book').value = bookId;
    this.err.textContent = '';
    this.syncMail();
    this.isOpen = true; this.d.hidden = false; lockScroll(true);
    requestAnimationFrame(() => {
      this.d.classList.add('is-open'); this.scrim.classList.add('is-open');
      const f = $('.mode.is-on input, .mode.is-on select', this.d); if (f) f.focus({ preventScroll: true });
    });
  },
  close() {
    this.isOpen = false; this.d.classList.remove('is-open'); this.scrim.classList.remove('is-open'); lockScroll(false);
    setTimeout(() => { if (!this.isOpen) this.d.hidden = true; }, 600);
    if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true });
  },
  v(name) { const el = this.form.elements[name]; return el ? el.value.trim() : ''; },
  invalid(name, msg) { const el = this.form.elements[name]; el.setAttribute('aria-invalid', 'true'); el.focus(); this.err.textContent = msg; return false; },
  validate() {
    this.err.textContent = '';
    const digits = s => s.replace(/\D/g, '');
    if (this.mode === 'order') {
      if (this.v('name').length < 2) return this.invalid('name', 'Please enter your full name.');
      if (!/^[6-9]\d{9}$/.test(digits(this.v('phone')).replace(/^(91|0)(?=\d{10}$)/, ''))) return this.invalid('phone', 'Please enter a valid 10-digit mobile number.');
      if (!/^[1-9]\d{5}$/.test(this.v('pincode'))) return this.invalid('pincode', 'Please enter a valid 6-digit pincode.');
      if (this.v('address').length < 10) return this.invalid('address', 'Please enter your full delivery address.');
    } else {
      if (this.v('sname').length < 2) return this.invalid('sname', 'Please enter your name.');
      if (digits(this.v('sphone')).length < 7) return this.invalid('sphone', 'Please enter a phone number we can reach you on.');
      if (this.v('org').length < 2) return this.invalid('org', 'Please enter your organisation.');
      if (this.v('event').length < 3) return this.invalid('event', 'Please describe the event.');
    }
    return true;
  },
  message() {
    const L = (k, v) => (v ? `${k}: ${v}\n` : '');
    if (this.mode === 'order') {
      const b = books().find(x => x.id === this.v('book')) || featured();
      return `Hello Dr. Navjot Kaur, I would like to order your book.\n\n` +
        L('Book', b ? b.title : '') + L('Copies', this.qty) + L('Name', this.v('name')) + L('Phone', this.v('phone')) +
        L('Address', this.v('address')) + L('Pincode', this.v('pincode')) + L('Note', this.v('note')) +
        `\nPlease confirm the price, payment and delivery. Thank you!`;
    }
    const date = this.v('date') ? new Date(this.v('date') + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return `Hello Dr. Navjot Kaur, I would like to invite you to speak.\n\n` +
      L('Name', this.v('sname')) + L('Phone', this.v('sphone')) + L('Organisation', this.v('org')) + L('Event', this.v('event')) +
      L('Date', date) + L('City', this.v('city')) + L('Details', this.v('msg')) + `\nLooking forward to hearing from you.`;
  },
  syncMail() {
    const subject = this.mode === 'order' ? 'Book order' : 'Speaking invitation';
    this.mail.href = `mailto:${CONFIG.CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(this.message())}`;
  },
  send() {
    if (!this.validate()) return;
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(this.message())}`;
    this.lastUrl = url;
    // A real link click opens WhatsApp (app on phones, web on desktop) without navigating this page away
    const a = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener' });
    document.body.appendChild(a); a.click(); a.remove();
    this.err.textContent = 'WhatsApp is opening with your message. Just tap send.';
  }
};

/* ---------------------------------------------------------------------------
   Boot: critical first, then yield between chunks
   ------------------------------------------------------------------------ */
const yieldToMain = () => new Promise(r => setTimeout(r, 0));
async function boot() {
  bindConfig();
  mountHero();
  initLenis();
  Menu.init();
  initScrollUI();
  setTimeout(startRoles, heroDelay * 1000 + 1200);
  for (const step of [mountSlots, mountReel, mountGalleries, mountShelf, initMarquees, initMotion, initPointer, () => { initVCard(); Lightbox.init(); Drawer.init(); }]) {
    await yieldToMain();
    step();
  }
  if (hasGSAP) {
    const refresh = (() => { let t; return () => { clearTimeout(t); t = setTimeout(() => ST.refresh(), 250); }; })();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    let lastH = 0;
    new ResizeObserver(() => { const h = document.body.scrollHeight; if (Math.abs(h - lastH) > 2) { lastH = h; refresh(); } }).observe(document.body);
  }
  if (location.hash.length > 1) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => scrollToTarget(t), splashShown ? 1300 : 100); }
}
boot().catch(err => console.error(err));
})();
