/* ===== SARSHA'S FIGHT OFFICE \u00b7 Jake + Sarsha only (20 Nov 2026) =====
   Bottom-nav tab "Sarsha" that only shows for Jake and Sarsha. Two sections:
   Sponsorship (agreed / paid sponsors, what Sarsha owes each sponsor, what we need from them, logos, emails, sponsor link)
   and Pro boxing (pipeline: to contact, contacted, in talks, agreed fights with dates).
   Data: tables sfo_sponsors / sfo_opps, RLS locked to the two user ids (function sfo_ok). No deletes: archive instead. */
(function(){
"use strict";
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1",SAR="2d223b5e-0dd2-47ee-8e3f-54e1b1c3e139";
function uid(){try{return session&&session.user?session.user.id:null;}catch(e){return null;}}
function ok(){var u=uid();return u===JAKE||u===SAR;}
function me(){return uid()===SAR?"Sarsha":"Jake";}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
var LINK="https://legacygym-app.vercel.app/sarsha-mcgurk";
var RECORD="WBO Asia Pacific champion (won December 2025 at World Siam Stadium, Bangkok, unanimous decision over 8 rounds)";

/* ---------- packages (same as Sarsha's sponsor page) ---------- */
var PK=[
 {id:"champion",n:"Champion",p:7500,c:"#7fdcf8",inh:"travel",b:[["Fight tickets for you and your guests"],["A photo session with Sarsha for your business"],["A custom social post and video for your brand"]]},
 {id:"travel",n:"Travel & Train",p:5000,c:"#1fb6e6",inh:"gold",b:[["Logo on walkout shirts for her fights"],["Logo on the Legacy Gym screens on home fight shows"],["Named an Official Travel & Training Partner"]]},
 {id:"gold",n:"Gold",p:2999,c:"#e2c25a",b:[["Premium placement on training shirts"],["Announcement post, and featured all year"],["Weekly mentions across training and fights",52],["Tagged in all content, plus fight-week posts"]]},
 {id:"silver",n:"Silver",p:1500,c:"#b9bcc2",b:[["Featured logo on training shirts"],["Announcement post introducing your business"],["Monthly social media mentions all year",12],["Tagged in training posts and stories"]]},
 {id:"bronze",n:"Bronze",p:750,c:"#b0744a",b:[["Your logo worn through the year"],["Social media mentions",2],["Thank-you post welcoming you to Team Sarsha"],["Training photos and content for your channels"]]},
 {id:"teammate",n:"Teammate",p:299,c:"#5d7386",b:[["Your logo on Sarsha\u2019s training shirts"],["A shout-out welcoming you to Team Sarsha"]]}];
function pk(id){for(var i=0;i<PK.length;i++)if(PK[i].id===id)return PK[i];return PK[PK.length-1];}
function ben(id){var p=pk(id);return (p.inh?ben(p.inh):[]).concat(p.b);}
function mkDel(id){return ben(id).map(function(b){return b[1]?{t:b[0],of:b[1],n:0}:{t:b[0],done:false};});}
function mkNeed(){return [{t:"Logo file",done:false},{t:"Instagram and Facebook handles to tag",done:false},{t:"Invoice details (ABN and billing email)",done:false}];}
var ST=[["source","To contact"],["contacted","Contacted"],["talks","In talks"],["agreed","Agreed fights"]];
function stName(id){for(var i=0;i<ST.length;i++)if(ST[i][0]===id)return ST[i][1];return id==="passed"?"Passed":id;}

/* ---------- dates ---------- */
function today(){var d=new Date(new Date().toLocaleString("en-US",{timeZone:"Australia/Sydney"}));return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function dnum(iso){return iso?Date.parse(iso+"T12:00:00"):null;}
function fmtD(iso){return iso?new Date(iso+"T12:00:00").toLocaleDateString("en-AU",{day:"numeric",month:"short"}):"";}
function longD(iso){return iso?new Date(iso+"T12:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"long",year:"numeric"}):"";}
function daysFrom(iso){return iso?Math.round((dnum(iso)-dnum(today()))/864e5):null;}
function ago(iso){var d=-daysFrom(iso);return d<=0?"today":d===1?"yesterday":d+" days ago";}
function addDays(n){var d=new Date(dnum(today())+n*864e5);return d.toISOString().slice(0,10);}
function money(v){return "$"+Number(v||0).toLocaleString("en-AU",{maximumFractionDigits:0});}

/* ---------- state ---------- */
var S={tab:"spons",stage:"all",SP:[],OP:[],loaded:false,loading:false,err:"",open:null,kind:null,sheet:null,pk:"all",c:null,showArch:false};
async function load(){
 if(S.loading)return;S.loading=true;S.err="";
 try{
  var a=await sb.from("sfo_sponsors").select("*").order("agreed_on",{ascending:false});
  var b=await sb.from("sfo_opps").select("*").order("created_at",{ascending:true});
  if(a.error)throw a.error;if(b.error)throw b.error;
  S.SP=a.data||[];S.OP=b.data||[];S.loaded=true;
  S.SP.forEach(function(s){if(!s.deliverables){s.deliverables=mkDel(s.pkg);s.needs=s.needs||mkNeed();save("sp",s,{deliverables:s.deliverables,needs:s.needs},true);}if(!s.needs){s.needs=mkNeed();}});
 }catch(e){S.err=(e&&e.message)||"Couldn\u2019t load";}
 S.loading=false;if(view==="sfo")paint();
}
async function save(k,o,patch,quiet){
 patch.updated_at=new Date().toISOString();patch.updated_by=uid();
 Object.assign(o,patch);
 var r=await sb.from(k==="sp"?"sfo_sponsors":"sfo_opps").update(patch).eq("id",o.id);
 if(r.error){T("Didn\u2019t save: "+r.error.message);return false;}
 if(!quiet)T("Saved");return true;
}
async function insert(k,row){
 row.updated_by=uid();
 var r=await sb.from(k==="sp"?"sfo_sponsors":"sfo_opps").insert(row).select().single();
 if(r.error){T("Didn\u2019t save: "+r.error.message);return null;}
 (k==="sp"?S.SP:S.OP).push(r.data);return r.data;
}
function find(k,id){var L=k==="sp"?S.SP:S.OP;for(var i=0;i<L.length;i++)if(L[i].id===id)return L[i];return null;}

/* ---------- css ---------- */
var CSS='#sfoRoot{padding:4px 0 30px;color:#c3c6ca;font-size:14px}'+
'#sfoRoot .sfoBack{background:none;border:0;color:#858b92;font-weight:700;font-size:13px;padding:6px 0 10px;font-family:inherit;cursor:pointer}'+
'#sfoRoot .sfoTop{display:flex;align-items:center;gap:10px;margin:0 0 8px}'+
'#sfoRoot .sfoTop h2{margin:0;font-family:Oswald,sans-serif;font-weight:600;font-size:24px;letter-spacing:.03em;text-transform:uppercase;color:#f3f1ec;line-height:1.05}'+
'#sfoRoot .sfoTop small{display:block;color:#858b92;font-size:11.5px}'+
'#sfoRoot .lock{margin-left:auto;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#858b92;border:1px solid #323840;border-radius:99px;padding:4px 9px;white-space:nowrap}'+
'#sfoRoot .seg{display:flex;border-bottom:1px solid #23272d;margin:6px 0 14px}'+
'#sfoRoot .seg button{flex:1;min-height:44px;border:0;background:none;font-family:Oswald,sans-serif;font-weight:600;font-size:15px;letter-spacing:.08em;text-transform:uppercase;color:#858b92;border-bottom:2px solid transparent;margin-bottom:-1px}'+
'#sfoRoot .seg button.on{color:#f3f1ec;border-color:var(--gold,#d8b24f)}'+
'#sfoRoot .k{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#858b92}'+
'#sfoRoot .money{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}'+
'#sfoRoot .money div{background:#0e1013;border:1px solid #23272d;border-radius:14px;padding:11px 11px 9px}'+
'#sfoRoot .money b{display:block;font-family:Oswald,sans-serif;font-weight:600;font-size:23px;color:#f3f1ec;line-height:1.1;margin-top:3px}'+
'#sfoRoot .money .ok b{color:#4fcf8a}#sfoRoot .money .wn b{color:#f0b04a}'+
'#sfoRoot .alerts{display:grid;gap:6px;margin-top:10px}'+
'#sfoRoot .al{display:flex;gap:10px;align-items:flex-start;text-align:left;width:100%;background:rgba(240,176,74,.07);border:1px solid rgba(240,176,74,.3);border-radius:12px;padding:10px 12px;color:inherit;font-family:inherit}'+
'#sfoRoot .al i{flex:none;font-style:normal;width:22px;height:22px;border-radius:50%;background:#f0b04a;color:#1d1300;display:grid;place-items:center;font-weight:800;font-size:12px}'+
'#sfoRoot .al b{display:block;color:#f3f1ec;font-weight:700;font-size:13px}#sfoRoot .al span{font-size:12px}'+
'#sfoRoot .al.bad{background:rgba(255,122,133,.07);border-color:rgba(255,122,133,.3)}#sfoRoot .al.bad i{background:#ff7a85}'+
'#sfoRoot .acts{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}'+
'.sfoBtn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #323840;background:#15181c;font-weight:700;font-size:13px;color:#f3f1ec;text-decoration:none;font-family:inherit;cursor:pointer}'+
'.sfoBtn.g{background:var(--gold,#d8b24f);border-color:var(--gold,#d8b24f);color:#1a1203}.sfoBtn.sm{min-height:36px;font-size:12px;padding:0 11px;border-radius:10px}.sfoBtn.full{width:100%}'+
'#sfoRoot .sec{display:flex;justify-content:space-between;align-items:center;margin:20px 2px 8px}'+
'#sfoRoot .sec h3{margin:0;font-family:Oswald,sans-serif;font-weight:600;font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:#f3f1ec}'+
'#sfoRoot .sec span{font-size:12px;color:#858b92}'+
'.sfoCard{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#0e1013;border:1px solid #23272d;border-radius:14px;padding:12px;margin-bottom:6px;color:inherit;font-family:inherit;cursor:pointer}'+
'.sfoLogo{flex:none;width:46px;height:46px;border-radius:12px;background:#1c2025;display:grid;place-items:center;font-family:Oswald,sans-serif;font-weight:700;font-size:15px;color:#f3f1ec;overflow:hidden;border:1px solid #323840}'+
'.sfoLogo img{width:100%;height:100%;object-fit:contain;background:#fff}'+
'.sfoCard .mid{flex:1;min-width:0}.sfoCard b{display:block;color:#f3f1ec;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.sfoCard small{display:block;color:#858b92;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.sfoCard .rt{text-align:right;flex:none}.sfoCard .rt b{font-family:Oswald,sans-serif;font-weight:600;font-size:17px}.sfoCard .rt small{font-size:11px}'+
'.sfoChip{display:inline-block;font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border-radius:99px;padding:3px 8px;margin-top:4px}'+
'.sfoChip.ok{background:rgba(79,207,138,.15);color:#4fcf8a}.sfoChip.wn{background:rgba(240,176,74,.15);color:#f0b04a}.sfoChip.mt{background:#1c2025;color:#c3c6ca}.sfoChip.bl{background:rgba(95,184,255,.14);color:#5fb8ff}'+
'.sfoDot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:0}'+
'#sfoRoot .empty{background:#0e1013;border:1px dashed #323840;border-radius:14px;padding:16px;text-align:center;color:#858b92;font-size:13px}'+
'#sfoRoot .funnel{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}'+
'#sfoRoot .funnel button{background:#0e1013;border:1px solid #23272d;border-radius:12px;padding:10px 4px;text-align:center;color:inherit;font-family:inherit}'+
'#sfoRoot .funnel b{display:block;font-family:Oswald,sans-serif;font-weight:600;font-size:24px;color:#f3f1ec;line-height:1}#sfoRoot .funnel span{font-size:10px;color:#858b92;font-weight:700}'+
'#sfoRoot .stages{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}#sfoRoot .stages::-webkit-scrollbar{display:none}'+
'#sfoRoot .stages button{flex:none;min-height:40px;padding:0 13px;border-radius:99px;border:1px solid #323840;background:#0e1013;font-weight:700;font-size:12.5px;color:#c3c6ca;font-family:inherit}'+
'#sfoRoot .stages button.on{background:#f3f1ec;color:#0a0a0a;border-color:#f3f1ec}'+
'.sfoFight{display:block;width:100%;text-align:left;border-radius:16px;overflow:hidden;background:#0e1013;border:1px solid rgba(216,178,79,.45);margin-bottom:8px;padding:0;color:inherit;font-family:inherit;cursor:pointer}'+
'.sfoFight .hd{display:flex;gap:12px;align-items:center;padding:14px;background:linear-gradient(135deg,rgba(216,178,79,.16),transparent 60%)}'+
'.sfoFight .cal{flex:none;width:54px;border-radius:10px;background:var(--gold,#d8b24f);color:#1a1203;text-align:center;padding:6px 0 5px}.sfoFight .cal b{display:block;font-family:Oswald,sans-serif;font-size:24px;line-height:1}.sfoFight .cal span{font-size:10px;font-weight:800;letter-spacing:.1em}'+
'.sfoFight h4{margin:0;color:#f3f1ec;font-size:15px;font-weight:700;line-height:1.3}.sfoFight small{color:#858b92;font-size:12px}'+
'.sfoFight .cd{display:flex;justify-content:space-between;padding:10px 14px;border-top:1px solid #23272d;font-size:12px}.sfoFight .cd b{color:#f1d27a}'+
'#sfoSheet{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.66);display:flex;align-items:flex-end;justify-content:center}'+
'#sfoSheet .sh{width:100%;max-width:560px;max-height:92vh;overflow-y:auto;background:#050608;border-top:1px solid #323840;border-radius:22px 22px 0 0;padding:8px 16px calc(28px + env(safe-area-inset-bottom));color:#c3c6ca;font-size:14px;animation:sfoUp .22s ease-out}'+
'@keyframes sfoUp{from{transform:translateY(40px);opacity:.4}}'+
'#sfoSheet .grab{width:42px;height:4px;border-radius:9px;background:#323840;margin:4px auto 10px}'+
'#sfoSheet .shh{display:flex;gap:12px;align-items:center}#sfoSheet .shh .sfoLogo{width:56px;height:56px;font-size:19px}'+
'#sfoSheet .shh h2{margin:0;font-family:Oswald,sans-serif;font-weight:600;font-size:22px;color:#f3f1ec;text-transform:uppercase;line-height:1.1}#sfoSheet .shh small{color:#858b92}'+
'#sfoSheet .x{margin-left:auto;align-self:flex-start;width:36px;height:36px;border-radius:50%;border:1px solid #323840;background:#15181c;color:#f3f1ec;flex:none}'+
'#sfoSheet .box{background:#0e1013;border:1px solid #23272d;border-radius:14px;padding:12px 14px;margin-top:10px}'+
'#sfoSheet .box h5{margin:0 0 8px;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold,#d8b24f)}'+
'#sfoSheet .row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #23272d;font-size:13px}#sfoSheet .row:last-child{border-bottom:0}#sfoSheet .row b{color:#f3f1ec;font-weight:600;text-align:right;word-break:break-word}'+
'#sfoSheet .row a{color:#f3f1ec}'+
'#sfoSheet .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}#sfoSheet .steps span{text-align:center;font-size:11px;font-weight:700;padding:8px 4px;border-radius:9px;background:#1c2025;color:#858b92}'+
'#sfoSheet .steps span.d{background:rgba(79,207,138,.15);color:#4fcf8a}#sfoSheet .steps span.n{background:rgba(216,178,79,.16);color:#f1d27a}'+
'#sfoSheet .chk{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:none;border:0;padding:8px 0;border-bottom:1px solid #23272d;font-size:13px;color:#f3f1ec;font-family:inherit}#sfoSheet .chk:last-child{border-bottom:0}'+
'#sfoSheet .chk i{flex:none;width:20px;height:20px;border-radius:6px;border:2px solid #323840;display:grid;place-items:center;font-style:normal;font-size:12px;color:#06120b}'+
'#sfoSheet .chk.on i{background:#4fcf8a;border-color:#4fcf8a}#sfoSheet .chk.on span{color:#858b92;text-decoration:line-through}'+
'#sfoSheet .cnt{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #23272d;font-size:13px;color:#f3f1ec}#sfoSheet .cnt span{flex:1}'+
'#sfoSheet .cnt button{width:32px;height:32px;border-radius:8px;border:1px solid #323840;background:#15181c;font-weight:700;color:#f3f1ec}#sfoSheet .cnt em{font-style:normal;color:#c3c6ca;min-width:44px;text-align:center}'+
'#sfoSheet .mail{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #23272d;font-size:12.5px}#sfoSheet .mail:last-child{border-bottom:0}'+
'#sfoSheet .mail i{flex:none;font-style:normal;width:24px;height:24px;border-radius:7px;display:grid;place-items:center;font-size:12px;font-weight:800}'+
'#sfoSheet .mail i.out{background:rgba(95,184,255,.14);color:#5fb8ff}#sfoSheet .mail i.in{background:rgba(79,207,138,.15);color:#4fcf8a}#sfoSheet .mail i.wait{background:rgba(240,176,74,.15);color:#f0b04a}'+
'#sfoSheet .mail b{color:#f3f1ec;font-weight:600;display:block}#sfoSheet .mail small{color:#858b92}'+
'#sfoSheet .fld{display:grid;gap:5px;margin-top:10px}#sfoSheet .fld label{font-size:10.5px;font-weight:700;color:#858b92;letter-spacing:.08em;text-transform:uppercase}'+
'#sfoSheet input,#sfoSheet select,#sfoSheet textarea{width:100%;background:#15181c;border:1px solid #323840;border-radius:10px;padding:10px 12px;font-size:14px;color:#f3f1ec;font-family:inherit;box-sizing:border-box}'+
'#sfoSheet textarea{min-height:180px;resize:vertical;line-height:1.5}'+
'#sfoSheet .pick{display:flex;gap:4px;flex-wrap:wrap}#sfoSheet .pick button{flex:1 1 auto;min-height:36px;border-radius:9px;border:1px solid #323840;background:#15181c;font-size:11.5px;font-weight:700;color:#c3c6ca;padding:0 8px;font-family:inherit}'+
'#sfoSheet .pick button.on{background:var(--gold,#d8b24f);border-color:var(--gold,#d8b24f);color:#1a1203}'+
'#sfoSheet .two{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}'+
'#sfoSheet .err{color:#ff7a85;font-size:12.5px;min-height:18px;margin-top:6px}';
function css(){if($id("sfoCss"))return;var s=document.createElement("style");s.id="sfoCss";s.textContent=CSS;document.head.appendChild(s);}

/* ---------- helpers for views ---------- */
function initials(n){return String(n||"?").split(/\s+/).map(function(w){return w[0]||"";}).slice(0,2).join("").toUpperCase();}
function logoEl(o){return '<span class="sfoLogo">'+(o.logo?'<img src="'+esc(o.logo)+'" alt="">':esc(initials(o.biz||o.name)))+'</span>';}
function prog(s){var d=s.deliverables||[],all=0,done=0;d.forEach(function(x){all+=x.of||1;done+=x.of?x.n:(x.done?1:0);});return [done,all];}
function waitOf(o){var e=o.emails||[];for(var i=0;i<e.length;i++)if(e[i].d==="wait")return e[i];return null;}
function totals(){var t={agreed:0,paid:0};S.SP.forEach(function(s){if(s.stage==="archived")return;var a=Number(s.amount||pk(s.pkg).p);t.agreed+=a;if(s.stage==="paid")t.paid+=a;});t.owed=t.agreed-t.paid;return t;}
function spChip(s){if(s.stage==="paid")return '<span class="sfoChip ok">Paid '+fmtD(s.paid_on)+'</span>';if(s.invoiced_on)return '<span class="sfoChip bl">Invoiced '+fmtD(s.invoiced_on)+'</span>';return '<span class="sfoChip wn">Awaiting payment</span>';}
function spCard(s){var p=pk(s.pkg),g=prog(s);return '<button class="sfoCard" data-sfo-open="sp:'+s.id+'">'+logoEl(s)+'<span class="mid"><b>'+esc(s.biz)+'</b><small><span class="sfoDot" style="background:'+p.c+'"></span>'+esc(p.n)+' \u00b7 Sarsha\u2019s promo '+g[0]+'/'+g[1]+'</small>'+spChip(s)+'</span><span class="rt"><b>'+money(s.amount||p.p)+'</b></span></button>';}
function spAlerts(){var a=[];S.SP.forEach(function(s){if(s.stage!=="agreed")return;var w=waitOf(s);
 if(w&&/haven.t replied/i.test(w.x))a.push('<button class="al bad" data-sfo-open="sp:'+s.id+'"><i>!</i><div><b>Reply to '+esc(s.biz)+'</b><span>Signed up '+ago(s.agreed_on)+'. No reply sent yet</span></div></button>');
 else if(!s.invoiced_on)a.push('<button class="al" data-sfo-open="sp:'+s.id+'"><i>!</i><div><b>Invoice '+esc(s.biz)+'</b><span>Agreed '+fmtD(s.agreed_on)+'. No invoice sent yet</span></div></button>');
 else if(daysFrom(s.invoiced_on)<-14)a.push('<button class="al" data-sfo-open="sp:'+s.id+'"><i>!</i><div><b>Chase payment: '+esc(s.biz)+'</b><span>Invoiced '+ago(s.invoiced_on)+'</span></div></button>');});return a;}
function vSpons(){
 var t=totals(),ag=S.SP.filter(function(s){return s.stage==="agreed";}),pd=S.SP.filter(function(s){return s.stage==="paid";}),ar=S.SP.filter(function(s){return s.stage==="archived";}),al=spAlerts();
 return '<div class="money"><div class="ok"><span class="k">Paid</span><b>'+money(t.paid)+'</b></div><div class="wn"><span class="k">Owed</span><b>'+money(t.owed)+'</b></div><div><span class="k">Agreed</span><b>'+money(t.agreed)+'</b></div></div>'+
 (al.length?'<div class="alerts">'+al.join("")+'</div>':'')+
 '<div class="acts"><button class="sfoBtn g" data-sfo-sheet="send">Send sponsor link</button><button class="sfoBtn" data-sfo-sheet="addsp">Add a sponsor</button></div>'+
 '<div class="sec"><h3>Agreed</h3><span>'+ag.length+' \u00b7 waiting on payment</span></div>'+(ag.length?ag.map(spCard).join(""):'<div class="empty">Nobody waiting on payment</div>')+
 '<div class="sec"><h3>Paid</h3><span>'+pd.length+'</span></div>'+(pd.length?pd.map(spCard).join(""):'<div class="empty">No paid sponsors yet</div>')+
 (ar.length?'<div class="sec"><h3>Archived</h3><button class="sfoBtn sm" data-sfo-arch>'+(S.showArch?'Hide':'Show '+ar.length)+'</button></div>'+(S.showArch?ar.map(spCard).join(""):''):'');
}
function opChip(o){var w=waitOf(o);if(o.stage==="source")return '<span class="sfoChip mt">To contact</span>';if(o.stage==="passed")return '<span class="sfoChip mt">Passed</span>';if(w&&o.last_contact)return '<span class="sfoChip wn">Awaiting reply \u00b7 '+(-daysFrom(o.last_contact))+'d</span>';if(o.stage==="talks")return '<span class="sfoChip bl">In talks</span>';return '<span class="sfoChip ok">'+esc(stName(o.stage))+'</span>';}
function opCard(o){return '<button class="sfoCard" data-sfo-open="op:'+o.id+'"><span class="sfoLogo" style="font-size:13px">'+esc(initials(o.name))+'</span><span class="mid"><b>'+esc(o.name)+'</b><small>'+esc(o.kind)+(o.place?' \u00b7 '+esc(o.place):(o.contact?' \u00b7 '+esc(o.contact):''))+'</small>'+opChip(o)+'</span><span class="rt"><small style="color:#858b92">'+(o.last_contact?'Last contact<br>'+ago(o.last_contact):'Not contacted')+'</small></span></button>';}
function vPro(){
 var open=S.OP.filter(function(o){return o.stage!=="agreed"&&o.stage!=="passed";});
 var list=S.stage==="all"?open:S.OP.filter(function(o){return o.stage===S.stage;});
 var fights=S.OP.filter(function(o){return o.stage==="agreed";}).sort(function(a,b){return (dnum(a.fight_date)||9e15)-(dnum(b.fight_date)||9e15);});
 var due=S.OP.filter(function(o){return o.next_due&&o.stage!=="agreed"&&o.stage!=="passed";}).sort(function(a,b){return dnum(a.next_due)-dnum(b.next_due);});
 var passed=S.OP.filter(function(o){return o.stage==="passed";}).length;
 return '<div class="funnel">'+ST.map(function(s){return '<button data-sfo-stage="'+(s[0]==="agreed"?"all":s[0])+'"><b>'+S.OP.filter(function(o){return o.stage===s[0];}).length+'</b><span>'+s[1]+'</span></button>';}).join("")+'</div>'+
 (due.length?'<div class="alerts">'+due.slice(0,3).map(function(o){var d=daysFrom(o.next_due);return '<button class="al'+(d<0?' bad':'')+'" data-sfo-open="op:'+o.id+'"><i>!</i><div><b>'+esc(o.next_step||'Follow up')+': '+esc(o.name)+'</b><span>'+(d<0?'Overdue since ':d===0?'Due today, ':'Due ')+fmtD(o.next_due)+(o.last_contact?' \u00b7 last contact '+ago(o.last_contact):'')+'</span></div></button>';}).join("")+'</div>':'')+
 '<div class="sec"><h3>Fight dates</h3><span>'+fights.length+' agreed</span></div>'+
 (fights.length?fights.map(function(f){var d=f.fight_date?new Date(f.fight_date+"T12:00:00"):null,n=daysFrom(f.fight_date);return '<button class="sfoFight" data-sfo-open="op:'+f.id+'"><div class="hd"><span class="cal">'+(d?'<b>'+d.getDate()+'</b><span>'+d.toLocaleDateString("en-AU",{month:"short"}).toUpperCase()+'</span>':'<b>?</b><span>DATE</span>')+'</span><span><h4>'+esc(f.name)+'</h4><small>'+esc(f.venue||f.place||'Venue TBC')+(f.opponent?' \u00b7 v '+esc(f.opponent):'')+'</small></span></div><div class="cd"><span>'+esc(f.rounds||'Rounds TBC')+'</span><b>'+(n==null?'Set a date':n>0?n+' days to go':n===0?'Fight day':'Done')+'</b></div></button>';}).join(""):'<div class="empty">No fights agreed yet</div>')+
 '<div class="sec"><h3>Pipeline</h3><button class="sfoBtn sm" data-sfo-sheet="addop">+ Add</button></div>'+
 '<div class="stages">'+[["all","All open"]].concat(ST.slice(0,3)).concat(passed?[["passed","Passed"]]:[]).map(function(s){var c=s[0]==="all"?open.length:S.OP.filter(function(o){return o.stage===s[0];}).length;return '<button class="'+(S.stage===s[0]?'on':'')+'" data-sfo-stage="'+s[0]+'">'+s[1]+' \u00b7 '+c+'</button>';}).join("")+'</div>'+
 '<div style="margin-top:10px">'+(list.length?list.map(opCard).join(""):'<div class="empty">Nothing at this stage</div>')+'</div>';
}
function paint(){
 css();var m=$id("main");if(!m)return;
 if(!ok()){m.innerHTML='<div class="empty" style="margin-top:40px">This section is private.</div>';return;}
 if(!S.loaded&&!S.loading)load();
 var body=S.err?'<div class="empty">Couldn\u2019t load: '+esc(S.err)+'<br><button class="sfoBtn sm" style="margin-top:10px" data-sfo-reload>Try again</button></div>':!S.loaded?'<div class="empty">Loading\u2026</div>':(S.tab==="spons"?vSpons():vPro());
 m.innerHTML='<div id="sfoRoot"><button class="sfoBack" onclick="go(\'home\')">\u2039 Home</button><div class="sfoTop"><div><h2>Sarsha\u2019s fight office</h2><small>Signed in as '+me()+' \u00b7 Team Sarsha</small></div><span class="lock">\ud83d\udd12 Jake &amp; Sarsha</span></div>'+
 '<div class="seg"><button class="'+(S.tab==="spons"?'on':'')+'" data-sfo-tab="spons">Sponsorship</button><button class="'+(S.tab==="pro"?'on':'')+'" data-sfo-tab="pro">Pro boxing</button></div>'+body+'</div>';
 sheet();
}

/* ---------- sheets ---------- */
function mails(list){list=(list||[]).slice();var w=list.filter(function(e){return e.d==="wait";}),r=list.filter(function(e){return e.d!=="wait";}).reverse();list=w.concat(r);
 return list.length?list.map(function(x){return '<div class="mail"><i class="'+x.d+'">'+(x.d==="out"?"\u2197":x.d==="in"?"\u2199":"\u2026")+'</i><div><b>'+esc(x.x)+'</b><small>'+(x.d==="wait"?"Still waiting":fmtD(x.on)+(x.by?' \u00b7 '+esc(x.by):''))+'</small></div></div>';}).join(""):'<div style="color:#858b92;font-size:13px">No emails logged yet</div>';}
function sheet(){
 var h="";
 if(S.open&&S.kind==="sp"){var s=find("sp",S.open);if(!s){S.open=null;return sheet();}var p=pk(s.pkg),g=prog(s),st=s.stage==="paid"?3:s.invoiced_on?2:1;
  h='<div class="shh">'+logoEl(s)+'<div><h2>'+esc(s.biz)+'</h2><small><span class="sfoDot" style="background:'+p.c+'"></span>'+esc(p.n)+' \u00b7 '+money(s.amount||p.p)+' a year</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="box"><h5>Payment</h5><div class="steps"><span class="d">Agreed '+fmtD(s.agreed_on)+'</span><span class="'+(st>=2?'d':'n')+'">'+(s.invoiced_on?'Invoiced '+fmtD(s.invoiced_on):'Invoice')+'</span><span class="'+(st>=3?'d':st===2?'n':'')+'">'+(s.stage==="paid"?'Paid '+fmtD(s.paid_on):'Paid')+'</span></div>'+
  '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">'+(s.stage==="paid"?'<span style="color:#4fcf8a;font-weight:700;font-size:13px">Paid in full</span>':(!s.invoiced_on?'<button class="sfoBtn sm g" data-sfo-act="invoiceMail">Email the invoice</button><button class="sfoBtn sm" data-sfo-act="invoiced">Mark invoiced</button>':'')+'<button class="sfoBtn sm" data-sfo-act="paid">Mark as paid</button>')+'</div></div>'+
  '<div class="box"><h5>Logo</h5><div style="display:flex;gap:12px;align-items:center">'+logoEl(s)+'<div style="flex:1"><div style="font-size:13px;font-weight:700;color:'+(s.logo?'#4fcf8a':'#f0b04a')+'">'+(s.logo?'Logo saved':'No logo yet')+'</div><small style="color:#858b92">For shirts, posts and fight-night screens</small></div><label class="sfoBtn sm" style="cursor:pointer">'+(s.logo?'Replace':'Upload')+'<input type="file" accept="image/*" hidden data-sfo-logo="'+s.id+'"></label></div>'+(s.logo?'<a class="sfoBtn sm full" style="margin-top:8px" href="'+esc(s.logo)+'" download="'+esc(s.biz)+'-logo.png">Download logo</a>':'')+'</div>'+
  '<div class="box"><h5>What Sarsha does for them \u00b7 '+g[0]+'/'+g[1]+'</h5>'+(s.deliverables||[]).map(function(x,i){return x.of?'<div class="cnt"><span>'+esc(x.t)+'</span><button data-sfo-dn="'+i+'" data-v="-1" aria-label="One less">\u2212</button><em>'+x.n+'/'+x.of+'</em><button data-sfo-dn="'+i+'" data-v="1" aria-label="One more">+</button></div>':'<button class="chk'+(x.done?' on':'')+'" data-sfo-dl="'+i+'"><i>'+(x.done?'\u2713':'')+'</i><span>'+esc(x.t)+'</span></button>';}).join("")+'</div>'+
  '<div class="box"><h5>What we need from them</h5>'+(s.needs||[]).map(function(x,i){return '<button class="chk'+(x.done?' on':'')+'" data-sfo-nd="'+i+'"><i>'+(x.done?'\u2713':'')+'</i><span>'+esc(x.t)+'</span></button>';}).join("")+'</div>'+
  '<div class="box"><h5>Emails</h5>'+mails(s.emails)+'<div class="two"><button class="sfoBtn sm g" data-sfo-act="write">Write to '+esc((s.contact||'them').split(" ")[0])+'</button><button class="sfoBtn sm" data-sfo-act="gotReply">They replied</button></div></div>'+
  '<div class="box"><h5>Contact</h5><div class="row"><span>'+esc(s.contact||'Contact')+'</span><b>'+(s.phone?'<a href="tel:'+esc(s.phone.replace(/\s/g,''))+'">'+esc(s.phone)+'</a>':'\u2013')+'</b></div><div class="row"><span>Email</span><b style="font-size:12px">'+(s.email?'<a href="mailto:'+esc(s.email)+'">'+esc(s.email)+'</a>':'\u2013')+'</b></div>'+(s.notes?'<div class="row"><span>Notes</span><b style="font-weight:500;font-size:12.5px">'+esc(s.notes)+'</b></div>':'')+'</div>'+
  '<div class="two"><button class="sfoBtn sm" data-sfo-sheet="editsp">Edit details</button><button class="sfoBtn sm" data-sfo-act="archive">'+(s.stage==="archived"?'Restore':'Archive')+'</button></div>';}
 else if(S.open&&S.kind==="op"){var o=find("op",S.open);if(!o){S.open=null;return sheet();}
  h='<div class="shh"><span class="sfoLogo">'+esc(initials(o.name))+'</span><div><h2>'+esc(o.name)+'</h2><small>'+esc(o.kind)+(o.place?' \u00b7 '+esc(o.place):'')+'</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="box"><h5>Stage</h5><div class="pick">'+ST.concat([["passed","Passed"]]).map(function(s){return '<button class="'+(o.stage===s[0]?'on':'')+'" data-sfo-mv="'+s[0]+'">'+s[1]+'</button>';}).join("")+'</div></div>'+
  (o.stage==="agreed"?'<div class="box"><h5>Fight</h5><div class="row"><span>Date</span><b>'+(o.fight_date?longD(o.fight_date):'Not set')+'</b></div><div class="row"><span>Venue</span><b>'+esc(o.venue||'TBC')+'</b></div><div class="row"><span>Opponent</span><b>'+esc(o.opponent||'TBC')+'</b></div><div class="row"><span>Rounds</span><b>'+esc(o.rounds||'TBC')+'</b></div><div class="row"><span>Purse</span><b>'+esc(o.purse||'TBC')+'</b></div><button class="sfoBtn sm full" style="margin-top:8px" data-sfo-sheet="editop">Edit fight details</button></div>':'')+
  '<div class="box"><h5>Contact</h5><div class="row"><span>Who</span><b>'+esc(o.contact||'To find')+'</b></div><div class="row"><span>Email</span><b style="font-size:12px">'+(o.email?'<a href="mailto:'+esc(o.email)+'">'+esc(o.email)+'</a>':'To find')+'</b></div>'+(o.phone?'<div class="row"><span>Phone</span><b><a href="tel:'+esc(o.phone.replace(/\s/g,''))+'">'+esc(o.phone)+'</a></b></div>':'')+(o.link?'<div class="row"><span>Website</span><b><a href="'+esc(o.link)+'" target="_blank" rel="noopener">Open</a></b></div>':'')+'<div class="row"><span>Last contact</span><b>'+(o.last_contact?fmtD(o.last_contact)+' \u00b7 '+ago(o.last_contact):'Not yet')+'</b></div>'+(o.next_due?'<div class="row"><span>Next step</span><b>'+esc(o.next_step||'Follow up')+' \u00b7 '+fmtD(o.next_due)+'</b></div>':'')+'</div>'+
  (o.notes?'<div class="box"><h5>Notes</h5><div style="font-size:13px;color:#f3f1ec;white-space:pre-wrap">'+esc(o.notes)+'</div></div>':'')+
  '<div class="box"><h5>Emails &amp; calls</h5>'+mails(o.emails)+'<div class="two"><button class="sfoBtn sm g" data-sfo-act="pitch">'+(o.stage==="source"?'Write intro email':'Write follow-up')+'</button><button class="sfoBtn sm" data-sfo-act="gotReply">They replied</button></div><button class="sfoBtn sm full" style="margin-top:6px" data-sfo-act="call">Log a phone call</button></div>'+
  '<div class="two"><button class="sfoBtn sm" data-sfo-sheet="editop">Edit details</button><button class="sfoBtn sm" data-sfo-sheet="followup">Set follow-up</button></div>';}
 else if(S.sheet==="send"){var pp=S.pk!=="all"?pk(S.pk):null;
  h='<div class="shh"><div><h2>Send sponsor link</h2><small>Sarsha\u2019s sponsor page, with every package</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="box"><h5>Mention a package?</h5><div class="pick">'+[["all","None"]].concat(PK.map(function(p){return [p.id,p.n];})).map(function(x){return '<button class="'+(S.pk===x[0]?'on':'')+'" data-sfo-pk="'+x[0]+'">'+esc(x[1])+'</button>';}).join("")+'</div></div>'+
  '<div class="box"><h5>Message</h5><textarea id="sfoMsg">Hi, this is Sarsha\u2019s sponsorship page. She\u2019s the WBO Asia Pacific champion, training out of Legacy Gym Kincumber, and we\u2019re building her team for 2027. '+(pp?'The '+pp.n+' package is '+money(pp.p)+' for the year. ':'')+'Have a look: '+LINK+'</textarea></div>'+
  '<div class="two"><button class="sfoBtn g" data-sfo-act="share">Share</button><button class="sfoBtn" data-sfo-act="copy">Copy</button></div><a class="sfoBtn full" style="margin-top:6px" href="'+LINK+'" target="_blank" rel="noopener">Open her sponsor page</a>';}
 else if(S.sheet==="compose"&&S.c){var c=S.c;
  h='<div class="shh"><div><h2>'+esc(c.title)+'</h2><small>To '+esc(c.to||'add an email address first')+'</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="fld"><label for="sfoSu">Subject</label><input id="sfoSu" value="'+esc(c.su)+'"></div><div class="fld"><label for="sfoBody">Email</label><textarea id="sfoBody">'+esc(c.body)+'</textarea></div>'+
  '<div class="two"><button class="sfoBtn g" data-sfo-act="gmail">Open in Gmail</button><button class="sfoBtn" data-sfo-act="logSent">I\u2019ve sent it</button></div><p style="font-size:12px;color:#858b92;margin:10px 2px 0">Open in Gmail starts the email for you to check and send. Then tap \u201cI\u2019ve sent it\u201d so it shows here as waiting on a reply.</p>';}
 else if(S.sheet==="addsp"||S.sheet==="editsp"){var e=S.sheet==="editsp"?find("sp",S.open2):null;
  h='<div class="shh"><div><h2>'+(e?'Edit sponsor':'Add a sponsor')+'</h2><small>Someone who has agreed to sponsor Sarsha</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="fld"><label for="f1">Business</label><input id="f1" value="'+esc(e?e.biz:'')+'"></div><div class="fld"><label for="f2">Contact person</label><input id="f2" value="'+esc(e?e.contact:'')+'"></div>'+
  '<div class="fld"><label for="f3">Mobile</label><input id="f3" type="tel" value="'+esc(e?e.phone:'')+'"></div><div class="fld"><label for="f4">Email</label><input id="f4" type="email" value="'+esc(e?e.email:'')+'"></div>'+
  '<div class="fld"><label for="f5">Package</label><select id="f5">'+PK.map(function(p){return '<option value="'+p.id+'"'+(e&&e.pkg===p.id?' selected':'')+'>'+esc(p.n)+' \u00b7 '+money(p.p)+'</option>';}).join("")+'</select></div>'+
  '<div class="fld"><label for="f6">Amount (if different)</label><input id="f6" inputmode="decimal" value="'+esc(e&&e.amount!=null?e.amount:'')+'"></div>'+
  '<div class="fld"><label for="f7">Agreed on</label><input id="f7" type="date" value="'+esc(e?e.agreed_on:today())+'"></div><div class="fld"><label for="f8">Notes</label><textarea id="f8" style="min-height:80px">'+esc(e?e.notes:'')+'</textarea></div>'+
  '<div class="err" id="sfoErr"></div><button class="sfoBtn g full" data-sfo-act="'+(e?'saveEditSp':'saveSp')+'">'+(e?'Save':'Add sponsor')+'</button>';}
 else if(S.sheet==="addop"||S.sheet==="editop"){var q=S.sheet==="editop"?find("op",S.open2):null;
  h='<div class="shh"><div><h2>'+(q?'Edit':'Add to the pipeline')+'</h2><small>A promoter, matchmaker, title body or fight</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="fld"><label for="g1">Name</label><input id="g1" value="'+esc(q?q.name:'')+'" placeholder="e.g. No Limit Boxing"></div>'+
  '<div class="fld"><label for="g2">Type</label><select id="g2">'+["Promoter","Matchmaker","Title body","Fight","Camp","Other"].map(function(k){return '<option'+(q&&q.kind===k?' selected':'')+'>'+k+'</option>';}).join("")+'</select></div>'+
  '<div class="fld"><label for="g3">Contact person</label><input id="g3" value="'+esc(q?q.contact:'')+'"></div><div class="fld"><label for="g4">Email</label><input id="g4" type="email" value="'+esc(q?q.email:'')+'"></div><div class="fld"><label for="g5">Phone</label><input id="g5" type="tel" value="'+esc(q?q.phone:'')+'"></div><div class="fld"><label for="g6">Where</label><input id="g6" value="'+esc(q?q.place:'')+'"></div>'+
  '<div class="fld"><label for="g7">Stage</label><select id="g7">'+ST.concat([["passed","Passed"]]).map(function(s){return '<option value="'+s[0]+'"'+((q?q.stage:'source')===s[0]?' selected':'')+'>'+s[1]+'</option>';}).join("")+'</select></div>'+
  '<div class="box"><h5>If it\u2019s an agreed fight</h5><div class="fld" style="margin-top:0"><label for="g8">Fight date</label><input id="g8" type="date" value="'+esc(q?q.fight_date:'')+'"></div><div class="fld"><label for="g9">Venue</label><input id="g9" value="'+esc(q?q.venue:'')+'"></div><div class="fld"><label for="g10">Opponent</label><input id="g10" value="'+esc(q?q.opponent:'')+'"></div><div class="fld"><label for="g11">Rounds</label><input id="g11" value="'+esc(q?q.rounds:'')+'" placeholder="e.g. 8 x 2 min"></div><div class="fld"><label for="g12">Purse</label><input id="g12" value="'+esc(q?q.purse:'')+'"></div></div>'+
  '<div class="fld"><label for="g13">Notes</label><textarea id="g13" style="min-height:80px">'+esc(q?q.notes:'')+'</textarea></div>'+
  '<div class="err" id="sfoErr"></div><button class="sfoBtn g full" data-sfo-act="'+(q?'saveEditOp':'saveOp')+'">'+(q?'Save':'Add')+'</button>';}
 else if(S.sheet==="followup"){var f=find("op",S.open2);
  h='<div class="shh"><div><h2>Set follow-up</h2><small>'+esc(f.name)+'</small></div><button class="x" data-sfo-close aria-label="Close">\u2715</button></div>'+
  '<div class="fld"><label for="h1">What\u2019s next</label><input id="h1" value="'+esc(f.next_step||'Follow up')+'"></div><div class="fld"><label for="h2">When</label><input id="h2" type="date" value="'+esc(f.next_due||addDays(7))+'"></div>'+
  '<div class="two"><button class="sfoBtn g" data-sfo-act="saveFollow">Save</button><button class="sfoBtn" data-sfo-act="clearFollow">Clear</button></div>';}
 var host=$id("sfoSheet");
 if(!h){if(host)host.remove();return;}
 if(!host){host=document.createElement("div");host.id="sfoSheet";document.body.appendChild(host);}
 host.innerHTML='<div class="sh" role="dialog" aria-modal="true"><div class="grab"></div>'+h+'</div>';
}
function closeSheet(){S.open=null;S.sheet=null;S.c=null;sheet();}
function back(k,id){S.sheet=null;S.c=null;S.open=id;S.kind=k;paint();}
function v(id){var e=$id(id);return e?String(e.value||"").trim():"";}
function addMail(o,e){var L=(o.emails||[]).filter(function(x){return x.d!=="wait";});e.on=e.on||today();e.by=me();L.push(e);return L;}

/* ---------- logo: shrink to max 400px before saving ---------- */
function shrink(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=400,w=im.width,hh=im.height,k=Math.min(1,m/Math.max(w,hh));var c=document.createElement("canvas");c.width=Math.round(w*k);c.height=Math.round(hh*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/png"));};im.onerror=function(){T("That file isn\u2019t an image");};im.src=r.result;};r.readAsDataURL(file);}

/* ---------- events ---------- */
document.addEventListener("click",async function(ev){
 var t=ev.target;if(!t.closest)return;
 if(!t.closest("#sfoRoot")&&!t.closest("#sfoSheet"))return;
 var b;
 if(t.id==="sfoSheet"){closeSheet();return;}
 if(t.closest("[data-sfo-close]")){closeSheet();return;}
 if(t.closest("[data-sfo-reload]")){S.loaded=false;load();paint();return;}
 if(b=t.closest("[data-sfo-tab]")){S.tab=b.getAttribute("data-sfo-tab");paint();window.scrollTo(0,0);return;}
 if(b=t.closest("[data-sfo-stage]")){S.stage=b.getAttribute("data-sfo-stage");paint();return;}
 if(t.closest("[data-sfo-arch]")){S.showArch=!S.showArch;paint();return;}
 if(b=t.closest("[data-sfo-open]")){var p=b.getAttribute("data-sfo-open").split(":");S.kind=p[0];S.open=p[1];S.sheet=null;sheet();return;}
 if(b=t.closest("[data-sfo-sheet]")){var sh=b.getAttribute("data-sfo-sheet");S.open2=S.open;if(sh==="send")S.pk="all";S.sheet=sh;S.open=null;sheet();return;}
 if(b=t.closest("[data-sfo-pk]")){S.pk=b.getAttribute("data-sfo-pk");sheet();return;}
 var sp=S.kind==="sp"&&S.open?find("sp",S.open):null,op=S.kind==="op"&&S.open?find("op",S.open):null;
 if(b=t.closest("[data-sfo-dl]")){var i=+b.getAttribute("data-sfo-dl");sp.deliverables[i].done=!sp.deliverables[i].done;sheet();paint();save("sp",sp,{deliverables:sp.deliverables},true);return;}
 if(b=t.closest("[data-sfo-dn]")){var j=+b.getAttribute("data-sfo-dn"),x=sp.deliverables[j];x.n=Math.max(0,Math.min(x.of,x.n+(+b.getAttribute("data-v"))));paint();save("sp",sp,{deliverables:sp.deliverables},true);return;}
 if(b=t.closest("[data-sfo-nd]")){var n=+b.getAttribute("data-sfo-nd");sp.needs[n].done=!sp.needs[n].done;paint();save("sp",sp,{needs:sp.needs},true);return;}
 if(b=t.closest("[data-sfo-mv]")){var stg=b.getAttribute("data-sfo-mv"),pt={stage:stg};if(stg!=="source"&&!op.last_contact)pt.last_contact=today();await save("op",op,pt,true);paint();T("Moved to "+stName(stg));return;}
 if(!(b=t.closest("[data-sfo-act]")))return;
 var a=b.getAttribute("data-sfo-act");
 if(a==="invoiceMail"){S.c={k:"sp",id:sp.id,act:"invoice",title:"Invoice email",to:sp.email,su:"Your sponsorship of Sarsha McGurk: invoice",body:"Hi "+(sp.contact||"there").split(" ")[0]+",\n\nThanks again for sponsoring Sarsha. Attached is the invoice for the "+pk(sp.pkg).n+" package, "+money(sp.amount||pk(sp.pkg).p)+" for the year.\n\nCould you also send through your logo and your Instagram and Facebook handles so we can tag you?\n\nThanks,\nTeam Sarsha"};S.sheet="compose";S.open=null;sheet();return;}
 if(a==="write"){S.c={k:"sp",id:sp.id,act:"email",title:"Email "+sp.biz,to:sp.email,su:"Sarsha McGurk sponsorship",body:"Hi "+(sp.contact||"there").split(" ")[0]+",\n\n\n\nThanks,\nTeam Sarsha"};S.sheet="compose";S.open=null;sheet();return;}
 if(a==="pitch"){var intro=op.stage==="source";S.c={k:"op",id:op.id,act:"pitch",title:intro?"Intro to "+op.name:"Follow-up to "+op.name,to:op.email,su:intro?"Sarsha McGurk, WBO Asia Pacific champion":"Following up: Sarsha McGurk",body:intro?"Hi"+(op.contact?" "+op.contact.split(/[ ,]/)[0]:"")+",\n\nI\u2019m Jake Williamson, head coach at Legacy Gym on the Central Coast, NSW. I manage Sarsha McGurk, current "+RECORD+".\n\nShe\u2019s looking for her next fights in 2027 and we\u2019d love to talk about a spot on one of your shows. Happy to send her record, footage and available dates.\n\nThanks,\nJake Williamson\nLegacy Gym Kincumber\n0492 199 419":"Hi"+(op.contact?" "+op.contact.split(/[ ,]/)[0]:"")+",\n\nJust following up on my last email about Sarsha McGurk. Happy to jump on a call whenever suits.\n\nThanks,\nJake"};S.sheet="compose";S.open=null;sheet();return;}
 if(a==="gmail"){var c=S.c;c.su=v("sfoSu");c.body=$id("sfoBody").value;if(!c.to){T("Add their email address first (Edit details)");return;}window.open("https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(c.to)+"&su="+encodeURIComponent(c.su)+"&body="+encodeURIComponent(c.body),"_blank");return;}
 if(a==="logSent"){var c2=S.c,o2=find(c2.k,c2.id),L=addMail(o2,{d:"out",x:c2.act==="invoice"?"Invoice emailed":c2.act==="pitch"?(o2.stage==="source"?"Intro email sent":"Follow-up email sent"):"Email sent: "+(v("sfoSu")||"")});L.push({d:"wait",x:"Waiting on a reply"});var pt2={emails:L};
  if(c2.act==="invoice")pt2.invoiced_on=today();
  if(c2.k==="op"){pt2.last_contact=today();if(o2.stage==="source")pt2.stage="contacted";pt2.next_due=addDays(7);pt2.next_step="Follow up";}
  await save(c2.k,o2,pt2,true);T("Logged as sent");back(c2.k,c2.id);return;}
 if(a==="gotReply"){var o3=sp||op,k3=sp?"sp":"op";var who=window.prompt("What did they say? (short note)","Replied");if(who===null)return;var L3=addMail(o3,{d:"in",x:who||"Replied"});var pt3={emails:L3};if(k3==="op"){pt3.last_contact=today();if(o3.stage==="contacted")pt3.stage="talks";}await save(k3,o3,pt3,true);T("Reply logged");sheet();paint();return;}
 if(a==="call"){var nt=window.prompt("Phone call note","Phone call");if(nt===null)return;var L4=(op.emails||[]).slice();L4.push({d:"out",on:today(),by:me(),x:nt||"Phone call"});var pt4={emails:L4,last_contact:today()};if(op.stage==="source")pt4.stage="contacted";await save("op",op,pt4,true);T("Call logged");sheet();paint();return;}
 if(a==="invoiced"){await save("sp",sp,{invoiced_on:today(),emails:addMail(sp,{d:"out",x:"Invoice sent"}).concat([{d:"wait",x:"Waiting on payment"}])},true);T("Marked as invoiced");sheet();paint();return;}
 if(a==="paid"){await save("sp",sp,{stage:"paid",paid_on:today(),emails:addMail(sp,{d:"in",x:"Payment received"})},true);T(sp.biz+" moved to Paid");sheet();paint();return;}
 if(a==="archive"){await save("sp",sp,{stage:sp.stage==="archived"?"agreed":"archived"},true);T(sp.stage==="archived"?"Archived":"Restored");closeSheet();paint();return;}
 if(a==="share"){var m=$id("sfoMsg").value;if(navigator.share){try{await navigator.share({text:m});}catch(e){}}else{try{await navigator.clipboard.writeText(m);T("Copied");}catch(e){T("Couldn\u2019t copy");}}return;}
 if(a==="copy"){try{await navigator.clipboard.writeText($id("sfoMsg").value);T("Copied. Paste it anywhere");}catch(e){T("Couldn\u2019t copy");}return;}
 if(a==="saveSp"||a==="saveEditSp"){var biz=v("f1");if(!biz){$id("sfoErr").textContent="Add the business name.";return;}var row={biz:biz,contact:v("f2")||null,phone:v("f3")||null,email:v("f4")||null,pkg:v("f5"),amount:v("f6")?Number(v("f6").replace(/[^0-9.]/g,"")):pk(v("f5")).p,agreed_on:v("f7")||today(),notes:v("f8")||null};
  if(a==="saveSp"){row.stage="agreed";row.deliverables=mkDel(row.pkg);row.needs=mkNeed();row.emails=[{d:"wait",x:"No invoice sent yet"}];var r=await insert("sp",row);if(r){T("Sponsor added");back("sp",r.id);}return;}
  var e2=find("sp",S.open2);if(e2.pkg!==row.pkg)row.deliverables=mkDel(row.pkg);await save("sp",e2,row);back("sp",e2.id);return;}
 if(a==="saveOp"||a==="saveEditOp"){var nm=v("g1");if(!nm){$id("sfoErr").textContent="Add a name.";return;}var r2={name:nm,kind:v("g2"),contact:v("g3")||null,email:v("g4")||null,phone:v("g5")||null,place:v("g6")||null,stage:v("g7"),fight_date:v("g8")||null,venue:v("g9")||null,opponent:v("g10")||null,rounds:v("g11")||null,purse:v("g12")||null,notes:v("g13")||null};
  if(a==="saveOp"){if(r2.stage!=="source")r2.last_contact=today();var rr=await insert("op",r2);if(rr){T("Added");back("op",rr.id);}return;}
  var e3=find("op",S.open2);await save("op",e3,r2);back("op",e3.id);return;}
 if(a==="saveFollow"||a==="clearFollow"){var f=find("op",S.open2);await save("op",f,a==="clearFollow"?{next_due:null,next_step:null}:{next_step:v("h1")||"Follow up",next_due:v("h2")||addDays(7)});back("op",f.id);return;}
});
document.addEventListener("change",function(ev){var f=ev.target;if(!f||!f.getAttribute||!f.getAttribute("data-sfo-logo")||!f.files||!f.files[0])return;var s=find("sp",f.getAttribute("data-sfo-logo"));T("Saving logo\u2026");shrink(f.files[0],async function(url){var nd=(s.needs||mkNeed()).slice();if(nd[0])nd[0].done=true;await save("sp",s,{logo:url,needs:nd},true);T("Logo saved");sheet();paint();});});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&$id("sfoSheet"))closeSheet();});

/* ---------- home card (lg2.js "Your gym" grid, at the bottom), only for Jake and Sarsha ---------- */
window.lgSfoOk=ok;
window.lgSfoSub=function(){if(!S.loaded){if(ok()&&!S.loading&&!S.tried){S.tried=true;load().then(function(){try{if(view==="home"&&typeof renderHome==="function")renderHome();}catch(e){}});}return "Sponsors, payments, promoters and fight dates.";}var t=totals(),n=S.OP.filter(function(o){return o.stage==="agreed";}).length;return money(t.paid)+" paid \u00b7 "+money(t.owed)+" owed \u00b7 "+n+" fight"+(n===1?"":"s")+" agreed";};
var _r=window.render;
window.render=function(){if(view==="sfo"){if(!ok()){view="home";return _r.apply(this,arguments);}paint();return;}var hs=$id("sfoSheet");if(hs)hs.remove();return _r.apply(this,arguments);};
window.sfoOpen=function(){if(ok())go("sfo");};
})();
