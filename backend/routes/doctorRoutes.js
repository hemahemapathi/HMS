import express from 'express';
import { getAllDoctors, getDoctorById, updateDoctorProfile, getDoctorPatients } from '../controllers/doctorController.js';
import { authenticate, authorize, doctorApprovalCheck } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Doctor-only routes
router.put('/profile', authenticate, authorize('doctor'), updateDoctorProfile);
router.get('/my/patients', authenticate, authorize('doctor'), /* doctorApprovalCheck, */ getDoctorPatients);

export default router;