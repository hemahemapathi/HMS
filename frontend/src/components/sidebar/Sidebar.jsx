import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Calendar, FileText, Settings, 
  UserCheck, Activity, Shield, LogOut 
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ userRole, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', roles: ['admin', 'doctor', 'patient'] },
    { path: '/patients', icon: Users, label: 'Patients', roles: ['admin', 'doctor'] },
    { path: '/doctors', icon: UserCheck, label: 'Doctors', roles: ['admin'] },
    { path: '/appointments', icon: Calendar, label: 'Appointments', roles: ['admin', 'doctor', 'patient'] },
    { path: '/health-records', icon: FileText, label: 'Health Records', roles: ['admin', 'doctor', 'patient'] },
    { path: '/analytics', icon: Activity, label: 'Analytics', roles: ['admin', 'doctor'] },
    { path: '/admin', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
    { path: '/settings', icon: Settings, label: 'Settings', roles: ['admin', 'doctor', 'patient'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h4 className="text-white mb-0">HMS</h4>
        <small className="text-white-50">Health Management</small>
      </div>
      
      <nav className="sidebar-nav">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <button onClick={onLogout} className="sidebar-item logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;