import express from 'express';
import { handleWhatsAppWebhook, simulateWhatsAppMessage } from '../controllers/whatsappController.js';

const router = express.Router();

router.post('/webhook', handleWhatsAppWebhook);
router.post('/simulate', simulateWhatsAppMessage);

export default router;
