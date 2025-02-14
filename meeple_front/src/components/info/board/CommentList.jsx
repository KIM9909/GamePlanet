// CommentList.jsx
import { useState } from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useSelector } from 'react-redux';
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';
import Pagination from '../../admin/Pagination';

const CommentList = ({ gameCommunityId, commentListData, onCommentUpdate }) => {
  const [content, setContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const { token } = useSelector((state) => state.user);
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const response = await GameInfoAPI.createComment({
        content,
        gameCommunityId: gameCommunityId,
        userId
      });

      // 새 댓글 객체 생성
      const newComment = {
        gameCommunityCommentId: response.gameCommunityCommentId,
        gameCommunityCommentContent: content,
        createAt: new Date().toISOString(),
        user: {
          userId: userId,
          userNickname: response.userNickname // API 응답에 따라 조정 필요
        }
      };

      // 부모 컴포넌트에 새 댓글 전달
      if (onCommentUpdate) onCommentUpdate(newComment);
      setContent('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await GameInfoAPI.deleteComment(commentId);
      // 삭제 후 전체 새로고침
      if (onCommentUpdate) onCommentUpdate();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다.');
    }
  };


  const handleEdit = (comment) => {
    setEditingComment(comment);
  };

    // 현재 페이지의 데이터
    const getCurrentPageData = () => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return commentListData.slice(startIndex, endIndex);
    };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-400">
        댓글 {commentListData?.length || 0}
      </h2>
      
      
      <div className="space-y-4">
        {getCurrentPageData()?.map((comment) => (
          editingComment?.id === comment.gameCommunityCommentId ? (
            <CommentForm
              key={comment.gameCommunityCommentId}
              initialData={comment.gameCommunityCommentContent}
              gameCommunityId={gameCommunityId}
              commentId={comment.gameCommunityCommentId}
              userId={comment.user.userId}
              onSuccess={() => {
                setEditingComment(null);
                if (onCommentUpdate) onCommentUpdate();
              }}
            />
          ) : (
            <CommentItem 
              key={comment.gameCommunityCommentId}
              comment={{
                id: comment.gameCommunityCommentId,
                userId: comment.user.userId,
                userName: comment.user.userNickname,
                content: comment.gameCommunityCommentContent,
                createdAt: comment.createAt
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        ))}
      </div>

      <CommentForm 
        gameCommunityId={gameCommunityId}
        userId={userId}
        content={content}
        setContent={setContent}
        onSubmit={handleSubmit}
      />

      <Pagination 
        totalItems={commentListData .length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

    </div>
  );
};

export default CommentList;