/* ===== FIGHT NIGHT TICKETS · pre-release registrations tally (18 Oct 2026) =====
   Visible to Jake, Alison and Joe Williams only (RLS + fn_presale_is_admin()). Public form lives at /fightnight.
   Data: table fn_presale (RPC fn_presale_register for the public, fn_presale_tally + direct select for admins). */
(function(){
"use strict";
var ADMINS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce","8ddade7e-691b-4c56-9f8d-8594a1c9755f"]; /* Jake, Alison, Joe */
function isAdmin(){try{return !!(session&&session.user&&ADMINS.indexOf(session.user.id)>=0);}catch(e){return false;}}
var BOSS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"]; /* Jake, Alison: the sixty */
function isBoss(){try{return !!(session&&session.user&&BOSS.indexOf(session.user.id)>=0);}catch(e){return false;}}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function when(iso){if(!iso)return "";return new Date(iso).toLocaleString("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});}
function dmy(d){if(!d)return "";var x=String(d).slice(0,10).split("-");return x.length===3?x[2]+"/"+x[1]+"/"+x[0]:d;}
function slugOf(n){return String(n||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
var APP="https://legacygym-app.vercel.app";
var LOGO=APP+"/img/fc/fc-logo.png";
var SEAT={ga:"Standing GA",table:"Bar table & stools",catered:"Catered table"};
function money(c){return "$"+((c||0)/100).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2}).replace(/\.00$/,"");}
function dollars(c){return "$"+Math.round((c||0)/100).toLocaleString();}

var S={loaded:false,busy:false,tally:null,rows:[],q:"",fighter:"all",seat:"all",only:"all",open:{},tab:"pub",setOpen:false,mem:null};

/* ---------- CSS (Fight Club blue & white) ---------- */
var css=document.createElement("style");css.textContent=
".fnt{max-width:720px;margin:0 auto;padding-bottom:48px;--c:#1fb6e6;--c2:#7fe0ff;--ink:#f2f0eb;--mute:#8fa4ae;--line:#16303c;--panel:#0b1319;--panel2:#07141b;--green:#39FF88;--red:#ff8c98;--amber:#f5b942}"
+".fnt *{box-sizing:border-box}.fnt .back{background:none;border:0;color:var(--c2);font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 10px;cursor:pointer;font-family:inherit}"
+".fnt .hd{display:flex;align-items:center;gap:12px;margin-bottom:12px}.fnt .hd img{height:46px}.fnt .hd .k{font-size:8px;font-weight:800;letter-spacing:3px;color:var(--c);text-transform:uppercase}.fnt .hd .t{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;line-height:1;color:#fff}.fnt .hd .t span{color:var(--c)}.fnt .hd .s{font-size:11px;color:var(--mute);margin-top:3px}"
+".fnt .lock{border:1px solid var(--line);background:var(--panel2);border-radius:10px;padding:8px 12px;font-size:11px;color:var(--mute);margin-bottom:12px}"
+".fnt .share{border:1px solid var(--c);border-radius:14px;padding:14px;background:linear-gradient(160deg,#0b2a38,#07141b);margin-bottom:12px}.fnt .share .k{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--c);font-weight:800}.fnt .share .u{font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#fff;margin-top:6px;word-break:break-all}.fnt .share p{font-size:11.5px;color:#cfd8dc;margin:6px 0 0;line-height:1.5}"
+".fnt .btns{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.fnt .b{border:1px solid var(--c);background:none;color:var(--c2);border-radius:10px;padding:10px 12px;font:700 12px Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase;cursor:pointer;font-family:Oswald,sans-serif}.fnt .b.p{background:var(--c);color:#03141c}.fnt .b.sm{padding:6px 9px;font-size:10.5px}.fnt .b.r{border-color:#5a2630;color:var(--red)}"
+".fnt .kp{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}.fnt .kp div{border:1px solid var(--line);border-radius:12px;padding:10px 8px;background:var(--panel);text-align:center}.fnt .kp small{display:block;font-size:8px;letter-spacing:2px;text-transform:uppercase;color:var(--mute);font-weight:800}.fnt .kp b{display:block;font:700 28px/1 Oswald,sans-serif;color:#fff;margin-top:4px}.fnt .kp b.c{color:var(--c2)}.fnt .kp b.g{color:var(--green)}"
+".fnt .segs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}.fnt .segs div{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--panel);display:flex;gap:10px;align-items:center}.fnt .segs b{font:700 24px/1 Oswald,sans-serif;color:var(--c2);min-width:40px}.fnt .segs small{font-size:11px;color:#cfd8dc;line-height:1.35}"
+".fnt .sec{display:flex;justify-content:space-between;align-items:baseline;margin:16px 0 8px}.fnt .sec b{font:700 15px Oswald,sans-serif;text-transform:uppercase;letter-spacing:1px;color:#fff}.fnt .sec small{font-size:10.5px;color:var(--mute)}"
+".fnt .lb{display:grid;grid-template-columns:1fr auto auto;gap:8px 10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--line)}.fnt .lb b{font:600 15px Oswald,sans-serif;text-transform:uppercase;color:#fff}.fnt .lb span{font-size:12px;color:var(--mute);white-space:nowrap}.fnt .lb span i{font-style:normal;color:#fff;font-weight:800}.fnt .lb .bar{grid-column:1/-1;height:4px;background:var(--panel2);border-radius:2px;overflow:hidden;margin-top:-2px}.fnt .lb .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--c),var(--c2))}"
+".fnt .tools{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}.fnt .tools input,.fnt .tools select{flex:1;min-width:120px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;color:#fff;font:600 13px Montserrat,sans-serif;outline:none}.fnt .tools input:focus{border-color:var(--c)}"
+".fnt .row{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:11px 12px;margin-bottom:8px}.fnt .row .top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.fnt .row .nm{font:700 16px/1.1 Oswald,sans-serif;text-transform:uppercase;color:#fff}.fnt .row .ft{font-size:11px;color:var(--c2);font-weight:800;margin-top:2px}.fnt .row .meta{font-size:11.5px;color:var(--mute);margin-top:6px;line-height:1.6}.fnt .row .meta a{color:#fff;text-decoration:none;font-weight:700}.fnt .row .tm{font-size:10px;color:var(--mute);white-space:nowrap;text-align:right}"
+".fnt .tag{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:2px 8px;font-size:10px;font-weight:800;letter-spacing:.5px;color:#cfd8dc;margin:6px 4px 0 0}.fnt .tag.u{border-color:var(--amber);color:var(--amber)}.fnt .tag.s{border-color:var(--c);color:var(--c2)}"
+".fnt .q{margin-top:8px;border-left:3px solid var(--c);padding:6px 10px;background:rgba(31,182,230,.07);border-radius:0 8px 8px 0;font-size:12.5px;color:#fff;line-height:1.45}.fnt .q small{display:block;color:var(--mute);font-size:10px;margin-top:3px;font-weight:700;letter-spacing:1px;text-transform:uppercase}"
+".fnt .empty{text-align:center;color:var(--mute);font-size:12.5px;padding:24px 10px;border:1px dashed var(--line);border-radius:12px}"
+".fnt .mny{border:1px solid var(--green);border-radius:14px;padding:12px;background:rgba(57,255,136,.06);margin-bottom:12px}.fnt .mny .k{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--green);font-weight:800}.fnt .mny b{display:block;font:700 30px/1 Oswald,sans-serif;color:#fff;margin-top:6px}.fnt .mny small{display:block;font-size:11px;color:#cfd8dc;margin-top:5px;line-height:1.5}"
+".fnt .al{border:1px solid var(--line);border-radius:12px;background:var(--panel);padding:11px 12px;margin-bottom:8px}.fnt .al .h{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.fnt .al b{font:600 15px Oswald,sans-serif;text-transform:uppercase;color:#fff}.fnt .al .n{font:700 15px Oswald,sans-serif;color:var(--c2);white-space:nowrap}.fnt .al .n.full{color:var(--amber)}.fnt .al .bar{height:6px;border-radius:3px;background:var(--panel2);overflow:hidden;margin-top:7px}.fnt .al .bar i{display:block;height:100%;background:linear-gradient(90deg,var(--c),var(--c2))}.fnt .al small{display:block;font-size:10.5px;color:var(--mute);margin-top:6px}"
+".fnt .sz{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}.fnt .sz div{border:1px solid var(--line);border-radius:9px;padding:7px 4px;text-align:center;background:var(--panel2)}.fnt .sz small{display:block;font-size:8.5px;letter-spacing:1px;color:var(--mute);font-weight:800}.fnt .sz b{display:block;font:700 16px Oswald,sans-serif;color:#fff;margin-top:2px}"
+".fnt .set{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.fnt .set label{display:block;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute);font-weight:800;margin-bottom:4px}.fnt .set input{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:9px 10px;color:#fff;font:700 14px Montserrat,sans-serif;outline:none}.fnt .set input:focus{border-color:var(--c)}"
+".fnt .tabsx{display:flex;gap:4px;padding:4px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;margin-bottom:11px}.fnt .tabsx button{flex:1;border:0;background:transparent;color:var(--mute);border-radius:9px;padding:10px 4px;font:600 11px/1.2 Oswald,sans-serif;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;font-family:Oswald,sans-serif}.fnt .tabsx button.on{background:var(--c);color:#03141c}"
+".fnt .warnp{border:1px solid #5a3a12;background:#1b1308;border-radius:12px;padding:10px 12px;margin-bottom:10px;font-size:11.5px;color:#e8dcc2;line-height:1.5}.fnt .warnp b{color:var(--amber)}"
+"#fntHome{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:linear-gradient(90deg,#0b2a38,#07141b);border:1px solid #1fb6e6;border-radius:12px;padding:12px 14px;margin:0 0 11px;color:#f2f0eb;cursor:pointer;font-family:inherit;box-shadow:0 0 0 1px rgba(31,182,230,.15)}#fntHome img{height:40px;flex:none}#fntHome .k{font-size:7.5px;font-weight:800;letter-spacing:2px;color:#1fb6e6;text-transform:uppercase}#fntHome .t{font-family:Oswald,sans-serif;font-size:17px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;line-height:1.1;margin-top:2px;color:#fff}#fntHome .s{font-size:10.5px;color:#8fa4ae;margin-top:2px}#fntHome .a{margin-left:auto;color:#7fe0ff;font-weight:800;font-size:12px;flex:none}";
document.head.appendChild(css);

/* ---------- data ---------- */
async function load(){if(!isAdmin())return;S.busy=true;try{
  var a=await sb.rpc("fn_presale_tally");if(a.error)T(a.error.message);S.tally=a.data||null;
  var r=await sb.from("fn_presale").select("*").neq("status","removed").order("created_at",{ascending:false}).limit(2000);if(r.error)T(r.error.message);S.rows=r.data||[];
  if(isBoss()){var m=await sb.rpc("fn_members_tally");if(!m.error)S.mem=m.data||null;}
 }catch(e){T("Couldn't load the list.");}S.busy=false;S.loaded=true;}

function link(slug){return APP+"/fightnight"+(slug?"/"+slug:"");}
function fighterSlug(r){return r.fighter_name?slugOf(r.fighter_name):null;}
function filtered(){var q=S.q.trim().toLowerCase();return S.rows.filter(function(r){
  if(S.fighter!=="all"&&(S.fighter==="none"?!!r.fighter_name:r.fighter_name!==S.fighter))return false;
  if(S.seat!=="all"&&r.seating!==S.seat)return false;
  if(S.only==="u18"&&!r.u18)return false;if(S.only==="msg"&&!r.message)return false;if(S.only==="song"&&!r.song)return false;
  if(q&&[r.full_name,r.email,r.mobile,r.fighter_name,r.message,r.song,r.ref].join(" ").toLowerCase().indexOf(q)<0)return false;
  return true;});}

/* ---------- the sixty (Jake + Alison only) ---------- */
function tabsHtml(){if(!isBoss())return "";
 return '<div class="tabsx"><button class="'+(S.tab==="pub"?"on":"")+'" onclick="fntTab(\'pub\')">Public pre-sale</button>'
 +'<button class="'+(S.tab==="mem"?"on":"")+'" onclick="fntTab(\'mem\')">The sixty</button></div>';}
function memHtml(){var m=S.mem;
 if(!m)return '<div class="empty">Loading the members\' room…</div>';
 var cap=m.cap||60,held=m.held||0,left=Math.max(0,cap-held),pct=Math.min(100,Math.round(held/Math.max(1,cap)*100));
 var rows=(m.rows||[]).filter(function(r){return r.status==="held";});
 var dec=(m.rows||[]).filter(function(r){return r.status==="declined";}).length;
 return '<div class="lock">🔒 You and Alison only. Joe sees the public pre-sale, not this.</div>'
 +'<div class="kp"><div><small>Spots held</small><b class="c">'+held+'</b></div><div><small>Plus ones</small><b>'+(m.guests||0)+'</b></div><div><small>Today</small><b class="g">'+(m.today||0)+'</b></div><div><small>Said no</small><b>'+dec+'</b></div></div>'
 +'<div class="share" style="background:linear-gradient(160deg,#0b2a38,#07141b)"><div class="k">The room</div>'
 +'<div style="font:700 30px/1 Oswald,sans-serif;margin-top:5px">'+held+'<span style="font:700 13px Montserrat,sans-serif;color:var(--mute);margin-left:6px">of '+cap+' · '+left+' left</span></div>'
 +'<div class="bar2" style="height:8px;border-radius:4px;background:var(--panel2);overflow:hidden;margin-top:9px"><i style="display:block;height:100%;width:'+pct+'%;background:linear-gradient(90deg,var(--c),var(--c2))"></i></div>'
 +'<p style="color:var(--amber);font-weight:700;margin-top:8px">Members never see this. Their card only says there are '+cap+' spots.</p>'
 +'<p>'+(held+(m.guests||0))+' heads with plus ones.'+(m.until?' Offer stops showing after '+dmy(m.until)+'.':'')+(m.open?'':' <b style="color:var(--amber)">Room is closed.</b>')+'</p>'
 +'<div class="btns"><button class="b" onclick="memCsv()">Export the list</button><button class="b" onclick="memMobiles()">Copy mobiles</button>'
 +'<button class="b" onclick="memCap()">Set the number</button>'
 +'<button class="b '+(m.open?"r":"p")+'" onclick="memToggle()">'+(m.open?"Close the room":"Open it back up")+'</button></div></div>'
 +'<div class="sec"><b>Who\'s in</b><small>newest first</small></div>'
 +(rows.length?rows.map(memRow).join(""):'<div class="empty">Nobody yet. It shows the next time a member opens the app.</div>');}
function memRow(r){
 var since="";try{since=r.member_since?new Date(r.member_since).toLocaleDateString("en-AU",{month:"short",year:"numeric"}):"";}catch(e){}
 return '<div class="row"><div class="top"><div><div class="nm">'+esc(r.full_name||"(no name on profile)")+'</div>'
 +'<div class="ft">'+(r.guest?"Holding two · them and a guest":"Just them")+'</div></div>'
 +'<div class="tm">'+when(r.created_at)+'</div></div>'
 +'<div class="meta">'+(r.mobile?'<a href="tel:'+esc(String(r.mobile).replace(/\s/g,""))+'">'+esc(r.mobile)+'</a>':'no mobile')+(r.email?' · <a href="mailto:'+esc(r.email)+'">'+esc(r.email)+'</a>':'')+'</div>'
 +'<div>'+(r.membership?'<span class="tag s">'+esc(r.membership)+'</span>':'')+(since?'<span class="tag">Member since '+esc(since)+'</span>':'')+'</div>'
 +'<div class="btns" style="margin-top:8px">'+(r.mobile?'<a class="b sm" style="text-decoration:none" href="sms:'+esc(String(r.mobile).replace(/\s/g,""))+'">Text</a>':'')+'<button class="b sm r" onclick="memRemove('+r.id+')">Remove</button></div></div>';}
window.fntTab=function(t){S.tab=t;paint();window.scrollTo(0,0);};
window.memCap=async function(){var m=S.mem||{};var v=prompt("How many spots in the members' room?",String(m.cap||60));if(v===null)return;
 var n=parseInt(v,10);if(isNaN(n)||n<1||n>500)return T("Enter a number between 1 and 500.");
 var r=await sb.rpc("fn_members_set",{p:{members_cap:n}});if(r.error)return T(r.error.message);T("Room set to "+n+".");await load();paint();};
window.memToggle=async function(){var m=S.mem||{};var open=!m.open;
 if(!open&&!confirm("Close the room? The offer stops showing to members straight away."))return;
 var r=await sb.rpc("fn_members_set",{p:{members_open:open}});if(r.error)return T(r.error.message);T(open?"Open again.":"Room closed.");await load();paint();};
window.memRemove=async function(id){var m=S.mem||{};var row=(m.rows||[]).find(function(x){return x.id===id;});
 if(!row||!confirm("Take "+(row.full_name||"them")+" out of the room? That frees the spot."))return;
 var r=await sb.from("fn_members").update({status:"removed"}).eq("id",id);if(r.error)return T(r.error.message);
 T("Removed.");await load();paint();};
window.memMobiles=async function(){var m=S.mem||{};var L=(m.rows||[]).filter(function(r){return r.status==="held"&&r.mobile;}).map(function(r){return String(r.mobile).replace(/\s/g,"");});
 var s0=Array.from(new Set(L)).join(", ");try{await navigator.clipboard.writeText(s0);T(L.length+" mobiles copied.");}catch(e){prompt("Copy:",s0);}};
window.memCsv=function(){var m=S.mem||{};var L=(m.rows||[]).filter(function(r){return r.status!=="removed";});
 var H=["status","name","mobile","email","membership","member_since","plus_one","held_at"];
 var lines=[H.join(",")].concat(L.map(function(r){return [r.status,r.full_name||"",r.mobile||"",r.email||"",r.membership||"",r.member_since||"",r.guest?"yes":"no",r.created_at].map(function(v){v=String(v==null?"":v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(",");}));
 var b=new Blob(["\ufeff"+lines.join("\n")],{type:"text/csv;charset=utf-8"});var a=document.createElement("a");a.href=URL.createObjectURL(b);
 a.download="fight-night-members-"+new Date().toISOString().slice(0,10)+".csv";document.body.appendChild(a);a.click();setTimeout(function(){a.remove();},500);};

/* ---------- blocks ---------- */
function st(){return (S.tally&&S.tally.settings)||{};}
function moneyHtml(t){var s0=st();
 var sN=t.seats||0,hN=t.shirts||0;
 return '<div class="mny"><div class="k">Held, not yet invoiced</div><b>'+((t.held_cents||0)>=100000?dollars(t.held_cents):money(t.held_cents||0))+'</b>'
 +'<small>'+sN+' seat'+(sN===1?'':'s')+' at '+(s0.discount_pct||20)+'% off plus '+hN+' shirt'+(hN===1?'':'s')+' at '+money(s0.shirt_cents||4999)+'. Invoices go out the day tickets release.</small>'
 +'<div class="btns"><button class="b" onclick="fntCsv()">Export invoice list</button></div></div>';}
function settingsHtml(t){var s0=st();
 if(!S.setOpen)return (s0.prices_confirmed?'':'<div class="warnp"><b>Ticket prices are still the placeholders.</b> Set them before you share a link — every held seat and invoice is worked out from them.</div>')+'<div class="btns" style="margin:0 0 12px"><button class="b'+(s0.prices_confirmed?'':' am')+'" onclick="fntSet(1)">Prices &amp; allocation</button></div>';
 return '<div class="al" style="border-color:var(--c)"><div class="h"><b>Prices &amp; allocation</b><span class="n">'+(s0.discount_pct||20)+'% off</span></div>'
 +'<div class="set">'
 +'<div><label>Standing GA ($)</label><input id="sGa" type="number" step="0.01" value="'+(((s0.ga_cents||0)/100).toFixed(2))+'"></div>'
 +'<div><label>Bar table ($)</label><input id="sTab" type="number" step="0.01" value="'+(((s0.table_cents||0)/100).toFixed(2))+'"></div>'
 +'<div><label>Catered table ($)</label><input id="sCat" type="number" step="0.01" value="'+(((s0.catered_cents||0)/100).toFixed(2))+'"></div>'
 +'<div><label>Team shirt ($)</label><input id="sShirt" type="number" step="0.01" value="'+(((s0.shirt_cents||0)/100).toFixed(2))+'"></div>'
 +'<div><label>Discount %</label><input id="sPct" type="number" value="'+(s0.discount_pct||20)+'"></div>'
 +'<div><label>Seats per fighter</label><input id="sAlloc" type="number" value="'+(s0.default_alloc||10)+'"></div>'
 +'<div><label>Shirts to print a run</label><input id="sTh" type="number" value="'+(s0.shirt_threshold||5)+'"></div>'
 +'<div><label>Shirt cut-off</label><input id="sCut" type="date" value="'+(s0.shirt_cutoff||"")+'"></div>'
 +'</div><small>Seats per fighter applies to anyone you have not set a number for. The public page reads these straight away.</small>'
 +'<div class="btns"><button class="b p" onclick="fntSaveSet()">Save</button><button class="b" onclick="fntSet(0)">Close</button></div></div>';}
function allocHtml(x){var sl=x.fighter_id?slugOf(x.name):null,al=x.alloc||0,seats=x.seats||0,left=Math.max(0,al-seats),full=sl&&left<=0;
 return '<div class="al"><div class="h"><b>'+esc(x.name)+'</b><span class="n'+(full?" full":"")+'">'+(sl?seats+' of '+al:x.n+' reg')+'</span></div>'
 +(sl?'<div class="bar"><i style="width:'+Math.min(100,Math.round(100*seats/Math.max(1,al)))+'%"></i></div>':'')
 +'<small>'+(sl?(full?'Block gone \u2014 top him up':left+' seat'+(left===1?'':'s')+' left')+' \u00b7 '+(x.shirts||0)+' shirt'+((x.shirts||0)===1?'':'s')+(x.u18?' \u00b7 '+x.u18+' U18':''):x.n+' registered, no fighter picked')+'</small>'
 +(sl?'<div class="btns"><button class="b'+(full?" p":"")+'" onclick="fntTopUp(\''+x.fighter_id+'\','+al+')">+5 seats</button><button class="b" onclick="fntAsk(\''+x.fighter_id+'\','+al+')">Set block</button><button class="b" onclick="fntCopy(\''+link(sl)+'\')">Copy link</button></div>':'')
 +'</div>';}
function shirtRunHtml(t){var s0=st(),sz=t.sizes||{},th=s0.shirt_threshold||5;
 var bf=(t.by_fighter||[]).filter(function(x){return x.fighter_id;});
 var ready=bf.filter(function(x){return (x.shirts||0)>=th;}).length;
 var part=bf.filter(function(x){return (x.shirts||0)>0&&(x.shirts||0)<th;});
 var ord=["S","M","L","XL","2XL","3XL","Y12","Y14"];
 return '<div class="sec"><b>Shirt run</b><small>'+(t.shirts||0)+' ordered'+(s0.shirt_cutoff?' \u00b7 cut-off '+dmy(s0.shirt_cutoff):'')+'</small></div>'
 +'<div class="al"><div class="h"><b>Sizes across all teams</b><span class="n">'+(t.shirts||0)+'</span></div>'
 +'<div class="sz">'+ord.map(function(z){return '<div><small>'+z+'</small><b>'+(sz[z]||0)+'</b></div>';}).join("")+'</div>'
 +'<small>'+ready+' team'+(ready===1?'':'s')+' over the '+th+' needed to print'+(part.length?' \u00b7 '+part.length+' short: '+part.map(function(x){return esc(x.name.split(" ")[0])+" ("+x.shirts+")";}).join(", "):'')+'.</small>'
 +(part.length?'<div class="btns"><button class="b am" onclick="fntShortTeams()">Copy the short teams</button></div>':'')
 +'</div>';}

/* ---------- paint ---------- */
function paint(){var m=$id("main");if(!m||view!=="fntix")return;
 if(!isAdmin()){m.innerHTML='<div class="fnt"><button class="back" onclick="go(\'home\')">‹ Home</button><div class="empty">Not for you, sorry.</div></div>';return;}
 if(S.tab==="mem"&&isBoss()){
   m.innerHTML='<div class="fnt"><button class="back" onclick="go(\'home\')">‹ Home</button>'
   +'<div class="hd"><img src="'+LOGO+'" alt=""><div><div class="k">Fight Club · Sat 19 Dec · members</div><div class="t">The <span>sixty</span></div><div class="s">The members\' room. Ringside, private bar, plus ones.</div></div></div>'
   +tabsHtml()+memHtml()+'</div>';
   return;
 }
 if(S.tab==="mem"&&!isBoss())S.tab="pub";
 var t=S.tally||{},bf=(t.by_fighter||[]),max=Math.max.apply(null,[1].concat(bf.map(function(x){return x.n;})));
 var L=filtered();
 var fighters=Array.from(new Set(S.rows.map(function(r){return r.fighter_name;}).filter(Boolean))).sort();
 m.innerHTML='<div class="fnt">'
 +'<button class="back" onclick="go(\'home\')">‹ Home</button>'
 +'<div class="hd"><img src="'+LOGO+'" alt=""><div><div class="k">Fight Club · Sat 19 Dec · pre-release</div><div class="t">Fight Night <span>Tickets</span></div><div class="s">Who\'s registered for 20% off, who they\'re backing, and what they want.</div></div></div>'
 +tabsHtml()
 +'<div class="lock">🔒 Jake, Alison and Joe only. Guests only ever see their own registration.</div>'
 +'<div class="share"><div class="k">The public link · share it anywhere</div><div class="u">'+link()+'</div><p>Anyone can open it, no login. A fighter\'s own link (below) opens with that fighter already picked and shows their face in the preview.</p>'
 +'<div class="btns"><button class="b p" onclick="fntCopy(\''+link()+'\')">Copy link</button><button class="b" onclick="fntShare(\''+link()+'\')">Share…</button><a class="b" href="'+link()+'" target="_blank" rel="noopener" style="text-decoration:none">Open page</a><button class="b" onclick="fntReload()">'+(S.busy?'Loading…':'Refresh')+'</button></div></div>'
 +'<div class="kp"><div><small>Seats held</small><b class="c">'+(t.seats||0)+'</b></div><div><small>Registered</small><b>'+(t.total||0)+'</b></div><div><small>Today</small><b class="g">'+(t.today||0)+'</b></div><div><small>Shirts</small><b class="g">'+(t.shirts||0)+'</b></div></div>'
 +moneyHtml(t)
 +settingsHtml(t)
 +'<div class="segs"><div><b>'+(t.ga||0)+'</b><small>Standing GA</small></div><div><b>'+(t.table||0)+'</b><small>Bar table &amp; stools · text these the table link first</small></div><div><b>'+(t.catered||0)+'</b><small>Catered sit-down table · call these, highest spend</small></div><div><b>'+(t.business||0)+'</b><small>Business email · sponsorship pitch</small></div></div>'
 +'<div class="sec"><b>Allocations</b><small>seats claimed of their block</small></div>'
 +(bf.length?bf.map(allocHtml).join(""):'<div class="empty">No registrations yet. Share the link.</div>')
 +shirtRunHtml(t)
 +'<div class="sec"><b>Registrations</b><small>'+L.length+' of '+S.rows.length+'</small></div>'
 +'<div class="tools"><input placeholder="Search name, email, mobile, message" value="'+esc(S.q)+'" oninput="fntQ(this.value)">'
 +'<select onchange="fntF(\'fighter\',this.value)"><option value="all"'+(S.fighter==="all"?" selected":"")+'>All fighters</option><option value="none"'+(S.fighter==="none"?" selected":"")+'>No fighter picked</option>'+fighters.map(function(f){return '<option value="'+esc(f)+'"'+(S.fighter===f?" selected":"")+'>'+esc(f)+'</option>';}).join("")+'</select>'
 +'<select onchange="fntF(\'seat\',this.value)"><option value="all">All seating</option><option value="ga"'+(S.seat==="ga"?" selected":"")+'>Standing GA</option><option value="table"'+(S.seat==="table"?" selected":"")+'>Bar table</option><option value="catered"'+(S.seat==="catered"?" selected":"")+'>Catered table</option></select>'
 +'<select onchange="fntF(\'only\',this.value)"><option value="all">Everyone</option><option value="u18"'+(S.only==="u18"?" selected":"")+'>Nominated an under 18</option><option value="msg"'+(S.only==="msg"?" selected":"")+'>Left a message</option><option value="song"'+(S.only==="song"?" selected":"")+'>Suggested a song</option></select></div>'
 +'<div class="btns" style="margin:0 0 10px"><button class="b" onclick="fntCsv()">Export CSV ('+L.length+')</button><button class="b" onclick="fntCopyMobiles()">Copy mobiles ('+L.length+')</button></div>'
 +(L.length?L.map(row).join(""):'<div class="empty">Nothing matches.</div>')
 +'</div>';}

function row(r){var o=S.open[r.id];return '<div class="row"><div class="top"><div><div class="nm">'+esc(r.full_name)+'</div><div class="ft">'+(r.fighter_name?'Backing '+esc(r.fighter_name):'No fighter picked')+'</div></div><div class="tm">'+when(r.created_at)+'<br>'+esc(r.ref)+'</div></div>'
 +'<div class="meta"><a href="tel:'+esc(r.mobile.replace(/\s/g,""))+'">'+esc(r.mobile)+'</a> · <a href="mailto:'+esc(r.email)+'">'+esc(r.email)+'</a></div>'
 +'<div>'+(r.seat_no?'<span class="tag s">Seat '+r.seat_no+' · '+(r.price_cents?money(r.price_cents):'')+'</span>':'')+((r.tier||r.seating)?'<span class="tag">'+SEAT[r.tier||r.seating]+'</span>':'')+(r.shirt?'<span class="tag s">Shirt '+esc(r.shirt_size||'?')+'</span>':'')+(r.u18?'<span class="tag u">Under 18'+(r.u18_note?' · '+esc(r.u18_note):'')+'</span>':'')+(r.song?'<span class="tag">♪ '+esc(r.song)+'</span>':'')+(r.source&&r.source!=="direct"?'<span class="tag">via '+esc(r.source)+'</span>':'')+(r.invoice_cents?'<span class="tag">Invoice '+money(r.invoice_cents)+'</span>':'')+'</div>'
 +(r.message?'<div class="q">“'+esc(r.message)+'”<small>message for '+esc((r.fighter_name||"their fighter").split(" ")[0])+'</small></div>':'')
 +'<div class="btns" style="margin-top:8px"><a class="b sm" style="text-decoration:none" href="sms:'+esc(r.mobile.replace(/\s/g,""))+'">Text</a><button class="b sm" onclick="fntOpen('+r.id+')">'+(o?'Less':'Notes')+'</button><button class="b sm r" onclick="fntRemove('+r.id+')">Remove</button></div>'
 +(o?'<div class="meta" style="margin-top:8px">Updated '+when(r.updated_at)+(r.ua?' · '+esc(r.ua.slice(0,80)):'')+'</div><div class="tools" style="margin-top:8px"><input id="fntNote'+r.id+'" placeholder="Private note (e.g. called re under 18)" value="'+esc(r.notes||"")+'"><button class="b sm p" onclick="fntNote('+r.id+')">Save</button></div>':'')
 +'</div>';}

/* ---------- actions ---------- */
window.fntQ=function(v){S.q=v;var m=$id("main");paint();try{var i=m.querySelector(".tools input");i.focus();i.setSelectionRange(i.value.length,i.value.length);}catch(e){}};
window.fntF=function(k,v){S[k]=v;paint();};
window.fntOpen=function(id){S.open[id]=!S.open[id];paint();};
window.fntReload=async function(){await load();paint();};
window.fntCopy=async function(u){try{await navigator.clipboard.writeText(u);T("Link copied.");}catch(e){prompt("Copy this link:",u);}};
window.fntShare=async function(u){try{if(navigator.share){await navigator.share({title:"Fight Club Fight Night · 20% off pre-release tickets",text:"Fight Club Fight Night, Sat 19 Dec at Legacy Gym Kincumber. Register for 20% off pre-release tickets:",url:u});return;}}catch(e){if(e&&e.name==="AbortError")return;}fntCopy(u);};
window.fntNote=async function(id){var v=($id("fntNote"+id)||{}).value||"";var r=await sb.from("fn_presale").update({notes:v||null}).eq("id",id);if(r.error)return T(r.error.message);var x=S.rows.find(function(z){return z.id===id;});if(x)x.notes=v;T("Saved.");paint();};
window.fntRemove=async function(id){var x=S.rows.find(function(z){return z.id===id;});if(!x||!confirm("Remove "+x.full_name+" from the list? They can register again."))return;var r=await sb.from("fn_presale").update({status:"removed"}).eq("id",id);if(r.error)return T(r.error.message);T("Removed.");await load();paint();};
window.fntCopyMobiles=async function(){var L=filtered().map(function(r){return r.mobile.replace(/\s/g,"");});var s=Array.from(new Set(L)).join(", ");try{await navigator.clipboard.writeText(s);T(L.length+" mobiles copied.");}catch(e){prompt("Copy:",s);}};
window.fntCsv=function(){var L=filtered();var H=["ref","registered","name","mobile","email","fighter","seat_no","tier","price","shirt","shirt_size","invoice","under18","under18_note","message","song","source","notes"];
 var lines=[H.join(",")].concat(L.map(function(r){return [r.ref,r.created_at,r.full_name,r.mobile,r.email,r.fighter_name||"",r.seat_no||"",SEAT[r.tier||r.seating]||"",r.price_cents?(r.price_cents/100).toFixed(2):"",r.shirt?"yes":"no",r.shirt_size||"",r.invoice_cents?(r.invoice_cents/100).toFixed(2):"",r.u18?"yes":"no",r.u18_note||"",r.message||"",r.song||"",r.source||"",r.notes||""].map(function(v){v=String(v==null?"":v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}).join(",");}));
 var b=new Blob(["﻿"+lines.join("\n")],{type:"text/csv;charset=utf-8"});var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="fight-night-presale-"+new Date().toISOString().slice(0,10)+".csv";document.body.appendChild(a);a.click();setTimeout(function(){a.remove();},500);};
window.fntSet=function(v){S.setOpen=!!v;paint();};
window.fntSaveSet=async function(){
 var g=function(i){var el=$id(i);return el?el.value:null;};
 var c=function(v){var n=parseFloat(v);return isNaN(n)?null:Math.round(n*100);};
 var p={ga_cents:c(g("sGa")),table_cents:c(g("sTab")),catered_cents:c(g("sCat")),shirt_cents:c(g("sShirt")),
   discount_pct:parseInt(g("sPct"),10)||null,default_alloc:parseInt(g("sAlloc"),10)||null,
   shirt_threshold:parseInt(g("sTh"),10)||null,shirt_cutoff:g("sCut")||null,prices_confirmed:true};
 var r=await sb.rpc("fn_presale_set_settings",{p:p});
 if(r.error)return T(r.error.message);
 T("Saved. The public page uses these now.");S.setOpen=false;await load();paint();};
window.fntTopUp=async function(id,cur){var r=await sb.rpc("fn_presale_set_alloc",{p_fighter_id:id,p_total:(cur||0)+5});if(r.error)return T(r.error.message);T("Five more seats added.");await load();paint();};
window.fntAsk=async function(id,cur){var v=prompt("How many pre-sale seats for this fighter?",String(cur||10));if(v===null)return;var n=parseInt(v,10);if(isNaN(n)||n<0||n>200)return T("Enter a number between 0 and 200.");var r=await sb.rpc("fn_presale_set_alloc",{p_fighter_id:id,p_total:n});if(r.error)return T(r.error.message);T("Block set to "+n+".");await load();paint();};
window.fntShortTeams=async function(){var t=S.tally||{},th=(t.settings&&t.settings.shirt_threshold)||5;
 var part=(t.by_fighter||[]).filter(function(x){return x.fighter_id&&(x.shirts||0)>0&&(x.shirts||0)<th;});
 var s0=part.map(function(x){return x.name+": "+x.shirts+" of "+th+" shirts, "+(th-x.shirts)+" to go \u2014 "+link(slugOf(x.name));}).join("\n");
 try{await navigator.clipboard.writeText(s0);T("Copied "+part.length+" teams.");}catch(e){prompt("Copy:",s0);}};
window.fntEnter=function(){if(!isAdmin()){T("Not for you, sorry.");return;}go("fntix");};

/* ---------- hooks ---------- */
var _render=window.render;window.render=function(){if(view==="fntix"){var m=$id("main");if(m&&!S.loaded)m.innerHTML='<div class="loadingDots">Opening Fight Night Tickets…</div>';load().then(paint);return;}return _render.apply(this,arguments);};
function homeCard(){
  var ex=$id("fntHome");
  if(!isAdmin()){if(ex&&ex.parentNode)ex.parentNode.removeChild(ex);return;} /* never leave it on screen for anyone else */
  if(view!=="home")return;var m=$id("main");if(!m||ex)return;
  var b=document.createElement("button");b.id="fntHome";b.onclick=window.fntEnter;
  b.innerHTML='<img src="'+LOGO+'" alt=""><div><div class="k">Fight Club · Sat 19 Dec · 20% pre-release</div><div class="t">Fight Night Tickets</div><div class="s">Who\'s registered, who they\'re backing · Jake, Alison &amp; Joe</div></div><span class="a">Open ›</span>';
  var hq=$id("fnxHome");if(hq){hq.insertAdjacentElement("afterend",b);return;}
  var root=$id("lgh2");if(root)root.insertAdjacentElement("afterbegin",b);else{var first=m.querySelector(".homeCard");if(first)first.insertAdjacentElement("beforebegin",b);else m.insertAdjacentElement("afterbegin",b);}
}
var _home=window.renderHome;if(typeof _home==="function"){window.renderHome=function(){var r=_home.apply(this,arguments);try{homeCard();setTimeout(homeCard,150);setTimeout(homeCard,700);}catch(e){}return r;};}
setInterval(function(){try{homeCard();}catch(e){}},1500); /* also sweeps the card away if the signed-in person is not allowed it */
})();
