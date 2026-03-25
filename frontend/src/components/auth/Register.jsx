import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserCheck, Eye, EyeOff, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import Loading from '../loading/Loading';
import Toast from '../toast/Toast';
import '../../styles/auth-theme.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: '', 
    phone: '', 
    age: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      if (formData.phone.trim()) submitData.phone = formData.phone;
      if (formData.age) submitData.age = parseInt(formData.age);

      await api.post('/auth/register', submitData);
      setLoading(false);
      setToast({ show: true, message: 'Registration successful! Please login.', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setLoading(false);
      setToast({ show: true, message: error.response?.data?.message || 'Registration failed', type: 'error' });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="auth-container">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="auth-card grid-card">
              <div className="auth-header">
                <h2 className="mb-2">Create Account</h2>
                <p className="mb-0 opacity-75">Join our healthcare platform</p>
              </div>
              
              <div className="p-4">
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                      <label htmlFor="name">
                        <User size={16} className="me-2" />
                        Full Name
                      </label>
                    </div>
                    
                    <div className="form-floating">
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
                    
                    <div className="form-floating position-relative">
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
                    
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="role"
                        placeholder="Role"
                        value={formData.role === 'patient' ? 'Patient' : formData.role === 'doctor' ? 'Doctor' : formData.role === 'admin' ? 'Admin' : ''}
                        onClick={() => setShowRoleModal(true)}
                        readOnly
                        required
                      />
                      <label htmlFor="role">
                        <UserCheck size={16} className="me-2" />
                        Role
                      </label>
                    </div>
                    
                    <div className="form-floating">
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                      <label htmlFor="phone">Phone Number (Optional)</label>
                    </div>
                    
                    <div className="form-floating">
                      <input
                        type="number"
                        className="form-control"
                        id="age"
                        placeholder="Age"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                      />
                      <label htmlFor="age">Age (Optional)</label>
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-danger btn-custom w-100 mb-3 mt-4">
                    Create Account
                  </button>
                  
                  <div className="text-center">
                    <p className="mb-0">Already have an account?</p>
                    <Link to="/login" className="btn btn-outline-danger btn-custom mt-2">
                      Sign In
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

      {showRoleModal && (
        <div className="modal show d-block d-flex align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog mx-auto" style={{ maxWidth: '90vw', width: '300px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Select Role</h6>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRoleModal(false)}
                ></button>
              </div>
              <div className="modal-body p-2">
                {[
                  { value: 'patient', label: 'Patient', icon: '👤' },
                  { value: 'doctor', label: 'Doctor', icon: '👨⚕️' },
                  { value: 'admin', label: 'Admin', icon: '👨💼' }
                ].map(role => (
                  <button
                    key={role.value}
                    type="button"
                    className={`btn w-100 text-start border mb-2 p-3 ${formData.role === role.value ? 'btn-danger text-white' : 'btn-light'}`}
                    onClick={() => {
                      setFormData({...formData, role: role.value});
                      setShowRoleModal(false);
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3" style={{ fontSize: '1.2rem' }}>{role.icon}</span>
                      <span className="fw-bold">{role.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;