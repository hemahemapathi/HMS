import { useState, useEffect } from 'react';
import { 
  Bell, Shield, User, Download, Trash2, Lock, 
  Globe, Moon, Sun, Save, Calendar, Stethoscope 
} from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';

const DoctorSettings = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [settings, setSettings] = useState({
    notifications: {
      appointmentReminders: true,
      patientMessages: true,
      labResults: true,
      emergencyAlerts: true,
      systemUpdates: false,
      emailNotifications: true,
      smsNotifications: true
    },
    privacy: {
      profileVisibility: 'colleagues',
      patientDataSharing: false,
      researchParticipation: true,
      marketingEmails: false
    },
    security: {
      twoFactorAuth: true,
      loginAlerts: true,
      sessionTimeout: '60',
      autoLogout: true
    },
    preferences: {
      language: 'en',
      timezone: 'UTC-5',
      theme: 'light',
      dateFormat: 'MM/DD/YYYY',
      appointmentDuration: '30'
    },
    clinical: {
      defaultAppointmentType: 'consultation',
      prescriptionReminders: true,
      clinicalAlerts: true,
      patientRiskNotifications: true
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
    alert('Settings saved successfully!');
  };

  if (loading) return <DoctorLoading />;

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'clinical', label: 'Clinical Settings', icon: Stethoscope },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: User }
  ];

  return (
    <div className="doctor-portal">
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="doctor-text-primary mb-1">Settings & Preferences</h2>
            <p className="text-muted">Manage your account and clinical preferences</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Settings Navigation */}
          <div className="col-lg-3">
            <div className="doctor-card">
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`list-group-item list-group-item-action d-flex align-items-center py-3 ${
                          activeTab === tab.id ? 'active' : ''
                        }`}
                        style={{
                          backgroundColor: activeTab === tab.id ? '#0ea5e9' : 'transparent',
                          color: activeTab === tab.id ? 'white' : '#334155',
                          borderColor: activeTab === tab.id ? '#0ea5e9' : '#e2e8f0'
                        }}
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
            <div className="doctor-card">
              <div className="card-body p-4">
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h5 className="doctor-text-primary mb-4">
                      <Bell size={24} className="me-2" />
                      Notification Preferences
                    </h5>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <h6 className="mb-3">Clinical Notifications</h6>
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
                            checked={settings.notifications.patientMessages}
                            onChange={(e) => handleSettingChange('notifications', 'patientMessages', e.target.checked)}
                          />
                          <label className="form-check-label">Patient Messages</label>
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
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.emergencyAlerts}
                            onChange={(e) => handleSettingChange('notifications', 'emergencyAlerts', e.target.checked)}
                          />
                          <label className="form-check-label">Emergency Alerts</label>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <h6 className="mb-3">Delivery Methods</h6>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.emailNotifications}
                            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">Email Notifications</label>
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
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.notifications.systemUpdates}
                            onChange={(e) => handleSettingChange('notifications', 'systemUpdates', e.target.checked)}
                          />
                          <label className="form-check-label">System Updates</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clinical Settings Tab */}
                {activeTab === 'clinical' && (
                  <div>
                    <h5 className="doctor-text-primary mb-4">
                      <Stethoscope size={24} className="me-2" />
                      Clinical Settings
                    </h5>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Default Appointment Duration</label>
                          <select
                            className="form-select doctor-form-control"
                            value={settings.preferences.appointmentDuration}
                            onChange={(e) => handleSettingChange('preferences', 'appointmentDuration', e.target.value)}
                          >
                            <option value="15">15 minutes</option>
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Default Appointment Type</label>
                          <select
                            className="form-select doctor-form-control"
                            value={settings.clinical.defaultAppointmentType}
                            onChange={(e) => handleSettingChange('clinical', 'defaultAppointmentType', e.target.value)}
                          >
                            <option value="consultation">Consultation</option>
                            <option value="follow-up">Follow-up</option>
                            <option value="checkup">Regular Checkup</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <h6 className="mb-3">Clinical Alerts</h6>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.clinical.prescriptionReminders}
                            onChange={(e) => handleSettingChange('clinical', 'prescriptionReminders', e.target.checked)}
                          />
                          <label className="form-check-label">Prescription Reminders</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.clinical.clinicalAlerts}
                            onChange={(e) => handleSettingChange('clinical', 'clinicalAlerts', e.target.checked)}
                          />
                          <label className="form-check-label">Clinical Decision Alerts</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.clinical.patientRiskNotifications}
                            onChange={(e) => handleSettingChange('clinical', 'patientRiskNotifications', e.target.checked)}
                          />
                          <label className="form-check-label">Patient Risk Notifications</label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h5 className="doctor-text-primary mb-4">
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
                          <div className="form-text">Enhanced security for your account</div>
                        </div>
                        
                        <div className="form-check form-switch mb-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={settings.security.loginAlerts}
                            onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                          />
                          <label className="form-check-label fw-semibold">Login Alerts</label>
                          <div className="form-text">Get notified of new login attempts</div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Session Timeout</label>
                          <select
                            className="form-select doctor-form-control"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                          >
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="120">2 hours</option>
                            <option value="240">4 hours</option>
                          </select>
                        </div>
                        
                        <button className="btn doctor-btn-outline">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h5 className="doctor-text-primary mb-4">
                      <User size={24} className="me-2" />
                      App Preferences
                    </h5>
                    
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Language</label>
                          <select
                            className="form-select doctor-form-control"
                            value={settings.preferences.language}
                            onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                          </select>
                        </div>
                        
                        <div className="mb-4">
                          <label className="form-label fw-semibold">Timezone</label>
                          <select
                            className="form-select doctor-form-control"
                            value={settings.preferences.timezone}
                            onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                          >
                            <option value="UTC-8">Pacific Time (UTC-8)</option>
                            <option value="UTC-5">Eastern Time (UTC-5)</option>
                            <option value="UTC+0">GMT (UTC+0)</option>
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
                            <label className="btn btn-outline-primary" htmlFor="light">
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
                            <label className="btn btn-outline-primary" htmlFor="dark">
                              <Moon size={16} className="me-2" />
                              Dark
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button onClick={handleSave} className="btn doctor-btn-primary">
                    <Save size={16} className="me-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;