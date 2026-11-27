/**
 * InterviewBro AI — Video-Extracted Real Interview Question Repository (Serverless ES Module)
 * api/_lib/videoQuestionBank.js
 *
 * Source Video: https://www.youtube.com/watch?v=BYKqJkDxg9U (Video ID: BYKqJkDxg9U)
 * Role / Domain: Customer Service Representative / Call Center (BPO)
 * Candidate Level: Fresh Graduate (calibrated for limited/no prior corporate experience)
 */

export const SOURCE_VIDEO_BYKQ = {
  id: 'BYKqJkDxg9U',
  url: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
  title: 'Real Customer Service Representative / Call Center Interview for Fresh Graduates',
  targetRole: 'Customer Service Representative (Call Center / BPO)',
  candidateLevel: 'Fresh Graduate',
  description: 'Authentic 18-question interview pipeline for entry-level call center candidates, testing adaptability, customer de-escalation, process communication, and curveball responsiveness.'
};

export const VIDEO_PRIMARY_QUESTIONS = [
  {
    id: 'vid-bykq-01',
    originalText: 'Tell me about yourself.',
    questionText: 'Tell me about yourself.',
    category: 'HR and Personality',
    universalCategory: 'self_introduction',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '00:32',
    timestampSeconds: 32,
    evaluationCriteria: 'Structure (Present-Past-Future), clarity of English diction, enthusiasm, authentic motivation for customer support, and keeping within 60 to 90 seconds without reciting resume word-for-word.',
    whatInterviewerLooksFor: 'Active voice, clear pronunciation, positive demeanor, and connecting academic background to customer communication.',
    hints: 'Share your degree, key communication strengths or campus activities, and why you are excited to begin your career in customer service.',
    sampleAnswerOutline: [
      'Warm greeting and name, followed by recent graduation details and major.',
      'Core communication and interpersonal strengths developed during college or co-curricular projects.',
      'Why you are deliberately stepping into customer service and what value you bring to the team.'
    ],
    subDomainTag: 'Call Center Fresher Self-Introduction',
    followUpQuestionIds: ['vid-bykq-01-fu1', 'vid-bykq-01-fu2']
  },
  {
    id: 'vid-bykq-02',
    originalText: 'Why could it take five years before you get a permanent teaching position?',
    questionText: 'Why could it take five years before you get a permanent teaching position?',
    category: 'Career Goals',
    universalCategory: 'career_exploration',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '01:45',
    timestampSeconds: 105,
    evaluationCriteria: 'Objective perspective on industry barriers, lack of bitterness, practical career pragmatism, and understanding corporate mobility.',
    whatInterviewerLooksFor: 'Honesty regarding institutional licensure backlogs or public school appointment queues, balancing passion with realistic financial and professional independence.',
    hints: 'Acknowledge the licensure exam and tenure ranking backlog objectively without criticizing the system, and highlight why corporate customer service offers faster growth and merit-based advancement.',
    sampleAnswerOutline: [
      'Explain the objective backlog in government appointments and license rankings.',
      'Emphasize your proactive desire to build financial independence and practical career experience immediately.',
      'Connect how communication and patience from teaching translate directly into customer care excellence.'
    ],
    subDomainTag: 'Career Transition & Reality Check',
    followUpQuestionIds: ['vid-bykq-02-fu1', 'vid-bykq-02-fu2']
  },
  {
    id: 'vid-bykq-03',
    originalText: 'Are you aware of the tasks of a Customer Service Representative?',
    questionText: 'Are you aware of the tasks of a Customer Service Representative?',
    category: 'Role Knowledge',
    universalCategory: 'subject_specific',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '02:28',
    timestampSeconds: 148,
    evaluationCriteria: 'Accurate comprehension of core CSR duties: handling inbound/outbound calls, active listening, troubleshooting, ticket documentation, customer empathy, and meeting SLA targets.',
    whatInterviewerLooksFor: 'Realistic understanding of daily call volume, multitasking between speaking and CRM typing, de-escalation, and representing the brand positively.',
    hints: 'Mention call handling, active listening, ticket logging, resolving customer issues within SLAs, and maintaining patience during challenging calls.',
    sampleAnswerOutline: [
      'Handling inbound and outbound customer inquiries via voice, email, and live chat.',
      'Active listening and navigating knowledge bases/CRM tools to troubleshoot issues.',
      'Accurate case documentation and following up to ensure first-call resolution.'
    ],
    subDomainTag: 'CSR Core Responsibilities',
    followUpQuestionIds: ['vid-bykq-03-fu1', 'vid-bykq-03-fu2']
  },
  {
    id: 'vid-bykq-04',
    originalText: 'Did you discover other fields or industries aside from the BPO industry?',
    questionText: 'Did you discover other fields or industries aside from the BPO industry?',
    category: 'Critical Thinking',
    universalCategory: 'career_exploration',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '03:10',
    timestampSeconds: 190,
    evaluationCriteria: 'Demonstration of proactive research into various job sectors and deliberate, reasoned selection of BPO rather than viewing it merely as a last resort.',
    whatInterviewerLooksFor: 'Career intentionality, mature evaluation of pros and cons across industries, and long-term interest in BPO operations.',
    hints: 'Discuss alternative fields you explored (such as ESL teaching, administrative work, or retail) and clearly articulate why BPO offers superior training, global exposure, and career growth.',
    sampleAnswerOutline: [
      'Acknowledge exploring fields like ESL tutoring and administrative coordination.',
      'Compare the slower advancement or limited scope of those fields against BPO dynamism.',
      'Confirm that BPO was chosen intentionally for its structured training, international client exposure, and performance meritocracy.'
    ],
    subDomainTag: 'Industry Comparison & Choice',
    followUpQuestionIds: ['vid-bykq-04-fu1', 'vid-bykq-04-fu2']
  },
  {
    id: 'vid-bykq-05',
    originalText: 'How is a call center more diverse than ESL teaching?',
    questionText: 'How is a call center more diverse than ESL teaching?',
    category: 'Critical Thinking',
    universalCategory: 'subject_specific',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '04:05',
    timestampSeconds: 245,
    evaluationCriteria: 'Recognition of demographic, cultural, problem complexity, and emotional diversity in global contact centers compared to student classroom interactions.',
    whatInterviewerLooksFor: 'Analytical depth: understanding that contact centers deal with customers of all ages, cultures, temperaments, technical capabilities, and urgency levels.',
    hints: 'Contrast the relatively uniform demographic and cooperative mindset of ESL students with the wide spectrum of emotions, accents, and complex real-time problems handled in a call center.',
    sampleAnswerOutline: [
      'In ESL teaching, students share a common goal of learning and generally display cooperative attitudes.',
      'In a global call center, callers come from diverse geographical regions, socio-economic backgrounds, and varying emotional states (from calm to furious).',
      'Call centers demand rapid code-switching, cultural adaptability, and versatile problem-solving across completely different query types.'
    ],
    subDomainTag: 'Cultural & Emotional Diversity in BPO',
    followUpQuestionIds: ['vid-bykq-05-fu1', 'vid-bykq-05-fu2']
  },
  {
    id: 'vid-bykq-06',
    originalText: 'What exactly are you looking for in a job?',
    questionText: 'What exactly are you looking for in a job?',
    category: 'Career Goals',
    universalCategory: 'hr_general',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '05:12',
    timestampSeconds: 312,
    evaluationCriteria: 'Alignment of personal career aspirations with entry-level contact center realities: training, supportive mentorship, clear KPIs, and long-term internal advancement.',
    whatInterviewerLooksFor: 'Realistic fresh graduate expectations, passion for skill acquisition, team orientation, and loyalty/retention potential.',
    hints: 'Focus on comprehensive training, supportive team culture, constructive feedback from leadership, and transparent promotion tracks.',
    sampleAnswerOutline: [
      'Robust initial training and continuous coaching to master customer interaction skills.',
      'A positive, team-driven environment that values accountability and celebrates milestones.',
      'Clear, merit-based career pathways where high performance leads to leadership or QA opportunities.'
    ],
    subDomainTag: 'Job Expectations & Value Fit',
    followUpQuestionIds: ['vid-bykq-06-fu1', 'vid-bykq-06-fu2']
  },
  {
    id: 'vid-bykq-07',
    originalText: 'What kind of work environment do you like best?',
    questionText: 'What kind of work environment do you like best?',
    category: 'HR and Personality',
    universalCategory: 'hr_general',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '06:00',
    timestampSeconds: 360,
    evaluationCriteria: 'Ability to thrive in an energetic, collaborative, fast-paced, and metric-driven operational workspace.',
    whatInterviewerLooksFor: 'Comfort with buzzing production floors, open feedback, collaborative peer support, and resilience under operational noise.',
    hints: 'Highlight your appreciation for collaborative spaces where team members assist one another during escalations and where supervisors provide active floor support.',
    sampleAnswerOutline: [
      'An energetic, supportive atmosphere where teammates collaborate and share best practices.',
      'Transparent communication with accessible team leaders who provide actionable coaching.',
      'A structured environment with well-defined resources and clear performance benchmarks.'
    ],
    subDomainTag: 'Workplace Culture Fit',
    followUpQuestionIds: ['vid-bykq-07-fu1', 'vid-bykq-07-fu2']
  },
  {
    id: 'vid-bykq-08',
    originalText: 'How would you handle a dissatisfied customer who received the wrong dress?',
    questionText: 'How would you handle a dissatisfied customer who received the wrong dress?',
    category: 'Customer Service',
    universalCategory: 'subject_specific',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '06:48',
    timestampSeconds: 408,
    evaluationCriteria: 'De-escalation mastery: empathic listening without interrupting, sincere apology acknowledging customer frustration, immediate ownership, and structured resolution steps.',
    whatInterviewerLooksFor: 'HEAT model (Hear, Empathize, Apologize, Take Action), avoiding defensive excuses, verifying order details, and arranging expedited shipping or replacement.',
    hints: 'Use the HEAT framework: Let the customer vent without interruption, express genuine empathy ("I completely understand how disappointing this is, especially with your event coming up"), verify the order number, and initiate express replacement.',
    sampleAnswerOutline: [
      'Hear and acknowledge: Listen actively without cutting the customer off, taking detailed notes.',
      'Empathize and apologize: "I am truly sorry that you received the wrong dress, especially when you were expecting it for your event."',
      'Take ownership and resolve: Confirm the correct order, initiate express priority delivery for the correct dress, and provide a prepaid return slip with tracking.'
    ],
    subDomainTag: 'Retail Customer De-escalation',
    followUpQuestionIds: ['vid-bykq-08-fu1', 'vid-bykq-08-fu2']
  },
  {
    id: 'vid-bykq-09',
    originalText: 'How would you communicate the refund and compensation to the customer?',
    questionText: 'How would you communicate the refund and compensation to the customer?',
    category: 'Communication',
    universalCategory: 'communication',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '08:15',
    timestampSeconds: 495,
    evaluationCriteria: 'Clear, polite, and reassuring explanation of financial processes, timeline expectations, store credit/discount incentives, and closing with brand confidence.',
    whatInterviewerLooksFor: 'Clarity of banking timeframes (e.g. 3-5 business days), proactive offering of goodwill vouchers, avoiding jargon, and ensuring customer agrees with the resolution.',
    hints: 'State the exact refund amount, specify the expected bank processing timeline (3 to 5 business days), provide reference transaction ID, and offer a goodwill discount code for their next purchase.',
    sampleAnswerOutline: [
      'Reassure customer: "We have processed a full refund of $XX.XX to your original payment method."',
      'Specify timeline: "You should see this reflected in your account within 3 to 5 business days, depending on your bank, and I have emailed you confirmation reference #12345."',
      'Goodwill gesture: "To apologize for the inconvenience, we have also added a 20% discount code to your account for your next purchase."'
    ],
    subDomainTag: 'Compensation & Policy Communication',
    followUpQuestionIds: ['vid-bykq-09-fu1', 'vid-bykq-09-fu2']
  },
  {
    id: 'vid-bykq-10',
    originalText: "What's the achievement that you're most proud of, and why?",
    questionText: "What's the achievement that you're most proud of, and why?",
    category: 'Behavioural',
    universalCategory: 'hr_general',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '09:30',
    timestampSeconds: 570,
    evaluationCriteria: 'Authentic narrative using STAR technique (Situation, Task, Action, Result), personal agency, pride in effort rather than mere luck, and transferable resilience.',
    whatInterviewerLooksFor: 'Humility combined with self-confidence, diligence in overcoming setbacks (academic thesis, sports, campus organizing, family milestone), and lessons learned.',
    hints: 'Select an achievement from college, volunteer work, or personal projects where you faced a significant hurdle and persevered through consistent effort.',
    sampleAnswerOutline: [
      'Situation & Task: Describe the challenging milestone (e.g., completing an intensive graduation thesis or organizing a college festival).',
      'Action: The disciplined routine, coordination, and personal sacrifices you made.',
      'Result & Reflection: The successful outcome and how the perseverance developed prepares you for demanding customer support challenges.'
    ],
    subDomainTag: 'STAR Personal Achievement',
    followUpQuestionIds: ['vid-bykq-10-fu1', 'vid-bykq-10-fu2']
  },
  {
    id: 'vid-bykq-11',
    originalText: 'Give me an example of how you performed well under pressure and handled it.',
    questionText: 'Give me an example of how you performed well under pressure and handled it.',
    category: 'Behavioural',
    universalCategory: 'hr_general',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '10:45',
    timestampSeconds: 645,
    evaluationCriteria: 'Emotional stability, methodical prioritization, remaining composed during unexpected crises, and delivering results without compromising quality.',
    whatInterviewerLooksFor: 'Calm breathing, breaking complex pressure situations into actionable steps, constructive peer communication, and positive coping mechanisms.',
    hints: 'Walk through a real high-stress situation (such as a sudden project deadline shift, academic exam crunch, or emergency event) showing how you stayed calm and systematically organized tasks.',
    sampleAnswerOutline: [
      'Context: A high-stakes situation with tight deadlines or multiple conflicting demands.',
      'Coping mechanism: Taking a deliberate breath, listing critical priorities, and filtering out panic.',
      'Action & Execution: Executing step-by-step and keeping teammates updated.',
      'Outcome: Successful completion on schedule and developing stronger composure for high call volume environments.'
    ],
    subDomainTag: 'Composure Under Pressure',
    followUpQuestionIds: ['vid-bykq-11-fu1', 'vid-bykq-11-fu2']
  },
  {
    id: 'vid-bykq-12',
    originalText: 'What is your greatest weakness?',
    questionText: 'What is your greatest weakness?',
    category: 'HR and Personality',
    universalCategory: 'hr_general',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '12:10',
    timestampSeconds: 730,
    evaluationCriteria: 'Genuine self-awareness, avoiding humblebrag clichés ("I work too hard"), vulnerability, and immediate presentation of proactive remedial habits.',
    whatInterviewerLooksFor: 'Authenticity, non-disqualifying area of improvement (e.g., initial hesitation in public speaking, difficulty saying no, over-analyzing decisions), and active correction steps.',
    hints: 'Name a real developmental area (like nervousness when speaking to large groups or reluctance to delegate) and immediately share the concrete tool or habit you use to overcome it.',
    sampleAnswerOutline: [
      'State the real weakness honestly and concisely without being defensive.',
      'Explain how you discovered it during college projects or team tasks.',
      'Introduce the specific habit, technique, or course you adopted to address it proactively.'
    ],
    subDomainTag: 'Honest Self-Awareness',
    followUpQuestionIds: ['vid-bykq-12-fu1', 'vid-bykq-12-fu2']
  },
  {
    id: 'vid-bykq-13',
    originalText: 'How is your improvement in managing that weakness working so far?',
    questionText: 'How is your improvement in managing that weakness working so far?',
    category: 'Critical Thinking',
    universalCategory: 'communication',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '13:05',
    timestampSeconds: 785,
    evaluationCriteria: 'Tangible evidence of growth, measurement mechanisms, self-reflection, and continuous commitment to self-development.',
    whatInterviewerLooksFor: 'Concrete results: fewer hesitations, improved peer feedback, comfort in practicing, and ongoing dedication to improvement.',
    hints: 'Share a recent concrete example where your new habit directly prevented the weakness from affecting your work or communication.',
    sampleAnswerOutline: [
      'Provide a recent instance where you deliberately applied your improvement strategy.',
      'Highlight the difference in outcome compared to before you implemented the habit.',
      'Acknowledge that while you are still refining it, the conscious effort has yielded measurable confidence.'
    ],
    subDomainTag: 'Continuous Growth & Feedback Loop',
    followUpQuestionIds: ['vid-bykq-13-fu1', 'vid-bykq-13-fu2']
  },
  {
    id: 'vid-bykq-14',
    originalText: 'Why do you think pizzas are round?',
    questionText: 'Why do you think pizzas are round?',
    category: 'Unexpected Questions',
    universalCategory: 'aptitude_reasoning',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '14:15',
    timestampSeconds: 855,
    evaluationCriteria: 'Poise and composure under curveball questions, good humor, structured multi-angle reasoning (cooking thermodynamics, dough mechanics, geometric slicing equality).',
    whatInterviewerLooksFor: 'Not freezing or panic-guessing. Smiling, taking a brief pause to think, and presenting logical, creative angles (centrifugal stretching, uniform heat distribution, equal triangle slices).',
    hints: 'Do not panic. Smile, take a breath, and break it down logically: 1) Dough naturally stretches outward into a circle when hand-tossed; 2) Circles distribute oven heat evenly with no burnt corners; 3) Equal radial slicing ensures everyone gets equal crust and toppings.',
    sampleAnswerOutline: [
      'Take the question playfully and confidently with a warm smile.',
      'Physics and preparation: Spinning dough naturally expands radially from the center outward due to centrifugal force.',
      'Thermodynamics and geometry: Round shapes cook evenly in stone ovens without hot-spot corners, and divide into equal triangular slices.'
    ],
    subDomainTag: 'Curveball Composure & Creative Logic',
    followUpQuestionIds: ['vid-bykq-14-fu1', 'vid-bykq-14-fu2']
  },
  {
    id: 'vid-bykq-15',
    originalText: 'Can you walk me through making a homemade pizza from start to finish?',
    questionText: 'Can you walk me through making a homemade pizza from start to finish?',
    category: 'Communication',
    universalCategory: 'communication',
    difficulty: 'intermediate',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '15:30',
    timestampSeconds: 930,
    evaluationCriteria: 'Instructional sequencing, chronological precision, signposting ("First, Next, Then, Finally"), caller-friendly pacing, and patient tone.',
    whatInterviewerLooksFor: 'Testing your ability to guide a customer through complex multi-step technical or account procedures over the phone without visual aids.',
    hints: 'Treat this as phone-based step-by-step guidance: 1) Dough preparation & proofing; 2) Shaping the crust; 3) Sauce & toppings layer; 4) Preheated oven baking; 5) Cooling, slicing, and serving.',
    sampleAnswerOutline: [
      'Step 1: Ingredients & Dough - Activate yeast in warm water, knead flour and olive oil, let rest to rise.',
      'Step 2: Shaping & Base - Roll or stretch dough on a floured surface, keeping outer edge slightly thicker.',
      'Step 3: Sauce & Toppings - Spread tomato sauce evenly, add shredded mozzarella and favorite toppings.',
      'Step 4: Baking & Serving - Bake in a high-heat preheated oven (450-500°F) for 10-12 minutes until crust is golden and cheese bubbles.'
    ],
    subDomainTag: 'Step-by-Step Process Instruction',
    followUpQuestionIds: ['vid-bykq-15-fu1', 'vid-bykq-15-fu2']
  },
  {
    id: 'vid-bykq-16',
    originalText: 'Why should we NOT hire you?',
    questionText: 'Why should we NOT hire you?',
    category: 'Unexpected Questions',
    universalCategory: 'hr_general',
    difficulty: 'advanced',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '17:05',
    timestampSeconds: 1025,
    evaluationCriteria: 'Diplomacy, composure under reverse-qualification pressure, refusing to self-sabotage, reframing the prompt positively around work standards and organizational fit.',
    whatInterviewerLooksFor: 'Poise and confidence. Stating that they should not hire you ONLY if they are looking for someone who settles for bare minimums or who resists continuous coaching and accountability.',
    hints: 'Do not list fatal flaws. Reframe: "You should not hire me if you are looking for someone who simply clocks in and out without caring about customer satisfaction, or if you prefer someone who avoids feedback. But if you want a dedicated learner who takes ownership, I am the right candidate."',
    sampleAnswerOutline: [
      'Reframe the question professionally with confidence without sounding arrogant.',
      'State conditions of mismatch: "You should not hire me if you are seeking someone who resists constructive feedback or who is satisfied with just getting by."',
      'Affirm your value: "However, if you want an energetic team player who is eager to master your systems and genuinely delight customers, you should hire me."'
    ],
    subDomainTag: 'Stress Reframe & Value Affirmation',
    followUpQuestionIds: ['vid-bykq-16-fu1', 'vid-bykq-16-fu2']
  },
  {
    id: 'vid-bykq-17',
    originalText: 'Are you flexible to work any shift, including weekends and public holidays?',
    questionText: 'Are you flexible to work any shift, including weekends and public holidays?',
    category: 'Role Knowledge',
    universalCategory: 'hr_general',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '18:20',
    timestampSeconds: 1100,
    evaluationCriteria: 'Unequivocal operational availability, understanding of 24/7/365 global customer support necessities, transportation awareness, and physical health readiness.',
    whatInterviewerLooksFor: 'Firm, enthusiastic confirmation. No hidden caveats. Realistic understanding that contact centers run on rotating schedules, night shifts, and holiday rosters.',
    hints: 'Give an enthusiastic, clear "Yes". Confirm that you understand 24/7 operations, have reliable transportation/commute plans, and are excited to support peak holiday volumes.',
    sampleAnswerOutline: [
      'Provide an unequivocal affirmative answer: "Yes, absolutely. I am 100% flexible to work any shift, including graveyard shifts, weekends, and holidays."',
      'Confirm operational understanding: "I recognize that customer support is a 24/7 global operation where customers require assistance at all hours."',
      'Transportation & readiness: Confirm reliable commute readiness and physical health habits to maintain high energy across changing rosters.'
    ],
    subDomainTag: 'Operational Shift Availability',
    followUpQuestionIds: ['vid-bykq-17-fu1', 'vid-bykq-17-fu2']
  },
  {
    id: 'vid-bykq-18',
    originalText: 'Do you have any questions for me?',
    questionText: 'Do you have any questions for me?',
    category: 'Communication',
    universalCategory: 'communication',
    difficulty: 'beginner',
    interviewType: 'customer_service',
    candidateLevel: 'fresh_graduate',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    videoTimestamp: '19:10',
    timestampSeconds: 1150,
    evaluationCriteria: 'Engagement, curiosity, preparation, professional focus on training excellence, nesting support, and metrics of top performers rather than merely asking about salary or leaves.',
    whatInterviewerLooksFor: 'Strong closing impression. Demonstrating that the candidate is already visualizing success on the production floor.',
    hints: 'Never say "No, I have no questions." Ask 1-2 thoughtful questions about the training curriculum, the nesting phase for fresh graduates, or what habits distinguish top performers on the floor.',
    sampleAnswerOutline: [
      'Question 1: "What does the initial onboarding and nesting program look like for fresh graduates joining this account?"',
      'Question 2: "What specific qualities or daily habits distinguish top-performing customer service representatives on your team?"',
      'Thank the interviewer sincerely for their time and guidance throughout the conversation.'
    ],
    subDomainTag: 'Closing Inquisitiveness & Polish',
    followUpQuestionIds: ['vid-bykq-18-fu1', 'vid-bykq-18-fu2']
  }
];

