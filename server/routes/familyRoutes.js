import express from 'express';
import { getFamilyMembers, addFamilyMember, updateVitals } from '../controllers/familyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getFamilyMembers);
router.post('/', addFamilyMember);
router.put('/:id/vitals', updateVitals);

export default router;
