// Fight Night sponsorship checkout — turns a saved sponsorship request into a Shopify draft order
// and returns the secure pay link (Shopify checkout). Public, but it only works for a request whose
// reference AND email match, and the amounts come from the database, never from the browser.
// POST { ref, email }  →  { ok, url, draft }
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const SHOP = process.env.SHOPIFY_STORE_DOMAIN || "gsix-sports.myshopify.com";
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "2843f90cb5c662bc60b1ae745415b154";
const RETURN_BASE = "https://legacygym-app.vercel.app/sponsor";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const CS = process.env.SHOPIFY_CLIENT_SECRET;
  if (!CS) return res.status(503).json({ error: "not_configured" });
  try {
    const b = req.body || {};
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

    const tok = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + encodeURIComponent(CS)
    }).then(r => r.json());
    if (!tok || !tok.access_token) return res.status(502).json({ error: "shopify_auth_failed" });
    const gql = async (query, variables) => fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
      method: "POST", headers: { "X-Shopify-Access-Token": tok.access_token, "content-type": "application/json" },
      body: JSON.stringify({ query, variables })
    }).then(r => r.json());

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
