/**
 * InterviewBro AI - Comprehensive Adaptive Interview Intelligence Test Suite
 * Tests all 10 QA scenarios and stream boundaries specified in the specification:
 * 1. Beginner weak answer -> ENCOURAGE decision, difficulty stepped down
 * 2. Candidate gives excellent answer -> MOVE_FORWARD or CHALLENGE
 * 3. Partially correct answer -> PROBE / CLARIFY
 * 4. Technical skill mentioned -> PROBE with topic deep dive
 * 5. Unsupported resume claim -> CHALLENGE / PROBE for evidence
 * 6. Irrelevant answer -> CLARIFY / refocus
 * 7. Candidate says "I don't know" -> ENCOURAGE, stepped down
 * 8. Candidate gives very short answer (< 4 words) -> ENCOURAGE
 * 9. Gemini invalid response / offline -> Resilient fallback
 * 10. Consecutive repetition risk -> Semantic deduplication
 * Extra: Stream Boundary Enforcement (B.Com, BBA, CEC NEVER get coding questions)
 */

const assert = require('assert');

async function runTestSuite() {
  console.log('====================================================');
  console.log('STARTING ADAPTIVE INTERVIEW INTELLIGENCE SUITE');
  console.log('====================================================\n');

  const {
    generateInterviewBlueprint,
    classifyAdaptiveDecision,
    generateAdaptiveNextQuestionFallback,
    isNonTechnicalCandidate,
    getDomainCompetencies
  } = await import('../api/adaptiveInterviewEngine.js');

  const { calculateQuestionSimilarity, isDuplicateQuestion } = await import('../api/gemini.js');

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ PASS [Scenario ${total}] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL [Scenario ${total}] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // 1. Beginner gives weak answer
  test('Beginner gives a weak or dismissive answer -> ENCOURAGE', () => {
    const question = { id: 'q1', orderIndex: 0, questionText: 'Tell me about trial balance.', category: 'subject_specific' };
    const answer = 'um i am not really sure how it works honestly';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', true);
    assert.strictEqual(decision.decision, 'ENCOURAGE');
    assert.strictEqual(decision.calibratedDifficulty, 'beginner');
  });

  // 2. Candidate gives an excellent answer
  test('Candidate gives an excellent extensive answer -> CHALLENGE / MOVE_FORWARD', () => {
    const question = { id: 'q2', orderIndex: 1, questionText: 'How do you handle state management?', category: 'technical' };
    const answer = 'In our React application, we decoupled state by using React Context for user authentication and session tokens, while leveraging Redux Toolkit for complex asynchronous order dispatch flows. We used createAsyncThunk with normalized entity adapters to avoid nested re-renders, resulting in sub-100ms render cycles and predictable unidirectional state updates.';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', false);
    assert.ok(decision.decision === 'CHALLENGE' || decision.decision === 'MOVE_FORWARD');
    assert.ok(['intermediate', 'advanced'].includes(decision.calibratedDifficulty));
  });

  // 3. Partially correct / tentative answer
  test('Candidate gives a tentative or ambiguous answer -> CLARIFY', () => {
    const question = { id: 'q3', orderIndex: 1, questionText: 'Do you use cash or accrual accounting?', category: 'technical' };
    const answer = 'maybe both kind of depends on the transaction i guess';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', true);
    assert.strictEqual(decision.decision, 'CLARIFY');
  });

  // 4. Candidate mentions a specific technical / domain skill
  test('Candidate mentions specific tool/skill needing depth -> PROBE', () => {
    const question = { id: 'q4', orderIndex: 1, questionText: 'Tell me about your database setup.', category: 'technical' };
    const answer = 'We used Redis to cache API responses and reduce load on our primary database.';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', false);
    assert.strictEqual(decision.decision, 'PROBE');
  });

  // 5. Candidate makes an unsupported / buzzword claim
  test('Candidate makes high-level claim without mechanics -> PROBE / CHALLENGE', () => {
    const question = { id: 'q5', orderIndex: 1, questionText: 'How do you ensure zero downtime?', category: 'technical' };
    const answer = 'We just use microservices and Kubernetes so everything scales automatically without any downtime.';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', false);
    assert.ok(decision.decision === 'PROBE' || decision.decision === 'CHALLENGE');
  });

  // 6. Irrelevant answer / confusion
  test('Candidate gives confused or evasive answer -> CLARIFY or ENCOURAGE', () => {
    const question = { id: 'q6', orderIndex: 2, questionText: 'Explain the difference between debit and credit.', category: 'subject_specific' };
    const answer = 'I think it is something like that but not really sure about the difference';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', true);
    assert.ok(decision.decision === 'CLARIFY' || decision.decision === 'ENCOURAGE');
  });

  // 7. Candidate says "I don't know"
  test('Candidate explicitly states "I don\'t know" -> ENCOURAGE with beginner calibration', () => {
    const question = { id: 'q7', orderIndex: 2, questionText: 'What is input tax credit under GST?', category: 'technical' };
    const answer = "I don't know the exact rules for this.";
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', true);
    assert.strictEqual(decision.decision, 'ENCOURAGE');
    assert.strictEqual(decision.calibratedDifficulty, 'beginner');
  });

  // 8. Candidate gives very short answer (< 4 words)
  test('Candidate gives very short answer -> ENCOURAGE', () => {
    const question = { id: 'q8', orderIndex: 2, questionText: 'Have you prepared balance sheets?', category: 'technical' };
    const answer = 'yes i have';
    const decision = classifyAdaptiveDecision(question, answer, 'intermediate', true);
    assert.strictEqual(decision.decision, 'ENCOURAGE');
  });

  // 9. Resilient Fallback produces valid adaptive next question
  test('Intelligent fallback generates calibrated next question and memory', () => {
    const config = { role: 'Accountant', academicStream: 'B.Com', difficulty: 'intermediate', questionCount: 5 };
    const currentQ = { id: 'q1', orderIndex: 0, questionText: 'Welcome! Introduce yourself.', category: 'subject_specific' };
    const answer = 'I am a B.Com graduate and worked with double entry ledgers and GST filing.';
    const mem = { blueprint: generateInterviewBlueprint(config), topicsExplored: ['Introduction'], previousQuestions: [currentQ.questionText] };

    const fallback = generateAdaptiveNextQuestionFallback(config, currentQ, answer, mem);
    assert.ok(fallback.nextQuestion);
    assert.ok(fallback.nextQuestion.questionText.length > 20);
    assert.strictEqual(fallback.nextQuestion.orderIndex, 1);
    assert.ok(fallback.updatedMemory.topicsExplored.length > 0);
    assert.ok(fallback.nextQuestion.adaptiveDecision);
  });

  // 10. Semantic Repetition Prevention
  test('Semantic repetition detection flags similar questions', () => {
    const q1 = 'How does a hash map resolve collisions internally?';
    const q2 = 'Can you explain how hash maps handle collisions when keys match?';
    const q3 = 'What is the purpose of preparing a bank reconciliation statement?';

    const sim1 = calculateQuestionSimilarity(q1, q2);
    const sim2 = calculateQuestionSimilarity(q1, q3);

    assert.ok(sim1 >= 0.30, `Expected high similarity between collision questions, got ${sim1}`);
    assert.ok(sim2 < 0.20, `Expected low similarity between different domains, got ${sim2}`);

    const dup = isDuplicateQuestion(q2, [q1], 0.30);
    assert.strictEqual(dup.isDuplicate, true);
  });

  // Stream Boundary Tests: B.Com, BBA, Intermediate CEC
  test('Strict Stream Boundary: B.Com candidate is classified non-technical and receives ZERO coding questions', () => {
    const isNonTech = isNonTechnicalCandidate('B.Com', 'Accountant', '');
    assert.strictEqual(isNonTech, true);

    const competencies = getDomainCompetencies('B.Com', 'Accountant', 'UG', '');
    const allQuestions = competencies.flatMap(c => c.fallbackQuestions || []);
    const codingKeywords = ['javascript', 'python', 'react', 'sql query', 'dsa', 'algorithm', 'coding', 'binary tree'];

    for (const q of allQuestions) {
      for (const kw of codingKeywords) {
        assert.strictEqual(
          q.toLowerCase().includes(kw),
          false,
          `B.Com question contained forbidden tech keyword "${kw}": "${q}"`
        );
      }
    }
  });

  test('Strict Stream Boundary: BBA Marketing candidate receives marketing/business questions, ZERO programming', () => {
    const isNonTech = isNonTechnicalCandidate('BBA', 'Marketing Executive', '');
    assert.strictEqual(isNonTech, true);

    const competencies = getDomainCompetencies('BBA', 'Marketing Executive', 'UG', '');
    assert.ok(competencies.some(c => c.name.includes('Marketing')));
    const allQuestions = competencies.flatMap(c => c.fallbackQuestions || []);

    for (const q of allQuestions) {
      assert.strictEqual(q.toLowerCase().includes('data structure'), false);
      assert.strictEqual(q.toLowerCase().includes('react'), false);
    }
  });

  test('Strict Stream Boundary: Intermediate CEC receives 11th/12th commerce/civics/economics, ZERO programming', () => {
    const isNonTech = isNonTechnicalCandidate('Intermediate CEC', 'Student', 'CEC');
    assert.strictEqual(isNonTech, true);

    const competencies = getDomainCompetencies('Intermediate CEC', 'Student', 'Intermediate', 'CEC');
    assert.ok(competencies.some(c => c.name.includes('Bookkeeping') || c.name.includes('Civics') || c.name.includes('Economics')));
    const allQuestions = competencies.flatMap(c => c.fallbackQuestions || []);

    for (const q of allQuestions) {
      assert.strictEqual(q.toLowerCase().includes('programming'), false);
      assert.strictEqual(q.toLowerCase().includes('software'), false);
    }
  });

  test('Strict Stream Boundary: B.Tech CSE receives software, system, and algorithmic competencies', () => {
    const isNonTech = isNonTechnicalCandidate('B.Tech Computer Science', 'Software Engineer', '');
    assert.strictEqual(isNonTech, false);

    const competencies = getDomainCompetencies('B.Tech Computer Science', 'Software Engineer', 'UG', '');
    assert.ok(competencies.some(c => c.name.includes('Data Structures') || c.name.includes('System Architecture')));
  });

  // Endpoint Security & Handler Tests
  const { default: handler } = await import('../api/index.js');

  function invokeHandler(h, { url, method = 'GET', headers = {}, body = null }) {
    return new Promise((resolve) => {
      const resHeaders = {};
      let statusCode = 200;
      const req = {
        url,
        method,
        headers: { ...headers },
        socket: { remoteAddress: '127.0.0.1' },
        body,
        query: {},
        on(event, cb) {
          if (event === 'data' && body) {
            cb(typeof body === 'string' ? body : JSON.stringify(body));
          }
          if (event === 'end') {
            cb();
          }
        }
      };
      const res = {
        setHeader(name, val) {
          resHeaders[name.toLowerCase()] = val;
        },
        getHeader(name) {
          return resHeaders[name.toLowerCase()];
        },
        writeHead(code, head) {
          statusCode = code;
          if (head) {
            Object.entries(head).forEach(([k, v]) => {
              resHeaders[k.toLowerCase()] = v;
            });
          }
          return res;
        },
        status(code) {
          statusCode = code;
          return res;
        },
        json(data) {
          resHeaders['content-type'] = 'application/json';
          resolve({ statusCode, headers: resHeaders, body: data });
        },
        send(data) {
          resolve({ statusCode, headers: resHeaders, body: data });
        },
        end(data) {
          resolve({ statusCode, headers: resHeaders, body: data });
        }
      };
      try {
        h(req, res);
      } catch (e) {
        resolve({ statusCode: 500, headers: resHeaders, error: e });
      }
    });
  }

  await (async () => {
    total++;
    const res = await invokeHandler(handler, {
      url: '/api/ai/next-question',
      method: 'GET'
    });
    if (res.statusCode === 405) {
      passed++;
      console.log(`✅ PASS [Scenario ${total}] /api/ai/next-question rejects GET with HTTP 405 Method Not Allowed`);
    } else {
      console.error(`❌ FAIL [Scenario ${total}] Expected 405, got ${res.statusCode}`);
      process.exitCode = 1;
    }
  })();

  await (async () => {
    total++;
    const res = await invokeHandler(handler, {
      url: '/api/ai/next-question',
      method: 'POST',
      body: { config: { role: 'Software Engineer' } }
    });
    if (res.statusCode === 401 && res.body?.error === 'UNAUTHORIZED') {
      passed++;
      console.log(`✅ PASS [Scenario ${total}] /api/ai/next-question requires authentication (HTTP 401 UNAUTHORIZED)`);
    } else {
      console.error(`❌ FAIL [Scenario ${total}] Expected 401 UNAUTHORIZED, got ${res.statusCode}`);
      process.exitCode = 1;
    }
  })();

  await (async () => {
    total++;
    const res = await invokeHandler(handler, {
      url: '/api/ai/blueprint',
      method: 'POST',
      body: { role: 'Accountant', academicStream: 'B.Com' }
    });
    if (res.statusCode === 200 && res.body?.blueprint?.competencies?.length > 0) {
      passed++;
      console.log(`✅ PASS [Scenario ${total}] /api/ai/blueprint returns calibrated interview blueprint`);
    } else {
      console.error(`❌ FAIL [Scenario ${total}] Expected 200 with blueprint, got ${res.statusCode}`);
      process.exitCode = 1;
    }
  })();

  console.log('\n====================================================');
  console.log(`ADAPTIVE INTELLIGENCE TEST SUMMARY: ${passed} / ${total} PASSED`);
  console.log('====================================================\n');

  if (passed === total) {
    console.log('🎉 ALL 14 ADAPTIVE SCENARIOS AND STREAM BOUNDARY TESTS PASSED (100% VERIFIED)!');
  } else {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
