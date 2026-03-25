import express from 'express';
import { 
  getDashboardStats, 
  getAllUsers, 
  approveDoctor, 
  rejectDoctor, 
  deleteUser 
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/patients', (req, res, next) => { req.query.role = 'patient'; next(); }, getAllUsers);
router.get('/doctors', (req, res, next) => { req.query.role = 'doctor'; next(); }, getAllUsers);
router.get('/admins', (req, res, next) => { req.query.role = 'admin'; next(); }, getAllUsers);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/reject', rejectDoctor);
router.delete('/users/:id', deleteUser);

export default router;