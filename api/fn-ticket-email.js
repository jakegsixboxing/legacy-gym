// Fight Night · email a ticket link to a buyer. Staff only (Jake, Alison, Kelly).
// POST { token, ticket_token, to }. Uses Brevo or Resend, same env vars as the other mail routes.
const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
const ADMINS = ["15a011b9-e222-45f0-8eb9-d5338da935d1", "f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce", "09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb"];
const APP = "https://legacygym-app.vercel.app";

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  try {
    const { token, ticket_token, to } = req.body || {};
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
