// =========================================================================
// Web Speech API Service (STT & TTS) for Voice-First Interview Engine
// =========================================================================

export interface SpeechRecognitionService {
  isSupported: boolean;
  start: (
    onTranscript: (fullTranscript: string, interimChunk: string, isFinal: boolean) => void,
    onError: (errorType: string, message: string) => void,
    onStatusChange?: (status: 'listening' | 'processing' | 'stopped') => void
  ) => void;
  startListening: (
    onTranscript: (fullTranscript: string, interimChunk: string, isFinal: boolean) => void,
    onError: (errorType: string, message: string) => void,
    onStatusChange?: (status: 'listening' | 'processing' | 'stopped') => void
  ) => void;
  stop: () => void;
  abort: () => void;
  isListening: () => boolean;
  getLatestTranscript?: () => string;
  reset?: () => void;
}

export const createSpeechRecognition = (): SpeechRecognitionService => {
  const SpeechRecognitionClass =
    (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
    null;

  if (!SpeechRecognitionClass) {
    return {
      isSupported: false,
      start: () => {},
      startListening: () => {},
      stop: () => {},
      abort: () => {},
      isListening: () => false,
      getLatestTranscript: () => '',
      reset: () => {}
    };
  }

  let activeRecognitionInstance: any = null;
  let shouldBeListening = false;
  let restartTimeoutId: any = null;

  // Transcript aggregation buffers
  let persistedFinalTranscript = '';
  let currentSessionFinalTranscript = '';
  let currentInterimTranscript = '';

  let activeOnTranscript: ((full: string, interim: string, isFinal: boolean) => void) | null = null;
  let activeOnError: ((errorType: string, message: string) => void) | null = null;
  let activeOnStatusChange: ((status: 'listening' | 'processing' | 'stopped') => void) | null = null;

  const safelyDetachInstance = () => {
    if (restartTimeoutId) {
      clearTimeout(restartTimeoutId);
      restartTimeoutId = null;
    }
    if (activeRecognitionInstance) {
      try {
        activeRecognitionInstance.onstart = null;
        activeRecognitionInstance.onresult = null;
        activeRecognitionInstance.onerror = null;
        activeRecognitionInstance.onend = null;
        activeRecognitionInstance.abort();
      } catch (e) {
        console.warn('[SpeechRecognition] Instance cleanup notice:', e);
      }
      activeRecognitionInstance = null;
    }
  };

  const setupRecognitionInstance = () => {
    const rec = new SpeechRecognitionClass();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      console.log('[SpeechRecognition] onstart: microphone listener active and capturing audio');
      if (activeOnStatusChange) {
        activeOnStatusChange('listening');
      }
    };

    rec.onresult = (event: any) => {
      let interim = '';
      let sessionFinal = '';

      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        if (!result || !result[0]) continue;
        const text = result[0].transcript || '';
        if (result.isFinal) {
          sessionFinal = (sessionFinal ? sessionFinal + ' ' : '') + text.trim();
        } else {
          interim = (interim ? interim + ' ' : '') + text.trim();
        }
      }

      currentSessionFinalTranscript = sessionFinal;
      currentInterimTranscript = interim;

      // Full transcript combines all previous cycles' finalized text + current cycle final
      const fullTranscript = [persistedFinalTranscript, currentSessionFinalTranscript]
        .filter(Boolean)
        .join(' ')
        .trim();

      const isFinalResult = Boolean(currentSessionFinalTranscript && !currentInterimTranscript);

      console.log('[SpeechRecognition] onresult:', {
        fullTranscript,
        interim: currentInterimTranscript,
        isFinal: isFinalResult
      });

      if (activeOnTranscript) {
        activeOnTranscript(fullTranscript, currentInterimTranscript, isFinalResult);
      }
    };

    rec.onerror = (event: any) => {
      const err = event.error || 'unknown';
      console.log('[SpeechRecognition] onerror event:', err, event.message || '');

      // Explicitly filter out non-fatal events like 'no-speech' and 'aborted'
      if (err === 'no-speech' || err === 'aborted') {
        console.log(`[SpeechRecognition] Non-fatal notice: "${err}". Continuous listening preserved.`);
        return;
      }

      // Fatal hardware / permission errors
      console.warn('[SpeechRecognition] Fatal speech error:', err);
      shouldBeListening = false;
      if (restartTimeoutId) {
        clearTimeout(restartTimeoutId);
        restartTimeoutId = null;
      }

      let userMsg = 'Microphone speech capture encountered an error.';
      if (err === 'not-allowed') {
        userMsg = 'Microphone permission was denied. Please allow microphone permissions in Microsoft Edge (lock/tune icon) or Windows Privacy Settings.';
      } else if (err === 'audio-capture') {
        userMsg = 'No microphone was detected or your microphone is in exclusive use by another app (e.g. Teams, Zoom).';
      } else if (err === 'network') {
        userMsg = 'Network error occurred while connecting to browser speech recognition. Check your connection or switch to Text-Based Interview mode.';
      } else if (err === 'service-not-allowed') {
        userMsg = 'Speech recognition service is disabled or blocked in your browser or system settings.';
      }

      if (activeOnError) {
        activeOnError(err, userMsg);
      }
      if (activeOnStatusChange) {
        activeOnStatusChange('stopped');
      }
    };

    rec.onend = () => {
      console.log('[SpeechRecognition] onend event fired. shouldBeListening =', shouldBeListening);

      // Consolidate current session finals and trailing interim into persistedFinalTranscript
      persistedFinalTranscript = [
        persistedFinalTranscript,
        currentSessionFinalTranscript,
        currentInterimTranscript
      ].filter(Boolean).join(' ').trim();
      currentSessionFinalTranscript = '';
      currentInterimTranscript = '';

      // If candidate is still in speaking mode, restart listener automatically
      if (shouldBeListening) {
        if (activeOnStatusChange) {
          activeOnStatusChange('processing');
        }

        if (restartTimeoutId) clearTimeout(restartTimeoutId);
        restartTimeoutId = setTimeout(() => {
          if (!shouldBeListening) return;
          try {
            console.log('[SpeechRecognition] Auto-restarting continuous listener...');
            safelyDetachInstance();
            activeRecognitionInstance = setupRecognitionInstance();
            activeRecognitionInstance.start();
          } catch (e: any) {
            console.warn('[SpeechRecognition] Auto-restart notice:', e?.message || e);
            if (shouldBeListening) {
              restartTimeoutId = setTimeout(() => {
                if (!shouldBeListening) return;
                try {
                  safelyDetachInstance();
                  activeRecognitionInstance = setupRecognitionInstance();
                  activeRecognitionInstance.start();
                } catch (secondErr) {
                  console.warn('[SpeechRecognition] Second restart failed:', secondErr);
                  shouldBeListening = false;
                  if (activeOnStatusChange) activeOnStatusChange('stopped');
                }
              }, 300);
            }
          }
        }, 150);
      } else {
        if (activeOnStatusChange) {
          activeOnStatusChange('stopped');
        }
      }
    };

    return rec;
  };

  const startListening = (
    onTranscript: (fullTranscript: string, interimChunk: string, isFinal: boolean) => void,
    onError: (errorType: string, message: string) => void,
    onStatusChange?: (status: 'listening' | 'processing' | 'stopped') => void
  ) => {
    console.log('[SpeechRecognition] startListening / start invoked');
    activeOnTranscript = onTranscript;
    activeOnError = onError;
    activeOnStatusChange = onStatusChange || null;
    shouldBeListening = true;

    // Safely stop or cancel any existing active recognition instance before creating a new one
    safelyDetachInstance();

    try {
      activeRecognitionInstance = setupRecognitionInstance();
      activeRecognitionInstance.start();
      console.log('[SpeechRecognition] Instance created and started successfully');
    } catch (err: any) {
      console.warn('[SpeechRecognition] Immediate start threw, queuing retry:', err);
      restartTimeoutId = setTimeout(() => {
        if (!shouldBeListening) return;
        try {
          safelyDetachInstance();
          activeRecognitionInstance = setupRecognitionInstance();
          activeRecognitionInstance.start();
          console.log('[SpeechRecognition] Delayed start succeeded');
        } catch (retryErr: any) {
          shouldBeListening = false;
          console.error('[SpeechRecognition] Start retry failed:', retryErr);
          onError('init_failed', retryErr.message || 'Speech recognition failed to initialize.');
          if (onStatusChange) onStatusChange('stopped');
        }
      }, 200);
    }
  };

  const stop = () => {
    console.log('[SpeechRecognition] stop requested');
    shouldBeListening = false;
    if (restartTimeoutId) {
      clearTimeout(restartTimeoutId);
      restartTimeoutId = null;
    }

    persistedFinalTranscript = [
      persistedFinalTranscript,
      currentSessionFinalTranscript,
      currentInterimTranscript
    ].filter(Boolean).join(' ').trim();
    currentSessionFinalTranscript = '';
    currentInterimTranscript = '';

    if (activeOnTranscript) {
      activeOnTranscript(persistedFinalTranscript, '', true);
    }

    safelyDetachInstance();

    if (activeOnStatusChange) {
      activeOnStatusChange('stopped');
    }
  };

  const abort = () => {
    console.log('[SpeechRecognition] abort requested');
    shouldBeListening = false;
    if (restartTimeoutId) {
      clearTimeout(restartTimeoutId);
      restartTimeoutId = null;
    }
    persistedFinalTranscript = '';
    currentSessionFinalTranscript = '';
    currentInterimTranscript = '';

    safelyDetachInstance();

    if (activeOnStatusChange) {
      activeOnStatusChange('stopped');
    }
  };

  const getLatestTranscript = (): string => {
    return [
      persistedFinalTranscript,
      currentSessionFinalTranscript,
      currentInterimTranscript
    ].filter(Boolean).join(' ').trim();
  };

  const reset = () => {
    console.log('[SpeechRecognition] reset transcript');
    persistedFinalTranscript = '';
    currentSessionFinalTranscript = '';
    currentInterimTranscript = '';
  };

  return {
    isSupported: true,
    start: startListening,
    startListening,
    stop,
    abort,
    reset,
    getLatestTranscript,
    isListening: () => shouldBeListening
  };
};

// -------------------------------------------------------------------------
// Natural Interviewer Voice (TTS)
// -------------------------------------------------------------------------

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class NaturalTTS {
  public isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isSpeakingNow = false;
  private currentAudio: HTMLAudioElement | null = null;
  private activeElevenLabsVoiceId: string = typeof localStorage !== 'undefined'
    ? localStorage.getItem('interviewbro_voice_id') || '21m00Tcm4TlvDq8ikWAM'
    : '21m00Tcm4TlvDq8ikWAM';
  private useElevenLabs = false;
  private checkedBackendStatus = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
    this.checkBackendVoiceStatus();
  }

  public async checkBackendVoiceStatus(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      const res = await fetch('/api/voice/status');
      if (res.ok) {
        const data = await res.json();
        this.useElevenLabs = Boolean(data.isConfigured);
        this.checkedBackendStatus = true;
        return this.useElevenLabs;
      }
    } catch {
      this.useElevenLabs = false;
    }
    this.checkedBackendStatus = true;
    return false;
  }

  private loadVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.voices = window.speechSynthesis.getVoices();
      this.selectedVoice = this.pickBestInterviewerVoice(this.voices);
    } catch (e) {
      console.warn('Error loading speech voices:', e);
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public getSelectedVoiceName(): string {
    if (!this.selectedVoice) {
      this.selectedVoice = this.pickBestInterviewerVoice(this.getAvailableVoices());
    }
    return this.selectedVoice ? `${this.selectedVoice.name} (${this.selectedVoice.lang})` : 'Default System Voice';
  }

  /**
   * Lazily primes the speech synthesis engine in the background without blocking UI rendering
   */
  public warmup(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.loadVoices();
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        silentUtterance.rate = 2.0;
        window.speechSynthesis.speak(silentUtterance);
      }
    } catch {
      // Non-fatal background warm-up
    }
  }

  public setElevenLabsVoice(voiceId: string): void {
    this.activeElevenLabsVoiceId = voiceId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('interviewbro_voice_id', voiceId);
    }
  }

  public getElevenLabsVoice(): string {
    return this.activeElevenLabsVoiceId;
  }

  public setUseElevenLabs(enabled: boolean): void {
    this.useElevenLabs = enabled;
  }

  public getUseElevenLabs(): boolean {
    return this.useElevenLabs;
  }

  /**
   * Selects the highest quality natural, conversational interviewer voice.
   */
  public pickBestInterviewerVoice(voiceList: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voiceList || voiceList.length === 0) return null;

    // 1. Natural / Neural voices
    const naturalKeywords = ['natural', 'online', 'neural', 'google us english'];
    const naturalVoice = voiceList.find(v => {
      const name = v.name.toLowerCase();
      return v.lang.startsWith('en') && naturalKeywords.some(keyword => name.includes(keyword));
    });
    if (naturalVoice) return naturalVoice;

    // 2. Renowned clear interview voices
    const preferredNames = ['jenny', 'guy', 'aria', 'samantha', 'alex', 'karen', 'daniel', 'serena', 'zira', 'david'];
    const preferredVoice = voiceList.find(v => {
      const name = v.name.toLowerCase();
      return v.lang.startsWith('en') && preferredNames.some(p => name.includes(p));
    });
    if (preferredVoice) return preferredVoice;

    // 3. Any US/UK/English voice
    const enVoice = voiceList.find(v => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en-gb') ||
                    voiceList.find(v => v.lang.startsWith('en'));
    if (enVoice) return enVoice;

    return voiceList[0] || null;
  }

  /**
   * Sanitizes text for conversational speech.
   * Strips formatting gimmicks (markdown bolding, italics, code ticks, bullets, numbered lists, emojis)
   * and expands technical acronyms for clean, natural Text-to-Speech audio.
   */
  public sanitizeTextForSpeech(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '') // remove emojis
      .replace(/^[\s*•\-–—\d.]+\s+/gm, '') // remove bullet points & list numbers
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks
      .replace(/\*(.*?)\*/g, '$1') // remove italic asterisks
      .replace(/`([^`]+)`/g, '$1') // remove code backticks
      .replace(/#+\s/g, '') // remove markdown headings
      .replace(/<[^>]+>/g, '') // remove HTML tags
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // clean markdown links
      .replace(/[*_~`#]/g, '') // remove lingering markdown symbols
      .replace(/\bSTAR\b/g, 'S-T-A-R') // pronounce acronyms clearly
      .replace(/\bAPI\b/g, 'A-P-I')
      .replace(/\bOOPs?\b/gi, 'Object Oriented Programming')
      .replace(/\bSQL\b/gi, 'Sequel')
      .replace(/\bNoSQL\b/gi, 'No Sequel')
      .replace(/\bAWS\b/g, 'A-W-S')
      .replace(/\bCI\/CD\b/g, 'Continuous Integration and Continuous Delivery')
      .replace(/\bDSA\b/g, 'D-S-A')
      .replace(/\bDBMS\b/g, 'D-B-M-S')
      .replace(/\bTCS\b/g, 'T-C-S')
      .replace(/\bLLD\b/g, 'Low Level Design')
      .replace(/\bHLD\b/g, 'High Level Design')
      .replace(/\bJWT\b/g, 'J-W-T')
      .replace(/\bPR\b/g, 'Pull Request')
      .replace(/\bUI\b/g, 'U-I')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Speaks the interview question aloud using ElevenLabs if available,
   * with automatic fallback to Web Speech API.
   */
  public async speak(text: string, options: TTSOptions = {}): Promise<void> {
    this.stop(); // Stop any pending utterances or audio

    const cleaned = this.sanitizeTextForSpeech(text);
    if (!cleaned) {
      if (options.onEnd) options.onEnd();
      return;
    }

    // Try ElevenLabs backend TTS if enabled
    if (this.useElevenLabs) {
      try {
        const response = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleaned,
            voiceId: this.activeElevenLabsVoiceId
          })
        });

        if (response.ok) {
          const contentType = response.headers.get('Content-Type') || '';
          if (contentType.includes('audio')) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            this.isSpeakingNow = true;

            audio.onplay = () => {
              if (options.onStart) options.onStart();
            };

            audio.onended = () => {
              this.isSpeakingNow = false;
              this.currentAudio = null;
              URL.revokeObjectURL(audioUrl);
              if (options.onEnd) options.onEnd();
            };

            audio.onerror = (e) => {
              console.warn('Audio playback error, falling back to Web Speech API:', e);
              this.currentAudio = null;
              URL.revokeObjectURL(audioUrl);
              this.speakWithWebSpeech(cleaned, options);
            };

            try {
              await audio.play();
              return; // Successfully played ElevenLabs audio
            } catch (playErr) {
              console.warn('Audio autoplay blocked or failed, falling back:', playErr);
              // continue to Web Speech fallback
            }
          } else {
            // Server returned JSON fallback indication
            this.speakWithWebSpeech(cleaned, options);
            return;
          }
        }
      } catch (networkErr) {
        console.warn('ElevenLabs TTS network issue, falling back to Web Speech API:', networkErr);
      }
    }

    // Default Web Speech API Fallback
    this.speakWithWebSpeech(cleaned, options);
  }

  /**
   * Free Browser / OS Web Speech API Speech Synthesis
   */
  public speakWithWebSpeech(cleaned: string, options: TTSOptions = {}): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (options.onEnd) options.onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = options.rate !== undefined ? options.rate : 0.98;
      utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;

      if (!this.selectedVoice) {
        this.selectedVoice = this.pickBestInterviewerVoice(this.getAvailableVoices());
      }
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this.selectedVoice.lang;
      }

      utterance.onstart = () => {
        this.isSpeakingNow = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeakingNow = false;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (e) => {
        this.isSpeakingNow = false;
        console.warn('Speech synthesis utterance notice:', e);
        if (options.onError) options.onError(e);
        if (options.onEnd) options.onEnd();
      };

      this.isSpeakingNow = true;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeakingNow = false;
      console.warn('TTS speech synthesis execution exception:', e);
      if (options.onEnd) options.onEnd();
    }
  }

  public stop(): void {
    this.isSpeakingNow = false;

    // Stop HTML5 Audio if playing
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch (e) {
        // ignore
      }
    }

    // Stop Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('TTS cancel notice:', e);
      }
    }
  }

  public pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public isSpeaking(): boolean {
    const isAudioPlaying = Boolean(this.currentAudio && !this.currentAudio.paused);
    const isUtteranceSpeaking = typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
    return this.isSpeakingNow || isAudioPlaying || isUtteranceSpeaking;
  }
}

export const tts = new NaturalTTS();
