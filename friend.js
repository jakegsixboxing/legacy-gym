/* Legacy Gym · BRING A FRIEND FOR FREE · 26 Oct 2026
   The first time a member books a class, a sheet slides up after the "You're booked in" toast:
   send a mate a 7-day free trial by text / WhatsApp / Messenger / Instagram / Facebook / email / share sheet.
   Once per member, ever (friend_pop table via friend_pop_state / friend_pop_mark). Trial members never see it.
   Message: "Your mate <Name> trains at Legacy Gym Kincumber and wants to invite you for a free week ..."
   Remove the script tag to switch it off. */
(function(){
"use strict";
var LINK="https://www.legacygym.net/?ref=friend&src=app#ContactForm";
var S={state:null,checked:false,loading:null};
var css=document.createElement("style");css.textContent=
".bfOv{position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0);display:flex;align-items:flex-end;justify-content:center;transition:background .3s;pointer-events:none}"
+".bfOv.on{background:rgba(0,0,0,.78);pointer-events:auto}"
+".bfSheet{width:100%;max-width:480px;background:linear-gradient(170deg,#1f180a,#0e0d0b 50%,#0a0a0a);border:1px solid #4a3a16;border-bottom:0;border-radius:28px 28px 0 0;padding:14px 22px calc(22px + env(safe-area-inset-bottom));transform:translateY(100%);transition:transform .42s cubic-bezier(.2,.9,.25,1);font-family:Montserrat,system-ui,sans-serif;color:#f2f0eb;max-height:94vh;overflow:auto}"
+".bfOv.on .bfSheet{transform:translateY(0)}"
+".bfGrab{width:42px;height:4px;border-radius:99px;background:#3a3320;margin:0 auto 16px}"
+".bfGift{width:80px;height:80px;border-radius:50%;margin:0 auto 14px;background:rgba(201,164,76,.14);border:2px solid #c9a44c;display:grid;place-items:center;font-size:36px;position:relative}"
+".bfGift::before{content:'';position:absolute;inset:-9px;border-radius:50%;border:2px solid #f4c95d;animation:bfPulse 1.6s ease-out infinite}"
+"@keyframes bfPulse{0%{transform:scale(.85);opacity:.9}100%{transform:scale(1.6);opacity:0}}"
+".bfK{text-align:center;font:600 11px/1 Oswald,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#f4c95d}"
+".bfH{text-align:center;font:700 32px/1.05 Oswald,sans-serif;text-transform:uppercase;margin:10px 0 8px;color:#fff}.bfH span{color:#f4c95d}"
+".bfP{text-align:center;font-size:13.5px;color:#d9d4c7;line-height:1.55;max-width:34ch;margin:0 auto}.bfP b{color:#fff}"
+".bfMsg{margin:14px 0 12px;background:#0b0b0c;border:1px solid #262626;border-radius:14px;padding:12px 14px;font-size:12.5px;line-height:1.5;color:#d9d4c7}.bfMsg b{display:block;font:600 10px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#9a9891;margin-bottom:6px}.bfMsg a{color:#f4c95d}"
+".bfShare{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.bfShare button{background:#141414;border:1px solid #262626;border-radius:14px;padding:11px 4px 9px;color:#f2f0eb;display:grid;justify-items:center;gap:6px;cursor:pointer;font-family:inherit}"
+".bfShare button i{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:19px;font-style:normal}.bfShare button small{font:700 9.5px/1 Oswald,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#9a9891}.bfShare button:active{transform:scale(.96)}"
+".bf-sms{background:#1f8a3c;color:#fff}.bf-wa{background:#25d366;color:#0b2d14}.bf-ms{background:linear-gradient(135deg,#0695ff,#a334fa);color:#fff}.bf-ig{background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7);color:#fff}.bf-fb{background:#1877f2;color:#fff;font:700 20px/1 Oswald,sans-serif}.bf-cp,.bf-more{background:#2a2a2e;color:#fff}.bf-mail{background:#555;color:#fff}"
+".bfBig{display:block;width:100%;margin-top:12px;padding:16px;border-radius:14px;border:0;background:linear-gradient(180deg,#f4c95d,#c9a44c);color:#161307;font:700 15px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase;cursor:pointer}"
+".bfLater{display:block;width:100%;margin-top:8px;padding:13px;border-radius:14px;background:none;border:1px solid #262626;color:#9a9891;font:700 12px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}"
+".bfFine{text-align:center;font-size:10.5px;color:#6f6c66;margin-top:12px;line-height:1.5}"
+".bfSent{text-align:center;padding:10px 0 4px}.bfSent .tk{width:70px;height:70px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;background:#0f2017;border:1px solid #2a6b45;font-size:30px;color:#4bc97a}";
document.head.appendChild(css);

function me(){try{return (typeof session!=="undefined"&&session&&session.user)?session.user.id:null;}catch(e){return null;}}
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function trial(){try{return typeof myTier==="function"&&typeof TIER_TRIAL!=="undefined"&&myTier()===TIER_TRIAL;}catch(e){return false;}}
function myName(){var f="",l="";try{f=(profile&&profile.first_name)||"";l=(profile&&profile.last_name)||"";}catch(e){}if(!f&&S.state){f=S.state.first||"";l=S.state.last||"";}return (f+" "+l).trim()||"a mate";}
function msg(){return "Your mate "+myName()+" trains at Legacy Gym Kincumber and wants to invite you for a free week. 7 days, no card, no catch. Claim it here: "+LINK;}
async function state(){if(S.checked)return S.state;if(S.loading)return S.loading;S.loading=(async function(){try{var r=await sb.rpc("friend_pop_state");S.state=(r&&r.data)||{shown:true};}catch(e){S.state={shown:true};}S.checked=true;S.loading=null;return S.state;})();return S.loading;}
function mark(via){try{sb.rpc("friend_pop_mark",{p_via:via}).then(function(){});}catch(e){}}

/* fires after a successful class booking, first time only */
var _att=window.attendClass;
if(typeof _att==="function"){
  window.attendClass=async function(date,time,name){var r=await _att.apply(this,arguments);try{await maybe(date,time);}catch(e){}return r;};
}
async function maybe(date,time){
  if(!me()||trial())return;
  var st=await state();if(!st||st.shown)return;
  var q=await sb.from("class_regs").select("id").eq("user_id",me()).eq("class_date",date).eq("class_time",time).limit(1);
  if(!(q.data&&q.data.length))return;  /* the booking didn't go through, so no pop-up */
  S.state.shown=true;mark("shown");
  setTimeout(open,1400);
}
function root(){var o=document.getElementById("bfOv");if(!o){o=document.createElement("div");o.className="bfOv";o.id="bfOv";o.innerHTML='<div class="bfSheet" id="bfSheet"></div>';o.addEventListener("click",function(e){if(e.target===o)close();});document.body.appendChild(o);}return o;}
function open(){
  var o=root(),m=msg();
  document.getElementById("bfSheet").innerHTML='<div class="bfGrab"></div><div class="bfGift">🎁</div><div class="bfK">You\'re booked · now the fun bit</div><h2 class="bfH">Bring a friend <span>for free</span></h2>'
   +'<p class="bfP">Send a mate a <b>7-day free trial</b>. They train with you all week, on us. No card, no catch.</p>'
   +'<div class="bfMsg"><b>Your message · ready to send</b>'+E(m.replace(" Claim it here: "+LINK,""))+' Claim it here: <a href="'+LINK+'" target="_blank" rel="noopener">legacygym.net</a></div>'
   +'<div class="bfShare">'
   +'<button onclick="bfShare(\'sms\')"><i class="bf-sms">💬</i><small>Text</small></button>'
   +'<button onclick="bfShare(\'wa\')"><i class="bf-wa">🟢</i><small>WhatsApp</small></button>'
   +'<button onclick="bfShare(\'ms\')"><i class="bf-ms">✈️</i><small>Messenger</small></button>'
   +'<button onclick="bfShare(\'ig\')"><i class="bf-ig">📸</i><small>Instagram</small></button>'
   +'<button onclick="bfShare(\'fb\')"><i class="bf-fb">f</i><small>Facebook</small></button>'
   +'<button onclick="bfShare(\'mail\')"><i class="bf-mail">✉️</i><small>Email</small></button>'
   +'<button onclick="bfShare(\'copy\')"><i class="bf-cp">🔗</i><small>Copy link</small></button>'
   +'<button onclick="bfShare(\'more\')"><i class="bf-more">⋯</i><small>More</small></button></div>'
   +'<button class="bfBig" onclick="bfShare(\'more\')">Send a 7-day free trial</button><button class="bfLater" onclick="bfClose()">Not now</button>'
   +'<div class="bfFine">Your friend lands on legacygym.net and claims the trial in 30 seconds.</div>';
  requestAnimationFrame(function(){o.classList.add("on");});
}
function close(){var o=document.getElementById("bfOv");if(o)o.classList.remove("on");}
window.bfClose=close;
function sent(where){
  document.getElementById("bfSheet").innerHTML='<div class="bfGrab"></div><div class="bfSent"><div class="tk">✓</div><h2 class="bfH">Legend</h2><p class="bfP">'+E(where)+' Your mate\'s 7 days start when they claim it on legacygym.net.</p></div>'
   +'<button class="bfBig" onclick="bfClose()">Back to classes</button><button class="bfLater" onclick="bfAgain()">Send to someone else</button>';
}
window.bfAgain=function(){open();};
window.bfShare=async function(how){
  var m=msg(),u=encodeURIComponent(LINK),em=encodeURIComponent(m);
  mark(how);
  if(how==="copy"||how==="ig"){
    try{await navigator.clipboard.writeText(m);}catch(e){}
    if(how==="ig"){T("Message copied — paste it into a DM.");sent("Message copied for Instagram.");setTimeout(function(){try{location.href="instagram://direct/inbox";}catch(e){}},500);return;}
    T("Copied. Paste it anywhere.");sent("Link copied.");return;
  }
  if(how==="more"){
    if(navigator.share){try{await navigator.share({title:"A free week at Legacy Gym",text:m.replace(" Claim it here: "+LINK,""),url:LINK});sent("Sent.");}catch(e){}return;}
    try{await navigator.clipboard.writeText(m);}catch(e){}T("Copied — paste it to your mate.");sent("Link copied.");return;
  }
  var href=how==="sms"?"sms:?&body="+em
    :how==="wa"?"https://wa.me/?text="+em
    :how==="ms"?"fb-messenger://share?link="+u
    :how==="fb"?"https://www.facebook.com/sharer/sharer.php?u="+u+"&quote="+em
    :"mailto:?subject="+encodeURIComponent("A free week at Legacy Gym")+"&body="+em;
  try{window.open(href,(how==="fb"||how==="wa")?"_blank":"_self");}catch(e){location.href=href;}
  sent("Sent by "+(how==="sms"?"text":how==="wa"?"WhatsApp":how==="ms"?"Messenger":how==="fb"?"Facebook":"email")+".");
};
/* warm the once-only check in the background so the first booking doesn't wait on it */
setTimeout(function(){if(me())state();},4000);
})();
