// Fight Night API (one function: Vercel Hobby allows 12). Routes by ?a=
//   a=checkout     public  → turns a saved sponsorship request (ref + email) into a Shopify draft order, returns the pay link
//   a=paid         Shopify orders/paid webhook → marks the sponsorship paid in the app
//   a=setup        Jake/Alison → registers the orders/paid webhook with Shopify (run once)
//   a=ticket-email staff   → emails a Fight Night ticket link (was /api/fn-ticket-email; vercel.json rewrites it here)
//   a=share&f=slug GET     → /fightnight/<fighter-slug>: the fighter's "Hold Me a Ticket" page (OG tags + /fh.js shell)
//   a=shop-share&s=slug GET → /shop/<slug>: singlet / merch buy page (or a multi-design drop → drop.js) (OG tags + /buy.js shell). Shop routes live here because Hobby allows 12 functions.
//   a=shop-checkout public  → {ref,email}: saved shop order (shop_order_create) → Shopify draft order → pay link
//   a=shop-sync     Jake    → re-checks paid shop orders in Shopify (if a webhook was missed)
//   a=crew-sms      fighter → texts the fighter's own ticket holders via ClickSend (fh_crew_targets / fh_crew_log; numbers never leave the server)
//   a=buy-checkout  public  → {token,ref}: a Fight Night ticket order saved by fn_buy_prepare (from /t/<token>) → Shopify draft order → pay link
//   a=buy-env       public  → which mail/Shopify settings are present (true/false only, never values) so the ticket flow can be checked
//   a=paid also handles ticket orders ("Ticket ref" FN26-XXXXXX): marks the order paid and emails the buyer a confirmation
import crypto from "crypto";
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "2843f90cb5c662bc60b1ae745415b154";
const APP = "https://legacygym-app.vercel.app";
const RETURN_BASE = APP + "/sponsor";
const HOOK = APP + "/api/fightnight?a=paid";
const ADMINS = ["15a011b9-e222-45f0-8eb9-d5338da935d1", "f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce", "09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb"]; // Jake, Alison, Kelly
const SPONSOR_ADMINS = ADMINS.slice(0, 2);

export const config = { api: { bodyParser: false } };

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
  if (a === "shop-share") return shopShare(req, res);
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  let body = {}; if (a !== "paid") { try { body = JSON.parse(raw.toString("utf8") || "{}"); } catch (e) { body = {}; } }

  if (a === "paid") return paid(req, res, raw);
  if (a === "checkout") return checkout(res, body);
  if (a === "setup") return setup(res, body);
  if (a === "ticket-email") return ticketEmail(res, body);
  if (a === "shop-checkout") return shopCheckout(res, body);
  if (a === "shop-sync") return shopSync(res, body);
  if (a === "waiver-mail") return waiverMail(res, body);
  if (a === "crew-sms") return crewSms(req, res, body);
  if (a === "buy-checkout") return buyCheckout(res, body);
  if (a === "buy-env") return buyEnv(res, body);
  return res.status(404).json({ error: "unknown_action" });
}

/* ---------- a=checkout ---------- */
async function checkout(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const b = body;
    const ref = String(b.ref || "").trim().toUpperCase(), email = String(b.email || "").trim();
    if (!/^(RS|SF)26-[A-Z0-9]{6}$/.test(ref) || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "bad_request" });
    const H = { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" };
    const q = await fetch(SB_URL + "/rest/v1/rpc/fn_sponsor_lookup", { method: "POST", headers: H, body: JSON.stringify({ p_ref: ref, p_email: email }) }).then(r => r.json());
    if (!q || !q.ref) return res.status(404).json({ error: "not_found" });
    if (q.status === "paid") return res.status(409).json({ error: "already_paid" });
    if (q.checkout_url && !b.fresh) return res.status(200).json({ ok: true, url: q.checkout_url, draft: q.shopify_draft, reused: true });
    const items = Array.isArray(q.items) ? q.items : [];
    const total = items.reduce((a, i) => a + (Number(i.price) || 0), 0);
    if (!items.length || !(total > 0) || total !== Number(q.total_cents)) return res.status(400).json({ error: "bad_items" });

    const gql = await shopifyGql(CS);
    if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });

    const who = q.business ? `${q.business} (${q.name})` : q.name;
    const what = q.kind === "kit" ? `Sponsor a Fighter · ${q.fighter_name || "fighter"}` : "Fight Night ring sponsorship";
    const created = await gql(
      `mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl } userErrors{ field message } } }`,
      { input: {
          email, tags: ["legacy-app", "sponsor", q.kind === "kit" ? "sponsor-fighter" : "sponsor-ring", "fight-night-2026"],
          note: `Sponsor ${ref} · ${what} · ${who}`,
          customAttributes: [{ key: "Sponsor ref", value: ref }, { key: "Sponsorship", value: what }],
          lineItems: items.map(i => ({ title: `${what} — ${i.label || i.id}`, quantity: 1, originalUnitPrice: (Number(i.price) / 100).toFixed(2), requiresShipping: false, taxable: false }))
      } });
    const d = created && created.data && created.data.draftOrderCreate;
    if (!d || !d.draftOrder || (d.userErrors && d.userErrors.length))
      return res.status(502).json({ error: "shopify_rejected", detail: (d && d.userErrors) || created.errors });
    const draft = d.draftOrder;
    const url = draft.invoiceUrl;
    await fetch(SB_URL + "/rest/v1/rpc/fn_sponsor_set_checkout", { method: "POST", headers: H, body: JSON.stringify({ p_ref: ref, p_email: email, p_draft: draft.name, p_url: url }) }).catch(() => {});
    if (b.test) {
      await gql(`mutation($input: DraftOrderDeleteInput!){ draftOrderDelete(input:$input){ deletedId userErrors{ message } } }`, { input: { id: draft.id } });
      return res.status(200).json({ ok: true, test: true, draft: draft.name, url });
    }
    return res.status(200).json({ ok: true, url, draft: draft.name, draftId: draft.id, back: RETURN_BASE + "?paid=1&ref=" + ref });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=paid (Shopify orders/paid webhook) ---------- */
