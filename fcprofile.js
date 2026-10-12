/* ===== Fight Club — "Your Fight Club profile" (12 Oct 2026) =====
   A fighter sets up (and can edit) their own profile: photo, stance, weight, fight weight, suburb, Instagram.
   Opens once, automatically, the first time an incomplete fighter lands in the Fight Club tab; a card stays on Today
   until stance + weight are in. Saves through the fc_update_me() RPC (fighters can't write fc_fighters directly). */
(function(){
var S={sig:"",open:false,photo:null,photoFile:null,stance:"",busy:false};
var css=document.createElement("style");css.textContent=
".fcpCard{display:flex;align-items:center;gap:12px;border:1px solid rgba(201,164,76,.55);border-radius:12px;background:#0b0905;padding:11px 12px;margin:10px 0}"
+".fcpCard.todo{border-color:#f4c95d;background:linear-gradient(135deg,#1a1405,#0b0905);box-shadow:0 0 0 1px rgba(244,201,93,.25)}"
+".fcpAv{width:46px;height:46px;border-radius:50%;flex:none;background:#1d1a12 center/cover no-repeat;border:2px solid #c9a44c;display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-size:17px;color:#f4c95d}"
+".fcpCard b{display:block;font-size:13px;color:#fff;font-weight:800}.fcpCard small{display:block;font-size:11px;color:#a89f88;margin-top:2px;line-height:1.35}"
+".fcpCard button{margin-left:auto;flex:none;background:#f4c95d;color:#161307;border:0;border-radius:9px;padding:9px 13px;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit}"
+".fcpCard:not(.todo) button{background:none;color:#f4c95d;border:1px solid rgba(201,164,76,.55)}"
+"#fcpSheet{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.86);display:flex;align-items:flex-end;justify-content:center;font-family:Montserrat,sans-serif;animation:fcpIn .2s ease-out}"
+"@keyframes fcpIn{from{opacity:0}to{opacity:1}}"
+"#fcpSheet .box{width:100%;max-width:460px;max-height:94vh;max-height:94dvh;overflow:auto;background:#0b0b0c;border:1px solid #8a7136;border-bottom:0;border-radius:20px 20px 0 0;padding:20px 18px 26px;color:#fff;box-sizing:border-box}"
+"#fcpSheet h2{margin:0;font-family:Oswald,sans-serif;font-size:26px;letter-spacing:1.5px;text-transform:uppercase;line-height:1.05}#fcpSheet h2 span{color:#f4c95d}"
+"#fcpSheet .sub{font-size:12px;color:#a89f88;margin:6px 0 16px;line-height:1.5}"
+"#fcpSheet .ph{display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:16px}"
+"#fcpSheet .ph label{cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px}"
+"#fcpSheet .ph .av{width:104px;height:104px;border-radius:50%;background:#1d1a12 center/cover no-repeat;border:3px solid #c9a44c;display:flex;align-items:center;justify-content:center;font-size:34px;color:#f4c95d;font-family:Oswald,sans-serif}"
+"#fcpSheet .ph .t{font-size:11px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#f4c95d}"
+"#fcpSheet .lab{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#c9a44c;margin:12px 0 6px}"
+"#fcpSheet .seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}#fcpSheet .seg button{background:#141210;border:1px solid #3a3320;color:#cfc6b0;border-radius:10px;padding:12px;font-size:13px;font-weight:800;cursor:pointer;font-family:inherit}#fcpSheet .seg button.on{background:#f4c95d;border-color:#f4c95d;color:#161307}"
+"#fcpSheet .two{display:grid;grid-template-columns:1fr 1fr;gap:8px}"
+"#fcpSheet input[type=text],#fcpSheet input[type=number]{width:100%;box-sizing:border-box;background:#141210;border:1px solid #3a3320;border-radius:10px;padding:12px;color:#fff;font-size:15px;font-family:inherit}"
+"#fcpSheet .hint{font-size:10.5px;color:#7d7766;margin-top:5px}"
+"#fcpSheet .go{display:block;width:100%;margin-top:18px;background:linear-gradient(180deg,#ffe58a,#f4c95d 45%,#b8860b 55%,#ffd76a);color:#1a1200;border:0;border-radius:12px;padding:15px;font-family:Oswald,sans-serif;font-weight:700;font-size:17px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}"
+"#fcpSheet .go[disabled]{opacity:.55}#fcpSheet .later{display:block;width:100%;background:none;border:0;color:#8e8873;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:14px 0 0;cursor:pointer;font-family:inherit}";
document.head.appendChild(css);

function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function curView(){try{return view;}catch(e){return null;}}
function T(m){try{toast(m);}catch(e){}}
function me(){try{if(!window.fccFighter)return null;if(window.fccPv&&window.fccPv())return null;var f=window.fccFighter();return (f&&f.user_id&&f.user_id===uid())?f:null;}catch(e){return null;}}
function done(f){return !!(f&&f.stance&&f.weight_kg);}
function askedKey(){return "fcp_asked_"+uid();}
function asked(){try{return !!localStorage.getItem(askedKey());}catch(e){return false;}}
function markAsked(){try{localStorage.setItem(askedKey(),"1");}catch(e){}}

function cardHtml(f){
  var ok=done(f),st=f.photo_url?'style="background-image:url(\''+E(f.photo_url)+'\')"':'';
  var ini=((f.first_name||"?")[0]||"?").toUpperCase();
  return '<div id="fcpCard" class="fcpCard'+(ok?'':' todo')+'"><div class="fcpAv" '+st+'>'+(f.photo_url?'':E(ini))+'</div>'
   +'<div><b>'+(ok?E((f.first_name||"")+" "+(f.last_name||"")):'Set up your Fight Club profile')+'</b><small>'+(ok?'Your photo, stance and weight':'Photo, stance and weight — 30 seconds')+'</small></div>'
   +'<button onclick="fcpOpen()">'+(ok?'Edit':'Set up')+'</button></div>';
}
function inject(){
  try{
    if(curView()!=="fc")return;
    var f=me();var old=document.getElementById("fcpCard");
    if(!f){if(old)old.parentNode.removeChild(old);return;}
    var wrap=document.getElementById("fcc");if(!wrap)return;
    var vw=wrap.querySelector(".fccVw");if(!vw)return;
    var want=cardHtml(f);
    if(old&&S.sig===want)return;S.sig=want;
    var d=document.createElement("div");d.innerHTML=want;var n=d.firstChild;
    if(old&&old.parentNode)old.parentNode.replaceChild(n,old);else vw.insertAdjacentElement("afterend",n);
    if(!done(f)&&!asked()&&!S.open){markAsked();setTimeout(function(){if(curView()==="fc"&&!document.getElementById("fcpSheet"))window.fcpOpen();},900);}
  }catch(e){}
}

function sheetHtml(f){
  var ph=S.photo||f.photo_url||"";
  return '<div id="fcpSheet" role="dialog" aria-label="Fight Club profile"><div class="box">'
   +'<h2>Your <span>Fight Club</span> profile</h2><div class="sub">This is how Jake, the coaches and your team see you. Takes 30 seconds.</div>'
   +'<div class="ph"><label><div class="av" id="fcpAv" '+(ph?'style="background-image:url(\''+E(ph)+'\')"':'')+'>'+(ph?'':E((f.first_name||"?")[0].toUpperCase()))+'</div><span class="t">'+(ph?'Change photo':'Add your photo')+'</span>'
   +'<input type="file" accept="image/*" capture="user" style="display:none" onchange="fcpPhoto(event)"></label></div>'
   +'<div class="lab">Stance</div><div class="seg"><button id="fcpOrth" class="'+(S.stance==="Orthodox"?"on":"")+'" onclick="fcpStance(\'Orthodox\')">Orthodox</button><button id="fcpSouth" class="'+(S.stance==="Southpaw"?"on":"")+'" onclick="fcpStance(\'Southpaw\')">Southpaw</button></div>'
   +'<div class="hint">Orthodox = left foot forward, right hand power. Southpaw = the opposite.</div>'
   +'<div class="two"><div><div class="lab">Weight now (kg)</div><input id="fcpW" type="number" inputmode="decimal" step="0.1" placeholder="e.g. 82.5" value="'+(f.weight_kg||"")+'"></div>'
   +'<div><div class="lab">Fight weight (kg)</div><input id="fcpFW" type="number" inputmode="decimal" step="0.1" placeholder="if you know it" value="'+(f.fight_weight_kg||"")+'"></div></div>'
   +'<div class="two"><div><div class="lab">Suburb</div><input id="fcpSub" type="text" placeholder="e.g. Kincumber" value="'+E(f.suburb||"")+'"></div>'
   +'<div><div class="lab">Instagram</div><input id="fcpIg" type="text" autocapitalize="off" placeholder="@handle" value="'+E(f.instagram||"")+'"></div></div>'
   +'<button class="go" id="fcpGo" onclick="fcpSave()">Save my profile</button><button class="later" onclick="fcpClose()">Not now</button>'
   +'</div></div>';
}
window.fcpOpen=function(){
  var f=me();if(!f||document.getElementById("fcpSheet"))return;
  S.open=true;S.photo=null;S.photoFile=null;S.stance=f.stance||"";
  var w=document.createElement("div");w.innerHTML=sheetHtml(f);document.body.appendChild(w.firstChild);
};
window.fcpClose=function(){S.open=false;var s=document.getElementById("fcpSheet");if(s&&s.parentNode)s.parentNode.removeChild(s);};
window.fcpStance=function(v){S.stance=v;var a=document.getElementById("fcpOrth"),b=document.getElementById("fcpSouth");if(a)a.className=v==="Orthodox"?"on":"";if(b)b.className=v==="Southpaw"?"on":"";};
window.fcpPhoto=function(e){
  var file=e.target.files&&e.target.files[0];if(!file)return;
  S.photoFile=file;
  try{S.photo=URL.createObjectURL(file);var av=document.getElementById("fcpAv");if(av){av.style.backgroundImage="url('"+S.photo+"')";av.textContent="";}}catch(x){}
};
function num(id){var el=document.getElementById(id);var x=el?parseFloat(el.value):NaN;return isNaN(x)?null:x;}
function txt(id){var el=document.getElementById(id);return el?el.value.trim():"";}
window.fcpSave=async function(){
  if(S.busy)return;var f=me();if(!f)return;
  var w=num("fcpW");
  if(!S.stance){T("Pick your stance — Orthodox or Southpaw.");return;}
  if(!w){T("Add your weight in kg — a rough number is fine.");return;}
  S.busy=true;var go=document.getElementById("fcpGo");if(go){go.disabled=true;go.textContent="Saving…";}
  try{
    var url=null;
    if(S.photoFile){
      var ext=((S.photoFile.name||"jpg").split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
      var path=uid()+"/fightclub-"+Date.now()+"."+ext;
      var up=await sb.storage.from("member-photos").upload(path,S.photoFile,{upsert:true});
      if(up.error)throw up.error;
      url=sb.storage.from("member-photos").getPublicUrl(path).data.publicUrl;
      try{await sb.from("member_profiles").update({photo_url:url}).eq("user_id",uid());}catch(e2){}
    }
    var ig=txt("fcpIg");if(ig&&ig[0]!=="@")ig="@"+ig;
    var r=await sb.rpc("fc_update_me",{p_photo:url||"",p_stance:S.stance,p_weight:w,p_fight_weight:num("fcpFW"),p_suburb:txt("fcpSub"),p_instagram:ig});
    if(r.error)throw r.error;
    if(r.data===false)throw new Error("We couldn't find your Fight Club spot — message Jake.");
    var rows=[f];try{(window.FC&&window.FC.F||[]).forEach(function(x){if(x.id===f.id&&rows.indexOf(x)<0)rows.push(x);});if(window.FC&&window.FC.me&&rows.indexOf(window.FC.me)<0)rows.push(window.FC.me);}catch(e3){}
    rows.forEach(function(x){x.stance=S.stance;x.weight_kg=w;var fw=num("fcpFW");if(fw)x.fight_weight_kg=fw;if(txt("fcpSub"))x.suburb=txt("fcpSub");if(ig)x.instagram=ig;if(url)x.photo_url=url;});
    markAsked();window.fcpClose();T("Profile saved. See you on the mats.");
    var c=document.getElementById("fcpCard");if(c&&c.parentNode)c.parentNode.removeChild(c);
    try{if(window.fccRepaint)window.fccRepaint();}catch(e4){}
  }catch(err){
    T((err&&err.message)||"Couldn't save — check your connection and try again.");
    var g=document.getElementById("fcpGo");if(g){g.disabled=false;g.textContent="Save my profile";}
  }
  S.busy=false;
};
setInterval(inject,700);
})();
