import React from 'react';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomTutorial = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo
  
  return (
    <div 
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  onClick={(e) => e.target === e.currentTarget && onClose()}
>
    
    <div className="bg-slate-800 rounded-lg w-11/12 max-w-5xl h-4/5 p-12 relative overflow-y-auto">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>

      <h2 className="text-4xl font-bold text-cyan-400 mb-12 text-center">게임 제작 가이드</h2>

      <div className="space-y-12 mb-12">
        <div className="bg-slate-700/50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-white mb-6">Step 1. 타일 커스터마이징</h3>
          <ul className="text-gray-300 space-y-3 text-lg">
            <li>• 타일의 이미지를 변경할 수 있습니다</li>
            <li>• 타일의 색상을 변경할 수 있습니다</li>
            <li>• 타일의 이름을 설정할 수 있습니다</li>
            <li>• 땅의 가격을 설정할 수 있습니다</li>
          </ul>
        </div>

        <div className="bg-slate-700/50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-white mb-6">Step 2. 씨앗은행카드 커스터마이징</h3>
          <ul className="text-gray-300 space-y-3 text-lg">
            <li>• 카드 이미지 설정 (타일과 동일해야 합니다)</li>
            <li>• 카드의 이름 설정 (타일과 동일해야 합니다)</li>
            <li>• 카드 설명을 작성할 수 있습니다</li>
            <li>• 땅 가격 설정 (타일과 동일해야 합니다)</li>
            <li>• 기지 건설비를 설정할 수 있습니다</li>
            <li>• 우주본부 가격을 설정할 수 있습니다</li>
            <li>• 우주기지 가격을 설정할 수 있습니다</li>
          </ul>
        </div>

        <div className="bg-slate-700/50 p-8 rounded-lg">
          <h3 className="text-2xl font-semibold text-white mb-6">Step 3. 특수 카드 커스터마이징</h3>
          <p className="text-gray-300 text-lg">텔레파시카드와 뉴런의 골짜기카드는 카드명 변경이 불가능하며, 카드의 내용만 커스터마이징이 가능합니다.</p>
        </div>
      </div>

      <div className="text-center">
        <button 
          className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors text-lg font-semibold"
          onClick={() => {
            navigate(`/game-info/${gameInfo.gameInfoId}/custom/editor`, { state: { gameInfo } });
            onClose();
          }}
        >
          커스터마이징 시작하기
        </button>
      </div>
    </div>
    </div>
  );
};

export default CustomTutorial;