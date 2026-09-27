/* =============================================================================
   Zarvis studio UI: form → spec → (optional AI copy) → engine → preview / zip
   ========================================================================== */
import { THEMES, HERO_LAYOUTS, MOTION_LEVELS } from './themes.js';
import { renderSite, esc } from './engine.js';
import { makeZip } from './zip.js';
import { SAMPLE } from './sample.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* ---------------------------------------------------------------- models */
const PROVIDERS = {
  anthropic: { label: 'Claude (Anthropic)', models: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5', 'claude-opus-5-5', 'claude-fable-5-1'], def: 'claude-opus-5' },
  openai:    { label: 'OpenAI', models: ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini'], def: 'gpt-4.1-mini' },
  gemini:    { label: 'Google Gemini', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'], def: 'gemini-2.5-flash' },
  groq:      { label: 'Groq', models: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'], def: 'llama-3.3-70b-versatile' }
};

/* ---------------------------------------------------------------- spec */
function blankSpec() {
  return {
    meta: { projectName: 'New website' },
    brand: { name: '', kind: 'personal', language: 'en', tagline: '', roles: '', location: '', audience: '', tone: '', bio: '', mission: '' },
    contact: { email: '', phone: '', whatsapp: '', address: '', mapUrl: '', bookingUrl: '' },
    social: { instagram: '', linkedin: '', x: '', facebook: '', youtube: '', tiktok: '', threads: '', website: '' },
    media: { logo: '', hero: '', heroVideo: '', portraits: ['', '', '', ''], gallery: [], videos: [], ogImage: '' },
    sections: { about: true, stats: false, services: false, speaking: false, books: false, orgs: false, awards: false, testimonials: false, timeline: false, gallery: true, press: false, faq: false, newsletter: false, contact: true },
    data: { stats: [], services: [], topics: '', books: [], awards: [], orgs: [], testimonials: [], press: '', timeline: [], faqs: [], customSections: [], newsletterUrl: '' },
    features: { splash: true, smoothScroll: true, cursor: true, pinnedRail: true, whatsappBubble: true, backToTop: true, cookie: false, vcard: true, share: true, chatProvider: 'none', chatId: '', ga4: '', plausible: '' },
    design: { theme: 'luxe', heroLayout: 'fullbleed', motion: 'standard', accent: '', customCss: '' },
    seo: { domain: '', title: '', description: '' },
    unique: '',
    footer: { credit: '' }
  };
}
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); let a = o; ks.slice(0, -1).forEach(k => { if (a[k] == null) a[k] = {}; a = a[k]; }); a[ks.at(-1)] = v; };
/** Fill any fields missing from older/imported projects */
function normalize(spec) {
  const base = blankSpec();
  const merge = (b, s) => { for (const k of Object.keys(b)) { if (s[k] === undefined) s[k] = b[k]; else if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) merge(b[k], s[k]); } return s; };
  return merge(base, spec || {});
}

/* ---------------------------------------------------------------- storage */
const LS = { projects: 'zarvis-projects-v1', current: 'zarvis-current-v1', settings: 'zarvis-settings-v1' };
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('Browser storage is full or blocked: export your project as JSON.'); } }
};
let projects = store.get(LS.projects, {});
let currentId = store.get(LS.current, null);
let state = null; // { id, spec, copy, ai }
function newId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function openProject(id) {
  const p = projects[id]; if (!p) return;
  currentId = id; store.set(LS.current, id);
  state = { id, spec: normalize(p.spec), copy: p.copy || null, ai: p.ai || null };
  $('#projectName').value = state.spec.meta.projectName || '';
  renderStep(); schedulePreview(0);
}
function createProject(spec, copy = null) {
  const id = newId();
  projects[id] = { spec: normalize(spec), copy, updated: Date.now() };
  store.set(LS.projects, projects); openProject(id);
}
let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { projects[state.id] = { spec: state.spec, copy: state.copy, ai: state.ai, updated: Date.now() }; store.set(LS.projects, projects); }, 300);
}

