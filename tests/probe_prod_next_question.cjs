const https = require('https');

const API_BASE = 'https://interviewbro-ai.vercel.app';
const SUPABASE_URL = 'https://ochbpanyltnoltelpguk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2';

function httpsPost(url, bodyObj, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(bodyObj);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, json: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: resBody });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function probeNextQuestion() {
  console.log('1. Signing in test user...');
  const email = `probe_next_${Date.now()}@testbro.com`;
  const signupRes = await httpsPost(`${SUPABASE_URL}/auth/v1/signup`, {
    email,
    password: 'Password123!',
    data: { full_name: 'Test Probe Next' }
  }, { 'apikey': SUPABASE_KEY });

  const token = signupRes.json.access_token;
  console.log('Token acquired. User ID:', signupRes.json.user.id);

  console.log('\n2. Calling /api/ai/next-question on production...');
  const currentQuestion = {
    id: 'q-gemini-1',
    orderIndex: 0,
    questionText: 'Can you explain the difference between process synchronization and mutual exclusion in operating systems?',
    category: 'operating systems',
    source: 'ai'
  };
  const candidateAnswer = "Process synchronization is a broader mechanism ensuring concurrent processes execute without corrupting shared state, whereas mutual exclusion is the specific property ensuring only one process can enter the critical section at any given time, often implemented using mutexes or semaphores.";

  const nextRes = await httpsPost(`${API_BASE}/api/ai/next-question`, {
    config: {
      role: 'Software Engineer',
      companyName: 'Google',
      difficulty: 'intermediate',
      interviewType: 'technical',
      academicStream: 'B.Tech Computer Science',
      educationLevel: 'UG',
      questionCount: 3
    },
    currentQuestion,
    candidateAnswer,
    sessionMemory: {
      previousQuestions: [currentQuestion.questionText],
      topicsExplored: ['operating systems'],
      currentDifficulty: 'intermediate',
      currentCompetency: 'operating systems'
    }
  }, {
    'Authorization': `Bearer ${token}`
  });

  console.log('Next-Question HTTP Status:', nextRes.status);
  console.log('Next-Question Response JSON:', JSON.stringify(nextRes.json, null, 2));
}

probeNextQuestion().catch(console.error);
