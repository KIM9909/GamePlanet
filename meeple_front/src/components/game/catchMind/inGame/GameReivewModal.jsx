import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import GameInfoAPI from "../../../../sources/api/GameInfoAPI";

const GameReviewModal = ({ isOpen, onClose, gameInfoId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token } = useSelector((state) => state.user);
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  if (!isOpen) return null;

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
      console.error("리뷰 저장 중 오류 발생:", error);
      alert("리뷰 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          게임 리뷰 작성
        </h2>
        <p className="text-gray-600 mb-6">
          캐치마인드 게임을 플레이해주셔서 감사합니다! 게임에 대한 리뷰를
          남겨주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      color:
                        ratingValue <= (hover || rating)
                          ? "#ffc107"
                          : "#e4e5e9",
                    }}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              );
            })}
          </div>

          <textarea
            placeholder="게임에 대한 의견을 자유롭게 작성해주세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                const confirmSkip =
                  window.confirm("리뷰 작성을 건너뛰시겠습니까?");
                if (confirmSkip) onClose();
              }}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              건너뛰기
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
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
