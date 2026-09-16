/* Legacy Gym · Mia's sprint block · 16 Sep 2026
   Sarsha's Wednesday oval sprints (8 / 10 / 12 / 8 × 100 m over four weeks) assigned to Mia on Thursdays,
   with a clearer protocol (100 m sprint → 2:00 recovery that starts as she jogs back) and a time for every sprint.
   Lands in the Conditioning tab of "Mia's Training". Logs go to fighter_sessions (section "con", block 1,
   weekday 4) with data.splits = [seconds per sprint] — visible to Mia and Jake only. */
(function(){
"use strict";
var UID="154f7fe0-401c-4076-8074-ad1c9a7502e3", FIRST="Mia", JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
var BLOCK={n:1,weeks:4,start:"2026-09-14"};   /* Monday of week 1 · Thursdays = 17 Sep, 24 Sep, 1 Oct, 8 Oct */
var DAY=4;
var PROTO="Sprint 100 m flat out. Then 2 minutes recovery — the 2 minutes starts the moment you start jogging back to the start line. Slow jog back, then walk or stand for whatever is left. When the 2 minutes is up, go again.";
var WK={
 1:{h:"Oval sprints · 8 × 100 m",reps:8,f:"Week 1 sets your baseline. Every sprint is timed — start the clock when you go, stop it as you cross 100 m. Even effort across all eight is the goal."},
 2:{h:"Oval sprints · 10 × 100 m",reps:10,f:"Two more sprints than last week. Same protocol, same 2-minute recovery. Aim to hold your week-1 times all the way through."},
 3:{h:"Oval sprints · 12 × 100 m",reps:12,f:"Peak sprint week. Twelve sprints — the last four are where it counts. Don't let the recovery stretch past 2 minutes."},
 4:{h:"Oval sprints · 8 × 100 m",reps:8,f:"Back to eight. Sharp, not smashed — this is where you should see your fastest times of the block."}};
var DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ORDER=[1,2,3,4,5,6,0];
var S={week:null,logs:null,loading:false,err:null,editing:null};
function me(){try{return (profile&&profile.id)||null;}catch(e){return null;}}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function fmtS(t){t=Math.round((t||0)*10)/10;var m=Math.floor(t/60),s=Math.round((t-m*60)*10)/10;return m+":"+(s<10?"0":"")+s.toFixed(1);}
function fmtT(t){t=Math.round(t||0);var m=Math.floor(t/60),s=t%60;return m+":"+String(s).padStart(2,"0");}
function startMs(){return new Date(BLOCK.start+"T00:00:00").getTime();}
function curWeek(){return Math.min(BLOCK.weeks,Math.max(1,Math.floor((Date.now()-startMs())/6048e5)+1));}
function sessDate(w){var x=new Date(startMs());x.setDate(x.getDate()+(w-1)*7+(DAY-1));return x;}
function week(){if(S.week===null)S.week=curWeek();return S.week;}
function logFor(w){return (S.logs||[]).find(function(l){return l.section==="con"&&l.week===w&&l.weekday===DAY;})||null;}
function splitsOf(l){var a=(l&&l.data&&l.data.splits)||[];return a.map(Number).filter(function(x){return x>0;});}
function avgOf(l){var a=splitsOf(l);if(!a.length)return l&&l.pace_secs?Number(l.pace_secs):0;return a.reduce(function(x,y){return x+y;},0)/a.length;}
function bestOf(l){var a=splitsOf(l);return a.length?Math.min.apply(null,a):0;}
function totalPts(){return (S.logs||[]).reduce(function(a,l){return a+(l.points||0);},0);}
async function loadLogs(){
  if(S.loading)return;S.loading=true;
  try{var r=await sb.from("fighter_sessions").select("*").eq("user_id",UID).eq("block",BLOCK.n).eq("section","con").eq("weekday",DAY).order("week");
    S.logs=r.error?[]:(r.data||[]);S.err=r.error?r.error.message:null;}catch(e){S.logs=[];S.err=String(e);}
  S.loading=false;rerender();
}
var css=document.createElement("style");css.textContent=
 ".mspb .proto{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:stretch;margin:10px 0 4px}"+
 ".mspb .proto div{border:1.5px solid var(--c);border-radius:12px;padding:10px 8px;text-align:center;background:color-mix(in srgb,var(--c) 8%,var(--panel))}"+
 ".mspb .proto div b{display:block;font-family:Oswald,sans-serif;font-size:22px;color:var(--c);line-height:1}"+
 ".mspb .proto div span{display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);margin-top:4px}"+
 ".mspb .proto em{display:flex;align-items:center;justify-content:center;font-style:normal;color:var(--c);font-size:22px}"+
 ".mspb .rep{font-size:11.5px;color:var(--muted);text-align:center;margin-bottom:6px}.mspb .rep b{color:#fff}"+
 ".mspb .splits{display:grid;gap:6px;margin-top:8px}"+
 ".mspb .sr{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}"+
 ".mspb .sr .lb{font-family:Oswald,sans-serif;font-size:15px;color:#fff;letter-spacing:.5px}.mspb .sr .lb small{display:block;font-family:Montserrat,sans-serif;font-size:10.5px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:1px}"+
 ".mspb .sr .tm{display:flex;align-items:center;gap:4px}.mspb .sr .tm input{width:58px;padding:9px 6px;border-radius:9px;border:1px solid var(--line);background:#0b0b0c;color:#fff;font-family:Oswald,sans-serif;font-size:18px;text-align:center}"+
 ".mspb .sr .tm input:focus{border-color:var(--c);outline:none}.mspb .sr .tm i{font-style:normal;color:var(--muted);font-family:Oswald,sans-serif;font-size:18px}"+
 ".mspb .sr .tm label{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);display:block;text-align:center;margin-top:2px}"+
 ".mspb .sr.done .lb{color:var(--muted)}.mspb .sr .val{font-family:Oswald,sans-serif;font-size:20px;color:var(--c)}.mspb .sr .val.best{color:var(--gr)}"+
 ".mspb .sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.mspb .sum div{border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center;background:var(--panel)}"+
 ".mspb .sum b{display:block;font-family:Oswald,sans-serif;font-size:22px;color:#fff}.mspb .sum span{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted)}"+
 ".mspHome{width:100%;text-align:left;display:flex;align-items:center;gap:12px;border-radius:14px;padding:13px 16px;margin:0 0 16px;cursor:pointer;border:2px solid var(--gold);background:linear-gradient(160deg,#1e1809,#0b0a08);color:var(--text);animation:smFlash 1.4s ease-in-out infinite}"+
 ".mspHome .k{font-size:9.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold)}.mspHome .t{font-family:Oswald,sans-serif;font-weight:700;font-size:18px;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;color:#fff}.mspHome .s{font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4}.mspHome .a{margin-left:auto;font-size:22px;color:var(--gold);flex:none}"+
 "@media (prefers-reduced-motion:reduce){.mspHome{animation:none}}";
document.head.appendChild(css);

function dayStrip(w){
  var lg=logFor(w),dn=!!(lg&&lg.points>0);
  return '<div class="week">'+ORDER.map(function(i){var has=i===DAY;
    return '<div class="day '+(has?'on has ':'')+(dn&&has?'done':'')+'">'+DN[i]+'<b>'+(has?'⚡':'–')+'</b><div class="dots">'+(has?'<i class="dt me'+(dn?' ok':'')+'" style="--dc:var(--c)"></i>':'<i class="dt none"></i>')+'</div></div>';}).join("")+'</div>';
}
function splitRows(n,vals){
  var out="";for(var i=0;i<n;i++){var v=vals&&vals[i]?vals[i]:null;var mm=v?Math.floor(v/60):"",ss=v?Math.round((v-Math.floor(v/60)*60)*10)/10:"";
    out+='<div class="sr"><div class="lb">Sprint '+(i+1)+'<small>100 m</small></div><div class="tm"><span><input id="mspM'+i+'" inputmode="numeric" placeholder="0" value="'+mm+'"><label>min</label></span><i>:</i><span><input id="mspS'+i+'" inputmode="decimal" placeholder="00" value="'+ss+'"><label>sec</label></span></div></div>';}
  return out;
}
function readSplits(n){var a=[];for(var i=0;i<n;i++){var m=parseFloat((document.getElementById("mspM"+i)||{}).value)||0,s=parseFloat((document.getElementById("mspS"+i)||{}).value)||0;var t=m*60+s;a.push(t>0?Math.round(t*10)/10:0);}return a;}
function panel(){
  var w=week(),sess=WK[w],lg=logFor(w),mine=me()===UID,done=(S.logs||[]).filter(function(l){return l.points>0;}).length;
  var prev=w>1?logFor(w-1):null,prevAvg=prev?avgOf(prev):0;
  var chips='<div class="wks">'+[1,2,3,4].map(function(n){var c=logFor(n)?1:0;return '<button class="'+(n===w?'on':'')+'" onclick="mspWeek('+n+')">Wk '+n+'<small>'+c+'/1'+(n===curWeek()?' · now':'')+'</small></button>';}).join("")+'</div>';
  var dt=sessDate(w);
  var meta='Week '+w+' · Thu '+dt.getDate()+' '+dt.toLocaleDateString("en-AU",{month:"short"})+' · Oval · '+sess.reps+' × 100 m · 2:00 recovery';
  var proto='<div class="proto"><div><b>100 m</b><span>Sprint</span></div><em>→</em><div><b>2:00</b><span>Recovery · jog back</span></div></div><div class="rep">Repeat <b>'+sess.reps+' times</b> · recovery clock starts as you turn to jog back</div>';
  var body;
  if(S.logs===null){body='<div class="focus"><b>Loading</b>Pulling up logged sessions…</div>';}
  else if(lg){var sp=splitsOf(lg),best=bestOf(lg),avg=avgOf(lg);
    var rows=sp.map(function(v,i){return '<div class="sr done"><div class="lb">Sprint '+(i+1)+'<small>100 m</small></div><div class="val'+(v===best?' best':'')+'">'+fmtS(v)+'</div></div>';}).join("");
    body='<div class="donecard"><div class="dv">'+fmtS(avg)+'</div><div class="dl">Done ✓ · average per 100 m'+(lg.bonus?' · <span style="color:var(--gr)">beat last week</span>':'')+'</div><div class="pts">+'+lg.points+' pt'+(lg.points>1?'s':'')+(lg.bonus?' (incl. 3 bonus)':'')+'</div>'+(lg.notes?'<div class="nt2">“'+esc(lg.notes)+'”</div>':'')+'</div>'+
      '<div class="sum"><div><b>'+sp.length+'</b><span>Sprints</span></div><div><b>'+fmtS(best)+'</b><span>Fastest</span></div><div><b>'+fmtS(avg)+'</b><span>Average</span></div></div>'+
      (rows?'<div class="splits">'+rows+'</div>':'')+(mine?'<button class="cta ghost" style="margin-top:10px" onclick="mspEdit()">Edit times</button>':'');}
  else if(mine){
    var target=prev&&prevAvg?'<div class="target">Beat last week’s average: <b>'+fmtS(prevAvg)+' per 100 m</b> → +3 bonus</div>':(w===1?'<div class="target">Week 1 sets your baseline · +3 bonus from week 2 when your average beats it</div>':'<div class="target">Log last week’s Thursday first to unlock the bonus</div>');
    body='<div class="logf"><label>Your sprint times — minutes and seconds for each 100 m</label><div class="splits">'+splitRows(sess.reps,S.editing?splitsOf(S.editing):null)+'</div>'+
      '<label style="margin-top:10px">Note for Jake (optional)</label><input id="mspNote" placeholder="How it felt, conditions, anything sore…" value="'+esc(S.editing?S.editing.notes||"":"")+'">'+target+
      '<button class="cta" onclick="mspSubmit()">Save sprint times · complete session</button></div>';}
  else{body='<div class="focus" style="animation:none"><b>Not logged yet</b>'+FIRST+' hasn’t entered her sprint times for this session.</div>';}
  var hist=(S.logs||[]).slice().sort(function(a,b){return a.week-b.week;}).map(function(l){var ss=WK[l.week];if(!ss)return "";var p=logFor(l.week-1);var d=p?avgOf(l)-avgOf(p):null;
    return '<div class="hrow"><div><b>Wk '+l.week+' · Thu</b> '+esc(ss.h)+'</div><div class="ht">'+fmtS(avgOf(l))+'<small>avg per 100 m · best '+fmtS(bestOf(l))+(d!==null?' <i class="'+(d<0?'up':'dn')+'">'+(d<0?'▼':'▲')+' '+fmtS(Math.abs(d))+'</i>':'')+'</small><em>+'+l.points+'</em></div></div>';}).join("");
  var pre=Date.now()<startMs()?'<div class="focus" style="margin:0 0 10px"><b>Starts Thursday '+sessDate(1).getDate()+' '+sessDate(1).toLocaleDateString("en-AU",{month:"short"})+'</b>Four Thursdays. Oval sprints, every sprint timed — Jake reads them.</div>':'';
  return '<div class="sp mspb" style="--c:#F1D27A">'+pre+
   '<div class="kpis"><div class="kpi"><div class="v">'+done+'<small>/4</small></div><div class="l">Sessions done</div></div><div class="kpi"><div class="v">'+totalPts()+'</div><div class="l">Points</div></div><div class="kpi"><div class="v">Wk '+curWeek()+'</div><div class="l">Sprint block · 4 wk</div></div></div>'+
   '<div class="when">Thursdays — <b>your own time</b>, log every sprint the same day</div>'+chips+dayStrip(w)+
   '<div class="sess"><h3>'+esc(sess.h)+'</h3><div class="meta">'+meta+'</div>'+proto+'<div class="focus"><b>The protocol</b>'+esc(PROTO)+'</div><div class="focus"><b>Jake’s focus</b>'+esc(sess.f)+'</div>'+body+'</div>'+
   '<div class="rules">1 point per completed session · 3 bonus points when your average 100 m beats last week · 4 sessions in the block</div>'+
   (hist?'<div class="secT">Completed sessions</div><div class="hist">'+hist+'</div>':'')+
   (S.err?'<div class="rules" style="color:#f06a5e">Couldn’t load logs: '+esc(S.err)+'</div>':'')+
   '<div class="lock"><span style="font-size:18px">🔒</span><div><b>Times &amp; notes</b> — visible to '+FIRST+' and Jake only. Nothing here goes to the gym feed or leaderboards.</div></div></div>';
}
function rerender(){var el=document.querySelector('.mspb');if(el)el.outerHTML=panel();else patch();try{if(view==="home"){var h=document.querySelector(".mspHome");if(h)h.remove();homeRow();}}catch(e){}}
function patch(){
  var el=document.getElementById("tt-"+UID);if(!el)return;
  el.querySelectorAll(".tabs button").forEach(function(b){if(/^Conditioning/i.test(b.textContent)){var sm=b.querySelector("small");if(sm&&sm.textContent!=="Sprint block · 4 wk")sm.textContent="Sprint block · 4 wk";}});
  var on=el.querySelector(".tabs button.on");if(!on||!/^Conditioning/i.test(on.textContent))return;
  var ftp=el.querySelector(".ftp");if(!ftp||ftp.querySelector(".mspb"))return;
  var ph=Array.prototype.find.call(ftp.querySelectorAll(".focus"),function(f){return /Conditioning/.test(f.textContent)&&/Block 1/.test(f.textContent);});
  var w=document.createElement("div");w.innerHTML=panel();var node=w.firstChild;
  if(ph)ph.replaceWith(node);else ftp.insertBefore(node,ftp.firstChild);
  if(S.logs===null)loadLogs();
}
window.mspWeek=function(n){S.week=n;S.editing=null;rerender();};
window.mspEdit=function(){var l=logFor(week());if(!l)return;S.logs=S.logs.filter(function(x){return x!==l;});S.editing=l;rerender();};
window.mspSubmit=async function(){
  if(me()!==UID){toast("Only "+FIRST+" can log this session");return;}
  var w=week(),sess=WK[w],sp=readSplits(sess.reps);
  var filled=sp.filter(function(x){return x>0;});
  if(filled.length<sess.reps){toast("Enter a time for all "+sess.reps+" sprints ("+filled.length+" of "+sess.reps+" so far)");return;}
  if(filled.some(function(x){return x<8||x>120;})){toast("Check your times — each 100 m should be between 0:08 and 2:00");return;}
  var total=sp.reduce(function(a,b){return a+b;},0),avg=total/sp.length;
  var prev=w>1?logFor(w-1):null;var bonus=!!(prev&&avgOf(prev)&&avg<avgOf(prev));
  var row={user_id:UID,section:"con",block:BLOCK.n,week:w,weekday:DAY,title:sess.h,distance_km:null,reps:sess.reps,time_secs:Math.round(total),pace_secs:Math.round(avg*100)/100,notes:((document.getElementById("mspNote")||{}).value||"").slice(0,300)||null,points:1+(bonus?3:0),bonus:bonus,data:{splits:sp,distance_m:100,recovery_secs:120}};
  var r=await sb.from("fighter_sessions").upsert(row,{onConflict:"user_id,section,block,week,weekday"}).select().single();
  if(r.error){toast(r.error.message);return;}
  S.logs=(S.logs||[]).filter(function(x){return !(x.week===w&&x.weekday===DAY);}).concat([r.data]);S.editing=null;
  rerender();toast(bonus?"Saved · +4 points — faster than last week 🔥":"Saved · +1 point ✓");
};
["renderMiaTrainTabs","ttRender","ttGo"].forEach(function(fn){var o=window[fn];if(typeof o!=="function")return;window[fn]=function(){var r=o.apply(this,arguments);try{patch();setTimeout(patch,50);}catch(e){}return r;};});
try{var mo=new MutationObserver(function(){try{patch();}catch(e){}});var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true,subtree:true});}catch(e){}

