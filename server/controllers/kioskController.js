import { Patient } from '../models/Patient.js';
import { Prescription } from '../models/Prescription.js';
import { isDbConnected } from '../config/db.js';
import { memoryDb, generateMemoryId } from '../services/inMemoryStore.js';

// Sequential Walk-in Patient ID generator
async function generatePatientArogyaId() {
  const prefix = 'AR-2026-PAT-';
  if (isDbConnected()) {
    try {
      const count = await Patient.countDocuments();
      return `${prefix}${String(count + 1).padStart(3, '0')}`;
    } catch (e) {
      return `${prefix}001`;
    }
  } else {
    const count = memoryDb.patients ? memoryDb.patients.size : 0;
    return `${prefix}${String(count + 1).padStart(3, '0')}`;
  }
}

/**
 * Register a new walk-in patient at Gram Panchayat Kiosk
 * POST /api/kiosk/patients
 */
export async function registerWalkInPatient(req, res) {
  try {
    const {
      name,
      age,
      gender = 'Male',
      bloodGroup = 'Unknown',
      phone = '',
      village = 'Gram Panchayat Center',
      abhaId = '',
      complaint = '',
      vitals = {},
      kioskOperatorId = '',
      kioskOperatorName = '',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Patient name is required.' });
    }

    if (!age || Number(age) <= 0) {
      return res.status(400).json({ error: 'Valid age is required.' });
    }

    // Phone is optional, but if entered, ensure valid length
    const cleanPhone = phone ? phone.trim().replace(/\D/g, '') : '';
    if (phone && cleanPhone.length > 0 && cleanPhone.length < 10) {
      return res.status(400).json({ error: 'If providing a phone number, please enter a valid 10-digit number.' });
    }

    const assignedArogyaId = await generatePatientArogyaId();
    const finalAbhaId = abhaId && abhaId.trim() ? abhaId.trim() : assignedArogyaId;

    const patientData = {
      name: name.trim(),
      age: Number(age),
      gender: gender || 'Male',
      bloodGroup: bloodGroup || 'Unknown',
      phone: cleanPhone,
      village: village ? village.trim() : 'Gram Panchayat Center',
      abhaId: finalAbhaId,
      arogyaId: assignedArogyaId,
      registeredVia: 'kiosk',
      kioskOperatorId: kioskOperatorId || req.user?.id || '',
      kioskOperatorName: kioskOperatorName || req.user?.name || 'Kiosk Operator',
      complaint: complaint ? complaint.trim() : '',
      medicalHistory: complaint && complaint.trim() ? [complaint.trim()] : [],
      vitals: {
        bp: {
          sys: Number(vitals.bp?.sys) || Number(vitals.bpSys) || 0,
          dia: Number(vitals.bp?.dia) || Number(vitals.bpDia) || 0,
        },
        heartRate: Number(vitals.heartRate) || 0,
        spo2: Number(vitals.spo2) || 0,
        temperature: Number(vitals.temperature) || 0,
        recordedAt: (vitals.bp?.sys || vitals.heartRate || vitals.spo2) ? new Date() : null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let savedPatient;

    if (isDbConnected()) {
      savedPatient = await Patient.create(patientData);
    } else {
      const memId = generateMemoryId();
      savedPatient = {
        _id: memId,
        id: memId,
        ...patientData,
      };
      if (!memoryDb.patients) memoryDb.patients = new Map();
      memoryDb.patients.set(memId, savedPatient);
    }

    return res.status(201).json({
      success: true,
      patient: savedPatient,
      message: 'Patient registered successfully for triage.',
    });
  } catch (error) {
    console.error('[Kiosk register patient error]', error);
    return res.status(500).json({ error: 'Failed to register walk-in patient.' });
  }
}

/**
 * Get all walk-in patients registered by this kiosk
 * GET /api/kiosk/patients
 */
export async function getKioskPatients(req, res) {
  try {
    let patients = [];
    if (isDbConnected()) {
      patients = await Patient.find({ registeredVia: 'kiosk' })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      if (memoryDb.patients) {
        patients = Array.from(memoryDb.patients.values()).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    }

    return res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    console.error('[Kiosk get patients error]', error);
    return res.status(500).json({ error: 'Failed to fetch kiosk patients.' });
  }
}

/**
 * Get prescriptions for a specific patient
 * GET /api/kiosk/patients/:id/prescriptions
 */
export async function getPatientPrescriptions(req, res) {
  try {
    const { id } = req.params;
    let prescriptions = [];

    if (isDbConnected()) {
      prescriptions = await Prescription.find({
        $or: [
          { familyMemberId: id },
          { userId: id },
          { 'patientDetails.arogyaId': id },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      for (const [, rx] of memoryDb.prescriptions) {
        if (
          rx.familyMemberId === id ||
          rx.userId === id ||
          rx.patientDetails?.arogyaId === id
        ) {
          prescriptions.push(rx);
        }
      }
      prescriptions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return res.json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    console.error('[Kiosk get patient prescriptions error]', error);
    return res.status(500).json({ error: 'Failed to fetch patient prescriptions.' });
  }
}
