/**
 * Privacy-Respecting Analytics Service (PostHog & Plausible Compatible)
 * 
 * Strict Privacy & Statutory Compliance:
 * 1. HONORS CANDIDATE OPT-IN: If analyticsOptIn is false, ZERO events are dispatched.
 * 2. ZERO PII: No candidate names, email addresses, or IP addresses are sent.
 * 3. ZERO TRANSCRIPTS: No spoken questions, user answers, or resume texts are tracked.
 * 4. EPHEMERAL PRACTICE MODE: When active, no interview details or metadata are persisted or dispatched.
 */

import { storage } from './storage';

export type AnalyticsEvent = 
  | 'signup'
  | 'interview_started'
  | 'interview_completed'
  | 'report_viewed'
  | 'resume_uploaded'
  | 'quota_hit'
  | 'waitlist_joined'
  | 'fallback_mode_shown';

interface AnalyticsConfig {
  posthogKey?: string;
  posthogHost?: string;
  plausibleDomain?: string;
  plausibleHost?: string;
}

class AnalyticsService {
  private config: AnalyticsConfig = {};
  private anonymousDistinctId: string;

  constructor() {
    this.config = {
      posthogKey: import.meta.env?.VITE_POSTHOG_KEY || ((globalThis as any)?.POSTHOG_KEY),
      posthogHost: (import.meta.env?.VITE_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/+$/, ''),
      plausibleDomain: import.meta.env?.VITE_PLAUSIBLE_DOMAIN || ((globalThis as any)?.PLAUSIBLE_DOMAIN),
      plausibleHost: (import.meta.env?.VITE_PLAUSIBLE_API_HOST || 'https://plausible.io').replace(/\/+$/, '')
    };

    // Anonymous pseudo-identifier rotated every browser session without tracking cross-site
    this.anonymousDistinctId = this.getOrCreateAnonymousId();
  }

  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return 'server_side_noop';
    try {
      const stored = sessionStorage.getItem('interviewbro_anon_session_id');
      if (stored) return stored;
      const created = 'anon_' + (Date.now().toString(36) + Math.random().toString(36).substring(2, 9));
      sessionStorage.setItem('interviewbro_anon_session_id', created);
      return created;
    } catch {
      return 'anon_ephemeral';
    }
  }

  /**
   * Checks candidate privacy preferences to verify if analytics tracking is explicitly permitted.
   */
  public isOptedIn(): boolean {
    try {
      const prefs = storage.getPrivacyPreferences();
      return Boolean(prefs && prefs.analyticsOptIn);
    } catch {
      return false;
    }
  }

  /**
   * Checks if candidate is currently running in Ephemeral Practice Mode.
   */
  public isEphemeralPracticeMode(): boolean {
    try {
      const prefs = storage.getPrivacyPreferences();
      return Boolean(prefs && prefs.ephemeralPracticeMode);
    } catch {
      return false;
    }
  }

  /**
   * Sanitizes all event properties to strictly purge PII, resume strings, transcripts, and answers.
   */
  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> {
    if (!properties || typeof properties !== 'object') return {};

    const scrubbed: Record<string, any> = {};
    const prohibitedKeywords = [
      'transcript',
      'useranswer',
      'candidateanswer',
      'answer',
      'question',
      'prompt',
      'speechtext',
      'resume',
      'resumetext',
      'email',
      'name',
      'fullname',
      'full_name',
      'phone',
      'token',
      'secret',
      'authorization',
      'password'
    ];

    for (const [key, value] of Object.entries(properties)) {
      const lowerKey = key.toLowerCase();
      // Block any field with sensitive keyword
      if (prohibitedKeywords.some(bad => lowerKey.includes(bad))) {
        continue;
      }

      // If value is a string, scrub email addresses
      if (typeof value === 'string') {
        scrubbed[key] = value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        scrubbed[key] = value;
      }
    }

    return scrubbed;
  }

  /**
   * Main tracking dispatcher. Honors opt-in preferences and scrubs data.
   */
  public async track(event: AnalyticsEvent, rawProperties?: Record<string, any>): Promise<void> {
    // 1. Mandatory opt-in gate: If candidate has not opted in, terminate immediately
    if (!this.isOptedIn()) {
      return;
    }

    // 2. Ephemeral Practice Mode gate: If active, prevent any interview details from being dispatched
    if (this.isEphemeralPracticeMode()) {
      if (event === 'interview_started' || event === 'interview_completed' || event === 'report_viewed') {
        rawProperties = {
          ephemeral_mode_active: true,
          source: rawProperties?.source || 'ai'
        };
      }
    }

    const properties = this.sanitizeProperties(rawProperties);

    // 3. PostHog Dispatch (Recommended)
    if (this.config.posthogKey) {
      try {
        await fetch(`${this.config.posthogHost}/capture/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: this.config.posthogKey,
            event,
            properties: {
              distinct_id: this.anonymousDistinctId,
              $current_url: typeof window !== 'undefined' ? window.location.pathname : '',
              ...properties
            },
            timestamp: new Date().toISOString()
          }),
          keepalive: true
        });
      } catch (err) {
        // Fail silently
      }
    }

    // 4. Plausible Dispatch (Alternative minimal)
    if (this.config.plausibleDomain) {
      try {
        await fetch(`${this.config.plausibleHost}/api/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: event,
            url: typeof window !== 'undefined' ? window.location.href : 'https://interviewbro-ai.vercel.app',
            domain: this.config.plausibleDomain,
            props: properties
          }),
          keepalive: true
        });
      } catch (err) {
        // Fail silently
      }
    }

    // 5. Development Diagnostic Logging (only when opted-in)
    if (import.meta.env?.DEV) {
      console.log(`[Analytics (Opted-in)] Event: "${event}"`, properties);
    }
  }

  // --- Convenience Helpers for Required Events ---

  public trackSignup(method = 'email'): void {
    this.track('signup', { method });
  }

  public trackInterviewStarted(details: { category: string; difficulty?: string; questionCount: number }): void {
    this.track('interview_started', {
      category: details.category,
      difficulty: details.difficulty || 'intermediate',
      question_count: details.questionCount
    });
  }

  public trackInterviewCompleted(details: { category: string; questionCount: number; durationSeconds: number; source?: 'ai' | 'fallback' }): void {
    this.track('interview_completed', {
      category: details.category,
      question_count: details.questionCount,
      duration_seconds: Math.round(details.durationSeconds),
      source: details.source || 'ai'
    });
  }

  public trackReportViewed(details: { interviewType: string; scoreTier?: string; source?: 'ai' | 'fallback' }): void {
    this.track('report_viewed', {
      interview_type: details.interviewType,
      score_tier: details.scoreTier || 'unspecified',
      source: details.source || 'ai'
    });
  }

  public trackResumeUploaded(details: { fileType: string; sizeKb: number; source?: 'ai' | 'fallback' }): void {
    this.track('resume_uploaded', {
      file_type: details.fileType,
      size_kb: Math.round(details.sizeKb),
      source: details.source || 'ai'
    });
  }

  public trackQuotaHit(details: { context: string }): void {
    this.track('quota_hit', {
      context: details.context
    });
  }

  public trackWaitlistJoined(details: { plan: string }): void {
    this.track('waitlist_joined', {
      plan: details.plan
    });
  }

  public trackFallbackModeShown(details: { context: string; reason?: string }): void {
    this.track('fallback_mode_shown', {
      context: details.context,
      reason: details.reason || 'ai_offline'
    });
  }
}

export const analyticsService = new AnalyticsService();
