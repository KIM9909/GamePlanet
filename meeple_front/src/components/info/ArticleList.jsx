
import ArticleItem from "./ArticleItem"
import ArticleCreate from "./ArticleCreate";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ArticleList = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isWriting, setIsWriting] = useState(false); // 글쓰기 모드 상태 추가
  const itemsPerPage = 10; // 페이지당 게시글 수

  useEffect(() => {
    setLoading(true);
    axios.get(`https://boardjjigae.duckdns.org/api/game-info/community?gameInfoId=${gameId}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [gameId]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  // 글쓰기 모드일 때 ArticleCreate 컴포넌트 렌더링
  if (isWriting) {
    return <ArticleCreate 
      gameId={gameId} 
      onCancel={() => setIsWriting(false)} // 취소 시 목록으로 돌아가기
    />;
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCreateArticle = () => {
    setIsWriting(true); // 글쓰기 모드로 전환
  };

  return (
    <div className="my-5px mx-10px ">
      <h1>Community</h1>
      <section>
        <section className="my-5px grid grid-cols-12 gap-4 border-b-2 pb-2">
          <span className="col-span-6 text-center">제목</span>
          <span className="col-span-2 text-center">작성자</span>
          <span className="col-span-2 text-center">작성일</span>
          <span className="col-span-2 text-center">조회수</span>
        </section>
        <section>
          {data.map((item) => (
            <ArticleItem
              key={item.gameCommunityId}
              content={item.gameCommunityContent}
              createdAt={item.createAt}
              createdBy={item.user}
              comments={item.commentList}
            />
          ))}
        </section>
        <section className="mt-4 flex justify-between items-center">
          {/* 페이지네이션 버튼 */}
          <div className="flex gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              이전
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 border rounded 
                  ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              다음
            </button>
          </div>
          {/* 글쓰기 버튼 */}
          <button
            onClick={handleCreateArticle}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            글쓰기
          </button>
        </section>
      </section>
    </div>
  );
};

export default ArticleList;
