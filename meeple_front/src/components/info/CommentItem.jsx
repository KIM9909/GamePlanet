const CommentItem = ({ comment }) => {
  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">{comment.user.nickname}</span>
        <span className="text-sm text-gray-500">
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-700">{comment.content}</p>
    </div>
  );
};

export default CommentItem;