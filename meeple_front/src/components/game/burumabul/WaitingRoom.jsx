import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import background from "../../../assets/burumabul_images/waitingroom.jpg";
import PlayerCard from "./PlayerCard";
// 백엔드 연결 필요
const WaitingRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roomInfo = location.state?.roomInfo;
  const playersInfo = roomInfo.players;

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
        <div className="h-[90%] w-[80%] bg-white bg-opacity-50 flex flex-col justify-start items-center">
          <h1 className="text-3xl mt-10 mb-5 text-center break-words">
            신나는 우주여행! 미플에서 함께 떠나요!
          </h1>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-auto gap-6 my-4 overflow-y-auto thin-scrollbar">
            {playersInfo.map((player, index) => (
              <PlayerCard key={index} playerInfo={player} />
            ))}
          </div>
          <div className="w-full flex flex-row justify-between my-14">
            <button className="text-lg mx-10 bg-red-500 border-2 w-32 h-12 rounded">
              방 나가기
            </button>
            {/* 방장이고 모두 게임 준비가 되면 게임시작 버튼이 활성화 */}
            {/* 방장이 아니면 게임 준비 버튼. 누르면 활성화 */}
            <button
              className="text-lg mx-10 bg-green-500 border-2 w-32 h-12 rounded "
              onClick={() => {
                navigate("/game/burumabul/start");
              }}
            >
              게임 시작
            </button>
            {/* <button className="mx-3">게임 준비</button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default WaitingRoom;
