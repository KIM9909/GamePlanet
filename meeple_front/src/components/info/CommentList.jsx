import { useState } from 'react';
import { useComments } from '../../hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useSelector } from 'react-redux';

const CommentList = ({ articleId }) => {
  const [content, setContent] = useState('');
  const { comments, loading, error, addComment } = useComments(articleId);
  const { token } = useSelector((state) => state.user);
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;


  const data={
    articleId,
    content,
    userId,
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const success = await addComment(data);
    if (success) {
      setContent('');
    }
  };

  if (loading) return <div>댓글 로딩중...</div>;
  if (error) return <div>댓글 로딩 실패: {error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">댓글 {comments.length}</h2>
      
      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* 댓글 작성 폼 */}
      <CommentForm 
        content={content}
        setContent={setContent}
        onSubmit={handleSubmit}
      />
    </div>
  );
};


export default CommentList;