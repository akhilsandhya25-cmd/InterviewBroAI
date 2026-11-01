import handler from '../index.js';

export default async function resumeCatchAll(req, res) {
  const subSlug = Array.isArray(req.query?.slug) ? req.query.slug.join('/') : (req.query?.slug || '');
  if (!req.url || req.url === '/' || !req.url.includes('/resume/')) {
    req.url = '/api/resume/' + subSlug;
  }
  return handler(req, res);
}
