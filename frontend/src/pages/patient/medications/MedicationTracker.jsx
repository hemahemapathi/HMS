import { useState, useEffect } from 'react';
import { Pill, Plus, Clock, Calendar } from 'lucide-react';
import api from '../../utils/api';

const MedicationTracker = () => {
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    scheduledTime: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchMedications = async () => {
    try {
      const response = await api.get('/medications/daily');
      setMedications(response.data.medications || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medications', formData);
      setFormData({ name: '', dosage: '', scheduledTime: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
      fetchMedications();
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const updateStatus = async (medicationId, status) => {
    try {
      await api.put(`/medications/${medicationId}/status`, { status });
      fetchMedications();
    } catch (error) {
      console.error('Error updating medication status:', error);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  if (loading) return <div className="text-center py-4">Loading medications...</div>;

  return (
    <div className="page-container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-danger mb-0">
          <Pill className="me-2" size={28} />
          Medication Tracker
        </h2>
        <button 
          className="btn btn-danger"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={20} className="me-1" />
          Add Medication
        </button>
      </div>

      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h6 className="mb-0">Add New Medication</h6>
          </div>
          <div className="card-body">
            <form onSubmit={addMedication}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Medication Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., 500mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Scheduled Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-danger me-2">Add Medication</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0">Today's Medications</h6>
            </div>
            <div className="card-body">
              {medications.length > 0 ? (
                <div className="row g-3">
                  {medications.map((med) => (
                    <div key={med._id} className="col-md-6 col-lg-4">
                      <div className="card h-100 border-start border-danger border-3">
                        <div className="card-body">
                          <h6 className="card-title">{med.name}</h6>
                          <p className="text-muted mb-2">{med.dosage}</p>
                          <p className="small mb-3">
                            <Clock size={14} className="me-1" />
                            {med.scheduledTime}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge ${
                              med.status === 'taken' ? 'bg-success' : 
                              med.status === 'missed' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {med.status}
                            </span>
                            {med.status === 'pending' && (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => updateStatus(med._id, 'taken')}
                              >
                                Mark as Taken
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <Pill size={48} className="text-muted mb-3" />
                  <p className="text-muted">No medications scheduled for today</p>
                  <button 
                    className="btn btn-outline-danger"
                    onClick={() => setShowAddForm(true)}
                  >
                    Add Your First Medication
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationTracker;