import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
  dotenv.config({ path: path.resolve(process.cwd(), 'server/.env.local') });
  dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
}

// @ts-ignore
import { geminiService, ROUND_RUBRICS } from '../api/gemini.js';

async function runConsistencyBenchmark() {
  console.log('===============================================================');
  console.log('   INTERVIEWBRO AI - SCORING CONSISTENCY BENCHMARK             ');
  console.log('   Model: Gemini 2.5 Flash | Temperature: 0.2 | Format: JSON   ');
  console.log('===============================================================\n');

  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    console.error('❌ GEMINI_API_KEY environment variable is missing or invalid.');
    process.exit(1);
  }

  const sampleQuestion = {
    id: 'q-node-event-loop',
    orderIndex: 0,
    questionText: 'Can you explain how the event loop in Node.js handles asynchronous I/O operations and how microtasks differ from macrotasks?',
    category: 'technical' as const
  };

  const sampleAnswer = `In Node.js, the event loop executes on a single main thread and is backed by the libuv C library. When non-blocking asynchronous operations like network socket reads or disk I/O are initiated, libuv offloads them to the operating system kernel or its internal worker thread pool. Once completed, the corresponding callbacks are queued in specific phases like the timers or poll phase. Microtasks, which include process.nextTick callbacks and Promise then/catch handlers, have strict priority over macrotasks. The microtask queue is completely drained immediately after the currently executing operation finishes and before the event loop advances to the next phase.`;

  const sampleConfig = {
    role: 'Backend Engineer (Node.js)',
    interviewType: 'technical' as const,
    experienceLevel: 'fresher' as const,
    companyName: 'Razorpay'
  };

  console.log(`Round Type: ${sampleConfig.interviewType.toUpperCase()} (Technical)`);
  console.log(`Candidate Level: ${sampleConfig.experienceLevel.toUpperCase()} (Fresher)`);
  console.log(`Question: "${sampleQuestion.questionText}"`);
  console.log(`Candidate Answer Length: ${sampleAnswer.length} characters\n`);

  const RUN_COUNT = 5;
  const scores: number[] = [];
  const runsData: any[] = [];

  console.log(`Executing ${RUN_COUNT} identical evaluation passes at temperature 0.2...\n`);

  for (let i = 1; i <= RUN_COUNT; i++) {
    const startTime = Date.now();
    const evaluation = await geminiService.evaluateCandidateAnswer(sampleQuestion, sampleAnswer, sampleConfig);
    const elapsed = Date.now() - startTime;

    scores.push(evaluation.score);
    runsData.push(evaluation);

    // Verify technical round rubric breakdown (must have technical pillars, NO STAR pillar)
    const breakdown = evaluation.rubricBreakdown || {};
    const hasCorrectness = Boolean(breakdown.correctness || breakdown.technicalCorrectness);
    const hasDepth = Boolean(breakdown.depthAndEdgeCases);
    const hasTradeoffs = Boolean(breakdown.tradeoffAwareness || breakdown.problemSolvingReasoning);
    const hasCommunication = Boolean(breakdown.communicationClarity);

    console.log(`Run ${i}/${RUN_COUNT} (${elapsed}ms):`);
    console.log(`  Overall Score: ${evaluation.score}%`);
    console.log(`  Pillars: Correctness=${breakdown.correctness?.score ?? breakdown.technicalCorrectness?.score}% | Depth=${breakdown.depthAndEdgeCases?.score}% | Tradeoffs=${breakdown.tradeoffAwareness?.score}% | Clarity=${breakdown.communicationClarity?.score}%`);
    console.log(`  STAR Methodology Included: ${Boolean(breakdown.starStructure)} (Expected: false)`);
    console.log(`  Feedback Snippet: "${evaluation.feedback.slice(0, 100)}..."\n`);

    if (breakdown.starStructure) {
      console.error(`❌ FAILURE: Technical round evaluation mistakenly contained STAR methodology pillar!`);
      process.exit(1);
    }
  }

  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const spread = maxScore - minScore;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  console.log('---------------------------------------------------------------');
  console.log('CONSISTENCY BENCHMARK RESULTS:');
  console.log(`Pass Scores:   [${scores.join(', ')}]`);
  console.log(`Mean Score:    ${mean.toFixed(2)}%`);
  console.log(`Min Score:     ${minScore}%`);
  console.log(`Max Score:     ${maxScore}%`);
  console.log(`Score Spread:  ${spread} points (Max - Min)`);
  console.log(`Std Deviation: ${stdDev.toFixed(2)} points`);
  console.log('---------------------------------------------------------------');

  // Acceptance check: small spread (<= 6 points spread across 5 identical runs)
  if (spread <= 6) {
    console.log(`✅ PASSED: Score spread of ${spread} points is tightly bounded (threshold: <= 6 points).`);
    console.log('✅ PASSED: Technical evaluation rubric used without STAR methodology contamination.');
  } else {
    console.error(`❌ FAILED: Score spread of ${spread} exceeds the acceptable threshold (<= 6 points).`);
    process.exit(1);
  }
}

runConsistencyBenchmark().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
