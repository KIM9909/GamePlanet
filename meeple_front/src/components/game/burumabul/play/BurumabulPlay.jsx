import React, { useCallback, useEffect, useState, useContext } from "react";
import TravelMap from "../play/TravelMap";
import { createPortal } from "react-dom";
import GameSidebar from "../../../sidebar/GameSidebar";
import { Menu, X } from "lucide-react";
import DiceImage from "../../../../assets/burumabul_images/Dice.png";
import PlayerVideo from "../../../../components/game/burumabul/play/PlayerVideo";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../../layout/SocketLayout";
import QuestBuyLand from "./burumabul_Modal/QuestBuyLand";
import QuestBuildBase from "./burumabul_Modal/QuestBuildBase.";
import SeedCard from "./burumabul_Modal/SeedCard";

const BurumabulPlay = ({ roomId, currentRoomInfo, setIsStart, playData }) => {
  // console.log("부루마불 플레이 현재 방 정보 :", currentRoomInfo);
  const userId = Number(useSelector((state) => state.user.userId));
  // 소켓 사용
  const socketContext = useContext(SocketContext);
  const {
    connected,
    roomSocketData,
    createBurumabulPlay,
    gamePlaySocketData,
    currentPlayerSocketIndex,
    gameSocketNotifi,
    socketBoard,
    socketCards,
    socketNext,
    socketFirstDice,
    socketSecondDice,
    socketCurrentRound,
    socketDouble,
    socketTileUpdate,
    socketUserUpdate,
    rollDiceSocketData,
    setBuyLandSocketData,
    buyLandSocketData,
    setBuildBaseSocketData,
    buildBaseSocketData,
    roll,
  } = socketContext;

  // 게임 데이터
  const [currentPlayData, setCurrentPlayData] = useState(playData);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(
    currentPlayerSocketIndex
  );
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState(null);
  const [players, setPlayers] = useState(currentPlayData?.players || []);
  useEffect(() => {
    setCurrentPlayData(playData);
    setBoard(socketBoard);
    setCards(socketCards);
    setCurrentPlayerIndex(currentPlayerSocketIndex);
  }, [playData]);

  console.log("소켓에서 받아오는 현재 플레이어 순서", currentPlayerIndex);

  const currentPlayer = players?.[currentPlayData?.currentPlayerIndex];
  // console.log("현재 플레이어: ", currentPlayer);
  const playerInfoList = currentPlayData.players;

  const myInfo = players?.find((player) => Number(player.playerId) === userId);
  // console.log("내 정보 출력 ==================", myInfo);
  const myColorIndex = players?.findIndex(
    (player) => Number(player.playerId) === Number(userId)
  );
  // console.log(players);
  const colors = ["#FF3EA5", "#7695FF", "#00FF9C", "#EBF400"];

  const [playerBases, setPlayerBases] = useState(
    Array(currentPlayData?.players.length).fill([])
  );

  useEffect(() => {
    if (gamePlaySocketData) {
      console.log("새로운 gamePlaySocekData 수신:", gamePlaySocketData);
      setCurrentPlayData(gamePlaySocketData);
      setPlayers(gamePlaySocketData.players);
      setPlayerBases(Array(gamePlaySocketData.players.length).fill([]));
    }
  }, [gamePlaySocketData]);

  const roomInfo = currentRoomInfo;

  const dispatch = useDispatch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [rollDice, setRollDice] = useState(null);

  const handleRollDiceRef = useCallback((rollDiceFn) => {
    setRollDice(() => rollDiceFn);
  }, []);

  // 주사위 결과

  const [firstDice, setFirstDice] = useState(null);
  const [secondDice, setSecondDice] = useState(null);
  const totalDice = Number(firstDice) + Number(secondDice);
  const [isDouble, setIsDouble] = useState(null);
  const [nextAction, setNextAction] = useState(null);

  useEffect(() => {
    setFirstDice(socketFirstDice);
    setSecondDice(socketSecondDice);
    setIsDouble(socketDouble);
    setNextAction(socketNext);
  }, [socketFirstDice, socketSecondDice, socketDouble, socketNext]);

  // 현재 라운드
  const [currentRound, setCurrentRound] = useState(null);
  useEffect(() => {
    setCurrentRound(socketCurrentRound);
  }, [socketCurrentRound]);

  useEffect(() => {
    if (buyLandSocketData) {
      const { updatedPlayer, updatedTile } = buyLandSocketData;

      // 플레이어 정보 업데이트
      if (updatedPlayer) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((player) =>
              player.playerId === updatedPlayer.playerId
                ? {
                    ...player,
                    balance: updatedPlayer.balance,
                    cardOwned: updatedPlayer.cardOwned || [],
                    landOwned: updatedPlayer.landOwned || [],
                    position: updatedPlayer.position,
                  }
                : player
            ) || [];
          // console.log("Player update:", newPlayers);
          return newPlayers;
        });
      }

      // 보드(타일) 정보 업데이트
      if (updatedTile) {
        setBoard((prevBoard) => {
          const newBoard =
            prevBoard?.map((tile) =>
              tile.id === updatedTile.id
                ? {
                    ...tile,
                    ownerId: updatedTile.ownerId,
                    hasBase: updatedTile.hasBase,
                    tollPrice: updatedTile.tollPrice,
                  }
                : tile
            ) || [];
          // console.log("Board update:", newBoard);
          return newBoard;
        });
      }
      setBuyLandSocketData(null);
    }
  }, [buyLandSocketData]);

  useEffect(() => {
    if (buildBaseSocketData) {
      const { updatedPlayer, updatedTile } = buildBaseSocketData;

      // 플레이어 정보 업데이트
      if (updatedPlayer) {
        setPlayers((prevPlayers) => {
          const newPlayers =
            prevPlayers?.map((player) =>
              player.playerId === updatedPlayer.playerId
                ? {
                    ...player,
                    balance: updatedPlayer.balance,
                    cardOwned: updatedPlayer.cardOwned || [],
                    landOwned: updatedPlayer.landOwned || [],
                    position: updatedPlayer.position,
                  }
                : player
            ) || [];
          // console.log("Player update:", newPlayers);
          return newPlayers;
        });
      }

      // 보드(타일) 정보 업데이트
      if (updatedTile) {
        setBoard((prevBoard) => {
          const newBoard =
            prevBoard?.map((tile) =>
              tile.id === updatedTile.id
                ? {
                    ...tile,
                    ownerId: updatedTile.ownerId,
                    hasBase: updatedTile.hasBase,
                    tollPrice: updatedTile.tollPrice,
                  }
                : tile
            ) || [];
          // console.log("Board update:", newBoard);
          return newBoard;
        });
      }
      setBuildBaseSocketData(null);
    }
  }, [buildBaseSocketData, players, colors]);

  // 상태 변화를 모니터링하기 위한 별도의 useEffect
  useEffect(() => {
    if (buyLandSocketData) {
      // console.log("상태 업데이트 확인:");
      // console.log("Updated Players:", players);
      // console.log("Updated Cards:", cards);
      // console.log("Updated Board:", board);
    }
  }, [players, board, cards, buyLandSocketData]);

  const [showCard, setShowCard] = useState(null);

  const handleShowCard = () => {
    setShowCard(!showCard);
  };

  const handlePlayerBasesRef = useCallback((getBases) => {
    // console.log("플레이어 베이스 정보 : ", getBases);

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

  // console.log("currentPlayerIndex:", currentPlayerIndex);
  // console.log("myColorIndex:", myColorIndex);
  // console.log("rollDice 존재 여부:", !!rollDice);
  // console.log("현재 게임 데이터", currentPlayData);
  // console.log("현재 타일(보드 정보)", board);
  // console.log("현재 카드 정보", cards);

  // console.log("currentPlayerIndex:", currentPlayerIndex);
  // console.log("myColorIndex:", myColorIndex);

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
          {totalDice}
        </div>
        {isDouble && <div>더블입니다!!</div>}
        <div>{gameSocketNotifi}</div>
        <div>현재 라운드 : {currentRound}</div>
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
                    {players.map((player, index) => (
                      <div
                        key={index}
                        className="flex justify-around overflow-hidden text-ellipsis"
                      >
                        <p>순위</p>
                        <p>
                          player {index + 1}. : {player.playerName}
                        </p>
                        <p>{player.balance}마불</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 내 정보 칸 */}
              <div
                className="h-[40%] w-full border-2"
                style={{ backgroundColor: colors[myColorIndex] }}
              >
                <div className="h-[78%] mt-3">
                  <h1 className="text-center">내 정보</h1>
                  <div className="flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-center items-center">
                      내 기지
                      {myInfo?.cardOwned?.slice(0, 5).map((card, cardIndex) => (
                        <div
                          key={cardIndex}
                          className="flex justify-center items-center"
                        >
                          <p>{card.name}</p>
                        </div>
                      ))}
                      {myInfo?.cardOwned?.length > 5 && (
                        <div className="flex justify-center items-center">
                          <p>+ {myInfo.cardOwned.length - 5}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <button
                        className="bg-white rounded-lg w-44 h-10"
                        onClick={handleShowCard}
                      >
                        내 카드 더 보기/
                      </button>
                      {showCard &&
                        createPortal(
                          <div>
                            <SeedCard
                              cardList={myInfo?.cardOwned}
                              onClose={() => setShowCard(false)}
                            />
                          </div>,
                          document.body
                        )}
                    </div>
                  </div>
                </div>
                {/* <div className="flex flex-row justify-center items-center">
                  {currentPlayerIndex !== null &&
                    currentPlayerIndex !== undefined &&
                    currentPlayerIndex === myColorIndex && (
                      <button
                        className="flex flex-row justify-center items-center"
                        onClick={() => rollDice && rollDice()}
                      >
                        <div
                          className="flex-shrink-0 border-2 border-white/50 text-white rounded-lg p-2 w-44 h-12 
                  bg-gradient-to-r from-purple-500 to-indigo-600 
                  shadow-lg hover:shadow-xl 
                  flex items-center justify-between whitespace-nowrap min-w-0 
                  transition duration-300 ease-in-out transform hover:brightness-110"
                        >
                          <p
                            className="flex-shrink-0 ml-2 text-white"
                            style={{
                              textShadow:
                                "-1px 0px black, 0px 1px black, 1px 0px black, 0px -1px black",
                            }}
                          >
                            주사위 굴리기
                          </p>
                          <img
                            className="w-12 h-12"
                            src={DiceImage}
                            alt="Dice"
                          />
                        </div>
                      </button>
                    )}
                </div> */}
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
