import { useState, useEffect } from 'react';
import { Pill, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const AllMedications = () => {
  const [loading, setLoading] = useState(true);
  const [medications, setMedications] = useState([]);

  useEffect(() => {
    fetchAllMedications();
  }, []);

  const fetchAllMedications = async () => {
    try {
      const response = await api.get('/medications/all');
      setMedications(response.data.medications || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
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
              <Pill size={24} />
              All Medications ({medications.length})
            </h2>
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
                  {medications.map((medication) => (
                    <tr key={medication._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} style={{ color: '#6b7280' }} />
                          {medication.patient?.name || 'Unknown Patient'}
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
      </div>
    </div>
  );
};

export default AllMedications;