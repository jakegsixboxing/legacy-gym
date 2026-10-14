/* ===== Fight Club · Blue Book (simple) · 14 Oct 2026 =====
   For Legacy's own records: fighters tell us where they're up to with the NSW Blue Book, staff see it at a glance.
   Fighter: 3 things to do, forms to print, yes/no taps. Staff: list of fighters with the same ticks, plus "book sighted".
   Data: public.fc_bluebook via bb_get / bb_participant_update / bb_all / bb_staff_set (staff = fc_is_staff in the DB). */
(function(){
"use strict";
var RB=window.BB_RULES||{sydneyToday:function(){var d=new Date();return d.toISOString().slice(0,10);},parseDate:function(v){return /^\d{4}-\d{2}-\d{2}$/.test(v||"")?v:null;},fmtAU:function(v){return v?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):"";}};
var $id=function(i){return document.getElementById(i);};
var T=function(m){try{toast(m);}catch(e){}};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(m){return{"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}
var FC_LOGO="https://www.legacygym.net/cdn/shop/t/28/assets/fightclub-logo.png";
var STAFF=["15a011b9-e222-45f0-8eb9-d5338da935d1","f0cbff5d-db5c-4b86-8d35-9b94ad8a38ce"]; /* same as fc_is_staff() */
function staff(){try{return STAFF.indexOf(session.user.id)>=0;}catch(e){return false;}}
function today(){return RB.sydneyToday();}
function fmt(v){return RB.fmtAU(v)||"";}
var L={fitnessForm:"https://www.sport.nsw.gov.au/sites/default/files/2021-04/csa_form_certificate_of_fitness_for_combat_sports.pdf",serologyForm:"https://www.sport.nsw.gov.au/sites/default/files/2021-04/csa_form_serology_clearance_certificate_s7_oct_2014.pdf",consentForm:"https://www.sport.nsw.gov.au/sites/default/files/2023-05/Parent-Legal-Guardian-Consent-Form.pdf",concussion:"https://connectivity.thinkific.com/courses/combat-course-nsw",apply:"https://www.service.nsw.gov.au/transaction/apply-for-a-combat-sports-registration-combatant",replace:"https://www.service.nsw.gov.au/transaction/replace-a-medical-record-book"};

/* the questions, each mapped onto the dated fields underneath */
var Q=[
 {id:"medical",label:"Medical certificate",q:"Have you completed your medical?",fields:["medicalExamOn","medicalIssuedOn"],
  how:["Print the <b>Fitness form</b> below and fill in the questions on the front.","Book your GP. Tell them: \"I'm boxing in an amateur fight in NSW, I need the CSA Certificate of Fitness.\"","The doctor examines you and signs the certificate. Keep it."]},
 {id:"bloods",label:"Blood work",q:"Have you completed your blood work?",fields:["bloodSampleOn","bloodReviewedOn","serologyIssuedOn"],
  how:["Print the <b>Bloods form</b> below and take it to the same GP visit.","The doctor gives you a pathology referral: HIV, hep B, hep C. Go and get the blood taken.","When results are back, the doctor or lab signs the clearance certificate. Keep it."]},
 {id:"course",label:"Concussion test",q:"Have you done the concussion test?",fields:["concussionDoneOn"],
  how:["Free, online, about 20 minutes. Tap <b>Concussion course</b> below.","Sign up with the same name and email you'll use for your application.","Finish all 4 modules and the quiz. That's it, nothing to print."]},
 {id:"sent",label:"Apply online",q:"Have you uploaded your forms online?",fields:["medicalSentOn","serologySentOn","applicationSubmittedOn","applicationCompletedOn"],
  how:["Tap <b>Apply on Service NSW</b> below and log in (or make a MyServiceNSW account).","You'll need: driver licence or Medicare card, a passport-style photo of your head and shoulders, and photos of both signed certificates. Under 18: the signed parent form too.","Pick <b>Amateur Boxing</b>, upload everything, pay $20. Do this within 28 days of your medical."]}];
/* Legacy's own step-by-step (from the gym's "Blue Book registration step by step" sheet) */
var STEPS=[
 {id:"book",icon:"medical",label:"Book 2 doctor's appointments",how:[
  "<b>First appointment:</b> the earliest date you can get. It doesn't have to be your usual doctor if they can't fit you in early enough.",
  "<b>Second appointment:</b> for after your blood tests come back. We recommend about 1 week after the first, or ask the surgery what they suggest."]},
 {id:"id",icon:"book",label:"Sort your ID",how:[
  "You need <b>current</b> Aus passport, driver's licence and Medicare card.",
  "If you don't have those, get your 100 points of ID certified by a JP while you wait for the appointments.",
  "Stuck? Ask us for help."]},
 {id:"attend",icon:"bloods",label:"Attend the doctor's appointments",how:[
  "<b>First appointment</b> is to order your blood tests. Bring the <b>Bloods form</b> (serological certificate) so the doctor orders the exact tests on the sheet.",
  "Get your bloods taken ASAP.",
  "<b>Second appointment</b> is to get the serological certificate and certificate of fitness signed once the results are back. The ID you use on these forms must be one of the IDs you use for combat sports.",
  "<b>VERY IMPORTANT, no abbreviations.</b> The doctor must write their name in full, and the whole address (or use their stamp). On the serological form the blood test date must be different from the date the results were picked up.",
  "<b>Check both forms are correct before you leave the doctor's.</b> If anything is wrong you'll have to go back.",
  "<b>Submit within 28 days.</b> If they're not sent to combat sports within 28 days of the doctor signing, they expire and you do it again."]},
 {id:"course",icon:"course",label:"Do the mandatory concussion training",how:[
  "It's online, tap <b>Concussion course</b> below."]},
 {id:"upload",icon:"sent",label:"Upload everything, plus a passport-style photo",how:[
  "<b>This is your responsibility.</b> Tap <b>Apply on Service NSW</b> below.",
  "Click the red rectangle to open the combat sports registration system. Choose <b>Apply for a combatant registration class</b> then <b>Apply Online</b>. Log into your Service NSW account and create a new profile.",
  "Scan and upload as prompted: Fitness certificate final page (within 28 days of signing), Serological certificate final page, certified IDs, digital photo, concussion training, and the under-18 form if you're under 18."]}];
var HELP="If you need help, message or call reception on <b>0401 587 508</b>, or come and see us at reception.";
var ICON={medical:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#102038"/><path d="M17 14v9a7 7 0 0 0 14 0v-9" fill="none" stroke="#9fc0ff" stroke-width="3" stroke-linecap="round"/><circle cx="31" cy="33" r="4" fill="none" stroke="#9fc0ff" stroke-width="3"/><path d="M24 30v3a4 4 0 0 0 4 4" fill="none" stroke="#9fc0ff" stroke-width="3"/></svg>',
 bloods:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#102038"/><path d="M24 11c5 7 9 12 9 17a9 9 0 0 1-18 0c0-5 4-10 9-17z" fill="#ff5c6c"/></svg>',
 course:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#102038"/><path d="M19 14a5 5 0 0 0-5 6 5 5 0 0 0-1 9 5 5 0 0 0 6 5h10a5 5 0 0 0 6-5 5 5 0 0 0-1-9 5 5 0 0 0-5-6c-2 0-3 1-5 1s-3-1-5-1z" fill="none" stroke="#9fc0ff" stroke-width="3" stroke-linejoin="round"/><path d="M24 15v19" stroke="#9fc0ff" stroke-width="3"/></svg>',
 sent:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#102038"/><path d="M12 24l24-11-7 22-5-8-12-3z" fill="none" stroke="#9fc0ff" stroke-width="3" stroke-linejoin="round"/><path d="M24 27l12-14" stroke="#9fc0ff" stroke-width="3"/></svg>',
 book:'<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#102038"/><rect x="15" y="12" width="20" height="24" rx="2" fill="#1d3557" stroke="#9fc0ff" stroke-width="2"/><rect x="15" y="12" width="5" height="24" fill="#15283f"/><path d="M24 18h7M24 23h7M24 28h5" stroke="#9fc0ff" stroke-width="2" stroke-linecap="round"/></svg>',
 form:'<svg viewBox="0 0 48 48"><rect x="12" y="8" width="24" height="32" rx="3" fill="#102038" stroke="#9fc0ff" stroke-width="2"/><path d="M18 18h12M18 24h12M18 30h8" stroke="#9fc0ff" stroke-width="2" stroke-linecap="round"/><path d="M24 34v8M20 38l4 4 4-4" stroke="#2dd4bf" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
function yes(r,q){return q.fields.every(function(f){return !!RB.parseDate(r[f]);});}
function book(r){return r.bookStatus==="received"?"received":"pending";}
function summary(r){var d=Q.filter(function(q){return yes(r,q);}).length;var b=book(r)==="received";return {done:d,total:Q.length,book:b,text:b?"Blue Book received":d===Q.length?"All done, waiting on the book":d+" of "+Q.length+" done"};}

var S={mode:null,rec:null,all:null,sel:null,q:"",f:"all",open:{},saving:{}};
var css=document.createElement("style");css.textContent=
".bb{max-width:640px;margin:0 auto;padding-bottom:40px;--ink:#f2f0eb;--mute:#9a9891;--line:#2a2a2e;--panel:#141416;--blue:#4f8cff;--teal:#2dd4bf;--amber:#f5b942;--red:#ff5c6c}"
+".bb .back{background:none;border:0;color:var(--blue);font-weight:800;font-size:13px;letter-spacing:1px;padding:4px 0 12px;cursor:pointer;font-family:inherit}"
+".bb .head{display:flex;gap:12px;align-items:center;margin-bottom:10px}.bb .head img{height:44px}.bb .head .k{font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:var(--mute)}.bb .head .t{font-family:Oswald,sans-serif;font-size:26px;letter-spacing:.5px;text-transform:uppercase;line-height:1.05}"
+".bb .card{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:14px;margin-bottom:10px}.bb .card h3{font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--mute);margin:0 0 10px}"
+".bb .intro{font-size:14px;line-height:1.5}.bb .intro b{color:#fff}"
+".bb .todo{border-bottom:1px solid #1d1d21;padding:10px 0}.bb .todo:last-child{border:0}.bb .todo .row{display:flex;gap:10px;align-items:center;cursor:pointer}.bb .todo .n{width:28px;height:28px;border-radius:50%;background:var(--blue);color:#fff;display:grid;place-items:center;font-family:Oswald,sans-serif;font-size:15px;flex:none}.bb .todo .ic{width:36px;height:36px;flex:none}.bb .todo .ic svg{width:36px;height:36px}.bb .todo .ttl{flex:1;font-size:15px;font-weight:700}.bb .todo .car{color:var(--mute);font-size:12px;transition:transform .2s}.bb .todo.open .car{transform:rotate(180deg)}"
+".bb .todo ul{display:none;margin:8px 0 0 38px;padding:0 0 0 16px;font-size:13px;line-height:1.5;color:#d8d6cf}.bb .todo.open ul{display:block}.bb .todo li{margin:4px 0}"
+".bb .forms{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bb .forms a{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;background:#0f0f11;border:1px solid #27447d;border-radius:12px;padding:12px 8px;color:var(--ink);text-decoration:none;font-size:12.5px;font-weight:700;line-height:1.3}.bb .forms a svg{width:40px;height:40px}.bb .forms a small{color:var(--teal);font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase}"
+".bb .qrow{display:flex;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid #1d1d21}.bb .qrow:last-child{border:0}.bb .qrow .ic{width:38px;height:38px;flex:none}.bb .qrow .ic svg{width:38px;height:38px}.bb .qrow .qt{flex:1;min-width:0}.bb .qrow .qt b{display:block;font-size:14px;line-height:1.25}.bb .qrow .qt small{display:block;color:var(--mute);font-size:11px;margin-top:3px}"
+".bb .yn{display:flex;gap:4px;flex:none;background:#0f0f11;border:1px solid var(--line);border-radius:10px;padding:3px}.bb .yn button{border:0;background:transparent;color:var(--mute);font-family:inherit;font-weight:800;font-size:12px;padding:10px 13px;border-radius:8px;cursor:pointer;min-width:48px}.bb .yn button.on{background:var(--teal);color:#06211d}.bb .yn button.on.no{background:#3a3a40;color:#f2f0eb}.bb .yn button.on.mid{background:var(--amber);color:#2b2000}"
+".bb .sv{font-size:10px;color:var(--mute);min-width:40px;text-align:right}.bb .sv.ok{color:var(--teal)}.bb .sv.err{color:var(--red)}"
+".bb .done{background:#0f2a26;border:1px solid #1f5f58;padding:12px;border-radius:12px;color:#a8e9df;font-size:13px;margin-top:8px}.bb .note{font-size:11.5px;color:var(--mute);line-height:1.5;margin-top:8px}.bb .note a{color:var(--blue)}"
+".bb .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:10px}.bb .stat{border:1px solid var(--line);background:var(--panel);border-radius:12px;padding:10px;cursor:pointer}.bb .stat.on{border-color:var(--blue)}.bb .stat b{display:block;font-family:Oswald,sans-serif;font-size:24px;line-height:1}.bb .stat small{display:block;font-size:9.5px;letter-spacing:1px;text-transform:uppercase;color:var(--mute);margin-top:4px;line-height:1.3}"
+".bb input[type=text],.bb textarea{width:100%;box-sizing:border-box;background:#0f0f11;border:1px solid var(--line);border-radius:9px;color:var(--ink);padding:10px;font-family:inherit;font-size:13px}"
+".bb .frow{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #1d1d21;cursor:pointer}.bb .frow:last-child{border:0}.bb .frow .av{width:40px;height:40px;border-radius:50%;background:#232327 center/cover no-repeat;flex:none}.bb .frow b{display:block;font-size:13.5px}.bb .frow small{display:block;color:var(--mute);font-size:10.5px;margin-top:2px}.bb .ticks{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}.bb .ticks span{font-size:9.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding:3px 6px;border-radius:6px;background:#1d1d21;color:#6f6f78}.bb .ticks span.y{background:#0f2a26;color:var(--teal)}.bb .ticks span.p{background:#2b2418;color:var(--amber)}"
+".bb .pill{border:1px solid #27447d;background:#102038;color:#9fc0ff;border-radius:99px;padding:6px 10px;font-size:11px;font-weight:800;cursor:pointer;font-family:inherit;margin:0 4px 4px 0}.bb .pill.on{background:var(--blue);color:#fff}"
+".bb .btn{background:#0f0f11;border:1px solid var(--line);color:var(--ink);border-radius:9px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit}.bb .btn.pri{background:var(--blue);border-color:var(--blue);color:#fff}";
document.head.appendChild(css);

/* ---------- data ---------- */
async function loadMine(){var r=await sb.rpc("bb_get",{p_fighter:null});if(r.error)throw r.error;S.rec=r.data;}
async function loadAll(){var r=await sb.rpc("bb_all");if(r.error)throw r.error;S.all=r.data||[];}
function paintSave(key){var el=document.querySelector('[data-sv="'+key+'"]');if(el){var s=S.saving[key];el.className="sv"+(s==="err"?" err":s==="ok"?" ok":"");el.textContent=s==="saving"?"Saving…":s==="ok"?"Saved":s==="err"?"Not saved":"";}}
function current(){return S.mode==="admin"?S.all.find(function(x){return x.fighter_id===S.sel;}).record:S.rec;}
/* set several fields; fighter → bb_participant_update, staff editing a fighter → bb_staff_set */
async function setFields(fields,value,key){
  S.saving[key]="saving";paintSave(key);var rec=current();
  for(var i=0;i<fields.length;i++){if(rec[fields[i]]===value)continue;
    var r=S.mode==="admin"?await sb.rpc("bb_staff_set",{p_fighter:S.sel,p_field:fields[i],p_value:value}):await sb.rpc("bb_participant_update",{p_field:fields[i],p_value:value});
    if(r.error){S.saving[key]="err";paintSave(key);T("Couldn't save: "+r.error.message);return false;}
    rec=r.data;if(S.mode==="admin")S.all.find(function(x){return x.fighter_id===S.sel;}).record=rec;else S.rec=rec;}
  S.saving[key]="ok";paintSave(key);setTimeout(function(){if(S.saving[key]==="ok"){S.saving[key]="";paintSave(key);}},1800);return true;}

/* ---------- shared pieces ---------- */
function ynRow(q,r){var on=yes(r,q);return '<div class="qrow"><div class="ic">'+ICON[q.id]+'</div><div class="qt"><b>'+esc(q.q)+'</b><small>'+(on?'Done '+fmt(r[q.fields[0]]):'Tap Yes when it\'s done')+'</small></div><div class="yn"><button class="'+(on?'on':'')+'" onclick="bbAns(\''+q.id+'\',true)">Yes</button><button class="'+(!on?'on no':'')+'" onclick="bbAns(\''+q.id+'\',false)">No</button></div><span class="sv" data-sv="'+q.id+'"></span></div>';}
function bookRow(r){var b=book(r);return '<div class="qrow"><div class="ic">'+ICON.book+'</div><div class="qt"><b>Your Blue Book</b><small>'+(b==="received"?'Received '+fmt(r.bookReceivedOn)+(r.bookSightedOn?' · sighted by staff':''):'Arrives in the post about 2 weeks after you apply')+'</small></div><div class="yn"><button class="'+(b==="pending"?'on mid':'')+'" onclick="bbBook(\'pending\')">Pending</button><button class="'+(b==="received"?'on':'')+'" onclick="bbBook(\'received\')">Received</button></div><span class="sv" data-sv="book"></span></div>';}
function statusCard(r){var s=summary(r);
  return '<div class="card"><h3>Where are you up to? · '+s.done+' of '+s.total+'</h3>'+Q.map(function(q){return ynRow(q,r);}).join("")+bookRow(r)
   +(s.book?'<div class="done">Bring your Blue Book in and show Jake or Alison. Take it to every fight.</div><p class="note">Lost or damaged it? <a href="'+L.replace+'" target="_blank" rel="noopener">Replace it on Service NSW</a> ($50) and tell Jake.</p>':'')+'</div>';}

/* ---------- fighter page ---------- */
function paintMine(){
  var m=$id("main");if(!m)return;var r=S.rec;
  if(!r){m.innerHTML='<div class="bb"><button class="back" onclick="bbBack()">‹ Fight Club</button><div class="card"><p>No fighter record is linked to this login. Ask Jake to link you.</p></div></div>';return;}
  m.innerHTML='<div class="bb"><button class="back" onclick="bbBack()">‹ Fight Club</button><div class="head"><img src="'+FC_LOGO+'" alt=""><div><div class="k">Fight Night · 19 Dec</div><div class="t">Your Blue Book</div></div></div>'
   +'<div class="card"><div class="intro"><b>No Blue Book, no fight.</b> It\'s the NSW combat sports medical book. Follow the steps below, then tell us where you\'re up to.</div></div>'
   +'<div class="card"><h3>Blue Book registration, step by step</h3>'+STEPS.map(function(q,i){return '<div class="todo'+(S.open[q.id]?' open':'')+'" id="td-'+q.id+'"><div class="row" onclick="bbOpen(\''+q.id+'\')"><div class="n">'+(i+1)+'</div><div class="ic">'+ICON[q.icon]+'</div><div class="ttl">'+esc(q.label)+'</div><span class="car">▾</span></div><ul>'+q.how.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';}).join("")+'<p class="note">Tap a step to see the details. '+HELP+'</p></div>'
   +'<div class="card"><h3>Download / print forms</h3><div class="forms"><a href="'+L.fitnessForm+'" target="_blank" rel="noopener">'+ICON.form+'Fitness form<small>Print</small></a><a href="'+L.serologyForm+'" target="_blank" rel="noopener">'+ICON.form+'Bloods form<small>Print</small></a><a href="'+L.concussion+'" target="_blank" rel="noopener">'+ICON.course+'Concussion course<small>Online</small></a><a href="'+L.apply+'" target="_blank" rel="noopener">'+ICON.sent+'Apply on Service NSW<small>Online</small></a></div><p class="note">Under 18? You also need the <a href="'+L.consentForm+'" target="_blank" rel="noopener">parent / guardian form</a> signed.</p></div>'
   +statusCard(r)
   +'<p class="note" style="text-align:center">This is just so Jake and the team know where you\'re up to.</p></div>';
}

/* ---------- staff pages ---------- */
function ticks(r){return '<div class="ticks">'+Q.map(function(q){return '<span class="'+(yes(r,q)?'y':'')+'">'+{medical:"Medical",bloods:"Bloods",course:"Concussion",sent:"Applied"}[q.id]+'</span>';}).join("")+'<span class="'+(book(r)==="received"?'y':'p')+'">Book '+(book(r)==="received"?'✓':'pending')+'</span></div>';}
function paintAdmin(){
  var m=$id("main");if(!m)return;if(S.sel){paintOne();return;}
  var all=S.all,c={book:0,none:0};all.forEach(function(x){var s=summary(x.record);if(s.book)c.book++;if(s.done===0&&!s.book)c.none++;});
  var q=S.q.toLowerCase();var rows=all.filter(function(x){var s=summary(x.record);if(q&&x.name.toLowerCase().indexOf(q)<0)return false;if(S.f==="book")return s.book;if(S.f==="done")return s.done===s.total&&!s.book;if(S.f==="none")return s.done===0&&!s.book;if(S.f==="going")return s.done>0&&s.done<s.total;return true;});
  m.innerHTML='<div class="bb"><button class="back" onclick="bbBack()">‹ Fight Club</button><div class="head"><img src="'+FC_LOGO+'" alt=""><div><div class="k">Fight Night · 19 Dec</div><div class="t">Blue Book · who\'s up to what</div></div></div>'
   +'<div class="stats"><div class="stat'+(S.f==="all"?' on':'')+'" onclick="bbF(\'all\')"><b>'+all.length+'</b><small>Fighters</small></div><div class="stat'+(S.f==="book"?' on':'')+'" onclick="bbF(\'book\')"><b>'+c.book+'</b><small>Book received</small></div><div class="stat'+(S.f==="none"?' on':'')+'" onclick="bbF(\'none\')"><b>'+c.none+'</b><small>Not started</small></div></div>'
   +'<div class="card"><input type="text" placeholder="Search…" value="'+esc(S.q)+'" oninput="bbQ(this.value)"><div style="margin-top:8px">'+[["all","All"],["none","Not started"],["going","In progress"],["done","Waiting on book"],["book","Book received"]].map(function(f){return '<button class="pill'+(S.f===f[0]?' on':'')+'" onclick="bbF(\''+f[0]+'\')">'+f[1]+'</button>';}).join("")+'</div></div>'
   +'<div class="card">'+(rows.length?rows.map(function(x){var s=summary(x.record);return '<div class="frow" onclick="bbSel(\''+x.fighter_id+'\')"><div class="av"'+(x.photo?' style="background-image:url('+esc(x.photo)+')"':'')+'></div><div style="min-width:0;flex:1"><b>'+esc(x.name)+'</b><small>'+esc(s.text)+(x.record.staffNote?' · '+esc(x.record.staffNote):'')+'</small>'+ticks(x.record)+'</div></div>';}).join(""):'<p class="note">Nobody matches.</p>')+'</div></div>';
}
function paintOne(){
  var m=$id("main");var x=S.all.find(function(y){return y.fighter_id===S.sel;});if(!x){S.sel=null;paintAdmin();return;}var r=x.record;
  m.innerHTML='<div class="bb"><button class="back" onclick="S_bb.sel=null;bbPaint()">‹ All fighters</button><div class="head"><div style="width:48px;height:48px;border-radius:50%;background:#232327 center/cover no-repeat;flex:none'+(x.photo?';background-image:url('+esc(x.photo)+')':'')+'"></div><div><div class="k">'+(x.camp_number?'Fighter #'+x.camp_number:'Fight Club')+'</div><div class="t">'+esc(x.name)+'</div></div></div>'
   +statusCard(r)
   +'<div class="card"><h3>Staff</h3><div class="qrow"><div class="ic">'+ICON.book+'</div><div class="qt"><b>Seen the physical book?</b><small>'+(r.bookSightedOn?'Sighted '+fmt(r.bookSightedOn):'Tick once they\'ve shown you the actual book')+'</small></div><div class="yn"><button class="'+(r.bookSightedOn?'on':'')+'" onclick="bbSighted(true)">Yes</button><button class="'+(!r.bookSightedOn?'on no':'')+'" onclick="bbSighted(false)">No</button></div><span class="sv" data-sv="sighted"></span></div>'
   +'<div style="margin-top:10px"><input type="text" id="bbNote" placeholder="Note (e.g. chased 14/10, bloods booked Fri)" maxlength="200" value="'+esc(r.staffNote||"")+'"><div style="margin-top:6px;display:flex;gap:6px;align-items:center"><button class="btn pri" onclick="bbNoteSave()">Save note</button><span class="sv" data-sv="note"></span></div></div>'
   +'<p class="note">You can tap Yes / No for them if they tell you in person. It saves against their name.</p></div></div>';
}

/* ---------- actions ---------- */
window.S_bb=S;window.bbPaint=function(){if(S.mode==="admin")paintAdmin();else paintMine();};
function repaint(){if(S.mode==="admin")paintOne();else paintMine();}
window.bbOpen=function(id){S.open[id]=!S.open[id];var el=$id("td-"+id);if(el)el.classList.toggle("open",!!S.open[id]);};
window.bbAns=async function(id,v){var q=Q.find(function(x){return x.id===id;});var ok;
  if(!current().route)await setFields(["route"],"new",id);
  if(v){ok=await setFields(q.fields,today(),id);if(ok&&id==="sent"&&["not_started","draft"].indexOf(current().applicationStatus)>=0)ok=await setFields(["applicationStatus"],"submitted",id);}
  else{ok=await setFields(q.fields,"",id);if(ok&&id==="sent"&&current().applicationStatus==="submitted")ok=await setFields(["applicationStatus"],"not_started",id);}
  if(ok)repaint();};
window.bbBook=async function(st){var ok;
  if(st==="received"){ok=await setFields(["bookStatus"],"received","book")&&await setFields(["bookReceivedOn"],today(),"book");if(ok&&current().applicationStatus!=="approved")ok=await setFields(["applicationStatus"],"approved","book")&&await setFields(["reportedCsaApprovedOn"],today(),"book");if(ok&&!current().registrationClass)ok=await setFields(["registrationClass"],"Amateur Boxing","book");}
  else{ok=await setFields(["bookStatus"],"not_received","book")&&await setFields(["bookReceivedOn"],"","book");if(ok&&current().applicationStatus==="approved")ok=await setFields(["applicationStatus"],"submitted","book");}
  if(ok)repaint();};
window.bbSighted=async function(v){var ok=await setFields(["bookSightedOn"],v?today():"","sighted");if(ok)repaint();};
window.bbNoteSave=async function(){var ok=await setFields(["staffNote"],($id("bbNote").value||"").trim(),"note");if(ok)T("Saved.");};
window.bbBack=function(){try{go("fc");}catch(e){go("home");}};
window.bbQ=function(v){S.q=v;var keep=document.activeElement;paintAdmin();var inp=document.querySelector(".bb input[type=text]");if(inp&&keep&&keep.tagName==="INPUT"){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);}};
window.bbF=function(f){S.f=f;paintAdmin();};
window.bbSel=function(id){S.sel=id;paintOne();window.scrollTo(0,0);};
window.bbEnter=function(){S.mode=staff()?"admin":"mine";go("bluebook");};

/* ---------- hooks ---------- */
var _render=window.render;window.render=function(){
  if(view==="bluebook"){var m=$id("main");if(m)m.innerHTML='<div class="loadingDots">Opening Blue Book…</div>';S.mode=staff()?"admin":"mine";
    (S.mode==="admin"?loadAll():loadMine()).then(function(){window.bbPaint();}).catch(function(e){var mm=$id("main");if(mm)mm.innerHTML='<div class="bb"><button class="back" onclick="bbBack()">‹ Fight Club</button><div class="card"><p>Couldn\'t load the Blue Book: '+esc(e.message||e)+'</p><button class="btn pri" onclick="render()">Try again</button></div></div>';});return;}
  return _render.apply(this,arguments);};
var cardCss=document.createElement("style");cardCss.textContent="#bbCard{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:linear-gradient(90deg,#0f1a2e,#0d0d0d);border:1px solid #27447d;border-radius:14px;padding:12px 14px;margin:0 0 12px;color:#f2f0eb;cursor:pointer;font-family:inherit}#bbCard .ic{flex:none;width:44px;height:44px;border-radius:12px;background:#102038;display:grid;place-items:center}#bbCard .ic svg{width:34px;height:34px}#bbCard .k{font-size:9px;font-weight:800;letter-spacing:2.5px;color:#4f8cff;text-transform:uppercase}#bbCard .t{font-family:Oswald,sans-serif;font-size:18px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;line-height:1.1;margin-top:2px}#bbCard .s{font-size:11.5px;color:#9a9891;margin-top:3px;line-height:1.4}#bbCard .a{margin-left:auto;color:#4f8cff;font-weight:800;font-size:13px;flex:none}";document.head.appendChild(cardCss);
function addCard(){if(view!=="fc"||$id("bbCard"))return;var anchor=document.querySelector("#main .fccVw")||document.querySelector("#main .fcx .pills");if(!anchor)return;var isStaff=staff();
  var b=document.createElement("button");b.id="bbCard";b.onclick=window.bbEnter;
  b.innerHTML='<div class="ic">'+ICON.book+'</div><div><div class="k">Fight Night paperwork</div><div class="t">'+(isStaff?'Blue Book · all fighters':'Your Blue Book')+'</div><div class="s">'+(isStaff?'Who\'s done their medical, bloods, concussion test and application.':'Medical, bloods, concussion test. What to do and where you\'re up to.')+'</div></div><span class="a">Open ›</span>';
  anchor.insertAdjacentElement("afterend",b);}
setInterval(function(){try{addCard();}catch(e){}},700);
})();
