/* Legacy Gym · home layout add-on · 26 Sep 2026
   Re-lays the Home screen so everything fits on one screen:
   greeting + tally → two big tiles (Classes, Book a Coach) → 2×2 small tiles → Fight Club strip.
   Moves the existing cards around; deletes nothing. Remove this script tag to go back to the old list. */
(function(){
"use strict";
var BIG=["classes","coaches"], SMALL=["boxing","cardio","board","social"];
var COACH_INITS=["JA","JO","SA","AL"];

/* ---------- copy tweaks for the smaller tiles ---------- */
try{
  HOME_CARDS.forEach(function(c){
    if(c.id==="classes"){c.sub="Full week opens Sunday 7 AM. Tap in, you're booked.";}
    if(c.id==="coaches"){c.kicker="Coaches · 1-On-1";c.sub="Jake, Joe, Sarsha & Alison. Pick your coach, pick your time.";}
    if(c.id==="cardio"){c.title="HYROX & Challenges";}
  });
}catch(e){}

/* ---------- CSS ---------- */
var css=document.createElement("style");
css.textContent=
 "#main .homeWelcome{display:none}"+
 ".lghHi{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:4px 0 12px}"+
 ".lghHi h1{font-family:'Oswald',sans-serif;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;line-height:1;margin:0;color:#fff}"+
 ".lghHi h1 small{display:block;font-family:'Montserrat',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:2.5px;color:var(--gold);text-transform:uppercase;margin-bottom:5px}"+
 ".lghTally{display:flex;gap:6px;flex:none}"+
 ".lghTally div{text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:6px 7px;min-width:50px}"+
 ".lghTally b{display:block;font-family:'Oswald',sans-serif;font-size:15px;color:var(--gold);line-height:1}"+
 ".lghTally i{display:block;font-style:normal;font-size:6.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);margin-top:3px}"+
 ".lghNext{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:linear-gradient(90deg,#16130a,#0f0f0f);border:1px solid #3a3018;border-radius:12px;padding:10px 12px;margin:0 0 11px;color:var(--text);cursor:pointer}"+
 ".lghNext .dot{width:8px;height:8px;border-radius:50%;background:#3DBE7A;box-shadow:0 0 8px #3DBE7A;flex:none}"+
 ".lghNext.none .dot{background:var(--gold);box-shadow:0 0 8px var(--gold)}"+
 ".lghNext .k{font-size:7.5px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase}"+
 ".lghNext .t{font-family:'Oswald',sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;color:#fff}"+
 ".lghNext .s{font-size:9.5px;color:#c9c6be;margin-top:1px}"+
 ".lghNext .a{margin-left:auto;font-size:10px;font-weight:600;color:var(--gold);letter-spacing:1px;text-transform:uppercase;white-space:nowrap;flex:none}"+
 ".lghPair{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:11px}"+
 ".lghPair .homeCard,.lghGrid .homeCard{border:1.5px solid var(--gold)}"+
 "#lgh2 .homeCard.smGold{border:1.5px solid var(--gold)!important;animation:none!important;box-shadow:none!important}"+
 ".lghGrid .homeCard:last-child:nth-child(odd){grid-column:1/-1}"+
 ".lghPair .homeCard{margin:0;min-height:158px;padding:14px 12px 12px}"+
 ".lghPair .homeCard::before{top:18px;bottom:18px}"+
 ".lghPair .homeCard::after{top:10px;right:12px;transform:none;font-size:24px}"+
 ".lghPair .hcKicker{font-size:7.5px;letter-spacing:1.8px;margin-bottom:5px}"+
 ".lghPair .hcTitle{font-size:19px;letter-spacing:1px;line-height:1.05}"+
 ".lghPair .hcSub{font-size:9.5px;margin-top:5px;padding-right:0;line-height:1.4}"+
 ".lghFaces{display:flex;margin-top:7px}"+
 ".lghFaces i{width:20px;height:20px;border-radius:50%;background:#1d1d1d;border:1.5px solid var(--gold);margin-right:-6px;font-family:'Oswald',sans-serif;font-size:7.5px;font-weight:700;color:#e5c46b;display:flex;align-items:center;justify-content:center;font-style:normal;letter-spacing:.3px}"+
 ".lghFc{margin:0 0 14px}"+
 ".lghFc .fcxCard{margin:0;min-height:0;padding:11px 14px;display:grid;grid-template-columns:1fr auto;column-gap:12px;align-items:center}"+
 ".lghFc .fcxCard .k{font-size:7.5px;letter-spacing:2px;margin-bottom:0;grid-column:1}"+
 ".lghFc .fcxCard .t{font-size:19px;line-height:1;margin-top:2px;grid-column:1}"+
 ".lghFc .fcxCard .s{font-size:9px;margin-top:3px;padding-right:0;line-height:1.35;grid-column:1;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}"+
 ".lghFc .fcxCard .lghCdWrap{grid-column:2;grid-row:1/4;display:flex;flex-direction:column;align-items:center;gap:4px}"+
 ".lghFc .fcxCard .lghOpens{font-size:7px;font-weight:800;letter-spacing:2px;color:#F1D27A;text-transform:uppercase}"+
 ".lghFc .fcxCard .cd{grid-column:2;grid-row:1/4;margin:0;gap:5px}"+
 ".lghFc .fcxCard .cd div{min-width:34px;padding:4px 3px}"+
 ".lghFc .fcxCard .cd b{font-size:16px}"+
 ".lghFc .fcxCard .cd small{font-size:6px;letter-spacing:1px;margin-top:2px}"+
 ".lghFc .fcxCard .lock{display:none}"+
 ".lghGrid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:11px}"+
 ".lghGrid .homeCard{margin:0;min-height:92px;padding:12px 12px 10px}"+
 ".lghGrid .homeCard::before{top:16px;bottom:16px}"+
 ".lghGrid .homeCard::after{top:9px;right:12px;transform:none;font-size:20px}"+
 ".lghGrid .hcKicker{font-size:7px;letter-spacing:1.6px;margin-bottom:4px}"+
 ".lghGrid .hcTitle{font-size:15px;letter-spacing:.8px;line-height:1.05}"+
 ".lghGrid .hcSub{display:none}";
document.head.appendChild(css);

/* ---------- helpers ---------- */
function esc2(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
function pad2(n){return (n<10?"0":"")+n;}
function fmtTime(hm){var p=String(hm||"").split(":");var h=parseInt(p[0],10),m=p[1]||"00";if(isNaN(h))return hm||"";var ap=h>=12?"pm":"am";h=h%12;if(h===0)h=12;return h+(m==="00"?"":":"+m)+ap;}
var DOWS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],MONS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDay(iso){var today=new Date();today.setHours(0,0,0,0);var d=new Date(iso+"T12:00:00");var diff=Math.round((d-today)/864e5);if(diff===0)return "Today";if(diff===1)return "Tomorrow";return DOWS[d.getDay()]+" "+d.getDate()+" "+MONS[d.getMonth()];}
function todayIso(){try{return isoDateLocal(new Date());}catch(e){var d=new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}}

/* ---------- greeting + tally (replaces the stats tiles) ---------- */
window.homeStatsHtml=function(){
  var first="";try{first=(profile&&profile.first_name)||"";}catch(e){}
  var cl=0,pts=0,st=0;
  try{cl=myClassCount();}catch(e){}try{pts=myPoints();}catch(e){}try{st=myStreakWeeks();}catch(e){}
  var dn=new Date(),date=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dn.getDay()]+" \u00b7 "+dn.getDate()+" "+MONS[dn.getMonth()];
  return '<div class="lghHi"><h1><small>'+esc2(date)+'</small>'+(first?"G'day "+esc2(first):"Members only")+'</h1>'+
    '<div class="lghTally"><div><b>'+cl+'</b><i>Classes</i></div><div><b>'+(pts||0).toLocaleString()+'</b><i>Points</i></div><div><b>'+(st||0)+' wk</b><i>Streak</i></div></div></div>';
};

/* ---------- next up ---------- */
var NEXT={at:0,html:null,loading:false};
function nextHtml(){
  return '<button class="lghNext'+(NEXT.html?"":" none")+'" id="lghNext" onclick="go(\'classes\')">'+(NEXT.html||'<div class="dot"></div><div><div class="k">This week</div><div class="t">Book your week</div><div class="s">Full week opens Sunday 7 AM.</div></div><div class="a">Book ›</div>')+'</button>';
}
function loadNext(){
  if(!session||NEXT.loading)return;
  if(Date.now()-NEXT.at<60000)return;
  NEXT.loading=true;
  var uid=session.user.id, d0=todayIso(), now=new Date(), nowHM=pad2(now.getHours())+":"+pad2(now.getMinutes());
  var wkStart=weekKey(now), wkEndD=new Date(wkStart+"T12:00:00");wkEndD.setDate(wkEndD.getDate()+6);var wkEnd=isoDateLocal(wkEndD);
  Promise.all([
    sb.from("class_regs").select("class_name,class_date,class_time").eq("user_id",uid).gte("class_date",d0).order("class_date",{ascending:true}).order("class_time",{ascending:true}).limit(30),
    sb.from("class_regs").select("class_date").eq("user_id",uid).gte("class_date",wkStart).lte("class_date",wkEnd)
  ]).then(function(res){
    var rows=(res[0].data||[]).filter(function(r){return r.class_date>d0||(r.class_date===d0&&r.class_time>=nowHM);});
    var weekN=(res[1].data||[]).length, GOAL=4;
    var sub=weekN>=GOAL?"Week goal hit 🔥 "+weekN+" booked this week":weekN+" booked this week · "+(GOAL-weekN)+" more for the bonus point";
    if(rows.length){
      var r=rows[0];
      NEXT.html='<div class="dot"></div><div><div class="k">Next up · '+esc2(fmtDay(r.class_date)+" "+fmtTime(r.class_time))+'</div><div class="t">'+esc2(r.class_name||"Class")+' · You’re in</div><div class="s">'+esc2(sub)+'</div></div><div class="a">Details ›</div>';
    }else{
      NEXT.html=null;
    }
    NEXT.at=Date.now();NEXT.loading=false;
    var el=document.getElementById("lghNext");
    if(el&&view==="home"){var w=document.createElement("div");w.innerHTML=nextHtml();el.replaceWith(w.firstChild);}
  }).catch(function(){NEXT.loading=false;});
}

/* ---------- lay it out ---------- */
function card(m,id){return m.querySelector('.homeCard[onclick="go(\''+id+'\')"]');}
function build(){
  var m=document.getElementById("main");if(!m||view!=="home")return;
  var root=document.getElementById("lgh2");
  var first=m.querySelector(".homeCard");
  if(!root){
    if(!first)return;
    root=document.createElement("div");root.id="lgh2";
    root.innerHTML='<div class="lghPair"></div><div class="lghGrid"></div><div class="lghFc"></div>'; /* Next up strip removed 26 Sep 2026 at Jake's request */
    first.insertAdjacentElement("beforebegin",root);
  }
  var pair=root.querySelector(".lghPair"),fc=root.querySelector(".lghFc"),grid=root.querySelector(".lghGrid");
  BIG.forEach(function(id){var c=card(m,id);if(c&&c.parentNode!==pair)pair.appendChild(c);});
  var co=card(m,"coaches");
  if(co&&!co.querySelector(".lghFaces")){var f=document.createElement("div");f.className="lghFaces";f.innerHTML=COACH_INITS.map(function(i){return "<i>"+i+"</i>";}).join("");co.appendChild(f);}
  var fcx=document.getElementById("fcxCard");if(fcx&&fcx.parentNode!==fc)fc.appendChild(fcx);
  if(fcx&&!fcx.querySelector(".lghCdWrap")){var cd=fcx.querySelector(".cd");if(cd){var w=document.createElement("div");w.className="lghCdWrap";w.innerHTML='<div class="lghOpens">App opens in</div>';cd.parentNode.insertBefore(w,cd);w.appendChild(cd);}}
  SMALL.forEach(function(id){var c=card(m,id);if(c&&c.parentNode!==grid)grid.appendChild(c);});
  /* anything else still sitting loose in main (e.g. Staff Room) joins the grid */
  Array.prototype.slice.call(m.children).forEach(function(el){if(el.classList&&el.classList.contains("homeCard"))grid.appendChild(el);});
}
var _render=window.renderHome;
window.renderHome=function(){var r=_render.apply(this,arguments);try{build();setTimeout(build,80);setTimeout(build,450);setTimeout(build,1200);}catch(e){}return r;};
setInterval(function(){try{if(view==="home")build();}catch(e){}},1500);
})();
