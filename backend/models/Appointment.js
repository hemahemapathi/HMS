import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'in-progress', 'pending_approval'],
    default: 'pending'
  },
  consultationFee: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentIntentId: { type: String },
  notes: { type: String },
  prescription: { type: String },
  consultationNotes: { type: String },
  chatMessages: [{
    sender: String,
    senderRole: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  rescheduleInfo: {
    oldDate: Date,
    oldTime: String,
    newDate: Date,
    newTime: String,
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Appointment', appointmentSchema);