import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, User, LogOut, Stethoscope, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

const DoctorNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
    window.location.href = '/login';
  };

  const navLinks = [
    { to: '/doctor/home', label: 'Home' },
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/patients', label: 'Patients' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/medications', label: 'Medications' },
    { to: '/doctor/profile', label: 'Profile' }
  ];

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 1000
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Stethoscope size={20} style={{ color: '#0ea5e9' }} />
          <span style={{ fontWeight: '600', color: '#334155', fontSize: '14px' }}>Doctor Portal</span>
        </div>

        {/* Desktop Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem',
          '@media (max-width: 768px)': { display: 'none' }
        }} className="d-none d-md-flex">
          {navLinks.map(link => (
            <Link 
              key={link.to}
              to={link.to} 
              style={{
                color: location.pathname === link.to ? '#0ea5e9' : '#64748b',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Logout */}
        <button
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
          className="d-none d-md-block"
        >
          Logout
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px'
          }}
          className="d-md-none"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'white',
          zIndex: 999,
          padding: '1rem',
          borderTop: '1px solid #e5e7eb'
        }} className="d-md-none">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {navLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  color: location.pathname === link.to ? '#0ea5e9' : '#64748b',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '16px',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '16px',
                textAlign: 'left',
                padding: '0.75rem 0'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorNavbar;