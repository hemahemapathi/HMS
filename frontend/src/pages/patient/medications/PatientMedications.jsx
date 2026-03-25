import { useState, useEffect } from 'react';
import { 
  Pill, Clock, Calendar, CheckCircle, AlertCircle, 
  User, Search, Filter, Bell, Plus 
} from 'lucide-react';
import api from '../../../utils/api';

const PatientMedications = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medications/daily');
      console.log('Medications response:', response.data);
      console.log('Individual medications:', response.data.medications);
      setMedications(response.data.medications || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsTaken = async (medicationId) => {
    try {
      console.log('Marking medication as taken:', medicationId);
      await api.put(`/medications/${medicationId}/status`, { status: 'taken' });
      console.log('Status update successful, refetching medications...');
      await fetchMedications();
      showNotification('Medication marked as taken!');
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      showNotification('Failed to update medication status', 'error');
    }
  };

  const filteredMedications = medications.filter(medication => {
    const matchesTab = medication.status === activeTab;
    const matchesSearch = (medication.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (medication.prescribedBy || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getFrequencyIcon = (frequency) => {
    const freq = (frequency || '').toLowerCase();
    if (freq.includes('once')) return '1️⃣';
    if (freq.includes('twice')) return '2️⃣';
    if (freq.includes('three') || freq.includes('thrice')) return '3️⃣';
    return '🔄';
  };

  const getStatusBadge = (medication) => {
    if (medication.status === 'completed') {
      return <span className="badge bg-success">Completed</span>;
    }
    
    if (medication.remainingDays <= 2) {
      return <span className="badge bg-warning">Ending Soon</span>;
    }
    
    return <span className="badge bg-primary">Active</span>;
  };

  const getTodaysDose = (medication) => {
    const frequency = (medication.frequency || '').toLowerCase();
    if (frequency.includes('once')) return '1 dose today';
    if (frequency.includes('twice')) return '2 doses today';
    if (frequency.includes('three') || frequency.includes('thrice')) return '3 doses today';
    return 'As needed';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 text-center text-md-start">
          <h2 className="text-danger mb-1">My Medications</h2>
          <p className="text-muted">Track your prescribed medications and dosages</p>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="position-relative">
            <input
              type="text"
              className="form-control pe-5"
              placeholder="Search medications by name or doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-pills nav-fill">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'active' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('active')}
              >
                Active ({medications.filter(m => m.status === 'active').length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'upcoming' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming ({medications.filter(m => m.status === 'upcoming').length})
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'completed' ? 'active bg-danger' : 'text-danger'}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed ({medications.filter(m => m.status === 'completed').length})
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Medications List */}
      <div className="row">
        {filteredMedications.length > 0 ? (
          filteredMedications.map(medication => (
            <div key={medication._id} className="col-lg-6 col-xl-4 mb-4">
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body">
                  {/* Header */}
                  <div className="d-flex align-items-start mb-3">
                    <div className="flex-grow-1">
                      <h6 className="card-title text-danger mb-1">{medication.name}</h6>
                      <div className="mb-2">

                      </div>
                      <p className="text-muted small mb-0">
                        <strong>{medication.dosage || 'N/A'}</strong> • {medication.scheduledTime ? new Date(`2000-01-01T${medication.scheduledTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'As needed'}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <Calendar size={14} className="me-2" />
                      <span>
                        {new Date(medication.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <User size={14} className="me-2" />
                      <span>Prescribed by {medication.prescribedBy || 'Doctor'}</span>
                    </div>

                    <div className="d-flex align-items-center mb-2 text-muted small">
                      <Clock size={14} className="me-2" />
                      <span>Scheduled: {medication.scheduledTime ? new Date(`2000-01-01T${medication.scheduledTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'As needed'}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  {medication.instructions && (
                    <div className="mb-3">
                      <div className="alert alert-light py-2">
                        <small>
                          <strong>Instructions:</strong> {medication.instructions}
                        </small>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    {activeTab === 'active' ? (
                      <button 
                        className="btn btn-success btn-sm flex-grow-1"
                        onClick={() => markAsTaken(medication._id)}
                      >
                        <CheckCircle size={14} className="me-1" />
                        Mark as Taken
                      </button>
                    ) : activeTab === 'upcoming' ? (
                      <div className="w-100 text-center">
                        <span className="text-info">
                          <Clock size={16} className="me-1" />
                          Upcoming dose
                        </span>
                      </div>
                    ) : (
                      <div className="w-100 text-center">
                        <span className="text-success">
                          <CheckCircle size={16} className="me-1" />
                          Completed
                        </span>
                      </div>
                    )}
                  </div>

                
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <Pill size={64} className="text-muted mb-3" />
              <h5 className="text-muted">
                No {activeTab} medications found
              </h5>
              <p className="text-muted">
                {searchTerm 
                  ? 'Try adjusting your search criteria'
                  : activeTab === 'active' 
                    ? 'Your doctor will add medications after consultations'
                    : 'Completed medications will appear here'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Medication Summary */}
      {activeTab === 'active' && filteredMedications.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="card bg-light border-0">
              <div className="card-body">
                <h6 className="text-danger mb-3"> Today's Medication Schedule</h6>
                <div className="row">
                  {filteredMedications.map(medication => (
                    <div key={medication._id} className="col-md-6 col-lg-4 mb-2">
                      <div className="d-flex align-items-center">
                        <span className="me-2" style={{ fontSize: '1.2rem' }}>
                          {getFrequencyIcon(medication.frequency)}
                        </span>
                        <div>
                          <strong>{medication.name}</strong>
                          <br />
                          <small className="text-muted">{medication.scheduledTime ? new Date(`2000-01-01T${medication.scheduledTime}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'As needed'}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
            <strong>{notification.type === 'success' ? '✅' : '❌'}</strong> {notification.message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setNotification(null)}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientMedications;