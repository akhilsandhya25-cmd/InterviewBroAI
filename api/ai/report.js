import handler from '../index.js';

export default async function aiReportEndpoint(req, res) {
  req.url = '/api/ai/report';
  return handler(req, res);
}
