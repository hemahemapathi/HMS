import { useState, useEffect } from 'react';
import { MessageSquare, Calendar } from 'lucide-react';
import Loading from '../../../components/loading/Loading';
import StarRating from '../../../components/StarRating';
import api from '../../../utils/api';

const PatientReviews = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reviews/my-reviews');
        setReviews(response.data.reviews || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="page-container py-4">
      <div className="row mb-4">
        <div className="col-12 text-center text-md-start">
          <h2 className="text-danger mb-1">
            <MessageSquare size={28} className="me-2" />
            My Reviews
          </h2>
          <p className="text-muted">All your submitted consultation reviews</p>
        </div>
      </div>

      {reviews.length > 0 ? (
        <div className="row g-4">
          {reviews.map((review) => (
            <div key={review._id} className="col-lg-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                      <MessageSquare size={24} className="text-danger" />
                    </div>
                    <div className="flex-grow-1">
                      <h5 className="mb-1">Dr. {review.doctor?.name}</h5>
                      <p className="text-muted mb-0">{review.doctor?.specialization}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2 fw-semibold">Rating:</span>
                      <StarRating rating={review.rating} readonly size={20} />
                    </div>
                  </div>

                  {review.comment && (
                    <div className="mb-3">
                      <h6 className="text-muted mb-2">Your Review:</h6>
                      <p className="bg-light p-3 rounded">"{review.comment}"</p>
                    </div>
                  )}

                  <div className="border-top pt-3">
                    <div className="row text-muted small">
                      <div className="col-6">
                        <Calendar size={14} className="me-1" />
                        Appointment: {new Date(review.appointment?.date).toLocaleDateString()}
                      </div>
                      <div className="col-6 text-end">
                        Reviewed: {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <MessageSquare size={64} className="text-muted mb-3" />
          <h4 className="text-muted">No Reviews Yet</h4>
          <p className="text-muted">Your consultation reviews will appear here after you submit them.</p>
        </div>
      )}
    </div>
  );
};

export default PatientReviews;