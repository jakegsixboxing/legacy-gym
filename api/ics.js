/* /api/ics — hands the phone a calendar file for one Legacy Gym booking.
   Everything comes from the query string (title, times, location, notes, uid),
   so it needs no database access and holds no member data.
   iOS opens text/calendar straight into the Calendar "Add event" sheet. */
export default function handler(req, res) {
  const q = req.query || {};
  const clean = (v, max) => String(v || "").slice(0, max || 500).replace(/[\r\n]+/g, " ");
  const stamp = (v) => (/^\d{8}T\d{6}$/.test(String(v)) ? String(v) : null);
  const title = clean(q.t, 120) || "Legacy Gym";
  const start = stamp(q.s), end = stamp(q.e);
  if (!start || !end) { res.status(400).send("start and end required as YYYYMMDDTHHMMSS"); return; }
  const loc = clean(q.l, 200) || "Legacy Gym, Kincumber NSW 2251";
  const desc = String(q.d || "").slice(0, 1500);
  const uid = clean(q.u, 120).replace(/[^a-zA-Z0-9@._-]/g, "") || ("legacy-" + start + "@legacygym.net");
  const seq = Math.max(0, parseInt(q.seq || "0", 10) || 0);
  const rrule = /^FREQ=(DAILY|WEEKLY);COUNT=\d{1,3}(;BYDAY=[A-Z,]{2,20})?$/.test(String(q.r || "")) ? String(q.r) : null;
  const cancel = q.c === "1";
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const fold = (line) => { const out = []; while (line.length > 70) { out.push(line.slice(0, 70)); line = " " + line.slice(70); } out.push(line); return out.join("\r\n"); };
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Legacy Gym//Bookings//EN", "CALSCALE:GREGORIAN", "METHOD:" + (cancel ? "CANCEL" : "PUBLISH"),
    "BEGIN:VTIMEZONE", "TZID:Australia/Sydney",
    "BEGIN:STANDARD", "DTSTART:19700405T030000", "RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU", "TZOFFSETFROM:+1100", "TZOFFSETTO:+1000", "TZNAME:AEST", "END:STANDARD",
    "BEGIN:DAYLIGHT", "DTSTART:19701004T020000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU", "TZOFFSETFROM:+1000", "TZOFFSETTO:+1100", "TZNAME:AEDT", "END:DAYLIGHT", "END:VTIMEZONE",
    "BEGIN:VEVENT", "UID:" + uid, "SEQUENCE:" + seq, "DTSTAMP:" + now, "STATUS:" + (cancel ? "CANCELLED" : "CONFIRMED"),
    "DTSTART;TZID=Australia/Sydney:" + start, "DTEND;TZID=Australia/Sydney:" + end,
    fold("SUMMARY:" + esc(title)), fold("LOCATION:" + esc(loc))];
  if (desc) L.push(fold("DESCRIPTION:" + esc(desc)));
  L.push("URL:https://legacygym-app.vercel.app/");
  if (rrule) L.push("RRULE:" + rrule);
  L.push("BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", fold("DESCRIPTION:" + esc(title) + " in 1 hour"), "END:VALARM", "END:VEVENT", "END:VCALENDAR");
  const body = L.join("\r\n");
  const fname = title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "legacy-gym";
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", (q.dl === "1" ? "attachment" : "inline") + "; filename=\"" + fname + ".ics\"");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(body);
}
