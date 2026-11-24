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

async function probeEvaluate() {
  console.log('1. Signing in test user...');
  const email = `probe_eval_${Date.now()}@testbro.com`;
  const signupRes = await httpsPost(`${SUPABASE_URL}/auth/v1/signup`, {
    email,
    password: 'Password123!',
    data: { full_name: 'Test Probe Eval' }
  }, { 'apikey': SUPABASE_KEY });

  const token = signupRes.json.access_token;
  console.log('Token acquired. User ID:', signupRes.json.user.id);

  console.log('\n2. Calling /api/ai/evaluate on production...');
  const evalRes = await httpsPost(`${API_BASE}/api/ai/evaluate`, {
    config: {
      role: 'Software Engineer',
      companyName: 'Google',
      difficulty: 'intermediate',
      interviewType: 'technical',
      academicStream: 'B.Tech Computer Science',
      educationLevel: 'UG'
    },
    question: {
      id: 'q-gemini-1',
      questionText: 'Can you explain the difference between process synchronization and mutual exclusion in operating systems?',
      category: 'technical'
    },
    answer: "Process synchronization coordinates multiple concurrent processes to ensure consistent data access, while mutual exclusion is a specific condition where only one thread/process can enter the critical section at a time using mutex locks or semaphores."
  }, {
    'Authorization': `Bearer ${token}`
  });

  console.log('Evaluate HTTP Status:', evalRes.status);
  console.log('Evaluate Response JSON:', JSON.stringify(evalRes.json, null, 2));
}

probeEvaluate().catch(console.error);
