/**
 * Block registry: the single source of truth for block types, their layout
 * variants, which universal fields each one uses, and menu defaults.
 * Shared by the studio (editor), the engine (renderer) and the AI prompt.
 *
 * Every block uses the same universal shape:
 *   { id, type, variant, tone, menu:{show,label}, hidden,
 *     eyebrow, title, titleEm, text, image, video, images[], buttons[{label,href}],
 *     items[{title,text,meta,value,image,icon,tag,link}] }
 */
export const ICONS = ['star', 'sparkles', 'heart', 'zap', 'target', 'shield', 'globe', 'users', 'user', 'award', 'trophy', 'crown', 'gem', 'bulb',
  'book', 'book-open', 'cap', 'mic', 'camera', 'video', 'image', 'pen', 'palette', 'code', 'rocket', 'layers', 'chart', 'briefcase', 'building',
  'landmark', 'home', 'map', 'pin', 'plane', 'car', 'truck', 'box', 'cart', 'bag', 'tag', 'present', 'coffee', 'utensils', 'music', 'leaf',
  'flower', 'sun', 'moon', 'cloud', 'dumbbell', 'health', 'heart-hand', 'handshake', 'smile', 'clock', 'calendar', 'lock', 'eye', 'compass',
  'wand', 'wifi', 'phone', 'mail', 'chat', 'send', 'check', 'school', 'news', 'tv', 'scissors'];

const I = (title, text, meta, extra = {}) => ({ title, text, meta: meta || '', value: '', image: '', icon: '', tag: '', link: '', ...extra });

export const BLOCKS = {
  hero: {
    label: 'Hero', icon: 'star', group: 'Intro', menu: false,
    desc: 'The first screen: headline, intro, buttons, image or video.',
    variants: { fullbleed: 'Full-bleed image', split: 'Split', type: 'Giant type', centered: 'Centered', collage: 'Collage' },
    fields: { eyebrow: 'Small label', title: 'Headline', titleEm: 'Highlighted words', text: 'Intro', image: 'Main image', video: 'Background video (optional)', images: 'Extra images (collage)', buttons: 'Buttons', items: { label: 'Rotating words', f: { title: 'Word or phrase' } } },
    make: () => ({ eyebrow: 'Welcome', title: 'Your big idea,', titleEm: 'beautifully told.', text: 'One or two sentences that say what you do and who it is for.', buttons: [{ label: 'Get in touch', href: '#contact' }, { label: 'Learn more', href: '#about' }], items: [] })
  },
  about: {
    label: 'About / Story', icon: 'user', group: 'Content', menu: 'About',
    desc: 'Text with an image: story, mission, a big statement or a quote.',
    variants: { split: 'Image + text', statement: 'Big statement', columns: 'Two columns', quote: 'Quote' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Text (blank line = new paragraph)', image: 'Image', images: 'Second image', buttons: 'Buttons', items: { label: 'Highlights', f: { title: 'Highlight', text: 'Detail' } } },
    make: () => ({ eyebrow: 'About', title: 'The story', titleEm: 'behind it.', text: 'Tell visitors who you are, what you believe and why it matters.\n\nKeep it human and specific.', items: [] })
  },
  features: {
    label: 'Services / Features', icon: 'layers', group: 'Content', menu: 'Services',
    desc: 'What you offer, as cards, a numbered list, a bento grid or icons.',
    variants: { cards: 'Cards', list: 'Numbered list', bento: 'Bento grid', icons: 'Icon row' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', buttons: 'Buttons', items: { label: 'Items', f: { icon: 'Icon', title: 'Title', text: 'Description', image: 'Image (optional)', link: 'Link (optional)' } } },
    make: () => ({ eyebrow: 'What we do', title: 'Services built', titleEm: 'around you.', text: '', items: [I('Service one', 'A short, clear description of this service.', '', { icon: 'sparkles' }), I('Service two', 'A short, clear description of this service.', '', { icon: 'target' }), I('Service three', 'A short, clear description of this service.', '', { icon: 'heart' })] })
  },
  stats: {
    label: 'Numbers', icon: 'chart', group: 'Content', menu: false,
    desc: 'Animated counters. Use only real numbers.',
    variants: { row: 'Row', big: 'Big numbers' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', items: { label: 'Numbers', f: { value: 'Number', meta: 'Suffix (+, %, k)', title: 'Label' } } },
    make: () => ({ eyebrow: '', title: '', items: [I('[Label]', '', '+', { value: '10' }), I('[Label]', '', '', { value: '5' }), I('[Label]', '', '%', { value: '100' })] })
  },
  work: {
    label: 'Portfolio / Projects', icon: 'briefcase', group: 'Showcase', menu: 'Work',
    desc: 'Projects or case studies: grid, hover list, horizontal scroll or stacking cards.',
    variants: { grid: 'Grid', list: 'Hover list', horizontal: 'Horizontal scroll', stack: 'Stacking cards' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', buttons: 'Buttons', items: { label: 'Projects', f: { image: 'Image', title: 'Title', meta: 'Category / year', text: 'Description', link: 'Link' } } },
    make: () => ({ eyebrow: 'Selected work', title: 'Projects we', titleEm: 'are proud of.', items: [I('Project one', 'What it was and what changed.', 'Category'), I('Project two', 'What it was and what changed.', 'Category'), I('Project three', 'What it was and what changed.', 'Category'), I('Project four', 'What it was and what changed.', 'Category')] })
  },
  gallery: {
    label: 'Gallery', icon: 'image', group: 'Showcase', menu: 'Gallery',
    desc: 'Photos as moving rows, masonry, a grid or a horizontal scroll. Opens in a lightbox.',
    variants: { marquee: 'Moving rows', masonry: 'Masonry', grid: 'Grid', horizontal: 'Horizontal scroll' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', images: 'Image links (one per line)' },
    make: () => ({ eyebrow: 'Gallery', title: 'Moments in', titleEm: 'frame.', images: [] })
  },
  products: {
    label: 'Products / Menu', icon: 'bag', group: 'Showcase', menu: 'Shop',
    desc: 'Products, books, dishes or packages with prices and order buttons.',
    variants: { cards: 'Cards', menu: 'Menu list', feature: 'Feature rows' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', buttons: 'Buttons', items: { label: 'Items', f: { image: 'Image', title: 'Name', text: 'Description', meta: 'Price', tag: 'Badge (New, Bestseller…)', link: 'Buy / order link (empty = WhatsApp or email)' } } },
    make: () => ({ eyebrow: 'Collection', title: 'Made with', titleEm: 'care.', items: [I('Item one', 'A short description.', '[Price]'), I('Item two', 'A short description.', '[Price]'), I('Item three', 'A short description.', '[Price]')] })
  },
  pricing: {
    label: 'Pricing', icon: 'tag', group: 'Showcase', menu: 'Pricing',
    desc: 'Plans or packages. A badge marks the featured plan.',
    variants: { cards: 'Cards', simple: 'Simple rows' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', items: { label: 'Plans', f: { title: 'Plan name', value: 'Price', meta: 'Per (month, session…)', text: 'Features (one per line)', tag: 'Badge (featured)', link: 'Button link' } } },
    make: () => ({ eyebrow: 'Pricing', title: 'Simple, honest', titleEm: 'pricing.', items: [I('Starter', 'Feature one\nFeature two', 'month', { value: '[Price]' }), I('Pro', 'Everything in Starter\nFeature three\nFeature four', 'month', { value: '[Price]', tag: 'Popular' }), I('Custom', 'Tailored to you\nPriority support', '', { value: 'Let’s talk' })] })
  },
  testimonials: {
    label: 'Testimonials', icon: 'quote', group: 'Social proof', menu: 'Reviews',
    desc: 'What people say. Use real quotes only.',
    variants: { slider: 'Slider', grid: 'Grid', big: 'Big quote' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', items: { label: 'Quotes', f: { text: 'Quote', title: 'Name', meta: 'Role / company', image: 'Photo (optional)' } } },
    make: () => ({ eyebrow: 'Kind words', title: 'What people', titleEm: 'say.', items: [I('[Client name]', '[Add a real client quote here.]', '[Role, company]'), I('[Client name]', '[Add a real client quote here.]', '[Role, company]')] })
  },
  team: {
    label: 'Team', icon: 'users', group: 'Social proof', menu: 'Team',
    desc: 'People with photos and roles.',
    variants: { grid: 'Portrait grid', list: 'List' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', items: { label: 'People', f: { image: 'Photo', title: 'Name', meta: 'Role', text: 'Short bio', link: 'Profile link' } } },
    make: () => ({ eyebrow: 'Team', title: 'The people', titleEm: 'behind it.', items: [I('[Name]', '', '[Role]'), I('[Name]', '', '[Role]'), I('[Name]', '', '[Role]')] })
  },
  logos: {
    label: 'Logos / Press', icon: 'award', group: 'Social proof', menu: false,
    desc: 'Clients, partners or press as a moving strip or a grid.',
    variants: { marquee: 'Moving strip', grid: 'Grid' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', items: { label: 'Logos', f: { image: 'Logo image (optional)', title: 'Name', link: 'Link' } } },
    make: () => ({ eyebrow: 'Trusted by', title: '', items: [I('[Client]', ''), I('[Client]', ''), I('[Client]', ''), I('[Client]', '')] })
  },
  timeline: {
    label: 'Timeline / Steps / Events', icon: 'calendar', group: 'Content', menu: 'Journey',
    desc: 'A journey, a process, or an agenda of dates.',
    variants: { vertical: 'Vertical timeline', steps: 'Numbered steps', agenda: 'Agenda' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', items: { label: 'Entries', f: { meta: 'Year / step / date', title: 'Title', text: 'Description', link: 'Link (optional)' } } },
    make: () => ({ eyebrow: 'How it works', title: 'Three simple', titleEm: 'steps.', items: [I('Talk', 'Tell us what you need.', '01'), I('Plan', 'We shape the plan together.', '02'), I('Deliver', 'We build it and hand it over.', '03')] })
  },
  faq: {
    label: 'FAQ', icon: 'chat', group: 'Content', menu: 'FAQ',
    desc: 'Questions and answers.',
    variants: { accordion: 'Accordion', columns: 'Two columns' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Intro', items: { label: 'Questions', f: { title: 'Question', text: 'Answer' } } },
    make: () => ({ eyebrow: 'FAQ', title: 'Good to', titleEm: 'know.', items: [I('A common question?', 'A clear, helpful answer.'), I('Another question?', 'A clear, helpful answer.')] })
  },
  cta: {
    label: 'Call to action', icon: 'zap', group: 'Conversion', menu: false,
    desc: 'A bold invitation with a button.',
    variants: { big: 'Big type', banner: 'Banner', marquee: 'Scrolling text' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Text', image: 'Background image (banner)', buttons: 'Buttons' },
    make: () => ({ eyebrow: '', title: 'Ready when', titleEm: 'you are.', text: '', buttons: [{ label: 'Start a conversation', href: '#contact' }] })
  },
  marquee: {
    label: 'Moving text', icon: 'sparkles', group: 'Decoration', menu: false,
    desc: 'A ribbon of words that scrolls across the page.',
    variants: { tape: 'Tape', plain: 'Plain', outline: 'Outline' },
    fields: { items: { label: 'Words', f: { title: 'Word or phrase' } } },
    make: () => ({ items: [I('Design'), I('Strategy'), I('Craft'), I('Story')] })
  },
  video: {
    label: 'Video', icon: 'play', group: 'Showcase', menu: false,
    desc: 'YouTube, Vimeo or a video file with a cover image.',
    variants: { wide: 'Wide' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Text', video: 'Video link (YouTube, Vimeo, mp4)', image: 'Cover image' },
    make: () => ({ eyebrow: 'Watch', title: 'See it', titleEm: 'in motion.', video: '' })
  },
  contact: {
    label: 'Contact', icon: 'send', group: 'Conversion', menu: 'Contact',
    desc: 'Contact details from Brand settings, a message form and extra info rows.',
    variants: { split: 'Details + form', centered: 'Big email', cards: 'Cards' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Text', items: { label: 'Extra info (hours…)', f: { title: 'Label', text: 'Value' } } },
    make: () => ({ eyebrow: 'Contact', title: 'Let’s make something', titleEm: 'together.', text: 'Tell us a little about what you have in mind.', items: [] })
  },
  newsletter: {
    label: 'Newsletter', icon: 'mail', group: 'Conversion', menu: false,
    desc: 'Email sign-up. Paste your provider’s form link (Mailchimp, Buttondown…) as the button link.',
    variants: { inline: 'Inline' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Text', buttons: 'Button (link = form action URL)' },
    make: () => ({ eyebrow: 'Newsletter', title: 'Letters worth', titleEm: 'opening.', text: 'Occasional updates. No spam.', buttons: [{ label: 'Subscribe', href: '' }] })
  },
  map: {
    label: 'Map', icon: 'map', group: 'Conversion', menu: false,
    desc: 'Google map of the address in Brand settings (or the text below).',
    variants: { embed: 'Embed' },
    fields: { eyebrow: 'Small label', title: 'Title', titleEm: 'Highlighted words', text: 'Address to show (optional)' },
    make: () => ({ eyebrow: 'Visit', title: 'Find', titleEm: 'us.', text: '' })
  },
  html: {
    label: 'Custom HTML', icon: 'code', group: 'Advanced', menu: false,
    desc: 'Paste your own HTML (embeds, widgets). Rendered as-is.',
    variants: { raw: 'Raw' },
    fields: { text: 'HTML code' },
    make: () => ({ text: '<div style="padding:60px;text-align:center">Your HTML here</div>' })
  }
};
export const BLOCK_TYPES = Object.keys(BLOCKS);
export const BLOCK_GROUPS = [...new Set(Object.values(BLOCKS).map(b => b.group))];

let n = 0;
export const uid = () => 'b' + Date.now().toString(36).slice(-5) + (n++).toString(36) + Math.random().toString(36).slice(2, 5);

/** A complete block with every universal field present */
export function makeBlock(type, over = {}) {
  const def = BLOCKS[type] || BLOCKS.about;
  const base = { id: uid(), type: BLOCKS[type] ? type : 'about', variant: Object.keys(def.variants)[0], tone: 'auto', hidden: false,
    menu: { show: !!def.menu, label: typeof def.menu === 'string' ? def.menu : def.label.split(' /')[0] },
    eyebrow: '', title: '', titleEm: '', text: '', image: '', video: '', images: [], buttons: [], items: [] };
  return normalizeBlock({ ...base, ...def.make(), ...over });
}
const s = v => (v == null ? '' : String(v));
export function normalizeItem(it = {}) {
  return { title: s(it.title), text: s(it.text), meta: s(it.meta), value: s(it.value), image: s(it.image), icon: ICONS.includes(it.icon) ? it.icon : '', tag: s(it.tag), link: s(it.link), ...(it.q ? { q: s(it.q) } : {}) };
}
export function normalizeBlock(b = {}) {
  const def = BLOCKS[b.type] || BLOCKS.about;
  const type = BLOCKS[b.type] ? b.type : 'about';
  return {
    id: s(b.id) || uid(), type,
    variant: def.variants[b.variant] ? b.variant : Object.keys(def.variants)[0],
    tone: ['auto', 'light', 'alt', 'dark', 'accent'].includes(b.tone) ? b.tone : 'auto',
    hidden: !!b.hidden,
    menu: { show: b.menu ? !!b.menu.show : !!def.menu, label: s(b.menu?.label) || (typeof def.menu === 'string' ? def.menu : def.label.split(' /')[0]) },
    eyebrow: s(b.eyebrow), title: s(b.title), titleEm: s(b.titleEm), text: s(b.text), image: s(b.image), video: s(b.video),
    images: (Array.isArray(b.images) ? b.images : s(b.images).split(/\s*\n\s*/)).map(s).map(x => x.trim()).filter(Boolean),
    buttons: (Array.isArray(b.buttons) ? b.buttons : []).map(x => ({ label: s(x?.label), href: s(x?.href) })).filter(x => x.label || x.href).slice(0, 3),
    items: (Array.isArray(b.items) ? b.items : []).map(normalizeItem).slice(0, 40),
    ...(b.q ? { q: s(b.q) } : {}),
    ...(b.demo ? { demo: true } : {})
  };
}
