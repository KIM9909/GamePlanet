import React from "react";
import { useLocation } from "react-router-dom";
import TopNavbar from "../Navbar/TopNavBar";

const TopLayout = ({ children }) => {
  const location = useLocation();
  const showNavbar =
    location.pathname !== "/" &&
    !location.pathname.match(/^\/game\/burumabul\/[\w-]+\/?$/) &&
    !location.pathname.match(/^\/catch-mind\/[\w-]+$/) &&
    !location.pathname.match(/^\/game\/cockroach\/[\w-]+$/);

  return (
    <div className="min-h-screen bg-gray-900">
      {showNavbar && <TopNavbar />}
      <main>{children}</main>
    </div>
  );
};

export default TopLayout;
