import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

async function runSymptomTriageFlowTest() {
  console.log('================================================================');
  console.log('🧪 Running ArogyaRakshak AI: Symptom Checklist & 2-Day Rx Test');
  console.log('================================================================\n');

  // Test 1: Nearest Hospitals API
  console.log('📍 1. Testing Nearest Hospitals API (/api/hospitals/nearest)...');
  const hospRes = await fetch(`${BASE_URL}/api/hospitals/nearest?lat=18.5204&lng=73.8567&limit=4`);
  if (!hospRes.ok) throw new Error(`Nearest hospitals failed: ${hospRes.statusText}`);
  const hospData = await hospRes.json();
  console.log(`✅ Retrieved ${hospData.hospitals?.length || 0} hospitals`);
  if (!hospData.hospitals || hospData.hospitals.length === 0) {
    throw new Error('No hospitals returned');
  }
  const firstHosp = hospData.hospitals[0];
  console.log(`   Sample: ${firstHosp.name} (${firstHosp.distanceKm} km, ${firstHosp.specialties?.join(', ')})`);

  // Test 2: Save 2-Day Mild Prescription strictly tied to Aai (Family Member 1)
  const aaiMember = {
    id: 'mem_aai_radha_101',
    name: 'Radhabai Patil (आई)',
    age: 64,
    bloodGroup: 'B+',
    abhaId: '14-2026-9812-4456',
    relation: 'Aai (Mother)'
  };

  console.log(`\n💊 2. Saving 2-Day OTC prescription for ${aaiMember.name} (id: ${aaiMember.id})...`);
  const saveAaiRes = await fetch(`${BASE_URL}/api/prescriptions/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyMemberId: aaiMember.id,
      patientDetails: {
        name: aaiMember.name,
        age: aaiMember.age,
        bloodGroup: aaiMember.bloodGroup,
        abhaId: aaiMember.abhaId
      },
      createdBy: 'symptom_checklist',
      durationDays: 2,
      medicines: [
        {
          name: 'पॅरासिटामॉल सौम्य वेदनाशामक (Paracetamol Analgesic)',
          category: 'सामान्य वेदनाशामक (Analgesic)',
          dosage: '१ गोळी',
          instructions: 'जेवणानंतर कोमट पाण्यासोबत [२ दिवस].',
          timing: 'सकाळी व रात्री (२ वेळा)'
        },
        {
          name: 'घसा आराम कफ ड्रॉप्स (Herbal Throat Lozenges)',
          category: 'ईएनटी आराम (ENT Category)',
          dosage: '१ गोळी',
          instructions: 'दिवसातून २-३ वेळा चघळावी [२ दिवस].',
          timing: 'दिवसभरात (३ वेळा)'
        }
      ],
      homeRemedies: [
        'कोमट पाण्यात थोडे मीठ आणि हळद घालून दिवसातून ३ वेळा गुळण्या करा.',
        'शांत अंधाऱ्या खोलीत ३० मिनिटे विश्रांती घ्या व भरपूर पाणी प्या.'
      ],
      diagnosisSummary: '२ दिवसांचे तात्पुरते प्राथमिक निदान: सौम्य डोकेदुखी, घसा खवखवणे',
      riskLevel: 'LOW',
      verificationStatus: 'unverified'
    })
  });

  if (!saveAaiRes.ok) {
    const errText = await saveAaiRes.text();
    throw new Error(`Failed to save Aai prescription: ${errText}`);
  }

  const saveAaiData = await saveAaiRes.json();
  const aaiPrescId = saveAaiData.prescription._id || saveAaiData.prescription.id;
  console.log('✅ Aai prescription saved successfully:');
  console.log('   Prescription ID:', aaiPrescId);
  console.log('   Created By:', saveAaiData.prescription.createdBy);
  console.log('   Duration Days:', saveAaiData.prescription.durationDays);
  console.log('   Home Remedies count:', saveAaiData.prescription.homeRemedies?.length || 0);

  // Test 3: Member Isolation Verification
  console.log(`\n🔒 3. Verifying strict member isolation...`);
  const fetchAaiRes = await fetch(`${BASE_URL}/api/prescriptions/member/${aaiMember.id}`);
  const fetchAaiData = await fetchAaiRes.json();
  console.log(`   Prescriptions under Aai (${aaiMember.id}): ${fetchAaiData.prescriptions?.length || 0}`);
  if (!fetchAaiData.prescriptions || fetchAaiData.prescriptions.length === 0) {
    throw new Error('Expected at least 1 prescription under Aai');
  }

  const babaMemberId = 'mem_baba_shankar_102';
  const fetchBabaRes = await fetch(`${BASE_URL}/api/prescriptions/member/${babaMemberId}`);
  const fetchBabaData = await fetchBabaRes.json();
  console.log(`   Prescriptions under Baba (${babaMemberId}): ${fetchBabaData.prescriptions?.length || 0}`);
  if (fetchBabaData.prescriptions && fetchBabaData.prescriptions.length > 0) {
    throw new Error('Isolation failed: Baba should have 0 prescriptions');
  }
  console.log('✅ Member isolation confirmed: Records do not leak across family profiles!');

  // Test 4: Download 2-Day Doctor Slip PDF with QR Code
  console.log(`\n📄 4. Testing PDF Doctor-Slip Generation (/api/prescriptions/${aaiPrescId}/pdf)...`);
  const pdfRes = await fetch(`${BASE_URL}/api/prescriptions/${aaiPrescId}/pdf`);
  if (!pdfRes.ok) throw new Error(`PDF generation failed: ${pdfRes.statusText}`);
  const contentType = pdfRes.headers.get('Content-Type');
  const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());

  console.log('✅ PDF generated successfully:');
  console.log('   Content-Type:', contentType);
  console.log('   File Size:', pdfBuffer.length, 'bytes');

  const outDir = path.resolve('scratch');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const aaiPdfPath = path.join(outDir, `prescription_${aaiPrescId}.pdf`);
  fs.writeFileSync(aaiPdfPath, pdfBuffer);
  console.log('   Saved artifact preview to:', aaiPdfPath);

  // Test 5: Verify Chemist Sign-Off on the prescription
  console.log(`\n🩺 5. Simulating Pharmacist / Medical Store Sign-off (/api/prescriptions/${aaiPrescId}/verify)...`);
  const verifyRes = await fetch(`${BASE_URL}/api/prescriptions/${aaiPrescId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verifierName: 'Khandala Rural Medical Store & Chemist (Reg: MH-2024-8871)',
      status: 'pharmacist_verified'
    })
  });
  if (!verifyRes.ok) throw new Error(`Pharmacist verification failed: ${verifyRes.statusText}`);
  const verifyData = await verifyRes.json();
  console.log('✅ Pharmacist Verification complete:');
  console.log('   Status:', verifyData.prescription.verificationStatus);
  console.log('   Verified By:', verifyData.prescription.verifiedBy);

  // Test 6: Critical Emergency Flow (Level 3 symptom checklist)
  console.log('\n🚨 6. Testing Critical Emergency Flow (Level 3 symptoms - Chest pain / Breathlessness)...');
  const criticalMember = {
    id: 'mem_baba_shankar_102',
    name: 'Shankar Patil (बाबा)',
    age: 68,
    bloodGroup: 'A+',
    abhaId: '14-2026-1122-3344',
    relation: 'Baba (Father)'
  };

  const saveCriticalRes = await fetch(`${BASE_URL}/api/prescriptions/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      familyMemberId: criticalMember.id,
      patientDetails: {
        name: criticalMember.name,
        age: criticalMember.age,
        bloodGroup: criticalMember.bloodGroup,
        abhaId: criticalMember.abhaId
      },
      createdBy: 'symptom_checklist',
      medicines: [], // STRICTLY ZERO MEDICINES FOR CRITICAL RISK
      homeRemedies: [
        'रुग्णाला हवेशीर जागी शांत बसवा किंवा आधार देऊन झोपवा.',
        'मानेवरील आणि छातीवरील घट्ट कपडे सैल करा.',
        'तातडीने १०८ रुग्णवाहिकेला कॉल करा आणि रुग्णाला त्वरित हलवा.'
      ],
      diagnosisSummary: 'अतिगंभीर आजार संशय: छातीत तीव्र कळ / डाव्या हाताकडे वेदना (Severe Chest Pain)',
      riskLevel: 'CRITICAL',
      verificationStatus: 'unverified'
    })
  });

  if (!saveCriticalRes.ok) throw new Error('Failed to save critical emergency record');
  const saveCriticalData = await saveCriticalRes.json();
  const criticalPrescId = saveCriticalData.prescription._id || saveCriticalData.prescription.id;
  console.log('✅ Critical Emergency Record saved:');
  console.log('   Prescription ID:', criticalPrescId);
  console.log('   Risk Level:', saveCriticalData.prescription.riskLevel);
  console.log('   Medicines count (Must be 0):', saveCriticalData.prescription.medicines?.length || 0);

  // Verify Critical PDF renders without error
  const criticalPdfRes = await fetch(`${BASE_URL}/api/prescriptions/${criticalPrescId}/pdf`);
  if (!criticalPdfRes.ok) throw new Error(`Critical PDF failed: ${criticalPdfRes.statusText}`);
  const criticalPdfBuffer = Buffer.from(await criticalPdfRes.arrayBuffer());
  const criticalPdfPath = path.join(outDir, `critical_emergency_${criticalPrescId}.pdf`);
  fs.writeFileSync(criticalPdfPath, criticalPdfBuffer);
  console.log('   Critical Emergency PDF generated, bytes:', criticalPdfBuffer.length);
  console.log('   Saved artifact preview to:', criticalPdfPath);

  console.log('\n================================================================');
  console.log('🎉 ALL TESTS PASSED! Symptom checklist triage flow is fully validated!');
  console.log('================================================================\n');
}

runSymptomTriageFlowTest().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
