import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Testing Custom Symptom AI Triage & Ayurvedic Schedule...\n');

  // Test 1: Moderate symptom (Throat pain, mild fever, body ache)
  console.log('1️⃣ Testing Moderate Symptom Custom Write-in...');
  const resMod = await fetch(`${API_BASE}/triage/custom-symptom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptomText: 'घसा खूप खवखवतोय आणि हलका ताप व कणकण आहे',
      language: 'mr',
      familyMemberId: 'mem_aai_test_custom',
      patientDetails: {
        name: 'राधाबाई पाटील (Aai)',
        age: 63,
        bloodGroup: 'O+',
        abhaId: '14-2026-9812-4456'
      }
    })
  });

  if (!resMod.ok) {
    throw new Error(`Moderate custom triage failed with status ${resMod.status}`);
  }

  const dataMod = await resMod.json();
  console.log('✅ Moderate Custom Triage Success:');
  console.log(`   - Risk Level: ${dataMod.prescription.riskLevel}`);
  console.log(`   - Medicines Count: ${dataMod.prescription.medicines?.length || 0}`);
  console.log(`   - Home Remedies: ${dataMod.prescription.homeRemedies?.length || 0}`);
  console.log(`   - Ayurvedic Remedies: ${dataMod.prescription.ayurvedicRemedies?.length || 0}`);
  console.log(`   - Sample Ayurvedic: ${dataMod.prescription.ayurvedicRemedies?.[0] || 'N/A'}`);

  if (dataMod.prescription.medicines?.length === 0) {
    throw new Error('Expected 2-day OTC medicines for moderate case');
  }

  // Test 2: Test PDF download for this prescription
  console.log('\n2️⃣ Testing PDF Generation with Ayurvedic Remedies...');
  const rxId = dataMod.prescription._id || dataMod.prescription.id;
  const pdfRes = await fetch(`${API_BASE}/prescriptions/${rxId}/pdf`);
  if (!pdfRes.ok) {
    throw new Error(`PDF generation failed with status ${pdfRes.status}`);
  }
  const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
  console.log(`✅ PDF Generated: ${pdfBuffer.length} bytes`);

  // Test 3: Critical emergency symptom (Snake bite / Chest pain)
  console.log('\n3️⃣ Testing Critical Emergency Custom Write-in (Snake Bite)...');
  const resCrit = await fetch(`${API_BASE}/triage/custom-symptom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptomText: 'शेतात काम करताना पायाला विषारी साप चावला आहे, चक्कर येऊन बेशुद्ध पडत आहे',
      language: 'mr',
      familyMemberId: 'mem_baba_test_custom',
      patientDetails: {
        name: 'शंकर पाटील (Baba)',
        age: 68,
        bloodGroup: 'B+',
        abhaId: '14-2026-9812-9901'
      }
    })
  });

  if (!resCrit.ok) {
    throw new Error(`Critical triage failed with status ${resCrit.status}`);
  }

  const dataCrit = await resCrit.json();
  console.log('✅ Critical Emergency Custom Triage Success:');
  console.log(`   - Risk Level: ${dataCrit.prescription.riskLevel}`);
  console.log(`   - Medicines Count (Must be 0): ${dataCrit.prescription.medicines?.length || 0}`);
  console.log(`   - Emergency Advice: ${dataCrit.prescription.homeRemedies?.[0] || 'N/A'}`);

  if (dataCrit.prescription.riskLevel !== 'CRITICAL') {
    throw new Error(`Expected CRITICAL risk level for snake bite, got: ${dataCrit.prescription.riskLevel}`);
  }
  if (dataCrit.prescription.medicines?.length > 0) {
    throw new Error('Critical cases MUST NOT suggest OTC medicines!');
  }

  console.log('\n🎉 ALL CUSTOM SYMPTOM TRIAGE TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
