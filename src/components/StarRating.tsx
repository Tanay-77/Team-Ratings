import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  currentRating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
  hideRating?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ currentRating, onRate, disabled, hideRating = false }) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
        <button
          key={rating}
          onClick={() => !disabled && onRate(rating)}
          onMouseEnter={() => !disabled && setHoveredRating(rating)}
          onMouseLeave={() => !disabled && setHoveredRating(0)}
          disabled={disabled}
          className={`w-6 h-6 transition-all duration-150 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`w-full h-full ${
              hideRating 
                ? (rating <= hoveredRating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300')
                : (rating <= (hoveredRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300')
            } transition-colors duration-150`}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">
        {hideRating ? '?' : (currentRating > 0 ? `${currentRating.toFixed(1)}/10` : 'Not rated')}
      </span>
    </div>
  );
};

export default StarRating;