import React from 'react';
import { FaStar } from 'react-icons/fa';
import { Pencil, Trash } from 'lucide-react';

const ReviewItem = ({
  gameReviewId,
  gameReviewStar, 
  gameReviewContent,
  gameInfoId,
  user,
  isAuthor,
  onEditClick,
  onDeleteClick
}) => {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 group relative w-full">
      {/* 상단부 - 별점과 작성자 정보 */}
      <div className="py-3 px-4 bg-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((star, index) => (
            <FaStar
              key={index}
              className={`text-base ${
                index < gameReviewStar 
                  ? 'text-yellow-400' 
                  : 'text-gray-400'
              }`}
            />
          ))}
        </div>
        <span className="text-cyan-400 font-medium text-sm">
          {user.userNickname}
        </span>
      </div>

      {/* 리뷰 내용 */}
      <div className="p-4">
        <p className="text-gray-200 text-sm leading-relaxed min-h-[60px] max-h-[80px] overflow-y-auto">
          {gameReviewContent}
        </p>
      </div>

      {/* 작성자인 경우 수정/삭제 버튼 */}
      {isAuthor && (
        <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={onEditClick}
            className="p-1.5 bg-slate-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            title="리뷰 수정"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDeleteClick}
            className="p-1.5 bg-slate-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="리뷰 삭제"
          >
            <Trash size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;