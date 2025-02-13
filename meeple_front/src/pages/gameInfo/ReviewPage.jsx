// ReviewList.jsx
import ReviewForm from "../../components/info/gamereview/ReviewForm"
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReviewItem from "../../components/info/gamereview/ReviewItem";
import { GameInfoAPI } from '../../sources/api/GameInfoAPI';
import { useSelector } from 'react-redux';
import { h2, p } from "framer-motion/client";

import Pagination from "../../components/admin/Pagination";

const ReviewPage = () => {
  const { gameInfoId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);
  
  const { token } = useSelector((state) => state.user);
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!data) return null;

  const getCurrentUserReview = () => {
    return data.reviewList?.find(
      review => String(review.user.userId) === String(currentUserId)
    );
  };

  const getOtherReviews = () => {
    return data.reviewList?.filter(
      review => String(review.user.userId) !== String(currentUserId)
    );
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.reviewList.slice(startIndex, endIndex);
  };

  return (
    <div>
      <div className="min-h-screen p-8 bg-[#0a0a2a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 max-h-[650px] overflow-y-auto custom-scrollbar">
            
            <h1 className="text-5xl font-bold text-cyan-400 mb-4 tracking-wide">
              게임 리뷰
            </h1>
              <section className="text-white">
                {data.starAvg 
                  ? `별점 ${data.starAvg}` 
                  : "아직 별점을 등록한 사람이 없어요"
                }
              </section>
              
              {/* 현재 유저의 리뷰가 없다면 */}
              {!editingReviewId && !getCurrentUserReview() && (
                <p>
                <h2 className="text-white">이 게임에 작성하신 리뷰가 없어요! 플레이 하시고 직접 리뷰를 작성해보세요</h2>
                </p>
              )}

              {/* 현재 유저의 리뷰 */}
              {getCurrentUserReview() && (
                <div className="mt-8 mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">내 리뷰</h2>
                  
                    {editingReviewId === getCurrentUserReview().gameReviewId ? (
                      <ReviewForm 
                        initialData={getCurrentUserReview()}
                        onSuccess={handleEditSuccess}
                      />
                    ) : (
                      <ReviewItem 
                        {...getCurrentUserReview()}
                        isAuthor={true}
                        onEditClick={() => handleEditClick(getCurrentUserReview().gameReviewId)}
                        onDeleteClick={() => handleDeleteClick(getCurrentUserReview().gameReviewId)}
                      />
                    )}
                  
                </div>
              )}

              {/* 다른 사용자들의 리뷰 */}
              <section className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">전체 리뷰</h2>
                {getCurrentPageData()?.map((item) => (
                    <ReviewItem 
                      key={item.gameReviewId}
                      {...item}
                      isAuthor={String(currentUserId) === String(item.user.userId)}
                      onEditClick={() => handleEditClick(item.gameReviewId)}
                      onDeleteClick={() => handleDeleteClick(item.gameReviewId)}
                    />
                ))}
                <Pagination
                  totalItems={data.reviewList.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </section>
            </div>
          
        </div>
      </div>
    </div>
  );
};


export default ReviewPage;
