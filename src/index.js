// Worker voor hacker-hotline-site.
// - POST /api/aanvraag: controleert een bestelling en stuurt ze door naar de Google Sheet.
// - Al de rest: de statische bestanden uit public/.
//
// Variabele in Cloudflare (Settings -> Runtime variables and secrets):
//   SHEET_URL (Secret): adres van de Apps Script web-app, eindigt op /exec

const PRICE = 39; // euro per spel, btw inbegrepen
const SHIPPING = 7.5; // euro per zending

const L = { name: 120, org: 160, email: 160, phone: 40, vat: 20, street: 120, number: 10, box: 10, postcode: 4, city: 80, msg: 2000, id: 64 };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

function clean(v, max) {
  return String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function address(d, prefix) {
  return {
    street: clean(d[prefix + '_street'], L.street),
    number: clean(d[prefix + '_number'], L.number),
    box: clean(d[prefix + '_box'], L.box),
    postcode: clean(d[prefix + '_postcode'], L.postcode),
    city: clean(d[prefix + '_city'], L.city),
  };
}

function addressOk(a) {
  return a.street && a.number && a.city && /^\d{4}$/.test(a.postcode);
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

  const qty = Math.min(20, Math.max(1, parseInt(d.qty, 10) || 1));
  const delivery = d.delivery === 'ship' ? 'ship' : 'pickup';
  const bill = address(d, 'bill');
  const sameAddress = d.same_address !== '0';
  let ship = { street: '', number: '', box: '', postcode: '', city: '' };
  if (delivery === 'ship') ship = sameAddress ? { ...bill } : address(d, 'ship');

  const row = {
    id: clean(d.id, L.id) || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    page_lang: d.page_lang === 'fr' ? 'fr' : 'nl',
    name: clean(d.name, L.name),
    org: clean(d.org, L.org),
    email: clean(d.email, L.email),
    phone: clean(d.phone, L.phone),
    lang: d.lang === 'fr' ? 'fr' : 'nl',
    qty,
    delivery,
    bill_name: clean(d.bill_name, L.org),
    vat: clean(d.vat, L.vat),
    bill_street: bill.street,
    bill_number: bill.number,
    bill_box: bill.box,
    bill_postcode: bill.postcode,
    bill_city: bill.city,
    bill_email: clean(d.bill_email, L.email),
    ship_street: ship.street,
    ship_number: ship.number,
    ship_box: ship.box,
    ship_postcode: ship.postcode,
    ship_city: ship.city,
    msg: clean(d.msg, L.msg),
    accepted: d.accept === '1',
    price: PRICE,
    shipping: delivery === 'ship' ? SHIPPING : 0,
  };
  row.total = qty * PRICE + row.shipping;

  if (!row.name || !row.org || !EMAIL.test(row.email)) return json({ ok: false, error: 'missing_fields' }, 400);
  if (!row.bill_name || !addressOk(bill)) return json({ ok: false, error: 'missing_billing' }, 400);
  if (row.bill_email && !EMAIL.test(row.bill_email)) return json({ ok: false, error: 'bad_bill_email' }, 400);
  if (delivery === 'ship' && !addressOk(ship)) return json({ ok: false, error: 'missing_address' }, 400);
  if (!row.accepted) return json({ ok: false, error: 'not_accepted' }, 400);

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
