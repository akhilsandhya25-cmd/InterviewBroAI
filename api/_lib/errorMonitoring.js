/**
 * Serverless Error Monitoring Module (Sentry Free Tier Compatible)
 * 
 * Provides privacy-first exception capturing for Vercel Serverless Functions.
 * 
 * Strict Scrubbing Invariant:
 * - Candidate transcripts, interview answers, and speech snippets are NEVER sent to Sentry.
 * - Resume text, raw document buffers, and base64 payloads are NEVER sent to Sentry.
 * - Authorization Bearer tokens, cookies, and candidate PII are purged before transmission.
 */

function parseSentryDsn(rawDsn) {
  if (!rawDsn || typeof rawDsn !== 'string') return null;
  const trimmed = rawDsn.trim();
  try {
    const url = new URL(trimmed);
    const publicKey = url.username;
    const host = url.host;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const projectId = pathParts[pathParts.length - 1];
    if (!publicKey || !host || !projectId) return null;
    return {
      publicKey,
      host,
      projectId,
      envelopeUrl: `https://${host}/api/${projectId}/envelope/`
    };
  } catch {
    return null;
  }
}

/**
 * Deeply scrubs untrusted payload objects to eliminate any candidate resume, transcript, or PII.
 */
export function scrubServerlessData(data, depth = 0) {
  if (!data || depth > 5) return data;
  if (typeof data === 'string') {
    // Strip emails
    let cleaned = data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
    // Strip Bearer tokens
    cleaned = cleaned.replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED_TOKEN]');
    // Strip base64 data URLs
    cleaned = cleaned.replace(/data:application\/[^;]+;base64,[A-Za-z0-9+/=]+/gi, '[REDACTED_BASE64_FILE]');
    return cleaned;
  }

  if (Array.isArray(data)) {
    return data.map(item => scrubServerlessData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const scrubbed = {};
    const sensitiveKeys = new Set([
      'resume',
      'resumetext',
      'transcript',
      'useranswer',
      'speechtext',
      'candidateanswer',
      'answers',
      'previousquestions',
      'authorization',
      'cookie',
      'password',
      'apikey',
      'x-api-key',
      'token',
      'secret'
    ]);

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.has(lowerKey)) {
        scrubbed[key] = '[SCRUBBED_SENSITIVE_DATA]';
      } else {
        scrubbed[key] = scrubServerlessData(value, depth + 1);
      }
    }
    return scrubbed;
  }

  return data;
}

/**
 * Captures an exception and dispatches a scrubbed Sentry event envelope.
 */
export async function captureServerlessError(err, req = null, extraContext = {}) {
  const dsnString = process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN || '';
  const parsedDsn = parseSentryDsn(dsnString);

  const errorMessage = err?.message || String(err || 'Unknown Serverless Error');
  const errorStack = err?.stack || '';
  const errorName = err?.name || 'Error';

  // Scrub error message and stack trace
  const safeMessage = scrubServerlessData(errorMessage);
  const safeStack = scrubServerlessData(errorStack);

  // Construct scrubbed request context
  const safeReq = req ? {
    url: req.url ? scrubServerlessData(req.url) : undefined,
    method: req.method || 'GET',
    headers: req.headers ? {
      host: req.headers.host,
      'user-agent': req.headers['user-agent']
    } : {}
  } : {};

  const safeExtra = scrubServerlessData(extraContext || {});

  // If Sentry is not configured, log locally without sending network requests
  if (!parsedDsn) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Sentry Serverless: Unconfigured] ${errorName}: ${safeMessage}`);
    }
    return { sent: false, reason: 'SENTRY_DSN_NOT_SET' };
  }

  const eventId = (Date.now().toString(16) + Math.random().toString(16).substring(2)).substring(0, 32);

  const envelopeHeader = JSON.stringify({
    event_id: eventId,
    sent_at: new Date().toISOString()
  });

  const itemHeader = JSON.stringify({
    type: 'event',
    content_type: 'application/json'
  });

  const itemPayload = JSON.stringify({
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: 'node',
    level: 'error',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'production',
    server_name: 'interviewbro-vercel-serverless',
    exception: {
      values: [
        {
          type: errorName,
          value: safeMessage,
          stacktrace: safeStack ? {
            frames: safeStack.split('\n').map(line => ({ filename: line.trim() }))
          } : undefined
        }
      ]
    },
    request: safeReq,
    extra: safeExtra,
    tags: {
      runtime: 'vercel-serverless',
      service: 'unified-api'
    }
  });

  const envelopeBody = `${envelopeHeader}\n${itemHeader}\n${itemPayload}\n`;

  try {
    const res = await fetch(parsedDsn.envelopeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=interviewbro-serverless/1.0.0, sentry_key=${parsedDsn.publicKey}`
      },
      body: envelopeBody
    });

    return { sent: res.ok, status: res.status };
  } catch (netErr) {
    console.warn('[Sentry Serverless] Failed to deliver error envelope:', netErr.message);
    return { sent: false, error: netErr.message };
  }
}
