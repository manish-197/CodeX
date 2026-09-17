import express from 'express';
import { triageSymptoms } from '../controllers/triageController.js';

const router = express.Router();

router.post('/', triageSymptoms);

export default router;
