import React from "react";
import { LockKeyhole } from "lucide-react";

const BurumabulRoomListCard = ({ roomInfo }) => {
  console.log(roomInfo);

  return (
    <div className="flex justify-center items-center border-4 border-indigo-900 bg-white rounded-lg w-[400px] h-[120px] mx-2">
      <div className="flex items-center justify-between p-4 border-4 border-indigo-900 rounded-lg w-[350px] h-[80px]">
        <div>
          <div className="text-xl flex">
            <div>Room.{roomInfo.roomId}</div>
            <div className="mx-3">{roomInfo.roomName}</div>
          </div>
          <div>방장 : {roomInfo.creator.playerName}</div>
        </div>
        <div className="flex items-center ">
          <div className="mx-4 text-lg">
            {roomInfo.players.length}/{roomInfo.maxPlayers}
          </div>
          {!roomInfo.private ? (
            <button className="bg-indigo-800 text-white w-[50px] h-[50px] flex justify-center items-center rounded-lg">
              입장
            </button>
          ) : (
            <button className="bg-indigo-800 w-[52px] h-[52px] flex justify-center items-center rounded-lg">
              <LockKeyhole size={44} color="#ffffff" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BurumabulRoomListCard;
