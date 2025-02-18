import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MiniTetris from "./MiniTetris";

const SideLayout = ({ children }) => {
  const { token } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = token ? JSON.parse(atob(token.split(".")[1])).sub : null;
  const gameInfo = location.state?.gameInfo;

  const notShowSidebar = !location.pathname.includes("/game-info");
  const [activeLink, setActiveLink] = useState(location.pathname);

  const linkStyle = (isActive) =>
    `${
      isActive ? "text-cyan-400" : "text-white"
    } hover:text-cyan-300 transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-400 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300`;

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleGamePlay = () => {
    if (gameInfo) {
      switch (Number(gameInfo.gameInfoId)) {
        case 1:
          navigate("/cockroach/room-list");
          break;
        case 2:
          navigate("/burumabul/room-list");
          break;
        case 3:
          navigate("/catch-mind");
          break;
        default:
          console.warn("Unknown game type");
      }
    }
  };

  return (
    <div>
      {!notShowSidebar && gameInfo ? (
        <div style={{ userSelect: "none" }} className="h-screen">
          <div className="flex flex-row">
            <div className="flex w-2/7 bg-gradient-to-r from-gray-900/60 to-gray-900/60 h-screen border border-2 border-cyan-500/60">
              <div className="flex-1 m-2 border-2 box-border border-cyan-500/60">
                <div className="flex flex-col h-full">
                  {/* Navigation Links */}
                  <div className="flex flex-col text-center py-6 space-y-8 text-[33px]">
                    {/* GAMEPLAY Button at the top */}
                    <div>
                      <button
                        onClick={handleGamePlay}
                        className="text-white hover:text-cyan-300 transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-400 after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
                      >
                        GAME PLAY
                      </button>
                    </div>

                    <div>
                      <Link
                        to={`/game-info/${gameInfo.gameInfoId}`}
                        className={linkStyle(
                          activeLink === `/game-info/${gameInfo.gameInfoId}`
                        )}
                        onClick={() =>
                          setActiveLink(`/game-info/${gameInfo.gameInfoId}`)
                        }
                        state={{ gameInfo }}
                      >
                        GAME INFO
                      </Link>
                    </div>

                    <div>
                      <Link
                        to={`/game-info/${gameInfo.gameInfoId}/board`}
                        className={linkStyle(
                          activeLink ===
                            `/game-info/${gameInfo.gameInfoId}/board`
                        )}
                        onClick={() =>
                          setActiveLink(
                            `/game-info/${gameInfo.gameInfoId}/board`
                          )
                        }
                        state={{ gameInfo }}
                      >
                        COMMUNITY
                      </Link>
                    </div>

                    <div>
                      <Link
                        to={`/game-info/${gameInfo.gameInfoId}/review`}
                        className={linkStyle(
                          activeLink ===
                            `/game-info/${gameInfo.gameInfoId}/review`
                        )}
                        onClick={() =>
                          setActiveLink(
                            `/game-info/${gameInfo.gameInfoId}/review`
                          )
                        }
                        state={{ gameInfo }}
                      >
                        GAME REVIEW
                      </Link>
                    </div>

                    <div>
                      <Link
                        to={`/game-info/${gameInfo.gameInfoId}/custom`}
                        className={linkStyle(
                          activeLink ===
                            `/game-info/${gameInfo.gameInfoId}/custom`
                        )}
                        onClick={() =>
                          setActiveLink(
                            `/game-info/${gameInfo.gameInfoId}/custom`
                          )
                        }
                        state={{ gameInfo }}
                      >
                        GAME CUSTOM
                      </Link>
                    </div>
                  </div>

                  {/* Mini Tetris */}
                  <div className="mt-auto mb-20">
                    <MiniTetris />
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