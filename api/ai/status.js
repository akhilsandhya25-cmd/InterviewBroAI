import handler from '../index.js';

export default async function aiStatusEndpoint(req, res) {
  req.url = '/api/ai/status';
  return handler(req, res);
}
