/**
 * Live model discovery. Nothing is pinned: each provider is asked which models
 * this API key can use right now, and the newest suitable one is chosen for the
 * requested priority (best / balanced / fast). Lists are cached per worker
 * isolate for 30 minutes.
 */
import Anthropic from '@anthropic-ai/sdk';

export const KEYS = { anthropic: 'ANTHROPIC_API_KEY', openai: 'OPENAI_API_KEY', gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY' };
export const PROVIDER_ORDER = ['anthropic', 'openai', 'gemini', 'groq'];
const CACHE = new Map();
const TTL = 30 * 60 * 1000;

async function fetchList(env, provider) {
  if (provider === 'anthropic') {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const out = [];
    for await (const m of client.models.list({ limit: 100 })) { out.push({ id: m.id, created: Date.parse(m.created_at) || 0, label: m.display_name || m.id }); if (out.length >= 300) break; }
    return out;
  }
  if (provider === 'openai' || provider === 'groq') {
    const url = provider === 'openai' ? 'https://api.openai.com/v1/models' : 'https://api.groq.com/openai/v1/models';
    const r = await fetch(url, { headers: { Authorization: `Bearer ${env[KEYS[provider]]}` } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error?.message || `${provider} model list failed (${r.status})`);
    return (d.data || []).filter(m => m.active !== false).map(m => ({ id: m.id, created: (m.created || 0) * 1000, label: m.id, ctx: m.context_window || 0 }));
  }
  if (provider === 'gemini') {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000', { headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error?.message || `Gemini model list failed (${r.status})`);
    return (d.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => ({ id: String(m.name).replace(/^models\//, ''), created: 0, label: m.displayName || m.name }));
  }
  return [];
}

/** Only models that can write long JSON through the endpoint we call */
function usable(provider, id) {
  const s = id.toLowerCase();
  if (provider === 'anthropic') return /^claude-/.test(s) && !/claude-(instant|1|2)/.test(s);
  if (provider === 'openai') return /^(gpt-|o\d|chatgpt-)/.test(s) && !/(audio|realtime|transcribe|tts|image|search|embedding|instruct|moderation|dall|whisper|-pro\b|pro-|deep-research|computer|codex|oss|babbage|davinci|gpt-3\.5)/.test(s);
  if (provider === 'groq') return !/(whisper|tts|guard|playai|distil|orpheus|prompt|compound|allam|embed)/.test(s);
  if (provider === 'gemini') return /gemini/.test(s) && !/(embedding|aqa|image|tts|live|learnlm|robotics|computer|native-audio|gemma|nano|thinking-exp|exp-\d{4})/.test(s);
  return true;
}

export async function listModels(env, provider, { fresh = false } = {}) {
  if (!env[KEYS[provider]]) return [];
  const hit = CACHE.get(provider);
  if (!fresh && hit && Date.now() - hit.at < TTL) return hit.list;
  const list = (await fetchList(env, provider)).filter(m => usable(provider, m.id));
  CACHE.set(provider, { at: Date.now(), list });
  return list;
}

const newest = arr => [...arr].sort((a, b) => b.created - a.created || b.id.localeCompare(a.id))[0];
const sizeB = id => { const s = id.toLowerCase(); if (/kimi|k2/.test(s)) return 1000; if (/maverick/.test(s)) return 400; if (/scout/.test(s)) return 109; const m = s.match(/(\d+(?:\.\d+)?)b\b/); return m ? parseFloat(m[1]) : 0; };
const gemVer = id => { const m = id.match(/gemini-(\d+(?:\.\d+)?)/); return m ? parseFloat(m[1]) : 0; };
const gemTier = id => (/flash-lite|lite/.test(id) ? 1 : /flash/.test(id) ? 2 : /pro|ultra/.test(id) ? 3 : 2);

/** Choose a model from the live list. priority: best | balanced | fast. exclude: ids that just failed. */
export function pickModel(provider, list, priority = 'best', exclude = []) {
  const L = list.filter(m => !exclude.includes(m.id));
  if (!L.length) return '';
  const by = re => L.filter(m => re.test(m.id));
  if (provider === 'anthropic') {
    const top = by(/opus|fable|mythos/), mid = by(/sonnet/), low = by(/haiku/);
    const order = priority === 'fast' ? [low, mid, top] : priority === 'balanced' ? [mid, top, low] : [top, mid, low];
    const g = order.find(x => x.length); return (newest(g || L) || L[0]).id;
  }
  if (provider === 'openai') {
    // prefer alias ids without date stamps, newest family first
    const plain = L.filter(m => !/\d{4}-\d{2}-\d{2}|\d{4}$/.test(m.id));
    const pool = plain.length ? plain : L;
    const nano = pool.filter(m => /nano/.test(m.id)), mini = pool.filter(m => /mini/.test(m.id)), full = pool.filter(m => !/mini|nano/.test(m.id));
    const order = priority === 'fast' ? [nano, mini, full] : priority === 'balanced' ? [mini, full, nano] : [full, mini, nano];
    const g = order.find(x => x.length); return (newest(g) || pool[0]).id;
  }
  if (provider === 'gemini') {
    const alias = { best: 'gemini-pro-latest', balanced: 'gemini-flash-latest', fast: 'gemini-flash-lite-latest' }[priority];
    if (L.find(m => m.id === alias)) return alias;
    const want = { best: 3, balanced: 2, fast: 1 }[priority] || 3;
    const scored = L.map(m => ({ m, v: gemVer(m.id), t: gemTier(m.id), pre: /preview|exp/.test(m.id) ? 1 : 0 }))
      .sort((a, b) => (priority === 'best' ? b.v - a.v || Math.abs(a.t - want) - Math.abs(b.t - want) : Math.abs(a.t - want) - Math.abs(b.t - want) || b.v - a.v) || a.pre - b.pre || a.m.id.length - b.m.id.length);
    return scored[0].m.id;
  }
  // groq: capacity is the best proxy for quality; newest wins ties
  const ok = L.filter(m => !m.ctx || m.ctx >= 16000);
  const pool = ok.length ? ok : L;
  const sorted = [...pool].sort((a, b) => sizeB(b.id) - sizeB(a.id) || b.created - a.created);
  if (priority === 'fast') { const inst = pool.find(m => /instant|8b|scout/.test(m.id)); return (inst || sorted[sorted.length - 1]).id; }
  if (priority === 'balanced') return sorted[Math.min(1, sorted.length - 1)].id;
  return sorted[0].id;
}

export async function resolveModel(env, provider, priority, exclude = []) {
  try { return pickModel(provider, await listModels(env, provider), priority, exclude); }
  catch { return ''; }
}
export const firstProvider = env => PROVIDER_ORDER.find(p => env[KEYS[p]]) || '';

/** Does this error mean "that model is not available to this key"? */
export function isModelError(e) {
  const m = String(e?.message || '').toLowerCase();
  return e?.status === 404 || /model/.test(m) && /(not found|does not exist|not exist|decommission|deprecat|no longer|not supported|invalid|access|unknown|not available|retired)/.test(m);
}
