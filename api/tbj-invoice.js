// Trained by Jake — create a Shopify draft order for a client and email them the invoice.
// Jake-only: the caller's Supabase token must belong to Jake.
// POST { token, request_id, mode: "upfront" | "week", week_no? }
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
    const { token, request_id, mode, week_no } = req.body || {};
    if (!token || !request_id || !mode) return res.status(400).json({ error: "bad_request" });
    const H = { apikey: SB_ANON, authorization: "Bearer " + token };
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: H }).then(r => r.json());
    if (!u || u.id !== JAKE_ID) return res.status(401).json({ error: "jake_only" });

    const rq = await fetch(SB_URL + "/rest/v1/tbj_requests?id=eq." + encodeURIComponent(request_id) + "&select=*", { headers: H }).then(r => r.json());
    const r0 = Array.isArray(rq) && rq[0];
    if (!r0) return res.status(404).json({ error: "request_not_found" });
    const n = (r0.box || 0) + (r0.sc || 0) + (r0.road || 0);
    const isWeek = mode === "week";
    const wk = isWeek ? Number(week_no || 1) : null;
    const amount = isWeek ? Number(r0.weekly_price) : Number(r0.total_price);
    const title = isWeek
      ? `Trained by Jake — Week ${wk} of ${r0.weeks} (${n} session${n === 1 ? "" : "s"}/wk)`
      : `Trained by Jake — ${r0.weeks}-week training block (${n} session${n === 1 ? "" : "s"}/wk)`;
    const first = String(r0.name || "").split(" ")[0] || "there";

    // Shopify Admin API token (client credentials — same as redeem.js)
    const tok = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials&client_id=" + CLIENT_ID + "&client_secret=" + encodeURIComponent(CS)
    }).then(r => r.json());
    if (!tok || !tok.access_token) return res.status(502).json({ error: "shopify_auth_failed" });
    const gql = async (query, variables) => fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
      method: "POST", headers: { "X-Shopify-Access-Token": tok.access_token, "content-type": "application/json" },
      body: JSON.stringify({ query, variables })
    }).then(r => r.json());

    // 1) draft order
    const created = await gql(
      `mutation($input: DraftOrderInput!){ draftOrderCreate(input:$input){ draftOrder{ id name invoiceUrl } userErrors{ field message } } }`,
      { input: {
          email: r0.email, tags: ["trained-by-jake", isWeek ? "weekly" : "upfront"],
          note: `Trained by Jake · ${r0.name} · ${r0.goal || ""} · ${isWeek ? "week " + wk : "upfront"} · req ${String(request_id).slice(0, 8)}`,
          customAttributes: [{ key: "tbj_request", value: String(request_id) }, { key: "tbj_week", value: isWeek ? String(wk) : "upfront" }],
          lineItems: [{ title, quantity: 1, originalUnitPrice: amount.toFixed(2), requiresShipping: false, taxable: false }]
      } });
    const d = created && created.data && created.data.draftOrderCreate;
    if (!d || !d.draftOrder || (d.userErrors && d.userErrors.length))
      return res.status(502).json({ error: "shopify_rejected", detail: (d && d.userErrors) || created.errors });
    const draft = d.draftOrder;

    // 2) email the invoice
    const sent = await gql(
      `mutation($id: ID!, $email: EmailInput){ draftOrderInvoiceSend(id:$id, email:$email){ draftOrder{ id invoiceUrl } userErrors{ field message } } }`,
      { id: draft.id, email: {
          to: r0.email, subject: isWeek ? `Trained by Jake — week ${wk} invoice` : `Trained by Jake — your ${r0.weeks}-week block`,
          customMessage: `Hey ${first} — here's your ${isWeek ? "week " + wk : "training block"} invoice for Trained by Jake. Pay online and your program ${isWeek ? "stays unlocked" : "unlocks"} in the Legacy app. Any questions, message Jake in the app. Cheers!`
      } });
    const s = sent && sent.data && sent.data.draftOrderInvoiceSend;
    const invoiceUrl = (s && s.draftOrder && s.draftOrder.invoiceUrl) || draft.invoiceUrl;
    const emailErr = (s && s.userErrors && s.userErrors.length) ? s.userErrors : null;

    // 3) record in Supabase (as Jake — RLS allows)
    const nowIso = new Date().toISOString(), today = nowIso.slice(0, 10);
    if (isWeek) {
      await fetch(SB_URL + "/rest/v1/tbj_invoices?on_conflict=request_id,week_no", {
        method: "POST", headers: { ...H, "content-type": "application/json", prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ request_id, user_id: r0.user_id, week_no: wk, amount, due_date: today, status: "due", invoice_url: invoiceUrl, draft_order_id: draft.id, sent_at: nowIso })
      });
    } else {
      await fetch(SB_URL + "/rest/v1/tbj_requests?id=eq." + encodeURIComponent(request_id), {
        method: "PATCH", headers: { ...H, "content-type": "application/json", prefer: "return=minimal" },
        body: JSON.stringify({ invoice_url: invoiceUrl, draft_order_id: draft.id, invoice_sent_at: nowIso })
      });
    }
    await fetch(SB_URL + "/rest/v1/tbj_messages", {
      method: "POST", headers: { ...H, "content-type": "application/json", prefer: "return=minimal" },
      body: JSON.stringify({ user_id: r0.user_id, from_coach: true, body: `${isWeek ? "Week " + wk + " invoice" : "Your block invoice"} is ready — $${amount.toFixed(2)}. I've emailed it to ${r0.email}, or pay here: ${invoiceUrl}` })
    });
    return res.status(200).json({ ok: true, invoiceUrl, draft: draft.name, emailed: !emailErr, emailErr });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
