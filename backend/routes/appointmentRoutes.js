import express from 'express';
import { 
  createAppointment, 
  createPaymentIntent, 
  confirmPayment,
  getAppointments, 
  updateAppointment,
  updateAppointmentStatus,
  checkAvailability,
  startConsultation,
  addChatMessage,
  updateConsultationNotes,
  completeConsultation,
  getAppointmentById,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { authenticate, authorize, doctorApprovalCheck } from '../middleware/auth.js';

const router = express.Router();

// Patient routes
router.post('/', authenticate, authorize('patient'), createAppointment);
router.post('/payment-intent', authenticate, authorize('patient'), createPaymentIntent);
router.post('/confirm-payment', authenticate, authorize('patient'), confirmPayment);

// Common routes
router.get('/', authenticate, getAppointments);
router.get('/availability', authenticate, checkAvailability);

// Doctor, Admin, and Patient routes (patients can cancel their own appointments)
router.put('/:id/status', authenticate, authorize('doctor', 'admin', 'patient'), updateAppointmentStatus);
router.put('/:id', authenticate, authorize('patient', 'doctor'), updateAppointment);
router.delete('/:id', authenticate, authorize('admin', 'patient'), deleteAppointment);

// Video Consultation routes
router.get('/:id', authenticate, getAppointmentById);
router.put('/:id/start', authenticate, authorize('doctor'), startConsultation);
router.post('/:id/chat', authenticate, addChatMessage);
router.put('/:id/notes', authenticate, authorize('doctor'), updateConsultationNotes);
router.put('/:id/complete', authenticate, completeConsultation);

export default router;