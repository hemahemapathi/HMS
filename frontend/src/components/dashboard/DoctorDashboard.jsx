import { useState, useEffect } from 'react';
import { 
  Stethoscope, Heart, Activity, Users, Calendar, Clock, 
  FileText, AlertCircle, Pill, Microscope, Brain, Eye,
  Thermometer, Zap, Shield, TrendingUp, MessageCircle, Star
} from 'lucide-react';
import DoctorLoading from '../loading/DoctorLoading';
import api from '../../utils/api';

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [healthScores, setHealthScores] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentMedications, setRecentMedications] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    vitals: {
      patientsToday: 0,
      totalAppointments: 0,
      pendingReviews: 0,
      completedConsults: 0
    },
    schedule: [],
    labResults: [],
    notifications: [],
    approvalPending: false,
    doctorInfo: {
      name: 'Dr. Clinical Dashboard',
      specialization: 'Internal Medicine • Cardiology'
    },
    reviews: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data...');
        
        let doctorInfo = {
          name: 'Dr. Clinical Dashboard',
          specialization: 'General Medicine'
        };
        
        // Get current user info
        let userData = null;
        try {
          const userResponse = await api.get('/auth/profile');
          userData = userResponse.data?.user || userResponse.data;
          setCurrentUser(userData);
          console.log('Current user data:', userData); // Debug log
          
          if (userData && userData.name) {
            doctorInfo = {
              name: `Dr. ${userData.name}`,
              specialization: userData.specialization || 'General Medicine'
            };
            console.log('Doctor info set:', doctorInfo);
          }
        } catch (userError) {
          console.error('Error fetching user profile:', userError.response?.data || userError.message);
        }
        
        // Fetch appointments
        const appointmentsResponse = await api.get('/appointments');
        console.log('Appointments response:', appointmentsResponse.data);
        const appointments = appointmentsResponse.data?.appointments || [];
        // Sort by most recent first and take first 5
        const sortedAppointments = appointments.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setRecentAppointments(sortedAppointments.slice(0, 5));
        
        // Fetch medications
        try {
          const medicationsResponse = await api.get('/medications/all');
          const medications = medicationsResponse.data?.medications || [];
          // Sort by most recent first and take first 5
          const sortedMedications = medications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentMedications(sortedMedications.slice(0, 5));
        } catch (medError) {
          console.error('Error fetching medications:', medError);
        }
        
        // Fetch patients and health scores
        const patientsResponse = await api.get('/doctors/my/patients');
        console.log('Patients response:', patientsResponse.data);
        const patients = patientsResponse.data?.patients || [];
        
        // Fetch health scores for all patients
        const scores = {};
        for (const patient of patients) {
          try {
            const healthResponse = await api.get(`/health-scores/${patient._id}`);
            const healthScore = healthResponse.data.healthScore;
            // Ensure we only store numbers, never objects
            scores[patient._id] = (healthScore && typeof healthScore.score === 'number') ? healthScore.score : 0;
          } catch (error) {
            scores[patient._id] = 0;
          }
        }
        setHealthScores(scores);
        
        // Fetch reviews
        let reviews = [];
        try {
          const reviewsResponse = await api.get('/reviews/doctor');
          reviews = reviewsResponse.data?.reviews || [];
          console.log('Reviews fetched:', reviews.length);
        } catch (reviewError) {
          console.error('Error fetching reviews:', reviewError.response?.data || reviewError.message);
        }
        
        console.log('Processed appointments:', appointments.length);
        console.log('Processed patients:', patients.length);
        
        // If no appointments exist, show a helpful message
        if (appointments.length === 0) {
          console.log('No appointments found for this doctor. Make sure to create appointments with the correct doctor ID.');
        }
        
        // Process data
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log('Today date string:', todayDateString);
        console.log('All appointments:', appointments);
        
        const todayAppointments = appointments.filter(apt => {
          const appointmentDate = new Date(apt.date).toISOString().split('T')[0];
          console.log('Appointment date:', appointmentDate, 'vs Today:', todayDateString);
          return appointmentDate === todayDateString;
        });
        
        console.log('Today appointments:', todayAppointments);
        
        const completedToday = appointments.filter(apt => {
          const appointmentDate = new Date(apt.date).toISOString().split('T')[0];
          return appointmentDate === todayDateString && apt.status === 'completed';
        });
        
        // Format schedule data
        const scheduleData = todayAppointments.map(apt => ({
          id: apt._id,
          time: apt.time || 'No time specified',
          patient: apt.patient?.name || 'Unknown Patient',
          condition: apt.reason || 'General Consultation',
          urgency: apt.status === 'confirmed' ? 'routine' : apt.status || 'pending'
        }));
        
        setDashboardData({
          vitals: {
            patientsToday: todayAppointments.length,
            totalAppointments: appointments.length,
            pendingReviews: appointments.filter(apt => apt.status === 'pending').length,
            completedConsults: completedToday.length
          },
          schedule: scheduleData,
          labResults: [],
          notifications: [],
          approvalPending: false,
          doctorInfo: {
            ...doctorInfo,
            profileImage: userData?.profileImage || null
          },
          reviews: reviews,
          patients: patients
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Set error state or show user-friendly message
        if (error.response?.status === 401) {
          console.error('Authentication required - user may need to log in');
        } else if (error.response?.status === 403) {
          console.error('Access forbidden - user may not have doctor role');
          
          // Check if it's the approval issue
          if (error.response?.data?.message?.includes('not approved')) {
            setDashboardData(prev => ({
              ...prev,
              approvalPending: true
            }));
          }
        }
        
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <DoctorLoading />;

  // Show approval pending message
  if (dashboardData.approvalPending) {
    return (
      <div className="clinical-workspace">
        <div className="approval-pending">
          <div className="approval-message">
            <AlertCircle size={48} className="approval-icon" />
            <h3>Account Approval Pending</h3>
            <p>Your doctor account is pending approval from the administrator.</p>
            <p>Please contact the admin to approve your account to access the dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clinical-workspace doctor-portal">
      {/* Medical Header */}
      <div className="medical-header d-none d-lg-block">
        <div className="header-content">
          <div className="doctor-info">
            
            <div>
              <h3 className="doctor-name">{currentUser?.name ? `Dr. ${currentUser.name}` : 'Dr. Clinical Dashboard'}</h3>
              <p className="specialty">{currentUser?.specialization || 'Internal Medicine • Cardiology'}</p>
            </div>
          </div>
          <div className="header-stats d-none d-md-flex">
            <div className="stat-pill">
              <Heart className="stat-icon" size={16} />
              <span>{dashboardData.vitals.patientsToday} Patients Today</span>
            </div>
            <div className="stat-pill">
              <Calendar className="stat-icon" size={16} />
              <span>{dashboardData.vitals.totalAppointments} Appointments</span>
            </div>
          </div>
          <div className="d-md-none">
            <div className="row g-1">
              <div className="col-6">
                <div className="stat-pill" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  <Heart className="stat-icon" size={14} />
                  <span>{dashboardData.vitals.patientsToday} Today</span>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-pill" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  <Calendar className="stat-icon" size={14} />
                  <span>{dashboardData.vitals.totalAppointments} Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="d-lg-none" style={{ background: '#0ea5e9', padding: '1rem', borderRadius: '0 0 20px 20px', marginBottom: '1rem' }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
              {currentUser?.profileImage ? (
                <img 
                  src={currentUser.profileImage} 
                  alt="Doctor" 
                  style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: 'bold' 
                }}>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
                </div>
              )}
            </div>
            <div>
              <h5 style={{ color: 'white', margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>{dashboardData.doctorInfo?.name || 'Dr. Dashboard'}</h5>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.8rem' }}>{dashboardData.doctorInfo?.specialization || 'General Medicine'}</p>
            </div>
          </div>
        </div>
        <div className="row g-2">
          <div className="col-6">
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{dashboardData.vitals.patientsToday}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Patients Today</div>
            </div>
          </div>
          <div className="col-6">
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{dashboardData.vitals.totalAppointments}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>Total Appointments</div>
            </div>
          </div>
        </div>
      </div>

      <div className="clinical-layout">
        {/* Medical Sidebar */}
        <div className="medical-sidebar d-none d-lg-block">
          <div className="sidebar-section">
            <h6 className="section-title">Clinical Overview</h6>
            <div className="nav-items">
              <div 
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Activity size={18} />
                <span>Patient Vitals</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
                onClick={() => setActiveTab('schedule')}
              >
                <Calendar size={18} />
                <span>Today's Schedule</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={18} />
                <span>Patient Reviews</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'scores' ? 'active' : ''}`}
                onClick={() => setActiveTab('scores')}
              >
                <Heart size={18} />
                <span>Score Details</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <Calendar size={18} />
                <span>All Appointments</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'medications' ? 'active' : ''}`}
                onClick={() => setActiveTab('medications')}
              >
                <Pill size={18} />
                <span>All Medications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Clinical Overview Toggle */}
        <div className="d-lg-none mb-3">
          <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <button 
              className="btn d-flex justify-content-between align-items-center"
              style={{ background: '#0ea5e9', color: 'white', border: 'none', padding: '0.75rem 1rem', fontWeight: '600', width: '80%', margin: '0 auto' }}
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <span>Clinical Overview</span>
              <span style={{ fontSize: '1.2rem' }}>{showMobileMenu ? '▲' : '▼'}</span>
            </button>
            {showMobileMenu && (
              <div style={{ padding: '1rem' }}>
                <div className="row g-2">
                  <div className="col-6">
                    <button 
                      className={`btn w-100 ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab('overview'); setShowMobileMenu(false); }}
                    >
                      <Activity size={16} className="mb-1" /><br />Vitals
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className={`btn w-100 ${activeTab === 'schedule' ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab('schedule'); setShowMobileMenu(false); }}
                    >
                      <Calendar size={16} className="mb-1" /><br />Schedule
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className={`btn w-100 ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab('reviews'); setShowMobileMenu(false); }}
                    >
                      <Star size={16} className="mb-1" /><br />Reviews
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className={`btn w-100 ${activeTab === 'scores' ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab('scores'); setShowMobileMenu(false); }}
                    >
                      <Heart size={16} className="mb-1" /><br />Scores
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className={`btn w-100 ${activeTab === 'appointments' ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab('appointments'); setShowMobileMenu(false); }}
                    >
                      <Calendar size={16} className="mb-1" /><br />Appointments
                    </button>
                  </div>
                  <div className="col-6">
                    <button 
                      className={`btn w-100 ${activeTab === 'medications' ? 'btn-primary' : 'btn-outline-primary'}`}
                      style={{ borderRadius: '10px', fontSize: '0.8rem' }}
                      onClick={() => { setActiveTab('medications'); setShowMobileMenu(false); }}
                    >
                      <Pill size={16} className="mb-1" /><br />Medications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Clinical Content */}
        <div className="clinical-main">
          {/* Medical Metrics Grid */}
          <div className="row">
            <div className="col-6 col-lg-3 mb-3">
              <div className="metric-card primary">
                <div className="metric-icon">
                  <Users size={24} />
                </div>
                <div className="metric-data">
                  <h3>{dashboardData.vitals.patientsToday}</h3>
                  <p>Patients Today</p>
                </div>
                <div className="metric-trend positive">
                  {dashboardData.vitals.patientsToday > 0 ? '+' + dashboardData.vitals.patientsToday + ' today' : 'No appointments today'}
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 mb-3">
              <div className="metric-card primary">
                <div className="metric-icon">
                  <Calendar size={24} />
                </div>
                <div className="metric-data">
                  <h3>{dashboardData.vitals.totalAppointments}</h3>
                  <p>Total Appointments</p>
                </div>
                <div className="metric-trend positive">
                  {dashboardData.vitals.totalAppointments > 0 ? 'Total scheduled' : 'No appointments'}
                </div>
              </div>
            </div>

            <div className="col-6 col-lg-3 mb-3">
              <div className="metric-card success">
                <div className="metric-icon">
                  <Shield size={24} />
                </div>
                <div className="metric-data">
                  <h3>{dashboardData.vitals.completedConsults}</h3>
                  <p>Completed Today</p>
                </div>
                <div className="metric-trend positive">On track</div>
              </div>
            </div>

            <div className="col-6 col-lg-3 mb-3">
              <div className="metric-card primary">
                <div className="metric-icon">
                  <Heart size={24} />
                </div>
                <div className="metric-data">
                  <h3>{Object.keys(healthScores).length}</h3>
                  <p>Health Scores</p>
                </div>
                <div className="metric-trend positive">
                  <button 
                    className="action-btn" 
                    style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                    onClick={() => window.location.href = '/doctor/patients'}
                  >
                    View All Scores
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Content Tabs */}
          <div className="clinical-content">
            {activeTab === 'overview' && (
              <div className="content-grid">
                {/* Patient Schedule Timeline */}
                <div className="clinical-panel">
                  <div className="panel-header">
                    <h5><Clock size={20} /> Today's Patient Schedule</h5>
                  </div>
                  <div className="timeline">
                    {dashboardData.schedule.length > 0 ? (
                      dashboardData.schedule.map((appointment) => (
                        <div key={appointment.id} className={`timeline-item ${appointment.urgency}`}>
                          <div className="timeline-time">{appointment.time}</div>
                          <div className="timeline-content">
                            <h6>{appointment.patient}</h6>
                            <p>{appointment.condition}</p>
                            <span className={`urgency-badge ${appointment.urgency}`}>
                              {appointment.urgency}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data">
                        <p>No appointments scheduled for today</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lab Results Panel */}
                <div className="clinical-panel">
                  <div className="panel-header">
                    <h5><Microscope size={20} /> Recent Lab Results</h5>
                  </div>
                  <div className="lab-results">
                    {dashboardData.labResults.length > 0 ? (
                      dashboardData.labResults.map((result) => (
                        <div key={result.id} className={`lab-item ${result.status}`}>
                          <div className="lab-patient">{result.patient}</div>
                          <div className="lab-test">{result.test}</div>
                          <div className={`lab-status ${result.status}`}>
                            {result.status === 'abnormal' && <AlertCircle size={16} />}
                            {result.status === 'normal' && <Shield size={16} />}
                            {result.status === 'pending' && <Clock size={16} />}
                            {result.status}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data">
                        <p>No lab results available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="schedule-view">
                <div className="clinical-panel">
                  <div className="panel-header">
                    <h5><Calendar size={20} /> Full Schedule</h5>
                  </div>
                  <div className="schedule-list">
                    {dashboardData.schedule.length > 0 ? (
                      dashboardData.schedule.map((appointment) => (
                        <div key={appointment.id} className="schedule-item">
                          <div className="schedule-time">{appointment.time}</div>
                          <div className="schedule-details">
                            <h6>{appointment.patient}</h6>
                            <p>{appointment.condition}</p>
                            <span className={`status-badge ${appointment.urgency}`}>
                              {appointment.urgency}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-data">
                        <p>No appointments scheduled for today</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="clinical-panel">
                <div className="panel-header">
                  <h5><Star size={20} /> Recent Patient Reviews</h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {dashboardData.reviews?.length > 0 ? (
                    dashboardData.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} style={{
                        background: 'var(--doctor-light)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderLeft: '4px solid var(--doctor-primary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h6 style={{ margin: 0, color: 'var(--doctor-text)', fontWeight: '600' }}>
                            {review.patient?.name || 'Anonymous Patient'}
                          </h6>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={14}
                                style={{
                                  color: i < review.rating ? '#fbbf24' : '#e5e7eb',
                                  fill: i < review.rating ? '#fbbf24' : 'none'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                          "{review.comment}"
                        </p>
                        <small style={{ color: '#9ca3af' }}>{new Date(review.createdAt || review.date).toLocaleDateString()}</small>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No patient reviews available yet</p>
                    </div>
                  )}
                  <button 
                    className="action-btn" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    onClick={() => window.location.href = '/doctor/reviews'}
                  >
                    <Star size={16} />
                    <span>View All Reviews</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'scores' && (
              <div className="clinical-panel">
                <div className="panel-header">
                  <h5><Heart size={20} /> Recent Health Score Updates</h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {Object.entries(healthScores).slice(0, 3).map(([patientId, score], index) => {
                    const patient = dashboardData.patients?.find(p => p._id === patientId);
                    // Force score to be a number
                    const numericScore = Number(score) || 0;
                    return (
                      <div key={`score-${patientId}-${index}`} style={{
                        background: 'var(--doctor-light)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderLeft: '4px solid var(0-doctor-primary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h6 style={{ margin: 0, color: 'var(--doctor-text)', fontWeight: '600' }}>
                            {patient?.name || 'Unknown Patient'}
                          </h6>
                          <small className="text-muted">Updated recently</small>
                        </div>
                        <div style={{
                          background: numericScore >= 80 ? '#059669' : numericScore >= 60 ? '#f59e0b' : '#dc2626',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '1.1rem'
                        }}>
                          {numericScore}
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(healthScores).length === 0 && (
                    <div className="no-data">
                      <p>No health scores available yet</p>
                    </div>
                  )}
                  <button 
                    className="action-btn" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    onClick={() => window.location.href = '/doctor/health-scores'}
                  >
                    <Heart size={16} />
                    <span>View All Scores</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="clinical-panel">
                <div className="panel-header">
                  <h5><Calendar size={20} /> Recent Appointments</h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {recentAppointments.length > 0 ? (
                    recentAppointments.map((appointment) => (
                      <div key={appointment._id} style={{
                        background: 'var(--doctor-light)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderLeft: '4px solid var(--doctor-primary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h6 style={{ margin: 0, color: 'var(--doctor-text)', fontWeight: '600' }}>
                            {appointment.patient?.name || 'Unknown Patient'}
                          </h6>
                          <span style={{
                            background: appointment.status === 'completed' ? '#10b98120' : appointment.status === 'cancelled' ? '#ef444420' : '#f59e0b20',
                            color: appointment.status === 'completed' ? '#10b981' : appointment.status === 'cancelled' ? '#ef4444' : '#f59e0b',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {appointment.status}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                          {appointment.reason}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                          <span>{new Date(appointment.date).toLocaleDateString()}</span>
                          <span>{appointment.time}</span>
                          <span>${appointment.consultationFee}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No appointments available</p>
                    </div>
                  )}
                  <button 
                    className="action-btn" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    onClick={() => window.location.href = '/doctor/appointments/all'}
                  >
                    <Calendar size={16} />
                    <span>View All Appointments</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'medications' && (
              <div className="clinical-panel">
                <div className="panel-header">
                  <h5><Pill size={20} /> Recent Medications</h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {recentMedications.length > 0 ? (
                    recentMedications.map((medication) => (
                      <div key={medication._id} style={{
                        background: 'var(--doctor-light)',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderLeft: '4px solid var(--doctor-primary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                          <h6 style={{ margin: 0, color: 'var(--doctor-text)', fontWeight: '600' }}>
                            {medication.name}
                          </h6>
                          <span style={{
                            background: medication.status === 'taken' ? '#10b98120' : medication.status === 'missed' ? '#ef444420' : '#f59e0b20',
                            color: medication.status === 'taken' ? '#10b981' : medication.status === 'missed' ? '#ef4444' : '#f59e0b',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '600'
                          }}>
                            {medication.status}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                          Patient: {medication.patient?.name || 'Unknown'}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                          <span>Dosage: {medication.dosage}</span>
                          <span>Frequency: {medication.frequency || 'N/A'}</span>
                          <span>Duration: {medication.duration ? `${medication.duration} days` : 'N/A'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No medications available</p>
                    </div>
                  )}
                  <button 
                    className="action-btn" 
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    onClick={() => window.location.href = '/doctor/medications/all'}
                  >
                    <Pill size={16} />
                    <span>View All Medications</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-view">
                <div className="clinical-panel">
                  <div className="panel-header">
                    <h5><TrendingUp size={20} /> Reports & Analytics</h5>
                  </div>
                  <div className="reports-content">
                    <div className="report-summary">
                      <h6>Monthly Summary</h6>
                      <div className="summary-stats">
                        <div className="summary-item">
                          <span className="summary-label">Total Appointments:</span>
                          <span className="summary-value">{dashboardData.vitals.totalAppointments}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Completed Consultations:</span>
                          <span className="summary-value">{dashboardData.vitals.completedConsults}</span>
                        </div>
                        <div className="summary-item">
                          <span className="summary-label">Pending Reviews:</span>
                          <span className="summary-value">{dashboardData.vitals.pendingReviews}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;