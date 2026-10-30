/* ===== Legacy Gym Podcast tab (11 Oct 2026, ep2 18 Oct) ===== newest episode first: EPS[0] is what the player opens on.
   Self-hosted episodes — audio files live in the repo (copied to public/ by make-icons.mjs).
   Add an episode: drop the compressed .m4a in the repo root, add it to make-icons.mjs, add a row to EPS. */
(function(){
var LOGO=(typeof FC_LOGO!=="undefined")?FC_LOGO:"https://www.legacygym.net/cdn/shop/t/28/assets/fightclub-logo.png";
var EPS=[
  {id:"fc-ep3",n:3,title:"Fight Club Ep 3",date:"2026-10-30",dur:1798,src:"/fight-club-ep3.m4a",
   blurb:"Week 3 of Fight Club. Where the camp's at, the honest pros and cons so far (fear, fitness, fundamentals, confidence, real ring work), and why this is the phase where people go quiet and staying in touch matters most."},
  {id:"fc-ep2",n:2,title:"Fight Club EP-2",date:"2026-10-18",dur:2155,src:"/fight-club-ep2.m4a",
   blurb:"Episode two of the Legacy Gym Podcast. More from inside Fight Club as the camp rolls on towards Fight Night, Sat 19 Dec."},
  {id:"fc-ep1",n:1,title:"Fight Club EP-1",date:"2026-10-11",dur:1254,src:"/fight-club-ep1.m4a",
   blurb:"Episode one of the Legacy Gym Podcast. Jake on Fight Club — the 10-week camp, what it takes and what’s coming."}
];
var P={ep:null,audio:null,rate:1,tick:null,stats:null};
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
function devId(){try{var d=localStorage.getItem("lg_dev");if(!d){d=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2));localStorage.setItem("lg_dev",d);}return d;}catch(e){return "nolocal";}}
function logStart(ep){try{var k="lg_pod_started_"+ep.id;if(localStorage.getItem(k))return;localStorage.setItem(k,"1");}catch(e){}
  try{sb.from("podcast_plays").insert({episode_id:ep.id,device_id:devId(),user_id:(session&&session.user)?session.user.id:null,source:"app"}).then(function(){});}catch(e){}}
function isJake(){return !!(session&&session.user&&session.user.id===JAKE);}
function loadStats(ep){if(!isJake())return;try{sb.rpc("podcast_stats",{ep:ep.id}).then(function(r){P.stats=(r&&r.data)||null;paintStats();});}catch(e){}}
function paintStats(){var el=$id("pdxStats");if(!el)return;var s=P.stats;if(!s){el.innerHTML="";return;}
  el.innerHTML='<div class="st"><div><b>'+s.listeners+'</b><small>Started listening</small></div><div><b>'+s.app+'</b><small>In the app</small></div><div><b>'+s.web+'</b><small>Via the link</small></div><div><b>'+s.today+'</b><small>Last 24 hrs</small></div></div><div class="stn">Only you can see this. One tap per device counts once.</div>';}
var KEY=function(ep){return "lg_pod_pos_"+ep.id;};
var T=function(m){try{toast(m);}catch(e){}};
var $id=function(i){return document.getElementById(i);};
function fmt(s){s=Math.max(0,Math.floor(s||0));var m=Math.floor(s/60),x=s%60;return m+":"+(x<10?"0":"")+x;}
function fmtDate(d){try{return new Date(d+"T12:00:00").toLocaleDateString("en-AU",{day:"numeric",month:"short",year:"numeric"});}catch(e){return d;}}
function pos(ep){try{return +localStorage.getItem(KEY(ep))||0;}catch(e){return 0;}}
function savePos(){if(!P.ep||!P.audio)return;try{var t=P.audio.currentTime;if(P.audio.duration&&t>P.audio.duration-20)t=0;localStorage.setItem(KEY(P.ep),String(Math.floor(t)));}catch(e){}}

