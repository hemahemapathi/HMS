import { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Eye, Filter, Search, 
  Calendar, User, Plus, Trash2, AlertCircle 
} from 'lucide-react';
import api from '../../../utils/api';
import MobileSelect from '../../../components/MobileSelect';

const PatientHealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'lab_result',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const recordTypes = [
    { value: 'all', label: 'All Records', icon: FileText },
    { value: 'consultation', label: 'Consultation Notes', icon: FileText },
    { value: 'lab_result', label: 'Lab Reports', icon: FileText },
    { value: 'prescription', label: 'Prescriptions', icon: FileText },
    { value: 'imaging', label: 'Scans/X-rays', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/health-records');
      console.log('Health records response:', response.data);
      const records = response.data.records || [];
      
      setRecords(records);
    } catch (error) {
      console.error('Error fetching health records:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.file) {
      alert('Please fill all fields and select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('recordType', uploadData.type);
      formData.append('file', uploadData.file);

      const response = await api.post('/health-records', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setShowUploadModal(false);
        setUploadData({ title: '', type: 'lab_result', file: null });
        fetchHealthRecords();
        showNotification('Health record uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Failed to upload health record', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (record) => {
    try {
      const response = await api.get(`/health-records/${record._id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${record.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/health-records/${recordToDelete._id}`);
      fetchHealthRecords();
      showNotification('Health record deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete health record', 'error');
    } finally {
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  const handlePreview = (record) => {
    const token = localStorage.getItem('token');
    const previewUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/health-records/${record._id}/preview?token=${token}`;
    setPreviewUrl(previewUrl);
    setPreviewRecord(record);
    setShowPreviewModal(true);
  };

  const filteredRecords = records.filter(record => {
    const recordType = record.recordType || record.type;
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recordType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getTypeIcon = (type) => {
    const config = {
      'consultation': { icon: '👨‍⚕️', color: 'text-info' },
      'lab_result': { icon: '🧪', color: 'text-primary' },
      'prescription': { icon: '💊', color: 'text-success' },
      'imaging': { icon: '🩻', color: 'text-warning' },
      'other': { icon: '📄', color: 'text-secondary' }
    };
    return config[type] || config['other'];
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
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center">
          <div className="mb-3 mb-md-0 text-center text-md-start">
            <h2 className="text-danger mb-1">Health Records</h2>
            <p className="text-muted">Upload, view and manage your medical records</p>
          </div>
          <button 
            className="btn btn-danger"
            onClick={() => setShowUploadModal(true)}
          >
            <Plus size={16} className="me-2" />
            Upload Record
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="position-relative">
            <input
              type="text"
              className="form-control pe-5"
              placeholder="Search records by title or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={18} className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted" />
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="row">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => {
            const typeConfig = getTypeIcon(record.recordType || record.type);
            return (
              <div key={record._id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-start mb-3">
                      <div className={`me-3 ${typeConfig.color}`} style={{ fontSize: '2rem' }}>
                        {typeConfig.icon}
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="card-title text-danger mb-1">{record.title}</h6>
                        <span className={`badge bg-light ${typeConfig.color} border`}>
                          {record.recordType || record.type}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2 text-muted small">
                        <Calendar size={14} className="me-2" />
                        <span>Uploaded: {new Date(record.createdAt || record.uploadDate).toLocaleDateString()}</span>
                      </div>
                      {record.uploadedBy && (
                        <div className="d-flex align-items-center text-muted small">
                          <User size={14} className="me-2" />
                          <span>By: {typeof record.uploadedBy === 'string' ? record.uploadedBy : record.uploadedBy.name || 'Unknown'}</span>
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small">
                        📁 {record.files?.length || 0} file(s)
                      </div>
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handlePreview(record)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDelete(record)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <FileText size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No health records found</h5>
              <p className="text-muted">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload your first health record to get started'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}>
          <div className="modal-dialog" style={{ zIndex: 1050 }}>
            <div className="modal-content" style={{ overflow: 'visible' }}>
              <div className="modal-header">
                <h5 className="modal-title text-danger">Upload Health Record</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ overflow: 'visible' }}>
                <div className="mb-3">
                  <label className="form-label">Record Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Blood Test Report - Dec 2024"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  />
                </div>

                <div className="mb-3" style={{ position: 'relative', zIndex: 1060 }}>
                  <label className="form-label">Record Type *</label>
                  <MobileSelect
                    options={[
                      { value: 'lab_result', label: 'Lab Report' },
                      { value: 'prescription', label: 'Prescription' },
                      { value: 'imaging', label: 'Scan/X-ray' },
                      { value: 'other', label: 'Other' }
                    ]}
                    value={uploadData.type}
                    onChange={(value) => setUploadData({...uploadData, type: value})}
                    placeholder="Select record type"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload File *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                  />
                  <small className="text-muted">Supported formats: PDF, JPG, PNG (Max 10MB)</small>
                </div>

                {uploadData.file && (
                  <div className="alert alert-info">
                    <strong>Selected file:</strong> {uploadData.file.name}
                    <br />
                    <strong>Size:</strong> {(uploadData.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleUpload}
                  disabled={uploading || !uploadData.title || !uploadData.file}
                >
                  {uploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} className="me-2" />
                      Upload Record
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewRecord && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  Preview: {previewRecord.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewRecord(null);
                    if (previewUrl) {
                      window.URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ height: '70vh' }}>
                {previewUrl && (
                  <iframe
                    src={previewUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title={`Preview of ${previewRecord.title}`}
                  />
                )}
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-success"
                  onClick={() => handleDownload(previewRecord)}
                >
                  <Download size={16} className="me-2" />
                  Download
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewRecord(null);
                    if (previewUrl) {
                      window.URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Health Record</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete <strong>"{recordToDelete.title}"</strong>?</p>
                <p className="text-muted small">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  <Trash2 size={16} className="me-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`position-fixed top-0 end-0 m-3`} style={{ zIndex: 9999 }}>
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

export default PatientHealthRecords;