/* ===== Gym TV Screens — Jake-only control panel (13 Oct 2026) =====
   The six Google TVs each run /tv?n=1..6 in a kiosk browser and poll public.gym_screens every 20s.
   This tab lets Jake push a photo, a video, a YouTube link or a message to any or all of them.
   Writes are locked to Jake's uid by RLS; media goes to the public 'gym-screens' storage bucket. */
(function(){
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
function isJake(){try{return !!(session&&session.user&&session.user.id===JAKE);}catch(e){return false;}}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m];});}
var S={tvs:[],sel:{},kind:"photo",photoUrl:"",videoUrl:"",lib:[],busy:false,yt:"",title:"",body:"",bg:false,fit:"contain",sound:false,renaming:null};

var css=document.createElement("style");css.textContent=
".scx{max-width:640px;margin:0 auto}.scx .k{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#F1D27A;margin:4px 2px 2px}"
+".scx h2{font-family:Oswald,sans-serif;font-size:28px;letter-spacing:1px;text-transform:uppercase;line-height:1.05;margin:0}.scx .sub{font-size:12.5px;color:#a39f94;line-height:1.5;margin:6px 2px 14px}"
+".scx .card{border:1px solid #2f2a1a;background:linear-gradient(160deg,#16120a,#0c0a07);border-radius:14px;padding:12px;margin-bottom:10px}"
+".scx .card h3{font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#F1D27A;margin:0 0 8px}"
+".scx .chips{display:flex;flex-wrap:wrap;gap:6px}.scx .chip{font-size:11px;font-weight:700;padding:8px 11px;border-radius:9px;border:1px solid #3a3320;background:#141210;color:#cfc6b0;cursor:pointer;user-select:none;font-family:inherit}"
+".scx .chip.on{background:#c9a44c;border-color:#c9a44c;color:#161307}"
+".scx .big{display:grid;grid-template-columns:1fr 1fr;gap:8px}.scx .big button{border:1px solid #3a3320;background:#141210;color:#f2f0eb;border-radius:12px;padding:14px 8px;font-family:inherit;font-weight:800;font-size:12px;letter-spacing:1px;text-transform:uppercase;cursor:pointer}"
+".scx .big button.on{background:#2a2211;border-color:#c9a44c;color:#F1D27A}"
+".scx .pane{margin-top:10px}.scx .lib{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}.scx .lib div{aspect-ratio:1;border-radius:8px;background:#000 center/cover no-repeat;border:2px solid transparent;cursor:pointer;position:relative;overflow:hidden}"
+".scx .lib div.on{border-color:#F1D27A}.scx .lib div video{width:100%;height:100%;object-fit:cover}.scx .lib div i{position:absolute;left:4px;bottom:3px;font-size:9px;font-style:normal;color:#fff;background:rgba(0,0,0,.6);padding:1px 5px;border-radius:4px}"
+".scx .up{display:block;border:1px dashed #5a4d2a;border-radius:10px;padding:12px;text-align:center;font-size:12px;color:#cfc6b0;cursor:pointer;font-weight:700}.scx .up input{display:none}"
+".scx input[type=text],.scx textarea{width:100%;box-sizing:border-box;background:#0e0c08;border:1px solid #3a3320;border-radius:10px;color:#f2f0eb;padding:10px;font-family:inherit;font-size:14px;margin-bottom:8px}.scx textarea{min-height:64px}"
+".scx .go{display:block;width:100%;margin-top:10px;background:linear-gradient(180deg,#ffe58a,#f4c95d 48%,#b8860b 52%,#ffd76a);color:#1a1200;border:0;border-radius:12px;padding:14px;font-family:Oswald,sans-serif;font-weight:700;font-size:17px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}.scx .go:disabled{opacity:.5}"
+".scx .clear{background:none;border:1px solid #3a3320;color:#a39f94;border-radius:9px;padding:9px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;width:100%;margin-top:6px}"
+".scx .now{display:flex;flex-direction:column;gap:6px}.scx .now div{display:flex;align-items:center;gap:10px;font-size:12px;color:#c9c5ba}.scx .now .th{width:54px;height:32px;border-radius:5px;background:#000 center/cover no-repeat;flex:none;border:1px solid #2f2a1a;display:flex;align-items:center;justify-content:center;font-size:9px;color:#F1D27A;font-weight:800;overflow:hidden}"
+".scx .now b{color:#fff;display:block}.scx .now small{display:block;color:#8f8b80;font-size:10.5px}.scx .now button{margin-left:auto;background:none;border:0;color:#c9a44c;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit}"
+".scx .back{background:none;border:0;color:#c9a44c;font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 14px;cursor:pointer;font-family:inherit}"
+".scx .how{font-size:11.5px;color:#8f8b80;line-height:1.55;margin-top:10px}.scx .how code{color:#F1D27A;font-family:inherit;font-weight:800}";
document.head.appendChild(css);

