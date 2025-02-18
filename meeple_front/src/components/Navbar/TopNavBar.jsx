import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../sources/store/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import Twinkle from "../../assets/images/decorate_twinkle.png";
import { Bell, Menu, X, Settings } from "lucide-react";

import EunSoo from "../../assets/images/pixel_character/pixel-eunsoo.png";
import HeeJun from "../../assets/images/pixel_character/pixel-heejun.png";
import HongBeom from "../../assets/images/pixel_character/pixel-hongbeom.png";
import JaeEun from "../../assets/images/pixel_character/pixel-jaeeun.png";
import JinHyuk from "../../assets/images/pixel_character/pixel-jinhyuk.png";
import SungHyun from "../../assets/images/pixel_character/pixel-sunghyun.png";
import NotificationList from "../notification/NotificationList";
import SettingsPopup from "./SettingsPopup";
import { FriendSocketContext } from "../layout/FriendSocketLayout";

const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ left: 0, top: 0 });
  const characterRefs = useRef([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const { token, userRole } = useSelector((state) => state.user);

  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  const friendSocket = useContext(FriendSocketContext);

  const { connected, responseSocket, stompClientRef } = friendSocket;

  const [notificationList, setNotificationList] = useState([]);
  const [isShowNotifi, setIsShowNotifi] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const notificationRef = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const characterInfo = {
    0: {
      name: "은수",
      role: "Front-end",
      description: "부루마불 부술까?",
    },
    1: {
      name: "희준",
      role: "Front-end",
      description: "보드찌개 먹고싶을게",
    },
    2: {
      name: "진혁",
      role: "Front-end",
      description: "프론트는 처음이라",
    },
    3: {
      name: "홍범",
      role: "Full-stack",
      description: "할 게 너무 많아 살려줘",
    },
    4: {
      name: "재은",
      role: "Back-end",
      description: "내 AI 맛 좀 볼래,,?",
      downloadLink:
        "https://meeple-file-server-2.s3.ap-northeast-2.amazonaws.com/static-files/Meeple+Setup+1.4.5.exe",
    },
    5: { name: "성현", role: "Back-end", description: "내 새끼 돌려줘요 .." },
  };

  // 외부 클릭 감지 핸들러
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsShowNotifi(false);
      }
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setSelectedCharacter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 캐릭터 선택시 팝업 위치 계산
  useEffect(() => {
    if (
      selectedCharacter !== null &&
      characterRefs.current[selectedCharacter]
    ) {
      const characterRect =
        characterRefs.current[selectedCharacter].getBoundingClientRect();
      const navbarRect = navbarRef.current.getBoundingClientRect();

      setPopupPosition({
        left: characterRect.left + characterRect.width / 2,
        top: characterRect.bottom - navbarRect.top + 10,
      });
    }
  }, [selectedCharacter]);

  // 소켓 연결 관리
  useEffect(() => {
    if (connected) {
      return
    } else {
      if (stompClientRef?.current) {
        const reconnectSocket = async () => {
          try {
            await stompClientRef.current.activate();
          } catch (error) {
            return error
          }
        };
        reconnectSocket();
      }
    }
  }, [connected, stompClientRef]);

  // 알림 처리
  useEffect(() => {
    if (responseSocket) {
      try {
        setNotificationList((prevList) => {
          const updatedList = [...prevList, responseSocket];
          setNotificationCount(updatedList.length);
          return updatedList;
        });
      } catch (error) {
        return error
      }
    }
  }, [responseSocket]);

  const showNotifi = () => {
    setIsShowNotifi(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav
      ref={navbarRef}
      className="fixed top-0 left-0 right-0 z-50 bg-gray-900/40 text-white p-1 shadow-xl"
    >
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-between items-center">
          {/* Logo */}
          <div className="flex-1">
            <div className="flex items-center">
              <Link
                to="/home"
                className="text-[38px] font-bold transition-all duration-300 hover:text-cyan-300"
                style={{
                  textShadow:
                    "0 0 20px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.4), 0 0 30px rgba(0, 255, 255, 0.2)",
                  letterSpacing: "1px",
                }}
              >
                GAME PLANET
              </Link>
              <span className="ml-3 w-[60px]">
                <img src={Twinkle} alt="반짝이" className="w-full h-full" />
              </span>
            </div>
          </div>
          {/* Character Icons */}
          <div className="flex-1 flex justify-center space-x-9">
            {[EunSoo, HeeJun, JinHyuk, HongBeom, JaeEun, SungHyun].map(
              (character, index) => (
                <div
                  key={index}
                  ref={(el) => (characterRefs.current[index] = el)}
                  className="w-12 h-12 cursor-pointer relative"
                  style={{
                    textShadow:
                      "0 0 20px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)",
                    filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
                  }}
                  onClick={() =>
                    setSelectedCharacter(
                      selectedCharacter === index ? null : index
                    )
                  }
                >
                  <img
                    src={character}
                    alt={`Character ${index + 1}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.classList.remove("jump-animation");
                      void e.currentTarget.offsetWidth;
                      e.currentTarget.classList.add("jump-animation");
                    }}
                    className="w-full h-full object-contain relative z-10"
                  />
                </div>
              )
            )}
          </div>
          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <div className="relative" ref={notificationRef}>
              <Bell
                className={`cursor-pointer ${
                  connected ? "text-white" : "text-gray-400"
                }`}
                onClick={showNotifi}
                size={24}
                color="#ffffff"
                strokeWidth={2.5}
              />
              {notificationList.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {notificationCount > 99 ? "99+" : notificationList.length}
                  </span>
                </div>
              )}
            </div>
            <Link
              to={`/profile/${userId}`}
              className="text-2xl font-semibold hover:text-cyan-300 transition-all duration-300"
            >
              PROFILE
            </Link>
            <button
              onClick={handleLogout}
              className="text-2xl font-semibold text-red-400 hover:text-red-300 transition-all duration-300"
            >
              LOGOUT
            </button>
            <div className="relative">
              <Settings
                className="cursor-pointer hover:text-cyan-300 transition-all duration-300"
                size={24}
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              />
              <SettingsPopup
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex justify-between items-center">
          {/* Mobile Logo */}
          <Link to="/home" className="text-2xl font-bold">
            GAME PLANET
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-gray-800 z-50 shadow-lg">
            <div className="px-4 py-2 space-y-4">
              {/* Mobile Character Grid */}
              <div className="grid grid-cols-3 gap-4 py-4">
                {[EunSoo, HeeJun, JinHyuk, HongBeom, JaeEun, SungHyun].map(
                  (character, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <img
                        src={character}
                        alt={`Character ${index + 1}`}
                        className="w-12 h-12"
                        onMouseEnter={(e) => {
                          e.currentTarget.classList.remove("jump-animation");
                          void e.currentTarget.offsetWidth;
                          e.currentTarget.classList.add("jump-animation");
                        }}
                      />
                      <span className="text-sm mt-1">
                        {characterInfo[index].name}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span>알림</span>
                  <Bell size={20} onClick={showNotifi} />
                </div>
                <Link to={`/profile/${userId}`} className="block py-2">
                  PROFILE
                </Link>
                <button
                  onClick={handleLogout}
                  className="block py-2 text-red-400"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-cyan-700/70" />

      {/* Character Info Popup */}
      {selectedCharacter !== null && (
        <div
          className="absolute z-50 hidden lg:block w-48"
          style={{
            left: `${popupPosition.left - 96}px`, // 96px is half of w-48 (192px)
            top: `${popupPosition.top}px`,
          }}
        >
          <div className="animate-[popup_0.3s_ease-out] bg-cyan-900 text-white p-4 rounded-lg shadow-lg">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-900 transform rotate-45" />
            <div className="relative">
              <p className="font-bold text-lg">
                {characterInfo[selectedCharacter].name}
              </p>
              <p className="text-cyan-300">
                {characterInfo[selectedCharacter].role}
              </p>
              <p className="text-sm mt-1">
                {characterInfo[selectedCharacter].description}
              </p>
              {selectedCharacter === 4 && (
                <a
                  href={characterInfo[selectedCharacter].downloadLink}
                  className="mt-3 block text-center bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meeple Download
                </a>
              )}
              {selectedCharacter === 1 && userRole === "ROLE_ADMIN" && (
                <Link
                  to="/admin"
                  className="mt-3 block text-center bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
                  onClick={() => setSelectedCharacter(null)}
                >
                  관리자 페이지
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {isShowNotifi && (
        <NotificationList
          notiList={notificationList}
          setNotificationList={setNotificationList}
          setNotificationCount={setNotificationCount}
        />
      )}
    </nav>
  );
};

export default TopNavbar;
