# LEGACY GYM APP — ENGINEERING PLAYBOOK

**Read this file first. It will save you hours and stop you breaking the live app.**

Jake Williamson owns Legacy Gym Central Coast. This is his members-only PWA.
Real members use it every day. There is no staging environment — a commit to
`main` is live to members in about 90 seconds. Treat every change accordingly.

---

## 1. ARCHITECTURE — read before you touch anything

- **`index.html` IS the entire app.** ~400KB. Every screen, all logic, all
  styling, all data. Do not split it up. Do not "refactor into modules."
- It contains **TWO `<script>` blocks**:
  1. The first defines `LB_DATA` (Local Blokes program/meal/boxing data).
  2. The second is the whole application.
  When you verify syntax, you must concatenate BOTH blocks (see §4).
- **`api/redeem.js`** — Vercel serverless function. Converts a member's store
  credit into a real one-time Shopify discount code.
- `manifest.json`, `sw.js` — PWA install config. Rarely touched.
- **The build only copies `index.html`, `manifest.json`, `sw.js` to `public/`.**
  This is why LB_DATA had to be inlined. Do not add a new JS file and expect it
  to load — it will 404 in production.

**Repo:** github.com/jakegsixboxing/legacy-gym (branch `main`)
**Live:** legacygym-app.vercel.app

---

## 2. BACKEND — Supabase

Project: `jyslqxepodrseyhoppce.supabase.co`
Anon key (public by design, safe in client code):
`sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we`

**Row Level Security is ON for every table.** Access is driven by boolean flags
on the `profiles` table:

| Flag | Grants |
|---|---|
| `is_staff` | Staff Room, member registration |
| `is_manager` | Member DMs, gifting/deducting store credit |
| `is_coach` | Coach view of all fighter profiles, sparring matchmaking |
| `is_fighter` | Sparring Club (VIP-walled) |
| `is_blokes` | Local Blokes Heavyweight Club (VIP-walled) |

SQL helpers exist: `is_staff()`, `is_manager()`, `is_coach()`, `is_blokes()`.

**Key tables:** profiles, member_profiles, points_events, challenge_entries,
class_regs, training_logs, lift_logs, blokes_lifts, blokes_messages, blokes_dms,
spar_signups, spar_matchups, spar_messages, boxer_profiles, member_dms,
credit_events, credit_redemptions, bookings, friend_registrations,
golf_registrations, staff_invites, blokes_invites, pt_requests.

The `bookings` and `friend_registrations` tables are **shared with the Kincumber
Recovery app** — same Supabase project. Don't break them.

---

## 3. SHOPIFY / STORE CREDIT

Store: `gsix-sports.myshopify.com` (public: legacygym.net)
Products load live in-app from `/collections/<handle>/products.json` (CORS is
open, no proxy needed).

Store credit flow — fully automatic, no staff step:
1. Manager gifts credit → row in `credit_events`.
2. Member taps "Use It" → app POSTs to `/api/redeem`.
3. `api/redeem.js` verifies the user, checks their balance server-side, then
   calls Shopify's Admin API (client-credentials grant) to create a REAL
   one-time discount code, and records it in `credit_redemptions`.
4. Member enters that code at checkout on legacygym.net.

The Shopify secret lives in the Vercel env var `SHOPIFY_CLIENT_SECRET`.
**Never hardcode it. Never print it. Never ask Jake to paste it into chat.**

---

## 4. THE DEPLOY LOOP — follow this exactly, every time

```
1. EDIT     index.html locally.

2. VERIFY   Extract BOTH <script> blocks and syntax-check them:

              python3 -c "
              import io,re
              s=io.open('index.html',encoding='utf-8').read()
              b=re.findall(r'<script>(.*?)</script>',s,re.S)
              io.open('/tmp/app.js','w',encoding='utf-8').write('\n;\n'.join(b))"
              node --check /tmp/app.js

            Then check for duplicate function names, and unit-test any new
            pure logic in node before deploying. Never skip this.

3. DEPLOY   github.com/jakegsixboxing/legacy-gym/upload/main
            → attach index.html → commit message → Commit changes.

4. WAIT     ~90 seconds for Vercel.

5. CONFIRM  Load legacygym-app.vercel.app/?v=<something-new> (cache-bust),
            run assertions in the console, and check for console errors.
            Not verified live = not done.
```

---

## 5. KNOWN TRAPS — these WILL bite you

**Supabase SQL editor**
- It swallows text typed before the editor finishes loading. Screenshot first,
  confirm the editor is ready, THEN type.
- A "type timed out" error usually means the text DID land. **Always screenshot
  before retyping** or you'll double up your SQL.
- Autocomplete hijacks Enter. Keep SQL on ONE line and press Escape after typing.
- Chunk long SQL into pieces (~700–1200 chars) with Escape between chunks.

**GitHub upload page**
- If you navigate away, the attached file is lost — re-attach it.
- Set the commit message via form input, not by clicking coordinates.
- After clicking Commit, VERIFY the commit actually landed (check the repo
  shows index.html as "now"). It silently fails more often than you'd think.

**Meal data quirk**
- Every meal object has a `build` key, but it's `{}` (empty) for breakfast,
  snacks and dessert. `if (m.build)` is therefore TRUE for every meal — this
  caused a real bug. Always test with `Object.keys(m.build).length`.

**Class bookings are keyed to `class_date` + `class_time`.**
- If you change a class time in `CLASS_SCHEDULE`, existing bookings orphan.
  You MUST migrate `class_regs` rows to the new time or members silently lose
  their spot. (Shift the later class first to avoid a collision.)

**Dates**
- Use `isoDateLocal()`, never `toISOString().slice(0,10)`. UTC vs Sydney time
  caused class-points to vanish before 10am.

---

## 6. HOUSE RULES

- **Members see everything instantly.** Verify before you commit.
- Jake wants tools that work, not lectures. Do the work, then report briefly.
- Tone throughout the app is blokey and direct. Match it. Never corporate.
- Payments outside the store-credit flow are handled at reception, not in-app.
- Don't restructure the single-file architecture without asking Jake.
- Jake often dictates by voice — expect typos and phonetic spellings, and read
  through them rather than asking him to repeat himself.

---

## 7. WHAT'S BUILT (so you don't rebuild it)

Classes booking (full week, opens Sunday 7am) · Legacy Points + 11 ranks +
leaderboard + rules page · Cardio & Member Challenges (StairMaster, Treadmill,
Member vs Member records) · Weights & Functional Fitness (10 programs + CrossFit
WODs, with per-set kg/rep logging) · Boxing (session builder, timers, Sparring
Club with fighter profiles, matchmaking, fighters' chat) · Local Blokes VIP club
(10-week strength program, boxing, meal plans with shopping-list maths, golf
days, The Yarn chat, ladder) · Recovery (Kincumber saunas, water therapy, guest
passes) · Nutrition (4 fuel plans, recipes, weekly shop, Start Here guides) ·
Shop Apparel (live Shopify products + store credit → checkout codes) ·
Staff Room (team chat, tasks, member directory, DMs, credit gifting) ·
Ask Me Anything assistant.

**Outstanding / parked:**
- Alison is supplying 7 nutrition guide documents as markdown — they drop
  straight into the `Start Here` tab (structure is built, placeholders in place).
- Staff room rebuild (parked by Jake).
- Jake + Joe coach accreditations to be added to their coach cards later.
- New timetable when Camp 3 starts (edit `CLASS_SCHEDULE`).
