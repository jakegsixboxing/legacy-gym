/* ===== Legacy Gym · singlet DROP page (several designs, one cart, bundle pricing) · 2 Nov 2026 =====
   Served at /shop/<drop-slug> by api/fightnight.js (a=shop-share). Data: RPC shop_drop_public (designs, sizes, tiers, closing time),
   shop_drop_order_create (saves one line per design/size, all sharing a cart ref, priced on the bundle tier),
   then POST /api/fightnight?a=shop-checkout turns the cart into one Shopify draft order and sends the buyer there to pay. Pick up at the gym. */
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
":root{--bg:#06080a;--panel:#0b1319;--panel2:#07141b;--line:#16303c;--ink:#eef3f5;--mute:#8fa4ae;--c:#1fb6e6;--c2:#7fe0ff;--ok:#4bc97a;--red:#ff6b7a;--shadow:0 18px 50px rgba(0,0,0,.55)}"
+"*{box-sizing:border-box;margin:0;padding:0}html,body{background:var(--bg);color:var(--ink);font-family:Montserrat,system-ui,sans-serif;-webkit-font-smoothing:antialiased}body{min-height:100vh;padding-bottom:40px}button,input{font-family:inherit}"
+".k{font-size:10px;font-weight:800;letter-spacing:2.4px;text-transform:uppercase;color:var(--c)}.mute{color:var(--mute)}"
+".wrap{max-width:1080px;margin:0 auto;padding:0 16px}.bar{display:flex;align-items:center;justify-content:space-between;padding:16px 0 8px}.bar .lg{font:600 22px/1 Oswald,sans-serif;letter-spacing:3px;text-transform:uppercase}.bar .lg small{display:block;font-size:9px;letter-spacing:4px;color:var(--c);margin-top:3px}.bar .ev{text-align:right;font-size:11px;color:var(--mute)}"
+".top{display:grid;gap:18px;margin-top:6px}@media(min-width:900px){.top{grid-template-columns:400px 1fr;align-items:start}}"
+".poster{border-radius:20px;overflow:hidden;border:1px solid var(--line);box-shadow:var(--shadow);background:#0a0d11}.poster img{display:block;width:100%;height:auto}"
+".ttl{font:600 40px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px;margin-top:4px;text-wrap:balance}.blurb{font-size:13.5px;line-height:1.6;color:#cfdbe0;margin-top:10px;max-width:60ch}"
+".tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}.tiers div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 10px;text-align:center}.tiers div.on{border-color:var(--c);background:linear-gradient(180deg,#0b2a38,#07141b)}.tiers b{display:block;font:600 24px/1 Oswald,sans-serif;color:var(--c2);font-variant-numeric:tabular-nums}.tiers i{display:block;font-style:normal;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute);margin-top:5px}"
+".pre{margin-top:14px;background:linear-gradient(90deg,#0b2a38,#07141b);border:1px solid var(--c);border-radius:14px;padding:12px 14px;display:flex;align-items:center;gap:12px}.pre .cd{font:600 26px/1 Oswald,sans-serif;color:var(--c2);white-space:nowrap;font-variant-numeric:tabular-nums}.pre .cd small{display:block;font:800 8.5px Montserrat,sans-serif;letter-spacing:2px;color:var(--mute);margin-top:3px}.pre p{font-size:12px;line-height:1.5;color:#cfdbe0}.pre p b{color:#fff}"
+".sec{font:600 22px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px;margin:28px 0 4px}.sec+p{font-size:12.5px;color:var(--mute)}"
+".designs{display:grid;gap:14px;margin-top:12px}@media(min-width:720px){.designs{grid-template-columns:1fr 1fr}}"
+".d{background:var(--panel);border:1px solid var(--line);border-radius:18px;overflow:hidden}.d.has{border-color:var(--c)}.d img{display:block;width:100%;height:auto;background:#0a0d11}.d .in{padding:14px}.d .nm{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.d .nm b{font:600 22px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px}.d .nm span{font-size:11px;font-weight:800;color:var(--c2);white-space:nowrap}.d p{font-size:12px;color:var(--mute);line-height:1.5;margin-top:6px}"
+".sizes{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.sizes button{min-width:48px;padding:11px 10px;border-radius:11px;border:1px solid var(--line);background:var(--panel2);color:#fff;font-weight:800;font-size:13px;cursor:pointer}.sizes button.on{background:var(--c);color:#04141b;border-color:var(--c)}"
+".add{display:block;width:100%;margin-top:10px;padding:13px;border-radius:12px;border:1px solid var(--c);background:transparent;color:var(--c2);font:700 15px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:1.2px;cursor:pointer}.add:disabled{opacity:.4;cursor:default;border-color:var(--line);color:var(--mute)}.add.go{background:var(--c);color:#04141b}"
+".cart{margin-top:18px;background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:16px}.cart h2{font:600 20px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:.5px}"
+".ln{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.ln:last-of-type{border-bottom:0}.ln img{width:58px;height:54px;object-fit:cover;border-radius:8px;flex:none}.ln .t{flex:1;min-width:0}.ln .t b{display:block;font-size:13.5px}.ln .t span{font-size:11.5px;color:var(--mute)}.ln .q{display:flex;align-items:center;gap:6px}.ln .q button{width:32px;height:32px;border-radius:9px;border:1px solid var(--line);background:var(--panel2);color:#fff;font-size:17px;cursor:pointer}.ln .q b{min-width:18px;text-align:center}.ln .p{min-width:62px;text-align:right;font-weight:800;font-variant-numeric:tabular-nums}"
+".tot{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}.tot b{font:600 30px/1 Oswald,sans-serif;color:var(--c2);font-variant-numeric:tabular-nums}.tot span{font-size:12px;color:var(--mute)}"
+".nudge{margin-top:10px;background:rgba(31,182,230,.1);border:1px dashed var(--c);border-radius:12px;padding:10px 12px;font-size:12.5px;color:#cfdbe0}.nudge b{color:#fff}.save{color:var(--ok);font-weight:800}"
+"label.l{display:block;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--mute);margin:12px 0 6px}input{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:13px 14px;color:#fff;font-size:15px;outline:none}input:focus{border-color:var(--c)}"
+".pay{display:block;width:100%;margin-top:16px;padding:17px;border-radius:14px;border:0;background:var(--c);color:#04141b;font:700 18px/1 Oswald,sans-serif;text-transform:uppercase;letter-spacing:1.5px;cursor:pointer}.pay:disabled{opacity:.5;cursor:default}"
+".fine{font-size:11.5px;color:var(--mute);line-height:1.55;margin-top:10px}.fine b{color:var(--ink)}"
+".off,.closed{margin-top:16px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;text-align:center}.off b,.closed b{display:block;font:600 22px Oswald,sans-serif;text-transform:uppercase}.closed b{color:var(--red)}.off p,.closed p{font-size:12.5px;color:var(--mute);margin-top:6px;line-height:1.5}"
+".err{margin-top:10px;background:rgba(255,107,122,.1);border:1px solid rgba(255,107,122,.4);color:#ffb3bc;border-radius:12px;padding:10px 12px;font-size:12.5px}"
+".float{position:fixed;left:12px;right:12px;bottom:12px;z-index:5;display:flex;justify-content:space-between;align-items:center;gap:10px;background:var(--c);color:#04141b;border-radius:14px;padding:13px 16px;font-weight:800;box-shadow:var(--shadow);cursor:pointer;border:0;font-size:14px}.float b{font:700 17px Oswald,sans-serif;letter-spacing:1px;text-transform:uppercase}"
+".foot{text-align:center;font-size:11px;color:var(--mute);margin-top:30px}"
+"button:focus-visible,input:focus-visible{outline:2px solid var(--c2);outline-offset:2px}";
document.head.appendChild(css);

var D=null,S={pick:{},cart:[],busy:false,err:""},SKEW=0,TICK=null;
function tiers(){return (D&&D.tiers||[]).slice().sort(function(a,b){return a.min-b.min;});}
function unitFor(n){var u=null;tiers().forEach(function(t){if(n>=t.min)u=t.cents;});return u;}
function count(){return S.cart.reduce(function(a,l){return a+l.qty;},0);}
function item(id){return (D.items||[]).filter(function(x){return x.id===id;})[0];}
function closesIn(){if(!D||!D.closes_at)return null;return new Date(D.closes_at).getTime()-(Date.now()+SKEW);}
function cdTxt(ms){if(ms<=0)return "Closed";var s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),sec=s%60;return d>0?d+"d "+h+"h "+m+"m":h>0?h+"h "+String(m).padStart(2,"0")+"m "+String(sec).padStart(2,"0")+"s":m+"m "+String(sec).padStart(2,"0")+"s";}
function closesLabel(){var d=new Date(D.closes_at);return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"short"})+" "+d.toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"}).toLowerCase().replace(" ","");}
function tick(){var el=$("cdN");if(!el)return;var ms=closesIn();if(ms===null)return;if(ms<=0){clearInterval(TICK);TICK=null;load().then(paint);return;}el.textContent=cdTxt(ms);}
function shell(inner){return '<div class="wrap"><div class="bar"><div class="lg">Legacy<small>Gym · Kincumber</small></div><div class="ev">Official gym store<br>Pick up at the gym</div></div>'+inner+'<div class="foot">Questions? Ask at the front desk or message the gym. Legacy Gym Kincumber.</div></div>';}
function tierLbl(t,i){return i===0?(t.min===1?"1 singlet":t.min+" singlets"):(i===tiers().length-1?t.min+"+ singlets":t.min+" singlets");}

