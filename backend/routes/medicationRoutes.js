import express from 'express';
import Medication from '../models/Medication.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { 
  addMedication, 
  getDailyMedications, 
  updateMedicationStatus 
} from '../controllers/medicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('patient', 'doctor'), addMedication);
router.get('/daily', authenticate, authorize('patient'), getDailyMedications);
router.get('/all', authenticate, authorize('doctor', 'admin'), async (req, res) => {
  try {
    const medications = await Medication.find({})
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: error.message });
  }
});
router.put('/:id/status', authenticate, authorize('patient'), (req, res, next) => {
  console.log('=== MEDICATION STATUS UPDATE ROUTE HIT ===');
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);
  console.log('User:', req.user?.id);
  next();
}, updateMedicationStatus);

// Doctor route to get patient medications
router.get('/patient/:patientId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { patientId } = req.params;
    const medications = await Medication.find({ patient: patientId })
      .populate('patient', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, medications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update medication
router.put('/:id', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const medication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('patient', 'name email');
    res.json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete medication
router.delete('/:id', authenticate, authorize('doctor'), async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fix medications with invalid patient references
router.post('/fix-patient-refs', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Find medications with null or invalid patient references
    const medications = await Medication.find({}).populate('patient');
    const fixedCount = await Medication.deleteMany({ patient: null });
    
    res.json({ 
      success: true, 
      message: `Fixed ${fixedCount.deletedCount} medications with invalid patient references` 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Temporary route to fix existing medication
router.post('/fix-existing', authenticate, authorize('doctor'), async (req, res) => {
  try {
    // Get the doctor's patients
    const doctorPatients = await User.find({ role: 'patient' });
    if (doctorPatients.length === 0) {
      return res.status(400).json({ message: 'No patients found' });
    }
    
    // Get the first patient
    const firstPatient = doctorPatients[0];
    
    // Find medications with invalid patient references and update them
    const medications = await Medication.find({}).populate('patient');
    const orphanedMedications = medications.filter(med => !med.patient || !med.patient.name);
    
    for (const med of orphanedMedications) {
      await Medication.findByIdAndUpdate(med._id, { patient: firstPatient._id });
    }
    
    res.json({ 
      success: true, 
      message: `Updated ${orphanedMedications.length} medications with patient: ${firstPatient.name}` 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;