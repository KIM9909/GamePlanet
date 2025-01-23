// 로그인 모달 컴포넌트: 사용자 인증을 위한 UI 인터페이스를 제공합니다.
import React, { useState } from "react";
// Redux 관련 훅 임포트: dispatch는 액션 발생, useSelector는 상태 조회
import { useDispatch, useSelector } from "react-redux";
// 로그인 관련 액션과 모달 상태 제어 액션을 임포트
import {
  loginUser,
  setModalOpen,
} from "../../sources/api/store/slices/UserSlice";
// HeadlessUI의 Dialog 컴포넌트: 접근성이 고려된 모달 구현을 위해 사용
import { Dialog } from "@headlessui/react";
// Lucide 아이콘: 모달 닫기 버튼에 사용될 X 아이콘
import { X } from "lucide-react";

const LoginModal = () => {
  // Redux의 dispatch 함수를 가져옴: 액션을 발생시키는 데 사용
  const dispatch = useDispatch();

  // Redux store에서 필요한 상태를 가져옴
  // isModalOpen: 모달의 표시 여부
  // isLoading: 로그인 요청 진행 상태
  // error: 로그인 실패 시 에러 메시지
  const { isModalOpen, isLoading, error } = useSelector((state) => state.user);

  // 로그인 폼의 입력값을 관리하는 로컬 상태
  const [credentials, setCredentials] = useState({
    email: "", // 이메일 입력값
    password: "", // 비밀번호 입력값
  });

  const handleClose = () => {
    setCredentials({
      email: "",
      password: "",
    });
    dispatch(setModalOpen(false));
  };

  // 폼 제출 처리 핸들러
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    dispatch(loginUser(credentials)); // 로그인 액션을 Redux로 디스패치
  };

  // 입력 필드 값 변경 처리 핸들러
  const handleChange = (e) => {
    // 이전 상태를 복사하고 변경된 필드만 업데이트
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value, // 동적 키로 해당 필드 업데이트
    });
  };

  return (
    // Dialog 컴포넌트: 모달의 기본 구조 제공
    <Dialog
      open={isModalOpen} // 모달 표시 여부
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="space-y-1 mx-auto max-w-sm rounded-3xl bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1 text-center">
              <Dialog.Title className="text-3xl font-bold ml-5">
                MEEPLE LOGIN
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="text-gray-400 text-center mb-6">PLAY MEEPLE NOW</div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-2xl font-bold mb-2">
                EMAIL
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={credentials.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-100 px-4 py-3 text-gray-700 focus:outline-none"
                required
                placeholder="이메일을 입력하세요."
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-2xl font-bold mb-2"
              >
                PW
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={credentials.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-gray-100 px-4 py-3 text-gray-700 focus:outline-none"
                required
                placeholder="비밀번호를 입력하세요."
              />
            </div>

            <div className="text-right mb-4">
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
              >
                ID / PW 찾기
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-gradient-to-tr from-cyan-500 to-gray-500 py-3 text-white text-xl font-semibold focus:outline-none disabled:opacity-50"
            >
              {isLoading ? "로그인 중..." : "LOGIN"}
            </button>

            <hr />

            <div className="text-center text-gray-500 mt-4">또는</div>

            <div className="flex justify-center space-x-6 mt-4">
              <button type="button" className="w-12 h-12">
                <img
                  src="/src/assets/images/naver-icon.png"
                  alt="Naver"
                  className="w-full h-full"
                />
              </button>
              <button type="button" className="w-12 h-12">
                <img
                  src="/src/assets/images/kakao-icon.png"
                  alt="Kakao"
                  className="w-full h-full"
                />
              </button>
              <button type="button" className="w-12 h-12">
                <img
                  src="/src/assets/images/google-icon.png"
                  alt="Google"
                  className="w-full h-full"
                />
              </button>
              <button type="button" className="w-12 h-12">
                <img
                  src="/src/assets/images/apple-icon.png"
                  alt="Apple"
                  className="w-full h-full"
                />
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LoginModal;
