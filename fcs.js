/*__FCSIMPLE__ =========================================================
   Fight Club · the fighter's view, rebuilt simple · 11 Oct 2026
   One job at a time. Every feature on its own tab, nothing shared:
   TODAY · WEEK · WEIGH · RUN · SPAR · TAPE · BOARD · PROGRESS · FIGHT · EXTRAS
   Same data as before (fc_attendance, fc_weighins, fc_runs, fc_spar_rounds,
   fc_spar_pairs, fc_videos, fc_checklist, fc_sessions, fc_board, fc_who_in).
   Who sees it: fighters (non-staff with an fc_fighters row), Jake (staff
   with his own fighter row, with a COACH button back to the coach tools),
   and any coach using Preview. Ali / Sarsha coach views are untouched.
   Additive: paints its own .fcs root so fccamp.js / fctrack never fire.
   Remove the script tag to get the old fighter screens back.
   ==================================================================== */
(function(){
"use strict";
var CAMP="fc2026";
var STAFF_IDS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce","2d223b5e-0dd2-47ee-8e3f-54e1b1c3e139","73a32baf-bdb8-45da-a6d6-77a055d91dda"];
var SPAR_SAT_WEEKS=[2,4,6,8,10];
var SPRINTS=[
 ["6 × 100 m at 80%","Walk back recovery. Learn the surface, run tall."],
 ["8 × 100 m at 85%","Walk back. Relaxed shoulders, drive the arms."],
 ["6 × 150 m at 85%","90 sec rest. Hold form through the last 50."],
 ["4 × 200 m + 4 × 100 m","Games week. 2 min rest on the 200s, walk back on the 100s."],
 ["8 × 150 m at 90%","90 sec rest. Fight pace efforts, breathe between."],
 ["10 × 100 m at 90%","60 sec rest. Short rest now, this is the round-by-round engine."],
 ["6 × 200 m at 90%","2 min rest. Long efforts, stay on the toes."],
 ["8 × 200 m at 90%","90 sec rest. Hardest sprint week of camp."],
 ["3 × ladder 200 / 150 / 100","Games week. Walk back between reps, 3 min between ladders."],
 ["4 × 100 m sharp","Fight week. 3 min walk between. Feel fast, finish fresh."]];
var MILES=[[10,"Recovery day"],[20,"Recovery weekend"],[30,"Legacy apparel"],[50,"Recovery week"],[80,"Fight singlet"]];
/* day slots in fc_attendance: 0 Mon · 1 Tue · 2 Wed primary, 11 Tue S&C, 3 Thu S&C, 4 Fri sprints, 5 Sat class, 15 Sat sparring */
var SESS={
 0:[{key:0,t:"6:45 PM",n:"Tech & drill sparring",s:"All levels, split for rounds",tier:"p"}],
 1:[{key:11,t:"6:00 PM",n:"Strength & Con",s:"Grunt. Lift first, box after",tier:"r"},{key:1,t:"6:45 PM",n:"Skills & drills",s:"No sparring, so the double works",tier:"p"}],
 2:[{key:2,t:"6:45 PM",n:"Open sparring + bag work",s:"Every ring live. Headgear, 16 oz",tier:"p",rounds:true}],
 3:[{key:3,t:"6:00 PM",n:"Strength & Con",s:"Grunt. The second lift is where the advantage is",tier:"r"}],
 4:[{key:4,t:"Any time",n:"Sprints",s:"",tier:"b",sprint:true}],
 5:[{key:5,t:"8 or 9 AM",n:"Any class",s:"Bonus session",tier:"b"}],
 6:[]};
var DAYN=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
var CHECK=[["medical","Medical clearance form","Handed in by Fri 27 Nov"],["mouthguard","Mouthguard fitted","Front desk has the kit"],["weighin","Weigh-in Fri 18 Dec 5 pm","At the gym"],["tickets","Tickets for your people","On sale Mon 23 Nov"],["walkout","Walkout song picked","Below"]];
var S={tab:"today",wk:null,day:null,open:null,board:"pts",who:{},whoLoading:{},boardRows:null,boardAt:0,boardLoading:false,coach:false,pf:null,vurl:{},tgt:false};
try{var t0=localStorage.getItem("fcsTab");if(t0)S.tab=t0;}catch(e){}

/* ---------- basics ---------- */
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function staff(){try{return STAFF_IDS.indexOf(uid())>=0||!!(window.profile&&(profile.is_staff||profile.is_coach||profile.is_manager));}catch(e){return false;}}
function preview(){try{return staff()&&localStorage.getItem("fcwPreview")==="1";}catch(e){return false;}}
function fc(){return window.FC||null;}
function camp(){var f=fc();return (f&&f.camp)||{};}
function pd(s){var p=String(s).slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function campStart(){return pd(camp().start_date||"2026-10-12");}
function fightDate(){return pd(camp().fight_date||"2026-12-19");}
function sparOpenWeek(){return Number(camp().spar_open_week||6);}
function weekOf(d){var n=Math.floor((d-campStart())/864e5);return n<0?0:Math.min(10,Math.floor(n/7)+1);}
function CW(){return weekOf(new Date());}
function TW(){return Math.max(1,Math.min(10,CW()));}
function dayDate(w,i){var x=new Date(campStart());x.setDate(x.getDate()+(w-1)*7+i);return x;}
function todayIdx(w){var t=new Date();t.setHours(0,0,0,0);var n=Math.round((t-dayDate(w,0))/864e5);return n<0?-1:n>6?7:n;}
function TD(){if(CW()<1)return -1;return Math.max(0,Math.min(6,todayIdx(TW())));}
function fd(d){return d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];}
function fdow(d){return DAYS[(d.getDay()+6)%7]+" "+fd(d);}
function mmss(sec){return Math.floor(sec/60)+":"+String(Math.round(sec%60)).padStart(2,"0");}
function parseTime(s){s=String(s||"").trim();var m;if((m=/^(\d{1,2}):(\d{2})$/.exec(s)))return +m[1]*60+ +m[2];if((m=/^(\d{1,2})[.,](\d{1,2})$/.exec(s)))return +m[1]*60+Math.round(+("0."+m[2])*60);if(/^\d{1,2}$/.test(s))return +s*60;return null;}
function phase(w){return w<=0?"Pre-camp":w<=3?"Build":w===4?"Legacy Games":w<=8?"Build 2":w===9?"Legacy Games":"Fight week";}
function dayOf(i){return i>=10?i-10:i;}
function isPast(w,i){var tw=TW(),td=TD();return w<tw||(w===tw&&i<td);}
function isToday(w,i){return w===TW()&&i===TD();}
function daysToFight(){return Math.max(0,Math.ceil((fightDate()-new Date())/864e5));}
function active(){var f=fc();return ((f&&f.F)||[]).filter(function(x){return x.status==="active";});}
function byId(id){return ((fc()&&fc().F)||[]).find(function(f){return f.id===id;})||null;}
function full(f){return ((f.first_name||"")+" "+(f.last_name||"")).trim();}
function initials(f,l){return ((f||"")[0]||"")+((l||"")[0]||"");}
function myRow(){var u=uid();return active().find(function(x){return x.user_id===u;})||null;}
function pickPf(){var L=active();if(!L.length)return null;var c={};((fc()&&fc().att)||[]).forEach(function(a){c[a.fighter_id]=(c[a.fighter_id]||0)+1;});return L.slice().sort(function(a,b){return (c[b.id]||0)-(c[a.id]||0);})[0];}
function fighter(){if(preview()){if(!S.pf)S.pf=pickPf();return S.pf;}if(staff())return myRow();var f=fc();return f&&f.me?f.me:null;}
function mine(){try{if(view!=="fc")return false;var F=fc();if(!F||!F.loaded)return false;if(!staff())return !!F.me;if(preview())return true;if(S.coach)return false;return !!myRow();}catch(e){return false;}}

/* ---------- data views (same maths as the old camp tab) ---------- */
function attRow(w,d){var f=fighter();if(!f)return null;return ((fc().att)||[]).find(function(r){return r.fighter_id===f.id&&r.week===w&&r.day===d;})||null;}
function attVal(w,d){var r=attRow(w,d);if(!r)return null;return r.attended===false?-1:(r.attended?1:null);}
function primDone(w){return [0,1,2].filter(function(i){return attVal(w,i)===1;}).length;}
function sncDone(w){return [11,3].filter(function(i){return attVal(w,i)===1;}).length;}
function extraDone(w){return [4,5,15].filter(function(i){return attVal(w,i)===1;}).length;}
function bonus(w){return sncDone(w)+extraDone(w);}
function sprintsDone(){var n=0;for(var w=1;w<=10;w++)if(attVal(w,4)===1)n++;return n;}
function wt(w,day){var f=fighter();if(!f)return null;var r=((fc().wi)||[]).find(function(x){return x.fighter_id===f.id&&x.week===w&&(x.day||0)===day&&x.weight_kg!=null;});return r?Number(r.weight_kg):null;}
function wiAll(){var f=fighter();if(!f)return [];return ((fc().wi)||[]).filter(function(x){return x.fighter_id===f.id&&x.weight_kg!=null;}).map(function(x){return {w:x.week,d:x.day||0,v:Number(x.weight_kg)};}).sort(function(a,b){return (a.w*7+a.d)-(b.w*7+b.d);});}
function lastWt(){var r=wiAll();return r.length?r[r.length-1].v:null;}
function firstWt(){var r=wiAll();return r.length?r[0].v:null;}
function run3k(dateIso){var f=fighter();if(!f)return null;var rs=((fc().runs)||[]).filter(function(r){return r.fighter_id===f.id&&r.run_date===dateIso&&Math.abs(Number(r.km)-3)<0.01&&r.time_text;});return rs.length?rs[rs.length-1]:null;}
function runsAll(){var f=fighter();if(!f)return [];return ((fc().runs)||[]).filter(function(r){return r.fighter_id===f.id&&Math.abs(Number(r.km)-3)<0.01&&r.time_text&&parseTime(r.time_text);}).map(function(r){return {d:r.run_date,s:parseTime(r.time_text)};}).sort(function(a,b){return a.d<b.d?-1:1;});}
function bestRun(){var a=runsAll();return a.length?Math.min.apply(null,a.map(function(r){return r.s;})):null;}
function firstRun(){var a=runsAll();return a.length?a[0].s:null;}
function runsUpTo(w){return runsAll().filter(function(r){return weekOf(pd(r.d))<=w;}).length;}
function myRounds(){var f=fighter();if(!f)return [];return ((fc().rounds)||[]).filter(function(r){return r.fighter_id===f.id;});}
function roundsTotal(uptoW){return myRounds().filter(function(r){return !uptoW||weekOf(pd(r.night_date))<=uptoW;}).length;}
function roundsOn(dateIso){return myRounds().filter(function(r){return r.night_date===dateIso;}).length;}
function myPts(w){var p=0,b=0;for(var x=1;x<=w;x++){p+=primDone(x);b+=bonus(x);}var r=runsUpTo(w);return {p:p,b:b,r:r,total:p+b+r};}
function primaryOrder(){var o=[];for(var w=1;w<=10;w++)[0,1,2].forEach(function(i){o.push({w:w,i:i});});return o;}
function streak(){var o=primaryOrder().filter(function(x){return isPast(x.w,x.i)||(isToday(x.w,x.i)&&attVal(x.w,x.i)!=null);});var n=0;for(var j=o.length-1;j>=0;j--){if(attVal(o[j].w,o[j].i)===1)n++;else break;}return n;}
function bestStreak(){var b=0,n=0;primaryOrder().forEach(function(x){if(attVal(x.w,x.i)===1){n++;if(n>b)b=n;}else if(isPast(x.w,x.i))n=0;});return b;}
function weekScore(w){var runs=[0,2].filter(function(i){return !!run3k(iso(dayDate(w,i)));}).length,wi=[0,3].filter(function(i){return wt(w,i)!=null;}).length;return Math.min(100,primDone(w)*20+bonus(w)*7+runs*8+wi*2);}
function projectWt(){var r=wiAll().map(function(p){return {x:(p.w-1)*7+p.d,v:p.v};});if(r.length<2)return null;var n=r.length,sx=0,sy=0,sxx=0,sxy=0;r.forEach(function(p){sx+=p.x;sy+=p.v;sxx+=p.x*p.x;sxy+=p.x*p.v;});var den=n*sxx-sx*sx;if(!den)return null;var m=(n*sxy-sx*sy)/den,c=(sy-m*sx)/n;var fx=Math.round((fightDate()-campStart())/864e5);return {m:m,fight:m*fx+c};}
function target(){var f=fighter();return f&&f.fight_weight_kg?Number(f.fight_weight_kg):null;}
function badges(){var b=[],rounds=roundsTotal(),bs=bestStreak(),fullw=0,dbl=0,road=0,wi=0,wiMax=0;
  for(var w=1;w<=10;w++){if(primDone(w)===3)fullw++;if(primDone(w)===3&&sncDone(w)===2)dbl++;if(run3k(iso(dayDate(w,0)))&&run3k(iso(dayDate(w,2))))road++;[0,3].forEach(function(i){if(wt(w,i)!=null){wi++;if(wi>wiMax)wiMax=wi;}else wi=0;});}
  b.push({n:"Full week",d:"All three primary nights in one week",on:fullw>=1});
  b.push({n:"Double up",d:"Three primary nights plus both Strength & Con",on:dbl>=1});
  b.push({n:"Roadwork",d:"Both 3 km runs in one week",on:road>=1});
  b.push({n:"Six straight",d:"Six primary nights in a row",on:bs>=6});
  b.push({n:"Twelve straight",d:"Twelve primary nights in a row",on:bs>=12});
  b.push({n:"20 rounds",d:"Twenty sparring rounds banked",on:rounds>=20});
  b.push({n:"50 rounds",d:"Fifty sparring rounds banked",on:rounds>=50});
  b.push({n:"On the scales",d:"Four weigh-ins in a row",on:wiMax>=4});
  b.push({n:"Four full weeks",d:"Four full primary weeks",on:fullw>=4});
  return b;}
function latestNote(){var n=(fc()&&fc().notes)||[];if(!n.length)return null;return n.slice().sort(function(a,b){return a.created_at<b.created_at?1:-1;})[0];}
function pairsOf(){var f=fighter();if(!f)return [];return ((fc().pairs)||[]).filter(function(p){return p.a_id===f.id||p.b_id===f.id;}).sort(function(a,b){return a.night_date<b.night_date?-1:1;});}
function vidsOf(){var f=fighter();if(!f)return [];return ((fc().vids)||[]).filter(function(v){return v.fighter_id===f.id;});}
function vnotesOf(v){return ((fc().vnotes)||[]).filter(function(n){return n.video_id===v.id;});}
function chkOf(key){var f=fighter();if(!f)return false;var x=((fc().chk)||[]).find(function(c){return c.fighter_id===f.id&&c.item_key===key;});return !!(x&&x.done);}
function sessOf(){var f=fighter();if(!f)return [];return ((fc().sess)||[]).filter(function(s){return s.fighter_id===f.id;});}
function newTape(){return vidsOf().some(function(v){return !v.seen_at;});}
function sparNights(w){var n=[{i:2,key:2,label:"Wednesday"}];if(SPAR_SAT_WEEKS.indexOf(w)>=0)n.push({i:5,key:15,label:"Saturday"});return n;}

/* ---------- css ---------- */
var css=document.createElement("style");css.id="fcsCss";css.textContent=`
.fcs{--g:#c9a44c;--gd:#8a7136;--p:#121214;--p2:#18181b;--ln:#26262b;--tx:#f2f0eb;--mu:#9a9891;--ok:#4bc97a;--bad:#e05252;--blue:#4a8de6;color:var(--tx);padding-bottom:30px}
.fcs *{box-sizing:border-box}
.fcs .top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.fcs .back{background:transparent;border:0;color:var(--g);font-weight:800;font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:0;cursor:pointer}
.fcs .tools{display:flex;gap:6px}
.fcs .tools button{background:var(--p);border:1px solid var(--ln);color:var(--mu);border-radius:999px;padding:6px 11px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}
.fcs .tools button.coach{border-color:var(--gd);color:var(--g)}
.fcs .ttl{font-family:Oswald,sans-serif;font-size:28px;font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:1px}
.fcs .ttl span{color:var(--g)}
.fcs .sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--mu);font-weight:800;margin-top:4px}
.fcs .wkbar{display:flex;gap:3px;margin:10px 0 12px}.fcs .wkbar i{flex:1;height:4px;border-radius:2px;background:#1c1c20}.fcs .wkbar i.done{background:var(--gd)}.fcs .wkbar i.now{background:var(--g)}
.fcs .pv{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 10px;padding:9px 11px;border:1px dashed var(--gd);border-radius:10px;background:var(--p);font-size:11px;line-height:1.4}
.fcs .pv span{flex:1;min-width:150px}.fcs .pv b{color:var(--g)}
.fcs .pv button{background:var(--g);color:#161307;border:0;border-radius:999px;padding:7px 11px;font-size:9px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;cursor:pointer}
.fcs .tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 12px;padding-bottom:2px}
.fcs .tabs::-webkit-scrollbar{display:none}
.fcs .tabs button{flex:none;position:relative;padding:10px 14px;border-radius:999px;background:var(--p);border:1px solid var(--ln);color:var(--mu);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;white-space:nowrap}
.fcs .tabs button.on{background:var(--g);border-color:var(--g);color:#161307;font-weight:700}
.fcs .tabs button.dn{border-color:#2a6b45}.fcs .tabs button.dn::after{content:" ✓";color:var(--ok)}
.fcs .tabs button.on.dn::after{color:#0b2a17}
.fcs .tabs button .nd{position:absolute;top:6px;right:7px;width:7px;height:7px;border-radius:50%;background:var(--blue)}
.fcs .dayk{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--mu);font-weight:800;margin:2px 0 10px;display:flex;justify-content:space-between;align-items:center}
.fcs .dayk b{color:var(--tx)}
.fcs .job{background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:14px;margin-bottom:10px}
.fcs .job.next{border-color:var(--g);box-shadow:0 0 0 1px rgba(201,164,76,.25),0 10px 28px rgba(0,0,0,.4)}
.fcs .job.done,.fcs .job.miss{padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;opacity:.8}
.fcs .job.done .jt,.fcs .job.miss .jt{font-size:14px}
.fcs .job.miss{border-color:#5a2a2a}
.fcs .job.soon{opacity:.6}
.fcs .jk{font-size:9.5px;letter-spacing:2px;text-transform:uppercase;color:var(--g);font-weight:800;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.fcs .jk small{color:var(--mu);letter-spacing:1px;font-weight:700;text-align:right;white-space:nowrap}
.fcs .jt{font-family:Oswald,sans-serif;font-size:20px;text-transform:uppercase;letter-spacing:.5px;line-height:1.1}
.fcs .jd{font-size:12.5px;color:var(--mu);line-height:1.45;margin-top:5px}.fcs .jd b{color:var(--tx)}
.fcs .tick{width:32px;height:32px;border-radius:9px;border:1.5px solid var(--ln);background:#0e0e10;display:grid;place-items:center;color:#06110a;font-weight:900;font-size:15px;flex:none;cursor:pointer}
.fcs .tick.on{background:var(--ok);border-color:var(--ok)}.fcs .tick.x{background:var(--bad);border-color:var(--bad);color:#fff}
.fcs .big{display:block;width:100%;margin-top:10px;padding:16px;border-radius:12px;border:0;background:var(--g);color:#161307;font-family:Oswald,sans-serif;font-size:17px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer}
.fcs .big.ghost{background:none;border:1px solid var(--ln);color:var(--mu);padding:11px;font-size:13px;margin-top:6px}
.fcs .big.ok{background:var(--ok);color:#06110a}
.fcs .inrow{display:flex;gap:6px;margin-top:10px}
.fcs .inrow input{flex:1;min-width:0;background:#0e0e10;border:1.5px solid var(--gd);border-radius:12px;color:var(--tx);padding:13px 14px;font-size:22px;font-family:Oswald,sans-serif;font-weight:700;letter-spacing:1px}
.fcs .inrow input:focus{outline:none;border-color:var(--g)}
.fcs .inrow input::placeholder{color:#4a473f;font-weight:400}
.fcs .inrow .go{flex:none;min-width:86px;border-radius:12px;background:var(--g);border:0;color:#161307;font-family:Oswald,sans-serif;font-size:14px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;cursor:pointer;padding:0 14px}
.fcs .inrow .go.x{background:var(--p2);border:1px solid var(--ln);color:var(--mu);min-width:48px}
.fcs .who{margin-top:10px;padding-top:9px;border-top:1px solid var(--ln);font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);font-weight:800}
.fcs .who .avs{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
.fcs .who i{font-style:normal;font-size:9px;font-weight:800;color:var(--tx);width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1px solid var(--ln);background:var(--p2);letter-spacing:0}
.fcs .who i.me{background:var(--g);color:#161307;border-color:var(--g)}
.fcs .strip{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0 10px}
.fcs .strip div{background:var(--p);border:1px solid var(--ln);border-radius:12px;padding:10px 4px;text-align:center}
.fcs .strip b{display:block;font-family:Oswald,sans-serif;font-size:20px;line-height:1.1}
.fcs .strip span{font-size:7.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mu);font-weight:800;display:block;margin-top:4px}
.fcs .strip div.hi{border-color:var(--gd)}.fcs .strip div.hi b{color:var(--g)}
.fcs .note{border:1px dashed var(--gd);border-radius:12px;padding:12px 14px;margin-bottom:10px;background:var(--p)}
.fcs .note .jk{margin-bottom:6px}.fcs .note p{margin:0;font-size:13px;line-height:1.5;white-space:pre-line}
.fcs .wk{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin:0 0 12px}
.fcs .wk button{text-align:center;background:var(--p2);border:1px solid var(--ln);border-radius:10px;padding:8px 2px;cursor:pointer;color:var(--tx);font-family:inherit}
.fcs .wk button.on{border-color:var(--g);background:#1d1a10}.fcs .wk button.today b{color:var(--g)}
.fcs .wk b{display:block;font-family:Oswald,sans-serif;font-size:16px}
.fcs .wk span{font-size:8px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800}
.fcs .wk i{display:block;height:4px;border-radius:2px;background:#0e0e10;margin-top:5px}
.fcs .wk i.s1{background:var(--bad)}.fcs .wk i.s2{background:var(--g)}.fcs .wk i.s3{background:var(--ok)}
.fcs .wknav{display:flex;align-items:center;justify-content:space-between;margin:0 0 10px}
.fcs .wknav button{background:var(--p);border:1px solid var(--ln);color:var(--mu);border-radius:999px;padding:7px 12px;font-size:11px;font-weight:800;cursor:pointer}
.fcs .wknav button:disabled{opacity:.3}
.fcs .wknav b{font-family:Oswald,sans-serif;font-size:16px;letter-spacing:1.5px;text-transform:uppercase}
.fcs .fsh{background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:16px 14px;margin-bottom:10px;text-align:center}
.fcs .fsh .jk{justify-content:center}
.fcs .fsh .n{font-family:Oswald,sans-serif;font-size:54px;line-height:1;letter-spacing:1px;font-variant-numeric:tabular-nums}
.fcs .fsh .n small{font-size:16px;color:var(--mu);letter-spacing:1px;margin-left:4px}
.fcs .fsh .jd{margin-top:6px}
.fcs .fsh .tgt{display:inline-block;margin-top:10px;border:1px solid var(--gd);color:var(--g);border-radius:999px;padding:7px 12px;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;background:none;cursor:pointer}
.fcs .card{background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:14px;margin-bottom:10px}
.fcs .card h3{font-family:Oswald,sans-serif;font-size:16px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px;font-weight:700}
.fcs .card p{font-size:12.5px;color:var(--mu);line-height:1.5;margin:6px 0 0}.fcs .card p b{color:var(--tx)}
.fcs .row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--ln)}
.fcs .row:first-of-type{border-top:0}
.fcs .row .l{flex:none;width:92px}.fcs .row .l b{display:block;font-family:Oswald,sans-serif;font-size:15px;text-transform:uppercase;letter-spacing:.5px}.fcs .row .l small{font-size:10px;color:var(--mu);font-weight:700}
.fcs .row .v{flex:1;font-family:Oswald,sans-serif;font-size:22px;letter-spacing:.5px}.fcs .row .v small{font-size:11px;color:var(--mu);margin-left:4px;font-family:Montserrat,sans-serif;font-weight:700}
.fcs .row .v.mu{color:var(--mu);font-size:13px;font-family:Montserrat,sans-serif;font-weight:600}
.fcs .row .go{padding:9px 12px;border-radius:9px;background:var(--g);border:0;color:#161307;font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;cursor:pointer;flex:none}
.fcs .row .go.gh{background:var(--p2);border:1px solid var(--ln);color:var(--mu)}
.fcs .row .inrow{margin-top:0;flex:1}
.fcs svg.ch{width:100%;height:auto;display:block;margin-top:8px}
.fcs .tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.fcs .tile{background:var(--p);border:1px solid var(--ln);border-radius:12px;padding:12px}
.fcs .tile .v{font-family:Oswald,sans-serif;font-size:28px;line-height:1;margin-top:6px}.fcs .tile .v small{font-size:12px;color:var(--mu);margin-left:3px}
.fcs .tile .s{font-size:11px;color:var(--mu);margin-top:5px;line-height:1.35}.fcs .tile .s b{color:var(--g)}
.fcs .bar{height:6px;border-radius:3px;background:#0e0e10;margin-top:8px;overflow:hidden}.fcs .bar i{display:block;height:100%;background:var(--g)}.fcs .bar i.ok{background:var(--ok)}
.fcs .badges{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.fcs .bg{border:1px solid var(--ln);border-radius:10px;padding:9px 8px;background:var(--p2);opacity:.5}
.fcs .bg.on{opacity:1;border-color:var(--g);background:#1d1a10}
.fcs .bg b{display:block;font-family:Oswald,sans-serif;font-size:11px;letter-spacing:.8px;text-transform:uppercase}.fcs .bg.on b{color:var(--g)}
.fcs .bg span{display:block;font-size:8.5px;line-height:1.35;color:var(--mu);margin-top:3px}
.fcs .fseg{display:flex;gap:6px;margin:0 0 10px}
.fcs .fseg button{flex:1;padding:10px 4px;border-radius:10px;background:var(--p);border:1px solid var(--ln);color:var(--mu);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}
.fcs .fseg button.on{background:var(--g);border-color:var(--g);color:#161307;font-weight:700}
.fcs .lb{display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid var(--ln)}
.fcs .lb:first-child{border-top:0}
.fcs .lb .rk{width:24px;font-family:Oswald,sans-serif;font-size:15px;color:var(--mu);text-align:center}.fcs .lb.top .rk{color:var(--g)}
.fcs .lb .nm{flex:1;min-width:0;font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fcs .lb .nm i{font-style:normal;font-size:8px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#161307;background:var(--g);padding:2px 6px;border-radius:999px;margin-left:6px}
.fcs .lb .pt{font-family:Oswald,sans-serif;font-size:19px}
.fcs .lb.me{background:#1d1a10;margin:0 -8px;padding:9px 8px;border-radius:8px;border-top:0}
.fcs .key{font-size:10px;color:var(--mu);margin-top:8px;text-align:center}
.fcs .chk{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--p2);border:1px solid var(--ln);border-radius:12px;padding:12px;margin-top:8px;color:var(--tx);cursor:pointer;font-family:inherit}
.fcs .chk.on{border-color:var(--ok)}
.fcs .chk .n{flex:1;font-size:14px;font-weight:700}.fcs .chk .n span{display:block;font-size:11px;color:var(--mu);font-weight:600;margin-top:2px}
.fcs .chk.on .n{color:var(--mu);text-decoration:line-through}
.fcs .vs{display:flex;align-items:center;gap:8px;margin-top:8px}
.fcs .vs .f{flex:1;text-align:center}.fcs .vs .f b{display:block;font-family:Oswald,sans-serif;font-size:16px;text-transform:uppercase;letter-spacing:.5px;margin-top:6px}.fcs .vs .f span{font-size:10.5px;color:var(--mu)}
.fcs .vs .amp{font-family:Oswald,sans-serif;font-size:22px;color:var(--g)}
.fcs .av{width:56px;height:56px;border-radius:50%;background:var(--p2);border:1px solid var(--gd);margin:0 auto;display:grid;place-items:center;font-family:Oswald,sans-serif;font-size:20px;overflow:hidden}.fcs .av img{width:100%;height:100%;object-fit:cover}
.fcs .txt{width:100%;background:#0e0e10;border:1px solid var(--ln);border-radius:10px;color:var(--tx);padding:12px;font-size:15px;font-family:inherit;margin-top:8px}
.fcs video{width:100%;border-radius:10px;background:#000;margin-top:8px;max-height:260px}
.fcs .pin{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;background:var(--p2);border:1px solid var(--ln);border-radius:10px;padding:10px;margin-top:6px;color:var(--tx);cursor:pointer;font-family:inherit}
.fcs .pin .t{font-family:Oswald,sans-serif;color:var(--g);font-size:14px;flex:none;width:44px}.fcs .pin .b{flex:1;font-size:12.5px;line-height:1.4}.fcs .pin .b small{display:block;color:var(--mu);font-size:10px;margin-top:2px}
.fcs .pair{display:flex;align-items:center;gap:8px;padding:10px 0;border-top:1px solid var(--ln)}
.fcs .pair:first-of-type{border-top:0}
.fcs .pair .p{flex:1;font-size:13px;font-weight:700}.fcs .pair .p span{display:block;font-size:10px;color:var(--mu);font-weight:600;margin-top:2px}
.fcs .pair .st{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;border:1px solid var(--ln);border-radius:999px;padding:4px 8px;color:var(--mu)}
.fcs .pair .st.ok{color:var(--ok);border-color:#2a6b45}.fcs .pair .st.no{color:var(--bad);border-color:#5a2a2a}.fcs .pair .st.wait{color:var(--g);border-color:var(--gd)}
.fcs .two{display:flex;gap:6px;margin-top:8px}.fcs .two .big{margin-top:0}
.fcs .sess{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;background:var(--p2);border:1px solid var(--ln);margin-top:8px}
.fcs .sess .st{flex:1;min-width:0}.fcs .sess b{font-family:Oswald,sans-serif;font-size:15px;text-transform:uppercase;letter-spacing:.5px;display:block}.fcs .sess small{font-size:11px;color:var(--mu);display:block;margin-top:2px}
.fcs .sess .go{padding:9px 12px;border-radius:9px;background:var(--g);border:0;color:#161307;font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;cursor:pointer;flex:none}
.fcs .sess.on .go{background:var(--ok)}
.fcs .empty{font-size:12.5px;color:var(--mu);padding:6px 0}
@media (prefers-reduced-motion:reduce){.fcs *{animation:none!important}}
`;document.head.appendChild(css);

/* ---------- chart ---------- */
function chart(series,opts){
  var W=opts.W||10,x0=44,x1=590,y0=14,y1=104,mx=opts.max,mn=opts.min||0,X=function(i){return x0+(x1-x0)*i/W;},Y=function(v){return y0+(y1-y0)*(1-(v-mn)/(mx-mn));};
  var s='<svg class="ch" viewBox="0 0 600 132">';
  (opts.ticks||[]).forEach(function(v){s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#26262b"/><text x="'+(x0-8)+'" y="'+(Y(v)+4)+'" fill="#9a9891" font-size="13" text-anchor="end" font-family="Montserrat,sans-serif">'+(opts.fmt?opts.fmt(v):v)+'</text>';});
  (opts.marks||[]).forEach(function(m){if(m.v>mx||m.v<mn)return;s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(m.v)+'" y2="'+Y(m.v)+'" stroke="'+(m.c||"#4bc97a")+'" stroke-dasharray="4 6" stroke-width="1.2" opacity=".85"/>'+(m.l?'<text x="'+x1+'" y="'+(Y(m.v)-4)+'" fill="'+(m.c||"#4bc97a")+'" font-size="12" text-anchor="end" font-family="Montserrat,sans-serif" font-weight="700">'+E(m.l)+'</text>':'');});
  var cw=TW();
  for(var w=1;w<=10;w++)s+='<text x="'+X((w-0.5)*(W/10))+'" y="126" fill="'+(w===cw?"#f2f0eb":"#4a473f")+'" font-size="12" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700">W'+w+'</text>';
  series.forEach(function(sr){if(!sr.pts.length)return;var d="M"+sr.pts.map(function(p){return X(p.x)+","+Y(Math.max(mn,Math.min(mx,p.v)));}).join(" L");
    if(sr.dash){s+='<path d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="1.5" stroke-dasharray="5 5" opacity=".6"/>';return;}
    if(sr.pts.length>1)s+='<path d="'+d+' L'+X(sr.pts[sr.pts.length-1].x)+','+y1+' L'+X(sr.pts[0].x)+','+y1+' Z" fill="'+sr.c+'" opacity=".12"/>';
    s+='<path d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    sr.pts.forEach(function(p,i){var last=i===sr.pts.length-1;s+='<circle cx="'+X(p.x)+'" cy="'+Y(Math.max(mn,Math.min(mx,p.v)))+'" r="'+(last?5:3)+'" fill="'+(last?sr.c:"#121214")+'" stroke="'+sr.c+'" stroke-width="2"/>';});});
  return s+'</svg>';
}
function chartWt(){var rows=wiAll(),tgt=target(),pts=rows.map(function(r){return {x:(r.w-1)*2+(r.d?1:0)+0.5,v:r.v};});
  var vals=pts.map(function(p){return p.v;}).concat(tgt?[tgt]:[]);var f=fighter();if(!vals.length&&f&&f.weight_kg)vals=[Number(f.weight_kg)];if(!vals.length)vals=[75];
  var lo=Math.floor(Math.min.apply(null,vals))-1,hi=Math.ceil(Math.max.apply(null,vals))+1;if(hi-lo<4)hi=lo+4;
  return chart([{pts:pts,c:"#c9a44c"}],{W:20,min:lo,max:hi,ticks:[lo,Math.round((lo+hi)/2),hi],marks:tgt?[{v:tgt,l:"TARGET "+tgt}]:[]});}
function chartRun(){var rows=runsAll(),pts=rows.map(function(r){var d=pd(r.d),w=Math.max(1,weekOf(d)),dow=(d.getDay()+6)%7;return {x:(w-1)*2+(dow>=2?1:0)+0.5,v:r.s/60};});
  var vals=pts.map(function(p){return p.v;});if(!vals.length)vals=[15];var lo=Math.floor(Math.min.apply(null,vals))-1,hi=Math.ceil(Math.max.apply(null,vals))+1;
  return chart([{pts:pts,c:"#7fd3ff"}],{W:20,min:lo,max:hi,ticks:[lo,Math.round((lo+hi)/2),hi],fmt:function(v){return v+":00";}});}
function chartRounds(){var cw=TW(),pts=[{x:0,v:0}],c=0;for(var w=1;w<=cw;w++){c=roundsTotal(w);pts.push({x:w,v:c});}
  var nx=MILES.find(function(m){return c<m[0];}),mx=c>=50?80:50;
  return chart([{pts:pts,c:"#c9a44c"}],{max:mx,ticks:[0,mx/2,mx],marks:MILES.map(function(m){return {v:m[0],l:(nx&&m[0]===nx[0])?("NEXT "+m[0]+" "+m[1].toUpperCase()):(c>=m[0]?m[0]+" ✓":""),c:c>=m[0]?"#4bc97a":(nx&&m[0]===nx[0]?"#c9a44c":"#26262b")};})});}
function chartAtt(){var cw=TW(),pp=[{x:0,v:0}],bp=[{x:0,v:0}],tp=[{x:0,v:0}],cp=0,cb=0;
  for(var w=1;w<=cw;w++){cp+=primDone(w);cb+=bonus(w);pp.push({x:w,v:cp});bp.push({x:w,v:cb});}
  for(var k=1;k<=10;k++)tp.push({x:k,v:k*3});
  return chart([{pts:tp,c:"#9a9891",dash:true},{pts:bp,c:"#4a8de6"},{pts:pp,c:"#4bc97a"}],{max:40,ticks:[0,20,40]});}
function scoreChart(){var pts=[];for(var w=1;w<=TW();w++)pts.push({x:w-0.5,v:weekScore(w)});return chart([{pts:pts,c:"#c9a44c"}],{max:100,ticks:[0,50,100],marks:[{v:70,l:"SOLID WEEK 70",c:"#4bc97a"}]});}

/* ---------- pieces ---------- */
function tierTxt(t){return t==="p"?"Primary":t==="r"?"Strength":"Bonus";}
function inId(kind,w,i){return "fcsIn_"+kind+w+"_"+i;}
function jobCard(cls,kick,right,title,desc,action){return '<div class="job '+cls+'"><div class="jk"><span>'+kick+'</span>'+(right?'<small>'+right+'</small>':'')+'</div><div class="jt">'+title+'</div>'+(desc?'<div class="jd">'+desc+'</div>':'')+action+'</div>';}
function doneCard(cls,kick,title,tick){return '<div class="job '+cls+'"><div><div class="jk"><span>'+kick+'</span></div><div class="jt">'+title+'</div></div>'+tick+'</div>';}
function whoHtml(w,d,key,mine){var k=w+":"+d+":"+key,list=S.who[k];
  if(!list)return '<div class="who">In tonight<div class="avs"><i>…</i></div></div>';
  var f=fighter(),others=list.filter(function(x){return !f||x.fighter_id!==f.id;});
  if(!others.length&&!mine)return '<div class="who">Nobody logged yet. Be first.</div>';
  return '<div class="who">'+(mine?'You and the crew in tonight':'In tonight')+'<div class="avs">'+(mine?'<i class="me">'+E(initials(f.first_name,f.last_name))+'</i>':'')+others.slice(0,18).map(function(x){return '<i title="'+E(x.first_name+' '+(x.last_name||''))+'">'+E(initials(x.first_name,x.last_name))+'</i>';}).join('')+(others.length>18?'<i>+'+(others.length-18)+'</i>':'')+'</div></div>';}
function wtInput(w,d){return '<div class="inrow"><input id="'+inId("wt",w,d)+'" type="number" step="0.1" inputmode="decimal" placeholder="'+(lastWt()||'kg')+'"><button class="go" onclick="fcsSaveWt('+w+','+d+')">Save</button></div>';}
function runInput(w,d){return '<div class="inrow"><input id="'+inId("run",w,d)+'" inputmode="numeric" placeholder="'+(bestRun()?mmss(bestRun()):'14:30')+'"><button class="go" onclick="fcsSaveRun('+w+','+d+')">Save</button></div>';}
function rdInput(w,i){return '<div class="inrow"><input id="'+inId("rd",w,i)+'" type="number" min="1" max="40" step="1" inputmode="numeric" placeholder="rounds"><button class="go" onclick="fcsSaveRounds('+w+','+i+')">Bank</button></div>';}
function tgtInput(){return '<div class="inrow"><input id="fcsTgt" type="number" step="0.1" inputmode="decimal" placeholder="'+(target()||'kg')+'"><button class="go" onclick="fcsSaveTgt()">Save</button></div>';}

/* the jobs for one day, in the order they happen */
function jobs(w,d,opt){
  opt=opt||{};var J=[],dt=dayDate(w,d),ds=iso(dt),live=isPast(w,d)||isToday(w,d),when=fdow(dt);
  function push(done,state,html){J.push({done:done,state:state,html:html});}
  if(d===0||d===3){var v=wt(w,d),ok=S.open==="wt"+w+"_"+d;
    if(v!=null&&!ok)push(true,"done",function(){return doneCard("done","Weigh-in",v+' kg',' <button class="tick on" onclick="fcsOpen(\'wt'+w+'_'+d+'\')">✓</button>');});
    else if(!live)push(false,"soon",function(c){return jobCard("soon","Weigh-in",when,"On the scales","Before you train. Same scales every time.","");});
    else push(false,"todo",function(c){return jobCard(c,"Weigh-in · before you train",when,"On the scales","Mon and Thu. Same scales, before you train, then type it in.",wtInput(w,d));});}
  if(d===0||d===2){var r=run3k(ds),s=r?parseTime(r.time_text):null,ok2=S.open==="run"+w+"_"+d;
    if(s&&!ok2)push(true,"done",function(){return doneCard("done","3 km run",mmss(s)+(bestRun()===s?' · best':''),' <button class="tick on" onclick="fcsOpen(\'run'+w+'_'+d+'\')">✓</button>');});
    else if(!live)push(false,"soon",function(){return jobCard("soon","3 km run",when,"3 km for time","Any time today. Same route every time.","");});
    else push(false,"todo",function(c){return jobCard(c,"3 km run · any time today",when,"3 km for time","Same route every time, so the clock tells the truth. Type the time as mm:ss.",runInput(w,d));});}
  var list=(SESS[d]||[]).slice();if(d===5&&SPAR_SAT_WEEKS.indexOf(w)>=0)list.push({key:15,t:"9:30 AM",n:"Sparring",s:"On this week. Headgear, 16 oz",tier:"b",rounds:true});
  list.forEach(function(x){var v=attVal(w,x.key),sp=x.sprint?SPRINTS[w-1]:null,name=x.sprint?"Sprints · week "+w:x.n,kick=x.t+" · "+tierTxt(x.tier),who=(opt.who&&x.tier==="p")?whoHtml(w,d,x.key,v===1):"";
    if(v===1)push(true,"done",function(){return '<div class="job done"><div style="flex:1"><div class="jk"><span>'+E(kick)+'</span></div><div class="jt">'+E(name)+'</div>'+who+'</div><button class="tick on" onclick="fcsAtt('+w+','+x.key+',0)">✓</button></div>';});
    else if(v===-1)push(true,"miss",function(){return doneCard("miss",E(kick),E(name)+' · missed','<button class="tick x" onclick="fcsAtt('+w+','+x.key+',0)">✗</button>');});
    else if(!live)push(false,"soon",function(){return jobCard("soon",E(kick),when,E(name),E(sp?sp[0]:x.s),"");});
    else push(false,"todo",function(c){return jobCard(c,E(kick),when,E(name),E(sp?sp[0]+". "+sp[1]+" Warm up 10 min first.":x.s),'<button class="big" onclick="fcsAtt('+w+','+x.key+',1)">'+(x.sprint?"Sprints done ✓":"I was there ✓")+'</button><button class="big ghost" onclick="fcsAtt('+w+','+x.key+',-1)">'+(x.sprint?"Skipped it":"Missed it")+'</button>'+who);});
    if(x.rounds&&live){var n=roundsOn(ds),ok3=S.open==="rd"+w+"_"+x.key;
      if(n&&!ok3)push(true,"done",function(){return doneCard("done","Sparring rounds",n+' round'+(n===1?'':'s')+' banked',' <button class="tick on" onclick="fcsOpen(\'rd'+w+'_'+x.key+'\')">✓</button>');});
      else push(false,"todo",function(c){return jobCard(c,"Sparring rounds",when,"How many rounds?","Every round counts toward the rewards. "+(w>=sparOpenWeek()?"Live rounds now.":"Technical until Jake opens it up."),rdInput(w,x.key));});}
  });
  return J;
}
function jobsHtml(w,d,opt){var J=jobs(w,d,opt),next=true,h="";J.forEach(function(j){var c=j.state==="todo"&&next?"next":"";if(j.state==="todo")next=false;h+=j.html(c);});return h;}
function dayStatus(w,d){var keys=(SESS[d]||[]).map(function(x){return x.key;});if(d===5&&SPAR_SAT_WEEKS.indexOf(w)>=0)keys.push(15);if(!keys.length)return "";var vals=keys.map(function(k){return attVal(w,k);});if(vals.some(function(v){return v===-1;}))return "s1";if(vals.every(function(v){return v===1;}))return "s3";if(vals.some(function(v){return v===1;}))return "s2";return "";}
function strip(w){var st=streak();return '<div class="strip"><div class="'+(st>=3?'hi':'')+'"><b>'+st+'</b><span>Streak</span></div><div><b>'+bestStreak()+'</b><span>Best streak</span></div><div><b>'+weekScore(w)+'</b><span>Week score</span></div><div class="hi"><b>'+myPts(w).total+'</b><span>Points</span></div></div>';}
function noteHtml(){var n=latestNote();if(!n)return '';return '<div class="note"><div class="jk"><span>From Jake</span><small>'+E(fd(pd(n.created_at)))+'</small></div><p>'+E(n.body)+'</p></div>';}

/* ---------- screens ---------- */
function todayHtml(){var w=TW(),d=TD(),h='';
  if(CW()<1)return jobCard("next","Pre-camp","Starts "+fd(campStart()),"Camp starts "+DAYN[(campStart().getDay()+6)%7],"First night is <b>Monday 6:45 pm, Tech & drill sparring</b>. Weigh in before you train and log it here. Your ten weeks start counting from there.","")+noteHtml();
  var J=jobs(w,d,{who:true}),left=J.filter(function(j){return j.state==="todo";}).length;
  h+='<div class="dayk"><span><b>'+DAYN[d]+' '+fd(dayDate(w,d))+'</b> · week '+w+'</span><span>'+(J.length?(left?left+' to do':'All done ✓'):'Rest day')+'</span></div>';
  if(!J.length)h+=jobCard("","Sunday","Week "+w,"Rest day.","Feet up. This week you banked <b>'+primDone(w)+' of 3</b> primary and <b>'+bonus(w)+'</b> bonus. Next up is <b>Monday 6:45 pm</b>.","");
  else h+=jobsHtml(w,d,{who:true});
  h+=strip(w)+noteHtml();
  var ex=sessOf().filter(function(s){return (s.items||[]).length&&s.done_rounds<(s.items||[]).length;});
  if(ex.length)h+=jobCard("","Extra rounds from Jake",ex.length+" session"+(ex.length>1?"s":""),E(ex[0].name),ex[0].note?E(ex[0].note):"Built for you. Tap start and the timer runs it.",'<button class="big ghost" onclick="fcsTab(\'extras\')">Open extras</button>');
  return h;}
function weekHtml(){var w=S.wk,tw=TW(),d=S.day;
  var h='<div class="wknav"><button onclick="fcsWeek(-1)" '+(w<=1?'disabled':'')+'>‹</button><b>Week '+w+' of 10 · '+E(phase(w))+'</b><button onclick="fcsWeek(1)" '+(w>=tw?'disabled':'')+'>›</button></div>';
  h+='<div class="wk">'+[0,1,2,3,4,5,6].map(function(i){var dt=dayDate(w,i);return '<button class="'+(i===d?'on':'')+(isToday(w,i)?' today':'')+'" onclick="fcsDay('+i+')"><span>'+DAYS[i]+'</span><b>'+dt.getDate()+'</b><i class="'+dayStatus(w,i)+'"></i></button>';}).join('')+'</div>';
  var J=jobs(w,d,{who:isToday(w,d)});
  h+='<div class="dayk"><span><b>'+DAYN[d]+' '+fd(dayDate(w,d))+'</b></span><span>'+(isToday(w,d)?'Today':isPast(w,d)?'Logged after the fact is fine':'Coming up')+'</span></div>';
  if(!J.length)h+=jobCard("","Sunday","","Rest day.","Feet up. Nothing to log.","");
  else h+=jobsHtml(w,d,{who:isToday(w,d)});
  return h;}
function weighHtml(){var w=TW(),lw=lastWt(),fw=firstWt(),tgt=target(),pj=projectWt(),days=daysToFight();
  var h='<div class="fsh"><div class="jk"><span>'+(lw?'Last weigh-in':'No weigh-in yet')+'</span></div><div class="n">'+(lw||'–')+'<small>kg</small></div><div class="jd">'+(lw&&fw&&fw!==lw?'<b>'+(fw-lw).toFixed(1)+' kg '+(fw>lw?'down':'up')+'</b> since week 1':lw?'That is your week 1 number. Beat it.':'Mon and Thu, before you train.')+(tgt&&lw?' · <b>'+(lw-tgt).toFixed(1)+' kg</b> to target':'')+'</div>'
    +(S.tgt?tgtInput():'<button class="tgt" onclick="fcsOpen(\'tgt\')">'+(tgt?'Target '+tgt+' kg · change':'Set fight weight')+'</button>')+'</div>';
  h+='<div class="card"><h3>This week · week '+w+'</h3>'+[0,3].map(function(d){return wiRow(w,d);}).join('')+'</div>';
  h+='<div class="card"><h3>Ten weeks</h3>'+chartWt()+'<p>'+(pj&&tgt?(pj.fight<=tgt+0.2?'<b>On track.</b> At this rate you weigh in around <b>'+pj.fight.toFixed(1)+' kg</b> on fight night, under your '+tgt+' kg target.':'<b>Behind the curve.</b> At this rate you land around <b>'+pj.fight.toFixed(1)+' kg</b> on fight night, '+(pj.fight-tgt).toFixed(1)+' kg over target. '+days+' days to fix it.'):pj?'Trending <b>'+(pj.m<0?(-pj.m*7).toFixed(2)+' kg a week down':(pj.m*7).toFixed(2)+' kg a week up')+'</b>. Set a fight weight to see where you land.':'Two weigh-ins and this starts projecting your fight-night weight.')+'</p></div>';
  var all=wiAll().slice().reverse().slice(0,8);
  if(all.length>2)h+='<div class="card"><h3>Recent</h3>'+all.map(function(r){return '<div class="row"><div class="l"><b>Week '+r.w+'</b><small>'+(r.d?'Thu':'Mon')+' '+fd(dayDate(r.w,r.d))+'</small></div><div class="v">'+r.v+'<small>kg</small></div></div>';}).join('')+'</div>';
  return h;}
function wiRow(w,d){var dt=dayDate(w,d),v=wt(w,d),live=isPast(w,d)||isToday(w,d),ok=S.open==="wt"+w+"_"+d;
  var l='<div class="l"><b>'+DAYS[d]+'</b><small>'+fd(dt)+'</small></div>';
  if(v!=null&&!ok)return '<div class="row">'+l+'<div class="v">'+v+'<small>kg</small></div><button class="go gh" onclick="fcsOpen(\'wt'+w+'_'+d+'\')">Change</button></div>';
  if(!live)return '<div class="row">'+l+'<div class="v mu">'+(isToday(w,d)?'Today':'Coming up')+'</div></div>';
  return '<div class="row">'+l+wtInput(w,d)+'</div>';}
function runHtml(){var w=TW(),br=bestRun(),fr=firstRun(),all=runsAll();
  var h='<div class="fsh"><div class="jk"><span>'+(br?'Best 3 km':'No run yet')+'</span></div><div class="n">'+(br?mmss(br):'–')+'</div><div class="jd">'+(br&&fr&&fr>br?'<b>'+mmss(fr-br)+' quicker</b> than your first one':br?'Mon and Wed. Chase it down.':'Mon and Wed, any time of day. Same route every time.')+' · <b>'+sprintsDone()+'</b> of 10 Friday sprints done</div></div>';
  h+='<div class="card"><h3>This week · week '+w+'</h3>'+[0,2].map(function(d){return runRow(w,d);}).join('')+'</div>';
  h+='<div class="card"><h3>Ten weeks</h3>'+chartRun()+'<p>Friday sprints build the top end. The Mon and Wed runs show it.</p></div>';
  var rec=all.slice().reverse().slice(0,8);
  if(rec.length>2)h+='<div class="card"><h3>Recent</h3>'+rec.map(function(r){var dt=pd(r.d);return '<div class="row"><div class="l"><b>Week '+Math.max(1,weekOf(dt))+'</b><small>'+fdow(dt)+'</small></div><div class="v">'+mmss(r.s)+(r.s===br?'<small>best</small>':'')+'</div></div>';}).join('')+'</div>';
  return h;}
function runRow(w,d){var dt=dayDate(w,d),r=run3k(iso(dt)),s=r?parseTime(r.time_text):null,live=isPast(w,d)||isToday(w,d),ok=S.open==="run"+w+"_"+d;
  var l='<div class="l"><b>'+DAYS[d]+'</b><small>'+fd(dt)+'</small></div>';
  if(s&&!ok)return '<div class="row">'+l+'<div class="v">'+mmss(s)+(bestRun()===s?'<small>best</small>':'')+'</div><button class="go gh" onclick="fcsOpen(\'run'+w+'_'+d+'\')">Change</button></div>';
  if(!live)return '<div class="row">'+l+'<div class="v mu">'+(isToday(w,d)?'Today':'Coming up')+'</div></div>';
  return '<div class="row">'+l+runInput(w,d)+'</div>';}
function sparHtml(){var w=TW(),f=fighter(),tot=roundsTotal(),nx=MILES.find(function(m){return tot<m[0];}),prev=MILES.filter(function(m){return tot>=m[0];}).pop(),lo=prev?prev[0]:0;
  var h='<div class="fsh"><div class="jk"><span>Rounds banked</span></div><div class="n">'+tot+'</div><div class="jd">'+(nx?'<b>'+(nx[0]-tot)+' more</b> to '+nx[1].toLowerCase():'<b>Fight singlet earned.</b> Every reward unlocked.')+'</div>'+(nx?'<div class="bar"><i style="width:'+Math.round((tot-lo)/(nx[0]-lo)*100)+'%"></i></div>':'')+'</div>';
  h+='<div class="card"><h3>This week · week '+w+'</h3>'+sparNights(w).map(function(n){return rdRow(w,n);}).join('')+'<p>'+(w>=sparOpenWeek()?'<b>Live rounds.</b> Headgear, 16 oz, still there to learn.':'<b>Technical until week '+sparOpenWeek()+'.</b> Headgear, 16 oz, you are there to learn, not to win Wednesday.')+'</p></div>';
  var mp=pairsOf(),today0=new Date(new Date().setHours(0,0,0,0));
  h+='<div class="card"><h3>Your pairings</h3>'+(mp.length?mp.map(function(p){var a=byId(p.a_id),b=byId(p.b_id);if(!a||!b)return '';var meA=p.a_id===f.id,o=meA?b:a,myst=meA?p.a_status:p.b_status,pend=myst==="pending"&&pd(p.night_date)>=today0;
      return '<div class="pair"><div class="p">'+E(full(o))+'<span>'+fdow(pd(p.night_date))+' · '+p.rounds+' × '+E(p.level)+(p.note?' · '+E(p.note):'')+'</span></div><span class="st '+(myst==="confirmed"?'ok':myst==="declined"?'no':'wait')+'">'+(myst==="confirmed"?'In':myst==="declined"?'Out':'Waiting')+'</span></div>'+(pend?'<div class="two"><button class="big" onclick="fcsConfirm('+p.id+',true)">I\'m in</button><button class="big ghost" onclick="fcsConfirm('+p.id+',false)">Can\'t make it</button></div>':'');}).join(''):'<p>Nothing on the board for you yet. Jake pairs fighters on weight and experience.</p>')+'</div>';
  var notes=myRounds().filter(function(r){return r.note;}).sort(function(a,b){return a.night_date<b.night_date?1:-1;});
  h+='<div class="card"><h3>Jake\'s round notes</h3>'+(notes.length?notes.map(function(r){return '<div class="pin"><div class="t">R'+(r.round_no||1)+'</div><div class="b">'+E(r.note)+'<small>'+fdow(pd(r.night_date))+'</small></div></div>';}).join(''):'<p>No notes yet. They land here after Jake watches you spar.</p>')+'</div>';
  h+='<div class="card"><h3>Rounds over the camp</h3>'+chartRounds()+'<p>'+MILES.map(function(m){return (tot>=m[0]?'✓ ':'')+m[0]+' '+m[1];}).join(' · ')+'</p></div>';
  return h;}
function rdRow(w,n){var dt=dayDate(w,n.i),ds=iso(dt),c=roundsOn(ds),live=isPast(w,n.i)||isToday(w,n.i),ok=S.open==="rd"+w+"_"+n.key;
  var l='<div class="l"><b>'+DAYS[n.i]+'</b><small>'+fd(dt)+'</small></div>';
  if(c&&!ok)return '<div class="row">'+l+'<div class="v">'+c+'<small>round'+(c===1?'':'s')+'</small></div><button class="go gh" onclick="fcsOpen(\'rd'+w+'_'+n.key+'\')">Change</button></div>';
  if(!live)return '<div class="row">'+l+'<div class="v mu">'+(isToday(w,n.i)?'Tonight':'Coming up')+'</div></div>';
  return '<div class="row">'+l+rdInput(w,n.key)+'</div>';}
function tapeHtml(){var mv=vidsOf().slice().sort(function(a,b){return a.created_at<b.created_at?1:-1;});
  if(!mv.length)return '<div class="card"><h3>Your fight tape</h3><p>Jake films your sparring and uploads it here with notes pinned to the second he wants you to watch. Nothing yet.</p></div>';
  return mv.map(function(v){var notes=vnotesOf(v);
    return '<div class="card"><div class="jk"><span>'+E(fdow(pd(v.created_at)))+'</span>'+(!v.seen_at?'<small style="color:var(--blue)">New</small>':'')+'</div><h3>'+E(v.title)+'</h3><video id="fcsV'+v.id+'" controls playsinline preload="metadata" src="'+E(S.vurl[v.id]||v.url||'')+'"></video>'
      +notes.map(function(n,i){return '<button class="pin" onclick="fcsSeek('+v.id+','+n.t_sec+')"><div class="t">'+mmss(n.t_sec)+'</div><div class="b">'+E(n.note)+'<small>Jake · pin '+(i+1)+'</small></div></button>';}).join('')
      +(!v.seen_at?'<button class="big" onclick="fcsSeen('+v.id+')">Watched it ✓</button>':'')+'</div>';}).join('');}
function boardHtml(){var tab=S.board,rows=S.boardRows,f=fighter();
  var h='<div class="fseg">'+[["pts","Points"],["rounds","Rounds"],["run","3 km"]].map(function(t){return '<button class="'+(tab===t[0]?'on':'')+'" onclick="fcsBoard(\''+t[0]+'\')">'+t[1]+'</button>';}).join('')+'</div>';
  if(!rows)return h+'<div class="card"><p>Loading the board…</p></div>';
  var list=rows.map(function(r){return {name:(r.first_name||'')+' '+(r.last_name||''),me:f&&r.fighter_id===f.id,p:r.prim,b:r.bonus,r:r.runs,pts:r.prim+r.bonus+r.runs,rounds:r.rounds,best:r.best_sec};});
  if(tab==="pts")list.sort(function(a,b){return b.pts-a.pts||b.p-a.p;});else if(tab==="rounds")list.sort(function(a,b){return b.rounds-a.rounds;});else list.sort(function(a,b){return (a.best||9999)-(b.best||9999);});
  var rank=list.findIndex(function(r){return r.me;})+1;
  h+='<div class="card"><h3>'+(tab==="pts"?"Points":tab==="rounds"?"Sparring rounds":"Best 3 km")+'</h3><p style="margin:0 0 6px">'+(rank?'You are <b>#'+rank+'</b> of '+list.length:list.length+' fighters')+'</p>'
    +list.map(function(r,i){var val=tab==="pts"?r.pts:tab==="rounds"?r.rounds:(r.best?mmss(r.best):'–');return '<div class="lb'+(r.me?' me':'')+(i<3?' top':'')+'"><span class="rk">'+(i+1)+'</span><span class="nm">'+E(r.name)+(r.me?' <i>you</i>':'')+'</span><span class="pt">'+val+'</span></div>';}).join('')+'</div>'
    +(tab==="pts"?'<p class="key">One point for every primary night, bonus session and 3 km run.</p>':'');
  return h;}
function progHtml(){var w=TW(),prim=0,snc=0,bon=0;for(var i=1;i<=w;i++){prim+=primDone(i);snc+=sncDone(i);bon+=bonus(i);}
  var lw=lastWt(),fw=firstWt(),br=bestRun(),rounds=roundsTotal(),last=w>1?weekScore(w-1):null,cur=weekScore(w);
  var h='<div class="tiles"><div class="tile"><div class="jk"><span>Primary nights</span></div><div class="v">'+prim+'<small>/ '+(w*3)+'</small></div><div class="bar"><i class="ok" style="width:'+Math.round(prim/(w*3)*100)+'%"></i></div><div class="s">Mon Tue Wed 6:45 pm</div></div>'
    +'<div class="tile"><div class="jk"><span>Bonus</span></div><div class="v">'+bon+'</div><div class="bar"><i style="width:'+Math.min(100,Math.round(bon/(w*4)*100))+'%;background:var(--blue)"></i></div><div class="s"><b>'+snc+'</b> Strength & Con · <b>'+(bon-snc)+'</b> extras</div></div>'
    +'<div class="tile"><div class="jk"><span>Rounds</span></div><div class="v">'+rounds+'</div><div class="s">'+(MILES.find(function(m){return rounds<m[0];})?'Next reward at '+MILES.find(function(m){return rounds<m[0];})[0]:'All rewards unlocked')+'</div></div>'
    +'<div class="tile"><div class="jk"><span>Best 3 km</span></div><div class="v">'+(br?mmss(br):'–')+'</div><div class="s">'+(lw?'Weight <b>'+lw+' kg</b>'+(fw&&fw>lw?' · '+(fw-lw).toFixed(1)+' down':''):'No weigh-in yet')+'</div></div></div>';
  h+='<div class="card"><h3>Week score</h3><div class="jd" style="margin-top:0"><b>'+cur+'</b> this week · '+(last==null?'first week':cur>last?'up '+(cur-last)+' on last week':cur===last?'level with last week':(last-cur)+' behind last week')+'</div>'+scoreChart()+'<p>20 a primary night, 7 a bonus session, 8 a run, 2 a weigh-in. <b>70 is a solid week.</b></p></div>';
  h+='<div class="card"><h3>Badges</h3><div class="badges">'+badges().map(function(b){return '<div class="bg'+(b.on?' on':'')+'"><b>'+E(b.n)+'</b><span>'+E(b.d)+'</span></div>';}).join('')+'</div></div>';
  h+='<div class="card"><h3>Attendance</h3>'+chartAtt()+'<p><b style="color:var(--ok)">Green</b> is Mon, Tue, Wed 6:45 pm. <b style="color:var(--blue)">Blue</b> is everything extra. Dashed is every primary night.</p></div>';
  return h;}
function fightHtml(){var f=fighter(),o=f.opponent_id?byId(f.opponent_id):null,done=CHECK.filter(function(c){return chkOf(c[0]);}).length;
  var h='<div class="fsh"><div class="jk"><span>'+E(fdow(fightDate()))+' · Legacy Gym</div><div class="n">'+daysToFight()+'<small>days</small></div><div class="jd">Doors 6 pm · weigh-in Fri 18 Dec 5 pm · <b>'+(f.fight_weight_kg?f.fight_weight_kg+' kg':'no target yet')+'</b></div></div>';
  h+='<div class="card"><h3>Your fight</h3>'+(o?'<div class="vs"><div class="f"><div class="av">'+(f.photo_url?'<img src="'+E(f.photo_url)+'" alt="">':E(initials(f.first_name,f.last_name)))+'</div><b>'+E(full(f))+'</b><span>'+(f.wins||0)+'-'+(f.losses||0)+'-'+(f.draws||0)+' · '+E(f.stance||'stance TBC')+'</span></div><div class="amp">V</div><div class="f"><div class="av">'+(o.photo_url?'<img src="'+E(o.photo_url)+'" alt="">':E(initials(o.first_name,o.last_name)))+'</div><b>'+E(full(o))+'</b><span>'+(o.wins||0)+'-'+(o.losses||0)+'-'+(o.draws||0)+' · '+E(o.stance||'stance TBC')+'</span></div></div><p style="text-align:center">3 × 2 min · 16 oz gloves, headgear</p>':'<p><b>Opponent announced week 6.</b> Jake matches every fighter on weight and experience.</p>')+'</div>';
  h+='<div class="card"><h3>Fight week checklist · '+done+'/'+CHECK.length+'</h3>'+CHECK.map(function(c){var on=chkOf(c[0]);return '<button class="chk '+(on?'on':'')+'" onclick="fcsChk(\''+c[0]+'\','+(!on)+')"><div class="tick '+(on?'on':'')+'">'+(on?'✓':'')+'</div><div class="n">'+E(c[1])+'<span>'+E(c[2])+'</span></div></button>';}).join('')+'</div>';
  h+='<div class="card"><h3>Walkout song</h3><p>Thirty seconds, nothing you wouldn\'t play in front of your mum.</p><input class="txt" id="fcsSong" placeholder="Song · artist" value="'+E(f.walkout_song||'')+'"><button class="big ghost" onclick="fcsSong()">Save song</button></div>';
  h+='<div class="card"><h3>Your fighter card</h3><p>Post it. Your people buy tickets, the gym fills the room.</p><button class="big" onclick="fcsCard()">Save my card</button></div>';
  h+='<div class="card"><h3>Tickets for your people</h3><p>On sale Mon 23 Nov. You get a link to share. Doors 6 pm, Christmas party after the last bout.</p></div>';
  return h;}
function extrasHtml(){var ss=sessOf();if(!ss.length)return '<div class="card"><h3>Extra rounds</h3><p>When Jake builds you extra rounds they land here with a timer that runs the session for you.</p></div>';
  return '<div class="card"><h3>Extra rounds from Jake</h3>'+ss.map(function(s){var n=(s.items||[]).length,dn=n&&s.done_rounds>=n;return '<div class="sess'+(dn?' on':'')+'"><div class="st"><b>'+E(s.name)+'</b><small>'+n+' rounds · '+mmss(s.len_sec||180)+' work, '+(s.rest_sec||30)+' s rest'+(s.due_date?' · by '+fdow(pd(s.due_date)):'')+(s.note?'<br>'+E(s.note):'')+'</small></div><button class="go" onclick="fcsRun('+s.id+')">'+(dn?'Done ✓':s.done_rounds?s.done_rounds+'/'+n:'Start')+'</button></div>';}).join('')+'</div>';}

/* ---------- shell ---------- */
function tabDone(id){var w=TW(),d=TD();if(d<0)return false;
  if(id==="today"){var J=jobs(w,d);return J.length>0&&!J.some(function(j){return j.state==="todo";});}
  if(id==="weigh")return (d===0||d===3)&&wt(w,d)!=null;
  if(id==="run")return (d===0||d===2)&&!!run3k(iso(dayDate(w,d)));
  if(id==="spar")return sparNights(w).some(function(n){return n.i===d&&roundsOn(iso(dayDate(w,d)))>0;});
  if(id==="fight")return CHECK.every(function(c){return chkOf(c[0]);});
  return false;}
function tabsHtml(){var t=[["today","Today"],["week","Week"],["weigh","Weigh"],["run","Run"],["spar","Spar"],["tape","Tape"],["board","Board"],["progress","Progress"],["fight","Fight"]];if(sessOf().length)t.push(["extras","Extras"]);
  return '<div class="tabs">'+t.map(function(x){return '<button class="'+(S.tab===x[0]?'on':'')+(tabDone(x[0])?' dn':'')+'" onclick="fcsTab(\''+x[0]+'\')">'+x[1]+(x[0]==="tape"&&newTape()?'<span class="nd"></span>':'')+'</button>';}).join('')+'</div>';}
function screen(){switch(S.tab){case "week":return weekHtml();case "weigh":return weighHtml();case "run":return runHtml();case "spar":return sparHtml();case "tape":return tapeHtml();case "board":return boardHtml();case "progress":return progHtml();case "fight":return fightHtml();case "extras":return extrasHtml();default:return todayHtml();}}
var painting=false;
function paint(){if(painting)return;painting=true;try{
  var main=document.getElementById("main");if(!main)return;var f=fighter();
  if(!f){main.innerHTML='<div class="fcs"><div class="top"><button class="back" onclick="go(\'home\')">‹ Home</button></div><div class="card"><h3>Fight Club</h3><p>No fighter found for this login. Register at legacygym.net/pages/fight-club or ask Jake.</p></div></div>';return;}
  if(S.wk==null||S.wk>TW())S.wk=TW();if(S.day==null)S.day=Math.max(0,TD());if(!sessOf().length&&S.tab==="extras")S.tab="today";
  var cw=CW(),w=TW();
  var pv=preview()?'<div class="pv"><span>Coach preview · seeing it as <b>'+E(full(f))+'</b> · nothing you tap here is saved</span><button onclick="fcsPvNext()">Next fighter</button><button onclick="fcsPvExit()">Exit</button></div>':'';
  var tools='<div class="tools"><button onclick="fcsRefresh()" title="Refresh">↻</button>'+(staff()&&!preview()?'<button class="coach" onclick="fcsCoach()">Coach</button>':'')+'</div>';
  var sub=(cw===0?'Starts '+fdow(campStart()):'Week '+w+' of 10 · '+phase(cw))+' · '+daysToFight()+' days to fight night';
  var h='<div class="fcs"><div class="top"><button class="back" onclick="go(\'home\')">‹ Home</button>'+tools+'</div>'+pv+'<div class="ttl">Fight <span>Club</span></div><div class="sub">'+E(sub)+'</div>'
    +'<div class="wkbar">'+[1,2,3,4,5,6,7,8,9,10].map(function(i){return '<i class="'+(i<cw?'done':i===cw?'now':'')+'"></i>';}).join('')+'</div>'+tabsHtml()+screen()+'</div>';
  main.innerHTML=h;after();
 }catch(e){console.warn("fcs",e);}finally{painting=false;}}
function after(){
  try{var inp=document.querySelector("#main .fcs .job.next .inrow input")||document.querySelector("#main .fcs .inrow input");if(inp&&S.open)inp.focus();}catch(e){}
  var w=TW(),d=TD();
  if((S.tab==="today"&&d>=0)||(S.tab==="week"&&S.wk===w&&S.day===d)){var keys=(SESS[d]||[]).filter(function(x){return x.tier==="p";}).map(function(x){return x.key;});if(keys.length)loadWho(w,d,keys);}
  if(S.tab==="board")loadBoard();
  if(S.tab==="tape")document.querySelectorAll("video[id^=fcsV]").forEach(function(el){var id=+el.id.slice(4);var v=vidsOf().find(function(x){return x.id===id;});if(!v||el.getAttribute("src"))return;signedUrl(v).then(function(u){if(u&&!el.getAttribute("src"))el.src=u;});});
}
function repaint(){if(mine())paint();}
function loadWho(w,d,keys){keys.forEach(function(key){var k=w+":"+d+":"+key;if(S.who[k]||S.whoLoading[k])return;S.whoLoading[k]=true;
  sb.rpc("fc_who_in",{p_camp:CAMP,p_week:w,p_day:key}).then(function(r){S.whoLoading[k]=false;S.who[k]=r.error?[]:(r.data||[]);repaint();},function(){S.whoLoading[k]=false;});});}
function loadBoard(force){if(!force&&S.boardRows&&Date.now()-S.boardAt<60000)return;if(S.boardLoading)return;S.boardLoading=true;
  sb.rpc("fc_board",{p_camp:CAMP}).then(function(r){S.boardLoading=false;S.boardRows=r.error?[]:(r.data||[]);S.boardAt=Date.now();repaint();},function(){S.boardLoading=false;});}
function dirty(){S.who={};S.boardRows=null;}
async function signedUrl(v){if(v.url)return v.url;if(S.vurl[v.id])return S.vurl[v.id];try{var r=await sb.storage.from("fc-videos").createSignedUrl(v.storage_path,3600);if(r.data&&r.data.signedUrl){S.vurl[v.id]=r.data.signedUrl;return S.vurl[v.id];}}catch(e){}return "";}
function blocked(){if(preview()){T("Preview only · nothing saved");return true;}return false;}
function val(id){var el=document.getElementById(id);return el?el.value:"";}

/* ---------- actions ---------- */
window.fcsTab=function(t){S.tab=t;S.open=null;S.tgt=false;try{localStorage.setItem("fcsTab",t);}catch(e){}if(t==="week"){S.wk=TW();S.day=Math.max(0,TD());}paint();try{window.scrollTo(0,0);}catch(e){}};
window.fcsDay=function(d){S.day=d;S.open=null;paint();};
window.fcsWeek=function(n){S.wk=Math.max(1,Math.min(TW(),(S.wk||TW())+n));S.open=null;paint();};
window.fcsOpen=function(k){if(k==="tgt"){S.tgt=!S.tgt;paint();return;}S.open=S.open===k?null:k;paint();};
window.fcsBoard=function(t){S.board=t;paint();};
window.fcsRefresh=function(){var F=fc();if(!F)return;F.loaded=false;F.loading=null;dirty();S.vurl={};T("Refreshing…");try{fcxEnter();}catch(e){}};
window.fcsCoach=function(){S.coach=true;try{if(window.fccTools)window.fccTools(true);else fcxSet("tab","fighters");}catch(e){}};
window.fcsPvNext=function(){var L=active();if(!L.length)return;var i=L.findIndex(function(x){return S.pf&&x.id===S.pf.id;});S.pf=L[(i+1)%L.length];S.open=null;dirty();paint();};
window.fcsPvExit=function(){S.pf=null;dirty();try{localStorage.setItem("fcwPreview","0");}catch(e){}try{if(window.fccPreview)window.fccPreview(false);else fcxSet("tab","camp");}catch(e){}};
window.fcsAtt=async function(w,i,v){if(blocked())return;var f=fighter();if(!f)return;var cur=attRow(w,i),d=iso(dayDate(w,dayOf(i)));
  if(!v){if(cur){var del=await sb.from("fc_attendance").delete().eq("id",cur.id);if(del.error){T("Couldn't change that");return;}fc().att=fc().att.filter(function(x){return x.id!==cur.id;});}T("Cleared · log it again");dirty();paint();return;}
  var r=await sb.from("fc_attendance").upsert({camp:CAMP,fighter_id:f.id,week:w,day:i,attended:v===1,session_date:d,logged_by:uid()},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().att=(fc().att||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&x.day===i);});fc().att.push(r.data);
  var st=streak();T(v===1?(i===4?"Sprints done ✓":st>=3?"Banked ✓ · "+st+" primary in a row":"Session banked ✓"):"Logged as missed");dirty();paint();};
window.fcsSaveWt=async function(w,d){if(blocked())return;var f=fighter(),v=parseFloat(val(inId("wt",w,d)));if(!(v>30&&v<250)){T("Type your weight in kg");return;}
  var day=d===3?3:0;var r=await sb.from("fc_weighins").upsert({camp:CAMP,fighter_id:f.id,week:w,day:day,weight_kg:v},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().wi=(fc().wi||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&(x.day||0)===day);});fc().wi.push(r.data);S.open=null;T(v+" kg recorded ✓");paint();};
window.fcsSaveRun=async function(w,d){if(blocked())return;var f=fighter(),s=parseTime(val(inId("run",w,d)));if(!s||s<300||s>3600){T("Time as mm:ss, e.g. 14:30");return;}
  var ds=iso(dayDate(w,d)),old=run3k(ds);
  if(old){await sb.from("fc_runs").delete().eq("id",old.id);fc().runs=fc().runs.filter(function(x){return x.id!==old.id;});}
  var r=await sb.from("fc_runs").insert({camp:CAMP,fighter_id:f.id,run_date:ds,km:3,time_text:mmss(s)}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().runs=(fc().runs||[]).concat([r.data]);S.open=null;var b=bestRun();T("3 km · "+mmss(s)+(b===s?" · new best 🔥":" ✓"));dirty();paint();};
window.fcsSaveRounds=async function(w,i){if(blocked())return;var f=fighter(),ds=iso(dayDate(w,dayOf(i))),n=parseInt(val(inId("rd",w,i)),10);if(!(n>0&&n<=40)){T("How many rounds? Type a number");return;}
  var ex=myRounds().filter(function(r){return r.night_date===ds;});
  if(ex.some(function(r){return r.created_by!==uid();})){T("Jake logged that night · ask him to change it");return;}
  if(ex.length){var del=await sb.from("fc_spar_rounds").delete().eq("fighter_id",f.id).eq("night_date",ds);if(del.error){T("Couldn't replace that night");return;}fc().rounds=fc().rounds.filter(function(r){return !(r.fighter_id===f.id&&r.night_date===ds);});}
  var lvl=w>=sparOpenWeek()?"Live":"Technical",rows=[];for(var k=1;k<=n;k++)rows.push({camp:CAMP,fighter_id:f.id,night_date:ds,round_no:k,opponent_id:null,level:lvl,created_by:uid()});
  var r=await sb.from("fc_spar_rounds").insert(rows).select();if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().rounds=(fc().rounds||[]).concat(r.data||[]);
  try{var a=await sb.from("fc_attendance").upsert({camp:CAMP,fighter_id:f.id,week:w,day:i,attended:true,session_date:ds,logged_by:uid()},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();if(!a.error&&a.data){fc().att=(fc().att||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&x.day===i);});fc().att.push(a.data);}}catch(e){}
  S.open=null;var tot=roundsTotal(),hit=MILES.find(function(m){return tot>=m[0]&&tot-n<m[0];});T(hit?tot+" rounds · "+hit[1]+" unlocked 🔥":n+" rounds banked ✓ ("+tot+" total)");dirty();paint();};
window.fcsSaveTgt=async function(){if(blocked())return;var f=fighter(),v=parseFloat(val("fcsTgt"));if(!(v>30&&v<250)){T("Type a weight in kg");return;}
  var r=await sb.rpc("fc_set_target",{p_camp:CAMP,p_kg:v});if(r.error){T("Couldn't save the target");return;}f.fight_weight_kg=v;S.tgt=false;T("Target "+v+" kg");paint();};
window.fcsConfirm=async function(id,yes){if(blocked())return;var r=await sb.rpc("fc_spar_confirm",{p_pair:id,p_yes:yes});if(r.error){T("Couldn't save");return;}var f=fighter(),p=(fc().pairs||[]).find(function(x){return x.id===id;});if(p&&f){if(p.a_id===f.id)p.a_status=yes?"confirmed":"declined";else p.b_status=yes?"confirmed":"declined";}T(yes?"Confirmed · Jake knows you're in":"Jake's been told");paint();};
window.fcsSeek=function(id,t){var el=document.getElementById("fcsV"+id);if(!el)return;el.currentTime=t;el.play().catch(function(){});};
window.fcsSeen=async function(id){if(blocked())return;await sb.rpc("fc_video_seen",{p_video:id});var v=(fc().vids||[]).find(function(x){return x.id===id;});if(v)v.seen_at=new Date().toISOString();paint();};
window.fcsChk=async function(key,on){if(blocked())return;var f=fighter();var r=await sb.from("fc_checklist").upsert({camp:CAMP,fighter_id:f.id,item_key:key,done:on,updated_at:new Date().toISOString()},{onConflict:"camp,fighter_id,item_key"}).select().maybeSingle();if(r.error){T("Couldn't save");return;}fc().chk=(fc().chk||[]).filter(function(c){return !(c.fighter_id===f.id&&c.item_key===key);});fc().chk.push(r.data);paint();};
window.fcsSong=async function(){if(blocked())return;var s=val("fcsSong").trim();var r=await sb.rpc("fc_set_walkout",{p_song:s});if(r.error){T("Couldn't save");return;}var f=fighter();if(f)f.walkout_song=s;T("Saved · the DJ has it");};
window.fcsCard=function(){var F=fc(),f=fighter();if(!F||!f||typeof window.fcxCardImg!=="function"){T("Not available here");return;}var o=F.me;F.me=f;try{window.fcxCardImg();}finally{F.me=o;}};
window.fcsRun=function(id){if(preview()){T("Preview only");return;}try{window.fcxRun(id);}catch(e){T("Couldn't start that session");}};

/* ---------- hooks ---------- */
var _render=window.render;window.render=function(){if(view==="fc"&&mine())return paint();return _render.apply(this,arguments);};
if(typeof window.fccTools==="function"){var _tools=window.fccTools;window.fccTools=function(on){S.coach=!!on;return _tools.apply(this,arguments);};}
if(typeof window.fccPreview==="function"){var _pv=window.fccPreview;window.fccPreview=function(on){S.coach=false;S.pf=null;return _pv.apply(this,arguments);};}
try{var mo=new MutationObserver(function(){try{if(mine()&&!document.querySelector("#main .fcs"))paint();}catch(e){}});var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true});}catch(e){}
setInterval(function(){try{if(mine()&&!document.querySelector("#main .fcs"))paint();}catch(e){}},500);
})();
