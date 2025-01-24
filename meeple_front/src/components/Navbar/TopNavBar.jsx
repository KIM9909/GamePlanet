import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../sources/api/store/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import Twinkle from "../../assets/images/decorate_twinkle.png";

const TopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-800 text-white p-1 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex-1">
          <Link
            to="/home"
            className="text-[38px] font-bold transition-all duration-300 hover:text-cyan-300"
            style={{
              textShadow:
                "0 0 20px rgba(0, 255, 255, 0.6), 0 0 20px rgba(0, 255, 255, 0.4), 0 0 30px rgba(0, 255, 255, 0.2)",
              letterSpacing: "1px",
            }}
          >
            <span className="flex">
              GAME PLANET
              <span className="ml-3 w-[60px]">
                <img src={Twinkle} alt="반짝이" />
              </span>
            </span>
          </Link>
        </div>
        <div className="flex items-center space-x-8">
          <Link
            to="/profile"
            className="text-2xl font-semibold tracking-wide hover:text-cyan-300 transition-colors duration-300
                       relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-cyan-300 
                       after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
          >
            PROFILE
          </Link>
          <button
            onClick={handleLogout}
            className="text-2xl font-semibold tracking-wide text-red-400 hover:text-red-300 transition-colors duration-300
                       relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-red-300 
                       after:left-0 after:-bottom-1 hover:after:w-full after:transition-all after:duration-300"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
