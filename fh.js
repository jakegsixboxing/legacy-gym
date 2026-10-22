/* ===== Fight Night · "Hold Me a Ticket" fighter page (public) · 22 Oct 2026 =====
   Served at /fightnight/<slug> by api/fightnight.js (a=share), which writes the OG tags and <div id="fh" data-slug>.
   Data: RPC fh_public (counts only — never supporter names or money), fh_hold, fh_shirt. Nothing is charged. */
(function(){
"use strict";
var SB="https://jyslqxepodrseyhoppce.supabase.co/rest/v1/rpc/";
var KEY="sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
var APP="https://legacygym-app.vercel.app";
var LOGO=APP+"/img/fc/fc-logo.png";
var root=document.getElementById("fh");
var SLUG=(root&&root.getAttribute("data-slug"))||(location.pathname.split("/").pop()||"");
var $=function(id){return document.getElementById(id);};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function money(c){return "$"+((c||0)/100).toFixed(2).replace(/\.00$/,"");}
async function rpc(fn,args){var r=await fetch(SB+fn,{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+KEY,"content-type":"application/json"},body:JSON.stringify(args||{})});var j=null;try{j=await r.json();}catch(e){}if(!r.ok)throw new Error((j&&(j.message||j.hint))||"Network error ("+r.status+")");return j;}

var css=document.createElement("style");css.textContent=
":root{--bg:#06080a;--panel:#0b1319;--panel2:#07141b;--line:#16303c;--ink:#eef3f5;--mute:#8fa4ae;--c:#1fb6e6;--c2:#7fe0ff;--green:#39FF88;--amber:#f5b942;--red:#ff6b7a;--shadow:0 18px 50px rgba(0,0,0,.55)}"
+"*{box-sizing:border-box;margin:0;padding:0}html,body{background:var(--bg);color:var(--ink);font-family:Montserrat,system-ui,sans-serif;-webkit-font-smoothing:antialiased}body{min-height:100vh;padding-bottom:30px}button{font-family:inherit;cursor:pointer}"
+".oz{font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px}.k{font-size:10px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--c)}.mute{color:var(--mute)}.wrap{max-width:1040px;margin:0 auto;padding:0 16px}"
+".bar{display:flex;align-items:center;justify-content:space-between;padding:14px 0 6px}.bar img{height:44px}.bar .ev{text-align:right}.bar .ev .k{display:block}.bar .ev .t{font:600 15px/1 Oswald,sans-serif;text-transform:uppercase;margin-top:4px}.bar .ev .cd{font-size:11px;color:var(--mute);margin-top:3px;font-variant-numeric:tabular-nums}"
+".grid{display:grid;gap:18px}@media(min-width:900px){.grid{grid-template-columns:420px 1fr;align-items:start}.sticky{position:sticky;top:14px}}"
+".hero{position:relative;border-radius:22px;overflow:hidden;background:#07141b;border:1px solid var(--line);box-shadow:var(--shadow)}.hero img{display:block;width:100%;aspect-ratio:4/5;object-fit:contain;background:#06080a}"
+".hero.nop img{object-fit:cover}.hero .nm{position:absolute;left:0;right:0;bottom:0;padding:70px 18px 18px;background:linear-gradient(180deg,rgba(6,8,10,0),rgba(6,8,10,.92) 60%)}.hero .nm b{display:block;font:600 38px/.95 Oswald,sans-serif;text-transform:uppercase}.hero .nm small{display:block;color:var(--c2);font-size:10px;letter-spacing:2.4px;text-transform:uppercase;font-weight:800;margin-top:8px}"
+".hero.blank{aspect-ratio:4/5;display:grid;place-items:center;text-align:center;padding:20px}.hero.blank img{width:46%;aspect-ratio:auto;height:auto;margin:0 auto}"
+".meta2{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:12px;padding:0 4px;font-size:12px;color:#cfdbe0}.meta2 b{color:#fff}.meta2 .num{display:inline-block;background:var(--c);color:#04141b;font:700 11px/1 Oswald,sans-serif;letter-spacing:2px;padding:5px 8px;border-radius:6px}"
+".block{margin-top:14px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:14px}.block .hd{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.block .hd b{font:600 18px/1 Oswald,sans-serif;text-transform:uppercase}.block .hd small{font-size:11px;color:var(--mute);font-weight:700}"
+".grid10{display:grid;grid-template-columns:repeat(10,1fr);gap:5px;margin-top:11px}.grid10 i{aspect-ratio:1;border-radius:7px;background:#15323f;display:block}.grid10 i.on{background:var(--c)}.grid10 i.me{background:var(--green)}"
+".block p{font-size:12px;color:var(--mute);margin-top:9px;line-height:1.5}.block p b{color:var(--ink)}"
+".sec{margin-top:22px}.sec h2{font:600 22px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px}.sec .sub{font-size:12.5px;color:var(--mute);margin-top:5px;line-height:1.5;max-width:60ch}.sec .sub b{color:var(--ink)}"
+".notice{margin-top:14px;background:#0d2430;border:1px solid #1b5b70;border-radius:14px;padding:12px 14px;font-size:13px;line-height:1.5}.notice b{color:var(--c2)}.notice.win{background:#0f2a1c;border-color:#1f5a3a}.notice.win b{color:var(--green)}.notice.warn{background:#2a2211;border-color:#6b5520}.notice.warn b{color:var(--amber)}"
+".tix2{display:grid;gap:10px;margin-top:14px}.tk{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:16px;position:relative;overflow:hidden}.tk .hd{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.tk .nm{font:600 22px/1 Oswald,sans-serif;text-transform:uppercase}.tk .tag{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:var(--mute);margin-top:5px}.tk .pr{text-align:right}.tk .pr b{display:block;font:600 26px/1 Oswald,sans-serif;color:var(--c2);font-variant-numeric:tabular-nums;white-space:nowrap}.tk .pr small{display:block;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mute);font-weight:800;margin-top:4px}"
+".tk ul{list-style:none;margin-top:12px;display:grid;gap:5px}.tk li{font-size:12.5px;color:#d6e0e4;padding-left:18px;position:relative;line-height:1.45}.tk li:before{content:\"\";position:absolute;left:0;top:7px;width:8px;height:8px;border-radius:50%;background:var(--c)}.tk li.no{color:var(--mute)}.tk li.no:before{background:#2a3a42}"
+".tk .pick{margin-top:12px;width:100%;border-radius:11px;padding:12px;font:700 13px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;background:linear-gradient(180deg,var(--c2),var(--c));color:#04141b;border:1px solid transparent}.tk .pick:disabled{background:#0e2430;color:var(--mute);border-color:var(--line);cursor:default}"
+".shirt{margin-top:14px;background:linear-gradient(180deg,#0c1d26,#0b1319);border:1px solid #1b5b70;border-radius:18px;padding:16px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.shirt .nm{font:600 22px/1 Oswald,sans-serif;text-transform:uppercase}.shirt .tag{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:var(--mute);margin-top:5px}.shirt p{font-size:12.5px;color:#d6e0e4;margin-top:10px;line-height:1.5;grid-column:1/-1}.shirt .pr b{display:block;font:600 26px/1 Oswald,sans-serif;color:var(--c2);white-space:nowrap}.shirt .pr small{display:block;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mute);font-weight:800;margin-top:4px;text-align:right}.shirt .pick{grid-column:1/-1;border-radius:11px;padding:12px;font:700 13px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;background:linear-gradient(180deg,var(--c2),var(--c));color:#04141b;border:0}"
+".share{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.btn{border:0;border-radius:12px;padding:14px 12px;font:700 14px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink);background:#0e2430;border:1px solid var(--line)}.btn.p{background:linear-gradient(180deg,var(--c2),var(--c));color:#04141b;border-color:transparent}.btn:disabled{opacity:.5;cursor:default}"
+".ov{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:flex-end;justify-content:center;z-index:50;padding:10px}.ov.on{display:flex}.sheet{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:#0b1319;border:1px solid #1b5b70;border-radius:20px;padding:18px;box-shadow:var(--shadow)}.sheet h3{font:600 22px/1.05 Oswald,sans-serif;text-transform:uppercase}.sheet .sub{font-size:12.5px;color:var(--mute);margin-top:5px;line-height:1.5}.sheet .sub b{color:var(--ink)}"
+"label{display:block;font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#cfdbe0;margin:13px 0 6px}label .o{color:var(--mute);font-weight:600;letter-spacing:0;text-transform:none}input,select,textarea{width:100%;background:#07141b;border:1px solid var(--line);border-radius:10px;color:var(--ink);padding:12px;font-family:inherit;font-size:16px}input:focus,select:focus,textarea:focus{outline:none;border-color:var(--c)}textarea{min-height:76px;resize:vertical;font-size:14px}"
+".sizes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.sizes button{background:#07141b;border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:10px 0;font-weight:800;font-size:12px}.sizes button.on{border-color:var(--c);background:#0d2430;color:var(--c2)}"
+".qty{display:flex;align-items:center;gap:10px;margin-top:8px}.qty button{width:40px;height:40px;border-radius:10px;background:#0e2430;border:1px solid var(--line);color:var(--ink);font-size:18px;font-weight:800}.qty b{font:600 22px/1 Oswald,sans-serif;min-width:30px;text-align:center}"
+".consent{display:flex;gap:9px;align-items:flex-start;font-size:11px;color:var(--mute);line-height:1.5;margin-top:12px}.consent input{width:18px;height:18px;margin-top:1px;flex:none}.fine{font-size:11px;color:var(--mute);line-height:1.5;margin-top:12px}.err{color:var(--red);font-size:12px;margin-top:8px;min-height:16px}.sheet .btn{width:100%;margin-top:14px}.cancel{background:none;border:0;color:var(--mute);font-family:inherit;font-weight:800;font-size:12px;margin-top:10px;width:100%}"
+".done{text-align:center;padding:6px 0}.done .tick{width:62px;height:62px;border-radius:50%;background:#0f2a1c;border:1px solid #1f5a3a;display:grid;place-items:center;margin:0 auto 12px}.done .tick svg{width:30px;height:30px;stroke:var(--green);fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.done h3{font-size:26px}.done p{font-size:13px;color:var(--mute);margin-top:8px;line-height:1.55}.done p b{color:var(--ink)}"
+".card{margin-top:14px;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#07141b;max-width:300px;margin-left:auto;margin-right:auto}.card img{width:100%;aspect-ratio:4/5;object-fit:contain;display:block}.card .ct{padding:12px 14px 14px;border-top:1px solid var(--line);text-align:left}.card .ct small{display:block;font-size:10.5px;color:#cfdbe0;line-height:1.45}.card .ct em{font-style:normal;color:var(--c2);font-weight:800}"
+".toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);background:#0f2a1c;color:var(--green);border:1px solid #1f5a3a;border-radius:99px;padding:10px 16px;font-size:12.5px;font-weight:700;opacity:0;transition:.2s;z-index:60;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}"
+".foot{margin:34px 0 10px;text-align:center;font-size:11px;color:var(--mute);line-height:1.7}.foot b{color:var(--ink)}.foot a{color:var(--c2)}.loading{padding:60px 20px;text-align:center;color:var(--mute);font-size:13px}"
+"@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}";
document.head.appendChild(css);

var S={d:null,opt:"gold",me:null,busy:false};
function F(){return S.d.fighter;}
function first(){return F().first;}
function team(){return "Team "+F().last;}
function pageUrl(){return APP+"/fightnight/"+F().slug;}
function full(){return (S.d.left|0)<=0;}
function heroSrc(){return F().poster||F().photo||"";}

window.toast=function(m){var t=$("fhToast");t.textContent=m;t.classList.add("on");clearTimeout(t._x);t._x=setTimeout(function(){t.classList.remove("on");},2800);};
window.closeAll=function(){$("fhOv").classList.remove("on");};
function open(h){$("fhSheet").innerHTML=h;$("fhOv").classList.add("on");$("fhSheet").scrollTop=0;}

function shell(){
  root.innerHTML='<div class="wrap"><div class="bar"><img src="'+LOGO+'" alt="Fight Club Central Coast"><div class="ev"><span class="k">Fight Night</span><div class="t">Sat 19 December</div><div class="cd" id="fhCd"></div></div></div>'
   +'<div class="grid"><div class="sticky"><div id="fhHero"></div><div id="fhMeta"></div><div id="fhBlock"></div></div><div id="fhMain"></div></div></div>'
   +'<div class="ov" id="fhOv"><div class="sheet" id="fhSheet"></div></div><div class="toast" id="fhToast"></div>';
  $("fhOv").addEventListener("click",function(e){if(e.target===$("fhOv"))closeAll();});
}
function render(){
  var d=S.d,f=F();
  var days=Math.ceil((new Date(2026,11,19,19,0)-new Date())/864e5);$("fhCd").textContent=days+" days to go · Legacy Gym Kincumber";
  document.title=f.name+" · Fight Night · Hold me a ticket";
  var src=heroSrc();
  $("fhHero").innerHTML=src?'<div class="hero'+(f.poster?"":" nop")+'"><img src="'+esc(src)+'" alt="'+esc(f.name)+' — Fight Night">'+(f.poster?"":'<div class="nm"><b>'+esc(f.name)+'</b><small>Fight Club Central Coast · Fight Night</small></div>')+'</div>'
    :'<div class="hero blank"><div><img src="'+LOGO+'" alt=""><div style="margin-top:16px"><b class="oz" style="font-size:34px">'+esc(f.name)+'</b><div class="k" style="margin-top:8px">Fight Night · Sat 19 Dec</div></div></div></div>';
  var meta=[];if(f.weight)meta.push("<span><b>"+esc(f.weight)+" kg</b></span>");if(f.suburb)meta.push("<span><b>"+esc(f.suburb)+"</b></span>");meta.push("<span>Fight Club Central Coast</span>");
  $("fhMeta").innerHTML='<div class="meta2"><span class="num">FIGHTER</span>'+meta.join("")+'</div>';
  $("fhBlock").innerHTML=blockHtml();
  $("fhMain").innerHTML=mainHtml()+'<div class="foot"><b>Fight Club Central Coast · Fight Night</b><br>Saturday 19 December · Legacy Gym Kincumber<br>Nothing charged until tickets release · 18+ ticketing, under-18s by nomination</div>';
}
function gridHtml(){var d=S.d,h="",n=Math.max(10,d.block|0);for(var i=0;i<n;i++){h+='<i class="'+(i<(d.held|0)?(S.me&&i===(d.held|0)-1?"me":"on"):"")+'"></i>';}return '<div class="grid10">'+h+'</div>';}
function blockHtml(){
  var d=S.d;
  return '<div class="block"><div class="hd"><b>'+esc(first())+'\'s tickets</b><small>'+(d.held|0)+' of '+(d.block|0)+' held</small></div>'+gridHtml()+'<p>'+(full()?'<b>'+esc(first())+'\'s block is full'+(d.pending?' and more are on the way.':'.')+'</b> Leave your details and you\'re first in line the moment more open.':'<b>'+(d.left|0)+' left.</b> One hold per person. Nothing to pay — you get first shot when tickets release.')+'</p></div>';
}
function tk(o){
  var T=S.d.tiers[o],v=S.d.venue[o]||{left:0,cap:0,seats:1};var left=v.left|0;var unitsLeft=o==="ga"?left:Math.ceil(left/(v.seats||1));var gone=left<=0;
  return '<div class="tk"><div class="hd"><div><div class="nm">'+esc(T.nm)+'</div><div class="tag">'+esc(T.tag)+'</div></div><div class="pr"><b>'+esc(T.price)+'</b><small>'+esc(T.unit)+' · to be confirmed</small></div></div><ul>'+(T.pts||[]).map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+(T.no||[]).map(function(x){return '<li class="no">'+esc(x)+'</li>';}).join("")+'</ul>'
   +'<div class="tag" style="margin-top:10px;color:var(--c2)">'+(o==="ga"?unitsLeft+' of '+T.cap+' tickets':unitsLeft+' of '+T.cap+' tables')+' left across the venue</div>'
   +'<button class="pick" '+(gone?'disabled':'onclick="fhPick(\''+o+'\')"')+'>'+(gone?'Fully held':(full()?'Join the list · ':'Hold a ')+(o==="ga"?"GA ticket":T.nm.toLowerCase()+" seat"))+'</button></div>';
}
function mainHtml(){
  var d=S.d,f=F();
  var h='<div class="sec"><h2>Hold me a ticket</h2><div class="sub">Three ways to watch '+esc(first())+'. Holding a ticket doesn\'t mean you have to buy one. It puts you on the <b>early release</b> — first shot at tickets before they sell out, at the pre-sale discount. Nothing charged today.</div>';
  if(!d.live)h+='<div class="notice warn"><b>Holds open soon.</b> This page is being set up — check back shortly.</div>';
  h+='<div class="tix2">'+tk("gold")+tk("silver")+tk("ga")+'</div><div class="notice"><b>Prices to be confirmed within the next 2 weeks</b>, pending final pricing from our suppliers — they may come down or go up a little from the ranges shown. Everyone holding gets the final price by text and email before anything goes on sale.</div>';
  if(S.me)h+='<div class="notice win"><b>You\'re '+(S.me.status==="waitlist"?"on the list":"holding one")+', '+esc(S.me.first)+'.</b> '+esc(d.tiers[S.me.tier].nm)+'. We\'ll email and text you the moment tickets are available to buy.</div>';
  h+='</div>';
  h+='<div class="sec"><h2>'+esc(team())+' shirt</h2><div class="sub">Back '+esc(first())+' on the night in team colours. Pre-request yours now and we\'ll send payment details once the print run is confirmed.</div>'
   +'<div class="shirt"><div><div class="nm">I want a '+esc(team())+' shirt</div><div class="tag">Fight Club blue · unisex sizes · kids sizes</div></div><div class="pr"><b>'+money(d.shirt_cents)+'</b><small>per shirt</small></div><p>Pre-request only — <b style="color:var(--c2)">nothing to pay today</b>. Payment details will be sent to you with your ticket release. '+((d.shirts|0)>0?'<b style="color:var(--ink)">'+(d.shirts|0)+' requested so far.</b>':'')+'</p><button class="pick" onclick="fhShirt()">Request my shirt</button></div></div>';
  h+='<div class="sec"><h2>Share '+esc(first())+'\'s page</h2><div class="sub">Send '+esc(first())+'\'s link to the people who\'d come. Every hold goes to '+esc(first())+'\'s name.</div><div class="share"><button class="btn p" onclick="fhCopy()">Copy link</button><button class="btn" onclick="fhShare()">Share</button></div></div>';
  return h;
}

/* ---------- forms ---------- */
function person(){return '<label>Full name</label><input id="fN" placeholder="First and last" autocomplete="name"><label>Mobile</label><input id="fM" inputmode="tel" placeholder="04…" autocomplete="tel"><label>Email</label><input id="fE" inputmode="email" placeholder="you@…" autocomplete="email">';}
function readPerson(){var n=$("fN").value.trim().replace(/\s+/g," "),m=$("fM").value.trim(),e=$("fE").value.trim(),err=$("fErr");
  if(n.length<3||n.indexOf(" ")<0){err.textContent="Full name please, first and last.";return null;}
  if(!/^0?4\d{8}$|^\+?61\s?4\d{8}$/.test(m.replace(/[\s-]/g,""))){err.textContent="That mobile doesn't look right.";return null;}
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){err.textContent="Check the email.";return null;}
  err.textContent="";return {name:n,first:n.split(" ")[0],mobile:m,email:e};}
