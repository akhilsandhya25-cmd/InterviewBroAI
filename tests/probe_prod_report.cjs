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

async function probeReport() {
  console.log('1. Signing in test user...');
  const email = `probe_rep_${Date.now()}@testbro.com`;
  const signupRes = await httpsPost(`${SUPABASE_URL}/auth/v1/signup`, {
    email,
    password: 'Password123!',
    data: { full_name: 'Test Probe Report' }
  }, { 'apikey': SUPABASE_KEY });

  const token = signupRes.json.access_token;
  console.log('Token acquired. User ID:', signupRes.json.user.id);

  console.log('\n2. Calling /api/ai/final-report on production...');
  const repRes = await httpsPost(`${API_BASE}/api/ai/final-report`, {
    config: {
      role: 'Software Engineer',
      companyName: 'Google',
      difficulty: 'intermediate',
      interviewType: 'technical',
      academicStream: 'B.Tech Computer Science',
      educationLevel: 'UG'
    },
    candidateName: 'Test Candidate',
    questions: [
      {
        id: 'q-gemini-1',
        orderIndex: 0,
        questionText: 'Can you explain the difference between process synchronization and mutual exclusion in operating systems?',
        category: 'technical',
        candidateAnswer: 'Process synchronization coordinates multiple concurrent processes to ensure consistent data access, while mutual exclusion is a specific condition where only one thread/process can enter the critical section at a time using mutex locks or semaphores.',
        evaluation: {
          score: 95,
          feedback: 'Outstanding explanation of concurrency primitives.',
          strengths: ['Accurate distinction between process synchronization and mutex'],
          missedPoints: []
        }
      }
    ]
  }, {
    'Authorization': `Bearer ${token}`
  });

  console.log('Report HTTP Status:', repRes.status);
  console.log('Report Response JSON:', JSON.stringify(repRes.json, null, 2));
}

probeReport().catch(console.error);
