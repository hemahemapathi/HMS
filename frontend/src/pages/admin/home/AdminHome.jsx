import { useState, useEffect } from 'react';
import { 
  Stethoscope, Users, Calendar, FileText, Activity, BarChart3, Database, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminLoading from '../../../components/loading/AdminLoading';
import api from '../../../utils/api';
import '../../../styles/admin-theme.css';

const AdminHome = () => {
  const [loading, setLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeProviders: 0,
    todayAppointments: 0,
    systemHealth: 98.5
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setSystemStats({
          totalUsers: data.stats.totalPatients + data.stats.totalDoctors,
          activeProviders: data.stats.approvedDoctors,
          todayAppointments: data.stats.totalAppointments,
          systemHealth: 98.5
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <AdminLoading />;

  return (
    <AdminLayout>
      {/* Split Screen Hero */}
      <div className="admin-split-hero">
        <div className="split-left">
          <div className="split-content">
            <h1 className="split-title">Admin Dashboard</h1>
            <p className="split-desc">Complete healthcare system control</p>
            <div className="split-actions">
              <Link to="/admin/doctors" className="split-btn">
                <Stethoscope size={16} />
                Doctors
              </Link>
              <Link to="/admin/patients" className="split-btn">
                <Users size={16} />
                Patients
              </Link>
            </div>
          </div>
        </div>
        
        <div className="split-right">
          <div className="stats-panel">
            <div className="stat-box">
              <div className="stat-number">{systemStats.totalUsers || 0}</div>
              <div className="stat-text">Users</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{systemStats.activeProviders || 0}</div>
              <div className="stat-text">Doctors</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{systemStats.todayAppointments || 0}</div>
              <div className="stat-text">Appointments</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{systemStats.systemHealth}%</div>
              <div className="stat-text">Health</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h2 className="admin-text-primary mb-4">Core Management</h2>
        <div className="row g-4">
          <div className="col-md-6 col-lg-4 d-flex">
            <Link to="/admin/doctors" className="text-decoration-none w-100">
              <div className="admin-card text-center">
                <div className="admin-stats-icon mb-3">
                  <Stethoscope size={32} />
                </div>
                <h5 className="admin-text-primary mb-2">Doctor Management</h5>
                <p className="text-muted mb-0">Approve and manage doctors</p>
              </div>
            </Link>
          </div>
          
          <div className="col-md-6 col-lg-4 d-flex">
            <Link to="/admin/patients" className="text-decoration-none w-100">
              <div className="admin-card text-center">
                <div className="admin-stats-icon mb-3">
                  <Users size={32} />
                </div>
                <h5 className="admin-text-primary mb-2">Patient Management</h5>
                <p className="text-muted mb-0">Manage profiles and payments</p>
              </div>
            </Link>
          </div>
          
          <div className="col-md-6 col-lg-4 d-flex">
            <Link to="/admin/appointments" className="text-decoration-none w-100">
              <div className="admin-card text-center">
                <div className="admin-stats-icon mb-3">
                  <Calendar size={32} />
                </div>
                <h5 className="admin-text-primary mb-2">Appointments</h5>
                <p className="text-muted mb-0">Monitor all appointments</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-5">
        <h2 className="admin-text-primary mb-4">System Status</h2>
        <div className="row g-4">
          <div className="col-lg-4 d-flex">
            <div className="admin-card w-100">
              <div className="card-body text-center">
                <div className="admin-stats-icon mb-3">
                  <Database />
                </div>
                <h3 className="admin-text-primary">{systemStats.systemHealth}%</h3>
                <p className="text-success mb-0">All Systems Operational</p>
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-flex">
            <div className="admin-card w-100">
              <div className="card-body">
                <h6 className="admin-text-primary mb-3">
                  <TrendingUp size={20} className="me-2" />
                  Performance Metrics
                </h6>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Server Response</span>
                    <span className="text-success">125ms</span>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-success" style={{width: '95%'}}></div>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span>Database Load</span>
                    <span className="text-warning">68%</span>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-warning" style={{width: '68%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="d-flex justify-content-between">
                    <span>Memory Usage</span>
                    <span className="text-info">45%</span>
                  </div>
                  <div className="progress mt-1">
                    <div className="progress-bar bg-info" style={{width: '45%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-flex">
            <div className="admin-card w-100">
              <div className="card-body">
                <h6 className="admin-text-primary mb-3">
                  <AlertTriangle size={20} className="me-2" />
                  Recent Alerts
                </h6>
                <div className="alert alert-warning alert-sm mb-2">
                  <small>High database load detected</small>
                </div>
                <div className="alert alert-info alert-sm mb-2">
                  <small>Scheduled maintenance in 2 days</small>
                </div>
                <div className="alert alert-success alert-sm mb-0">
                  <small>Backup completed successfully</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Tools */}
      <div>
        <h2 className="admin-text-primary mb-4">Additional Tools</h2>
        <div className="row g-4">
          <div className="col-md-6 d-flex">
            <Link to="/admin/reports" className="text-decoration-none w-100">
              <div className="admin-card text-center">
                <div className="admin-stats-icon mb-3">
                  <BarChart3 size={32} />
                </div>
                <h5 className="admin-text-primary mb-2">Reports & Analytics</h5>
                <p className="text-muted mb-0">View system insights</p>
              </div>
            </Link>
          </div>
          
          <div className="col-md-6 d-flex">
            <Link to="/admin/settings" className="text-decoration-none w-100">
              <div className="admin-card text-center">
                <div className="admin-stats-icon mb-3">
                  <FileText size={32} />
                </div>
                <h5 className="admin-text-primary mb-2">System Settings</h5>
                <p className="text-muted mb-0">Configure system</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHome;