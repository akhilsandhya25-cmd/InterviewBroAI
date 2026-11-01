import handler from './index.js';

export default async function healthEndpoint(req, res) {
  req.url = '/api/health';
  return handler(req, res);
}