function paint(){
 var n=count(),unit=unitFor(Math.max(n,1)),T=tiers(),isClosed=D.closed||(D.closes_at&&closesIn()<=0),onSale=D.active&&T.length&&!isClosed;
 var head='<div class="top"><div class="poster">'+(D.image_url?'<img src="'+esc(D.image_url)+'" alt="'+esc(D.name)+' poster">':'')+'</div><div>'
  +'<div class="k">Legacy Boxing Club · '+(D.preorder?'pre-order · one run only':'singlets')+'</div><div class="ttl">'+esc(D.name)+'</div>'
  +(D.blurb?'<div class="blurb">'+esc(D.blurb)+'</div>':'')
  +'<div class="tiers">'+T.map(function(t,i){var nxt=T[i+1],on=n>=t.min&&(!nxt||n<nxt.min);return '<div class="'+(on?'on':'')+'"><b>'+money(t.cents)+'</b><i>each · '+tierLbl(t,i)+'</i></div>';}).join("")+'</div>';
 if(isClosed){root.innerHTML=shell(head+'<div class="closed"><b>Pre-orders closed</b><p>The one order went in'+(D.sold?' with '+D.sold+' singlet'+(D.sold===1?'':'s')+' on it':'')+'. No extra stock, no second run. Follow the gym for the next drop.</p></div></div></div>');return;}
 if(!onSale){root.innerHTML=shell(head+'<div class="off"><b>Check back soon</b><p>This drop isn\'t open for orders yet. Keep the link, it\'ll work the moment it is.</p></div></div></div>');return;}
 if(D.preorder){var ms=closesIn();head+='<div class="pre">'+(ms!==null?'<div class="cd"><span id="cdN">'+cdTxt(ms)+'</span><small>Until it closes</small></div>':'')+'<p><b>Pre-order only, one run.</b> One order goes in'+(ms!==null?' when this closes ('+closesLabel()+')':'')+', no extra stock. Pay now and it\'s on your back in about '+(D.turnaround_days||10)+' days. Mix any designs and sizes, the price drops for everything in your order.</p></div>';if(ms!==null&&!TICK)TICK=setInterval(tick,1000);}
 head+='</div></div>';
 var des='<div class="sec">Pick your singlets</div><p>Tap a size, add it to your order. Standard unisex fit, between sizes go up.</p><div class="designs">'+(D.items||[]).map(function(it){
   var inCart=S.cart.filter(function(l){return l.id===it.id;}).reduce(function(a,l){return a+l.qty;},0),sel=S.pick[it.id];
   return '<div class="d'+(inCart?' has':'')+'" id="d-'+it.id+'"><img src="'+esc(it.image_url)+'" alt="'+esc(it.name)+' singlet, front and back" loading="lazy"><div class="in"><div class="nm"><b>'+esc(it.name)+'</b>'+(inCart?'<span>'+inCart+' in your order</span>':'')+'</div>'+(it.blurb?'<p>'+esc(it.blurb)+'</p>':'')
    +'<div class="sizes">'+(it.sizes||[]).map(function(s){return '<button class="'+(sel===s?'on':'')+'" data-pick="'+it.id+'|'+esc(s)+'" aria-pressed="'+(sel===s)+'">'+esc(s)+'</button>';}).join("")+'</div>'
    +'<button class="add'+(sel?' go':'')+'" data-add="'+it.id+'" '+(sel?'':'disabled')+'>'+(sel?'Add '+esc(it.name)+' · size '+esc(sel):'Pick a size')+'</button></div></div>';}).join("")+'</div>';
 var cart='<div class="cart" id="cart"><h2>Your order</h2>';
 if(!n)cart+='<p class="mute" style="font-size:12.5px;margin-top:8px">Nothing added yet. Pick a design and size above.</p>';
 else{
  cart+=S.cart.map(function(l,i){var it=item(l.id);return '<div class="ln"><img src="'+esc(it.image_url)+'" alt=""><div class="t"><b>'+esc(it.name)+'</b><span>Size '+esc(l.size)+' · '+money(unit)+' each</span></div><div class="q"><button data-q="'+i+'|-1" aria-label="One less">−</button><b>'+l.qty+'</b><button data-q="'+i+'|1" aria-label="One more">+</button></div><div class="p">'+money(unit*l.qty)+'</div></div>';}).join("");
  var full=T[0]?T[0].cents*n:0,saved=full-unit*n,next=null;T.forEach(function(t){if(!next&&t.min>n)next=t;});
  cart+='<div class="tot"><span>'+n+' singlet'+(n===1?'':'s')+' × '+money(unit)+(saved>0?'<br><span class="save">You save '+money(saved)+'</span>':'')+'</span><b>'+money(unit*n)+'</b></div>';
  if(next)cart+='<div class="nudge">Add <b>'+(next.min-n)+' more</b> and every singlet in your order drops to <b>'+money(next.cents)+'</b>.</div>';
 }
 cart+='<label class="l">Name</label><input id="bN" placeholder="First and last" autocomplete="name" value="'+esc(S.name||"")+'"><label class="l">Email</label><input id="bE" type="email" inputmode="email" autocomplete="email" placeholder="Your receipt goes here" value="'+esc(S.email||"")+'"><label class="l">Mobile</label><input id="bM" inputmode="tel" autocomplete="tel" placeholder="We text you when they\'re ready" value="'+esc(S.mob||"")+'">'
  +(S.err?'<div class="err">'+esc(S.err)+'</div>':'')
  +'<button class="pay" id="bPay" '+(n&&!S.busy?'':'disabled')+'>'+(S.busy?'One sec…':n?'Pre-order · pay '+money(unit*n):'Add a singlet first')+'</button>'
  +'<div class="fine">You\'ll go to the Legacy Gym Shopify checkout (card, Apple Pay, Google Pay). <b>'+esc(D.pickup||"Pick up at the gym.")+'</b> No postage.</div></div>';
 var fl=n?'<button class="float" id="bFloat"><span>'+n+' singlet'+(n===1?'':'s')+' · '+money(unit*n)+'</span><b>Checkout ›</b></button>':'';
 root.innerHTML=shell(head+des+cart+fl);bind();floatVis();
}
function floatVis(){var f=$("bFloat"),c=$("cart");if(!f||!c)return;var r=c.getBoundingClientRect();f.style.display=r.top<window.innerHeight-60?"none":"flex";}
window.addEventListener("scroll",floatVis,{passive:true});
function keep(){var a=$("bN"),b=$("bE"),c=$("bM");if(a)S.name=a.value;if(b)S.email=b.value;if(c)S.mob=c.value;}
function rp(){var y=window.scrollY;paint();window.scrollTo(0,y);}
function bind(){
 root.querySelectorAll("[data-pick]").forEach(function(b){b.onclick=function(){keep();var x=b.getAttribute("data-pick").split("|");S.pick[x[0]]=x[1];S.err="";rp();};});
 root.querySelectorAll("[data-add]").forEach(function(b){b.onclick=function(){keep();var id=b.getAttribute("data-add"),s=S.pick[id];if(!s)return;var ex=S.cart.filter(function(l){return l.id===id&&l.size===s;})[0];if(ex)ex.qty=Math.min(20,ex.qty+1);else S.cart.push({id:id,size:s,qty:1});S.pick[id]=null;S.err="";rp();};});
 root.querySelectorAll("[data-q]").forEach(function(b){b.onclick=function(){keep();var x=b.getAttribute("data-q").split("|"),l=S.cart[+x[0]];if(!l)return;l.qty+=(+x[1]);if(l.qty<=0)S.cart.splice(+x[0],1);else l.qty=Math.min(20,l.qty);rp();};});
 var p=$("bPay");if(p)p.onclick=pay;
 var f=$("bFloat");if(f)f.onclick=function(){var c=$("cart");if(c)c.scrollIntoView({behavior:"smooth",block:"start"});};
}
async function pay(){
 keep();S.err="";var n=count();
 var name=(S.name||"").trim(),email=(S.email||"").trim(),mob=(S.mob||"").trim();
 if(!n){S.err="Add a singlet first.";rp();return;}
 if(name.split(/\s+/).length<2){S.err="First and last name please, so we hand them to the right person.";rp();return;}
 if(!/^\S+@\S+\.\S+$/.test(email)){S.err="That email doesn't look right.";rp();return;}
 S.busy=true;rp();
 try{
  var o=await rpc("shop_drop_order_create",{p_slug:SLUG,p_items:S.cart.map(function(l){return {product_id:l.id,size:l.size,qty:l.qty};}),p_name:name,p_email:email,p_mobile:mob});
  if(!o||!o.ok){S.busy=false;S.err=o&&o.error==="closed"?"Pre-orders just closed, sorry. The order's gone in.":o&&o.error==="not_on_sale"?"This drop isn't on sale right now.":"Couldn't save that ("+((o&&o.error)||"error")+"). Try again.";await load();rp();return;}
  var r=await fetch(APP+"/api/fightnight?a=shop-checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ref:o.ref,email:email})});
  var j=null;try{j=await r.json();}catch(e){}
  if(!r.ok||!j||!j.url){S.busy=false;S.err=j&&j.error==="not_configured"?"Payments aren't switched on yet. Ask at the desk.":"Couldn't open the checkout ("+((j&&j.error)||r.status)+"). Try again or pay at the desk, your order ref is "+o.ref+".";rp();return;}
  try{sessionStorage.setItem("lg_shop_ref",o.ref);}catch(e){}
  location.href=j.url;
 }catch(e){S.busy=false;S.err="Something went wrong: "+(e.message||e);rp();}
}
async function load(){try{var j=await rpc("shop_drop_public",{p_slug:SLUG});if(j&&j.ok){D=j;if(j.now)SKEW=new Date(j.now).getTime()-Date.now();}}catch(e){}}
(async function(){root.innerHTML=shell('<div class="off"><b>Loading…</b></div>');await load();if(!D){root.innerHTML=shell('<div class="off"><b>That link isn\'t live</b><p>Check the link you were sent.</p></div>');return;}document.title=D.name+" · Legacy Gym";paint();})();
})();
