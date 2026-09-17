import express from 'express';
import { triageSymptoms, triageCustomSymptom } from '../controllers/triageController.js';

const router = express.Router();

router.post('/', triageSymptoms);
router.post('/custom-symptom', triageCustomSymptom);

export default router;
