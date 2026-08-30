import webpush from "web-push";

const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";

// Lets a signed-in MEMBER notify staff (Jake) when they act on the review prompt.
// Only ever pushes to STAFF subscriptions (via get_staff_push_subscriptions RPC),
// and only if the caller is a valid logged-in user. Members can't reach anyone else.
export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  const PUB = process.env.VAPID_PUBLIC_KEY;
  const PRIV = process.env.VAPID_PRIVATE_KEY;
  if (!PUB || !PRIV) return res.status(503).json({ error: "not_configured" });
  try {
    const { token, title, body, url } = req.body || {};
    if (!token || !body) return res.status(400).json({ error: "bad_request" });
    // Verify the caller is a real, logged-in user.
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + token } }).then(r => r.json());
    if (!u || !u.id) return res.status(401).json({ error: "bad_auth" });
    const H = { apikey: SB_ANON, authorization: "Bearer " + token, "content-type": "application/json" };
    // Staff-only recipients (RPC returns just staff subscriptions).
    const subs = await fetch(SB_URL + "/rest/v1/rpc/get_staff_push_subscriptions", {
      method: "POST", headers: H, body: JSON.stringify({})
    }).then(r => r.json());
    if (!Array.isArray(subs)) return res.status(200).json({ sent: 0, note: "no_staff_subs" });
    webpush.setVapidDetails("mailto:jakegsixboxing@gmail.com", PUB, PRIV);
    const payload = JSON.stringify({ title: title || "Legacy Gym", body, url: url || "/" });
    const results = await Promise.allSettled(
      subs.map(s => webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } }, payload))
    );
    const sent = results.filter(r => r.status === "fulfilled").length;
    return res.status(200).json({ sent, total: subs.length });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
