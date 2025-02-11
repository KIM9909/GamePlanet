import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const ArticleItem = ({ content, createdAt, createdBy, comments, articleId }) => {
  const navigate = useNavigate();
  const {gameInfoId} = useParams()

  const handleClick = () => {
    navigate(`game-info/${gameInfoId}/board/detail/${articleId}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="grid grid-cols-12 gap-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
    >
      <div className="col-span-6 text-center truncate">
        {content}
        {comments?.length > 0 && (
          <span className="text-blue-500 ml-2">[{comments.length}]</span>
        )}
      </div>
      <div className="col-span-2 text-center">{createdBy.nickname}</div>
      <div className="col-span-2 text-center">
        {new Date(createdAt).toLocaleDateString()}
      </div>
      <div className="col-span-2 text-center">0</div>
    </div>
  );
};

export default ArticleItem;
