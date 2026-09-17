import { FamilyMember } from '../models/FamilyMember.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';
import { formatAbhaId } from './authController.js';

export async function getFamilyMembers(req, res) {
  try {
    const userId = req.user.id;
    let members = [];

    if (isDbConnected()) {
      members = await FamilyMember.find({ userId }).sort({ createdAt: 1 });
    } else {
      for (const [, member] of memoryDb.familyMembers) {
        if (member.userId === userId) {
          members.push(member);
        }
      }
    }

    res.json({ familyMembers: members });
  } catch (err) {
    console.error('[GetFamilyMembers Error]', err);
    res.status(500).json({ error: 'Failed to retrieve family members.' });
  }
}

export async function addFamilyMember(req, res) {
  try {
    const userId = req.user.id;
    const { 
      name, 
      relation = 'Other', 
      age, 
      dob, 
      gender = 'Other', 
      bloodGroup = 'Unknown',
      medicalHistory = [],
      abhaId
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Member name is required.' });
    }

    const finalAbhaId = formatAbhaId(abhaId);
    let newMember;

    if (isDbConnected()) {
      newMember = await FamilyMember.create({
        name,
        relation,
        age: age ? Number(age) : undefined,
        dob,
        gender,
        bloodGroup,
        userId,
        abhaId: finalAbhaId,
        medicalHistory,
        vitals: {
          bp: { sys: 0, dia: 0 },
          heartRate: 0,
          spo2: 0,
          recordedAt: null,
        }
      });
    } else {
      const memId = generateMemoryId();
      newMember = {
        _id: memId,
        id: memId,
        name,
        relation,
        age: age ? Number(age) : null,
        dob: dob || null,
        gender,
        bloodGroup,
        userId,
        abhaId: finalAbhaId,
        medicalHistory,
        vitals: {
          bp: { sys: 0, dia: 0 },
          heartRate: 0,
          spo2: 0,
          recordedAt: null,
        },
        createdAt: new Date(),
      };
      memoryDb.familyMembers.set(memId, newMember);
    }

    res.status(201).json({
      message: 'Family member registered successfully',
      member: newMember,
    });
  } catch (err) {
    console.error('[AddFamilyMember Error]', err);
    res.status(500).json({ error: 'Failed to add family member.' });
  }
}

export async function updateVitals(req, res) {
  try {
    const { id } = req.params;
    const { sys = 0, dia = 0, heartRate = 0, spo2 = 0 } = req.body;

    const recordedAt = new Date();
    const updatedVitals = {
      bp: {
        sys: Number(sys),
        dia: Number(dia),
      },
      heartRate: Number(heartRate),
      spo2: Number(spo2),
      recordedAt,
    };

    // Hypertensive crisis check (>140 mmHg systolic)
    const isHypertensiveAlert = Number(sys) > 140;

    let member;

    if (isDbConnected()) {
      member = await FamilyMember.findByIdAndUpdate(
        id,
        { vitals: updatedVitals },
        { new: true }
      );
    } else {
      member = memoryDb.familyMembers.get(id);
      if (member) {
        member.vitals = updatedVitals;
        memoryDb.familyMembers.set(id, member);
      }
    }

    if (!member) {
      return res.status(404).json({ error: 'Family member not found.' });
    }

    res.json({
      message: 'Vitals updated successfully',
      member,
      isHypertensiveAlert,
    });
  } catch (err) {
    console.error('[UpdateVitals Error]', err);
    res.status(500).json({ error: 'Failed to record vitals.' });
  }
}
