import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import GameInfoAPI from "../../../../sources/api/GameInfoAPI";

const GameReviewModal = ({ isOpen, onClose, gameInfoId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 200;

  const { token } = useSelector((state) => state.user);
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  if (!isOpen) return null;

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating) {
      alert("별점을 선택해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    const reviewData = {
      gameReviewStar: rating,
      gameReviewContent: content,
      gameInfoId: gameInfoId,
      userId: userId,
    };

    try {
      setIsSubmitting(true);
      await GameInfoAPI.createReview(reviewData);
      alert("리뷰가 성공적으로 등록되었습니다.");
      onClose();
    } catch (error) {
      alert("리뷰 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-cyan-500/60 rounded-xl p-8 w-full max-w-lg relative overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-cyan-500/10 pointer-events-none" />

        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">
          즐거우셨나요? <span className="text-white">😆</span>
        </h2>
        <p className="text-gray-300 mb-8">
          게임을 플레이해주셔서 감사합니다! 어떠셨나요?
          <br /> 게임에 대한 리뷰를 남겨주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center items-center space-x-2 bg-gray-800/50 py-4 rounded-lg">
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
                    className="text-4xl transition-all duration-200 hover:scale-110"
                    style={{
                      color:
                        ratingValue <= (hover || rating)
                          ? "#00ffff"
                          : "#4b5563",
                    }}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>

          <div className="relative">
            <textarea
              placeholder="게임에 대한 의견을 자유롭게 작성해주세요!"
              value={content}
              onChange={handleContentChange}
              className="w-full min-h-[120px] p-4 bg-gray-800/50 border border-cyan-500/30 rounded-lg 
                       text-gray-100 placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
              {charCount}/{maxChars}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                const confirmSkip =
                  window.confirm("리뷰 작성을 건너뛰시겠습니까?");
                if (confirmSkip) onClose();
              }}
              className="px-6 py-2 text-gray-300 bg-gray-800/80 rounded-lg 
                       border border-gray-600 hover:bg-gray-700 
                       transition-all duration-300"
              disabled={isSubmitting}
            >
              건너뛰기
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-cyan-600 
                       text-white rounded-lg hover:from-cyan-500 hover:to-cyan-400 
                       transition-all duration-300 transform hover:scale-105
                       disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:scale-100"
            >
              {isSubmitting ? "저장 중..." : "리뷰 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GameReviewModal;
