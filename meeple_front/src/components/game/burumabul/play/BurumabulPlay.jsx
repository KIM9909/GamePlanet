import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import TravelMap from "../play/TravelMap";
import { createPortal } from "react-dom";
import BurumabulSidebar from "../../../sidebar/burumabul/BurumabulSidebar";
import { Menu, X, Trophy, CreditCard } from "lucide-react";

import PlayerVideo from "../../../../components/game/burumabul/play/PlayerVideo";
import { useDispatch, useSelector } from "react-redux";
import { SocketContext } from "../../../layout/SocketLayout";
import UserAPI from "../../../../sources/api/UserAPI";

import SeedCard from "./burumabul_Modal/SeedCard";

const BurumabulPlay = ({
  roomId,
  currentRoomInfo,
  setIsStart,
  playData,
  setGameStatus,
}) => {
  // console.log("부루마불 플레이 현재 방 정보 :", currentRoomInfo);
  const userId = Number(useSelector((state) => state.user.userId));
  // 소켓 사용
  const socketContext = useContext(SocketContext);
  const {
    socketBurumabulOpenVidu,
    gamePlaySocketData,
    gameSocketNotifi,
    socketBoard,
    socketCards,
    socketCurrentRound,
    rollDiceSocketData,
    buyLandSocketData,
    buildBaseSocketData,
  } = socketContext;
  const { getProfile } = UserAPI;

  // 게임 데이터
  const [currentPlayData, setCurrentPlayData] = useState(playData);
  const turnSound = useRef(null);

  const [audioSrc, setAudioSrc] = useState(
    "https://meeple-file-server-2.s3.ap-northeast-2.amazonaws.com/static-files/burumabul_turnSound.mp3"
  );

  const [isGameEnded, setIsGameEnded] = useState(false);

  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState(null);
  const [players, setPlayers] = useState(currentPlayData?.players || []);
  useEffect(() => {
    setCurrentPlayData(playData);
    setBoard(socketBoard);
    setCards(socketCards);
  }, [playData]);

  // 오픈비두 세션 아이디 저장하기
  const [burumabulOpenViduId, setBurumabulOpenVidu] = useState(
    socketBurumabulOpenVidu
  );
  useEffect(() => {
    if (socketBurumabulOpenVidu) {
      setBurumabulOpenVidu(socketBurumabulOpenVidu);
    }
  }, [socketBurumabulOpenVidu]);

  // 게임 종료 시 오픈비두 세션 종료 요청
  const handleGameEnd = () => {
    console.log("게임 종료됨 - PlayerVideo에 OpenVidu 종료 요청 보냄");
    setIsGameEnded(true);
  };

  const currentPlayer = players?.[currentPlayData?.currentPlayerIndex];
  console.log("현재 플레이어: ", currentPlayer);
  const playerInfoList = currentPlayData.players;

  const [previousPlayer, setPreviousPlayer] = useState(null);

  useEffect(() => {
    if (!currentPlayer || !turnSound.current) return;

    // 이전 플레이어와 현재 플레이어가 다를 때만 실행
    if (previousPlayer?.playerId !== currentPlayer.playerId) {
      const playSound = async () => {
        try {
          turnSound.current.currentTime = 0;
          await turnSound.current.play();
          console.log("Sound played successfully");
        } catch (error) {
          console.error("Audio play failed:", error);
        }
      };

      playSound();
      setPreviousPlayer(currentPlayer); // 현재 플레이어를 이전 플레이어로 저장
    }
  }, [currentPlayer]);

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

  const updateGameState = useCallback((newData) => {
    if (newData) {
      console.log("새로운 gamePlaySocekData 수신:", newData);
      setCurrentPlayData(newData);
      setPlayers(newData.players);
    }
  }, []);

  useEffect(() => {
    if (gamePlaySocketData) {
      updateGameState(gamePlaySocketData);
    }
  }, [gamePlaySocketData, updateGameState]);

  const roomInfo = currentRoomInfo;

  const dispatch = useDispatch();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [rollDice, setRollDice] = useState(null);

  const handleRollDiceRef = useCallback((rollDiceFn) => {
    setRollDice(() => rollDiceFn);
  }, []);

  const [nicknames, setNicknames] = useState({});

  const fetchNicknames = useCallback(async () => {
    const newNicknames = {};
    for (const player of players) {
      if (!nicknames[player.playerId]) {
        // 이미 조회된 닉네임이 있으면 건너뜀
        try {
          const response = await getProfile(player.playerId);
          newNicknames[player.playerId] = response.userNickname;
        } catch (error) {
          console.error("플레이어 닉네임 조회 오류:", error);
        }
      }
    }
    if (Object.keys(newNicknames).length > 0) {
      setNicknames((prev) => ({ ...prev, ...newNicknames }));
    }
  }, [players, nicknames]);

  // players가 변경될 때마다 닉네임 가져오기
  useEffect(() => {
    if (players.length > 0) {
      fetchNicknames();
    }
  }, [players, fetchNicknames]);
  // 주사위 결과

  const [firstDice, setFirstDice] = useState(null);
  const [secondDice, setSecondDice] = useState(null);
  const totalDice = Number(firstDice) + Number(secondDice);
  const [isDouble, setIsDouble] = useState(null);

  useEffect(() => {
    if (rollDiceSocketData) {
      setFirstDice(rollDiceSocketData.firstDice);
      setSecondDice(rollDiceSocketData.secondDice);
      setIsDouble(rollDiceSocketData.double);
    }
  }, [rollDiceSocketData]);

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
      // setBuyLandSocketData(null);
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
      // setBuildBaseSocketData(null);
    }
  }, [buildBaseSocketData]);

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

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-900 overflow-hidden">
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 5px; position: absolute; right: 0;}
        .thin-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 15px;}
        .thin-scrollbar::-webkit-scrollbar-track { display: none; }
        .game-stats { backdrop-filter: blur(8px); }
      `}</style>

      {/* 사이드바 */}
      <div className="fixed left-0 top-0 h-full z-50 flex">
        <div
          className={`transition-transform duration-300 ease-in-out transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } relative`}
        >
          <BurumabulSidebar playerInfoList={playerInfoList} />
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute -right-10 top-1/2 -translate-y-1/2 w-10 h-10 bg-cyan-400 rounded-r text-white hover:bg-cyan-600 focus:outline-none flex items-center justify-center shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      <audio ref={turnSound} src={audioSrc} preload="auto" />

      {/* Game Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-gray-900/90 border-b border-cyan-500/30 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-cyan-400 font-medium">
              Round {currentRound}
            </div>
            <div className="bg-gray-800 rounded-lg px-3 py-1 text-cyan-300">
              🎲 {firstDice} + {secondDice} = {totalDice}
              {isDouble && (
                <span className="ml-2 text-cyan-400 font-bold">Double!</span>
              )}
            </div>
          </div>
          <div className="text-white">
            현재 플레이어 :{" "}
            <span className="text-cyan-400 text-lg">
              {currentPlayer.playerNickname}
            </span>
          </div>

          <div className="text-cyan-300/80">{gameSocketNotifi}</div>
        </div>
      </div>

      {/* Main Game Layout */}
      <div
        className={`fixed top-14 left-0 right-0 bottom-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="flex h-full">
          {/* Game Map Area */}
          <div className="flex-1 h-full">
            <TravelMap
              onBasesInfo={handlePlayerBasesRef}
              gameData={currentPlayData}
              roomId={roomId}
              setIsStart={setIsStart}
              onGameEnd={handleGameEnd}
              setGameStatus={setGameStatus}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-96 bg-gray-900 border-l border-cyan-500/30 flex flex-col">
            {/* Players Section */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4 border-b border-cyan-500/30">
                <h2 className="text-lg font-bold text-cyan-400">Players</h2>
              </div>

              <div className="h-[calc(100%-4rem)] overflow-y-auto thin-scrollbar">
                <div className="p-4 grid grid-cols-2 gap-3">
                  {playerInfoList.map((player, index) => (
                    <PlayerVideo
                      key={index}
                      playerInfo={player}
                      sessionId={burumabulOpenViduId}
                      isGameEnded={isGameEnded}
                    />
                  ))}
                </div>

                {/* Ranking Board */}
                <div className="mx-4 mb-4 bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20">
                  <div className="flex items-center mb-3">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                    <h2 className="font-semibold text-cyan-400">Ranking</h2>
                  </div>
                  <div className="space-y-2">
                    {players
                      .map((player, index) => ({
                        ...player,
                        originalIndex: index,
                      }))
                      .sort((a, b) => b.balance - a.balance)
                      .map((player, index) => (
                        <div
                          key={player.originalIndex}
                          className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="w-6 h-6 rounded-full bg-cyan-900/50 flex items-center justify-center text-sm font-medium text-cyan-400">
                              {index + 1}
                            </span>
                            <span className="ml-3 font-medium text-gray-300">
                              {nicknames[player.playerId] || player.playerName}
                            </span>
                          </div>
                          <span className="text-cyan-300 font-medium">
                            {player.balance}마불
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* My Status */}
            <div
              className="h-48 p-4 border-t border-cyan-500/30"
              style={{ backgroundColor: colors[myColorIndex] }}
            >
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-white font-bold text-lg">My Status</h2>
                  <button
                    onClick={handleShowCard}
                    className="flex items-center px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    View Cards
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {myInfo?.cardOwned?.slice(0, 4).map((card, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="bg-black/20 rounded-lg p-2 text-white text-sm truncate"
                    >
                      {card.name}
                    </div>
                  ))}
                </div>
                {myInfo?.cardOwned?.length > 4 && (
                  <div className="text-white text-center text-sm mt-2">
                    +{myInfo.cardOwned.length - 4} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg p-2 shadow-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Card Modal */}
      {showCard &&
        createPortal(
          <SeedCard
            cardList={myInfo?.cardOwned}
            onClose={() => setShowCard(false)}
          />,
          document.body
        )}
    </div>
  );
};
export default BurumabulPlay;
