const assert = require('assert');
const { geminiService, isSubstantiveAnswer } = require('../api/_lib/gemini.js');

async function runTest() {
  console.log('====================================================');
  console.log('TESTING ANSWER CAPTURE, SUBMISSION AND REPORT SCORE');
  console.log('====================================================');

  // Test 1: Substantive Answer Validation
  console.log('\n[Test 1] Substantive Answer Detection');
  assert.strictEqual(isSubstantiveAnswer(''), false, 'Empty answer must not be substantive');
  assert.strictEqual(isSubstantiveAnswer('   '), false, 'Whitespace must not be substantive');
  assert.strictEqual(isSubstantiveAnswer('idk'), false, '"idk" must not be substantive');
  assert.strictEqual(isSubstantiveAnswer('no answer provided'), false, '"no answer provided" must not be substantive');
  assert.strictEqual(isSubstantiveAnswer('I built a React and Node.js e-commerce app with PostgreSQL.'), true, 'Real answer must be substantive');
  console.log('✅ PASS: isSubstantiveAnswer correctly discriminates valid answers');

  // Test 2: Blank Session -> 0/100 (Anti-Fabrication Policy)
  console.log('\n[Test 2] Blank Session Anti-Fabrication Test');
  const blankQuestions = [
    { questionText: 'Tell me about yourself', candidateAnswer: '' },
    { questionText: 'Explain React hooks', candidateAnswer: undefined }
  ];
  const blankReport = await geminiService.generateComprehensiveReport(blankQuestions, { roundType: 'technical' });
  assert.strictEqual(blankReport.overallScore, 0, 'Blank session must yield overallScore = 0');
  assert.ok(blankReport.summary.includes('No answers were recorded'), 'Summary must explain no answers recorded');
  console.log('✅ PASS: Blank session properly generates overallScore = 0 to prevent fake scores');

  // Test 3: Session With Answer Finished Early (1 of 5 answered)
  console.log('\n[Test 3] Finished Early Session Report Generation');
  const singleAnswerQuestions = [
    {
      questionText: 'What is the Virtual DOM and how does reconciliation work in React?',
      candidateAnswer: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM in memory. When state or props change, React runs a diffing algorithm called reconciliation to determine what changed and makes batched, minimal updates to the real DOM for optimal performance.',
      category: 'Technical'
    },
    {
      questionText: 'Can you explain the difference between useMemo and useCallback?',
      candidateAnswer: undefined,
      category: 'Technical'
    },
    {
      questionText: 'How do you manage global state in a modern React application?',
      candidateAnswer: undefined,
      category: 'Technical'
    }
  ];

  const report = await geminiService.generateComprehensiveReport(
    singleAnswerQuestions,
    { roundType: 'technical', targetRole: 'Frontend Developer', company: 'Google' },
    'Akhil'
  );

  console.log(`Report overallScore: ${report.overallScore}`);
  console.log(`Report summary: ${report.summary}`);
  assert.ok(report.overallScore > 0, `Overall score must be > 0 (got ${report.overallScore})`);
  assert.strictEqual(typeof report.overallScore, 'number', 'Overall score must be numeric');
  assert.ok(report.rubricPillars && report.rubricPillars.length === 4, 'Report must have 4 rubric pillars');
  for (const pillar of report.rubricPillars) {
    assert.ok(pillar.score > 0, `Pillar ${pillar.label} score must be > 0 (got ${pillar.score})`);
  }
  console.log('✅ PASS: Single answered question evaluated fairly without artificial 0/100 or completion ratio deflation');

  console.log('\n====================================================');
  console.log('🎉 ALL ANSWER CAPTURE AND REPORT SCORING TESTS PASSED (100% VERIFIED)!');
  console.log('====================================================');
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
