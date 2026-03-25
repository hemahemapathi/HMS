import Medication from '../models/Medication.js';
import User from '../models/User.js';

export const addMedication = async (req, res) => {
  try {
    const { name, dosage, frequency, duration, scheduledTime, date, patientId } = req.body;
    
    // Determine patient ID - if doctor is adding, use patientId from body, if patient is adding, use their own ID
    const targetPatientId = req.user.role === 'doctor' ? patientId : req.user.id;
    
    if (!targetPatientId) {
      return res.status(400).json({ message: 'Patient ID is required' });
    }
    
    // Validate that the patient exists
    const patient = await User.findById(targetPatientId);
    if (!patient) {
      return res.status(400).json({ message: 'Patient not found' });
    }
    
    // Create a single medication record with duration info
    const medication = await Medication.create({
      patient: targetPatientId,
      name,
      dosage,
      frequency,
      duration,
      scheduledTime,
      date: new Date(date)
    });
    
    // Populate the patient data before returning
    await medication.populate('patient', 'name email');
    
    res.status(201).json({ success: true, medication });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyMedications = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all medications for this patient
    const medications = await Medication.find({
      patient: req.user.id
    }).sort({ createdAt: -1 });
    
    const allMedications = [];
    
    medications.forEach(med => {
      const startDate = new Date(med.date);
      startDate.setHours(0, 0, 0, 0);
      
      // Calculate how many days have been completed
      const completedDays = Array.from(med.dailyStatus?.entries() || []).filter(([date, status]) => status === 'taken').length;
      
      // If all days are completed, don't show this medication
      if (completedDays >= med.duration) {
        return;
      }
      
      // Calculate current day
      const currentDay = completedDays + 1;
      
      // Check if today's dose is taken
      const todayStatus = med.dailyStatus?.get(today.toDateString()) || 'pending';
      console.log(`Medication ${med.name}: completedDays=${completedDays}, currentDay=${currentDay}, todayStatus=${todayStatus}, today=${today.toDateString()}`);
      console.log('Daily status map:', Array.from(med.dailyStatus?.entries() || []));
      
      // Determine status: active (current day), upcoming (future days), completed (past days)
      let status;
      if (todayStatus === 'taken') {
        // If today's dose is taken, this becomes upcoming (waiting for next day)
        status = 'upcoming';
      } else {
        // If today's dose is not taken, this is active (current day to take)
        status = 'active';
      }
      
      console.log(`Final status for ${med.name}: ${status}`);
      
      allMedications.push({
        _id: `${med._id}_current`,
        originalId: med._id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        scheduledTime: med.scheduledTime,
        status: status,
        currentDay: currentDay,
        totalDays: med.duration,
        completedDays: completedDays,
        date: today,
        startDate: med.date,
        prescribedBy: med.prescribedBy || 'Doctor',
        instructions: med.instructions
      });
    });
    
    res.json({ success: true, medications: allMedications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`Received update request: id=${id}, status=${status}`);
    
    // Handle current medication instances
    if (id.includes('_current')) {
      const originalId = id.replace('_current', '');
      const today = new Date().toDateString();
      console.log(`Processing current medication: originalId=${originalId}, today=${today}`);
      
      const medication = await Medication.findById(originalId);
      if (!medication || medication.patient.toString() !== req.user.id) {
        console.log('Medication not found or unauthorized');
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      console.log('Found medication:', medication.name);
      
      // Initialize dailyStatus if it doesn't exist
      if (!medication.dailyStatus) {
        medication.dailyStatus = new Map();
        console.log('Initialized new dailyStatus map');
      }
      
      // Update status for today
      medication.dailyStatus.set(today, status);
      console.log(`Updated dailyStatus for ${medication.name}: ${today} = ${status}`);
      console.log('Current dailyStatus map:', Array.from(medication.dailyStatus.entries()));
      
      if (status === 'taken') {
        medication.lastTakenAt = new Date();
      }
      
      await medication.save();
      console.log('Medication saved successfully');
      
      res.json({ success: true, message: 'Medication status updated' });
    } else {
      // Handle regular medication update
      const updateData = { status };
      if (status === 'taken') {
        updateData.takenAt = new Date();
      }
      
      const medication = await Medication.findOneAndUpdate(
        { _id: id, patient: req.user.id },
        updateData,
        { new: true }
      );
      
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' });
      }
      
      res.json({ success: true, medication });
    }
  } catch (error) {
    console.error('Error in updateMedicationStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

export const markMissedMedications = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await Medication.updateMany(
      {
        date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        scheduledTime: { $lt: currentTime },
        status: 'pending'
      },
      { status: 'missed' }
    );
  } catch (error) {
    console.error('Error marking missed medications:', error);
  }
}