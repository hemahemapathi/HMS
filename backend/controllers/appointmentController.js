import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import { notifyAllAdmins } from './notificationController.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createAppointment = async (req, res) => {
  try {
    console.log('Creating appointment with data:', req.body);
    console.log('User ID:', req.user.id);
    
    const { doctorId, date, time, reason } = req.body;
    
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || !doctor.isApproved) {
      console.log('Doctor validation failed:', doctor);
      return res.status(400).json({ message: 'Invalid or unapproved doctor' });
    }

    // Check if appointment slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      time,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingAppointment) {
      console.log('Existing appointment found:', existingAppointment);
      return res.status(400).json({ message: 'Time slot not available' });
    }

    console.log('Creating new appointment...');
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date + 'T00:00:00.000Z'),
      time,
      reason,
      consultationFee: doctor.consultationFee || 100
    });

    console.log('Appointment created with ID:', appointment._id);
    
    // Return the created appointment directly without re-querying
    const responseAppointment = {
      _id: appointment._id,
      patient: { _id: req.user.id, name: req.user.name, email: req.user.email },
      doctor: { _id: doctor._id, name: doctor.name, email: doctor.email, specialization: doctor.specialization },
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      consultationFee: appointment.consultationFee,
      paymentStatus: appointment.paymentStatus,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    };

    console.log('Returning appointment:', responseAppointment);
    res.status(201).json({ success: true, appointment: responseAppointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createPaymentIntent = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    console.log('Stripe key available:', !!process.env.STRIPE_SECRET_KEY);
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment || appointment.patient.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: appointment.consultationFee * 100, // Convert to cents
      currency: 'usd',
      metadata: { appointmentId: appointment._id.toString() }
    });

    appointment.paymentIntentId = paymentIntent.id;
    await appointment.save();

    res.json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret 
    });
  } catch (error) {
    console.error('Payment intent error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.paymentStatus = 'paid';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email specialization' }
      ]);

    // Notify admins about payment confirmation
    await notifyAllAdmins(
      'Payment Confirmed',
      `Payment confirmed for appointment between ${populatedAppointment.patient.name} and Dr. ${populatedAppointment.doctor.name}`,
      'success',
      { appointmentId, action: 'payment_confirmed' }
    );

    res.json({ success: true, message: 'Payment confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    let query = {};
    
    console.log('Getting appointments for user:', req.user.id, 'Role:', req.user.role);
    
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }
    // Admin can see all appointments (no filter)

    const appointments = await Appointment.find(query)
      .populate([
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name email specialization' }
      ])
      .sort({ date: -1 });

    console.log('Found appointments:', appointments.length);
    if (appointments.length > 0) {
      console.log('Sample appointment:', {
        id: appointments[0]._id,
        patientId: appointments[0].patient?._id,
        patientName: appointments[0].patient?.name,
        doctorId: appointments[0].doctor?._id,
        doctorName: appointments[0].doctor?.name
      });
    }

    res.json({ success: true, appointments });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({ message: error.message });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date || date === 'undefined' || date === '') {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const bookedAppointments = await Appointment.find({
      date: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      },
      status: { $in: ['pending', 'approved'] }
    }).select('time');
    
    const bookedSlots = bookedAppointments.map(apt => apt.time);
    
    res.json({ success: true, bookedSlots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { date, time, reason, isReschedule } = req.body;
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Allow both patients and doctors to reschedule
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
      console.log('Doctor authorization failed for reschedule:');
      console.log('Appointment doctor ID:', appointment.doctor.toString());
      console.log('Current user ID:', req.user.id);
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if new slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'approved'] },
      _id: { $ne: id }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    const oldDate = appointment.date;
    const oldTime = appointment.time;
    
    appointment.date = new Date(date);
    appointment.time = time;
    if (reason) appointment.reason = reason;
    
    // If doctor reschedules, mark as pending patient approval
    if (req.user.role === 'doctor' && isReschedule) {
      appointment.status = 'pending_approval';
      appointment.rescheduleInfo = {
        oldDate,
        oldTime,
        newDate: new Date(date),
        newTime: time,
        rescheduledBy: req.user.id,
        rescheduledAt: new Date()
      };
    }
    
    await appointment.save();

    const populatedAppointment = await Appointment.findById(id)
      .populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email specialization' }
      ]);

    res.json({ success: true, appointment: populatedAppointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, prescription } = req.body;
    const { id } = req.params;

    console.log('Update appointment status request:');
    console.log('Appointment ID:', id);
    console.log('User ID:', req.user.id);
    console.log('User role:', req.user.role);
    console.log('Status to update:', status);

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Found appointment:');
    console.log('Appointment doctor ID:', appointment.doctor.toString());
    console.log('Appointment patient ID:', appointment.patient.toString());

    // Allow patients to cancel their own appointments and doctors to cancel their assigned appointments
    if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Doctor can update their own appointments, admin can update any appointment
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.id) {
      console.log('Doctor authorization failed:');
      console.log('Appointment doctor ID:', appointment.doctor.toString());
      console.log('Current user ID:', req.user.id);
      console.log('User role:', req.user.role);
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    // Prevent marking future appointments as completed
    if (status === 'completed') {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate > today) {
        return res.status(400).json({ message: 'Cannot mark future appointments as completed' });
      }
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    await appointment.save();

    // If appointment is completed and has notes, create a health record
    if (status === 'completed' && notes) {
      try {
        const HealthRecord = (await import('../models/HealthRecord.js')).default;
        const doctor = await User.findById(appointment.doctor);
        
        await HealthRecord.create({
          patient: appointment.patient,
          title: `Consultation Notes - Dr. ${doctor.name}`,
          recordType: 'consultation',
          description: notes,
          uploadedBy: appointment.doctor,
          isVerified: true,
          verifiedBy: appointment.doctor,
          consultationNotes: notes,
          appointmentId: appointment._id
        });
        
        console.log('Created health record for completed appointment');
      } catch (error) {
        console.error('Error creating health record:', error);
        // Don't fail the appointment update if health record creation fails
      }
    }

    const populatedAppointment = await Appointment.findById(id)
      .populate([
        { path: 'patient', select: 'name email' },
        { path: 'doctor', select: 'name email specialization' }
      ]);

    res.json({ success: true, appointment: populatedAppointment });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Video Consultation Controllers
export const startConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only assigned doctor can start consultation' });
    }
    
    appointment.status = 'in-progress';
    await appointment.save();
    
    res.json({ success: true, message: 'Consultation started' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { sender, senderRole, message } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.chatMessages.push({
      sender,
      senderRole,
      message,
      timestamp: new Date()
    });
    
    await appointment.save();
    res.json({ success: true, message: 'Message added' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateConsultationNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only assigned doctor can update notes' });
    }
    
    appointment.consultationNotes = notes;
    await appointment.save();
    
    res.json({ success: true, message: 'Notes updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { consultationNotes, chatMessages } = req.body;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.status = 'completed';
    if (consultationNotes) appointment.consultationNotes = consultationNotes;
    if (chatMessages) appointment.chatMessages = chatMessages;
    
    await appointment.save();
    
    res.json({ success: true, message: 'Consultation completed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Only patient can delete their own appointment or admin
    if (req.user.role !== 'admin' && appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate([
        { path: 'patient', select: 'name email phone' },
        { path: 'doctor', select: 'name email specialization' }
      ]);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    res.json({ success: true, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};