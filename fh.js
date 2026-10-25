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
+".gear{margin-top:14px;background:linear-gradient(180deg,#0c1d26,#0b1319);border:1px solid #1b5b70;border-radius:18px;padding:14px}.gear .gimgs{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.gear .gimgs img{width:100%;aspect-ratio:11/9;object-fit:cover;border-radius:10px;border:1px solid var(--line);background:#06080a;cursor:pointer;display:block}.gear .grow{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-top:12px}.gear .nm{font:600 22px/1 Oswald,sans-serif;text-transform:uppercase}.gear .tag{font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:var(--mute);margin-top:5px}.gear .pr b{display:block;font:600 26px/1 Oswald,sans-serif;color:var(--c2);white-space:nowrap}.gear .pr small{display:block;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mute);font-weight:800;margin-top:4px;text-align:right}.gear p{font-size:12.5px;color:#d6e0e4;margin-top:10px;line-height:1.5}.gear .gbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.gear .pick{border-radius:11px;padding:12px;font:700 13px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;background:linear-gradient(180deg,var(--c2),var(--c));color:#04141b;border:0}"
+".styles{display:grid;grid-template-columns:1fr 1fr;gap:8px}.styles .st,.cols .col{background:#07141b;border:1px solid var(--line);border-radius:12px;padding:6px;color:var(--ink);text-align:center;cursor:pointer}.styles .st img,.cols .col img{width:100%;aspect-ratio:11/9;object-fit:cover;border-radius:8px;display:block;background:#06080a}.styles .st b,.cols .col b{display:block;font:600 14px/1 Oswald,sans-serif;text-transform:uppercase;margin:8px 0 4px}.styles .st.on,.cols .col.on{border-color:var(--c);background:#0d2430;box-shadow:0 0 0 2px rgba(31,182,230,.25)}.cols{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.cols .col b{font-size:11px}.sizes{grid-template-columns:repeat(5,1fr)}.qty .sum{flex:1;font-size:12px;color:var(--c2);font-weight:800;text-align:right;line-height:1.3}"
+".share{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.btn{border:0;border-radius:12px;padding:14px 12px;font:700 14px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink);background:#0e2430;border:1px solid var(--line)}.btn.p{background:linear-gradient(180deg,var(--c2),var(--c));color:#04141b;border-color:transparent}.btn:disabled{opacity:.5;cursor:default}"
+".ov{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:flex-end;justify-content:center;z-index:50;padding:10px}.ov.on{display:flex}.sheet{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:#0b1319;border:1px solid #1b5b70;border-radius:20px;padding:18px;box-shadow:var(--shadow)}.sheet h3{font:600 22px/1.05 Oswald,sans-serif;text-transform:uppercase}.sheet .sub{font-size:12.5px;color:var(--mute);margin-top:5px;line-height:1.5}.sheet .sub b{color:var(--ink)}"
+"label{display:block;font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#cfdbe0;margin:13px 0 6px}label .o{color:var(--mute);font-weight:600;letter-spacing:0;text-transform:none}input,select,textarea{width:100%;background:#07141b;border:1px solid var(--line);border-radius:10px;color:var(--ink);padding:12px;font-family:inherit;font-size:16px}input:focus,select:focus,textarea:focus{outline:none;border-color:var(--c)}textarea{min-height:76px;resize:vertical;font-size:14px}"
+".sheet{padding-top:0}.shbar{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 -18px 12px;padding:12px 18px;background:#0b1319;border-bottom:1px solid var(--line)}.shbar span{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--mute);font-weight:800}.shbar button{background:#0e2430;border:1px solid var(--line);color:var(--c2);border-radius:99px;padding:8px 12px;font:700 12px/1 Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase}.next{margin-top:16px;padding-top:14px;border-top:1px solid var(--line);display:grid;gap:6px}.next .k{margin-bottom:4px}.next button{background:var(--panel2);border:1px solid var(--line);color:var(--ink);border-radius:10px;padding:12px;text-align:left;font-weight:700;font-size:13px}"
+".sizes{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.sizes button{background:#07141b;border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:10px 0;font-weight:800;font-size:12px}.sizes button.on{border-color:var(--c);background:#0d2430;color:var(--c2)}"
+".qty{display:flex;align-items:center;gap:10px;margin-top:8px}.qty button{width:40px;height:40px;border-radius:10px;background:#0e2430;border:1px solid var(--line);color:var(--ink);font-size:18px;font-weight:800}.qty b{font:600 22px/1 Oswald,sans-serif;min-width:30px;text-align:center}"
+".consent{display:flex;gap:9px;align-items:flex-start;font-size:11px;color:var(--mute);line-height:1.5;margin-top:12px}.consent input{width:18px;height:18px;margin-top:1px;flex:none}.fine{font-size:11px;color:var(--mute);line-height:1.5;margin-top:12px}.err{color:var(--red);font-size:12px;margin-top:8px;min-height:16px}.sheet .btn{width:100%;margin-top:14px}.cancel{background:none;border:0;color:var(--mute);font-family:inherit;font-weight:800;font-size:12px;margin-top:10px;width:100%}"
+".done{text-align:center;padding:6px 0}.done .tick{width:62px;height:62px;border-radius:50%;background:#0f2a1c;border:1px solid #1f5a3a;display:grid;place-items:center;margin:0 auto 12px}.done .tick svg{width:30px;height:30px;stroke:var(--green);fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}.done h3{font-size:26px}.done p{font-size:13px;color:var(--mute);margin-top:8px;line-height:1.55}.done p b{color:var(--ink)}"
+".card{margin-top:14px;border-radius:14px;overflow:hidden;border:1px solid var(--line);background:#07141b;max-width:300px;margin-left:auto;margin-right:auto}.card img{width:100%;aspect-ratio:4/5;object-fit:contain;display:block}.card .ct{padding:12px 14px 14px;border-top:1px solid var(--line);text-align:left}.card .ct small{display:block;font-size:10.5px;color:#cfdbe0;line-height:1.45}.card .ct em{font-style:normal;color:var(--c2);font-weight:800}"
+".toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(20px);background:#0f2a1c;color:var(--green);border:1px solid #1f5a3a;border-radius:99px;padding:10px 16px;font-size:12.5px;font-weight:700;opacity:0;transition:.2s;z-index:60;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}.toast.on{opacity:1;transform:translateX(-50%) translateY(0)}"
+".songs{display:grid;gap:6px;margin-top:12px}.song{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px;font-size:13px;font-weight:700}.song.more{color:var(--mute);font-weight:600;text-align:center;background:none;border-style:dashed}.hint{font-size:12px;color:var(--mute);margin-top:12px}"
+".foot{margin:34px 0 10px;text-align:center;font-size:11px;color:var(--mute);line-height:1.7}.foot b{color:var(--ink)}.foot a{color:var(--c2)}.loading{padding:60px 20px;text-align:center;color:var(--mute);font-size:13px}"
+".seatchips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.seatchips button{background:#07141b;border:1px solid var(--line);color:var(--ink);border-radius:99px;padding:8px 12px;font:700 12px/1 Oswald,sans-serif;letter-spacing:1px;text-transform:uppercase}.seatchips button.on,.seatchips button:hover{border-color:var(--c);color:var(--c2);background:#0d2430}"
+".seatwrap{display:grid;grid-template-columns:150px 1fr;gap:14px;align-items:center}.seatctl .seatchips{margin-top:10px}.seatsum{font-size:12px;color:var(--mute);margin-top:10px;line-height:1.45}.seatsum b{color:var(--c2)}"
+".tbl{position:relative;width:150px;height:150px}.tbl .top{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:86px;height:86px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#14394a,#0a1d26);border:1px solid #1b5b70;display:grid;place-content:center;text-align:center}.tbl .top b{font:600 28px/1 Oswald,sans-serif;color:#fff}.tbl .top small{font-size:9px;letter-spacing:1.4px;text-transform:uppercase;color:var(--mute);font-weight:800}"
+".tbl .ch{position:absolute;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:8px;background:#15323f;border:1px solid var(--line);cursor:pointer;transition:background .15s}.tbl .ch.on{background:var(--green);border-color:#7dffb4;box-shadow:0 0 10px rgba(57,255,136,.35)}"
+"@media(max-width:420px){.seatwrap{grid-template-columns:1fr;justify-items:center}.seatctl{width:100%}}"
+".kitc{margin-top:14px;background:linear-gradient(180deg,#1d0c17,#0b1319);border:1px solid #6b1f4a;border-radius:18px;padding:14px}.kitc p{font-size:12.5px;color:#d6e0e4;margin-top:10px;line-height:1.5}.kitc .pick{margin-top:12px;width:100%;border-radius:11px;padding:12px;font:700 13px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;background:linear-gradient(180deg,#ff6fb5,#ff2d8f);color:#1a0610;border:0}.kitc .pick:disabled{background:#0e2430;color:var(--mute)}"
+".kitprev{border:1px solid var(--line);background:#0d0b07;border-radius:14px;padding:6px}.kit{position:relative;width:100%;container-type:inline-size;border-radius:10px;overflow:hidden;background:#2a2a2a}.kit>img{display:block;width:100%;height:auto}"
+".kz{position:absolute;display:grid;place-items:center;transform:translate(-50%,-50%);border-radius:4px}.kz.act{border:1.5px dashed rgba(255,45,143,.95);background:rgba(255,45,143,.14)}.kz.has{border:0;background:none}.kz span{font:700 3.4cqw/0.95 Oswald,sans-serif;text-transform:uppercase;color:#fff;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.6)}.kz.has img{width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}"
+".kz.sb{left:70.9%;top:27.4%;width:20%;height:9%}.kz.tb{left:71.8%;top:57.8%;width:18%;height:3.8%}.kz.tb span{font-size:2.2cqw}.kz.tf{left:17.3%;top:83.8%;width:11.5%;height:5.6%;transform:translate(-50%,-50%) rotate(-5deg)}.kz.tl{left:65%;top:83%;width:12.5%;height:5.6%;transform:translate(-50%,-50%) rotate(3deg)}.kz.tf span,.kz.tl span{font-size:2.4cqw}"
+".knm{position:absolute;left:70.9%;top:17.6%;transform:translate(-50%,-50%);font:700 4.6cqw/1 Oswald,sans-serif;letter-spacing:.4cqw;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.8);white-space:nowrap}"
+".kopts{display:grid;gap:7px;margin-top:12px}.kopt{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#07141b;border:1px solid var(--line);border-radius:12px;padding:11px 12px;color:var(--ink);text-align:left}.kopt b{display:block;font:600 16px/1 Oswald,sans-serif;text-transform:uppercase}.kopt b i{font-style:normal;font:800 9px/1 Montserrat,sans-serif;letter-spacing:1.2px;background:#ff2d8f;color:#1a0610;border-radius:99px;padding:3px 7px;margin-left:6px;vertical-align:2px}.kopt small{display:block;font-size:11px;color:var(--mute);margin-top:4px;line-height:1.4}.kopt em{font:600 20px/1 Oswald,sans-serif;font-style:normal;color:#ff8cc6;white-space:nowrap}"
+".kopt.on{border-color:#ff2d8f;background:#24101b;box-shadow:0 0 0 2px rgba(255,45,143,.25)}.kopt.gone{opacity:.45;cursor:default}"
+".upl{display:flex;align-items:center;justify-content:center;margin-top:8px;border:1px dashed #6b1f4a;border-radius:10px;padding:12px;cursor:pointer;color:#ff8cc6;font:700 13px/1 Oswald,sans-serif;letter-spacing:1.4px;text-transform:uppercase}.upl input{display:none}.ksum{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;padding:12px;border-radius:10px;background:#24101b;border:1px solid #6b1f4a;font-size:12.5px}.ksum b{font:600 22px/1 Oswald,sans-serif;color:#ff8cc6}"
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
function open(h){$("fhSheet").innerHTML='<div class="shbar"><span>'+esc(first())+'\'s page</span><button type="button" onclick="closeAll()">‹ Back to page</button></div>'+h;$("fhOv").classList.add("on");$("fhSheet").scrollTop=0;}
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll();});
window.fhGoto=function(id){closeAll();var el=document.getElementById(id);if(el)setTimeout(function(){el.scrollIntoView({behavior:"smooth",block:"start"});},60);};
function nextHtml(skip){var L=[["tix","Hold a ticket"],["gear","Shirts & singlets"],["kit","Sponsor the fight gear"],["song","Walkout song"],["shareSec","Share the page"]].filter(function(x){return x[0]!==skip;});
  return '<div class="next"><div class="k">Keep going</div>'+L.map(function(x){return '<button type="button" onclick="fhGoto(\''+x[0]+'\')">'+x[1]+' ›</button>';}).join("")+'</div>';}

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
  var meta=["<span><b>Fight Club Central Coast</b></span>","<span>Fight Night · Sat 19 Dec</span>"];
  $("fhMeta").innerHTML='<div class="meta2"><span class="num">FIGHTER</span>'+meta.join("")+'</div>';
  $("fhBlock").innerHTML=blockHtml();
  $("fhMain").innerHTML=mainHtml()+'<div class="foot"><b>Fight Club Central Coast · Fight Night</b><br>Saturday 19 December · Legacy Gym Kincumber<br>Nothing charged until tickets release · 18+ ticketing, under-18s by nomination</div>';
}
function gridHtml(){var d=S.d,h="",n=Math.max(10,d.block|0);for(var i=0;i<n;i++){h+='<i class="'+(i<(d.held|0)?(S.me&&i===(d.held|0)-1?"me":"on"):"")+'"></i>';}return '<div class="grid10">'+h+'</div>';}
function blockHtml(){
  var d=S.d;
  return '<div class="block"><div class="hd"><b>'+esc(first())+'\'s tickets</b><small>'+(d.held|0)+' of '+(d.block|0)+' seats held</small></div>'+gridHtml()+'<p>'+(full()?'<b>'+esc(first())+'\'s block is full'+(d.pending?' and more are on the way.':'.')+'</b> Leave your details and you\'re first in line the moment more open.':'<b>'+(d.left|0)+' left.</b> Tables can cover up to 10 seats. Nothing to pay — you get first shot when tickets release.')+'</p></div>';
}
function tk(o){
  var T=S.d.tiers[o],v=S.d.venue[o]||{left:0,cap:0,seats:1};var left=v.left|0;var unitsLeft=o==="ga"?left:Math.ceil(left/(v.seats||1));var gone=left<=0;
  return '<div class="tk"><div class="hd"><div><div class="nm">'+esc(T.nm)+'</div><div class="tag">'+esc(T.tag)+'</div></div><div class="pr"><b>'+esc(T.price)+'</b><small>'+esc(T.unit)+' · to be confirmed</small></div></div><ul>'+(T.pts||[]).map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+(T.no||[]).map(function(x){return '<li class="no">'+esc(x)+'</li>';}).join("")+'</ul>'
   +'<div class="tag" style="margin-top:10px;color:var(--c2)">'+(o==="ga"?unitsLeft+' of '+T.cap+' tickets':unitsLeft+' of '+T.cap+' tables')+' left across the venue</div>'
   +(o==="gold"?'<div class="seatchips">'+[1,2,4,6,10].map(function(n){return '<button type="button" onclick="fhPick(\'gold\','+n+')">'+(n===10?'Full table · 10':n+(n===1?' seat':' seats'))+'</button>';}).join("")+'</div>':'')
   +'<button class="pick" '+(gone?'disabled':'onclick="fhPick(\''+o+'\')"')+'>'+(gone?'Fully held':(full()?'Join the list · ':'')+(o==="ga"?"Hold a GA spot":"Hold table seats · 1 to 10"))+'</button></div>';
}
function mainHtml(){
  var d=S.d,f=F();
  var nT=["gold","silver","ga"].filter(function(k){return d.tiers[k];}).length;
  var h='<div class="sec" id="tix"><h2>Hold me a ticket</h2><div class="sub">'+(nT===2?"Two":nT===3?"Three":"A few")+' ways to watch '+esc(first())+'. Holding a ticket doesn\'t mean you have to buy one. It puts you on the <b>early release</b> — first shot at tickets before they sell out, at the pre-sale discount. Nothing charged today.</div>';
  if(!d.live)h+='<div class="notice warn"><b>Holds open soon.</b> This page is being set up — check back shortly.</div>';
  h+='<div class="tix2">'+["gold","silver","ga"].filter(function(k){return d.tiers[k];}).map(tk).join("")+'</div><div class="notice"><b>Prices will be confirmed, and the seating and standing map released, with the official pricing in the coming week.</b> Everyone holding gets it first by text and email. Reserving an early-release ticket doesn\'t commit you to buying one — it gives our team a clear picture of what the crowd is after in terms of seating, so we can make the best calls for our guests.</div>';
  if(S.me)h+='<div class="notice win"><b>You\'re '+(S.me.status==="waitlist"?"on the list":"holding "+(S.me.tier==="gold"?(S.me.seats===10?"a full table":S.me.seats+(S.me.seats>1?" seats":" seat")):"one"))+', '+esc(S.me.first)+'.</b> '+esc(d.tiers[S.me.tier].nm)+'. We\'ll email and text you the moment tickets are available to buy.</div>';
  h+='</div>';
  h+='<div class="sec" id="gear"><h2>Supporter shirts &amp; singlets</h2><div class="sub">Get around '+esc(first())+' on the night — grab yourself one of the colourful '+esc(team())+' supporter shirts or singlets. Fight Night has no dress code bar enclosed shoes, so singlets, shirts, it\'s all welcome. Sizing runs from XS right through to 6XL.</div>'
   +'<div class="gear"><div class="gimgs">'+["indigenous","pink","yellow","grey","black"].map(function(c){return '<img src="'+MERCH+'shirt-'+c+'.jpg" alt="'+c+' shirt" onclick="fhGear(\'shirt\',\''+c+'\')">';}).join("")+'</div>'
   +'<div class="grow"><div><div class="nm">'+esc(team())+' gear</div><div class="tag">Shirt or singlet · 5 colourways · XS – 6XL</div></div><div class="pr"><b>'+money(d.shirt_cents)+'</b><small>each</small></div></div>'
   +'<p>Pre-request only — <b style="color:var(--c2)">nothing to pay today</b>. Pick your style, colour, size and how many, and payment details will be sent to you with your ticket release. '+((d.shirts|0)>0?'<b style="color:var(--ink)">'+(d.shirts|0)+' requested so far.</b>':'')+'</p>'
   +'<div class="gbtns"><button class="pick" onclick="fhGear(\'shirt\')">I want a shirt</button><button class="pick" onclick="fhGear(\'singlet\')">I want a singlet</button></div></div>';
  h+=kitSecHtml();
  var sg=d.songs||[];
  h+='<div class="sec" id="song"><h2>Walkout song</h2><div class="sub">Nominate the song '+esc(first())+' should walk out to. '+esc(first())+' picks the winner.</div>'
   +(d.walkout?'<div class="notice win"><b>Locked in:</b> '+esc(d.walkout)+'</div>':'')
   +(sg.length?'<div class="songs">'+sg.map(function(x){return '<div class="song">'+esc(x)+'</div>';}).join("")+((d.song_count|0)>sg.length?'<div class="song more">+'+((d.song_count|0)-sg.length)+' more</div>':'')+'</div>':'<div class="hint">No suggestions yet — you could be first.</div>')
   +'<button class="btn p" style="width:100%;margin-top:12px" onclick="fhSong()">Suggest a song</button></div>';
  h+='<div class="sec" id="shareSec"><h2>Share '+esc(first())+'\'s page</h2><div class="sub">Send '+esc(first())+'\'s link to the people who\'d come. Every hold goes to '+esc(first())+'\'s name.</div><div class="share"><button class="btn p" onclick="fhCopy()">Copy link</button><button class="btn" onclick="fhShare()">Share</button></div></div>';
  return h;
}

/* ---------- forms ---------- */
function person(){return '<label>Full name</label><input id="fN" placeholder="First and last" autocomplete="name"><label>Mobile</label><input id="fM" inputmode="tel" placeholder="04…" autocomplete="tel"><label>Email</label><input id="fE" inputmode="email" placeholder="you@…" autocomplete="email">';}
function readPerson(){var n=$("fN").value.trim().replace(/\s+/g," "),m=$("fM").value.trim(),e=$("fE").value.trim(),err=$("fErr");
  if(n.length<3||n.indexOf(" ")<0){err.textContent="Full name please, first and last.";return null;}
  if(!/^0?4\d{8}$|^\+?61\s?4\d{8}$/.test(m.replace(/[\s-]/g,""))){err.textContent="That mobile doesn't look right.";return null;}
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){err.textContent="Check the email.";return null;}
  err.textContent="";return {name:n,first:n.split(" ")[0],mobile:m,email:e};}
S.seats=1;
function hiCents(T){if(T.high)return T.high;var m=String(T.price||"").match(/([\d.]+)\D+([\d.]+)/);return m?Math.round(parseFloat(m[2])*100):T.low;}
function seatTable(){var n=S.seats,h='<div class="tbl"><div class="top"><b>'+n+'</b><small>'+(n===10?'full table':n===1?'seat':'seats')+'</small></div>';
  for(var i=0;i<10;i++){var a=(i/10)*Math.PI*2-Math.PI/2,x=50+41*Math.cos(a),y=50+41*Math.sin(a);h+='<i class="ch'+(i<n?' on':'')+'" style="left:'+x.toFixed(1)+'%;top:'+y.toFixed(1)+'%" onclick="fhSeats('+(i+1)+')" title="'+(i+1)+'"></i>';}
  return h+'</div>';}
