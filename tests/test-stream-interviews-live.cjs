// =========================================================================
// Stream-Specific End-to-End Interview Verification Suite
// Tests complete flow:
// Setup -> Blueprint -> Initial Gemini Question -> Candidate Answer ->
// Adaptive Decision -> Gemini Follow-up -> Provenance Verification
// for:
// 1. Intermediate CEC Student
// 2. B.Com Student
// 3. B.Tech Computer Science Student
// 4. Polytechnic Diploma Mechanical Student
// =========================================================================

const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env.local') });

async function runStreamTestSuite() {
  console.log('====================================================');
  console.log('STARTING STREAM-SPECIFIC END-TO-END INTERVIEW TEST SUITE');
  console.log('====================================================\n');

  const { geminiService, getIsGeminiConfigured } = await import('../api/_lib/gemini.js');
  const { checkInterviewEligibility, verifyBackendEligibility } = await import('../api/_lib/eligibility.js');

  const isGeminiReady = getIsGeminiConfigured();
  console.log(`[Config Check] Gemini API Configured: ${isGeminiReady}`);
  assert.strictEqual(isGeminiReady, true, 'Gemini API key must be configured in environment');

  const streamsToTest = [
    {
      name: 'Intermediate CEC Student',
      config: {
        role: 'Commerce Student',
        companyName: 'Board of Intermediate Education',
        isAcademic: true,
        educationLevel: 'Intermediate',
        intermediateGroup: 'CEC',
        academicStream: 'Intermediate CEC',
        degreeCourse: 'CEC',
        subject: 'Commerce & Economics',
        careerGoal: 'Chartered Accountant',
        questionCount: 1,
        difficulty: 'beginner'
      },
      answer: 'In economics, demand and supply determine the equilibrium price in a competitive market. When demand rises while supply is constant, price increases.',
      disallowedKeywords: ['programming', 'javascript', 'react', 'sql', 'dsa', 'algorithm', 'coding', 'class in python', 'object oriented']
    },
    {
      name: 'B.Com Accounting Student',
      config: {
        role: 'Accountant',
        companyName: 'Deloitte',
        isAcademic: false,
        educationLevel: 'UG',
        academicStream: 'B.Com',
        degreeCourse: 'Bachelor of Commerce',
        questionCount: 1,
        difficulty: 'intermediate'
      },
      answer: 'The golden rules of accounting are: Debit what comes in, credit what goes out for real accounts; Debit the receiver, credit the giver for personal accounts; Debit all expenses and losses, credit all incomes and gains for nominal accounts.',
      disallowedKeywords: ['pointer', 'binary tree', 'linked list', 'react component', 'css flexbox', 'docker', 'kubernetes', 'dsa']
    },
    {
      name: 'B.Tech Computer Science Student',
      config: {
        role: 'Software Engineer',
        companyName: 'Google',
        isAcademic: false,
        educationLevel: 'UG',
        academicStream: 'B.Tech Computer Science',
        degreeCourse: 'B.Tech CSE',
        questionCount: 1,
        difficulty: 'intermediate'
      },
      answer: 'In React, the virtual DOM is an in-memory lightweight representation of the actual DOM. When state changes, a diffing algorithm identifies changes and batches minimal DOM updates.',
      disallowedKeywords: []
    },
    {
      name: 'Polytechnic Diploma Student',
      config: {
        role: 'Junior Mechanical Engineer',
        companyName: 'Tata Motors',
        isAcademic: false,
        educationLevel: 'Diploma',
        academicStream: 'Diploma in Mechanical Engineering',
        degreeCourse: 'Diploma Mechanical',
        questionCount: 1,
        difficulty: 'beginner'
      },
      answer: 'A vernier caliper is used to measure internal and external diameters with precision up to 0.02 mm using main scale and vernier scale coincidence.',
      disallowedKeywords: ['redux store', 'useeffect hook', 'binary search tree']
    }
  ];

  for (const stream of streamsToTest) {
    console.log(`\n----------------------------------------------------`);
    console.log(`[TEST STREAM] ${stream.name}`);
    console.log(`----------------------------------------------------`);

    // 1. Eligibility Check
    const eligibility = checkInterviewEligibility(stream.config);
    assert.strictEqual(eligibility.isEligible, true, `${stream.name} must be eligible`);
    const backendCheck = verifyBackendEligibility({}, stream.config);
    assert.strictEqual(backendCheck.allowed, true, `${stream.name} backend eligibility check must pass`);
    console.log(`✅ [Eligibility] ${stream.name} is 100% eligible (HTTP 200)`);

    // 2. Blueprint Generation
    const blueprint = geminiService.generateInterviewBlueprint(stream.config);
    assert.ok(blueprint.competencies.length >= 2, 'Blueprint must generate competencies');
    console.log(`✅ [Blueprint] Generated ${blueprint.competencies.length} competencies. Primary: "${blueprint.competencies[0].name}"`);

    // 3. Initial Gemini Question Generation
    console.log(`[Gemini Call] Requesting initial question for ${stream.name}...`);
    const initialQuestions = await geminiService.generateInterviewQuestions(stream.config, []);
    assert.ok(initialQuestions && initialQuestions.length > 0, 'Must return at least 1 question');
    const q0 = initialQuestions[0];
    assert.strictEqual(q0.source, 'ai', 'Question provenance must be "ai"');
    console.log(`✅ [Initial Question] (source: "${q0.source}") "${q0.questionText}"`);

    // Verify disallowed stream topics
    for (const disallowed of stream.disallowedKeywords) {
      assert.strictEqual(
        q0.questionText.toLowerCase().includes(disallowed),
        false,
        `Question must not contain out-of-domain keyword "${disallowed}"`
      );
    }

    // 4. Simulate Candidate Answer and Adaptive Turn
    console.log(`[Candidate Answer] "${stream.answer}"`);
    const sessionMemory = {
      blueprint,
      previousQuestions: [q0.questionText],
      topicsExplored: [blueprint.competencies[0].name],
      demonstratedCompetencies: [],
      knowledgeGaps: [],
      decisionsHistory: [],
      currentDifficulty: stream.config.difficulty,
      currentCompetency: blueprint.competencies[0].name
    };

    console.log(`[Gemini Call] Requesting adaptive next question...`);
    const adaptiveResult = await geminiService.generateAdaptiveNextQuestion(
      stream.config,
      q0,
      stream.answer,
      sessionMemory
    );

    assert.ok(adaptiveResult, 'Adaptive result must be returned');
    assert.ok(adaptiveResult.nextQuestion, 'Next question must exist');
    assert.strictEqual(adaptiveResult.nextQuestion.source, 'ai', 'Adaptive question source must be "ai"');
    assert.ok(['PROBE', 'CLARIFY', 'CHALLENGE', 'MOVE_FORWARD', 'ENCOURAGE'].includes(adaptiveResult.decision), 'Valid adaptive decision required');

    console.log(`✅ [Adaptive Decision] Decision: ${adaptiveResult.decision} | Difficulty: ${adaptiveResult.adjustedDifficulty}`);
    console.log(`✅ [Adaptive Question] (source: "${adaptiveResult.nextQuestion.source}") "${adaptiveResult.nextQuestion.questionText}"`);

    // 5. Verify Demo Mode condition on Frontend
    const showDemoBanner = adaptiveResult.nextQuestion.source === 'fallback';
    assert.strictEqual(showDemoBanner, false, 'Demo mode banner MUST NOT display for live Gemini questions');
    console.log(`✅ [UI Provenance Check] Demo mode banner active: ${showDemoBanner} (CORRECT: Hidden)`);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL 4 STREAM-SPECIFIC LIVE INTERVIEW FLOWS PASSED (100% VERIFIED)!');
  console.log('====================================================\n');
}

runStreamTestSuite().catch(err => {
  console.error('Stream test suite failed:', err);
  process.exit(1);
});
