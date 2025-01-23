import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../sources/api/store/slices/UserSlice';
import { useNavigate } from 'react-router-dom';
import CreateRoomModal from '../../components/game/CreateRoomModal';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCreateRoomModalOpen, setCreateRoomModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen relative">
      {/* 상단 우측에 로그아웃 버튼 배치 */}
      <div className="absolute top-6 left-10">
        <button
          onClick={handleLogout}
          className="group relative w-44 px-8 py-4 text-white text-2xl font-semibold rounded-md 
          bg-[rgb(1,1,1)] bg-opacity-30 backdrop-blur-sm
          hover:bg-opacity-50
          transition-all duration-300
          shadow-lg hover:shadow-[#FFE4CB]/30"
        >
          <span className="relative z-10">LOGOUT</span>
        </button>
      </div>

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
              
              {/* 추후 다른 게임들 추가 가능 */}
            </div>
          </div>
        </div>
      </div>

      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setCreateRoomModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;