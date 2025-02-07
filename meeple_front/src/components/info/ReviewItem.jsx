import React from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewItem = ({
  gameReviewStar, 
  gameReviewContent,
  gameInfoId,
  userId
}) => {
  return (
    <div className="w-full p-4 border rounded-lg mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((star, index) => (
            <FaStar
              key={index}
              className={`text-xl ${
                index < gameReviewStar 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-gray-600 text-sm">
          작성자: {userId}
        </span>
      </div>
      <div className="text-gray-700 whitespace-pre-wrap">
        {gameReviewContent}
      </div>
    </div>
  );
};

export default ReviewItem;