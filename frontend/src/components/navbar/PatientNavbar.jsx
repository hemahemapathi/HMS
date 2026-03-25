import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Users, FileText, Pill, Menu, User, LogOut, StickyNote } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const PatientNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userName, setUserName] = useState('Patient');
  const dropdownRef = useRef(null);
  
  // Update user name when component mounts or localStorage changes
  useEffect(() => {
    const updateUserName = () => {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(userData.name || 'Patient');
    };
    
    updateUserName();
    
    // Listen for storage changes and custom user update events
    window.addEventListener('storage', updateUserName);
    window.addEventListener('userUpdated', updateUserName);
    
    return () => {
      window.removeEventListener('storage', updateUserName);
      window.removeEventListener('userUpdated', updateUserName);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/patient/home', icon: Home, label: 'Home' },
    { path: '/patient/dashboard', icon: Calendar, label: 'Dashboard' },
    { path: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/patient/doctors', icon: Users, label: 'Doctors' },
    { path: '/patient/health-records', icon: FileText, label: 'Health Records' },
    { path: '/patient/medications', icon: Pill, label: 'Medications' }
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid px-2">
        <Link className="navbar-brand fw-bold text-danger fs-3 d-flex align-items-center" to="/patient/home">
          -- MediCare Plus
        </Link>
        
        <button 
          className="navbar-toggler border-0" 
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu size={24} className="text-danger" />
        </button>
        
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            <div className="d-lg-none w-100">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link 
                    key={item.path}
                    className={`d-block py-2 px-3 text-decoration-none border-bottom ${
                      isActive ? 'bg-danger text-white' : 'text-dark'
                    }`}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon size={16} className="me-2" />
                    {item.label}
                  </Link>
                );
              })}
              <Link 
                className="d-block py-2 px-3 text-decoration-none border-bottom text-dark"
                to="/patient/profile"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} className="me-2" />
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="d-block w-100 py-2 px-3 text-start border-0 bg-transparent text-danger"
              >
                <LogOut size={16} className="me-2" />
                Logout
              </button>
            </div>
            
            <div className="d-none d-lg-flex align-items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path} className="nav-item mx-1">
                    <Link 
                      className={`nav-link d-flex align-items-center px-3 py-2 rounded-pill ${
                        isActive ? 'bg-danger text-white' : 'text-dark'
                      }`}
                      to={item.path}
                    >
                      <Icon size={18} className="me-2" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              
              <li className="nav-item ms-2 position-relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="btn btn-outline-danger d-flex align-items-center px-3 py-2"
                >
                  <User size={18} />
                </button>
                
                {showUserDropdown && (
                  <div className="dropdown-menu show position-absolute" style={{ right: '0', top: '100%', minWidth: '150px', zIndex: 1050 }}>
                    <Link 
                      className="dropdown-item d-flex align-items-center"
                      to="/patient/profile"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <User size={16} className="me-2" />
                      Profile
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      onClick={handleLogout}
                      className="dropdown-item d-flex align-items-center text-danger"
                    >
                      <LogOut size={16} className="me-2" />
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PatientNavbar;