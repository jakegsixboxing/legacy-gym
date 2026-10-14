/* Legacy Fight Club · Blue Book rules (reference workflow, ported 14 Oct 2026).
   Pure functions, no DOM. Loaded in the app as window.BB_RULES and testable in Node.
   This is paperwork tracking only. It never grants permission to compete or spar. */
(function(root,factory){if(typeof module!=="undefined"&&module.exports)module.exports=factory();else root.BB_RULES=factory();})(typeof self!=="undefined"?self:this,function(){
"use strict";
var RULES=Object.freeze({checkedOn:"2026-10-14",timezone:"Australia/Sydney",eventDate:"2026-12-19",eventName:"Fight Club Fight Night",amateurFeeAud:20,professionalFeeAud:100,replacementFeeAud:50,fitnessSubmissionDays:28,examToCertificateDays:14,fitnessReviewMonths:12,adultSerologyMonths:6,juniorSerologyMonths:12,bookPhoto:null,bookImageStatus:"No verified public CSA book photograph located"});
var DAY=86400000;
function parseDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v||""))return null;var d=new Date(v+"T00:00:00.000Z");return isNaN(d.valueOf())||d.toISOString().slice(0,10)!==v?null:d;}
function addMonths(v,m){var d=parseDate(v);if(!d)return null;var day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+m);var last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}
function addDays(v,n){var d=parseDate(v);return d?new Date(d.valueOf()+n*DAY).toISOString().slice(0,10):null;}
function daysBetween(a,b){var x=parseDate(a),y=parseDate(b);return x&&y?Math.round((y-x)/DAY):null;}
function ageOn(dob,on){if(!parseDate(dob)||!parseDate(on)||dob>on)return null;var age=Number(on.slice(0,4))-Number(dob.slice(0,4));if(on.slice(5)<dob.slice(5))age--;return age;}
function sydneyToday(now){now=now||new Date();var parts=new Intl.DateTimeFormat("en",{timeZone:RULES.timezone,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);var p=function(t){return parts.find(function(x){return x.type===t;}).value;};return p("year")+"-"+p("month")+"-"+p("day");}
function fmtAU(v){var d=parseDate(v);return d?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):"";}

function newRecord(id,displayName,dob){return {id:id,displayName:displayName,dob:dob||"",route:"",accountReady:false,identityReady:false,photoReady:false,guardianConsentReady:false,concussionDoneOn:"",
 medicalAppointmentOn:"",medicalExamOn:"",medicalIssuedOn:"",medicalSentOn:"",bloodAppointmentOn:"",bloodSampleOn:"",bloodReviewedOn:"",serologyIssuedOn:"",serologySentOn:"",
 applicationStatus:"not_started",applicationRef:"",applicationSubmittedOn:"",applicationCompletedOn:"",reportedCsaApprovedOn:"",registrationNumber:"",registrationExpiresOn:"",registrationClass:"",
 bookStatus:"not_received",bookReceivedOn:"",replacementStatus:"",reviews:{},official:{status:"unchecked",checkedOn:"",classMatch:false},restriction:{status:"unknown",evidenceRef:"",checkedOn:""},eventReview:null,audit:[]};}
function verified(r,item){var v=r.reviews&&r.reviews[item];return !!(v&&v.status==="verified"&&v.by&&v.at&&v.evidenceRef);}
function completeDate(v,today){return !!(parseDate(v)&&v<=today);}

