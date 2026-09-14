/* Legacy Gym · session timer add-on · 14 Sep 2026
   Extends the built-in round timer (byoPhases / updS / byoStart / renderBYOTimer) that
   "Start The Session" already drives from a fighter's programmed workload:
   - 60 s GLOVES ON window whenever a round with no gloves (shadow, skip, footwork, slip line,
     dead ball, road work) is followed by bag / ball / pad work — replaces that rest
   - the round's coaching note shows under the clock while the round runs; rests preview the next one
   - loud horn + voice when the glove window opens (on top of the bell / horn / 10-seconds-out cues)
   - keeps the screen awake for the session
   Nothing in the original timer is removed. */
(function(){
"use strict";
var NOGLOVE=/shadow|skip|footwork|\babc\b|slip line|\brun\b|dead ball|tennis ball|mirror|angles only|back-foot boxing|ring control|road work/i;
var GLOVE=/\bbag\b|\bball\b|\bpads?\b|spar|wreck|\bwall\b|speedball|floor-to-ceiling/i;
/* explicit calls for the coach-written rounds, so a name never has to be guessed */
var FORCE={jkRing10:false,jkAngle:false,jkBack1:false,jkBack2:false,jkFtc:true,jkSpeed:true,jkDead:false,
 ayShadow10:false,suShadow10:false,suRing10:false,aySlip1:false,aySlip2:false,
 mpSlip1:false,mpSlip2:false,mpSlip3:false,mpSlip4:false,mpSlip5:false,mpSpeed:true,mpFtc:true,mpWreck:true,
 fwABC:false,skip3:false,skip5:false,skip7:false,skip10:false};
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function find(id){try{return byoFind(id);}catch(e){return null;}}
function gloves(it,prev){
  if(!it)return !!prev;
  if(Object.prototype.hasOwnProperty.call(FORCE,it.id))return FORCE[it.id];
  var t=(it.n||"")+" "+(it.tag||"");
  if(NOGLOVE.test(t))return false;
  if(GLOVE.test(t))return true;
  return !!prev; /* "Open round" etc. — same kit as the round before it */
}
function gloveMap(list){var out=[],g=false;list.forEach(function(id){g=gloves(find(id),g);out.push(g);});return out;}

var css=document.createElement("style");css.textContent=
 ".sTag{font-size:13.5px;line-height:1.5;color:#fff;margin:8px auto 4px;max-width:360px;font-weight:600}"+
 ".sTag.rest{color:var(--muted);font-weight:500}"+
 ".timerCard.glove{border-color:#ff9f1c;box-shadow:0 0 0 2px rgba(255,159,28,.35);animation:lgGlove 1s steps(1) infinite}"+
 ".timerCard.glove .timerPhase{color:#ff9f1c}.timerCard.glove .timerTime{color:#ffb454}"+
 "@keyframes lgGlove{0%,100%{background:linear-gradient(160deg,#17171a 0%,#0b0b0e 75%)}50%{background:linear-gradient(160deg,#2a1c08 0%,#0b0b0e 75%)}}"+
 "button[onclick^=\"sc2StartProgram\"]{animation:lgGlow 1.6s ease-in-out infinite;font-size:15px;letter-spacing:1.5px}"+
 "@keyframes lgGlow{0%,100%{box-shadow:0 0 0 0 rgba(241,210,122,0)}50%{box-shadow:0 0 0 7px rgba(241,210,122,.35)}}"+
 ".lgGloveNote{display:inline-block;margin-top:3px;font-size:10px;letter-spacing:1.2px;text-transform:uppercase;font-weight:800;color:#ff9f1c}"+
 "@media (prefers-reduced-motion:reduce){.timerCard.glove,button[onclick^=\"sc2StartProgram\"]{animation:none}}";
document.head.appendChild(css);

/* ---- phases: tag every phase with its round note, turn the rest before glove work into GLOVES ON ---- */
var _ph=window.byoPhases;
window.byoPhases=function(){
  var ph=_ph.apply(this,arguments);
  try{
    var list=(byo&&byo.list)||[],G=gloveMap(list),r=0;
    for(var i=0;i<ph.length;i++){
      var p=ph[i];
      if(p.br){ /* rest between round r-1 (just ended) and round r (next) */
        var nx=find(list[r]);
        p.tag=nx?(nx.tag||""):"";p.rn=r+1;
        if(G[r]&&!G[r-1]){
          p.s=Math.max(p.s||0,60);p.b="GLOVES ON";p.gl=true;
          p.sm="60 seconds to glove up · then Round "+(r+1)+" of "+list.length+" — "+(nx?nx.n:"");
        }
        continue;
      }
      var it=find(list[r]);
      p.tag=it?(it.tag||""):"";p.rn=r+1;
      if(p.end)r++;
    }
  }catch(e){}
  return ph;
};

/* ---- clock: show the note, style the glove window, sound it once ---- */
var _u=window.updS,lastIdx=-1;
function cue(){
  try{horn(.9);}catch(e){}
  try{setTimeout(function(){horn(.5);},450);}catch(e){}
  try{setTimeout(function(){if(typeof say==="function")say("Sixty seconds. Gloves on.");},1000);}catch(e){}
}
window.updS=function(){
  _u.apply(this,arguments);
  try{
    var card=document.getElementById("sCard");if(!card)return;
    var tagEl=document.getElementById("sTag");
    if(!tagEl){tagEl=document.createElement("div");tagEl.id="sTag";tagEl.className="sTag";var nxEl=document.getElementById("sNext");if(nxEl&&nxEl.parentNode)nxEl.parentNode.insertBefore(tagEl,nxEl);else card.appendChild(tagEl);}
    if(!S.phases.length||S.idx>=S.phases.length){tagEl.textContent="";tagEl.style.display="none";card.classList.remove("glove");lastIdx=-1;return;}
    var p=S.phases[S.idx],txt="",rest=false;
    if(p.gl){txt="Get your gloves on. Up next: "+(p.tag||"");rest=true;}
    else if(p.k==="rest"&&p.br){txt=p.tag?"Up next: "+p.tag:"";rest=true;}
    else txt=p.tag||"";
    tagEl.textContent=txt;tagEl.className="sTag"+(rest?" rest":"");tagEl.style.display=txt?"block":"none";
    card.classList.toggle("glove",!!p.gl);
    if(S.idx!==lastIdx){var was=lastIdx;lastIdx=S.idx;if(p.gl&&S.run&&was>=0)cue();}
  }catch(e){}
};

/* ---- session list under the clock: show each round's note and where the glove window falls ---- */
var _rt=window.renderBYOTimer;
window.renderBYOTimer=function(){
  _rt.apply(this,arguments);
  try{
    var list=(byo&&byo.list)||[],G=gloveMap(list);
    var rows=document.querySelectorAll("#boxContent .card .weekRow");
    rows.forEach(function(row,i){
      if(i>=list.length)return;
      var it=find(list[i]),s=row.querySelector("span");if(!s||s.querySelector("small"))return;
      var extra="";
      if(it&&it.tag)extra+='<br><small style="color:var(--muted)">'+esc(it.tag)+'</small>';
      if(G[i]&&!G[i-1]&&i>0)extra+='<br><span class="lgGloveNote">🥊 60 s to glove up before this round</span>';
      s.innerHTML+=extra;
    });
  }catch(e){}
};

/* ---- keep the screen on while a session runs ---- */
var lock=null;
var _bs=window.byoStart;
window.byoStart=function(){
  _bs.apply(this,arguments);
  try{if(navigator.wakeLock&&byoActive)navigator.wakeLock.request("screen").then(function(l){lock=l;}).catch(function(){});}catch(e){}
};
var _be=window.byoExit;
window.byoExit=function(){try{if(lock){lock.release();lock=null;}}catch(e){}return _be.apply(this,arguments);};
document.addEventListener("visibilitychange",function(){try{if(document.visibilityState==="visible"&&byoActive&&S.run&&navigator.wakeLock&&!lock)navigator.wakeLock.request("screen").then(function(l){lock=l;}).catch(function(){});}catch(e){}});

/* exposed for checking in the console */
window.lgTimerGloves=function(list){return gloveMap(list||((byo&&byo.list)||[]));};
})();
