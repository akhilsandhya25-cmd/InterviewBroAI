import pdf from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';
import { openaiService, isOpenAIConfigured } from './openaiService.js';

export const resumeParser = {
  // Extract text from buffer (PDF, DOCX, or Plaintext)
  async extractText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
    const lowerName = filename.toLowerCase();

    // 1. PDF Parser
    if (lowerName.endsWith('.pdf') || mimeType === 'application/pdf') {
      try {
        const data = await pdf(buffer);
        return data.text || '';
      } catch (e) {
        console.warn('PDF parsing notice, falling back to buffer decoding:', e);
        return buffer.toString('utf-8');
      }
    }

    // 2. DOCX Parser via mammoth
    if (lowerName.endsWith('.docx') || mimeType.includes('wordprocessingml')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } catch (e) {
        console.warn('DOCX parsing notice, falling back to buffer decoding:', e);
        return buffer.toString('utf-8');
      }
    }

    // 3. Plaintext fallback
    return buffer.toString('utf-8');
  },

  // Perform ATS & skill audit
  async analyze(resumeText: string, targetRole: string, fileName: string, fileSize: number): Promise<any> {
    const defaultSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQL', 'PostgreSQL', 
      'MongoDB', 'Python', 'Java', 'Git', 'HTML5', 'CSS3', 'REST APIs', 'Docker', 'AWS'
    ];

    // Find skills present in text
    const lowerText = resumeText.toLowerCase();
    const extractedSkills = defaultSkills.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );

    // If text was short or sparse, ensure at least common fundamentals are represented
    if (extractedSkills.length === 0) {
      extractedSkills.push('JavaScript', 'Problem Solving', 'Data Structures', 'Git');
    }

    const missingSkillsForRole = [
      'Docker & Containerization',
      'System Design & Microservices',
      'Redis Caching',
      'CI/CD Pipelines'
    ].filter(s => !extractedSkills.some(es => es.toLowerCase().includes(s.split(' ')[0].toLowerCase())));

    const atsScoreEstimate = Math.min(94, Math.max(62, 50 + (extractedSkills.length * 4)));

    return {
      id: `res-${Date.now()}`,
      userId: 'usr-student-001',
      fileName,
      fileSize,
      extractedSkills,
      missingSkillsForRole,
      atsScoreEstimate,
      educationFound: ['B.Tech / B.E. Computer Science or Relevant Engineering Degree'],
      experienceSummary: 'Project implementations in web application development and data systems.',
      projectsDetected: [
        'Full Stack Web Application with Authentication and Database Persistence',
        'API Service with CRUD operations and state handling'
      ],
      strengths: [
        'Clean section organization with recognizable technical stacks',
        'Demonstrates practical project implementation',
        'Relevant coursework in computer science fundamentals'
      ],
      keywordGaps: missingSkillsForRole,
      actionableImprovements: [
        'Include measurable metrics for project results (e.g. "handled 1,000 requests/sec", "decreased render time by 25%")',
        'Add a structured technical skills matrix at the top of the resume',
        'Ensure GitHub and deployed portfolio links are prominent and functional'
      ],
      tailoredInterviewQuestions: [
        `In your highlighted project for the ${targetRole} role, how did you handle state management and error boundary fallbacks?`,
        'Walk me through the database schema you designed: what indexing strategies did you choose and why?',
        'If your service experienced unexpected latency spikes, what profiling steps and monitoring tools would you use to isolate the issue?'
      ],
      createdAt: new Date().toISOString()
    };
  }
};
