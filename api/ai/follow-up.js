import handler from '../index.js';

export default async function aiFollowUpEndpoint(req, res) {
  req.url = '/api/ai/follow-up';
  return handler(req, res);
}
