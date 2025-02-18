import React, { useState } from 'react';
import { X, Image, Upload } from 'lucide-react';
import { CustomAPI } from "../../../../sources/api/CustomAPI";
import toast from 'react-hot-toast';

const CreateModal = ({ onClose, onSuccess, userId }) => {
  const [customName, setCustomName] = useState('나만의 부루마불');
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
        toast.error('PNG 또는 JPEG 형식의 이미지만 업로드 가능합니다.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        toast.error('파일 크기는 5MB를 초과할 수 없습니다.');
        return;
      }

      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!customName.trim()) {
      toast.error('게임 이름을 입력해주세요.');
      return;
    }

    if (!userId) {
      toast.error('사용자 정보가 유효하지 않습니다.');
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('customName', customName);
      formData.append('userId', userId);
      
      // 썸네일 이미지 처리
      if (thumbnailFile) {
        formData.append('imgFile', thumbnailFile);
      } else {
        // 기본 썸네일 이미지 생성 (1x1 투명 PNG)
        const defaultImage = new Blob([new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])], { type: 'image/png' });
        formData.append('imgFile', new File([defaultImage], 'thumbnail.png', { type: 'image/png' }));
      }

      const response = await CustomAPI.createElement({
        customName: customName,
        userId: userId,
        imgFile: thumbnailFile || formData.defaultImage
      });

      toast.success('게임이 생성되었습니다.');
      onSuccess(response);
    } catch (error) {
      toast.error(error.message || '게임 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg w-full max-w-md p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold text-cyan-400 mb-6">새로운 게임 만들기</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2">게임 이름</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 20) {
                setCustomName(newValue);
              }
            }}
            maxLength={20}
            className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none"
            placeholder="게임 이름을 입력해주세요"
          />
          <div className="text-right mt-1">
            <span className={`text-sm ${customName.length === 20 ? 'text-yellow-400' : 'text-slate-400'}`}>
              {customName.length} / 20자
            </span>
          </div>
        </div>

        {/* 썸네일 업로드 섹션 */}
        <div>
          <label className="block text-white mb-2">게임 썸네일</label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-4">
            {thumbnailPreview ? (
              <div className="relative">
                <img 
                  src={thumbnailPreview} 
                  alt="썸네일 미리보기" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setThumbnailPreview(null);
                    setThumbnailFile(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                <Image size={40} className="text-slate-400 mb-2" />
                <span className="text-slate-400">클릭하여 이미지 업로드</span>
                <span className="text-slate-500 text-sm mt-1">PNG, JPEG (최대 5MB)</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${
              isLoading ? 'bg-cyan-600 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600'
            }`}
          >
            {isLoading ? '생성 중...' : '생성하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;