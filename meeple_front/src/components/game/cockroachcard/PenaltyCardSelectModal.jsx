import React, { useState, useEffect } from "react";

const PenaltyCardSelectModal = ({
  isOpen,
  onClose,
  handCards,
  onSubmit,
  count, // 1 또는 2
  claimedAnimal, // 선언했던 동물 타입
}) => {
  const [selectedCards, setSelectedCards] = useState([]);

  useEffect(() => {
    // 선언한 카드가 있고 1장만 내야하는 경우 자동으로 선택
    if (count === 1) {
      const claimedCard = handCards.find(
        (card) =>
          card.type === claimedAnimal &&
          card.type !== "Joker" &&
          card.type !== "Black"
      );
      if (claimedCard) {
        onSubmit([claimedCard]);
        return;
      }
    }
  }, [count, handCards, claimedAnimal, onSubmit]);

  if (!isOpen) return null;

  // Joker와 Black 카드를 제외한 핸드카드만 표시
  const selectableCards = handCards.filter(
    (card) => card.type !== "Joker" && card.type !== "Black"
  );

  const handleCardSelect = (card) => {
    if (count === 1) {
      if (card.type !== claimedAnimal) return;
      setSelectedCards([card]);
    } else {
      if (selectedCards.includes(card)) {
        setSelectedCards(selectedCards.filter((c) => c !== card));
      } else if (selectedCards.length < 2) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[600px] space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          패널티로 보낼 카드 {count}장을 선택하세요
        </h2>

        <div className="flex flex-wrap gap-4 justify-center">
          {selectableCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardSelect(card)}
              className={`flex-shrink-0 w-16 h-24 rounded-lg relative cursor-pointer overflow-hidden
                ${selectedCards.includes(card) ? "ring-2 ring-blue-500" : ""}
              `}
            >
              <img
                src={`/src/assets/image/cockroachpoker/${
                  card.royal ? "King" : "" // isRoyal -> royal로 수정
                }${card.type}Card.svg`}
                alt={card.type}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          {/* 1장 선택할 때만 취소 버튼 표시 */}
          {count === 1 && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              취소
            </button>
          )}
          <button
            onClick={() => onSubmit(selectedCards)}
            disabled={selectedCards.length !== count}
            className={`px-4 py-2 ${
              selectedCards.length === count
                ? "bg-blue-600 hover:bg-blue-500"
                : "bg-gray-500 cursor-not-allowed"
            } text-white rounded`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PenaltyCardSelectModal;
