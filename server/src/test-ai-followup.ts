import { 
  cleanSpokenQuestion, 
  generateIntelligentFollowUpFallback,
  geminiService 
} from './services/geminiService.js';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${msg}`);
}

console.log('--- TEST SUITE: AI Interviewer & Voice Follow-Up Intelligence ---\n');

// 1. Spoken Text Sanitization (cleanSpokenQuestion)
console.log('1. Testing cleanSpokenQuestion:');
const sampleRaw1 = '**You mentioned using Redux** for state management! 🚀 How did you handle *async* API actions?';
const cleaned1 = cleanSpokenQuestion(sampleRaw1);
assert(!cleaned1.includes('**'), 'Stripped bold asterisks');
assert(!cleaned1.includes('*'), 'Stripped italic asterisks');
assert(!cleaned1.includes('🚀'), 'Stripped emojis');
assert(cleaned1.includes('You mentioned using Redux for state management! How did you handle async API actions?'), 'Preserved spoken text');

const sampleRaw2 = '1. First point. 2. Second point. 3. Third point. 4. Fourth sentence. 5. Fifth sentence.';
const cleaned2 = cleanSpokenQuestion(sampleRaw2);
const sentenceCount2 = (cleaned2.match(/[.!?]/g) || []).length;
assert(sentenceCount2 <= 3, `Enforced max 3 sentences for spoken audio (actual: ${sentenceCount2})`);

// 2. Intelligent Technology-Aware Fallback (Redux, MongoDB, Kafka, Redis, Docker, SQL, Brief answer)
console.log('\n2. Testing generateIntelligentFollowUpFallback:');
const mockQuestion = {
  id: 'q-1',
  orderIndex: 0,
  questionText: 'Can you describe the architecture of your recent college placement web project?',
  category: 'technical'
};

// Case A: Candidate mentions Redux
const reduxAnswer = 'For our placement portal project, we built the frontend in React and used Redux for global state management across student dashboards.';
const reduxFollowUp = generateIntelligentFollowUpFallback(mockQuestion, reduxAnswer, { role: 'Frontend Engineer' });
assert(reduxFollowUp.questionText.includes('Redux'), 'Detected Redux in candidate transcribed answer');
assert(reduxFollowUp.questionText.includes('asynchronous actions'), 'Generated specific async action inquiry for Redux');
assert(!reduxFollowUp.questionText.includes('**'), 'No markdown bolding in follow-up');

// Case B: Candidate mentions MongoDB
const mongoAnswer = 'In our campus food delivery app, we chose MongoDB as our primary document database to store menus and student orders.';
const mongoFollowUp = generateIntelligentFollowUpFallback(mockQuestion, mongoAnswer, { role: 'Backend Engineer' });
assert(mongoFollowUp.questionText.includes('MongoDB'), 'Detected MongoDB in candidate transcribed answer');
assert(mongoFollowUp.questionText.includes('indexing'), 'Generated schema & indexing question for MongoDB');

// Case C: Candidate mentions Kafka
const kafkaAnswer = 'We had high volume of order events, so we integrated Apache Kafka to stream event topics to notification workers.';
const kafkaFollowUp = generateIntelligentFollowUpFallback(mockQuestion, kafkaAnswer, { role: 'SDE-1' });
assert(kafkaFollowUp.questionText.includes('Kafka'), 'Detected Kafka in candidate transcribed answer');
assert(kafkaFollowUp.questionText.includes('consumer group lag'), 'Probed Kafka message delivery guarantees');

// Case D: Candidate answer is brief (< 20 words)
const briefAnswer = 'I used an API and saved data in a database.';
const briefFollowUp = generateIntelligentFollowUpFallback(mockQuestion, briefAnswer, { role: 'Software Engineer' });
assert(briefFollowUp.followUpReason.includes('brief'), 'Identified brief answer');
assert(briefFollowUp.questionText.includes('implementation steps'), 'Prompted for concrete implementation details');

// 3. Testing geminiService.generateFollowUpQuestion (with conversationHistory)
console.log('\n3. Testing geminiService.generateFollowUpQuestion:');
async function testFollowUpWithHistory() {
  const conversationHistory = [
    {
      questionText: 'Tell me about yourself and your technical background.',
      candidateAnswer: 'I am a final year computer science student from VIT with experience in fullstack development.',
      score: 80
    },
    {
      questionText: 'How do you design database schemas for high scale?',
      candidateAnswer: 'I used Redis for caching frequent queries and PostgreSQL for relational transactions.',
      score: 85
    }
  ];

  const followUp = await geminiService.generateFollowUpQuestion(
    {
      id: 'q-2',
      orderIndex: 1,
      questionText: 'How did you handle state management and API communication in your app?',
      category: 'technical'
    },
    'We used Redux for state management and Axios for REST calls to our backend.',
    { role: 'Full Stack Engineer', companyName: 'Flipkart', experienceLevel: 'fresher' },
    ['Tell me about yourself', 'How do you design database schemas'],
    85,
    conversationHistory
  );

  assert(Boolean(followUp && followUp.questionText), 'Generated follow-up object');
  assert(followUp.isFollowUp === true, 'Flagged isFollowUp = true');
  assert(!followUp.questionText.includes('**'), 'Spoken question has no markdown bolding');
  assert(!/[\u{1F300}-\u{1F9FF}]/u.test(followUp.questionText), 'Spoken question has no emojis');
  
  const sentences = (followUp.questionText.match(/[.!?]/g) || []).length;
  assert(sentences <= 3, `Follow-up question is concise (1-3 sentences, actual: ${sentences})`);
  console.log('Generated Follow-Up Question:');
  console.log(`"${followUp.questionText}"`);
  if (followUp.followUpReason) {
    console.log(`Reason: ${followUp.followUpReason}`);
  }

  console.log('\n🎉 ALL AI INTERVIEWER & FOLLOW-UP INTELLIGENCE TESTS PASSED!');
}

testFollowUpWithHistory().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
