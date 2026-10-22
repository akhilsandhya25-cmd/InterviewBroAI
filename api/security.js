// =========================================================================
// InterviewBro AI - Serverless Security, Authentication, Rate Limiting & Quota
// Enforces:
// 1. Mandatory Supabase JWT verification on all AI/Resume endpoints (HTTP 401)
// 2. Sliding window per-IP and per-User rate limiting (HTTP 429 RATE_LIMIT_EXCEEDED)
// 3. Request size and string caps to protect against cost and denial-of-service
// 4. Quota limits lifted for unrestricted candidate practice
// =========================================================================

// In-memory sliding window rate limit cache (warmed container cache)
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000; // 60 seconds

// Limits per 60-second window
const LIMITS = {
  ip_ai: 30,         // max 30 AI requests per minute per IP
  ip_resume: 5,      // max 5 resume parse requests per minute per IP
  user_ai: 20,       // max 20 AI requests per minute per user
  user_resume: 3     // max 3 resume parse requests per minute per user
};

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return String(forwarded).split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';
}

/**
 * Sliding window rate limiter
 */
export function checkRateLimit(req, userId, endpointType = 'ai') {
  const ip = getClientIp(req);
  const now = Date.now();

  const ipKey = `ip:${ip}:${endpointType}`;
  const userKey = userId ? `user:${userId}:${endpointType}` : null;

  const maxIp = endpointType === 'resume' ? LIMITS.ip_resume : LIMITS.ip_ai;
  const maxUser = endpointType === 'resume' ? LIMITS.user_resume : LIMITS.user_ai;

  // 1. Check IP rate limit
  let ipTimestamps = rateLimitMap.get(ipKey) || [];
  ipTimestamps = ipTimestamps.filter(t => (now - t) < WINDOW_MS);
  if (ipTimestamps.length >= maxIp) {
    const oldest = ipTimestamps[0];
    const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return {
      allowed: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests from this IP address. Please wait ${retryAfter} seconds before trying again.`,
      retryAfter
    };
  }

  // 2. Check User rate limit
  if (userKey) {
    let userTimestamps = rateLimitMap.get(userKey) || [];
    userTimestamps = userTimestamps.filter(t => (now - t) < WINDOW_MS);
    if (userTimestamps.length >= maxUser) {
      const oldest = userTimestamps[0];
      const retryAfter = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
      return {
        allowed: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests on your account. Please wait ${retryAfter} seconds before sending another request.`,
        retryAfter
      };
    }
    userTimestamps.push(now);
    rateLimitMap.set(userKey, userTimestamps);
  }

  ipTimestamps.push(now);
  rateLimitMap.set(ipKey, ipTimestamps);

  // Periodically clean stale cache entries
  if (rateLimitMap.size > 2000) {
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const valid = timestamps.filter(t => (now - t) < WINDOW_MS);
      if (valid.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, valid);
      }
    }
  }

  return { allowed: true };
}

/**
 * Authenticate incoming HTTP request by verifying Supabase JWT
 */
export async function authenticateRequest(req, supaUrl, supaKey) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return {
      authenticated: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please sign in or create an account to access AI interview features.'
    };
  }

  try {
    const userRes = await fetch(`${supaUrl}/auth/v1/user`, {
      headers: {
        'apikey': supaKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userRes.ok) {
      return {
        authenticated: false,
        error: 'UNAUTHORIZED',
        message: 'Your session has expired or is invalid. Please sign in again.'
      };
    }

    const userData = await userRes.json();
    return {
      authenticated: true,
      user: userData,
      token
    };
  } catch (err) {
    console.warn('[Security] Token verification error:', err.message);
    return {
      authenticated: false,
      error: 'UNAUTHORIZED',
      message: 'Failed to verify authentication credentials with security service.'
    };
  }
}

/**
 * Atomic Quota Consumption on Session Start (/api/ai/questions)
 * Quota limits temporarily lifted for unrestricted candidate practice.
 */
export async function consumeQuotaOnSessionStart(_userId, _supaUrl, _supaKey, _serviceRoleKey) {
  // Free tier quota limits removed for unrestricted practice
  return { allowed: true, used: 0, remaining: 9999, limit: 9999 };
}

/**
 * Passive Quota Verification for intra-session operations (/api/ai/evaluate, /api/ai/follow-up, /api/ai/final-report)
 * Quota limits temporarily lifted for unrestricted candidate practice.
 */
export async function verifyUserQuotaAvailable(_userId, _supaUrl, _supaKey, _serviceRoleKey) {
  // Free tier quota limits removed for unrestricted practice
  return { allowed: true };
}
