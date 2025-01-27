import React, { useState, useEffect } from "react";

const GiveCardModal = ({
  isOpen,
  onClose,
  selectedCard,
  selectedPlayer,
  onSubmit,
  isPassing,
}) => {
  const [isKing, setIsKing] = useState(false);
  const [claimedAnimal, setClaimedAnimal] = useState(selectedCard?.type || "");
  const [isNegative, setIsNegative] = useState(false);

  const getSelectableAnimals = () => {
    if (selectedCard?.type === "Black") {
      return ["Black"];
    }
    return ["Bat", "Rat", "Fly", "Cockroach", "Scorpion", "Toad", "Stinkbug"];
  };

  useEffect(() => {
    if (selectedCard?.type === "Black") {
      setClaimedAnimal("Black");
      setIsKing(false);
      setIsNegative(false);
    }
  }, [selectedCard]);

  const getKoreanName = (type) => {
    const nameMap = {
      Bat: "박쥐",
      Rat: "쥐",
      Fly: "파리",
      Cockroach: "바퀴벌레",
      Scorpion: "전갈",
      Toad: "두꺼비",
      Stinkbug: "노린재",
      Joker: "조커",
      Black: "블랙",
    };
    return nameMap[type] || type;
  };

  const handleClose = () => {
    if (isPassing) return;
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({
      isKing,
      animal: claimedAnimal,
      isNegative,
    });
    onClose();
  };

  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (isPassing) return; // PASS 모드일 때는 배경 클릭으로 닫히지 않도록
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-gray-800 rounded-lg p-6 w-96 space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          {isPassing ? "카드 전달하기" : "카드 보내기"}
        </h2>

        {/* 동물 선택 */}
        <div className="space-y-2">
          <label className="text-white">선언할 동물:</label>
          <select
            value={claimedAnimal}
            onChange={(e) => setClaimedAnimal(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            disabled={selectedCard?.type === "Black"}
          >
            {getSelectableAnimals().map((animal) => (
              <option key={animal} value={animal}>
                {getKoreanName(animal)}
              </option>
            ))}
          </select>
        </div>

        {/* 블랙카드가 아닐 때만 추가 옵션 표시 */}
        {selectedCard?.type !== "Black" && (
          <>
            {/* 카드 타입 선택 */}
            <div className="space-y-2">
              <label className="text-white">카드 타입:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded ${
                    !isKing ? "bg-blue-500" : "bg-gray-700"
                  } text-white`}
                  onClick={() => setIsKing(false)}
                >
                  일반
                </button>
                <button
                  className={`p-2 rounded ${
                    isKing ? "bg-blue-500" : "bg-gray-700"
                  } text-white`}
                  onClick={() => setIsKing(true)}
                >
                  킹
                </button>
              </div>
            </div>

            {/* 긍정/부정 선택 */}
            <div className="space-y-2">
              <label className="text-white">선언 방식:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={`p-2 rounded ${
                    !isNegative ? "bg-blue-500" : "bg-gray-700"
                  } text-white`}
                  onClick={() => setIsNegative(false)}
                >
                  진실
                </button>
                <button
                  className={`p-2 rounded ${
                    isNegative ? "bg-blue-500" : "bg-gray-700"
                  } text-white`}
                  onClick={() => setIsNegative(true)}
                >
                  거짓
                </button>
              </div>
            </div>
          </>
        )}

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-4">
          {isPassing ? (
            // PASS 모드일 때는 "다른 플레이어 선택" 버튼 표시
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              다른 플레이어 선택
            </button>
          ) : (
            // 일반 모드일 때는 취소 버튼 표시
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              취소
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            {isPassing ? "전달" : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveCardModal;
