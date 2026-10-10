/*__NUT__ =============================================================
   NUTRITION: privately assigned nutrition programs (first one: the
   Road to Christmas Fuel Plan for Henry Matthews, with Alison's coach
   view). Additive add-on, same pattern as fc.js / rtx.js.

   ACCESS: driven entirely by data. A member sees the NUTRITION tile only
   when they have a row in public.nutrition_assignments (user_id = their
   auth user id). RLS on nutrition_programs / nutrition_assignments means
   the database returns nothing to anyone else, so the default is hidden.
   Nothing here checks names, groups, challenges or roles.

   To give someone a program: insert a nutrition_programs row (once) and a
   nutrition_assignments row (program_id, user_id). That's it.

   Content lives in nutrition_programs.content (format "fuel_plan_v1"):
     { plan: <rtc_plan_data.json>, start_here_md, recipe_intros, targets_note }
   Every number on screen comes from that JSON. Nothing is recalculated.

   Delete this file + its <script> tag + the make-icons copy entries to
   roll back. Touches nothing else. Local Blokes is untouched.
   ==================================================================== */
(function(){
  var N={loaded:false,loading:null,progs:[],cur:null,tab:"start",plan:null,pv:"byo",fonts:false,open:{}};
  var E=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
  var T=function(m){try{toast(m);}catch(e){}};
  function uid(){try{return (session&&session.user&&session.user.id)||null;}catch(e){return null;}}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){return null;}}

  /* ---------- design tokens (brief section 5 + reference HTML) ---------- */
  var css=document.createElement("style");css.id="nutCss";css.textContent=`
.nut{--ink:#0c0d0f;--panel:#16181c;--panel2:#1e2127;--line:#2e333b;--blue:#4a8de6;--bluesoft:rgba(74,141,230,.13);--text:#f1f3f6;--muted:#a9b0bb;
  --disp:"Archivo Narrow","Arial Narrow","Roboto Condensed",Oswald,sans-serif;--body:"Poppins",system-ui,-apple-system,"Segoe UI",sans-serif;
  color:var(--text);font-family:var(--body);font-size:15px;line-height:1.6;margin:-20px -18px 0;padding:0 0 110px;background:var(--ink);min-height:100vh}
.nut *{box-sizing:border-box}
.nut p{margin:0}.nut b,.nut strong{font-weight:600;color:var(--text)}
.nut .disp,.nut h1,.nut h2,.nut h3{font-family:var(--disp);text-transform:uppercase;letter-spacing:.04em;margin:0;font-weight:700}
.nut .wrap{max-width:720px;margin:0 auto;padding:0 16px}
.nut .top{position:sticky;top:var(--nutTop,60px);z-index:5;background:var(--ink);border-bottom:1px solid var(--line)}
.nut .topIn{max-width:720px;margin:0 auto;padding:10px 16px 0}
.nut .back{appearance:none;background:none;border:0;padding:0 0 6px;color:var(--blue);font-family:var(--disp);font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.nut .brand{display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap}
.nut .brand .disp{color:var(--blue);font-size:17px;letter-spacing:.22em}
.nut .brand small{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.nut .tabs{display:flex;gap:4px;margin-top:10px}
.nut .tab{flex:1;appearance:none;background:none;border:0;border-bottom:3px solid transparent;color:var(--muted);font-family:var(--disp);font-size:16px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:10px 4px;cursor:pointer}
.nut .tab.on{color:var(--text);border-bottom-color:var(--blue)}
.nut .tab:focus-visible,.nut .seg button:focus-visible,.nut details.rec summary:focus-visible,.nut .jump:focus-visible{outline:2px solid var(--blue);outline-offset:2px}
.nut .hero{padding:28px 0 8px}
.nut .eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--blue);font-weight:600}
.nut .hero h1{font-size:44px;line-height:1;margin-top:6px;text-wrap:balance}
.nut .hero p{margin-top:10px;color:var(--muted);max-width:52ch}
.nut .sec{margin-top:30px;display:flex;flex-direction:column;gap:12px}
.nut .sec>h2{font-size:21px;background:var(--blue);color:var(--ink);padding:9px 12px;border-radius:3px;text-wrap:balance}
.nut .sec h3{font-size:16px;color:var(--blue);margin-top:6px}
.nut .sec p,.nut .sec li{max-width:64ch}
.nut ul.dots{margin:0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.nut ul.dots li{position:relative;padding-left:18px}
.nut ul.dots li::before{content:"";position:absolute;left:2px;top:.65em;width:7px;height:7px;border-radius:50%;background:var(--blue)}
.nut .callout{border-left:3px solid var(--blue);background:var(--panel);padding:12px 14px;font-weight:500}
.nut .important{border:1px solid var(--blue);background:var(--bluesoft);padding:14px 16px;border-radius:4px}
.nut .important .disp{color:var(--blue);font-size:15px;letter-spacing:.14em;display:block;margin-bottom:4px}
.nut .tbl{overflow-x:auto;border:1px solid var(--line);border-radius:4px}
.nut table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:14px}
.nut th,.nut td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--line);vertical-align:top}
.nut tr:last-child td{border-bottom:0}
.nut thead th{background:var(--panel2);font-family:var(--disp);letter-spacing:.08em;text-transform:uppercase;font-size:14px;color:var(--blue)}
.nut td:first-child{color:var(--muted)}
.nut .day{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;align-items:baseline;margin:0}
.nut .day dt{font-family:var(--disp);text-transform:uppercase;letter-spacing:.06em;color:var(--blue);font-weight:600;white-space:nowrap}
.nut .day dd{margin:0;min-width:0}
.nut .fine{font-size:13px;color:var(--muted)}
.nut .sauces{columns:2;column-gap:20px}
@media (max-width:420px){.nut .sauces{columns:1}}
.nut .planHead{padding:18px 0 0;display:flex;flex-direction:column;gap:14px}
.nut .seg{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:4px}
.nut .seg button{appearance:none;border:0;border-radius:4px;background:none;color:var(--muted);padding:9px 6px;cursor:pointer;font-family:var(--disp);text-transform:uppercase;letter-spacing:.06em;font-size:15px;font-weight:600;line-height:1.2}
.nut .seg button small{display:block;font-family:var(--body);text-transform:none;letter-spacing:0;font-size:12px;font-weight:400}
.nut .seg button.on{background:var(--blue);color:var(--ink)}
.nut .seg.sub{background:none;border:0;padding:0;border-bottom:1px solid var(--line);border-radius:0;gap:0}
.nut .seg.sub button{border-radius:0;border-bottom:3px solid transparent;padding:8px 6px}
.nut .seg.sub button.on{background:none;color:var(--text);border-bottom-color:var(--blue)}
.nut .macros{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border:1px solid var(--line);border-radius:4px;overflow:hidden}
.nut .macros div{background:var(--panel);padding:10px 8px;text-align:center}
.nut .macros b{display:block;font-family:var(--disp);font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}
.nut .macros span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.nut .macros div:first-child b{color:var(--blue)}
.nut .meal{margin-top:22px;border:1px solid var(--line);border-radius:6px;background:var(--panel);overflow:hidden}
.nut .mealH{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:12px 14px;background:var(--panel2);border-bottom:1px solid var(--line);flex-wrap:wrap}
.nut .mealH h2{font-size:20px}
.nut .mealH .kc{font-family:var(--disp);color:var(--blue);font-size:16px;letter-spacing:.04em;font-variant-numeric:tabular-nums}
.nut .mealTag{font-size:12px;color:var(--muted);width:100%;margin-top:-4px}
.nut .lbl{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--blue);font-weight:600;padding:12px 14px 0}
.nut .opts{display:flex;flex-direction:column}
.nut .opt{display:grid;grid-template-columns:28px 1fr;gap:4px 10px;padding:12px 14px;border-top:1px solid var(--line)}
.nut .opt:first-child{border-top:0}
.nut .num{font-family:var(--disp);font-weight:700;color:var(--ink);background:var(--blue);width:24px;height:24px;border-radius:50%;display:grid;place-items:center;font-size:14px;margin-top:2px}
.nut .optName{font-weight:600}
.nut .optItems{font-size:14px;color:var(--muted);min-width:0}
.nut .optItems span+span::before{content:" \u00b7 "}
.nut .byo{padding:4px 14px 14px;display:flex;flex-direction:column;gap:12px}
.nut .byo h3{font-size:14px;letter-spacing:.12em;color:var(--text);margin-bottom:4px}
.nut .orList{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.nut .orList li{padding:5px 0;border-bottom:1px dashed var(--line);font-size:14px}
.nut .orList li:last-child{border-bottom:0}
.nut .orList li+li::before{content:"OR ";font-family:var(--disp);color:var(--blue);font-weight:700;letter-spacing:.06em;font-size:12px}
.nut .veg{font-size:14px;color:var(--text);border-left:3px solid var(--blue);padding-left:10px}
.nut .jump{appearance:none;background:none;border:0;padding:0;color:var(--blue);text-decoration:underline;text-underline-offset:3px;font:inherit;cursor:pointer}
.nut .recipeLine{padding:10px 14px 14px;font-size:14px;color:var(--muted);border-top:1px solid var(--line)}
.nut .rgroup{scroll-margin-top:calc(var(--nutTop,60px) + 120px);margin-top:24px;display:flex;flex-direction:column;gap:10px}
.nut .rgroup>h2{font-size:20px;color:var(--blue)}
.nut details.rec{border:1px solid var(--line);border-radius:6px;background:var(--panel)}
.nut details.rec summary{list-style:none;cursor:pointer;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px}
.nut details.rec summary::-webkit-details-marker{display:none}
.nut .recT{font-family:var(--disp);text-transform:uppercase;letter-spacing:.04em;font-size:18px;font-weight:600;line-height:1.2}
.nut .chips{display:flex;gap:6px;flex-shrink:0;align-items:center}
.nut .chip{font-size:12px;background:var(--panel2);border:1px solid var(--line);border-radius:999px;padding:2px 9px;white-space:nowrap;font-variant-numeric:tabular-nums}
.nut .chip.g{border-color:var(--blue);color:var(--blue)}
.nut .recB{padding:0 14px 16px;display:flex;flex-direction:column;gap:12px;border-top:1px solid var(--line)}
.nut .recB h4{font-family:var(--disp);text-transform:uppercase;letter-spacing:.14em;color:var(--blue);font-size:13px;margin:12px 0 4px}
.nut .recB ul{margin:0;padding-left:18px}
.nut .recB ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:4px}
.nut .recB li{font-size:14px}
.nut .tip{font-size:14px;border-left:3px solid var(--blue);padding:8px 12px;background:var(--panel2)}
.nut .note{font-size:13px;color:var(--muted);font-style:italic}
.nut .chev{transition:transform .2s;color:var(--blue);font-size:14px}
.nut details[open] .chev{transform:rotate(90deg)}
.nut .progList{padding:22px 0 0;display:flex;flex-direction:column;gap:12px}
.nut .progCard{display:block;width:100%;text-align:left;cursor:pointer;border:1px solid var(--line);border-radius:14px;min-height:140px;padding:22px 18px;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;position:relative}
.nut .progCard .k{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--blue);margin-bottom:6px}
.nut .progCard .t{font-family:var(--disp);font-size:24px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;line-height:1.1}
.nut .progCard .s{font-size:12px;color:#c9c6be;margin-top:6px}
@media (max-width:440px){.nut details.rec summary{flex-wrap:wrap}.nut .hero h1{font-size:38px}}
@media (prefers-reduced-motion:reduce){.nut .chev{transition:none}}
.homeCard.nutCard .hcKicker{color:#4a8de6}
`;document.head.appendChild(css);

  function fonts(){
    if(N.fonts)return;N.fonts=true;
    try{var l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@500;600;700&family=Poppins:ital,wght@0,400;0,500;0,600;1,400&display=swap";document.head.appendChild(l);}catch(e){}
  }
  function topOffset(){try{var tb=document.querySelector(".topBar");if(tb)document.documentElement.style.setProperty("--nutTop",tb.getBoundingClientRect().height+"px");}catch(e){}}

  /* ---------- data: assignments → programs (RLS does the gating; this is belt and braces) ---------- */
  function load(){
    var me=uid();if(!me){N.progs=[];N.loaded=true;return Promise.resolve();}
    if(N.loading)return N.loading;
    N.loading=sb.from("nutrition_assignments").select("user_id,program_id,nutrition_programs(id,key,name,subtitle,brand,cover_url,accent,content,active)").eq("user_id",me)
      .then(function(r){
        var rows=(r&&!r.error&&Array.isArray(r.data))?r.data:[];
        N.progs=rows.filter(function(a){return a&&a.user_id===me&&a.nutrition_programs&&a.nutrition_programs.active!==false&&a.nutrition_programs.content&&a.nutrition_programs.content.plan&&a.nutrition_programs.content.plan.plans;})
                    .map(function(a){return a.nutrition_programs;});
        N.loaded=true;N.loading=null;N.for=me;
        if(N.progs.length)fonts();
      },function(){N.progs=[];N.loaded=true;N.loading=null;});
    return N.loading;
  }

  /* ---------- home tile ---------- */
  function tileHtml(){
    var p=N.progs[0],one=N.progs.length===1;
    var img=p&&p.cover_url?p.cover_url:"";
    var bg=img?"background:linear-gradient(90deg,#0a0b0e 0%,#0a0b0e 42%,rgba(10,11,14,.55) 62%,rgba(10,11,14,0) 100%),url('"+E(img)+"') right center/auto 100% no-repeat #0a0b0e;border-color:#2b4466;padding-right:150px":"background:linear-gradient(180deg,rgba(8,8,10,.55),rgba(8,8,10,.9)) #0a0b0e;border-color:#2b4466";
    return '<button class="homeCard nutCard" id="nutCard" style="'+bg+'" onclick="nutEnter()">'+
      '<div class="hcKicker">'+(one?E(p.subtitle||p.name):"Your nutrition programs")+'</div>'+
      '<div class="hcTitle">Nutrition</div>'+
      '<div class="hcSub">'+(one?E(p.name)+'. Start Here and Your Plan, built for you.':N.progs.length+' programs assigned to you.')+'</div></button>';
  }
  function injectTile(){
    var main=document.getElementById("main");if(!main||view!=="home")return;
    if(!N.loaded||N.for!==uid())return;
    if(document.getElementById("nutCard")){if(!N.progs.length)document.getElementById("nutCard").remove();return;}
    if(!N.progs.length)return;
    var wrap=document.createElement("div");wrap.innerHTML=tileHtml();var card=wrap.firstChild;
    var after=document.getElementById("rtxCard")||document.getElementById("fcxCard");
    if(after){after.insertAdjacentElement("afterend",card);return;}
    var first=main.querySelector(".homeCard");
    if(first)first.insertAdjacentElement("beforebegin",card);else main.appendChild(card);
  }

  /* ---------- state per program ---------- */
  function sk(k){return "lgnut:"+(N.cur?N.cur.key:"x")+":"+k;}
  function planKeys(){return Object.keys(N.cur.content.plan.plans).sort(function(a,b){return (+a)-(+b);});}
  function restore(){
    var c=N.cur.content,keys=planKeys();
    var t=store(sk("tab"));N.tab=(t==="plan"||t==="start")?t:"start"; /* first open lands on Start Here */
    var p=store(sk("plan"));N.plan=(p&&keys.indexOf(p)>=0)?p:((c.plan.default_plan&&keys.indexOf(String(c.plan.default_plan))>=0)?String(c.plan.default_plan):keys[0]);
    var v=store(sk("view"));N.pv=(v==="rec"||v==="byo")?v:"byo";
  }
  function persist(){store(sk("tab"),N.tab);store(sk("plan"),N.plan);store(sk("view"),N.pv);}

  window.nutEnter=function(){
    if(!uid()){T("Sign in first");return;}
    if(!N.loaded){T("One sec…");load().then(function(){window.nutEnter();});return;}
    if(!N.progs.length)return;
    if(N.progs.length===1){window.nutOpen(N.progs[0].key);return;}
    go("nutlist");
  };
  window.nutOpen=function(key){
    var p=null;for(var i=0;i<N.progs.length;i++)if(N.progs[i].key===key)p=N.progs[i];
    if(!p)return;N.cur=p;N.open={};restore();go("nut");
  };
  window.nutTab=function(t){N.tab=t;persist();paint();try{window.scrollTo(0,0);}catch(e){}};
  window.nutPlan=function(p){if(planKeys().indexOf(p)<0)return;N.plan=p;persist();repaintPlan(true);};
  window.nutView=function(v){N.pv=v;persist();repaintPlan(false);try{window.scrollTo(0,0);}catch(e){}};
  window.nutJump=function(cat){N.pv="rec";persist();repaintPlan(false);var g=document.getElementById("nutG-"+cat);if(g)g.scrollIntoView({block:"start"});};
  window.nutRec=function(el){var n=el.getAttribute("data-name");if(el.open)N.open[n]=true;else delete N.open[n];};

  /* ---------- markdown → native page (Start Here) ---------- */
  function inline(t){
    t=E(t);
    t=t.replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>");
    t=t.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g,"$1<i>$2</i>");
    return t;
  }
  function md(src){
    var lines=String(src||"").split(/\r?\n/),out=[],sec=null,i=0,seenH2=false,hero=null;
    var openSec=function(h){if(sec!==null)out.push("</div>");out.push('<div class="sec"><h2>'+h+"</h2>");sec=true;};
    var push=function(h){if(sec===null&&hero===null){hero=[];}if(sec===null)hero.push(h);else out.push(h);};
    while(i<lines.length){
      var L=lines[i];
      if(!L.trim()){i++;continue;}
      if(/^#\s/.test(L)){push('<h1>'+inline(L.replace(/^#\s+/,""))+"</h1>");i++;continue;}
      if(/^##\s/.test(L)){seenH2=true;openSec(inline(L.replace(/^##\s+/,"")));i++;continue;}
      if(/^###\s/.test(L)){push("<h3>"+inline(L.replace(/^###\s+/,""))+"</h3>");i++;continue;}
      if(/^>\s?/.test(L)){
        var buf=[];while(i<lines.length&&/^>\s?/.test(lines[i])){buf.push(lines[i].replace(/^>\s?/,""));i++;}
        var first=buf[0]||"";
        if(/^\*\*IMPORTANT\*\*\s*$/i.test(first.trim())){push('<div class="important"><span class="disp">Important</span>'+buf.slice(1).map(inline).join("<br>")+"</div>");}
        else push('<div class="callout">'+buf.map(inline).join("<br>")+"</div>");
        continue;
      }
      if(/^\|/.test(L)){
        var rows=[];while(i<lines.length&&/^\|/.test(lines[i])){rows.push(lines[i]);i++;}
        var cells=function(r){return r.replace(/^\||\|\s*$/g,"").split("|").map(function(c){return c.trim();});};
        var body=rows.filter(function(r){return !/^\|(\s*:?-+:?\s*\|)+\s*$/.test(r);});
        if(!body.length)continue;
        var head=cells(body[0]),rest=body.slice(1);
        var headEmpty=head.every(function(c){return !c;});
        if(headEmpty&&rest.every(function(r){return cells(r).length===2;})){
          /* two-column table with a blank header → definition list (the "day shape" table) */
          push('<dl class="day">'+rest.map(function(r){var c=cells(r);return "<dt>"+inline(c[0].replace(/^\*\*|\*\*$/g,""))+"</dt><dd>"+inline(c[1])+"</dd>";}).join("")+"</dl>");
        }else{
          var h='<div class="tbl"><table>';
          if(!headEmpty)h+="<thead><tr>"+head.map(function(c){return "<th>"+inline(c)+"</th>";}).join("")+"</tr></thead>";
          h+="<tbody>"+rest.map(function(r){return "<tr>"+cells(r).map(function(c,ci){return "<td>"+(ci>0?"<b>"+inline(c)+"</b>":inline(c))+"</td>";}).join("")+"</tr>";}).join("")+"</tbody></table></div>";
          push(h);
        }
        continue;
      }
      if(/^[-*]\s/.test(L)){
        var li=[];while(i<lines.length&&/^[-*]\s/.test(lines[i])){li.push("<li>"+inline(lines[i].replace(/^[-*]\s+/,""))+"</li>");i++;}
        push('<ul class="dots'+(li.length>=8?" sauces":"")+'">'+li.join("")+"</ul>");continue;
      }
      if(/^\d+[.)]\s/.test(L)){
        var ol=[];while(i<lines.length&&/^\d+[.)]\s/.test(lines[i])){ol.push("<li>"+inline(lines[i].replace(/^\d+[.)]\s+/,""))+"</li>");i++;}
        push("<ol>"+ol.join("")+"</ol>");continue;
      }
      if(/^\*[^*]+\*\s*$/.test(L.trim())){ /* italic-only line: eyebrow before the first section, fine print after */
        var txt=inline(L.trim().replace(/^\*|\*$/g,""));
        push(seenH2?'<p class="fine">'+txt+"</p>":'<div class="eyebrow">'+txt+"</div>");i++;continue;
      }
      push("<p>"+inline(L)+"</p>");i++;
    }
    if(sec!==null)out.push("</div>");
    var heroHtml="";
    if(hero&&hero.length){
      /* eyebrow, h1, intro paragraph(s) → hero block */
      var eb=hero.filter(function(h){return h.indexOf('class="eyebrow"')>=0;}).join("");
      var h1=hero.filter(function(h){return /^<h1>/.test(h);}).join("");
      var restH=hero.filter(function(h){return h.indexOf('class="eyebrow"')<0&&!/^<h1>/.test(h);}).join("");
      heroHtml='<div class="hero">'+eb+h1+restH+"</div>";
    }
    return heroHtml+out.join("");
  }

  /* ---------- Your Plan ---------- */
  function rng(r){
    if(!r||r.length<2)return "";
    var a=+r[0],b=+r[1];
    if(Math.abs(b-a)<15)return "~"+(Math.round((a+b)/20)*10)+" kcal";
    return "~"+(Math.round(a/10)*10)+"–"+(Math.round(b/10)*10)+" kcal";
  }
  function plan(){return N.cur.content.plan.plans[N.plan];}
  function recipesBy(cat){return (plan().recipes||[]).filter(function(r){return r.category===cat;});}
  function mealCard(m){
    var isByo=m.type==="build_your_own";
    var kc=isByo?("~"+m.kcal+" kcal"):rng(m.kcal_range);
    var h='<article class="meal"><div class="mealH"><h2>'+E(m.title)+'</h2><span class="kc">'+E(kc)+'</span>'+(m.tag?'<span class="mealTag">'+E(m.tag)+"</span>":"")+"</div>";
    h+='<div class="lbl">'+E(m.label||(isByo?"BUILD YOUR OWN. CHOOSE ONE FROM EACH":"SELECT ONE OPTION"))+"</div>";
    if(isByo){
      h+='<div class="byo">'+(m.groups||[]).map(function(g){return "<div><h3>"+E(g.label)+'</h3><ul class="orList">'+(g.items||[]).map(function(x){return "<li>"+E(x)+"</li>";}).join("")+"</ul></div>";}).join("")+
         (m.footer?'<p class="veg">'+E(m.footer)+"</p>":"")+"</div>";
    }else{
      h+='<div class="opts">'+(m.options||[]).map(function(o,i){return '<div class="opt"><span class="num">'+E(o.number||(i+1))+'</span><div><div class="optName">'+E(o.name)+'</div><div class="optItems">'+(o.items||[]).map(function(x){return "<span>"+E(x)+"</span>";}).join("")+"</div></div></div>";}).join("")+"</div>";
    }
    if(m.recipe_link==="breakfast"){
      var names=recipesBy("breakfast").map(function(r){return E(r.name);}).join(" · ");
      h+='<div class="recipeLine">Or pick a <button class="jump" onclick="nutJump(\'breakfast\')">breakfast recipe</button>'+(names?": "+names:"")+"</div>";
    }else if(m.recipe_link==="lunch_dinner"){
      h+='<div class="recipeLine">Or pick any <button class="jump" onclick="nutJump(\'lunch_dinner\')">lunch/dinner recipe</button>. Same calories, already scaled.</div>';
    }
    return h+"</article>";
  }
  function byoHtml(){return (plan().meals||[]).map(mealCard).join("");}
  function recCard(r){
    var open=!!N.open[r.name];
    return '<details class="rec" data-name="'+E(r.name)+'"'+(open?" open":"")+' ontoggle="nutRec(this)"><summary><span class="recT">'+E(r.name)+'</span><span class="chips"><span class="chip g">~'+E(r.kcal)+' cal</span><span class="chip">'+E(r.protein_g)+'g protein</span><span class="chev" aria-hidden="true">▶</span></span></summary>'+
      '<div class="recB">'+(r.note?'<p class="note">'+E(r.note)+"</p>":"")+
      "<div><h4>Ingredients</h4><ul>"+(r.ingredients||[]).map(function(x){return "<li>"+E(x)+"</li>";}).join("")+"</ul></div>"+
      ((r.sauce&&r.sauce.length)?"<div><h4>Sauce</h4><ul>"+r.sauce.map(function(x){return "<li>"+E(x)+"</li>";}).join("")+"</ul></div>":"")+
      "<div><h4>Method</h4><ol>"+(r.method||[]).map(function(x){return "<li>"+E(x)+"</li>";}).join("")+"</ol></div>"+
      (r.tip?'<p class="tip"><b>Tip:</b> '+E(r.tip)+"</p>":"")+"</div></details>";
  }
  function intro(cat){
    var c=N.cur.content,ri=c.recipe_intros&&c.recipe_intros[cat];
    if(ri&&ri[N.plan])return ri[N.plan];
    var rs=recipesBy(cat);if(!rs.length)return "";
    var avg=rs.reduce(function(s,r){return s+(+r.kcal||0);},0)/rs.length;
    return "~"+(Math.round(avg/10)*10)+" cal each.";
  }
  function recHtml(){
    var groups=[["breakfast","Breakfast"],["lunch_dinner","Lunch &amp; Dinner"]];
    return groups.map(function(g){var rs=recipesBy(g[0]);if(!rs.length)return "";
      return '<div class="rgroup" id="nutG-'+g[0]+'"><h2>'+g[1]+'</h2><p class="fine">'+E(intro(g[0]))+"</p>"+rs.map(recCard).join("")+"</div>";}).join("");
  }
  function planHtml(){
    var c=N.cur.content,keys=planKeys(),p=plan(),t=p.daily_targets||{};
    var seg='<div class="seg" role="group" aria-label="Choose your plan">'+keys.map(function(k){var pk=c.plan.plans[k];return '<button class="'+(k===N.plan?"on":"")+'" onclick="nutPlan(\''+E(k)+'\')">'+E(pk.tab_label||("Option "+(keys.indexOf(k)+1)))+"<small>"+E(pk.tab_sublabel||(k+" cals"))+"</small></button>";}).join("")+"</div>";
    var macros='<div class="macros"><div><b>~'+E(t.kcal)+'</b><span>kcal</span></div><div><b>~'+E(t.protein_g)+'g</b><span>Protein</span></div><div><b>~'+E(t.carbs_g)+'g</b><span>Carbs</span></div><div><b>~'+E(t.fat_g)+'g</b><span>Fats</span></div></div>';
    var sub='<div class="seg sub" role="group" aria-label="Choose a view"><button class="'+(N.pv==="byo"?"on":"")+'" onclick="nutView(\'byo\')">Build Your Own</button><button class="'+(N.pv==="rec"?"on":"")+'" onclick="nutView(\'rec\')">Recipes</button></div>';
    return '<div class="planHead">'+seg+macros+(c.targets_note?'<p class="fine">'+E(c.targets_note)+"</p>":"")+sub+"</div>"+
      '<div id="nutBody">'+(N.pv==="byo"?byoHtml():recHtml())+"</div>";
  }
  function repaintPlan(keepScroll){
    var el=document.getElementById("nutPlan");if(!el){paint();return;}
    var y=window.scrollY||window.pageYOffset||0;
    el.innerHTML=planHtml();
    if(keepScroll){try{window.scrollTo(0,y);}catch(e){}}
  }

  /* ---------- page shell ---------- */
  function shell(){
    var p=N.cur;
    return '<div class="nut"><div class="top"><div class="topIn"><button class="back" onclick="go(\'home\')">‹ Home</button>'+
      '<div class="brand"><span class="disp">'+E(p.brand||"LEGACY GYM")+'</span><small>'+E(p.subtitle||p.name)+"</small></div>"+
      '<nav class="tabs" role="tablist"><button class="tab '+(N.tab==="start"?"on":"")+'" role="tab" onclick="nutTab(\'start\')">Start Here</button><button class="tab '+(N.tab==="plan"?"on":"")+'" role="tab" onclick="nutTab(\'plan\')">Your Plan</button></nav></div></div>'+
      '<div class="wrap"><section id="nutStart" role="tabpanel"'+(N.tab==="start"?"":" hidden")+">"+md(p.content.start_here_md||"")+"</section>"+
      '<section id="nutPlan" role="tabpanel"'+(N.tab==="plan"?"":" hidden")+">"+(N.tab==="plan"?planHtml():"")+"</section></div></div>";
  }
  function paint(){
    var main=document.getElementById("main");if(!main)return;
    if(!N.cur||N.for!==uid()||N.progs.indexOf(N.cur)<0){go("home");return;}
    topOffset();main.innerHTML=shell();persist();
  }
  function renderList(){
    var main=document.getElementById("main");if(!main)return;
    if(!N.loaded||!N.progs.length){go("home");return;}
    main.innerHTML='<div class="nut"><div class="top"><div class="topIn"><button class="back" onclick="go(\'home\')">‹ Home</button><div class="brand"><span class="disp">Nutrition</span><small>Your programs</small></div><div style="height:10px"></div></div></div>'+
      '<div class="wrap"><div class="progList">'+N.progs.map(function(p){var bg=p.cover_url?"background:linear-gradient(90deg,#0a0b0e 0%,#0a0b0e 42%,rgba(10,11,14,.55) 62%,rgba(10,11,14,0) 100%),url('"+E(p.cover_url)+"') right center/auto 100% no-repeat #0a0b0e;padding-right:150px":"background:#16181c";
        return '<button class="progCard" style="'+bg+'" onclick="nutOpen(\''+E(p.key)+'\')"><div class="k">'+E(p.subtitle||"Program")+'</div><div class="t">'+E(p.name)+'</div><div class="s">Start Here · Your Plan</div></button>';}).join("")+"</div></div></div>";
  }

  /* ---------- hooks (same pattern as fc.js / rtx.js) ---------- */
  try{NAV_TAB.nut="home";NAV_TAB.nutlist="home";}catch(e){}
  var _render=window.render;
  window.render=function(){if(view==="nut")return paint();if(view==="nutlist")return renderList();return _render.apply(this,arguments);};
  ["renderHome"].forEach(function(fn){
    if(typeof window[fn]!=="function")return;
    var o=window[fn];
    window[fn]=function(){var r=o.apply(this,arguments);
      var after=function(){
        var me=uid();
        if(me&&(!N.loaded||N.for!==me)){N.loaded=false;load().then(function(){injectTile();});}
        else injectTile();
      };
      if(r&&typeof r.then==="function")r.then(after);else setTimeout(after,30);return r;};
  });
  setTimeout(function(){if(view==="home"&&uid()){load().then(injectTile);}},900);
  setInterval(function(){try{if(view==="home"&&uid()&&N.loaded&&N.for===uid()&&N.progs.length&&!document.getElementById("nutCard"))injectTile();}catch(e){}},1200);
})();
