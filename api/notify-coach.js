const SB_URL = "https://jyslqxepodrseyhoppce.supabase.co";
const SB_ANON = "sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";

// Coaches who get an email when someone books (or cancels) with them.
const COACH_EMAILS = {
  joe: "joewilliams2185@gmail.com",
  alison: "alisonascendactive@gmail.com"
};

function line(k, v) { return v ? k + ": " + v + "\n" : ""; }

export default async function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-headers", "content-type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "post_only" });
  try {
    const { token, coach, kind, ref, member, mobile, email, when, dur, total, focus, note, fee, pay, subject: subj, text: txt, replyTo } = req.body || {};
    if (!token || !coach) return res.status(400).json({ error: "bad_request" });

    // Must be a real authenticated session (members or website guests both qualify).
    const u = await fetch(SB_URL + "/auth/v1/user", { headers: { apikey: SB_ANON, authorization: "Bearer " + token } }).then(r => r.json());
    if (!u || !u.id) return res.status(401).json({ error: "bad_auth" });

    const to = COACH_EMAILS[String(coach).toLowerCase()];
    if (!to) return res.status(200).json({ skipped: "no_email_for_coach" });

    const BREVO = process.env.BREVO_API_KEY;
    const RESEND = process.env.RESEND_API_KEY;
    if (!BREVO && !RESEND) return res.status(200).json({ skipped: "not_configured" });

    const cancel = kind === "cancel";
    const enquiry = kind === "enquiry";
    const subject = enquiry ? (subj || ("New enquiry: " + (member || "someone"))) : cancel
      ? "PT cancellation — " + (member || "a member") + (when ? " · " + when : "")
      : "New PT booking — " + (member || "a member") + (when ? " · " + when : "");
    const text = enquiry ? (txt || "") :
      (cancel ? "A PT session with you was CANCELLED.\n\n" : "You've got a new PT booking at Legacy Gym.\n\n") +
      line("Member", member) +
      line("When", when) +
      line("Session", dur) +
      line("Total", total ? "$" + total : "") +
      (cancel ? line("Cancellation fee", (fee || fee === 0) ? "$" + fee : "") : "") +
      line("Mobile", mobile) +
      line("Email", email) +
      line("Focus", focus) +
      line("Notes", note) +
      line("Ref", ref) +
      (pay === "card" ? "\nPaid by card at booking through the Legacy checkout.\n" : "\nPayment is cash, before the session.\n") + "— Legacy Gym bookings";

    let sent = false, detail = null;
    if (BREVO) {
      const from = process.env.MAIL_FROM || "jakegsixboxing@gmail.com";
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO, "content-type": "application/json" },
        body: JSON.stringify(Object.assign({ sender: { name: "Legacy Gym Bookings", email: from }, to: [{ email: to }], subject, textContent: text }, (enquiry && replyTo) ? { replyTo: { email: replyTo } } : {}))
      });
      sent = r.ok; if (!r.ok) detail = await r.text().catch(() => null);
    } else if (RESEND) {
      const from = process.env.MAIL_FROM || "Legacy Gym Bookings <onboarding@resend.dev>";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { authorization: "Bearer " + RESEND, "content-type": "application/json" },
        body: JSON.stringify(Object.assign({ from, to: [to], subject, text }, (enquiry && replyTo) ? { reply_to: replyTo } : {}))
      });
      sent = r.ok; if (!r.ok) detail = await r.text().catch(() => null);
    }
    return res.status(200).json({ sent, detail });
  } catch (e) { return res.status(500).json({ error: "server_error", detail: String((e && e.message) || e) }); }
}
