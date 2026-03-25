import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, 
  Activity, Star, Pill, FileText, CreditCard, Heart
} from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const PatientDetail = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [healthScore, setHealthScore] = useState(0);
  const [showTabModal, setShowTabModal] = useState(false);

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      console.log('Fetching patient details for ID:', id);
      const appointmentsResponse = await api.get('/appointments');
      console.log('Appointments response:', appointmentsResponse.data);
      const appointments = appointmentsResponse.data?.appointments || [];
      
      const patientAppointments = appointments.filter(apt => 
        apt.patient?._id === id || apt.patient?.id === id
      );
      
      console.log('Patient appointments found:', patientAppointments.length);
      
      if (patientAppointments.length === 0) {
        console.log('No appointments found for patient ID:', id);
        setPatient(null);
        return;
      }
      
      const patientData = patientAppointments[0].patient;
      console.log('Patient data:', patientData);
      
      // Get health score
      try {
        console.log('Fetching health score for patient:', id);
        const healthResponse = await api.get(`/health-scores/${id}`);
        const healthScore = healthResponse.data.healthScore;
        setHealthScore(healthScore ? healthScore.score : 0);
        console.log('Health score:', healthScore ? healthScore.score : 0);
      } catch (error) {
        console.log('No health score found:', error.response?.data || error.message);
        setHealthScore(0);
      }
      
      // Fetch medications
      let medications = [];
      try {
        console.log('Fetching medications for patient:', id);
        const medicationsResponse = await api.get(`/medications/patient/${id}`);
        medications = medicationsResponse.data?.medications || [];
        console.log('Medications found:', medications.length);
      } catch (error) {
        console.log('No medications found:', error.response?.data || error.message);
      }
      
      // Fetch reviews
      let reviews = [];
      try {
        console.log('Fetching reviews for patient:', id);
        const reviewsResponse = await api.get(`/reviews/patient/${id}`);
        reviews = reviewsResponse.data?.reviews || [];
        console.log('Reviews found:', reviews.length);
      } catch (error) {
        console.log('No reviews found:', error.response?.data || error.message);
      }
      
      // Fetch health records
      let healthRecords = [];
      try {
        console.log('Fetching health records for patient:', id);
        const recordsResponse = await api.get(`/health-records/patient/${id}`);
        healthRecords = recordsResponse.data?.healthRecords || [];
        console.log('Health records found:', healthRecords.length);
      } catch (error) {
        console.log('No health records found:', error.response?.data || error.message);
      }
      
      const formattedPatient = {
        id: patientData._id || patientData.id,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone || '1234567890',
        appointments: patientAppointments.map(apt => ({
          id: apt._id,
          date: new Date(apt.date).toLocaleDateString(),
          time: apt.time,
          reason: apt.reason || 'General consultation',
          status: apt.status,
          fee: apt.consultationFee,
          notes: apt.notes || 'No notes available'
        })),
        medications: medications.map(med => ({
          id: med._id,
          name: med.name,
          dosage: med.dosage,
          frequency: med.scheduledTime || 'As needed',
          duration: med.status || 'Active'
        })),
        reviews: reviews.map(review => ({
          id: review._id,
          rating: review.rating,
          comment: review.comment,
          date: new Date(review.createdAt).toLocaleDateString()
        })),
        healthRecords: healthRecords.map(record => ({
          id: record._id,
          type: record.recordType || record.title || 'Medical Record',
          date: new Date(record.createdAt).toLocaleDateString(),
          result: record.description || 'Normal',
          notes: record.doctorNotes || 'No additional notes'
        })),
        payments: patientAppointments.map(apt => ({
          id: apt._id,
          date: new Date(apt.date).toLocaleDateString(),
          amount: apt.consultationFee,
          status: apt.paymentStatus || 'pending',
          description: `Consultation - ${apt.reason}`
        }))
      };
      
      setPatient(formattedPatient);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#059669'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#dc2626'; // Red
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        style={{
          color: index < rating ? '#fbbf24' : '#e5e7eb',
          fill: index < rating ? '#fbbf24' : 'none'
        }}
      />
    ));
  };

  if (loading) return <DoctorLoading />;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="doctor-portal" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            {/* Desktop Header */}
            <div className="d-none d-lg-block" style={{
              background: 'white',
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: 'var(--doctor-shadow-lg)'
            }}>
              <Link 
                to="/doctor/patients" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--doctor-primary)',
                  textDecoration: 'none',
                  marginBottom: '1.5rem',
                  fontWeight: '600',
                  padding: '0.5rem 1rem',
                  borderRadius: '10px',
                  background: 'var(--doctor-light)'
                }}
              >
                <ArrowLeft size={20} />
                Back to Patients
              </Link>
              
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--doctor-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '700',
                  boxShadow: 'var(--doctor-shadow-lg)',
                  flexShrink: 0
                }}>
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ 
                    margin: 0, 
                    fontSize: '1.75rem', 
                    color: '#1f2937',
                    fontWeight: '700',
                    marginBottom: '0.5rem'
                  }}>
                    {patient.name}
                  </h1>
                  <div className="d-flex gap-3">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={16} style={{ color: 'var(--doctor-primary)' }} />
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{patient.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={16} style={{ color: 'var(--doctor-primary)' }} />
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{patient.email}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  background: 'white',
                  border: `3px solid ${getHealthScoreColor(healthScore)}`,
                  borderRadius: '16px',
                  padding: '1rem',
                  textAlign: 'center',
                  minWidth: '120px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <Heart size={20} style={{ color: getHealthScoreColor(healthScore), marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: getHealthScoreColor(healthScore) }}>
                      {healthScore}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>Health Score</p>
                </div>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="d-lg-none" style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              borderRadius: '0 0 20px 20px',
              padding: '1rem',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <Link 
                to="/doctor/patients" 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  textDecoration: 'none',
                  marginBottom: '1rem',
                  fontWeight: '600',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.2)'
                }}
              >
                <ArrowLeft size={18} />
                Back
              </Link>
              
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  {patient.name.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
                    {patient.name}
                  </h2>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                    {patient.phone} • {patient.email}
                  </div>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {healthScore}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Health Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-none d-lg-flex" style={{
              background: 'white',
              borderRadius: '16px',
              padding: '0.5rem',
              gap: '0.5rem',
              boxShadow: 'var(--doctor-shadow)'
            }}>
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'medications', label: 'Medications' },
                { key: 'records', label: 'Health Records' },
                { key: 'reviews', label: 'Reviews' },
                { key: 'payments', label: 'Payments' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '12px',
                    background: activeTab === tab.key ? 'var(--doctor-primary)' : 'transparent',
                    color: activeTab === tab.key ? 'white' : 'var(--doctor-text)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* Mobile Tab Button */}
            <div className="d-lg-none">
              <button 
                className="btn w-100 d-flex justify-content-between align-items-center"
                style={{
                  background: 'white',
                  border: '2px solid var(--doctor-primary)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  fontWeight: '600',
                  color: 'var(--doctor-text)'
                }}
                onClick={() => setShowTabModal(true)}
              >
                <span>{[
                  { key: 'overview', label: 'Overview' },
                  { key: 'medications', label: 'Medications' },
                  { key: 'records', label: 'Health Records' },
                  { key: 'reviews', label: 'Reviews' },
                  { key: 'payments', label: 'Payments' }
                ].find(tab => tab.key === activeTab)?.label}</span>
                <span>▼</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            {activeTab === 'overview' && (
              <div className="row g-3 g-lg-4">
                {patient.appointments.map((appointment) => (
                  <div key={appointment.id} className="col-12 col-lg-6">
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: 'var(--doctor-shadow)'
                    }}>
                      <h6 style={{ color: 'var(--doctor-primary)', marginBottom: '1rem' }}>
                        {appointment.reason}
                      </h6>
                      <p><strong>Date:</strong> {appointment.date} at {appointment.time}</p>
                      <p><strong>Status:</strong> <span style={{ 
                        color: appointment.status === 'completed' ? 'var(--doctor-success)' : 'var(--doctor-warning)' 
                      }}>{appointment.status}</span></p>
                      <p><strong>Fee:</strong> ${appointment.fee}</p>
                      <p><strong>Notes:</strong> {appointment.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="row g-3 g-lg-4">
                {patient.medications.map((medication) => (
                  <div key={medication.id} className="col-12 col-lg-6">
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: 'var(--doctor-shadow)',
                      borderLeft: '4px solid var(--doctor-primary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <Pill size={24} style={{ color: 'var(--doctor-primary)', marginRight: '0.75rem' }} />
                        <h6 style={{ margin: 0, color: 'var(--doctor-text)' }}>{medication.name}</h6>
                      </div>
                      <p><strong>Dosage:</strong> {medication.dosage}</p>
                      <p><strong>Frequency:</strong> {medication.frequency}</p>
                      <p><strong>Duration:</strong> {medication.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'records' && (
              <div className="row g-3 g-lg-4">
                {patient.healthRecords.map((record) => (
                  <div key={record.id} className="col-12 col-lg-6">
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: 'var(--doctor-shadow)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <FileText size={24} style={{ color: 'var(--doctor-primary)', marginRight: '0.75rem' }} />
                        <h6 style={{ margin: 0, color: 'var(--doctor-text)' }}>{record.type}</h6>
                      </div>
                      <p><strong>Date:</strong> {record.date}</p>
                      <p><strong>Result:</strong> <span style={{ color: 'var(--doctor-success)' }}>{record.result}</span></p>
                      <p><strong>Notes:</strong> {record.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="row g-3 g-lg-4">
                {patient.reviews.map((review) => (
                  <div key={review.id} className="col-12 col-lg-6">
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: 'var(--doctor-shadow)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h6 style={{ margin: 0, color: 'var(--doctor-text)' }}>Patient Review</h6>
                        <div style={{ display: 'flex' }}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p style={{ fontStyle: 'italic', color: '#6b7280' }}>"{review.comment}"</p>
                      <small style={{ color: '#9ca3af' }}>{review.date}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="row g-3 g-lg-4">
                {patient.payments.map((payment) => (
                  <div key={payment.id} className="col-12 col-lg-6">
                    <div style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: 'var(--doctor-shadow)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <CreditCard size={24} style={{ color: 'var(--doctor-primary)', marginRight: '0.75rem' }} />
                        <h6 style={{ margin: 0, color: 'var(--doctor-text)' }}>${payment.amount}</h6>
                      </div>
                      <p><strong>Date:</strong> {payment.date}</p>
                      <p><strong>Status:</strong> <span style={{ 
                        color: payment.status === 'paid' ? 'var(--doctor-success)' : 'var(--doctor-warning)' 
                      }}>{payment.status}</span></p>
                      <p><strong>Description:</strong> {payment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Mobile Tab Selection Modal */}
      {showTabModal && (
        <div className="modal show d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-dialog" style={{ maxWidth: '350px', width: '90%', margin: 0 }}>
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header" style={{ background: 'var(--doctor-primary)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">Select Section</h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowTabModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                {[
                  { key: 'overview', label: 'Overview', icon: '📋' },
                  { key: 'medications', label: 'Medications', icon: '💊' },
                  { key: 'records', label: 'Health Records', icon: '📄' },
                  { key: 'reviews', label: 'Reviews', icon: '⭐' },
                  { key: 'payments', label: 'Payments', icon: '💳' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`btn w-100 text-start border-0 d-flex align-items-center gap-3 ${activeTab === tab.key ? 'bg-primary text-white' : 'btn-light'}`}
                    style={{ padding: '1rem', borderRadius: '0' }}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setShowTabModal(false);
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;