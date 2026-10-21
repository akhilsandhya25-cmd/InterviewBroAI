// =========================================================================
// Shared Resume Parser Service (Single Source of Truth)
// Re-exports the unified serverless resume parser from api/resume.js
// =========================================================================

// @ts-ignore
import * as resumeModule from '../../../api/resume.js';

export const resumeParser: any = (resumeModule as any).resumeParser;
export const extractTextFromBuffer: any = (resumeModule as any).extractTextFromBuffer;
export const analyzeWithGemini: any = (resumeModule as any).analyzeWithGemini;
export const performRuleBasedAnalysis: any = (resumeModule as any).performRuleBasedAnalysis;

export default resumeModule;
