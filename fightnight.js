/* ===== Fight Night HQ · tickets, sellers, door, money, suppliers (v2, 14 Oct 2026) =====
   Visible to Jake, Alison and Kelly only (RLS: fn_is_admin()). Tables fn_* in Supabase.
   Sales here are DEMO sales: no money moves. Ledger logic (capacity, upgrades, add-ons, refunds,
   check-in) runs server-side in fn_purchase / fn_upgrade / fn_addon / fn_refund / fn_checkin. */
(function(){
"use strict";
var ADMINS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce","09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb"]; /* Jake, Alison, Kelly */
var NAMES={"15a011b9-e222-45f0-8eb9-d5338da935d1":"Jake","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce":"Alison","09e6788d-f0cd-4c7a-a0b0-2dd9db75bbeb":"Kelly"};
function isAdmin(){try{return !!(session&&session.user&&ADMINS.indexOf(session.user.id)>=0);}catch(e){return false;}}
function me(){try{return NAMES[session.user.id]||"Staff";}catch(e){return "Staff";}}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function money(c){var n=(c||0)/100;return (n<0?"−":"")+"$"+Math.abs(n).toLocaleString("en-AU",{minimumFractionDigits:0,maximumFractionDigits:0});}
function exact(c){var n=(c||0)/100;return (n<0?"−":"")+"$"+Math.abs(n).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2});}
function when(iso){if(!iso)return "";return new Date(iso).toLocaleString("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});}
function dmy(d){if(!d)return "";var p=String(d).slice(0,10).split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:d;}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
var APP="https://legacygym-app.vercel.app";
var LOGO=APP+"/img/fc/fc-logo.png";

var S={tab:"overview",loaded:false,busy:false,settings:null,fighters:[],orders:[],tickets:[],payments:[],refunds:[],expenses:[],suppliers:[],audit:[],
  sell:{open:false,tier:"bar",qty:2,fighter:null,search:"",name:"",email:"",outcome:"paid",addons:{}},last:null,
  tq:"",tfilter:"all",door:{result:null,code:"",scanning:false},flash:{},chan:null,costEdit:null,costOpen:false,
  sup:{filter:"all",edit:null,q:""}};

/* ---------- CSS ---------- */
var css=document.createElement("style");css.textContent=
".fnx{max-width:720px;margin:0 auto;padding-bottom:48px;--gold:#C9A44C;--gold2:#F1D27A;--ink:#f2f0eb;--mute:#9a958a;--line:#2a261c;--panel:#131109;--panel2:#0d0b07;--green:#39FF88;--red:#ff8c98;--amber:#f5b942;--blue:#8fb4ff}"
+".fnx *{box-sizing:border-box}.fnx .back{background:none;border:0;color:var(--gold);font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 10px;cursor:pointer;font-family:inherit}"
+".fnx .hd{display:flex;align-items:center;gap:12px;margin-bottom:12px}.fnx .hd img{height:46px}.fnx .hd .k{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--gold)}.fnx .hd h2{font-family:Oswald,sans-serif;font-size:30px;letter-spacing:1px;text-transform:uppercase;line-height:1;margin:2px 0 0}.fnx .hd .live{margin-left:auto;font-size:9.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--green);display:flex;align-items:center;gap:6px}.fnx .hd .live:before{content:'';width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)}"
+".fnx .nav{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;padding:4px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;margin-bottom:14px}@media(max-width:600px){.fnx .nav{grid-template-columns:repeat(4,1fr)}}.fnx .nav button{border:0;background:transparent;color:var(--mute);border-radius:10px;padding:10px 4px;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:.8px;text-transform:uppercase;cursor:pointer;white-space:nowrap}.fnx .nav button.on{background:var(--gold);color:#161307}.fnx .nav button .n{display:inline-block;min-width:18px;padding:1px 5px;margin-left:5px;border-radius:99px;background:#2a2211;color:var(--gold2);font-size:10px;font-family:Montserrat,sans-serif;font-weight:800;vertical-align:1px}.fnx .nav button.on .n{background:#161307;color:var(--gold2)}"
+".fnx .card{border:1px solid var(--line);background:linear-gradient(160deg,#16130a,#0d0b07);border-radius:16px;padding:16px;margin-bottom:12px}.fnx .card h3{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--gold2);margin:0 0 12px}.fnx .card h3 span{font-weight:700;letter-spacing:0;text-transform:none;color:var(--mute);font-size:11px}"
+".fnx .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}@media(max-width:560px){.fnx .kpis{grid-template-columns:1fr 1fr}}.fnx .kpi{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:12px 12px 10px;position:relative;overflow:hidden}.fnx .kpi small{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute);font-weight:800}.fnx .kpi b{display:block;font-family:Oswald,sans-serif;font-size:28px;line-height:1.05;margin:7px 0 3px;color:#fff;font-variant-numeric:tabular-nums}.fnx .kpi i{display:block;font-style:normal;font-size:10.5px;color:var(--mute)}.fnx .kpi.good b{color:var(--green)}.fnx .kpi.bad b{color:var(--red)}.fnx .kpi.gold b{color:var(--gold2)}"
+".fnx .meter{position:relative;height:14px;background:#221d12;border-radius:99px;overflow:hidden;margin:10px 0 6px}.fnx .meter span{position:absolute;left:0;top:0;height:100%;border-radius:99px;background:linear-gradient(90deg,#8d6f22,var(--gold2));transition:width .5s}.fnx .meter span.g{background:linear-gradient(90deg,#1f8a5c,var(--green))}.fnx .meter .be{position:absolute;top:-3px;bottom:-3px;width:2px;background:#fff;opacity:.8}.fnx .legend{display:flex;justify-content:space-between;font-size:10.5px;color:var(--mute);font-weight:700}"
+".fnx .row{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:13px;color:#d9d3c3;padding:9px 0;border-bottom:1px solid #1f1b12}.fnx .row:last-child{border:0}.fnx .row b{color:#fff;font-variant-numeric:tabular-nums}.fnx .row small{display:block;color:var(--mute);font-size:10.5px;margin-top:2px}.fnx .row .r{text-align:right;flex:none}.fnx .row.tot{border-top:1px solid var(--line);margin-top:4px;padding-top:12px}.fnx .row.tot b{font-family:Oswald,sans-serif;font-size:22px}"
+".fnx .tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}@media(max-width:560px){.fnx .tiers{grid-template-columns:1fr}}.fnx .tier{border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--panel);cursor:pointer;position:relative}.fnx .tier.on{border-color:var(--gold2);background:#2a2211}.fnx .tier.out{opacity:.5}.fnx .tier small{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute);font-weight:800}.fnx .tier b{display:block;font-family:Oswald,sans-serif;font-size:17px;text-transform:uppercase;letter-spacing:.3px;margin-top:4px;line-height:1.1}.fnx .tier .p{font-family:Oswald,sans-serif;font-size:30px;color:var(--gold2);line-height:1;margin:8px 0 6px}.fnx .tier .bar{height:5px;background:#221d12;border-radius:99px;overflow:hidden}.fnx .tier .bar span{display:block;height:100%;background:var(--gold)}.fnx .tier i{display:block;font-style:normal;font-size:10.5px;color:var(--mute);margin-top:5px}"
+".fnx label{display:block;font-size:10.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:#cfc6b0;margin:12px 0 6px}.fnx input[type=text],.fnx input[type=email],.fnx input[type=number],.fnx input[type=date],.fnx input[type=tel],.fnx select,.fnx textarea{width:100%;box-sizing:border-box;background:#0e0c08;border:1px solid #3a3320;border-radius:10px;color:#f2f0eb;padding:11px 12px;font-family:inherit;font-size:14px;color-scheme:dark}.fnx select{appearance:auto}.fnx textarea{min-height:70px;resize:vertical}.fnx .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}"
+".fnx .step{display:flex;align-items:center;justify-content:space-between;border:1px solid #3a3320;border-radius:12px;padding:5px;background:#0e0c08}.fnx .step button{border:0;background:#2a2211;color:var(--gold2);font-size:22px;width:46px;height:40px;border-radius:9px;cursor:pointer;font-family:inherit}.fnx .step b{font-family:Oswald,sans-serif;font-size:22px}"
+".fnx .go{display:block;width:100%;margin-top:12px;background:linear-gradient(180deg,#ffe58a,#f4c95d 48%,#b8860b 52%,#ffd76a);color:#1a1200;border:0;border-radius:12px;padding:14px;font-family:Oswald,sans-serif;font-weight:700;font-size:17px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}.fnx .go:disabled{opacity:.5}"
+".fnx .btn{background:#141210;border:1px solid #3a3320;color:var(--gold2);border-radius:9px;padding:9px 12px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:.5px;text-decoration:none;display:inline-block}.fnx .btn.gold{background:var(--gold);border-color:var(--gold);color:#161307}.fnx .btn.red{color:var(--red);border-color:#5a2a30}.fnx .btn:disabled{opacity:.5}.fnx .btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}"
+".fnx .chips{display:flex;flex-wrap:wrap;gap:6px}.fnx .chip{font-size:11px;font-weight:800;padding:8px 11px;border-radius:99px;border:1px solid #3a3320;background:#141210;color:#cfc6b0;cursor:pointer;user-select:none;font-family:inherit}.fnx .chip.on{background:var(--gold);border-color:var(--gold);color:#161307}"
+".fnx .pill{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 8px;border-radius:99px;border:1px solid #3a3a40;color:#b8b3a6;background:#1a1a1e;white-space:nowrap}.fnx .pill.gold{border-color:#6b5520;color:var(--gold2);background:#2a2211}.fnx .pill.green{border-color:#2d5d4e;color:var(--green);background:#0f2019}.fnx .pill.amber{border-color:#6b5520;color:var(--amber);background:#2b2418}.fnx .pill.red{border-color:#5a2a30;color:var(--red);background:#2a1216}.fnx .pill.blue{border-color:#2b3f66;color:var(--blue);background:#13203a}"
+".fnx .addon{display:flex;gap:10px;align-items:center;border:1px solid #3a3320;border-radius:12px;padding:10px 12px;margin-bottom:6px;cursor:pointer;background:#141210}.fnx .addon.on{border-color:var(--gold2);background:#2a2211}.fnx .addon b{display:block;font-size:13px}.fnx .addon small{display:block;color:var(--mute);font-size:10.5px;margin-top:2px}.fnx .addon .p{font-family:Oswald,sans-serif;font-size:18px;color:var(--gold2);flex:none;margin-left:auto}.fnx .addon .cb{width:20px;height:20px;border-radius:6px;border:2px solid #5a4d2a;flex:none}.fnx .addon.on .cb{background:var(--gold2);border-color:var(--gold2)}"
+".fnx .sl{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #1f1b12;transition:background .3s}.fnx .sl:last-child{border:0}.fnx .sl .av{width:40px;height:40px;border-radius:50%;background:#1a1a1e center/cover no-repeat;flex:none;border:2px solid #3a3320;display:grid;place-items:center;font-family:Oswald,sans-serif;color:#5a4d2a}.fnx .sl .rk{font-family:Oswald,sans-serif;color:var(--mute);width:24px;font-size:15px;flex:none;text-align:center}.fnx .sl .rk.top{color:var(--gold2)}.fnx .sl b{display:block;font-size:13.5px}.fnx .sl small{display:block;color:var(--mute);font-size:10.5px;margin-top:1px}.fnx .sl .ct{margin-left:auto;text-align:right;flex:none}.fnx .sl .ct b{font-family:Oswald,sans-serif;font-size:24px;color:var(--gold2);line-height:1}.fnx .sl .ct small{font-size:10px}.fnx .sl.flash{background:#2a2211;border-radius:10px}.fnx .sl .mini{flex:none;margin-left:6px}"
+".fnx .tk{border-radius:18px;background:#0a0908;margin-bottom:12px;overflow:hidden;position:relative;border:1px solid #3a3320;box-shadow:0 10px 30px rgba(0,0,0,.45)}.fnx .tk:before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 100% 0,rgba(201,164,76,.22),transparent 55%);pointer-events:none}.fnx .tk .foil{height:5px;background:linear-gradient(90deg,#8d6f22,#ffe58a 30%,#b8860b 55%,#ffd76a 80%,#8d6f22)}.fnx .tk .top{display:flex;gap:12px;align-items:center;padding:14px 16px 12px}.fnx .tk .top img{height:44px}.fnx .tk .top b{display:block;font-family:Oswald,sans-serif;font-size:22px;text-transform:uppercase;letter-spacing:1px;line-height:1}.fnx .tk .top small{color:var(--gold);font-size:9.5px;letter-spacing:2px;font-weight:800;text-transform:uppercase}.fnx .tk .top .tier{margin-left:auto;padding:6px 10px;cursor:default;background:#2a2211;border-color:#6b5520;text-align:right}.fnx .tk .top .tier b{font-size:13px;margin:0}.fnx .tk .top .tier small{font-size:8.5px}"
+".fnx .tk .bd{padding:0 16px 12px;display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;font-size:13px}.fnx .tk .bd small{display:block;font-size:9px;letter-spacing:1.2px;text-transform:uppercase;color:var(--mute);font-weight:800;margin-bottom:2px}.fnx .tk .bd .hold{grid-column:1/-1;font-family:Oswald,sans-serif;font-size:20px;text-transform:uppercase;letter-spacing:.5px}"
+".fnx .tk .rip{height:0;border-top:2px dashed #3a3320;margin:4px 0;position:relative}.fnx .tk .rip:before,.fnx .tk .rip:after{content:'';position:absolute;top:-12px;width:22px;height:22px;border-radius:50%;background:#0b0b0c;border:1px solid #3a3320}.fnx .tk .rip:before{left:-12px}.fnx .tk .rip:after{right:-12px}"
+".fnx .tk .qrrow{display:flex;gap:14px;align-items:center;padding:12px 16px 14px}.fnx .tk .qr{width:96px;height:96px;background:#fff;border-radius:10px;padding:6px;flex:none}.fnx .tk .qr svg{width:100%;height:100%;display:block}.fnx .tk .code{font-family:ui-monospace,Menlo,monospace;font-size:16px;letter-spacing:1.5px;margin:0 0 6px;color:#fff}.fnx .tk .st{display:inline-flex;align-items:center;gap:6px;font-size:9.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:5px 9px;border-radius:99px;border:1px solid #2d5d4e;color:var(--green);background:#0f2019}.fnx .tk .st:before{content:'';width:6px;height:6px;border-radius:50%;background:currentColor}.fnx .tk .st.used{border-color:#3a3a40;color:#9a9891;background:#1a1a1e}.fnx .tk .st.ref{border-color:#5a2a30;color:var(--red);background:#2a1216}.fnx .tk .btns{padding:0 16px 14px;margin:0}"
+".fnx .cam{position:relative;border-radius:16px;overflow:hidden;background:#000;aspect-ratio:1;border:1px solid #3a3320}.fnx .cam video{width:100%;height:100%;object-fit:cover;display:block}.fnx .cam .frame{position:absolute;left:15%;top:15%;width:70%;height:70%;border:3px solid var(--gold);border-radius:16px;pointer-events:none;box-shadow:0 0 0 999px rgba(0,0,0,.45)}.fnx .cam .hint{position:absolute;left:0;right:0;bottom:10px;text-align:center;font-size:11px;color:#cfc6b0;font-weight:700;text-shadow:0 1px 3px #000}"
+".fnx .res{border-radius:16px;padding:22px;text-align:center;margin-top:10px;border:2px solid #2c7e60;background:#0f2e22}.fnx .res .big{font-family:Oswald,sans-serif;font-size:44px;letter-spacing:3px;color:var(--green);line-height:1}.fnx .res .who{font-size:16px;font-weight:700;margin-top:8px}.fnx .res .m{font-size:12px;color:#a9ddcb;margin-top:5px;line-height:1.5}.fnx .res.bad{background:#351c22;border-color:#903f4a}.fnx .res.bad .big{color:var(--red)}.fnx .res.bad .m{color:#f1b3bb}"
+".fnx .feed div{font-size:12px;color:#cfc6b0;padding:7px 0;border-bottom:1px solid #1f1b12;display:flex;justify-content:space-between;gap:10px}.fnx .feed div:last-child{border:0}.fnx .feed time{color:var(--mute);white-space:nowrap;font-size:10.5px}"
+".fnx .note{font-size:11.5px;color:var(--mute);line-height:1.55;margin-top:8px}.fnx .warn{background:#2b2620;border:1px solid #655239;padding:10px 12px;border-radius:10px;color:#d5c2a5;font-size:12px;margin-top:8px}.fnx .ok{background:#152a25;border:1px solid #2d5d4e;padding:10px 12px;border-radius:10px;color:#a9ddcb;font-size:12px;margin-top:8px}"
+".fnx .sup{display:grid;grid-template-columns:1fr auto;gap:4px 10px;align-items:center;padding:11px 0;border-bottom:1px solid #1f1b12;cursor:pointer}.fnx .sup:last-child{border:0}.fnx .sup b{display:block;font-size:14px}.fnx .sup small{display:block;color:var(--mute);font-size:10.5px;margin-top:2px;line-height:1.45}.fnx .sup .q{text-align:right}.fnx .sup .q b{font-family:Oswald,sans-serif;font-size:19px;color:var(--gold2)}.fnx .sup .flags{grid-column:1/-1;display:flex;gap:5px;flex-wrap:wrap;margin-top:2px}"
+".fnx .seg{display:flex;gap:4px;background:#0e0c08;border:1px solid #3a3320;border-radius:10px;padding:3px}.fnx .seg button{flex:1;border:0;background:transparent;color:var(--mute);border-radius:8px;padding:9px 6px;font-family:inherit;font-weight:800;font-size:11px;cursor:pointer}.fnx .seg button.on{background:var(--gold);color:#161307}.fnx .seg button.on.no{background:#3a3a40;color:#f2f0eb}"
+".fnx .pipe{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:12px}.fnx .pipe div{border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:8px 4px;text-align:center;cursor:pointer}.fnx .pipe div.on{border-color:var(--gold)}.fnx .pipe b{display:block;font-family:Oswald,sans-serif;font-size:20px;line-height:1}.fnx .pipe small{display:block;font-size:8.5px;letter-spacing:.8px;text-transform:uppercase;color:var(--mute);font-weight:800;margin-top:4px}"
+".fnx table{width:100%;border-collapse:collapse;font-size:12.5px}.fnx th{text-align:left;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--mute);padding:6px 4px;border-bottom:1px solid var(--line)}.fnx td{padding:9px 4px;border-bottom:1px solid #1f1b12;vertical-align:middle;font-variant-numeric:tabular-nums}.fnx td.r,.fnx th.r{text-align:right}"
+"#fnxHome{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:linear-gradient(90deg,#2a2211,#0f0f0f);border:1px solid #C9A44C;border-radius:12px;padding:12px 14px;margin:0 0 11px;color:var(--text,#f2f0eb);cursor:pointer;font-family:inherit}#fnxHome img{height:40px;flex:none}#fnxHome .k{font-size:7.5px;font-weight:800;letter-spacing:2px;color:#C9A44C;text-transform:uppercase}#fnxHome .t{font-family:Oswald,sans-serif;font-size:15px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;line-height:1.1;margin-top:2px}#fnxHome .s{font-size:10.5px;color:#9a9891;margin-top:2px}#fnxHome .a{margin-left:auto;color:#C9A44C;font-weight:800;font-size:12px;flex:none}";
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
    sb.from("fn_suppliers").select("*").order("category").order("service"),
    sb.from("fn_audit").select("*").order("id",{ascending:false}).limit(40)
  ]);
  S.settings=r[0].data;S.fighters=r[1].data||[];S.orders=r[2].data||[];S.tickets=r[3].data||[];S.payments=r[4].data||[];S.refunds=r[5].data||[];S.expenses=r[6].data||[];S.suppliers=r[7].data||[];S.audit=r[8].data||[];
  S.loaded=true;
  if(!S.chan){try{S.chan=sb.channel("fn-live")
    .on("postgres_changes",{event:"INSERT",schema:"public",table:"fn_tickets"},function(p){var t=p.new;if(t&&t.fighter_id){S.flash[t.fighter_id]=Date.now();var f=fighter(t.fighter_id);if(f)T("🔥 "+f.first_name+" "+f.last_name+" +1 ticket");}refresh();})
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"fn_tickets"},function(){refresh();})
    .on("postgres_changes",{event:"*",schema:"public",table:"fn_suppliers"},function(){refresh();})
    .subscribe();}catch(e){}}
}
var _rt=null;function refresh(){clearTimeout(_rt);_rt=setTimeout(function(){if(view!=="fightnight")return;load().then(paint);},250);}
function fighter(id){return S.fighters.find(function(f){return f.id===id;});}
function fname(id){var f=fighter(id);return f?f.first_name+" "+f.last_name:(id?"Fighter":"General · no fighter");}
function tiers(){return (S.settings&&S.settings.tiers)||[];}
function tier(id){return tiers().find(function(t){return t.id===id;})||{short:id,name:id,price_cents:0,capacity:0};}
function addons(){return ((S.settings&&S.settings.addons)||[]);}
function ev(){return (S.settings&&S.settings.event)||{};}
function evDate(){var d=ev().date;if(!d)return "Sat 19 Dec";return new Date(d+"T12:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}
function inventory(){return tiers().map(function(t){var ts=S.tickets.filter(function(x){return x.status==="active"&&x.tier===t.id;});return Object.assign({},t,{sold:ts.length,remaining:Math.max(0,t.capacity-ts.length),revenue:ts.reduce(function(a,x){return a+x.base_cents;},0)});});}
function bookedSuppliers(){return S.suppliers.filter(function(s){return s.status==="booked";});}
function metrics(){
  var ok=S.payments.filter(function(p){return p.status==="succeeded";});
  var gross=ok.reduce(function(a,p){return a+p.amount_cents;},0),fees=ok.reduce(function(a,p){return a+p.fee_cents;},0),refunded=S.refunds.reduce(function(a,r){return a+r.amount_cents;},0);
  var active=S.tickets.filter(function(t){return t.status==="active";});
  var addonCost=active.reduce(function(a,t){return a+(t.addons||[]).reduce(function(b,x){return b+(x.cost_cents||0);},0);},0);
  var addonRev=ok.filter(function(p){return p.type==="addon";}).reduce(function(a,p){return a+p.amount_cents;},0);
  var ticketRev=gross-addonRev;
  var paid=S.expenses.filter(function(e){return e.status==="paid";}).reduce(function(a,e){return a+e.amount_cents;},0);
  var committed=S.expenses.filter(function(e){return e.status==="committed";}).reduce(function(a,e){return a+e.amount_cents;},0);
  var est=S.expenses.filter(function(e){return e.status==="estimate";}).reduce(function(a,e){return a+e.amount_cents;},0);
  var booked=bookedSuppliers().reduce(function(a,s){return a+s.quote_cents;},0);
  var quoted=S.suppliers.filter(function(s){return s.status==="quoted";}).reduce(function(a,s){return a+s.quote_cents;},0);
  var costs=paid+committed+est+booked+addonCost,net=gross-refunded-fees,profit=net-costs,target=S.settings?S.settings.profit_target_cents:0;
  var avg=active.length?net/active.length:0;
  return {gross:gross,fees:fees,refunded:refunded,net:net,ticketRev:ticketRev,paid:paid,committed:committed,est:est,booked:booked,quoted:quoted,addonCost:addonCost,addonRev:addonRev,costs:costs,profit:profit,cash:net-paid,sold:active.length,checkedIn:active.filter(function(t){return t.checked_in_at;}).length,orders:S.orders.filter(function(o){return o.status==="paid";}).length,
    beGap:Math.max(0,costs-net),goalGap:Math.max(0,target-profit),target:target,avg:avg,ticketsToBE:avg>0?Math.ceil(Math.max(0,costs-net)/avg):null,ticketsToGoal:avg>0?Math.ceil(Math.max(0,target-profit)/avg):null,capacity:tiers().reduce(function(a,t){return a+t.capacity;},0)};
}
function rankings(){var rows=S.fighters.map(function(f){var ts=S.tickets.filter(function(t){return t.status==="active"&&t.fighter_id===f.id;});var last=ts.length?ts.map(function(t){return t.created_at;}).sort().pop():null;return Object.assign({},f,{count:ts.length,value:ts.reduce(function(a,t){return a+t.paid_cents;},0),last:last});});
  return rows.sort(function(a,b){return b.count-a.count||b.value-a.value||(a.last_name||"").localeCompare(b.last_name||"");});}
function audit(msg){return sb.from("fn_audit").insert({message:msg,by_uid:session.user.id});}
function ticketUrl(t){return APP+"/ticket?t="+encodeURIComponent(t.token);}
function qrSvg(t){try{if(typeof window.qrcode!=="function")return "";var q=window.qrcode(0,"M");q.addData(ticketUrl(t));q.make();return '<div class="qr">'+q.createSvgTag({cellSize:3,margin:0,scalable:true})+'</div>';}catch(e){return "";}}
function ensureQr(cb){if(typeof window.qrcode==="function"){cb();return;}var s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";s.onload=cb;s.onerror=cb;document.head.appendChild(s);}
var SUP_STATUS={to_contact:["To contact","pill"],contacted:["Contacted · waiting","blue"],quoted:["Quote in","amber"],booked:["Booked","green"],declined:["Not going ahead","red"]};
var SUP_CATS=["Licences & permits","Food & drink","Furniture & hire","Entertainment","Production","Security & medical","Marketing","Staff","Venue","Other"];

/* ---------- paint ---------- */
function paint(){
  var m=$id("main");if(!m||view!=="fightnight")return;
  if(!isAdmin()){m.innerHTML='<div class="fnx"><button class="back" onclick="go(\'home\')">‹ Back</button><p>Nothing here.</p></div>';return;}
  var mt=metrics();var todo=S.suppliers.filter(function(s){return s.status==="to_contact"||s.status==="contacted";}).length;
  var tabs=[["overview","Overview",""],["tickets","Tickets",mt.sold],["sellers","Sellers",""],["door","Door",""],["money","Money",""],["suppliers","Suppliers",todo||""],["settings","Settings",""]];
  m.innerHTML='<div class="fnx"><button class="back" onclick="go(\'home\')">‹ Home</button><div class="hd"><img src="'+LOGO+'" alt=""><div><div class="k">Fight Club · '+esc(evDate())+' · '+esc(ev().venue||"Legacy Gym, Kincumber")+'</div><h2>Fight Night HQ</h2></div><span class="live">Live</span></div>'
   +'<div class="nav">'+tabs.map(function(t){return '<button class="'+(S.tab===t[0]?'on':'')+'" onclick="fnxTab(\''+t[0]+'\')">'+t[1]+(t[2]!==""?'<span class="n">'+t[2]+'</span>':'')+'</button>';}).join("")+'</div><div id="fnxBody"></div></div>';
  var b=$id("fnxBody");
  ({overview:pOverview,tickets:pTickets,sellers:pSellers,door:pDoor,money:pMoney,suppliers:pSuppliers,settings:pSettings})[S.tab](b);
}
function kpi(label,val,sub,cls){return '<div class="kpi '+(cls||"")+'"><small>'+label+'</small><b>'+val+'</b><i>'+(sub||"")+'</i></div>';}
function meter(m){
  var span=Math.max(m.costs+m.target,m.net,1);var w=Math.min(100,m.net/span*100);var be=Math.min(100,m.costs/span*100);
  return '<div class="meter"><span class="'+(m.net>=m.costs?'g':'')+'" style="width:'+w+'%"></span><i class="be" style="left:'+be+'%"></i></div><div class="legend"><span>Sold so far: '+money(m.net)+'</span><span>Break even: '+money(m.costs)+'</span><span>Goal: '+money(m.costs+m.target)+'</span></div>';
}
function profitLine(m){
  if(m.profit>=0)return '<div class="ok"><b>In profit by '+exact(m.profit)+'</b>'+(m.goalGap?' · '+exact(m.goalGap)+' more to hit the '+money(m.target)+' goal'+(m.ticketsToGoal?' (about '+m.ticketsToGoal+' tickets)':''):' · goal hit ✓')+'</div>';
  return '<div class="warn"><b>'+exact(m.beGap)+' short of break even</b>'+(m.ticketsToBE?' · about '+m.ticketsToBE+' more tickets at the current average of '+money(m.avg)+'.':' · sell a ticket to see how many more you need.')+'</div>';
}

function pOverview(b){
  var m=metrics(),inv=inventory(),rk=rankings().slice(0,5);
  var sc={booked:0,quoted:0,contacted:0,to_contact:0};S.suppliers.forEach(function(s){if(sc[s.status]!==undefined)sc[s.status]++;});
  b.innerHTML='<div class="kpis">'+kpi("Tickets sold",m.sold,(m.capacity-m.sold)+" left of "+m.capacity,"gold")+kpi("Ticket revenue",money(m.net),"after refunds and fees")+kpi("Outgoings",money(m.costs),"bills, booked suppliers, add-on costs")+kpi(m.profit>=0?"Profit":"Still to break even",money(Math.abs(m.profit)),m.profit>=0?"before tax":"at current sales",m.profit>=0?"good":"bad")+'</div>'
   +'<div class="card"><h3>Where we stand <span>'+Math.round(m.costs?Math.min(999,m.net/m.costs*100):0)+'% of outgoings covered</span></h3>'+meter(m)+profitLine(m)+'</div>'
   +'<div class="card"><h3>Ticket prices <span>'+m.sold+' sold · '+money(m.ticketRev)+'</span></h3><div class="tiers">'+inv.map(function(t){return '<div class="tier" onclick="fnxSellTier(\''+t.id+'\')"><small>'+esc(t.name)+'</small><b>'+esc(t.short)+'</b><div class="p">'+money(t.price_cents)+'</div><div class="bar"><span style="width:'+(t.capacity?t.sold/t.capacity*100:0)+'%"></span></div><i>'+t.sold+' sold · '+t.remaining+' left · '+money(t.revenue)+'</i></div>';}).join("")+'</div></div>'
   +'<div class="card"><h3>Top sellers <span>tickets sold per fighter</span></h3>'+(rk.length&&rk[0].count?rk.map(function(f,i){return sellerRow(f,i);}).join(""):'<p class="note">No sales yet. Sell the first ticket under Tickets.</p>')+'<div class="btns"><button class="btn" onclick="fnxTab(\'sellers\')">All sellers ›</button></div></div>'
   +'<div class="card"><h3>Suppliers <span>'+S.suppliers.length+' services</span></h3><div class="pipe"><div onclick="fnxSupF(\'to_contact\')"><b>'+sc.to_contact+'</b><small>To contact</small></div><div onclick="fnxSupF(\'contacted\')"><b>'+sc.contacted+'</b><small>Waiting</small></div><div onclick="fnxSupF(\'quoted\')"><b>'+sc.quoted+'</b><small>Quoted</small></div><div onclick="fnxSupF(\'booked\')"><b>'+sc.booked+'</b><small>Booked</small></div><div onclick="fnxSupF(\'all\')"><b>'+money(m.booked)+'</b><small>Booked $</small></div></div><div class="btns"><button class="btn" onclick="fnxTab(\'suppliers\')">Open suppliers ›</button></div></div>'
   +'<div class="card"><h3>Door <span>'+m.checkedIn+' of '+m.sold+' in</span></h3><div class="row"><span>Admitted at the door</span><b>'+m.checkedIn+'</b></div><div class="row"><span>Still to arrive</span><b>'+(m.sold-m.checkedIn)+'</b></div></div>'
   +'<div class="card"><h3>Activity</h3><div class="feed">'+(S.audit.length?S.audit.slice(0,10).map(function(a){return '<div><span>'+esc(a.message)+'</span><time>'+esc(when(a.at))+'</time></div>';}).join(""):'<p class="note">Nothing yet.</p>')+'</div></div>';
}
function sellerRow(f,i){var ph=f.photo_url?' style="background-image:url('+esc(f.photo_url)+')"':'';var fl=S.flash[f.id]&&Date.now()-S.flash[f.id]<6000;
  return '<div class="sl'+(fl?' flash':'')+'"><span class="rk'+(i<3&&f.count?' top':'')+'">'+(i+1)+'</span><div class="av"'+ph+'>'+(f.photo_url?'':esc((f.first_name||"?")[0]))+'</div><div><b>'+esc(f.first_name+" "+f.last_name)+'</b><small>'+(f.count?money(f.value)+' in tickets'+(f.last?' · last '+esc(when(f.last)):''):'No sales yet')+'</small></div><div class="ct"><b>'+f.count+'</b><small>tickets</small></div><button class="btn mini" onclick="fnxSellFor(\''+f.id+'\')">Sell</button></div>';}

/* ----- Tickets: prices, sell, issued tickets ----- */
function pTickets(b){
  var inv=inventory(),m=metrics(),s=S.sell;
  var q=(S.tq||"").toLowerCase();
  var rows=S.tickets.filter(function(t){var o=S.orders.find(function(x){return x.id===t.order_id;})||{};var hay=(t.id+" "+t.holder_name+" "+(o.email||"")+" "+fname(t.fighter_id)).toLowerCase();if(q&&hay.indexOf(q)<0)return false;if(S.tfilter==="active")return t.status==="active"&&!t.checked_in_at;if(S.tfilter==="in")return !!t.checked_in_at;if(S.tfilter==="refunded")return t.status==="refunded";return true;});
  b.innerHTML=(S.last?lastSale():'')
   +'<div class="card"><h3>Ticket prices <span>tap one to sell</span></h3><div class="tiers">'+inv.map(function(t){return '<div class="tier'+(s.open&&t.id===s.tier?' on':'')+(t.remaining<1?' out':'')+'" onclick="fnxSellTier(\''+t.id+'\')"><small>'+esc(t.name)+'</small><b>'+esc(t.short)+'</b><div class="p">'+money(t.price_cents)+'</div><div class="bar"><span style="width:'+(t.capacity?t.sold/t.capacity*100:0)+'%"></span></div><i>'+t.sold+' of '+t.capacity+' sold · '+t.remaining+' left</i></div>';}).join("")+'</div>'
   +(s.open?'':'<div class="btns"><button class="btn gold" onclick="fnxSellOpen(true)">+ Sell tickets</button></div>')+'</div>'
   +(s.open?sellForm(inv):'')
   +'<div class="card"><h3>Issued tickets <span>'+m.sold+' valid · '+m.checkedIn+' in · '+S.refunds.length+' refunded</span></h3><input type="text" placeholder="Search name, email, code, fighter…" value="'+esc(S.tq)+'" oninput="fnxTq(this.value)"><div class="chips" style="margin-top:8px">'+[["all","All"],["active","Not yet in"],["in","Checked in"],["refunded","Refunded"]].map(function(c){return '<span class="chip'+(S.tfilter===c[0]?' on':'')+'" onclick="fnxTf(\''+c[0]+'\')">'+c[1]+'</span>';}).join("")+'</div></div>'
   +(rows.length?rows.slice(0,60).map(ticketCard).join(""):'<div class="card"><p class="note">No tickets match.</p></div>');
}
function sellForm(inv){
  var s=S.sell,t=tier(s.tier),cur=inv.find(function(x){return x.id===s.tier;})||{remaining:0};
  var total=t.price_cents*s.qty;var ad=addons().filter(function(a){return a.enabled;});var adTotal=ad.filter(function(a){return s.addons[a.id];}).reduce(function(x,a){return x+a.price_cents*s.qty;},0);
  var q=(s.search||"").toLowerCase();var fl=S.fighters.filter(function(f){return !q||(f.first_name+" "+f.last_name).toLowerCase().indexOf(q)>=0;});
  return '<div class="card" style="border-color:#6b5520"><h3>Sell · '+esc(t.short)+' · '+money(t.price_cents)+' each <span><button class="btn" onclick="fnxSellOpen(false)">Close</button></span></h3>'
   +'<div class="two"><div><label>How many</label><div class="step"><button onclick="fnxSell(\'qty\',-1)">−</button><b>'+s.qty+'</b><button onclick="fnxSell(\'qty\',1)">+</button></div></div><div><label>Payment (demo)</label><select onchange="fnxSell(\'outcome\',this.value)"><option value="paid"'+(s.outcome==="paid"?' selected':'')+'>Paid</option><option value="pending"'+(s.outcome==="pending"?' selected':'')+'>Pending</option><option value="failed"'+(s.outcome==="failed"?' selected':'')+'>Failed</option></select></div></div>'
   +'<label>Sold through (fighter)</label><input type="text" placeholder="Search fighters…" value="'+esc(s.search)+'" oninput="fnxSell(\'search\',this.value)"><div style="height:6px"></div><select onchange="fnxSell(\'fighter\',this.value)"><option value="">Choose a fighter…</option><option value="none"'+(s.fighter==="none"?' selected':'')+'>General · no fighter</option>'+fl.map(function(f){return '<option value="'+f.id+'"'+(s.fighter===f.id?' selected':'')+'>'+esc(f.first_name+" "+f.last_name)+'</option>';}).join("")+'</select>'
   +'<div class="two"><div><label>Buyer name</label><input type="text" placeholder="Full name" value="'+esc(s.name)+'" oninput="fnxSell(\'name\',this.value)"></div><div><label>Buyer email</label><input type="email" placeholder="name@example.com" value="'+esc(s.email)+'" oninput="fnxSell(\'email\',this.value)"></div></div>'
   +(ad.length?'<label>Add-ons</label>'+ad.map(function(a){return '<div class="addon'+(s.addons[a.id]?' on':'')+'" onclick="fnxSell(\'addon\',\''+a.id+'\')"><div class="cb"></div><div><b>'+esc(a.name)+'</b><small>'+esc(a.blurb)+'</small></div><span class="p">'+money(a.price_cents)+'</span></div>';}).join(""):'')
   +'<div class="row tot"><span>'+s.qty+' × '+esc(t.short)+(adTotal?' + add-ons':'')+'</span><b>'+exact(total+adTotal)+'</b></div>'
   +'<button class="go" id="fnxBuy" onclick="fnxBuy()" '+(cur.remaining<s.qty||S.busy?'disabled':'')+'>'+(S.busy?'Working…':(cur.remaining<s.qty?'Not enough left':'Issue '+s.qty+' ticket'+(s.qty>1?'s':'')+' · '+money(total+adTotal)))+'</button><p class="note">Demo: nothing is charged. Tickets are issued with their own QR the moment you tap.</p></div>';
}
function lastSale(){
  var o=S.last;var ts=S.tickets.filter(function(t){return t.order_id===o.order_id;});
  return '<div class="card" style="border-color:#2d5d4e"><h3>'+(o.status==="paid"?'Issued · '+esc(o.order_id):esc(o.status)+' · '+esc(o.order_id))+' <span><button class="btn" onclick="fnxLast(null)">Done</button></span></h3>'
   +(o.status==="paid"?ts.map(ticketCard).join("")+'<p class="note">Send each ticket to the buyer, or open it to see exactly what they see.</p>':'<div class="warn">No tickets issued and nothing counted as revenue.</div>')+'</div>';
}
function ticketCard(t){
  var st=t.status==="refunded"?'<span class="st ref">Refunded</span>':t.checked_in_at?'<span class="st used">Admitted '+esc(when(t.checked_in_at))+'</span>':'<span class="st">Valid · scan at door</span>';
  var f=fighter(t.fighter_id);var ad=(t.addons||[]);var e=ev();
  return '<div class="tk" id="tk-'+esc(t.id)+'"><div class="foil"></div><div class="top"><img src="'+LOGO+'" alt=""><div><small>Legacy Gym presents</small><b>Fight Night</b></div><div class="tier"><small>Experience</small><b>'+esc(tier(t.tier).short)+'</b></div></div>'
   +'<div class="bd"><div class="hold">'+esc(t.holder_name)+'</div><div><small>When</small>'+esc(evDate())+(e.doors?' · doors '+esc(e.doors):'')+'</div><div><small>Where</small>'+esc(e.venue||"Legacy Gym, Kincumber")+'</div><div><small>In the corner of</small>'+esc(f?f.first_name+" "+f.last_name:"The whole card")+'</div><div><small>Paid</small>'+exact(t.paid_cents)+(ad.length?' · '+ad.map(function(a){return esc(a.name);}).join(", "):'')+'</div></div>'
   +'<div class="rip"></div><div class="qrrow">'+(t.status==="active"?qrSvg(t):'')+'<div><div class="code">'+esc(t.id)+'</div>'+st+'</div></div>'
   +'<div class="btns">'+(t.status==="active"?'<button class="btn gold" onclick="fnxSend(\''+t.id+'\')">Send ticket</button><a class="btn" href="'+ticketUrl(t)+'" target="_blank" rel="noopener">Open</a><button class="btn" onclick="fnxShare(\''+t.id+'\')">Share link</button>':'')
   +(t.status==="active"&&!t.checked_in_at?'<button class="btn" onclick="fnxUpgrade(\''+t.id+'\')">Upgrade</button><button class="btn" onclick="fnxAddon(\''+t.id+'\')">Add-on</button>':'')
   +(t.status==="active"?'<button class="btn red" onclick="fnxRefund(\''+t.id+'\')">Refund</button>':'')+'</div></div>';
}

/* ----- Sellers ----- */
function pSellers(b){
  var rk=rankings();var m=metrics();var gen=S.tickets.filter(function(t){return t.status==="active"&&!t.fighter_id;});var genVal=gen.reduce(function(a,t){return a+t.paid_cents;},0);
  var withSales=rk.filter(function(f){return f.count;}).length;
  b.innerHTML='<div class="kpis">'+kpi("Fighters selling",withSales+" / "+rk.length,"have sold at least one")+kpi("Best seller",rk[0]&&rk[0].count?esc(rk[0].first_name):"–",rk[0]&&rk[0].count?rk[0].count+" tickets":"no sales yet","gold")+kpi("Average per fighter",rk.length?(m.sold-gen.length)/rk.length|0:0,"tickets")+kpi("General sales",gen.length,money(genVal)+" · no fighter")+'</div>'
   +'<div class="card"><h3>Tickets sold by each fighter <span>live · updates on every phone</span></h3>'+rk.map(function(f,i){return sellerRow(f,i);}).join("")+'<div class="sl"><span class="rk">–</span><div class="av">FC</div><div><b>General · no fighter</b><small>'+money(genVal)+' in tickets</small></div><div class="ct"><b>'+gen.length+'</b><small>tickets</small></div><button class="btn mini" onclick="fnxSellFor(\'none\')">Sell</button></div></div>';
}

/* ----- Door ----- */
function pDoor(b){
  var m=metrics(),r=S.door.result;
  b.innerHTML='<div class="kpis" style="grid-template-columns:1fr 1fr">'+kpi("Admitted",m.checkedIn,"scanned in","good")+kpi("Still to come",m.sold-m.checkedIn,"valid tickets not yet in")+'</div>'
   +'<div class="card"><h3>Scan a ticket</h3><div class="cam"><video id="fnxVid" playsinline muted></video><div class="frame"></div><div class="hint" id="fnxHint">'+(S.door.scanning?'Point at the QR code':'Tap Start camera')+'</div></div>'
   +'<div class="btns"><button class="btn gold" id="fnxCamBtn" onclick="fnxCam()">'+(S.door.scanning?'Stop camera':'Start camera')+'</button></div>'
   +'<label>Or type the code</label><div style="display:flex;gap:6px"><input type="text" placeholder="FN26-XXXX-XX" value="'+esc(S.door.code)+'" oninput="S_fnx.door.code=this.value" style="font-family:ui-monospace,Menlo,monospace;text-transform:uppercase"><button class="btn gold" style="flex:none" onclick="fnxCheck()">Check</button></div>'
   +'<div id="fnxRes">'+resultHtml(r)+'</div></div>'
   +'<div class="card"><h3>Last through the door</h3><div class="feed">'+(S.tickets.filter(function(t){return t.checked_in_at;}).sort(function(a,b){return a.checked_in_at<b.checked_in_at?1:-1;}).slice(0,12).map(function(t){return '<div><span>'+esc(t.holder_name)+' · '+esc(tier(t.tier).short)+'</span><time>'+esc(when(t.checked_in_at))+'</time></div>';}).join("")||'<p class="note">Nobody yet.</p>')+'</div></div>';
  if(S.door.scanning)startCam();
}
function resultHtml(r){
  if(!r)return '<p class="note">Point the camera at a ticket, or type its code. One scan admits once; a second scan of the same ticket is refused.</p>';
  var ok=r.result==="admit";var tk=r.ticket||{};
  var title=ok?'ADMIT':'DO NOT ADMIT';var sub=ok?esc(tk.holder||"")+' · '+esc(tk.tier||""):esc(r.message||"");
  var meta=ok?('In the corner of '+esc(tk.fighter||"no one in particular")+'<br>'+esc(tk.id||"")+((tk.addons&&tk.addons.length)?'<br>Add-ons: '+tk.addons.map(function(a){return esc(a.name);}).join(", "):'')):((tk.id?esc(tk.id)+' · '+esc(tk.holder||"")+(r.at?' · first scan '+esc(when(r.at)):''):''));
  return '<div class="res'+(ok?'':' bad')+'"><div class="big">'+title+'</div><div class="who">'+sub+'</div><div class="m">'+meta+'</div></div>';
}

/* ----- Money: income vs outgoings ----- */
function pMoney(b){
  var m=metrics(),inv=inventory();var groups=[["paid","Paid"],["committed","Committed · not paid yet"],["estimate","Estimates"]];
  var bk=bookedSuppliers();
  b.innerHTML='<div class="kpis">'+kpi("Income",money(m.net),"tickets + add-ons, after refunds and fees","gold")+kpi("Outgoings",money(m.costs),"everything listed below")+kpi(m.profit>=0?"Profit":"Loss so far",money(Math.abs(m.profit)),m.profit>=0?"before tax":"until more tickets sell",m.profit>=0?"good":"bad")+kpi("Cash in hand",money(m.cash),"income less bills already paid")+'</div>'
   +'<div class="card"><h3>Break even</h3>'+meter(m)+profitLine(m)+'</div>'
   +'<div class="card"><h3>Income <span>'+money(m.net)+'</span></h3>'+inv.map(function(t){return '<div class="row"><div><b>'+esc(t.short)+'</b><small>'+t.sold+' × '+money(t.price_cents)+'</small></div><b>'+exact(t.revenue)+'</b></div>';}).join("")+'<div class="row"><div><b>Add-ons</b><small>drinks, tees, photos, bottles</small></div><b>'+exact(m.addonRev)+'</b></div><div class="row"><span>Refunds</span><b>− '+exact(m.refunded)+'</b></div><div class="row"><span>Card fees (demo 2% + 30c)</span><b>− '+exact(m.fees)+'</b></div><div class="row tot"><span>Net income</span><b>'+exact(m.net)+'</b></div></div>'
   +'<div class="card"><h3>Outgoings <span>'+money(m.costs)+'</span>'+(S.costOpen?'':'<span><button class="btn gold" onclick="fnxCostOpen()">+ Add outgoing</button></span>')+'</h3>'
   +(S.costOpen?costForm():'')
   +(bk.length?'<div class="row" style="padding-top:0"><small style="letter-spacing:1px;text-transform:uppercase;font-weight:800">Booked suppliers</small></div>'+bk.map(function(s){return '<div class="row"><div><b>'+esc(s.service)+'</b><small>'+esc(s.supplier||s.category)+(s.deposit_paid?' · deposit paid':'')+'</small></div><div class="r"><b>'+exact(s.quote_cents)+'</b><div class="btns" style="justify-content:flex-end;margin-top:4px"><button class="btn" onclick="fnxSupEdit('+s.id+')">Open</button></div></div></div>';}).join(""):'')
   +groups.map(function(g){var list=S.expenses.filter(function(e){return e.status===g[0];});if(!list.length)return '';return '<div class="row" style="padding-top:12px"><small style="letter-spacing:1px;text-transform:uppercase;font-weight:800">'+g[1]+'</small></div>'+list.map(function(e){return '<div class="row"><div><b>'+esc(e.label)+'</b><small>'+esc(e.category)+'</small></div><div class="r"><b>'+exact(e.amount_cents)+'</b><div class="btns" style="justify-content:flex-end;margin-top:4px">'+(e.status!=="paid"?'<button class="btn" onclick="fnxCostPaid('+e.id+')">Paid</button>':'')+'<button class="btn" onclick="fnxCostEdit('+e.id+')">Edit</button><button class="btn red" onclick="fnxCostDel('+e.id+')">✕</button></div></div></div>';}).join("");}).join("")
   +(m.addonCost?'<div class="row"><div><b>Add-on fulfilment</b><small>what the add-ons sold cost us to deliver</small></div><b>'+exact(m.addonCost)+'</b></div>':'')
   +(!S.expenses.length&&!bk.length?'<p class="note">Nothing listed yet. Add outgoings here (venue, ring, insurance, staff…) and book suppliers under Suppliers; booked quotes land here automatically.</p>':'')
   +'<div class="row tot"><span>Total outgoings</span><b>'+exact(m.costs)+'</b></div>'+(m.quoted?'<p class="note">Plus '+money(m.quoted)+' in quotes not yet booked (not counted until you mark them booked).</p>':'')+'</div>'
   +'<div class="card"><h3>Result</h3><div class="row"><span>Net income</span><b>'+exact(m.net)+'</b></div><div class="row"><span>Total outgoings</span><b>− '+exact(m.costs)+'</b></div><div class="row tot"><span>'+(m.profit>=0?'Profit':'Loss')+'</span><b style="color:'+(m.profit>=0?'var(--green)':'var(--red)')+'">'+exact(Math.abs(m.profit))+'</b></div><div class="row"><span>Profit goal</span><b>'+exact(m.target)+'</b></div></div>';
}
function costForm(){var c=S.costEdit||{};return '<div class="card" style="margin:0 0 12px;border-color:#6b5520"><h3>'+(c.id?'Edit outgoing':'New outgoing')+'</h3><label>What</label><input type="text" id="fnxCL" placeholder="e.g. Venue hire, ring hire, insurance" value="'+esc(c.label||'')+'"><div class="two"><div><label>Category</label><select id="fnxCC">'+SUP_CATS.map(function(x){return '<option'+(c.category===x?' selected':'')+'>'+x+'</option>';}).join("")+'</select></div><div><label>Amount (AUD)</label><input type="number" id="fnxCA" inputmode="decimal" step="0.01" min="0" placeholder="0.00" value="'+(c.amount_cents!=null?(c.amount_cents/100).toFixed(2):'')+'"></div></div><label>Status</label><select id="fnxCS"><option value="estimate"'+(c.status==="estimate"?' selected':'')+'>Estimate</option><option value="committed"'+(c.status==="committed"?' selected':'')+'>Committed · not paid yet</option><option value="paid"'+(c.status==="paid"?' selected':'')+'>Paid</option></select><div class="btns"><button class="btn gold" onclick="fnxCostSave()">'+(c.id?'Save':'Add')+'</button><button class="btn" onclick="S_fnx.costEdit=null;S_fnx.costOpen=false;fnxPaint()">Cancel</button></div></div>';}

/* ----- Suppliers: services to secure ----- */
function pSuppliers(b){
  var sp=S.sup;var q=(sp.q||"").toLowerCase();var m=metrics();
  var sc={all:S.suppliers.length,to_contact:0,contacted:0,quoted:0,booked:0,declined:0};S.suppliers.forEach(function(s){sc[s.status]++;});
  var rows=S.suppliers.filter(function(s){if(sp.filter!=="all"&&s.status!==sp.filter)return false;if(q&&(s.service+" "+s.supplier+" "+s.contact_name+" "+s.category).toLowerCase().indexOf(q)<0)return false;return true;});
  var order={to_contact:0,contacted:1,quoted:2,booked:3,declined:4};rows.sort(function(a,b){return order[a.status]-order[b.status]||a.category.localeCompare(b.category)||a.service.localeCompare(b.service);});
  b.innerHTML='<div class="kpis">'+kpi("Booked",sc.booked+" / "+(sc.all-sc.declined),money(m.booked)+" committed","good")+kpi("Quotes in",sc.quoted,money(m.quoted)+" to decide on","gold")+kpi("Waiting on reply",sc.contacted,"contacted, no answer yet")+kpi("Not contacted",sc.to_contact,"nobody has reached out",sc.to_contact?"bad":"")+'</div>'
   +(sp.edit?supForm():'')
   +'<div class="card"><h3>Services to secure <span><button class="btn gold" onclick="fnxSupNew()">+ Add service</button></span></h3><input type="text" placeholder="Search services, suppliers, contacts…" value="'+esc(sp.q)+'" oninput="fnxSupQ(this.value)"><div class="chips" style="margin-top:8px">'+[["all","All"],["to_contact","To contact"],["contacted","Waiting"],["quoted","Quoted"],["booked","Booked"],["declined","Not going ahead"]].map(function(c){return '<span class="chip'+(sp.filter===c[0]?' on':'')+'" onclick="fnxSupF(\''+c[0]+'\')">'+c[1]+' '+sc[c[0]]+'</span>';}).join("")+'</div>'
   +(rows.length?rows.map(supRow).join(""):'<p class="note">Nothing here.</p>')+'</div>';
}
function supRow(s){var st=SUP_STATUS[s.status]||SUP_STATUS.to_contact;
  var who=s.supplier?esc(s.supplier)+(s.contact_name?' · '+esc(s.contact_name):''):(s.contact_name?esc(s.contact_name):'No supplier yet');
  var line2=s.status==="to_contact"?'Nobody contacted yet':(s.contacted_on?'Contacted '+dmy(s.contacted_on):'Contacted')+(s.responded?' · replied':' · no reply yet')+(s.owner?' · '+esc(s.owner)+' on it':'');
  return '<div class="sup" onclick="fnxSupEdit('+s.id+')"><div><b>'+esc(s.service)+'</b><small>'+esc(s.category)+' · '+who+'</small><small>'+line2+'</small></div><div class="q">'+(s.quote_cents?'<b>'+money(s.quote_cents)+'</b>':'<b style="color:var(--mute);font-size:14px">no quote</b>')+'</div><div class="flags"><span class="pill '+st[1]+'">'+st[0]+'</span>'+(s.deposit_paid?'<span class="pill green">Deposit paid</span>':'')+(s.notes?'<span class="pill">Note</span>':'')+'</div></div>';}
function supForm(){var s=S.sup.edit;var isNew=!s.id;
  return '<div class="card" style="border-color:#6b5520"><h3>'+(isNew?'New service':esc(s.service))+' <span><button class="btn" onclick="fnxSupCancel()">Close</button></span></h3>'
   +'<div class="two"><div><label>Service</label><input type="text" id="spService" placeholder="e.g. Liquor licence" value="'+esc(s.service||'')+'"></div><div><label>Category</label><select id="spCat">'+SUP_CATS.map(function(x){return '<option'+((s.category||"Other")===x?' selected':'')+'>'+x+'</option>';}).join("")+'</select></div></div>'
   +'<label>Status</label><select id="spStatus" onchange="fnxSupStatusHint(this.value)">'+Object.keys(SUP_STATUS).map(function(k){return '<option value="'+k+'"'+((s.status||"to_contact")===k?' selected':'')+'>'+SUP_STATUS[k][0]+'</option>';}).join("")+'</select>'
   +'<div class="two"><div><label>Supplier / company</label><input type="text" id="spSupplier" placeholder="Who you\'re dealing with" value="'+esc(s.supplier||'')+'"></div><div><label>Contact person</label><input type="text" id="spContact" placeholder="Name" value="'+esc(s.contact_name||'')+'"></div></div>'
   +'<div class="two"><div><label>Phone</label><input type="tel" id="spPhone" placeholder="04…" value="'+esc(s.phone||'')+'"></div><div><label>Email</label><input type="email" id="spEmail" placeholder="name@…" value="'+esc(s.email||'')+'"></div></div>'
   +'<div class="two"><div><label>Contacted on</label><input type="date" id="spOn" value="'+esc(s.contacted_on||'')+'"></div><div><label>Have they responded?</label><div class="seg"><button type="button" id="spRespY" class="'+(s.responded?'on':'')+'" onclick="fnxSupResp(true)">Yes</button><button type="button" id="spRespN" class="'+(!s.responded?'on no':'')+'" onclick="fnxSupResp(false)">No</button></div></div></div>'
   +'<div class="two"><div><label>Quote / cost (AUD)</label><input type="number" id="spQuote" inputmode="decimal" step="0.01" min="0" placeholder="0.00" value="'+(s.quote_cents?(s.quote_cents/100).toFixed(2):'')+'"></div><div><label>Deposit paid?</label><div class="seg"><button type="button" id="spDepY" class="'+(s.deposit_paid?'on':'')+'" onclick="fnxSupDep(true)">Yes</button><button type="button" id="spDepN" class="'+(!s.deposit_paid?'on no':'')+'" onclick="fnxSupDep(false)">No</button></div></div></div>'
   +'<label>Who\'s handling it</label><select id="spOwner"><option value="">Nobody yet</option>'+["Jake","Alison","Kelly"].map(function(n){return '<option'+(s.owner===n?' selected':'')+'>'+n+'</option>';}).join("")+'</select>'
   +'<label>Notes</label><textarea id="spNotes" placeholder="What they said, what\'s included, dates, conditions…">'+esc(s.notes||'')+'</textarea>'
   +'<p class="note" id="spHint">'+supHint(s.status||"to_contact")+'</p>'
   +'<div class="btns"><button class="btn gold" onclick="fnxSupSave()">'+(isNew?'Add service':'Save')+'</button>'+(s.phone?'<a class="btn" href="tel:'+esc(s.phone)+'">Call</a>':'')+(s.email?'<a class="btn" href="mailto:'+esc(s.email)+'">Email</a>':'')+(!isNew?'<button class="btn red" onclick="fnxSupDel('+s.id+')">Remove</button>':'')+'</div></div>';}
function supHint(st){return {to_contact:"Nobody has reached out yet. When you do, set the status to Contacted and the date fills in.",contacted:"You've asked, waiting on them. Tick Yes under responded when they come back to you.",quoted:"They've given a price. It shows here but isn't counted in outgoings until it's Booked.",booked:"Locked in. The quote now counts as an outgoing on the Money tab.",declined:"Not going ahead. Kept for the record, not counted anywhere."}[st]||"";}

/* ----- Settings ----- */
function pSettings(b){
  var s=S.settings;var e=ev();
  b.innerHTML='<div class="card"><h3>Event</h3><div class="two"><div><label>Date</label><input type="date" id="fnxEvDate" value="'+esc(e.date||'')+'"></div><div><label>Venue</label><input type="text" id="fnxEvVenue" value="'+esc(e.venue||'')+'"></div></div><div class="two"><div><label>Doors</label><input type="text" id="fnxEvDoors" value="'+esc(e.doors||'')+'" placeholder="6:00 PM"></div><div><label>First bell</label><input type="text" id="fnxEvBell" value="'+esc(e.bell||'')+'" placeholder="7:00 PM"></div></div></div>'
   +'<div class="card"><h3>Ticket prices and capacity</h3>'+tiers().map(function(t,i){return '<div class="row"><div><b>'+esc(t.short)+'</b><small>'+esc(t.name)+'</small></div><div class="r" style="display:flex;gap:6px"><input type="number" style="width:96px" id="fnxP'+i+'" value="'+(t.price_cents/100).toFixed(2)+'" step="0.01" min="1" placeholder="Price"><input type="number" style="width:76px" id="fnxC'+i+'" value="'+t.capacity+'" step="1" min="0" placeholder="Cap"></div></div>';}).join("")+'<label>Profit goal (AUD)</label><input type="number" id="fnxGoal" value="'+(s.profit_target_cents/100).toFixed(0)+'" step="100" min="0"><p class="note">Changing a price never rewrites what people already paid. Capacity can\'t go below tickets already sold.</p></div>'
   +'<div class="card"><h3>Add-ons</h3>'+addons().map(function(a,i){return '<div class="row"><div><b>'+esc(a.name)+'</b><small>'+esc(a.blurb)+'</small></div><div class="r" style="display:flex;gap:6px;align-items:center"><input type="number" style="width:84px" id="fnxAP'+i+'" value="'+(a.price_cents/100).toFixed(2)+'" step="0.01" min="0" title="Price"><input type="number" style="width:74px" id="fnxAC'+i+'" value="'+((a.cost_cents||0)/100).toFixed(2)+'" step="0.01" min="0" title="Our cost"><input type="number" style="width:64px" id="fnxAS'+i+'" value="'+a.stock+'" step="1" min="0" title="Stock"><span class="chip'+(a.enabled?' on':'')+'" onclick="fnxAddonTog('+i+')">'+(a.enabled?'On':'Off')+'</span></div></div>';}).join("")+'<p class="note">Price · our cost · stock. Cost is what it costs us to deliver, so profit stays honest.</p></div>'
   +'<div class="btns" style="margin-bottom:12px"><button class="btn gold" onclick="fnxSaveSettings()">Save all settings</button></div>'
   +'<div class="card"><h3>Demo data</h3><p class="note">Sales are demo until the payment provider is wired in. Reset clears orders, tickets, payments and refunds. Outgoings and suppliers stay.</p><div class="btns"><button class="btn" onclick="fnxSeed()">Add 20 sample sales</button><button class="btn red" onclick="fnxReset()">Reset demo sales</button></div></div>'
   +'<div class="card"><h3>Who can see this</h3><p class="note">Jake, Alison and Kelly. Nobody else sees the home-screen card or can read these tables (enforced in the database, not just hidden).</p></div>';
}

/* ---------- actions ---------- */
window.S_fnx=S;window.fnxPaint=paint;
window.fnxTab=function(t){if(S.tab==="door"&&t!=="door")stopCam();S.tab=t;paint();window.scrollTo(0,0);};
window.fnxSellOpen=function(v){S.sell.open=!!v;paint();};
window.fnxSellTier=function(id){S.sell.tier=id;S.sell.open=true;S.tab="tickets";paint();var el=$id("fnxBuy");if(el)el.scrollIntoView({block:"center"});};
window.fnxSell=function(k,v){var s=S.sell;if(k==="tier")s.tier=v;else if(k==="qty")s.qty=Math.max(1,Math.min(10,s.qty+v));else if(k==="search"){s.search=v;}else if(k==="fighter")s.fighter=v||null;else if(k==="name")s.name=v;else if(k==="email")s.email=v;else if(k==="outcome")s.outcome=v;else if(k==="addon")s.addons[v]=!s.addons[v];
  if(k==="search"){var sel=document.querySelector("#fnxBody select[onchange*=fighter]");if(sel){var q=v.toLowerCase();sel.innerHTML='<option value="">Choose a fighter…</option><option value="none"'+(s.fighter==="none"?' selected':'')+'>General · no fighter</option>'+S.fighters.filter(function(f){return !q||(f.first_name+" "+f.last_name).toLowerCase().indexOf(q)>=0;}).map(function(f){return '<option value="'+f.id+'"'+(s.fighter===f.id?' selected':'')+'>'+esc(f.first_name+" "+f.last_name)+'</option>';}).join("");}return;}
  if(k==="name"||k==="email"||k==="outcome")return;paint();};
window.fnxSellFor=function(id){S.sell.fighter=id;S.sell.search="";S.sell.open=true;S.tab="tickets";paint();window.scrollTo(0,0);T("Selling through "+fname(id==="none"?null:id));};
window.fnxLast=function(v){S.last=v;paint();};
window.fnxBuy=async function(){
  var s=S.sell;if(!s.fighter){T("Choose which fighter sold it, or General.");return;}
  if(!s.name.trim()||!/^\S+@\S+\.\S+$/.test(s.email)){T("Enter the buyer's name and a valid email.");return;}
  S.busy=true;paint();
  var r=await sb.rpc("fn_purchase",{p_tier:s.tier,p_qty:s.qty,p_fighter:s.fighter==="none"?null:s.fighter,p_name:s.name.trim(),p_email:s.email.trim(),p_status:s.outcome});
  if(r.error){S.busy=false;paint();T(r.error.message);return;}
  var o=r.data;var want=Object.keys(s.addons).filter(function(k){return s.addons[k];});
  if(o.status==="paid"&&want.length){for(var i=0;i<o.tickets.length;i++){for(var j=0;j<want.length;j++){var a=await sb.rpc("fn_addon",{p_ticket:o.tickets[i].id,p_addon:want[j]});if(a.error)T(a.error.message);}}}
  S.busy=false;S.last=o;S.sell.name="";S.sell.email="";S.sell.addons={};S.sell.outcome="paid";S.sell.open=false;
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
function mailFallback(t,to){var f=fighter(t.fighter_id);var e=ev();var body="Hey "+t.holder_name+",\n\nHere's your ticket for Fight Club Fight Night at Legacy Gym, Kincumber.\n\nOpen your ticket: "+ticketUrl(t)+"\n\n"+evDate()+(e.doors?" · Doors "+e.doors:"")+(e.bell?" · First bell "+e.bell:"")+"\nExperience: "+tier(t.tier).short+"\n"+(f?"In the corner of: "+f.first_name+" "+f.last_name+"\n":"")+"Admission code: "+t.id+"\n\nShow the QR code on that page at the door. One scan, one entry.\n\n(Demonstration ticket. No payment has been taken.)\n\n— Legacy Gym · Fight Club Central Coast";T("Email sending isn't switched on yet, so I've opened it in your Mail app instead.");location.href="mailto:"+encodeURIComponent(to)+"?subject="+encodeURIComponent("Your Fight Night ticket · "+tier(t.tier).short+" · "+t.id)+"&body="+encodeURIComponent(body);}
window.fnxTq=function(v){S.tq=v;var b=$id("fnxBody");if(b){var keep=document.activeElement;pTickets(b);var inp=b.querySelector("input[placeholder^=Search]");if(inp&&keep&&keep.tagName==="INPUT"){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}}};
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
  await load();var m=metrics();var st=document.querySelectorAll("#fnxBody .kpi b");if(st[0])st[0].textContent=m.checkedIn;if(st[1])st[1].textContent=m.sold-m.checkedIn;
}
window.fnxCam=function(){if(S.door.scanning){stopCam();paint();}else{S.door.scanning=true;paint();}};
window.fnxCheck=function(){check(S.door.code);};
/* outgoings */
window.fnxCostOpen=function(){S.costEdit=null;S.costOpen=true;paint();};
window.fnxCostSave=async function(){var label=$id("fnxCL").value.trim(),cat=$id("fnxCC").value,amt=Math.round(parseFloat($id("fnxCA").value||"0")*100),st=$id("fnxCS").value;if(!label){T("Give the outgoing a name.");return;}if(!(amt>=0)){T("Enter an amount.");return;}
  var row={label:label,category:cat,amount_cents:amt,status:st,updated_at:new Date().toISOString()};var r=S.costEdit&&S.costEdit.id?await sb.from("fn_expenses").update(row).eq("id",S.costEdit.id):await sb.from("fn_expenses").insert(row);
  if(r.error){T(r.error.message);return;}await audit((S.costEdit&&S.costEdit.id?"Outgoing updated · ":"Outgoing added · ")+label+" · "+exact(amt)+" · "+st+" · "+me());S.costEdit=null;S.costOpen=false;await load();paint();T("Saved.");};
window.fnxCostEdit=function(id){S.costEdit=S.expenses.find(function(e){return e.id===id;});S.costOpen=true;paint();window.scrollTo(0,0);};
window.fnxCostPaid=async function(id){var e=S.expenses.find(function(x){return x.id===id;});var r=await sb.from("fn_expenses").update({status:"paid",updated_at:new Date().toISOString()}).eq("id",id);if(r.error){T(r.error.message);return;}await audit("Outgoing marked paid · "+e.label+" · "+me());await load();paint();};
window.fnxCostDel=async function(id){var e=S.expenses.find(function(x){return x.id===id;});if(!confirm("Remove "+e.label+"?"))return;var r=await sb.from("fn_expenses").delete().eq("id",id);if(r.error){T(r.error.message);return;}await audit("Outgoing removed · "+e.label+" · "+me());await load();paint();};
/* suppliers */
window.fnxSupF=function(f){S.sup.filter=f;S.tab="suppliers";paint();window.scrollTo(0,0);};
window.fnxSupQ=function(v){S.sup.q=v;var b=$id("fnxBody");if(b){var keep=document.activeElement;pSuppliers(b);var inp=b.querySelector("input[placeholder^=Search]");if(inp&&keep&&keep.tagName==="INPUT"){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}}};
window.fnxSupNew=function(){S.sup.edit={status:"to_contact",responded:false,deposit_paid:false,category:"Other"};S.tab="suppliers";paint();window.scrollTo(0,0);};
window.fnxSupEdit=function(id){var s=S.suppliers.find(function(x){return x.id===id;});if(!s)return;S.sup.edit=JSON.parse(JSON.stringify(s));S.tab="suppliers";paint();window.scrollTo(0,0);};
window.fnxSupCancel=function(){S.sup.edit=null;paint();};
window.fnxSupResp=function(v){S.sup.edit.responded=!!v;$id("spRespY").className=v?"on":"";$id("spRespN").className=v?"":"on no";};
window.fnxSupDep=function(v){S.sup.edit.deposit_paid=!!v;$id("spDepY").className=v?"on":"";$id("spDepN").className=v?"":"on no";};
window.fnxSupStatusHint=function(st){var h=$id("spHint");if(h)h.textContent=supHint(st);var on=$id("spOn");if(on&&st!=="to_contact"&&!on.value)on.value=today();if(st==="quoted"||st==="booked"){var y=$id("spRespY");if(y&&!S.sup.edit.responded)fnxSupResp(true);}};
window.fnxSupSave=async function(){var e=S.sup.edit;var row={service:$id("spService").value.trim(),category:$id("spCat").value,status:$id("spStatus").value,supplier:$id("spSupplier").value.trim(),contact_name:$id("spContact").value.trim(),phone:$id("spPhone").value.trim(),email:$id("spEmail").value.trim(),contacted_on:$id("spOn").value||null,responded:!!e.responded,quote_cents:Math.round(parseFloat($id("spQuote").value||"0")*100),deposit_paid:!!e.deposit_paid,owner:$id("spOwner").value,notes:$id("spNotes").value.trim(),updated_at:new Date().toISOString()};
  if(!row.service){T("Give the service a name.");return;}if(row.status!=="to_contact"&&!row.contacted_on)row.contacted_on=today();if(row.status==="booked"&&!(row.quote_cents>0)){T("Enter the cost before marking it booked.");return;}
  var r=e.id?await sb.from("fn_suppliers").update(row).eq("id",e.id):await sb.from("fn_suppliers").insert(Object.assign({created_by:session.user.id},row));
  if(r.error){T(r.error.message);return;}
  await audit((e.id?"Supplier updated · ":"Service added · ")+row.service+" · "+SUP_STATUS[row.status][0]+(row.quote_cents?" · "+exact(row.quote_cents):"")+" · "+me());S.sup.edit=null;await load();paint();T("Saved.");};
window.fnxSupDel=async function(id){var s=S.suppliers.find(function(x){return x.id===id;});if(!s||!confirm("Remove "+s.service+" from the list?"))return;var r=await sb.from("fn_suppliers").delete().eq("id",id);if(r.error){T(r.error.message);return;}await audit("Service removed · "+s.service+" · "+me());S.sup.edit=null;await load();paint();};
/* settings */
window.fnxAddonTog=function(i){S.settings.addons[i].enabled=!S.settings.addons[i].enabled;paint();};
window.fnxSaveSettings=async function(){
  var inv=inventory();var t=tiers().map(function(x,i){var p=Math.round(parseFloat($id("fnxP"+i).value||"0")*100),c=parseInt($id("fnxC"+i).value||"0",10);return Object.assign({},x,{price_cents:p,capacity:c});});
  for(var i=0;i<t.length;i++){if(!(t[i].price_cents>0)){T("Prices must be above zero.");return;}if(t[i].capacity<inv[i].sold){T(t[i].short+" capacity can't go below "+inv[i].sold+" sold.");return;}}
  if(!(t[0].price_cents<t[1].price_cents&&t[1].price_cents<t[2].price_cents)){T("Keep Standard, Ringside bar and Ringside table in increasing price order.");return;}
  var ad=addons().map(function(a,i){return Object.assign({},a,{price_cents:Math.round(parseFloat($id("fnxAP"+i).value||"0")*100),cost_cents:Math.round(parseFloat($id("fnxAC"+i).value||"0")*100),stock:parseInt($id("fnxAS"+i).value||"0",10)});});
  var goal=Math.round(parseFloat($id("fnxGoal").value||"0")*100);
  var e=Object.assign({},ev(),{date:$id("fnxEvDate").value||ev().date,venue:$id("fnxEvVenue").value.trim()||ev().venue,doors:$id("fnxEvDoors").value.trim(),bell:$id("fnxEvBell").value.trim()});
  var r=await sb.from("fn_settings").update({tiers:t,addons:ad,profit_target_cents:goal,event:e,updated_at:new Date().toISOString()}).eq("id",1);if(r.error){T(r.error.message);return;}await audit("Settings updated · "+me());await load();paint();T("Saved.");};
window.fnxReset=async function(){if(!confirm("Clear every demo order, ticket, payment and refund? Outgoings and suppliers stay."))return;
  var steps=[["fn_refunds","id"],["fn_payments","id"],["fn_tickets","id"],["fn_orders","id"],["fn_audit","id"]];
  for(var i=0;i<steps.length;i++){var r=await sb.from(steps[i][0]).delete().not(steps[i][1],"is",null);if(r.error){T(r.error.message);return;}}
  S.last=null;await audit("Demo sales reset · "+me());await load();paint();T("Demo sales cleared.");};
window.fnxSeed=async function(){if(!confirm("Add 20 sample demo sales spread across the fighters?"))return;S.busy=true;paint();var fs=S.fighters;var tl=["standard","standard","standard","bar","bar","table"];var n=0;
  for(var i=0;i<20;i++){var f=fs[(i*7+3)%fs.length];var r=await sb.rpc("fn_purchase",{p_tier:tl[i%tl.length],p_qty:1+(i%4),p_fighter:i%9===0?null:f.id,p_name:"Demo Guest "+String(i+1).padStart(3,"0"),p_email:"guest"+(i+1)+"@example.invalid",p_status:"paid"});if(!r.error)n++;}
  S.busy=false;await load();paint();T(n+" sample sales added.");};
window.fnxEnter=function(){if(!isAdmin()){T("Not for you, sorry.");return;}go("fightnight");};

/* ---------- hooks ---------- */
var _render=window.render;window.render=function(){if(view==="fightnight"){var m=$id("main");if(m&&!S.loaded)m.innerHTML='<div class="loadingDots">Opening Fight Night…</div>';load().then(function(){ensureQr(paint);});return;}if(S.door.scanning)stopCam();return _render.apply(this,arguments);};
function homeCard(){
  if(view!=="home"||!isAdmin())return;var m=$id("main");if(!m||$id("fnxHome"))return;
  var b=document.createElement("button");b.id="fnxHome";b.onclick=window.fnxEnter;
  b.innerHTML='<img src="'+LOGO+'" alt=""><div><div class="k">Fight Night HQ · Sat 19 Dec</div><div class="t">Tickets, sellers, door, money &amp; suppliers</div><div class="s">Staff only · Jake, Alison, Kelly</div></div><span class="a">Open ›</span>';
  var root=$id("lgh2");if(root)root.insertAdjacentElement("afterbegin",b);else{var first=m.querySelector(".homeCard");if(first)first.insertAdjacentElement("beforebegin",b);else m.insertAdjacentElement("afterbegin",b);}
}
var _home=window.renderHome;if(typeof _home==="function"){window.renderHome=function(){var r=_home.apply(this,arguments);try{homeCard();setTimeout(homeCard,120);setTimeout(homeCard,600);}catch(e){}return r;};}
setInterval(function(){try{if(view==="home")homeCard();}catch(e){}},1500);
})();
