import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import background from "../../../../assets/burumabul_images/waitingroom.gif";
import PlayerCard from "./PlayerCard";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import FriendSearch from "../../FriendSearch";
import { connect, useDispatch, useSelector } from "react-redux";
import { putBurumabulRoom } from "../../../../sources/api/BurumabulRoomAPI";
import PutBurumabulRoom from "../PutBurumabulRoom";
import PlayerAlertModal from "./PlayerAlertModal";
import { createPortal } from "react-dom";
import { fetchFriendList } from "../../../../sources/api/FriendApi";

// 백엔드 연결 필요
const WaitingRoom = () => {
  const userId = Number(useSelector((state) => state.user.userId));
  console.log(userId);

  const navigate = useNavigate();
  const location = useLocation();
  const roomInfo = location.state?.roomInfo;

  const [friendList, setFriendList] = useState(null);

  useEffect(() => {
    try {
      const response = fetchFriendList(userId);
      setFriendList(response);
    } catch (error) {
      console.log("친구 목록 로드 중 에러");
    }
  });

  // const roomInfo = {
  //   roomId: 1,
  //   roomName: "보드찌개 시작해볼까!",
  //   createTime: "2025-02-02T18:14:34.803Z",
  //   creator: {
  //     playerId: 13,
  //     playerName: "성수컨님",
  //     position: 0,
  //     balance: 0,
  //     seedCertificateCardOwned: ["string"],
  //   },
  //   maxPlayers: 4,
  //   players: [
  //     {
  //       playerId: 1,
  //       playerName: "성수컨님",
  //       position: 0,
  //       balance: 0,
  //       seedCertificateCardOwned: ["string"],
  //     },
  //     {
  //       playerId: 2,
  //       playerName: "희준찌개",
  //       position: 0,
  //       balance: 0,
  //       seedCertificateCardOwned: ["string"],
  //     },
  //     {
  //       playerId: 3,
  //       playerName: "짼 팀장",
  //       position: 0,
  //       balance: 0,
  //       seedCertificateCardOwned: ["string"],
  //     },
  //     {
  //       playerId: 4,
  //       playerName: "현범 프님",
  //       position: 0,
  //       balance: 0,
  //       seedCertificateCardOwned: ["string"],
  //     },
  //   ],
  //   gameStart: false,
  //   private: true,
  // };

  console.log(roomInfo);
  const playersInfo = roomInfo.players;
  const roomName = roomInfo.roomName;
  const creatorId = Number(roomInfo.creator.playerId);
  console.log("creatorId", creatorId);
  const creatorName = roomInfo.creator.playerName;
  const isPrivate = roomInfo.private;
  const maxPlayers = roomInfo.maxPlayers;
  const playerLen = roomInfo.players.length;

  console.log(playersInfo);

  const [showPutRoomModal, setShowPutRoomModal] = useState(false);

  const handlePutRoom = () => {
    setShowPutRoomModal(true);
  };

  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleAlertModal = () => {
    setShowAlertModal(true);
  };

  const goToGame = async () => {
    if (roomInfo) {
      try {
        await navigate(`/game/burumabul/start/${roomInfo.roomId}`, {
          state: { roomId: roomInfo.roomId },
        });
      } catch (error) {
        console.error("게임 방 이동 중 오류 발생 :", error);
      }
    }
  };

  return (
    <>
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 5px; padding-right: 12px; position: absolute; right: 0;}
        .thin-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 15px;}
        .thin-scrollbar::-webkit-scrollbar-track { display: none; }
        .thin-scrollbar {padding-right: 10px;}
      `}</style>
      <div
        className="h-screen w-full bg-cover bg-center relative flex justify-center items-center"
        style={{ backgroundImage: `url(${background}` }}
      >
        <div className="h-[600px] w-[1000px] bg-white bg-opacity-70 rounded-lg flex flex-col justify-start items-center">
          {/* 친구 검색해서 친구 추가 */}
          <div className="mt-5">
            <FriendSearch friendList={friendList} />
          </div>
          <div className="flex flex-col items-center my-5">
            <div className="flex flex-row justify-center items-center mt-5">
              <h1 className="text-3xl mx-2 text-center break-words w-[400px] truncate">
                {roomName}
              </h1>
              <span className="mx-2">
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
              </span>
              <span className="mx-1 ">
                {playerLen} / {maxPlayers}
              </span>
            </div>

            {/* 플레이어 카드 */}
            <div className="mt-10 mx-auto flex flex-wrap justify-center gap-6 my-4 overflow-y-auto thin-scrollbar">
              {playersInfo.map((player, index) => (
                <PlayerCard key={index} playerInfo={player} />
              ))}
            </div>

            {/* 하단 버튼 */}
            <div className="w-full flex flex-row justify-between my-10 px-10">
              <button
                className="relative overflow-hidden text-lg font-semibold text-white mx-10 bg-gradient-to-r from-red-400 to-red-500 border-2 border-red-600 w-32 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:opacity-20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-all before:duration-700"
                onClick={() => navigate("/home")}
              >
                방 나가기
              </button>
              {userId && creatorId && Number(userId) === Number(creatorId) ? (
                <div>
                  {Number(maxPlayers) === Number(playerLen) ? (
                    <div className="flex flex-row">
                      <button
                        className="relative overflow-hidden text-lg font-semibold text-white mx-5 bg-gradient-to-r from-yellow-200 to-yellow-500 border-2 border-yellow-600 w-32 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:opacity-20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-all before:duration-700"
                        onClick={handlePutRoom}
                      >
                        게임방 수정
                      </button>
                      <button
                        className="relative overflow-hidden text-lg font-semibold text-white mx-10 bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-blue-600 w-32 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:opacity-20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-all before:duration-700"
                        onClick={goToGame}
                      >
                        게임 시작
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-row">
                      <button
                        className="relative overflow-hidden text-lg font-semibold text-white mx-5 bg-gradient-to-r from-yellow-200 to-yellow-500 border-2 border-yellow-600 w-32 h-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white before:opacity-20 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-all before:duration-700"
                        onClick={handlePutRoom}
                      >
                        게임방 수정
                      </button>
                      <button
                        className="text-lg text-white mx-10 bg-gray-500 border-2 w-32 h-12 rounded "
                        onClick={handleAlertModal}
                      >
                        게임 시작
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>게임준비</div>
              )}

              {showPutRoomModal && (
                <PutBurumabulRoom
                  originRoomData={roomInfo}
                  onClose={() => setShowPutRoomModal(false)}
                />
              )}

              {showAlertModal &&
                createPortal(
                  <div className="fixed inset-0 z-50 flex flex-row justify-center items-center ">
                    <PlayerAlertModal
                      className=""
                      onClose={() => setShowAlertModal(false)}
                    />
                  </div>,
                  document.body
                )}

              {/* <button className="mx-3">게임 준비</button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitingRoom;
