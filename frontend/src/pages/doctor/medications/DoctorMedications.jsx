import { useState, useEffect } from 'react';
import { Search, Plus, Pill, User, Calendar, Edit, Trash2 } from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import MobileSelect from '../../../components/MobileSelect';
import api from '../../../utils/api';

const DoctorMedications = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMedicationId, setDeletingMedicationId] = useState(null);
  const [editingMedication, setEditingMedication] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [newMedication, setNewMedication] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });

  useEffect(() => {
    fetchMedications();
    fetchPatients();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await api.get('/medications/all');
      const allMedications = response.data.medications || [];
      
      // Get current user ID to filter medications
      const userResponse = await api.get('/auth/profile');
      const currentDoctorId = userResponse.data?.user?._id || userResponse.data?._id;
      
      // Filter medications prescribed by current doctor
      const doctorMedications = allMedications.filter(med => 
        med.prescribedBy === currentDoctorId || med.doctor === currentDoctorId
      );
      
      setMedications(doctorMedications);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctors/my/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    try {
      const medicationData = {
        name: newMedication.medicationName,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        duration: parseInt(newMedication.duration.replace(/\D/g, '')) || 7, // Extract number from duration
        scheduledTime: '08:00', // Default time
        date: new Date().toISOString().split('T')[0],
        patientId: newMedication.patientId
      };
      
      await api.post('/medications', medicationData);
      
      // Refresh medications list
      fetchMedications();
      
      setNewMedication({
        patientId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding medication:', error);
    }
  };

  const handleEditMedication = (medication) => {
    setEditingMedication(medication);
    setNewMedication({
      patientId: medication.patient?._id || '',
      medicationName: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
      instructions: medication.instructions || ''
    });
    setShowEditForm(true);
  };

  const handleUpdateMedication = async (e) => {
    e.preventDefault();
    try {
      const medicationData = {
        name: newMedication.medicationName,
        dosage: newMedication.dosage,
        frequency: newMedication.frequency,
        duration: parseInt(newMedication.duration.replace(/\D/g, '')) || 7,
        instructions: newMedication.instructions
      };
      
      await api.put(`/medications/${editingMedication._id}`, medicationData);
      fetchMedications();
      
      setNewMedication({
        patientId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      });
      setShowEditForm(false);
      setEditingMedication(null);
    } catch (error) {
      console.error('Error updating medication:', error);
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    setDeletingMedicationId(medicationId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/medications/${deletingMedicationId}`);
      fetchMedications();
      setShowDeleteModal(false);
      setDeletingMedicationId(null);
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const filteredMedications = medications.filter(med =>
    (med.name || med.medicationName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (med.patient?.name || med.patientName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <DoctorLoading />;

  return (
    <div className="doctor-portal" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div style={{
              background: 'var(--doctor-primary)',
              borderRadius: '20px',
              padding: '2rem',
              color: 'white',
              marginBottom: '2rem',
              boxShadow: 'var(--doctor-shadow-lg)'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '700' }}>Medications & Prescriptions</h2>
                  <p className="mb-0" style={{ opacity: 0.9, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Manage patient medications and prescriptions</p>
                </div>
                <div className="d-none d-lg-flex align-items-center gap-3">
                  <div className="position-relative" style={{ width: '300px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ 
                        paddingLeft: '2.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                    <Search size={18} className="position-absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'white' }} />
                  </div>
                  <button 
                    className="btn"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus size={18} className="me-2" />
                    Add Medication
                  </button>
                </div>
              </div>
              
              {/* Mobile controls */}
              <div className="d-lg-none mt-3">
                <div className="d-flex flex-column gap-2">
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ 
                        paddingLeft: '2.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                    <Search size={18} className="position-absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'white' }} />
                  </div>
                  <button 
                    className="btn"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.75rem 1.5rem',
                      fontWeight: '600'
                    }}
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus size={18} className="me-2" />
                    Add Medication
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Medication Form */}
        {(showAddForm || showEditForm) && (
          <div className="row mb-4">
            <div className="col-12">
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: 'var(--doctor-shadow)'
              }}>
                <h5 className="mb-3" style={{ color: 'var(--doctor-primary)', fontWeight: '600' }}>
                  {showEditForm ? 'Edit Medication' : 'Add New Medication'}
                </h5>
                <form onSubmit={showEditForm ? handleUpdateMedication : handleAddMedication}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Patient</label>
                      <MobileSelect
                        options={[
                          { value: '', label: 'Select Patient' },
                          ...patients.map(patient => ({ value: patient._id, label: patient.name }))
                        ]}
                        value={newMedication.patientId}
                        onChange={(value) => setNewMedication({...newMedication, patientId: value})}
                        placeholder="Select Patient"
                        disabled={showEditForm}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Medication Name</label>
                      <input 
                        type="text"
                        className="form-control"
                        value={newMedication.medicationName}
                        onChange={(e) => setNewMedication({...newMedication, medicationName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Dosage</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="e.g., 500mg"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Frequency</label>
                      <MobileSelect
                        options={[
                          { value: '', label: 'Select Frequency' },
                          { value: 'Once daily', label: 'Once daily' },
                          { value: 'Twice daily', label: 'Twice daily' },
                          { value: 'Three times daily', label: 'Three times daily' },
                          { value: 'Four times daily', label: 'Four times daily' },
                          { value: 'As needed', label: 'As needed' }
                        ]}
                        value={newMedication.frequency}
                        onChange={(value) => setNewMedication({...newMedication, frequency: value})}
                        placeholder="Select Frequency"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Duration</label>
                      <input 
                        type="text"
                        className="form-control"
                        placeholder="e.g., 7 days"
                        value={newMedication.duration}
                        onChange={(e) => setNewMedication({...newMedication, duration: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Instructions</label>
                      <textarea 
                        className="form-control"
                        rows="3"
                        placeholder="Special instructions for the patient..."
                        value={newMedication.instructions}
                        onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button 
                      type="submit"
                      className="btn"
                      style={{ background: 'var(--doctor-primary)', color: 'white', border: 'none' }}
                    >
                      {showEditForm ? 'Update Medication' : 'Add Medication'}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setShowAddForm(false);
                        setShowEditForm(false);
                        setEditingMedication(null);
                        setNewMedication({
                          patientId: '',
                          medicationName: '',
                          dosage: '',
                          frequency: '',
                          duration: '',
                          instructions: ''
                        });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Medications List */}
        <div className="row g-3 g-md-4">
          {filteredMedications.length > 0 ? (
            filteredMedications.map((medication) => (
              <div key={medication._id} className="col-12 col-md-6 col-xl-4">
                <div 
                  className="card h-100" 
                  style={{ 
                    border: 'none',
                    borderRadius: '16px',
                    background: 'white',
                    boxShadow: 'var(--doctor-shadow)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    background: 'var(--doctor-primary)',
                    padding: '1rem',
                    color: 'white'
                  }}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          backgroundColor: 'rgba(255,255,255,0.2)'
                        }}
                      >
                        <Pill size={24} />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1" style={{ fontWeight: '600' }}>
                          {medication.name || medication.medicationName}
                        </h6>
                        <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                          {medication.patient?.name || 'Unknown Patient'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: '1.5rem' }}>
                    <div className="mb-3">
                      <div className="row g-2">
                        <div className="col-6">
                          <small className="text-muted d-block">Dosage</small>
                          <strong style={{ fontSize: '0.9rem', color: '#374151' }}>{medication.dosage}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Frequency</small>
                          <strong style={{ fontSize: '0.9rem', color: '#374151' }}>{medication.frequency}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Duration</small>
                          <strong style={{ fontSize: '0.9rem', color: '#374151' }}>{medication.duration}</strong>
                        </div>
                        <div className="col-6">
                          <small className="text-muted d-block">Prescribed</small>
                          <strong style={{ fontSize: '0.9rem', color: '#374151' }}>{medication.createdAt}</strong>
                        </div>
                      </div>
                    </div>

                    {medication.instructions && (
                      <div className="mb-3" style={{
                        background: 'var(--doctor-light)',
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}>
                        <small className="text-muted d-block mb-1">Instructions</small>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151' }}>
                          {medication.instructions}
                        </p>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-sm flex-fill"
                        style={{
                          background: 'white',
                          color: 'var(--doctor-primary)',
                          border: '2px solid var(--doctor-primary)',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}
                        onClick={() => handleEditMedication(medication)}
                      >
                        <Edit size={14} className="me-1" />
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm"
                        style={{
                          background: '#fee2e2',
                          color: 'var(--doctor-critical)',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}
                        onClick={() => handleDeleteMedication(medication._id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: 'var(--doctor-shadow)'
              }}>
                <Pill size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No medications found</h5>
                <p className="text-muted">Start by adding medications for your patients.</p>
                <button 
                  className="btn"
                  style={{ background: 'var(--doctor-primary)', color: 'white', border: 'none' }}
                  onClick={() => setShowAddForm(true)}
                >
                  Add First Medication
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <h5 style={{ color: 'var(--doctor-primary)', marginBottom: '1rem' }}>Confirm Delete</h5>
              <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>Are you sure you want to delete this medication? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingMedicationId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn"
                  style={{ background: '#dc2626', color: 'white', border: 'none' }}
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMedications;