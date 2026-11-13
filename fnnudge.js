/* ===== Fight Night \u00b7 fighter ticket reminder pop-up (14 Nov 2026, Jake) =====
   On a group's 24-hour buying day, each fighter in that group gets a Home pop-up with THEIR OWN friends on hold
   (still to buy / bought) and a one-tap reminder message in their name. Data: sb.rpc("fn_fighter_nudge") returns
   null for anyone who isn't a fighter in a group whose window is open right now. Names + held label only, no contact details.
   Jake/Ali preview: open the app with ?nudge=<fighter uuid>. */
(function(){
"use strict";
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function tc(s){return String(s||"").trim().split(/\s+/).map(function(w){return w.split("-").map(function(p){return (p===p.toLowerCase()||p===p.toUpperCase())?p.charAt(0).toUpperCase()+p.slice(1).toLowerCase():p;}).join("-");}).join(" ");}
function first(s){return tc(s).split(" ")[0]||"";}
function ini(s){var p=tc(s).split(" ");return ((p[0]||"?")[0]+(p[1]?p[1][0]:"")).toUpperCase();}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function ssGet(k){try{return sessionStorage.getItem(k);}catch(e){return N.mem[k]||null;}}
function ssSet(k,v){try{sessionStorage.setItem(k,v);}catch(e){}N.mem[k]=v;}

var N={d:null,at:0,busy:false,open:false,step:"list",target:null,mem:{},timer:null,tries:0};
var PREVIEW=(function(){var m=location.search.match(/[?&]nudge=([0-9a-f-]{36})/i);return m?m[1]:null;})();

var css=document.createElement("style");css.textContent=
".fnnOv{position:fixed;inset:0;z-index:9600;background:rgba(2,7,10,.72);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .28s}"
+".fnnOv.on{opacity:1}"
+".fnnSh{width:100%;max-width:520px;max-height:calc(100% - env(safe-area-inset-top,0px) - 14px);display:flex;flex-direction:column;background:#0f1a21;border:1px solid #1d2f3a;border-bottom:0;border-radius:22px 22px 0 0;color:#eef4f7;font-family:Montserrat,system-ui,sans-serif;transform:translateY(100%);transition:transform .38s cubic-bezier(.2,.9,.25,1)}"
+".fnnOv.on .fnnSh{transform:none}"
+".fnnHd{position:relative;padding:20px 18px 12px}"
+".fnnEy{display:flex;align-items:center;gap:8px;font:700 10.5px Montserrat,sans-serif;letter-spacing:1.8px;text-transform:uppercase;color:#1fb6e6}"
+".fnnEy i{width:7px;height:7px;border-radius:50%;background:#1fb6e6;box-shadow:0 0 0 4px rgba(31,182,230,.18)}"
+".fnnH{font:600 24px/1.12 Oswald,sans-serif;margin:10px 44px 6px 0;color:#fff}"
+".fnnP{margin:0;color:#c3d3dc;font-size:13.5px;line-height:1.5}"
+".fnnClk{display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding:9px 12px;border-radius:12px;background:#0a1318;border:1px solid #1d2f3a;font-size:12px;color:#8fa6b3}"
+".fnnClk b{font:600 17px Oswald,sans-serif;color:#fff;font-variant-numeric:tabular-nums}"
+".fnnX{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;border:1px solid #1d2f3a;background:#0d1a21;color:#9fb4c0;font-size:18px;line-height:1;cursor:pointer}"
+".fnnL{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 10px;border-top:1px solid #1d2f3a}"
+".fnnSec{display:flex;justify-content:space-between;font:700 10.5px Montserrat,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:#8fa6b3;padding:14px 8px 6px}"
+".fnnF{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px 8px}"
+".fnnF+.fnnF{border-top:1px solid #15222b}"
+".fnnAv{width:34px;height:34px;border-radius:50%;background:#16242d;display:grid;place-items:center;font:700 12px Montserrat,sans-serif;color:#cfe3ec}"
+".fnnF.ok .fnnAv{background:rgba(60,207,145,.15);color:#3ccf91}"
+".fnnNm{font-weight:700;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
+".fnnHl{font-size:11.5px;color:#8fa6b3}"
+".fnnRm{border:1px solid rgba(31,182,230,.6);background:transparent;color:#1fb6e6;font:800 11.5px Montserrat,sans-serif;letter-spacing:.6px;padding:8px 13px;border-radius:99px;cursor:pointer}"
+".fnnRm.sent{border-color:#1d2f3a;color:#8fa6b3}"
+".fnnOk{font:700 11.5px Montserrat,sans-serif;color:#3ccf91;white-space:nowrap}"
+".fnnFt{padding:12px 16px calc(14px + env(safe-area-inset-bottom,0px));border-top:1px solid #1d2f3a}"
+".fnnB{display:block;width:100%;border:0;border-radius:14px;padding:15px;font:800 14px Montserrat,sans-serif;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;background:#1fb6e6;color:#03131b}"
+".fnnB2{display:block;width:100%;border:0;background:transparent;color:#8fa6b3;font:700 13px Montserrat,sans-serif;padding:11px;cursor:pointer}"
+".fnnRow{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}"
+".fnnRow a,.fnnRow button{display:block;text-align:center;text-decoration:none;font:700 13px Montserrat,sans-serif;border-radius:12px;padding:13px 8px;border:1px solid #1d2f3a;background:#0d1a21;color:#fff;cursor:pointer}"
+".fnnMsg{background:#0a1318;border:1px solid #1d2f3a;border-radius:14px;padding:14px;margin:0 16px;font-size:13.5px;line-height:1.55;color:#e3ecf1;white-space:pre-wrap;overflow-y:auto;-webkit-user-select:text;user-select:text}"
+".fnnBody{flex:1;min-height:0;display:flex;flex-direction:column}"
+"#fnnCard{display:flex;align-items:center;gap:12px;width:100%;text-align:left;margin:0 0 12px;padding:14px 16px;border-radius:16px;border:1px solid rgba(31,182,230,.5);background:linear-gradient(90deg,#0b2430,#0b1319);color:#fff;font-family:Montserrat,sans-serif;cursor:pointer}"
+"#fnnCard .k{font:800 9.5px Montserrat,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:#7fe0ff}"
+"#fnnCard .t{font:600 18px/1.15 Oswald,sans-serif;margin-top:3px}"
+"#fnnCard .s{font-size:12px;color:#a9c3d1;margin-top:3px}"
+"#fnnCard .a{margin-left:auto;flex:none;font:800 11px Montserrat,sans-serif;letter-spacing:.8px;color:#03131b;background:#1fb6e6;border-radius:99px;padding:8px 12px}"
+"@media (prefers-reduced-motion:reduce){.fnnOv,.fnnSh{transition:none}}";
document.head.appendChild(css);

function key(){return N.d?("fnnSent:"+N.d.fighter_id+":"+N.d.closes_at):"fnnSent";}
function sentSet(){var s=lsGet(key());try{return s?JSON.parse(s):{};}catch(e){return {};}}
function markSent(ids){var s=sentSet();ids.forEach(function(i){s[i]=1;});lsSet(key(),JSON.stringify(s));}
function todo(){return (N.d&&N.d.guests||[]).filter(function(g){return !g.bought;});}
function done(){return (N.d&&N.d.guests||[]).filter(function(g){return g.bought;});}
function leftTxt(){var ms=Date.parse(N.d.closes_at)-Date.now();if(ms<=0)return "Closed";var h=Math.floor(ms/3600e3),m=Math.floor(ms%3600e3/60e3);return h+"h "+String(m).padStart(2,"0")+"m left";}
function closesTxt(){try{return new Date(N.d.closes_at).toLocaleString("en-AU",{timeZone:"Australia/Sydney",weekday:"short",hour:"numeric",minute:"2-digit"}).replace(/\s?(am|pm)/i,function(x){return x.trim().toLowerCase();});}catch(e){return "tomorrow 7:00am";}}
function message(to){
  var me=first(N.d.first),hi=to?"Hey "+first(to.name)+", it's "+me+".":"Hey guys, it's "+me+".";
  return hi+" Just wanted to say a big thanks again for coming to support me on Saturday 19 December.\n\n"
   +"Quick reminder: your 24-hour ticket window opened today at 7am and closes tomorrow at 7am.\n\n"
   +"Your ticket link is in your email from Fight Club Central Coast. If you can't find it, check your spam or junk folder.\n\n"
   +"Once the window closes, any tickets not bought go back to the public.";
}

async function load(force){
  if(N.busy)return N.d;if(!force&&N.d&&Date.now()-N.at<60000)return N.d;
  N.busy=true;
  try{var r=await sb.rpc("fn_fighter_nudge",PREVIEW?{p_preview:PREVIEW}:{});if(!r.error){N.d=r.data||null;N.at=Date.now();}}catch(e){}
  N.busy=false;return N.d;
}

function listHtml(){
  var s=sentSet(),a=todo(),b=done();
  var h='<div class="fnnSec"><span>Still to buy</span><span>'+a.length+'</span></div>';
  h+=a.length?a.map(function(g){var on=!!s[g.id];return '<div class="fnnF"><div class="fnnAv">'+esc(ini(g.name))+'</div><div style="min-width:0"><div class="fnnNm">'+esc(tc(g.name))+'</div><div class="fnnHl">'+esc(g.held||"")+'</div></div><button type="button" class="fnnRm'+(on?' sent':'')+'" data-nn="one" data-id="'+g.id+'">'+(on?'Sent':'Remind')+'</button></div>';}).join("")
   :'<div class="fnnF"><div class="fnnHl" style="grid-column:1/-1;padding:4px 0">Everyone on hold has bought. Legend.</div></div>';
  if(b.length){h+='<div class="fnnSec"><span>Bought</span><span>'+b.length+'</span></div>'+b.map(function(g){return '<div class="fnnF ok"><div class="fnnAv">'+esc(ini(g.name))+'</div><div style="min-width:0"><div class="fnnNm">'+esc(tc(g.name))+'</div><div class="fnnHl">'+esc(g.held||"")+'</div></div><span class="fnnOk">\u2713 Bought</span></div>';}).join("");}
  return h;
}
function sheetHtml(){
  var d=N.d,a=todo();
  if(N.step==="msg"){
    var to=N.target,msg=message(to);
    return '<div class="fnnSh" role="dialog" aria-modal="true" aria-label="Reminder message"><div class="fnnHd"><button type="button" class="fnnX" data-nn="back" aria-label="Back">\u2039</button>'
     +'<div class="fnnEy"><i></i>'+(to?'Message to '+esc(tc(to.name)):'Message to everyone still to buy')+'</div></div>'
     +'<div class="fnnBody"><div class="fnnMsg">'+esc(msg)+'</div></div>'
     +'<div class="fnnFt"><button type="button" class="fnnB" data-nn="send">Send</button>'
     +'<div class="fnnRow"><a href="sms:?&body='+encodeURIComponent(msg)+'" data-nn="sms">Text it</a><button type="button" data-nn="copy">Copy message</button></div></div></div>';
  }
  return '<div class="fnnSh" role="dialog" aria-modal="true" aria-label="Your guests\' tickets are live">'
   +'<div class="fnnHd"><button type="button" class="fnnX" data-nn="close" aria-label="Close">\u00d7</button>'
   +'<div class="fnnEy"><i></i>Fight Night tickets'+(d.preview?' \u00b7 preview':'')+'</div>'
   +'<div class="fnnH">Hey '+esc(first(d.first))+', your tickets went live today at 7am</div>'
   +'<p class="fnnP">Here are your friends on hold. Send them a reminder so they don\'t miss their window.</p>'
   +'<div class="fnnClk"><span>Window closes '+esc(closesTxt())+'</span><b data-nn-left>'+esc(leftTxt())+'</b></div></div>'
   +'<div class="fnnL">'+listHtml()+'</div>'
   +'<div class="fnnFt">'+(a.length>1?'<button type="button" class="fnnB" data-nn="all">Remind everyone still to buy</button>':'')+'<button type="button" class="fnnB2" data-nn="close">Not now</button></div></div>';
}
function paint(){var ov=$id("fnnOv");if(!ov||!N.d)return;var l=ov.querySelector(".fnnL"),st=l?l.scrollTop:0;ov.innerHTML=sheetHtml();var l2=ov.querySelector(".fnnL");if(l2)l2.scrollTop=st;}
function closeFighterPage(){var fp=$id("fpOv");if(fp){var x=fp.querySelector('[data-fp="close"]');if(x)x.click();}}
function openSheet(){
  if(!N.d)return;closeFighterPage();
  var ov=$id("fnnOv");if(!ov){ov=document.createElement("div");ov.id="fnnOv";ov.className="fnnOv";document.body.appendChild(ov);ov.addEventListener("click",onClick);}
  N.step="list";N.target=null;ov.innerHTML=sheetHtml();N.open=true;
  requestAnimationFrame(function(){ov.classList.add("on");});
  clearInterval(N.timer);N.timer=setInterval(async function(){if(!N.open)return;var t=document.querySelector("[data-nn-left]");if(t&&N.d)t.textContent=leftTxt();
    if(Date.now()-N.at>60000&&N.step==="list"){await load(true);if(!N.d){closeSheet();return;}paint();}},15000);
}
function closeSheet(){var ov=$id("fnnOv");N.open=false;clearInterval(N.timer);ssSet("fnnClosed","1");if(ov){ov.classList.remove("on");setTimeout(function(){if(!N.open&&ov.parentNode)ov.remove();},320);}card();}
function log(id,kind){try{if(!N.d||N.d.preview)return;sb.rpc("fn_fighter_nudge_log",{p_hold:id||null,p_kind:kind}).then(function(){},function(){});}catch(e){}}
function afterSend(){var ids=N.target?[N.target.id]:todo().map(function(g){return g.id;});markSent(ids);N.step="list";N.target=null;paint();card(true);}
function onClick(e){
  var ov=$id("fnnOv");if(e.target===ov){closeSheet();return;}
  var el=e.target.closest&&e.target.closest("[data-nn]");if(!el)return;var k=el.dataset.nn;
  if(k==="close")closeSheet();
  else if(k==="back"){N.step="list";N.target=null;paint();}
  else if(k==="one"){var id=+el.dataset.id;N.target=(N.d.guests||[]).filter(function(g){return g.id===id;})[0]||null;N.step="msg";paint();}
  else if(k==="all"){N.target=null;N.step="msg";paint();}
  else if(k==="send"){var msg=message(N.target);
    if(navigator.share){navigator.share({text:msg}).then(function(){log(N.target&&N.target.id,"share");afterSend();},function(x){if(x&&x.name==="AbortError")return;copy(msg);});}
    else copy(msg);}
  else if(k==="sms"){log(N.target&&N.target.id,"sms");setTimeout(afterSend,600);}
  else if(k==="copy"){copy(message(N.target));}
}
function copy(msg){(async function(){try{await navigator.clipboard.writeText(msg);T("Message copied. Paste it into a text or chat.");log(N.target&&N.target.id,"copy");afterSend();}catch(x){var m=document.querySelector("#fnnOv .fnnMsg");if(m){var r=document.createRange();r.selectNodeContents(m);var s=getSelection();s.removeAllRanges();s.addRange(r);}T("Press and hold to copy the message.");}})();}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&N.open)closeSheet();});

