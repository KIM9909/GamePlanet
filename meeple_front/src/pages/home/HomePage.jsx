import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoomModal from "../../components/game/CreateRoomModal";

const HomePage = () => {
  const navigate = useNavigate();
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);

  const handleCreateRoom = async (roomData) => {
    try {
      const response = await fetch(
        `http://localhost:8090/api/game/create-room?roomId=${roomData.roomName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const pk = await response.text();
      navigate(`/game/cockroach/${pk}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">게임 목록</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">바퀴벌레 포커</h2>
                <p className="text-gray-600 mb-4">
                  블러핑과 심리전이 핵심인 카드게임입니다.
                </p>
                <button
                  onClick={() => setCreateRoomModalOpen(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  방 만들기
                </button>
              </div>
            </div>
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

export default HomePage;
