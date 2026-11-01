import handler from './index.js';

export default async function statusEndpoint(req, res) {
  req.url = '/api/status';
  return handler(req, res);
}
