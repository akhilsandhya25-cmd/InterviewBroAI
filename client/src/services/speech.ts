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
      isListening: () => false
    };
  }

  let recognition: any = null;
  let shouldBeListening = false;
  let fullAccumulatedTranscript = '';

  return {
    isSupported: true,

    start: (onTranscript, onError, onStatusChange) => {
      try {
        if (recognition) {
          try {
            recognition.abort();
          } catch (e) {
            // ignore
          }
        }

        recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        shouldBeListening = true;

        if (onStatusChange) onStatusChange('listening');

        recognition.onresult = (event: any) => {
          let interimChunk = '';
          let newFinalChunk = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || '';
            if (result.isFinal) {
              newFinalChunk += text;
            } else {
              interimChunk += text;
            }
          }

          if (newFinalChunk) {
            fullAccumulatedTranscript = (fullAccumulatedTranscript + ' ' + newFinalChunk.trim()).trim();
            onTranscript(fullAccumulatedTranscript, '', true);
          } else if (interimChunk) {
            onTranscript(fullAccumulatedTranscript, interimChunk.trim(), false);
          }
        };

        recognition.onerror = (event: any) => {
          const err = event.error || 'unknown';
          console.warn('Speech recognition event error:', err);

          let userMsg = 'Microphone speech capture encountered an error.';
          if (err === 'no-speech') {
            userMsg = 'No speech was detected. Please check that your microphone is unmuted and speak clearly.';
          } else if (err === 'audio-capture') {
            userMsg = 'No microphone was found or microphone is busy in another app.';
          } else if (err === 'not-allowed') {
            userMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings to proceed.';
          } else if (err === 'network') {
            userMsg = 'Network error occurred during speech-to-text recognition.';
          }

          // If no-speech error, keep listening instead of aborting
          if (err === 'no-speech' && shouldBeListening) {
            return;
          }

          onError(err, userMsg);
        };

        recognition.onend = () => {
          // If browser closed the recognition stream unexpectedly but candidate is still speaking, auto-restart
          if (shouldBeListening) {
            try {
              if (onStatusChange) onStatusChange('processing');
              recognition.start();
              if (onStatusChange) onStatusChange('listening');
            } catch (e) {
              shouldBeListening = false;
              if (onStatusChange) onStatusChange('stopped');
            }
          } else {
            if (onStatusChange) onStatusChange('stopped');
          }
        };

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
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {
          console.warn('Error calling recognition.abort:', e);
        }
      }
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

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (this.isSupported) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): void {
    if (!this.isSupported) return;
    try {
      this.voices = window.speechSynthesis.getVoices();
      this.selectedVoice = this.pickBestInterviewerVoice(this.voices);
    } catch (e) {
      console.warn('Error loading speech voices:', e);
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.isSupported) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public getSelectedVoiceName(): string {
    if (!this.selectedVoice) {
      this.selectedVoice = this.pickBestInterviewerVoice(this.getAvailableVoices());
    }
    return this.selectedVoice ? `${this.selectedVoice.name} (${this.selectedVoice.lang})` : 'Default Browser Voice';
  }

  /**
   * Selects the highest quality natural, conversational interviewer voice.
   * Priority:
   * 1. High-tier neural/natural voices (Google US English, Microsoft Online/Natural voices like Jenny, Guy, Aria, Christopher)
   * 2. High-quality system English voices (Samantha, Alex, Karen, Daniel, Victoria)
   * 3. Any standard en-US or en voice
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
   * Removes markdown syntax (e.g. *, **, #, `, backticks) and expands abbreviations.
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
   * Speaks the interview question aloud.
   * Cancels any ongoing audio first, handles natural rate (0.95x for professional clarity),
   * and fires onEnd when speaking completes.
   */
  public speak(text: string, options: TTSOptions = {}): void {
    if (!this.isSupported) {
      if (options.onEnd) options.onEnd();
      return;
    }

    try {
      this.stop(); // Stop any pending utterances
      const cleaned = this.sanitizeTextForSpeech(text);
      if (!cleaned) {
        if (options.onEnd) options.onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = options.rate !== undefined ? options.rate : 0.98; // natural, articulate interview cadence
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
    if (!this.isSupported) return;
    try {
      this.isSpeakingNow = false;
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('TTS cancel notice:', e);
    }
  }

  public pause(): void {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.pause();
    } catch (e) {
      // ignore
    }
  }

  public resume(): void {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      // ignore
    }
  }

  public isSpeaking(): boolean {
    if (!this.isSupported) return false;
    return this.isSpeakingNow || window.speechSynthesis.speaking;
  }
}

export const tts = new NaturalTTS();
