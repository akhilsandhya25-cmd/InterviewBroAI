import handler from '../index.js';

export default async function aiCatchAll(req, res) {
  const subSlug = Array.isArray(req.query?.slug) ? req.query.slug.join('/') : (req.query?.slug || '');
  if (!req.url || req.url === '/' || !req.url.includes('/ai/')) {
    req.url = '/api/ai/' + subSlug;
  }
  return handler(req, res);
}
