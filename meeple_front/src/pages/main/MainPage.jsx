import React, { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import LoginModal from "../../components/user/LoginModal"
import RegisterModal from "../../components/user/RegisterModal"
import { MainPageUp } from "./MainPageUp"
import { MainPageDown } from "./MainPageDown"

const MainPage = () => {
  const [isFirstSection, setIsFirstSection] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const [showScrollDown, setShowScrollDown] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const scrollDownTimeoutRef = useRef(null)
  
  const { token } = useSelector((state) => state.user)
  
  useEffect(() => {
    if (token) {
      setIsFirstSection(false)
    }
  }, [token])

  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return
      
      setIsScrolling(true)
      if (e.deltaY > 0 && isFirstSection) {
        setIsFirstSection(false)
      } else if (e.deltaY < 0 && !isFirstSection) {
        setIsFirstSection(true)
      }
      
      setTimeout(() => {
        setIsScrolling(false)
      }, 1000)
    }

    window.addEventListener('wheel', handleWheel)
    return () => {
      window.removeEventListener('wheel', handleWheel)
      if (scrollDownTimeoutRef.current) {
        clearTimeout(scrollDownTimeoutRef.current)
      }
    }
  }, [isFirstSection, isScrolling])

  const handleLastTextComplete = () => {
    scrollDownTimeoutRef.current = setTimeout(() => {
      setShowScrollDown(true)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Meeple</h1>
        </div>
      </header>

      <div className="h-screen overflow-hidden">
        <MainPageUp
          isFirstSection={isFirstSection}
          showScrollDown={showScrollDown}
          onLastTextComplete={handleLastTextComplete}
        />
        
        <MainPageDown
          isFirstSection={isFirstSection}
          onRegisterClick={() => setIsRegisterModalOpen(true)}
        />

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