function seatSum(){var T=S.d.tiers.gold,n=S.seats;return '<b>'+n+(n===1?' seat':' seats')+(n===10?' · the whole table':'')+'</b><br>est. '+money(T.low*n)+'–'+money(hiCents(T)*n)+' total';}
function seatWarn(){var left=S.d.left|0,n=S.seats;if(n<=left)return '';return '<div class="notice warn" style="margin-top:10px"><b>'+esc(first())+' has '+left+' left in '+esc(first())+'\'s block.</b> No problem — your '+n+' seats are all held, and '+esc(first())+'\'s block opens up another 10 automatically.</div>';}
function seatBtn(){var n=S.seats;return full()?'Put me on the list':n===10?'Hold the full table':'Hold '+n+(n===1?' seat':' seats');}
function seatsRefresh(){$("fTbl").innerHTML=seatTable();$("fSeatQ").textContent=S.seats;$("fSeatSum").innerHTML=seatSum();$("fSeatWarn").innerHTML=seatWarn();$("fGo").textContent=seatBtn();
  [].forEach.call(document.querySelectorAll("#fChips button"),function(b){b.classList.toggle("on",+b.getAttribute("data-n")===S.seats);});}
window.fhSeats=function(n){S.seats=Math.min(10,Math.max(1,n));seatsRefresh();};
window.fhPick=function(o,n){S.opt=o;var T=S.d.tiers[o];if(o==="gold")S.seats=n||S.seats||1;
  var seatUi=o!=="gold"?'':'<label>How many seats at the table</label><div class="seatwrap"><div id="fTbl">'+seatTable()+'</div><div class="seatctl"><div class="qty"><button type="button" onclick="fhSeats(S_seats()-1)">−</button><b id="fSeatQ">'+S.seats+'</b><button type="button" onclick="fhSeats(S_seats()+1)">+</button></div>'
    +'<div class="seatchips" id="fChips">'+[1,2,3,4,6,10].map(function(k){return '<button type="button" data-n="'+k+'" class="'+(k===S.seats?'on':'')+'" onclick="fhSeats('+k+')">'+(k===10?'Full table':k)+'</button>';}).join("")+'</div><div class="seatsum" id="fSeatSum">'+seatSum()+'</div></div></div><div id="fSeatWarn">'+seatWarn()+'</div>'
    +'<div class="fine" style="margin-top:8px">Tap the chairs or use − / +. A table seats 10 — hold 1 for yourself, a few for your crew, or the whole table. We\'ll grab your guests\' names when tickets release.</div>';
  open('<h3>'+(full()?'Join the list':o==="gold"?'Hold gold table seats':'Hold me a ticket')+'</h3><div class="sub"><b>'+esc(T.nm)+' · '+esc(T.price)+' '+esc(T.unit)+'.</b> '+esc(T.tag)+'. Final price and the seating map come out with the official pricing in the coming week. Holding doesn\'t commit you to buying — it puts you on the early release at the pre-sale discount and tells us what the crowd wants.'+(full()?' <b>'+esc(first())+'\'s block is full</b> — you\'ll be first in line when more open.':'')+'</div>'
   +seatUi+person()
   +'<label>A few words for '+esc(first())+' <span class="o">(optional — '+esc(first())+' reads these fight week)</span></label><textarea id="fMsg" placeholder="Go on, say something."></textarea>'
   +'<div class="consent"><input type="checkbox" id="fC" checked><span>Legacy Gym can text and email me about Fight Night. No spam, unsubscribe any time.</span></div><div class="err" id="fErr"></div><button class="btn p" id="fGo" onclick="fhSubmit()">'+(o==="gold"?seatBtn():full()?'Put me on the list':'Hold my ticket')+'</button><div class="fine">Under 18? Hold your own and we\'ll be in touch about nominating them.</div><button class="cancel" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>');
};
window.S_seats=function(){return S.seats;};
window.fhSubmit=async function(){if(S.busy)return;var p=readPerson();if(!p)return;S.busy=true;var go=$("fGo");go.disabled=true;go.textContent="One sec…";
  try{var j=await rpc("fh_hold2",{p_slug:SLUG,p_tier:S.opt,p_seats:(S.opt==="gold"?S.seats:1),p_name:p.name,p_mobile:p.mobile,p_email:p.email,p_message:$("fMsg").value,p_consent:$("fC").checked,p_ua:navigator.userAgent.slice(0,180)});
    if(!j||!j.ok)throw new Error((j&&j.message)||"Couldn't hold that. Try again.");
    S.me={first:j.first,tier:S.opt,status:j.status,seats:j.seats};await load(false);render();
    var T=S.d.tiers[S.opt],wait=j.status==="waitlist";
    open('<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg></div><h3 class="oz">'+(wait?"You're on the list":(S.opt==="gold"?(j.seats===10?"Full table held":j.seats+(j.seats>1?" seats held":" seat held")):"Ticket held"))+'</h3><p><b>'+esc(p.name)+'</b> — '+(S.opt==="gold"?(j.seats===10?"a full gold table (10 seats)":j.seats+" gold table seat"+(j.seats>1?"s":"")):esc(T.nm.toLowerCase()))+', '+(wait?'first in line for '+esc(first())+'\'s next block.':'held to '+esc(first())+'\'s name.')+' <b>An email and a text message will be sent to you as soon as your tickets are available for purchase</b> — then it\'s your call whether to buy.</p>'
     +(heroSrc()?'<div class="card"><img src="'+esc(heroSrc())+'" alt=""><div class="ct"><small><em>'+esc(p.first)+'</em> is coming to watch '+esc(first())+'. '+((S.d.left|0)>0?(S.d.left|0)+' tickets left in '+esc(first())+'\'s block.':esc(first())+'\'s block just filled.')+'</small></div></div>':'')
     +'<button class="btn p" style="width:100%;margin-top:14px" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button><div class="share"><button class="btn" onclick="fhShare()">Share the page</button><button class="btn" onclick="fhCopy()">Copy link</button></div>'+nextHtml("tix")+'</div>');
  }catch(e){$("fErr").textContent=e.message||String(e);go.disabled=false;go.textContent=full()?"Put me on the list":"Hold my ticket";}
  S.busy=false;};

