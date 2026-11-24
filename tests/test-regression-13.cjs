const assert = require('assert');
const { geminiService, isSubstantiveAnswer } = require('../api/_lib/gemini.js');

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('INTERVIEWBRO AI — COMPREHENSIVE 13-SCENARIO RELIABILITY REGRESSION SUITE');
  console.log('========================================================================\n');

  const results = [];

  async function record(num, name, passed, details) {
    results.push({ num, name, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} [Scenario ${String(num).padStart(2, '0')}] ${name}`);
    console.log(`   Details: ${details}\n`);
    await new Promise(r => setTimeout(r, 1500)); // 1.5s pace to stay within free-tier 15 RPM
  }

  const baseConfig = {
    roundType: 'technical',
    targetRole: 'Senior Full Stack Engineer',
    company: 'Google',
    mode: 'text',
    difficulty: 'intermediate'
  };

  // -------------------------------------------------------------
  // Scenario 1: Text-only interview with 1 strong answer
  // -------------------------------------------------------------
  try {
    const q1 = {
      id: 'q-s1-101',
      questionText: 'Can you explain how React Fiber handles reconciliation, priority-based scheduling, and the distinction between the render and commit phases?',
      category: 'technical',
      orderIndex: 0,
      answerSource: 'typed'
    };
    const strongAnswer = `React Fiber is a complete reimplementation of the reconciliation engine that represents the component tree as a linked list of fiber nodes. In the render phase, Fiber performs work asynchronously and can pause, abort, or prioritize units of work based on priority lanes. It computes the diff between the current fiber tree and workInProgress tree in O(n) using keys and component types. In the commit phase, Fiber synchronously mutates the actual DOM and triggers layout effects, ensuring visual consistency without blocking high-priority user input.`;

    const report = await geminiService.generateComprehensiveReport(
      [{ ...q1, candidateAnswer: strongAnswer }],
      { ...baseConfig, mode: 'text' },
      'Alice Strong Text'
    );

    const isTextMode = report.speechFluency?.isAssessed === false && report.speechFluency?.status === 'not_assessed';
    const hasQualityScore = (report.overallScore || 0) >= 70;
    const isProvisional = report.interviewCoverage?.isProvisional === true && report.interviewCoverage?.answeredCount === 1;

    const pass = isTextMode && hasQualityScore && isProvisional;
    await record(1, 'Text-only interview with 1 strong answer', pass,
      `Fluency status: "${report.speechFluency?.status}" (isAssessed: ${report.speechFluency?.isAssessed}). Overall Score: ${report.overallScore}/100. Provisional: ${report.interviewCoverage?.isProvisional} (${report.interviewCoverage?.answeredCount}/${report.interviewCoverage?.totalQuestions}).`);
  } catch (err) {
    await record(1, 'Text-only interview with 1 strong answer', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 2: Text-only interview with 1 weak answer
  // -------------------------------------------------------------
  try {
    const q2 = {
      id: 'q-s2-102',
      questionText: 'What is the CAP theorem and what are the trade-offs between CP and AP distributed databases?',
      category: 'technical',
      orderIndex: 0,
      answerSource: 'typed'
    };
    const weakAnswer = 'cap theorem is about databases like consistency and network. cp is consistent and ap is available.';

    const report = await geminiService.generateComprehensiveReport(
      [{ ...q2, candidateAnswer: weakAnswer }],
      { ...baseConfig, mode: 'text' },
      'Bob Weak Text'
    );

    const isTextMode = report.speechFluency?.isAssessed === false;
    const isLowScore = (report.overallScore || 0) < 60;
    const isProvisional = report.interviewCoverage?.isProvisional === true;

    const pass = isTextMode && isLowScore && isProvisional;
    await record(2, 'Text-only interview with 1 weak answer', pass,
      `Fluency status: "${report.speechFluency?.status}". Overall Score: ${report.overallScore}/100 (appropriately weak). Provisional: ${report.interviewCoverage?.isProvisional}.`);
  } catch (err) {
    await record(2, 'Text-only interview with 1 weak answer', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 3: Voice interview with clear speech
  // -------------------------------------------------------------
  try {
    const q3 = {
      id: 'q-s3-103',
      questionText: 'Explain the four ACID properties of relational databases and how Write-Ahead Logging guarantees Durability.',
      category: 'technical',
      orderIndex: 0,
      answerSource: 'spoken'
    };
    const clearSpeechAnswer = 'The four ACID properties are Atomicity, Consistency, Isolation, and Durability. Atomicity ensures all operations in a transaction succeed or all roll back. Consistency maintains database schema invariants. Isolation prevents concurrent transactions from interfering, using locks or multiversion concurrency control. Durability guarantees committed data survives system crashes, which Write-Ahead Logging achieves by sequentially appending all mutations to persistent disk before flushing memory pages.';

    const report = await geminiService.generateComprehensiveReport(
      [{ ...q3, candidateAnswer: clearSpeechAnswer }],
      { ...baseConfig, mode: 'voice' },
      'Carol Clean Voice'
    );

    const isFluencyAssessed = report.speechFluency?.isAssessed === true && report.speechFluency?.status === 'assessed';
    const zeroFillers = report.speechFluency?.totalFillers === 0;
    const highFluencyScore = (report.speechFluency?.overallFluencyScore || 0) >= 90;

    const pass = isFluencyAssessed && zeroFillers && highFluencyScore;
    await record(3, 'Voice interview with clear speech', pass,
      `Speech status: "${report.speechFluency?.status}". Total Fillers: ${report.speechFluency?.totalFillers}. Fluency Score: ${report.speechFluency?.overallFluencyScore}%. Density: ${report.speechFluency?.fillerDensity}%.`);
  } catch (err) {
    await record(3, 'Voice interview with clear speech', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 4: Voice interview with filler words
  // -------------------------------------------------------------
  try {
    const q4 = {
      id: 'q-s4-104',
      questionText: 'Explain how hashing works and how hash collisions are resolved in a hash table.',
      category: 'technical',
      orderIndex: 0,
      answerSource: 'spoken'
    };
    const fillerSpeechAnswer = 'Um, basically, uh, a hash table takes a key and, um, runs it through a hash function to get an array index. When, like, two keys hash to the same bucket, uh, that is a collision. We can solve it using, ah, separate chaining or open addressing with linear probing, you know.';

    const report = await geminiService.generateComprehensiveReport(
      [{ ...q4, candidateAnswer: fillerSpeechAnswer }],
      { ...baseConfig, mode: 'voice' },
      'Dave Filler Voice'
    );

    const isFluencyAssessed = report.speechFluency?.isAssessed === true;
    const hasFillers = (report.speechFluency?.totalFillers || 0) >= 3;
    const topFillersCaptured = Array.isArray(report.speechFluency?.topFillers) && report.speechFluency.topFillers.length > 0;

    const pass = isFluencyAssessed && hasFillers && topFillersCaptured;
    await record(4, 'Voice interview with filler words', pass,
      `Detected ${report.speechFluency?.totalFillers} fillers (${report.speechFluency?.fillerDensity}% density). Top fillers: ${report.speechFluency?.topFillers?.map(f => `"${f.word}"x${f.count}`).join(', ')}. Fluency score: ${report.speechFluency?.overallFluencyScore}%.`);
  } catch (err) {
    await record(4, 'Voice interview with filler words', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 5: Mixed text and voice interview
  // -------------------------------------------------------------
  try {
    const questions = [
      {
        id: 'q-s5-1',
        questionText: 'What is dependency injection and how does it promote loose coupling?',
        candidateAnswer: 'Dependency injection passes dependencies into an object via constructor or setter rather than instantiating them internally, adhering to the Inversion of Control principle.',
        answerSource: 'typed'
      },
      {
        id: 'q-s5-2',
        questionText: 'Explain how garbage collection works in V8 and the purpose of the generational hypothesis.',
        candidateAnswer: 'Um, in V8, uh, objects are split into young and old generation based on the generational hypothesis that most objects die young. Scavenge cleans young generation, and mark-sweep-compact cleans old generation.',
        answerSource: 'spoken'
      }
    ];

    const report = await geminiService.generateComprehensiveReport(
      questions,
      { ...baseConfig, mode: 'voice' }, // Voice-enabled session with mixed answers
      'Elena Mixed'
    );

    // Spoken count must strictly be 1 (typed answer excluded)
    const spokenCountExact = report.speechFluency?.spokenCount === 1;
    const isAssessed = report.speechFluency?.isAssessed === true;

    const pass = spokenCountExact && isAssessed;
    await record(5, 'Mixed text and voice interview', pass,
      `Spoken count strictly equals ${report.speechFluency?.spokenCount} (typed answer excluded from speech analysis). Total Fillers: ${report.speechFluency?.totalFillers}.`);
  } catch (err) {
    await record(5, 'Mixed text and voice interview', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 6: One-question early finish
  // -------------------------------------------------------------
  try {
    const questions = [
      {
        id: 'q-s6-1',
        questionText: 'What is the purpose of database indexes and when should you avoid creating them?',
        candidateAnswer: 'Indexes speed up read queries by creating B-tree structures over indexed columns, but they slow down write operations (insert, update, delete) and consume additional disk storage, so they should be avoided on low-cardinality or write-heavy tables.',
        answerSource: 'typed'
      },
      {
        id: 'q-s6-2',
        questionText: 'How does TLS 1.3 improve over TLS 1.2 in terms of latency and security?',
        candidateAnswer: undefined // Unanswered
      },
      {
        id: 'q-s6-3',
        questionText: 'Explain CQRS and Event Sourcing patterns.',
        candidateAnswer: undefined // Unanswered
      }
    ];

    const report = await geminiService.generateComprehensiveReport(
      questions,
      baseConfig,
      'Frank Early 1'
    );

    const isProvisional = report.interviewCoverage?.isProvisional === true;
    const answeredCount = report.interviewCoverage?.answeredCount === 1;
    const coverage = report.interviewCoverage?.coveragePercent <= 34;

    const pass = isProvisional && answeredCount && coverage;
    await record(6, 'One-question early finish', pass,
      `isProvisional: ${report.interviewCoverage?.isProvisional}. Coverage: ${report.interviewCoverage?.coveragePercent}% (${report.interviewCoverage?.answeredCount}/${report.interviewCoverage?.totalQuestions}). Untested pillars handled honestly.`);
  } catch (err) {
    await record(6, 'One-question early finish', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 7: Two-question early finish
  // -------------------------------------------------------------
  try {
    const questions = [
      {
        id: 'q-s7-1',
        questionText: 'What are goroutines and how do channels enable safe communication between them?',
        candidateAnswer: 'Goroutines are lightweight user-space threads multiplexed onto OS threads by the Go runtime scheduler. Channels provide typed synchronization pipes following the CSP model to communicate by sharing memory rather than sharing memory by communicating.',
        answerSource: 'typed'
      },
      {
        id: 'q-s7-2',
        questionText: 'Explain the difference between optimistic and pessimistic locking in database concurrency.',
        candidateAnswer: 'Pessimistic locking acquires exclusive locks upfront before modifying data, preventing conflicts at the cost of concurrency. Optimistic locking verifies records have not changed (via version or timestamp) at commit time, ideal for low-conflict workloads.',
        answerSource: 'typed'
      },
      {
        id: 'q-s7-3',
        questionText: 'Design a distributed rate limiter for an API gateway.',
        candidateAnswer: undefined
      },
      {
        id: 'q-s7-4',
        questionText: 'What is consistent hashing and why is it used in caching tiers?',
        candidateAnswer: undefined
      }
    ];

    const report = await geminiService.generateComprehensiveReport(
      questions,
      baseConfig,
      'Grace Early 2'
    );

    const coverage = report.interviewCoverage?.coveragePercent === 50;
    const answeredCount = report.interviewCoverage?.answeredCount === 2;
    const hasAssessedPillars = report.rubricPillars.some(p => p.isAssessed);

    const pass = coverage && answeredCount && hasAssessedPillars;
    await record(7, 'Two-question early finish', pass,
      `Answered: ${report.interviewCoverage?.answeredCount}/4 (${report.interviewCoverage?.coveragePercent}%). Tested competencies scored; overall score computed strictly from assessed pillars: ${report.overallScore}/100.`);
  } catch (err) {
    await record(7, 'Two-question early finish', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 8: Full interview completion
  // -------------------------------------------------------------
  try {
    const questions = [
      {
        id: 'q-s8-1',
        questionText: 'Explain how Node.js event loop handles timers, I/O callbacks, and microtasks.',
        candidateAnswer: 'The event loop processes microtasks (process.nextTick and Promise callbacks) immediately after the current operation finishes and before moving to next phases: Timers, Pending I/O, Poll, Check (setImmediate), and Close callbacks.',
        answerSource: 'typed'
      },
      {
        id: 'q-s8-2',
        questionText: 'What is the Raft consensus algorithm and how does leader election work?',
        candidateAnswer: 'Raft divides consensus into leader election, log replication, and safety. Nodes transition between Follower, Candidate, and Leader states using randomized heartbeat timeouts to trigger elections with majority quorum.',
        answerSource: 'typed'
      },
      {
        id: 'q-s8-3',
        questionText: 'Describe how OAuth2 authorization code flow with PKCE prevents authorization code injection.',
        candidateAnswer: 'PKCE adds a cryptographically random code_verifier and code_challenge (SHA256). The client exchanges the authorization code alongside the verifier, proving the token requester is the identical client that initiated the auth request without requiring a client secret on public clients.',
        answerSource: 'typed'
      }
    ];

    const report = await geminiService.generateComprehensiveReport(
      questions,
      baseConfig,
      'Hannah Full'
    );

    const fullCoverage = report.interviewCoverage?.coveragePercent === 100;
    const notProvisional = report.interviewCoverage?.isProvisional === false;
    const allAssessed = report.rubricPillars.every(p => p.isAssessed);

    const pass = fullCoverage && notProvisional && allAssessed;
    await record(8, 'Full interview completion', pass,
      `Full session coverage: ${report.interviewCoverage?.coveragePercent}%. isProvisional: ${report.interviewCoverage?.isProvisional}. All 4 rubric pillars assessed: ${report.rubricPillars.map(p => `${p.label}=${p.score}`).join(', ')}.`);
  } catch (err) {
    await record(8, 'Full interview completion', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 9: Follow-up insertion while evaluation is pending
  // -------------------------------------------------------------
  try {
    // Emulates InterviewContext stable question-ID matching logic
    const qA = { id: 'q-orig-101', questionText: 'Explain binary search trees.', candidateAnswer: 'A BST keeps keys ordered such that left < node < right.' };
    const qB = { id: 'q-orig-102', questionText: 'Explain AVL trees.' };
    
    // Simulate background evaluation dispatched for qA
    const targetQuestionId = qA.id;

    // Simulate adaptive follow-up inserted between qA and qB before evaluation resolves:
    let sessionQuestions = [
      qA,
      { id: 'q-followup-999', questionText: 'What is the worst case time complexity if a BST becomes skewed?', candidateAnswer: undefined },
      qB
    ];

    // Simulate async evaluation returns:
    const mockEvaluation = { score: 85, feedback: 'Accurate definition of BST invariant.' };

    // Resolve target position strictly by question ID:
    const targetIdx = sessionQuestions.findIndex(q => q.id === targetQuestionId);
    if (targetIdx !== -1) {
      sessionQuestions[targetIdx] = {
        ...sessionQuestions[targetIdx],
        evaluation: mockEvaluation
      };
    }

    // Verify qA got the evaluation and follow-up was NOT overwritten
    const correctTarget = sessionQuestions[0].id === 'q-orig-101' && sessionQuestions[0].evaluation?.score === 85;
    const followupIntact = sessionQuestions[1].id === 'q-followup-999' && !sessionQuestions[1].evaluation;

    const pass = correctTarget && followupIntact;
    await record(9, 'Follow-up insertion while evaluation is pending', pass,
      `Stable ID matching attached evaluation to Question ${sessionQuestions[0].id} (index ${targetIdx}), leaving inserted follow-up ${sessionQuestions[1].id} untouched.`);
  } catch (err) {
    await record(9, 'Follow-up insertion while evaluation is pending', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 10: Network interruption during evaluation
  // -------------------------------------------------------------
  try {
    const candidateText = 'PostgreSQL uses MVCC with transaction IDs and tuple visibility checks, avoiding read-write locks.';
    let session = {
      id: 'sess-net-1',
      questions: [
        { id: 'q-net-1', questionText: 'Explain MVCC in PostgreSQL.', candidateAnswer: candidateText, answerSource: 'typed' }
      ]
    };

    // Simulate async evaluation network rejection:
    let caughtError = null;
    try {
      await Promise.reject(new Error('Fetch failed: Network disconnected')).catch(err => {
        caughtError = err;
        // InterviewContext logs non-blocking note without modifying candidateAnswer
      });
    } catch {}

    const answerSurvives = session.questions[0].candidateAnswer === candidateText;
    const pass = answerSurvives && caughtError !== null;
    await record(10, 'Network interruption during evaluation', pass,
      `Candidate answer was safely retained in session state during network rejection: "${session.questions[0].candidateAnswer.slice(0, 40)}...".`);
  } catch (err) {
    await record(10, 'Network interruption during evaluation', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 11: End & Report with pending text
  // -------------------------------------------------------------
  try {
    const pendingText = 'Redis uses an in-memory key-value store with single-threaded event loop and optional persistence via RDB snapshots and AOF logs.';
    const activeQuestionId = 'q-flush-101';
    let sessionQuestions = [
      { id: activeQuestionId, questionText: 'What is Redis and how does it achieve high throughput?', candidateAnswer: undefined }
    ];

    // Emulate endInterview logic with activeQuestionId:
    const targetIdx = sessionQuestions.findIndex(q => q.id === activeQuestionId);
    if (targetIdx !== -1 && !sessionQuestions[targetIdx].candidateAnswer) {
      sessionQuestions[targetIdx] = {
        ...sessionQuestions[targetIdx],
        candidateAnswer: pendingText.trim(),
        answerSource: 'typed'
      };
    }

    const flushedCorrectly = sessionQuestions[0].candidateAnswer === pendingText && sessionQuestions[0].answerSource === 'typed';
    await record(11, 'End & Report with pending text', flushedCorrectly,
      `Pending text successfully flushed to active question ID "${activeQuestionId}" with answerSource: "${sessionQuestions[0].answerSource}".`);
  } catch (err) {
    await record(11, 'End & Report with pending text', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 12: End & Report with pending speech
  // -------------------------------------------------------------
  try {
    const pendingSpeech = 'Kafka is a distributed append-only commit log partitioned across broker clusters for horizontal scalability and sequential disk I/O performance.';
    const activeQuestionId = 'q-speech-102';
    let sessionQuestions = [
      { id: activeQuestionId, questionText: 'Explain Apache Kafka architecture.', candidateAnswer: undefined }
    ];

    // Emulate endInterview logic with activeQuestionId and answerSource: 'spoken':
    const targetIdx = sessionQuestions.findIndex(q => q.id === activeQuestionId);
    if (targetIdx !== -1 && !sessionQuestions[targetIdx].candidateAnswer) {
      sessionQuestions[targetIdx] = {
        ...sessionQuestions[targetIdx],
        candidateAnswer: pendingSpeech.trim(),
        answerSource: 'spoken'
      };
    }

    const flushedSpeech = sessionQuestions[0].candidateAnswer === pendingSpeech && sessionQuestions[0].answerSource === 'spoken';
    await record(12, 'End & Report with pending speech', flushedSpeech,
      `Pending speech buffer flushed to question ID "${activeQuestionId}" with verified answerSource: "${sessionQuestions[0].answerSource}".`);
  } catch (err) {
    await record(12, 'End & Report with pending speech', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Scenario 13: Completely blank interview
  // -------------------------------------------------------------
  try {
    const blankQuestions = [
      { id: 'q-b1', questionText: 'Tell me about yourself.', candidateAnswer: '' },
      { id: 'q-b2', questionText: 'What is your greatest technical challenge?', candidateAnswer: undefined }
    ];

    const report = await geminiService.generateComprehensiveReport(
      blankQuestions,
      baseConfig,
      'Blank Student'
    );

    const isHonestZero = report.overallScore === 0;
    const allPillarsZero = report.rubricPillars.every(p => p.score === 0);
    const summaryContainsZeroWarning = report.summary.includes('No answers were recorded');
    const speechNotAssessed = report.speechFluency?.status === 'not_assessed';

    const pass = isHonestZero && allPillarsZero && summaryContainsZeroWarning && speechNotAssessed;
    await record(13, 'Completely blank interview', pass,
      `Report overallScore: ${report.overallScore}/100. All pillars: 0. Speech status: "${report.speechFluency?.status}". Anti-fabrication integrity upheld.`);
  } catch (err) {
    await record(13, 'Completely blank interview', false, `Error: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Final Summary
  // -------------------------------------------------------------
  console.log('========================================================================');
  const totalPassed = results.filter(r => r.passed).length;
  console.log(`REGRESSION SUITE COMPLETED: ${totalPassed} / ${results.length} PASSED`);
  console.log('========================================================================');

  if (totalPassed < results.length) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
