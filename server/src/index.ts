import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { isGeminiConfigured } from './services/geminiService.js';
import { elevenlabsService } from './services/elevenlabsService.js';
// @ts-ignore - Unified Vercel serverless router (Single Source of Truth)
import vercelHandler, { validateRequiredEnvironment } from '../../api/index.js';

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

// Health Check redirect
app.get('/health', (_req, res) => {
  res.redirect('/api/health');
});

// Unified Vercel Serverless Handler mounted on Express for local dev
// Both local dev and production run through the exact same code
app.all('/api/*', async (req: express.Request, res: express.Response) => {
  try {
    await vercelHandler(req, res);
  } catch (err: any) {
    console.error('Unified API Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'SERVER_ERROR', message: err.message || 'Server error' });
    }
  }
});

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

  // Startup Environment & Configuration Validation
  const envValidation = validateRequiredEnvironment();
  console.log('\n--- Environment & Service Configuration Audit ---');
  console.log(`🔑 Google Gemini (GEMINI_API_KEY): ${envValidation.services.gemini ? '✅ Configured' : '❌ MISSING (AI endpoints will return 503 AI_NOT_CONFIGURED)'}`);
  console.log(`🗄️ Supabase Public API (SUPABASE_URL, ANON_KEY): ${envValidation.services.supabase ? '✅ Configured' : '❌ MISSING'}`);
  console.log(`🛡️ Supabase Service Role (SUPABASE_SERVICE_ROLE_KEY): ${envValidation.services.supabaseServiceRole ? '✅ Configured (Full DPDP Right-to-Erasure Active)' : '⚠️ MISSING (Required for full auth user deletion under DPDP)'}`);
  console.log(`🎙️ ElevenLabs Voice (ELEVENLABS_API_KEY): ${envValidation.services.elevenlabs ? '✅ Configured' : 'ℹ️ Not set (Using Web Speech API fallback)'}`);
  console.log(`🚨 Sentry Error Monitoring (SENTRY_DSN): ${envValidation.services.sentry ? '✅ Configured' : 'ℹ️ Not set (Local safe logging mode)'}`);

  if (!envValidation.valid) {
    console.warn('\n⚠️ [STARTUP WARNING] Missing required environment variables:');
    envValidation.missingRequiredEnvVars.forEach((v: string) => console.warn(`   - ${v}`));
    console.warn('   Add these to .env.local or your Vercel project environment variables.\n');
  } else {
    console.log('✅ All required environment variables are configured.\n');
  }
});
