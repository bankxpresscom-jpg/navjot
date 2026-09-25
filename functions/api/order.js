/**
 * POST /api/order: Cloudflare Pages Function for direct book orders.
 *
 * Bindings (Pages project → Settings → Bindings / Variables and Secrets):
 *   DB                D1 database binding named "DB". Create it and apply schema.sql:
 *                       npx wrangler d1 create navjot-orders
 *                       npx wrangler d1 execute navjot-orders --remote --file=schema.sql
 *   ZEPTOMAIL_TOKEN   (secret) ZeptoMail "Send Mail" API token. The "Zoho-enczapikey " prefix is optional.
 *   MAIL_FROM         (var) sender on a domain verified in ZeptoMail, e.g. orders@your-domain.com
 *   MAIL_TO           (var) inbox that receives order notifications
 *   ZEPTOMAIL_API     (var, optional) defaults to the India data centre: https://api.zeptomail.in/v1.1/email
 *                     (use https://api.zeptomail.com/v1.1/email for the US data centre)
 *   BOOK_PRICE_INR    (var, optional) must match CONFIG.BOOK_PRICE_INR in public/assets/app.js
 *   SHIPPING_INR      (var, optional) must match CONFIG.SHIPPING_INR in public/assets/app.js
 *   BOOK_TITLE        (var, optional) used in the notification email
 *
 * The amount is always recomputed on the server; the client's amount is only
 * compared so a price mismatch is flagged in the notification.
 */

const DEFAULTS = { price: 499, shipping: 60, maxQty: 10 };
const MAX_BODY = 8 * 1024;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function validate(b, maxQty) {
  const phoneDigits = String(b.phone ?? '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  const o = {
    ref: clean(b.ref, 20).toUpperCase(),
    name: clean(b.name, 80),
    phone: phoneDigits,
    email: clean(b.email, 120).toLowerCase(),
    address: clean(b.address, 400),
    pincode: clean(b.pincode, 6),
    qty: Number.parseInt(b.qty, 10),
    utr: String(b.utr ?? '').replace(/\s/g, '').toUpperCase().slice(0, 22)
  };
  if (!/^NK-[A-Z0-9]{6,14}$/.test(o.ref)) return [null, 'Invalid order reference. Please reload and try again.'];
  if (o.name.length < 2) return [null, 'Please enter your full name.'];
  if (!/^[6-9]\d{9}$/.test(o.phone)) return [null, 'Please enter a valid 10-digit Indian mobile number.'];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.email)) return [null, 'Please enter a valid email address.'];
  if (o.address.length < 10) return [null, 'Please enter your full delivery address.'];
  if (!/^[1-9]\d{5}$/.test(o.pincode)) return [null, 'Please enter a valid 6-digit pincode.'];
  if (!Number.isInteger(o.qty) || o.qty < 1 || o.qty > maxQty) return [null, `Quantity must be between 1 and ${maxQty}.`];
  if (!/^[A-Z0-9]{10,22}$/.test(o.utr)) return [null, 'Please enter a valid UTR / transaction ID.'];
  return [o, null];
}

