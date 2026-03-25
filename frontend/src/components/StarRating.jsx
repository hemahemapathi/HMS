import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 20 }) => {
  const handleStarClick = (starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  return (
    <div className="d-flex align-items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating 
              ? 'text-warning' 
              : 'text-muted'
          } ${!readonly ? 'cursor-pointer' : ''} me-1`}
          fill={star <= rating ? 'currentColor' : 'none'}
          onClick={() => handleStarClick(star)}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        />
      ))}
      {readonly && (
        <span className="ms-2 text-muted">({rating}/5)</span>
      )}
    </div>
  );
};

export default StarRating;