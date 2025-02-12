import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomAPI } from '../../../sources/api/CustomAPI';
import Loading from '../../../components/Loading';

// 모달
import TileModal from './modal/TileModal';
import BankCardModal from './modal/BankCardModal';
import SpecialCardModal from './modal/SpecialCardModal';
import ConfirmModal from './modal/ConfirmModal';

const SlideSection = ({ title, currentIndex = 0, setIndex, totalItems = 30, onCardClick, type }) => {
  // 전체 페이지 수 계산 (안전한 타입 변환 추가)
  const safeCurrentIndex = Number(currentIndex) || 0;
  const safeTotalItems = Number(totalItems) || 30;
  const maxIndex = Math.max(0, Math.floor((safeTotalItems - 1) / 5));
  
  // 현재 페이지에 표시할 카드 개수 계산
  const currentPageCards = safeCurrentIndex === maxIndex 
    ? safeTotalItems - (maxIndex * 5)
    : 5;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
      <div className="bg-slate-800 p-6 rounded-lg relative">
        <div className="flex justify-between items-center">
        <button 
          className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50"
          onClick={() => {
            const newIndex = Math.max(0, safeCurrentIndex - 1);
            setIndex(newIndex);
          }}
          disabled={safeCurrentIndex <= 0}
        >
          <ChevronLeft className="text-white" />
        </button>

          <div className="flex-1 mx-8">
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, idx) => {
                const cardNumber = (safeCurrentIndex * 5) + idx + 1;
                
                if (cardNumber > safeTotalItems) {
                  return (
                    <div 
                      key={idx}
                      className="h-32 bg-slate-700/20 rounded-lg"
                    />
                  );
                }

                return (
                  <div 
                    key={idx} 
                    className="h-32 bg-slate-700/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-600/50"
                    onClick={() => onCardClick(cardNumber, type)}
                  >
                    <p className="text-white">{cardNumber.toString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <button 
            className="p-2 bg-slate-700 rounded-full hover:bg-slate-600 disabled:opacity-50"
            onClick={() => {
              const newIndex = Math.min(maxIndex, safeCurrentIndex + 1);
              setIndex(newIndex);
            }}
            disabled={safeCurrentIndex >= maxIndex}
          >
            <ChevronRight className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CustomEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;
  const isNew = location.state?.isNew;
  const customId = location.state?.customId;
  console.log(customId);
  

  const [isLoading, setIsLoading] = useState(true);
  const [customName, setCustomName] = useState('나만의 부루마불');
  const [indices, setIndices] = useState({
    tile: 0,
    bank: 0,
    telepathy: 0,
    neuron: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);

  // 초기 데이터 로드
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
        // 2초 후에 로딩 상태 해제
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      }
    };

    loadCustomElement();
  }, [isNew, customId]);

  const handleCardClick = (cardId, type) => {
    setSelectedCard(cardId);
    setModalType(type);
    setShowModal(true);
  };

  const handleComplete = () => {
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    try {
      let finalCustomId = customId;

      if (isNew) {
        // 새로운 게임 생성
        const response = await CustomAPI.createElement({
          customName: customName
        });
        finalCustomId = response.customId;
      } else {
        // 기존 게임 업데이트
        await CustomAPI.updateElement(customId, {
          customName: customName
        });
      }

      // 여기에서 모든 커스텀 요소(타일, 카드 등)들을 생성/업데이트
      // 예: await Promise.all([
      //   CustomAPI.createTile(finalCustomId, tileData),
      //   CustomAPI.createSeedCard(finalCustomId, seedCardData),
      //   ...
      // ]);

      navigate(`/game-info/${gameInfo.gameInfoId}/custom`, { 
        state: { gameInfo } 
      });
    } catch (err) {
      setError('커스텀 게임 저장에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">게임 커스터마이징</h1>
      
      {/* 커스텀 이름 입력 필드 */}
      <div className="mb-8">
        <div className="max-w-xl mx-auto">
          <label className="block text-white text-lg mb-2">커스텀 게임 이름</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-cyan-400 focus:outline-none"
            placeholder="게임 이름을 입력하세요"
          />
        </div>
      </div>

      <SlideSection 
        title="타일 커스터마이징"
        currentIndex={indices.tile}
        setIndex={(newIndex) => {
          setIndices(prev => ({...prev, tile: newIndex}));
        }}
        totalItems={26} 
        onCardClick={handleCardClick}
        type="tile"
      />

      <SlideSection 
        title="씨앗은행카드 커스터마이징"
        currentIndex={indices.bank}
        setIndex={(newIndex) => {
          setIndices(prev => ({...prev, bank: newIndex}));
        }}
        totalItems={26} 
        onCardClick={handleCardClick}
        type="bank"
      />

      <SlideSection 
        title="텔레파시카드 커스터마이징"
        currentIndex={indices.telepathy}
        setIndex={(newIndex) => {         
          setIndices(prev => ({...prev, telepathy: newIndex}));
        }}
        totalItems={10}  
        onCardClick={handleCardClick}
        type="telepathy"
      />

      <SlideSection 
        title="뉴런의골짜기카드 커스터마이징"
        currentIndex={indices.neuron}
        setIndex={(newIndex) => {
          setIndices(prev => ({...prev, neuron: newIndex}));
        }}
        totalItems={10}  
        onCardClick={handleCardClick}
        type="neuron"
      />
  
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {modalType === 'tile' && 
              <TileModal 
                onClose={() => setShowModal(false)} 
                cardId={selectedCard}
                customId={customId}
              />
            }
            {modalType === 'bank' && 
              <BankCardModal 
                onClose={() => setShowModal(false)} 
                cardId={selectedCard}
                customId={customId}
              />
            }
            {(modalType === 'telepathy' || modalType === 'neuron') && (
              <SpecialCardModal 
                onClose={() => setShowModal(false)} 
                cardId={selectedCard} 
                type={modalType}
                customId={customId}
                isNew={isNew}
              />
            )}
          </div>
        )}
  
        <div className="text-center mt-8">
          <button
            onClick={handleComplete}
            className="px-8 py-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-lg font-semibold"
          >
            커스터마이징 완료
          </button>
        </div>
  
        {showConfirm && (
          <ConfirmModal 
            onClose={() => setShowConfirm(false)}
            onConfirm={handleConfirm}
            customName={customName}
          />
        )}
      </div>
    );
  };
  
  export default CustomEditor;