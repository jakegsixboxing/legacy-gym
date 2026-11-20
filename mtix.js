/* ===== FIGHT NIGHT MEMBERS TICKETS (20 Nov 2026, Jake) =====
   Pop-up on every app open for members who don't have a Fight Night ticket yet, a members ticket sheet
   (1 members area ticket at the GA price, optional +1), and a Staff Room tab for Jake, Alison and Kelly.
   Payment is the normal ticket pipeline: rpc fn_member_prepare (wraps fn_pub_prepare) -> POST /api/fightnight?a=buy-checkout
   -> Shopify checkout -> ORDERS_PAID webhook marks the order paid. Nothing here takes or stores card details.
   Data: fn_member_tix_mine (pop-up + prefill), fn_member_prepare, fn_member_tix_staff (staff only), fn_pub_info (fighters, agreement).
   Other Home pop-ups are off while this runs (hoodie.js SALE_UNTIL in the past; popup.js and the recovery offer were already off). */
(function(){
"use strict";
var STAFF=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce","09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb"]; /* Jake, Alison, Kelly */
var IMG_FIGHT="/img/fc/mtix-fight.jpg",IMG_AREA="/img/fc/mtix-members.jpg",LOGO="/img/fc/fc-logo.png";
var FORCE=/[?&]mtix=1/.test(location.search);
var M={me:null,at:0,loading:false,counted:false,shown:false,info:null,busy:false,err:"",F:null};
function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function curView(){try{return view;}catch(e){return null;}}
function $id(i){return document.getElementById(i);}
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function money(c){return "$"+(c/100).toFixed(2).replace(/\.00$/,"");}
function price(){return (M.me&&M.me.price_cents)||8500;}

var css=document.createElement("style");css.textContent=
".mtxOv{position:fixed;inset:0;z-index:9800;background:rgba(2,6,9,.82);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s}.mtxOv.on{opacity:1}"
+".mtxPop{width:100%;max-width:480px;max-height:96vh;max-height:96dvh;overflow-y:auto;background:#0b1319;border-top:2px solid #1fb6e6;border-radius:26px 26px 0 0;transform:translateY(30%);transition:transform .38s cubic-bezier(.2,.9,.25,1);color:#c6d3da;font-size:14.5px;line-height:1.5}.mtxOv.on .mtxPop{transform:none}"
+".mtxHero{position:relative;aspect-ratio:820/347;background:#07141b center/cover no-repeat}.mtxHero::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,19,25,0) 40%,#0b1319 100%)}"
+".mtxIn{padding:2px 18px calc(18px + env(safe-area-inset-bottom,0px))}.mtxLogo{display:block;height:38px;width:auto;margin:-24px 0 10px;position:relative}"
+".mtxEye{font-size:10.5px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#1fb6e6}"
+".mtxPop h2,.mtxSheet h2{font-family:Oswald,sans-serif;font-weight:700;font-size:34px;line-height:1.02;text-transform:uppercase;color:#f2f6f8;margin:8px 0 0;letter-spacing:.02em}.mtxPop h2 em{font-style:normal;color:#7fe0ff}"
+".mtxWhen{font-size:13px;font-weight:700;color:#f2f6f8;margin-top:8px}"
+".mtxPts{list-style:none;margin:14px 0 16px;padding:0;display:grid;gap:9px}.mtxPts li{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:baseline;font-size:14px}.mtxPts li::before{content:'';width:7px;height:7px;border-radius:2px;background:#1fb6e6}.mtxPts b{color:#f2f6f8}"
+".mtxCta{display:block;width:100%;border:0;border-radius:13px;background:linear-gradient(180deg,#7fe0ff,#1fb6e6);color:#031018;font-family:Oswald,sans-serif;font-weight:700;font-size:18px;letter-spacing:.06em;text-transform:uppercase;padding:14px 12px;min-height:54px;cursor:pointer;margin:0}.mtxCta[disabled]{opacity:.5}"
+".mtxFine{margin:10px 2px 0;font-size:11.5px;line-height:1.45;color:#8fa4ae;text-align:center}"
+".mtxNo{display:block;width:100%;border:0;background:none;color:#8fa4ae;font-size:12.5px;text-decoration:underline;text-underline-offset:3px;padding:12px 0 2px;cursor:pointer;font-family:inherit;margin:0}"
+".mtxSheet{position:fixed;inset:0;z-index:9810;background:#060b0f;overflow-y:auto;color:#c6d3da;font-size:14.5px;line-height:1.5;-webkit-overflow-scrolling:touch}"
+".mtxWrap{max-width:480px;margin:0 auto;padding:calc(14px + env(safe-area-inset-top,0px)) 16px calc(30px + env(safe-area-inset-bottom,0px))}"
+".mtxBack{border:0;background:none;color:#8fa4ae;font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;padding:6px 0 12px;cursor:pointer;font-family:inherit}"
+".mtxArea{border:1px solid #2a3f4d;border-radius:16px;overflow:hidden;background:#0b1319;margin-top:12px}.mtxArea .im{aspect-ratio:1000/493;background:#07141b center top/cover no-repeat}"
+".mtxArea .b{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:13px 14px}.mtxArea .n{font-family:Oswald,sans-serif;font-weight:700;font-size:22px;text-transform:uppercase;color:#f2f6f8;line-height:1}.mtxArea p{margin:6px 0 0;font-size:13px}"
+".mtxArea .pr{font-family:Oswald,sans-serif;font-weight:700;font-size:30px;color:#7fe0ff;line-height:1;text-align:right}.mtxArea .pr small{display:block;font:700 10.5px Inter,sans-serif;color:#8fa4ae;margin-top:4px}"
+".mtxBox{background:#0b1319;border:1px solid #1b2a35;border-radius:14px;padding:13px 14px;margin-top:10px}.mtxK{font-size:10.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#8fa4ae}"
+".mtxRow{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center}.mtxRow .v{font-weight:700;color:#f2f6f8;font-size:15px;margin-top:2px}.mtxRow .s{font-size:12.5px;color:#8fa4ae;margin-top:2px}"
+".mtxG2{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}.mtxSheet label.f{display:block;font-size:10.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#8fa4ae;margin:10px 0 5px}"
+".mtxSheet input.t,.mtxSheet select.t{width:100%;box-sizing:border-box;background:#060b0f;border:1px solid #2a3f4d;border-radius:12px;padding:12px 13px;font-size:16px;color:#f2f6f8;min-height:48px;font-family:inherit;margin:0}"
+".mtxSw{position:relative;width:52px;height:30px;border-radius:99px;border:1px solid #2a3f4d;background:#101b23;padding:0;cursor:pointer;flex:none}.mtxSw i{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#8fa4ae;transition:.2s}.mtxSw[aria-checked=true]{background:#1fb6e6;border-color:#1fb6e6}.mtxSw[aria-checked=true] i{left:25px;background:#031018}"
+".mtxAg{font-size:12px;color:#8fa4ae;margin-top:8px;max-height:96px;overflow-y:auto;border:1px solid #1b2a35;border-radius:10px;padding:9px 10px;background:#060b0f}"
+".mtxTick{display:grid;grid-template-columns:auto 1fr;gap:11px;align-items:start;margin-top:12px;font-size:13px;cursor:pointer;color:#c6d3da}.mtxTick input{width:22px;height:22px;accent-color:#1fb6e6;margin:1px 0 0}"
+".mtxTot{display:flex;justify-content:space-between;align-items:baseline;margin:16px 2px 10px;font-size:13px;color:#f2f6f8;font-weight:700}.mtxTot b{font-family:Oswald,sans-serif;font-weight:700;font-size:30px}"
+".mtxErr{color:#ff9aa5;font-size:13px;font-weight:700;margin-top:10px}.mtxErr:empty{display:none}"
+".mtxStrip{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;width:100%;box-sizing:border-box;text-align:left;border:1px solid #1fb6e6;background:linear-gradient(100deg,#0b2a38,#07141b);border-radius:14px;padding:12px 14px;margin:0 0 12px;color:#f2f6f8;cursor:pointer;font-family:inherit}"
+".mtxStrip .t{font-family:Oswald,sans-serif;font-weight:700;font-size:17px;text-transform:uppercase;letter-spacing:.5px;line-height:1.1}.mtxStrip small{display:block;font-size:11.5px;color:#8fa4ae;margin-top:3px;font-weight:600}"
+".mtxStrip .p{font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#031018;background:#1fb6e6;border-radius:999px;padding:8px 12px;white-space:nowrap}.mtxStrip.got{border-color:#4bc97a;cursor:default}.mtxStrip.got .p{background:#4bc97a}"
+".mtxTiles{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.mtxTile{background:#141416;border:1px solid #26262b;border-radius:14px;padding:12px 14px}.mtxTile b{display:block;font-family:Oswald,sans-serif;font-weight:700;font-size:28px;line-height:1;color:#f2f0eb}.mtxTile span{display:block;font-size:11.5px;color:#9a9891;margin-top:5px}"
+".mtxL{background:#141416;border:1px solid #26262b;border-radius:14px;padding:11px 13px;margin-bottom:8px}.mtxL .nm{font-weight:800;font-size:14.5px;color:#f2f0eb}.mtxL .meta{font-size:12px;color:#9a9891;margin-top:2px}.mtxL .plus{font-size:13px;color:#7fe0ff;font-weight:700;margin-top:3px}"
+".mtxL .tg{float:right;font-size:10px;font-weight:900;letter-spacing:1px;text-transform:uppercase;border-radius:999px;padding:4px 9px;background:#4bc97a;color:#06110a}.mtxL .tg.w{background:#3a321c;color:#f1d27a}";
document.head.appendChild(css);

async function loadMine(force){
  if(!uid())return null;
  if(M.loading)return M.me;
  if(!force&&M.at&&Date.now()-M.at<60000)return M.me;
  M.loading=true;
  try{var r=await sb.rpc("fn_member_tix_mine");M.me=(r&&r.data&&r.data.ok)?r.data:null;M.at=Date.now();}catch(e){}
  M.loading=false;return M.me;
}
function hasTicket(){return !!(M.me&&(M.me.status==="paid"||M.me.other_tickets>0));}
/* just came back from the Shopify checkout: the paid webhook can take a minute, so don't show the pop-up again while we wait */
function lsG(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsS(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function paying(){var t=parseInt(lsG("mtixPayAt")||"0",10)||0;return !!(M.me&&M.me.status==="pending"&&t&&Date.now()-t<20*60000);}

/* ---------- Home strip ---------- */
function strip(){
  if(!uid())return "";
  if(!M.me){loadMine().then(function(d){try{if(d&&curView()==="home"&&typeof renderHome==="function")renderHome();}catch(e){}});return "";}
  var d=M.me;
  if(d.status==="paid")return '<div class="mtxStrip got"><span><span class="t">You\'re going to Fight Night</span><small>'+d.tickets+' members area ticket'+(d.tickets>1?'s':'')+(d.plus_name?' · you + '+E(d.plus_name):'')+' · Sat 19 Dec</small></span><span class="p">Paid ✓</span></div>';
  if(d.other_tickets>0)return '<div class="mtxStrip got"><span><span class="t">You\'ve got your Fight Night ticket</span><small>Members who already bought are being moved into the members area.</small></span><span class="p">Sorted ✓</span></div>';
  if(!d.open)return "";
  if(paying())return '<button class="mtxStrip" onclick="mtixOpen()"><span><span class="t">Checking your payment</span><small>If you paid, this updates in a minute. Didn\'t finish? Tap to try again.</small></span><span class="p">Checking…</span></button>';
  return '<button class="mtxStrip" onclick="mtixOpen()"><span><span class="t">Fight Night members tickets</span><small>Members area · '+money(price())+', same as GA · bring a +1</small></span><span class="p">Get tickets</span></button>';
}
try{var _fch=window.fightClubHtml;window.fightClubHtml=function(){var h="";try{h=_fch?_fch.apply(this,arguments):"";}catch(e){}return strip()+(h||"");};}catch(e){}

/* ---------- the pop-up ---------- */
function closePop(){var o=$id("mtxOv");if(o)o.parentNode.removeChild(o);}
function openPop(){
  if($id("mtxOv")||$id("mtxSheet"))return;
  var o=document.createElement("div");o.className="mtxOv";o.id="mtxOv";o.setAttribute("role","dialog");o.setAttribute("aria-label","Fight Night members tickets");
  o.innerHTML='<div class="mtxPop"><div class="mtxHero" style="background-image:url('+IMG_FIGHT+')"></div><div class="mtxIn"><img class="mtxLogo" src="'+LOGO+'" alt="Fight Club">'
   +'<div class="mtxEye">Members only · on sale now</div><h2>Fight Night <em>&amp; Christmas party</em></h2><div class="mtxWhen">Saturday 19 December · Legacy Gym Kincumber</div>'
   +'<ul class="mtxPts"><li><span><b>Your own members area</b> on the night, like last fight night.</span></li><li><span><b>Same price as GA:</b> '+money(price())+'.</span></li><li><span><b>Bring a +1.</b> Your partner or a mate can come in with you.</span></li></ul>'
   +'<button class="mtxCta" type="button" data-m="go">Get my members ticket</button>'
   +'<p class="mtxFine">Already bought a ticket? Any member who has already purchased will be moved into this area.</p>'
   +'<button class="mtxNo" type="button" data-m="x">Not now</button></div></div>';
  o.addEventListener("click",function(e){var t=e.target.closest?e.target.closest("[data-m]"):null;if(e.target===o||(t&&t.dataset.m==="x")){closePop();return;}if(t&&t.dataset.m==="go"){closePop();openSheet();}});
  document.body.appendChild(o);requestAnimationFrame(function(){o.classList.add("on");});
}
function busyElsewhere(){return !!(document.querySelector(".fnnOv")||$id("saleSpotWrap")||$id("fpOv")||$id("hsOv")||$id("lgPop")||$id("mtxOv")||$id("mtxSheet"));}
async function tick(){
  try{
    if(!uid())return;
    if(!M.counted){M.counted=true;M.shown=false;}
    if(M.shown)return;
    if(curView()!=="home"||busyElsewhere())return;
    if(typeof needsSetup!=="undefined"&&needsSetup)return;
    var d=await loadMine();if(!d)return;
    if(paying()){if(Date.now()-M.at>10000){var was=d.status;d=await loadMine(true);if(d&&d.status!==was&&typeof renderHome==="function"&&curView()==="home")renderHome();}return;}
    if(!FORCE&&(!d.open||hasTicket()))return;
    if(M.shown||busyElsewhere()||curView()!=="home")return;
    M.shown=true;setTimeout(function(){if(!busyElsewhere()&&curView()==="home")openPop();else M.shown=false;},FORCE?300:1500);
  }catch(e){}
}
/* an "open" is a fresh load, or coming back to the app after 30+ minutes away */
var hiddenAt=0;document.addEventListener("visibilitychange",function(){
  if(document.hidden){hiddenAt=Date.now();return;}
  if(hiddenAt&&Date.now()-hiddenAt>60000){M.at=0;loadMine(true).then(function(){try{if(curView()==="home"&&typeof renderHome==="function"&&!busyElsewhere())renderHome();}catch(e){}});}
  if(hiddenAt&&Date.now()-hiddenAt>30*60000){M.counted=false;}
});
setInterval(tick,3000);

/* ---------- the members ticket sheet ---------- */
function closeSheet(){var s=$id("mtxSheet");if(s)s.parentNode.removeChild(s);document.documentElement.style.overflow="";}
function keep(){if(!M.F)return;["first","last","mobile","plusName","agreeName"].forEach(function(k){var el=$id("mtx_"+k);if(el)M.F[k]=el.value;});var f=$id("mtx_fighter");if(f)M.F.fighter=f.value;var a=$id("mtx_agree");if(a)M.F.agree=a.checked;}
function count(){return 1+(M.F.plus?1:0);}
function sheetHtml(){
  var F=M.F,I=M.info,tot=count()*price();
  if(!I)return '<div class="mtxWrap"><button class="mtxBack" data-m="close">‹ Back</button><p>Loading…</p></div>';
  return '<div class="mtxWrap"><button class="mtxBack" data-m="close">‹ Back to the app</button>'
   +'<div class="mtxEye">Fight Night &amp; Christmas party · Sat 19 Dec</div><h2>Members tickets</h2>'
   +'<div class="mtxArea"><div class="im" style="background-image:url('+IMG_AREA+')"></div><div class="b"><div><div class="n">Members area</div><p>A reserved area for Legacy members to hang out and get around the fighters.</p></div><div class="pr">'+money(price())+'<small>same as GA</small></div></div></div>'
   +'<div class="mtxBox"><div class="mtxK">Your ticket · '+money(price())+'</div><div class="mtxG2"><div><label class="f" for="mtx_first">First name</label><input class="t" id="mtx_first" type="text" autocomplete="given-name" maxlength="40" value="'+E(F.first)+'"></div>'
   +'<div><label class="f" for="mtx_last">Last name</label><input class="t" id="mtx_last" type="text" autocomplete="family-name" maxlength="40" value="'+E(F.last)+'"></div></div>'
   +'<label class="f" for="mtx_mobile">Mobile</label><input class="t" id="mtx_mobile" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" value="'+E(F.mobile)+'"></div>'
   +'<div class="mtxBox"><div class="mtxRow"><div><div class="mtxK">Bring a +1 · '+money(price())+'</div><div class="v">Partner or a friend</div><div class="s">Members area only · one per member</div></div>'
   +'<button class="mtxSw" type="button" role="switch" aria-checked="'+(F.plus?"true":"false")+'" aria-label="Bring a plus one" data-m="plus"><i></i></button></div>'
   +(F.plus?'<label class="f" for="mtx_plusName">Their full name</label><input class="t" id="mtx_plusName" type="text" maxlength="80" autocomplete="off" value="'+E(F.plusName)+'">':'')+'</div>'
   +'<div class="mtxBox"><label class="f" for="mtx_fighter" style="margin-top:0">Who are you cheering for?</label><select class="t" id="mtx_fighter"><option value="">Pick a fighter</option>'
   +(I.fighters||[]).map(function(f){return '<option value="'+E(f.id)+'"'+(F.fighter===f.id?" selected":"")+'>'+E(f.name)+'</option>';}).join("")+'</select><div class="s" style="font-size:12px;color:#8fa4ae;margin-top:6px">Your ticket counts towards that fighter\'s crew.</div></div>'
   +'<div class="mtxBox"><div class="mtxK">Ticket agreement</div><div class="mtxAg">'+E((I.agreement&&I.agreement.text)||"All ticket sales are final. No refunds for any reason, and tickets can't be downgraded.")+'</div>'
   +'<label class="mtxTick"><input type="checkbox" id="mtx_agree"'+(F.agree?" checked":"")+'><span>I accept the agreement. All ticket sales are final, with no refunds.</span></label>'
   +'<label class="f" for="mtx_agreeName">Type your full name to agree</label><input class="t" id="mtx_agreeName" type="text" maxlength="80" autocomplete="off" value="'+E(F.agreeName)+'"></div>'
   +'<div class="mtxTot"><span>'+count()+' ticket'+(count()>1?'s':'')+' · Members area</span><b>'+money(tot)+'</b></div>'
   +'<button class="mtxCta" type="button" data-m="pay"'+(M.busy?" disabled":"")+'>'+(M.busy?"Opening checkout…":"Pay "+money(tot))+'</button>'
   +'<div class="mtxErr" id="mtxErr" role="alert">'+E(M.err)+'</div>'
   +'<p class="mtxFine">Secure Shopify checkout. Apple Pay and cards accepted.</p>'
   +'<button class="mtxNo" type="button" data-m="all">Want a table seat instead? See all tickets</button></div>';
}
function paintSheet(){var s=$id("mtxSheet");if(s)s.innerHTML=sheetHtml();}
function fail(msg,id){M.err=msg;M.busy=false;paintSheet();var e=$id(id||"mtxErr");if(e){try{e.scrollIntoView({behavior:"smooth",block:"center"});if(e.focus&&id)e.focus();}catch(x){}}}
async function pay(){
  if(M.busy)return;keep();var F=M.F;
  if(!F.first.trim()||!F.last.trim())return fail("Add your first and last name.",!F.first.trim()?"mtx_first":"mtx_last");
  if(F.mobile.replace(/\D/g,"").length<8)return fail("Add your mobile number.","mtx_mobile");
  if(F.plus){var pn=F.plusName.trim().replace(/\s+/g," ");if(pn.length<3||pn.indexOf(" ")<0)return fail("Add your +1's first and last name.","mtx_plusName");}
  if(!F.fighter)return fail("Pick the fighter you're cheering for.","mtx_fighter");
  if(!F.agree)return fail("Tick the box to accept the agreement.","mtx_agree");
  var an=F.agreeName.trim().replace(/\s+/g," ");if(an.length<3||an.indexOf(" ")<0)return fail("Type your full name (first and last) under the agreement.","mtx_agreeName");
  M.err="";M.busy=true;paintSheet();
  try{
    var r=await sb.rpc("fn_member_prepare",{p_fighter:F.fighter,p_first:F.first.trim(),p_last:F.last.trim(),p_mobile:F.mobile.trim(),p_plus_name:F.plus?F.plusName.trim():"",p_agree_name:an,p_agree_tick:true});
    if(r.error)throw new Error(r.error.message||"Couldn't save your order. Try again.");
    var p=r.data;if(!p||!p.ok){if(p&&p.error==="already"){M.at=0;await loadMine(true);closeSheet();try{if(typeof renderHome==="function"&&curView()==="home")renderHome();}catch(e){}T("You already have your members tickets.");M.busy=false;return;}throw new Error((p&&p.message)||"Couldn't save your order. Try again.");}
    var c=await fetch("/api/fightnight?a=buy-checkout",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:p.token,ref:p.ref})});
    var j=await c.json().catch(function(){return null;});
    if(!c.ok||!j||!j.url)throw new Error("Couldn't open the checkout. Try again in a moment.");
    M.at=0;lsS("mtixPayAt",String(Date.now()));location.href=j.url;
  }catch(x){fail((x&&x.message)||"Something went wrong. Try again.");}
}
async function openSheet(){
  closePop();if($id("mtxSheet"))return;
  var d=await loadMine();if(!d){T("Log in to get your members ticket.");return;}
  if(d.status==="paid"){T("You already have your members tickets.");return;}
  if(!d.open){T("Ticket sales have closed.");return;}
  if(!M.F)M.F={first:d.first||"",last:d.last||"",mobile:d.mobile||"",plus:false,plusName:"",fighter:"",agree:false,agreeName:""};
  M.err="";M.busy=false;
  var s=document.createElement("div");s.className="mtxSheet";s.id="mtxSheet";s.innerHTML=sheetHtml();
  s.addEventListener("click",function(e){var t=e.target.closest?e.target.closest("[data-m]"):null;if(!t)return;var a=t.dataset.m;
    if(a==="close"){keep();closeSheet();}
    else if(a==="plus"){keep();M.F.plus=!M.F.plus;M.err="";paintSheet();if(M.F.plus){var p=$id("mtx_plusName");if(p)p.focus();}}
    else if(a==="pay"){pay();}
    else if(a==="all"){window.open("/tickets","_blank");}});
  document.body.appendChild(s);document.documentElement.style.overflow="hidden";
  if(!M.info){try{var r=await sb.rpc("fn_pub_info");M.info=(r&&r.data&&r.data.ok)?r.data:{fighters:[]};}catch(e){M.info={fighters:[]};}keep();paintSheet();}
}
window.mtixOpen=openSheet;
window.mtixPreview=openPop;

/* ---------- Staff Room tab: Jake, Alison and Kelly ---------- */
window.mtixIsStaff=function(){var u=uid();return !!u&&STAFF.indexOf(u)>=0;};
function when(iso){try{return new Date(iso).toLocaleString("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});}catch(e){return "";}}
window.mtixStaff=async function(){
  var box=$id("staffContent");if(!box)return;
  if(!window.mtixIsStaff()){box.innerHTML='<div class="card"><p>This list is for Jake, Alison and Kelly.</p></div>';return;}
  box.innerHTML='<div class="card"><p>Loading…</p></div>';
  var r;try{r=await sb.rpc("fn_member_tix_staff");}catch(e){r={error:e};}
  box=$id("staffContent");if(!box)return;
  if(r.error||!r.data){box.innerHTML='<div class="card"><p>Couldn\'t load the list. <a href="#" onclick="mtixStaff();return false" style="color:#F1D27A">Try again</a></p></div>';return;}
  var d=r.data,A=d.members_area||[],X=d.elsewhere||[];
  box.innerHTML='<div class="secTitle">Member Fight Night tickets</div>'
   +'<div class="mtxTiles"><div class="mtxTile"><b>'+d.paid_members+'</b><span>members paid · members area</span></div><div class="mtxTile"><b>'+d.plus_ones+'</b><span>bringing a +1</span></div>'
   +'<div class="mtxTile"><b>'+d.paid_tickets+'</b><span>members area tickets · $'+Number(d.paid_dollars).toLocaleString("en-AU")+'</span></div><div class="mtxTile"><b>'+d.elsewhere_members+'</b><span>members who bought another way</span></div></div>'
   +'<div class="secTitle">Members area</div>'
   +(A.length?A.map(function(x){return '<div class="mtxL"><span class="tg'+(x.status==="paid"?"":" w")+'">'+(x.status==="paid"?"Paid":"Started, not paid")+'</span><div class="nm">'+E(x.name)+'</div>'
      +(x.plus?'<div class="plus">+1 · '+E(x.plus)+'</div>':'')+'<div class="meta">'+x.tickets+' ticket'+(x.tickets>1?'s':'')+' · $'+Number(x.dollars).toLocaleString("en-AU")+(x.fighter?' · cheering for '+E(x.fighter):'')+' · '+E(when(x.at))+(x.ref?' · '+E(x.ref):'')+'</div></div>';}).join(""):'<div class="card"><p>No members area tickets yet. They show here as soon as a member pays.</p></div>')
   +'<div class="secTitle">Members who already bought another way</div>'
   +(X.length?'<p style="font-size:12px;color:#9a9891;margin:0 0 8px">Matched by the email on their app login. These are the people to move into the members area.</p>'+X.map(function(x){var bits=[];if(x.ga)bits.push(x.ga+" GA");if(x.front)bits.push(x.front+" front row");if(x.rows)bits.push(x.rows+" table");
      return '<div class="mtxL"><div class="nm">'+E(x.name||"Unnamed member")+'</div><div class="meta">'+bits.join(" · ")+(x.fighters?' · for '+E(x.fighters):'')+'</div></div>';}).join(""):'<div class="card"><p>Nobody yet.</p></div>')
   +'<p style="text-align:center;font-size:11px;color:#9a9891;margin:10px 0 0">Jake, Alison and Kelly can see this list. <a href="#" onclick="mtixStaff();return false" style="color:#F1D27A">Refresh</a></p>';
};
})();
