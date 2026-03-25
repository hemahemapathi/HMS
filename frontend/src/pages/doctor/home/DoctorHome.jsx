import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DoctorLoading from '../../../components/loading/DoctorLoading';

const DoctorHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <DoctorLoading />;

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ backgroundColor: '#f8fafc', minHeight: '100vh', overflow: 'hidden' }}>
        <div className="container-fluid px-0">
          <div className="row align-items-center mx-0" style={{ minHeight: '100vh' }}>
            {/* Left Side - Text Content */}
            <div className="col-lg-6">
              <div style={{ padding: '20px' }} className="px-lg-5">
                <h1 className="display-4 display-lg-1" style={{ fontWeight: 'bold', marginBottom: '2rem', color: '#334155', lineHeight: '1.1' }}>
                  Welcome to Your
                  <br />
                  <span style={{ color: '#0ea5e9' }}>Medical Hub</span>
                </h1>
                
                <p className="lead" style={{ marginBottom: '2rem', color: '#64748b', lineHeight: '1.6' }}>
                  Easily manage your medical practice all in one place.
                  <br className="d-none d-md-block" />
                  View your upcoming schedule, manage patient records,
                  <br className="d-none d-md-block" />
                  and stay updated in a secure and organized system.
                </p>
                
                <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                  <Link to="/doctor/patients" className="btn px-3 py-2" style={{ backgroundColor: '#0ea5e9', borderColor: '#0ea5e9', color: 'white', borderRadius: '8px' }}>
                    <Users size={18} className="me-2" />
                    Manage Patients
                  </Link>
                  <Link to="/doctor/appointments" className="btn px-3 py-2" style={{ border: '2px solid #0ea5e9', color: '#0ea5e9', backgroundColor: 'transparent', borderRadius: '8px' }}>
                    <Calendar size={18} className="me-2" />
                    View Schedule
                  </Link>
                </div>

                <div className="d-flex flex-column flex-md-row gap-3">
                  <div className="d-flex align-items-center">
                    <CheckCircle size={20} className="me-2" style={{ color: '#0ea5e9' }} />
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Secure & HIPAA Compliant</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <CheckCircle size={20} className="me-2" style={{ color: '#0ea5e9' }} />
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>24/7 Access</span>
                  </div>
                  <div className="d-flex align-items-center">
                    <CheckCircle size={20} className="me-2" style={{ color: '#0ea5e9' }} />
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Real-time Updates</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Doctor Illustration */}
            <div className="col-lg-6 ps-0">
              <div style={{ paddingRight: '0px' }}>
                <img 
                  src="/images/doctor.png" 
                  alt="Doctor with Medical Dashboard" 
                  className="img-fluid"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="text-center p-4">
                <div style={{ backgroundColor: '#0ea5e9', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Users size={40} color="white" />
                </div>
                <h4 style={{ color: '#334155', marginBottom: '15px' }}>Patient Management</h4>
                <p style={{ color: '#64748b' }}>Efficiently manage patient records, appointments, and medical history in one secure platform.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="text-center p-4">
                <div style={{ backgroundColor: '#0ea5e9', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Calendar size={40} color="white" />
                </div>
                <h4 style={{ color: '#334155', marginBottom: '15px' }}>Smart Scheduling</h4>
                <p style={{ color: '#64748b' }}>Advanced appointment scheduling with automated reminders and calendar integration.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="text-center p-4">
                <div style={{ backgroundColor: '#0ea5e9', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle size={40} color="white" />
                </div>
                <h4 style={{ color: '#334155', marginBottom: '15px' }}>Secure & Compliant</h4>
                <p style={{ color: '#64748b' }}>HIPAA compliant platform ensuring patient data security and privacy protection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ padding: '80px 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ color: '#334155', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Trusted by Healthcare Professionals</h2>
            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Join thousands of doctors who trust our platform for their practice management</p>
          </div>
          <div className="row">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <h3 style={{ color: '#0ea5e9', fontSize: '3rem', fontWeight: 'bold' }}>5000+</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Active Doctors</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <h3 style={{ color: '#0ea5e9', fontSize: '3rem', fontWeight: 'bold' }}>50K+</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Patients Served</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <h3 style={{ color: '#0ea5e9', fontSize: '3rem', fontWeight: 'bold' }}>99.9%</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Uptime</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="text-center">
                <h3 style={{ color: '#0ea5e9', fontSize: '3rem', fontWeight: 'bold' }}>24/7</h3>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'white' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 style={{ color: '#334155', fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Why Choose MediCare Plus?</h2>
            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Experience the difference with our advanced healthcare management platform</p>
          </div>
          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="d-flex align-items-start p-4">
                <div style={{ backgroundColor: '#0ea5e9', borderRadius: '8px', padding: '15px', marginRight: '20px', minWidth: '60px' }}>
                  <CheckCircle size={30} color="white" />
                </div>
                <div>
                  <h5 style={{ color: '#334155', marginBottom: '15px' }}>Advanced Analytics</h5>
                  <p style={{ color: '#64748b' }}>Get detailed insights into your practice performance with comprehensive reporting and analytics tools.</p>
                </div>
              </div>
            </div>
            <div className="col-lg-6 mb-4">
              <div className="d-flex align-items-start p-4">
                <div style={{ backgroundColor: '#0ea5e9', borderRadius: '8px', padding: '15px', marginRight: '20px', minWidth: '60px' }}>
                  <Users size={30} color="white" />
                </div>
                <div>
                  <h5 style={{ color: '#334155', marginBottom: '15px' }}>Team Collaboration</h5>
                  <p style={{ color: '#64748b' }}>Seamlessly collaborate with your medical team and staff through integrated communication tools.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section style={{ padding: '60px 0', backgroundColor: '#334155' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <h4 style={{ color: 'white', marginBottom: '20px' }}>MediCare Plus</h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>Your trusted healthcare management platform. Secure, reliable, and designed for modern medical practices.</p>
            </div>
            <div className="col-lg-2 mb-4">
              <h5 style={{ color: 'white', marginBottom: '20px' }}>Features</h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '10px' }}><Link to="/doctor/patients" style={{ color: '#94a3b8', textDecoration: 'none' }}>Patients</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/doctor/appointments" style={{ color: '#94a3b8', textDecoration: 'none' }}>Appointments</Link></li>
                <li style={{ marginBottom: '10px' }}><Link to="/doctor/dashboard" style={{ color: '#94a3b8', textDecoration: 'none' }}>Dashboard</Link></li>
              </ul>
            </div>
            <div className="col-lg-2 mb-4">
              <h5 style={{ color: 'white', marginBottom: '20px' }}>Support</h5>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '10px' }}><span style={{ color: '#94a3b8' }}>Help Center</span></li>
                <li style={{ marginBottom: '10px' }}><span style={{ color: '#94a3b8' }}>Contact Us</span></li>
                <li style={{ marginBottom: '10px' }}><span style={{ color: '#94a3b8' }}>Privacy Policy</span></li>
              </ul>
            </div>
            <div className="col-lg-4 mb-4">
              <h5 style={{ color: 'white', marginBottom: '20px' }}>Contact Info</h5>
              <p style={{ color: '#94a3b8', marginBottom: '10px' }}>📧 support@medicareplus.com</p>
              <p style={{ color: '#94a3b8', marginBottom: '10px' }}>📞 +1 (555) 123-4567</p>
              <p style={{ color: '#94a3b8' }}>🏥 Available 24/7 for healthcare professionals</p>
            </div>
          </div>
          <hr style={{ borderColor: '#475569', margin: '40px 0 20px' }} />
          <div className="text-center">
            <p style={{ color: '#94a3b8', margin: 0 }}>© 2024 MediCare Plus. All rights reserved. | HIPAA Compliant Healthcare Platform</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DoctorHome;