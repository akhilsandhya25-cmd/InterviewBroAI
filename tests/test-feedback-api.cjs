const assert = require('assert');

function invokeHandler(handler, { url, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve) => {
    const resHeaders = {};
    let statusCode = 200;
    let resBody = '';

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
        resBody = JSON.stringify(data);
        resolve({ statusCode, headers: resHeaders, body: data });
      },
      end(data) {
        if (data) resBody = data;
        let parsed = null;
        try {
          parsed = JSON.parse(resBody);
        } catch {
          parsed = resBody;
        }
        resolve({ statusCode, headers: resHeaders, body: parsed });
      }
    };

    handler(req, res).catch((err) => {
      resolve({ statusCode: 500, headers: resHeaders, body: { error: err.message } });
    });
  });
}

async function runFeedbackTests() {
  console.log('Testing /api/feedback in-memory integration...');
  const vercelHandler = (await import('../api/index.js')).default;
  let passed = 0;
  let failed = 0;

  // Test 1: Empty message rejected with 400
  try {
    const res = await invokeHandler(vercelHandler, {
      url: '/api/feedback',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '10.0.0.1' },
      body: { rating: 5, category: 'General Thoughts', message: '   ' }
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.body.error, 'Missing Feedback Message');
    console.log('✅ PASS [Empty message rejected with HTTP 400]');
    passed++;
  } catch (err) {
    console.error('❌ FAIL [Empty message rejected]', err);
    failed++;
  }

  // Test 2: Valid feedback accepted with 200 and returns feedbackId
  try {
    const res = await invokeHandler(vercelHandler, {
      url: '/api/feedback',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '10.0.0.2' },
      body: {
        rating: 5,
        category: 'Interview AI & Audio',
        message: 'The AI feedback was super fast and realistic!',
        name: 'Priya (College)',
        email: 'priya@example.com'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(res.body.feedbackId, 'Should return feedbackId');
    console.log('✅ PASS [Valid feedback accepted, ID returned: ' + res.body.feedbackId + ']');
    passed++;
  } catch (err) {
    console.error('❌ FAIL [Valid feedback accepted]', err);
    failed++;
  }

  // Test 3: Clamped rating handled safely
  try {
    const res = await invokeHandler(vercelHandler, {
      url: '/api/feedback',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '10.0.0.3' },
      body: {
        rating: 99,
        category: 'General Thoughts',
        message: 'Loved it so much!',
        name: 'Rahul'
      }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    console.log('✅ PASS [Clamped rating handled safely]');
    passed++;
  } catch (err) {
    console.error('❌ FAIL [Clamped rating]', err);
    failed++;
  }

  // Test 4: Rate limit protection
  try {
    const clientIp = '10.0.0.4';
    // Consume 5 requests allowed per minute
    for (let i = 0; i < 5; i++) {
      await invokeHandler(vercelHandler, {
        url: '/api/feedback',
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-real-ip': clientIp },
        body: { rating: 5, category: 'General', message: `Test burst note ${i + 1}` }
      });
    }
    // 6th request from same IP should be blocked with 429
    const blockedRes = await invokeHandler(vercelHandler, {
      url: '/api/feedback',
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': clientIp },
      body: { rating: 5, category: 'General', message: 'Rate limit trigger' }
    });
    assert.strictEqual(blockedRes.statusCode, 429);
    console.log('✅ PASS [Rate limit enforced with HTTP 429]');
    passed++;
  } catch (err) {
    console.error('❌ FAIL [Rate limit enforcement]', err);
    failed++;
  }

  // Test 5: GET /api/feedback returns list
  try {
    const res = await invokeHandler(vercelHandler, {
      url: '/api/feedback',
      method: 'GET'
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert(Array.isArray(res.body.data), 'Data should be an array');
    assert(res.body.data.length > 0, 'Should have feedback entries');
    console.log('✅ PASS [GET /api/feedback returns feedback list, count: ' + res.body.data.length + ']');
    passed++;
  } catch (err) {
    console.error('❌ FAIL [GET /api/feedback returns feedback list]', err);
    failed++;
  }

  console.log(`\nFeedback Tests Complete: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runFeedbackTests();
