import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit, Save } from 'lucide-react';
import AdminLoading from '../../../components/loading/AdminLoading';
import '../../../styles/admin-theme.css';

const AdminProfile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'System Administrator',
    email: 'admin@hospital.com',
    phone: '+1 (555) 123-4567',
    role: 'Super Admin',
    department: 'IT Administration',
    joinDate: '2022-01-15',
    lastLogin: '2024-12-05 08:15:22'
  });

  useEffect(() => {
    setTimeout(() => {
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
              <h2 className="admin-text-primary mb-1">Admin Profile</h2>
              <p className="text-muted">Manage your administrator account settings</p>
            </div>
            <button 
              className="btn admin-btn-primary"
              onClick={() => setEditing(!editing)}
            >
              {editing ? <Save size={16} className="me-2" /> : <Edit size={16} className="me-2" />}
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="admin-card text-center">
              <div className="card-body p-4">
                <div className="admin-stats-icon mb-3" style={{width: '80px', height: '80px'}}>
                  <User size={40} />
                </div>
                <h5 className="admin-text-primary">{profileData.name}</h5>
                <p className="text-muted">{profileData.role}</p>
                <span className="admin-badge">{profileData.department}</span>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Profile Information</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control admin-form-control"
                      value={profileData.name}
                      disabled={!editing}
                      onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control admin-form-control"
                      value={profileData.email}
                      disabled={!editing}
                      onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control admin-form-control"
                      value={profileData.phone}
                      disabled={!editing}
                      onChange={(e) => setProfileData(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      className="form-control admin-form-control"
                      value={profileData.department}
                      disabled={!editing}
                      onChange={(e) => setProfileData(prev => ({...prev, department: e.target.value}))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Join Date</label>
                    <input 
                      type="text" 
                      className="form-control admin-form-control"
                      value={profileData.joinDate}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Login</label>
                    <input 
                      type="text" 
                      className="form-control admin-form-control"
                      value={profileData.lastLogin}
                      disabled
                    />
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

export default AdminProfile;