import handler from './index.js';

export default async function waitlistEndpoint(req, res) {
  req.url = '/api/waitlist';
  return handler(req, res);
}
