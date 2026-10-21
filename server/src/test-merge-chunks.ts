import { mergeTranscriptChunks } from '../../client/src/services/speech';

console.log('--- TEST: Speech Recognition Overlap Deduplication ---');

function assertEqual(actual: string, expected: string, msg: string) {
  if (actual === expected) {
    console.log(`✅ Passed: ${msg} -> "${actual}"`);
  } else {
    console.error(`❌ Failed: ${msg}\nExpected: "${expected}"\nActual:   "${actual}"`);
    process.exit(1);
  }
}

// 1. Basic joins
assertEqual(mergeTranscriptChunks('', 'Hello world'), 'Hello world', 'Empty persisted');
assertEqual(mergeTranscriptChunks('Hello world', ''), 'Hello world', 'Empty incoming');

// 2. Exact match
assertEqual(mergeTranscriptChunks('Hello world', 'Hello world'), 'Hello world', 'Identical strings');

// 3. Trailing word overlap (infamous Android Chrome restart repetition)
assertEqual(
  mergeTranscriptChunks('I worked on React', 'React and Redux for state management'),
  'I worked on React and Redux for state management',
  'Single-word overlap deduplicated'
);

assertEqual(
  mergeTranscriptChunks('I built an application with React and Redux', 'React and Redux in my final year project'),
  'I built an application with React and Redux in my final year project',
  'Multi-word overlap deduplicated'
);

// 4. Repeated phrase with punctuation
assertEqual(
  mergeTranscriptChunks('In my college project,', 'college project, we designed a microservice'),
  'In my college project, we designed a microservice',
  'Punctuation-resilient overlap'
);

// 5. Incoming starts with entire persisted text
assertEqual(
  mergeTranscriptChunks('I used MongoDB', 'I used MongoDB for indexing and aggregation'),
  'I used MongoDB for indexing and aggregation',
  'Full prefix containment'
);

console.log('\n🎉 ALL MERGE CHUNKS TESTS PASSED!');
