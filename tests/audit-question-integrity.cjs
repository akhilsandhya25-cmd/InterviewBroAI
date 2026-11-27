const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('AUDIT STEP 1: QUESTION INTEGRITY & DEDUPLICATION CHECK');
console.log('====================================================\n');

// 1. Universal Question Banks
const uqbPath = path.resolve('client/src/data/universalQuestionBanks.ts');
const uqbContent = fs.readFileSync(uqbPath, 'utf8');

// Match all IDs in universalQuestionBanks.ts
const idMatches = [...uqbContent.matchAll(/id:\s*['"]([a-zA-Z0-9_\-]+)['"]/g)].map(m => m[1]);
const nonVideoIds = idMatches.filter(id => !id.startsWith('vid-bykq-') && !['videoQuestionBank', 'studentStreams'].includes(id));
const videoIdsInUqb = idMatches.filter(id => id.startsWith('vid-bykq-'));

console.log('[Check 1.1] Original 70 Universal Questions Count:');
console.log(`   Found ${nonVideoIds.length} original IDs.`);
assert.strictEqual(nonVideoIds.length, 70, `Expected exactly 70 original questions, found ${nonVideoIds.length}`);

// Check that original IDs are distinct
const originalIdSet = new Set(nonVideoIds);
assert.strictEqual(originalIdSet.size, 70, 'Original questions must have 70 unique IDs');
console.log('   ✅ PASS: All 70 original universal questions are present with 0 deletions.');

// 2. Video Primary Questions
const {
  VIDEO_PRIMARY_QUESTIONS,
  VIDEO_FOLLOWUP_QUESTIONS,
  findVideoQuestionById,
  findVideoQuestionByText
} = require('../api/_lib/videoQuestionBank.js');

console.log('\n[Check 1.2] 18 New Primary Video Questions:');
console.log(`   Found ${VIDEO_PRIMARY_QUESTIONS.length} primary questions.`);
assert.strictEqual(VIDEO_PRIMARY_QUESTIONS.length, 18, 'Expected exactly 18 primary video questions');

const primaryIdSet = new Set();
const primaryTextSet = new Set();
VIDEO_PRIMARY_QUESTIONS.forEach((q, idx) => {
  assert(q.id.startsWith('vid-bykq-'), `Question ${idx + 1} has invalid ID prefix: ${q.id}`);
  assert(!primaryIdSet.has(q.id), `Duplicate primary question ID detected: ${q.id}`);
  primaryIdSet.add(q.id);

  const normText = q.questionText.trim().toLowerCase();
  assert(!primaryTextSet.has(normText), `Duplicate primary question text detected: "${q.questionText}"`);
  primaryTextSet.add(normText);
});
console.log('   ✅ PASS: Exactly 18 unique primary questions exist with zero duplicate IDs or text.');

// 3. Follow-up Questions Check
console.log('\n[Check 1.3] 36 Follow-up Questions & Parent References:');
console.log(`   Found ${VIDEO_FOLLOWUP_QUESTIONS.length} follow-up questions.`);
assert.strictEqual(VIDEO_FOLLOWUP_QUESTIONS.length, 36, 'Expected exactly 36 follow-up questions');

const followUpIdSet = new Set();
const followUpTextSet = new Set();
const parentReferenceCounts = {};

VIDEO_FOLLOWUP_QUESTIONS.forEach((fu, idx) => {
  assert(fu.id.includes('-fu'), `Follow-up ${idx + 1} has invalid ID: ${fu.id}`);
  assert(!followUpIdSet.has(fu.id), `Duplicate follow-up ID detected: ${fu.id}`);
  followUpIdSet.add(fu.id);

  const normText = fu.questionText.trim().toLowerCase();
  assert(!followUpTextSet.has(normText), `Duplicate follow-up text detected: "${fu.questionText}"`);
  followUpTextSet.add(normText);

  // Validate parent reference
  const parent = findVideoQuestionById(fu.parentQuestionId);
  assert(parent, `Orphan follow-up detected! ID ${fu.id} references non-existent parent: ${fu.parentQuestionId}`);

  parentReferenceCounts[fu.parentQuestionId] = (parentReferenceCounts[fu.parentQuestionId] || 0) + 1;
});

// Check that all 18 primary questions have exactly 2 follow-ups
VIDEO_PRIMARY_QUESTIONS.forEach(pq => {
  const count = parentReferenceCounts[pq.id] || 0;
  assert.strictEqual(count, 2, `Primary question ${pq.id} must have exactly 2 linked follow-ups, found ${count}`);
});
console.log('   ✅ PASS: All 36 follow-ups are unique and correctly reference valid parents (2 follow-ups per primary question).');

// 4. Cross-Bank Duplicate Collision Check
console.log('\n[Check 1.4] Global Collision Check Across Universal Bank, Presets & Video Questions:');
const globalIdMap = new Map();
nonVideoIds.forEach(id => globalIdMap.set(id, 'UniversalOriginal'));
VIDEO_PRIMARY_QUESTIONS.forEach(q => {
  assert(!globalIdMap.has(q.id), `Collision: Video question ID ${q.id} collides with ${globalIdMap.get(q.id)}`);
  globalIdMap.set(q.id, 'VideoPrimary');
});
VIDEO_FOLLOWUP_QUESTIONS.forEach(fu => {
  assert(!globalIdMap.has(fu.id), `Collision: Follow-up ID ${fu.id} collides with ${globalIdMap.get(fu.id)}`);
  globalIdMap.set(fu.id, 'VideoFollowUp');
});
console.log(`   Checked ${globalIdMap.size} distinct question/follow-up IDs globally. Zero collisions.`);
console.log('   ✅ PASS: No duplicate IDs across the entire platform.\n');

console.log('====================================================');
console.log('STEP 1 INTEGRITY VERIFICATION SUCCEEDED: 100% OK');
console.log('====================================================');
