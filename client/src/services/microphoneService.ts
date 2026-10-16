// =========================================================================
// InterviewBro AI - Comprehensive Microphone & Browser Voice Capabilities Service
// =========================================================================

export type MicrophoneErrorCode =
  | 'permission_denied'
  | 'no_device'
  | 'device_busy'
  | 'overconstrained'
  | 'unsupported_browser'
  | 'network_error'
  | 'audio_capture_failed'
  | 'service_not_allowed'
  | 'insecure_context'
  | 'unknown';

export interface MicrophoneErrorInfo {
  code: MicrophoneErrorCode;
  title: string;
  message: string;
  technicalDetails?: string;
  canFallbackToText: boolean;
  actionHint: string;
}

export interface BrowserVoiceCapabilities {
  hasMediaDevices: boolean;
  hasGetUserMedia: boolean;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  isSecureContext: boolean;
  browserName: 'Edge' | 'Chrome' | 'Firefox' | 'Safari' | 'Other';
  osName: 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Other';
  isSpeechRecognitionReliable: boolean;
  supportSummary: string;
}

/**
 * Release all tracks on a MediaStream immediately so hardware devices (mic/camera)
 * are freed and the browser recording indicator turns off.
 */
export function releaseMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  try {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      try {
        track.stop();
      } catch (err) {
        console.warn('Could not stop media track:', err);
      }
    });
  } catch (err) {
    console.warn('Error releasing media stream:', err);
  }
}

/**
 * Accurately detect the current browser, OS, and voice/audio API capabilities
 */
export function getBrowserVoiceCapabilities(): BrowserVoiceCapabilities {
  if (typeof window === 'undefined') {
    return {
      hasMediaDevices: false,
      hasGetUserMedia: false,
      hasSpeechRecognition: false,
      hasSpeechSynthesis: false,
      isSecureContext: false,
      browserName: 'Other',
      osName: 'Other',
      isSpeechRecognitionReliable: false,
      supportSummary: 'Server-side environment'
    };
  }

  const hasMediaDevices = Boolean(navigator.mediaDevices);
  const hasGetUserMedia = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasSpeechRecognition = Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
  const hasSpeechSynthesis = Boolean('speechSynthesis' in window);
  const isSecureContext = Boolean(window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const ua = navigator.userAgent;

  // Browser detection
  let browserName: BrowserVoiceCapabilities['browserName'] = 'Other';
  if (ua.includes('Edg/')) {
    browserName = 'Edge';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browserName = 'Chrome';
  } else if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browserName = 'Safari';
  }

  // OS detection
  let osName: BrowserVoiceCapabilities['osName'] = 'Other';
  if (ua.includes('Windows')) {
    osName = 'Windows';
  } else if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
    osName = 'macOS';
  } else if (ua.includes('Android')) {
    osName = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    osName = 'iOS';
  } else if (ua.includes('Linux')) {
    osName = 'Linux';
  }

  // Edge and Chrome have first-class SpeechRecognition support.
  // Firefox lacks speech recognition by default. Safari on iOS works but can stop on pauses.
  const isSpeechRecognitionReliable =
    hasSpeechRecognition && (browserName === 'Edge' || browserName === 'Chrome');

  let supportSummary = 'Voice-First Interview Ready';
  if (!isSecureContext) {
    supportSummary = 'Insecure origin: microphone requires HTTPS or localhost';
  } else if (!hasGetUserMedia) {
    supportSummary = 'Microphone hardware access is not supported in this browser';
  } else if (!hasSpeechRecognition) {
    supportSummary = 'Speech-to-text is not supported in this browser; Text-Based mode recommended';
  } else if (browserName === 'Edge' && osName === 'Windows') {
    supportSummary = 'Microsoft Edge on Windows detected. Ensure Windows microphone privacy settings are enabled.';
  }

  return {
    hasMediaDevices,
    hasGetUserMedia,
    hasSpeechRecognition,
    hasSpeechSynthesis,
    isSecureContext,
    browserName,
    osName,
    isSpeechRecognitionReliable,
    supportSummary
  };
}

/**
 * Parse any microphone or speech recognition error into an actionable, user-facing error object
 */
export function parseMicrophoneError(error: any): MicrophoneErrorInfo {
  if (!error) {
    return {
      code: 'unknown',
      title: 'Microphone Problem',
      message: 'An unexpected issue occurred while accessing your microphone.',
      canFallbackToText: true,
      actionHint: 'Please check your microphone connection or switch to Text-Based Interview mode.'
    };
  }

  const errName = error.name || '';
  const errMsg = typeof error === 'string' ? error : (error.message || '');
  const errType = error.error || error.type || '';
  const combined = `${errName} ${errMsg} ${errType}`.toLowerCase();

  // 1. Speech Service Not Allowed / Blocked by Policy
  if (errType === 'service-not-allowed' || combined.includes('service-not-allowed')) {
    return {
      code: 'service_not_allowed',
      title: 'Browser Speech Recognition Disabled',
      message:
        'Speech recognition service is disabled by your browser or organizational policy.',
      technicalDetails: `SpeechRecognition service-not-allowed`,
      canFallbackToText: true,
      actionHint:
        'Switch to Text-Based Interview mode, or check your browser speech settings.'
    };
  }

  // 2. Permission Denied
  if (
    errName === 'NotAllowedError' ||
    errName === 'PermissionDeniedError' ||
    errType === 'not-allowed' ||
    combined.includes('permission denied') ||
    combined.includes('permission dismissed') ||
    combined.includes('not-allowed')
  ) {
    return {
      code: 'permission_denied',
      title: 'Microphone Permission Denied',
      message:
        'Microphone access was denied. Your browser or operating system has blocked microphone access for this site.',
      technicalDetails: `${errName}: ${errMsg}`,
      canFallbackToText: true,
      actionHint:
        'To enable: click the lock or camera/mic icon in your browser address bar and select "Allow". On Windows, also verify Windows Settings > Privacy & security > Microphone is turned ON.'
    };
  }

  // 2. No Microphone Found
  if (
    errName === 'NotFoundError' ||
    errName === 'DevicesNotFoundError' ||
    combined.includes('notfounderror') ||
    combined.includes('devicesnotfounderror') ||
    combined.includes('no microphone') ||
    combined.includes('audio-capture')
  ) {
    return {
      code: 'no_device',
      title: 'No Microphone Detected',
      message:
        'No working microphone was found on your device. The system could not detect an active audio input.',
      technicalDetails: `${errName}: ${errMsg}`,
      canFallbackToText: true,
      actionHint:
        'Please plug in a headset or external microphone and ensure it is enabled in your system sound settings.'
    };
  }

  // 3. Microphone Busy or Already in Use
  if (
    errName === 'NotReadableError' ||
    errName === 'TrackStartError' ||
    combined.includes('notreadableerror') ||
    combined.includes('trackstarterror') ||
    combined.includes('could not start audio source') ||
    combined.includes('busy') ||
    combined.includes('in use')
  ) {
    return {
      code: 'device_busy',
      title: 'Microphone Busy or Unavailable',
      message:
        'Your microphone is currently in exclusive use by another app (such as Microsoft Teams, Zoom, or another browser window) or your audio driver is locked.',
      technicalDetails: `${errName}: ${errMsg}`,
      canFallbackToText: true,
      actionHint:
        'Please close any other applications using your microphone (Zoom, Teams, Discord, etc.) and refresh this page.'
    };
  }

  // 4. Speech Recognition Network Error (frequent in Edge / Chrome when offline or proxy blocks speech endpoint)
  if (errType === 'network' || combined.includes('network error') || combined.includes('offline')) {
    return {
      code: 'network_error',
      title: 'Speech Recognition Network Error',
      message:
        'Speech-to-text recognition encountered a network error connecting to the speech synthesis server.',
      technicalDetails: `SpeechRecognition error: ${errType || errMsg}`,
      canFallbackToText: true,
      actionHint:
        'Check your internet connection, or switch to Text-Based Interview mode to continue your interview smoothly.'
    };
  }

  // 5. Speech Service Not Allowed / Blocked
  if (errType === 'service-not-allowed' || combined.includes('service-not-allowed')) {
    return {
      code: 'service_not_allowed',
      title: 'Browser Speech Recognition Disabled',
      message:
        'Speech recognition service is disabled by your browser or organizational policy.',
      technicalDetails: `SpeechRecognition service-not-allowed`,
      canFallbackToText: true,
      actionHint:
        'Switch to Text-Based Interview mode, or check your browser speech settings.'
    };
  }

  // 6. Overconstrained
  if (errName === 'OverconstrainedError' || combined.includes('overconstrained')) {
    return {
      code: 'overconstrained',
      title: 'Audio Hardware Constraint Mismatch',
      message:
        'The requested audio settings (such as sample rate or channels) are not supported by your current microphone.',
      technicalDetails: `${errName}: ${errMsg}`,
      canFallbackToText: true,
      actionHint:
        'We will retry using standard generic audio constraints, or you can switch to Text-Based mode.'
    };
  }

  // 7. Insecure Context
  if (errName === 'SecurityError' || combined.includes('only secure origins')) {
    return {
      code: 'insecure_context',
      title: 'Secure Connection Required',
      message:
        'Browsers require HTTPS or localhost to access the microphone for privacy and security.',
      technicalDetails: `${errName}: ${errMsg}`,
      canFallbackToText: true,
      actionHint: 'Please access InterviewBro AI over HTTPS or localhost.'
    };
  }

  // General Fallback
  return {
    code: 'unknown',
    title: 'Microphone Problem',
    message: errMsg || 'Could not capture microphone audio.',
    technicalDetails: `${errName}: ${errMsg}`,
    canFallbackToText: true,
    actionHint: 'You can switch to Text-Based Interview mode at any time.'
  };
}

