import React from "react";

const GuessCardModal = ({
  isOpen = false,
  onClose = () => {},
  onSubmit = () => {},
  currentCard = null,
  claimedAnimal = "",
  isKing = false,
  from = "",
  to = "",
  isNegative = false,
}) => {
  if (!isOpen) return null;

  const message = `${from}님이 "${claimedAnimal}${isKing ? " 킹이" : "일반이"}${
    isNegative ? " 아니야" : "야"
  }" 라고 했습니다.`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          카드 판단하기
        </h2>

        <p className="text-white text-center">{message}</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSubmit(true)}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            진실이야!
          </button>
          <button
            onClick={() => onSubmit(false)}
            className="p-3 bg-red-500 text-white rounded hover:bg-red-600"
          >
            거짓이야!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuessCardModal;
