/* =============================================================================
   Studio: the visual editor for Dr. Navjot Kaur's website (/admin)
   -----------------------------------------------------------------------------
   The live website is shown in a frame in "edit mode" (/?nk-edit). Texts are
   edited in place, photos are changed by clicking them. Every change goes into a
   draft (window.NK_DRAFT) that the preview reads; Publish sends the draft to the
   site worker, which stores it in Cloudinary and serves it to every visitor.
   ========================================================================== */
(() => {
'use strict';

/* ---------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = id => `<svg class="i"><use href="#i-${id}"/></svg>`;
const clone = o => (o == null ? o : JSON.parse(JSON.stringify(o)));
const sortKeys = o => Array.isArray(o) ? o.map(sortKeys) : o && typeof o === 'object' ? Object.keys(o).sort().reduce((a, k) => (a[k] = sortKeys(o[k]), a), {}) : o;
const stable = o => JSON.stringify(sortKeys(o === undefined ? null : o));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const isVideo = u => /\/video\/upload\//.test(u || '');
const isCdn = u => /^https:\/\/res\.cloudinary\.com\/[^\s"'<>]+\/(image|video)\/upload\/[^\s"'<>]+$/.test(String(u || '').trim());
const tx = (url, t) => url.replace('/upload/', `/upload/${t}/`);
const thumb = (url, w = 240, fit = false) => !url ? '' : isVideo(url)
  ? tx(url, `so_1,f_jpg,q_auto,c_${fit ? 'pad,b_black' : 'fill'},w_${w},h_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg')
  : tx(url, `f_auto,q_auto,${fit ? 'c_limit' : 'c_fill,g_auto'},w_${w},h_${w}`);
const preview = (url, w = 700) => isVideo(url) ? tx(url, `so_1,f_jpg,q_auto,c_limit,w_${w}`).replace(/\.(mov|mp4|webm|m4v)$/i, '.jpg') : tx(url, `f_auto,q_auto,c_limit,w_${w}`);
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
function rel(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return plural(Math.round(s / 3600), 'hour') + ' ago';
  if (s < 86400 * 7) return plural(Math.round(s / 86400), 'day') + ' ago';
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
const when = d => new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

/* ---------------------------------------------------------------------------
   State
   ------------------------------------------------------------------------ */
const S = {
  me: null, status: {}, cloudOk: false,
  saved: { content: null, version: null, updatedAt: null }, savedN: null,
  draft: null, defText: {}, defLinks: {}, defSeo: {},
  assets: null, defaults: null, config: null,
  undo: [], redo: [],
  editing: null, editBefore: null,
  panel: 'overview', arg: null,
  device: 'desktop', fw: null, fd: null, frameReady: false, keepScroll: 0, afterReady: [],
  menuOpen: false
};
const EMPTY = () => ({ text: {}, links: {}, config: {}, assets: {}, hidden: [], seo: {} });
function normalize(c) {
  const n = EMPTY();
  if (!c || typeof c !== 'object') return n;
  ['text', 'links', 'config', 'assets', 'seo'].forEach(k => { if (c[k] && typeof c[k] === 'object' && !Array.isArray(c[k])) n[k] = clone(c[k]); });
  if (Array.isArray(c.hidden)) n.hidden = c.hidden.slice();
  if (Array.isArray(c.podcasts)) n.podcasts = clone(c.podcasts);
  return n;
}
function setDraft(d) { S.draft = d; window.NK_DRAFT = d; }

/* ---------------------------------------------------------------------------
   API
   ------------------------------------------------------------------------ */
async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch(`/api${path}`, {
    method, credentials: 'same-origin',
    headers: { 'X-NK': '1', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const ct = r.headers.get('content-type') || '';
  const j = ct.includes('json') ? await r.json().catch(() => ({})) : { text: await r.text() };
  if (r.status === 401 && path !== '/login') sessionLost();
  if (!r.ok) { const e = new Error(j.error || `Request failed (${r.status})`); e.status = r.status; e.body = j; throw e; }
  return j;
}

/* ---------------------------------------------------------------------------
   Toasts & confetti
   ------------------------------------------------------------------------ */
function toast(msg, kind = 'ok', ms = 2600) {
  const t = document.createElement('div');
  t.className = `toast ${kind}`;
  t.innerHTML = `<span class="ti">${icon(kind === 'err' ? 'alert' : 'check')}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, ms);
}
function confetti() {
  const c = $('#confetti'), x = c.getContext('2d');
  const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
  const cols = ['#FFF1C9', '#F1C96B', '#C8963E', '#D9BC84', '#ffffff'];
  const ps = Array.from({ length: 180 }, () => ({
    x: W / 2, y: H * 0.42, vx: (Math.random() - 0.5) * 26 * devicePixelRatio, vy: (Math.random() * -22 - 6) * devicePixelRatio,
    s: (Math.random() * 6 + 3) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: cols[Math.random() * cols.length | 0], life: 0
  }));
  let raf;
  const tick = () => {
    x.clearRect(0, 0, W, H);
    let alive = 0;
    ps.forEach(p => {
      p.life++; p.vy += 0.55 * devicePixelRatio; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      if (p.y < H + 40) alive++;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = Math.max(0, 1 - p.life / 150);
      x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore();
    });
    if (alive && ps[0].life < 170) raf = requestAnimationFrame(tick); else x.clearRect(0, 0, W, H);
  };
  cancelAnimationFrame(raf); tick();
}
function countUp(el) {
  const end = +el.dataset.n, t0 = performance.now(), d = 1300;
  const step = t => { const k = Math.min(1, (t - t0) / d); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

/* ---------------------------------------------------------------------------
   Layers: modals, palette
   ------------------------------------------------------------------------ */
function openLayer(html, { cls = 'modal', onClose } = {}) {
  closeLayer(true);
  const L = $('#layer');
  L.innerHTML = `<div class="scrim"></div><div class="${cls}" role="dialog" aria-modal="true">${html}</div>`;
  const box = L.lastElementChild;
  const close = () => closeLayer(false, onClose);
  $('.scrim', L).addEventListener('click', close);
  $$('[data-close]', box).forEach(b => b.addEventListener('click', close));
  L._close = close;
  setTimeout(() => { const f = $('input,textarea,button.gold-btn', box); if (f) f.focus(); }, 60);
  return box;
}
function closeLayer(instant, onClose) {
  const L = $('#layer');
  if (!L.firstChild) return;
  if (instant) { L.innerHTML = ''; return; }
  $$('.scrim, .modal, .palette', L).forEach(n => n.classList.add('out'));
  setTimeout(() => { L.innerHTML = ''; }, 280);
  L._close = null;
  if (onClose) onClose();
}

/* ---------------------------------------------------------------------------
   Boot, login, setup
   ------------------------------------------------------------------------ */
function dust() {
  const d = $('.dust'); if (!d || d.childElementCount) return;
  for (let i = 0; i < 34; i++) {
    const s = document.createElement('span');
    s.style.left = `${Math.random() * 100}%`; s.style.bottom = `${Math.random() * 30 - 10}%`;
    s.style.setProperty('--d', `${8 + Math.random() * 10}s`); s.style.setProperty('--w', `${Math.random() * -18}s`);
    s.style.transform = `scale(${0.4 + Math.random()})`;
    d.appendChild(s);
  }
}
function hideBoot() { const b = $('#boot'); b.classList.add('is-gone'); setTimeout(() => b.remove(), 700); }

async function start() {
  dust();
  try { S.status = await (await fetch('/api/status', { credentials: 'same-origin' })).json(); } catch (e) { S.status = {}; }
  hideBoot();
  if (!S.status.login) return showSetup();
  try { S.me = await api('/me'); openStudio(false); } catch (e) { showLogin(); }
}

function showSetup() {
  $('#login').hidden = false; $('#loginForm').hidden = true;
  const s = $('#setup'); s.hidden = false;
  const row = (ok, txt) => `<li><span class="${ok ? 'ok' : 'no'}">${ok ? '✓' : '○'}</span> ${txt}</li>`;
  s.innerHTML = `<p class="kicker">ONE-TIME SETUP</p><h1>Let’s connect your <em>studio.</em></h1>
    <p class="login-sub" style="text-align:left">In Cloudflare, open <b>Workers &amp; Pages → this project → Settings → Variables and Secrets</b>, add these for <b>Production</b>, then redeploy (upload the same ZIP again).</p>
    <ol>${row(S.status.login, '<code>ADMIN_USER</code> and <code>ADMIN_PASSWORD</code>: your studio ID and password (use the “Secret” type for the password)')}
    ${row(S.status.cloudinary, '<code>CLOUDINARY_API_KEY</code> and <code>CLOUDINARY_API_SECRET</code>: from Cloudinary → Settings → API Keys. They store the published version of the website.')}</ol>
    <p class="login-foot" style="justify-content:flex-start"><svg class="i"><use href="#i-lock"/></svg>Nothing else is needed: no databases, no extra Cloudflare services.</p>`;
}

function showLogin(msg) {
  const L = $('#login'); L.hidden = false; $('#setup').hidden = true; $('#loginForm').hidden = false;
  L.style.zIndex = 70;
  $('#loginErr').textContent = msg || '';
  setTimeout(() => $('#lUser').focus(), 300);
}
function initLogin() {
  $('#peek').addEventListener('click', () => {
    const p = $('#lPass'); const show = p.type === 'password'; p.type = show ? 'text' : 'password';
    $('#peek').innerHTML = icon(show ? 'eye-off' : 'eye'); $('#peek').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#loginBtn'), err = $('#loginErr');
    const user = $('#lUser').value.trim(), pass = $('#lPass').value;
    if (!user || !pass) { err.textContent = 'Please enter your ID and password.'; return; }
    btn.classList.add('is-busy'); btn.disabled = true; err.textContent = '';
    try {
      await api('/login', { method: 'POST', body: { user, pass } });
      S.me = await api('/me');
      $('#lPass').value = '';
      const L = $('#login');
      L.style.transition = 'opacity .7s cubic-bezier(.22,1,.36,1)'; L.style.opacity = '0';
      await sleep(500);
      L.hidden = true; L.style.opacity = ''; L.style.transition = '';
      if (S.draft) { toast('Welcome back. Your changes are safe.'); return; }
      openStudio(true);
    } catch (ex) {
      err.textContent = ex.message;
      const card = $('#loginForm'); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    } finally { btn.classList.remove('is-busy'); btn.disabled = false; }
  });
}
let lostShown = false;
function sessionLost() {
  if (lostShown || !S.draft) return;
  lostShown = true;
  showLogin('Your session ended. Sign in again: your changes are kept.');
  setTimeout(() => { lostShown = false; }, 1500);
}

/* ---------------------------------------------------------------------------
   Studio
   ------------------------------------------------------------------------ */
async function openStudio(fromLogin) {
  $('#login').hidden = true;
  const st = $('#studio'); st.hidden = false; st.classList.add('enter');
  const name = S.me.user || 'there';
  if (fromLogin || !sessionStorage.getItem('nk-studio-hi')) {
    sessionStorage.setItem('nk-studio-hi', '1');
    const intro = document.createElement('div'); intro.className = 'intro';
    intro.innerHTML = `<div class="in-wrap"><p>THE STUDIO</p><h1>${greeting()}, <em>${esc(name)}.</em></h1><small>Every word, photo and link on your website is yours to shape.</small><div class="line"></div></div>`;
    document.body.appendChild(intro);
    setTimeout(() => { intro.classList.add('go'); setTimeout(() => intro.remove(), 950); }, 2100);
  }
  initStudioUI();
  const [content] = await Promise.all([loadContent(), loadOriginal()]);
  void content;
  setDraft(clone(S.savedN));
  checkAutosave();
  loadFrame();
  showPanel('overview');
  updateStatus();
}
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

async function loadContent() {
  try {
    const r = await api('/content');
    S.saved = { content: r.content, version: r.version, updatedAt: r.updatedAt };
    S.cloudOk = true;
  } catch (e) {
    S.saved = { content: null, version: null, updatedAt: null };
    S.cloudOk = false;
    if (e.status === 503) showBanner(`${icon('alert')}<span>Publishing switches on after one last setup step. You can explore and edit in the meantime; your work is saved.</span><span class="sp"></span><button class="btn sm" type="button" data-banner="setup">What’s needed</button>`);
    else toast(`Could not load the published version: ${e.message}`, 'err', 5000);
  }
  S.savedN = normalize(S.saved.content);
}
async function loadOriginal() {
  try {
    const r = await api('/original');
    const doc = new DOMParser().parseFromString(r.text || '', 'text/html');
    $$('[data-e]', doc).forEach(el => { S.defText[el.dataset.e] = cleanHtml(el.innerHTML); });
    $$('[data-l]', doc).forEach(a => { S.defLinks[a.dataset.l] = a.getAttribute('href'); });
    S.defSeo = { title: (doc.title || '').trim(), description: ($('meta[name="description"]', doc) || {}).content || '' };
  } catch (e) { /* defaults stay empty: resets then fall back to the preview's text */ }
}

function showBanner(html) {
  const b = $('#banner'); b.innerHTML = html; b.hidden = false;
  $$('[data-banner]', b).forEach(btn => btn.addEventListener('click', () => {
    const a = btn.dataset.banner;
    if (a === 'setup') setupHelp();
    if (a === 'close') b.hidden = true;
    if (a === 'restore') restoreAutosave();
    if (a === 'discard') { clearAutosave(); b.hidden = true; toast('Older unsaved changes discarded'); }
    if (a === 'menu-close') closeFrameMenu();
  }));
}
function setupHelp() {
  openLayer(`<div class="m-head"><div><p class="eyebrow">ONE LAST STEP</p><h2>Switch on <em>publishing.</em></h2></div><button class="ic-btn" data-close aria-label="Close">${icon('x')}</button></div>
  <div class="m-body"><p style="color:var(--m);margin:0 0 6px">${S.me && S.me.support && (S.me.support.email || S.me.support.whatsapp) ? `Your web team at ${esc(S.me.support.name)} can do this for you in a minute. For reference:` : 'For whoever manages the hosting:'}</p><ol style="color:var(--m);padding-left:20px;line-height:1.8">
    <li>Open <b>cloudinary.com</b> → <b>Settings → API Keys</b> and copy the <b>API Key</b> and <b>API Secret</b>.</li>
    <li>In Cloudflare: <b>Workers &amp; Pages → this project → Settings → Variables and Secrets</b>.</li>
    <li>Add <code class="kbd">CLOUDINARY_API_KEY</code> and <code class="kbd">CLOUDINARY_API_SECRET</code> (Secret) for <b>Production</b>.</li>
    <li>Redeploy (upload the same ZIP again), then reload this page.</li></ol></div>
  <div class="m-foot"><button class="gold-btn" data-close>Got it</button></div>`, { cls: 'modal sm' });
}

/* ---------------------------------------------------------------------------
   Draft bookkeeping: changes, undo, autosave, status
   ------------------------------------------------------------------------ */
function changes() {
  const a = S.draft, b = S.savedN, out = [];
  if (!a || !b) return out;
  const keys = (x, y) => new Set([...Object.keys(x || {}), ...Object.keys(y || {})]);
  keys(a.text, b.text).forEach(k => { if ((a.text[k] || null) !== (b.text[k] || null)) out.push({ kind: 'text', key: k }); });
  keys(a.links, b.links).forEach(k => { if ((a.links[k] || null) !== (b.links[k] || null)) out.push({ kind: 'link', key: k }); });
  keys(a.assets, b.assets).forEach(k => { if (stable(a.assets[k]) !== stable(b.assets[k])) out.push({ kind: 'photos', key: k }); });
  keys(a.config, b.config).forEach(k => { if (stable(a.config[k]) !== stable(b.config[k])) out.push({ kind: 'contact', key: k }); });
  keys(a.seo, b.seo).forEach(k => { if ((a.seo[k] || '') !== (b.seo[k] || '')) out.push({ kind: 'google', key: k }); });
  if (stable(a.podcasts) !== stable(b.podcasts)) out.push({ kind: 'podcasts', key: 'podcasts' });
  if (stable([...a.hidden].sort()) !== stable([...b.hidden].sort())) out.push({ kind: 'sections', key: 'hidden' });
  return out;
}
function pushUndo(prev) {
  if (prev == null || prev === JSON.stringify(S.draft)) return;
  S.undo.push(prev); if (S.undo.length > 120) S.undo.shift();
  S.redo = [];
  updateUndo();
}
function updateUndo() { $('#undoBtn').disabled = !S.undo.length; $('#redoBtn').disabled = !S.redo.length; }
function afterChange({ reload = false, prev } = {}) {
  if (prev !== undefined) pushUndo(prev);
  autosave(); updateStatus();
  if (reload) reloadFrame(); else markChanged();
  refreshBadges();
}
function undo() {
  if (S.editing) endEdit();
  const prev = S.undo.pop(); if (!prev) return;
  S.redo.push(JSON.stringify(S.draft)); applySnapshot(prev); toast('Undone');
}
function redo() {
  if (S.editing) endEdit();
  const next = S.redo.pop(); if (!next) return;
  S.undo.push(JSON.stringify(S.draft)); applySnapshot(next); toast('Redone');
}
function applySnapshot(json) {
  const before = S.draft;
  setDraft(JSON.parse(json));
  const strip = d => stable({ ...d, text: null, hidden: null, seo: null });
  if (strip(before) !== strip(S.draft)) reloadFrame(); else { applyTextsToFrame(); applyHiddenToFrame(); }
  autosave(); updateStatus(); updateUndo(); refreshBadges();
  showPanel(S.panel, S.arg, true);
}
const AUTOSAVE = 'nk-studio-draft';
const autosave = debounce(() => {
  try {
    if (!changes().length) localStorage.removeItem(AUTOSAVE);
    else localStorage.setItem(AUTOSAVE, JSON.stringify({ draft: S.draft, base: S.saved.version, at: Date.now() }));
  } catch (e) { /* storage full or blocked */ }
}, 400);
function clearAutosave() { try { localStorage.removeItem(AUTOSAVE); } catch (e) { /* ignore */ } }
function checkAutosave() {
  let a = null; try { a = JSON.parse(localStorage.getItem(AUTOSAVE) || 'null'); } catch (e) { a = null; }
  if (!a || !a.draft || stable(normalize(a.draft)) === stable(S.savedN)) return;
  S.pendingAutosave = a;
  showBanner(`${icon('clock')}<span>You have unpublished changes from ${esc(rel(a.at))}. Pick up where you left off?</span><span class="sp"></span><button class="btn sm" type="button" data-banner="discard">Discard</button><button class="gold-btn" style="height:32px" type="button" data-banner="restore">Restore</button>`);
}
function restoreAutosave() {
  const a = S.pendingAutosave; if (!a) return;
  const prev = JSON.stringify(S.draft);
  setDraft(normalize(a.draft));
  $('#banner').hidden = true;
  afterChange({ reload: true, prev });
  toast('Your unpublished changes are back');
}
function updateStatus() {
  const n = changes().length, st = $('#status'), pb = $('#publishBtn'), cc = $('#changeCount');
  st.classList.toggle('dirty', n > 0);
  st.classList.toggle('off', !S.cloudOk);
  $('span', st).textContent = n ? `${plural(n, 'unpublished change')}` : S.saved.updatedAt ? `Live · published ${rel(S.saved.updatedAt)}` : 'Live · original version';
  pb.disabled = !n || !S.cloudOk;
  pb.title = !S.cloudOk ? 'Connect Cloudinary to publish' : n ? 'Publish your changes (Ctrl+S)' : 'Everything is live';
  cc.hidden = !n; if (n && cc.textContent !== String(n)) { cc.textContent = n; cc.style.animation = 'none'; void cc.offsetWidth; cc.style.animation = ''; }
}
setInterval(() => { if (S.draft) updateStatus(); }, 30000);

/* ---------------------------------------------------------------------------
   Preview frame
   ------------------------------------------------------------------------ */
const frame = () => $('#frame');
let loadId = 0;
function loadFrame() {
  S.frameReady = false; loadId++;
  $('#frameLoad').classList.remove('is-done');
  hideHover(); hideToolbar();
  frame().src = `/?nk-edit=1&r=${Date.now()}`;
}
function reloadFrame() {
  if (S.editing) endEdit();
  try { S.keepScroll = S.fw ? S.fw.scrollY : 0; } catch (e) { S.keepScroll = 0; }
  S.menuOpen = false;
  loadFrame();
}
window.addEventListener('message', e => {
  if (e.origin !== location.origin || !e.data || e.data.nk !== 'ready') return;
  if (frame() && e.source === frame().contentWindow) onFrameReady();
});
function onFrameReady() {
  const fw = frame().contentWindow, fd = frame().contentDocument;
  if (!fw || !fw.NK || fd.__nkWired === loadId) return;
  fd.__nkWired = loadId;
  S.fw = fw; S.fd = fd;
  S.assets = clone(fw.NK.ASSETS); S.defaults = clone(fw.NK.DEFAULTS); S.config = clone(fw.NK.CONFIG);
  S.podcastsNow = clone(fw.NK.PODCASTS);
  $$('[data-e]', fd).forEach(el => { if (!(el.dataset.e in S.defText)) S.defText[el.dataset.e] = cleanHtml(el.innerHTML); });
  injectEditStyles(fd);
  wireFrame(fw, fd);
  markChanged();
  if (S.keepScroll) fw.scrollTo(0, S.keepScroll);
  S.keepScroll = 0;
  S.frameReady = true;
  setTimeout(() => $('#frameLoad').classList.add('is-done'), 120);
  const q = S.afterReady.splice(0); q.forEach(f => f());
  if (['overview', 'photos', 'health', 'podcasts', 'links'].includes(S.panel)) showPanel(S.panel, S.arg, true);
}
function whenReady(fn) { if (S.frameReady) fn(); else S.afterReady.push(fn); }

function injectEditStyles(fd) {
  const st = fd.createElement('style');
  st.id = 'nk-studio';
  st.textContent = `
html{scroll-behavior:auto!important}
[data-e]{cursor:text;outline:1.5px dashed transparent;outline-offset:3px;border-radius:2px;transition:outline-color .2s,background-color .2s}
[data-e]:hover{outline-color:rgba(200,150,62,.95)}
[data-e].nk-changed{outline-color:rgba(111,207,151,.65)}
[data-e][contenteditable="true"]{outline:2px solid #F1C96B!important;outline-offset:5px;background-color:rgba(241,201,107,.1);caret-color:#C8963E}
#heroMedia,[data-asset],[data-slot],[data-podcast]{cursor:pointer}
.marquee-track{animation:none!important;flex-wrap:wrap;width:auto!important}
.marquee-set{flex-wrap:wrap}
.role-rot{display:inline-flex!important;flex-wrap:wrap;gap:.1em .9em;height:auto!important;overflow:visible!important;contain:none!important}
.role-rot>span{transform:none!important;opacity:1!important;grid-area:auto!important}
.hero-media img{animation:none!important}
.splash,.cursor{display:none!important}
.nk-off{opacity:.4;filter:grayscale(.7);outline:2px dashed rgba(239,122,122,.8);outline-offset:-8px}
.nk-off::before{content:"HIDDEN FROM VISITORS";position:absolute;z-index:60;left:50%;top:14px;transform:translateX(-50%);padding:7px 14px;border-radius:999px;background:#ef7a7a;color:#fff;font:600 11px/1 system-ui,sans-serif;letter-spacing:.14em}
.nk-flash{animation:nkFlash 1.6s ease}
@keyframes nkFlash{0%,30%{box-shadow:inset 0 0 0 3px rgba(241,201,107,.95)}100%{box-shadow:inset 0 0 0 3px rgba(241,201,107,0)}}`;
  fd.head.appendChild(st);
}

function wireFrame(fw, fd) {
  const stop = e => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); };
  fw.addEventListener('click', e => {
    const t = e.target;
    if (S.editing && S.editing.contains(t)) { e.stopPropagation(); e.stopImmediatePropagation(); if (t.closest('a,button')) e.preventDefault(); return; }
    stop(e);
    if (S.editing) endEdit();
    const hit = targetOf(t);
    if (!hit) return;
    if (hit.kind === 'text') startEdit(hit.el, e);
    else if (hit.kind === 'media') openMediaFor(hit.el);
    else if (hit.kind === 'podcast') showPanel('podcasts', { focus: +hit.el.dataset.podcast });
    else if (hit.kind === 'link') showPanel('links', { focus: hit.el.dataset.l || hit.el.dataset.cfgHref });
  }, true);
  ['submit', 'dragstart', 'dblclick', 'auxclick'].forEach(ev => fw.addEventListener(ev, e => { if (!(S.editing && S.editing.contains(e.target) && ev === 'dblclick')) stop(e); }, true));
  fw.addEventListener('pointerdown', e => { if (!(S.editing && S.editing.contains(e.target)) && e.target.closest && e.target.closest('a,button')) e.preventDefault(); }, true);
  fd.addEventListener('mouseover', e => { const hit = targetOf(e.target); if (hit && !(S.editing && S.editing === hit.el)) showHover(hit); else if (!hit) hideHover(); }, true);
  fd.addEventListener('mouseleave', hideHover);
  fw.addEventListener('scroll', () => requestAnimationFrame(() => { if (S.editing) placeToolbar(S.editing); if (S.hover) placeHover(S.hover); }), { passive: true });
  fw.addEventListener('resize', () => { if (S.editing) placeToolbar(S.editing); });
  fd.addEventListener('keydown', e => {
    const mod = e.metaKey || e.ctrlKey;
    if (S.editing) {
      if (e.key === 'Enter') { e.preventDefault(); lineBreak(); return; }
      if (e.key === 'Escape') { e.preventDefault(); endEdit(); return; }
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); endEdit(); openPublish(); }
      if (mod && e.key.toLowerCase() === 'i') { e.preventDefault(); S.fd.execCommand('italic'); }
      return;
    }
    keys(e);
  }, true);
  fd.addEventListener('input', () => { if (S.editing) onTextInput(); }, true);
  fd.addEventListener('paste', e => {
    if (!S.editing) return;
    e.preventDefault();
    const txt = (e.clipboardData || fw.clipboardData).getData('text/plain').replace(/\s*\n\s*/g, ' ');
    fd.execCommand('insertText', false, txt);
  }, true);
}

function targetOf(t) {
  if (!t || !t.closest) return null;
  const ed = t.closest('[data-e]'); if (ed) return { kind: 'text', el: ed };
  const m = t.closest('#heroMedia,[data-asset],[data-slot]'); if (m) return { kind: 'media', el: m };
  const p = t.closest('[data-podcast]'); if (p) return { kind: 'podcast', el: p };
  const a = t.closest('a[data-cfg-href],a[data-l]'); if (a) return { kind: 'link', el: a };
  return null;
}
function frameRect(el) {
  const r = el.getBoundingClientRect(), f = frame().getBoundingClientRect(), k = S.scale || 1;
  return { left: f.left + r.left * k, top: f.top + r.top * k, width: r.width * k, height: r.height * k, fTop: f.top, fBottom: f.bottom, fLeft: f.left, fRight: f.right };
}
/* Desktop preview: the site is laid out at 1280px wide and scaled to fit, so it shows the real desktop design */
const DESKTOP_W = 1280;
function fitFrame() {
  const dev = $('#device'), fr = frame(); if (!dev || !fr) return;
  const w = dev.clientWidth, h = dev.clientHeight;
  if (S.device === 'desktop' && w < DESKTOP_W) {
    S.scale = w / DESKTOP_W;
    Object.assign(fr.style, { width: `${DESKTOP_W}px`, height: `${h / S.scale}px`, transform: `scale(${S.scale})` });
  } else {
    S.scale = 1;
    Object.assign(fr.style, { width: '100%', height: '100%', transform: '' });
  }
}
function showHover(hit) { S.hover = hit; placeHover(hit); }
function placeHover(hit) {
  const box = $('#hoverBox'), r = frameRect(hit.el);
  const top = Math.max(r.top, r.fTop), bottom = Math.min(r.top + r.height, r.fBottom);
  if (bottom - top < 4) { box.hidden = true; return; }
  box.hidden = false;
  box.className = `hover-box ${hit.kind === 'text' ? 'text' : ''} ${top - r.fTop < 36 ? 'below' : ''}`;
  Object.assign(box.style, { left: `${Math.max(r.left, r.fLeft)}px`, top: `${top}px`, width: `${Math.min(r.width, r.fRight - Math.max(r.left, r.fLeft))}px`, height: `${bottom - top}px` });
  const label = hit.kind === 'text' ? `✎ ${labelFor(hit.el)}` : hit.kind === 'media' ? `${mediaLabel(hit.el)}` : hit.kind === 'podcast' ? 'Edit podcasts' : 'Edit this link';
  $('.hb-chip', box).textContent = label;
}
function hideHover() { S.hover = null; const b = $('#hoverBox'); if (b) b.hidden = true; }

const GROUP_LABEL = { home: 'Hero', ribbon: 'Ribbon', about: 'About', numbers: 'Numbers', speaker: 'Speaker', reel: 'Speaker', books: 'Books', library: 'Books', trilogy: 'Books', leadership: 'Leadership', honors: 'Honors', rail: 'Honors', impact: 'Impact', media: 'Media', magazines: 'Magazines', gallery: 'Gallery', appointments: 'Appointments', contact: 'Contact', footer: 'Footer', menu: 'Menu', topbar: 'Top bar', tabbar: 'Phone tab bar', site: 'Site', link: 'Link' };
const TAG_LABEL = { h1: 'Main title', h2: 'Heading', h3: 'Subheading', h4: 'Subheading', p: 'Paragraph', li: 'List item', blockquote: 'Quote', figcaption: 'Caption', small: 'Small text', cite: 'Credit', label: 'Label' };
function labelFor(el) {
  const g = GROUP_LABEL[(el.dataset.e || '').split('.')[0]] || 'Text';
  const inBtn = el.closest('button,.btn,.act,.btn-tarot');
  const kind = inBtn ? 'Button' : el.closest('a') ? 'Link text' : el.closest('.label,.eyebrow,.kicker') ? 'Label' : TAG_LABEL[el.tagName.toLowerCase()] || (el.hasAttribute('data-count') || el.closest('.v') ? 'Number' : 'Text');
  return `${g} · ${kind}`;
}

/* ---------------------------------------------------------------------------
   Text editing
   ------------------------------------------------------------------------ */
const ALLOWED = new Set(['em', 'b', 'strong', 'br', 'span', 'small', 'cite', 'sup', 'sub']);
function cleanHtml(htmlStr) {
  const t = document.createElement('template');
  t.innerHTML = String(htmlStr || '');
  const walk = node => [...node.childNodes].forEach(n => {
    if (n.nodeType === 3) return;
    if (n.nodeType !== 1) { n.remove(); return; }
    let tag = n.tagName.toLowerCase();
    if (tag === 'i') tag = 'em';
    if (tag === 'div' || tag === 'p') { walk(n); const f = document.createDocumentFragment(); if (n.previousSibling) f.append(document.createElement('br')); f.append(...n.childNodes); n.replaceWith(f); return; }
    if (!ALLOWED.has(tag)) { walk(n); n.replaceWith(...n.childNodes); return; }
    const el = document.createElement(tag);
    const cls = n.getAttribute('class');
    if (cls && /^[\w\s-]+$/.test(cls)) el.setAttribute('class', cls.replace(/\bnk-\S+/g, '').trim() || cls);
    if (!el.getAttribute('class')) el.removeAttribute('class');
    const cnt = n.getAttribute('data-count'); if (cnt && /^\d{1,7}$/.test(cnt)) el.setAttribute('data-count', cnt);
    el.append(...n.childNodes); n.replaceWith(el); walk(el);
  });
  walk(t.content);
  return t.innerHTML.replace(/&nbsp;/g, ' ').replace(/(\s*<br>\s*)+$/, '').trim();
}
const norm = s => cleanHtml(s).replace(/\s+/g, ' ').trim();

function startEdit(el, ev) {
  if (S.editing === el) return;
  if (S.editing) endEdit();
  hideHover();
  S.editing = el; S.editBefore = JSON.stringify(S.draft);
  el.contentEditable = 'true'; el.spellcheck = true;
  el.focus({ preventScroll: true });
  const sel = S.fw.getSelection();
  let range = null;
  if (ev && S.fd.caretRangeFromPoint) range = S.fd.caretRangeFromPoint(ev.clientX, ev.clientY);
  if (!range || !el.contains(range.startContainer)) { range = S.fd.createRange(); range.selectNodeContents(el); range.collapse(false); }
  sel.removeAllRanges(); sel.addRange(range);
  showToolbar(el);
  $('#stageHint').classList.add('gone');
}
const onTextInput = debounce(() => { if (S.editing) commitText(S.editing); }, 250);
function commitText(el) {
  const key = el.dataset.e, v = cleanHtml(el.innerHTML), def = S.defText[key];
  if (def !== undefined && norm(v) === norm(def)) delete S.draft.text[key]; else S.draft.text[key] = v;
  if (el.hasAttribute('data-count')) { const n = el.textContent.match(/\d+/); if (n) el.dataset.count = n[0]; }
  autosave(); updateStatus(); refreshBadges();
}
function endEdit() {
  const el = S.editing; if (!el) return;
  el.contentEditable = 'false'; el.removeAttribute('contenteditable');
  const v = cleanHtml(el.innerHTML);
  if (el.innerHTML !== v) el.innerHTML = v;
  commitText(el);
  S.editing = null;
  pushUndo(S.editBefore); S.editBefore = null;
  hideToolbar(); markChanged();
  try { S.fw.getSelection().removeAllRanges(); } catch (e) { /* frame gone */ }
}
function lineBreak() {
  if (!S.fd.execCommand('insertLineBreak')) S.fd.execCommand('insertHTML', false, '<br>');
}
function markChanged() {
  if (!S.fd) return;
  $$('[data-e]', S.fd).forEach(el => el.classList.toggle('nk-changed', el.dataset.e in S.draft.text));
}
function applyTextsToFrame() {
  if (!S.fd) return;
  $$('[data-e]', S.fd).forEach(el => {
    const want = S.draft.text[el.dataset.e] !== undefined ? S.draft.text[el.dataset.e] : S.defText[el.dataset.e];
    if (want !== undefined && el.innerHTML !== want) el.innerHTML = want;
  });
  markChanged();
}
function applyHiddenToFrame() {
  if (!S.fd) return;
  SECTIONS.forEach(([id]) => { const s = S.fd.getElementById(id); if (s) s.classList.toggle('nk-off', S.draft.hidden.includes(id)); });
}

function showToolbar(el) {
  const tb = $('#toolbar'); tb.hidden = false;
  $('#tbLabel').textContent = labelFor(el);
  $('[data-cmd="link"]', tb).hidden = !el.closest('a[data-l],a[data-cfg-href]');
  $('[data-cmd="reset"]', tb).hidden = !(el.dataset.e in S.draft.text) && !(S.defText[el.dataset.e] !== undefined && norm(el.innerHTML) !== norm(S.defText[el.dataset.e]));
  placeToolbar(el);
}
function placeToolbar(el) {
  const tb = $('#toolbar'); if (tb.hidden) return;
  const r = frameRect(el), w = tb.offsetWidth, h = tb.offsetHeight;
  let top = r.top - h - 12;
  if (top < r.fTop + 6) top = r.top + r.height + 12;
  top = Math.min(Math.max(top, r.fTop + 6), r.fBottom - h - 6);
  const left = Math.min(Math.max(r.left, r.fLeft + 6), r.fRight - w - 6);
  tb.style.left = `${left}px`; tb.style.top = `${top}px`;
}
function hideToolbar() { $('#toolbar').hidden = true; }
function initToolbar() {
  const tb = $('#toolbar');
  tb.addEventListener('mousedown', e => e.preventDefault());
  tb.addEventListener('click', e => {
    const b = e.target.closest('[data-cmd]'); if (!b || !S.editing) return;
    const c = b.dataset.cmd, el = S.editing;
    if (c === 'bold') S.fd.execCommand('bold');
    if (c === 'italic') S.fd.execCommand('italic');
    if (c === 'br') lineBreak();
    if (c === 'clear') { S.fd.execCommand('removeFormat'); }
    if (c === 'reset') { const d = S.defText[el.dataset.e]; if (d !== undefined) { el.innerHTML = d; commitText(el); toast('Back to the original text'); } }
    if (c === 'link') { const a = el.closest('a[data-l],a[data-cfg-href]'); endEdit(); showPanel('links', { focus: a.dataset.l || a.dataset.cfgHref }); return; }
    if (c === 'done') { endEdit(); toast('Saved to your draft'); return; }
    onTextInput();
    showToolbar(el);
  });
}

/* ---------------------------------------------------------------------------
   Photos & videos: what can be changed, and where
   ------------------------------------------------------------------------ */
const CARDS = [
  { id: 'hero', type: 'slot', path: 'hero', title: 'Hero portrait', group: 'Portraits', section: 'home', crop: '4:5', fields: ['alt'], img: true },
  { id: 'aboutP', type: 'slot', path: 'about.portrait', title: 'About · arch portrait', group: 'Portraits', section: 'about', crop: '4:5', fields: ['alt'], img: true },
  { id: 'aboutS', type: 'slot', path: 'about.second', title: 'About · small photo', group: 'Portraits', section: 'about', crop: '3:4', fields: ['alt'], img: true },
  { id: 'contactP', type: 'slot', path: 'contact.portrait', title: 'Contact portrait', group: 'Portraits', section: 'contact', crop: '4:5', fields: ['alt'], img: true },
  { id: 'reel', type: 'list', path: 'speaker.slides', title: 'On stage slideshow', group: 'Speaker', section: 'speaker', fields: ['alt'], video: true },
  { id: 'strip', type: 'list', path: 'stageStrip', title: 'Speaker photo strip', group: 'Speaker', section: 'speaker', fields: ['alt'], shape: true },
  { id: 'books', type: 'slots', path: 'books', title: 'Book covers', group: 'Books', section: 'books', fit: true, fields: ['alt'], img: true,
    labels: { cover: 'Cosmic Map of Answers', motherBlessing: 'Mother: A Divine Blessing', motherGift: 'Mother: A Divine Gift', motherCreation: 'Mother: A Divine Creation', gwb: 'Gratitude, Wisdom & Blessing' } },
  { id: 'logos', type: 'slots', path: 'leadership', title: 'Organisation logos', group: 'Leadership', section: 'leadership', fit: true, fields: ['alt'], img: true,
    labels: { quest: 'Quest International School', waaf: 'World Academic Achievers Forum', ydc: 'Youth Diplomatic Conclave', gwac: 'The Global Women Achievers Circle' } },
  { id: 'honors', type: 'list', path: 'honors.photos', title: 'Moments of Honor photos', group: 'Honors', section: 'honors', fields: ['alt', 'caption'], fixed: true, img: true },
  { id: 'impact', type: 'list', path: 'impact', title: 'Impact mosaic', group: 'Impact', section: 'impact', fields: ['alt', 'caption'], video: true, span: true },
  { id: 'feature', type: 'slot', path: 'media.featured', title: 'Media · featured photo', group: 'Media', section: 'media', fields: ['alt', 'caption'], img: true },
  { id: 'mi', type: 'list', path: 'mediaInteractions', title: 'Media interactions & panels', group: 'Media', section: 'media', fields: ['alt'], video: true },
  { id: 'mags', type: 'list', path: 'magazines', title: 'Magazine covers & features', group: 'Magazines', section: 'magazines', fields: ['alt'], fit: true, img: true },
  { id: 'galA', type: 'list', path: 'galleryA', title: 'Gallery · first row', group: 'Gallery', section: 'gallery', fields: ['alt'], video: true, shape: true },
  { id: 'galB', type: 'list', path: 'galleryB', title: 'Gallery · second row', group: 'Gallery', section: 'gallery', fields: ['alt'], video: true, shape: true }
];
const card = id => CARDS.find(c => c.id === id);
function cardFor(path) {
  let best = null;
  CARDS.forEach(c => { if (path === c.path || path.startsWith(`${c.path}.`)) if (!best || c.path.length > best.path.length) best = c; });
  if (!best) return null;
  const rest = path === best.path ? null : path.slice(best.path.length + 1);
  return { c: best, focus: rest };
}
function itemsOf(c) {
  const v = getPath(S.assets || {}, c.path);
  if (c.type === 'slot') return v ? [{ key: null, item: v }] : [];
  if (c.type === 'slots') return Object.keys(c.labels).filter(k => v && v[k]).map(k => ({ key: k, item: v[k], label: c.labels[k] }));
  return (Array.isArray(v) ? v : []).map((item, i) => ({ key: String(i), item }));
}
function mediaLabel(el) {
  if (el.id === 'heroMedia') return '📷 Change the hero photo';
  const p = el.dataset.asset || el.dataset.slot || '';
  const f = cardFor(p);
  if (!f) return '📷 Change photo';
  return f.c.type === 'list' ? `▦ ${f.c.title}` : `📷 ${f.c.title}`;
}
function openMediaFor(el) {
  hideHover();
  if (el.id === 'heroMedia') return showPanel('photos', { card: 'hero' });
  let p = el.dataset.asset || el.dataset.slot || '';
  if (p === 'speaker.slides') { const on = $('.slide.is-on', el); p = `speaker.slides.${on ? on.dataset.slide : 0}`; }
  const f = cardFor(p);
  if (f) showPanel('photos', { card: f.c.id, focus: f.focus });
}

/** Change one photo group. The whole top-level ASSETS entry is copied into the draft. */
function commitAssets(c, mutate, { reload = true } = {}) {
  const prev = JSON.stringify(S.draft);
  const top = c.path.split('.')[0];
  const obj = clone(S.assets[top]);
  mutate(obj, c.path.includes('.') ? c.path.split('.').slice(1).join('.') : null);
  S.assets[top] = obj;
  if (S.defaults && stable(obj) === stable(S.defaults.ASSETS[top])) delete S.draft.assets[top]; else S.draft.assets[top] = obj;
  afterChange({ reload, prev });
}
const listIn = (obj, sub) => (sub ? getPath(obj, sub) : obj);

/* ---------------------------------------------------------------------------
   Media picker: links from the owner's own Cloudinary (upload there, paste here)
   ------------------------------------------------------------------------ */
function pickMedia({ multiple = false, video = false, title = 'Choose a photo' } = {}) {
  return new Promise(resolve => {
    let chosen = [];
    const box = openLayer(`<div class="m-head"><div><p class="eyebrow">YOUR PHOTOS, YOUR CLOUDINARY</p><h2>${esc(title)}</h2></div><button class="ic-btn" data-close aria-label="Close">${icon('x')}</button></div>
      <div class="m-body">
        <p style="color:var(--m);margin:0 0 14px">New photos${video ? ' and videos' : ''} live in <b style="color:var(--t);font-weight:400">your own Cloudinary account</b>, so they always belong to you. It takes a few seconds:</p>
        <ol class="howto">
          <li><span>1</span><div><b>Open your Cloudinary</b><small>Sign in at cloudinary.com and go to <em>Media Library</em>.</small></div><a class="btn sm" href="https://console.cloudinary.com/" target="_blank" rel="noopener">${icon('ext')}Open</a></li>
          <li><span>2</span><div><b>Upload</b><small>Click <em>Upload</em> and choose the ${video ? 'photo or video' : 'photo'} from your phone or computer.</small></div></li>
          <li><span>3</span><div><b>Copy its link</b><small>Hover over it and click the link icon (<em>Copy URL</em>). The link starts with https://res.cloudinary.com/</small></div></li>
          <li><span>4</span><div><b>Paste it below</b><small>${multiple ? 'Several at once? Put one link on each line.' : 'The preview appears straight away.'}</small></div></li>
        </ol>
        <label class="f"><span>CLOUDINARY LINK${multiple ? 'S' : ''}</span>${multiple ? '<textarea id="lnk" rows="3" placeholder="https://res.cloudinary.com/…/image/upload/…"></textarea>' : '<input id="lnk" type="url" placeholder="https://res.cloudinary.com/…/image/upload/…">'}<small class="err-t" id="lerr"></small></label>
        <div class="lprev" id="lprev"><p class="empty">Your preview appears here</p></div>
      </div>
      <div class="m-foot"><span class="sp">${icon('sparkles')} Sizes and formats are optimised automatically for every screen.</span><button class="btn" data-close>Cancel</button><button class="gold-btn" id="pkUse" disabled>Use ${multiple ? 'these' : 'this'}</button></div>`, { onClose: () => resolve(null) });
    const inp = $('#lnk', box), use = $('#pkUse', box), prev = $('#lprev', box), err = $('#lerr', box);
    const check = () => {
      const lines = inp.value.split(/[\s,]+/).map(x => x.trim()).filter(Boolean);
      const good = [], bad = [];
      lines.forEach(v => { (isCdn(v) && (video || !isVideo(v)) ? good : bad).push(v); });
      chosen = (multiple ? good : good.slice(0, 1)).map(v => ({ url: v, type: isVideo(v) ? 'video' : 'image' }));
      err.textContent = bad.length ? (bad.some(isCdn) ? 'Videos can’t go here: please use a photo link.' : 'That isn’t a Cloudinary link yet. Copy the link from your Cloudinary Media Library (it starts with https://res.cloudinary.com/).') : '';
      prev.innerHTML = chosen.length ? `<div class="lgrid">${chosen.map(c => `<span><img src="${esc(preview(c.url, 500))}" alt="">${c.type === 'video' ? `<i>${icon('play')}</i>` : ''}</span>`).join('')}</div>` : '<p class="empty">Your preview appears here</p>';
      $$('img', prev).forEach(im => im.addEventListener('error', () => { err.textContent = 'This link doesn’t open. Check that the photo is uploaded and the link is copied in full.'; chosen = []; use.disabled = true; }));
      use.disabled = !chosen.length;
      use.textContent = chosen.length > 1 ? `Use ${chosen.length} items` : `Use ${multiple ? 'these' : 'this'}`;
    };
    inp.addEventListener('input', check);
    use.addEventListener('click', () => { const r = chosen.slice(); closeLayer(true); resolve(r); });
  });
}

/* ---------------------------------------------------------------------------
   Panels
   ------------------------------------------------------------------------ */
const SECTIONS = [['home', 'Hero', 'The first screen'], ['about', 'About', 'Her story & mission'], ['speaker', 'Speaker', 'On stage, formats, stages'], ['books', 'Books', 'Cosmic Map & the library'],
  ['leadership', 'Leadership', 'Roles & organisations'], ['honors', 'Moments of Honor', 'Awards & recognition'], ['impact', 'Impact', 'Community work'], ['media', 'Media & Podcasts', 'Interviews, panels, podcasts'],
  ['magazines', 'Magazines', 'Covers & features'], ['gallery', 'Gallery', 'Life in frames'], ['appointments', 'Appointments', 'Sessions & bookings'], ['contact', 'Contact', 'Invitations & enquiries']];
const SECTION_GROUPS = { home: ['home', 'ribbon'], about: ['about', 'numbers'], speaker: ['speaker', 'reel'], books: ['books', 'library', 'trilogy'], leadership: ['leadership'], honors: ['honors', 'rail'], impact: ['impact'], media: ['media'], magazines: ['magazines'], gallery: ['gallery'], appointments: ['appointments'], contact: ['contact'] };

function showPanel(name, arg = null, keep = false) {
  if (S.editing && !keep) endEdit();
  S.panel = name; S.arg = arg;
  $$('#rail [data-panel]').forEach(b => b.setAttribute('aria-current', String(b.dataset.panel === name)));
  const p = $('#panel');
  const scroll = keep ? p.scrollTop : 0;
  p.innerHTML = '';
  ({ overview: pOverview, sections: pSections, photos: pPhotos, podcasts: pPodcasts, links: pLinks, seo: pSeo, health: pHealth, domain: pDomain })[name](p, arg || {});
  if (keep) p.scrollTop = scroll;
  refreshBadges();
}
function refreshBadges() {
  const ch = changes();
  const has = k => ch.some(c => k.includes(c.kind));
  const map = { sections: ['text', 'sections'], photos: ['photos'], podcasts: ['podcasts'], links: ['contact', 'link'], seo: ['google'] };
  $$('#rail [data-panel]').forEach(b => {
    const on = map[b.dataset.panel] && has(map[b.dataset.panel]);
    let d = $('.dot', b);
    if (on && !d) { d = document.createElement('i'); d.className = 'dot'; b.appendChild(d); }
    if (!on && d) d.remove();
  });
}
function scrollToSection(id, flash = true) {
  whenReady(() => {
    const s = S.fd.getElementById(id); if (!s) return;
    S.fw.scrollTo({ top: s.getBoundingClientRect().top + S.fw.scrollY - (id === 'home' ? 0 : 10), behavior: 'smooth' });
    if (flash) { s.classList.remove('nk-flash'); void s.offsetWidth; s.classList.add('nk-flash'); }
  });
}
function scrollToEl(el, cb) {
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  setTimeout(() => cb && cb(), 650);
}

function countPhotos() {
  let n = 0;
  const walk = v => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if (typeof v.src === 'string' && v.enabled !== false) n++; Object.values(v).forEach(x => typeof x === 'object' && walk(x)); } };
  walk(S.assets || {});
  return n - (S.assets && S.assets.menu ? 0 : 0);
}

function pOverview(p) {
  const texts = S.fd ? $$('[data-e]', S.fd).length : Object.keys(S.defText).length;
  const photos = S.assets ? countPhotos() : 0;
  const pods = (S.podcastsNow || []).length;
  const score = health().score;
  p.innerHTML = `<div class="welcome"><p class="eyebrow">YOUR STUDIO</p><h2>${greeting()}, <em>${esc(S.me.user)}.</em></h2>
    <p class="sub">Everything on your website is yours to shape. Nothing changes for visitors until you press <b>Publish</b>, and every published version is kept.</p></div>
    <div class="stats">
      <div class="stat card"><b data-n="${texts}">0</b><span>texts you can edit</span></div>
      <div class="stat card"><b data-n="${photos}">0</b><span>photos &amp; videos</span></div>
      <div class="stat card"><b data-n="${pods}">0</b><span>podcasts</span></div>
      <div class="stat card"><b data-n="${SECTIONS.length}">0</b><span>sections</span></div>
    </div>
    <button class="live-card card hov" type="button" data-go="health" style="width:100%;text-align:left">
      <div class="ring">${ringSvg(score)}<b>${score}</b></div>
      <div><strong>Site health ${score >= 90 ? 'is excellent' : score >= 70 ? 'is good' : 'needs a look'}</strong><p>${S.saved.updatedAt ? `Last published ${esc(rel(S.saved.updatedAt))}` : 'Showing the original website'} · see details</p></div>
    </button>
    <button class="live-card card hov" type="button" data-go="domain" style="width:100%;text-align:left;margin-top:8px">
      <div class="dom-dot"><i></i></div>
      <div><strong>${esc(domainName())}</strong><p>Connected · secured with HTTPS · see your domain</p></div>
    </button>
    <p class="group-t">QUICK ACTIONS</p>
    <div class="quick">
      ${quick('image', 'Change the hero photo', 'The first thing visitors see', 'photos:hero')}
      ${quick('link', 'Update contact details', 'WhatsApp, email, social links', 'links')}
      ${quick('mic', 'Add a podcast', 'Paste a YouTube link', 'podcasts')}
      ${quick('book', 'Add a magazine page', 'Covers and features', 'photos:mags')}
      ${quick('clock', 'Version history', 'Go back to any published version', 'history')}
    </div>
    ${supportLink() ? `<p class="group-t">YOUR WEB TEAM</p><a class="card hov help-card" href="${esc(supportLink('Hello, I need a little help with my website.'))}" target="_blank" rel="noopener"><span class="qi">${icon('sparkles')}</span><span><b>Need anything? ${esc(S.me.support.name)} is here.</b><small>Message your web team, any time.</small></span></a>` : ''}
    <p class="group-t">GOOD TO KNOW</p>
    <ul class="tips">
      <li>${icon('sparkles')}<span>Click any text in the preview to edit it. A green outline marks what you changed.</span></li>
      <li>${icon('image')}<span>Click any photo to replace it, or drag photos to reorder them.</span></li>
      <li>${icon('cmd')}<span><kbd>Ctrl</kbd> <kbd>K</kbd> finds anything · <kbd>Ctrl</kbd> <kbd>Z</kbd> undoes · <kbd>Ctrl</kbd> <kbd>S</kbd> publishes</span></li>
    </ul>`;
  $$('.stat b', p).forEach(countUp);
  requestAnimationFrame(() => { const fg = $('.ring .fg', p); if (fg) fg.style.strokeDashoffset = fg.dataset.to; });
  bindGo(p);
}
const quick = (ic, t, s, go) => `<button class="card hov" type="button" data-go="${go}"><span class="qi">${icon(ic)}</span><span><b>${t}</b><small>${s}</small></span></button>`;
function ringSvg(score) {
  const C = 2 * Math.PI * 24;
  return `<svg viewBox="0 0 58 58"><circle class="bg" cx="29" cy="29" r="24"/><circle class="fg" cx="29" cy="29" r="24" stroke-dasharray="${C}" stroke-dashoffset="${C}" data-to="${C * (1 - score / 100)}"/></svg>`;
}
function bindGo(p) {
  $$('[data-go]', p).forEach(b => b.addEventListener('click', () => {
    const g = b.dataset.go;
    if (g === 'history') return openHistory();
    const [panel, c] = g.split(':');
    showPanel(panel, c ? { card: c } : null);
  }));
}

function pSections(p) {
  const ch = changes().filter(c => c.kind === 'text');
  p.innerHTML = `<p class="eyebrow">SECTIONS</p><h2>Your <em>page,</em> top to bottom.</h2><p class="sub">Tap a section to jump to it. Switch one off to hide it from visitors (you can bring it back any time).</p>
    <div class="sec-list">${SECTIONS.map(([id, name, sub], i) => {
      const n = ch.filter(c => (SECTION_GROUPS[id] || []).includes(c.key.split('.')[0])).length;
      const off = S.draft.hidden.includes(id);
      return `<div class="sec card hov ${off ? 'off' : ''}" data-sec="${id}" role="button" tabindex="0"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="nm"><b>${name}</b><small>${off ? 'Hidden from visitors' : sub}</small></span>${n ? `<span class="badge">${n} edited</span>` : ''}<button class="switch" type="button" role="switch" aria-checked="${!off}" aria-label="Show ${name}" ${id === 'home' ? 'disabled' : ''}></button></div>`;
    }).join('')}</div>
    <p class="group-t">ON EVERY PAGE VIEW</p>
    <div class="quick">
      <button class="card hov" type="button" data-x="menu"><span class="qi">${icon('menu')}</span><span><b>Edit the menu</b><small>Opens the menu in the preview</small></span></button>
      <button class="card hov" type="button" data-x="footer"><span class="qi">${icon('layers')}</span><span><b>Edit the footer</b><small>Bottom of the page</small></span></button>
      <button class="card hov" type="button" data-x="phone"><span class="qi">${icon('phone')}</span><span><b>Edit the phone tab bar</b><small>Switches the preview to phone size</small></span></button>
    </div>`;
  $$('.sec', p).forEach(row => {
    const id = row.dataset.sec;
    row.addEventListener('click', e => { if (e.target.closest('.switch')) return; scrollToSection(id); });
    row.addEventListener('keydown', e => { if (e.key === 'Enter') scrollToSection(id); });
    $('.switch', row).addEventListener('click', () => {
      const prev = JSON.stringify(S.draft);
      const off = S.draft.hidden.includes(id);
      S.draft.hidden = off ? S.draft.hidden.filter(x => x !== id) : [...S.draft.hidden, id];
      applyHiddenToFrame();
      afterChange({ prev });
      toast(off ? `${SECTIONS.find(s => s[0] === id)[1]} will be shown` : `${SECTIONS.find(s => s[0] === id)[1]} will be hidden from visitors`);
      showPanel('sections', null, true);
      scrollToSection(id, false);
    });
  });
  $$('[data-x]', p).forEach(b => b.addEventListener('click', () => {
    const x = b.dataset.x;
    if (x === 'menu') openFrameMenu();
    if (x === 'footer') whenReady(() => { const f = $('.footer', S.fd); if (f) S.fw.scrollTo({ top: S.fd.documentElement.scrollHeight, behavior: 'smooth' }); });
    if (x === 'phone') setDevice('phone');
  }));
}
function openFrameMenu() {
  whenReady(() => {
    try { S.fw.NK.openMenu(); S.menuOpen = true; } catch (e) { return; }
    showBanner(`${icon('menu')}<span>The menu is open in the preview. Click any menu text to edit it.</span><span class="sp"></span><button class="gold-btn" style="height:32px" type="button" data-banner="menu-close">Close the menu</button>`);
  });
}
function closeFrameMenu() { try { S.fw.NK.closeMenu(); } catch (e) { /* ignore */ } S.menuOpen = false; $('#banner').hidden = true; }

function pPhotos(p, arg) {
  if (arg.card) return pCard(p, card(arg.card), arg.focus);
  const groups = [...new Set(CARDS.map(c => c.group))];
  p.innerHTML = `<p class="eyebrow">PHOTOS &amp; VIDEOS</p><h2>Every <em>picture,</em> in one place.</h2><p class="sub">Replace, reorder, add or remove. You can also click any photo in the preview.</p><div class="note card">${icon('image')}<span>New photos go in <b>your own Cloudinary</b>: upload there, copy the link, paste it here. We’ll guide you each time.</span></div>` +
    groups.map(g => `<p class="group-t">${g.toUpperCase()}</p>` + CARDS.filter(c => c.group === g).map(c => {
      const its = S.assets ? itemsOf(c) : [];
      const changed = S.draft.assets[c.path.split('.')[0]] !== undefined;
      return `<button class="coll card hov" type="button" data-card="${c.id}"><div class="coll-h"><b>${esc(c.title)}</b><small>${changed ? '<span style="color:var(--warn)">● </span>' : ''}${c.type === 'list' ? plural(its.length, 'item') : its.length > 1 ? plural(its.length, 'photo') : 'Single photo'}</small></div>
        <div class="mosaic">${its.slice(0, 5).map((x, i) => i === 4 && its.length > 5 ? `<span class="more">+${its.length - 4}</span>` : `<span><img src="${esc(thumb(x.item.src, 120, c.fit))}" alt="" loading="lazy"></span>`).join('')}</div></button>`;
    }).join('')).join('');
  $$('[data-card]', p).forEach(b => b.addEventListener('click', () => showPanel('photos', { card: b.dataset.card })));
}

function pCard(p, c, focus) {
  const its = itemsOf(c);
  if (focus == null) focus = its.length ? its[0].key : null;
  if (c.type !== 'slot' && focus != null && !its.some(x => x.key === String(focus))) focus = its.length ? its[0].key : null;
  p.innerHTML = `<button class="back" type="button" data-back>${icon('left')}ALL PHOTOS</button><p class="eyebrow">${c.group.toUpperCase()}</p><h2>${esc(c.title)}</h2>
    <div class="note card">${icon('image')}<span>To use a new photo, upload it to <b>your Cloudinary</b>, copy its link and paste it here. <a href="https://console.cloudinary.com/" target="_blank" rel="noopener">Open Cloudinary</a></span></div><p class="sub">${c.type === 'list' ? (c.fixed ? 'Drag to reorder. Tap one to change it.' : 'Drag to reorder · tap one to change it · add as many as you like.') : c.type === 'slots' ? 'Tap one to change it.' : 'Replace it, and choose which part stays in view.'}</p>
    <div class="row-btns" style="margin:-6px 0 12px"><button class="btn sm" type="button" data-show>${icon('eye')}Show on the page</button>${S.draft.assets[c.path.split('.')[0]] !== undefined ? `<button class="btn sm danger" type="button" data-reset>${icon('rotate')}Back to original</button>` : ''}</div>
    ${c.type === 'slot' ? '' : `<div class="thumbs" id="thumbs">${its.map((x, i) => `<div class="thumb ${c.fit ? 'fit' : ''} ${String(x.key) === String(focus) ? 'is-sel' : ''}" draggable="${c.type === 'list'}" data-k="${x.key}" title="${esc(x.label || x.item.alt || '')}">
        <img src="${esc(thumb(x.item.src, 260, c.fit))}" alt="" loading="lazy">${c.type === 'list' ? `<span class="tn">${i + 1}</span>` : ''}${isVideo(x.item.src) ? `<span class="tv">${icon('play')}</span>` : ''}</div>`).join('')}
      ${c.type === 'list' && !c.fixed ? `<button class="thumb add" type="button" data-add><div>${icon('plus')}ADD</div></button>` : ''}</div>`}
    <div id="insp"></div>`;
  $('[data-back]', p).addEventListener('click', () => showPanel('photos'));
  $('[data-show]', p).addEventListener('click', () => scrollToSection(c.section));
  const rs = $('[data-reset]', p);
  if (rs) rs.addEventListener('click', () => {
    const prev = JSON.stringify(S.draft); const top = c.path.split('.')[0];
    delete S.draft.assets[top]; S.assets[top] = clone(S.defaults.ASSETS[top]);
    afterChange({ reload: true, prev }); toast(`${c.title}: back to the original`); showPanel('photos', { card: c.id }, true);
  });
  const sel = k => showPanel('photos', { card: c.id, focus: k }, true);
  $$('.thumb[data-k]', p).forEach(t => t.addEventListener('click', () => sel(t.dataset.k)));
  const add = $('[data-add]', p);
  if (add) add.addEventListener('click', async () => {
    const r = await pickMedia({ multiple: true, video: !!c.video, title: `Add to ${c.title}` });
    if (!r || !r.length) return;
    commitAssets(c, (obj, sub) => {
      const list = listIn(obj, sub);
      const maxOrder = Math.max(8, ...list.map(x => x.order || 0));
      r.forEach((m, i) => list.push({ type: m.type, src: m.url, alt: 'Dr. Navjot Kaur', ...(c.shape ? { ar: '4:5' } : {}), ...(c.span ? { order: maxOrder + i + 1, caption: '' } : {}), ...(c.fields.includes('caption') && !c.span ? { caption: '' } : {}) }));
    });
    toast(`${plural(r.length, 'item')} added. Add a short description so Google understands ${r.length > 1 ? 'them' : 'it'}.`);
    showPanel('photos', { card: c.id, focus: String(itemsOf(c).length - 1) }, true);
  });
  if (c.type === 'list') dragSort($('#thumbs', p), '.thumb[data-k]', (from, to) => {
    commitAssets(c, (obj, sub) => {
      const list = listIn(obj, sub);
      const orders = c.span ? list.map(x => x.order).sort((a, b) => a - b) : null;
      const [m] = list.splice(from, 1); list.splice(to, 0, m);
      if (orders) list.forEach((x, i) => { x.order = orders[i]; });
    });
    toast('New order saved to your draft');
    showPanel('photos', { card: c.id, focus: String(to) }, true);
  });
  const cur = c.type === 'slot' ? its[0] : its.find(x => String(x.key) === String(focus));
  if (cur) inspector($('#insp', p), c, cur);
}

function inspector(host, c, cur) {
  const it = cur.item, vid = isVideo(it.src);
  const sub = c.type === 'slot' ? null : cur.key;
  host.innerHTML = `<div class="insp card">
    <div class="insp-media" id="im">${vid ? `<img src="${esc(preview(it.src))}" alt=""><span class="tv" style="position:absolute;right:10px;top:10px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:rgba(15,13,19,.75)">${icon('play')}</span>` : `<img src="${esc(preview(it.src))}" alt="" id="imImg">`}${c.crop && !vid ? `<span class="focus-dot" id="dot"></span>` : ''}</div>
    ${c.crop && !vid ? `<div class="crop-row"><div class="crop-prev" style="aspect-ratio:${c.crop.replace(':', '/')}"><img id="cropImg" src="${esc(preview(it.src, 300))}" alt=""></div><p><b style="color:var(--t);font-weight:400">Focus point.</b> Drag the dot onto the face: that part always stays in view, on every screen size.</p></div>` : ''}
    <div class="row-btns"><button class="gold-btn" style="height:36px" type="button" data-rep>${icon('upload')}Replace</button>
      ${c.type === 'list' && !c.fixed ? `<button class="btn sm" type="button" data-mv="-1" title="Move earlier">${icon('left')}</button><button class="btn sm" type="button" data-mv="1" title="Move later">${icon('right')}</button><button class="btn sm danger" type="button" data-del>${icon('trash')}Remove</button>` : ''}</div>
    ${c.fields.includes('alt') ? `<label class="f"><span>DESCRIPTION <em>for Google &amp; screen readers</em></span><input data-f="alt" value="${esc(it.alt || '')}" maxlength="160" placeholder="e.g. Dr. Navjot Kaur receiving an award in Dubai"></label>` : ''}
    ${c.fields.includes('caption') ? `<label class="f"><span>CAPTION <em>shown on the page</em></span><input data-f="caption" value="${esc(it.caption || '')}" maxlength="120"></label>` : ''}
    ${c.span ? `<label class="f"><span>TILE SIZE</span><select data-f="span">${[['', 'Small square'], ['w2', 'Wide'], ['h2', 'Tall'], ['w2 h2', 'Large']].map(([v, l]) => `<option value="${v}" ${(it.span || '') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
    ${c.shape ? `<label class="f"><span>SHAPE</span><select data-f="ar">${[['4:5', 'Portrait'], ['3:4', 'Tall portrait'], ['1:1', 'Square']].map(([v, l]) => `<option value="${v}" ${(it.ar || '4:5') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
    <p class="help" style="font-size:.78rem;color:var(--m2);margin:6px 0 0;word-break:break-all">${vid ? 'Video' : 'Photo'} · ${esc((it.src.split('/').pop() || '').slice(0, 48))}</p></div>`;
  // The edited item inside its top-level group (e.g. "hero" itself, "about" → portrait, "speaker" → slides.2)
  const resolveTarget = obj => {
    const rest = c.path.split('.').slice(1);
    if (sub != null) rest.push(sub);
    return rest.length ? getPath(obj, rest.join('.')) : obj;
  };
  const apply = (mut, opts) => commitAssets(c, obj => mut(resolveTarget(obj)), opts);
  $('[data-rep]', host).addEventListener('click', async () => {
    const r = await pickMedia({ video: !!c.video, title: `Replace · ${cur.label || c.title}` });
    if (!r || !r[0]) return;
    apply(t => { t.src = r[0].url; t.type = r[0].type; if (c.crop) delete t.pos; });
    toast('Replaced. The preview is updating.');
    showPanel('photos', { card: c.id, focus: sub }, true);
  });
  $$('[data-f]', host).forEach(inp => inp.addEventListener('change', () => {
    const k = inp.dataset.f, v = inp.value.trim();
    apply(t => { t[k] = v; }, { reload: true });
    toast(k === 'alt' ? 'Description saved' : 'Saved');
  }));
  $$('[data-mv]', host).forEach(b => b.addEventListener('click', () => {
    const from = +sub, to = from + +b.dataset.mv, n = itemsOf(c).length;
    if (to < 0 || to >= n) return;
    commitAssets(c, (obj, sp) => { const list = listIn(obj, sp); const orders = c.span ? list.map(x => x.order).sort((a, z) => a - z) : null; const [m] = list.splice(from, 1); list.splice(to, 0, m); if (orders) list.forEach((x, i) => { x.order = orders[i]; }); });
    showPanel('photos', { card: c.id, focus: String(to) }, true);
  }));
  const del = $('[data-del]', host);
  if (del) del.addEventListener('click', () => {
    commitAssets(c, (obj, sp) => { listIn(obj, sp).splice(+sub, 1); });
    toast('Removed. Undo with Ctrl+Z if that was a mistake.');
    showPanel('photos', { card: c.id, focus: String(Math.max(0, +sub - 1)) }, true);
  });
  // Focus point
  const dot = $('#dot', host), img = $('#imImg', host), crop = $('#cropImg', host);
  if (dot && img) {
    const m = /(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/.exec(it.pos || '') || [0, 50, 30];
    let fx = +m[1], fy = +m[2];
    const place = () => {
      const ir = img.getBoundingClientRect(), hr = $('#im', host).getBoundingClientRect();
      dot.style.left = `${ir.left - hr.left + ir.width * fx / 100}px`; dot.style.top = `${ir.top - hr.top + ir.height * fy / 100}px`;
      if (crop) crop.style.objectPosition = `${fx}% ${fy}%`;
    };
    if (img.complete) place(); else img.addEventListener('load', place);
    let drag = false;
    const move = e => {
      const ir = img.getBoundingClientRect();
      fx = Math.round(Math.min(100, Math.max(0, (e.clientX - ir.left) / ir.width * 100)));
      fy = Math.round(Math.min(100, Math.max(0, (e.clientY - ir.top) / ir.height * 100)));
      place();
    };
    const im = $('#im', host);
    im.addEventListener('pointerdown', e => { drag = true; im.setPointerCapture(e.pointerId); move(e); });
    im.addEventListener('pointermove', e => { if (drag) move(e); });
    im.addEventListener('pointerup', () => { if (!drag) return; drag = false; apply(t => { t.pos = `${fx}% ${fy}%`; }); toast('Focus point saved'); });
  }
}

function dragSort(host, sel, onMove) {
  if (!host) return;
  let from = null;
  $$(sel, host).forEach((el, i) => {
    el.addEventListener('dragstart', e => { from = i; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(i)); } catch (x) { /* ignore */ } });
    el.addEventListener('dragend', () => { el.classList.remove('dragging'); $$(sel, host).forEach(x => x.classList.remove('over')); });
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('over'); if (from !== null && from !== i) onMove(from, i); from = null; });
  });
}

/* Podcasts */
function ytId(s) {
  s = String(s || '').trim();
  const m = /(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{6,20})/.exec(s);
  return m ? m[1] : /^[\w-]{11}$/.test(s) ? s : null;
}
function podList() { return clone(S.draft.podcasts || S.podcastsNow || (S.defaults && S.defaults.PODCASTS) || []); }
function setPods(list, { reload = true } = {}) {
  const prev = JSON.stringify(S.draft);
  if (S.defaults && stable(list) === stable(S.defaults.PODCASTS)) delete S.draft.podcasts; else S.draft.podcasts = list;
  S.podcastsNow = clone(list);
  afterChange({ reload, prev });
}
function pPodcasts(p, arg) {
  const list = podList();
  let n = 0;
  p.innerHTML = `<p class="eyebrow">PODCASTS &amp; INTERVIEWS</p><h2>Your <em>conversations.</em></h2><p class="sub">Paste a YouTube link to add an episode. Drag to reorder. Titles are optional.</p>
    <div class="f"><span>ADD FROM YOUTUBE</span><div class="in-row"><input id="ytIn" type="url" placeholder="https://youtu.be/…  or a Shorts link"><button class="gold-btn" style="height:42px" type="button" id="ytAdd">${icon('plus')}Add</button></div><small class="err-t" id="ytErr"></small></div>
    <div class="pods" id="pods">${list.map((x, i) => `<div class="pod card ${arg.focus === i ? 'is-sel' : ''}" draggable="true" data-i="${i}">
      <img src="https://i.ytimg.com/vi/${esc(x.id)}/mqdefault.jpg" alt="">
      <div><input data-t value="${esc(x.title || '')}" placeholder="${x.short ? 'Short' : `Episode ${String(++n).padStart(2, '0')}`} (title optional)" maxlength="120"><label><input type="checkbox" data-s ${x.short ? 'checked' : ''}> Vertical short</label></div>
      <div class="acts"><a class="ic-btn" href="https://youtu.be/${esc(x.id)}" target="_blank" rel="noopener" title="Watch on YouTube">${icon('play')}</a><button class="ic-btn" type="button" data-del title="Remove">${icon('trash')}</button></div></div>`).join('')}</div>
    ${list.length ? '' : '<p class="empty">No podcasts yet.</p>'}`;
  const add = () => {
    const id = ytId($('#ytIn', p).value);
    if (!id) { $('#ytErr', p).textContent = 'That doesn’t look like a YouTube link.'; return; }
    const l = podList(); l.push({ id, ...(/shorts\//.test($('#ytIn', p).value) ? { short: true } : {}) });
    setPods(l); toast('Podcast added'); showPanel('podcasts', null, true);
  };
  $('#ytAdd', p).addEventListener('click', add);
  $('#ytIn', p).addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  $$('.pod', p).forEach(row => {
    const i = +row.dataset.i;
    $('[data-t]', row).addEventListener('change', e => { const l = podList(); if (e.target.value.trim()) l[i].title = e.target.value.trim(); else delete l[i].title; setPods(l); toast('Title saved'); });
    $('[data-s]', row).addEventListener('change', e => { const l = podList(); if (e.target.checked) l[i].short = true; else delete l[i].short; setPods(l); showPanel('podcasts', null, true); });
    $('[data-del]', row).addEventListener('click', () => { const l = podList(); l.splice(i, 1); setPods(l); toast('Podcast removed'); showPanel('podcasts', null, true); });
  });
  dragSort($('#pods', p), '.pod', (from, to) => { const l = podList(); const [m] = l.splice(from, 1); l.splice(to, 0, m); setPods(l); showPanel('podcasts', null, true); });
  if (arg.focus != null) scrollToSection('media', false);
}

/* Contact & links */
const CFG_FIELDS = [
  ['WHATSAPP_NUMBER', 'WhatsApp number', 'Country code + number, digits only (e.g. 919814724488). Every order, booking and invitation goes here.', v => /^\d{10,15}$/.test(v), 'whatsapp'],
  ['CONTACT_EMAIL', 'Email', '', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'mailto'],
  ['CONTACT_PHONE', 'Phone (saved contact card)', 'With + and country code, e.g. +919814724488', v => /^\+\d{7,15}$/.test(v), 'tel'],
  ['CONTACT_PHONE_DISPLAY', 'Phone as shown', 'How the number is written, e.g. +91 98147 24488', v => v.length >= 6, null],
  ['INSTAGRAM_URL', 'Instagram link', '', v => /^https:\/\/(www\.)?instagram\.com\//.test(v), 'instagram'],
  ['LINKEDIN_URL', 'LinkedIn link', '', v => /^https:\/\/([a-z]+\.)?linkedin\.com\//.test(v), 'linkedin']
];
function pLinks(p, arg) {
  const cfg = S.config || {}, def = (S.defaults && S.defaults.CONFIG) || {};
  const val = k => (S.draft.config[k] !== undefined ? S.draft.config[k] : cfg[k] || def[k] || '');
  const links = S.fd ? $$('a[data-l]', S.fd) : [];
  const books = (def.BOOKS || []).filter(b => b.amazon || b.store);
  const bookVal = (b, k) => { const o = (S.draft.config.BOOKS || []).find(x => x.id === b.id); return o && o[k] !== undefined ? o[k] : b[k]; };
  p.innerHTML = `<p class="eyebrow">CONTACT &amp; LINKS</p><h2>How people <em>reach her.</em></h2><p class="sub">These update every button, form and link across the site at once.</p>
    ${CFG_FIELDS.map(([k, l, h]) => `<label class="f" data-cfg="${k}"><span>${l.toUpperCase()}<em class="saved-tick">${icon('check')}saved</em></span><input value="${esc(val(k))}" data-k="${k}"><small class="help">${h}</small></label>`).join('')}
    <p class="group-t">BOOK LINKS</p>
    ${books.map(b => `<label class="f"><span>${esc(b.title.toUpperCase())}</span><input value="${esc(bookVal(b, b.amazon ? 'amazon' : 'store'))}" data-book="${b.id}" data-bk="${b.amazon ? 'amazon' : 'store'}"><small class="help">${b.amazon ? 'Amazon link' : 'Online shop link'}</small></label>`).join('')}
    ${links.length ? `<p class="group-t">OTHER LINKS ON THE PAGE</p>${links.map(a => {
      const k = a.dataset.l, art = a.closest('article,.solo,.bk'), h = art && $('h3,h4', art);
      const v = S.draft.links[k] !== undefined ? S.draft.links[k] : S.defLinks[k] || a.getAttribute('href');
      return `<label class="f" data-lk="${k}"><span>${esc(((h && h.textContent.trim()) || 'Link').toUpperCase())} · ${esc(a.textContent.trim().toUpperCase())}</span><input value="${esc(v)}" data-l="${k}"></label>`;
    }).join('')}` : ''}`;
  $$('input[data-k]', p).forEach(inp => inp.addEventListener('change', () => {
    const k = inp.dataset.k, v = inp.value.trim(), f = CFG_FIELDS.find(x => x[0] === k);
    const lab = inp.closest('.f');
    if (v && !f[3](v)) { lab.classList.add('bad'); toast(`Please check the ${f[1].toLowerCase()}`, 'err'); return; }
    lab.classList.remove('bad');
    const prev = JSON.stringify(S.draft);
    if (!v || v === def[k]) delete S.draft.config[k]; else S.draft.config[k] = v;
    afterChange({ reload: true, prev });
    const t = $('.saved-tick', lab); t.classList.add('on'); setTimeout(() => t.classList.remove('on'), 1800);
  }));
  $$('input[data-book]', p).forEach(inp => inp.addEventListener('change', () => {
    const v = inp.value.trim();
    if (v && !/^https?:\/\//.test(v)) { inp.closest('.f').classList.add('bad'); toast('Links start with https://', 'err'); return; }
    inp.closest('.f').classList.remove('bad');
    const prev = JSON.stringify(S.draft), id = inp.dataset.book, k = inp.dataset.bk;
    const list = (S.draft.config.BOOKS || []).filter(b => b.id !== id);
    const d = def.BOOKS.find(b => b.id === id);
    if (v && v !== d[k]) list.push({ id, [k]: v });
    if (list.length) S.draft.config.BOOKS = list; else delete S.draft.config.BOOKS;
    afterChange({ reload: true, prev }); toast('Book link saved');
  }));
  $$('input[data-l]', p).forEach(inp => inp.addEventListener('change', () => {
    const v = inp.value.trim(), k = inp.dataset.l;
    if (v && !/^(https?:\/\/|mailto:|tel:)/.test(v)) { inp.closest('.f').classList.add('bad'); toast('Links start with https://', 'err'); return; }
    inp.closest('.f').classList.remove('bad');
    const prev = JSON.stringify(S.draft);
    if (!v || v === S.defLinks[k]) delete S.draft.links[k]; else S.draft.links[k] = v;
    afterChange({ reload: true, prev }); toast('Link saved');
  }));
  if (arg.focus) {
    const map = { whatsapp: 'WHATSAPP_NUMBER', mailto: 'CONTACT_EMAIL', tel: 'CONTACT_PHONE', instagram: 'INSTAGRAM_URL', linkedin: 'LINKEDIN_URL' };
    const el = map[arg.focus] ? $(`[data-cfg="${map[arg.focus]}"] input`, p) : arg.focus === 'amazon' ? $('input[data-book="cosmic"]', p) : $(`input[data-l="${arg.focus}"]`, p);
    if (el) setTimeout(() => { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.focus(); el.select(); }, 300);
  }
}

/* Google & sharing */
function pSeo(p) {
  const t = S.draft.seo.title !== undefined ? S.draft.seo.title : S.defSeo.title || '';
  const d = S.draft.seo.description !== undefined ? S.draft.seo.description : S.defSeo.description || '';
  p.innerHTML = `<p class="eyebrow">GOOGLE &amp; SHARING</p><h2>How the world <em>finds her.</em></h2><p class="sub">This is what appears on Google and when the site is shared on WhatsApp or social media.</p>
    <div class="serp"><div class="u">drnavjot.pages.dev</div><div class="t" id="sT"></div><div class="d" id="sD"></div></div>
    <label class="f"><span>PAGE TITLE <em id="cT"></em></span><input id="seoT" value="${esc(t)}" maxlength="120"></label>
    <label class="f"><span>DESCRIPTION <em id="cD"></em></span><textarea id="seoD" maxlength="320">${esc(d)}</textarea></label>
    <p class="help" style="font-size:.8rem;color:var(--m2)">Best results: a title of 30 to 60 characters, and a description of 120 to 160.</p>`;
  const upd = () => {
    const tv = $('#seoT', p).value, dv = $('#seoD', p).value;
    $('#sT', p).textContent = tv || 'Untitled'; $('#sD', p).textContent = dv;
    const cT = $('#cT', p), cD = $('#cD', p);
    cT.textContent = `${tv.length}/60`; cT.classList.toggle('over', tv.length > 60 || tv.length < 30);
    cD.textContent = `${dv.length}/160`; cD.classList.toggle('over', dv.length > 165 || dv.length < 70);
  };
  upd();
  let before = null;
  const save = (k, v) => {
    if (before === null) before = JSON.stringify(S.draft);
    if (v.trim() === (S.defSeo[k] || '').trim()) delete S.draft.seo[k]; else S.draft.seo[k] = v;
    autosave(); updateStatus(); refreshBadges();
  };
  $('#seoT', p).addEventListener('input', e => { upd(); save('title', e.target.value); });
  $('#seoD', p).addEventListener('input', e => { upd(); save('description', e.target.value); });
  [$('#seoT', p), $('#seoD', p)].forEach(el => el.addEventListener('change', () => { pushUndo(before); before = null; toast('Saved to your draft'); }));
}

/* Domain & DNS: read-only live view; changes go to the web team as a request */
const domainName = () => (S.me && S.me.site ? S.me.site.replace(/^https:\/\//, '') : location.hostname);
const apex = h => h.replace(/^www\./, '');
function supportLink(text = '') {
  const s = S.me && S.me.support; if (!s) return '';
  if (s.whatsapp) return `https://wa.me/${s.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  if (s.email) return `mailto:${s.email}?subject=${encodeURIComponent(`Website: ${domainName()}`)}${text ? `&body=${encodeURIComponent(text)}` : ''}`;
  return '';
}
const RTYPE = { 1: 'A', 2: 'NS', 5: 'CNAME', 15: 'MX', 16: 'TXT', 28: 'AAAA' };
async function doh(name, type) {
  const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`, { headers: { accept: 'application/dns-json' } });
  const j = await r.json();
  return (j.Answer || []).map(a => ({ name: a.name.replace(/\.$/, ''), type: RTYPE[a.type] || String(a.type), value: String(a.data).replace(/^"|"$/g, '').replace(/\.$/, '') }));
}
function pDomain(p) {
  const host = domainName();
  const custom = !host.endsWith('.pages.dev') && !/^(localhost|[\d.]+)(:\d+)?$/.test(host);
  const sup = (S.me && S.me.support) || { name: 'your web team' };
  p.innerHTML = `<p class="eyebrow">DOMAIN &amp; DNS</p><h2>Your <em>address</em> on the web.</h2>
    <div class="dom-hero card"><div class="dom-dot big"><i></i></div><div><small>YOUR DOMAIN</small><b>${esc(host)}</b><span>Connected and live</span></div><a class="ic-btn" href="${esc(location.protocol)}//${esc(host)}" target="_blank" rel="noopener" title="Open">${icon('ext')}</a></div>
    <div class="dom-stats">
      <div class="card"><span class="ok-i">${icon('lock')}</span><b>HTTPS</b><small>${location.protocol === 'https:' ? 'Secured' : 'Local preview'}</small></div>
      <div class="card"><span class="ok-i">${icon('globe')}</span><b>Global</b><small>Cloudflare network</small></div>
      <div class="card"><span class="ok-i">${icon('heart')}</span><b id="ping">…</b><small>Response time</small></div>
    </div>
    <p class="group-t">DNS RECORDS ${custom ? '<em class="live-tag">LIVE</em>' : ''}</p>
    <div id="dns" class="dns">${custom ? '<p class="empty">Reading your DNS records…</p>' : '<p class="empty">Your DNS records appear here when the Studio is opened on your own domain (for example <b>yourdomain.com/admin</b>).</p>'}</div>
    <p class="group-t">NEED A CHANGE?</p>
    <div class="card dns-req">
      <p>${esc(sup.name)} looks after the technical side of your domain, so it always stays fast and secure. Tell us what you need and it’s done for you.</p>
      <div class="chips">${[['Business email', 'MX', '@', 'Connect a business email (e.g. Google Workspace or Zoho) to the domain.'], ['Google verification', 'TXT', '@', 'Verify the domain for Google. The TXT value is: '], ['New subdomain', 'CNAME', 'shop', 'Create a subdomain pointing to: '], ['Something else', 'Other', '', '']].map(([t, ty, n, d]) => `<button class="btn sm" type="button" data-ty="${ty}" data-n="${esc(n)}" data-d="${esc(d)}">${t}</button>`).join('')}</div>
      <div class="row2"><label class="f"><span>TYPE</span><select id="rqT">${['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'Other'].map(x => `<option>${x}</option>`).join('')}</select></label><label class="f"><span>NAME</span><input id="rqN" placeholder="@, www or shop"></label></div>
      <label class="f"><span>VALUE OR DETAILS</span><textarea id="rqV" rows="3" placeholder="What should it point to, or what do you need?"></textarea></label>
      ${supportLink() ? `<button class="gold-btn" type="button" id="rqSend" style="width:100%">${icon('send')}Send request</button>` : '<p class="help" style="color:var(--m2);font-size:.85rem;margin:4px 0 0">Send these details to your web team and they’ll take care of it.</p>'}
    </div>`;
  const t0 = performance.now();
  fetch(`/robots.txt?ping=${Date.now()}`, { cache: 'no-store' })
    .then(() => { const el = $('#ping', p); if (el) el.textContent = `${Math.max(1, Math.round(performance.now() - t0))} ms`; })
    .catch(() => { const el = $('#ping', p); if (el) el.textContent = '—'; });
  $$('[data-ty]', p).forEach(b => b.addEventListener('click', () => { $('#rqT', p).value = b.dataset.ty; $('#rqN', p).value = b.dataset.n; $('#rqV', p).value = b.dataset.d; $('#rqV', p).focus(); }));
  const send = $('#rqSend', p);
  if (send) send.addEventListener('click', () => {
    const v = $('#rqV', p).value.trim();
    if (!v) { toast('Please add a few details first', 'err'); return; }
    const msg = `Hello ${sup.name}, a DNS request for ${host}:\n\nType: ${$('#rqT', p).value}\nName: ${$('#rqN', p).value.trim() || '@'}\nDetails: ${v}\n\nThank you!`;
    window.open(supportLink(msg), '_blank', 'noopener');
    toast('Your request is ready to send. Thank you!');
  });
  if (!custom) return;
  const root = apex(host.replace(/:\d+$/, '')), www = `www.${root}`;
  Promise.all([['A', root], ['AAAA', root], ['CNAME', www], ['A', www], ['MX', root], ['TXT', root], ['NS', root]].map(([ty, n]) => doh(n, ty).catch(() => [])))
    .then(all => {
      const seen = new Set();
      const rows = all.flat().filter(r => { const k = `${r.name}|${r.type}|${r.value}`; if (seen.has(k)) return false; seen.add(k); return true; });
      const el = $('#dns', p); if (!el) return;
      const nm = n => (n === root ? '@' : n.endsWith(`.${root}`) ? n.slice(0, -root.length - 1) : n);
      el.innerHTML = rows.length
        ? `<table><thead><tr><th>Type</th><th>Name</th><th>Points to</th></tr></thead><tbody>${rows.map(r => `<tr><td><span class="rt">${esc(r.type)}</span></td><td>${esc(nm(r.name))}</td><td title="${esc(r.value)}">${esc(r.value)}</td></tr>`).join('')}</tbody></table><p class="help" style="font-size:.78rem;color:var(--m2);margin:8px 0 0">Read live from the internet’s DNS just now.</p>`
        : '<p class="empty">No public records found yet.</p>';
    });
}

/* Health */
function health() {
  const out = [];
  const add = (ok, title, detail, fix) => out.push({ ok, title, detail, fix });
  const noAlt = [];
  CARDS.forEach(c => itemsOf(c).forEach(x => { if (!(x.item.alt || '').trim()) noAlt.push({ c, k: x.key }); }));
  add(!noAlt.length, 'Every photo has a description', noAlt.length ? `${plural(noAlt.length, 'photo')} without a description. Google and screen readers use it.` : 'Great for Google and for people using screen readers.', noAlt.length ? () => showPanel('photos', { card: noAlt[0].c.id, focus: noAlt[0].k }) : null);
  const cfg = { ...((S.defaults && S.defaults.CONFIG) || {}), ...(S.config || {}), ...S.draft.config };
  const badCfg = CFG_FIELDS.filter(([k, , , ok]) => cfg[k] && !ok(String(cfg[k])));
  add(!badCfg.length, 'Contact details are valid', badCfg.length ? `Check: ${badCfg.map(f => f[1]).join(', ')}` : 'WhatsApp, email and social links all look right.', badCfg.length ? () => showPanel('links') : null);
  const empties = Object.entries(S.draft.text).filter(([, v]) => !cleanHtml(v).replace(/<[^>]*>/g, '').trim());
  add(!empties.length, 'No empty texts', empties.length ? `${plural(empties.length, 'text')} left empty.` : 'Every heading, paragraph and button has words in it.', empties.length ? () => jumpToText(empties[0][0]) : null);
  const title = S.draft.seo.title !== undefined ? S.draft.seo.title : S.defSeo.title || '';
  const desc = S.draft.seo.description !== undefined ? S.draft.seo.description : S.defSeo.description || '';
  add(title.length >= 30 && title.length <= 65, 'Google title length', `${title.length} characters (best: 30 to 60).`, () => showPanel('seo'));
  add(desc.length >= 70 && desc.length <= 170, 'Google description length', `${desc.length} characters (best: 120 to 160).`, () => showPanel('seo'));
  const pods = S.podcastsNow || [];
  add(pods.length > 0, 'Podcasts are listed', pods.length ? `${plural(pods.length, 'episode')} on the page.` : 'Add a YouTube link in Podcasts.', () => showPanel('podcasts'));
  const n = changes().length;
  add(!n, 'Everything is published', n ? `${plural(n, 'change')} waiting. Visitors see them after you publish.` : 'Visitors see exactly what you see.', n ? () => openPublish() : null);
  const score = Math.round(out.filter(x => x.ok).length / out.length * 100);
  return { items: out, score };
}
function jumpToText(key) {
  whenReady(() => { const el = $(`[data-e="${key}"]`, S.fd); if (el) scrollToEl(el, () => startEdit(el)); });
}
function pHealth(p) {
  const h = health();
  p.innerHTML = `<p class="eyebrow">SITE HEALTH</p><h2>All in <em>order?</em></h2>
    <div class="live-card card" style="margin:12px 0 16px"><div class="ring">${ringSvg(h.score)}<b>${h.score}</b></div><div><strong>${h.items.filter(x => x.ok).length} of ${h.items.length} checks passed</strong><p>${h.score === 100 ? 'Your website is in excellent shape.' : 'A couple of small things to polish.'}</p></div></div>
    <div class="checks">${h.items.map((x, i) => `<div class="chk card ${x.ok ? 'ok' : 'warn'}"><span class="ci">${icon(x.ok ? 'check' : 'alert')}</span><div><b>${esc(x.title)}</b><small>${esc(x.detail)}</small></div>${!x.ok && x.fix ? `<button class="btn sm" type="button" data-fix="${i}">Fix</button>` : ''}</div>`).join('')}</div>`;
  requestAnimationFrame(() => { const fg = $('.ring .fg', p); if (fg) fg.style.strokeDashoffset = fg.dataset.to; });
  $$('[data-fix]', p).forEach(b => b.addEventListener('click', () => h.items[+b.dataset.fix].fix()));
}

/* ---------------------------------------------------------------------------
   Publish, history
   ------------------------------------------------------------------------ */
const KIND = { text: 'TEXT', link: 'LINK', photos: 'PHOTOS', contact: 'CONTACT', google: 'GOOGLE', podcasts: 'PODCASTS', sections: 'SECTIONS' };
function describe(c) {
  if (c.kind === 'text') {
    const el = S.fd && $(`[data-e="${c.key}"]`, S.fd);
    const v = S.draft.text[c.key];
    const txt = v !== undefined ? cleanHtml(v).replace(/<[^>]*>/g, ' ') : 'back to the original';
    return `${el ? labelFor(el) : c.key}: “${txt.replace(/\s+/g, ' ').trim().slice(0, 70)}”`;
  }
  if (c.kind === 'photos') { const cs = CARDS.filter(x => x.path.split('.')[0] === c.key).map(x => x.title); return cs.length ? cs.join(', ') : c.key; }
  if (c.kind === 'contact') { const f = CFG_FIELDS.find(x => x[0] === c.key); return f ? f[1] : 'Book links'; }
  if (c.kind === 'google') return c.key === 'title' ? 'Page title' : 'Description';
  if (c.kind === 'podcasts') return 'Podcast list';
  if (c.kind === 'sections') return S.draft.hidden.length ? `Hidden: ${S.draft.hidden.map(id => (SECTIONS.find(s => s[0] === id) || [id, id])[1]).join(', ')}` : 'All sections visible';
  if (c.kind === 'link') return 'Page link';
  return c.key;
}
function openPublish() {
  if (S.editing) endEdit();
  const ch = changes();
  if (!ch.length) return toast('Everything is already live');
  if (!S.cloudOk) return setupHelp();
  const groups = Object.entries(ch.reduce((a, c) => ((a[c.kind] = a[c.kind] || []).push(c), a), {}));
  const box = openLayer(`<div class="m-head"><div><p class="eyebrow">PUBLISH</p><h2>Ready to go <em>live?</em></h2></div><button class="ic-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="m-body" id="pubBody"><p class="sub" style="color:var(--m);margin:0 0 10px">${plural(ch.length, 'change')} will appear for every visitor within about a minute.</p>
      <div class="changes">${groups.map(([k, list]) => list.slice(0, 4).map(c => `<div class="change card"><span class="k">${KIND[k]}</span><span>${esc(describe(c))}</span></div>`).join('') + (list.length > 4 ? `<div class="change card"><span class="k">${KIND[k]}</span><span>and ${list.length - 4} more</span></div>` : '')).join('')}</div></div>
    <div class="m-foot"><span class="sp">${icon('clock')} Every version is kept. You can always go back.</span><button class="btn" data-close>Not yet</button><button class="gold-btn" id="goLive">${icon('send')}Publish now</button></div>`);
  $('#goLive', box).addEventListener('click', () => doPublish(box, false));
}
async function doPublish(box, force) {
  const body = $('#pubBody', box), foot = $('.m-foot', box);
  foot.hidden = true;
  body.innerHTML = `<div class="steps"><div class="step on" data-s="1"><i></i>Checking your changes</div><div class="step" data-s="2"><i></i>Saving to your Cloudinary</div><div class="step" data-s="3"><i></i>Going live worldwide</div></div>`;
  const step = (n, st) => { const e = $(`[data-s="${n}"]`, body); if (e) e.className = `step ${st}`; };
  const bad = [];
  const walk = (v, p) => { if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}.${i}`)); else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (k === 'src' && !isCdn(x)) bad.push(p); else walk(x, `${p}.${k}`); }); };
  walk(S.draft.assets, 'assets');
  await sleep(450);
  if (bad.length) { body.innerHTML = `<p class="empty" style="color:var(--bad)">Some photos are not Cloudinary links, so they can’t be published. Replace them and try again.</p>`; foot.hidden = false; $('#goLive', box).remove(); return; }
  step(1, 'done'); step(2, 'on');
  try {
    const payload = { ...S.draft };
    const r = await api('/content', { method: 'POST', body: { content: payload, baseVersion: S.saved.version, force } });
    step(2, 'done'); step(3, 'on');
    await sleep(700);
    step(3, 'done');
    S.saved = { content: r.content, version: r.version, updatedAt: r.updatedAt };
    S.savedN = normalize(r.content);
    clearAutosave(); updateStatus(); refreshBadges();
    await sleep(350);
    $('.m-head', box).innerHTML = `<div><p class="eyebrow">PUBLISHED</p><h2>All <em>done.</em></h2></div>`;
    body.innerHTML = `<div class="success"><div class="seal">${icon('check')}</div><h3>You’re <em style="font-style:italic;background:var(--gold-g);-webkit-background-clip:text;background-clip:text;color:transparent">live.</em></h3><p>Your changes are published. Visitors everywhere will see them within about a minute.</p></div>`;
    foot.hidden = false;
    foot.innerHTML = `<span class="sp"></span><a class="btn" href="/" target="_blank" rel="noopener">${icon('ext')}View the live site</a><button class="gold-btn" data-close>Keep creating</button>`;
    $$('[data-close]', foot).forEach(b => b.addEventListener('click', () => closeLayer(false)));
    confetti();
    if (S.panel === 'overview' || S.panel === 'health') showPanel(S.panel, S.arg, true);
  } catch (e) {
    if (e.status === 409) {
      body.innerHTML = `<p class="eyebrow" style="color:var(--warn)">HEADS UP</p><p style="color:var(--m)">The website was published from somewhere else ${e.body.updatedAt ? esc(rel(e.body.updatedAt)) : 'recently'}. Publishing now replaces that version with yours (it stays in History, so nothing is lost).</p>`;
      foot.hidden = false;
      foot.innerHTML = `<span class="sp"></span><button class="btn" data-close>Cancel</button><button class="gold-btn" id="force">${icon('send')}Publish mine anyway</button>`;
      $('[data-close]', foot).addEventListener('click', () => closeLayer(false));
      $('#force', foot).addEventListener('click', () => doPublish(box, true));
      return;
    }
    body.innerHTML = `<p class="empty" style="color:var(--bad)">${esc(e.message)}</p><p class="empty">Your changes are safe in this browser. Try again in a moment.</p>`;
    foot.hidden = false;
  }
}

async function openHistory() {
  if (!S.cloudOk) return setupHelp();
  const box = openLayer(`<div class="m-head"><div><p class="eyebrow">VERSION HISTORY</p><h2>Every version, <em>kept safe.</em></h2></div><button class="ic-btn" data-close aria-label="Close">${icon('x')}</button></div>
    <div class="m-body"><p style="color:var(--m);margin:0 0 12px">Open any published version in the editor. It goes live only when you publish it.</p><div class="hist" id="hist"><p class="empty">Loading…</p></div></div>
    <div class="m-foot"><button class="btn" type="button" id="orig">${icon('rotate')}Start from the original website</button><span class="sp"></span><button class="btn" data-close>Close</button></div>`);
  $('#orig', box).addEventListener('click', () => {
    const prev = JSON.stringify(S.draft); setDraft(EMPTY()); closeLayer(false);
    afterChange({ reload: true, prev }); showPanel(S.panel, S.arg, true);
    toast('Loaded the original website. Publish to make it live, or undo.');
  });
  try {
    const r = await api('/history');
    const curStamp = S.saved.content && S.saved.content.updated ? S.saved.content.updated.replace(/[:.]/g, '-') : '';
    $('#hist', box).innerHTML = r.items.length ? r.items.map((it, i) => `<div class="hrow card ${curStamp && it.id.includes(curStamp) ? 'cur' : ''}"><span class="hd"><b>${esc(when(it.at))}</b><small>${esc(rel(it.at))}${i === 0 ? ' · most recent' : ''}</small></span>${curStamp && it.id.includes(curStamp) ? '<span class="tag-live">LIVE</span>' : ''}<button class="btn sm" type="button" data-id="${esc(it.id)}">Open</button></div>`).join('') : '<p class="empty">Nothing published yet. Your first publish will appear here.</p>';
    $$('[data-id]', box).forEach(b => b.addEventListener('click', async () => {
      b.disabled = true; b.textContent = 'Opening…';
      try {
        const v = await api(`/history/item?id=${encodeURIComponent(b.dataset.id)}`);
        const prev = JSON.stringify(S.draft); setDraft(normalize(v.content)); closeLayer(false);
        afterChange({ reload: true, prev }); showPanel(S.panel, S.arg, true);
        toast(`Opened the version from ${when(v.at)}. Publish to make it live.`, 'ok', 4200);
      } catch (e) { toast(e.message, 'err'); b.disabled = false; b.textContent = 'Open'; }
    }));
  } catch (e) { $('#hist', box).innerHTML = `<p class="empty">${esc(e.message)}</p>`; }
}

/* ---------------------------------------------------------------------------
   Command palette (Ctrl+K)
   ------------------------------------------------------------------------ */
function openPalette() {
  if (S.editing) endEdit();
  const items = [
    ...[['send', 'Publish changes', 'Make your edits live', openPublish], ['undo', 'Undo', 'Ctrl+Z', undo], ['redo', 'Redo', 'Ctrl+Shift+Z', redo], ['clock', 'Version history', 'Open any past version', openHistory],
      ['monitor', 'Preview on desktop', '', () => setDevice('desktop')], ['tablet', 'Preview on tablet', '', () => setDevice('tablet')], ['phone', 'Preview on phone', '', () => setDevice('phone')],
      ['ext', 'Open the live website', '', () => window.open('/', '_blank', 'noopener')], ['menu', 'Edit the menu', 'Opens it in the preview', openFrameMenu]].map(([ic, t, s, fn]) => ({ g: 'Actions', ic, t, s, fn })),
    ...[['overview', 'Home', 'home'], ['domain', 'Domain & DNS', 'shield'], ['sections', 'Sections', 'layers'], ['photos', 'Photos & videos', 'image'], ['podcasts', 'Podcasts', 'mic'], ['links', 'Contact & links', 'link'], ['seo', 'Google & sharing', 'globe'], ['health', 'Site health', 'heart']].map(([id, t, ic]) => ({ g: 'Panels', ic, t, s: '', fn: () => showPanel(id) })),
    ...SECTIONS.map(([id, t, s]) => ({ g: 'Go to section', ic: 'layers', t, s, fn: () => scrollToSection(id) })),
    ...CARDS.map(c => ({ g: 'Photos', ic: 'image', t: c.title, s: c.group, fn: () => showPanel('photos', { card: c.id }) })),
    ...(S.fd ? $$('[data-e]', S.fd).map(el => ({ g: 'Texts', ic: 'sparkles', t: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 90), s: labelFor(el), fn: () => scrollToEl(el, () => startEdit(el)) })).filter(x => x.t.length > 1) : [])
  ];
  const box = openLayer(`<div class="ps">${icon('search')}<input id="pq" placeholder="Search texts, sections, photos, actions…" autocomplete="off"><span class="kbd">ESC</span></div><ul id="pl"></ul>`, { cls: 'palette' });
  let cur = 0, shown = [];
  const render = () => {
    const q = $('#pq', box).value.trim().toLowerCase();
    shown = (q ? items.filter(x => (`${x.t} ${x.s}`).toLowerCase().includes(q)).sort((a, b) => (b.t.toLowerCase().startsWith(q) ? 1 : 0) - (a.t.toLowerCase().startsWith(q) ? 1 : 0)) : items.filter(x => x.g !== 'Texts')).slice(0, 60);
    cur = Math.min(cur, Math.max(0, shown.length - 1));
    let g = '';
    $('#pl', box).innerHTML = shown.map((x, i) => `${x.g !== g ? `<li class="pg">${(g = x.g).toUpperCase()}</li>` : ''}<li><button type="button" data-i="${i}" aria-selected="${i === cur}"><span class="pi">${icon(x.ic)}</span><span><b>${esc(x.t)}</b>${x.s ? `<small>${esc(x.s)}</small>` : ''}</span></button></li>`).join('') || '<li class="empty">Nothing found</li>';
    $$('[data-i]', box).forEach(b => b.addEventListener('click', () => run(+b.dataset.i)));
  };
  const run = i => { const x = shown[i]; if (!x) return; closeLayer(true); x.fn(); };
  $('#pq', box).addEventListener('input', () => { cur = 0; render(); });
  $('#pq', box).addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); cur = Math.min(cur + 1, shown.length - 1); render(); $('[aria-selected="true"]', box).scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); cur = Math.max(cur - 1, 0); render(); $('[aria-selected="true"]', box).scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); run(cur); }
  });
  render();
  setTimeout(() => $('#pq', box).focus(), 30);
}

/* ---------------------------------------------------------------------------
   Studio chrome: devices, keys, buttons
   ------------------------------------------------------------------------ */
function setDevice(d) {
  S.device = d;
  $('#device').dataset.device = d;
  $$('#devices [data-device]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.device === d)));
  placePill();
  hideHover();
  fitFrame();
  setTimeout(() => { fitFrame(); if (S.editing) placeToolbar(S.editing); }, 750);
}
function placePill() {
  const b = $(`#devices [data-device="${S.device}"]`), pill = $('#devices .seg-pill');
  if (!b) return;
  pill.style.left = `${b.offsetLeft}px`; pill.style.width = `${b.offsetWidth}px`;
}
function keys(e) {
  const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
  if (mod && k === 'k') { e.preventDefault(); openPalette(); }
  else if (mod && k === 's') { e.preventDefault(); openPublish(); }
  else if (mod && k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
  else if (mod && (k === 'y' || (k === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
  else if (k === 'escape') { if ($('#layer').firstChild && $('#layer')._close) $('#layer')._close(); }
}
let uiReady = false;
function initStudioUI() {
  if (uiReady) return; uiReady = true;
  initToolbar();
  $$('#rail [data-panel]').forEach(b => b.addEventListener('click', () => showPanel(b.dataset.panel)));
  $$('#devices [data-device]').forEach(b => b.addEventListener('click', () => setDevice(b.dataset.device)));
  requestAnimationFrame(() => { placePill(); fitFrame(); }); addEventListener('resize', () => { placePill(); fitFrame(); hideHover(); if (S.editing) placeToolbar(S.editing); });
  new ResizeObserver(() => fitFrame()).observe($('#device'));
  $('#undoBtn').addEventListener('click', undo);
  $('#redoBtn').addEventListener('click', redo);
  $('#historyBtn').addEventListener('click', openHistory);
  $('#publishBtn').addEventListener('click', openPublish);
  $('#status').addEventListener('click', () => (changes().length ? openPublish() : openHistory()));
  $('#paletteBtn').addEventListener('click', openPalette);
  $('#logoutBtn').addEventListener('click', async () => {
    if (changes().length && !confirm('You have unpublished changes. They stay saved in this browser. Sign out?')) return;
    try { await api('/logout', { method: 'POST', body: {} }); } catch (e) { /* ignore */ }
    location.reload();
  });
  document.addEventListener('keydown', e => {
    const inField = e.target.closest && e.target.closest('input,textarea,select');
    if (inField && !(e.metaKey || e.ctrlKey) && e.key !== 'Escape') return;
    if (inField && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) return;
    keys(e);
  });
  document.addEventListener('mousedown', e => {
    if (S.editing && !e.target.closest('#toolbar') && !e.target.closest('#frame')) endEdit();
  });
  $('#frame').addEventListener('load', () => setTimeout(onFrameReady, 400));
  $('#stage').addEventListener('mouseleave', hideHover);
  addEventListener('beforeunload', e => { if (S.draft && changes().length) { e.preventDefault(); e.returnValue = ''; } });
  setTimeout(() => $('#stageHint').classList.add('gone'), 9000);
}

initLogin();
start();
})();
