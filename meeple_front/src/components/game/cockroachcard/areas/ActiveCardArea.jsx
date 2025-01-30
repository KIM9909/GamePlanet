import React from "react";
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
}) => {
  if (!currentCard) return null;

  const shouldShowFront = () => {
    if (cardSender === currentUser || isPassing) return true;
    return false;
  };

  return (
    <div className="absolute top-[60%] right-4 w-72 active-card-area">
      <div className="bg-gray-800/90 p-4 rounded-lg space-y-4">
        <div className="text-sm text-gray-300 text-center">
          {cardSender} → {cardReceiver}
        </div>
        <div className="relative flex justify-center">
          <Card
            type={shouldShowFront() ? currentCard.type : null}
            isBack={!shouldShowFront()}
            isRoyal={currentCard.royal}
            isActive={true}
          />
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
