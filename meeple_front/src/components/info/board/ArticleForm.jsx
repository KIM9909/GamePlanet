import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ArticleForm = ({ gameInfoId, initialData, onSubmit, isEditing, isSubmitting: externalIsSubmitting }) => {
  const { token } = useSelector((state) => state.user);
  const currentUserId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  
  const [formData, setFormData] = useState({
    gameCommunityContent: '',
    userId: currentUserId,
    gameInfoId: gameInfoId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        gameCommunityContent: initialData.gameCommunity.gameCommunityContent || '',
        userId: currentUserId
      });
    }
  }, [initialData, currentUserId]);

  useEffect(() => {
    if (externalIsSubmitting !== undefined) {
      setIsSubmitting(externalIsSubmitting);
    }
  }, [externalIsSubmitting]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.gameCommunityContent.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }

    if (!currentUserId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      if (!isEditing) {
        setFormData({ 
          gameCommunityContent: '', 
          userId: currentUserId
        });
      }
    } catch (error) {
      toast.error('저장에 실패했습니다.');
    } finally {
      if (externalIsSubmitting === undefined) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div>
        <textarea
          name="gameCommunityContent"
          value={formData.gameCommunityContent}
          onChange={handleChange}
          placeholder="내용을 입력해주세요"
          className="w-full h-40 px-5 py-4 bg-slate-700 text-white rounded-lg 
                   border border-slate-600 focus:border-cyan-400 focus:outline-none
                   resize-none"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-3 py-1.5 text-white rounded-lg transition-colors
                   ${isSubmitting 
                     ? 'bg-cyan-600 cursor-not-allowed' 
                     : 'bg-cyan-500 hover:bg-cyan-600'}`}
        >
          {isSubmitting 
            ? '저장 중...' 
            : isEditing 
              ? '수정' 
              : '작성'}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;