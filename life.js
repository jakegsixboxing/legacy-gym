/*__LIFE__ ============================================================
   JAKE'S LIFE v2: one screen, one next thing. Built for a brain that
   gives the app sixty seconds, so every job is a tap, never a form.

   HOW IT THINKS
   - NOW screen: the day is a short list of jobs in the order they matter
     at this hour (morning: sleep, weigh, water, plan; day: water, meals,
     training; evening: Fight Club, recovery, close the day). Done jobs
     shrink to one line so the screen gets shorter as the day goes on.
   - Everything logs with a tap. Typing is optional (brain dump, top 3).
   - A weekly template says what training is planned each weekday; the
     app turns that into today's tiles with a built-in timer and a DONE tap.
   - Score out of 10 every day, streak, and a 10-week scoreboard to 19 Dec.
   - Work = Fight Club tonight (Mon/Tue/Wed), Top 3 for today, brain dump.

   ACCESS: one account only (Jake). Data in public.life_entries, own rows
   (RLS). Keys: "YYYY-MM-DD" (the day), "plan" (template/settings),
   "dump" (brain dump list). Additive add-on. Delete file + tag to remove.
   ==================================================================== */
(function(){
  var OWNER=["15a011b9-e222-45f0-8eb9-d5338da935d1"]; /* Jake only */
  var L={loaded:false,loading:null,for:null,rows:{},screen:"now",day:null,saveT:{},dirty:{},timer:null,open:{}};
  var E=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  var T=function(m){try{toast(m);}catch(e){}};
  function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
  function allowed(){var u=uid();return !!u&&OWNER.indexOf(u)>=0;}
  function pad2(n){return (n<10?"0":"")+n;}
  function iso(d){d=d||new Date();return d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());}
  function today(){return iso(new Date());}
  function addDays(s,n){var d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return iso(d);}
  function dow(s){return new Date(s+"T12:00:00").getDay();} /* 0 Sun */
  function fmtDay(s){var d=new Date(s+"T12:00:00");return d.toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"short"});}
  function hour(){return new Date().getHours();}
  function phase(){var h=hour();return h<11?"morning":h<17?"day":"evening";}
  var XMAS_END="2026-12-19", XMAS_START="2026-10-12";

  var css=document.createElement("style");css.id="lifeCss";css.textContent=`
.lf{--g:#c9a44c;--gd:#8a7136;--p:#121214;--p2:#18181b;--ln:#26262b;--tx:#f2f0eb;--mu:#9a9891;--ok:#4bc97a;--bad:#e05252;--blue:#4a8de6;--ice:#7fd3ff;--hot:#ff8a5b;color:var(--tx);padding-bottom:30px}
.lf *{box-sizing:border-box}
.lf .lf-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.lf .lf-back{background:transparent;border:0;color:var(--g);font-weight:800;font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:0;cursor:pointer}
.lf .lf-title{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;text-transform:uppercase;line-height:1;letter-spacing:1px}
.lf .lf-sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--mu);font-weight:800;margin-top:3px}
.lf .lf-ring{position:relative;width:64px;height:64px;flex:none}
.lf .lf-ring svg{transform:rotate(-90deg)}
.lf .lf-ring b{position:absolute;inset:0;display:grid;place-items:center;font-family:Oswald,sans-serif;font-size:19px;line-height:1}
.lf .lf-ring b small{display:block;font-size:8px;letter-spacing:1px;color:var(--mu);font-family:Montserrat,sans-serif;font-weight:800}
.lf .lf-nav{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:0 0 12px}
.lf .lf-nav button{padding:10px 4px;border-radius:10px;background:var(--p);border:1px solid var(--ln);color:var(--mu);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}
.lf .lf-nav button.on{background:var(--g);border-color:var(--g);color:#161307;font-weight:700}
.lf .lf-strip{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;padding-bottom:2px}
.lf .lf-strip::-webkit-scrollbar{display:none}
.lf .lf-strip div{flex:none;min-width:74px;background:var(--p);border:1px solid var(--ln);border-radius:10px;padding:7px 8px;text-align:center}
.lf .lf-strip b{display:block;font-family:Oswald,sans-serif;font-size:16px;line-height:1.1}
.lf .lf-strip span{font-size:7.5px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800}
.lf .job{background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:14px;margin-bottom:10px}
.lf .job.next{border-color:var(--g);box-shadow:0 0 0 1px rgba(201,164,76,.25),0 10px 28px rgba(0,0,0,.4)}
.lf .job.done{padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;opacity:.75}
.lf .job.done .jt{font-size:13px}
.lf .jk{font-size:9.5px;letter-spacing:2px;text-transform:uppercase;color:var(--g);font-weight:800;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center}
.lf .jk small{color:var(--mu);letter-spacing:1px;font-weight:700;text-align:right}
.lf .jt{font-family:Oswald,sans-serif;font-size:19px;text-transform:uppercase;letter-spacing:.5px;line-height:1.1}
.lf .jd{font-size:12px;color:var(--mu);line-height:1.45;margin-top:4px}
.lf .jd b{color:var(--tx)}
.lf .tick{width:30px;height:30px;border-radius:9px;border:1.5px solid var(--ln);background:#0e0e10;display:grid;place-items:center;color:#06110a;font-weight:900;font-size:15px;flex:none;cursor:pointer}
.lf .tick.on{background:var(--ok);border-color:var(--ok)}
.lf .big{display:block;width:100%;margin-top:10px;padding:15px;border-radius:12px;border:0;background:var(--g);color:#161307;font-family:Oswald,sans-serif;font-size:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer}
.lf .big.ghost{background:none;border:1px solid var(--gd);color:var(--g)}
.lf .big.ok{background:var(--ok);color:#06110a}
.lf .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.lf .chip{padding:11px 14px;border-radius:999px;background:var(--p2);border:1px solid var(--ln);color:var(--tx);font-size:13px;font-weight:700;cursor:pointer;min-width:52px;text-align:center}
.lf .chip.on{background:var(--ok);border-color:var(--ok);color:#06110a}
.lf .chip.ice.on{background:var(--ice);border-color:var(--ice)}.lf .chip.hot.on{background:var(--hot);border-color:var(--hot)}
.lf .water{display:flex;align-items:center;gap:10px;margin-top:8px}
.lf .water .cups{flex:1;display:grid;grid-template-columns:repeat(10,1fr);gap:4px}
.lf .water .cups i{display:block;height:26px;border-radius:6px;background:#0e0e10;border:1px solid var(--ln)}
.lf .water .cups i.on{background:linear-gradient(180deg,#4a8de6,#2f6fc4);border-color:#4a8de6}
.lf .water button{width:56px;height:56px;border-radius:16px;border:0;background:var(--blue);color:#fff;font-size:28px;font-weight:900;cursor:pointer;flex:none}
.lf .water button.minus{width:40px;height:40px;background:var(--p2);border:1px solid var(--ln);color:var(--mu);font-size:20px;border-radius:12px}
.lf .meals{display:flex;flex-direction:column;gap:6px;margin-top:8px}
.lf .meal{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;background:var(--p2);border:1px solid var(--ln);cursor:pointer}
.lf .meal.on{border-color:var(--ok)}
.lf .meal span{flex:1;font-weight:700;font-size:14px}
.lf .meal.on span{color:var(--mu);text-decoration:line-through}
.lf .meal small{font-size:11px;color:var(--mu)}
.lf .sess{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;background:var(--p2);border:1px solid var(--ln);margin-top:8px}
.lf .sess.on{border-color:var(--ok)}
.lf .sess .st{flex:1;min-width:0;cursor:pointer}
.lf .sess b{font-family:Oswald,sans-serif;font-size:15px;text-transform:uppercase;letter-spacing:.5px;display:block}
.lf .sess small{font-size:11px;color:var(--mu);display:block;margin-top:2px;line-height:1.4}
.lf .sess .go{padding:9px 12px;border-radius:9px;background:var(--g);border:0;color:#161307;font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;cursor:pointer;flex:none}
.lf .tag{display:inline-block;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;border:1px solid var(--ln);color:var(--mu);border-radius:999px;padding:2px 7px;margin-right:6px;vertical-align:middle}
.lf .tag.run{color:#7fd3ff;border-color:#2f6fc4}.lf .tag.snc{color:var(--g);border-color:var(--gd)}.lf .tag.box{color:#ff8a5b;border-color:#8a4a2e}.lf .tag.rec{color:var(--ok);border-color:#2a6b45}.lf .tag.fc{color:#fff;border-color:#555}
.lf .wk{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:8px}
.lf .wk div{text-align:center;background:var(--p2);border:1px solid var(--ln);border-radius:10px;padding:8px 2px;cursor:pointer}
.lf .wk div.today{border-color:var(--g)}
.lf .wk b{display:block;font-family:Oswald,sans-serif;font-size:16px}
.lf .wk span{font-size:8px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800}
.lf .wk i{display:block;height:4px;border-radius:2px;background:#0e0e10;margin-top:5px}
.lf .wk i.s1{background:var(--bad)}.lf .wk i.s2{background:var(--g)}.lf .wk i.s3{background:var(--ok)}
.lf .list{margin-top:8px}
.lf .item{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--ln)}
.lf .item:first-child{border-top:0}
.lf .item span{flex:1;font-size:14px;line-height:1.35}
.lf .item.on span{color:var(--mu);text-decoration:line-through}
.lf .item .x{border:0;background:none;color:var(--mu);font-size:18px;cursor:pointer;padding:0 4px}
.lf .addrow{display:flex;gap:6px;margin-top:8px}
.lf .addrow input{flex:1;min-width:0;background:#0e0e10;border:1px solid var(--ln);border-radius:10px;color:var(--tx);padding:12px;font-size:15px;font-family:inherit}
.lf .addrow input:focus{outline:none;border-color:var(--gd)}
.lf .addrow button{flex:none;width:48px;border-radius:10px;background:var(--g);border:0;color:#161307;font-weight:900;font-size:20px;cursor:pointer}
.lf .timer{text-align:center;padding:12px 0 4px}
.lf .timer b{font-family:Oswald,sans-serif;font-size:56px;line-height:1;letter-spacing:2px;font-variant-numeric:tabular-nums}
.lf .timer small{display:block;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--mu);font-weight:800;margin-top:4px}
.lf .steps{margin-top:10px;font-size:13px;line-height:1.6;color:var(--tx)}
.lf .steps div{padding:6px 0;border-top:1px solid var(--ln)}
.lf .steps div:first-child{border-top:0}
.lf .steps b{color:var(--g);font-family:Oswald,sans-serif;font-size:14px;margin-right:6px}
.lf .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.lf .sel{width:100%;background:#0e0e10;border:1px solid var(--ln);border-radius:10px;color:var(--tx);padding:11px;font-size:14px;font-family:inherit}
.lf .num{width:100%;background:#0e0e10;border:1px solid var(--ln);border-radius:10px;color:var(--tx);padding:11px;font-size:16px;font-family:inherit}
.lf .num:focus,.lf .note:focus,.lf .sel:focus{outline:none;border-color:var(--gd)}
.lf .note{width:100%;min-height:52px;background:#0e0e10;border:1px solid var(--ln);border-radius:10px;color:var(--tx);padding:10px;font-size:14px;font-family:inherit;margin-top:8px;resize:vertical}
.lf .save{position:fixed;right:14px;bottom:calc(84px + env(safe-area-inset-bottom));font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);background:rgba(13,13,14,.92);border:1px solid var(--ln);border-radius:999px;padding:5px 10px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:40}
.lf .save.show{opacity:1}
.lf .pl{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-top:1px solid var(--ln)}
.lf .pl:first-child{border-top:0}
.lf .pl b{width:36px;font-family:Oswald,sans-serif;font-size:14px;color:var(--g);text-transform:uppercase;flex:none;padding-top:4px}
.lf .pl .pls{flex:1;display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.lf .pl .pls span{font-size:11px;background:var(--p2);border:1px solid var(--ln);border-radius:999px;padding:5px 9px;font-weight:700}
.lf .pl .pls span i{font-style:normal;color:var(--mu);margin-left:6px;cursor:pointer}
.lf .xw{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-top:8px}
.lf .xw div{text-align:center;font-size:8px;color:var(--mu);font-weight:800}
.lf .xw i{display:block;height:22px;border-radius:5px;background:#0e0e10;border:1px solid var(--ln);margin-bottom:3px}
.lf .xw i.s1{background:#3a2a2a}.lf .xw i.s2{background:#4a3d1c}.lf .xw i.s3{background:var(--ok);border-color:var(--ok)}.lf .xw i.cur{border-color:var(--g)}
.homeCard.lifeCard .hcKicker{color:var(--gold)}
`;document.head.appendChild(css);

  /* ---------- session library (Jake's kit: no Olympic lifting) ---------- */
  var LIB={
    run_easy:{kind:"run",name:"Easy run",min:30,desc:"Conversational pace. 30 min. Nose breathing if you can.",steps:["5 min walk to jog","20 min easy, could hold a chat","5 min walk off"]},
    run_tempo:{kind:"run",name:"Tempo run",min:25,desc:"10 easy, 12 at comfortably hard, 3 easy.",steps:["10 min easy","12 min at a pace you could hold for 40 min, not 4","3 min easy"]},
    run_int:{kind:"run",name:"Intervals",min:28,desc:"8 x 1 min hard / 1 min walk.",steps:["8 min easy","8 rounds: 1 min hard, 1 min walk","4 min easy"]},
    run_long:{kind:"run",name:"Long run",min:50,desc:"Slow. 50 min. Build the base.",steps:["Start slower than feels right","Hold it. Whole thing easy.","Water after"]},
    snc_engine:{kind:"snc",name:"Engine 1",min:30,desc:"5 rounds: 15 cal ski erg, 10 KB swings, 10 dead ball slams, 20 m sled push.",steps:["Warm up: 3 min bike, 10 light KB swings","5 rounds for time: 15 cal ski erg","10 KB swings (heavy)","10 dead ball slams","20 m sled push","Rest 1 min between rounds if it gets ugly"]},
    snc_push:{kind:"snc",name:"Push day",min:40,desc:"Bench 5x5, OHP 4x8, DB incline 3x10, finish on the assault bike.",steps:["Bench press 5 x 5 (2 min rest)","Overhead press 4 x 8","DB incline 3 x 10","KB front rack carry 3 x 30 m","Assault bike 10 min: 30 s on / 30 s off"]},
    snc_bag:{kind:"snc",name:"Sandbag & sled",min:30,desc:"Sandbag carries and cleans, sled drags, rower calories.",steps:["4 rounds: sandbag over shoulder x 8","Sandbag carry 40 m","Sled drag 40 m","15 cal row","Rest 90 s"]},
    snc_pull:{kind:"snc",name:"Pull & carry",min:35,desc:"DB rows, KB swings, farmers carries, ski erg finisher.",steps:["DB row 4 x 10 each arm","KB swing 4 x 15","Farmers carry 4 x 40 m (heavy)","Dead ball over shoulder 3 x 8","Ski erg 1000 m for time"]},
    snc_engine2:{kind:"snc",name:"Engine 2",min:24,desc:"EMOM 24: bike cals, KB swings, ball slams, rest.",steps:["Every minute for 24 min:","Min 1: 12 cal assault bike","Min 2: 15 KB swings","Min 3: 12 dead ball slams","Min 4: rest. Repeat x 6"]},
    box_skip:{kind:"box",name:"Skip & shadow",min:30,desc:"10 min skipping, 6 x 3 min shadow with a focus each round.",steps:["Skip 10 min (mix in doubles if they are there)","6 x 3 min shadow, 1 min off","Rounds: jab only, 1-2, footwork, head movement, body, free"]},
    box_bag:{kind:"box",name:"Bag rounds",min:35,desc:"8 x 3 min on the heavy bag.",steps:["Skip 5 min","8 x 3 min bag, 1 min rest","Last 2 rounds: 20 s burst every minute"]},
    box_feet:{kind:"box",name:"Footwork",min:25,desc:"Ladder, cones, pivots, then shadow to lock it in.",steps:["Ladder 6 lengths, 3 patterns","Cone square: in-out-pivot 4 x 1 min","4 x 2 min shadow, feet only, no power"]},
    rec_ice:{kind:"rec",name:"Ice bath",min:3,desc:"3 min. Breathe out slow. Hands in.",steps:["In to the neck","Long exhales, count 10 of them","3 min then out, no rush to warm up"]},
    rec_sauna:{kind:"rec",name:"Sauna",min:15,desc:"15 min. Water before and after.",steps:["Drink 500 ml before","15 min, sit, nothing else","Cool shower after"]},
    rec_contrast:{kind:"rec",name:"Hot / cold",min:20,desc:"3 rounds: 4 min hot, 2 min cold. Finish cold.",steps:["Hot 4 min","Cold 2 min","Repeat x 3, finish on cold"]},
    rec_stretch:{kind:"rec",name:"Stretch & mobility",min:10,desc:"Hips, calves, thoracic. 10 min while the kettle boils.",steps:["Couch stretch 1 min each side","Calf wall stretch 1 min each","Thoracic rotations x 10 each","Pigeon 1 min each side"]},
    rec_walk:{kind:"rec",name:"Walk",min:30,desc:"30 min, phone in pocket.",steps:["Out the door","No podcast for the first 10 min","Back"]}
  };
  var DEFAULT_PLAN={
    week:{1:["box_skip","fc"],2:["run_easy","fc"],3:["snc_engine","fc"],4:["run_tempo","rec_ice"],5:["snc_push","rec_sauna"],6:["box_bag","run_long"],0:["rec_contrast","rec_walk"]},
    meals:["Breakfast","Snack 1","Lunch","Snack 2","Dinner"],
    waterGoal:10, sleepTarget:7.5, bedTarget:"21:45"
  };
  var FC_DAYS={1:"Fight Club Monday",2:"Fight Club Tuesday",3:"Fight Club Wednesday"};

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
  function D(){return get(L.day);}
  function plan(){var p=get("plan");if(!p.week)p.week=JSON.parse(JSON.stringify(DEFAULT_PLAN.week));if(!p.meals)p.meals=DEFAULT_PLAN.meals.slice();if(!p.waterGoal)p.waterGoal=DEFAULT_PLAN.waterGoal;if(!p.sleepTarget)p.sleepTarget=DEFAULT_PLAN.sleepTarget;if(!p.bedTarget)p.bedTarget=DEFAULT_PLAN.bedTarget;return p;}
  function save(key){L.dirty[key]=true;clearTimeout(L.saveT[key]);L.saveT[key]=setTimeout(function(){flush(key);},500);pill("Saving…");}
  function flush(key){
    if(!allowed())return;
    sb.from("life_entries").upsert({user_id:uid(),key:key,data:L.rows[key]||{},updated_at:new Date().toISOString()},{onConflict:"user_id,key"}).then(function(r){
      if(r&&r.error){T("Didn’t save: "+r.error.message);pill("Not saved");return;}delete L.dirty[key];pill("Saved ✓");});
  }
  function pill(t){var p=document.getElementById("lfSave");if(!p)return;p.textContent=t;p.classList.add("show");clearTimeout(p._h);p._h=setTimeout(function(){p.classList.remove("show");},1200);}
  window.addEventListener("beforeunload",function(){Object.keys(L.dirty).forEach(flush);});

  /* ---------- the day's jobs ---------- */
  function mN(m){return typeof m==='string'?m:(m&&m.n)||'';}
  function mD(m){return (m&&typeof m==='object'&&m.d)||'';}
  function mK(m){return (m&&typeof m==='object'&&m.kcal)||0;}
  function sessionsFor(day){var p=plan();var ids=(p.week&&p.week[dow(day)])||[];var d=get(day);return ids.concat(d.extra||[]);}
  function sessDone(d,id,idx){return !!(d.sess&&d.sess[id+"#"+idx]);}
  function score(day){
    var d=get(day),p=plan(),s=0;
    s+=Math.min(2,((d.water||0)/p.waterGoal)*2);
    var m=p.meals.length,md=0;p.meals.forEach(function(_,i){if(d.meals&&d.meals[i])md++;});s+=m?(md/m)*2:0;
    var ids=sessionsFor(day),done=0;ids.forEach(function(id,i){if(sessDone(d,id,i))done++;});s+=ids.length?(done/ids.length)*3:0;
    if(d.sleep&&d.sleep>=p.sleepTarget)s+=1;else if(d.sleep)s+=0.5;
    if(d.rec&&d.rec.length)s+=1;
    var t3=d.top3||[];if(t3.length&&t3.every(function(x){return x.done;}))s+=1;else if(t3.some(function(x){return x.done;}))s+=0.5;
    return Math.round(s*10)/10;
  }
  function streak(){var n=0,day=today();if(score(day)<5)day=addDays(day,-1);while(score(day)>=5&&n<400){n++;day=addDays(day,-1);}return n;}
  function xmasWeek(){var ms=Date.parse(L.day+"T12:00:00")-Date.parse(XMAS_START+"T12:00:00");var w=Math.floor(ms/(7*864e5))+1;return w<1?0:w>10?11:w;}

  /* ---------- setters ---------- */
  window.lfW=function(n){var d=D();d.water=Math.max(0,(d.water||0)+n);save(L.day);paint();};
  window.lfMeal=function(i){var d=D();d.meals=d.meals||{};d.meals[i]=!d.meals[i];save(L.day);paint();};
  window.lfSleep=function(h){var d=D();d.sleep=(d.sleep===h?null:h);save(L.day);paint();};
  window.lfWeight=function(v){var d=D();d.weight=v;save(L.day);};
  window.lfRec=function(k){var d=D();d.rec=d.rec||[];var i=d.rec.indexOf(k);if(i>=0)d.rec.splice(i,1);else d.rec.push(k);save(L.day);paint();};
  window.lfSess=function(id,idx){var d=D();d.sess=d.sess||{};var k=id+"#"+idx;d.sess[k]=!d.sess[k];if(d.sess[k]&&L.timer&&L.timer.key===k)stopTimer();save(L.day);paint();};
  window.lfAddSess=function(sel){var id=sel.value;if(!id)return;var d=D();d.extra=(d.extra||[]).concat([id]);save(L.day);paint();};
  window.lfOpen=function(k){L.open[k]=!L.open[k];paint();};
  window.lfShut=function(k){L.open[k]=false;paint();};
  window.lfTop=function(){var inp=document.getElementById("lfTopIn");var t=(inp&&inp.value.trim())||"";if(!t)return;var d=D();d.top3=d.top3||[];if(d.top3.length>=3){T("Three is the limit. Finish one first.");return;}d.top3.push({t:t,done:false});save(L.day);paint();};
  window.lfTopTick=function(i){var d=D();if(d.top3&&d.top3[i]){d.top3[i].done=!d.top3[i].done;save(L.day);paint();}};
  window.lfTopDel=function(i){var d=D();if(d.top3){d.top3.splice(i,1);save(L.day);paint();}};
  window.lfDump=function(){var inp=document.getElementById("lfDumpIn");var t=(inp&&inp.value.trim())||"";if(!t)return;var u=get("dump");u.items=u.items||[];u.items.unshift({t:t,at:Date.now()});save("dump");paint();setTimeout(function(){var i=document.getElementById("lfDumpIn");if(i)i.focus();},30);};
  window.lfDumpDel=function(i){var u=get("dump");if(u.items){u.items.splice(i,1);save("dump");paint();}};
  window.lfDumpTop=function(i){var u=get("dump");var it=u.items&&u.items[i];if(!it)return;var d=D();d.top3=d.top3||[];if(d.top3.length>=3){T("Top 3 is full.");return;}d.top3.push({t:it.t,done:false});u.items.splice(i,1);save("dump");save(L.day);paint();};
  window.lfTomorrow=function(v){var d=D();d.tomorrow=v;save(L.day);};
  window.lfNote=function(v){var d=D();d.note=v;save(L.day);};
  window.lfClose=function(){var d=D();d.closed=!d.closed;save(L.day);paint();if(d.closed)T("Day closed. "+score(L.day)+"/10. Bed by "+plan().bedTarget+".");};
  window.lfScreen=function(s){L.screen=s;paint();try{window.scrollTo(0,0);}catch(e){}};
  window.lfDay=function(n){L.day=n===0?today():addDays(L.day,n);L.screen="now";L.open={};paint();};
  window.lfGoto=function(day){L.day=day;L.screen="now";L.open={};paint();try{window.scrollTo(0,0);}catch(e){}};
  /* plan editing */
  window.lfPlanAdd=function(dw,sel){var id=sel.value;if(!id)return;var p=plan();p.week[dw]=(p.week[dw]||[]).concat([id]);save("plan");paint();};
  window.lfPlanDel=function(dw,i){var p=plan();(p.week[dw]||[]).splice(i,1);save("plan");paint();};
  window.lfPlanSet=function(k,v){var p=plan();p[k]=(k==="waterGoal"||k==="sleepTarget")?(parseFloat(v)||DEFAULT_PLAN[k]):v;save("plan");};
  window.lfMealName=function(i,v){var p=plan();if(typeof p.meals[i]==='object'&&p.meals[i])p.meals[i].n=v;else p.meals[i]=v;save("plan");};
  window.lfMealAdd=function(){var p=plan();p.meals.push("Meal "+(p.meals.length+1));save("plan");paint();};
  window.lfMealDel=function(i){var p=plan();p.meals.splice(i,1);save("plan");paint();};

  /* ---------- timer ---------- */
  function stopTimer(){if(L.timer){clearInterval(L.timer.iv);L.timer=null;}}
  window.lfTimer=function(key,min){
    if(L.timer&&L.timer.key===key){stopTimer();paint();return;}
    stopTimer();
    L.timer={key:key,end:Date.now()+min*60000,iv:setInterval(function(){
      if(!L.timer)return;var el=document.getElementById("lfT-"+key.replace("#","-"));if(!el)return;
      var left=L.timer.end-Date.now();
      if(left<=0){el.textContent="00:00";stopTimer();T("Time. Tap Done.");try{if(navigator.vibrate)navigator.vibrate([200,100,200]);}catch(e){}return;}
      var s=Math.ceil(left/1000);el.textContent=pad2(Math.floor(s/60))+":"+pad2(s%60);},250)};
    L.open[key]=true;paint();
  };

  /* ---------- pieces ---------- */
  function tick(on){return '<div class="tick '+(on?"on":"")+'">'+(on?"✓":"")+"</div>";}
  function ring(v,max){var pct=Math.max(0,Math.min(1,v/max));var r=27,c=2*Math.PI*r;var col=pct>=.8?"#4bc97a":pct>=.5?"#c9a44c":"#e05252";
    return '<div class="lf-ring"><svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="'+r+'" stroke="#1d1d21" stroke-width="6" fill="none"/><circle cx="32" cy="32" r="'+r+'" stroke="'+col+'" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="'+c+'" stroke-dashoffset="'+(c*(1-pct))+'"/></svg><b>'+v+'<small>/10</small></b></div>';}
  function jobDone(k,title,sub,onclick){return '<div class="job done"><div><div class="jk">'+k+'</div><div class="jt">'+title+'</div>'+(sub?'<div class="jd">'+sub+'</div>':'')+'</div><div onclick="'+onclick+'">'+tick(true)+'</div></div>';}

  function jobSleep(d,p,next){
    if(d.sleep&&!L.open.sleep)return jobDone("Sleep","Slept "+d.sleep+"h"+(d.sleep>=p.sleepTarget?" · target hit":" · under "+p.sleepTarget+"h"),null,"lfOpen('sleep')");
    var hs=[5,5.5,6,6.5,7,7.5,8,8.5,9];
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Sleep <small>target '+p.sleepTarget+'h</small></div><div class="jt">How long did you sleep?</div><div class="chips">'+hs.map(function(h){return '<div class="chip '+(d.sleep===h?"on":"")+'" onclick="lfSleep('+h+')">'+h+'</div>';}).join("")+'</div></div>';
  }
  function jobWeigh(d,next){
    if(d.weight&&!L.open.weigh){var ws=0,wn=0;for(var i=0;i<7;i++){var x=parseFloat((get(addDays(L.day,-i))||{}).weight);if(x){ws+=x;wn++;}}return jobDone("Weigh in",d.weight+" kg",wn>1?"7-day average "+(ws/wn).toFixed(1)+" kg. That’s the number that matters.":null,"lfOpen('weigh')");}
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Weigh in <small>same time, after the loo</small></div><div class="row2"><input class="num" type="number" step="0.1" inputmode="decimal" placeholder="kg" value="'+E(d.weight||"")+'" oninput="lfWeight(this.value)"><button class="big" style="margin:0" onclick="lfShut(\'weigh\')">Done</button></div></div>';
  }
  function jobWater(d,p,next){
    var w=d.water||0,left=p.waterGoal-w;var cups='';for(var i=0;i<p.waterGoal;i++)cups+='<i class="'+(i<w?"on":"")+'"></i>';
    var ph=phase(),pace=ph==="morning"?Math.round(p.waterGoal*.25):ph==="day"?Math.round(p.waterGoal*.6):p.waterGoal;
    var msg=w>=p.waterGoal?"Goal hit. Keep sipping.":w<pace?(pace-w)+" behind where you should be by now.":"On pace. "+left+" to go.";
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Water <small>'+(w*0.25).toFixed(2).replace(/\.?0+$/,"")+' / '+(p.waterGoal*0.25)+' L</small></div><div class="jt">'+(w>=p.waterGoal?"Water done":"Tap + every glass")+'</div><div class="jd">'+msg+'</div><div class="water"><button class="minus" onclick="lfW(-1)">−</button><div class="cups" style="grid-template-columns:repeat('+p.waterGoal+',1fr)">'+cups+'</div><button onclick="lfW(1)">+</button></div></div>';
  }
  function jobMeals(d,p,next){
    var done=0;p.meals.forEach(function(_,i){if(d.meals&&d.meals[i])done++;});
    if(done===p.meals.length&&p.meals.length&&!L.open.meals)return jobDone("Food","All "+p.meals.length+" meals on plan",null,"lfOpen('meals')");
    var nextIdx=-1;for(var i=0;i<p.meals.length;i++){if(!(d.meals&&d.meals[i])){nextIdx=i;break;}}
    var kt=0,ke=0;p.meals.forEach(function(m,i){kt+=mK(m);if(d.meals&&d.meals[i])ke+=mK(m);});
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Food <small>'+done+' of '+p.meals.length+'</small></div><div class="jt">'+(nextIdx>=0?"Next: "+E(mN(p.meals[nextIdx])):"Meals")+'</div><div class="jd">Tap it when it’s eaten and on plan. Off plan, leave it.</div><div class="meals">'+p.meals.map(function(m,i){var on=!!(d.meals&&d.meals[i]);return '<div class="meal '+(on?"on":"")+'" onclick="lfMeal('+i+')">'+tick(on)+'<span>'+E(mN(m))+(mD(m)?'<small style="display:block;font-weight:500;line-height:1.35;margin-top:2px">'+E(mD(m))+'</small>':'')+'</span>'+(mK(m)?'<small>'+mK(m)+' kcal</small>':(i===nextIdx?'<small>up next</small>':''))+'</div>';}).join("")+'</div>'+(kt?'<div class="jd" style="margin-top:8px">Plan <b>'+kt+' kcal</b> · eaten so far <b>'+ke+'</b></div>':'')+'</div>';
  }
  function sessRow(id,idx,d){
    var k=id+"#"+idx,done=sessDone(d,id,idx);
    if(id==="fc"){var dw=dow(L.day);return '<div class="sess '+(done?"on":"")+'"><div class="st"><b><span class="tag fc">FC</span>'+E(FC_DAYS[dw]||"Fight Club")+'</b><small>6:45 pm · fitness &amp; skills 6 pm. Coaching counts as boxing today.</small></div>'+(typeof window.fcxEnter==="function"&&!done?'<button class="go" onclick="fcxEnter()">Open</button>':'')+'<div onclick="lfSess(\'fc\','+idx+')">'+tick(done)+'</div></div>';}
    var s=LIB[id];if(!s)return "";
    var open=!!L.open[k],timing=!!(L.timer&&L.timer.key===k);
    var h='<div class="sess '+(done?"on":"")+'"><div class="st" onclick="lfOpen(\''+k+'\')"><b><span class="tag '+s.kind+'">'+s.kind+'</span>'+E(s.name)+'</b><small>'+E(s.desc)+'</small></div>'+(done?'':'<button class="go" onclick="lfTimer(\''+k+'\','+s.min+')">'+(timing?"Stop":s.min+" min")+'</button>')+'<div onclick="lfSess(\''+id+'\','+idx+')">'+tick(done)+'</div></div>';
    if((open||timing)&&!done){h+='<div class="job" style="margin-top:-2px;border-top-left-radius:0;border-top-right-radius:0">'+(timing?'<div class="timer"><b id="lfT-'+k.replace("#","-")+'">'+pad2(s.min)+':00</b><small>'+E(s.name)+' · Stop pauses it</small></div>':'')+'<div class="steps">'+s.steps.map(function(st,i){return '<div><b>'+(i+1)+'</b>'+E(st)+'</div>';}).join("")+'</div><button class="big ok" onclick="lfSess(\''+id+'\','+idx+')">Done ✓</button></div>';}
    return h;
  }
  function jobTrain(d,next){
    var all=sessionsFor(L.day);var list=[];all.forEach(function(id,i){if(id==="fc"||(LIB[id]&&LIB[id].kind!=="rec"))list.push([id,i]);});
    var done=list.filter(function(x){return sessDone(d,x[0],x[1]);}).length;
    var opts='<option value="">+ add a session today</option>'+Object.keys(LIB).filter(function(k){return LIB[k].kind!=="rec";}).map(function(k){return '<option value="'+k+'">'+E(LIB[k].kind.toUpperCase()+" · "+LIB[k].name+" · "+LIB[k].min+" min")+'</option>';}).join("");
    var title=list.length?(done===list.length?"Training done":done+" of "+list.length+" done"):"Rest day";
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Train <small>'+fmtDay(L.day).split(" ")[0]+' plan</small></div><div class="jt">'+title+'</div>'+list.map(function(x){return sessRow(x[0],x[1],d);}).join("")+'<select class="sel" style="margin-top:8px" onchange="lfAddSess(this)">'+opts+'</select></div>';
  }
  function jobRecover(d,next){
    var all=sessionsFor(L.day);var list=[];all.forEach(function(id,i){if(LIB[id]&&LIB[id].kind==="rec")list.push([id,i]);});
    var picks=[["ice","Ice bath","ice"],["sauna","Sauna","hot"],["contrast","Hot / cold","hot"],["stretch","Stretch",""],["walk","Walk",""],["early","Early night",""]];
    var done=(d.rec||[]).length;
    if(done&&!L.open.rec&&!list.length)return jobDone("Recover",(d.rec||[]).map(function(k){var p=picks.filter(function(x){return x[0]===k;})[0];return p?p[1]:k;}).join(" · "),null,"lfOpen('rec')");
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Recover <small>you own the gear, use it</small></div><div class="jt">'+(done?done+" done":"What did you do for the body?")+'</div>'+list.map(function(x){return sessRow(x[0],x[1],d);}).join("")+'<div class="chips">'+picks.map(function(p){var on=(d.rec||[]).indexOf(p[0])>=0;return '<div class="chip '+p[2]+' '+(on?"on":"")+'" onclick="lfRec(\''+p[0]+'\')">'+p[1]+'</div>';}).join("")+'</div></div>';
  }
  function jobWork(d,next){
    var t3=d.top3||[],dump=(get("dump").items||[]);
    var fcToday=FC_DAYS[dow(L.day)];
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Work <small>'+(fcToday?fcToday+" tonight":"no Fight Club tonight")+'</small></div><div class="jt">Top 3 today</div><div class="jd">Three, not thirty. Three done = the day’s a win.</div><div class="list">'+
      (t3.length?t3.map(function(x,i){return '<div class="item '+(x.done?"on":"")+'"><div onclick="lfTopTick('+i+')">'+tick(x.done)+'</div><span>'+E(x.t)+'</span><button class="x" onclick="lfTopDel('+i+')">✕</button></div>';}).join(""):'<div style="font-size:12px;color:var(--mu)">Nothing picked yet.</div>')+'</div>'+
      (t3.length<3?'<div class="addrow"><input id="lfTopIn" placeholder="Add one" onkeydown="if(event.key===\'Enter\')lfTop()"><button onclick="lfTop()">+</button></div>':'')+
      '<div class="jk" style="margin-top:14px">Brain dump <small>'+dump.length+' parked</small></div><div class="jd">Anything in your head goes here so it stops rattling. ↑ makes it a Top 3, ✕ bins it.</div>'+
      '<div class="addrow"><input id="lfDumpIn" placeholder="Get it out of your head" onkeydown="if(event.key===\'Enter\')lfDump()"><button onclick="lfDump()">+</button></div>'+
      (dump.length?'<div class="list">'+dump.slice(0,12).map(function(x,i){return '<div class="item"><span>'+E(x.t)+'</span><button class="x" onclick="lfDumpTop('+i+')" style="color:var(--g);font-size:15px;font-weight:900">↑</button><button class="x" onclick="lfDumpDel('+i+')">✕</button></div>';}).join("")+(dump.length>12?'<div style="font-size:11px;color:var(--mu);padding-top:6px">+ '+(dump.length-12)+' more</div>':'')+'</div>':'')+'</div>';
  }
  function jobClose(d,p,next){
    if(d.closed&&!L.open.close)return jobDone("Close the day","Closed · "+score(L.day)+"/10","Tomorrow: "+E(d.tomorrow||"nothing set"),"lfOpen('close')");
    return '<div class="job '+(next?"next":"")+'"><div class="jk">Close the day <small>bed by '+E(p.bedTarget)+'</small></div><div class="jt">One thing for tomorrow</div><div class="jd">Write it now so tomorrow morning doesn’t have to think.</div><input class="num" style="margin-top:8px" placeholder="Tomorrow’s one thing" value="'+E(d.tomorrow||"")+'" oninput="lfTomorrow(this.value)"><textarea class="note" placeholder="How was today, one line" oninput="lfNote(this.value)">'+E(d.note||"")+'</textarea><button class="big ok" onclick="lfClose()">Close the day · '+score(L.day)+'/10</button></div>';
  }

  function nowHtml(){
    var d=D(),p=plan(),ph=phase(),isToday=L.day===today();
    var J={sleep:[function(n){return jobSleep(d,p,n);},!d.sleep],weigh:[function(n){return jobWeigh(d,n);},!d.weight],water:[function(n){return jobWater(d,p,n);},(d.water||0)<p.waterGoal],meals:[function(n){return jobMeals(d,p,n);},true],train:[function(n){return jobTrain(d,n);},true],work:[function(n){return jobWork(d,n);},true],rec:[function(n){return jobRecover(d,n);},true],close:[function(n){return jobClose(d,p,n);},!d.closed]};
    var order=ph==="morning"?["sleep","weigh","water","train","meals","work","rec","close"]:ph==="day"?["water","meals","train","work","sleep","weigh","rec","close"]:["train","rec","meals","water","work","close","sleep","weigh"];
    if(!isToday)order=["sleep","weigh","water","meals","train","rec","work","close"];
    var nextSet=false;
    var html=order.map(function(k){var j=J[k];var isNext=false;if(isToday&&!nextSet&&j[1]){isNext=true;nextSet=true;}return j[0](isNext);}).join("");
    var y=get(addDays(L.day,-1));
    var carry=y.tomorrow?'<div class="job" style="border-color:var(--gd);background:linear-gradient(135deg,rgba(201,164,76,.12),var(--p) 60%)"><div class="jk">You told yourself last night</div><div class="jt">'+E(y.tomorrow)+'</div></div>':"";
    var prompt={morning:"Morning. Sleep, weigh, water, then look at the plan.",day:"Midday. Water and food first, then train.",evening:(FC_DAYS[dow(L.day)]?FC_DAYS[dow(L.day)]+" tonight. ":"")+"Recover, then close the day."}[ph];
    return (isToday?'<div class="jd" style="margin:-4px 0 10px;font-size:12.5px"><b>'+prompt+'</b></div>':'')+carry+html;
  }

  function weekHtml(){
    var days=[];for(var i=6;i>=0;i--)days.push(addDays(today(),-i));
    var tot={sess:0,rec:0,water:0,sleep:0,sl:0,w:0,wn:0};
    days.forEach(function(day){var d=get(day);sessionsFor(day).forEach(function(id,i){if(sessDone(d,id,i)){if(LIB[id]&&LIB[id].kind==="rec")tot.rec++;else tot.sess++;}});tot.rec+=(d.rec||[]).length;tot.water+=(d.water||0);if(d.sleep){tot.sleep+=d.sleep;tot.sl++;}var wkg=parseFloat(d.weight);if(wkg){tot.w+=wkg;tot.wn++;}});
    var wk=days.map(function(day){var s=score(day);var lab=new Date(day+"T12:00:00").toLocaleDateString("en-AU",{weekday:"narrow"});return '<div class="'+(day===today()?"today":"")+'" onclick="lfGoto(\''+day+'\')"><span>'+lab+'</span><b>'+(s||"–")+'</b><i class="'+(s>=8?"s3":s>=5?"s2":s>0?"s1":"")+'"></i></div>';}).join("");
    var xw='';for(var w=1;w<=10;w++){var start=addDays(XMAS_START,(w-1)*7),sum=0,n=0;for(var j=0;j<7;j++){var dd=addDays(start,j);if(dd>today())break;sum+=score(dd);n++;}var avg=n?sum/n:0;xw+='<div><i class="'+(xmasWeek()===w?"cur ":"")+(n?(avg>=8?"s3":avg>=5?"s2":"s1"):"")+'"></i>'+w+'</div>';}
    var xwk=xmasWeek();
    return '<div class="job"><div class="jk">This week <small>score per day, tap one to open it</small></div><div class="wk">'+wk+'</div></div>'+
      '<div class="lf-strip">'+(tot.wn?'<div><b>'+(tot.w/tot.wn).toFixed(1)+'</b><span>avg kg (7d)</span></div>':'')+'<div><b>'+tot.sess+'</b><span>sessions</span></div><div><b>'+tot.rec+'</b><span>recovery</span></div><div><b>'+(tot.water*0.25).toFixed(1)+'L</b><span>water (7d)</span></div><div><b>'+(tot.sl?(tot.sleep/tot.sl).toFixed(1)+"h":"–")+'</b><span>avg sleep</span></div><div><b>'+streak()+'</b><span>day streak</span></div></div>'+
      '<div class="job"><div class="jk">Road to Xmas <small>'+(xwk<1?"starts 12 Oct":xwk>10?"done":"week "+xwk+" of 10")+'</small></div><div class="jt">10 weeks to 19 Dec</div><div class="jd">Same 10 weeks as the Fight Club camp and the Fuel Plan. Green week = averaged 8+/10.</div><div class="xw">'+xw+'</div></div>'+
      '<div class="job"><div class="jk">How the score works</div><div class="jd">Water goal <b>2</b> · meals on plan <b>2</b> · planned training done <b>3</b> · sleep at target <b>1</b> · any recovery <b>1</b> · Top 3 cleared <b>1</b>. 5+ keeps the streak alive. 8+ is a green day.</div></div>';
  }

  function planHtml(){
    var p=plan();var names=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var opts='<option value="">+ add</option><option value="fc">FC · Fight Club night</option>'+Object.keys(LIB).map(function(k){return '<option value="'+k+'">'+E(LIB[k].kind.toUpperCase()+" · "+LIB[k].name)+'</option>';}).join("");
    var rows=[1,2,3,4,5,6,0].map(function(dw){var ids=p.week[dw]||[];return '<div class="pl"><b>'+names[dw]+'</b><div class="pls">'+ids.map(function(id,i){var nm=id==="fc"?"Fight Club":(LIB[id]?LIB[id].name:id);return '<span>'+E(nm)+'<i onclick="lfPlanDel('+dw+','+i+')">✕</i></span>';}).join("")+'<select class="sel" style="width:auto;padding:5px 8px;font-size:11px;border-radius:999px" onchange="lfPlanAdd('+dw+',this)">'+opts+'</select></div></div>';}).join("");
    return '<div class="job"><div class="jk">Weekly plan <small>what shows up each day</small></div><div class="jd">Fight Club is Mon, Tue, Wed. Everything else is a suggestion you can swap. Tap ✕ to drop one, use the menu to add.</div><div class="list">'+rows+'</div></div>'+
      '<div class="job"><div class="jk">Meals <small>your plan, your names</small></div><div class="jd">When Ali hands over the 10-week plan, name the meals here and they become the daily tick list.</div><div class="list">'+p.meals.map(function(m,i){return '<div class="item" style="flex-direction:column;align-items:stretch;gap:3px"><div style="display:flex;gap:8px;align-items:center"><input class="num" style="padding:8px 10px;font-size:14px" value="'+E(mN(m))+'" oninput="lfMealName('+i+',this.value)"><button class="x" onclick="lfMealDel('+i+')">✕</button></div>'+(mD(m)?'<div class="jd" style="margin:0">'+E(mD(m))+(mK(m)?' · <b>'+mK(m)+' kcal</b>':'')+'</div>':'')+'</div>';}).join("")+'</div><button class="big ghost" onclick="lfMealAdd()">+ Add a meal</button></div>'+
      '<div class="job"><div class="jk">Targets</div><div class="row2"><div><div class="jd">Water (250 ml glasses)</div><input class="num" type="number" value="'+p.waterGoal+'" oninput="lfPlanSet(\'waterGoal\',this.value)"></div><div><div class="jd">Sleep target (hours)</div><input class="num" type="number" step="0.5" value="'+p.sleepTarget+'" oninput="lfPlanSet(\'sleepTarget\',this.value)"></div></div><div class="jd" style="margin-top:8px">Bed by</div><input class="num" type="time" value="'+E(p.bedTarget)+'" oninput="lfPlanSet(\'bedTarget\',this.value)"></div>'+
      '<div class="job"><div class="jk">Session library</div><div class="jd">Built on your kit: bench, overhead, dumbbells, kettlebells, sled, sandbag, dead ball, ski erg, assault bike, rower. Boxing is skipping, shadow, bag and feet. Recovery is ice, sauna, hot/cold, stretch, walk. Tell me what to add or change and I’ll update it.</div></div>';
  }

  function paint(){
    var main=document.getElementById("main");if(!main)return;
    if(!allowed()){go("home");return;}
    if(!L.loaded||L.for!==uid()){main.innerHTML='<div class="lf"><button class="lf-back" onclick="go(\'home\')">‹ Home</button><div class="job"><p>Loading your day…</p></div></div>';load().then(function(){if(view==="life")paint();});return;}
    if(!L.day)L.day=today();
    var isToday=L.day===today(),sc=score(L.day),st=streak();
    var y0=window.scrollY||0;
    main.innerHTML='<div class="lf"><div class="lf-top"><div><button class="lf-back" onclick="go(\'home\')">‹ Home</button><div class="lf-title">Jake’s Life</div><div class="lf-sub">'+(isToday?"Today · ":"")+fmtDay(L.day)+(st?' · '+st+' day streak':'')+'</div></div>'+ring(sc,10)+'</div>'+
      '<div class="lf-nav"><button class="'+(L.screen==="now"?"on":"")+'" onclick="lfScreen(\'now\')">Now</button><button class="'+(L.screen==="week"?"on":"")+'" onclick="lfScreen(\'week\')">Week</button><button class="'+(L.screen==="plan"?"on":"")+'" onclick="lfScreen(\'plan\')">Plan</button></div>'+
      (L.screen==="now"?'<div class="lf-nav" style="grid-template-columns:44px 1fr 44px;margin-top:-6px"><button onclick="lfDay(-1)">‹</button><button onclick="lfDay(0)" style="letter-spacing:1px">'+(isToday?"Today":"Back to today")+'</button><button onclick="lfDay(1)">›</button></div>':'')+
      (L.screen==="now"?nowHtml():L.screen==="week"?weekHtml():planHtml())+
      '<div class="save" id="lfSave"></div></div>';
    try{window.scrollTo(0,y0);}catch(e){}
  }

  /* ---------- home tile ---------- */
  function tileText(){
    if(!L.loaded)return ["Only you · Demo","Nutrition · Running · Boxing · S&amp;C · Recovery · Work. One screen, one next thing."];
    var d=get(today()),p=plan(),sc=score(today()),ph=phase(),st=streak();
    var next=ph==="morning"&&!d.sleep?"log your sleep":(d.water||0)<p.waterGoal?(p.waterGoal-(d.water||0))+" glasses of water to go":ph==="evening"&&!d.closed?"close the day":"tick the next meal";
    return ["Today "+sc+"/10"+(st?" · "+st+" day streak":""),"Next: "+next+". "+(FC_DAYS[dow(today())]?FC_DAYS[dow(today())]+" tonight.":"")];
  }
  function injectTile(){
    var main=document.getElementById("main");if(!main||view!=="home"||!allowed())return;
    var t=tileText();var ex=document.getElementById("lifeCard");
    if(ex){ex.querySelector(".hcKicker").innerHTML=t[0];ex.querySelector(".hcSub").innerHTML=t[1];return;}
    var wrap=document.createElement("div");
    wrap.innerHTML='<button class="homeCard lifeCard" id="lifeCard" style="background:linear-gradient(135deg,rgba(201,164,76,.18),rgba(8,8,10,.96) 55%),#0a0b0e;border-color:var(--gold-dim)" onclick="lifeEnter()"><div class="hcKicker">'+t[0]+'</div><div class="hcTitle">Jake’s Life</div><div class="hcSub">'+t[1]+'</div></button>';
    var card=wrap.firstChild;var first=main.querySelector(".homeCard");
    if(first)first.insertAdjacentElement("beforebegin",card);else main.appendChild(card);
  }
  window.lifeEnter=function(){if(!allowed())return;L.screen="now";L.day=today();L.open={};go("life");};

  /* ---------- hooks ---------- */
  try{NAV_TAB.life="home";}catch(e){}
  var _render=window.render;
  window.render=function(){if(view==="life")return paint();return _render.apply(this,arguments);};
  var _go=window.go;window.go=function(v){if(view==="life"&&v!=="life")stopTimer();return _go.apply(this,arguments);};
  ["renderHome"].forEach(function(fn){
    if(typeof window[fn]!=="function")return;var o=window[fn];
    window[fn]=function(){var r=o.apply(this,arguments);var after=function(){injectTile();if(allowed()&&(!L.loaded||L.for!==uid()))load().then(injectTile);};if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,30);return r;};
  });
  setTimeout(function(){if(view==="home"&&allowed()){load().then(injectTile);}},900);
  setInterval(function(){try{if(view==="home"&&allowed()&&!document.getElementById("lifeCard"))injectTile();}catch(e){}},1200);
})();
