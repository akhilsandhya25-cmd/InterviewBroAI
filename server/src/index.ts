import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { aiRouter } from './routes/ai.js';
import { resumeRouter } from './routes/resume.js';
import { isGeminiConfigured } from './services/geminiService.js';

// Load environment configurations from root and server directories
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'InterviewBro AI Backend',
    provider: 'Google Gemini',
    isGeminiConfigured,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/ai', aiRouter);
app.use('/api/resume', resumeRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 InterviewBro AI Server listening on http://localhost:${PORT}`);
  console.log(`🔑 Google Gemini Integration: ${isGeminiConfigured ? 'Active (GEMINI_API_KEY loaded)' : 'Offline / Local fallback mode (GEMINI_API_KEY not configured)'}`);
});
