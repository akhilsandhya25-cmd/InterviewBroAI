import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  accent?: string;
  gender?: string;
  category?: string;
  description?: string;
}

export const CURATED_INTERVIEW_VOICES: ElevenLabsVoice[] = [
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel (Professional & Clear)',
    accent: 'American',
    gender: 'female',
    category: 'premade',
    description: 'Calm, authoritative, articulate interviewer voice.'
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni (Engineering Lead)',
    accent: 'American',
    gender: 'male',
    category: 'premade',
    description: 'Crisp, confident, structured technical interviewer tone.'
  },
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam (Executive & Senior)',
    accent: 'American',
    gender: 'male',
    category: 'premade',
    description: 'Deep, grounded bar-raiser presence.'
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella (Warm & Direct)',
    accent: 'American',
    gender: 'female',
    category: 'premade',
    description: 'Approachable yet demanding technical interviewer.'
  },
  {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh (Dynamic Tech Recruiter)',
    accent: 'American',
    gender: 'male',
    category: 'premade',
    description: 'Energetic, natural conversational cadence.'
  },
  {
    voice_id: 'piTKgcLEGmPE4e6mEKli',
    name: 'Nicole (Analytical & Academic)',
    accent: 'American',
    gender: 'female',
    category: 'premade',
    description: 'Precise, methodic algorithm interviewer tone.'
  }
];

// In-memory cache for ultra-low latency audio delivery
const memoryAudioCache = new Map<string, Buffer>();

// Local disk cache directory for audio persistence
const CACHE_DIR = path.resolve(process.cwd(), '.cache/audio');
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not initialize audio cache directory on disk:', e);
}

function getCacheKey(text: string, voiceId: string, modelId: string): string {
  return crypto.createHash('sha256').update(`${voiceId}:${modelId}:${text}`).digest('hex');
}

export const elevenlabsService = {
  isConfigured(): boolean {
    const key = process.env.ELEVENLABS_API_KEY;
    return Boolean(
      key && 
      typeof key === 'string' && 
      key.trim().startsWith('sk_') && 
      key.trim().length > 20
    );
  },

  getDefaultVoiceId(): string {
    return process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  },

  getDefaultModelId(): string {
    return process.env.ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5';
  },

  /**
   * Retrieves list of available voices from ElevenLabs or curated presets
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.isConfigured()) {
      return CURATED_INTERVIEW_VOICES;
    }

    try {
      const apiKey = process.env.ELEVENLABS_API_KEY!.trim();
      const res = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey
        }
      });

      if (res.ok) {
        const data = await res.json() as any;
        if (data.voices && Array.isArray(data.voices)) {
          return data.voices.map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            accent: v.labels?.accent,
            gender: v.labels?.gender,
            category: v.category,
            description: v.labels?.description || v.name
          }));
        }
      }
    } catch (err: any) {
      console.warn('ElevenLabs API fetch voices error, using curated voices:', err.message);
    }

    return CURATED_INTERVIEW_VOICES;
  },

  /**
   * Synthesizes audio using ElevenLabs REST API with dual memory + disk cache
   */
  async synthesizeSpeech(
    text: string, 
    overrideVoiceId?: string
  ): Promise<{ audioBuffer: Buffer; contentType: string; cached: boolean }> {
    if (!text || text.trim().length === 0) {
      throw new Error('TTS text cannot be empty');
    }

    const voiceId = overrideVoiceId || this.getDefaultVoiceId();
    const modelId = this.getDefaultModelId();
    const cacheKey = getCacheKey(text.trim(), voiceId, modelId);

    // 1. Check memory cache
    if (memoryAudioCache.has(cacheKey)) {
      return {
        audioBuffer: memoryAudioCache.get(cacheKey)!,
        contentType: 'audio/mpeg',
        cached: true
      };
    }

    // 2. Check disk cache
    const diskPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
    try {
      if (fs.existsSync(diskPath)) {
        const diskBuffer = fs.readFileSync(diskPath);
        memoryAudioCache.set(cacheKey, diskBuffer);
        return {
          audioBuffer: diskBuffer,
          contentType: 'audio/mpeg',
          cached: true
        };
      }
    } catch (e) {
      // Continue to API fetch if disk read fails
    }

    if (!this.isConfigured()) {
      throw new Error('ELEVENLABS_API_KEY is not configured on the server. Falling back to browser Web Speech API.');
    }

    const apiKey = process.env.ELEVENLABS_API_KEY!.trim();
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: modelId,
        voice_settings: {
          stability: 0.50,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`ElevenLabs TTS API error (${response.status}): ${errorText || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Save to memory cache
    memoryAudioCache.set(cacheKey, audioBuffer);

    // Save to disk cache asynchronously
    try {
      fs.writeFile(diskPath, audioBuffer, () => {});
    } catch (e) {
      // Non-blocking disk write
    }

    return {
      audioBuffer,
      contentType: 'audio/mpeg',
      cached: false
    };
  }
};
