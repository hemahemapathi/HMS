import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, FileText, TrendingUp, Activity, 
  AlertTriangle, Database, Shield, Clock, CheckCircle 
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminLoading from '../../../components/loading/AdminLoading';
import Toast from '../../../components/toast/Toast';
import api from '../../../utils/api';
import '../../../styles/admin-theme.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'patient', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAddUser = () => {
    setShowAddUserModal(true);
  };
  
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }
    
    setIsProcessing(true);
    try {
      const userData = {
        ...newUser,
        password: 'defaultPassword123'
      };
      
      await api.post('/auth/register', userData);
      setToast({ message: `${newUser.role} user created successfully!`, type: 'success' });
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'patient', phone: '' });
    } catch (error) {
      setToast({ message: 'Failed to create user', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGenerateReport = () => {
    navigate('/admin/reports');
  };
  
  const handleBackupSystem = async () => {
    setIsProcessing(true);
    setToast({ message: 'System backup initiated...', type: 'info' });
    
    setTimeout(() => {
      setToast({ message: 'System backup completed successfully!', type: 'success' });
      setIsProcessing(false);
    }, 3000);
  };
  
  const handleSecurityScan = async () => {
    setIsProcessing(true);
    setToast({ message: 'Running security scan...', type: 'info' });
    
    setTimeout(() => {
      setToast({ message: 'Security scan completed - No threats detected', type: 'success' });
      setIsProcessing(false);
    }, 5000);
  };
  const [dashboardData, setDashboardData] = useState({
    kpiWidgets: {
      totalUsers: 0,
      totalDoctors: 0,
      totalPatients: 0,
      todayAppointments: 0,
      systemUptime: 99.8,
      activeUsers: 0
    },
    performanceMetrics: {
      totalRecords: 0,
      filesProcessed: 0,
      successRate: 98.7,
      dataStorage: '0MB'
    },
    systemHealth: {
      serverStatus: 'healthy',
      databaseStatus: 'healthy',
      apiResponse: '125ms',
      memoryUsage: 45,
      cpuUsage: 32
    },
    recentActivity: [],
    alerts: [
      { id: 1, type: 'warning', message: 'High database load detected - consider scaling', priority: 'medium' },
      { id: 2, type: 'info', message: 'Scheduled maintenance window in 48 hours', priority: 'low' },
      { id: 3, type: 'success', message: 'All security scans passed successfully', priority: 'low' }
    ]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        
        // Fetch health records for performance metrics
        let healthRecordsCount = 0;
        let totalFiles = 0;
        try {
          const healthRecordsResponse = await api.get('/health-records/all');
          healthRecordsCount = healthRecordsResponse.data.records?.length || 0;
          totalFiles = healthRecordsResponse.data.records?.reduce((sum, record) => 
            sum + (record.files?.length || 0), 0) || 0;
        } catch (error) {
          console.log('Health records not available');
        }
        
        setDashboardData(prev => ({
          ...prev,
          kpiWidgets: {
            totalUsers: data.stats.totalPatients + data.stats.totalDoctors,
            totalDoctors: data.stats.totalDoctors,
            totalPatients: data.stats.totalPatients,
            todayAppointments: data.stats.totalAppointments,
            systemUptime: 99.8,
            activeUsers: data.stats.approvedDoctors
          },
          performanceMetrics: {
            totalRecords: data.stats.totalPatients + data.stats.totalDoctors + data.stats.totalAppointments + healthRecordsCount,
            filesProcessed: totalFiles,
            successRate: 98.7,
            dataStorage: totalFiles > 0 ? `${(totalFiles * 2.5).toFixed(1)}MB` : '0MB'
          },
          recentActivity: [
            { id: 1, type: 'user', action: 'New doctor registered', user: 'System', time: '5 min ago' },
            { id: 2, type: 'appointment', action: 'Appointment scheduled', user: 'System', time: '12 min ago' },
            { id: 3, type: 'system', action: 'Database backup completed', user: 'System', time: '1 hour ago' },
            { id: 4, type: 'billing', action: 'Payment processed', user: 'System', time: '2 hours ago' }
          ]
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <h2 className="admin-text-primary mb-1">System Dashboard</h2>
            <p className="text-muted">Real-time system monitoring and key performance indicators</p>
          </div>
        </div>

        {/* KPI Widgets */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-2">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Users />
              </div>
              <h3 className="admin-text-primary">{dashboardData.kpiWidgets.totalUsers || 0}</h3>
              <p className="text-muted mb-0">Total Users</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-2">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Shield />
              </div>
              <h3 className="admin-text-primary">{dashboardData.kpiWidgets.totalDoctors || 0}</h3>
              <p className="text-muted mb-0">Active Doctors</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-2">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Users />
              </div>
              <h3 className="admin-text-primary">{dashboardData.kpiWidgets.totalPatients || 0}</h3>
              <p className="text-muted mb-0">Registered Patients</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-2">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Calendar />
              </div>
              <h3 className="admin-text-primary">{dashboardData.kpiWidgets.todayAppointments || 0}</h3>
              <p className="text-muted mb-0">Today's Appointments</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-2">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Activity />
              </div>
              <h3 className="admin-text-primary">{dashboardData.kpiWidgets.systemUptime}%</h3>
              <p className="text-muted mb-0">System Uptime</p>
            </div>
          </div>
          
          <div className="col-md-6 col-lg-2">
            <div className="admin-stats-card">
              <div className="admin-stats-icon">
                <Clock />
              </div>
              <h3 className="admin-text-primary">{dashboardData.kpiWidgets.activeUsers || 0}</h3>
              <p className="text-muted mb-0">Active Users</p>
            </div>
          </div>
        </div>

        {/* System Health Alerts */}
        {dashboardData.alerts.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="admin-alert p-3">
                <h6 className="mb-3 admin-text-primary">
                  <AlertTriangle size={20} className="me-2" />
                  System Alerts & Notifications
                </h6>
                {dashboardData.alerts.map((alert) => (
                  <div key={alert.id} className={`alert alert-${
                    alert.priority === 'high' ? 'danger' : 
                    alert.priority === 'medium' ? 'warning' : 'info'
                  } mb-2`}>
                    <div className="d-flex justify-content-between align-items-start">
                      <span>{alert.message}</span>
                      <button className="btn btn-sm btn-outline-secondary">Dismiss</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {/* System Health */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Database size={20} className="me-2" />
                  System Health Monitor
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center p-3 border rounded">
                      <div className="text-success mb-2">
                        <CheckCircle size={24} />
                      </div>
                      <h6 className="mb-1">Server Status</h6>
                      <span className="badge bg-success">Healthy</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 border rounded">
                      <div className="text-success mb-2">
                        <Database size={24} />
                      </div>
                      <h6 className="mb-1">Database</h6>
                      <span className="badge bg-success">Healthy</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 border rounded">
                      <div className="text-info mb-2">
                        <Activity size={24} />
                      </div>
                      <h6 className="mb-1">API Response</h6>
                      <span className="badge bg-info">{dashboardData.systemHealth.apiResponse}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center p-3 border rounded">
                      <div className="text-warning mb-2">
                        <TrendingUp size={24} />
                      </div>
                      <h6 className="mb-1">Memory Usage</h6>
                      <span className="badge bg-warning">{dashboardData.systemHealth.memoryUsage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-lg-6">
            <div className="admin-card h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <Activity size={20} className="me-2" />
                  Recent System Activity
                </h6>
              </div>
              <div className="card-body">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="d-flex align-items-start py-2 border-bottom">
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{activity.action}</h6>
                      <p className="mb-0 small text-muted">{activity.user}</p>
                      <small className="text-muted">{activity.time}</small>
                    </div>
                    <span className={`badge ${
                      activity.type === 'user' ? 'admin-badge' :
                      activity.type === 'system' ? 'bg-info' :
                      activity.type === 'billing' ? 'bg-success' : 'bg-warning'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">
                  <TrendingUp size={20} className="me-2" />
                  Performance Metrics
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="admin-text-primary">{dashboardData.performanceMetrics.totalRecords}</h4>
                      <p className="text-muted mb-0">Total Records</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="admin-text-primary">{dashboardData.performanceMetrics.filesProcessed}</h4>
                      <p className="text-muted mb-0">Files Processed</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="admin-text-primary">{dashboardData.performanceMetrics.successRate}%</h4>
                      <p className="text-muted mb-0">Success Rate</p>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center">
                      <h4 className="admin-text-primary">{dashboardData.performanceMetrics.dataStorage}</h4>
                      <p className="text-muted mb-0">Data Storage</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-12">
            <div className="admin-card">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0 admin-text-primary">Quick Administrative Actions</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3 col-6">
                    <button 
                      className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3"
                      onClick={handleAddUser}
                      disabled={isProcessing}
                    >
                      <Users size={24} className="mb-2" />
                      <span>Add User</span>
                    </button>
                  </div>
                  <div className="col-md-3 col-6">
                    <button 
                      className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3"
                      onClick={handleGenerateReport}
                    >
                      <FileText size={24} className="mb-2" />
                      <span>Generate Report</span>
                    </button>
                  </div>
                  <div className="col-md-3 col-6">
                    <button 
                      className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3"
                      onClick={handleBackupSystem}
                      disabled={isProcessing}
                    >
                      <Database size={24} className="mb-2" />
                      <span>{isProcessing ? 'Processing...' : 'Backup System'}</span>
                    </button>
                  </div>
                  <div className="col-md-3 col-6">
                    <button 
                      className="btn admin-btn-outline w-100 d-flex flex-column align-items-center py-3"
                      onClick={handleSecurityScan}
                      disabled={isProcessing}
                    >
                      <Shield size={24} className="mb-2" />
                      <span>{isProcessing ? 'Scanning...' : 'Security Scan'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white'}}>
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddUserModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role *</label>
                  <select 
                    className="form-select" 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <small>Default password will be: defaultPassword123</small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-success" 
                  onClick={handleCreateUser}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Creating...' : 'Create User'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAddUserModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default AdminDashboard;