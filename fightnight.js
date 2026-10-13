/* ===== Fight Night · tickets, fighters, door, costs (14 Oct 2026) =====
   Visible to Jake, Alison and Kelly only (RLS: fn_is_admin()). Tables fn_* in Supabase.
   Sales here are DEMO sales: no money moves. The ledger logic (capacity, upgrades, add-ons, refunds,
   check-in) runs server-side in fn_purchase / fn_upgrade / fn_addon / fn_refund / fn_checkin. */
(function(){
"use strict";
var ADMINS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce","09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb"]; /* Jake, Alison, Kelly */
function isAdmin(){try{return !!(session&&session.user&&ADMINS.indexOf(session.user.id)>=0);}catch(e){return false;}}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function money(c){var n=(c||0)/100;return (n<0?"-":"")+"$"+Math.abs(n).toLocaleString("en-AU",{minimumFractionDigits:0,maximumFractionDigits:0});}
function exact(c){var n=(c||0)/100;return (n<0?"-":"")+"$"+Math.abs(n).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});}
function when(iso){if(!iso)return "";return new Date(iso).toLocaleString("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});}
var APP="https://legacygym-app.vercel.app";
var LOGO=APP+"/img/fc/fc-logo.png";

var S={tab:"overview",loaded:false,busy:false,settings:null,fighters:[],orders:[],tickets:[],payments:[],refunds:[],expenses:[],audit:[],
  sell:{tier:"bar",qty:2,fighter:null,search:"",name:"",email:"",outcome:"paid",addons:{}},last:null,
  tq:"",tfilter:"all",door:{result:null,code:"",scanning:false},flash:{},chan:null,costEdit:null};

/* ---------- CSS ---------- */
var css=document.createElement("style");css.textContent=
".fnx{max-width:680px;margin:0 auto;padding-bottom:40px}.fnx .k{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#F1D27A;margin:4px 2px 2px}"
+".fnx h2{font-family:Oswald,sans-serif;font-size:28px;letter-spacing:1px;text-transform:uppercase;line-height:1.05;margin:0}.fnx .sub{font-size:12.5px;color:#a39f94;line-height:1.5;margin:6px 2px 12px}"
+".fnx .back{background:none;border:0;color:#c9a44c;font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 12px;cursor:pointer;font-family:inherit}"
+".fnx .tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 12px;-webkit-overflow-scrolling:touch;scrollbar-width:none}.fnx .tabs::-webkit-scrollbar{display:none}.fnx .tabs button{flex:none;border:1px solid #3a3320;background:#141210;color:#cfc6b0;border-radius:99px;padding:9px 13px;font-family:inherit;font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;cursor:pointer}.fnx .tabs button.on{background:#c9a44c;border-color:#c9a44c;color:#161307}"
+".fnx .card{border:1px solid #2f2a1a;background:linear-gradient(160deg,#16120a,#0c0a07);border-radius:14px;padding:14px;margin-bottom:10px}.fnx .card h3{font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#F1D27A;margin:0 0 10px}"
+".fnx .stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.fnx .stat{border:1px solid #2f2a1a;background:#121008;border-radius:12px;padding:12px}.fnx .stat small{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:#9a9891;font-weight:800}.fnx .stat b{display:block;font-family:Oswald,sans-serif;font-size:26px;line-height:1.1;margin:6px 0 3px;color:#fff}.fnx .stat i{display:block;font-style:normal;font-size:10px;color:#8f8b80}.fnx .stat.good{border-color:#2d5d4e;background:#0f2019}.fnx .stat.good b{color:#39FF88}.fnx .stat.bad b{color:#ff8c98}"
+".fnx .bar{height:8px;background:#26221a;border-radius:99px;overflow:hidden;margin:8px 0 4px}.fnx .bar span{display:block;height:100%;background:#c9a44c;border-radius:99px;transition:width .4s}.fnx .bar.g span{background:#39FF88}"
+".fnx .row{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:12.5px;color:#cfc6b0;padding:8px 0;border-bottom:1px solid #1f1b12}.fnx .row:last-child{border:0}.fnx .row b{color:#fff}.fnx .row small{display:block;color:#8f8b80;font-size:10.5px}.fnx .row .r{text-align:right;flex:none}"
+".fnx .tier{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #3a3320;border-radius:12px;padding:12px;margin-bottom:8px;cursor:pointer;background:#141210}.fnx .tier.on{border-color:#F1D27A;background:#2a2211}.fnx .tier b{display:block;font-family:Oswald,sans-serif;font-size:17px;letter-spacing:.5px;text-transform:uppercase}.fnx .tier small{display:block;font-size:10.5px;color:#8f8b80;margin-top:2px}.fnx .tier .p{font-family:Oswald,sans-serif;font-size:24px;color:#F1D27A;flex:none}.fnx .tier.out{opacity:.45}"
+".fnx label{display:block;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#cfc6b0;margin:12px 0 6px}.fnx input[type=text],.fnx input[type=email],.fnx input[type=number],.fnx select,.fnx textarea{width:100%;box-sizing:border-box;background:#0e0c08;border:1px solid #3a3320;border-radius:10px;color:#f2f0eb;padding:11px;font-family:inherit;font-size:14px}.fnx select{appearance:auto}"
+".fnx .step{display:flex;align-items:center;justify-content:space-between;border:1px solid #3a3320;border-radius:12px;padding:5px;background:#0e0c08}.fnx .step button{border:0;background:#2a2211;color:#F1D27A;font-size:22px;width:44px;height:40px;border-radius:9px;cursor:pointer;font-family:inherit}.fnx .step b{font-family:Oswald,sans-serif;font-size:22px}"
+".fnx .go{display:block;width:100%;margin-top:12px;background:linear-gradient(180deg,#ffe58a,#f4c95d 48%,#b8860b 52%,#ffd76a);color:#1a1200;border:0;border-radius:12px;padding:14px;font-family:Oswald,sans-serif;font-weight:700;font-size:17px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}.fnx .go:disabled{opacity:.5}"
+".fnx .btn{background:#141210;border:1px solid #3a3320;color:#F1D27A;border-radius:9px;padding:9px 12px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:.5px}.fnx .btn.gold{background:#c9a44c;border-color:#c9a44c;color:#161307}.fnx .btn.red{color:#ff8c98;border-color:#5a2a30}.fnx .btn:disabled{opacity:.5}.fnx .btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}"
+".fnx .chips{display:flex;flex-wrap:wrap;gap:6px}.fnx .chip{font-size:11px;font-weight:700;padding:8px 11px;border-radius:9px;border:1px solid #3a3320;background:#141210;color:#cfc6b0;cursor:pointer;user-select:none;font-family:inherit}.fnx .chip.on{background:#c9a44c;border-color:#c9a44c;color:#161307}"
+".fnx .addon{display:flex;gap:10px;align-items:center;border:1px solid #3a3320;border-radius:12px;padding:10px 12px;margin-bottom:6px;cursor:pointer;background:#141210}.fnx .addon.on{border-color:#F1D27A;background:#2a2211}.fnx .addon b{display:block;font-size:13px}.fnx .addon small{display:block;color:#8f8b80;font-size:10.5px;margin-top:2px}.fnx .addon .p{font-family:Oswald,sans-serif;font-size:18px;color:#F1D27A;flex:none;margin-left:auto}.fnx .addon .cb{width:20px;height:20px;border-radius:6px;border:2px solid #5a4d2a;flex:none}.fnx .addon.on .cb{background:#F1D27A;border-color:#F1D27A}"
+".fnx .fgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.fnx .fc{border:1px solid #2f2a1a;background:#121008;border-radius:14px;overflow:hidden;position:relative;transition:box-shadow .3s}.fnx .fc .ph{aspect-ratio:1;background:#1a1a1e center/cover no-repeat;display:grid;place-items:center;font-family:Oswald,sans-serif;font-size:34px;color:#5a4d2a}.fnx .fc .in{padding:10px}.fnx .fc b{display:block;font-family:Oswald,sans-serif;font-size:16px;letter-spacing:.3px;text-transform:uppercase;line-height:1.1}.fnx .fc small{display:block;color:#8f8b80;font-size:10.5px;margin-top:3px}.fnx .fc .n{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.7);color:#F1D27A;font-family:Oswald,sans-serif;font-size:13px;padding:3px 8px;border-radius:99px;border:1px solid #3a3320}.fnx .fc .t{position:absolute;top:8px;right:8px;background:#c9a44c;color:#161307;font-family:Oswald,sans-serif;font-size:15px;padding:3px 9px;border-radius:99px}"
+".fnx .fc.flash{box-shadow:0 0 0 3px #F1D27A,0 0 30px #F1D27A;animation:fnxFlash 1.2s ease-out 3}@keyframes fnxFlash{0%{box-shadow:0 0 0 3px #F1D27A,0 0 36px #F1D27A}100%{box-shadow:0 0 0 1px #3a3320,0 0 0 #F1D27A}}"
+".fnx .lb{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #1f1b12;transition:background .3s}.fnx .lb:last-child{border:0}.fnx .lb .av{width:38px;height:38px;border-radius:50%;background:#1a1a1e center/cover no-repeat;flex:none;border:2px solid #3a3320;display:grid;place-items:center;font-family:Oswald,sans-serif;color:#5a4d2a}.fnx .lb .rk{font-family:Oswald,sans-serif;color:#8f8b80;width:22px;font-size:15px;flex:none}.fnx .lb b{display:block;font-size:13px}.fnx .lb small{display:block;color:#8f8b80;font-size:10.5px}.fnx .lb .ct{margin-left:auto;font-family:Oswald,sans-serif;font-size:22px;color:#F1D27A;flex:none}.fnx .lb.flash{background:#2a2211;border-radius:10px}"
+".fnx .tk{border:1px solid #3a3320;border-radius:14px;background:linear-gradient(135deg,#1a1710,#0c0a07);margin-bottom:10px;overflow:hidden}.fnx .tk .top{display:flex;gap:10px;align-items:center;padding:12px 14px;border-bottom:1px dashed #3a3320}.fnx .tk .top img{height:40px}.fnx .tk .top b{display:block;font-family:Oswald,sans-serif;font-size:18px;text-transform:uppercase;letter-spacing:.5px}.fnx .tk .top small{color:#c9a44c;font-size:10px;letter-spacing:1.5px;font-weight:800}.fnx .tk .bd{padding:12px 14px}.fnx .tk .g{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;font-size:12.5px}.fnx .tk .g small{display:block;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:#8f8b80;font-weight:800;margin-bottom:2px}.fnx .tk .code{font-family:ui-monospace,Menlo,monospace;font-size:17px;letter-spacing:1px;margin:10px 0 4px;color:#fff}.fnx .tk .st{display:inline-block;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 9px;border-radius:99px;border:1px solid #2d5d4e;color:#39FF88;background:#0f2019}.fnx .tk .st.used{border-color:#3a3a40;color:#9a9891;background:#1a1a1e}.fnx .tk .st.ref{border-color:#5a2a30;color:#ff8c98;background:#2a1216}.fnx .tk .qr{width:92px;height:92px;background:#fff;border-radius:8px;padding:5px;flex:none}.fnx .tk .qr svg{width:100%;height:100%;display:block}.fnx .tk .qrrow{display:flex;gap:12px;align-items:center;margin-top:8px}"
+".fnx .cam{position:relative;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:1;border:1px solid #3a3320}.fnx .cam video{width:100%;height:100%;object-fit:cover;display:block}.fnx .cam .frame{position:absolute;left:15%;top:15%;width:70%;height:70%;border:3px solid #c9a44c;border-radius:16px;pointer-events:none;box-shadow:0 0 0 999px rgba(0,0,0,.45)}.fnx .cam .hint{position:absolute;left:0;right:0;bottom:10px;text-align:center;font-size:11px;color:#cfc6b0;font-weight:700;text-shadow:0 1px 3px #000}"
+".fnx .res{border-radius:16px;padding:20px;text-align:center;margin-top:10px;border:2px solid #2c7e60;background:#0f2e22}.fnx .res .big{font-family:Oswald,sans-serif;font-size:40px;letter-spacing:2px;color:#39FF88;line-height:1}.fnx .res .who{font-size:15px;font-weight:700;margin-top:8px}.fnx .res .m{font-size:12px;color:#a9ddcb;margin-top:5px;line-height:1.5}.fnx .res.bad{background:#351c22;border-color:#903f4a}.fnx .res.bad .big{color:#ff8c98}.fnx .res.bad .m{color:#f1b3bb}"
+".fnx .feed div{font-size:12px;color:#cfc6b0;padding:7px 0;border-bottom:1px solid #1f1b12;display:flex;justify-content:space-between;gap:10px}.fnx .feed div:last-child{border:0}.fnx .feed time{color:#8f8b80;white-space:nowrap;font-size:10.5px}"
+".fnx .note{font-size:11.5px;color:#8f8b80;line-height:1.55;margin-top:8px}.fnx .warn{background:#2b2620;border:1px solid #655239;padding:10px 12px;border-radius:10px;color:#d5c2a5;font-size:12px;margin-top:8px}.fnx .ok{background:#152a25;border:1px solid #2d5d4e;padding:10px 12px;border-radius:10px;color:#a9ddcb;font-size:12px;margin-top:8px}"
+".fnx table{width:100%;border-collapse:collapse;font-size:12px}.fnx th{text-align:left;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:#8f8b80;padding:6px 4px;border-bottom:1px solid #2f2a1a}.fnx td{padding:8px 4px;border-bottom:1px solid #1f1b12;vertical-align:top}.fnx td.r,.fnx th.r{text-align:right}"
+"#fnxHome{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:linear-gradient(90deg,#2a2211,#0f0f0f);border:1px solid #c9a44c;border-radius:12px;padding:12px 14px;margin:0 0 11px;color:var(--text,#f2f0eb);cursor:pointer;font-family:inherit}#fnxHome img{height:40px;flex:none}#fnxHome .k{font-size:7.5px;font-weight:800;letter-spacing:2px;color:#c9a44c;text-transform:uppercase}#fnxHome .t{font-family:Oswald,sans-serif;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;line-height:1.1;margin-top:2px}#fnxHome .s{font-size:10.5px;color:#9a9891;margin-top:2px}#fnxHome .a{margin-left:auto;color:#c9a44c;font-weight:800;font-size:12px;flex:none}";
document.head.appendChild(css);

/* ---------- data ---------- */
async function load(){
  var r=await Promise.all([
    sb.from("fn_settings").select("*").eq("id",1).single(),
    sb.from("fc_fighters").select("id,first_name,last_name,photo_url,camp_number,stance,wins,losses,draws").eq("camp","fc2026").eq("status","active").order("last_name"),
    sb.from("fn_orders").select("*").order("created_at",{ascending:false}),
    sb.from("fn_tickets").select("*").order("created_at",{ascending:false}),
    sb.from("fn_payments").select("*"),
    sb.from("fn_refunds").select("*"),
    sb.from("fn_expenses").select("*").order("created_at"),
    sb.from("fn_audit").select("*").order("id",{ascending:false}).limit(40)
  ]);
  S.settings=r[0].data;S.fighters=r[1].data||[];S.orders=r[2].data||[];S.tickets=r[3].data||[];S.payments=r[4].data||[];S.refunds=r[5].data||[];S.expenses=r[6].data||[];S.audit=r[7].data||[];
  S.loaded=true;
  if(!S.chan){try{S.chan=sb.channel("fn-live")
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"fn_tickets"},function(p){var t=p.new;if(t&&t.fighter_id){S.flash[t.fighter_id]=Date.now();var f=fighter(t.fighter_id);if(f)T("🔥 "+f.first_name+" "+f.last_name+" +1 ticket");}refresh();})
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"fn_tickets"},function(){refresh();})
    .subscribe();}catch(e){}}
}
var _rt=null;function refresh(){clearTimeout(_rt);_rt=setTimeout(function(){if(view!=="fightnight")return;load().then(paint);},250);}
function fighter(id){return S.fighters.find(function(f){return f.id===id;});}
function fname(id){var f=fighter(id);return f?f.first_name+" "+f.last_name:(id?"Fighter":"Here for the night");}
function tiers(){return (S.settings&&S.settings.tiers)||[];}
function tier(id){return tiers().find(function(t){return t.id===id;})||{short:id,name:id,price_cents:0,capacity:0};}
function addons(){return ((S.settings&&S.settings.addons)||[]);}
function inventory(){return tiers().map(function(t){var sold=S.tickets.filter(function(x){return x.status==="active"&&x.tier===t.id;}).length;return Object.assign({},t,{sold:sold,remaining:Math.max(0,t.capacity-sold)});});}
function metrics(){
  var ok=S.payments.filter(function(p){return p.status==="succeeded";});
  var gross=ok.reduce(function(a,p){return a+p.amount_cents;},0),fees=ok.reduce(function(a,p){return a+p.fee_cents;},0),refunded=S.refunds.reduce(function(a,r){return a+r.amount_cents;},0);
  var active=S.tickets.filter(function(t){return t.status==="active";});
  var addonCost=active.reduce(function(a,t){return a+(t.addons||[]).reduce(function(b,x){return b+(x.cost_cents||0);},0);},0);
  var addonRev=ok.filter(function(p){return p.type==="addon";}).reduce(function(a,p){return a+p.amount_cents;},0);
  var paid=S.expenses.filter(function(e){return e.status==="paid";}).reduce(function(a,e){return a+e.amount_cents;},0);
  var committed=S.expenses.filter(function(e){return e.status==="committed";}).reduce(function(a,e){return a+e.amount_cents;},0);
  var est=S.expenses.filter(function(e){return e.status==="estimate";}).reduce(function(a,e){return a+e.amount_cents;},0)+addonCost;
  var costs=paid+committed+est,net=gross-refunded-fees,profit=net-costs,target=S.settings?S.settings.profit_target_cents:0;
  var avg=active.length?net/active.length:0;
  return {gross:gross,fees:fees,refunded:refunded,net:net,paid:paid,committed:committed,est:est,addonCost:addonCost,addonRev:addonRev,costs:costs,profit:profit,cash:net-paid,sold:active.length,checkedIn:active.filter(function(t){return t.checked_in_at;}).length,orders:S.orders.filter(function(o){return o.status==="paid";}).length,
    beGap:Math.max(0,costs-net),goalGap:Math.max(0,target-profit),target:target,ticketsToBE:avg>0?Math.ceil(Math.max(0,costs-net)/avg):null,ticketsToGoal:avg>0?Math.ceil(Math.max(0,target-profit)/avg):null,capacity:tiers().reduce(function(a,t){return a+t.capacity;},0)};
}
function rankings(){return S.fighters.map(function(f){var ts=S.tickets.filter(function(t){return t.status==="active"&&t.fighter_id===f.id;});return Object.assign({},f,{count:ts.length,value:ts.reduce(function(a,t){return a+t.paid_cents;},0)});}).sort(function(a,b){return b.count-a.count||b.value-a.value||(a.last_name||"").localeCompare(b.last_name||"");});}
function audit(msg){return sb.from("fn_audit").insert({message:msg,by_uid:session.user.id});}
function ticketUrl(t){return APP+"/ticket?t="+encodeURIComponent(t.token);}
function qrSvg(t){try{if(typeof window.qrcode!=="function")return "";var q=window.qrcode(0,"M");q.addData(ticketUrl(t));q.make();return '<div class="qr">'+q.createSvgTag({cellSize:3,margin:0,scalable:true})+'</div>';}catch(e){return "";}}
function ensureQr(cb){if(typeof window.qrcode==="function"){cb();return;}var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";s.onload=cb;s.onerror=cb;document.head.appendChild(s);}

/* ---------- paint ---------- */
function paint(){
  var m=$id("main");if(!m||view!=="fightnight")return;
  if(!isAdmin()){m.innerHTML='<div class="fnx"><button class="back" onclick="go(\'home\')">‹ Back</button><p>Nothing here.</p></div>';return;}
  var tabs=[["overview","Overview"],["sell","Sell"],["fighters","Fighters"],["tickets","Tickets"],["door","Door"],["costs","Costs"],["settings","Settings"]];
  m.innerHTML='<div class="fnx"><button class="back" onclick="go(\'home\')">‹ Home</button><div class="k">Fight Club · Sat 19 Dec</div><h2>Fight Night</h2><p class="sub">Tickets, fighters, door and money. Demo sales only for now: nothing is charged.</p>'
   +'<div class="tabs">'+tabs.map(function(t){return '<button class="'+(S.tab===t[0]?'on':'')+'" onclick="fnxTab(\''+t[0]+'\')">'+t[1]+'</button>';}).join("")+'</div><div id="fnxBody"></div></div>';
  var b=$id("fnxBody");
  ({overview:pOverview,sell:pSell,fighters:pFighters,tickets:pTickets,door:pDoor,costs:pCosts,settings:pSettings})[S.tab](b);
}
function stat(label,val,sub,cls){return '<div class="stat '+(cls||"")+'"><small>'+label+'</small><b>'+val+'</b><i>'+(sub||"")+'</i></div>';}

function pOverview(b){
  var m=metrics(),inv=inventory(),rk=rankings().slice(0,5);
  var pct=m.costs+m.target>0?Math.min(1,Math.max(0,m.net/(m.costs+m.target))):0;
  b.innerHTML='<div class="stats">'+stat("Active paid tickets",m.sold,(m.capacity-m.sold)+" left of "+m.capacity)+stat("Collected less refunds",money(m.gross-m.refunded),"before fees")+stat("All planned costs",money(m.costs),"paid + committed + estimates")+stat("Working profit",money(m.profit),"after fees and all listed costs · before tax",m.profit>=0?"good":"bad")+'</div>'
   +'<div class="card"><h3>Road to '+money(m.target)+' profit</h3><div class="row"><div><b style="font-family:Oswald,sans-serif;font-size:26px">'+exact(m.net)+'</b><small>Net collections after refunds and fees</small></div><div class="r">'+Math.round(pct*100)+'% of costs + goal</div></div><div class="bar g"><span style="width:'+(pct*100)+'%"></span></div>'
   +'<div class="row"><div><small>Still needed to break even</small><b>'+(m.beGap?exact(m.beGap)+(m.ticketsToBE?' · about '+m.ticketsToBE+' more tickets':''):'Covered ✓')+'</b></div><div class="r"><small>Still needed for the goal</small><b>'+(m.goalGap?exact(m.goalGap)+(m.ticketsToGoal?' · about '+m.ticketsToGoal+' tickets':''):'Goal hit ✓')+'</b></div></div>'
   +'<div class="row"><span>Collections</span><b>'+exact(m.gross)+'</b></div><div class="row"><span>Refunds</span><b>− '+exact(m.refunded)+'</b></div><div class="row"><span>Processing fees (demo 2% + 30c)</span><b>− '+exact(m.fees)+'</b></div><div class="row"><span>Paid bills</span><b>− '+exact(m.paid)+'</b></div><div class="row"><span>Cash left after paid bills</span><b>'+exact(m.cash)+'</b></div>'
   +'<p class="note">Cash left is not profit. Profit also deducts committed bills, estimates and the cost of fulfilling add-ons ('+exact(m.addonCost)+'). Add-ons have brought in '+exact(m.addonRev)+'.</p></div>'
   +'<div class="card"><h3>Tickets by experience</h3>'+inv.map(function(t){return '<div class="row"><div><b>'+esc(t.short)+'</b><small>'+exact(t.price_cents)+' per person · '+t.remaining+' left</small></div><div class="r">'+t.sold+' / '+t.capacity+'</div></div><div class="bar"><span style="width:'+(t.capacity?t.sold/t.capacity*100:0)+'%"></span></div>';}).join("")+'<div class="row"><span>Checked in at the door</span><b>'+m.checkedIn+' of '+m.sold+'</b></div></div>'
   +'<div class="card"><h3>Who\'s bringing the crowd</h3>'+(rk.length?rk.map(function(f,i){return lbRow(f,i);}).join(""):'<p class="note">No sales yet.</p>')+'<div class="btns"><button class="btn" onclick="fnxTab(\'fighters\')">All fighters ›</button></div></div>'
   +'<div class="card"><h3>Activity</h3><div class="feed">'+(S.audit.length?S.audit.slice(0,12).map(function(a){return '<div><span>'+esc(a.message)+'</span><time>'+esc(when(a.at))+'</time></div>';}).join(""):'<p class="note">Nothing yet.</p>')+'</div></div>';
}
function lbRow(f,i){var ph=f.photo_url?' style="background-image:url('+esc(f.photo_url)+')"':'';var fl=S.flash[f.id]&&Date.now()-S.flash[f.id]<6000;return '<div class="lb'+(fl?' flash':'')+'"><span class="rk">'+(i+1)+'</span><div class="av"'+ph+'>'+(f.photo_url?'':esc((f.first_name||"?")[0]))+'</div><div><b>'+esc(f.first_name+" "+f.last_name)+'</b><small>'+exact(f.value)+' in tickets</small></div><span class="ct">'+f.count+'</span></div>';}

function pSell(b){
  var inv=inventory(),s=S.sell,t=tier(s.tier),cur=inv.find(function(x){return x.id===s.tier;})||{remaining:0};
  var total=t.price_cents*s.qty;var ad=addons().filter(function(a){return a.enabled;});var adTotal=ad.filter(function(a){return s.addons[a.id];}).reduce(function(x,a){return x+a.price_cents*s.qty;},0);
  var q=(s.search||"").toLowerCase();var fl=S.fighters.filter(function(f){return !q||(f.first_name+" "+f.last_name).toLowerCase().indexOf(q)>=0;});
  var next=tiers().filter(function(x){return x.price_cents>t.price_cents;})[0];
  b.innerHTML=(S.last?lastSale():'')
   +'<div class="card"><h3>1 · Experience</h3>'+inv.map(function(x){return '<div class="tier'+(x.id===s.tier?' on':'')+(x.remaining<1?' out':'')+'" onclick="fnxSell(\'tier\',\''+x.id+'\')"><div><b>'+esc(x.short)+'</b><small>'+esc(x.name)+' · '+x.remaining+' left</small></div><span class="p">'+money(x.price_cents)+'</span></div>';}).join("")+'<p class="note">Prices are per person. Change them in Settings.</p></div>'
   +'<div class="card"><h3>2 · How many and for who</h3><label>Tickets</label><div class="step"><button onclick="fnxSell(\'qty\',-1)">−</button><b>'+s.qty+'</b><button onclick="fnxSell(\'qty\',1)">+</button></div>'
   +'<label>Who are they coming to see?</label><input type="text" placeholder="Search fighters…" value="'+esc(s.search)+'" oninput="fnxSell(\'search\',this.value)"><div style="height:6px"></div><select onchange="fnxSell(\'fighter\',this.value)"><option value="">Choose a fighter…</option><option value="none"'+(s.fighter==="none"?' selected':'')+'>Here for the night · no specific fighter</option>'+fl.map(function(f){return '<option value="'+f.id+'"'+(s.fighter===f.id?' selected':'')+'>'+esc(f.first_name+" "+f.last_name)+'</option>';}).join("")+'</select><p class="note">All '+s.qty+' ticket'+(s.qty>1?'s':'')+' count for this fighter on the leaderboard.</p>'
   +'<label>Buyer name</label><input type="text" placeholder="Full name" value="'+esc(s.name)+'" oninput="fnxSell(\'name\',this.value)"><label>Buyer email</label><input type="email" placeholder="name@example.com" value="'+esc(s.email)+'" oninput="fnxSell(\'email\',this.value)"></div>'
   +'<div class="card"><h3>3 · Add something to the night</h3>'+ad.map(function(a){return '<div class="addon'+(s.addons[a.id]?' on':'')+'" onclick="fnxSell(\'addon\',\''+a.id+'\')"><div class="cb"></div><div><b>'+esc(a.name)+'</b><small>'+esc(a.blurb)+'</small></div><span class="p">'+money(a.price_cents)+'</span></div>';}).join("")
   +(next?'<div class="warn">Want to get closer? '+esc(next.short)+' is '+money(next.price_cents-t.price_cents)+' more per person ('+money(next.price_cents*s.qty)+' total). <button class="btn" style="margin-left:6px" onclick="fnxSell(\'tier\',\''+next.id+'\')">Move up</button></div>':'')+'</div>'
   +'<div class="card"><h3>4 · Demo checkout</h3><div class="row"><span>'+s.qty+' × '+esc(t.short)+'</span><b>'+exact(total)+'</b></div>'+(adTotal?'<div class="row"><span>Add-ons</span><b>'+exact(adTotal)+'</b></div>':'')+'<div class="row"><span>Total</span><b style="font-family:Oswald,sans-serif;font-size:24px">'+exact(total+adTotal)+'</b></div>'
   +'<label>Simulated payment result</label><select onchange="fnxSell(\'outcome\',this.value)"><option value="paid"'+(s.outcome==="paid"?' selected':'')+'>Successful payment</option><option value="pending"'+(s.outcome==="pending"?' selected':'')+'>Pending · no tickets issued</option><option value="failed"'+(s.outcome==="failed"?' selected':'')+'>Failed · nothing issued</option></select>'
   +'<button class="go" id="fnxBuy" onclick="fnxBuy()" '+(cur.remaining<s.qty||S.busy?'disabled':'')+'>'+(S.busy?'Working…':'Record demo sale · '+money(total+adTotal))+'</button><p class="note">No card, no money. The live version will hand this step to the payment provider and only issue tickets once the charge is confirmed.</p></div>';
}
function lastSale(){
  var o=S.last;var ts=S.tickets.filter(function(t){return t.order_id===o.order_id;});
  return '<div class="card" style="border-color:#2d5d4e"><h3>'+(o.status==="paid"?'Sale recorded · '+esc(o.order_id):esc(o.status)+' payment recorded · '+esc(o.order_id))+'</h3>'
   +(o.status==="paid"?ts.map(ticketCard).join("")+'<p class="note">Each ticket has its own QR. Send it to the buyer, or open it to see what they see.</p>':'<div class="warn">No tickets issued and nothing counted as revenue.</div>')
   +'<div class="btns"><button class="btn" onclick="fnxLast(null)">Done</button></div></div>';
}
function ticketCard(t){
  var st=t.status==="refunded"?'<span class="st ref">Refunded</span>':t.checked_in_at?'<span class="st used">Admitted '+esc(when(t.checked_in_at))+'</span>':'<span class="st">Valid · scan at door</span>';
  var f=fighter(t.fighter_id);var ad=(t.addons||[]);
  return '<div class="tk" id="tk-'+esc(t.id)+'"><div class="top"><img src="'+LOGO+'" alt=""><div><small>LEGACY GYM KINCUMBER PRESENTS</small><b>Fight Night</b></div></div><div class="bd"><div class="g"><div><small>Experience</small>'+esc(tier(t.tier).short)+'</div><div><small>Holder</small>'+esc(t.holder_name)+'</div><div><small>In the corner of</small>'+esc(f?f.first_name+" "+f.last_name:"Here for the night")+'</div><div><small>Paid</small>'+exact(t.paid_cents)+(ad.length?' · '+ad.map(function(a){return esc(a.name);}).join(", "):'')+'</div></div>'
   +'<div class="qrrow">'+(t.status==="active"?qrSvg(t):'')+'<div><div class="code">'+esc(t.id)+'</div>'+st+'</div></div>'
   +'<div class="btns">'+(t.status==="active"?'<button class="btn gold" onclick="fnxSend(\''+t.id+'\')">Send ticket</button><a class="btn" href="'+ticketUrl(t)+'" target="_blank" rel="noopener">Open</a><button class="btn" onclick="fnxShare(\''+t.id+'\')">Share</button>':'')
   +(t.status==="active"&&!t.checked_in_at?'<button class="btn" onclick="fnxUpgrade(\''+t.id+'\')">Upgrade</button><button class="btn" onclick="fnxAddon(\''+t.id+'\')">Add-on</button>':'')
   +(t.status==="active"?'<button class="btn red" onclick="fnxRefund(\''+t.id+'\')">Refund</button>':'')+'</div></div></div>';
}

function pFighters(b){
  var rk=rankings();
  b.innerHTML='<div class="card"><h3>Leaderboard · live</h3>'+rk.slice(0,10).map(function(f,i){return lbRow(f,i);}).join("")+'<p class="note">Lights up the moment a ticket sells for a fighter, on every phone that has this open.</p></div>'
   +'<div class="fgrid">'+rk.map(function(f){var ph=f.photo_url?' style="background-image:url('+esc(f.photo_url)+')"':'';var rec=(f.wins||0)+"-"+(f.losses||0)+(f.draws?"-"+f.draws:"");return '<div class="fc'+(S.flash[f.id]&&Date.now()-S.flash[f.id]<6000?' flash':'')+'" id="fc-'+f.id+'"><div class="ph"'+ph+'>'+(f.photo_url?'':esc((f.first_name||"?")[0]))+'</div><span class="n">#'+(f.camp_number||"–")+'</span><span class="t">'+f.count+'</span><div class="in"><b>'+esc(f.first_name+" "+f.last_name)+'</b><small>'+esc(f.stance||"")+(f.stance?' · ':'')+rec+' · '+exact(f.value)+'</small><div class="btns"><button class="btn gold" onclick="fnxSellFor(\''+f.id+'\')">Sell a ticket</button></div></div></div>';}).join("")+'</div>';
}
function pTickets(b){
  var q=(S.tq||"").toLowerCase();
  var rows=S.tickets.filter(function(t){var o=S.orders.find(function(x){return x.id===t.order_id;})||{};var hay=(t.id+" "+t.holder_name+" "+(o.email||"")+" "+fname(t.fighter_id)).toLowerCase();if(q&&hay.indexOf(q)<0)return false;if(S.tfilter==="active")return t.status==="active"&&!t.checked_in_at;if(S.tfilter==="in")return !!t.checked_in_at;if(S.tfilter==="refunded")return t.status==="refunded";return true;});
  var pend=S.orders.filter(function(o){return o.status!=="paid";});
  b.innerHTML='<div class="card"><input type="text" placeholder="Search name, email, code, fighter…" value="'+esc(S.tq)+'" oninput="fnxTq(this.value)"><div class="chips" style="margin-top:8px">'+[["all","All"],["active","Not yet in"],["in","Checked in"],["refunded","Refunded"]].map(function(c){return '<span class="chip'+(S.tfilter===c[0]?' on':'')+'" onclick="fnxTf(\''+c[0]+'\')">'+c[1]+'</span>';}).join("")+'</div><p class="note">'+rows.length+' ticket'+(rows.length===1?'':'s')+' · '+S.orders.length+' orders'+(pend.length?' · '+pend.length+' pending/failed (no tickets)':'')+'</p></div>'
   +(rows.length?rows.slice(0,60).map(ticketCard).join(""):'<div class="card"><p class="note">No tickets match. Record a demo sale under Sell.</p></div>');
}
function pDoor(b){
  var m=metrics(),r=S.door.result;
  b.innerHTML='<div class="card"><h3>Scan a ticket</h3><div class="cam"><video id="fnxVid" playsinline muted></video><div class="frame"></div><div class="hint" id="fnxHint">'+(S.door.scanning?'Point at the QR code':'Tap Start camera')+'</div></div>'
   +'<div class="btns"><button class="btn gold" id="fnxCamBtn" onclick="fnxCam()">'+(S.door.scanning?'Stop camera':'Start camera')+'</button></div>'
   +'<label>Or type the code</label><div style="display:flex;gap:6px"><input type="text" placeholder="FN26-XXXX-XX" value="'+esc(S.door.code)+'" oninput="S_fnx.door.code=this.value" style="font-family:ui-monospace,Menlo,monospace;text-transform:uppercase"><button class="btn gold" style="flex:none" onclick="fnxCheck()">Check</button></div>'
   +'<div id="fnxRes">'+resultHtml(r)+'</div></div>'
   +'<div class="stats"><div class="stat"><small>Admitted</small><b>'+m.checkedIn+'</b></div><div class="stat"><small>Still to come</small><b>'+(m.sold-m.checkedIn)+'</b></div></div>'
   +'<div class="card"><h3>Last through the door</h3><div class="feed">'+S.tickets.filter(function(t){return t.checked_in_at;}).sort(function(a,b){return a.checked_in_at<b.checked_in_at?1:-1;}).slice(0,10).map(function(t){return '<div><span>'+esc(t.holder_name)+' · '+esc(tier(t.tier).short)+'</span><time>'+esc(when(t.checked_in_at))+'</time></div>';}).join("")+'</div></div>';
  if(S.door.scanning)startCam();
}
function resultHtml(r){
  if(!r)return '<p class="note">Point the camera at a ticket, or type its code. One scan admits once; a second scan of the same ticket is refused.</p>';
  var ok=r.result==="admit";var tk=r.ticket||{};
  var title=ok?'ADMIT':'DO NOT ADMIT';var sub=ok?esc(tk.holder||"")+' · '+esc(tk.tier||""):esc(r.message||"");
  var meta=ok?('In the corner of '+esc(tk.fighter||"no one in particular")+'<br>'+esc(tk.id||"")+((tk.addons&&tk.addons.length)?'<br>Add-ons: '+tk.addons.map(function(a){return esc(a.name);}).join(", "):'')):((tk.id?esc(tk.id)+' · '+esc(tk.holder||"")+(r.at?' · first scan '+esc(when(r.at)):''):''));
  return '<div class="res'+(ok?'':' bad')+'"><div class="big">'+title+'</div><div class="who">'+sub+'</div><div class="m">'+meta+'</div></div>';
}
function pCosts(b){
  var m=metrics();var groups=[["paid","Paid"],["committed","Committed · not paid yet"],["estimate","Estimates"]];
  b.innerHTML='<div class="stats"><div class="stat"><small>Paid</small><b>'+money(m.paid)+'</b></div><div class="stat"><small>Committed</small><b>'+money(m.committed)+'</b></div><div class="stat"><small>Estimates</small><b>'+money(m.est)+'</b><i>incl. add-on fulfilment '+money(m.addonCost)+'</i></div><div class="stat bad"><small>All planned costs</small><b>'+money(m.costs)+'</b></div></div>'
   +'<div class="card"><h3>'+(S.costEdit&&S.costEdit.id?'Edit cost':'Add a cost')+'</h3><label>What</label><input type="text" id="fnxCL" placeholder="e.g. Sound and lighting" value="'+esc(S.costEdit?S.costEdit.label:'')+'"><label>Category</label><select id="fnxCC">'+["Venue","Production","Medical","Security","Staff","Insurance","Food & drink","Merch","Marketing","Other"].map(function(c){return '<option'+(S.costEdit&&S.costEdit.category===c?' selected':'')+'>'+c+'</option>';}).join("")+'</select><label>Amount (AUD)</label><input type="number" id="fnxCA" inputmode="decimal" step="0.01" min="0" placeholder="0.00" value="'+(S.costEdit?(S.costEdit.amount_cents/100).toFixed(2):'')+'"><label>Status</label><select id="fnxCS">'+groups.map(function(g){return '<option value="'+g[0]+'"'+(S.costEdit&&S.costEdit.status===g[0]?' selected':'')+'>'+g[1]+'</option>';}).join("")+'</select><div class="btns"><button class="btn gold" onclick="fnxCostSave()">'+(S.costEdit&&S.costEdit.id?'Save':'Add cost')+'</button>'+(S.costEdit?'<button class="btn" onclick="S_fnx.costEdit=null;fnxPaint()">Cancel</button>':'')+'</div></div>'
   +groups.map(function(g){var list=S.expenses.filter(function(e){return e.status===g[0];});var tot=list.reduce(function(a,e){return a+e.amount_cents;},0);return '<div class="card"><h3>'+g[1]+' · '+money(tot)+'</h3>'+(list.length?list.map(function(e){return '<div class="row"><div><b>'+esc(e.label)+'</b><small>'+esc(e.category)+'</small></div><div class="r"><b>'+exact(e.amount_cents)+'</b><div class="btns" style="justify-content:flex-end;margin-top:4px">'+(e.status!=="paid"?'<button class="btn" onclick="fnxCostPaid('+e.id+')">Mark paid</button>':'')+'<button class="btn" onclick="fnxCostEdit('+e.id+')">Edit</button><button class="btn red" onclick="fnxCostDel('+e.id+')">Remove</button></div></div></div>';}).join(""):'<p class="note">None.</p>')+'</div>';}).join("")
   +'<p class="note">Marking a bill paid moves money out of "cash left"; it does not change total planned costs or working profit. Add-on fulfilment cost is counted automatically from the add-ons sold.</p>';
}
function pSettings(b){
  var s=S.settings;
  b.innerHTML='<div class="card"><h3>Ticket prices and capacity</h3>'+tiers().map(function(t,i){return '<div class="row"><div><b>'+esc(t.short)+'</b><small>'+esc(t.name)+'</small></div><div class="r" style="display:flex;gap:6px"><input type="number" style="width:88px" id="fnxP'+i+'" value="'+(t.price_cents/100).toFixed(2)+'" step="0.01" min="1" placeholder="Price"><input type="number" style="width:72px" id="fnxC'+i+'" value="'+t.capacity+'" step="1" min="0" placeholder="Cap"></div></div>';}).join("")+'<label>Profit goal (AUD)</label><input type="number" id="fnxGoal" value="'+(s.profit_target_cents/100).toFixed(0)+'" step="100" min="0"><div class="btns"><button class="btn gold" onclick="fnxSaveSettings()">Save</button></div><p class="note">Changing a price never rewrites what people already paid. Capacity can\'t go below tickets already sold.</p></div>'
   +'<div class="card"><h3>Add-ons</h3>'+addons().map(function(a,i){return '<div class="row"><div><b>'+esc(a.name)+'</b><small>'+esc(a.blurb)+'</small></div><div class="r" style="display:flex;gap:6px;align-items:center"><input type="number" style="width:80px" id="fnxAP'+i+'" value="'+(a.price_cents/100).toFixed(2)+'" step="0.01" min="0" title="Price"><input type="number" style="width:70px" id="fnxAC'+i+'" value="'+((a.cost_cents||0)/100).toFixed(2)+'" step="0.01" min="0" title="Our cost"><input type="number" style="width:64px" id="fnxAS'+i+'" value="'+a.stock+'" step="1" min="0" title="Stock"><span class="chip'+(a.enabled?' on':'')+'" onclick="fnxAddonTog('+i+')">'+(a.enabled?'On':'Off')+'</span></div></div>';}).join("")+'<p class="note">Price · our cost · stock. Cost is what it costs us to deliver, so profit stays honest.</p><div class="btns"><button class="btn gold" onclick="fnxSaveSettings()">Save</button></div></div>'
   +'<div class="card"><h3>Demo data</h3><p class="note">Everything in here is demo data until the payment provider is wired in. Reset clears orders, tickets, payments and refunds. Costs stay.</p><div class="btns"><button class="btn" onclick="fnxSeed()">Add 20 sample sales</button><button class="btn red" onclick="fnxReset()">Reset demo sales</button></div></div>'
   +'<div class="card"><h3>Who can see this</h3><p class="note">Jake, Alison and Kelly. Nobody else sees the home-screen card or can read these tables (enforced in the database, not just hidden).</p></div>';
}

/* ---------- actions ---------- */
window.S_fnx=S;window.fnxPaint=paint;
window.fnxTab=function(t){if(S.tab==="door"&&t!=="door")stopCam();S.tab=t;paint();window.scrollTo(0,0);};
window.fnxSell=function(k,v){var s=S.sell;if(k==="tier")s.tier=v;else if(k==="qty")s.qty=Math.max(1,Math.min(10,s.qty+v));else if(k==="search"){s.search=v;}else if(k==="fighter")s.fighter=v||null;else if(k==="name")s.name=v;else if(k==="email")s.email=v;else if(k==="outcome")s.outcome=v;else if(k==="addon")s.addons[v]=!s.addons[v];
  if(k==="search"){var sel=document.querySelector("#fnxBody select");if(sel){var q=v.toLowerCase();sel.innerHTML='<option value="">Choose a fighter…</option><option value="none"'+(s.fighter==="none"?' selected':'')+'>Here for the night · no specific fighter</option>'+S.fighters.filter(function(f){return !q||(f.first_name+" "+f.last_name).toLowerCase().indexOf(q)>=0;}).map(function(f){return '<option value="'+f.id+'"'+(s.fighter===f.id?' selected':'')+'>'+esc(f.first_name+" "+f.last_name)+'</option>';}).join("");}return;}
  if(k==="name"||k==="email")return;paint();};
window.fnxSellFor=function(id){S.sell.fighter=id;S.sell.search="";S.tab="sell";paint();window.scrollTo(0,0);T("Selling for "+fname(id));};
window.fnxLast=function(v){S.last=v;paint();};
window.fnxBuy=async function(){
  var s=S.sell;if(!s.fighter){T("Choose who they're coming to see, or 'Here for the night'.");return;}
  if(!s.name.trim()||!/^\S+@\S+\.\S+$/.test(s.email)){T("Enter the buyer's name and a valid email.");return;}
  S.busy=true;paint();
  var r=await sb.rpc("fn_purchase",{p_tier:s.tier,p_qty:s.qty,p_fighter:s.fighter==="none"?null:s.fighter,p_name:s.name.trim(),p_email:s.email.trim(),p_status:s.outcome});
  if(r.error){S.busy=false;paint();T(r.error.message);return;}
  var o=r.data;var want=Object.keys(s.addons).filter(function(k){return s.addons[k];});
  if(o.status==="paid"&&want.length){for(var i=0;i<o.tickets.length;i++){for(var j=0;j<want.length;j++){var a=await sb.rpc("fn_addon",{p_ticket:o.tickets[i].id,p_addon:want[j]});if(a.error)T(a.error.message);}}}
  S.busy=false;S.last=o;S.sell.name="";S.sell.email="";S.sell.addons={};S.sell.outcome="paid";
  await load();ensureQr(paint);window.scrollTo(0,0);T(o.status==="paid"?o.tickets.length+" ticket"+(o.tickets.length>1?"s":"")+" issued.":"Recorded as "+o.status+". No tickets issued.");
};
window.fnxUpgrade=async function(id){var t=S.tickets.find(function(x){return x.id===id;});if(!t)return;var opts=tiers().filter(function(x){return x.price_cents>t.base_cents;});if(!opts.length){T("Already in the top category.");return;}
  var pick=prompt("Upgrade "+id+" to:\n"+opts.map(function(x,i){return (i+1)+". "+x.short+" · +"+money(x.price_cents-t.base_cents);}).join("\n")+"\n\nType the number:");var o=opts[parseInt(pick,10)-1];if(!o)return;
  var r=await sb.rpc("fn_upgrade",{p_ticket:id,p_tier:o.id});if(r.error){T(r.error.message);return;}await load();ensureQr(paint);T("Upgraded. Charged "+money(r.data.charged_cents)+" extra.");};
window.fnxAddon=async function(id){var t=S.tickets.find(function(x){return x.id===id;});if(!t)return;var have=(t.addons||[]).map(function(a){return a.id;});var opts=addons().filter(function(a){return a.enabled&&have.indexOf(a.id)<0;});if(!opts.length){T("Every add-on is already on this ticket.");return;}
  var pick=prompt("Add to "+id+":\n"+opts.map(function(a,i){return (i+1)+". "+a.name+" · "+money(a.price_cents);}).join("\n")+"\n\nType the number:");var a=opts[parseInt(pick,10)-1];if(!a)return;
  var r=await sb.rpc("fn_addon",{p_ticket:id,p_addon:a.id});if(r.error){T(r.error.message);return;}await load();ensureQr(paint);T(a.name+" added. +"+money(a.price_cents)+".");};
window.fnxRefund=async function(id){var t=S.tickets.find(function(x){return x.id===id;});if(!t)return;if(!confirm("Refund "+id+" for "+exact(t.paid_cents)+"? The ticket stops working at the door."))return;var r=await sb.rpc("fn_refund",{p_ticket:id});if(r.error){T(r.error.message);return;}await load();ensureQr(paint);T("Refunded "+exact(r.data.refunded_cents)+". Admission revoked.");};
window.fnxShare=async function(id){var t=S.tickets.find(function(x){return x.id===id;});if(!t)return;var u=ticketUrl(t);try{if(navigator.share){await navigator.share({title:"Fight Night ticket · "+t.holder_name,text:"Your Fight Night ticket",url:u});return;}}catch(e){}try{await navigator.clipboard.writeText(u);T("Ticket link copied.");}catch(e){prompt("Ticket link:",u);}};
window.fnxSend=async function(id){var t=S.tickets.find(function(x){return x.id===id;});if(!t)return;var o=S.orders.find(function(x){return x.id===t.order_id;})||{};var to=prompt("Email this ticket to:",o.email||"");if(!to||!/^\S+@\S+\.\S+$/.test(to))return;
  T("Sending…");try{var tok=(await sb.auth.getSession()).data.session.access_token;var r=await fetch("/api/fn-ticket-email",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token:tok,ticket_token:t.token,to:to.trim()})});var j=await r.json();if(j.sent){T("Sent to "+to+".");audit("Ticket "+t.id+" emailed to "+to.trim());}else if(j.skipped==="not_configured"){mailFallback(t,to.trim());}else T("Email not sent: "+(j.skipped||j.error||j.detail||"unknown"));}catch(e){mailFallback(t,to.trim());}};