async function notify(env, order, extra) {
  if (!env.ZEPTOMAIL_TOKEN || !env.MAIL_FROM || !env.MAIL_TO) return;
  const token = env.ZEPTOMAIL_TOKEN.startsWith('Zoho-enczapikey') ? env.ZEPTOMAIL_TOKEN : `Zoho-enczapikey ${env.ZEPTOMAIL_TOKEN}`;
  const rows = [
    ['Order ref', order.id], ['Created', order.created_at], ['Book', env.BOOK_TITLE || 'Book'],
    ['Quantity', order.qty], ['Amount', `₹${order.amount}`], ['UTR', order.utr],
    ['Name', order.name], ['Phone', `+91 ${order.phone}`], ['Email', order.email],
    ['Address', order.address], ['Pincode', order.pincode], ['Status', 'pending (verify UTR in your UPI app)']
  ];
  if (extra) rows.push(['Note', extra]);
  const htmlbody = `<div style="font-family:Arial,sans-serif;max-width:560px">
    <h2 style="color:#0B1C6E;margin:0 0 12px">New book order ${esc(order.id)}</h2>
    <table cellpadding="8" style="border-collapse:collapse;width:100%">${rows.map(([k, v]) =>
      `<tr><td style="border-bottom:1px solid #eee;color:#666;width:34%">${esc(k)}</td><td style="border-bottom:1px solid #eee"><b>${esc(v)}</b></td></tr>`).join('')}</table>
    <p style="color:#666;font-size:13px">Verify the UTR against your UPI statement before shipping.</p></div>`;
  const res = await fetch(env.ZEPTOMAIL_API || 'https://api.zeptomail.in/v1.1/email', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: token },
    body: JSON.stringify({
      from: { address: env.MAIL_FROM, name: 'Book orders' },
      to: [{ email_address: { address: env.MAIL_TO } }],
      reply_to: [{ address: order.email, name: order.name }],
      subject: `New book order ${order.id} · ₹${order.amount} · ${order.name}`,
      htmlbody
    })
  });
  if (!res.ok) console.error('ZeptoMail error', res.status, await res.text().catch(() => ''));
}

async function handlePost({ request, env, waitUntil }) {
  // Same-origin browsers only (basic CSRF guard)
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false, error: 'Forbidden' }, 403);
  if (!(request.headers.get('Content-Type') || '').includes('application/json')) return json({ ok: false, error: 'Unsupported content type' }, 415);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'Request too large' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Invalid request' }, 400); }
  if (!body || typeof body !== 'object') return json({ ok: false, error: 'Invalid request' }, 400);

  // Honeypot: bots fill the hidden "company" field. Pretend success, store nothing.
  if (clean(body.company, 100)) return json({ ok: true, ref: clean(body.ref, 20) || 'NK-RECEIVED' });

  const price = Number(env.BOOK_PRICE_INR) || DEFAULTS.price;
  const shipping = Number(env.SHIPPING_INR ?? DEFAULTS.shipping);
  const [o, err] = validate(body, DEFAULTS.maxQty);
  if (err) return json({ ok: false, error: err }, 422);
  if (!env.DB) return json({ ok: false, error: 'Orders are temporarily unavailable. Please contact us on WhatsApp.' }, 503);

  const amount = o.qty * price + (Number.isFinite(shipping) ? shipping : DEFAULTS.shipping);
  const clientAmount = Number(body.amount);
  const note = Number.isFinite(clientAmount) && clientAmount !== amount
    ? `Price mismatch: customer saw ₹${clientAmount}, server computed ₹${amount}. Check CONFIG vs env vars.` : '';
  const order = { id: o.ref, created_at: new Date().toISOString(), ...o, amount };

  try {
    await env.DB.prepare(
      `INSERT INTO orders (id, created_at, name, phone, email, address, pincode, qty, amount, utr, status)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, 'pending')`
    ).bind(order.id, order.created_at, order.name, order.phone, order.email, order.address, order.pincode, order.qty, order.amount, order.utr).run();
  } catch (e) {
    const msg = String(e && e.message || e);
    if (msg.includes('UNIQUE') && msg.includes('utr')) return json({ ok: false, error: 'This transaction ID has already been used for an order.' }, 409);
    if (msg.includes('UNIQUE')) return json({ ok: false, error: 'This order was already submitted. Please reload to place a new one.' }, 409);
    console.error('D1 insert failed', msg);
    return json({ ok: false, error: 'Could not save your order. Please try again.' }, 500);
  }

  waitUntil(notify(env, order, note).catch(e => console.error('notify failed', e)));
  return json({ ok: true, ref: order.id });
}

export function onRequest(context) {
  if (context.request.method === 'POST') return handlePost(context);
  return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
}
