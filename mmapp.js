/* ===== FIGHT CLUB MATCHMAKER tab (21 Nov 2026) =====
   Home card at the bottom of the "Your gym" grid for Jake, Ali, Sarsha, Joe and Kelly only.
   Opens the full Matchmaker dashboard inside the app as its own full-screen tab (view "mm"),
   with a back button and a Big screen button that opens /matchmaker?tv=1.
   Data lives in mm_docs / mm_roster, locked to those five logins in the database (mm_ok). */
(function(){
"use strict";
var OK={"15a011b9-e222-45f0-8eb9-d5338da935d1":1,"f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce":1,"2d223b5e-0dd2-47ee-8e3f-54e1b1c3e139":1,"8ddade7e-691b-4c56-9f8d-8594a1c9755f":1,"09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb":1};
function ok(){try{return !!(session&&session.user&&OK[session.user.id]);}catch(e){return false;}}
window.lgMmOk=ok;
function close(){var o=document.getElementById("mmTab");if(o)o.remove();document.documentElement.style.overflow="";}
function open(){
 if(document.getElementById("mmTab"))return;
 var o=document.createElement("div");o.id="mmTab";
 o.style.cssText="position:fixed;inset:0;z-index:9000;background:#04070b;display:flex;flex-direction:column";
 o.innerHTML='<div style="flex:none;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 8px;border-bottom:1px solid #1c2a38;background:#06090d">'+
  '<button id="mmBack" style="border:1px solid #1c2a38;background:#0a1118;color:#f3f7fa;border-radius:10px;padding:8px 12px;font:700 13px Montserrat,sans-serif;cursor:pointer">‹ Home</button>'+
  '<b style="flex:1;font:600 17px Oswald,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#f3f7fa;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Fight Club <span style="color:#1fb6e6">Matchmaker</span></b>'+
  '<a href="/matchmaker?tv=1" target="_blank" rel="noopener" style="border:1px solid #1fb6e6;color:#7fe0ff;border-radius:10px;padding:8px 12px;font:700 12px Montserrat,sans-serif;text-decoration:none;white-space:nowrap">Big screen ↗</a></div>'+
  '<iframe src="/matchmaker?embed=1" title="Fight Club Matchmaker" allow="fullscreen" style="flex:1;width:100%;border:0;background:#04070b"></iframe>';
 document.body.appendChild(o);document.documentElement.style.overflow="hidden";
 document.getElementById("mmBack").onclick=function(){close();try{go("home");}catch(e){}};
}
var _r=window.render;
window.render=function(){
 if(typeof view!=="undefined"&&view==="mm"){if(!ok()){view="home";close();return _r.apply(this,arguments);}open();return;}
 close();return _r.apply(this,arguments);
};
})();
