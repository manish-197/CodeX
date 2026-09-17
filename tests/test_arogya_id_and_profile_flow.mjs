import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function run() {
  console.log('🧪 Starting ArogyaRakshak ID, Profile Completion & Family Member CRUD Tests...\n');

  // Step 1: Register a new citizen without demographic details
  const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
  const testPhone = `98${randomSuffix}`;
  const registerPayload = {
    name: `Test Citizen ${randomSuffix}`,
    email: `citizen${randomSuffix}@example.com`,
    phone: testPhone,
    password: 'Password123!',
    role: 'citizen'
  };

  console.log(`[1] Registering user with phone ${testPhone}...`);
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload)
  });
  assert.strictEqual(regRes.status, 201, `Expected 201 Created, got ${regRes.status}`);
  const regData = await regRes.json();

  console.log('   User Registered:', {
    id: regData.user.id,
    name: regData.user.name,
    arogyaId: regData.user.arogyaId,
    isProfileComplete: regData.user.isProfileComplete
  });

  // Verify sequential ArogyaRakshak ID format AR-2026-XXXXX
  assert.match(regData.user.arogyaId, /^AR-2026-\d{5}$/, `Invalid Arogya ID format: ${regData.user.arogyaId}`);
  assert.strictEqual(regData.user.isProfileComplete, false, 'New user profile must be incomplete initially');
  const token = regData.token;

  // Step 2: Test Profile Completion (PUT /api/auth/profile)
  console.log('\n[2] Submitting Profile Completion (Age, Gender, Blood Group, Village, District, Emergency Contact)...');
  const profilePayload = {
    age: 38,
    gender: 'Female',
    bloodGroup: 'O+',
    village: 'Koregaon Mul',
    district: 'Pune',
    pincode: '412202',
    emergencyContact: '9822001122'
  };

  const profRes = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profilePayload)
  });
  assert.strictEqual(profRes.status, 200, `Expected 200 OK for profile update, got ${profRes.status}`);
  const profData = await profRes.json();

  console.log('   Profile Updated:', {
    arogyaId: profData.user.arogyaId,
    bloodGroup: profData.user.bloodGroup,
    village: profData.user.village,
    isProfileComplete: profData.user.isProfileComplete
  });
  assert.strictEqual(profData.user.isProfileComplete, true, 'User profile should be marked complete after onboarding submission');
  assert.strictEqual(profData.user.bloodGroup, 'O+');
  assert.strictEqual(profData.user.village, 'Koregaon Mul');

  // Step 3: Verify /api/auth/me returns updated profile
  console.log('\n[3] Verifying session via GET /api/auth/me...');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(meRes.status, 200);
  const meData = await meRes.json();
  assert.strictEqual(meData.user.isProfileComplete, true);
  assert.strictEqual(meData.user.arogyaId, regData.user.arogyaId);

  // Step 4: Add Family Member (POST /api/family)
  console.log('\n[4] Adding Family Member 1 (Aai / Mother)...');
  const addFam1Res = await fetch(`${BASE_URL}/family`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Sunita Patil',
      relation: 'Mother',
      age: 62,
      gender: 'Female',
      bloodGroup: 'B+',
      medicalHistory: ['Hypertension']
    })
  });
  assert.strictEqual(addFam1Res.status, 201, `Failed to add family member: ${addFam1Res.status}`);
  const fam1Data = await addFam1Res.json();
  const fam1Member = fam1Data.member || fam1Data.familyMember;
  console.log('   Family Member 1 Added:', {
    id: fam1Member._id,
    name: fam1Member.name,
    relation: fam1Member.relation,
    arogyaId: fam1Member.arogyaId
  });

  // Verify family member series ID
  const expectedFam1Id = `${regData.user.arogyaId}-01`;
  assert.strictEqual(fam1Member.arogyaId, expectedFam1Id, `Expected ${expectedFam1Id}, got ${fam1Member.arogyaId}`);

  // Step 5: Add Family Member 2 (Mulga / Child)
  console.log('\n[5] Adding Family Member 2 (Mulga / Child)...');
  const addFam2Res = await fetch(`${BASE_URL}/family`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Omkar Patil',
      relation: 'Child',
      age: 14,
      gender: 'Male',
      bloodGroup: 'O+',
      medicalHistory: []
    })
  });
  assert.strictEqual(addFam2Res.status, 201);
  const fam2Data = await addFam2Res.json();
  const fam2Member = fam2Data.member || fam2Data.familyMember;
  console.log('   Family Member 2 Added:', {
    id: fam2Member._id,
    name: fam2Member.name,
    relation: fam2Member.relation,
    arogyaId: fam2Member.arogyaId
  });
  const expectedFam2Id = `${regData.user.arogyaId}-02`;
  assert.strictEqual(fam2Member.arogyaId, expectedFam2Id, `Expected ${expectedFam2Id}, got ${fam2Member.arogyaId}`);

  // Step 6: Update Family Member 1 (PUT /api/family/:id)
  console.log('\n[6] Updating Family Member 1 details...');
  const member1Id = fam1Member._id;
  const updateRes = await fetch(`${BASE_URL}/family/${member1Id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Sunita V. Patil',
      age: 63,
      bloodGroup: 'B+',
      medicalHistory: ['Hypertension', 'Mild Diabetes']
    })
  });
  assert.strictEqual(updateRes.status, 200, `Expected 200 for update, got ${updateRes.status}`);
  const updateData = await updateRes.json();
  const updatedMember = updateData.member || updateData.familyMember;
  console.log('   Family Member 1 Updated:', {
    name: updatedMember.name,
    age: updatedMember.age,
    medicalHistory: updatedMember.medicalHistory
  });
  assert.strictEqual(updatedMember.name, 'Sunita V. Patil');
  assert.strictEqual(updatedMember.age, 63);

  // Step 7: Delete Family Member 2 (DELETE /api/family/:id)
  console.log('\n[7] Deleting Family Member 2...');
  const member2Id = fam2Member._id;
  const delRes = await fetch(`${BASE_URL}/family/${member2Id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(delRes.status, 200, `Expected 200 for delete, got ${delRes.status}`);
  const delData = await delRes.json();
  console.log('   Delete response:', delData.message);

  // Verify only 1 member remains
  const listRes = await fetch(`${BASE_URL}/family`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.strictEqual(listRes.status, 200);
  const listData = await listRes.json();
  assert.strictEqual(listData.familyMembers.length, 1, 'Expected 1 member remaining after delete');
  assert.strictEqual(listData.familyMembers[0].name, 'Sunita V. Patil');
  console.log('   Remaining family members count:', listData.familyMembers.length);

  // Step 8: Health Card PDF Generation with ArogyaRakshak Branding
  console.log('\n[8] Testing ArogyaRakshak Digital Health Card PDF generation...');
  const cardPdfRes = await fetch(`http://localhost:5000/api/health-card/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: profData.user.name,
      arogyaId: profData.user.arogyaId,
      relation: 'Self',
      age: profData.user.age,
      gender: profData.user.gender,
      bloodGroup: profData.user.bloodGroup
    })
  });
  assert.strictEqual(cardPdfRes.status, 200, `Expected 200 for health card PDF, got ${cardPdfRes.status}`);
  const cardPdfBuffer = await cardPdfRes.arrayBuffer();
  console.log('   Health Card PDF size:', cardPdfBuffer.byteLength, 'bytes');
  assert.ok(cardPdfBuffer.byteLength > 1000, 'Health Card PDF must be a valid non-empty document');

  console.log('\n✅ ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
