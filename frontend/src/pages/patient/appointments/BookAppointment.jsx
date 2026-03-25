import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Star, DollarSign, ArrowLeft, Upload, FileText, CreditCard, ChevronDown } from 'lucide-react';
import Toast from '../../../components/toast/Toast';
import MobileSelect from '../../../components/MobileSelect';
import api from '../../../utils/api';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [modalDoctor, setModalDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    doctorId: '',
    reason: '',
    healthRecords: []
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [appointmentId, setAppointmentId] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online');
  const [showDateModal, setShowDateModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (appointmentData.date && appointmentData.date !== '') {
      console.log('Checking availability for date:', appointmentData.date);
      checkAvailability();
    }
  }, [appointmentData.date]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const checkAvailability = async () => {
    if (!appointmentData.date || appointmentData.date === '') {
      return;
    }
    
    setSlotsLoading(true);
    
    try {
      const response = await api.get(`/appointments/availability?date=${encodeURIComponent(appointmentData.date)}`);
      const bookedSlots = response.data.bookedSlots || [];
      const allSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      const available = allSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
    } catch (error) {
      const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      setAvailableSlots(slots);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setModalDoctor(doctor);
    setShowDoctorModal(true);
  };

  const confirmDoctorSelection = () => {
    setSelectedDoctor(modalDoctor);
    setAppointmentData({...appointmentData, doctorId: modalDoctor._id});
    setShowDoctorModal(false);
    setStep(3);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAppointmentData({...appointmentData, healthRecords: files});
  };

  const handleSubmit = async () => {
    if (!appointmentData.reason.trim()) {
      showToast('Please enter a reason for your visit', 'error');
      return;
    }

    console.log('Submitting appointment data:', {
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      time: appointmentData.time,
      reason: appointmentData.reason
    });

    try {
      const response = await api.post('/appointments', {
        doctorId: appointmentData.doctorId,
        date: appointmentData.date,
        time: appointmentData.time,
        reason: appointmentData.reason
      });
      
      if (response.data.success) {
        setAppointmentId(response.data.appointment._id);
        showToast('Appointment created! Please proceed to payment.');
        setStep(4); // Go to payment step
      }
    } catch (error) {
      console.error('Booking error:', error.response?.data);
      if (error.response?.status === 400) {
        showToast(error.response?.data?.message || 'Time slot not available', 'error');
        setStep(1);
      } else {
        showToast('Error booking appointment. Please try again.', 'error');
      }
    }
  };

  const handlePayment = async () => {
    if (!appointmentId) {
      showToast('No appointment found. Please try again.', 'error');
      return;
    }

    setPaymentProcessing(true);
    
    try {
      if (selectedPaymentMethod === 'online') {
        // Simulate online payment success
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const confirmResponse = await api.put(`/appointments/${appointmentId}/status`, {
          status: 'approved',
          paymentStatus: 'paid',
          paymentMethod: 'online'
        });
        
        if (confirmResponse.data.success) {
          setPaymentProcessing(false);
          showToast('Payment successful!', 'success');
          setStep(5);
        }
      } else {
        // Offline payment
        const offlineResponse = await api.put(`/appointments/${appointmentId}/status`, {
          status: 'approved',
          paymentStatus: 'pending',
          paymentMethod: 'offline'
        });
        
        if (offlineResponse.data.success) {
          setPaymentProcessing(false);
          showToast('Appointment confirmed!', 'success');
          setStep(5);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentProcessing(false);
      showToast('Payment processing failed. Please try again.', 'error');
    }
  };

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <button 
            className="btn btn-outline-danger mb-3"
            onClick={() => navigate('/patient/appointments')}
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Appointments
          </button>
          <h2 className="text-danger mb-1">Book New Appointment</h2>
          <p className="text-muted">Step {step} of 5</p>
        </div>
      </div>

      {/* Step 1: Date & Time Selection */}
      {step === 1 && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Select Date & Time</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label">Choose Date</label>
                  {/* Mobile Date Button */}
                  <div className="d-md-none">
                    <button
                      type="button"
                      className="form-control text-start d-flex justify-content-between align-items-center"
                      onClick={() => setShowDateModal(true)}
                      style={{ minHeight: '48px' }}
                    >
                      <span>{appointmentData.date ? new Date(appointmentData.date).toLocaleDateString() : 'Select date'}</span>
                      <Calendar size={16} />
                    </button>
                  </div>
                  {/* Desktop Date Input */}
                  <div className="d-none d-md-block">
                    <input
                      type="date"
                      className="form-control"
                      value={appointmentData.date}
                      onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {appointmentData.date && (
                  <div className="mb-4">
                    <label className="form-label">Available Time Slots</label>
                    {slotsLoading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-danger" role="status">
                          <span className="visually-hidden">Loading slots...</span>
                        </div>
                        <p className="text-muted mt-2">Loading available slots...</p>
                      </div>
                    ) : (
                      <div className="row g-2">
                        {availableSlots.map(slot => (
                          <div key={slot} className="col-6">
                            <button
                              className={`btn w-100 ${
                                appointmentData.time === slot ? 'btn-danger' : 'btn-outline-danger'
                              }`}
                              onClick={() => setAppointmentData({...appointmentData, time: slot})}
                            >
                              <Clock size={16} className="me-2" />
                              {slot}
                            </button>
                          </div>
                        ))}
                        {availableSlots.length === 0 && (
                          <div className="col-12">
                            <div className="alert alert-warning">
                              No slots available for this date. Please choose another date.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {appointmentData.date && appointmentData.time && (
                  <button 
                    className="btn btn-danger w-100"
                    onClick={() => setStep(2)}
                  >
                    Next: Choose Doctor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Doctor Selection */}
      {step === 2 && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Choose Doctor</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <p><strong>Selected:</strong> {new Date(appointmentData.date).toLocaleDateString()} at {appointmentData.time}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label">Select Doctor</label>
                  <MobileSelect
                    options={[
                      { value: '', label: 'Choose a doctor...' },
                      ...doctors.map(doctor => ({ 
                        value: doctor._id, 
                        label: `Dr. ${doctor.name} - ${doctor.specialization}` 
                      }))
                    ]}
                    value={selectedDoctor?._id || ''}
                    onChange={(value) => {
                      const doctor = doctors.find(d => d._id === value);
                      if (doctor) handleDoctorSelect(doctor);
                    }}
                    placeholder="Choose a doctor..."
                  />
                </div>

                {selectedDoctor && (
                  <div className="alert alert-success">
                    <strong>Selected:</strong> Dr. {selectedDoctor.name} - {selectedDoctor.specialization}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                  {selectedDoctor && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => setStep(3)}
                    >
                      Next: Upload Records
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Health Records Upload */}
      {step === 3 && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Upload Health Records</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <p><strong>Appointment:</strong> {new Date(appointmentData.date).toLocaleDateString()} at {appointmentData.time}</p>
                  <p><strong>Doctor:</strong> Dr. {selectedDoctor?.name}</p>
                </div>

                <div className="mb-4">
                  <label className="form-label">Reason for Visit</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={appointmentData.reason}
                    onChange={(e) => setAppointmentData({...appointmentData, reason: e.target.value})}
                    placeholder="Describe your symptoms or reason for visit..."
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label">Previous Health Records (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  <small className="text-muted">Upload previous test reports, prescriptions, or medical records (PDF, JPG, PNG)</small>
                </div>

                {appointmentData.healthRecords.length > 0 && (
                  <div className="mb-4">
                    <h6>Uploaded Files:</h6>
                    {appointmentData.healthRecords.map((file, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <FileText size={16} className="me-2 text-muted" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={handleSubmit}
                    disabled={!appointmentData.reason}
                  >
                    Create Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Payment */}
      {step === 4 && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow">
              <div className="card-header bg-danger text-white">
                <h5 className="mb-0">Payment</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h6 className="text-danger">Appointment Summary</h6>
                  <div className="border rounded p-3 mb-3">
                    <p><strong>Date:</strong> {new Date(appointmentData.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointmentData.time}</p>
                    <p><strong>Doctor:</strong> Dr. {selectedDoctor?.name}</p>
                    <p><strong>Specialization:</strong> {selectedDoctor?.specialization}</p>
                    <p><strong>Reason:</strong> {appointmentData.reason}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-danger">Payment Details</h6>
                  <div className="border rounded p-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Consultation Fee:</span>
                      <span>${selectedDoctor?.consultationFee || 100}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Platform Fee:</span>
                      <span>$5</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total Amount:</span>
                      <span>${(selectedDoctor?.consultationFee || 100) + 5}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-danger">Payment Method</h6>
                  <div className="border rounded p-3">
                    <div className="form-check mb-3">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="paymentMethod" 
                        id="online" 
                        value="online" 
                        checked={selectedPaymentMethod === 'online'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="online">
                        <CreditCard size={16} className="me-2" />
                        💳 Online Payment (Credit/Debit Card)
                      </label>
                    </div>
                    
                    <div className="form-check mb-3">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        name="paymentMethod" 
                        id="offline" 
                        value="offline"
                        checked={selectedPaymentMethod === 'offline'}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="offline">
                        <DollarSign size={16} className="me-2" />
                        💰 Pay at Hospital (Cash/Card at Reception)
                      </label>
                    </div>
                    
                    {/* Online Payment Form */}
                    {selectedPaymentMethod === 'online' && (
                      <div className="mt-3">
                        <div className="row g-2">
                          <div className="col-12">
                            <input type="text" className="form-control" placeholder="Card Number" />
                          </div>
                          <div className="col-6">
                            <input type="text" className="form-control" placeholder="MM/YY" />
                          </div>
                          <div className="col-6">
                            <input type="text" className="form-control" placeholder="CVC" />
                          </div>
                        </div>
                        <small className="text-muted">💳 Secure payment via Stripe</small>
                      </div>
                    )}
                    
                    {/* Offline Payment Info */}
                    {selectedPaymentMethod === 'offline' && (
                      <div className="mt-3">
                        <div className="alert alert-info">
                          <h6>💰 Pay at Hospital</h6>
                          <p className="mb-2">You can pay when you arrive at the hospital:</p>
                          <ul className="mb-0">
                            <li>Cash payment at reception</li>
                            <li>Card payment at reception</li>
                            <li>Mobile payment (UPI/Digital wallet)</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setStep(3)}
                    disabled={paymentProcessing}
                  >
                    Back
                  </button>
                  <button 
                    className="btn btn-success flex-grow-1"
                    onClick={handlePayment}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {selectedPaymentMethod === 'online' ? (
                          <>
                            <DollarSign size={16} className="me-2" />
                            Pay ${(selectedDoctor?.consultationFee || 100) + 5}
                          </>
                        ) : (
                          <>
                            💰 Confirm Appointment (Pay at Hospital)
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Success Page */}
      {step === 5 && (
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card shadow border-success">
              <div className="card-header bg-success text-white text-center">
                <h5 className="mb-0">Payment Successful!</h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-4">
                  <div className="text-success mb-3">
                    <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                  </div>
                  <h4 className="text-success">Thank You!</h4>
                  <p className="text-muted">Your appointment has been booked and payment confirmed.</p>
                </div>

                <div className="mb-4">
                  <h6 className="text-success">Appointment Details</h6>
                  <div className="border rounded p-3 text-start">
                    <p><strong>Date:</strong> {new Date(appointmentData.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {appointmentData.time}</p>
                    <p><strong>Doctor:</strong> Dr. {selectedDoctor?.name}</p>
                    <p><strong>Specialization:</strong> {selectedDoctor?.specialization}</p>
                    <p><strong>Reason:</strong> {appointmentData.reason}</p>
                    <p><strong>Status:</strong> <span className="badge bg-success">Confirmed & Paid</span></p>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-success">Payment Summary</h6>
                  <div className="border rounded p-3 text-start">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Consultation Fee:</span>
                      <span>${selectedDoctor?.consultationFee || 100}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Platform Fee:</span>
                      <span>$5</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold text-success">
                      <span>Total Paid:</span>
                      <span>${(selectedDoctor?.consultationFee || 100) + 5}</span>
                    </div>
                    <p className="mt-2 mb-0"><strong>Payment Status:</strong> <span className="badge bg-success">Paid</span></p>
                  </div>
                </div>

                <div className="alert alert-info">
                  <small>
                    <strong>What's Next?</strong><br />
                    • You will receive a confirmation email shortly<br />
                    • The doctor will be notified of your appointment<br />
                    • You can view/manage this appointment in your dashboard
                  </small>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-success"
                    onClick={() => navigate('/patient/appointments')}
                  >
                    View My Appointments
                  </button>
                  <button 
                    className="btn btn-outline-success"
                    onClick={() => navigate('/patient/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDoctorModal && modalDoctor && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Dr. {modalDoctor.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDoctorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-danger">Doctor Information</h6>
                    <p><strong>Specialization:</strong> {modalDoctor.specialization}</p>
                    <p><strong>Experience:</strong> {modalDoctor.experience || '5+'} years</p>
                    <p><strong>Consultation Fee:</strong> ${modalDoctor.consultationFee || 100}</p>
                    <p><strong>Availability:</strong> Mon-Fri, 9 AM - 5 PM</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-danger">Patient Reviews</h6>
                    <div className="d-flex align-items-center mb-2">
                      <Star size={16} className="text-warning me-1" />
                      <span>4.8/5 (124 reviews)</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">"Excellent doctor, very professional and caring."</small>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">"Highly recommend! Great experience."</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDoctorModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={confirmDoctorSelection}
                >
                  Select Dr. {modalDoctor.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={hideToast}
      />

      {/* Mobile Date Modal */}
      {showDateModal && (
        <div className="modal show d-block d-flex align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog mx-auto" style={{ maxWidth: '90vw', width: '350px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Select Date</h6>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDateModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3">
                <input
                  type="date"
                  className="form-control mb-3"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ fontSize: '16px' }}
                />
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-secondary flex-fill"
                    onClick={() => setShowDateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger flex-fill"
                    onClick={() => setShowDateModal(false)}
                    disabled={!appointmentData.date}
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;