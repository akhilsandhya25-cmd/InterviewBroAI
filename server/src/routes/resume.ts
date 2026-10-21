// =========================================================================
// Express Route Wrapper for /api/resume
// Forwards all requests to the unified serverless router in api/index.js
// Single source of truth — zero logic duplication.
// =========================================================================

import { Router } from 'express';
// @ts-ignore
import vercelHandler from '../../../api/index.js';

export const resumeRouter = Router();

resumeRouter.all('*', async (req, res) => {
  try {
    await vercelHandler(req, res);
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Server error' });
    }
  }
});
