import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from 'lucide-react';
import ReviewItem from "../../components/info/gamereview/ReviewItem";
import { GameInfoAPI } from '../../sources/api/GameInfoAPI';
import Pagination from "../../components/admin/Pagination";

const ReviewPage = () => {
  const { gameInfoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 2행 3열 그리드
  
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

  const getCurrentPageData = () => {
    if (!data?.reviewList) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.reviewList.slice(startIndex, endIndex);
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
    <div className="h-[800px] p-8 bg-[#0a0a2a]/50">  {/* 전체 높이 지정 */}
      <div className="max-w-7xl mx-auto h-full"> {/* 높이를 부모에 맞춤 */}
        <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 h-full overflow-y-auto">
          {/* 상단 헤더 섹션 */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-cyan-400 tracking-wide">
              게임 리뷰
            </h1>
            <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg">
              <Star className="text-yellow-400" size={24} />
              <span className="text-white text-lg font-medium">
                {data.starAvg 
                  ? `${Number(data.starAvg.toFixed(1))} / 5.0` 
                  : "아직 별점이 없어요"
                }
              </span>
            </div>
          </div>

          {/* 전체 리뷰 그리드 */}
          {data.reviewList && data.reviewList.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentPageData().map((item) => (
                  <ReviewItem 
                    key={item.gameReviewId}
                    {...item}
                    isAuthor={false} // 수정/삭제 기능 제거
                  />
                ))}
              </div>
              
              {data.reviewList.length > itemsPerPage && (
                <div className="mt-8">
                  <Pagination
                    totalItems={data.reviewList.length}
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
  );
};

export default ReviewPage;