const assert = require('assert');
const path = require('path');

const {
  isNonTechnicalCandidate,
  getDomainCompetencies,
  generateInterviewBlueprint,
  generateAdaptiveNextQuestionFallback
} = require('../api/_lib/adaptiveInterviewEngine.js');

const {
  generateIntelligentFollowUpFallback
} = require('../api/_lib/gemini.js');

console.log('================================================================');
console.log('MANDATORY 7-COMBINATION PROFILE TEST SUITE');
console.log('================================================================\n');

const DSA_AND_CODING_PATTERNS = [
  /\b(dsa|data structure|algorithm|binary tree|linked list|hash map|graph|dynamic programming)\b/i,
  /\b(sql|database query|nosql|mongodb|postgresql|redis|orm|join)\b/i,
  /\b(react|virtual dom|component lifecycle|redux|hook|useeffect|props)\b/i,
  /\b(api design|rest api|graphql|microservice|idempotency|circuit breaker)\b/i,
  /\b(time complexity|space complexity|o\(n\)|o\(log n\))\b/i,
  /\b(javascript|python|java|c\+\+|rust|golang|typescript)\b/i,
  /\b(docker|kubernetes|ci\/cd|pipeline|aws|cloud architecture)\b/i
];

function containsTechnicalOrDSA(text) {
  return DSA_AND_CODING_PATTERNS.some(rx => rx.test(text));
}

const MANDATORY_COMBINATIONS = [
  { degree: 'B.Com', role: 'Customer Service Representative', expectedTrack: 'CSR', expectedCompPrefix: 'comp_csr' },
  { degree: 'BBA', role: 'Customer Support', expectedTrack: 'CSR', expectedCompPrefix: 'comp_csr' },
  { degree: 'B.Tech', role: 'Call Center Agent', expectedTrack: 'CSR', expectedCompPrefix: 'comp_csr' },
  { degree: 'Arts', role: 'BPO Executive', expectedTrack: 'CSR', expectedCompPrefix: 'comp_csr' },
  { degree: 'B.Com', role: 'Accountant', expectedTrack: 'Commerce', expectedCompPrefix: 'comp_comm' },
  { degree: 'BBA', role: 'Marketing Executive', expectedTrack: 'Marketing', expectedCompPrefix: 'comp_mgmt' },
  { degree: 'B.Tech CSE', role: 'Software Engineer', expectedTrack: 'Software Engineering', expectedCompPrefix: 'comp_tech' }
];

let combinationPassCount = 0;

MANDATORY_COMBINATIONS.forEach((comb, idx) => {
  console.log(`[Combination ${idx + 1}/7] Degree: "${comb.degree}" | Target Role: "${comb.role}" -> Expected: ${comb.expectedTrack}`);
  
  const isNonTech = isNonTechnicalCandidate(comb.degree, comb.role, '');
  const competencies = getDomainCompetencies(comb.degree, comb.role, 'undergraduate', '');
  
  assert(competencies && competencies.length > 0, `Must return competencies for ${comb.degree} / ${comb.role}`);
  const firstCompId = competencies[0].id;

  assert(
    firstCompId.startsWith(comb.expectedCompPrefix),
    `Mismatch for ${comb.degree} applying for ${comb.role}! Expected prefix ${comb.expectedCompPrefix}, received: ${firstCompId}`
  );

  if (comb.expectedTrack === 'CSR') {
    assert.strictEqual(isNonTech, true, `CSR interview must be classified non-technical`);
    // Verify zero coding / DSA in any CSR question
    competencies.forEach(c => {
      c.fallbackQuestions.forEach(q => {
        assert(!containsTechnicalOrDSA(q), `Leaked technical/DSA into CSR: "${q}"`);
      });
    });
  } else if (comb.expectedTrack === 'Software Engineering') {
    assert.strictEqual(isNonTech, false, `Software Engineering interview must be classified technical`);
  }

  console.log(`   ✅ PASS: Correctly routed to ${comb.expectedTrack} (${firstCompId}).`);
  combinationPassCount++;
});

assert.strictEqual(combinationPassCount, 7, 'All 7 combinations must pass');
console.log(`\n🎉 ALL 7 MANDATORY PROFILE COMBINATIONS PASSED (7 / 7)!\n`);

// ---------------------------------------------------------
// Follow-ups & Repetition Simulation Verification
// ---------------------------------------------------------
console.log('[Check: CSR Follow-ups & Semantic Repetition]');
const askedQuestions = [];
const t1Question = {
  id: 'vid-bykq-01',
  orderIndex: 0,
  questionText: 'Tell me about yourself.',
  category: 'hr'
};
askedQuestions.push(t1Question.questionText);

const bcomCsrConfig = { academicStream: 'B.Com', role: 'Customer Service Representative', difficulty: 'intermediate' };

const t2Turn = generateAdaptiveNextQuestionFallback(bcomCsrConfig, t1Question, 'I studied commerce but want to work in customer service because of communication.', {
  previousQuestions: [...askedQuestions],
  topicsExplored: ['comp_csr_intro']
});

assert(t2Turn.nextQuestion, 'Turn 2 must return next question');
assert(!askedQuestions.includes(t2Turn.nextQuestion.questionText), 'Turn 2 must not repeat Turn 1');
assert(!containsTechnicalOrDSA(t2Turn.nextQuestion.questionText), 'No DSA in CSR follow-up');
askedQuestions.push(t2Turn.nextQuestion.questionText);

console.log(`   Turn 1 Q: "${t1Question.questionText}"`);
console.log(`   Turn 2 Q (Curated Video Follow-up): "${t2Turn.nextQuestion.questionText}"`);

// Curated follow-up check for pizza question
const pizzaFollowUp = generateIntelligentFollowUpFallback(
  { id: 'vid-bykq-14', questionText: 'Why do you think pizzas are round?' },
  'Because of centrifugal force when spinning.'
);
assert(pizzaFollowUp.questionText.includes('square') || pizzaFollowUp.questionText.includes('pizza'), 'Curated follow-up for pizza');
console.log(`   Curated Follow-up for Q14: "${pizzaFollowUp.questionText}"`);

console.log('   ✅ PASS: Curated follow-ups remain fully functional with zero repetition.\n');

console.log('================================================================');
console.log('AUDIT STEP 2 VERIFICATION SUCCEEDED: 100% OK');
console.log('================================================================');
