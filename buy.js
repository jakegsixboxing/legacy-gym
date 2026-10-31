/* ===== Legacy Gym · public buy page (singlets / merch) · 31 Oct 2026 =====
   Served at /shop/<slug> by api/shop.js (a=share). Data: RPC shop_public (product, sizes, what's left), shop_order_create (saves the order),
   then POST /api/fightnight?a=shop-checkout turns it into a Shopify draft order and sends the buyer to Shopify to pay. Pick up at the gym. */
(function(){
"use strict";
var SB="https://jyslqxepodrseyhoppce.supabase.co/rest/v1/rpc/";
var KEY="sb_publishable_otcHJ5LC4yf-69CAoZghZA_yk_8h_we";
var APP="https://legacygym-app.vercel.app";
var root=document.getElementById("buy");
var SLUG=(root&&root.getAttribute("data-slug"))||(location.pathname.split("/").pop()||"");
var $=function(id){return document.getElementById(id);};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function money(c){return "$"+((c||0)/100).toFixed(2).replace(/\.00$/,"");}
async function rpc(fn,args){var r=await fetch(SB+fn,{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+KEY,"content-type":"application/json"},body:JSON.stringify(args||{})});var j=null;try{j=await r.json();}catch(e){}if(!r.ok)throw new Error((j&&(j.message||j.error))||("HTTP "+r.status));return j;}

var css=document.createElement("style");css.textContent=
":root{--bg:#06080a;--panel:#0b1319;--panel2:#07141b;--line:#16303c;--ink:#eef3f5;--mute:#8fa4ae;--c:#1fb6e6;--c2:#7fe0ff;--green:#39FF88;--red:#ff6b7a;--shadow:0 18px 50px rgba(0,0,0,.55)}"
+"*{box-sizing:border-box;margin:0;padding:0}html,body{background:var(--bg);color:var(--ink);font-family:Montserrat,system-ui,sans-serif;-webkit-font-smoothing:antialiased}body{min-height:100vh;padding-bottom:40px}button,input{font-family:inherit}"
+".oz{font-family:Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px}.k{font-size:10px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--c)}.mute{color:var(--mute)}"
+".wrap{max-width:1040px;margin:0 auto;padding:0 16px}.bar{display:flex;align-items:center;justify-content:space-between;padding:16px 0 8px}.bar .lg{font:600 22px/1 Oswald,sans-serif;letter-spacing:3px;text-transform:uppercase}.bar .lg small{display:block;font-size:9px;letter-spacing:4px;color:var(--c);margin-top:3px}.bar .ev{text-align:right;font-size:11px;color:var(--mute)}"
+".grid{display:grid;gap:18px}@media(min-width:900px){.grid{grid-template-columns:460px 1fr;align-items:start}.sticky{position:sticky;top:14px}}"
+".hero{position:relative;border-radius:22px;overflow:hidden;background:#0a0d11;border:1px solid var(--line);box-shadow:var(--shadow)}.hero img{display:block;width:100%;height:auto;background:#0a0d11}"
+".flip{display:flex;gap:6px;position:absolute;left:12px;bottom:12px}.flip button{background:rgba(6,8,10,.75);border:1px solid var(--line);color:#fff;border-radius:99px;padding:7px 14px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(6px)}.flip button.on{background:var(--c);color:#04141b;border-color:var(--c)}"
+".thumbs{display:flex;gap:8px;margin-top:10px}.thumbs img{width:64px;height:80px;object-fit:cover;border-radius:10px;border:2px solid transparent;cursor:pointer;background:#0a0d11}.thumbs img.on{border-color:var(--c)}"
+".ttl{font:600 36px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px;margin-top:4px}.price{font:600 28px/1 Oswald,sans-serif;color:var(--c2);margin-top:8px}.price small{font:600 12px Montserrat,sans-serif;color:var(--mute);margin-left:8px;letter-spacing:1px;text-transform:uppercase}"
+".blurb{font-size:13.5px;line-height:1.6;color:#cfdbe0;margin-top:12px;max-width:60ch}"
+".block{margin-top:16px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px}.block h2{font:600 15px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:1px}.block h2 span{color:var(--mute);font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:0;text-transform:none;font-weight:600;margin-left:8px}"
+".sizes{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.sizes button{min-width:58px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:#07141b;color:#fff;font-weight:800;font-size:14px;cursor:pointer;position:relative}.sizes button.on{background:var(--c);color:#04141b;border-color:var(--c)}.sizes button.out{opacity:.35;cursor:not-allowed;text-decoration:line-through}.sizes button small{display:block;font-size:9px;font-weight:700;color:inherit;opacity:.75;margin-top:2px;text-decoration:none}"
+".qty{display:flex;align-items:center;gap:10px;margin-top:12px}.qty button{width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:#07141b;color:#fff;font-size:20px;cursor:pointer}.qty b{min-width:30px;text-align:center;font-size:18px}"
+"label.l{display:block;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--mute);margin:12px 0 6px}input{width:100%;background:#07141b;border:1px solid var(--line);border-radius:12px;padding:13px 14px;color:#fff;font-size:15px;outline:none}input:focus{border-color:var(--c)}"
+".pay{display:block;width:100%;margin-top:16px;padding:16px;border-radius:14px;border:0;background:var(--c);color:#04141b;font:700 17px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:1.5px;cursor:pointer}.pay:disabled{opacity:.5;cursor:default}.pay.busy{opacity:.7}"
+".fine{font-size:11.5px;color:var(--mute);line-height:1.55;margin-top:10px}.fine b{color:var(--ink)}"
+".steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.steps div{background:#07141b;border:1px solid var(--line);border-radius:12px;padding:10px;font-size:11px;color:#cfdbe0;line-height:1.4}.steps b{display:block;font:600 13px Oswald,sans-serif;text-transform:uppercase;color:var(--c);margin-bottom:3px}"
+".off{margin-top:16px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;text-align:center}.off b{display:block;font:600 20px Oswald,sans-serif;text-transform:uppercase}.off p{font-size:12.5px;color:var(--mute);margin-top:6px}"
+".err{margin-top:10px;background:rgba(255,107,122,.1);border:1px solid rgba(255,107,122,.4);color:#ffb3bc;border-radius:12px;padding:10px 12px;font-size:12.5px}"
+".done{text-align:center;padding:40px 16px}.done .big{font:600 40px/1 Oswald,sans-serif;text-transform:uppercase;color:var(--c2)}.done p{color:var(--mute);margin-top:10px;font-size:13.5px;line-height:1.6;max-width:46ch;margin-left:auto;margin-right:auto}.done .ref{font:600 22px Oswald,sans-serif;letter-spacing:3px;margin-top:14px}"
+".pre{margin-top:14px;background:linear-gradient(90deg,#0b2a38,#07141b);border:1px solid var(--c);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px}.pre .cd{font:600 26px/1 Oswald,sans-serif;color:var(--c2);white-space:nowrap;font-variant-numeric:tabular-nums}.pre .cd small{display:block;font:800 8.5px Montserrat,sans-serif;letter-spacing:2px;color:var(--mute);margin-top:3px}.pre p{font-size:12px;line-height:1.5;color:#cfdbe0}.pre p b{color:#fff}"
+".closed{margin-top:14px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px;text-align:center}.closed b{display:block;font:600 22px Oswald,sans-serif;text-transform:uppercase;color:var(--red)}.closed p{font-size:12.5px;color:var(--mute);margin-top:6px;line-height:1.5}"
+".foot{text-align:center;font-size:11px;color:var(--mute);margin-top:30px}.foot a{color:var(--c);text-decoration:none}";
document.head.appendChild(css);

var P=null,S={size:null,qty:1,img:0,busy:false,err:""},SKEW=0,TICK=null;
function closesIn(){if(!P||!P.closes_at)return null;return new Date(P.closes_at).getTime()-(Date.now()+SKEW);}
function cdTxt(ms){if(ms<=0)return "Closed";var s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=s%60;return d>0?d+"d "+h+"h "+m+"m":h>0?h+"h "+String(m).padStart(2,"0")+"m "+String(sec).padStart(2,"0")+"s":m+"m "+String(sec).padStart(2,"0")+"s";}
function closesLabel(){var d=new Date(P.closes_at);return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"short"})+" "+d.toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"}).toLowerCase().replace(" ","");}
function tick(){var el=document.getElementById("cdN");if(!el)return;var ms=closesIn();if(ms===null)return;if(ms<=0){clearInterval(TICK);TICK=null;load().then(paint);return;}el.textContent=cdTxt(ms);}
function shell(inner){return '<div class="wrap"><div class="bar"><div class="lg">Legacy<small>Gym · Kincumber</small></div><div class="ev">Official gym store<br>Pick up at the gym</div></div>'+inner+'<div class="foot">Questions? Ask at the front desk or message the gym. Legacy Gym Kincumber.</div></div>';}

function paint(){
 if(!P){root.innerHTML=shell('<div class="off"><b>Loading…</b></div>');return;}
 var imgs=[P.image_url,P.image2_url].filter(Boolean),cur=imgs[S.img]||imgs[0];
 var isClosed=P.closed||(P.closes_at&&closesIn()<=0),onSale=P.active&&P.price_cents>0&&!isClosed;
 var left='<div class="sticky"><div class="hero">'+(cur?'<img src="'+esc(cur)+'" alt="'+esc(P.name)+'">':'<div style="aspect-ratio:4/5;display:grid;place-items:center" class="mute">No photo yet</div>')
  +(imgs.length>1?'<div class="flip">'+imgs.map(function(u,i){return '<button class="'+(S.img===i?'on':'')+'" data-img="'+i+'">'+(i===0?'Front':'Back')+'</button>';}).join("")+'</div>':'')+'</div></div>';
 var right='<div><div class="k">Legacy Boxing Club · singlet</div><div class="ttl">'+esc(P.name)+'</div>'
  +(onSale?'<div class="price">'+money(P.price_cents)+'<small>each · '+(P.preorder?'pre-order · ready in ~'+(P.turnaround_days||10)+' days':'pick up at the gym')+'</small></div>':'<div class="price mute" style="font-size:18px">Not on sale yet</div>')
  +(P.blurb?'<div class="blurb">'+esc(P.blurb)+'</div>':'');
 if(isClosed){right+='<div class="closed"><b>Pre-orders closed</b><p>The one order went in'+(P.sold?' with '+P.sold+' singlet'+(P.sold===1?'':'s')+' on it':'')+'. No extra stock, no second run. Follow the gym for the next drop.</p></div></div>';root.innerHTML=shell('<div class="grid">'+left+right+'</div>');bind();return;}
 if(!onSale){right+='<div class="off"><b>Check back soon</b><p>This one isn\'t open for orders yet. Keep the link, it\'ll work the moment it is.</p></div></div>';root.innerHTML=shell('<div class="grid">'+left+right+'</div>');bind();return;}
 if(P.preorder){var ms=closesIn();right+='<div class="pre">'+(ms!==null?'<div class="cd"><span id="cdN">'+cdTxt(ms)+'</span><small>Until it closes</small></div>':'')+'<p><b>Pre-order only.</b> One order goes in'+(ms!==null?' when this closes ('+closesLabel()+')':'')+', no extra stock, no second run. Pay now and it\'s on your back in about '+(P.turnaround_days||10)+' days.</p></div>';if(ms!==null&&!TICK)TICK=setInterval(tick,1000);}
 var sizes=(P.sizes||[]).map(function(s){var n=P.avail?P.avail[s]:null,out=n!==null&&n!==undefined&&n<=0,low=n!==null&&n!==undefined&&n>0&&n<=5;return '<button class="'+(S.size===s?'on':'')+(out?' out':'')+'" data-size="'+esc(s)+'"'+(out?' disabled':'')+'>'+esc(s)+(out?'<small>Sold out</small>':low?'<small>'+n+' left</small>':'')+'</button>';}).join("");
 right+='<div class="block"><h2>1 · Size<span>Standard unisex fit. Between sizes? Go up.</span></h2><div class="sizes">'+sizes+'</div></div>'
  +'<div class="block"><h2>2 · How many</h2><div class="qty"><button data-q="-1">−</button><b>'+S.qty+'</b><button data-q="1">+</button><span class="mute" style="font-size:12px;margin-left:6px">'+(S.qty>1?money(P.price_cents*S.qty)+' total':'')+'</span></div></div>'
  +'<div class="block"><h2>3 · Your details<span>So we know whose it is at pick-up</span></h2><label class="l">Name</label><input id="bN" placeholder="First and last" autocomplete="name" value="'+esc(S.name||"")+'"><label class="l">Email</label><input id="bE" type="email" inputmode="email" autocomplete="email" placeholder="Your receipt goes here" value="'+esc(S.email||"")+'"><label class="l">Mobile</label><input id="bM" inputmode="tel" autocomplete="tel" placeholder="We text you when it\'s ready" value="'+esc(S.mob||"")+'">'
  +(S.err?'<div class="err">'+esc(S.err)+'</div>':'')
  +'<button class="pay'+(S.busy?' busy':'')+'" id="bPay" '+(S.size&&!S.busy?'':'disabled')+'>'+(S.busy?'One sec…':S.size?(P.preorder?'Pre-order · ':'Pay ')+money(P.price_cents*S.qty)+' · size '+esc(S.size):'Pick a size')+'</button>'
  +'<div class="fine">Tap pay and you\'ll go to the Legacy Gym Shopify checkout (card, Apple Pay, Google Pay). <b>'+esc(P.pickup||"Pick up at the gym.")+'</b> No postage.</div>'
  +'<div class="steps"><div><b>1</b>Pick size, pay online'+(P.closes_at?' before it closes':'')+'</div><div><b>2</b>'+(P.preorder?'One order goes in, ~'+(P.turnaround_days||10)+' days':'We text you when it\'s in')+'</div><div><b>3</b>We text you, grab it at the desk</div></div></div></div>';
 root.innerHTML=shell('<div class="grid">'+left+right+'</div>');bind();
}
function keep(){var n=$("bN"),e=$("bE"),m=$("bM");if(n)S.name=n.value;if(e)S.email=e.value;if(m)S.mob=m.value;}
function bind(){
 root.querySelectorAll("[data-img]").forEach(function(b){b.onclick=function(){keep();S.img=+b.getAttribute("data-img");paint();};});
 root.querySelectorAll("[data-size]").forEach(function(b){b.onclick=function(){if(b.disabled)return;keep();S.size=b.getAttribute("data-size");S.err="";paint();};});
 root.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){keep();S.qty=Math.max(1,Math.min(10,S.qty+(+b.getAttribute("data-q"))));paint();};});
 var p=$("bPay");if(p)p.onclick=pay;
}
async function pay(){
 keep();S.err="";
 var name=(S.name||"").trim(),email=(S.email||"").trim(),mob=(S.mob||"").trim();
 if(!S.size){S.err="Pick a size first.";paint();return;}
 if(name.split(/\s+/).length<2){S.err="First and last name please, so we hand it to the right person.";paint();return;}
 if(!/^\S+@\S+\.\S+$/.test(email)){S.err="That email doesn't look right.";paint();return;}
 S.busy=true;paint();
 try{
  var o=await rpc("shop_order_create",{p_slug:SLUG,p_size:S.size,p_qty:S.qty,p_name:name,p_email:email,p_mobile:mob});
  if(!o||!o.ok){S.busy=false;S.err=o&&o.error==="sold_out"?"Sorry, size "+S.size+" just sold out"+(o.left?" (only "+o.left+" left)":"")+". Pick another.":o&&o.error==="closed"?"Pre-orders just closed, sorry. The order's gone in.":o&&o.error==="not_on_sale"?"This one isn't on sale right now.":"Couldn't save that. Try again.";await load();paint();return;}
  var r=await fetch(APP+"/api/fightnight?a=shop-checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ref:o.ref,email:email})});
  var j=null;try{j=await r.json();}catch(e){}
  if(!r.ok||!j||!j.url){S.busy=false;S.err=j&&j.error==="not_configured"?"Payments aren't switched on yet. Ask at the desk.":"Couldn't open the checkout ("+((j&&j.error)||r.status)+"). Try again or pay at the desk, your order ref is "+o.ref+".";paint();return;}
  try{sessionStorage.setItem("lg_shop_ref",o.ref);}catch(e){}
  location.href=j.url;
 }catch(e){S.busy=false;S.err="Something went wrong: "+(e.message||e);paint();}
}
async function load(){try{var j=await rpc("shop_public",{p_slug:SLUG});if(j&&j.ok){P=j;if(j.now)SKEW=new Date(j.now).getTime()-Date.now();}}catch(e){}}
(async function(){await load();if(!P){root.innerHTML=shell('<div class="off"><b>That link isn\'t live</b><p>Check the link you were sent.</p></div>');return;}document.title=P.name+" · Legacy Gym";paint();})();
})();