export const VIDEO_FOLLOWUP_QUESTIONS = [
  {
    id: 'vid-bykq-01-fu1',
    parentQuestionId: 'vid-bykq-01',
    questionText: 'Why did you decide to look for other career options right now?',
    category: 'Career Goals',
    difficulty: 'beginner',
    rationale: 'Deepens the candidate self-intro by probing the practical motivation behind transitioning away from their academic major.',
    evaluationFocus: 'Authenticity, positive motivation, and career pragmatism.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-01-fu2',
    parentQuestionId: 'vid-bykq-01',
    questionText: 'What sparked your interest in the call center industry specifically?',
    category: 'Role Knowledge',
    difficulty: 'beginner',
    rationale: 'Tests whether interest in BPO is intentional or an accidental fallback.',
    evaluationFocus: 'Enthusiasm for customer interaction and fast-paced learning.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-02-fu1',
    parentQuestionId: 'vid-bykq-02',
    questionText: 'Why did you choose the call center industry instead of waiting for a permanent position?',
    category: 'Career Goals',
    difficulty: 'intermediate',
    rationale: 'Checks if candidate can defend their career pivot with maturity and clear financial/growth reasons.',
    evaluationFocus: 'Decisiveness, career agency, and accountability.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-02-fu2',
    parentQuestionId: 'vid-bykq-02',
    questionText: 'What transferable skills from your education studies will help you in customer service?',
    category: 'Role Knowledge',
    difficulty: 'intermediate',
    rationale: 'Assesses ability to connect previous educational training (patience, explanation, structuring thoughts) to customer care.',
    evaluationFocus: 'Patience, clear communication, and customer empathy.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-03-fu1',
    parentQuestionId: 'vid-bykq-03',
    questionText: 'Which specific task of a customer service representative do you feel most confident handling on day one?',
    category: 'Role Knowledge',
    difficulty: 'beginner',
    rationale: 'Identifies the candidate self-identified communication strengths and comfort level.',
    evaluationFocus: 'Self-awareness and positive attitude.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-03-fu2',
    parentQuestionId: 'vid-bykq-03',
    questionText: 'How do you define excellent customer satisfaction in a fast-paced contact center?',
    category: 'Customer Service',
    difficulty: 'intermediate',
    rationale: 'Probes candidate customer-centric mindset beyond just answering calls quickly.',
    evaluationFocus: 'First-call resolution, active listening, and customer sentiment.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-04-fu1',
    parentQuestionId: 'vid-bykq-04',
    questionText: 'Why did you choose the call center industry over the other fields you explored?',
    category: 'Career Goals',
    difficulty: 'intermediate',
    rationale: 'Direct question from video verifying the decision-making process between BPO and other options.',
    evaluationFocus: 'Clarity of purpose and industry appreciation.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-04-fu2',
    parentQuestionId: 'vid-bykq-04',
    questionText: 'What makes the BPO sector more appealing to you than traditional office administration?',
    category: 'Role Knowledge',
    difficulty: 'intermediate',
    rationale: 'Validates appreciation of fast promotions, competitive benefits, and dynamic environment.',
    evaluationFocus: 'Growth orientation and work ethic.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-05-fu1',
    parentQuestionId: 'vid-bykq-05',
    questionText: 'How is a call center more diverse than ESL in handling different cultures and emotional states?',
    category: 'Communication',
    difficulty: 'intermediate',
    rationale: 'Probes practical intercultural communication competence, diversity awareness, and accent neutralization.',
    evaluationFocus: 'Pacing, neutral tone, cultural diversity, and active validation.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-05-fu2',
    parentQuestionId: 'vid-bykq-05',
    questionText: 'In teaching, students are eager to learn, whereas callers may be frustrated. How will you adjust your emotional mindset?',
    category: 'Situational',
    difficulty: 'intermediate',
    rationale: 'Probes emotional resilience and de-personalizing angry customer outbursts.',
    evaluationFocus: 'Emotional regulation and professional boundaries.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-06-fu1',
    parentQuestionId: 'vid-bykq-06',
    questionText: 'What kind of support or training do you hope to receive from your team leads during your first 90 days?',
    category: 'Career Goals',
    difficulty: 'beginner',
    rationale: 'Checks if candidate can articulate their learning needs clearly.',
    evaluationFocus: 'Coachability and openness to mentoring.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-06-fu2',
    parentQuestionId: 'vid-bykq-06',
    questionText: 'How do you measure your own personal success in an entry-level customer service role?',
    category: 'Career Goals',
    difficulty: 'intermediate',
    rationale: 'Tests candidate alignment with metrics like CSAT, attendance, and resolution rates.',
    evaluationFocus: 'Goal orientation and accountability.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-07-fu1',
    parentQuestionId: 'vid-bykq-07',
    questionText: 'How do you stay focused and calm on a high-energy, busy call center floor?',
    category: 'HR and Personality',
    difficulty: 'beginner',
    rationale: 'Assesses noise tolerance and concentration during simultaneous calls.',
    evaluationFocus: 'Focus, composure, and workstation discipline.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-07-fu2',
    parentQuestionId: 'vid-bykq-07',
    questionText: 'How do you respond when a quality analyst or supervisor gives you immediate constructive feedback on a recorded call?',
    category: 'Behavioural',
    difficulty: 'intermediate',
    rationale: 'Probes coachability and non-defensiveness during QA audits.',
    evaluationFocus: 'Receptiveness to coaching and immediate application.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-08-fu1',
    parentQuestionId: 'vid-bykq-08',
    questionText: 'What was the roleplay about, and what was your immediate first response to the angry customer?',
    category: 'Customer Service',
    difficulty: 'intermediate',
    rationale: 'Direct conversational follow-up checking candidate retention of the roleplay specifics and opening de-escalation phrase.',
    evaluationFocus: 'Immediate empathy and reassuring tone.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-08-fu2',
    parentQuestionId: 'vid-bykq-08',
    questionText: 'If the customer demands to speak with a manager right away, how do you politely attempt to assist them first?',
    category: 'Situational',
    difficulty: 'intermediate',
    rationale: 'Assesses first-contact resolution skills before escalating calls to tier-2.',
    evaluationFocus: 'De-escalation and confident ownership.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-09-fu1',
    parentQuestionId: 'vid-bykq-09',
    questionText: 'If the customer insists on instant cash that violates standard 3-to-5 day banking policy, how do you hold firm while remaining polite?',
    category: 'Communication',
    difficulty: 'intermediate',
    rationale: 'Tests balance between empathy and strict adherence to corporate security/banking guidelines.',
    evaluationFocus: 'Polite firmness and policy explanation.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-09-fu2',
    parentQuestionId: 'vid-bykq-09',
    questionText: 'How do you ensure the customer ends the call feeling valued rather than disappointed?',
    category: 'Customer Service',
    difficulty: 'intermediate',
    rationale: 'Probes closing technique and turning a negative service failure into positive brand loyalty.',
    evaluationFocus: 'Closing rapport and customer retention.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-10-fu1',
    parentQuestionId: 'vid-bykq-10',
    questionText: 'What was the biggest obstacle you encountered during that achievement, and how did you overcome it?',
    category: 'Behavioural',
    difficulty: 'intermediate',
    rationale: 'Probes problem-solving mechanics and tenacity when unexpected road blocks appear.',
    evaluationFocus: 'Overcoming obstacles and resourcefulness.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-10-fu2',
    parentQuestionId: 'vid-bykq-10',
    questionText: 'How does the discipline you showed in that achievement translate to working as a customer service representative?',
    category: 'Role Knowledge',
    difficulty: 'beginner',
    rationale: 'Tests ability to connect personal life/study success to call center performance.',
    evaluationFocus: 'Transferable work ethic and dedication.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-11-fu1',
    parentQuestionId: 'vid-bykq-11',
    questionText: 'Can you give an example of performing well under pressure in a collaborative group or customer-facing role?',
    category: 'Behavioural',
    difficulty: 'intermediate',
    rationale: 'Direct video follow-up testing team-oriented pressure handling.',
    evaluationFocus: 'Collaboration under stress and maintaining team morale.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-11-fu2',
    parentQuestionId: 'vid-bykq-11',
    questionText: 'When multiple urgent demands hit you simultaneously, what is your framework for prioritizing?',
    category: 'Critical Thinking',
    difficulty: 'intermediate',
    rationale: 'Examines systematic task triage under tight timelines.',
    evaluationFocus: 'Prioritization and time management.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-12-fu1',
    parentQuestionId: 'vid-bykq-12',
    questionText: 'How is your weakness-improvement strategy working?',
    category: 'Critical Thinking',
    difficulty: 'intermediate',
    rationale: 'Direct video prompt checking whether candidate has operationalized their self-improvement.',
    evaluationFocus: 'Growth mindset and tracking progress.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-12-fu2',
    parentQuestionId: 'vid-bykq-12',
    questionText: 'Can you give an example of when this weakness affected you, and how you recovered?',
    category: 'Behavioural',
    difficulty: 'intermediate',
    rationale: 'Probes resilience and bouncing back from mistakes with accountability.',
    evaluationFocus: 'Accountability and rapid recovery.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-13-fu1',
    parentQuestionId: 'vid-bykq-13',
    questionText: 'What specific daily habit or tracker have you put in place to ensure continuous improvement?',
    category: 'Critical Thinking',
    difficulty: 'intermediate',
    rationale: 'Looks for concrete routines (journals, apps, calendar blocks) rather than vague intentions.',
    evaluationFocus: 'Systematic habits and discipline.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-13-fu2',
    parentQuestionId: 'vid-bykq-13',
    questionText: 'How will your future team lead know that you have made tangible progress in that area?',
    category: 'Role Knowledge',
    difficulty: 'intermediate',
    rationale: 'Connects personal development to observable workplace behaviors.',
    evaluationFocus: 'Professional communication and performance evidence.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-14-fu1',
    parentQuestionId: 'vid-bykq-14',
    questionText: 'If pizzas are round, why do you think pizza boxes are square?',
    category: 'Unexpected Questions',
    difficulty: 'intermediate',
    rationale: 'Classic follow-up curveball testing logical manufacturing efficiency (square boxes are scored from single flat sheets).',
    evaluationFocus: 'Analytical curiosity, practical logic, and cheerful composure.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-14-fu2',
    parentQuestionId: 'vid-bykq-14',
    questionText: 'How would you explain the round pizza in a square box concept to a curious child?',
    category: 'Communication',
    difficulty: 'beginner',
    rationale: 'Tests simplicity of phrasing and removing unnecessary complexity.',
    evaluationFocus: 'Simplification and warm instructional tone.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-15-fu1',
    parentQuestionId: 'vid-bykq-15',
    questionText: 'Can you explain the process from start to finish as if you were instructing a first-time caller who made a mistake with the dough?',
    category: 'Customer Service',
    difficulty: 'intermediate',
    rationale: 'Direct video prompt checking troubleshooting patience and instructional pacing.',
    evaluationFocus: 'Customer patience, clarity, and de-escalation.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-15-fu2',
    parentQuestionId: 'vid-bykq-15',
    questionText: 'If you realize halfway through that you do not have yeast or an oven, what creative workaround would you suggest?',
    category: 'Critical Thinking',
    difficulty: 'intermediate',
    rationale: 'Tests agile problem-solving on the spot without giving up.',
    evaluationFocus: 'Creative troubleshooting and positive alternatives.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-16-fu1',
    parentQuestionId: 'vid-bykq-16',
    questionText: 'If there is one area where you will need the most patience and coaching during onboarding, what would it be?',
    category: 'HR and Personality',
    difficulty: 'intermediate',
    rationale: 'Follows up the stress question by testing realistic self-assessment during onboarding.',
    evaluationFocus: 'Humility and willingness to receive guidance.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-16-fu2',
    parentQuestionId: 'vid-bykq-16',
    questionText: 'How do you handle rapid policy changes or CRM script updates that happen on very short notice?',
    category: 'Role Knowledge',
    difficulty: 'intermediate',
    rationale: 'Validates cognitive flexibility and adapting quickly in high-change BPO environments.',
    evaluationFocus: 'Adaptability and quick retention.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-17-fu1',
    parentQuestionId: 'vid-bykq-17',
    questionText: 'How do you manage your physical energy and work-life balance when working night shifts or rotating rosters?',
    category: 'HR and Personality',
    difficulty: 'beginner',
    rationale: 'Checks if candidate has realistic lifestyle plans for nocturnal biological rhythm adaptation.',
    evaluationFocus: 'Physical stamina, sleep hygiene, and reliability.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-17-fu2',
    parentQuestionId: 'vid-bykq-17',
    questionText: 'If public transportation is unavailable during late-night shift ends, what is your commute contingency plan?',
    category: 'Role Knowledge',
    difficulty: 'beginner',
    rationale: 'Ensures no unexpected attendance or punctuality failures occur due to commute challenges.',
    evaluationFocus: 'Practical logistics and punctuality.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-18-fu1',
    parentQuestionId: 'vid-bykq-18',
    questionText: 'What have you heard about our company onboarding and nesting program that caught your attention?',
    category: 'Communication',
    difficulty: 'beginner',
    rationale: 'Validates that the candidate researched the company culture and training commitment.',
    evaluationFocus: 'Company research and genuine enthusiasm.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  },
  {
    id: 'vid-bykq-18-fu2',
    parentQuestionId: 'vid-bykq-18',
    questionText: 'What specific metric or KPI do you think new customer service representatives find most challenging during nesting?',
    category: 'Role Knowledge',
    difficulty: 'intermediate',
    rationale: 'Encourages high-level discussion on KPIs like AHT (Average Handling Time), CSAT, and FCR.',
    evaluationFocus: 'Professional curiosity and metric awareness.',
    sourceVideoId: 'BYKqJkDxg9U',
    sourceVideoUrl: 'https://www.youtube.com/watch?v=BYKqJkDxg9U'
  }
];

export function findVideoQuestionByText(text) {
  const norm = (text || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  return VIDEO_PRIMARY_QUESTIONS.find(q => {
    const qNorm = (q.questionText || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    return qNorm === norm;
  });
}

export function findVideoQuestionById(id) {
  return VIDEO_PRIMARY_QUESTIONS.find(q => q.id === id);
}

export function getVideoFollowUpsForQuestion(parentQuestionId) {
  return VIDEO_FOLLOWUP_QUESTIONS.filter(fu => fu.parentQuestionId === parentQuestionId);
}

export function getAllVideoQuestions() {
  return [...VIDEO_PRIMARY_QUESTIONS];
}

export function getAllVideoFollowUps() {
  return [...VIDEO_FOLLOWUP_QUESTIONS];
}
