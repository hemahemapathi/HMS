import { useState, useEffect } from 'react';
import { Calendar, Pill, FileText, AlertTriangle, Clock, User, Activity, Download, RefreshCw, MessageSquare, StickyNote, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loading from '../loading/Loading';
import Modal from '../modal/Modal';
import ReviewModal from '../ReviewModal';
import StarRating from '../StarRating';
import jsPDF from 'jspdf';
import api from '../../utils/api';

const PatientDashboard = () => {   
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingAppointments: [],
    medications: [], 
    recentResults: [],
    alerts: [],
    manualScore: null,
    reviews: [],
    notes: [],
    payments: []
  });
  const [showMedicationsModal, setShowMedicationsModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [showHealthSummaryModal, setShowHealthSummaryModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingReviewAppointment, setPendingReviewAppointment] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [allMedications, setAllMedications] = useState([]);
  const [allHealthRecords, setAllHealthRecords] = useState([]);
  const [allPayments, setAllPayments] = useState([]);

  const checkForPendingReviews = async (appointments) => {
    // Only check if we're coming from a consultation (not on page load)
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('consultation_completed')) return;
    
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    
    for (const appointment of completedAppointments) {
      try {
        const response = await api.get(`/reviews/check/${appointment._id}`);
        if (!response.data.exists) {
          setPendingReviewAppointment(appointment);
          setShowReviewModal(true);
          // Clear the URL parameter
          window.history.replaceState({}, document.title, window.location.pathname);
          break;
        }
      } catch (error) {
        console.error('Error checking review status:', error);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/my-reviews');
      return response.data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await api.get('/medications/daily');
      const medications = response.data.medications || [];
      
      console.log('Raw medications from API:', medications);
      
      return medications;
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  };

  const calculateHealthStatus = (data) => {
    let score = 0;
    let factors = [];
    
    // Check appointments (10 points if no missed appointments)
    const missedAppointments = data.upcomingAppointments.filter(apt => apt.status === 'cancelled').length;
    if (missedAppointments === 0) {
      score += 10;
    } else {
      factors.push(`${missedAppointments} missed appointments`);
    }
    
    // Check medications (20 points if all taken, -5 for each missed)
    const missedMeds = data.medications.filter(med => med.status === 'missed').length;
    const takenMeds = data.medications.filter(med => med.status === 'taken').length;
    if (missedMeds === 0 && data.medications.length > 0) {
      score += 20;
    } else {
      score -= (missedMeds * 5);
      if (missedMeds > 0) factors.push(`${missedMeds} missed medications`);
    }
    
    // Check recent health records (10 points if recent records exist)
    if (data.recentResults.length > 0) {
      score += 10;
      // Bonus for verified records
      const verifiedRecords = data.recentResults.filter(r => r.isVerified).length;
      score += (verifiedRecords * 5);
    } else {
      factors.push('No recent health records');
    }
    
    // Check alerts
    score -= (data.alerts.length * 10);
    if (data.alerts.length > 0) {
      factors.push(`${data.alerts.length} health alerts`);
    }
    
    // Determine status
    let status, color, message;
    if (score >= 30) {
      status = 'Good';
      color = 'text-success';
      message = 'All health indicators are excellent';
    } else if (score >= 15) {
      status = 'Average';
      color = 'text-warning';
      message = 'Some areas need attention';
    } else {
      status = 'Needs Attention';
      color = 'text-danger';
      message = 'Multiple health concerns detected';
    }
    
    return { status, color, message, score, factors };
  };

  const updateMedicationStatus = async (medicationId, status) => {
    try {
      await api.put(`/medications/${medicationId}/status`, { status });
      // Refresh medications
      const updatedMedications = await fetchMedications();
      setDashboardData(prev => ({ ...prev, medications: updatedMedications }));
    } catch (error) {
      console.error('Error updating medication status:', error);
    }
  };

  const downloadHealthReport = (type) => {
    const data = {
      complete: {
        appointments: allAppointments,
        medications: allMedications,
        healthRecords: allHealthRecords,
        healthStatus: healthStatus
      },
      medications: allMedications,
      testResults: allHealthRecords,
      appointments: allAppointments
    };

    const pdf = new jsPDF();
    let yPosition = 20;
    
    // Title
    pdf.setFontSize(16);
    pdf.text(`Health Report - ${type.toUpperCase()}`, 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;
    
    if (type === 'complete') {
      // Appointments
      pdf.setFontSize(12);
      pdf.text('APPOINTMENTS:', 20, yPosition);
      yPosition += 10;
      data[type].appointments.forEach(apt => {
        pdf.setFontSize(8);
        pdf.text(`Doctor: ${apt.doctor?.name || 'N/A'}`, 25, yPosition);
        pdf.text(`Date: ${new Date(apt.date).toLocaleDateString()}`, 25, yPosition + 5);
        pdf.text(`Status: ${apt.status}`, 25, yPosition + 10);
        yPosition += 20;
      });
      
      // Medications
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.text('MEDICATIONS:', 20, yPosition);
      yPosition += 10;
      data[type].medications.forEach(med => {
        pdf.setFontSize(8);
        pdf.text(`Name: ${med.name}`, 25, yPosition);
        pdf.text(`Dosage: ${med.dosage}`, 25, yPosition + 5);
        pdf.text(`Status: ${med.status}`, 25, yPosition + 10);
        yPosition += 20;
      });
      
      // Health Records
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.text('HEALTH RECORDS:', 20, yPosition);
      yPosition += 10;
      data[type].healthRecords.forEach(record => {
        pdf.setFontSize(8);
        pdf.text(`Type: ${record.recordType || 'Health Record'}`, 25, yPosition);
        pdf.text(`Date: ${new Date(record.createdAt).toLocaleDateString()}`, 25, yPosition + 5);
        pdf.text(`Verified: ${record.isVerified ? 'Yes' : 'No'}`, 25, yPosition + 10);
        yPosition += 20;
      });
    } else {
      const items = data[type];
      items.forEach(item => {
        pdf.setFontSize(8);
        if (type === 'appointments') {
          pdf.text(`Doctor: ${item.doctor?.name || 'N/A'}`, 25, yPosition);
          pdf.text(`Date: ${new Date(item.date).toLocaleDateString()}`, 25, yPosition + 5);
          pdf.text(`Status: ${item.status}`, 25, yPosition + 10);
        } else if (type === 'medications') {
          pdf.text(`Name: ${item.name}`, 25, yPosition);
          pdf.text(`Dosage: ${item.dosage}`, 25, yPosition + 5);
          pdf.text(`Status: ${item.status}`, 25, yPosition + 10);
        } else if (type === 'testResults') {
          pdf.text(`Type: ${item.recordType || 'Health Record'}`, 25, yPosition);
          pdf.text(`Date: ${new Date(item.createdAt).toLocaleDateString()}`, 25, yPosition + 5);
          pdf.text(`Verified: ${item.isVerified ? 'Yes' : 'No'}`, 25, yPosition + 10);
        }
        yPosition += 20;
      });
    }
    
    pdf.save(`${type}-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const sendPrescriptionRefillRequest = async (medication) => {
    try {
      await api.post('/notifications/prescription-refill', {
        medicationId: medication._id,
        medicationName: medication.name,
        message: `Prescription refill request for ${medication.name}`
      });
      alert('Refill request sent to admin!');
    } catch (error) {
      console.error('Error sending refill request:', error);
    }
  };

  const healthStatus = dashboardData.manualScore ? {
    status: dashboardData.manualScore.status,
    score: dashboardData.manualScore.score,
    color: dashboardData.manualScore.status === 'Good' ? 'text-success' : 
           dashboardData.manualScore.status === 'Average' ? 'text-warning' : 'text-danger',
    message: dashboardData.manualScore.notes || 'Manual assessment by doctor'
  } : calculateHealthStatus(dashboardData);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointments
        console.log('Fetching dashboard data...');
        const appointmentsResponse = await api.get('/appointments');
        console.log('Dashboard appointments response:', appointmentsResponse.data);
        
        const appointments = appointmentsResponse.data.appointments || [];
        console.log('Dashboard appointments:', appointments);
        
        // Filter upcoming appointments (include today's appointments)
        const upcomingAppointments = appointments
          .filter(apt => {
            const appointmentDate = new Date(apt.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day
            appointmentDate.setHours(0, 0, 0, 0); // Reset time to start of day
            return appointmentDate >= today && apt.status !== 'cancelled';
          })
          .slice(0, 2);
        
        setAllAppointments(appointments); // Store all appointments
        
        console.log('Upcoming appointments for dashboard:', upcomingAppointments);
        
        // Fetch health records for recent results
        const healthRecordsResponse = await api.get('/health-records');
        const allRecords = healthRecordsResponse.data.records || [];
        
        // Remove duplicates based on record ID
        const uniqueRecords = allRecords.filter((record, index, self) => 
          index === self.findIndex(r => r._id === record._id)
        );
        
        const recentResults = uniqueRecords.slice(0, 2); // Limit to 2 for dashboard
        setAllHealthRecords(uniqueRecords); // Store all for modal
        
        // Fetch medications (limit to 2 for dashboard)
        const medications = await fetchMedications();
        setAllMedications(medications); // Store all medications
        const recentMedications = medications.slice(0, 2);
        
        // Check for manual health score (with error handling)
        let manualScore = null;
        try {
          const manualScoreResponse = await api.get(`/health-scores/current`);
          manualScore = manualScoreResponse.data.healthScore;
        } catch (error) {
          console.log('No manual health score found, using automatic calculation');
        }
        
        // Fetch reviews
        const reviews = await fetchReviews();
        
        // Fetch notes from completed appointments
        const notesData = appointments
          .filter(apt => apt.status === 'completed' && apt.notes)
          .map(apt => ({
            id: apt._id,
            message: apt.notes,
            doctorName: apt.doctor?.name || 'Unknown Doctor',
            date: apt.date,
            time: apt.time,
            createdAt: apt.updatedAt || apt.createdAt
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2);
        
        // Fetch payment data from appointments
        const paymentsData = appointments
          .filter(apt => apt.consultationFee)
          .map(apt => ({
            id: apt._id,
            amount: apt.consultationFee,
            status: apt.paymentStatus || 'pending',
            doctorName: apt.doctor?.name || 'Unknown Doctor',
            date: apt.date,
            appointmentStatus: apt.status
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setAllPayments(paymentsData);
        const recentPayments = paymentsData.slice(0, 2);
        
        const alerts = [];
        
        setDashboardData({
          upcomingAppointments,
          medications: recentMedications,
          recentResults,
          alerts,
          manualScore,
          reviews: reviews.slice(0, 3),
          notes: notesData,
          payments: recentPayments
        });
        
        // Check for pending reviews after data is loaded
        await checkForPendingReviews(appointments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12 text-center text-md-start">
          <h2 className="text-danger mb-1">Dashboard</h2>
          <p className="text-muted">Welcome back! Here's your health overview.</p>
        </div>
      </div>

      {/* Alerts Section */}
      {dashboardData.alerts.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-warning">
              <div className="card-header bg-warning bg-opacity-10">
                <h6 className="mb-0 text-warning">
                  <AlertTriangle size={20} className="me-2" />
                  Important Alerts
                </h6>
              </div>
              <div className="card-body">
                {dashboardData.alerts.map((alert) => (
                  <div key={alert.id} className={`alert alert-${alert.priority === 'high' ? 'danger' : 'warning'} mb-2`}>
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 1: Three equal cards */}
      <div className="row g-4 mb-4">
        {/* Upcoming Appointments */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <Calendar size={20} className="me-2" />
                Upcoming Appointments
              </h6>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="flex-grow-1">
                {dashboardData.upcomingAppointments.length > 0 ? (
                  dashboardData.upcomingAppointments.map((appointment) => (
                    <div key={appointment._id} className="border-start border-danger border-3 ps-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{appointment.doctor?.name || 'Doctor Name'}</h6>
                          <p className="text-muted small mb-1">{appointment.doctor?.specialization || 'Specialty'}</p>
                          <p className="small mb-0">
                            <Clock size={14} className="me-1" />
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </p>
                        </div>
                        <span className="badge bg-danger">{appointment.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No upcoming appointments</p>
                )}
              </div>
              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => setShowAppointmentsModal(true)}
                >
                  View All Appointments
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Medication Reminders */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <Pill size={20} className="me-2" />
                Today's Medications
              </h6>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="flex-grow-1">
                {dashboardData.medications.length > 0 ? (
                  dashboardData.medications.map((med) => (
                    <div key={med._id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{med.name}</h6>
                          <p className="text-muted small mb-1">{med.dosage}</p>
                          <p className="small mb-0">
                            <Clock size={14} className="me-1" />
                            {med.scheduledTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No medications scheduled for today</p>
                )}
              </div>
              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => setShowMedicationsModal(true)}
                >
                  View All Medications
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <StickyNote size={20} className="me-2" />
                Recent Notes
              </h6>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="flex-grow-1">
                {dashboardData.notes.length > 0 ? (
                  dashboardData.notes.map((note) => (
                    <div key={note.id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 text-danger">Consultation Notes</h6>
                        <small className="text-muted">
                          {new Date(note.date).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="text-muted small mb-2">Dr. {note.doctorName}</p>
                      <p className="small mb-0 text-truncate">{note.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No consultation notes yet</p>
                )}
              </div>
              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => navigate('/patient/notes')}
                >
                  View All Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Health Status and Test Results */}
      <div className="row g-4 mb-4">
        {/* Health Status */}
        <div className="col-lg-4 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <Activity size={20} className="me-2" />
                Health Status
              </h6>
            </div>
            <div className="card-body text-center d-flex flex-column justify-content-center">
              <div className="mb-3">
                <h5 className={`${healthStatus.color} mb-0`}>
                  {healthStatus.status}
                </h5>
              </div>
              <p className="text-muted small mb-2">
                {healthStatus.message}
              </p>
              <div className="mb-2">
                <strong className="text-primary">Health Score: {healthStatus.score}</strong>
              </div>
              <small className="text-muted">
                <strong>Set by: {dashboardData.manualScore ? `Dr.${dashboardData.manualScore.setBy?.name}` : 'HMS System'}</strong>
              </small>
            </div>
          </div>
        </div>

        {/* Recent Test Results */}
        <div className="col-lg-8 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <FileText size={20} className="me-2" />
                Recent Test Results
              </h6>
            </div>
            <div className="card-body">
              {dashboardData.recentResults.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Test</th>
                        <th>Result</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Verified</th>
                        <th>File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentResults.map((result) => (
                        <tr key={result._id}>
                          <td className="fw-semibold">{result.recordType || 'Health Record'}</td>
                          <td>{result.description || 'N/A'}</td>
                          <td>{new Date(result.createdAt).toLocaleDateString()}</td>
                          <td>
                            {result.isVerified ? (
                              <span className="badge bg-success">Verified</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Not Verified</span>
                            )}
                          </td>
                          <td>
                            {result.isVerified && result.verifiedBy ? (
                              <span className="text-muted">Dr.{result.verifiedBy.name}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {result.files && result.files.length > 0 ? (
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => window.open(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/health-records/${result.files[0].filename}`, '_blank')}
                              >
                                View
                              </button>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted text-center py-3">No recent test results</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Payments and Reviews */}
      <div className="row g-4">
        {/* Payment History */}
        <div className="col-lg-6 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <CreditCard size={20} className="me-2" />
                Recent Payments
              </h6>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="flex-grow-1">
                {dashboardData.payments.length > 0 ? (
                  dashboardData.payments.map((payment) => (
                    <div key={payment.id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">${payment.amount}</h6>
                        <span className={`badge ${
                          payment.status === 'paid' ? 'bg-success' : 
                          payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-muted small mb-1">Dr. {payment.doctorName}</p>
                      <small className="text-muted">
                        {new Date(payment.date).toLocaleDateString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No payment history</p>
                )}
              </div>
              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => setShowPaymentsModal(true)}
                >
                  View All Payments
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* My Reviews */}
        <div className="col-lg-6 col-md-6">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-white">
              <h6 className="mb-0 text-danger">
                <MessageSquare size={20} className="me-2" />
                My Reviews
              </h6>
            </div>
            <div className="card-body d-flex flex-column">
              <div className="flex-grow-1">
                {dashboardData.reviews.length > 0 ? (
                  dashboardData.reviews.map((review) => (
                    <div key={review._id} className="border rounded p-3 mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">Dr. {review.doctor?.name}</h6>
                        <StarRating rating={review.rating} readonly size={16} />
                      </div>
                      <p className="text-muted small mb-1">{review.doctor?.specialization}</p>
                      {review.comment && (
                        <p className="small mb-2 text-truncate">"{review.comment}"</p>
                      )}
                      <small className="text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center py-3">No reviews submitted yet</p>
                )}
              </div>
              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={() => navigate('/patient/reviews')}
                >
                  View All Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Modal */}
      <Modal 
        isOpen={showPaymentsModal} 
        onClose={() => setShowPaymentsModal(false)}
        title="Payment History"
      >
        <div className="list-group">
          {allPayments.length > 0 ? (
            allPayments.map((payment) => (
              <div key={payment.id} className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">${payment.amount}</h6>
                  <span className={`badge ${
                    payment.status === 'paid' ? 'bg-success' : 
                    payment.status === 'pending' ? 'bg-warning' : 'bg-danger'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                <p className="mb-1">Dr. {payment.doctorName}</p>
                <small className="text-muted">
                  {new Date(payment.date).toLocaleDateString()} - Appointment: {payment.appointmentStatus}
                </small>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No payment history found</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Modals */}
      <Modal 
        isOpen={showMedicationsModal} 
        onClose={() => setShowMedicationsModal(false)}
        title="Today's Medications"
      >
        <div className="list-group">
          {allMedications.length > 0 ? (
            allMedications.map((med) => (
              <div key={med._id} className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{med.name}</h6>
                  <span className={`badge ${
                    med.status === 'taken' ? 'bg-success' : 
                    med.status === 'missed' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {med.status}
                  </span>
                </div>
                <p className="mb-1">{med.dosage} - {med.frequency}</p>
                <small className="text-muted">Time: {med.scheduledTime}</small>
                {med.status === 'pending' && (
                  <div className="mt-2">
                    <button 
                      className="btn btn-sm btn-success me-2"
                      onClick={() => {
                        updateMedicationStatus(med._id, 'taken');
                        setShowMedicationsModal(false);
                      }}
                    >
                      Mark Taken
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        updateMedicationStatus(med._id, 'missed');
                        setShowMedicationsModal(false);
                      }}
                    >
                      Mark Missed
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No medications scheduled for today</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={showAppointmentsModal} 
        onClose={() => setShowAppointmentsModal(false)}
        title="Appointment Management"
      >
        <div className="list-group">
          {allAppointments.length > 0 ? (
            allAppointments.map((appointment) => (
              <div key={appointment._id} className="list-group-item">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">{appointment.doctor?.name || 'Doctor Name'}</h6>
                  <span className={`badge ${
                    appointment.status === 'confirmed' ? 'bg-success' : 
                    appointment.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
                <p className="mb-1">{appointment.doctor?.specialization || 'Specialty'}</p>
                <small className="text-muted">{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</small>
                {appointment.status === 'confirmed' && new Date(appointment.date) > new Date() && (
                  <div className="mt-2">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        setShowAppointmentsModal(false);
                        navigate('/appointments');
                      }}
                    >
                      Reschedule
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No appointments found</p>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  setShowAppointmentsModal(false);
                  navigate('/appointments');
                }}
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={showHealthSummaryModal} 
        onClose={() => setShowHealthSummaryModal(false)}
        title="Health Summary Download"
      >
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info">
              <h6>Download Your Health Summary</h6>
              <p className="mb-0">Generate and download comprehensive reports of your health data.</p>
            </div>
            
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">Complete Health Report</h6>
                <p className="card-text text-muted">Includes all appointments, medications, test results, and health scores.</p>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    downloadHealthReport('complete');
                    setShowHealthSummaryModal(false);
                  }}
                >
                  <Download size={16} className="me-2" />
                  Download Complete Report
                </button>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h6 className="card-title">Test Results Summary</h6>
                <p className="card-text text-muted">All lab results and health records with verification status.</p>
                <button 
                  className="btn btn-outline-danger"
                  onClick={() => {
                    downloadHealthReport('testResults');
                    setShowHealthSummaryModal(false);
                  }}
                >
                  <Download size={16} className="me-2" />
                  Download Test Results
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      {pendingReviewAppointment && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setPendingReviewAppointment(null);
          }}
          appointment={pendingReviewAppointment}
          onReviewSubmitted={async () => {
            const reviews = await fetchReviews();
            setDashboardData(prev => ({ ...prev, reviews: reviews.slice(0, 3) }));
          }}
        />
      )}
    </div>
  );
};

export default PatientDashboard;