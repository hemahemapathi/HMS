import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, MapPin, Phone, Video, 
  Plus, Filter, Search, Edit, Trash2, CheckCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Loading from '../../../components/loading/Loading';
import ConfirmModal from '../../../components/modal/ConfirmModal';
import Toast from '../../../components/toast/Toast';
import api from '../../../utils/api';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [appointments, setAppointments] = useState({
    today: [],
    upcoming: [],
    completed: [],
    cancelled: []
  });

  const handleJoinConsultation = (appointmentId) => {
    navigate(`/appointments/${appointmentId}/consultation`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleReschedule = (appointmentId) => {
    navigate('/patient/book-appointment');
  };

  const handleCancel = (appointmentId) => {
    setAppointmentToCancel(appointmentId);
    setShowConfirmModal(true);
  };

  const confirmCancel = async () => {
    try {
      console.log('Attempting to cancel appointment:', appointmentToCancel);
      
      // Show loading state immediately
      setToast({ show: true, message: 'Cancelling appointment...', type: 'info' });
      
      const response = await api.put(`/appointments/${appointmentToCancel}/status`, {
        status: 'cancelled'
      });
      
      console.log('Cancel response:', response.data);
      if (response.data.success) {
        setToast({ show: true, message: 'Appointment cancelled successfully', type: 'success' });
        
        // Simple refresh - just refetch appointments
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setToast({ show: true, message: 'Failed to cancel appointment', type: 'error' });
    } finally {
      setShowConfirmModal(false);
      setAppointmentToCancel(null);
    }
  };

  const filteredAppointments = (appointments[activeTab] || []).filter(appointment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.doctor?.name?.toLowerCase().includes(searchLower) ||
      appointment.doctor?.specialization?.toLowerCase().includes(searchLower) ||
      appointment.reason?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        console.log('Fetching appointments...');
        const response = await api.get('/appointments');
        console.log('API Response:', response.data);
        
        const allAppointments = response.data.appointments || [];
        console.log('All appointments:', allAppointments);
        
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const categorizedAppointments = {
          today: allAppointments.filter(apt => {
            const appointmentDate = new Date(apt.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate.getTime() === today.getTime();
          }).sort((a, b) => a.time.localeCompare(b.time)).map(apt => ({
            ...apt,
            consultationNotes: apt.consultationNotes || (apt.status === 'completed' ? 'Sample consultation notes - Patient examined, vital signs checked, treatment plan discussed.' : null)
          })),
          upcoming: allAppointments.filter(apt => {
            const appointmentDate = new Date(apt.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate >= tomorrow && apt.status !== 'cancelled' && apt.status !== 'noshow';
          }).sort((a, b) => new Date(a.date) - new Date(b.date)).map(apt => ({
            ...apt,
            consultationNotes: apt.consultationNotes || (apt.status === 'completed' ? 'Sample consultation notes - Patient examined, vital signs checked, treatment plan discussed.' : null)
          })),
          completed: allAppointments.filter(apt => {
            const appointmentDate = new Date(apt.date);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate < today && apt.status === 'completed';
          }).sort((a, b) => new Date(b.date) - new Date(a.date)).map(apt => ({
            ...apt,
            consultationNotes: apt.consultationNotes || 'Sample consultation notes - Patient examined, vital signs checked, treatment plan discussed.'
          })),
          cancelled: allAppointments.filter(apt => 
            ['cancelled', 'noshow'].includes(apt.status)
          ).sort((a, b) => new Date(b.date) - new Date(a.date))
        };
        
        console.log('Categorized appointments:', categorizedAppointments);
        setAppointments(categorizedAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusBadge = (status, appointmentTime) => {
    const now = new Date();
    const [hours, minutes] = appointmentTime.split(':');
    const appointmentDateTime = new Date();
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const statusConfig = {
      pending: { class: 'bg-warning', text: 'Pending' },
      confirmed: { class: 'bg-success', text: 'Confirmed' },
      inprogress: { class: 'bg-primary', text: 'In Progress' },
      completed: { class: 'bg-info', text: 'Completed' },
      cancelled: { class: 'bg-danger', text: 'Cancelled' },
      noshow: { class: 'bg-secondary', text: 'No Show' }
    };
    
    // Time-based badges for today's appointments
    if (status === 'confirmed') {
      const timeDiff = appointmentDateTime - now;
      if (timeDiff <= 15 * 60 * 1000 && timeDiff > 0) {
        return <span className="badge bg-warning">Starting Soon</span>;
      }
    }
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getTypeIcon = (type) => {
    return type === 'Video Call' ? <Video size={16} /> : <MapPin size={16} />;
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center">
          <div className="mb-3 mb-md-0 text-center text-md-start">
            <h2 className="text-danger mb-1">My Appointments</h2>
            <p className="text-muted">Manage your healthcare appointments</p>
          </div>
          <button 
            onClick={() => navigate('/patient/book-appointment')}
            className="btn btn-danger btn-custom"
          >
            <Plus size={16} className="me-2" />
            Book Appointment
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-8 mb-3 mb-md-0">
          <div className="position-relative">
            <input
              type="text"
              className="form-control pe-5"
              placeholder="Search appointments by doctor, specialty, or reason..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
              <Search size={18} />
            </button>
          </div>
        </div>
        <div className="col-md-4">
          <button 
            className="btn btn-outline-danger w-100"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter size={16} className="me-2" />
            Filter Appointments
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'today' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('today')}
              >
                Today ({appointments.today.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'upcoming' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming ({appointments.upcoming.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'completed' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({appointments.completed.length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'cancelled' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Cancelled ({appointments.cancelled.length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Appointments List */}
      <div className="row g-4">
        {filteredAppointments && filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="col-lg-6">
              <div className="card card-hover h-100">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title text-danger mb-1">{appointment.doctor?.name || 'Doctor Name'}</h5>
                      <p className="text-muted small mb-0">{appointment.doctor?.specialization || 'Specialty'}</p>
                    </div>
                    {getStatusBadge(appointment.status, appointment.time)}
                  </div>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <Calendar size={16} className="text-muted me-2" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <Clock size={16} className="text-muted me-2" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <MapPin size={16} className="text-muted me-2" />
                      <span>{appointment.consultationType === 'video' ? 'Online' : 'In-Person'}</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="small text-muted mb-1">Reason for visit:</p>
                    <p className="mb-0">{appointment.reason || 'General consultation'}</p>
                  </div>
                  
                  {appointment.consultationNotes && activeTab === 'completed' && (
                    <div className="mb-3">
                      <p className="small text-muted mb-1">Consultation Notes:</p>
                      <div className="bg-light p-2 rounded" style={{ fontSize: '0.9rem' }}>
                        {appointment.consultationNotes}
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex gap-2">
                    {activeTab === 'today' && appointment.status !== 'cancelled' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => handleJoinConsultation(appointment._id)}
                      >
                        <Video size={14} className="me-1" />
                        Join Consultation
                      </button>
                    )}
                    
                    {activeTab === 'upcoming' && (
                      <>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleReschedule(appointment._id)}
                        >
                          <Edit size={14} className="me-1" />
                          Reschedule
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleCancel(appointment._id)}
                        >
                          <Trash2 size={14} className="me-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'pending' && (
                      <>
                        <button 
                          className="btn btn-outline-danger btn-sm me-2"
                          onClick={() => handleReschedule(appointment._id)}
                        >
                          <Edit size={14} className="me-1" />
                          Reschedule
                        </button>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleCancel(appointment._id)}
                        >
                          <Trash2 size={14} className="me-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'past' && (
                      <>
                        <button className="btn btn-outline-danger btn-sm me-2">
                          <Plus size={14} className="me-1" />
                          Book Follow-up
                        </button>
                        <button className="btn btn-danger btn-sm">
                          <Plus size={14} className="me-1" />
                          Book Again
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'cancelled' && (
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => navigate('/patient/book-appointment')}
                      >
                        <Plus size={14} className="me-1" />
                        Book New Appointment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <Search size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No appointments found</h5>
              <p className="text-muted">
                {searchTerm 
                  ? `No appointments found matching "${searchTerm}". Try searching for a different doctor name, specialty, or reason.`
                  : `No ${activeTab} appointments found.`
                }
              </p>
              {searchTerm && (
                <button 
                  className="btn btn-outline-danger mt-3"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Quick Stats */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-danger mb-3">Appointment Statistics</h6>
              <div className="row text-center">
                <div className="col-md-3">
                  <div className="stats-card border-0 shadow-none">
                    <div className="stats-icon bg-success">
                      <CheckCircle />
                    </div>
                    <h4 className="text-success">{(appointments.completed || []).length}</h4>
                    <p className="text-muted mb-0">Completed</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-card border-0 shadow-none">
                    <div className="stats-icon bg-warning">
                      <Clock />
                    </div>
                    <h4 className="text-warning">{(appointments.today || []).length}</h4>
                    <p className="text-muted mb-0">Today</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-card border-0 shadow-none">
                    <div className="stats-icon bg-info">
                      <Video />
                    </div>
                    <h4 className="text-info">{(appointments.upcoming || []).length}</h4>
                    <p className="text-muted mb-0">Upcoming</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-card border-0 shadow-none">
                    <div className="stats-icon bg-danger">
                      <Trash2 />
                    </div>
                    <h4 className="text-danger">{(appointments.cancelled || []).length}</h4>
                    <p className="text-muted mb-0">Cancelled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={confirmCancel}
        onCancel={() => {
          setShowConfirmModal(false);
          setAppointmentToCancel(null);
        }}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
      />

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Filter Appointments</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowFilterModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Filter by Status:</label>
                  <select className="form-select" onChange={(e) => setActiveTab(e.target.value)} value={activeTab}>
                    <option value="upcoming">Upcoming</option>
                    <option value="pending">Pending</option>
                    <option value="past">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Filter by Doctor:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Enter doctor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setSearchTerm('');
                    setActiveTab('upcoming');
                  }}
                >
                  Clear Filters
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => setShowFilterModal(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Book New Appointment</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowBookingModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center py-5">
                <p className="text-muted mb-3">For a better booking experience, please use our dedicated booking page.</p>
                <button 
                  className="btn btn-danger"
                  onClick={() => {
                    setShowBookingModal(false);
                    navigate('/patient/book-appointment');
                  }}
                >
                  Go to Booking Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast 
        isVisible={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ show: false, message: '', type: '' })} 
      />
    </div>
  );
};

export default PatientAppointments;