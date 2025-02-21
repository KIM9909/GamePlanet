import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import FriendModal from "../friend/FriendModal";
import { FaUserFriends } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";

const FriendModalLayout = ({ children }) => {
  const { token } = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const userId = useSelector((state) => state.user.userId);

  const showButton = location.pathname !== "/";
  // location.pathname !== `/profile/${userId}` &&
  // !location.pathname.match(/^\/game\/burumabul\/[\w-]+$/) &&
  // !location.pathname.match(/^\/catch-mind\/[\w-]+$/) &&
  // !location.pathname.match(/^\/game\/cockroach\/[\w-]+$/);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
    }, 300);
  };

  return (
    <>
      {children}
      {showButton && ( // 조건부 렌더링 수정
        <>
          <div className="fixed right-0 top-1/2 transform -translate-y-1/2">
            <div className="relative group">
              <button
                className="bg-black bg-opacity-20 text-white p-2 rounded-l-lg transition-all duration-300 shadow-lg z-50 border-l border-t border-b border-cyan-400/60 hover:border-cyan-400"
                onClick={() => setIsModalOpen(true)}
              >
                <FaUserFriends size={25} className="ml-[3px]" />
              </button>
            </div>
          </div>

          {(isModalOpen || isClosing) && (
            <div
              className="fixed right-3 bottom-3 h-3/5 w-80 bg-slate-600 bg-opacity-50 shadow-lg rounded-lg transition-transform duration-300 ease-out transform translate-x-0"
              style={{
                animation: `${
                  isClosing ? "slideOut" : "slideIn"
                } 0.3s ease-out forwards`,
              }}
            >
              <style>{`
                @keyframes slideIn {
                  from {
                    transform: translateX(100%);
                  }
                  to {
                    transform: translateX(0);
                  }
                }

                @keyframes slideOut {
                  from {
                    transform: translateX(0);
                  }
                  to {
                    transform: translateX(100%);
                  }
                }
              `}</style>
              <div className="p-4 w-full h-full">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={handleClose}
                >
                  <IoMdCloseCircleOutline size={25} />
                </button>
                <FriendModal userId={userId} />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default FriendModalLayout;
