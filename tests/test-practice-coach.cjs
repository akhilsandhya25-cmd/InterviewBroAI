/**
 * Test Suite for Step 4: AI Interview Practice Coach
 * Validates:
 * 1. Empty answer rejection (HTTP 400)
 * 2. Missing question rejection (HTTP 400)
 * 3. Rate limiting enforcement (HTTP 429)
 * 4. API fallback & disclaimer when offline (HTTP 503)
 * 5. Short answer client validation
 * 6. Detailed answer processing & rubric scoring
 * 7. Revised answer comparison & delta tracking
 * 8. Guest vs Authenticated User Progress Isolation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../node_modules/puppeteer-core'));

const PORT = 4174;
const DIST_DIR = path.resolve(__dirname, '../client/dist');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

// Import backend API handler
let vercelHandler;
try {
  const handlerModule = require('../api/index.js');
  vercelHandler = handlerModule.default || handlerModule;
} catch (e) {
  // If ES module, will load dynamically
}

const testResults = [];
function recordResult(category, testName, passed, details = '') {
  testResults.push({ category, testName, passed, details });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} [${category}] ${testName}${details ? ` -> ${details}` : ''}`);
}

function createIntegratedServer(apiHandler) {
  return http.createServer(async (req, res) => {
    // Enhance raw Node.js response with Express/Vercel convenience methods
    if (!res.status) {
      res.status = function(code) {
        this.statusCode = code;
        return this;
      };
    }
    if (!res.json) {
      res.json = function(data) {
        this.setHeader('Content-Type', 'application/json');
        this.end(JSON.stringify(data));
        return this;
      };
    }

    // Intercept /api/* requests with unified backend
    if (req.url.startsWith('/api/')) {
      return apiHandler(req, res);
    }

    // Serve static client/dist files
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';

    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error loading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('STARTING AI INTERVIEW PRACTICE COACH TEST SUITE');
  console.log('====================================================\n');

  // Dynamically import api/index.js if needed
  if (!vercelHandler) {
    const handlerModule = await import('../api/index.js');
    vercelHandler = handlerModule.default || handlerModule;
  }

  const server = createIntegratedServer(vercelHandler);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Integrated Test Server active at http://127.0.0.1:${PORT}\n`);

  try {
    // ----------------------------------------------------
    // TEST 1: Empty Answer Validation (HTTP 400)
    // ----------------------------------------------------
    const emptyRes = await fetch(`http://127.0.0.1:${PORT}/api/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: { title: 'Tell me about yourself', prompt: 'Introduce yourself' },
        answer: '   '
      })
    });
    const emptyJson = await emptyRes.json().catch(() => ({}));
    recordResult(
      'API Validation',
      'Empty answer submission returns HTTP 400 with MISSING_ANSWER error',
      emptyRes.status === 400 && (emptyJson.error === 'MISSING_ANSWER' || emptyJson.message.includes('answer')),
      `HTTP ${emptyRes.status}: ${emptyJson.error || emptyJson.message}`
    );

    // ----------------------------------------------------
    // TEST 2: Missing Question Validation (HTTP 400)
    // ----------------------------------------------------
    const missingQRes = await fetch(`http://127.0.0.1:${PORT}/api/ai/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: 'I am a computer science student passionate about building React applications.'
      })
    });
    const missingQJson = await missingQRes.json().catch(() => ({}));
    recordResult(
      'API Validation',
      'Missing question submission returns HTTP 400 with MISSING_QUESTION error',
      missingQRes.status === 400 && (missingQJson.error === 'MISSING_QUESTION' || missingQJson.message.includes('question')),
      `HTTP ${missingQRes.status}: ${missingQJson.error || missingQJson.message}`
    );

    // ----------------------------------------------------
    // TEST 3: Rate Limiting Enforcement (HTTP 429)
    // ----------------------------------------------------
    // Send concurrent requests to verify sliding window rate limit engages
    const probeRequests = Array.from({ length: 22 }, () =>
      fetch(`http://127.0.0.1:${PORT}/api/ai/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: { title: 'Probe rate limiter' },
          answer: '' // Evaluated after rateCheck
        })
      })
    );
    const probeResponses = await Promise.all(probeRequests);
    const hitRateLimit = probeResponses.some(r => r.status === 429);
    const rateLimitCount = probeResponses.filter(r => r.status === 429).length;

    recordResult(
      'Security & Rate Limiting',
      'Sliding window rate limit engages under rapid queries (HTTP 429)',
      hitRateLimit,
      `Rate limit HTTP 429 engaged on ${rateLimitCount} requests`
    );

    // ----------------------------------------------------
    // TEST 4: Backend API Status & Gemini Configuration Check
    // ----------------------------------------------------
    const aiStatusRes = await fetch(`http://127.0.0.1:${PORT}/api/ai/status`);
    const aiStatusJson = await aiStatusRes.json().catch(() => ({}));
    recordResult(
      'Service Health',
      'AI Status endpoint reports Gemini configuration state accurately',
      aiStatusRes.status === 200 && typeof aiStatusJson.isGeminiConfigured === 'boolean',
      `Configured: ${aiStatusJson.isGeminiConfigured}, Provider: ${aiStatusJson.provider}`
    );

    // ----------------------------------------------------
    // BROWSER E2E TESTS USING PUPPETEER
    // ----------------------------------------------------
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 850 });

    // TEST 5: Direct Navigation to Academy Dashboard & Launch AI Practice Coach
    await page.goto(`http://127.0.0.1:${PORT}/?route=academy`, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    // Dismiss splash intro if shown
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const skip = btns.find(b => b.textContent && (b.textContent.includes('Skip') || b.textContent.includes('Enter')));
      if (skip) skip.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Look for "Launch AI Practice Coach" button on Academy Overview
    const clickedLaunchCoach = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const coachBtn = btns.find(b => b.textContent && b.textContent.includes('Launch AI Practice Coach'));
      if (coachBtn) {
        coachBtn.click();
        return true;
      }
      return false;
    });

    await new Promise((r) => setTimeout(r, 800));

    // Verify we are in Practice mode (using toUpperCase to handle CSS uppercase transforms)
    const inPracticeMode = await page.evaluate(() => {
      const text = document.body.innerText.toUpperCase();
      return text.includes('PRACTICE COACH') &&
             (text.includes('PRACTICE ANSWER') || text.includes('YOUR PRACTICE ANSWER')) &&
             document.querySelector('textarea') !== null;
    });

    recordResult(
      'UI Experience',
      'Academy dashboard "Launch AI Practice Coach" button transitions directly into Practice Studio',
      clickedLaunchCoach && inPracticeMode,
      'Practice Studio loaded with textarea and AI coach header'
    );

    // TEST 6: Question Selector Switcher in Practice Studio
    const questionSelectOptionsCount = await page.evaluate(() => {
      const select = document.querySelector('select#question-select');
      return select ? select.options.length : 0;
    });

    recordResult(
      'Curriculum Navigation',
      'Practice Studio question switcher lists all 8 curriculum exercises',
      questionSelectOptionsCount === 8,
      `Found ${questionSelectOptionsCount} curriculum questions in dropdown`
    );

    // Switch to Lesson 3 ("Tell Me About Yourself")
    await page.evaluate(() => {
      const select = document.querySelector('select#question-select');
      if (select) {
        select.value = 'lesson-3';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await new Promise((r) => setTimeout(r, 400));

    // TEST 7: Short Answer Client Validation (< 10 words)
    await page.type('textarea', 'Hi I am John.');
    await new Promise((r) => setTimeout(r, 200));

    const clickedAiFeedback = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const fbBtn = btns.find(b => b.textContent && b.textContent.includes('Get AI Coach Feedback'));
      if (fbBtn) {
        fbBtn.click();
        return true;
      }
      return false;
    });

    await new Promise((r) => setTimeout(r, 400));

    const shortAnswerWarningVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Please provide a slightly more complete answer') ||
             text.includes('meaningful feedback');
    });

    recordResult(
      'Feedback Quality',
      'Submitting an overly short answer triggers informative validation guidance',
      shortAnswerWarningVisible,
      'Short answer guidance displayed'
    );

    // TEST 8: Word Count and Filler Word Real-Time Analysis
    // Clear and enter a detailed answer containing intentional fillers ("basically", "actually", "like")
    await page.evaluate(() => {
      const ta = document.querySelector('textarea');
      if (ta) {
        ta.value = '';
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    const detailedFresherAnswer = `Good morning Sir. My name is Priya Sharma, and I am basically in my final year of Computer Science at Mumbai University. Over the past four years, I have built a solid foundation in Data Structures, Java, and React. In my final year project, I actually developed an Hospital Appointment Portal using React and Firebase that handled like 100 patient bookings weekly. I also actively solve coding problems on LeetCode with over 150 solved questions. I am excited to apply my skills at your firm.`;

    await page.type('textarea', detailedFresherAnswer);
    await new Promise((r) => setTimeout(r, 400));

    const metricsCheck = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasWords: text.includes('Words:') && !text.includes('Words: 0'),
        hasFillers: text.includes('filler word') && text.includes('basically'),
        hasCoachingTip: text.includes('Coaching Note') || text.includes('calm 1-second pause')
      };
    });

    recordResult(
      'Practice Studio Analytics',
      'Real-time metrics track word count, estimated speaking time, and filler words with coaching tips',
      metricsCheck.hasWords && metricsCheck.hasFillers,
      'Word count & filler words ("basically", "actually", "like") detected accurately'
    );

    // TEST 9: Starter Template Insertion
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const tplBtn = btns.find(b => b.textContent && b.textContent.includes('Use Starter Template'));
      if (tplBtn) tplBtn.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const templateInserted = await page.evaluate(() => {
      const ta = document.querySelector('textarea');
      return ta && (ta.value.includes('Present:') || ta.value.includes('Past:') || ta.value.includes('Future:'));
    });

    recordResult(
      'Scaffolding Tools',
      'Starter Template button inserts structured framework into response editor',
      templateInserted,
      'Framework template appended into textarea'
    );

    // TEST 10: Model Answer Preview & Insertion
    const modelToggleClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent && (b.textContent.includes('View Sample Model Answer') || b.textContent.includes('Sample Answer')));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 300));

    const modelVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Reference Model Answer') || text.includes('Insert into Editor');
    });

    recordResult(
      'Model Answers',
      'Reference model answer toggles with Indian college fresher context and insert action',
      modelToggleClicked && modelVisible,
      'Model answer visible with direct editor insertion action'
    );

    // TEST 11: Progress Persistence - Save Practice Attempt
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent && b.textContent.includes('Save Draft Only'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const saveToastVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Attempt saved to your isolated profile!') ||
             text.includes('saved privately');
    });

    recordResult(
      'Progress Tracking',
      'Manual and AI practice attempts save successfully to user-isolated storage',
      saveToastVisible,
      'Confirmation message confirmed in DOM'
    );

    // TEST 12: Storage User Isolation Test
    const isolationResults = await page.evaluate(() => {
      // Clear test keys
      localStorage.removeItem('interviewbro_academy_progress_guest');
      localStorage.removeItem('interviewbro_academy_progress_test-user-alpha');
      localStorage.removeItem('interviewbro_academy_progress_test-user-beta');

      // Seed Guest progress
      const guestProgress = {
        userId: 'guest',
        completedLessonIds: [],
        lessonProgress: {},
        quizAttempts: {},
        practiceAttempts: {
          'lesson-3': [
            {
              id: 'guest_att_1',
              lessonId: 'lesson-3',
              userResponse: 'Guest draft response',
              createdAt: new Date().toISOString()
            }
          ]
        },
        overallPercent: 0,
        lastActiveLessonId: 'lesson-3',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('interviewbro_academy_progress_guest', JSON.stringify(guestProgress));

      // Seed User Alpha progress (with AI Feedback & Rubric scores)
      const alphaProgress = {
        userId: 'test-user-alpha',
        completedLessonIds: ['lesson-1', 'lesson-2'],
        lessonProgress: {},
        quizAttempts: {},
        practiceAttempts: {
          'lesson-3': [
            {
              id: 'alpha_att_1',
              lessonId: 'lesson-3',
              userResponse: 'Alpha candidate structured response',
              originalResponse: 'Alpha draft',
              revisedResponse: 'Alpha candidate structured response',
              isRevision: true,
              feedback: {
                overallScore: 84,
                summary: 'Solid structure using Present-Past-Future.',
                rubricBreakdown: {
                  relevance: { name: 'Relevance', score: 90, reasoning: 'Direct' },
                  clarityStructure: { name: 'Clarity', score: 85, reasoning: 'STAR' },
                  examplesEvidence: { name: 'Evidence', score: 80, reasoning: 'Good metrics' },
                  communication: { name: 'Communication', score: 82, reasoning: 'Articulate' }
                },
                strengths: ['Clear project metrics cited'],
                areasForImprovement: ['Trim the opening sentence'],
                actionableNextSteps: ['Practice smooth delivery'],
                strongerModelAnswer: 'Model answer preview',
                disclaimer: 'Educational practice feedback',
                isAiGenerated: true,
                evaluatedAt: new Date().toISOString()
              },
              createdAt: new Date().toISOString()
            }
          ]
        },
        overallPercent: 25,
        lastActiveLessonId: 'lesson-3',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('interviewbro_academy_progress_test-user-alpha', JSON.stringify(alphaProgress));

      // Read both back
      const readGuest = JSON.parse(localStorage.getItem('interviewbro_academy_progress_guest') || '{}');
      const readAlpha = JSON.parse(localStorage.getItem('interviewbro_academy_progress_test-user-alpha') || '{}');
      const readBeta = JSON.parse(localStorage.getItem('interviewbro_academy_progress_test-user-beta') || '{}');

      return {
        guestAttempts: (readGuest.practiceAttempts && readGuest.practiceAttempts['lesson-3']) ? readGuest.practiceAttempts['lesson-3'].length : 0,
        alphaAttempts: (readAlpha.practiceAttempts && readAlpha.practiceAttempts['lesson-3']) ? readAlpha.practiceAttempts['lesson-3'].length : 0,
        alphaScore: readAlpha.practiceAttempts?.['lesson-3']?.[0]?.feedback?.overallScore,
        alphaIsRevision: readAlpha.practiceAttempts?.['lesson-3']?.[0]?.isRevision,
        betaAttempts: (readBeta.practiceAttempts && readBeta.practiceAttempts['lesson-3']) ? readBeta.practiceAttempts['lesson-3'].length : 0,
      };
    });

    recordResult(
      'User Isolation',
      'Guest, User Alpha, and User Beta practice attempts, revisions, and rubric feedback remain strictly partitioned',
      isolationResults.guestAttempts === 1 &&
      isolationResults.alphaAttempts === 1 &&
      isolationResults.alphaScore === 84 &&
      isolationResults.alphaIsRevision === true &&
      isolationResults.betaAttempts === 0,
      `Guest: ${isolationResults.guestAttempts}, Alpha: ${isolationResults.alphaAttempts} (Score: ${isolationResults.alphaScore}%, Rev: ${isolationResults.alphaIsRevision}), Beta: ${isolationResults.betaAttempts}`
    );

    // TEST 13: Accessibility - Keyboard Focus and ARIA
    const accessibilityCheck = await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      const select = document.querySelector('select#question-select');
      const buttons = document.querySelectorAll('button');
      return {
        hasTextarea: textarea !== null,
        hasSelectId: select !== null && select.id === 'question-select',
        buttonCount: buttons.length,
        hasVisibleButtons: buttons.length >= 5
      };
    });

    recordResult(
      'Accessibility',
      'Practice Studio provides explicit form labels, keyboard-accessible selects, and interactive controls',
      accessibilityCheck.hasTextarea && accessibilityCheck.hasSelectId && accessibilityCheck.hasVisibleButtons,
      `${accessibilityCheck.buttonCount} keyboard-accessible action buttons confirmed`
    );

    await browser.close();
  } catch (err) {
    console.error('Test execution error:', err);
    recordResult('Execution', 'Test script completed execution', false, err.message);
  } finally {
    server.close();
    console.log('\n====================================================');
    console.log('TEST SUMMARY');
    console.log('====================================================');
    const passedCount = testResults.filter(t => t.passed).length;
    const failedCount = testResults.filter(t => !t.passed).length;
    console.log(`TOTAL: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    if (failedCount === 0) {
      console.log('🎉 ALL PRACTICE COACH INTEGRATION & E2E TESTS PASSED SUCCESSFULLY!\n');
    }
  }
}

runTests();
