import React, { useState } from "react";

const ChoosePositionModal = ({ setChooseNum, chooseNum, closeModal }) => {
  // const [inputValue, setInputValue] = useState(chooseNum ?? "");
  // const [error, setError] = useState("");
  // const handleChange = (e) => {
  //   const value = e.target.value;
  //   setInputValue(value);
  //   // Clear error when input is valid
  //   if (value !== "" && parseInt(value) >= 0 && parseInt(value) <= 39) {
  //     setError("");
  //   }
  // };
  // const handleSubmit = () => {
  //   const num = parseInt(inputValue);
  //   // Validate input
  //   if (inputValue === "" || isNaN(num)) {
  //     setError("숫자를 입력해주세요.");
  //     return;
  //   }
  //   if (num < 0 || num > 39) {
  //     setError("0에서 39 사이의 숫자를 입력해주세요.");
  //     return;
  //   }
  //   // Set the number and close modal
  //   setChooseNum(num);
  //   closeModal();
  // };
  // return (
  //   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
  //     <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
  //       <h2 className="text-xl font-bold mb-4 text-gray-800">여행지 선택</h2>
  //       <div className="mb-6">
  //         <p className="text-gray-600 mb-4">
  //           0번은 지구, 39번은 수성입니다. 가고싶은 여행지의 번호를 적어주세요.
  //         </p>
  //         <input
  //           type="number"
  //           value={inputValue}
  //           onChange={handleChange}
  //           min="0"
  //           max="39"
  //           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
  //           placeholder="0-39 사이의 숫자 입력"
  //         />
  //         {error && <p className="text-red-500 text-sm">{error}</p>}
  //       </div>
  //       <div className="flex justify-end gap-4">
  //         <button
  //           onClick={handleSubmit}
  //           className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
  //           disabled={inputValue === "" || error !== ""}
  //         >
  //           확인
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ChoosePositionModal;