/* small card on Home while the window is open */
function card(force){
  var ex=$id("fnnCard");
  if(!N.d||typeof view==="undefined"||view!=="home"){if(ex)ex.remove();return;}
  var m=$id("main");if(!m)return;
  var a=todo().length,html='<div style="min-width:0"><div class="k">Fight Night tickets'+(N.d.preview?' \u00b7 preview':'')+'</div><div class="t">Your tickets are live</div><div class="s">'+(a?a+' of your friends still to buy \u00b7 ':'Everyone has bought \u00b7 ')+esc(leftTxt())+'</div></div><span class="a">'+(a?'Remind':'View')+'</span>';
  if(ex){if(force||ex.dataset.h!==html){ex.innerHTML=html;ex.dataset.h=html;}if(m.firstElementChild!==ex&&!(m.firstElementChild&&m.firstElementChild.classList&&m.firstElementChild.classList.contains("mnFlash")))m.insertBefore(ex,m.firstElementChild);return;}
  var b=document.createElement("button");b.id="fnnCard";b.type="button";b.innerHTML=html;b.dataset.h=html;b.onclick=openSheet;
  m.insertAdjacentElement("afterbegin",b);
}

async function tick(){
  try{
    if(typeof session==="undefined"||!session||!session.user){if($id("fnnCard"))$id("fnnCard").remove();return;}
    if(!N.d&&N.tries>=3&&Date.now()-N.at<300000)return;
    var had=!!N.d;await load(false);if(!N.d){N.tries++;if(had&&N.open)closeSheet();card();return;}
    N.tries=0;card();if($id("fpOv")&&(N.open||!N.shown||ssGet("fnnClosed")!=="1"))closeFighterPage();
    if(!N.open&&!N.shown&&ssGet("fnnClosed")!=="1"&&typeof view!=="undefined"&&view==="home"){N.shown=true;setTimeout(openSheet,PREVIEW?300:1800);}
  }catch(e){}
}
setInterval(tick,2000);
var hiddenAt=0;document.addEventListener("visibilitychange",function(){if(document.hidden){hiddenAt=Date.now();return;}
  if(hiddenAt&&Date.now()-hiddenAt>20*60000){ssSet("fnnClosed","");N.shown=false;N.at=0;N.tries=0;}});
window.fnnOpen=function(){load(true).then(function(d){if(d)openSheet();else T("Nothing to remind about right now.");});};
})();