var BUCKET="gym-screens";
function pub(path){return SUPABASE_URL+"/storage/v1/object/public/"+BUCKET+"/"+path;}
function ytId(u){var m=String(u||"").match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/);return m?m[1]:null;}

async function load(){
  var r=await sb.from("gym_screens").select("*").order("id");S.tvs=r.data||[];
  if(!Object.keys(S.sel).length)S.tvs.forEach(function(t){S.sel[t.id]=true;});
  try{var l=await sb.storage.from(BUCKET).list("",{limit:60,sortBy:{column:"created_at",order:"desc"}});S.lib=(l.data||[]).filter(function(f){return f.name&&f.name.indexOf(".")>0;});}catch(e){S.lib=[];}
}
function selIds(){return S.tvs.filter(function(t){return S.sel[t.id];}).map(function(t){return t.id;});}
function isVid(n){return /\.(mp4|mov|webm|m4v)$/i.test(n);}

function paint(){
  var m=$id("main");if(!m)return;
  if(!isJake()){m.innerHTML='<div class="scx"><button class="back" onclick="go(\'home\')">‹ Back</button><p>Nothing here.</p></div>';return;}
  var all=selIds().length===S.tvs.length;
  m.innerHTML='<div class="scx">'
  +'<button class="back" onclick="go(\'staff\')">‹ Staff Room</button>'
  +'<div class="k">Gym TVs</div><h2>Screens</h2><p class="sub">Pick which TVs, pick what to show, hit Send. Each TV changes within about 20 seconds.</p>'
  +'<div class="card"><h3>Which TVs</h3><div class="chips"><span class="chip'+(all?' on':'')+'" onclick="scxAll()">All</span>'
   +S.tvs.map(function(t){return '<span class="chip'+(S.sel[t.id]?' on':'')+'" onclick="scxTog('+t.id+')" oncontextmenu="return false">'+esc(t.name)+'</span>';}).join("")+'</div>'
   +'<div class="how">Need to rename one? <button class="chip" style="padding:4px 8px;font-size:10px" onclick="scxRename()">Rename a TV</button></div></div>'
  +'<div class="card"><h3>What to show</h3><div class="big">'
   +[["photo","Photo"],["video","Video"],["yt","YouTube"],["msg","Message"]].map(function(k){return '<button class="'+(S.kind===k[0]?'on':'')+'" onclick="scxKind(\''+k[0]+'\')">'+k[1]+'</button>';}).join("")+'</div>'
   +'<div class="pane" id="scxPane"></div>'
   +'<button class="go" id="scxSend" onclick="scxSend()">Send to TVs</button><button class="clear" onclick="scxClear()">Clear the selected TVs</button></div>'
  +'<div class="card"><h3>Now showing</h3><div class="now">'+S.tvs.map(nowRow).join("")+'</div></div>'
  +'<div class="card"><h3>Set up a TV</h3><div class="how">On the TV, open <code>legacygym-app.vercel.app/tv</code> and pick which TV it is. That\'s it. Full steps are in the chat with Claude.</div></div>'
  +'</div>';
  paintPane();
}
function nowRow(t){
  var p=t.payload||{},what="Blank",th='';
  if(t.kind==="photo"&&p.url){what="Photo";th='style="background-image:url('+esc(p.url)+')"';}
  else if(t.kind==="video"&&p.url){what="Video";th='';}
  else if(t.kind==="yt"&&ytId(p.url)){what="YouTube";th='style="background-image:url(https://i.ytimg.com/vi/'+ytId(p.url)+'/mqdefault.jpg)"';}
  else if(t.kind==="msg"&&p.title){what="Message: "+p.title;}
  var when=t.updated_at?new Date(t.updated_at).toLocaleString("en-AU",{weekday:"short",hour:"numeric",minute:"2-digit"}):"";
  return '<div><div class="th" '+th+'>'+(th?'':(t.kind==="video"?'VIDEO':t.kind==="msg"?'MSG':''))+'</div><div><b>'+esc(t.name)+'</b><small>'+esc(what)+(when&&t.kind!=="blank"?' · '+when:'')+'</small></div>'+(t.kind!=="blank"?'<button onclick="scxCopy('+t.id+')">Copy to selected</button>':'')+'</div>';
}
function paintPane(){
  var el=$id("scxPane");if(!el)return;
  if(S.kind==="photo"||S.kind==="video"){
    var items=S.lib.filter(function(f){return S.kind==="video"?isVid(f.name):!isVid(f.name);});
    var cur=S.kind==="video"?S.videoUrl:S.photoUrl;
    el.innerHTML=(items.length?'<div class="lib">'+items.map(function(f){var u=pub(f.name);return '<div class="'+(u===cur?'on':'')+'" onclick="scxPick(\''+esc(u)+'\')" '+(isVid(f.name)?'><video src="'+esc(u)+'#t=0.5" muted playsinline preload="metadata"></video><i>video</i>':'style="background-image:url('+esc(u)+')">')+'</div>';}).join("")+'</div>':'<p class="sub">Nothing uploaded yet.</p>')
     +'<label class="up">'+(S.busy?'Uploading…':(S.kind==="video"?'+ Upload a video from your phone':'+ Upload a photo from your phone'))+'<input type="file" accept="'+(S.kind==="video"?'video/*':'image/*')+'" onchange="scxUpload(this)"></label>'
     +(S.kind==="video"?'<div class="chips" style="margin-top:8px"><span class="chip'+(S.sound?' on':'')+'" onclick="S_scx.sound=!S_scx.sound;scxPaintPane()">Sound on</span><span class="chip'+(S.fit==="cover"?' on':'')+'" onclick="S_scx.fit=S_scx.fit===\'cover\'?\'contain\':\'cover\';scxPaintPane()">Fill the screen</span></div>'
       :'<div class="chips" style="margin-top:8px"><span class="chip'+(S.fit==="cover"?' on':'')+'" onclick="S_scx.fit=S_scx.fit===\'cover\'?\'contain\':\'cover\';scxPaintPane()">Fill the screen (crops edges)</span></div>');
  }else if(S.kind==="yt"){
    el.innerHTML='<input type="text" placeholder="Paste a YouTube link" value="'+esc(S.yt)+'" oninput="S_scx.yt=this.value"><div class="chips"><span class="chip'+(S.sound?' on':'')+'" onclick="S_scx.sound=!S_scx.sound;scxPaintPane()">Sound on</span></div><p class="sub" style="margin-top:8px">Plays on loop. No YouTube login needed on the TVs.</p>';
  }else{
    el.innerHTML='<input type="text" placeholder="Big line, e.g. FIGHT CLUB 6:45PM TONIGHT" value="'+esc(S.title)+'" oninput="S_scx.title=this.value"><textarea placeholder="Smaller line (optional)" oninput="S_scx.body=this.value">'+esc(S.body)+'</textarea>'
     +'<div class="chips"><span class="chip'+(S.bg?' on':'')+'" onclick="S_scx.bg=!S_scx.bg;scxPaintPane()">Put the last photo behind it</span></div>';
  }
}

