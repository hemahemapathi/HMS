import { useState, useEffect } from 'react';
import { Settings, Bell, User, Save, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminLoading from '../../../components/loading/AdminLoading';
import Toast from '../../../components/toast/Toast';
import api from '../../../utils/api';
import '../../../styles/admin-theme.css';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'Health Management System',
    adminName: '',
    adminEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setSettings(prev => ({
          ...prev,
          adminName: user.name || '',
          adminEmail: user.email || ''
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    fetchUserData();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveSettings = async () => {
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setToast({ message: 'New passwords do not match!', type: 'error' });
      return;
    }
    
    try {
      const updateData = {
        name: settings.adminName,
        email: settings.adminEmail
      };
      
      if (settings.newPassword) {
        updateData.password = settings.newPassword;
      }
      
      const { data } = await api.put('/auth/profile', updateData);
      
      // Update localStorage with new user data
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setToast({ message: 'Settings saved successfully!', type: 'success' });
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Failed to save settings', type: 'error' });
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <AdminLoading />;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="admin-text-primary mb-1">Settings</h2>
            <p className="text-muted">Manage your account and system preferences</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Profile Settings */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <User size={20} className="me-2" />
                  Profile Information
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">System Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={settings.systemName}
                    onChange={(e) => handleInputChange('systemName', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Admin Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={settings.adminName}
                    onChange={(e) => handleInputChange('adminName', e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={settings.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Settings size={20} className="me-2" />
                  Change Password
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <div className="position-relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      className="form-control" 
                      value={settings.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y me-2"
                      style={{ border: 'none', background: 'none' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-control" 
                    value={settings.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="form-control" 
                    value={settings.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Bell size={20} className="me-2" />
                  Notification Preferences
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={settings.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                      />
                      <label className="form-check-label">
                        <strong>Email Notifications</strong>
                        <br />
                        <small className="text-muted">Receive important updates via email</small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={settings.smsNotifications}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                      />
                      <label className="form-check-label">
                        <strong>SMS Notifications</strong>
                        <br />
                        <small className="text-muted">Get urgent alerts on your phone</small>
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={settings.autoBackup}
                        onChange={(e) => handleInputChange('autoBackup', e.target.checked)}
                      />
                      <label className="form-check-label">
                        <strong>Auto Backup</strong>
                        <br />
                        <small className="text-muted">Automatically backup data daily</small>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="col-12">
            <div className="text-center">
              <button className="btn admin-btn-primary btn-lg px-5" onClick={handleSaveSettings}>
                <Save size={20} className="me-2" />
                Save All Changes
              </button>
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

export default AdminSettings;
