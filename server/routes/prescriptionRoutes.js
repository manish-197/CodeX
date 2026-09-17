import express from 'express';
import { 
  upload, 
  processPrescriptionOcr, 
  savePrescription, 
  getPrescriptionsByMember, 
  getAllPrescriptions,
  generatePrescriptionPdf, 
  verifyPrescription, 
  verifyPrescriptionLanding 
} from '../controllers/prescriptionController.js';

const router = express.Router();

router.get('/', getAllPrescriptions);
router.post('/save', savePrescription);
router.get('/member/:familyMemberId', getPrescriptionsByMember);
router.get('/:id/pdf', generatePrescriptionPdf);
router.post('/:id/verify', verifyPrescription);
router.patch('/:id/verify', verifyPrescription);
router.get('/verify/:id', verifyPrescriptionLanding);
router.post('/ocr', upload.single('prescriptionImage'), processPrescriptionOcr);

export default router;