var MERCH=APP+"/img/fc/merch-";
var SIZES=["XS","S","M","L","XL","2XL","3XL","4XL","5XL","6XL"];
var COLOURS=[["indigenous","Indigenous"],["pink","Pink"],["yellow","Yellow"],["grey","Grey"],["black","Black & white"]];
var shirt={style:"shirt",colour:"indigenous",size:"L",qty:1};
function styleHtml(){return ["shirt","singlet"].map(function(st){return '<button type="button" class="st'+(shirt.style===st?" on":"")+'" onclick="fhStyle(\''+st+'\')"><img src="'+MERCH+st+'-'+shirt.colour+'.jpg" alt=""><b>'+(st==="shirt"?"Shirt":"Singlet")+'</b></button>';}).join("");}
function coloursHtml(){return COLOURS.map(function(c){return '<button type="button" class="col'+(shirt.colour===c[0]?" on":"")+'" onclick="fhColour(\''+c[0]+'\')"><img src="'+MERCH+shirt.style+'-'+c[0]+'.jpg" alt=""><b>'+c[1]+'</b></button>';}).join("");}
function sizesHtml(){return SIZES.map(function(s){return '<button type="button" class="'+(shirt.size===s?"on":"")+'" onclick="fhSize(\''+s+'\')">'+s+'</button>';}).join("");}
function gearSummary(){var c=COLOURS.filter(function(x){return x[0]===shirt.colour;})[0][1];return shirt.qty+' × '+c+' '+shirt.style+(shirt.qty>1?"s":"")+' · '+shirt.size+' · '+money(S.d.shirt_cents*shirt.qty);}
function gearRefresh(){$("fStyles").innerHTML=styleHtml();$("fCols").innerHTML=coloursHtml();$("fSizes").innerHTML=sizesHtml();$("fQty").textContent=shirt.qty;$("fSum").textContent=gearSummary();$("fGo").textContent="Request "+(shirt.qty>1?shirt.qty+" ":"my ")+shirt.style+(shirt.qty>1?"s":"");}
window.fhStyle=function(st){shirt.style=st;gearRefresh();};
window.fhColour=function(c){shirt.colour=c;gearRefresh();};
window.fhSize=function(s){shirt.size=s;gearRefresh();};
window.fhQty=function(d){shirt.qty=Math.min(10,Math.max(1,shirt.qty+d));gearRefresh();};
window.fhGear=function(st,c){if(st)shirt.style=st;if(c)shirt.colour=c;
  open('<h3>'+esc(team())+' supporter gear</h3><div class="sub"><b>'+money(S.d.shirt_cents)+' each.</b> Pre-request only — nothing to pay today. Payment details come with your ticket release, and we confirm your size before anything is printed.</div>'
   +'<label>Shirt or singlet</label><div class="styles" id="fStyles">'+styleHtml()+'</div>'
   +'<label>Colour</label><div class="cols" id="fCols">'+coloursHtml()+'</div>'
   +'<label>Size <span class="o">(XS – 6XL)</span></label><div class="sizes" id="fSizes">'+sizesHtml()+'</div>'
   +'<label>How many</label><div class="qty"><button type="button" onclick="fhQty(-1)">−</button><b id="fQty">'+shirt.qty+'</b><button type="button" onclick="fhQty(1)">+</button><span class="sum" id="fSum">'+gearSummary()+'</span></div>'
   +person()+'<div class="err" id="fErr"></div><button class="btn p" id="fGo" onclick="fhShirtGo()">Request my '+shirt.style+'</button><button class="cancel" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>');
};
window.fhShirt=function(){fhGear("shirt");};
window.fhShirtGo=async function(){if(S.busy)return;var p=readPerson();if(!p)return;S.busy=true;var go=$("fGo");go.disabled=true;go.textContent="One sec…";
  try{var j=await rpc("fh_shirt",{p_slug:SLUG,p_name:p.name,p_mobile:p.mobile,p_email:p.email,p_size:shirt.size,p_qty:shirt.qty,p_style:shirt.style,p_colour:shirt.colour});
    if(!j||!j.ok)throw new Error((j&&j.message)||"Couldn't save that. Try again.");
    await load(false);render();
    open('<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg></div><h3 class="oz">'+(shirt.style==="shirt"?"Shirt":"Singlet")+(shirt.qty>1?"s":"")+' requested</h3><p><b>'+esc(p.name)+'</b> — '+esc(gearSummary())+', to '+esc(first())+'\'s name. <b>Payment details will be sent to you</b> once the print run is confirmed. Nothing charged today.</p><div class="card" style="max-width:260px"><img src="'+MERCH+shirt.style+'-'+shirt.colour+'.jpg" alt="" style="aspect-ratio:auto"></div><button class="btn p" style="width:100%;margin-top:14px" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>'+nextHtml("gear")+'</div>');
  }catch(e){$("fErr").textContent=e.message||String(e);go.disabled=false;go.textContent="Request my "+shirt.style;}
  S.busy=false;};
