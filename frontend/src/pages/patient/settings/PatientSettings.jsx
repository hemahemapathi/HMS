import { useState, useEffect } from 'react';
import { 
  Bell, Shield, User, Download, Trash2, Eye, EyeOff, 
  Smartphone, Mail, Lock, Globe, Moon, Sun, Save 
} from 'lucide-react';
import Loading from '../../../components/loading/Loading';

const PatientSettings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    notifications: {
      appointmentReminders: true,
      medicationAlerts: true,
      labResults: true,
      promotions: false,
      smsNotifications: true,
      emailNotifications: true,
      pushNotifications: true
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsTracking: false,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: '30'
    },
    preferences: {
      language: 'en',
      timezone: 'UTC-5',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY'
    }
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSave = () => {
    // API call to save settings
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    // API call to export user data
    alert('Data export initiated. You will receive an email with your data.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // API call to delete account
      alert('Account deletion initiated. You will receive a confirmation email.');
    }
  };

  if (loading) return <Loading />;

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: User },
    { id: 'data', label: 'Data & Account', icon: Download }
  ];

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="text-danger mb-1">Settings & Privacy</h2>
          <p className="text-muted">Manage your account preferences and privacy settings</p>
        </div>
      </div>

      <div className="row g-4">
        {/* Settings Navigation */}
        <div className="col-lg-3">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                        activeTab === tab.id ? 'active bg-danger text-white' : ''
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={20} className="me-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="fade-in-up">
                  <h5 className="text-danger mb-4">
                    <Bell size={24} className="me-2" />
                    Notification Preferences
                  </h5>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="mb-3">Health Notifications</h6>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.appointmentReminders}
                          onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                        />
                        <label className="form-check-label">Appointment Reminders</label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.medicationAlerts}
                          onChange={(e) => handleSettingChange('notifications', 'medicationAlerts', e.target.checked)}
                        />
                        <label className="form-check-label">Medication Alerts</label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.labResults}
                          onChange={(e) => handleSettingChange('notifications', 'labResults', e.target.checked)}
                        />
                        <label className="form-check-label">Lab Results</label>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <h6 className="mb-3">Delivery Methods</h6>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.pushNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                        />
                        <label className="form-check-label">
                          <Smartphone size={16} className="me-2" />
                          Push Notifications
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        />
                        <label className="form-check-label">
                          <Mail size={16} className="me-2" />
                          Email Notifications
                        </label>
                      </div>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.notifications.smsNotifications}
                          onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                        />
                        <label className="form-check-label">SMS Notifications</label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="fade-in-up">
                  <h5 className="text-danger mb-4">
                    <Shield size={24} className="me-2" />
                    Privacy Settings
                  </h5>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Profile Visibility</label>
                        <select
                          className="form-select"
                          value={settings.privacy.profileVisibility}
                          onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                        >
                          <option value="private">Private</option>
                          <option value="doctors">Visible to My Doctors</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                      
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.privacy.dataSharing}
                          onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Allow anonymous data sharing for research
                        </label>
                      </div>
                      
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.privacy.analyticsTracking}
                          onChange={(e) => handleSettingChange('privacy', 'analyticsTracking', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Enable analytics tracking for better experience
                        </label>
                      </div>
                      
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.privacy.marketingEmails}
                          onChange={(e) => handleSettingChange('privacy', 'marketingEmails', e.target.checked)}
                        />
                        <label className="form-check-label">
                          Receive marketing emails and promotions
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="fade-in-up">
                  <h5 className="text-danger mb-4">
                    <Lock size={24} className="me-2" />
                    Security Settings
                  </h5>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-check form-switch mb-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.security.twoFactorAuth}
                          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold">
                          Two-Factor Authentication
                        </label>
                        <div className="form-text">Add an extra layer of security to your account</div>
                      </div>
                      
                      <div className="form-check form-switch mb-4">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={settings.security.loginAlerts}
                          onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                        />
                        <label className="form-check-label fw-semibold">
                          Login Alerts
                        </label>
                        <div className="form-text">Get notified of new login attempts</div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Session Timeout</label>
                        <select
                          className="form-select"
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                        >
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                          <option value="120">2 hours</option>
                        </select>
                      </div>
                      
                      <button className="btn btn-outline-danger">
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="fade-in-up">
                  <h5 className="text-danger mb-4">
                    <User size={24} className="me-2" />
                    App Preferences
                  </h5>
                  
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Language</label>
                        <select
                          className="form-select"
                          value={settings.preferences.language}
                          onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Timezone</label>
                        <select
                          className="form-select"
                          value={settings.preferences.timezone}
                          onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                        >
                          <option value="UTC-8">Pacific Time (UTC-8)</option>
                          <option value="UTC-7">Mountain Time (UTC-7)</option>
                          <option value="UTC-6">Central Time (UTC-6)</option>
                          <option value="UTC-5">Eastern Time (UTC-5)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Theme</label>
                        <div className="btn-group w-100" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name="theme"
                            id="light"
                            checked={settings.preferences.theme === 'light'}
                            onChange={() => handleSettingChange('preferences', 'theme', 'light')}
                          />
                          <label className="btn btn-outline-danger" htmlFor="light">
                            <Sun size={16} className="me-2" />
                            Light
                          </label>
                          
                          <input
                            type="radio"
                            className="btn-check"
                            name="theme"
                            id="dark"
                            checked={settings.preferences.theme === 'dark'}
                            onChange={() => handleSettingChange('preferences', 'theme', 'dark')}
                          />
                          <label className="btn btn-outline-danger" htmlFor="dark">
                            <Moon size={16} className="me-2" />
                            Dark
                          </label>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label fw-semibold">Date Format</label>
                        <select
                          className="form-select"
                          value={settings.preferences.dateFormat}
                          onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Account Tab */}
              {activeTab === 'data' && (
                <div className="fade-in-up">
                  <h5 className="text-danger mb-4">
                    <Download size={24} className="me-2" />
                    Data & Account Management
                  </h5>
                  
                  <div className="row g-4">
                    <div className="col-12">
                      <div className="card border-info mb-4">
                        <div className="card-body">
                          <h6 className="card-title text-info">Export Your Data</h6>
                          <p className="card-text">Download a copy of all your health data and account information.</p>
                          <button onClick={handleExportData} className="btn btn-info">
                            <Download size={16} className="me-2" />
                            Request Data Export
                          </button>
                        </div>
                      </div>
                      
                      <div className="card border-warning mb-4">
                        <div className="card-body">
                          <h6 className="card-title text-warning">Data Retention</h6>
                          <p className="card-text">
                            Your health records are kept for 7 years as required by law. 
                            Personal data can be deleted upon request.
                          </p>
                        </div>
                      </div>
                      
                      <div className="card border-danger">
                        <div className="card-body">
                          <h6 className="card-title text-danger">Delete Account</h6>
                          <p className="card-text">
                            Permanently delete your account and all associated data. 
                            This action cannot be undone.
                          </p>
                          <button onClick={handleDeleteAccount} className="btn btn-danger">
                            <Trash2 size={16} className="me-2" />
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                <button onClick={handleSave} className="btn btn-danger btn-custom">
                  <Save size={16} className="me-2" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSettings;