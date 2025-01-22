import React, { useState, useEffect, useRef } from "react"
import LoginModal from "../../components/user/LoginModal"
import RegisterModal from "../../components/user/RegisterModal"
import { MainPageUp } from "./MainPageUp"
import { MainPageDown } from "./MainPageDown"

const MainPage = () => {
  // 현재 보여지는 섹션 상태 (첫 번째/두 번째)
  const [isFirstSection, setIsFirstSection] = useState(true)
  // 스크롤 애니메이션 진행 중 여부
  const [isScrolling, setIsScrolling] = useState(false)
  // 스크롤 다운 인디케이터 표시 여부
  const [showScrollDown, setShowScrollDown] = useState(false)
  // 회원가입 모달 표시 여부 상태
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  // 스크롤 다운 타이머 참조
  const scrollDownTimeoutRef = useRef(null);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleWheel = (e) => {
      // 스크롤 애니메이션 중복 방지
      if (isScrolling) return;
      
      setIsScrolling(true);
      // 스크롤 방향에 따라 섹션 전환
      if (e.deltaY > 0 && isFirstSection) {
        setIsFirstSection(false);
      } else if (e.deltaY < 0 && !isFirstSection) {
        setIsFirstSection(true);
      }
      
      // 스크롤 잠금 해제 타이머
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }

    window.addEventListener('wheel', handleWheel);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (scrollDownTimeoutRef.current) {
        clearTimeout(scrollDownTimeoutRef.current);
      }
    };
  }, [isFirstSection, isScrolling]);

  // 마지막 텍스트 타이핑 완료 후 스크롤 다운 표시
  const handleLastTextComplete = () => {
    scrollDownTimeoutRef.current = setTimeout(() => {
      setShowScrollDown(true);
    }, 500);
  };

  return (
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
  );
};

export default MainPage;