/* Legacy Gym · coach programs board · 13 Sep 2026
   Adds an "All Programs" view to the coach's Sparring Club roster: every fighter's programmed
   workload and running block on one screen, tap through to the fighter. Read-only, nothing new stored. */
(function(){
"use strict";
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
var RUNNERS={
 "2d223b5e-0dd2-47ee-8e3f-54e1b1c3e139":"Sarsha",
 "3d4ab64d-24b1-450c-ad25-bad5a91fe789":"Jaxson",
 "e4d86ca0-b371-4e3d-a343-8603175b1034":"Ayrton",
 "43126c8e-efe2-484e-bd52-d05c55548b6d":"Sunnie",
 "40ee586b-3970-4961-9858-7c8ed91a8c76":"Arian"};
var PV={tab:"roster",runs:null,loading:false};
function me(){try{return (profile&&profile.id)||null;}catch(e){return null;}}
function isJake(){return me()===JAKE;}
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fmtD(s){try{return new Date(String(s).slice(0,10)+"T12:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}catch(e){return s;}}
function nameOf(uid){
  if(RUNNERS[uid])return RUNNERS[uid];
  try{var b=(sc2.roster||[]).find(function(x){return x.user_id===uid;});if(b&&b.name)return b.name;}catch(e){}
  return "Fighter";
}
var css=document.createElement("style");css.textContent=
 ".pvTabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 14px}"+
 ".pvTabs button{padding:11px 4px 9px;border-radius:12px;border:1px solid var(--gold);background:var(--gold);color:#0b0b0c;font-family:Oswald,sans-serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;font-weight:700;cursor:pointer}"+
 ".pvTabs button small{display:block;font-family:inherit;font-size:8px;letter-spacing:1.5px;margin-top:3px;font-weight:700;opacity:.8}"+
 ".pvTabs button.on{background:color-mix(in srgb,var(--gold) 10%,var(--panel));color:var(--gold)}.pvTabs button.on small{color:var(--muted);opacity:1}"+
 ".pvCard{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:12px 14px;margin-bottom:10px;width:100%;text-align:left;color:var(--text);cursor:pointer;display:block}"+
 ".pvCard .nm{font-family:Oswald,sans-serif;font-size:16px;letter-spacing:.5px;text-transform:uppercase;color:#fff}"+
 ".pvCard .k{font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}"+
 ".pvCard .s{font-size:11.5px;color:var(--muted);margin-top:2px;line-height:1.45}"+
 ".pvCard .bar{height:5px;background:#1d1d21;border-radius:999px;overflow:hidden;margin:8px 0 5px}"+
 ".pvCard .bar i{display:block;height:100%;background:linear-gradient(90deg,#c9a44c,#F1D27A)}"+
 ".pvRow{display:flex;align-items:center;gap:10px}"+
 ".pvRow .rt{margin-left:auto;text-align:right;flex:none;font-family:Oswald,sans-serif;font-size:15px;color:#fff;line-height:1.1}"+
 ".pvRow .rt small{display:block;font-family:Montserrat,Inter,sans-serif;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:800;margin-top:3px}"+
 ".pvNone{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:16px;color:var(--muted);font-size:12.5px;line-height:1.5}"+
 ".pvChip{display:inline-block;font-size:9px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;padding:3px 7px;border-radius:999px;border:1px solid var(--line);color:var(--muted);margin-left:6px}"+
 ".pvChip.ok{border-color:#1f4a30;color:#8fe3b0}.pvChip.due{border-color:#5a4a22;color:#F1D27A}.pvChip.late{border-color:#5a2a2a;color:#ff9c9c}";
document.head.appendChild(css);

async function loadRuns(){
  if(PV.loading||PV.runs!==null)return;PV.loading=true;
  try{var r=await sb.from("fighter_sessions").select("user_id,section,week,weekday,points,time_secs,title,created_at").eq("block",1).eq("section","con");
    PV.runs=r.error?[]:(r.data||[]);}catch(e){PV.runs=[];}
  PV.loading=false;redraw();
}
function redraw(){try{if(coachViewId)renderCoachFighterView();else renderSparringClub();}catch(e){}}
window.pvGo=function(t){PV.tab=t;if(t==="programs"&&PV.runs===null&&isJake())loadRuns();redraw();};

function progCard(p){
  var sess=p.sessions||[],done=sess.filter(function(s){return s.done;}).length,pct=sess.length?Math.round(done/sess.length*100):0;
  var t=today();var nx=sess.find(function(s){return !s.done&&s.date>=t;});
  var late=sess.filter(function(s){return !s.done&&s.date<t;}).length;
  var chip=done===sess.length&&sess.length?'<span class="pvChip ok">Complete</span>':late?'<span class="pvChip late">'+late+' missed</span>':(nx&&nx.date===t?'<span class="pvChip due">Today</span>':"");
  var when="";try{when=sc2SchedLabel(p.schedule);}catch(e){}
  var rounds=(p.rounds||[]).length,total="";try{total=fmtSec(sc2Total(p.rounds||[],p.settings||{}));}catch(e){}
  return '<button class="pvCard" onclick="openCoachFighterView(\''+p.user_id+'\')">'+
   '<div class="pvRow"><div style="flex:1;min-width:0"><div class="k">'+esc(nameOf(p.user_id))+chip+'</div>'+
   '<div class="nm">'+esc(p.name)+'</div>'+
   '<div class="s">'+esc(when)+' · '+rounds+' rounds'+(total?' · '+total:'')+' · by '+esc(p.coach_name||"Jake")+'</div></div>'+
   '<div class="rt">'+done+'<small>of '+sess.length+'</small></div></div>'+
   '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
   '<div class="s">'+(nx?'Next '+fmtD(nx.date):(!sess.length?'No days scheduled':late?(late+' session'+(late===1?'':'s')+' missed · block finished'):'All sessions done'))+'</div></button>';
}
function runCard(uid){
  var rows=(PV.runs||[]).filter(function(r){return r.user_id===uid;});
  var done=rows.filter(function(r){return (r.points||0)>0;}).length,pts=rows.reduce(function(a,r){return a+(r.points||0);},0);
  var last=rows.slice().sort(function(a,b){return String(a.created_at)<String(b.created_at)?1:-1;})[0];
  var pct=Math.round(done/12*100);
  return '<button class="pvCard" onclick="openCoachFighterView(\''+uid+'\')">'+
   '<div class="pvRow"><div style="flex:1;min-width:0"><div class="k">'+esc(RUNNERS[uid])+(done?'':' <span class="pvChip">Nothing logged</span>')+'</div>'+
   '<div class="nm">Running block · 4 weeks</div>'+
   '<div class="s">Mon run · Wed oval sprints · Fri run'+(last?' · last: '+esc(last.title||"")+'':'')+'</div></div>'+
   '<div class="rt">'+done+'<small>of 12</small></div></div>'+
   '<div class="bar"><i style="width:'+pct+'%"></i></div>'+
   '<div class="s">'+pts+' point'+(pts===1?'':'s')+' banked</div></button>';
}
function programsHtml(){
  var all=[];try{all=(sc2.allPrograms||[]).slice();}catch(e){}
  all.sort(function(a,b){var n=nameOf(a.user_id).localeCompare(nameOf(b.user_id));return n||(String(b.created_at)<String(a.created_at)?-1:1);});
  var h='<div class="secTitle">Running block <span style="color:var(--muted);font-weight:600;letter-spacing:1px;font-size:11px">'+Object.keys(RUNNERS).length+' fighters</span></div>';
  if(!isJake())h+='<div class="pvNone">Running-block times are private to each fighter and Jake.</div>';
  else if(PV.runs===null)h+='<div class="pvNone">Loading logged sessions…</div>';
  else h+=Object.keys(RUNNERS).map(runCard).join("");
  h+='<div class="secTitle" style="margin-top:18px">Programmed workloads <span style="color:var(--muted);font-weight:600;letter-spacing:1px;font-size:11px">'+all.length+'</span></div>';
  h+=all.length?all.map(progCard).join(""):'<div class="pvNone">Nothing programmed yet. Build one from a fighter’s profile, or ask Claude to write it in.</div>';
  return h;
}
var _roster=window.sc2RosterHtml;
window.sc2RosterHtml=function(){
  var tabs='<div class="pvTabs"><button class="'+(PV.tab==="roster"?"on":"")+'" onclick="pvGo(\'roster\')">Fighters<small>Profiles &amp; workloads</small></button>'+
   '<button class="'+(PV.tab==="programs"?"on":"")+'" onclick="pvGo(\'programs\')">All Programs<small>Everyone, one screen</small></button></div>';
  if(PV.tab==="programs")return tabs+programsHtml();
  return tabs+(_roster?_roster.apply(this,arguments):"");
};
})();
