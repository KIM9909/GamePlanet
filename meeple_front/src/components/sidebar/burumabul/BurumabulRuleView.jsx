import React from "react";

const BurumabulRuleView = () => {
  return (
    <div className="p-4 bg-gray-900 bg-opacity-80 rounded-lg text-white">
      <div className="space-y-4">
        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-1">게임 구성</div>
          <p className="text-xs text-gray-400">
            주사위를 던지고 이동한 곳에서 증서구입, 우주 본부 / 기지 건설,
            타임머신 시간여행 등의 행동을 할 수 있어요!
          </p>
        </div>

        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-1">게임 진행</div>
          <p className="text-xs text-gray-400">
            1. 주사위를 던져 도착한 행성 또는 별자리에 우주본부를 지을 수
            있습니다. 2. 우주여행 중 자신의 본부에 도착하거나 지나갈 때 기지를
            지을 수 있습니다. 3. 텔레파시, 뉴런의 골짜기 카드 칸에 도착하면
            특수카드를 하나 뽑습니다. 4. 시간여행 칸에 도착하면 타임머신
            탑승장으로 이동, 30만 마불을 지불하고 원하는 곳으로 우주여행을 갈 수
            있습니다. (단, 자신의 차례에 주사위를 던져 4이상의 숫자가 나와야 함)
            5. 우주조난깆에 도착했을 때 모인 기금이 없다면 20만 마불을 접수처에
            기부합니다. (기금이 있을 경우 20만 마불을 가져갑니다.) 6. 블랙홀에
            도착하면 지구로 강제 귀환합니다. (기지가 있을 경우 기지 1개와 증서를
            반납하고 지구에서 3회 쉽니다. 갇혀있는 동안 주사위가 더블이 나오면
            탈출할 수 있습니다.) 7. 견우와 직녀성의 소유주가 나오면 두 여행자는
            지구(출발지)로 귀환, 20만 마불을 받고 원하는 곳으로 여행 할 수
            있습니다.
          </p>
        </div>

        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-1">승리 조건</div>
          <p className="text-xs text-gray-400">
            4명이 게임을 할 경우, 우주기지 6개를 먼저 건설한 사람이 승리를
            합니다.
          </p>
        </div>

        <div className="bg-gray-800 rounded p-3 border-2 border-cyan-400">
          <div className="text-sm mb-1">특별 규칙</div>
          <p className="text-xs text-gray-400">
            같은 숫자의 카드가 연속해서 나오면, 해당 카드들은 즉시 제거됩니다.
            예를 들어, 숫자 8이 연속해서 3장 나오면 그 카드들은 즉시 게임에서
            제거됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BurumabulRuleView;
