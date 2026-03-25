import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, FileText, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminLoading from '../../../components/loading/AdminLoading';
import Toast from '../../../components/toast/Toast';
import api from '../../../utils/api';
import '../../../styles/admin-theme.css';

const AdminPatients = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log('Fetching patients data...');
        const { data } = await api.get('/admin/patients');
        console.log('Patients API response:', data);
        
        let appointmentsData = { appointments: [] };
        let healthRecordsData = { records: [] };
        
        try {
          const appointmentsResponse = await api.get('/appointments');
          appointmentsData = appointmentsResponse.data;
          console.log('Appointments API response:', appointmentsData);
        } catch (appointmentError) {
          console.error('Error fetching appointments:', appointmentError);
        }
        
        try {
          const healthRecordsResponse = await api.get('/health-records/all');
          healthRecordsData = healthRecordsResponse.data;
          console.log('Health records API response:', healthRecordsData);
        } catch (healthError) {
          console.error('Error fetching health records:', healthError);
        }
        
        const formattedPatients = (data.users || []).map(patient => {
          console.log('Processing patient:', patient);
          
          // Get appointments for this patient
          const patientAppointments = (appointmentsData.appointments || []).filter(apt => {
            const matches = apt.patient?._id === patient._id || 
                           apt.patient?.id === patient._id ||
                           apt.patientId === patient._id;
            return matches;
          });
          
          // Get health records for this patient
          const patientHealthRecords = (healthRecordsData.records || []).filter(record => 
            record.patient?._id === patient._id || record.patient?.id === patient._id
          );
          
          console.log(`Patient ${patient.name} appointments:`, patientAppointments);
          console.log(`Patient ${patient.name} health records:`, patientHealthRecords);
          
          // Calculate total paid from appointments
          const totalPaid = patientAppointments.reduce((sum, apt) => {
            // Check multiple possible field names for payment amount
            const amount = parseFloat(apt.amount) || 
                          parseFloat(apt.consultationFee) || 
                          parseFloat(apt.paymentAmount) || 
                          0;
            console.log(`Appointment for ${patient.name}:`, apt);
            console.log(`Payment amount:`, amount, `Payment status:`, apt.paymentStatus);
            // Count all amounts regardless of payment status for now
            return sum + amount;
          }, 0);
          
          // Determine payment status - if any appointment has payment, consider it paid
          const hasPayments = totalPaid > 0;
          const paymentStatus = hasPayments ? 'paid' : 'pending';
          
          // Get concerns from appointments or patient data
          const appointmentConcerns = patientAppointments
            .map(apt => apt.reason || apt.concern || apt.symptoms)
            .filter(concern => concern && concern.trim() !== '')
            .join(', ');
          
          const patientConcerns = appointmentConcerns || 
                                patient.medicalHistory || 
                                patient.concerns || 
                                patient.reason || 
                                'None';
          
          return {
            id: patient._id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone || 'N/A',
            age: patient.dateOfBirth ? 
              new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 
              (patient.age || 'Not provided'),
            lastVisit: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString() : 'N/A',
            appointments: patientAppointments.length,
            paymentStatus: paymentStatus,
            totalPaid: totalPaid,
            healthRecords: patientHealthRecords.length,
            concerns: patientConcerns,
            flagged: false
          };
        });
        
        console.log('Formatted patients:', formattedPatients);
        setPatients(formattedPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setToast({ message: 'Failed to load patient data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
  };
  
  const handleRemovePatient = async (patientId) => {
    try {
      await api.delete(`/admin/users/${patientId}`);
      setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
      setToast({ message: 'Patient profile removed from system.', type: 'error' });
      if (showModal) {
        setShowModal(false);
        setSelectedPatient(null);
      }
    } catch (error) {
      setToast({ message: 'Failed to remove patient', type: 'error' });
    }
  };

  const handleConfirmPayment = (patientId) => {
    setPatients(prevPatients => 
      prevPatients.map(p => 
        p.id === patientId ? { ...p, paymentStatus: 'paid' } : p
      )
    );
    setToast({ message: 'Payment confirmed and updated.', type: 'success' });
    if (showModal) {
      setShowModal(false);
      setSelectedPatient(null);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <AdminLoading />;

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="admin-text-primary fw-bold mb-2">Patient Management</h2>
            <p className="text-muted">Manage profiles, appointments, payments, and health records</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Activity />
              </div>
              <h3 className="admin-text-primary">{patients.length}</h3>
              <p className="text-muted mb-0">Total Patients</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <DollarSign />
              </div>
              <h3 className="admin-text-primary">${patients.reduce((sum, p) => sum + p.totalPaid, 0)}</h3>
              <p className="text-muted mb-0">Total Revenue</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <FileText />
              </div>
              <h3 className="admin-text-primary">{patients.reduce((sum, p) => sum + p.healthRecords, 0)}</h3>
              <p className="text-muted mb-0">Health Records</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <AlertTriangle />
              </div>
              <h3 className="admin-text-primary">{patients.filter(p => p.flagged).length}</h3>
              <p className="text-muted mb-0">Flagged Patients</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="position-relative">
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="position-absolute end-0 top-50 translate-middle-y me-3" size={18} style={{color: '#10b981'}} />
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="row">
          <div className="col-12">
            <div className="admin-data-table">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Contact</th>
                    <th>Last Visit</th>
                    <th>Appointments</th>
                    <th>Payment Status</th>
                    <th>Health Records</th>
                    <th>Concerns</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <p className="text-muted mb-0">
                          {searchTerm ? 'No patients found matching your search' : 'No patients registered yet'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                    <tr key={patient.id} style={{background: patient.flagged ? '#fef2f2' : 'transparent'}}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div>
                            <h6 className="mb-0">{patient.name}</h6>
                            <small className="text-muted">
                              {typeof patient.age === 'number' ? `${patient.age} years old` : patient.age}
                            </small>
                          </div>
                          {patient.flagged && <AlertTriangle size={16} className="text-danger" />}
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div>{patient.email}</div>
                          <div className="text-muted">{patient.phone}</div>
                        </div>
                      </td>
                      <td>{patient.lastVisit}</td>
                      <td>
                        <span className="admin-badge">{patient.appointments}</span>
                      </td>
                      <td>
                        <div>
                          <span className={`badge ${patient.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                            {patient.paymentStatus}
                          </span>
                          <div className="small text-muted mt-1">${patient.totalPaid}</div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge-light">
                          <FileText size={14} className="me-1" />
                          {patient.healthRecords} records
                        </span>
                      </td>
                      <td>
                        <small>{patient.concerns}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="admin-action-btn admin-action-btn-view btn-sm"
                            onClick={() => handleViewPatient(patient)}
                          >
                            <Eye size={14} />
                          </button>
                          {patient.paymentStatus === 'pending' && (
                            <button 
                              className="admin-action-btn admin-action-btn-approve btn-sm"
                              onClick={() => handleConfirmPayment(patient.id)}
                            >
                              <DollarSign size={14} />
                            </button>
                          )}
                          <button 
                            className="admin-action-btn admin-action-btn-reject btn-sm"
                            onClick={() => handleRemovePatient(patient.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Patient Detail Modal */}
      {showModal && selectedPatient && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Patient Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Name</label>
                    <p className="mb-0">{selectedPatient.name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Age</label>
                    <p className="mb-0">
                      {typeof selectedPatient.age === 'number' ? `${selectedPatient.age} years old` : selectedPatient.age}
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Email</label>
                    <p className="mb-0">{selectedPatient.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Phone</label>
                    <p className="mb-0">{selectedPatient.phone}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Last Visit</label>
                    <p className="mb-0">{selectedPatient.lastVisit}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Total Appointments</label>
                    <p className="mb-0">{selectedPatient.appointments}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Payment Status</label>
                    <p className="mb-0">
                      <span className={`badge ${selectedPatient.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}`}>
                        {selectedPatient.paymentStatus}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Total Paid</label>
                    <p className="mb-0">${selectedPatient.totalPaid}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Health Records</label>
                    <p className="mb-0">{selectedPatient.healthRecords} records</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Concerns</label>
                    <p className="mb-0">{selectedPatient.concerns}</p>
                  </div>
                  {selectedPatient.flagged && (
                    <div className="col-12">
                      <div className="alert alert-warning">
                        <AlertTriangle size={16} className="me-2" />
                        This patient has been flagged for review
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {selectedPatient.paymentStatus === 'pending' && (
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      handleConfirmPayment(selectedPatient.id);
                      handleCloseModal();
                    }}
                  >
                    Confirm Payment
                  </button>
                )}
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    handleRemovePatient(selectedPatient.id);
                    handleCloseModal();
                  }}
                >
                  Remove Patient
                </button>
                <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPatients;