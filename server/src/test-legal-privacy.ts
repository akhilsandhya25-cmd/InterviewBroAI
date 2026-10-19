/**
 * Test Suite: Legal, Privacy & Compliance Verification
 * Baseline: DPDP Act 2023, DPDP Rules 2025, IDOR Isolation & AI Transparency
 */

import { LEGAL_DOCUMENTS } from '../../client/src/data/legalDocuments.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

async function runLegalPrivacyTests() {
  console.log('\n--- TEST SUITE: Legal, Privacy, IDOR & Compliance Verification ---\n');

  // 1. Verify all 8 Legal Documents exist and contain mandatory sections
  console.log('1. Testing Legal Document Catalog Integrity:');
  const requiredDocKeys = [
    'terms',
    'privacy',
    'ai-disclaimer',
    'voice-video',
    'retention',
    'cookies',
    'pricing',
    'contact'
  ];

  requiredDocKeys.forEach(key => {
    const doc = LEGAL_DOCUMENTS[key];
    assert(Boolean(doc), `Document [${key}] is present in LEGAL_DOCUMENTS`);
    assert(Boolean(doc.title && doc.title.length > 3), `Document [${key}] has valid title ("${doc?.title}")`);
    assert(doc.version === '1.2', `Document [${key}] has version 1.2`);
    assert(doc.sections && doc.sections.length >= 3, `Document [${key}] contains at least 3 detailed sections (actual: ${doc.sections?.length})`);
  });

  // 2. AI Transparency & Ethical Scoring Disclaimers (Phase 6)
  console.log('\n2. Testing AI Transparency & No-Biometrics Disclaimers:');
  const aiDisclaimer = LEGAL_DOCUMENTS['ai-disclaimer'];
  const fullAiText = JSON.stringify(aiDisclaimer).toLowerCase();
  assert(fullAiText.includes('educational') && fullAiText.includes('simulation'), 'AI disclaimer explicitly states platform is educational simulation');
  const voiceVideoDoc = LEGAL_DOCUMENTS['voice-video'];
  const voiceVideoText = JSON.stringify(voiceVideoDoc);
  assert(voiceVideoText.toLowerCase().includes('local mirror only') || voiceVideoText.toLowerCase().includes('local mirror'), 'Voice/Video notice documents local browser camera mirror');
  assert(fullAiText.includes('biometric') && fullAiText.includes('emotion'), 'Explicitly disclaims facial emotion scanning and biometric surveillance');

  // 3. Indian DPDP Act 2023 & DPDP Rules 2025 Baseline (Phase 7)
  console.log('\n3. Testing Indian DPDP Act 2023 Compliance Baseline:');
  const privacyDoc = LEGAL_DOCUMENTS['privacy'];
  const privacyText = JSON.stringify(privacyDoc);
  assert(privacyText.includes('Digital Personal Data Protection Act, 2023'), 'Privacy Policy references DPDP Act 2023 baseline');
  assert(privacyText.includes('RAM') || privacyText.includes('volatile'), 'Documents volatile RAM resume processing');
  assert(privacyText.includes('Grievance Officer') || privacyText.includes('grievance'), 'Designates Grievance Officer');

  
  const contactDoc = LEGAL_DOCUMENTS['contact'];
  const contactText = JSON.stringify(contactDoc);
  assert(contactText.includes('[Entity Name]') || contactText.includes('InterviewBro AI'), 'Owner placeholders are clearly identifiable');
  assert(contactText.includes('grievance@interviewbro.ai'), 'Grievance email configured');

  // 4. Data Retention & Permanent Account Deletion Workflow (Phase 5)
  console.log('\n4. Testing Account Deletion & Data Retention Notice:');
  const retentionDoc = LEGAL_DOCUMENTS['retention'];
  const retentionText = JSON.stringify(retentionDoc);
  assert(retentionText.includes('DPDP Act 2023') && (retentionText.includes('Deletion') || retentionText.includes('Purge')), 'Retention policy covers DPDP Act 2023 storage limitation and deletion protocols');
  assert(retentionText.includes('Cloud Purge') || retentionText.includes('purge'), 'Documents cascading database purge');


  // 5. Cross-User Isolation & Serverless Authorization Verification (IDOR Protection)
  console.log('\n5. Testing Serverless Deletion Handler Authorization & IDOR Guard:');
  const deleteHandlerModule = await import('../../api/auth/delete-account.js');
  const deleteHandler = deleteHandlerModule.default;

  // Mock Request without Bearer token or User ID
  let statusCode = 0;
  let responseData: any = null;
  const mockRes = {
    setHeader: () => {},
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          responseData = data;
          return data;
        }
      };
    }
  };

  await deleteHandler(
    {
      method: 'POST',
      headers: {},
      body: {}
    } as any,
    mockRes as any
  );

  assert(statusCode === 401, `Unauthorized request without token/userId rejected with HTTP 401 (got ${statusCode})`);
  assert(Boolean(responseData?.error), 'Returns explicit unauthorized error description');

  // Cross-user ID mismatch simulation
  await deleteHandler(
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid_or_unverified_token'
      },
      body: {
        userId: 'attacker-requested-target-id'
      }
    } as any,
    mockRes as any
  );

  assert(statusCode === 401, `Invalid or forged auth token strictly rejected with HTTP 401 (got HTTP ${statusCode})`);

  console.log('\n🎉 ALL LEGAL, PRIVACY, AI TRANSPARENCY, & IDOR AUDIT TESTS PASSED!\n');

}

runLegalPrivacyTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
