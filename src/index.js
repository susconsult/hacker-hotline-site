// Worker voor hacker-hotline-site.
// - POST /api/aanvraag: controleert een bestelaanvraag en stuurt ze door naar de Google Sheet.
// - Al de rest: de statische bestanden uit public/.
//
// Variabele in Cloudflare (Settings -> Runtime variables and secrets):
//   SHEET_URL (Secret): adres van de Apps Script web-app, eindigt op /exec

const LIMITS = { name: 120, org: 160, email: 160, phone: 40, address: 300, msg: 2000, id: 64 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function clean(v, max) {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

async function handleRequest(request, env) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

  let d;
  try {
    d = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400);
  }
  if (!d || typeof d !== 'object') return json({ ok: false, error: 'bad_json' }, 400);

  // Spam-val ingevuld: doe alsof het gelukt is, maar bewaar niets.
  if (clean(d.website, 200)) return json({ ok: true });

  const row = {
    id: clean(d.id, LIMITS.id) || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    page_lang: d.page_lang === 'fr' ? 'fr' : 'nl',
    name: clean(d.name, LIMITS.name),
    org: clean(d.org, LIMITS.org),
    email: clean(d.email, LIMITS.email),
    phone: clean(d.phone, LIMITS.phone),
    lang: d.lang === 'fr' ? 'fr' : 'nl',
    qty: Math.min(20, Math.max(1, parseInt(d.qty, 10) || 1)),
    delivery: d.delivery === 'ship' ? 'ship' : 'pickup',
    address: clean(d.address, LIMITS.address),
    msg: clean(d.msg, LIMITS.msg),
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email);
  if (!row.name || !row.org || !emailOk) return json({ ok: false, error: 'missing_fields' }, 400);
  if (row.delivery === 'ship' && !row.address) return json({ ok: false, error: 'missing_address' }, 400);
  if (row.delivery === 'pickup') row.address = '';

  if (!env.SHEET_URL) return json({ ok: false, error: 'not_configured' }, 503);

  try {
    const r = await fetch(env.SHEET_URL, {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
      redirect: 'follow',
    });
    const res = await r.json().catch(() => null);
    // Apps Script geeft ook bij een fout status 200 terug: alleen een expliciete bevestiging telt.
    if (res && res.ok === true) return json({ ok: true });
    console.log('sheet_error', JSON.stringify(res));
  } catch (err) {
    console.log('sheet_fetch_failed', String(err));
  }
  return json({ ok: false, error: 'upstream' }, 502);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/aanvraag') return handleRequest(request, env);
    return env.ASSETS.fetch(request);
  },
};
