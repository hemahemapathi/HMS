import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Mail, Phone, Calendar, X, ChevronDown } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminLoading from '../../../components/loading/AdminLoading';
import Toast from '../../../components/toast/Toast';
import api from '../../../utils/api';
import '../../../styles/admin-theme.css';

const AdminDoctors = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get('/admin/doctors');
        const formattedDoctors = data.users.map(doc => {
          let availabilityText = 'Not set';
          if (doc.availability && Array.isArray(doc.availability) && doc.availability.length > 0) {
            availabilityText = doc.availability.map(slot => 
              `${slot.day} ${slot.startTime}-${slot.endTime}`
            ).join(', ');
          }
          
          return {
            id: doc._id,
            name: doc.name,
            email: doc.email,
            phone: doc.phone || 'N/A',
            specialization: doc.specialization || 'General',
            experience: doc.experience || 0,
            status: doc.isApproved ? 'approved' : 'pending',
            joinDate: new Date(doc.createdAt).toLocaleDateString(),
            availability: availabilityText
          };
        });
        setDoctors(formattedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };
  
  const handleApprove = async (doctorId) => {
    try {
      console.log('Approving doctor:', doctorId);
      const response = await api.put(`/admin/doctors/${doctorId}/approve`);
      console.log('Approve response:', response.data);
      
      // Immediately update the state FIRST
      setDoctors(prevDoctors => 
        prevDoctors.map(doc => 
          doc.id === doctorId ? { ...doc, status: 'approved' } : doc
        )
      );
      
      // Close modal if open
      if (showModal) {
        setShowModal(false);
        setSelectedDoctor(null);
      }
      
      // Show toast LAST
      showToast('Doctor approved successfully!', 'success');
    } catch (error) {
      console.error('Approve error:', error);
      showToast(error.response?.data?.message || 'Failed to approve doctor', 'error');
    }
  };

  const handleReject = async (doctorId) => {
    try {
      console.log('Removing doctor:', doctorId);
      console.log('Current doctors before delete:', doctors.map(d => ({ id: d.id, name: d.name })));
      
      const response = await api.delete(`/admin/users/${doctorId}`);
      console.log('Delete response:', response.data);
      
      // Immediately remove from state FIRST
      const updatedDoctors = doctors.filter(doc => doc.id !== doctorId);
      console.log('Updated doctors after filter:', updatedDoctors.map(d => ({ id: d.id, name: d.name })));
      setDoctors(updatedDoctors);
      
      // Close modal if open
      if (showModal) {
        setShowModal(false);
        setSelectedDoctor(null);
      }
      
      // Show toast LAST
      showToast('Doctor removed successfully!', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast(error.response?.data?.message || 'Failed to remove doctor', 'error');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <AdminLoading />;

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="admin-text-primary fw-bold mb-2">Doctor Management</h2>
            <p className="text-muted">Approve doctors, manage profiles, and check availability</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <CheckCircle />
              </div>
              <h3 className="admin-text-primary">{doctors.filter(d => d.status === 'approved').length}</h3>
              <p className="text-muted mb-0">Approved Doctors</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Calendar />
              </div>
              <h3 className="admin-text-primary">{doctors.filter(d => d.status === 'pending').length}</h3>
              <p className="text-muted mb-0">Pending Approval</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Mail />
              </div>
              <h3 className="admin-text-primary">{doctors.length}</h3>
              <p className="text-muted mb-0">Total Doctors</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Phone />
              </div>
              <h3 className="admin-text-primary">{doctors.filter(d => d.availability).length}</h3>
              <p className="text-muted mb-0">Available Now</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="position-relative">
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search doctors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="position-absolute end-0 top-50 translate-middle-y me-3" size={18} style={{color: '#10b981'}} />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            {/* Mobile Status Button */}
            <div className="d-md-none">
              <button
                type="button"
                className="form-control text-start d-flex justify-content-between align-items-center"
                onClick={() => setShowStatusModal(true)}
              >
                <span>{statusFilter === 'all' ? 'All Status' : statusFilter === 'approved' ? 'Approved' : 'Pending Approval'}</span>
                <ChevronDown size={16} />
              </button>
            </div>
            {/* Desktop Select */}
            <div className="d-none d-md-block">
              <select
                className="form-select admin-form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="row">
          <div className="col-12">
            <div className="admin-data-table">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th style={{width: '200px'}}>Doctor</th>
                    <th style={{width: '120px'}}>Specialization</th>
                    <th style={{width: '100px'}}>Experience</th>
                    <th style={{width: '180px'}}>Contact</th>
                    <th style={{width: '150px'}}>Availability</th>
                    <th style={{width: '100px'}}>Status</th>
                    <th style={{width: '120px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>
                        <div>
                          <h6 className="mb-0">{doctor.name}</h6>
                          <small className="text-muted">Joined: {doctor.joinDate}</small>
                        </div>
                      </td>
                      <td>{doctor.specialization}</td>
                      <td>{doctor.experience} years</td>
                      <td>
                        <div className="small">
                          <div className="mb-1"><Mail size={14} className="me-1" />{doctor.email}</div>
                          <div><Phone size={14} className="me-1" />{doctor.phone}</div>
                        </div>
                      </td>
                      <td>
                        <div className="small text-wrap" style={{maxWidth: '150px'}}>
                          {doctor.availability.length > 30 ? 
                            doctor.availability.substring(0, 30) + '...' : 
                            doctor.availability
                          }
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${doctor.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                          {doctor.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            className="admin-action-btn admin-action-btn-view btn-sm"
                            onClick={() => handleViewDoctor(doctor)}
                          >
                            <Eye size={14} />
                          </button>
                          {doctor.status === 'pending' && (
                            <>
                              <button 
                                className="admin-action-btn admin-action-btn-approve btn-sm"
                                onClick={() => handleApprove(doctor.id)}
                              >
                                <CheckCircle size={14} />
                              </button>
                              <button 
                                className="admin-action-btn admin-action-btn-reject btn-sm"
                                onClick={() => handleReject(doctor.id)}
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                          {doctor.status === 'approved' && (
                            <button 
                              className="admin-action-btn admin-action-btn-reject btn-sm"
                              onClick={() => handleReject(doctor.id)}
                            >
                              Remove
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
      
      {/* Doctor Detail Modal */}
      {showModal && selectedDoctor && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Doctor Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Name</label>
                    <p className="mb-0">{selectedDoctor.name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Specialization</label>
                    <p className="mb-0">{selectedDoctor.specialization}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Email</label>
                    <p className="mb-0">{selectedDoctor.email}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Phone</label>
                    <p className="mb-0">{selectedDoctor.phone}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Experience</label>
                    <p className="mb-0">{selectedDoctor.experience} years</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Join Date</label>
                    <p className="mb-0">{selectedDoctor.joinDate}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Availability</label>
                    <p className="mb-0">{selectedDoctor.availability}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="fw-bold text-muted small">Status</label>
                    <p className="mb-0">
                      <span className={`badge ${selectedDoctor.status === 'approved' ? 'bg-success' : 'bg-warning'}`}>
                        {selectedDoctor.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {selectedDoctor.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        handleApprove(selectedDoctor.id);
                        handleCloseModal();
                      }}
                    >
                      Approve Doctor
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => {
                        handleReject(selectedDoctor.id);
                        handleCloseModal();
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Status Modal */}
      {showStatusModal && (
        <div className="modal show d-block d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog" style={{ maxWidth: '90vw', width: '300px', margin: '1rem' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Filter by Status</h6>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowStatusModal(false)}
                ></button>
              </div>
              <div className="modal-body p-2">
                {[
                  { value: 'all', label: 'All Status', icon: '📋' },
                  { value: 'approved', label: 'Approved', icon: '✅' },
                  { value: 'pending', label: 'Pending Approval', icon: '⏳' }
                ].map(status => (
                  <button
                    key={status.value}
                    type="button"
                    className={`btn w-100 text-start border mb-2 p-3 ${statusFilter === status.value ? 'btn-success text-white' : 'btn-light'}`}
                    onClick={() => {
                      setStatusFilter(status.value);
                      setShowStatusModal(false);
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3" style={{ fontSize: '1.2rem' }}>{status.icon}</span>
                      <span className="fw-bold">{status.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDoctors;