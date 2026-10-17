const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ochbpanyltnoltelpguk.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2';

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const slugStr = Array.isArray(req.query?.slug) ? '/' + req.query.slug.join('/') : (req.query?.slug ? '/' + req.query.slug : '');
  const url = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || slugStr || req.url || '';

  // 1. Health check
  if (url.includes('/health')) {
    return res.status(200).json({
      status: 'ok',
      service: 'InterviewBro AI Vercel API',
      provider: 'Supabase Auth',
      timestamp: new Date().toISOString()
    });
  }

  // 2. Auth status
  if (url.includes('/auth/status')) {
    return res.status(200).json({
      status: 'ok',
      provider: 'supabase',
      isSupabaseConfigured: true,
      supportsPasswordReset: true,
      supportsUserIsolation: true
    });
  }

  // 3. Signup endpoint - route directly to Supabase Auth
  if (url.includes('/auth/signup') && req.method === 'POST') {
    const body = await parseBody(req);
    const { email, password, fullName } = body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email address and password are required.'
      });
    }

    try {
      const supaRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          data: {
            full_name: (fullName || email.split('@')[0]).trim()
          }
        })
      });

      const text = await supaRes.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!supaRes.ok) {
        return res.status(supaRes.status).json({
          error: data.msg || data.error_description || data.error || 'Registration failed',
          message: data.msg || data.error_description || data.error || 'Registration failed',
          code: data.error_code || data.code
        });
      }

      const user = {
        id: data.id || `usr-${Date.now()}`,
        email: data.email || email,
        full_name: data.user_metadata?.full_name || fullName || 'Candidate',
        role_target: 'Full Stack Developer',
        experience_level: 'fresher',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const requiresEmailVerification = !data.session;

      return res.status(200).json({
        user: requiresEmailVerification ? null : user,
        token: data.session?.access_token,
        session: data.session,
        requiresEmailVerification,
        email: email.trim().toLowerCase(),
        message: requiresEmailVerification
          ? "Account created successfully! We've sent a verification link to your email address. Please check your inbox and spam folder, then verify your email before logging in."
          : `Welcome to InterviewBro AI, ${user.full_name}!`
      });
    } catch (err) {
      console.error('Serverless signup error:', err);
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Could not connect to Supabase Auth. Please try again.'
      });
    }
  }

  // 4. Login endpoint - route directly to Supabase Auth
  if (url.includes('/auth/login') && req.method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email address and password are required.'
      });
    }

    try {
      const supaRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      const text = await supaRes.text();
      let data = {};
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!supaRes.ok) {
        return res.status(supaRes.status).json({
          error: data.error_description || data.msg || 'Authentication failed',
          message: data.error_description || data.msg || 'Invalid login credentials. Please verify your email and password.'
        });
      }

      const user = {
        id: data.user?.id || `usr-${Date.now()}`,
        email: data.user?.email || email,
        full_name: data.user?.user_metadata?.full_name || email.split('@')[0],
        role_target: 'Full Stack Developer',
        experience_level: 'fresher',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        created_at: data.user?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.status(200).json({
        user,
        token: data.access_token,
        session: data
      });
    } catch (err) {
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Could not reach authentication server.'
      });
    }
  }

  // 5. Voice endpoints
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

  // 6. Generic API Fallback
  return res.status(200).json({
    status: 'ok',
    service: 'InterviewBro AI Serverless API',
    endpoint: url,
    timestamp: new Date().toISOString()
  });
}
