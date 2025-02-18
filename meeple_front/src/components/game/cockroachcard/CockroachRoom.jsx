import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, CircleHelp, Search } from "lucide-react";
import { CockroachAPI } from "../../../sources/api/CockroachAPI";
import CreateRoomModal from "./modal/CreateRoomModal";
import RoomCard from "./RoomCard";
import GuideModal from "./modal/GuideModal";
import { fetchProfile } from "../../../sources/store/slices/ProfileSlice";

const CockroachRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isGuideModalOpen, setGuideModalOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const userId = useSelector((state) => state.user.userId);
  const profileData = useSelector((state) => state.profile.profileData);

  // 프로필 데이터 로딩
  useEffect(() => {
    if (userId) {
      dispatch(fetchProfile(userId));
    }
  }, [userId, dispatch]);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const roomList = await CockroachAPI.getAllRooms();
      setRooms(roomList);
    } catch (error) {
      console.error("방 목록 조회 오류:", error);
      setError("방 목록을 불러오는데 실패했습니다.");
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (roomData) => {
    try {
      setError(null);
      console.log("제발", roomData);
      
  
      if (!profileData?.userNickname) {
        throw new Error("로그인이 필요합니다.");
      }
  
      // 서버 요청 데이터 형식 맞추기
      const requestData = {
        gameId: 1,
        roomTitle: roomData.roomTitle,
        creator: profileData.userNickname,
        isPrivate: roomData.isPrivate || false,
        password: roomData.password || "",
        maxPeople: parseInt(roomData.maxPeople) || 4
      };
  
      const response = await CockroachAPI.createRoom(requestData);
  
      if (response.roomId) {
        sessionStorage.setItem(`room_${response.roomId}`, JSON.stringify({
          roomId: response.roomId,
          creator: profileData.userNickname,
          roomTitle: roomData.roomTitle,
          roomInfo: response.roomInfo || {}
        }));
  
        setCreateModalOpen(false);
        navigate(`/cockroach/${response.roomId}`);
      }
    } catch (error) {
      console.error("방 생성 오류:", error);
      setError(error.response?.data?.message || error.message || "방 생성에 실패했습니다.");
    }
  };

  const handleEnterRoom = async (room) => {
    try {
      if (!profileData?.userNickname) {
        throw new Error("로그인이 필요합니다.");
      }

      if (room.isPrivate) {
        // PasswordModal 처리는 RoomCard 컴포넌트 내에서 처리
        return;
      }

      await CockroachAPI.joinRoom({
        roomId: room.roomId,
        playerName: profileData.userNickname,
        password: ""
      });

      navigate(`/cockroach/${room.roomId}`);
    } catch (error) {
      console.error("방 입장 오류:", error);
      setError(error.message);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              바퀴벌레 포커
            </h1>
            <button 
              onClick={() => setGuideModalOpen(true)}
              className="text-yellow-300 hover:text-yellow-400 transition-colors"
            >
              <CircleHelp className="h-8 w-8 animate-pulse" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* 검색 */}
            <div className="relative">
              <input
                type="text"
                placeholder="방 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-gray-800 text-white rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         border border-blue-900"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>

            {/* 방 만들기 버튼 */}
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 transition-all duration-300 
                       transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              방 만들기
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 방 목록 */}
        <div className="bg-gray-900 bg-opacity-90 rounded-xl shadow-2xl p-8 border border-blue-900 min-h-[700px]">
          <div className="h-full overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-xl text-blue-300">방 목록을 불러오는 중...</div>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xl text-blue-300">
                  {searchTerm ? "검색 결과가 없습니다" : "현재 생성된 게임방이 없습니다"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard
                    key={room.roomId}
                    room={room}
                    onEnterRoom={handleEnterRoom}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />

      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
};

export default CockroachRoom;