/**
 * Zarvis: Cloudflare Pages advanced-mode worker (_worker.js).
 *
 *   GET  /api/status          configured AI providers, stock-photo provider, password requirement
 *   POST /api/generate        { mode: site|edit|block, provider, model, effort, input } → { site, usage, provider, model }
 *   GET  /api/images?q=&n=    stock photo search (Pexels or Unsplash) → { photos: [{ src, thumb, alt, credit, download }] }
 *   GET  /api/images/track?u= Unsplash download tracking (required by their guidelines)
 *   everything else           static app (env.ASSETS)
 *
 * Secrets (Pages → Settings → Variables and Secrets), set only the ones you use:
 *   ANTHROPIC_API_KEY  OPENAI_API_KEY  GEMINI_API_KEY  GROQ_API_KEY
 *   PEXELS_API_KEY or UNSPLASH_ACCESS_KEY   optional stock photos
 *   ZARVIS_PASSWORD    optional extra lock for /api/* (use together with Cloudflare Access)
 */
import Anthropic from '@anthropic-ai/sdk';
import { SITE_SCHEMA, BLOCK_SCHEMA, SYSTEM_PROMPT, buildUserPrompt } from './prompt.js';
import { listModels, pickModel, resolveModel, firstProvider, isModelError, PROVIDER_ORDER } from './models.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Robots-Tag': 'noindex, nofollow'
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS }
});

/** Constant-time string comparison for the optional password */
function safeEqual(a = '', b = '') {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

/** Pull the first JSON object out of a model response (tolerates code fences) */
function parseJSON(text) {
  if (!text) throw new Error('The model returned an empty response.');
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  try { return JSON.parse(t); } catch { /* fall through */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('Could not read JSON from the model response.');
}

/* ------------------------------------------------------------------ Claude */
async function callAnthropic(env, { model, effort, system, user, schema }) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const base = { model, max_tokens: 32000, system, messages: [{ role: 'user', content: user }] };
  const full = { ...base, output_config: { format: { type: 'json_schema', schema } } };
  if (!/haiku/.test(model)) { full.thinking = { type: 'adaptive' }; if (effort) full.output_config.effort = effort; }
  // Server-side fallback on refusals, documented for the Opus 5 / Fable 5 families
  if (/^claude-(opus-5|fable-5)(?!-5)/.test(model)) { full.betas = ['server-side-fallback-2026-07-01']; full.fallbacks = 'default'; }
  let msg;
  try { msg = await client.beta.messages.stream(full).finalMessage(); }
  catch (e) {
    // A model that does not accept one of the optional features (schema output, thinking, effort, betas):
    // retry once with the plain request so a new or older model still works.
    if (e?.status !== 400 || isModelError(e)) throw e;
    msg = await client.beta.messages.stream({ ...base, max_tokens: 16000 }).finalMessage().catch(async e2 => {
      if (e2?.status === 400 && /max_tokens/i.test(e2.message || '')) return client.beta.messages.stream({ ...base, max_tokens: 8192 }).finalMessage();
      throw e2;
    });
  }
  if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request. Try rephrasing the brief.');
  if (msg.stop_reason === 'max_tokens') throw new Error('The response was cut off (max tokens). Try a shorter brief or a larger model.');
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return { copy: parseJSON(text), usage: { input: msg.usage.input_tokens, output: msg.usage.output_tokens }, model: msg.model };
}

/* ---------------------------------------------------- OpenAI-compatible */
async function callOpenAICompatible(url, key, { model, system, user, effort, reasoning }) {
  const send = async body => {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const err = new Error(data.error?.message || `Provider error ${res.status}`); err.status = res.status; throw err; }
    return data;
  };
  const body = { model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: { type: 'json_object' } };
  if (reasoning && effort) body.reasoning_effort = effort === 'max' || effort === 'xhigh' ? 'high' : effort;
  let data;
  try { data = await send(body); }
  catch (e) {
    if (e.status !== 400 || isModelError(e)) throw e;
    data = await send({ model, messages: body.messages });   // model rejected an optional parameter: plain request
  }
  const text = data.choices?.[0]?.message?.content || '';
  return { copy: parseJSON(text), usage: { input: data.usage?.prompt_tokens, output: data.usage?.completion_tokens }, model: data.model || model };
}

/* ------------------------------------------------------------------ Gemini */
async function callGemini(env, { model, system, user }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const err = new Error(data.error?.message || `Gemini error ${res.status}`); err.status = res.status; throw err; }
  const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  return { copy: parseJSON(text), usage: { input: data.usageMetadata?.promptTokenCount, output: data.usageMetadata?.candidatesTokenCount }, model };
}

const PROVIDERS = {
  anthropic: { key: 'ANTHROPIC_API_KEY', run: (env, a) => callAnthropic(env, a) },
  openai:    { key: 'OPENAI_API_KEY', run: (env, a) => callOpenAICompatible('https://api.openai.com/v1/chat/completions', env.OPENAI_API_KEY, { ...a, reasoning: /^(o\d|gpt-[5-9])/.test(a.model) }) },
  groq:      { key: 'GROQ_API_KEY', run: (env, a) => callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, a) },
  gemini:    { key: 'GEMINI_API_KEY', run: (env, a) => callGemini(env, a) }
};

/* ------------------------------------------------------------ models */
async function handleModels(url, env) {
  const provider = url.searchParams.get('provider');
  if (!PROVIDERS[provider]) return json({ error: 'Unknown provider.' }, 400);
  if (!env[PROVIDERS[provider].key]) return json({ models: [], auto: {} });
  try {
    const list = await listModels(env, provider, { fresh: url.searchParams.get('fresh') === '1' });
    const auto = Object.fromEntries(['best', 'balanced', 'fast'].map(p => [p, pickModel(provider, list, p)]));
    return json({ models: [...list].sort((a, b) => b.created - a.created || a.id.localeCompare(b.id)).map(m => ({ id: m.id, label: m.label })), auto });
  } catch (e) { return json({ error: e.message || 'Could not list models.' }, 502); }
}

/* ------------------------------------------------------------ stock photos */
const imageProvider = env => (env.PEXELS_API_KEY ? 'pexels' : env.UNSPLASH_ACCESS_KEY ? 'unsplash' : '');
async function handleImages(url, env) {
  const q = String(url.searchParams.get('q') || '').trim().slice(0, 100);
  const n = Math.min(30, Math.max(1, parseInt(url.searchParams.get('n'), 10) || 12));
  if (!q) return json({ error: 'Missing search words.' }, 400);
  const prov = imageProvider(env);
  if (!prov) return json({ error: 'No stock photo key. Add PEXELS_API_KEY or UNSPLASH_ACCESS_KEY.' }, 400);
  if (prov === 'pexels') {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${n}&orientation=landscape`, { headers: { Authorization: env.PEXELS_API_KEY } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d.error || `Pexels error ${r.status}` }, 502);
    return json({ provider: 'pexels', photos: (d.photos || []).map(p => ({ src: p.src.original, thumb: p.src.medium, alt: p.alt || '', credit: `${p.photographer} / Pexels`, link: p.url, download: '' })) });
  }
  const r = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${n}&orientation=landscape&content_filter=high`, { headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`, 'Accept-Version': 'v1' } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: (d.errors || [])[0] || `Unsplash error ${r.status}` }, 502);
  return json({ provider: 'unsplash', photos: (d.results || []).map(p => ({ src: p.urls.raw, thumb: p.urls.small, alt: p.alt_description || '', credit: `${p.user?.name || 'Unknown'} / Unsplash`, link: p.links?.html || '', download: p.links?.download_location || '' })) });
}
async function handleTrack(url, env) {
  const u = String(url.searchParams.get('u') || '');
  if (env.UNSPLASH_ACCESS_KEY && /^https:\/\/api\.unsplash\.com\/photos\/[\w-]+\/download/.test(u)) await fetch(u, { headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` } }).catch(() => {});
  return json({ ok: true });
}

