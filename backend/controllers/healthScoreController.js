import HealthScore from '../models/HealthScore.js';

export const setHealthScore = async (req, res) => {
  try {
    const { patientId, score, status, notes } = req.body;
    
    // Delete existing manual score for this patient
    await HealthScore.deleteOne({ patient: patientId, isManual: true });
    
    const healthScore = await HealthScore.create({
      patient: patientId,
      score,
      status,
      notes,
      setBy: req.user.id,
      isManual: true
    });
    
    await healthScore.populate('setBy', 'name role');
    
    res.status(201).json({ success: true, healthScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthScore = async (req, res) => {
  try {
    const patientId = req.params.patientId === 'current' ? req.user.id : req.params.patientId;
    
    const healthScore = await HealthScore.findOne({ 
      patient: patientId, 
      isManual: true 
    }).populate('setBy', 'name role');
    
    res.json({ success: true, healthScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};