window.S_scx=S;window.scxPaintPane=paintPane;
window.scxAll=function(){var all=selIds().length===S.tvs.length;S.tvs.forEach(function(t){S.sel[t.id]=!all;});paint();};
window.scxTog=function(id){S.sel[id]=!S.sel[id];paint();};
window.scxKind=function(k){S.kind=k;paint();};
window.scxPick=function(u){if(S.kind==="video")S.videoUrl=u;else S.photoUrl=u;paintPane();};
window.scxRename=async function(){var t=S.tvs[0];var pick=prompt("Which TV number? (1-"+S.tvs.length+")");var id=parseInt(pick,10);var tv=S.tvs.find(function(x){return x.id===id;});if(!tv)return;var n=prompt("New name for "+tv.name+":",tv.name);if(!n||!n.trim())return;var r=await sb.from("gym_screens").update({name:n.trim()}).eq("id",id);if(r.error){T(r.error.message);return;}await load();paint();};
window.scxUpload=async function(inp){var f=inp.files&&inp.files[0];if(!f)return;if(f.size>200*1024*1024){T("That file is over 200MB — trim it down first.");return;}
  S.busy=true;paintPane();
  var ext=(f.name.split(".").pop()||"bin").toLowerCase();var path=Date.now()+"-"+Math.random().toString(16).slice(2,6)+"."+ext;
  var r=await sb.storage.from(BUCKET).upload(path,f,{contentType:f.type||undefined,upsert:false});
  S.busy=false;
  if(r.error){T("Upload failed: "+r.error.message);paintPane();return;}
  var u=pub(path);if(S.kind==="video")S.videoUrl=u;else S.photoUrl=u;
  await load();paintPane();T("Uploaded. Hit Send to put it on the TVs.");};
