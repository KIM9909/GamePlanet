import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReviewForm from '../info/ReviewForm';
import ReviewItem from './ReviewItem';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import { FaStar } from 'react-icons/fa';

const ReviewList = () => {
  const { gameInfoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const { token } = useSelector((state) => state.user);
  const currentUserId = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
  
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewData = await GameInfoAPI.getReviews(gameInfoId);
      setData(reviewData);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [gameInfoId]);

  const handleEditClick = (reviewId) => {
    setEditingReviewId(reviewId);
    setShowReviewForm(false);
  };

  const handleEditSuccess = () => {
    setEditingReviewId(null);
    fetchReviews();
  };

  const handleDeleteClick = async (reviewId) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        await GameInfoAPI.deleteReview(gameInfoId, reviewId);
        alert('리뷰가 삭제되었습니다.');
        fetchReviews();
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-cyan-400 text-lg">리뷰 로딩 중...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-red-400 text-lg">리뷰를 불러오는데 실패했습니다.</div>
    </div>
  );
  
  if (!data) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* 전체 리뷰 제목과 별점 */}
      <div className="text-2xl font-bold text-white mb-4">
        전체 리뷰
      </div>
      
      <div className="mb-6">
        <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaStar className="text-yellow-400 text-xl" />
            <span className="text-lg font-bold text-white">
              {data.starAvg 
                ? `평균 ${data.starAvg}점` 
                : "아직 별점이 없어요"
              }
            </span>
          </div>
          {!editingReviewId && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              리뷰 작성하기
            </button>
          )}
        </div>
      </div>

      {/* 리뷰 폼 */}
      {(showReviewForm || editingReviewId) && (
        <div className="mb-6">
          <ReviewForm 
            gameInfoId={gameInfoId}
            initialData={editingReviewId ? data.reviewList.find(r => r.gameReviewId === editingReviewId) : null}
            onSuccess={() => {
              fetchReviews();
              setShowReviewForm(false);
              setEditingReviewId(null);
            }}
          />
        </div>
      )}

      {/* 리뷰 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {data.reviewList?.map((item) => (
          <div key={item.gameReviewId} className="w-full">
            <ReviewItem 
              {...item}
              isAuthor={String(currentUserId) === String(item.userId)}
              onEditClick={() => handleEditClick(item.gameReviewId)}
              onDeleteClick={() => handleDeleteClick(item.gameReviewId)}
            />
          </div>
        ))}
      </div>

      {/* 리뷰가 없을 때 */}
      {(!data.reviewList || data.reviewList.length === 0) && (
        <div className="text-center py-8 bg-slate-800 rounded-lg">
          <FaStar className="text-gray-500 text-4xl mx-auto mb-3" />
          <p className="text-gray-300 text-lg">아직 리뷰가 없어요!</p>
          <p className="text-gray-400 text-sm mt-1">첫 번째 리뷰를 작성해보세요</p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;