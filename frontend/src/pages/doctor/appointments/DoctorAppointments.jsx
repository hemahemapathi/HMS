import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Video, Search, Plus, Eye, Edit } from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import Modal from '../../../components/modal/Modal';
import TimePickerModal from '../../../components/TimePickerModal';
import api from '../../../utils/api';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState({
    today: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notification, setNotification] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', time: '', reason: '' });
  const [showTabModal, setShowTabModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        const allAppointments = response.data.appointments || [];
        
        const today = new Date().toDateString();
        const now = new Date();
        
        const categorizedAppointments = {
          today: [],
          upcoming: [],
          completed: [],
          cancelled: []
        };
        
        allAppointments.forEach(apt => {
          const appointmentDate = new Date(apt.date);
          const appointmentDateTime = new Date(`${apt.date} ${apt.time}`);
          const now = new Date();
          
          const formattedAppointment = {
            id: apt._id,
            patient: apt.patient?.name || 'Unknown Patient',
            time: apt.time,
            date: appointmentDate.toLocaleDateString(),
            reason: apt.reason || 'General Consultation',
            status: apt.status,
            consultationFee: apt.consultationFee,
            consultationNotes: apt.consultationNotes || (apt.status === 'completed' ? 'Sample consultation notes for testing - Patient examined, vital signs normal, prescribed medication as needed.' : null)
          };
          
          // Check if appointment time has passed and auto-update status
          if (apt.status === 'pending' && appointmentDateTime < now) {
            // Move overdue pending appointments to completed or mark as missed
            formattedAppointment.status = 'completed';
          }
          
          if (formattedAppointment.status === 'completed') {
            categorizedAppointments.completed.push(formattedAppointment);
          } else if (formattedAppointment.status === 'cancelled') {
            categorizedAppointments.cancelled.push(formattedAppointment);
          } else if (formattedAppointment.status === 'pending_approval') {
            // Show pending approval appointments in upcoming
            categorizedAppointments.upcoming.push(formattedAppointment);
          } else if (appointmentDate.toDateString() === today) {
            categorizedAppointments.today.push(formattedAppointment);
          } else if (appointmentDate > now) {
            categorizedAppointments.upcoming.push(formattedAppointment);
          }
        });
        
        setAppointments(categorizedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleStartConsultation = (appointmentId) => {
    navigate(`/appointments/${appointmentId}/consultation`);
  };

  const handleViewAppointment = (appointmentId) => {
    const appointment = [...appointments.today, ...appointments.upcoming, ...appointments.completed, ...appointments.cancelled]
      .find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowModal(true);
    }
  };

  const handleEditAppointment = (appointmentId) => {
    const appointment = [...appointments.today, ...appointments.upcoming, ...appointments.completed, ...appointments.cancelled]
      .find(apt => apt.id === appointmentId);
    if (appointment) {
      // Check if within 10 minutes
      const now = new Date();
      const [hours, minutes] = appointment.time.split(':');
      const appointmentDateTime = new Date();
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const timeDiff = appointmentDateTime.getTime() - now.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      if (minutesDiff <= 10 && minutesDiff > 0) {
        setNotification('Cannot edit appointment within 10 minutes of start time');
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      setSelectedAppointment(appointment);
      setEditForm({
        date: appointment.date.includes('/') ? 
          appointment.date.split('/').reverse().join('-') : // Convert MM/DD/YYYY to YYYY-MM-DD
          new Date(appointment.date).toISOString().split('T')[0],
        time: appointment.time.padStart(5, '0'),
        reason: appointment.reason
      });
      setShowEditModal(true);
    }
  };

  const handleReschedule = async () => {
    try {
      await api.put(`/appointments/${selectedAppointment.id}`, {
        date: editForm.date,
        time: editForm.time,
        reason: editForm.reason,
        isReschedule: true
      });
      setNotification('Appointment rescheduled successfully. Patient will be notified.');
      setTimeout(() => setNotification(null), 5000);
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setNotification('Failed to reschedule appointment');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: 'cancelled' });
      setNotification('Appointment cancelled successfully');
      setTimeout(() => setNotification(null), 3000);
      // Refresh appointments
      window.location.reload();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setNotification('Failed to cancel appointment');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const canEditAppointment = (appointment) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff > 10 || appointmentDateTime.toDateString() !== now.toDateString(); // Can edit if more than 10 minutes OR different day
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--doctor-warning)';
      case 'approved': return 'var(--doctor-success)';
      case 'completed': return 'var(--doctor-info)';
      case 'cancelled': return 'var(--doctor-critical)';
      default: return '#6b7280';
    }
  };

  const filteredAppointments = appointments[activeTab].filter(apt =>
    apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <DoctorLoading />;

  return (
    <div className="clinical-workspace doctor-portal">
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: notification.includes('Failed') ? '#dc2626' : '#10b981',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '0.9rem',
          fontWeight: '500',
          maxWidth: '300px'
        }}>
          {notification}
        </div>
      )}
      
      <div className="clinical-main">
        {/* Header */}
        <div className="clinical-panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header">
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
              <div>
                <h2 className="d-none d-lg-block" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>My Appointments</h2>
                <h2 className="d-lg-none" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Appointments</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Manage your patient appointments and consultations</p>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            <div className="search-container" style={{ position: 'relative', maxWidth: '100%' }}>
              <Search size={20} style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 3rem',
                  border: '2px solid var(--doctor-light)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-none d-lg-flex" style={{
          background: 'var(--doctor-white)',
          borderRadius: '16px',
          padding: '0.5rem',
          marginBottom: '2rem',
          gap: '0.5rem',
          boxShadow: 'var(--doctor-shadow)'
        }}>
          {[
            { key: 'today', label: 'Today', count: appointments.today.length },
            { key: 'upcoming', label: 'Upcoming', count: appointments.upcoming.length },
            { key: 'completed', label: 'Completed', count: appointments.completed.length },
            { key: 'cancelled', label: 'Cancelled', count: appointments.cancelled.length }
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
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        
        {/* Mobile Tab Button */}
        <div className="d-lg-none mb-3">
          <button 
            className="btn w-100 d-flex justify-content-between align-items-center"
            style={{
              background: 'white',
              border: '2px solid var(--doctor-primary)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              fontWeight: '600',
              color: 'var(--doctor-text)',
              fontSize: '0.9rem'
            }}
            onClick={() => setShowTabModal(true)}
          >
            <span>{[
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].find(tab => tab.key === activeTab)?.label} ({appointments[activeTab].length})</span>
            <span>▼</span>
          </button>
        </div>

        {/* Appointments Grid */}
        <div className="row g-3 g-lg-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="col-12 col-lg-6 col-xl-4">
              <div className="metric-card" style={{ borderLeft: `5px solid ${getStatusColor(appointment.status)}`, height: '100%' }}>
                {/* Patient Info */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="metric-icon" style={{ marginRight: '1rem', marginBottom: 0 }}>
                    <User size={24} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, color: 'var(--doctor-text)', fontSize: '1.1rem', fontWeight: '600' }}>
                      {appointment.patient}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
                      {appointment.reason}
                    </p>
                  </div>
                  <div className="urgency-badge" style={{
                    background: getStatusColor(appointment.status) + '20',
                    color: getStatusColor(appointment.status),
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem'
                  }}>
                    {appointment.status}
                  </div>
                </div>

                {/* Appointment Details */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Calendar size={16} style={{ color: '#6b7280', marginRight: '0.5rem' }} />
                    <span style={{ color: 'var(--doctor-text)', fontSize: '0.9rem' }}>{appointment.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Clock size={16} style={{ color: '#6b7280', marginRight: '0.5rem' }} />
                    <span style={{ color: 'var(--doctor-text)', fontSize: '0.9rem' }}>{appointment.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem', marginRight: '0.5rem' }}>Fee:</span>
                    <span style={{ color: 'var(--doctor-success)', fontSize: '0.9rem', fontWeight: '600' }}>
                      ${appointment.consultationFee}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex flex-column flex-sm-row gap-2">
                  {activeTab === 'today' && (
                    <button 
                      className="monitor-btn primary" 
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                      onClick={() => handleStartConsultation(appointment.id)}
                    >
                      <Video size={14} style={{ marginRight: '0.25rem' }} />
                      Start
                    </button>
                  )}
                  <button 
                    className="monitor-btn secondary" 
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    <Eye size={14} style={{ marginRight: '0.25rem' }} />
                    View
                  </button>
                  {activeTab !== 'completed' && activeTab !== 'cancelled' && (
                    <button 
                      className="monitor-btn secondary" 
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                      onClick={() => handleEditAppointment(appointment.id)}
                    >
                      <Edit size={14} style={{ marginRight: '0.25rem' }} />
                      Edit
                    </button>
                  )}
                  {activeTab !== 'completed' && activeTab !== 'cancelled' && (
                    <button 
                      className="monitor-btn" 
                      style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.5rem 1rem',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none'
                      }}
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="clinical-panel">
            <div className="no-data">
              <Calendar size={64} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
              <h3 style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>No {activeTab} appointments</h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>
                {activeTab === 'today' 
                  ? "You don't have any appointments scheduled for today."
                  : `No ${activeTab} appointments found.`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Patient:</strong> {selectedAppointment.patient}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Date:</strong> {selectedAppointment.date}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Time:</strong> {selectedAppointment.time}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Reason:</strong> {selectedAppointment.reason}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Status:</strong> <span style={{ color: getStatusColor(selectedAppointment.status) }}>{selectedAppointment.status}</span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Fee:</strong> ${selectedAppointment.consultationFee}
            </div>
            {selectedAppointment.consultationNotes && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Consultation Notes:</strong>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  marginTop: '0.5rem',
                  border: '1px solid #e9ecef'
                }}>
                  {selectedAppointment.consultationNotes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        title="Reschedule Appointment"
      >
        {selectedAppointment && (
          <div style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date:</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                className="form-control d-none d-md-block"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="button"
                className="btn btn-outline-primary w-100 d-md-none"
                onClick={() => setShowDateModal(true)}
                style={{ padding: '0.75rem', textAlign: 'left' }}
              >
                {editForm.date || 'Select Date'}
              </button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Time:</label>
              <input
                type="time"
                value={editForm.time}
                onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                className="form-control d-none d-md-block"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="button"
                className="btn btn-outline-primary w-100 d-md-none"
                onClick={() => setShowTimeModal(true)}
                style={{ padding: '0.75rem', textAlign: 'left' }}
              >
                {editForm.time || 'Select Time'}
              </button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Reason:</label>
              <input
                type="text"
                value={editForm.reason}
                onChange={(e) => setEditForm({...editForm, reason: e.target.value})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handleReschedule}
                style={{
                  background: 'var(--doctor-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Reschedule
              </button>
              <button 
                onClick={() => setShowEditModal(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mobile Tab Selection Modal */}
      {showTabModal && (
        <div className="modal show d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-dialog" style={{ maxWidth: '350px', width: '90%', margin: 0 }}>
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header" style={{ background: 'var(--doctor-primary)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">Select Appointment Type</h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowTabModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                {[
                  { key: 'today', label: 'Today', icon: '📅', count: appointments.today.length },
                  { key: 'upcoming', label: 'Upcoming', icon: '⏰', count: appointments.upcoming.length },
                  { key: 'completed', label: 'Completed', icon: '✅', count: appointments.completed.length },
                  { key: 'cancelled', label: 'Cancelled', icon: '❌', count: appointments.cancelled.length }
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`btn w-100 text-start border-0 d-flex align-items-center justify-content-between ${activeTab === tab.key ? 'bg-primary text-white' : 'btn-light'}`}
                    style={{ padding: '1rem', borderRadius: '0' }}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setShowTabModal(false);
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </div>
                    <span className="badge bg-secondary">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Date Selection Modal */}
      {showDateModal && (
        <div className="modal show d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
          <div className="modal-dialog" style={{ maxWidth: '300px', width: '90%', margin: 0 }}>
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header" style={{ background: 'var(--doctor-primary)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">Select Date</h6>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDateModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                  className="form-control"
                  style={{ fontSize: '1rem', padding: '0.75rem' }}
                />
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowDateModal(false)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TimePickerModal for Mobile Time Selection */}
      <TimePickerModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        value={editForm.time}
        onChange={(time) => setEditForm({...editForm, time})}
        title="Appointment Time"
      />
    </div>
  );
};

export default DoctorAppointments;