var KITIMG=APP+"/img/fc/kit-base.jpg";var STORE="https://jyslqxepodrseyhoppce.supabase.co/storage/v1/object/sponsor-logos/";
var KIT=[{id:"singlet",name:"Singlet",blurb:"Your logo on the back of the singlet, fighter's name above it.",price:25000},
 {id:"trunks",name:"Trunks",blurb:"Your logo on the back waistband and both legs. Fighter's name on the front.",price:25000},
 {id:"kit",name:"Full kit",blurb:"Singlet and trunks — your logo in every sponsor space. Exclusive: yours is the only business on the gear.",price:45000,hot:true}];
var kit={sel:"kit",logo:null};
function kitTaken(id){var t=(S.d&&S.d.kit_taken)||{};if(t.kit)return true;if(id==="kit")return !!(t.singlet||t.trunks);return !!t[id];}
function kitPrev(sel,logo){var showS=sel==="singlet"||sel==="kit",showT=sel==="trunks"||sel==="kit",name=(F().last||"").toUpperCase();
  function z(cls,on){return '<div class="kz '+cls+(on?' act':'')+(logo&&on?' has':'')+'">'+(logo&&on?'<img src="'+logo+'" alt="">':(on?'<span>Your<br>logo</span>':''))+'</div>';}
  return '<div class="kit"><img src="'+KITIMG+'" alt="Fight Club kit">'+(showS?'<div class="knm">'+esc(name)+'</div>':'')+z("sb",showS)+z("tb",showT)+z("tf",showT)+z("tl",showT)+'</div>';}
