const ArticleItem = ({ content, createdAt, createdBy, comments }) => {
  return (
    <div className="grid grid-cols-12 gap-4 py-3 border-b hover:bg-gray-50 cursor-pointer">
      <div className="col-span-6 text-center truncate">{content}</div>
      <div className="col-span-2 text-center">{createdBy.nickname}</div>
      <div className="col-span-2 text-center">
        {new Date(createdAt).toLocaleDateString()}
      </div>
      <div className="col-span-2 text-center">0</div>
    </div>
  );
};

export default ArticleItem;
