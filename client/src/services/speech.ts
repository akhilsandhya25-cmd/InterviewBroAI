// Web Speech API wrapper for Speech-to-Text (STT) and Text-to-Speech (TTS)

export interface SpeechRecognitionService {
  isSupported: boolean;
  start: (onTranscript: (text: string, isFinal: boolean) => void, onError: (err: string) => void) => void;
  stop: () => void;
}

export const createSpeechRecognition = (): SpeechRecognitionService => {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    return {
      isSupported: false,
      start: () => {},
      stop: () => {}
    };
  }

  let recognition: any = null;

  return {
    isSupported: true,
    start: (onTranscript, onError) => {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            onTranscript(finalTranscript, true);
          } else if (interimTranscript) {
            onTranscript(interimTranscript, false);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          onError(event.error);
        };

        recognition.start();
      } catch (err: any) {
        console.error('Failed to start speech recognition:', err);
        onError(err.message || 'Speech recognition initialization failed');
      }
    },
    stop: () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
    }
  };
};

export const tts = {
  isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window,

  speak(text: string, onEnd?: () => void): void {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      if (onEnd) {
        utterance.onend = () => onEnd();
        utterance.onerror = () => onEnd();
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
      if (onEnd) onEnd();
    }
  },

  stop(): void {
    if (!this.isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('TTS stop error:', e);
    }
  }
};
