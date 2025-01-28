import { isAction } from "@reduxjs/toolkit";
import React, { Children, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";

const SideLayout = ({ children }) => {
  const { token } = useSelector((state) => state.user);
  const location = useLocation();
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  const showSidebar =
    location.pathname !== "/" &&
    location.pathname !== `/profile/${userId}` &&
    location.pathname !== "/game/burumabul" && // 메인과 프로필 페이지에서는 사이드바 안보임
    !location.pathname.match(/^\/catch-mind\/[\w-]+$/) &&
    !location.pathname.match(/^\/game\/cockroach\/[\w-]+$/);
  const [activeLink, setActiveLink] = useState(location.pathname);

  const linkStyle =
    "text-white hover:text-[#D7C3F1] transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#9694FF] after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300";

  const textShadow = "0 0 5px #9694FF, 0 0 10px #9694FF, 0 0 20px #EBEAFF";

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  return (
    <div>
      {showSidebar ? (
        <div style={{ userSelect: "none" }} className="h-screen">
          <div className="flex flex-row">
            <div className="flex w-2/7 bg-gradient-to-r from-gray-800 to-gray-800 h-screen border-2">
              <div className="flex-1 m-2 border-2 box-border">
                <div className="flex flex-col m-2 text-center py-2 text-[33px]">
                  {/* HOME */}
                  <div className="m-2">
                    <Link
                      to="/home"
                      className={linkStyle}
                      onClick={() => setActiveLink("/home")}
                      style={
                        activeLink === "/home"
                          ? {
                              color: "#D7C3F1",
                              textShadow: textShadow,
                            }
                          : {
                              textShadow: textShadow,
                            }
                      }
                    >
                      HOME
                    </Link>
                  </div>

                  {/* COMMUNITY */}
                  <div className="m-2">
                    <Link
                      to="/board"
                      className={linkStyle}
                      onClick={() => setActiveLink("/board")}
                      style={
                        activeLink === "/board"
                          ? {
                              color: "#D7C3F1",
                              textShadow: textShadow,
                            }
                          : {
                              textShadow: textShadow,
                            }
                      }
                    >
                      COMMUNITY
                    </Link>
                  </div>

                  {/* TOURNAMENT */}
                  <div className="m-2">
                    <Link
                      to="/tournament"
                      className={linkStyle}
                      onClick={() => setActiveLink("/tournament")}
                      style={
                        activeLink === "/tournament"
                          ? {
                              color: "#D7C3F1",
                              textShadow: textShadow,
                            }
                          : {
                              color: "white",
                              textShadow: textShadow,
                            }
                      }
                    >
                      TOURNAMENT
                    </Link>
                  </div>

                  {/* GAME CUSTOM */}
                  <div className="m-2">
                    <Link
                      to="/proposal"
                      className={linkStyle}
                      onClick={() => setActiveLink("/proposal")}
                      style={
                        activeLink === "/proposal"
                          ? {
                              color: "#D7C3F1",
                              textShadow: textShadow,
                            }
                          : {
                              textShadow: textShadow,
                            }
                      }
                    >
                      GAME CUSTOM
                    </Link>
                  </div>

                  {/* 프로젝트 소개 */}
                  <div className="m-2">
                    <Link
                      to="/introduce"
                      className={linkStyle}
                      onClick={() => setActiveLink("/introduce")}
                      style={
                        activeLink === "/introduce"
                          ? {
                              color: "#D7C3F1",
                              textShadow: textShadow,
                            }
                          : {
                              textShadow: textShadow,
                            }
                      }
                    >
                      INTRODUCE
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">{children}</div>
          </div>
        </div>
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
};

export default SideLayout;
