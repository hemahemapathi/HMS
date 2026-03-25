import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import HealthRecord from '../models/HealthRecord.js';
import { notifyAllAdmins } from './notificationController.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const approvedDoctors = await User.countDocuments({ role: 'doctor', isApproved: true });
    const pendingDoctors = await User.countDocuments({ role: 'doctor', isApproved: false });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const totalHealthRecords = await HealthRecord.countDocuments();

    // Debug: Log actual patient count
    console.log('Patient count from DB:', totalPatients);
    const patients = await User.find({ role: 'patient' }).select('name email');
    console.log('Actual patients:', patients);

    res.json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalAppointments,
        pendingAppointments,
        totalHealthRecords
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    } else {
      // By default, exclude admin users
      query.role = { $ne: 'admin' };
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = true;
    await doctor.save();

    // Notify other admins about doctor approval
    await notifyAllAdmins(
      'Doctor Approved',
      `Dr. ${doctor.name} (${doctor.email}) has been approved by an admin`,
      'success',
      { userId: doctor._id, action: 'doctor_approved' }
    );

    res.json({ success: true, message: 'Doctor approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.isApproved = false;
    await doctor.save();

    // Notify other admins about doctor rejection
    await notifyAllAdmins(
      'Doctor Rejected',
      `Dr. ${doctor.name} (${doctor.email}) has been rejected by an admin`,
      'warning',
      { userId: doctor._id, action: 'doctor_rejected' }
    );

    res.json({ success: true, message: 'Doctor rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(id);
    
    // Also delete related appointments and health records
    await Appointment.deleteMany({
      $or: [{ patient: id }, { doctor: id }]
    });
    
    await HealthRecord.deleteMany({
      $or: [{ patient: id }, { doctor: id }, { uploadedBy: id }]
    });

    // Notify other admins about user deletion
    await notifyAllAdmins(
      'User Deleted',
      `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${user.name} (${user.email}) has been deleted by an admin`,
      'warning',
      { userId: id, action: 'user_deleted', deletedUserRole: user.role }
    );

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};