/* home row for Mia — this week's Thursday, one tap to the block */
window.mspOpen=function(){try{boxSub="sparring";sparTab="training";go("boxing");}catch(e){go("boxing");}
  setTimeout(function(){try{ttGo(UID,"con");}catch(e){}},250);setTimeout(function(){try{ttGo(UID,"con");}catch(e){}},900);};
function homeRow(){
  if(me()!==UID)return;var m=document.getElementById("main");if(!m||view!=="home"||m.querySelector(".mspHome"))return;
  var w=curWeek(),sess=WK[w],lg=logFor(w),dt=sessDate(w);
  var b=document.createElement("button");b.className="mspHome";b.setAttribute("onclick","mspOpen()");
  b.innerHTML='<span><div class="k">Sprint block · week '+w+' of 4</div><div class="t">'+(Date.now()<startMs()?'Starts Thursday':'Thursday '+dt.getDate()+' '+dt.toLocaleDateString("en-AU",{month:"short"}))+' · '+esc(sess.h)+'</div><div class="s">100 m sprint, 2:00 recovery from the moment you jog back — '+(lg?'logged ✓ · tap to see your times':'time every sprint and log them here')+'.</div></span><span class="a">›</span>';
  var anchor=m.querySelector(".homeWelcome");if(anchor)anchor.insertAdjacentElement("beforebegin",b);else m.insertBefore(b,m.firstChild);
  if(S.logs===null)loadLogs();
}
var _rh=window.renderHome;if(typeof _rh==="function"){window.renderHome=function(){var r=_rh.apply(this,arguments);try{homeRow();setTimeout(homeRow,80);}catch(e){}return r;};}
try{if(view==="home")homeRow();}catch(e){}
try{patch();setTimeout(patch,400);}catch(e){}
})();
