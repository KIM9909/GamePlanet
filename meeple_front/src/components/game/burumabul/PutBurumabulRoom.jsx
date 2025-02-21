import React, { useContext, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { putBurumabulRoom } from "../../../sources/api/BurumabulRoomAPI";
import { SocketContext } from "../../layout/SocketLayout";

const PutBurumabulRoom = ({ onClose, originRoomData }) => {
  console.log(originRoomData);
  const originData = originRoomData;
  const currentPlayers = Number(originData.players.length);

  const [roomData, setRoomData] = useState({
    roomName: originData.roomName,
    isPrivate: originData.private,
    isGameStart: false,
    maxPlayers: originData.maxPlayers,
  });

  const { connected, updateWaitingRoom } = useContext(SocketContext);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (connected) {
      try {
        updateWaitingRoom(roomData);
        onClose();
      } catch (error) {
        console.error("방 정보 변경 중 에러 :", error);
      }
    }
  };

  const handleCancel = () => {
    setRoomData(originData); // roomData 초기화
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-blue-200 bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-96 p-6 bg-gray-900 bg-opacity-80 rounded-lg flex flex-col justify-center items-center">
        <h1 className="text-3xl text-cyan-400 ">방 수정</h1>
        <hr className="w-80 border-t-2 border-white my-2" />
        <div className="bg-gray-900 bg-opacity-80 w-full py-3 my-3 rounded-lg">
          <form onSubmit={handleSubmit} className="text-center">
            {/* 방 제목 */}
            <div className="flex flex-col items-center ">
              <label
                className="text-xl block mt-2 text-cyan-400"
                htmlFor="roomTitle"
              >
                🎯 방 제목
              </label>
              <hr className="w-80 border-t-2 border-gray-400 my-2" />
              <input
                type="text"
                value={roomData.roomName}
                className="w-72 h-8 pl-3 pr-3 mx-3 min-w-0 rounded-lg bg-slate-400 outline-1 -outline-offset-1 outline-black has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-slate-600"
                onChange={(e) =>
                  setRoomData({ ...roomData, roomName: e.target.value })
                }
                required
              />
            </div>

            {/* 플레이어 수 선택 */}
            <div className="flex flex-col items-center my-5">
              <h2 className="text-lg text-cyan-400 ">👥 플레이어 수 선택</h2>
              <hr className="w-80 border-t-2 border-gray-400 my-2" />
              <div className="my-1">
                {currentPlayers <= 2 && (
                  <button
                    className={`bg-blue-200 text-gray-500 w-14 rounded mx-2 ${
                      roomData.maxPlayers === 2 ? "bg-cyan-400" : "bg-blue-200"
                    }`}
                    value={roomData.maxPlayers}
                    onClick={() =>
                      setRoomData((prevData) => ({
                        ...prevData,
                        maxPlayers: Number(2),
                      }))
                    }
                    type="button"
                  >
                    2인
                  </button>
                )}

                {currentPlayers <= 3 && (
                  <button
                    className={`bg-blue-200 text-gray-500 w-14 rounded mx-2 ${
                      roomData.maxPlayers === 3 ? "bg-cyan-400" : "bg-blue-200"
                    }`}
                    value={roomData.maxPlayers}
                    onClick={() =>
                      setRoomData((prevData) => ({
                        ...prevData,
                        maxPlayers: Number(3),
                      }))
                    }
                    type="button"
                  >
                    3인
                  </button>
                )}
                {currentPlayers <= 4 && (
                  <button
                    className={`bg-blue-200 text-gray-500 w-14 rounded mx-2 ${
                      roomData.maxPlayers === 4 ? "bg-cyan-400" : "bg-blue-200"
                    }`}
                    value={roomData.maxPlayers}
                    onClick={() =>
                      setRoomData((prevData) => ({
                        ...prevData,
                        maxPlayers: Number(4),
                      }))
                    }
                    type="button"
                  >
                    4인
                  </button>
                )}
              </div>
            </div>
            {/* 방 수정 or 취소 */}
            <div className="flex flex-row justify-evenly my-3">
              <button
                className="bg-gray-500  rounded-lg text-white w-24"
                onClick={handleCancel}
              >
                취소
              </button>
              {/* 수정 누르면 부루마불 대기방으로 */}
              <button
                className="bg-cyan-500 rounded-lg text-white w-24"
                onClick={handleSubmit}
                type="submit"
              >
                수정
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PutBurumabulRoom;
