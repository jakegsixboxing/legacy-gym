/* ===== Summer clearance - Legacy Sparring Club hoodie pop-up (15 Nov 2026, Jake) =====
   Home-screen pop-up, once a day per phone, while the hoodie is on sale in Shopify.
   Price, "was" price and % off are read LIVE from legacygym.net, so the pop-up can never show
   a different price to checkout. Stops by itself when: sold out, no longer discounted, or after SALE_UNTIL.
   Preview any time: open the app with ?hoodie=1 */
(function(){
"use strict";
var HANDLE="sparring-club-embroidered-hoodie";
var SALE_UNTIL="2027-01-31";
var MIN_OFF=50;
var STORE="https://www.legacygym.net";
var FORCE=/[?&]hoodie=1/.test(location.search);
var H={shown:false,d:null,at:0,busy:false};
function $id(i){return document.getElementById(i);}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function lsGet(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function money(c){return "$"+(c/100).toFixed(2);}

var css=document.createElement("style");css.textContent=
".hsOv{position:fixed;inset:0;z-index:9700;background:rgba(5,5,7,.88);display:flex;align-items:center;justify-content:center;padding:22px;opacity:0;transition:opacity .25s}"
+".hsOv.on{opacity:1}"
+".hsCard{width:100%;max-width:346px;max-height:calc(100% - 20px);overflow:auto;background:#131110;border:1px solid #5a4a22;border-radius:20px;text-align:center;color:#f5f5f5;font-family:Montserrat,system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.6);transform:translateY(14px) scale(.98);transition:transform .3s cubic-bezier(.2,.9,.25,1)}"
+".hsOv.on .hsCard{transform:none}"
+".hsPh{position:relative;background:#0a0a0a}"
+".hsPh img{width:100%;aspect-ratio:1/0.92;object-fit:cover;object-position:50% 40%;display:block}"
+".hsX{position:absolute;top:10px;left:10px;width:32px;height:32px;border-radius:50%;background:#000a;border:1px solid #333;color:#bbb;font:700 15px/30px Montserrat,sans-serif;cursor:pointer;padding:0}"
+".hsTag{position:absolute;top:10px;right:10px;background:#d4a843;color:#161307;font:800 10px Montserrat,sans-serif;letter-spacing:1.5px;padding:6px 11px;border-radius:20px}"
+".hsStrip{background:linear-gradient(90deg,#d4a843,#f2cf74,#d4a843);color:#161307;font:700 12px Oswald,sans-serif;letter-spacing:1.2px;padding:7px 8px;text-transform:uppercase;line-height:1.35}"
+".hsBody{padding:14px 18px 18px}"
+".hsEy{font:800 10.5px Montserrat,sans-serif;letter-spacing:3px;color:#d4a843}"
+".hsTi{font:600 22px/1.15 Oswald,sans-serif;text-transform:uppercase;margin-top:7px;letter-spacing:.5px}"
+".hsPr{margin-top:8px;display:flex;align-items:baseline;justify-content:center;gap:10px}"
+".hsNow{font:700 34px Oswald,sans-serif;color:#fff}.hsWas{font:700 15px Montserrat,sans-serif;color:#7d7568;text-decoration:line-through}"
+".hsSub{font:500 12px/1.5 Montserrat,sans-serif;color:#b5ad9c;margin-top:6px}"
+".hsBtn{display:block;width:100%;margin-top:14px;background:#d4a843;color:#161307;border:0;font:700 16px Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase;padding:13px 0;border-radius:12px;cursor:pointer}"
+".hsNo{margin-top:11px;font:700 10.5px Montserrat,sans-serif;letter-spacing:1.5px;color:#6d6a63;cursor:pointer;background:none;border:0;width:100%;padding:4px}";
document.head.appendChild(css);

async function load(){
  if(H.d&&Date.now()-H.at<600000)return H.d;
  if(H.busy)return null;H.busy=true;
  try{
    var r=await fetch(STORE+"/products/"+HANDLE+".js",{cache:"no-store"});
    if(!r.ok)return null;
    var p=await r.json();
    var vs=(p.variants||[]).filter(function(v){return v.available;});
    if(!vs.length)return (H.d=null);
    var price=Math.min.apply(null,vs.map(function(v){return v.price;}));
    var cmp=Math.max.apply(null,vs.map(function(v){return v.compare_at_price||0;}));
    if(!(cmp>price))return (H.d=null);
    if(Math.round((1-price/cmp)*100)<MIN_OFF)return (H.d=null); /* only once the clearance price is live in Shopify */
    var img=(p.featured_image||(p.images&&p.images[0])||"");if(img&&img.indexOf("//")===0)img="https:"+img;
    H.d={title:p.title,price:price,cmp:cmp,off:Math.round((1-price/cmp)*100),img:img,
         sizes:vs.map(function(v){return v.title;}),url:STORE+"/products/"+HANDLE};
    H.at=Date.now();return H.d;
  }catch(e){return null;}finally{H.busy=false;}
}

function sizeTxt(s){
  var map={"XSmall":"XS","Small":"S","Medium":"M","Large":"L","XLarge":"XL","2XLarge":"2XL","3XLarge":"3XL"};
  var a=s.map(function(x){return map[x]||x;});
  return a.length>2?a[0]+"\u2013"+a[a.length-1]:a.join(" & ");
}

function close(){var o=$id("hsOv");if(!o)return;o.classList.remove("on");setTimeout(function(){if(o.parentNode)o.remove();},260);}
function open(d){
  if($id("hsOv"))return;
  lsSet("hoodieSaleSeen",today());
  var o=document.createElement("div");o.id="hsOv";o.className="hsOv";
  o.innerHTML='<div class="hsCard" role="dialog" aria-label="Summer clearance">'
   +'<div class="hsPh">'+(d.img?'<img src="'+esc(d.img)+(d.img.indexOf("?")>-1?"&":"?")+'width=700" alt="'+esc(d.title)+'">':'')
   +'<button class="hsX" type="button" aria-label="Close" data-hs="x">\u2715</button><span class="hsTag">'+d.off+'% OFF</span></div>'
   +'<div class="hsStrip">Summer clearance \u00b7 winter stock must go</div>'
   +'<div class="hsBody"><div class="hsEy">LEGACY GYM STORE</div>'
   +'<div class="hsTi">Legacy Sparring Club<br>Embroidered Hoodie</div>'
   +'<div class="hsPr"><span class="hsNow">'+money(d.price)+'</span><span class="hsWas">'+money(d.cmp)+'</span></div>'
   +'<div class="hsSub">Gold &amp; white embroidery \u00b7 340 GSM fleece<br>Sizes '+esc(sizeTxt(d.sizes))+' \u00b7 while stock lasts</div>'
   +'<button class="hsBtn" type="button" data-hs="go">Grab one \u203a</button>'
   +'<button class="hsNo" type="button" data-hs="x">NO THANKS \u2014 BACK TO TRAINING</button></div></div>';
  o.addEventListener("click",function(e){
    var t=e.target.closest?e.target.closest("[data-hs]"):null;
    if(e.target===o||(t&&t.dataset.hs==="x")){close();return;}
    if(t&&t.dataset.hs==="go"){close();window.open(d.url,"_blank");}
  });
  document.body.appendChild(o);
  requestAnimationFrame(function(){o.classList.add("on");});
}

function busyElsewhere(){
  return !!(document.querySelector(".fnnOv")||$id("saleSpotWrap")||$id("fpOv")||$id("hsOv"));
}

async function tick(){
  try{
    if(H.shown)return;
    if(typeof session==="undefined"||!session||!session.user)return;
    if(typeof view==="undefined"||view!=="home")return;
    if(!FORCE){
      if(today()>SALE_UNTIL)return;
      if(lsGet("hoodieSaleSeen")===today())return;
    }
    if(busyElsewhere())return;
    var d=await load();if(!d)return;
    if(H.shown||busyElsewhere()||view!=="home")return;
    H.shown=true;setTimeout(function(){if(!busyElsewhere()&&view==="home")open(d);else H.shown=false;},FORCE?300:2500);
  }catch(e){}
}
setInterval(tick,3000);
window.hoodieSaleOpen=function(){load().then(function(d){if(d)open(d);});};
})();
