import { Router, Request, Response } from 'express';
import { geminiService, isGeminiConfigured } from '../services/geminiService.js';

export const aiRouter = Router();

// POST /api/ai/questions
aiRouter.post('/questions', async (req: Request, res: Response) => {
  try {
    const { previousQuestions, adaptiveContext, ...config } = req.body;
    if (isGeminiConfigured) {
      const mergedConfig = { ...config, adaptiveContext };
      const questions = await geminiService.generateInterviewQuestions(mergedConfig, previousQuestions || []);
      return res.json({ success: true, questions, source: 'gemini' });
    }
    // Return flag to let client use its curated fallback bank
    return res.status(200).json({ 
      success: true, 
      questions: null, 
      message: 'Server in local fallback mode (GEMINI_API_KEY not configured)' 
    });
  } catch (error: any) {
    console.warn('Gemini question generation error, falling back:', error.message);
    return res.status(200).json({ success: true, questions: null, error: error.message });
  }
});

// POST /api/ai/evaluate
aiRouter.post('/evaluate', async (req: Request, res: Response) => {
  try {
    const { question, answer, config } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Missing question or answer' });
    }

    if (isGeminiConfigured) {
      const evaluation = await geminiService.evaluateCandidateAnswer(question, answer, config || {});
      return res.json({ success: true, evaluation, source: 'gemini' });
    }

    // Honest unconfigured status - no fabricated scores
    return res.json({ 
      success: true, 
      evaluation: {
        status: 'unavailable',
        unavailableReason: 'AI evaluation service is unconfigured on the server (GEMINI_API_KEY is not configured in server/.env.local). Your answer has been recorded into the transcript, but scores are not fabricated.',
        score: 0,
        feedback: 'AI evaluation service is unconfigured on the server. Your answer has been safely recorded in the transcript. InterviewBro AI never invents or fabricates arbitrary scores.',
        strengths: ['Candidate answer safely recorded in transcript.'],
        missedPoints: ['Automated scoring requires GEMINI_API_KEY in server environment.'],
        betterAnswerExample: 'Configure GEMINI_API_KEY in server/.env.local (from https://aistudio.google.com/app/apikey) to enable deep 5-category evaluation and verified factual checks.'
      },
      message: 'Server in local fallback mode (GEMINI_API_KEY not configured)' 
    });
  } catch (error: any) {
    console.warn('Gemini evaluation error, returning unavailable status:', error.message);
    return res.status(200).json({ 
      success: true, 
      evaluation: {
        status: 'unavailable',
        unavailableReason: `AI evaluation service error: ${error.message}. Scores will not be fabricated.`,
        score: 0,
        feedback: 'Evaluation service encountered an error. Your answer has been saved safely.',
        strengths: [],
        missedPoints: [],
        betterAnswerExample: ''
      }, 
      error: error.message 
    });
  }
});

// POST /api/ai/follow-up
aiRouter.post('/follow-up', async (req: Request, res: Response) => {
  try {
    const { question, answer, config, previousQuestions, previousScore } = req.body;
    if (isGeminiConfigured) {
      const followUp = await geminiService.generateFollowUpQuestion(
        question, 
        answer, 
        config || {}, 
        previousQuestions || [], 
        previousScore
      );
      return res.json({ success: true, followUp, source: 'gemini' });
    }
    return res.json({ success: true, followUp: null });
  } catch (error: any) {
    console.warn('Gemini follow-up error, falling back:', error.message);
    return res.status(200).json({ success: true, followUp: null, error: error.message });
  }
});

// POST /api/ai/final-report
aiRouter.post('/final-report', async (req: Request, res: Response) => {
  try {
    const { questions, config, candidateName } = req.body;
    if (isGeminiConfigured) {
      const report = await geminiService.generateComprehensiveReport(questions, config || {}, candidateName || 'Candidate');
      return res.json({ success: true, report, source: 'gemini' });
    }
    return res.json({ success: true, report: null });
  } catch (error: any) {
    console.warn('Gemini final report error, falling back:', error.message);
    return res.status(200).json({ success: true, report: null, error: error.message });
  }
});
