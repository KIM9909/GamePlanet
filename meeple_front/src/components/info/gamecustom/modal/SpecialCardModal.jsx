import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CustomAPI } from '../../../../sources/api/CustomAPI';

const SpecialCardModal = ({ onClose, cardId, type, customId, isNew }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const cardType = type === 'telepathy' ? '텔레파시카드' : '뉴런의골짜기카드';

  const handleSave = async () => {
    try {
      const cardData = {
        cardNumber: cardId,
        cardName: title,
        cardDescription: content,
      };
      console.log(cardData);
      

      // 새로운 게임인 경우, 먼저 createElement 실행
      let targetCustomId = customId;
      if (isNew) {
        const response = await CustomAPI.createElement({
          customName: "나만의 부루마불" // 기본 이름으로 생성
        });
        targetCustomId = response.customId;
      }

      // 이제 확보된 customId로 카드 생성
      if (type === 'telepathy') {
        await CustomAPI.createTelepathyCard(targetCustomId, cardData);
      } else {
        await CustomAPI.createNeuronValleyCard(targetCustomId, cardData);
      }

      onClose();
    } catch (err) {
      console.error('카드 생성 실패:', err);
      setError(type === 'telepathy' ? 
        '텔레파시 카드 저장에 실패했습니다.' : 
        '뉴런의 골짜기 카드 저장에 실패했습니다.'
      );
    }
  };
  return (
    <div className="bg-slate-800 rounded-lg w-[500px] p-6 relative">
      <button 
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">{cardType} {cardId} 커스터마이징</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <label className="block text-white mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none"
            placeholder="카드의 제목을 입력하세요..."
          />
        </div>

        <div className="bg-slate-700/50 p-4 rounded-lg">
          <label className="block text-white mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="카드의 효과나 벌칙을 입력하세요..."
            className="w-full p-3 bg-slate-600 text-white rounded border border-slate-500 focus:border-cyan-400 outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors disabled:opacity-50"
            disabled={!title.trim() || !content.trim()}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialCardModal;