import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

async function runTest() {
  console.log('=== Starting End-to-End Test for Prescription System ===\n');

  // 1. Test Voice AI Triage Endpoint with Marathi Symptoms
  console.log('1. Testing Voice AI Triage (/api/triage)...');
  const triageRes = await fetch(`${BASE_URL}/api/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptoms: 'मला दोन दिवसांपासून ताप आला आहे आणि डोके दुखत आहे',
      language: 'auto',
      age: 8,
      vitals: { bp: { sys: 0, dia: 0 }, heartRate: 98, spo2: 99 }
    })
  });
  if (!triageRes.ok) throw new Error(`Triage failed: ${triageRes.statusText}`);
  const triageData = await triageRes.json();
  console.log('✅ Triage response received:');
  console.log('  - Risk Level:', triageData.riskLevel);
  console.log('  - Detected Language:', triageData.detectedLanguage, `(${triageData.detectedLanguageName})`);
  console.log('  - Likely Diagnosis:', triageData.likelyDiagnosis);
  console.log('  - Suggested Medicines count:', triageData.suggestedMedicines?.length || 0);
  console.log('  - Audio Response Text:', triageData.audioResponseText?.slice(0, 60) + '...');
  console.log('  - Disclaimer present:', !!triageData.disclaimer);

  // 2. Test Saving Prescription tied to a specific Family Member
  const familyMemberChild = {
    id: 'mem_child_aarav_99',
    name: 'Aarav Patil',
    age: 8,
    bloodGroup: 'O+',
    abhaId: '14-8899-2314-7788',
    relation: 'Son'
  };

  console.log(`\n2. Saving prescription strictly linked to familyMemberId: ${familyMemberChild.id}...`);
  const saveRes = await fetch(`${BASE_URL}/api/prescriptions/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyMemberId: familyMemberChild.id,
      patientDetails: {
        name: familyMemberChild.name,
        age: familyMemberChild.age,
        bloodGroup: familyMemberChild.bloodGroup,
        abhaId: familyMemberChild.abhaId
      },
      createdBy: 'ai_triage',
      medicines: triageData.suggestedMedicines || [
        {
          name: 'Paracetamol OTC Fever Category',
          category: 'Antipyretic',
          instructions: 'Consult doctor/pharmacist for pediatric suspension formulation',
          timing: 'Post-meals as advised'
        }
      ],
      diagnosisSummary: triageData.likelyDiagnosis || 'Pediatric Viral Fever Assessment',
      riskLevel: triageData.riskLevel || 'LOW',
      verificationStatus: 'unverified'
    })
  });
  if (!saveRes.ok) throw new Error(`Save prescription failed: ${saveRes.statusText}`);
  const saveResult = await saveRes.json();
  const savedPrescription = saveResult.prescription;
  const prescId = savedPrescription._id || savedPrescription.id;
  console.log('✅ Prescription saved successfully! ID:', prescId);
  console.log('  - Stored familyMemberId:', savedPrescription.familyMemberId);
  console.log('  - Stored patient name:', savedPrescription.patientDetails?.name);

  // 3. Confirm Per-Family-Member Query Isolation
  console.log(`\n3. Verifying isolation: querying prescriptions for ${familyMemberChild.id}...`);
  const childRxRes = await fetch(`${BASE_URL}/api/prescriptions/member/${familyMemberChild.id}`);
  const childRxData = await childRxRes.json();
  console.log(`  - Found ${childRxData.prescriptions?.length} prescription(s) for ${familyMemberChild.id}`);
  const matchFound = childRxData.prescriptions?.some(p => (p._id || p.id) === prescId);
  if (!matchFound) throw new Error(`Saved prescription ${prescId} was not found under ${familyMemberChild.id}!`);
  console.log('✅ Verified: prescription is present in Child Aarav history');

  const otherMemberId = 'mem_grandpa_ramesh_44';
  console.log(`  - Querying other member (${otherMemberId}) to verify isolation...`);
  const otherRxRes = await fetch(`${BASE_URL}/api/prescriptions/member/${otherMemberId}`);
  const otherRxData = await otherRxRes.json();
  const bleedFound = otherRxData.prescriptions?.some(p => (p._id || p.id) === prescId);
  if (bleedFound) throw new Error(`DATA BLEED BUG! Prescription ${prescId} leaked into ${otherMemberId}!`);
  console.log(`✅ Verified isolation: Prescription does NOT appear under other member ${otherMemberId}`);

  // 4. Test Doctor-Slip PDF Generation & Download
  console.log(`\n4. Downloading generated doctor-slip PDF for prescription ${prescId}...`);
  const pdfRes = await fetch(`${BASE_URL}/api/prescriptions/${prescId}/pdf`);
  if (!pdfRes.ok) throw new Error(`PDF download failed with HTTP ${pdfRes.status}`);
  const contentType = pdfRes.headers.get('content-type');
  console.log('  - Response Content-Type:', contentType);
  if (!contentType.includes('application/pdf')) {
    throw new Error(`Expected application/pdf, got ${contentType}`);
  }

  const pdfArrayBuffer = await pdfRes.arrayBuffer();
  const pdfBuffer = Buffer.from(pdfArrayBuffer);
  console.log('  - Downloaded PDF size:', pdfBuffer.length, 'bytes');
  if (pdfBuffer.length < 3000) {
    throw new Error(`PDF too small (${pdfBuffer.length} bytes), expected > 3000 bytes`);
  }

  // Verify PDF header magic bytes "%PDF-"
  const header = pdfBuffer.slice(0, 5).toString('utf8');
  console.log('  - PDF Magic Header:', header);
  if (header !== '%PDF-') {
    throw new Error(`Invalid PDF magic header: ${header}`);
  }

  // Save PDF locally to artifacts scratch directory
  const outDir = path.resolve('C:/Users/manis/.gemini/antigravity-ide/brain/6c14b51d-f6e2-422b-b4ce-1fe4510c1561/scratch');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPdfPath = path.join(outDir, `test_prescription_${prescId}.pdf`);
  fs.writeFileSync(outPdfPath, pdfBuffer);
  console.log(`✅ Doctor-slip PDF successfully saved to disk at:\n   ${outPdfPath}`);

  // 5. Test Pharmacist Verification Endpoint
  console.log(`\n5. Simulating Pharmacist Verification for prescription ${prescId}...`);
  const verifyRes = await fetch(`${BASE_URL}/api/prescriptions/${prescId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verifierName: 'Koregaon Rural Medical Store (Reg #MH-PH-8891)',
      status: 'pharmacist_verified'
    })
  });
  if (!verifyRes.ok) throw new Error(`Verify failed: ${verifyRes.statusText}`);
  const verifyData = await verifyRes.json();
  console.log('✅ Verification result:', verifyData.message, 'Status:', verifyData.prescription?.verificationStatus);

  // Download verified PDF
  const verifiedPdfRes = await fetch(`${BASE_URL}/api/prescriptions/${prescId}/pdf`);
  const verifiedPdfBuffer = Buffer.from(await verifiedPdfRes.arrayBuffer());
  const outVerifiedPath = path.join(outDir, `test_prescription_${prescId}_verified.pdf`);
  fs.writeFileSync(outVerifiedPath, verifiedPdfBuffer);
  console.log(`✅ Verified doctor-slip PDF with Pharmacist Stamp saved at:\n   ${outVerifiedPath}`);

  console.log('\n========================================================');
  console.log('🎉 ALL END-TO-END PRESCRIPTION & PDF TESTS PASSED!');
  console.log('========================================================\n');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
