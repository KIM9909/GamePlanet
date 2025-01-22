import React from "react"
import { useDispatch, useSelector } from "react-redux"
import { setModalOpen, logout } from "../../sources/api/store/slices/UserSlice"
import mainBackground from '../../assets/images/mainBackground.gif'

export const MainPageDown = ({ isFirstSection, onRegisterClick }) => {
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.user)

  // 로그아웃 처리 함수
  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div 
      className={`fixed inset-0 w-full h-full transition-transform duration-1000 ease-in-out flex items-center justify-center`}
      style={{ 
        backgroundImage: `url(${mainBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transform: `translateY(${isFirstSection ? '100%' : '0'})` // 섹션 전환 애니메이션
      }}
    >
      {/* 버튼 영역 */}
      <div className="flex justify-center gap-4">
        {!token ? (
          <>
            <button
              onClick={() => dispatch(setModalOpen(true))}
              className="inline-block w-40 px-8 py-4 text-white text-xl font-semibold rounded-3xl 
              bg-[#FFE4CB] bg-opacity-45 border-2 border-white/30
              hover:bg-opacity-60 hover:border-white/50 
              transition-all duration-300 
              shadow-lg hover:shadow-[#FFE4CB]/30"
            >
              LOGIN
            </button>
            <button 
              onClick={onRegisterClick}
              className="inline-block w-40 px-8 py-4 text-white text-xl font-semibold rounded-3xl  
              bg-[#FFE4CB] bg-opacity-45 border-2 border-white/30
              hover:bg-opacity-60 hover:border-white/50 
              transition-all duration-300 
              shadow-lg hover:shadow-[#FFE4CB]/30"
            >
              SIGNUP
            </button>
          </>
        ) : (
          <button
            onClick={handleLogout}
            className="text-white border rounded-lg"
          >
            LOGOUT
          </button>
        )}
      </div>
    </div>
  );
};