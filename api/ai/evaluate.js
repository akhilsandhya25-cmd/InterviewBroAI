import handler from '../index.js';

export default async function aiEvaluateEndpoint(req, res) {
  req.url = '/api/ai/evaluate';
  return handler(req, res);
}
