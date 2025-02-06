import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRoomData } from "../../../sources/store/slices/CockroachSlice";
import CreateRoomModal from "./modal/CreateRoomModal";
import RoomList from "./RoomList";

const CockroachRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);

  const handleCreateRoom = async (roomData) => {
    try {
      console.log("방 생성 시작", roomData.roomTitle);
  
      const response = await fetch("http://localhost:8090/game/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        dispatch(
          setRoomData({
            ...data,
            creator: roomData.creator,
            roomTitle: roomData.roomTitle,
          })
        );
  
        navigate(`/game/cockroach/${data.roomId}`);
      }
    } catch (error) {
      console.error("방 생성 오류:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">바퀴벌레 포커</h1>
          <div className="bg-gray-50 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">방 만들기</h2>
            <p className="text-gray-600 mb-4">
              새로운 게임방을 만들어 친구들과 함께 플레이하세요!
            </p>
            <button
              onClick={() => setCreateRoomModalOpen(true)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              방 만들기
            </button>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">현재 진행중인 방</h2>
            <RoomList />
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setCreateRoomModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
};

export default CockroachRoom;