/* ---------------------------------------------------------------- settings */
let settings = store.get(LS.settings, { provider: 'anthropic', model: PROVIDERS.anthropic.def, effort: '' });
let status = { providers: {}, passwordRequired: false };
const pw = () => { try { return sessionStorage.getItem('zarvis-pw') || ''; } catch { return ''; } };
async function api(path, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', 'x-zarvis-key': pw(), ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && data.passwordRequired) { status.passwordRequired = true; openSettings(true); throw new Error('Enter the Zarvis password in Settings.'); }
  if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
async function loadStatus() {
  try { status = await api('/api/status'); } catch { status = { providers: {}, passwordRequired: status.passwordRequired, offline: true }; }
  updateAiChip();
}
function updateAiChip() {
  const chip = $('#aiChip'), ok = status.providers?.[settings.provider];
  chip.textContent = status.offline ? (status.passwordRequired ? 'AI: password needed' : 'AI: offline (no worker)') : `AI: ${PROVIDERS[settings.provider].label.split(' ')[0]} · ${settings.model}${ok ? '' : ' · no key'}`;
  chip.className = 'zchip ' + (ok ? 'ok' : 'warn');
}
function openSettings(needPw = false) {
  const d = $('#settings'), sp = $('#setProvider');
  sp.innerHTML = Object.entries(PROVIDERS).map(([k, p]) => `<option value="${k}">${p.label}${status.providers?.[k] ? ' ✓ key set' : ' (no key)'}</option>`).join('');
  sp.value = settings.provider;
  const fillModels = () => { $('#modelList').innerHTML = PROVIDERS[sp.value].models.map(m => `<option value="${m}">`).join(''); $('#keyStatus').textContent = status.providers?.[sp.value] ? 'API key is configured on the server.' : `No key found. Add ${{ anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY' }[sp.value]} in Cloudflare → Pages → Settings → Variables and Secrets.`; };
  sp.onchange = () => { fillModels(); $('#setModel').value = PROVIDERS[sp.value].def; };
  fillModels();
  $('#setModel').value = settings.model; $('#setEffort').value = settings.effort || '';
  $('#pwField').hidden = !(status.passwordRequired || needPw);
  d.showModal();
  d.onclose = () => {
    settings = { provider: sp.value, model: $('#setModel').value.trim() || PROVIDERS[sp.value].def, effort: $('#setEffort').value };
    store.set(LS.settings, settings);
    const p = $('#setPassword').value; if (p) { try { sessionStorage.setItem('zarvis-pw', p); } catch { /* ignore */ } }
    loadStatus();
  };
}

/* ---------------------------------------------------------------- form building blocks */
const F = {
  text: (path, label, o = {}) => `<div class="zfield"><label for="f-${path}">${label}</label><input id="f-${path}" data-path="${path}" type="${o.type || 'text'}" placeholder="${esc(o.ph || '')}" value="${esc(getPath(state.spec, path) ?? '')}">${o.hint ? `<small>${o.hint}</small>` : ''}</div>`,
  area: (path, label, o = {}) => `<div class="zfield"><label for="f-${path}">${label}</label><textarea id="f-${path}" data-path="${path}" placeholder="${esc(o.ph || '')}" rows="${o.rows || 4}">${esc(getPath(state.spec, path) ?? '')}</textarea>${o.hint ? `<small>${o.hint}</small>` : ''}</div>`,
  lines: (path, label, o = {}) => `<div class="zfield"><label for="f-${path}">${label}</label><textarea id="f-${path}" data-lines="${path}" rows="${o.rows || 5}" placeholder="${esc(o.ph || 'One URL per line')}">${esc((getPath(state.spec, path) || []).join('\n'))}</textarea>${o.hint ? `<small>${o.hint}</small>` : ''}<div class="zthumbs" data-thumbs="${path}"></div></div>`,
  select: (path, label, opts, o = {}) => `<div class="zfield"><label for="f-${path}">${label}</label><select id="f-${path}" data-path="${path}">${Object.entries(opts).map(([v, t]) => `<option value="${v}"${getPath(state.spec, path) === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>${o.hint ? `<small>${o.hint}</small>` : ''}</div>`,
  toggle: (path, title, hint = '') => `<label class="ztoggle"><input type="checkbox" data-path="${path}"${getPath(state.spec, path) ? ' checked' : ''}><span><b>${title}</b>${hint ? `<small>${hint}</small>` : ''}</span></label>`,
  group: (title, body, extra = '') => `<section class="zgroup"><h3>${title}${extra}</h3>${body}</section>`,
  rep: (path, fields, addLabel) => {
    const items = getPath(state.spec, path) || [];
    const row = (it, i) => {
      const inputs = fields.map(f => f.area
        ? `<textarea data-rep="${path}" data-i="${i}" data-k="${f.k}" rows="2" placeholder="${esc(f.ph)}" aria-label="${esc(f.ph)}">${esc(it[f.k] ?? '')}</textarea>`
        : `<input data-rep="${path}" data-i="${i}" data-k="${f.k}" placeholder="${esc(f.ph)}" aria-label="${esc(f.ph)}" value="${esc(it[f.k] ?? '')}">`);
      const layout = fields.length >= 3 && !fields.some(f => f.area || f.wide) ? `<div class="zrow3">${inputs.join('')}</div>` : inputs.map((x, j) => fields[j].half ? x : x).join('');
      return `<div class="zrep-item">${layout}<button class="zrep-del" type="button" data-del="${path}" data-i="${i}" aria-label="Remove">✕</button></div>`;
    };
    return `<div class="zrep">${items.map(row).join('')}<button class="zbtn ghost sm zrep-add" type="button" data-add="${path}" data-fields="${esc(JSON.stringify(fields.map(f => f.k)))}">+ ${addLabel}</button></div>`;
  }
};

/* ---------------------------------------------------------------- steps */
const STEPS = [
  { id: 'brand', title: 'Brand', intro: 'Who is this website for? These facts are the only facts the AI is allowed to use.', render: () =>
    F.group('Identity', F.text('brand.name', 'Name / brand *', { ph: 'Dr. Jane Doe' }) +
      `<div class="zrow">${F.select('brand.kind', 'Kind of site', { personal: 'Personal brand', speaker: 'Speaker', author: 'Author', creative: 'Creative / artist', coach: 'Coach / consultant', business: 'Business / studio' })}${F.text('brand.language', 'Language code', { ph: 'en, en-IN, hi, ar…' })}</div>` +
      F.text('brand.tagline', 'Tagline', { ph: 'Beauty with purpose.' }) +
      F.text('brand.roles', 'Roles / titles', { ph: 'Keynote Speaker, Author, Educationist', hint: 'Comma separated. These rotate in the hero.' }) +
      `<div class="zrow">${F.text('brand.location', 'Location', { ph: 'Mumbai · Dubai' })}${F.text('brand.tone', 'Tone of voice', { ph: 'Warm, bold, premium' })}</div>` +
      F.text('brand.audience', 'Audience', { ph: 'Event organisers, readers, clients' })) +
    F.group('Story', F.area('brand.bio', 'Bio (facts)', { rows: 7, ph: 'Paste the bio. Each line becomes a paragraph if you skip AI.' }) + F.area('brand.mission', 'Mission / quote', { rows: 2 }))
  },
  { id: 'contact', title: 'Contact & social', intro: 'Every link here becomes an icon, a contact row and structured data for Google.', render: () =>
    F.group('Contact', `<div class="zrow">${F.text('contact.email', 'Email', { type: 'email' })}${F.text('contact.phone', 'Phone', { ph: '+91 98765 43210' })}</div>` +
      F.text('contact.whatsapp', 'WhatsApp number', { ph: '919876543210', hint: 'Country code + number, digits only. Enables the chat bubble and WhatsApp order/enquiry forms.' }) +
      F.text('contact.address', 'Address') + `<div class="zrow">${F.text('contact.mapUrl', 'Google Maps link')}${F.text('contact.bookingUrl', 'Booking link (Calendly…)')}</div>`) +
    F.group('Social media', `<div class="zrow">${F.text('social.instagram', 'Instagram URL')}${F.text('social.linkedin', 'LinkedIn URL')}</div><div class="zrow">${F.text('social.x', 'X / Twitter URL')}${F.text('social.facebook', 'Facebook URL')}</div><div class="zrow">${F.text('social.youtube', 'YouTube URL')}${F.text('social.tiktok', 'TikTok URL')}</div><div class="zrow">${F.text('social.threads', 'Threads URL')}${F.text('social.website', 'Other website')}</div>`)
  },
  { id: 'media', title: 'Images & video', intro: 'Paste image links. Cloudinary links get automatic face-aware crops, responsive sizes, blurred backdrops and a generated social-share image.', render: () =>
    F.group('Key images', F.text('media.logo', 'Logo (transparent PNG ideal)', { hint: 'Used in splash, header, footer and favicon (on black).' }) + F.text('media.hero', 'Hero image *', { hint: 'Full-bleed background of the first screen. Choose a strong portrait or brand image.' }) + F.text('media.heroVideo', 'Hero video (optional)', { hint: 'Plays silently over the hero image after the page loads.' }) + '<div class="zthumbs" data-thumbs="key"></div>') +
    F.group('Portraits', '<p class="zhint" style="margin:0 0 10px">Used in About (cross-fading), Speaking and Contact.</p>' + [0, 1, 2, 3].map(i => F.text(`media.portraits.${i}`, `Portrait ${i + 1}`)).join('')) +
    F.group('Gallery', F.lines('media.gallery', 'Gallery images', { hint: 'Shown whole (never cropped) in two moving rows with a lightbox.' }) + F.lines('media.videos', 'Videos', { rows: 3, hint: 'The first video also plays in the Speaking section.' }) + F.text('media.ogImage', 'Social share image override (optional)'))
  },
  { id: 'sections', title: 'Sections', intro: 'Tick the sections you want. Each shows its content fields when switched on.', render: () => {
    const sec = (id, title, hint, body = '') => `<section class="zgroup"><h3><label class="ztoggle" style="margin:0;border:0;padding:0;flex:1"><input type="checkbox" data-path="sections.${id}"${state.spec.sections[id] ? ' checked' : ''}><span><b>${title}</b><small>${hint}</small></span></label></h3>${state.spec.sections[id] && body ? body : ''}</section>`;
    return sec('about', 'About', 'Portrait stack, bio, mission quote, save-contact button.') +
      sec('stats', 'Stats', 'Animated counters. Use only real numbers.', F.rep('data.stats', [{ k: 'value', ph: '16' }, { k: 'suffix', ph: '+' }, { k: 'label', ph: 'National honours' }], 'Add stat')) +
      sec('services', 'Services', 'What you offer. Leave empty to let the AI suggest from the bio.', F.rep('data.services', [{ k: 'title', ph: 'Keynotes' }, { k: 'text', ph: 'Short description (optional)', area: true }], 'Add service')) +
      sec('speaking', 'Speaking', 'Topics, speaking formats, "Invite to speak" form.', F.area('data.topics', 'Talk topics (comma separated)', { rows: 2 })) +
      sec('books', 'Books / products', 'Featured item + 3D shelf. WhatsApp ordering built in.', F.rep('data.books', [{ k: 'title', ph: 'Title' }, { k: 'cover', ph: 'Cover image URL' }, { k: 'buyUrl', ph: 'Buy link (Amazon, store…)' }, { k: 'buyLabel', ph: 'Button label, e.g. Buy on Amazon' }, { k: 'note', ph: 'Short description (optional)', area: true }], 'Add book / product')) +
      sec('orgs', 'Organisations / clients', 'Logos with roles: leadership, clients or partners.', F.rep('data.orgs', [{ k: 'name', ph: 'Organisation' }, { k: 'role', ph: 'Role' }, { k: 'logo', ph: 'Logo URL' }, { k: 'url', ph: 'Website (optional)' }], 'Add organisation')) +
      sec('awards', 'Awards / honours', 'Pinned horizontal rail on desktop. Add a photo to any award.', F.rep('data.awards', [{ k: 'title', ph: 'Award' }, { k: 'org', ph: 'Organiser' }, { k: 'place', ph: 'City / country' }, { k: 'year', ph: 'Year' }, { k: 'image', ph: 'Photo URL (optional)' }], 'Add award')) +
      sec('testimonials', 'Testimonials', 'Real quotes only.', F.rep('data.testimonials', [{ k: 'quote', ph: 'Quote', area: true }, { k: 'name', ph: 'Name' }, { k: 'role', ph: 'Role / company' }], 'Add testimonial')) +
      sec('timeline', 'Timeline / journey', 'Milestones by year.', F.rep('data.timeline', [{ k: 'year', ph: '2023' }, { k: 'title', ph: 'Milestone' }, { k: 'text', ph: 'Detail (optional)' }], 'Add milestone')) +
      sec('gallery', 'Gallery', 'Uses the gallery images and videos from step 3.') +
      sec('press', 'Press / media', 'Outlet names as an animated typographic marquee.', F.area('data.press', 'Outlets (comma separated)', { rows: 2 })) +
      sec('faq', 'FAQ', 'Leave empty to let the AI write FAQs from your facts.', F.rep('data.faqs', [{ k: 'q', ph: 'Question' }, { k: 'a', ph: 'Answer', area: true }], 'Add question')) +
      sec('newsletter', 'Newsletter', 'Mailchimp / ConvertKit form action URL, or email sign-up.', F.text('data.newsletterUrl', 'Form action URL (optional)')) +
      F.group('Custom sections', '<p class="zhint" style="margin:0 0 10px">Anything else, written by you. (The AI can also add sections from your unique request.)</p>' + F.rep('data.customSections', [{ k: 'eyebrow', ph: 'Small label' }, { k: 'title', ph: 'Title' }, { k: 'em', ph: 'Italic accent word' }, { k: 'body', ph: 'Paragraphs (new line = new paragraph)', area: true }, { k: 'bullets', ph: 'Bullets (comma separated)' }], 'Add custom section')) +
      sec('contact', 'Contact', 'Always recommended: enquiry form, WhatsApp, call, email, map, booking, socials.');
  } },
  { id: 'features', title: 'Features', intro: 'Modern site features. All are optimised to load after the page so speed stays high.', render: () =>
    F.group('Experience', `<div class="zgrid2">${F.toggle('features.splash', 'Splash screen', 'Logo intro, once per visit')}${F.toggle('features.smoothScroll', 'Smooth scrolling', 'Lenis inertia scroll')}${F.toggle('features.cursor', 'Custom cursor', 'Labels like VIEW / PLAY')}${F.toggle('features.pinnedRail', 'Pinned awards rail', 'Horizontal scroll on desktop')}${F.toggle('features.backToTop', 'Back to top', 'Floating button')}${F.toggle('features.share', 'Share buttons', 'WhatsApp, LinkedIn, X, copy link')}${F.toggle('features.vcard', 'Save contact (vCard)', 'One-tap add to phone')}${F.toggle('features.whatsappBubble', 'WhatsApp chat bubble', 'Needs a WhatsApp number')}</div>`) +
    F.group('Live chat widget', `<div class="zrow">${F.select('features.chatProvider', 'Provider', { none: 'None', tawk: 'Tawk.to', crisp: 'Crisp' })}${F.text('features.chatId', 'Property / website ID', { ph: 'Tawk: 64ab…/1h5… · Crisp: website ID' })}</div>`) +
    F.group('Analytics & privacy', `<div class="zrow">${F.text('features.ga4', 'Google Analytics 4 ID', { ph: 'G-XXXXXXX' })}${F.text('features.plausible', 'Plausible domain', { ph: 'example.com' })}</div>${F.toggle('features.cookie', 'Cookie consent banner', 'Analytics load only after the visitor accepts')}`)
  },
  { id: 'design', title: 'Design', intro: 'Choose an art direction. Everything else (layout rhythm, type scale, motion) follows it.', render: () => {
    const themes = Object.entries(THEMES).map(([k, t]) => `<button type="button" class="ztheme" data-theme="${k}" aria-pressed="${state.spec.design.theme === k}"><span class="sw"><i style="background:${t.c.ink}"></i><i style="background:${t.c.bg}"></i><i style="background:${t.c.accent}"></i><i style="background:${t.c.accent2}"></i><span class="aa" style="background:${t.c.ink};color:${t.c.accent2};font-family:'${t.fonts.display[0]}',serif">Aa</span></span><span class="tx"><b>${t.name}</b><small>${t.note}</small><small style="margin-top:4px">${t.fonts.display[0]} · ${t.fonts.label[0]} · ${t.fonts.body[0]}</small></span></button>`).join('');
    return F.group('Theme', `<div class="zthemes">${themes}</div>`) +
      F.group('Hero layout', `<div class="zradios">${Object.entries(HERO_LAYOUTS).map(([k, t]) => `<label class="ztoggle"><input type="radio" name="hl" data-path="design.heroLayout" value="${k}"${state.spec.design.heroLayout === k ? ' checked' : ''}><span><b>${t}</b></span></label>`).join('')}</div>`) +
      F.group('Motion', `<div class="zradios">${Object.entries(MOTION_LEVELS).map(([k, t]) => `<label class="ztoggle"><input type="radio" name="mo" data-path="design.motion" value="${k}"${state.spec.design.motion === k ? ' checked' : ''}><span><b>${t}</b></span></label>`).join('')}</div>`) +
      F.group('Fine tuning', F.text('design.accent', 'Accent colour override (optional)', { ph: '#B8924F' }) + F.area('design.customCss', 'Custom CSS (optional)', { rows: 4, ph: 'Uses variables: --bg --ink --accent --accent-2 --display …' }));
  } },
  { id: 'ai', title: 'AI brief & SEO', intro: 'Tell the AI anything unique you want. It writes all headlines and copy from your facts, in your language.', render: () =>
    F.group('Unique request', F.area('unique', 'Anything special or different?', { rows: 6, ph: 'e.g. Add a section about my mentoring programme for young women. Keep the tone poetic. Mention that I travel between India and Dubai.' })) +
    F.group('SEO & sharing', F.text('seo.domain', 'Website address', { ph: 'https://www.yourname.com', hint: 'Used for canonical URL, sitemap, robots.txt and social previews.' }) + F.text('seo.title', 'Page title override (optional)') + F.area('seo.description', 'Meta description override (optional)', { rows: 2 })) +
    F.group('Footer', F.text('footer.credit', 'Footer credit (optional)', { ph: 'Crafted by …' }))
  },
  { id: 'build', title: 'Build & download', intro: 'Write the copy with AI (optional), compare themes, then download a zip ready for Cloudflare Pages.', render: () => `
    ${F.group('1 · Copy', `<div class="zcta">
      <p class="zhint" style="margin:0">Provider: <b>${esc(PROVIDERS[settings.provider].label)}</b> · model <b>${esc(settings.model)}</b>${settings.effort ? ` · effort ${esc(settings.effort)}` : ''} <button class="zbtn ghost sm" type="button" data-act="settings">Change</button></p>
      <button class="zbtn primary lg" type="button" data-act="ai">✦ Write copy with AI</button>
      ${state.copy ? '<button class="zbtn ghost sm" type="button" data-act="clear-ai">Use my own text only (clear AI copy)</button>' : ''}
      <div class="zlog" id="aiLog">${state.ai ? esc(`Last AI run: ${state.ai.provider} · ${state.ai.model}${state.ai.usage ? ` · ${state.ai.usage.input ?? '?'} in / ${state.ai.usage.output ?? '?'} out tokens` : ''}${state.ai.notes ? `\nNotes: ${state.ai.notes}` : ''}`) : 'No AI copy yet: the site uses your own text. That works too.'}</div>
    </div>`)}
    ${F.group('2 · Compare themes', `<p class="zhint" style="margin:0 0 10px">Same content, six art directions. Click one to apply.</p><div class="zvariants" id="variants"></div><button class="zbtn ghost sm" type="button" data-act="variants" style="margin-top:10px">Render theme previews</button>`)}
    ${F.group('3 · Download', `<div class="zcta"><button class="zbtn primary lg" type="button" data-act="zip">⬇ Download website ZIP</button><p class="zhint" style="margin:0">Cloudflare → Workers & Pages → Create → Pages → Upload assets → drop in the zip. The zip also contains <code>zarvis-project.json</code> so you can re-import and edit later.</p></div>`)}`
  }
];
let step = 'brand';

function renderSteps() {
  $('#steps').innerHTML = STEPS.map((s, i) => `<button type="button" data-step="${s.id}" aria-current="${s.id === step}"><span>${i + 1}</span>${s.title}</button>`).join('');
}
function renderStep() {
  renderSteps();
  const s = STEPS.find(x => x.id === step);
  $('#form').innerHTML = `<h2>${s.title}</h2><p class="zintro">${s.intro}</p>${s.render()}`;
  refreshThumbs();
  $('#form').scrollTop = 0;
}
function refreshThumbs() {
  const img = u => /^https?:\/\//.test(u) ? `<img src="${esc(u.includes('/upload/') ? u.replace('/upload/', '/upload/c_fill,w_120,h_120,g_auto,f_auto,q_auto/').replace(/\.(mov|mp4|webm)$/i, '.jpg').replace('/upload/c_fill', u.includes('/video/') ? '/upload/so_1,c_fill' : '/upload/c_fill') : u)}" alt="" loading="lazy" onerror="this.remove()">` : '';
  $$('[data-thumbs]').forEach(box => {
    const p = box.dataset.thumbs;
    const urls = p === 'key' ? [state.spec.media.logo, state.spec.media.hero] : (getPath(state.spec, p) || []);
    box.innerHTML = urls.filter(Boolean).slice(0, 18).map(img).join('');
  });
}

/* ---------------------------------------------------------------- form events */
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'projectName') { state.spec.meta.projectName = t.value; save(); return; }
  if (t.dataset.path && t.type !== 'checkbox' && t.type !== 'radio') { setPath(state.spec, t.dataset.path, t.value); changed(); }
  else if (t.dataset.lines) { setPath(state.spec, t.dataset.lines, t.value.split(/\n+/).map(x => x.trim()).filter(Boolean)); changed(); refreshThumbs(); }
  else if (t.dataset.rep) { const arr = getPath(state.spec, t.dataset.rep); arr[+t.dataset.i][t.dataset.k] = t.value; changed(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.path && t.type === 'checkbox') { setPath(state.spec, t.dataset.path, t.checked); changed(); if (t.dataset.path.startsWith('sections.')) renderStep(); }
  if (t.dataset.path && t.type === 'radio') { setPath(state.spec, t.dataset.path, t.value); changed(); }
  if (t.tagName === 'SELECT' && t.dataset.path) { setPath(state.spec, t.dataset.path, t.value); changed(); }
  if (t.id === 'importFile' && t.files[0]) importFile(t.files[0]);
  if (t.dataset.path === 'media.hero' || t.dataset.path === 'media.logo') refreshThumbs();
});
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-step]'); if (!t) return;
  if (t.dataset.step) { step = t.dataset.step; renderStep(); return; }
  if (t.dataset.add) { const arr = getPath(state.spec, t.dataset.add) || []; arr.push(Object.fromEntries(JSON.parse(t.dataset.fields).map(k => [k, '']))); setPath(state.spec, t.dataset.add, arr); changed(); renderStep(); return; }
  if (t.dataset.del) { getPath(state.spec, t.dataset.del).splice(+t.dataset.i, 1); changed(); renderStep(); return; }
  if (t.dataset.theme) { state.spec.design.theme = t.dataset.theme; $$('[data-theme]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); changed(); return; }
  if (t.dataset.device) { $$('[data-device]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); $('#frameWrap').dataset.device = t.dataset.device; return; }
  const act = t.dataset.act;
  if (act === 'ai') generateAI(t);
  if (act === 'clear-ai') { state.copy = null; state.ai = null; save(); renderStep(); schedulePreview(0); }
  if (act === 'zip') downloadZip();
  if (act === 'variants') renderVariants();
  if (act === 'settings') openSettings();
  if (t.dataset.variant) { state.spec.design.theme = t.dataset.variant; changed(); $$('[data-variant]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); toast(`Theme: ${THEMES[t.dataset.variant].name}`); }
});
function changed() { save(); schedulePreview(); }

/* ---------------------------------------------------------------- preview */
let runtimeJs = '';
async function runtime() { if (!runtimeJs) runtimeJs = await (await fetch('/engine/site.js')).text(); return runtimeJs; }
let previewTimer;
function schedulePreview(delay = 700) { clearTimeout(previewTimer); previewTimer = setTimeout(renderPreview, delay); }
async function renderPreview() {
  try {
    const r = await renderSite({ spec: state.spec, copy: state.copy, runtimeJs: await runtime(), forPreview: true });
    $('#preview').srcdoc = r.previewHtml;
    $('#previewMeta').textContent = `${r.meta.theme} · ${r.meta.layout} hero · ${r.meta.motion} motion · ${r.meta.sections.length} sections${state.copy ? ' · AI copy' : ''}`;
  } catch (err) { console.error(err); $('#previewMeta').textContent = 'Preview error: ' + err.message; }
}
async function renderVariants() {
  const box = $('#variants'); if (!box) return;
  box.innerHTML = '';
  for (const k of Object.keys(THEMES)) {
    const spec = JSON.parse(JSON.stringify(state.spec)); spec.design.theme = k; spec.features.splash = false;
    const r = await renderSite({ spec, copy: state.copy, runtimeJs: await runtime(), forPreview: true });
    const b = document.createElement('button'); b.type = 'button'; b.className = 'zvariant'; b.dataset.variant = k; b.setAttribute('aria-pressed', String(state.spec.design.theme === k));
    b.innerHTML = `<iframe tabindex="-1" aria-hidden="true" sandbox="allow-scripts"></iframe><span>${esc(THEMES[k].name)}</span>`;
    box.appendChild(b); $('iframe', b).srcdoc = r.previewHtml;
  }
}

/* ---------------------------------------------------------------- AI */
function brief() {
  const s = state.spec, d = s.data;
  return {
    language: s.brand.language, name: s.brand.name, kind: s.brand.kind, tagline: s.brand.tagline, roles: s.brand.roles, location: s.brand.location,
    audience: s.brand.audience, tone: s.brand.tone, bio: s.brand.bio, mission: s.brand.mission,
    stats: s.sections.stats ? d.stats : [], services: s.sections.services ? d.services : [], topics: s.sections.speaking ? d.topics : '',
    books: s.sections.books ? d.books.map(b => ({ title: b.title, note: b.note })) : [], awards: s.sections.awards ? d.awards : [],
    orgs: s.sections.orgs ? d.orgs : [], press: s.sections.press ? d.press : '', timeline: s.sections.timeline ? d.timeline : [],
    contactModes: [s.contact.whatsapp && 'WhatsApp', s.contact.email && 'email', s.contact.phone && 'phone', s.contact.bookingUrl && 'online booking'].filter(Boolean).join(', '),
    sections: Object.entries(s.sections).filter(([, v]) => v).map(([k]) => k),
    unique: s.unique
  };
}
async function generateAI(btn) {
  const log = $('#aiLog');
  if (!state.spec.brand.name.trim()) { toast('Add a name in step 1 first.'); return; }
  btn.disabled = true; const t0 = Date.now();
  log.innerHTML = `Writing copy with ${esc(PROVIDERS[settings.provider].label)} · ${esc(settings.model)}…`;
  const timer = setInterval(() => { log.innerHTML = `Writing copy with ${esc(PROVIDERS[settings.provider].label)} · ${esc(settings.model)}… ${Math.round((Date.now() - t0) / 1000)}s`; }, 1000);
  try {
    const r = await api('/api/generate', { method: 'POST', body: JSON.stringify({ provider: settings.provider, model: settings.model, effort: settings.effort || undefined, brief: brief() }) });
    state.copy = r.copy; state.ai = { provider: r.provider, model: r.model, usage: r.usage, notes: r.copy?.notes || '', at: Date.now() };
    save(); schedulePreview(0);
    log.innerHTML = `<span class="ok">✓ Copy written in ${Math.round((Date.now() - t0) / 1000)}s</span> · ${esc(r.model)}${r.usage ? ` · ${r.usage.input ?? '?'} in / ${r.usage.output ?? '?'} out tokens` : ''}${r.copy?.notes ? `\nNotes: ${esc(r.copy.notes)}` : ''}`;
  } catch (err) {
    log.innerHTML = `<span class="err">✕ ${esc(err.message)}</span>`;
  } finally { clearInterval(timer); btn.disabled = false; }
}

/* ---------------------------------------------------------------- zip */
async function downloadZip() {
  if (!state.spec.brand.name.trim()) { toast('Add a name in step 1 first.'); step = 'brand'; renderStep(); return; }
  const r = await renderSite({ spec: state.spec, copy: state.copy, runtimeJs: await runtime() });
  const blob = makeZip(r.files);
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${(state.spec.brand.name || 'website').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-site.zip` });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('ZIP downloaded: upload it to Cloudflare Pages.');
}

