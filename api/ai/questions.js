import handler from '../index.js';

export default async function aiQuestionsEndpoint(req, res) {
  req.url = '/api/ai/questions';
  return handler(req, res);
}
