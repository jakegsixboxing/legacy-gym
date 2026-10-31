// Singlet / merch sales API (31 Oct 2026). Routes by ?a=
//   a=share&s=slug GET  → /shop/<slug>: the public buy page (OG tags + /buy.js shell). vercel.json rewrites /shop/:slug here.
//   a=checkout     POST → {ref,email}: turns a saved order (shop_order_create) into a Shopify draft order, returns the pay link.
//                         Paid orders come back through the existing orders/paid webhook in api/fightnight.js (it looks for "Shop ref").
//   a=sync         POST → {token}: Jake only. Re-checks pending orders against Shopify and marks paid ones (belt and braces if a webhook is missed).
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "2843f90cb5c662bc60b1ae745415b154";
const APP = "https://legacygym-app.vercel.app";
const JAKE = "15a011b9-e222-45f0-8eb9-d5338da935d1";
const BUY_V = "202610311300";

export const config = { api: { bodyParser: false } };

const H = { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" };
const rpc = (fn, args) => fetch(SB_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: H, body: JSON.stringify(args || {}) }).then(r => r.json());
const escH = s => String(s == null ? "" : s).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const money = c => "$" + ((c || 0) / 100).toFixed(2).replace(/\.00$/, "");

async function shopifyGql(CS) {
  const tok = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + encodeURIComponent(CS)
  }).then(r => r.json());
  if (!tok || !tok.access_token) return null;
  return async (query, variables) => fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
    method: "POST", headers: { "X-Shopify-Access-Token": tok.access_token, "content-type": "application/json" },
    body: JSON.stringify({ query, variables })
  }).then(r => r.json());
}

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  const a = String((req.query && req.query.a) || "");
  if (a === "share") return share(req, res);
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const chunks = []; for await (const c of req) chunks.push(c);
  let body = {}; try { body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch (e) { body = {}; }
  if (a === "checkout") return checkout(res, body);
  if (a === "sync") return sync(res, body);
  return res.status(404).json({ error: "unknown_action" });
}

/* ---------- a=checkout ---------- */
async function checkout(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const ref = String(body.ref || "").trim().toUpperCase(), email = String(body.email || "").trim();
    if (!/^SG26-[A-Z0-9]{6}$/.test(ref) || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "bad_request" });
    const q = await rpc("shop_order_lookup", { p_ref: ref, p_email: email });
    if (!q || !q.ref) return res.status(404).json({ error: "not_found" });
    if (q.status === "paid") return res.status(409).json({ error: "already_paid" });
    if (q.status === "cancelled") return res.status(410).json({ error: "cancelled" });
    if (q.checkout_url && !body.fresh) return res.status(200).json({ ok: true, url: q.checkout_url, draft: q.shopify_draft, reused: true });
    if (!(q.unit_cents > 0) || !(q.qty > 0) || q.unit_cents * q.qty !== Number(q.total_cents)) return res.status(400).json({ error: "bad_items" });

    const gql = await shopifyGql(CS);
    if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });
    const created = await gql(
      `mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl } userErrors{ field message } } }`,
      { input: {
          email, tags: ["legacy-app", "shop", "singlet", "pickup"],
          note: `Shop ${ref} · ${q.product} · size ${q.size} × ${q.qty} · ${q.name}${q.mobile ? " · " + q.mobile : ""} · pick up at Legacy Gym`,
          customAttributes: [{ key: "Shop ref", value: ref }, { key: "Size", value: q.size }, { key: "Pick up", value: "Legacy Gym Kincumber" }],
          lineItems: [{ title: `${q.product} · Size ${q.size}`, quantity: q.qty, originalUnitPrice: (q.unit_cents / 100).toFixed(2), requiresShipping: false, taxable: true }]
      } });
    const d = created && created.data && created.data.draftOrderCreate;
    if (!d || !d.draftOrder || (d.userErrors && d.userErrors.length))
      return res.status(502).json({ error: "shopify_rejected", detail: (d && d.userErrors) || created.errors });
    const draft = d.draftOrder;
    await rpc("shop_order_set_checkout", { p_ref: ref, p_email: email, p_draft: draft.name, p_url: draft.invoiceUrl }).catch(() => {});
    if (body.test) {
      await gql(`mutation($input: DraftOrderDeleteInput!){ draftOrderDelete(input:$input){ deletedId userErrors{ message } } }`, { input: { id: draft.id } });
      return res.status(200).json({ ok: true, test: true, draft: draft.name, url: draft.invoiceUrl });
    }
    return res.status(200).json({ ok: true, url: draft.invoiceUrl, draft: draft.name });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=sync (Jake) ---------- */
async function sync(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + String(body.token || "") } }).then(r => r.json());
    if (!u || u.id !== JAKE) return res.status(401).json({ error: "jake_only" });
    const gql = await shopifyGql(CS);
    if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });
    const r = await gql(`{ orders(first: 100, query: "tag:shop financial_status:paid", sortKey: CREATED_AT, reverse: true){ nodes{ name email customAttributes{ key value } totalPriceSet{ shopMoney{ amount } } } } }`);
    const nodes = (r.data && r.data.orders && r.data.orders.nodes) || [];
    const done = [];
    for (const o of nodes) {
      const ca = (o.customAttributes || []).find(x => /shop ref/i.test(x.key || ""));
      if (!ca || !ca.value) continue;
      const j = await rpc("shop_order_mark_paid", { p_ref: ca.value, p_order: o.name, p_email: o.email || null, p_total_cents: Math.round(parseFloat(o.totalPriceSet.shopMoney.amount) * 100) });
      if (j && j.ok) done.push(ca.value);
    }
    return res.status(200).json({ ok: true, checked: nodes.length, marked: done });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=share → /shop/<slug> ---------- */
async function share(req, res) {
  const slug = String((req.query && req.query.s) || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  let p = null;
  if (slug) { try { const j = await rpc("shop_public", { p_slug: slug }); if (j && j.ok) p = j; } catch (e) {} }
  res.setHeader("content-type", "text/html; charset=utf-8");
  const head = "<!doctype html><html lang=\"en-AU\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"theme-color\" content=\"#06080a\"><meta name=\"robots\" content=\"noindex\">"
    + "<link rel=\"icon\" href=\"/icon-192.png\"><link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
    + "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@500;600;700;800&display=swap\">"
    + "<style>html,body{background:#06080a;color:#eef3f5;margin:0;font-family:Montserrat,system-ui,sans-serif}</style>";
  if (!p) {
    res.setHeader("cache-control", "no-store");
    return res.status(404).send(head + "<title>Legacy Gym · Shop</title></head><body style=\"min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px\"><div><h1 style=\"font-family:Oswald,sans-serif;text-transform:uppercase\">That link isn’t live</h1><p style=\"color:#8fa4ae\">Check the link you were sent. Legacy Gym Kincumber.</p></div></body></html>");
  }
  const title = p.name + (p.active && p.price_cents > 0 ? " · " + money(p.price_cents) : "") + " · Legacy Gym";
  const desc = (p.blurb || "Legacy Gym Kincumber.") + " Pick your size, pay online, pick up at the gym.";
  const img = p.image_url || (APP + "/img/shop/therapy-og.jpg");
  const url = APP + "/shop/" + p.slug;
  const html = head + "<title>" + escH(title) + "</title><meta name=\"description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:type\" content=\"product\"><meta property=\"og:site_name\" content=\"Legacy Gym Kincumber\"><meta property=\"og:title\" content=\"" + escH(title) + "\"><meta property=\"og:description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:image\" content=\"" + escH(img) + "\"><meta property=\"og:url\" content=\"" + url + "\"><meta name=\"twitter:card\" content=\"summary_large_image\"><meta name=\"twitter:image\" content=\"" + escH(img) + "\"></head>"
    + "<body><div id=\"buy\" data-slug=\"" + escH(p.slug) + "\"><noscript>Turn on JavaScript to buy " + escH(p.name) + ".</noscript></div><script src=\"/buy.js?v=" + BUY_V + "\"></script></body></html>";
  res.setHeader("cache-control", "public, max-age=30, s-maxage=60");
  return res.status(200).send(html);
}
