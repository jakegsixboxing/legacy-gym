/*__FCREC__ ============================================================
   Fight Club · RECOVERY tab (inside the camp view, next to Today / Week /
   Progress / Board) · 12 Oct 2026. Kincumber Recovery look: blue, white, black.
   LOG: the three modalities (infrared sauna, ice bath, hot water therapy),
        quick log, this camp's sessions.
   BUILD YOUR OWN: minutes in sauna / ice / hot, rest between, finish hot or
        cold, run it on a timer or log it straight away.
   PROTOCOLS (custom recovery): Post sparring · Post run / sprints · Weekly
        wrap-up, built from the research (see WHY text), each runs on the timer.
   Data: public.fc_recovery (own rows via fc_my_fighter_id, staff all).
   Hooks: fccamp.js calls window.fcRecHtml(w) for the body and
   window.fcRecAfter() after paint; uses window.fccFighter / fccPv / fccRepaint.
   ==================================================================== */
(function(){
"use strict";
var CAMP="fc2026";
var BLUE="#4FB8DC",DIM="#2a7c9c";
var R={sub:"log",rows:null,loadedFor:null,loading:false,run:null,tick:null,build:{sauna:20,ice:5,hot:10,rest:2,finish:"cold"},quick:{sauna:0,ice:0,hot:0}};
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
function num(id,lo,hi){var v=parseFloat((document.getElementById(id)||{}).value);if(isNaN(v))return 0;return Math.max(lo,Math.min(hi,v));}

/* ---------- the three modalities ---------- */
var MODS={
 sauna:{n:"Infrared sauna",k:"Heat",c:"#ff9f6e",dose:"20 min · 45 to 60°C",
  what:"Dry radiant heat that warms the muscle, not just the air. Twenty minutes after a hard session kept jump power up and soreness down the next day in trained athletes, and did not disturb overnight heart-rate recovery.",
  when:"After boxing nights and on the weekly wrap-up. Fine after Strength & Con. Hydrate before and after."},
 ice:{n:"Ice bath",k:"Cold",c:BLUE,dose:"10 to 15 min total · 11 to 15°C",
  what:"The best-supported recovery tool there is for soreness. The research dose is 10 to 15 minutes somewhere between 11 and 15 degrees. Colder than that works too, it just hurts more and people stop doing it. New to it? Split it: 5 in, 2 out, 5 in.",
  when:"Straight after sparring and after sprints or runs. Leave it 4 hours after Strength & Con, cold straight after lifting blunts the strength gains you just trained for."},
 hot:{n:"Hot water therapy",k:"Hot",c:"#ffd36e",dose:"10 to 15 min · 38 to 40°C",
  what:"Loosens tight muscle, opens the blood vessels and slows the nervous system down. On its own it is a wind-down tool. Paired with cold it becomes contrast therapy, the circulation pump.",
  when:"Before the cold in a contrast session, or last thing in the weekly wrap-up so you sleep. Skip it on fresh bruising from sparring."}};

/* ---------- protocols (custom recovery) ---------- */
/* step: {m:"sauna"|"ice"|"hot"|"rest", min:n} */
var PROTOS=[
 {id:"spar",n:"Post sparring",when:"Mon and Wed, within the hour after rounds",tag:"Cold only",
  steps:[{m:"ice",min:5},{m:"rest",min:2},{m:"ice",min:5}],
  why:"Sparring leaves you with sore muscle and contact bruising. Cold is the tool for both: 10 minutes at 11 to 15 degrees is the dose the research ranks best for next-day soreness, split into two 5s so you can actually do it. No heat tonight. Heat pushes blood into bruised tissue and makes the bruising worse. Shower warm, eat, sleep."},
 {id:"run",n:"Post run and sprints",when:"After the 3 km Mon and Wed, and after Friday sprints. Not after Strength & Con",tag:"Contrast · finish cold",
  steps:[{m:"hot",min:4},{m:"ice",min:2},{m:"hot",min:4},{m:"ice",min:2},{m:"hot",min:4},{m:"ice",min:3}],
  why:"Legs, not bruises, so you can use heat. Hot opens the vessels, cold clamps them, three rounds flushes the legs and the final cold hit keeps the soreness down. Seven minutes of cold total sits inside the research dose. Always finish on cold. If you lifted today, skip the cold until 4 hours after the lift, heat only."},
 {id:"week",n:"Weekly wrap-up",when:"Saturday or Sunday, the end of the training week",tag:"Full reset · finish hot",
  steps:[{m:"sauna",min:20},{m:"rest",min:3},{m:"ice",min:3},{m:"rest",min:1},{m:"hot",min:10}],
  why:"The week's damage is already done, so this one is about the nervous system and sleep. Twenty minutes of infrared sauna is the protocol that improved next-day power and soreness in trained athletes. Three minutes of cold for the mood lift and the mental reps. Then ten minutes hot to finish warm, which is what sets up a deep sleep. Finishing hot, not cold, is deliberate on a rest day."}];
var MN={sauna:"Infrared sauna",ice:"Ice bath",hot:"Hot bath",rest:"Out · rest"};
var MC={sauna:"#ff9f6e",ice:BLUE,hot:"#ffd36e",rest:"#8fa3ad"};
function stepsOf(p){return p.steps;}
function total(steps){return steps.reduce(function(a,s){return a+s.min;},0);}
function sum(steps,m){return steps.filter(function(s){return s.m===m;}).reduce(function(a,s){return a+s.min;},0);}
function buildSteps(){var b=R.build,st=[],seq=b.finish==="hot"?["sauna","ice","hot"]:["sauna","hot","ice"];
  seq.forEach(function(m){if(b[m]>0){if(st.length&&b.rest>0)st.push({m:"rest",min:b.rest});st.push({m:m,min:b[m]});}});return st;}

/* ---------- css ---------- */
var css=document.createElement("style");css.id="fcrCss";css.textContent=
 ".fcr{--b:"+BLUE+";--bd:"+DIM+";--ln:#1b2b34;--p:#0b1217;--p2:#0f1a21;--mu:#8fa3ad;--tx:#f4f7f9;color:var(--tx);font-family:Montserrat,sans-serif}"+
 ".fcr .hd{background:linear-gradient(160deg,#0c1a22,#050608);border:1px solid var(--ln);border-radius:16px;padding:18px 16px 16px;margin-bottom:12px}"+
 ".fcr .hd .t{font-family:Oswald,sans-serif;font-weight:600;font-size:22px;letter-spacing:3px;color:#fff;text-transform:uppercase}.fcr .hd .t span{font-family:'Mr Dafoe',cursive;font-weight:400;color:var(--b);font-size:30px;letter-spacing:1px;text-transform:none;margin-left:8px}"+
 ".fcr .hd .k{font-weight:700;font-size:9px;letter-spacing:4px;color:var(--mu);margin-top:3px;text-transform:uppercase}.fcr .hd .rule{width:44px;height:2px;background:var(--b);margin:10px 0}"+
 ".fcr .hd .st{display:flex;gap:6px}.fcr .hd .st div{flex:1;background:rgba(0,0,0,.4);border:1px solid var(--ln);border-radius:10px;padding:8px 6px;text-align:center}.fcr .hd .st b{display:block;font-family:Oswald,sans-serif;font-size:20px;line-height:1;color:#fff}.fcr .hd .st span{display:block;font-size:6.5px;letter-spacing:1.2px;text-transform:uppercase;color:var(--b);font-weight:800;margin-top:4px}"+
 ".fcr .sub{display:flex;gap:4px;background:rgba(0,0,0,.5);border:1px solid var(--ln);border-radius:12px;padding:4px;margin-bottom:12px}.fcr .sub button{flex:1;font-family:Oswald,sans-serif;font-weight:500;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;padding:9px 2px;border-radius:9px;border:0;background:transparent;color:var(--mu);cursor:pointer;white-space:nowrap}.fcr .sub button.on{background:var(--b);color:#04161d;font-weight:700}"+
 ".fcr .card{background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:14px;margin-bottom:10px}"+
 ".fcr .card h3{font-family:Oswald,sans-serif;font-weight:600;font-size:17px;letter-spacing:1.5px;text-transform:uppercase;margin:0;color:#fff}"+
 ".fcr .kk{font-size:8.5px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:var(--b);margin-bottom:4px;display:flex;justify-content:space-between;gap:8px}.fcr .kk small{color:var(--mu);letter-spacing:1px;text-align:right}"+
 ".fcr p{font-size:12.5px;line-height:1.55;color:#c9d4da;margin:8px 0 0}.fcr p b{color:#fff}"+
 ".fcr .dose{display:inline-block;margin-top:8px;font-size:9.5px;letter-spacing:1.2px;text-transform:uppercase;font-weight:800;color:#fff;border:1px solid var(--bd);border-radius:999px;padding:5px 10px}"+
 ".fcr .mod{border-left:3px solid var(--b)}"+
 ".fcr .row{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--ln)}.fcr .row:first-of-type{border-top:0}"+
 ".fcr .row .l{flex:1;min-width:0}.fcr .row .l b{display:block;font-family:Oswald,sans-serif;font-weight:500;font-size:15px;letter-spacing:.5px;text-transform:uppercase;color:#fff}.fcr .row .l small{display:block;font-size:10.5px;color:var(--mu);margin-top:2px}"+
 ".fcr .row input{width:74px;background:#050608;border:1.5px solid var(--bd);border-radius:10px;color:#fff;padding:10px 8px;font-family:Oswald,sans-serif;font-size:20px;text-align:center;flex:none}.fcr .row input:focus{outline:none;border-color:var(--b)}"+
 ".fcr .row .u{font-size:9px;letter-spacing:1px;text-transform:uppercase;color:var(--mu);font-weight:800;flex:none;width:28px}"+
 ".fcr .seg{display:flex;gap:6px;margin-top:8px}.fcr .seg button{flex:1;padding:10px 4px;border-radius:10px;background:var(--p2);border:1px solid var(--ln);color:var(--mu);font-family:Oswald,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}.fcr .seg button.on{background:var(--b);border-color:var(--b);color:#04161d;font-weight:700}"+
 ".fcr .big{display:block;width:100%;margin-top:10px;padding:15px;border-radius:12px;border:0;background:var(--b);color:#04161d;font-family:Oswald,sans-serif;font-size:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;cursor:pointer}.fcr .big.gh{background:none;border:1px solid var(--bd);color:var(--b);padding:11px;font-size:13px;margin-top:6px}.fcr .big.wh{background:#fff}"+
 ".fcr .steps{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.fcr .steps i{font-style:normal;font-size:10px;font-weight:800;letter-spacing:.5px;padding:6px 9px;border-radius:999px;background:var(--p2);border:1px solid var(--ln);color:#fff}.fcr .steps i b{font-weight:800}.fcr .steps i.rest{color:var(--mu)}"+
 ".fcr .tot{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;font-weight:800;color:var(--mu);margin-top:8px}.fcr .tot b{color:#fff}"+
 ".fcr .log{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--ln)}.fcr .log:first-of-type{border-top:0}.fcr .log .d{width:76px;flex:none;font-size:10.5px;color:var(--mu);font-weight:700}.fcr .log .n{flex:1;min-width:0;font-size:13px;font-weight:700;color:#fff}.fcr .log .n small{display:block;font-size:10.5px;color:var(--mu);font-weight:600;margin-top:1px}.fcr .log .x{border:0;background:none;color:var(--mu);font-size:18px;cursor:pointer;padding:0 4px}"+
 ".fcr .tm{background:linear-gradient(160deg,#0c1a22,#050608);border:1.5px solid var(--b);border-radius:16px;padding:22px 16px;text-align:center;margin-bottom:10px;box-shadow:0 0 24px rgba(79,184,220,.18)}"+
 ".fcr .tm .ph{font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:800;color:var(--b)}.fcr .tm .nm{font-family:Oswald,sans-serif;font-weight:600;font-size:30px;letter-spacing:2px;text-transform:uppercase;color:#fff;margin-top:6px;line-height:1}"+
 ".fcr .tm .clock{font-family:Oswald,sans-serif;font-weight:600;font-size:72px;line-height:1;letter-spacing:2px;color:#fff;margin:14px 0 6px;font-variant-numeric:tabular-nums}.fcr .tm .nx{font-size:11px;color:var(--mu);font-weight:600}"+
 ".fcr .tm .bar{height:6px;border-radius:3px;background:#0e171c;margin:14px 0 4px;overflow:hidden}.fcr .tm .bar i{display:block;height:100%;background:var(--b)}"+
 ".fcr .tm .btns{display:flex;gap:6px;margin-top:12px}.fcr .tm .btns button{flex:1;padding:13px 4px;border-radius:12px;border:1px solid var(--bd);background:transparent;color:#fff;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer}.fcr .tm .btns button.p{background:var(--b);color:#04161d;border-color:var(--b);font-weight:700}"+
 ".fcr .empty{font-size:12px;color:var(--mu);padding:6px 0}"+
 ".fcr .ico{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px}";
document.head.appendChild(css);
try{if(!document.getElementById("fcrDafoe")&&!document.querySelector('link[href*="Mr+Dafoe"]')){var fl=document.createElement("link");fl.id="fcrDafoe";fl.rel="stylesheet";fl.href="https://fonts.googleapis.com/css2?family=Mr+Dafoe&display=swap";document.head.appendChild(fl);}}catch(e){}

/* ---------- data ---------- */
function rows(){var f=fighter();if(!f)return [];return (R.rows||[]).filter(function(r){return r.fighter_id===f.id;});}
function load(){var f=fighter();if(!f||R.loading)return;if(R.loadedFor===f.id)return;R.loading=true;
  sb.from("fc_recovery").select("*").eq("fighter_id",f.id).order("done_at",{ascending:false}).then(function(r){R.loading=false;R.rows=r.error?[]:(r.data||[]);R.loadedFor=f.id;repaint();},function(){R.loading=false;});}
function thisWeek(){var w=rows(),now=new Date(),d=(now.getDay()+6)%7,mon=new Date(now);mon.setHours(0,0,0,0);mon.setDate(mon.getDate()-d);return w.filter(function(r){return pd(r.done_at)>=mon;}).length;}

/* ---------- pieces ---------- */
function stepsHtml(st){return '<div class="steps">'+st.map(function(s){return '<i class="'+s.m+'"><span class="ico" style="background:'+MC[s.m]+'"></span>'+E(MN[s.m])+' <b>'+s.min+'</b></i>';}).join('')+'</div>';}
function headHtml(){var all=rows(),last=all[0];
  return '<div class="hd"><div class="t">Kincumber<span>Recovery</span></div><div class="k">Inside Legacy Gym · Fight Club</div><div class="rule"></div>'
   +'<div class="st"><div><b>'+all.length+'</b><span>Sessions<br>this camp</span></div><div><b>'+thisWeek()+'</b><span>This<br>week</span></div><div><b>'+(last?fd(pd(last.done_at)).replace(/^\w+ /,''):'–')+'</b><span>Last<br>session</span></div></div></div>'
   +'<div class="sub">'+[["log","Log"],["build","Build your own"],["proto","Custom recovery"]].map(function(x){return '<button class="'+(R.sub===x[0]?'on':'')+'" onclick="fcrSub(\''+x[0]+'\')">'+x[1]+'</button>';}).join('')+'</div>';}
function logHtml(){var h='';
  ["sauna","ice","hot"].forEach(function(k){var m=MODS[k];h+='<div class="card mod" style="border-left-color:'+m.c+'"><div class="kk"><span>'+E(m.k)+'</span><small>'+E(m.dose)+'</small></div><h3>'+E(m.n)+'</h3><p>'+E(m.what)+'</p><p><b>When.</b> '+E(m.when)+'</p></div>';});
  h+='<div class="card"><div class="kk"><span>Already done it?</span></div><h3>Log a session</h3>'
    +'<div class="row"><div class="l"><b>Infrared sauna</b></div><input id="fcrQs" type="number" min="0" max="60" inputmode="numeric" value="'+(R.quick.sauna||'')+'" placeholder="0"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Ice bath</b></div><input id="fcrQi" type="number" min="0" max="30" inputmode="numeric" value="'+(R.quick.ice||'')+'" placeholder="0"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Hot bath</b></div><input id="fcrQh" type="number" min="0" max="60" inputmode="numeric" value="'+(R.quick.hot||'')+'" placeholder="0"><span class="u">min</span></div>'
    +'<button class="big" onclick="fcrQuick()">Log it</button></div>';
  var all=rows();
  h+='<div class="card"><div class="kk"><span>This camp</span><small>'+all.length+' session'+(all.length===1?'':'s')+'</small></div>'+(all.length?all.slice(0,20).map(function(r){return '<div class="log"><span class="d">'+E(fd(pd(r.done_at)))+'</span><span class="n">'+E(r.name||'Recovery')+'<small>'+[r.sauna_min?'Sauna '+r.sauna_min:'',r.ice_min?'Ice '+r.ice_min:'',r.hot_min?'Hot '+r.hot_min:''].filter(Boolean).join(' · ')+' · '+r.total_min+' min</small></span><button class="x" onclick="fcrDel('+r.id+')">×</button></div>';}).join(''):'<div class="empty">Nothing logged yet. Run a protocol or log one above.</div>')+'</div>';
  return h;}
function buildHtml(){var b=R.build,st=buildSteps();
  var h='<div class="card"><div class="kk"><span>Build your own</span><small>Minutes in each</small></div><h3>Your recovery</h3>'
    +'<div class="row"><div class="l"><b>Infrared sauna</b><small>0 to skip · 45 to 60°C</small></div><input id="fcrBs" type="number" min="0" max="45" inputmode="numeric" value="'+b.sauna+'" onchange="fcrBuild()"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Ice bath</b><small>0 to skip · 11 to 15°C</small></div><input id="fcrBi" type="number" min="0" max="20" inputmode="numeric" value="'+b.ice+'" onchange="fcrBuild()"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Hot bath</b><small>0 to skip · 38 to 40°C</small></div><input id="fcrBh" type="number" min="0" max="30" inputmode="numeric" value="'+b.hot+'" onchange="fcrBuild()"><span class="u">min</span></div>'
    +'<div class="row"><div class="l"><b>Rest between</b><small>Out of the water, towel off</small></div><input id="fcrBr" type="number" min="0" max="10" inputmode="numeric" value="'+b.rest+'" onchange="fcrBuild()"><span class="u">min</span></div>'
    +'<div class="kk" style="margin-top:12px"><span>Finish on</span></div><div class="seg"><button class="'+(b.finish==="cold"?'on':'')+'" onclick="fcrFinish(\'cold\')">Cold · after training</button><button class="'+(b.finish==="hot"?'on':'')+'" onclick="fcrFinish(\'hot\')">Hot · wind down</button></div>'
    +(st.length?stepsHtml(st)+'<div class="tot">Total <b>'+total(st)+' min</b></div><button class="big" onclick="fcrStart(\'build\')">Start the timer</button><button class="big gh" onclick="fcrLogSteps(\'build\')">Log it without the timer</button>':'<div class="empty">Put some minutes in above.</div>')+'</div>';
  h+='<div class="card"><div class="kk"><span>Rules of thumb</span></div><p><b>After training, finish cold.</b> Cold last keeps the soreness down. <b>Rest day, finish hot.</b> Hot last sends you to sleep. <b>Lifted today?</b> No cold for 4 hours, it blunts the strength gains. <b>Sparred today?</b> Cold only, no heat on fresh bruising.</p></div>';
  return h;}
function protoHtml(){return PROTOS.map(function(p){var st=stepsOf(p);
  return '<div class="card"><div class="kk"><span>'+E(p.tag)+'</span><small>'+total(st)+' min</small></div><h3>'+E(p.n)+'</h3><p style="margin-top:4px;color:var(--mu);font-size:11.5px"><b style="color:#fff">When.</b> '+E(p.when)+'</p>'+stepsHtml(st)+'<p>'+E(p.why)+'</p><button class="big" onclick="fcrStart(\''+p.id+'\')">Start</button><button class="big gh" onclick="fcrLogSteps(\''+p.id+'\')">Did it · log it</button></div>';}).join('')
  +'<div class="card"><div class="kk"><span>Where this comes from</span></div><p>Cold dose: a 2025 network meta-analysis of cold water immersion ranked 10 to 15 minutes at 11 to 15°C best for next-day soreness, with 5 to 10°C close behind for strength and muscle-damage markers. Infrared sauna: a 20 minute session at about 43°C after a heavy session kept jump power up and soreness down the next day in trained athletes, with no hit to overnight heart-rate recovery. Heat in general: the evidence for whole-body heat on its own is mixed, which is why the heat here is paired with cold or used as the wind-down. Cold straight after lifting is well known to blunt strength and size gains, hence the 4 hour rule.</p></div>';}
function timerHtml(){var r=R.run,st=r.steps,s=st[r.idx],nx=st[r.idx+1],done=st.slice(0,r.idx).reduce(function(a,x){return a+x.min*60;},0)+(s.min*60-r.left),all=st.reduce(function(a,x){return a+x.min*60;},0);
  return '<div class="tm"><div class="ph">'+E(r.name)+' · step '+(r.idx+1)+' of '+st.length+'</div><div class="nm" style="color:'+MC[s.m]+'">'+E(MN[s.m])+'</div><div class="clock">'+mmss(r.left)+'</div><div class="nx">'+(nx?'Next: '+E(MN[nx.m])+' '+nx.min+' min':'Last step · then it logs itself')+'</div><div class="bar"><i style="width:'+Math.round(done/all*100)+'%"></i></div>'
   +'<div class="btns"><button class="p" onclick="fcrPause()">'+(r.on?'Pause':(r.started?'Resume':'Start'))+'</button><button onclick="fcrSkip()">Skip</button><button onclick="fcrStop()">Stop</button></div></div>'+stepsHtml(st);}

window.fcRecHtml=function(w){load();var h='<div class="fcr">'+headHtml();if(R.run)h+=timerHtml();else h+=R.sub==="build"?buildHtml():R.sub==="proto"?protoHtml():logHtml();return h+'</div>';};
window.fcRecAfter=function(){};

/* ---------- timer ---------- */
function beep(){try{var A=window.AudioContext||window.webkitAudioContext;if(!A)return;var c=new A(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=880;g.gain.value=.2;o.start();o.stop(c.currentTime+.25);}catch(e){}try{if(navigator.vibrate)navigator.vibrate([200,100,200]);}catch(e){}}
function tick(){var r=R.run;if(!r||!r.on)return;r.left--;
  if(r.left<=0){if(r.idx+1>=r.steps.length){beep();finish();return;}r.idx++;r.left=r.steps[r.idx].min*60;beep();repaint();return;}
  var el=document.querySelector(".fcr .tm .clock");if(el)el.textContent=mmss(r.left);var bar=document.querySelector(".fcr .tm .bar i");if(bar){var st=r.steps,s=st[r.idx],done=st.slice(0,r.idx).reduce(function(a,x){return a+x.min*60;},0)+(s.min*60-r.left),all=st.reduce(function(a,x){return a+x.min*60;},0);bar.style.width=Math.round(done/all*100)+"%";}}
function finish(){var r=R.run;stopTick();R.run=null;logSteps(r.steps,r.kind,r.name).then(function(){T(r.name+" done · logged ✓");repaint();});}
function stopTick(){if(R.tick){clearInterval(R.tick);R.tick=null;}}
function protoById(id){return id==="build"?{id:"build",n:"My own recovery",steps:buildSteps()}:PROTOS.find(function(p){return p.id===id;});}
async function logSteps(steps,kind,name){if(pv()){T("Preview only · nothing saved");return;}var f=fighter();if(!f)return;
  var row={camp:CAMP,fighter_id:f.id,done_at:iso(new Date()),kind:kind,name:name,sauna_min:sum(steps,"sauna"),ice_min:sum(steps,"ice"),hot_min:sum(steps,"hot"),total_min:total(steps),created_by:uid()};
  var r=await sb.from("fc_recovery").insert(row).select().maybeSingle();if(r.error){T("Couldn't save · "+r.error.message);return;}R.rows=[r.data].concat(R.rows||[]);}

/* ---------- actions ---------- */
window.fcrSub=function(s){R.sub=s;repaint();};
window.fcrBuild=function(){R.build.sauna=num("fcrBs",0,45);R.build.ice=num("fcrBi",0,20);R.build.hot=num("fcrBh",0,30);R.build.rest=num("fcrBr",0,10);repaint();};
window.fcrFinish=function(v){window.fcrBuild();R.build.finish=v;repaint();};
window.fcrStart=function(id){if(id==="build")window.fcrBuild();var p=protoById(id);if(!p||!p.steps.length){T("Put some minutes in first");return;}stopTick();R.run={kind:id==="build"?"build":"protocol",name:p.n,steps:p.steps.slice(),idx:0,left:p.steps[0].min*60,on:false,started:false};repaint();try{window.scrollTo(0,0);}catch(e){}};
window.fcrPause=function(){var r=R.run;if(!r)return;r.on=!r.on;r.started=true;stopTick();if(r.on)R.tick=setInterval(tick,1000);repaint();};
window.fcrSkip=function(){var r=R.run;if(!r)return;if(r.idx+1>=r.steps.length){finish();return;}r.idx++;r.left=r.steps[r.idx].min*60;repaint();};
window.fcrStop=function(){stopTick();R.run=null;T("Stopped · nothing logged");repaint();};
window.fcrLogSteps=function(id){if(id==="build")window.fcrBuild();var p=protoById(id);if(!p||!p.steps.length){T("Put some minutes in first");return;}logSteps(p.steps,id==="build"?"build":"protocol",p.n).then(function(){T(p.n+" logged ✓");R.sub="log";repaint();});};
window.fcrQuick=function(){var s=num("fcrQs",0,60),i=num("fcrQi",0,30),h=num("fcrQh",0,60);if(!(s+i+h)){T("Put the minutes in first");return;}var st=[];if(s)st.push({m:"sauna",min:s});if(i)st.push({m:"ice",min:i});if(h)st.push({m:"hot",min:h});R.quick={sauna:0,ice:0,hot:0};logSteps(st,"quick","Recovery").then(function(){T("Logged ✓");repaint();});};
window.fcrDel=async function(id){if(pv()){T("Preview only");return;}if(!confirm("Remove this session?"))return;var r=await sb.from("fc_recovery").delete().eq("id",id);if(r.error){T("Couldn't remove it");return;}R.rows=(R.rows||[]).filter(function(x){return x.id!==id;});repaint();};
})();
