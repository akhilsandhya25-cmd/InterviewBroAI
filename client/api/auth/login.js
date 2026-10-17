const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ochbpanyltnoltelpguk.supabase.co').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2').trim();

function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'unknown';
  const parts = email.split('@');
  if (parts.length !== 2) return 'invalid-email';
  const name = parts[0];
  const maskedName = name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  return `${maskedName}@${parts[1]}`;
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'The /api/auth/login endpoint requires a POST request with email and password in the request body.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: `HTTP method ${req.method} is not supported on /api/auth/login.`
    });
  }

  const body = await parseBody(req);
  const { email, password } = body || {};

  if (!email || !password) {
    console.warn('[Auth API] Login validation rejected: Missing email or password');
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email address and password are required.'
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  console.log(`[Auth API] Login attempt received for ${maskEmail(cleanEmail)}`);

  try {
    const supaRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: String(password)
      })
    });

    const text = await supaRes.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || 'Unknown response from authentication service' };
    }

    if (!supaRes.ok) {
      console.warn(`[Auth API] Supabase login rejected for ${maskEmail(cleanEmail)}: HTTP ${supaRes.status}`, {
        error: data.error || data.error_description || data.msg
      });

      return res.status(supaRes.status).json({
        error: data.error_description || data.msg || data.error || 'Authentication failed',
        message: data.error_description || data.msg || 'Invalid login credentials. Please verify your email and password.'
      });
    }

    console.log(`[Auth API] Supabase login succeeded for ${maskEmail(cleanEmail)}, user ID: ${data.user?.id}`);

    const user = {
      id: data.user?.id || `usr-${Date.now()}`,
      email: data.user?.email || cleanEmail,
      full_name: data.user?.user_metadata?.full_name || cleanEmail.split('@')[0],
      role_target: 'Full Stack Developer',
      experience_level: 'fresher',
      skills: ['JavaScript', 'React', 'Problem Solving'],
      interviews_remaining: 9999,
      total_interviews_taken: 0,
      created_at: data.user?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      token: data.access_token,
      session: data
    });
  } catch (err) {
    console.error(`[Auth API] Serverless exception during login for ${maskEmail(cleanEmail)}:`, err.message || err);
    return res.status(500).json({
      error: 'Authentication server error',
      message: 'Could not connect to authentication service. Please try again later.'
    });
  }
}