/* ---- css ---- */
var css='.pdx{max-width:640px;margin:0 auto}.pdx .back{background:none;border:0;color:var(--gold,#c9a44c);font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 14px;cursor:pointer}'
+'.pdx .hd{display:flex;align-items:center;gap:14px;margin-bottom:18px}.pdx .hd img{width:74px;height:74px;object-fit:contain;flex:none}'
+'.pdx .hd .k{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#F1D27A}.pdx .hd .t{font-family:Oswald,sans-serif;font-size:30px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff;line-height:1}.pdx .hd .s{font-size:12px;color:var(--muted,#9a968c);margin-top:4px}'
+'.pdx .player{border:2px solid #8a7136;border-radius:16px;padding:20px 18px 18px;background:linear-gradient(160deg,#1a1508,#0b0a08);margin-bottom:18px}'
+'.pdx .player .ep{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#F1D27A}.pdx .player .nm{font-family:Oswald,sans-serif;font-size:24px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fff;margin:4px 0 2px;line-height:1.1}.pdx .player .meta{font-size:11.5px;color:var(--muted,#9a968c)}'
+'.pdx .scrub{margin:18px 0 4px;-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:3px;background:linear-gradient(90deg,var(--gold,#c9a44c) var(--p,0%),#2a2619 var(--p,0%));outline:0}'
+'.pdx .scrub::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:3px solid var(--gold,#c9a44c);box-shadow:0 2px 8px rgba(0,0,0,.5)}.pdx .scrub::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid var(--gold,#c9a44c)}'
+'.pdx .times{display:flex;justify-content:space-between;font-size:11px;font-weight:700;color:var(--muted,#9a968c);font-variant-numeric:tabular-nums}'
+'.pdx .ctl{display:flex;align-items:center;justify-content:center;gap:22px;margin-top:14px}.pdx .ctl button{background:none;border:0;color:#fff;cursor:pointer;font-weight:800;font-size:11px;letter-spacing:1px}'
+'.pdx .ctl .skip{width:54px;height:54px;border-radius:50%;border:1px solid #3a3320;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f2f0eb;line-height:1}.pdx .ctl .skip b{font-size:15px;font-weight:900}.pdx .ctl .skip small{font-size:9px;letter-spacing:.5px;color:var(--muted,#9a968c)}'
+'.pdx .ctl .play{width:78px;height:78px;border-radius:50%;background:var(--gold,#c9a44c);color:#0b0b0c;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(201,164,76,.35)}.pdx .ctl .play svg{width:34px;height:34px;fill:#0b0b0c}'
+'.pdx .rate{display:flex;justify-content:center;gap:8px;margin-top:16px}.pdx .rate button{background:#15130c;border:1px solid #3a3320;color:#c9c6be;border-radius:999px;padding:6px 13px;font-size:11px;font-weight:800;cursor:pointer}.pdx .rate button.on{background:var(--gold,#c9a44c);color:#0b0b0c;border-color:var(--gold,#c9a44c)}'
+'.pdx .blurb{font-size:13px;color:#c9c6be;line-height:1.55;margin-top:16px;padding-top:14px;border-top:1px solid #2a2619}'
+'.pdx .sec{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--muted,#9a968c);margin:6px 0 10px}'
+'.pdx .epRow{display:flex;align-items:center;gap:14px;width:100%;text-align:left;background:var(--card,#121212);border:1px solid var(--line,#222);border-radius:14px;padding:14px 16px;margin-bottom:10px;color:#fff;cursor:pointer}.pdx .epRow.on{border-color:var(--gold,#c9a44c)}'
+'.pdx .epRow .n{width:44px;height:44px;border-radius:12px;background:#1a1508;border:1px solid #3a3320;display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-weight:700;font-size:18px;color:#F1D27A;flex:none}'
+'.pdx .epRow .tt{font-family:Oswald,sans-serif;font-size:17px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}.pdx .epRow .mm{font-size:11px;color:var(--muted,#9a968c);margin-top:2px}.pdx .epRow .pg{height:3px;background:#2a2619;border-radius:2px;margin-top:8px;overflow:hidden}.pdx .epRow .pg i{display:block;height:100%;background:var(--gold,#c9a44c)}'
+'.pdxCard{position:relative;overflow:hidden;display:flex;width:100%;text-align:left;border:2px solid #8a7136;border-radius:14px;padding:22px 22px 20px;margin-bottom:14px;color:#f2f0eb;min-height:150px;flex-direction:column;justify-content:flex-end;cursor:pointer;background:linear-gradient(90deg,rgba(13,13,13,.98) 0%,rgba(13,13,13,.96) 52%,rgba(13,13,13,.3) 100%),url("'+LOGO+'") right 30px center/124px no-repeat #0d0d0d}'
+'.pdxCard .k{font-size:10px;font-weight:700;letter-spacing:3px;color:#F1D27A;text-transform:uppercase;margin-bottom:7px}.pdxCard .t{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fff;line-height:1.05}.pdxCard .s{font-size:12px;color:#c9c6be;margin-top:7px;line-height:1.5;padding-right:120px}'
+'.pdx .st{display:flex;gap:6px;margin:0 0 14px}.pdx .st>div{flex:1;text-align:center;background:#15130c;border:1px solid #3a3320;border-radius:12px;padding:10px 4px}.pdx .st b{display:block;font-family:Oswald,sans-serif;font-size:24px;font-weight:700;color:#F1D27A;line-height:1}.pdx .st small{display:block;font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:var(--muted,#9a968c);margin-top:5px;line-height:1.3}.pdx .stn{font-size:10px;color:var(--muted,#9a968c);text-align:center;margin:-6px 0 14px}'
+'.pdxCard .new{position:absolute;top:12px;right:14px;font-size:9px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#0b0b0c;background:#F1D27A;border-radius:999px;padding:4px 9px}';
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

/* ---- audio ---- */
function audio(){
  if(P.audio)return P.audio;
  var a=new Audio();a.preload="metadata";a.playsInline=true;
  a.addEventListener("timeupdate",function(){paintTime();if(Math.floor(a.currentTime)%5===0)savePos();});
  a.addEventListener("loadedmetadata",paintTime);
  a.addEventListener("ended",function(){savePos();paintPlay();T("That’s the end of the episode.");});
  a.addEventListener("play",function(){paintPlay();if(P.ep)logStart(P.ep);});a.addEventListener("pause",function(){savePos();paintPlay();});
  a.addEventListener("error",function(){T("Couldn’t load the audio — check your connection and try again.");});
  P.audio=a;return a;
}
function loadEp(ep,autoplay){
  var a=audio();
  if(P.ep&&P.ep.id===ep.id){if(autoplay)a.play().catch(function(){});return;}
  savePos();P.ep=ep;a.src=ep.src;a.playbackRate=P.rate;
  var p=pos(ep);a.addEventListener("loadedmetadata",function once(){a.removeEventListener("loadedmetadata",once);if(p>5&&p<a.duration-10){a.currentTime=p;}paintTime();});
  a.load();
  try{if("mediaSession" in navigator){navigator.mediaSession.metadata=new MediaMetadata({title:ep.title,artist:"Legacy Gym Podcast",album:"Legacy Gym",artwork:[{src:LOGO,sizes:"512x512",type:"image/png"}]});
    navigator.mediaSession.setActionHandler("play",function(){a.play();});navigator.mediaSession.setActionHandler("pause",function(){a.pause();});
    navigator.mediaSession.setActionHandler("seekbackward",function(){skip(-15);});navigator.mediaSession.setActionHandler("seekforward",function(){skip(15);});}}catch(e){}
  if(autoplay)a.play().catch(function(){});
  paint();
}
function skip(n){var a=audio();a.currentTime=Math.max(0,Math.min((a.duration||P.ep.dur)-0.5,a.currentTime+n));paintTime();}
window.pdxPlay=function(){var a=audio();if(!P.ep)loadEp(EPS[0],true);else if(a.paused)a.play().catch(function(){T("Tap play again.");});else a.pause();};
window.pdxSkip=skip;
window.pdxSeek=function(v){var a=audio();var d=a.duration||P.ep.dur;a.currentTime=d*(+v/1000);paintTime();};
window.pdxRate=function(r){P.rate=r;audio().playbackRate=r;try{localStorage.setItem("lg_pod_rate",String(r));}catch(e){}paintRate();};
window.pdxOpen=function(id){var ep=EPS.find(function(e){return e.id===id;});if(!ep)return;loadEp(ep,true);try{window.scrollTo(0,0);}catch(e){}};
window.pdxEnter=function(){if(!session){T("Sign in first");return;}go("podcast");};
try{P.rate=+localStorage.getItem("lg_pod_rate")||1;}catch(e){}
/* count back: anyone who pressed play before the tally existed has a saved position on their device — log them on their next visit */
function backfill(){EPS.forEach(function(ep){try{if(localStorage.getItem("lg_pod_started_"+ep.id))return;if(pos(ep)>0)logStart(ep);}catch(e){}});}
setTimeout(backfill,2500);

