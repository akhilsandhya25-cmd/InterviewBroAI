import handler from '../index.js';

export default async function aiCoachEndpoint(req, res) {
  req.url = '/api/ai/coach';
  return handler(req, res);
}
