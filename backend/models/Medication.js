import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // Duration in days
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed'],
    default: 'pending'
  },
  dailyStatus: {
    type: Map,
    of: String,
    default: new Map()
  },
  takenAt: {
    type: Date
  },
  lastTakenAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate medications
medicationSchema.index({ patient: 1, name: 1, date: 1, scheduledTime: 1 }, { unique: true });

export default mongoose.model('Medication', medicationSchema);