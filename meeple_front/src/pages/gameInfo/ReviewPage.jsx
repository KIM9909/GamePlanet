import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, RefreshCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import ReviewItem from "../../components/info/gamereview/ReviewItem";
import ReviewForm from "../../components/info/gamereview/ReviewForm";
import { GameInfoAPI } from '../../sources/api/GameInfoAPI';
import Pagination from "../../components/admin/Pagination";
import { toast } from 'react-toastify';

const ReviewPage = () => {
  const { gameInfoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const itemsPerPage = 6;
  
  const currentUserId = useSelector(state => state.user.userId);

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

  const getCurrentUserReview = () => {
    return data?.reviewList?.find(
      review => String(review.user.userId) === String(currentUserId)
    );
  };

  const getOtherReviews = () => {
    const otherReviews = data?.reviewList?.filter(
      review => String(review.user.userId) !== String(currentUserId)
    ) || [];

    switch(sortBy) {
      case 'highest':
        return [...otherReviews].sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return [...otherReviews].sort((a, b) => a.rating - b.rating);
      default: // latest
        return [...otherReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const getCurrentPageData = () => {
    const otherReviews = getOtherReviews();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return otherReviews.slice(startIndex, endIndex);
  };

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
        toast.success('리뷰가 삭제되었습니다.');
        fetchReviews();
      } catch (error) {
        toast.error('리뷰 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen p-8 bg-[#0a0a2a]/50 flex items-center justify-center">
      <div className="text-cyan-400 text-xl animate-pulse">리뷰 로딩 중...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen p-8 bg-[#0a0a2a]/50 flex items-center justify-center">
      <div className="text-red-400 text-xl">리뷰를 불러오는데 실패했습니다.</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="h-[800px] p-8 bg-[#0a0a2a]/50">
      <div className="max-w-7xl mx-auto h-full">
        <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 h-full overflow-y-auto">
          {/* 상단 헤더 섹션 */}
          <div className="flex items-center justify-between mb-8">
            
            <div className="flex items-center gap-4">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                <option value="latest">최신순</option>
                <option value="highest">별점 높은순</option>
                <option value="lowest">별점 낮은순</option>
              </select>
            </div>
          </div>

          {/* 리뷰 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-800 p-4 rounded-lg max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-gray-400">전체 리뷰</p>
              <p className="text-2xl text-white font-bold">{data.reviewList.length}</p>
            </div>
            <div className="text-center border-x border-gray-700">
              <p className="text-gray-400">평균 별점</p>
              <p className="text-2xl text-yellow-400 font-bold">
                {data.starAvg ? Number(data.starAvg.toFixed(1)) : "-"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">내 리뷰</p>
              <p className="text-2xl text-white font-bold">{getCurrentUserReview() ? "작성완료" : "-"}</p>
            </div>
          </div>

          {/* 내 리뷰 섹션 */}
          {!editingReviewId && !getCurrentUserReview() && (
            <div className="mb-8 p-6 bg-gray-800 rounded-lg max-w-2xl mx-auto">
              <h2 className="text-xl text-white">이 게임에 작성하신 리뷰가 없어요! 플레이 하시고 직접 리뷰를 작성해보세요</h2>
            </div>
          )}

          {getCurrentUserReview() && (
            <div className="mt-8 mb-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-white mb-4">내가 작성한 리뷰</h2>
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

          {/* 다른 유저의 리뷰 그리드 */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">다른 유저들의 생생한 후기</h2>
            <button 
              onClick={fetchReviews}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="새로고침"
            >
              <RefreshCcw className="text-cyan-400" size={20} />
            </button>
          </div>
            
            {data.reviewList && data.reviewList.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCurrentPageData().map((item) => (
                    <ReviewItem 
                      key={item.gameReviewId}
                      {...item}
                      isAuthor={false}
                    />
                  ))}
                </div>
                
                {getOtherReviews().length > itemsPerPage && (
                  <div className="mt-8">
                    <Pagination
                      totalItems={getOtherReviews().length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Star className="mx-auto text-gray-500 mb-4" size={40} />
                <p className="text-gray-300 text-lg">아직 작성된 리뷰가 없어요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;