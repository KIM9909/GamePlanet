import React from "react";
import guideimg from "../../../../assets/images/guide.png";

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-70 transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-50 bg-gray-900 rounded-xl shadow-2xl border border-blue-900 p-6 w-[800px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-300">
            혹시 방 입장이 안되시나요 ?
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <img
            src={guideimg}
            alt="게임 가이드"
            className="w-full rounded-lg shadow-lg"
          />
          <div className="text-gray-300 space-y-2">
            <p>
              1. 페이지 상단의 캐릭터들 중{" "}
              <span className="text-yellow-300">노란머리</span> 캐릭터 클릭 !
            </p>
            <p>
              2. 클릭 시 나오는{" "}
              <span className="text-cyan-300">Meeple Dowload</span> 버튼을
              클릭합니다.
            </p>
            <p>3. 설치 및 실행 후 로그인을 합니다.</p>
            <p>4. 다시 방 입장을 해보세요 !</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
