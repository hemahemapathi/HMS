import express from 'express';
import HealthRecord from '../models/HealthRecord.js';
import { uploadHealthRecord, getHealthRecords, getHealthRecord, deleteHealthRecord, getAllHealthRecords, verifyHealthRecord } from '../controllers/healthRecordController.js';
import { authenticate, authorize, doctorApprovalCheck } from '../middleware/auth.js';
import path from 'path';
const router = express.Router();

router.post('/', authenticate, uploadHealthRecord);
router.get('/', authenticate, getHealthRecords);
router.get('/all', authenticate, authorize('admin'), getAllHealthRecords);

// Doctor route to get patient health records
router.get('/patient/:patientId', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Clear mock data if it exists
    await HealthRecord.deleteMany({ 
      patient: patientId, 
      title: { $in: ['Blood Test Results', 'X-Ray Report'] } 
    });
    
    const healthRecords = await HealthRecord.find({ patient: patientId })
      .populate('patient', 'name email')
      .populate('uploadedBy', 'name role')
      .populate('verifiedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, healthRecords });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/verify', authenticate, authorize('doctor', 'admin'), verifyHealthRecord);
// Serve uploaded files (public access)
router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'health-records', filename);
  res.sendFile(filePath);
});
router.get('/:id/preview', (req, res, next) => {
  // Handle token from query parameter for iframe access
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
  }
  next();
}, authenticate, getHealthRecord);
router.get('/:id', authenticate, getHealthRecord);
router.delete('/:id', authenticate, deleteHealthRecord);

export default router;