/* ===== 2 FOR 1 SIGN-UPS · Jake, Alison, Jerson and Kelly (20 Nov 2026) =====
   Xmas / New Year 2 for 1 membership special. Pairs register on the public page /2for1; staff see them here.
   Runs the same way as the 7-day free trial list: the info comes in, someone contacts them, they and their friend come in and sign up at the gym.
   Data: RPCs tfo_list / tfo_set_status / tfo_note (security definer, raise unless tfo_staff()). The table itself has no public access. */
(function(){
"use strict";
var NAMES={"15a011b9-e222-45f0-8eb9-d5338da935d1":"Jake","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce":"Alison","f2dfab30-b271-4c3e-a44e-8b00d489c2c6":"Jerson","09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb":"Kelly"};
var TF={leads:null,f:"new",need:false};
function me(){try{return !!(session&&session.user&&NAMES[session.user.id]);}catch(e){return false;}}
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
var css=document.createElement("style");css.textContent=
".tfStrip{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #c9a44c;border-radius:14px;padding:12px 14px;margin:0 0 12px;background:linear-gradient(160deg,#17130a,#0d0c08);cursor:pointer;color:var(--text,#f2f0eb)}"+
".tfStrip .t{font-family:Oswald,sans-serif;font-weight:700;font-size:17px;text-transform:uppercase;letter-spacing:.5px}.tfStrip .t small{display:block;font-family:Inter,sans-serif;font-weight:600;font-size:11px;letter-spacing:0;text-transform:none;color:#9a9891;margin-top:2px}"+
".tfStrip .p{background:#F1D27A;color:#161307;font-size:11px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:8px 12px;border-radius:999px;white-space:nowrap}.tfStrip .p.z{background:#26262b;color:#9a9891}"+
".tfPage .tfTabs{display:flex;gap:6px;margin-bottom:10px}.tfPage .tfTabs button{flex:1;border:1px solid #26262b;background:#141416;color:#9a9891;border-radius:999px;padding:7px 4px;font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;cursor:pointer}.tfPage .tfTabs button.on{background:#2a1e07;border-color:#F1D27A;color:#F1D27A}"+
".tfPage .rtcLead.new{border-color:#F1D27A}"+
".tfHead{border:1px solid #26262b;border-radius:16px;padding:14px;margin-bottom:12px;background:linear-gradient(160deg,#17130a,#0d0c08)}.tfHead .k{font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#F1D27A}.tfHead h2{font-family:Oswald,sans-serif;font-weight:700;font-size:28px;text-transform:uppercase;margin:4px 0 2px}.tfHead .w{font-size:13px;color:#9a9891}.tfHead .w a{color:#F1D27A}"+
".tfHead .do{margin-top:10px;padding-top:10px;border-top:1px solid #26262b;font-size:13px;color:#f2f0eb;line-height:1.45}.tfHead .do b{color:#F1D27A}"+
".tfNeed{margin-top:8px;border-radius:9px;padding:7px 10px;font-size:12px;font-weight:800;background:#2a1e07;color:#F1D27A}"+
".tfDone{margin-top:8px;font-size:12px;font-weight:700;color:#9a9891}"+
".tfWho{font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#9a9891;margin-top:10px}.tfWho b{color:#f2f0eb;letter-spacing:0;text-transform:none;font-size:13.5px;margin-left:4px}"+
".tfPage .rtcLead textarea{width:100%;box-sizing:border-box;margin-top:8px;background:#0b0b0c;border:1px solid #26262b;border-radius:9px;color:#f2f0eb;padding:8px 10px;font:inherit;font-size:13px;min-height:40px;resize:vertical}";
document.head.appendChild(css);
async function load(){TF.at=Date.now();try{var r=await sb.rpc("tfo_list");if(r.error)throw r.error;TF.leads=r.data||[];}catch(e){TF.leads=TF.leads||[];}}
function cnt(){var c={new:0,contacted:0,signed:0,no:0,all:0};(TF.leads||[]).forEach(function(x){c.all++;if(c[x.status]!=null)c[x.status]++;});return c;}
function ago(iso){var m=Math.round((Date.now()-new Date(iso))/6e4);if(m<60)return m+" min ago";var h=Math.round(m/60);if(h<24)return h+" hr ago";var d=Math.round(h/24);return d===1?"yesterday":d+" days ago";}
function day(iso){return new Date(iso).toLocaleDateString("en-AU",{day:"numeric",month:"short"});}
/* ---- home strip (with the free trial strip) ---- */
function strip(){
  if(!me())return "";
  if(!TF.leads){load().then(function(){try{if(view==="home"&&typeof renderHome==="function")renderHome();}catch(e){}});return '<div class="tfStrip" onclick="go(\'twofor1\')"><div class="t">2 for 1 sign-ups<small>Checking…</small></div><span class="p z">Open</span></div>';}
  var c=cnt();
  /* new sign-ups show up on Home without a reload: re-check at most once a minute when Home is drawn */
  if(Date.now()-(TF.at||0)>60000){var was=c.all+"/"+c.new;load().then(function(){var n=cnt();try{if(n.all+"/"+n.new!==was&&view==="home"&&typeof renderHome==="function")renderHome();}catch(e){}});}
  return '<div class="tfStrip" onclick="go(\'twofor1\')"><div class="t">2 for 1 sign-ups<small>'+c.all+' pair'+(c.all===1?'':'s')+' · '+c.new+' to contact · Jake, Alison, Jerson &amp; Kelly</small></div><span class="p'+(c.new?'':' z')+'">'+(c.new?c.new+' new':'Open')+'</span></div>';
}
try{var _fch=window.fightClubHtml;window.fightClubHtml=function(){var h="";try{h=_fch?_fch.apply(this,arguments):"";}catch(e){}return (h||"")+strip();};}catch(e){}
/* ---- the list ---- */
function ct(mobile,email){var ph=String(mobile||"").replace(/[^\d+]/g,"");
  return '<div class="ct"><a href="tel:'+E(ph)+'">📞 '+E(mobile||"no number")+'</a><a href="sms:'+E(ph)+'">💬 Text</a></div>'+(email?'<div class="ct"><a href="mailto:'+E(email)+'">✉️ '+E(email)+'</a></div>':'');}
function paint(){
  if(!me()){go("home");return;}
  if(TF.need){TF.need=false;load().then(function(){if(view==="twofor1")paint();});}
  var L=TF.leads||[],f=TF.f,c=cnt(),list=f==="all"?L:L.filter(function(x){return x.status===f;});
  function tab(k,l){return '<button class="'+(f===k?"on":"")+'" onclick="tfF(\''+k+'\')">'+l+(c[k]?' '+c[k]:'')+'</button>';}
  var m=document.getElementById("main");if(!m)return;
  m.innerHTML='<div class="rtcPage tfPage"><button class="backBtn" onclick="go(\'home\')">‹ Home</button>'+
   '<div class="tfHead"><div class="k">Xmas / New Year special · closes 1 Dec</div><h2>2 for 1 sign-ups</h2><div class="w">'+c.all+' pair'+(c.all===1?'':'s')+' registered · '+c.new+' to contact · <a href="#" onclick="tfReload();return false">refresh</a></div>'+
   '<div class="do"><b>What to do:</b> contact the person, book them and their friend in, and sign them both up at the gym. Tap <b>Contacted</b> once you have reached them so nobody doubles up.</div></div>'+
   '<div class="tfTabs">'+tab("new","New")+tab("contacted","Contacted")+tab("signed","Signed up")+tab("all","All")+'</div>'+
   (TF.leads===null?'<div class="card"><p>Loading…</p></div>':list.length?list.map(function(x){var s=x.status;
     return '<div class="rtcLead '+(s==="new"?"new":"")+'"><div class="top"><div><div class="nm">'+E(x.a_name)+' + '+E(x.b_name)+'</div><div class="meta">'+ago(x.created_at)+' · '+new Date(x.created_at).toLocaleString("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})+'</div></div></div>'+
     (s==="new"?'<div class="tfNeed">Needs contacting. Nobody has reached them yet.</div>':x.contacted_at?'<div class="tfDone">Contacted '+day(x.contacted_at)+(NAMES[x.contacted_by]?' by '+NAMES[x.contacted_by]:'')+'</div>':'')+
     '<div class="tfWho">Main contact<b>'+E(x.a_name)+'</b></div>'+ct(x.a_mobile,x.a_email)+
     '<div class="tfWho">Friend<b>'+E(x.b_name)+'</b></div>'+ct(x.b_mobile,"")+
     '<div class="st"><button class="'+(s==="new"?"on":"")+'" onclick="tfSt(\''+x.id+'\',\'new\')">New</button><button class="'+(s==="contacted"?"on":"")+'" onclick="tfSt(\''+x.id+'\',\'contacted\')">Contacted</button><button class="j '+(s==="signed"?"on":"")+'" onclick="tfSt(\''+x.id+'\',\'signed\')">Signed up</button><button class="x '+(s==="no"?"on":"")+'" onclick="tfSt(\''+x.id+'\',\'no\')">No</button></div>'+
     '<textarea placeholder="Note, e.g. texted, both coming in Tuesday 6pm" onblur="tfNote(\''+x.id+'\',this)">'+E(x.notes||"")+'</textarea></div>';}).join(""):'<div class="card"><p>'+(f==="new"?"Nobody waiting. All caught up.":"Nothing here yet.")+'</p></div>')+
   '<p style="text-align:center;font-size:11px;color:#9a9891;margin:8px 0 0">Jake, Alison, Jerson and Kelly can see this list.</p></div>';
}
window.tfF=function(f){TF.f=f;paint();};
window.tfReload=async function(){await load();paint();T("Updated");};
window.tfSt=async function(id,st){if(!me())return;var L=(TF.leads||[]).find(function(x){return x.id===id;});if(!L||L.status===st)return;
  var r=await sb.rpc("tfo_set_status",{p_id:id,p_status:st});if(r.error){T(r.error.message);return;}
  L.status=st;if(st==="contacted"&&!L.contacted_at){L.contacted_at=new Date().toISOString();L.contacted_by=session.user.id;}
  T(st==="contacted"?"Marked contacted":st==="signed"?"Signed up ✓":st==="no"?"Marked no":"Back to new");paint();};
window.tfNote=async function(id,el){var L=(TF.leads||[]).find(function(x){return x.id===id;});if(!L||el.value===(L.notes||""))return;
  var r=await sb.rpc("tfo_note",{p_id:id,p_notes:el.value});if(r.error){T(r.error.message);return;}L.notes=el.value;T("Note saved");};
try{NAV_TAB.twofor1="home";}catch(e){}
var _render=window.render;window.render=function(){if(view==="twofor1")return paint();return _render.apply(this,arguments);};
try{var _go=window.go;window.go=function(v){if(v==="twofor1")TF.need=true;return _go.apply(this,arguments);};}catch(e){}
})();
