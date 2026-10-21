// =========================================================================
// Shared Gemini 2.5 AI Service (Single Source of Truth)
// Re-exports the unified serverless AI engine from api/gemini.js
// =========================================================================

// @ts-ignore
import * as geminiModule from '../../../api/gemini.js';

export const isGeminiConfigured: boolean = (geminiModule as any).isGeminiConfigured;
export const getIsGeminiConfigured: () => boolean = (geminiModule as any).getIsGeminiConfigured;
export const cleanSpokenQuestion: (text: string) => string = (geminiModule as any).cleanSpokenQuestion;
export const generateIntelligentFollowUpFallback: (ans: string, prev?: string, role?: string) => any = (geminiModule as any).generateIntelligentFollowUpFallback;
export const geminiService: any = (geminiModule as any).geminiService;
export const normalizeQuestion: (text: string) => string = (geminiModule as any).normalizeQuestion;
export const getQuestionTokens: (text: string) => Set<string> = (geminiModule as any).getQuestionTokens;
export const getQuestionBigrams: (text: string) => Set<string> = (geminiModule as any).getQuestionBigrams;
export const computeQuestionSimilarity: (t1: string, t2: string) => number = (geminiModule as any).computeQuestionSimilarity;
export const deduplicateQuestions: (qs: any[], role?: string) => any[] = (geminiModule as any).deduplicateQuestions;
export const buildGeminiPrompt: (role: string, comp?: string, type?: string, count?: number) => string = (geminiModule as any).buildGeminiPrompt;
export const parseGeminiQuestions: (text: string, count?: number) => any[] = (geminiModule as any).parseGeminiQuestions;
export const parseGeminiEvaluation: (text: string) => any = (geminiModule as any).parseGeminiEvaluation;
export const ROUND_RUBRICS: any = (geminiModule as any).ROUND_RUBRICS;
export const getRubricForRound: (round?: string, cat?: string) => any = (geminiModule as any).getRubricForRound;
export const getExperienceLevelGuideline: (level?: string) => string = (geminiModule as any).getExperienceLevelGuideline;
export const getCompanyTrack: (nameOrId?: string) => any = (geminiModule as any).getCompanyTrack;

export default geminiModule;
