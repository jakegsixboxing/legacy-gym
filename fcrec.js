/*__FCREC__ ============================================================
   Fight Club · LEGACY RECOVERY tab (inside the camp view, next to Today /
   Week / Progress / Board) · 12 Oct 2026 · v2.
   PROTOCOLS: five numbered step systems with the timer built into the card
     (Post Strength & Con · Post sparring · Post run & sprints · Weekly
     wrap-up · Fresh for the week). Ice baths at the gym run 5, 7 and 10°C:
     longer sits use 10°, short hits 7°, sharp hits 5°.
   BUILD YOUR OWN: add steps (sauna / ice / hot / rest), minutes and ice temp
     per step, reorder by adding in order, same built-in timer.
   LOG: what each tool is for (short), quick log, this camp's sessions.
   Data: public.fc_recovery (own rows via fc_my_fighter_id, staff all).
   Hooks: fccamp.js calls window.fcRecHtml(w) for the body; uses
   window.fccFighter / fccPv / fccRepaint.
   ==================================================================== */
(function(){
"use strict";
var CAMP="fc2026";
var BLUE="#4FB8DC",DIM="#2a7c9c";
var R={sub:"proto",rows:null,loadedFor:null,loading:false,run:null,tick:null,build:[],quick:{sauna:0,ice:0,hot:0},done:null,v:{}};
try{var b0=JSON.parse(localStorage.getItem("fcrBuild")||"null");if(Array.isArray(b0))R.build=b0;}catch(e){}
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function T(m){try{toast(m);}catch(e){}}
function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
function fighter(){try{return window.fccFighter?window.fccFighter():null;}catch(e){return null;}}
function pv(){try{return !!(window.fccPv&&window.fccPv());}catch(e){return false;}}
function repaint(){try{if(window.fccRepaint)window.fccRepaint();}catch(e){}}
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function pd(s){var p=String(s).slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function fd(d){return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]+" "+d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];}
function mmss(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
function mins(s){return s%60?(Math.floor(s/60)+":"+String(s%60).padStart(2,"0")):(s/60)+" min";}

/* ---------- modalities ---------- */
var MN={sauna:"Infrared sauna",ice:"Ice bath",hot:"Hot bath",rest:"Out"};
var MC={sauna:"#ff9f6e",ice:BLUE,hot:"#ffd36e",rest:"#6f8591"};
var MODS=[
 {m:"sauna",temp:"45 to 60°C",time:"15 to 20 min",best:"Next-day power and soreness after a hard session. Sleep.",rule:"Fine after lifting. Water before and after."},
 {m:"ice",temp:"5 · 7 · 10°C",time:"10° for 10 min sits · 7° for 2 to 4 min hits · 5° for 60 to 90 s",best:"Soreness, swelling, bruising. The best-backed recovery tool there is.",rule:"Not within 4 hours of Strength & Con."},
 {m:"hot",temp:"38 to 40°C",time:"5 to 15 min",best:"Loosens tight muscle. Pairs with ice for contrast. Wind-down before bed.",rule:"Skip it on fresh bruising."}];

/* ---------- protocols: steps in seconds, ice steps carry the bath temp ----------
   Each protocol has two versions: Ultimate (sauna + water) and Water only (no sauna).
   Sources: CWI 10°C 15 min after simulated MMA (Lindsay et al. 2018, PMID 30443221);
   CWI dose network meta-analysis (Frontiers Physiol 2025, 10-15 min at 10-15°C best for
   soreness); contrast 1:1, 1 min hot / 1 min cold x 6-7 at 38-40° / 10-15° (Versey,
   Halson & Dawson 2013; GSSI SSE 120); CWI as effective as other modalities, may blunt
   resistance-training gains (Sports Med 2022 meta-analysis); infrared sauna 20 min at
   ~43°C after a heavy lift (PMID 37398966); hot bath 10 min at 40° 1-2 h before bed
   improves sleep (Haghayegh 2019 meta-analysis). */
var PROTOS=[
 {id:"spar",n:"Post sparring",alias:"The ice out",when:"Mon and Wed · within the hour after rounds",fin:"cold",
  vars:[{k:"Full",steps:[{m:"ice",s:300,t:10},{m:"rest",s:60,lbl:"Out, breathe"},{m:"ice",s:300,t:10},{m:"rest",s:60,lbl:"Out, breathe"},{m:"ice",s:300,t:10}]},
        {k:"Quick",steps:[{m:"ice",s:300,t:10},{m:"rest",s:60,lbl:"Out, breathe"},{m:"ice",s:300,t:10}]}],
  why:"<b>Sparring is the one night heat is out.</b> You have taken shots, so you have bruising on top of sore muscle, and heat pushes blood into bruised tissue. Cold does the opposite: it cuts the soreness, the swelling and the stress, and it is the only recovery that fighters have actually been tested on. Fifteen minutes at 10° after a simulated fight improved next-day soreness, sleep, fatigue and sprint speed. Full is that dose. Quick is ten minutes, still inside the research range.",
  src:"MMA cold water trial, PMID 30443221 · CWI dose meta-analysis, Frontiers 2025"},
 {id:"run",n:"Post run & sprints",alias:"The flush",when:"After the 3 km Mon and Wed · after Friday sprints",fin:"cold",
  vars:[{k:"Ultimate",steps:[{m:"sauna",s:600},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:120,t:10}]},
        {k:"Water only",steps:[{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10},{m:"hot",s:60},{m:"ice",s:60,t:10}]}],
  why:"<b>Legs only, no bruises, so this is the contrast session.</b> One minute hot, one minute cold, straight swaps, seven rounds. Hot opens the vessels, cold shuts them, and the pump flushes the legs out. That exact 1:1 protocol is the one that improved performance in the research, and finishing on cold keeps the soreness down for the next two days. Ultimate puts ten minutes of sauna in front to warm the legs through first. Lifted today as well? Do the hot steps only.",
  src:"Contrast 1:1 × 7, Versey, Halson & Dawson 2013 · GSSI SSE 120"},
 {id:"snc",n:"Post Strength & Con",alias:"The heat",when:"Tue and Thu · after the lift",fin:"hot",
  vars:[{k:"Ultimate",steps:[{m:"sauna",s:1200},{m:"rest",s:120,lbl:"Shower, water"},{m:"hot",s:300}]},
        {k:"Water only",steps:[{m:"hot",s:900}]}],
  why:"<b>No cold inside four hours of a lift.</b> Cold water straight after strength work cuts the size and strength gains you just trained for, so tonight is heat. Twenty minutes of infrared sauna after a heavy session kept next-day power up and soreness down in trained athletes, and a hot bath on its own reduced strength loss over the following days. Walk out loose, eat, sleep.",
  src:"Infrared sauna after lifting, PMID 37398966 · CWI and resistance training, Sports Med 2022"},
 {id:"week",n:"Weekly wrap-up",alias:"The reset",when:"Saturday or Sunday · end of the training week",fin:"hot",
  vars:[{k:"Ultimate",steps:[{m:"sauna",s:900},{m:"ice",s:120,t:10},{m:"rest",s:60,lbl:"Out, towel"},{m:"hot",s:600}]},
        {k:"Water only",steps:[{m:"ice",s:180,t:10},{m:"hot",s:300},{m:"ice",s:180,t:10},{m:"hot",s:600}]}],
  why:"<b>The week's damage is done. This one is for the nervous system and sleep.</b> Sauna then a two minute cold dip is the sauna-and-cold pattern the research uses, and it is the best mood and stress reset in the building. Then a ten minute hot soak to finish warm, because a 40° bath in the hour or two before bed is what improves sleep in the research, and your Sunday sleep is where the week's gains land.",
  src:"Sauna + 2 min cold studies · hot bath and sleep meta-analysis, Haghayegh 2019"},
 {id:"fresh",n:"Fresh for the week",alias:"The switch on",when:"Sunday night or Monday morning · before the first session",fin:"cold",
  vars:[{k:"Ultimate",steps:[{m:"sauna",s:600},{m:"ice",s:90,t:7},{m:"hot",s:120},{m:"ice",s:60,t:5}]},
        {k:"Water only",steps:[{m:"hot",s:120},{m:"ice",s:90,t:7},{m:"hot",s:120},{m:"ice",s:60,t:5}]}],
  why:"<b>Wake the system up, not wind it down.</b> Short, sharp and cold last. Heat to loosen the weekend off, then two cold hits on the colder baths: 90 seconds at 7°, then a minute at 5° to finish. Single cold dips lift mood and alertness in the studies, and nothing here is long enough to tire you out before Monday night.",
  src:"Cold immersion and mood, Massey 2020 · Kelly & Bird 2022"}];
function protoById(id){if(id==="build")return {id:"build",n:"My own recovery",steps:R.build.slice(),fin:R.build.length&&R.build[R.build.length-1].m==="ice"?"cold":"hot"};var p=PROTOS.find(function(x){return x.id===id;});if(!p)return null;var vi=R.v[id]||0,v=p.vars[vi];return Object.assign({},p,{steps:v.steps,vk:v.k,vi:vi});}
function total(st){return st.reduce(function(a,s){return a+s.s;},0);}
function sumMin(st,m){return Math.round(st.filter(function(s){return s.m===m;}).reduce(function(a,s){return a+s.s;},0)/60);}
function stepName(s){return s.lbl?s.lbl:(MN[s.m]+(s.m==="ice"&&s.t?" · "+s.t+"°":""));}

/* ---------- css ---------- */
var css=document.createElement("style");css.id="fcrCss";css.textContent=
 ".fcr{--b:"+BLUE+";--bd:"+DIM+";--ln:#1b2b34;--p:#0b1217;--p2:#0f1a21;--mu:#8fa3ad;--tx:#f4f7f9;color:var(--tx);font-family:Montserrat,sans-serif}"+
 ".fcr .hd{background:linear-gradient(160deg,#0c1a22,#050608);border:1px solid var(--ln);border-radius:16px;padding:18px 16px 16px;margin-bottom:12px}"+
 ".fcr .hd .t{font-family:Oswald,sans-serif;font-weight:600;font-size:22px;letter-spacing:4px;color:#fff;text-transform:uppercase}.fcr .hd .t span{font-family:'Mr Dafoe',cursive;font-weight:400;color:var(--b);font-size:30px;letter-spacing:1px;text-transform:none;margin-left:8px}"+
 ".fcr .hd .k{font-weight:700;font-size:9px;letter-spacing:4px;color:var(--mu);margin-top:3px;text-transform:uppercase}.fcr .hd .rule{width:44px;height:2px;background:var(--b);margin:10px 0}"+
 ".fcr .hd .st{display:flex;gap:6px}.fcr .hd .st div{flex:1;background:rgba(0,0,0,.4);border:1px solid var(--ln);border-radius:10px;padding:8px 6px;text-align:center}.fcr .hd .st b{display:block;font-family:Oswald,sans-serif;font-size:20px;line-height:1;color:#fff}.fcr .hd .st span{display:block;font-size:6.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--b);font-weight:800;margin-top:4px}"+
 ".fcr .sub{display:flex;gap:4px;background:rgba(0,0,0,.5);border:1px solid var(--ln);border-radius:12px;padding:4px;margin-bottom:12px}.fcr .sub button{flex:1;font-family:Oswald,sans-serif;font-weight:500;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;padding:9px 2px;border-radius:9px;border:0;background:transparent;color:var(--mu);cursor:pointer;white-space:nowrap}.fcr .sub button.on{background:var(--b);color:#04161d;font-weight:700}"+
 ".fcr .card{background:var(--p);border:1px solid var(--ln);border-radius:16px;padding:14px;margin-bottom:12px}.fcr .card.live{border-color:var(--b);box-shadow:0 0 0 1px rgba(79,184,220,.25),0 12px 30px rgba(0,0,0,.45)}.fcr .card.fin{border-color:#4bc97a}"+
 ".fcr .ph{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.fcr .ph h3{font-family:Oswald,sans-serif;font-weight:600;font-size:21px;letter-spacing:1.5px;text-transform:uppercase;margin:0;color:#fff;line-height:1.05}.fcr .ph .tt{text-align:right;flex:none}.fcr .ph .tt b{display:block;font-family:Oswald,sans-serif;font-size:21px;line-height:1;color:var(--b)}.fcr .ph .tt span{font-size:7.5px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);font-weight:800}"+
 ".fcr .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}.fcr .chips i{font-style:normal;font-size:8.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;padding:5px 9px;border-radius:999px;border:1px solid var(--ln);color:var(--mu)}.fcr .chips i.b{border-color:var(--bd);color:var(--b)}"+
 ".fcr .vsw{display:flex;gap:5px;margin-top:10px}.fcr .vsw button{flex:1;padding:9px 4px;border-radius:10px;border:1px solid var(--ln);background:var(--p2);color:var(--mu);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;cursor:pointer}.fcr .vsw button.on{background:#fff;border-color:#fff;color:#04161d;font-weight:700}"+
 ".fcr .steps{margin-top:12px;border-top:1px solid var(--ln)}"+
 ".fcr .stp{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln);position:relative}"+
 ".fcr .stp .n{width:28px;height:28px;border-radius:50%;flex:none;display:grid;place-items:center;font-family:Oswald,sans-serif;font-weight:600;font-size:13px;color:#04161d;background:var(--c)}"+
 ".fcr .stp .nm{flex:1;min-width:0}.fcr .stp .nm b{display:block;font-family:Oswald,sans-serif;font-weight:500;font-size:15px;letter-spacing:.8px;text-transform:uppercase;color:#fff}.fcr .stp .nm small{display:block;font-size:10px;color:var(--mu);font-weight:600;margin-top:1px}"+
 ".fcr .stp .tm{font-family:Oswald,sans-serif;font-weight:600;font-size:20px;color:#fff;font-variant-numeric:tabular-nums;flex:none}"+
 ".fcr .stp.done{opacity:.45}.fcr .stp.done .tm{color:#4bc97a}.fcr .stp.todo{opacity:.55}"+
 ".fcr .stp.now{margin:4px -6px;padding:12px 10px;background:linear-gradient(90deg,rgba(79,184,220,.14),rgba(79,184,220,.03));border:1px solid var(--bd);border-radius:12px;opacity:1}"+
 ".fcr .stp.now .tm{font-size:40px;line-height:1;color:#fff;text-shadow:0 0 18px rgba(79,184,220,.45)}.fcr .stp.now .nm b{font-size:17px;color:var(--b)}"+
 ".fcr .stp .x{border:0;background:none;color:var(--mu);font-size:20px;cursor:pointer;padding:0 2px;flex:none}"+
 ".fcr .stp .mn{display:flex;align-items:center;gap:4px;flex:none}.fcr .stp .mn button{width:30px;height:30px;border-radius:8px;border:1px solid var(--ln);background:var(--p2);color:#fff;font-size:16px;font-weight:800;cursor:pointer}.fcr .stp .mn b{min-width:52px;text-align:center;font-family:Oswald,sans-serif;font-size:17px}"+
 ".fcr .stp .tp{display:flex;gap:3px;margin-top:4px}.fcr .stp .tp button{padding:3px 7px;border-radius:999px;border:1px solid var(--ln);background:transparent;color:var(--mu);font-size:9px;font-weight:800;cursor:pointer}.fcr .stp .tp button.on{background:var(--b);border-color:var(--b);color:#04161d}"+
 ".fcr .bar{height:5px;border-radius:3px;background:#0e171c;margin-top:12px;overflow:hidden}.fcr .bar i{display:block;height:100%;background:var(--b);transition:width .5s linear}"+
 ".fcr .why{font-size:12.5px;line-height:1.5;color:#c9d4da;margin:12px 0 0}.fcr .why b{color:#fff}"+
 ".fcr .big{display:block;width:100%;margin-top:12px;padding:15px;border-radius:12px;border:0;background:var(--b);color:#04161d;font-family:Oswald,sans-serif;font-size:16px;letter-spacing:2.5px;text-transform:uppercase;font-weight:700;cursor:pointer}.fcr .big.gh{background:none;border:1px solid var(--ln);color:var(--mu);padding:11px;font-size:12px;letter-spacing:1.5px;margin-top:6px}.fcr .big.ok{background:#4bc97a}"+
 ".fcr .ctl{display:flex;gap:6px;margin-top:12px}.fcr .ctl button{flex:1;padding:13px 4px;border-radius:12px;border:1px solid var(--bd);background:transparent;color:#fff;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}.fcr .ctl button.p{background:var(--b);color:#04161d;border-color:var(--b);font-weight:700;flex:1.6}"+
 ".fcr .add{display:flex;gap:5px;margin-top:10px}.fcr .add button{flex:1;padding:11px 2px;border-radius:10px;border:1px solid var(--ln);background:var(--p2);color:#fff;font-family:Oswald,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;border-top:3px solid var(--c)}"+
 ".fcr .mod{display:flex;gap:12px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--ln)}.fcr .mod:first-child{border-top:0;padding-top:0}.fcr .mod .dot{width:12px;height:12px;border-radius:50%;flex:none;margin-top:4px}.fcr .mod b{display:block;font-family:Oswald,sans-serif;font-weight:600;font-size:15px;letter-spacing:1px;text-transform:uppercase;color:#fff}.fcr .mod .sp{font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--b);font-weight:800;margin-top:2px}.fcr .mod p{font-size:12px;line-height:1.45;color:#c9d4da;margin:4px 0 0}.fcr .mod p small{display:block;color:var(--mu);margin-top:2px;font-size:11px}"+
 ".fcr .row{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--ln)}.fcr .row:first-of-type{border-top:0}.fcr .row .l{flex:1}.fcr .row .l b{font-family:Oswald,sans-serif;font-weight:500;font-size:14px;letter-spacing:.5px;text-transform:uppercase;color:#fff}"+
 ".fcr .row input{width:74px;background:#050608;border:1.5px solid var(--bd);border-radius:10px;color:#fff;padding:9px 8px;font-family:Oswald,sans-serif;font-size:19px;text-align:center;flex:none}.fcr .row input:focus{outline:none;border-color:var(--b)}.fcr .row .u{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800;width:26px}"+
 ".fcr .log{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--ln)}.fcr .log:first-of-type{border-top:0}.fcr .log .d{width:76px;flex:none;font-size:10.5px;color:var(--mu);font-weight:700}.fcr .log .n{flex:1;min-width:0;font-size:13px;font-weight:700;color:#fff}.fcr .log .n small{display:block;font-size:10.5px;color:var(--mu);font-weight:600;margin-top:1px}.fcr .log .x{border:0;background:none;color:var(--mu);font-size:18px;cursor:pointer;padding:0 4px}"+
 ".fcr .kk{font-size:8.5px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:var(--b);margin-bottom:6px}.fcr .empty{font-size:12px;color:var(--mu);padding:6px 0}.fcr .src{font-size:10.5px;line-height:1.5;color:var(--mu);margin:0}";
document.head.appendChild(css);
try{if(!document.getElementById("fcrDafoe")&&!document.querySelector('link[href*="Mr+Dafoe"]')){var fl=document.createElement("link");fl.id="fcrDafoe";fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Mr+Dafoe&display=swap";document.head.appendChild(fl);}}catch(e){}

/* ---------- data ---------- */
function rows(){var f=fighter();if(!f)return [];return (R.rows||[]).filter(function(r){return r.fighter_id===f.id;});}
function load(){var f=fighter();if(!f||R.loading)return;if(R.loadedFor===f.id)return;R.loading=true;
  sb.from("fc_recovery").select("*").eq("fighter_id",f.id).order("done_at",{ascending:false}).then(function(r){R.loading=false;R.rows=r.error?[]:(r.data||[]);R.loadedFor=f.id;repaint();},function(){R.loading=false;});}
function thisWeek(){var now=new Date(),d=(now.getDay()+6)%7,mon=new Date(now);mon.setHours(0,0,0,0);mon.setDate(mon.getDate()-d);return rows().filter(function(r){return pd(r.done_at)>=mon;}).length;}
async function logSteps(steps,kind,name){if(pv()){T("Preview only · nothing saved");return;}var f=fighter();if(!f)return;
  var row={camp:CAMP,fighter_id:f.id,done_at:iso(new Date()),kind:kind,name:name,sauna_min:sumMin(steps,"sauna"),ice_min:sumMin(steps,"ice"),hot_min:sumMin(steps,"hot"),total_min:Math.round(total(steps)/60),created_by:uid()};
  var r=await sb.from("fc_recovery").insert(row).select().maybeSingle();if(r.error){T("Couldn't save · "+r.error.message);return;}R.rows=[r.data].concat(R.rows||[]);}

/* ---------- pieces ---------- */
function headHtml(){var all=rows(),last=all[0];
  return '<div class="hd"><div class="t">Legacy<span>Recovery</span></div><div class="k">Fight Club · Camp 2026</div><div class="rule"></div>'
   +'<div class="st"><div><b>'+all.length+'</b><span>Sessions<br>this camp</span></div><div><b>'+thisWeek()+'</b><span>This<br>week</span></div><div><b>'+(last?fd(pd(last.done_at)).replace(/^\w+ /,''):'–')+'</b><span>Last<br>session</span></div></div></div>'
   +'<div class="sub">'+[["proto","Protocols"],["build","Build your own"],["log","Log"]].map(function(x){return '<button class="'+(R.sub===x[0]?'on':'')+'" onclick="fcrSub(\''+x[0]+'\')">'+x[1]+'</button>';}).join('')+'</div>';}
/* step list; when a run is attached to this protocol the current step carries the live clock */
function stepsHtml(p,run,edit){var st=p.steps;
  return '<div class="steps">'+st.map(function(s,i){var cls=run?(i<run.idx?'done':i===run.idx?'now':'todo'):'';var tm=run&&i===run.idx?mmss(run.left):run&&i<run.idx?'✓':mmss(s.s);
    var nm='<div class="nm"><b>'+E(stepName(s))+'</b>'+(s.m==="ice"&&!s.lbl?'<small>'+(s.s>=240?'Settle in, breathe slow':s.s>=90?'Short hit, shoulders under':'Sharp hit, all the way in')+'</small>':s.m==="sauna"?'<small>45 to 60°C, sip water</small>':s.m==="hot"?'<small>38 to 40°C</small>':s.lbl?'':'<small>Towel off, breathe</small>')+'</div>';
    if(edit)return '<div class="stp" style="--c:'+MC[s.m]+'"><div class="n">'+(i+1)+'</div><div class="nm"><b>'+E(MN[s.m])+'</b>'+(s.m==="ice"?'<div class="tp">'+[5,7,10].map(function(t){return '<button class="'+(s.t===t?'on':'')+'" onclick="fcrTemp('+i+','+t+')">'+t+'°</button>';}).join('')+'</div>':'')+'</div><div class="mn"><button onclick="fcrAdj('+i+',-30)">−</button><b>'+mmss(s.s)+'</b><button onclick="fcrAdj('+i+',30)">+</button></div><button class="x" onclick="fcrRemove('+i+')">×</button></div>';
    return '<div class="stp '+cls+'" style="--c:'+MC[s.m]+'"><div class="n">'+(i+1)+'</div>'+nm+'<div class="tm">'+tm+'</div></div>';}).join('')+'</div>';}
function protoCard(p,ctx){var run=R.run&&R.run.id===p.id?R.run:null,fin=R.done===p.id,st=p.steps,tot=total(st);
  var h='<div class="card'+(run?' live':'')+(fin?' fin':'')+'"><div class="ph"><div>'+(p.alias?'<div class="kk">'+E(p.alias)+'</div>':'')+'<h3>'+E(p.n)+'</h3></div><div class="tt"><b>'+Math.round(tot/60)+'</b><span>min</span></div></div>'
   +'<div class="chips"><i class="b">'+(p.fin==="cold"?'Finish cold':'Finish hot')+'</i>'+(p.when?'<i>'+E(p.when)+'</i>':'')+'</div>'
   +(p.vars&&!run?'<div class="vsw">'+p.vars.map(function(v,i){return '<button class="'+(i===p.vi?'on':'')+'" onclick="fcrVar(\''+p.id+'\','+i+')">'+E(v.k)+' · '+Math.round(total(v.steps)/60)+' min</button>';}).join('')+'</div>':'')
   +stepsHtml(p,run,ctx==="edit");
  if(run){var done=st.slice(0,run.idx).reduce(function(a,x){return a+x.s;},0)+(st[run.idx].s-run.left);
    h+='<div class="bar"><i style="width:'+Math.round(done/tot*100)+'%"></i></div><div class="ctl"><button class="p" onclick="fcrPause()">'+(run.on?'Pause':run.started?'Resume':'Start')+'</button><button onclick="fcrSkip()">Next</button><button onclick="fcrStop()">Stop</button></div>';}
  else if(fin)h+='<button class="big ok" onclick="fcrSub(\'log\')">Done · logged ✓</button>';
  else if(st.length)h+=(p.why?'<p class="why">'+p.why+'</p>':'')+(p.src?'<p class="src" style="margin-top:6px">'+E(p.src)+'</p>':'')+'<button class="big" onclick="fcrStart(\''+p.id+'\')">Start</button><button class="big gh" onclick="fcrLogSteps(\''+p.id+'\')">Did it without the timer · log it</button>';
  else h+='<div class="empty">Add your first step below.</div>';
  return h+'</div>';}
function protoHtml(){if(R.run&&R.run.id!=="build"){var lp=protoById(R.run.id);if(lp)return protoCard(lp);}return PROTOS.map(function(p){return protoCard(protoById(p.id));}).join('')
  +'<div class="card"><div class="kk">Where the numbers come from</div><p class="src">Cold: 10 to 15 minutes at 10 to 15°C ranks best for next-day soreness in a 2025 network meta-analysis, and 15 minutes at 10°C after a simulated MMA fight improved next-day soreness, sleep, fatigue and sprint speed. Contrast: the protocol with proven effects is 1 minute hot, 1 minute cold at 1:1, six to seven rounds, 38 to 40° hot and 10 to 15° cold. Lifting: cold straight after resistance training reduces strength and size gains. Sauna: 20 minutes of infrared at about 43°C after a heavy lift improved next-day power and soreness. Sleep: a 10 minute 40° bath one to two hours before bed improves sleep quality.</p></div>';}
function buildHtml(){var p=protoById("build");
  return protoCard(p,"edit")
   +'<div class="card"><div class="kk">Add a step</div><div class="add">'+["sauna","ice","hot","rest"].map(function(m){return '<button style="--c:'+MC[m]+'" onclick="fcrAdd(\''+m+'\')">+ '+(m==="rest"?"Out":MN[m].replace("Infrared ",""))+'</button>';}).join('')+'</div>'
   +'<p class="why" style="margin-top:10px">Steps run in the order you add them. Tap − and + for the minutes, pick the ice bath temp (5, 7 or 10°), × to drop a step. <b>After training finish cold, on a rest day finish hot, and no ice inside 4 hours of a lift.</b></p>'
   +(p.steps.length?'<button class="big gh" onclick="fcrClear()">Clear the list</button>':'')+'</div>';}
function logHtml(){var all=rows();
  var h='<div class="card">'+MODS.map(function(m){return '<div class="mod"><div class="dot" style="background:'+MC[m.m]+'"></div><div><b>'+E(MN[m.m])+'</b><div class="sp">'+E(m.temp)+' · '+E(m.time)+'</div><p>'+E(m.best)+'<small>'+E(m.rule)+'</small></p></div></div>';}).join('')+'</div>';
  h+='<div class="card"><div class="kk">Already done it · log it</div>'
    +'<div class="row"><div class="l"><b>Infrared sauna</b></div><input id="fcrQs" type="number" min="0" max="60" inputmode="numeric" placeholder="0"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Ice bath</b></div><input id="fcrQi" type="number" min="0" max="30" inputmode="numeric" placeholder="0"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Hot bath</b></div><input id="fcrQh" type="number" min="0" max="60" inputmode="numeric" placeholder="0"><span class="u">min</span></div>'
    +'<button class="big" onclick="fcrQuick()">Log it</button></div>';
  h+='<div class="card"><div class="kk">This camp · '+all.length+' session'+(all.length===1?'':'s')+'</div>'+(all.length?all.slice(0,25).map(function(r){return '<div class="log"><span class="d">'+E(fd(pd(r.done_at)))+'</span><span class="n">'+E(r.name||'Recovery')+'<small>'+[r.sauna_min?'Sauna '+r.sauna_min:'',r.ice_min?'Ice '+r.ice_min:'',r.hot_min?'Hot '+r.hot_min:''].filter(Boolean).join(' · ')+' · '+r.total_min+' min</small></span><button class="x" onclick="fcrDel('+r.id+')">×</button></div>';}).join(''):'<div class="empty">Nothing logged yet. Run a protocol and it logs itself.</div>')+'</div>';
  return h;}
window.fcRecHtml=function(w){load();var h='<div class="fcr">'+headHtml();
  if(R.run&&R.sub==="log")h+=protoCard(protoById(R.run.id));
  h+=R.sub==="build"?buildHtml():R.sub==="log"?logHtml():protoHtml();return h+'</div>';};
window.fcRecAfter=function(){};

/* ---------- timer (updates the live row in place, no full repaint per second) ---------- */
function beep(n){try{var A=window.AudioContext||window.webkitAudioContext;if(A){var c=new A();for(var i=0;i<(n||1);i++){var o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.2;o.start(c.currentTime+i*.35);o.stop(c.currentTime+i*.35+.22);}}}catch(e){}try{if(navigator.vibrate)navigator.vibrate(n>1?[250,120,250,120,250]:[200,100,200]);}catch(e){}}
function stopTick(){if(R.tick){clearInterval(R.tick);R.tick=null;}}
function tick(){var r=R.run;if(!r||!r.on)return;r.left--;
  if(r.left<=0){if(r.idx+1>=r.steps.length){beep(3);finish();return;}r.idx++;r.left=r.steps[r.idx].s;beep(1);repaint();return;}
  if(r.left===10)beep(1);
  var el=document.querySelector(".fcr .card.live .stp.now .tm");if(el)el.textContent=mmss(r.left);
  var bar=document.querySelector(".fcr .card.live .bar i");if(bar){var st=r.steps,done=st.slice(0,r.idx).reduce(function(a,x){return a+x.s;},0)+(st[r.idx].s-r.left);bar.style.width=Math.round(done/total(st)*100)+"%";}}
function finish(){var r=R.run;stopTick();R.run=null;R.done=r.id;logSteps(r.steps,r.kind,r.name).then(function(){T(r.name+" done · logged ✓");repaint();});}

/* ---------- actions ---------- */
function saveBuild(){try{localStorage.setItem("fcrBuild",JSON.stringify(R.build));}catch(e){}}
window.fcrVar=function(id,i){R.v[id]=i;repaint();};
window.fcrSub=function(s){R.sub=s;R.done=null;repaint();try{window.scrollTo(0,0);}catch(e){}};
window.fcrStart=function(id){var p=protoById(id);if(!p||!p.steps.length){T("Add a step first");return;}stopTick();R.done=null;R.sub=id==="build"?"build":"proto";R.run={id:id,kind:id==="build"?"build":"protocol",name:p.n+(p.vk?" · "+p.vk:""),steps:p.steps.slice(),idx:0,left:p.steps[0].s,on:true,started:true};R.tick=setInterval(tick,1000);repaint();};
window.fcrPause=function(){var r=R.run;if(!r)return;r.on=!r.on;r.started=true;stopTick();if(r.on)R.tick=setInterval(tick,1000);repaint();};
window.fcrSkip=function(){var r=R.run;if(!r)return;if(r.idx+1>=r.steps.length){finish();return;}r.idx++;r.left=r.steps[r.idx].s;repaint();};
window.fcrStop=function(){stopTick();R.run=null;T("Stopped · nothing logged");repaint();};
window.fcrLogSteps=function(id){var p=protoById(id);if(!p||!p.steps.length){T("Add a step first");return;}logSteps(p.steps,id==="build"?"build":"protocol",p.n+(p.vk?" · "+p.vk:"")).then(function(){T(p.n+" logged ✓");R.sub="log";repaint();});};
window.fcrAdd=function(m){var d={sauna:900,ice:180,hot:300,rest:60}[m],s={m:m,s:d};if(m==="ice")s.t=10;R.build.push(s);saveBuild();repaint();};
window.fcrAdj=function(i,d){var s=R.build[i];if(!s)return;s.s=Math.max(30,Math.min(3600,s.s+d));saveBuild();repaint();};
window.fcrTemp=function(i,t){var s=R.build[i];if(!s)return;s.t=t;saveBuild();repaint();};
window.fcrRemove=function(i){R.build.splice(i,1);saveBuild();repaint();};
window.fcrClear=function(){R.build=[];saveBuild();repaint();};
window.fcrQuick=function(){function n(id,hi){var v=parseFloat((document.getElementById(id)||{}).value);return isNaN(v)?0:Math.max(0,Math.min(hi,v));}var s=n("fcrQs",60),i=n("fcrQi",30),h=n("fcrQh",60);if(!(s+i+h)){T("Put the minutes in first");return;}var st=[];if(s)st.push({m:"sauna",s:s*60});if(i)st.push({m:"ice",s:i*60});if(h)st.push({m:"hot",s:h*60});logSteps(st,"quick","Recovery").then(function(){T("Logged ✓");repaint();});};
window.fcrDel=async function(id){if(pv()){T("Preview only");return;}if(!confirm("Remove this session?"))return;var r=await sb.from("fc_recovery").delete().eq("id",id);if(r.error){T("Couldn't remove it");return;}R.rows=(R.rows||[]).filter(function(x){return x.id!==id;});repaint();};
})();
