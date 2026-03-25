import { useState, useEffect } from 'react';
import { FileText, Image, Eye, Trash2, Search, AlertTriangle } from 'lucide-react';
import api from '../../../utils/api';
import Toast from '../../../components/toast/Toast';
import AdminLayout from '../../../components/layout/AdminLayout';
import '../../../styles/admin-theme.css';

const AdminHealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [duplicates, setDuplicates] = useState([]);

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const { data } = await api.get('/health-records/all');
      setRecords(data.records || []);
      detectDuplicates(data.records || []);
    } catch (error) {
      setToast({ message: 'Failed to load health records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const detectDuplicates = (recordsList) => {
    const duplicateGroups = [];
    const seen = new Map();

    recordsList.forEach(record => {
      const key = `${record.patient._id}-${record.title}-${record.recordType}`;
      if (seen.has(key)) {
        const existing = seen.get(key);
        if (!duplicateGroups.find(group => group.includes(existing))) {
          duplicateGroups.push([existing, record]);
        } else {
          const group = duplicateGroups.find(group => group.includes(existing));
          group.push(record);
        }
      } else {
        seen.set(key, record);
      }
    });

    setDuplicates(duplicateGroups.flat());
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this health record?')) {
      return;
    }

    try {
      await api.delete(`/health-records/${recordId}`);
      setToast({ message: 'Health record deleted successfully', type: 'success' });
      fetchHealthRecords();
    } catch (error) {
      setToast({ message: 'Failed to delete health record', type: 'error' });
    }
  };

  const viewFile = (filename) => {
    window.open(`${api.defaults.baseURL}/health-records/file/${filename}`, '_blank');
  };

  const getRecordTypeColor = (type) => {
    const colors = {
      prescription: 'bg-primary',
      lab_result: 'bg-success',
      consultation: 'bg-info',
      report: 'bg-warning',
      medical_history: 'bg-danger',
      imaging: 'bg-secondary',
      other: 'bg-dark'
    };
    return colors[type] || colors.other;
  };

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.recordType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="admin-text-primary mb-1">Health Records Management</h2>
            <p className="text-muted">Manage patient health records and detect duplicates</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <FileText />
              </div>
              <h3 className="admin-text-primary">{records.length}</h3>
              <p className="text-muted mb-0">Total Records</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <AlertTriangle />
              </div>
              <h3 className="admin-text-primary">{duplicates.length}</h3>
              <p className="text-muted mb-0">Potential Duplicates</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Eye />
              </div>
              <h3 className="admin-text-primary">{records.filter(r => r.isVerified).length}</h3>
              <p className="text-muted mb-0">Verified Records</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Image />
              </div>
              <h3 className="admin-text-primary">{records.reduce((sum, r) => sum + (r.files?.length || 0), 0)}</h3>
              <p className="text-muted mb-0">Total Files</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="position-relative">
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search by patient name, title, or record type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingRight: '45px' }}
              />
              <Search className="position-absolute end-0 top-50 translate-middle-y me-3" size={18} style={{color: '#10b981'}} />
            </div>
          </div>
        </div>

        {/* Duplicates Alert */}
        {duplicates.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-warning">
                <AlertTriangle size={16} className="me-2" />
                <strong>{duplicates.length} potential duplicate records detected.</strong> 
                Review records with similar titles and types for the same patient.
              </div>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="row">
          <div className="col-12">
            <div className="admin-data-table">
              <table className="table mb-0">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Record Title</th>
                    <th>Type</th>
                    <th>Files</th>
                    <th>Upload Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr 
                      key={record._id} 
                      style={{
                        background: duplicates.some(d => d._id === record._id) ? '#fff3cd' : 'transparent'
                      }}
                    >
                      <td>
                        <div>
                          <h6 className="mb-0">{record.patient?.name || 'Unknown'}</h6>
                          <small className="text-muted">{record.patient?.email}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <h6 className="mb-0">{record.title}</h6>
                          <small className="text-muted">{record.description}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getRecordTypeColor(record.recordType)}`}>
                          {record.recordType.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {record.files && record.files.length > 0 ? (
                          <div className="d-flex flex-column gap-1">
                            {record.files.map((file, index) => (
                              <div key={index} className="d-flex align-items-center gap-2">
                                <div className="d-flex align-items-center">
                                  {file.mimetype === 'application/pdf' ? (
                                    <FileText size={14} className="text-danger me-1" />
                                  ) : (
                                    <Image size={14} className="text-primary me-1" />
                                  )}
                                  <small className="text-truncate" style={{maxWidth: '80px'}} title={file.originalName}>
                                    {file.originalName}
                                  </small>
                                </div>
                                <button 
                                  className="btn btn-sm btn-outline-primary px-2 py-1"
                                  onClick={() => viewFile(file.filename)}
                                  title="View File"
                                >
                                  <Eye size={10} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">No files</span>
                        )}
                      </td>
                      <td>
                        <small>{new Date(record.createdAt).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className={`badge ${record.isVerified ? 'bg-success' : 'bg-warning'}`}>
                            {record.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          {duplicates.some(d => d._id === record._id) && (
                            <span className="badge bg-warning">Duplicate?</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button 
                          className="admin-action-btn admin-action-btn-reject btn-sm"
                          onClick={() => handleDeleteRecord(record._id)}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted">No health records found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
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

export default AdminHealthRecords;