/* ===== THE SIXTY · members-only Fight Night room (18 Oct 2026) =====
   Pops up on every app open until the member says yes or no, or the 10-day window closes.
   No prices anywhere on the member side. Data: fn_members (RLS: Jake + Alison only).
   RPCs: fn_members_offer / fn_members_respond / fn_members_guest. */
(function(){
"use strict";
var ART="https://legacygym-app.vercel.app/img/fc/presale-art.jpg";
var SHOWN=false, BUSY=false, OFFER=null, GUEST=false;
var $=function(i){return document.getElementById(i);};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function ini(n){return String(n||"").trim().split(/[\s-]+/).filter(Boolean).map(function(x){return x[0];}).join("").slice(0,2).toUpperCase()||"LG";}
function mask(s){s=String(s||"");return s.length>6?s.slice(0,4)+" ··· "+s.slice(-3):s;}
function maskEmail(e){e=String(e||"");var i=e.indexOf("@");return i>2?e.slice(0,2)+"···"+e.slice(i):e;}
function since(d){if(!d)return "";try{return "Member since "+new Date(d).toLocaleDateString("en-AU",{month:"short",year:"numeric"});}catch(e){return "";}}

var css=document.createElement("style");css.textContent=
"#sixtyOv{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.84);display:flex;align-items:flex-end;justify-content:center;padding:10px;backdrop-filter:blur(5px);animation:sxFade .25s ease}"
+"@keyframes sxFade{from{opacity:0}to{opacity:1}}@keyframes sxUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}"
+"#sixtyOv .sx{--c:#1fb6e6;--c2:#7fe0ff;--gold:#C9A44C;--gold2:#F1D27A;--line:#16303c;--panel:#0b1319;--panel2:#07141b;--mute:#8fa4ae;--cream:#e8e2d2;--green:#39FF88;"
+"width:100%;max-width:470px;max-height:82%;overflow:auto;background:#070c10;border:1px solid var(--c);border-radius:24px;animation:sxUp .32s ease;position:relative;box-shadow:0 0 0 1px rgba(31,182,230,.2),0 -10px 60px rgba(31,182,230,.28);-webkit-overflow-scrolling:touch;color:#f2f0eb;font-family:Montserrat,system-ui,sans-serif;text-align:left}"
+"#sixtyOv .sx *{box-sizing:border-box;margin:0}"
+"#sixtyOv .x{position:absolute;right:10px;top:10px;z-index:3;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,.55);border:1px solid var(--line);color:#fff;font-size:18px;cursor:pointer;line-height:1;font-family:inherit}"
+"#sixtyOv .art{position:relative;aspect-ratio:1672/941;background:#050a0d url('"+ART+"') center/100% 100% no-repeat;border-radius:23px 23px 0 0;overflow:hidden}"
+"#sixtyOv .art:after{content:'';position:absolute;inset:auto 0 0 0;height:18%;background:linear-gradient(180deg,rgba(5,10,13,0),rgba(7,12,16,.92))}"
+"#sixtyOv .bd{padding:11px 13px 14px}"
+"#sixtyOv .mb{display:inline-block;border:1px solid var(--gold);background:rgba(201,164,76,.16);color:var(--gold2);border-radius:999px;padding:4px 11px;font:700 9px Oswald,sans-serif;letter-spacing:2.5px;text-transform:uppercase}"
+"#sixtyOv .hdl{font:700 24px/.95 Oswald,sans-serif;text-transform:uppercase;margin-top:8px}#sixtyOv .hdl span{color:var(--c)}"
+"#sixtyOv .hdlsub{font:600 10.5px/1.3 Oswald,sans-serif;text-transform:uppercase;color:var(--cream);margin-top:5px;letter-spacing:.6px;margin-bottom:0}"
+"#sixtyOv .sixty{display:flex;align-items:center;gap:11px;border:1px solid var(--c);border-radius:12px;padding:9px 12px;background:linear-gradient(160deg,#0b2a38,#07141b);margin-top:9px}"
+"#sixtyOv .sixty .big{font:700 34px/1 Oswald,sans-serif;color:#fff;letter-spacing:-1px}"
+"#sixtyOv .sixty .t{font:700 14px/1.15 Oswald,sans-serif;text-transform:uppercase;color:var(--c2)}"
+"#sixtyOv .sixty .s{font-size:9.5px;color:#cfd8dc;margin-top:3px;line-height:1.35}"
+"#sixtyOv .inc{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}"
+"#sixtyOv .incr{display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:11px;padding:9px 10px;background:var(--panel)}"
+"#sixtyOv .incr .ic{width:26px;height:26px;border-radius:8px;background:rgba(31,182,230,.12);border:1px solid #1d4557;display:grid;place-items:center;flex:none}"
+"#sixtyOv .incr .ic svg{width:15px;height:15px;stroke:var(--c2);fill:none;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}"
+"#sixtyOv .incr b{display:block;font:700 12px/1.1 Oswald,sans-serif;text-transform:uppercase;color:#fff}"
+"#sixtyOv .incr small{display:block;font-size:9.5px;color:#9fb3bd;margin-top:2px;line-height:1.3}"
+"#sixtyOv .me{display:flex;gap:9px;align-items:center;border:1px solid var(--line);border-radius:11px;padding:8px 11px;background:var(--panel2);margin-top:9px}"
+"#sixtyOv .me .av{width:28px;height:28px;border-radius:50%;background:#0b2a38;border:1px solid var(--c);display:grid;place-items:center;font:700 11px Oswald,sans-serif;color:var(--c2);flex:none}"
+"#sixtyOv .me .k{font-size:8.5px;letter-spacing:2px;text-transform:uppercase;color:var(--mute);font-weight:800}"
+"#sixtyOv .me b{display:block;font:700 13.5px/1.1 Oswald,sans-serif;text-transform:uppercase;margin-top:1px}"
+"#sixtyOv .me small{display:block;font-size:9.5px;color:var(--mute);margin-top:1px;line-height:1.3}"
+"#sixtyOv .cta{display:block;width:100%;border:0;border-radius:12px;padding:14px;font:700 15px Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;background:linear-gradient(180deg,#8ae6ff,#1fb6e6 50%,#0a8fc0);color:#03141c;margin-top:12px;box-shadow:0 8px 30px rgba(31,182,230,.32);font-family:Oswald,sans-serif}"
+"#sixtyOv .cta[disabled]{opacity:.6}"
+"#sixtyOv .gh{display:block;width:100%;background:none;border:1px solid #27424e;color:var(--mute);border-radius:11px;padding:10px;font:600 12px Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:8px;font-family:Oswald,sans-serif}"
+"#sixtyOv .nopay{display:flex;align-items:center;justify-content:center;gap:7px;border:1px dashed #27424e;border-radius:9px;padding:7px;margin-top:9px;font:700 9.5px Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:var(--c2)}"
+"#sixtyOv .fine{font-size:10.5px;color:var(--mute);line-height:1.5;margin-top:10px;text-align:center}"
+"#sixtyOv .err{display:none;margin-top:10px;border:1px solid #5a2630;background:#1b0d10;color:#ff8c98;border-radius:10px;padding:9px 11px;font-size:12px;font-weight:600}"
+"#sixtyOv .done{text-align:center;padding:4px 2px 0}"
+"#sixtyOv .done .ck{width:58px;height:58px;border-radius:50%;background:#0b2a38;border:2px solid var(--green);color:var(--green);display:grid;place-items:center;font-size:27px;margin:0 auto 10px}"
+"#sixtyOv .done .big{font:700 28px/1 Oswald,sans-serif;color:var(--c2);text-transform:uppercase}"
+"#sixtyOv .done p{font-size:12.5px;color:#d9d3c3;margin-top:8px;line-height:1.6}#sixtyOv .done p b{color:#fff}"
+"#sixtyOv .sum{text-align:left;border:1px solid var(--line);border-radius:12px;margin-top:12px;overflow:hidden;background:var(--panel2)}"
+"#sixtyOv .sum .r{display:flex;justify-content:space-between;gap:10px;padding:9px 12px;border-top:1px solid var(--line);font-size:12.5px}"
+"#sixtyOv .sum .r:first-child{border-top:0}#sixtyOv .sum .r span{color:var(--mute)}#sixtyOv .sum .r b{color:#fff;text-align:right}"
+"#sixtyOv .gst{border:1px dashed var(--c);border-radius:12px;padding:11px 12px;margin-top:11px}"
+"#sixtyOv .gst b{display:block;font:700 13px Oswald,sans-serif;text-transform:uppercase;color:var(--c2)}"
+"#sixtyOv .gst small{display:block;font-size:11px;color:#cfd8dc;margin-top:4px;line-height:1.45}"
+"#sixtyOv .gbtn{width:100%;background:none;border:1px solid var(--c);color:var(--c2);border-radius:10px;padding:10px;font:700 11.5px Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;margin-top:8px;font-family:Oswald,sans-serif}"
+"#sixtyOv .gbtn.on{background:var(--c);color:#03141c}"
+"#sixtyOv .nxt{border:1px solid var(--c);border-radius:13px;padding:11px 12px;background:rgba(31,182,230,.07);margin-top:11px}"
+"#sixtyOv .nxt .k{font-size:8.5px;letter-spacing:2.5px;text-transform:uppercase;color:var(--c2);font-weight:800}"
+"#sixtyOv .nxt p{font-size:11.5px;color:#cfd8dc;line-height:1.55;margin-top:5px}#sixtyOv .nxt p b{color:#fff}";
document.head.appendChild(css);

var IC={
 room:'<svg viewBox="0 0 24 24"><path d="M3 21V9l9-6 9 6v12z"/><path d="M9 21v-6h6v6"/></svg>',
 ring:'<svg viewBox="0 0 24 24"><path d="M3 20V7l9-4 9 4v13"/><path d="M3 11h18M3 15.5h18"/><path d="M6 7v13M18 7v13"/></svg>',
 bar:'<svg viewBox="0 0 24 24"><path d="M5 4h14l-7 8z"/><path d="M12 12v8M8 20h8"/></svg>',
 xmas:'<svg viewBox="0 0 24 24"><path d="M12 2 6 10h3l-4 6h5v6h4v-6h5l-4-6h3z"/></svg>',
 star:'<svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.5 6 .9-4.3 4.2 1 6-5.3-2.8L6.7 19.6l1-6L3.4 9.4l6-.9z"/></svg>'};

function offerHtml(o){
 var nm=o.name||"you", cap=o.cap||60;
 return '<button class="x" onclick="sixtyLater()">&times;</button>'
 +'<div class="art"></div>'
 +'<div class="bd">'
 +'<span class="mb">Members only · '+cap+' spots</span>'
 +'<div class="hdl">The best '+(cap===60?'sixty':cap)+' <span>spots in the building</span></div>'
 +'<div class="hdlsub">Fight Night meets the Christmas party · Sat 19 Dec · Legacy Gym Kincumber</div>'
 +'<div class="inc">'
 +'<div class="incr"><span class="ic">'+IC.room+'</span><div><b>Your own area</b><small>Private members\' space</small></div></div>'
 +'<div class="incr"><span class="ic">'+IC.ring+'</span><div><b>Best seats</b><small>Right on the ropes</small></div></div>'
 +'<div class="incr"><span class="ic">'+IC.bar+'</span><div><b>Private bar</b><small>No queue, no crowd</small></div></div>'
 +'<div class="incr"><span class="ic">'+IC.star+'</span><div><b>First call</b><small>Before early release opens</small></div></div>'
 +'</div>'
 +'<div class="sixty"><div class="big">'+cap+'</div><div><div class="t">Spots. That\'s it.</div><div class="s">Members and one guest each. When they\'re gone, the room is shut.</div></div></div>'
 +'<div class="me"><div class="av">'+ini(nm)+'</div><div><div class="k">Holding a spot as</div><b>'+esc(nm)+'</b><small>'+esc(mask(o.mobile))+(o.email?' · '+esc(maskEmail(o.email)):'')+(o.member_since?' · '+esc(since(o.member_since)):'')+'</small></div></div>'
 +'<div class="err" id="sxErr"></div>'
 +'<button class="cta" id="sxYes" onclick="sixtyAnswer(\'hold\')">Yes — hold my spot</button>'
 +'<button class="gh" id="sxNo" onclick="sixtyAnswer(\'decline\')">Not this time</button>'
 +'<div class="nopay">Nothing to pay · nothing to fill in</div>'
 +'</div>';}

function heldHtml(o){
 var nm=o.name||"";
 return '<button class="x" onclick="sixtyClose()">&times;</button>'
 +'<div class="bd"><div class="done"><div class="ck">✓</div><div class="big">You\'re in the room</div>'
 +'<p>Your spot in the <b>members\' area</b> is held. Ringside, your own bar, your own space, and the Christmas party all in one night.</p></div>'
 +'<div class="sum"><div class="r"><span>Held for</span><b>'+esc(nm)+'</b></div>'
 +(o.mobile?'<div class="r"><span>Mobile</span><b>'+esc(o.mobile)+'</b></div>':'')
 +(o.email?'<div class="r"><span>Email</span><b>'+esc(o.email)+'</b></div>':'')
 +(o.membership?'<div class="r"><span>Membership</span><b>'+esc(o.membership)+'</b></div>':'')
 +'<div class="r"><span>Spot</span><b id="sxSpot">'+(GUEST?'You + 1 guest':'You')+'</b></div></div>'
 +'<div class="gst"><b>Bringing someone?</b><small>Every member can bring one. You don\'t need their name yet — just tell us to hold two and they\'re in the members\' area with you.</small>'
 +'<button class="gbtn'+(GUEST?' on':'')+'" id="sxG" onclick="sixtyGuest()">'+(GUEST?'✓ Holding two · you and a guest':'+ Hold one for my plus one')+'</button></div>'
 +'<div class="nxt"><div class="k">What happens next</div><p><b>Nothing to pay, nothing to do.</b> When early release tickets open you get a text and an email before anyone else, and your spot in the room is already sitting there with your name on it.</p></div>'
 +'<button class="cta" onclick="sixtyClose()">Beauty, done</button>'
 +'<div class="fine">Only Jake and Alison can see the members\' list.</div>'
 +'</div>';}

function mount(html){
 var ov=$("sixtyOv");
 if(!ov){ov=document.createElement("div");ov.id="sixtyOv";ov.innerHTML='<div class="sx"></div>';document.body.appendChild(ov);
   ov.addEventListener("click",function(e){if(e.target===ov)sixtyLater();});}
 ov.querySelector(".sx").innerHTML=html;ov.querySelector(".sx").scrollTop=0;
 document.body.style.overflow="hidden";}
function unmount(){var ov=$("sixtyOv");if(ov)ov.remove();document.body.style.overflow="";}

window.sixtyLater=function(){unmount();}; /* the X: asks again next time they open the app */
window.sixtyClose=function(){unmount();};
window.sixtyAnswer=async function(a){
 if(BUSY)return;BUSY=true;
 var y=$("sxYes"),n=$("sxNo"),e=$("sxErr");
 if(y){y.disabled=true;if(a==="hold")y.textContent="Holding…";}
 if(n)n.disabled=true;
 try{
   var r=await sb.rpc("fn_members_respond",{p_answer:a,p_guest:false});
   if(r.error)throw new Error(r.error.message);
   var d=r.data||{};
   if(d.full){if(e){e.style.display="block";e.textContent="The room just filled up. We'll let you know if a spot opens.";}BUSY=false;if(y){y.disabled=false;y.textContent="Yes — hold my spot";}if(n)n.disabled=false;return;}
   if(a==="hold"){GUEST=false;mount(heldHtml(OFFER||{}));}
   else unmount();
 }catch(x){
   if(e){e.style.display="block";e.textContent=(x&&x.message)||"Couldn't save that. Try again.";}
   if(y){y.disabled=false;y.textContent="Yes — hold my spot";}if(n)n.disabled=false;
 }
 BUSY=false;};
window.sixtyGuest=async function(){
 var b=$("sxG");if(!b||BUSY)return;BUSY=true;b.disabled=true;
 try{var r=await sb.rpc("fn_members_guest",{p_guest:!GUEST});if(r.error)throw new Error(r.error.message);
   GUEST=!GUEST;
   b.classList.toggle("on",GUEST);
   b.textContent=GUEST?"✓ Holding two · you and a guest":"+ Hold one for my plus one";
   var sp=$("sxSpot");if(sp)sp.textContent=GUEST?"You + 1 guest":"You";
 }catch(x){try{toast(x.message);}catch(e){}}
 b.disabled=false;BUSY=false;};

async function check(){
 if(SHOWN)return;
 try{
   if(typeof session==="undefined"||!session||!session.user)return;
   if(typeof needsSetup!=="undefined"&&needsSetup)return;
   if(typeof view!=="undefined"&&view==="setup")return;
   SHOWN=true;
   var r=await sb.rpc("fn_members_offer");
   if(r.error||!r.data||!r.data.show)return;
   OFFER=r.data;GUEST=false;
   setTimeout(function(){mount(offerHtml(OFFER));},700);
 }catch(e){}
}
var tries=0;
var iv=setInterval(function(){tries++;if(SHOWN||tries>40){clearInterval(iv);return;}check();},700);
check();
})();
