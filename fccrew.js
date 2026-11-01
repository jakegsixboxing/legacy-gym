/* ===== Fight Club — "Your crew" (1 Nov 2026, r2: hooks the Home "Your tickets" card) =====
   A fighter sees who is holding Fight Night tickets under their name (first names only) and texts them the
   release update with one tap. The text goes out through Fight Club's SMS (api/fightnight?a=crew-sms → ClickSend),
   worded as from the fighter. The fighter never sees a phone number; every send is logged in fn_outreach.
   Data: RPC fh_my_crew() (names, seats, sent status). Card appears in the Fight Club tab under the profile card. */
(function(){
var S={data:null,loaded:0,sel:{},open:false,busy:false,sig:""};
var css=document.createElement("style");css.textContent=
".fcwCard{display:flex;align-items:center;gap:12px;border:1px solid rgba(31,182,230,.55);border-radius:12px;background:#06131a;padding:11px 12px;margin:10px 0}"
+".fcwCard .ic{width:46px;height:46px;border-radius:50%;flex:none;background:#0a2a38;border:2px solid #1fb6e6;display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-size:17px;color:#7fe0ff}"
+".fcwCard b{display:block;font-size:13px;color:#fff;font-weight:800}.fcwCard small{display:block;font-size:11px;color:#8ea3b3;margin-top:2px;line-height:1.35}"
+".fcwCard button{margin-left:auto;flex:none;background:#1fb6e6;color:#04131a;border:0;border-radius:9px;padding:9px 13px;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit}"
+"#fcwOv{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9000;display:flex;align-items:flex-end;justify-content:center}"
+"#fcwSheet{background:#0b1319;color:#f3f7fa;width:100%;max-width:520px;max-height:92vh;border-radius:20px 20px 0 0;border:1px solid #1b2a35;display:flex;flex-direction:column;font-family:Montserrat,system-ui,sans-serif}"
+".fcwHd{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid #1b2a35}"
+".fcwHd b{font-family:Oswald,sans-serif;font-size:20px;text-transform:uppercase;letter-spacing:.5px;font-weight:600}"
+".fcwHd button{background:none;border:1px solid #1b2a35;color:#8ea3b3;border-radius:999px;padding:7px 11px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit}"
+".fcwBody{overflow:auto;padding:12px 16px 8px;flex:1}"
+".fcwStats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px}"
+".fcwStats div{background:#0f1a22;border:1px solid #1b2a35;border-radius:10px;padding:9px}.fcwStats small{display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#1fb6e6;font-weight:800}.fcwStats b{display:block;font-family:Oswald,sans-serif;font-size:24px;margin-top:4px;font-weight:600}"
+".fcwNote{border-radius:10px;padding:10px 12px;font-size:13px;background:#0a1f2b;border:1px solid #124a60;margin:0 0 10px;line-height:1.45}"
+".fcwNote.warn{background:#1d170a;border-color:#5a4616}.fcwNote.ok{background:#0f2a1c;border-color:#1f5a3b}"
+".fcwTop{display:flex;justify-content:space-between;align-items:center;margin:6px 0 4px}.fcwTop h4{margin:0;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#1fb6e6;font-weight:600}"
+".fcwTop button{background:none;border:1px solid #124a60;color:#7fe0ff;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit}"
+".fcwRow{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #1b2a35;cursor:pointer;font-size:14px}.fcwRow:last-child{border-bottom:0}"
+".fcwRow .bx{width:20px;height:20px;border:2px solid #1b2a35;border-radius:5px;flex:none;background:#0f1a22;position:relative}"
+".fcwRow.sel .bx{border-color:#3ddc84;background:#3ddc84}.fcwRow.sel .bx::after{content:'';position:absolute;left:6px;top:2px;width:5px;height:10px;border:solid #04131a;border-width:0 2px 2px 0;transform:rotate(45deg)}"
+".fcwRow.sent{opacity:.6;cursor:default}.fcwRow b{flex:1;font-weight:700}"
+".fcwPill{font-size:11px;font-weight:700;padding:5px 8px;border-radius:6px;background:#0f1a22;border:1px solid #1b2a35;white-space:nowrap}.fcwPill.g{background:#1d170a;border-color:#5a4616;color:#f5b942}.fcwPill.ok{background:#0f2a1c;border-color:#1f5a3b;color:#3ddc84}.fcwPill.bad{background:#2a0f14;border-color:#5a1f28;color:#ff5c6c}"
+".fcwFt{padding:12px 16px calc(14px + env(safe-area-inset-bottom,0px));border-top:1px solid #1b2a35;background:#0b1319}"
+".fcwBtn{display:block;width:100%;border:0;border-radius:12px;padding:14px;font:800 13px/1 Montserrat,system-ui,sans-serif;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;background:#1fb6e6;color:#04131a}"
+".fcwBtn.ghost{background:transparent;color:#7fe0ff;border:1px solid #124a60;margin-top:8px;padding:11px;font-size:12px}.fcwBtn:disabled{opacity:.45;cursor:not-allowed}"
+".fcwMsg{background:#0a1f2b;border:1px solid #124a60;border-radius:12px;padding:12px 14px;font-size:13px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;max-height:46vh;overflow:auto}";
document.head.appendChild(css);

function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function tok(){try{return session&&session.access_token;}catch(e){return null;}}
function curView(){try{return view;}catch(e){return null;}}
function T(m){try{toast(m);}catch(e){}}
function $(id){return document.getElementById(id);}

async function load(force){
  if(!uid())return;
  if(!force&&S.loaded&&Date.now()-S.loaded<60000)return;
  S.loaded=Date.now();
  try{var r=await sb.rpc("fh_my_crew");if(r.error)throw r.error;S.data=(r.data&&r.data.ok)?r.data:null;}catch(e){S.data=null;}
  inject();if(S.open)paint();
}
function holders(){return (S.data&&S.data.holders)||[];}
function sentCount(){return holders().filter(function(h){return h.sent_status==="sent"||h.sent_status==="delivered";}).length;}
function selIds(){return holders().filter(function(h){return S.sel[h.id]&&!(h.sent_status==="sent"||h.sent_status==="delivered");}).map(function(h){return h.id;});}

function cardHtml(){
  var n=holders().length,k=sentCount(),seats=holders().reduce(function(a,h){return a+(h.seats||1);},0);
  return '<div id="fcwCard" class="fcwCard"><div class="ic">'+n+'</div><div><b>Your crew · '+n+' holding'+(seats!==n?' · '+seats+' seats':'')+'</b><small>'+(k>=n&&n>0?'All texted the ticket update.':(k?k+' of '+n+' texted. ':'')+'Text them the ticket release update.')+'</small></div><button onclick="fcwOpen()">'+(k>=n&&n>0?'View':'Text them')+'</button></div>';
}
function hookHome(){
  try{
    var card=$("fnhMy");if(!card||!S.data||!holders().length)return;
    if(!$("fcwHomeBtn")){
      var k2=null;card.querySelectorAll(".k2").forEach(function(k){if(/Who's holding/i.test(k.textContent))k2=k;});
      var who=k2?k2.nextElementSibling:null;
      var d=document.createElement("div");d.className="btns";d.style.marginTop="8px";
      var k=sentCount(),n=holders().length;
      d.innerHTML='<button id="fcwHomeBtn" class="b p big" onclick="fcwOpen()">'+(k>=n?'Texted everyone · view':'Text my crew the ticket update'+(k?' · '+(n-k)+' to go':''))+'</button>';
      if(who&&who.classList.contains("who"))who.insertAdjacentElement("afterend",d);else if(k2)k2.insertAdjacentElement("afterend",d);else card.appendChild(d);
      var hint=document.createElement("p");hint.id="fcwHomeHint";hint.style.cssText="font-size:11px;color:#8fa4ae;margin:6px 0 0";hint.textContent="Tap a name to text just them. Sent from Fight Club in your name; you won't see their numbers.";d.insertAdjacentElement("afterend",hint);
    }
    if(!card.dataset.fcw){card.dataset.fcw="1";
      card.addEventListener("click",function(e){var row=e.target.closest&&e.target.closest(".who > div");if(!row||!card.contains(row))return;var b=row.querySelector("b");if(!b)return;var nm=b.textContent.trim();if(!nm||/^\+\d+ more/.test(row.textContent))return;window.fcwOpen(nm);},true);
      card.querySelectorAll(".who > div").forEach(function(r){r.style.cursor="pointer";});
    }
  }catch(e){}
}
function inject(){
  try{
    if(curView()==="home"){hookHome();return;}
    if(curView()!=="fc"){return;}
    var old=$("fcwCard");
    if(!S.data||!holders().length){if(old)old.parentNode.removeChild(old);return;}
    var wrap=$("fcc");if(!wrap)return;
    var want=cardHtml();if(old&&S.sig===want)return;S.sig=want;
    var d=document.createElement("div");d.innerHTML=want;var n=d.firstChild;
    if(old&&old.parentNode){old.parentNode.replaceChild(n,old);return;}
    var anchor=$("fcpCard")||wrap.querySelector(".fccVw");
    if(anchor)anchor.insertAdjacentElement("afterend",n);
  }catch(e){}
}

function paint(){
  var sh=$("fcwSheet");if(!sh)return;
  var hs=holders(),f=S.data.fighter,n=hs.length,k=sentCount(),left=n-k,sel=selIds().length,seats=hs.reduce(function(a,h){return a+(h.seats||1);},0);
  var h='<div class="fcwHd"><b>Your crew</b><button type="button" onclick="fcwClose()">Close</button></div><div class="fcwBody">'
   +'<div class="fcwStats"><div><small>Holding</small><b>'+n+'</b></div><div><small>Seats</small><b>'+seats+'</b></div><div><small>Texted</small><b>'+k+'</b></div></div>'
   +(left>0?'<div class="fcwNote">Holds are closed. Text your crew the update so nobody misses their 24-hour window this week. It\'s sent from Fight Club, in your name, and you won\'t see their numbers.</div>':'<div class="fcwNote ok">Everyone\'s been texted. Nice one, '+E(f.first)+'.</div>')
   +'<div class="fcwTop"><h4>Who\'s holding under your name</h4>'+(left>0?'<button type="button" onclick="fcwAll()">'+(sel===left?'Clear':'Select all')+'</button>':'')+'</div>';
  hs.forEach(function(x){
    var done=x.sent_status==="sent"||x.sent_status==="delivered",failed=x.sent_status==="failed";
    h+='<div class="fcwRow'+(done?' sent':(S.sel[x.id]?' sel':''))+'" '+(done?'':'onclick="fcwTog('+x.id+')"')+'><span class="bx"'+(done?' style="border-color:#3ddc84;background:transparent"':'')+'></span><b>'+E(x.name)+'</b>'
      +(done?'<span class="fcwPill ok">Sent'+(x.sent_at?' '+fmt(x.sent_at):'')+'</span>':failed?'<span class="fcwPill bad">Failed · tap to retry</span>':'<span class="fcwPill'+(x.tier==="gold"?' g':'')+'">'+(x.tier==="gold"?(x.seats||1)+' table seat'+((x.seats||1)>1?'s':''):'GA')+'</span>')+'</div>';
  });
  h+='</div><div class="fcwFt">'+(left>0?'<button type="button" class="fcwBtn" id="fcwSend" '+(sel?'':'disabled')+' onclick="fcwSend()">'+(sel===0?'Tap a name to send':sel===1?'Send to '+E(firstOf(selIds()[0])):'Send to '+sel+' people')+'</button>':'')+'<button type="button" class="fcwBtn ghost" onclick="fcwPreview()">Preview the text</button></div>';
  sh.innerHTML=h;
}
function firstOf(id){var x=holders().filter(function(h){return h.id===id;})[0];return x?x.name.split(" ")[0]:"";}
function fmt(ts){try{var d=new Date(ts);var hh=d.getHours(),m=d.getMinutes();return (hh%12||12)+':'+(m<10?'0':'')+m+(hh<12?'am':'pm');}catch(e){return "";}}

window.fcwOpen=async function(pre){
  if(!S.data){await load(true);if(!S.data)return T("Couldn't load your crew — try again.");}
  if(typeof pre==="string"&&pre){var pf=pre.split(" ")[0].toLowerCase(),pl=(pre.split(" ")[1]||"")[0];pl=pl?pl.toLowerCase():"";
    var m=holders().filter(function(h){var hp=h.name.split(" ");return hp[0].toLowerCase()===pf&&(!pl||(hp[1]||"")[0].toLowerCase()===pl);});
    if(m.length===1&&!(m[0].sent_status==="sent"||m[0].sent_status==="delivered")){S.sel={};S.sel[m[0].id]=true;}}
  S.open=true;
  var ov=document.createElement("div");ov.id="fcwOv";ov.innerHTML='<div id="fcwSheet" role="dialog" aria-label="Your crew"></div>';
  ov.addEventListener("click",function(e){if(e.target===ov)window.fcwClose();});
  document.body.appendChild(ov);paint();load(true);
};
window.fcwClose=function(){S.open=false;var ov=$("fcwOv");if(ov)ov.parentNode.removeChild(ov);};
window.fcwTog=function(id){S.sel[id]=!S.sel[id];paint();};
window.fcwAll=function(){var left=holders().filter(function(h){return !(h.sent_status==="sent"||h.sent_status==="delivered");});var all=selIds().length===left.length;left.forEach(function(h){S.sel[h.id]=!all;});paint();};
window.fcwPreview=function(){
  var f=S.data.fighter,first=firstOf(selIds()[0])||(holders()[0]?holders()[0].name.split(" ")[0]:"there");
  var body=String(S.data.message||"").replace(/\{first\}/g,first);
  var ov=$("fcwOv"),sh=$("fcwSheet");if(!sh)return;
  sh.innerHTML='<div class="fcwHd"><b>What they\'ll get</b><button type="button" onclick="(function(){paintBack()})()">Back</button></div><div class="fcwBody"><div class="fcwMsg">'+E(body)+'</div><p style="font-size:12px;color:#8ea3b3;margin:10px 0 0">Sent from Fight Club\'s SMS. They can\'t reply. One text per person.</p></div><div class="fcwFt"><button type="button" class="fcwBtn ghost" style="margin:0" onclick="(function(){paintBack()})()">Back to your crew</button></div>';
  window.paintBack=paint;
};
window.fcwSend=async function(){
  if(S.busy)return;var ids=selIds();if(!ids.length)return;
  var b=$("fcwSend");
  if(b&&!b.dataset.arm){b.dataset.arm="1";b.textContent="Tap again to send to "+ids.length+(ids.length===1?" person":" people");setTimeout(function(){if(b){delete b.dataset.arm;paint();}},4000);return;}
  S.busy=true;if(b){b.disabled=true;b.textContent="Sending…";}
  try{
    var r=await fetch("/api/fightnight?a=crew-sms",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+tok()},body:JSON.stringify({hold_ids:ids,template:"crew-1"})});
    var j=null;try{j=await r.json();}catch(e){}
    if(!r.ok||!j){throw new Error((j&&(j.message||j.error))||("Couldn't send ("+r.status+")"));}
    if(j.error==="sms_not_configured")throw new Error(j.message);
    S.sel={};var hb=$("fcwHomeBtn");if(hb){var hw=hb.parentNode;var hh=$("fcwHomeHint");if(hh)hh.remove();hw.remove();}await load(true);
    T(j.sent?("Sent to "+j.sent+(j.sent===1?" person":" people")+(j.failed?" · "+j.failed+" failed":"")):(j.failed?"Couldn't send — "+j.failed+" failed. Try again or message Jake.":"Already sent."));
  }catch(err){T((err&&err.message)||"Couldn't send. Check your connection and try again.");}
  S.busy=false;paint();
};
setInterval(function(){var v=curView();if(v==="fc"||v==="home"){load(false);inject();}},900);
})();
