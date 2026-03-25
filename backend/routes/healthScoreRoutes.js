import express from 'express';
import { setHealthScore, getHealthScore } from '../controllers/healthScoreController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('doctor', 'admin'), setHealthScore);
router.get('/:patientId', authenticate, getHealthScore);

export default router;