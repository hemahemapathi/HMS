import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, GraduationCap, MapPin, DollarSign, Clock, Save, Camera } from 'lucide-react';
import api from '../../utils/api';
import MobileSelect from '../../components/MobileSelect';
import TimePickerModal from '../../components/TimePickerModal';

const DoctorProfileCompletion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [timePickerModal, setTimePickerModal] = useState({ isOpen: false, day: '', field: '', title: '' });
  const [formData, setFormData] = useState({
    specialization: '',
    category: '',
    experience: '',
    education: '',
    qualifications: '',
    consultationFee: '',
    address: '',
    profileImage: 'doctor-male-1', // Default profile image
    availability: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: false },
      sunday: { start: '09:00', end: '13:00', available: false }
    }
  });

  const specializations = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
    'General Medicine', 'Neurology', 'Oncology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
  ];

  const categories = [
    'General Practitioner', 'Specialist', 'Consultant', 'Senior Consultant'
  ];

  const profileImages = [
    { id: 'doctor-male-1', name: 'Professional Male Doctor', avatar: '👨‍⚕️' },
    { id: 'doctor-female-1', name: 'Professional Female Doctor', avatar: '👩‍⚕️' },
    { id: 'doctor-male-2', name: 'Senior Male Doctor', avatar: '🧑‍⚕️' },
    { id: 'doctor-female-2', name: 'Senior Female Doctor', avatar: '👩‍💼' },
    { id: 'doctor-neutral', name: 'Medical Professional', avatar: '⚕️' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    checkProfileStatus();
  }, []);

  const checkProfileStatus = async () => {
    console.log('DoctorProfileCompletion - Checking profile status');
    
    try {
      // Check if profile data already exists
      const userResponse = await api.get('/auth/profile');
      const userData = userResponse.data?.user || userResponse.data;
      
      // If profile has essential data, redirect to home
      if (userData.specialization && userData.experience && userData.consultationFee) {
        console.log('DoctorProfileCompletion - Profile already completed, redirecting to home');
        navigate('/doctor/home');
        return;
      }
    } catch (error) {
      console.log('Error checking profile status:', error);
    }
    
    console.log('DoctorProfileCompletion - Profile not completed, showing form');
    setCheckingProfile(false);
  };

  if (checkingProfile) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border text-primary" />
    </div>;
  }

  const handleAvailabilityChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/auth/profile', formData);
      
      // Mark profile as completed in localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      userData.profileCompleted = true;
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set a flag to prevent showing completion page again
      localStorage.setItem('doctorProfileCompleted', 'true');
      
      navigate('/doctor/home');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-completion">
      <div className="completion-container">
        <div className="completion-header">
          <div className="header-icon">
            <Stethoscope size={32} />
          </div>
          <h2>Complete Your Doctor Profile</h2>
          <p>Please fill in your professional details to start using the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="completion-form">
          {/* Profile Image Selection */}
          <div className="form-section">
            <h3><Camera size={20} /> Profile Image</h3>
            
            <div className="profile-image-grid">
              {profileImages.map(image => (
                <div 
                  key={image.id}
                  className={`profile-image-option ${
                    formData.profileImage === image.id ? 'selected' : ''
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, profileImage: image.id }))}
                >
                  <div className="image-avatar">{image.avatar}</div>
                  <span className="image-name">{image.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Information */}
          <div className="form-section">
            <h3><User size={20} /> Professional Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Specialization *</label>
                <MobileSelect
                  options={specializations.map(spec => ({ value: spec, label: spec }))}
                  value={formData.specialization}
                  onChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                  placeholder="Select Specialization"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <MobileSelect
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                  value={formData.category}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  placeholder="Select Category"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience (Years) *</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  required
                />
              </div>

              <div className="form-group">
                <label>Consultation Fee ($) *</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Education & Qualifications */}
          <div className="form-section">
            <h3><GraduationCap size={20} /> Education & Qualifications</h3>
            
            <div className="form-group">
              <label>Education *</label>
              <textarea
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                placeholder="e.g., MBBS from XYZ Medical College (2010)"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Additional Qualifications</label>
              <textarea
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                placeholder="e.g., MD in Cardiology, Fellowship in Interventional Cardiology"
                rows="3"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3><MapPin size={20} /> Contact Information</h3>
            
            <div className="form-group">
              <label>Clinic/Hospital Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your clinic or hospital address"
                rows="3"
                required
              />
            </div>
          </div>

          {/* Availability */}
          <div className="form-section">
            <h3><Clock size={20} /> Availability Schedule</h3>
            
            <div className="availability-grid">
              {Object.entries(formData.availability).map(([day, schedule]) => (
                <div key={day} className="availability-row">
                  <div className="day-name">
                    <input
                      type="checkbox"
                      checked={schedule.available}
                      onChange={(e) => handleAvailabilityChange(day, 'available', e.target.checked)}
                    />
                    <span>{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                  </div>
                  
                  {schedule.available && (
                    <div className="time-inputs">
                      {/* Desktop time inputs */}
                      <div className="d-none d-md-flex align-items-center gap-2">
                        <input
                          type="time"
                          value={schedule.start}
                          onChange={(e) => handleAvailabilityChange(day, 'start', e.target.value)}
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={schedule.end}
                          onChange={(e) => handleAvailabilityChange(day, 'end', e.target.value)}
                        />
                      </div>
                      
                      {/* Mobile time buttons */}
                      <div className="d-md-none d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setTimePickerModal({
                            isOpen: true,
                            day,
                            field: 'start',
                            title: `${day.charAt(0).toUpperCase() + day.slice(1)} Start Time`
                          })}
                        >
                          {schedule.start}
                        </button>
                        <span>to</span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setTimePickerModal({
                            isOpen: true,
                            day,
                            field: 'end',
                            title: `${day.charAt(0).toUpperCase() + day.slice(1)} End Time`
                          })}
                        >
                          {schedule.end}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="complete-btn">
              <Save size={20} />
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={timePickerModal.isOpen}
        onClose={() => setTimePickerModal({ isOpen: false, day: '', field: '', title: '' })}
        value={timePickerModal.day && timePickerModal.field ? formData.availability[timePickerModal.day][timePickerModal.field] : ''}
        onChange={(value) => {
          handleAvailabilityChange(timePickerModal.day, timePickerModal.field, value);
          setTimePickerModal({ isOpen: false, day: '', field: '', title: '' });
        }}
        title={timePickerModal.title}
      />
    </div>
  );
};

export default DoctorProfileCompletion;