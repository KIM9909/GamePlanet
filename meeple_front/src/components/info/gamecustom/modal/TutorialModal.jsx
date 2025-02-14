import React from 'react';
import { X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomTutorial = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-800 rounded-lg w-11/12 max-w-6xl h-[45vh] p-6 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">부루마불 커스터마이징 가이드</h2>

        <div className="grid grid-cols-3 gap-6 h-[calc(100%-100px)]">
          {/* 공통 설정 가이드 */}
          <div className="space-y-4 overflow-y-auto pr-4">
            <h3 className="text-lg font-semibold text-white">공통 설정 가이드</h3>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <ul className="text-gray-300 space-y-2">
                <li>• 상단 색상을 자유롭게 설정할 수 있습니다</li>
                <li>• 이름은 최대 20자까지 입력 가능합니다</li>
                <li>• 가격은 최대 60만마불까지 설정 가능합니다</li>
              </ul>
            </div>
          </div>

          {/* 씨앗은행 카드 가이드 */}
          <div className="space-y-4 overflow-y-auto pr-4">
            <h3 className="text-lg font-semibold text-white">씨앗은행 카드 가이드</h3>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <ul className="text-gray-300 space-y-2">
                <li>• 카드 설명을 자유롭게 작성할 수 있습니다</li>
                <li>• 기지 건설비: 최대 30만마불</li>
                <li>• 우주본부: 최대 40만마불</li>
                <li>• 우주기지: 최대 100만마불</li>
              </ul>
            </div>
          </div>

          {/* 타일 설정 가이드 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">타일 설정 가이드</h3>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <ul className="text-gray-300 space-y-2">
                <li>• 권장 이미지 크기: 180 x 250 픽셀</li>
                <li>• 이미지는 자동으로 크기가 조정됩니다</li>
                <li>• 타일 위치에 따라 이미지가 회전됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 시작하기 버튼 */}
        <div className="mt-4 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-slate-600 hover:bg-slate-700 rounded transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => {
              navigate(`/game-info/${gameInfo.gameInfoId}/custom/editor`, { state: { gameInfo } });
              onClose();
            }}
            className="px-6 py-2 text-white bg-cyan-500 hover:bg-cyan-600 rounded transition-colors"
          >
            커스터마이징 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTutorial;