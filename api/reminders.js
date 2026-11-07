import webpush from "web-push";

/* Legacy 2.0 reminders (8 Nov 2026). Pinged hourly by a Supabase cron (pg_cron -> pg_net).
   Asks the database which members are due a nudge this hour (reminders_due: once per member/kind/hour, so a stray
   call can never double-send) and pushes to their devices with the same VAPID keys as send-push. No secrets needed here. */
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  if (req.method === "OPTIONS") return res.status(204).end();
  const PUB = process.env.VAPID_PUBLIC_KEY, PRIV = process.env.VAPID_PRIVATE_KEY;
  if (!PUB || !PRIV) return res.status(503).json({ error: "not_configured" });
  try {
    const due = await fetch(SB_URL + "/rest/v1/rpc/reminders_due", {
      method: "POST", headers: { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" }, body: "{}"
    }).then(r => r.json());
    if (!Array.isArray(due)) return res.status(500).json({ error: "rpc_failed", detail: due });
    if (!due.length) return res.status(200).json({ sent: 0, total: 0 });
    webpush.setVapidDetails("mailto:jakegsixboxing@gmail.com", PUB, PRIV);
    const results = await Promise.allSettled(due.map(d =>
      webpush.sendNotification({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth_key } },
        JSON.stringify({ title: d.title || "Legacy Gym", body: d.body, url: d.url || "/" }))));
    const sent = results.filter(r => r.status === "fulfilled").length;
    return res.status(200).json({ sent, failed: results.length - sent, total: due.length });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
