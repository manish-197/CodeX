import express from 'express';
import {
  createAppointment,
  getAppointments,
  getPatientAppointments
} from '../controllers/appointmentController.js';

const router = express.Router();

// POST /api/appointments - Create emergency appointment request
router.post('/', createAppointment);

// GET /api/appointments - List all appointments (filterable by patientId, arogyaId, kioskOperatorId)
router.get('/', getAppointments);

// GET /api/appointments/patient/:patientId - List appointments for a specific patient
router.get('/patient/:patientId', getPatientAppointments);

export default router;
