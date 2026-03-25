import { useState, useEffect } from 'react';
import { Search, Heart, User, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const DoctorHealthScores = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [healthScores, setHealthScores] = useState({});
  const [filteredPatients, setFilteredPatients] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patientsResponse = await api.get('/doctors/my/patients');
        const patientsData = patientsResponse.data?.patients || [];
        
        const scores = {};
        for (const patient of patientsData) {
          try {
            const healthResponse = await api.get(`/health-scores/${patient._id}`);
            const healthScore = healthResponse.data.healthScore;
            // Only store the numeric score, never the object
            scores[patient._id] = (healthScore && typeof healthScore.score === 'number') ? healthScore.score : 0;
          } catch (error) {
            scores[patient._id] = 0;
          }
        }
        
        setPatients(patientsData);
        setHealthScores(scores);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = patients;
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredPatients(filtered);
  }, [patients, searchTerm]);

  const getScoreStatus = (score) => {
    if (score >= 80) return { label: 'Excellent', color: '#059669', icon: TrendingUp };
    if (score >= 60) return { label: 'Good', color: '#f59e0b', icon: Minus };
    return { label: 'Needs Care', color: '#dc2626', icon: TrendingDown };
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
              padding: '2rem',
              color: 'white',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(14, 165, 233, 0.3)'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ fontSize: '2rem', fontWeight: '700' }}>Health Scores</h2>
                  <p className="mb-0" style={{ opacity: 0.9 }}>Monitor and manage all patient health scores</p>
                </div>
                <div className="position-relative" style={{ width: '300px' }}>
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

        {/* Health Scores List */}
        <div className="row g-4">
          {filteredPatients.map((patient, index) => {
            const score = typeof healthScores[patient._id] === 'number' ? healthScores[patient._id] : 0;
            const status = getScoreStatus(score);
            const StatusIcon = status.icon;
            
            return (
              <div key={patient._id} className="col-lg-6 col-xl-4">
                <div 
                  className="card h-100" 
                  style={{ 
                    border: 'none',
                    borderRadius: '16px',
                    background: 'white',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    background: `linear-gradient(135deg, ${status.color}, ${status.color}dd)`,
                    padding: '1.5rem',
                    color: 'white',
                    borderRadius: '16px 16px 0 0'
                  }}>
                    <div className="d-flex align-items-center justify-content-between">
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
                        <div>
                          <h6 className="mb-1" style={{ fontWeight: '600' }}>
                            {patient.name}
                          </h6>
                          <small style={{ opacity: 0.9 }}>
                            {patient.age} years • {patient.gender}
                          </small>
                        </div>
                      </div>
                      <StatusIcon size={24} />
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: '1.5rem' }}>
                    {/* Score Display */}
                    <div className="text-center mb-4">
                      <div style={{
                        background: `${status.color}15`,
                        borderRadius: '50%',
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        border: `3px solid ${status.color}30`
                      }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: status.color }}>
                          {score}
                        </div>
                      </div>
                      <div style={{ 
                        background: status.color,
                        color: 'white',
                        padding: '0.25rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {status.label}
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div style={{
                      background: '#f8fafc',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}>
                      <div className="mb-2">
                        <small className="text-muted">Email</small>
                        <div style={{ fontSize: '0.9rem', color: '#374151' }}>{patient.email}</div>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted">Phone</small>
                        <div style={{ fontSize: '0.9rem', color: '#374151' }}>{patient.phone || 'Not provided'}</div>
                      </div>
                      <div>
                        <small className="text-muted">Last Updated</small>
                        <div style={{ fontSize: '0.9rem', color: '#374151' }}>Recently</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              <Heart size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No patients found</h5>
              <p className="text-muted">Try adjusting your search criteria.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorHealthScores;