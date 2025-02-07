import React, { useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState('');
  const gameId = useParams();
  const { token } = useSelector((state) => state.user);
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/api/reviews', {
        gameReviewStar:rating,
        gameReviewContent:content,
        gameInfoId:gameId,
        userId:userId,
      });
      
      if (response.status === 200) {
        alert('리뷰가 성공적으로 저장되었습니다.');
        setRating(0);
        setContent('');
      }
    } catch (error) {
      console.error('리뷰 저장 중 오류 발생:', error);
      alert('리뷰 저장에 실패했습니다.');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 space-y-6"
    >
      <div className="flex justify-center items-center space-x-1">
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1;
          
          return (
            <label key={index} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={ratingValue}
                onClick={() => setRating(ratingValue)}
                className="hidden"
              />
              <FaStar
                className="text-3xl transition-colors duration-200"
                style={{
                  color: ratingValue <= (hover || rating) 
                    ? '#ffc107' 
                    : '#e4e5e9'
                }}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              />
            </label>
          );
        })}
      </div>
      
      <div className="w-full">
        <textarea
          placeholder="리뷰 내용을 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full min-h-[150px] p-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent resize-y"
        />
      </div>
      
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg
                   hover:bg-blue-700 transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        리뷰 등록
      </button>
    </form>
  );
};

export default ReviewForm;