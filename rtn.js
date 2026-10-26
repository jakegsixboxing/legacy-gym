/* Legacy Gym · Road to Nationals · Sparring Club profile rebuilt for the nationals squad · 26 Oct 2026
   For the fighters listed in rtn_members, the Sparring Club tab is ONLY this: the 3-week block, Monday to Sunday,
   every session a working timer, recovery on every day. Everyone else keeps the normal Sparring Club.
   Sessions log through rtn_log_add; coaches see the squad with rtn_board. Remove the script tag to get the old profile back. */
(function(){var c=document.createElement("style");c.textContent=".rtn{font-family:Montserrat,system-ui,sans-serif;color:var(--tx);-webkit-font-smoothing:antialiased}\n.rtn{--bg:#0a0a0c;--p:#121214;--p2:#18181b;--ln:#26262b;--tx:#f2f0eb;--mu:#9a9891;--g:#c9a44c;--g2:#f4c95d;--ok:#4bc97a;--bad:#e05252;--blue:#4a8de6}\n.rtn *{box-sizing:border-box;margin:0}\n.rtn button{font-family:inherit;cursor:pointer}\n.rtn .wrap{max-width:520px;margin:0 auto;padding:14px 14px 0}\n.rtn .me{display:flex;align-items:center;gap:12px;padding:4px 2px 12px}\n.rtn .me img{width:54px;height:54px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid var(--g)}\n.rtn .me .k{font:600 10px/1 Oswald,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:var(--g)}\n.rtn .me b{display:block;font:600 20px/1.1 Oswald,sans-serif;text-transform:uppercase;margin-top:4px}\n.rtn .me small{display:block;font-size:11px;color:var(--mu);margin-top:3px}\n.rtn .hero{border:1px solid #3a3320;border-radius:16px;padding:16px;background:radial-gradient(ellipse 80% 70% at 100% 0%,rgba(201,164,76,.22),transparent 60%),linear-gradient(180deg,#17140c,#0f0e0b)}\n.rtn .hero .eb{font:600 10px/1 Oswald,sans-serif;letter-spacing:3px;text-transform:uppercase;color:var(--g)}\n.rtn .hero h1{font:700 38px/1 Oswald,sans-serif;text-transform:uppercase;margin-top:8px;letter-spacing:.5px}\n.rtn .hero h1 span{color:var(--g2)}\n.rtn .hero p{font-size:12.5px;color:#d9d4c7;line-height:1.5;margin-top:8px}\n.rtn .hero .blk{display:flex;gap:6px;margin-top:12px}\n.rtn .hero .blk button{flex:1;padding:9px 6px;border-radius:10px;border:1px solid #3a3320;background:#0b0905;color:var(--mu);font:600 11px/1.2 Oswald,sans-serif;letter-spacing:1.4px;text-transform:uppercase}\n.rtn .hero .blk button b{display:block;font-size:14px;color:#fff;margin-top:3px}\n.rtn .hero .blk button.on{border-color:var(--g);background:#1d1808;color:var(--g2)}\n.rtn .hero .blk button.on b{color:var(--g2)}\n.rtn .hero .blk button.dn b::after{content:\" \u2713\";color:var(--ok)}\n.rtn .days{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin:14px 0 12px}\n.rtn .days button{position:relative;background:var(--p);border:1px solid var(--ln);border-radius:12px;padding:9px 2px 8px;color:var(--mu);text-align:center}\n.rtn .days button span{display:block;font:700 10px/1 Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase}\n.rtn .days button b{display:block;font:600 11px/1.1 Montserrat,sans-serif;color:#cfc9bb;margin-top:5px;letter-spacing:.2px}\n.rtn .days button.on{background:var(--g);border-color:var(--g);color:#161307}\n.rtn .days button.on b{color:#161307}\n.rtn .days button i{position:absolute;top:5px;right:6px;width:7px;height:7px;border-radius:50%;background:var(--ln)}\n.rtn .days button i.dn{background:var(--ok)}\n.rtn .days button i.rest{background:transparent;border:1px solid var(--ln)}\n.rtn .days button.on i{border-color:#161307}\n.rtn .card{background:var(--p);border:1px solid var(--ln);border-radius:14px;padding:14px;margin-bottom:10px}\n.rtn .card .top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}\n.rtn .card .top .k{font:600 10px/1 Oswald,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:var(--g)}\n.rtn .card .top h2{font:600 22px/1.05 Oswald,sans-serif;text-transform:uppercase;margin-top:5px}\n.rtn .card .top .t{text-align:right;flex:none}\n.rtn .card .top .t b{display:block;font:600 20px/1 Oswald,sans-serif;color:#fff}\n.rtn .card .top .t small{display:block;font-size:10px;color:var(--mu);margin-top:3px;letter-spacing:.8px;text-transform:uppercase;font-weight:800}\n.rtn .card .sum{font-size:12px;color:var(--mu);line-height:1.5;margin-top:8px}\n.rtn .card .sum b{color:#fff}\n.rtn .big{display:block;width:100%;margin-top:12px;padding:15px;border-radius:12px;border:0;background:var(--g);color:#161307;font:700 16px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase}\n.rtn .big.ghost{background:var(--p2);color:var(--tx);border:1px solid var(--ln)}\n.rtn .big.dn{background:#163b26;color:#9af0bc;border:1px solid #2a6b45}\n.rtn .row2{display:flex;gap:8px}\n.rtn .row2 .big{margin-top:10px}\n.rtn .blocks{margin-top:12px;border-top:1px solid var(--ln)}\n.rtn .bk{display:grid;grid-template-columns:34px 1fr auto;gap:10px;padding:11px 0;border-bottom:1px solid var(--ln);align-items:start}\n.rtn .bk .n{width:30px;height:30px;border-radius:9px;background:var(--p2);border:1px solid var(--ln);display:grid;place-items:center;font:700 13px/1 Oswald,sans-serif;color:var(--g2)}\n.rtn .bk .n.gl{color:#9af0bc;border-color:#2a6b45;background:#0f2017}\n.rtn .bk b{display:block;font:600 15px/1.1 Oswald,sans-serif;text-transform:uppercase}\n.rtn .bk small{display:block;font-size:11.5px;color:var(--mu);line-height:1.45;margin-top:4px}\n.rtn .bk small i{font-style:normal;color:#d9d4c7}\n.rtn .bk .w{font:600 13px/1 Oswald,sans-serif;color:#fff;text-align:right;white-space:nowrap}\n.rtn .bk .w em{display:block;font:800 9px/1 Montserrat,sans-serif;letter-spacing:1px;text-transform:uppercase;color:var(--mu);margin-top:4px;font-style:normal}\n.rtn .rounds{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px}\n.rtn .rounds div{background:var(--p2);border:1px solid var(--ln);border-radius:8px;padding:6px 7px;font-size:10.5px;color:#d9d4c7;line-height:1.3}\n.rtn .rounds div b{display:block;font:700 10px/1 Oswald,sans-serif;color:var(--g2);letter-spacing:1px;margin-bottom:3px}\n.rtn .rounds div.max{border-color:#5a2a2a;background:#1d1212}\n.rtn .rounds div.max b{color:#ff8c8c}\n.rtn .note{margin-top:10px;font-size:11.5px;color:var(--mu);line-height:1.5;border-left:2px solid var(--g);padding-left:10px}\n.rtn .note b{color:#fff}\n.rtn .coach{margin-top:10px;background:#0b0905;border:1px dashed #3a3320;border-radius:10px;padding:10px 12px;font-size:11.5px;color:#d9d4c7;line-height:1.5}\n.rtn .coach b{color:var(--g2)}\n.rtn .pick{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}\n.rtn .pick button{background:var(--p2);border:1px solid var(--ln);color:var(--tx);border-radius:99px;padding:8px 12px;font:700 11px/1 Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase}\n.rtn .pick button.on{border-color:var(--g);color:var(--g2);background:#1d1808}\n.rtn .chk{list-style:none;margin-top:10px}\n.rtn .chk li{display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--ln);font-size:13px}\n.rtn .chk li i{width:20px;height:20px;border-radius:6px;border:1px solid var(--ln);display:grid;place-items:center;flex:none;font-style:normal;color:var(--ok);font-size:12px}\n.rtn .chk li.on i{border-color:var(--ok);background:#0f2017}\n.rtn .chk li.on{color:var(--mu);text-decoration:line-through}\n.rtn .tm{position:fixed;inset:0;z-index:50;background:#070708;display:none;flex-direction:column;overflow:hidden}\n.rtn .tm.on{display:flex}\n.rtn .tm.work{background:radial-gradient(ellipse 90% 60% at 50% 100%,rgba(201,164,76,.18),transparent 60%),#070708}\n.rtn .tm.rest{background:radial-gradient(ellipse 90% 60% at 50% 100%,rgba(74,141,230,.18),transparent 60%),#070708}\n.rtn .tm.gloves{background:radial-gradient(ellipse 90% 60% at 50% 100%,rgba(75,201,122,.18),transparent 60%),#070708}\n.rtn .tm.max{background:radial-gradient(ellipse 90% 60% at 50% 100%,rgba(224,82,82,.28),transparent 60%),#070708}\n.rtn .tm .hd{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;max-width:520px;width:100%;margin:0 auto}\n.rtn .tm .hd b{font:600 13px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase;color:var(--g)}\n.rtn .tm .hd button{background:none;border:1px solid var(--ln);color:var(--mu);border-radius:99px;padding:8px 12px;font:700 11px/1 Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase}\n.rtn .tm .prog{height:3px;background:var(--ln);max-width:520px;width:calc(100% - 32px);margin:0 auto;border-radius:3px;overflow:hidden}\n.rtn .tm .prog i{display:block;height:100%;background:var(--g);width:0}\n.rtn .tm .mid{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:10px 20px;max-width:520px;width:100%;margin:0 auto}\n.rtn .tm .ph{font:600 12px/1 Oswald,sans-serif;letter-spacing:3.5px;text-transform:uppercase;color:var(--mu)}\n.rtn .tm.work .ph{color:var(--g2)}\n.rtn .tm.rest .ph{color:#8ab8ff}\n.rtn .tm.gloves .ph{color:#9af0bc}\n.rtn .tm.max .ph{color:#ff8c8c}\n.rtn .tm h2{font:600 30px/1.05 Oswald,sans-serif;text-transform:uppercase;margin-top:10px;text-wrap:balance}\n.rtn .tm .clock{font:700 118px/1 Oswald,sans-serif;letter-spacing:2px;margin:14px 0 6px;font-variant-numeric:tabular-nums}\n.rtn .tm .cue{font:700 26px/1 Oswald,sans-serif;letter-spacing:4px;text-transform:uppercase;min-height:30px}\n.rtn .tm.cold{background:#0b4fa8}\n.rtn .tm.hot{background:#c2410c}\n.rtn .tm.cold .ph,.rtn .tm.hot .ph,.rtn .tm.cold .hd b,.rtn .tm.hot .hd b,.rtn .tm.cold .nt,.rtn .tm.hot .nt,.rtn .tm.cold .nt b,.rtn .tm.hot .nt b{color:#fff}\n.rtn .tm.cold .nx,.rtn .tm.hot .nx,.rtn .tm.cold .nx b,.rtn .tm.hot .nx b{color:rgba(255,255,255,.85)}\n.rtn .tm.cold .prog,.rtn .tm.hot .prog{background:rgba(0,0,0,.35)}\n.rtn .tm.cold .prog i,.rtn .tm.hot .prog i{background:#fff}\n.rtn .tm.cold .hd button,.rtn .tm.hot .hd button{color:#fff;border-color:rgba(255,255,255,.5)}\n.rtn .tm.cold .ctl button,.rtn .tm.hot .ctl button{background:rgba(0,0,0,.35);border-color:rgba(255,255,255,.35);color:#fff}\n.rtn .tm.cold .ctl button.p,.rtn .tm.hot .ctl button.p{background:#fff;color:#111;border-color:#fff}\n.rtn .mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}\n.rtn .mode button{padding:12px;border-radius:12px;border:1px solid var(--ln);background:var(--p);color:var(--mu);font:700 14px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase}\n.rtn .mode button.on{background:var(--g);border-color:var(--g);color:#161307}\n.rtn .mode button.rc.on{background:#1d6fe0;border-color:#1d6fe0;color:#fff}\n.rtn .mode button small{display:block;font:800 9px/1 Montserrat,sans-serif;letter-spacing:1px;margin-top:5px;opacity:.8}\n.rtn .steps{margin-top:12px;border-top:1px solid var(--ln)}\n.rtn .stp{display:grid;grid-template-columns:34px 1fr auto;gap:10px;padding:11px 0;border-bottom:1px solid var(--ln);align-items:center}\n.rtn .stp .n{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font:700 12px/1 Oswald,sans-serif;letter-spacing:1px}\n.rtn .stp .n.cold{background:#0f2a4f;border:1px solid #1d6fe0;color:#8ab8ff}\n.rtn .stp .n.hot{background:#3a1a0a;border:1px solid #c2410c;color:#ffb37a}\n.rtn .stp b{display:block;font:600 15px/1.1 Oswald,sans-serif;text-transform:uppercase}\n.rtn .stp small{display:block;font-size:11.5px;color:var(--mu);margin-top:3px;line-height:1.4}\n.rtn .stp .w{font:600 13px/1 Oswald,sans-serif;color:#fff;white-space:nowrap}\n.rtn .tm.max.go{background:#0a8a3c}\n.rtn .tm.max.easy{background:#b3121b}\n.rtn .tm.max.go .ph,.rtn .tm.max.easy .ph,.rtn .tm.max .hd b{color:#fff}\n.rtn .tm.max .prog{background:rgba(0,0,0,.35)}\n.rtn .tm.max .prog i{background:#fff}\n.rtn .tm.max .hd button{color:#fff;border-color:rgba(255,255,255,.5)}\n.rtn .tm .ivword{font:700 72px/1 Oswald,sans-serif;letter-spacing:8px;margin-top:18px;color:#fff}\n.rtn .tm .ivclock{font:700 190px/1 Oswald,sans-serif;font-variant-numeric:tabular-nums;color:#fff;margin:4px 0}\n.rtn .tm .ivsub{font:800 12px/1.4 Montserrat,sans-serif;letter-spacing:1.6px;text-transform:uppercase;color:rgba(255,255,255,.85)}\n.rtn .tm.max .nt,.rtn .tm.max .nt b{color:#fff}\n.rtn .tm.max .nx,.rtn .tm.max .nx b{color:rgba(255,255,255,.85)}\n.rtn .tm.max .ctl button{background:rgba(0,0,0,.35);border-color:rgba(255,255,255,.35);color:#fff}\n.rtn .tm.max .ctl button.p{background:#fff;color:#111;border-color:#fff}\n.rtn .tm .nt{font-size:14px;line-height:1.5;color:#d9d4c7;margin-top:14px;max-width:38ch}\n.rtn .tm .nt b{color:#fff}\n.rtn .tm .nx{margin-top:16px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:800;color:var(--mu)}\n.rtn .tm .nx b{color:var(--tx)}\n.rtn .tm .ctl{display:flex;gap:8px;padding:0 16px calc(18px + env(safe-area-inset-bottom));max-width:520px;width:100%;margin:0 auto}\n.rtn .tm .ctl button{flex:1;padding:16px 8px;border-radius:12px;border:1px solid var(--ln);background:var(--p2);color:var(--tx);font:700 14px/1 Oswald,sans-serif;letter-spacing:2px;text-transform:uppercase}\n.rtn .tm .ctl button.p{background:var(--g);color:#161307;border-color:var(--g);flex:2}\n.rtn .tm .done{text-align:center}\n.rtn .tm .done .tick{width:70px;height:70px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;background:#0f2017;border:1px solid #2a6b45;font-size:30px;color:var(--ok)}\n.rtn .tm .done p{font-size:13px;color:var(--mu);margin-top:8px;line-height:1.5}\n.rtn .tm .sw{font:700 96px/1 Oswald,sans-serif;font-variant-numeric:tabular-nums;margin:10px 0}\n.rtn .foot{font-size:10.5px;color:#6f6c66;text-align:center;margin-top:22px;line-height:1.6}\n@media(max-width:380px){.rtn .tm .clock{font-size:96px}\n.rtn .tm .ivclock{font-size:150px}\n.rtn .hero h1{font-size:32px}}\n@media(prefers-reduced-motion:reduce){.rtn *{transition:none!important}}\n.rtnCard{display:block;width:100%;text-align:left;cursor:pointer;position:relative;overflow:hidden;border:1.5px solid #c9a44c;border-radius:18px;padding:16px 46px 15px 16px;margin:0 0 14px;background:radial-gradient(120% 90% at 100% 0%,#5a4414 0%,#2a2010 45%,#0f0d08 100%);color:#fff;font-family:Montserrat,system-ui,sans-serif;box-shadow:0 0 0 1px rgba(201,164,76,.25),0 10px 30px rgba(0,0,0,.4)}.rtnCard .k{display:block;font:600 10px/1 Oswald,sans-serif;letter-spacing:2.5px;text-transform:uppercase;color:#f4c95d}.rtnCard .t{display:block;font:700 26px/1 Oswald,sans-serif;text-transform:uppercase;margin-top:6px;color:#fff}.rtnCard .s{display:block;font-size:11.5px;color:#d9d4c7;margin-top:6px;line-height:1.45}.rtnCard .a{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;background:#c9a44c;color:#161307;display:grid;place-items:center;font:700 18px/1 Oswald,sans-serif}\n.rtn .rob{display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:10px 12px;border:1px solid #3a3320;border-radius:12px;background:#15110a;font-size:11.5px;color:#d9d4c7}.rtn .rob button{background:none;border:1px solid var(--ln);color:var(--g2);border-radius:99px;padding:7px 11px;font:700 10px/1 Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase}\n.rtn .wrap{max-width:none;padding:0}\n.rtn .me .av0{width:54px;height:54px;border-radius:50%;border:2px solid var(--g);display:grid;place-items:center;font:600 22px/1 Oswald,sans-serif;color:var(--g2);background:#1d1a12}\n.rtn .me .cv{margin-left:auto;flex:none;background:none;border:1px solid var(--ln);color:var(--mu);border-radius:99px;padding:8px 11px;font:700 10px/1 Oswald,sans-serif;letter-spacing:1.2px;text-transform:uppercase}\n.rtn .tm{z-index:9999}\n.rtn .tm .ctl button,.rtn .tm .hd button{font-family:Oswald,sans-serif}";document.head.appendChild(c);})();

