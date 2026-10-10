/*__LIFE__ ============================================================
   JAKE'S LIFE: a private daily tracker inside the Legacy app. DEMO.
   Visible to ONE account only (Jake's user id below). No other member,
   coach or staff account sees the tile or the screens. Data lives in
   public.life_entries (RLS: own rows only), one row per key, e.g.
   "2026-10-11:nutrition" for a day's section or "work:tasks" for the
   persistent work lists. Everything saves as you type (debounced) and
   syncs across Jake's devices.

   Sub-tabs: Nutrition · Running · Boxing · S&C · Recovery · Work.
   Additive add-on, same pattern as fc.js / rtx.js / nutrition.js.
   Delete this file + its <script> tag + the make-icons copy entry to roll back.
   ==================================================================== */
(function(){
  var OWNER=["15a011b9-e222-45f0-8eb9-d5338da935d1"]; /* Jake only */
  var L={loaded:false,loading:null,for:null,rows:{},tab:"nutrition",day:null,saveT:{},dirty:{}};
  var E=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  var T=function(m){try{toast(m);}catch(e){}};
  function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
  function allowed(){var u=uid();return !!u&&OWNER.indexOf(u)>=0;}
  function pad2(n){return (n<10?"0":"")+n;}
  function iso(d){d=d||new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
  function today(){return iso(new Date());}
  function addDays(s,n){var d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return iso(d);}
  function fmtDay(s){var d=new Date(s+"T12:00:00");return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"short"});}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

  var css=document.createElement("style");css.id="lifeCss";css.textContent=`
.lf{--g:#c9a44c;--gd:#8a7136;--p:#121214;--p2:#18181b;--ln:#26262b;--tx:#f2f0eb;--mu:#9a9891;--ok:#4bc97a;--bad:#e05252;--blue:#4a8de6;color:var(--tx);padding-bottom:40px}
.lf .lf-back{background:transparent;border:0;color:var(--g);font-weight:800;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:0 0 10px;cursor:pointer}
.lf .lf-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px}
.lf .lf-kicker{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--g)}
.lf .lf-title{font-family:Oswald,sans-serif;font-size:30px;font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:1px}
.lf .lf-demo{font-size:9px;font-weight:800;letter-spacing:2px;text-transform:uppercase;border:1px solid var(--gd);color:var(--g);border-radius:999px;padding:3px 8px}
.lf .lf-daynav{display:flex;align-items:center;gap:8px;margin:0 0 12px}
.lf .lf-daynav button{width:38px;height:38px;border-radius:10px;background:var(--p);border:1px solid var(--ln);color:var(--g);font-size:18px;cursor:pointer}
.lf .lf-daynav .lf-day{flex:1;text-align:center;font-family:Oswald,sans-serif;font-size:17px;text-transform:uppercase;letter-spacing:.5px}
.lf .lf-daynav .lf-day small{display:block;font-size:10px;letter-spacing:2px;color:var(--mu);font-family:Montserrat,sans-serif;font-weight:700}
.lf .lf-sum{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:12px}
.lf .lf-sum div{background:var(--p);border:1px solid var(--ln);border-radius:10px;padding:8px 2px;text-align:center;cursor:pointer}
.lf .lf-sum b{display:block;font-family:Oswald,sans-serif;font-size:15px;line-height:1.1}
.lf .lf-sum span{font-size:7.5px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800;display:block;margin-top:3px}
.lf .lf-sum div.done{border-color:var(--ok)}.lf .lf-sum div.done b{color:var(--ok)}
.lf .lf-tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 0 10px;scrollbar-width:none;margin-bottom:4px}
.lf .lf-tabs::-webkit-scrollbar{display:none}
.lf .lf-tab{flex:none;padding:9px 13px;border-radius:999px;background:var(--p);border:1px solid var(--ln);color:var(--mu);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;white-space:nowrap}
.lf .lf-tab.on{background:var(--g);border-color:var(--g);color:#161307;font-weight:700}
.lf .card{background:var(--p);border:1px solid var(--ln);border-radius:12px;padding:14px;margin-bottom:10px}
.lf .lf-h{font-family:Oswald,sans-serif;font-size:15px;letter-spacing:1.5px;text-transform:uppercase;color:var(--g);margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.lf .lf-h small{font-family:Montserrat,sans-serif;font-size:10px;letter-spacing:1px;color:var(--mu);font-weight:700;text-transform:none}
.lf .lf-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--ln)}
.lf .lf-row:first-of-type{border-top:0}
.lf .lf-tick{width:26px;height:26px;border-radius:8px;border:1.5px solid var(--ln);background:#0e0e10;display:grid;place-items:center;color:#161307;font-weight:900;font-size:14px;flex:none;cursor:pointer}
.lf .lf-tick.on{background:var(--ok);border-color:var(--ok)}
.lf .lf-row .lf-lbl{font-weight:700;font-size:13px;flex:none;min-width:84px}
.lf .lf-row input[type=text]{flex:1;min-width:0;background:#0e0e10;border:1px solid var(--ln);border-radius:8px;color:var(--tx);padding:8px 10px;font-size:14px}
.lf input[type=text],.lf input[type=number],.lf input[type=time],.lf select,.lf textarea{font-family:inherit;background:#0e0e10;border:1px solid var(--ln);border-radius:8px;color:var(--tx);padding:9px 10px;font-size:15px;width:100%;box-sizing:border-box}
.lf input:focus,.lf textarea:focus,.lf select:focus{outline:none;border-color:var(--gd)}
.lf textarea{min-height:64px;resize:vertical}
.lf .lf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lf .lf-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.lf label.lf-f{display:block;font-size:9.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);font-weight:800;margin:6px 0 4px}
.lf .lf-water{display:flex;align-items:center;gap:10px}
.lf .lf-water button{width:42px;height:42px;border-radius:12px;background:var(--p2);border:1px solid var(--ln);color:var(--tx);font-size:22px;cursor:pointer}
.lf .lf-water .lf-bar{flex:1;height:12px;border-radius:999px;background:#0e0e10;border:1px solid var(--ln);overflow:hidden}
.lf .lf-water .lf-bar i{display:block;height:100%;background:linear-gradient(90deg,#2f6fc4,#4a8de6);border-radius:999px}
.lf .lf-water b{font-family:Oswald,sans-serif;font-size:18px;min-width:64px;text-align:right}
.lf .lf-scale{display:flex;gap:5px}
.lf .lf-scale button{flex:1;padding:9px 0;border-radius:8px;background:var(--p2);border:1px solid var(--ln);color:var(--mu);font-family:Oswald,sans-serif;font-size:14px;cursor:pointer}
.lf .lf-scale button.on{background:var(--g);border-color:var(--g);color:#161307;font-weight:700}
.lf .lf-chips{display:flex;flex-wrap:wrap;gap:6px}
.lf .lf-chip{padding:8px 12px;border-radius:999px;background:var(--p2);border:1px solid var(--ln);color:var(--mu);font-size:12px;font-weight:700;cursor:pointer}
.lf .lf-chip.on{background:var(--ok);border-color:var(--ok);color:#06110a}
.lf .lf-big{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--p2);border:1px solid var(--ln);border-radius:12px;padding:12px 14px;margin-bottom:10px}
.lf .lf-big b{font-family:Oswald,sans-serif;font-size:16px;letter-spacing:1px;text-transform:uppercase}
.lf .lf-big small{display:block;font-size:11px;color:var(--mu);font-weight:600;margin-top:2px}
.lf .lf-sw{width:52px;height:30px;border-radius:999px;background:#0e0e10;border:1px solid var(--ln);position:relative;cursor:pointer;flex:none}
.lf .lf-sw i{position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:var(--mu);transition:left .15s}
.lf .lf-sw.on{background:var(--ok);border-color:var(--ok)}.lf .lf-sw.on i{left:25px;background:#06110a}
.lf .lf-lift{display:grid;grid-template-columns:1.6fr .6fr .6fr .7fr 28px;gap:5px;align-items:center;margin-bottom:6px}
.lf .lf-lift input{padding:8px 8px;font-size:14px}
.lf .lf-x{width:28px;height:36px;border:0;background:none;color:var(--mu);font-size:18px;cursor:pointer}
.lf .lf-add{display:block;width:100%;margin-top:6px;padding:11px;border-radius:10px;background:none;border:1px dashed var(--gd);color:var(--g);font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}
.lf .lf-task{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--ln)}
.lf .lf-task:first-child{border-top:0}
.lf .lf-task span{flex:1;font-size:14px;line-height:1.35}
.lf .lf-task.done span{color:var(--mu);text-decoration:line-through}
.lf .lf-addrow{display:flex;gap:6px;margin-top:8px}
.lf .lf-addrow button{flex:none;padding:0 14px;border-radius:8px;background:var(--g);border:0;color:#161307;font-weight:900;cursor:pointer}
.lf .lf-stat{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}
.lf .lf-stat div{background:var(--p);border:1px solid var(--ln);border-radius:10px;padding:10px 6px;text-align:center}
.lf .lf-stat b{display:block;font-family:Oswald,sans-serif;font-size:20px;color:var(--g)}
.lf .lf-stat span{font-size:8.5px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800}
.lf .lf-save{position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);background:rgba(13,13,14,.9);border:1px solid var(--ln);border-radius:999px;padding:5px 10px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:40}
.lf .lf-save.show{opacity:1}
.lf .lf-week{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-top:8px}
.lf .lf-week div{text-align:center;font-size:9px;color:var(--mu);font-weight:700}
.lf .lf-week i{display:block;height:6px;border-radius:3px;background:#0e0e10;border:1px solid var(--ln);margin-bottom:3px}
.lf .lf-week i.on{background:var(--ok);border-color:var(--ok)}
.homeCard.lifeCard .hcKicker{color:var(--gold)}
`;document.head.appendChild(css);

  /* ---------- data ---------- */
  function load(){
    var me=uid();if(!allowed()){L.rows={};L.loaded=true;L.for=me;return Promise.resolve();}
    if(L.loading)return L.loading;
    L.loading=sb.from("life_entries").select("key,data").eq("user_id",me).then(function(r){
      L.rows={};if(r&&!r.error&&Array.isArray(r.data))r.data.forEach(function(x){L.rows[x.key]=x.data||{};});
      L.loaded=true;L.loading=null;L.for=me;
    },function(){L.loaded=true;L.loading=null;L.for=me;});
    return L.loading;
  }
  function get(key){return L.rows[key]||(L.rows[key]={});}
  function dk(sec){return L.day+":"+sec;}
  function cur(sec){return get(dk(sec));}
  function save(key){
    L.dirty[key]=true;clearTimeout(L.saveT[key]);
    L.saveT[key]=setTimeout(function(){flush(key);},600);
    pill("Saving…");
  }
  function flush(key){
    if(!allowed())return;var me=uid();
    sb.from("life_entries").upsert({user_id:me,key:key,data:L.rows[key]||{},updated_at:new Date().toISOString()},{onConflict:"user_id,key"}).then(function(r){
      if(r&&r.error){T("Didn’t save: "+r.error.message);pill("Not saved");return;}
      delete L.dirty[key];pill("Saved ✓");
    });
  }
  function pill(t){var p=document.getElementById("lfSave");if(!p)return;p.textContent=t;p.classList.add("show");clearTimeout(p._h);p._h=setTimeout(function(){p.classList.remove("show");},1400);}
  window.addEventListener("beforeunload",function(){Object.keys(L.dirty).forEach(flush);});

  /* ---------- defaults ---------- */
  var DEF_MEALS=["Breakfast","Snack 1","Lunch","Snack 2","Dinner"];
  var WATER_GOAL=10; /* 250ml glasses = 2.5L */
  var WORK_GROUPS=[["clients","Clients"],["fc","Fight Club"],["amateurs","Amateurs"],["members","General Members"]];
  function mealPlan(){var p=get("plan:meals");return (p.names&&p.names.length)?p.names:DEF_MEALS;}

  /* ---------- state setters (called from inline handlers) ---------- */
  window.lfSet=function(sec,field,val,rerender){var d=cur(sec);d[field]=val;save(dk(sec));if(rerender)paintTab();else paintSum();};
  window.lfToggle=function(sec,field,rerender){var d=cur(sec);d[field]=!d[field];save(dk(sec));if(rerender!==false)paintTab();else paintSum();};
  window.lfMeal=function(i,what,val){var d=cur("nutrition");d.meals=d.meals||{};d.meals[i]=d.meals[i]||{};if(what==="done")d.meals[i].done=!d.meals[i].done;else d.meals[i].ate=val;save(dk("nutrition"));if(what==="done")paintTab();else paintSum();};
  window.lfWater=function(n){var d=cur("nutrition");d.water=Math.max(0,(d.water||0)+n);save(dk("nutrition"));paintTab();};
  window.lfPlanMeal=function(i,val){var p=get("plan:meals");p.names=mealPlan().slice();p.names[i]=val;save("plan:meals");};
  window.lfPlanAdd=function(){var p=get("plan:meals");p.names=mealPlan().concat(["New meal"]);save("plan:meals");paintTab();};
  window.lfPlanDel=function(i){var p=get("plan:meals");p.names=mealPlan().slice();p.names.splice(i,1);save("plan:meals");paintTab();};
  window.lfPlanEdit=function(){L.editPlan=!L.editPlan;paintTab();};
  window.lfChip=function(sec,field,val){var d=cur(sec);var a=d[field]||[];var i=a.indexOf(val);if(i>=0)a.splice(i,1);else a.push(val);d[field]=a;save(dk(sec));paintTab();};
  window.lfLift=function(i,f,v){var d=cur("snc");d.lifts=d.lifts||[];d.lifts[i]=d.lifts[i]||{};d.lifts[i][f]=v;save(dk("snc"));};
  window.lfLiftAdd=function(){var d=cur("snc");d.lifts=(d.lifts||[]).concat([{ex:"",sets:"",reps:"",kg:""}]);save(dk("snc"));paintTab();setTimeout(function(){var q=document.querySelectorAll('.lf-lift input[data-f="ex"]');if(q.length)q[q.length-1].focus();},30);};
  window.lfLiftDel=function(i){var d=cur("snc");(d.lifts||[]).splice(i,1);save(dk("snc"));paintTab();};
  window.lfTaskAdd=function(g){var inp=document.getElementById("lfNew-"+g);var t=(inp&&inp.value.trim())||"";if(!t)return;var w=get("work:tasks");w[g]=w[g]||[];w[g].unshift({t:t,done:false,at:Date.now()});save("work:tasks");paintTab();};
  window.lfTaskTick=function(g,i){var w=get("work:tasks");if(!w[g]||!w[g][i])return;w[g][i].done=!w[g][i].done;w[g][i].doneAt=w[g][i].done?Date.now():null;save("work:tasks");paintTab();};
  window.lfTaskDel=function(g,i){var w=get("work:tasks");if(!w[g])return;w[g].splice(i,1);save("work:tasks");paintTab();};
  window.lfTaskClear=function(g){var w=get("work:tasks");if(!w[g])return;w[g]=w[g].filter(function(x){return !x.done;});save("work:tasks");paintTab();};
  window.lfWorkNote=function(g,v){var w=get("work:notes");w[g]=v;save("work:notes");};
  window.lfTab=function(t){L.tab=t;store("lf_tab",t);paintTab();paintTabs();try{window.scrollTo(0,0);}catch(e){}};
  window.lfDay=function(n){L.day=n===0?today():addDays(L.day,n);paint();};

  /* ---------- summary (per day) ---------- */
  function mealsDone(d){var n=0,p=mealPlan();p.forEach(function(_,i){if(d.meals&&d.meals[i]&&d.meals[i].done)n++;});return [n,p.length];}
  function sumHtml(){
    var n=cur("nutrition"),r=cur("running"),b=cur("boxing"),s=cur("snc"),rc=cur("recovery"),w=get("work:tasks");
    var md=mealsDone(n);var open=0;WORK_GROUPS.forEach(function(g){(w[g[0]]||[]).forEach(function(t){if(!t.done)open++;});});
    var tile=function(id,v,l,done){return '<div class="'+(done?"done":"")+'" onclick="lfTab(\''+id+'\')"><b>'+v+'</b><span>'+l+'</span></div>';};
    return '<div class="lf-sum">'+
      tile("nutrition",md[0]+"/"+md[1],"Meals",md[1]&&md[0]===md[1])+
      tile("nutrition",((n.water||0)*0.25).toFixed(2).replace(/\.?0+$/,"")+"L","Water",(n.water||0)>=WATER_GOAL)+
      tile("running",r.did?(r.km?r.km+"km":"✓"):"–","Run",!!r.did)+
      tile("boxing",b.did?((b.types||[]).length?(b.types||[]).length+" ✓":"✓"):"–","Boxing",!!b.did)+
      tile("snc",s.did?((s.lifts||[]).length||"✓"):"–","S&amp;C",!!s.did)+
      tile("recovery",rc.sleep?rc.sleep+"h":"–","Sleep",!!(rc.sleep&&rc.sleep>=7))+
      '</div>';
  }
  function weekDots(sec,test){
    var h='<div class="lf-week">';for(var i=6;i>=0;i--){var d=addDays(L.day,-i);var on=test(L.rows[d+":"+sec]||{});var lab=new Date(d+"T12:00:00").toLocaleDateString("en-AU",{weekday:"narrow"});h+='<div><i class="'+(on?"on":"")+'"></i>'+lab+'</div>';}return h+"</div>";
  }

  /* ---------- tabs ---------- */
  var TABS=[["nutrition","Nutrition"],["running","Running"],["boxing","Boxing"],["snc","S&C"],["recovery","Recovery"],["work","Work"]];
  function tabsHtml(){return '<div class="lf-tabs">'+TABS.map(function(t){return '<button class="lf-tab '+(L.tab===t[0]?"on":"")+'" onclick="lfTab(\''+t[0]+'\')">'+t[1]+'</button>';}).join("")+"</div>";}

  function tick(on){return '<div class="lf-tick '+(on?"on":"")+'">'+(on?"✓":"")+"</div>";}
  function sw(sec,field,on,label,sub){return '<div class="lf-big"><div><b>'+label+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div><div class="lf-sw '+(on?"on":"")+'" onclick="lfToggle(\''+sec+'\',\''+field+'\')"><i></i></div></div>';}
  function scale(sec,field,val,max,labels){var h='<div class="lf-scale">';for(var i=1;i<=max;i++){h+='<button class="'+(val===i?"on":"")+'" onclick="lfSet(\''+sec+'\',\''+field+'\','+i+',true)">'+(labels&&labels[i-1]?labels[i-1]:i)+'</button>';}return h+"</div>";}
  function chips(sec,field,opts,sel){sel=sel||[];return '<div class="lf-chips">'+opts.map(function(o){return '<button class="lf-chip '+(sel.indexOf(o)>=0?"on":"")+'" onclick="lfChip(\''+sec+'\',\''+field+'\',\''+E(o)+'\')">'+E(o)+'</button>';}).join("")+"</div>";}
  function notes(sec,val,ph){return '<label class="lf-f">Notes</label><textarea placeholder="'+E(ph||"Anything worth remembering")+'" oninput="lfSet(\''+sec+'\',\'notes\',this.value)">'+E(val||"")+'</textarea>';}

  function nutritionHtml(){
    var d=cur("nutrition"),plan=mealPlan();
    var rows=plan.map(function(m,i){var x=(d.meals&&d.meals[i])||{};
      if(L.editPlan)return '<div class="lf-row"><input type="text" value="'+E(m)+'" oninput="lfPlanMeal('+i+',this.value)"><button class="lf-x" onclick="lfPlanDel('+i+')">✕</button></div>';
      return '<div class="lf-row"><div onclick="lfMeal('+i+',\'done\')">'+tick(x.done)+'</div><span class="lf-lbl">'+E(m)+'</span><input type="text" placeholder="What you had" value="'+E(x.ate||"")+'" oninput="lfMeal('+i+',\'ate\',this.value)"></div>';}).join("");
    var w=d.water||0,pct=Math.min(100,Math.round(w/WATER_GOAL*100));
    return '<div class="card"><div class="lf-h">Meal plan <small><a href="#" onclick="lfPlanEdit();return false" style="color:var(--g)">'+(L.editPlan?"Done":"Edit plan")+'</a></small></div>'+rows+(L.editPlan?'<button class="lf-add" onclick="lfPlanAdd()">+ Add a meal</button>':"")+'</div>'+
      '<div class="card"><div class="lf-h">Water <small>goal 2.5L</small></div><div class="lf-water"><button onclick="lfWater(-1)">−</button><div class="lf-bar"><i style="width:'+pct+'%"></i></div><button onclick="lfWater(1)">+</button><b>'+(w*0.25).toFixed(2).replace(/\.?0+$/,"")+' L</b></div><div style="font-size:11px;color:var(--mu);margin-top:6px">'+w+' × 250ml glasses</div></div>'+
      '<div class="card"><div class="lf-grid"><div><label class="lf-f">Weight (kg)</label><input type="number" step="0.1" inputmode="decimal" value="'+E(d.weight||"")+'" oninput="lfSet(\'nutrition\',\'weight\',this.value)"></div><div><label class="lf-f">On plan today?</label>'+scale("nutrition","onplan",d.onplan,3,["No","Mostly","Yes"])+'</div></div>'+notes("nutrition",d.notes,"Cravings, energy, what to change")+'</div>';
  }
  function pace(m){var mm=Math.floor(m),ss=Math.round((m-mm)*60);if(ss===60){mm++;ss=0;}return mm+":"+pad2(ss);}
  function runningHtml(){
    var d=cur("running");var wk=0,runs=0;for(var i=0;i<7;i++){var x=L.rows[addDays(L.day,-i)+":running"];if(x&&x.did){runs++;wk+=parseFloat(x.km)||0;}}
    return '<div class="lf-stat"><div><b>'+(wk%1?wk.toFixed(1):wk)+'</b><span>km this week</span></div><div><b>'+runs+'</b><span>runs (7 days)</span></div><div><b>'+(d.km&&d.min?pace(d.min/d.km):"\u2013")+'</b><span>min/km today</span></div></div>'+
      sw("running","did",d.did,"Ran today","Flick it on and log the numbers")+
      '<div class="card"><div class="lf-grid3"><div><label class="lf-f">Distance km</label><input type="number" step="0.1" inputmode="decimal" value="'+E(d.km||"")+'" oninput="lfSet(\'running\',\'km\',this.value)"></div><div><label class="lf-f">Time min</label><input type="number" inputmode="numeric" value="'+E(d.min||"")+'" oninput="lfSet(\'running\',\'min\',this.value)"></div><div><label class="lf-f">Type</label><select onchange="lfSet(\'running\',\'type\',this.value)">'+["Easy","Tempo","Intervals","Long","Hills","Race"].map(function(o){return '<option '+(d.type===o?"selected":"")+'>'+o+'</option>';}).join("")+'</select></div></div>'+
      '<label class="lf-f">Effort</label>'+scale("running","effort",d.effort,5,["Easy","Steady","Working","Hard","Max"])+notes("running",d.notes,"Route, how the legs felt")+weekDots("running",function(x){return !!x.did;})+'</div>';
  }
  function boxingHtml(){
    var d=cur("boxing");
    return sw("boxing","did",d.did,"Boxing today","Session, sparring or your own work")+
      '<div class="card"><label class="lf-f">What you did</label>'+chips("boxing","types",["Skills","Pads","Bag","Sparring","Shadow","Conditioning","Coaching"],d.types)+
      '<div class="lf-grid" style="margin-top:10px"><div><label class="lf-f">Rounds</label><input type="number" inputmode="numeric" value="'+E(d.rounds||"")+'" oninput="lfSet(\'boxing\',\'rounds\',this.value)"></div><div><label class="lf-f">Minutes</label><input type="number" inputmode="numeric" value="'+E(d.min||"")+'" oninput="lfSet(\'boxing\',\'min\',this.value)"></div></div>'+
      '<label class="lf-f">Quality</label>'+scale("boxing","quality",d.quality,5)+notes("boxing",d.notes,"What clicked, what to drill next")+weekDots("boxing",function(x){return !!x.did;})+'</div>';
  }
  function sncHtml(){
    var d=cur("snc"),lifts=d.lifts||[];
    var rows=lifts.map(function(l,i){return '<div class="lf-lift"><input type="text" data-f="ex" placeholder="Exercise" value="'+E(l.ex||"")+'" oninput="lfLift('+i+',\'ex\',this.value)"><input type="text" inputmode="numeric" placeholder="Sets" value="'+E(l.sets||"")+'" oninput="lfLift('+i+',\'sets\',this.value)"><input type="text" inputmode="numeric" placeholder="Reps" value="'+E(l.reps||"")+'" oninput="lfLift('+i+',\'reps\',this.value)"><input type="text" inputmode="decimal" placeholder="kg" value="'+E(l.kg||"")+'" oninput="lfLift('+i+',\'kg\',this.value)"><button class="lf-x" onclick="lfLiftDel('+i+')">✕</button></div>';}).join("");
    return sw("snc","did",d.did,"Strength &amp; Con today","Lifts, circuits, engine work")+
      '<div class="card"><div class="lf-h">Session <small>exercise · sets · reps · kg</small></div>'+(rows||'<div style="font-size:12px;color:var(--mu)">Nothing logged yet.</div>')+'<button class="lf-add" onclick="lfLiftAdd()">+ Add exercise</button>'+
      '<label class="lf-f" style="margin-top:12px">Focus</label>'+chips("snc","focus",["Upper","Lower","Full body","Core","Conditioning","Mobility"],d.focus)+notes("snc",d.notes,"PBs, what felt heavy")+weekDots("snc",function(x){return !!x.did;})+'</div>';
  }
  function recoveryHtml(){
    var d=cur("recovery");
    return '<div class="card"><div class="lf-h">Sleep</div><div class="lf-grid3"><div><label class="lf-f">Hours</label><input type="number" step="0.5" inputmode="decimal" value="'+E(d.sleep||"")+'" oninput="lfSet(\'recovery\',\'sleep\',this.value)"></div><div><label class="lf-f">Bed</label><input type="time" value="'+E(d.bed||"")+'" oninput="lfSet(\'recovery\',\'bed\',this.value)"></div><div><label class="lf-f">Up</label><input type="time" value="'+E(d.wake||"")+'" oninput="lfSet(\'recovery\',\'wake\',this.value)"></div></div>'+
      '<label class="lf-f">Sleep quality</label>'+scale("recovery","quality",d.quality,5)+'</div>'+
      '<div class="card"><div class="lf-h">Recovery done</div>'+chips("recovery","did",["Sauna","Ice bath","Water therapy","Stretch","Mobility","Massage","Walk","Rest day"],d.did)+
      '<label class="lf-f" style="margin-top:12px">Soreness</label>'+scale("recovery","sore",d.sore,5,["Fresh","OK","Tight","Sore","Cooked"])+
      '<label class="lf-f">Energy</label>'+scale("recovery","energy",d.energy,5,["Flat","Low","OK","Good","Flying"])+notes("recovery",d.notes,"Niggles, what helped")+weekDots("recovery",function(x){return !!(x.sleep&&x.sleep>=7);})+'</div>';
  }
  function workHtml(){
    var w=get("work:tasks"),n=get("work:notes"),f=cur("work");
    var groups=WORK_GROUPS.map(function(g){var list=w[g[0]]||[];var done=list.filter(function(t){return t.done;}).length;
      var rows=list.map(function(t,i){return '<div class="lf-task '+(t.done?"done":"")+'"><div onclick="lfTaskTick(\''+g[0]+'\','+i+')">'+tick(t.done)+'</div><span>'+E(t.t)+'</span><button class="lf-x" onclick="lfTaskDel(\''+g[0]+'\','+i+')">✕</button></div>';}).join("");
      return '<div class="card"><div class="lf-h">'+g[1]+' <small>'+(list.length-done)+' open'+(done?' · <a href="#" style="color:var(--g)" onclick="lfTaskClear(\''+g[0]+'\');return false">clear '+done+' done</a>':'')+'</small></div>'+(rows||'<div style="font-size:12px;color:var(--mu)">Nothing on the list.</div>')+
        '<div class="lf-addrow"><input type="text" id="lfNew-'+g[0]+'" placeholder="Add to '+E(g[1])+'" onkeydown="if(event.key===\'Enter\'){lfTaskAdd(\''+g[0]+'\');}"><button onclick="lfTaskAdd(\''+g[0]+'\')">+</button></div>'+
        '<label class="lf-f">Notes</label><textarea style="min-height:48px" placeholder="Running notes for '+E(g[1])+'" oninput="lfWorkNote(\''+g[0]+'\',this.value)">'+E(n[g[0]]||"")+'</textarea></div>';}).join("");
    return '<div class="card"><div class="lf-h">Today’s focus <small>'+fmtDay(L.day)+'</small></div><textarea style="min-height:56px" placeholder="The one or two things that matter today" oninput="lfSet(\'work\',\'focus\',this.value)">'+E(f.focus||"")+'</textarea></div>'+groups;
  }

  function paintTabs(){var el=document.getElementById("lfTabs");if(el)el.innerHTML=tabsHtml();try{var on=el&&el.querySelector(".lf-tab.on");if(on)on.scrollIntoView({block:"nearest",inline:"center"});}catch(e){}}
  function paintSum(){var el=document.getElementById("lfSum");if(el)el.innerHTML=sumHtml();}
  function paintTab(){
    var el=document.getElementById("lfBody");if(!el)return;
    var h={nutrition:nutritionHtml,running:runningHtml,boxing:boxingHtml,snc:sncHtml,recovery:recoveryHtml,work:workHtml}[L.tab]||nutritionHtml;
    el.innerHTML=h();paintSum();paintTabs();
  }
  function paint(){
    var main=document.getElementById("main");if(!main)return;
    if(!allowed()){go("home");return;}
    if(!L.loaded||L.for!==uid()){main.innerHTML='<div class="lf"><button class="lf-back" onclick="go(\'home\')">‹ Home</button><div class="card"><p>Loading your day…</p></div></div>';load().then(function(){if(view==="life")paint();});return;}
    if(!L.day)L.day=today();
    var isToday=L.day===today();
    main.innerHTML='<div class="lf"><button class="lf-back" onclick="go(\'home\')">‹ Home</button>'+
      '<div class="lf-head"><div><div class="lf-kicker">Morning \u00b7 Evening \u00b7 Every day</div><div class="lf-title">Jake’s Life</div></div><span class="lf-demo">Demo · only you</span></div>'+
      '<div class="lf-daynav"><button onclick="lfDay(-1)">‹</button><div class="lf-day" onclick="lfDay(0)">'+(isToday?"Today":fmtDay(L.day))+'<small>'+(isToday?fmtDay(L.day):"tap for today")+'</small></div><button onclick="lfDay(1)">›</button></div>'+
      '<div id="lfSum">'+sumHtml()+'</div><div id="lfTabs">'+tabsHtml()+'</div><div id="lfBody"></div><div class="lf-save" id="lfSave"></div></div>';
    paintTab();
  }

  /* ---------- home tile ---------- */
  function injectTile(){
    var main=document.getElementById("main");if(!main||view!=="home"||!allowed())return;
    if(document.getElementById("lifeCard"))return;
    var wrap=document.createElement("div");
    wrap.innerHTML='<button class="homeCard lifeCard" id="lifeCard" style="background:linear-gradient(135deg,rgba(201,164,76,.18),rgba(8,8,10,.96) 55%),#0a0b0e;border-color:var(--gold-dim)" onclick="lifeEnter()"><div class="hcKicker">Only you can see this · Demo</div><div class="hcTitle">Jake’s Life</div><div class="hcSub">Nutrition · Running · Boxing · S&amp;C · Recovery · Work. Your whole day, tracked in one place.</div></button>';
    var card=wrap.firstChild;var first=main.querySelector(".homeCard");
    if(first)first.insertAdjacentElement("beforebegin",card);else main.appendChild(card);
  }
  window.lifeEnter=function(){if(!allowed())return;L.tab=store("lf_tab")||"nutrition";L.day=today();L.editPlan=false;go("life");};

  /* ---------- hooks ---------- */
  try{NAV_TAB.life="home";}catch(e){}
  var _render=window.render;
  window.render=function(){if(view==="life")return paint();return _render.apply(this,arguments);};
  ["renderHome"].forEach(function(fn){
    if(typeof window[fn]!=="function")return;var o=window[fn];
    window[fn]=function(){var r=o.apply(this,arguments);var after=function(){injectTile();if(allowed()&&(!L.loaded||L.for!==uid()))load();};if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,30);return r;};
  });
  setTimeout(function(){if(view==="home")injectTile();},900);
  setInterval(function(){try{if(view==="home"&&allowed()&&!document.getElementById("lifeCard"))injectTile();}catch(e){}},1200);
})();
