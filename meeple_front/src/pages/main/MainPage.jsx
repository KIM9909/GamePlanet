import { useDispatch, useSelector } from "react-redux"
import React from "react"
import { setModalOpen, logout } from "../../sources/api/store/slices/UserSlice"
import LoginModal from "../../components/user/LoginModal"
import { useState } from "react"
import RegisterModal from "../../components/user/RegisterModal"
// 실험용 - 희준
import GameSidebar from "../../components/sidebar/GameSidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Menu, X } from 'lucide-react';

const MainPage = () => {
  const dispatch = useDispatch()
  // 회원가입 모달의 표시 상태 관리
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Redux store에서 token 상태를 가져옴 (로그인 상태 확인용)
  const { token } = useSelector((state) => state.user)

  //실험용-희준
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  
  // 로그아웃 처리 핸들러
  // 리덕스의 logout 액션을 디스패치하여 토큰 제거거
  const handleLogout = () => {
    dispatch(logout())
  }

  //실험용-희준
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 실험용-희준준 */}
      <div className="fixed left-0 top-0 h-full z-50 flex">
        <div
          className={`transition-transform duration-300 ease-in-out transform 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            relative`} 
        >
          <GameSidebar />
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute -right-12 top-1/2 -translate-y-1/2 w-12 h-12 
              bg-gray-800 rounded-r text-white
              hover:bg-gray-700 focus:outline-none 
              flex items-center justify-center
              shadow-lg"
            >
              <X className="w-8 h-8" />
            </button>
          )}
        </div>
        
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 
            bg-gray-800 rounded-r text-white
            hover:bg-gray-700 focus:outline-none 
            flex items-center justify-center
            shadow-lg"
          >
            <Menu className="w-8 h-8" />
          </button>
        )}
      </div>
      {/*  */}


      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meeple</h1>
        </div>
      </header>

      <div className="flex justify-center">
        {!token ? (
          // 로그인하지 않은 경우
          <>
            <button
              onClick={() => dispatch(setModalOpen(true))}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              로그인
            </button>
            <button 
              onClick={() => setIsRegisterModalOpen(true)}
              className="ml-5 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              회원가입
            </button>
          </>
        ) : (
          // 로그인된 경우
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            로그아웃
          </button>
        )}

        <LoginModal />
        <RegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
        />
      </div>
    </div>
  )
}

export default MainPage