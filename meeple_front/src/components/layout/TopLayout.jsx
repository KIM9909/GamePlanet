import React from "react";
import { useLocation } from "react-router-dom";
import TopNavbar from "../Navbar/TopNavBar";

const TopLayout = ({ children }) => {
  const location = useLocation();
  // 메인 페이지와 게임 페이지 모두에서 상단바 숨김
  const showNavbar =
    location.pathname !== "/" && !location.pathname.includes("/game/");

  return (
    <div className="min-h-screen bg-gray-900">
      {showNavbar && <TopNavbar />}
      <main>{children}</main>
    </div>
  );
};

export default TopLayout;
