import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Pill, FileText, Download } from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const DoctorReports = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      // Fetch all appointments
      const appointmentsResponse = await api.get('/appointments');
      setAppointments(appointmentsResponse.data.appointments || []);

      // Fetch all medications for all patients
      const medicationsResponse = await api.get('/medications/all');
      setMedications(medicationsResponse.data.medications || []);
    } catch (error) {
      console.error('Error fetching reports data:', error);
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

  const exportData = () => {
    const data = activeTab === 'appointments' ? appointments : medications;
    const csvContent = "data:text/csv;charset=utf-8," + 
      (activeTab === 'appointments' 
        ? "Patient,Date,Time,Reason,Status,Fee\n" + 
          appointments.map(apt => 
            `${apt.patient?.name || 'N/A'},${new Date(apt.date).toLocaleDateString()},${apt.time},${apt.reason},${apt.status},${apt.consultationFee}`
          ).join("\n")
        : "Patient,Medication,Dosage,Frequency,Duration,Date\n" + 
          medications.map(med => 
            `${med.patient?.name || 'N/A'},${med.name},${med.dosage},${med.frequency || 'N/A'},${med.duration || 'N/A'},${new Date(med.date).toLocaleDateString()}`
          ).join("\n")
      );
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <DoctorLoading />;

  return (
    <div className="clinical-workspace">
      <div className="clinical-main">
        {/* Header */}
        <div className="clinical-panel" style={{ marginBottom: '2rem' }}>
          <div className="panel-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Reports</h2>
                <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>Comprehensive view of all appointments and medications</p>
              </div>
              <button
                onClick={exportData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--doctor-primary)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          background: 'var(--doctor-white)',
          borderRadius: '16px',
          padding: '0.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.5rem',
          boxShadow: 'var(--doctor-shadow)'
        }}>
          {[
            { key: 'appointments', label: 'All Appointments', count: appointments.length },
            { key: 'medications', label: 'All Medications', count: medications.length }
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

        {/* Content */}
        {activeTab === 'appointments' && (
          <div className="clinical-panel">
            <div className="panel-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} />
                All Appointments Report
              </h3>
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
                    {appointments.map((appointment, index) => (
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
        )}

        {activeTab === 'medications' && (
          <div className="clinical-panel">
            <div className="panel-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pill size={20} />
                All Medications Report
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Patient</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Medication</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Dosage</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Frequency</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Duration</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medications.map((medication, index) => (
                      <tr key={medication._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} style={{ color: '#6b7280' }} />
                            {medication.patient?.name || 'N/A'}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{medication.name}</td>
                        <td style={{ padding: '1rem' }}>{medication.dosage}</td>
                        <td style={{ padding: '1rem' }}>{medication.frequency || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{medication.duration ? `${medication.duration} days` : 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{new Date(medication.date).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="metrics-grid" style={{ marginTop: '2rem' }}>
          <div className="metric-card">
            <div className="metric-icon">
              <Calendar size={24} />
            </div>
            <div className="metric-content">
              <h3>Total Appointments</h3>
              <div className="metric-value">{appointments.length}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <Pill size={24} />
            </div>
            <div className="metric-content">
              <h3>Total Medications</h3>
              <div className="metric-value">{medications.length}</div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon">
              <User size={24} />
            </div>
            <div className="metric-content">
              <h3>Unique Patients</h3>
              <div className="metric-value">
                {new Set([...appointments.map(a => a.patient?._id), ...medications.map(m => m.patient?._id)]).size}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorReports;