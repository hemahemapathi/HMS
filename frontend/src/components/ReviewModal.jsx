import { useState } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';
import api from '../utils/api';

const ReviewModal = ({ isOpen, onClose, appointment, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      await api.post('/reviews', {
        appointmentId: appointment._id,
        rating,
        comment
      });
      
      onReviewSubmitted();
      onClose();
      setRating(0);
      setComment('');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title text-danger">Rate Your Consultation</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="text-center mb-4">
                <h6>Dr. {appointment.doctor?.name}</h6>
                <p className="text-muted">{appointment.doctor?.specialization}</p>
                <small className="text-muted">
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </small>
              </div>

              <div className="mb-3">
                <label className="form-label">How was your consultation?</label>
                <div className="text-center">
                  <StarRating 
                    rating={rating} 
                    onRatingChange={setRating} 
                    size={30}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Comments (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  maxLength="500"
                />
                <small className="text-muted">{comment.length}/500 characters</small>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Skip
              </button>
              <button 
                type="submit" 
                className="btn btn-danger"
                disabled={loading || rating === 0}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;