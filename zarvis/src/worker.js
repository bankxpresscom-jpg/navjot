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
  const isHaiku = /haiku/.test(model);
  const params = {
    model,
    max_tokens: 32000,
    system,
    messages: [{ role: 'user', content: user }],
    output_config: {}
  };
  // JSON-schema output on the model families documented to support it; other models rely on the prompt + tolerant parsing
  if (/^claude-(opus-5|sonnet-5|haiku-4-5|fable-5|mythos-5|opus-4-8)(?!-5)/.test(model)) params.output_config.format = { type: 'json_schema', schema };
  if (!isHaiku) {
    params.thinking = { type: 'adaptive' };
    if (effort) params.output_config.effort = effort;
  }
  // Server-side fallback on refusals (Opus 5 / Fable family): re-runs a declined request on Anthropic's recommended model
  if (/^claude-(opus-5|fable-5)(?!-5)/.test(model)) {
    params.betas = ['server-side-fallback-2026-07-01'];
    params.fallbacks = 'default';
  }
  if (!Object.keys(params.output_config).length) delete params.output_config;
  const stream = client.beta.messages.stream(params);
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('Claude declined this request. Try rephrasing the brief.');
  if (msg.stop_reason === 'max_tokens') throw new Error('The response was cut off (max tokens). Try a shorter brief.');
  const text = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return { copy: parseJSON(text), usage: { input: msg.usage.input_tokens, output: msg.usage.output_tokens }, model: msg.model };
}

/* ---------------------------------------------------- OpenAI-compatible */
async function callOpenAICompatible(url, key, { model, system, user, effort, reasoning }) {
  const body = {
    model,
    messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    response_format: { type: 'json_object' }
  };
  if (reasoning && effort) body.reasoning_effort = effort === 'max' || effort === 'xhigh' ? 'high' : effort;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || `Provider error ${res.status}`);
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
  if (!res.ok) throw new Error(data.error?.message || `Gemini error ${res.status}`);
  const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  return { copy: parseJSON(text), usage: { input: data.usageMetadata?.promptTokenCount, output: data.usageMetadata?.candidatesTokenCount }, model };
}

const PROVIDERS = {
  anthropic: { key: 'ANTHROPIC_API_KEY', run: (env, a) => callAnthropic(env, a) },
  openai:    { key: 'OPENAI_API_KEY', run: (env, a) => callOpenAICompatible('https://api.openai.com/v1/chat/completions', env.OPENAI_API_KEY, { ...a, reasoning: /^(o\d|gpt-5)/.test(a.model) }) },
  groq:      { key: 'GROQ_API_KEY', run: (env, a) => callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, a) },
  gemini:    { key: 'GEMINI_API_KEY', run: (env, a) => callGemini(env, a) }
};

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
  const provider = PROVIDERS[body.provider];
  if (!provider) return json({ error: 'Unknown provider.' }, 400);
  if (!env[provider.key]) return json({ error: `No API key set for ${body.provider}. Add ${provider.key} in Cloudflare Pages → Settings → Variables and Secrets.` }, 400);
  const model = String(body.model || '').trim();
  if (!/^[\w.:\-/]{2,80}$/.test(model)) return json({ error: 'Invalid model name.' }, 400);
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
      const out = await provider.run(env, { model, effort, system: SYSTEM_PROMPT, user, schema });
      const site = out.copy;
      if (!site || typeof site !== 'object' || (mode === 'block' ? !site.block : !Array.isArray(site.blocks))) throw new Error('The AI answer was not a usable design. Try again or pick another model.');
      result = { site, usage: out.usage, model: out.model, provider: body.provider };
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
      if (url.pathname === '/api/images/track' && request.method === 'GET') return handleTrack(url, env);
      return json({ error: 'Not found.' }, 404);
    }
    const res = await env.ASSETS.fetch(request);
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
    return out;
  }
};
