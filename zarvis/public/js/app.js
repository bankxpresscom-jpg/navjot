/* =============================================================================
   Zarvis studio v2
   Home (new project / templates / projects) → Editor (blocks, design, brand,
   features, publish) with live preview, drag-and-drop, AI commands and export.
   ========================================================================== */
import { renderSite, contentWarnings, validPalette, esc, isVideoUrl } from './engine.js';
import { BLOCKS, BLOCK_GROUPS, ICONS, makeBlock, normalizeBlock, uid } from './blocks.js';
import { STYLES, STYLE_IDS, OPTIONS, resolveDesign } from './styles.js';
import { FONTS, FONT_NAMES, PAIRS } from './fonts.js';
import { TEMPLATES, TEMPLATE_IDS, templateBlocks } from './templates.js';
import { SPRITE } from './sprite.js';
import { makeZip } from './zip.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clone = o => JSON.parse(JSON.stringify(o));
const ic = (id, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const rnd = a => a[Math.floor(Math.random() * a.length)];
const lines = v => String(v || '').split(/\s*\n\s*/).map(x => x.trim()).filter(Boolean);
$('#sprite').outerHTML = SPRITE;

/* ================================================================ providers */
const PROVIDERS = {
  anthropic: { label: 'Claude (Anthropic)', models: ['claude-opus-5', 'claude-sonnet-5', 'claude-haiku-4-5', 'claude-opus-5-5', 'claude-fable-5-1'], def: 'claude-opus-5' },
  openai:    { label: 'OpenAI', models: ['gpt-5', 'gpt-5-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini'], def: 'gpt-4.1-mini' },
  gemini:    { label: 'Google Gemini', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'], def: 'gemini-2.5-flash' },
  groq:      { label: 'Groq', models: ['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'], def: 'llama-3.3-70b-versatile' }
};

/* ================================================================ storage */
const LS = { projects: 'zarvis2-projects', current: 'zarvis2-current', settings: 'zarvis2-settings' };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { toast('Browser storage is full or blocked. Export your project to keep it.'); return false; } }
};
let projects = store.get(LS.projects, {});
let P = null;                // current project
let settings = store.get(LS.settings, { provider: 'anthropic', model: PROVIDERS.anthropic.def, effort: '' });
let status = { providers: {}, images: '', passwordRequired: false, offline: true };

function toast(msg, ms = 3200) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms); }
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); let a = o; ks.slice(0, -1).forEach(k => { if (a[k] == null || typeof a[k] !== 'object') a[k] = {}; a = a[k]; }); a[ks[ks.length - 1]] = v; };

/* ================================================================ api */
const pw = () => { try { return sessionStorage.getItem('zarvis-pw') || ''; } catch { return ''; } };
async function api(path, opts = {}) {
  const res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', 'x-zarvis-key': pw(), ...(opts.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && data.passwordRequired) { status.passwordRequired = true; openSettings(true); throw new Error('Enter the Zarvis password in Settings.'); }
  if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
async function loadStatus() {
  try { status = { ...(await api('/api/status')), offline: false }; }
  catch { status = { providers: {}, images: '', passwordRequired: status.passwordRequired, offline: true }; }
  updateChips();
}
const aiReady = () => !!status.providers?.[settings.provider];
function updateChips() {
  const txt = status.offline ? (status.passwordRequired ? 'AI: password needed' : 'AI: offline') : `AI: ${PROVIDERS[settings.provider].label.split(' ')[0]} · ${settings.model}${aiReady() ? '' : ' · no key'}`;
  $$('#aiChip, #aiChip2').forEach(c => { c.textContent = txt; c.className = 'zchip' + (aiReady() ? ' ok' : ' warn') + (c.id === 'aiChip2' ? ' hide-md' : ''); });
  const hint = $('#buildHint');
  if (hint) hint.textContent = aiReady() ? '' : 'AI is not set up yet (add an API key in Cloudflare). “Build” will start from the matching template instead.';
  const sh = $('#stockHint'); if (sh) sh.textContent = status.images ? `Uses ${status.images === 'pexels' ? 'Pexels' : 'Unsplash'} photos, credited in the footer.` : 'Needs a PEXELS_API_KEY or UNSPLASH_ACCESS_KEY on the server. Without one, Zarvis uses designed artwork.';
}
function openSettings(needPw = false) {
  const d = $('#settings'), sp = $('#setProvider');
  sp.innerHTML = Object.entries(PROVIDERS).map(([k, p]) => `<option value="${k}">${p.label}${status.providers?.[k] ? ' ✓ key set' : ' (no key)'}</option>`).join('');
  sp.value = settings.provider;
  const fill = () => { $('#modelList').innerHTML = PROVIDERS[sp.value].models.map(m => `<option value="${m}">`).join(''); $('#keyStatus').textContent = status.providers?.[sp.value] ? 'API key is configured on the server.' : `No key found. Add ${{ anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY' }[sp.value]} in Cloudflare → Pages → Settings → Variables and Secrets.`; };
  sp.onchange = () => { fill(); $('#setModel').value = PROVIDERS[sp.value].def; };
  fill();
  $('#setModel').value = settings.model; $('#setEffort').value = settings.effort || '';
  $('#pwField').hidden = !(status.passwordRequired || needPw);
  $('#imgStatus').textContent = status.images ? `Stock photos: ${status.images} is connected.` : 'Stock photos: not connected (optional PEXELS_API_KEY or UNSPLASH_ACCESS_KEY secret).';
  if (!d.open) d.showModal();
  d.onclose = () => {
    settings = { provider: sp.value, model: $('#setModel').value.trim() || PROVIDERS[sp.value].def, effort: $('#setEffort').value };
    store.set(LS.settings, settings);
    const p = $('#setPassword').value; if (p) { try { sessionStorage.setItem('zarvis-pw', p); } catch { /* ignore */ } }
    loadStatus();
  };
}

/* ================================================================ projects */
function newProject({ name = 'New website', description = '', kind = '', style = 'studio', template = 'blank', details = {} } = {}) {
  const st = STYLES[style] ? style : 'studio';
  const p = {
    v: 2, id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, created: Date.now(), updated: Date.now(),
    brief: { description, kind, language: details.language || 'en', facts: details.facts || '' },
    brand: { name, tagline: '', logo: details.logo || '', email: details.email || '', phone: details.phone || '', whatsapp: details.whatsapp || '', address: details.address || '', mapUrl: '', bookingUrl: '', social: details.social || {} },
    design: { style: st, paletteId: TEMPLATES[template]?.paletteId && TEMPLATES[template].style === st ? TEMPLATES[template].paletteId : '', colors: {}, fonts: {} },
    blocks: templateBlocks(template, st),
    features: { smooth: true, progress: true, backToTop: true, whatsappBubble: true, share: false, cookie: false, ga4: '', plausible: '', chatProvider: 'none', chatId: '', formEndpoint: '', announcement: '' },
    seo: { domain: '', title: '', description: '', ogImage: '' },
    footer: { credit: '' }, chrome: { cta: 'Contact' },
    media: { images: details.images || [] }, credits: []
  };
  autoFillImages(p);
  return p;
}
function saveProject() { if (!P) return; P.updated = Date.now(); projects[P.id] = P; store.set(LS.projects, projects); store.set(LS.current, P.id); }
const saveSoon = debounce(saveProject, 400);

/** place the user's own images into empty slots: hero, about, then work/products, then gallery */
function autoFillImages(p) {
  const pool = (p.media?.images || []).filter(u => !JSON.stringify(p.blocks).includes(JSON.stringify(u)));
  if (!pool.length) return;
  const take = () => pool.shift();
  const byType = t => p.blocks.filter(b => b.type === t);
  byType('hero').forEach(b => { if (!b.image && pool.length) b.image = take(); });
  byType('about').forEach(b => { if (!b.image && pool.length) b.image = take(); });
  ['work', 'products'].forEach(t => byType(t).forEach(b => b.items.forEach(it => { if (!it.image && pool.length) it.image = take(); })));
  const g = byType('gallery')[0];
  if (g && pool.length) g.images = [...g.images, ...pool.splice(0)];
}

/* ================================================================ history */
const H = { stack: [], at: -1, lock: false };
function snapshot() { if (H.lock || !P) return; const s = JSON.stringify(P); if (H.stack[H.at] === s) return; H.stack = H.stack.slice(0, H.at + 1); H.stack.push(s); if (H.stack.length > 80) H.stack.shift(); H.at = H.stack.length - 1; }
const snapSoon = debounce(snapshot, 500);
function undo(dir) {
  const n = H.at + dir; if (n < 0 || n >= H.stack.length) { toast(dir < 0 ? 'Nothing to undo' : 'Nothing to redo', 1200); return; }
  H.at = n; H.lock = true; P = JSON.parse(H.stack[n]); H.lock = false;
  if (sel && !P.blocks.find(b => b.id === sel)) sel = null;
  saveProject(); renderPane(); schedulePreview(0);
}
function changed({ pane = false, preview = true } = {}) { saveSoon(); snapSoon(); if (pane) renderPane(); if (preview) schedulePreview(); }

/* ================================================================ HOME */
const KINDS = [['personal', 'Personal brand'], ['restaurant', 'Restaurant'], ['agency', 'Agency / studio'], ['saas', 'SaaS / app'], ['photographer', 'Photographer'], ['event', 'Event'], ['shop', 'Shop / product'], ['architect', 'Architecture / property'], ['writer', 'Writer / magazine'], ['cafe', 'Café / bar / music'], ['wellness', 'Wellness / clinic'], ['nonprofit', 'Nonprofit'], ['other', 'Something else']];
const home = { kind: '', style: 'auto' };
function styleCard(id, pressed, attr = 'data-style') {
  const st = STYLES[id], p = Object.values(st.palettes)[0];
  return `<button type="button" class="stc" ${attr}="${id}" aria-pressed="${pressed}" title="${esc(st.desc)}"><span class="sw" style="background:${p.bg}"><span class="aa" style="color:${p.text};font-family:'${st.fonts.display}',serif;${st.displayCase === 'uppercase' ? 'text-transform:uppercase;' : ''}">Aa</span><span class="dots"><i style="background:${p.accent}"></i><i style="background:${p.accent2}"></i><i style="background:${p.dark}"></i></span></span><span class="tx"><b>${esc(st.name)}</b><small>${esc(st.tag)}</small></span></button>`;
}
function renderHome() {
  $('#kinds').innerHTML = KINDS.map(([k, l]) => `<button type="button" class="kind" data-kind="${k}" aria-pressed="${home.kind === k}">${ic(TEMPLATES[k]?.icon || 'sparkles')}${esc(l)}</button>`).join('');
  $('#stylePick').innerHTML = `<button type="button" class="stc ai" data-style="auto" aria-pressed="${home.style === 'auto'}"><span class="sw"><span>✦</span></span><span class="tx"><b>Let AI decide</b><small>Picks the best fit for your brief</small></span></button>` + STYLE_IDS.map(id => styleCard(id, home.style === id)).join('');
  renderProjects();
  renderTemplates();
  updateChips();
}
function renderProjects() {
  const list = Object.values(projects).sort((a, b) => b.updated - a.updated);
  $('#projGrid').innerHTML = list.length ? list.map(p => { const d = resolveDesign(p.design); const c = d.palette; return `<div class="proj"><span class="sw"><i style="background:${c.bg}"></i><i style="background:${c.accent}"></i><i style="background:${c.accent2}"></i><i style="background:${c.dark}"></i></span><b>${esc(p.name)}</b><small>${esc(STYLES[d.style].name)} · ${p.blocks.length} blocks · ${new Date(p.updated).toLocaleDateString()}</small><div class="acts"><button class="zbtn sm primary" type="button" data-open="${p.id}">Open</button><button class="zbtn sm" type="button" data-dup="${p.id}">Duplicate</button><button class="zbtn sm" type="button" data-export="${p.id}">Export</button><button class="zbtn sm ghost danger" type="button" data-del="${p.id}" aria-label="Delete ${esc(p.name)}">${ic('x')}</button></div></div>`; }).join('') : '<p class="empty">No projects yet. Describe one above, or start from a template below.</p>';
}
let tplIO = null;
function renderTemplates() {
  $('#tplGrid').innerHTML = TEMPLATE_IDS.map(id => { const t = TEMPLATES[id]; return `<button type="button" class="tpl" data-tpl="${id}"><span class="tpl-thumb" data-thumb="${id}"></span><span class="tx"><b>${esc(t.name)}</b><small>${esc(STYLES[t.style].name)} · ${esc(t.desc)}</small></span></button>`; }).join('');
  tplIO?.disconnect();
  tplIO = new IntersectionObserver(es => es.forEach(async e => {
    if (!e.isIntersecting) return; tplIO.unobserve(e.target);
    const id = e.target.dataset.thumb, t = TEMPLATES[id];
    const p = newProject({ name: t.name === 'Blank' ? 'Your Brand' : 'Aurelia', template: id, style: t.style });
    p.design.motionLevel = 'none'; p.design.splash = 'none'; p.design.cursor = 'none'; p.features = {};
    const r = await renderSite(p, { runtimeJs: '' });
    const f = document.createElement('iframe'); f.setAttribute('sandbox', ''); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1; f.loading = 'lazy'; f.srcdoc = r.previewHtml.replace(/<script(?![^>]*application\/(?:ld\+)?json)[^>]*>[\s\S]*?<\/script>/g, '').replace('media="print"', 'media="all"'); e.target.appendChild(f);
  }), { rootMargin: '200px' });
  $$('[data-thumb]').forEach(el => tplIO.observe(el));
}
function readNewForm() {
  const links = String($('#nLinks').value || '').split(/\s+/).filter(u => /^https?:\/\//.test(u));
  const social = {};
  const ig = $('#nIg').value.trim(); if (ig) social.instagram = /^https?:/.test(ig) ? ig : `https://instagram.com/${ig.replace(/^@/, '')}`;
  links.forEach(u => { const k = /linkedin/.test(u) ? 'linkedin' : /facebook/.test(u) ? 'facebook' : /youtu/.test(u) ? 'youtube' : /tiktok/.test(u) ? 'tiktok' : /(twitter|x)\.com/.test(u) ? 'x' : /threads/.test(u) ? 'threads' : /pinterest/.test(u) ? 'pinterest' : /behance/.test(u) ? 'behance' : /dribbble/.test(u) ? 'dribbble' : /github/.test(u) ? 'github' : 'website'; if (!social[k]) social[k] = u; });
  return {
    name: $('#nName').value.trim(), description: $('#nDesc').value.trim(),
    kind: home.kind, style: home.style,
    details: { email: $('#nEmail').value.trim(), whatsapp: $('#nWa').value.trim(), phone: $('#nPhone').value.trim(), address: $('#nAddr').value.trim(), logo: $('#nLogo').value.trim(), language: $('#nLang').value.trim() || 'en', facts: $('#nFacts').value.trim(), images: lines($('#nImages').value).filter(u => /^https?:\/\//.test(u)), social },
    stock: $('#nStock').checked
  };
}
function templateFor(kind) { return TEMPLATES[kind] ? kind : 'blank'; }
function pickStyle(f) { return f.style !== 'auto' ? f.style : TEMPLATES[templateFor(f.kind)].style; }

async function createFromHome(mode) {
  const f = readNewForm();
  if (!f.name) { $('#nName').focus(); toast('Give your project a name first.'); return; }
  if (mode === 'ai' && !aiReady()) { toast('AI is not configured, so starting from the matching template.'); mode = 'template'; }
  const tpl = mode === 'blank' ? 'blank' : templateFor(f.kind);
  const p = newProject({ name: f.name, description: f.description, kind: KINDS.find(k => k[0] === f.kind)?.[1] || '', style: pickStyle(f), template: tpl, details: f.details });
  if (f.description && p.blocks[0]?.type === 'hero' && mode !== 'ai') { /* keep template copy; the description feeds AI later */ }
  if (mode !== 'ai') { projects[p.id] = p; openProject(p.id); if (f.stock && status.images) fillStock(p, { onlyEmpty: true }); return; }
  // AI build
  const log = $('#buildLog'), btn = $('#btnBuild'); log.hidden = false; btn.disabled = true;
  const t0 = Date.now(); const tick = setInterval(() => { log.innerHTML = `✦ Designing <b>${esc(f.name)}</b> with ${esc(PROVIDERS[settings.provider].label)} · ${esc(settings.model)}… ${Math.round((Date.now() - t0) / 1000)}s\n<span class="zhint">Planning the structure, writing the copy, choosing fonts, colours and motion.</span>`; }, 500);
  try {
    const r = await api('/api/generate', { method: 'POST', body: JSON.stringify({ mode: 'site', provider: settings.provider, model: settings.model, effort: settings.effort || undefined, input: siteInput(p, f.style === 'auto' ? 'auto' : p.design.style) }) });
    clearInterval(tick);
    applySite(p, r.site, { mode: 'site' });
    autoFillImages(p);
    projects[p.id] = p;
    log.innerHTML = `<span class="ok">✓ Done in ${Math.round((Date.now() - t0) / 1000)}s</span> · ${esc(r.model)}${r.usage ? ` · ${r.usage.input ?? '?'} in / ${r.usage.output ?? '?'} out tokens` : ''}${r.site?.notes ? `\n${esc(r.site.notes)}` : ''}`;
    openProject(p.id);
    if (f.stock && status.images) fillStock(p, { onlyEmpty: true });
  } catch (err) {
    clearInterval(tick);
    log.innerHTML = `<span class="err">✕ ${esc(err.message)}</span>\nYou can still start from the template or a blank project.`;
  } finally { btn.disabled = false; }
}

/* ================================================================ AI mapping */
function compactProject(p) {
  return {
    name: p.name, brand: { name: p.brand.name, tagline: p.brand.tagline, hasEmail: !!p.brand.email, hasWhatsApp: !!p.brand.whatsapp, hasPhone: !!p.brand.phone, address: p.brand.address },
    brief: p.brief, design: { style: p.design.style, palette: resolveDesign(p.design).palette, fonts: resolveDesign(p.design).fonts, heroText: resolveDesign(p.design).heroText },
    images: p.media?.images || [],
    blocks: p.blocks.map(b => ({ id: b.id, type: b.type, variant: b.variant, tone: b.tone, menuLabel: b.menu.label, showInMenu: b.menu.show, hidden: b.hidden, eyebrow: b.eyebrow, title: b.title, titleEm: b.titleEm, text: b.text, image: b.image, buttons: b.buttons, items: b.items.map(({ title, text, meta, value, icon, tag, link, image }) => ({ title, text, meta, value, icon, tag, link, image })) }))
  };
}
function siteInput(p, style) {
  return { name: p.name, description: p.brief.description, kind: p.brief.kind, style, language: p.brief.language, facts: p.brief.facts,
    contact: { email: !!p.brand.email, whatsapp: !!p.brand.whatsapp, phone: !!p.brand.phone, address: p.brand.address || '' },
    social: Object.keys(p.brand.social || {}).filter(k => p.brand.social[k]), images: p.media?.images || [], seed: Math.floor(Math.random() * 1e6) };
}
/** apply AI site JSON (site/edit mode) onto a project */
function applySite(p, s, { mode = 'site' } = {}) {
  if (!s || typeof s !== 'object') throw new Error('The AI returned an empty design.');
  const st = STYLES[s.style] ? s.style : p.design.style;
  if (st !== p.design.style) { p.design.style = st; p.design.paletteId = ''; }
  if (validPalette(s.palette)) p.design.colors = Object.fromEntries(['bg', 'surface', 'text', 'accent', 'accent2', 'dark', 'darkText'].map(k => [k, s.palette[k]]));
  else if (mode === 'site') p.design.colors = {};
  if (s.fonts) {
    p.design.fonts = p.design.fonts || {};
    if (FONT_NAMES.includes(s.fonts.display)) p.design.fonts.display = s.fonts.display;
    if (FONT_NAMES.includes(s.fonts.body)) { p.design.fonts.body = s.fonts.body; p.design.fonts.label = ''; }
    if (s.fonts.display && s.fonts.display !== STYLES[st].fonts.display) p.design.fonts.em = '';
  }
  if (OPTIONS.heroText[s.heroText]) p.design.heroText = s.heroText;
  if (s.tagline) p.brand.tagline = s.tagline;
  if (s.seoTitle && (mode === 'site' || !p.seo.title)) p.seo.title = s.seoTitle;
  if (s.seoDescription && (mode === 'site' || !p.seo.description)) p.seo.description = s.seoDescription;
  if (Array.isArray(s.blocks) && s.blocks.length) {
    const old = new Map(p.blocks.map(b => [b.id, b]));
    const allowed = new Set([...(p.media?.images || []), ...JSON.stringify(p.blocks).match(/https?:\/\/[^"\\\s]+/g) || []]);
    const okImg = u => (u && allowed.has(u) ? u : '');
    p.blocks = s.blocks.filter(b => BLOCKS[b.type]).map(b => {
      const prev = old.get(b.id);
      const variant = BLOCKS[b.type].variants[b.variant] ? b.variant : STYLES[st].variants[b.type];
      const items = (b.items || []).map((it, i) => ({ ...it, image: okImg(it.image) || (prev && prev.type === b.type ? prev.items[i]?.image || '' : ''), q: it.imageQuery || '' }));
      return normalizeBlock({
        id: prev ? b.id : uid(), type: b.type, variant, tone: b.tone || 'auto', hidden: !!b.hidden,
        menu: { show: b.showInMenu !== undefined ? !!b.showInMenu : !!BLOCKS[b.type].menu, label: b.menuLabel || (prev && prev.menu.label) || '' },
        eyebrow: b.eyebrow, title: b.title, titleEm: b.titleEm, text: b.text,
        image: okImg(b.image) || (prev && prev.type === b.type ? prev.image : ''), video: prev?.video || '', images: prev && prev.type === b.type ? prev.images : [],
        buttons: b.buttons, items, q: b.imageQuery || ''
      });
    });
  }
}

/* ================================================================ stock photos */
async function searchPhotos(q, n = 12) { const r = await api(`/api/images?q=${encodeURIComponent(q)}&n=${n}`); return r.photos || []; }
async function fillStock(p, { onlyEmpty = true } = {}) {
  if (!status.images) return;
  const used = new Set(JSON.stringify(p.blocks).match(/https?:\/\/[^"\\\s]+/g) || []);
  const base = [p.brief.kind, p.brief.description].filter(Boolean).join(' ').slice(0, 80) || p.name;
  const slots = [];
  p.blocks.forEach(b => {
    if (['hero', 'about', 'cta', 'video'].includes(b.type) && (!b.image || !onlyEmpty) && !(b.type === 'cta' && b.variant !== 'banner')) slots.push({ b, q: b.q || `${b.title} ${b.titleEm}`.trim() || base, set: u => { b.image = u; } });
    if (['work', 'products', 'features'].includes(b.type) && !(b.type === 'features' && b.variant !== 'bento')) b.items.forEach(it => { if (!it.image || !onlyEmpty) slots.push({ b, q: it.q || `${it.title} ${base}`.slice(0, 80), set: u => { it.image = u; } }); });
    if (b.type === 'gallery' && (!b.images.length || !onlyEmpty)) slots.push({ b, q: b.q || base, multi: 8, set: us => { b.images = us; } });
  });
  if (!slots.length) return;
  showBusy(`Finding photos (0/${slots.length})…`);
  const credits = new Set(p.credits || []);
  let done = 0;
  for (const s of slots.slice(0, 16)) {
    try {
      const photos = (await searchPhotos(s.q.replace(/\[[^\]]*\]/g, '').trim() || base, s.multi || 6)).filter(ph => !used.has(ph.src));
      if (s.multi) { const pick = photos.slice(0, s.multi); pick.forEach(ph => { used.add(ph.src); credits.add(ph.credit); }); if (pick.length) s.set(pick.map(ph => ph.src)); }
      else if (photos[0]) { used.add(photos[0].src); credits.add(photos[0].credit); s.set(photos[0].src); }
    } catch (e) { /* skip this slot */ }
    showBusy(`Finding photos (${++done}/${slots.length})…`);
  }
  p.credits = [...credits].filter(Boolean);
  hideBusy();
  if (P && P.id === p.id) { changed({ pane: true }); toast('Stock photos added. Replace them with your own any time.'); } else { projects[p.id] = p; store.set(LS.projects, projects); }
}
let photoTarget = null;
function openPhotoPicker(target, q) {
  if (!status.images) { toast('Connect Pexels or Unsplash on the server to search photos (see README).'); return; }
  photoTarget = target; $('#photoQ').value = q || ''; $('#photoGrid').innerHTML = ''; $('#photoNote').textContent = '';
  $('#photoDlg').showModal(); if (q) runPhotoSearch();
}
async function runPhotoSearch() {
  const q = $('#photoQ').value.trim(); if (!q) return;
  $('#photoNote').textContent = 'Searching…';
  try {
    const photos = await searchPhotos(q, 18);
    $('#photoGrid').innerHTML = photos.map((ph, i) => `<button type="button" data-ph="${i}" title="${esc(ph.alt || '')} · ${esc(ph.credit)}"><img src="${esc(ph.thumb)}" alt="${esc(ph.alt || '')}" loading="lazy"></button>`).join('');
    $('#photoGrid').__photos = photos;
    $('#photoNote').textContent = photos.length ? `Photos from ${status.images}. The photographer is credited in the footer.` : 'No results.';
  } catch (e) { $('#photoNote').textContent = e.message; }
}

/* ================================================================ EDITOR */
let tab = 'blocks', sel = null, libOpen = false, device = 'desktop';
const TABS = [['blocks', 'Blocks', 'layers'], ['design', 'Design', 'palette'], ['brand', 'Brand', 'user'], ['features', 'Features', 'zap'], ['publish', 'Publish', 'rocket']];
function openProject(id) {
  P = projects[id]; if (!P) return;
  migrate(P);
  store.set(LS.current, id);
  H.stack = []; H.at = -1; snapshot();
  sel = null; tab = 'blocks'; libOpen = false;
  $('#home').hidden = true; $('#editor').hidden = false; window.scrollTo(0, 0);
  if (innerWidth < 860 && device === 'desktop') { device = 'mobile'; $$('[data-device]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.device === device))); }
  $('#projectName').value = P.name;
  $('#tabs').innerHTML = TABS.map(([k, l, i]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${tab === k}">${ic(i)}${l}</button>`).join('');
  $('#cmdSugg').innerHTML = ['More luxurious', 'Bolder & more playful', 'Shorter copy', 'Add FAQ', 'Add pricing', 'Dark mode'].map(s => `<button type="button" class="zchip" data-sugg="${esc(s)}">${esc(s)}</button>`).join('');
  renderPane(); updateChips(); lastY = 0; schedulePreview(0);
  requestAnimationFrame(fitFrame);
  saveProject();
}
function goHome() { $('#editor').hidden = true; $('#home').hidden = false; renderHome(); window.scrollTo(0, 0); }
function migrate(p) {
  p.blocks = (p.blocks || []).map(normalizeBlock);
  p.design = p.design || { style: 'studio' }; p.design.fonts = p.design.fonts || {}; p.design.colors = p.design.colors || {};
  p.brand = p.brand || {}; p.brand.social = p.brand.social || {};
  p.features = p.features || {}; p.seo = p.seo || {}; p.footer = p.footer || {}; p.chrome = p.chrome || {}; p.media = p.media || { images: [] }; p.brief = p.brief || {};
}

/* ---------- form helpers (data-bind = project path) ---------- */
const F = {
  text: (bind, label, o = {}) => `<label class="zf"><span>${label}</span><input ${o.type ? `type="${o.type}"` : ''} data-bind="${bind}" value="${esc(getPath(P, bind) ?? '')}" placeholder="${esc(o.ph || '')}"${o.list ? ` list="${o.list}"` : ''}>${o.hint ? `<small>${o.hint}</small>` : ''}</label>`,
  area: (bind, label, o = {}) => `<label class="zf"><span>${label}</span><textarea data-bind="${bind}" placeholder="${esc(o.ph || '')}"${o.code ? ' class="code" spellcheck="false"' : ''}>${esc(getPath(P, bind) ?? '')}</textarea>${o.hint ? `<small>${o.hint}</small>` : ''}</label>`,
  select: (bind, label, opts, o = {}) => { const v = getPath(P, bind) ?? ''; return `<label class="zf"><span>${label}</span><select data-bind="${bind}">${o.def !== undefined ? `<option value="">${esc(o.def)}</option>` : ''}${Object.entries(opts).map(([k, l]) => `<option value="${esc(k)}"${String(v) === k ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${o.hint ? `<small>${o.hint}</small>` : ''}</label>`; },
  toggle: (bind, label, hint = '') => `<label class="tgl"><input type="checkbox" data-bind="${bind}"${getPath(P, bind) ? ' checked' : ''}><span><b>${label}</b>${hint ? `<small>${hint}</small>` : ''}</span></label>`,
  tri: (bind, label, def) => { const v = getPath(P, bind); const cur = v === true ? '1' : v === false ? '0' : ''; return `<label class="zf"><span>${label}</span><select data-bind="${bind}"><option value="">Style default (${def ? 'on' : 'off'})</option><option value="1"${cur === '1' ? ' selected' : ''}>On</option><option value="0"${cur === '0' ? ' selected' : ''}>Off</option></select></label>`; },
  range: (bind, label, min, max, step, def) => { const v = getPath(P, bind); return `<label class="zf"><span>${label} <output>${v === '' || v == null ? 'default' : v}</output></span><input type="range" data-bind="${bind}" data-num min="${min}" max="${max}" step="${step}" value="${v === '' || v == null ? def : v}"></label>`; }
};

function renderPane() {
  if (!P) return;
  $$('#tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  const pane = $('#pane'); const view = tab + ':' + (tab === 'blocks' ? sel || '' : ''); const top = view === renderPane.view ? pane.scrollTop : 0; renderPane.view = view;
  pane.innerHTML = tab === 'blocks' ? (sel && P.blocks.find(b => b.id === sel) ? inspector() : outline()) : tab === 'design' ? designPane() : tab === 'brand' ? brandPane() : tab === 'features' ? featuresPane() : publishPane();
  pane.scrollTop = top;
}

/* ---------- blocks: outline ---------- */
function blockSummary(b) { const t = [b.title, b.titleEm].filter(Boolean).join(' ') || b.eyebrow || (b.items[0]?.title) || ''; return `${BLOCKS[b.type].variants[b.variant]}${t ? ' · ' + t : ''}`; }
function outline() {
  const menu = P.blocks.filter(b => b.menu.show && !b.hidden && b.type !== 'hero');
  return `<h3>Page blocks <span class="zhint">drag ⋮⋮ to reorder</span></h3>
  <ol class="outline" id="outline">${P.blocks.map(b => `<li class="ob${b.hidden ? ' is-hidden' : ''}${b.id === sel ? ' sel' : ''}" data-id="${b.id}">
    <span class="drag" title="Drag to reorder" aria-hidden="true">⋮⋮</span>
    <span class="ob-ic">${ic(BLOCKS[b.type].icon)}</span>
    <button type="button" class="ob-main" data-act="select"><b>${esc(b.menu.show && b.type !== 'hero' ? b.menu.label : BLOCKS[b.type].label)}</b><small>${esc(blockSummary(b))}</small></button>
    ${b.type !== 'hero' ? `<button type="button" class="tg ob-menu" data-act="menu" aria-pressed="${b.menu.show}" title="${b.menu.show ? 'In the menu' : 'Not in the menu'}">${b.menu.show ? 'Menu' : '—'}</button>` : ''}
    <button type="button" class="tg" data-act="hide" aria-pressed="${!b.hidden}" title="${b.hidden ? 'Hidden' : 'Visible'}">${ic(b.hidden ? 'x' : 'eye')}</button>
  </li>`).join('')}</ol>
  <button type="button" class="zbtn add-block" data-act="lib" aria-expanded="${libOpen}">${ic('plus')} Add block</button>
  ${libOpen ? library() : ''}
  <div class="menu-preview"><span class="zlbl">Menu (built automatically from blocks marked “Menu”)</span><ol>${menu.map(b => `<li>${esc(b.menu.label)}</li>`).join('') || '<li>Nothing yet</li>'}</ol></div>`;
}
function library() {
  return `<div class="lib" id="lib">${BLOCK_GROUPS.map(g => `<h4>${esc(g)}</h4><div class="lib-grid">${Object.entries(BLOCKS).filter(([, d]) => d.group === g).map(([k, d]) => `<button type="button" class="lt" data-add="${k}" title="${esc(d.desc)}">${ic(d.icon)}<b>${esc(d.label)}</b></button>`).join('')}</div>`).join('')}<p class="zhint" style="margin:10px 0 0">Click to add below the selected block, or drag into the list.</p></div>`;
}
function addBlock(type, index) {
  const b = makeBlock(type, { variant: STYLES[P.design.style].variants[type] });
  if (index == null) { const i = sel ? P.blocks.findIndex(x => x.id === sel) : -1; index = i >= 0 ? i + 1 : (P.blocks[P.blocks.length - 1]?.type === 'contact' ? P.blocks.length - 1 : P.blocks.length); }
  P.blocks.splice(index, 0, b);
  sel = b.id; changed({ pane: true });
  setTimeout(() => postToPreview({ zarvis: 'scrollTo', id: b.id }), 900);
  toast(`${BLOCKS[type].label} added${BLOCKS[type].menu ? ' and linked in the menu' : ''}.`);
}

/* ---------- drag and drop (pointer based: mouse, touch, pen) ---------- */
function startDrag(e, { kind, id, type }) {
  const list = $('#outline'); if (!list) return;
  e.preventDefault();
  const src = kind === 'move' ? list.querySelector(`[data-id="${id}"]`) : e.target.closest('.lt');
  const r = src.getBoundingClientRect();
  const ghost = src.cloneNode(true); ghost.classList.add('dnd-ghost'); ghost.style.width = r.width + 'px'; ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px'; document.body.appendChild(ghost);
  const ph = document.createElement('li'); ph.className = 'placeholder';
  const dx = e.clientX - r.left, dy = e.clientY - r.top;
  let moved = false, over = kind === 'move';
  if (kind === 'move') { src.after(ph); src.style.display = 'none'; }
  const move = ev => {
    moved = true;
    ghost.style.left = ev.clientX - dx + 'px'; ghost.style.top = ev.clientY - dy + 'px';
    const lr = list.getBoundingClientRect();
    over = ev.clientX > lr.left - 40 && ev.clientX < lr.right + 40 && ev.clientY > lr.top - 40 && ev.clientY < lr.bottom + 40;
    if (!over) { if (kind === 'new') ph.remove(); return; }
    const items = $$('.ob', list).filter(li => li !== src);
    const after = items.find(li => { const b = li.getBoundingClientRect(); return ev.clientY < b.top + b.height / 2; });
    if (after) list.insertBefore(ph, after); else list.appendChild(ph);
    // auto-scroll the pane
    const pane = $('#pane'), pr = pane.getBoundingClientRect();
    if (ev.clientY < pr.top + 40) pane.scrollTop -= 12; else if (ev.clientY > pr.bottom - 40) pane.scrollTop += 12;
  };
  const up = () => {
    removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up);
    ghost.remove();
    const idx = ph.isConnected ? [...list.children].filter(li => li !== src || kind !== 'move').indexOf(ph) : -1;
    ph.remove(); if (src) src.style.display = '';
    if (kind === 'new') { if (!moved) addBlock(type); else if (over && idx >= 0) addBlock(type, idx); else renderPane(); return; }
    if (!moved) return;
    const from = P.blocks.findIndex(b => b.id === id); if (from < 0 || idx < 0) { renderPane(); return; }
    const [b] = P.blocks.splice(from, 1); P.blocks.splice(idx, 0, b);
    changed({ pane: true });
  };
  addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
}

/* ---------- blocks: inspector ---------- */
const selBlock = () => P.blocks.find(b => b.id === sel);
const ITEM_KIND = { icon: 'icon', text: 'area', image: 'image', link: 'url' };
function inspector() {
  const b = selBlock(), def = BLOCKS[b.type], f = def.fields, i = P.blocks.indexOf(b);
  const anchors = P.blocks.filter(x => x.menu.show || x.type === 'contact').map(x => '#' + (x.type === 'hero' ? 'home' : (x.menu.label || x.type).toLowerCase().replace(/[^a-z0-9]+/g, '-')));
  const bf = (k, label, kind = 'text') => {
    const v = b[k] ?? '';
    if (kind === 'area') return `<label class="zf"><span>${label}</span><textarea data-bb="${k}"${b.type === 'html' ? ' class="code" spellcheck="false"' : ''}>${esc(v)}</textarea>${k === 'text' && b.type !== 'html' ? '<small>**bold**, *italic*, [link](https://…). Blank line = new paragraph.</small>' : ''}</label>`;
    if (kind === 'image') return `<label class="zf"><span>${label}</span><span class="imgf">${v && !isVideoUrl(v) ? `<img src="${esc(v)}" alt="" onerror="this.remove()">` : ''}<input data-bb="${k}" value="${esc(v)}" placeholder="https://…"><button type="button" class="zbtn sm" data-act="photo" data-slot="${k}" title="Search stock photos">${ic('image')}</button></span></label>`;
    return `<label class="zf"><span>${label}</span><input data-bb="${k}" value="${esc(v)}"></label>`;
  };
  const itemFields = f.items ? f.items.f : {};
  return `<div class="insp-head"><button type="button" class="zbtn sm icon ghost" data-act="back" aria-label="Back to blocks">${ic('chev-l')}</button><span class="ob-ic">${ic(def.icon)}</span><b>${esc(def.label)}</b>
    <button type="button" class="zbtn sm icon ghost" data-act="up" title="Move up"${i === 0 ? ' disabled' : ''}>↑</button><button type="button" class="zbtn sm icon ghost" data-act="down" title="Move down"${i === P.blocks.length - 1 ? ' disabled' : ''}>↓</button>
    <button type="button" class="zbtn sm icon ghost" data-act="dup" title="Duplicate">${ic('copy')}</button><button type="button" class="zbtn sm icon ghost danger" data-act="del" title="Delete">${ic('x')}</button></div>
  <p class="zhint" style="margin-top:-6px">${esc(def.desc)}</p>
  <span class="zlbl">Layout</span><div class="chips">${Object.entries(def.variants).map(([k, l]) => `<button type="button" data-variant="${k}" aria-pressed="${b.variant === k}">${esc(l)}</button>`).join('')}</div>
  <div class="row2">
    <label class="zf"><span>Background</span><select data-bb="tone">${[['auto', 'Automatic'], ['light', 'Light'], ['alt', 'Tinted'], ['dark', 'Dark'], ['accent', 'Accent colour']].map(([k, l]) => `<option value="${k}"${b.tone === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    ${b.type !== 'hero' ? `<label class="zf"><span>Menu label</span><input data-bb="menu.label" value="${esc(b.menu.label)}"></label>` : '<span></span>'}
  </div>
  ${b.type !== 'hero' ? `<label class="tgl"><input type="checkbox" data-bb="menu.show"${b.menu.show ? ' checked' : ''}><span><b>Show in menu</b><small>Adds this block to the hamburger menu, the mobile bottom bar and the footer.</small></span></label>` : ''}
  ${f.eyebrow ? bf('eyebrow', f.eyebrow) : ''}
  ${f.title ? `<div class="row2">${bf('title', f.title)}${f.titleEm ? bf('titleEm', f.titleEm) : ''}</div>` : ''}
  ${f.text ? bf('text', f.text, 'area') : ''}
  ${f.image ? bf('image', f.image, 'image') : ''}
  ${f.video ? bf('video', f.video) : ''}
  ${f.images ? `<label class="zf"><span>${f.images}</span><textarea data-bb="images" placeholder="One link per line">${esc(b.images.join('\n'))}</textarea>${b.images.length ? `<span class="thumbs">${b.images.slice(0, 12).map(u => `<img src="${esc(u)}" alt="" loading="lazy" onerror="this.remove()">`).join('')}</span>` : ''}${b.type === 'gallery' ? `<button type="button" class="zbtn sm" data-act="photo" data-slot="images" style="margin-top:6px">${ic('image')} Add stock photos</button>` : ''}</label>` : ''}
  ${f.buttons ? `<span class="zlbl">${f.buttons}</span><div class="items" style="margin:6px 0 12px">${b.buttons.map((x, k) => `<div class="it"><div class="row2"><label><span>Label</span><input data-btn="${k}.label" value="${esc(x.label)}"></label><label><span>Link</span><input data-btn="${k}.href" value="${esc(x.href)}" list="anchors" placeholder="#contact, whatsapp, https://…"></label></div><div class="it-bar"><b></b><button type="button" class="del" data-act="btn-del" data-k="${k}" aria-label="Remove button">${ic('x')}</button></div></div>`).join('')}${b.buttons.length < 3 ? `<button type="button" class="zbtn sm" data-act="btn-add">${ic('plus')} Add button</button>` : ''}</div>
    <datalist id="anchors">${[...new Set(anchors)].map(a => `<option value="${esc(a)}">`).join('')}<option value="whatsapp"><option value="email"><option value="call"></datalist>` : ''}
  ${f.items ? `<span class="zlbl">${f.items.label} (${b.items.length})</span><div class="items" style="margin-top:6px">${b.items.map((it, k) => `<div class="it"><div class="it-bar"><b>${k + 1}. ${esc((it.title || it.text || '').slice(0, 40))}</b><button type="button" data-act="it-up" data-k="${k}" aria-label="Move up">↑</button><button type="button" data-act="it-down" data-k="${k}" aria-label="Move down">↓</button><button type="button" class="del" data-act="it-del" data-k="${k}" aria-label="Remove">${ic('x')}</button></div>
      ${Object.entries(itemFields).map(([fk, fl]) => { const kind = ITEM_KIND[fk] || 'text'; const v = it[fk] || '';
        if (kind === 'icon') return `<label><span>${fl}</span><select data-it="${k}.${fk}"><option value="">None</option>${ICONS.map(n => `<option${v === n ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`;
        if (kind === 'area') return `<label><span>${fl}</span><textarea data-it="${k}.${fk}">${esc(v)}</textarea></label>`;
        if (kind === 'image') return `<label><span>${fl}</span><span class="imgf">${v ? `<img src="${esc(v)}" alt="" onerror="this.remove()">` : ''}<input data-it="${k}.${fk}" value="${esc(v)}" placeholder="https://…"><button type="button" class="zbtn sm" data-act="photo" data-slot="item" data-k="${k}" title="Search stock photos">${ic('image')}</button></span></label>`;
        return `<label><span>${fl}</span><input data-it="${k}.${fk}" value="${esc(v)}"></label>`; }).join('')}</div>`).join('')}
    <button type="button" class="zbtn sm" data-act="it-add">${ic('plus')} Add ${esc(f.items.label.toLowerCase().replace(/s$/, '').replace(/ \(.*/, ''))}</button></div>` : ''}
  <div class="ai-box"><span class="zlbl">✦ Rewrite this block with AI</span><div class="row" style="margin-top:6px"><input id="blockAi" placeholder="e.g. “warmer tone”, “add 2 more items”, “make it about weddings”"><button type="button" class="zbtn sm violet" data-act="block-ai">Apply</button></div></div>`;
}

/* ---------- design pane ---------- */
function designPane() {
  const d = resolveDesign(P.design), st = STYLES[d.style];
  const fontOpts = Object.fromEntries(['serif', 'sans', 'display', 'mono', 'script'].flatMap(c => FONTS.filter(f => f.c === c).map(f => [f.n, `${f.n} · ${c}`])));
  return `<h3>Design system <span class="zhint">changes the whole look</span></h3>
  <div class="st-grid">${STYLE_IDS.map(id => styleCard(id, d.style === id, 'data-setstyle')).join('')}</div>
  <p class="zhint">${esc(st.desc)}</p>
  <h3>Colours</h3>
  <div class="pal-row">${Object.entries(st.palettes).map(([k, p]) => `<button type="button" class="pal" data-pal="${k}" aria-pressed="${d.paletteId === k && !Object.keys(P.design.colors || {}).length}"><span class="sw">${['bg', 'surface', 'accent', 'accent2', 'dark'].map(c => `<i style="background:${p[c]}"></i>`).join('')}</span>${esc(p.name)}</button>`).join('')}</div>
  <div class="colors">${[['bg', 'Background'], ['surface', 'Surface'], ['text', 'Text'], ['accent', 'Accent'], ['accent2', 'Accent 2'], ['dark', 'Dark'], ['darkText', 'Dark text']].map(([k, l]) => `<label>${l}<input type="color" data-color="${k}" value="${d.palette[k]}"></label>`).join('')}<label>&nbsp;<button type="button" class="zbtn sm" data-act="shuffle-colors" title="Random palette from this style">🎲</button></label></div>
  <h3>Typography</h3>
  ${F.select('design.fonts.display', 'Headings font', fontOpts, { def: `Style default (${st.fonts.display})` })}
  ${F.select('design.fonts.body', 'Body font', fontOpts, { def: `Style default (${st.fonts.body})` })}
  <div class="row2">${F.select('design.fonts.label', 'Labels & buttons font', fontOpts, { def: 'Same as body' })}${F.select('design.fonts.em', 'Highlight words font', fontOpts, { def: st.fonts.em ? `Style default (${st.fonts.em})` : 'Same as headings' })}</div>
  ${F.text('design.fonts.custom', 'Any other Google Font', { ph: 'e.g. Marcellus', hint: 'Type the exact Google Fonts name to use it for headings (loaded at 400 weight).' })}
  <div class="row2">${F.select('design.displayCase', 'Headings case', { none: 'Normal', uppercase: 'UPPERCASE' }, { def: 'Style default' })}${F.tri('design.emItalic', 'Italic highlights', st.emItalic)}</div>
  ${F.range('design.displayWeight', 'Headings weight', 100, 900, 100, d.displayWeight)}
  ${F.range('design.titleScale', 'Headline size', 0.7, 1.4, 0.02, d.titleScale)}
  ${F.range('design.scale', 'Body text size', 0.85, 1.25, 0.01, 1)}
  <h3>Shapes & layout</h3>
  ${F.range('design.radius', 'Corner radius', 0, 40, 1, d.radius)}
  <div class="row2">${F.select('design.heading', 'Section titles', OPTIONS.heading, { def: `Default (${OPTIONS.heading[st.d.heading]})` })}${F.select('design.buttons', 'Buttons', OPTIONS.buttons, { def: `Default (${OPTIONS.buttons[st.d.buttons]})` })}</div>
  <div class="row2">${F.select('design.cards', 'Cards', OPTIONS.cards, { def: `Default (${OPTIONS.cards[st.d.cards]})` })}${F.select('design.imageShape', 'Feature image shape', OPTIONS.imageShape, { def: `Default (${OPTIONS.imageShape[st.d.imageShape]})` })}</div>
  <div class="row2">${F.select('design.menu', 'Menu style', OPTIONS.menu, { def: `Default (${OPTIONS.menu[st.d.menu]})` })}${F.select('design.spacing', 'Spacing', OPTIONS.spacing, { def: `Default (${OPTIONS.spacing[st.d.spacing]})` })}</div>
  <div class="row2">${F.select('design.logoPos', 'Logo position', OPTIONS.logoPos, { def: `Default (${st.d.logoPos})` })}${F.tri('design.headerLinks', 'Links in header (desktop)', st.d.headerLinks)}</div>
  <button type="button" class="zbtn sm" data-act="apply-variants">Apply this style’s recommended block layouts</button>
  <h3>Motion</h3>
  ${F.select('design.motionLevel', 'Motion level', OPTIONS.motionLevel, { def: `Default (${OPTIONS.motionLevel[st.d.motionLevel]})` })}
  <div class="row2">${F.select('design.heroText', 'Hero headline effect', OPTIONS.heroText, { def: `Default (${OPTIONS.heroText[st.d.heroText]})` })}${F.select('design.headAnim', 'Section titles effect', OPTIONS.headAnim, { def: `Default (${OPTIONS.headAnim[st.d.headAnim]})` })}</div>
  <div class="row2">${F.select('design.reveal', 'Content reveal', OPTIONS.reveal, { def: `Default (${OPTIONS.reveal[st.d.reveal]})` })}${F.select('design.imgReveal', 'Image reveal', OPTIONS.imgReveal, { def: `Default (${OPTIONS.imgReveal[st.d.imgReveal]})` })}</div>
  <div class="row2">${F.select('design.cursor', 'Cursor', OPTIONS.cursor, { def: `Default (${OPTIONS.cursor[st.d.cursor]})` })}${F.select('design.splash', 'Intro splash', OPTIONS.splash, { def: `Default (${OPTIONS.splash[st.d.splash]})` })}</div>
  <div class="row2">${F.tri('design.grain', 'Film grain', st.d.grain)}${F.tri('design.spotlight', 'Card spotlight', st.d.spotlight)}</div>
  <h3>Custom CSS</h3>
  ${F.area('design.customCss', 'Your own CSS (advanced)', { code: true, ph: '.h1{letter-spacing:-.06em}', hint: 'Added after the design system CSS. Variables: --bg --text --accent --dark --fd --fb --r' })}
  <button type="button" class="zbtn sm ghost" data-act="reset-design">Reset design to style defaults</button>`;
}
function brandPane() {
  const soc = [['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['facebook', 'Facebook'], ['youtube', 'YouTube'], ['x', 'X / Twitter'], ['tiktok', 'TikTok'], ['threads', 'Threads'], ['pinterest', 'Pinterest'], ['behance', 'Behance'], ['dribbble', 'Dribbble'], ['github', 'GitHub'], ['website', 'Other website']];
  return `<h3>Identity</h3>
  ${F.text('brand.name', 'Brand / person name')}${F.text('brand.tagline', 'Tagline')}
  ${F.text('brand.logo', 'Logo image link', { ph: 'https://…', hint: 'Transparent PNG or SVG works best. Cloudinary links also become the favicon.' })}
  <h3>Contact <span class="zhint">used by contact blocks, forms and order buttons</span></h3>
  <div class="row2">${F.text('brand.email', 'Email', { type: 'email' })}${F.text('brand.whatsapp', 'WhatsApp number', { ph: '+971 50 123 4567' })}</div>
  <div class="row2">${F.text('brand.phone', 'Phone')}${F.text('brand.bookingUrl', 'Booking link', { ph: 'Calendly…' })}</div>
  ${F.text('brand.address', 'Address')}${F.text('brand.mapUrl', 'Google Maps link (optional)')}
  <h3>Social links</h3>
  <div class="row2">${soc.map(([k, l]) => F.text('brand.social.' + k, l, { ph: 'https://…' })).join('')}</div>
  <h3>Brief for the AI</h3>
  ${F.text('brief.kind', 'Kind of website')}${F.area('brief.description', 'Description')}${F.area('brief.facts', 'Facts the AI may use', { hint: 'Real numbers, prices, awards, clients, testimonials. The AI never invents these.' })}
  ${F.area('media.images', 'Your image library (one link per line)', { hint: 'The AI places these into the design.' }).replace('data-bind="media.images"', 'data-bind="media.images" data-lines')}
  ${F.text('brief.language', 'Language code', { ph: 'en' })}`;
}
function featuresPane() {
  return `<h3>Experience</h3>
  ${F.toggle('features.smooth', 'Smooth scrolling', 'Buttery inertia scroll (Lenis).')}
  ${F.toggle('features.progress', 'Scroll progress bar')}
  ${F.toggle('features.backToTop', 'Back-to-top button')}
  ${F.toggle('features.whatsappBubble', 'WhatsApp chat bubble', 'Needs a WhatsApp number in Brand.')}
  ${F.toggle('features.share', 'Share buttons', 'Native share, WhatsApp and copy link in the footer.')}
  ${F.area('features.announcement', 'Announcement bar', { ph: 'e.g. **New:** summer menu is here → [See it](#menu)' })}
  ${F.text('chrome.cta', 'Header button label', { ph: 'Contact' })}
  <h3>Forms</h3>
  ${F.text('features.formEndpoint', 'Form endpoint (optional)', { ph: 'https://formspree.io/f/…', hint: 'Without it, the contact form opens WhatsApp or email with the message filled in.' })}
  <h3>Live chat</h3>
  <div class="row2">${F.select('features.chatProvider', 'Provider', { none: 'None', tawk: 'Tawk.to', crisp: 'Crisp' })}${F.text('features.chatId', 'Property / website ID')}</div>
  <h3>Analytics & privacy</h3>
  <div class="row2">${F.text('features.ga4', 'Google Analytics 4 ID', { ph: 'G-XXXXXXX' })}${F.text('features.plausible', 'Plausible domain', { ph: 'example.com' })}</div>
  ${F.toggle('features.cookie', 'Cookie consent banner', 'Analytics load only after the visitor accepts.')}`;
}
function publishPane() {
  const w = contentWarnings(P);
  return `<h3>SEO</h3>
  ${F.text('seo.domain', 'Website address', { ph: 'www.yourbrand.com', hint: 'Used for canonical links, sitemap and social previews.' })}
  ${F.text('seo.title', 'Page title', { ph: 'Leave empty for automatic' })}
  ${F.area('seo.description', 'Meta description', { ph: 'Leave empty for automatic' })}
  ${F.text('seo.ogImage', 'Social share image (1200×630)', { ph: 'Defaults to the hero image' })}
  ${F.text('footer.credit', 'Footer credit line')}
  <h3>Content check</h3>
  ${w.length ? `<ul class="warn-list">${w.map(x => `<li>⚠ <span>${esc(x.msg)}</span>${x.id ? `<button type="button" class="zbtn sm" data-goto="${x.id}">Fix</button>` : ''}</li>`).join('')}</ul>` : '<p class="zhint">✓ No placeholders or demo text left.</p>'}
  <h3>Export</h3>
  <button type="button" class="zbtn primary lg" data-act="zip" style="width:100%">${ic('download')} Download website ZIP</button>
  <p class="zhint">Cloudflare → Workers & Pages → Create → Pages → Upload assets → drop the unzipped folder. The ZIP includes zarvis-project.json so you can import it and keep editing.</p>
  <div class="row2" style="margin-top:10px"><button type="button" class="zbtn sm" data-act="export-json">Export project JSON</button>${status.images ? '<button type="button" class="zbtn sm" data-act="stock-all">Fill empty images with stock photos</button>' : ''}</div>`;
}

/* ================================================================ preview */
let runtimeJs = '', lastY = 0, pvTimer = 0, pvToken = 0;
async function runtime() { if (!runtimeJs) runtimeJs = await (await fetch('/engine/site.js')).text(); return runtimeJs; }
function schedulePreview(ms = 450) { clearTimeout(pvTimer); pvTimer = setTimeout(renderPreview, ms); }
async function renderPreview() {
  if (!P) return;
  const tok = ++pvToken;
  try {
    const p = previewProject();
    const r = await renderSite(p, { runtimeJs: await runtime(), preview: { y: lastY } });
    if (tok !== pvToken) return;
    $('#preview').srcdoc = r.previewHtml; fitFrame();
    $('#stageNote').textContent = `${r.meta.style} · ${r.meta.blocks} blocks · menu: ${r.meta.sections.join(', ') || '—'}`;
  } catch (err) { console.error(err); $('#stageNote').textContent = 'Preview error: ' + err.message; }
}
function previewProject() { const p = clone(P); if (p.design.fonts?.custom) p.design.fonts.display = p.design.fonts.custom; return p; }
function fitFrame() {
  const stage = $('#stage'), box = $('#frameBox'), f = $('#preview'); if (!stage || $('#editor').hidden) return;
  const W = { desktop: 1440, tablet: 820, mobile: 390 }[device];
  const sw = stage.clientWidth - 24, sh = stage.clientHeight - 24;
  const scale = Math.min(1, sw / W);
  f.style.width = W + 'px'; f.style.height = Math.round(sh / scale) + 'px';
  box.style.width = W + 'px'; box.style.height = Math.round(sh / scale) + 'px'; box.style.transform = `scale(${scale})`; box.style.marginLeft = Math.max(12, Math.round((stage.clientWidth - W * scale) / 2)) + 'px';
  box.style.marginBottom = `${-Math.round(sh / scale * (1 - scale))}px`;
}
new ResizeObserver(() => fitFrame()).observe(document.body);
const postToPreview = m => { try { $('#preview').contentWindow.postMessage(m, '*'); } catch { /* ignore */ } };
addEventListener('message', e => {
  if (e.source !== $('#preview')?.contentWindow) return;
  const m = e.data || {};
  if (m.zarvis === 'scroll') lastY = m.y || 0;
  if (m.zarvis === 'select' && P?.blocks.find(b => b.id === m.id)) { sel = m.id; tab = 'blocks'; renderPane(); }
});
function showBusy(t) { $('#busyText').textContent = t; $('#busy').hidden = false; }
function hideBusy() { $('#busy').hidden = true; }

/* ================================================================ AI in editor */
async function aiCommand(instruction) {
  if (!instruction) return;
  if (!aiReady()) { toast('AI is not configured. Add an API key in Cloudflare (see README).'); openSettings(); return; }
  showBusy('Zarvis is redesigning…'); const t0 = Date.now(); const tick = setInterval(() => showBusy(`Zarvis is working… ${Math.round((Date.now() - t0) / 1000)}s`), 1000);
  try {
    snapshot();
    const r = await api('/api/generate', { method: 'POST', body: JSON.stringify({ mode: 'edit', provider: settings.provider, model: settings.model, effort: settings.effort || undefined, input: { instruction, project: compactProject(P), seed: Math.floor(Math.random() * 1e6) } }) });
    applySite(P, r.site, { mode: 'edit' });
    sel = null; changed({ pane: true }); snapshot();
    toast(`✓ Done in ${Math.round((Date.now() - t0) / 1000)}s${r.site?.notes ? ': ' + r.site.notes : ''}`, 6000);
    $('#cmdInput').value = '';
  } catch (e) { toast('✕ ' + e.message, 6000); }
  finally { clearInterval(tick); hideBusy(); }
}
async function aiBlock(instruction) {
  const b = selBlock(); if (!b) return;
  if (!aiReady()) { toast('AI is not configured. Add an API key in Cloudflare (see README).'); return; }
  showBusy('Rewriting block…');
  try {
    snapshot();
    const r = await api('/api/generate', { method: 'POST', body: JSON.stringify({ mode: 'block', provider: settings.provider, model: settings.model, effort: settings.effort || undefined, input: { instruction: instruction || 'Improve this block.', project: compactProject(P), blockId: b.id } }) });
    const nb = { ...r.site.block, id: b.id, type: BLOCKS[r.site.block?.type] ? r.site.block.type : b.type };
    const tmp = { ...P, design: { ...P.design }, seo: { ...P.seo }, brand: { ...P.brand }, blocks: [b] };
    applySite(tmp, { style: P.design.style, blocks: [nb] }, { mode: 'edit' });
    const i = P.blocks.indexOf(b);
    P.blocks[i] = tmp.blocks[0]; changed({ pane: true }); snapshot();
    toast('✓ Block rewritten');
  } catch (e) { toast('✕ ' + e.message, 6000); }
  finally { hideBusy(); }
}

/* ================================================================ shuffle */
function shuffleDesign() {
  snapshot();
  const cur = P.design.style;
  const id = rnd(STYLE_IDS.filter(s => s !== cur));
  const st = STYLES[id];
  P.design = { style: id, paletteId: rnd(Object.keys(st.palettes)), colors: {}, fonts: {}, customCss: P.design.customCss || '' };
  if (Math.random() < 0.4) { const [dsp, body] = rnd(PAIRS); P.design.fonts = { display: dsp, body }; }
  if (Math.random() < 0.5) P.design.heroText = rnd(Object.keys(OPTIONS.heroText));
  applyVariants();
  changed({ pane: true });
  toast(`🎲 ${st.name} · ${st.palettes[P.design.paletteId].name}${P.design.fonts.display ? ` · ${P.design.fonts.display}` : ''}`);
}
function applyVariants() { const st = STYLES[P.design.style]; P.blocks.forEach(b => { const v = st.variants[b.type]; if (v && BLOCKS[b.type].variants[v]) b.variant = v; }); }

/* ================================================================ export */
async function exportZip(force = false) {
  const w = contentWarnings(P);
  if (w.length && !force) {
    $('#exportWarn').innerHTML = w.map(x => `<li>⚠ <span>${esc(x.msg)}</span></li>`).join('');
    const d = $('#exportDlg'); d.showModal();
    d.onclose = () => { if (d.returnValue === 'go') exportZip(true); else if (d.returnValue === 'fix') { const first = w.find(x => x.id); if (first) { sel = first.id; tab = 'blocks'; renderPane(); postToPreview({ zarvis: 'scrollTo', id: first.id }); } } };
    return;
  }
  showBusy('Building your website…');
  try {
    const r = await renderSite(previewProject(), { runtimeJs: await runtime() });
    const blob = makeZip(r.files);
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${(P.name || 'website').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'website'}-site.zip` });
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast('ZIP downloaded. Upload it to Cloudflare Pages.');
  } catch (e) { toast('Export failed: ' + e.message); }
  finally { hideBusy(); }
}
function exportJson(p) {
  const blob = new Blob([JSON.stringify({ zarvis: 2, project: p }, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${(p.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zarvis.json` });
  document.body.appendChild(a); a.click(); a.remove();
}
async function openInTab() {
  const r = await renderSite(previewProject(), { runtimeJs: await runtime() });
  const url = URL.createObjectURL(new Blob([r.previewHtml], { type: 'text/html' }));
  const a = Object.assign(document.createElement('a'), { href: url, target: '_blank', rel: 'noopener' });
  document.body.appendChild(a); a.click(); a.remove();
}

/* ================================================================ events */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-kind],[data-style],[data-tpl],[data-open],[data-dup],[data-del],[data-export],[data-tab],[data-device],[data-variant],[data-setstyle],[data-pal],[data-sugg],[data-goto],[data-add],[data-ph]');
  if (!t) return;
  const act = t.dataset.act;
  // home
  if (t.dataset.kind) { home.kind = home.kind === t.dataset.kind ? '' : t.dataset.kind; if (home.kind && TEMPLATES[home.kind] && home.style !== 'auto') { /* keep chosen style */ } $$('[data-kind]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === home.kind))); return; }
  if (t.dataset.style) { home.style = t.dataset.style; $$('[data-style]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.style === home.style))); return; }
  if (t.dataset.tpl) { const tp = TEMPLATES[t.dataset.tpl]; const name = $('#nName').value.trim() || (t.dataset.tpl === 'blank' ? 'New website' : tp.name); const f = readNewForm(); const p = newProject({ name, description: f.description, kind: tp.kind, style: tp.style, template: t.dataset.tpl, details: f.details }); projects[p.id] = p; openProject(p.id); return; }
  if (t.dataset.open) { openProject(t.dataset.open); return; }
  if (t.dataset.dup) { const p = clone(projects[t.dataset.dup]); p.id = 'p' + Date.now().toString(36); p.name += ' (copy)'; p.updated = Date.now(); projects[p.id] = p; store.set(LS.projects, projects); renderProjects(); return; }
  if (t.dataset.del) { const p = projects[t.dataset.del]; if (confirm(`Delete “${p.name}”? This cannot be undone.`)) { delete projects[t.dataset.del]; store.set(LS.projects, projects); renderProjects(); } return; }
  if (t.dataset.export) { exportJson(projects[t.dataset.export]); return; }
  if (act === 'home') { if (P) saveProject(); goHome(); return; }
  if (act === 'settings') { openSettings(); return; }
  if (act === 'tpl-selected') { createFromHome('template'); return; }
  if (act === 'blank') { createFromHome('blank'); return; }
  if (!P) return;
  // editor
  if (t.dataset.tab) { tab = t.dataset.tab; if (tab !== 'blocks') sel = null; renderPane(); return; }
  if (t.dataset.device) { device = t.dataset.device; $$('[data-device]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); fitFrame(); return; }
  if (t.dataset.sugg) { $('#cmdInput').value = t.dataset.sugg; aiCommand(t.dataset.sugg); return; }
  if (t.dataset.goto) { sel = t.dataset.goto; tab = 'blocks'; renderPane(); postToPreview({ zarvis: 'scrollTo', id: sel }); return; }
  if (t.dataset.add && !t.__dragged) { return; }
  if (t.dataset.setstyle) { snapshot(); P.design.style = t.dataset.setstyle; P.design.paletteId = ''; P.design.colors = {}; P.design.fonts = {}; applyVariants(); changed({ pane: true }); toast(`${STYLES[P.design.style].name}: ${STYLES[P.design.style].tag}`); return; }
  if (t.dataset.pal) { P.design.paletteId = t.dataset.pal; P.design.colors = {}; changed({ pane: true }); return; }
  if (t.dataset.variant) { const b = selBlock(); b.variant = t.dataset.variant; changed({ pane: true }); return; }
  if (t.dataset.ph !== undefined) {
    const ph = $('#photoGrid').__photos[+t.dataset.ph]; const tg = photoTarget; if (!ph || !tg) return;
    const b = P.blocks.find(x => x.id === tg.id); if (!b) return;
    if (tg.slot === 'images') b.images = [...b.images, ph.src]; else if (tg.slot === 'item') b.items[tg.k].image = ph.src; else b[tg.slot] = ph.src;
    P.credits = [...new Set([...(P.credits || []), ph.credit])];
    if (ph.download) api(`/api/images/track?u=${encodeURIComponent(ph.download)}`).catch(() => {});
    changed({ pane: true }); if (tg.slot !== 'images') $('#photoDlg').close(); else toast('Added to gallery');
    return;
  }
  const b = sel && selBlock();
  switch (act) {
    case 'undo': undo(-1); break;
    case 'redo': undo(1); break;
    case 'open-tab': openInTab(); break;
    case 'zip': exportZip(); break;
    case 'shuffle': shuffleDesign(); break;
    case 'lib': libOpen = !libOpen; renderPane(); break;
    case 'select': { const id = t.closest('[data-id]').dataset.id; sel = id; renderPane(); postToPreview({ zarvis: 'scrollTo', id }); break; }
    case 'menu': { const x = P.blocks.find(bb => bb.id === t.closest('[data-id]').dataset.id); x.menu.show = !x.menu.show; changed({ pane: true }); break; }
    case 'hide': { const x = P.blocks.find(bb => bb.id === t.closest('[data-id]').dataset.id); x.hidden = !x.hidden; changed({ pane: true }); break; }
    case 'back': sel = null; renderPane(); break;
    case 'up': case 'down': { const i = P.blocks.indexOf(b), j = i + (act === 'up' ? -1 : 1); if (j < 0 || j >= P.blocks.length) break; P.blocks.splice(j, 0, P.blocks.splice(i, 1)[0]); changed({ pane: true }); break; }
    case 'dup': { const c = normalizeBlock({ ...clone(b), id: uid() }); P.blocks.splice(P.blocks.indexOf(b) + 1, 0, c); sel = c.id; changed({ pane: true }); break; }
    case 'del': { if (!confirm(`Delete this ${BLOCKS[b.type].label} block?`)) break; P.blocks = P.blocks.filter(x => x !== b); sel = null; changed({ pane: true }); toast('Block deleted. Undo with Ctrl+Z.'); break; }
    case 'btn-add': b.buttons.push({ label: 'Button', href: '#contact' }); changed({ pane: true }); break;
    case 'btn-del': b.buttons.splice(+t.dataset.k, 1); changed({ pane: true }); break;
    case 'it-add': { const f = BLOCKS[b.type].fields.items.f; b.items.push(Object.fromEntries(['title', 'text', 'meta', 'value', 'image', 'icon', 'tag', 'link'].map(k => [k, k === 'title' && f.title ? 'New item' : '']))); changed({ pane: true }); break; }
    case 'it-del': b.items.splice(+t.dataset.k, 1); changed({ pane: true }); break;
    case 'it-up': case 'it-down': { const k = +t.dataset.k, j = k + (act === 'it-up' ? -1 : 1); if (j < 0 || j >= b.items.length) break; b.items.splice(j, 0, b.items.splice(k, 1)[0]); changed({ pane: true }); break; }
    case 'photo': openPhotoPicker({ id: b.id, slot: t.dataset.slot, k: +t.dataset.k }, (t.dataset.slot === 'item' ? b.items[+t.dataset.k]?.title + ' ' : '') + (b.q || [b.title, b.titleEm].join(' ').trim() || P.brief.kind || P.name)); break;
    case 'block-ai': aiBlock($('#blockAi').value.trim()); break;
    case 'apply-variants': snapshot(); applyVariants(); changed({ pane: true }); toast('Block layouts updated for this style.'); break;
    case 'reset-design': snapshot(); P.design = { style: P.design.style, paletteId: '', colors: {}, fonts: {} }; changed({ pane: true }); break;
    case 'shuffle-colors': { const st = STYLES[P.design.style]; P.design.paletteId = rnd(Object.keys(st.palettes).filter(k => k !== resolveDesign(P.design).paletteId)) || P.design.paletteId; P.design.colors = {}; changed({ pane: true }); break; }
    case 'export-json': exportJson(P); break;
    case 'stock-all': fillStock(P, { onlyEmpty: true }); break;
  }
});
document.addEventListener('pointerdown', e => {
  if (!P || $('#editor').hidden) return;
  const h = e.target.closest('.drag');
  if (h && e.button === 0) { startDrag(e, { kind: 'move', id: h.closest('[data-id]').dataset.id }); return; }
  const lt = e.target.closest('.lt');
  if (lt && e.button === 0) startDrag(e, { kind: 'new', type: lt.dataset.add });
});
// keyboard reordering for accessibility: focus a block, Alt+↑/↓
document.addEventListener('keydown', e => {
  if (!P || $('#editor').hidden) return;
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'z' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); undo(e.shiftKey ? 1 : -1); }
  if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { const li = document.activeElement.closest('[data-id]'); if (!li) return; e.preventDefault(); const i = P.blocks.findIndex(b => b.id === li.dataset.id), j = i + (e.key === 'ArrowUp' ? -1 : 1); if (j < 0 || j >= P.blocks.length) return; P.blocks.splice(j, 0, P.blocks.splice(i, 1)[0]); changed({ pane: true }); $(`[data-id="${li.dataset.id}"] .ob-main`)?.focus(); }
});
// field binding
document.addEventListener('input', e => {
  const t = e.target; if (!P) return;
  if (t.id === 'projectName') { P.name = t.value; changed({ preview: false }); return; }
  if (t.dataset.bind) {
    let v = t.type === 'checkbox' ? t.checked : t.value;
    if (t.dataset.num !== undefined) { v = parseFloat(v); const o = t.closest('label').querySelector('output'); if (o) o.textContent = v; }
    if (t.dataset.lines !== undefined) v = lines(v);
    if (t.tagName === 'SELECT' && /^design\.(emItalic|grain|spotlight|headerLinks)$/.test(t.dataset.bind)) v = v === '' ? '' : v === '1';
    setPath(P, t.dataset.bind, v);
    if (t.dataset.bind === 'brand.name' && (!P.name || P.name === 'New website')) { P.name = v; $('#projectName').value = v; }
    changed(); return;
  }
  if (t.dataset.color) { P.design.colors = { ...resolveDesign(P.design).palette, ...P.design.colors, [t.dataset.color]: t.value }; changed(); return; }
  const b = sel && selBlock(); if (!b) return;
  if (t.dataset.bb) {
    const v = t.type === 'checkbox' ? t.checked : t.value;
    if (t.dataset.bb === 'images') b.images = lines(v);
    else setPath(b, t.dataset.bb, v);
    b.demo = false;
    changed({ pane: t.dataset.bb === 'menu.show' }); return;
  }
  if (t.dataset.btn) { const [k, f] = t.dataset.btn.split('.'); b.buttons[+k][f] = t.value; changed(); return; }
  if (t.dataset.it) { const [k, f] = t.dataset.it.split('.'); b.items[+k][f] = t.value; b.demo = false; changed(); }
});
document.addEventListener('change', e => { if (e.target.dataset.bind?.startsWith('design.fonts') || e.target.tagName === 'SELECT' && e.target.dataset.bb === 'tone') schedulePreview(0); });
$('#newForm').addEventListener('submit', e => { e.preventDefault(); createFromHome('ai'); });
$('#cmdForm').addEventListener('submit', e => { e.preventDefault(); aiCommand($('#cmdInput').value.trim()); });
$('#photoGo').addEventListener('click', runPhotoSearch);
$('#photoQ').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); runPhotoSearch(); } });
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const j = JSON.parse(await f.text());
    const p = j.project || (j.blocks ? j : null);
    if (!p) throw new Error(j.zarvis === 1 ? 'This is a Zarvis v1 project. Please rebuild it in v2.' : 'Not a Zarvis project file.');
    migrate(p); p.id = 'p' + Date.now().toString(36); p.updated = Date.now();
    projects[p.id] = p; store.set(LS.projects, projects); openProject(p.id); toast('Project imported');
  } catch (err) { toast('Import failed: ' + err.message); }
  e.target.value = '';
});
addEventListener('beforeunload', () => { if (P) saveProject(); });

/* ================================================================ boot */
renderHome();
loadStatus();
const last = store.get(LS.current, null);
if (last && projects[last] && location.hash === '#edit') openProject(last);
