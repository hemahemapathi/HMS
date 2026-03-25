import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Settings } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminLoading from '../../../components/loading/AdminLoading';
import Toast from '../../../components/toast/Toast';
import api from '../../../utils/api';
import '../../../styles/admin-theme.css';

const AdminAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    stats: {
      totalToday: 0,
      totalWeek: 0,
      availableRooms: 12,
      activeProviders: 0
    },
    recentAppointments: []
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const [appointmentsRes, statsRes] = await Promise.all([
          api.get('/appointments'),
          api.get('/admin/dashboard')
        ]);
        
        const appointments = appointmentsRes.data.appointments || [];
        const formattedAppointments = appointments.slice(0, 10).map(apt => ({
          id: apt._id,
          patient: apt.patient?.name || 'Unknown',
          doctor: apt.doctor?.name || 'Unknown',
          time: apt.time || apt.timeSlot || 'Not set',
          room: 'Room ' + Math.floor(Math.random() * 300 + 100),
          status: apt.status
        }));
        
        setAppointmentData({
          stats: {
            totalToday: appointments.length,
            totalWeek: statsRes.data.stats.totalAppointments,
            availableRooms: 12,
            activeProviders: statsRes.data.stats.approvedDoctors
          },
          recentAppointments: formattedAppointments
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  
  const handleManageRooms = () => {
    setShowRoomModal(true);
  };
  
  const handleEquipmentStatus = () => {
    setShowEquipmentModal(true);
  };
  
  const handleProviderSchedule = () => {
    setShowScheduleModal(true);
  };
  
  const handleAvailabilityMatrix = () => {
    setShowMatrixModal(true);
  };
  
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      setAppointmentData(prev => ({
        ...prev,
        recentAppointments: prev.recentAppointments.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      }));
      setToast({ message: `Appointment ${newStatus} successfully!`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update appointment status', type: 'error' });
    }
  };

  if (loading) return <AdminLoading />;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="admin-text-primary mb-1">Scheduling & Resource Management</h2>
            <p className="text-muted">Oversee appointments, rooms, equipment, and provider availability</p>
          </div>
        </div>

        {/* Appointment Statistics */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Calendar />
              </div>
              <h3 className="admin-text-primary">{appointmentData.stats.totalToday || 0}</h3>
              <p className="text-muted mb-0">Today's Appointments</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Clock />
              </div>
              <h3 className="admin-text-primary">{appointmentData.stats.totalWeek || 0}</h3>
              <p className="text-muted mb-0">This Week</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <MapPin />
              </div>
              <h3 className="admin-text-primary">{appointmentData.stats.availableRooms}</h3>
              <p className="text-muted mb-0">Available Rooms</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Users />
              </div>
              <h3 className="admin-text-primary">{appointmentData.stats.activeProviders || 0}</h3>
              <p className="text-muted mb-0">Active Providers</p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Recent Appointments */}
          <div className="col-lg-8">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Today's Appointments</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table admin-table mb-0">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Time</th>
                        <th>Room</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointmentData.recentAppointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>{appointment.patient}</td>
                          <td>{appointment.doctor}</td>
                          <td>{appointment.time}</td>
                          <td>{appointment.room}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className={`badge ${
                                appointment.status === 'approved' ? 'bg-success' :
                                appointment.status === 'completed' ? 'bg-primary' :
                                appointment.status === 'rejected' ? 'bg-danger' :
                                'bg-info'
                              }`}>
                                {appointment.status}
                              </span>
                              {appointment.status === 'pending' && (
                                <button 
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleUpdateStatus(appointment.id, 'approved')}
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Resource Management */}
          <div className="col-lg-4">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Resource Management</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <button 
                    className="btn admin-btn-outline w-100 mb-2"
                    onClick={handleManageRooms}
                  >
                    <MapPin size={16} className="me-2" />
                    Manage Rooms
                  </button>
                  <button 
                    className="btn admin-btn-outline w-100 mb-2"
                    onClick={handleEquipmentStatus}
                  >
                    <Settings size={16} className="me-2" />
                    Equipment Status
                  </button>
                  <button 
                    className="btn admin-btn-outline w-100 mb-2"
                    onClick={handleProviderSchedule}
                  >
                    <Users size={16} className="me-2" />
                    Provider Schedule
                  </button>
                  <button 
                    className="btn admin-btn-outline w-100"
                    onClick={handleAvailabilityMatrix}
                  >
                    <Calendar size={16} className="me-2" />
                    Availability Matrix
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showRoomModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Room Management</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowRoomModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {Array.from({length: 12}, (_, i) => {
                    const isAvailable = (i + 1) % 3 !== 0; // Every 3rd room is occupied
                    return (
                      <div key={i} className="col-md-4">
                        <div className="card">
                          <div className="card-body text-center">
                            <h6>Room {100 + i + 1}</h6>
                            <span className={`badge ${isAvailable ? 'bg-success' : 'bg-danger'}`}>
                              {isAvailable ? 'Available' : 'Occupied'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showEquipmentModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Equipment Status</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEquipmentModal(false)}></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead><tr><th>Equipment</th><th>Location</th><th>Status</th></tr></thead>
                  <tbody>
                    <tr><td>X-Ray Machine</td><td>Room 201</td><td><span className="badge bg-success">Operational</span></td></tr>
                    <tr><td>MRI Scanner</td><td>Room 301</td><td><span className="badge bg-warning">Maintenance</span></td></tr>
                    <tr><td>Ultrasound</td><td>Room 105</td><td><span className="badge bg-success">Operational</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showScheduleModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '95vw', width: '100%', margin: '1rem' }}>
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Provider Schedule</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowScheduleModal(false)}></button>
              </div>
              <div className="modal-body p-2">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th style={{ minWidth: '80px' }}>Doctor</th>
                        <th style={{ minWidth: '70px' }}>Mon</th>
                        <th style={{ minWidth: '70px' }}>Tue</th>
                        <th style={{ minWidth: '70px' }}>Wed</th>
                        <th style={{ minWidth: '70px' }}>Thu</th>
                        <th style={{ minWidth: '70px' }}>Fri</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold">Dr. Vijay</td>
                        <td><small>9AM-5PM</small></td>
                        <td><small>9AM-5PM</small></td>
                        <td><small className="text-danger">Off</small></td>
                        <td><small>9AM-5PM</small></td>
                        <td><small>9AM-3PM</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showMatrixModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Availability Matrix</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMatrixModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12">
                    <h6>Weekly Availability Overview</h6>
                    <div className="d-flex gap-2 mb-2">
                      <div className="bg-success text-white p-2 rounded">Available</div>
                      <div className="bg-danger text-white p-2 rounded">Busy</div>
                    </div>
                    <div className="row g-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                        <div key={day} className="col">
                          <div className="text-center fw-bold mb-2">{day}</div>
                          {Array.from({length: 8}, (_, hour) => (
                            <div key={hour} className={`p-1 mb-1 text-center small ${Math.random() > 0.5 ? 'bg-success' : 'bg-danger'} text-white rounded`}>
                              {9 + hour}:00
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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

export default AdminAppointments;