import React from 'react';
import { X, CheckCircle, AlertCircle, Paintbrush, Save, Send } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const CustomTutorial = ({ onClose, onStartCustomizing }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg w-11/12 max-w-6xl h-4/5 p-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="relative">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6">
            부루마불 커스터마이징 가이드
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100%-2rem)]">
            {/* 시작하기 섹션 */}
            <div className="space-y-6">
              <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <Paintbrush className="text-cyan-400" size={20} />
                  시작하기
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-semibold">1.</span>
                    <p>게임 이름과 썸네일 설정 (권장사항)</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-semibold">2.</span>
                    <p>생성 후 디테일 페이지에서 수정하기로 커스터마이징 시작</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-cyan-400 font-semibold">3.</span>
                    <p>보드판에서 원하는 타일을 선택하여 자유롭게 커스터마이징</p>
                  </li>
                </ul>
              </div>

              {/* 진행 상황 섹션 */}
              <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-400" size={20} />
                  진행 상황 확인
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">•</span>
                    <p>완료된 타일은 체크표시로 표시</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">•</span>
                    <p>커스터마이징 진행률 확인 가능</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400">•</span>
                    <p>완성된 타일/카드는 번호에 맞게 자동으로 완료 상태로 전환</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* 저장 및 심사 섹션 */}
            <div className="space-y-6">
              <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <Save className="text-purple-400" size={20} />
                  저장 및 심사
                </h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <p>작업 중 임시저장 가능</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-purple-400">•</span>
                    <p>진행률 100% 달성 시 관리자 심사 신청 가능</p>
                  </li>
                </ul>
              </div>

              {/* 주의사항 섹션 */}
              <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600/50 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                  <AlertCircle className="text-amber-400" size={20} />
                  주의사항
                </h3>
                <div className="text-gray-300 space-y-4">
                  <p>심사 통과가 곧바로 게임 적용을 의미하지 않습니다.</p>
                  <p className="text-amber-400 font-medium">
                    최고 품질의 커스터마이징 게임만이 모든 유저에게 공개됩니다.
                    정성과 창의력을 발휘해주세요!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 시작하기 버튼 */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-white bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
            >
              닫기
            </button>
            <button
              onClick={onStartCustomizing}
              className="px-6 py-2.5 text-white bg-slate-600 hover:bg-cyan-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={18} />
              커스터마이징 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTutorial;