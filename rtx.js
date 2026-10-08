/*__RTX__ =============================================================
   ROAD TO XMAS CHALLENGE — in-app section (Training Log · Check-Ins ·
   Leaderboard · Overview). Additive add-on, same pattern as fc.js.
   Spec: HANDOVER_road_to_xmas.md + legacy_rtc_app_spec.xlsx + app_demo_interactive.html (Ali, Oct 2026).

   - Entry point: a home-screen card (same as Fight Club) + the existing "You're in · My challenge" strip.
   - Registration flag: the existing challenge_regs row (challenge = 'rtc2026') — no new flag.
   - Backend: rtc_sessions / rtc_saturday / rtc_checkins (+ rtc_coach_views audit), bucket rtc-photos,
     rpc rtc_registrants. RLS: members read/write only their own rows; coaches/staff read any.
   - Points: NOT a new system — the Leaderboard is a filtered read of points_events.
   Delete this file + its <script> tag + the make-icons copy entry to roll back. Touches nothing else.
   ==================================================================== */
(function(){
  var KEY="rtc2026", START="2026-10-12", GAMES=["2026-11-07","2026-12-12"];
  var START_TS=Date.parse("2026-10-12T00:00:00+11:00"); /* Mon 12 Oct, Sydney */
  var RTX={tab:"log",day:null,week:null,role:"member",member:null,reg:null,loaded:false,loading:null,
           sessions:[],sats:[],checkins:[],regs:null,names:{},photos:{},signed:{},coachLogged:{}};

  /* ---------- design tokens — pulled verbatim from app_demo_interactive.html :root ---------- */
  var css=document.createElement("style");css.textContent=`
.rtx{--bg:#000000;--panel:#0A0A0A;--card:#0C0C0C;--border:#1C2A3D;--blue:#3E86D6;--blue-dark:#0E2A52;--blue-ice:#BFDFFB;--blue-line:rgba(62,134,214,0.55);
  --hero-grad:linear-gradient(135deg,#0A1830 0%,#15316E 45%,#2E6FC4 100%);--btn-grad:linear-gradient(135deg,#15316E 0%,#2E6FC4 60%,#4FA3E8 100%);
  --white:#F5F5F5;--muted:#9A9A9A;--muted2:#6C6C70;--volume:#5FB8B0;--deload:#6E9BE8;--strength:#E8954B;--finish:#B07BE0;--input-bg:#000000;--input-border:#22384D;--green:#4FCB7A;color:var(--white)}
.rtx .brand{font-family:Oswald,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.rtx .rtxHero{position:relative;overflow:hidden;border:1.5px solid #5aa9ff;border-radius:18px;background:var(--hero-grad);padding:18px 14px 14px;margin-bottom:10px;color:#fff}
.rtx .rtxHero .rtcArt{position:absolute;right:-4px;top:0;bottom:0;width:60%;pointer-events:none;z-index:0}.rtx .rtxHero .rtcArt svg{width:100%;height:100%;display:block}
.rtx .rtxHero>*{position:relative;z-index:1}
.rtx .rtxEye{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#cfeaff}
.rtx .rtxH{font-family:Oswald,sans-serif;font-size:36px;line-height:.92;text-transform:uppercase;margin:4px 0 6px;color:#fff;font-weight:700}.rtx .rtxH span{color:#cfeaff}
.rtx .rtxPill{display:inline-block;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;background:#fff;color:#0c1a33;padding:1px 6px;border-radius:4px;margin-top:6px;font-weight:700}
.rtx .rtxWhen{font-family:Oswald,sans-serif;font-size:15px;color:#fff;letter-spacing:.5px;margin-top:6px}
.rtx .rtxTag{display:inline-block;line-height:1.2;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;border:1px solid #cfeaff;color:#cfeaff;border-radius:999px;padding:3px 8px;margin:8px 4px 0 0}.rtx .rtxTag.w{background:#fff;color:#0c1a33;border-color:#fff}
.rtx .rtxLogged{position:absolute;top:12px;right:12px;z-index:2;background:var(--green);color:#06110a;font-family:Oswald,sans-serif;font-size:11px;letter-spacing:1.5px;padding:3px 8px;border-radius:999px;display:none}.rtx .rtxLogged.show{display:inline-block}
.rtx .roleTog{display:flex;border:1px solid var(--border);border-radius:12px;overflow:hidden;margin:0 0 10px;background:var(--panel)}
.rtx .roleTog div{flex:1;text-align:center;padding:9px 6px;font-family:Oswald,sans-serif;font-weight:600;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);cursor:pointer}.rtx .roleTog div.active{background:var(--btn-grad);color:#fff}
.rtx .topTabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px}
.rtx .topTab{text-align:center;padding:9px 2px;border:1px solid var(--border);border-radius:10px;background:var(--panel);font-family:Oswald,sans-serif;font-weight:600;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);cursor:pointer;white-space:nowrap}
.rtx .topTab.active{background:var(--btn-grad);border-color:transparent;color:#fff}
.rtx .coachBar{display:flex;align-items:center;gap:8px;border:1px solid var(--blue-line);border-radius:12px;padding:8px 10px;background:var(--card);margin-bottom:6px}
.rtx .coachBar .lbl{font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:var(--blue-ice)}
.rtx .coachBar select{flex:1;background:var(--input-bg);border:1px solid var(--input-border);color:var(--white);border-radius:8px;padding:8px;font:inherit;font-size:13px}
.rtx .coachNote{font-size:11px;color:var(--muted);margin:0 2px 10px;line-height:1.4}
.rtx .dayTabs{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-bottom:8px}
.rtx .dayTab{text-align:center;padding:8px 0;border:1px solid var(--border);border-radius:9px;background:var(--panel);font-family:Oswald,sans-serif;font-weight:600;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);cursor:pointer}.rtx .dayTab.active{background:var(--btn-grad);border-color:transparent;color:#fff}
.rtx .weekBar{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.rtx .weekBtn{width:38px;height:38px;border:1px solid var(--border);border-radius:10px;background:var(--panel);display:grid;place-items:center;color:var(--blue-ice);cursor:pointer;font-size:12px}.rtx .weekBtn.disabled{opacity:.3;pointer-events:none}
.rtx .weekLbl{flex:1;text-align:center;font-family:Oswald,sans-serif;font-weight:700;font-size:18px;text-transform:uppercase;letter-spacing:.5px}.rtx .weekLbl span{display:block;font-size:11px;letter-spacing:2px;color:var(--muted);font-weight:600}
.rtx .card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px 13px;margin-bottom:10px}
.rtx .phasePill{display:inline-block;font-family:Oswald,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 9px;border-radius:999px;border:1px solid;margin-bottom:6px}
.rtx .ph-volume{color:var(--volume);border-color:var(--volume)}.rtx .ph-deload{color:var(--deload);border-color:var(--deload)}.rtx .ph-strength{color:var(--strength);border-color:var(--strength)}.rtx .ph-finish{color:var(--finish);border-color:var(--finish)}
.rtx .phasePurpose{font-size:12px;color:var(--muted);line-height:1.45;margin-bottom:6px}
.rtx .focus{font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--blue-ice);margin-bottom:10px}
.rtx .role{font-family:Oswald,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--blue)}
.rtx .lift{font-family:Oswald,sans-serif;font-size:20px;font-weight:700;text-transform:uppercase;line-height:1.05;margin:3px 0 4px}
.rtx .presc{font-size:12.5px;color:var(--blue-ice);line-height:1.4;margin-bottom:8px}
.rtx .last{font-size:11.5px;color:var(--muted);border:1px dashed var(--border);border-radius:9px;padding:6px 9px;margin-bottom:8px;line-height:1.4}.rtx .last b{color:var(--white)}.rtx .last.new{color:var(--blue-ice);border-color:var(--blue-line)}
.rtx .headrow,.rtx .setrow{display:grid;grid-template-columns:92px 1fr 1fr;gap:6px;align-items:center;margin-bottom:6px}
.rtx .headrow div{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted2);font-weight:800}
.rtx .setlbl{font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:var(--muted)}.rtx .setlbl small{display:block;font-size:9px;letter-spacing:1px;color:var(--muted2)}
.rtx .inp{width:100%;box-sizing:border-box;background:var(--input-bg);border:1px solid var(--input-border);border-radius:9px;padding:9px 10px;color:var(--white);font:inherit;font-size:15px;min-height:40px}
.rtx .inp:focus{outline:none;border-color:var(--blue)}.rtx .inp:disabled{opacity:.55}
.rtx .notlogged{font-size:12.5px;color:var(--muted);padding:6px 0}
.rtx .satMarker{font-family:Oswald,sans-serif;font-size:16px;text-transform:uppercase;color:var(--white);margin:4px 0 6px;font-weight:700}
.rtx .satRow{display:grid;grid-template-columns:1fr 110px;gap:8px;align-items:center;margin-bottom:8px}.rtx .satBlock{margin-bottom:8px}
.rtx .satName{font-size:13px;color:var(--white);line-height:1.3}.rtx .satName small{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--blue)}
.rtx .satDual{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px}
.rtx textarea.inp{min-height:70px;resize:vertical}
.rtx .cmtLbl{font-family:Oswald,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--blue);margin-bottom:6px}
.rtx .btn{display:block;width:100%;border:0;border-radius:12px;padding:13px;background:var(--btn-grad);color:#fff;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:4px}.rtx .btn:disabled{opacity:.5}
.rtx .btn.done{background:var(--panel);border:1px solid var(--green);color:var(--green)}
.rtx .ro{border:1px solid var(--blue-line);border-radius:12px;padding:11px;text-align:center;font-family:Oswald,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--blue-ice);background:var(--panel)}
.rtx .ciIntro{font-size:12.5px;color:var(--muted);line-height:1.45;margin-bottom:10px}.rtx .ciIntro b{color:var(--white)}
.rtx .ciGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.rtx .ciGrid label{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted2);margin-bottom:4px;font-weight:800}
.rtx .ciPhotos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.rtx .ciBox{aspect-ratio:3/4;border:1px dashed var(--blue-line);border-radius:12px;display:grid;place-items:center;color:var(--blue-ice);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;background-size:cover;background-position:center;position:relative;overflow:hidden}
.rtx .ciBox.has{border-style:solid}.rtx .ciBox.has span{background:rgba(0,0,0,.6);padding:3px 7px;border-radius:6px}.rtx .ciBox.ro{cursor:default}
.rtx .ciHist{border-top:1px solid var(--border);padding:10px 0;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:start}.rtx .ciHist:first-of-type{border-top:0}
.rtx .ciDate{font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--blue-ice);margin-bottom:3px}
.rtx .ciStats{font-size:12px;color:var(--white);line-height:1.5}.rtx .ciStats small{color:var(--muted);margin-left:3px}.rtx .ciStats small.dn{color:var(--green)}.rtx .ciStats small.up{color:var(--strength)}
.rtx .ciNotes{font-size:11.5px;color:var(--muted);margin-top:3px;line-height:1.4}
.rtx .ciThumbs{display:flex;gap:4px}.rtx .ciThumb{width:34px;height:46px;border-radius:6px;border:1px solid var(--border);background:var(--panel) center/cover no-repeat;cursor:pointer}
.rtx .secT{font-family:Oswald,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--blue);margin:14px 0 6px}
.rtx .lbRow{display:grid;grid-template-columns:34px 1fr auto;gap:8px;align-items:center;padding:9px 10px;border:1px solid var(--border);border-radius:11px;margin-bottom:6px;background:var(--panel)}
.rtx .lbRow.you{border-color:var(--blue);background:rgba(62,134,214,.12)}
.rtx .lbRank{font-family:Oswald,sans-serif;font-size:16px;color:var(--muted);font-weight:700}.rtx .lbRow.you .lbRank{color:var(--blue-ice)}
.rtx .lbName{font-size:14px;font-weight:700}.rtx .lbName .yb{display:inline-block;margin-left:6px;background:var(--blue);color:#fff;font-size:9px;letter-spacing:1px;padding:2px 6px;border-radius:999px;vertical-align:middle;font-weight:800}
.rtx .lbPts{font-family:Oswald,sans-serif;font-size:18px;font-weight:700;color:var(--blue-ice)}.rtx .lbPts small{font-size:10px;color:var(--muted);letter-spacing:1px;margin-left:2px}
.rtx .lbScope{font-size:12.5px;color:var(--muted);line-height:1.45}.rtx .lbScope b{color:var(--white)}.rtx .lbScope ul{margin:6px 0 0 16px;padding:0}.rtx .lbScope li{margin:2px 0}
.rtx .lbFoot{font-size:11px;color:var(--muted2);text-align:center;margin-top:8px;line-height:1.4}
.rtx .lbSticky{position:sticky;bottom:calc(74px + env(safe-area-inset-bottom));z-index:5;box-shadow:0 -6px 20px rgba(0,0,0,.6)}
.rtx .ovDates{font-family:Oswald,sans-serif;font-size:22px;font-weight:700;text-transform:uppercase}.rtx .ovWeeks{font-size:12px;color:var(--muted);margin-bottom:6px}
.rtx .ovPhase{border-left:3px solid;border-radius:0 10px 10px 0;padding:8px 10px;margin-bottom:8px;background:var(--panel)}
.rtx .ovPhase .h{display:flex;justify-content:space-between;gap:8px;font-family:Oswald,sans-serif;font-size:14px;text-transform:uppercase;font-weight:700}.rtx .ovPhase .h span{color:var(--muted);font-weight:600;font-size:12px;letter-spacing:1px}
.rtx .ovPhase p{font-size:12px;color:var(--muted);margin:3px 0 0;line-height:1.4}
.rtx .ovLift{display:grid;grid-template-columns:86px 1fr;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px}.rtx .ovLift:last-child{border-bottom:0}
.rtx .ovLift .d{font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:var(--blue-ice)}
.rtx .ovSeg{display:flex;gap:8px;margin-bottom:3px}.rtx .ovSeg span:first-child{color:var(--muted);white-space:nowrap;min-width:78px}.rtx .ovSeg span:last-child{color:var(--white)}
.rtx .ovPts{font-size:12.5px;color:var(--muted);line-height:1.45;margin-top:4px}.rtx .ovPts b{color:var(--white)}
.rtx .rtxLink{display:block;text-align:center;color:var(--blue-ice);font-size:12px;font-weight:700;margin:10px 0 0;cursor:pointer;text-decoration:underline;text-underline-offset:3px;background:none;border:0;width:100%}
.rtx .toast{display:none;text-align:center;font-size:12px;color:var(--green);margin-top:8px}.rtx .toast.show{display:block}
.rtxCard{display:block;width:100%;text-align:left;cursor:pointer;position:relative;overflow:hidden;border:1.5px solid #5aa9ff;border-radius:18px;padding:16px 16px 14px;margin-bottom:14px;background:radial-gradient(120% 90% at 100% 0%,#1d4fb0 0%,#0f2a5c 45%,#0a162e 100%);color:#fff}
.rtxCard .k{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#cfeaff}.rtxCard .t{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;line-height:1;margin:4px 0 6px}
.rtxCard .s{font-size:12px;color:#e6f2ff;line-height:1.4}.rtxCard .p{position:absolute;right:14px;top:14px;background:#fff;color:#0c1a33;font-size:9px;font-weight:900;letter-spacing:1.5px;padding:5px 9px;border-radius:999px;text-transform:uppercase}.rtxCard .p.in{background:#4bc97a;color:#06110a}
.rtxZoom{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9500;display:grid;place-items:center;padding:16px}.rtxZoom img{max-width:100%;max-height:92vh;border-radius:12px}
`;document.head.appendChild(css);

  var ART='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200" fill="none" stroke="#cfeaff" stroke-width="1.5" stroke-linecap="round"><g opacity=".5"><g transform="translate(236 44)"><line x1="-8" y1="0" x2="8" y2="0"/><line x1="0" y1="-8" x2="0" y2="8"/><line x1="-6" y1="-6" x2="6" y2="6"/><line x1="-6" y1="6" x2="6" y2="-6"/></g><g transform="translate(160 30) scale(.7)"><line x1="-8" y1="0" x2="8" y2="0"/><line x1="0" y1="-8" x2="0" y2="8"/><line x1="-6" y1="-6" x2="6" y2="6"/><line x1="-6" y1="6" x2="6" y2="-6"/></g><g transform="translate(274 96) scale(.55)"><line x1="-8" y1="0" x2="8" y2="0"/><line x1="0" y1="-8" x2="0" y2="8"/><line x1="-6" y1="-6" x2="6" y2="6"/><line x1="-6" y1="6" x2="6" y2="-6"/></g><g transform="translate(200 120) scale(.45)"><line x1="-8" y1="0" x2="8" y2="0"/><line x1="0" y1="-8" x2="0" y2="8"/><line x1="-6" y1="-6" x2="6" y2="6"/><line x1="-6" y1="6" x2="6" y2="-6"/></g></g><g opacity=".35" fill="#ffffff" stroke="none"><circle cx="120" cy="52" r="1.4"/><circle cx="206" cy="70" r="1.2"/><circle cx="252" cy="150" r="1.4"/><circle cx="170" cy="164" r="1"/><circle cx="286" cy="24" r="1"/><circle cx="140" cy="126" r="1.1"/></g></svg>';

  /* ---------- program data (source of truth: spreadsheet + demo JS arrays) ---------- */
  var DAYS=["Monday","Tuesday","Wednesday","Thursday","Saturday"];
  var SESSION_FOCUS={Monday:"Vertical push + light lower/stability",Tuesday:"Horizontal push + posterior chain",Wednesday:"Unilateral lower + vertical pull",Thursday:"Bilateral lower + horizontal pull",Saturday:"Team relay / Hyrox-style format"};
  var PHASE_LABEL={1:"Phase 1 — Volume (establish)",2:"Phase 1 — Volume (build)",3:"Phase 1 — Volume (build)",4:"Phase 1 — taper into Games I",5:"Deload / Align (post Games I)",6:"Phase 2 — Strength (build)",7:"Phase 2 — Strength (build)",8:"Phase 2 — Power (build)",9:"Phase 2 — taper into Games II",10:"The Finish — deload"};
  var PHASE_PURPOSE={"Phase 1 — Volume (establish)":"Week 1 sets the baseline — a rep-max test on Tuesday/Thursday's main lift, higher reps everywhere else.","Phase 1 — Volume (build)":"Higher reps, moderate load — building capacity and technique, working up to Legacy Games I.","Phase 1 — taper into Games I":"Moderate load.","Deload / Align (post Games I)":"Recovery week after Games I. Light, technique-focused — not about chasing a number.","Phase 2 — Strength (build)":"Lower reps, heavier load — building strength toward Legacy Games II.","Phase 2 — Power (build)":"The heaviest week of the block — add speed and intent on top sets.","Phase 2 — taper into Games II":"Protect the body before Saturday — back off, don't push for a new number.","The Finish — deload":"No heavy loading this week — partner/team formats, same reduced-load logic as the Week 5 deload, with the points leaderboard wrap-up built in."};
  function phaseClass(wk){return wk<=4?"ph-volume":wk===5?"ph-deload":wk<=9?"ph-strength":"ph-finish";}
  var LIFT_MAIN={
    Monday:["Barbell Overhead Press","Barbell Overhead Press","Barbell Overhead Press","Barbell Overhead Press","Barbell Overhead Press","Barbell Push Press","Barbell Push Press","Barbell Push Press","Barbell Push Press","—"],
    Tuesday:["Barbell Bench Press","Close-Grip Barbell Bench Press","Close-Grip Barbell Bench Press","Close-Grip Barbell Bench Press","Close-Grip Barbell Bench Press","Barbell Bench Press","Barbell Bench Press","Barbell Bench Press","Barbell Bench Press","Barbell Bench Press"],
    Wednesday:["Bulgarian Split Squat","Bulgarian Split Squat","Bulgarian Split Squat","Bulgarian Split Squat","Bulgarian Split Squat","Barbell Reverse Lunge","Barbell Reverse Lunge","Barbell Reverse Lunge","Barbell Reverse Lunge","—"],
    Thursday:["Back Squat","Front Squat","Front Squat","Front Squat","Front Squat","Back Squat","Back Squat","Back Squat","Back Squat","Back Squat"]};
  var LIFT_SEC={
    Tuesday:["Conventional Deadlift","Romanian Deadlift","Romanian Deadlift","Romanian Deadlift","Romanian Deadlift","Conventional Deadlift","Conventional Deadlift","Conventional Deadlift","Conventional Deadlift","Conventional Deadlift"],
    Thursday:["Bent-Over Row","Bent-Over Row","Bent-Over Row","Bent-Over Row","Bent-Over Row","Pendlay Row","Pendlay Row","Pendlay Row","Pendlay Row","Pendlay Row"]};
  var NEW_LIFT_MAIN={Monday:[6],Tuesday:[2,6],Wednesday:[6],Thursday:[2,6]}, NEW_LIFT_SEC={Tuesday:[2,6],Thursday:[6]};
  var SAT_STD4=[{name:"Sled Push + Pull",type:"Time"},{name:"Wall Balls",type:"Reps"},{name:"Burpee Broad Jumps",type:"Reps"},{name:"Farmer's Carry",type:"Time"}];
  var SAT_LOG={
    1:{marker:"Games format intro",stations:[{name:"Run",type:"TimeDistance"},{name:"Machine — bike/row/ski, members' choice",type:"TimeDistance"}],note:"First week — teams aren't formed yet, so this logs your own numbers only."},
    2:{marker:"Games format building",stations:[{name:"Run",type:"TimeDistance"},{name:"Machine — bike/row/ski, members' choice",type:"TimeDistance"},{name:"Farmer's Carry",type:"Time"}],note:"Carry added. Still individual-only — no team field yet."},
    3:{marker:"Near-full dress rehearsal",stations:SAT_STD4,note:"Run becomes a connecting jog between stations from here on — it's not logged on its own anymore."},
    4:{marker:"LEGACY GAMES I",stations:SAT_STD4,note:"Teams are picked by level today, but this log stays individual — team scoring is a separate feature to add later."},
    5:{marker:"Deload — team/tag game",stations:[],note:"Light team game, not station-specific — nothing to log this week."},
    6:{marker:"General (skill banked)",stations:SAT_STD4,note:""},
    7:{marker:"General",stations:SAT_STD4,note:""},
    8:{marker:"Rehearsal for Games II",stations:SAT_STD4,note:"Full scale, 8-leg shape — same 4 stations, logged the same way."},
    9:{marker:"LEGACY GAMES II",stations:SAT_STD4,note:"Full distance, 8 legs — same 4 stations, logged the same way."},
    10:{marker:"No Saturday session",stations:[],note:"Dec 19 is The Finish event itself, not a programmed class — nothing to log."}};
  function ttMainGoal(wk){return {
    1:{type:"test",text:"Ramp to a 4-5 rep max — log only your top set (baseline, retested Week 10)",rows:[{label:"TOP SET",reps:"4-5"}]},
    2:{type:"normal",text:"Goal: 10 reps · 4 sets",reps:10,sets:4},3:{type:"normal",text:"Goal: 8 reps · 4 sets",reps:8,sets:4},4:{type:"normal",text:"Goal: 6 reps · 4 sets",reps:6,sets:4},
    5:{type:"normal",text:"Goal: 10 reps · 3 sets",reps:10,sets:3},6:{type:"normal",text:"Goal: 6 reps · 4 sets",reps:6,sets:4},
    7:{type:"ladder",text:"Ladder: 8 → 6 → 5 reps, heavier each round, then 1 back-off set at Week 6's weight",rows:[{label:"SET 1",reps:8},{label:"SET 2",reps:6},{label:"SET 3",small:"(TOP)",reps:5},{label:"SET 4",small:"(BACK-OFF)",reps:"—"}]},
    8:{type:"build",text:"Build to 4 reps top · 4 rounds",rows:[{label:"ROUND 1",reps:4},{label:"ROUND 2",reps:4},{label:"ROUND 3",reps:4},{label:"ROUND 4",small:"(TOP)",reps:4}]},
    9:{type:"normal",text:"Goal: 5 reps · 3 sets",reps:5,sets:3},
    10:{type:"test",text:"Ramp to a 4-5 rep max — log only your top set (same lift as Week 1)",rows:[{label:"TOP SET",reps:"4-5"}]}}[wk];}
  function ttSecGoal(wk){var reps=[8,12,10,8,10,8,8,8,8,8],sets=[3,4,4,4,3,4,4,4,3,3];return {type:"normal",text:"Goal: "+reps[wk-1]+" reps · "+sets[wk-1]+" sets",reps:reps[wk-1],sets:sets[wk-1]};}
  function mwMainGoal(day,wk){
    var base={1:{type:"normal",text:"Goal: 10 reps · 3-4 sets",reps:10,sets:4},2:{type:"normal",text:"Goal: 10 reps · 4 sets",reps:10,sets:4},3:{type:"normal",text:"Goal: 8 reps · 4 sets",reps:8,sets:4},4:{type:"normal",text:"Goal: 8 reps · 3 sets",reps:8,sets:3},5:{type:"normal",text:"Goal: 10 reps · 3 sets",reps:10,sets:3},6:{type:"normal",text:"Goal: 8 reps · 4 sets",reps:8,sets:4},7:{type:"normal",text:"Goal: 8 reps · 4 sets",reps:8,sets:4},
      8:{type:"ladder",text:"Ladder: top set 6 reps · 3 rounds",rows:[{label:"ROUND 1",reps:"—"},{label:"ROUND 2",reps:"—"},{label:"ROUND 3",small:"(TOP)",reps:6}]},9:{type:"normal",text:"Goal: 8 reps · 3 sets",reps:8,sets:3},10:{type:"notlogged",text:"Not logged (Partner Format)"}}[wk];
    base=JSON.parse(JSON.stringify(base));
    if(day==="Wednesday"&&wk<=9){base.text+=wk<=5?" — per side (full set one leg, then switch)":" — per side, alternating (one rep left, one right)";}
    return base;
  }
  function goalFor(day,which,wk){if(which==="main")return (day==="Tuesday"||day==="Thursday")?ttMainGoal(wk):mwMainGoal(day,wk);return ttSecGoal(wk);}
  function rowsFor(goal){if(goal.rows)return goal.rows;var r=[];for(var i=1;i<=goal.sets;i++)r.push({label:"SET "+i,reps:goal.reps});return r;}
  var OVERVIEW_PHASES=[
    {label:"Phase 1 — Volume",range:"Weeks 1-4",col:"var(--volume)",text:"Higher reps, moderate load — building capacity and technique toward Legacy Games I (Sat 7 Nov)."},
    {label:"Deload / Align",range:"Week 5",col:"var(--deload)",text:"Light, technique-focused recovery after Games I — not about chasing a number."},
    {label:"Phase 2 — Strength & Power",range:"Weeks 6-9",col:"var(--strength)",text:"Lower reps, heavier load — building toward Legacy Games II (Sat 12 Dec)."},
    {label:"The Finish",range:"Week 10",col:"var(--finish)",text:"Deload — partner/team formats, points leaderboard wrap-up. Christmas party Sat 19 Dec; no Saturday class that week."}];
  var OVERVIEW_LIFTS=[
    {day:"Monday",segments:[{range:"Weeks 1-5",lift:"Barbell Overhead Press"},{range:"Weeks 6-9",lift:"Barbell Push Press"}]},
    {day:"Tuesday",segments:[{range:"Week 1",lift:"Barbell Bench Press"},{range:"Weeks 2-5",lift:"Close-Grip Bench Press"},{range:"Weeks 6-10",lift:"Barbell Bench Press"}]},
    {day:"Wednesday",segments:[{range:"Weeks 1-5",lift:"Bulgarian Split Squat"},{range:"Weeks 6-9",lift:"Barbell Reverse Lunge"}]},
    {day:"Thursday",segments:[{range:"Week 1",lift:"Back Squat"},{range:"Weeks 2-5",lift:"Front Squat"},{range:"Weeks 6-10",lift:"Back Squat"}]},
    {day:"Saturday",segments:[{range:"Weeks 1-3",lift:"Hyrox-style weights & conditioning"},{range:"Week 4",lift:"Games Day"},{range:"Weeks 5-8",lift:"Hyrox-style weights & conditioning"},{range:"Week 9",lift:"Games Day"}]}];

  /* ---------- helpers ---------- */
  function E(s){return typeof esc==="function"?esc(s==null?"":String(s)):String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function T(m){if(typeof toast==="function")toast(m);}
  function me(){return session&&session.user?session.user.id:null;}
  function canCoach(){return !!(profile&&(profile.is_coach||profile.is_staff));}
  function viewing(){return RTX.role==="coach"&&RTX.member?RTX.member:me();}
  function isCoachView(){return RTX.role==="coach"&&RTX.member&&RTX.member!==me();}
  function curWeek(){var w=Math.floor((Date.now()-START_TS)/(7*864e5))+1;return Math.max(1,Math.min(10,w));}
  function curDay(){var d=new Date().getDay();return ["Monday","Monday","Tuesday","Wednesday","Thursday","Thursday","Saturday"][d];}
  function firstLast(n){n=String(n||"").trim();if(!n)return "Member";var p=n.split(/\s+/);return p.length>1?p[0]+" "+p[p.length-1][0].toUpperCase()+".":p[0];}
  function myName(){var n=(typeof myDisplayName==="function"?myDisplayName():"")||((profile&&profile.first_name)||"");return n;}
  function fmtDate(iso){var d=new Date(iso);return d.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}

  /* ---------- data ---------- */
  async function loadReg(){
    if(!me())return;
    try{var r=await sb.from("challenge_regs").select("id,user_id,created_at").eq("challenge",KEY).eq("user_id",me()).maybeSingle();RTX.reg=r.data||null;}catch(e){RTX.reg=null;}
  }
  async function loadMember(uid){
    var q1=sb.from("rtc_sessions").select("*").eq("user_id",uid).eq("challenge",KEY);
    var q2=sb.from("rtc_saturday").select("*").eq("user_id",uid).eq("challenge",KEY);
    var q3=sb.from("rtc_checkins").select("*").eq("user_id",uid).eq("challenge",KEY).order("logged_at",{ascending:true});
    var r=await Promise.all([q1,q2,q3]);
    RTX.sessions=r[0].data||[];RTX.sats=r[1].data||[];RTX.checkins=r[2].data||[];RTX.signed={};
  }
  async function loadRegs(){
    try{var r=await sb.rpc("rtc_registrants",{c:KEY});RTX.regs=r.data||[];}catch(e){RTX.regs=[];}
    try{if(typeof loadWorld==="function")await loadWorld();}catch(e){}
    RTX.names={};
    var mps=(typeof ptsData!=="undefined"&&ptsData.mprofiles)||[];
    mps.forEach(function(m){RTX.names[m.user_id]=m.full_name||"";});
    if(me()&&!RTX.names[me()])RTX.names[me()]=myName();
  }
  async function load(){
    if(RTX.loading)return RTX.loading;
    RTX.loading=(async function(){
      await loadReg();
      await Promise.all([loadMember(viewing()),loadRegs()]);
      RTX.loaded=true;RTX.loading=null;
    })();
    return RTX.loading;
  }
  function sessionFor(day,wk){return RTX.sessions.find(function(s){return s.day===day&&s.week===wk;})||null;}
  function satFor(wk){return RTX.sats.find(function(s){return s.week===wk;})||null;}

  /* ---------- hero (reuse of the existing Road to Christmas card) ---------- */
  function heroHtml(){
    var reg=!!RTX.reg, wk=curWeek();
    return '<div class="rtxHero"><div class="rtcArt">'+ART+'</div><span class="rtxLogged" id="rtxLogged">✓ LOGGED</span>'+
      '<div class="rtxEye">Legacy Gym</div><div class="rtxH">Road to <span>Christmas</span></div><div class="rtxPill">10 Week Challenge</div>'+
      '<div class="rtxWhen">Mon 12 Oct → Sat 19 Dec</div><div>'+
      (reg?'<span class="rtxTag w">✓ You\'re in</span>':'<span class="rtxTag w">Not registered</span>')+
      '<span class="rtxTag">All levels</span><span class="rtxTag">S&amp;C sessions only</span>'+
      (Date.now()>=START_TS?'<span class="rtxTag">Week '+wk+' of 10</span>':'')+'</div></div>';
  }

  /* ---------- shell ---------- */
  var TOPTABS=[["overview","Overview"],["log","Training Log"],["checkins","Check-Ins"],["leaderboard","Leaderboard"]];
  function topTabsHtml(){return TOPTABS.map(function(t){return '<div class="topTab '+(RTX.tab===t[0]?"active":"")+'" data-tab="'+t[0]+'" onclick="rtxTab(\''+t[0]+'\')">'+t[1]+'</div>';}).join("");}
  function syncTopTabs(){var w=$("rtxTopTabs");if(w)w.innerHTML=topTabsHtml();}
  function renderRTX(){
    if(!session){go("home");return;}
    if(RTX.day==null){RTX.day=curDay();RTX.week=curWeek();}
    var coachUI=canCoach()?'<div class="roleTog" id="rtxRole"><div class="'+(RTX.role==="member"?"active":"")+'" onclick="rtxRole(\'member\')">Member View</div><div class="'+(RTX.role==="coach"?"active":"")+'" onclick="rtxRole(\'coach\')">Coach View</div></div>':"";
    $("main").innerHTML='<div class="rtx"><button class="backBtn" onclick="go(\'home\')">‹ Home</button>'+heroHtml()+coachUI+'<div class="topTabs" id="rtxTopTabs">'+topTabsHtml()+'</div><div id="rtxCoachBar"></div><div id="rtxPane"><div class="loadingDots">Loading…</div></div>'+
      '<button class="rtxLink" onclick="rtxInfo()">Challenge info, nutrition &amp; who\'s in ›</button></div>';
    if(!RTX.loaded){load().then(function(){if(view==="rtx")renderPane();});}else renderPane();
  }
  function coachBarHtml(){
    if(RTX.role!=="coach"||(RTX.tab!=="log"&&RTX.tab!=="checkins"))return "";
    var list=(RTX.regs||[]).slice().map(function(r){return {id:r.user_id,name:RTX.names[r.user_id]||"Member"};}).sort(function(a,b){return a.name.localeCompare(b.name);});
    if(me()&&!list.some(function(x){return x.id===me();}))list.unshift({id:me(),name:(RTX.names[me()]||myName())+" (me)"});
    var opts=list.map(function(m){return '<option value="'+m.id+'" '+(m.id===RTX.member?"selected":"")+'>'+E(m.name)+'</option>';}).join("");
    return '<div class="coachBar"><span class="lbl">Viewing</span><select onchange="rtxMember(this.value)">'+opts+'</select></div>'+
      '<div class="coachNote">Coach View is read-only — '+(RTX.tab==="log"?"Training Log":"Check-Ins")+' data stays private to each member; coaches can look it up, not log on their behalf.</div>';
  }
  function renderPane(){
    var bar=$("rtxCoachBar");if(bar)bar.innerHTML=coachBarHtml();
    var pane=$("rtxPane");if(!pane)return;
    var badge=$("rtxLogged");if(badge)badge.classList.remove("show");
    if(RTX.tab==="log")pane.innerHTML=logHtml();
    else if(RTX.tab==="checkins")pane.innerHTML=checkinsHtml();
    else if(RTX.tab==="leaderboard")pane.innerHTML=leaderboardHtml();
    else pane.innerHTML=overviewHtml();
    if(RTX.tab==="checkins")afterCheckins();
    if(RTX.tab==="leaderboard")afterLeaderboard();
  }
  window.rtxTab=function(t){RTX.tab=t;syncTopTabs();renderPane();try{window.scrollTo(0,0);}catch(e){}
    if(t==="leaderboard"){try{ptsData.loaded=false;}catch(e){}loadRegs().then(function(){if(view==="rtx"&&RTX.tab==="leaderboard")renderPane();});}};
  window.rtxRole=function(r){
    if(r==="coach"&&!canCoach())return;
    RTX.role=r;
    if(r==="member"){RTX.member=null;}
    else if(!RTX.member){RTX.member=me();}
    renderRTX();
  };
  window.rtxMember=async function(uid){
    RTX.member=uid;RTX.loaded=false;
    var pane=$("rtxPane");if(pane)pane.innerHTML='<div class="loadingDots">Loading…</div>';
    await loadMember(uid);RTX.loaded=true;
    if(uid!==me()&&!RTX.coachLogged[uid+RTX.tab]){RTX.coachLogged[uid+RTX.tab]=1;try{sb.from("rtc_coach_views").insert({coach_id:me(),viewed_user_id:uid,tab:RTX.tab}).then(function(){});}catch(e){}}
    if(view==="rtx")renderPane();
  };
  window.rtxInfo=function(){RTX.bypass=true;go("rtc");};

  /* ---------- Tab 1 — Training Log ---------- */
  function lastWeekInfo(day,which,wk){
    if(wk<=1)return {none:true,msg:"First time logging this — nothing to compare yet."};
    var nl=which==="main"?(NEW_LIFT_MAIN[day]||[]):(NEW_LIFT_SEC[day]||[]);
    if(nl.indexOf(wk)>=0)return {none:true,msg:"New lift this week — no prior comparison."};
    var prev=sessionFor(day,wk-1);
    var sets=prev?(which==="main"?prev.main_sets:prev.secondary_sets):null;
    if(!prev||!sets||!sets.length)return {none:true,msg:"Not logged last week."};
    var chosen=null;for(var i=sets.length-1;i>=0;i--){if(sets[i]&&sets[i].weight){chosen=sets[i];break;}}
    if(!chosen)return {none:true,msg:"Not logged last week."};
    var reps=chosen.reps||rowsFor(goalFor(day,which,wk-1)).slice(-1)[0].reps;
    return {none:false,weight:chosen.weight,reps:reps};
  }
  function liftCard(role,key,lift,goal,last,saved,ro){
    if(goal.type==="notlogged"||lift==="—")return '<div class="card"><div class="role">'+role+'</div><div class="notlogged">Not logged this week — Partner Format.</div></div>';
    var rows=rowsFor(goal);
    var lastHtml=last.none?'<div class="last new">'+last.msg+'</div>':'<div class="last">Last week (you logged): <b>'+E(last.reps)+' reps @ '+E(last.weight)+'kg</b> on the final set</div>';
    var rowsHtml=rows.map(function(r,i){var sv=(saved&&saved[i])||{};
      return '<div class="setrow"><div class="setlbl">'+r.label+(r.small?'<small>'+r.small+'</small>':'')+'</div>'+
        '<input class="inp" inputmode="numeric" data-k="'+key+'" data-i="'+i+'" data-f="reps" placeholder="'+r.reps+'" value="'+E(sv.reps||"")+'" '+(ro?"disabled":"")+'>'+
        '<input class="inp" inputmode="decimal" data-k="'+key+'" data-i="'+i+'" data-f="weight" placeholder="kg" value="'+E(sv.weight||"")+'" '+(ro?"disabled":"")+'></div>';}).join("");
    return '<div class="card"><div class="role">'+role+'</div><div class="lift">'+E(lift)+'</div><div class="presc">'+E(goal.text)+'</div>'+lastHtml+
      '<div class="headrow"><div></div><div>Reps</div><div>Weight</div></div>'+rowsHtml+'</div>';
  }
  function satCard(wk,saved,ro){
    var info=SAT_LOG[wk];
    if(!info.stations.length)return '<div class="card"><div class="role">Saturday — Games Day</div><div class="satMarker">'+E(info.marker)+'</div><div class="notlogged">'+E(info.note)+'</div></div>';
    var st=(saved&&saved.stations)||[];
    var rows=info.stations.map(function(s,i){var sv=st[i]||{};
      if(s.type==="TimeDistance")return '<div class="satBlock"><div class="satName">'+E(s.name)+'<small>Time + Distance</small></div><div class="satDual">'+
        '<input class="inp" data-s="'+i+'" data-f="distance" placeholder="distance (m)" value="'+E(sv.distance||"")+'" '+(ro?"disabled":"")+'>'+
        '<input class="inp" data-s="'+i+'" data-f="time" placeholder="mm:ss" value="'+E(sv.time||"")+'" '+(ro?"disabled":"")+'></div></div>';
      var unit=s.type==="Time"?"mm:ss":"reps";
      return '<div class="satRow"><div class="satName">'+E(s.name)+'<small>'+s.type+'</small></div><input class="inp" data-s="'+i+'" data-f="value" placeholder="'+unit+'" value="'+E(sv.value||"")+'" '+(ro?"disabled":"")+'></div>';}).join("");
    return '<div class="card"><div class="role">Saturday — Games Day</div><div class="satMarker">'+E(info.marker)+'</div><div class="last">Individual log only.</div>'+(info.note?'<div class="last new">'+E(info.note)+'</div>':'')+rows+'</div>';
  }
  function logHtml(){
    var day=RTX.day,wk=RTX.week,ro=isCoachView();
    var dayTabs=DAYS.map(function(d){return '<div class="dayTab '+(d===day?"active":"")+'" onclick="rtxDay(\''+d+'\')">'+d.slice(0,3)+'</div>';}).join("");
    var lbl=PHASE_LABEL[wk];
    var body,saved;
    if(day==="Saturday"){saved=satFor(wk);body=satCard(wk,saved,ro);}
    else{
      saved=sessionFor(day,wk);
      var mainLift=LIFT_MAIN[day][wk-1],mainGoal=goalFor(day,"main",wk);
      body=liftCard("Main Lift","main",mainLift,mainGoal,lastWeekInfo(day,"main",wk),saved&&saved.main_sets,ro);
      if(day==="Tuesday"||day==="Thursday")body+=liftCard("Secondary Lift","sec",LIFT_SEC[day][wk-1],goalFor(day,"secondary",wk),lastWeekInfo(day,"secondary",wk),saved&&saved.secondary_sets,ro);
      else body+='<div class="card"><div class="notlogged">Secondary lift isn\'t logged on Monday/Wednesday.</div></div>';
    }
    var loggable=day==="Saturday"?SAT_LOG[wk].stations.length>0:!(goalFor(day,"main",wk).type==="notlogged");
    setTimeout(function(){var b=$("rtxLogged");if(b)b.classList.toggle("show",!!saved);},0);
    return '<div class="dayTabs">'+dayTabs+'</div>'+
      '<div class="weekBar"><div class="weekBtn '+(wk<=1?"disabled":"")+'" onclick="rtxWeek(-1)">◀</div><div class="weekLbl">Week '+wk+' of 10<span>'+day+'</span></div><div class="weekBtn '+(wk>=10?"disabled":"")+'" onclick="rtxWeek(1)">▶</div></div>'+
      '<span class="phasePill '+phaseClass(wk)+'">'+E(lbl)+'</span><div class="phasePurpose">'+E(PHASE_PURPOSE[lbl])+'</div><div class="focus">'+E(SESSION_FOCUS[day])+'</div>'+
      body+
      (loggable?'<div class="card"><div class="cmtLbl">Comments</div><textarea class="inp" id="rtxComments" placeholder="Add any comments..." '+(ro?"disabled":"")+'>'+E((saved&&saved.comments)||"")+'</textarea></div>'+
        (ro?'<div class="ro">Coach View — Read Only</div>':'<button class="btn '+(saved?"done":"")+'" id="rtxSubmit" onclick="rtxSubmit()">'+(saved?"Update Session":"Submit Session")+'</button><div class="toast" id="rtxToast">✓ Session saved</div>'):"");
  }
  window.rtxDay=function(d){RTX.day=d;renderPane();};
  window.rtxWeek=function(n){RTX.week=Math.max(1,Math.min(10,RTX.week+n));renderPane();};
  function collect(key){var by={};document.querySelectorAll('#rtxPane input.inp[data-k="'+key+'"]').forEach(function(i){var idx=i.dataset.i;by[idx]=by[idx]||{};by[idx][i.dataset.f]=i.value.trim();});return Object.keys(by).sort(function(a,b){return a-b;}).map(function(k){return by[k];});}
  window.rtxSubmit=async function(){
    if(isCoachView()||!me())return;
    var day=RTX.day,wk=RTX.week,btn=$("rtxSubmit");if(btn)btn.disabled=true;
    var comments=($("rtxComments")&&$("rtxComments").value.trim())||"";
    var r;
    if(day==="Saturday"){
      var info=SAT_LOG[wk],st=[];
      document.querySelectorAll('#rtxPane input.inp[data-s]').forEach(function(i){var idx=Number(i.dataset.s);st[idx]=st[idx]||{name:info.stations[idx].name,type:info.stations[idx].type};st[idx][i.dataset.f]=i.value.trim();});
      var filled=st.some(function(s){return s&&(s.value||s.time||s.distance);});
      if(!filled){T("Log at least one station first.");if(btn)btn.disabled=false;return;}
      r=await sb.from("rtc_saturday").upsert({user_id:me(),challenge:KEY,week:wk,stations:st,comments:comments,updated_at:new Date().toISOString()},{onConflict:"user_id,challenge,week"}).select().single();
      if(!r.error){RTX.sats=RTX.sats.filter(function(s){return s.week!==wk;}).concat([r.data]);}
    }else{
      var mainGoal=goalFor(day,"main",wk);
      var row={user_id:me(),challenge:KEY,week:wk,day:day,main_lift:LIFT_MAIN[day][wk-1],main_sets:mainGoal.type==="notlogged"?[]:collect("main"),secondary_lift:(LIFT_SEC[day]||[])[wk-1]||"",secondary_sets:(day==="Tuesday"||day==="Thursday")?collect("sec"):[],comments:comments,updated_at:new Date().toISOString()};
      var any=row.main_sets.concat(row.secondary_sets).some(function(s){return s&&(s.reps||s.weight);});
      if(!any){T("Fill in at least one set — reps and kilos.");if(btn)btn.disabled=false;return;}
      r=await sb.from("rtc_sessions").upsert(row,{onConflict:"user_id,challenge,week,day"}).select().single();
      if(!r.error){RTX.sessions=RTX.sessions.filter(function(s){return !(s.day===day&&s.week===wk);}).concat([r.data]);}
    }
    if(r.error){T(r.error.message);if(btn)btn.disabled=false;return;}
    renderPane();
    var t=$("rtxToast");if(t){t.classList.add("show");setTimeout(function(){t.classList.remove("show");},1800);}
  };

  /* ---------- Tab 2 — Check-Ins ---------- */
  var ciPending={front:null,side:null,back:null};
  function delta(cur,prev,unit){
    if(typeof cur!=="number"||typeof prev!=="number"||cur==null||prev==null)return "";
    var d=Math.round((cur-prev)*10)/10;if(Math.abs(d)<.05)return '<small>(no change)</small>';
    return '<small class="'+(d<0?"dn":"up")+'">('+(d>0?"+":"")+d+unit+')</small>';
  }
  function num(v){return v==null||v===""?null:Number(v);}
  function val(v,unit){return v==null||v===""?"—":v+unit;}
  function checkinsHtml(){
    var ro=isCoachView();
    var list=RTX.checkins.slice().reverse();
    var hist=list.map(function(c,i){var p=list[i+1];
      var thumbs=["front","side","back"].map(function(k){var path=c["photo_"+k];return path?'<div class="ciThumb" data-path="'+E(path)+'" onclick="rtxZoom(this)"></div>':'<div class="ciThumb"></div>';}).join("");
      return '<div class="ciHist"><div><div class="ciDate">'+fmtDate(c.logged_at)+'</div><div class="ciStats">'+
        val(num(c.bodyweight),"kg")+delta(num(c.bodyweight),p&&num(p.bodyweight),"kg")+'<br>Waist '+val(num(c.waist),"cm")+delta(num(c.waist),p&&num(p.waist),"cm")+' · Hips '+val(num(c.hips),"cm")+delta(num(c.hips),p&&num(p.hips),"cm")+' · Chest '+val(num(c.chest),"cm")+delta(num(c.chest),p&&num(p.chest),"cm")+'</div>'+
        (c.notes?'<div class="ciNotes">'+E(c.notes)+'</div>':'')+'</div><div class="ciThumbs">'+thumbs+'</div></div>';}).join("");
    var form=ro?'<div class="ro" style="margin-bottom:10px">Coach View — Read Only</div>':
      '<div class="card"><div class="ciIntro"><b>Weekly Check-In.</b> Best done every Monday morning, before breakfast. Keeping the time of day consistent is what makes the numbers mean something.</div>'+
      '<div class="ciGrid"><div><label>Bodyweight (kg)</label><input class="inp" id="ciW" inputmode="decimal" placeholder="e.g. 80.1"></div><div><label>Waist (cm)</label><input class="inp" id="ciWa" inputmode="decimal" placeholder="e.g. 90"></div><div><label>Hips (cm)</label><input class="inp" id="ciH" inputmode="decimal" placeholder="e.g. 103"></div><div><label>Chest (cm)</label><input class="inp" id="ciC" inputmode="decimal" placeholder="e.g. 99"></div></div>'+
      '<div class="cmtLbl">Progress photos</div><div class="ciPhotos">'+["front","side","back"].map(function(k){return '<label class="ciBox" id="ciBox_'+k+'" for="ciF_'+k+'"><span>+ '+k+'</span></label><input type="file" accept="image/*" id="ciF_'+k+'" style="display:none" onchange="rtxPhoto(\''+k+'\',this)">';}).join("")+'</div>'+
      '<div class="cmtLbl">Notes</div><textarea class="inp" id="ciN" placeholder="Optional — how the week went, anything worth remembering"></textarea>'+
      '<button class="btn" id="ciSubmit" onclick="rtxSaveCheckin()">Save Check-In</button><div class="toast" id="ciToast">✓ Check-in saved</div></div>';
    return form+'<div class="secT">History</div>'+(hist||'<div class="notlogged">No check-ins yet'+(ro?".":" — your first one starts the story.")+'</div>');
  }
  async function signed(path){
    if(RTX.signed[path])return RTX.signed[path];
    try{var r=await sb.storage.from("rtc-photos").createSignedUrl(path,3600);var u=(r.data&&r.data.signedUrl)||"";RTX.signed[path]=u;return u;}catch(e){return "";}
  }
  async function afterCheckins(){
    ["front","side","back"].forEach(function(k){var b=$("ciBox_"+k);if(b&&ciPending[k]){b.style.backgroundImage="url("+ciPending[k].preview+")";b.classList.add("has");}});
    var thumbs=document.querySelectorAll("#rtxPane .ciThumb[data-path]");
    for(var i=0;i<thumbs.length;i++){var u=await signed(thumbs[i].dataset.path);if(u)thumbs[i].style.backgroundImage="url("+u+")";}
  }
  window.rtxPhoto=function(k,input){
    var f=input.files&&input.files[0];if(!f)return;
    var rd=new FileReader();rd.onload=function(e){ciPending[k]={file:f,preview:e.target.result};var b=$("ciBox_"+k);if(b){b.style.backgroundImage="url("+e.target.result+")";b.classList.add("has");}};rd.readAsDataURL(f);
  };
  window.rtxZoom=async function(el){
    var u=await signed(el.dataset.path);if(!u)return;
    var d=document.createElement("div");d.className="rtxZoom";d.innerHTML='<img src="'+u+'" alt="">';d.onclick=function(){d.remove();};document.body.appendChild(d);
  };
  window.rtxSaveCheckin=async function(){
    if(isCoachView()||!me())return;
    var w=num($("ciW").value.trim());
    if(w==null||isNaN(w)){T("Bodyweight first — that's the one number every check-in needs.");$("ciW").focus();return;}
    var btn=$("ciSubmit");if(btn){btn.disabled=true;btn.textContent="Saving…";}
    var row={user_id:me(),challenge:KEY,bodyweight:w,waist:num($("ciWa").value.trim()),hips:num($("ciH").value.trim()),chest:num($("ciC").value.trim()),notes:$("ciN").value.trim()};
    var stamp=Date.now();
    for(var k in ciPending){ if(!ciPending[k])continue;
      var f=ciPending[k].file,ext=(f.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
      var path=me()+"/"+stamp+"-"+k+"."+ext;
      var up=await sb.storage.from("rtc-photos").upload(path,f,{upsert:true});
      if(up.error){T("Photo ("+k+") didn't upload: "+up.error.message);if(btn){btn.disabled=false;btn.textContent="Save Check-In";}return;}
      row["photo_"+k]=path;
    }
    var r=await sb.from("rtc_checkins").insert(row).select().single();
    if(r.error){T(r.error.message);if(btn){btn.disabled=false;btn.textContent="Save Check-In";}return;}
    RTX.checkins.push(r.data);ciPending={front:null,side:null,back:null};
    renderPane();
    var t=$("ciToast");if(t){t.classList.add("show");setTimeout(function(){t.classList.remove("show");},1800);}
    T("Check-in saved ✓");
  };

  /* ---------- Tab 3 — Leaderboard (filtered read of points_events) ---------- */
  function weekdayOf(iso){return new Date(iso+"T12:00:00").getDay();}
  function classAt(date,time){var d=weekdayOf(date);if(typeof TIMETABLE_NEW==="undefined")return null;return TIMETABLE_NEW.find(function(c){return c.d===d&&c.t===time;})||null;}
  function weightedPoints(e){
    /* Challenge weighting applied at read time — the ledger itself is untouched (see notes in the handover reply). */
    if(e.kind==="class"&&/^class:\d{4}-\d{2}-\d{2}:\d{2}:\d{2}$/.test(e.ref)){
      var p=e.ref.split(":"),date=p[1],time=p[2]+":"+p[3],c=classAt(date,time);
      var snc=!!(c&&c.cat==="snc"),d=weekdayOf(date);
      if(snc&&GAMES.indexOf(date)>=0)return 10;           /* Legacy Games I / II attendance */
      if(snc&&(d===2||d===4||d===6))return 2;              /* Tue/Thu/Sat S&C sessions */
      return 1;
    }
    return e.points||0;
  }
  function standings(){
    var regs=RTX.regs||[],events=(typeof ptsData!=="undefined"&&ptsData.events)||[];
    var regAt={};regs.forEach(function(r){regAt[r.user_id]=r.created_at;});
    var tot={};regs.forEach(function(r){tot[r.user_id]=0;});
    events.forEach(function(e){if(!(e.user_id in tot))return;if(Date.parse(e.created_at)<START_TS)return;tot[e.user_id]+=weightedPoints(e);});
    return Object.keys(tot).map(function(u){return {uid:u,pts:tot[u],name:firstLast(RTX.names[u]||""),reg:regAt[u]||""};})
      .sort(function(a,b){return b.pts-a.pts||String(a.reg).localeCompare(String(b.reg));});
  }
  function leaderboardHtml(){
    var rows=standings(),mine=me(),myIdx=-1;
    var html=rows.map(function(r,i){if(r.uid===mine)myIdx=i;return '<div class="lbRow '+(r.uid===mine?"you":"")+'" '+(r.uid===mine?'id="rtxMyRow"':'')+'><div class="lbRank">'+(i+1)+'</div><div class="lbName">'+E(r.name)+(r.uid===mine?'<span class="yb">YOU</span>':'')+'</div><div class="lbPts">'+r.pts+'<small>pts</small></div></div>';}).join("");
    var sticky=myIdx>=0?'<div class="lbRow you lbSticky" id="rtxMySticky" style="display:none"><div class="lbRank">'+(myIdx+1)+'</div><div class="lbName">'+E(rows[myIdx].name)+'<span class="yb">YOU</span></div><div class="lbPts">'+rows[myIdx].pts+'<small>pts</small></div></div>':"";
    return '<div class="card"><div class="lbScope"><b>Challenge Leaderboard.</b> Road to Xmas Challenge registrants only — points from '+fmtDate(START+"T12:00:00")+'.<ul>'+
      '<li>2 pts on Tuesday/Thursday/Saturday S&amp;C sessions</li><li>1 pt every other class</li><li>Plus bonus points for members app challenges</li><li>10 points for the Legacy Games (Sat 7 Nov &amp; Sat 12 Dec)</li></ul></div></div>'+
      (rows.length?html:'<div class="notlogged">Nobody on the board yet — first class logged gets it started.</div>')+sticky+
      '<div class="lbFoot">Updates live as classes get logged. Ranked by total points; ties go to whoever registered first.</div>';
  }
  function afterLeaderboard(){
    var row=$("rtxMyRow"),st=$("rtxMySticky");if(!row||!st)return;
    function chk(){var r=row.getBoundingClientRect();var out=r.bottom<0||r.top>window.innerHeight-90;st.style.display=out?"grid":"none";}
    chk();window.addEventListener("scroll",chk,{passive:true});
  }

  /* ---------- Tab 4 — Overview (static) ---------- */
  function overviewHtml(){
    var ph=OVERVIEW_PHASES.map(function(p){return '<div class="ovPhase" style="border-color:'+p.col+'"><div class="h"><span>'+E(p.label)+'</span><span>'+E(p.range)+'</span></div><p>'+E(p.text)+'</p></div>';}).join("");
    var lifts=OVERVIEW_LIFTS.map(function(l){return '<div class="ovLift"><div class="d">'+l.day+'</div><div>'+l.segments.map(function(s){return '<div class="ovSeg"><span>'+E(s.range)+'</span><span>'+E(s.lift)+'</span></div>';}).join("")+'</div></div>';}).join("");
    return '<div class="card"><div class="ovDates">Oct 12 – Dec 19, 2026</div><div class="ovWeeks">10 weeks · Legacy Games I (Wk 4) · Legacy Games II (Wk 9)</div></div>'+
      '<div class="secT">Phase timeline</div>'+ph+'<div class="secT">Main lift by day</div><div class="card">'+lifts+'</div>'+
      '<div class="card"><div class="ovPts"><b>Points.</b> 2 pts on Tue/Thu/Sat S&amp;C sessions · 1 pt every other class · bonus points for members app challenges · 10 pts for the Legacy Games.</div></div>';
  }

  /* ---------- home card (same entry pattern as Fight Club) ---------- */
  function cardHtml(){
    var reg=!!RTX.reg,wk=curWeek(),live=Date.now()>=START_TS;
    return '<button class="rtxCard" id="rtxCard" onclick="rtxEnter()"><span class="p '+(reg?"in":"")+'">'+(reg?"You're in":"Register")+'</span>'+
      '<div class="k">10 Week Challenge · '+(live?'Week '+wk+' of 10':'Starts Mon 12 Oct')+'</div><div class="t">Road to Xmas</div>'+
      '<div class="s">Training Log · Check-Ins · Leaderboard · Overview — log your lifts, track your check-ins and see where you sit.</div></button>';
  }
  function injectCard(){
    var main=document.getElementById("main");if(!main||view!=="home")return;
    if(document.getElementById("rtxCard"))return;
    var wrap=document.createElement("div");wrap.innerHTML=cardHtml();var card=wrap.firstChild;
    var fc=document.getElementById("fcxCard");
    if(fc){fc.insertAdjacentElement("afterend",card);return;}
    var slot=document.querySelector("#lgh2 .lghFc");
    if(slot){slot.appendChild(card);return;}
    var first=main.querySelector(".homeCard")||document.getElementById("lgh2");
    if(first)first.insertAdjacentElement("beforebegin",card);else main.appendChild(card);
  }
  window.rtxEnter=function(){
    if(!session){T("Sign in first");return;}
    if(!RTX.reg&&!canCoach()){if(typeof window.rtcOpen==="function")window.rtcOpen();else go("rtc");return;}
    RTX.tab="log";RTX.day=curDay();RTX.week=curWeek();go("rtx");
  };

  /* ---------- hooks ---------- */
  try{NAV_TAB.rtx="home";}catch(e){}
  var _render=window.render;
  window.render=function(){if(view==="rtx")return renderRTX();return _render.apply(this,arguments);};
  var _go=window.go;
  window.go=function(v){
    /* registered members who tap "My challenge" land in the hub; the info page stays reachable via rtxInfo() */
    if(v==="rtc"&&RTX.reg&&!RTX.bypass&&view==="home"){RTX.tab="log";RTX.day=curDay();RTX.week=curWeek();v="rtx";}
    RTX.bypass=false;
    return _go.apply(this,[v].concat([].slice.call(arguments,1)));
  };
  ["renderHome"].forEach(function(fn){
    if(typeof window[fn]!=="function")return;
    var o=window[fn];
    window[fn]=function(){var r=o.apply(this,arguments);
      var after=function(){if(!RTX.reg&&session&&!RTX._regTried){RTX._regTried=true;loadReg().then(function(){var c=document.getElementById("rtxCard");if(c&&view==="home"){c.remove();injectCard();}});}injectCard();};
      if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,30);return r;};
  });
  setTimeout(function(){if(view==="home")injectCard();},900);
  setInterval(function(){try{if(view==="home"&&session&&!document.getElementById("rtxCard"))injectCard();}catch(e){}},1000);
})();
