import { AcademyModule } from '../types/academy';

/**
 * Interview Academy: Complete 8-Module Curriculum
 * 
 * Tailored for Indian college students, freshers, campus placement candidates,
 * and job seekers with zero prior corporate interview experience.
 */

export const ACADEMY_MODULES: AcademyModule[] = [
  // =========================================================================
  // MODULE 1: PREPARING FOR AN INTERVIEW
  // =========================================================================
  {
    id: 'module-1-preparation',
    order: 1,
    title: 'Pre-Interview Preparation & Placement Readiness',
    subtitle: 'From Company Research to Virtual Setup',
    description: 'Learn the exact steps to research recruiters, decode job descriptions, test your technical equipment, and dress for success.',
    iconName: 'Compass',
    category: 'Foundation',
    lessons: [
      {
        id: 'lesson-1',
        moduleId: 'module-1-preparation',
        number: 1,
        title: 'Preparing for an Interview',
        subtitle: 'Foundations of Pre-Interview Research, Tech Checks & Grooming',
        estimatedMinutes: 8,
        tags: ['Preparation', 'Company Research', 'Placement Drives', 'Tech Setup'],
        objective: 'Master pre-interview research, job description decoding, virtual/offline tech setups, and professional grooming so you enter any round 100% prepared.',
        sections: [
          {
            id: 'm1-s1',
            title: '1. Understanding the Recruiter & Company Landscape',
            content: `Before stepping into an interview room or joining a Google Meet link, you must understand who is interviewing you. In Indian campus placements and hiring drives, companies generally fall into three categories:

1. **Service Giants (TCS, Infosys, Wipro, Cognizant, Accenture):**
   They hire in high volumes. They prioritize strong fundamentals in OOPs, DBMS, basic SQL, coding logic, and reliable communication. They value candidates who are adaptable, willing to learn, and open to relocation.

2. **Product Unicorns & Fintechs (Swiggy, Razorpay, CRED, Flipkart):**
   They prioritize problem-solving, clean code, data structures & algorithms (DSA), and deep understanding of projects built in college.

3. **Startups & High-Growth Boutiques:**
   They look for self-starters who have built real-world apps, deployed projects, or contributed to open-source software with minimal supervision.

**Action Rule:** Spend at least 30 minutes researching the company website, recent news, their main products/clients, and the CEO/founders before the interview.`,
            keyTakeaways: [
              'Categorize the employer: Service MNC, Product Unicorn, or Fast-paced Startup.',
              'Know what the company actually builds or sells before attending.',
              'Search LinkedIn to see recent campus hire experiences or company milestones.'
            ],
            checklist: [
              'Visit company official website "About Us" and "Products" pages',
              'Check Google News for recent company announcements or client wins',
              'Review the specific job description (JD) and note required primary skills'
            ]
          },
          {
            id: 'm1-s2',
            title: '2. Decoding the Job Description (JD)',
            content: `A Job Description is not a wishlist you must match 100%; it is a blueprint of the problems the team wants solved.

- **Must-Have Core Skills:** Highlighted in the top bullets (e.g., "Knowledge of Java, Python, or JavaScript"). Connect at least one academic project to each required skill.
- **Good-to-Have Skills:** Technologies like Docker, AWS, or CI/CD pipelines. Even if you only experimented with them in a weekend tutorial, mention your curiosity and hands-on familiarity.
- **Soft Skills Requirements:** Phrases like "team player" or "proactive learner" mean you will be asked behavioral questions about college group projects, fest organizing, or hackathons.`,
            keyTakeaways: [
              'Connect at least one college project or course to the top 3 requirements in the JD.',
              'Do not be intimidated if you only match 60-70% of the JD requirements as a fresher.',
              'Prepare concrete examples of how you learned a new tool quickly.'
            ]
          },
          {
            id: 'm1-s3',
            title: '3. The Physical & Virtual Readiness Checklist',
            content: `First impressions are formed within the first 10 seconds. Whether your interview is in-person in a college placement hall or virtual over Microsoft Teams, follow these rules:

- **Virtual Audio & Video:** Use a wired earphone or good headset. Ensure your face is lit from the front, not backlit by a window. Position the webcam at eye level.
- **Backup Hotspot:** Keep your smartphone hotspot tested and ready. In India, sudden Wi-Fi drops during placement rounds are common.
- **Professional Attire:** Formal shirts (solid light blue, white, or pastel) with a collar. Even for virtual interviews, dress fully in formals; it sets a professional psychological state.
- **Documents Ready:** Have 3 hard copies of your updated resume, college ID card, academic mark sheets, and government photo ID in a neat portfolio folder.`,
            keyTakeaways: [
              'Eye-level camera with front lighting eliminates awkward angles and shadows.',
              'Always keep a mobile hotspot active on standby for virtual rounds.',
              'Solid light-colored collared formals convey immediate professionalism.'
            ],
            checklist: [
              'Webcam tested at eye level with neutral background',
              'Microphone test completed with crisp audio and no echo',
              'Phone kept on silent (not vibrate) away from the desk',
              'Resume copies and a clean notepad with a pen ready'
            ]
          }
        ],
        examples: [
          {
            id: 'm1-ex1',
            scenario: 'Interviewer asks: "What do you know about our company and why did you apply for our campus drive?"',
            badExample: {
              text: 'Sir, your company came to our college campus and training placement cell told all CSE students to register. I know you are a big IT MNC with good package and many offices in Bangalore and Hyderabad.',
              analysis: 'Shows zero personal initiative. Makes the candidate sound like an accidental applicant who only cares about CTC and location.',
              spokenAudioText: 'Sir, your company came to our college campus and TPO told us to register. I know you are a big IT MNC with good package.'
            },
            goodExample: {
              text: 'I have been following Infosys’s recent work in generative AI solutions through Topaz, particularly how you helped automate customer workflows in banking. During my 6th-semester project on automated document indexing, I became fascinated by enterprise scale. Knowing your training campus in Mysore is among the finest in Asia for freshers, I am eager to apply my strong core Java fundamentals and grow within your digital engineering practice.',
              analysis: 'Mentions specific company products (Topaz), ties it to their college project, and highlights eagerness to undergo technical training.',
              spokenAudioText: 'I have been following your company’s recent work in cloud solutions. During my 6th-semester project, I became fascinated by enterprise scale. Knowing your training program is among the finest for freshers, I am eager to apply my core Java fundamentals here.'
            },
            proTip: 'Mentioning one recent project, product name, or initiative by the company instantly puts you in the top 10% of campus applicants.'
          }
        ],
        exercise: {
          id: 'm1-ex-prep',
          title: 'Placement Pre-Flight Readiness Audit',
          type: 'checklist',
          instructions: 'Review the 5 vital preparation steps below and write a short 3-sentence summary of the target company you are preparing for today.',
          prompt: 'Identify the company name, one core service/product they provide, and how your college background connects to it.',
          starterTemplate: 'Target Company: [Company Name]\nCore Product/Domain: [e.g., Core Banking / Cloud Migration / Logistics App]\nMy Academic Connection: [e.g., I studied DBMS and built a full-stack library portal]',
          evaluationRubric: [
            { criterion: 'Specific Company Knowledge', idealTarget: 'Names an actual product, service line, or domain rather than general IT statements.' },
            { criterion: 'Academic Connection', idealTarget: 'Relates college coursework or project directly to the company domain.' }
          ],
          sampleAnswer: 'Target Company: Tata Consultancy Services\nCore Product/Domain: Enterprise cloud transformation and TCS BaNCS in banking.\nMy Academic Connection: My coursework in Database Management and Java OOPs gave me hands-on practice designing scalable relational schemas.'
        },
        quiz: [
          {
            id: 'm1-q1',
            question: 'What is the most effective way to research a company before a campus placement drive?',
            conceptKey: 'Company Research',
            hint: 'Focus on what the company actually builds and sells.',
            options: [
              {
                id: 'a',
                text: 'Only memorizing the company share price and the name of the HR manager.',
                isCorrect: false,
                explanation: 'Share prices are secondary; recruiters want to know if you understand their actual work and technology focus.'
              },
              {
                id: 'b',
                text: 'Reviewing their core products, recent initiatives, client domains, and connecting them to your skills.',
                isCorrect: true,
                explanation: 'Correct! Understanding their domain and connecting it to your academic skills shows authentic enthusiasm and initiative.'
              },
              {
                id: 'c',
                text: 'Asking seniors what salary they received during last year’s drive.',
                isCorrect: false,
                explanation: 'Salary discussions do not demonstrate technical aptitude or value to the recruiter.'
              },
              {
                id: 'd',
                text: 'Assuming all IT service companies do identical work so no research is needed.',
                isCorrect: false,
                explanation: 'Every company has unique flagship platforms, training specializations, and focus sectors.'
              }
            ]
          },
          {
            id: 'm1-q2',
            question: 'For a virtual video interview, what is the best practice regarding eye contact and camera placement?',
            conceptKey: 'Virtual Tech Setup',
            hint: 'Think about where the interviewer sees your eyes looking.',
            options: [
              {
                id: 'a',
                text: 'Position the camera at eye level and look toward the webcam lens when speaking.',
                isCorrect: true,
                explanation: 'Correct! Looking at the webcam lens simulates direct eye contact for the interviewer on their screen.'
              },
              {
                id: 'b',
                text: 'Keep the laptop on your lap so you look relaxed and comfortable.',
                isCorrect: false,
                explanation: 'Looking down into a low laptop creates an unflattering angle and gives the impression of poor posture.'
              },
              {
                id: 'c',
                text: 'Keep your video switched off to conserve bandwidth unless strictly forced to turn it on.',
                isCorrect: false,
                explanation: 'Keeping video off without permission prevents rapport and looks unprofessional in recruitment drives.'
              },
              {
                id: 'd',
                text: 'Stare continuously at your own video preview box to check your hair.',
                isCorrect: false,
                explanation: 'Looking at your self-preview makes you appear distracted and disengaged.'
              }
            ]
          },
          {
            id: 'm1-q3',
            question: 'If a Job Description lists a technology you have never used (e.g., Docker or AWS), what should you do?',
            conceptKey: 'JD Decoding',
            options: [
              {
                id: 'a',
                text: 'Lie on your resume and hope they do not ask questions about it.',
                isCorrect: false,
                explanation: 'Never misrepresent skills; technical interviewers can uncover fake resume points within 30 seconds.'
              },
              {
                id: 'b',
                text: 'Give up and do not apply because you do not meet 100% of the criteria.',
                isCorrect: false,
                explanation: 'Freshers are judged on learning agility and core fundamentals, not on knowing every single enterprise tool.'
              },
              {
                id: 'c',
                text: 'Focus on your strong fundamentals (OOPs, DSA, SQL) and highlight your ability to pick up new tools fast.',
                isCorrect: true,
                explanation: 'Correct! Freshers are evaluated on foundational problem-solving and eagerness to learn new technologies.'
              },
              {
                id: 'd',
                text: 'Criticize the tool during the interview to prove you prefer older tools.',
                isCorrect: false,
                explanation: 'Criticizing industry-standard technologies displays closed-mindedness.'
              }
            ]
          },
          {
            id: 'm1-q4',
            question: 'What documents should you keep immediately accessible during an on-campus placement interview?',
            conceptKey: 'Placement Readiness',
            options: [
              {
                id: 'a',
                text: 'Only your mobile phone with a digital copy of your resume.',
                isCorrect: false,
                explanation: 'Fumbling on a phone during an interview looks disorganized and unprofessional.'
              },
              {
                id: 'b',
                text: 'At least 2-3 clean printed copies of your resume, college ID card, government ID, and a notepad with pen.',
                isCorrect: true,
                explanation: 'Correct! Multiple printed copies ensure you can hand one to each interviewer on the panel.'
              },
              {
                id: 'c',
                text: 'Textbooks for all four years of engineering to search for answers.',
                isCorrect: false,
                explanation: 'Interviews evaluate understanding, not textbook lookup speed.'
              },
              {
                id: 'd',
                text: 'No documents are necessary since everything was submitted online.',
                isCorrect: false,
                explanation: 'Panelists often ask candidates for a physical resume sheet during face-to-face evaluations.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 2: ENTERING THE ROOM & GREETING
  // =========================================================================
  {
    id: 'module-2-entry-greeting',
    order: 2,
    title: 'Room Entry & Professional First Impressions',
    subtitle: 'Door Etiquette, Posture & The Opening 30 Seconds',
    description: 'Learn how to knock, enter confidently, greet panel members, maintain professional posture, and avoid common fresher blunders.',
    iconName: 'DoorOpen',
    category: 'Presence & Delivery',
    lessons: [
      {
        id: 'lesson-2',
        moduleId: 'module-2-entry-greeting',
        number: 2,
        title: 'Entering the Room & Greeting the Interviewer',
        subtitle: 'The Decisive First 30 Seconds of Any Interview',
        estimatedMinutes: 7,
        tags: ['Body Language', 'First Impression', 'Etiquette', 'Greetings'],
        objective: 'Master door entry etiquette, confident posture, respectful greetings, and comfortable seating behavior for both offline and virtual interviews.',
        sections: [
          {
            id: 'm2-s1',
            title: '1. Entering the Physical Room: Knocking & Permission',
            content: `The moment your name is called in a placement waiting hall, your interview has begun.

1. **The Gentle Knock:** Knock lightly twice on the door. Do not barge in even if the door is ajar.
2. **Seek Permission to Enter:** Open the door gently, make eye contact with the interviewer or panel, and ask politely:
   *"Excuse me Sir/Ma'am, may I come in?"*
3. **Walk with Poise:** Walk with your back straight, shoulders relaxed, and arms loose. Avoid looking at your shoes or clutching your file tightly against your chest.
4. **Approach the Chair:** Stand beside or behind the candidate chair. **Do NOT sit down immediately.** Wait for the interviewer to say: *"Please take a seat."* Once they invite you, smile, reply *"Thank you Sir/Ma'am"*, and sit smoothly.`,
            keyTakeaways: [
              'Always knock twice and ask permission before entering.',
              'Never sit down until the panel explicitly invites you to have a seat.',
              'Always acknowledge the invitation with a polite "Thank you".'
            ],
            checklist: [
              'Knock gently twice',
              'Ask "May I come in, Sir/Ma’am?" with a warm smile',
              'Stand comfortably next to the chair without slouching',
              'Sit only when invited and say "Thank you"'
            ]
          },
          {
            id: 'm2-s2',
            title: '2. The Opening Greeting & Addressing the Panel',
            content: `In India, addressing interviewers with respect while remaining warm is standard practice:

- **Time-Specific Greeting:** If it is before 12:00 PM, say *"Good morning, Sir / Ma'am."* Between 12:00 PM and 4:30 PM, say *"Good afternoon."* After 4:30 PM, say *"Good evening."*
- **Panel of Multiple Interviewers:** Greet female panel members first (*"Good morning Ma'am, good morning Sir"*). Maintain eye contact across the whole panel.
- **Handshakes vs. Namaste:**
  - In Indian campus drives, wait for the interviewer to initiate a handshake.
  - If they extend a hand, offer a firm, dry, 2-second grip with direct eye contact.
  - If they do not extend a hand, a gentle nod with a warm smile or polite *Namaste* is universally respected.
- **Bag & File Placement:** Place your folder/bag neatly on the floor beside your feet or on your lap. **Never place your backpack, phone, or water bottle on the interviewer’s desk.**`,
            keyTakeaways: [
              'Use appropriate time-of-day greetings (Morning, Afternoon, Evening).',
              'Never place personal items, bags, or phones on the interviewer’s desk.',
              'Wait for the interviewer to offer their hand before attempting a handshake.'
            ]
          },
          {
            id: 'm2-s3',
            title: '3. Joining Virtual Video Calls (Google Meet / Zoom / Teams)',
            content: `Virtual interviews have their own unique opening rules:

- **Arrive in Waiting Room 5-7 Minutes Early:** Never join exactly on the minute.
- **Check Name Display:** Ensure your display name is your official full name (e.g., *"Rahul Sharma"* instead of *"rahul_cool"* or a device name like *"iPhone 13"*).
- **Audio Check:** Join with mic muted. Unmute the second your video connects, smile at the camera, and say:
  *"Good morning Sir, can you hear and see me clearly?"*
  This confirms tech works smoothly and establishes clear communication right away.`,
            keyTakeaways: [
              'Verify display name is professional and matches your resume.',
              'Confirm audio clarity immediately with a brief opening confirmation.',
              'Keep mic unmuted once conversation starts unless there is heavy background noise.'
            ]
          }
        ],
        examples: [
          {
            id: 'm2-ex1',
            scenario: 'You walk into the interview room at 11:15 AM and see two interviewers (one male, one female).',
            badExample: {
              text: 'Walks in without knocking, pulls out the chair immediately with a loud scraping sound, sits down, drops heavy backpack onto the desk, and stares at the interviewer waiting for them to speak.',
              analysis: 'Disregards basic courtesy. Sitting uninvited and placing bags on the panel desk suggests lack of professional awareness.',
              spokenAudioText: 'Walks in without knocking, sits down immediately, puts backpack on the table.'
            },
            goodExample: {
              text: 'Knocks gently twice. Waits for the head nod. Steps inside with a calm posture and says: "Good morning Ma\'am, good morning Sir. May I come in?" When they reply "Please come in and have a seat", responds "Thank you Sir" with a smile and sits upright with folder in lap.',
              analysis: 'Respectful, poised, observant of social protocol, and demonstrates immediate maturity.',
              spokenAudioText: 'Good morning Ma\'am, good morning Sir. May I come in? ... Thank you Sir, thank you Ma\'am.'
            },
            proTip: 'If your hands get sweaty from nervousness, gently dry your palms on your trousers before opening the door.'
          }
        ],
        exercise: {
          id: 'm2-ex-greeting',
          title: 'First 30 Seconds Spoken Greeting Rehearsal',
          type: 'voice_recording',
          instructions: 'Practice delivering your opening greeting out loud. Time it to 10-15 seconds. Ensure crisp pronunciation and steady pacing.',
          prompt: 'Say your opening greeting as if you just knocked and entered the placement room at 10:30 AM.',
          starterTemplate: 'Good morning Sir, good morning Ma\'am. Thank you for taking the time to meet with me today. May I take a seat?',
          evaluationRubric: [
            { criterion: 'Tone & Courtesy', idealTarget: 'Polite, clear, audible, and respectful.' },
            { criterion: 'Pacing', idealTarget: 'Delivered calmly without rushing words together.' }
          ],
          sampleAnswer: 'Good morning Sir, good morning Ma\'am. It is a pleasure to be here. Thank you for having me.'
        },
        quiz: [
          {
            id: 'm2-q1',
            question: 'When entering an interview room, when should you sit down in the candidate chair?',
            conceptKey: 'Room Etiquette',
            options: [
              {
                id: 'a',
                text: 'As quickly as possible so you do not have to keep standing.',
                isCorrect: false,
                explanation: 'Sitting without being invited can come across as presumptuous or disrespectful.'
              },
              {
                id: 'b',
                text: 'Only after the interviewer explicitly invites you to have a seat, acknowledging with a polite "Thank you".',
                isCorrect: true,
                explanation: 'Correct! Waiting for the invitation and saying "Thank you" is standard corporate decorum.'
              },
              {
                id: 'c',
                text: 'Never sit down; stand for the entire interview to show discipline.',
                isCorrect: false,
                explanation: 'Refusing an invitation to sit makes the interaction unnecessarily awkward.'
              },
              {
                id: 'd',
                text: 'Pull the chair closer to the interviewer’s face before sitting.',
                isCorrect: false,
                explanation: 'Invading the interviewer’s personal space is unprofessional.'
              }
            ]
          },
          {
            id: 'm2-q2',
            question: 'Where should you place your backpack, college files, or personal items during the interview?',
            conceptKey: 'Personal Boundaries',
            options: [
              {
                id: 'a',
                text: 'On the interviewer’s desk so they can see you have documents ready.',
                isCorrect: false,
                explanation: 'The interviewer’s table is their workspace. Placing items there clutters their space and shows poor boundaries.'
              },
              {
                id: 'b',
                text: 'Neatly on your lap or on the floor adjacent to your chair legs.',
                isCorrect: true,
                explanation: 'Correct! Keeping items on your lap or floor keeps the desk clear and professional.'
              },
              {
                id: 'c',
                text: 'Hang your bag over the back of the interviewer’s chair.',
                isCorrect: false,
                explanation: 'Never touch or use the interviewer’s chair.'
              },
              {
                id: 'd',
                text: 'Hold your bag with both hands across your chest like a shield.',
                isCorrect: false,
                explanation: 'Clutching a bag across your chest signals intense fear and defensive body language.'
              }
            ]
          },
          {
            id: 'm2-q3',
            question: 'When facing a panel consisting of both male and female interviewers, what is the courteous greeting protocol?',
            conceptKey: 'Panel Etiquette',
            options: [
              {
                id: 'a',
                text: 'Only greet the oldest-looking person in the room.',
                isCorrect: false,
                explanation: 'Every member of the panel has input on your hire decision; acknowledge everyone.'
              },
              {
                id: 'b',
                text: 'Acknowledge the female panelist first ("Good morning Ma\'am, good morning Sir"), maintaining eye contact with all.',
                isCorrect: true,
                explanation: 'Correct! Greeting female panelists first followed by the rest of the panel with inclusive eye contact demonstrates poise and polish.'
              },
              {
                id: 'c',
                text: 'Say "Hey guys, what’s up?" to break the ice.',
                isCorrect: false,
                explanation: 'Casual slang is inappropriate in formal Indian placement and hiring interviews.'
              },
              {
                id: 'd',
                text: 'Ignore the panel until they ask you the first technical question.',
                isCorrect: false,
                explanation: 'Failing to greet panelists signals a lack of basic interpersonal skills.'
              }
            ]
          },
          {
            id: 'm2-q4',
            question: 'On a virtual video interview, what is the best opening line after unmuting your microphone?',
            conceptKey: 'Virtual First Impression',
            options: [
              {
                id: 'a',
                text: '"Good morning Sir/Ma\'am, can you hear and see me clearly?"',
                isCorrect: true,
                explanation: 'Correct! It confirms audio/video clarity and opens the dialogue respectfully.'
              },
              {
                id: 'b',
                text: '"Please start fast, my laptop battery is at 10%."',
                isCorrect: false,
                explanation: 'Shows poor planning and disrespect for the interviewer’s time.'
              },
              {
                id: 'c',
                text: 'Start answering technical questions without saying hello.',
                isCorrect: false,
                explanation: 'Never skip the initial greeting; interviews are conversations, not automated exams.'
              },
              {
                id: 'd',
                text: '"Wait 2 minutes, I am connecting my Bluetooth headset."',
                isCorrect: false,
                explanation: 'Hardware checks should be finalized before joining the call.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 3: TELL ME ABOUT YOURSELF
  // =========================================================================
  {
    id: 'module-3-tell-me-about-yourself',
    order: 3,
    title: 'Answering "Tell Me About Yourself"',
    subtitle: 'The Present-Past-Future Formula for Freshers',
    description: 'Structure a compelling 60 to 90-second self-introduction without reciting your entire resume or repeating your high school percentages.',
    iconName: 'Sparkles',
    category: 'Core Answers',
    lessons: [
      {
        id: 'lesson-3',
        moduleId: 'module-3-tell-me-about-yourself',
        number: 3,
        title: 'Mastering "Tell Me About Yourself"',
        subtitle: 'The Golden Self-Introduction Framework for College Freshers',
        estimatedMinutes: 9,
        tags: ['Introduction', 'Elevator Pitch', 'Present-Past-Future', 'Fresher Narrative'],
        objective: 'Craft and deliver a 60-90 second self-introduction that highlights your current skills, top academic achievements, and future alignment with the target role.',
        sections: [
          {
            id: 'm3-s1',
            title: '1. Why Interviewers Always Ask This First',
            content: `Nine out of ten interviews begin with *"Tell me about yourself"* or *"Walk me through your resume."*

Interviewers ask this not because they haven’t read your resume, but because:
1. It breaks the ice and helps you calm your nerves.
2. It tests your spoken communication, clarity of thought, and brevity.
3. It sets the agenda for the rest of the interview. **Whatever you emphasize here is what they will ask you about next!**

If you talk passionately about your React project, their next question will be about React. If you ramble about high school sports, you waste your most valuable spotlight.`,
            keyTakeaways: [
              'This question is your opportunity to guide the conversation to your strengths.',
              'Keep your response between 60 to 90 seconds (around 120-160 words).',
              'Whatever technical projects you highlight in your intro will be asked next.'
            ]
          },
          {
            id: 'm3-s2',
            title: '2. The Present-Past-Future Framework for Freshers',
            content: `The easiest, most bulletproof formula for candidates with zero corporate experience is:

1. **PRESENT (Who you are right now & your core technical focus - 25 seconds):**
   State your name, your college degree, and your primary technical specialization or passion.
   *Example: "I am Rahul, currently in my final semester of Computer Science at XYZ Institute. Over the last two years, I have specialized in core Java, database architecture, and building full-stack web apps."*

2. **PAST (Your top 1-2 practical achievements or projects - 35 seconds):**
   Highlight a tangible project, hackathon, or certification rather than high school grades.
   *Example: "Most recently, I led a 3-member team to build a Smart Campus Bus Tracking System using Node.js and MongoDB, which won 2nd place at our annual college hackathon and reduced student commute wait times."*

3. **FUTURE (Why you are here today & how you want to contribute - 20 seconds):**
   Connect your trajectory to this specific company and role.
   *Example: "Having developed strong problem-solving habits in Java DSA, I am eager to begin my career as an Associate Software Engineer at TCS, where I can contribute to enterprise software solutions and continue expanding my engineering skillset."*`,
            keyTakeaways: [
              'Present: Current degree + core technical skills.',
              'Past: 1 standout project or milestone demonstrating problem-solving.',
              'Future: Why this company matches your career aspirations.'
            ],
            checklist: [
              'No recitation of 10th or 12th marks (it is already on paper)',
              'No long family background details unless explicitly asked',
              'Include at least one specific project title and tech stack',
              'Conclude with a clear transition: "...and that brings me here today."'
            ]
          },
          {
            id: 'm3-s3',
            title: '3. Deadly Traps to Avoid as an Indian Fresher',
            content: `Common mistakes that ruin an otherwise good introduction:

- **The "Bio-Data" Trap:** *"My father’s name is Mr. Sharma, he is a government officer, my mother is a homemaker, I have one younger brother..."* Avoid this completely unless asked about family background.
- **The "High School Marksheet" Trap:** *"In 2018 I scored 91.2% in CBSE 10th standard, then in 2020 I scored 86% in 12th..."* The interviewer cares about what you built in engineering or graduation, not board exam marks.
- **The Hobby Overload:** *"My hobbies are listening to music, playing cricket, chatting with friends, and sleeping."* Keep hobbies relevant or mention one that demonstrates focus (e.g., chess, competitive coding, tech blogging).`,
            keyTakeaways: [
              'Focus on technical competence, projects, and learning enthusiasm.',
              'Do not recite family history or school percentages unless requested.',
              'Practice delivering the response smoothly without sounding robotic or memorized.'
            ]
          }
        ],
        examples: [
          {
            id: 'm3-ex1',
            scenario: 'Interviewer says: "Hello Priya, please introduce yourself and walk me through your background."',
            badExample: {
              text: 'Hello Sir, my name is Priya. I am from Bhopal. I completed 10th from St. Xavier with 88% and 12th with 82%. My father is an accountant and mother is a homemaker. In college my CGPA is 7.8. I like reading books and surfing internet. I am hard working and looking for a good company to give me a chance.',
              analysis: 'Zero mention of programming languages, projects, technical skills, or why she wants to join this firm. Sounds generic and uninspiring.',
              spokenAudioText: 'Hello Sir, my name is Priya. I completed 10th with 88% and 12th with 82%. My father is an accountant. I like reading books and I am hardworking.'
            },
            goodExample: {
              text: 'Good morning Sir. My name is Priya Sharma, and I am in my final year of Information Technology at UIT Bhopal. Over the past four years, I have built a solid foundation in Data Structures, Object-Oriented Programming in C++, and relational databases. In my 6th semester, I developed an Hospital Appointment Portal using React and Firebase that allowed local clinics to schedule 100+ patient visits weekly. I also actively solve coding challenges on LeetCode, completing over 150 problems in binary search and trees. I am very keen to begin my engineering career with your team because of your strong engineering culture and emphasis on enterprise reliability.',
              analysis: 'Mentions degree, technical stack (C++, React, Firebase), tangible impact (100+ visits), LeetCode dedication, and role alignment in 75 seconds.',
              spokenAudioText: 'Good morning Sir. My name is Priya Sharma, and I am in my final year of IT. I have built a solid foundation in Data Structures, OOPs in C++, and relational databases. Recently I built a Hospital Portal using React and Firebase that handled 100+ bookings weekly. I am very keen to join your team to contribute to scalable products.'
            },
            proTip: 'Record your introduction on your phone voice recorder. If it takes longer than 90 seconds, trim the middle project section.'
          }
        ],
        exercise: {
          id: 'm3-ex-script',
          title: 'Present-Past-Future Script Builder',
          type: 'script_builder',
          instructions: 'Fill in the structured 3-part framework below with your own details. Practice reading it aloud until it sounds natural.',
          prompt: 'Write your 3-sentence introduction following Present, Past, and Future.',
          starterTemplate: 'Present: I am [Name], currently completing my [Degree/Branch] at [College Name], with a strong focus on [Top 2 Skills].\nPast: During my pre-final year, I built [Project Name], which used [Technologies] to solve [Problem].\nFuture: I am excited to apply my fundamentals to [Target Company/Role] because [Reason].',
          evaluationRubric: [
            { criterion: 'Structure Adherence', idealTarget: 'Clearly contains Present, Past, and Future sections.' },
            { criterion: 'Concrete Project Mention', idealTarget: 'Identifies a real project with specific tools rather than generic claims.' },
            { criterion: 'Length & Pacing', idealTarget: 'Between 100 and 150 words total.' }
          ],
          sampleAnswer: 'Present: I am Aman Verma, currently finishing my B.Tech in Electronics & Communication at SRM Institute, focusing on embedded C and IoT systems.\nPast: For my capstone project, I designed a Solar Panel Tracking sensor array using Arduino and MQTT that improved energy capture by 18%.\nFuture: I am eager to join your firmware engineering team where I can contribute to high-reliability smart devices.'
        },
        quiz: [
          {
            id: 'm3-q1',
            question: 'What is the ideal duration for answering "Tell me about yourself" as a fresher?',
            conceptKey: 'Intro Timing',
            options: [
              {
                id: 'a',
                text: '10 to 15 seconds (just name and college).',
                isCorrect: false,
                explanation: 'Too short; it leaves the interviewer hanging and fails to showcase your achievements.'
              },
              {
                id: 'b',
                text: '60 to 90 seconds.',
                isCorrect: true,
                explanation: 'Correct! 60-90 seconds is the sweet spot that provides sufficient technical depth without losing the listener’s attention.'
              },
              {
                id: 'c',
                text: '5 to 7 minutes with full family genealogy.',
                isCorrect: false,
                explanation: 'Rambling for minutes will bore the interviewer and waste valuable technical evaluation time.'
              },
              {
                id: 'd',
                text: 'As long as possible until the interviewer interrupts you.',
                isCorrect: false,
                explanation: 'Failing to self-regulate response length indicates poor communication skills.'
              }
            ]
          },
          {
            id: 'm3-q2',
            question: 'Which of the following topics SHOULD you leave out when introducing yourself as a fresher?',
            conceptKey: 'Intro Scope',
            options: [
              {
                id: 'a',
                text: 'Your 10th and 12th standard percentage and childhood school history.',
                isCorrect: true,
                explanation: 'Correct! School percentages are already on paper and irrelevant to your engineering/graduate capabilities.'
              },
              {
                id: 'b',
                text: 'Your current degree, branch, and college.',
                isCorrect: false,
                explanation: 'Your current academic standing is essential context.'
              },
              {
                id: 'c',
                text: 'The tech stack used in your capstone or 6th-semester project.',
                isCorrect: false,
                explanation: 'College projects demonstrate your practical application of theoretical concepts.'
              },
              {
                id: 'd',
                text: 'Your eagerness to contribute to the role you applied for.',
                isCorrect: false,
                explanation: 'Expressing genuine role alignment is a crucial closing hook.'
              }
            ]
          },
          {
            id: 'm3-q3',
            question: 'In the Present-Past-Future framework, what does "Past" refer to for a candidate with no prior job?',
            conceptKey: 'Framework Application',
            options: [
              {
                id: 'a',
                text: 'Childhood hobbies and sports trophies from primary school.',
                isCorrect: false,
                explanation: 'Primary school trophies do not reflect current professional skills.'
              },
              {
                id: 'b',
                text: 'Key academic projects, hackathons, internships, or technical certifications completed in college.',
                isCorrect: true,
                explanation: 'Correct! Academic projects, hackathons, and certifications represent your work history as a fresher.'
              },
              {
                id: 'c',
                text: 'Regrets about choosing the wrong engineering branch.',
                isCorrect: false,
                explanation: 'Never express negativity about your educational choices.'
              },
              {
                id: 'd',
                text: 'A list of all movies watched in the last semester.',
                isCorrect: false,
                explanation: 'Irrelevant personal details should be omitted.'
              }
            ]
          },
          {
            id: 'm3-q4',
            question: 'Why is it critical to mention your strongest project during the self-introduction?',
            conceptKey: 'Strategic Positioning',
            options: [
              {
                id: 'a',
                text: 'Because whatever technical topics you highlight will naturally become the interviewer’s next questions.',
                isCorrect: true,
                explanation: 'Correct! You are steering the interview into your comfort zone by highlighting topics you know deeply.'
              },
              {
                id: 'b',
                text: 'Because interviewers refuse to read resumes and rely only on your verbal claim.',
                isCorrect: false,
                explanation: 'Interviewers do read resumes; your intro confirms what matters most to you.'
              },
              {
                id: 'c',
                text: 'So you do not have to write code during the technical round.',
                isCorrect: false,
                explanation: 'You will still be expected to write code or explain algorithms.'
              },
              {
                id: 'd',
                text: 'To prove you worked on the project alone without your team members.',
                isCorrect: false,
                explanation: 'Claiming sole credit often damages your teamwork credibility.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 4: ANSWERING COMMON HR QUESTIONS
  // =========================================================================
  {
    id: 'module-4-common-hr-questions',
    order: 4,
    title: 'Answering Common HR Interview Questions',
    subtitle: 'Decoding "Why Us?", Relocation & 5-Year Visions',
    description: 'Master the high-stakes HR questions that test your culture fit, company loyalty, stability, and work ethic.',
    iconName: 'Users',
    category: 'Core Answers',
    lessons: [
      {
        id: 'lesson-4',
        moduleId: 'module-4-common-hr-questions',
        number: 4,
        title: 'Mastering Common HR Questions',
        subtitle: 'Navigating Behavioral & Operational HR Rounds',
        estimatedMinutes: 9,
        tags: ['HR Round', 'Why This Company', 'Career Goals', 'Relocation', 'Freshers'],
        objective: 'Confidently answer the 4 most frequent HR questions ("Why hire you?", "Why this company?", "Where do you see yourself in 5 years?", and relocation/flexibility).',
        sections: [
          {
            id: 'm4-s1',
            title: '1. What the HR Panel is Really Evaluating',
            content: `Many freshers assume the HR round is just a formality after clearing the technical round. **This is a dangerous misconception.** In campus drives, HR rounds have a 25-35% elimination rate.

The HR interviewer wants to know:
- **Stability:** Will you stay with the company for at least 18-24 months after they spend lakhs training you? Or will you jump at the first offer?
- **Trainability & Attitude:** Are you humble, coachable, and eager to learn, or do you have an ego?
- **Flexibility:** Are you willing to work in different shifts, relocate to Bangalore/Pune/Chennai/Hyderabad, and learn whatever technology the project requires?`,
            keyTakeaways: [
              'HR rounds evaluate retention, cultural fit, coachability, and operational flexibility.',
              'Never take the HR round casually or treat it as an automatic pass.',
              'Show enthusiasm for ongoing training and team needs.'
            ]
          },
          {
            id: 'm4-s2',
            title: '2. "Why Should We Hire You?" (The Value Formula)',
            content: `Do not answer this by saying you need a job or that you are a hard worker (everyone claims to be a hard worker).

Use the **Triple Threat Formula**:
1. **Core Skills:** Your foundational competence (e.g., strong in Java/Python/DSA).
2. **Learning Velocity:** How fast you pick up unfamiliar concepts (backed by an example of learning a framework in 2 weeks).
3. **Team Reliability:** That you deliver what you promise on time without drama.

*Example:* *"You should hire me because beyond my strong grasp of core computer science fundamentals, I have proven I can learn fast—such as picking up React from scratch in two weeks to complete our semester project. As a fresher, I bring high energy, disciplined work ethic, and zero rigid habits, making me adaptable to your project standards."*`,
            keyTakeaways: [
              'Pair foundational skills with demonstrable learning speed.',
              'Frame being a fresher as an asset: high energy, fresh perspective, eager to learn.',
              'Avoid generic buzzwords like "perfectionist" or "workaholic".'
            ]
          },
          {
            id: 'm4-s3',
            title: '3. Relocation, Shifts, and "Where Do You See Yourself in 5 Years?"',
            content: `These two questions determine whether you get an offer letter:

- **"Are you comfortable relocating or working in rotational shifts?"**
  - **Correct Fresher Mindset:** For Indian service and MNC recruitment, the only acceptable answer for campus candidates is an enthusiastic:
    *"Yes, absolutely. At this stage of my career, my primary goal is learning and exposure. I am completely open to relocating to any of your development centers or supporting shifts as required by client deliverables."*
  - Hesitating or demanding your hometown on day one will often result in a rejection.

- **"Where do you see yourself in 5 years?"**
  - Do NOT say *"I want to be a manager"* or *"I want to do an MS / MBA."* Saying you want to do higher studies signals you will quit soon!
  - **The Winning Answer:**
    *"In 5 years, I see myself as a seasoned technical contributor or module lead within this organization. I hope to have deepened my expertise in distributed backend systems, earned relevant cloud certifications, and taken on mentorship of junior engineers joining through campus drives."*`,
            keyTakeaways: [
              'Show 100% operational flexibility regarding location and shifts.',
              'Never mention plans for MBA, MS, or higher studies during corporate recruitment.',
              'Anchor 5-year goals to technical mastery and growing with the organization.'
            ],
            checklist: [
              'Confirm willingness to relocate without hesitation',
              'Frame 5-year goals around technical depth and team impact',
              'Avoid mentioning freelance side businesses or personal startups'
            ]
          }
        ],
        examples: [
          {
            id: 'm4-ex1',
            scenario: 'HR asks: "Where do you see yourself in 5 years?"',
            badExample: {
              text: 'Sir, actually I am planning to prepare for CAT or GATE exams after 2 years because I want to do MBA from IIM or MS from US. So after 5 years I will be in a management position in some other firm.',
              analysis: 'Signals that hiring the candidate is a waste of corporate training budget since they already plan to resign within 24 months.',
              spokenAudioText: 'Sir, actually I am planning to prepare for CAT or GATE after 2 years because I want to do MBA or MS from US.'
            },
            goodExample: {
              text: 'In 5 years, I aim to have evolved from a fresher into a dependable domain specialist and module lead within this company. My goal is to master enterprise microservice architectures, achieve AWS Solutions Architect certification, and mentor campus recruits just like I am being guided today. I want to be someone the leadership trusts with critical client deliverables.',
              analysis: 'Demonstrates loyalty, ambitious technical progression, and realistic career milestones within the same company.',
              spokenAudioText: 'In 5 years, I aim to evolve from a fresher into a dependable module specialist within this company. My goal is to master backend architectures, achieve cloud certifications, and mentor future campus recruits.'
            },
            proTip: 'Companies invest 3 to 6 months training a fresher. They want employees who plan to stay and generate value.'
          }
        ],
        exercise: {
          id: 'm4-ex-hr',
          title: 'Crafting Your "Why This Company" Pitch',
          type: 'reflection',
          instructions: 'Draft an answer to "Why do you want to join our company?" using one specific company initiative and one personal career reason.',
          prompt: 'Write your 4-5 sentence response for your dream company or campus recruiter.',
          starterTemplate: 'I want to join [Company Name] because [Specific initiative or cultural reputation]. As someone who [Personal strength or interest], I admire how your team [Specific accomplishment]. I believe your training program is the ideal environment for me to build a long-term engineering career.',
          evaluationRubric: [
            { criterion: 'Company Specificity', idealTarget: 'Refers to actual products or training programs, not just "big MNC".' },
            { criterion: 'Long-term Intent', idealTarget: 'Communicates eagerness to contribute and build a career.' }
          ],
          sampleAnswer: 'I want to join Cognizant because of your strong digital modernization footprint in healthcare and banking. Having built my final-year project around secure database access, I admire how your engineering teams architect HIPAA-compliant cloud systems. Cognizant’s structured fresher training and continuous learning academies make it the ideal place for me to transition from an academic student to a reliable professional.'
        },
        quiz: [
          {
            id: 'm4-q1',
            question: 'Why should you avoid telling an HR interviewer that you plan to write CAT/GATE or pursue an MS in two years?',
            conceptKey: 'Retention Risk',
            options: [
              {
                id: 'a',
                text: 'Because companies prefer employees who have no desire to learn.',
                isCorrect: false,
                explanation: 'Companies want continuous learners, but through work and internal certifications, not employees planning to leave.'
              },
              {
                id: 'b',
                text: 'Because it signals that you view this job as temporary, meaning their training investment will be lost when you resign.',
                isCorrect: true,
                explanation: 'Correct! Training freshers is expensive; companies prefer candidates who plan to grow within the organization.'
              },
              {
                id: 'c',
                text: 'Because HR managers are legally forbidden from hiring students with academic ambitions.',
                isCorrect: false,
                explanation: 'There is no legal rule; it is an economic and retention decision by the employer.'
              },
              {
                id: 'd',
                text: 'Because only students with low CGPA write GATE.',
                isCorrect: false,
                explanation: 'Incorrect and irrelevant.'
              }
            ]
          },
          {
            id: 'm4-q2',
            question: 'What is the most constructive response when asked if you are open to relocating or working in rotational night shifts?',
            conceptKey: 'Operational Flexibility',
            options: [
              {
                id: 'a',
                text: '"I will only work in my hometown and strictly from 9 AM to 5 PM."',
                isCorrect: false,
                explanation: 'Rigid constraints often disqualify campus placement candidates.'
              },
              {
                id: 'b',
                text: 'Affirm full flexibility, explaining that learning and career exposure are your top priorities as a fresher.',
                isCorrect: true,
                explanation: 'Correct! Openness to relocation shows dedication and eliminates deployment roadblocks for recruiters.'
              },
              {
                id: 'c',
                text: '"I will relocate only if you double my starting salary package."',
                isCorrect: false,
                explanation: 'Demanding salary increases before even receiving an offer will lead to immediate rejection.'
              },
              {
                id: 'd',
                text: '"My parents will decide after I see the offer letter."',
                isCorrect: false,
                explanation: 'Sounds indecisive and suggests you cannot commit to corporate responsibilities.'
              }
            ]
          },
          {
            id: 'm4-q3',
            question: 'When asked "Why should we hire you?", which combination of attributes is most persuasive for a fresher?',
            conceptKey: 'Value Proposition',
            options: [
              {
                id: 'a',
                text: 'Solid technical fundamentals + rapid learning speed + positive team adaptability.',
                isCorrect: true,
                explanation: 'Correct! This combination demonstrates high coachability and long-term potential.'
              },
              {
                id: 'b',
                text: 'Claiming you are the smartest student in your branch and know more than the interviewers.',
                isCorrect: false,
                explanation: 'Arrogance is an immediate red flag in any interview.'
              },
              {
                id: 'c',
                text: 'Explaining that your financial condition is urgent and you need the salary.',
                isCorrect: false,
                explanation: 'Hiring decisions are based on candidate value and skill match, not personal financial circumstances.'
              },
              {
                id: 'd',
                text: 'Saying you have no competitors because other candidates are not serious.',
                isCorrect: false,
                explanation: 'Putting down peers reflects poorly on your character and teamwork.'
              }
            ]
          },
          {
            id: 'm4-q4',
            question: 'If asked: "What will you do if your project team asks you to work on an older legacy technology like mainframe or manual testing instead of AI?", what is the smart answer?',
            conceptKey: 'Adaptability',
            options: [
              {
                id: 'a',
                text: '"I will refuse and file an HR complaint immediately."',
                isCorrect: false,
                explanation: 'Shows defiance and unwillingness to support business needs.'
              },
              {
                id: 'b',
                text: 'State that you will master the assigned project requirements first to support client delivery, while continuously upskilling in modern technologies.',
                isCorrect: true,
                explanation: 'Correct! Demonstrates organizational maturity: business priorities come first, with personal growth alongside.'
              },
              {
                id: 'c',
                text: '"I will pretend to work but spend all my time looking for another job."',
                isCorrect: false,
                explanation: 'Admitting a lack of professional integrity guarantees rejection.'
              },
              {
                id: 'd',
                text: '"I do not care about technology as long as you pay my salary."',
                isCorrect: false,
                explanation: 'Apathy and complete indifference make you seem unmotivated.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 5: STRENGTHS, WEAKNESSES, EXPERIENCE & SALARY
  // =========================================================================
  {
    id: 'module-5-strengths-weaknesses-salary',
    order: 5,
    title: 'Strengths, Weaknesses, Projects & Salary Etiquette',
    subtitle: 'The STAR Method, Safe Weaknesses & Fresher CTC',
    description: 'Learn how to answer "What are your weaknesses?" without clichés, present college projects using STAR, and handle salary questions professionally.',
    iconName: 'Target',
    category: 'Placement Mastery',
    lessons: [
      {
        id: 'lesson-5',
        moduleId: 'module-5-strengths-weaknesses-salary',
        number: 5,
        title: 'Explaining Strengths, Weaknesses & Projects',
        subtitle: 'The STAR Framework and Safe Self-Appraisal Strategies',
        estimatedMinutes: 9,
        tags: ['STAR Method', 'Weakness', 'Strengths', 'Salary', 'College Projects'],
        objective: 'Articulate your authentic strengths, safely frame real weaknesses with ongoing improvement steps, structure project stories with STAR, and navigate fresher salary expectations.',
        sections: [
          {
            id: 'm5-s1',
            title: '1. The STAR Method for Explaining College Projects',
            content: `When technical or managerial interviewers ask *"Tell me about your final-year project"* or *"Describe a time you faced a technical bug"*, never jump into random code details.

Use the **STAR Framework**:
- **S - Situation (15%):** The background context. (e.g., *"In our 7th semester, our college mess faced severe food wastage due to unpredictable dinner attendance."*)
- **T - Task (15%):** What was your specific goal? (e.g., *"My team was tasked with building an automated attendance and meal forecasting app."*)
- **A - Action (50%):** What did YOU specifically do? (e.g., *"I was responsible for backend APIs and database schema. I used Express.js with PostgreSQL, normalized the tables to 3NF, and implemented JWT authentication."*)
- **R - Result (20%):** What was the tangible impact? (e.g., *"We deployed it across 2 hostel blocks, tracking 450 students daily, reducing surplus food preparation by 22%."*)`,
            keyTakeaways: [
              'Spend 50% of your time on the "Action" step—what YOU personally designed or coded.',
              'Always quantify the "Result" with metrics, percentages, users, or performance speedups.',
              'Clearly differentiate between what the whole team did vs. your individual contribution.'
            ]
          },
          {
            id: 'm5-s2',
            title: '2. The "What is Your Greatest Weakness?" Dilemma',
            content: `This is the question freshers fear most.

**What NOT to say:**
- **Fake Strengths (Cliches):** *"I am a perfectionist"*, *"I work too hard and forget to sleep"*, or *"I am too honest."* Interviewers have heard these a thousand times and view them as evasive.
- **Fatal Disqualifiers:** *"I struggle to wake up on time"*, *"I get angry when teammates disagree with me"*, or *"I hate coding."*

**The 3-Step Winning Formula for Weaknesses:**
1. State a **genuine, non-fatal weakness** (e.g., hesitation in public speaking, difficulty saying no to extra tasks, or getting too absorbed in micro-optimizing code).
2. Explain the **negative consequence** it caused in college.
3. Detail the **active steps you are currently taking** to overcome it.

*Example:* *"Earlier in college, I was uncomfortable speaking in front of large groups. During our 3rd-year seminar, I felt anxious presenting our slides. Recognizing this limitation, I enrolled in our college Toastmasters club and volunteered to present our weekly project demos. While I still feel some initial butterflies, I can now articulate our technical ideas clearly in front of panels."*`,
            keyTakeaways: [
              'Never use fake strengths like "perfectionism".',
              'Pick a genuine, non-critical skill and show tangible self-improvement.',
              'Focus 70% of your answer on how you are actively overcoming the weakness.'
            ]
          },
          {
            id: 'm5-s3',
            title: '3. Handling Fresher Salary Expectations & Bond Agreements',
            content: `In campus placements and fresher hiring in India, entry-level compensation is typically fixed by company bands (e.g., 3.5 LPA Ninja vs 7 LPA Digital vs 9+ LPA Prime/Product).

- **When asked: "What are your salary expectations?"**
  - As a fresher, you generally have minimal leverage to bargain fixed campus bands.
  - **The Ideal Response:**
    *"As a fresher, my primary priority is joining a respected engineering organization where I can learn, build solid engineering habits, and work on real client problems. I trust your company’s standard compensation structure for campus graduates and am confident you offer fair, competitive industry packages."*
- **Service Agreements / Bonds:**
  - If asked whether you are comfortable signing an 18-month or 2-year service agreement (common in Indian service firms), confirm with:
    *"Yes, I have reviewed the placement notification and am comfortable with the service agreement duration."*`,
            keyTakeaways: [
              'Do not attempt aggressive salary haggling for fixed campus fresher bands.',
              'Emphasize that learning opportunities and team quality matter most at entry level.',
              'Be clear and upfront about company bond policies.'
            ]
          }
        ],
        examples: [
          {
            id: 'm5-ex1',
            scenario: 'Interviewer asks: "What is your biggest weakness, and how does it affect your work?"',
            badExample: {
              text: 'Sir, honestly I don\'t think I have any major weakness. Maybe I am just a perfectionist who cannot stop working until everything is 100% perfect, even if I have to skip meals.',
              analysis: 'Disingenuous and rehearsed. Fails to demonstrate self-awareness or humility.',
              spokenAudioText: 'Sir, honestly I don\'t have any weakness. Maybe I am just a perfectionist who works too hard until everything is perfect.'
            },
            goodExample: {
              text: 'In the past, I found it difficult to say no when teammates asked for help with their modules, which occasionally caused me to rush my own deliverables. In our 6th-semester project, I took on two extra UI tasks for a peer and ended up staying awake until 4 AM to finish my database schema. Since then, I have learned to manage expectations transparently. I now use a Trello board to track my bandwidth and politely let peers know when I will be available to help after finishing my current commitments.',
              analysis: 'Relatable scenario, self-aware, and shows a practical organizational remedy (Trello and proactive communication).',
              spokenAudioText: 'In the past, I found it difficult to say no when teammates asked for help, which caused me to rush my own work. I have learned to communicate my availability transparently using task boards to ensure my commitments are met first.'
            },
            proTip: 'A good weakness answer shows that you can self-reflect and adapt without waiting for a manager to point out your flaws.'
          }
        ],
        exercise: {
          id: 'm5-ex-star',
          title: 'STAR Project Breakdown Practice',
          type: 'script_builder',
          instructions: 'Structure your primary college or personal project into the 4 STAR components. Keep the Action section focused on what YOU coded.',
          prompt: 'Write out your Situation, Task, Action, and Result for one project.',
          starterTemplate: 'Situation: [1 sentence on the project background]\nTask: [1 sentence on your exact responsibility]\nAction: [2-3 sentences on technologies you coded, algorithms used, or hurdles solved]\nResult: [1 sentence with metrics, score, or user outcome]',
          evaluationRubric: [
            { criterion: 'Clear Division of Labor', idealTarget: 'Emphasizes personal contribution rather than just "we".' },
            { criterion: 'Technical Specificity', idealTarget: 'Mentions frameworks, database choices, or design patterns.' },
            { criterion: 'Quantifiable Result', idealTarget: 'Includes metrics like percentages, latency, users, or competition rank.' }
          ],
          sampleAnswer: 'Situation: College students struggled to find verified study notes and past question papers before semester exams.\nTask: My task in our 3-member team was designing the search engine and PDF storage pipeline.\nAction: I implemented elastic full-text search in Python using FastAPI and indexed 500+ document tags in MongoDB with debounce queries to reduce API hits.\nResult: Over 800 students used the portal during exam week, with an average search retrieval latency under 120ms.'
        },
        quiz: [
          {
            id: 'm5-q1',
            question: 'What does the "A" in the STAR method stand for, and why is it the most critical part?',
            conceptKey: 'STAR Method',
            options: [
              {
                id: 'a',
                text: 'Argument; proving why your idea was superior to your teammates.',
                isCorrect: false,
                explanation: 'STAR evaluates problem-solving, not interpersonal conflict.'
              },
              {
                id: 'b',
                text: 'Action; describing the specific steps, design decisions, and code YOU implemented.',
                isCorrect: true,
                explanation: 'Correct! "Action" shows your technical competence and individual contribution to solving the problem.'
              },
              {
                id: 'c',
                text: 'Apology; explaining why the project failed.',
                isCorrect: false,
                explanation: 'Incorrect.'
              },
              {
                id: 'd',
                text: 'Attendance; proving you attended all college project lab sessions.',
                isCorrect: false,
                explanation: 'Irrelevant.'
              }
            ]
          },
          {
            id: 'm5-q2',
            question: 'Why do interviewers dislike answers like "I am a perfectionist" or "I work too hard"?',
            conceptKey: 'Weakness Pitfalls',
            options: [
              {
                id: 'a',
                text: 'Because perfectionism is illegal in corporate contracts.',
                isCorrect: false,
                explanation: 'Incorrect.'
              },
              {
                id: 'b',
                text: 'Because it comes across as fake, rehearsed, and shows a lack of genuine self-awareness.',
                isCorrect: true,
                explanation: 'Correct! Interviewers value authenticity and coachability over scripted clichés.'
              },
              {
                id: 'c',
                text: 'Because companies only want employees who produce low-quality work.',
                isCorrect: false,
                explanation: 'Companies value quality, but dismiss evasive answers.'
              },
              {
                id: 'd',
                text: 'Because perfectionists are always fired immediately.',
                isCorrect: false,
                explanation: 'Nonsense.'
              }
            ]
          },
          {
            id: 'm5-q3',
            question: 'As a fresher in a campus placement drive, what is the most professional response to "What are your salary expectations?"',
            conceptKey: 'Salary Negotiation',
            options: [
              {
                id: 'a',
                text: '"I need at least 25 LPA because my friend at Google got that package."',
                isCorrect: false,
                explanation: 'Unrealistic comparisons without leverage reflect poorly on business acumen.'
              },
              {
                id: 'b',
                text: 'State that your primary priority is joining a strong engineering team to learn, and that you trust the company’s standard campus package.',
                isCorrect: true,
                explanation: 'Correct! Campus bands are predetermined; showing focus on learning and organizational trust is the ideal response.'
              },
              {
                id: 'c',
                text: '"I don\'t need any money; I will work for free forever."',
                isCorrect: false,
                explanation: 'Desperation diminishes your perceived competence.'
              },
              {
                id: 'd',
                text: '"Tell me what your budget is first before I answer."',
                isCorrect: false,
                explanation: 'Aggressive negotiation tactics are inappropriate for campus fresher hiring.'
              }
            ]
          },
          {
            id: 'm5-q4',
            question: 'If you made mistakes or failed to complete a project feature during college, how should you present it?',
            conceptKey: 'Failure Framing',
            options: [
              {
                id: 'a',
                text: 'Blame your team members and professor for lack of guidance.',
                isCorrect: false,
                explanation: 'Blaming others is one of the quickest ways to get disqualified in behavioral rounds.'
              },
              {
                id: 'b',
                text: 'Own the challenge, explain the root cause (e.g., poor initial schema design), and detail what you learned and how you would build it differently today.',
                isCorrect: true,
                explanation: 'Correct! Engineering maturity is demonstrated by learning from technical failures and conducting thoughtful post-mortems.'
              },
              {
                id: 'c',
                text: 'Lie and pretend the feature worked flawlessly.',
                isCorrect: false,
                explanation: 'Technical interviewers can easily probe and uncover fabricated claims.'
              },
              {
                id: 'd',
                text: 'Refuse to talk about the project entirely.',
                isCorrect: false,
                explanation: 'Evading project discussions suggests you did not build it yourself.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 6: COMMUNICATION, BODY LANGUAGE & NERVOUSNESS
  // =========================================================================
  {
    id: 'module-6-communication-body-language',
    order: 6,
    title: 'Communication, Body Language & Managing Nervousness',
    subtitle: 'Eye Contact, Voice Modulation & Filler Words',
    description: 'Master non-verbal communication, conquer interview anxiety with the 3-second breathing technique, and speak with steady, calm authority.',
    iconName: 'Activity',
    category: 'Presence & Delivery',
    lessons: [
      {
        id: 'lesson-6',
        moduleId: 'module-6-communication-body-language',
        number: 6,
        title: 'Communication, Body Language, and Nervousness',
        subtitle: 'Techniques to Project Confidence Even When Feeling Anxious',
        estimatedMinutes: 8,
        tags: ['Body Language', 'Nervousness', 'Speech Pacing', 'Eye Contact', 'Filler Words'],
        objective: 'Overcome interview anxiety using breathing techniques, eliminate vocal fillers ("like", "basically", "actually"), and project executive presence through body posture.',
        sections: [
          {
            id: 'm6-s1',
            title: '1. Mastering Interview Nervousness: It is Normal',
            content: `Every single candidate feels their heart racing before an interview. **Nervousness is not a sign of weakness; it is adrenaline showing that you care.**

The mistake beginners make is trying to suppress anxiety, which leads to trembling hands, rapid speech (talking at 200 words per minute), or a dry throat.

**The 3-Second Box Breathing Technique:**
Before stepping into the room or clicking "Join Meeting":
1. Inhale deeply through your nose for **3 seconds**.
2. Hold your breath gently for **3 seconds**.
3. Exhale slowly through your mouth for **3 seconds**.
4. Repeat 3 times.

This physiologically lowers your heart rate, relaxes your vocal cords, and prevents you from rushing into hasty answers.`,
            keyTakeaways: [
              'Anxiety is natural; channel adrenaline into focused energy.',
              'Use the 3-second breathing technique before starting to calm heart rate.',
              'Take a sip of room-temperature water before entering to prevent a dry throat.'
            ]
          },
          {
            id: 'm6-s2',
            title: '2. Taming Filler Words ("Um", "Basically", "Actually", "Like")',
            content: `When our brain is searching for the next technical sentence, we feel an urge to fill the silence with noise:
*"Basically Sir, actually what happened in the database was like..."*

Using 10 filler words in a two-minute answer makes you sound uncertain and disorganized.

**The Golden Antidote: The 2-Second Deliberate Pause**
- When the interviewer asks a question, **do NOT answer instantly in the first 0.5 seconds.**
- Take a deliberate 2-second breath, nod slightly, and say:
  *"That is a great question. Let me take a brief moment to structure my thoughts."*
- Silence sounds thoughtful and confident to an interviewer; filler words sound anxious. Replace your *"um"* with a pause.`,
            keyTakeaways: [
              'Replace filler sounds with silent 2-second thinking pauses.',
              'Take a moment to structure your thoughts before blurting out an answer.',
              'Interviewers respect candidates who pause thoughtfully before responding.'
            ]
          },
          {
            id: 'm6-s3',
            title: '3. Body Posture & Eye Contact in Offline and Virtual Rounds',
            content: `Your posture communicates whether you believe in yourself:

- **Upright Spine:** Sit comfortably with your back against the chair. Leaning too far back looks disinterested; hunching over the desk looks fearful.
- **Open Hand Gestures:** Keep your hands visible above the desk or gently rested on your lap. Open palms project honesty. Avoid crossing your arms, tapping pens, or cracking knuckles.
- **The Triangle Eye Contact Rule (In-Person):**
  Do not stare unblinkingly into the interviewer's eyes. Instead, cycle your gaze naturally between their left eye, right eye, and forehead every 5-7 seconds. If there is a panel, make eye contact with everyone, spending 70% of your time with the person who asked the question.
- **Webcam Framing (Virtual):**
  Ensure your head and upper chest are clearly visible. Looking directly at the camera lens creates real-world eye contact for the interviewer on the other side.`,
            keyTakeaways: [
              'Keep an upright spine and rest open palms on your lap or desk.',
              'Cycle eye contact across all panel members naturally.',
              'Position webcam at eye level so your head and shoulders are well-framed.'
            ],
            checklist: [
              'No fidgeting with pens, rings, or water bottle caps',
              'Back straight, shoulders back, chin level',
              'Smile naturally when greeting and concluding',
              'Speak at a measured 130-150 words per minute'
            ]
          }
        ],
        examples: [
          {
            id: 'm6-ex1',
            scenario: 'Interviewer asks: "Can you explain the difference between a Process and a Thread in operating systems?"',
            badExample: {
              text: 'Uh, basically, like, you know Sir, process is like a big program, and thread is like... um... actually a small process. Basically both run in CPU, you know, like when we open Chrome, like, basically...',
              analysis: 'Riddled with "basically", "like", and "um". Distracts from whatever technical knowledge the candidate actually has.',
              spokenAudioText: 'Uh, basically, you know Sir, process is like a big program, and thread is um... actually a small process. Basically both run in CPU.'
            },
            goodExample: {
              text: '(Pauses for 2 seconds, takes a breath). In Operating Systems, the fundamental distinction between a Process and a Thread lies in memory isolation and execution context. A Process is an independent executing program with its own dedicated address space and system resources—for example, opening an instance of an IDE. A Thread, on the other hand, is the smallest unit of execution within a process. Multiple threads share the parent process’s memory space and heap, making context switching between threads significantly faster.',
              analysis: 'Crisp, articulate, zero filler words, professional vocabulary, and an illustrative real-world example.',
              spokenAudioText: 'In Operating Systems, the fundamental distinction between a Process and a Thread lies in memory isolation. A Process is an independent program with its own address space. A Thread is the smallest unit of execution within that process, sharing the memory heap.'
            },
            proTip: 'Whenever you feel the urge to say "basically" or "you know", simply close your lips and take a breath.'
          }
        ],
        exercise: {
          id: 'm6-ex-filler',
          title: '60-Second Controlled Delivery Challenge',
          type: 'voice_recording',
          instructions: 'Explain any one technical concept you know (e.g., OOPs Encapsulation, SQL Primary Keys, or HTTP vs HTTPS) in 60 seconds without using "basically", "actually", or "like".',
          prompt: 'Speak for 45-60 seconds on a familiar technical concept with deliberate pauses between sentences.',
          starterTemplate: 'The concept of [Topic] is used to [Purpose]. For example, when [Real-world analogy], it ensures [Benefit]. Therefore, developers rely on this to [Conclusion].',
          evaluationRubric: [
            { criterion: 'Filler Word Elimination', idealTarget: 'Zero or fewer than 2 filler words.' },
            { criterion: 'Deliberate Pausing', idealTarget: 'Natural 1-2 second pauses between sentences.' },
            { criterion: 'Pacing', idealTarget: 'Between 120 and 150 words per minute.' }
          ],
          sampleAnswer: 'Encapsulation is one of the four foundational pillars of Object-Oriented Programming. Its core objective is bundling data variables and the methods that operate on that data into a single protective unit, known as a class. For instance, in a banking application, an account balance variable is kept private so it cannot be modified directly from outside code. Access is only granted through verified getter and setter methods. This ensures security and prevents accidental data corruption.'
        },
        quiz: [
          {
            id: 'm6-q1',
            question: 'What is the most effective way to eliminate filler words like "um", "uh", and "basically"?',
            conceptKey: 'Filler Elimination',
            options: [
              {
                id: 'a',
                text: 'Speak as fast as possible so you have no time to say filler words.',
                isCorrect: false,
                explanation: 'Speaking too fast increases panic and causes more speech blunders.'
              },
              {
                id: 'b',
                text: 'Embrace a 2-second silent pause to collect your thoughts before speaking.',
                isCorrect: true,
                explanation: 'Correct! Replacing vocal fillers with intentional silence makes you sound thoughtful and composed.'
              },
              {
                id: 'c',
                text: 'Keep coughing every time you do not know a word.',
                isCorrect: false,
                explanation: 'Coughing repeatedly appears unnatural and distracting.'
              },
              {
                id: 'd',
                text: 'Only speak in single-word answers.',
                isCorrect: false,
                explanation: 'Monosyllabic answers prevent the interviewer from assessing communication depth.'
              }
            ]
          },
          {
            id: 'm6-q2',
            question: 'How should you manage intense nervousness right before an interview begins?',
            conceptKey: 'Anxiety Management',
            options: [
              {
                id: 'a',
                text: 'Practice 3-second box breathing (inhale 3s, hold 3s, exhale 3s) to physically calm your nervous system.',
                isCorrect: true,
                explanation: 'Correct! Controlled slow breathing lowers heart rate and oxygenates the brain.'
              },
              {
                id: 'b',
                text: 'Drink 4 cups of black coffee immediately before the round.',
                isCorrect: false,
                explanation: 'Excess caffeine causes jittery hands and spikes anxiety.'
              },
              {
                id: 'c',
                text: 'Tell yourself you are definitely going to fail so you have no expectations.',
                isCorrect: false,
                explanation: 'Negative self-talk sabotages your confidence.'
              },
              {
                id: 'd',
                text: 'Run around the placement hall to burn energy.',
                isCorrect: false,
                explanation: 'You will enter the room sweaty and short of breath.'
              }
            ]
          },
          {
            id: 'm6-q3',
            question: 'What message does crossing your arms tightly across your chest convey to an interviewer?',
            conceptKey: 'Non-Verbal Signals',
            options: [
              {
                id: 'a',
                text: 'High intelligence and superior technical authority.',
                isCorrect: false,
                explanation: 'Incorrect.'
              },
              {
                id: 'b',
                text: 'Defensiveness, guardedness, or discomfort.',
                isCorrect: true,
                explanation: 'Correct! Crossed arms are a closed body language posture indicating resistance or unease.'
              },
              {
                id: 'c',
                text: 'Extreme eagerness to be hired.',
                isCorrect: false,
                explanation: 'Incorrect.'
              },
              {
                id: 'd',
                text: 'That you are ready to write code immediately.',
                isCorrect: false,
                explanation: 'Incorrect.'
              }
            ]
          },
          {
            id: 'm6-q4',
            question: 'During an in-person panel interview with three panelists, where should you direct your gaze when answering?',
            conceptKey: 'Panel Eye Contact',
            options: [
              {
                id: 'a',
                text: 'Stare solely at the person in the middle and ignore the other two.',
                isCorrect: false,
                explanation: 'Excluding panel members makes them feel ignored and disrespected.'
              },
              {
                id: 'b',
                text: 'Look at the floor or ceiling to show you are thinking deeply.',
                isCorrect: false,
                explanation: 'Looking at ceilings suggests you lack confidence.'
              },
              {
                id: 'c',
                text: 'Start with the panelist who asked the question, then alternate your gaze across all three members naturally.',
                isCorrect: true,
                explanation: 'Correct! Inclusive eye contact engages the entire panel in your response.'
              },
              {
                id: 'd',
                text: 'Look only at your resume folder.',
                isCorrect: false,
                explanation: 'Hiding behind your folder prevents rapport.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 7: HANDLING DIFFICULT QUESTIONS & CAMPUS PLACEMENTS
  // =========================================================================
  {
    id: 'module-7-difficult-questions-curveballs',
    order: 7,
    title: 'Handling Difficult Questions & Placement Curveballs',
    subtitle: 'What to Do When You Have No Idea What the Answer Is',
    description: 'Learn the graceful 3-step recovery method when stuck, how to say "I don\'t know" professionally, and how to tackle logic puzzles and guestimates.',
    iconName: 'ShieldAlert',
    category: 'Placement Mastery',
    lessons: [
      {
        id: 'lesson-7',
        moduleId: 'module-7-difficult-questions-curveballs',
        number: 7,
        title: 'Handling Difficult Questions and Campus Placement Interviews',
        subtitle: 'Poise Under Pressure & Analytical Reasoning Out Loud',
        estimatedMinutes: 9,
        tags: ['Difficult Questions', 'Unknown Answers', 'Puzzles', 'Poise', 'Campus Placement'],
        objective: 'Learn how to handle unexpected or difficult technical questions without panicking, say "I don\'t know" professionally, and reason through puzzles out loud.',
        sections: [
          {
            id: 'm7-s1',
            title: '1. The Golden Truth: You Do NOT Need to Know Everything',
            content: `In campus placement drives, technical interviewers deliberately push candidates until they reach the limit of their knowledge. **They want to see what you do when you don\'t know the answer.**

Will you:
- Panic, sweat, and freeze into silence?
- Try to bluff, guess wildly, or make up fake syntax?
- Or remain calm, analytical, and honest?

**Recruiters hire the candidate who stays calm.** In real software development, engineers encounter unfamiliar bugs every single day. Showing how you think through an unfamiliar problem is more important than memorizing syntax.`,
            keyTakeaways: [
              'Difficult questions are often tests of your temperament and composure.',
              'Never guess wildly or try to bluff an experienced senior engineer.',
              'Interviewers appreciate honest candidates who can reason analytically.'
            ]
          },
          {
            id: 'm7-s2',
            title: '2. How to Say "I Don\'t Know" Like a Professional',
            content: `Never say *"I don\'t know"* and stop there. That creates a dead end.

Instead, use the **Acknowledge -> Bridge -> Reason** framework:

1. **Acknowledge honestly:** *"I have not had the opportunity to work directly with that specific framework/algorithm yet."*
2. **Bridge to related knowledge:** *"However, based on my understanding of [Related Concept], I believe the underlying principle involves..."*
3. **Offer your thought process:** *"If I were to approach this problem, I would begin by..."*

*Example when asked about a Redis caching question you don\'t know:*
*"I haven\'t implemented Redis caching in production yet, as our college projects primarily used relational storage with PostgreSQL. However, conceptually, I understand in-memory caching stores frequently accessed key-value pairs in RAM to bypass slower disk reads. If I were designing a cache for user sessions, I would look at eviction policies like LRU. I would be eager to explore how your team configures it."*`,
            keyTakeaways: [
              'Never stop at a blunt "I don\'t know".',
              'Connect unfamiliar questions to related concepts you do understand.',
              'Demonstrate your analytical instincts and learning agility.'
            ]
          },
          {
            id: 'm7-s3',
            title: '3. Tackling Placement Puzzles, Guestimates & Logic Teasers',
            content: `In Indian placement rounds (especially product and fintech firms), you might be asked questions like:
- *"Estimate how many smartphones are sold in Pune every month."*
- *"You have 8 balls and a balance scale; one ball is heavier. How many weighings do you need?"*

**The Rules of Engagement for Puzzles:**
- **Think Out Loud:** The interviewer cannot read your mind. If you sit in silence for 4 minutes, they assume you have given up. Say: *"Let me talk through my approach out loud so you can follow my reasoning."*
- **Clarify Constraints:** Ask questions before calculating. *"Are we considering online deliveries as well as retail stores?"*
- **Break Down Numbers Logically:** Start with overall population (e.g., Pune has ~7 million people) -> estimate household size -> smartphone replacement cycle (every 2-3 years) -> arrive at a monthly estimate.
- **Accuracy is Secondary; Logic is Primary:** The panel does not care if the real answer is 80,000 and you said 100,000. They care whether your calculation steps are logical and sound.`,
            keyTakeaways: [
              'Always think out loud so the interviewer sees your structured reasoning.',
              'Ask clarifying questions before jumping into calculations.',
              'Focus on structured problem decomposition rather than finding a magical exact number.'
            ],
            checklist: [
              'Pause, smile, and take a sip of water if feeling cornered',
              'State your assumptions explicitly before doing math',
              'Listen carefully to interviewer hints; they want to help you'
            ]
          }
        ],
        examples: [
          {
            id: 'm7-ex1',
            scenario: 'Interviewer asks: "How does the garbage collector in the V8 JavaScript engine handle memory fragmentation?" (A topic you have never studied).',
            badExample: {
              text: 'Stares at the desk for 30 seconds in dead silence, then says: "Sir, this was out of syllabus in our university. Our professor did not teach V8 engine."',
              analysis: 'Blames university professors, panics in silence, and shuts down the conversation completely.',
              spokenAudioText: 'Stares in dead silence... Sir, this was out of syllabus in our college. Professor didn\'t teach this.'
            },
            goodExample: {
              text: 'I haven\'t studied the internal low-level implementation of the V8 garbage collector specifically, as my coursework focused primarily on Java\'s generational garbage collection. However, conceptually, I know that when memory is allocated and freed dynamically, free blocks become scattered. In Java, this is handled through a mark-and-compact or copying phase where surviving objects are relocated contiguously in young or old generations. I would expect V8 to utilize a similar generational approach with a scavenger cycle. I would love to learn more about how V8 optimizes that.',
              analysis: 'Honest about knowledge limits, bridges intelligently to Java concepts, deduces logical behavior, and expresses curiosity.',
              spokenAudioText: 'I haven\'t studied the internal implementation of V8 garbage collection specifically, as my coursework focused on Java. However, conceptually, fragmentation is handled through mark-and-compact cycles where surviving objects are relocated contiguously. I would expect V8 to use a similar generational approach.'
            },
            proTip: 'If an interviewer offers a hint, grab it! Say: "Thank you for that hint, building on that..." It shows coachability.'
          }
        ],
        exercise: {
          id: 'm7-ex-unknown',
          title: 'The 3-Step Unknown Question Recovery',
          type: 'script_builder',
          instructions: 'Pick a technology you have heard about but never used (e.g., Kubernetes, GraphQL, Kafka, or WebSockets). Write an answer following Acknowledge -> Bridge -> Reason.',
          prompt: 'Draft your 3-step response explaining what you do know and how you would reason through it.',
          starterTemplate: 'Acknowledge: I have not yet had the opportunity to build a production system with [Tool/Concept].\nBridge: However, from my understanding of [Related Tool/Concept you know], I know that it solves [Problem].\nReason: If I were required to implement this, my first step would be to [Approach].',
          evaluationRubric: [
            { criterion: 'Honesty Without Defeatism', idealTarget: 'Admits limits without sounding helpless.' },
            { criterion: 'Logical Bridge', idealTarget: 'Connects to a related concept they understand.' },
            { criterion: 'Constructive Next Step', idealTarget: 'Shows how they would research or tackle it.' }
          ],
          sampleAnswer: 'Acknowledge: I have not yet implemented Apache Kafka in a production project.\nBridge: However, from my coursework in Operating Systems and messaging queues, I know Kafka operates as a distributed publish-subscribe log that decouples services and handles millions of events without dropping packets.\nReason: If our team needed event-driven communication between user signups and welcome emails, I would review Kafka’s producer-consumer libraries and test partitioning logic to ensure message delivery order.'
        },
        quiz: [
          {
            id: 'm7-q1',
            question: 'When asked a technical question to which you genuinely do not know the answer, what is the best strategy?',
            conceptKey: 'Handling Unknowns',
            options: [
              {
                id: 'a',
                text: 'Make up convincing-sounding technical jargon and hope they do not verify.',
                isCorrect: false,
                explanation: 'Experienced interviewers spot bluffing instantly and it destroys your credibility.'
              },
              {
                id: 'b',
                text: 'Acknowledge that you haven’t worked with the concept yet, bridge to a related fundamental you do know, and talk through your reasoning.',
                isCorrect: true,
                explanation: 'Correct! This displays intellectual honesty, composure, and analytical instincts.'
              },
              {
                id: 'c',
                text: 'Argue that the question is irrelevant to the job role.',
                isCorrect: false,
                explanation: 'Arguing with an interviewer is an instant disqualifier.'
              },
              {
                id: 'd',
                text: 'Sit in complete silence until the interviewer gets uncomfortable and asks another question.',
                isCorrect: false,
                explanation: 'Freezing signals poor communication and lack of resilience under pressure.'
              }
            ]
          },
          {
            id: 'm7-q2',
            question: 'When an interviewer presents an estimation puzzle (e.g., "Estimate how many cups of chai are consumed in Bangalore daily"), what are they primarily evaluating?',
            conceptKey: 'Puzzle Evaluation',
            options: [
              {
                id: 'a',
                text: 'Your exact memory of municipal tea association statistics.',
                isCorrect: false,
                explanation: 'No one expects candidates to know tea consumption statistics.'
              },
              {
                id: 'b',
                text: 'Your structured problem decomposition, logical assumptions, and ability to think out loud.',
                isCorrect: true,
                explanation: 'Correct! Guestimates evaluate your mental frameworks, sanity checks, and structured problem-solving.'
              },
              {
                id: 'c',
                text: 'Whether you know how to brew chai.',
                isCorrect: false,
                explanation: 'Irrelevant.'
              },
              {
                id: 'd',
                text: 'Your typing speed on a scientific calculator.',
                isCorrect: false,
                explanation: 'Incorrect.'
              }
            ]
          },
          {
            id: 'm7-q3',
            question: 'If the interviewer points out a bug in the code you just wrote on the whiteboard or code editor, what should you do?',
            conceptKey: 'Receptiveness to Feedback',
            options: [
              {
                id: 'a',
                text: 'Defend your code aggressively and say the interviewer misunderstood your syntax.',
                isCorrect: false,
                explanation: 'Stubbornness indicates that you will be difficult to coach or collaborate with.'
              },
              {
                id: 'b',
                text: 'Thank them, calmly trace the execution with an example input, identify the edge case, and refactor the code.',
                isCorrect: true,
                explanation: 'Correct! Interviewers love candidates who accept feedback gracefully and debug collaboratively.'
              },
              {
                id: 'c',
                text: 'Erase the entire whiteboard and refuse to write any more code.',
                isCorrect: false,
                explanation: 'Giving up shows emotional fragility.'
              },
              {
                id: 'd',
                text: 'Pretend the bug was intentional as an advanced optimization.',
                isCorrect: false,
                explanation: 'Pretending mistakes are features destroys trust.'
              }
            ]
          },
          {
            id: 'm7-q4',
            question: 'Why do campus interviewers often push candidates with increasingly difficult questions until they cannot answer?',
            conceptKey: 'Interviewer Intent',
            options: [
              {
                id: 'a',
                text: 'Because they want to humiliate college students.',
                isCorrect: false,
                explanation: 'Interviewers want to find great hires, not demean candidates.'
              },
              {
                id: 'b',
                text: 'To test your emotional stability, honesty, and mental boundary when your comfort zone ends.',
                isCorrect: true,
                explanation: 'Correct! Pushing boundaries helps recruiters identify top-tier analytical ability and stress resilience.'
              },
              {
                id: 'c',
                text: 'Because they ran out of basic questions.',
                isCorrect: false,
                explanation: 'Question depth is intentional, not random.'
              },
              {
                id: 'd',
                text: 'Because campus placements have a mandatory rule to fail 90% of students.',
                isCorrect: false,
                explanation: 'Hiring drives seek talented candidates who meet capability bars.'
              }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 8: ASKING QUESTIONS & ENDING PROFESSIONALLY
  // =========================================================================
  {
    id: 'module-8-asking-questions-ending',
    order: 8,
    title: 'Smart Reverse Questions & Ending Professionally',
    subtitle: 'Leaving a Memorable Lasting Impression',
    description: 'Learn why you must never say "No questions, Sir", the top 4 smart questions freshers should ask, and how to exit with memorable polish.',
    iconName: 'CheckCircle2',
    category: 'Placement Mastery',
    lessons: [
      {
        id: 'lesson-8',
        moduleId: 'module-8-asking-questions-ending',
        number: 8,
        title: 'Asking Questions and Ending the Interview Professionally',
        subtitle: 'The Strategic Closing 5 Minutes of Any Placement Round',
        estimatedMinutes: 8,
        tags: ['Closing', 'Reverse Questions', 'Thank You Note', 'Lasting Impression'],
        objective: 'Formulate thoughtful reverse questions to ask the interviewer, deliver a memorable closing statement, and understand post-interview follow-up etiquette.',
        sections: [
          {
            id: 'm8-s1',
            title: '1. Why "No questions, Sir" is a Fatal Mistake',
            content: `At the end of virtually every interview, the interviewer will lean back and ask:
*"Do you have any questions for me?"*

The vast majority of unprepared freshers reply:
*"No Sir, everything was clear. Thank you."*

**Why this is a missed opportunity:**
1. It signals low curiosity. An engineer who asks zero questions appears disengaged.
2. It misses your final chance to demonstrate that you care about their engineering culture, team challenges, and technology stack.
3. It makes you blend into the crowd of hundreds of other applicants.

Always have at least **two thoughtful questions prepared in advance.**`,
            keyTakeaways: [
              'Never say "No questions, Sir"; it signals lack of interest and curiosity.',
              'Prepare 2-3 thoughtful questions about the team, tech stack, or training.',
              'Use this moment to leave a memorable, intelligent final impression.'
            ]
          },
          {
            id: 'm8-s2',
            title: '2. Four High-Impact Questions Freshers Can Ask',
            content: `Choose 2 of these high-impact questions based on whether you are talking to a technical lead or an HR manager:

1. **For Technical Leads:**
   *"What does the typical day-to-day workflow look like for a junior engineer on your team, and what technology stack would I be touching in my first six months?"*

2. **For Engineering Managers:**
   *"What is the biggest technical challenge your team is currently solving—whether it’s scaling, performance, or migrating to cloud services?"*

3. **For HR / Placement Panels:**
   *"How does your company support continuous learning and certifications for fresh campus graduates once we complete initial onboarding?"*

4. **The High-Impact Self-Improvement Question:**
   *"Based on our conversation today, is there any specific tool or topic you recommend I study deeply before my start date to contribute faster to the team?"*
   *(This question shows immense proactiveness and coachability!)*`,
            keyTakeaways: [
              'Ask about daily team workflows and early tech stack exposure.',
              'Inquire about continuous learning and internal mentorship programs.',
              'Asking what you should study before joining leaves a powerful impression of dedication.'
            ]
          },
          {
            id: 'm8-s3',
            title: '3. Questions to NEVER Ask, plus the Final Room Exit',
            content: `**Questions that will hurt your chances:**
- *"How many casual leaves do I get in a month?"* (Focuses on not working before starting).
- *"Did I pass this round? Can you tell me my result right now?"* (Puts the panel in an uncomfortable spot).
- *"How much bonus will I get at Diwali?"* (Greedy and premature).
- *"What does your company actually do?"* (Proves you did zero research).

**The Final Graceful Exit:**
When the interviewer signals the interview is over:
1. Smile, stand up smoothly, and gather your files.
2. Deliver your closing statement:
   *"Thank you so much for your time today, Sir/Ma'am. I really enjoyed learning more about your team\'s projects, and I am very enthusiastic about the opportunity to contribute here."*
3. If they extend a hand, shake it firmly. If not, a polite nod and *Thank you* is perfect.
4. Push your chair back gently without scraping it loudly across the floor.
5. Walk out calmly, open the door without banging, and close it softly behind you.`,
            keyTakeaways: [
              'Never ask about leaves, bonuses, or instant hiring decisions.',
              'Deliver a crisp closing statement expressing genuine enthusiasm.',
              'Tuck your chair in quietly and close the door softly as you exit.'
            ],
            checklist: [
              'Collect all documents, resumes, and pens from the desk',
              'Deliver your 15-second closing statement with eye contact',
              'Push chair back neatly without making loud floor noise',
              'Close the door gently without slamming'
            ]
          }
        ],
        examples: [
          {
            id: 'm8-ex1',
            scenario: 'Interviewer says: "Well Rahul, that covers all my questions. Do you have anything you would like to ask me?"',
            badExample: {
              text: 'Sir, do you provide free snacks in your Bangalore cafeteria? Also, what are the office timings and did I clear this technical round?',
              analysis: 'Trivial, self-centered, and pressures the interviewer for immediate evaluation results.',
              spokenAudioText: 'Sir, do you provide free snacks in your office? Also what are the timings and did I clear this interview?'
            },
            goodExample: {
              text: 'Thank you for asking, Sir. I do have one question. I saw that your team recently transitioned several legacy services to microservices on AWS. What has been the most interesting technical hurdle during that migration, and what advice would you have for a fresher joining that ecosystem to ramp up quickly?',
              analysis: 'Demonstrates company awareness, technical curiosity, respect for the interviewer’s expertise, and eagerness to learn.',
              spokenAudioText: 'Thank you for asking, Sir. I do have one question. I saw that your team recently migrated services to AWS. What has been the most interesting technical hurdle, and what advice would you give a fresher joining to ramp up quickly?'
            },
            proTip: 'Interviewers love talking about their own technical challenges. Asking a thoughtful question makes them leave the room with a great impression of you.'
          }
        ],
        exercise: {
          id: 'm8-ex-closing',
          title: 'Curate Your Personal Reverse Question Arsenal',
          type: 'reflection',
          instructions: 'Select and customize two reverse questions you will keep ready in your notebook for your upcoming interviews.',
          prompt: 'Write two questions you will ask the interviewer at the conclusion of your next round.',
          starterTemplate: 'Question 1 (Technical/Team): [Question about workflow, technology, or challenges]\nQuestion 2 (Growth/Learning): [Question about mentorship, training, or onboarding expectations]',
          evaluationRubric: [
            { criterion: 'Professional Relevance', idealTarget: 'Focuses on team, technology, or learning rather than personal perks.' },
            { criterion: 'Intellectual Curiosity', idealTarget: 'Demonstrates genuine desire to understand the working environment.' }
          ],
          sampleAnswer: 'Question 1 (Technical/Team): What are the key architectural metrics your engineering team focuses on when measuring service performance in production?\nQuestion 2 (Growth/Learning): What qualities distinguish the fresh campus graduates who become the most successful contributors on your team within their first year?'
        },
        quiz: [
          {
            id: 'm8-q1',
            question: 'When the interviewer asks "Do you have any questions for me?", what is the best response?',
            conceptKey: 'Reverse Question Strategy',
            options: [
              {
                id: 'a',
                text: '"No questions, Sir. You explained everything well."',
                isCorrect: false,
                explanation: 'A missed opportunity to show curiosity, intelligence, and engagement.'
              },
              {
                id: 'b',
                text: 'Ask 1 or 2 thoughtful questions about team engineering challenges, daily workflows, or fresher onboarding.',
                isCorrect: true,
                explanation: 'Correct! Asking thoughtful questions demonstrates genuine interest in the company and proactive initiative.'
              },
              {
                id: 'c',
                text: 'Ask 10 questions and keep the interviewer for another 45 minutes.',
                isCorrect: false,
                explanation: 'Be respectful of the interviewer’s tight placement schedule; 1-2 questions is ideal.'
              },
              {
                id: 'd',
                text: 'Ask how much salary the interviewer earns.',
                isCorrect: false,
                explanation: 'Inappropriate and intrusive.'
              }
            ]
          },
          {
            id: 'm8-q2',
            question: 'Which of the following questions is INAPPROPRIATE to ask at the end of a first-round interview?',
            conceptKey: 'Question Etiquette',
            options: [
              {
                id: 'a',
                text: '"Did I pass this interview, and are you going to give me the offer letter?"',
                isCorrect: true,
                explanation: 'Correct! Demanding instant results puts panelists in an awkward position and appears impatient.'
              },
              {
                id: 'b',
                text: '"What technology stack would a junior developer work with in their first few months?"',
                isCorrect: false,
                explanation: 'This is a fantastic technical question.'
              },
              {
                id: 'c',
                text: '"What is the most rewarding technical challenge your engineering team has solved recently?"',
                isCorrect: false,
                explanation: 'This allows the interviewer to speak proudly about their team’s achievements.'
              },
              {
                id: 'd',
                text: '"Is there any specific topic you recommend I study before my joining date?"',
                isCorrect: false,
                explanation: 'This highlights proactive dedication.'
              }
            ]
          },
          {
            id: 'm8-q3',
            question: 'What is the correct physical protocol when leaving the interview room?',
            conceptKey: 'Exit Protocol',
            options: [
              {
                id: 'a',
                text: 'Sprint out of the room as fast as possible to catch your college bus.',
                isCorrect: false,
                explanation: 'Rushing looks disorganized and panicky.'
              },
              {
                id: 'b',
                text: 'Thank the panel, deliver a polite closing statement, push your chair in gently, and close the door softly.',
                isCorrect: true,
                explanation: 'Correct! Graceful, courteous exits ensure you leave a polished final impression.'
              },
              {
                id: 'c',
                text: 'Leave all your printed resumes and empty water bottles on the interviewer’s table.',
                isCorrect: false,
                explanation: 'Leaving litter behind reflects poorly on your personal habits.'
              },
              {
                id: 'd',
                text: 'Slam the door shut to ensure it latches firmly.',
                isCorrect: false,
                explanation: 'Slamming doors is rude and startling.'
              }
            ]
          },
          {
            id: 'm8-q4',
            question: 'Why is asking "What can I study or prepare before my joining date?" so effective?',
            conceptKey: 'Lasting Impression',
            options: [
              {
                id: 'a',
                text: 'It proves you know nothing and need help.',
                isCorrect: false,
                explanation: 'Incorrect.'
              },
              {
                id: 'b',
                text: 'It signals extraordinary proactiveness, humility, and a desire to deliver value immediately upon joining.',
                isCorrect: true,
                explanation: 'Correct! Managers love hiring candidates who are already thinking about how to contribute to the team.'
              },
              {
                id: 'c',
                text: 'It obligates the interviewer to hire you legally.',
                isCorrect: false,
                explanation: 'No question legally obligates a hire.'
              },
              {
                id: 'd',
                text: 'It guarantees you get a free laptop on day one.',
                isCorrect: false,
                explanation: 'Incorrect.'
              }
            ]
          }
        ]
      }
    ]
  }
];

/**
 * Helper to retrieve a module by ID
 */
export function getAcademyModuleById(moduleId: string): AcademyModule | undefined {
  return ACADEMY_MODULES.find(m => m.id === moduleId);
}

/**
 * Helper to retrieve a lesson by ID across all modules
 */
export function getAcademyLessonById(lessonId: string) {
  for (const module of ACADEMY_MODULES) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) {
      return { lesson, module };
    }
  }
  return undefined;
}

/**
 * Total count of lessons across the Academy
 */
export const TOTAL_ACADEMY_LESSONS = ACADEMY_MODULES.reduce(
  (count, m) => count + m.lessons.length, 
  0
);
