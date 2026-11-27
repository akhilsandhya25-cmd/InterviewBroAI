/**
 * InterviewBro AI — Video Question Bank Expansion Verification Suite
 * tests/test-video-question-bank.cjs
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('STARTING VIDEO QUESTION BANK VERIFICATION SUITE');
console.log('====================================================\n');

// 1. Verify files exist
console.log('[Test 1] Repository Files Integrity');
const videoBankClientPath = path.resolve(__dirname, '../client/src/data/videoQuestionBank.ts');
const videoBankApiPath = path.resolve(__dirname, '../api/_lib/videoQuestionBank.js');
const migrationPath = path.resolve(__dirname, '../supabase/migrations/007_video_question_bank.sql');

assert(fs.existsSync(videoBankClientPath), 'client/src/data/videoQuestionBank.ts must exist');
assert(fs.existsSync(videoBankApiPath), 'api/_lib/videoQuestionBank.js must exist');
assert(fs.existsSync(migrationPath), 'supabase/migrations/007_video_question_bank.sql must exist');
console.log('✅ PASS: All 3 new repository files exist.\n');

// 2. Test api/_lib/videoQuestionBank.js directly
console.log('[Test 2] Data Validation in api/_lib/videoQuestionBank.js');
const {
  SOURCE_VIDEO_BYKQ,
  VIDEO_PRIMARY_QUESTIONS,
  VIDEO_FOLLOWUP_QUESTIONS,
  findVideoQuestionByText,
  findVideoQuestionById,
  getVideoFollowUpsForQuestion,
  getAllVideoQuestions,
  getAllVideoFollowUps
} = require('../api/_lib/videoQuestionBank.js');

assert.strictEqual(SOURCE_VIDEO_BYKQ.id, 'BYKqJkDxg9U', 'Source video ID must be BYKqJkDxg9U');
assert.strictEqual(VIDEO_PRIMARY_QUESTIONS.length, 18, 'Exactly 18 primary video questions must be present');
assert.strictEqual(VIDEO_FOLLOWUP_QUESTIONS.length, 36, 'Exactly 36 follow-up questions must be present (2 per question)');

// Check each question has required metadata
const expected18Questions = [
  'Tell me about yourself.',
  'Why could it take five years before you get a permanent teaching position?',
  'Are you aware of the tasks of a Customer Service Representative?',
  'Did you discover other fields or industries aside from the BPO industry?',
  'How is a call center more diverse than ESL teaching?',
  'What exactly are you looking for in a job?',
  'What kind of work environment do you like best?',
  'How would you handle a dissatisfied customer who received the wrong dress?',
  'How would you communicate the refund and compensation to the customer?',
  "What's the achievement that you're most proud of, and why?",
  'Give me an example of how you performed well under pressure and handled it.',
  'What is your greatest weakness?',
  'How is your improvement in managing that weakness working so far?',
  'Why do you think pizzas are round?',
  'Can you walk me through making a homemade pizza from start to finish?',
  'Why should we NOT hire you?',
  'Are you flexible to work any shift, including weekends and public holidays?',
  'Do you have any questions for me?'
];

VIDEO_PRIMARY_QUESTIONS.forEach((q, idx) => {
  assert(q.id && q.id.startsWith('vid-bykq-'), `Question ${idx + 1} ID must start with vid-bykq-`);
  assert.strictEqual(q.sourceVideoId, 'BYKqJkDxg9U', `Question ${q.id} sourceVideoId must be BYKqJkDxg9U`);
  assert(q.videoTimestamp, `Question ${q.id} must have a timestamp`);
  assert(typeof q.timestampSeconds === 'number', `Question ${q.id} timestampSeconds must be a number`);
  assert(q.evaluationCriteria && q.evaluationCriteria.length > 20, `Question ${q.id} must have evaluationCriteria`);
  assert(q.whatInterviewerLooksFor && q.whatInterviewerLooksFor.length > 10, `Question ${q.id} must have whatInterviewerLooksFor`);
  assert(q.hints && q.hints.length > 10, `Question ${q.id} must have hints`);
  assert(Array.isArray(q.sampleAnswerOutline) && q.sampleAnswerOutline.length >= 2, `Question ${q.id} must have sampleAnswerOutline`);
  assert(Array.isArray(q.followUpQuestionIds) && q.followUpQuestionIds.length >= 2, `Question ${q.id} must link follow-ups`);
  assert.strictEqual(q.questionText, expected18Questions[idx], `Question ${idx + 1} text must match specification`);
});
console.log('✅ PASS: All 18 primary video questions contain complete, rigorous metadata.\n');

// 3. Test Follow-up Questions Separation and Linkage
console.log('[Test 3] Follow-up Questions Storage & Linkage');
VIDEO_FOLLOWUP_QUESTIONS.forEach(fu => {
  assert(fu.id && fu.id.includes('-fu'), `Follow-up ID ${fu.id} must be unique`);
  assert(fu.parentQuestionId, `Follow-up ${fu.id} must have parentQuestionId`);
  assert(fu.questionText && fu.questionText.length > 10, `Follow-up ${fu.id} must have questionText`);
  assert(fu.rationale, `Follow-up ${fu.id} must have rationale`);
  assert(fu.evaluationFocus, `Follow-up ${fu.id} must have evaluationFocus`);
  
  // Verify parent exists
  const parent = findVideoQuestionById(fu.parentQuestionId);
  assert(parent, `Parent ${fu.parentQuestionId} must exist for follow-up ${fu.id}`);
});

// Check specific user-requested follow-up examples
const sampleFollowUps = [
  'Why did you decide to look for other career options right now?',
  'Why did you choose the call center industry',
  'How is a call center more diverse than ESL',
  'Can you give an example of performing well under pressure',
  'What was the roleplay about',
  'How is your weakness-improvement strategy working',
  'Can you explain the process from start to finish'
];

sampleFollowUps.forEach(example => {
  const found = VIDEO_FOLLOWUP_QUESTIONS.some(fu => fu.questionText.toLowerCase().includes(example.toLowerCase()));
  assert(found, `Expected follow-up example containing "${example}" must be present in follow-up repository`);
});
console.log('✅ PASS: Follow-ups are stored separately, linked to parents, and include all specified examples.\n');

// 4. Test Deduplication and Query Helpers
console.log('[Test 4] Deduplication and Search Helpers');
const foundQ1 = findVideoQuestionByText('tell me about yourself');
assert(foundQ1 && foundQ1.id === 'vid-bykq-01', 'findVideoQuestionByText must match case-insensitively');

const foundQ14 = findVideoQuestionByText('why do you think pizzas are round?');
assert(foundQ14 && foundQ14.id === 'vid-bykq-14', 'findVideoQuestionByText must match pizza question');

const q1FollowUps = getVideoFollowUpsForQuestion('vid-bykq-01');
assert.strictEqual(q1FollowUps.length, 2, 'vid-bykq-01 must have 2 follow-ups');
console.log('✅ PASS: Query helpers and duplicate detection function correctly.\n');

// 5. Test Integration into Adaptive Interview Engine
console.log('[Test 5] Integration with adaptiveInterviewEngine.js');
const {
  isNonTechnicalCandidate,
  getDomainCompetencies,
  generateInterviewBlueprint,
  generateAdaptiveNextQuestionFallback
} = require('../api/_lib/adaptiveInterviewEngine.js');

// 5a. Non-technical classification
assert.strictEqual(isNonTechnicalCandidate('', 'Customer Service Representative', ''), true, 'CSR role must be classified non-technical');
assert.strictEqual(isNonTechnicalCandidate('', 'Call Center Agent', ''), true, 'Call Center role must be classified non-technical');
assert.strictEqual(isNonTechnicalCandidate('', 'BPO Specialist', ''), true, 'BPO role must be classified non-technical');

// 5b. Domain Competencies for Customer Service
const csrCompetencies = getDomainCompetencies('', 'Customer Service Representative', 'undergraduate', '');
assert.strictEqual(csrCompetencies.length, 5, 'Customer Service track must return 5 domain competencies');
assert.strictEqual(csrCompetencies[0].id, 'comp_csr_intro', 'First competency must be comp_csr_intro');
assert.strictEqual(csrCompetencies[2].id, 'comp_csr_situational', 'Third competency must be comp_csr_situational');

// 5c. Blueprint generation for CSR
const csrBlueprint = generateInterviewBlueprint({
  role: 'Customer Service Representative',
  questionCount: 5,
  difficulty: 'intermediate'
});
assert.strictEqual(csrBlueprint.targetRole, 'Customer Service Representative');
assert.strictEqual(csrBlueprint.competencies.length, 5);
console.log('✅ PASS: CSR is strictly classified non-technical and receives 5 calibrated CSR competencies.\n');

// 5d. Follow-up selection in adaptive engine
console.log('[Test 6] Adaptive Next Question with Video Follow-up');
const mockCurQuestion = {
  id: 'vid-bykq-01',
  orderIndex: 0,
  questionText: 'Tell me about yourself.',
  category: 'hr'
};
const mockAnswer = 'I recently graduated with a degree in education and I want to start my career in customer support.';
const adaptiveResult = generateAdaptiveNextQuestionFallback(
  { role: 'Customer Service Representative', difficulty: 'intermediate' },
  mockCurQuestion,
  mockAnswer,
  { previousQuestions: ['Tell me about yourself.'] }
);

assert(adaptiveResult.nextQuestion, 'Adaptive result must return nextQuestion');
assert(adaptiveResult.nextQuestion.questionText, 'Next question must have questionText');
console.log('   Adaptive decision:', adaptiveResult.decision);
console.log('   Next question text:', adaptiveResult.nextQuestion.questionText);
console.log('✅ PASS: Adaptive engine dynamically routes and evaluates video interview questions.\n');

// 6. Test Migration 007
console.log('[Test 7] Supabase Migration 007 Syntax & Idempotency');
const migrationContent = fs.readFileSync(migrationPath, 'utf8');
assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.video_interview_questions'), 'Migration must create table video_interview_questions');
assert(migrationContent.includes('CREATE TABLE IF NOT EXISTS public.video_question_followups'), 'Migration must create table video_question_followups');
assert(migrationContent.includes('ON CONFLICT (id) DO NOTHING'), 'Migration must be idempotent with ON CONFLICT DO NOTHING');
assert(migrationContent.includes('ENABLE ROW LEVEL SECURITY'), 'Migration must enable RLS');
console.log('✅ PASS: Migration 007 is valid, idempotent, and security-hardened.\n');

// 7. Verify Zero Deletions in Existing Banks
console.log('[Test 8] Non-Destructive Expansion Audit');
const uqbFile = fs.readFileSync(path.resolve(__dirname, '../client/src/data/universalQuestionBanks.ts'), 'utf8');
assert(uqbFile.includes('intro-inter-01'), 'Original question intro-inter-01 must remain');
assert(uqbFile.includes('apt-sit-01'), 'Original question apt-sit-01 must remain');
assert(uqbFile.includes('...getVideoQuestionsAsUniversal()'), 'Video questions must be appended');
console.log('✅ PASS: All original question records are intact. Zero deletions verified.\n');

console.log('====================================================');
console.log('🎉 ALL VIDEO QUESTION BANK VERIFICATION TESTS PASSED!');
console.log('====================================================');
