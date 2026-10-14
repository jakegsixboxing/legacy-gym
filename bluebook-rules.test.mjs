import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const src = readFileSync(fileURLToPath(new URL('./bluebook-rules.js', import.meta.url)), 'utf8');
const shim = { exports: {} };
new Function('module', 'self', src)(shim, undefined); // the package is ESM; load the browser file through a CommonJS shim
const R = shim.exports;

const ADMIN = { id: 'admin-1', role: 'admin' };
const P = (id) => ({ id: 'p-' + id, role: 'participant', participantId: 'fighter-' + id });
const TODAY = '2026-10-14', EVENT = '2026-12-19';
const at = (d) => new Date(d + 'T03:00:00.000Z'); // 2pm Sydney on that day (AEDT)

function complete(id, dob, overrides = {}) {
  let r = R.newRecord('fighter-' + id, 'Demo Participant ' + id, dob);
  const set = (f, v) => { r = R.participantUpdate(r, f, v, P(id), at(TODAY)); };
  set('route', 'new'); set('accountReady', true); set('identityReady', true); set('photoReady', true);
  set('concussionDoneOn', '2026-09-20'); set('medicalAppointmentOn', '2026-09-25'); set('medicalExamOn', '2026-09-25');
  set('medicalIssuedOn', '2026-09-28'); set('bloodSampleOn', '2026-09-25'); set('bloodReviewedOn', '2026-09-30');
  set('serologyIssuedOn', '2026-09-30'); set('medicalSentOn', '2026-10-02'); set('serologySentOn', '2026-10-02');
  set('applicationStatus', 'submitted'); set('applicationRef', 'DEMO-REF-' + id); set('applicationSubmittedOn', '2026-10-02'); set('applicationCompletedOn', '2026-10-02');
  for (const [k, v] of Object.entries(overrides)) set(k, v);
  return r;
}
function approved(id, dob, overrides = {}) {
  let r = complete(id, dob);
  const set = (f, v) => { r = R.participantUpdate(r, f, v, P(id), at(TODAY)); };
  set('applicationStatus', 'approved'); set('reportedCsaApprovedOn', '2026-10-10'); set('registrationNumber', 'DEMO-123456');
  set('registrationClass', 'Amateur Boxing'); set('registrationExpiresOn', '2029-10-10'); set('bookStatus', 'received'); set('bookReceivedOn', '2026-10-13');
  for (const [k, v] of Object.entries(overrides)) set(k, v);
  return r;
}
function fullyVerified(id, dob, overrides = {}) {
  let r = approved(id, dob, overrides);
  r = R.recordOfficialCheck(r, { status: 'active', classMatch: true, evidenceRef: 'DEMO-register-check' }, ADMIN, at(TODAY));
  for (const item of ['concussion', 'medical', 'serology', 'registration', 'book']) r = R.reviewItem(r, item, 'verified', 'DEMO-evidence-' + item, ADMIN, at(TODAY));
  r = R.recordRestrictionCheck(r, 'none_recorded', 'DEMO-book-page', ADMIN, at(TODAY));
  return r;
}

