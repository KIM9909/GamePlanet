import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../sources/api/store/slices/UserSlice';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    </div>
  );
};

export default HomePage;