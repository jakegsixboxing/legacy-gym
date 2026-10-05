// 7-day free trial requests from the legacygym.net homepage.
// 1) saves the lead in Supabase (challenge_leads, challenge = trial7) via the trial_lead_submit RPC
// 2) emails the staff inbox(es) and sends the person a confirmation (Brevo or Resend, keys live in env)
// 3) pushes a notification to staff phones through /api/notify-staff
// Nothing here is a dead end: if email or push fails, the lead is still saved and the response says what failed.

const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";

const STAFF_TO = ["jakegsixboxing@gmail.com", "alison@legacygym.net"];
const APP_URL = "https://legacygym-app.vercel.app";

function clean(s, n) { return String(s == null ? "" : s).trim().slice(0, n); }

async function sendMail({ to, subject, text, replyTo }) {
  const BREVO = process.env.BREVO_API_KEY;
  const RESEND = process.env.RESEND_API_KEY;
  if (!BREVO && !RESEND) return { sent: false, skipped: "not_configured" };
  try {
    if (BREVO) {
      const from = process.env.MAIL_FROM || "jakegsixboxing@gmail.com";
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO, "content-type": "application/json" },
        body: JSON.stringify(Object.assign({ sender: { name: "Legacy Gym", email: from }, to: to.map(e => ({ email: e })), subject, textContent: text }, replyTo ? { replyTo: { email: replyTo } } : {}))
      });
      return { sent: r.ok, detail: r.ok ? null : await r.text().catch(() => null) };
    }
    const from = process.env.MAIL_FROM || "Legacy Gym <onboarding@resend.dev>";
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: "Bearer " + RESEND, "content-type": "application/json" },
      body: JSON.stringify(Object.assign({ from, to, subject, text }, replyTo ? { reply_to: replyTo } : {}))
    });
    return { sent: r.ok, detail: r.ok ? null : await r.text().catch(() => null) };
  } catch (e) { return { sent: false, detail: String((e && e.message) || e) }; }
}

async function pushStaff(req, title, body) {
  try {
    // A throwaway anonymous session is enough for notify-staff to accept the call; recipients are staff-only on the server side.
    const s = await fetch(SB_URL + "/auth/v1/signup", {
      method: "POST", headers: { apikey: SB_ANON, "content-type": "application/json" }, body: JSON.stringify({ data: { guest: true, via: "trial-lead" } })
    }).then(r => r.json());
    if (!s || !s.access_token) return { sent: 0, skipped: "no_anon_session" };
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const proto = req.headers["x-forwarded-proto"] || "https";
    const r = await fetch(proto + "://" + host + "/api/notify-staff", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: s.access_token, title, body, url: "/" })
    });
    const j = await r.json().catch(() => ({}));
    return Object.assign({ status: r.status }, j);
  } catch (e) { return { sent: 0, detail: String((e && e.message) || e) }; }
}

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "post_only" });
  try {
    const b = req.body || {};
    const name = clean(b.name, 120), phone = clean(b.phone, 30), email = clean(b.email, 120).toLowerCase(), interest = clean(b.interest, 60) || "A bit of everything";
    const test = b.test === true;
    if (clean(b.website, 10)) return res.status(200).json({ ok: true }); // honeypot

    // 1) save the lead
    const rpc = await fetch(SB_URL + "/rest/v1/rpc/trial_lead_submit", {
      method: "POST", headers: { apikey: SB_ANON, authorization: "Bearer " + SB_ANON, "content-type": "application/json" },
      body: JSON.stringify({ p: { name, phone, email, interest } })
    });
    const saved = await rpc.json().catch(() => null);
    if (!rpc.ok || !saved || !saved.ok) {
      return res.status(400).json({ ok: false, error: (saved && saved.error) || "Please check your name, mobile and email." });
    }

    const first = name.split(" ")[0];
    const when = new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

    // 2) emails
    const staffTo = test ? ["jakegsixboxing@gmail.com"] : STAFF_TO;
    const staff = await sendMail({
      to: staffTo,
      subject: (test ? "[TEST] " : "") + "7-day free trial request: " + name,
      text:
        "New 7-day free trial request from the legacygym.net homepage.\n\n" +
        "Name: " + name + "\n" +
        "Mobile: " + phone + "\n" +
        "Email: " + email + "\n" +
        "Into: " + interest + "\n" +
        "Submitted: " + when + "\n\n" +
        "They've been told you'll text them a start time.\n" +
        "Text them: sms:" + phone.replace(/\s/g, "") + "\n" +
        "Call them: tel:" + phone.replace(/\s/g, "") + "\n\n" +
        "This lead is also in the app under Road to Xmas > Website sign-ups (tagged 7-day free trial): " + APP_URL + "\n",
      replyTo: email
    });
    const lead = await sendMail({
      to: [email],
      subject: (test ? "[TEST] " : "") + "Your free week at Legacy Gym",
      text:
        "Hi " + first + ",\n\n" +
        "You're in. We'll text you on " + phone + " with a time to come in and pick up your 7-day swipe pass.\n\n" +
        "What you get for the week: the weights floor, any class on the timetable, and a look at the recovery centre. No card was taken, so there's nothing to cancel if it's not for you.\n\n" +
        "Can't wait for the text? Call or text 0401 587 508 (phone's manned 4-7pm Mon-Thu).\n\n" +
        "Legacy Gym\n12 Bilinga Rd, Kincumber NSW 2251\nhttps://www.legacygym.net\n",
      replyTo: "jakegsixboxing@gmail.com"
    });

    // 3) push to staff phones
    const push = await pushStaff(req, (test ? "[TEST] " : "") + "New free trial request", name + " · " + interest + " · " + phone);

    return res.status(200).json({ ok: true, id: saved.id, email: { staff, lead }, push });
  } catch (e) { return res.status(500).json({ ok: false, error: "server_error", detail: String((e && e.message) || e) }); }
}
