import React, { useCallback, useEffect, useState, useContext } from "react";
import TravelMap from "../play/TravelMap";

import GameSidebar from "../../../sidebar/GameSidebar";
import { Menu, X } from "lucide-react";
import DiceImage from "../../../../assets/burumabul_images/Dice.png";
import PlayerVideo from "../../../../components/game/burumabul/play/PlayerVideo";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../../layout/SocketLayout";

const BurumabulPlay = ({ roomId, currentRoomInfo, setIsStart, playData }) => {
  console.log("부루마불 플레이 현재 방 정보 :", currentRoomInfo);

  // 소켓 사용
  const socketContext = useContext(SocketContext);
  const {
    connected,
    roomSocketData,
    createBurumabulPlay,
    gamePlaySocketData,
    gameSocketNotifi,
    rollDiceSocketData,
    buyLandSocketData,
  } = socketContext;
  const firstDice = useSelector((state) => state.burumabul.firstDice);
  const secondDice = useSelector((state) => state.burumabul.secondDice);

  // 게임 데이터
  const [currentPlayData, setCurrentPlayData] = useState(playData);

  useEffect(() => {
    setCurrentPlayData(playData);
  }, [playData]);

  useEffect(() => {
    if (gamePlaySocketData) {
      console.log("새로운 gamePlaySocekData 수신:", gamePlaySocketData);
      setCurrentPlayData(gamePlaySocketData);
    }
  }, [gamePlaySocketData]);

  const roomInfo = currentRoomInfo;

  const dispatch = useDispatch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [rollDice, setRollDice] = useState(null);
  const [playerBases, setPlayerBases] = useState([]);
  const handleRollDiceRef = useCallback((rollDiceFn) => {
    setRollDice(() => rollDiceFn);
  }, []);

  const handlePlayerBasesRef = useCallback((getBases) => {
    console.log("플레이어 베이스 정보 : ", getBases);
    setPlayerBases(getBases);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const loadingMessage = !currentRoomInfo?.players ? (
    <div>게임 정보를 불러오는 중</div>
  ) : !currentPlayData || Object.keys(currentPlayData).length === 0 ? (
    <div>게임을 초기화하는 중</div>
  ) : null;

  if (loadingMessage) {
    return <>{loadingMessage}</>;
  }

  const currentPlayer =
    currentPlayData?.players?.[currentPlayData?.currentPlayerIndex];
  console.log("현재 플레이어: ", currentPlayer);
  const playerInfoList = currentPlayData.players;

  console.log("==================");
  console.log(firstDice);
  console.log(secondDice);

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
      <div className="bg-white h-12">
        <div>
          주사위 결과 : 첫 번째{firstDice} + 두 번째{secondDice} = 총 점수 :
          {firstDice + secondDice}
        </div>
        <div>{gameSocketNotifi}</div>
      </div>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="h-screen w-full flex">
          {/* <div className="text-4xl font-bold text-center">BurumablePage</div> */}
          <div className="w-2/3">
            <TravelMap
              onRollDice={handleRollDiceRef}
              onBasesInfo={handlePlayerBasesRef}
              gameData={currentPlayData}
              roomId={roomId}
            />
          </div>

          <div className="w-1/3 bg-gray-300 flex justify-center h-screen">
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
                      <div
                        key={index}
                        className="flex justify-around overflow-hidden text-ellipsis"
                      >
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
                <div className="h-[78%] mt-3">
                  <h1 className="text-center">플레이어 이름 정보</h1>
                  <div>
                    <div>
                      내 기지 :{" "}
                      {playerBases.map((playerBase, playerIndex) => (
                        <div key={playerIndex}>
                          <p>플레이어 {playerIndex + 1} : </p>
                          {playerBases.length > 0 ? (
                            playerBase.map((city, cityIndex) => (
                              <p key={cityIndex} className="ml-4">
                                {city}
                              </p>
                            ))
                          ) : (
                            <p className="ml-4 text-gray-500">
                              기지가 없습니다.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-row justify-center items-center">
                  {
                    <button
                      className="flex flex-row justify-center items-center"
                      onClick={() => rollDice && rollDice()}
                    >
                      <div className="flex-shrink-0 border-2 border-white text-white rounded-lg p-2 w-44 h-12 bg-teal-400 flex items-center justify-between whitespace-nowrap min-w-0">
                        <p
                          className="flex-shrink-0 ml-2"
                          style={{
                            textShadow:
                              "-1px 0px black, 0px 1px black, 1px 0px black, 0px -1px black",
                          }}
                        >
                          주사위 굴리기
                        </p>
                        <img className="w-12 h-12" src={DiceImage} alt="Dice" />
                      </div>
                    </button>
                  }
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
export default BurumabulPlay;
