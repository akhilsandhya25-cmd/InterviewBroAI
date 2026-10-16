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
      stop: () => {},
      abort: () => {},
      isListening: () => false,
      getLatestTranscript: () => '',
      reset: () => {}
    };
  }

  let recognition: any = null;
  let shouldBeListening = false;
  let fullAccumulatedTranscript = '';
  let currentInterimChunk = '';
  let activeOnTranscript: ((full: string, interim: string, isFinal: boolean) => void) | null = null;

  return {
    isSupported: true,

    start: (onTranscript, onError, onStatusChange) => {
      try {
        activeOnTranscript = onTranscript;
        shouldBeListening = true;

        if (recognition) {
          try {
            recognition.abort();
          } catch (e) {
            // ignore
          }
        }

        const setupRecognition = () => {
          const rec = new SpeechRecognitionClass();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = 'en-US';
          rec.maxAlternatives = 1;

          rec.onresult = (event: any) => {
            let interim = '';
            let newFinal = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const result = event.results[i];
              const text = result[0]?.transcript || '';
              if (result.isFinal) {
                newFinal += text;
              } else {
                interim += text;
              }
            }

            currentInterimChunk = interim.trim();

            if (newFinal) {
              fullAccumulatedTranscript = (fullAccumulatedTranscript + ' ' + newFinal.trim()).trim();
              currentInterimChunk = '';
              onTranscript(fullAccumulatedTranscript, '', true);
            } else {
              onTranscript(fullAccumulatedTranscript, currentInterimChunk, false);
            }
          };

          rec.onerror = (event: any) => {
            const err = event.error || 'unknown';
            console.warn('Speech recognition event error:', err);

            // If no-speech error, keep listening so natural pauses do not abort the session
            if (err === 'no-speech' && shouldBeListening) {
              return;
            }

            // For all non-pause errors (not-allowed, audio-capture, network, service-not-allowed),
            // immediately halt listening state to prevent infinite auto-restart loops in Microsoft Edge / Windows
            shouldBeListening = false;

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

            onError(err, userMsg);
            if (onStatusChange) onStatusChange('stopped');
          };

          rec.onend = () => {
            // Only auto-restart if still actively listening (e.g. normal utterance boundary, NOT after an error)
            if (shouldBeListening) {
              if (onStatusChange) onStatusChange('processing');
              // Delay slightly (250ms) to allow Windows / Edge audio session to cycle cleanly without locking
              setTimeout(() => {
                if (!shouldBeListening) return;
                try {
                  recognition = setupRecognition();
                  recognition.start();
                  if (onStatusChange) onStatusChange('listening');
                } catch (e) {
                  shouldBeListening = false;
                  if (onStatusChange) onStatusChange('stopped');
                }
              }, 250);
            } else {
              if (onStatusChange) onStatusChange('stopped');
            }
          };

          return rec;
        };

        recognition = setupRecognition();
        if (onStatusChange) onStatusChange('listening');
        recognition.start();
      } catch (err: any) {
        shouldBeListening = false;
        console.error('Failed to initialize speech recognition:', err);
        onError('init_failed', err.message || 'Speech recognition failed to initialize.');
        if (onStatusChange) onStatusChange('stopped');
      }
    },

    stop: () => {
      shouldBeListening = false;
      // Guarantee that any uncommitted interim speech is committed into full transcript immediately
      if (currentInterimChunk) {
        fullAccumulatedTranscript = (fullAccumulatedTranscript + ' ' + currentInterimChunk).trim();
        if (activeOnTranscript) {
          activeOnTranscript(fullAccumulatedTranscript, '', true);
        }
        currentInterimChunk = '';
      }
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.warn('Error calling recognition.stop:', e);
        }
      }
    },

    abort: () => {
      shouldBeListening = false;
      fullAccumulatedTranscript = '';
      currentInterimChunk = '';
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {
          console.warn('Error calling recognition.abort:', e);
        }
      }
    },

    getLatestTranscript: () => {
      return (fullAccumulatedTranscript + ' ' + currentInterimChunk).trim();
    },

    reset: () => {
      fullAccumulatedTranscript = '';
      currentInterimChunk = '';
    },

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
  private useElevenLabs = true;

  constructor() {
    this.isSupported = typeof window !== 'undefined';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
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
   */
  public sanitizeTextForSpeech(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks
      .replace(/\*(.*?)\*/g, '$1') // remove italic asterisks
      .replace(/`([^`]+)`/g, '$1') // remove code backticks
      .replace(/#+\s/g, '') // remove markdown headings
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // clean markdown links
      .replace(/\bSTAR\b/g, 'S-T-A-R') // pronounce acronyms clearly
      .replace(/\bAPI\b/g, 'A-P-I')
      .replace(/\bOOPs?\b/gi, 'Object Oriented Programming')
      .replace(/\bSQL\b/gi, 'Sequel')
      .replace(/\bNoSQL\b/gi, 'No Sequel')
      .replace(/\bAWS\b/g, 'A-W-S')
      .replace(/\bCI\/CD\b/g, 'Continuous Integration and Continuous Delivery')
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
