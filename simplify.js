/* Legacy Gym · simplify add-on · 13 Sep 2026
   Trims the app back to what members use. Hides screens, deletes nothing. */
(function(){
"use strict";
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
function me(){try{return (typeof session!=="undefined"&&session&&session.user)?session.user.id:null;}catch(e){return null;}}
function isBloke(){try{return !!(profile&&(profile.is_blokes||profile.is_staff));}catch(e){return false;}}
function isStaff(){try{return !!(profile&&profile.is_staff);}catch(e){return false;}}

/* ---------- CSS: hide the injected coach-only cards (they're folded into one row below) ---------- */
var css=document.createElement("style");
css.textContent="#tbjHomeBtn,#inHomeBtn{display:none!important}"+
 ".smRow{width:100%;display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:14px;background:linear-gradient(160deg,#15130c,#0d0c08);color:var(--text);text-align:left;cursor:pointer}"+
 ".smRow .k{font-size:9.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--gold)}"+
 ".smRow .t{font-family:Oswald,sans-serif;font-weight:700;font-size:17px;text-transform:uppercase;letter-spacing:.5px;margin-top:2px;color:#fff}"+
 ".smRow .s{font-size:11px;color:var(--muted);margin-top:2px}"+
 ".smRow .a{margin-left:auto;font-size:22px;color:var(--gold);flex:none}"+
 ".smCoach{display:flex;gap:6px;margin:0 0 16px}.smCoach button{flex:1;border:1px solid var(--gold-dim,#5a4a22);background:linear-gradient(160deg,#181407,#0d0b06);border-radius:12px;padding:10px 6px;color:#fff;font-family:Oswald,sans-serif;font-weight:700;font-size:12.5px;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;line-height:1.15}"+
 "@keyframes smFlash{0%,100%{box-shadow:0 0 10px rgba(212,175,55,.45),0 0 26px rgba(212,175,55,.15);border-color:var(--gold)}50%{box-shadow:0 0 26px rgba(212,175,55,.85),0 0 54px rgba(212,175,55,.35);border-color:#f1d582}}"+
 ".homeCard.smGold{border:2px solid var(--gold)!important;animation:smFlash 1.4s ease-in-out infinite}"+
 "@media (prefers-reduced-motion:reduce){.homeCard.smGold{animation:none}}"+
 ".smCoach button small{display:block;font-family:Montserrat,Inter,sans-serif;font-size:8.5px;letter-spacing:1.5px;color:var(--gold);font-weight:800;margin-bottom:3px}";
document.head.appendChild(css);

/* ---------- 1. Nav: four tabs. Shop lives under You. ---------- */
try{for(var i=NAV.length-1;i>=0;i--)if(NAV[i].id==="shop")NAV.splice(i,1);NAV_TAB.shop="profile";NAV_TAB.hyrox="compete";NAV_TAB.mvm="compete";}catch(e){}

/* ---------- 2. Hubs ---------- */
try{
  HOME_CARDS.forEach(function(c){
    if(c.id==="cardio"){c.kicker="Race, Climb & Compete";c.title="HYROX, Cardio & Member Challenges";c.sub="HYROX sessions, StairMaster missions, iconic runs, duels & the club record board — all worth points.";}
    if(c.id==="weights"){c.kicker="The Gym Floor";c.title="Programs & WODs";c.sub="Strength programs and CrossFit benchmarks with timers built in — there when you want them.";}
    if(c.id==="coaches"){c.kicker="Coaches \u00b7 1-On-1 Sessions";c.title="Book A Coach";c.sub="1-on-1s with Coach Jake, Coach Joe & Coach Sarsha — pads, skills and sparring. Pick your coach, pick your time.";}
    if(c.id==="board"){c.title="Leaderboard";c.sub="Every point, every member — see who runs the gym.";}
  });
  TRAIN_IDS.splice(0,TRAIN_IDS.length,"classes","boxing","coaches","weights");
  COMPETE_IDS.splice(0,COMPETE_IDS.length,"cardio","board","social","blokes");
}catch(e){}
var HOME_HIDE=["weights","hyrox","social","shop","staff","mvm","timetable"];
var HOME_ORDER=["classes","boxing","coaches","cardio","board","__fc","blokes"];
function prune(main,ids){ids.forEach(function(id){main.querySelectorAll('.homeCard[onclick="go(\''+id+'\')"]').forEach(function(el){el.remove();});});}

/* ---------- 3. Home: stats that mean something, no duplicate booking strip ---------- */
window.homeFeatureHtml=function(){return "";};
window.homeStatsHtml=function(){
  var cl=0,pts=0,st=0;
  try{cl=myClassCount();}catch(e){}try{pts=myPoints();}catch(e){}try{st=myStreakWeeks();}catch(e){}
  var tile=function(v,l){return '<div style="flex:1;text-align:center;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 4px"><div style="font-family:\'Oswald\',sans-serif;font-weight:700;font-size:22px;color:var(--gold);line-height:1">'+v+'</div><div style="font-size:8.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);line-height:1.3;margin-top:5px">'+l+'</div></div>';};
  return '<div style="display:flex;gap:8px;margin:0 0 7px">'+tile(cl,'Classes<br>Banked')+tile(pts,'Legacy<br>Points')+tile((st||0)+'<span style="font-size:13px"> wk</span>','Week<br>Streak')+'</div><div style="text-align:center;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--muted);font-weight:600;margin-bottom:18px">Your tally &mdash; the leaderboard runs on these</div>';
};

/* ---------- 4. One coach row instead of three cards (alerts still flash) ---------- */
var _ptAlert=window.ptAlertHtml;
window.ptAlertHtml=function(){
  var c=null;try{c=myCoach();}catch(e){}
  if(!c)return "";
  var hasNew=false;try{hasNew=(ptNewCount+ptNewEnq)>0;}catch(e){}
  if(hasNew&&_ptAlert)return _ptAlert.apply(this,arguments);
  var j=me()===JAKE;
  var h='<div class="smCoach">';
  h+='<button onclick="openMyPT()"><small>Coach only</small>'+c.db+'’s PT</button>';
  if(j){h+='<button onclick="window.__tbj&&(window.__tbj.T.sub=\'inbox\');go(\'tbj\')"><small>Coach only</small>Trained by Jake</button>';
        h+='<button onclick="typeof inOpen===\'function\'&&inOpen()"><small>Fight Club</small>Info night RSVPs</button>';}
  return h+'</div>';
};

/* ---------- 5. Profile: no dead badges; Store & Staff Room live here ---------- */
window.profileBadgesHtml=function(){return "";};
var _renderProfile=window.renderProfile;
window.renderProfile=function(){
  var r=_renderProfile.apply(this,arguments);
  try{
    var m=$("main");var hero=m.querySelector(".hero");
    var w=document.createElement("div");
    w.innerHTML='<button class="smRow" onclick="go(\'shop\')"><span><div class="k">Official store</div><div class="t">Store &amp; Credit</div><div class="s">Hoodies, tees &amp; gear — spend your credit here.</div></span><span class="a">›</span></button>'+
      (isStaff()?'<button class="smRow" onclick="go(\'staff\')"><span><div class="k">Staff eyes only</div><div class="t">Staff Room</div><div class="s">Team chat, daily tasks &amp; PT commissions.</div></span><span class="a">›</span></button>':'');
    var nodes=Array.prototype.slice.call(w.childNodes);
    if(hero){nodes.reverse().forEach(function(n){hero.insertAdjacentElement("afterend",n);});}
    else nodes.forEach(function(n){m.appendChild(n);});
  }catch(e){}
  return r;
};

/* ---------- 6. Home & hubs: prune what moved, blokes only for blokes ---------- */
function cardEl(m,id){return id==="__fc"?document.getElementById("fcxCard"):m.querySelector('.homeCard[onclick="go(\''+id+'\')"]');}
function fixHome(){
  var m=$("main");if(!m||view!=="home")return;
  prune(m,HOME_HIDE);
  var lb=cardEl(m,"blokes");if(lb&&!isBloke())lb.remove();
  var co=cardEl(m,"coaches");if(co&&!co.classList.contains("smGold"))co.classList.add("smGold");
  var els=HOME_ORDER.map(function(id){return cardEl(m,id);}).filter(function(e){return e&&e.parentNode===m;});
  if(els.length<2)return;
  var ok=true;for(var i=1;i<els.length;i++){if(els[i-1].compareDocumentPosition(els[i])&Node.DOCUMENT_POSITION_PRECEDING){ok=false;break;}}
  if(ok)return;
  var ref=els[0];els.slice(1).forEach(function(e){ref.insertAdjacentElement("afterend",e);ref=e;});
}
var _renderHome=window.renderHome;
window.renderHome=function(){var r=_renderHome.apply(this,arguments);try{fixHome();setTimeout(fixHome,60);setTimeout(fixHome,400);}catch(e){}return r;};
var _renderCompete=window.renderCompete;
window.renderCompete=function(){var r=_renderCompete.apply(this,arguments);try{if(!isBloke()){prune($("main"),["blokes"]);}}catch(e){}return r;};

/* ---------- 7. HYROX lives inside the challenges screen ---------- */
var _renderCardio=window.renderCardio;
window.renderCardio=function(){
  var r=_renderCardio.apply(this,arguments);
  try{var m=$("main");var t=m.querySelector(".subTabs");
    if(t&&!t.querySelector("[data-hy]")){var b=document.createElement("button");b.setAttribute("data-hy","1");b.textContent="HYROX";b.setAttribute("onclick","go('hyrox')");t.insertBefore(b,t.firstChild);}
    var hk=m.querySelector(".heroKicker"),ht=m.querySelector(".heroTitle");if(hk)hk.textContent="Race, Climb & Compete";if(ht)ht.textContent="HYROX, Cardio & Member Challenges";
  }catch(e){}
  return r;
};
var _renderHyrox=window.renderHyrox;
window.renderHyrox=function(){
  var r=_renderHyrox.apply(this,arguments);
  var fix=function(){try{var b=$("main").querySelector(".backBtn");if(b&&/Home/i.test(b.textContent)){b.textContent="‹ Back To Challenges";b.setAttribute("onclick","go('cardio')");}}catch(e){}};
  if(r&&typeof r.then==="function")r.then(fix);fix();setTimeout(fix,300);
  return r;
};

/* ---------- 8. Classes: the full week is a link, not a second card ---------- */
var _renderClasses=window.renderClasses;
window.renderClasses=function(){
  var r=_renderClasses.apply(this,arguments);
  var fix=function(){try{var m=$("main");if(view!=="classes"||m.querySelector("#smWeek"))return;var back=m.querySelector(".backBtn");var b=document.createElement("button");b.id="smWeek";b.className="btnLink";b.style.cssText="display:block;margin:-4px 0 12px;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:var(--gold);background:none;border:0;padding:0;cursor:pointer";b.textContent="See the full week’s timetable ›";b.setAttribute("onclick","go('timetable')");if(back)back.insertAdjacentElement("afterend",b);else m.insertBefore(b,m.firstChild);}catch(e){}};
  if(r&&typeof r.then==="function")r.then(fix);setTimeout(fix,400);
  return r;
};

/* ---------- 9. Belt and braces: some add-ons re-render through captured references, so watch the page ---------- */
function fixCompete(){try{if(view==="compete"&&!isBloke())prune($("main"),["blokes"]);}catch(e){}}
function fixCardio(){try{if(view!=="cardio")return;var m=$("main");var t=m.querySelector(".subTabs");if(t&&!t.querySelector("[data-hy]")){var b=document.createElement("button");b.setAttribute("data-hy","1");b.textContent="HYROX";b.setAttribute("onclick","go('hyrox')");t.insertBefore(b,t.firstChild);}var hk=m.querySelector(".heroKicker"),ht=m.querySelector(".heroTitle");if(hk&&hk.textContent!=="Race, Climb & Compete")hk.textContent="Race, Climb & Compete";if(ht&&ht.textContent!=="HYROX, Cardio & Member Challenges")ht.textContent="HYROX, Cardio & Member Challenges";}catch(e){}}
function fixHyrox(){try{if(view!=="hyrox")return;var b=$("main").querySelector(".backBtn");if(b&&/Home/i.test(b.textContent)){b.textContent="\u2039 Back To Challenges";b.setAttribute("onclick","go('cardio')");}}catch(e){}}
function fixClasses(){try{if(view!=="classes")return;var m=$("main");if(m.querySelector("#smWeek"))return;var back=m.querySelector(".backBtn");if(!back)return;var b=document.createElement("button");b.id="smWeek";b.className="btnLink";b.style.cssText="display:block;margin:-4px 0 12px;font-size:11.5px;letter-spacing:1px;text-transform:uppercase;font-weight:800;color:var(--gold);background:none;border:0;padding:0;cursor:pointer";b.textContent="See the full week\u2019s timetable \u203a";b.setAttribute("onclick","go('timetable')");back.insertAdjacentElement("afterend",b);}catch(e){}}
function fixProfile(){try{if(view!=="profile")return;var m=$("main");if(m.querySelector(".smRow"))return;var hero=m.querySelector(".hero");if(!hero)return;var w=document.createElement("div");w.innerHTML='<button class="smRow" onclick="go(\'shop\')"><span><div class="k">Official store</div><div class="t">Store &amp; Credit</div><div class="s">Hoodies, tees &amp; gear \u2014 spend your credit here.</div></span><span class="a">\u203a</span></button>'+(isStaff()?'<button class="smRow" onclick="go(\'staff\')"><span><div class="k">Staff eyes only</div><div class="t">Staff Room</div><div class="s">Team chat, daily tasks &amp; PT commissions.</div></span><span class="a">\u203a</span></button>':'');Array.prototype.slice.call(w.childNodes).reverse().forEach(function(n){hero.insertAdjacentElement("afterend",n);});}catch(e){}}
function fixAll(){fixHome();fixCompete();fixCardio();fixHyrox();fixClasses();fixProfile();}
var pend=null;function schedule(){if(pend)return;pend=setTimeout(function(){pend=null;fixAll();},40);}
try{var mo=new MutationObserver(schedule);var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true,subtree:true});}catch(e){}
try{var navEl=document.getElementById("nav");if(navEl)new MutationObserver(function(){try{if(navEl.querySelectorAll(".navBtn").length===5)renderNav();}catch(e){}}).observe(navEl,{childList:true});}catch(e){}

/* ---------- 10. Anything already on screen gets the treatment ---------- */
try{renderNav();fixAll();}catch(e){}
})();
