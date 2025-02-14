import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, setModalOpen } from "../../sources/store/slices/UserSlice";
import { Dialog } from "@headlessui/react";
import { X, Eye, EyeOff } from "lucide-react";

const LoginModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, isLoading, error } = useSelector((state) => state.user);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [validations, setValidations] = useState({
    email: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{9,16}$/;

  const handleClose = () => {
    setCredentials({ email: "", password: "" });
    setValidations({ email: false, password: false });
    dispatch(setModalOpen(false));
  };

  const validateField = (name, value) => {
    if (name === "email") return emailRegex.test(value);
    if (name === "password") return passwordRegex.test(value);
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setValidations((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const isFormValid = () => validations.email && validations.password;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) dispatch(loginUser(credentials));
  };

  return (
    <Dialog open={isModalOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative w-full max-w-md rounded-lg bg-gradient-to-b from-gray-900 to-gray-800 p-8 border-2 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          {/* 게임스러운 상단 장식 */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />

          <div className="flex justify-between items-center mb-3">
            <div className="flex-1 text-center">
              <Dialog.Title className="text-4xl font-bold text-transparent ml-5 bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
                MEEPLE LOGIN
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-cyan-400 text-center mb-6">
            PRESS LOGIN TO PLAY
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label
                htmlFor="email"
                className="block text-2xl mb-2 text-cyan-400 group-hover:text-cyan-300"
              >
                EMAIL
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={credentials.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                required
                placeholder="이메일을 입력하세요."
              />
              {credentials.email && !validations.email && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">
                  유효한 이메일 형식이 아닙니다.
                </p>
              )}
            </div>

            <div className="group">
              <label
                htmlFor="password"
                className="block text-2xl mb-2 text-cyan-400 group-hover:text-cyan-300"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                  required
                  placeholder="비밀번호를 입력하세요."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {credentials.password && !validations.password && (
                <p className="text-red-500 text-sm mt-1 animate-pulse">
                  비밀번호는 영문, 숫자, 특수문자를 포함한 9-16자여야 합니다.
                </p>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors duration-300"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-white text-xl font-bold focus:outline-none disabled:opacity-50 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform  shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
            >
              {isLoading ? "CONNECTING..." : "PRESS LOGIN"}
            </button>
          </form>

          {/* 게임스러운 하단 장식 */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LoginModal;