async function push(kind,payload){
  var ids=selIds();if(!ids.length){T("Pick at least one TV.");return;}
  var btn=$id("scxSend");if(btn)btn.disabled=true;
  var r=await sb.from("gym_screens").update({kind:kind,payload:payload,updated_at:new Date().toISOString(),updated_by:session.user.id}).in("id",ids);
  if(btn)btn.disabled=false;
  if(r.error){T(r.error.message);return;}
  T(kind==="blank"?"Cleared.":"Sent to "+(ids.length===S.tvs.length?"all TVs":ids.length+" TV"+(ids.length>1?"s":""))+". Give it 20 seconds.");
  await load();paint();
}
window.scxSend=function(){
  if(S.kind==="photo"){if(!S.photoUrl){T("Pick or upload a photo first.");return;}push("photo",{url:S.photoUrl,fit:S.fit});}
  else if(S.kind==="video"){if(!S.videoUrl){T("Pick or upload a video first.");return;}push("video",{url:S.videoUrl,fit:S.fit,sound:S.sound,loop:true});}
  else if(S.kind==="yt"){if(!ytId(S.yt)){T("That doesn't look like a YouTube link.");return;}push("yt",{url:S.yt.trim(),sound:S.sound});}
  else{if(!S.title.trim()){T("Type the big line first.");return;}push("msg",{title:S.title.trim(),body:S.body.trim(),bg:S.bg?S.photoUrl:""});}
};
window.scxClear=function(){push("blank",{});};
window.scxCopy=function(id){var t=S.tvs.find(function(x){return x.id===id;});if(!t)return;push(t.kind,t.payload||{});};
window.scxEnter=async function(){if(!isJake()){T("Staff only.");return;}go("screens");};

/* hook into the app */
var _render=window.render;window.render=function(){if(view==="screens"){var m=$id("main");if(m)m.innerHTML='<div class="loadingDots">Opening screens…</div>';load().then(paint);return;}return _render.apply(this,arguments);};
var _staff=window.renderStaff;window.renderStaff=async function(){var r=await _staff.apply(this,arguments);try{if(view==="staff"&&isJake()){var hero=document.querySelector("#main .hero");if(hero&&!$id("scxBtn")){var b=document.createElement("button");b.id="scxBtn";b.className="btnGold";b.style.cssText="margin-top:12px";b.textContent="Gym TV Screens ›";b.onclick=window.scxEnter;hero.appendChild(b);}}}catch(e){}return r;};
})();
