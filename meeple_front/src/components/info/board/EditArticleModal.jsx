// components/info/board/EditArticleModal.jsx
import { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import ArticleForm from "./ArticleForm";
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';

const EditArticleModal = ({ isOpen, onClose, gameInfoId, gameCommunityId, onArticleUpdated }) => {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await GameInfoAPI.getCommunityPost(gameInfoId, gameCommunityId);
        setArticle(response);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        alert('게시글을 불러오는데 실패했습니다.');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchArticle();
    }
  }, [gameInfoId, gameCommunityId, isOpen]);

  const handleSubmit = async (formData) => {
    try {
      await GameInfoAPI.updateCommunityPost(gameCommunityId, formData);
      alert('게시글이 수정되었습니다.');
      onArticleUpdated();
      onClose();
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      throw error;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* 배경 오버레이 */}
        <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={onClose}></div>

        {/* 모달 컨텐츠 */}
        <div className="relative bg-gray-900 rounded-lg w-full max-w-xl p-7 overflow-hidden shadow-xl 
                transform transition-all duration-200 ease-in-out 
                animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cyan-500">게시글 수정</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <IoClose size={24} />
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-4 text-gray-400">로딩 중...</div>
          ) : (
            article && (
              <ArticleForm 
                gameInfoId={gameInfoId}
                initialData={article}
                onSubmit={handleSubmit}
                isEditing={true}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
export default EditArticleModal;