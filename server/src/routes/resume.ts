import { Router, Response } from 'express';
import multer from 'multer';
import { resumeParser } from '../services/resumeParser.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const resumeRouter = Router();

// Configure multer memory storage (limit 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/resume/parse
resumeRouter.post('/parse', optionalAuth, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const targetRole = req.body.targetRole || 'Software Engineer';
    const text = await resumeParser.extractText(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    const analysis = await resumeParser.analyze(
      text,
      targetRole,
      req.file.originalname,
      req.file.size
    );

    return res.json({ success: true, analysis });
  } catch (error: any) {
    console.error('Resume parsing error:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse resume' });
  }
});
