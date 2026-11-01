import handler from '../index.js';

export default async function voiceVoicesEndpoint(req, res) {
  req.url = '/api/voice/voices';
  return handler(req, res);
}
