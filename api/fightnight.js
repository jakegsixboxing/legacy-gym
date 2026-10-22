// Fight Night API (one function: Vercel Hobby allows 12). Routes by ?a=
//   a=checkout     public  → turns a saved sponsorship request (ref + email) into a Shopify draft order, returns the pay link
//   a=paid         Shopify orders/paid webhook → marks the sponsorship paid in the app
//   a=setup        Jake/Alison → registers the orders/paid webhook with Shopify (run once)
//   a=ticket-email staff   → emails a Fight Night ticket link (was /api/fn-ticket-email; vercel.json rewrites it here)
//   a=share&f=slug GET     → /fightnight/<fighter-slug>: the fighter's "Hold Me a Ticket" page (OG tags + /fh.js shell)
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
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);
  let body = {}; if (a !== "paid") { try { body = JSON.parse(raw.toString("utf8") || "{}"); } catch (e) { body = {}; } }

  if (a === "paid") return paid(req, res, raw);
  if (a === "checkout") return checkout(res, body);
  if (a === "setup") return setup(res, body);
  if (a === "ticket-email") return ticketEmail(res, body);
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

  let ref = null;
  for (const na of (Array.isArray(order.note_attributes) ? order.note_attributes : [])) if (na && /sponsor ref/i.test(String(na.name || ""))) ref = String(na.value || "").trim().toUpperCase();
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
const FH_V = "202610221830";
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
    res.setHeader("cache-control", "no-store");
    res.statusCode = 302; res.setHeader("location", "/fightnight"); return res.end();
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
