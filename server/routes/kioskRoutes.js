import express from 'express';
import { 
  registerWalkInPatient, 
  getKioskPatients, 
  getPatientPrescriptions 
} from '../controllers/kioskController.js';

const router = express.Router();

router.post('/patients', registerWalkInPatient);
router.get('/patients', getKioskPatients);
router.get('/patients/:id/prescriptions', getPatientPrescriptions);

export default router;
