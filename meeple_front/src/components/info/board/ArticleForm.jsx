import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';


const ArticleForm = ({ gameInfoId,initialData, onSubmit, isEditing, isSubmitting: externalIsSubmitting }) => {
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
    console.log(currentUserId)
    if (!formData.gameCommunityContent.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    // 로그인 안한 사용자 필터링

    if (!currentUserId) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      if (!isEditing) {
        setFormData({ 
 
          gameCommunityContent: '', 
          userId :currentUserId
        });
      }
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      alert('저장에 실패했습니다.');
    } finally {
      if (externalIsSubmitting === undefined) {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className=" mx-auto p-4 space-y-4">

      <div className="max-h-screen p-8 bg-[#0a0a2a]/50">
        <div className=" mx-auto">
          <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50  overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <textarea
                name="gameCommunityContent"
                value={formData.gameCommunityContent}
                onChange={handleChange}
                placeholder="내용을 입력하세요"
                className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 
                          focus:border-transparent resize-none
                          disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center duration-200
                          focus:outline-none focus:ring-2 focus:ring-blue-500 
                          focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '저장 중...' : isEditing ? '수정' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ArticleForm;
