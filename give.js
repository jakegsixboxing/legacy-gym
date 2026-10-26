/* Legacy Gym · $1000 GIVEAWAY tab · Jake & Alison only · 26 Oct 2026
   Home card (above everything) + its own view: every entrant, how many times they've shared and how,
   how many people opened their link, which mates claimed a free week, entries, eligibility, and a draw.
   Free weeks from the giveaway also land in the Free trial sign-ups tab (challenge_leads · trial7).
   Data: give_admin() / give_admin_trial() — both return nothing unless you're Jake or Alison. */
(function(){
"use strict";
var BOSS=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"];
var G={d:null,loading:false,q:"",filter:"all",open:null};
var css=document.createElement("style");css.textContent=
".gvCard{display:flex;align-items:center;gap:14px;width:100%;text-align:left;cursor:pointer;border:1.5px solid #c9a44c;border-radius:18px;padding:14px 16px;margin:0 0 14px;background:radial-gradient(120% 100% at 100% 0%,#4a3812 0%,#1c160a 50%,#0d0b07 100%);color:#fff;font-family:inherit}"
+".gvCard .amt{flex:none;font:700 30px/1 Oswald,sans-serif;color:#f4c95d;letter-spacing:.5px}"
+".gvCard .k{font:600 10px/1 Oswald,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:#f4c95d}.gvCard .t{font:700 20px/1.1 Oswald,sans-serif;text-transform:uppercase;margin-top:4px}.gvCard .s{font-size:11.5px;color:#d9d4c7;margin-top:4px;line-height:1.4}"
+".gvCard .a{margin-left:auto;flex:none;background:#c9a44c;color:#161307;border-radius:99px;padding:7px 11px;font:700 11px/1 Oswald,sans-serif;letter-spacing:1px}"
+".gv{padding-bottom:30px}.gv .hd{border:1px solid #3d3218;border-radius:18px;padding:16px;background:radial-gradient(120% 100% at 100% 0%,#3d2f10,#120f08 60%)}"
+".gv .hd .k{font:600 10px/1 Oswald,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#f4c95d}.gv .hd h2{font:700 30px/1 Oswald,sans-serif;text-transform:uppercase;margin-top:8px}.gv .hd h2 span{color:#f4c95d}.gv .hd p{font-size:12px;color:#bdb6a6;margin-top:6px;line-height:1.5}"
+".gv .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.gv .kp div{background:#121214;border:1px solid #26262b;border-radius:14px;padding:12px 6px;text-align:center}"
+".gv .kp b{display:block;font:700 26px/1 Oswald,sans-serif;font-variant-numeric:tabular-nums}.gv .kp small{display:block;font:800 8.5px/1.3 Montserrat,sans-serif;letter-spacing:1.3px;text-transform:uppercase;color:#9a9891;margin-top:6px}.gv .kp b.g{color:#f4c95d}.gv .kp b.ok{color:#4bc97a}"
+".gv .tools{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}.gv .tools input{flex:1;min-width:140px;background:#0d0d0e;border:1px solid #26262b;border-radius:10px;padding:10px 12px;color:#fff;font-size:14px}"
+".gv .tools button,.gv .fl button{background:#121214;border:1px solid #26262b;color:#9a9891;border-radius:99px;padding:8px 11px;font:700 10.5px/1 Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase}"
+".gv .fl{display:flex;gap:6px;margin-top:8px;overflow-x:auto;scrollbar-width:none}.gv .fl button{flex:none;white-space:nowrap}.gv .fl button.on{background:#c9a44c;color:#161307;border-color:#c9a44c}"
+".gv .row{background:#121214;border:1px solid #26262b;border-radius:14px;padding:12px;margin-top:8px}.gv .row.in{border-color:#3d3218}"
+".gv .row .top{display:flex;align-items:center;gap:10px;cursor:pointer}.gv .row .nm{flex:1;min-width:0}.gv .row .nm b{display:block;font:600 16px/1.1 Oswald,sans-serif;text-transform:uppercase}"
+".gv .row .nm small{display:block;font-size:11px;color:#9a9891;margin-top:4px;line-height:1.4}.gv .row .tk{flex:none;text-align:right}.gv .row .tk b{display:block;font:700 24px/1 Oswald,sans-serif;color:#f4c95d}.gv .row .tk small{font:800 8.5px/1 Montserrat,sans-serif;letter-spacing:1.2px;text-transform:uppercase;color:#9a9891}"
+".gv .pill{display:inline-block;font:800 9px/1 Montserrat,sans-serif;letter-spacing:1px;text-transform:uppercase;border-radius:99px;padding:4px 7px;margin-right:4px}.gv .p-m{background:#1b2a40;color:#8ab8ff}.gv .p-t{background:#163b26;color:#9af0bc}.gv .p-w{background:#2b2418;color:#f5b942}.gv .p-x{background:#1a1a1e;color:#9a9891}"
+".gv .more{margin-top:10px;border-top:1px solid #26262b;padding-top:10px;font-size:12px;color:#d9d4c7;line-height:1.6}.gv .more a{color:#f4c95d}.gv .more .bt{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}"
+".gv .more button{background:#1a1a1e;border:1px solid #3a3a40;color:#fff;border-radius:10px;padding:8px 11px;font:700 11px/1 Oswald,sans-serif;letter-spacing:1px;text-transform:uppercase}.gv .more button.ok{background:#163b26;border-color:#2a6b45;color:#9af0bc}"
+".gv .big{display:block;width:100%;margin-top:14px;padding:15px;border:0;border-radius:14px;background:linear-gradient(180deg,#f4c95d,#c9a44c);color:#161307;font:700 15px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase}"
+".gv .ghost{display:block;width:100%;margin-top:8px;padding:12px;border-radius:14px;background:none;border:1px solid #26262b;color:#9a9891;font:700 11px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase}"
+".gv .win{margin-top:14px;border-radius:18px;padding:18px;text-align:center;background:linear-gradient(160deg,#f6d46c,#c9a44c 55%,#9c7a2c);color:#161307}.gv .win small{font:700 10px/1 Oswald,sans-serif;letter-spacing:3px;text-transform:uppercase}.gv .win b{display:block;font:700 30px/1.1 Oswald,sans-serif;text-transform:uppercase;margin-top:6px}"
+".gv .empty{text-align:center;color:#9a9891;font-size:12.5px;padding:22px 10px;border:1px dashed #26262b;border-radius:14px;margin-top:10px}";
document.head.appendChild(css);
function uid(){try{return (typeof session!=="undefined"&&session&&session.user)?session.user.id:null;}catch(e){return null;}}
function boss(){return BOSS.indexOf(uid())>=0;}
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function when(iso){try{return new Date(iso).toLocaleString("en-AU",{weekday:"short",day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});}catch(e){return "";}}
async function load(){if(G.loading)return;G.loading=true;try{var r=await sb.rpc("give_admin");G.d=(r&&r.data)||{entries:[]};}catch(e){G.d={entries:[]};}G.loading=false;}
function inDraw(e){return e.shares>=3;}
function eligible(e){return inDraw(e)&&(e.member||e.trial_done);}
function tot(){var L=(G.d&&G.d.entries)||[];return {n:L.length,in:L.filter(inDraw).length,elig:L.filter(eligible).length,tickets:L.filter(eligible).reduce(function(a,e){return a+e.tickets;},0),shares:(G.d&&G.d.shares)||0,opens:(G.d&&G.d.opens)||0,trials:(G.d&&G.d.trials)||0};}
/* ---- home card ---- */
function card(){var t=tot();return '<button id="gvCard" class="gvCard" onclick="go(\'give\')"><span class="amt">$1000</span><span><span class="k" style="display:block">Giveaway · Jake &amp; Ali only</span><span class="t" style="display:block">$1000 Giveaway</span><span class="s" style="display:block">'+(G.d?t.n+' entered · '+t.shares+' shares · '+t.trials+' free trials':'Loading…')+'</span></span><span class="a">Open ›</span></button>';}
function inject(){try{if(!boss()||view!=="home")return;var m=document.getElementById("main");if(!m||document.getElementById("gvCard"))return;var w=document.createElement("div");w.innerHTML=card();var c=w.firstChild;
  var anchor=document.getElementById("rtnCard")||m.querySelector(".homeWelcome, #lgh2, .homeCard");if(anchor&&anchor.id==="rtnCard")anchor.insertAdjacentElement("afterend",c);else if(anchor)anchor.insertAdjacentElement("beforebegin",c);else m.insertBefore(c,m.firstChild);
  if(!G.d)load().then(function(){var x=document.getElementById("gvCard");if(x)x.outerHTML=card();});}catch(e){}}
/* ---- the tab ---- */
function rowHtml(e){
  var st=!inDraw(e)?'<span class="pill p-x">'+e.shares+' of 3 shares</span>':!e.member&&!e.trial_done?'<span class="pill p-w">Trial not finished</span>':'<span class="pill p-t">In the draw</span>';
  var via=Object.keys(e.via||{}).map(function(k){return ({share:"share sheet",wa:"WhatsApp",ms:"Messenger",ig:"Insta",sms:"text",copy:"copied link"}[k]||k)+" "+e.via[k];}).join(" · ");
  var h='<div class="row'+(eligible(e)?' in':'')+'"><div class="top" onclick="gvOpen(\''+e.code+'\')"><div class="nm"><b>'+E(e.name)+'</b><small><span class="pill '+(e.member?'p-m':'p-t')+'">'+(e.member?'Member':'Free trial')+'</span>'+st+'<br>'+e.shares+' shares · '+e.opens+' opened · '+(e.claims||[]).length+' trial'+((e.claims||[]).length===1?'':'s')+' claimed</small></div><div class="tk"><b>'+(eligible(e)?e.tickets:'–')+'</b><small>entries</small></div></div>';
  if(G.open===e.code){
    h+='<div class="more"><a href="tel:'+E(e.mobile)+'">'+E(e.mobile)+'</a> · <a href="mailto:'+E(e.email)+'">'+E(e.email)+'</a><br>Entry #'+e.entry_no+' · entered '+when(e.at)+(e.trial_day?'<br>Free week starts '+new Date(e.trial_day+"T12:00:00").toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"}):'')
     +(via?'<br>Shared by: '+E(via):'')
     +((e.claims||[]).length?'<br><b style="color:#fff">Mates who claimed:</b> '+e.claims.map(function(c){return E(c.name)+' (<a href="tel:'+E(c.mobile)+'">'+E(c.mobile)+'</a>)';}).join(", "):'')
     +(!e.member?'<div class="bt"><button class="'+(e.trial_done?'ok':'')+'" onclick="gvTrial(\''+e.code+'\','+(!e.trial_done)+')">'+(e.trial_done?'Free week finished ✓':'Mark free week finished')+'</button></div>':'')+'</div>';
  }
  return h+'</div>';}
function render(){var m=document.getElementById("main");if(!m)return;
  if(!boss()){m.innerHTML='<button class="backBtn" onclick="go(\'home\')">‹ Back Home</button><div class="empty">Jake &amp; Alison only.</div>';return;}
  if(!G.d){m.innerHTML='<button class="backBtn" onclick="go(\'home\')">‹ Back Home</button><div class="loadingDots">Loading the giveaway…</div>';load().then(function(){if(view==="give")render();});return;}
  var t=tot(),L=(G.d.entries||[]).slice(),q=G.q.trim().toLowerCase();
  if(q)L=L.filter(function(e){return (e.name+" "+e.mobile+" "+e.email).toLowerCase().indexOf(q)>=0;});
  if(G.filter==="in")L=L.filter(eligible);else if(G.filter==="pend")L=L.filter(function(e){return inDraw(e)&&!eligible(e);});else if(G.filter==="short")L=L.filter(function(e){return !inDraw(e);});
  else if(G.filter==="top")L.sort(function(a,b){return b.shares-a.shares;});
  m.innerHTML='<button class="backBtn" onclick="go(\'home\')">‹ Back Home</button><div class="gv"><div class="hd"><div class="k">Drawn live at Fight Night · Sat 19 Dec</div><h2><span>$1000</span> Giveaway</h2><p>Everyone who\'s entered, how often they\'ve shared, who opened their link and which mates claimed a free week. Only you and Ali can see this.</p></div>'
   +'<div class="kp"><div><b>'+t.n+'</b><small>Entered</small></div><div><b class="ok">'+t.elig+'</b><small>In the draw</small></div><div><b class="g">'+t.tickets+'</b><small>Total entries</small></div>'
   +'<div><b>'+t.shares+'</b><small>Times shared</small></div><div><b>'+t.opens+'</b><small>Link opens</small></div><div><b class="g">'+t.trials+'</b><small>Free trials</small></div></div>'
   +'<button class="ghost" onclick="go(\'trials\')">Free trials from the giveaway are in Free trial sign-ups ›</button>'
   +'<div class="tools"><input placeholder="Search name or number" value="'+E(G.q)+'" oninput="gvQ(this.value)"><button onclick="gvReload()">Refresh</button></div>'
   +'<div class="fl">'+[["all","Everyone"],["in","In the draw"],["pend","Trial pending"],["short","Under 3 shares"],["top","Top sharers"]].map(function(f){return '<button class="'+(G.filter===f[0]?'on':'')+'" onclick="gvF(\''+f[0]+'\')">'+f[1]+'</button>';}).join("")+'</div>'
   +'<div id="gvList">'+(L.length?L.map(rowHtml).join(""):'<div class="empty">'+(G.d.entries.length?'Nobody matches that.':'No entries yet. Share the story and they\'ll land here.')+'</div>')+'</div>'
   +(G.winner?'<div class="win"><small>Winner</small><b>'+E(G.winner.name)+'</b><div style="font-size:12px;margin-top:6px">'+E(G.winner.mobile)+' · '+G.winner.tickets+' entr'+(G.winner.tickets===1?'y':'ies')+'</div></div>':'')
   +'<button class="big" onclick="gvDraw()">Draw the winner</button><div style="font-size:10.5px;color:#6f6c66;text-align:center;margin-top:8px;line-height:1.5">Only members and people who finished their free week, weighted by entries. Check their link opens look real before you announce.</div></div>';
}
window.gvOpen=function(c){G.open=G.open===c?null:c;render();};
window.gvQ=function(v){G.q=v;var p=document.activeElement;render();var i=document.querySelector(".gv .tools input");if(i){i.focus();i.setSelectionRange(v.length,v.length);}};
window.gvF=function(f){G.filter=f;render();};
window.gvReload=async function(){G.d=null;render();};
window.gvTrial=async function(code,done){var r=await sb.rpc("give_admin_trial",{p_code:code,p_done:done});if(r.error){T(r.error.message);return;}await load();render();T(done?"Marked finished · they're in":"Unmarked");};
window.gvDraw=function(){var pool=[];(G.d.entries||[]).filter(eligible).forEach(function(e){for(var i=0;i<e.tickets;i++)pool.push(e);});if(!pool.length){T("Nobody's eligible yet.");return;}
  if(!confirm("Draw the $1000 winner now? ("+pool.length+" entries in the barrel)"))return;G.winner=pool[Math.floor(Math.random()*pool.length)];render();window.scrollTo(0,document.body.scrollHeight);};
/* ---- hooks ---- */
try{NAV_TAB.give="home";}catch(e){}
var _render=window.render;window.render=function(){if(view==="give")return render();return _render.apply(this,arguments);};
["renderHome"].forEach(function(fn){if(typeof window[fn]!=="function")return;var o=window[fn];window[fn]=function(){var r=o.apply(this,arguments);var after=function(){inject();};if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,40);return r;};});
setInterval(function(){try{if(view==="home"&&boss()&&!document.getElementById("gvCard"))inject();if(view==="home"&&boss()&&G.d&&Date.now()-(G.t||0)>60000){G.t=Date.now();load().then(function(){var x=document.getElementById("gvCard");if(x)x.outerHTML=card();});}}catch(e){}},1500);
})();