function koptsHtml(pick){return KIT.map(function(k){var g=kitTaken(k.id),on=pick&&kit.sel===k.id;
  return '<button type="button" class="kopt'+(g?' gone':'')+(on?' on':'')+(k.hot?' hot':'')+'" '+(g?'disabled':'onclick="'+(pick?'fhKitSel':'fhKit')+'(\''+k.id+'\')"')+'><span><b>'+k.name+(k.hot?' <i>Best value</i>':'')+'</b><small>'+(g?'Taken':esc(k.blurb))+'</small></span><em>'+(g?'—':money(k.price))+'</em></button>';}).join("");}
function kitSecHtml(){var allGone=kitTaken("singlet")&&kitTaken("trunks");
  return '<div class="sec" id="kit"><h2>Sponsor '+esc(first())+'\'s fight gear</h2><div class="sub">Put your business on '+esc(first())+'\'s singlet and trunks on fight night. <b>Every dollar goes to keeping local kids who can\'t afford it training in the gym, year round.</b></div>'
   +'<div class="kitc"><div class="kitprev">'+kitPrev("kit",null)+'</div><div class="kopts">'+koptsHtml(false)+'</div>'
   +'<p>Your logo goes on '+esc(first())+'\'s actual fight kit. We\'ll be in contact to secure your logo and details, send you the mock-up to approve before anything is printed, and photos from the night to share. <b style="color:var(--c2)">Nothing is charged here</b> — we confirm with you first.</p>'
   +'<button class="pick" '+(allGone?'disabled':'onclick="fhKit()"')+'>'+(allGone?esc(first())+'\'s gear is fully sponsored':'Sponsor '+esc(first())+'\'s gear')+'</button></div></div>';}
function kitSum(){var k=KIT.filter(function(x){return x.id===kit.sel;})[0];return '<span>'+k.name+' sponsor · '+esc(F().name)+'</span><b>'+money(k.price)+'</b>';}
function kitRefresh(){$("kOpts").innerHTML=koptsHtml(true);$("kPrev").innerHTML=kitPrev(kit.sel,kit.logo);$("kSum").innerHTML=kitSum();}
window.fhKitSel=function(id){kit.sel=id;kitRefresh();};
window.fhKitLogo=function(inp){var f=inp.files&&inp.files[0];if(!f)return;if(f.size>8e6){$("fErr").textContent="That file's a bit big — under 8MB please.";return;}kit.file=f;var r=new FileReader();r.onload=function(){kit.logo=r.result;kitRefresh();};r.readAsDataURL(f);};
window.fhKit=function(id){if(id)kit.sel=id;if(kitTaken(kit.sel)){var a=KIT.filter(function(k){return !kitTaken(k.id);})[0];if(!a)return;kit.sel=a.id;}
  open('<h3>Sponsor '+esc(first())+'\'s gear</h3><div class="sub">Pick what you\'d like and leave your details. <b>We\'ll be in contact to secure your business logo, final details and invoice</b> — nothing is charged here. Every dollar goes to the kids\' program.</div>'
   +'<label>What you\'re sponsoring</label><div class="kopts" id="kOpts">'+koptsHtml(true)+'</div>'
   +'<label>Where your logo goes</label><div class="kitprev" id="kPrev">'+kitPrev(kit.sel,null)+'</div><div class="notice" style="margin-top:10px"><b>No need to send your logo now.</b> We\'ll be in contact to secure your business logo, final details and invoice.</div>'
   +'<label>Business name</label><input id="kB" placeholder="As it should appear on the gear" maxlength="80">'+person()
   +'<div class="ksum" id="kSum">'+kitSum()+'</div><div class="consent"><input type="checkbox" id="fC" checked><span>Legacy Gym can contact me about this sponsorship.</span></div><div class="err" id="fErr"></div><button class="btn p" id="fGo" onclick="fhKitGo()">Send my sponsorship request</button><button class="cancel" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>');};
