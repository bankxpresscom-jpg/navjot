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
  WHATSAPP_NUMBER: '919814724488',
  CONTACT_PHONE: '+919814724488',
  CONTACT_PHONE_DISPLAY: '+91 98147 24488',
  CONTACT_EMAIL: 'Drnavjotkaur2211@gmail.com',
  INSTAGRAM_URL: 'https://www.instagram.com/kaaurdrnavjot',
  LINKEDIN_URL: 'https://www.linkedin.com/in/dr-navjot-kaur-087a85318/',
  ORG: 'Quest International School',
  JOB_TITLE: 'Keynote Speaker · Author · Educationist · Founder & Pageant Director',
  MAX_QTY: 20,

  /* Books: order-form options, and the featured title in the Books section.
     Covers and buy links for the Library cards live in index.html (#library) and ASSETS.books. */
  BOOKS: [
    { id: 'cosmic', title: 'Cosmic Map of Answers', featured: true,
      cover: `${C}/image/upload/v1790247244/71to1VD6NoL._SL1500__mxv5zk.jpg`, amazon: 'https://amzn.in/d/0aum2eAt' },
    { id: 'mother-blessing', title: 'Mother: A Divine Blessing', amazon: 'https://www.amazon.in/dp/9364526813' },
    { id: 'mother-gift', title: 'Mother: A Divine Gift', store: 'https://pnpacademy.in/product/mother-a-divine-gift/' },
    { id: 'mother-creation', title: 'Mother: A Divine Creation', amazon: 'https://www.amazon.in/dp/B0G1YVZVYZ' },
    { id: 'mother-trilogy', title: 'The Mother Trilogy (all three books)' },
    { id: 'gwb', title: 'Gratitude, Wisdom & Blessing', amazon: 'https://www.amazon.in/Gratitude-Wisdom-Blessing-NAVJOT-KAUR/dp/B0F2F62YMG' }
  ],

  CRAFTED_BY: { label: 'Crafted by', name: 'Your Studio', url: '' },
  MAX_PLAYING_VIDEOS: 2
};

/* ---------------------------------------------------------------------------
   2. LIB: every uploaded asset
   ------------------------------------------------------------------------ */
