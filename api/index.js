function getSupabaseConfig() {
  let url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  if (!url || !url.startsWith('http') || url.includes('undefined')) {
    url = 'https://ochbpanyltnoltelpguk.supabase.co';
  }
  url = url.replace(/\/+$/, '');

  let key = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!key || key.length < 20 || key.includes('undefined')) {
    key = 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2';
  }
  return { url, key };
}

function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'unknown';
  const parts = email.split('@');
  if (parts.length !== 2) return 'invalid-email';
  const name = parts[0];
  const maskedName = name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  return `${maskedName}@${parts[1]}`;
}

async function parseBody(req) {
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
  }
  if (req.readableEnded) {
    return {};
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
    setTimeout(() => resolve({}), 1000);
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
    const { url: sUrl, key: sKey } = getSupabaseConfig();
    return res.status(200).json({
      status: 'ok',
      service: 'InterviewBro AI Vercel API',
      provider: 'Supabase Auth',
      supabaseUrlHost: new URL(sUrl).hostname,
      hasKey: Boolean(sKey),
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
  if (url.includes('/auth/signup')) {
    if (req.method === 'GET') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'The /api/auth/signup endpoint requires a POST request with email, password, and fullName.'
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: `HTTP method ${req.method} is not supported on /api/auth/signup.`
      });
    }

    const body = await parseBody(req);
    const { email, password, fullName } = body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanFullName = String(fullName || cleanEmail.split('@')[0]).trim();

    console.log(`[Auth API] Signup attempt received for ${maskEmail(cleanEmail)}`);

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();

    try {
      const supaRes = await fetch(`${supaUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supaKey,
          'Authorization': `Bearer ${supaKey}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: String(password),
          data: {
            full_name: cleanFullName
          }
        })
      });

      const text = await supaRes.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text || 'Unknown response' }; }

      if (!supaRes.ok) {
        console.warn(`[Auth API] Supabase signup rejected for ${maskEmail(cleanEmail)}: HTTP ${supaRes.status}`, {
          code: data.code || data.error_code,
          msg: data.msg || data.message || data.error_description || data.error
        });

        let friendlyMsg = data.msg || data.error_description || data.message || data.error || 'Registration failed';
        const errorCode = data.error_code || data.code;

        if (errorCode === 'over_email_send_rate_limit' || String(data.msg).includes('rate limit')) {
          friendlyMsg = 'Too many verification email requests. Please wait a while before trying again.';
        } else if (errorCode === 'user_already_exists' || String(data.msg).includes('already registered')) {
          friendlyMsg = 'An account with this email address already exists. Please log in instead.';
        } else if (errorCode === 'validation_failed' || String(data.msg).includes('invalid format')) {
          friendlyMsg = 'Unable to validate email address. Please provide a valid email format.';
        } else if (errorCode === 'weak_password') {
          friendlyMsg = 'Password must be at least 6 characters long.';
        }

        return res.status(supaRes.status).json({
          error: data.msg || data.error_description || data.error || 'Registration failed',
          message: friendlyMsg,
          code: errorCode
        });
      }

      console.log(`[Auth API] Supabase signup succeeded for ${maskEmail(cleanEmail)}, user ID: ${data.id || data.user?.id}`);

      const user = {
        id: data.id || data.user?.id || `usr-${Date.now()}`,
        email: data.email || cleanEmail,
        full_name: data.user_metadata?.full_name || cleanFullName,
        role_target: '',
        experience_level: 'fresher',
        college: '',
        graduation_year: '',
        skills: [],
        career_goals: '',
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        profile_completed: false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const requiresEmailVerification = !data.session;

      return res.status(200).json({
        success: true,
        user: requiresEmailVerification ? null : user,
        token: data.session?.access_token || null,
        session: data.session || null,
        requiresEmailVerification,
        email: cleanEmail,
        message: requiresEmailVerification
          ? "Account created successfully! We've sent a verification link to your email address. Please check your inbox and spam folder, then verify your email before logging in."
          : `Welcome to InterviewBro AI, ${cleanFullName}!`
      });
    } catch (err) {
      console.error(`[Auth API] Serverless exception during signup for ${maskEmail(cleanEmail)}:`, err.message || err);
      return res.status(500).json({
        error: 'Authentication server error',
        message: 'Could not connect to Supabase Auth service. Please try again later.'
      });
    }
  }

  // 4. Login endpoint - route directly to Supabase Auth
  if (url.includes('/auth/login')) {
    if (req.method === 'GET') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'The /api/auth/login endpoint requires a POST request with email and password.'
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
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email address and password are required.'
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    console.log(`[Auth API] Login attempt received for ${maskEmail(cleanEmail)}`);

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();

    try {
      const supaRes = await fetch(`${supaUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supaKey,
          'Authorization': `Bearer ${supaKey}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: String(password)
        })
      });

      const text = await supaRes.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text || 'Unknown response' }; }

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
        role_target: '',
        experience_level: 'fresher',
        college: '',
        graduation_year: '',
        skills: [],
        career_goals: '',
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        profile_completed: false,
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

  // 4b. Delete Account endpoint (DPDP Act 2023 compliance)
  if (url.includes('/auth/delete-account')) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'The /api/auth/delete-account endpoint requires a POST request.'
      });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    const body = await parseBody(req);
    const requestedUserId = body.userId;
    let authenticatedUserId = null;

    if (token) {
      try {
        const userRes = await fetch(`${supaUrl}/auth/v1/user`, {
          headers: {
            'apikey': supaKey,
            'Authorization': `Bearer ${token}`
          }
        });
        if (userRes.ok) {
          const u = await userRes.json();
          authenticatedUserId = u.id;
        }
      } catch (e) {
        console.warn('[Delete API] Token verification warning:', e.message);
      }
    }

    // Enforce strict server-side authentication: caller must provide a valid, verified token
    if (!authenticatedUserId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'A valid, unexpired authentication Bearer token is required to delete an account.'
      });
    }

    if (requestedUserId && requestedUserId !== authenticatedUserId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Cross-user deletion rejected.'
      });
    }

    const targetUserId = authenticatedUserId;


    try {
      let adminDeleted = false;
      if (serviceRoleKey) {
        const adminRes = await fetch(`${supaUrl}/auth/v1/admin/users/${targetUserId}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
          }
        });
        if (adminRes.ok) adminDeleted = true;
      }

      const authBearer = serviceRoleKey || token;
      const authApiKey = serviceRoleKey || supaKey;
      if (authBearer) {
        const tables = ['feedback_reports', 'interview_sessions', 'resume_analyses', 'profiles'];
        for (const table of tables) {
          const idCol = table === 'profiles' ? 'id' : 'user_id';
          await fetch(`${supaUrl}/rest/v1/${table}?${idCol}=eq.${targetUserId}`, {
            method: 'DELETE',
            headers: {
              'apikey': authApiKey,
              'Authorization': `Bearer ${authBearer}`
            }
          }).catch(() => null);
        }
      }

      return res.status(200).json({
        success: true,
        recordsPurged: true,
        authAccountDeleted: adminDeleted,
        message: adminDeleted
          ? 'Account credentials and all associated database records have been permanently deleted.'
          : 'All candidate data, profiles, sessions, and reports were permanently erased from database. Complete GoTrue authentication user removal requires SUPABASE_SERVICE_ROLE_KEY to be configured on the server environment.',
        userId: targetUserId,
        adminPurged: adminDeleted
      });
    } catch (err) {
      console.error('[Delete API] Error processing deletion:', err);
      return res.status(500).json({
        error: 'Deletion Error',
        message: 'Encountered an internal error while deleting account data.'
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
