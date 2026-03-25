import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Users, Stethoscope, Calendar, FileText, Settings, Menu, Heart } from 'lucide-react';
import '../../styles/admin-theme.css';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin/home', icon: Home, label: 'Home' },
    { path: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/admin/doctors', icon: Stethoscope, label: 'Doctors' },
    { path: '/admin/patients', icon: Users, label: 'Patients' },
    { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/admin/health-records', icon: Heart, label: 'Health Records' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="admin-main-wrapper">
      <button 
        className="admin-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
      </button>
      
      <div className={`admin-sidebar ${sidebarOpen ? 'show' : ''}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className={`admin-content-area ${sidebarOpen ? '' : 'full-width-mobile'}`}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;