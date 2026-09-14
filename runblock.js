/* Legacy Gym · running block add-on · 13 Sep 2026
   Sarsha's 4-week conditioning block (Mon run / Wed oval sprints / Fri run), assigned to more fighters.
   Lands in the Conditioning tab of "[Name]'s Training" (Boxing › Sparring Club). Logs go to fighter_sessions
   (section "con", block 1) — visible to the fighter and Jake only. */
(function(){
"use strict";
var UIDS={
 "3d4ab64d-24b1-450c-ad25-bad5a91fe789":"Jaxson",
 "e4d86ca0-b371-4e3d-a343-8603175b1034":"Ayrton",
 "43126c8e-efe2-484e-bd52-d05c55548b6d":"Sunnie",
 "40ee586b-3970-4961-9858-7c8ed91a8c76":"Arian"};
var BLOCK={n:1,label:"Block 1",weeks:4,start:"2026-09-14"};
/* his name is Sunnie, not Sonnie */
try{(TRAINING_TAB_FIGHTERS||[]).forEach(function(f){if(f.uid==="43126c8e-efe2-484e-bd52-d05c55548b6d")f.firstName="Sunnie";});}catch(e){}
var ROAD={
 1:{1:{h:"6 km comfortable",kind:"run",km:6,f:"Comfortable the whole way. Conversation pace — this is the base for the block."},
    3:{h:"Oval sprints · 8 × 100 m",kind:"sprint",reps:8,f:"8 × 100 m sprints with a 100 m jog between each. Time runs from the first sprint to the end of the last jog."},
    5:{h:"5 km — last 2 km strong",kind:"run",km:5,f:"Comfortable for 3 km, then lift for the last 2 km and hold it."}},
 2:{1:{h:"7 km comfortable",kind:"run",km:7,f:"One more kilometre than last week. Same comfortable pace."},
    3:{h:"Oval sprints · 10 × 100 m",kind:"sprint",reps:10,f:"10 × 100 m sprints, 100 m jog between each."},
    5:{h:"6 km — last 3 km strong",kind:"run",km:6,f:"Comfortable for 3 km, strong for the back 3 km."}},
 3:{1:{h:"8 km comfortable",kind:"run",km:8,f:"Longest run of the block. Comfortable — don't race it."},
    3:{h:"Oval sprints · 12 × 100 m",kind:"sprint",reps:12,f:"12 × 100 m sprints, 100 m jog between each. Peak sprint week."},
    5:{h:"6 km — last 4 km strong",kind:"run",km:6,f:"2 km comfortable, then 4 km strong. Hold the pace to the line."}},
 4:{1:{h:"6 km relaxed",kind:"run",km:6,f:"Relaxed. Legs fresh for Friday's benchmark."},
    3:{h:"Oval sprints · 8 × 100 m",kind:"sprint",reps:8,f:"Back to 8 × 100 m, 100 m jog between. Sharp, not smashed."},
    5:{h:"5 km hard benchmark",kind:"run",km:5,f:"All out. This is the number we measure the next block against."}}};
var DAYS=[1,3,5],DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ORDER=[1,2,3,4,5,6,0];
var RB={};
function me(){try{return (profile&&profile.id)||null;}catch(e){return null;}}
function isJake(){return me()==="15a011b9-e222-45f0-8eb9-d5338da935d1";}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function fmtT(t){t=Math.round(t||0);var h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0");}
function parseT(v){v=String(v||"").trim();if(!v)return 0;var p=v.split(":").map(function(x){return parseFloat(x)||0;});if(p.length===1)return Math.round(p[0]*60);if(p.length===2)return Math.round(p[0]*60+p[1]);return Math.round(p[0]*3600+p[1]*60+p[2]);}
function startMs(){return new Date(BLOCK.start+"T00:00:00").getTime();}
function curWeek(){return Math.min(BLOCK.weeks,Math.max(1,Math.floor((Date.now()-startMs())/6048e5)+1));}
function st(uid){if(!RB[uid])RB[uid]={week:curWeek(),day:null,logs:null,loading:false,err:null,editing:null};return RB[uid];}
function logFor(uid,w,d){return (st(uid).logs||[]).find(function(l){return l.section==="con"&&l.week===w&&l.weekday===d;})||null;}
function paceOf(sess,secs){return sess.kind==="run"?secs/sess.km:secs/sess.reps;}
function totalPts(uid){return (st(uid).logs||[]).reduce(function(a,l){return a+(l.points||0);},0);}
function sessDate(w,d){var x=new Date(startMs());x.setDate(x.getDate()+(w-1)*7+(d-1));return x;}
async function loadLogs(uid){
  var s=st(uid);if(s.loading)return;s.loading=true;
  try{var r=await sb.from("fighter_sessions").select("*").eq("user_id",uid).eq("block",BLOCK.n).eq("section","con").order("week").order("weekday");
    s.logs=r.error?[]:(r.data||[]);s.err=r.error?r.error.message:null;}catch(e){s.logs=[];s.err=String(e);}
  s.loading=false;rerender(uid);
}
function dayStrip(uid,w){
  var s=st(uid);
  return '<div class="week">'+ORDER.map(function(i){var has=DAYS.indexOf(i)>=0;var lg=has?logFor(uid,w,i):null;var dn=!!(lg&&lg.points>0);
    return '<div class="day '+(i===s.day?'on ':'')+(has?'has ':'')+(dn?'done':'')+'" '+(has?'onclick="rbDay(\''+uid+'\','+i+')"':'')+'>'+DN[i]+'<b>'+(has?(ROAD[w][i].kind==="sprint"?'⚡':'●'):'–')+'</b><div class="dots">'+(has?'<i class="dt me'+(dn?' ok':'')+'" style="--dc:var(--c)"></i>':'<i class="dt none"></i>')+'</div></div>';}).join("")+'</div>';
}
function panel(uid){
  var s=st(uid),first=UIDS[uid]||"Fighter",w=s.week,wk=ROAD[w],mine=me()===uid;
  if(s.day===null||!wk[s.day]){var today=new Date();var dow=today.getDay();
    if(Date.now()<startMs())s.day=1;else if(DAYS.indexOf(dow)>=0)s.day=dow;else if(dow===0||dow>5)s.day=5;else s.day=DAYS.filter(function(d){return d>=dow;})[0]||1;}
  var sess=wk[s.day],lg=logFor(uid,w,s.day),done=(s.logs||[]).filter(function(l){return l.points>0;}).length;
  var prev=w>1?logFor(uid,w-1,s.day):null,prevSess=w>1?ROAD[w-1][s.day]:null;
  var chips='<div class="wks">'+[1,2,3,4].map(function(n){var c=DAYS.filter(function(d){return logFor(uid,n,d);}).length;return '<button class="'+(n===w?'on':'')+'" onclick="rbWeek(\''+uid+'\','+n+')">Wk '+n+'<small>'+c+'/3'+(n===curWeek()?' · now':'')+'</small></button>';}).join("")+'</div>';
  var dt=sessDate(w,s.day);
  var meta='Week '+w+' · '+DN[s.day]+' '+dt.getDate()+' '+dt.toLocaleDateString("en-AU",{month:"short"})+(s.day===3?' · Oval':'')+' · '+(sess.kind==="run"?sess.km+' km':sess.reps+' × 100 m');
  var body;
  if(s.logs===null){body='<div class="focus"><b>Loading</b>Pulling up logged sessions…</div>';}
  else if(lg){var pace=lg.pace_secs?(sess.kind==="run"?fmtT(lg.pace_secs)+" /km":fmtT(lg.pace_secs)+" per rep"):"";
    body='<div class="donecard"><div class="dv">'+fmtT(lg.time_secs)+'</div><div class="dl">Done ✓ · '+pace+(lg.bonus?' · <span style="color:var(--gr)">beat last week</span>':'')+'</div><div class="pts">+'+lg.points+' pt'+(lg.points>1?'s':'')+(lg.bonus?' (incl. 3 bonus)':'')+'</div>'+(lg.notes?'<div class="nt2">“'+esc(lg.notes)+'”</div>':'')+(mine?'<button class="cta ghost" style="margin-top:10px" onclick="rbEdit(\''+uid+'\')">Edit time</button>':'')+'</div>';}
  else if(mine){var hint=sess.kind==="run"?"Total time for the "+sess.km+" km, e.g. 31:40":"First sprint to end of the last jog, e.g. 9:15";
    var target=prev&&prevSess?'<div class="target">Beat last week: <b>'+fmtT(paceOf(prevSess,prev.time_secs))+(sess.kind==="run"?" /km":" per rep")+'</b> → +3 bonus</div>':(w===1?'<div class="target">Week 1 sets your baseline · +3 bonus from week 2 when you beat it</div>':'<div class="target">Log last week’s '+DN[s.day]+' first to unlock the bonus</div>');
    body='<div class="logf"><label>Your time</label><input id="rbTime" inputmode="numeric" placeholder="'+hint+'"><label>Note for Jake (optional)</label><input id="rbNote" placeholder="How it felt, where you ran…">'+target+'<button class="cta" onclick="rbSubmit(\''+uid+'\')">Submit time · complete session</button></div>';}
  else{body='<div class="focus" style="animation:none"><b>Not logged yet</b>'+esc(first)+' hasn’t submitted a time for this session.</div>';}
  var hist=(s.logs||[]).slice().sort(function(a,b){return a.week-b.week||a.weekday-b.weekday;}).map(function(l){var ss=(ROAD[l.week]||{})[l.weekday];if(!ss)return "";var p=logFor(uid,l.week-1,l.weekday);var d=p&&p.pace_secs&&l.pace_secs?l.pace_secs-p.pace_secs:null;
    return '<div class="hrow"><div><b>Wk '+l.week+' · '+DN[l.weekday]+'</b> '+esc(ss.h)+'</div><div class="ht">'+fmtT(l.time_secs)+'<small>'+(ss.kind==="run"?fmtT(l.pace_secs)+"/km":fmtT(l.pace_secs)+"/rep")+(d!==null?' <i class="'+(d<0?'up':'dn')+'">'+(d<0?'▼':'▲')+' '+fmtT(Math.abs(d))+'</i>':'')+'</small><em>+'+l.points+'</em></div></div>';}).join("");
  var pre=Date.now()<startMs()?'<div class="focus" style="margin:0 0 10px"><b>Starts Monday '+new Date(startMs()).getDate()+' '+new Date(startMs()).toLocaleDateString("en-AU",{month:"short"})+'</b>Four weeks. Mon and Fri are road runs, Wed is oval sprints. Log your time after every session — Jake reads them.</div>':'';
  return '<div class="sp rbp" data-uid="'+uid+'" style="--c:#F1D27A">'+pre+
   '<div class="kpis"><div class="kpi"><div class="v">'+done+'<small>/12</small></div><div class="l">Sessions done</div></div><div class="kpi"><div class="v">'+totalPts(uid)+'</div><div class="l">Points</div></div><div class="kpi"><div class="v">Wk '+curWeek()+'</div><div class="l">Running block · 4 wk</div></div></div>'+
   '<div class="when">Mon · Wed · Fri — <b>your own time</b>, log it the same day</div>'+chips+dayStrip(uid,w)+
   '<div class="sess"><h3>'+esc(sess.h)+'</h3><div class="meta">'+meta+'</div><div class="focus"><b>Jake’s focus</b>'+esc(sess.f)+'</div>'+body+'</div>'+
   '<div class="rules">1 point per completed session · 3 bonus points when you beat last week’s pace on the same day · 12 sessions in the block</div>'+
   (hist?'<div class="secT">Completed sessions</div><div class="hist">'+hist+'</div>':'')+
   (s.err?'<div class="rules" style="color:#f06a5e">Couldn’t load logs: '+esc(s.err)+'</div>':'')+
   '<div class="lock"><span style="font-size:18px">🔒</span><div><b>Times &amp; notes</b> — visible to '+esc(first)+' and Jake only. Nothing here goes to the gym feed or leaderboards.</div></div></div>';
}
function rerender(uid){var el=document.querySelector('.rbp[data-uid="'+uid+'"]');if(el)el.outerHTML=panel(uid);else patch();try{if(view==="home"){var h=document.querySelector(".rbHome");if(h)h.remove();homeRow();}}catch(e){}}
function patch(){
  Object.keys(UIDS).forEach(function(uid){
    var el=document.getElementById("tt-"+uid);if(!el)return;
    var tabs=el.querySelectorAll(".tabs button");
    tabs.forEach(function(b){if(/^Conditioning/i.test(b.textContent)){var sm=b.querySelector("small");if(sm&&sm.textContent!=="Running block · 4 wk")sm.textContent="Running block · 4 wk";}});
    var on=el.querySelector(".tabs button.on");if(!on||!/^Conditioning/i.test(on.textContent))return;
    var ftp=el.querySelector(".ftp");if(!ftp||ftp.querySelector(".rbp"))return;
    var ph=Array.prototype.find.call(ftp.querySelectorAll(".focus"),function(f){return /Conditioning/.test(f.textContent)&&/Block 1/.test(f.textContent);});
    var w=document.createElement("div");w.innerHTML=panel(uid);var node=w.firstChild;
    if(ph)ph.replaceWith(node);else ftp.insertBefore(node,ftp.firstChild);
    if(st(uid).logs===null)loadLogs(uid);
  });
}
window.rbWeek=function(uid,n){var s=st(uid);s.week=n;s.day=null;rerender(uid);};
window.rbDay=function(uid,i){st(uid).day=i;rerender(uid);};
window.rbEdit=function(uid){var s=st(uid);var l=logFor(uid,s.week,s.day);if(!l)return;s.logs=s.logs.filter(function(x){return x!==l;});s.editing=l;rerender(uid);var i=document.getElementById("rbTime");if(i)i.value=fmtT(l.time_secs);var n=document.getElementById("rbNote");if(n)n.value=l.notes||"";};
window.rbSubmit=async function(uid){
  if(me()!==uid){toast("Only "+(UIDS[uid]||"the fighter")+" can log this session");return;}
  var s=st(uid);var secs=parseT((document.getElementById("rbTime")||{}).value);if(!secs||secs<30){toast("Enter your time as mm:ss");return;}
  var w=s.week,d=s.day,sess=ROAD[w][d],pace=paceOf(sess,secs);
  var prev=w>1?logFor(uid,w-1,d):null;var bonus=!!(prev&&prev.pace_secs&&pace<prev.pace_secs);
  var row={user_id:uid,section:"con",block:BLOCK.n,week:w,weekday:d,title:sess.h,distance_km:sess.kind==="run"?sess.km:null,reps:sess.kind==="sprint"?sess.reps:null,time_secs:secs,pace_secs:Math.round(pace*100)/100,notes:((document.getElementById("rbNote")||{}).value||"").slice(0,300)||null,points:1+(bonus?3:0),bonus:bonus};
  var r=await sb.from("fighter_sessions").upsert(row,{onConflict:"user_id,section,block,week,weekday"}).select().single();
  if(r.error){toast(r.error.message);return;}
  s.logs=(s.logs||[]).filter(function(x){return !(x.week===w&&x.weekday===d);}).concat([r.data]);s.editing=null;
  rerender(uid);toast(bonus?"Saved · +4 points — you beat last week 🔥":"Saved · +1 point ✓");
};
/* hook: whenever the training tab (re)draws, drop the block in */
["renderMiaTrainTabs","ttRender","ttGo"].forEach(function(fn){var o=window[fn];if(typeof o!=="function")return;window[fn]=function(){var r=o.apply(this,arguments);try{patch();setTimeout(patch,50);}catch(e){}return r;};});
try{var mo=new MutationObserver(function(){try{patch();}catch(e){}});var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true,subtree:true});}catch(e){}

/* home row for the four fighters: this week's sessions, one tap to the block */
var css=document.createElement("style");css.textContent=".rbHome{width:100%;text-align:left;display:flex;align-items:center;gap:12px;border-radius:14px;padding:13px 16px;margin:0 0 16px;cursor:pointer;border:2px solid var(--gold);background:linear-gradient(160deg,#1e1809,#0b0a08);color:var(--text);animation:smFlash 1.4s ease-in-out infinite}.rbHome .k{font-size:9.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold)}.rbHome .t{font-family:Oswald,sans-serif;font-weight:700;font-size:18px;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;color:#fff}.rbHome .s{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4}.rbHome .a{margin-left:auto;font-size:22px;color:var(--gold);flex:none}@media (prefers-reduced-motion:reduce){.rbHome{animation:none}}";document.head.appendChild(css);
window.rbOpen=function(){try{boxSub="sparring";sparTab="training";go("boxing");}catch(e){go("boxing");}};
function homeRow(){
  var uid=me();if(!uid||!UIDS[uid])return;var m=document.getElementById("main");if(!m||view!=="home"||m.querySelector(".rbHome"))return;
  var w=curWeek(),wk=ROAD[w];var dow=new Date().getDay();var next=Date.now()<startMs()?1:(DAYS.filter(function(d){return d>=dow;})[0]||1);var sess=wk[next];
  var done=DAYS.filter(function(d){return logFor(uid,w,d);}).length;
  var b=document.createElement("button");b.className="rbHome";b.setAttribute("onclick","rbOpen()");
  b.innerHTML='<span><div class="k">Running block · week '+w+' of 4</div><div class="t">'+(Date.now()<startMs()?'Starts Monday':'Next: '+DN[next])+' · '+esc(sess.h)+'</div><div class="s">Mon run · Wed oval sprints · Fri run — '+done+'/3 logged this week. Tap to open and log your time.</div></span><span class="a">›</span>';
  var anchor=m.querySelector(".homeWelcome");if(anchor)anchor.insertAdjacentElement("beforebegin",b);else m.insertBefore(b,m.firstChild);
  if(st(uid).logs===null)loadLogs(uid);
}
var _rh=window.renderHome;window.renderHome=function(){var r=_rh.apply(this,arguments);try{homeRow();setTimeout(homeRow,80);}catch(e){}return r;};
try{if(view==="home")homeRow();}catch(e){}
})();

/* ---------- Coach-written rounds: named rounds that aren't in the Build Your Own library.
   Programs in fighter_programs reference these ids; the workload card and the round timer resolve them here. ---------- */
(function(){
"use strict";
var C={
 ay1:{id:"ay1",n:"Jab to the head",tag:"Bag · single jabs · clean lead hand"},
 ay2:{id:"ay2",n:"Jab to the chest",tag:"Bag · single jabs · hand doesn’t wander"},
 ay3:{id:"ay3",n:"Jab — head and chest",tag:"Bag · mix the targets, same position"},
 ay4:{id:"ay4",n:"Speed of the jab",tag:"Bag · fast out, fast back"},
 ay5:{id:"ay5",n:"Jabs + straight back hand",tag:"Bag · 3 jabs to 1 back hand"},
 ay6:{id:"ay6",n:"Floor-to-ceiling ball · jabs",tag:"Timing and hand position"},
 ay7:{id:"ay7",n:"High-volume jabs · wrecking ball",tag:"Volume — elbows in, hand home"},
 aySlip1:{id:"aySlip1",n:"Slip line · round 1",tag:"5:00 · arm & foot defence, controlled head and trunk",fixed:300},
 aySlip2:{id:"aySlip2",n:"Slip line · round 2",tag:"5:00 · clean punches, no big leans or pulls",fixed:300},
 mpSlip1:{id:"mpSlip1",n:"Double slip line · defence only",tag:"Head and foot defence — no punches"},
 mpSlip2:{id:"mpSlip2",n:"Double slip line · defence only",tag:"Same again — clean, controlled, no punches"},
 mpSlip3:{id:"mpSlip3",n:"Double slip line · straight punches",tag:"Straights with the same defensive actions"},
 mpSlip4:{id:"mpSlip4",n:"Double slip line · straight punches",tag:"Same again — hold the structure"},
 mpSlip5:{id:"mpSlip5",n:"Double slip line · open",tag:"Any punches you like on the line"},
 mpSpeed:{id:"mpSpeed",n:"Speedball",tag:"Rhythm and hand speed"},
 mpFtc:{id:"mpFtc",n:"Floor-to-ceiling ball",tag:"Timing, accuracy, hands home"},
 mpWreck:{id:"mpWreck",n:"Wrecking ball",tag:"Footwork · defence · second-phase attacks"},
 ayShadow10:{id:"ayShadow10",n:"Shadow boxing · mirror",tag:"10 minutes straight · hand position, head and trunk control",fixed:600},
 ayFore:{id:"ayFore",n:"Forefoot bag · straight punches",tag:"Straights only — stay on the forefoot"},
 ayCombo:{id:"ayCombo",n:"Build combinations",tag:"Set them up off the straights"},
 ayLevel:{id:"ayLevel",n:"Level changes",tag:"Change levels, stay covered"},
 ayOpen:{id:"ayOpen",n:"Open round",tag:"Put it together"},
 suShadow10:{id:"suShadow10",n:"Shadow boxing · mirror",tag:"10 minutes straight · combinations off the straights",fixed:600},
 suFore:{id:"suFore",n:"Forefoot bag · straight shots",tag:"Straights only — stay on the forefoot"},
 suCombo:{id:"suCombo",n:"Build combinations · 3, 4 and 5 punches",tag:"All off the straight shots"},
 suInside:{id:"suInside",n:"Bent-arm punches on the inside",tag:"Stay in range — don’t break range"},
 suOpen:{id:"suOpen",n:"Open round",tag:"Put everything together"},
 suRing10:{id:"suRing10",n:"Shadow boxing · in the ring",tag:"10 minutes straight · ring position and angles",fixed:600},
 suWallStr:{id:"suWallStr",n:"Wall bag · level changes + straights",tag:"Drop the level, straight shots"},
 suWallBent:{id:"suWallBent",n:"Wall bag · level changes + bent arm",tag:"Straight and bent-arm punches"},
 suWallOpen:{id:"suWallOpen",n:"Wall bag · open round",tag:"Everything, off the level change"},
 suFtcJab:{id:"suFtcJab",n:"Floor-to-ceiling ball · jab only",tag:"Timing on the jab"},
 suFtcStr:{id:"suFtcStr",n:"Floor-to-ceiling ball · straight shots",tag:"Straights, hands home"},
 suFtcOpen:{id:"suFtcOpen",n:"Floor-to-ceiling ball · open",tag:"Open work on the ball"},
 jkRing10:{id:"jkRing10",n:"Open shadow · ring control",tag:"10 minutes straight at 50% — never touch the ropes or a corner. Straights building the combinations, two-phase attacks, catch and counter.",fixed:600},
 jkAngle:{id:"jkAngle",n:"Shadow · angles only",tag:"Create the angle, find the attack off it. Nothing else."},
 jkBack1:{id:"jkBack1",n:"Back-foot boxing · 30 m",tag:"Downstairs — jabbing on the back foot"},
 jkBack2:{id:"jkBack2",n:"Back-foot boxing · 30 m",tag:"Jab on the back foot, angle off with the counter, straight back onto the back foot"},
 jkFtc:{id:"jkFtc",n:"Floor-to-ceiling ball",tag:"Speed and combinations"},
 jkSpeed:{id:"jkSpeed",n:"Speedball",tag:"Rhythm and hand speed"},
 jkDead:{id:"jkDead",n:"Dead ball in the air · shadow on the back foot",tag:"Throw it up, box on the back foot while it’s in the air"}
};
/* ---- Section colour coding on every fighter's training block (.ft = Boxing / Conditioning / Strength).
   Sarsha's block renders as .sp, not .ft, so hers is untouched. Mia gets her own scheme. ---- */
var MIA_UID="154f7fe0-401c-4076-8074-ad1c9a7502e3";
var scss=document.createElement("style");scss.textContent=
 ".ft .tabs button{--bgc:transparent;--txt:var(--c);background:var(--bgc);color:var(--txt);border:1.5px solid var(--c);opacity:.72;animation:none}"+
 ".ft .tabs button small{color:var(--txt);opacity:.75}"+
 ".ft .tabs button.on{opacity:1;border-width:2.5px;box-shadow:0 0 0 2px color-mix(in srgb,var(--c) 28%,transparent)}"+
 ".ft .tabs button.on small{opacity:.95}"+
 ".ft .tabs button:nth-child(1){--c:#4bc97a}"+
 ".ft .tabs button:nth-child(2){--c:#ff5247}"+
 ".ft .tabs button:nth-child(3){--c:#4a9cff}"+
 "#tt-"+MIA_UID+" .tabs button:nth-child(1){--c:#ffffff;--bgc:#000000;--txt:#ffffff}"+
 "#tt-"+MIA_UID+" .tabs button:nth-child(2){--c:#ff4fc4;--bgc:#ff4fc4;--txt:#ffffff}"+
 "#tt-"+MIA_UID+" .tabs button:nth-child(3){--c:#ff4fc4;--bgc:#000000;--txt:#ff4fc4}";
document.head.appendChild(scss);
var _bf=window.byoFind;
window.byoFind=function(id){return C[id]||(_bf?_bf.apply(this,arguments):null);};
})();
