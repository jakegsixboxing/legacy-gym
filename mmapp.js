/* ===== FIGHT CLUB MATCHMAKER card (20 Nov 2026) =====
   Home card at the bottom of the "Your gym" grid for Jake, Ali, Sarsha and Joe only. Opens /matchmaker (full screen, big-screen ready).
   Data lives in mm_docs / mm_roster, locked to those four logins in the database (mm_ok). */
(function(){
"use strict";
var OK={"15a011b9-e222-45f0-8eb9-d5338da935d1":1,"f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce":1,"2d223b5e-0dd2-47ee-8e3f-54e1b1c3e139":1,"8ddade7e-691b-4c56-9f8d-8594a1c9755f":1};
function ok(){try{return !!(session&&session.user&&OK[session.user.id]);}catch(e){return false;}}
window.lgMmOk=ok;
var _r=window.render;
window.render=function(){if(typeof view!=="undefined"&&view==="mm"){view="home";if(ok()){location.href="/matchmaker";return;}}return _r.apply(this,arguments);};
})();