async function handleGenerate(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body.' }, 400); }
  let providerId = body.provider === 'auto' || !body.provider ? firstProvider(env) : body.provider;
  const provider = PROVIDERS[providerId];
  if (!provider) return json({ error: body.provider === 'auto' ? 'No AI key is set. Add one in Cloudflare Pages → Settings → Variables and Secrets.' : 'Unknown provider.' }, 400);
  if (!env[provider.key]) return json({ error: `No API key set for ${providerId}. Add ${provider.key} in Cloudflare Pages → Settings → Variables and Secrets.` }, 400);
  const priority = ['best', 'balanced', 'fast'].includes(body.priority) ? body.priority : 'best';
  let model = String(body.model || '').trim();
  if (model && model !== 'auto' && !/^[\w.:\-/]{2,100}$/.test(model)) return json({ error: 'Invalid model name.' }, 400);
  const effort = ['low', 'medium', 'high', 'xhigh', 'max'].includes(body.effort) ? body.effort : undefined;
  const mode = ['site', 'edit', 'block'].includes(body.mode) ? body.mode : 'site';
  const input = body.input && typeof body.input === 'object' ? body.input : null;
  if (!input) return json({ error: 'Missing input.' }, 400);
  if (mode !== 'site' && !String(input.instruction || '').trim() && mode !== 'block') return json({ error: 'Tell Zarvis what to change.' }, 400);
  const user = buildUserPrompt(mode, input);
  if (user.length > 120000) return json({ error: 'The project is too large for one AI request. Remove some blocks or shorten long texts.' }, 413);
  const schema = mode === 'block' ? BLOCK_SCHEMA : SITE_SCHEMA;
  // Long generations can exceed Cloudflare's ~100 s time-to-first-byte limit (error 524), so the
  // response streams: whitespace heartbeats while the model works, then one JSON object.
  // Leading whitespace is valid JSON, so the browser still reads it with res.json().
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter(), enc = new TextEncoder();
  const beat = setInterval(() => { writer.write(enc.encode(' ')).catch(() => {}); }, 10000);
  (async () => {
    let result;
    try {
      const tryProvider = async (pid, wanted) => {
        const P = PROVIDERS[pid];
        // "auto" (or empty) = the newest suitable model this key can use right now
        let m = !wanted || wanted === 'auto' ? await resolveModel(env, pid, priority) : wanted;
        if (!m) throw new Error(`Could not find a usable ${pid} model for this key.`);
        try { return { out: await P.run(env, { model: m, effort, system: SYSTEM_PROMPT, user, schema }), model: m }; }
        catch (e) {
          if (!isModelError(e)) throw e;
          // the chosen model is gone or not enabled for this key: pick the next best live model and retry once
          const next = await resolveModel(env, pid, priority, [m]);
          if (!next || next === m) throw e;
          return { out: await P.run(env, { model: next, effort, system: SYSTEM_PROMPT, user, schema }), model: next };
        }
      };
      let out, lastErr;
      // provider "auto": if one provider fails (key, quota, outage), move on to the next one that has a key
      const chain = body.provider === 'auto' || !body.provider ? PROVIDER_ORDER.filter(pid => env[PROVIDERS[pid].key]) : [providerId];
      for (const pid of chain) {
        try { const r = await tryProvider(pid, pid === chain[0] ? model : 'auto'); out = r.out; model = r.model; providerId = pid; break; }
        catch (e) { lastErr = e; }
      }
      if (!out) throw lastErr || new Error('Generation failed.');
      const site = out.copy;
      if (!site || typeof site !== 'object' || (mode === 'block' ? !site.block : !Array.isArray(site.blocks))) throw new Error('The AI answer was not a usable design. Try again or pick another model.');
      result = { site, usage: out.usage, model: out.model || model, provider: providerId };
    } catch (e) {
      result = { error: e?.message || 'Generation failed.', status: Number.isInteger(e?.status) ? e.status : 502 };
    }
    clearInterval(beat);
    try { await writer.write(enc.encode(JSON.stringify(result))); await writer.close(); } catch { /* client went away */ }
  })();
  return new Response(readable, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      if (env.ZARVIS_PASSWORD && !safeEqual(request.headers.get('x-zarvis-key') || '', env.ZARVIS_PASSWORD)) {
        return json({ error: 'Password required.', passwordRequired: true }, 401);
      }
      if (url.pathname === '/api/status' && request.method === 'GET') {
        return json({
          providers: Object.fromEntries(Object.entries(PROVIDERS).map(([k, p]) => [k, !!env[p.key]])),
          images: imageProvider(env),
          passwordRequired: !!env.ZARVIS_PASSWORD
        });
      }
      if (url.pathname === '/api/generate' && request.method === 'POST') return handleGenerate(request, env);
      if (url.pathname === '/api/images' && request.method === 'GET') return handleImages(url, env);
      if (url.pathname === '/api/models' && request.method === 'GET') return handleModels(url, env);
      if (url.pathname === '/api/images/track' && request.method === 'GET') return handleTrack(url, env);
      return json({ error: 'Not found.' }, 404);
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    return out;
  }
};
