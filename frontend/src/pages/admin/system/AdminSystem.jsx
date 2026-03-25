import { useState, useEffect } from 'react';
import { Settings, Database, Shield, Wifi, ToggleLeft, ToggleRight, Save } from 'lucide-react';
import AdminLoading from '../../../components/loading/AdminLoading';
import '../../../styles/admin-theme.css';

const AdminSystem = () => {
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState({
    integrations: {
      ehrSystem: true,
      labIntegration: false,
      paymentGateway: true,
      emailService: true
    },
    featureFlags: {
      telehealth: true,
      aiDiagnostics: false,
      mobileApp: true,
      patientPortal: true
    },
    systemConfig: {
      maxUsers: 5000,
      sessionTimeout: 30,
      backupFrequency: 'daily',
      maintenanceWindow: '02:00-04:00'
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const toggleIntegration = (key) => {
    setSystemSettings(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [key]: !prev.integrations[key]
      }
    }));
  };

  const toggleFeature = (key) => {
    setSystemSettings(prev => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: !prev.featureFlags[key]
      }
    }));
  };

  if (loading) return <AdminLoading />;

  return (
    <div className="admin-portal">
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="admin-text-primary mb-1">System Configuration</h2>
              <p className="text-muted">EHR integrations, feature flags, and system settings</p>
            </div>
            <button className="btn admin-btn-primary">
              <Save size={16} className="me-2" />
              Save All Changes
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* System Integrations */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Wifi size={20} className="me-2" />
                  System Integrations
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">EHR System Integration</h6>
                      <small className="text-muted">Connect with Electronic Health Records</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleIntegration('ehrSystem')}
                    >
                      {systemSettings.integrations.ehrSystem ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                  <div className="border-bottom pb-3"></div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">Laboratory Integration</h6>
                      <small className="text-muted">Connect with lab systems for results</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleIntegration('labIntegration')}
                    >
                      {systemSettings.integrations.labIntegration ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                  <div className="border-bottom pb-3"></div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">Payment Gateway</h6>
                      <small className="text-muted">Process payments and billing</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleIntegration('paymentGateway')}
                    >
                      {systemSettings.integrations.paymentGateway ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                  <div className="border-bottom pb-3"></div>
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">Email Service</h6>
                      <small className="text-muted">Send notifications and communications</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleIntegration('emailService')}
                    >
                      {systemSettings.integrations.emailService ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Settings size={20} className="me-2" />
                  Feature Flags
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">Telehealth Services</h6>
                      <small className="text-muted">Enable video consultations</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleFeature('telehealth')}
                    >
                      {systemSettings.featureFlags.telehealth ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                  <div className="border-bottom pb-3"></div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">AI Diagnostics</h6>
                      <small className="text-muted">AI-powered diagnostic assistance</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleFeature('aiDiagnostics')}
                    >
                      {systemSettings.featureFlags.aiDiagnostics ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                  <div className="border-bottom pb-3"></div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">Mobile Application</h6>
                      <small className="text-muted">Mobile app access for users</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleFeature('mobileApp')}
                    >
                      {systemSettings.featureFlags.mobileApp ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                  <div className="border-bottom pb-3"></div>
                </div>

                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="mb-1">Patient Portal</h6>
                      <small className="text-muted">Patient self-service portal</small>
                    </div>
                    <button 
                      className="btn p-0 border-0"
                      onClick={() => toggleFeature('patientPortal')}
                    >
                      {systemSettings.featureFlags.patientPortal ? 
                        <ToggleRight size={32} className="text-success" /> : 
                        <ToggleLeft size={32} className="text-muted" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Database size={20} className="me-2" />
                  System Configuration
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label">Maximum Users</label>
                    <input 
                      type="number" 
                      className="form-control admin-form-control"
                      value={systemSettings.systemConfig.maxUsers}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        systemConfig: {
                          ...prev.systemConfig,
                          maxUsers: parseInt(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Session Timeout (minutes)</label>
                    <input 
                      type="number" 
                      className="form-control admin-form-control"
                      value={systemSettings.systemConfig.sessionTimeout}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        systemConfig: {
                          ...prev.systemConfig,
                          sessionTimeout: parseInt(e.target.value)
                        }
                      }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Backup Frequency</label>
                    <select 
                      className="form-select admin-form-control"
                      value={systemSettings.systemConfig.backupFrequency}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        systemConfig: {
                          ...prev.systemConfig,
                          backupFrequency: e.target.value
                        }
                      }))}
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Maintenance Window</label>
                    <input 
                      type="text" 
                      className="form-control admin-form-control"
                      value={systemSettings.systemConfig.maintenanceWindow}
                      onChange={(e) => setSystemSettings(prev => ({
                        ...prev,
                        systemConfig: {
                          ...prev.systemConfig,
                          maintenanceWindow: e.target.value
                        }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Shield size={20} className="me-2" />
                  Security & Compliance
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <Shield size={24} className="mb-2" />
                      <span>Security Audit</span>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <Database size={24} className="mb-2" />
                      <span>Data Backup</span>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <Settings size={24} className="mb-2" />
                      <span>System Health</span>
                    </button>
                  </div>
                  <div className="col-md-3">
                    <button className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3">
                      <Wifi size={24} className="mb-2" />
                      <span>API Status</span>
                    </button>
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

export default AdminSystem;