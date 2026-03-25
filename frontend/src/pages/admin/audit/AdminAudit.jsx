import { useState, useEffect } from 'react';
import { Shield, Eye, Download, Search, Filter, AlertTriangle } from 'lucide-react';
import AdminLoading from '../../../components/loading/AdminLoading';
import '../../../styles/admin-theme.css';

const AdminAudit = () => {
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setAuditLogs([
        { id: 1, user: 'Dr. Sarah Johnson', action: 'Patient record accessed', resource: 'Patient #1234', timestamp: '2024-12-05 14:30:22', ip: '192.168.1.100', status: 'success' },
        { id: 2, user: 'Admin User', action: 'User role modified', resource: 'User #567', timestamp: '2024-12-05 13:15:10', ip: '192.168.1.50', status: 'success' },
        { id: 3, user: 'John Smith', action: 'Failed login attempt', resource: 'Login System', timestamp: '2024-12-05 12:45:33', ip: '203.0.113.45', status: 'failed' },
        { id: 4, user: 'Dr. Michael Chen', action: 'Prescription created', resource: 'Patient #2345', timestamp: '2024-12-05 11:20:15', ip: '192.168.1.75', status: 'success' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <div className="admin-portal">
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-text-primary mb-1">Audit Logs & Compliance</h2>
              <p className="text-muted">Access logs, compliance reports, and audit trails</p>
            </div>
            <button className="btn admin-btn-primary">
              <Download size={16} className="me-2" />
              Export Audit Report
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="row mb-4">
          <div className="col-lg-6 mb-3">
            <div className="search-container">
              <input
                type="text"
                className="form-control admin-search-input"
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="admin-search-btn position-absolute end-0 top-50 translate-middle-y me-1">
                <Search size={18} />
              </button>
            </div>
          </div>
          <div className="col-lg-6">
            <button className="btn admin-btn-outline w-100">
              <Filter size={16} className="me-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Audit Statistics */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Eye />
              </div>
              <h3 className="admin-text-primary">2,847</h3>
              <p className="text-muted mb-0">Total Access Logs</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Shield />
              </div>
              <h3 className="admin-text-primary">23</h3>
              <p className="text-muted mb-0">Security Events</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <AlertTriangle />
              </div>
              <h3 className="admin-text-primary">5</h3>
              <p className="text-muted mb-0">Failed Attempts</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Download />
              </div>
              <h3 className="admin-text-primary">12</h3>
              <p className="text-muted mb-0">Compliance Reports</p>
            </div>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="row">
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Recent Audit Logs</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table admin-table mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Resource</th>
                        <th>Timestamp</th>
                        <th>IP Address</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.user}</td>
                          <td>{log.action}</td>
                          <td>{log.resource}</td>
                          <td>{log.timestamp}</td>
                          <td><code>{log.ip}</code></td>
                          <td>
                            <span className={`badge ${
                              log.status === 'success' ? 'bg-success' : 'bg-danger'
                            }`}>
                              {log.status}
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
      </div>
    </div>
  );
};

export default AdminAudit;