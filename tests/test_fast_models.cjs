const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

const models = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest'
];

async function test() {
  for (const m of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Say "hello" in JSON: {"greeting": "hello"}' }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });
      const ms = Date.now() - start;
      if (res.ok) {
        const d = await res.json();
        console.log(`✅ [${m}] Status ${res.status} in ${ms}ms:`, d.candidates?.[0]?.content?.parts?.[0]?.text);
      } else {
        const err = await res.json().catch(() => ({}));
        console.log(`❌ [${m}] Status ${res.status} in ${ms}ms:`, err?.error?.message);
      }
    } catch (e) {
      console.log(`❌ [${m}] Error:`, e.message);
    }
  }
}

test();
