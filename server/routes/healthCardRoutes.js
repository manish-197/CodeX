import express from 'express';
import { getCardPreview, generateHealthCardPdf } from '../controllers/healthCardController.js';

const router = express.Router();

router.post('/preview', getCardPreview);
router.post('/pdf', generateHealthCardPdf);

export default router;
