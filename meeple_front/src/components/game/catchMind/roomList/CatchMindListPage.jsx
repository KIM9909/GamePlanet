import React, { useState, useEffect } from "react";
import { Lock, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CatchMindAPI } from "../../../../sources/api/CatchMindAPI";
import CatchMindCreateRoomModal from "./CatchMindCreateRoomModal";
import CatchMindPasswordModal from "./CatchMindPasswordModal";

const CatchMindListPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      const roomDetails = await CatchMindAPI.getRoomList();
      const cleanedRooms = roomDetails.map((room) => ({
        ...room,
        players: Array.isArray(room.players)
          ? [...new Set(room.players.filter(Boolean))]
          : [],
      }));
      setRooms(cleanedRooms);
    } catch (error) {
      console.error("방 목록 가져오기 실패:", error);
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEnterRoom = async (room) => {
    try {
      const userNickname = localStorage.getItem("userNickname");

      if (room.isPrivate) {
        setSelectedRoom(room);
        setIsPasswordModalOpen(true);
      } else {
        await CatchMindAPI.joinRoom(room.roomId, userNickname);
        navigate(`/catch-mind/${room.roomId}`);
      }
    } catch (error) {
      console.error("방 입장 실패:", error);
    }
  };

  const handleSuccessfulEntry = (roomId) => {
    navigate(`/catch-mind/${roomId}`);
  };

  return (
    <div className="container mx-auto p-3">
      <div className="flex justify-between items-center mb-8">
        <h1 className="mt-2 ml-2 text-2xl font-bold text-white">
          캐치마인드 게임방
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />방 만들기
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="bg-gray-200 h-32 flex items-center justify-center">
              <span className="text-gray-500">Game Image</span>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{room.roomTitle}</h3>
                {room.isPrivate && <Lock size={18} className="text-gray-600" />}
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  <span>
                    {room.players.length}/{room.maxPeople}
                  </span>
                </div>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    room.isGameStart
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {room.isGameStart ? "게임 중" : "대기 중"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  방장: {room.creator}
                </span>
                <button
                  onClick={() => handleEnterRoom(room)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  입장하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CatchMindCreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          fetchRooms(); // 방 생성 후 목록 갱신
        }}
      />

      {selectedRoom && (
        <CatchMindPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setSelectedRoom(null);
          }}
          roomId={selectedRoom.roomId}
          roomTitle={selectedRoom.roomTitle}
          onSuccessfulEntry={handleSuccessfulEntry}
        />
      )}
    </div>
  );
};

export default CatchMindListPage;
