import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopNavbar from "../Navbar/TopNavBar";

const TopLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 네비게이션 바 표시 여부 체크
  const showNavbar =
    location.pathname !== "/" &&
    !location.pathname.match(/^\/game\/burumabul\/[\w-]+(\/\d+)?$/) &&
    !location.pathname.match(/^\/catch-mind\/[\w-]+$/) &&
    !location.pathname.match(/^\/game\/cockroach\/[\w-]+$/) &&
    location.pathname !== "/errorpage";

  // 인증 체크
  useEffect(() => {
    const token = localStorage.getItem("token");
    const isPublicPage =
      location.pathname === "/" || location.pathname === "/errorpage";

    if (!token && !isPublicPage) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen">
      {showNavbar && <TopNavbar />}
      <main className={showNavbar ? "pt-16" : ""}>{children}</main>
    </div>
  );
};

export default TopLayout;