var participantFields=["dob","route","accountReady","identityReady","photoReady","guardianConsentReady","concussionDoneOn","medicalAppointmentOn","medicalExamOn","medicalIssuedOn","medicalSentOn","bloodAppointmentOn","bloodSampleOn","bloodReviewedOn","serologyIssuedOn","serologySentOn","applicationStatus","applicationRef","applicationSubmittedOn","applicationCompletedOn","reportedCsaApprovedOn","registrationNumber","registrationExpiresOn","registrationClass","bookStatus","bookReceivedOn","replacementStatus"];
var booleans=["accountReady","identityReady","photoReady","guardianConsentReady"];
var enums={route:["","new","existing"],applicationStatus:["not_started","draft","submitted","more_information","approved","refused","withdrawn"],bookStatus:["not_received","received","lost","damaged","full","replacement_requested"],replacementStatus:["","requested","pending","received"],registrationClass:["","Amateur Boxing","Other"]};
var futureOk=["medicalAppointmentOn","bloodAppointmentOn","registrationExpiresOn"];
/* which admin reviews a participant edit invalidates (narrowed policy) */
var affects={dob:["concussion","medical","serology","guardian","registration","book"],route:["registration"],guardianConsentReady:["guardian"],concussionDoneOn:["concussion"],
 medicalAppointmentOn:[],medicalExamOn:["medical"],medicalIssuedOn:["medical"],medicalSentOn:["medical"],bloodAppointmentOn:[],bloodSampleOn:["serology"],bloodReviewedOn:[],serologyIssuedOn:["serology"],serologySentOn:["serology"],
 applicationStatus:["registration"],applicationRef:[],applicationSubmittedOn:["guardian","registration"],applicationCompletedOn:["medical","registration"],reportedCsaApprovedOn:["registration"],registrationNumber:["registration"],registrationExpiresOn:["registration"],registrationClass:["registration"],bookStatus:["book"],bookReceivedOn:["book"],replacementStatus:[]};
function validateParticipantEdit(record,field,value,today){
  if(participantFields.indexOf(field)<0)throw new Error("Field cannot be changed by a participant.");
  if(booleans.indexOf(field)>=0?typeof value!=="boolean":typeof value!=="string")throw new Error("Invalid field value.");
  if(enums[field]&&enums[field].indexOf(value)<0)throw new Error("Invalid status.");
  var isDate=field==="dob"||/On$/.test(field);
  if(isDate&&value&&!parseDate(value))throw new Error("Use a valid date.");
  if(isDate&&value&&futureOk.indexOf(field)<0&&value>today)throw new Error("Completion dates cannot be in the future.");
  return true;
}
function participantUpdate(record,field,value,actor,now){now=now||new Date();
  if(!actor||!actor.id||actor.role!=="participant"||actor.participantId!==record.id)throw new Error("Participants can only update their own record.");
  validateParticipantEdit(record,field,value,sydneyToday(now));
  if(record[field]===value)return JSON.parse(JSON.stringify(record));
  var next=JSON.parse(JSON.stringify(record));next[field]=value;
  (affects[field]||[]).forEach(function(item){delete next.reviews[item];});
  if((affects[field]||[]).indexOf("registration")>=0)next.official={status:"unchecked",checkedOn:"",classMatch:false};
  next.eventReview=null;
  if(next.restriction&&next.restriction.status==="none_recorded"&&(field==="dob"||/^(medical|blood|serology)/.test(field)))next.restriction={status:"unknown",evidenceRef:"",checkedOn:""};
  next.audit=(next.audit||[]).concat([{actorId:actor.id,action:"participant_update",details:{field:field,previous:record[field],value:value},at:now.toISOString()}]);
  return next;
}
function requireAdmin(actor){if(!actor||!actor.id||actor.role!=="admin")throw new Error("An authenticated admin is required.");}
function recordOfficialCheck(record,check,actor,now){now=now||new Date();requireAdmin(actor);
  if(["active","suspended","expired","no_match"].indexOf(check.status)<0||!check.evidenceRef||typeof check.classMatch!=="boolean")throw new Error("Record the register check and its source.");
  var next=JSON.parse(JSON.stringify(record));next.official={status:check.status,classMatch:check.classMatch,evidenceRef:check.evidenceRef,checkedOn:sydneyToday(now),checkedBy:actor.id};
  delete next.reviews.registration;next.eventReview=null;next.audit=(next.audit||[]).concat([{actorId:actor.id,action:"official_register_check",details:next.official,at:now.toISOString()}]);return next;}
function recordRestrictionCheck(record,status,evidenceRef,actor,now){now=now||new Date();requireAdmin(actor);
  if(["unknown","none_recorded","restricted","return_clearance_required"].indexOf(status)<0||!evidenceRef)throw new Error("A restriction review needs an evidence reference.");
  var next=JSON.parse(JSON.stringify(record));next.restriction={status:status,evidenceRef:evidenceRef,checkedOn:sydneyToday(now),checkedBy:actor.id};next.eventReview=null;
  next.audit=(next.audit||[]).concat([{actorId:actor.id,action:"restriction_check",details:next.restriction,at:now.toISOString()}]);return next;}
