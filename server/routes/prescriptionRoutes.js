import express from 'express';
import { upload, processPrescriptionOcr } from '../controllers/prescriptionController.js';

const router = express.Router();

router.post('/ocr', upload.single('prescriptionImage'), processPrescriptionOcr);

export default router;
