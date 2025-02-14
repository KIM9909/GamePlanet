import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Dice1, Dice2,Dice3, Dice4, Dice5, Dice6, ArrowRight } from 'lucide-react';
import { CustomAPI } from '../../../sources/api/CustomAPI';
import Loading from '../../../components/Loading';
import CustomModal from './modal/CustomModal';
import ConfirmModal from './modal/ConfirmModal';

const CUSTOMIZABLE_ITEMS = [1, 3, 4, 5, 6, 8, 9, 11, 12, 14, 16, 18, 19, 21, 22, 24, 25, 26, 27, 28, 31, 32, 34, 36, 38, 39];

const getIndex = (position) => {
  if (position >= 0 && position <= 10) return 30 - position;
  else if (position >= 11 && position <= 19) return 20 + position;
  else if (position >= 20 && position <= 30) return position - 20;
  else return position - 20;
};

const FIXED_TILES = [
  { index: 2, type: '텔레파시', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 7, type: '텔레파시', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 10, type: '시간여행', desc: '타임머신 탑승장으로 이동. 주사위 4이상 시 자유이동, 3이하 시 5칸 전진' },
  { index: 13, type: '텔레파시', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 15, type: '뉴런의 골짜기', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 17, type: '타임머신', desc: '시간여행에 필요한 타임머신 증서 구매 가능' },
  { index: 20, type: '블랙홀', desc: '우주기지/증서 1개 반납 후 3회 휴식. 더블 주사위로 탈출' },
  { index: 23, type: '텔레파시', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 29, type: '텔레파시', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 30, type: '우주조난기지', desc: '기금 없음: 20만 마불 기부 / 있음: 20만 마불 수령' },
  { index: 33, type: '텔레파시', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 35, type: '뉴런의 골짜기', desc: '황금열쇠처럼 특별한 미션이나 기회 제공' },
  { index: 37, type: '헬리혜성', desc: '다음 턴에 화성 옆 텔레파시 칸으로 강제 이동' }
];

const CustomEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;
  const isNew = location.state?.isNew;
  const customId = location.state?.customId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [customName, setCustomName] = useState('나만의 부루마불');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);

  const maxIndex = Math.max(0, Math.floor((CUSTOMIZABLE_ITEMS.length - 1) / 5));
  
  useEffect(() => {
    const loadCustomElement = async () => {
      try {
        if (!isNew && customId) {
          const response = await CustomAPI.getElementById(customId);
          setCustomName(response.customName);
        }
      } catch (err) {
        setError('커스텀 요소를 불러오는데 실패했습니다.');
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    loadCustomElement();
  }, [isNew, customId]);

  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setShowModal(true);
  };

  const renderBoardTile = (position, isHorizontal = false) => {
    const index = getIndex(position);
    const isCustomizable = CUSTOMIZABLE_ITEMS.includes(index);
    
    return (
      <div 
        key={position} 
        className={`
          ${isHorizontal ? 'w-12' : 'w-16'} h-16 
          border border-slate-600
          ${isCustomizable 
            ? 'bg-slate-700 cursor-pointer hover:bg-slate-600' 
            : 'bg-slate-700/30'
          }
          flex items-center justify-center text-sm
        `}
        onClick={isCustomizable ? () => handleCardClick(CUSTOMIZABLE_ITEMS.indexOf(index) + 1) : undefined}
      >
        <span className={isCustomizable ? 'text-cyan-400' : 'text-slate-500'}>
          {index}
        </span>
      </div>
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center"><div className="text-red-400 text-xl">{error}</div></div>;

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* 게임 이름 입력 */}
      <div className="max-w-sm mx-auto mb-12">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">게임 이름</h3>
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
            className="w-full px-3 py-1.5 bg-slate-900/50 text-white rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none text-sm"
            placeholder="게임 이름을 입력해주세요 (최대 20자)"
          />
          <div className="text-right mt-1">
            <span className={`text-xs ${customName.length === 20 ? 'text-yellow-400' : 'text-slate-400'}`}>
              {customName.length} / 20자
            </span>
          </div>
        </div>
      </div>
  
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 보드 미리보기 */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">보드판 미리보기</h2>
          <div className="flex flex-col items-center">
            {/* 상단 줄 */}
            <div className="flex -space-x-[2px]">
              {Array.from({ length: 11 }, (_, i) => renderBoardTile(20 + i, true))}
            </div>
            
            {/* 중간 섹션 */}
            <div className="flex justify-between w-full -mt-[1px]">
              {/* 왼쪽 열 */}
              <div className="flex flex-col -space-y-[1px]">
                {Array.from({ length: 9 }, (_, i) => renderBoardTile(19 - i))}
              </div>
              
              {/* 중앙 영역 */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <p className="text-cyan-400 font-semibold mb-2">커스터마이징 가능한 타일</p>
                  <p className="text-slate-400 text-sm">클릭하여 수정할 수 있어요</p>
                </div>
              </div>
              
              {/* 오른쪽 열 */}
              <div className="flex flex-col -space-y-[1px]">
                {Array.from({ length: 9 }, (_, i) => renderBoardTile(31 + i))}
              </div>
            </div>
            
            {/* 하단 줄 */}
            <div className="flex -space-x-[2px] -mt-[1px]">
              {Array.from({ length: 11 }, (_, i) => renderBoardTile(i, true))}
            </div>
          </div>
        </div>
  
        {/* 커스터마이징 선택 */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">타일/씨앗은행카드 선택</h2>
          
          {/* 현재 진행 상황 표시 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>커스터마이징 진행률</span>
              <span>0 / {CUSTOMIZABLE_ITEMS.length} 완료</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full transition-all"
                style={{ width: '0%' }}  // 실제로는 완료된 항목 퍼센티지로 조정
              />
            </div>
          </div>
  
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <button 
                className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex <= 0}
              >
                <ChevronLeft className="text-white" />
              </button>
  
              <div className="flex-1 mx-4">
                <div className="grid grid-cols-5 gap-3">
                  {[...Array(5)].map((_, idx) => {
                    const cardId = (currentIndex * 5) + idx + 1;
                    const actualNumber = CUSTOMIZABLE_ITEMS[cardId - 1];
                    
                    if (cardId > CUSTOMIZABLE_ITEMS.length) {
                      return (
                        <div 
                          key={idx}
                          className="h-24 bg-slate-700/20 rounded-lg"
                        />
                      );
                    }
  
                    return (
                      <div 
                        key={idx} 
                        className="h-24 bg-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-600"
                        onClick={() => handleCardClick(cardId)}
                      >
                        <p className="text-cyan-400">타일/카드</p>
                        <p className="text-white font-bold">{actualNumber}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
  
              <button 
                className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50"
                onClick={() => setCurrentIndex(Math.min(maxIndex, currentIndex + 1))}
                disabled={currentIndex >= maxIndex}
              >
                <ChevronRight className="text-white" />
              </button>
            </div>
  
            {/* 고정 타일 정보 */}
            <div className="mt-4 border-t border-slate-700 pt-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3">고정 타일 정보</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-700/50 p-4 rounded-lg shadow-lg hover:bg-slate-700/60 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-cyan-400 font-medium">텔레파시 & 뉴런의 골짜기</div>
                    <div className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-[10px] text-cyan-300">황금열쇠</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white shrink-0 mt-0.5">텔레파시</div>
                      <div className="text-slate-300 text-xs">2, 7, 13, 23, 29, 33</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white shrink-0 mt-0.5">뉴런</div>
                      <div className="text-slate-300 text-xs">15, 35</div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg shadow-lg hover:bg-slate-700/60 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-cyan-400 font-medium">시간여행 여정</div>
                    <div className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-[10px] text-cyan-300">특별이동</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white shrink-0 mt-0.5">시간여행</div>
                      <div className="text-slate-300 text-xs">10번 - 타임머신 탑승장으로 이동</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white shrink-0 mt-0.5">타임머신</div>
                      <div className="text-slate-300 text-xs">17번 - 타임머신 증서 구매</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      <div className="flex gap-1 flex-col">
                        <div className="flex items-center gap-1">
                          <Dice4 size={30} className="text-cyan-400" />
                          <Dice5 size={30} className="text-cyan-400" />
                          <Dice6 size={30} className="text-cyan-400" />
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowRight size={14} />
                          <span>자유이동</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                          <Dice1 size={17} className="text-cyan-400" />
                          <Dice2 size={17} className="text-cyan-400" />
                          <Dice3 size={17} className="text-cyan-400" />
                        <ArrowRight size={14} />
                        <span>5칸 이동</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 p-4 rounded-lg shadow-lg hover:bg-slate-700/60 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-cyan-400 font-medium">특별 이벤트</div>
                      <div className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-[10px] text-cyan-300">이벤트</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white">블랙홀</div>
                        <div className="text-slate-300 text-xs">20번</div>
                      </div>
                      <div className="text-slate-300 text-xs pl-1">• 우주기지/증서 1개 반납 후 3회 휴식</div>
                      <div className="text-slate-300 text-xs pl-1 flex items-center gap-1">
                        • <Dice2 size={25} className="text-cyan-400" /> + <Dice2 size={25} className="text-cyan-400" /> 더블 주사위로 탈출
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white">우주조난기지</div>
                        <div className="text-slate-300 text-xs">30번</div>
                      </div>
                      <div className="text-slate-300 text-xs pl-1">• 기금 없음: 20만 마불 기부</div>
                      <div className="text-slate-300 text-xs pl-1">• 기금 있음: 20만 마불 수령</div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg shadow-lg hover:bg-slate-700/60 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-cyan-400 font-medium">헬리혜성</div>
                    <div className="px-2 py-0.5 bg-cyan-500/20 rounded-full text-[10px] text-cyan-300">강제이동</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-0.5 bg-slate-600 rounded text-[11px] text-white">위치</div>
                      <div className="text-slate-300 text-xs">37번</div>
                    </div>
                    <div className="text-slate-300 text-xs pl-1">• 다음 턴에 화성 옆 텔레파시로 강제 이동</div>
                    <div className="text-slate-300 text-xs pl-1">• 지구 통과시 연료비 수령 불가</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 완료 버튼 - 하단 중앙 */}
      <div className="text-center">
        <button
          onClick={() => setShowConfirm(true)}
          className="px-8 py-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-lg font-semibold"
        >
          커스터마이징 완료
        </button>
      </div>

      {/* 모달들 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CustomModal 
            onClose={() => setShowModal(false)} 
            cardId={selectedCardId}
            customId={customId}
          />
        </div>
      )}

      {showConfirm && (
        <ConfirmModal 
          onClose={() => setShowConfirm(false)}
          onConfirm={() => {
            navigate(`/game-info/${gameInfo.gameInfoId}/custom`, { 
              state: { gameInfo } 
            });
          }}
          customName={customName}
        />
      )}
    </div>
  );
};

export default CustomEditor;