import express from 'express';
import PrescriptionRefill from '../models/PrescriptionRefill.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all prescription refill requests (Admin only)
router.get('/prescription-refills', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requests = await PrescriptionRefill.find()
      .populate('patient', 'name email')
      .populate('medication', 'name dosage')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Handle prescription refill request (Admin only)
router.put('/prescription-refills/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { action } = req.body;
    const request = await PrescriptionRefill.findById(req.params.id)
      .populate('patient', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Refill request not found' });
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.processedBy = req.user.id;
    request.processedAt = new Date();
    await request.save();

    // Send notification to patient
    await Notification.create({
      user: request.patient._id,
      type: 'prescription_refill',
      title: `Prescription Refill ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your refill request for ${request.medicationName} has been ${action}d`,
      isRead: false
    });

    res.json({ message: `Refill request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;