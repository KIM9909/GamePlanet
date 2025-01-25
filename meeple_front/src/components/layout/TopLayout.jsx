import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopNavbar from "../Navbar/TopNavBar";

const TopLayout = ({ children }) => {
  const location = useLocation();
  const [isShowNavbar, setIsShowNavbar] = useState(true);

  const hiddenPaths = ["/", "/game/burumabul", "/game/cockroachpoker"];

  useEffect(() => {
    if (hiddenPaths.includes(location.pathname)) {
      setIsShowNavbar(false);
    } else {
      setIsShowNavbar(true);
    }
  }, [location.pathname]);

  return (
    <div>
      {isShowNavbar ? <TopNavbar /> : null}
      <main>{children}</main>
    </div>
  );
};

export default TopLayout;
