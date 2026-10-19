/**
 * InterviewBro AI - Comprehensive Legal, Privacy & Compliance Documents
 * Version: 1.2
 * Effective Date: October 19, 2026
 * Compliance Baseline: Digital Personal Data Protection Act, 2023 (India), 
 * Digital Personal Data Protection Rules, 2025, and Information Technology Act, 2000.
 *
 * OPERATIONAL STATUS & LEGAL NOTICE:
 * InterviewBro AI is an educational technology simulation platform operated by an individual developer in India.
 * It is not currently incorporated as a corporate entity (Private Limited Company, LLP, or partnership).
 * Placeholders enclosed in brackets marked [OWNER ACTION REQUIRED: ...] designate operational information
 * (such as verified communication address, monitored contact channels, and court jurisdiction)
 * that the platform owner must finalize before commercial deployment or monetization.
 */

export interface LegalDocument {
  id: string;
  title: string;
  shortTitle: string;
  version: string;
  lastUpdated: string;
  summary: string;
  sections: {
    heading: string;
    content: string[];
    subsections?: { title: string; bullets: string[] }[];
  }[];
}

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    shortTitle: 'Terms',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Governs your use of InterviewBro AI, an educational mock interview simulation platform operated by an individual developer for placement practice and career readiness.',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: [
          'Welcome to InterviewBro AI (the "Platform", "we", "us", or "our"), an educational career preparation platform operated by an individual developer [OWNER ACTION REQUIRED: Specify Individual Operator Legal Name or Registered Business Name upon formation] ("Operator"). By registering for an account, accessing, or using our mock interview studio, resume analyzer, feedback reports, and voice simulation services, you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy.',
          'If you do not agree to these Terms, you must not access or use the Platform. If you are using the Platform on behalf of an educational institution, college placement cell, or employer, you represent and warrant that you have authority to bind that entity to these Terms.'
        ]
      },
      {
        heading: '2. Educational Purpose & Nature of Service',
        content: [
          'InterviewBro AI is an educational simulation tool designed to assist college students, recent graduates, and software job seekers in practicing mock interviews and analyzing resume keywords.',
          'ACTIVE DEVELOPMENT PREVIEW NOTICE: The Platform is currently under active development. Core capabilities including generative AI question generation, audio speech recognition, natural voice synthesis, and ATS resume scoring are actively evolving and subject to iterative enhancements.',
          'THE PLATFORM IS NOT AN EMPLOYER, RECRUITER, OR EMPLOYMENT AGENCY. WE DO NOT GUARANTEE INTERVIEW CALLS, JOB OFFERS, SALARY LEVELS, OR HIRING OUTCOMES AT ANY COMPANY (INCLUDING COMPANIES FEATURED IN PRACTICE BLUEPRINTS LIKE FLIPKART, SWIGGY, GOOGLE, INFOSYS, OR TCS).',
          'Company names, brand blueprints, and interview round formats are utilized solely for contextual educational role-play and preparation purposes and do not imply sponsorship, affiliation, endorsement, or partnership with those companies.'
        ]
      },
      {
        heading: '3. Eligibility & Account Security',
        content: [
          'You must be at least 18 years of age (or the age of majority in your jurisdiction) to register an independent account. Candidates aged 16–17 may use the Platform solely with verified parental or guardian consent.',
          'You are responsible for maintaining the confidentiality of your login credentials and for all activities occurring under your account. You must notify us immediately of any unauthorized account access.'
        ]
      },
      {
        heading: '4. Acceptable Use Policy',
        content: [
          'You agree to use InterviewBro AI exclusively for lawful personal career preparation. You agree NOT to:',
          '• Interrogate the AI models to extract underlying system prompts, proprietary question banks, or API credentials.',
          '• Use automated scrapers, bots, or spiders to extract interview questions, transcripts, or benchmarks.',
          '• Upload malicious payloads, corrupted files, or materials that infringe third-party intellectual property or privacy rights.',
          '• Transmit hate speech, abusive, defamatory, sexually explicit, or unlawful content during voice or text mock sessions.',
          '• Attempt to circumvent rate limits, session quotas, authentication barriers, or server security mechanisms.'
        ]
      },
      {
        heading: '5. Intellectual Property Rights',
        content: [
          'All software, design systems, algorithms, audio processing pipelines, branding, logos, and curated blueprint rubrics are the exclusive intellectual property of InterviewBro AI and its licensors.',
          'You retain ownership of the original text of your uploaded resumes and spoken answers. You grant InterviewBro AI a limited, revocable, non-exclusive license to process your answers and resume text solely for the purpose of generating your real-time interview questions, evaluations, and feedback reports.'
        ]
      },
      {
        heading: '6. Disclaimer of Warranties',
        content: [
          'THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.',
          'WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR VIRUS-FREE. AI-GENERATED QUESTIONS, EVALUATIONS, AND ATS ESTIMATES MAY CONTAIN ERRORS, INACCURACIES, OR "HALLUCINATIONS". YOU MUST USE YOUR OWN INDEPENDENT JUDGMENT BEFORE RELYING ON AI FEEDBACK.'
        ]
      },
      {
        heading: '7. Limitation of Liability',
        content: [
          'TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW (INCLUDING APPLICABLE INDIAN LAWS), INTERVIEWBRO AI AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF EMPLOYMENT OPPORTUNITIES, ANTICIPATED SALARY, CAREER DELAYS, OR DATA LOSS.',
          'OUR TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS SHALL NOT EXCEED THE TOTAL AMOUNT PAID BY YOU TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM (OR INR 1,000 IF YOU USED THE FREE TIER EXCLUSIVELY).'
        ]
      },
      {
        heading: '8. Governing Law & Dispute Resolution',
        content: [
          'These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without regard to conflict of law principles.',
          'Any legal disputes, controversies, or claims arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of the operator\'s verified domicile in India [OWNER ACTION REQUIRED: Designate appropriate city/district court jurisdiction upon legal counsel review].'
        ]
      }
    ]
  },

  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Explains how InterviewBro AI collects, uses, protects, and discloses personal data in accordance with the Digital Personal Data Protection Act, 2023 (India).',
    sections: [
      {
        heading: '1. Introduction & Data Fiduciary Details',
        content: [
          'InterviewBro AI acts as a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP Act) for the personal data collected from candidates practicing on our platform.',
          'This Privacy Policy describes what information we collect, the lawful basis for processing, how long data is retained, and how you can exercise your statutory rights to access, correct, and delete your data.',
          'Data Fiduciary: Platform Operator (Individual Developer) [OWNER ACTION REQUIRED: Specify Individual Operator Legal Name or Registered Business Name upon formation]',
          'Operational Status: Pre-incorporation educational project operated by an individual developer in India [Interim / Pre-Incorporation Draft]',
          'Official Contact / Privacy Channel: In-app Privacy Center self-service controls [OWNER ACTION REQUIRED: Configure and publish monitored domain contact email e.g. privacy@interviewbro.ai or verified email address]',
          'Registered / Communication Address: [OWNER ACTION REQUIRED: Designate verified physical communication address in India for statutory notices]'
        ]
      },
      {
        heading: '2. Personal Data We Collect & Processing Purposes',
        content: [
          'We collect only the minimum personal data strictly necessary to deliver personalized mock interview simulations and ATS resume evaluations:',
        ],
        subsections: [
          {
            title: 'Account Identifiers',
            bullets: [
              'Data Collected: Full name, verified email address, hashed passwords (managed via Supabase Auth), account creation and login timestamps.',
              'Purpose: Authentication, security verification, session management, and password recovery.',
              'Storage & Location: Encrypted in Supabase PostgreSQL database protected by Row Level Security (RLS).'
            ]
          },
          {
            title: 'Candidate Profile & Placement Goals',
            bullets: [
              'Data Collected: Target job role (e.g. SDE-1, Full Stack Developer), experience level (e.g. Fresher, Student, Mid-level), college/university, graduation year, technical skills tags, and career aspirations.',
              'Purpose: Personalizing AI interviewer difficulty, tailoring interview questions to your background, and measuring your placement readiness.',
              'Storage & Location: Saved to your user-isolated database profile and cached locally in your browser.'
            ]
          },
          {
            title: 'Spoken Answers & Interview Transcripts',
            bullets: [
              'Data Collected: Text transcriptions of your spoken or typed answers to interview questions, session duration, question categories, and question scores.',
              'Purpose: Generating question-by-question evaluations, STAR answer structure scores, and comprehensive feedback reports.',
              'Storage & Location: Persisted to your user-isolated interview sessions table and available in your Session History archive.'
            ]
          },
          {
            title: 'Resume Data & Extracted Text',
            bullets: [
              'Data Collected: Resume file metadata (file name, file size), extracted text of skills, educational qualifications, projects, and work history.',
              'Processing Method: The original resume file binary (PDF/DOCX) is processed strictly in volatile server RAM buffer via Multer memory storage and is NEVER saved to physical server disk. Only the extracted analysis report (skills found, keyword gaps, estimated ATS score) is stored.',
              'Advisory: Candidates should remove sensitive personal identification numbers (Aadhaar, PAN, Passport, bank accounts) before uploading resumes for practice.'
            ]
          },
          {
            title: 'Hardware & Media Access (Camera & Microphone)',
            bullets: [
              'Camera Feed: Rendered strictly locally on your own screen via HTML5 video element to simulate an authentic video call. Video frames are NEVER recorded, streamed, uploaded, or analyzed.',
              'Microphone Audio: Captured via browser Web Speech API for real-time speech-to-text conversion. Raw audio waveforms are never saved to our servers; only the transcribed text of your answer is logged.'
            ]
          }
        ]
      },
      {
        heading: '3. Third-Party Sub-Processors & Data Transfers',
        content: [
          'To deliver cutting-edge AI simulation and secure authentication, we partner with specialized cloud infrastructure sub-processors under strict data protection commitments:',
          '• Supabase, Inc. (Database & Authentication): Hosts our PostgreSQL database with Row Level Security, GoTrue identity management, and encrypted database connections.',
          '• Vercel, Inc. (Hosting & Serverless Functions): Serves the frontend web client and serverless API execution at the edge.',
          '• Google Cloud / Google AI Studio (LLM Intelligence): Generates dynamic interview questions, follow-up probes, and STAR evaluations via Google Gemini API. Data processed through developer API endpoints conforms to Google AI Studio Terms.',
          '• ElevenLabs, Inc. (Voice Synthesis - Optional): Converts question text into high-fidelity interviewer audio. Only the text of the AI interviewer\'s question is sent to ElevenLabs; candidate answers and audio are NEVER sent.',
          'We do not sell, rent, or trade your personal information to advertising networks, recruiters, or data brokers.'
        ]
      },
      {
        heading: '4. Data Retention & Archival Timelines',
        content: [
          '• Active Accounts: Personal data is retained as long as your account remains active so you can track your interview improvement over time.',
          '• Inactive Accounts: Accounts with no login or practice activity for twelve (12) consecutive months will receive an email notice before being scheduled for automated archival or deletion.',
          '• Account Deletion: When you request account deletion through our Privacy Center or Settings, all personal records, sessions, reports, and resume analyses are immediately purged across our database and local browser storage.'
        ]
      },
      {
        heading: '5. Your Rights as a Data Principal (DPDP Act 2023)',
        content: [
          'Under the Digital Personal Data Protection Act, 2023 (Sections 11–14), you have clear statutory rights regarding your personal data:',
          '• Right to Access Information: Request a summary of your personal data processed by us and the processing activities undertaken.',
          '• Right to Correction & Erasure: Correct inaccurate profile data or permanently delete your account and associated session records.',
          '• Right of Grievance Redressal: Lodge a grievance regarding your personal data processing with our designated Grievance Contact.',
          '• Right to Nominate: Nominate another individual to exercise your rights in the event of death or incapacity.',
          'To exercise any of these rights, visit our in-app Privacy Center for instant self-service export and deletion, or submit an inquiry to our designated privacy channel [OWNER ACTION REQUIRED: Monitored contact email, e.g. privacy@interviewbro.ai].'
        ]
      }
    ]
  },

  'ai-disclaimer': {
    id: 'ai-disclaimer',
    title: 'AI Interview & Scoring Disclaimer',
    shortTitle: 'AI Disclaimer',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Transparently clarifies the capabilities, limitations, probabilistic nature, and intended educational use of our AI interview simulation models.',
    sections: [
      {
        heading: '1. Educational Simulation & Non-Binding Nature',
        content: [
          'InterviewBro AI utilizes large language models (Google Gemini API) and probabilistic heuristic scoring engines to generate simulated mock interview questions, follow-up probes, candidate answer evaluations, and ATS resume keyword match estimates.',
          'ALL SCORES, COMPETENCY RATINGS (TECHNICAL ACCURACY, COMMUNICATION CLARITY, STAR DELIVERY), ATS MATCH PERCENTAGES, AND COACH TIPS ARE FOR INFORMATIONAL AND EDUCATIONAL PRACTICE PURPOSES ONLY.',
          'Scores generated by InterviewBro AI do NOT guarantee placement, hiring success, interview qualification, or performance in real company interviews. Real hiring decisions depend on human interviewers, company-specific rubrics, cultural alignment, and live problem-solving under real recruitment conditions.'
        ]
      },
      {
        heading: '2. Potential for Model Hallucinations & Errors',
        content: [
          'Generative AI models operate probabilistically. While we design rigorous prompt guardrails and software engineering rubrics:',
          '• The AI interviewer may occasionally generate questions with imperfect technical phrasing or incorrect assertions.',
          '• Automated evaluations may misinterpret nuanced, novel, or unconventional architectural designs and valid programming solutions.',
          '• ATS score estimates reflect algorithmic keyword matching and formatting heuristics, not the proprietary algorithms of third-party enterprise ATS systems like Workday, Greenhouse, or Taleo.',
          'You should critically review all AI feedback and cross-reference core engineering concepts with authoritative technical documentation.'
        ]
      },
      {
        heading: '3. Absolute Prohibition of Biometric & Emotion Assessment',
        content: [
          'InterviewBro AI DOES NOT PERFORM FACIAL EXPRESSION RECOGNITION, EMOTION ANALYSIS, EYE-TRACKING, MICRO-EXPRESSION DETECTION, OR BIOMETRIC SURVEILLANCE.',
          'We believe that inferring honesty, stress levels, technical aptitude, or employability from facial video feeds is scientifically unsubstantiated and unethical.',
          'The camera feed in the Interview Room is strictly a local client-side mirror designed to help you practice eye contact and posture for remote video calls. No video stream is analyzed by any AI model.'
        ]
      },
      {
        heading: '4. Scoring Rubric Transparency',
        content: [
          'Evaluations in InterviewBro AI are structured around four objective performance dimensions:',
          '1. Technical Accuracy (0–100): Correctness of algorithms, architectural trade-offs, language fundamentals, and boundary condition awareness.',
          '2. Communication Clarity (0–100): Composure, concise articulation, structured explanation of engineering decisions, and active vocabulary.',
          '3. STAR Answer Delivery (0–100): Adherence to the Situation, Task, Action, and quantified Result narrative structure.',
          '4. Role & Question Relevance (0–100): Directness in addressing the specific interview prompt without evasiveness or off-topic filler.'
        ]
      }
    ]
  },

  'voice-video': {
    id: 'voice-video',
    title: 'Voice, Microphone & Video Processing Notice',
    shortTitle: 'Voice & Video',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Details how hardware permissions (camera, microphone) and browser audio streaming are handled on your device.',
    sections: [
      {
        heading: '1. Hardware Permission Scopes',
        content: [
          'InterviewBro AI requests browser permissions for your microphone and camera solely to power the live interactive interview simulation experience.',
          'You retain full control over these permissions. You can grant, deny, or revoke access at any time through your web browser\'s site settings (the padlock icon in your browser address bar).'
        ]
      },
      {
        heading: '2. Camera & Video Handling',
        content: [
          '• Local Mirror Only: When you enable the camera, your browser creates a local MediaStream rendered directly into the HTML5 video element on your screen.',
          '• Zero Cloud Video Transmission: Video frames, snapshots, and video recordings are NEVER sent to our servers, Vercel, Supabase, Google, or any third party.',
          '• Optional Video: Video mode is completely optional. You can practice in Voice-First or Text-Only mode at any time without enabling your camera.'
        ]
      },
      {
        heading: '3. Microphone & Speech Recognition (STT)',
        content: [
          '• Capture Mechanism: When you click "Start Answer" or speak during a session, your microphone audio is processed via your browser\'s native Web Speech API (SpeechRecognition).',
          '• Audio Storage: Raw audio files (.wav, .mp3) are NOT stored by InterviewBro AI. Audio streams are converted to text in real-time.',
          '• Browser Speech Processing: In Google Chrome and Microsoft Edge, the Web Speech API may route audio snippets through Google or Microsoft speech recognition servers to generate text transcription in accordance with your browser\'s vendor terms.'
        ]
      },
      {
        heading: '4. Interviewer Voice Synthesis (TTS)',
        content: [
          '• Web Speech API Synthesis: By default, the AI interviewer speaks using your operating system and browser\'s built-in speech synthesis engine (offline, client-side, zero data transfer).',
          '• Neural ElevenLabs Voice (Optional): If configured, question text is sent to ElevenLabs to stream natural audio. Only the interviewer\'s question text is transmitted; candidate speech is never sent.'
        ]
      }
    ]
  },

  retention: {
    id: 'retention',
    title: 'Data Retention & Account Deletion Policy',
    shortTitle: 'Data Retention',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Defines data life-cycle schedules, automated archival, and our complete self-service account deletion protocol.',
    sections: [
      {
        heading: '1. Principle of Storage Limitation',
        content: [
          'In compliance with Section 8(7) of the DPDP Act 2023, InterviewBro AI retains personal data only for as long as necessary to fulfill the educational placement purposes for which it was collected, or as required by applicable law.'
        ]
      },
      {
        heading: '2. Data Retention Schedules by Category',
        content: [
          '• User Account & Profile: Retained for the active lifespan of the account. Inactive accounts with zero logins for 12 months are flagged for automated archival.',
          '• Interview Transcripts & Recordings: Retained in your account archive until you delete the individual session via the Session History tab or delete your account.',
          '• Feedback Reports: Retained alongside session transcripts until deleted by the user.',
          '• Resume Analysis Records: Parsed JSON reports are retained until deleted via the Resume ATS Analyzer page. The original uploaded resume document binary is discarded immediately after memory extraction.',
          '• Diagnostic & Error Logs: Serverless execution logs (which contain masked emails and sanitized error messages) are retained by Vercel for up to thirty (30) days for operational reliability.'
        ]
      },
      {
        heading: '3. Self-Service Account & Data Deletion Workflow',
        content: [
          'You have the absolute right to delete your account and all associated personal data at any time without administrative intervention.',
          'How to Delete Your Account:',
          '1. Log in to your InterviewBro AI account.',
          '2. Navigate to Settings & Security or the Privacy Center.',
          '3. Under the "Delete Account & All Personal Data" section, click "Permanently Delete Account".',
          '4. Confirm your decision in the verification modal.',
          'What Happens Upon Deletion:',
          '• Immediate Cloud Purge: The system invokes our secure account deletion API, deleting your profile, interview sessions, feedback reports, and resume analyses from Supabase PostgreSQL tables.',
          '• Authentication Termination: Your Supabase GoTrue authentication credentials and active JWT sessions are revoked.',
          '• Local Storage Wipe: All cached transcripts, access tokens, and persona settings are immediately cleared from your local browser storage.',
          '• Irreversibility: Once deleted, account history and transcripts cannot be recovered.'
        ]
      }
    ]
  },

  cookies: {
    id: 'cookies',
    title: 'Cookie & Tracking Notice',
    shortTitle: 'Cookies & Storage',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Discloses the actual web storage technologies utilized on InterviewBro AI — verifying zero third-party advertising cookies.',
    sections: [
      {
        heading: '1. Zero Marketing & Advertising Cookies',
        content: [
          'INTERVIEWBRO AI DOES NOT USE ADVERTISING COOKIES, CROSS-SITE TRACKERS, GOOGLE ANALYTICS, OR SOCIAL MEDIA TRACKING PIXELS (SUCH AS META PIXEL OR TIKTOK PIXEL).',
          'We believe student and candidate career preparation should remain private, uninterrupted, and free from surveillance advertising.'
        ]
      },
      {
        heading: '2. Essential Functional Web Storage Technologies',
        content: [
          'To keep you securely logged in, remember your preferred interviewer voice, and support offline resilience, InterviewBro AI uses browser HTML5 LocalStorage (not HTTP cookies):',
        ],
        subsections: [
          {
            title: 'Technical Web Storage Inventory',
            bullets: [
              'interviewbro_token: Stores your secure GoTrue JWT session token to authenticate API calls (Strictly Essential).',
              'interviewbro_user: Caches your verified profile details (name, target role, skills) for instant interface rendering (Functional).',
              'interviewbro_sessions_[uid]: Stores your practice transcripts locally so you can review interview performance without reloading (Functional).',
              'interviewbro_reports_[uid]: Caches your STAR feedback reports and scores on your device (Functional).',
              'interviewbro_resumes_[uid]: Stores your ATS keyword audit reports locally (Functional).',
              'interviewbro_quota_[uid]: Tracks your practice session allowance counter (Functional).',
              'interviewbro_voice_id: Remembers your selected interviewer voice persona (Preference).'
            ]
          }
        ]
      },
      {
        heading: '3. Managing & Clearing Local Storage',
        content: [
          'You can clear your local application storage at any time by clicking "Clear All Local Session Data" in the in-app Settings page, or directly through your browser\'s Developer Tools / Privacy Settings (under "Clear Cookies and Site Data").',
          'Clearing local storage will log you out of your current browser session until you sign in again.'
        ]
      }
    ]
  },

  pricing: {
    id: 'pricing',
    title: 'Pricing, Fair Usage & Refund Policy',
    shortTitle: 'Pricing & Fair Usage',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Outlines our unlimited free campus tier, acceptable fair usage guidelines, and policies for future premium features.',
    sections: [
      {
        heading: '1. Current Campus & Placement Free Tier',
        content: [
          'InterviewBro AI currently offers an Unlimited Free Practice Tier for college students, freshers, and job seekers preparing for campus and off-campus tech placements.',
          'Under this tier, candidates can practice mock interviews across tech blueprints, scan resumes for ATS keywords, and receive comprehensive STAR feedback reports free of monetary charge.'
        ]
      },
      {
        heading: '2. Fair Usage Policy (FUP)',
        content: [
          'To ensure service availability, prevent automated abuse, and maintain rapid response times for all candidates:',
          '• Automated Batch Generation Prohibited: Creating dozens of automated sessions via scripts, bots, or non-human agents is strictly prohibited.',
          '• Concurrency Limits: Each candidate account is limited to one (1) active live interview room at any given time.',
          '• Rate Limiting: High-frequency API calls that strain server resources or third-party AI provider quotas may trigger temporary automated cooldowns.',
          'We reserve the right to suspend or restrict accounts that violate this Fair Usage Policy.'
        ]
      },
      {
        heading: '3. Future Premium Services & Refund Terms',
        content: [
          'If InterviewBro AI introduces optional paid tiers (e.g. 1-on-1 human mentor reviews, enterprise placement dashboards, or specialized certifications):',
          '• Transparent Pricing: All fees will be clearly presented in Indian Rupees (INR) including applicable Goods and Services Tax (GST) before purchase.',
          '• Cancellation & Refunds: Detailed terms regarding cancellation timeframes, prorated refunds, and billing cycles will be published prior to any paid tier launch.',
          '• No Surprise Billing: You will never be charged without explicit, affirmative consent and two-factor payment authorization.'
        ]
      }
    ]
  },

  contact: {
    id: 'contact',
    title: 'Contact, Privacy Requests & Grievance Redressal',
    shortTitle: 'Contact & Grievances',
    version: '1.2',
    lastUpdated: 'October 19, 2026',
    summary: 'Official contact channels for general support, statutory data access/deletion requests, and Grievance Officer information under Indian law.',
    sections: [
      {
        heading: '1. Customer Support & General Inquiries',
        content: [
          'For technical issues, voice test diagnostics, bug reports, or feedback regarding our mock interview blueprints:',
          '• Primary In-App Channel: In-App Privacy Center & Account Settings (instant self-service data management)',
          '• Project Repository: GitHub project repository issue tracker',
          '• General Support Email: [OWNER ACTION REQUIRED: Designate and publish verified support email address, e.g. support@interviewbro.ai once provisioned]',
          '• Response Time: We endeavor to respond to technical inquiries within two (2) business days.'
        ]
      },
      {
        heading: '2. Submitting Privacy, Data Access & Erasure Requests',
        content: [
          'Under the Digital Personal Data Protection Act, 2023, you have the right to request access to, correction of, or erasure of your personal data.',
          'How to Submit a Request:',
          '• Self-Service (Instant): Use our in-app Privacy Center to download your complete data archive in JSON format or delete your account with one click.',
          '• Email Request: Submit request to [OWNER ACTION REQUIRED: Monitored privacy email, e.g. privacy@interviewbro.ai] with the subject line "DPDP Data Rights Request". Please send the inquiry from the address associated with your InterviewBro AI account for identity verification.',
          '• Processing Time: Data access and correction requests are processed within thirty (30) days of receipt.'
        ]
      },
      {
        heading: '3. Statutory Grievance Redressal Officer (India)',
        content: [
          'In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, the designated Grievance Contact for InterviewBro AI is:',
          '• Operator / Responsible Person: Individual Developer / Platform Operator [OWNER ACTION REQUIRED: Name of designated Grievance Officer / Responsible Individual]',
          '• Capacity / Role: Platform Operator / Candidate Privacy Contact [OWNER ACTION REQUIRED: Confirm statutory designation]',
          '• Operating Entity: Educational platform operated by an individual developer [OWNER ACTION REQUIRED: Registered Entity / Business Name upon incorporation]',
          '• Physical Communication Address: [OWNER ACTION REQUIRED: Specify physical communication address in India for statutory notices]',
          '• Grievance Redressal Channel: In-App Privacy Center or [OWNER ACTION REQUIRED: Monitored grievance email, e.g. grievance@interviewbro.ai]',
          '• Timelines: Grievances will be acknowledged within 48 hours and resolved within thirty (30) days as stipulated under applicable statutory guidelines.'
        ]
      }
    ]
  }
};
