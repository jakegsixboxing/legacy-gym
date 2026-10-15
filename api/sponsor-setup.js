// One-off: registers the Shopify "orders/paid" webhook that marks sponsorships paid in the app.
// Jake/Alison only (Supabase token). POST { token }  →  { ok, existing, created }
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "2843f90cb5c662bc60b1ae745415b154";
const ADMINS = ["15a011b9-e222-45f0-8eb9-d5338da935d1", "f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"];
const HOOK = "https://legacygym-app.vercel.app/api/shopify-webhook";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const { token } = req.body || {};
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + token } }).then(r => r.json());
    if (!u || ADMINS.indexOf(u.id) < 0) return res.status(401).json({ error: "admins_only" });
    const tok = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + encodeURIComponent(CS)
    }).then(r => r.json());
    if (!tok || !tok.access_token) return res.status(502).json({ error: "shopify_auth_failed" });
    const gql = async (query, variables) => fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
      method: "POST", headers: { "X-Shopify-Access-Token": tok.access_token, "content-type": "application/json" },
      body: JSON.stringify({ query, variables })
    }).then(r => r.json());
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
