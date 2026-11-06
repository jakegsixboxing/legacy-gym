/* ===== LEGACY TRAINING CAMP · USA × Mexico 2027 teaser (6 Nov 2026) =====
   Home card for every member until SHOW_UNTIL, opens view "camp" (brief insight + register interest).
   Data: table camp_interest via RPCs camp_interest_register / camp_interest_mine (members), camp_interest_list (Jake & Alison). */
(function(){
"use strict";
var SHOW_UNTIL=new Date("2026-11-13T23:59:00+11:00"); /* a week from launch; after this the home card goes, the page still opens */
var ADMINS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"]; /* Jake, Alison */
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";function isJake(){try{return !!(session&&session.user&&session.user.id===JAKE);}catch(e){return false;}}
function isAdmin(){try{return !!(session&&session.user&&ADMINS.indexOf(session.user.id)>=0);}catch(e){return false;}}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
var IMG="/img/camp/";
var S={mine:undefined,busy:false,list:null,showList:false,member:null,done:false,views:null,showViews:false,logged:false};

/* ---------- CSS (Legacy gold) ---------- */
var css=document.createElement("style");css.textContent=
"#campHome{display:block;width:100%;text-align:left;padding:0;margin:0 0 11px;border:1px solid #D2B26A;border-radius:16px;background:#131315;color:#f2f0eb;cursor:pointer;font-family:inherit;overflow:hidden;box-shadow:0 0 0 1px rgba(210,178,106,.12),0 0 24px rgba(210,178,106,.14),0 16px 36px rgba(0,0,0,.45)}"
+"#campHome .im{position:relative;height:150px;background:url("+IMG+"poster-top.jpg) center 22%/cover}#campHome .im:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(9,9,10,0) 45%,#131315 100%)}"
+"#campHome .bd{position:absolute;top:10px;left:10px;z-index:2;background:#D2B26A;color:#09090A;font-family:Oswald,sans-serif;font-weight:700;font-size:10px;letter-spacing:2px;padding:4px 8px;border-radius:4px}"
+"#campHome .tx{padding:2px 14px 12px}#campHome .k{font-size:8px;font-weight:800;letter-spacing:2.5px;color:#D2B26A;text-transform:uppercase}#campHome .t{font-family:Oswald,sans-serif;font-size:24px;font-weight:700;text-transform:uppercase;line-height:1;margin-top:3px;color:#fff}#campHome .t span{color:#D2B26A;font-weight:400}"
+"#campHome .s{font-size:11px;color:#9c978e;margin-top:5px;line-height:1.4}#campHome .a{display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:9px;border-top:1px solid #27272b;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#fff}#campHome .a i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#D2B26A;margin-right:7px;animation:campPulse 2s infinite}"
+"@keyframes campPulse{0%{box-shadow:0 0 0 0 rgba(210,178,106,.6)}70%{box-shadow:0 0 0 9px rgba(210,178,106,0)}100%{box-shadow:0 0 0 0 rgba(210,178,106,0)}}"
+".camp{max-width:520px;margin:0 auto;padding-bottom:110px;color:#f2eee6;--gold:#D2B26A;--mute:#9c978e;--line:#27272b;--raise:#131315;--raise2:#1a1a1d}.camp *{box-sizing:border-box}"
+".camp .back{background:none;border:0;color:var(--gold);font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 10px;cursor:pointer;font-family:inherit}"
+".camp .poster{display:block;width:100%;height:auto;border-radius:14px}.camp .fl{display:flex;height:3px;margin-top:6px;border-radius:2px;overflow:hidden}.camp .fl i{flex:1}"
+".camp .lab{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}"
+".camp .big{font-family:Oswald,sans-serif;font-weight:300;font-size:26px;line-height:1.15;text-transform:uppercase;margin:12px 0 0}.camp .big em{font-style:normal;color:var(--gold)}"
+".camp .copy{color:var(--mute);font-size:14px;line-height:1.6;margin:12px 0 0}"
+".camp .facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-top:22px;background:linear-gradient(90deg,rgba(178,34,52,.12),rgba(9,9,10,0) 35%,rgba(9,9,10,0) 65%,rgba(0,104,71,.14))}.camp .facts div{padding:14px 0;text-align:center}.camp .facts div+div{border-left:1px solid var(--line)}.camp .facts b{display:block;font-family:Oswald,sans-serif;font-weight:500;font-size:20px;letter-spacing:.5px;color:#fff}.camp .facts small{display:block;font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--mute);margin-top:3px}"
+".camp h2{font-family:Oswald,sans-serif;font-weight:400;font-size:24px;text-transform:uppercase;line-height:1;margin:10px 0 0;color:#fff}.camp .sec{margin-top:36px}"
+".camp .who{display:grid;gap:10px;margin-top:16px}.camp .who article{background:linear-gradient(135deg,var(--raise2),var(--raise));border:1px solid var(--line);border-radius:14px;overflow:hidden;display:grid;grid-template-columns:104px 1fr;position:relative}.camp .who article:after{content:'';position:absolute;right:0;top:0;bottom:0;width:3px}.camp .who article.us:after{background:linear-gradient(180deg,#B22234 0 33%,#F4F1EA 33% 66%,#3C3B6E 66%)}.camp .who article.mx:after{background:linear-gradient(180deg,#006847 0 33%,#F4F1EA 33% 66%,#CE1126 66%)}"
+".camp .who img{width:104px;height:100%;min-height:140px;object-fit:cover;display:block}.camp .who .t{padding:14px}.camp .who .tag{font-size:9px;font-weight:800;letter-spacing:2px;color:var(--gold);text-transform:uppercase}.camp .who h3{font-family:Oswald,sans-serif;font-weight:500;font-size:17px;letter-spacing:.5px;text-transform:uppercase;margin:4px 0 0;color:#fff}.camp .who p{color:var(--mute);font-size:12.5px;line-height:1.5;margin:6px 0 0}"
+".camp .exp{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.camp .exp div{position:relative;min-height:160px;border-radius:14px;overflow:hidden;border:1px solid var(--line);padding:14px;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;background-size:cover;background-position:center;isolation:isolate}.camp .exp div:before{content:'';position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(9,9,10,.08) 0%,rgba(9,9,10,.55) 55%,rgba(9,9,10,.92) 100%)}"
+".camp .exp .k{position:absolute;top:12px;left:14px;width:22px;height:2px;background:var(--gold)}.camp .exp b{font-family:Oswald,sans-serif;font-weight:500;font-size:18px;letter-spacing:2px;text-transform:uppercase;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.6)}.camp .exp small{font-size:11.5px;color:#d8d2c8;line-height:1.4;text-shadow:0 1px 8px rgba(0,0,0,.7)}"
+".camp .exp .train{background-image:url("+IMG+"fortune-mural.jpg);background-position:center 42%}.camp .exp .spar{background-image:url("+IMG+"grampas-sparring.jpg);background-position:30% 35%}.camp .exp .eat{background-image:url("+IMG+"eat.jpg)}.camp .exp .explore{background-image:url("+IMG+"explore.jpg);background-position:center 55%}"
+".camp .quote{margin-top:48px;text-align:center}.camp .quote .fl{width:60px;margin:0 auto 14px}.camp .quote h2{font-size:30px;font-weight:500;line-height:1.05}.camp .quote h2 span{color:var(--gold)}.camp .quote p{color:var(--mute);font-size:13px;margin:12px auto 0;max-width:30ch;line-height:1.5}"
+".camp .cta{display:block;width:100%;min-height:52px;border:0;border-radius:12px;background:var(--gold);color:#09090A;font-family:Oswald,sans-serif;font-weight:700;font-size:16px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;margin-top:22px}.camp .cta.done{background:var(--raise);color:var(--gold);border:1px solid var(--gold)}"
+".camp .ad{margin-top:18px;border:1px dashed var(--line);border-radius:12px;padding:10px 12px;font-size:12px;color:var(--mute);display:flex;justify-content:space-between;align-items:center;gap:10px}.camp .ad button{background:none;border:1px solid var(--gold);color:var(--gold);border-radius:8px;padding:6px 10px;font-family:inherit;font-weight:800;font-size:11px;cursor:pointer}"
+".camp table{width:100%;border-collapse:collapse;font-size:12px;margin-top:10px}.camp td{padding:8px 6px;border-bottom:1px solid var(--line);vertical-align:top}.camp td.m{color:var(--mute);white-space:nowrap}"
+".camp .tk{margin-top:12px;border:1px solid var(--gold);border-radius:12px;padding:12px;background:linear-gradient(135deg,#1a1710,#131315)}.camp .tk .h{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;color:var(--mute)}.camp .tk .h b{color:#fff;font-family:Oswald,sans-serif;font-size:15px;letter-spacing:1px;text-transform:uppercase}.camp .tk .n{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.camp .tk .n div{background:#09090A;border-radius:8px;padding:8px 6px;text-align:center}.camp .tk .n b{display:block;font-family:Oswald,sans-serif;font-size:22px;color:var(--gold);line-height:1}.camp .tk .n small{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute)}.camp .tk button{background:none;border:1px solid var(--gold);color:var(--gold);border-radius:8px;padding:6px 10px;font-family:inherit;font-weight:800;font-size:11px;cursor:pointer}.camp .tk td.r{color:#39FF88;font-size:10px;font-weight:800;letter-spacing:1px}"
+"#campScrim{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.66);display:flex;align-items:flex-end;justify-content:center}#campSheet{width:100%;max-width:520px;background:#131315;border-radius:20px 20px 0 0;border-top:1px solid #27272b;padding:12px 20px calc(26px + env(safe-area-inset-bottom,0px));max-height:92vh;overflow-y:auto;color:#f2eee6;font-family:Montserrat,sans-serif}"
+"#campSheet .grab{width:38px;height:4px;border-radius:2px;background:#27272b;margin:0 auto 20px}#campSheet h3{font-family:Oswald,sans-serif;font-weight:500;font-size:26px;text-transform:uppercase;margin:8px 0 0;color:#fff}#campSheet .lab{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#D2B26A}"
+"#campSheet label{display:block;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#9c978e;font-weight:800;margin:18px 0 6px}#campSheet input{width:100%;min-height:46px;border-radius:10px;border:1px solid #27272b;background:#09090A;color:#f2eee6;padding:0 14px;font:15px Montserrat,sans-serif;box-sizing:border-box}"
+"#campSheet .opt{display:flex;justify-content:space-between;align-items:center;width:100%;text-align:left;border:1px solid #27272b;background:#09090A;border-radius:10px;padding:12px 14px;min-height:46px;cursor:pointer;font:14px Montserrat,sans-serif;color:#f2eee6;margin-top:8px}#campSheet .opt i{width:18px;height:18px;border-radius:50%;border:1px solid #9c978e;flex:none;box-sizing:border-box}#campSheet .opt.on{border-color:#D2B26A}#campSheet .opt.on i{border:5px solid #D2B26A}"
+"#campSheet .go{display:block;width:100%;min-height:50px;border:0;border-radius:12px;background:#D2B26A;color:#09090A;font:600 14.5px Montserrat,sans-serif;cursor:pointer;margin-top:22px}#campSheet .go[disabled]{opacity:.6}#campSheet .ok{text-align:center;padding:16px 0 4px}#campSheet .ok p{color:#9c978e;font-size:13px;margin:8px 0 0}";
document.head.appendChild(css);

/* ---------- data ---------- */
async function loadMine(){try{var r=await sb.rpc("camp_interest_mine");S.mine=r.error?null:(r.data||null);}catch(e){S.mine=null;}}
async function loadList(){var r=await sb.rpc("camp_interest_list");if(r.error){T(r.error.message);return;}S.list=r.data||[];}

/* ---------- page ---------- */
function paint(){var m=$id("main");if(!m||view!=="camp")return;
  var done=!!S.mine;
  m.innerHTML='<div class="camp"><button class="back" onclick="go(\'home\')">‹ Home</button>'
  +'<img class="poster" src="'+IMG+'poster.jpg" alt="Legacy Training Camp · USA × Mexico 2027">'
  +'<div class="fl"><i style="background:#3C3B6E"></i><i style="background:#F4F1EA"></i><i style="background:#B22234"></i><i style="background:#006847"></i><i style="background:#F4F1EA"></i><i style="background:#CE1126"></i></div>'
  +'<div class="sec"><div class="lab">Coming 2027</div><p class="big">8–10 days travelling and training from the West Coast of America <em>down into Mexico.</em></p>'
  +'<p class="copy">From some of the most famous boxing gyms in the world to hidden gems only the locals know.</p>'
  +'<div class="facts"><div><b>8–10</b><small>Days</small></div><div><b>LA → MX</b><small>Route</small></div><div><b>All</b><small>Levels</small></div></div></div>'
  +'<div class="sec"><div class="lab">Who it\'s for</div><h2>Two ways to come</h2><div class="who">'
  +'<article class="us"><img src="'+IMG+'grampas-sparring.jpg" alt=""><div class="t"><div class="tag">Sparring camp</div><h3>Amateurs &amp; pros</h3><p>A sparring camp. Quality rounds and coaching in new gyms, against new styles.</p></div></article>'
  +'<article class="mx"><img src="'+IMG+'fortune-gloves.jpg" alt=""><div class="t"><div class="tag">The experience</div><h3>Members &amp; sparring club</h3><p>Train in the gyms, watch the sparring and experience boxing in a different culture.</p></div></article></div></div>'
  +'<div class="sec"><div class="lab">The experience</div><h2>More than a training trip</h2><div class="exp">'
  +'<div class="train"><span class="k"></span><b>Train</b><small>Famous gyms and hidden gems</small></div><div class="spar"><span class="k"></span><b>Spar</b><small>Watch it, or get in the ring</small></div>'
  +'<div class="eat"><span class="k"></span><b>Eat</b><small>Street food and markets</small></div><div class="explore"><span class="k"></span><b>Explore</b><small>LA, the coast and Mexico</small></div></div></div>'
  +'<div class="quote"><div class="fl"><i style="background:#B22234"></i><i style="background:#F4F1EA"></i><i style="background:#006847"></i></div><h2>The trip <span>of a lifetime.</span></h2><p>Places are limited. Register your interest to hear first when dates and details drop.</p>'
  +(done?'<button class="cta done" onclick="window.campOpen()">✓ You\'re on the list · edit</button>':'<button class="cta" onclick="window.campOpen()">Register interest</button>')+'</div>'
  +(isAdmin()?adminHtml():'')+'</div>';
}
function adminHtml(){var h=isJake()?trackerHtml():'';h+='<div class="ad"><span>Jake &amp; Alison · '+(S.list?S.list.length+' registered':'interest list')+'</span><button onclick="window.campList()">'+(S.showList?'Hide':'View list')+'</button></div>';
  if(S.showList&&S.list){h+='<table>'+(S.list.length?S.list.map(function(r){return '<tr><td><b>'+esc(r.name)+'</b><br><span style="color:#9c978e">'+esc(r.mobile)+'</span></td><td class="m">'+(r.is_member===true?'Member':r.is_member===false?'Not a member':'—')+'</td><td class="m">'+new Date(r.created_at).toLocaleDateString("en-AU",{day:"numeric",month:"short"})+'</td></tr>';}).join(''):'<tr><td style="color:#9c978e">No one yet.</td></tr>')+'</table>';}
  return h;}
function fmt(iso){return new Date(iso).toLocaleString('en-AU',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});}
function trackerHtml(){var v=S.views;var h='<div class="tk"><div class="h"><span><b>Who\'s had a look</b><br>Only you can see this</span><button onclick="window.campViews()">'+(v?(S.showViews?'Hide':'Show list'):'Load')+'</button></div>';
  if(v){h+='<div class="n"><div><b>'+v.total+'</b><small>Opens</small></div><div><b>'+v.people+'</b><small>Members</small></div><div><b>'+v.app+'</b><small>In app</small></div><div><b>'+v.web+'</b><small>Via link</small></div></div>';
   if(S.showViews){h+='<table>'+((v.rows||[]).length?v.rows.map(function(r){return '<tr><td><b>'+esc(r.name)+'</b>'+(r.registered?' <span class="r">REGISTERED</span>':'')+'<br><span style="color:#9c978e">Last '+fmt(r.last_at)+(r.opens>1?' · first '+fmt(r.first_at):'')+'</span></td><td class="m">'+r.opens+'×</td></tr>';}).join(''):'<tr><td style="color:#9c978e">No members have opened it yet.</td></tr>');
    if((v.web_days||[]).length)h+='<tr><td colspan="2" style="color:#9c978e">Via the public link: '+v.web_days.map(function(d){return d.opens+' on '+new Date(d.day).toLocaleDateString('en-AU',{day:'numeric',month:'short'});}).join(', ')+'</td></tr>';h+='</table>';}}
  return h+'</div>';}
window.campViews=async function(){if(!isJake())return;if(!S.views){var r=await sb.rpc('camp_views_report');if(r.error)return T(r.error.message);S.views=r.data;S.showViews=true;}else S.showViews=!S.showViews;paint();};
window.campList=async function(){if(!isAdmin())return;if(!S.list)await loadList();S.showList=!S.showList;paint();};
window.campEnter=function(){go("camp");};

/* ---------- register sheet ---------- */
window.campOpen=function(){if(!session){T("Sign in first.");return;}
  var mine=S.mine||{};var p=(typeof profile!=="undefined"&&profile)||{};
  var name=mine.name||((p.first_name||"")+" "+(p.last_name||"")).trim();var mob=mine.mobile||p.phone||"";
  S.member=(mine.is_member===true||mine.is_member===false)?mine.is_member:null;S.done=false;
  var d=document.createElement("div");d.id="campScrim";d.onclick=function(e){if(e.target===d)window.campClose();};
  d.innerHTML='<div id="campSheet"><div class="grab"></div><div id="campForm"><div class="lab">USA × Mexico 2027</div><h3>Register interest</h3>'
  +'<label for="campName">Name</label><input id="campName" value="'+esc(name)+'" autocomplete="name">'
  +'<label for="campMob">Mobile</label><input id="campMob" value="'+esc(mob)+'" type="tel" autocomplete="tel">'
  +'<label>Are you a member of Legacy Gym?</label>'
  +'<button type="button" class="opt'+(S.member===true?' on':'')+'" onclick="window.campMem(true)">Yes, I\'m a member of Legacy Gym<i></i></button>'
  +'<button type="button" class="opt'+(S.member===false?' on':'')+'" onclick="window.campMem(false)">No, I\'m not a member of Legacy Gym<i></i></button>'
  +'<button type="button" class="go" id="campGo" onclick="window.campSend()">I\'d be interested in more information</button></div></div>';
  document.body.appendChild(d);document.body.style.overflow="hidden";};
window.campClose=function(){var d=$id("campScrim");if(d)d.remove();document.body.style.overflow="";};
window.campMem=function(v){S.member=v;var b=document.querySelectorAll("#campSheet .opt");if(b[0])b[0].classList.toggle("on",v===true);if(b[1])b[1].classList.toggle("on",v===false);};
window.campSend=async function(){if(S.busy)return;var n=($id("campName")||{}).value||"",m=($id("campMob")||{}).value||"";
  if(n.trim().length<2)return T("Add your name.");if(m.replace(/\D/g,"").length<8)return T("Add a mobile number.");if(S.member===null)return T("Are you a Legacy Gym member? Pick one.");
  S.busy=true;var g=$id("campGo");if(g)g.disabled=true;
  var r=await sb.rpc("camp_interest_register",{p_name:n.trim(),p_mobile:m.trim(),p_member:S.member});S.busy=false;if(g)g.disabled=false;
  if(r.error)return T(r.error.message);
  S.mine={name:n.trim(),mobile:m.trim(),is_member:S.member};
  var f=$id("campForm");if(f)f.innerHTML='<div class="ok"><svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="25" fill="none" stroke="#D2B26A" stroke-width="1.5"/><path d="M16 27l7 7 13-15" fill="none" stroke="#D2B26A" stroke-width="2.5" stroke-linecap="round"/></svg><h3>You\'re on the list</h3><p>We\'ll let you know first when dates and details are released.</p><button class="go" onclick="window.campClose()">Done</button></div>';
  paint();};

/* ---------- hooks ---------- */
var _render=window.render;window.render=function(){if(view==="camp"){if(S.mine===undefined){var m=$id("main");if(m)m.innerHTML='<div class="loadingDots">Opening…</div>';loadMine().then(paint);if(!S.logged&&!isJake()){S.logged=true;try{sb.rpc('camp_view_log',{p_source:'app'});}catch(e){}}return;}paint();return;}return _render.apply(this,arguments);};
function homeCard(){var ex=$id("campHome");var mm=$id("main");if(ex&&mm&&view==="home"&&mm.firstElementChild!==ex){mm.insertAdjacentElement("afterbegin",ex);return;}
  if(!session||new Date()>SHOW_UNTIL){if(ex&&ex.parentNode)ex.parentNode.removeChild(ex);return;}
  if(view!=="home")return;var m=$id("main");if(!m||ex)return;
  var b=document.createElement("button");b.id="campHome";b.onclick=window.campEnter;
  b.innerHTML='<div class="im"><span class="bd">NEW · 2027</span></div><div class="tx"><div class="k">Legacy Training Camp</div><div class="t">USA <span>×</span> Mexico</div><div class="s">8–10 days training and travelling from LA into Mexico. All levels.</div><div class="a"><span><i></i>Get a brief insight</span><span>›</span></div></div>';
  m.insertAdjacentElement("afterbegin",b); /* very top of Home for everyone */
}
var _home=window.renderHome;if(typeof _home==="function"){window.renderHome=function(){var r=_home.apply(this,arguments);try{homeCard();setTimeout(homeCard,150);setTimeout(homeCard,700);}catch(e){}return r;};}
setInterval(function(){try{homeCard();}catch(e){}},1500);
})();
