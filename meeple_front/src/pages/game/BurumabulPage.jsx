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
    <div>
      <div className="fixed left-0 top-0 h-full z-50 flex">
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
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="relative h-full">
            <div className="text-4xl font-bold text-center">BurumablePage</div>
            <TravelMap />
          </div>
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
    </div>
  );
};

export default BurumabulPage;
