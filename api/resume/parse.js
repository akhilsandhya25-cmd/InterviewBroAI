import handler from '../index.js';

export default async function resumeParseEndpoint(req, res) {
  req.url = '/api/resume/parse';
  return handler(req, res);
}