var REVIEW_DATES={concussion:["concussionDoneOn"],medical:["medicalExamOn","medicalIssuedOn","medicalSentOn"],serology:["bloodSampleOn","serologyIssuedOn","serologySentOn"],book:["bookReceivedOn"]};
function reviewItem(record,item,status,evidenceRef,actor,now){now=now||new Date();requireAdmin(actor);
  if(["concussion","medical","serology","guardian","registration","book"].indexOf(item)<0||["verified","changes_required"].indexOf(status)<0||!evidenceRef)throw new Error("Choose a checklist item, review result and source.");
  var today=sydneyToday(now);
  if(status==="verified"){
    (REVIEW_DATES[item]||[]).forEach(function(f){if(!completeDate(record[f],today))throw new Error("Required dates are missing or invalid.");});
    if(item==="guardian"&&!record.guardianConsentReady)throw new Error("Consent has not been recorded.");
    if(item==="book"&&record.bookStatus!=="received")throw new Error("The physical book is not recorded as received.");
    if(item==="registration"&&(!record.registrationNumber||!parseDate(record.registrationExpiresOn)||record.registrationClass!=="Amateur Boxing"||!record.official||record.official.status!=="active"||!record.official.classMatch||!record.official.evidenceRef))throw new Error("Confirm the active Amateur Boxing registration using official evidence.");
  }
  var next=JSON.parse(JSON.stringify(record));next.reviews[item]={status:status,evidenceRef:evidenceRef,by:actor.id,at:now.toISOString()};next.eventReview=null;
  next.audit=(next.audit||[]).concat([{actorId:actor.id,action:"checklist_review",details:{item:item,status:status,evidenceRef:evidenceRef},at:now.toISOString()}]);return next;}

