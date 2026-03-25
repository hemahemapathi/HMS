import mongoose from 'mongoose';

const healthScoreSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Good', 'Average', 'Needs Attention'],
    required: true
  },
  notes: {
    type: String
  },
  setBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isManual: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('HealthScore', healthScoreSchema);