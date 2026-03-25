import { useState, useEffect } from 'react';
import { Search, Filter, User, Shield, UserCheck, Plus, Edit, Trash2, Eye } from 'lucide-react';
import AdminLoading from '../../../components/loading/AdminLoading';
import '../../../styles/admin-theme.css';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setUsers([
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@hospital.com',
          role: 'doctor',
          status: 'active',
          lastLogin: '2024-12-05 09:30',
          specialization: 'Cardiology',
          joinDate: '2023-01-15'
        },
        {
          id: 2,
          name: 'John Smith',
          email: 'john.smith@email.com',
          role: 'patient',
          status: 'active',
          lastLogin: '2024-12-04 14:22',
          joinDate: '2023-03-20'
        },
        {
          id: 3,
          name: 'Admin User',
          email: 'admin@hospital.com',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-12-05 08:15',
          joinDate: '2022-12-01'
        },
        {
          id: 4,
          name: 'Dr. Michael Chen',
          email: 'michael.chen@hospital.com',
          role: 'doctor',
          status: 'inactive',
          lastLogin: '2024-11-28 16:45',
          specialization: 'Neurology',
          joinDate: '2023-06-10'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleBadge = (role) => {
    const config = {
      admin: { class: 'bg-danger', text: 'Admin' },
      doctor: { class: 'bg-primary', text: 'Doctor' },
      patient: { class: 'bg-success', text: 'Patient' }
    };
    return config[role] || config.patient;
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? { class: 'bg-success', text: 'Active' }
      : { class: 'bg-secondary', text: 'Inactive' };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <AdminLoading />;

  return (
    <div className="admin-portal">
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-text-primary mb-1">User Management</h2>
              <p className="text-muted">Manage users, roles, and permissions</p>
            </div>
            <button className="btn admin-btn-primary">
              <Plus size={16} className="me-2" />
              Add New User
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="admin-search-btn position-absolute end-0 top-50 translate-middle-y me-1">
                <Search size={18} />
              </button>
            </div>
          </div>
          
          <div className="col-lg-3 mb-3">
            <select
              className="form-select admin-form-control"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          </div>
          
          <div className="col-lg-3 mb-3">
            <button className="btn admin-btn-outline w-100">
              <Filter size={16} className="me-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* User Statistics */}
        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <User />
              </div>
              <h3 className="admin-text-primary">{users.length}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Shield />
              </div>
              <h3 className="admin-text-primary">{users.filter(u => u.role === 'doctor').length}</h3>
              <p className="text-muted mb-0">Doctors</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <UserCheck />
              </div>
              <h3 className="admin-text-primary">{users.filter(u => u.role === 'patient').length}</h3>
              <p className="text-muted mb-0">Patients</p>
            </div>
          </div>
          <div className="col-md-3">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <User />
              </div>
              <h3 className="admin-text-primary">{users.filter(u => u.status === 'active').length}</h3>
              <p className="text-muted mb-0">Active Users</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="row">
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">User Directory</h6>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table admin-table mb-0">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Join Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const roleBadge = getRoleBadge(user.role);
                        const statusBadge = getStatusBadge(user.status);
                        
                        return (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="admin-stats-icon me-3" style={{width: '40px', height: '40px'}}>
                                  <User size={20} />
                                </div>
                                <div>
                                  <h6 className="mb-0">{user.name}</h6>
                                  <small className="text-muted">{user.email}</small>
                                  {user.specialization && (
                                    <div><small className="text-info">{user.specialization}</small></div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`badge ${roleBadge.class}`}>
                                {roleBadge.text}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${statusBadge.class}`}>
                                {statusBadge.text}
                              </span>
                            </td>
                            <td>
                              <small>{user.lastLogin}</small>
                            </td>
                            <td>
                              <small>{user.joinDate}</small>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button className="btn btn-sm admin-btn-outline">
                                  <Eye size={14} />
                                </button>
                                <button className="btn btn-sm btn-outline-warning">
                                  <Edit size={14} />
                                </button>
                                <button className="btn btn-sm btn-outline-danger">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Management */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Role & Permission Management</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center">
                      <Shield size={32} className="admin-text-primary mb-2" />
                      <h6>Admin Role</h6>
                      <p className="small text-muted">Full system access and management</p>
                      <button className="btn admin-btn-outline btn-sm">Manage Permissions</button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center">
                      <UserCheck size={32} className="admin-text-primary mb-2" />
                      <h6>Doctor Role</h6>
                      <p className="small text-muted">Patient management and clinical access</p>
                      <button className="btn admin-btn-outline btn-sm">Manage Permissions</button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center">
                      <User size={32} className="admin-text-primary mb-2" />
                      <h6>Patient Role</h6>
                      <p className="small text-muted">Personal health record access</p>
                      <button className="btn admin-btn-outline btn-sm">Manage Permissions</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;