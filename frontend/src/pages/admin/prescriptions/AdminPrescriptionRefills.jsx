import { useState, useEffect } from 'react';
import { Pill, Check, X, Clock } from 'lucide-react';
import api from '../../../utils/api';

const AdminPrescriptionRefills = () => {
  const [refillRequests, setRefillRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefillRequests();
  }, []);

  const fetchRefillRequests = async () => {
    try {
      const response = await api.get('/admin/prescription-refills');
      setRefillRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error fetching refill requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefillRequest = async (requestId, action) => {
    try {
      await api.put(`/admin/prescription-refills/${requestId}`, { action });
      fetchRefillRequests();
      alert(`Refill request ${action}ed successfully!`);
    } catch (error) {
      console.error('Error handling refill request:', error);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-danger mb-1">Prescription Refill Requests</h2>
          <p className="text-muted">Manage patient prescription refill requests</p>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {refillRequests.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Medication</th>
                        <th>Dosage</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refillRequests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            <div>
                              <strong>{request.patient?.name}</strong>
                              <br />
                              <small className="text-muted">{request.patient?.email}</small>
                            </div>
                          </td>
                          <td>{request.medicationName}</td>
                          <td>{request.medication?.dosage}</td>
                          <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${ 
                              request.status === 'approved' ? 'bg-success' :
                              request.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="btn-group">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleRefillRequest(request._id, 'approve')}
                                >
                                  <Check size={16} /> Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleRefillRequest(request._id, 'reject')}
                                >
                                  <X size={16} /> Reject
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Pill size={48} className="text-muted mb-3" />
                  <p className="text-muted">No refill requests found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPrescriptionRefills;