/**
 * Starter templates. Demo copy is flagged (demo:true) and anything factual
 * (prices, names, quotes, numbers, dates) is a [placeholder] so it can never
 * ship by accident: the studio warns about both before export.
 */
import { makeBlock } from './blocks.js';
import { STYLES } from './styles.js';

const it = (title, text = '', meta = '', x = {}) => ({ title, text, meta, ...x });
const btn = (label, href = '') => ({ label, href });

export const TEMPLATES = {
  blank: {
    name: 'Blank', kind: 'Any website', style: 'studio', icon: 'plus', desc: 'Hero, about and contact. Build the rest with blocks or AI.',
    blocks: () => [
      ['hero', { eyebrow: '', title: '', titleEm: '', text: '', buttons: [btn('Get in touch', '#contact')] }],
      ['about', { eyebrow: 'About', title: 'Who we are', titleEm: '', text: '' }],
      ['contact', {}]
    ]
  },
  personal: {
    name: 'Personal brand', kind: 'Speaker, coach, author, founder', style: 'maison', icon: 'mic', desc: 'A premium one-page brand for a person.',
    blocks: () => [
      ['hero', { eyebrow: 'Speaker · Author · Mentor', title: 'Ideas that', titleEm: 'move people.', text: 'Keynotes, workshops and mentoring that help people lead with clarity and courage.', buttons: [btn('Invite me to speak', '#contact'), btn('My story', '#about')], items: [it('Keynote speaker'), it('Author'), it('Mentor')] }],
      ['about', { eyebrow: 'About', title: 'A life of', titleEm: 'purpose.', text: 'Share where you started, what shaped you and what you stand for today.\n\nKeep it personal: the details only you can tell.', items: [it('Mission', 'One line on the change you want to see.')], buttons: [btn('Work with me', '#contact')] }],
      ['stats', { items: [it('[Label]', '', '+', { value: '00' }), it('[Label]', '', '', { value: '00' }), it('[Label]', '', '+', { value: '00' })] }],
      ['features', { menu: { show: true, label: 'Speaking' }, eyebrow: 'Speaking', title: 'Talks that', titleEm: 'stay with you.', items: [it('Keynotes', 'Inspiring talks for conferences and corporate events.', '', { icon: 'mic' }), it('Workshops', 'Hands-on sessions that turn ideas into habits.', '', { icon: 'users' }), it('Mentoring', 'One-to-one guidance for leaders and founders.', '', { icon: 'heart-hand' })] }],
      ['products', { menu: { show: true, label: 'Books' }, eyebrow: 'Books', title: 'Words that', titleEm: 'last.', items: [it('[Book title]', 'A short, honest description of the book and who it is for.', '[Price]', { tag: 'New' })] }],
      ['testimonials', {}],
      ['gallery', { eyebrow: 'Moments', title: 'On stage and', titleEm: 'beyond.' }],
      ['logos', { eyebrow: 'As seen in', items: [it('[Outlet]'), it('[Outlet]'), it('[Outlet]'), it('[Outlet]')] }],
      ['contact', { title: 'Let’s create something', titleEm: 'meaningful.' }]
    ]
  },
  restaurant: {
    name: 'Restaurant', kind: 'Restaurant, bakery, food brand', style: 'bloom', paletteId: 'peach', icon: 'utensils', desc: 'Menu, gallery, reviews, hours and map.',
    blocks: () => [
      ['hero', { eyebrow: 'Kitchen & table', title: 'Slow food,', titleEm: 'made with love.', text: 'Seasonal plates, warm lights and a table waiting for you.', buttons: [btn('Book a table', '#contact'), btn('See the menu', '#menu')] }],
      ['marquee', { items: [it('Seasonal'), it('Made fresh'), it('Local produce'), it('Family recipes')] }],
      ['about', { eyebrow: 'Our story', title: 'Cooking the way', titleEm: 'we eat at home.', text: 'Tell guests how the restaurant began, who cooks and what makes the food yours.' }],
      ['products', { menu: { show: true, label: 'Menu' }, variant: 'menu', eyebrow: 'The menu', title: 'Plates to', titleEm: 'share.', items: [it('[Dish name]', 'Short description of ingredients.', '[Price]', { tag: 'Chef’s pick' }), it('[Dish name]', 'Short description of ingredients.', '[Price]'), it('[Dish name]', 'Short description of ingredients.', '[Price]'), it('[Dish name]', 'Short description of ingredients.', '[Price]'), it('[Dish name]', 'Short description of ingredients.', '[Price]'), it('[Dish name]', 'Short description of ingredients.', '[Price]')] }],
      ['gallery', { eyebrow: 'Inside', title: 'Come', titleEm: 'hungry.' }],
      ['testimonials', { title: 'What guests', titleEm: 'say.' }],
      ['map', {}],
      ['contact', { eyebrow: 'Reservations', title: 'Save us', titleEm: 'a seat.', text: 'Call, message or email to book a table.', items: [it('Opening hours', '[Mon–Sun, hours]')] }]
    ]
  },
  agency: {
    name: 'Creative agency', kind: 'Agency, studio, freelancer', style: 'studio', icon: 'palette', desc: 'Big type, case studies, services and team.',
    blocks: () => [
      ['hero', { eyebrow: 'Independent creative studio', title: 'We design brands', titleEm: 'people remember.', text: 'Strategy, identity and digital experiences for ambitious teams.', buttons: [btn('Start a project', '#contact'), btn('See work', '#work')] }],
      ['marquee', { items: [it('Strategy'), it('Identity'), it('Websites'), it('Motion'), it('Campaigns')] }],
      ['about', { eyebrow: 'Studio', title: 'Small team. Sharp thinking.', titleEm: 'Work that works.', text: 'Say how you work, what you care about and the kind of clients you do your best work with.' }],
      ['work', { eyebrow: 'Selected work', title: 'Recent', titleEm: 'projects.' }],
      ['features', { eyebrow: 'Services', title: 'What we', titleEm: 'do.', items: [it('Brand strategy', 'Positioning, naming and messaging.', '', { icon: 'target' }), it('Visual identity', 'Logos, type, colour and systems.', '', { icon: 'palette' }), it('Websites', 'Design and build that performs.', '', { icon: 'code' }), it('Motion', 'Animation that gives brands a pulse.', '', { icon: 'play' })] }],
      ['testimonials', {}],
      ['team', {}],
      ['cta', { title: 'Have a project', titleEm: 'in mind?', buttons: [btn('Let’s talk', '#contact')] }],
      ['contact', { title: 'Tell us about', titleEm: 'your idea.' }]
    ]
  },
  saas: {
    name: 'SaaS / App', kind: 'Software, app, startup, AI', style: 'aurora', icon: 'rocket', desc: 'Product hero, features bento, pricing, FAQ.',
    blocks: () => [
      ['hero', { eyebrow: 'Now in beta', title: 'Ship faster with', titleEm: 'less busywork.', text: 'One clear sentence about what your product does and who it is for.', buttons: [btn('Start free', '#pricing'), btn('See how it works', '#how-it-works')] }],
      ['logos', { eyebrow: 'Trusted by teams at', items: [it('[Company]'), it('[Company]'), it('[Company]'), it('[Company]'), it('[Company]')] }],
      ['features', { menu: { show: true, label: 'Features' }, eyebrow: 'Features', title: 'Everything you need.', titleEm: 'Nothing you don’t.', items: [it('Automations', 'Describe the main feature and the time it saves.', '', { icon: 'zap' }), it('Insights', 'Describe your analytics or reporting.', '', { icon: 'chart' }), it('Integrations', 'Works with the tools teams already use.', '', { icon: 'layers' }), it('Security', 'Describe how data is protected.', '', { icon: 'lock' }), it('Collaboration', 'Describe how teams work together.', '', { icon: 'users' })] }],
      ['timeline', { menu: { show: true, label: 'How it works' }, variant: 'steps', eyebrow: 'How it works', title: 'Up and running', titleEm: 'in minutes.', items: [it('Connect', 'Link your accounts.', '01'), it('Configure', 'Pick what to automate.', '02'), it('Relax', 'Let it run.', '03')] }],
      ['testimonials', { title: 'Loved by', titleEm: 'busy teams.' }],
      ['pricing', {}],
      ['faq', {}],
      ['cta', { variant: 'banner', title: 'Ready to', titleEm: 'get started?', text: 'Set up takes minutes.', buttons: [btn('Start free', '#pricing')] }],
      ['contact', { menu: { show: false, label: 'Contact' } }]
    ]
  },
  photographer: {
    name: 'Photographer', kind: 'Photography, film, artist', style: 'noir', icon: 'camera', desc: 'Cinematic full-bleed, horizontal series, gallery.',
    blocks: () => [
      ['hero', { eyebrow: 'Photography', title: 'Light,', titleEm: 'captured.', buttons: [btn('Book a shoot', '#contact'), btn('View work', '#work')] }],
      ['about', { eyebrow: 'About', title: 'I photograph people as they are,', titleEm: 'not as they pose.', text: 'A few lines about your approach, where you work and what you love to shoot.' }],
      ['work', { eyebrow: 'Series', title: 'Selected', titleEm: 'stories.', items: [it('[Series title]', '', '[Year]'), it('[Series title]', '', '[Year]'), it('[Series title]', '', '[Year]'), it('[Series title]', '', '[Year]')] }],
      ['gallery', { variant: 'masonry', eyebrow: 'Archive', title: 'Frames', titleEm: 'I keep.' }],
      ['features', { eyebrow: 'Services', title: 'What I', titleEm: 'shoot.', items: [it('Weddings', 'Documentary coverage, start to finish.'), it('Portraits', 'Personal and professional sessions.'), it('Editorial', 'Commissions for brands and publications.')] }],
      ['testimonials', {}],
      ['cta', { title: 'Let’s make', titleEm: 'something real.', buttons: [btn('Get in touch', '#contact')] }],
      ['contact', { title: 'Book a', titleEm: 'shoot.' }]
    ]
  },
  event: {
    name: 'Event / Conference', kind: 'Festival, conference, launch', style: 'brutal', icon: 'calendar', desc: 'Schedule, speakers, tickets, venue.',
    blocks: () => [
      ['hero', { eyebrow: '[Date] · [City]', title: 'A festival for', titleEm: 'curious minds.', text: 'One line on who it is for and why they should come.', buttons: [btn('Get tickets', '#tickets'), btn('Programme', '#programme')] }],
      ['marquee', { items: [it('Talks'), it('Workshops'), it('Parties'), it('Networking')] }],
      ['about', { eyebrow: 'About', title: 'Why', titleEm: 'come?', text: 'Describe the experience, the people and what attendees take home.' }],
      ['timeline', { menu: { show: true, label: 'Programme' }, variant: 'agenda', eyebrow: 'Programme', title: 'The', titleEm: 'schedule.', items: [it('Doors open', 'Coffee and registration.', '[Time]'), it('[Session title]', '[Speaker]', '[Time]'), it('[Session title]', '[Speaker]', '[Time]'), it('Closing party', '', '[Time]')] }],
      ['team', { menu: { show: true, label: 'Speakers' }, eyebrow: 'Speakers', title: 'On', titleEm: 'stage.' }],
      ['pricing', { menu: { show: true, label: 'Tickets' }, eyebrow: 'Tickets', title: 'Grab a', titleEm: 'seat.', items: [it('Day pass', 'Access to all talks', 'person', { value: '[Price]' }), it('Full pass', 'All days\nWorkshops\nParty', 'person', { value: '[Price]', tag: 'Best value' })] }],
      ['faq', {}],
      ['map', { title: 'The', titleEm: 'venue.' }],
      ['contact', {}]
    ]
  },
  shop: {
    name: 'Shop / Product', kind: 'Online shop, product launch, maker', style: 'pop', icon: 'bag', desc: 'Products with WhatsApp or link ordering.',
    blocks: () => [
      ['hero', { eyebrow: 'Handmade goods', title: 'Small batch,', titleEm: 'big joy.', text: 'A short line about what you make and why people love it.', buttons: [btn('Shop now', '#shop'), btn('Our story', '#about')] }],
      ['marquee', { items: [it('Handmade'), it('Gift ready'), it('Small batch'), it('Made with care')] }],
      ['products', { eyebrow: 'Shop', title: 'Fresh', titleEm: 'drops.', items: [it('[Product]', 'Short description.', '[Price]', { tag: 'New' }), it('[Product]', 'Short description.', '[Price]'), it('[Product]', 'Short description.', '[Price]'), it('[Product]', 'Short description.', '[Price]')] }],
      ['about', { eyebrow: 'Our story', title: 'Made by hand,', titleEm: 'made to last.', text: 'Tell the story behind the brand.' }],
      ['features', { variant: 'icons', eyebrow: 'Why us', title: 'The good', titleEm: 'stuff.', items: [it('Handmade', 'Every piece is made by hand.', '', { icon: 'heart' }), it('Gift ready', 'Wrapped and ready to give.', '', { icon: 'present' }), it('Delivery', '[Shipping details]', '', { icon: 'truck' })] }],
      ['testimonials', {}],
      ['newsletter', { title: 'Be first to', titleEm: 'know.' }],
      ['faq', {}],
      ['contact', {}]
    ]
  },
  architect: {
    name: 'Architecture / Real estate', kind: 'Architect, interiors, property', style: 'swiss', icon: 'building', desc: 'Grid layouts, projects, process, team.',
    blocks: () => [
      ['hero', { eyebrow: 'Architecture & interiors', title: 'Spaces shaped', titleEm: 'by light.', text: 'Residential and commercial projects designed around the people who use them.', buttons: [btn('Start a project', '#contact'), btn('Projects', '#work')] }],
      ['about', { eyebrow: 'Practice', title: 'Design that', titleEm: 'endures.', text: 'Describe your philosophy, experience and the kind of work you take on.' }],
      ['work', { eyebrow: 'Projects', title: 'Selected', titleEm: 'projects.', items: [it('[Project]', '', '[Location, year]'), it('[Project]', '', '[Location, year]'), it('[Project]', '', '[Location, year]'), it('[Project]', '', '[Location, year]')] }],
      ['features', { eyebrow: 'Services', title: 'What we', titleEm: 'do.', items: [it('Architecture', 'Concept to completion.'), it('Interiors', 'Spaces, finishes and furniture.'), it('Planning', 'Feasibility and permissions.')] }],
      ['timeline', { variant: 'steps', menu: { show: true, label: 'Process' }, eyebrow: 'Process', title: 'How we', titleEm: 'work.', items: [it('Brief', 'We listen and visit the site.', '01'), it('Design', 'Concepts, drawings and models.', '02'), it('Build', 'We stay with you on site.', '03'), it('Handover', 'Final walk-through.', '04')] }],
      ['team', {}],
      ['contact', {}]
    ]
  },
  writer: {
    name: 'Writer / Magazine', kind: 'Author, journalist, blog, publication', style: 'gazette', icon: 'news', desc: 'Masthead, books, latest writing, newsletter.',
    blocks: () => [
      ['hero', { eyebrow: 'Essays · Books · Letters', title: 'Stories worth', titleEm: 'reading slowly.', text: 'A line about what you write and who reads it.', buttons: [btn('Read the latest', '#writing'), btn('Subscribe', '#newsletter')] }],
      ['about', { eyebrow: 'About', title: 'The', titleEm: 'writer.', text: 'A short biography in your own voice.' }],
      ['products', { menu: { show: true, label: 'Books' }, variant: 'feature', eyebrow: 'Books', title: 'On the', titleEm: 'shelf.', items: [it('[Book title]', 'What the book is about.', '[Price]')] }],
      ['timeline', { menu: { show: true, label: 'Writing' }, variant: 'agenda', eyebrow: 'Latest', title: 'Recent', titleEm: 'writing.', items: [it('[Article title]', '[Publication]', '[Date]'), it('[Article title]', '[Publication]', '[Date]'), it('[Article title]', '[Publication]', '[Date]')] }],
      ['testimonials', { variant: 'big', title: 'Praise', titleEm: '' }],
      ['newsletter', { menu: { show: true, label: 'Newsletter' } }],
      ['contact', {}]
    ]
  },
  cafe: {
    name: 'Café / Bar / Music', kind: 'Café, bar, venue, band', style: 'retro', icon: 'coffee', desc: 'Menu, events, gallery, map.',
    blocks: () => [
      ['hero', { eyebrow: 'Coffee · Records · Good company', title: 'Good coffee,', titleEm: 'good vibes.', text: 'A cosy corner for slow mornings and long evenings.', buttons: [btn('See the menu', '#menu'), btn('Find us', '#visit')] }],
      ['marquee', { items: [it('Espresso'), it('Vinyl nights'), it('Fresh bakes'), it('Open late')] }],
      ['products', { menu: { show: true, label: 'Menu' }, variant: 'menu', eyebrow: 'Menu', title: 'Sip &', titleEm: 'snack.', items: [it('[Drink]', '', '[Price]'), it('[Drink]', '', '[Price]'), it('[Bake]', '', '[Price]'), it('[Bake]', '', '[Price]')] }],
      ['about', { eyebrow: 'Our place', title: 'A room with', titleEm: 'a record player.', text: 'Tell people about the space and the people behind it.' }],
      ['timeline', { menu: { show: true, label: 'Events' }, variant: 'agenda', eyebrow: 'What’s on', title: 'This', titleEm: 'month.', items: [it('[Event]', '[Details]', '[Date]'), it('[Event]', '[Details]', '[Date]')] }],
      ['gallery', {}],
      ['map', { menu: { show: true, label: 'Visit' } }],
      ['contact', { items: [it('Hours', '[Opening hours]')] }]
    ]
  },
  wellness: {
    name: 'Wellness / Clinic', kind: 'Yoga, spa, therapist, clinic', style: 'bloom', paletteId: 'lagoon', icon: 'leaf', desc: 'Services, classes, team, booking.',
    blocks: () => [
      ['hero', { eyebrow: 'Studio & care', title: 'Breathe,', titleEm: 'then begin.', text: 'A calm place to move, rest and feel like yourself again.', buttons: [btn('Book a session', '#contact'), btn('Classes', '#classes')] }],
      ['about', { eyebrow: 'Welcome', title: 'Care that', titleEm: 'feels human.', text: 'Introduce your practice and what a first visit is like.' }],
      ['features', { menu: { show: true, label: 'Classes' }, eyebrow: 'Classes', title: 'Find your', titleEm: 'rhythm.', items: [it('Yoga', 'Short description.', '', { icon: 'leaf' }), it('Meditation', 'Short description.', '', { icon: 'sun' }), it('Therapy', 'Short description.', '', { icon: 'heart-hand' })] }],
      ['pricing', { eyebrow: 'Prices', title: 'Simple', titleEm: 'options.', items: [it('Drop-in', 'One class', 'class', { value: '[Price]' }), it('Monthly', 'Unlimited classes', 'month', { value: '[Price]', tag: 'Popular' })] }],
      ['team', {}],
      ['testimonials', {}],
      ['faq', {}],
      ['contact', { title: 'Book your', titleEm: 'first visit.' }]
    ]
  },
  nonprofit: {
    name: 'Nonprofit / Cause', kind: 'Charity, community, foundation', style: 'studio', paletteId: 'sky', icon: 'heart-hand', desc: 'Mission, impact, programmes, donate.',
    blocks: () => [
      ['hero', { eyebrow: 'Foundation', title: 'Small acts,', titleEm: 'lasting change.', text: 'One sentence on the change you work for.', buttons: [btn('Donate', '#contact'), btn('Our work', '#programmes')] }],
      ['about', { variant: 'statement', eyebrow: 'Mission', title: 'We believe every child deserves', titleEm: 'a fair start.', text: 'Replace with your mission in your own words.' }],
      ['stats', { title: 'Impact so far', items: [it('[Label]', '', '+', { value: '00' }), it('[Label]', '', '', { value: '00' }), it('[Label]', '', '', { value: '00' })] }],
      ['features', { menu: { show: true, label: 'Programmes' }, eyebrow: 'Programmes', title: 'Where we', titleEm: 'work.', items: [it('[Programme]', 'What it does and for whom.', '', { icon: 'school' }), it('[Programme]', 'What it does and for whom.', '', { icon: 'heart' }), it('[Programme]', 'What it does and for whom.', '', { icon: 'users' })] }],
      ['gallery', {}],
      ['testimonials', {}],
      ['cta', { title: 'Help us', titleEm: 'go further.', buttons: [btn('Donate', '#contact')] }],
      ['contact', {}]
    ]
  }
};
export const TEMPLATE_IDS = Object.keys(TEMPLATES);

/** blocks for a template, with the style's recommended layouts */
export function templateBlocks(id, styleId) {
  const t = TEMPLATES[id] || TEMPLATES.blank;
  const st = STYLES[styleId || t.style] || STYLES.maison;
  return t.blocks().map(([type, over]) => makeBlock(type, { ...over, variant: over.variant || st.variants[type], demo: id !== 'blank' }));
}
