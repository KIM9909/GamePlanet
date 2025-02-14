import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CommentList from '../../../components/info/board/CommentList';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import Loading from '../../../components/Loading'
import { useSelector } from 'react-redux';
import EditArticleModal from '../../../components/info/board/EditArticleModal';

const ArticleDetailPage = () => {
  const { gameInfoId, gameCommunityId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.user);
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await GameInfoAPI.getCommunityPost(gameInfoId,gameCommunityId);
      setArticle(response);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    // 댓글 업데이트 시 전체 데이터 새로고침
    const handleCommentUpdate = () => {
      fetchArticle();
    };
  

  useEffect(() => {
    fetchArticle();
  }, [gameCommunityId]);

  const handleDelete = async () => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      try {
        await GameInfoAPI.deleteCommunityPost(gameCommunityId);
        alert('게시글이 삭제되었습니다.');
        navigate(`/game-info/${gameInfoId}/board`);
      } catch (err) {
        console.error('게시글 삭제 실패:', err);
        alert('게시글 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) return <div className="text-center p-8"><Loading /></div>;
  if (error) return <div className="text-center p-8 text-red-500">에러가 발생했습니다: {error}</div>;
  if (!article) return <div className="text-center p-8">게시글을 찾을 수 없습니다.</div>;

  const isAuthor = String(article?.gameCommunity?.user?.userId) === String(currentUserId);

  return (
    <div className="min-h-screen p-8 bg-[#0a0a2a]/50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 max-h-[650px] overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto p-6">
            <div className="border-b pb-4">
              <div className="flex justify-between text-gray-600 text-sm">
                <div>
                  <span>작성자: {article.gameCommunity.user.userNickname}</span>
                  <span className="mx-4">|</span>
                  <span>작성일: {new Date(article.gameCommunity.createAt).toLocaleDateString()}</span>
                </div>
                <div>
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDelete}
                        className="hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="py-6 min-h-[200px] whitespace-pre-wrap text-gray-400">
              {article.gameCommunity.gameCommunityContent}
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => navigate(`/game-info/${gameInfoId}/board`)}
                className="px-4 py-2 border rounded hover:bg-gray-100 text-white hover:text-black"
              >
                목록으로
              </button>
            </div>

            <CommentList 
              commentListData={article.commentList}
              gameCommunityId={gameCommunityId}
              refreshComments={handleCommentUpdate} 
            /> 
            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => navigate(`/game-info/${gameInfoId}/board`)}
                className="px-4 py-2 border rounded hover:bg-gray-100 text-white hover:text-black"
              >
                목록으로
              </button>
            </div>

            <EditArticleModal 
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              gameInfoId={gameInfoId}
              gameCommunityId={gameCommunityId}
              onArticleUpdated={fetchArticle}
            />
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
