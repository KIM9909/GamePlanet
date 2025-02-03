import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import background from "../../../../assets/burumabul_images/waitingroom.gif";
import PlayerCard from "./PlayerCard";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import FriendSearch from "../../FriendSearch";
import { useDispatch, useSelector } from "react-redux";
import { putBurumabulRoom } from "../../../../sources/api/BurumabulRoomAPI";
import PutBurumabulRoom from "../PutBurumabulRoom";
import PlayerAlertModal from "./PlayerAlertModal";
import { createPortal } from "react-dom";

// 백엔드 연결 필요
const WaitingRoom = () => {
  const userId = Number(useSelector((state) => state.user.userId));
  console.log(userId);
  const navigate = useNavigate();
  const location = useLocation();
  // const roomInfo = location.state?.roomInfo;
  // const playersInfo = roomInfo.players;
  const roomInfo = [
    {
      roomId: 1,
      roomName: "시작해볼까! 덕진이랑 은수",
      createTime: "2025-02-02T18:14:34.803Z",
      creator: {
        playerId: 1,
        playerName: "은수",
        position: 0,
        balance: 0,
        seedCertificateCardOwned: ["string"],
      },
      maxPlayers: 4,
      players: [
        {
          playerId: 1,
          playerName: "은수",
          position: 0,
          balance: 0,
          seedCertificateCardOwned: ["string"],
        },
        {
          playerId: 2,
          playerName: "덕진",
          position: 0,
          balance: 0,
          seedCertificateCardOwned: ["string"],
        },
        {
          playerId: 3,
          playerName: "은수2",
          position: 0,
          balance: 0,
          seedCertificateCardOwned: ["string"],
        },
        // {
        //   playerId: 4,
        //   playerName: "덕진2",
        //   position: 0,
        //   balance: 0,
        //   seedCertificateCardOwned: ["string"],
        // },
      ],
      gameStart: false,
      private: true,
    },
  ];
  const roomName = roomInfo[0].roomName;
  const creatorId = Number(roomInfo[0].creator.playerId);
  console.log("creatorId", creatorId);
  const creatorName = roomInfo[0].creator.playerName;
  const playersInfo = roomInfo[0].players;
  const isPrivate = roomInfo[0].private;
  const maxPlayers = roomInfo[0].maxPlayers;
  const playerLen = roomInfo[0].players.length;

  console.log(playersInfo);

  const [showPutRoomModal, setShowPutRoomModal] = useState(false);

  const handlePutRoom = () => {
    setShowPutRoomModal(true);
  };

  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleAlertModal = () => {
    setShowAlertModal(true);
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
            <FriendSearch />
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
                        onClick={() => {
                          navigate("/game/burumabul/start");
                        }}
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
                <div>아무것도 안 떠</div>
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
