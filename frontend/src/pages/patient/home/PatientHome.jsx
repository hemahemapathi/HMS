import { Heart, Shield, Clock, Award, Star, ChevronRight, Calendar, Users, Activity, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';

const PatientHome = () => {
  const [specialists, setSpecialists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch doctors
        const doctorsResponse = await api.get('/doctors');
        const doctors = doctorsResponse.data.doctors || [];
        setSpecialists(doctors.slice(0, 3));
        
        // Fetch reviews (4 most recent)
        const reviewsResponse = await api.get('/reviews?limit=4');
        const reviewsData = reviewsResponse.data.reviews || [];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const services = [
    {
      icon: Heart,
      title: "24/7 Emergency Care",
      description: "Round-the-clock emergency medical services with expert care"
    },
    {
      icon: Shield,
      title: "Preventive Care",
      description: "Comprehensive health screenings and preventive treatments"
    },
    {
      icon: Clock,
      title: "Telemedicine",
      description: "Virtual consultations from the comfort of your home"
    },
    {
      icon: Award,
      title: "Specialized Treatment",
      description: "Expert specialists for complex medical conditions"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white py-5 py-md-5 mt-0 mt-md-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4 text-dark">
                Your Health,
                <span className="text-danger"> Our Priority</span>
              </h1>
              <p className="lead mb-4 text-muted">
                Experience comprehensive healthcare management with our advanced patient portal. 
                Access your medical records, track appointments, and connect with healthcare professionals.
              </p>
              <div className="row g-4 mt-4">
                <div className="col-4">
                  <div className="text-center">
                    <div className="h3 fw-bold mb-1 text-danger">24/7</div>
                    <small className="text-muted">Emergency Care</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <div className="h3 fw-bold mb-1 text-danger">500+</div>
                    <small className="text-muted">Expert Doctors</small>
                  </div>
                </div>
                <div className="col-4">
                  <div className="text-center">
                    <div className="h3 fw-bold mb-1 text-danger">98%</div>
                    <small className="text-muted">Satisfaction</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 text-center mt-4 mt-lg-0">
              <img 
                src="/images/hero img.png" 
                alt="Healthcare Management" 
                className="img-fluid rounded-5 shadow-lg"
                style={{ maxWidth: '90%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Quote */}
      <section className="py-2 py-md-5">
        <div className="container text-center">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <blockquote className="blockquote">
                <p className="fs-4 text-muted fst-italic">
                
                </p>
                <footer className="blockquote">
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-3 py-md-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-danger mb-3">Our Services</h2>
            <p className="lead text-muted">Comprehensive healthcare solutions for you and your family</p>
          </div>
          
          <div className="row g-4">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="col-md-6 col-lg-3">
                  <div className="card h-100 border-0 shadow-sm card-hover">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <Icon size={48} className="text-danger" />
                      </div>
                      <h5 className="card-title text-danger">{service.title}</h5>
                      <p className="card-text text-muted">{service.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-danger mb-3">Meet Our Experts</h2>
            <p className="lead text-muted">World-class specialists dedicated to your health</p>
          </div>
          
          <div className="row g-4">
            {specialists.map((doctor, index) => (
              <div key={doctor._id || index} className="col-md-6 col-lg-4">
                <div className="card border-0 shadow-sm card-hover">
                  <div className="card-body text-center p-4">
                    <img 
                      src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=dc2626&color=fff&size=100`}
                      alt={doctor.name}
                      className="rounded-circle mb-3"
                      width="100"
                      height="100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=dc2626&color=fff&size=100`;
                      }}
                    />
                    <h5 className="card-title text-danger">{doctor.name}</h5>
                    <p className="text-muted mb-2">{doctor.specialization}</p>
                    <p className="small text-muted mb-2">{doctor.experience || 0}+ years experience</p>
                    <div className="d-flex justify-content-center align-items-center mb-3">
                      <Star size={16} className="text-warning me-1" fill="currentColor" />
                      <span className="fw-bold">4.5</span>
                    </div>
                    <Link to="/patient/doctors" className="btn btn-outline-danger btn-sm">
                      View Profile <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-danger mb-3">Patient Reviews</h2>
              <p className="lead text-muted">What our patients say about us</p>
            </div>
            
            <div className="row g-4">
              {reviews.map((review, index) => (
                <div key={review._id || index} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm card-hover h-100">
                    <div className="card-body p-4">
                      <div className="d-flex mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={16} className="text-warning me-1" fill="currentColor" />
                        ))}
                      </div>
                      <p className="card-text text-muted mb-3">"{review.comment}"</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-danger">{review.patient?.name}</h6>
                        <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <h5 className="text-danger mb-3">MediCare Plus</h5>
              <p className="text-light">
                Your trusted healthcare partner providing comprehensive medical services 
                with compassion and excellence.
              </p>
            </div>
            
            <div className="col-lg-2 col-md-6">
              <h6 className="text-danger mb-3">Services</h6>
              <ul className="list-unstyled">
                <li><a href="#" className="text-light text-decoration-none">Emergency Care</a></li>
                <li><a href="#" className="text-light text-decoration-none">Telemedicine</a></li>
                <li><a href="#" className="text-light text-decoration-none">Preventive Care</a></li>
                <li><a href="#" className="text-light text-decoration-none">Specialists</a></li>
              </ul>
            </div>
            
            <div className="col-lg-2 col-md-6">
              <h6 className="text-danger mb-3">Quick Links</h6>
              <ul className="list-unstyled">
                <li><Link to="/patient/appointments" className="text-light text-decoration-none">Appointments</Link></li>
                <li><Link to="/patient/doctors" className="text-light text-decoration-none">Find Doctors</Link></li>
                <li><Link to="/patient/dashboard" className="text-light text-decoration-none">Dashboard</Link></li>
                <li><Link to="/patient/profile" className="text-light text-decoration-none">My Profile</Link></li>
              </ul>
            </div>
            
            <div className="col-lg-4">
              <h6 className="text-danger mb-3">Contact Info</h6>
              <p className="text-light mb-2">📍 123 Healthcare Ave, Medical City</p>
              <p className="text-light mb-2">📞 +1 (555) 123-4567</p>
              <p className="text-light mb-2">✉️ info@medicareplus.com</p>
              <p className="text-light">🕒 24/7 Emergency Services</p>
            </div>
          </div>
          
          <hr className="my-4 border-secondary" />
          
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 text-light">© 2025 MediCare Plus. All rights reserved.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="#" className="text-light text-decoration-none me-3">Privacy Policy</a>
              <a href="#" className="text-light text-decoration-none">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PatientHome;