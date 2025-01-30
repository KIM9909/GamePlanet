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

  // currentCard나 selectedCard가 변경될 때마다 카드 표시 상태 업데이트
  useEffect(() => {
    setShowSelectedCard(false); // 먼저 카드를 숨김

    // 새로운 카드가 있을 때만 표시
    if (currentCard || selectedCard) {
      const timer = setTimeout(() => {
        setShowSelectedCard(true);
      }, 400);
      return () => clearTimeout(timer);
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
        <div
          className="relative flex justify-center h-24"
          data-active-card-slot
        >
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
              isRoyal={currentCard ? currentCard.royal : selectedCard?.isRoyal}
              isActive={true}
            />
          ) : (
            <div className="w-16 h-24 border-2 border-dashed border-gray-600 rounded-lg" />
          )}
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