window.fhPick=function(o){S.opt=o;var T=S.d.tiers[o];
  open('<h3>'+(full()?'Join the list':'Hold me a ticket')+'</h3><div class="sub"><b>'+esc(T.nm)+' · '+esc(T.price)+' '+esc(T.unit)+'.</b> '+esc(T.tag)+'. Price to be confirmed within 2 weeks, pending supplier pricing. Holding doesn\'t commit you to buying — it puts you on the early release at the pre-sale discount. One hold per person.'+(full()?' <b>'+esc(first())+'\'s block is full</b> — you\'ll be first in line when more open.':'')+'</div>'+person()
   +'<label>A few words for '+esc(first())+' <span class="o">(optional — '+esc(first())+' reads these fight week)</span></label><textarea id="fMsg" placeholder="Go on, say something."></textarea>'
   +'<div class="consent"><input type="checkbox" id="fC" checked><span>Legacy Gym can text and email me about Fight Night. No spam, unsubscribe any time.</span></div><div class="err" id="fErr"></div><button class="btn p" id="fGo" onclick="fhSubmit()">'+(full()?'Put me on the list':'Hold my ticket')+'</button><div class="fine">Under 18? Hold your own and we\'ll be in touch about nominating them.</div><button class="cancel" onclick="closeAll()">Not now</button>');
  setTimeout(function(){$("fN").focus();},60);
};
window.fhSubmit=async function(){if(S.busy)return;var p=readPerson();if(!p)return;S.busy=true;var go=$("fGo");go.disabled=true;go.textContent="One sec…";
  try{var j=await rpc("fh_hold",{p_slug:SLUG,p_tier:S.opt,p_name:p.name,p_mobile:p.mobile,p_email:p.email,p_message:$("fMsg").value,p_consent:$("fC").checked,p_ua:navigator.userAgent.slice(0,180)});
    if(!j||!j.ok)throw new Error((j&&j.message)||"Couldn't hold that. Try again.");
    S.me={first:j.first,tier:S.opt,status:j.status};await load(false);render();
    var T=S.d.tiers[S.opt],wait=j.status==="waitlist";
    open('<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg></div><h3 class="oz">'+(wait?"You're on the list":"Ticket held")+'</h3><p><b>'+esc(p.name)+'</b> — '+esc(T.nm.toLowerCase())+', '+(wait?'first in line for '+esc(first())+'\'s next block.':'held to '+esc(first())+'\'s name.')+' <b>An email and a text message will be sent to you as soon as your tickets are available for purchase</b> — then it\'s your call whether to buy.</p>'
     +(heroSrc()?'<div class="card"><img src="'+esc(heroSrc())+'" alt=""><div class="ct"><small><em>'+esc(p.first)+'</em> is coming to watch '+esc(first())+'. '+((S.d.left|0)>0?(S.d.left|0)+' tickets left in '+esc(first())+'\'s block.':esc(first())+'\'s block just filled.')+'</small></div></div>':'')
     +'<div class="share"><button class="btn p" onclick="fhShare()">Share '+esc(first())+'\'s page</button><button class="btn" onclick="fhCopy()">Copy link</button></div><button class="cancel" onclick="closeAll()">Back to '+esc(first())+'\'s page</button></div>');
  }catch(e){$("fErr").textContent=e.message||String(e);go.disabled=false;go.textContent=full()?"Put me on the list":"Hold my ticket";}
  S.busy=false;};