const LIB = {
  // Brand photographs (her own)
  hero:        `${C}/image/upload/v1790774925/ChatGPT_Image_Sep_30_2026_06_56_08_PM_prezqe.png`,   // her chosen hero portrait (Sep 2026)
  aboutPortrait: `${C}/image/upload/v1790772311/file_000000002ca87206b60a14e4c7c15940_1_bejygi.png`, // About arch portrait
  winning:     `${C}/image/upload/v1790774355/file_00000000f4a871fda813fe0b975a5fbe_1_aaulnn.png`,   // her winning picture (gallery)
  author1:     `${C}/image/upload/v1790510349/author_photo_1_isytai.jpg`,        // EdTalk World Conference media interaction
  author2:     `${C}/image/upload/v1790510351/author_photo_2_t5pztb.jpg`,
  author3:     `${C}/image/upload/v1790510346/author_photo_3_ww7rlr.jpg`,
  author4:     `${C}/image/upload/v1790510341/author_photo_4_bbqvwu.jpg`,
  author5:     `${C}/image/upload/v1790510342/author_photo_5_jq8mq8.jpg`,
  // author_photo_6 and the two 'coming soon' images (1000381797, 1000382977) must not be used anywhere
  // Organisation logos
  logoWAAF:    `${C}/image/upload/v1790658467/ChatGPT_Image_Sep_29_2026_10_37_18_AM_kpfe3v.png`,
  logoQuest:   `${C}/image/upload/v1790660033/ChatGPT_Image_Sep_29_2026_11_03_14_AM_gcsupj.png`,
  logoGWAC:    `${C}/image/upload/v1790510338/the_global_women_achievers_circle_logo_tmtstx.jpg`,
  logoYDC:     `${C}/image/upload/v1790510342/youth_diplomatic_conclave_logo_klpqwl.png`,
  // Brand logo (gold NK, transparent PNG): splash, header, footer and favicons reference it in index.html
  logo:        `${C}/image/upload/v1790515212/splash-favicon-logo_yxkwes.png`,
  // Book covers
  bookCover:   `${C}/image/upload/v1790247244/71to1VD6NoL._SL1500__mxv5zk.jpg`,
  coverMotherBlessing: `${C}/image/upload/v1790515433/mother_a_divine_blessing_ltkh3x.jpg`,
  coverMotherGift:     `${C}/image/upload/v1790515213/mother-a-divine-gift_rgdnjg.webp`,
  coverMotherCreation: `${C}/image/upload/v1790515212/mother_a_divine_creation_sb4gmq.jpg`,
  coverGWB:            `${C}/image/upload/v1790515212/gratitude_wisdom_and_blessings_pstm7s.jpg`,
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
  // Awards (2026 update)
  legends:     `${C}/image/upload/v1790658819/WhatsApp_Image_2026-09-28_at_10.41.08_AM_skiefi.jpg`,
  uae2025:     `${C}/image/upload/v1790659752/WhatsApp_Image_2026-09-28_at_12.53.34_PM_sxmxwd.jpg`,
  // Extra photographs (replace the removed ones)
  extra1:      `${C}/image/upload/v1790658821/1000071554.jpg_zsyqbb.jpg`,
  extra2:      `${C}/image/upload/v1790658822/1000118012.jpg_ii6u0c.jpg`,
  extra3:      `${C}/image/upload/v1790658821/file_00000000018872099e477456bcaee8ac_bxg7cq.png`,
  extra4:      `${C}/image/upload/v1790658821/1000072343.jpg_wcjeqo.jpg`,
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
  v416969:     `${C}/video/upload/v1790247697/1000416969_goj4gu.mov`,
  vOnStage:    `${C}/video/upload/v1790662863/1000032928_shvu9a.mp4`,
  // On stage (speaker reel, Sep 2026)
  stage1:      `${C}/image/upload/v1790772422/file_000000008eb48211956516e10f111b6b_1_d43dqw.png`,
  stage2:      `${C}/image/upload/v1790772420/20260927_211051.jpg_lr4hzn.jpg`,
  stageVideo:  `${C}/video/upload/v1790772419/DSC_6183_1_1_dfaur6.mp4`,
  stage3:      `${C}/image/upload/v1790772419/IMG-20260831-WA0022.jpg_df0vw8.jpg`,
  p20240713b:  `${C}/image/upload/v1790772687/20240713_120931_1.jpg_1_d8epgl.jpg`,   // replaces 20251206_145715 in the stage strip
  // Magazines: covers and feature articles (always shown whole, never cropped)
  mag1: `${C}/image/upload/v1790773471/IMG_20220511_111105_1.jpg_1_edbpkc.jpg`,
  mag2: `${C}/image/upload/v1790773470/20220428_205212.jpg_rbc5on.jpg`,
  mag3: `${C}/image/upload/v1790773469/IMG-20240919-WA0015.jpg_1_bim6z2.jpg`,
  mag4: `${C}/image/upload/v1790773469/IMG-20220512-WA0007.jpg_frgumj.jpg`,
  mag5: `${C}/image/upload/v1790773469/20240611_093429.jpg_git3tf.jpg`,
  mag6: `${C}/image/upload/v1790773468/IMG-20220512-WA0006.jpg_1_di5q38.jpg`,
  mag7: `${C}/image/upload/v1790773468/IMG-20220512-WA0002.jpg_ltlmj9.jpg`,
  mag8: `${C}/image/upload/v1790773468/navjot3-1.jpg_bindcx.jpg`,
  // Media interactions and panel discussions
  mi1:  `${C}/image/upload/v1790773654/DSC_7583.JPG_ywdycs.jpg`,
  mi2:  `${C}/image/upload/v1790773652/VideoCapture_20240130-181335.jpg_lvfnnl.jpg`,
  mi3:  `${C}/video/upload/v1790773652/VID_20250727_064844_140_vldyza.mp4`,
  mi4:  `${C}/image/upload/v1790773652/20250705_151114.jpg_isuyoz.jpg`,
  mi5:  `${C}/image/upload/v1790773651/A28I8902.JPG_cw5oel.jpg`,
  mi6:  `${C}/image/upload/v1790773651/file_000000000b807207bea17dbb1ebde00b_bsw8eh.png`,
  mi7:  `${C}/image/upload/v1790773651/20251206_140152.jpg_o8harw.jpg`,
  mi8:  `${C}/image/upload/v1790773649/IMG-20240610-WA0021.jpg_t3fcym.jpg`,
  mi9:  `${C}/image/upload/v1790773649/20231012_151950.jpg_urliuz.jpg`,
  mi10: `${C}/image/upload/v1790773648/IMG-20240905-WA0009.jpg_axknsy.jpg`
};

/* Podcasts and interviews on YouTube (IDs only; thumbnails load from YouTube, the player loads on click) */
const PODCASTS = [
  { id: 'rtbtYkFmsiY' }, { id: 'JCt0vqnclS4' }, { id: 'fj0uZMZiLxU' },
  { id: 'qOPdVTojyOM' }, { id: 'gqIEj4zgyxo' }, { id: 'wqnVZuxsb2s' },
  { id: 'aqPHro1BSiI', short: true }
];

/* ---------------------------------------------------------------------------
   3. ASSETS: slot mapping. `pos` = CSS object-position (crops are also
   face-aware server-side). `small: true` = compressed WhatsApp media.
   ------------------------------------------------------------------------ */
