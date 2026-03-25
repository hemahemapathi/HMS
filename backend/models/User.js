import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin'], 
    required: true 
  },
  phone: { type: String },
  address: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  // Doctor specific fields
  specialization: { type: String },
  experience: { type: Number },
  qualifications: [String],
  education: { type: String },
  consultationFee: { type: Number },
  category: { type: String },
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  isApproved: { type: Boolean, default: false },
  
  // Patient specific fields
  medicalHistory: [String],
  allergies: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Profile image
  profileImage: { type: String }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);