import React, { useEffect, useState } from "react";

const ChoosePositionModal = ({ setChooseNum, chooseNum, closeModal }) => {
  const [inputValue, setInputValue] = useState(chooseNum ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setTimeout(() => closeModal(), 3000);
  });
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 bg-opacity-80 border-2 border-cyan-500 p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-cyan-500">시간 여행</h2>
        <div className="mb-6">
          <p className="text-white mb-4">
            시간 여행을 떠나요! 지구로 귀환합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChoosePositionModal;
