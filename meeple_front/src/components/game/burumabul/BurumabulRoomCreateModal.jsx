import React, { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BurumabulRoomCreateModal = ({ onClose }) => {
  const [roomTitle, setRoomTitle] = useState("");
  const [playerNum, setPlayerNum] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handlePassword = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 입력 가능
    if (value.length > 8) value = value.slice(0, 8); // 최대 8자리 제한
    setPassword(value);
  };

  return (
    <div className="fixed inset-0 bg-blue-200 bg-opacity-50 flex justify-center items-center z-50">
      <div className="w-96 p-6 bg-slate-900 bg-opacity-80 rounded-lg flex flex-col justify-center items-center">
        <h1 className="text-3xl text-white ">부루마불 방 만들기</h1>
        <hr className="w-80 border-t-2 border-white my-2" />
        <div className="bg-white w-full py-3 my-3 rounded-lg">
          <form onSubmit={handleSubmit} className="text-center">
            {/* 방 제목 */}
            <div className="flex flex-col items-center">
              <label
                className="text-xl block mt-2 text-gray-900"
                htmlFor="roomTitle"
              >
                방 제목
              </label>
              <hr className="w-80 border-t-2 border-gray-400 my-2" />
              <input
                type="text"
                className="w-72 h-8 pl-3 pr-3 mx-3 min-w-0 rounded-lg bg-slate-400 outline-1 -outline-offset-1 outline-black has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-slate-600"
                onChange={(e) => setRoomTitle(e.target.value)}
                required
              />
            </div>

            {/* 비밀방 선택 */}
            <div className="flex flex-row justify-center items-center my-2">
              <label
                className="text-xl block my-2 text-gray-900"
                htmlFor="privateCheck"
              >
                비밀방
              </label>
              <div>
                <button
                  className={`bg-slate-500 mx-2 text-white w-14 rounded ${
                    isPrivate ? "bg-green-500" : "bg-slate-500"
                  }`}
                  onClick={() => setIsPrivate(true)}
                  type="button"
                >
                  YES
                </button>
                <button
                  className={`"bg-red-500" mx-2 text-white w-14 rounded ${
                    isPrivate ? "bg-slate-500" : "bg-red-500"
                  }`}
                  onClick={() => setIsPrivate(false)}
                  type="button"
                >
                  NO
                </button>
              </div>
            </div>
            {/* 비밀방이면 비밀번호 설정 */}
            <div>
              {isPrivate && (
                <div className="flex flex-col items-center my-3">
                  <label className="text-lg" htmlFor="password">
                    비밀번호 설정(숫자 8자리)
                  </label>
                  <hr className="w-80 border-t-2 border-gray-400 my-2" />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-40 bg-slate-400 h-8 rounded-lg pl-3 pr-10"
                      placeholder="비밀번호를 입력하세요..."
                      value={password}
                      onChange={handlePassword}
                      required
                    />
                    <button
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 bottom-1.5 text-gray-500"
                      type="button"
                    >
                      {showPassword ? (
                        <FaRegEye size={20} />
                      ) : (
                        <FaRegEyeSlash size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* 플레이어 수 선택 */}
            <div className="flex flex-col items-center">
              <h2 className="text-lg">플레이어 수 선택</h2>
              <hr className="w-80 border-t-2 border-gray-400 my-2" />
              <div className="my-1">
                <button
                  className={`bg-blue-200 text-gray-500 w-14 rounded mx-2 ${
                    playerNum === 2 ? "bg-blue-400" : "bg-blue-200"
                  }`}
                  onClick={() => setPlayerNum(2)}
                  type="button"
                >
                  2인
                </button>
                <button
                  className={`bg-blue-200 text-gray-500 w-14 rounded mx-2 ${
                    playerNum === 3 ? "bg-blue-400" : "bg-blue-200"
                  }`}
                  onClick={() => setPlayerNum(3)}
                  type="button"
                >
                  3인
                </button>
                <button
                  className={`bg-blue-200 text-gray-500 w-14 rounded mx-2 ${
                    playerNum === 4 ? "bg-blue-400" : "bg-blue-200"
                  }`}
                  onClick={() => setPlayerNum(4)}
                  type="button"
                >
                  4인
                </button>
              </div>
            </div>
            {/* 방 생성 or 취소 */}
            <div className="flex flex-row justify-evenly my-3">
              <button
                className="bg-red-500 rounded-lg text-white w-24"
                onClick={onClose}
              >
                취소
              </button>
              {/* 일단 생성 누르면 부루마불 대기방으로 */}
              <button
                className="bg-green-500 rounded-lg text-white w-24"
                onClick={() => navigate("/game/burumabul/waitingroom")}
                type="submit"
              >
                생성
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BurumabulRoomCreateModal;
