import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../sources/store/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import Twinkle from "../../assets/images/decorate_twinkle.png";

import EunSoo from "../../assets/images/pixel_character/pixel-eunsoo.png";
import HeeJun from "../../assets/images/pixel_character/pixel-heejun.png";
import HongBeom from "../../assets/images/pixel_character/pixel-hongbeom.png";
import JaeEun from "../../assets/images/pixel_character/pixel-jaeeun.png";
import JinHyuk from "../../assets/images/pixel_character/pixel-jinhyuk.png";
import SungHyun from "../../assets/images/pixel_character/pixel-sunghyun.png";

const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const navbarRef = useRef(null);
  const { token } = useSelector((state) => state.user);

  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;

  const characterInfo = {
    0: {
      name: "은수",
      role: "Front-end",
      description: "멋진 프론트엔드 개발자",
    },
    1: {
      name: "희준",
      role: "Front-end",
      description: "열정적인 프론트엔드 개발자",
    },
    2: {
      name: "진혁",
      role: "Front-end",
      description: "감각있는 프론트엔드 개발자자",
    },
    3: {
      name: "홍범",
      role: "Full-stack",
      description: "다재다능 풀스택 개발자자",
    },
    4: {
      name: "재은",
      role: "Back-end",
      description: "계산적인 백엔드 개발자",
    },
    5: {
      name: "성현",
      role: "Back-end",
      description: "로보트 백엔드 개발자",
    },
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setSelectedCharacter(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <>
      <nav
        ref={navbarRef}
        className="bg-gradient-to-r from-gray-800 to-gray-800 text-white p-1 shadow-lg relative"
      >
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1">
            <div className="flex">
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
                <img src={Twinkle} alt="반짝이" />
              </span>
            </div>
          </div>

          <div className="flex-1 flex justify-center space-x-9">
            {[EunSoo, HeeJun, JinHyuk, HongBeom, JaeEun, SungHyun].map(
              (character, index) => (
                <div
                  key={index}
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
                  <style>
                    {`
                    @keyframes jump {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-15px); } 
                    }
                    .jump-animation {
                      animation: jump 0.5s ease-in-out;
                    }
                    @keyframes popup {
                      0% { opacity: 0; transform: translateY(-10px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }
                  `}
                  </style>
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

          <div className="flex items-center space-x-8">
            <Link
              to={`/profile/${userId}`}
              className="text-2xl font-semibold tracking-wide hover:text-cyan-300 transition-colors duration-300
                     relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-300 
                     after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
            >
              PROFILE
            </Link>
            <button
              onClick={handleLogout}
              className="text-2xl font-semibold tracking-wide text-red-400 hover:text-red-300 transition-colors duration-300
                     relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-300 
                     after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </nav>

      {selectedCharacter !== null && (
        <div
          className="absolute z-50"
          style={{
            left: `${selectedCharacter * 5.25 + 36.7}rem`, // 5.25rem은 캐릭터 간격, 36.7rem은 초기 왼쪽 여백
            top: "4.5rem", // navbar 아래 위치
          }}
        >
          <div className="animate-[popup_0.3s_ease-out] bg-cyan-900 text-white p-4 rounded-lg shadow-lg w-48">
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavbar;
