import { useState, useEffect } from 'react';
import { FileText, Image, Eye, Edit, Save } from 'lucide-react';
import api from '../../../utils/api';
import Toast from '../../../components/toast/Toast';
import '../../../styles/doctor-theme.css';

const DoctorHealthRecords = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchHealthRecords();
    }
  }, [patientId]);

  const fetchHealthRecords = async () => {
    try {
      const { data } = await api.get(`/health-records/patient/${patientId}`);
      setRecords(data.records || []);
    } catch (error) {
      setToast({ message: 'Failed to load health records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNotes = async (recordId) => {
    try {
      await api.put(`/health-records/${recordId}/notes`, { notes: doctorNotes });
      setToast({ message: 'Notes added successfully!', type: 'success' });
      setEditingRecord(null);
      setDoctorNotes('');
      fetchHealthRecords();
    } catch (error) {
      setToast({ message: 'Failed to add notes', type: 'error' });
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '300px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h5 className="doctor-text-primary mb-3">Patient Health Records</h5>
      
      {records.length === 0 ? (
        <div className="text-center py-4">
          <FileText size={48} className="text-muted mb-2" />
          <p className="text-muted">No health records available for this patient</p>
        </div>
      ) : (
        <div className="row g-3">
          {records.map((record) => (
            <div key={record._id} className="col-md-6">
              <div className="doctor-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${getRecordTypeColor(record.recordType)}`}>
                      {record.recordType.replace('_', ' ')}
                    </span>
                    {record.isVerified && (
                      <span className="badge bg-success">Verified</span>
                    )}
                  </div>
                  
                  <h6 className="card-title">{record.title}</h6>
                  <p className="card-text text-muted small">{record.description}</p>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      Uploaded: {new Date(record.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                  
                  {record.files && record.files.length > 0 && (
                    <div className="mb-2">
                      <small className="text-muted d-block mb-1">Files:</small>
                      {record.files.map((file, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between mb-1">
                          <div className="d-flex align-items-center">
                            {file.mimetype === 'application/pdf' ? (
                              <FileText size={14} className="text-danger me-1" />
                            ) : (
                              <Image size={14} className="text-primary me-1" />
                            )}
                            <small className="text-truncate" style={{maxWidth: '120px'}}>
                              {file.originalName}
                            </small>
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => viewFile(file.filename)}
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {editingRecord === record._id ? (
                    <div className="mt-2">
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows="3"
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Add your consultation notes..."
                      ></textarea>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleAddNotes(record._id)}
                        >
                          <Save size={12} className="me-1" />
                          Save
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            setEditingRecord(null);
                            setDoctorNotes('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {record.doctorNotes ? (
                        <div className="mt-2 p-2 bg-light rounded">
                          <small className="fw-bold text-muted d-block">Your Notes:</small>
                          <small className="text-muted">{record.doctorNotes}</small>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-sm btn-outline-primary mt-2"
                          onClick={() => {
                            setEditingRecord(record._id);
                            setDoctorNotes(record.doctorNotes || '');
                          }}
                        >
                          <Edit size={12} className="me-1" />
                          Add Notes
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default DoctorHealthRecords;