/* =============================================================================
   Dr. Navjot Kaur: site worker (Cloudflare Pages, advanced mode)
   -----------------------------------------------------------------------------
   Uses nothing but Cloudflare Pages (no KV, R2 or D1). Published content is a
   small JSON file stored in the site's own Cloudinary account, next to the photos.

   Pages → Settings → Variables and Secrets (Production):
     ADMIN_USER              admin login ID
     ADMIN_PASSWORD          admin password (Secret)
     CLOUDINARY_API_KEY      from Cloudinary → Settings → API Keys
     CLOUDINARY_API_SECRET   (Secret)
     CLOUDINARY_CLOUD_NAME   optional, defaults to dhn6pvsr1

   Routes
     /                 the website, with the latest published content applied
     /admin/           the visual editor (login required for every /api call)
     /api/*            admin API
   ========================================================================== */

const DEFAULT_CLOUD = 'dhn6pvsr1';
const CONTENT_ID = 'navjot-site/content.json';
const HISTORY_PREFIX = 'navjot-site/history/';
const MEDIA_FOLDER = 'navjot-site/media';
const SESSION_COOKIE = 'nk_admin';
const SESSION_HOURS = 12;
const MAX_CONTENT_BYTES = 400 * 1024;
const CACHE_SECONDS = 30;

// Values baked into index.html that published content may replace
const BAKED = {
  heroPath: 'v1790774925/ChatGPT_Image_Sep_30_2026_06_56_08_PM_prezqe.png',
  whatsapp: '919814724488',
  phone: '+919814724488',
  phoneLd: '+91-9814724488',
  phoneDisplay: '+91 98147 24488',
  email: 'Drnavjotkaur2211@gmail.com',
  instagram: 'https://www.instagram.com/kaaurdrnavjot',
  linkedin: 'https://www.linkedin.com/in/dr-navjot-kaur-087a85318/'
};

const CSP_SITE = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'sha256-2Q2kdTWLRV5Pw0/VFbK7C6PFjbTsrFxyRbEzSeqv8f0='; style-src 'self' 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com; media-src 'self' blob: https://res.cloudinary.com; connect-src 'self'; frame-src https://www.youtube-nocookie.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests";
const CSP_ADMIN = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com; media-src 'self' blob: https://res.cloudinary.com; connect-src 'self' https://api.cloudinary.com; frame-src 'self' https://www.youtube-nocookie.com; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'";

const BASE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    try {
      if (path.startsWith('/api/')) return withHeaders(await api(request, env, ctx, url), { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
      if ((path === '/' || path === '/index.html') && (request.method === 'GET' || request.method === 'HEAD')) return await renderHome(request, env, ctx, url);
      if (path === '/admin') return Response.redirect(new URL('/admin/', url).toString(), 301);
      if (path.startsWith('/admin/')) {
        const res = await env.ASSETS.fetch(request);
        return withHeaders(res, { 'Content-Security-Policy': CSP_ADMIN, 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-cache', 'X-Robots-Tag': 'noindex, nofollow', 'Cross-Origin-Opener-Policy': 'same-origin' });
      }
      return env.ASSETS.fetch(request);
    } catch (err) {
      if (path.startsWith('/api/')) return json({ error: 'Something went wrong on the server. Please try again.' }, 500);
      return env.ASSETS.fetch(request);
    }
  }
};

/* ---------------------------------------------------------------------------
   Website
   ------------------------------------------------------------------------ */
async function renderHome(request, env, ctx, url) {
  const res = await env.ASSETS.fetch(new Request(new URL('/', url).toString()));   // no conditional headers: the page changes with published content
  if (!res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  let html = await res.text();
  const edit = url.searchParams.has('nk-edit');
  const content = await publicContent(env, ctx);
  html = render(html, content, { edit, cloud: cloudName(env) });
  return new Response(request.method === 'HEAD' ? null : html, {
    headers: {
      ...BASE_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': edit ? 'no-store' : 'public, max-age=0, must-revalidate',
      'Content-Security-Policy': CSP_SITE,
      'X-Frame-Options': 'SAMEORIGIN',
      'Cross-Origin-Opener-Policy': 'same-origin',
      ...(edit ? { 'X-Robots-Tag': 'noindex' } : {})
    }
  });
}

/** Applies published content to the page HTML. In the admin preview (edit) only the JSON is embedded. */
function render(html, c, { edit = false } = {}) {
  if (!c || typeof c !== 'object') return html;
  if (!edit) {
    if (c.text && typeof c.text === 'object') html = replaceInner(html, c.text);
    if (c.links && typeof c.links === 'object') html = replaceLinks(html, c.links);
    html = applyConfig(html, c.config || {});
    html = applyHero(html, c.assets && c.assets.hero);
    html = applySeo(html, c.seo || {});
    const hidden = (Array.isArray(c.hidden) ? c.hidden : []).filter(id => /^[a-z][\w-]{0,40}$/.test(id) && id !== 'home');
    if (hidden.length) {
      const css = hidden.map(id => `#${id},.menu-links li:has(a[href="#${id}"]),.foot-links a[href="#${id}"],.tabbar a[href="#${id}"]{display:none!important}`).join('');
      html = html.replace('</head>', `<style>${css}</style>\n</head>`);
    }
  }
  const data = JSON.stringify({ config: c.config, assets: c.assets, podcasts: c.podcasts, ...(edit ? { text: c.text, links: c.links, hidden: c.hidden } : {}) })
    .replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return html.replace('</head>', `<script type="application/json" id="nk-content">${data}</script>\n</head>`);
}

/** Replace the inner HTML of every element carrying data-e="key" that has an override */
function replaceInner(html, map) {
  const re = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?\sdata-e="([\w.-]+)"[^>]*>/g;
  const hits = [];
  let m;
  while ((m = re.exec(html))) if (typeof map[m[2]] === 'string') hits.push({ tag: m[1].toLowerCase(), start: m.index, open: m[0], openEnd: m.index + m[0].length, key: m[2] });
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i];
    const tagRe = new RegExp(`<(/?)${h.tag}\\b[^>]*>`, 'gi');
    tagRe.lastIndex = h.openEnd;
    let depth = 1, close = -1, t;
    while ((t = tagRe.exec(html))) {
      if (t[1]) { if (--depth === 0) { close = t.index; break; } } else if (!/\/>$/.test(t[0])) depth++;
    }
    if (close < 0) continue;
    const value = clean(map[h.key]);
    let open = h.open;
    if (/\sdata-count="/.test(open)) {
      const n = value.replace(/<[^>]*>/g, '').match(/\d+/);
      if (n) open = open.replace(/\sdata-count="\d*"/, ` data-count="${n[0]}"`);
    }
    html = html.slice(0, h.start) + open + value + html.slice(close);
  }
  return html;
}

const ALLOWED = new Set(['em', 'i', 'b', 'strong', 'br', 'span', 'small', 'cite', 'sup', 'sub']);
/** Text sanitiser: a handful of inline tags, class and data-count attributes only */
function clean(s) {
  s = String(s).slice(0, 4000).replace(/<!--[\s\S]*?-->/g, '');
  const esc = x => x.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let out = '', last = 0, m;
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^<>]*)>/g;
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index)); last = re.lastIndex;
    let tag = m[2].toLowerCase(); if (tag === 'i') tag = 'em';
    if (!ALLOWED.has(tag)) continue;
    if (m[1]) { if (tag !== 'br') out += `</${tag}>`; continue; }
    if (tag === 'br') { out += '<br>'; continue; }
    const cls = /\bclass\s*=\s*"([\w\s-]*)"/.exec(m[3]), cnt = /\bdata-count\s*=\s*"(\d{1,7})"/.exec(m[3]);
    out += `<${tag}${cls ? ` class="${cls[1]}"` : ''}${cnt ? ` data-count="${cnt[1]}"` : ''}>`;
  }
  return out + esc(s.slice(last));
}

