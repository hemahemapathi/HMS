import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Star, MapPin, Clock, Phone, 
  Calendar, Award, Users, Heart, Brain, Eye, 
  Stethoscope, Baby, Bone, Pill, ChevronRight 
} from 'lucide-react';
import Loading from '../../../components/loading/Loading';
import api from '../../../utils/api';

const PatientDoctors = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const specialties = [
    { id: 'all', name: 'All Specialties', icon: Stethoscope },
    { id: 'cardiology', name: 'Cardiology', icon: Heart },
    { id: 'neurology', name: 'Neurology', icon: Brain },
    { id: 'pediatrics', name: 'Pediatrics', icon: Baby },
    { id: 'orthopedics', name: 'Orthopedics', icon: Bone },
    { id: 'ophthalmology', name: 'Ophthalmology', icon: Eye },
    { id: 'psychiatry', name: 'Psychiatry', icon: Users },
    { id: 'pharmacy', name: 'Pharmacy', icon: Pill }
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/doctors');
        const doctorsData = response.data.doctors || [];
        
        console.log('Raw API doctors:', doctorsData);
        
        // Transform API data to match component expectations
        const transformedDoctors = doctorsData.map(doctor => {
          console.log('Doctor data:', doctor);
          return {
            id: doctor._id,
            name: doctor.name,
            specialty: doctor.specialization?.toLowerCase() || 'general',
            specialtyName: doctor.specialization || 'General Medicine',
            category: doctor.category || 'General Practice',
            experience: doctor.experience || 'Not specified',
            education: doctor.education || 'Not specified',
            phone: doctor.phone || 'Not provided',
            address: doctor.address || 'Not provided',
            qualifications: doctor.qualifications || [],
            consultationFee: doctor.consultationFee || 'Contact for fee',
            availability: doctor.availability || [],
            email: doctor.email,
            gender: doctor.gender || 'Not specified',
            isApproved: doctor.isApproved
          };
        });
        setDoctors(transformedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialtyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply specialty filter
    if (selectedSpecialty !== 'all') {
      console.log('Filtering by specialty:', selectedSpecialty);
      console.log('Available doctors:', filtered.map(d => ({ name: d.name, specialty: d.specialty })));
      filtered = filtered.filter(doctor => 
        doctor.specialty === selectedSpecialty
      );
      console.log('Filtered doctors:', filtered.map(d => ({ name: d.name, specialty: d.specialty })));
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecialty]);

  const handleBookAppointment = (doctorId) => {
    // Navigate to appointment booking page with doctor ID
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  const handleContact = (phone) => {
    if (phone && phone !== 'Not provided') {
      // Open phone dialer
      window.location.href = `tel:${phone}`;
    } else {
      alert('Phone number not available');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12 text-center text-md-start">
          <h2 className="text-danger mb-1">Find Doctors</h2>
          <p className="text-muted">Search and book appointments with our expert physicians</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-12 mb-3">
          <div className="position-relative">
            <input
              type="text"
              className="form-control pe-5"
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-link position-absolute top-50 end-0 translate-middle-y pe-3 text-muted">
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-wrap gap-2">
            {specialties.slice(0, 6).map(specialty => {
              const Icon = specialty.icon;
              return (
                <button
                  key={specialty.id}
                  className={`btn ${selectedSpecialty === specialty.id ? 'btn-danger' : 'btn-outline-danger'} btn-sm`}
                  onClick={() => setSelectedSpecialty(specialty.id)}
                >
                  <Icon size={14} className="me-1" />
                  {specialty.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <p className="text-muted">
            Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedSpecialty !== 'all' && ` in ${specialties.find(s => s.id === selectedSpecialty)?.name}`}
          </p>
        </div>
      </div>

      <div className="row g-4">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="col-lg-6 col-xl-4">
            <div className="doctor-card h-100">
              <div className="d-flex align-items-start mb-3">
                <img
                  src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=dc2626&color=fff&size=80`}
                  alt={doctor.name}
                  className="doctor-avatar me-3"
                />
                <div className="flex-grow-1">
                  <h5 className="mb-1 text-danger">{doctor.name}</h5>
                  <p className="text-muted mb-1">{doctor.specialtyName}</p>
                  <p className="text-muted mb-1 small">Category: {doctor.category}</p>
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-muted small">{doctor.email}</span>
                  </div>
                  <span className="badge bg-success badge-custom">Approved</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <Award size={14} className="text-muted me-2" />
                  <span className="small">Experience: {doctor.experience}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <MapPin size={14} className="text-muted me-2" />
                  <span className="small">Address: {doctor.address}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <Phone size={14} className="text-muted me-2" />
                  <span className="small">Phone: {doctor.phone}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="small text-muted mb-1">Education:</p>
                <p className="small mb-2">{doctor.education}</p>
                <p className="small text-muted mb-1">Qualifications:</p>
                <p className="small mb-2">{doctor.qualifications.length > 0 ? doctor.qualifications.join(', ') : 'Not specified'}</p>
                <p className="small text-muted mb-1">Gender:</p>
                <p className="small">{doctor.gender}</p>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="text-muted small">Consultation Fee</span>
                  <div className="fw-bold text-danger">{typeof doctor.consultationFee === 'number' ? `$${doctor.consultationFee}` : doctor.consultationFee}</div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button 
                  className="btn btn-danger btn-sm flex-grow-1"
                  onClick={() => handleBookAppointment(doctor.id)}
                >
                  <Calendar size={14} className="me-1" />
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-5">
          <Users size={64} className="text-muted mb-3" />
          <h5 className="text-muted">No doctors found</h5>
          <p className="text-muted">
            Try adjusting your search criteria or browse all specialties.
          </p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('all');
            }}
            className="btn btn-danger btn-custom"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;