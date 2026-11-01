import handler from '../index.js';

export default async function voiceStatusEndpoint(req, res) {
  req.url = '/api/voice/status';
  return handler(req, res);
}
