// =========================================================================
// InterviewBro AI - Serverless Security, Authentication, Rate Limiting & Quota
// Enforces:
// 1. Mandatory Supabase JWT verification on all AI/Resume endpoints (HTTP 401)
// 2. Sliding window per-IP and per-User rate limiting (HTTP 429 RATE_LIMIT_EXCEEDED)
// 3. Strict authentication rate limiting on login/signup to prevent brute force
// 4. IP spoofing protection prioritizing edge-verified headers over raw X-Forwarded-For
// 5. Strict origin-whitelisted CORS (no wildcards) and HTTP response security headers
// 6. Resume file validation, PDF magic bytes, ZIP bomb guards & prompt delimiter escaping
// 7. Quota limits lifted for unrestricted candidate practice
// =========================================================================

import path from 'path';
import net from 'net';
import JSZip from 'jszip';

// In-memory sliding window rate limit cache (warmed container cache)
const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000; // 60 seconds

// Limits per 60-second window
const LIMITS = {
  ip_ai: 30,         // max 30 AI requests per minute per IP
  ip_resume: 5,      // max 5 resume parse requests per minute per IP
  ip_coach: 15,      // max 15 practice coach queries per minute per IP
  ip_auth: 10,       // max 10 auth requests per minute per IP (prevents credential stuffing & spam)
  user_ai: 20,       // max 20 AI requests per minute per user
  user_resume: 3,    // max 3 resume parse requests per minute per user
  user_coach: 25,    // max 25 practice coach queries per minute per user
  user_auth: 10      // max 10 auth requests per minute per user
};

// Strict list of explicitly authorized origins
export const TRUSTED_ORIGINS = new Set([
  'https://interviewbro-ai.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:4174',
  'http://127.0.0.1:4175',
  'http://127.0.0.1:5000'
]);

/**
 * Checks whether an incoming origin is explicitly authorized
 */
export function isAllowedOrigin(origin) {
  if (!origin || typeof origin !== 'string') return false;
  return TRUSTED_ORIGINS.has(origin);
}

/**
 * Validates whether a string is a legitimate IPv4 or IPv6 address.
 */
export function isValidIp(ip) {
  if (!ip || typeof ip !== 'string') return false;
  const clean = ip.trim().replace(/^::ffff:/i, '');
  return net.isIP(clean) !== 0 || net.isIP(ip.trim()) !== 0;
}

/**
 * Spoofing-resistant client IP extraction.
 * For Vercel deployments, strictly trusts the edge-injected and sanitized x-real-ip header.
 * Discards user-controlled x-forwarded-for headers completely to prevent rate-limit bypass.
 * Falls back strictly to direct TCP socket remoteAddress.
 */
export function getClientIp(req) {
  // 1. Primary for Vercel deployments: x-real-ip (injected and sanitized by Vercel edge proxy)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    const cleanReal = String(realIp).trim();
    if (isValidIp(cleanReal)) {
      return cleanReal.replace(/^::ffff:/i, '');
    }
  }

  // 2. Safe fallback: direct TCP socket remoteAddress (discards untrusted forwarded headers)
  const remote = req.socket?.remoteAddress;
  if (remote) {
    const cleanRemote = String(remote).trim();
    if (isValidIp(cleanRemote)) {
      return cleanRemote.replace(/^::ffff:/i, '');
    }
  }

  return '127.0.0.1';
}

/**
 * Applies strict origin-whitelisted CORS and HTTP Security headers to API responses
 */
