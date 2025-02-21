import React from "react";

const BurumabulRuleView = () => {
  return (
    <div className="h-full p-4 bg-gray-900 bg-opacity-80 rounded-lg text-white overflow-y-auto">
      <div className="space-y-4">
        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-1">게임 구성</div>
          <p className="text-xs text-gray-400">
            주사위를 던지고 이동한 곳에서 증서구입, 우주 본부 / 기지 건설,
            타임머신 시간여행 등의 행동을 할 수 있어요!
          </p>
        </div>

        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-2">게임 진행</div>

          <p className="text-xs mb-2 text-gray-400">
            1. 주사위를 던져 도착한 행성 또는 별자리에 우주본부를 지을 수
            있습니다.{" "}
          </p>
          <p className="text-xs mb-2 text-gray-400">
            {" "}
            2. 우주여행 중 자신의 본부에 도착하면 기지를 지을 수 있습니다.
          </p>
          <p className="text-xs mb-2 text-gray-400">
            {" "}
            3. 텔레파시, 뉴런의 골짜기 카드 칸에 도착하면 특수카드를 하나
            뽑습니다.
          </p>
          <p className="text-xs mb-2 text-gray-400">
            4. 시간여행 칸에 도착하면 지구로 귀환하는 시간여행을 합니다.
          </p>
          <p className="text-xs mb-2 text-gray-400">
            5. 공포의 블랙홀 카드를 뽑을 시 3회 쉽니다. (갇혀있는 동안 주사위가
            더블이 나오면 탈출할 수 있습니다.)
          </p>
        </div>

        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-2">승리 조건</div>
          <p className="text-xs mb-2 text-gray-400">
            1. 4명이 게임을 할 경우, 우주기지 6개를 먼저 건설한 사람이 승리를
            합니다.
          </p>
          <p className="text-xs mb-2 text-gray-400">
            2. 다른 플레이어가 파산하고, 남은 플레이어가 한 명일 경우, 그
            플레이어가 승리합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BurumabulRuleView;
