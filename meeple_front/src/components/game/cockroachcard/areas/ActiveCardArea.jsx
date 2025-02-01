import React, { useEffect, useState } from "react";
import Card from "../Card"; // Card 컴포넌트도 분리하면 좋을 것 같네요

const ActiveCardArea = ({
  currentCard,
  cardSender,
  cardReceiver,
  currentUser,
  handlePass,
  setShowGuessModal,
  gameData,
  isPassing,
  selectedCard,
}) => {
  const shouldShowFront = () => {
    if (cardSender === currentUser || isPassing) return true;
    return false;
  };
  const [showSelectedCard, setShowSelectedCard] = useState(false);

  // 타이밍 조정을 위해 useEffect 수정
  useEffect(() => {
    if (currentCard || selectedCard) {
      setShowSelectedCard(true);
    } else {
      setShowSelectedCard(false);
    }
  }, [selectedCard, currentCard]);

  // 턴이 변경되면 카드 영역 초기화
  useEffect(() => {
    if (gameData?.gameData?.gameState?.currentTurn) {
      setShowSelectedCard(false);
    }
  }, [gameData?.gameData?.gameState?.currentTurn]);

  return (
    <div className="absolute top-[60%] right-4 w-72 active-card-area">
      <div className="bg-gray-800/90 p-4 rounded-lg space-y-4 min-h-[200px]">
        {/* 영역 제목 추가 */}
        <div className="text-center text-sm font-medium text-gray-400 mb-2">
          Current Card
        </div>

        <div
          className="relative flex justify-center h-24"
          data-active-card-slot
        >
          <div className="transition-opacity duration-300 ease-in-out">
            {showSelectedCard && (currentCard || selectedCard) ? (
              <Card
                type={
                  currentCard
                    ? shouldShowFront()
                      ? currentCard.type
                      : null
                    : selectedCard.type
                }
                isBack={currentCard ? !shouldShowFront() : false}
                isRoyal={
                  currentCard ? currentCard.royal : selectedCard?.isRoyal
                }
                isActive={true}
              />
            ) : (
              <div className="w-16 h-24 border-2 border-dashed border-gray-600 rounded-lg opacity-50" />
            )}
          </div>
        </div>

        {/* 보내는 사람 -> 받는 사람 텍스트는 카드 아래에 표시 */}
        <div className="text-sm text-gray-300 text-center">
          {cardSender && cardReceiver ? `${cardSender} → ${cardReceiver}` : ""}
        </div>

        {cardReceiver === currentUser && (
          <div className="flex justify-center gap-4 mt-4">
            {!isPassing && (
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                onClick={handlePass}
              >
                PASS
              </button>
            )}
            <button
              className={`px-4 py-2 ${
                isPassing
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500"
              } text-white rounded`}
              onClick={() => !isPassing && setShowGuessModal(true)}
              disabled={isPassing}
            >
              GUESS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveCardArea;
