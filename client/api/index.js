export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = req.url || '';

  if (url.includes('/health')) {
    return res.status(200).json({
      status: 'ok',
      service: 'InterviewBro AI Vercel API',
      timestamp: new Date().toISOString()
    });
  }

  if (url.includes('/voice/status')) {
    return res.status(200).json({
      isConfigured: false,
      provider: 'Web Speech API (Browser Native)',
      message: 'Running in browser-native Web Speech API mode on Vercel'
    });
  }

  if (url.includes('/voice/voices')) {
    return res.status(200).json({
      voices: []
    });
  }

  return res.status(200).json({
    status: 'ok',
    service: 'InterviewBro AI Serverless API',
    endpoint: url,
    timestamp: new Date().toISOString()
  });
}
