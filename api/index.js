import { getIsGeminiConfigured, geminiService } from './gemini.js';
import { resumeParser } from './resume.js';
import deleteAccountHandler from './auth/delete-account.js';
import { captureServerlessError } from './errorMonitoring.js';
import {
  applySecurityHeaders,
  isAllowedOrigin,
  authenticateRequest,
  checkRateLimit,
  getClientIp,
  consumeQuotaOnSessionStart,
  validateResumeFile,
  verifyUserQuotaAvailable
} from './security.js';

export function validateRequiredEnvironment() {
  const missingRequired = [];
  const warnings = [];

  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!geminiKey || geminiKey.includes('your-gemini-api-key') || geminiKey.length < 10) {
    missingRequired.push('GEMINI_API_KEY');
  }

  const supaUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  if (!supaUrl || !supaUrl.startsWith('http') || supaUrl.includes('your-project-id') || supaUrl.includes('your-supabase-url')) {
    missingRequired.push('SUPABASE_URL');
  }

  const supaAnon = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!supaAnon || supaAnon.includes('your-supabase-anon-key') || supaAnon.length < 20) {
    missingRequired.push('SUPABASE_ANON_KEY');
  }

  const supaService = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supaService || supaService.includes('your-supabase-service-role-key') || supaService.length < 20) {
    missingRequired.push('SUPABASE_SERVICE_ROLE_KEY');
  }

  const elevenLabs = (process.env.ELEVENLABS_API_KEY || '').trim();
  if (!elevenLabs || elevenLabs.includes('your-elevenlabs-api-key') || elevenLabs.length < 10) {
    warnings.push('ELEVENLABS_API_KEY (optional: using browser Web Speech API)');
  }

  const sentryDsn = (process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN || '').trim();

  return {
    valid: missingRequired.length === 0,
    missingRequiredEnvVars: missingRequired,
    warnings,
    services: {
      gemini: !missingRequired.includes('GEMINI_API_KEY'),
      supabase: !missingRequired.includes('SUPABASE_URL') && !missingRequired.includes('SUPABASE_ANON_KEY'),
      supabaseServiceRole: !missingRequired.includes('SUPABASE_SERVICE_ROLE_KEY'),
      elevenlabs: warnings.length === 0,
      sentry: Boolean(sentryDsn && sentryDsn.startsWith('http'))
    }
  };
}