window.fhKitGo=async function(){if(S.busy)return;var b=$("kB").value.trim();if(b.length<2){$("fErr").textContent="What's the business called?";return;}var p=readPerson();if(!p)return;
  S.busy=true;var go=$("fGo");go.disabled=true;go.textContent="One sec…";
  try{var k=KIT.filter(function(x){return x.id===kit.sel;})[0],lp=null,ln=null;
    if(kit.file){try{var ext=(kit.file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,5)||"png",path="uploads/"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)+"."+ext;
      var ur=await fetch(STORE+path,{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+KEY,"content-type":kit.file.type||"application/octet-stream","x-upsert":"false"},body:kit.file});if(ur.ok){lp=path;ln=kit.file.name;}}catch(e){}}
    var j=await rpc("fn_sponsor_request",{p_name:p.name,p_business:b,p_email:p.email,p_mobile:p.mobile,p_items:[{id:k.id,qty:1,label:k.name,price:k.price}],p_total_cents:k.price,p_kind:"kit",p_fighter_id:F().id||null,p_logo_path:lp,p_logo_name:ln,p_pay_mode:"request"});
    if(!j||!(j.ref||j.ok))throw new Error("Couldn't send that. Try again.");
    var logo=kit.logo,sel=kit.sel;await load(false);render();
    open('<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg></div><h3 class="oz">Sponsorship request sent</h3><p><b>'+esc(b)+'</b> — '+esc(k.name.toLowerCase())+' sponsor for '+esc(F().name)+', '+money(k.price)+'. <b>We\'ll be in contact to secure your business logo, final details and invoice.</b> Your logo goes to print once you\'ve approved the mock-up.</p><div class="kitprev" style="max-width:320px;margin:14px auto 0">'+kitPrev(sel,logo)+'</div><button class="btn p" style="width:100%;margin-top:14px" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>'+nextHtml("kit")+'</div>');
  }catch(e){$("fErr").textContent=e.message||String(e);go.disabled=false;go.textContent="Send my sponsorship request";}
  S.busy=false;};
window.fhSong=function(){
  open('<h3>Walkout song for '+esc(first())+'</h3><div class="sub">Song and artist, and your name so '+esc(first())+' knows who to thank (or blame).</div><label>Song</label><input id="fS" placeholder="Song – Artist" maxlength="120"><label>Your name</label><input id="fN" placeholder="First name is fine" maxlength="60"><div class="err" id="fErr"></div><button class="btn p" id="fGo" onclick="fhSongGo()">Suggest it</button><button class="cancel" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>');
  setTimeout(function(){$("fS").focus();},60);
};
window.fhSongGo=async function(){if(S.busy)return;var sg=$("fS").value.trim(),nm=$("fN").value.trim(),err=$("fErr");
  if(sg.length<2){err.textContent="What's the song?";return;}if(nm.length<2){err.textContent="And your name.";return;}
  S.busy=true;var go=$("fGo");go.disabled=true;go.textContent="One sec…";
  try{var j=await rpc("fh_song",{p_slug:SLUG,p_song:sg,p_name:nm});if(!j||!j.ok)throw new Error((j&&j.message)||"Couldn't save that. Try again.");
    await load(false);render();
    open('<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L19 7"/></svg></div><h3 class="oz">Song suggested</h3><p><b>'+esc(sg)+'</b> is in. '+esc(first())+' sees every suggestion and picks the walkout song.</p><button class="btn p" style="width:100%;margin-top:14px" onclick="closeAll()">‹ Back to '+esc(first())+'\'s page</button>'+nextHtml("song")+'</div>');
  }catch(e){err.textContent=e.message||String(e);go.disabled=false;go.textContent="Suggest it";}
  S.busy=false;};
window.fhCopy=async function(){try{await navigator.clipboard.writeText(pageUrl());toast("Link copied");}catch(e){prompt("Copy this link:",pageUrl());}};
window.fhShare=async function(){var t=first()+" is fighting at Legacy on Dec 19. Hold a ticket to '+first()+'\'s name — nothing to pay yet: "+pageUrl();try{if(navigator.share){await navigator.share({title:F().name+" · Fight Night",text:t,url:pageUrl()});return;}}catch(e){if(e&&e.name==="AbortError")return;}fhCopy();};

async function load(paint){var j=await rpc("fh_public",{p_slug:SLUG});if(!j||!j.ok)throw new Error("no_fighter");S.d=j;if(paint!==false)render();}
if(/[?&]preview=1/.test(location.search)){var pb=document.createElement('div');pb.style.cssText='background:#2a2211;color:#f5b942;border-bottom:1px solid #6b5520;font:800 10px/1.4 Montserrat,sans-serif;letter-spacing:1.5px;text-transform:uppercase;text-align:center;padding:8px 12px';pb.textContent='Guest view · this is the live page — anything you submit here is real';document.body.insertBefore(pb,document.body.firstChild);}
shell();root.querySelector("#fhMain").innerHTML='<div class="loading">Opening '+esc(SLUG.replace(/-/g," "))+'\'s page…</div>';
load().catch(function(e){root.querySelector("#fhMain").innerHTML='<div class="loading">That fighter page isn\'t live yet.<br><br><a href="'+APP+'/fightnight" style="color:var(--c2)">See the event page</a></div>';});
})();
