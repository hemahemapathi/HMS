import { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, FileText, TrendingUp, Shield } from 'lucide-react';
import axios from 'axios';
import Loading from '../../components/loading/Loading';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRecords: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch users (mock data for now)
      setUsers([
        { _id: '1', name: 'Dr. John Smith', email: 'john@hms.com', role: 'doctor', status: 'active' },
        { _id: '2', name: 'Jane Doe', email: 'jane@hms.com', role: 'patient', status: 'active' },
        { _id: '3', name: 'Admin User', email: 'admin@hms.com', role: 'admin', status: 'active' }
      ]);
      
      setStats({
        totalUsers: 156,
        totalDoctors: 23,
        totalPatients: 128,
        totalAppointments: 89,
        totalRecords: 234
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div className="main-content" style={{ marginLeft: '250px', padding: '30px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-danger mb-1">Admin Panel</h2>
          <p className="text-muted">Manage your healthcare system</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-danger">
            <Shield size={16} className="me-2" />
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="stats-card">
            <div className="stats-icon gradient-bg">
              <Users />
            </div>
            <h3 className="text-danger">{stats.totalUsers}</h3>
            <p className="text-muted mb-0">Total Users</p>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="stats-card">
            <div className="stats-icon" style={{ background: '#28a745' }}>
              <UserCheck />
            </div>
            <h3 className="text-success">{stats.totalDoctors}</h3>
            <p className="text-muted mb-0">Active Doctors</p>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="stats-card">
            <div className="stats-icon" style={{ background: '#17a2b8' }}>
              <Calendar />
            </div>
            <h3 className="text-info">{stats.totalAppointments}</h3>
            <p className="text-muted mb-0">Appointments</p>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="stats-card">
            <div className="stats-icon" style={{ background: '#ffc107' }}>
              <FileText />
            </div>
            <h3 className="text-warning">{stats.totalRecords}</h3>
            <p className="text-muted mb-0">Health Records</p>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-4 mb-3">
          <div className="stats-card">
            <div className="stats-icon" style={{ background: '#6f42c1' }}>
              <TrendingUp />
            </div>
            <h3 className="text-primary">+12%</h3>
            <p className="text-muted mb-0">Growth Rate</p>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="card card-hover mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0 text-danger">User Management</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-danger">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="fw-semibold">{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-custom ${
                        user.role === 'admin' ? 'bg-danger' :
                        user.role === 'doctor' ? 'bg-success' : 'bg-info'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-success badge-custom">
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary">Edit</button>
                        <button className="btn btn-outline-danger">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card card-hover">
            <div className="card-body text-center">
              <Users size={48} className="text-danger mb-3" />
              <h5>Manage Users</h5>
              <p className="text-muted">Add, edit, or remove system users</p>
              <button className="btn btn-danger btn-custom">Manage Users</button>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-3">
          <div className="card card-hover">
            <div className="card-body text-center">
              <Shield size={48} className="text-danger mb-3" />
              <h5>System Settings</h5>
              <p className="text-muted">Configure system preferences</p>
              <button className="btn btn-danger btn-custom">Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;