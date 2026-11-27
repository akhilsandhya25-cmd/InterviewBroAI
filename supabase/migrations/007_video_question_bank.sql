-- =========================================================================
-- InterviewBro AI — Migration 007: Video-Extracted Real Interview Question Repository
-- Source Video: https://www.youtube.com/watch?v=BYKqJkDxg9U (Video ID: BYKqJkDxg9U)
-- Role / Track: Customer Service Representative / Call Center (BPO)
-- Candidate Level: Fresh Graduate
-- 
-- CRITICAL RULE: Purely additive, 100% idempotent, non-destructive.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.video_interview_questions (
  id text PRIMARY KEY,
  source_video_id text NOT NULL,
  source_video_url text NOT NULL,
  question_text text NOT NULL,
  original_text text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  interview_type text NOT NULL,
  candidate_level text NOT NULL,
  video_timestamp text NOT NULL,
  timestamp_seconds integer NOT NULL,
  evaluation_criteria text NOT NULL,
  what_interviewer_looks_for text,
  hints text,
  sample_answer_outline jsonb DEFAULT '[]'::jsonb,
  sub_domain_tag text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_question_followups (
  id text PRIMARY KEY,
  parent_question_id text NOT NULL REFERENCES public.video_interview_questions(id) ON DELETE CASCADE,
  source_video_id text NOT NULL,
  question_text text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  rationale text,
  evaluation_focus text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_question_followups ENABLE ROW LEVEL SECURITY;

-- Allow public read access (authenticated and anonymous) to question bank
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'video_interview_questions' AND policyname = 'Allow public select on video questions'
  ) THEN
    CREATE POLICY "Allow public select on video questions"
      ON public.video_interview_questions
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'video_question_followups' AND policyname = 'Allow public select on video followups'
  ) THEN
    CREATE POLICY "Allow public select on video followups"
      ON public.video_question_followups
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- 1. Insert 18 Primary Video Questions (Idempotent)
INSERT INTO public.video_interview_questions (
  id, source_video_id, source_video_url, question_text, original_text, category, difficulty,
  interview_type, candidate_level, video_timestamp, timestamp_seconds, evaluation_criteria,
  what_interviewer_looks_for, hints, sample_answer_outline, sub_domain_tag
) VALUES
  (
    'vid-bykq-01', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Tell me about yourself.', 'Tell me about yourself.', 'HR and Personality', 'beginner',
    'customer_service', 'fresh_graduate', '00:32', 32,
    'Structure (Present-Past-Future), clarity of English diction, enthusiasm, authentic motivation for customer support.',
    'Active voice, clear pronunciation, positive demeanor, and connecting academic background to customer communication.',
    'Share your degree, key communication strengths or campus activities, and why you are excited to begin your career in customer service.',
    '["Warm greeting and name, followed by recent graduation details and major.", "Core communication and interpersonal strengths developed during college.", "Why you are deliberately stepping into customer service."]'::jsonb,
    'Call Center Fresher Self-Introduction'
  ),
  (
    'vid-bykq-02', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Why could it take five years before you get a permanent teaching position?', 'Why could it take five years before you get a permanent teaching position?', 'Career Goals', 'intermediate',
    'customer_service', 'fresh_graduate', '01:45', 105,
    'Objective perspective on industry barriers, lack of bitterness, practical career pragmatism, and understanding corporate mobility.',
    'Honesty regarding institutional licensure backlogs or public school appointment queues.',
    'Acknowledge the licensure exam and tenure ranking backlog objectively without criticizing the system.',
    '["Explain the objective backlog in government appointments and license rankings.", "Emphasize your proactive desire to build financial independence.", "Connect how communication and patience from teaching translate into customer care."]'::jsonb,
    'Career Transition & Reality Check'
  ),
  (
    'vid-bykq-03', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Are you aware of the tasks of a Customer Service Representative?', 'Are you aware of the tasks of a Customer Service Representative?', 'Role Knowledge', 'beginner',
    'customer_service', 'fresh_graduate', '02:28', 148,
    'Accurate comprehension of core CSR duties: handling inbound/outbound calls, active listening, troubleshooting, ticket documentation.',
    'Realistic understanding of daily call volume, multitasking between speaking and CRM typing.',
    'Mention call handling, active listening, ticket logging, resolving customer issues within SLAs.',
    '["Handling inbound and outbound customer inquiries via voice, email, and live chat.", "Active listening and navigating knowledge bases/CRM tools.", "Accurate case documentation and first-call resolution."]'::jsonb,
    'CSR Core Responsibilities'
  ),
  (
    'vid-bykq-04', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Did you discover other fields or industries aside from the BPO industry?', 'Did you discover other fields or industries aside from the BPO industry?', 'Critical Thinking', 'intermediate',
    'customer_service', 'fresh_graduate', '03:10', 190,
    'Demonstration of proactive research into various job sectors and deliberate, reasoned selection of BPO.',
    'Career intentionality, mature evaluation of pros and cons across industries.',
    'Discuss alternative fields you explored and clearly articulate why BPO offers superior training.',
    '["Acknowledge exploring fields like ESL tutoring and administrative coordination.", "Compare the slower advancement of those fields against BPO dynamism.", "Confirm that BPO was chosen intentionally for its structured training."]'::jsonb,
    'Industry Comparison & Choice'
  ),
  (
    'vid-bykq-05', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'How is a call center more diverse than ESL teaching?', 'How is a call center more diverse than ESL teaching?', 'Critical Thinking', 'intermediate',
    'customer_service', 'fresh_graduate', '04:05', 245,
    'Recognition of demographic, cultural, problem complexity, and emotional diversity in global contact centers.',
    'Analytical depth: understanding that contact centers deal with customers of all ages, cultures, and emotional states.',
    'Contrast the relatively uniform demographic of ESL students with the wide spectrum of emotions handled in call centers.',
    '["In ESL teaching, students share a common goal of learning with cooperative attitudes.", "In call centers, callers come from diverse geographical regions and varying emotional states.", "Call centers demand rapid code-switching and cultural adaptability."]'::jsonb,
    'Cultural & Emotional Diversity in BPO'
  ),
  (
    'vid-bykq-06', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'What exactly are you looking for in a job?', 'What exactly are you looking for in a job?', 'Career Goals', 'beginner',
    'customer_service', 'fresh_graduate', '05:12', 312,
    'Alignment of personal career aspirations with entry-level contact center realities: training, mentorship, clear KPIs.',
    'Realistic fresh graduate expectations, passion for skill acquisition, team orientation.',
    'Focus on comprehensive training, supportive team culture, constructive feedback from leadership.',
    '["Robust initial training and continuous coaching to master customer interaction skills.", "A positive, team-driven environment that values accountability.", "Clear, merit-based career pathways."]'::jsonb,
    'Job Expectations & Value Fit'
  ),
  (
    'vid-bykq-07', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'What kind of work environment do you like best?', 'What kind of work environment do you like best?', 'HR and Personality', 'beginner',
    'customer_service', 'fresh_graduate', '06:00', 360,
    'Ability to thrive in an energetic, collaborative, fast-paced, and metric-driven operational workspace.',
    'Comfort with buzzing production floors, open feedback, collaborative peer support.',
    'Highlight your appreciation for collaborative spaces where team members assist one another during escalations.',
    '["An energetic, supportive atmosphere where teammates collaborate and share best practices.", "Transparent communication with accessible team leaders.", "A structured environment with well-defined resources."]'::jsonb,
    'Workplace Culture Fit'
  ),
  (
    'vid-bykq-08', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'How would you handle a dissatisfied customer who received the wrong dress?', 'How would you handle a dissatisfied customer who received the wrong dress?', 'Customer Service', 'intermediate',
    'customer_service', 'fresh_graduate', '06:48', 408,
    'De-escalation mastery: empathic listening without interrupting, sincere apology, immediate ownership, structured resolution steps.',
    'HEAT model (Hear, Empathize, Apologize, Take Action), avoiding defensive excuses.',
    'Use the HEAT framework: Let the customer vent, express genuine empathy, verify order number, initiate priority replacement.',
    '["Hear and acknowledge: Listen actively without cutting the customer off.", "Empathize and apologize for the disappointment.", "Take ownership: Confirm the correct order, initiate priority delivery, provide prepaid return slip."]'::jsonb,
    'Retail Customer De-escalation'
  ),
  (
    'vid-bykq-09', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'How would you communicate the refund and compensation to the customer?', 'How would you communicate the refund and compensation to the customer?', 'Communication', 'intermediate',
    'customer_service', 'fresh_graduate', '08:15', 495,
    'Clear, polite, and reassuring explanation of financial processes, timeline expectations, store credit/discount incentives.',
    'Clarity of banking timeframes (e.g. 3-5 business days), proactive offering of goodwill vouchers.',
    'State exact refund amount, bank processing timeline, provide reference transaction ID, offer goodwill discount.',
    '["Reassure customer: Full refund processed to original payment method.", "Specify timeline: Reflected within 3 to 5 business days with confirmation ID.", "Goodwill gesture: Added a 20% discount code to account for future orders."]'::jsonb,
    'Compensation & Policy Communication'
  ),
  (
    'vid-bykq-10', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'What''s the achievement that you''re most proud of, and why?', 'What''s the achievement that you''re most proud of, and why?', 'Behavioural', 'beginner',
    'customer_service', 'fresh_graduate', '09:30', 570,
    'Authentic narrative using STAR technique, personal agency, pride in effort rather than luck, transferable resilience.',
    'Humility combined with self-confidence, diligence in overcoming setbacks.',
    'Select an achievement from college, volunteer work, or personal projects where you faced a significant hurdle.',
    '["Situation & Task: Describe the challenging milestone.", "Action: The disciplined routine and coordination you made.", "Result & Reflection: The successful outcome and how perseverance translates to customer support."]'::jsonb,
    'STAR Personal Achievement'
  ),
  (
    'vid-bykq-11', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Give me an example of how you performed well under pressure and handled it.', 'Give me an example of how you performed well under pressure and handled it.', 'Behavioural', 'intermediate',
    'customer_service', 'fresh_graduate', '10:45', 645,
    'Emotional stability, methodical prioritization, remaining composed during unexpected crises.',
    'Calm breathing, breaking complex pressure situations into actionable steps, constructive peer communication.',
    'Walk through a real high-stress situation showing how you stayed calm and systematically organized tasks.',
    '["Context: A high-stakes situation with tight deadlines or conflicting demands.", "Coping mechanism: Taking a breath, listing critical priorities, filtering out panic.", "Action & Outcome: Executing step-by-step and achieving successful completion."]'::jsonb,
    'Composure Under Pressure'
  ),
  (
    'vid-bykq-12', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'What is your greatest weakness?', 'What is your greatest weakness?', 'HR and Personality', 'intermediate',
    'customer_service', 'fresh_graduate', '12:10', 730,
    'Genuine self-awareness, avoiding humblebrag clichés, vulnerability, presenting proactive remedial habits.',
    'Authenticity, non-disqualifying developmental area, active correction steps.',
    'Name a real developmental area and immediately share the concrete tool or habit you use to overcome it.',
    '["State the real weakness honestly without being defensive.", "Explain how you discovered it during college projects.", "Introduce the specific habit or technique you adopted to address it."]'::jsonb,
    'Honest Self-Awareness'
  ),
  (
    'vid-bykq-13', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'How is your improvement in managing that weakness working so far?', 'How is your improvement in managing that weakness working so far?', 'Critical Thinking', 'intermediate',
    'customer_service', 'fresh_graduate', '13:05', 785,
    'Tangible evidence of growth, measurement mechanisms, self-reflection, continuous commitment to self-development.',
    'Concrete results: fewer hesitations, improved peer feedback, ongoing dedication.',
    'Share a recent concrete example where your new habit directly prevented the weakness from affecting your work.',
    '["Provide a recent instance where you applied your improvement strategy.", "Highlight the difference in outcome compared to before.", "Acknowledge conscious effort yielding measurable confidence."]'::jsonb,
    'Continuous Growth & Feedback Loop'
  ),
  (
    'vid-bykq-14', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Why do you think pizzas are round?', 'Why do you think pizzas are round?', 'Unexpected Questions', 'intermediate',
    'customer_service', 'fresh_graduate', '14:15', 855,
    'Poise and composure under curveball questions, good humor, structured multi-angle reasoning.',
    'Not freezing or panic-guessing. Smiling, taking a brief pause, presenting logical creative angles.',
    'Break it down logically: centrifugal stretching, uniform heat distribution, equal slicing.',
    '["Take the question playfully with confidence and a warm smile.", "Physics: Spinning dough expands radially from the center outward.", "Thermodynamics & geometry: Round shapes cook evenly in ovens without burnt corners."]'::jsonb,
    'Curveball Composure & Creative Logic'
  ),
  (
    'vid-bykq-15', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Can you walk me through making a homemade pizza from start to finish?', 'Can you walk me through making a homemade pizza from start to finish?', 'Communication', 'intermediate',
    'customer_service', 'fresh_graduate', '15:30', 930,
    'Instructional sequencing, chronological precision, signposting, caller-friendly pacing, patient tone.',
    'Testing ability to guide a customer through complex multi-step procedures over the phone without visual aids.',
    'Treat this as phone-based step-by-step guidance: dough, base, toppings, baking, slicing.',
    '["Step 1: Ingredients & Dough - Activate yeast, knead flour and oil, proof.", "Step 2: Shaping & Base - Stretch dough keeping edges thicker.", "Step 3: Sauce & Toppings - Spread sauce evenly, add cheese and toppings.", "Step 4: Baking & Serving - High-heat oven for 10-12 minutes until golden."]'::jsonb,
    'Step-by-Step Process Instruction'
  ),
  (
    'vid-bykq-16', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Why should we NOT hire you?', 'Why should we NOT hire you?', 'Unexpected Questions', 'advanced',
    'customer_service', 'fresh_graduate', '17:05', 1025,
    'Diplomacy, composure under reverse-qualification pressure, refusing to self-sabotage, reframing positively.',
    'Poise and confidence. Stating they should not hire you ONLY if they seek bare minimums or resist feedback.',
    'Reframe: "You should not hire me if you are looking for someone who simply clocks in and out without caring about customer satisfaction."',
    '["Reframe the question professionally with confidence.", "State conditions of mismatch: Seeking someone who resists feedback or settles for bare minimums.", "Affirm your value: An energetic learner eager to master systems and delight customers."]'::jsonb,
    'Stress Reframe & Value Affirmation'
  ),
  (
    'vid-bykq-17', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Are you flexible to work any shift, including weekends and public holidays?', 'Are you flexible to work any shift, including weekends and public holidays?', 'Role Knowledge', 'beginner',
    'customer_service', 'fresh_graduate', '18:20', 1100,
    'Unequivocal operational availability, understanding of 24/7/365 global customer support necessities.',
    'Firm, enthusiastic confirmation. No hidden caveats. Realistic understanding of rotating rosters.',
    'Give an enthusiastic "Yes". Confirm understanding of 24/7 operations and reliable commute readiness.',
    '["Unequivocal affirmative answer: 100% flexible to work any shift including holidays.", "Confirm operational understanding: Customer support is a 24/7 global operation.", "Transportation readiness: Reliable commute plans to maintain high energy."]'::jsonb,
    'Operational Shift Availability'
  ),
  (
    'vid-bykq-18', 'BYKqJkDxg9U', 'https://www.youtube.com/watch?v=BYKqJkDxg9U',
    'Do you have any questions for me?', 'Do you have any questions for me?', 'Communication', 'beginner',
    'customer_service', 'fresh_graduate', '19:10', 1150,
    'Engagement, curiosity, preparation, professional focus on training excellence, nesting support, top performer habits.',
    'Strong closing impression. Demonstrating candidate is visualizing success on the production floor.',
    'Never say "No". Ask 1-2 thoughtful questions about onboarding, nesting, or habits of top CSRs.',
    '["Question 1: What does initial onboarding and nesting look like for fresh graduates?", "Question 2: What daily habits distinguish top-performing CSRs on your team?", "Thank interviewer sincerely for their time and guidance."]'::jsonb,
    'Closing Inquisitiveness & Polish'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Conversational Follow-up Questions (Idempotent)
INSERT INTO public.video_question_followups (
  id, parent_question_id, source_video_id, question_text, category, difficulty, rationale, evaluation_focus
) VALUES
  ('vid-bykq-01-fu1', 'vid-bykq-01', 'BYKqJkDxg9U', 'Why did you decide to look for other career options right now?', 'Career Goals', 'beginner', 'Deepens candidate self-intro by probing motivation behind transitioning away from major.', 'Authenticity, positive motivation, and career pragmatism.'),
  ('vid-bykq-01-fu2', 'vid-bykq-01', 'BYKqJkDxg9U', 'What sparked your interest in the call center industry specifically?', 'Role Knowledge', 'beginner', 'Tests whether interest in BPO is intentional.', 'Enthusiasm for customer interaction and fast-paced learning.'),
  ('vid-bykq-02-fu1', 'vid-bykq-02', 'BYKqJkDxg9U', 'Why did you choose the call center industry instead of waiting for a permanent position?', 'Career Goals', 'intermediate', 'Checks if candidate can defend career pivot with maturity.', 'Decisiveness, career agency, and accountability.'),
  ('vid-bykq-02-fu2', 'vid-bykq-02', 'BYKqJkDxg9U', 'What transferable skills from your education studies will help you in customer service?', 'Role Knowledge', 'intermediate', 'Assesses connecting previous training to customer care.', 'Patience, clear communication, and customer empathy.'),
  ('vid-bykq-03-fu1', 'vid-bykq-03', 'BYKqJkDxg9U', 'Which specific task of a customer service representative do you feel most confident handling on day one?', 'Role Knowledge', 'beginner', 'Identifies candidate self-identified communication strengths.', 'Self-awareness and positive attitude.'),
  ('vid-bykq-03-fu2', 'vid-bykq-03', 'BYKqJkDxg9U', 'How do you define excellent customer satisfaction in a fast-paced contact center?', 'Customer Service', 'intermediate', 'Probes customer-centric mindset beyond just answering calls.', 'First-call resolution, active listening, and customer sentiment.'),
  ('vid-bykq-04-fu1', 'vid-bykq-04', 'BYKqJkDxg9U', 'Why did you choose the call center industry over the other fields you explored?', 'Career Goals', 'intermediate', 'Direct video question verifying decision-making process.', 'Clarity of purpose and industry appreciation.'),
  ('vid-bykq-04-fu2', 'vid-bykq-04', 'BYKqJkDxg9U', 'What makes the BPO sector more appealing to you than traditional office administration?', 'Role Knowledge', 'intermediate', 'Validates appreciation of fast promotions and competitive benefits.', 'Growth orientation and work ethic.'),
  ('vid-bykq-05-fu1', 'vid-bykq-05', 'BYKqJkDxg9U', 'How is a call center more diverse than ESL in handling different cultures and emotional states?', 'Communication', 'intermediate', 'Probes intercultural communication competence, diversity awareness, and accent neutralization.', 'Pacing, neutral tone, cultural diversity, and active validation.'),
  ('vid-bykq-05-fu2', 'vid-bykq-05', 'BYKqJkDxg9U', 'In teaching, students are eager to learn, whereas callers may be frustrated. How will you adjust your emotional mindset?', 'Situational', 'intermediate', 'Probes emotional resilience and de-personalizing angry outbursts.', 'Emotional regulation and professional boundaries.'),
  ('vid-bykq-06-fu1', 'vid-bykq-06', 'BYKqJkDxg9U', 'What kind of support or training do you hope to receive from your team leads during your first 90 days?', 'Career Goals', 'beginner', 'Checks if candidate can articulate learning needs clearly.', 'Coachability and openness to mentoring.'),
  ('vid-bykq-06-fu2', 'vid-bykq-06', 'BYKqJkDxg9U', 'How do you measure your own personal success in an entry-level customer service role?', 'Career Goals', 'intermediate', 'Tests candidate alignment with CSAT, attendance, resolution metrics.', 'Goal orientation and accountability.'),
  ('vid-bykq-07-fu1', 'vid-bykq-07', 'BYKqJkDxg9U', 'How do you stay focused and calm on a high-energy, busy call center floor?', 'HR and Personality', 'beginner', 'Assesses noise tolerance and concentration.', 'Focus, composure, and workstation discipline.'),
  ('vid-bykq-07-fu2', 'vid-bykq-07', 'BYKqJkDxg9U', 'How do you respond when a quality analyst or supervisor gives you immediate constructive feedback on a recorded call?', 'Behavioural', 'intermediate', 'Probes coachability and non-defensiveness during QA audits.', 'Receptiveness to coaching and immediate application.'),
  ('vid-bykq-08-fu1', 'vid-bykq-08', 'BYKqJkDxg9U', 'What was the roleplay about, and what was your immediate first response to the angry customer?', 'Customer Service', 'intermediate', 'Direct conversational follow-up checking retention of roleplay specifics.', 'Immediate empathy and reassuring tone.'),
  ('vid-bykq-08-fu2', 'vid-bykq-08', 'BYKqJkDxg9U', 'If the customer demands to speak with a manager right away, how do you politely attempt to assist them first?', 'Situational', 'intermediate', 'Assesses first-contact resolution skills before escalation.', 'De-escalation and confident ownership.'),
  ('vid-bykq-09-fu1', 'vid-bykq-09', 'BYKqJkDxg9U', 'If the customer insists on instant cash that violates standard 3-to-5 day banking policy, how do you hold firm while remaining polite?', 'Communication', 'intermediate', 'Tests balance between empathy and strict adherence to banking guidelines.', 'Polite firmness and policy explanation.'),
  ('vid-bykq-09-fu2', 'vid-bykq-09', 'BYKqJkDxg9U', 'How do you ensure the customer ends the call feeling valued rather than disappointed?', 'Customer Service', 'intermediate', 'Probes closing technique and turning service failure into brand loyalty.', 'Closing rapport and customer retention.'),
  ('vid-bykq-10-fu1', 'vid-bykq-10', 'BYKqJkDxg9U', 'What was the biggest obstacle you encountered during that achievement, and how did you overcome it?', 'Behavioural', 'intermediate', 'Probes problem-solving mechanics and tenacity.', 'Overcoming obstacles and resourcefulness.'),
  ('vid-bykq-10-fu2', 'vid-bykq-10', 'BYKqJkDxg9U', 'How does the discipline you showed in that achievement translate to working as a customer service representative?', 'Role Knowledge', 'beginner', 'Tests connecting personal life/study success to CSR performance.', 'Transferable work ethic and dedication.'),
  ('vid-bykq-11-fu1', 'vid-bykq-11', 'BYKqJkDxg9U', 'Can you give an example of performing well under pressure in a collaborative group or customer-facing role?', 'Behavioural', 'intermediate', 'Direct video follow-up testing team-oriented pressure handling.', 'Collaboration under stress and maintaining team morale.'),
  ('vid-bykq-11-fu2', 'vid-bykq-11', 'BYKqJkDxg9U', 'When multiple urgent demands hit you simultaneously, what is your framework for prioritizing?', 'Critical Thinking', 'intermediate', 'Examines systematic task triage under tight timelines.', 'Prioritization and time management.'),
  ('vid-bykq-12-fu1', 'vid-bykq-12', 'BYKqJkDxg9U', 'How is your weakness-improvement strategy working?', 'Critical Thinking', 'intermediate', 'Direct video prompt checking operationalized self-improvement.', 'Growth mindset and tracking progress.'),
  ('vid-bykq-12-fu2', 'vid-bykq-12', 'BYKqJkDxg9U', 'Can you give an example of when this weakness affected you, and how you recovered?', 'Behavioural', 'intermediate', 'Probes resilience and bouncing back from mistakes.', 'Accountability and rapid recovery.'),
  ('vid-bykq-13-fu1', 'vid-bykq-13', 'BYKqJkDxg9U', 'What specific daily habit or tracker have you put in place to ensure continuous improvement?', 'Critical Thinking', 'intermediate', 'Looks for concrete routines rather than vague intentions.', 'Systematic habits and discipline.'),
  ('vid-bykq-13-fu2', 'vid-bykq-13', 'BYKqJkDxg9U', 'How will your future team lead know that you have made tangible progress in that area?', 'Role Knowledge', 'intermediate', 'Connects personal development to observable workplace behaviors.', 'Professional communication and performance evidence.'),
  ('vid-bykq-14-fu1', 'vid-bykq-14', 'BYKqJkDxg9U', 'If pizzas are round, why do you think pizza boxes are square?', 'Unexpected Questions', 'intermediate', 'Classic follow-up curveball testing manufacturing efficiency.', 'Analytical curiosity, practical logic, and cheerful composure.'),
  ('vid-bykq-14-fu2', 'vid-bykq-14', 'BYKqJkDxg9U', 'How would you explain the round pizza in a square box concept to a curious child?', 'Communication', 'beginner', 'Tests simplicity of phrasing and removing unnecessary complexity.', 'Simplification and warm instructional tone.'),
  ('vid-bykq-15-fu1', 'vid-bykq-15', 'BYKqJkDxg9U', 'Can you explain the process from start to finish as if you were instructing a first-time caller who made a mistake with the dough?', 'Customer Service', 'intermediate', 'Direct video prompt checking troubleshooting patience and instructional pacing.', 'Customer patience, clarity, and de-escalation.'),
  ('vid-bykq-15-fu2', 'vid-bykq-15', 'BYKqJkDxg9U', 'If you realize halfway through that you do not have yeast or an oven, what creative workaround would you suggest?', 'Critical Thinking', 'intermediate', 'Tests agile problem-solving on the spot without giving up.', 'Creative troubleshooting and positive alternatives.'),
  ('vid-bykq-16-fu1', 'vid-bykq-16', 'BYKqJkDxg9U', 'If there is one area where you will need the most patience and coaching during onboarding, what would it be?', 'HR and Personality', 'intermediate', 'Follows up stress question by testing realistic self-assessment.', 'Humility and willingness to receive guidance.'),
  ('vid-bykq-16-fu2', 'vid-bykq-16', 'BYKqJkDxg9U', 'How do you handle rapid policy changes or CRM script updates that happen on very short notice?', 'Role Knowledge', 'intermediate', 'Validates cognitive flexibility and adapting in high-change environments.', 'Adaptability and quick retention.'),
  ('vid-bykq-17-fu1', 'vid-bykq-17', 'BYKqJkDxg9U', 'How do you manage your physical energy and work-life balance when working night shifts or rotating rosters?', 'HR and Personality', 'beginner', 'Checks if candidate has realistic lifestyle plans for nocturnal adaptation.', 'Physical stamina, sleep hygiene, and reliability.'),
  ('vid-bykq-17-fu2', 'vid-bykq-17', 'BYKqJkDxg9U', 'If public transportation is unavailable during late-night shift ends, what is your commute contingency plan?', 'Role Knowledge', 'beginner', 'Ensures no attendance or punctuality failures occur.', 'Practical logistics and punctuality.'),
  ('vid-bykq-18-fu1', 'vid-bykq-18', 'BYKqJkDxg9U', 'What have you heard about our company onboarding and nesting program that caught your attention?', 'Communication', 'beginner', 'Validates that candidate researched company culture.', 'Company research and genuine enthusiasm.'),
  ('vid-bykq-18-fu2', 'vid-bykq-18', 'BYKqJkDxg9U', 'What specific metric or KPI do you think new customer service representatives find most challenging during nesting?', 'Role Knowledge', 'intermediate', 'Encourages discussion on KPIs like AHT, CSAT, and FCR.', 'Professional curiosity and metric awareness.')
ON CONFLICT (id) DO NOTHING;