const safeUrl = u => typeof u === 'string' && /^(https?:\/\/|mailto:|tel:)[^\s"'<>]+$/i.test(u.trim());
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function replaceLinks(html, map) {
  return html.replace(/<a\b[^>]*\sdata-l="([\w.-]+)"[^>]*>/g, (tag, key) => {
    const v = map[key];
    return safeUrl(v) ? tag.replace(/\shref="[^"]*"/, ` href="${attr(v.trim())}"`) : tag;
  });
}

function applyConfig(html, c) {
  const rep = (from, to) => { if (to && to !== from) html = html.split(from).join(to); };
  const digits = s => String(s || '').replace(/\D/g, '');
  if (typeof c.CONTACT_PHONE === 'string' && /^\+?\d{7,15}$/.test(c.CONTACT_PHONE.trim())) {
    const p = c.CONTACT_PHONE.trim();
    rep(`tel:${BAKED.phone}`, `tel:${p}`); rep(`"telephone":"${BAKED.phoneLd}"`, `"telephone":"${p}"`);
  }
  if (typeof c.CONTACT_PHONE_DISPLAY === 'string' && c.CONTACT_PHONE_DISPLAY.trim()) rep(`>${BAKED.phoneDisplay}<`, `>${attr(c.CONTACT_PHONE_DISPLAY.trim())}<`);
  if (digits(c.WHATSAPP_NUMBER).length >= 8) rep(`wa.me/${BAKED.whatsapp}`, `wa.me/${digits(c.WHATSAPP_NUMBER)}`);
  if (typeof c.CONTACT_EMAIL === 'string' && /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(c.CONTACT_EMAIL.trim())) rep(BAKED.email, c.CONTACT_EMAIL.trim());
  if (safeUrl(c.INSTAGRAM_URL) && /^https:/.test(c.INSTAGRAM_URL)) rep(`"${BAKED.instagram}"`, `"${attr(c.INSTAGRAM_URL.trim())}"`);
  if (safeUrl(c.LINKEDIN_URL) && /^https:/.test(c.LINKEDIN_URL)) rep(`"${BAKED.linkedin}"`, `"${attr(c.LINKEDIN_URL.trim())}"`);
  return html;
}

/** New hero photo: rewrite the preloaded/LCP image, social images and JSON-LD to the new Cloudinary file */
function applyHero(html, hero) {
  if (!hero || typeof hero.src !== 'string') return html;
  const m = /^https:\/\/res\.cloudinary\.com\/([\w-]+)\/image\/upload\/(?:.*?\/)?(v\d+\/[^\s"'<>?#]+)$/.exec(hero.src.trim());
  if (!m) return html;
  const old = BAKED.heroPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  html = html.replace(new RegExp(`res\\.cloudinary\\.com/${DEFAULT_CLOUD}/image/upload/((?:[^"'\\s/]+/)*?)${old}`, 'g'), (all, t) => `res.cloudinary.com/${m[1]}/image/upload/${t}${m[2]}`);
  if (typeof hero.alt === 'string' && hero.alt.trim()) html = html.replace(/(<img id="heroImg"[^>]*\salt=")[^"]*"/, `$1${attr(hero.alt.trim())}"`);
  return html;
}

function applySeo(html, s) {
  const title = typeof s.title === 'string' && s.title.trim().slice(0, 120);
  const desc = typeof s.description === 'string' && s.description.trim().slice(0, 320);
  if (title) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${attr(title)}</title>`)
      .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*"/g, `$1${attr(title)}"`);
  }
  if (desc) html = html.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*"/g, `$1${attr(desc)}"`);
  return html;
}

/* ---------------------------------------------------------------------------
   Content storage (Cloudinary raw file)
   ------------------------------------------------------------------------ */
const cloudName = env => (env.CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD).trim();
const hasCloudinary = env => !!(env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
const cacheKey = 'https://nk-content.cache/latest';

async function publicContent(env, ctx) {
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit.json().catch(() => null);
  }
  let data = null;
  try {
    const r = await fetch(`https://res.cloudinary.com/${cloudName(env)}/raw/upload/${CONTENT_ID}`, { cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true } });
    if (r.ok) data = await r.json();
  } catch (e) { data = null; }
  if (cache) ctx.waitUntil(cache.put(cacheKey, new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${CACHE_SECONDS}` } })));
  return data;
}

const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function sha1(s) { return hex(await crypto.subtle.digest('SHA-1', new TextEncoder().encode(s))); }
async function signParams(params, secret) {
  const str = Object.keys(params).filter(k => params[k] !== undefined && params[k] !== '').sort().map(k => `${k}=${params[k]}`).join('&');
  return sha1(str + secret);
}
const basic = env => 'Basic ' + btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);

async function cloudAdmin(env, path) {
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName(env)}/${path}`, { headers: { Authorization: basic(env) } });
  const j = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, body: j };
}

async function uploadRaw(env, publicId, text) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: 'true', overwrite: 'true', public_id: publicId, timestamp };
  const fd = new FormData();
  Object.entries(params).forEach(([k, v]) => fd.append(k, String(v)));
  fd.append('api_key', env.CLOUDINARY_API_KEY);
  fd.append('signature', await signParams(params, env.CLOUDINARY_API_SECRET));
  fd.append('file', new Blob([text], { type: 'application/json' }), 'content.json');
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName(env)}/raw/upload`, { method: 'POST', body: fd });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j.error && j.error.message) || `Cloudinary upload failed (${r.status})`);
  return j;
}

async function latest(env) {
  const meta = await cloudAdmin(env, `resources/raw/upload/${CONTENT_ID}`);
  if (meta.status === 404) return { content: null, version: null, updatedAt: null };
  if (!meta.ok) throw new Error((meta.body.error && meta.body.error.message) || 'Could not reach Cloudinary');
  const r = await fetch(meta.body.secure_url);
  const content = r.ok ? await r.json().catch(() => null) : null;
  return { content, version: String(meta.body.version), updatedAt: meta.body.created_at };
}

/** Server-side validation: keeps known keys, photos must be Cloudinary links */
function validate(c) {
  if (!c || typeof c !== 'object' || Array.isArray(c)) throw new Error('Invalid content');
  const out = { v: 1 };
  const strMap = (o, max) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {}).filter(([k, v]) => /^[\w.-]{1,40}$/.test(k) && typeof v === 'string').slice(0, 2000).map(([k, v]) => [k, v.slice(0, max)]));
  out.text = Object.fromEntries(Object.entries(strMap(c.text, 4000)).map(([k, v]) => [k, clean(v)]));
  out.links = Object.fromEntries(Object.entries(strMap(c.links, 600)).filter(([, v]) => safeUrl(v)));
  const cfgKeys = ['WHATSAPP_NUMBER', 'CONTACT_PHONE', 'CONTACT_PHONE_DISPLAY', 'CONTACT_EMAIL', 'INSTAGRAM_URL', 'LINKEDIN_URL'];
  const cfg = c.config && typeof c.config === 'object' ? c.config : {};
  out.config = Object.fromEntries(cfgKeys.filter(k => typeof cfg[k] === 'string').map(k => [k, cfg[k].trim().slice(0, 200)]));
  if (Array.isArray(cfg.BOOKS)) out.config.BOOKS = cfg.BOOKS.filter(b => b && typeof b.id === 'string').slice(0, 20).map(b => ({
    id: b.id.slice(0, 40), ...(typeof b.title === 'string' ? { title: b.title.slice(0, 160) } : {}),
    ...(safeUrl(b.amazon) ? { amazon: b.amazon } : {}), ...(safeUrl(b.store) ? { store: b.store } : {})
  }));
  const checkTree = (v, depth = 0) => {
    if (depth > 6) throw new Error('Photo data is nested too deeply');
    if (Array.isArray(v)) { if (v.length > 200) throw new Error('Too many items in a list'); v.forEach(x => checkTree(x, depth + 1)); return; }
    if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => {
      if (k === 'src' && !(typeof x === 'string' && /^https:\/\/res\.cloudinary\.com\/[^\s"'<>]+$/.test(x))) throw new Error('Every photo and video must be a Cloudinary link (https://res.cloudinary.com/…)');
      checkTree(x, depth + 1);
    });
  };
  if (c.assets && typeof c.assets === 'object') { checkTree(c.assets); out.assets = c.assets; }
  if (Array.isArray(c.podcasts)) out.podcasts = c.podcasts.filter(p => p && /^[\w-]{6,20}$/.test(p.id)).slice(0, 60)
    .map(p => ({ id: p.id, ...(p.short ? { short: true } : {}), ...(typeof p.title === 'string' && p.title.trim() ? { title: p.title.trim().slice(0, 120) } : {}) }));
  if (Array.isArray(c.hidden)) out.hidden = c.hidden.filter(id => typeof id === 'string' && /^[a-z][\w-]{0,40}$/.test(id) && id !== 'home').slice(0, 30);
  if (c.seo && typeof c.seo === 'object') out.seo = Object.fromEntries(['title', 'description'].filter(k => typeof c.seo[k] === 'string').map(k => [k, c.seo[k].slice(0, 320)]));
  return out;
}

/* ---------------------------------------------------------------------------
   Sessions
   ------------------------------------------------------------------------ */
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function hmac(env, msg) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`${env.SESSION_SECRET || ''}|${env.ADMIN_USER}|${env.ADMIN_PASSWORD}|nk-studio`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg)));
}
async function same(env, a, b) { return (await hmac(env, `cmp:${a}`)) === (await hmac(env, `cmp:${b}`)); }
async function makeToken(env, user) {
  const exp = Date.now() + SESSION_HOURS * 3600e3;
  const body = `${encodeURIComponent(user)}.${exp}`;
  return `${body}.${await hmac(env, body)}`;
}
async function readSession(request, env) {
  if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) return null;
  const m = /(?:^|;\s*)nk_admin=([^;]+)/.exec(request.headers.get('Cookie') || '');
  if (!m) return null;
  const [u, exp, sig] = decodeURIComponent(m[1]).split('.');
  if (!u || !exp || !sig || +exp < Date.now()) return null;
  if (!(await same(env, sig, await hmac(env, `${u}.${exp}`)))) return null;
  return { user: decodeURIComponent(u), exp: +exp };
}
const cookie = (value, maxAge) => `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

const attempts = new Map();   // per-isolate brute-force brake
function throttled(ip) {
  const now = Date.now(), a = (attempts.get(ip) || []).filter(t => now - t < 10 * 60e3);
  attempts.set(ip, a);
  return a.length >= 8;
}

/* ---------------------------------------------------------------------------
   API
   ------------------------------------------------------------------------ */
async function api(request, env, ctx, url) {
  const route = url.pathname.replace(/^\/api/, '');
  const method = request.method;

  if (route === '/status' && method === 'GET') {
    return json({ login: !!(env.ADMIN_USER && env.ADMIN_PASSWORD), cloudinary: hasCloudinary(env), cloud: cloudName(env) });
  }
  if (route === '/login' && method === 'POST') {
    if (!env.ADMIN_USER || !env.ADMIN_PASSWORD) return json({ error: 'The admin login is not set up yet. Add ADMIN_USER and ADMIN_PASSWORD in Cloudflare Pages → Settings → Variables and Secrets, then redeploy.' }, 503);
    const ip = request.headers.get('CF-Connecting-IP') || 'local';
    if (throttled(ip)) return json({ error: 'Too many attempts. Please wait a few minutes and try again.' }, 429);
    const body = await request.json().catch(() => ({}));
    const okUser = await same(env, String(body.user || '').trim(), env.ADMIN_USER);
    const okPass = await same(env, String(body.pass || ''), env.ADMIN_PASSWORD);
    if (!okUser || !okPass) {
      attempts.get(ip).push(Date.now());
      await new Promise(r => setTimeout(r, 700));
      return json({ error: 'That ID or password is not right.' }, 401);
    }
    attempts.delete(ip);
    return json({ ok: true, user: env.ADMIN_USER }, 200, { 'Set-Cookie': cookie(encodeURIComponent(await makeToken(env, env.ADMIN_USER)), SESSION_HOURS * 3600) });
  }
  if (route === '/logout' && method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });

  // Everything below needs a session; changes also need the X-NK header (blocks cross-site requests)
  const session = await readSession(request, env);
  if (!session) return json({ error: 'Please sign in again.' }, 401);
  if (method !== 'GET' && request.headers.get('X-NK') !== '1') return json({ error: 'Bad request' }, 400);

  if (route === '/me' && method === 'GET') return json({ user: session.user, exp: session.exp, cloud: cloudName(env), cloudinary: hasCloudinary(env) });

  if (route === '/original' && method === 'GET') {
    const r = await env.ASSETS.fetch(new Request(new URL('/', url).toString()));
    return new Response(await r.text(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  if (!hasCloudinary(env)) return json({ error: 'Cloudinary is not connected yet. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in Cloudflare Pages → Settings → Variables and Secrets, then redeploy.', setup: true }, 503);

  if (route === '/content' && method === 'GET') return json(await latest(env));

  if (route === '/content' && method === 'POST') {
    const raw = await request.text();
    if (raw.length > MAX_CONTENT_BYTES) return json({ error: 'The content is too large to publish.' }, 413);
    let body; try { body = JSON.parse(raw); } catch (e) { return json({ error: 'Invalid content' }, 400); }
    let content; try { content = validate(body.content); } catch (e) { return json({ error: e.message }, 422); }
    if (!body.force) {
      const meta = await cloudAdmin(env, `resources/raw/upload/${CONTENT_ID}`);
      const current = meta.ok ? String(meta.body.version) : null;
      if ((body.baseVersion || null) !== current) return json({ error: 'conflict', version: current, updatedAt: meta.ok ? meta.body.created_at : null }, 409);
    }
    content.updated = new Date().toISOString();
    content.by = session.user;
    const text = JSON.stringify(content);
    const up = await uploadRaw(env, CONTENT_ID, text);
    const stamp = content.updated.replace(/[:.]/g, '-');
    ctx.waitUntil(uploadRaw(env, `${HISTORY_PREFIX}${stamp}.json`, text).catch(() => {}));
    if (typeof caches !== 'undefined') ctx.waitUntil(caches.default.put(cacheKey, new Response(text, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${CACHE_SECONDS}` } })));
    return json({ ok: true, version: String(up.version), updatedAt: up.created_at || content.updated, content });
  }

  if (route === '/history' && method === 'GET') {
    const r = await cloudAdmin(env, `resources/raw/upload?prefix=${encodeURIComponent(HISTORY_PREFIX)}&max_results=60&direction=desc`);
    if (!r.ok) return json({ error: (r.body.error && r.body.error.message) || 'Could not load history' }, 502);
    const items = (r.body.resources || []).map(x => ({ id: x.public_id, at: x.created_at, bytes: x.bytes })).sort((a, b) => (a.at < b.at ? 1 : -1));
    return json({ items });
  }
  if (route === '/history/item' && method === 'GET') {
    const id = url.searchParams.get('id') || '';
    if (!id.startsWith(HISTORY_PREFIX) || !/^[\w./-]+\.json$/.test(id)) return json({ error: 'Not found' }, 404);
    const meta = await cloudAdmin(env, `resources/raw/upload/${id}`);
    if (!meta.ok) return json({ error: 'Not found' }, 404);
    const r = await fetch(meta.body.secure_url);
    return json({ content: await r.json().catch(() => null), at: meta.body.created_at });
  }

  if (route === '/sign' && method === 'POST') {
    const timestamp = Math.floor(Date.now() / 1000);
    const params = { folder: MEDIA_FOLDER, timestamp };
    return json({ cloud: cloudName(env), api_key: env.CLOUDINARY_API_KEY, timestamp, folder: MEDIA_FOLDER, signature: await signParams(params, env.CLOUDINARY_API_SECRET) });
  }

  if (route === '/media' && method === 'GET') {
    const type = url.searchParams.get('type') === 'video' ? 'video' : 'image';
    const cursor = url.searchParams.get('cursor');
    const r = await cloudAdmin(env, `resources/${type}/upload?max_results=48&direction=desc${cursor ? `&next_cursor=${encodeURIComponent(cursor)}` : ''}`);
    if (!r.ok) return json({ error: (r.body.error && r.body.error.message) || 'Could not load the library' }, 502);
    const items = (r.body.resources || []).map(x => ({ url: x.secure_url, id: x.public_id, w: x.width, h: x.height, type, format: x.format, at: x.created_at, bytes: x.bytes }));
    return json({ items, next: r.body.next_cursor || null });
  }

  return json({ error: 'Not found' }, 404);
}

/* ---------------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------------ */
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });
}
function withHeaders(res, extra) {
  const r = new Response(res.body, res);
  Object.entries({ ...BASE_HEADERS, ...extra }).forEach(([k, v]) => r.headers.set(k, v));
  return r;
}
