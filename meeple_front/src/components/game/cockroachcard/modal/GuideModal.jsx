import React from "react";

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-[600px] border-2 border-blue-500/60 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">
            게임 설명
          </h2>
          <button
            onClick={onClose}
            className="text-blue-400 hover:text-blue-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3">게임 개요</h3>
            <p>
              바퀴벌레 포커는 바퀴벌레, 쥐, 고양이가 그려진 카드를 이용하는 블러핑 게임입니다.
              상대방의 카드를 예측하고 속이면서 자신의 카드를 먼저 없애는 것이 목표입니다.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3">게임 규칙</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>각 플레이어는 8장의 카드를 받습니다.</li>
              <li>턴마다 다른 플레이어에게 카드를 전달할 수 있습니다.</li>
              <li>
                전달할 때는 카드의 종류(바퀴벌레/쥐/고양이)를 말해야 하지만,
                실제와 다르게 말할 수 있습니다.
              </li>
              <li>카드를 받은 플레이어는 진실을 말했는지 의심할 수 있습니다.</li>
              <li>
                의심했을 때:
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li>
                    거짓말이었다면: 카드를 준 플레이어가 자신의 카드를 가져갑니다.
                  </li>
                  <li>
                    진실이었다면: 의심한 플레이어가 카드를 가져가고 추가로 1장을
                    받습니다.
                  </li>
                </ul>
              </li>
              <li>모든 카드를 없앤 플레이어가 승리합니다.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3">카드 설명</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="text-yellow-400">바퀴벌레</span>: 기본 카드
              </li>
              <li>
                <span className="text-gray-400">쥐</span>: 바퀴벌레를 잡아먹습니다
              </li>
              <li>
                <span className="text-orange-400">고양이</span>: 쥐를 잡아먹습니다
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-3">게임 팁</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>상대방의 패턴을 관찰하여 거짓말을 판단하세요.</li>
              <li>때로는 진실을 말하는 것이 더 좋은 전략일 수 있습니다.</li>
              <li>다른 플레이어들의 카드 수를 잘 체크하세요.</li>
              <li>의심은 신중하게! 실수하면 오히려 불리해집니다.</li>
            </ul>
          </section>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            알겠습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;