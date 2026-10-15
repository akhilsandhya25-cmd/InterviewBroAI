import { Router, Request, Response } from 'express';
import { elevenlabsService } from '../services/elevenlabsService.js';

export const voiceRouter = Router();

// GET /api/voice/status
voiceRouter.get('/status', async (_req: Request, res: Response) => {
  const isConfigured = elevenlabsService.isConfigured();
  return res.json({
    success: true,
    isConfigured,
    activeVoiceId: elevenlabsService.getDefaultVoiceId(),
    activeModelId: elevenlabsService.getDefaultModelId(),
    provider: isConfigured ? 'elevenlabs' : 'web_speech_fallback',
    message: isConfigured 
      ? 'ElevenLabs low-latency voice integration is active' 
      : 'ElevenLabs not configured; browser Web Speech API serves as automatic default'
  });
});

// GET /api/voice/voices
voiceRouter.get('/voices', async (_req: Request, res: Response) => {
  try {
    const voices = await elevenlabsService.getVoices();
    return res.json({
      success: true,
      voices,
      isElevenLabsActive: elevenlabsService.isConfigured()
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/voice/tts
voiceRouter.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceId } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text field is required for speech synthesis.' });
    }

    if (!elevenlabsService.isConfigured()) {
      return res.status(503).json({
        success: false,
        fallback: true,
        message: 'ElevenLabs is not configured on this server. Fall back to browser Web Speech API.'
      });
    }

    const { audioBuffer, contentType, cached } = await elevenlabsService.synthesizeSpeech(
      text, 
      voiceId
    );

    res.set({
      'Content-Type': contentType,
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400',
      'X-Audio-Cached': cached ? 'HIT' : 'MISS'
    });

    return res.send(audioBuffer);
  } catch (error: any) {
    console.warn('TTS synthesis error, signaling client fallback:', error.message);
    return res.status(502).json({
      success: false,
      fallback: true,
      error: error.message
    });
  }
});