function getSupabaseConfig() {
  let url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  if (!url || !url.startsWith('http') || url.includes('undefined') || url.includes('your-supabase-url') || url.includes('your-project-id')) {
    url = 'https://ochbpanyltnoltelpguk.supabase.co';
  }
  url = url.replace(/\/+$/, '');

  let key = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!key || key.length < 20 || key.includes('undefined') || key.includes('your-supabase-anon-key')) {
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

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(key) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(key, recent);
    return true;
  }
  recent.push(now);
  rateLimitMap.set(key, recent);
  return false;
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
  applySecurityHeaders(req, res);

  const origin = req.headers['origin'];
  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({
      error: 'CORS_FORBIDDEN',
      message: 'Cross-Origin Request Blocked: Origin is not permitted.'
    });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const slugStr = Array.isArray(req.query?.slug) ? '/' + req.query.slug.join('/') : (req.query?.slug ? '/' + req.query.slug : '');
  const url = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || slugStr || req.url || '';

  try {
  // 1. Health check & Environment Validation
  if (url.includes('/health')) {
    const envStatus = validateRequiredEnvironment();

    return res.status(200).json({
      status: envStatus.valid ? 'ok' : 'degraded',
      service: 'InterviewBro AI Unified API',
      healthy: envStatus.valid,
      missingRequiredEnvVars: envStatus.missingRequiredEnvVars,
      warnings: envStatus.warnings,
      services: envStatus.services,
      timestamp: new Date().toISOString()
    });
  }

  // 1b. Waitlist capture endpoint (Pricing upcoming tiers with duplicate protection)
  if (url.includes('/waitlist')) {
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: 'The /api/waitlist endpoint accepts POST requests only.'
      });
    }

    const body = await parseBody(req);
    const { email, plan = 'pro' } = body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        error: 'Missing Email',
        message: 'Please provide a valid email address to join the waitlist.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: 'Invalid Email Format',
        message: 'Please provide a valid email address.'
      });
    }

    const cleanPlan = ['pro', 'unlimited'].includes(String(plan).toLowerCase())
      ? String(plan).toLowerCase()
      : 'pro';

    // Anti-spam rate limiting
    const clientIp = getClientIp(req);
    const rateLimitKey = `waitlist:${clientIp}:${cleanEmail}`;
    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Please wait a moment before submitting again.'
      });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const authKey = serviceRoleKey || supaKey;

    try {
      // Insert into Supabase waitlist table via PostgREST
      const supaRes = await fetch(`${supaUrl}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': authKey,
          'Authorization': `Bearer ${authKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          email: cleanEmail,
          plan: cleanPlan
        })
      });

      if (!supaRes.ok) {
        const text = await supaRes.text();
        // Check for 23505 (unique_violation)
        if (
          supaRes.status === 409 ||
          text.includes('23505') ||
          text.toLowerCase().includes('unique') ||
          text.toLowerCase().includes('duplicate')
        ) {
          return res.status(200).json({
            success: true,
            alreadyJoined: true,
            plan: cleanPlan,
            message: `You're already on the waitlist for the ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'} plan! We'll notify you as soon as it launches.`
          });
        }
        console.warn(`[Waitlist API] Supabase insert note (HTTP ${supaRes.status}):`, text);
      }

      return res.status(200).json({
        success: true,
        alreadyJoined: false,
        plan: cleanPlan,
        message: `Thank you! You're on the waitlist for ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'}. We'll notify you as soon as it goes live!`
      });
    } catch (err) {
      console.error('[Waitlist API] Error saving waitlist entry:', err);
      return res.status(200).json({
        success: true,
        alreadyJoined: false,
        fallback: true,
        plan: cleanPlan,
        message: `Thank you! You're on the waitlist for ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'}!`
      });
    }
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
    // Rate limiting for signup registration (HTTP 429)
    const authRateCheck = checkRateLimit(req, null, 'auth');
    if (!authRateCheck.allowed) {
      res.setHeader('Retry-After', String(authRateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: authRateCheck.message,
        retryAfter: authRateCheck.retryAfter
      });
    }

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
    const siteUrl = (body.emailRedirectTo || req.headers['origin'] || req.headers['referer'] || 'https://interviewbro-ai.vercel.app').replace(/\/+$/, '');
    const supaSignupEndpoint = `${supaUrl}/auth/v1/signup?redirect_to=${encodeURIComponent(siteUrl)}`;

    try {
      const supaRes = await fetch(supaSignupEndpoint, {
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
        interviews_remaining: 5,
        total_interviews_taken: 0,
        profile_completed: false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Supabase GoTrue returns { access_token, refresh_token, token_type, expires_in, user } when email confirmation is disabled
      let session = null;
      let token = null;

      if (data.session && data.session.access_token) {
        session = data.session;
        token = data.session.access_token;
      } else if (data.access_token) {
        session = {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          token_type: data.token_type || 'bearer',
          expires_in: data.expires_in,
          expires_at: data.expires_in ? Math.floor(Date.now() / 1000) + data.expires_in : undefined,
          user: data.user || user
        };
        token = data.access_token;
      }

      // Secondary fallback: If neither session nor access_token was returned but password is provided
      if (!token && password) {
        try {
          const loginRes = await fetch(`${supaUrl}/auth/v1/token?grant_type=password`, {
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
          if (loginRes.ok) {
            const loginData = await loginRes.json();
            if (loginData.access_token) {
              session = loginData;
              token = loginData.access_token;
            }
          }
        } catch (loginErr) {
          console.warn('[Auth API] Fallback instant login attempt failed:', loginErr.message);
        }
      }

      const requiresEmailVerification = !token;

      return res.status(200).json({
        success: true,
        user: requiresEmailVerification ? null : user,
        token: token,
        session: session,
        requiresEmailVerification,
        email: cleanEmail,
        message: requiresEmailVerification
          ? "Account created! Please check your inbox to confirm your email before logging in."
          : `Welcome to InterviewBro AI, ${cleanFullName}! Your account is ready.`
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
    // Rate limiting for login attempts (HTTP 429)
    const authRateCheck = checkRateLimit(req, null, 'auth');
    if (!authRateCheck.allowed) {
      res.setHeader('Retry-After', String(authRateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: authRateCheck.message,
        retryAfter: authRateCheck.retryAfter
      });
    }

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
        interviews_remaining: 5,
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

  // 4a. Resend Verification endpoint
  if (url.includes('/auth/resend-verification')) {
    // Rate limiting for verification resends (HTTP 429)
    const authRateCheck = checkRateLimit(req, null, 'auth');
    if (!authRateCheck.allowed) {
      res.setHeader('Retry-After', String(authRateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: authRateCheck.message,
        retryAfter: authRateCheck.retryAfter
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: `HTTP method ${req.method} is not supported on /api/auth/resend-verification. Please send a POST request with the user's email address.`
      });
    }

    const body = await parseBody(req);
    const email = body?.email;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        error: 'Missing Email',
        message: 'Please provide a valid registered email address to resend the verification link.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: 'Invalid Email Format',
        message: 'Please provide a valid email address.'
      });
    }

    // In-memory anti-spam rate limiting
    const clientIp = getClientIp(req);
    const rateLimitKey = `${clientIp}:${cleanEmail}`;
    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many verification email requests. Please wait a minute before requesting another link.',
        code: 'over_email_send_rate_limit',
        isRateLimit: true
      });
    }

    console.log(`[Auth API] Resend verification link requested for ${maskEmail(cleanEmail)}`);

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const siteUrl = (req.headers['origin'] || req.headers['referer'] || 'https://interviewbro-ai.vercel.app').replace(/\/+$/, '');

    try {
      const supaEndpoint = `${supaUrl}/auth/v1/resend?redirect_to=${encodeURIComponent(siteUrl)}`;
      const supaRes = await fetch(supaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supaKey,
          'Authorization': `Bearer ${supaKey}`
        },
        body: JSON.stringify({
          type: 'signup',
          email: cleanEmail
        })
      });

      const text = await supaRes.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text || '' };
      }

      if (!supaRes.ok) {
        console.warn(`[Auth API] Supabase resend verification rejected for ${maskEmail(cleanEmail)}: HTTP ${supaRes.status}`, {
          code: data.code || data.error_code,
          msg: data.msg || data.error_description || data.message || data.error
        });

        const errorCode = data.error_code || data.code;
        const rawMsg = String(data.msg || data.error_description || data.message || data.error || '');
        const rawLower = rawMsg.toLowerCase();

        let friendlyMsg = 'Failed to resend verification email. Please try again.';
        let statusCode = supaRes.status;

        if (
          statusCode === 429 ||
          errorCode === 'over_email_send_rate_limit' ||
          errorCode === 'rate_limit_exceeded' ||
          rawLower.includes('rate limit') ||
          rawLower.includes('too many')
        ) {
          statusCode = 429;
          friendlyMsg = 'Too many verification email requests. Supabase email limits are active. Please wait a few minutes before trying again.';
        } else if (
          rawLower.includes('already confirmed') ||
          rawLower.includes('already verified') ||
          errorCode === 'email_address_already_confirmed'
        ) {
          return res.status(200).json({
            success: true,
            alreadyVerified: true,
            message: 'Your email is already verified! You can sign in directly with your password.'
          });
        } else if (rawLower.includes('user not found') || errorCode === 'user_not_found') {
          friendlyMsg = `If an account with ${cleanEmail} exists and requires verification, a link has been sent. Please check your inbox and spam folder.`;
          return res.status(200).json({
            success: true,
            message: friendlyMsg
          });
        }

        return res.status(statusCode).json({
          error: data.msg || data.error_description || data.error || 'Resend verification failed',
          message: friendlyMsg,
          code: errorCode,
          isRateLimit: statusCode === 429
        });
      }

      console.log(`[Auth API] Supabase resend verification succeeded for ${maskEmail(cleanEmail)}`);

      return res.status(200).json({
        success: true,
        message: `Verification link has been resent to ${cleanEmail}. Please check your inbox and spam folder.`
      });
    } catch (err) {
      console.error(`[Auth API] Serverless exception during resend verification for ${maskEmail(cleanEmail)}:`, err.message || err);
      return res.status(500).json({
        error: 'Authentication server error',
        message: 'Could not connect to Supabase Auth service. Please try again later.',
        details: err?.message || String(err)
      });
    }
  }

  // 4b. Delete Account endpoint (DPDP Act 2023 compliance)
  if (url.includes('/auth/delete-account')) {
    return deleteAccountHandler(req, res);
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

  // 6. Gemini AI Endpoints
  if (url.includes('/ai/status')) {
    const isConfigured = getIsGeminiConfigured();
    return res.status(200).json({
      status: 'ok',
      isGeminiConfigured: isConfigured,
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest'
    });
  }

  if (url.includes('/ai/questions')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 1. Mandatory Supabase Authentication (HTTP 401)
    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const auth = await authenticateRequest(req, supaUrl, supaKey);
    if (!auth.authenticated) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: auth.message || 'Authentication required to start mock interviews.'
      });
    }

    // 2. Per-User and Per-IP Rate Limiting (HTTP 429)
    const rateCheck = checkRateLimit(req, auth.user.id, 'ai');
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: rateCheck.message,
        retryAfter: rateCheck.retryAfter
      });
    }

    // 3. Atomic Quota Consumption on Session Start (HTTP 402)
    const quotaCheck = await consumeQuotaOnSessionStart(auth.user.id, supaUrl, supaKey, serviceRoleKey);
    if (!quotaCheck.allowed) {
      return res.status(402).json({
        error: 'QUOTA_EXCEEDED',
        message: quotaCheck.message,
        used: quotaCheck.used,
        limit: quotaCheck.limit
      });
    }

    if (!getIsGeminiConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY is not configured in environment variables.'
      });
    }

    const body = await parseBody(req);
    const { previousQuestions, adaptiveContext, ...config } = body || {};

    // Cap question count between 1 and 10
    config.questionCount = Math.min(10, Math.max(1, Number(config.questionCount) || 5));

    try {
      const mergedConfig = { ...config, adaptiveContext };
      const questions = await geminiService.generateInterviewQuestions(mergedConfig, previousQuestions || []);
      return res.status(200).json({ success: true, questions, source: 'gemini', quota: { used: quotaCheck.used, remaining: quotaCheck.remaining, limit: quotaCheck.limit } });
    } catch (err) {
      if (err.code === 'AI_TIMEOUT' || err.name === 'AbortError') {
        return res.status(504).json({ error: 'AI_TIMEOUT', message: 'Question generation timed out after 25s.' });
      }
      return res.status(500).json({ error: 'AI_ERROR', message: err.message });
    }
  }

  if (url.includes('/ai/evaluate')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const auth = await authenticateRequest(req, supaUrl, supaKey);
    if (!auth.authenticated) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: auth.message || 'Authentication required to evaluate answers.'
      });
    }

    const rateCheck = checkRateLimit(req, auth.user.id, 'ai');
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: rateCheck.message,
        retryAfter: rateCheck.retryAfter
      });
    }

    const quotaCheck = await verifyUserQuotaAvailable(auth.user.id, supaUrl, supaKey, serviceRoleKey);
    if (!quotaCheck.allowed) {
      return res.status(402).json({
        error: 'QUOTA_EXCEEDED',
        message: quotaCheck.message,
        used: quotaCheck.used,
        limit: quotaCheck.limit
      });
    }

    if (!getIsGeminiConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY is not configured in environment variables. Scores are never fabricated.'
      });
    }

    const body = await parseBody(req);
    const { question, answer, config } = body || {};

    if (!question || !answer) {
      return res.status(400).json({ error: 'Missing question or answer' });
    }

    // Cap answer length
    const safeAnswer = String(answer).slice(0, 4000);

    try {
      const evaluation = await geminiService.evaluateCandidateAnswer(question, safeAnswer, config || {});
      return res.status(200).json({ success: true, evaluation, source: 'gemini' });
    } catch (err) {
      if (err.code === 'AI_TIMEOUT' || err.name === 'AbortError') {
        return res.status(504).json({ error: 'AI_TIMEOUT', message: 'Answer evaluation timed out after 25s.' });
      }
      if (err.code === 'INVALID_RUBRIC_EVALUATION') {
        return res.status(422).json({ error: 'INVALID_RUBRIC_EVALUATION', message: err.message });
      }
      return res.status(500).json({ error: 'AI_ERROR', message: err.message });
    }
  }

  if (url.includes('/ai/follow-up')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const auth = await authenticateRequest(req, supaUrl, supaKey);
    if (!auth.authenticated) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: auth.message || 'Authentication required for AI follow-up questions.'
      });
    }

    const rateCheck = checkRateLimit(req, auth.user.id, 'ai');
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: rateCheck.message,
        retryAfter: rateCheck.retryAfter
      });
    }

    const quotaCheck = await verifyUserQuotaAvailable(auth.user.id, supaUrl, supaKey, serviceRoleKey);
    if (!quotaCheck.allowed) {
      return res.status(402).json({
        error: 'QUOTA_EXCEEDED',
        message: quotaCheck.message,
        used: quotaCheck.used,
        limit: quotaCheck.limit
      });
    }

    if (!getIsGeminiConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY is not configured in environment variables.'
      });
    }

    const body = await parseBody(req);
    const { question, answer, config, previousQuestions, previousScore, conversationHistory } = body || {};

    if (!question || !answer) {
      return res.status(400).json({ error: 'Missing question or answer' });
    }

    const safeAnswer = String(answer).slice(0, 4000);

    try {
      const followUp = await geminiService.generateFollowUpQuestion(
        question,
        safeAnswer,
        config || {},
        previousQuestions || [],
        previousScore,
        conversationHistory || []
      );
      return res.status(200).json({ success: true, followUp, source: 'gemini' });
    } catch (err) {
      if (err.code === 'AI_TIMEOUT' || err.name === 'AbortError') {
        return res.status(504).json({ error: 'AI_TIMEOUT', message: 'Follow-up question generation timed out after 25s.' });
      }
      return res.status(500).json({ error: 'AI_ERROR', message: err.message });
    }
  }

  if (url.includes('/ai/final-report') || url.includes('/ai/report')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const auth = await authenticateRequest(req, supaUrl, supaKey);
    if (!auth.authenticated) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: auth.message || 'Authentication required to generate evaluation report.'
      });
    }

    const rateCheck = checkRateLimit(req, auth.user.id, 'ai');
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: rateCheck.message,
        retryAfter: rateCheck.retryAfter
      });
    }

    const quotaCheck = await verifyUserQuotaAvailable(auth.user.id, supaUrl, supaKey, serviceRoleKey);
    if (!quotaCheck.allowed) {
      return res.status(402).json({
        error: 'QUOTA_EXCEEDED',
        message: quotaCheck.message,
        used: quotaCheck.used,
        limit: quotaCheck.limit
      });
    }

    if (!getIsGeminiConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY is not configured in environment variables.'
      });
    }

    const body = await parseBody(req);
    const { questions, config, candidateName } = body || {};

    const safeQuestions = Array.isArray(questions) ? questions.slice(0, 15) : [];

    try {
      const report = await geminiService.generateComprehensiveReport(safeQuestions, config || {}, candidateName || 'Candidate');
      const finalReport = { ...report, source: 'ai' };
      return res.status(200).json({ success: true, report: finalReport, source: 'ai' });
    } catch (err) {
      if (err.code === 'AI_TIMEOUT' || err.name === 'AbortError') {
        return res.status(504).json({ error: 'AI_TIMEOUT', message: 'Report synthesis timed out after 25s.' });
      }
      return res.status(500).json({ error: 'AI_ERROR', message: err.message });
    }
  }

  // 6b. Interview Academy AI Practice Coach Endpoint
  if (url.includes('/ai/coach')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();

    // Optional Authentication: Supports authenticated users and guests
    let userId = null;
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ') && authHeader.length > 15) {
      const auth = await authenticateRequest(req, supaUrl, supaKey);
      if (auth.authenticated && auth.user) {
        userId = auth.user.id;
      }
    }

    // Rate Limiting (15 req/min for IP, 25 req/min for signed-in user)
    const rateCheck = checkRateLimit(req, userId, 'coach');
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: rateCheck.message,
        retryAfter: rateCheck.retryAfter
      });
    }

    const body = await parseBody(req);
    const { question, answer, options } = body || {};

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return res.status(400).json({
        error: 'MISSING_ANSWER',
        message: 'Please provide your draft interview answer to receive AI coaching.'
      });
    }

    if (!question) {
      return res.status(400).json({
        error: 'MISSING_QUESTION',
        message: 'Please specify the interview question being practiced.'
      });
    }

    if (!getIsGeminiConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'GEMINI_API_KEY is not configured in environment variables. Practice coaching scores will not be fabricated.'
      });
    }

    const safeAnswer = String(answer).slice(0, 4000);

    try {
      const feedback = await geminiService.generateCoachFeedback(question, safeAnswer, options || {});
      return res.status(200).json({
        success: true,
        feedback,
        source: 'gemini'
      });
    } catch (err) {
      if (err.code === 'AI_TIMEOUT' || err.name === 'AbortError') {
        return res.status(504).json({ error: 'AI_TIMEOUT', message: 'Coach feedback generation timed out after 30s. Please try again.' });
      }
      return res.status(500).json({ error: 'AI_ERROR', message: err.message || 'An error occurred while generating feedback.' });
    }
  }

  // 7. Resume Parse & Analysis Endpoint (Serverless Base64 / 5MB Limit)
  if (url.includes('/resume/parse')) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { url: supaUrl, key: supaKey } = getSupabaseConfig();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    const auth = await authenticateRequest(req, supaUrl, supaKey);
    if (!auth.authenticated) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: auth.message || 'Authentication required to scan resume.'
      });
    }

    const rateCheck = checkRateLimit(req, auth.user.id, 'resume');
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', String(rateCheck.retryAfter || 60));
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: rateCheck.message,
        retryAfter: rateCheck.retryAfter
      });
    }

    const quotaCheck = await verifyUserQuotaAvailable(auth.user.id, supaUrl, supaKey, serviceRoleKey);
    if (!quotaCheck.allowed) {
      return res.status(402).json({
        error: 'QUOTA_EXCEEDED',
        message: quotaCheck.message,
        used: quotaCheck.used,
        limit: quotaCheck.limit
      });
    }

    const body = await parseBody(req);
    const { fileBase64, fileName, fileType, fileSize, targetRole } = body || {};

    if (!fileBase64) {
      return res.status(400).json({
        error: 'MISSING_FILE',
        message: 'Resume file must be uploaded as a base64 string (fileBase64).'
      });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    const cleanRole = targetRole || 'Software Engineer';
    const cleanFileName = fileName || 'resume.pdf';
    const cleanMime = fileType || 'application/pdf';

    // Comprehensive file format, MIME type, and magic bytes verification
    const fileValidation = await validateResumeFile(buffer, cleanFileName, cleanMime);
    if (!fileValidation.valid) {
      const statusCode = fileValidation.error === 'FILE_TOO_LARGE' ? 413 : 400;
      return res.status(statusCode).json({
        error: fileValidation.error,
        message: fileValidation.message
      });
    }

    try {
      const extractedText = await resumeParser.extractText(buffer, cleanMime, cleanFileName);
      const analysis = await resumeParser.analyze(extractedText, cleanRole, cleanFileName, buffer.length);
      return res.status(200).json({ success: true, analysis });
    } catch (err) {
      console.error('[Resume API] Parsing error:', err);
      const isCorrupted = err.code === 'CORRUPTED_PDF' || err.code === 'CORRUPTED_DOCX' || err.code === 'EMPTY_DOCUMENT' || err.code === 'INVALID_TEXT_ENCODING';
      return res.status(isCorrupted ? 400 : 500).json({ error: isCorrupted ? 'DOCUMENT_PARSE_ERROR' : 'PARSE_FAILED', message: err.message || 'Failed to parse resume.' });
    }
  }

  // 8. Generic API Fallback
  return res.status(200).json({
    status: 'ok',
    service: 'InterviewBro AI Serverless API',
    endpoint: url,
    timestamp: new Date().toISOString()
  });
  } catch (unhandledErr) {
    console.error('[API Handler Unhandled Error]:', unhandledErr);
    await captureServerlessError(unhandledErr, req);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected server error occurred.'
      });
    }
  }
}
