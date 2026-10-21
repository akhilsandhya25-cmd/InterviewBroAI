import { COMPANY_TRACKS, getCompanyTrack } from './data/companyTracks';
// @ts-ignore
import { geminiService } from '../../api/gemini.js';

console.log('--- TEST SUITE: Company Interview Tracks & Pipeline Verification ---\n');

const EXPECTED_COMPANIES = [
  'tcs',
  'infosys',
  'wipro',
  'accenture',
  'swiggy',
  'zomato',
  'flipkart',
  'amazon',
  'google',
  'microsoft'
];

let passed = 0;
let total = 0;

function assert(condition: boolean, msg: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ Passed: ${msg}`);
  } else {
    console.error(`❌ Failed: ${msg}`);
    process.exit(1);
  }
}

// 1. Verify all 10 companies exist in catalog
console.log('1. Testing Catalog Completeness (10 Required Companies):');
for (const companyId of EXPECTED_COMPANIES) {
  const track = COMPANY_TRACKS[companyId];
  assert(Boolean(track), `Company [${companyId}] exists in COMPANY_TRACKS`);
  assert(track?.status === 'General patterns, to be verified against real candidate experiences', `Company [${companyId}] has explicit "General patterns, to be verified against real candidate experiences" status`);
  assert(Boolean(track?.todoReviewNote?.startsWith('TODO:')), `Company [${companyId}] contains TODO review note for candidate experience calibration`);
  assert(Array.isArray(track?.typicalRoundStructure) && track.typicalRoundStructure.length >= 3, `Company [${companyId}] defines typical round structure with at least 3 stages (has ${track?.typicalRoundStructure?.length})`);
  assert(Array.isArray(track?.commonTopicAreas) && track.commonTopicAreas.length >= 3, `Company [${companyId}] defines common topic areas with at least 3 areas (has ${track?.commonTopicAreas?.length})`);
  assert(typeof track?.difficultyEmphasis === 'string' && track.difficultyEmphasis.length > 20, `Company [${companyId}] has comprehensive difficulty emphasis description`);
  assert(typeof track?.interviewStyle === 'string' && track.interviewStyle.length > 20, `Company [${companyId}] has detailed interview style description`);
  assert(Array.isArray(track?.exampleQuestionThemes) && track.exampleQuestionThemes.length >= 4, `Company [${companyId}] defines at least 4 example question themes (has ${track?.exampleQuestionThemes?.length})`);
}

// 2. Testing Fuzzy Matching and Lookup via getCompanyTrack
console.log('\n2. Testing getCompanyTrack Normalization & Fuzzy Search:');
const tcsTrack = getCompanyTrack('TCS Digital');
assert(tcsTrack?.id === 'tcs', `getCompanyTrack('TCS Digital') resolves to TCS`);

const amzTrack = getCompanyTrack('Amazon India SDE');
assert(amzTrack?.id === 'amazon', `getCompanyTrack('Amazon India SDE') resolves to Amazon`);

const googTrack = getCompanyTrack('goog');
assert(googTrack?.id === 'google', `getCompanyTrack('goog') resolves to Google`);

const msftTrack = getCompanyTrack('msft');
assert(msftTrack?.id === 'microsoft', `getCompanyTrack('msft') resolves to Microsoft`);

const accTrack = getCompanyTrack('Accenture ASE');
assert(accTrack?.id === 'accenture', `getCompanyTrack('Accenture ASE') resolves to Accenture`);

const zomatoTrack = getCompanyTrack('Zomato');
assert(zomatoTrack?.id === 'zomato', `getCompanyTrack('Zomato') resolves to Zomato`);

const unknownTrack = getCompanyTrack('NonExistentInc');
assert(unknownTrack === null, `getCompanyTrack('NonExistentInc') returns null gracefully`);

console.log(`\n🎉 ALL ${passed}/${total} COMPANY TRACK CHECKS PASSED!\n`);
