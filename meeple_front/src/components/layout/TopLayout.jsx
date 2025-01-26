import React from "react";
import { useLocation } from "react-router-dom";
import TopNavbar from "../Navbar/TopNavBar";

const TopLayout = ({ children }) => {
  const location = useLocation();
  const showNavbar =
    location.pathname !== "/" && location.pathname !== "/game/burumabul";

  return (
    <div>
      {showNavbar && <TopNavbar />}
      <main>{children}</main>
    </div>
  );
};

export default TopLayout;
