import { useDispatch } from "react-redux"
import React from "react"
import { setModalOpen } from "../../sources/api/store/slices/UserSlice"
import LoginModal from "../../components/user/LoginModal"

const MainPage = () => {
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meeple</h1>
        </div>
      </header>
      <button
        onClick={() => dispatch(setModalOpen(true))}
        className="px-4 py-2 bg-blue-500 text-white rouded-md hover:bg-blue-600"
      >
        로그인
      </button>
      <LoginModal />
    </div>
  )
}

export default MainPage