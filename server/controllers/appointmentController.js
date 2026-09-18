import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import { memoryDb } from '../services/inMemoryStore.js';

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function generateTokenNo() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `EMG-${randomNum}`;
}

/**
 * Create a new emergency/doctor appointment request
 * POST /api/appointments
 */
export async function createAppointment(req, res) {
  try {
    const {
      patientId,
      arogyaId,
      abhaId,
      patientName,
      age,
      gender,
      bloodGroup,
      phone,
      village,
      doctorId,
      doctorName,
      specialty,
      hospitalName,
      hospitalId,
      kioskOperatorId,
      kioskOperatorName,
      requestedTime,
      triageSummary,
      riskLevel,
      notes
    } = req.body;

    if (!patientName || !doctorName || !hospitalName) {
      return res.status(400).json({
        success: false,
        error: 'patientName, doctorName, and hospitalName are required.'
      });
    }

    const tokenNo = generateTokenNo();

    const appointmentPayload = {
      patientId: patientId || 'pat_' + Date.now(),
      arogyaId: arogyaId || '',
      abhaId: abhaId || '',
      patientName: patientName.trim(),
      age: Number(age) || 0,
      gender: gender || 'Other',
      bloodGroup: bloodGroup || 'Unknown',
      phone: phone ? phone.trim() : '',
      village: village ? village.trim() : '',
      doctorId: doctorId || 'doc_' + Date.now(),
      doctorName: doctorName.trim(),
      specialty: specialty || 'Emergency Specialist',
      hospitalName: hospitalName.trim(),
      hospitalId: hospitalId || '',
      kioskOperatorId: kioskOperatorId || '',
      kioskOperatorName: kioskOperatorName || 'Kiosk Operator',
      tokenNo,
      requestedTime: requestedTime || 'Within 15 minutes (Emergency Priority Lane)',
      status: 'requested',
      triageSummary: triageSummary || '',
      riskLevel: riskLevel || 'CRITICAL',
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    let savedAppointment;

    if (isDbConnected()) {
      try {
        const appointmentDoc = new Appointment(appointmentPayload);
        savedAppointment = await appointmentDoc.save();
      } catch (dbErr) {
        console.warn('[MongoDB Appointment Save Notice, falling back to memory store]', dbErr.message);
        savedAppointment = {
          ...appointmentPayload,
          _id: 'app_' + Date.now(),
          id: 'app_' + Date.now()
        };
        if (!memoryDb.appointments) memoryDb.appointments = new Map();
        memoryDb.appointments.set(savedAppointment.id, savedAppointment);
      }
    } else {
      savedAppointment = {
        ...appointmentPayload,
        _id: 'app_' + Date.now(),
        id: 'app_' + Date.now()
      };
      if (!memoryDb.appointments) memoryDb.appointments = new Map();
      memoryDb.appointments.set(savedAppointment.id, savedAppointment);
    }

    console.log(`[Appointment Created] Token: ${tokenNo} for Patient: ${patientName} with ${doctorName}`);

    return res.status(201).json({
      success: true,
      message: 'Emergency doctor appointment requested successfully',
      appointment: savedAppointment
    });
  } catch (err) {
    console.error('[Create Appointment Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to create appointment request.'
    });
  }
}

/**
 * Get all appointment requests with optional filters
 * GET /api/appointments
 */
export async function getAppointments(req, res) {
  try {
    const { patientId, arogyaId, kioskOperatorId, status } = req.query;

    if (isDbConnected()) {
      const filter = {};
      if (patientId) filter.patientId = patientId;
      if (arogyaId) filter.arogyaId = arogyaId;
      if (kioskOperatorId) filter.kioskOperatorId = kioskOperatorId;
      if (status) filter.status = status;

      const appointments = await Appointment.find(filter).sort({ createdAt: -1 }).lean();
      return res.json({
        success: true,
        count: appointments.length,
        appointments
      });
    }

    if (!memoryDb.appointments) memoryDb.appointments = new Map();
    let appointments = Array.from(memoryDb.appointments.values());

    if (patientId) appointments = appointments.filter(a => a.patientId === patientId);
    if (arogyaId) appointments = appointments.filter(a => a.arogyaId === arogyaId);
    if (kioskOperatorId) appointments = appointments.filter(a => a.kioskOperatorId === kioskOperatorId);
    if (status) appointments = appointments.filter(a => a.status === status);

    appointments.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

    return res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (err) {
    console.error('[Get Appointments Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments.'
    });
  }
}

/**
 * Get appointments by patient ID or Arogya ID
 * GET /api/appointments/patient/:patientId
 */
export async function getPatientAppointments(req, res) {
  try {
    const { patientId } = req.params;

    if (isDbConnected()) {
      const appointments = await Appointment.find({
        $or: [{ patientId }, { arogyaId: patientId }]
      }).sort({ createdAt: -1 }).lean();

      return res.json({
        success: true,
        count: appointments.length,
        appointments
      });
    }

    if (!memoryDb.appointments) memoryDb.appointments = new Map();
    const appointments = Array.from(memoryDb.appointments.values()).filter(
      a => a.patientId === patientId || a.arogyaId === patientId
    );
    appointments.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

    return res.json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (err) {
    console.error('[Get Patient Appointments Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve patient appointments.'
    });
  }
}