/* ---- paint ---- */
function paintTime(){var a=P.audio;if(!a||!P.ep)return;var d=a.duration||P.ep.dur,t=a.currentTime||0;var s=$id("pdxScrub");if(s&&document.activeElement!==s){s.value=Math.round(t/d*1000);s.style.setProperty("--p",(t/d*100)+"%");}var c=$id("pdxCur"),r=$id("pdxRem");if(c)c.textContent=fmt(t);if(r)r.textContent="-"+fmt(d-t);}
function paintPlay(){var b=$id("pdxPlayBtn");if(!b)return;var playing=P.audio&&!P.audio.paused;b.innerHTML=playing?'<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';}
function paintRate(){var w=$id("pdxRate");if(!w)return;w.querySelectorAll("button").forEach(function(b){b.classList.toggle("on",+b.dataset.r===P.rate);});}
function paint(){
  if(view!=="podcast")return;
  var main=$id("main");if(!main)return;
  var ep=P.ep||EPS[0];var p=pos(ep);
  var h='<div class="pdx"><button class="back" onclick="go(\'home\')">‹ Home</button>'
   +'<div class="hd"><img src="'+LOGO+'" alt=""><div><div class="k">Legacy Gym</div><div class="t">Podcast</div><div class="s">Straight from the gym floor. Listen in the app, no other apps needed.</div></div></div>'
   +(isJake()?'<div id="pdxStats"></div>':'')
   +'<div class="player"><div class="ep">Episode '+ep.n+' · '+fmtDate(ep.date)+'</div><div class="nm">'+ep.title+'</div><div class="meta">'+Math.round(ep.dur/60)+' min'+(p>5&&!(P.ep&&P.ep.id===ep.id)?' · picks up where you left off ('+fmt(p)+')':'')+'</div>'
   +'<input id="pdxScrub" class="scrub" type="range" min="0" max="1000" value="0" oninput="pdxSeek(this.value)">'
   +'<div class="times"><span id="pdxCur">'+fmt(P.ep?0:p)+'</span><span id="pdxRem">-'+fmt(ep.dur-(P.ep?0:p))+'</span></div>'
   +'<div class="ctl"><button class="skip" onclick="pdxSkip(-15)"><b>↺</b><small>15</small></button><button class="play" id="pdxPlayBtn" onclick="pdxPlay()"></button><button class="skip" onclick="pdxSkip(15)"><b>↻</b><small>15</small></button></div>'
   +'<div class="rate" id="pdxRate">'+[1,1.25,1.5,2].map(function(r){return '<button data-r="'+r+'" onclick="pdxRate('+r+')">'+r+'×</button>';}).join("")+'</div>'
   +'<div class="blurb">'+ep.blurb+'</div></div>'
   +'<div class="sec">Episodes</div>'
   +EPS.map(function(e){var q=pos(e),pct=Math.min(100,Math.round(q/e.dur*100));return '<button class="epRow'+(ep.id===e.id?' on':'')+'" onclick="pdxOpen(\''+e.id+'\')"><div class="n">'+e.n+'</div><div style="flex:1;min-width:0"><div class="tt">'+e.title+'</div><div class="mm">'+fmtDate(e.date)+' · '+Math.round(e.dur/60)+' min'+(pct>=95?' · Finished ✓':pct>0?' · '+pct+'% played':'')+'</div>'+(pct>0&&pct<95?'<div class="pg"><i style="width:'+pct+'%"></i></div>':'')+'</div><div style="color:var(--gold,#c9a44c);font-size:22px">›</div></button>';}).join("")
   +'<p style="font-size:11px;color:var(--muted,#9a968c);text-align:center;margin-top:14px">Works with the screen locked. Your spot is saved on this phone.</p></div>';
  main.innerHTML=h;paintPlay();paintRate();paintTime();paintStats();loadStats(ep);
}

/* ---- home card ---- */
function cardHtml(){var ep=EPS[EPS.length-1];var p=pos(ep);var sub=p>5?"Pick up "+ep.title+" where you left off — "+fmt(p)+" in.":ep.title+" is live — "+Math.round(ep.dur/60)+" minutes, straight from the gym. Hit play.";
  return '<button class="pdxCard" id="pdxCard" onclick="pdxEnter()"><span class="new">New episode</span><div class="k">Legacy Gym Podcast</div><div class="t">Podcast</div><div class="s">'+sub+'</div></button>';}
function injectCard(){
  var main=$id("main");if(!main||view!=="home")return;if($id("pdxCard"))return;
  var wrap=document.createElement("div");wrap.innerHTML=cardHtml();var card=wrap.firstChild;
  var fc=$id("fcxCard");
  if(fc){fc.insertAdjacentElement("afterend",card);return;}
  var cards=main.querySelectorAll(".homeCard");var anchor=null;
  for(var i=0;i<cards.length;i++){if((cards[i].getAttribute("onclick")||"").indexOf("'boxing'")>=0){anchor=cards[i];break;}}
  if(anchor)anchor.insertAdjacentElement("afterend",card);else if(cards.length)cards[0].insertAdjacentElement("beforebegin",card);else main.appendChild(card);
}
/* keep the card below the Fight Club card even when fc.js injects later */
setInterval(function(){if(view!=="home")return;var c=$id("pdxCard"),fc=$id("fcxCard");if(!c)injectCard();else if(fc&&fc.nextElementSibling!==c)fc.insertAdjacentElement("afterend",c);},700);

/* ---- hooks ---- */
var _render=window.render;window.render=function(){if(view==="podcast")return paint();return _render.apply(this,arguments);};
if(typeof NAV_TAB!=="undefined")try{NAV_TAB.podcast="home";}catch(e){}
["renderHome"].forEach(function(fn){if(typeof window[fn]!=="function")return;var o=window[fn];window[fn]=function(){var r=o.apply(this,arguments);var after=function(){injectCard();};if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,60);return r;};});
setTimeout(function(){if(view==="home")injectCard();},900);
window.addEventListener("pagehide",savePos);document.addEventListener("visibilitychange",function(){if(document.hidden)savePos();});
})();