async function paid(req, res, raw) {
  const given = String(req.headers["x-shopify-hmac-sha256"] || "");
  const secrets = [process.env.SHOPIFY_WEBHOOK_SECRET, process.env.SHOPIFY_CLIENT_SECRET].filter(Boolean);
  if (!secrets.length) return res.status(500).json({ error: "no_secret" });
  const okSig = secrets.some(s => { const exp = crypto.createHmac("sha256", s).update(raw).digest("base64"); const a = Buffer.from(exp), b = Buffer.from(given); return a.length === b.length && crypto.timingSafeEqual(a, b); });
  if (!okSig) return res.status(401).json({ error: "bad_hmac" });

  let order; try { order = JSON.parse(raw.toString("utf8")); } catch (e) { return res.status(400).json({ error: "bad_json" }); }
  const fin = String(order.financial_status || "").toLowerCase();
  if (fin && fin !== "paid" && fin !== "partially_paid") return res.status(200).json({ ok: true, skipped: fin });

  const attrs = Array.isArray(order.note_attributes) ? order.note_attributes : [];
  const emailAny = order.email || (order.customer && order.customer.email) || null;
  const totalAny = Math.round(parseFloat(order.total_price || "0") * 100) || null;
  const nameAny = order.name || (order.order_number ? "#" + order.order_number : String(order.id));
  // Fight Night ticket orders (built by /t/<token> + a=buy-checkout) carry "Ticket ref" FN26-XXXXXX and "Ticket link" <token>
  let tRef = null, tTok = null;
  for (const na of attrs) { const k = String((na && na.name) || ""); if (/ticket ref/i.test(k)) tRef = String(na.value || "").trim().toUpperCase(); if (/ticket link/i.test(k)) tTok = String(na.value || "").trim(); }
  if (!tRef) { const m = String(order.note || "").match(/\b(FN26-[A-Z0-9]{6})\b/i); if (m) tRef = m[1].toUpperCase(); }
  if (tRef) return ticketPaid(res, tRef, tTok, nameAny, totalAny);
  // Shop (singlets / merch) orders carry a "Shop ref" attribute — see api/shop.js
  let shopRef = null;
  for (const na of attrs) if (na && /shop ref/i.test(String(na.name || ""))) shopRef = String(na.value || "").trim().toUpperCase();
  if (!shopRef) { const m = String(order.note || "").match(/\b(SG26-[A-Z0-9]{6})\b/i); if (m) shopRef = m[1].toUpperCase(); }
  if (shopRef) {
    const r2 = await fetch(SB_URL + "/rest/v1/rpc/shop_order_mark_paid", {
      method: "POST", headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON, "content-type": "application/json" },
      body: JSON.stringify({ p_ref: shopRef, p_order: nameAny, p_email: emailAny, p_total_cents: totalAny })
    });
    const j2 = await r2.json().catch(() => null);
    return res.status(200).json({ ok: r2.ok, shop: shopRef, order: nameAny, result: j2 });
  }

  let ref = null;
  for (const na of attrs) if (na && /sponsor ref/i.test(String(na.name || ""))) ref = String(na.value || "").trim().toUpperCase();
  if (!ref) { const m = String(order.note || "").match(/\b((?:RS|SF)26-[A-Z0-9]{6})\b/i); if (m) ref = m[1].toUpperCase(); }
  if (!ref) return res.status(200).json({ ok: true, skipped: "not_a_sponsorship" });
  const email = order.email || (order.customer && order.customer.email) || null;
  const totalCents = Math.round(parseFloat(order.total_price || "0") * 100) || null;
  const orderName = order.name || (order.order_number ? "#" + order.order_number : String(order.id));

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || SB_ANON; // service key = strongest; anon path still needs ref + email + our checkout to match
  const r = await fetch(SB_URL + "/rest/v1/rpc/fn_sponsor_mark_paid", {
    method: "POST", headers: { apikey: key, Authorization: "Bearer " + key, "content-type": "application/json" },
    body: JSON.stringify({ p_ref: ref, p_order: orderName, p_email: email, p_total_cents: totalCents })
  });
  const j = await r.json().catch(() => null);
  return res.status(200).json({ ok: r.ok, ref, order: orderName, result: j });
}

/* ---------- a=setup ---------- */
async function setup(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const { token } = body;
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + token } }).then(r => r.json());
    if (!u || SPONSOR_ADMINS.indexOf(u.id) < 0) return res.status(401).json({ error: "admins_only" });
    const gql = await shopifyGql(CS);
    if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });
    const list = await gql(`{ webhookSubscriptions(first: 50){ nodes{ id topic endpoint{ __typename ... on WebhookHttpEndpoint { callbackUrl } } } } }`);
    const nodes = (list.data && list.data.webhookSubscriptions && list.data.webhookSubscriptions.nodes) || [];
    const existing = nodes.filter(n => n.topic === "ORDERS_PAID" && n.endpoint && n.endpoint.callbackUrl === HOOK);
    if (existing.length) return res.status(200).json({ ok: true, existing: existing.map(n => n.id), all: nodes });
    const created = await gql(
      `mutation($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!){ webhookSubscriptionCreate(topic:$topic, webhookSubscription:$sub){ webhookSubscription{ id } userErrors{ field message } } }`,
      { topic: "ORDERS_PAID", sub: { callbackUrl: HOOK, format: "JSON" } });
    const c = created.data && created.data.webhookSubscriptionCreate;
    return res.status(200).json({ ok: !!(c && c.webhookSubscription), created: c && c.webhookSubscription, errors: (c && c.userErrors) || created.errors || null, all: nodes });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=ticket-email ---------- */
async function ticketEmail(res, body) {
  try {
    const { token, ticket_token, to } = body;
    if (!token || !ticket_token || !to || !/^\S+@\S+\.\S+$/.test(String(to))) return res.status(400).json({ error: "bad_request" });
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + token } }).then(r => r.json());
    if (!u || !u.id || !ADMINS.includes(u.id)) return res.status(401).json({ error: "bad_auth" });

    const t = await fetch(SB_URL + "/rest/v1/rpc/fn_ticket_public", {
      method: "POST", headers: { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" },
      body: JSON.stringify({ p_token: ticket_token })
    }).then(r => r.json());
    if (!t || !t.id) return res.status(404).json({ error: "no_ticket" });

    const BREVO = process.env.BREVO_API_KEY;
    const RESEND = process.env.RESEND_API_KEY;
    if (!BREVO && !RESEND) return res.status(200).json({ skipped: "not_configured" });

    const link = APP + "/ticket?t=" + encodeURIComponent(ticket_token);
    const ev = t.event || {};
    const d = ev.date ? new Date(ev.date + "T12:00:00+11:00") : null;
    const dateStr = d ? d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
    const fighter = t.fighter && t.fighter.name ? t.fighter.name : null;
    const subject = "Your Fight Night ticket · " + (t.tier || "") + " · " + t.id;
    const text = "Hey " + (t.holder || "") + ",\n\nHere's your ticket for Fight Club Fight Night at Legacy Gym, Kincumber.\n\n" +
      "Open your ticket: " + link + "\n\n" +
      "When: " + dateStr + (ev.doors ? " · Doors " + ev.doors : "") + (ev.bell ? " · First bell " + ev.bell : "") + "\n" +
      "Experience: " + (t.tier || "") + "\n" +
      (fighter ? "In the corner of: " + fighter + "\n" : "") +
      "Admission code: " + t.id + "\n\n" +
      "Show the QR code on that page at the door. One scan, one entry. Screenshots work.\n\n" +
      "(This is a demonstration ticket while the system is being set up. No payment has been taken.)\n\n— Legacy Gym · Fight Club Central Coast";
    const html = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0b0b0c;color:#f2f0eb;padding:28px;border-radius:16px">' +
      '<div style="font-size:11px;letter-spacing:3px;color:#c9a44c;text-transform:uppercase">Legacy Gym Kincumber presents</div>' +
      '<h1 style="font-size:34px;margin:8px 0 4px;letter-spacing:1px;text-transform:uppercase">Fight Night</h1>' +
      '<div style="color:#9a9891;font-size:13px">' + dateStr + (ev.doors ? " · Doors " + ev.doors : "") + (ev.bell ? " · First bell " + ev.bell : "") + '</div>' +
      '<div style="margin:22px 0;padding:16px;border:1px solid #3a3320;border-radius:12px">' +
      '<div style="font-size:11px;letter-spacing:2px;color:#9a9891;text-transform:uppercase">Experience</div><div style="font-size:22px;font-weight:bold;color:#F1D27A;text-transform:uppercase">' + (t.tier || "") + '</div>' +
      '<div style="margin-top:12px;font-size:14px"><b>Holder:</b> ' + (t.holder || "") + (fighter ? '<br><b>In the corner of:</b> ' + fighter : "") + '<br><b>Admission code:</b> <span style="font-family:monospace">' + t.id + '</span></div></div>' +
      '<a href="' + link + '" style="display:block;background:#c9a44c;color:#0b0b0c;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:bold;font-size:16px;letter-spacing:1px;text-transform:uppercase">Open my ticket</a>' +
      '<p style="color:#9a9891;font-size:12px;line-height:1.6;margin-top:18px">Show the QR code on that page at the door. One scan, one entry. Screenshots work.<br><br>This is a demonstration ticket while the system is being set up. No payment has been taken.</p>' +
      '<div style="color:#5a4d2a;font-size:11px;margin-top:16px">Legacy Gym · Fight Club Central Coast</div></div>';

    let sent = false, detail = null;
    if (BREVO) {
      const from = process.env.MAIL_FROM || "jakegsixboxing@gmail.com";
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST", headers: { "api-key": BREVO, "content-type": "application/json" },
        body: JSON.stringify({ sender: { name: "Legacy Gym Fight Night", email: from }, to: [{ email: to }], subject, textContent: text, htmlContent: html })
      });
      sent = r.ok; if (!r.ok) detail = await r.text().catch(() => null);
    } else if (RESEND) {
      const from = process.env.MAIL_FROM || "Legacy Gym Fight Night <onboarding@resend.dev>";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { authorization: "Bearer " + RESEND, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, text, html })
      });
      sent = r.ok; if (!r.ok) detail = await r.text().catch(() => null);
    }
    return res.status(200).json({ sent, detail });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=share (GET) · /fightnight/<slug> = the fighter's "Hold Me a Ticket" page ----------
   Writes the link-preview tags (poster as the image) and a shell that /fh.js fills from RPC fh_public.
   Unknown slug -> the general Fight Night page. */
