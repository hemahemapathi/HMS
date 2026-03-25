import { useState, useEffect } from 'react';
import { Search, User, Calendar, Phone, Mail, Activity, Heart, Clock, Eye, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const DoctorPatients = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [healthScores, setHealthScores] = useState({});
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [newHealthScore, setNewHealthScore] = useState('');
  const [patientSummary, setPatientSummary] = useState({ medications: [], appointments: [] });
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showScoreMeter, setShowScoreMeter] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get('/doctors/my/patients');
        const patientsData = response.data.patients || [];
        
        const formattedPatients = patientsData.map(patient => ({
          id: patient._id,
          name: patient.name,
          age: patient.age || 'N/A',
          gender: patient.gender || 'male',
          phone: patient.phone || '1234567890',
          email: patient.email,
          lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'No visits',
          nextAppointment: patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : null,
          condition: patient.medicalHistory?.conditions?.[0] || 'General Care'
        }));
        
        setPatients(formattedPatients);
        
        // Fetch health scores for all patients
        const scores = {};
        for (const patient of formattedPatients) {
          try {
            const healthResponse = await api.get(`/health-scores/${patient.id}`);
            const healthScore = healthResponse.data.healthScore;
            scores[patient.id] = healthScore ? healthScore.score : 0;
          } catch (error) {
            scores[patient.id] = 0;
          }
        }
        setHealthScores(scores);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const fetchPatientSummary = async (patientId) => {
    setLoadingSummary(true);
    try {
      const [medicationsRes, appointmentsRes] = await Promise.all([
        api.get(`/medications/patient/${patientId}`).catch(() => ({ data: { medications: [] } })),
        api.get(`/appointments?patientId=${patientId}`).catch(() => ({ data: { appointments: [] } }))
      ]);
      
      setPatientSummary({
        medications: medicationsRes.data?.medications?.slice(0, 3) || [],
        appointments: appointmentsRes.data?.appointments?.slice(0, 3) || []
      });
    } catch (error) {
      console.error('Error fetching patient summary:', error);
      setPatientSummary({ medications: [], appointments: [] });
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleUpdateHealthScore = async () => {
    if (!selectedPatient || !newHealthScore) return;
    
    try {
      const status = newHealthScore >= 80 ? 'Good' : newHealthScore >= 60 ? 'Average' : 'Needs Attention';
      
      await api.post('/health-scores', {
        patientId: selectedPatient.id,
        score: parseInt(newHealthScore),
        status: status
      });
      
      setHealthScores(prev => ({
        ...prev,
        [selectedPatient.id]: parseInt(newHealthScore)
      }));
      
      setShowHealthModal(false);
      setSelectedPatient(null);
      setNewHealthScore('');
    } catch (error) {
      console.error('Error updating health score:', error);
    }
  };

  const handleDeleteHealthScore = async () => {
    if (!selectedPatient) return;
    
    try {
      await api.delete(`/health-scores/${selectedPatient.id}`);
      
      setHealthScores(prev => {
        const updated = { ...prev };
        delete updated[selectedPatient.id];
        return updated;
      });
      
      setShowHealthModal(false);
      setSelectedPatient(null);
      setNewHealthScore('');
    } catch (error) {
      console.error('Error deleting health score:', error);
    }
  };

  if (loading) return <DoctorLoading />;

  return (
    <div className="doctor-portal" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              borderRadius: '20px',
              padding: '1.5rem',
              color: 'white',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
            }}>
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                <div>
                  <h2 className="mb-1" style={{ fontSize: '1.5rem', fontWeight: '700' }}>My Patients</h2>
                  <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.9rem' }}>Manage your assigned patients and their medical records</p>
                </div>
                <div className="position-relative w-100" style={{ maxWidth: '300px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ 
                      paddingLeft: '2.5rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Search size={18} className="position-absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'white' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="row g-3 g-lg-4">
          {filteredPatients.map((patient, index) => (
            <div key={patient.id} className="col-12 col-md-6 col-xl-4">
              <div 
                className="card h-100" 
                style={{ 
                  border: 'none',
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
              >
                {/* Card Header */}
                <div style={{
                  background: `linear-gradient(135deg, ${index % 3 === 0 ? '#0ea5e9, #3b82f6' : index % 3 === 1 ? '#10b981, #059669' : '#f59e0b, #d97706'})`,
                  padding: '1rem',
                  color: 'white'
                }}>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        fontSize: '1.2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1" style={{ fontWeight: '600' }}>
                        {patient.name}
                      </h6>
                      <p className="mb-0" style={{ opacity: 0.9, fontSize: '0.9rem' }}>
                        {patient.age} years • {patient.gender}
                      </p>
                    </div>
                    <div style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Score: {typeof healthScores[patient.id] === 'number' ? healthScores[patient.id] : 0}
                    </div>
                  </div>
                </div>

                <div className="card-body" style={{ padding: '1.5rem' }}>
                  {/* Contact Info */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: '#e0f2fe', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: '0.75rem'
                      }}>
                        <Phone size={14} style={{ color: '#0ea5e9' }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>{patient.phone}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: '#e0f2fe', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: '0.75rem'
                      }}>
                        <Mail size={14} style={{ color: '#0ea5e9' }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>{patient.email}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        background: '#e0f2fe', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: '0.75rem'
                      }}>
                        <Activity size={14} style={{ color: '#0ea5e9' }} />
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#374151' }}>{patient.condition}</span>
                    </div>
                  </div>

                  {/* Health Score & Visit Info */}
                  <div className="mb-3" style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="d-flex align-items-center justify-content-center mb-1">
                          <Heart size={14} style={{ 
                            color: (healthScores[patient.id] || 0) >= 80 ? '#059669' : 
                                   (healthScores[patient.id] || 0) >= 60 ? '#f59e0b' : '#dc2626',
                            marginRight: '0.25rem' 
                          }} />
                          <small className="text-muted">Health</small>
                        </div>
                        <strong style={{ 
                          fontSize: '1.2rem', 
                          color: typeof healthScores[patient.id] === 'number' && healthScores[patient.id] >= 80 ? '#059669' : 
                                 typeof healthScores[patient.id] === 'number' && healthScores[patient.id] >= 60 ? '#f59e0b' : '#dc2626'
                        }}>
                          {typeof healthScores[patient.id] === 'number' ? healthScores[patient.id] : 0}
                        </strong>
                      </div>
                      <div className="col-4">
                        <div className="d-flex align-items-center justify-content-center mb-1">
                          <Clock size={14} style={{ color: '#6b7280', marginRight: '0.25rem' }} />
                          <small className="text-muted">Last Visit</small>
                        </div>
                        <strong style={{ fontSize: '0.8rem', color: '#374151' }}>No visits</strong>
                      </div>
                      <div className="col-4">
                        <div className="d-flex align-items-center justify-content-center mb-1">
                          <Calendar size={14} style={{ color: '#6b7280', marginRight: '0.25rem' }} />
                          <small className="text-muted">Next</small>
                        </div>
                        <strong style={{ fontSize: '0.8rem', color: '#374151' }}>Not scheduled</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <Link 
                      to={`/doctor/patients/${patient.id}`}
                      className="btn btn-sm flex-fill"
                      style={{ 
                        background: '#0ea5e9',
                        color: 'white', 
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        padding: '0.5rem 1rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Eye size={14} className="me-1" />
                      View Details
                    </Link>
                    <button 
                      className="btn btn-sm flex-fill"
                      style={{
                        background: 'white',
                        color: '#0ea5e9',
                        border: '2px solid #0ea5e9',
                        borderRadius: '8px',
                        fontWeight: '600',
                        padding: '0.5rem 1rem'
                      }}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setNewHealthScore(healthScores[patient.id]?.toString() || '');
                        setShowScoreMeter(false);
                        setShowHealthModal(true);
                      }}
                    >
                      <Heart size={14} className="me-1" />
                      Health Score
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPatients.length === 0 && (
          <div className="text-center py-5">
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
            }}>
              <User size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No patients found</h5>
              <p className="text-muted">Try adjusting your search criteria.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="btn"
                style={{ 
                  background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                  color: 'white', 
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.5rem'
                }}
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Health Score Modal */}
      {showHealthModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
              {!showScoreMeter ? (
                // Summary View
                <>
                  <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                    <h5 className="modal-title">Patient Health Summary</h5>
                    <button 
                      type="button" 
                      className="btn-close btn-close-white" 
                      onClick={() => setShowHealthModal(false)}
                    ></button>
                  </div>
                  
                  <div className="modal-body" style={{ padding: '2rem' }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                          <strong>Name:</strong> {selectedPatient?.name}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                          <strong>Age:</strong> {selectedPatient?.age} years
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                          <strong>Gender:</strong> {selectedPatient?.gender}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                          <strong>Current Score:</strong> 
                          <span style={{ 
                            color: (healthScores[selectedPatient?.id] || 0) >= 80 ? '#059669' : 
                                   (healthScores[selectedPatient?.id] || 0) >= 60 ? '#f59e0b' : '#dc2626',
                            fontWeight: 'bold',
                            marginLeft: '0.5rem'
                          }}>
                            {healthScores[selectedPatient?.id] || 0}/100
                          </span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                          <strong>Status:</strong> 
                          <span style={{ 
                            color: (healthScores[selectedPatient?.id] || 0) >= 80 ? '#059669' : 
                                   (healthScores[selectedPatient?.id] || 0) >= 60 ? '#f59e0b' : '#dc2626',
                            fontWeight: 'bold',
                            marginLeft: '0.5rem'
                          }}>
                            {(healthScores[selectedPatient?.id] || 0) >= 80 ? 'Excellent' : 
                             (healthScores[selectedPatient?.id] || 0) >= 60 ? 'Good' : 'Needs Attention'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer" style={{ borderTop: 'none', padding: '1rem 2rem 2rem' }}>
                    <button 
                      className="btn btn-primary me-2"
                      onClick={() => setShowScoreMeter(true)}
                      style={{ background: '#0ea5e9', border: 'none', borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                    >
                      Update Score
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowHealthModal(false)}
                      style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                // Score Meter View
                <>
                  <div className="modal-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                    <button 
                      className="btn btn-sm btn-light me-2"
                      onClick={() => setShowScoreMeter(false)}
                      style={{ borderRadius: '6px' }}
                    >
                      ← Back
                    </button>
                    <h5 className="modal-title">Update Health Score</h5>
                    <button 
                      type="button" 
                      className="btn-close btn-close-white" 
                      onClick={() => setShowHealthModal(false)}
                    ></button>
                  </div>
                  
                  <div className="modal-body" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div className="score-display mb-4">
                      <div style={{ 
                        fontSize: '4rem', 
                        fontWeight: 'bold',
                        color: (newHealthScore || 0) >= 80 ? '#059669' : 
                               (newHealthScore || 0) >= 60 ? '#f59e0b' : '#dc2626'
                      }}>
                        {newHealthScore || 0}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '1.2rem' }}>out of 100</div>
                    </div>
                    
                    <div className="slider-container mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={newHealthScore || 0}
                        onChange={(e) => setNewHealthScore(e.target.value)}
                        className="form-range"
                        style={{ width: '100%' }}
                      />
                    </div>
                    
                    <div className="score-labels d-flex justify-content-between" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                      <span style={{ color: (newHealthScore || 0) < 60 ? '#dc2626' : '#6b7280', fontWeight: (newHealthScore || 0) < 60 ? 'bold' : 'normal' }}>
                        Poor (0-59)
                      </span>
                      <span style={{ color: (newHealthScore || 0) >= 60 && (newHealthScore || 0) < 80 ? '#f59e0b' : '#6b7280', fontWeight: (newHealthScore || 0) >= 60 && (newHealthScore || 0) < 80 ? 'bold' : 'normal' }}>
                        Good (60-79)
                      </span>
                      <span style={{ color: (newHealthScore || 0) >= 80 ? '#059669' : '#6b7280', fontWeight: (newHealthScore || 0) >= 80 ? 'bold' : 'normal' }}>
                        Excellent (80-100)
                      </span>
                    </div>
                  </div>
                  
                  <div className="modal-footer" style={{ borderTop: 'none', padding: '1rem 2rem 2rem' }}>
                    <button 
                      className="btn btn-success me-2"
                      onClick={handleUpdateHealthScore}
                      style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                    >
                      Save Score
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setShowScoreMeter(false)}
                      style={{ borderRadius: '8px', padding: '0.5rem 1.5rem' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;