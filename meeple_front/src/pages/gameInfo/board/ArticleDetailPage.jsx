import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import Loading from '../../../components/Loading'
import { useSelector } from 'react-redux';
import EditArticleModal from '../../../components/info/board/EditArticleModal';
import Pagination from '../../../components/admin/Pagination';
import { toast } from 'react-toastify';

const ArticleDetailPage = () => {
  const { gameInfoId, gameCommunityId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;
  const { token } = useSelector((state) => state.user);
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 게시글과 댓글 데이터 가져오기
  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await GameInfoAPI.getCommunityPost(gameInfoId, gameCommunityId);
      setArticle(response);

      const sortedComments = response.commentList.sort((a,b) =>
        a.gameCommunityCommentId - b.gameCommunityCommentId
      );

      setComments(sortedComments || []);

      // setComments(response.commentList || []);


      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    try {
      const response = await GameInfoAPI.createComment({
        content: commentContent,
        gameCommunityId: gameCommunityId,
        userId: currentUserId
      });

      // 새 댓글을 목록에 추가
      const newComment = {
        gameCommunityCommentId: response.gameCommunityCommentId,
        gameCommunityCommentContent: commentContent,
        createAt: new Date().toISOString(),
        user: {
          userId: currentUserId,
          userNickname: response.userName
        }
      };


      
      setComments(prevComments => [ ...prevComments,newComment]);
      setCommentContent('');
    } catch (error) {
      toast.error('댓글 작성에 실패했습니다.');
    }
  };

  // 댓글 수정
  const handleCommentEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await GameInfoAPI.updateComment(commentId, {
        content: editContent
      });

      setComments(prevComments => 
        prevComments.map(comment => 
          comment.gameCommunityCommentId === commentId
            ? { ...comment, gameCommunityCommentContent: editContent }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      toast.error('댓글 수정에 실패했습니다.');
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await GameInfoAPI.deleteComment(commentId);
      setComments(prevComments => 
        prevComments.filter(comment => comment.gameCommunityCommentId !== commentId)
      );
    } catch (error) {
      toast.error('댓글 삭제에 실패했습니다.');
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
        toast.success('게시글이 삭제되었습니다.');
        navigate(`/game-info/${gameInfoId}/board`);
      } catch (err) {
        toast.error('게시글 삭제에 실패했습니다.');
      }
    }
  };

  //댓글 페이지네이션용
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return comments.slice(startIndex, endIndex);
  };

  const handleBackToList = () => {
    navigate(`/game-info/${gameInfoId}/board`, {
      state: { gameInfo }
    });
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
              <div className="flex justify-between text-white text-sm">
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
                        className="hover:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDelete}
                        className="hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
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
            </div>

            <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-400">
        댓글 {comments.length}
      </h2>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <div className="flex gap-2">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded resize-none h-[80px]"
          />
          <button
            type="submit"
            className="px-4 bg-cyan-500 text-white rounded hover:bg-cyan-600"
          >
            작성
          </button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {getCurrentPageData().map((comment) => (
          <div key={comment.gameCommunityCommentId} className="border-b border-gray-700 pb-4">
            {editingCommentId === comment.gameCommunityCommentId ? (
              <div className="flex gap-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 p-2 bg-gray-800 text-white border border-gray-700 rounded resize-none"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCommentEdit(comment.gameCommunityCommentId)}
                    className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="px-3 py-1 border border-gray-700 text-gray-400 rounded hover:bg-gray-800"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-300">{comment.user.userNickname}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createAt).toLocaleDateString()}
                    </span>
                    {String(currentUserId) === String(comment.user.userId) && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.gameCommunityCommentId);
                            setEditContent(comment.gameCommunityCommentContent);
                          }}
                          className="text-gray-600 hover:text-cyan-400 text-sm"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleCommentDelete(comment.gameCommunityCommentId)}
                          className="text-gray-600 hover:text-red-400 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-400">{comment.gameCommunityCommentContent}</p>
              </>
            )}
          </div>
        ))}
      </div>
      <Pagination 
        totalItems={comments.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
            <div className="flex justify-end gap-2 pt-4 mt-6">
              <button
                onClick={handleBackToList}
                className="px-4 py-2 border rounded hover:bg-gray-100 text-white hover:text-black"
              >
                목록으로
              </button>
            </div>

            
          </div>
          

        </div>
      </div>
      <EditArticleModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        gameInfoId={gameInfoId}
        gameCommunityId={gameCommunityId}
        onArticleUpdated={() => {
          fetchArticle();
          handleBackToList(); // 수정 완료 후 목록으로 이동할 때도 state 유지
        }}
      />
    </div>
  );
};

export default ArticleDetailPage;
