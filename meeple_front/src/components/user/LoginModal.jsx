// 로그인 모달 컴포넌트: 사용자 인증을 위한 UI 인터페이스를 제공합니다.
import React, {useState} from "react";
// Redux 관련 훅 임포트: dispatch는 액션 발생, useSelector는 상태 조회
import { useDispatch, useSelector } from "react-redux";
// 로그인 관련 액션과 모달 상태 제어 액션을 임포트
import { loginUser, setModalOpen } from "../../sources/api/store/slices/UserSlice";
// HeadlessUI의 Dialog 컴포넌트: 접근성이 고려된 모달 구현을 위해 사용
import { Dialog } from "@headlessui/react";
// Lucide 아이콘: 모달 닫기 버튼에 사용될 X 아이콘
import { X } from 'lucide-react'

const LoginModal = () => {
  // Redux의 dispatch 함수를 가져옴: 액션을 발생시키는 데 사용
  const dispatch = useDispatch()

  // Redux store에서 필요한 상태를 가져옴
  // isModalOpen: 모달의 표시 여부
  // isLoading: 로그인 요청 진행 상태
  // error: 로그인 실패 시 에러 메시지
  const {isModalOpen, isLoading, error} = useSelector((state) => state.user)

  // 로그인 폼의 입력값을 관리하는 로컬 상태
  const [credentials, setCredentials] = useState({
    email: '', // 이메일 입력값
    password: '', // 비밀번호 입력값
  })

  const handleClose = () => {
    setCredentials({
      email: '',
      password: ''
    })
    dispatch(setModalOpen(false))
  }

  // 폼 제출 처리 핸들러
  const handleSubmit = (e) => {
    e.preventDefault() // 기본 폼 제출 동작 방지
    dispatch(loginUser(credentials)) // 로그인 액션을 Redux로 디스패치
  }

  // 입력 필드 값 변경 처리 핸들러
  const handleChange = (e) => {
    // 이전 상태를 복사하고 변경된 필드만 업데이트
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value // 동적 키로 해당 필드 업데이트
    })
  }

  return (
    // Dialog 컴포넌트: 모달의 기본 구조 제공
    <Dialog
      open={isModalOpen}  // 모달 표시 여부
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">로그인</Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={credentials.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={credentials.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-500 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default LoginModal;