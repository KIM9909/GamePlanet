import React, { useState } from "react";
import TravelMap from "../../components/burumabul/TravelMap";
import GameSidebar from "../../components/sidebar/GameSidebar";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const BurumabulPage = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-full flex">
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out transform 
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              `}
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
      {/* Main Content 영역 */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="h-screen h-full flex flex-col">
          {/* <div className="text-4xl font-bold text-center">BurumablePage</div> */}
          <div className="flex-1">
            <TravelMap />
          </div>

          <div className="flex-1 bg-gray-300 flex items-center justify-center">
            여기
          </div>
        </div>
      </div>

      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed left-0 top-1/2 -translate-y-1/2 w-12 h-12 
              bg-gray-800 rounded-r text-white
              hover:bg-gray-700 focus:outline-none 
              flex items-center justify-center
              shadow-lg"
        >
          <Menu className="w-8 h-8" />
        </button>
      )}
    </div>
  );
};

export default BurumabulPage;
