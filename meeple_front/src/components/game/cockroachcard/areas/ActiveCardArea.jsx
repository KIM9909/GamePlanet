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
  const [cardVisible, setCardVisible] = useState(true);

  // shouldShowFront 함수 추가
  const shouldShowFront = () => {
    if (cardSender === currentUser || isPassing) return true;
    return false;
  };

  useEffect(() => {
    if (currentCard || selectedCard) {
      setCardVisible(true);
    }
  }, [currentCard, selectedCard]);

  const handleGuessClick = () => {
    if (isPassing) return;
    setCardVisible(false);
    setShowGuessModal(true);
  };

  return (
    <div className="absolute top-[60%] right-4 w-72 active-card-area">
      <div className="bg-gray-800/90 p-4 rounded-lg space-y-4 min-h-[200px]">
        <div className="text-center text-sm font-medium text-amber-400 mb-2">
          PLAY ZONE
        </div>

        <div 
          className="relative flex justify-center h-24"
          data-active-card-slot
        >
          <div className={`
            transition-all duration-300 ease-in-out
            ${cardVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          `}>
            {(currentCard || selectedCard) && cardVisible ? (
              <Card
                type={currentCard ? shouldShowFront() ? currentCard.type : null : selectedCard.type}
                isBack={currentCard ? !shouldShowFront() : false}
                isRoyal={currentCard ? currentCard.royal : selectedCard?.isRoyal}
                isActive={true}
              />
            ) : (
              <div className="w-16 h-24 border-2 border-dashed border-gray-600 rounded-lg opacity-50" />
            )}
          </div>
        </div>

        <div className="text-sm text-blue-300 text-center">
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
                isPassing ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
              } text-white rounded`}
              onClick={handleGuessClick}
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
