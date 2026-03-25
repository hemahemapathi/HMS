import { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Edit3, Save, X, Calendar } from 'lucide-react';
import Loading from '../../../components/loading/Loading';
import api from '../../../utils/api';
import MobileSelect from '../../../components/MobileSelect';

const PatientProfile = () => {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        const user = response.data.user;
        
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          address: user.address || '',
          emergencyContactName: user.emergencyContact?.name || '',
          emergencyContactPhone: user.emergencyContact?.phone || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const updateData = {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        emergencyContact: {
          name: profileData.emergencyContactName,
          phone: profileData.emergencyContactPhone
        }
      };
      
      const response = await api.put('/auth/profile', updateData);
      
      // Update localStorage with new user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditMode(false);
      showNotification('Profile updated successfully!');
      
      // Force page refresh to update navbar
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center">
          <div className="mb-3 mb-md-0 text-center text-md-start">
            <h2 className="text-danger mb-1">My Profile</h2>
            <p className="text-muted">Manage your personal information</p>
          </div>
          <div>
            {editMode ? (
              <div className="btn-group">
                <button onClick={handleSave} className="btn btn-success">
                  <Save size={16} className="me-2" />
                  Save
                </button>
                <button onClick={() => setEditMode(false)} className="btn btn-outline-secondary">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="btn btn-danger">
                <Edit3 size={16} className="me-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              
              {/* Personal Information */}
              <div className="mb-4">
                <h6 className="text-danger mb-3">
                  <User size={18} className="me-2" />
                  Personal Information
                </h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.name}
                      disabled={!editMode}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={profileData.email}
                      disabled={true}
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileData.phone}
                      disabled={!editMode}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={profileData.dateOfBirth}
                      disabled={!editMode}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <MobileSelect
                      options={[
                        { value: '', label: 'Select Gender' },
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                      value={profileData.gender}
                      onChange={(value) => handleInputChange('gender', value)}
                      placeholder="Select Gender"
                      disabled={!editMode}
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={profileData.address}
                      disabled={!editMode}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
              </div>

              <hr />

              {/* Emergency Contact */}
              <div className="mb-4">
                <h6 className="text-danger mb-3">
                  <Phone size={18} className="me-2" />
                  Emergency Contact
                </h6>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profileData.emergencyContactName}
                      disabled={!editMode}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={profileData.emergencyContactPhone}
                      disabled={!editMode}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="alert alert-light">
                <h6 className="text-muted mb-2">Account Information</h6>
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">
                      <Mail size={14} className="me-1" />
                      Email: {profileData.email}
                    </small>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">
                      <Calendar size={14} className="me-1" />
                      Member since: {new Date().getFullYear()}
                    </small>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}>
            <strong>{notification.type === 'success' ? '✅' : '❌'}</strong> {notification.message}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setNotification(null)}
            ></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;