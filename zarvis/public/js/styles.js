/**
 * Design systems. Each is a complete art direction: fonts, palettes, layout
 * defaults per block, heading/button/card/image/menu treatments, motion
 * personality and a CSS layer with its own decorative language.
 * Every option can be overridden per project in the studio's Design panel.
 */
export const OPTIONS = {
  heading: { editorial: 'Editorial (line + title)', numbered: 'Numbered two-column', pill: 'Pill label', stamp: 'Stamp label', giant: 'Giant title', rule: 'Newspaper rule' },
  buttons: { pill: 'Pill', square: 'Square', soft: 'Soft rounded', shadow: 'Hard shadow', underline: 'Underline link', glow: 'Glow' },
  cards: { flat: 'Flat', border: 'Outline', shadow: 'Soft shadow', glass: 'Glass', offset: 'Offset shadow' },
  imageShape: { rect: 'Rectangle', rounded: 'Rounded', arch: 'Arch', circle: 'Circle', blob: 'Organic blob' },
  menu: { split: 'Fullscreen with image preview', panel: 'Side panel', tiles: 'Tiles', curtain: 'Curtain' },
  reveal: { up: 'Rise', blur: 'Blur in', scale: 'Zoom in', pop: 'Bounce', slide: 'Slide', step: 'Stepped', fade: 'Fade' },
  headAnim: { rise: 'Words rise', blur: 'Words blur in', pop: 'Words bounce', wipe: 'Wipe', fade: 'Fade' },
  imgReveal: { clip: 'Clip reveal', curtain: 'Side curtain', scale: 'Zoom', pop: 'Pop', fade: 'Fade' },
  heroText: { rise: 'Rise', typewriter: 'Typewriter', scramble: 'Scramble', blur: 'Blur in', wave: 'Letter wave', fade: 'Fade' },
  cursor: { none: 'System cursor', dot: 'Dot', ring: 'Ring', blend: 'Invert blend', label: 'Label (“View”)' },
  splash: { none: 'None', logo: 'Logo reveal', counter: 'Counter 0→100', curtain: 'Curtain lift' },
  spacing: { compact: 'Compact', normal: 'Normal', airy: 'Airy' },
  motionLevel: { none: 'Off', subtle: 'Subtle (CSS only)', standard: 'Standard', cinematic: 'Cinematic (parallax, pinning)' },
  logoPos: { center: 'Centre', left: 'Left' }
};

const S = {
  maison: {
    name: 'Maison', tag: 'Editorial luxury', desc: 'Serif elegance, arches, gold hairlines, slow cinematic reveals. For personal brands, fashion, beauty, hospitality.',
    fonts: { display: 'Cormorant Garamond', body: 'Jost', label: 'Jost', em: '' }, displayWeight: 300, displayCase: 'none', displayTracking: '-.015em', emItalic: true, titleScale: 1.12, radius: 2, btnTracking: '.2em', btnCase: 'uppercase', maxWidth: 1280,
    palettes: {
      ivory: { name: 'Ivory & gold', bg: '#F7F2EA', surface: '#EFE6D8', text: '#1E1A17', accent: '#B08A4E', accent2: '#D8B77A', dark: '#14110F', darkText: '#F3EBDD' },
      onyx: { name: 'Onyx', bg: '#121010', surface: '#1B1917', text: '#EFE7DA', accent: '#C9A46A', accent2: '#E3C891', dark: '#080707', darkText: '#F3EBDD' },
      rosewood: { name: 'Rosewood', bg: '#F8F0EE', surface: '#F0E0DC', text: '#2A1B1E', accent: '#9E4A5A', accent2: '#E3A6B0', dark: '#22151A', darkText: '#F6E9E6' }
    },
    d: { heading: 'editorial', buttons: 'pill', cards: 'border', imageShape: 'arch', menu: 'split', reveal: 'up', headAnim: 'rise', imgReveal: 'clip', heroText: 'rise', cursor: 'ring', splash: 'logo', spacing: 'airy', motionLevel: 'cinematic', grain: true, spotlight: false, headerLinks: false, logoPos: 'center' },
    toneCycle: ['light', 'alt', 'dark'], heroTone: 'dark', marqueeTone: 'dark', ctaTone: 'dark', sep: '✦',
    variants: { hero: 'fullbleed', about: 'split', features: 'list', work: 'list', gallery: 'marquee', products: 'feature', testimonials: 'big', stats: 'big', timeline: 'vertical', faq: 'accordion', cta: 'big', contact: 'split', marquee: 'plain', team: 'grid', logos: 'marquee', pricing: 'cards' },
    art: `radial-gradient(90% 70% at 30% 20%,color-mix(in srgb,var(--accent-2) 70%,#fff) 0%,var(--accent) 38%,color-mix(in srgb,var(--accent) 30%,var(--dark)) 70%,var(--dark) 100%)`,
    css: `
.h1{font-weight:300;letter-spacing:-.025em}.h1 em,.h2 em{font-weight:300}
.eyebrow{letter-spacing:.34em;font-size:.68rem}
.btn{font-size:.7rem}
figure.m.shape{overflow:visible;background:none}figure.m.shape>img,figure.m.shape>video,figure.m.shape>.art{border-radius:var(--rshape)}
figure.m.shape::after{content:"";position:absolute;inset:-14px;border:1px solid color-mix(in srgb,var(--accent) 55%,transparent);border-radius:var(--rshape);pointer-events:none}
.num,.plan-v,.tl-y,.step-n{font-style:italic;font-weight:300}
.row-t{font-weight:400;transition:font-style .3s,color .3s}@media (hover:hover){.row:hover .row-t{font-style:italic;color:var(--c-em)}}
.foot-big{font-style:italic;font-weight:300}
.t-dark .eyebrow{color:var(--accent-2)}
.mq-plain .mq-w{font-style:italic;font-weight:300}
.logo-t{letter-spacing:.14em;text-transform:uppercase;font-weight:500;font-size:clamp(1rem,1.4vw,1.25rem)}
.card{border-radius:2px}
.hero .h1{font-size:calc(clamp(3.4rem,9.4vw,10rem) * var(--ts))}
.tabbar{border:1px solid color-mix(in srgb,var(--accent) 40%,transparent)}`
  },
  brutal: {
    name: 'Brutal', tag: 'Neo-brutalist', desc: 'Thick borders, hard shadows, loud type, stepped motion. For studios, events, launches, bold brands.',
    fonts: { display: 'Archivo Black', body: 'Space Grotesk', label: 'JetBrains Mono', em: '' }, displayWeight: 400, displayCase: 'uppercase', displayTracking: '-.02em', emItalic: false, titleScale: .96, radius: 0, btnTracking: '.04em', btnCase: 'uppercase', maxWidth: 1320,
    palettes: {
      acid: { name: 'Acid yellow', bg: '#F4F1E8', surface: '#FFE14D', text: '#111111', accent: '#FF4F1A', accent2: '#3D5AFE', dark: '#111111', darkText: '#F4F1E8' },
      bubble: { name: 'Bubblegum', bg: '#FFF5FA', surface: '#B8F2E6', text: '#151515', accent: '#FF3EA5', accent2: '#7B61FF', dark: '#151515', darkText: '#FFF5FA' },
      mono: { name: 'Black & blue', bg: '#FFFFFF', surface: '#EDEDED', text: '#000000', accent: '#0047FF', accent2: '#FF2D2D', dark: '#000000', darkText: '#FFFFFF' }
    },
    d: { heading: 'stamp', buttons: 'shadow', cards: 'offset', imageShape: 'rect', menu: 'tiles', reveal: 'step', headAnim: 'wipe', imgReveal: 'curtain', heroText: 'scramble', cursor: 'blend', splash: 'counter', spacing: 'normal', motionLevel: 'standard', grain: false, spotlight: false, headerLinks: true, logoPos: 'left' },
    toneCycle: ['light', 'alt', 'light', 'dark'], heroTone: 'light', marqueeTone: 'accent', ctaTone: 'accent', sep: '✺',
    variants: { hero: 'type', about: 'columns', features: 'cards', work: 'grid', gallery: 'grid', products: 'cards', testimonials: 'grid', stats: 'row', timeline: 'steps', faq: 'accordion', cta: 'marquee', contact: 'cards', marquee: 'tape', team: 'grid', logos: 'grid', pricing: 'cards' },
    art: `repeating-linear-gradient(var(--r),var(--accent) 0 16px,var(--surface) 16px 32px,var(--text) 32px 34px,var(--surface) 34px 50px)`,
    css: `
.blk,.foot{border-top:3px solid var(--text)}
.h1{line-height:.86}.h1 em,.h2 em,.statement em{color:var(--on-accent);background:var(--accent);padding:0 .1em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
figure.m:not(.hero-bg figure.m):not(.card>figure.m):not(.stk>figure.m):not(.av){border:3px solid var(--c-fg);box-shadow:8px 8px 0 var(--c-fg)}
.card>figure.m{border-bottom:3px solid var(--c-fg)}
.top.is-solid{background:var(--bg);box-shadow:0 3px 0 var(--text);-webkit-backdrop-filter:none;backdrop-filter:none}
.logo-t{font-size:1.2rem}
.rows,.faq,.clinks{border-top-width:3px}.row,.qa,.clinks>*{border-bottom-width:3px}
.mq-tape{border-block:3px solid var(--c-fg)}
.tag{border-radius:0;border:2px solid var(--text);color:var(--text);background:var(--surface)}
.soc a{border-radius:0;border-width:2px}
.fg input,.fg textarea,.nl input{border:2px solid var(--c-fg);border-radius:0}
.cards .card:nth-child(3n+2),.steps .card:nth-child(3n+2){background:var(--surface);--c-fg:var(--text);--c-mu:color-mix(in srgb,var(--text) 70%,var(--surface));color:var(--text)}
.tabbar{border-radius:0;border:3px solid var(--text);background:var(--bg);color:var(--text);box-shadow:6px 6px 0 var(--text)}.tb-pill{border-radius:0}
.eyebrow{letter-spacing:.06em}
.num{letter-spacing:-.04em}
.menu-nav a{border:3px solid var(--dark-text)}
.sl-b{border-radius:0;border-width:2px}
.hero-type .h1{font-size:calc(clamp(3rem,11.5vw,12.5rem) * var(--ts))}
.btn{font-weight:700}`
  },
  swiss: {
    name: 'Swiss', tag: 'International grid', desc: 'Strict grid, tight grotesk, numbered sections, one sharp accent. For architects, consultancies, tech, portfolios.',
    fonts: { display: 'Inter Tight', body: 'Inter', label: 'JetBrains Mono', em: '' }, displayWeight: 700, displayCase: 'none', displayTracking: '-.05em', emItalic: false, titleScale: 1.02, radius: 0, btnTracking: '0', btnCase: 'none', maxWidth: 1360,
    palettes: {
      classic: { name: 'Swiss red', bg: '#FFFFFF', surface: '#F2F2F0', text: '#0A0A0A', accent: '#E30613', accent2: '#FF6B61', dark: '#0A0A0A', darkText: '#FFFFFF' },
      blueprint: { name: 'Blueprint', bg: '#F4F6F8', surface: '#E6EBF0', text: '#0B1320', accent: '#1446FF', accent2: '#8AA7FF', dark: '#0B1320', darkText: '#F4F6F8' },
      sand: { name: 'Sand & orange', bg: '#F3EFE6', surface: '#E8E1D3', text: '#161513', accent: '#FF5B00', accent2: '#FF9A5A', dark: '#161513', darkText: '#F3EFE6' }
    },
    d: { heading: 'numbered', buttons: 'square', cards: 'border', imageShape: 'rect', menu: 'panel', reveal: 'up', headAnim: 'rise', imgReveal: 'curtain', heroText: 'rise', cursor: 'none', splash: 'none', spacing: 'normal', motionLevel: 'standard', grain: false, spotlight: false, headerLinks: true, logoPos: 'left' },
    toneCycle: ['light', 'light', 'alt'], heroTone: 'light', marqueeTone: 'dark', ctaTone: 'dark', sep: '—',
    variants: { hero: 'split', about: 'columns', features: 'list', work: 'grid', gallery: 'grid', products: 'cards', testimonials: 'slider', stats: 'row', timeline: 'agenda', faq: 'columns', cta: 'big', contact: 'split', marquee: 'plain', team: 'list', logos: 'grid', pricing: 'simple' },
    art: `radial-gradient(circle at 68% 38%,var(--accent) 0 21%,transparent 21.4%),linear-gradient(var(--r),var(--surface) 55%,var(--text) 55%)`,
    css: `
.blk+.blk{border-top:1px solid var(--c-line)}
.h1{line-height:.9}.h1 em,.h2 em,.statement em{font-style:normal}
.eyebrow{font-family:var(--fl);letter-spacing:.02em;text-transform:none;font-size:.78rem}
.hero::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,var(--c-line) 1px,transparent 1px) var(--pad) 0/calc((100% - 2 * var(--pad)) / 6) 100%}
.hero>*{position:relative}
.btn{font-weight:600;letter-spacing:-.01em}
.card,.tabbar,.tb-pill{border-radius:0}
.w-meta,.row-n,.card-n,.stk-n,.stat-l,.foot-h,.fg label,.clinks b{font-family:var(--fl);text-transform:none;letter-spacing:0}
.num{letter-spacing:-.06em}
.logo-t{letter-spacing:-.03em}
.row-t{letter-spacing:-.03em}
.menu-bg{background:var(--accent)}.menu{color:var(--on-accent)}.menu-open .top{color:var(--on-accent)!important}
.qa summary{font-weight:600}`
  },
  aurora: {
    name: 'Aurora', tag: 'Tech glass', desc: 'Dark space, glowing gradients, glass cards, blur-in motion, bento grids. For SaaS, apps, AI, startups, crypto.',
    fonts: { display: 'Sora', body: 'Inter', label: 'Inter', em: '' }, displayWeight: 600, displayCase: 'none', displayTracking: '-.035em', emItalic: false, titleScale: .94, radius: 20, btnTracking: '0', btnCase: 'none', maxWidth: 1240,
    palettes: {
      nebula: { name: 'Nebula', bg: '#07070D', surface: '#0F0F1A', text: '#ECEDF7', accent: '#7C5CFF', accent2: '#22D3EE', dark: '#04040A', darkText: '#ECEDF7' },
      ember: { name: 'Ember', bg: '#0B0708', surface: '#161012', text: '#F6EDEA', accent: '#FF5E3A', accent2: '#FFC24B', dark: '#050303', darkText: '#F6EDEA' },
      daylight: { name: 'Daylight', bg: '#F6F8FB', surface: '#FFFFFF', text: '#0B1220', accent: '#5B5BF7', accent2: '#10B981', dark: '#0B1220', darkText: '#EEF2F8' }
    },
    d: { heading: 'pill', buttons: 'glow', cards: 'glass', imageShape: 'rounded', menu: 'panel', reveal: 'blur', headAnim: 'blur', imgReveal: 'scale', heroText: 'blur', cursor: 'dot', splash: 'none', spacing: 'normal', motionLevel: 'standard', grain: false, spotlight: true, headerLinks: true, logoPos: 'left' },
    toneCycle: ['light', 'alt'], heroTone: 'light', marqueeTone: 'light', ctaTone: 'light', footTone: 'light', sep: '✦',
    variants: { hero: 'centered', about: 'statement', features: 'bento', work: 'grid', gallery: 'masonry', products: 'cards', testimonials: 'grid', stats: 'row', timeline: 'steps', faq: 'accordion', cta: 'banner', contact: 'split', marquee: 'plain', team: 'grid', logos: 'marquee', pricing: 'cards' },
    art: `radial-gradient(55% 60% at 28% 30%,var(--accent),transparent 70%),radial-gradient(50% 55% at 76% 72%,var(--accent-2),transparent 70%),conic-gradient(from var(--r),color-mix(in srgb,var(--accent) 30%,var(--dark)),var(--dark),color-mix(in srgb,var(--accent-2) 25%,var(--dark)),var(--dark))`,
    css: `
body::before{content:"";position:fixed;inset:-10vmax;z-index:-1;pointer-events:none;background:radial-gradient(38vmax 34vmax at 12% 8%,color-mix(in srgb,var(--accent) 30%,transparent),transparent 70%),radial-gradient(34vmax 30vmax at 90% 30%,color-mix(in srgb,var(--accent-2) 20%,transparent),transparent 70%),radial-gradient(40vmax 30vmax at 50% 110%,color-mix(in srgb,var(--accent) 18%,transparent),transparent 70%);animation:aur 26s ease-in-out infinite alternate}
@keyframes aur{to{transform:translate3d(4vmax,-3vmax,0) rotate(8deg) scale(1.08)}}
.t-light{--c-bg:transparent}.t-alt{--c-bg:color-mix(in srgb,var(--surface) 55%,transparent)}
.foot.t-light{--c-bg:transparent}
.h1 em,.h2 em,.statement em{font-style:normal;color:transparent}
.h1 em,.h2 em,.statement em,.h1 em .wi,.h2 em .wi,.statement em .wi,.h1 em .ch{background:linear-gradient(95deg,var(--accent),var(--accent-2));-webkit-background-clip:text;background-clip:text;color:transparent}
.hero::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle,color-mix(in srgb,var(--text) 16%,transparent) 1px,transparent 1.5px) 0 0/28px 28px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,#000,transparent);mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,#000,transparent)}
.btn-1{background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 55%,var(--accent-2)));color:#fff}
.hero-frame figure.m{border:1px solid color-mix(in srgb,var(--text) 16%,transparent)}
.num{background:linear-gradient(180deg,var(--c-fg),color-mix(in srgb,var(--c-fg) 35%,transparent));-webkit-background-clip:text;background-clip:text;color:transparent}
.ic{background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 30%,transparent),color-mix(in srgb,var(--accent-2) 20%,transparent));border:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
.top.is-solid{background:color-mix(in srgb,var(--bg) 60%,transparent)}
.tabbar{border:1px solid color-mix(in srgb,var(--dark-text) 14%,transparent)}.tb-pill{background:linear-gradient(135deg,var(--accent),color-mix(in srgb,var(--accent) 50%,var(--accent-2)))}
.menu-bg{background:color-mix(in srgb,var(--dark) 88%,transparent);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px)}
.plan.is-feat{background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 40%,var(--dark)),var(--dark))}
.eyebrow{text-transform:none;letter-spacing:.01em;font-size:.84rem}
.logo-t{letter-spacing:-.03em}`
  },
  bloom: {
    name: 'Bloom', tag: 'Organic & soft', desc: 'Warm naturals, blob shapes, wavy edges, gentle floating motion. For wellness, food, cafés, kids, nonprofits, lifestyle.',
    fonts: { display: 'Fraunces', body: 'DM Sans', label: 'DM Sans', em: '' }, displayWeight: 400, displayCase: 'none', displayTracking: '-.02em', emItalic: true, titleScale: 1, radius: 28, btnTracking: '0', btnCase: 'none', maxWidth: 1240,
    palettes: {
      sage: { name: 'Sage & clay', bg: '#FAF6EF', surface: '#EEF0E6', text: '#253027', accent: '#C9704F', accent2: '#E7B79A', dark: '#2B3A2E', darkText: '#F7F2E9' },
      peach: { name: 'Peach', bg: '#FFF7F0', surface: '#FDE8DA', text: '#3A2A22', accent: '#E07A5F', accent2: '#F2CC8F', dark: '#3D405B', darkText: '#FBF3EA' },
      lagoon: { name: 'Lagoon', bg: '#F4FAF9', surface: '#DDEFEC', text: '#133B3A', accent: '#2A9D8F', accent2: '#E9C46A', dark: '#133B3A', darkText: '#F4FAF9' }
    },
    d: { heading: 'editorial', buttons: 'pill', cards: 'flat', imageShape: 'blob', menu: 'curtain', reveal: 'scale', headAnim: 'rise', imgReveal: 'scale', heroText: 'wave', cursor: 'none', splash: 'none', spacing: 'airy', motionLevel: 'standard', grain: false, spotlight: false, headerLinks: false, logoPos: 'center' },
    toneCycle: ['light', 'alt', 'light', 'dark'], heroTone: 'alt', marqueeTone: 'accent', ctaTone: 'dark', sep: '❀',
    variants: { hero: 'split', about: 'split', features: 'cards', work: 'grid', gallery: 'masonry', products: 'menu', testimonials: 'slider', stats: 'row', timeline: 'steps', faq: 'accordion', cta: 'big', contact: 'centered', marquee: 'plain', team: 'grid', logos: 'marquee', pricing: 'cards' },
    art: `radial-gradient(38% 46% at 32% 40%,var(--accent-2) 0 60%,transparent 61%),radial-gradient(34% 40% at 70% 64%,var(--accent) 0 58%,transparent 60%),radial-gradient(20% 22% at 72% 22%,color-mix(in srgb,var(--text) 18%,var(--surface)) 0 60%,transparent 62%),var(--surface)`,
    css: `
.blk.t-alt::before,.blk.t-dark::before,.blk.t-accent::before,.foot::before{content:"";position:absolute;left:0;right:0;top:-29px;height:30px;background:var(--c-bg);-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 30'%3E%3Cpath d='M0 30V15C20 15 20 0 40 0s20 15 40 15 20-15 40-15v30z'/%3E%3C/svg%3E") 0 0/120px 30px repeat-x;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 30'%3E%3Cpath d='M0 30V15C20 15 20 0 40 0s20 15 40 15 20-15 40-15v30z'/%3E%3C/svg%3E") 0 0/120px 30px repeat-x}
.hero::before{content:"";position:absolute;z-index:0;right:-8vw;top:8%;width:clamp(260px,42vw,640px);aspect-ratio:1;border-radius:42% 58% 63% 37%/41% 44% 56% 59%;background:color-mix(in srgb,var(--accent-2) 45%,transparent);animation:blob 16s ease-in-out infinite alternate}
.hero::after{content:"";position:absolute;z-index:0;left:-6vw;bottom:6%;width:clamp(140px,18vw,260px);aspect-ratio:1;border-radius:63% 37% 54% 46%/55% 48% 52% 45%;background:color-mix(in srgb,var(--accent) 22%,transparent);animation:blob 12s ease-in-out infinite alternate-reverse}
.hero>*{position:relative;z-index:1}
@keyframes blob{50%{border-radius:58% 42% 38% 62%/48% 62% 38% 52%;transform:translate(-2vw,2vw) rotate(12deg)}to{border-radius:40% 60% 55% 45%/60% 40% 60% 40%;transform:translate(1vw,-1vw) rotate(-6deg)}}
figure.m.shape{animation:float 7s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-12px)}}
.h1 em,.h2 em{font-weight:300}
.card{border-radius:28px}
.eyebrow{text-transform:none;letter-spacing:.02em;font-size:.95rem;font-family:var(--fd);font-style:italic}
.hd-editorial .sh .eyebrow::before,.hd-editorial .hero-eb::before{width:22px;height:22px;background:none;content:"❀";color:var(--c-em);font-style:normal}
.hd-editorial .sh-c .eyebrow::after{display:none}
.tag{background:var(--accent-2);color:var(--text)}
.mi{border-bottom-style:dotted}`
  },
  pop: {
    name: 'Pop', tag: 'Playful & bold', desc: 'Candy colours, chunky type, stickers, bouncy motion. For shops, kids, creators, food trucks, events, brands with humour.',
    fonts: { display: 'Bricolage Grotesque', body: 'Figtree', label: 'Figtree', em: '' }, displayWeight: 800, displayCase: 'none', displayTracking: '-.045em', emItalic: false, titleScale: 1.04, radius: 22, btnTracking: '0', btnCase: 'none', maxWidth: 1260,
    palettes: {
      candy: { name: 'Candy', bg: '#FFF6E9', surface: '#FFE3F1', text: '#1D1A2F', accent: '#FF4D8D', accent2: '#3DDC97', dark: '#1D1A2F', darkText: '#FFF6E9' },
      citrus: { name: 'Citrus', bg: '#FFFBEA', surface: '#E4F7D2', text: '#1E2A1A', accent: '#FF6A00', accent2: '#FFD400', dark: '#1E2A1A', darkText: '#FFFBEA' },
      grape: { name: 'Grape soda', bg: '#F5F1FF', surface: '#FFE9C7', text: '#22123D', accent: '#7B3FF2', accent2: '#FFB800', dark: '#22123D', darkText: '#F5F1FF' }
    },
    d: { heading: 'stamp', buttons: 'shadow', cards: 'offset', imageShape: 'rounded', menu: 'tiles', reveal: 'pop', headAnim: 'pop', imgReveal: 'pop', heroText: 'wave', cursor: 'dot', splash: 'none', spacing: 'normal', motionLevel: 'standard', grain: false, spotlight: false, headerLinks: false, logoPos: 'center' },
    toneCycle: ['light', 'alt', 'light', 'accent'], heroTone: 'light', marqueeTone: 'dark', ctaTone: 'accent', sep: '★',
    variants: { hero: 'collage', about: 'split', features: 'cards', work: 'grid', gallery: 'marquee', products: 'cards', testimonials: 'grid', stats: 'row', timeline: 'steps', faq: 'accordion', cta: 'big', contact: 'cards', marquee: 'tape', team: 'grid', logos: 'marquee', pricing: 'cards' },
    art: `radial-gradient(circle at 26% 30%,var(--accent) 0 15%,transparent 15.5%),radial-gradient(circle at 72% 68%,var(--accent-2) 0 21%,transparent 21.5%),radial-gradient(circle at 78% 22%,var(--text) 0 5%,transparent 5.5%),repeating-radial-gradient(circle at 50% 50%,var(--surface) 0 12px,color-mix(in srgb,var(--surface) 60%,var(--bg)) 12px 24px)`,
    css: `
.h1 em,.h2 em,.statement em{font-style:normal;color:inherit;background:linear-gradient(transparent 56%,var(--accent-2) 56% 92%,transparent 92%);padding:0 .06em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.t-accent .h2 em,.t-accent .h1 em{background:linear-gradient(transparent 56%,color-mix(in srgb,var(--on-accent) 25%,transparent) 56% 92%,transparent 92%)}
.hd-stamp .sh .eyebrow,.hd-stamp .hero-eb{border-radius:999px;background:var(--accent-2);color:#111;border:2px solid var(--c-fg);rotate:-2deg;padding:.6em 1.1em}
.cards>.card:nth-child(odd),.team>*:nth-child(odd),.steps>*:nth-child(odd){rotate:-1.2deg}.cards>.card:nth-child(even),.team>*:nth-child(even),.steps>*:nth-child(even){rotate:1.2deg}
.cards>.card,.steps>*{transition:rotate .5s cubic-bezier(.34,1.56,.64,1),transform .5s cubic-bezier(.34,1.56,.64,1),box-shadow .4s}@media (hover:hover){.cards>.card:hover{rotate:0deg}}
figure.m:not(.hero-bg figure.m):not(.card>figure.m){border:3px solid var(--c-fg)}
figure.m.shape{rotate:2.5deg;box-shadow:10px 10px 0 var(--accent)}
.hero::after{content:"★";position:absolute;right:6%;top:18%;z-index:1;font-size:clamp(3.4rem,9vw,8rem);line-height:1;color:var(--accent);animation:spin 14s linear infinite}
@keyframes spin{to{rotate:360deg}}
.mq-tape{rotate:-3deg;border-block:3px solid var(--c-fg)}
.tag{border:2px solid var(--text);background:var(--accent-2);color:#111;rotate:-3deg}
.ic{border:2px solid var(--c-fg);background:var(--accent-2);color:#111}
.cl figure.m{border:3px solid var(--text)}.cl:nth-child(odd){rotate:-5deg}.cl:nth-child(even){rotate:4deg}
.tabbar{border:3px solid var(--text);background:var(--bg);color:var(--text)}
.sl-b,.soc a{border-width:2px}`
  },
  noir: {
    name: 'Noir', tag: 'Cinematic dark', desc: 'Black canvas, huge condensed type, film grain, scramble text, pinned scroll scenes. For photographers, film, music, fashion, nightlife.',
    fonts: { display: 'Anton', body: 'Inter', label: 'Inter', em: '' }, displayWeight: 400, displayCase: 'uppercase', displayTracking: '0', emItalic: false, titleScale: 1.08, radius: 0, btnTracking: '.16em', btnCase: 'uppercase', maxWidth: 1400,
    palettes: {
      noir: { name: 'Noir red', bg: '#0B0B0B', surface: '#151515', text: '#EDEAE4', accent: '#FF3B1F', accent2: '#FF8A73', dark: '#000000', darkText: '#EDEAE4' },
      gilded: { name: 'Gilded', bg: '#0A0907', surface: '#15120E', text: '#EFE6D6', accent: '#D4A24C', accent2: '#F0CF8A', dark: '#000000', darkText: '#EFE6D6' },
      ice: { name: 'Ice', bg: '#ECECEC', surface: '#DEDEDE', text: '#0A0A0A', accent: '#2E5BFF', accent2: '#9DB4FF', dark: '#0A0A0A', darkText: '#ECECEC' }
    },
    d: { heading: 'giant', buttons: 'underline', cards: 'border', imageShape: 'rect', menu: 'split', reveal: 'up', headAnim: 'rise', imgReveal: 'clip', heroText: 'scramble', cursor: 'label', splash: 'counter', spacing: 'airy', motionLevel: 'cinematic', grain: true, spotlight: false, headerLinks: false, logoPos: 'center' },
    toneCycle: ['light', 'alt'], heroTone: 'dark', marqueeTone: 'light', ctaTone: 'light', footTone: 'light', sep: '/',
    variants: { hero: 'fullbleed', about: 'statement', features: 'list', work: 'horizontal', gallery: 'horizontal', products: 'feature', testimonials: 'big', stats: 'big', timeline: 'agenda', faq: 'accordion', cta: 'marquee', contact: 'centered', marquee: 'outline', team: 'list', logos: 'marquee', pricing: 'simple' },
    art: `radial-gradient(60% 50% at 80% 18%,color-mix(in srgb,var(--accent) 55%,transparent),transparent 70%),radial-gradient(40% 40% at 20% 80%,color-mix(in srgb,var(--accent-2) 20%,transparent),transparent 70%),linear-gradient(var(--r),#1d1d1d,#050505)`,
    css: `
.h1 em,.h2 em,.statement em{font-style:normal;color:transparent;-webkit-text-stroke:1.4px var(--c-fg)}
.h1{line-height:.84}.hero .h1{font-size:calc(clamp(3.6rem,12vw,13rem) * var(--ts))}
figure.m img,figure.m video{filter:grayscale(1) contrast(1.08);transition:filter 1s,transform 1.2s var(--ease)}
@media (hover:hover){a:hover figure.m img,.g-it:hover figure.m img,.hs-card:hover figure.m img{filter:none}}
.hero-bg img,.hero-bg video{filter:grayscale(.6) contrast(1.1)}
.hero-shade{background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.15) 40%,rgba(0,0,0,.88))}
.eyebrow{letter-spacing:.34em}
.foot-big{font-size:min(calc(clamp(4rem,17vw,19rem) * var(--ts)),calc(var(--fit) * 1.25));line-height:.82}
.statement{text-transform:uppercase;font-size:calc(clamp(2.4rem,6vw,6.4rem) * var(--ts));line-height:.95}
.row-t{text-transform:uppercase}
.logo-t{letter-spacing:.2em;font-size:1.05rem}
.mq-outline .mq-w{font-size:calc(clamp(3rem,10vw,10rem) * var(--ts))}
.tabbar{border-radius:0}.tb-pill{border-radius:0}
.menu-bg{background:#000}`
  },
  studio: {
    name: 'Studio', tag: 'Agency minimal', desc: 'Oversized sans with serif accents, hover-image lists, stacking cards, magnetic buttons. For agencies, designers, developers, consultants.',
    fonts: { display: 'Instrument Sans', body: 'Instrument Sans', label: 'Instrument Sans', em: 'Instrument Serif' }, displayWeight: 500, displayCase: 'none', displayTracking: '-.05em', emItalic: true, titleScale: 1, radius: 16, btnTracking: '0', btnCase: 'none', maxWidth: 1400,
    palettes: {
      chalk: { name: 'Chalk & orange', bg: '#EFEEEA', surface: '#E4E2DC', text: '#111111', accent: '#FF4F00', accent2: '#FF8A4C', dark: '#111111', darkText: '#EFEEEA' },
      night: { name: 'Night & lime', bg: '#0E0E0E', surface: '#181818', text: '#F2F0EB', accent: '#C6FF3D', accent2: '#C6FF3D', dark: '#1C1C1C', darkText: '#F2F0EB' },
      sky: { name: 'Sky', bg: '#F4F7FB', surface: '#E6ECF5', text: '#0D1B2A', accent: '#2F5BFF', accent2: '#8FA8FF', dark: '#0D1B2A', darkText: '#F4F7FB' }
    },
    d: { heading: 'numbered', buttons: 'pill', cards: 'flat', imageShape: 'rounded', menu: 'panel', reveal: 'up', headAnim: 'rise', imgReveal: 'clip', heroText: 'rise', cursor: 'label', splash: 'curtain', spacing: 'airy', motionLevel: 'cinematic', grain: false, spotlight: false, headerLinks: true, logoPos: 'left' },
    toneCycle: ['light', 'light', 'dark'], heroTone: 'light', marqueeTone: 'light', ctaTone: 'dark', sep: '●',
    variants: { hero: 'type', about: 'statement', features: 'list', work: 'stack', gallery: 'horizontal', products: 'cards', testimonials: 'slider', stats: 'row', timeline: 'steps', faq: 'accordion', cta: 'big', contact: 'centered', marquee: 'plain', team: 'grid', logos: 'grid', pricing: 'cards' },
    art: `linear-gradient(var(--r),color-mix(in srgb,var(--accent) 80%,#fff),var(--accent) 45%,color-mix(in srgb,var(--accent) 45%,var(--dark)))`,
    css: `
.h1 em,.h2 em,.statement em,.foot-big em{font-family:var(--fe);font-weight:400;letter-spacing:-.01em}
.hero-type .h1{letter-spacing:-.06em}
.h1,.h2{letter-spacing:-.05em}
.btn{font-weight:500}
.eyebrow{text-transform:none;letter-spacing:0;font-size:.9rem}
.foot-big{letter-spacing:-.06em;font-size:min(calc(clamp(4rem,15vw,16rem) * var(--ts)),calc(var(--fit) * 1.12));line-height:.85}
.row-t{letter-spacing:-.03em}
.stk{background:var(--surface)}.t-dark .stk{background:color-mix(in srgb,var(--dark-text) 8%,var(--dark))}
.num{letter-spacing:-.06em}
.logo-t{letter-spacing:-.03em;font-weight:600}
.menu-bg{background:var(--dark)}`
  },
  gazette: {
    name: 'Gazette', tag: 'Magazine & newspaper', desc: 'Masthead headlines, drop caps, hairline rules, halftone photos, typewriter intro. For writers, journals, media, law, history.',
    fonts: { display: 'Playfair Display', body: 'Newsreader', label: 'IBM Plex Mono', em: '' }, displayWeight: 900, displayCase: 'none', displayTracking: '-.02em', emItalic: true, titleScale: 1, radius: 0, btnTracking: '.1em', btnCase: 'uppercase', maxWidth: 1240,
    palettes: {
      newsprint: { name: 'Newsprint', bg: '#F2EDE3', surface: '#E8E1D2', text: '#1A1714', accent: '#B3261E', accent2: '#E0776F', dark: '#1A1714', darkText: '#F2EDE3' },
      ink: { name: 'Ink & blue', bg: '#FBFAF7', surface: '#F0EEE8', text: '#111111', accent: '#1F4FD8', accent2: '#8FA9F2', dark: '#111111', darkText: '#FBFAF7' },
      sepia: { name: 'Sepia', bg: '#EFE6D2', surface: '#E4D7BC', text: '#2B2118', accent: '#8A4B1C', accent2: '#D9A066', dark: '#2B2118', darkText: '#EFE6D2' }
    },
    d: { heading: 'rule', buttons: 'square', cards: 'border', imageShape: 'rect', menu: 'panel', reveal: 'fade', headAnim: 'fade', imgReveal: 'fade', heroText: 'typewriter', cursor: 'none', splash: 'none', spacing: 'normal', motionLevel: 'subtle', grain: true, spotlight: false, headerLinks: true, logoPos: 'center' },
    toneCycle: ['light', 'light', 'alt'], heroTone: 'light', marqueeTone: 'dark', ctaTone: 'alt', sep: '§',
    variants: { hero: 'type', about: 'columns', features: 'cards', work: 'grid', gallery: 'masonry', products: 'feature', testimonials: 'big', stats: 'row', timeline: 'agenda', faq: 'columns', cta: 'big', contact: 'split', marquee: 'plain', team: 'list', logos: 'grid', pricing: 'simple' },
    art: `radial-gradient(circle,color-mix(in srgb,var(--text) 55%,transparent) 1.1px,transparent 1.6px) 0 0/7px 7px,linear-gradient(var(--r),var(--surface),color-mix(in srgb,var(--accent) 25%,var(--surface)))`,
    css: `
.top{border-bottom:3px double color-mix(in srgb,currentColor 40%,transparent)}
.logo-t{font-weight:900;font-size:clamp(1.3rem,2.4vw,2rem);letter-spacing:-.02em}
.blk+.blk{border-top:1px solid var(--c-line2)}
.prose>p:first-child::first-letter,.cols-text>p:first-child::first-letter{float:left;font:900 4.4em/.78 var(--fd);margin:.05em .1em 0 0;color:var(--c-em)}
.prose p,.cols-text p,.lead{text-align:justify;-webkit-hyphens:auto;hyphens:auto}
.lead{font-style:italic}
figure.m img{filter:grayscale(1) contrast(1.15) sepia(.12);transition:filter .8s}@media (hover:hover){a:hover figure.m img,.g-it:hover figure.m img{filter:none}}
.eyebrow,.w-meta,.row-n,.card-n,.stat-l,.foot-h,.fg label,.clinks b,.btn{font-family:var(--fl)}
.eyebrow{letter-spacing:.1em}
.cards{gap:0}.cards>.card{border:0;border-left:1px solid var(--c-line2);border-radius:0}.cards>.card:first-child{border-left:0}
.hero-type .h1{font-size:calc(clamp(3rem,10vw,10.5rem) * var(--ts));line-height:.9;border-bottom:3px double var(--c-line2);padding-bottom:.2em}
.hero-type .eyebrow{justify-content:space-between;border-block:1px solid var(--c-line2);padding:.7em 0}
.num{font-weight:900}
.card,.tabbar,.tb-pill{border-radius:0}
.tag{border-radius:0}
@media (max-width:900px){.cards>.card{border-left:0;border-top:1px solid var(--c-line2)}}`
  },
  retro: {
    name: 'Retro', tag: '70s groove', desc: 'Warm sunset stripes, groovy display type, sunbursts, wobbly motion. For cafés, bars, music, vintage shops, festivals.',
    fonts: { display: 'Shrikhand', body: 'Work Sans', label: 'Work Sans', em: '' }, displayWeight: 400, displayCase: 'none', displayTracking: '0', emItalic: false, titleScale: .92, radius: 24, btnTracking: '.02em', btnCase: 'none', maxWidth: 1240,
    palettes: {
      sunset: { name: 'Sunset', bg: '#F6EAD7', surface: '#F2D9B5', text: '#3B2416', accent: '#E4572E', accent2: '#F3A712', dark: '#3B2416', darkText: '#F6EAD7' },
      disco: { name: 'Disco', bg: '#1E1433', surface: '#2A1D47', text: '#F7E8FF', accent: '#FF6AD5', accent2: '#FFD166', dark: '#120A22', darkText: '#F7E8FF' },
      avocado: { name: 'Avocado', bg: '#F1EBD8', surface: '#DCE3C4', text: '#2F2A1A', accent: '#C8553D', accent2: '#8A9A3B', dark: '#2F2A1A', darkText: '#F1EBD8' }
    },
    d: { heading: 'pill', buttons: 'pill', cards: 'border', imageShape: 'arch', menu: 'curtain', reveal: 'pop', headAnim: 'pop', imgReveal: 'pop', heroText: 'wave', cursor: 'none', splash: 'none', spacing: 'normal', motionLevel: 'standard', grain: true, spotlight: false, headerLinks: false, logoPos: 'center' },
    toneCycle: ['light', 'alt', 'dark', 'light', 'accent'], heroTone: 'light', marqueeTone: 'dark', ctaTone: 'accent', sep: '✹',
    variants: { hero: 'centered', about: 'split', features: 'icons', work: 'grid', gallery: 'marquee', products: 'menu', testimonials: 'slider', stats: 'row', timeline: 'steps', faq: 'accordion', cta: 'big', contact: 'cards', marquee: 'tape', team: 'grid', logos: 'marquee', pricing: 'cards' },
    art: `repeating-conic-gradient(from var(--r) at 50% 115%,var(--accent) 0 9deg,var(--accent-2) 9deg 18deg,var(--surface) 18deg 27deg)`,
    css: `
.hero::before{content:"";position:absolute;z-index:0;left:50%;top:100%;width:220vmax;aspect-ratio:1;transform:translate(-50%,-50%);background:repeating-conic-gradient(from 0deg,color-mix(in srgb,var(--accent-2) 26%,transparent) 0 6deg,transparent 6deg 12deg);animation:spin 90s linear infinite;pointer-events:none}
@keyframes spin{to{rotate:360deg}}
.hero>*{position:relative;z-index:1}.hero-glow{display:none}
.blk.t-dark::before,.blk.t-accent::before,.foot::before{content:"";position:absolute;left:0;right:0;top:0;height:18px;background:linear-gradient(var(--accent-2) 0 33.3%,var(--accent) 33.3% 66.6%,color-mix(in srgb,var(--accent) 55%,var(--text)) 66.6%)}
.h1,.h2{text-shadow:.045em .045em 0 color-mix(in srgb,var(--accent-2) 75%,transparent)}
.h1 em,.h2 em{font-style:normal;color:var(--c-em)}
.card{border-width:2px}
.hd-pill .sh .eyebrow,.hd-pill .hero-eb{background:var(--accent);color:var(--on-accent);border:0;font-weight:700}
.hd-pill .sh .eyebrow::before,.hd-pill .hero-eb::before{background:var(--on-accent);box-shadow:none}
.mq-tape{rotate:-2deg}
.ic{border-radius:50%;background:var(--accent-2);color:var(--text)}
.tabbar{border-radius:999px}.tb-pill{border-radius:999px}
.num{text-shadow:.04em .04em 0 var(--accent-2)}`
  }
};
export const STYLES = S;
export const STYLE_IDS = Object.keys(S);

/** full design settings: style defaults + project overrides ('' / undefined = default) */
export function resolveDesign(design = {}) {
  const style = S[design.style] ? design.style : 'maison';
  const st = S[style];
  const pid = st.palettes[design.paletteId] ? design.paletteId : Object.keys(st.palettes)[0];
  const base = st.palettes[pid];
  const colors = design.colors || {};
  const palette = {};
  for (const k of ['bg', 'surface', 'text', 'accent', 'accent2', 'dark', 'darkText']) palette[k] = /^#[0-9a-f]{6}$/i.test(colors[k] || '') ? colors[k] : base[k];
  const f = design.fonts || {};
  const pick = (k, allowed) => (design[k] !== undefined && design[k] !== '' && (!allowed || allowed[design[k]] !== undefined) ? design[k] : st.d[k]);
  const num = (v, def, lo, hi) => { const n = parseFloat(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : def; };
  return {
    style, paletteId: pid, palette,
    fonts: { display: f.display || st.fonts.display, body: f.body || st.fonts.body, label: f.label || f.body || st.fonts.label, em: f.em || st.fonts.em || '' },
    displayWeight: num(design.displayWeight, st.displayWeight, 100, 900),
    displayCase: design.displayCase === 'uppercase' || design.displayCase === 'none' ? design.displayCase : st.displayCase,
    displayTracking: st.displayTracking, emItalic: design.emItalic === undefined || design.emItalic === '' ? st.emItalic : !!design.emItalic,
    scale: num(design.scale, 1, 0.85, 1.25), titleScale: num(design.titleScale, st.titleScale, 0.7, 1.4),
    radius: num(design.radius, st.radius, 0, 40), btnTracking: st.btnTracking, btnCase: st.btnCase, maxWidth: st.maxWidth,
    heading: pick('heading', OPTIONS.heading), buttons: pick('buttons', OPTIONS.buttons), cards: pick('cards', OPTIONS.cards), imageShape: pick('imageShape', OPTIONS.imageShape),
    menu: pick('menu', OPTIONS.menu), reveal: pick('reveal', OPTIONS.reveal), headAnim: pick('headAnim', OPTIONS.headAnim), imgReveal: pick('imgReveal', OPTIONS.imgReveal),
    heroText: pick('heroText', OPTIONS.heroText), cursor: pick('cursor', OPTIONS.cursor), splash: pick('splash', OPTIONS.splash), spacing: pick('spacing', OPTIONS.spacing),
    motionLevel: pick('motionLevel', OPTIONS.motionLevel), logoPos: pick('logoPos', OPTIONS.logoPos),
    grain: design.grain === undefined || design.grain === '' ? st.d.grain : !!design.grain,
    spotlight: design.spotlight === undefined || design.spotlight === '' ? st.d.spotlight : !!design.spotlight,
    headerLinks: design.headerLinks === undefined || design.headerLinks === '' ? st.d.headerLinks : !!design.headerLinks,
    parallax: true, magnetic: true, customCss: design.customCss || ''
  };
}
export function styleCss(id) {
  const st = S[id] || S.maison;
  return `\n/* style: ${st.name} */\n.art{background:${st.art}}${st.css}`;
}
export const artCss = id => (S[id] || S.maison).art;
