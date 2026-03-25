import { useState, useEffect } from 'react';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const AllAppointments = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'cancelled': return '#ef4444';
      case 'pending_approval': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (loading) return <DoctorLoading />;

  return (
    <div className="clinical-workspace">
      <div className="clinical-main">
        <div className="clinical-panel">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link 
                to="/doctor/dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--doctor-primary)',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </Link>
            </div>
            <h2 style={{ margin: '1rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={24} />
              All Appointments ({appointments.length})
            </h2>
          </div>
          
          <div style={{ padding: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Patient</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Reason</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} style={{ color: '#6b7280' }} />
                          {appointment.patient?.name || 'N/A'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>{new Date(appointment.date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>{appointment.time}</td>
                      <td style={{ padding: '1rem' }}>{appointment.reason}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          background: getStatusColor(appointment.status) + '20',
                          color: getStatusColor(appointment.status),
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {appointment.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>${appointment.consultationFee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllAppointments;