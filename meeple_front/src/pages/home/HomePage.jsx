import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoomModal from "../../components/game/cockroachcard/modal/CreateRoomModal";
import { createPortal } from "react-dom";
import BurumabulRoomCreateModal from "../../components/game/burumabul/BurumabulRoomCreateModal";
import FriendModal from "../../components/friend/FriendModal";
import { useSelector, useDispatch } from "react-redux";

import GameCard from "../../components/game/GameCard";
import CockroachPokerRoyalMainImg from "../../assets/images/games/MainImage/Cockroach_Poker_Royal.webp";
import BurumabulMainImg from "../../assets/images/games/MainImage/BuruMabul.png";
import CatchMindMainImg from "../../assets/images/games/MainImage/CatchMind.jpg";

import RoomList from "../../components/game/cockroachcard/RoomList";
import { setRoomData } from "../../sources/store/slices/CockroachSlice";

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);

  // 부루마불
  const [isCreateBurumabulRoomModalOpen, setIsCreateBurumabulRoomModalOpen] =
    useState(false);

  const userId = useSelector((state) => state.user.userId);

  useEffect(() => {
    const path = window.location.pathname;
    // 게임 페이지가 아닐 때만 체크
    if (!userId && !path.includes('/game/')) {
      navigate("/"); 
      return;
    }
  }, [userId, navigate]);

  // const handleLogout = () => {
  //   dispatch(logout());
  //   navigate("/");
  // };

  console.log(userId);

  const handleCreateRoom = async (roomData) => {
    try {
      console.log("방 생성 시작", roomData.roomTitle);
  
      const response = await fetch("http://localhost:8090/game/create-room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),  // roomData를 그대로 전송
      });
  
      const data = await response.json();
      console.log("--------------");
      console.log("전송된 roomData:", roomData);
      console.log("creator 닉네임:", roomData.creator);
      console.log("--------------");
      console.log("서버 응답 데이터:", data);
      
      if (response.ok) {
        dispatch(
          setRoomData({
            ...data,
            creator: roomData.creator,  // 닉네임 유지
            roomTitle: roomData.roomTitle,
          })
        );
  
        navigate(`/game/cockroach/${data.roomId}`);
      }
    } catch (error) {
      console.error("방 생성 오류:", error);
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

              <GameCard
                imgUrl={CockroachPokerRoyalMainImg}
                title={"바퀴벌레포커"}
                description={"블러핑과 심리전이 핵심인 카드게임입니다."}
              />

              {/* 부루마불 */}
              {/* <div className="bg-gray-50 p-6 rounded-lg shadow">
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
                </div> */}

              <GameCard
                imgUrl={BurumabulMainImg}
                title={"부루마블"}
                description={"친구들과 함께 떠나는 미플만의 우주여행!"}
              />

              {/* 캐치마인드 */}
              {/* <div className="bg-gray-50 p-6 rounded-lg shadow">
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
                </div> */}

              <GameCard
                imgUrl={CatchMindMainImg}
                title={"캐치마인드"}
                description={"폭풍을 부르는 그림 그림 대소동 퀴즈 작전!"}
              />

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
            <RoomList />
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
