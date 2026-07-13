const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const API = "2024-04";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const AT = process.env.SHOPIFY_ADMIN_TOKEN, SRK = process.env.SUPABASE_SERVICE_KEY;
  if (!AT || !SRK) return res.status(503).json({ error: "not_configured" });
  try {
    const { token, amount } = req.body || {};
    const amt = Math.floor(Number(amount));
    if (!token || !(amt > 0)) return res.status(400).json({ error: "bad_request" });
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + token } }).then(r => r.json());
    if (!u || !u.id) return res.status(401).json({ error: "bad_auth" });
    const H = { apikey: SRK, authorization: "Bearer " + SRK };
    const [evs, rds] = await Promise.all([
      fetch(SB_URL + "/rest/v1/credit_events?member_id=eq." + u.id + "&select=amount", { headers: H }).then(r => r.json()),
      fetch(SB_URL + "/rest/v1/credit_redemptions?member_id=eq." + u.id + "&select=amount,status", { headers: H }).then(r => r.json())]);
    const bal = (evs || []).reduce((a, e) => a + Number(e.amount), 0)
      - (rds || []).filter(r => r.status !== "cancelled").reduce((a, r) => a + Number(r.amount), 0);
    if (bal < amt) return res.status(400).json({ error: "insufficient_credit" });
    const code = "LEGACY-" + Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
    const sh = { "X-Shopify-Access-Token": AT, "content-type": "application/json" };
    const pr = await fetch(`https://${SHOP}/admin/api/${API}/price_rules.json`, {
      method: "POST", headers: sh, body: JSON.stringify({ price_rule: {
        title: code, target_type: "line_item", target_selection: "all", allocation_method: "across",
        value_type: "fixed_amount", value: "-" + amt + ".00", customer_selection: "all",
        usage_limit: 1, starts_at: new Date(Date.now() - 60000).toISOString() } })
    }).then(r => r.json());
    if (!pr || !pr.price_rule) return res.status(502).json({ error: "shopify_rejected", detail: pr && pr.errors });
    const dc = await fetch(`https://${SHOP}/admin/api/${API}/price_rules/${pr.price_rule.id}/discount_codes.json`, {
      method: "POST", headers: sh, body: JSON.stringify({ discount_code: { code } })
    }).then(r => r.json());
    if (!dc || !dc.discount_code) return res.status(502).json({ error: "shopify_code_failed", detail: dc && dc.errors });
    await fetch(SB_URL + "/rest/v1/credit_redemptions", {
      method: "POST", headers: { ...H, "content-type": "application/json", prefer: "return=minimal" },
      body: JSON.stringify({ member_id: u.id, name: u.email || "", code, amount: amt, status: "active" })
    });
    return res.status(200).json({ code, amount: amt });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
