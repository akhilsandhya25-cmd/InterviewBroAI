const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing key ending in:', apiKey?.slice(-6));

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log('Available models count:', json.models.length);
        const generateModels = json.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
        console.log('Models supporting generateContent:');
        generateModels.forEach(m => console.log(' -', m.name));
      } else {
        console.log('Response body:', data);
      }
    } catch {
      console.log('Raw body:', data);
    }
  });
}).on('error', console.error);