/* ---------------------------------------------------------------- projects */
function renderProjects() {
  const list = Object.entries(projects).sort((a, b) => b[1].updated - a[1].updated);
  $('#projectList').innerHTML = list.map(([id, p]) => `<div class="zproj" role="button" tabindex="0" data-open-project="${id}" aria-current="${id === currentId}"><b>${esc(p.spec.meta?.projectName || p.spec.brand?.name || 'Untitled')}</b><small>${new Date(p.updated).toLocaleString()}</small><button class="del" type="button" data-del-project="${id}" aria-label="Delete">✕</button></div>`).join('') || '<p class="zhint">No projects yet.</p>';
}
$('#btnProjects').addEventListener('click', () => { renderProjects(); $('#projects').showModal(); });
$('#projectList').addEventListener('click', e => {
  const del = e.target.closest('[data-del-project]');
  if (del) { e.stopPropagation(); if (!confirm('Delete this project?')) return; delete projects[del.dataset.delProject]; store.set(LS.projects, projects); if (del.dataset.delProject === currentId) { const ids = Object.keys(projects); ids.length ? openProject(ids[0]) : createProject(blankSpec()); } renderProjects(); return; }
  const o = e.target.closest('[data-open-project]'); if (o) { openProject(o.dataset.openProject); $('#projects').close(); }
});
$('#btnNew').addEventListener('click', () => { createProject(blankSpec()); step = 'brand'; renderStep(); $('#projects').close(); });
$('#btnSample').addEventListener('click', () => { createProject(JSON.parse(JSON.stringify(SAMPLE))); $('#projects').close(); toast('Sample project loaded.'); });
$('#btnDuplicate').addEventListener('click', () => { const s = JSON.parse(JSON.stringify(state.spec)); s.meta.projectName += ' (copy)'; createProject(s, state.copy); $('#projects').close(); });
$('#btnExport').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ zarvis: 1, spec: state.spec, copy: state.copy }, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${state.spec.meta.projectName || 'project'}.zarvis.json` });
  document.body.appendChild(a); a.click(); a.remove();
});
async function importFile(file) {
  try {
    const j = JSON.parse(await file.text());
    if (!j.spec) throw new Error('Not a Zarvis project file.');
    createProject(j.spec, j.copy || null); $('#projects').close(); toast('Project imported.');
  } catch (err) { toast(err.message); }
}
$('#btnSettings').addEventListener('click', () => openSettings());
$('#btnDownload').addEventListener('click', downloadZip);
$('#btnRefresh').addEventListener('click', () => renderPreview());

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

/* ---------------------------------------------------------------- boot */
if (currentId && projects[currentId]) openProject(currentId);
else if (Object.keys(projects).length) openProject(Object.keys(projects)[0]);
else createProject(JSON.parse(JSON.stringify(SAMPLE)));
loadStatus();
