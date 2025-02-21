import { useState } from 'react';
import { IoClose } from "react-icons/io5";
import ArticleForm from "./ArticleForm";
import { GameInfoAPI } from '../../../sources/api/GameInfoAPI';

const NewArticleModal = ({ isOpen, onClose, gameInfoId, onArticleCreated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      await GameInfoAPI.createCommunityPost({
        ...formData,
        gameInfoId: gameInfoId
      });
      
      alert('게시글이 등록되었습니다.');
      onArticleCreated(); // 게시글 목록 새로고침
      onClose(); // 모달 닫기
    } catch (error) {
      return error
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-xl font-bold text-cyan-500">새 게시글 작성</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <IoClose size={24} />
            </button>
          </div>

          <ArticleForm 
            gameInfoId={gameInfoId}
            onSubmit={handleSubmit}
            isEditing={false}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default NewArticleModal;