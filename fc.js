/*__FC__*/
(function(){
/* Fight Club tab · locked countdown card on Home, then Camp / Progress / Sparring / Fight Night for fighters and Fighters / Extra Training / Sparring / Camp for Jake & Ali. */
var FC_LOGO="https://www.legacygym.net/cdn/shop/t/28/assets/fightclub-logo.png";
var WHO=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"]; /* Jake, Alison */
function staff(){return !!(session&&session.user&&WHO.indexOf(session.user.id)>=0);}
var E=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
var T=function(m){try{toast(m);}catch(e){}};
var FC={camp:null,me:null,F:null,att:[],wi:[],runs:[],sess:[],pairs:[],rounds:[],vids:[],vnotes:[],notes:[],chk:[],cnotes:[],loaded:false,loading:null,
 tab:"camp",fid:null,sub:"tape",sparSub:"board",buildStep:"list",attSel:null,sparSel:0,vsel:null,
 build:{fid:null,len:180,rest:30,list:[],name:"",note:"",due:""},m:{a:null,b:null,rounds:3,lvl:"Technical",night:null},run:null,timer:null,cd:null};
window.FC=FC;
var css=document.createElement("style");css.textContent=`
@keyframes fcxGlow{0%,100%{box-shadow:0 0 0 0 rgba(241,210,122,0),0 0 0 rgba(201,164,76,0);border-color:#8a7136}50%{box-shadow:0 0 0 3px rgba(241,210,122,.18),0 0 26px 4px rgba(201,164,76,.55);border-color:#F1D27A}}
@keyframes fcxSheen{0%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(260%) skewX(-18deg)}}
@keyframes fcxDraw{to{stroke-dashoffset:0}}
@keyframes fcxSeg{from{opacity:0;transform:scaleY(.2)}to{opacity:1;transform:scaleY(1)}}
@media (prefers-reduced-motion:reduce){.fcxCard,.fcxCard:before,.fcx .draw,.fcx .segs i{animation:none!important}}
.fcxCard{position:relative;overflow:hidden;display:flex;width:100%;text-align:left;border:2px solid #8a7136;border-radius:14px;padding:22px 22px 20px;margin-bottom:14px;color:#f2f0eb;min-height:150px;flex-direction:column;justify-content:flex-end;cursor:pointer;animation:fcxGlow 2.2s ease-in-out infinite;background:linear-gradient(90deg,rgba(13,13,13,.98) 0%,rgba(13,13,13,.96) 52%,rgba(13,13,13,.3) 100%),url("${FC_LOGO}") right 30px center/124px no-repeat #0d0d0d}
.fcxCard:before{content:"";position:absolute;top:0;bottom:0;left:0;width:36%;background:linear-gradient(90deg,transparent,rgba(241,210,122,.10),transparent);animation:fcxSheen 3.4s ease-in-out infinite;pointer-events:none}
.fcxCard>*{position:relative}
.fcxCard .k{font-size:10px;font-weight:700;letter-spacing:3px;color:#F1D27A;text-transform:uppercase;margin-bottom:7px}
.fcxCard .t{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fff;line-height:1.05}
.fcxCard .s{font-size:12px;color:#c9c6be;margin-top:7px;line-height:1.5;padding-right:120px}
.fcxCard .cd{display:inline-flex;gap:6px;margin-top:10px}
.fcxCard .cd div{background:#0b0b0c;border:1px solid #3a3320;border-radius:9px;padding:6px 8px;min-width:46px;text-align:center}
.fcxCard .cd b{display:block;font-family:Oswald,sans-serif;font-size:19px;color:#F1D27A;line-height:1;font-variant-numeric:tabular-nums}
.fcxCard .cd small{display:block;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;color:#9a9891;font-weight:800;margin-top:3px}
.fcxCard .lock{position:absolute;top:12px;right:14px;font-size:9px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#F1D27A;border:1px solid #3a3320;background:rgba(11,11,12,.8);border-radius:999px;padding:4px 9px}
.fcx{--n:#F1D27A}
.fcx .head{display:flex;align-items:center;gap:12px;margin:0 0 12px}.fcx .head img{width:58px;height:auto;flex:none}
.fcx .head .k{font-size:10px;font-weight:900;letter-spacing:3px;color:#c9a44c;text-transform:uppercase}.fcx .head .t{font-family:Oswald,sans-serif;font-size:24px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff;line-height:1}.fcx .head .s{font-size:11px;color:#9a9891;margin-top:3px}
.fcx .pills{display:flex;gap:6px;margin-bottom:12px}.fcx .pills button{flex:1;border:1px solid #26262b;background:#141416;color:#9a9891;border-radius:999px;padding:9px 4px;font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;white-space:nowrap;cursor:pointer}.fcx .pills button.on{background:#2a2410;border-color:#c9a44c;color:#F1D27A}
.fcx .card{background:#121214;border:1px solid #26262b;border-radius:14px;padding:14px;margin-bottom:12px}
.fcx h3{font-family:Oswald,sans-serif;font-weight:600;font-size:15px;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px;color:#fff}
.fcx p{margin:0;font-size:12.5px;line-height:1.55;color:#9a9891}
.fcx .row{display:flex;justify-content:space-between;align-items:center;gap:10px}
.fcx .tag{font-size:9px;font-weight:900;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:#1d1d21;color:#9a9891;white-space:nowrap;display:inline-block}
.fcx .tag.g{background:#2a2410;color:#F1D27A}.fcx .tag.ok{background:#12301f;color:#6fe3a0}.fcx .tag.fc{background:#2e1f12;color:#eda963}.fcx .tag.rd{background:#3a2a2a;color:#ffb3b3}.fcx .tag.bl{background:#1d4fb0;color:#fff}.fcx .tag.wn{background:#3a2a12;color:#f0c38a}
.fcx .tag.ntag{background:color-mix(in srgb,var(--n) 16%,#0b0b0c);color:var(--n);border:1px solid color-mix(in srgb,var(--n) 40%,transparent)}
.fcx .fr{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #26262b;width:100%;text-align:left;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;cursor:pointer}.fcx .fr:first-of-type{border-top:0;padding-top:2px}
.fcx .av{width:38px;height:38px;border-radius:50%;background:#26262b;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#F1D27A;flex:none;border:1px solid #33332f;overflow:hidden}.fcx .av img{width:100%;height:100%;object-fit:cover}
.fcx .fr .n{flex:1;min-width:0}.fcx .fr .n b{display:block;font-size:13px;color:#f2f0eb}.fcx .fr .n span{font-size:11px;color:#9a9891}
.fcx .rec{font-family:Oswald,sans-serif;font-size:15px;color:#fff;letter-spacing:1px;white-space:nowrap;text-align:right;line-height:1}.fcx .rec small{display:block;font-family:Inter,Montserrat,sans-serif;font-size:9px;color:#9a9891;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin-top:3px}
.fcx .search,.fcx .txt,.fcx select.txt{width:100%;box-sizing:border-box;background:#0b0b0c;border:1px solid #26262b;border-radius:10px;padding:10px 12px;font-size:13px;color:#f2f0eb;font:inherit}
.fcx textarea.txt{resize:none;min-height:56px}
.fcx .gold{width:100%;padding:13px;border-radius:9px;background:#c9a44c;color:#161307;font-weight:800;font-size:12px;letter-spacing:2.5px;text-transform:uppercase;border:0;cursor:pointer}
.fcx .gold:disabled{opacity:.55}
.fcx .line{width:100%;padding:11px;border-radius:9px;border:1px solid #3a3320;background:none;color:#F1D27A;font-weight:800;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer}
.fcx .sm{border:1px solid #3a3320;background:none;color:#F1D27A;border-radius:999px;padding:6px 11px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;white-space:nowrap;cursor:pointer}.fcx .sm.on{background:#4bc97a;border-color:#4bc97a;color:#06110a}.fcx .sm.x{border-color:#3a2a2a;color:#ffb3b3}
.fcx .lbl{display:block;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#9a9891;margin:12px 0 6px}.fcx .lbl:first-child{margin-top:0}
.fcx .seg{display:flex;gap:6px}.fcx .seg button{flex:1;border:1px solid #26262b;background:#0b0b0c;border-radius:8px;padding:8px 4px;font-family:Oswald,sans-serif;font-size:12px;color:#9a9891;cursor:pointer}.fcx .seg button.on{background:#c9a44c;border-color:#c9a44c;color:#161307}
.fcx .two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fcx .tape{background:linear-gradient(180deg,#17150f,#121214);border:1px solid #3a3320;border-radius:16px;padding:16px 14px 14px;margin-bottom:12px;position:relative;overflow:hidden}
.fcx .tape:after{content:"";position:absolute;right:-20px;top:-20px;width:150px;height:114px;background:url("${FC_LOGO}") center/contain no-repeat;opacity:.08}
.fcx .tape .top{display:flex;gap:12px;align-items:center}.fcx .tape .av{width:64px;height:64px;font-size:20px;border:2px solid #c9a44c}
.fcx .tape .nm{font-family:Oswald,sans-serif;font-size:22px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#fff;line-height:1.05}.fcx .tape .sub{font-size:11px;color:#9a9891;margin-top:4px}
.fcx .tot{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:14px}.fcx .tot div{background:#0b0b0c;border:1px solid #26262b;border-radius:10px;padding:8px 4px;text-align:center}
.fcx .tot b{display:block;font-family:Oswald,sans-serif;font-size:19px;color:#fff;line-height:1;font-variant-numeric:tabular-nums}.fcx .tot b small{font-size:10px;color:#9a9891;font-weight:500;margin-left:1px}
.fcx .tot span{display:block;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:#9a9891;font-weight:800;margin-top:4px}.fcx .tot .un b{color:#9a9891;font-size:13px;padding-top:3px}
.fcx .kv{display:flex;justify-content:space-between;align-items:center;font-size:12px;padding:7px 0;border-top:1px solid #26262b}.fcx .kv:first-of-type{border-top:0}.fcx .kv span{color:#9a9891}.fcx .kv b{color:#f2f0eb;font-weight:600}
.fcx .kv input,.fcx .kv select{background:#0b0b0c;border:1px solid #26262b;border-radius:7px;padding:5px 8px;font-size:12px;width:130px;text-align:right;color:#f2f0eb;font:inherit}
.fcx .hero{background:linear-gradient(180deg,#17150f,#121214);border:1px solid #3a3320;border-radius:16px;padding:14px;margin-bottom:12px;position:relative;overflow:hidden}
.fcx .hero:after{content:"";position:absolute;right:-24px;top:-18px;width:150px;height:114px;background:url("${FC_LOGO}") center/contain no-repeat;opacity:.07}
.fcx .hero .k{font-size:10px;font-weight:900;letter-spacing:3px;color:#c9a44c;text-transform:uppercase}.fcx .hero .t{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fff;line-height:1;margin-top:3px}.fcx .hero .s{font-size:11.5px;color:#9a9891;margin-top:5px}
.fcx .hero .cd{display:flex;gap:6px;margin-top:12px}.fcx .hero .cd div{flex:1;background:#0b0b0c;border:1px solid #26262b;border-radius:10px;padding:8px 4px;text-align:center}
.fcx .hero .cd b{display:block;font-family:Oswald,sans-serif;font-size:20px;color:#fff;line-height:1;font-variant-numeric:tabular-nums}.fcx .hero .cd small{display:block;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:#9a9891;font-weight:800;margin-top:4px}
.fcx .wkbar{display:grid;grid-template-columns:repeat(10,1fr);gap:3px;margin:8px 0 6px}.fcx .wkbar div{height:24px;border-radius:5px;background:#1d1d21;border:1px solid #26262b;display:flex;align-items:center;justify-content:center;font-family:Oswald,sans-serif;font-size:11px;color:#6f6d66}
.fcx .wkbar div.done{background:#2a2410;border-color:#3a3320;color:#F1D27A}.fcx .wkbar div.now{background:#c9a44c;border-color:#c9a44c;color:#161307}.fcx .wkbar div.fn{border-color:#5a3a1a;color:#eda963}
.fcx .phases{display:flex;justify-content:space-between;font-size:9px;letter-spacing:1px;text-transform:uppercase;color:#9a9891;font-weight:800}
.fcx .sessRow{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #26262b}.fcx .sessRow:first-of-type{border-top:0;padding-top:2px}
.fcx .sessRow .d{width:40px;text-align:center;font-family:Oswald,sans-serif;line-height:1;flex:none}.fcx .sessRow .d b{display:block;font-size:17px;color:#fff}.fcx .sessRow .d small{font-size:8.5px;letter-spacing:1.5px;color:#9a9891;text-transform:uppercase;font-weight:800}
.fcx .sessRow .n{flex:1;min-width:0}.fcx .sessRow .n b{display:block;font-size:12.5px;color:#f2f0eb}.fcx .sessRow .n span{font-size:10.5px;color:#9a9891}.fcx .sessRow .n b.x{color:#eda963}
.fcx .feed{display:flex;gap:10px;padding:10px 0;border-top:1px solid #26262b}.fcx .feed:first-of-type{border-top:0;padding-top:2px}.fcx .feed .av{width:30px;height:30px;font-size:10px}
.fcx .feed .b{flex:1;font-size:12.5px;line-height:1.45;color:#f2f0eb}.fcx .feed .b small{display:block;font-size:10px;color:#9a9891;margin-top:2px;font-weight:700}
.fcx .gph{position:relative;overflow:hidden;background:radial-gradient(120% 90% at 50% 110%,color-mix(in srgb,var(--n) 14%,transparent),transparent 60%),#121214;border-color:color-mix(in srgb,var(--n) 28%,#26262b)}
.fcx .gph .gk{font-size:9.5px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;color:var(--n);text-shadow:0 0 12px color-mix(in srgb,var(--n) 60%,transparent)}
.fcx .gph .gb{font-family:Oswald,sans-serif;font-size:30px;font-weight:700;color:#fff;line-height:1;margin-top:4px;font-variant-numeric:tabular-nums;text-shadow:0 0 18px color-mix(in srgb,var(--n) 45%,transparent)}.fcx .gph .gb small{font-family:Inter,Montserrat,sans-serif;font-size:11px;color:#9a9891;font-weight:600;margin-left:3px}
.fcx .chart{width:100%;height:136px;display:block;margin-top:8px}.fcx .chart.gauge{height:178px;margin-top:0}
.fcx .chart .draw{stroke-dasharray:1200;stroke-dashoffset:1200;animation:fcxDraw 1.6s ease-out forwards}
.fcx .tip{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#0b0b0c;border:1px solid color-mix(in srgb,var(--n) 30%,#26262b);border-radius:10px;padding:9px 11px;margin-top:8px;font-size:12px}
.fcx .tip b{display:block;color:#fff;font-size:12.5px}.fcx .tip span{font-size:11px;color:#9a9891;line-height:1.4}.fcx .tip.dimtip{justify-content:center;border-style:dashed;color:#9a9891}
.fcx .segs{display:flex;gap:4px;margin-top:10px}.fcx .segs i{flex:1;height:14px;border-radius:4px;background:#1a1a1e;border:1px solid #26262b;display:block}
.fcx .segs i.on{background:linear-gradient(180deg,var(--n),color-mix(in srgb,var(--n) 55%,#000));border-color:var(--n);box-shadow:0 0 10px color-mix(in srgb,var(--n) 70%,transparent);animation:fcxSeg .5s ease-out both;animation-delay:var(--d)}
.fcx .segl{display:flex;justify-content:space-between;font-size:10px;color:#9a9891;font-weight:700;letter-spacing:.5px;margin-top:6px}.fcx .segl span:first-child{color:var(--n)}
.fcx .night{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:10px;width:100%;text-align:left;border:1px solid transparent;background:none;color:inherit;cursor:pointer}.fcx .night.sel{background:color-mix(in srgb,var(--n) 8%,#0b0b0c);border-color:color-mix(in srgb,var(--n) 35%,transparent)}.fcx .night.next{opacity:.6}
.fcx .night .nd{width:36px;text-align:center;font-family:Oswald,sans-serif;line-height:1;flex:none}.fcx .night .nd b{display:block;font-size:17px;color:#fff}.fcx .night .nd small{font-size:8.5px;letter-spacing:1.5px;color:#9a9891;text-transform:uppercase;font-weight:800}
.fcx .night .nr{display:flex;gap:4px;flex:none}.fcx .night .nr i{width:14px;height:22px;border-radius:4px;background:linear-gradient(180deg,var(--n),color-mix(in srgb,var(--n) 55%,#000));box-shadow:0 0 8px color-mix(in srgb,var(--n) 70%,transparent);display:block}.fcx .night .nr i.ghost{background:#1a1a1e;border:1px dashed #3a3a40;box-shadow:none}
.fcx .night .nn{flex:1;min-width:0}.fcx .night .nn b{display:block;font-size:12.5px;color:#fff}.fcx .night .nn span{font-size:10.5px;color:#9a9891}
.fcx .scale{display:flex;gap:6px}.fcx .scale button{flex:1;border:1px solid #26262b;background:#0b0b0c;border-radius:8px;padding:9px 0;font-family:Oswald,sans-serif;font-size:13px;color:#9a9891;cursor:pointer}.fcx .scale button.on{background:#c9a44c;border-color:#c9a44c;color:#161307}
.fcx .vs{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin-top:10px}.fcx .vs .f{text-align:center}.fcx .vs .f .av{margin:0 auto 6px;width:54px;height:54px;font-size:16px;border:2px solid #c9a44c}
.fcx .vs .f b{display:block;font-family:Oswald,sans-serif;font-size:15px;letter-spacing:.5px;text-transform:uppercase;color:#fff;line-height:1.1}.fcx .vs .f span{display:block;font-size:10.5px;color:#9a9891;margin-top:3px}.fcx .vs .amp{font-family:Oswald,sans-serif;font-size:22px;color:#c9a44c}
.fcx .sealed{border:1px dashed #3a3320;border-radius:12px;padding:16px;text-align:center}.fcx .sealed b{display:block;font-family:Oswald,sans-serif;font-size:18px;letter-spacing:1.5px;text-transform:uppercase;color:#fff}
.fcx .chk{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid #26262b;width:100%;text-align:left;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;cursor:pointer}.fcx .chk:first-of-type{border-top:0}
.fcx .chk .box{width:22px;height:22px;border-radius:6px;border:1.5px solid #3a3a40;flex:none;display:flex;align-items:center;justify-content:center;font-size:12px;color:#161307}.fcx .chk.on .box{background:#4bc97a;border-color:#4bc97a}
.fcx .chk .n{flex:1;font-size:12.5px;color:#f2f0eb}.fcx .chk .n span{display:block;font-size:10.5px;color:#9a9891}.fcx .chk.on .n{color:#9a9891;text-decoration:line-through}
.fcx .fcard{background:#0b0b0c;border:1px solid #3a3320;border-radius:14px;padding:14px;position:relative;overflow:hidden;text-align:center}.fcx .fcard:before{content:"";position:absolute;inset:0;background:url("${FC_LOGO}") center 18px/110px no-repeat;opacity:.1}.fcx .fcard>*{position:relative}
.fcx .fcard .k{font-size:9px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#c9a44c}.fcx .fcard .nm{font-family:Oswald,sans-serif;font-size:26px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#fff;line-height:1;margin-top:34px}.fcx .fcard .s{font-size:11px;color:#9a9891;margin-top:4px}.fcx .fcard .tot{grid-template-columns:repeat(3,1fr)}
.fcx .attn{display:flex;gap:10px;align-items:center;padding:9px 0;border-top:1px solid #26262b;width:100%;text-align:left;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;cursor:pointer}.fcx .attn:first-of-type{border-top:0;padding-top:2px}.fcx .attn .n{flex:1}.fcx .attn .n b{display:block;font-size:12.5px;color:#f2f0eb}.fcx .attn .n span{font-size:11px;color:#f0c38a}
.fcx .flag{display:flex;gap:8px;align-items:flex-start;padding:8px 10px;border-radius:9px;background:rgba(224,82,82,.08);border:1px solid #4a2626;font-size:11.5px;line-height:1.45;margin-bottom:12px;color:#f2f0eb}.fcx .flag b{color:#ffb3b3;font-family:Oswald,sans-serif;letter-spacing:1px;font-size:11px;white-space:nowrap}
.fcx .lib summary{cursor:pointer;list-style:none;font-family:Oswald,sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#c9a44c;padding:10px 0;border-top:1px solid #26262b;display:flex;justify-content:space-between}.fcx .lib summary::-webkit-details-marker{display:none}.fcx .lib summary:after{content:"+";color:#9a9891}.fcx .lib[open] summary:after{content:"–"}.fcx .lib:first-of-type summary{border-top:0}
.fcx .chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 0 10px}.fcx .chip{border:1px solid #26262b;background:#0b0b0c;color:#f2f0eb;border-radius:999px;padding:7px 11px;font-size:11.5px;cursor:pointer}
.fcx .rnd{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #26262b}.fcx .rnd:first-of-type{border-top:0}.fcx .rnd .num{font-family:Oswald,sans-serif;color:#F1D27A;font-size:13px;width:22px;flex:none}
.fcx .rnd .n{flex:1;min-width:0}.fcx .rnd .n b{display:block;font-size:12.5px;color:#f2f0eb}.fcx .rnd .n span{font-size:10.5px;color:#9a9891}.fcx .rnd .len{font-family:Oswald,sans-serif;font-size:12px;color:#9a9891;white-space:nowrap}.fcx .rnd .rm{color:#e05252;font-size:16px;padding:0 4px;background:none;border:0;cursor:pointer}
.fcx .sess{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #26262b;width:100%;text-align:left;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;cursor:pointer}.fcx .sess:first-of-type{border-top:0;padding-top:2px}
.fcx .sess .n{flex:1;min-width:0}.fcx .sess .n b{display:block;font-size:13px;color:#f2f0eb}.fcx .sess .n span{font-size:11px;color:#9a9891}.fcx .prog{height:6px;background:#1d1d21;border-radius:999px;overflow:hidden;margin-top:6px}.fcx .prog i{display:block;height:100%;background:linear-gradient(90deg,#c9a44c,#F1D27A)}
.fcx .timer{text-align:center;padding:18px 10px 12px}.fcx .timer .ph{font-size:10px;font-weight:900;letter-spacing:3px;text-transform:uppercase;color:#c9a44c}.fcx .timer .big{font-family:Oswald,sans-serif;font-size:60px;font-weight:700;color:#fff;line-height:1;margin:6px 0;font-variant-numeric:tabular-nums}.fcx .timer .what{font-family:Oswald,sans-serif;font-size:18px;letter-spacing:1.5px;text-transform:uppercase;color:#F1D27A}.fcx .timer .sub{font-size:11px;color:#9a9891;margin-top:4px}
.fcx .pair{display:flex;align-items:center;gap:8px;padding:10px 0;border-top:1px solid #26262b}.fcx .pair:first-of-type{border-top:0;padding-top:2px}.fcx .pair .p{flex:1;min-width:0;font-size:12.5px;font-weight:700;color:#f2f0eb}.fcx .pair .p.r{text-align:right}.fcx .pair .p span{display:block;font-size:10.5px;color:#9a9891;font-weight:500}.fcx .pair .amp{font-family:Oswald,sans-serif;color:#c9a44c;font-size:15px}
.fcx .match{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center;margin:6px 0 10px}.fcx .match .amp{font-family:Oswald,sans-serif;color:#c9a44c;font-size:18px}
.fcx .fit{font-size:11px;padding:8px 10px;border-radius:9px;background:#0b0b0c;border:1px solid #26262b;color:#9a9891;line-height:1.5}.fcx .fit.ok{border-color:#1f4a30;color:#8fe3b0}.fcx .fit.warn{border-color:#5a3a1a;color:#f0c38a}
.fcx video{width:100%;border-radius:12px;background:#000;display:block;aspect-ratio:16/9}
.fcx .tl{position:relative;height:26px;margin:10px 0 4px}.fcx .tl .bar{position:absolute;left:0;right:0;top:11px;height:4px;background:#26262b;border-radius:999px}.fcx .tl .fill{position:absolute;left:0;top:11px;height:4px;background:#c9a44c;border-radius:999px}
.fcx .tl .pin{position:absolute;top:5px;width:16px;height:16px;border-radius:50%;background:#F1D27A;border:2px solid #0b0b0c;transform:translateX(-50%);font-size:8px;font-weight:900;color:#161307;display:flex;align-items:center;justify-content:center;pointer-events:none}
.fcx .note{display:flex;gap:10px;padding:9px 0;border-top:1px solid #26262b;align-items:flex-start;width:100%;text-align:left;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;cursor:pointer}.fcx .note:first-of-type{border-top:0}
.fcx .note .t{font-family:Oswald,sans-serif;color:#F1D27A;font-size:13px;width:40px;flex:none;padding-top:1px;font-variant-numeric:tabular-nums}.fcx .note .b{flex:1;font-size:12.5px;line-height:1.45;color:#f2f0eb}.fcx .note .b small{display:block;font-size:10px;color:#9a9891;margin-top:2px;font-weight:700;letter-spacing:.5px}
.fcx .up{border:1px dashed #3a3320;border-radius:12px;padding:14px;text-align:center;color:#9a9891;font-size:12px;line-height:1.5;display:block;cursor:pointer}.fcx .up b{display:block;color:#F1D27A;font-family:Oswald,sans-serif;letter-spacing:1.5px;text-transform:uppercase;font-size:13px;margin-bottom:2px}
.fcx .attg{display:grid;grid-template-columns:34px repeat(3,1fr);gap:5px;align-items:center;margin-top:6px}.fcx .attg .w{font-family:Oswald,sans-serif;font-size:11px;color:#9a9891;letter-spacing:1px}
.fcx .attg button{height:30px;border-radius:7px;border:1px solid #26262b;background:#17171b;color:#6f6d66;font-family:Oswald,sans-serif;font-size:11px;cursor:pointer}.fcx .attg button.on{background:#F1D27A;border-color:#F1D27A;color:#161307}.fcx .attg button.miss{background:#3a2a2a;border-color:#7a3a3a;color:#ffb3b3}
.fcx .dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#1d4fb0;margin-left:5px;vertical-align:middle}
.fcx .back{background:none;border:0;color:#c9a44c;font-weight:800;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:0 0 10px;display:block;cursor:pointer}
`;document.head.appendChild(css);

/* ---------- dates & camp ---------- */
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function pd(s){var p=String(s).slice(0,10).split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function fmtD(s){return pd(s).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"});}
function campStart(){return pd((FC.camp&&FC.camp.start_date)||"2026-10-12");}
function fightDate(){return pd((FC.camp&&FC.camp.fight_date)||"2026-12-19");}
function opensAt(){return new Date((FC.camp&&FC.camp.opens_at)||"2026-09-25T16:00:00+10:00");}
function isOpen(){return Date.now()>=opensAt().getTime();}
function weekOf(d){var n=Math.floor((d-campStart())/864e5);return n<0?0:Math.min(10,Math.floor(n/7)+1);}
function WEEK(){return weekOf(new Date());}
function daysToFight(){return Math.max(0,Math.ceil((fightDate()-new Date())/864e5));}
var PHASE=["Foundations","Foundations","Build","Build","Build","Sparring","Sparring","Sparring","Sharpen","Fight week"];
var DAYLBL=["Boxing + S&C","Pads & technique","Sparring night"];
function sessDate(w,d){var x=new Date(campStart());x.setDate(x.getDate()+(w-1)*7+d);return x;}
function fmt(s){s=Math.max(0,Math.round(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0");}
function ini(f){return ((f.first_name||"")[0]||"")+((f.last_name||"")[0]||"");}
function full(f){return ((f.first_name||"")+" "+(f.last_name||"")).trim();}
function short(f){return (f.first_name||"")+" "+((f.last_name||"")[0]?((f.last_name||"")[0]+"."):"");}
function av(f,cls){return '<div class="av '+(cls||"")+'">'+(f.photo_url?'<img src="'+E(f.photo_url)+'" alt="">':E(ini(f).toUpperCase()))+'</div>';}
function byId(id){return (FC.F||[]).find(function(f){return f.id===id;})||null;}
function canEnter(){return staff()||(isOpen()&&!!FC.me);}
/* ---------- extra-training library (Build Your Own + road work) ---------- */
var ROAD=[{id:"rwEasy",n:"Easy 4 km",tag:"Conversation pace",fixed:1500},{id:"rwInt",n:"Intervals 8 × 400 m",tag:"Fight-pace efforts",fixed:1200},{id:"rwHill",n:"Hill repeats × 8",tag:"Legs for the late rounds",fixed:1200},{id:"rwLong",n:"Long run 8 km",tag:"Steady, nose-breathing",fixed:2700}];
function LIB(){var out=[];try{(BYO_LIB||[]).forEach(function(c){out.push({cat:c.cat.replace(/ — .*$/,""),items:c.items});});}catch(e){}out.push({cat:"Road work",items:ROAD});return out;}
function libFind(id){var r=ROAD.find(function(x){return x.id===id;});if(r)return r;try{return byoFind(id);}catch(e){return null;}}
function itemLen(it,len){return it.fixed||(it.core?60:len);}
/* ---------- load ---------- */
function load(force){
  if(FC.loading&&!force)return FC.loading;
  FC.loading=(async function(){
    try{
      var c=await sb.from("fc_camps").select("*").eq("key","fc2026").maybeSingle();FC.camp=c.data||null;
      if(!session||!session.user){FC.loaded=true;return;}
      if(staff()){
        var r=await Promise.all([
          sb.from("fc_fighters").select("*").eq("camp","fc2026").eq("status","active").order("last_name"),
          sb.from("fc_attendance").select("*").eq("camp","fc2026"),
          sb.from("fc_weighins").select("*").eq("camp","fc2026").order("week"),
          sb.from("fc_runs").select("*").eq("camp","fc2026").order("run_date"),
          sb.from("fc_sessions").select("*").eq("camp","fc2026").order("created_at",{ascending:false}),
          sb.from("fc_spar_pairs").select("*").eq("camp","fc2026").order("night_date"),
          sb.from("fc_spar_rounds").select("*").eq("camp","fc2026").order("night_date"),
          sb.from("fc_videos").select("*").eq("camp","fc2026").order("created_at",{ascending:false}),
          sb.from("fc_video_notes").select("*").order("t_sec"),
          sb.from("fc_notes").select("*").eq("camp","fc2026").order("created_at",{ascending:false}).limit(30),
          sb.from("fc_checklist").select("*").eq("camp","fc2026"),
          sb.from("fc_coach_notes").select("*").order("created_at",{ascending:false})]);
        FC.F=r[0].data||[];FC.att=r[1].data||[];FC.wi=r[2].data||[];FC.runs=r[3].data||[];FC.sess=r[4].data||[];FC.pairs=r[5].data||[];FC.rounds=r[6].data||[];FC.vids=r[7].data||[];FC.vnotes=r[8].data||[];FC.notes=r[9].data||[];FC.chk=r[10].data||[];FC.cnotes=r[11].data||[];
        FC.me=null;
      }else{
        var lk=await sb.rpc("fc_link_me");var myId=lk.data||null;
        if(myId){
          var r2=await Promise.all([
            sb.from("fc_fighters").select("*").eq("id",myId).maybeSingle(),
            sb.from("fc_roster").select("*").eq("camp","fc2026").order("last_name"),
            sb.from("fc_attendance").select("*").eq("fighter_id",myId),
            sb.from("fc_weighins").select("*").eq("fighter_id",myId).order("week"),
            sb.from("fc_runs").select("*").eq("fighter_id",myId).order("run_date"),
            sb.from("fc_sessions").select("*").eq("fighter_id",myId).order("created_at",{ascending:false}),
            sb.from("fc_spar_pairs").select("*").eq("camp","fc2026").order("night_date"),
            sb.from("fc_spar_rounds").select("*").eq("fighter_id",myId).order("night_date"),
            sb.from("fc_videos").select("*").eq("fighter_id",myId).order("created_at",{ascending:false}),
            sb.from("fc_video_notes").select("*").order("t_sec"),
            sb.from("fc_notes").select("*").eq("camp","fc2026").order("created_at",{ascending:false}).limit(30),
            sb.from("fc_checklist").select("*").eq("fighter_id",myId)]);
          FC.me=r2[0].data||null;FC.F=r2[1].data||[];if(FC.me&&!FC.F.some(function(x){return x.id===FC.me.id;}))FC.F.push(FC.me);
          FC.att=r2[2].data||[];FC.wi=r2[3].data||[];FC.runs=r2[4].data||[];FC.sess=r2[5].data||[];FC.pairs=r2[6].data||[];FC.rounds=r2[7].data||[];FC.vids=r2[8].data||[];FC.vnotes=r2[9].data||[];FC.notes=r2[10].data||[];FC.chk=r2[11].data||[];
        }else{FC.me=null;FC.F=[];}
      }
    }catch(e){console.warn("FC load",e);}
    FC.loaded=true;
  })();
  return FC.loading;
}
/* ---------- per-fighter numbers ---------- */
function attOf(f){var a=[];for(var w=1;w<=10;w++){var row=[];for(var d=0;d<3;d++){var x=FC.att.find(function(r){return r.fighter_id===f.id&&r.week===w&&r.day===d;});row.push(x?(x.attended?1:0):null);}a.push(row);}return a;}
function attN(f){return FC.att.filter(function(r){return r.fighter_id===f.id&&r.attended;}).length;}
function attLogged(f){return FC.att.filter(function(r){return r.fighter_id===f.id;}).length;}
function wiOf(f){return FC.wi.filter(function(r){return r.fighter_id===f.id&&r.weight_kg!=null;}).sort(function(a,b){return a.week-b.week;});}
function kmByWeek(f){var k=[];FC.runs.filter(function(r){return r.fighter_id===f.id;}).forEach(function(r){var w=Math.max(1,weekOf(pd(r.run_date)));k[w-1]=(k[w-1]||0)+Number(r.km);});for(var i=0;i<Math.max(1,WEEK());i++)k[i]=+((k[i]||0).toFixed(1));return k;}
function kmN(f){return +FC.runs.filter(function(r){return r.fighter_id===f.id;}).reduce(function(a,r){return a+Number(r.km);},0).toFixed(1);}
function roundsOf(f){return FC.rounds.filter(function(r){return r.fighter_id===f.id;});}
function nightsOf(f){var m={};roundsOf(f).forEach(function(r){var k=r.night_date;if(!m[k])m[k]={d:k,r:0,v:r.opponent_id,lvl:r.level,notes:[]};m[k].r++;if(r.note)m[k].notes.push("R"+(r.round_no||m[k].r)+": "+r.note);});return Object.values(m).sort(function(a,b){return a.d<b.d?-1:1;});}
function sessOf(f){return FC.sess.filter(function(s){return s.fighter_id===f.id;});}
function pairsOf(f){return FC.pairs.filter(function(p){return p.a_id===f.id||p.b_id===f.id;});}
function vidsOf(f){return FC.vids.filter(function(v){return v.fighter_id===f.id;});}
function vnotesOf(v){return FC.vnotes.filter(function(n){return n.video_id===v.id;});}
function chkOf(f,key){var x=FC.chk.find(function(c){return c.fighter_id===f.id&&c.item_key===key;});return !!(x&&x.done);}
function lastWi(f){var w=wiOf(f);return w.length?w[w.length-1]:null;}
var CHECK=[["medical","Medical clearance form","Handed in by Fri 27 Nov"],["mouthguard","Mouthguard fitted","Front desk has the kit"],["weighin","Weigh-in · Fri 18 Dec 5 pm","At the gym"],["tickets","Tickets for your people","On sale Mon 23 Nov"],["walkout","Walkout song picked","Below"]];
/* ---------- home card (locked countdown) ---------- */
function cdParts(){var s=Math.max(0,(opensAt().getTime()-Date.now())/1e3);var d=Math.floor(s/864e2);s-=d*864e2;var h=Math.floor(s/3600);s-=h*3600;var m=Math.floor(s/60);s-=m*60;return [d,h,m,Math.floor(s)];}
function cardHtml(){
  var open=isOpen(),p=cdParts();
  var lock=staff()?'<span class="lock">Staff preview</span>':(open?'':'<span class="lock">Locked</span>');
  var sub=open?(FC.me?"Your camp, your sessions, your sparring, your fight.":"Fighter profiles, extra training, sparring & fight night."):"This tab opens "+opensAt().toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})+" at "+opensAt().toLocaleTimeString("en-AU",{hour:"numeric",minute:"2-digit"}).replace(":00","")+". Fighter profiles, extra training, sparring & fight night — all in here.";
  var cd=open?'':'<div class="cd" id="fcxCd"><div><b>'+p[0]+'</b><small>days</small></div><div><b>'+String(p[1]).padStart(2,"0")+'</b><small>hrs</small></div><div><b>'+String(p[2]).padStart(2,"0")+'</b><small>min</small></div><div><b>'+String(p[3]).padStart(2,"0")+'</b><small>sec</small></div></div>';
  return '<button class="fcxCard" id="fcxCard" onclick="fcxEnter()">'+lock+'<div class="k">The Ultimate 10-Week Challenge</div><div class="t">Fight Club</div><div class="s">'+sub+'</div>'+cd+'</button>';
}
function tickCd(){if(view==="home"&&!document.getElementById("fcxCard"))injectCard();var el=document.getElementById("fcxCd");if(!el){return;}var p=cdParts();var b=el.querySelectorAll("b");if(b.length===4){b[0].textContent=p[0];b[1].textContent=String(p[1]).padStart(2,"0");b[2].textContent=String(p[2]).padStart(2,"0");b[3].textContent=String(p[3]).padStart(2,"0");}}
function injectCard(){
  var main=document.getElementById("main");if(!main||view!=="home")return;
  if(document.getElementById("fcxCard"))return;
  var wrap=document.createElement("div");wrap.innerHTML=cardHtml();var card=wrap.firstChild;
  var cards=main.querySelectorAll(".homeCard");var anchor=null;
  for(var i=0;i<cards.length;i++){if((cards[i].getAttribute("onclick")||"").indexOf("'boxing'")>=0){anchor=cards[i];break;}}
  if(anchor)anchor.insertAdjacentElement("afterend",card);else if(cards.length)cards[0].insertAdjacentElement("beforebegin",card);else main.appendChild(card);
  if(!FC.cd)FC.cd=setInterval(tickCd,1000);
}
window.fcxEnter=function(){
  if(!session){T("Sign in first");return;}
  if(!FC.loaded){T("One sec…");load().then(function(){window.fcxEnter();});return;}
  if(canEnter()){FC.tab=staff()?"fighters":"camp";FC.fid=null;FC.sub="tape";go("fc");return;}
  if(!isOpen()){T("Fight Club opens "+opensAt().toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"short"})+" — hang tight.");return;}
  T("Fight Club is for registered fighters. Register at legacygym.net/pages/fight-club");
};

/* ---------- render shell ---------- */
function R(){if(view==="fc")renderFC();else if(view==="fcrun")renderRun();}
window.fcxSet=function(k,v){FC[k]=v;if(k==="tab"){if(staff())FC.fid=null;FC.sub="tape";}R();try{window.scrollTo(0,0);}catch(e){}};
window.fcxSub=function(s){FC.sub=s;R();};
window.fcxOpen=function(id){if(staff())FC.tab="fighters";FC.fid=id;FC.sub="tape";FC.attSel=null;FC.sparSel=0;R();try{window.scrollTo(0,0);}catch(e){}};
function renderFC(){
  var main=$("main");
  if(!FC.loaded){main.innerHTML='<div class="fcx"><button class="back" onclick="go(\'home\')">‹ Home</button><div class="card"><p>Loading Fight Club…</p></div></div>';load().then(function(){if(view==="fc")renderFC();});return;}
  if(!canEnter()){go("home");return;}
  var tabs=staff()?[["fighters","Fighters"],["progress","Progress"],["train","Extra Training"],["spar","Sparring"],["camp","Camp"]]:[["camp","Camp"],["progress","Progress"],["spar","Sparring"],["fight","Fight Night"]];
  var w=WEEK();
  var newVid=!staff()&&FC.me&&vidsOf(FC.me).some(function(v){return !v.seen_at;});
  var html='<div class="fcx"><button class="back" onclick="go(\'home\')">‹ Home</button>'+
   '<div class="head"><img src="'+FC_LOGO+'" alt=""><div><div class="k">Legacy Gym Central Coast</div><div class="t">Fight Club</div><div class="s">'+(w===0?"Camp starts "+fmtD(iso(campStart())):"Week "+w+" of 10 · "+PHASE[w-1])+' · fight night '+fmtD(iso(fightDate()))+'</div></div></div>'+
   '<div class="pills">'+tabs.map(function(t){return '<button class="'+(FC.tab===t[0]?"on":"")+'" onclick="fcxSet(\'tab\',\''+t[0]+'\')">'+t[1]+(t[0]==="spar"&&newVid?'<span class="dot"></span>':'')+'</button>';}).join("")+'</div>';
  var body="";
  try{
    if(staff()){body=FC.tab==="fighters"?fightersHtml():FC.tab==="progress"?progressStaffHtml():FC.tab==="train"?trainHtml():FC.tab==="spar"?sparStaffHtml():campStaffHtml();}
    else{body=FC.tab==="camp"?campHtml():FC.tab==="progress"?progressHtml():FC.tab==="spar"?sparHtml():fightHtml();}
  }catch(e){console.error(e);body='<div class="card"><p>Something went wrong loading this bit. Pull down to refresh.</p></div>';}
  main.innerHTML=html+body+'</div>';
  afterRender();
}
function weekBar(){var w=WEEK();return '<div class="wkbar">'+[1,2,3,4,5,6,7,8,9,10].map(function(i){return '<div class="'+(i<w?"done":i===w?"now":i===10?"fn":"")+'">'+i+'</div>';}).join("")+'</div><div class="phases"><span>Foundations</span><span>Build</span><span>Sparring</span><span>Fight</span></div>';}
/* ========== FIGHTER · CAMP ========== */
function campHtml(){
  var f=FC.me,w=WEEK(),my=sessOf(f),a=attOf(f);
  var trainedTonight=null;
  var h='<div class="hero"><div class="k">'+(f.camp_number>1?"Camp "+f.camp_number:"Your first camp")+'</div><div class="t">'+(w===0?"Pre-camp":"Week "+w+" · "+PHASE[w-1])+'</div><div class="s">'+(w===0?"Mon / Tue / Wed 6:45 pm from "+fmtD(iso(campStart())):(w===6?"Sparring opens this week.":"Mon · Tue · Wed 6:45 pm"))+'</div>'+weekBar()+
   '<div class="cd"><div><b>'+daysToFight()+'</b><small>days to go</small></div><div><b>'+attN(f)+'<span style="font-size:11px;color:#9a9891">/'+Math.max(0,w*3)+'</span></b><small>sessions</small></div><div><b>'+roundsOf(f).length+'</b><small>spar rounds</small></div><div><b>'+kmN(f)+'<span style="font-size:11px;color:#9a9891">km</span></b><small>run</small></div></div></div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">This week</h3><span class="tag g">Mon · Tue · Wed 6:45 pm</span></div>';
  if(w>=1){for(var d=0;d<3;d++){var dt=sessDate(w,d);var st=a[w-1][d];h+='<div class="sessRow"><div class="d"><b>'+dt.getDate()+'</b><small>'+dt.toLocaleDateString("en-AU",{weekday:"short"})+'</small></div><div class="n"><b>'+(d===2&&w>=6?"Sparring night":"Fight Club session")+'</b><span>'+DAYLBL[d]+'</span></div>'+(st===1?'<span class="tag ok">Trained</span>':st===0?'<span class="tag rd">Missed</span>':'<span class="tag">'+(dt<new Date()?"—":"Upcoming")+'</span>')+'</div>';}}
  else h+='<p style="margin-top:6px">Camp starts '+fmtD(iso(campStart()))+'. Your three sessions a week show here once it kicks off.</p>';
  my.forEach(function(s){var n=(s.items||[]).length;h+='<div class="sessRow"><div class="d"><b>+</b><small>extra</small></div><div class="n"><b class="x">'+E(s.name)+'</b><span>From Jake · '+n+' rounds'+(s.due_date?' · by '+fmtD(s.due_date):'')+'</span></div><button class="sm" onclick="fcxRun('+s.id+')">'+(s.done_rounds>=n&&n?'Done ✓':s.done_rounds?s.done_rounds+'/'+n:'Start')+'</button></div>';});
  h+='<div class="sessRow"><div class="d"><b>Sun</b><small>weekly</small></div><div class="n"><b>Weigh-in & check-in</b><span>Ten seconds in your Progress tab</span></div><button class="sm" onclick="fcxSet(\'tab\',\'progress\')">Log</button></div></div>';
  var latest=my.find(function(s){return s.note;});
  if(latest)h+='<div class="card" style="border-color:#3a3320"><div style="font-size:9.5px;font-weight:900;letter-spacing:2.5px;color:#c9a44c;text-transform:uppercase">Jake\'s note for you</div><p style="margin-top:6px;color:#f2f0eb">'+E(latest.note)+'</p></div>';
  h+='<div class="card"><h3>Camp notes</h3>'+(FC.notes.length?FC.notes.map(function(n){return '<div class="feed"><div class="av">J</div><div class="b">'+E(n.body)+'<small>Jake · '+fmtD(n.created_at)+'</small></div></div>';}).join(""):'<p>Nothing posted yet.</p>')+'</div>';
  return h;
}
/* ========== FIGHTER · PROGRESS (four graphs) ========== */
var CW=300,CH=136,PL=10,PR=10,PT=16,PB=18;function xs(i){return PL+i*(CW-PL-PR)/9;}
var NEON={att:"#F1D27A",wt:"#4fd8ff",spar:"#ff4f7a",km:"#5dff9a"};
function glowDefs(id,col){return '<defs><filter id="'+id+'g" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="'+id+'s" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><linearGradient id="'+id+'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'" stop-opacity=".45"/><stop offset="1" stop-color="'+col+'" stop-opacity="0"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+col+'"/><stop offset="1" stop-color="'+col+'" stop-opacity=".35"/></linearGradient></defs>';}
function grid(){return [0.25,0.5,0.75].map(function(p){return '<line x1="'+PL+'" x2="'+(CW-PR)+'" y1="'+(PT+(CH-PT-PB)*p)+'" y2="'+(PT+(CH-PT-PB)*p)+'" stroke="#ffffff" stroke-opacity=".05"/>';}).join("");}
function axisWeeks(){return [1,4,7,10].map(function(k){return '<text x="'+xs(k-1)+'" y="'+(CH-4)+'" fill="#6f6d66" font-size="8.5" text-anchor="middle" font-family="Inter,Montserrat,sans-serif">wk '+k+'</text>';}).join("");}
function chartAtt(f){
  var col=NEON.att,W=300,H=178,cx=150,cy=150,Rr=118,a0=200,a1=-20,N=30,a=attOf(f);
  function pol(ang,r){return [cx+r*Math.cos(ang*Math.PI/180),cy-r*Math.sin(ang*Math.PI/180)];}
  var s='<svg class="chart gauge" viewBox="0 0 '+W+' '+H+'">'+glowDefs('at',col);
  for(var i=0;i<N;i++){var w=Math.floor(i/3),d=i%3,ang=a0+(a1-a0)*(i+0.5)/N,st=a[w][d];var sel=FC.attSel===i;
    var p1=pol(ang,Rr-18),p2=pol(ang,Rr);var stroke=st===1?col:st===0?'#ff4f7a':'#26262b';
    s+='<line x1="'+p1[0]+'" y1="'+p1[1]+'" x2="'+p2[0]+'" y2="'+p2[1]+'" stroke="'+stroke+'" stroke-width="'+(sel?7:5)+'" stroke-linecap="round" '+(st===1?'filter="url(#ats)"':'')+' style="cursor:pointer" onclick="FC_attSel('+i+')"/>';
    if(sel){var t=pol(ang,Rr+9);s+='<circle cx="'+t[0]+'" cy="'+t[1]+'" r="3" fill="#fff" filter="url(#atg)"/>';}
    if(d===0&&w>0&&w%3===0){var l=pol(a0+(a1-a0)*i/N,Rr+12);s+='<text x="'+l[0]+'" y="'+(l[1]+3)+'" fill="#6f6d66" font-size="8" text-anchor="middle" font-family="Inter,Montserrat,sans-serif">wk '+(w+1)+'</text>';}}
  var n=attN(f),tot=Math.max(0,WEEK()*3);
  s+='<text x="'+cx+'" y="'+(cy-22)+'" fill="#fff" font-size="44" text-anchor="middle" font-family="Oswald" font-weight="700" filter="url(#ats)">'+n+'</text><text x="'+cx+'" y="'+(cy-4)+'" fill="#9a9891" font-size="9.5" text-anchor="middle" font-family="Inter,Montserrat,sans-serif" font-weight="800" letter-spacing="2">'+(tot?'OF '+tot+' SO FAR':'OF 30 · CAMP STARTS '+fmtD(iso(campStart())).toUpperCase())+'</text><text x="'+cx+'" y="'+(cy+14)+'" fill="'+col+'" font-size="10" text-anchor="middle" font-family="Inter,Montserrat,sans-serif" font-weight="700">'+(30-tot)+' sessions to fight night</text></svg>';
  if(FC.attSel!==null){var ww=Math.floor(FC.attSel/3),dd=FC.attSel%3,stt=a[ww][dd];var lbl=stt===1?"Trained":stt===0?"Missed":(sessDate(ww+1,dd)<new Date()?"Not logged":"Coming up");
    s+='<div class="tip"><div><b>Week '+(ww+1)+' · '+sessDate(ww+1,dd).toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})+'</b><span>'+DAYLBL[dd]+' · 6:45 pm</span></div><span class="tag '+(lbl==="Trained"?"ntag":lbl==="Missed"?"rd":"")+'">'+lbl+'</span></div>';}
  else s+='<div class="tip dimtip"><span>Tap any tick for the session</span></div>';
  return s;
}
window.FC_attSel=function(i){FC.attSel=i;R();};
function chartWt(f){
  var col=NEON.wt,rows=wiOf(f),pre=false;if(!rows.length){if(!f.weight_kg)return '';rows=[{week:1,weight_kg:f.weight_kg}];pre=true;}
  var w=rows.map(function(r){return Number(r.weight_kg);}),wk=rows.map(function(r){return r.week;});
  var goal=Number(f.fight_weight_kg||w[0]);var all=w.concat([goal]);var mn=Math.min.apply(null,all)-0.6,mx=Math.max.apply(null,all)+0.6;
  function y(v){return CH-PB-(v-mn)/(mx-mn)*(CH-PT-PB);}function x(i){return xs(Math.max(0,Math.min(9,wk[i]-1)));}
  var pts=w.map(function(v,i){return x(i)+","+y(v);});
  var area='M'+x(0)+','+(CH-PB)+' L'+pts.join(" L")+' L'+x(w.length-1)+','+(CH-PB)+' Z';var lx=x(w.length-1),ly=y(w[w.length-1]);
  return '<svg class="chart" viewBox="0 0 '+CW+' '+CH+'">'+glowDefs('wt',col)+grid()+'<path d="'+area+'" fill="url(#wta)"/><line x1="'+PL+'" x2="'+(CW-PR)+'" y1="'+y(goal)+'" y2="'+y(goal)+'" stroke="'+col+'" stroke-opacity=".5" stroke-dasharray="4 4"/><text x="'+(CW-PR)+'" y="'+(y(goal)-4)+'" fill="'+col+'" fill-opacity=".8" font-size="8.5" text-anchor="end" font-family="Inter,Montserrat,sans-serif" font-weight="700">FIGHT WEIGHT '+goal+' KG</text><polyline class="draw" points="'+pts.join(" ")+'" fill="none" stroke="'+col+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" filter="url(#wtg)"/>'+w.map(function(v,i){return i<w.length-1?'<circle cx="'+x(i)+'" cy="'+y(v)+'" r="2.5" fill="#0b0b0c" stroke="'+col+'" stroke-width="1.5"/>':'';}).join("")+'<circle cx="'+lx+'" cy="'+ly+'" r="9" fill="'+col+'" fill-opacity=".18"><animate attributeName="r" values="6;12;6" dur="2.4s" repeatCount="indefinite"/><animate attributeName="fill-opacity" values=".3;.05;.3" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="'+lx+'" cy="'+ly+'" r="4.5" fill="#fff" filter="url(#wtg)"/><text x="'+lx+'" y="'+(ly-12)+'" fill="#fff" font-size="12" text-anchor="middle" font-family="Oswald" font-weight="700">'+w[w.length-1]+' kg</text>'+(pre?'<text x="'+lx+'" y="'+(ly+18)+'" fill="#9a9891" font-size="8.5" text-anchor="start" font-family="Inter,Montserrat,sans-serif" font-weight="700">WALK-AROUND · LINE STARTS WEEK 1</text>':'')+axisWeeks()+'</svg>';
}
function chartSpar(f){
  var col=NEON.spar,nights=nightsOf(f),cum=roundsOf(f).length,target=(FC.camp&&FC.camp.spar_target)||12;
  var up=pairsOf(f).filter(function(p){return pd(p.night_date)>=new Date(new Date().setHours(0,0,0,0));})[0];
  var s='<div class="segs">';for(var i=0;i<target;i++)s+='<i class="'+(i<cum?"on":"")+'" style="--d:'+(i*60)+'ms"></i>';s+='</div><div class="segl"><span>'+cum+' banked</span><span>Jake wants '+target+' before fight night</span></div><div style="margin-top:10px">';
  if(!nights.length&&!up)s+='<p>Sparring opens week '+((FC.camp&&FC.camp.spar_open_week)||6)+'. Your rounds land here the night you do them.</p>';
  nights.forEach(function(n,i){var o=n.v?byId(n.v):null;var dt=pd(n.d);s+='<button class="night '+(FC.sparSel===i?"sel":"")+'" onclick="FC.sparSel='+i+';fcxSub(FC.sub)"><div class="nd"><b>'+dt.getDate()+'</b><small>'+dt.toLocaleDateString("en-AU",{month:"short"})+'</small></div><div class="nr">'+Array(n.r+1).join('<i></i>')+'</div><div class="nn"><b>'+n.r+' round'+(n.r>1?'s':'')+(o?' v '+E(short(o)):'')+'</b><span>Week '+weekOf(dt)+' · '+E(n.lvl||"Technical")+'</span></div></button>';});
  if(up){var o2=byId(up.a_id===f.id?up.b_id:up.a_id);var dt2=pd(up.night_date);var conf=up.a_status==="confirmed"&&up.b_status==="confirmed";s+='<div class="night next"><div class="nd"><b>'+dt2.getDate()+'</b><small>'+dt2.toLocaleDateString("en-AU",{month:"short"})+'</small></div><div class="nr">'+Array(up.rounds+1).join('<i class="ghost"></i>')+'</div><div class="nn"><b>'+up.rounds+' rounds'+(o2?' v '+E(short(o2)):'')+'</b><span>Next · '+E(up.level)+' · '+(conf?'confirmed':'confirm in Sparring')+'</span></div></div>';}
  s+='</div>';
  var sel=nights[FC.sparSel]||nights[nights.length-1];
  if(sel&&sel.notes.length)s+='<div class="tip"><div><b>'+fmtD(sel.d)+'</b><span>'+E(sel.notes.join(" · "))+'</span></div><span class="tag ntag">Jake</span></div>';
  return s;
}
function chartKm(f){
  var col=NEON.km,k=kmByWeek(f),target=Number((FC.camp&&FC.camp.km_target)||10),mx=Math.max.apply(null,[target+2].concat(k))+3;
  function y(v){return CH-PB-(v/mx)*(CH-PT-PB);}var bw=(CW-PL-PR)/10-8,w=WEEK();
  var s='<svg class="chart" viewBox="0 0 '+CW+' '+CH+'">'+glowDefs('km',col)+grid();
  for(var i=0;i<10;i++){var x=PL+i*(CW-PL-PR)/10+4,v=k[i];
    if(v===undefined)s+='<rect x="'+x+'" y="'+y(1.5)+'" width="'+bw+'" height="'+(CH-PB-y(1.5))+'" rx="3" fill="#17171b" stroke="#232327"/>';
    else{var hit=v>=target;s+='<rect x="'+x+'" y="'+y(v)+'" width="'+bw+'" height="'+Math.max(2,CH-PB-y(v))+'" rx="3" fill="url(#kmb)" fill-opacity="'+(hit?1:.45)+'" '+(hit?'filter="url(#kms)"':'')+'/>';if(v>0)s+='<text x="'+(x+bw/2)+'" y="'+(y(v)-5)+'" fill="'+(i===w-1?'#fff':hit?col:'#9a9891')+'" font-size="9" text-anchor="middle" font-family="Oswald" font-weight="700">'+v+'</text>';}}
  s+='<line x1="'+PL+'" x2="'+(CW-PR)+'" y1="'+y(target)+'" y2="'+y(target)+'" stroke="'+col+'" stroke-opacity=".5" stroke-dasharray="4 4"/><text x="'+(CW-PR)+'" y="'+(y(target)-4)+'" fill="'+col+'" fill-opacity=".8" font-size="8.5" text-anchor="end" font-family="Inter,Montserrat,sans-serif" font-weight="700">'+target+' KM / WEEK</text>';
  s+=[1,4,7,10].map(function(q){return '<text x="'+(PL+(q-1)*(CW-PL-PR)/10+4+bw/2)+'" y="'+(CH-4)+'" fill="#6f6d66" font-size="8.5" text-anchor="middle" font-family="Inter,Montserrat,sans-serif">wk '+q+'</text>';}).join("");
  return s+'</svg>';
}
function gCard(title,big,unit,tag,svg,foot,col){return '<div class="card gph" style="--n:'+col+'"><div class="row" style="align-items:flex-start"><div><div class="gk">'+title+'</div><div class="gb">'+big+'<small>'+unit+'</small></div></div>'+(tag?'<span class="tag ntag">'+tag+'</span>':'')+'</div>'+svg+(foot?'<p style="font-size:11px;margin-top:2px">'+foot+'</p>':'')+'</div>';}
function graphsHtml(f){
  var a=attN(f),tot=Math.max(0,WEEK()*3),rows=wiOf(f),lost=rows.length>1?(Number(rows[0].weight_kg)-Number(rows[rows.length-1].weight_kg)).toFixed(1):null,cum=roundsOf(f).length,km=kmN(f),kw=kmByWeek(f),best=Math.max.apply(null,kw.concat([0])),st=staff(),you=st?E(f.first_name):"you",kmT=(FC.camp&&FC.camp.km_target)||10;
  var cur=rows.length?Number(rows[rows.length-1].weight_kg):(f.weight_kg?Number(f.weight_kg):null);
  var togo=f.fight_weight_kg&&cur!=null?(cur-Number(f.fight_weight_kg)).toFixed(1).replace(/^-?0\.0$/,"0"):null;
  return gCard("Sessions turned up to",a," of "+(tot||30),"",chartAtt(f),tot===0?(st?"Three a week from Mon 12 Oct. Every session "+you+" makes lights up gold, every miss goes red.":"Three a week from Mon 12 Oct. Every session you make lights up gold, every miss goes red."):a>=tot-1&&tot>0?(st?you+" is turning up. That's the camp.":"Turning up is the camp. You're doing the camp."):"Every missed session is a red tick. Fill the next three.",NEON.att)
   +gCard("Weight",cur!=null?cur:"—"," kg",lost&&Number(lost)>0?"−"+lost+" kg this camp":"",chartWt(f)||'<p style="margin-top:8px">'+(st?"No weight on "+you+"'s profile yet — add one under Profile › Edit.":"Log a Sunday weigh-in below and the line starts here.")+'</p>',(togo!=null?"Fight weight "+f.fight_weight_kg+" kg · "+togo+" kg to go":"No fight weight set yet")+(st?" · Sunday weigh-ins land here":" · only you, Jake and Ali see this"),NEON.wt)
   +gCard("Sparring rounds banked",cum," rounds","",chartSpar(f),st?"Every round logged ringside lands here the night "+you+" does it.":"Every round you do on a sparring night lands here. Jake logs them ringside.",NEON.spar)
   +gCard("Road work",km," km this camp",best>=kmT?"best week "+best+" km":"",chartKm(f),(st?you+" logs runs in the app. ":"Log your runs below. ")+kmT+" km a week is the camp minimum from week 4.",NEON.km);
}
function progressStaffHtml(){
  var tot=Math.max(0,WEEK()*3),att=0,kg=0,rounds=FC.rounds.length,km=0;
  FC.F.forEach(function(f){att+=attN(f);km+=Number(kmN(f));var r=wiOf(f);if(r.length>1)kg+=Number(r[0].weight_kg)-Number(r[r.length-1].weight_kg);});
  if(!FC.pfid||!byId(FC.pfid))FC.pfid=(FC.fid&&byId(FC.fid)?FC.fid:(FC.F[0]||{}).id);var f=byId(FC.pfid);
  var h='<div class="card"><div class="row"><h3 style="margin:0">Whole camp</h3><span class="tag g">'+FC.F.length+' fighters</span></div><div class="tot" style="margin-top:8px"><div><b>'+att+'<small>/'+(tot*FC.F.length||30*FC.F.length)+'</small></b><span>Sessions</span></div><div><b>'+(kg>0?"−"+kg.toFixed(1):"0")+'<small>kg</small></b><span>Camp total</span></div><div><b>'+rounds+'</b><span>Spar rounds</span></div><div><b>'+km.toFixed(0)+'<small>km</small></b><span>Road work</span></div></div></div>';
  h+='<div class="chips" style="overflow-x:auto;flex-wrap:nowrap;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:0 -4px;padding:2px 4px 10px">'+FC.F.map(function(x){return '<button class="chip" style="flex:none;'+(x.id===FC.pfid?'background:#2a2410;border-color:#c9a44c;color:#F1D27A':'')+'" onclick="FC.pfid=\''+x.id+'\';FC.attSel=null;FC.sparSel=null;fcxSub(FC.sub)">'+E(short(x))+'</button>';}).join("")+'</div>';
  if(!f)return h+'<div class="card"><p>No fighters in the camp yet.</p></div>';
  h+='<div class="card" style="padding:10px 12px"><div class="row">'+av(f)+'<div class="n" style="flex:1;margin-left:10px"><b style="font-family:Oswald,sans-serif;font-size:16px;color:#fff;letter-spacing:.5px">'+E(full(f))+'</b><span style="display:block;font-size:10.5px;color:#9a9891">'+(f.camp_number===1?'Debut':'Camp '+f.camp_number)+(f.suburb?' · '+E(f.suburb):'')+(f.opponent_id&&byId(f.opponent_id)?' · v '+E(short(byId(f.opponent_id))):'')+'</span></div><button class="sm" onclick="fcxOpen(\''+f.id+'\')">Profile ›</button></div></div>';
  return h+graphsHtml(f);
}
function progressHtml(){
  var f=FC.me,w=Math.max(1,WEEK()),cur=FC.wi.find(function(r){return r.fighter_id===f.id&&r.week===w;})||{};
  return graphsHtml(f)+
   '<div class="card"><h3>Log a run</h3><div style="display:flex;gap:6px"><input class="txt" inputmode="decimal" placeholder="km" id="fcxKm"><input class="txt" placeholder="time (optional)" id="fcxKmT"><button class="sm" onclick="fcxAddRun()">Add</button></div></div>'+
   '<div class="card"><h3>Sunday check-in · week '+w+'</h3><label class="lbl">Weight this morning (kg)</label><input class="txt" inputmode="decimal" id="fcxWt" value="'+(cur.weight_kg||'')+'" placeholder="'+(f.weight_kg||'e.g. 92.0')+'">'+
   '<label class="lbl">How\'s the body · 1 flat → 5 flying</label><div class="scale" id="fcxBody">'+[1,2,3,4,5].map(function(n){return '<button class="'+(Number(cur.body)===n?"on":"")+'" data-v="'+n+'" onclick="fcxBody('+n+')">'+n+'</button>';}).join("")+'</div>'+
   '<label class="lbl">Anything sore or niggling</label><input class="txt" id="fcxNig" value="'+E(cur.niggle||'')+'" placeholder="Leave blank if you\'re good">'+
   '<button class="gold" style="margin-top:12px" onclick="fcxCheckin()">Log check-in</button><p style="font-size:11px;margin-top:8px">Jake reads every one Sunday night. A niggle flagged here is how he knows to change your Tuesday.</p></div>';
}
var _body=0;window.fcxBody=function(n){_body=n;var b=document.querySelectorAll("#fcxBody button");b.forEach(function(x){x.classList.toggle("on",Number(x.dataset.v)===n);});};
window.fcxCheckin=async function(){var f=FC.me,w=Math.max(1,WEEK());var wt=parseFloat(($("fcxWt")||{}).value);var nig=(($("fcxNig")||{}).value||"").trim();var row={camp:"fc2026",fighter_id:f.id,week:w,niggle:nig||null};if(wt>30&&wt<250)row.weight_kg=wt;if(_body)row.body=_body;
  var r=await sb.from("fc_weighins").upsert(row,{onConflict:"camp,fighter_id,week"}).select().maybeSingle();if(r.error){T("Couldn't save — try again");return;}
  FC.wi=FC.wi.filter(function(x){return !(x.fighter_id===f.id&&x.week===w);});FC.wi.push(r.data);_body=0;T("Logged — Jake sees it Sunday night");R();};
window.fcxAddRun=async function(){var f=FC.me,km=parseFloat(($("fcxKm")||{}).value);if(!(km>0)){T("How many km?");return;}var t=(($("fcxKmT")||{}).value||"").trim();
  var r=await sb.from("fc_runs").insert({camp:"fc2026",fighter_id:f.id,run_date:iso(new Date()),km:km,time_text:t||null}).select().maybeSingle();if(r.error){T("Couldn't save — try again");return;}FC.runs.push(r.data);T(km+" km added to this week");R();};
/* ========== FIGHTER · SPARRING ========== */
function pairRow(p){var a=byId(p.a_id),b=byId(p.b_id);if(!a||!b)return '';function st(s){return s==="confirmed"?'<span class="tag ok">In</span>':s==="declined"?'<span class="tag rd">Out</span>':'<span class="tag">Waiting</span>';}
  return '<div class="pair"><div class="p r">'+E(short(a))+'<span>'+st(p.a_status)+'</span></div><span class="amp">&amp;</span><div class="p">'+E(short(b))+'<span>'+st(p.b_status)+'</span></div><div style="text-align:right;font-size:10.5px;color:#9a9891;flex:none"><b style="color:#fff;font-family:Oswald,sans-serif;font-size:13px;letter-spacing:.5px">'+p.rounds+' × '+E(p.level)+'</b><br>'+fmtD(p.night_date)+'</div></div>'+(p.note?'<p style="font-size:11px;margin:-4px 0 8px">'+E(p.note)+'</p>':'');}
function sparHtml(){
  var f=FC.me,mp=pairsOf(f),mv=vidsOf(f),mn=roundsOf(f);
  var pend=mp.filter(function(p){return (p.a_id===f.id?p.a_status:p.b_status)==="pending"&&pd(p.night_date)>=new Date(new Date().setHours(0,0,0,0));});
  var h='<div class="card"><div class="row"><h3 style="margin:0">Your rounds</h3><span class="tag g">'+mn.length+' banked</span></div><p>Sparring is technical until Jake says otherwise. Headgear, 16 oz, you\'re there to learn — not to win Wednesday.</p></div>';
  h+='<div class="card"><h3>Your pairings</h3>'+(mp.length?mp.map(pairRow).join(""):'<p>Nothing on the board for you yet.</p>')+pend.map(function(p){return '<div style="display:flex;gap:6px;margin-top:8px"><button class="gold" onclick="fcxConfirm('+p.id+',true)">Confirm '+fmtD(p.night_date)+'</button><button class="sm x" onclick="fcxConfirm('+p.id+',false)">Can\'t make it</button></div>';}).join("")+'</div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">Your fight tape</h3>'+(mv.some(function(v){return !v.seen_at;})?'<span class="tag bl">New</span>':'')+'</div>'+(mv.length?mv.map(videoHtml).join(""):'<p>Jake uploads your sparring here so you can watch it back with his notes.</p>')+'</div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">Jake\'s round notes</h3><span class="tag">'+mn.length+' rounds</span></div>'+(mn.filter(function(r){return r.note;}).map(function(r){return '<div class="note"><div class="t">R'+(r.round_no||1)+'</div><div class="b">'+E(r.note)+'<small>'+fmtD(r.night_date)+'</small></div></div>';}).join("")||'<p>No notes yet.</p>')+'</div>';
  return h;
}
window.fcxConfirm=async function(id,yes){var r=await sb.rpc("fc_spar_confirm",{p_pair:id,p_yes:yes});if(r.error){T("Couldn't save");return;}var p=FC.pairs.find(function(x){return x.id===id;});if(p){if(p.a_id===FC.me.id)p.a_status=yes?"confirmed":"declined";else p.b_status=yes?"confirmed":"declined";}T(yes?"Confirmed — Jake knows you're in":"Jake's been told");R();};
/* ========== FIGHTER · FIGHT NIGHT ========== */
function fightHtml(){
  var f=FC.me,o=f.opponent_id?byId(f.opponent_id):null,done=CHECK.filter(function(c){return chkOf(f,c[0]);}).length;
  var h='<div class="hero"><div class="k">'+fmtD(iso(fightDate()))+' · Legacy Gym · Christmas party</div><div class="t">Fight night</div><div class="s">Doors 6 pm · weigh-in Fri 18 Dec 5 pm</div><div class="cd"><div><b>'+daysToFight()+'</b><small>days</small></div><div><b>'+(f.fight_weight_kg||'—')+'<span style="font-size:11px;color:#9a9891">kg</span></b><small>fight weight</small></div><div><b>'+done+'<span style="font-size:11px;color:#9a9891">/'+CHECK.length+'</span></b><small>ready</small></div></div></div>';
  h+='<div class="card"><div class="row"><h3 style="margin:0">Your fight</h3>'+(o?'<span class="tag fc">Matched</span>':'<span class="tag">Sealed</span>')+'</div>';
  if(o)h+='<div class="vs"><div class="f">'+av(f)+'<b>'+E(full(f))+'</b><span>'+f.wins+'-'+f.losses+'-'+f.draws+' · '+E(f.stance||'stance TBC')+(f.camp_number>1?' · camp '+f.camp_number:' · debut')+'</span></div><div class="amp">&amp;</div><div class="f">'+av(o)+'<b>'+E(full(o))+'</b><span>'+o.wins+'-'+o.losses+'-'+o.draws+' · '+E(o.stance||'stance TBC')+(o.camp_number>1?' · camp '+o.camp_number:' · debut')+'</span></div></div><p style="text-align:center;margin-top:10px">3 × 2 min · 16 oz gloves, headgear</p>'+(o.stance&&f.stance&&o.stance!==f.stance?'<p style="text-align:center;font-size:11px;margin-top:6px">'+E(o.first_name)+' is a '+E(o.stance.toLowerCase())+'. Jake will build your Tuesdays around it.</p>':'');
  else h+='<div class="sealed"><b>Opponent announced week 6</b><p style="margin-top:4px">Jake matches every fighter on weight and experience. You\'ll get a push the moment it\'s set.</p></div>';
  h+='</div><div class="card"><div class="row"><h3 style="margin:0">Fight week checklist</h3><span class="tag '+(done===CHECK.length?"ok":"")+'">'+done+'/'+CHECK.length+'</span></div>'+CHECK.map(function(c){var on=chkOf(f,c[0]);return '<button class="chk '+(on?"on":"")+'" onclick="fcxChk(\''+c[0]+'\','+(!on)+')"><div class="box">'+(on?'✓':'')+'</div><div class="n">'+c[1]+'<span>'+c[2]+'</span></div></button>';}).join("")+'</div>';
  h+='<div class="card"><h3>Walkout song</h3><p>Everyone gets one. Thirty seconds, nothing you wouldn\'t play in front of your mum.</p><input class="txt" id="fcxSong" style="margin-top:8px" placeholder="Song — artist" value="'+E(f.walkout_song||'')+'"><button class="line" style="margin-top:8px" onclick="fcxSong()">Save</button></div>';
  h+='<div class="card"><h3>Your fighter card</h3><p style="margin-bottom:10px">Post it. Your people buy tickets, the gym fills the room.</p><div class="fcard"><div class="k">Legacy Fight Club · '+fmtD(iso(fightDate()))+'</div><div class="nm">'+E(full(f))+'</div><div class="s">'+(f.suburb?E(f.suburb)+' · ':'')+E(f.stance||'')+(f.stance?' · ':'')+(f.camp_number===1?'Debut':'Camp '+f.camp_number)+'</div><div class="tot" style="margin-top:12px"><div><b>'+f.wins+'-'+f.losses+'-'+f.draws+'</b><span>W-L-D</span></div><div><b>'+(f.fight_weight_kg||'—')+'<small>kg</small></b><span>Fight wt</span></div><div><b>'+(o?E(o.first_name):'TBA')+'</b><span>Opponent</span></div></div></div><button class="gold" style="margin-top:10px" onclick="fcxCardImg()">Save my card</button></div>';
  h+='<div class="card"><h3>Tickets for your people</h3><p>On sale Mon 23 Nov. You\'ll get a link to share — family, mates, workmates. Doors 6 pm, Christmas party after the last bout.</p></div>';
  return h;
}
window.fcxChk=async function(key,on){var f=FC.me;var r=await sb.from("fc_checklist").upsert({camp:"fc2026",fighter_id:f.id,item_key:key,done:on,updated_at:new Date().toISOString()},{onConflict:"camp,fighter_id,item_key"}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.chk=FC.chk.filter(function(c){return !(c.fighter_id===f.id&&c.item_key===key);});FC.chk.push(r.data);R();};
window.fcxSong=async function(){var s=(($("fcxSong")||{}).value||"").trim();var r=await sb.rpc("fc_set_walkout",{p_song:s});if(r.error){T("Couldn't save");return;}FC.me.walkout_song=s;T("Saved — the DJ has it");};
window.fcxCardImg=function(){
  var f=FC.me,o=f.opponent_id?byId(f.opponent_id):null;
  var c=document.createElement("canvas");c.width=1080;c.height=1350;var g=c.getContext("2d");
  g.fillStyle="#0b0b0c";g.fillRect(0,0,1080,1350);var gr=g.createLinearGradient(0,0,0,1350);gr.addColorStop(0,"#17150f");gr.addColorStop(1,"#0b0b0c");g.fillStyle=gr;g.fillRect(40,40,1000,1270);g.strokeStyle="#c9a44c";g.lineWidth=6;g.strokeRect(40,40,1000,1270);
  var img=new Image();img.crossOrigin="anonymous";img.onload=function(){draw();};img.onerror=function(){draw();};img.src=FC_LOGO;
  function draw(){try{g.globalAlpha=1;g.drawImage(img,340,110,400,304);}catch(e){}
    g.textAlign="center";g.fillStyle="#c9a44c";g.font="700 34px Oswald, Arial Narrow, sans-serif";g.fillText("LEGACY FIGHT CLUB  ·  "+fmtD(iso(fightDate())).toUpperCase(),540,480);
    g.fillStyle="#fff";g.font="700 96px Oswald, Arial Narrow, sans-serif";g.fillText(full(f).toUpperCase(),540,600);
    g.fillStyle="#9a9891";g.font="600 34px Montserrat, Arial, sans-serif";g.fillText([(f.suburb||""),(f.stance||""),(f.camp_number===1?"Debut":"Camp "+f.camp_number)].filter(Boolean).join("  ·  "),540,660);
    var cols=[[f.wins+"-"+f.losses+"-"+f.draws,"W-L-D"],[(f.fight_weight_kg||"—")+" KG","FIGHT WEIGHT"],[o?o.first_name.toUpperCase():"TBA","OPPONENT"]];
    cols.forEach(function(k,i){var x=200+i*340;g.fillStyle="#141416";g.fillRect(x-140,760,280,200);g.strokeStyle="#3a3320";g.lineWidth=3;g.strokeRect(x-140,760,280,200);g.fillStyle="#fff";g.font="700 72px Oswald, Arial Narrow, sans-serif";g.fillText(k[0],x,860);g.fillStyle="#9a9891";g.font="800 22px Montserrat, Arial, sans-serif";g.fillText(k[1],x,915);});
    g.fillStyle="#F1D27A";g.font="700 40px Oswald, Arial Narrow, sans-serif";g.fillText("LEGACY GYM CENTRAL COAST  ·  KINCUMBER",540,1130);g.fillStyle="#9a9891";g.font="600 28px Montserrat, Arial, sans-serif";g.fillText("Doors 6 pm  ·  Tickets at legacygym.net",540,1185);
    c.toBlob(function(b){var file=new File([b],"fight-club-card.png",{type:"image/png"});if(navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:"Fight Club"}).catch(function(){});}else{var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="fight-club-card.png";document.body.appendChild(a);a.click();a.remove();T("Saved to your downloads");}},"image/png");}
};

/* ========== VIDEO (both sides) ========== */
var vurl={};
async function signedUrl(v){if(v.url)return v.url;if(vurl[v.id])return vurl[v.id];try{var r=await sb.storage.from("fc-videos").createSignedUrl(v.storage_path,3600);if(r.data&&r.data.signedUrl){vurl[v.id]=r.data.signedUrl;return vurl[v.id];}}catch(e){}return "";}
function videoHtml(v){
  var notes=vnotesOf(v),dur=v.duration_sec||0,isMe=!staff();
  var h='<div style="margin-top:8px" data-vid="'+v.id+'"><div style="font-size:12px;font-weight:700;color:#f2f0eb;margin-bottom:6px">'+E(v.title)+' <span style="color:#9a9891;font-weight:500">· '+fmtD(v.created_at)+'</span></div><video id="fcxV'+v.id+'" controls playsinline preload="metadata" src="'+E(vurl[v.id]||v.url||"")+'"></video>';
  h+='<div class="tl"><div class="bar"></div><div class="fill" id="fcxFill'+v.id+'" style="width:0%"></div>'+notes.map(function(n,i){return '<div class="pin" style="left:'+(dur?Math.min(100,n.t_sec/dur*100):0)+'%">'+(i+1)+'</div>';}).join("")+'</div>';
  h+='<div>'+notes.map(function(n,i){return '<button class="note" onclick="fcxSeek('+v.id+','+n.t_sec+')"><div class="t">'+fmt(n.t_sec)+'</div><div class="b">'+E(n.note)+'<small>Jake · pin '+(i+1)+'</small></div></button>';}).join("")+'</div>';
  if(!isMe)h+='<div style="display:flex;gap:6px;margin-top:10px"><input class="txt" id="fcxVn'+v.id+'" placeholder="Note at the current second…"><button class="sm" onclick="fcxPin('+v.id+')">Pin</button></div><button class="sm x" style="margin-top:8px" onclick="fcxDelVid('+v.id+')">Delete video</button>';
  else if(!v.seen_at)h+='<button class="line" style="margin-top:10px" onclick="fcxSeen('+v.id+')">Got it — mark as watched</button>';
  return h+'</div>';
}
function afterRender(){
  document.querySelectorAll("video[id^=fcxV]").forEach(function(el){var id=+el.id.slice(4);var v=FC.vids.find(function(x){return x.id===id;});if(!v)return;
    if(!el.getAttribute("src"))signedUrl(v).then(function(u){if(u&&!el.getAttribute("src"))el.src=u;});
    el.addEventListener("timeupdate",function(){var f=$("fcxFill"+id);if(f&&el.duration)f.style.width=(el.currentTime/el.duration*100)+"%";});
    el.addEventListener("loadedmetadata",function(){if(!v.duration_sec&&el.duration&&staff()){v.duration_sec=Math.round(el.duration);sb.from("fc_videos").update({duration_sec:v.duration_sec}).eq("id",id).then(function(){});}});
  });
}
window.fcxSeek=function(id,t){var el=$("fcxV"+id);if(!el)return;el.currentTime=t;el.play().catch(function(){});};
window.fcxPin=async function(id){var el=$("fcxV"+id),inp=$("fcxVn"+id);var txt=(inp&&inp.value||"").trim();if(!txt){T("Type the note first");return;}var t=el?Math.round(el.currentTime):0;
  var r=await sb.from("fc_video_notes").insert({video_id:id,t_sec:t,note:txt,created_by:session.user.id}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.vnotes.push(r.data);FC.vnotes.sort(function(a,b){return a.t_sec-b.t_sec;});await sb.from("fc_videos").update({seen_at:null}).eq("id",id);var v=FC.vids.find(function(x){return x.id===id;});if(v)v.seen_at=null;T("Pinned at "+fmt(t));R();};
window.fcxSeen=async function(id){await sb.rpc("fc_video_seen",{p_video:id});var v=FC.vids.find(function(x){return x.id===id;});if(v)v.seen_at=new Date().toISOString();R();};
window.fcxDelVid=async function(id){if(!confirm("Delete this video?"))return;var v=FC.vids.find(function(x){return x.id===id;});if(v&&v.storage_path){try{await sb.storage.from("fc-videos").remove([v.storage_path]);}catch(e){}}await sb.from("fc_videos").delete().eq("id",id);FC.vids=FC.vids.filter(function(x){return x.id!==id;});R();};
window.fcxUpload=async function(inp){var file=inp.files&&inp.files[0];if(!file)return;var fid=($("fcxUpF")||{}).value;var title=(($("fcxUpT")||{}).value||"").trim()||("Sparring · "+fmtD(iso(new Date())));if(!fid){T("Pick the fighter first");return;}
  if(file.size>500*1024*1024){T("That's over 500 MB — trim it first");return;}
  var st=$("fcxUpS");if(st)st.textContent="Uploading "+Math.round(file.size/1048576)+" MB… keep the app open";
  var ext=(file.name.split(".").pop()||"mp4").toLowerCase();var path=fid+"/"+Date.now()+"."+ext;
  var up=await sb.storage.from("fc-videos").upload(path,file,{contentType:file.type||"video/mp4",upsert:false});
  if(up.error){if(st)st.textContent="";T("Upload failed: "+up.error.message);return;}
  var r=await sb.from("fc_videos").insert({camp:"fc2026",fighter_id:fid,title:title,storage_path:path,created_by:session.user.id}).select().maybeSingle();
  if(r.error){T("Saved the file but not the record — tell Claude");return;}
  FC.vids.unshift(r.data);if(st)st.textContent="";T("Uploaded — pin your notes below");FC.vsel=r.data.id;R();};
/* ========== STAFF · FIGHTERS ========== */
function attention(){var out=[],w=WEEK();FC.F.forEach(function(f){if(w>=2){var a=attOf(f);var last=(a[w-2]||[]).concat(a[w-1]||[]);var logged=last.filter(function(x){return x!==null;}).length,hit=last.filter(function(x){return x===1;}).length;if(logged>=3&&logged-hit>=2)out.push([f,"Missed "+(logged-hit)+" of the last "+logged+" logged sessions"]);}
  if(w>=2){var wi=wiOf(f);if(!wi.length)out.push([f,"Never logged a weight"]);else if(w-wi[wi.length-1].week>=2)out.push([f,"No weigh-in for "+(w-wi[wi.length-1].week)+" weeks"]);}
  var lw=lastWi(f);if(lw&&lw.niggle&&lw.week>=w-1)out.push([f,"Flagged: "+lw.niggle]);if(!f.user_id)out.push([f,"Not in the app yet — no login"]);});return out;}
function listRows(arr){return arr.map(function(f){return '<button class="fr" onclick="fcxOpen(\''+f.id+'\')">'+av(f)+'<div class="n"><b>'+E(full(f))+'</b><span>'+(f.weight_kg?f.weight_kg+' kg · ':'')+(f.stance||'stance not set')+(f.user_id?'':' · <span style="color:#f0c38a">no login</span>')+'</span></div><div class="rec">'+f.wins+'-'+f.losses+'-'+f.draws+'<small>'+(f.camp_number===1?'debut':'camp '+f.camp_number)+'</small></div></button>';}).join("")||'<p style="padding:8px 0">No one matches.</p>';}
window.fcxFilter=function(q){q=q.toLowerCase();var el=$("fcxList");if(el)el.innerHTML=listRows(FC.F.filter(function(f){return full(f).toLowerCase().indexOf(q)>=0;}));};
function fightersHtml(){
  if(FC.fid){var f=byId(FC.fid);if(f)return profileHtml(f);}
  var at=attention();
  return (at.length?'<div class="card" style="border-color:#4a3a1a"><div class="row"><h3 style="margin:0">Needs a look</h3><span class="tag wn">'+at.length+'</span></div>'+at.slice(0,6).map(function(x){return '<button class="attn" onclick="fcxOpen(\''+x[0].id+'\')">'+av(x[0])+'<div class="n"><b>'+E(full(x[0]))+'</b><span>'+E(x[1])+'</span></div><span class="tag">›</span></button>';}).join("")+'</div>':'')+
   '<div class="card" style="padding:10px 14px"><div class="row"><span style="font-size:12px;color:#9a9891">'+FC.F.length+' in camp · '+FC.F.filter(function(f){return f.user_id;}).length+' linked to the app</span><button class="sm" onclick="fcxAddFighter()">+ Add fighter</button></div></div>'+
   '<input class="search" placeholder="Search fighters" oninput="fcxFilter(this.value)" style="margin-bottom:10px"><div class="card" id="fcxList">'+listRows(FC.F)+'</div>';
}
window.fcxAddFighter=async function(){var n=prompt("Fighter's name (first last)");if(!n)return;var p=n.trim().split(/\s+/);var em=prompt("Email (so their login links up) — optional")||null;
  var r=await sb.from("fc_fighters").insert({camp:"fc2026",first_name:p[0],last_name:p.slice(1).join(" "),email:em,source:"app"}).select().maybeSingle();if(r.error){T("Couldn't add");return;}FC.F.push(r.data);FC.F.sort(function(a,b){return (a.last_name||"").localeCompare(b.last_name||"");});T("Added");R();};
function tapeHtml(f){
  var o=f.opponent_id?byId(f.opponent_id):null;
  return '<div class="tape"><div class="top">'+av(f)+'<div><div class="nm">'+E(full(f))+'</div><div class="sub">'+(f.camp_number===1?'First camp':'Camp '+f.camp_number)+(f.suburb?' · '+E(f.suburb):'')+(f.age?' · '+f.age+' yrs':'')+'</div><div style="margin-top:6px"><span class="tag fc">Fight Club</span> '+(o?'<span class="tag">v '+E(o.first_name)+'</span>':'')+'</div></div></div>'+
   '<div class="tot"><div><b>'+f.wins+'-'+f.losses+'-'+f.draws+'</b><span>W-L-D</span></div><div class="'+(f.weight_kg?'':'un')+'"><b>'+(f.weight_kg?f.weight_kg+'<small>kg</small>':'—')+'</b><span>Weight</span></div><div class="'+(f.fight_weight_kg?'':'un')+'"><b>'+(f.fight_weight_kg?f.fight_weight_kg+'<small>kg</small>':'—')+'</b><span>Fight wt</span></div><div class="'+(f.stance?'':'un')+'"><b>'+(f.stance?E(f.stance.slice(0,5).toUpperCase()):'not set')+'</b><span>Stance</span></div></div></div>';
}
function profileHtml(f){
  var my=sessOf(f),mv=vidsOf(f),mn=roundsOf(f),lw=lastWi(f),w=WEEK();
  var tabs=[["tape","Profile"],["patt","Sessions"],["pspar","Sparring"],["ptrain","Extras"],["pgraph","Graphs"]];
  var h='<button class="back" onclick="FC.fid=null;fcxSub(\'tape\')">‹ All fighters</button>'+tapeHtml(f)+'<div class="pills">'+tabs.map(function(t){return '<button class="'+(FC.sub===t[0]?"on":"")+'" onclick="fcxSub(\''+t[0]+'\')">'+t[1]+'</button>';}).join("")+'</div>';
  if(FC.sub==="tape"){
    if(lw&&lw.niggle&&lw.week>=w-1)h+='<div class="flag"><b>Flagged wk '+lw.week+'</b><span>'+E(lw.niggle)+(lw.body?' — body '+lw.body+'/5':'')+'</span></div>';
    h+='<div class="card"><div class="row"><h3 style="margin:0">Tale of the tape</h3><button class="sm" onclick="fcxSub(\'edit\')">Edit</button></div><div style="margin-top:8px">'+
      '<div class="kv"><span>Age</span><b>'+(f.age||'—')+'</b></div><div class="kv"><span>Walk-around weight</span><b>'+(f.weight_kg?f.weight_kg+' kg':'—')+'</b></div><div class="kv"><span>Fight weight</span><b>'+(f.fight_weight_kg?f.fight_weight_kg+' kg':'—')+'</b></div><div class="kv"><span>Stance</span><b>'+E(f.stance||'Not set')+'</b></div><div class="kv"><span>Record</span><b>'+f.wins+'W · '+f.losses+'L · '+f.draws+'D</b></div><div class="kv"><span>Opponent · 19 Dec</span><b>'+(f.opponent_id&&byId(f.opponent_id)?E(full(byId(f.opponent_id))):'Not matched')+'</b></div><div class="kv"><span>Walkout</span><b>'+E(f.walkout_song||'—')+'</b></div><div class="kv"><span>Phone</span><b>'+(f.phone?'<a href="tel:'+E(f.phone)+'" style="color:#F1D27A">'+E(f.phone)+'</a>':'—')+'</b></div><div class="kv"><span>Instagram</span><b>'+E(f.instagram||'—')+'</b></div><div class="kv"><span>App login</span><b>'+(f.user_id?'Linked':'<span style="color:#f0c38a">Not yet — '+E(f.email||'no email')+'</span>')+'</b></div></div></div>';
    h+='<div class="card"><h3>This camp</h3><div class="tot" style="margin-top:4px"><div><b>'+attN(f)+'<small>/'+Math.max(0,w*3)+'</small></b><span>Sessions</span></div><div><b>'+mn.length+'</b><span>Spar rounds</span></div><div><b>'+kmN(f)+'<small>km</small></b><span>Run</span></div><div><b>'+(lw?lw.weight_kg+'<small>kg</small>':'—')+'</b><span>Last weigh-in</span></div></div></div>';
    var cn=FC.cnotes.filter(function(n){return n.fighter_id===f.id;});
    h+='<div class="card"><h3>Coach notes</h3><p>Private to you and Ali.</p>'+cn.map(function(n){return '<div class="feed"><div class="b">'+E(n.body)+'<small>'+fmtD(n.created_at)+'</small></div></div>';}).join("")+'<textarea class="txt" id="fcxCn" style="margin-top:8px" placeholder="Anything about '+E(f.first_name)+' worth remembering…"></textarea><button class="line" style="margin-top:8px" onclick="fcxCoachNote(\''+f.id+'\')">Save note</button></div>';
  }else if(FC.sub==="edit"){
    h+='<div class="card"><h3>Edit profile</h3>'+
      '<div class="kv"><span>First name</span><input id="e_fn" value="'+E(f.first_name)+'"></div><div class="kv"><span>Last name</span><input id="e_ln" value="'+E(f.last_name||'')+'"></div><div class="kv"><span>Age</span><input id="e_age" inputmode="numeric" value="'+(f.age||'')+'"></div><div class="kv"><span>Weight (kg)</span><input id="e_w" inputmode="decimal" value="'+(f.weight_kg||'')+'"></div><div class="kv"><span>Fight weight (kg)</span><input id="e_fw" inputmode="decimal" value="'+(f.fight_weight_kg||'')+'"></div>'+
      '<div class="kv"><span>Stance</span><select id="e_st"><option value="" '+(!f.stance?'selected':'')+'>Not set</option><option '+(f.stance==='Orthodox'?'selected':'')+'>Orthodox</option><option '+(f.stance==='Southpaw'?'selected':'')+'>Southpaw</option><option '+(f.stance==='Switch'?'selected':'')+'>Switch</option></select></div>'+
      '<div class="kv"><span>Wins</span><input id="e_wi" inputmode="numeric" value="'+f.wins+'"></div><div class="kv"><span>Losses</span><input id="e_lo" inputmode="numeric" value="'+f.losses+'"></div><div class="kv"><span>Draws</span><input id="e_dr" inputmode="numeric" value="'+f.draws+'"></div><div class="kv"><span>Camp number</span><input id="e_cn" inputmode="numeric" value="'+f.camp_number+'"></div>'+
      '<div class="kv"><span>Opponent</span><select id="e_op"><option value="">Not matched</option>'+FC.F.filter(function(x){return x.id!==f.id;}).map(function(x){return '<option value="'+x.id+'" '+(f.opponent_id===x.id?'selected':'')+'>'+E(full(x))+'</option>';}).join("")+'</select></div>'+
      '<div class="kv"><span>Suburb</span><input id="e_sub" value="'+E(f.suburb||'')+'"></div><div class="kv"><span>Phone</span><input id="e_ph" value="'+E(f.phone||'')+'"></div><div class="kv"><span>Email</span><input id="e_em" value="'+E(f.email||'')+'"></div><div class="kv"><span>Instagram</span><input id="e_ig" value="'+E(f.instagram||'')+'"></div><div class="kv"><span>Photo URL</span><input id="e_ph2" value="'+E(f.photo_url||'')+'"></div>'+
      '<button class="gold" style="margin-top:12px" onclick="fcxSaveF(\''+f.id+'\')">Save</button><button class="line" style="margin-top:8px" onclick="fcxSub(\'tape\')">Cancel</button><button class="sm x" style="margin-top:12px" onclick="fcxRemoveF(\''+f.id+'\')">Remove from camp</button></div>';
  }else if(FC.sub==="patt"){
    var a=attOf(f);
    h+='<div class="card"><div class="row"><h3 style="margin:0">Sessions</h3><span class="tag g">'+attN(f)+' of '+attLogged(f)+' logged</span></div><p>Tap a slot: trained → missed → clear. Mon / Tue / Wed.</p><div class="attg"><span></span><span class="w" style="text-align:center">MON</span><span class="w" style="text-align:center">TUE</span><span class="w" style="text-align:center">WED</span>';
    for(var wk=1;wk<=10;wk++){h+='<span class="w">wk '+wk+'</span>';for(var d=0;d<3;d++){var st=a[wk-1][d];h+='<button class="'+(st===1?'on':st===0?'miss':'')+'" onclick="fcxAtt(\''+f.id+'\','+wk+','+d+','+(st===null?1:st===1?0:-1)+')">'+(st===1?'✓':st===0?'✗':sessDate(wk,d).getDate())+'</button>';}}
    h+='</div></div>';
    var wi=wiOf(f);h+='<div class="card"><h3>Weigh-ins</h3>'+(wi.length?wi.map(function(r){return '<div class="kv"><span>Week '+r.week+'</span><b>'+r.weight_kg+' kg'+(r.body?' · body '+r.body+'/5':'')+(r.niggle?' · '+E(r.niggle):'')+'</b></div>';}).join(""):'<p>None yet.</p>')+'<div style="display:flex;gap:6px;margin-top:10px"><input class="txt" id="fcxWiW" inputmode="numeric" placeholder="wk" style="width:60px"><input class="txt" id="fcxWiK" inputmode="decimal" placeholder="kg"><button class="sm" onclick="fcxStaffWi(\''+f.id+'\')">Add</button></div></div>';
    var runs=FC.runs.filter(function(r){return r.fighter_id===f.id;});h+='<div class="card"><div class="row"><h3 style="margin:0">Road work</h3><span class="tag g">'+kmN(f)+' km</span></div>'+(runs.length?runs.slice(-8).reverse().map(function(r){return '<div class="kv"><span>'+fmtD(r.run_date)+'</span><b>'+r.km+' km'+(r.time_text?' · '+E(r.time_text):'')+'</b></div>';}).join(""):'<p>No runs logged.</p>')+'</div>';
  }else if(FC.sub==="pspar"){
    var mp=pairsOf(f);
    h+=(mp.length?'<div class="card"><h3>Pairings</h3>'+mp.map(pairRow).join("")+'</div>':'');
    h+='<div class="card"><div class="row"><h3 style="margin:0">Log rounds</h3><span class="tag g">'+mn.length+' banked</span></div><label class="lbl">Night</label><input class="txt" type="date" id="fcxRnD" value="'+iso(new Date())+'"><label class="lbl">Sparred</label><select class="txt" id="fcxRnO"><option value="">— not recorded —</option>'+FC.F.filter(function(x){return x.id!==f.id;}).map(function(x){return '<option value="'+x.id+'">'+E(full(x))+'</option>';}).join("")+'</select><div class="two" style="margin-top:12px"><div><label class="lbl">Rounds</label><div class="seg" id="fcxRnN">'+[1,2,3,4].map(function(n){return '<button class="'+(n===2?"on":"")+'" data-v="'+n+'" onclick="fcxSeg(\'fcxRnN\',this)">'+n+'</button>';}).join("")+'</div></div><div><label class="lbl">Level</label><div class="seg" id="fcxRnL">'+["Technical","Medium","Hard"].map(function(l){return '<button class="'+(l==="Technical"?"on":"")+'" data-v="'+l+'" onclick="fcxSeg(\'fcxRnL\',this)">'+l.slice(0,4)+'</button>';}).join("")+'</div></div></div><label class="lbl">Ringside note</label><textarea class="txt" id="fcxRnT" placeholder="What you saw…"></textarea><button class="gold" style="margin-top:10px" onclick="fcxLogRounds(\''+f.id+'\')">Bank the rounds</button></div>';
    h+='<div class="card"><h3>Rounds so far</h3>'+(mn.length?mn.slice().reverse().map(function(r){var o=r.opponent_id?byId(r.opponent_id):null;return '<div class="note"><div class="t">R'+(r.round_no||1)+'</div><div class="b">'+(o?'v '+E(short(o))+' · ':'')+E(r.level||'')+(r.note?' — '+E(r.note):'')+'<small>'+fmtD(r.night_date)+'</small></div><button class="sm x" onclick="fcxDelRound('+r.id+')">×</button></div>';}).join(""):'<p>Nothing banked yet.</p>')+'</div>';
    h+='<div class="card"><div class="row"><h3 style="margin:0">Fight tape</h3><button class="sm" onclick="FC.upFid=\''+f.id+'\';fcxSet(\'sparSub\',\'video\');fcxSet(\'tab\',\'spar\')">+ Upload</button></div>'+(mv.length?mv.map(videoHtml).join(""):'<p>No videos yet.</p>')+'</div>';
  }else if(FC.sub==="ptrain"){
    h+='<div class="card"><div class="row"><h3 style="margin:0">Extra training</h3><button class="sm" onclick="fcxBuildFor(\''+f.id+'\')">+ Build</button></div>'+(my.length?my.map(sessRow).join(""):'<p style="margin-top:6px">Nothing assigned yet.</p>')+'</div>';
  }else if(FC.sub==="pgraph"){h+=graphsHtml(f);}
  return h;
}
window.fcxSeg=function(id,btn){document.querySelectorAll("#"+id+" button").forEach(function(b){b.classList.toggle("on",b===btn);});};
function segVal(id){var b=document.querySelector("#"+id+" button.on");return b?b.dataset.v:null;}
window.fcxAtt=async function(fid,wk,d,val){if(val===-1){await sb.from("fc_attendance").delete().eq("fighter_id",fid).eq("week",wk).eq("day",d);FC.att=FC.att.filter(function(r){return !(r.fighter_id===fid&&r.week===wk&&r.day===d);});R();return;}
  var r=await sb.from("fc_attendance").upsert({camp:"fc2026",fighter_id:fid,week:wk,day:d,attended:val===1,session_date:iso(sessDate(wk,d)),logged_by:session.user.id},{onConflict:"camp,fighter_id,week,day"}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.att=FC.att.filter(function(x){return !(x.fighter_id===fid&&x.week===wk&&x.day===d);});FC.att.push(r.data);R();};
window.fcxStaffWi=async function(fid){var wk=parseInt(($("fcxWiW")||{}).value),kg=parseFloat(($("fcxWiK")||{}).value);if(!(wk>=0&&wk<=10)||!(kg>30)){T("Week and kg");return;}var r=await sb.from("fc_weighins").upsert({camp:"fc2026",fighter_id:fid,week:wk,weight_kg:kg},{onConflict:"camp,fighter_id,week"}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.wi=FC.wi.filter(function(x){return !(x.fighter_id===fid&&x.week===wk);});FC.wi.push(r.data);R();};
window.fcxLogRounds=async function(fid){var d=($("fcxRnD")||{}).value||iso(new Date()),o=($("fcxRnO")||{}).value||null,n=parseInt(segVal("fcxRnN")||"2"),lvl=segVal("fcxRnL")||"Technical",note=(($("fcxRnT")||{}).value||"").trim();
  var existing=FC.rounds.filter(function(r){return r.fighter_id===fid&&r.night_date===d;}).length;var rows=[];for(var i=1;i<=n;i++)rows.push({camp:"fc2026",fighter_id:fid,night_date:d,round_no:existing+i,opponent_id:o,level:lvl,note:i===1?(note||null):null,created_by:session.user.id});
  var r=await sb.from("fc_spar_rounds").insert(rows).select();if(r.error){T("Couldn't save");return;}FC.rounds=FC.rounds.concat(r.data);T(n+" rounds banked");R();};
window.fcxDelRound=async function(id){await sb.from("fc_spar_rounds").delete().eq("id",id);FC.rounds=FC.rounds.filter(function(r){return r.id!==id;});R();};
window.fcxCoachNote=async function(fid){var t=(($("fcxCn")||{}).value||"").trim();if(!t)return;var r=await sb.from("fc_coach_notes").insert({fighter_id:fid,body:t,created_by:session.user.id}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.cnotes.unshift(r.data);T("Saved");R();};
window.fcxSaveF=async function(fid){function v(id){var el=$(id);return el?el.value.trim():"";}function num(id){var x=parseFloat(v(id));return isNaN(x)?null:x;}
  var up={first_name:v("e_fn")||"?",last_name:v("e_ln"),age:num("e_age"),weight_kg:num("e_w"),fight_weight_kg:num("e_fw"),stance:v("e_st"),wins:num("e_wi")||0,losses:num("e_lo")||0,draws:num("e_dr")||0,camp_number:num("e_cn")||1,opponent_id:v("e_op")||null,suburb:v("e_sub")||null,phone:v("e_ph")||null,email:v("e_em")||null,instagram:v("e_ig")||null,photo_url:v("e_ph2")||null,updated_at:new Date().toISOString()};
  var r=await sb.from("fc_fighters").update(up).eq("id",fid).select().maybeSingle();if(r.error){T("Couldn't save: "+r.error.message);return;}var i=FC.F.findIndex(function(x){return x.id===fid;});if(i>=0)FC.F[i]=r.data;
  if(up.opponent_id){var o=byId(up.opponent_id);if(o&&o.opponent_id!==fid){await sb.from("fc_fighters").update({opponent_id:fid}).eq("id",o.id);o.opponent_id=fid;}}
  FC.sub="tape";T("Saved");R();};
window.fcxRemoveF=async function(fid){if(!confirm("Remove this fighter from the camp?"))return;await sb.from("fc_fighters").update({status:"removed"}).eq("id",fid);FC.F=FC.F.filter(function(x){return x.id!==fid;});FC.fid=null;R();};
/* ========== STAFF · EXTRA TRAINING ========== */
function sessRow(s){var f=byId(s.fighter_id),n=(s.items||[]).length,pct=n?Math.round(s.done_rounds/n*100):0;return '<button class="sess" onclick="'+(staff()?'fcxDelSess('+s.id+')':'fcxRun('+s.id+')')+'"><div class="av" style="width:34px;height:34px;font-size:11px">'+(s.done_rounds>=n&&n?'✓':n)+'</div><div class="n"><b>'+E(s.name)+'</b><span>'+(staff()&&f?E(f.first_name)+' · ':'')+n+' rounds'+(s.due_date?' · by '+fmtD(s.due_date):'')+'</span><div class="prog"><i style="width:'+pct+'%"></i></div></div><span class="tag '+(s.done_rounds>=n&&n?'ok':s.done_rounds?'g':'')+'">'+(s.done_rounds>=n&&n?'Done':s.done_rounds?s.done_rounds+'/'+n:'New')+'</span></button>';}
window.fcxDelSess=async function(id){if(!confirm("Remove this session?"))return;await sb.from("fc_sessions").delete().eq("id",id);FC.sess=FC.sess.filter(function(s){return s.id!==id;});R();};
window.fcxBuildFor=function(fid){FC.build.fid=fid;FC.buildStep="build";FC.tab="train";FC.fid=null;R();try{window.scrollTo(0,0);}catch(e){}};
function trainHtml(){
  if(FC.buildStep==="build")return builderHtml();
  return '<div class="card"><div class="row"><h3 style="margin:0">Assigned</h3><span class="tag g">'+FC.sess.length+'</span></div>'+(FC.sess.length?FC.sess.map(sessRow).join(""):'<p>Nothing built yet.</p>')+'</div><button class="gold" onclick="FC.buildStep=\'build\';fcxSub(FC.sub)">Build a session for a fighter</button><p style="font-size:11px;padding:8px 4px 0">Same library as Build Your Own plus road work. It lands in their Camp tab with the round timer, and you see when it\'s done. Tap a session to remove it.</p>';
}
function buildTotal(){var b=FC.build,t=0;b.list.forEach(function(id,i){var it=libFind(id);if(!it)return;t+=itemLen(it,b.len);if(i<b.list.length-1)t+=b.rest;});return t;}
function builderHtml(){
  var b=FC.build;if(!b.fid&&FC.F.length)b.fid=FC.F[0].id;var f=byId(b.fid)||{first_name:"them"};
  var dues=[3,4,6].map(function(n){var d=new Date();d.setDate(d.getDate()+n);return iso(d);});if(!b.due)b.due=dues[1];
  return '<button class="back" onclick="FC.buildStep=\'list\';fcxSub(FC.sub)">‹ Assigned sessions</button>'+
   '<div class="card"><label class="lbl">Fighter</label><select class="txt" onchange="FC.build.fid=this.value;fcxSub(FC.sub)">'+FC.F.map(function(x){return '<option value="'+x.id+'" '+(x.id===b.fid?'selected':'')+'>'+E(full(x))+'</option>';}).join("")+'</select>'+
   '<div class="two" style="margin-top:12px"><div><label class="lbl">Round length</label><div class="seg">'+[120,180].map(function(l){return '<button class="'+(b.len===l?"on":"")+'" onclick="FC.build.len='+l+';fcxSub(FC.sub)">'+fmt(l)+'</button>';}).join("")+'</div></div><div><label class="lbl">Rest</label><div class="seg">'+[30,60].map(function(l){return '<button class="'+(b.rest===l?"on":"")+'" onclick="FC.build.rest='+l+';fcxSub(FC.sub)">'+l+'s</button>';}).join("")+'</div></div></div></div>'+
   '<div class="card"><div class="row"><h3 style="margin:0">Session so far</h3><span class="tag g">'+b.list.length+' rounds · '+Math.round(buildTotal()/60)+' min</span></div>'+(b.list.length?b.list.map(function(id,i){var it=libFind(id)||{n:id,tag:""};return '<div class="rnd"><div class="num">'+(i+1)+'</div><div class="n"><b>'+E(it.n)+'</b><span>'+E(it.tag||"")+'</span></div><div class="len">'+fmt(itemLen(it,b.len))+'</div><button class="rm" onclick="FC.build.list.splice('+i+',1);fcxSub(FC.sub)">×</button></div>';}).join(""):'<p style="margin-top:6px">Tap rounds from the library below.</p>')+'</div>'+
   '<div class="card"><h3>Library</h3>'+LIB().map(function(c,i){return '<details class="lib" '+(i<2?'open':'')+'><summary>'+E(c.cat)+'</summary><div class="chips">'+c.items.map(function(it){return '<button class="chip" onclick="FC.build.list.push(\''+it.id+'\');fcxSub(FC.sub)">'+E(it.n)+'</button>';}).join("")+'</div></details>';}).join("")+'</div>'+
   '<div class="card"><label class="lbl">Session name</label><input class="txt" id="fcxBn" placeholder="e.g. Straight punches & lead hand" value="'+E(b.name)+'"><label class="lbl">Note to '+E(f.first_name)+'</label><textarea class="txt" id="fcxBt" placeholder="What this is for, what to focus on…">'+E(b.note)+'</textarea><label class="lbl">Do it by</label><div class="seg">'+dues.map(function(d){return '<button class="'+(b.due===d?"on":"")+'" onclick="FC.build.due=\''+d+'\';fcxKeep();fcxSub(FC.sub)">'+fmtD(d)+'</button>';}).join("")+'</div><button class="gold" style="margin-top:14px" onclick="fcxAssign()">Send to '+E(f.first_name)+'\'s app</button></div>';
}
window.fcxKeep=function(){var b=FC.build;var n=$("fcxBn"),t=$("fcxBt");if(n)b.name=n.value;if(t)b.note=t.value;};
window.fcxAssign=async function(){fcxKeep();var b=FC.build;if(!b.list.length){T("Add some rounds first");return;}var f=byId(b.fid);
  var r=await sb.from("fc_sessions").insert({camp:"fc2026",fighter_id:b.fid,name:b.name||"Extra session",note:b.note||null,len_sec:b.len,rest_sec:b.rest,items:b.list,due_date:b.due||null,created_by:session.user.id}).select().maybeSingle();if(r.error){T("Couldn't save: "+r.error.message);return;}
  FC.sess.unshift(r.data);FC.build={fid:b.fid,len:b.len,rest:b.rest,list:[],name:"",note:"",due:""};FC.buildStep="list";T("Sent to "+(f?f.first_name:"them"));R();try{window.scrollTo(0,0);}catch(e){}};
/* ========== RUN A SESSION (fighter) ========== */
window.fcxRun=function(id){var s=FC.sess.find(function(x){return x.id===id;});if(!s)return;var items=s.items||[];if(!items.length){T("Empty session");return;}var start=s.done_rounds<items.length?s.done_rounds:0;FC.run={s:s,idx:start,phase:"ready",left:0};view="fcrun";try{renderNav();}catch(e){}renderRun();};
function stopRun(){if(FC.timer){clearInterval(FC.timer);FC.timer=null;}FC.run=null;}
window.fcxGo=function(){var r=FC.run;if(!r)return;var it=libFind(r.s.items[r.idx]);r.phase="work";r.left=itemLen(it||{},r.s.len_sec||180);if(FC.timer)clearInterval(FC.timer);FC.timer=setInterval(tick,1000);renderRun();};
window.fcxStop=function(){stopRun();view="fc";FC.tab=staff()?"train":"camp";try{renderNav();}catch(e){}R();};
function tick(){var r=FC.run;if(!r)return;r.left--;if(r.left<=0){var n=r.s.items.length;if(r.phase==="work"){r.s.done_rounds=Math.max(r.s.done_rounds,r.idx+1);if(!staff())sb.rpc("fc_session_progress",{p_id:r.s.id,p_done:r.s.done_rounds}).then(function(){});try{if(navigator.vibrate)navigator.vibrate([200,100,200]);}catch(e){}
      if(r.idx+1>=n){stopRun();view="fc";FC.tab=staff()?"train":"camp";try{renderNav();}catch(e){}R();T("Session done — Jake can see it");return;}r.phase="rest";r.left=r.s.rest_sec||30;}
    else{r.phase="work";r.idx++;var it=libFind(r.s.items[r.idx]);r.left=itemLen(it||{},r.s.len_sec||180);try{if(navigator.vibrate)navigator.vibrate(200);}catch(e){}}}
  renderRun();}
function renderRun(){var r=FC.run;if(!r){view="fc";R();return;}var s=r.s,n=s.items.length,it=libFind(s.items[r.idx])||{n:s.items[r.idx],tag:""};
  $("main").innerHTML='<div class="fcx"><button class="back" onclick="fcxStop()">‹ Stop</button><div class="card timer"><div class="ph">'+(r.phase==="rest"?"Rest":"Round "+(r.idx+1)+" of "+n)+'</div><div class="big">'+(r.phase==="ready"?fmt(itemLen(it,s.len_sec||180)):fmt(r.left))+'</div><div class="what">'+(r.phase==="rest"?"Breathe":E(it.n))+'</div><div class="sub">'+(r.phase==="rest"?"Next: "+E((libFind(s.items[r.idx+1])||{n:""}).n):E(it.tag||""))+'</div>'+(r.phase==="ready"?'<button class="gold" style="margin-top:14px" onclick="fcxGo()">Start round '+(r.idx+1)+'</button>':'')+'<div class="prog" style="margin-top:14px"><i style="width:'+Math.round((r.idx+(r.phase==="rest"?1:0))/n*100)+'%"></i></div></div>'+
   (s.note?'<div class="card" style="border-color:#3a3320"><div style="font-size:9.5px;font-weight:900;letter-spacing:2.5px;color:#c9a44c;text-transform:uppercase">Jake\'s note</div><p style="margin-top:6px;color:#f2f0eb">'+E(s.note)+'</p></div>':'')+
   '<div class="card"><h3>'+E(s.name)+'</h3>'+s.items.map(function(id,i){var x=libFind(id)||{n:id};return '<div class="rnd"><div class="num">'+(i+1)+'</div><div class="n"><b style="'+(i<r.idx?'color:#9a9891;text-decoration:line-through':i===r.idx?'color:#F1D27A':'')+'">'+E(x.n)+'</b></div><div class="len">'+fmt(itemLen(x,s.len_sec||180))+'</div></div>';}).join("")+'</div></div>';}
/* ========== STAFF · SPARRING ========== */
function nextNights(){var out=[],d=new Date();d.setHours(0,0,0,0);for(var i=0;i<21&&out.length<4;i++){var x=new Date(d);x.setDate(d.getDate()+i);if(x.getDay()===3||x.getDay()===6)out.push(iso(x));}return out;}
function fitHtml(){var m=FC.m,a=byId(m.a),b=byId(m.b);if(!a||!b)return '';if(!a.weight_kg||!b.weight_kg)return '<div class="fit warn">One of these fighters has no weight on their profile — set it before you match them.</div>';var d=Math.abs(a.weight_kg-b.weight_kg),ea=a.wins+a.losses,eb=b.wins+b.losses,msgs=[];
  msgs.push(d<=5?"Weight: "+a.weight_kg+" v "+b.weight_kg+" kg — "+d.toFixed(1).replace(/\.0$/,"")+" kg apart, good.":d<=10?"Weight: "+a.weight_kg+" v "+b.weight_kg+" kg — "+d.toFixed(1).replace(/\.0$/,"")+" kg apart. OK for technical, not for hard.":"Weight: "+a.weight_kg+" v "+b.weight_kg+" kg — "+d.toFixed(1).replace(/\.0$/,"")+" kg apart. Too far.");
  msgs.push(Math.abs(ea-eb)<=1?"Experience: "+ea+" v "+eb+" bouts — even.":"Experience: "+ea+" v "+eb+" bouts — keep it technical.");if(a.stance&&b.stance&&a.stance!==b.stance)msgs.push(a.stance+" v "+b.stance+" — good look for both.");if(a.opponent_id===b.id)msgs.push("These two fight each other on the 19th — technical only.");
  var ok=d<=5&&Math.abs(ea-eb)<=1;return '<div class="fit '+(ok?"ok":d>10?"":"warn")+'">'+msgs.join("<br>")+'</div>';}
function sparStaffHtml(){
  var tabs=[["board","Board"],["match","Match"],["video","Video"]];var h='<div class="pills">'+tabs.map(function(t){return '<button class="'+(FC.sparSub===t[0]?"on":"")+'" onclick="fcxSet(\'sparSub\',\''+t[0]+'\')">'+t[1]+'</button>';}).join("")+'</div>';
  if(FC.sparSub==="board"){var today=iso(new Date());var up=FC.pairs.filter(function(p){return p.night_date>=today;}),past=FC.pairs.filter(function(p){return p.night_date<today;});
    h+='<div class="card"><div class="row"><h3 style="margin:0">Coming up</h3><span class="tag g">'+up.length+' pairs</span></div>'+(up.length?up.map(function(p){return pairRow(p)+'<button class="sm x" style="margin:-4px 0 8px" onclick="fcxDelPair('+p.id+')">Remove</button>';}).join(""):'<p>Nothing on the board. Match a pair below.</p>')+'</div>';
    h+='<button class="line" onclick="fcxSet(\'sparSub\',\'match\')">+ New pairing</button>';
    if(past.length)h+='<div class="card" style="margin-top:12px"><h3>Past</h3>'+past.slice(-6).reverse().map(pairRow).join("")+'</div>';
  }else if(FC.sparSub==="match"){var m=FC.m;var w=FC.F.filter(function(f){return f.weight_kg;});if(!m.a&&w[0])m.a=w[0].id;if(!m.b&&w[1])m.b=w[1].id;var nights=nextNights();if(!m.night)m.night=nights[0];
    var opts=function(sel){return FC.F.map(function(f){return '<option value="'+f.id+'" '+(sel===f.id?'selected':'')+'>'+E(full(f))+(f.weight_kg?' · '+f.weight_kg+' kg':'')+'</option>';}).join("");};
    h+='<div class="card"><h3>Match sparring</h3><div class="match"><select class="txt" onchange="FC.m.a=this.value;fcxSub(FC.sub)">'+opts(m.a)+'</select><span class="amp">&amp;</span><select class="txt" onchange="FC.m.b=this.value;fcxSub(FC.sub)">'+opts(m.b)+'</select></div>'+fitHtml()+
      '<div class="two" style="margin-top:12px"><div><label class="lbl">Rounds</label><div class="seg">'+[2,3,4].map(function(r){return '<button class="'+(m.rounds===r?"on":"")+'" onclick="FC.m.rounds='+r+';fcxSub(FC.sub)">'+r+'</button>';}).join("")+'</div></div><div><label class="lbl">Intensity</label><div class="seg">'+["Technical","Medium","Hard"].map(function(l){return '<button class="'+(m.lvl===l?"on":"")+'" onclick="FC.m.lvl=\''+l+'\';fcxSub(FC.sub)">'+l.slice(0,4)+'</button>';}).join("")+'</div></div></div>'+
      '<label class="lbl">Night</label><div class="seg">'+nights.map(function(d){return '<button class="'+(m.night===d?"on":"")+'" onclick="FC.m.night=\''+d+'\';fcxSub(FC.sub)">'+fmtD(d).replace(/,/,"")+'</button>';}).join("")+'</div><label class="lbl">Note to both</label><textarea class="txt" id="fcxPn" placeholder="What you want out of these rounds…"></textarea><button class="gold" style="margin-top:12px" onclick="fcxPair()">Send to both fighters</button></div>';
  }else{h+='<div class="card"><h3>Upload sparring video</h3><label class="lbl">Fighter</label><select class="txt" id="fcxUpF">'+FC.F.map(function(f){return '<option value="'+f.id+'" '+(FC.upFid===f.id?'selected':'')+'>'+E(full(f))+'</option>';}).join("")+'</select><label class="lbl">Title</label><input class="txt" id="fcxUpT" placeholder="Sparring v … — '+fmtD(iso(new Date()))+'"><label class="up" style="margin-top:12px"><b>Tap to choose a video</b>From your phone — it goes straight onto the fighter\'s profile. Up to 500 MB.<input type="file" accept="video/*" style="display:none" onchange="fcxUpload(this)"></label><p id="fcxUpS" style="margin-top:8px;color:#F1D27A"></p></div>';
    var recent=FC.vids.slice(0,8);h+='<div class="card"><h3>Recent tape</h3>'+(recent.length?recent.map(function(v){var f=byId(v.fighter_id);return (f?'<div style="font-size:10px;font-weight:900;letter-spacing:2px;color:#c9a44c;text-transform:uppercase;margin-top:10px">'+E(full(f))+'</div>':'')+videoHtml(v);}).join(""):'<p>Nothing uploaded yet.</p>')+'</div>';}
  return h;
}
window.fcxPair=async function(){var m=FC.m;if(!m.a||!m.b||m.a===m.b){T("Pick two different fighters");return;}var note=(($("fcxPn")||{}).value||"").trim();
  var r=await sb.from("fc_spar_pairs").insert({camp:"fc2026",night_date:m.night,a_id:m.a,b_id:m.b,rounds:m.rounds,level:m.lvl,note:note||null,created_by:session.user.id}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.pairs.push(r.data);FC.sparSub="board";T("On the board — both fighters get it in their tab");
  R();};
window.fcxDelPair=async function(id){await sb.from("fc_spar_pairs").delete().eq("id",id);FC.pairs=FC.pairs.filter(function(p){return p.id!==id;});R();};
/* ========== STAFF · CAMP ========== */
function campStaffHtml(){
  var w=WEEK();var matched=FC.F.filter(function(f){return f.opponent_id;});var seen={};var pairsM=[];matched.forEach(function(f){if(seen[f.id])return;var o=byId(f.opponent_id);if(!o)return;seen[f.id]=seen[o.id]=1;pairsM.push([f,o]);});
  var ci=FC.wi.filter(function(r){return r.week===w;});
  return '<div class="hero"><div class="k">'+(isOpen()?"Open to fighters":"Locked · opens "+opensAt().toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"}))+'</div><div class="t">'+(w===0?"Pre-camp":"Week "+w+" · "+PHASE[w-1])+'</div><div class="s">'+FC.F.length+' fighters · '+FC.F.filter(function(f){return f.user_id;}).length+' linked to the app · '+FC.F.filter(function(f){return f.opponent_id;}).length+' matched</div>'+weekBar()+'</div>'+
   '<div class="card"><h3>Post a camp note</h3><textarea class="txt" id="fcxNote" placeholder="Goes to every fighter\'s Camp tab'+''+'…"></textarea><button class="gold" style="margin-top:8px" onclick="fcxPost()">Send to the camp</button></div>'+
   '<div class="card"><div class="row"><h3 style="margin:0">Matchups · 19 Dec</h3><span class="tag fc">'+pairsM.length+' set</span></div>'+(pairsM.length?pairsM.map(function(p){return '<div class="pair"><div class="p r">'+E(full(p[0]))+'<span>'+p[0].wins+'-'+p[0].losses+'-'+p[0].draws+(p[0].fight_weight_kg?' · '+p[0].fight_weight_kg+' kg':'')+'</span></div><span class="amp">&amp;</span><div class="p">'+E(full(p[1]))+'<span>'+p[1].wins+'-'+p[1].losses+'-'+p[1].draws+(p[1].fight_weight_kg?' · '+p[1].fight_weight_kg+' kg':'')+'</span></div></div>';}).join(""):'<p>None yet. Set an opponent from a fighter\'s profile › Edit — it matches both ways.</p>')+'</div>'+
   '<div class="card"><h3>Sunday check-ins · week '+w+'</h3>'+(ci.length?ci.map(function(r){var f=byId(r.fighter_id);if(!f)return '';return '<button class="fr" onclick="fcxOpen(\''+f.id+'\')">'+av(f)+'<div class="n"><b>'+E(full(f))+'</b><span>'+(r.weight_kg?r.weight_kg+' kg':'no weight')+(r.body?' · body '+r.body+'/5':'')+(r.niggle?' · '+E(r.niggle):'')+'</span></div>'+(r.niggle?'<span class="tag rd">Niggle</span>':'<span class="tag ok">Good</span>')+'</button>';}).join(""):'<p>Nobody has checked in this week yet.</p>')+'</div>'+
   '<div class="card"><h3>Camp notes sent</h3>'+(FC.notes.length?FC.notes.map(function(n){return '<div class="feed"><div class="av">J</div><div class="b">'+E(n.body)+'<small>'+fmtD(n.created_at)+' <button class="sm x" style="padding:2px 7px;margin-left:6px" onclick="fcxDelNote('+n.id+')">delete</button></small></div></div>';}).join(""):'<p>Nothing posted yet.</p>')+'</div>';
}
window.fcxPost=async function(){var t=(($("fcxNote")||{}).value||"").trim();if(!t)return;var r=await sb.from("fc_notes").insert({camp:"fc2026",body:t,created_by:session.user.id}).select().maybeSingle();if(r.error){T("Couldn't save");return;}FC.notes.unshift(r.data);T("Posted");R();};
window.fcxDelNote=async function(id){await sb.from("fc_notes").delete().eq("id",id);FC.notes=FC.notes.filter(function(n){return n.id!==id;});R();};
/* ---------- hooks ---------- */
try{NAV_TAB.fc="home";NAV_TAB.fcrun="home";}catch(e){}
var _render=window.render;window.render=function(){if(view==="fc")return renderFC();if(view==="fcrun")return renderRun();return _render.apply(this,arguments);};
var _go=window.go;window.go=function(v){if(view==="fcrun"&&v!=="fcrun")stopRun();if(v==="fc"&&staff()){FC.loaded=false;FC.loading=null;}return _go.apply(this,arguments);};
["renderHome"].forEach(function(fn){if(typeof window[fn]!=="function")return;var o=window[fn];window[fn]=function(){var r=o.apply(this,arguments);var after=function(){injectCard();if(!FC.loaded&&session)load();};if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,30);return r;};});
setTimeout(function(){if(view==="home")injectCard();},800);
})();

/*__FCINFO__ ==========================================================
   Fight Club Info Night — home-screen takeover.
   Additive block. Self-expiring: does nothing before 16 Sep 2026 09:00
   or after 21:00 the same night, so it can be left in place.
   Delete from this comment to the matching })(); to roll back.
   ==================================================================== */
(function(){
  var EVENT = "fc-info-2026-09-16";
  var START = new Date(2026,8,16, 9,0,0,0).getTime();   /* 9:00am  16 Sep */
  var DOORS = new Date(2026,8,16,18,45,0,0).getTime();  /* 6:45pm  16 Sep */
  var END   = new Date(2026,8,16,21,0,0,0).getTime();   /* 9:00pm  16 Sep */
  if (Date.now() >= END) return;

  var S = { count:null, mine:false, asked:false, busy:false };
  var timer = null;

  function liveNow(){ var n = Date.now(); return n >= START && n < END; }
  function EH(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function prof(){ try { return (typeof profile !== "undefined" && profile) ? profile : null; } catch(e){ return null; } }

  var st = document.createElement("style");
  st.id = "fcInfoCss";
  st.textContent =
  '@keyframes fcInfoPulse{'
  + '0%,100%{border-color:#c9a44c;box-shadow:0 0 0 0 rgba(201,164,76,.55),0 0 26px 2px rgba(201,164,76,.32),0 12px 34px rgba(0,0,0,.55)}'
  + '45%{border-color:#FF2D87;box-shadow:0 0 0 8px rgba(255,45,135,0),0 0 30px 3px rgba(255,45,135,.42),0 12px 34px rgba(0,0,0,.55)}'
  + '50%{border-color:#FF2D87;box-shadow:0 0 0 0 rgba(255,45,135,.55),0 0 30px 3px rgba(255,45,135,.42),0 12px 34px rgba(0,0,0,.55)}'
  + '95%{border-color:#c9a44c;box-shadow:0 0 0 8px rgba(201,164,76,0),0 0 26px 2px rgba(201,164,76,.32),0 12px 34px rgba(0,0,0,.55)}}'
  + '@keyframes fcInfoChip{0%,100%{background:#c9a44c;color:#161307}50%{background:#FF2D87;color:#fff}}'
  + '@keyframes fcInfoBump{0%{transform:scale(1)}28%{transform:scale(1.45);color:#FF2D87}100%{transform:scale(1)}}'
  + '#fcInfoAlert{position:relative;overflow:hidden;border-radius:18px;margin-bottom:16px;border:2.5px solid #c9a44c;'
  + 'background:#121214;animation:fcInfoPulse 3.2s ease-in-out infinite}'
  + '#fcInfoAlert .cap{height:5px;background:linear-gradient(90deg,#c9a44c 0 50%,#FF2D87 50% 100%)}'
  + '#fcInfoAlert .in{padding:17px 17px 18px}'
  + '#fcInfoAlert .chip{display:inline-flex;align-items:center;gap:7px;font-family:Oswald,sans-serif;font-size:11px;'
  + 'letter-spacing:3px;text-transform:uppercase;font-weight:600;color:#161307;background:#c9a44c;padding:5px 11px;'
  + 'border-radius:999px;animation:fcInfoChip 3.2s ease-in-out infinite}'
  + '#fcInfoAlert .ttl{font-family:Oswald,sans-serif;font-weight:700;font-size:29px;line-height:1.02;text-transform:uppercase;'
  + 'color:#fff;margin:11px 0 0;letter-spacing:.5px}'
  + '#fcInfoAlert .ttl em{font-style:normal;display:block;font-size:19px;color:#9a9891;font-weight:500;margin-top:5px;letter-spacing:1px}'
  + '#fcInfoAlert .when{display:flex;gap:9px;margin-top:13px;flex-wrap:wrap}'
  + '#fcInfoAlert .when span{font-size:12px;font-weight:600;color:#e8e2d2;background:rgba(255,255,255,.05);'
  + 'border:1px solid #26262b;border-radius:8px;padding:6px 10px}'
  + '#fcInfoAlert .sts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}'
  + '#fcInfoAlert .st{border:1.5px solid #26262b;border-radius:11px;padding:10px 11px;background:rgba(255,255,255,.02)}'
  + '#fcInfoAlert .st.w{border-color:#FF2D87}#fcInfoAlert .st.m{border-color:#c9a44c}'
  + '#fcInfoAlert .st .k{font-family:Oswald,sans-serif;font-size:13px;letter-spacing:1.4px;font-weight:600}'
  + '#fcInfoAlert .st.w .k{color:#FF2D87}#fcInfoAlert .st.m .k{color:#c9a44c}'
  + '#fcInfoAlert .st .v{font-size:11.5px;color:#9a9891;margin-top:3px;line-height:1.4}'
  + '#fcInfoAlert .going{display:flex;align-items:center;gap:11px;margin-top:13px;background:rgba(0,0,0,.38);'
  + 'border:1px solid #26262b;border-radius:10px;padding:9px 12px}'
  + '#fcInfoAlert .going .n{font-family:Oswald,sans-serif;font-size:20px;color:#fff;font-weight:700;'
  + 'font-variant-numeric:tabular-nums;line-height:1;display:inline-block}'
  + '#fcInfoAlert .going.bump .n{animation:fcInfoBump .7s cubic-bezier(.34,1.56,.64,1)}'
  + '#fcInfoAlert .going .t{font-size:12px;color:#9a9891;line-height:1.35}'
  + '#fcInfoAlert .cdl{display:flex;align-items:center;gap:8px;margin-top:15px;font-family:Oswald,sans-serif;'
  + 'font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:#9a9891;font-weight:500}'
  + '#fcInfoAlert .cdl:after{content:"";flex:1;height:1px;background:#26262b}'
  + '#fcInfoAlert .cd{display:flex;gap:7px;margin-top:8px}'
  + '#fcInfoAlert .cd div{flex:1;background:rgba(0,0,0,.4);border:1px solid #26262b;border-radius:10px;padding:8px 4px;text-align:center}'
  + '#fcInfoAlert .cd .n{font-family:Oswald,sans-serif;font-size:21px;font-weight:700;color:#f2f0eb;'
  + 'font-variant-numeric:tabular-nums;line-height:1}'
  + '#fcInfoAlert .cd .l{font-size:8px;letter-spacing:1.6px;text-transform:uppercase;color:#6e6b74;margin-top:3px}'
  + '#fcInfoAlert .ease{margin-top:14px;border:1px solid #26262b;border-left:3px solid #FF2D87;border-radius:10px;'
  + 'background:rgba(255,255,255,.035);padding:12px 13px;font-size:13px;line-height:1.5;color:#e8e2d2}'
  + '#fcInfoAlert .ease b{color:#fff;font-weight:700}'
  + '#fcInfoAlert .cta{display:block;width:100%;margin-top:12px;border:0;border-radius:11px;padding:14px;cursor:pointer;'
  + 'font-family:Oswald,sans-serif;font-size:14.5px;letter-spacing:1.6px;text-transform:uppercase;font-weight:600;'
  + 'background:#c9a44c;color:#161307;animation:fcInfoChip 3.2s ease-in-out infinite}'
  + '#fcInfoAlert .cta[disabled]{animation:none;background:#1d2a20;color:#4bc97a;border:1px solid #2c4433;cursor:default}'
  + '#fcInfoAlert .foot{margin-top:10px;font-size:11px;color:#6e6b74;text-align:center}'
  + '@media (prefers-reduced-motion:reduce){#fcInfoAlert,#fcInfoAlert .chip,#fcInfoAlert .cta{animation:none!important}'
  + '#fcInfoAlert{border-color:#FF2D87}}';
  try { document.head.appendChild(st); } catch(e){}

  function cdParts(){
    var ms = DOORS - Date.now();
    if (ms <= 0) return { h:"00", m:"00", s:"00", started:true };
    var t = Math.floor(ms/1000);
    function p(n){ n = String(n); return n.length < 2 ? "0"+n : n; }
    return { h:p(Math.floor(t/3600)), m:p(Math.floor(t%3600/60)), s:p(t%60), started:false };
  }

  function goingLine(){
    if (S.count === null) return '<span class="t">Loading who’s going…</span>';
    return '<span class="t"><span class="n">' + S.count + '</span> going'
         + (S.mine ? ' &nbsp;·&nbsp; <b style="color:#4bc97a">You’re on the list</b>' : '') + '</span>';
  }

  function html(){
    var c = cdParts();
    return '<div id="fcInfoAlert">'
    + '<div class="cap"></div><div class="in">'
    + '<span class="chip">' + (c.started ? "Happening now" : "Tonight") + '</span>'
    + '<div class="ttl">Fight Club<br>Info Night<em>Women’s &amp; Men’s · 10 week camp</em></div>'
    + '<div class="when"><span>Tonight, 6:45pm</span><span>At the gym</span><span>Free</span></div>'
    + '<div class="sts">'
    +   '<div class="st w"><div class="k">Women’s</div><div class="v">Own sessions, own coaches, same camp.</div></div>'
    +   '<div class="st m"><div class="k">Men’s</div><div class="v">Every fitness level. No experience needed.</div></div>'
    + '</div>'
    + '<div class="going">' + goingLine() + '</div>'
    + '<div class="cdl">' + (c.started ? "Started — come on in" : "Starts 6:45pm tonight") + '</div>'
    + '<div class="cd">'
    +   '<div><div class="n">'+c.h+'</div><div class="l">Hrs</div></div>'
    +   '<div><div class="n">'+c.m+'</div><div class="l">Min</div></div>'
    +   '<div><div class="n">'+c.s+'</div><div class="l">Sec</div></div>'
    + '</div>'
    + '<div class="ease"><b>No pressure to fight.</b> Come along, have a listen, ask whatever you want — and decide after. '
    + 'Plenty do the ten weeks and never step in the ring.</div>'
    + (S.mine
        ? '<button class="cta" disabled>✓ You’re on the list</button>'
        : '<button class="cta" onclick="fcInfoRsvp()">Save me a spot</button>')
    + '<div class="foot">Free · everyone welcome · nothing to sign tonight</div>'
    + '</div></div>';
  }

  /* ---- data ---- */
  async function load(){
    if (S.asked || typeof sb === "undefined" || !sb) return;
    S.asked = true;
    try {
      var r = await sb.from("info_night_rsvps").select("email").eq("event_key", EVENT);
      if (!r.error) {
        var seen = {}, n = 0;
        (r.data || []).forEach(function(x){
          var k = (x.email || "").trim().toLowerCase();
          if (!k) { n++; return; }
          if (!seen[k]) { seen[k] = 1; n++; }
        });
        S.count = n;
        var p = prof(), me = p && p.email ? String(p.email).trim().toLowerCase() : "";
        S.mine = !!me && !!seen[me];
      }
    } catch(e){}
    paint();
  }

  window.fcInfoRsvp = async function(){
    if (S.busy || S.mine) return;
    var p = prof();
    if (!p) { try { toast("Sign in first"); } catch(e){} return; }
    S.busy = true;
    try {
      var nm = [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || p.name || "Member";
      var r = await sb.from("info_night_rsvps").insert({
        event_key: EVENT, full_name: nm,
        mobile: p.phone || null, email: p.email || null,
        source: "app"
      });
      if (r && r.error) { try { toast("Couldn’t save — see you there anyway"); } catch(e){} S.busy = false; return; }
      S.mine = true;
      if (S.count !== null) S.count++;
      try { toast("You’re on the list — see you at 6:45"); } catch(e){}
      paint(true);
    } catch(e){ try { toast("Couldn’t save — see you there anyway"); } catch(e2){} }
    S.busy = false;
  };

  /* ---- paint ---- */
  function hideOthers(main){
    ["#springBanner", "#timetableCountdown", ".t10banner", ".revcard"].forEach(function(sel){
      main.querySelectorAll(sel).forEach(function(el){ el.style.display = "none"; });
    });
    main.querySelectorAll(".notice").forEach(function(el){
      if (!el.closest("#fcInfoAlert")) el.style.display = "none";
    });
  }

  function paint(bump){
    var main = document.getElementById("main");
    if (!main) return;
    var onHome = true;
    try { onHome = (typeof view === "undefined") || view === "home"; } catch(e){}
    var old = document.getElementById("fcInfoAlert");
    if (!onHome || !liveNow()) { if (old) old.remove(); return; }
    if (old) old.remove();
    hideOthers(main);
    main.insertAdjacentHTML("afterbegin", html());
    if (bump) {
      var g = document.querySelector("#fcInfoAlert .going");
      if (g) { g.classList.add("bump"); setTimeout(function(){ g.classList.remove("bump"); }, 1500); }
    }
    if (!S.asked) load();
    if (!timer) timer = setInterval(tick, 1000);
  }

  function tick(){
    var el = document.getElementById("fcInfoAlert");
    if (!el) return;
    if (!liveNow()) { el.remove(); return; }
    var c = cdParts(), n = el.querySelectorAll(".cd .n");
    if (n.length === 3) { n[0].textContent = c.h; n[1].textContent = c.m; n[2].textContent = c.s; }
  }

  /* ---- hook home render, same pattern as the card above ---- */
  ["renderHome"].forEach(function(fn){
    if (typeof window[fn] !== "function") return;
    var o = window[fn];
    window[fn] = function(){
      var r = o.apply(this, arguments);
      var after = function(){ try { paint(); } catch(e){} };
      if (r && typeof r.then === "function") r.then(after); else setTimeout(after, 40);
      return r;
    };
  });
  setTimeout(function(){ try { if (typeof view === "undefined" || view === "home") paint(); } catch(e){} }, 900);
})();
