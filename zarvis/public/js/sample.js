/** A complete sample project (Dr. Navjot Kaur) to demo every Zarvis feature. */
const C = 'https://res.cloudinary.com/dhn6pvsr1';
export const SAMPLE = {
  meta: { projectName: 'Dr. Navjot Kaur' },
  brand: {
    name: 'Dr. Navjot Kaur', kind: 'speaker', language: 'en-IN',
    tagline: 'Beauty with purpose.',
    roles: 'Keynote Speaker, Guest Speaker, Motivational Speaker, Author, Educationist',
    location: 'India · UAE', audience: 'Conference organisers, schools, women\'s forums, readers',
    tone: 'Warm, regal, confident',
    bio: 'Dr. Navjot Kaur is an educationist, Director of Administration at Quest International School and an advisory board member to educational institutions.\nShe is Founder and Chairperson of the World Academic Achievers Forum, the Youth Diplomatic Conclave and The Global Women Achievers Circle (India / UAE). She holds a PhD and an MBA in International Business, with research in work-life balance and innovative teaching methods.\nAn Amazon bestselling author of five books and Mrs. India Planet 2022.',
    mission: 'Imparting the right knowledge, and encouraging women to believe in their dreams and unleash their true potential.'
  },
  contact: { email: 'hello@example.com', phone: '+91 77430 31578', whatsapp: '917743031578', address: '', mapUrl: '', bookingUrl: '' },
  social: { instagram: 'https://www.instagram.com/kaaurdrnavjot', linkedin: 'https://www.linkedin.com/in/dr-navjot-kaur-087a85318/', x: '', facebook: '', youtube: '', tiktok: '', threads: '', website: '' },
  media: {
    logo: `${C}/image/upload/v1790515212/splash-favicon-logo_yxkwes.png`,
    hero: `${C}/image/upload/v1790510343/hero_image_iadrrl.jpg`,
    heroVideo: '',
    portraits: [`${C}/image/upload/v1790510346/author_photo_3_ww7rlr.jpg`, `${C}/image/upload/v1790510349/author_photo_1_isytai.jpg`, `${C}/image/upload/v1790510342/author_photo_6_xlogdn.jpg`, `${C}/image/upload/v1790510342/author_photo_5_jq8mq8.jpg`],
    gallery: [`${C}/image/upload/v1790510341/author_photo_4_bbqvwu.jpg`, `${C}/image/upload/v1790247994/ayam_2022-1-1.jpg_cugy16.jpg`, `${C}/image/upload/v1790247659/20240713_120931_1.jpg_vh6opi.jpg`, `${C}/image/upload/v1790247657/20251206_145715.jpg_jqvwqr.jpg`, `${C}/image/upload/v1790247654/20250325_085754.jpg_vefo2i.jpg`, `${C}/image/upload/v1790247993/1000250327.jpg_ymehoq.jpg`, `${C}/image/upload/v1790510351/author_photo_2_t5pztb.jpg`, `${C}/image/upload/v1790247657/20250705_122055.jpg_pxvimo.jpg`],
    videos: [`${C}/video/upload/v1790248003/IMG_2677_uatv8n.mov`, `${C}/video/upload/v1790247763/1000211837_z2l8zl.mp4`],
    ogImage: ''
  },
  sections: { about: true, stats: true, services: false, speaking: true, books: true, orgs: true, awards: true, testimonials: false, timeline: false, gallery: true, press: true, faq: false, newsletter: false, contact: true },
  data: {
    stats: [{ value: '5', suffix: '', label: 'Books authored' }, { value: '4', suffix: '', label: 'International awards' }, { value: '16', suffix: '+', label: 'National honours' }, { value: '3', suffix: '', label: 'Global forums founded' }],
    services: [],
    topics: 'Women empowerment & leadership, Innovation in education, Work-life balance, Youth leadership, Beauty with purpose',
    books: [
      { title: 'Cosmic Map of Answers', cover: `${C}/image/upload/v1790247244/71to1VD6NoL._SL1500__mxv5zk.jpg`, buyUrl: 'https://amzn.in/d/0aum2eAt', buyLabel: 'Buy on Amazon', note: '' },
      { title: 'Mother: A Divine Blessing', cover: `${C}/image/upload/v1790515433/mother_a_divine_blessing_ltkh3x.jpg`, buyUrl: 'https://www.amazon.in/dp/9364526813', buyLabel: 'Amazon', note: '' },
      { title: 'Mother: A Divine Gift', cover: `${C}/image/upload/v1790515213/mother-a-divine-gift_rgdnjg.webp`, buyUrl: 'https://pnpacademy.in/product/mother-a-divine-gift/', buyLabel: 'Buy online', note: '' },
      { title: 'Mother: A Divine Creation', cover: `${C}/image/upload/v1790515212/mother_a_divine_creation_sb4gmq.jpg`, buyUrl: 'https://www.amazon.in/dp/B0G1YVZVYZ', buyLabel: 'Amazon', note: '' },
      { title: 'Gratitude, Wisdom & Blessing', cover: `${C}/image/upload/v1790515212/gratitude_wisdom_and_blessings_pstm7s.jpg`, buyUrl: 'https://www.amazon.in/Gratitude-Wisdom-Blessing-NAVJOT-KAUR/dp/B0F2F62YMG', buyLabel: 'Amazon', note: '' }
    ],
    awards: [
      { title: 'Mrs. India Planet 2022', org: 'Title', place: 'India', year: '2022', image: `${C}/image/upload/v1790248003/DSC_4235.JPG_tcaqwh.jpg` },
      { title: 'Inspirational Educator Award', org: 'International School Awards', place: 'Thailand', year: '2023', image: '' },
      { title: 'Educationist of the Year 2023', org: 'Dubai YUJ International Awards', place: 'Dubai, UAE', year: '2023', image: `${C}/image/upload/v1790247653/20231201_141109.jpg_te5row.jpg` },
      { title: 'Indian Achievers Award 2022', org: 'Outstanding Leadership in Education', place: 'Dubai', year: '2022', image: '' },
      { title: 'Young Woman Director of the Year 2023', org: 'Women Leaders Forum', place: 'New Delhi', year: '2023', image: `${C}/image/upload/v1790248006/2243.JPG_qkcfad.jpg` },
      { title: 'Director of the Year – Education 2023', org: 'Global Triumph Foundation', place: 'Chennai', year: '2023', image: '' }
    ],
    orgs: [
      { name: 'World Academic Achievers Forum', role: 'Founder & Chairperson', logo: `${C}/image/upload/v1790510338/world_academic_achievers_logo_geu0ea.jpg`, url: '' },
      { name: 'Youth Diplomatic Conclave', role: 'Founder & Chairperson', logo: `${C}/image/upload/v1790510342/youth_diplomatic_conclave_logo_klpqwl.png`, url: '' },
      { name: 'The Global Women Achievers Circle', role: 'Founder & Chairperson · India / UAE', logo: `${C}/image/upload/v1790510338/the_global_women_achievers_circle_logo_tmtstx.jpg`, url: '' },
      { name: 'Quest International School', role: 'Director of Administration', logo: '', url: '' }
    ],
    testimonials: [], press: 'Diva Planet, Fastway News, WeTel TV UAE, Pardais News, Dainik Bhaskar, Sahara Samachar',
    timeline: [], faqs: [], customSections: [], newsletterUrl: ''
  },
  features: { splash: true, smoothScroll: true, cursor: true, pinnedRail: true, whatsappBubble: true, backToTop: true, cookie: false, vcard: true, share: true, chatProvider: 'none', chatId: '', ga4: '', plausible: '' },
  design: { theme: 'luxe', heroLayout: 'fullbleed', motion: 'cinematic', accent: '', customCss: '' },
  seo: { domain: '', title: '', description: '' },
  unique: '',
  footer: { credit: '' }
};
