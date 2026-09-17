import express from 'express';
import { dispatchSOS } from '../controllers/sosController.js';

const router = express.Router();

router.post('/dispatch', dispatchSOS);

export default router;