export function applySecurityHeaders(req, res) {
  const origin = req.headers['origin'];

  if (origin) {
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    // Set Vary: Origin so intermediate caches distinguish responses by origin
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

/**
 * Sliding window rate limiter
 */
export function checkRateLimit(req, userId, endpointType = 'ai') {
  const ip = getClientIp(req);
  const now = Date.now();

  const ipKey = `ip:${ip}:${endpointType}`;
  const userKey = userId ? `user:${userId}:${endpointType}` : null;

  const maxIp = endpointType === 'resume' ? LIMITS.ip_resume 
    : endpointType === 'coach' ? LIMITS.ip_coach 
    : endpointType === 'auth' ? LIMITS.ip_auth 
    : LIMITS.ip_ai;

  const maxUser = endpointType === 'resume' ? LIMITS.user_resume 
    : endpointType === 'coach' ? LIMITS.user_coach 
    : endpointType === 'auth' ? LIMITS.user_auth 
    : LIMITS.user_ai;

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
 * Inspects ZIP header structure using JSZip for ZIP bomb indicators, decompression safety limits,
 * and verifies genuine DOCX structure (word/document.xml).
 */
export async function inspectZipContainer(buffer) {
  const MAX_ENTRIES = 200;
  const MAX_TOTAL_UNCOMPRESSED = 25 * 1024 * 1024; // 25MB max uncompressed

  try {
    const zip = await JSZip.loadAsync(buffer);
    const fileNames = Object.keys(zip.files);
    const entryCount = fileNames.length;

    if (entryCount > MAX_ENTRIES) {
      return { safe: false, reason: 'Archive contains too many entries (potential zip bomb).' };
    }

    let totalUncompressedSize = 0;
    let hasWordDocument = false;

    for (const name of fileNames) {
      const entry = zip.files[name];
      // DOCX standard (ISO/IEC 29500-1) specifies word/document.xml relative to the archive root
      if (name === 'word/document.xml' || name === 'word\\document.xml') {
        hasWordDocument = true;
      }

      const uncompressed = (entry._data && typeof entry._data.uncompressedSize === 'number') ? entry._data.uncompressedSize : 0;
      const compressed = (entry._data && typeof entry._data.compressedSize === 'number') ? entry._data.compressedSize : 0;

      // Check for excessive compression ratios (>100:1 on entries > 10KB)
      if (compressed > 10240 && (uncompressed / compressed) > 100) {
        return { safe: false, reason: 'Suspicious archive compression ratio detected.' };
      }

      totalUncompressedSize += uncompressed;
      if (totalUncompressedSize > MAX_TOTAL_UNCOMPRESSED) {
        return { safe: false, reason: 'Archive decompressed size exceeds maximum safety limit (25MB).' };
      }
    }

    // Do not assume a successfully parsed ZIP is a safe DOCX - must contain Word processing XML
    if (!hasWordDocument) {
      return { safe: false, reason: 'Archive is not a valid DOCX document (missing word/document.xml).' };
    }

    return { safe: true, entryCount, totalUncompressedSize };
  } catch (err) {
    return { safe: false, reason: 'Malformed or unreadable DOCX archive: ' + err.message };
  }
}

/**
 * Validates uploaded resume buffers for file size, permitted extension, MIME type, magic bytes,
 * and protects against executable payloads and ZIP bombs.
 */
export async function validateResumeFile(buffer, fileName = '', mimeType = '') {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { valid: false, error: 'INVALID_FILE', message: 'No valid file buffer received.' };
  }

  // Prevent path traversal in file names
  const cleanName = path.basename(fileName || '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const lowerName = cleanName.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase().trim();

  // Reject executable or script file extensions immediately regardless of size
  const disallowedExts = ['.exe', '.sh', '.bat', '.cmd', '.js', '.mjs', '.vbs', '.html', '.htm', '.php', '.py', '.svg', '.jar', '.com', '.msi'];
  if (disallowedExts.some(ext => lowerName.endsWith(ext))) {
    return {
      valid: false,
      error: 'DISALLOWED_EXTENSION',
      message: 'Executable, script, or markup files cannot be parsed as a resume.'
    };
  }

  if (buffer.length < 10) {
    return { valid: false, error: 'FILE_TOO_SMALL', message: 'The uploaded file is too small to be a valid document.' };
  }

  if (buffer.length > 5 * 1024 * 1024) {
    return { valid: false, error: 'FILE_TOO_LARGE', message: 'Resume file size exceeds the 5MB limit.' };
  }

  const allowedExts = ['.pdf', '.docx', '.txt'];
  const hasAllowedExt = allowedExts.some(ext => lowerName.endsWith(ext));

  // Reject unsupported extensions immediately
  if (!hasAllowedExt) {
    return {
      valid: false,
      error: 'UNSUPPORTED_FILE_TYPE',
      message: 'Unsupported file extension. Please upload a PDF, DOCX, or plain text (.txt) resume.'
    };
  }

  // Account for browsers that omit MIME type or send generic application/octet-stream
  const genericMimes = ['', 'application/octet-stream'];
  const isGenericMime = genericMimes.includes(lowerMime);

  const recognizedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  const isRecognizedMime = recognizedMimes.some(m => lowerMime.includes(m));

  // If a specific MIME type is provided, it must be recognized
  if (!isGenericMime && !isRecognizedMime) {
    return {
      valid: false,
      error: 'UNSUPPORTED_MIME_TYPE',
      message: 'Unsupported file MIME type. Please upload a PDF, DOCX, or plain text (.txt) resume.'
    };
  }

  // Verify consistency between extension and specific MIME type
  if (!isGenericMime) {
    if (lowerName.endsWith('.pdf') && (lowerMime.includes('word') || lowerMime.includes('text/plain'))) {
      return { valid: false, error: 'MIME_EXTENSION_MISMATCH', message: 'MIME type does not match the .pdf file extension.' };
    }
    if (lowerName.endsWith('.docx') && (lowerMime.includes('pdf') || lowerMime.includes('text/plain'))) {
      return { valid: false, error: 'MIME_EXTENSION_MISMATCH', message: 'MIME type does not match the .docx file extension.' };
    }
    if (lowerName.endsWith('.txt') && (lowerMime.includes('pdf') || lowerMime.includes('word'))) {
      return { valid: false, error: 'MIME_EXTENSION_MISMATCH', message: 'MIME type does not match the .txt file extension.' };
    }
  }

  // 1. PDF: Must start with %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  if (lowerName.endsWith('.pdf') || lowerMime === 'application/pdf') {
    const magic = buffer.slice(0, 5).toString('ascii');
    if (magic !== '%PDF-') {
      return {
        valid: false,
        error: 'CORRUPTED_PDF',
        message: 'The uploaded file does not match a valid PDF file signature (%PDF-).'
      };
    }
  }

  // 2. DOCX: Must start with ZIP header PK\x03\x04 (0x50, 0x4B, 0x03, 0x04)
  if (lowerName.endsWith('.docx') || lowerMime.includes('wordprocessingml')) {
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4B || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      return {
        valid: false,
        error: 'CORRUPTED_DOCX',
        message: 'The uploaded file does not match a valid DOCX file signature.'
      };
    }

    const zipInspection = await inspectZipContainer(buffer);
    if (!zipInspection.safe) {
      return {
        valid: false,
        error: 'UNSAFE_ARCHIVE',
        message: zipInspection.reason || 'The archive structure appears corrupted or exceeds safety limits.'
      };
    }
  }

  // 3. Plain text (.txt): Reject binary null bytes or non-printable control characters
  if (lowerName.endsWith('.txt') || lowerMime === 'text/plain') {
    const sampleLength = Math.min(buffer.length, 4096);
    for (let i = 0; i < sampleLength; i++) {
      const b = buffer[i];
      if (b === 0x00 || (b < 0x09 && b !== 0x00) || (b > 0x0D && b < 0x20 && b !== 0x1B)) {
        return {
          valid: false,
          error: 'INVALID_TEXT_ENCODING',
          message: 'The plain text file contains binary null or non-printable control characters.'
        };
      }
    }
  }

  return { valid: true };
}

/**
 * Escapes prompt delimiter tags to prevent delimiter-breaking prompt injection
 */
export function sanitizeForPrompt(text) {
  if (!text) return '';
  return String(text)
    .replace(/<<<.*?>>>/g, '')
    .replace(/\[\/?UNTRUSTED_.*?\]/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

/**
 * Atomic Quota Consumption on Session Start (/api/ai/questions)
 * Quota limits temporarily lifted for unrestricted candidate practice.
 */
export async function consumeQuotaOnSessionStart(_userId, _supaUrl, _supaKey, _serviceRoleKey) {
  return { allowed: true, used: 0, remaining: 9999, limit: 9999 };
}

/**
 * Passive Quota Verification for intra-session operations (/api/ai/evaluate, /api/ai/follow-up, /api/ai/final-report)
 * Quota limits temporarily lifted for unrestricted candidate practice.
 */
export async function verifyUserQuotaAvailable(_userId, _supaUrl, _supaKey, _serviceRoleKey) {
  return { allowed: true };
}
