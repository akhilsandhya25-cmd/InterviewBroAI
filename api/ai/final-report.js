import handler from '../index.js';

export default async function aiFinalReportEndpoint(req, res) {
  req.url = '/api/ai/final-report';
  return handler(req, res);
}
