import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoomModal from "../../components/game/cockroachcard/modal/CreateRoomModal";
import { createPortal } from "react-dom";
import BurumabulRoomCreateModal from "../../components/game/burumabul/BurumabulRoomCreateModal";
import FriendModal from "../../components/friend/FriendModal";
import { useSelector, useDispatch } from "react-redux";
import RoomList from "../../components/game/cockroachcard/RoomList";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);

  // 부루마불
  const [isCreateBurumabulRoomModalOpen, setIsCreateBurumabulRoomModalOpen] =
    useState(false);

  const userId = useSelector((state) => state.user.userId);
  console.log(userId);

  const handleCreateRoom = async (roomData) => {
    console.log("roomData:", roomData);
    try {
      const response = await fetch(
        `http://localhost:8090/game/create-room`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roomData),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`서버 오류: ${response.status} - ${responseText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      navigate(`/game/cockroach/${data.roomId}`);
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`방 생성 실패: ${error.message}`);
    }
  };

  // 부루마불 방생성 -> 후에 백엔드와 연결 예정
  const handleCreateBurumabulRoom = () => {
    navigate("/game/burumabul/waitingroom");
  };

  return (
    <div className="min-h-screen relative">
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">게임 목록</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 바퀴벌레 포커 */}
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
              <RoomList/>

              {/* 부루마불 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">부루마불</h2>
                <p className="text-gray-600 mb-4">
                  친구들과 함께 떠나는 미플만의 우주여행!
                </p>
                <button
                  onClick={() => setIsCreateBurumabulRoomModalOpen(true)}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  방 만들기
                </button>
              </div>

              {/* 캐치마인드 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">캐치마인드</h2>
                <p className="text-gray-600 mb-4">
                  폭풍을 부르는 그림 그림 대소동 퀴즈 작전!
                </p>
                <div className="flex gap-4 justify-between">
                  <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    게임 정보
                  </button>
                  <button
                    onClick={() => navigate("/catch-mind")}
                    className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    게임 보기
                  </button>
                </div>
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

      {/* 부루마불 */}
      {isCreateBurumabulRoomModalOpen &&
        createPortal(
          <BurumabulRoomCreateModal
            onClose={() => setIsCreateBurumabulRoomModalOpen(false)}
          />,
          document.body
        )}
    </div>
  );
};

export default HomePage;
