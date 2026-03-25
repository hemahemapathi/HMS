import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';
import Loading from '../loading/Loading';
import Toast from '../toast/Toast';
import '../../styles/auth-theme.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Login attempt with:', { email: formData.email, password: formData.password });
      const response = await api.post('/auth/login', formData);
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Check if doctor needs to complete profile
      if (response.data.user.role === 'doctor') {
        // Check if doctor has completed their profile
        const hasSpecialization = response.data.user.specialization;
        const hasConsultationFee = response.data.user.consultationFee;
        
        if (!hasSpecialization || !hasConsultationFee) {
          // Redirect to profile completion
          window.location.href = '/doctor/complete-profile';
          return;
        }
      }
      
      // Normal redirect for complete profiles
      window.location.href = response.data.user.role === 'admin' ? '/admin/home' :
                            response.data.user.role === 'doctor' ? '/doctor/home' : '/patient/home';
      
    } catch (error) {
      console.error('Login error:', error.response?.data);
      console.log('Full error:', error);
      setLoading(false);
      
      // Handle pending approval case
      if (error.response?.data?.needsApproval) {
        localStorage.setItem('pendingUser', JSON.stringify(error.response.data.user));
        window.location.href = '/pending-approval';
        return;
      }
      
      setToast({ show: true, message: error.response?.data?.message || 'Login failed', type: 'error' });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="auth-card">
              <div className="auth-header">
                <h2 className="mb-2">Welcome Back</h2>
                <p className="mb-0 opacity-75">Sign in to your account</p>
              </div>
              
              <div className="p-4">
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                    <label htmlFor="email">
                      <Mail size={16} className="me-2" />
                      Email Address
                    </label>
                  </div>
                  
                  <div className="form-floating mb-4 position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <label htmlFor="password">
                      <Lock size={16} className="me-2" />
                      Password
                    </label>
                    <button
                      type="button"
                      className="btn position-absolute end-0 top-50 translate-middle-y me-3"
                      style={{ border: 'none', background: 'none' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  <button type="submit" className="btn btn-danger btn-custom w-100 mb-3">
                    Sign In
                  </button>
                  
                  <div className="text-center">
                    <p className="mb-2">Don't have an account?</p>
                    <Link to="/register" className="btn btn-outline-danger btn-custom">
                      Create Account
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default Login;