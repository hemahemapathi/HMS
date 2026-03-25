import express from 'express';
import Review from '../models/Review.js';
import { 
  createReview, 
  getReviews, 
  getAllReviews,
  getMyReviews, 
  getDoctorReviews,
  getPendingReviews,
  approveReview, 
  deleteReview,
  checkReviewExists
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/all', getAllReviews);

// Patient routes
router.post('/', authenticate, authorize('patient'), createReview);
router.get('/my-reviews', authenticate, authorize('patient'), getMyReviews);

// Doctor routes
router.get('/doctor', authenticate, authorize('doctor'), getDoctorReviews);
router.get('/patient/:patientId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Fetching reviews for patient ID:', patientId);
    const reviews = await Review.find({ patient: patientId })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });
    console.log('Found reviews:', reviews.length);
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching patient reviews:', error);
    res.status(500).json({ message: error.message });
  }
});
router.get('/check/:appointmentId', authenticate, authorize('patient'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const review = await Review.findOne({ appointment: appointmentId });
    res.json({ exists: !!review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/check/:appointmentId', authenticate, authorize('patient'), checkReviewExists);

// Admin routes
router.get('/pending', authenticate, authorize('admin'), getPendingReviews);
router.put('/:id/approve', authenticate, authorize('admin'), approveReview);
router.delete('/:id', authenticate, deleteReview);

export default router;