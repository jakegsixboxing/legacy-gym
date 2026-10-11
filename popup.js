/* ===== Legacy Gym — login popup (11 Oct 2026) =====
   Shows a promo over Home right after login. Each member sees it at most POP.max times across all their
   devices (counted in public.app_popup_views against their login). Tapping the buy button ends it early.
   To run a new promo: change POP.id, img, url, label. To retire it: set POP.until to a past date. */
(function(){
var POP={id:"singlet-drop-2026-10",img:"/singlet-drop.jpg",url:"https://www.legacygym.net/products/legacy-training-club-singlet",label:"Grab mine — $39.99 ›",tag:"New drop",max:2,until:"2026-11-08",delay:900};
var S={row:null,loaded:false,shownThisLoad:false};
var css='.lgPop{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.82);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:18px;animation:lgPopIn .25s ease-out}'
+'@keyframes lgPopIn{from{opacity:0}to{opacity:1}}'
+'.lgPop .box{width:100%;max-width:400px;max-height:calc(100vh - 36px);max-height:calc(100dvh - 36px);display:flex;flex-direction:column;border-radius:18px;overflow:hidden;border:2px solid #c9a44c;background:#0b0b0c;box-shadow:0 20px 70px rgba(0,0,0,.8),0 0 0 6px rgba(201,164,76,.12);animation:lgPopUp .3s cubic-bezier(.2,.9,.3,1.2)}'
+'@keyframes lgPopUp{from{transform:translateY(24px) scale(.96);opacity:0}to{transform:none;opacity:1}}'
+'.lgPop .img{flex:1;min-height:0;overflow:hidden;position:relative;background:#000}.lgPop .img img{width:100%;height:100%;object-fit:contain;display:block}'
+'.lgPop .x{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.6);color:#fff;font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}'
+'.lgPop .foot{padding:12px 14px 14px;background:#0b0b0c;border-top:1px solid #2a2619}'
+'.lgPop .go{display:block;width:100%;text-align:center;text-decoration:none;background:linear-gradient(180deg,#ffe58a,#f4c95d 45%,#b8860b 55%,#ffd76a);color:#1a1200;font-family:Oswald,sans-serif;font-weight:700;font-size:18px;letter-spacing:2px;text-transform:uppercase;padding:15px;border-radius:12px;border:0;cursor:pointer;margin:0}'
+'.lgPop .no{display:block;width:100%;background:none;border:0;color:#9a968c;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:12px 0 2px;cursor:pointer;font-family:inherit;margin:0}'
+'.lgPop .tag{position:absolute;top:12px;left:12px;background:#c9a44c;color:#0b0b0c;font-size:9px;font-weight:900;letter-spacing:2px;text-transform:uppercase;padding:5px 9px;border-radius:999px}';
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function curView(){try{return view;}catch(e){return null;}}
function active(){return new Date()<new Date(POP.until+"T23:59:59");}
function html(){
  return '<div class="lgPop" id="lgPop" role="dialog" aria-label="Legacy Training Club singlet"><div class="box">'
   +'<div class="img"><span class="tag">'+POP.tag+'</span><img src="'+POP.img+'" alt="Legacy Training Club singlet — arriving next week, only 50 available, $39.99"><button class="x" onclick="lgPopClose()" aria-label="Close">×</button></div>'
   +'<div class="foot"><a class="go" href="'+POP.url+'" target="_blank" rel="noopener" onclick="lgPopBuy()">'+POP.label+'</a><button class="no" onclick="lgPopClose()">Not now</button></div>'
   +'</div></div>';
}
async function load(){
  var u=uid();if(!u||S.loaded)return;
  try{var r=await sb.from("app_popup_views").select("*").eq("user_id",u).eq("popup_id",POP.id).maybeSingle();S.row=(r&&r.data)||null;}catch(e){S.row=null;}
  S.loaded=true;
}
async function bump(clicked){
  var u=uid();if(!u)return;
  var views=((S.row&&S.row.views)||0)+(clicked?0:1);
  var row={user_id:u,popup_id:POP.id,views:views,clicked:!!(clicked||(S.row&&S.row.clicked)),updated_at:new Date().toISOString()};
  S.row=row;
  try{await sb.from("app_popup_views").upsert(row,{onConflict:"user_id,popup_id"});}catch(e){}
  try{localStorage.setItem("lg_pop_"+POP.id,String(views)+(row.clicked?"c":""));}catch(e){}
}
function seenEnough(){
  if(S.row)return S.row.clicked||S.row.views>=POP.max;
  try{var l=localStorage.getItem("lg_pop_"+POP.id)||"";if(/c$/.test(l))return true;return parseInt(l,10)>=POP.max;}catch(e){return false;}
}
async function maybeShow(){
  if(!active()||S.shownThisLoad||!uid()||document.getElementById("lgPop"))return;
  if(curView()!=="home")return;
  if(typeof needsSetup!=="undefined"&&needsSetup)return;
  await load();
  if(seenEnough()||curView()!=="home"||document.getElementById("lgPop"))return;
  S.shownThisLoad=true;
  var w=document.createElement("div");w.innerHTML=html();document.body.appendChild(w.firstChild);
  bump(false);
}
window.lgPopClose=function(){var p=document.getElementById("lgPop");if(p)p.parentNode.removeChild(p);};
window.lgPopBuy=function(){bump(true);setTimeout(window.lgPopClose,150);};

/* fire after login lands on Home (first paint), and once more per app open */
["renderHome"].forEach(function(fn){if(typeof window[fn]!=="function")return;var o=window[fn];window[fn]=function(){var r=o.apply(this,arguments);setTimeout(maybeShow,POP.delay);return r;};});
setTimeout(maybeShow,POP.delay+1200);
})();
