import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY || '';
export const isOpenAIConfigured = Boolean(apiKey && !apiKey.includes('your-openai-api-key'));

const openai = isOpenAIConfigured ? new OpenAI({ apiKey }) : null;

export const openaiService = {
  // Generate structured interview questions
  async generateInterviewQuestions(config: any): Promise<any[]> {
    if (!openai) {
      throw new Error('OPENAI_API_KEY not configured on server');
    }

    const prompt = `You are a senior technical interviewer and hiring manager conducting an interview for ${config.companyName || 'a top tech company'}.
Candidate Target Role: ${config.role}
Experience Level: ${config.experienceLevel} (student / fresher / junior / senior)
Interview Type: ${config.interviewType} (technical / behavioral / hr / system_design / mixed)
Difficulty: ${config.difficulty}
Number of questions: ${config.questionCount || 3}
Target Company Style: ${config.companyCategory || 'General Product Company'}
${config.jobDescription ? `Target Job Description: ${config.jobDescription}` : ''}
${config.resumeText ? `Candidate Resume / Projects: ${config.resumeText}` : ''}

Generate exactly ${config.questionCount || 3} realistic, challenging interview questions specifically relevant to this role, experience level, and company standards.
Respond ONLY with a JSON object in this format:
{
  "questions": [
    {
      "orderIndex": 0,
      "questionText": "Question text here",
      "category": "technical",
      "contextOrHints": "What key concepts the candidate should cover"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{"questions": []}');
    return (parsed.questions || []).map((q: any, i: number) => ({
      id: `q-ai-${Date.now()}-${i}`,
      orderIndex: i,
      questionText: q.questionText,
      category: q.category || 'technical',
      contextOrHints: q.contextOrHints || ''
    }));
  },

  // Evaluate candidate answer with STAR methodology
  async evaluateCandidateAnswer(question: any, answer: string, config: any): Promise<any> {
    if (!openai) {
      throw new Error('OPENAI_API_KEY not configured on server');
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer for the position of ${config.role} at ${config.companyName}.
Question Asked: "${question.questionText}"
Question Category: ${question.category}
Candidate Answer: "${answer}"

Provide an objective, constructive evaluation. For behavioral answers, grade whether the STAR method (Situation, Task, Action, Result) was utilized.
Respond ONLY with a valid JSON object in this format:
{
  "score": 85,
  "accuracyScore": 88,
  "communicationScore": 82,
  "structureScore": 85,
  "completenessScore": 85,
  "starMethodologyUsed": true,
  "feedback": "2-3 sentences of clear constructive feedback directly to the candidate.",
  "strengths": ["Strength 1", "Strength 2"],
  "missedPoints": ["Concept or detail candidate failed to mention", "Production edge case"],
  "betterAnswerExample": "How a top 1% candidate would formulate this answer concisely and with concrete metrics."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  },

  // Generate follow-up probing question
  async generateFollowUpQuestion(question: any, answer: string, config: any): Promise<any> {
    if (!openai) {
      throw new Error('OPENAI_API_KEY not configured on server');
    }

    const prompt = `You are an interviewer listening to this candidate answer for ${config.role} at ${config.companyName}.
Initial Question: "${question.questionText}"
Candidate's Answer: "${answer}"

Ask a realistic follow-up probing question that challenges their assumption, tests edge cases, scale constraints (e.g. 10x traffic spike or network failure), or asks them to defend their technical choice.
Respond ONLY with a JSON object:
{
  "questionText": "Follow-up question text",
  "category": "${question.category}",
  "contextOrHints": "What the interviewer is testing"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      id: `q-followup-${Date.now()}`,
      orderIndex: question.orderIndex + 1,
      questionText: parsed.questionText,
      category: parsed.category || question.category,
      contextOrHints: parsed.contextOrHints || '',
      isFollowUp: true,
      followUpToQuestionId: question.id
    };
  },

  // Generate comprehensive final report
  async generateComprehensiveReport(questions: any[], config: any, candidateName: string): Promise<any> {
    if (!openai) {
      throw new Error('OPENAI_API_KEY not configured on server');
    }

    const transcriptSummary = questions.map((q, i) => `
Question ${i + 1}: ${q.questionText}
Candidate Answer: ${q.candidateAnswer || 'No answer provided'}
Score: ${q.evaluation?.score || 'N/A'}
Feedback: ${q.evaluation?.feedback || 'N/A'}
`).join('\n---\n');

    const prompt = `You are the lead bar raiser and hiring committee member.
Candidate: ${candidateName}
Target Role: ${config.role}
Company: ${config.companyName}
Interview Type: ${config.interviewType}

Transcript of the session:
${transcriptSummary}

Synthesize a comprehensive, executive evaluation report with actionable growth recommendations.
Respond ONLY with a JSON object matching this schema:
{
  "overallScore": 82,
  "technicalAccuracyScore": 84,
  "communicationScore": 80,
  "structureStarScore": 82,
  "relevanceScore": 85,
  "summary": "Executive summary of candidate performance",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
  "missedConcepts": ["Concept 1", "Concept 2"],
  "actionableImprovements": ["Tip 1", "Tip 2", "Tip 3"],
  "recommendedTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "exampleImprovedAnswers": [
    {
      "question": "Question text",
      "originalSummary": "Brief recap of what candidate said",
      "improvedAnswer": "Exemplary model answer",
      "whyBetter": "Explanation of structural improvement"
    }
  ],
  "prepPlan": [
    {
      "dayOrPhase": "Phase 1: Foundation & Core Concepts",
      "focus": "Topic focus",
      "actionItems": ["Action 1", "Action 2"]
    },
    {
      "dayOrPhase": "Phase 2: Behavioral STAR Stories",
      "focus": "Topic focus",
      "actionItems": ["Action 1", "Action 2"]
    },
    {
      "dayOrPhase": "Phase 3: High-Pressure Mock Drills",
      "focus": "Topic focus",
      "actionItems": ["Action 1", "Action 2"]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      ...parsed,
      id: `rep-${Date.now()}`,
      sessionId: `sess-${Date.now()}`,
      candidateName,
      role: config.role,
      company: config.companyName,
      interviewType: config.interviewType,
      questionsEvaluated: questions,
      createdAt: new Date().toISOString()
    };
  }
};
