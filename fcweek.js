/*__FCWEEK__ ==========================================================
   Fight Club · "My week" + "Progress" for fighters · 28 Sep 2026
   Replaces the fighter Camp and Progress tabs with one Monday-to-Sunday
   week (primary Fight Club nights, Strength & Con, bonus work) and a
   progress screen (weight, 3 km for time, sparring rounds, attendance).
   Reads and writes the tables the Fight Club tab already uses:
   fc_attendance, fc_weighins (now Mon + Thu via day), fc_runs, fc_spar_rounds,
   plus fc_sprints (Friday sprint log) and class_regs / points_events for S&C.
   Additive: remove the script tag to get the old Camp / Progress tabs back.
   ==================================================================== */
(function(){
"use strict";
var CAMP="fc2026";
var WHO=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"];
var SPAR_SAT_WEEKS=[2,4,6,8,10];           /* Saturday 9:30 sparring runs every second week */
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
var ST={view:"week",open:null,roundsN:4,regs:[],claims:[],sprints:[],extrasKey:null,loading:null,wk:null};

function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function me(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function staff(){try{return WHO.indexOf(me())>=0||!!(profile&&(profile.is_staff||profile.is_coach));}catch(e){return false;}}
function pd(s){var p=String(s).slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fc(){return window.FC||null;}
function camp(){var f=fc();return (f&&f.camp)||{};}
function campStart(){return pd(camp().start_date||"2026-10-12");}
function fightDate(){return pd(camp().fight_date||"2026-12-19");}
function sparOpenWeek(){return Number(camp().spar_open_week||6);}
function weekOf(d){var n=Math.floor((d-campStart())/864e5);return n<0?0:Math.min(10,Math.floor(n/7)+1);}
function CW(){return weekOf(new Date());}
function dayDate(w,i){var x=new Date(campStart());x.setDate(x.getDate()+(w-1)*7+i);return x;}
function fd(d){return d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];}
function fdl(d){return d.toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}
function mmss(sec){return Math.floor(sec/60)+":"+String(Math.round(sec%60)).padStart(2,"0");}
function parseTime(s){s=String(s||"").trim();var m;if((m=/^(\d{1,2}):(\d{2})$/.exec(s)))return +m[1]*60+ +m[2];if((m=/^(\d{1,2})[.,](\d{1,2})$/.exec(s)))return +m[1]*60+Math.round(+("0."+m[2])*60);if(/^\d{1,2}$/.test(s))return +s*60;return null;}
function todayIdx(w){var t=new Date();t.setHours(0,0,0,0);var n=Math.round((t-dayDate(w,0))/864e5);return n<0?-1:n>6?7:n;}
function phase(w){return w<=0?"Pre-camp":w<=3?"Build":w===4?"Legacy Games":w<=8?"Build 2":w===9?"Legacy Games":"Fight week";}
function fighter(){var f=fc();return f&&f.me?f.me:null;}

/* ---------- data views ---------- */
function attRow(w,d){var f=fighter();if(!f)return null;return (fc().att||[]).find(function(r){return r.fighter_id===f.id&&r.week===w&&r.day===d;})||null;}
function attDone(w,d){var r=attRow(w,d);return !!(r&&r.attended);}
function wt(w,day){var f=fighter();if(!f)return null;var r=(fc().wi||[]).find(function(x){return x.fighter_id===f.id&&x.week===w&&(x.day||0)===day&&x.weight_kg!=null;});return r?Number(r.weight_kg):null;}
function wiAll(){var f=fighter();if(!f)return [];return (fc().wi||[]).filter(function(x){return x.fighter_id===f.id&&x.weight_kg!=null;}).map(function(x){return {w:x.week,d:x.day||0,v:Number(x.weight_kg)};}).sort(function(a,b){return (a.w*7+a.d)-(b.w*7+b.d);});}
function run3k(dateIso){var f=fighter();if(!f)return null;var rs=(fc().runs||[]).filter(function(r){return r.fighter_id===f.id&&r.run_date===dateIso&&Math.abs(Number(r.km)-3)<0.01&&r.time_text;});return rs.length?rs[rs.length-1]:null;}
function runSecs(r){return r?parseTime(r.time_text):null;}
function runsAll(){var f=fighter();if(!f)return [];return (fc().runs||[]).filter(function(r){return r.fighter_id===f.id&&Math.abs(Number(r.km)-3)<0.01&&r.time_text&&parseTime(r.time_text);}).map(function(r){return {d:r.run_date,s:parseTime(r.time_text)};}).sort(function(a,b){return a.d<b.d?-1:1;});}
function bestRun(){var a=runsAll();return a.length?Math.min.apply(null,a.map(function(r){return r.s;})):null;}
function roundsTotal(){var f=fighter();if(!f)return 0;return (fc().rounds||[]).filter(function(r){return r.fighter_id===f.id;}).length;}
function roundsOn(dateIso){var f=fighter();if(!f)return 0;return (fc().rounds||[]).filter(function(r){return r.fighter_id===f.id&&r.night_date===dateIso;}).length;}
function roundsByWeek(){var f=fighter(),k=[];for(var i=0;i<10;i++)k.push(0);if(!f)return k;(fc().rounds||[]).forEach(function(r){if(r.fighter_id!==f.id)return;var w=Math.max(1,weekOf(pd(r.night_date)));k[w-1]++;});return k;}
function reg(dateIso,time){return ST.regs.find(function(r){return r.class_date===dateIso&&r.class_time===time;})||null;}
function claimed(dateIso,time){return ST.claims.indexOf("class:"+dateIso+":"+time)>=0;}
function sprintDone(w){return ST.sprints.some(function(s){return s.week===w;});}
function sncClass(dt){try{return (scheduleForDate(dt)||[]).find(function(c){return c.t==="18:00"&&/S&C/i.test(c.n);})||null;}catch(e){return null;}}
function satClasses(dt){try{return (scheduleForDate(dt)||[]).filter(function(c){return c.t<"12:00";});}catch(e){return [];}}
function fmtT(t){var p=t.split(":"),h=+p[0],ap=h>=12?"PM":"AM";h=h%12||12;return h+":"+p[1]+"<small>"+ap+"</small>";}

/* ---------- extras: class bookings, class points, sprints ---------- */
async function loadExtras(w){
  var f=fighter();if(!f||!me())return;
  var key=w+":"+f.id;if(ST.extrasKey===key)return;if(ST.loading)return ST.loading;
  ST.loading=(async function(){
    try{
      var a=iso(dayDate(w,0)),b=iso(dayDate(w,6));
      var r=await Promise.all([
        sb.from("class_regs").select("class_date,class_time,class_name").eq("user_id",me()).gte("class_date",a).lte("class_date",b),
        sb.from("points_events").select("ref").eq("user_id",me()).eq("kind","class").gte("created_at",iso(campStart())),
        sb.from("fc_sprints").select("week").eq("fighter_id",f.id).eq("camp",CAMP)
      ]);
      ST.regs=r[0].data||[];ST.claims=(r[1].data||[]).map(function(x){return x.ref;});ST.sprints=r[2].data||[];ST.extrasKey=key;
    }catch(e){console.warn("fcweek extras",e);}
    ST.loading=null;
  })();
  return ST.loading;
}
async function claimsAll(){ /* every class point since camp start, for the S&C line */
  try{var r=await sb.from("points_events").select("ref").eq("user_id",me()).eq("kind","class").gte("created_at",iso(campStart()));return (r.data||[]).map(function(x){return x.ref;});}catch(e){return ST.claims;}
}

/* ---------- css ---------- */
var css=document.createElement("style");css.id="fcwCss";css.textContent=
 ".fcw{--blue:#2f7bff;--blue2:#9cc4ff;--red:#e4002b;--red2:#ff4d6a;--panel:#0b0f18;--line:#1e2a40;--mute:#8b96ad;color:#fff}"+
 ".fcw .k{font-size:7.5px;font-weight:800;letter-spacing:2.2px;text-transform:uppercase}"+
 ".fcwHd{position:relative;border-radius:16px;overflow:hidden;background:linear-gradient(90deg,rgba(11,46,91,.8),rgba(5,7,13,.9) 55%,rgba(110,0,25,.75));border:1.5px solid #fff;box-shadow:0 0 8px #fff,0 0 24px var(--blue),inset 0 0 18px rgba(228,0,43,.4);padding:13px 14px 12px;margin-top:4px}"+
 ".fcwHd .rw{position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--red) 0 33%,#fff 33% 66%,var(--blue) 66%);box-shadow:0 0 12px rgba(255,255,255,.7)}"+
 ".fcwHd .row{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}"+
 ".fcwHd .k{color:var(--blue2)}"+
 ".fcwHd h2{font-family:Oswald,sans-serif;font-weight:700;font-size:30px;line-height:.95;text-transform:uppercase;margin:4px 0 0;color:#fff;letter-spacing:.5px;text-shadow:0 0 3px rgba(255,255,255,.6),0 0 16px rgba(228,0,43,.6)}"+
 ".fcwHd h2 span{text-shadow:0 0 3px rgba(255,255,255,.6),0 0 16px rgba(47,123,255,.7)}"+
 ".fcwHd .cd{text-align:right;flex:none}.fcwHd .cd b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:34px;line-height:1;color:#fff;text-shadow:0 0 12px rgba(255,255,255,.35)}.fcwHd .cd small{display:block;font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--red2);margin-top:2px}"+
 ".fcwWk{display:flex;gap:3px;margin-top:11px}.fcwWk div{flex:1;height:5px;border-radius:2px;background:rgba(255,255,255,.1)}.fcwWk div.done{background:var(--blue);box-shadow:0 0 8px var(--blue)}.fcwWk div.now{background:#fff;box-shadow:0 0 10px #fff}"+
 ".fcwCnt{display:flex;gap:6px;margin-top:11px}.fcwCnt div{flex:1;display:flex;align-items:center;gap:7px;background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:7px 9px}"+
 ".fcwCnt b{font-family:Oswald,sans-serif;font-weight:700;font-size:20px;line-height:1;color:#fff}.fcwCnt b small{font-size:9px;color:var(--mute);margin-left:1px}"+
 ".fcwCnt span{font-size:6.2px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;line-height:1.25}.fcwCnt .p span{color:var(--blue2)}.fcwCnt .r span{color:#fff}.fcwCnt .b span{color:var(--mute)}"+
 ".fcwCnt .p{border-color:rgba(47,123,255,.7);box-shadow:inset 0 0 12px rgba(47,123,255,.25)}.fcwCnt .r{border-color:rgba(255,255,255,.6)}"+
 ".fcwVw{display:flex;gap:6px;margin:12px 0;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:4px}"+
 ".fcwVw button{flex:1;font-family:Oswald,sans-serif;font-weight:700;font-size:14px;letter-spacing:2px;text-transform:uppercase;padding:9px;border-radius:9px;border:0;background:transparent;color:var(--mute)}"+
 ".fcwVw button.on{background:#fff;color:#05070d;box-shadow:0 0 10px rgba(255,255,255,.35)}"+
 ".fcwDy{position:relative;border-radius:16px;overflow:hidden;margin-bottom:10px;background:var(--panel);border:1.5px solid var(--line)}"+
 ".fcwDy .slash{position:absolute;right:-30px;top:-20px;bottom:-20px;width:140px;transform:skewX(-16deg);opacity:.9}"+
 ".fcwDy.p{border-color:var(--blue);box-shadow:0 0 8px var(--blue),0 0 22px rgba(47,123,255,.5)}.fcwDy.p .slash{background:linear-gradient(180deg,#0b2e5b,#08162b)}"+
 ".fcwDy.p.sp{border-color:var(--red2);box-shadow:0 0 8px var(--red),0 0 24px rgba(228,0,43,.55)}.fcwDy.p.sp .slash{background:linear-gradient(180deg,#5a0f14,#2a0608)}"+
 ".fcwDy.r{border-color:#fff;box-shadow:0 0 6px rgba(255,255,255,.45),0 0 18px rgba(255,255,255,.18)}.fcwDy.r .slash{background:linear-gradient(180deg,#2a3242,#10151f)}"+
 ".fcwDy.b{border-color:#1e2a40}.fcwDy.b .slash{background:linear-gradient(180deg,#121a2a,#0b0f18);opacity:.7}"+
 ".fcwDy.today{box-shadow:0 0 0 2px #fff,0 0 12px rgba(255,255,255,.6),0 0 34px rgba(47,123,255,.6)}"+
 ".fcwDy .in{position:relative;padding:11px 13px 12px}"+
 ".fcwDy .lab{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}"+
 ".fcwDy .lab b{font-family:Oswald,sans-serif;font-weight:700;font-size:15px;letter-spacing:2.5px;text-transform:uppercase;color:#fff}.fcwDy .lab b small{font-size:10px;letter-spacing:1px;color:var(--mute);margin-left:6px;font-weight:500}"+
 ".fcwSt{font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.3);color:#cfd6e6}"+
 ".fcwSt.today{background:#fff;color:#05070d;border-color:#fff;box-shadow:0 0 8px rgba(255,255,255,.5)}.fcwSt.done{background:var(--blue);color:#fff;border-color:var(--blue);box-shadow:0 0 10px var(--blue)}.fcwSt.miss{border-color:var(--red);color:var(--red2)}"+
 ".fcwS{display:flex;align-items:center;gap:10px}.fcwS+.fcwS{border-top:1px solid rgba(255,255,255,.08);margin-top:8px;padding-top:8px}"+
 ".fcwS .t{flex:none;width:78px;font-family:Oswald,sans-serif;font-weight:700;font-size:28px;line-height:1;color:#fff;letter-spacing:.5px}.fcwS .t small{font-size:11px;letter-spacing:1px;margin-left:2px;color:var(--mute);font-weight:700}"+
 ".fcwS .n{flex:1;min-width:0}"+
 ".fcwTier{display:inline-block;font-size:6.5px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;padding:3px 7px;border-radius:4px;margin-bottom:4px;line-height:1.2}"+
 ".fcwTier.p{background:var(--blue);color:#fff;box-shadow:0 0 6px rgba(47,123,255,.7)}.fcwTier.r{background:#fff;color:#05070d;box-shadow:0 0 6px rgba(255,255,255,.5)}.fcwTier.b{border:1px solid #3a4356;color:var(--mute)}"+
 ".fcwS .n b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;line-height:1.05;text-transform:uppercase;letter-spacing:.6px;color:#fff}"+
 ".fcwS .n span{display:block;font-size:8.5px;line-height:1.35;font-weight:500;color:var(--mute);margin-top:3px}"+
 ".fcwS .n span.fcwTier{display:inline-block;font-size:6.5px;font-weight:800;letter-spacing:1.6px;margin:0 0 4px;line-height:1.2}.fcwS .n span.fcwTier.p{color:#fff}.fcwS .n span.fcwTier.r{color:#05070d}.fcwS .n span.fcwTier.b{color:var(--mute)}"+
 ".fcwB{flex:none;font-size:8px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:10px 12px;border-radius:9px;border:0;cursor:pointer;white-space:nowrap;color:#fff;font-family:inherit;background:transparent}"+
 ".fcwB.p{background:linear-gradient(90deg,var(--blue),#1b56c4);box-shadow:0 0 10px var(--blue)}.fcwB.sp{background:linear-gradient(90deg,var(--red),#9a0020);box-shadow:0 0 10px var(--red)}.fcwB.r{background:#fff;color:#05070d;box-shadow:0 0 8px rgba(255,255,255,.45)}"+
 ".fcwB.gh{border:1.5px solid rgba(255,255,255,.55)}.fcwB.in{border:1.5px solid #fff;color:#fff;box-shadow:0 0 8px rgba(255,255,255,.4)}.fcwB.off{border:1.5px solid rgba(255,255,255,.2);color:var(--mute)}"+
 ".fcwEx{display:flex;gap:6px;margin-top:10px}.fcwEx button{flex:1;display:flex;align-items:center;justify-content:space-between;gap:6px;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.14);border-radius:9px;padding:8px 9px;color:#fff;cursor:pointer;font-family:inherit;text-align:left}"+
 ".fcwEx button i{font-style:normal;font-size:6.5px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:var(--mute)}.fcwEx button i b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:11px;letter-spacing:.4px;color:#fff;margin-top:2px;text-transform:none}"+
 ".fcwEx button em{font-style:normal;font-size:7px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--blue2);white-space:nowrap}.fcwEx button.on{border-color:var(--blue);box-shadow:0 0 8px rgba(47,123,255,.5)}.fcwEx button.on em{color:#fff}"+
 ".fcwFrm{display:flex;gap:6px;align-items:center;margin-top:8px}.fcwFrm input{flex:1;min-width:0;background:#000;border:1.5px solid var(--blue);border-radius:9px;padding:9px 10px;color:#fff;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;outline:none;box-shadow:0 0 10px rgba(47,123,255,.5)}.fcwFrm span{font-size:8px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--blue2);flex:none}"+
 ".fcwSeg{display:flex;gap:5px;flex:1}.fcwSeg button{flex:1;border:1.5px solid var(--line);background:#000;border-radius:9px;padding:9px 2px;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;color:#9fb0cc;cursor:pointer}.fcwSeg button.on{border-color:var(--red2);color:#fff;background:#3a0410;box-shadow:0 0 8px rgba(228,0,43,.5)}"+
 ".fcwNote{margin-top:8px;font-size:8.5px;line-height:1.4;font-weight:500;color:var(--mute);padding:8px 10px;border:1px dashed rgba(255,255,255,.18);border-radius:9px}.fcwNote b{color:#fff}"+
 ".fcwTwo{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.fcwTwo .fcwDy{margin-bottom:0}.fcwTwo .fcwS{flex-direction:column;align-items:flex-start;gap:6px}.fcwTwo .fcwS .t{width:auto;font-size:22px}.fcwTwo .fcwB{width:100%}"+
 ".fcwSec{display:flex;justify-content:space-between;align-items:baseline;margin:14px 0 8px}.fcwSec b{font-family:Oswald,sans-serif;font-weight:700;font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#fff}.fcwSec span{font-size:9px;font-weight:600;color:var(--mute)}"+
 ".fcwTiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}.fcwTiles.three{grid-template-columns:1fr 1fr 1fr}"+
 ".fcwTile{position:relative;background:var(--panel);border:1.5px solid var(--line);border-radius:14px;padding:11px 12px;overflow:hidden}.fcwTile.p{border-color:var(--blue);box-shadow:0 0 10px var(--blue),inset 0 0 22px rgba(47,123,255,.2)}.fcwTile.r{border-color:#fff;box-shadow:0 0 8px rgba(255,255,255,.45),inset 0 0 22px rgba(255,255,255,.06)}"+
 ".fcwTile .k{color:var(--mute)}.fcwTile.p .k{color:var(--blue2)}.fcwTile.r .k{color:#fff}"+
 ".fcwTile .v{font-family:Oswald,sans-serif;font-weight:700;font-size:28px;line-height:1;color:#fff;margin-top:5px}.fcwTiles.three .fcwTile .v{font-size:21px}.fcwTiles.three .fcwTile{padding:10px 9px}.fcwTile .v small{font-size:10px;color:var(--mute);margin-left:3px}"+
 ".fcwTile .s{font-size:7.5px;font-weight:600;color:var(--mute);margin-top:5px}.fcwTile .s b{color:#fff}"+
 ".fcwRing{position:absolute;right:10px;top:10px;width:44px;height:44px}"+
 ".fcwCard{background:var(--panel);border:1.5px solid var(--line);border-radius:14px;padding:12px 13px;margin-bottom:8px;box-shadow:0 0 14px rgba(47,123,255,.15)}"+
 ".fcwCard .row{display:flex;justify-content:space-between;align-items:center;gap:8px}.fcwCard h3{font-family:Oswald,sans-serif;font-weight:700;font-size:16px;line-height:1;text-transform:uppercase;letter-spacing:.5px;margin:0;color:#fff}"+
 ".fcwTg{font-size:7px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:4px 8px;border-radius:999px;border:1px solid var(--blue);color:var(--blue2);white-space:nowrap}.fcwTg.r{border-color:var(--red);color:var(--red2)}"+
 "svg.fcwCh{width:100%;height:auto;display:block;margin-top:8px}.fcwCard p{font-size:9px;line-height:1.45;color:var(--mute);margin:8px 0 0}.fcwCard p b{color:#fff}"+
 ".fcw .fcwHide{display:none}";
document.head.appendChild(css);

/* ---------- charts ---------- */
function lineChart(series,opts){
  var W=opts.W||10,x0=44,x1=590,y0=14,y1=112,mx=opts.max,mn=opts.min||0,X=function(i){return x0+(x1-x0)*i/W;},Y=function(v){return y0+(y1-y0)*(1-(v-mn)/(mx-mn));};
  var s='<svg class="fcwCh" viewBox="0 0 600 136"><defs><filter id="fcwlg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter></defs>';
  (opts.ticks||[]).forEach(function(v){s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#1e2a40"/><text x="'+(x0-8)+'" y="'+(Y(v)+4)+'" fill="#8b96ad" font-size="11" text-anchor="end" font-family="Montserrat,sans-serif">'+(opts.fmt?opts.fmt(v):v)+'</text>';});
  (opts.marks||[]).forEach(function(m){if(m.v>mx||m.v<mn)return;s+='<line x1="'+x0+'" x2="'+x1+'" y1="'+Y(m.v)+'" y2="'+Y(m.v)+'" stroke="'+(m.c||"#39FF88")+'" stroke-dasharray="4 6" stroke-width="1.2" opacity=".85"/>'+(m.l?'<text x="'+x1+'" y="'+(Y(m.v)-4)+'" fill="'+(m.c||"#39FF88")+'" font-size="9.5" text-anchor="end" font-family="Montserrat,sans-serif" font-weight="700">'+E(m.l)+'</text>':'');});
  var cw=Math.max(1,CW());
  for(var w=1;w<=10;w++)s+='<text x="'+X((w-0.5)*(W/10))+'" y="128" fill="'+(w===cw?"#fff":"#4a5670")+'" font-size="10" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700">W'+w+'</text>';
  series.forEach(function(sr){if(!sr.pts.length)return;var d="M"+sr.pts.map(function(p){return X(p.x)+","+Y(Math.max(mn,Math.min(mx,p.v)));}).join(" L");
    if(sr.dash){s+='<path d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="1.5" stroke-dasharray="5 5" opacity=".6"/>';return;}
    if(sr.pts.length>1)s+='<path d="'+d+' L'+X(sr.pts[sr.pts.length-1].x)+','+y1+' L'+X(sr.pts[0].x)+','+y1+' Z" fill="'+sr.c+'" opacity=".10"/>';
    s+='<path d="'+d+'" fill="none" stroke="'+sr.c+'" stroke-width="9" opacity=".45" filter="url(#fcwlg)" stroke-linejoin="round" stroke-linecap="round"/><path d="'+d+'" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    sr.pts.forEach(function(p,i){var last=i===sr.pts.length-1;s+='<circle cx="'+X(p.x)+'" cy="'+Y(Math.max(mn,Math.min(mx,p.v)))+'" r="'+(last?5:3)+'" fill="'+(last?sr.c:"#05070d")+'" stroke="#fff" stroke-width="2"/>';});});
  return s+'</svg>';
}
function chartWt(f){
  var rows=wiAll(),tgt=f.fight_weight_kg?Number(f.fight_weight_kg):null,pts=rows.map(function(r){return {x:(r.w-1)*2+(r.d?1:0)+0.5,v:r.v};});
  var vals=pts.map(function(p){return p.v;}).concat(tgt?[tgt]:[]);if(!vals.length&&f.weight_kg)vals=[Number(f.weight_kg)];if(!vals.length)vals=[75];
  var lo=Math.floor(Math.min.apply(null,vals))-1,hi=Math.ceil(Math.max.apply(null,vals))+1;if(hi-lo<4)hi=lo+4;
  return lineChart([{pts:pts,c:"#2f7bff"}],{W:20,min:lo,max:hi,ticks:[lo,Math.round((lo+hi)/2),hi],marks:tgt?[{v:tgt,l:"TARGET "+tgt}]:[]});
}
function chartRun(){
  var rows=runsAll(),pts=rows.map(function(r){var d=pd(r.d),w=Math.max(1,weekOf(d)),dow=(d.getDay()+6)%7;return {x:(w-1)*2+(dow>=2?1:0)+0.5,v:r.s/60};});
  var vals=pts.map(function(p){return p.v;});if(!vals.length)vals=[15];var lo=Math.floor(Math.min.apply(null,vals))-1,hi=Math.ceil(Math.max.apply(null,vals))+1;
  return lineChart([{pts:pts,c:"#ffffff"}],{W:20,min:lo,max:hi,ticks:[lo,Math.round((lo+hi)/2),hi],fmt:function(v){return v+":00";}});
}
function chartRounds(){
  var k=roundsByWeek(),cw=Math.max(1,CW()),pts=[{x:0,v:0}],c=0;for(var w=1;w<=cw;w++){c+=k[w-1];pts.push({x:w,v:c});}
  var nx=MILES.find(function(m){return c<m[0];}),mx=c>=50?80:50;
  return lineChart([{pts:pts,c:"#e4002b"}],{max:mx,ticks:[0,mx/2,mx],marks:MILES.map(function(m){return {v:m[0],l:(nx&&m[0]===nx[0])?("NEXT · "+m[0]+" · "+m[1].toUpperCase()):(c>=m[0]?m[0]+" ✓":""),c:c>=m[0]?"#39FF88":(nx&&m[0]===nx[0]?"#ff4d6a":"#2a3244")};})});
}
function chartAtt(claims){
  var f=fighter(),cw=Math.max(1,CW()),pp=[{x:0,v:0}],sp=[{x:0,v:0}],tp=[{x:0,v:0}],cp=0,cs=0;
  for(var w=1;w<=cw;w++){for(var d=0;d<3;d++)if(attDone(w,d))cp++;[1,3].forEach(function(d2){var dt=iso(dayDate(w,d2));if(claims.indexOf("class:"+dt+":18:00")>=0)cs++;});pp.push({x:w,v:cp});sp.push({x:w,v:cs});}
  for(var k=1;k<=10;k++)tp.push({x:k,v:k*3});
  return lineChart([{pts:tp,c:"#8b96ad",dash:true},{pts:pp,c:"#2f7bff"},{pts:sp,c:"#ffffff"}],{max:30,ticks:[0,15,30]});
}
function ring(p,c){var r=18,C=2*Math.PI*r;p=Math.max(0,Math.min(1,p||0));return '<svg class="fcwRing" viewBox="0 0 44 44"><circle cx="22" cy="22" r="'+r+'" fill="none" stroke="#1e2a40" stroke-width="4"/><circle cx="22" cy="22" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="4" stroke-dasharray="'+(C*p)+' '+C+'" stroke-linecap="round" transform="rotate(-90 22 22)" style="filter:drop-shadow(0 0 4px '+c+')"/><text x="22" y="26" fill="#fff" font-size="11" font-weight="700" text-anchor="middle" font-family="Oswald,sans-serif">'+Math.round(p*100)+'%</text></svg>';}

/* ---------- pieces ---------- */
function tier(t){return t==="p"?'<span class="fcwTier p">Primary</span>':t==="r"?'<span class="fcwTier r">Highly recommended</span>':'<span class="fcwTier b">Bonus</span>';}
function ses(tHtml,n,s,t,btn){return '<div class="fcwS"><div class="t">'+tHtml+'</div><div class="n">'+tier(t)+'<b>'+n+'</b><span>'+s+'</span></div>'+btn+'</div>';}
function dayCard(w,i,cls,name,inner,doneOverride){
  var ti=todayIdx(w),dt=dayDate(w,i),done=doneOverride!=null?doneOverride:false;
  var st=done?'<span class="fcwSt done">Done ✓</span>':i===ti?'<span class="fcwSt today">Today</span>':(i<ti&&cls.indexOf("b")<0)?'<span class="fcwSt miss">Missed</span>':'';
  return '<div class="fcwDy '+cls+(i===ti?' today':'')+'"><div class="slash"></div><div class="in"><div class="lab"><b>'+name+'<small>'+fd(dt)+'</small></b>'+st+'</div>'+inner+'</div></div>';
}
function fcBtn(w,i,cls){ /* primary Fight Club night */
  var ti=todayIdx(w),dt=dayDate(w,i),past=i<=ti&&(i<ti||new Date().getHours()>=20),opened=w>=1&&CW()>=1;
  if(attDone(w,i))return '<button class="fcwB in" onclick="fcwAtt('+w+','+i+',false)">Trained ✓</button>';
  if(!opened)return '<button class="fcwB off">From '+fd(campStart())+'</button>';
  if(past)return '<button class="fcwB gh" onclick="fcwAtt('+w+','+i+',true)">I trained</button>';
  if(i===ti)return '<button class="fcwB '+cls+'" onclick="fcwAtt('+w+','+i+',true)">I\'m here</button>';
  return '<button class="fcwB off">Upcoming</button>';
}
function sncBtn(w,i){ /* Strength & Con class at 6pm: book via the timetable, claim the point after */
  var dt=dayDate(w,i),dIso=iso(dt),c=sncClass(dt);if(!c)return '<button class="fcwB off">No class</button>';
  var r=reg(dIso,c.t),past=new Date()>new Date(dIso+"T18:00:00");
  if(claimed(dIso,c.t))return '<button class="fcwB in">Trained ✓</button>';
  if(r&&past)return '<button class="fcwB r" onclick="fcwClaim(\''+dIso+'\',\''+c.t+'\')">I trained</button>';
  if(r)return '<button class="fcwB in" onclick="fcwUnbook(\''+dIso+'\',\''+c.t+'\',\''+encodeURIComponent(c.n)+'\')">Booked ✓</button>';
  var horizon=(typeof bookingHorizon==="function")?bookingHorizon():null;if(horizon&&dt>horizon)return '<button class="fcwB off">Opens '+(dt.getDay()===2||dt.getDay()===4?"Friday":"soon")+'</button>';
  return '<button class="fcwB r" onclick="fcwBook(\''+dIso+'\',\''+c.t+'\',\''+encodeURIComponent(c.n)+'\')">Book in</button>';
}
function satClassRows(w){
  var dt=dayDate(w,5),dIso=iso(dt),cls=satClasses(dt);if(!cls.length)return '<div class="fcwNote"><b>No classes Saturday.</b></div>';
  var horizon=(typeof bookingHorizon==="function")?bookingHorizon():null;
  return cls.map(function(c){var r=reg(dIso,c.t),done=claimed(dIso,c.t),past=new Date()>new Date(dIso+"T"+c.t+":00");
    var b=done?'<button class="fcwB in">Trained ✓</button>':(r&&past)?'<button class="fcwB gh" onclick="fcwClaim(\''+dIso+'\',\''+c.t+'\')">I trained</button>':r?'<button class="fcwB in" onclick="fcwUnbook(\''+dIso+'\',\''+c.t+'\',\''+encodeURIComponent(c.n)+'\')">Booked ✓</button>':(horizon&&dt>horizon)?'<button class="fcwB off">Opens Friday</button>':'<button class="fcwB gh" onclick="fcwBook(\''+dIso+'\',\''+c.t+'\',\''+encodeURIComponent(c.n)+'\')">Book in</button>';
    return ses(fmtT(c.t),E(c.n),"Any class counts",'b',b);}).join("");
}
function exWt(w,day){var v=wt(w,day);return '<button class="'+(v?'on':'')+'" onclick="fcwOpen(\'wt'+day+'\')"><i>Weigh-in<b>'+(v?v+' kg':'Before training')+'</b></i><em>'+(v?'Change':'Record')+'</em></button>';}
function exRun(w,i){var r=run3k(iso(dayDate(w,i))),b=bestRun(),s=runSecs(r);return '<button class="'+(r?'on':'')+'" onclick="fcwOpen(\'run'+i+'\')"><i>3 km for time<b>'+(r?mmss(s)+(b===s?' · best':''):'Any time today')+'</b></i><em>'+(r?'Change':'Log')+'</em></button>';}
function frm(w,i){
  var f=fighter(),last=wiAll().slice(-1)[0],b=bestRun();
  if(ST.open==="wt"+i)return '<div class="fcwFrm"><input id="fcwWtIn" type="number" step="0.1" inputmode="decimal" placeholder="'+(last?last.v:(f.weight_kg||""))+'"><span>kg</span><button class="fcwB p" onclick="fcwSaveWt('+w+','+i+')">Save</button></div>';
  if(ST.open==="run"+i)return '<div class="fcwFrm"><input id="fcwRunIn" type="text" inputmode="numeric" placeholder="'+(b?mmss(b):"14:30")+'"><span>mm:ss</span><button class="fcwB p" onclick="fcwSaveRun('+w+','+i+')">Save</button></div>';
  if(ST.open==="rounds"+i)return '<div class="fcwFrm"><div class="fcwSeg">'+[2,3,4,5,6].map(function(n){return '<button class="'+(ST.roundsN===n?"on":"")+'" onclick="fcwRoundsN('+n+')">'+n+'</button>';}).join("")+'</div><button class="fcwB sp" onclick="fcwSaveRounds('+w+','+i+')">Bank rounds</button></div>';
  return '';
}
function roundsBtn(w,i){var dIso=iso(dayDate(w,i)),n=roundsOn(dIso),ti=todayIdx(w);
  if(n)return '<button class="fcwB in" onclick="fcwOpen(\'rounds'+i+'\')">'+n+' rounds ✓</button>';
  if(i>ti)return '<button class="fcwB off">Upcoming</button>';
  return '<button class="fcwB sp" onclick="fcwOpen(\'rounds'+i+'\')">Log rounds</button>';}

/* ---------- screens ---------- */
function weekHtml(w){
  var f=fighter(),ti=todayIdx(w),sparSat=SPAR_SAT_WEEKS.indexOf(w)>=0,tech=w<sparOpenWeek();
  var h='';
  h+=dayCard(w,0,"p","Monday",ses("6:45<small>PM</small>","Tech &amp; drill sparring","Fight Club · all levels, split for rounds","p",fcBtn(w,0,"p"))+'<div class="fcwEx">'+exWt(w,0)+exRun(w,0)+'</div>'+frm(w,0),attDone(w,0));
  h+=dayCard(w,1,"p","Tuesday",ses("6:00<small>PM</small>","Strength &amp; Con","Grunt · lift first, box after","r",sncBtn(w,1))+ses("6:45<small>PM</small>","Skills &amp; drills","Fight Club · no sparring, so the double works","p",fcBtn(w,1,"p")),attDone(w,1));
  h+=dayCard(w,2,"p sp","Wednesday",ses("6:45<small>PM</small>","Open sparring + bag work","Fight Club · every ring live · headgear, 16oz"+(tech?" · technical until week "+sparOpenWeek():""),"p",roundsBtn(w,2))+'<div class="fcwEx">'+exRun(w,2)+'</div>'+frm(w,2),attDone(w,2)||roundsOn(iso(dayDate(w,2)))>0);
  h+=dayCard(w,3,"r","Thursday",ses("6:00<small>PM</small>","Strength &amp; Con","Grunt · the second lift is where the advantage is","r",sncBtn(w,3))+'<div class="fcwEx">'+exWt(w,3)+'</div>'+frm(w,3),claimed(iso(dayDate(w,3)),"18:00"));
  var sp=SPRINTS[Math.max(0,Math.min(9,w-1))],sd=sprintDone(w);
  h+=dayCard(w,4,"b","Friday",ses("Any","Sprints · week "+w,sp[0],"b",sd?'<button class="fcwB in" onclick="fcwSprint('+w+',false)">Done ✓</button>':'<button class="fcwB gh" onclick="fcwSprint('+w+',true)">Done</button>')+'<div class="fcwNote"><b>'+sp[0]+'.</b> '+sp[1]+' Warm up 10 min easy jog and drills first.</div>',sd);
  h+='<div class="fcwTwo">'+dayCard(w,5,"b","Saturday",satClassRows(w)+(sparSat?ses("9:30<small>AM</small>","Sparring","On this week · every second Saturday","b",roundsBtn(w,5))+(ST.open==="rounds5"?frm(w,5):''):'<div class="fcwNote"><b>No sparring.</b> Next is '+fd(dayDate(w+1,5))+', 9:30am.</div>'),roundsOn(iso(dayDate(w,5)))>0)
    +dayCard(w,6,"b","Sunday",'<div class="fcwNote"><b>Rest.</b> Feet up. Check your Progress.</div>')+'</div>';
  return h;
}
function progHtml(w,claims){
  var f=fighter(),cw=Math.max(1,CW()),prim=0,snc=0;for(var k=1;k<=cw;k++){for(var d=0;d<3;d++)if(attDone(k,d))prim++;[1,3].forEach(function(d2){if(claims.indexOf("class:"+iso(dayDate(k,d2))+":18:00")>=0)snc++;});}
  var rounds=roundsTotal(),lw=wiAll().slice(-1)[0],first=wiAll()[0],br=bestRun(),fr=runsAll()[0],spr=ST.sprints.length,tgt=f.fight_weight_kg?Number(f.fight_weight_kg):null,nx=MILES.find(function(m){return rounds<m[0];});
  var h='<div class="fcwTiles">'
   +'<div class="fcwTile p"><div class="k">Primary sessions</div><div class="v">'+prim+'<small>/ '+(cw*3)+'</small></div><div class="s">Mon Tue Wed 6:45pm · <b>'+Math.round(prim/(cw*3)*100)+'%</b> so far</div>'+ring(prim/(cw*3),"#2f7bff")+'</div>'
   +'<div class="fcwTile r"><div class="k">Strength &amp; Con</div><div class="v">'+snc+'<small>/ '+(cw*2)+'</small></div><div class="s">Tue Thu 6pm · the advantage</div>'+ring(snc/(cw*2),"#ffffff")+'</div></div><div class="fcwTiles three">'
   +'<div class="fcwTile"><div class="k">Sparring rounds</div><div class="v">'+rounds+'</div><div class="s">'+(nx?'Next unlock at '+nx[0]:'All unlocked')+'</div></div>'
   +'<div class="fcwTile"><div class="k">Best 3 km</div><div class="v">'+(br?mmss(br):'–')+'</div><div class="s">'+(br&&fr&&fr.s>br?'<b>'+mmss(fr.s-br)+' quicker</b>':'Run it Monday')+'</div></div>'
   +'<div class="fcwTile"><div class="k">Weight</div><div class="v">'+(lw?lw.v:'–')+'<small>kg</small></div><div class="s">'+(lw&&first&&first.v>lw.v?'<b>'+(first.v-lw.v).toFixed(1)+' kg down</b>':(tgt?'Target '+tgt:'Weigh in Monday'))+'</div></div></div>';
  h+='<div class="fcwSec"><b>Weight</b><span>Mon &amp; Thu weigh-ins · 10 weeks</span></div><div class="fcwCard"><div class="row"><h3>'+(lw?lw.v+' kg':'No weigh-in yet')+'</h3><span class="fcwTg">'+(lw&&tgt?(lw.v-tgt).toFixed(1)+' kg to target':tgt?'Target '+tgt+' kg':'Record Monday')+'</span></div>'+chartWt(f)+'</div>';
  h+='<div class="fcwSec"><b>3 km for time</b><span>Mon &amp; Wed · same route</span></div><div class="fcwCard"><div class="row"><h3>'+(br?'Best '+mmss(br):'No run yet')+'</h3><span class="fcwTg r">'+spr+' / 10 Friday sprints</span></div>'+chartRun()+'<p>Chase the time down. Friday sprints build the top end, the Mon and Wed runs show it.</p></div>';
  h+='<div class="fcwSec"><b>Sparring rounds</b><span>Banked over the camp</span></div><div class="fcwCard"><div class="row"><h3>'+rounds+' rounds banked</h3><span class="fcwTg r">'+(nx?(nx[0]-rounds)+' to '+nx[1].toLowerCase():'Every milestone hit')+'</span></div>'+chartRounds()+'</div>';
  h+='<div class="fcwSec"><b>Attendance</b><span>Blue primary · white S&amp;C · dashed is every session</span></div><div class="fcwCard"><div class="row"><h3>'+prim+' of '+(cw*3)+' primary</h3><span class="fcwTg">'+snc+' of '+(cw*2)+' S&amp;C</span></div>'+chartAtt(claims)+'<p>The dashed line is turning up to every primary session. <b>Stay on it.</b></p></div>';
  return h;
}
function headHtml(w){
  var f=fighter(),cw=CW(),days=Math.round((fightDate()-new Date())/864e5),prim=[0,1,2].filter(function(i){return attDone(w,i);}).length,snc=[1,3].filter(function(i){var d=iso(dayDate(w,i));return claimed(d,"18:00")||reg(d,"18:00");}).length,bon=(sprintDone(w)?1:0)+(roundsOn(iso(dayDate(w,5)))?1:0)+satClasses(dayDate(w,5)).filter(function(c){return claimed(iso(dayDate(w,5)),c.t);}).length;
  return '<div class="fcwHd"><div class="rw"></div><div class="row"><div><div class="k">Fight Club 2026 · '+phase(cw)+'</div><h2>'+(cw===0?'Starts <span>'+fd(campStart())+'</span>':'Week <span>'+w+'</span> of 10')+'</h2></div><div class="cd"><b>'+Math.max(0,days)+'</b><small>days to fight night</small></div></div>'
   +'<div class="fcwWk">'+[1,2,3,4,5,6,7,8,9,10].map(function(i){return '<div class="'+(i<cw?"done":i===cw?"now":"")+'"></div>';}).join("")+'</div>'
   +'<div class="fcwCnt"><div class="p"><b>'+prim+'<small>/3</small></b><span>Primary<br>Mon Tue Wed</span></div><div class="r"><b>'+snc+'<small>/2</small></b><span>Strength<br>Tue Thu</span></div><div class="b"><b>'+bon+'</b><span>Bonus<br>extra credit</span></div></div></div>'
   +'<div class="fcwVw"><button class="'+(ST.view==="week"?"on":"")+'" onclick="fcwView(\'week\')">My week</button><button class="'+(ST.view==="prog"?"on":"")+'" onclick="fcwView(\'prog\')">Progress</button></div>';
}

/* ---------- mount ---------- */
function active(){try{return view==="fc"&&!staff()&&!!fighter()&&(fc().tab==="camp"||fc().tab==="progress")&&fc().loaded;}catch(e){return false;}}
var painting=false;
async function paint(force){
  if(!active())return;
  var box=document.querySelector("#main .fcx");if(!box)return;
  if(box.querySelector("#fcw")&&!force)return;
  if(painting)return;painting=true;
  try{
    ST.view=fc().tab==="progress"?"prog":ST.view;
    var w=Math.max(1,Math.min(10,CW()));ST.wk=w;
    await loadExtras(w);
    if(!active())return;box=document.querySelector("#main .fcx");if(!box)return;
    var pills=box.querySelector(".pills");
    var wrap=box.querySelector("#fcw");if(!wrap){wrap=document.createElement("div");wrap.id="fcw";wrap.className="fcw";
      var n=pills?pills.nextSibling:null;while(n){var nx=n.nextSibling;n.parentNode.removeChild(n);n=nx;}
      (pills||box).insertAdjacentElement("afterend",wrap);}
    var claims=ST.view==="prog"?await claimsAll():ST.claims;
    wrap.innerHTML='<div data-fct="plan" class="fcwHide"></div><div data-fct="wt" class="fcwHide"></div>'+headHtml(w)+(ST.view==="prog"?progHtml(w,claims):weekHtml(w));
    var inp=document.getElementById("fcwWtIn")||document.getElementById("fcwRunIn");if(inp)try{inp.focus();}catch(e){}
  }catch(e){console.warn("fcweek",e);}
  painting=false;
}
function repaint(){paint(true);}

/* ---------- actions ---------- */
window.fcwView=function(v){ST.view=v;ST.open=null;try{window.FC.tab=v==="prog"?"progress":"camp";}catch(e){}repaint();try{window.scrollTo(0,0);}catch(e){}};
window.fcwOpen=function(k){ST.open=ST.open===k?null:k;repaint();};
window.fcwRoundsN=function(n){ST.roundsN=n;repaint();};
window.fcwAtt=async function(w,d,on){
  var f=fighter();if(!f)return;var cur=attRow(w,d);
  if(!on){if(cur){var del=await sb.from("fc_attendance").delete().eq("id",cur.id);if(del.error){T("Couldn't change that");return;}fc().att=fc().att.filter(function(x){return x.id!==cur.id;});}T("Removed");repaint();return;}
  var r=await sb.from("fc_attendance").upsert({camp:CAMP,fighter_id:f.id,week:w,day:d,attended:true,session_date:iso(dayDate(w,d)),logged_by:me()},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().att=(fc().att||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&x.day===d);});fc().att.push(r.data);T("Session banked ✓");repaint();
};
window.fcwBook=async function(date,time,name){name=decodeURIComponent(name);try{await attendClass(date,time,name);}catch(e){T("Couldn't book");}ST.extrasKey=null;await loadExtras(ST.wk);repaint();};
window.fcwUnbook=async function(date,time,name){name=decodeURIComponent(name);try{await unattendClass(date,time,name);}catch(e){T("Couldn't change that");}ST.extrasKey=null;await loadExtras(ST.wk);repaint();};
window.fcwClaim=async function(date,time){
  var r=await sb.from("points_events").upsert({user_id:me(),kind:"class",ref:"class:"+date+":"+time,points:1},{onConflict:"user_id,kind,ref",ignoreDuplicates:true});
  if(r.error){T("Couldn't submit · try again");return;}
  try{if(window.ptsData)ptsData.loaded=false;}catch(e){}
  ST.claims.push("class:"+date+":"+time);T("Class banked · 1 point on the board");repaint();
};
window.fcwSaveWt=async function(w,i){
  var f=fighter(),v=parseFloat((document.getElementById("fcwWtIn")||{}).value);if(!(v>30&&v<250)){T("Type your weight in kg");return;}
  var day=i===3?3:0;
  var r=await sb.from("fc_weighins").upsert({camp:CAMP,fighter_id:f.id,week:w,day:day,weight_kg:v},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().wi=(fc().wi||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&(x.day||0)===day);});fc().wi.push(r.data);ST.open=null;T(v+" kg recorded ✓");repaint();
};
window.fcwSaveRun=async function(w,i){
  var f=fighter(),txt=(document.getElementById("fcwRunIn")||{}).value,s=parseTime(txt);if(!s||s<300||s>3600){T("Time as mm:ss, e.g. 14:30");return;}
  var d=iso(dayDate(w,i)),old=run3k(d);
  if(old){await sb.from("fc_runs").delete().eq("id",old.id);fc().runs=fc().runs.filter(function(x){return x.id!==old.id;});}
  var r=await sb.from("fc_runs").insert({camp:CAMP,fighter_id:f.id,run_date:d,km:3,time_text:mmss(s)}).select().maybeSingle();
  if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().runs=(fc().runs||[]).concat([r.data]);ST.open=null;var b=bestRun();T("3 km · "+mmss(s)+(b===s?" · new best 🔥":" ✓"));repaint();
};
window.fcwSaveRounds=async function(w,i){
  var f=fighter(),d=iso(dayDate(w,i)),n=ST.roundsN,ex=(fc().rounds||[]).filter(function(r){return r.fighter_id===f.id&&r.night_date===d;});
  if(ex.some(function(r){return r.created_by!==me();})){T("Jake logged that night · ask him to change it");return;}
  if(ex.length){var del=await sb.from("fc_spar_rounds").delete().eq("fighter_id",f.id).eq("night_date",d);if(del.error){T("Couldn't replace that night");return;}fc().rounds=fc().rounds.filter(function(r){return !(r.fighter_id===f.id&&r.night_date===d);});}
  var lvl=w>=sparOpenWeek()?"Live":"Technical",rows=[];for(var k=1;k<=n;k++)rows.push({camp:CAMP,fighter_id:f.id,night_date:d,round_no:k,opponent_id:null,level:lvl,created_by:me()});
  var r=await sb.from("fc_spar_rounds").insert(rows).select();if(r.error){T("Couldn't save · "+r.error.message);return;}
  fc().rounds=(fc().rounds||[]).concat(r.data||[]);
  if(i===2)try{await sb.from("fc_attendance").upsert({camp:CAMP,fighter_id:f.id,week:w,day:2,attended:true,session_date:d,logged_by:me()},{onConflict:"camp,fighter_id,week,day"});fc().att=(fc().att||[]).filter(function(x){return !(x.fighter_id===f.id&&x.week===w&&x.day===2);});fc().att.push({fighter_id:f.id,week:w,day:2,attended:true});}catch(e){}
  ST.open=null;var tot=roundsTotal(),hit=MILES.find(function(m){return tot>=m[0]&&tot-n<m[0];});T(hit?tot+" rounds · "+hit[1]+" unlocked 🔥":n+" rounds banked ✓ ("+tot+" total)");repaint();
};
window.fcwSprint=async function(w,on){
  var f=fighter();if(on){var r=await sb.from("fc_sprints").insert({camp:CAMP,fighter_id:f.id,week:w}).select().maybeSingle();if(r.error&&!/duplicate|unique/i.test(r.error.message)){T("Couldn't save");return;}if(r.data)ST.sprints.push(r.data);else ST.sprints.push({week:w});T("Sprints done ✓");}
  else{await sb.from("fc_sprints").delete().eq("fighter_id",f.id).eq("camp",CAMP).eq("week",w);ST.sprints=ST.sprints.filter(function(s){return s.week!==w;});T("Removed");}
  repaint();
};

/* ---------- hooks ---------- */
["fcxSet"].forEach(function(fn){var o=window[fn];if(typeof o!=="function")return;window[fn]=function(k,v){if(k==="tab"&&(v==="camp"||v==="progress"))ST.view=v==="progress"?"prog":"week";var r=o.apply(this,arguments);try{paint();setTimeout(paint,60);}catch(e){}return r;};});
try{var mo=new MutationObserver(function(){try{paint();}catch(e){}});var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true});}catch(e){}
setInterval(function(){try{paint();}catch(e){}},1500);
})();
