import { useState, useEffect } from 'react';
import { Search, Star, User, Calendar, MessageSquare } from 'lucide-react';
import DoctorLoading from '../../../components/loading/DoctorLoading';
import api from '../../../utils/api';

const DoctorReviews = () => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews/doctor');
      const reviewsData = response.data?.reviews || [];
      
      // Map the API response to match our component structure
      const formattedReviews = reviewsData.map(review => ({
        id: review._id,
        patientName: review.patient?.name || 'Anonymous Patient',
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt || review.date,
        appointmentReason: review.appointment?.reason || 'General Consultation'
      }));
      
      setReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Keep empty array on error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        style={{
          color: index < rating ? '#fbbf24' : '#e5e7eb',
          fill: index < rating ? '#fbbf24' : 'none'
        }}
      />
    ));
  };

  if (loading) return <DoctorLoading />;

  return (
    <div className="doctor-portal" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)', minHeight: '100vh' }}>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div style={{
              background: 'var(--doctor-primary)',
              borderRadius: '20px',
              padding: '2rem',
              color: 'white',
              marginBottom: '2rem',
              boxShadow: 'var(--doctor-shadow-lg)'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1" style={{ fontSize: '2rem', fontWeight: '700' }}>Patient Reviews</h2>
                  <p className="mb-0" style={{ opacity: 0.9 }}>View all patient feedback and ratings</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="text-center">
                    <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{averageRating}</div>
                    <div className="d-flex justify-content-center mb-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <small style={{ opacity: 0.9 }}>{reviews.length} reviews</small>
                  </div>
                  <div className="position-relative" style={{ width: '300px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ 
                        paddingLeft: '2.5rem',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white'
                      }}
                    />
                    <Search size={18} className="position-absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'white' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="row g-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div key={review.id} className="col-lg-6 col-xl-4">
                <div 
                  className="card h-100" 
                  style={{ 
                    border: 'none',
                    borderRadius: '16px',
                    background: 'white',
                    boxShadow: 'var(--doctor-shadow)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--doctor-shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--doctor-shadow)';
                  }}
                >
                  {/* Card Header */}
                  <div style={{
                    background: 'var(--doctor-light)',
                    padding: '1rem',
                    borderRadius: '16px 16px 0 0'
                  }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            backgroundColor: 'var(--doctor-primary)',
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {review.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="mb-1" style={{ color: 'var(--doctor-text)', fontWeight: '600' }}>
                            {review.patientName}
                          </h6>
                          <small className="text-muted">{review.appointmentReason}</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  <div className="card-body" style={{ padding: '1.5rem' }}>
                    {/* Review Comment */}
                    <div className="mb-3">
                      <div className="d-flex align-items-start mb-2">
                        <MessageSquare size={16} style={{ color: 'var(--doctor-primary)', marginRight: '0.5rem', marginTop: '0.25rem' }} />
                        <p style={{ margin: 0, color: '#374151', lineHeight: '1.5' }}>
                          "{review.comment}"
                        </p>
                      </div>
                    </div>

                    {/* Review Date */}
                    <div className="d-flex align-items-center text-muted">
                      <Calendar size={14} className="me-2" />
                      <small>{new Date(review.date).toLocaleDateString()}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: 'var(--doctor-shadow)'
              }}>
                <MessageSquare size={64} className="text-muted mb-3" />
                <h5 className="text-muted">No reviews found</h5>
                <p className="text-muted">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'You haven\'t received any patient reviews yet.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorReviews;