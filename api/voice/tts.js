import handler from '../index.js';

export default async function voiceTtsEndpoint(req, res) {
  req.url = '/api/voice/tts';
  return handler(req, res);
}