var SIZES=["XS","S","M","L","XL","2XL","3XL","Kids 8","Kids 10","Kids 12","Kids 14"];var shirt={size:"L",qty:1};
function sizesHtml(){return SIZES.map(function(s){return '<button type="button" class="'+(shirt.size===s?"on":"")+'" onclick="fhSize(\''+s+'\')">'+s+'</button>';}).join("");}
window.fhSize=function(s){shirt.size=s;$("fSizes").innerHTML=sizesHtml();};
window.fhQty=function(d){shirt.qty=Math.min(10,Math.max(1,shirt.qty+d));$("fQty").textContent=shirt.qty;};
window.fhShirt=function(){
  open('<h3>'+esc(team())+' shirt</h3><div class="sub"><b>'+money(S.d.shirt_cents)+' per shirt.</b> Pre-request only — nothing to pay today. Payment details will be sent to you with your ticket release, and we\'ll confirm your size before anything is printed.</div>'+person()
   +'<label>Size</label><div class="sizes" id="fSizes">'+sizesHtml()+'</div><label>How many</label><div class="qty"><button type="button" onclick="fhQty(-1)">−</button><b id="fQty">'+shirt.qty+'</b><button type="button" onclick="fhQty(1)">+</button></div>'
   +'<div class="err" id="fErr"></div><button class="btn p" id="fGo" onclick="fhShirtGo()">Request my shirt</button><button class="cancel" onclick="closeAll()">Not now</button>');
  setTimeout(function(){$("fN").focus();},60);
};
window.fhShirtGo=async function(){if(S.busy)return;var p=readPerson();if(!p)return;S.busy=true;var go=$("fGo");go.disabled=true;go.textContent="One sec…";
  try{var j=await rpc("fh_shirt",{p_slug:SLUG,p_name:p.name,p_mobile:p.mobile,p_email:p.email,p_size:shirt.size,p_qty:shirt.qty});
    if(!j||!j.ok)throw new Error((j&&j.message)||"Couldn't save that. Try again.");
    await load(false);render();
    open('<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg></div><h3 class="oz">Shirt requested</h3><p><b>'+esc(p.name)+'</b> — '+shirt.qty+' × '+esc(team())+' shirt, size '+esc(shirt.size)+', '+money(S.d.shirt_cents)+' each. <b>Payment details will be sent to you</b> once the print run is confirmed. Nothing charged today.</p><button class="cancel" onclick="closeAll()">Back to '+esc(first())+'\'s page</button></div>');
  }catch(e){$("fErr").textContent=e.message||String(e);go.disabled=false;go.textContent="Request my shirt";}
  S.busy=false;};

window.fhCopy=async function(){try{await navigator.clipboard.writeText(pageUrl());toast("Link copied");}catch(e){prompt("Copy this link:",pageUrl());}};
window.fhShare=async function(){var t=first()+" is fighting at Legacy on Dec 19. Hold a ticket to '+first()+'\'s name — nothing to pay yet: "+pageUrl();try{if(navigator.share){await navigator.share({title:F().name+" · Fight Night",text:t,url:pageUrl()});return;}}catch(e){if(e&&e.name==="AbortError")return;}fhCopy();};

async function load(paint){var j=await rpc("fh_public",{p_slug:SLUG});if(!j||!j.ok)throw new Error("no_fighter");S.d=j;if(paint!==false)render();}
shell();root.querySelector("#fhMain").innerHTML='<div class="loading">Opening '+esc(SLUG.replace(/-/g," "))+'\'s page…</div>';
load().catch(function(e){root.querySelector("#fhMain").innerHTML='<div class="loading">That fighter page isn\'t live yet.<br><br><a href="'+APP+'/fightnight" style="color:var(--c2)">See the event page</a></div>';});
})();
