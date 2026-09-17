import express from 'express';
import { getNearestHospitals } from '../controllers/hospitalController.js';

const router = express.Router();

router.get('/nearest', getNearestHospitals);

export default router;
