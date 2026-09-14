/* Legacy Gym · fighter training days · 14 Sep 2026
   Replaces the Boxing panel on every fighter's "[Name]'s Training" tab with a day-by-day layout:
   Mon–Sun tabs that actually work, the day's session with one big START button (fighter or coach),
   Jake's notes, and the round list with the glove-up window marked. Programs sort by weekday.
   Mia's old hard-coded block (7 Sep) is retired — only what's in fighter_programs shows.
   Sarsha's block is her own layout and is left alone. */
(function(){
"use strict";
var MIA="154f7fe0-401c-4076-8074-ad1c9a7502e3",SARSHA="2d223b5e-0dd2-47ee-8e3f-54e1b1c3e139",JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
try{delete TRAIN_PROGRAMS[MIA];}catch(e){}
var DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],DL=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],ORDER=[1,2,3,4,5,6,0];
var SEL={};
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
function me(){try{return (profile&&profile.id)||null;}catch(e){return null;}}
function isJake(){return me()===JAKE;}
function today(){return new Date().getDay();}
function todayIso(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fmtD(s){try{return new Date(String(s).slice(0,10)+"T12:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}catch(e){return s;}}
function fmt(t){try{return fmtSec(t);}catch(e){t=Math.round(t||0);return Math.floor(t/60)+":"+String(t%60).padStart(2,"0");}}
function progsFor(uid){try{return (sc2.allPrograms||[]).filter(function(p){return p.user_id===uid;});}catch(e){return [];}}
function daysOf(p){var d=(p.schedule&&p.schedule.days)||[];if(!d.length&&p.sessions&&p.sessions.length)d=[new Date(p.sessions[0].date+"T12:00:00").getDay()];return d.map(Number);}
function firstDayRank(p){var d=daysOf(p);if(!d.length)return 99;return Math.min.apply(null,d.map(function(x){return x===0?7:x;}));}
function find(id){try{return byoFind(id);}catch(e){return null;}}
function roundLen(it,set){try{return sc2RoundLen(it,set);}catch(e){return it.fixed||(it.core?(set.core||60):(set.len||180));}}
function gloveWins(p){var out=[];try{var G=lgTimerGloves(p.rounds||[]);for(var i=1;i<G.length;i++)if(G[i]&&!G[i-1])out.push(i);}catch(e){}return out;}
function totalWith(p){var set=p.settings||{},t=0;try{t=sc2Total(p.rounds||[],set);}catch(e){}return t+gloveWins(p).length*Math.max(0,60-(set.rest||30));}

var css=document.createElement("style");css.textContent=
 ".lgDays{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin:2px 0 12px}"+
 ".lgDays button{border:1px solid var(--line);border-radius:10px;padding:8px 0 6px;background:var(--panel);color:var(--muted);font-size:10px;letter-spacing:1px;text-transform:uppercase;font-weight:800;cursor:pointer;line-height:1.1}"+
 ".lgDays button i{display:block;font-style:normal;font-family:Oswald,sans-serif;font-size:15px;margin-top:3px;color:var(--line)}"+
 ".lgDays button.has{color:var(--text);border-color:#3a3a40}.lgDays button.has i{color:var(--gold)}"+
 ".lgDays button.today{border-color:var(--gold-dim,#8a7a4a)}"+
 ".lgDays button.on{background:var(--gold);color:#0b0b0c;border-color:var(--gold)}.lgDays button.on i{color:#0b0b0c}"+
 ".lgProg{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:14px;margin-bottom:12px}"+
 ".lgKick{font-size:9.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--gold)}"+
 ".lgName{font-family:Oswald,sans-serif;font-size:22px;letter-spacing:.5px;text-transform:uppercase;color:#fff;margin-top:2px;line-height:1.1}"+
 ".lgMeta{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.5}"+
 ".lgStart{display:block;width:100%;margin:12px 0 10px;padding:16px;border:0;border-radius:12px;background:linear-gradient(178deg,#F6D97C,#C9962A);color:#141005;font-family:Oswald,sans-serif;font-weight:700;font-size:19px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;animation:lgPulse 1.6s ease-in-out infinite}"+
 "@keyframes lgPulse{0%,100%{box-shadow:0 0 0 0 rgba(241,210,122,0)}50%{box-shadow:0 0 0 7px rgba(241,210,122,.3)}}"+
 ".lgProgress{display:flex;justify-content:space-between;gap:10px;font-size:11.5px;color:var(--muted);margin-bottom:8px}.lgProgress b{color:#fff}"+
 ".lgNote{border-left:3px solid var(--gold);background:color-mix(in srgb,var(--gold) 8%,var(--panel));border-radius:0 10px 10px 0;padding:9px 12px;font-size:12.5px;line-height:1.5;margin:8px 0}"+
 ".lgNote span{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:var(--gold);margin-bottom:2px}"+
 ".lgNote.work{border-color:#ff9f1c}.lgNote.work span{color:#ff9f1c}"+
 ".lgRows{margin-top:10px}.lgRow{display:grid;grid-template-columns:26px 1fr auto;gap:8px;align-items:start;padding:7px 0;border-top:1px solid var(--line);font-size:12.5px}"+
 ".lgRow .n{font-family:Oswald,sans-serif;font-size:14px;color:var(--gold)}.lgRow b{display:block;color:#fff;font-weight:700}.lgRow small{display:block;color:var(--muted);font-size:11.5px;line-height:1.4}"+
 ".lgRow .t{font-family:Oswald,sans-serif;font-size:13px;color:var(--muted);white-space:nowrap}"+
 ".lgGl{display:flex;align-items:center;gap:8px;padding:7px 10px;margin-top:6px;border:1px dashed #ff9f1c;border-radius:9px;color:#ff9f1c;font-size:10.5px;letter-spacing:1.2px;text-transform:uppercase;font-weight:800}"+
 ".lgEmpty{border:1px solid var(--line);border-radius:14px;background:var(--panel);padding:18px 16px;color:var(--muted);font-size:13px;line-height:1.5}"+
 ".lgEmpty b{display:block;font-family:Oswald,sans-serif;font-size:18px;letter-spacing:.5px;text-transform:uppercase;color:#fff;margin-bottom:2px}"+
 "@media (prefers-reduced-motion:reduce){.lgStart{animation:none}}";
document.head.appendChild(css);

function pickDay(uid,progs){
  if(SEL[uid]!=null)return SEL[uid];
  var t=today(),has={};progs.forEach(function(p){daysOf(p).forEach(function(d){has[d]=1;});});
  for(var i=0;i<7;i++){var d=(t+i)%7;if(has[d])return d;}
  return t;
}
function progCard(p,uid){
  var set=p.settings||{len:180,rest:30,core:60},list=p.rounds||[],sess=p.sessions||[],t=todayIso();
  var done=sess.filter(function(s){return s.done;}).length,nx=sess.find(function(s){return !s.done&&s.date>=t;});
  var notes=p.notes||{},gw=gloveWins(p),wks=(p.schedule&&p.schedule.weeks)||sess.length||1;
  var days=daysOf(p).map(function(d){return DN[d];}).join(" & ");
  var canTick=uid===me()||isJake();
  var h='<div class="lgProg">'+
   '<div class="lgKick">'+esc(days?"Every "+days:"One-off")+' · '+wks+' week'+(wks===1?"":"s")+'</div>'+
   '<div class="lgName">'+esc(p.name)+'</div>'+
   '<div class="lgMeta">'+list.length+' rounds · '+fmt(totalWith(p))+' · '+fmt(set.len||180)+' work / '+fmt(set.rest||30)+' rest'+(gw.length?' · 60 s glove-up built in':'')+' · by '+esc(p.coach_name||"Jake")+'</div>'+
   '<button class="lgStart" onclick="lgStart(\''+p.id+'\')">▶ Start Session</button>'+
   '<div class="lgProgress"><span><b>'+done+'</b> of '+sess.length+' done</span><span>'+(nx?'Next <b>'+esc(fmtD(nx.date))+'</b>':(sess.length?'Block complete':''))+'</span></div>';
  if(notes.work)h+='<div class="lgNote work"><span>Work on</span>'+esc(notes.work)+'</div>';
  if(notes.focus)h+='<div class="lgNote"><span>In your own time</span>'+esc(notes.focus)+'</div>';
  if(notes.well)h+='<div class="lgNote"><span>Doing well</span>'+esc(notes.well)+'</div>';
  h+='<div class="lgRows">';
  list.forEach(function(id,i){
    var it=find(id);if(!it)return;
    if(gw.indexOf(i)>=0)h+='<div class="lgGl">🥊 60 seconds to glove up</div>';
    h+='<div class="lgRow"><span class="n">'+(i+1)+'</span><div><b>'+esc(it.n)+'</b>'+(it.tag?'<small>'+esc(it.tag)+'</small>':'')+'</div><span class="t">'+fmt(roundLen(it,set))+'</span></div>';
  });
  h+='</div>';
  if(sess.length&&canTick){
    h+='<div class="kick2" style="margin:12px 0 6px">Tick off the days</div><div class="dayRow2">'+sess.map(function(s,k){var past=s.date<t&&!s.done;
      return '<button class="dayC2'+(s.done?" done":past?" missed":"")+'" onclick="sc2TickSession(\''+p.id+'\','+k+')"><b>'+DN[new Date(s.date+"T12:00:00").getDay()]+'</b><span>'+s.date.slice(8)+'/'+s.date.slice(5,7)+'</span><i>'+(s.done?"done":past?"missed":"")+'</i></button>';}).join("")+'</div>';
  }
  return h+'</div>';
}
function panelHtml(uid){
  var progs=progsFor(uid).slice().sort(function(a,b){return firstDayRank(a)-firstDayRank(b)||String(a.name).localeCompare(String(b.name));});
  var sel=pickDay(uid,progs),has={};progs.forEach(function(p){daysOf(p).forEach(function(d){has[d]=1;});});
  var t=today();
  var tabs='<div class="lgDays">'+ORDER.map(function(d){return '<button class="'+(sel===d?"on ":"")+(has[d]?"has ":"")+(d===t?"today":"")+'" onclick="lgDay(\''+uid+'\','+d+')">'+DN[d]+'<i>'+(has[d]?"●":"–")+'</i></button>';}).join("")+'</div>';
  var onDay=progs.filter(function(p){return daysOf(p).indexOf(sel)>=0;});
  var body=onDay.length?onDay.map(function(p){return progCard(p,uid);}).join(""):
    '<div class="lgEmpty"><b>'+DL[sel]+'</b>'+(progs.length?'Nothing on the boxing program for '+DL[sel]+'. Programmed days are marked ● above.':(uid===me()?'Jake is building your boxing block — it lands here with his notes.':'Nothing programmed for this fighter yet.'))+'</div>';
  return tabs+body;
}
function paint(uid){
  var el=document.getElementById("tt-"+uid);if(!el||uid===SARSHA)return;
  var on=el.querySelector(".tabs button.on"),tabs=el.querySelectorAll(".tabs button");
  if(!on||tabs[0]!==on)return; /* only the Boxing tab is ours */
  var ftp=el.querySelector(".ftp");if(!ftp)return;
  ftp.innerHTML=panelHtml(uid);
}
function paintAll(){document.querySelectorAll('.ft[id^="tt-"]').forEach(function(el){var uid=el.id.slice(3);var ftp=el.querySelector(".ftp");if(ftp&&!ftp.querySelector(".lgDays"))paint(uid);});}
window.lgDay=function(uid,d){SEL[uid]=d;paint(uid);};
window.lgStart=function(pid){
  try{if(typeof go==="function")go("boxing");}catch(e){}
  try{sc2StartProgram(pid);}catch(e){try{toast("Couldn't start the timer — reload and try again.");}catch(e2){}}
  try{window.scrollTo(0,0);}catch(e){}
};
["ttRender","ttGo","renderMiaTrainTabs"].forEach(function(n){
  var o=window[n];if(typeof o!=="function")return;
  window[n]=function(){var r=o.apply(this,arguments);try{paintAll();}catch(e){}return r;};
});
var t=null;
function arm(){var m=document.getElementById("main")||document.body;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){try{paintAll();}catch(e){}},60);}).observe(m,{childList:true,subtree:true});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",arm);else arm();
try{paintAll();}catch(e){}
})();