const img = (src, alt, extra = {}) => ({ type: 'image', src, alt, ...extra });
const vid = (src, alt, extra = {}) => ({ type: 'video', src, alt, ...extra });
const ASSETS = {
  hero: { src: LIB.hero, alt: 'Portrait of Dr. Navjot Kaur', pos: '50% 22%' },   // keep in sync with the <img> + preload in index.html
  about: {
    portrait:    img(LIB.aboutPortrait, 'Portrait of Dr. Navjot Kaur', { pos: '50% 18%' }),
    second:      img(LIB.author2, 'Dr. Navjot Kaur', { pos: '50% 20%' })
  },
  // Speaker section: "On stage" reel, a slideshow of whole (uncropped) photos and one video.
  // The curtain-launch clip (vStage) is retired and not used.
  speaker: {
    slides: [
      img(LIB.author3,    'Dr. Navjot Kaur speaking on stage'),
      img(LIB.stage1,     'Dr. Navjot Kaur on stage'),
      img(LIB.stage2,     'Dr. Navjot Kaur addressing an audience'),
      vid(LIB.stageVideo, 'Video of Dr. Navjot Kaur on stage'),
      img(LIB.stage3,     'Dr. Navjot Kaur at a stage event')
    ]
  },
  books: {
    cover:          img(LIB.bookCover, 'Cover of Cosmic Map of Answers by Dr. Navjot Kaur'),
    motherBlessing: img(LIB.coverMotherBlessing, 'Cover of Mother: A Divine Blessing by Dr. Navjot Kaur'),
    motherGift:     img(LIB.coverMotherGift, 'Cover of Mother: A Divine Gift by Dr. Navjot Kaur'),
    motherCreation: img(LIB.coverMotherCreation, 'Cover of Mother: A Divine Creation by Dr. Navjot Kaur'),
    gwb:            img(LIB.coverGWB, 'Cover of Gratitude, Wisdom & Blessing by Dr. Navjot Kaur')
  },
  leadership: {
    quest: img(LIB.logoQuest, 'Quest International School logo'),
    waaf: img(LIB.logoWAAF, 'World Academic Achievers Forum logo'),
    ydc:  img(LIB.logoYDC,  'Youth Diplomatic Conclave logo'),
    gwac: img(LIB.logoGWAC, 'The Global Women Achievers Circle logo')
  },
  honors: {
    photos: [
      img(LIB.legends,     'Dr. Navjot Kaur receiving the Honouring Legends of Education award', { caption: 'Honouring Legends of Education', pos: '50% 25%' }),
      img(LIB.uae2025,     'Dr. Navjot Kaur honoured in the UAE, 2025', { caption: 'Visionary Leader in Global Education & Women Empowerment · UAE 2025', pos: '50% 25%' }),
      img(LIB.p20231201,   'Dr. Navjot Kaur at an awards ceremony', { caption: 'Honoured on an international stage', pos: '50% 25%' }),
      img(LIB.dsc4235,     'Dr. Navjot Kaur, Mrs. India Planet 2022', { caption: 'Mrs. India Planet 2022', pos: '50% 20%' }),
      img(LIB.img2243,     'Dr. Navjot Kaur receiving an honour', { caption: 'Recognised for leadership in education', pos: '50% 25%' }),
      img(LIB.extra1,      'Dr. Navjot Kaur at an award event', { caption: 'A moment of honour', pos: '50% 25%' })
    ]
  },
  // Media: the EdTalk World Conference interview is the featured, full-size photo
  media: {
    featured: img(LIB.author1, 'Dr. Navjot Kaur in a media interaction at the EdTalk World Conference', { caption: 'Media interaction · EdTalk World Conference' })
  },
  mediaInteractions: [
    img(LIB.mi1,  'Dr. Navjot Kaur in a media interaction'),
    img(LIB.mi2,  'Dr. Navjot Kaur in a televised interview'),
    img(LIB.mi4,  'Dr. Navjot Kaur at a panel discussion'),
    vid(LIB.mi3,  'Video of Dr. Navjot Kaur in a media interaction'),
    img(LIB.mi5,  'Dr. Navjot Kaur speaking at a panel'),
    img(LIB.mi6,  'Dr. Navjot Kaur in conversation with the media'),
    img(LIB.mi7,  'Dr. Navjot Kaur at a panel discussion'),
    img(LIB.mi8,  'Dr. Navjot Kaur in a media interaction'),
    img(LIB.mi9,  'Dr. Navjot Kaur at a panel discussion'),
    img(LIB.mi10, 'Dr. Navjot Kaur in a media interaction')
  ],
  magazines: [
    img(LIB.mag1, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag2, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag3, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag4, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag5, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag6, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag7, 'Magazine feature on Dr. Navjot Kaur'),
    img(LIB.mag8, 'Magazine feature on Dr. Navjot Kaur')
  ],
  contact: { portrait: img(LIB.author5, 'Dr. Navjot Kaur', { pos: '50% 20%' }) },

  // Speaker section: moving film strip.
  // 20251206_145715 looked like a repeat, so it is replaced by 20240713_120931_1 (_1 upload);
  // the older upload of that same file (p20240713) is left out so it never appears twice.
  // The 2022 magazine page (IMG_20220511) now lives in the Magazines section.
  stageStrip: [
    img(LIB.navjot05,   'Dr. Navjot Kaur', { ar: '3:4' }),
    img(LIB.p20240713b, 'Dr. Navjot Kaur at an education summit', { ar: '4:5' }),
    img(LIB.dsc4230,    'Dr. Navjot Kaur', { ar: '3:4' }),
    img(LIB.extra2,     'Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.p20250705a, 'Dr. Navjot Kaur addressing guests', { ar: '3:4' })
  ],

  // Impact bento. `span` = grid spans; `order` interleaves with the static text tiles (2, 5, 8)
  impact: [
    img(LIB.ayaam2022,   'Dr. Navjot Kaur as Chief Guest at Ayaam 2022', { caption: 'Chief Guest · Ayaam 2022', span: 'w2 h2', order: 1 }),
    vid(LIB.v416510,     'Video from a community event', { caption: 'In the community', span: 'h2', order: 3 }),
    img(LIB.p1000250327, 'Dr. Navjot Kaur with women at a social event', { caption: 'Women empowerment', order: 4 }),
    vid(LIB.v416969,     'Video from a women empowerment programme', { caption: 'Workshop moments', span: 'h2', order: 7 }),
    img(LIB.p20250325,   'Dr. Navjot Kaur addressing a gathering', { caption: 'Encouraging every woman', span: 'w2', order: 9 }),
    vid(LIB.vOnStage,    'Video of Dr. Navjot Kaur on stage', { caption: 'On stage', order: 10 }),
    img(LIB.wa20250325,  'Dr. Navjot Kaur with participants', { caption: 'Together', order: 11, small: true })
  ],

  // Gallery ("Life in frames"): two rows of moving images (open in the lightbox).
  // Each photo appears once on the whole site: png2ca8 (same photo as the About portrait)
  // and author2 (already in About) were removed; the winning picture leads row A.
  galleryA: [
    img(LIB.winning,     'Dr. Navjot Kaur, winning moment', { ar: '4:5' }),
    img(LIB.author4,     'Dr. Navjot Kaur', { ar: '4:5' }),
    vid(LIB.v211837,     'Highlight video of Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.pngF3dc,     'Dr. Navjot Kaur', { ar: '4:5' }),
    vid(LIB.vWa251206,   'Short video clip, December 2025', { ar: '4:5', small: true }),
    img(LIB.pngF774,     'Dr. Navjot Kaur', { ar: '1:1' })
  ],
  galleryB: [
    img(LIB.drNavjotPng, 'Dr. Navjot Kaur', { ar: '1:1' }),
    vid(LIB.v424527,     'Video of Dr. Navjot Kaur at an event', { ar: '4:5' }),
    img(LIB.p20250705b,  'Dr. Navjot Kaur with guests', { ar: '1:1' }),
    img(LIB.wa20260922,  'Dr. Navjot Kaur at a recent event', { ar: '1:1', small: true }),
    img(LIB.extra3,      'Dr. Navjot Kaur', { ar: '4:5' }),
    img(LIB.extra4,      'Dr. Navjot Kaur', { ar: '1:1' }),
    // Disabled: probably a screenshot. Set enabled: true only if it is a clean photo.
    img(LIB.screenshot,  'Dr. Navjot Kaur', { ar: '4:5', enabled: false })
  ],

  menu: {
    home: LIB.hero, about: LIB.aboutPortrait, speaker: LIB.author3, books: LIB.bookCover, leadership: LIB.extra3,
    honors: LIB.dsc4235, impact: LIB.ayaam2022, media: LIB.author1, magazines: LIB.mag8, gallery: LIB.winning,
    appointments: LIB.extra4, contact: LIB.author5
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
/** Tiny blurred copy of an image (or a video frame) used behind full, uncropped photos */
const cBlur = (url, isVideo) => isVideo
  ? tx(url, 'so_1,f_jpg,q_30,c_limit,w_64,e_blur:600').replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg')
  : tx(url, 'f_auto,q_30,c_limit,w_64,e_blur:600');
/** Full photo, never cropped: object-fit contain over its own blurred backdrop */
function fullPhoto(frame, item, sizes, isVideo = false) {
  frame.classList.add('fit');
  const bg = new Image(); bg.className = 'bgblur'; bg.alt = ''; bg.loading = 'lazy'; bg.decoding = 'async';
  bg.width = 64; bg.height = 80; bg.src = cBlur(item.src, isVideo);
  const im = new Image(); im.loading = 'lazy'; im.decoding = 'async'; im.width = 800; im.height = 1000; im.sizes = sizes; im.alt = item.alt || '';
  if (isVideo) { im.srcset = [480, 720, 1080].map(w => `${cPoster(item.src, w)} ${w}w`).join(', '); im.src = cPoster(item.src, 720); }
  else { im.srcset = cSrcset(item.src, null); im.src = cImg(item.src, 800); }
  const inner = document.createElement('div'); inner.className = 'inner'; inner.append(bg, im);
  frame.prepend(inner);
  return im;
}

function mountSlots() {
  $$('[data-slot]').forEach(host => {
    const item = resolve(host.dataset.slot);
    if (!item || item.enabled === false) { host.classList.add('is-failed'); return; }
    if (host.dataset.fit === 'contain') { failSafe(fullPhoto(host, item, host.dataset.sizes || '50vw'), host); return; }
    const fit = host.dataset.fit === 'limit' || host.dataset.fit === 'book';
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

/* "On stage" reel: whole photos (never cropped) that cross-fade like stories, with one video.
   Advances only while on screen; hover (desktop) holds the current slide; tap opens the lightbox. */
function mountReel() {
  const reel = $('#reel'); if (!reel) return;
  const items = (ASSETS.speaker.slides || []).filter(i => i.enabled !== false);
  if (!items.length) return;
  const tag = $('.tag', reel), count = $('.tag .n', reel);
  const base = LB_ITEMS.length; LB_ITEMS.push(...items);
  const bars = document.createElement('div'); bars.className = 'reel-bars';
  const slides = items.map((item, i) => {
    const isVideo = item.type === 'video';
    const holder = document.createElement('div');
    fullPhoto(holder, item, '(min-width: 900px) 36vw, 90vw', isVideo);
    const inner = $('.inner', holder);
    inner.classList.add('slide');
    let v = null;
    if (isVideo && !saveData && !reduced) {
      v = Videos.make(item.src, finePointer ? 1080 : 720);
      inner.appendChild(v);
      v.addEventListener('playing', () => inner.classList.add('is-playing'));
    }
    reel.insertBefore(inner, tag);
    failSafe($('img:not(.bgblur)', inner), reel);
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', `Show ${isVideo ? 'video' : 'photo'} ${i + 1} of ${items.length}`);
    b.addEventListener('click', e => { e.stopPropagation(); go(i); });
    bars.appendChild(b);
    return { inner, v, bar: b, dur: isVideo ? 9000 : 4200 };
  });
  reel.classList.add('fit', 'has-slides');
  reel.appendChild(bars);
  reel.insertAdjacentHTML('beforeend', `<button class="open" type="button" aria-label="Open this photo or video full screen" data-cursor="VIEW"></button>`);
  let cur = -1, timer = 0, visible = false, held = false;
  const schedule = () => {
    clearTimeout(timer);
    if (!visible || held || reduced || slides.length < 2) return;
    timer = setTimeout(() => go((cur + 1) % slides.length), slides[cur].dur);
  };
  function go(i) {
    if (cur >= 0) { const o = slides[cur]; o.inner.classList.remove('is-on'); o.bar.classList.remove('is-on'); o.bar.classList.add('is-done'); if (o.v) Videos.pause(o.v); }
    slides.forEach((s, j) => { if (j >= i) s.bar.classList.remove('is-done'); });
    cur = i;
    const s = slides[i];
    s.inner.classList.add('is-on');
    s.bar.style.setProperty('--d', `${s.dur}ms`);
    s.bar.classList.remove('is-on'); void s.bar.offsetWidth; s.bar.classList.add('is-on');   // restart the progress fill
    reel.dataset.lbIndex = base + i;
    if (count) count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (s.v && visible) Videos.play(s.v);
    schedule();
  }
  go(0);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting && !document.hidden;
    reel.classList.toggle('is-paused', !visible);
    const s = slides[cur];
    if (s.v) visible ? Videos.play(s.v) : Videos.pause(s.v);
    if (visible) go(cur); else clearTimeout(timer);
  }, { threshold: 0.3 }).observe(reel);
  if (finePointer) {
    reel.addEventListener('pointerenter', () => { held = true; clearTimeout(timer); reel.classList.add('is-held'); });
    reel.addEventListener('pointerleave', () => { held = false; reel.classList.remove('is-held'); if (visible) go(cur); });
  }
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
  // Event photos are shown whole (never cropped), so nobody's head is cut off
  const im = fullPhoto(frame, item, sizes, isVideo);
  if (isVideo) {
    if (hover && !saveData) {
      const v = Videos.make(item.src, finePointer ? 720 : 480);
      frame.appendChild(v);
      Videos.register(v, el);
    }
  }
  failSafe(im, frame);
  el.appendChild(frame);
  el.insertAdjacentHTML('beforeend',
    (isVideo ? `<span class="play" aria-hidden="true">${icon('play')}</span>` : '') +
    (caption && item.caption ? `<figcaption class="cap">${icon(isVideo ? 'video' : 'camera')}${esc(item.caption)}</figcaption>` : '') +
    `<button class="open" type="button" aria-label="Open ${isVideo ? 'video' : 'photo'}: ${esc(item.caption || item.alt)}" data-cursor="${isVideo ? 'PLAY' : 'VIEW'}"></button>`);
  return el;
}
/** Whole-image masonry (magazines, media interactions): natural proportions, never cropped.
    Items are dealt left to right into 2 / 3 / 4 columns, re-dealt when the breakpoint changes. */
function masonry(host, items, { sizes = '(min-width: 900px) 30vw, 50vw', cls = 'mz', w = 800 } = {}) {
  if (!host) return;
  const figs = [];
  items.filter(i => i.enabled !== false).forEach((item, n) => {
    const idx = LB_ITEMS.push(item) - 1;
    const isVideo = item.type === 'video';
    const fig = document.createElement('figure');
    fig.className = `${cls}${isVideo ? ' vtile' : ''}`;
    fig.dataset.lbIndex = idx;
    if (cls !== 'mag') fig.setAttribute('data-reveal', '');   // magazine pages have their own scroll motion
    fig.style.setProperty('--r', `${[-2.2, 1.6, -1.2, 2, -1.8, 1.1][n % 6]}deg`);
    const pic = document.createElement('div'); pic.className = 'pic';
    const im = new Image(); im.loading = 'lazy'; im.decoding = 'async'; im.alt = item.alt || ''; im.sizes = sizes;
    if (isVideo) { im.srcset = [480, 720, 1080].map(x => `${cPoster(item.src, x)} ${x}w`).join(', '); im.src = cPoster(item.src, 720); }
    else { im.srcset = cSrcset(item.src, null, [480, 800, 1200]); im.src = cImg(item.src, w); }
    im.addEventListener('error', () => fig.remove(), { once: true });
    pic.appendChild(im);
    if (isVideo && !saveData) { const v = Videos.make(item.src, finePointer ? 720 : 480); pic.appendChild(v); Videos.register(v, fig); }
    if (cls === 'mag') { const sheet = document.createElement('div'); sheet.className = 'sheet'; sheet.appendChild(pic); fig.appendChild(sheet); }
    else fig.appendChild(pic);
    fig.insertAdjacentHTML('beforeend',
      (isVideo ? `<span class="play" aria-hidden="true">${icon('play')}</span>` : '') +
      `<button class="open" type="button" aria-label="Open ${isVideo ? 'video' : 'image'}: ${esc(item.caption || item.alt)}" data-cursor="${isVideo ? 'PLAY' : cls === 'mag' ? 'READ' : 'VIEW'}"></button>`);
    figs.push(fig);
  });
  let cols = 0;
  const deal = () => {
    const n = innerWidth >= 1100 ? 4 : innerWidth >= 700 ? 3 : 2;
    if (n === cols) return;
    cols = n;
    const cs = Array.from({ length: n }, () => { const c = document.createElement('div'); c.className = 'mcol'; return c; });
    figs.forEach((f, i) => cs[i % n].appendChild(f));
    host.replaceChildren(...cs);
  };
  deal();
  addEventListener('resize', deal, { passive: true });
}

/** Podcasts: YouTube thumbnail first; the privacy-enhanced player only loads when tapped */
function mountPodcasts() {
  const host = $('#podGrid'); if (!host) return;
  let n = 0;
  PODCASTS.forEach(p => {
    const label = p.short ? 'SHORT' : `EPISODE ${String(++n).padStart(2, '0')}`;
    const el = document.createElement('article');
    el.className = `pod${p.short ? ' short' : ''}`;
    el.setAttribute('data-reveal', '');
    el.innerHTML =
      `<div class="pod-media"><img src="https://i.ytimg.com/vi/${p.id}/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360">` +
      `<button class="pod-play" type="button" aria-label="Play ${p.short ? 'YouTube short' : `podcast ${label.toLowerCase()}`} with Dr. Navjot Kaur" data-cursor="PLAY"><span>${icon('play')}</span></button></div>` +
      `<div class="pod-meta"><span>${label}</span><a class="link" href="https://${p.short ? `youtube.com/shorts/${p.id}` : `youtu.be/${p.id}`}" target="_blank" rel="noopener">YOUTUBE ${icon('arrow-ur')}</a></div>`;
    $('.pod-play', el).addEventListener('click', () => {
      Videos.pauseAll();
      $$('.pod.is-live').forEach(o => { if (o !== el) { o.classList.remove('is-live'); const f = $('iframe', o); if (f) f.remove(); } });
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${p.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
      f.title = `YouTube video with Dr. Navjot Kaur`;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      $('.pod-media', el).appendChild(f);
      el.classList.add('is-live');
    });
    host.appendChild(el);
  });
}

function marqueeRow(host, items, { ar = null, sizes = '280px', cls = 'gi' }) {
  if (!host) return;
  const track = document.createElement('div'); track.className = 'marquee-track';
  const set = document.createElement('div'); set.className = 'marquee-set';
  const list = items.filter(i => i.enabled !== false);
  host.style.setProperty('--n', list.length);   // CSS keeps each set wider than the screen, so no photo shows twice at once
  list.forEach(item => set.appendChild(tile(item, { ar: ar || item.ar || '4:5', sizes, cls, caption: false, hover: false })));
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
  marqueeRow($('#stageStrip'), ASSETS.stageStrip, { sizes: '(min-width: 900px) 22vw, 45vw' });
  marqueeRow($('#rowA'), ASSETS.galleryA, { sizes: '(min-width: 900px) 20vw, 45vw' });
  marqueeRow($('#rowB'), ASSETS.galleryB, { sizes: '(min-width: 900px) 20vw, 45vw' });
  const feat = $('#mediaFeature');
  if (feat && ASSETS.media.featured) {
    const it = ASSETS.media.featured, idx = LB_ITEMS.push(it) - 1;
    feat.dataset.lbIndex = idx;
    const frame = $('.frame', feat);
    failSafe(fullPhoto(frame, it, '(min-width: 900px) 60vw, 100vw'), frame);
    feat.insertAdjacentHTML('beforeend', `<button class="open" type="button" aria-label="Open photo: ${esc(it.caption)}" data-cursor="VIEW"></button>`);
  }
  masonry($('#miGrid'), ASSETS.mediaInteractions, { sizes: '(min-width: 1100px) 24vw, (min-width: 700px) 33vw, 50vw' });
  masonry($('#magGrid'), ASSETS.magazines, { cls: 'mag', sizes: '(min-width: 1100px) 24vw, (min-width: 700px) 33vw, 50vw', w: 1200 });
  mountPodcasts();
  initHoldToPause();
}
/** Photo rows: hover (mouse) or touch-and-hold pauses the movement; letting go starts it again */
function initHoldToPause() {
  $$('.strip, .rows .marquee').forEach(row => {
    const hold = () => row.classList.add('is-held');
    const release = () => setTimeout(() => row.classList.remove('is-held'), 250);
    row.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') hold(); }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => row.addEventListener(t, e => { if (e.pointerType !== 'mouse') release(); }, { passive: true }));
    row.addEventListener('touchend', release, { passive: true });
  });
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

  // The Library: the Mother Trilogy fans out from a stack as it scrolls into view
  const tri = $$('[data-tri]');
  if (tri.length === 3) {
    gsap.fromTo(tri[0], { xPercent: 70, rotation: -8, y: 30 }, { xPercent: 0, rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#trilogy', start: 'top 85%', end: 'center 60%', scrub: 0.8 } });
    gsap.fromTo(tri[2], { xPercent: -70, rotation: 8, y: 30 }, { xPercent: 0, rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#trilogy', start: 'top 85%', end: 'center 60%', scrub: 0.8 } });
    gsap.fromTo(tri[1], { y: -20, scale: 1.06 }, { y: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '#trilogy', start: 'top 85%', end: 'center 60%', scrub: 0.8 } });
  }
  // Magazines: pages drop in with a slight tilt and settle as they scroll into view
  $$('#magGrid .mag').forEach((m, i) => {
    gsap.fromTo(m, { y: 90 + (i % 3) * 30, rotation: (i % 2 ? 6 : -6) }, { y: 0, rotation: 0, ease: 'none',
      scrollTrigger: { trigger: m, start: 'top bottom', end: 'top 55%', scrub: 0.9 } });
  });
  // Photo rows lean with scroll speed (Lenis velocity), then settle
  if (lenis) {
    const rows = $$('[data-skew]');
    const setters = rows.map(r => gsap.quickTo(r, 'skewY', { duration: 0.6, ease: 'power3' }));
    lenis.on('scroll', ({ velocity }) => { const k = Math.max(-4, Math.min(4, velocity * -0.12)); setters.forEach(f => f(k)); });
  }
  gsap.fromTo('.solo-wrap', { rotation: -6, y: 40 }, { rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.solo', start: 'top bottom', end: 'center 60%', scrub: 0.8 } });

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
  // Magnetic buttons
  $$('.btn, .top-cta, .btn-tarot').forEach(b => {
    const mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.18); my((e.clientY - r.top - r.height / 2) * 0.3); });
    b.addEventListener('pointerleave', () => { mx(0); my(0); });
  });
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
    order: { title: 'Order a copy', sub: 'Add your details and send the order on WhatsApp. Our team will contact you to confirm the book price, securely process your payment and coordinate your delivery.' },
    appt: { title: 'Book an appointment', sub: 'Choose a session and send your request on WhatsApp. Our team will coordinate the date, time, slot and payment with you.' },
    speak: { title: 'Speaking invitation', sub: 'Share a few details about your event. The invitation opens in WhatsApp, ready to send to Dr. Navjot Kaur.' },
    podcast: { title: 'Podcast invite', sub: 'Host a podcast or channel? Invite Dr. Navjot Kaur as a guest. The invitation opens in WhatsApp, ready to send.' }
  },
  init() {
    this.d = $('#drawer'); this.scrim = $('#scrim'); this.form = $('#dForm'); this.err = $('#dErr'); this.mail = $('#altMail');
    const sel = $('#o-book');
    books().forEach(b => sel.add(new Option(b.title, b.id, b.featured, b.featured)));
    document.addEventListener('click', e => { const t = e.target.closest('[data-open]'); if (t) { e.preventDefault(); this.open(t.dataset.open, t.dataset.book, t, t.dataset.svc); } });
    this.scrim.addEventListener('click', () => this.close());
    $$('[data-close]', this.d).forEach(b => b.addEventListener('click', () => this.close()));
    this.d.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); else trap(e, [this.d]); });
    $$('[data-qty]', this.d).forEach(b => b.addEventListener('click', () => { this.qty = Math.min(CONFIG.MAX_QTY, Math.max(1, this.qty + +b.dataset.qty)); $('#qtyOut').textContent = this.qty; this.syncMail(); }));
    this.form.addEventListener('input', e => { e.target.removeAttribute('aria-invalid'); this.err.textContent = ''; this.syncMail(); });
    this.form.addEventListener('submit', e => { e.preventDefault(); this.send(); });
  },
  open(mode, bookId, opener, svc) {
    this.mode = ['speak', 'appt', 'podcast'].includes(mode) ? mode : 'order';
    this.opener = opener || document.activeElement;
    $('#drawer-h').textContent = this.COPY[this.mode].title;
    $('#drawerSub').textContent = this.COPY[this.mode].sub;
    $$('.mode', this.d).forEach(m => m.classList.toggle('is-on', m.dataset.mode === this.mode));
    if (bookId) $('#o-book').value = bookId;
    if (svc) $('#a-svc').value = svc;
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
    } else if (this.mode === 'podcast') {
      if (this.v('pname').length < 2) return this.invalid('pname', 'Please enter your name.');
      if (digits(this.v('pphone')).length < 7) return this.invalid('pphone', 'Please enter a phone number we can reach you on.');
      if (this.v('pshow').length < 2) return this.invalid('pshow', 'Please enter the podcast or channel name.');
    } else if (this.mode === 'appt') {
      if (this.v('aname').length < 2) return this.invalid('aname', 'Please enter your name.');
      if (digits(this.v('aphone')).length < 7) return this.invalid('aphone', 'Please enter a phone number we can reach you on.');
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
        `\nPlease confirm the book price, payment and delivery. Thank you!`;
    }
    const fmt = v => (v ? new Date(v + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');
    if (this.mode === 'podcast') {
      return `Hello Dr. Navjot Kaur, I would like to invite you as a guest on our podcast.\n\n` +
        L('Name', this.v('pname')) + L('Phone', this.v('pphone')) + L('Podcast / channel', this.v('pshow')) + L('Link', this.v('plink')) +
        L('Topic', this.v('ptopic')) + L('Preferred date', fmt(this.v('pdate'))) + L('Details', this.v('pmsg')) + `\nLooking forward to hearing from you.`;
    }
    if (this.mode === 'appt') {
      return `Hello, I would like to book an appointment with Dr. Navjot Kaur.\n\n` +
        L('Session', this.v('svc')) + L('Name', this.v('aname')) + L('Phone', this.v('aphone')) + L('Preferred date', fmt(this.v('adate'))) +
        L('Preferred time', this.v('atime')) + L('Message', this.v('amsg')) + `\nPlease share the available slots and payment details. Thank you!`;
    }
    const date = this.v('date') ? new Date(this.v('date') + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    return `Hello Dr. Navjot Kaur, I would like to invite you to speak.\n\n` +
      L('Name', this.v('sname')) + L('Phone', this.v('sphone')) + L('Organisation', this.v('org')) + L('Event', this.v('event')) +
      L('Date', date) + L('City', this.v('city')) + L('Details', this.v('msg')) + `\nLooking forward to hearing from you.`;
  },
  syncMail() {
    const subject = { order: 'Book order', appt: 'Appointment request', podcast: 'Podcast invitation' }[this.mode] || 'Speaking invitation';
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
  for (const step of [mountSlots, mountReel, mountGalleries, initMarquees, initMotion, initPointer, () => { initVCard(); Lightbox.init(); Drawer.init(); }]) {
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
