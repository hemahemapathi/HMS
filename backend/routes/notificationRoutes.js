import express from 'express';
import { getNotifications, markAsRead, clearAllNotifications, getEmailStatus, testEmail } from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/clear', authenticate, clearAllNotifications);
router.get('/email-status', authenticate, getEmailStatus);
router.post('/test-email', authenticate, testEmail);

// Send medication reminder notification
router.post('/medication-reminder', authenticate, async (req, res) => {
  try {
    const { medicationId, message } = req.body;
    
    await Notification.create({
      user: req.user.id,
      type: 'medication_reminder',
      title: 'Medication Reminder',
      message,
      isRead: false
    });

    res.json({ message: 'Medication reminder sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send prescription refill request
router.post('/prescription-refill', authenticate, async (req, res) => {
  try {
    const { medicationId, medicationName, message } = req.body;
    const PrescriptionRefill = (await import('../models/PrescriptionRefill.js')).default;
    
    await PrescriptionRefill.create({
      patient: req.user.id,
      medication: medicationId,
      medicationName,
      message
    });

    // Notify admin
    const adminUsers = await User.find({ role: 'admin' });
    for (const admin of adminUsers) {
      await Notification.create({
        user: admin._id,
        type: 'prescription_refill_request',
        title: 'New Prescription Refill Request',
        message: `${req.user.name} requested refill for ${medicationName}`,
        isRead: false
      });
    }

    res.json({ message: 'Refill request sent to admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;