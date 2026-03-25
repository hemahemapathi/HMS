import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Bell } from 'lucide-react';
import api from '../../utils/api';
import '../../styles/admin-theme.css';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Administrator');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      setUserName(user.name);
    }
    fetchNotifications();
  }, []);

  // Fetch notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('pendingUser');
    // Force page reload to clear all state
    window.location.href = '/login';
  };

  return (
    <nav className="navbar admin-navbar sticky-top">
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center">
          <Shield size={32} className="me-2" style={{color: 'white'}} />
          <span className="fw-bold text-white" style={{fontSize: '1.25rem'}}>Admin Portal</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative" ref={notificationRef}>
            <button 
              className="btn btn-link text-white position-relative"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setShowNotificationModal(true);
                } else {
                  setShowNotifications(!showNotifications);
                }
              }}
            >
              <Bell size={20} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            
            {showNotifications && window.innerWidth > 768 && (
              <div className="dropdown-menu dropdown-menu-end show" style={{position: 'absolute', right: 0, top: '100%', minWidth: '280px', maxWidth: '90vw', maxHeight: '400px', overflowY: 'auto', zIndex: 9999}}>
                <div className="dropdown-header d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Notifications</span>
                  <button className="btn btn-sm btn-link text-muted" onClick={handleClearAll}>Clear All</button>
                </div>
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`dropdown-item ${!notif.isRead ? 'bg-light' : ''}`} 
                      style={{whiteSpace: 'normal', cursor: 'pointer'}}
                      onClick={() => handleMarkAsRead(notif._id)}
                    >
                      <div className="d-flex justify-content-between">
                        <strong className="small">{notif.title}</strong>
                        {!notif.isRead && <span className="badge bg-primary">New</span>}
                      </div>
                      <div className="small">{notif.message}</div>
                      <div className="text-muted" style={{fontSize: '0.75rem'}}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item text-center text-muted">No notifications</div>
                )}
              </div>
            )}
          </div>
          
          <div className="dropdown">
            <button 
              className="btn btn-link text-white dropdown-toggle d-flex align-items-center gap-2" 
              type="button" 
              data-bs-toggle="dropdown"
              style={{ textDecoration: 'none' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={18} />
              </div>
              <span className="d-none d-md-inline">{userName}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center text-danger" 
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="me-2" />
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Notification Modal */}
      {showNotificationModal && (
        <div className="modal show d-block d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog" style={{ maxWidth: '90vw', width: '350px', margin: '1rem' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Notifications</h6>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowNotificationModal(false)}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`p-3 border-bottom ${!notif.isRead ? 'bg-light' : ''}`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        handleMarkAsRead(notif._id);
                        setShowNotificationModal(false);
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong className="small">{notif.title}</strong>
                        {!notif.isRead && <span className="badge bg-primary">New</span>}
                      </div>
                      <div className="small text-muted mb-1">{notif.message}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted">No notifications</div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-outline-secondary" onClick={handleClearAll}>
                  Clear All
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowNotificationModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;