const escH = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const FH_V = "202611011740";
async function share(req, res) {
  const slug = String((req.query && req.query.f) || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);
  let f = null;
  if (slug) {
    try {
      const r = await fetch(SB_URL + "/rest/v1/rpc/fh_public", { method: "POST", headers: { apikey: SB_ANON, Authorization: "Bearer " + SB_ANON, "content-type": "application/json" }, body: JSON.stringify({ p_slug: slug }) });
      const j = await r.json();
      if (j && j.ok && j.fighter) f = j.fighter;
    } catch (e) {}
  }
  if (!f) {
    // Unknown or retired fighter: a plain dead-end card. No links anywhere else.
    res.setHeader("content-type", "text/html; charset=utf-8"); res.setHeader("cache-control", "no-store");
    return res.status(404).send("<!doctype html><html lang=\"en-AU\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"noindex\"><title>Fight Night</title>"
      + "<style>html,body{background:#06080a;color:#eef3f5;margin:0;font-family:Montserrat,system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px}img{height:56px;margin-bottom:18px}h1{font-size:22px;margin:0 0 8px}p{color:#8fa4ae;font-size:14px;line-height:1.5;max-width:34ch;margin:0 auto}</style></head>"
      + "<body><div><img src=\"/img/fc/fc-logo.png\" alt=\"\"><h1>That fighter page isn\u2019t live</h1><p>Check the link you were sent \u2014 every fighter has their own page. Fight Club Central Coast \u00b7 Fight Night \u00b7 Sat 19 December.</p></div></body></html>");
  }
  const name = f.name, first = f.first;
  const img = f.poster || f.photo || (APP + "/img/fc/share/og-default.jpg");
  const title = name + " · Fight Night, Sat 19 Dec · Hold me a ticket";
  const desc = "Hold a ticket to " + first + "'s name — nothing to pay today. First shot at tickets when they release, at the pre-sale discount. Legacy Gym Kincumber.";
  const url = APP + "/fightnight/" + f.slug;
  const html = "<!doctype html><html lang=\"en-AU\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"theme-color\" content=\"#06080a\">"
    + "<title>" + escH(title) + "</title><meta name=\"description\" content=\"" + escH(desc) + "\"><meta name=\"robots\" content=\"noindex\">"
    + "<meta property=\"og:type\" content=\"website\"><meta property=\"og:site_name\" content=\"Legacy Gym · Fight Club Central Coast\">"
    + "<meta property=\"og:title\" content=\"" + escH(title) + "\"><meta property=\"og:description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:image\" content=\"" + escH(img) + "\"><meta property=\"og:url\" content=\"" + url + "\"><meta name=\"twitter:card\" content=\"summary_large_image\"><meta name=\"twitter:image\" content=\"" + escH(img) + "\">"
    + "<link rel=\"icon\" href=\"/img/fc/fc-logo.png\"><link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
    + "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@500;600;700;800&display=swap\">"
    + "<style>html,body{background:#06080a;color:#eef3f5;margin:0;font-family:Montserrat,system-ui,sans-serif}</style></head>"
    + "<body><div id=\"fh\" data-slug=\"" + escH(f.slug) + "\"><noscript>Turn on JavaScript to hold a ticket for " + escH(name) + ".</noscript></div>"
    + "<script src=\"/fh.js?v=" + FH_V + "\"></script></body></html>";
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "public, max-age=60, s-maxage=120");
  return res.status(200).send(html);
}

/* ================= SHOP (singlets / merch) ================= */
const SHOP_H = { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" };
const shopRpc = (fn, args) => fetch(SB_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: SHOP_H, body: JSON.stringify(args || {}) }).then(r => r.json());
const shopMoney = c => "$" + ((c || 0) / 100).toFixed(2).replace(/\.00$/, "");
const BUY_V = "202610311340";
const DROP_V = "202611021330";
const JAKE_ID = "15a011b9-e222-45f0-8eb9-d5338da935d1";

/* ---------- a=shop-checkout ---------- */
async function shopCheckout(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const ref = String(body.ref || "").trim().toUpperCase(), email = String(body.email || "").trim();
    if (!/^SG26-[A-Z0-9]{6}$/.test(ref) || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: "bad_request" });
    const cart = await shopRpc("shop_cart_lookup", { p_ref: ref, p_email: email }).catch(() => null);
    if (cart && cart.ref && Array.isArray(cart.lines) && cart.lines.length) return shopCartCheckout(res, body, ref, email, cart, CS);
    const q = await shopRpc("shop_order_lookup", { p_ref: ref, p_email: email });
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
    await shopRpc("shop_order_set_checkout", { p_ref: ref, p_email: email, p_draft: draft.name, p_url: draft.invoiceUrl }).catch(() => {});
    if (body.test) {
      await gql(`mutation($input: DraftOrderDeleteInput!){ draftOrderDelete(input:$input){ deletedId userErrors{ message } } }`, { input: { id: draft.id } });
      return res.status(200).json({ ok: true, test: true, draft: draft.name, url: draft.invoiceUrl });
    }
    return res.status(200).json({ ok: true, url: draft.invoiceUrl, draft: draft.name });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* one Shopify draft for a whole drop cart (several designs/sizes, bundle unit price on every line) */
async function shopCartCheckout(res, body, ref, email, q, CS) {
  if (q.status === "paid") return res.status(409).json({ error: "already_paid" });
  if (q.checkout_url && !body.fresh) return res.status(200).json({ ok: true, url: q.checkout_url, draft: q.shopify_draft, reused: true });
  let sum = 0;
  for (const l of q.lines) { if (!(l.unit_cents > 0) || !(l.qty > 0) || l.unit_cents * l.qty !== Number(l.total_cents)) return res.status(400).json({ error: "bad_items" }); sum += Number(l.total_cents); }
  if (sum !== Number(q.total_cents)) return res.status(400).json({ error: "bad_items" });
  const gql = await shopifyGql(CS);
  if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });
  const summary = q.lines.map(l => `${l.product} ${l.size}×${l.qty}`).join(", ");
  const created = await gql(
    `mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl } userErrors{ field message } } }`,
    { input: {
        email, tags: ["legacy-app", "shop", "singlet", "pickup", "singlet-drop"],
        note: `Shop ${ref} · ${summary} · ${q.qty} singlets at ${shopMoney(q.lines[0].unit_cents)} each · ${q.name}${q.mobile ? " · " + q.mobile : ""} · pre-order, pick up at Legacy Gym`,
        customAttributes: [{ key: "Shop ref", value: ref }, { key: "Singlets", value: String(q.qty) }, { key: "Pick up", value: "Legacy Gym Kincumber" }],
        lineItems: q.lines.map(l => ({ title: `${l.product} singlet · Size ${l.size}`, quantity: l.qty, originalUnitPrice: (l.unit_cents / 100).toFixed(2), requiresShipping: false, taxable: true }))
    } });
  const d = created && created.data && created.data.draftOrderCreate;
  if (!d || !d.draftOrder || (d.userErrors && d.userErrors.length))
    return res.status(502).json({ error: "shopify_rejected", detail: (d && d.userErrors) || created.errors });
  const draft = d.draftOrder;
  await shopRpc("shop_order_set_checkout", { p_ref: ref, p_email: email, p_draft: draft.name, p_url: draft.invoiceUrl }).catch(() => {});
  if (body.test) {
    await gql(`mutation($input: DraftOrderDeleteInput!){ draftOrderDelete(input:$input){ deletedId userErrors{ message } } }`, { input: { id: draft.id } });
    return res.status(200).json({ ok: true, test: true, draft: draft.name, url: draft.invoiceUrl, lines: q.lines.length, total: q.total_cents });
  }
  return res.status(200).json({ ok: true, url: draft.invoiceUrl, draft: draft.name });
}

/* ---------- a=shop-sync (Jake) ---------- */
async function shopSync(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + String(body.token || "") } }).then(r => r.json());
    if (!u || u.id !== JAKE_ID) return res.status(401).json({ error: "jake_only" });
    const gql = await shopifyGql(CS);
    if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });
    const r = await gql(`{ orders(first: 100, query: "tag:shop financial_status:paid", sortKey: CREATED_AT, reverse: true){ nodes{ name email customAttributes{ key value } totalPriceSet{ shopMoney{ amount } } } } }`);
    const nodes = (r.data && r.data.orders && r.data.orders.nodes) || [];
    const done = [];
    for (const o of nodes) {
      const ca = (o.customAttributes || []).find(x => /shop ref/i.test(x.key || ""));
      if (!ca || !ca.value) continue;
      const j = await shopRpc("shop_order_mark_paid", { p_ref: ca.value, p_order: o.name, p_email: o.email || null, p_total_cents: Math.round(parseFloat(o.totalPriceSet.shopMoney.amount) * 100) });
      if (j && j.ok) done.push(ca.value);
    }
    return res.status(200).json({ ok: true, checked: nodes.length, marked: done });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=shop-share → /shop/<slug> ---------- */
async function shopShare(req, res) {
  const slug = String((req.query && req.query.s) || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  let p = null;
  if (slug) { try { const j = await shopRpc("shop_public", { p_slug: slug }); if (j && j.ok) p = j; } catch (e) {} }
  if (p && p.drop_slug) { res.setHeader("cache-control", "public, max-age=60"); res.setHeader("location", "/shop/" + p.drop_slug); return res.status(302).end(); }
  if (!p && slug) { try { const j = await shopRpc("shop_drop_public", { p_slug: slug }); if (j && j.ok) return dropShare(res, j); } catch (e) {} }
  res.setHeader("content-type", "text/html; charset=utf-8");
  const head = shopHead();
  if (!p) {
    res.setHeader("cache-control", "no-store");
    return res.status(404).send(head + "<title>Legacy Gym · Shop</title></head><body style=\"min-height:100vh;display:grid;place-items:center;text-align:center;padding:24px\"><div><h1 style=\"font-family:Oswald,sans-serif;text-transform:uppercase\">That link isn’t live</h1><p style=\"color:#8fa4ae\">Check the link you were sent. Legacy Gym Kincumber.</p></div></body></html>");
  }
  const title = p.name + (p.active && p.price_cents > 0 ? " · " + shopMoney(p.price_cents) : "") + " · Legacy Gym";
  const desc = (p.blurb || "Legacy Gym Kincumber.") + " Pick your size, pay online, pick up at the gym.";
  const img = p.image_url || (APP + "/img/shop/therapy.jpg");
  const url = APP + "/shop/" + p.slug;
  const html = head + "<title>" + escH(title) + "</title><meta name=\"description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:type\" content=\"product\"><meta property=\"og:site_name\" content=\"Legacy Gym Kincumber\"><meta property=\"og:title\" content=\"" + escH(title) + "\"><meta property=\"og:description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:image\" content=\"" + escH(img) + "\"><meta property=\"og:url\" content=\"" + url + "\"><meta name=\"twitter:card\" content=\"summary_large_image\"><meta name=\"twitter:image\" content=\"" + escH(img) + "\"></head>"
    + "<body><div id=\"buy\" data-slug=\"" + escH(p.slug) + "\"><noscript>Turn on JavaScript to buy " + escH(p.name) + ".</noscript></div><script src=\"/buy.js?v=" + BUY_V + "\"></script></body></html>";
  res.setHeader("cache-control", "public, max-age=30, s-maxage=60");
  return res.status(200).send(html);
}

function shopHead() {
  return "<!doctype html><html lang=\"en-AU\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><meta name=\"theme-color\" content=\"#06080a\"><meta name=\"robots\" content=\"noindex\">"
    + "<link rel=\"icon\" href=\"/icon-192.png\"><link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>"
    + "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Montserrat:wght@500;600;700;800&display=swap\">"
    + "<style>html,body{background:#06080a;color:#eef3f5;margin:0;font-family:Montserrat,system-ui,sans-serif}</style>";
}

/* ---------- /shop/<drop-slug>: several designs, one cart, bundle pricing (drop.js) ---------- */
function dropShare(res, d) {
  const t = (d.tiers || []).slice().sort((a, b) => a.min - b.min);
  const from = t.length ? shopMoney(t[0].cents) : "";
  const title = d.name + (d.active && from ? " · " + from + " each" : "") + " · Legacy Gym";
  const deal = t.length > 1 ? t.slice(1).map(x => x.min + (x === t[t.length - 1] ? "+" : "") + " for " + shopMoney(x.cents) + " each").join(", ") + ". " : "";
  const desc = (d.preorder ? "Pre-order, one run only. " : "") + deal + "Pick your designs and sizes, pay online, pick up at the gym.";
  const img = d.image_url || (APP + "/img/shop/drop1/poster.jpg");
  const url = APP + "/shop/" + d.slug;
  const html = shopHead() + "<title>" + escH(title) + "</title><meta name=\"description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:type\" content=\"product\"><meta property=\"og:site_name\" content=\"Legacy Gym Kincumber\"><meta property=\"og:title\" content=\"" + escH(title) + "\"><meta property=\"og:description\" content=\"" + escH(desc) + "\">"
    + "<meta property=\"og:image\" content=\"" + escH(img) + "\"><meta property=\"og:url\" content=\"" + url + "\"><meta name=\"twitter:card\" content=\"summary_large_image\"><meta name=\"twitter:image\" content=\"" + escH(img) + "\"></head>"
    + "<body><div id=\"buy\" data-slug=\"" + escH(d.slug) + "\"><noscript>Turn on JavaScript to order.</noscript></div><script src=\"/drop.js?v=" + DROP_V + "\"></script></body></html>";
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", "public, max-age=30, s-maxage=60");
  return res.status(200).send(html);
}

/* ---------- a=waiver-mail: emails Jake when someone signs the ring-use waiver (/waiver). Verifies the signature exists first. ---------- */
async function waiverMail(res, body) {
  try {
    const id = String(body.id || "");
    if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(400).json({ error: "bad_request" });
    const row = await fetch(SB_URL + "/rest/v1/rpc/waiver_get", { method: "POST", headers: { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" }, body: JSON.stringify({ p_id: id }) }).then(r => r.json()).catch(() => null);
    if (!row || !row.ok) return res.status(404).json({ error: "not_found" });
    const BREVO = process.env.BREVO_API_KEY, RESEND = process.env.RESEND_API_KEY;
    if (!BREVO && !RESEND) return res.status(200).json({ skipped: "not_configured" });
    const when = new Date(row.signed_at).toLocaleString("en-AU", { timeZone: "Australia/Sydney", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    const to = "jakegsixboxing@gmail.com";
    const subject = "Waiver signed: " + row.name + " (" + when + ")";
    const text = row.name + " signed the ring-use waiver at " + when + ".\n\nTotal signed today: " + row.today + ".\nFull list: " + APP + "/waiver?key=LGCY-RING-7731\n\n— Legacy Gym app";
    const html = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0b0b0c;color:#f2f0eb;padding:24px;border-radius:16px"><div style="font-size:11px;letter-spacing:3px;color:#c9a44c;text-transform:uppercase">Ring use waiver</div><h1 style="font-size:28px;margin:8px 0 4px">' + escH(row.name) + '</h1><div style="color:#9a9891;font-size:14px">Signed ' + escH(when) + ' · total today ' + row.today + '</div><a href="' + APP + '/waiver?key=LGCY-RING-7731" style="display:block;margin-top:18px;background:#c9a44c;color:#0b0b0c;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:bold">See everyone who has signed</a></div>';
    let sent = false, detail = null;
    if (BREVO) {
      const from = process.env.MAIL_FROM || "jakegsixboxing@gmail.com";
      const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": BREVO, "content-type": "application/json" }, body: JSON.stringify({ sender: { name: "Legacy Gym app", email: from }, to: [{ email: to }], subject, textContent: text, htmlContent: html }) });
      sent = r.ok; if (!r.ok) detail = await r.text().catch(() => null);
    } else if (RESEND) {
      const from = process.env.MAIL_FROM || "Legacy Gym <onboarding@resend.dev>";
      const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: "Bearer " + RESEND, "content-type": "application/json" }, body: JSON.stringify({ from, to: [to], subject, text, html }) });
      sent = r.ok; if (!r.ok) detail = await r.text().catch(() => null);
    }
    return res.status(200).json({ sent, detail });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

/* ---------- a=crew-sms : a fighter texts their own holders through ClickSend ----------
   Body: { hold_ids:[...], template?:'crew-1' }. Auth: Authorization: Bearer <user jwt> (the fighter).
   The user's JWT is forwarded to PostgREST so fh_crew_targets / fh_crew_log run as that fighter:
   they only ever return / log holds under the caller's own fighter row. Mobiles stay server-side. */
async function crewSms(req, res, body) {
  try {
    const auth = String(req.headers.authorization || "");
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : String(body.token || "");
    if (!token) return res.status(401).json({ error: "bad_auth" });
    const ids = Array.isArray(body.hold_ids) ? body.hold_ids.map(Number).filter(n => Number.isInteger(n) && n > 0).slice(0, 60) : [];
    if (!ids.length) return res.status(400).json({ error: "no_holds" });
    const template = String(body.template || "crew-1");
    const H = { apikey: SB_ANON, authorization: "Bearer " + token, "content-type": "application/json" };
    const rpc = (fn, args) => fetch(SB_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: H, body: JSON.stringify(args || {}) }).then(async r => { const j = await r.json().catch(() => null); if (!r.ok) throw new Error((j && (j.message || j.hint)) || ("rpc " + r.status)); return j; });

    const crew = await rpc("fh_my_crew", {});
    if (!crew || !crew.ok) return res.status(403).json({ error: (crew && crew.error) || "not_a_fighter" });
    const targets = await rpc("fh_crew_targets", { p_hold_ids: ids, p_template: template });
    if (!targets.length) return res.status(200).json({ ok: true, sent: 0, skipped: ids.length, note: "already_sent_or_not_yours" });

    const USER = process.env.CLICKSEND_USER, KEY = process.env.CLICKSEND_KEY, FROM = process.env.CLICKSEND_FROM || "";
    if (!USER || !KEY) return res.status(503).json({ error: "sms_not_configured", message: "SMS isn't connected yet. Jake needs to add the ClickSend keys in Vercel." });

    const tpl = String(crew.message || "");
    const msgs = targets.map(t => ({
      to: "+61" + String(t.mobile).slice(1),
      body: tpl.replace(/\{first\}/g, t.first_name).replace(/\{fighter\}/g, t.fighter_first),
      source: "legacy-app", custom_string: "crew:" + t.hold_id,
      ...(FROM ? { from: FROM } : {})
    }));
    const cs = await fetch("https://rest.clicksend.com/v3/sms/send", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Basic " + Buffer.from(USER + ":" + KEY).toString("base64") },
      body: JSON.stringify({ messages: msgs })
    }).then(r => r.json()).catch(e => ({ error: String(e) }));

    const results = (cs && cs.data && Array.isArray(cs.data.messages)) ? cs.data.messages : [];
    let sent = 0, failed = 0;
    for (const t of targets) {
      const r = results.find(m => m.custom_string === "crew:" + t.hold_id) || null;
      const okStatus = r && /^(SUCCESS|QUEUED)$/i.test(String(r.status || ""));
      const st = okStatus ? "sent" : "failed";
      if (okStatus) sent++; else failed++;
      const err = okStatus ? null : String((r && r.status) || (cs && (cs.response_msg || cs.error)) || "no_response").slice(0, 200);
      const sentBody = msgs.find(m => m.custom_string === "crew:" + t.hold_id);
      await rpc("fh_crew_log", { p_hold_id: t.hold_id, p_template: template, p_status: st, p_provider_id: r ? String(r.message_id || "") : null, p_error: err, p_body: sentBody ? sentBody.body : null }).catch(() => {});
    }
    return res.status(200).json({ ok: failed === 0, sent, failed, skipped: ids.length - targets.length, provider: cs && cs.response_msg });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}



/* ---------- Fight Night tickets: a=buy-checkout, ticket branch of a=paid, a=buy-env (12 Nov 2026) ---------- */
const FN_H = { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" };
const fnRpc = (fn, args) => fetch(SB_URL + "/rest/v1/rpc/" + fn, { method: "POST", headers: FN_H, body: JSON.stringify(args || {}) }).then(r => r.json().catch(() => null));
const money = c => "$" + (Number(c || 0) / 100).toFixed(2).replace(/\.00$/, "");

async function buyCheckout(res, body) {
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const token = String(body.token || "").trim(), ref = String(body.ref || "").trim().toUpperCase();
    if (!/^[0-9a-f]{16,64}$/.test(token) || !/^FN26-[A-Z0-9]{6}$/.test(ref)) return res.status(400).json({ error: "bad_request" });
    const o = await fnRpc("fn_buy_for_checkout", { p_token: token, p_ref: ref });
    if (!o || !o.ok) return res.status(404).json({ error: (o && o.error) || "not_found" });
    if (o.status === "paid") return res.status(409).json({ error: "already_paid" });
    if (o.status !== "pending") return res.status(409).json({ error: "order_" + o.status });
    if (o.state !== "open") return res.status(409).json({ error: "window_closed" });
    if (o.checkout_url) return res.status(200).json({ ok: true, url: o.checkout_url, reused: true });
    const items = Array.isArray(o.items) ? o.items : [];
    const total = items.reduce((a, i) => a + (Number(i.unit) || 0) * (Number(i.qty) || 0), 0);
    if (!items.length || !(total > 0) || total !== Number(o.total_cents)) return res.status(400).json({ error: "bad_items" });
    const gql = await shopifyGql(CS);
    if (!gql) return res.status(502).json({ error: "shopify_auth_failed" });
    const email = /^\S+@\S+\.\S+$/.test(String(o.email || "")) ? o.email : undefined;
    const created = await gql(
      `mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl } userErrors{ field message } } }`,
      { input: {
          email, tags: ["legacy-app", "fight-night-2026", "fn-ticket", "group-" + o.grp].concat(o.test ? ["TEST"] : []),
          note: (o.test ? "TEST ORDER (refund me) · " : "") + "Fight Night tickets " + ref + " · Group " + o.grp + " · " + (o.name || "") + " · supporting " + (o.fighter || "-") + " · hold " + o.hold_id,
          customAttributes: [{ key: "Ticket ref", value: ref }, { key: "Ticket link", value: token }, { key: "Group", value: String(o.grp) }, { key: "Fighter", value: String(o.fighter || "") }, { key: "Hold", value: String(o.hold_id) }],
          lineItems: items.map(i => ({ title: "Fight Night 19 Dec · " + i.title, quantity: Number(i.qty), originalUnitPrice: (Number(i.unit) / 100).toFixed(2), requiresShipping: false, taxable: false }))
      } });
    const d = created && created.data && created.data.draftOrderCreate;
    const errs = (d && d.userErrors) || (created && created.errors) || [];
    if (!d || !d.draftOrder || errs.length) return res.status(502).json({ error: "shopify_error", detail: errs });
    await fnRpc("fn_buy_set_draft", { p_token: token, p_ref: ref, p_draft: d.draftOrder.name, p_draft_id: d.draftOrder.id, p_url: d.draftOrder.invoiceUrl });
    return res.status(200).json({ ok: true, url: d.draftOrder.invoiceUrl, draft: d.draftOrder.name });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}

async function ticketPaid(res, ref, token, orderName, totalCents) {
  let r;
  const SRK = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (SRK) {
    r = await fetch(SB_URL + "/rest/v1/rpc/fn_buy_mark_paid", { method: "POST", headers: { apikey: SRK, authorization: "Bearer " + SRK, "content-type": "application/json" },
      body: JSON.stringify({ p_ref: ref, p_order: orderName, p_total_cents: totalCents, p_via: "webhook" }) }).then(x => x.json().catch(() => null));
  }
  if ((!r || !r.ok) && token) r = await fnRpc("fn_buy_mark_paid_hook", { p_ref: ref, p_token: token, p_order: orderName, p_total_cents: totalCents });
  let mail = null;
  if (r && r.ok && !r.already && token) mail = await ticketConfirmEmail(ref, token).catch(e => ({ sent: false, detail: String(e && e.message || e) }));
  return res.status(200).json({ ok: !!(r && r.ok), ticket: ref, order: orderName, result: r, mail });
}

async function ticketConfirmEmail(ref, token) {
  const BREVO = process.env.BREVO_API_KEY, RESEND = process.env.RESEND_API_KEY;
  if (!BREVO && !RESEND) return { sent: false, detail: "not_configured" };
  const o = await fnRpc("fn_buy_receipt", { p_ref: ref, p_token: token });
  if (!o || !o.ok || !o.email) return { sent: false, detail: "no_receipt" };
  const link = APP + "/t/" + token;
  const first = o.first || (o.name || "").split(" ")[0] || "there";
  const items = Array.isArray(o.items) ? o.items : [];
  const subject = (o.test ? "[TEST] " : "") + "You're in: Fight Night tickets confirmed · " + ref;
  const lines = items.map(i => i.qty + " × " + i.title + "  " + money(i.unit * i.qty)).join("\n");
  const text = "Hi " + first + ",\n\nYou're in. Your Fight Night order is paid and confirmed.\n\n" +
    "Fight Club Fight Night · Saturday 19 December 2026 · Legacy Gym, Kincumber\n" + (o.fighter ? "Supporting: " + o.fighter + "\n" : "") +
    "Order: " + ref + (o.shopify_order ? " (" + o.shopify_order + ")" : "") + "\n\n" + lines + "\nTotal paid: " + money(o.paid_cents || o.total_cents) + "\n\n" +
    "WHAT HAPPENS NEXT\n" +
    "- Your QR tickets are emailed on Wednesday 9 December. There's nothing to print or show until then.\n" +
    "- Add the name of everyone in your group before Wed 9 Dec (each ticket carries a name): " + link + "\n" +
    "- Can't make it? You can pass your ticket to a friend or family member. Just update the name on your link.\n" +
    "- All sales are final (see the agreement you accepted at checkout).\n\n" +
    "Questions? Reply to this email.\n\nFight Club Central Coast · Legacy Gym Kincumber";
  const rows = items.map(i => '<tr><td style="padding:8px 0;border-bottom:1px solid #2a2519;color:#f2f0eb">' + i.qty + ' × ' + escH(i.title) + '</td><td align="right" style="padding:8px 0;border-bottom:1px solid #2a2519;color:#f1d27a;white-space:nowrap">' + money(i.unit * i.qty) + '</td></tr>').join("");
  const html = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0b0b0c;color:#f2f0eb;padding:28px;border-radius:16px">' +
    '<div style="font-size:11px;letter-spacing:3px;color:#1fb6e6;text-transform:uppercase;font-weight:bold">Fight Club Central Coast</div>' +
    '<h1 style="font-size:30px;margin:8px 0 4px;text-transform:uppercase">You\'re in, ' + escH(first) + '</h1>' +
    '<div style="color:#a19d92;font-size:14px">Fight Night · Saturday 19 December 2026 · Legacy Gym, Kincumber' + (o.fighter ? '<br>Supporting ' + escH(o.fighter) : '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:14px">' + rows +
    '<tr><td style="padding:10px 0;font-weight:bold">Total paid</td><td align="right" style="padding:10px 0;font-weight:bold;color:#f1d27a">' + money(o.paid_cents || o.total_cents) + '</td></tr></table>' +
    '<div style="font-size:12px;color:#a19d92">Order ' + ref + (o.shopify_order ? ' · ' + escH(o.shopify_order) : '') + '</div>' +
    '<div style="margin:20px 0;padding:16px;border:1px solid #3a3222;border-radius:12px;font-size:14px;line-height:1.6">' +
    '<b style="color:#f1d27a">What happens next</b><br>• Your <b>QR tickets are emailed on Wednesday 9 December</b>. Nothing to print or show until then.<br>' +
    '• Add the name of everyone in your group <b>before Wed 9 Dec</b>. Each ticket carries a name.<br>• Can\'t make it? You can pass your ticket to a friend or family member. Just update the name.<br>• All sales are final, as per the agreement you accepted.</div>' +
    '<a href="' + link + '" style="display:block;background:#c9a44c;color:#0b0b0c;text-decoration:none;text-align:center;padding:16px;border-radius:12px;font-weight:bold;font-size:15px;letter-spacing:1px;text-transform:uppercase">Add or change names</a>' +
    '<p style="color:#6f6b62;font-size:11px;margin-top:18px">Questions? Reply to this email. · Fight Club Central Coast · Legacy Gym Kincumber</p></div>';
  const fromEmail = process.env.FN_MAIL_FROM || "fightclub.legacygym@gmail.com";
  if (BREVO) {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": BREVO, "content-type": "application/json" },
      body: JSON.stringify({ sender: { name: "Fight Club Central Coast", email: fromEmail }, replyTo: { email: "fightclub.legacygym@gmail.com" }, to: [{ email: o.email }], bcc: [{ email: "fightclub.legacygym@gmail.com" }], subject, textContent: text, htmlContent: html }) });
    return { sent: r.ok, via: "brevo", from: fromEmail, detail: r.ok ? null : await r.text().catch(() => null) };
  }
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: "Bearer " + RESEND, "content-type": "application/json" },
    body: JSON.stringify({ from: process.env.MAIL_FROM || "Fight Club Central Coast <onboarding@resend.dev>", reply_to: "fightclub.legacygym@gmail.com", to: [o.email], bcc: ["fightclub.legacygym@gmail.com"], subject, text, html }) });
  return { sent: r.ok, via: "resend", detail: r.ok ? null : await r.text().catch(() => null) };
}

async function buyEnv(res, body) {
  const has = k => !!process.env[k];
  // Read-only check of the Shopify ORDERS_PAID webhook (topic + our callback URL only). body.ensure=true registers OUR hook if it is missing (idempotent, fixed URL).
  let hooks = null, ensured = null;
  try {
    const CS = process.env.SHOPIFY_CLIENT_SECRET; const gql = CS ? await shopifyGql(CS) : null;
    if (gql) {
      const list = await gql(`{ webhookSubscriptions(first: 50){ nodes{ id topic endpoint{ __typename ... on WebhookHttpEndpoint { callbackUrl } } } } }`);
      const nodes = (list.data && list.data.webhookSubscriptions && list.data.webhookSubscriptions.nodes) || [];
      hooks = nodes.map(n => n.topic + " " + ((n.endpoint && n.endpoint.callbackUrl) || ""));
      const mine = nodes.filter(n => n.topic === "ORDERS_PAID" && n.endpoint && n.endpoint.callbackUrl === HOOK);
      if (!mine.length && body && body.ensure === true) {
        const c = await gql(`mutation($topic: WebhookSubscriptionTopic!, $sub: WebhookSubscriptionInput!){ webhookSubscriptionCreate(topic:$topic, webhookSubscription:$sub){ webhookSubscription{ id } userErrors{ field message } } }`,
          { topic: "ORDERS_PAID", sub: { callbackUrl: HOOK, format: "JSON" } });
        ensured = (c && c.data && c.data.webhookSubscriptionCreate) || c;
      }
    }
  } catch (e) { hooks = "error: " + String((e && e.message) || e); }
  return res.status(200).json({ hooks, ensured, shopify_client_secret: has("SHOPIFY_CLIENT_SECRET"), shopify_webhook_secret: has("SHOPIFY_WEBHOOK_SECRET"), service_role: has("SUPABASE_SERVICE_ROLE_KEY"),
    brevo: has("BREVO_API_KEY"), resend: has("RESEND_API_KEY"), mail_from: process.env.MAIL_FROM || null, fn_mail_from: process.env.FN_MAIL_FROM || null });
}
