import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Loading from '../loading/Loading';

const HealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'lab_result'
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/health-records');
      setRecords(response.data.healthRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('title', formData.title);
    uploadData.append('description', formData.description);
    uploadData.append('type', formData.type);

    try {
      await api.post('/health-records', uploadData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('File uploaded successfully!');
      setFormData({ title: '', description: '', type: 'lab_result' });
      setFile(null);
      fetchRecords();
    } catch (error) {
      alert('Upload failed');
    }
    setUploading(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="text-danger mb-4">Health Records</h2>
          
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Upload New Record</h5>
              <form onSubmit={handleUpload}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="lab_result">Lab Result</option>
                      <option value="prescription">Prescription</option>
                      <option value="report">Report</option>
                      <option value="medical_history">Medical History</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          </div>

          <div className="row">
            {records.map((record) => (
              <div key={record._id} className="col-md-6 col-lg-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h6 className="card-title text-danger">{record.title}</h6>
                    <p className="card-text small">{record.description}</p>
                    <p className="card-text">
                      <small className="text-muted">Type: {record.type}</small>
                    </p>
                    {record.fileUrl && (
                      <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${record.fileUrl}`} 
                         className="btn btn-sm btn-outline-danger" 
                         target="_blank" 
                         rel="noopener noreferrer">
                        View File
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;