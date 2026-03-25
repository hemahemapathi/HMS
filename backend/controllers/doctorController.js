import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { notifyAllAdmins } from './notificationController.js';

export const getAllDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    let query = { role: 'doctor', isApproved: true };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    const doctors = await User.find(query)
      .select('-password -medicalHistory -allergies -emergencyContact')
      .sort({ name: 1 });

    res.json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await User.findById(id)
      .select('-password -medicalHistory -allergies -emergencyContact');
    
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'specialization', 'experience', 'qualifications', 'education',
      'consultationFee', 'category', 'availability', 'phone', 'address'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // Notify admins about doctor profile updates
    await notifyAllAdmins(
      'Doctor Profile Updated',
      `Dr. ${doctor.name} has updated their profile information`,
      'info',
      { userId: doctor._id, action: 'doctor_profile_updated' }
    );

    res.json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorPatients = async (req, res) => {
  try {
    // Get all appointments for this doctor
    const appointments = await Appointment.find({ 
      doctor: req.user.id,
      status: { $in: ['pending', 'approved', 'confirmed', 'completed'] }
    }).populate({
      path: 'patient',
      select: 'name email phone dateOfBirth gender medicalHistory allergies'
    });

    // Extract unique patients
    const patientsMap = new Map();
    appointments.forEach(appointment => {
      if (appointment.patient) {
        patientsMap.set(appointment.patient._id.toString(), appointment.patient);
      }
    });

    const patients = Array.from(patientsMap.values());

    res.json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};