/**
 * Test microphone hardware access cleanly and report device info
 */
export async function testMicrophoneAccess(): Promise<{
  success: boolean;
  stream?: MediaStream;
  deviceLabel?: string;
  error?: MicrophoneErrorInfo;
}> {
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      success: false,
      error: {
        code: 'unsupported_browser',
        title: 'Browser Not Supported',
        message: 'Your browser does not support media device capture.',
        canFallbackToText: true,
        actionHint: 'Please use a modern browser such as Microsoft Edge or Google Chrome.'
      }
    };
  }

  try {
    // Request basic audio stream without aggressive constraints to maximize compatibility across Windows/Edge/macOS
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });

    const audioTrack = stream.getAudioTracks()[0];
    const deviceLabel = audioTrack?.label || 'Default Microphone';

    return {
      success: true,
      stream,
      deviceLabel
    };
  } catch (err: any) {
    const parsed = parseMicrophoneError(err);
    return {
      success: false,
      error: parsed
    };
  }
}

/**
 * Create a lightweight audio level meter that samples microphone volume
 * and calculates volume from 0 to 100 for visual feedback.
 */
export function createAudioMeter(
  stream: MediaStream,
  onVolume: (volume: number) => void
): { stop: () => void } {
  let isStopped = false;
  let audioCtx: AudioContext | null = null;
  let animId: number | null = null;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return { stop: () => {} };
    }

    audioCtx = new AudioContextClass();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (isStopped) return;
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      // Scale 0-255 to a clean 0-100 percentage
      const volume = Math.min(100, Math.round((avg / 128) * 100));
      onVolume(volume);

      animId = requestAnimationFrame(checkAudio);
    };

    animId = requestAnimationFrame(checkAudio);
  } catch (err) {
    console.warn('Could not initialize audio meter:', err);
  }

  return {
    stop: () => {
      isStopped = true;
      if (animId) {
        cancelAnimationFrame(animId);
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    }
  };
}
