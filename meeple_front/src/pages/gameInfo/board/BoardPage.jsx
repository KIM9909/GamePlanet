import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BoardPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://boardjjigae.duckdns.org/api/game-info/community?gameInfoId=${gameId}`);
        setArticles(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [gameId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center p-8">로딩중...</div>;
  if (error) return <div className="text-center p-8 text-red-500">에러가 발생했습니다: {error}</div>;

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const currentArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시판</h1>
        <button
          onClick={() => navigate(`/game/${gameId}/board/write`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          글쓰기
        </button>
      </div>

      {/* 게시글 목록 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">번호</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">제목</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">작성자</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">작성일</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">조회수</th>
            </tr>
          </thead>
          <tbody>
            {currentArticles.map((article, index) => (
              <tr 
                key={article.gameCommunityId} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/game/${gameId}/board/detail/${article.gameCommunityId}`)}
              >
                <td className="px-6 py-4 text-sm">{articles.length - ((currentPage - 1) * itemsPerPage + index)}</td>
                <td className="px-6 py-4 text-sm">
                  {article.title}
                  {article.commentList?.length > 0 && 
                    <span className="ml-2 text-blue-500">[{article.commentList.length}]</span>
                  }
                </td>
                <td className="px-6 py-4 text-sm">{article.user.nickname}</td>
                <td className="px-6 py-4 text-sm">{formatDate(article.createdAt)}</td>
                <td className="px-6 py-4 text-sm">{article.viewCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded 
              ${currentPage === i + 1 ? 'bg-blue-500 text-white' : ''}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default BoardPage;
