/* ===== YOUTH BOXING SPONSORSHIP \u00b7 Jake only (20 Nov 2026) =====
   Home card at the bottom of the "Your gym" grid (lg2.js), visible to Jake only.
   Shows everyone who has put their details through /youth-boxing: who has paid (Shopify webhook -> ysp_mark_paid),
   who started but hasn't paid, and invoice requests. Contact details, logo, promo note, contacted tick + notes.
   Data: table ysp_sponsors (RLS on, no policies) via ysp_admin_list / ysp_admin_update, which raise unless Jake. */
(function(){
"use strict";
var JAKE="15a011b9-e222-45f0-8eb9-d5338da935d1";
var LINK="https://legacygym-app.vercel.app/youth-boxing";
function uid(){try{return session&&session.user?session.user.id:null;}catch(e){return null;}}
function ok(){return uid()===JAKE;}
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
function money(c){return "$"+Math.round((c||0)/100).toLocaleString("en-AU");}
function fmt(d){if(!d)return "";var x=new Date(d);return x.toLocaleDateString("en-AU",{day:"numeric",month:"short"})+" "+x.toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"});}
var S={rows:[],loaded:false,loading:false,tried:false,err:"",tab:"all",open:null,logos:{}};

function load(){
 if(!ok())return Promise.resolve();
 S.loading=true;
 return sb.rpc("ysp_admin_list").then(function(r){S.loading=false;if(r.error){S.err=r.error.message;return;}S.err="";S.rows=r.data||[];S.loaded=true;})
  .catch(function(e){S.loading=false;S.err=String(e&&e.message||e);});
}
function totals(){var t={paid:0,np:0,n:0,started:0,inv:0,todo:0};S.rows.forEach(function(r){if(r.status==="paid"){t.paid+=r.amount_cents;t.np++;if(!r.contacted_at)t.todo++;}else if(r.status==="invoice"){t.inv++;if(!r.contacted_at)t.todo++;}else t.started++;});return t;}
function stat(r){return r.status==="paid"?'<span class="ysPill paid">Paid</span>':r.status==="invoice"?'<span class="ysPill inv">Invoice requested</span>':'<span class="ysPill st">Started, not paid</span>';}

function css(){if($id("ysCss"))return;var s=document.createElement("style");s.id="ysCss";s.textContent=
"#ysRoot{padding:6px 2px 90px}#ysRoot .ysBack{background:none;border:0;color:#9fb3c0;font:600 14px Montserrat,sans-serif;padding:6px 0;cursor:pointer}"+
"#ysRoot h2{font:600 26px/1.05 Oswald,sans-serif;text-transform:uppercase;margin:4px 0 2px;color:#fff;letter-spacing:.02em}#ysRoot .sub{color:#8d9aa4;font-size:12.5px}"+
".ysTop{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.ysLock{flex:none;font-size:11px;font-weight:700;color:#1fb6e6;border:1px solid #1f4b5e;border-radius:99px;padding:5px 9px;white-space:nowrap}"+
".ysTot{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0}.ysTot div{background:#0f171d;border:1px solid #1d2b34;border-radius:12px;padding:12px}.ysTot b{display:block;font:600 22px/1 Oswald,sans-serif;color:#fff}.ysTot span{display:block;font-size:11.5px;color:#8d9aa4;margin-top:4px}"+
".ysLink{display:flex;gap:8px;align-items:center;background:#0b1a22;border:1px solid #1f4b5e;border-radius:12px;padding:10px 12px;margin-bottom:12px}.ysLink small{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#bfe9f8;font-size:12.5px}"+
".ysBtn{background:#1fb6e6;color:#021018;border:0;border-radius:10px;font:700 13px Montserrat,sans-serif;padding:9px 12px;cursor:pointer;white-space:nowrap}.ysBtn.gh{background:transparent;color:#e8eef2;border:1px solid #2a3b46}"+
".ysSeg{display:flex;gap:6px;margin:4px 0 12px}.ysSeg button{flex:1;background:#0f171d;border:1px solid #1d2b34;color:#a9b6bf;border-radius:10px;padding:9px 6px;font:600 13px Montserrat,sans-serif;cursor:pointer}.ysSeg button.on{background:#1fb6e6;color:#021018;border-color:#1fb6e6}"+
".ysCard{background:#0f171d;border:1px solid #1d2b34;border-radius:14px;padding:13px 14px;margin-bottom:9px;cursor:pointer}.ysCard.todo{border-color:#1f6b86}.ysCard .r1{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.ysCard b{color:#fff;font-size:15px}.ysCard .amt{font:600 18px Oswald,sans-serif;color:#fff}.ysCard small{display:block;color:#8d9aa4;font-size:12.5px;margin-top:3px}"+
".ysPill{display:inline-block;font-size:11px;font-weight:700;border-radius:99px;padding:3px 8px;margin-top:6px}.ysPill.paid{background:#0f3324;color:#5fe0a0}.ysPill.st{background:#2b2410;color:#f0c75a}.ysPill.inv{background:#10283a;color:#7fd3f5}.ysPill.ct{background:#1a2229;color:#a9b6bf;margin-left:4px}"+
".ysDet{margin-top:12px;border-top:1px solid #1d2b34;padding-top:10px;display:grid;gap:8px;font-size:13.5px;color:#d7e0e6;cursor:default}.ysDet a{color:#7fd3f5}.ysDet .k{color:#8d9aa4;font-size:11.5px;text-transform:uppercase;letter-spacing:.08em}"+
".ysDet textarea{width:100%;min-height:70px;background:#0a1116;border:1px solid #2a3b46;border-radius:10px;color:#fff;padding:9px;font:13.5px Montserrat,sans-serif}.ysLogo{width:84px;height:84px;object-fit:contain;background:#fff;border-radius:10px;padding:4px}"+
".ysEmpty{color:#8d9aa4;text-align:center;padding:30px 10px;font-size:14px}";
document.head.appendChild(s);}

function card(r){
 var open=S.open===r.id,todo=(r.status==="paid"||r.status==="invoice")&&!r.contacted_at;
 var h='<div class="ysCard'+(todo?' todo':'')+'" data-ys-open="'+r.id+'"><div class="r1"><div style="min-width:0"><b>'+esc(r.business)+'</b><small>'+esc(r.pack_label)+' \u00b7 '+esc(r.name)+' \u00b7 '+fmt(r.created_at)+'</small>'+stat(r)+(r.contacted_at?'<span class="ysPill ct">Contacted</span>':todo?'<span class="ysPill ct" style="color:#7fd3f5">Call within 24h</span>':'')+'</div><span class="amt">'+money(r.amount_cents)+'</span></div>';
 if(open){
  h+='<div class="ysDet" data-ys-stop>'+
  (r.mobile?'<div><div class="k">Mobile</div><a href="tel:'+esc(r.mobile.replace(/\s/g,""))+'">'+esc(r.mobile)+'</a></div>':'')+
  '<div><div class="k">Email</div><a href="mailto:'+esc(r.email)+'">'+esc(r.email)+'</a></div>'+
  (r.website?'<div><div class="k">Instagram / website</div>'+esc(r.website)+'</div>':'')+
  (r.promo?'<div><div class="k">Their promotion on the night</div>'+esc(r.promo)+'</div>':'')+
  '<div><div class="k">Logo</div>'+(r.logo_path?(S.logos[r.id]?'<a href="'+esc(S.logos[r.id])+'" target="_blank" rel="noopener"><img class="ysLogo" src="'+esc(S.logos[r.id])+'" alt="Logo"></a><br><small>'+esc(r.logo_name||"")+'</small>':'Loading\u2026'):'Not sent yet')+'</div>'+
  '<div><div class="k">Payment</div>'+(r.status==="paid"?'Paid '+fmt(r.paid_at)+(r.shopify_order?' \u00b7 Shopify '+esc(r.shopify_order):''):r.status==="invoice"?'Asked for an invoice. Send one from Shopify or your accounts.':'Opened checkout'+(r.shopify_draft?' ('+esc(r.shopify_draft)+')':'')+' but hasn\u2019t paid yet.')+'</div>'+
  '<div><div class="k">Ref</div>'+esc(r.ref)+'</div>'+
  '<div><div class="k">Your notes</div><textarea id="ysNote'+r.id+'" placeholder="Called, logo sorted, etc.">'+esc(r.jake_notes||"")+'</textarea></div>'+
  '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="ysBtn" data-ys-save="'+r.id+'" data-c="'+(r.contacted_at?1:0)+'">Save notes</button><button class="ysBtn gh" data-ys-ct="'+r.id+'">'+(r.contacted_at?'Mark not contacted':'Mark contacted')+'</button></div></div>';
  if(r.logo_path&&!S.logos[r.id])logoUrl(r);
 }
 return h+'</div>';
}
function logoUrl(r){try{sb.storage.from("sponsor-logos").createSignedUrl(r.logo_path,3600).then(function(x){if(x&&x.data&&x.data.signedUrl){S.logos[r.id]=x.data.signedUrl;paint();}});}catch(e){}}

function paint(){
 css();var m=$id("main");if(!m)return;
 if(!ok()){m.innerHTML='<div class="ysEmpty">This section is private.</div>';return;}
 if(!S.loaded&&!S.loading){load().then(paint);}
 var t=totals(),rows=S.rows.filter(function(r){return S.tab==="all"?true:S.tab==="paid"?r.status==="paid":r.status!=="paid";});
 rows.sort(function(a,b){var ta=((a.status==="paid"||a.status==="invoice")&&!a.contacted_at)?0:1,tb=((b.status==="paid"||b.status==="invoice")&&!b.contacted_at)?0:1;return ta-tb||(a.created_at<b.created_at?1:-1);});
 var body=S.err?'<div class="ysEmpty">Couldn\u2019t load: '+esc(S.err)+'</div>':!S.loaded?'<div class="ysEmpty">Loading\u2026</div>':rows.length?rows.map(card).join(""):'<div class="ysEmpty">'+(S.rows.length?'Nothing here.':'No sponsors yet. Send the page link to businesses and they\u2019ll show up here as soon as they put their details through.')+'</div>';
 m.innerHTML='<div id="ysRoot"><button class="ysBack" onclick="go(\'home\')">\u2039 Home</button><div class="ysTop"><div><h2>Youth Boxing Sponsorship</h2><div class="sub">Fight Night \u00b7 Sat 19 Dec \u00b7 $750 / $1,500 / $2,500</div></div><span class="ysLock">\ud83d\udd12 Only you</span></div>'+
 '<div class="ysTot"><div><b>'+money(t.paid)+'</b><span>'+t.np+' paid</span></div><div><b>'+t.todo+'</b><span>to contact</span></div><div><b>'+(t.started+t.inv)+'</b><span>not paid yet</span></div></div>'+
 '<div class="ysLink"><small>'+LINK.replace("https://","")+'</small><button class="ysBtn gh" data-ys-open-link>Open</button><button class="ysBtn" data-ys-copy>Copy link</button></div>'+
 '<div class="ysSeg"><button class="'+(S.tab==="all"?"on":"")+'" data-ys-tab="all">All ('+S.rows.length+')</button><button class="'+(S.tab==="paid"?"on":"")+'" data-ys-tab="paid">Paid</button><button class="'+(S.tab==="np"?"on":"")+'" data-ys-tab="np">Not paid</button></div>'+
 body+'<div style="text-align:center;margin-top:10px"><button class="ysBtn gh" data-ys-reload>Refresh</button></div></div>';
}

document.addEventListener("click",function(ev){
 if(typeof view==="undefined"||view!=="ysp")return;
 var t=ev.target,b;
 if(t.closest("[data-ys-stop]")&&!t.closest("button"))return;
 if(b=t.closest("[data-ys-tab]")){S.tab=b.getAttribute("data-ys-tab");paint();return;}
 if(t.closest("[data-ys-reload]")){S.loaded=false;load().then(paint);T("Refreshing\u2026");return;}
 if(t.closest("[data-ys-copy]")){try{navigator.clipboard.writeText(LINK);T("Link copied");}catch(e){T(LINK);}return;}
 if(t.closest("[data-ys-open-link]")){window.open(LINK,"_blank");return;}
 if((b=t.closest("[data-ys-save]"))||(b=t.closest("[data-ys-ct]"))){
  var id=Number(b.getAttribute("data-ys-save")||b.getAttribute("data-ys-ct"));var r=S.rows.filter(function(x){return x.id===id;})[0];if(!r)return;
  var note=($id("ysNote"+id)||{}).value;var ct=b.hasAttribute("data-ys-ct")?!r.contacted_at:!!r.contacted_at;
  sb.rpc("ysp_admin_update",{p_id:id,p_contacted:ct,p_notes:note==null?r.jake_notes:note}).then(function(x){if(x.error){T("Couldn\u2019t save: "+x.error.message);return;}T("Saved");load().then(paint);});
  return;}
 if(b=t.closest("[data-ys-open]")){var i=Number(b.getAttribute("data-ys-open"));S.open=S.open===i?null:i;paint();}
});

/* ---------- home card (lg2.js grid, bottom), Jake only ---------- */
window.lgYspOk=ok;
window.lgYspSub=function(){
 if(!S.loaded){if(ok()&&!S.loading&&!S.tried){S.tried=true;load().then(function(){try{if(view==="home"&&typeof renderHome==="function")renderHome();}catch(e){}});}return "Who\u2019s paid and who to contact.";}
 var t=totals();return money(t.paid)+" raised \u00b7 "+t.np+" paid"+(t.todo?" \u00b7 "+t.todo+" to contact":"");
};
var _r=window.render;
window.render=function(){if(view==="ysp"){if(!ok()){view="home";return _r.apply(this,arguments);}paint();return;}return _r.apply(this,arguments);};
})();
