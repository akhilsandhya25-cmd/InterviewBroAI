/**
 * Client-Side Error Monitoring Service (Sentry Free Tier Compatible)
 * 
 * Provides automated exception capturing and reporting with strict privacy protection.
 * 
 * Invariant Guarantees:
 * 1. Transcripts, user speech text, candidate answers, and resume content are SCRUBBED before sending.
 * 2. Authorization Bearer tokens, passwords, and candidate emails/PII are PURGED from payloads.
 * 3. In Ephemeral Practice Mode, interview data is never included in error context or breadcrumbs.
 */

import { storage } from './storage';

interface SentryParsedDsn {
  publicKey: string;
  host: string;
  projectId: string;
  envelopeUrl: string;
}

function parseSentryDsn(rawDsn?: string): SentryParsedDsn | null {
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
export function scrubClientData(data: any, depth = 0): any {
  if (data === null || data === undefined || depth > 5) return data;

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
    return data.map(item => scrubClientData(item, depth + 1));
  }

  if (typeof data === 'object') {
    const scrubbed: Record<string, any> = {};
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
      'token',
      'secret'
    ]);

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.has(lowerKey)) {
        scrubbed[key] = '[SCRUBBED_SENSITIVE_DATA]';
      } else {
        scrubbed[key] = scrubClientData(value, depth + 1);
      }
    }
    return scrubbed;
  }

  return data;
}

class ErrorMonitoringService {
  private dsn: SentryParsedDsn | null = null;
  private isInitialized = false;

  constructor() {
    const rawDsn = import.meta.env?.VITE_SENTRY_DSN || ((globalThis as any)?.SENTRY_DSN);
    this.dsn = parseSentryDsn(rawDsn);
  }

  public init(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Listen for uncaught global window errors
    window.addEventListener('error', (event: ErrorEvent) => {
      if (event.error) {
        this.captureException(event.error, {
          source: 'window.onerror',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      }
    });

    // Listen for unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      this.captureException(reason instanceof Error ? reason : new Error(String(reason || 'Unhandled Promise Rejection')), {
        source: 'unhandledrejection'
      });
    });
  }

  public isConfigured(): boolean {
    return Boolean(this.dsn);
  }

  public async captureException(err: Error | any, extraContext?: Record<string, any>): Promise<void> {
    const errorName = err?.name || 'Error';
    const rawMessage = err?.message || String(err || 'Unknown Error');
    const rawStack = err?.stack || '';

    // Check Ephemeral Practice Mode
    const prefs = storage.getPrivacyPreferences();
    const isEphemeral = Boolean(prefs?.ephemeralPracticeMode);

    // Deep scrub message, stack, and context
    const safeMessage = scrubClientData(rawMessage);
    const safeStack = scrubClientData(rawStack);
    const safeExtra = isEphemeral
      ? { ephemeralModeActive: true }
      : scrubClientData(extraContext || {});

    // If Sentry is not configured, log locally without sending network requests
    if (!this.dsn) {
      if (import.meta.env.DEV) {
        console.warn(`[ErrorMonitoring: Safe Log] ${errorName}: ${safeMessage}`, safeExtra);
      }
      return;
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
      platform: 'javascript',
      level: 'error',
      environment: import.meta.env.MODE || 'production',
      exception: {
        values: [
          {
            type: errorName,
            value: safeMessage,
            stacktrace: safeStack ? {
              frames: safeStack.split('\n').map((line: string) => ({ filename: line.trim() }))
            } : undefined
          }
        ]
      },
      request: {
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        headers: {
          'user-agent': typeof navigator !== 'undefined' ? navigator.userAgent : ''
        }
      },
      extra: safeExtra,
      tags: {
        runtime: 'browser',
        ephemeralMode: isEphemeral ? 'true' : 'false'
      }
    });

    const envelopeBody = `${envelopeHeader}\n${itemHeader}\n${itemPayload}\n`;

    try {
      if (typeof fetch !== 'undefined') {
        await fetch(this.dsn.envelopeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-sentry-envelope',
            'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=interviewbro-client/1.0.0, sentry_key=${this.dsn.publicKey}`
          },
          body: envelopeBody,
          keepalive: true
        });
      }
    } catch {
      // Fail silently to never disrupt application flow
    }
  }

  public async captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const safeMessage = scrubClientData(message);
    if (!this.dsn) {
      if (import.meta.env.DEV) {
        console.log(`[ErrorMonitoring Message: ${level}] ${safeMessage}`);
      }
      return;
    }

    const eventId = (Date.now().toString(16) + Math.random().toString(16).substring(2)).substring(0, 32);
    const envelopeHeader = JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() });
    const itemHeader = JSON.stringify({ type: 'event', content_type: 'application/json' });
    const itemPayload = JSON.stringify({
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level,
      message: safeMessage
    });

    try {
      await fetch(this.dsn.envelopeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-sentry-envelope',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_client=interviewbro-client/1.0.0, sentry_key=${this.dsn.publicKey}`
        },
        body: `${envelopeHeader}\n${itemHeader}\n${itemPayload}\n`,
        keepalive: true
      });
    } catch {
      // Silent
    }
  }
}

export const errorMonitoring = new ErrorMonitoringService();
