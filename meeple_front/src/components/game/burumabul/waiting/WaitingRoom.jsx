import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import background from "../../../../assets/burumabul_images/waitingroom.gif";
import PlayerCard from "./PlayerCard";
import { LockKeyhole, LockKeyholeOpen, Sparkles, Users } from "lucide-react";
import FriendSearch from "../../FriendSearch";
import { connect, useDispatch, useSelector } from "react-redux";
import { putBurumabulRoom } from "../../../../sources/api/BurumabulRoomAPI";
import PutBurumabulRoom from "../PutBurumabulRoom";
import PlayerAlertModal from "./PlayerAlertModal";
import { createPortal } from "react-dom";
import { fetchFriendList } from "../../../../sources/api/FriendApi";
import { findBurumabulRoom } from "../../../../sources/api/BurumabulRoomAPI";
import { SocketContext } from "../../../layout/SocketLayout";
import ChangePasswordModal from "../play/burumabul_Modal/ChangePasswordModal";
import WaitingChat from "../play/burumabul_Modal/WaitingChat";
import GameReviewModal from "../../catchMind/inGame/GameReivewModal";

const WaitingRoom = ({
  roomId,
  roomInfo,
  setIsStart,
  setPlayData,
  gameStatus,
}) => {
  const userId = Number(useSelector((state) => state.user.userId));
  const [currentRoomInfo, setCurrentRoomInfo] = useState(roomInfo);
  useEffect(() => {
    if (roomInfo && Object.keys(roomInfo).length > 0) {
      setCurrentRoomInfo(roomInfo);
      setRoomName(roomInfo.roomName);
      setMaxPlayers(roomInfo.maxPlayers);
      setPlayerLen(roomInfo.players.length);
      console.log(currentRoomInfo);
    }
  }, [roomInfo]);

  const {
    connected,
    roomSocketData,
    leaveGame,
    createBurumabulPlay,
    gamePlaySocketData,
    socketCustomList,
  } = useContext(SocketContext);

  const [showPutRoomModal, setShowPutRoomModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [friendList, setFriendList] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // console.log("소켓 데이터", SocketContext);

  const playersInfo = currentRoomInfo.players;
  const [roomName, setRoomName] = useState(currentRoomInfo.roomName);
  const [maxPlayers, setMaxPlayers] = useState(currentRoomInfo.maxPlayers);
  const [playerLen, setPlayerLen] = useState(currentRoomInfo.players.length);
  const creatorId = Number(currentRoomInfo.creator.playerId);
  const isPrivate = currentRoomInfo.private;

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  // 기본 테마
  const DEFAULT_THEME = {
    customId: -1,
    customName: "기본테마",
    userNickName: "Basic",
  };
  const [customList, setCustomList] = useState([DEFAULT_THEME]);
  // 기본 커스텀

  const customThemeList = useSelector((state) => state.burumabul.customList);

  useEffect(() => {
    if (customThemeList && customThemeList.length > 0) {
      setCustomList([DEFAULT_THEME, ...customThemeList]);
    }
  }, [customThemeList]);
  // 커스텀 선택
  const [selectedThemeId, setSelectedThemeId] = useState(-1);

  useEffect(() => {
    if (socketCustomList && socketCustomList.length > 0) {
      setCustomList([DEFAULT_THEME, ...socketCustomList]);
    }
  }, [socketCustomList]);

  // 준비 됐는지 안 됐는지
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!roomSocketData) return;
    setCurrentRoomInfo((prev) => ({
      ...prev,
      ...roomSocketData,
    }));

    if (roomSocketData.roomName) setRoomName(roomSocketData.roomName);
    if (roomSocketData.maxPlayers) setMaxPlayers(roomSocketData.maxPlayers);
    if (roomSocketData.players) setPlayerLen(roomSocketData.players.length);
  }, [roomSocketData]);

  useEffect(() => {
    const getFriendList = async () => {
      if (roomId) {
        try {
          const response = await fetchFriendList(userId);
          setFriendList(response);
        } catch (error) {
          console.log("친구 목록 로드 중 에러");
        } finally {
          setLoading(false);
        }
      }
    };
    getFriendList();
  }, [roomId]);

  useEffect(() => {
    const getRoomInfo = async () => {
      if (roomId) {
        try {
          const response = await findBurumabulRoom(roomId);
          setCurrentRoomInfo(response);
        } catch (error) {
          console.error("방 정보 조회 중 오류 발생 : ", error);
        } finally {
          setLoading(false);
        }
      }
    };
    getRoomInfo();
    console.log(roomId);
  }, [roomId]);

  useEffect(() => {
    if (connected && roomSocketData) {
      setCurrentRoomInfo((prev) => ({
        ...prev,
        ...roomSocketData,
      }));

      if (roomSocketData.roomName) setRoomName(roomSocketData.roomName);
      if (roomSocketData.maxPlayers) setMaxPlayers(roomSocketData.maxPlayers);
      if (roomSocketData.players) setPlayerLen(roomSocketData.players.length);
    }
  }, [connected, roomSocketData]);

  const leaveTheRoom = () => {
    console.log("방 나가기 버튼 클릭됨, gameStatus:", gameStatus);
    if (gameStatus === "GAME_END") {
      setIsReviewModalOpen(true);
    } else {
      leaveGame();
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    }
  };

  const handleReviewClose = useCallback(() => {
    if (connected) {
      leaveGame();
      setIsReviewModalOpen(false);
    }
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  }, [connected, leaveGame, navigate]);

  if (loading) {
    return <div>Loading Room Informangition</div>;
  }

  const handlePutRoom = () => {
    setShowPutRoomModal(true);
  };

  const handleAlertModal = () => {
    setShowAlertModal(true);
  };

  const showChangePassword = () => {
    setShowPasswordModal(true);
  };

  //
  const goToGame = () => {
    if (connected && roomId && playersInfo) {
      try {
        const playerList = playersInfo.map((player) => player.playerId);
        const playInfo = {
          gamePlayId: roomId,
          players: playerList,
          customId: selectedThemeId,
        };
        console.log("게임 생성 시도", playInfo);
        createBurumabulPlay(playInfo);
        setPlayData(gamePlaySocketData);
        setIsStart(true);
      } catch (error) {
        console.error("부루마불 플레이 생성 실패 :", error);
      }
    }
  };

  return (
    <>
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 5px; padding-right: 12px; position: absolute; right: 0;}
        .thin-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 15px;}
        .thin-scrollbar::-webkit-scrollbar-track { display: none; }.neon-border {
          box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee;
          animation: neon-pulse 1.5s infinite alternate;
        }
        
       .neon-border {
          box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee;
          animation: neon-pulse 1.5s infinite alternate;
        }
        
        .neon-text {
          text-shadow: 0 0 2px #22d3ee;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .cyber-gradient {
          background: linear-gradient(45deg, rgba(34,211,238,0.1), rgba(206,71,255,0.1));
        }
        
        @keyframes neon-pulse {
          from {
            box-shadow: 0 0 10px #22d3ee, 0 0 20px #22d3ee, 0 0 30px #22d3ee;
          }
          to {
            box-shadow: 0 0 15px #22d3ee, 0 0 25px #22d3ee, 0 0 35px #22d3ee;
          }
        }
        
        .glitch-effect {
          position: relative;
        }
        
        .glitch-effect::before,
        .glitch-effect::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-effect::before {
          left: 1px;
          text-shadow: -1px 0 rgba(206,71,255,0.7);
          animation: glitch-1 3s infinite linear alternate-reverse;
        }
        
        .glitch-effect::after {
          left: -1px;
          text-shadow: 1px 0 rgba(34,211,238,0.7);
          animation: glitch-2 3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-1 {
          0% { clip-path: inset(20% 0 80% 0); }
          20% { clip-path: inset(60% 0 40% 0); }
          40% { clip-path: inset(40% 0 60% 0); }
          60% { clip-path: inset(80% 0 20% 0); }
          80% { clip-path: inset(10% 0 90% 0); }
          100% { clip-path: inset(30% 0 70% 0); }
        }
        
        @keyframes glitch-2 {
          0% { clip-path: inset(80% 0 20% 0); }
          20% { clip-path: inset(40% 0 60% 0); }
          40% { clip-path: inset(60% 0 40% 0); }
          60% { clip-path: inset(20% 0 80% 0); }
          80% { clip-path: inset(90% 0 10% 0); }
          100% { clip-path: inset(70% 0 30% 0); }
        }
      `}</style>
      <div
        className="h-screen w-full bg-cover bg-center relative flex justify-center items-center"
        style={{ backgroundImage: `url(${background}` }}
      >
        <div className="min-h-[600px] w-[880px] bg-gray-900 bg-opacity-90 rounded-xl border border-cyan-500 neon-border cyber-gradient backdrop-blur-sm flex flex-row justify-center items-center relative z-10">
          {/* 친구 검색해서 친구 추가
          <div className="mt-5">
            <FriendSearch friendList={friendList} />
          </div> */}
          {/* 커스텀 덱 영역 */}

          {creatorId === userId && (
            <div className="min-h-[600px] w-[30%] rounded-lg border-2 border-cyan-400 bg-gray-900 bg-opacity-80 flex justify-center items-center">
              <div className="h-[560px] w-[90%] border-2 border-cyan-400 rounded-lg flex flex-col">
                {/* Title */}
                <h1 className="text-cyan-500 text-center mt-4 mb-4 text-lg font-semibold">
                  원하는 커스텀 테마를 고르세요.
                </h1>

                {/* Custom Theme List - Fixed Height Container with Scroll */}
                <div
                  className="flex-1 w-full px-4 overflow-y-auto thin-scrollbar"
                  style={{ maxHeight: "calc(100% - 80px)" }}
                >
                  <div className="space-y-3 pb-4">
                    {customList?.map((customTheme, index) => (
                      <label
                        key={`${customTheme.customId}-${index}`}
                        className="p-3 bg-gray-800 rounded-lg border border-cyan-400 hover:border-cyan-300 transition-colors flex flex-col items-center gap-4 cursor-pointer"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-cyan-300 font-medium text-sm truncate">
                            {customTheme.customName}
                          </span>
                          <span className="text-gray-400 text-xs">
                            크리에이터: {customTheme.userNickName}
                          </span>
                        </div>
                        {/* Radio Button */}
                        <div className="flex justify-between gap-3 items-center">
                          <input
                            type="radio"
                            id={`theme-${customTheme.customId}`}
                            checked={selectedThemeId === customTheme.customId}
                            onChange={() =>
                              setSelectedThemeId(customTheme.customId)
                            }
                            className="w-5 h-5 text-cyan-500 border-cyan-400 focus:ring-cyan-500 accent-cyan-500"
                            name="customTheme"
                          />

                          {/* Image and Text */}
                          <div className="flex items-center gap-3 w-full">
                            {customTheme.customId !== -1 ? (
                              <img
                                src={customTheme.imageUrl}
                                alt={customTheme.customName}
                                className="w-16 h-16 object-cover rounded-md border border-gray-700"
                              />
                            ) : (
                              <div className="text-sm text-white">
                                신나는 우주 여행
                              </div>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center my-5 w-full">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-6 h-6 text-purple-500" />
              <h1
                className="text-cyan-500 text-4xl font-semibold glitch-effect neon-text"
                data-text={roomInfo.roomName}
              >
                {roomName}
              </h1>
              <Sparkles className="w-6 h-6 text-purple-500" />

              <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-full border border-purple-500/30">
                {/* 비밀방이면 자물쇠 걸려있고 */}
                {isPrivate && (
                  <LockKeyhole size={20} color="#ce47ff" strokeWidth={2.25} />
                )}
                {/* 아니면 열려있게 */}
                {!isPrivate && (
                  <LockKeyholeOpen
                    size={20}
                    color="#ce47ff"
                    strokeWidth={2.25}
                  />
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  <span className="text-white font-medium">
                    {playersInfo.length} / {roomInfo.maxPlayers}
                  </span>
                </div>
              </div>
            </div>

            {/* 플레이어 카드 */}
            <div className="w-full px-4 mb-8">
              <div className="flex justify-center gap-4 overflow-x-auto py-4 thin-scrollbar">
                {playersInfo.map((player, index) => (
                  <PlayerCard key={index} playerInfo={player} />
                ))}
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="w-full mt-auto mb-6">
              <div className="flex justify-center gap-6">
                {userId && creatorId && Number(userId) === Number(creatorId) ? (
                  // 방장인 경우
                  <div className="flex justify-center gap-4">
                    {Number(maxPlayers) === Number(playerLen) ? (
                      <div className="flex flex-row gap-3">
                        <button
                          className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          onClick={leaveTheRoom}
                        >
                          방 나가기
                        </button>
                        {isPrivate && (
                          <button
                            className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                            onClick={showChangePassword}
                          >
                            비밀번호 변경
                          </button>
                        )}
                        <button
                          className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          onClick={handlePutRoom}
                        >
                          게임방 수정
                        </button>
                        <button
                          className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          onClick={goToGame}
                        >
                          게임 시작
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-row gap-3">
                        <button
                          className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          onClick={leaveTheRoom}
                        >
                          방 나가기
                        </button>
                        {isPrivate && (
                          <button
                            onClick={showChangePassword}
                            className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          >
                            비밀번호 변경
                          </button>
                        )}
                        <button
                          className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          onClick={handlePutRoom}
                        >
                          게임방 수정
                        </button>
                        <button
                          className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                          onClick={handleAlertModal}
                        >
                          게임 시작
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // 방장이 아닌 경우
                  <div className="flex justify-center w-full">
                    <button
                      className="text-sm font-medium text-cyan-500 px-4 py-2 bg-gray-900 bg-opacity-70 border border-cyan-500 rounded-lg transition-colors duration-200 hover:bg-cyan-500 hover:text-white"
                      onClick={leaveTheRoom}
                    >
                      방 나가기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-[250px]">
          <WaitingChat roomId={roomId} players={playersInfo} />
        </div>
      </div>

      {showPutRoomModal && (
        <PutBurumabulRoom
          originRoomData={currentRoomInfo}
          onClose={() => setShowPutRoomModal(false)}
        />
      )}

      {showAlertModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-row justify-center items-center ">
            <PlayerAlertModal onClose={() => setShowAlertModal(false)} />
          </div>,
          document.body
        )}

      {isPrivate &&
        showPasswordModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-row justify-center items-center">
            <ChangePasswordModal
              onClick={showChangePassword}
              onClose={() => setShowPasswordModal(false)}
            />
          </div>,
          document.body
        )}

      {gameStatus === "GAME_END" &&
        isReviewModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-row justify-center items-center">
            <GameReviewModal
              isOpen={isReviewModalOpen}
              onClose={handleReviewClose}
              gameInfoId={2}
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default WaitingRoom;
