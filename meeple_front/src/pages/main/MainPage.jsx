import { useDispatch, useSelector } from "react-redux"
import React from "react"
import { setModalOpen, logout } from "../../sources/api/store/slices/UserSlice"
import LoginModal from "../../components/user/LoginModal"
import { useState } from "react"
import RegisterModal from "../../components/user/RegisterModal"

const MainPage = () => {
  const dispatch = useDispatch()
  // 회원가입 모달의 표시 상태 관리
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)

  // Redux store에서 token 상태를 가져옴 (로그인 상태 확인용)
  const { token } = useSelector((state) => state.user)
  
  // 로그아웃 처리 핸들러
  // 리덕스의 logout 액션을 디스패치하여 토큰 제거거
  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="min-h-screen bg-gray-100">
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