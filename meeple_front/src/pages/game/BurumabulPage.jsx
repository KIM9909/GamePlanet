import React, { useCallback, useState } from "react";
import TravelMap from "../../components/game/burumabul/TravelMap";
import GameSidebar from "../../components/sidebar/GameSidebar";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import DiceImage from "../../assets/burumabul_images/Dice.png";
import PlayerVideo from "../../components/game/burumabul/PlayerVideo";

const BurumabulPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // const [playerCount, setPlayerCount] = useState()
  const [rollDice, setRollDice] = useState(null);
  const playerInfoList = [1, 2, 3, 4];

  const handleRollDiceRef = useCallback((rollDiceFn) => {
    setRollDice(() => rollDiceFn);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 5px;  position: absolute; right: 0;}
        .thin-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 15px;}
        .thin-scrollbar::-webkit-scrollbar-track { display: none; }

      `}</style>
      <div className="fixed left-0 top-0 h-full z-50 flex">
        {/* 사이드바 */}
        <div
          className={`transition-transform duration-300 ease-in-out transform 
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              relative`}
        >
          <GameSidebar />
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-12 
                bg-gray-800 rounded-r text-white
                hover:bg-gray-700 focus:outline-none 
                flex items-center justify-center
                shadow-lg"
            >
              <X className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>
      {/* Main Content 영역 */}
      <div className="bg-white h-12">정보</div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="h-screen w-full flex">
          {/* <div className="text-4xl font-bold text-center">BurumablePage</div> */}
          <div className="w-2/3">
            <TravelMap onRollDice={handleRollDiceRef} />
          </div>

          <div className="w-1/3 bg-gray-300 flex justify-center h-screen">
            {/* 화상 칸 */}
            <div className="flex flex-col items-center justify-center w-full h-full">
              <div className="h-[60%] w-full border-2 overflow-y-auto thin-scrollbar max-h-[70vh]">
                <h2 className="text-lg text-center my-2">현재 플레이어: </h2>
                <div className="mx-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                    {playerInfoList.map((player, index) => (
                      <PlayerVideo key={index} playerInfo={player} />
                    ))}
                  </div>
                </div>
                <div className="border-2 m-3 rounded-lg">
                  <h2 className="text-center m-3">플레이어 순위</h2>
                  <div className="mb-3 mx-2">
                    {playerInfoList.map((player, index) => (
                      <div key={index} className="flex justify-around">
                        {/* 순위 아이콘 */}
                        <p>순위</p>
                        <p>player {index + 1}. : 누구누구</p>
                        <p>~~~~~ 만 마불</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 내 정보 칸 */}
              <div className="h-[40%] w-full border-2">
                <div className="h-[78%]">내 정보</div>
                <div className="text-center">
                  <button
                    className="w-16 h-16"
                    onClick={() => rollDice && rollDice()}
                  >
                    <img src={DiceImage} alt="" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isSidebarOpen && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50">
          <div className="relative group">
            <button
              onClick={toggleSidebar}
              className="invisible group-hover:visible transition-all duration-300
              bg-gray-800 rounded-r text-white
              hover:bg-gray-700 focus:outline-none 
              flex items-center justify-center
              shadow-lg w-12 h-12"
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BurumabulPage;
