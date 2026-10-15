import { Router, Request, Response } from 'express';
import { openaiService, isOpenAIConfigured } from '../services/openaiService.js';

export const aiRouter = Router();

// POST /api/ai/questions
aiRouter.post('/questions', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    if (isOpenAIConfigured) {
      const questions = await openaiService.generateInterviewQuestions(config);
      return res.json({ success: true, questions, source: 'openai' });
    }
    // Return flag to let client use its curated fallback bank
    return res.status(200).json({ 
      success: true, 
      questions: null, 
      message: 'Server in local fallback mode (OPENAI_API_KEY not configured)' 
    });
  } catch (error: any) {
    console.warn('AI question generation error, falling back:', error.message);
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

    if (isOpenAIConfigured) {
      const evaluation = await openaiService.evaluateCandidateAnswer(question, answer, config || {});
      return res.json({ success: true, evaluation, source: 'openai' });
    }

    return res.json({ 
      success: true, 
      evaluation: null, 
      message: 'Server in local fallback mode' 
    });
  } catch (error: any) {
    console.warn('AI evaluation error, falling back:', error.message);
    return res.status(200).json({ success: true, evaluation: null, error: error.message });
  }
});

// POST /api/ai/follow-up
aiRouter.post('/follow-up', async (req: Request, res: Response) => {
  try {
    const { question, answer, config } = req.body;
    if (isOpenAIConfigured) {
      const followUp = await openaiService.generateFollowUpQuestion(question, answer, config || {});
      return res.json({ success: true, followUp, source: 'openai' });
    }
    return res.json({ success: true, followUp: null });
  } catch (error: any) {
    console.warn('AI follow-up error, falling back:', error.message);
    return res.status(200).json({ success: true, followUp: null, error: error.message });
  }
});

// POST /api/ai/final-report
aiRouter.post('/final-report', async (req: Request, res: Response) => {
  try {
    const { questions, config, candidateName } = req.body;
    if (isOpenAIConfigured) {
      const report = await openaiService.generateComprehensiveReport(questions, config || {}, candidateName || 'Candidate');
      return res.json({ success: true, report, source: 'openai' });
    }
    return res.json({ success: true, report: null });
  } catch (error: any) {
    console.warn('AI final report error, falling back:', error.message);
    return res.status(200).json({ success: true, report: null, error: error.message });
  }
});
