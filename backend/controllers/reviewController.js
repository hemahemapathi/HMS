import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';

export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;
    
    console.log('Received review data:', { appointmentId, rating, comment });
    console.log('Request body:', req.body);
    
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }
    
    // Check if appointment exists and belongs to patient
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patient.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed appointments' });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      console.log('Existing review found:', existingReview);
      return res.status(400).json({ 
        message: 'Review already exists for this appointment',
        existingReview: {
          id: existingReview._id,
          rating: existingReview.rating,
          comment: existingReview.comment,
          createdAt: existingReview.createdAt
        }
      });
    }
    
    console.log('Creating review with appointmentId:', appointmentId);
    console.log('Patient ID:', req.user._id);
    console.log('Doctor ID:', appointment.doctor);
    
    // Clean up any invalid reviews with null appointment or patient field
    const cleanupResult = await Review.deleteMany({ 
      $or: [
        { appointment: null },
        { patient: null }
      ]
    });
    console.log('Cleaned up invalid reviews:', cleanupResult.deletedCount);
    
    // Drop incorrect appointmentId index if it exists
    try {
      await Review.collection.dropIndex('appointmentId_1');
      console.log('Dropped incorrect appointmentId index');
    } catch (indexError) {
      console.log('appointmentId index not found or already dropped');
    }
    
    const review = await Review.create({
      patient: req.user._id,
      doctor: appointment.doctor,
      appointment: appointmentId,
      rating,
      comment
    });
    
    const populatedReview = await Review.findById(review._id)
      .populate('patient', 'name')
      .populate('doctor', 'name specialization');
    
    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    let query = { isApproved: true };
    
    // Filter by doctor if specified
    if (req.query.doctorId) {
      query.doctor = req.query.doctorId;
    }
    
    const limit = parseInt(req.query.limit) || 4; // Default to 4 for home page
    
    const reviews = await Review.find(query)
      .populate('patient', 'name')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 }) // Most recent first
      .limit(limit);
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkReviewExists = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const review = await Review.findOne({ appointment: appointmentId });
    res.json({ exists: !!review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await Review.find({ isApproved: false })
      .populate('patient', 'name')
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews: pendingReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).populate('patient', 'name').populate('doctor', 'name specialization');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('patient', 'name')
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      doctor: req.user._id
    })
      .populate('patient', 'name')
      .populate('appointment', 'date time reason')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Only patient who created review or admin can delete
    if (review.patient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Review.findByIdAndDelete(id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};