(function(){
"use strict";

var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
var FULL=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
var R2=120,REST=30;
function rounds(n,notes){return notes.slice(0,n);}
/* ---------- THE PROGRAM (repeats weeks 1-3) ---------- */
var P=[
{d:0,k:"Technical drills",name:"Jab, straight shots & combination drills",start:"6:00 pm",finish:"6:41 pm",mins:"41 min",
 sum:"2-minute rounds, 30 seconds between rounds and drill blocks. The 2-minute glove break replaces the rest after shadowboxing. No rest counted after the final round.",
 blocks:[
  {t:"cont",name:"Skipping",secs:600,note:"Continuous skip.",after:0},
  {t:"rounds",name:"Shadowboxing",n:4,notes:["Footwork.","Straight shots.","Open shadow.","Open shadow."],after:"gloves"},
  {t:"gloves"},
  {t:"rounds",name:"Jab & feint drills",n:3,notes:["Feints and single jabs.","Double jabs.","Level-changing jabs."],after:REST},
  {t:"rounds",name:"Straight shots",n:2,notes:["Straight punches only.","Straight punches only. Sharpen the 1-2."],after:REST},
  {t:"rounds",name:"Combinations & level changes",n:3,notes:["Three- and four-punch combinations.","Five-punch combinations, two-phase attacks.","First and third attacks. Intent and speed."],after:0}],
 extra:{time:"6:45 pm",name:"Tech sparring",k:"Sparring",note:"Technical sparring straight after the drills. Rounds and partners set by the coach on the night.",spar:true,def:[6,REST]}},
{d:1,k:"Individual training",name:"Individual technical training",start:"6:00 pm",finish:"6:53 pm",mins:"53 min",
 sum:"30 seconds after mirror shadowboxing and after each 2-minute round. Move straight from the speed ball into gut work.",
 blocks:[
  {t:"cont",name:"Skipping",secs:600,note:"Continuous skip.",after:0},
  {t:"cont",name:"Mirror shadowboxing",secs:600,note:"Work at 70%. Check hands, chin and footwork. Clean straight shots, combinations, first and third attacks, two-phase attacks and creating angles. No break within this block.",after:REST},
  {t:"rounds",name:"Slip lines",n:3,notes:["Use the lines.","Use the open space.","Lines and open space, move off after every slip."],after:REST,each:true},
  {t:"rounds",name:"Wall bag · long range",n:2,notes:["Long, clean straight shots.","Long straight shots and long hooks."],after:REST,each:true},
  {t:"rounds",name:"Wall bag · inside",n:2,notes:["Bent-arm punches: uppercuts, hooks and rips.","Add rolls, catches and slips between the shots."],after:REST,each:true},
  {t:"rounds",name:"Floor-to-ceiling ball",n:2,notes:["Speed.","Build combinations."],after:REST,each:true},
  {t:"cont",name:"Speed ball upstairs",secs:300,note:"Five minutes straight.",after:0},
  {t:"cont",name:"Gut work",secs:300,note:"Abdominal work. Straight in from the speed ball.",after:0}]},
{d:2,k:"Partner defence",name:"Partner defence & counter-punching",start:"6:00 pm",finish:"7:06 pm",mins:"66 min 30 sec",
 sum:"Shadow rounds have 30-second rests, the glove break replaces the last one. The partner-drill block is 45 minutes in total, including drill changes and any breaks.",
 blocks:[
  {t:"cont",name:"Skipping",secs:600,note:"Continuous skip.",after:0},
  {t:"rounds",name:"Shadowboxing",n:4,notes:["Footwork.","Straight shots.","Open shadow.","Open shadow."],after:"gloves"},
  {t:"gloves"},
  {t:"cont",name:"Partner drills",secs:2700,note:"Open hand defence, arm defence, head and trunk defence, and foot defence. Practise catching, slipping, rolling, pushing, stepping and counter-punching. Drill changes called by the coach.",after:0}],
 extra:{time:"6:45 pm",name:"Open sparring",k:"Sparring",note:"Open sparring. Rounds and partners set by the coach on the night.",spar:true,def:[6,REST]}},
{d:3,k:"Bag conditioning",name:"Heavy bag conditioning + timed 2 km run",start:"6:00 pm",finish:"6:41 pm + run",mins:"41 min 30 sec + run",
 sum:"12 × 2-minute rounds on the heavy bag, 30 seconds between. Bag work finishes 6:41:30 pm, then straight out the door for the 2 km for time.",
 blocks:[
  {t:"cont",name:"Skipping",secs:300,note:"Five minutes.",after:0},
  {t:"cont",name:"Shadowboxing",secs:300,note:"Five minutes continuous.",after:0},
  {t:"gloves"},
  {t:"rounds",name:"Heavy bag",n:12,notes:["Straight shots only.","Bent-arm punches only.","10 on / 10 off, max effort.","Two-phase attacks.","First and third attacks.","15 on / 15 off, max effort.","Open work.","Speed.","20 on / 20 off, max effort.","Open work.","Open work.","30 on / 30 off, max effort."],iv:{2:10,5:15,8:20,11:30},after:0}],
 run:true},
{d:4,k:"Friday",name:"Individual session · optional",rest:true,choice:true,
 sum:"Optional. Feeling good: run Tuesday's individual session again. Beaten up from the week: skip it and take the recovery instead."},
{d:5,k:"Saturday",name:"Sparring + bag work",spar:true,def:[6,60],
 sum:"Rounds and duration set by the coach on the day. Pick what you're given and the timer runs it. Bag work after."},
{d:6,k:"Sunday",name:"No training",rest:true,recovery:true,
 sum:"Rest day. Nothing on the program. Do the recovery, sleep, Monday's drills at 6:00 pm start the next week."}];
/* recovery: spread across the week to match the load. Mon + Wed are long nights (sparring after), keep them to an ice bath.
   Tue + Thu are the sauna nights. Weekend: sauna then contrast baths. */
var REC=[
 {name:"Ice bath",opt:false,why:"Long night: drills then tech sparring. Keep it simple, get the heat out of the legs, get home.",steps:[{k:"cold",secs:180,title:"Ice bath",note:"Three minutes. Shoulders under, slow breathing out the nose."}]},
 {name:"Sauna + ice bath",opt:false,sauna:true,why:"Lighter night on the body. Sauna 20 to 25 minutes, then straight into the ice.",steps:[{k:"hot",secs:1500,title:"Sauna",note:"20 to 25 minutes. Sit, breathe, water bottle with you."},{k:"cold",secs:180,title:"Ice bath",note:"Straight from the sauna. Three minutes, shoulders under."}]},
 {name:"Ice bath",opt:false,why:"Open sparring night. Three minutes in the ice after sparring, nothing else.",steps:[{k:"cold",secs:180,title:"Ice bath",note:"Three minutes. Shoulders under, slow breathing out the nose."}]},
 {name:"Sauna + ice bath",opt:false,sauna:true,why:"Hardest conditioning night of the week plus the 2 km. Sauna after the run, then the ice.",steps:[{k:"hot",secs:1500,title:"Sauna",note:"20 to 25 minutes once you've cooled down from the run."},{k:"cold",secs:180,title:"Ice bath",note:"Straight from the sauna. Three minutes, shoulders under."}]},
 {name:"Contrast baths",opt:true,why:"Optional. Legs heavy from Thursday, or you trained today: 2 cold / 2 hot, three rounds, finish on cold.",steps:[{k:"cold",secs:120,title:"Cold · round 1 of 3"},{k:"hot",secs:120,title:"Hot · round 1 of 3"},{k:"cold",secs:120,title:"Cold · round 2 of 3"},{k:"hot",secs:120,title:"Hot · round 2 of 3"},{k:"cold",secs:120,title:"Cold · round 3 of 3"},{k:"hot",secs:120,title:"Hot · round 3 of 3"},{k:"cold",secs:120,title:"Finish cold"}]},
 {name:"Ice bath",opt:true,why:"Optional. Three minutes in the ice after sparring and bag work.",steps:[{k:"cold",secs:180,title:"Ice bath",note:"Three minutes after sparring. Shoulders under."}]},
 {name:"Sauna + contrast baths",opt:true,sauna:true,why:"Optional, recommended. The big one for the week: sauna, then hot / cold / hot / cold / hot / cold. Finish on cold, Monday legs.",steps:[{k:"hot",secs:1500,title:"Sauna",note:"20 to 25 minutes."},{k:"hot",secs:120,title:"Hot bath · 1 of 3"},{k:"cold",secs:120,title:"Cold bath · 1 of 3"},{k:"hot",secs:120,title:"Hot bath · 2 of 3"},{k:"cold",secs:120,title:"Cold bath · 2 of 3"},{k:"hot",secs:120,title:"Hot bath · 3 of 3"},{k:"cold",secs:120,title:"Cold bath · 3 of 3 · finish cold"}]}];

/* ---------- state (demo: nothing saved) ---------- */
var S={wk:1,day:((new Date().getDay()+6)%7),done:{},spar:{},fri:null,runT:null,mode:"train",sauna:25,me:null,coach:false,loaded:false};
function $(id){return document.getElementById(id);}
function E(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function key(w,d,x){return w+":"+d+(x?":"+x:"");}
function mmss(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
function dur(b){if(b.t==="gloves")return R2;if(b.t==="cont")return b.secs;return b.n*R2+(b.n-1)*REST;}
function sessSecs(p){var t=0;(p.blocks||[]).forEach(function(b,i){t+=dur(b);if(b.each&&b.t==="rounds")t+=REST;else if(typeof b.after==="number")t+=b.after;});return t;}
function wkDate(w,d){var m=new Date(2026,9,26);m.setDate(m.getDate()+(w-1)*7+d);return m;}
function fd(dt){return dt.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][dt.getMonth()];}

/* ---------- build the timer phases for a session ---------- */
function phases(p){
  var out=[];
  function push(x){out.push(x);}
  (p.blocks||[]).forEach(function(b,bi){
    var nextB=p.blocks[bi+1];
    if(b.t==="gloves"){push({k:"gloves",secs:R2,title:"Gloves on",note:"Two minutes. Wraps tight, gloves on, water. Straight into the first drill round."});return;}
    if(b.t==="cont"){push({k:"work",secs:b.secs,title:b.name,note:b.note,blk:b.name});}
    else{
      for(var r=0;r<b.n;r++){
        var iv=b.iv&&b.iv[r];
        push({k:iv?"max":"work",secs:R2,title:b.name+" · round "+(r+1)+" of "+b.n,note:b.notes[r]||"",blk:b.name,iv:iv||0,rnd:r+1});
        if(r<b.n-1)push({k:"rest",secs:REST,title:"Rest",note:"Next: "+(b.notes[r+1]||b.name),blk:b.name});
      }
    }
    var a=b.after;
    if(b.each&&b.t==="rounds")a=REST;
    if(typeof a==="number"&&a>0&&nextB)push({k:"rest",secs:a,title:"Rest",note:"Next block: "+(nextB.t==="gloves"?"gloves on":nextB.name),blk:b.name});
  });
  return out;
}
/* generic sparring / bag rounds */
function sparPhases(n,rest,name){var out=[];for(var r=0;r<n;r++){out.push({k:"work",secs:R2,title:name+" · round "+(r+1)+" of "+n,note:"Coach calls the work. Breathe, stay long, finish the round strong.",rnd:r+1});if(r<n-1)out.push({k:"rest",secs:rest,title:"Rest",note:"Water. Listen to the corner. Round "+(r+2)+" next."});}return out;}

/* ---------- audio: loud, through a compressor so it doesn't clip ---------- */
var AC=null,MG=null;
function ac(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();}catch(e){}return AC;}
function out(){var c=ac();if(!c)return null;if(!MG){var comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.knee.value=12;comp.ratio.value=16;comp.attack.value=.002;comp.release.value=.2;MG=c.createGain();MG.gain.value=3.2;MG.connect(comp);comp.connect(c.destination);}return MG;}
function tone(f,t,d,type,g){var c=ac(),m=out();if(!c||!m)return;var o=c.createOscillator(),v=c.createGain();o.type=type||"square";o.frequency.value=f;o.connect(v);v.connect(m);var st=c.currentTime+(t||0);v.gain.setValueAtTime(0,st);v.gain.linearRampToValueAtTime(g||1,st+.01);v.gain.setValueAtTime(g||1,st+d*.6);v.gain.exponentialRampToValueAtTime(.001,st+d);o.start(st);o.stop(st+d+.05);}
function buzz(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
/* ring bell: big, bright, repeated */
function bell(n){for(var i=0;i<(n||1);i++){var t=i*.55;[523,1046,1568,2093].forEach(function(f,k){tone(f,t,1.1-k*.15,k?"sine":"triangle",[1.2,.9,.5,.3][k]);});}buzz(n>1?[300,150,300,150,300]:[400]);}
/* ten seconds out: three sharp pips */
function beep(){[0,.15,.3].forEach(function(t){tone(1500,t,.1,"square",.9);});buzz([80,60,80,60,80]);}
/* gloves on: air horn */
function horn(){[196,247,294,392].forEach(function(f){tone(f,0,1.4,"sawtooth",.7);});buzz([800]);}
/* GO: rising triple blast · EASY: two low buzzer hits */
function goTone(){[[880,0],[1320,.12],[1760,.24]].forEach(function(x){tone(x[0],x[1],.28,"square",1.1);});buzz([250,80,250]);}
function easyTone(){[0,.28].forEach(function(t){tone(180,t,.24,"sawtooth",1.1);tone(220,t,.24,"square",.6);});buzz([500]);}
/* male voice: prefer an Australian or British male, then any male, else the default (iPhone: Lee / Daniel, Android: en-AU male) */
var VOICE=null;
function pickVoice(){try{var V=speechSynthesis.getVoices()||[];if(!V.length)return;var pref=[/lee/i,/daniel/i,/en[-_]AU.*male/i,/male.*en[-_]AU/i,/arthur/i,/james/i,/oliver/i,/rishi/i,/aaron/i,/fred/i,/en[-_]GB.*male/i,/male/i];
  for(var i=0;i<pref.length&&!VOICE;i++){VOICE=V.filter(function(v){return pref[i].test(v.name+" "+v.lang)&&!/female|karen|catherine|samantha|moira|tessa|fiona|victoria/i.test(v.name);})[0]||null;}
  if(!VOICE){var au=V.filter(function(v){return /en[-_]AU/i.test(v.lang)&&!/karen|catherine|female/i.test(v.name);});VOICE=au[0]||null;}}catch(e){}}
pickVoice();try{speechSynthesis.onvoiceschanged=pickVoice;}catch(e){}
function say(t){try{if(!window.speechSynthesis)return;if(!VOICE)pickVoice();var u=new SpeechSynthesisUtterance(t);u.rate=1.02;u.pitch=.85;u.volume=1;u.lang=(VOICE&&VOICE.lang)||"en-AU";if(VOICE)u.voice=VOICE;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}
var wake=null;function keepAwake(){try{if(navigator.wakeLock)navigator.wakeLock.request("screen").then(function(w){wake=w;}).catch(function(){});}catch(e){}}
function letSleep(){try{if(wake)wake.release();}catch(e){}wake=null;}

/* ---------- timer engine ---------- */
var T={on:false,ph:[],i:0,left:0,tick:null,paused:false,total:0,elapsed:0,title:"",after:null,lastCue:null,sw:false,swT:0};
function openTimer(ph,title,after){ac();T={on:true,ph:ph,i:0,left:ph[0].secs,tick:null,paused:false,total:ph.reduce(function(a,p){return a+p.secs;},0),elapsed:0,title:title,after:after||null,lastCue:null,sw:false,swT:0};
  rootT().className="tm on";keepAwake();startPhase(true);T.tick=setInterval(step,250);T.last=Date.now();paintT();}
function startPhase(first){var p=T.ph[T.i];T.left=p.secs;T.lastCue=null;
  if(p.k==="gloves"){horn();say("Gloves on. Two minutes.");}
  else if(p.k==="cold"){horn();say(p.title.replace(/·/g,",")+". "+mmss(p.secs).replace(":00"," minutes").replace(":"," ")+". In you get.");}
  else if(p.k==="hot"){bell(1);say(p.title.replace(/·/g,",")+". "+mmss(p.secs).replace(":00"," minutes").replace(":"," ")+".");}
  else if(p.k==="rest"){bell(3);say("Rest.");}
  else if(p.k==="max"){bell(1);goTone();say("Round "+p.rnd+". Max effort. "+p.iv+" on, "+p.iv+" off. Go!");}
  else{bell(1);say((p.rnd?"Round "+p.rnd+". ":"")+(p.note||p.title).split(".")[0]);}
  paintT();}
function step(){if(!T.on||T.paused)return;var now=Date.now(),dt=(now-T.last)/1000;T.last=now;
  if(T.sw){T.swT+=dt;paintT();return;}
  T.left-=dt;T.elapsed+=dt;var p=T.ph[T.i];
  var l=Math.ceil(T.left);
  if(p.iv){var pos=Math.floor((p.secs-T.left)/p.iv),cue=pos%2===0?"go":"easy";if(cue!==T.lastCue){T.lastCue=cue;if(T.left<p.secs-0.3){if(cue==="go"){goTone();say("Go!");}else{easyTone();say("Easy.");}}}}
  if(l===10&&!T.warned){T.warned=true;beep();say("Ten seconds.");}
  if(l!==10)T.warned=false;
  if(T.left<=0){T.elapsed+=T.left;if(T.i<T.ph.length-1){T.i++;startPhase();}else{finish();return;}}
  paintT();}
function finish(){clearInterval(T.tick);T.i=T.ph.length;bell(3);say("Session done.");paintT();}
window.rtnTmPause=function(){T.paused=!T.paused;T.last=Date.now();if(!T.paused)ac();paintT();};
window.rtnTmSkip=function(d){var n=T.i+d;if(n<0||n>=T.ph.length)return;T.elapsed=T.ph.slice(0,n).reduce(function(a,p){return a+p.secs;},0);T.i=n;startPhase();};
window.rtnTmClose=function(){clearInterval(T.tick);T.on=false;letSleep();rootT().className="tm";try{speechSynthesis.cancel();}catch(e){}paint();};
window.rtnTmDone=function(){if(T.after)T.after();rtnTmClose();};
window.rtnTmRun=function(){T.sw=true;T.swT=0;T.paused=false;T.last=Date.now();T.tick=setInterval(step,250);bell(1);say("Go.");paintT();};
window.rtnTmRunStop=function(){clearInterval(T.tick);S.runT=T.swT;S.done[key(S.wk,S.day,"run")]=true;T.sw=false;T.runDone=true;bell(3);logIt(S.wk,S.day,"run",null,Math.round(T.swT));paintT();};
function paintT(){var el=rootT();if(!T.on)return;
  var h='<div class="hd"><b>'+E(T.title)+'</b><button onclick="rtnTmClose()">Close</button></div>';
  if(T.i>=T.ph.length){ /* done */
    var p=T.ph[T.ph.length-1];el.className="tm on";
    var run=!!(T.after&&T.after.run);
    h+='<div class="prog"><i style="width:100%"></i></div><div class="mid"><div class="done"><div class="tick">✓</div><h2>'+(run?(T.runDone?"Run logged":"Bag work done"):"Session done")+'</h2>';
    if(run&&!T.runDone&&!T.sw)h+='<p>Straight out the door. <b style="color:#fff">2 km for time.</b> Hit go on the line, stop at the finish.</p><button class="big" onclick="rtnTmRun()">Start the 2 km</button>';
    else if(run&&T.sw)h+='<div class="sw">'+mmss(T.swT)+'</div><p>2 km for time</p><button class="big" onclick="rtnTmRunStop()">Stop · I\'m done</button>';
    else if(run&&T.runDone)h+='<div class="sw">'+mmss(S.runT)+'</div><p>2 km · '+mmss(S.runT)+'. Logged against week '+S.wk+' Thursday.</p>';
    else h+='<p>'+mmss(T.total)+' of work banked. Logged against week '+S.wk+' '+FULL[S.day]+'.</p>';
    if(!(run&&(T.sw||!T.runDone)))h+='<button class="big" onclick="rtnTmDone()">Back to the week</button>';
    h+='</div></div>';el.innerHTML=h;return;}
  var p=T.ph[T.i],cls="tm on "+p.k,cue="";
  if(p.iv){var pos=Math.floor((p.secs-T.left)/p.iv),go=pos%2===0,ivLeft=p.iv-((p.secs-T.left)%p.iv);cls+=go?" go":" easy";cue='<div class="ivword">'+(go?"GO":"EASY")+'</div><div class="ivclock">'+Math.ceil(ivLeft)+'</div><div class="ivsub">'+(go?"max effort · "+p.iv+" on":"breathe · "+p.iv+" off")+' · round clock '+mmss(T.left)+'</div>';}
  var nx=T.ph[T.i+1];
  h+='<div class="prog"><i style="width:'+Math.min(100,100*T.elapsed/T.total)+'%"></i></div>';
  h+='<div class="mid"><div class="ph">'+(p.k==="rest"?"Rest":p.k==="gloves"?"Gloves on":p.k==="cold"?"Cold":p.k==="hot"?"Heat":p.k==="max"?"Max effort · "+p.iv+" on / "+p.iv+" off":"Work")+' · '+(T.i+1)+' of '+T.ph.length+'</div><h2>'+E(p.title)+'</h2>'+(p.iv?cue:'<div class="clock">'+mmss(T.left)+'</div>')
    +'<div class="nt">'+(p.k==="rest"?E(p.note):'<b>'+E(p.note)+'</b>')+'</div>'
    +(nx?'<div class="nx">Next · <b>'+E(nx.title)+'</b> · '+mmss(nx.secs)+'</div>':'<div class="nx">Last one. Nothing after this.</div>')+'</div>';
  h+='<div class="ctl"><button onclick="rtnTmSkip(-1)">‹ Back</button><button class="p" onclick="rtnTmPause()">'+(T.paused?"Resume":"Pause")+'</button><button onclick="rtnTmSkip(1)">Skip ›</button></div>';
  el.className=cls;el.innerHTML=h;}

/* ---------- screens ---------- */
function blockHtml(p){
  var n=0;
  return '<div class="blocks">'+p.blocks.map(function(b){
    if(b.t==="gloves")return '<div class="bk"><div class="n gl">G</div><div><b>Gloves on</b><small>Two minutes. Replaces the rest after shadowboxing.</small></div><div class="w">2:00<em>break</em></div></div>';
    n++;
    var w=b.t==="cont"?mmss(b.secs)+'<em>continuous</em>':b.n+' × 2:00<em>'+REST+' s rest</em>';
    var inner='<b>'+E(b.name)+'</b>';
    if(b.t==="cont")inner+='<small>'+E(b.note)+'</small>';
    else{inner+='<div class="rounds">'+b.notes.map(function(x,i){var mx=b.iv&&b.iv[i];return '<div class="'+(mx?'max':'')+'"><b>R'+(i+1)+(mx?' · '+mx+'/'+mx:'')+'</b>'+E(x)+'</div>';}).join("")+'</div>';}
    return '<div class="bk"><div class="n">'+n+'</div><div>'+inner+'</div><div class="w">'+w+'</div></div>';}).join("")+'</div>';}
function sparCard(p,x,tag){
  var k=key(S.wk,S.day,tag),st=S.spar[k]||{n:x.def[0],r:x.def[1]},dn=S.done[k];
  return '<div class="card"><div class="top"><div><div class="k">'+E(x.k||"Sparring")+(x.time?' · '+x.time:'')+'</div><h2>'+E(x.name)+'</h2></div><div class="t"><b>'+st.n+' × 2</b><small>rounds</small></div></div>'
   +'<div class="sum">'+E(x.note||p.sum)+'</div>'
   +'<div class="coach"><b>Coach sets the rounds.</b> Pick what you\'re given and the timer runs it, bell to bell.</div>'
   +'<div class="pick">'+[4,6,8,10,12].map(function(n){return '<button class="'+(st.n===n?'on':'')+'" onclick="rtnSetSpar(\''+tag+'\','+n+',null)">'+n+' rounds</button>';}).join("")+'</div>'
   +'<div class="pick">'+[30,60].map(function(r){return '<button class="'+(st.r===r?'on':'')+'" onclick="rtnSetSpar(\''+tag+'\',null,'+r+')">'+r+' s rest</button>';}).join("")+'</div>'
   +(dn?'<button class="big dn">Done ✓ · '+st.n+' rounds banked</button>':'<button class="big" onclick="rtnStartSpar(\''+tag+'\',\''+E(x.name)+'\')">Start '+E(x.name.toLowerCase())+'</button>')+'</div>';}
function recPhases(r){return r.steps.map(function(st){var o={k:st.k,secs:st.secs,title:st.title,note:st.note||(st.k==="cold"?"Shoulders under. Slow breathing out the nose.":"Relax. Let the heat in.")};if(st.title==="Sauna")o.secs=S.sauna*60;return o;});}
function recoveryCard(d){var r=REC[d],k=key(S.wk,d,"rec"),dn=S.done[k];var secs=recPhases(r).reduce(function(a,p){return a+p.secs;},0);
  return '<div class="card"><div class="top"><div><div class="k">Recovery · '+FULL[d]+(r.opt?' · optional':'')+'</div><h2>'+E(r.name)+'</h2></div><div class="t"><b>'+mmss(secs)+'</b><small>total</small></div></div>'
   +'<div class="sum">'+E(r.why)+'</div>'
   +(r.sauna?'<div class="pick"><span style="font:800 10px/30px Montserrat,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:var(--mu)">Sauna</span>'+[20,25].map(function(m){return '<button class="'+(S.sauna===m?'on':'')+'" onclick="rtnSauna('+m+')">'+m+' min</button>';}).join("")+'</div>':'')
   +(dn?'<button class="big dn">Done ✓ · recovery banked</button>':'<button class="big" style="background:#1d6fe0;color:#fff" onclick="rtnStartRec()">Start recovery · timer runs it</button>')
   +'<div class="steps">'+r.steps.map(function(st,i){var sec=st.title==="Sauna"?S.sauna*60:st.secs;return '<div class="stp"><div class="n '+st.k+'">'+(st.k==="cold"?"ICE":"HOT")+'</div><div><b>'+E(st.title)+'</b>'+(st.note?'<small>'+E(st.note)+'</small>':'')+'</div><div class="w">'+mmss(sec)+'</div></div>';}).join("")+'</div>'
   +'<div class="coach"><b>Screen goes blue in the cold, orange in the heat</b>, horn when it\'s time to get in, bell when it\'s time to get out.</div></div>';}
function dayHtml(){var p=P[S.day],k=key(S.wk,S.day),dn=S.done[k],h='';
  var trainLabel=p.blocks?p.start:p.spar?"Sparring":p.choice?"Optional":"Rest day";
  h+='<div class="mode"><button class="'+(S.mode==="train"?'on':'')+'" onclick="rtnMode(\'train\')">Train<small>'+trainLabel+'</small></button><button class="rc '+(S.mode==="rec"?'on':'')+'" onclick="rtnMode(\'rec\')">Recover<small>'+E(REC[S.day].name)+(REC[S.day].opt?' · optional':'')+'</small></button></div>';
  if(S.mode==="rec")return h+recoveryCard(S.day);
  if(p.blocks){
    var secs=sessSecs(p);
    h+='<div class="card"><div class="top"><div><div class="k">'+E(p.k)+' · '+p.start+'</div><h2>'+E(p.name)+'</h2></div><div class="t"><b>'+mmss(secs)+'</b><small>finish '+E(p.finish)+'</small></div></div>'
     +'<div class="sum">'+E(p.sum)+'</div>'
     +(dn?'<button class="big dn">Done ✓ · logged for week '+S.wk+'</button>':'<button class="big" onclick="rtnStartSess()">Start the session · timer runs it</button>')
     +blockHtml(p)
     +(p.blocks.some(function(b){return b.iv;})?'<div class="coach"><b>Max-effort rounds (10/10, 15/15, 20/20, 30/30):</b> the whole screen goes <b style="color:#4bc97a">green on GO</b> and <b style="color:#ff6b6b">red on EASY</b>, with a loud blast at every switch. Turn the phone up.</div>':'')
     +(p.run?'<div class="note"><b>Finish: 2 km run for time.</b> The timer hands you a stopwatch the moment round 12 ends.'+(S.runT&&dn?' Last run: <b>'+mmss(S.runT)+'</b>.':'')+'</div>':'')
     +'</div>';
    if(p.extra)h+=sparCard(p,p.extra,"x");
    h+='<div class="note">After training: <b>'+E(REC[S.day].name)+'</b>. Tap Recover above.</div>';
  }else if(p.choice){
    var t=P[1];h+='<div class="card"><div class="top"><div><div class="k">Friday · optional</div><h2>'+E(t.name)+'</h2></div><div class="t"><b>'+mmss(sessSecs(t))+'</b><small>same as Tuesday</small></div></div><div class="sum">'+E(p.sum)+'</div>'+(dn?'<button class="big dn">Done ✓</button>':'<button class="big" onclick="rtnStartSess(1)">Start the session</button>')+blockHtml(t)+'</div>';
  }else if(p.spar){
    h+=sparCard(p,{name:"Sparring",k:"Saturday · sparring",note:p.sum,def:p.def},"s");
    h+=sparCard(p,{name:"Bag work",k:"Saturday · after sparring",note:"Bag rounds after sparring. Rounds set on the day.",def:[6,30]},"b");
    h+='<div class="note">After: <b>'+E(REC[5].name)+'</b> (optional). Tap Recover above.</div>';
  }else{h+='<div class="card"><div class="top"><div><div class="k">Sunday</div><h2>No training</h2></div></div><div class="sum">'+E(p.sum)+'</div><button class="big" style="background:#1d6fe0;color:#fff" onclick="rtnMode(\'rec\')">Open today\'s recovery</button></div>';}
  return h;}
function paint(){var w=S.wk;
  var nm=(S.me&&S.me.name)||"",first=nm.split(" ")[0]||"",ph=(S.me&&S.me.photo)||"";
  var h=(S.ro?'<div class="rob"><button onclick="rtnRoster()">‹ Back to roster</button><span>Coach view · '+E(nm)+'\'s log</span></div>':'')+'<div class="me">'+(ph?'<img src="'+E(ph)+'" alt="">':'<div class="av0">'+E((first[0]||"").toUpperCase())+'</div>')+'<div><div class="k">Sparring Club · '+E(nm)+'</div><b>Your training</b><small>'+E(first)+', only you and the coaches see this.</small></div>'+(S.me&&S.me.staff&&!S.ro?(view==="rtn"?'<button class="cv" onclick="rtnSquad(true)">Squad ›</button>':'<button class="cv" onclick="rtnCoach(true)">Coach view ›</button>'):'')+'</div>';
  h+='<div class="hero"><div class="eb">Australian Titles · first 3-week block</div><h1>Road to <span>Nationals</span></h1><p>Three weeks straight, same program every week, Monday to Thursday at 6:00 pm. Tap the day, hit start, the timer runs the whole session bell to bell.</p>'
   +'<div class="blk">'+[1,2,3].map(function(i){var d=[0,1,2,3].filter(function(x){return S.done[key(i,x)];}).length;return '<button class="'+(i===w?'on':'')+(d===4?' dn':'')+'" onclick="rtnWk('+i+')">Week '+i+'<b>'+fd(wkDate(i,0))+' – '+fd(wkDate(i,6))+'</b></button>';}).join("")+'</div></div>';
  h+='<div class="days">'+P.map(function(p,i){var dn=S.done[key(w,i)];return '<button class="'+(i===S.day?'on':'')+'" onclick="rtnDay('+i+')"><span>'+DAYS[i]+'</span><b>'+(p.blocks?p.start.replace(" pm",""):p.spar?"Spar":p.choice?"Opt":"Rest")+'</b><i class="'+(dn||S.done[key(w,i,"rec")]?'dn':p.rest?'rest':'')+'"></i></button>';}).join("")+'</div>';
  h+=dayHtml();
  h+='<div class="foot">Legacy Gym · Fight Club · Road to Nationals block 1 · weeks of '+fd(wkDate(1,0))+', '+fd(wkDate(2,0))+' and '+fd(wkDate(3,0))+'</div>';
  rootA().innerHTML=h;}
window.rtnWk=function(w){S.wk=w;paint();};
window.rtnDay=function(d){S.day=d;S.mode=d===6?"rec":"train";paint();window.scrollTo({top:0,behavior:"smooth"});};
window.rtnMode=function(m){S.mode=m;paint();};
window.rtnSauna=function(m){S.sauna=m;paint();};
window.rtnStartRec=function(){if(S.ro){try{toast("Coach view — "+(S.me.name||"").split(" ")[0]+" runs this from their own phone.");}catch(e){}return;}var d=S.day,r=REC[d],w=S.wk;var ph=recPhases(r);openTimer(ph,FULL[d]+" · recovery",function(){S.done[key(w,d,"rec")]=true;logIt(w,d,"rec",ph.reduce(function(a,p){return a+p.secs;},0),null);});};
window.rtnSetSpar=function(tag,n,r){var k=key(S.wk,S.day,tag),st=S.spar[k]||{n:6,r:30};if(n)st.n=n;if(r)st.r=r;S.spar[k]=st;paint();};
window.rtnStartSess=function(idx){if(S.ro){try{toast("Coach view — "+(S.me.name||"").split(" ")[0]+" runs this from their own phone.");}catch(e){}return;}var p=P[idx==null?S.day:idx],d=S.day,w=S.wk;var after=function(){S.done[key(w,d)]=true;logIt(w,d,"train",sessSecs(p),null);};after.run=!!p.run;openTimer(phases(p),FULL[d]+" · "+p.k,after);};
window.rtnStartSpar=function(tag,name){if(S.ro){try{toast("Coach view — "+(S.me.name||"").split(" ")[0]+" runs this from their own phone.");}catch(e){}return;}var k=key(S.wk,S.day,tag),st=S.spar[k]||{n:6,r:30},w=S.wk,d=S.day;openTimer(sparPhases(st.n,st.r,name),FULL[S.day]+" · "+name,function(){S.done[k]=true;logIt(w,d,tag,st.n*R2,null);});};

/* ---------- app wiring ---------- */
function me(){try{return (typeof session!=="undefined"&&session&&session.user)?session.user.id:null;}catch(e){return null;}}
function rootA(){return document.getElementById("rtnApp");}
function rootT(){var t=document.getElementById("rtnT");if(!t){var w=document.createElement("div");w.className="rtn";w.innerHTML='<div class="tm" id="rtnT"></div>';document.body.appendChild(w);t=document.getElementById("rtnT");}return t;}
function logIt(w,d,kind,secs,run){try{sb.rpc("rtn_log_add",{p_wk:w,p_day:d,p_kind:kind,p_secs:secs,p_run:run}).then(function(r){if(r&&r.error)console.warn(r.error);});}catch(e){}}
function curWeek(){var n=Math.floor((Date.now()-wkDate(1,0).getTime())/6048e5)+1;return Math.max(1,Math.min(3,n));}
async function loadState(){try{var r=await sb.rpc("rtn_state");if(r.error||!r.data)return null;var d=r.data;S.me=d;S.done={};S.runT=null;
  (d.logs||[]).forEach(function(l){var k=l.kind==="train"?key(l.wk,l.day):key(l.wk,l.day,l.kind);S.done[k]=true;if(l.kind==="run"&&l.run_secs)S.runT=l.run_secs;});
  S.loaded=true;if(d.staff)board();return d;}catch(e){return null;}}
window.rtnCoach=function(on){S.coach=!!on;S.ro=false;try{boxSub="sparring";coachViewId=null;}catch(e){}renderBoxing();};
var _rb=window.renderBoxing,_rsc=window.renderSparringClub;
function host(){var m=document.getElementById("main");if(!m)return null;m.innerHTML='<div class="rtn"><div class="wrap" id="rtnApp"></div></div>';return rootA();}
/* Boxing tab = Road to Nationals, nothing else, for the squad */
window.renderBoxing=async function(){
  if(!me())return _rb.apply(this,arguments);
  if(!S.loaded){var m0=document.getElementById("main");if(m0)m0.innerHTML='<div class="loadingDots">Loading…</div>';await loadState();}
  if(!S.me||!S.me.member||S.coach)return _rb.apply(this,arguments);
  if(view!=="boxing")return;
  if(!S.wkSet){S.wk=curWeek();S.wkSet=true;}
  if(host())paint();
};
window.renderSparringClub=async function(){
  if(!me())return _rsc.apply(this,arguments);
  if(!S.loaded)await loadState();
  if(!S.me||!S.me.member||S.coach)return _rsc.apply(this,arguments);
  return renderBoxing();
};
/* coach opens a squad fighter from the roster: show THEIR Road to Nationals log, read-only, not the old profile */
var _ocfv=window.openCoachFighterView;S.board=null;S.saved=null;
async function board(){if(S.board)return S.board;try{var r=await sb.rpc("rtn_board");S.board=(r&&r.data)||[];}catch(e){S.board=[];}return S.board;}
window.openCoachFighterView=async function(uid){
  if(!S.me||!S.me.staff)return _ocfv.apply(this,arguments);
  var B=await board(),f=B.filter(function(x){return x.user_id===uid;})[0];
  if(!f)return _ocfv.apply(this,arguments);
  try{coachViewId=uid;}catch(e){}
  if(!S.saved)S.saved={me:S.me,done:S.done,runT:S.runT,wk:S.wk,day:S.day,mode:S.mode};
  var done={},runT=null;(f.logs||[]).forEach(function(l){var k=l.kind==="train"?key(l.wk,l.day):key(l.wk,l.day,l.kind);done[k]=true;if(l.kind==="run"&&l.run_secs)runT=l.run_secs;});
  S.me={name:f.name,photo:null,staff:false,member:true};S.done=done;S.runT=runT;S.ro=true;S.mode="train";
  var c=document.getElementById("boxContent");if(!c)return;c.innerHTML='<div class="rtn"><div class="wrap" id="rtnApp"></div></div>';paint();window.scrollTo(0,0);
};
/* every other route into the coach's fighter view (programs board, after a tick, etc.) */
var _rcfv=window.renderCoachFighterView;
window.renderCoachFighterView=function(){
  var uid=null;try{uid=coachViewId;}catch(e){}
  if(uid&&S.me&&S.me.staff&&S.board&&S.board.some(function(x){return x.user_id===uid;})){if(!S.ro||!S.me||S.me.name!==(S.board.filter(function(x){return x.user_id===uid;})[0]||{}).name)return openCoachFighterView(uid);var c=document.getElementById("boxContent");if(c){c.innerHTML='<div class="rtn"><div class="wrap" id="rtnApp"></div></div>';paint();}return;}
  if(uid&&S.me&&S.me.staff&&!S.board){board().then(function(B){if(B.some(function(x){return x.user_id===uid;}))openCoachFighterView(uid);});}
  return _rcfv.apply(this,arguments);
};
window.rtnRoster=function(){var fs=S.fromSquad;S.fromSquad=false;restoreMe();if(view==="rtn"||fs){S.squadView=true;renderRTN();return;}S.board=null;try{coachViewId=null;}catch(e){}try{closeCoachFighterView();}catch(e){renderSparringClub();}};
/* leaving Boxing drops coach view, so coming back lands on Road to Nationals again */
try{var _go=window.go;window.go=function(v){if(v!=="boxing"&&v!=="rtn"){S.coach=false;S.squadView=false;S.fromSquad=false;if(S.saved)restoreMe();}return _go.apply(this,arguments);};}catch(e){}
/* ---------- ROAD TO NATIONALS tab: its own view, a gold card at the top of Home, squad only ---------- */
try{NAV_TAB.rtn="home";}catch(e){}
function cardHtml(){var first=((S.me&&S.me.name)||"").split(" ")[0];var w=curWeek(),d=((new Date().getDay()+6)%7),p=P[d];
  var todays=p.blocks?p.k+" · "+p.start:p.spar?"Sparring + bag work":p.choice?"Optional session":"Recovery day";
  var dn=S.done[key(w,d)]||S.done[key(w,d,"rec")];
  return '<button id="rtnCard" class="rtnCard" onclick="rtnEnter()"><span class="k">Australian Titles · week '+w+' of 3</span><span class="t">Road to Nationals</span><span class="s">'+E(FULL[d])+': '+E(todays)+(dn?' · done ✓':'')+'. Tap to open your training.</span><span class="a">›</span></button>';}
function injectCard(){try{if(!S.me||!S.me.member)return;var m=document.getElementById("main");if(!m||view!=="home")return;if(document.getElementById("rtnCard"))return;
  var w=document.createElement("div");w.innerHTML=cardHtml();var card=w.firstChild;
  var top=m.querySelector(".homeWelcome, #lgh2, .homeCard");if(top)top.insertAdjacentElement("beforebegin",card);else m.insertBefore(card,m.firstChild);}catch(e){}}
window.rtnEnter=function(){if(!me()){try{toast("Sign in first");}catch(e){}return;}S.coach=false;if(!S.wkSet){S.wk=curWeek();S.wkSet=true;}go("rtn");};
async function renderRTN(){var m=document.getElementById("main");if(!m)return;
  if(!S.loaded){m.innerHTML='<div class="loadingDots">Loading…</div>';await loadState();if(view!=="rtn")return;}
  if(!S.me||!S.me.member){m.innerHTML='<button class="backBtn" onclick="go(\'home\')">‹ Back Home</button><div class="card" style="padding:18px;text-align:center"><b>Road to Nationals</b><p style="margin-top:6px;color:var(--muted)">Squad only. Talk to Jake if you should be on it.</p></div>';return;}
  m.innerHTML='<button class="backBtn" onclick="go(\'home\')">‹ Back Home</button><div class="rtn"><div class="wrap" id="rtnApp"></div></div>';
  if(S.squadView)paintSquad();else paint();window.scrollTo(0,0);}
/* coach: the whole squad on one screen, tap a name for their log */
function paintSquad(){var B=S.board||[];var h='<div class="rob"><button onclick="rtnSquad(false)">‹ My training</button><span>Squad · '+B.length+' fighters · weeks 1-3</span></div><div class="card"><div class="top"><div><div class="k">Road to Nationals</div><h2>Who\'s done what</h2></div></div><div class="sum">Training sessions ticked per week (Mon-Thu count, plus sparring days). Tap a fighter for their full log.</div><div class="blocks">'
   +B.map(function(f){var wk=[1,2,3].map(function(w){return (f.logs||[]).filter(function(l){return l.wk===w&&(l.kind==="train"||l.kind==="s"||l.kind==="x");}).length;});var rec=(f.logs||[]).filter(function(l){return l.kind==="rec";}).length;var last=(f.logs||[]).length?(f.logs[f.logs.length-1].at||""):"";
     return '<div class="bk" style="cursor:pointer;grid-template-columns:34px 1fr auto" onclick="rtnOpenFighter(\''+f.user_id+'\')"><div class="n">'+E((f.name||"?")[0])+'</div><div><b>'+E(f.name)+'</b><small>'+rec+' recoveries'+(last?' · last '+new Date(last).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"}):' · nothing logged yet')+'</small></div><div class="w">'+wk.join(" · ")+'<em>w1 · w2 · w3</em></div></div>';}).join("")+'</div></div>';
  var a=rootA();if(a)a.innerHTML=h;}
window.rtnSquad=async function(on){S.squadView=!!on;if(on){S.board=null;await board();}if(S.saved)restoreMe();renderRTN();};
function restoreMe(){if(S.saved){S.me=S.saved.me;S.done=S.saved.done;S.runT=S.saved.runT;S.wk=S.saved.wk;S.day=S.saved.day;S.mode=S.saved.mode;S.saved=null;}S.ro=false;}
window.rtnOpenFighter=async function(uid){var B=await board(),f=B.filter(function(x){return x.user_id===uid;})[0];if(!f)return;
  if(!S.saved)S.saved={me:S.me,done:S.done,runT:S.runT,wk:S.wk,day:S.day,mode:S.mode};
  var done={},runT=null;(f.logs||[]).forEach(function(l){var k=l.kind==="train"?key(l.wk,l.day):key(l.wk,l.day,l.kind);done[k]=true;if(l.kind==="run"&&l.run_secs)runT=l.run_secs;});
  S.me={name:f.name,photo:null,staff:false,member:true};S.done=done;S.runT=runT;S.ro=true;S.mode="train";S.squadView=false;S.fromSquad=true;paint();window.scrollTo(0,0);};
var _render2=window.render;window.render=function(){if(view==="rtn")return renderRTN();return _render2.apply(this,arguments);};
["renderHome"].forEach(function(fn){if(typeof window[fn]!=="function")return;var o=window[fn];window[fn]=function(){var r=o.apply(this,arguments);var after=function(){injectCard();};if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,30);return r;};});
setInterval(function(){try{if(view==="home"&&me()&&S.loaded&&!document.getElementById("rtnCard"))injectCard();}catch(e){}},1000);
/* their old programs: running block / sprint block rows on Home go for the squad */
function sweep(){try{if(!S.me||!S.me.member||S.coach)return;document.querySelectorAll(".rbHome,.mspHome").forEach(function(el){el.remove();});}catch(e){}}
try{var mo=new MutationObserver(sweep);var mainEl=document.getElementById("main");if(mainEl)mo.observe(mainEl,{childList:true,subtree:true});}catch(e){}
S.uid=me();
setInterval(function(){try{var u=me();if(u!==S.uid){var had=S.uid;S.uid=u;if(had!==null||u===null){S.loaded=false;S.coach=false;S.ro=false;S.saved=null;S.board=null;S.wkSet=false;}}if(u&&!S.loaded&&!S.loading){S.loading=true;loadState().then(function(){S.loading=false;sweep();injectCard();});}sweep();}catch(e){}},1500);
})();
