import React from "react";

const GuessCardModal = ({
  isOpen,
  onClose,
  cardInfo, // { from: "user2", animal: "Bat", isKing: true, isNegative: false }
  onGuess, // (isTrue) => void
  onPass, // () => void
}) => {
  if (!isOpen) return null;

  const message = `${cardInfo.from}님이 "${cardInfo.animal}${
    cardInfo.isKing ? " 왕" : ""
  }${cardInfo.isNegative ? " 아니야" : "야"}" 라고 했습니다.`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          카드 판단하기
        </h2>

        <p className="text-white text-center">{message}</p>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onGuess(true)}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            진실이야!
          </button>
          <button
            onClick={() => onGuess(false)}
            className="p-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            거짓이야!
          </button>
          <button
            onClick={onPass}
            className="p-3 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            패스
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessCardModal;
