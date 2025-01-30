import React, { useState } from "react";
import TravelMap from "../../components/game/burumabul/TravelMap";
import GameSidebar from "../../components/sidebar/GameSidebar";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const BurumabulPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  // const [playerCount, setPlayerCount] = useState()

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full z-50 flex">
        {/* 사이드바 */}
        <div
          className={`transition-transform duration-300 ease-in-out transform 
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
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
      </div>
      {/* Main Content 영역 */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="h-screen w-full flex flex-col">
          {/* <div className="text-4xl font-bold text-center">BurumablePage</div> */}
          <div className="h-3/4">
            <TravelMap />
          </div>

          <div className="h-1/4 bg-gray-300 flex items-center justify-center">
            여기
          </div>
        </div>
      </div>

      {!isSidebarOpen && (
        <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50">
          <div className="relative group">
            <button
              onClick={toggleSidebar}
              className="invisible group-hover:visible transition-all duration-300
              bg-gray-800 rounded-r text-white
              hover:bg-gray-700 focus:outline-none 
              flex items-center justify-center
              shadow-lg w-12 h-12"
            >
              <Menu className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BurumabulPage;