test('adult serology window is six months from the blood test', () => {
  const r = complete(1, '1998-03-10');
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.equal(ev.serologyMonths, 6); assert.equal(ev.bloodReviewOn, '2027-03-25');
  assert.ok(!ev.issues.some(i => /serology_renew/.test(i.code)));
});
test('adult blood taken more than six months before the event needs a refresh for the event', () => {
  const r = complete(2, '1998-03-10', { bloodSampleOn: '2026-06-01', serologyIssuedOn: '2026-06-05' });
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.ok(ev.issues.some(i => i.code === 'serology_renew_for_event'));
  assert.equal(ev.status, 'needs_attention');
});
test('current today but stale on event day is flagged', () => {
  const r = complete(3, '1998-03-10', { bloodSampleOn: '2026-06-01', serologyIssuedOn: '2026-06-05' });
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.ok(!ev.issues.some(i => i.code === 'serology_renew_now'));
  assert.ok(ev.issues.some(i => i.code === 'serology_renew_for_event'));
});
test('junior serology window is twelve months', () => {
  const r = complete(4, '2010-05-01', { bloodSampleOn: '2026-03-01', serologyIssuedOn: '2026-03-05' });
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.equal(ev.serologyMonths, 12); assert.ok(!ev.issues.some(i => /serology_renew/.test(i.code)));
});
test('turning 18 before the event uses the adult six-month window on event day', () => {
  const r = complete(5, '2008-12-01', { bloodSampleOn: '2026-03-01', serologyIssuedOn: '2026-03-05' });
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.equal(R.ageOn('2008-12-01', TODAY), 17); assert.equal(R.ageOn('2008-12-01', EVENT), 18);
  assert.equal(ev.serologyMonths, 6); assert.ok(ev.issues.some(i => i.code === 'serology_renew_for_event'));
  assert.equal(ev.currentBloodReviewOn, '2027-03-01');
});
test('under 18 at submission needs guardian consent', () => {
  const r = complete(6, '2010-05-01');
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.equal(ev.needsConsent, true); assert.ok(ev.blockers.includes('guardian'));
});
test('fitness exam more than 14 days before the certificate is flagged', () => {
  const r = complete(7, '1998-03-10', { medicalExamOn: '2026-09-01', medicalIssuedOn: '2026-09-28' });
  assert.ok(R.evaluate(r, EVENT, TODAY).blockers.includes('exam_timing'));
});
test('fitness certificate must reach CSA within 28 days', () => {
  const r = complete(8, '1998-03-10', { medicalExamOn: '2026-08-20', medicalIssuedOn: '2026-08-25', applicationCompletedOn: '2026-10-02' });
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.ok(ev.blockers.includes('fitness_submission')); assert.equal(ev.registrationSubmissionDueOn, '2026-09-22');
});
test('submitted application is pending, not approved', () => {
  const ev = R.evaluate(complete(9, '1998-03-10'), EVENT, TODAY);
  assert.equal(ev.status, 'pending_csa'); assert.equal(ev.csaApprovedVerified, false);
});
test('self-reported approval is not verified until an admin checks the register', () => {
  const r = approved(10, '1998-03-10');
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.equal(ev.csaApprovedVerified, false); assert.ok(ev.blockers.includes('registration_review'));
  assert.throws(() => R.reviewItem(r, 'registration', 'verified', 'x', ADMIN, at(TODAY)), /official evidence/);
});
test('verified approval without a book is awaiting book', () => {
  let r = approved(11, '1998-03-10', { bookStatus: 'not_received', bookReceivedOn: '' });
  r = R.recordOfficialCheck(r, { status: 'active', classMatch: true, evidenceRef: 'DEMO-reg' }, ADMIN, at(TODAY));
  r = R.reviewItem(r, 'registration', 'verified', 'DEMO-reg', ADMIN, at(TODAY));
  assert.equal(R.evaluate(r, EVENT, TODAY).status, 'awaiting_book');
});
test('lost book cannot be verified as received', () => {
  const r = approved(12, '1998-03-10', { bookStatus: 'lost' });
  assert.throws(() => R.reviewItem(r, 'book', 'verified', 'x', ADMIN, at(TODAY)), /not recorded as received/);
});
test('suspended registration needs attention', () => {
  let r = approved(13, '1998-03-10');
  r = R.recordOfficialCheck(r, { status: 'suspended', classMatch: true, evidenceRef: 'DEMO-reg' }, ADMIN, at(TODAY));
  assert.equal(R.evaluate(r, EVENT, TODAY).status, 'needs_attention');
});
test('registration expiring before the event is flagged', () => {
  const r = approved(14, '1998-03-10', { registrationExpiresOn: '2026-12-01' });
  assert.ok(R.evaluate(r, EVENT, TODAY).blockers.includes('registration_expiry'));
});
test('fully verified record awaits final review, then is paperwork reviewed', () => {
  let r = fullyVerified(15, '1998-03-10');
  let ev = R.evaluate(r, EVENT, TODAY);
  assert.deepEqual(ev.blockers, []); assert.equal(ev.status, 'awaiting_final_review');
  r = R.finalPaperworkReview(r, ADMIN, at(TODAY), EVENT);
  ev = R.evaluate(r, EVENT, TODAY);
  assert.equal(ev.status, 'paperwork_reviewed'); assert.equal(ev.competitionClearance, 'Event-day medical and organiser checks still required');
});
test('final review is refused while blockers remain', () => {
  assert.throws(() => R.finalPaperworkReview(approved(16, '1998-03-10'), ADMIN, at(TODAY), EVENT), /outstanding paperwork/);
});
test('a participant edit invalidates the affected review and the final review, not unrelated ones', () => {
  let r = fullyVerified(17, '1998-03-10');
  r = R.finalPaperworkReview(r, ADMIN, at(TODAY), EVENT);
  r = R.participantUpdate(r, 'bloodSampleOn', '2026-10-01', P(17), at(TODAY));
  assert.equal(r.reviews.serology, undefined); assert.equal(r.reviews.concussion.status, 'verified'); assert.equal(r.eventReview, null);
  assert.equal(r.restriction.status, 'unknown');
});
test('a participant edit never clears an active medical hold', () => {
  let r = fullyVerified(18, '1998-03-10');
  r = R.recordRestrictionCheck(r, 'restricted', 'DEMO-doctor-note', ADMIN, at(TODAY));
  r = R.participantUpdate(r, 'medicalExamOn', '2026-09-24', P(18), at(TODAY));
  assert.equal(r.restriction.status, 'restricted');
});
test('participants cannot edit another record or admin fields', () => {
  const r = complete(19, '1998-03-10');
  assert.throws(() => R.participantUpdate(r, 'accountReady', false, P(20), at(TODAY)), /own record/);
  assert.throws(() => R.participantUpdate(r, 'reviews', {}, P(19), at(TODAY)), /cannot be changed/);
  assert.throws(() => R.reviewItem(r, 'medical', 'verified', 'x', P(19), at(TODAY)), /admin/);
});
test('completion dates cannot be in the future (Sydney today)', () => {
  const r = complete(21, '1998-03-10');
  assert.throws(() => R.participantUpdate(r, 'concussionDoneOn', '2026-10-15', P(21), at(TODAY)), /future/);
  assert.equal(R.sydneyToday(new Date('2026-10-14T13:30:00.000Z')), '2026-10-15'); // 00:30 AEDT next day
  assert.equal(R.sydneyToday(new Date('2026-10-14T12:30:00.000Z')), '2026-10-14');
});
test('calculated review date falling on the contest date is flagged as a boundary', () => {
  const r = complete(22, '1998-03-10', { bloodSampleOn: '2026-06-19', serologyIssuedOn: '2026-06-22' });
  assert.ok(R.evaluate(r, EVENT, TODAY).issues.some(i => i.code === 'serology_boundary'));
});
test('progress text counts reported and checked steps separately', () => {
  const r = fullyVerified(23, '1998-03-10');
  assert.equal(R.progress(r, TODAY).text, '7 of 7 steps reported complete · 5 checked');
  const n = R.newRecord('fighter-24', 'Demo Participant 24', '1998-03-10');
  assert.equal(R.progress(n, TODAY).text, '0 of 7 steps reported complete · 0 checked');
});
test('existing combatant route skips the new application requirement', () => {
  let r = R.newRecord('fighter-25', 'Demo Participant 25', '1998-03-10');
  const set = (f, v) => { r = R.participantUpdate(r, f, v, P(25), at(TODAY)); };
  set('route', 'existing'); set('registrationNumber', 'DEMO-9'); set('registrationClass', 'Amateur Boxing'); set('registrationExpiresOn', '2028-01-01');
  const ev = R.evaluate(r, EVENT, TODAY);
  assert.ok(!ev.blockers.includes('application')); assert.ok(!ev.blockers.includes('application_details'));
});
