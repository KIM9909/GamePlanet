import ArticleItem from "../../../components/info/ArticleItem"
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';

const BoardPage = () => {
  const { gameInfoId } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);
  const [loadedIds, setLoadedIds] = useState(new Set());

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await GameInfoAPI.getCommunityPosts(gameInfoId);
      const sortedArticles = response.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      // 중복 제거 로직
      const newArticles = sortedArticles.filter(article => 
        !loadedIds.has(article.gameCommunityId)
      );
      
      if (newArticles.length === 0) {
        setHasMore(false);
        return;
      }

      setArticles(prev => [...prev, ...newArticles]);
      setLoadedIds(new Set([
        ...Array.from(loadedIds),
        ...newArticles.map(article => article.gameCommunityId)
      ]));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && 
      !loading && 
      !isLoadingMore &&
      hasMore
    ) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
      fetchArticles();
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [gameInfoId]);

  

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, isLoadingMore]);

  if (loading && articles.length === 0) return <div>로딩중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!articles.length) return <div>데이터가 없습니다.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community</h1>
        <button
          onClick={() => navigate(`/game-info/${gameInfoId}/board/write`)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          글쓰기
        </button>
      </div>

      <section className="space-y-4">
        {articles.map((item) => (
          <ArticleItem
            key={item.gameCommunityId}
            content={item.gameCommunityContent}
            createdAt={item.createAt}
            createdBy={item.user}
            comments={item.commentList}
            articleId={item.gameCommunityId}
          />
        ))}
      </section>

      {isLoadingMore && (
        <div className="text-center py-4">
          더 불러오는 중...
        </div>
      )}
    </div>
  );
};

export default BoardPage;
