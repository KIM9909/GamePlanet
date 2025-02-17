import React, { useContext, useEffect, useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { SocketContext } from "../../../../layout/SocketLayout";

const ChangePasswordModal = ({ onClose }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { changePassword } = useContext(SocketContext);

  const handlePassword = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 입력 가능
    if (value.length > 8) value = value.slice(0, 8); // 최대 8자리 제한
    setPassword(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    changePassword(password);
    console.log("입력된 비밀번호:", password);
    onClose();
    setPassword("");
  };

  return (
    <>
      <div className="w-96 p-6 bg-gray-900 bg-opacity-90 border-2 border-cyan-400 rounded-lg flex flex-col justify-center items-center">
        <h2 className="text-lg text-cyan-500 font-semibold mb-4">
          🔒 변경할 비밀 번호를 입력하세요
        </h2>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col items-center my-3">
            <label className="text-lg text-white" htmlFor="password">
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
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          <div className="flex flex-row justify-around items-center">
            <button
              onClick={onClose}
              className="w-1/3 mt-4 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="w-1/3 mt-4 bg-cyan-500 text-white py-2 rounded-md hover:bg-cyan-600 transition duration-200"
            >
              변경
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChangePasswordModal;
