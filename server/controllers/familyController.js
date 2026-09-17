import { FamilyMember } from '../models/FamilyMember.js';
import { User } from '../models/User.js';
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
      phone,
      emergencyContact,
      abhaId
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Member name is required.' });
    }

    // Determine family member ArogyaRakshak series ID: AR-2026-XXXXX-01, AR-2026-XXXXX-02, etc.
    let memberCount = 1;
    let parentArogyaId = 'AR-2026-00001';
    if (isDbConnected()) {
      const parentUser = await User.findById(userId).lean();
      if (parentUser?.arogyaId) parentArogyaId = parentUser.arogyaId;
      memberCount = (await FamilyMember.countDocuments({ userId })) + 1;
    } else {
      const parentUser = memoryDb.users?.get(userId);
      if (parentUser?.arogyaId) parentArogyaId = parentUser.arogyaId;
      let count = 0;
      for (const [, m] of memoryDb.familyMembers) {
        if (String(m.userId) === String(userId)) count++;
      }
      memberCount = count + 1;
    }

    const assignedArogyaId = `${parentArogyaId}-${String(memberCount).padStart(2, '0')}`;
    const finalAbhaId = assignedArogyaId;
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
        arogyaId: assignedArogyaId,
        abhaId: finalAbhaId,
        phone: phone || undefined,
        emergencyContact: emergencyContact || undefined,
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
        arogyaId: assignedArogyaId,
        abhaId: finalAbhaId,
        phone: phone || null,
        emergencyContact: emergencyContact || null,
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

export async function updateFamilyMember(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      name,
      relation,
      age,
      gender,
      bloodGroup,
      phone,
      emergencyContact,
      medicalHistory
    } = req.body;

    let member;
    if (isDbConnected()) {
      member = await FamilyMember.findOne({ _id: id, userId });
      if (!member) {
        return res.status(404).json({ error: 'Family member not found.' });
      }
      if (name) member.name = name.trim();
      if (relation) member.relation = relation;
      if (age !== undefined && age !== '') member.age = Number(age);
      if (gender) member.gender = gender;
      if (bloodGroup) member.bloodGroup = bloodGroup;
      if (phone !== undefined) member.phone = phone.trim();
      if (emergencyContact !== undefined) member.emergencyContact = emergencyContact;
      if (medicalHistory) member.medicalHistory = Array.isArray(medicalHistory) ? medicalHistory : [medicalHistory];

      await member.save();
    } else {
      member = memoryDb.familyMembers.get(id);
      if (!member || String(member.userId) !== String(userId)) {
        return res.status(404).json({ error: 'Family member not found.' });
      }
      if (name) member.name = name.trim();
      if (relation) member.relation = relation;
      if (age !== undefined && age !== '') member.age = Number(age);
      if (gender) member.gender = gender;
      if (bloodGroup) member.bloodGroup = bloodGroup;
      if (phone !== undefined) member.phone = phone.trim();
      if (emergencyContact !== undefined) member.emergencyContact = emergencyContact;
      if (medicalHistory) member.medicalHistory = Array.isArray(medicalHistory) ? medicalHistory : [medicalHistory];

      memoryDb.familyMembers.set(id, member);
    }

    res.json({
      message: 'Family member updated successfully',
      member
    });
  } catch (err) {
    console.error('[UpdateFamilyMember Error]', err);
    res.status(500).json({ error: 'Failed to update family member.' });
  }
}

export async function deleteFamilyMember(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isDbConnected()) {
      const deleted = await FamilyMember.findOneAndDelete({ _id: id, userId });
      if (!deleted) {
        return res.status(404).json({ error: 'Family member not found or unauthorized.' });
      }
    } else {
      const member = memoryDb.familyMembers.get(id);
      if (!member || String(member.userId) !== String(userId)) {
        return res.status(404).json({ error: 'Family member not found or unauthorized.' });
      }
      memoryDb.familyMembers.delete(id);
    }

    res.json({
      success: true,
      message: 'Family member deleted successfully',
      id
    });
  } catch (err) {
    console.error('[DeleteFamilyMember Error]', err);
    res.status(500).json({ error: 'Failed to delete family member.' });
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
