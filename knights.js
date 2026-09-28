/* Legacy Gym · Knights week add-on · 28 Sep 2026
   Red, white & blue neon look for NRL Grand Final week (Newcastle Knights).
   Colours and glows only, no club marks. Switches itself on/off by date.
   Remove this script tag (or set KN_ON=false) to go straight back to gold. */
(function(){
"use strict";
var KN_ON=true;
var START=new Date("2026-09-28T00:00:00+10:00"), END=new Date("2026-10-05T06:00:00+10:00"); /* Mon of GF week → the morning after the game */
function live(){var n=Date.now();return KN_ON&&n>=START.getTime()&&n<END.getTime();}
if(!live())return;

var css=document.createElement("style");
css.textContent=
 "body.kn{--gold:#2f7bff;--gold-dim:#1f4f9e;--panel:#0d1220;--panel2:#111a2c;--line:#22304a;--bg:#05070d;--card:#0d1220}"+
 "body.kn{background:#05070d}"+
 /* neon frame */
 "@property --kna{syntax:'<angle>';inherits:false;initial-value:0deg}"+
 "@keyframes knSpin{to{--kna:360deg}}@keyframes knPulse{0%,100%{opacity:.85}50%{opacity:1}}@keyframes knFlick{0%,94%,100%{opacity:1}95%{opacity:.6}96%{opacity:1}98%{opacity:.75}}"+
 "#knFrame{position:fixed;inset:6px;border-radius:28px;pointer-events:none;z-index:9998;padding:2.5px;background:conic-gradient(from var(--kna),#2f7bff,#fff 20%,#e4002b 40%,#2f7bff 60%,#e4002b 80%,#2f7bff);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);mask-composite:exclude;animation:knSpin 6s linear infinite;filter:drop-shadow(0 0 6px #fff)}"+
 "#knFrame2{position:fixed;inset:6px;border-radius:28px;pointer-events:none;z-index:9997;box-shadow:0 0 14px #2f7bff,0 0 40px rgba(47,123,255,.55),inset 0 0 14px #e4002b,inset 0 0 44px rgba(228,0,43,.35);animation:knPulse 2.6s ease-in-out infinite}"+
 "#knGlow{position:fixed;inset:0;pointer-events:none;z-index:-1;background:radial-gradient(60% 30% at 0% 0%,rgba(47,123,255,.42),transparent 70%),radial-gradient(60% 30% at 100% 100%,rgba(228,0,43,.42),transparent 70%),radial-gradient(50% 25% at 100% 0%,rgba(228,0,43,.28),transparent 70%),radial-gradient(50% 25% at 0% 100%,rgba(47,123,255,.3),transparent 70%),repeating-linear-gradient(115deg,transparent 0 46px,rgba(255,255,255,.025) 46px 48px)}"+
 "@media (prefers-reduced-motion:reduce){#knFrame,#knFrame2,.knStrip .t{animation:none}}"+
 /* header + nav */
 "body.kn .topBar{background:rgba(5,7,13,.92);border-bottom-color:#1c2a44}"+
 "body.kn .profileBtn{border-color:#e4002b;color:#fff}"+
 "body.kn .navBtn.active{color:#fff;text-shadow:0 0 8px #fff}"+
 "body.kn .navBtn.active::after{background:linear-gradient(90deg,#e4002b 50%,#2f7bff 50%);box-shadow:0 0 8px #2f7bff}"+
 /* home */
 "body.kn .lghHi h1{text-shadow:0 0 10px rgba(255,255,255,.5)}body.kn .lghHi h1 small{color:#7fb1ff;text-shadow:0 0 8px #2f7bff}"+
 "body.kn .lghTally b{color:#fff}body.kn .lghTally div{border-color:#22304a;box-shadow:inset 0 -2px 0 #e4002b}"+
 "body.kn .lghPair .homeCard,body.kn .lghGrid .homeCard{border:1.5px solid #4d8dff!important;box-shadow:0 0 6px #2f7bff,0 0 18px rgba(47,123,255,.45),inset 0 0 0 1.5px rgba(228,0,43,.5),inset 0 0 22px rgba(228,0,43,.18)!important}"+
 "body.kn .homeCard::before{background:linear-gradient(180deg,#2f7bff,#e4002b)}body.kn .homeCard::after{color:#ff4d6a;text-shadow:0 0 8px #e4002b}"+
 "body.kn .homeCard .hcKicker{color:#7fb1ff}body.kn .homeCard .hcTitle{text-shadow:0 0 8px rgba(255,255,255,.6)}"+
 "body.kn .lghFaces i{border-color:#e4002b;color:#fff}"+
 "body.kn .fcxCard{background:linear-gradient(90deg,#070b14 0%,#070b14 55%,#0b2e5b 100%)!important;border-color:#ff2d55!important;box-shadow:0 0 8px #e4002b,0 0 22px rgba(228,0,43,.5)!important}"+
 "body.kn .fcxCard .k,body.kn .fcxCard .lghOpens{color:#7fb1ff}body.kn .fcxCard .t{text-shadow:0 0 8px #fff}body.kn .fcxCard .cd b{color:#fff}body.kn .fcxCard .cd div{border-color:#2f7bff;background:#03060c}"+
 /* classes */
 "body.kn .cbHero{border-color:#4d8dff;background:linear-gradient(135deg,#0b2e5b,#0a0f1c);box-shadow:0 0 8px #2f7bff,0 0 22px rgba(47,123,255,.45)}"+
 "body.kn .cbHero .k{color:#ff4d6a}body.kn .cbHero .t{text-shadow:0 0 10px rgba(255,255,255,.55)}"+
 "body.kn .cbDay.on{background:linear-gradient(180deg,#0b2e5b,#3a0410);border-color:#fff;color:#fff;box-shadow:0 0 10px #2f7bff,0 0 4px #fff}"+
 "body.kn .cbSess{border-color:#22304a}"+
 "body.kn .cbBtn{background:linear-gradient(90deg,#2f7bff,#e4002b);color:#fff;box-shadow:0 0 6px #2f7bff,0 0 14px rgba(228,0,43,.7)}"+
 "body.kn .cbBtn.in{background:transparent;color:#fff;border-color:#2f7bff;box-shadow:none}"+
 "body.kn .backBtn,body.kn #smWeek{color:#fff;border-color:#2f7bff}"+
 "body.kn .btnGold{background:linear-gradient(90deg,#2f7bff,#e4002b);color:#fff}"+
 /* strip */
 ".knStrip{margin:0 0 12px;border-radius:14px;padding:11px 12px 11px 14px;background:linear-gradient(90deg,rgba(11,46,91,.85),rgba(5,7,13,.9) 55%,rgba(120,0,25,.85));display:flex;align-items:center;gap:12px;position:relative;overflow:hidden;border:1.5px solid #fff;box-shadow:0 0 8px #fff,0 0 22px #2f7bff,inset 0 0 18px rgba(228,0,43,.45)}"+
 ".knStrip .k{font-size:7.5px;font-weight:800;letter-spacing:2.2px;text-transform:uppercase;color:#7fb1ff;text-shadow:0 0 8px #2f7bff}"+
 ".knStrip .t{font-family:Oswald,sans-serif;font-size:18px;line-height:1;text-transform:uppercase;color:#fff;margin-top:3px;letter-spacing:1px;text-shadow:0 0 6px #fff,0 0 16px #e4002b,0 0 30px #e4002b;animation:knFlick 4s infinite}"+
 ".knStrip .s{font-size:9px;font-weight:600;color:rgba(255,255,255,.85);margin-top:3px}"+
 ".knStrip .x{margin-left:auto;font-size:8px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;background:#e4002b;color:#fff;padding:6px 9px;border-radius:999px;white-space:nowrap;box-shadow:0 0 10px #e4002b;flex:none}";
document.head.appendChild(css);

document.body.classList.add("kn");
["knGlow","knFrame2","knFrame"].forEach(function(id){if(!document.getElementById(id)){var d=document.createElement("div");d.id=id;document.body.appendChild(d);}});

function strip(kind){
  var w=document.createElement("div");w.className="knStrip";w.setAttribute("data-kn",kind);
  w.innerHTML=kind==="home"
    ?'<div><div class="k">Grand Final week · Newcastle</div><div class="t">Up the Knights</div><div class="s">Red, white &amp; blue in the app all week. Wear your colours to class.</div></div><div class="x">Sunday</div>'
    :'<div><div class="k">Grand Final week</div><div class="t">Colours week</div><div class="s">Train in red, white or blue this week. Book in as normal.</div></div><div class="x">Book</div>';
  return w;
}
function place(){
  try{
    var m=document.getElementById("main");if(!m)return;
    /* home strip removed 28 Sep: the NRL Grand Final Party card carries the Knights look on home */
    if(view==="classes"){var top=m.querySelector(".cbTop");if(top&&!m.querySelector('.knStrip[data-kn="classes"]'))top.insertAdjacentElement("afterend",strip("classes"));}
  }catch(e){}
}
["renderHome","renderClasses"].forEach(function(fn){var o=window[fn];if(typeof o!=="function")return;window[fn]=function(){var r=o.apply(this,arguments);var after=function(){place();setTimeout(place,120);setTimeout(place,600);};if(r&&typeof r.then==="function")r.then(after);else after();return r;};});
setInterval(function(){if(!live()){document.body.classList.remove("kn");["knGlow","knFrame2","knFrame"].forEach(function(id){var d=document.getElementById(id);if(d)d.remove();});document.querySelectorAll(".knStrip").forEach(function(e){e.remove();});return;}place();},1500);
})();
