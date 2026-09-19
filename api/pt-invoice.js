// One-off invoice (PT session, casual fee, anything) — creates a Shopify draft order for a member,
// emails them the invoice, and returns the pay link. Jake-only: the caller's Supabase token must belong to Jake.
// POST { token, user_id, amount, title, email?, first_name?, note?, subject?, message?, tag? }
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "2843f90cb5c662bc60b1ae745415b154";
const JAKE_ID = "15a011b9-e222-45f0-8eb9-d5338da935d1";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const b = req.body || {};
    const { token, user_id, title } = b;
    const amount = Number(b.amount);
    if (!token || !user_id || !title || !(amount > 0)) return res.status(400).json({ error: "bad_request" });
    const H = { apikey: SB_ANON, authorization: "Bearer " + token };
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: H }).then(r => r.json());
    if (!u || u.id !== JAKE_ID) return res.status(401).json({ error: "jake_only" });

    // member's email / name from profiles unless supplied
    let email = b.email, first = b.first_name;
    if (!email || !first) {
      const p = await fetch(SB_URL + "/rest/v1/profiles?id=eq." + encodeURIComponent(user_id) + "&select=email,first_name", { headers: H }).then(r => r.json());
      const p0 = Array.isArray(p) && p[0];
      if (p0) { email = email || p0.email; first = first || p0.first_name; }
    }
    if (!email) return res.status(404).json({ error: "no_email" });
    first = String(first || "there").split(" ")[0];

    const tok = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + encodeURIComponent(CS)
    }).then(r => r.json());
    if (!tok || !tok.access_token) return res.status(502).json({ error: "shopify_auth_failed" });
    const gql = async (query, variables) => fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
      method: "POST", headers: { "X-Shopify-Access-Token": tok.access_token, "content-type": "application/json" },
      body: JSON.stringify({ query, variables })
    }).then(r => r.json());

    const created = await gql(
      `mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl } userErrors{ field message } } }`,
      { input: {
          email, tags: ["legacy-app", b.tag || "one-off"],
          note: `${title} · ${first} · via Legacy app`,
          customAttributes: [{ key: "legacy_user", value: String(user_id) }],
          lineItems: [{ title, quantity: 1, originalUnitPrice: amount.toFixed(2), requiresShipping: false, taxable: false }]
      } });
    const d = created && created.data && created.data.draftOrderCreate;
    if (!d || !d.draftOrder || (d.userErrors && d.userErrors.length))
      return res.status(502).json({ error: "shopify_rejected", detail: (d && d.userErrors) || created.errors });
    const draft = d.draftOrder;

    const sent = await gql(
      `mutation($id: ID!, $email: EmailInput){ draftOrderInvoiceSend(id:$id, email:$email){ draftOrder{ id invoiceUrl } userErrors{ field message } } }`,
      { id: draft.id, email: {
          to: email, subject: b.subject || `Legacy Gym — ${title}`,
          customMessage: b.message || `Hey ${first} — here's your invoice for ${title} ($${amount.toFixed(2)}). Tap the button to pay online. Cheers, Jake`
      } });
    const s = sent && sent.data && sent.data.draftOrderInvoiceSend;
    const invoiceUrl = (s && s.draftOrder && s.draftOrder.invoiceUrl) || draft.invoiceUrl;
    const emailErr = (s && s.userErrors && s.userErrors.length) ? s.userErrors : null;
    return res.status(200).json({ ok: true, invoiceUrl, draft: draft.name, draftId: draft.id, emailed: !emailErr, emailErr });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