/** Computed paperwork state. NEVER a permission to compete or spar. */
function evaluate(record,eventDate,today){eventDate=eventDate||RULES.eventDate;today=today||sydneyToday();
  if(!parseDate(eventDate)||!parseDate(today))throw new Error("Valid event and today dates are required.");
  var issues=[],blockers=[];var add=function(code,message,blocking){if(blocking===undefined)blocking=true;issues.push({code:code,message:message,blocking:blocking});if(blocking)blockers.push(code);};
  var currentAge=ageOn(record.dob,today),eventAge=ageOn(record.dob,eventDate),submissionAge=ageOn(record.dob,record.applicationSubmittedOn||today);
  if(currentAge===null||eventAge===null)add("dob","Add a valid date of birth.");else if(currentAge<14||eventAge<14)add("age","NSW combatant registration starts at age 14.");
  var needsConsent=submissionAge!==null&&submissionAge<18;
  if(needsConsent&&(!record.guardianConsentReady||!verified(record,"guardian")))add("guardian","Parent/guardian consent needs review.");
  var serologyMonths=eventAge!==null&&eventAge<18?12:6;
  var bloodReviewOn=addMonths(record.bloodSampleOn,serologyMonths);
  var currentBloodReviewOn=addMonths(record.bloodSampleOn,currentAge!==null&&currentAge<18?12:6);
  var fitnessReviewOn=addMonths(record.medicalIssuedOn,12);
  function checkWindow(issued,anniversary,type,currentAnniversary){currentAnniversary=currentAnniversary||anniversary;
    if(!completeDate(issued,today)||!anniversary){add(type+"_date","Add valid "+type+" dates.");return;}
    if(today>=currentAnniversary)add(type+"_renew_now","Refresh "+type+" now; confirm current clearance with CSA.");
    else if(eventDate>anniversary)add(type+"_renew_for_event","Refresh "+type+" before Fight Night.");
    else if(eventDate===anniversary)add(type+"_boundary",type+" reaches its calculated review date on Fight Night; refresh or confirm with CSA.");}
  checkWindow(record.bloodSampleOn,bloodReviewOn,"serology",currentBloodReviewOn);
  checkWindow(record.medicalIssuedOn,fitnessReviewOn,"fitness");
  [["medical","fitness certificate"],["serology","blood clearance"],["concussion","concussion training"]].forEach(function(p){if(!verified(record,p[0]))add(p[0]+"_review",p[1]+" needs coach/admin review.");});
  if(!completeDate(record.concussionDoneOn,today))add("concussion_date","Record completed concussion training.");
  var examGap=daysBetween(record.medicalExamOn,record.medicalIssuedOn);
  if(examGap===null||examGap<0||examGap>14)add("exam_timing","Check the examination and fitness certificate dates with the doctor.");
  var reliedOn=record.route==="new"?(record.applicationCompletedOn||record.medicalSentOn):record.medicalSentOn;
  var submissionGap=daysBetween(record.medicalIssuedOn,reliedOn);
  if(submissionGap===null||submissionGap<0||submissionGap>28)add("fitness_submission","Fitness paperwork must reach CSA within 28 days; resolve incomplete applications with CSA.");
  if(!completeDate(record.medicalSentOn,today))add("medical_upload","Record submission of the fitness certificate to CSA.");
  if(!completeDate(record.serologySentOn,today))add("serology_upload","Record submission of the serology certificate to CSA.");
  var serologyGap=daysBetween(record.bloodSampleOn,record.serologyIssuedOn);
  if(serologyGap===null||serologyGap<0||!completeDate(record.serologyIssuedOn,today))add("serology_certificate","Record a valid, issued serology clearance certificate.");
  if(record.route!=="existing"&&record.applicationStatus!=="approved")add("application",record.applicationStatus==="submitted"?"Application pending CSA decision.":"Complete or resolve the CSA application.");
  if(record.route!=="existing"&&(!completeDate(record.applicationSubmittedOn,today)||!record.applicationRef||!completeDate(record.applicationCompletedOn,today)||!completeDate(record.reportedCsaApprovedOn,today)))add("application_details","Record the application reference, completion dates and reported CSA approval.");
  if(!verified(record,"registration")||!record.official||record.official.status!=="active"||!record.official.classMatch)add("registration_review","An admin must confirm the active Amateur Boxing registration.");
  if(!record.registrationNumber||record.registrationClass!=="Amateur Boxing")add("registration_details","Confirm the combatant registration number and Amateur Boxing class.");
  if(!parseDate(record.registrationExpiresOn))add("registration_date","Add the official registration expiry date when CSA approves the application.");
  else if(record.registrationExpiresOn<=eventDate)add("registration_expiry","Registration expiry needs review or renewal before Fight Night.");
  if(record.bookStatus!=="received"||!completeDate(record.bookReceivedOn,today)||!verified(record,"book"))add("book","Receive the physical book and show it to the coach/admin.");
  if(!record.restriction||record.restriction.status!=="none_recorded"||!record.restriction.evidenceRef)add("restriction","Medical restrictions/rest periods need an authorised review.");
  var allReviewed=blockers.length===0;
  var finalReviewed=allReviewed&&record.eventReview&&record.eventReview.status==="verified"&&record.eventReview.eventDate===eventDate&&record.eventReview.by&&record.eventReview.at;
  var csaApprovedVerified=verified(record,"registration")&&record.official&&record.official.status==="active";
  var status="action_required";
  if(allReviewed)status=finalReviewed?"paperwork_reviewed":"awaiting_final_review";
  else if(issues.some(function(x){return /renew|expiry|boundary/.test(x.code);})||["restricted","return_clearance_required"].indexOf(record.restriction&&record.restriction.status)>=0||["suspended","expired","no_match"].indexOf(record.official&&record.official.status)>=0||["more_information","refused"].indexOf(record.applicationStatus)>=0)status="needs_attention";
  else if(record.applicationStatus==="submitted")status="pending_csa";
  else if(csaApprovedVerified&&record.bookStatus!=="received")status="awaiting_book";
  return {status:status,csaApprovedVerified:!!csaApprovedVerified,issues:issues,blockers:blockers,paperworkReviewed:!!finalReviewed,needsConsent:needsConsent,serologyMonths:serologyMonths,bloodReviewOn:bloodReviewOn,currentBloodReviewOn:currentBloodReviewOn,fitnessReviewOn:fitnessReviewOn,
    competitionClearance:"Event-day medical and organiser checks still required",registrationSubmissionDueOn:record.medicalIssuedOn&&parseDate(record.medicalIssuedOn)?addDays(record.medicalIssuedOn,28):null};
}
function finalPaperworkReview(record,actor,now,eventDate){now=now||new Date();eventDate=eventDate||RULES.eventDate;requireAdmin(actor);
  var result=evaluate(record,eventDate,sydneyToday(now));if(result.blockers.length)throw new Error("Resolve outstanding paperwork items before the final review.");
  var next=JSON.parse(JSON.stringify(record));next.eventReview={status:"verified",eventDate:eventDate,by:actor.id,at:now.toISOString()};
  next.audit=(next.audit||[]).concat([{actorId:actor.id,action:"final_paperwork_review",details:{eventDate:eventDate},at:now.toISOString()}]);return next;}

