// Shopify "Order paid" webhook → marks the matching sponsorship request as paid in the Legacy app.
// Signature check uses SHOPIFY_WEBHOOK_SECRET if set (webhook made by hand in Shopify admin),
// otherwise SHOPIFY_CLIENT_SECRET (webhook registered by our app via /api/sponsor-setup).
// Webhook URL: https://legacygym-app.vercel.app/api/shopify-webhook   event: orders/paid, JSON
import crypto from "crypto";
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const chunks = []; for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks);

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