function mailFallback(t,to){var f=fighter(t.fighter_id);var body="Hey "+t.holder_name+",\n\nHere's your ticket for Fight Club Fight Night at Legacy Gym, Kincumber.\n\nOpen your ticket: "+ticketUrl(t)+"\n\nSat 19 Dec 2026 · Doors 6:00 PM · First bell 7:00 PM\nExperience: "+tier(t.tier).short+"\n"+(f?"In the corner of: "+f.first_name+" "+f.last_name+"\n":"")+"Admission code: "+t.id+"\n\nShow the QR code on that page at the door. One scan, one entry.\n\n(Demonstration ticket. No payment has been taken.)\n\n— Legacy Gym · Fight Club Central Coast";T("Email sending isn't switched on yet, so I've opened it in your Mail app instead.");location.href="mailto:"+encodeURIComponent(to)+"?subject="+encodeURIComponent("Your Fight Night ticket · "+tier(t.tier).short+" · "+t.id)+"&body="+encodeURIComponent(body);}
window.fnxTq=function(v){S.tq=v;var b=$id("fnxBody");if(b){var keep=document.activeElement;pTickets(b);var inp=b.querySelector("input[type=text]");if(inp&&keep&&keep.tagName==="INPUT"){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}}};
window.fnxTf=function(v){S.tfilter=v;paint();};
/* door */
var cam={stream:null,timer:null,det:null,lock:0};
function stopCam(){S.door.scanning=false;if(cam.timer)clearInterval(cam.timer);cam.timer=null;if(cam.stream){cam.stream.getTracks().forEach(function(t){t.stop();});cam.stream=null;}}
async function startCam(){
  var v=$id("fnxVid");if(!v)return;
  try{cam.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});v.srcObject=cam.stream;await v.play();}catch(e){S.door.scanning=false;T("Camera not available: "+e.message+". Type the code instead.");paint();return;}
  if("BarcodeDetector" in window){try{cam.det=new window.BarcodeDetector({formats:["qr_code"]});}catch(e){cam.det=null;}}
  if(!cam.det&&typeof window.jsQR!=="function"){await new Promise(function(res){var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js";s.onload=res;s.onerror=res;document.head.appendChild(s);});}
  var cv=document.createElement("canvas"),cx=cv.getContext("2d",{willReadFrequently:true});
  if(cam.timer)clearInterval(cam.timer);
  cam.timer=setInterval(async function(){
    if(!S.door.scanning||!cam.stream||Date.now()<cam.lock||v.readyState<2)return;var val=null;
    try{if(cam.det){var codes=await cam.det.detect(v);if(codes&&codes[0])val=codes[0].rawValue;}else if(window.jsQR){cv.width=v.videoWidth;cv.height=v.videoHeight;cx.drawImage(v,0,0);var d=cx.getImageData(0,0,cv.width,cv.height);var q=window.jsQR(d.data,d.width,d.height,{inversionAttempts:"dontInvert"});if(q)val=q.data;}}catch(e){}
    if(val){cam.lock=Date.now()+3000;try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}check(val);}
  },350);
}
async function check(code){
  code=String(code||"").trim();if(!code){T("Type or scan a code first.");return;}
  var r=await sb.rpc("fn_checkin",{p_code:code});
  if(r.error){T(r.error.message);return;}
  S.door.result=r.data;S.door.code="";var el=$id("fnxRes");if(el)el.innerHTML=resultHtml(r.data);
  try{navigator.vibrate&&navigator.vibrate(r.data.result==="admit"?[40,40,40]:[200]);}catch(e){}
  await load();var m=metrics();var st=document.querySelectorAll("#fnxBody .stat b");if(st[0])st[0].textContent=m.checkedIn;if(st[1])st[1].textContent=m.sold-m.checkedIn;
}
window.fnxCam=function(){if(S.door.scanning){stopCam();paint();}else{S.door.scanning=true;paint();}};
window.fnxCheck=function(){check(S.door.code);};
/* costs */
window.fnxCostSave=async function(){var label=$id("fnxCL").value.trim(),cat=$id("fnxCC").value,amt=Math.round(parseFloat($id("fnxCA").value||"0")*100),st=$id("fnxCS").value;if(!label){T("Give the cost a name.");return;}if(!(amt>=0)){T("Enter an amount.");return;}
  var row={label:label,category:cat,amount_cents:amt,status:st,updated_at:new Date().toISOString()};var r=S.costEdit&&S.costEdit.id?await sb.from("fn_expenses").update(row).eq("id",S.costEdit.id):await sb.from("fn_expenses").insert(row);
  if(r.error){T(r.error.message);return;}await audit((S.costEdit&&S.costEdit.id?"Cost updated · ":"Cost added · ")+label+" · "+exact(amt)+" · "+st);S.costEdit=null;await load();paint();T("Saved.");};
window.fnxCostEdit=function(id){S.costEdit=S.expenses.find(function(e){return e.id===id;});paint();window.scrollTo(0,0);};
window.fnxCostPaid=async function(id){var e=S.expenses.find(function(x){return x.id===id;});var r=await sb.from("fn_expenses").update({status:"paid",updated_at:new Date().toISOString()}).eq("id",id);if(r.error){T(r.error.message);return;}await audit("Cost marked paid · "+e.label);await load();paint();};
window.fnxCostDel=async function(id){var e=S.expenses.find(function(x){return x.id===id;});if(!confirm("Remove "+e.label+"?"))return;var r=await sb.from("fn_expenses").delete().eq("id",id);if(r.error){T(r.error.message);return;}await audit("Cost removed · "+e.label);await load();paint();};
/* settings */
window.fnxAddonTog=function(i){S.settings.addons[i].enabled=!S.settings.addons[i].enabled;paint();};
window.fnxSaveSettings=async function(){
  var inv=inventory();var t=tiers().map(function(x,i){var p=Math.round(parseFloat($id("fnxP"+i).value||"0")*100),c=parseInt($id("fnxC"+i).value||"0",10);return Object.assign({},x,{price_cents:p,capacity:c});});
  for(var i=0;i<t.length;i++){if(!(t[i].price_cents>0)){T("Prices must be above zero.");return;}if(t[i].capacity<inv[i].sold){T(t[i].short+" capacity can't go below "+inv[i].sold+" sold.");return;}}
  if(!(t[0].price_cents<t[1].price_cents&&t[1].price_cents<t[2].price_cents)){T("Keep Standard, Ringside bar and Ringside table in increasing price order.");return;}
  var ad=addons().map(function(a,i){return Object.assign({},a,{price_cents:Math.round(parseFloat($id("fnxAP"+i).value||"0")*100),cost_cents:Math.round(parseFloat($id("fnxAC"+i).value||"0")*100),stock:parseInt($id("fnxAS"+i).value||"0",10)});});
  var goal=Math.round(parseFloat($id("fnxGoal").value||"0")*100);
  var r=await sb.from("fn_settings").update({tiers:t,addons:ad,profit_target_cents:goal,updated_at:new Date().toISOString()}).eq("id",1);if(r.error){T(r.error.message);return;}await audit("Settings updated");await load();paint();T("Saved.");};
window.fnxReset=async function(){if(!confirm("Clear every demo order, ticket, payment and refund? Costs stay."))return;
  var steps=[["fn_refunds","id"],["fn_payments","id"],["fn_tickets","id"],["fn_orders","id"],["fn_audit","id"]];
  for(var i=0;i<steps.length;i++){var r=await sb.from(steps[i][0]).delete().not(steps[i][1],"is",null);if(r.error){T(r.error.message);return;}}
  S.last=null;await audit("Demo sales reset");await load();paint();T("Demo sales cleared.");};
window.fnxSeed=async function(){if(!confirm("Add 20 sample demo sales spread across the fighters?"))return;S.busy=true;paint();var fs=S.fighters;var tl=["standard","standard","standard","bar","bar","table"];var n=0;
  for(var i=0;i<20;i++){var f=fs[(i*7+3)%fs.length];var r=await sb.rpc("fn_purchase",{p_tier:tl[i%tl.length],p_qty:1+(i%4),p_fighter:i%9===0?null:f.id,p_name:"Demo Guest "+String(i+1).padStart(3,"0"),p_email:"guest"+(i+1)+"@example.invalid",p_status:"paid"});if(!r.error)n++;}
  S.busy=false;await load();paint();T(n+" sample sales added.");};
window.fnxEnter=function(){if(!isAdmin()){T("Not for you, sorry.");return;}go("fightnight");};

/* ---------- hooks ---------- */
var _render=window.render;window.render=function(){if(view==="fightnight"){var m=$id("main");if(m&&!S.loaded)m.innerHTML='<div class="loadingDots">Opening Fight Night…</div>';load().then(function(){ensureQr(paint);});return;}if(S.door.scanning)stopCam();return _render.apply(this,arguments);};
function homeCard(){
  if(view!=="home"||!isAdmin())return;var m=$id("main");if(!m||$id("fnxHome"))return;
  var b=document.createElement("button");b.id="fnxHome";b.onclick=window.fnxEnter;
  b.innerHTML='<img src="'+LOGO+'" alt=""><div><div class="k">Fight Night · Sat 19 Dec</div><div class="t">Tickets, fighters, door &amp; costs</div><div class="s">Staff only · Jake, Alison, Kelly</div></div><span class="a">Open ›</span>';
  var root=$id("lgh2");if(root)root.insertAdjacentElement("afterbegin",b);else{var first=m.querySelector(".homeCard");if(first)first.insertAdjacentElement("beforebegin",b);else m.insertAdjacentElement("afterbegin",b);}
}
var _home=window.renderHome;if(typeof _home==="function"){window.renderHome=function(){var r=_home.apply(this,arguments);try{homeCard();setTimeout(homeCard,120);setTimeout(homeCard,600);}catch(e){}return r;};}
setInterval(function(){try{if(view==="home")homeCard();}catch(e){}},1500);
})();
