import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PendingApproval from '../components/PendingApproval';
import api from '../utils/api';

const PendingApprovalPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const pendingUser = localStorage.getItem('pendingUser');
    if (pendingUser) {
      setUser(JSON.parse(pendingUser));
      // Start checking approval status every 5 seconds
      const interval = setInterval(checkApprovalStatus, 5000);
      return () => clearInterval(interval);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const checkApprovalStatus = async () => {
    try {
      console.log('Checking approval status...');
      const token = localStorage.getItem('token');
      const pendingUser = localStorage.getItem('pendingUser');
      
      if (!token || !pendingUser) {
        console.log('No token or pending user found');
        return;
      }
      
      const userObj = JSON.parse(pendingUser);
      console.log('Checking for user:', userObj.email);
      
      // Try to login again to get updated user data
      const response = await api.post('/auth/login', {
        email: userObj.email,
        password: 'temp' // This will fail but we just want to check status
      });
      
      console.log('Login response:', response.data);
      
    } catch (error) {
      console.log('Login check error:', error.response?.data);
      
      // If error message doesn't mention pending approval, user might be approved
      if (error.response?.data && !error.response.data.message?.includes('pending')) {
        // Try a different approach - just redirect and let the main app handle it
        window.location.href = '/login';
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pendingUser');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return <PendingApproval user={user} onLogout={handleLogout} />;
};

export default PendingApprovalPage;