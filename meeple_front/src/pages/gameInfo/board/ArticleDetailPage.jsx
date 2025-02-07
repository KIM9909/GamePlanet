import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate,useParams } from 'react-router-dom';
import CommentList from '../../../components/info/CommentList';


const ArticleDetailPage = () => {
  const { gameId, articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://boardjjigae.duckdns.org/api/game-info/community/${articleId}`);
        setArticle(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleDelete = async () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      try {
        await axios.delete(`https://boardjjigae.duckdns.org/api/game-info/community/${articleId}`);
        navigate(`/board/${gameId}`);
      } catch (err) {
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div className="text-center p-8">로딩중...</div>;
  if (error) return <div className="text-center p-8 text-red-500">에러가 발생했습니다: {error}</div>;
  if (!article) return <div className="text-center p-8">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 게시글 헤더 */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
        <div className="flex justify-between text-gray-600 text-sm">
          <div>
            <span>작성자: {article.user.nickname}</span>
            <span className="mx-4">|</span>
            <span>작성일: {new Date(article.createdAt).toLocaleDateString()}</span>
          </div>
          <span>조회수: {article.viewCount}</span>
        </div>
      </div>

      {/* 게시글 내용 */}
      <div className="py-6 min-h-[200px] whitespace-pre-wrap">
        {article.content}
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <button
          onClick={() => navigate(`/board/${gameId}`)}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          목록
        </button>
        <button
          onClick={() => navigate(`/board/${gameId}/edit/${articleId}`)}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 border rounded bg-red-500 text-white hover:bg-red-600"
        >
          삭제
        </button>
      </div>

      {/* 댓글 컴포넌트 */}
      <CommentList articleId={articleId} />
    </div>
  );
};

export default ArticleDetailPage;