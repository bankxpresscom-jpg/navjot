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
  },
  developer: {
    name: 'Developer / AI tool', kind: 'Developer portfolio, dev tool, AI product', style: 'terminal', icon: 'code', desc: 'Console look, projects list, stack, docs-style FAQ.',
    blocks: () => [
      ['hero', { eyebrow: 'Engineer · Builder', title: 'I build software', titleEm: 'that ships.', text: 'One line on what you build and for whom.', buttons: [btn('See projects', '#projects'), btn('Contact', '#contact')], items: [it('APIs'), it('AI tools'), it('Web apps')] }],
      ['work', { menu: { show: true, label: 'Projects' }, eyebrow: 'Projects', title: 'Things I', titleEm: 'made.', items: [it('[Project]', 'What it does.', '[Stack]'), it('[Project]', 'What it does.', '[Stack]'), it('[Project]', 'What it does.', '[Stack]')] }],
      ['features', { menu: { show: true, label: 'Stack' }, variant: 'cards', eyebrow: 'Stack', title: 'Tools I', titleEm: 'use.', items: [it('Frontend', '[Your frontend tools]', '', { icon: 'code' }), it('Backend', '[Your backend tools]', '', { icon: 'layers' }), it('AI', '[Your AI tools]', '', { icon: 'zap' })] }],
      ['timeline', { menu: { show: true, label: 'Experience' }, eyebrow: 'Experience', title: 'Where I', titleEm: 'worked.', items: [it('[Role, company]', '[What you did]', '[Years]'), it('[Role, company]', '[What you did]', '[Years]')] }],
      ['faq', {}],
      ['contact', { title: 'Let’s build', titleEm: 'something.' }]
    ]
  },
  fashion: {
    name: 'Fashion / Beauty', kind: 'Fashion label, model, beauty brand, boutique', style: 'vogue', icon: 'bag', desc: 'Masthead headline, lookbook, collection, stockists.',
    blocks: () => [
      ['hero', { eyebrow: 'Collection · [Season]', title: 'The new', titleEm: 'silhouette.', text: 'A line about the collection.', buttons: [btn('View the collection', '#collection')] }],
      ['work', { menu: { show: true, label: 'Lookbook' }, eyebrow: 'Lookbook', title: 'Look', titleEm: 'book.', items: [it('Look 01', '', '[Season]'), it('Look 02', '', '[Season]'), it('Look 03', '', '[Season]'), it('Look 04', '', '[Season]')] }],
      ['about', { eyebrow: 'The house', title: 'Made slowly,', titleEm: 'worn forever.', text: 'Tell the story of the label.' }],
      ['products', { menu: { show: true, label: 'Collection' }, eyebrow: 'Shop', title: 'The', titleEm: 'collection.', items: [it('[Piece]', '', '[Price]', { tag: 'New' }), it('[Piece]', '', '[Price]'), it('[Piece]', '', '[Price]')] }],
      ['gallery', { title: 'Behind the', titleEm: 'scenes.' }],
      ['marquee', { items: [it('Atelier'), it('Craft'), it('Edition'), it('Couture')] }],
      ['contact', { title: 'Visit the', titleEm: 'atelier.' }]
    ]
  },
  web3: {
    name: 'Web3 / AI startup', kind: 'Crypto, AI startup, futuristic product', style: 'holo', icon: 'sparkles', desc: 'Holographic hero, bento features, roadmap, FAQ.',
    blocks: () => [
      ['hero', { eyebrow: 'Now live', title: 'The future,', titleEm: 'made simple.', text: 'One sentence about the product.', buttons: [btn('Get started', '#contact'), btn('Roadmap', '#roadmap')] }],
      ['logos', { eyebrow: 'Backed by', items: [it('[Partner]'), it('[Partner]'), it('[Partner]'), it('[Partner]')] }],
      ['features', { menu: { show: true, label: 'Product' }, eyebrow: 'Product', title: 'Built for', titleEm: 'what’s next.', items: [it('Fast', 'Describe the speed benefit.', '', { icon: 'zap' }), it('Secure', 'Describe security.', '', { icon: 'shield' }), it('Open', 'Describe openness.', '', { icon: 'globe' }), it('Smart', 'Describe the intelligence.', '', { icon: 'sparkles' })] }],
      ['timeline', { menu: { show: true, label: 'Roadmap' }, variant: 'steps', eyebrow: 'Roadmap', title: 'What’s', titleEm: 'coming.', items: [it('Launch', '[Details]', '[Quarter]'), it('Expand', '[Details]', '[Quarter]'), it('Scale', '[Details]', '[Quarter]')] }],
      ['faq', {}],
      ['cta', { title: 'Join the', titleEm: 'waitlist.', buttons: [btn('Join now', '#contact')] }],
      ['contact', {}]
    ]
  },
  hotel: {
    name: 'Hotel / Retreat', kind: 'Hotel, villa, retreat, spa, travel', style: 'zen', icon: 'home', desc: 'Calm hero, rooms, experiences, gallery, booking.',
    blocks: () => [
      ['hero', { eyebrow: 'Retreat', title: 'Where time', titleEm: 'slows down.', text: 'A line about the place and its setting.', buttons: [btn('Book your stay', '#contact'), btn('Rooms', '#rooms')] }],
      ['about', { eyebrow: 'The place', title: 'Quiet, by', titleEm: 'design.', text: 'Describe the setting, architecture and feeling.' }],
      ['products', { menu: { show: true, label: 'Rooms' }, variant: 'feature', eyebrow: 'Rooms', title: 'Stay', titleEm: 'with us.', items: [it('[Room name]', 'What makes it special.', '[Price per night]'), it('[Room name]', 'What makes it special.', '[Price per night]')] }],
      ['features', { menu: { show: true, label: 'Experiences' }, variant: 'icons', eyebrow: 'Experiences', title: 'Ways to', titleEm: 'unwind.', items: [it('Spa', 'Short description.', '', { icon: 'leaf' }), it('Dining', 'Short description.', '', { icon: 'utensils' }), it('Excursions', 'Short description.', '', { icon: 'compass' })] }],
      ['gallery', {}],
      ['testimonials', {}],
      ['map', {}],
      ['contact', { title: 'Plan your', titleEm: 'stay.' }]
    ]
  },
  luxury: {
    name: 'Luxury / Jewellery', kind: 'Jewellery, watches, luxury goods, fine dining', style: 'deco', icon: 'gem', desc: 'Gold deco frames, collection, craftsmanship, appointments.',
    blocks: () => [
      ['hero', { eyebrow: 'Maison · [Year founded]', title: 'Crafted to', titleEm: 'outlive us.', text: 'A line about the house and its craft.', buttons: [btn('Book an appointment', '#contact'), btn('The collection', '#collection')] }],
      ['about', { eyebrow: 'Heritage', title: 'A legacy of', titleEm: 'craft.', text: 'Tell the story of the house.' }],
      ['products', { menu: { show: true, label: 'Collection' }, eyebrow: 'Collection', title: 'Signature', titleEm: 'pieces.', items: [it('[Piece]', 'Materials and details.', '[Price]'), it('[Piece]', 'Materials and details.', '[Price]'), it('[Piece]', 'Materials and details.', '[Price]')] }],
      ['timeline', { menu: { show: true, label: 'Craft' }, variant: 'steps', eyebrow: 'The craft', title: 'From sketch', titleEm: 'to heirloom.', items: [it('Design', '', 'I'), it('Craft', '', 'II'), it('Finish', '', 'III')] }],
      ['testimonials', {}],
      ['contact', { title: 'By', titleEm: 'appointment.' }]
    ]
  },
  music: {
    name: 'Music artist / DJ', kind: 'Musician, DJ, band, label, podcast', style: 'kinetic', icon: 'music', desc: 'Giant type, releases, tour dates, videos, bookings.',
    blocks: () => [
      ['hero', { eyebrow: 'New release out now', title: 'Louder', titleEm: 'than words.', buttons: [btn('Listen', '#releases'), btn('Tour', '#tour')], items: [it('Live'), it('Studio'), it('Radio')] }],
      ['marquee', { items: [it('New single'), it('World tour'), it('Live sets')] }],
      ['products', { menu: { show: true, label: 'Releases' }, variant: 'feature', eyebrow: 'Releases', title: 'Latest', titleEm: 'drops.', items: [it('[Release title]', 'Listen on your favourite platform.', '[Year]', { link: '' })] }],
      ['timeline', { menu: { show: true, label: 'Tour' }, variant: 'agenda', eyebrow: 'Tour', title: 'On the', titleEm: 'road.', items: [it('[City, venue]', 'Tickets', '[Date]'), it('[City, venue]', 'Tickets', '[Date]'), it('[City, venue]', 'Tickets', '[Date]')] }],
      ['video', { title: 'Watch', titleEm: 'live.' }],
      ['gallery', {}],
      ['contact', { eyebrow: 'Bookings', title: 'Book a', titleEm: 'show.' }]
    ]
  },
  gaming: {
    name: 'Gaming / Esports', kind: 'Game, esports team, streamer, tech event', style: 'neon', icon: 'zap', desc: 'Neon grid hero, features, roster, schedule.',
    blocks: () => [
      ['hero', { eyebrow: 'Season [number]', title: 'Enter the', titleEm: 'arena.', text: 'One line that hypes the game or team.', buttons: [btn('Play now', '#contact'), btn('Schedule', '#schedule')] }],
      ['marquee', { items: [it('Compete'), it('Stream'), it('Win'), it('Repeat')] }],
      ['features', { menu: { show: true, label: 'Features' }, eyebrow: 'Features', title: 'Built to', titleEm: 'win.', items: [it('[Feature]', 'Short description.', '', { icon: 'zap' }), it('[Feature]', 'Short description.', '', { icon: 'target' }), it('[Feature]', 'Short description.', '', { icon: 'trophy' })] }],
      ['team', { menu: { show: true, label: 'Roster' }, eyebrow: 'Roster', title: 'The', titleEm: 'squad.' }],
      ['timeline', { menu: { show: true, label: 'Schedule' }, variant: 'agenda', eyebrow: 'Schedule', title: 'Next', titleEm: 'matches.', items: [it('[Match]', '[Details]', '[Date]'), it('[Match]', '[Details]', '[Date]')] }],
      ['contact', {}]
    ]
  },
  product: {
    name: 'Tech product launch', kind: 'Gadget, hardware, car, premium product', style: 'chrome', icon: 'box', desc: 'Chrome headline, features, specs, pre-order.',
    blocks: () => [
      ['hero', { eyebrow: 'Introducing', title: '[Product name]', titleEm: 'reimagined.', text: 'The one-line promise of the product.', buttons: [btn('Pre-order', '#contact'), btn('Specs', '#specs')] }],
      ['about', { eyebrow: 'Design', title: 'Every detail,', titleEm: 'considered.', text: 'What makes the design special.' }],
      ['features', { menu: { show: true, label: 'Features' }, eyebrow: 'Features', title: 'Power you', titleEm: 'can feel.', items: [it('[Feature]', 'Short description.', '', { icon: 'zap' }), it('[Feature]', 'Short description.', '', { icon: 'shield' }), it('[Feature]', 'Short description.', '', { icon: 'wifi' }), it('[Feature]', 'Short description.', '', { icon: 'sun' })] }],
      ['stats', { menu: { show: true, label: 'Specs' }, title: 'Specs', items: [it('[Spec]', '', '', { value: '00' }), it('[Spec]', '', '', { value: '00' }), it('[Spec]', '', '', { value: '00' })] }],
      ['pricing', { eyebrow: 'Models', title: 'Choose', titleEm: 'yours.', items: [it('Standard', '[Features]', '', { value: '[Price]' }), it('Pro', '[Features]', '', { value: '[Price]', tag: 'Most popular' })] }],
      ['faq', {}],
      ['contact', {}]
    ]
  },
  education: {
    name: 'School / Course', kind: 'School, academy, online course, workshop', style: 'bauhaus', icon: 'school', desc: 'Programmes, how it works, teachers, pricing, FAQ.',
    blocks: () => [
      ['hero', { eyebrow: 'Now enrolling', title: 'Learn by', titleEm: 'making.', text: 'One line about what students learn.', buttons: [btn('Enrol', '#contact'), btn('Programmes', '#programmes')] }],
      ['features', { menu: { show: true, label: 'Programmes' }, eyebrow: 'Programmes', title: 'Choose your', titleEm: 'path.', items: [it('[Course]', 'What students learn.', '', { icon: 'palette' }), it('[Course]', 'What students learn.', '', { icon: 'code' }), it('[Course]', 'What students learn.', '', { icon: 'pen' })] }],
      ['timeline', { variant: 'steps', menu: { show: true, label: 'How it works' }, eyebrow: 'How it works', title: 'Three steps to', titleEm: 'start.', items: [it('Apply', '', '01'), it('Learn', '', '02'), it('Create', '', '03')] }],
      ['team', { menu: { show: true, label: 'Teachers' }, eyebrow: 'Teachers', title: 'Learn from', titleEm: 'the best.' }],
      ['pricing', {}],
      ['faq', {}],
      ['contact', {}]
    ]
  },
  coach: {
    name: 'Coach / Creator', kind: 'Coach, consultant, creator, course seller', style: 'liquid', icon: 'heart', desc: 'Friendly hero, offers, results, testimonials, booking.',
    blocks: () => [
      ['hero', { eyebrow: 'Coaching', title: 'Grow with', titleEm: 'clarity.', text: 'Who you help and the change you bring.', buttons: [btn('Book a call', '#contact'), btn('Programmes', '#offers')] }],
      ['about', { eyebrow: 'Hi, I’m [Name]', title: 'I help people', titleEm: 'move forward.', text: 'Your story in a few lines.' }],
      ['pricing', { menu: { show: true, label: 'Offers' }, eyebrow: 'Work with me', title: 'Ways to', titleEm: 'start.', items: [it('1:1 session', 'One focused call', 'session', { value: '[Price]' }), it('Programme', 'Weekly calls\nWorkbook\nSupport', '[Length]', { value: '[Price]', tag: 'Popular' })] }],
      ['testimonials', {}],
      ['faq', {}],
      ['newsletter', {}],
      ['contact', { title: 'Let’s', titleEm: 'talk.' }]
    ]
  },
  space: {
    name: 'Science / Deep tech', kind: 'Space, science, research, deep-tech startup', style: 'cosmos', icon: 'rocket', desc: 'Starfield hero, mission, technology, team, news.',
    blocks: () => [
      ['hero', { eyebrow: 'Mission', title: 'Beyond the', titleEm: 'horizon.', text: 'One sentence about the mission.', buttons: [btn('Our mission', '#mission'), btn('Contact', '#contact')] }],
      ['about', { menu: { show: true, label: 'Mission' }, eyebrow: 'Mission', title: 'We exist to', titleEm: 'explore.', text: 'The mission in your own words.' }],
      ['features', { menu: { show: true, label: 'Technology' }, eyebrow: 'Technology', title: 'How it', titleEm: 'works.', items: [it('[Technology]', 'Short description.', '', { icon: 'rocket' }), it('[Technology]', 'Short description.', '', { icon: 'globe' }), it('[Technology]', 'Short description.', '', { icon: 'chart' })] }],
      ['stats', { items: [it('[Label]', '', '', { value: '00' }), it('[Label]', '', '', { value: '00' }), it('[Label]', '', '', { value: '00' })] }],
      ['team', {}],
      ['timeline', { menu: { show: true, label: 'News' }, variant: 'agenda', eyebrow: 'News', title: 'Latest', titleEm: 'updates.', items: [it('[Headline]', '[Summary]', '[Date]'), it('[Headline]', '[Summary]', '[Date]')] }],
      ['contact', {}]
    ]
  },
  clinic: {
    name: 'Modern clinic / Fintech', kind: 'Clinic, dental, fintech, health tech', style: 'frost', icon: 'health', desc: 'Clean glass look, services, process, team, booking.',
    blocks: () => [
      ['hero', { eyebrow: 'Care, redesigned', title: 'Modern care,', titleEm: 'human touch.', text: 'One line about the service.', buttons: [btn('Book now', '#contact'), btn('Services', '#services')] }],
      ['logos', { eyebrow: 'Accepted by', items: [it('[Partner]'), it('[Partner]'), it('[Partner]'), it('[Partner]')] }],
      ['features', { eyebrow: 'Services', title: 'Everything', titleEm: 'in one place.', items: [it('[Service]', 'Short description.', '', { icon: 'health' }), it('[Service]', 'Short description.', '', { icon: 'heart' }), it('[Service]', 'Short description.', '', { icon: 'shield' }), it('[Service]', 'Short description.', '', { icon: 'clock' })] }],
      ['timeline', { variant: 'steps', menu: { show: true, label: 'Process' }, eyebrow: 'Process', title: 'Simple from', titleEm: 'start to finish.', items: [it('Book', '', '01'), it('Visit', '', '02'), it('Follow up', '', '03')] }],
      ['team', {}],
      ['faq', {}],
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
