const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "2843f90cb5c662bc60b1ae745415b154";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const CS = process.env.SHOPIFY_CLIENT_SECRET, SRK = process.env.SUPABASE_SERVICE_KEY;
  if (!CS || !SRK) return res.status(503).json({ error: "not_configured" });
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
    const tok = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + encodeURIComponent(CS)
    }).then(r => r.json());
    if (!tok || !tok.access_token) return res.status(502).json({ error: "shopify_auth_failed" });
    const code = "LEGACY-" + Array.from({ length: 6 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
    const gq = await fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
      method: "POST", headers: { "X-Shopify-Access-Token": tok.access_token, "content-type": "application/json" },
      body: JSON.stringify({
        query: "mutation($d: DiscountCodeBasicInput!){ discountCodeBasicCreate(basicCodeDiscount: $d){ codeDiscountNode { id } userErrors { field message } } }",
        variables: { d: {
          title: code, code: code, startsAt: new Date(Date.now() - 60000).toISOString(),
          customerSelection: { all: true },
          customerGets: { value: { discountAmount: { amount: String(amt), appliesOnEachItem: false } }, items: { all: true } },
          appliesOncePerCustomer: true, usageLimit: 1 } }
      })
    }).then(r => r.json());
    const out = gq && gq.data && gq.data.discountCodeBasicCreate;
    if (!out || !out.codeDiscountNode || (out.userErrors && out.userErrors.length))
      return res.status(502).json({ error: "shopify_rejected", detail: (out && out.userErrors) || gq.errors });
    await fetch(SB_URL + "/rest/v1/credit_redemptions", {
      method: "POST", headers: { ...H, "content-type": "application/json", prefer: "return=minimal" },
      body: JSON.stringify({ member_id: u.id, name: u.email || "", code, amount: amt, status: "active" })
    });
    return res.status(200).json({ code, amount: amt });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