/* Step completion rules (reported) and checked state, for progress text "4 of 7 reported · 2 checked" */
function stepState(r,id,today){
  var ev=null;
  switch(id){
    case "prepare":return {reported:!!(r.accountReady&&r.identityReady&&r.photoReady),checked:false,na:false};
    case "concussion":return {reported:completeDate(r.concussionDoneOn,today),checked:verified(r,"concussion"),changes:(r.reviews.concussion||{}).status==="changes_required"};
    case "medical":return {reported:completeDate(r.medicalExamOn,today)&&completeDate(r.medicalIssuedOn,today)&&completeDate(r.medicalSentOn,today),checked:verified(r,"medical"),changes:(r.reviews.medical||{}).status==="changes_required",partial:!!(r.medicalAppointmentOn||r.medicalExamOn||r.medicalIssuedOn)};
    case "blood":return {reported:completeDate(r.bloodSampleOn,today)&&completeDate(r.serologyIssuedOn,today)&&completeDate(r.serologySentOn,today),checked:verified(r,"serology"),changes:(r.reviews.serology||{}).status==="changes_required",partial:!!(r.bloodAppointmentOn||r.bloodSampleOn||r.serologyIssuedOn)};
    case "apply":return {reported:r.route==="existing"||(["submitted","more_information","approved"].indexOf(r.applicationStatus)>=0&&!!r.applicationRef&&completeDate(r.applicationSubmittedOn,today)),checked:false,partial:r.applicationStatus==="draft"};
    case "approval":return {reported:r.route==="existing"?!!(r.registrationNumber&&r.registrationExpiresOn):(r.applicationStatus==="approved"&&completeDate(r.reportedCsaApprovedOn,today)&&!!r.registrationNumber),checked:verified(r,"registration"),changes:(r.reviews.registration||{}).status==="changes_required"};
    case "book":return {reported:r.bookStatus==="received"&&completeDate(r.bookReceivedOn,today),checked:verified(r,"book"),changes:(r.reviews.book||{}).status==="changes_required"};
  }
  return {reported:false,checked:false};
}
var STEP_IDS=["prepare","concussion","medical","blood","apply","approval","book"];
function progress(r,today){var rep=0,chk=0;STEP_IDS.forEach(function(id){var s=stepState(r,id,today);if(s.reported)rep++;if(s.checked)chk++;});return {reported:rep,checked:chk,total:STEP_IDS.length,text:rep+" of "+STEP_IDS.length+" steps reported complete · "+chk+" checked"};}
/* The one thing to do next, for the participant */
function nextAction(r,ev,today){
  if(!r.route)return {step:null,text:"Tell us whether this is your first registration or you already have a book."};
  if(!parseDate(r.dob))return {step:"prepare",text:"Add your date of birth so we can work out your blood-test window."};
  if(r.route==="existing"&&!(r.registrationNumber&&r.registrationExpiresOn))return {step:"approval",text:"Enter your registration number, class and expiry date."};
  if(!(r.accountReady&&r.identityReady&&r.photoReady))return {step:"prepare",text:"Get your MyServiceNSW account, ID documents and photo ready."};
  if(ev.needsConsent&&!r.guardianConsentReady)return {step:"prepare",text:"Get the parent/guardian consent form signed."};
  if(!completeDate(r.concussionDoneOn,today))return {step:"concussion",text:"Do the free 20-minute concussion course and record the date."};
  if(!completeDate(r.medicalExamOn,today))return {step:"medical",text:r.medicalAppointmentOn?"Go to your doctor's appointment on "+fmtAU(r.medicalAppointmentOn)+" with the fitness form filled in.":"Book your doctor and print the fitness form."};
  if(!completeDate(r.medicalIssuedOn,today))return {step:"medical",text:"Collect your signed fitness certificate (within 14 days of the exam)."};
  if(!completeDate(r.bloodSampleOn,today))return {step:"blood",text:"Get your blood taken using the doctor's pathology referral."};
  if(!completeDate(r.serologyIssuedOn,today))return {step:"blood",text:"Collect your signed serology clearance certificate."};
  if(r.route==="new"&&["submitted","more_information","approved"].indexOf(r.applicationStatus)<0){var due=addDays(r.medicalIssuedOn,28);return {step:"apply",text:"Submit the CSA application with both certificates"+(due?" by "+fmtAU(due)+" (28 days from your fitness certificate)":"")+"."};}
  if(!completeDate(r.medicalSentOn,today)||!completeDate(r.serologySentOn,today))return {step:r.route==="new"?"apply":"medical",text:"Record the dates you submitted the fitness and serology certificates to CSA."};
  if(r.applicationStatus==="more_information")return {step:"apply",text:"CSA has asked for more information. Follow the notice; you normally have 21 days."};
  if(r.route==="new"&&r.applicationStatus==="submitted")return {step:"approval",text:"Waiting on CSA. Allow at least ten business days, then report the decision here."};
  if(r.route==="new"&&r.applicationStatus==="approved"&&!(r.registrationNumber&&r.registrationExpiresOn))return {step:"approval",text:"Enter your registration number, approved class and official expiry."};
  if(!verified(r,"registration"))return {step:"approval",text:"Ask Jake or Alison to verify your registration on the public register."};
  if(r.bookStatus!=="received")return {step:"book",text:r.bookStatus==="not_received"?"Mark your book received when it arrives.":"Sort out the book replacement through Service NSW."};
  if(!verified(r,"book"))return {step:"book",text:"Show your physical book to Jake or Alison."};
  if(ev.blockers.length)return {step:null,text:ev.issues.filter(function(i){return i.blocking;})[0].message};
  if(!ev.paperworkReviewed)return {step:"book",text:"All steps checked. Waiting on the final Legacy paperwork review."};
  return {step:null,text:"Paperwork reviewed — event-day medical still required."};
}
var STATUS_TEXT={action_required:"Action required",pending_csa:"Pending CSA",awaiting_book:"Awaiting book",awaiting_final_review:"Awaiting Legacy review",needs_attention:"Needs attention",paperwork_reviewed:"Paperwork reviewed"};
var APP_TEXT={not_started:"Not started",draft:"Draft",submitted:"Pending CSA",more_information:"More information requested",approved:"Approved reported",refused:"Refused",withdrawn:"Withdrawn"};
return {RULES:RULES,parseDate:parseDate,addMonths:addMonths,addDays:addDays,daysBetween:daysBetween,ageOn:ageOn,sydneyToday:sydneyToday,fmtAU:fmtAU,newRecord:newRecord,verified:verified,completeDate:completeDate,participantFields:participantFields,validateParticipantEdit:validateParticipantEdit,affects:affects,participantUpdate:participantUpdate,recordOfficialCheck:recordOfficialCheck,recordRestrictionCheck:recordRestrictionCheck,reviewItem:reviewItem,evaluate:evaluate,finalPaperworkReview:finalPaperworkReview,stepState:stepState,progress:progress,nextAction:nextAction,STEP_IDS:STEP_IDS,STATUS_TEXT:STATUS_TEXT,APP_TEXT:APP_TEXT};
});
