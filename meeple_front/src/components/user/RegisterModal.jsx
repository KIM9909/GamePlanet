import React, {useState} from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import {UserAPI} from "../../sources/api/UserAPI";
import { useDispatch } from 'react-redux';
import { setToken } from "../../sources/api/store/slices/UserSlice";


//  isOpen: 모달 표시 여부를 제어하는 prop
//  onClose: 모달 닫기 함수
const RegisterModal = ({isOpen, onClose}) => {
  const dispatch = useDispatch();

  // 초기 상태값들을 상수로 정의
  const initialFormData = {
    userName: '',
    userEmail: '',
    userPassword: '',
    userPasswordConfirm: '',
    userNickname: '',
    userBirthday: '',
  };

  const initialValidations = {
    email: false,
    emailChecked: false,
    nickname: false,
    nicknameChecked: false,
    passwordMatch: true,
  };

  // useState를 사용한 상태 관리
  const [formData, setFormData] = useState(initialFormData);
  const [validations, setValidations] = useState(initialValidations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 모달 닫기 핸들러: 모든 상태를 초기화하고 모달을 닫음
  const handleClose = () => {
    setFormData(initialFormData);
    setValidations(initialValidations);
    setError(null);
    onClose();
  };

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const {name, value} = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 이메일이나 닉네임이 변경되면 해당 검증 상태 초기화
    if (name === 'userEmail') {
      setValidations(prev => ({
        ...prev,
        email: false,
        emailChecked: false
      }))
    } else if (name === 'userNickname') {
      setValidations(prev => ({
        ...prev,
        nickname: false,
        nicknameChecked: false
      }))
    }
  }

  // 이메일 중복 검사 핸들러
  const handleEmailCheck = async () => {
    if (!formData.userEmail) {
      setError('이메일을 입력해주세요.');
      return;
    }
    try {
      const isDuplicate = await UserAPI.checkEmail(formData.userEmail);
      setValidations(prev => ({
        ...prev,
        email: !isDuplicate,
        emailChecked: true
      }));
      if (isDuplicate) {
        setError('이미 사용 중인 이메일입니다.');
      } else {
        setError('사용 가능한 이메일입니다.');
      }
    } catch (error) {
      setError('이메일 중복 검사 중 오류가 발생했습니다.');
    }
  }

  // 닉네임 중복 검사 핸들러
  const handleNicknameCheck = async () => {
    if (!formData.userNickname) {
      return
    }

    try {
      const isDuplicate = await UserAPI.checkNickname(formData.userNickname)
      setValidations(prev => ({
        ...prev,
        nickname: !isDuplicate,
        nicknameChecked: true
      }))
      if (isDuplicate) {
        setError('이미 사용 중인 닉네임 입니다.')
      } else {
        setError('사용 가능한 닉네임입니다.')
      }
    } catch (error) {
      setError('닉네임 중복 검사 중 오류가 발생했습니다.')
    }
  }
  
  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault()

    // 비밀번호 일치 확인
    if (formData.userPassword !== formData.userPasswordConfirm) {
      setValidations(prev => ({
        ...prev,
        passwordMatch: false
      }))
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    // 이메일과 닉네임 중복 검사 여부 확인
    if (!validations.email || !validations.nickname) {
      setError('이메일과 닉네임 중복 검사를 완료해주세요.')
      return
    }

    setIsLoading(true)
    try {
      // 생년월일 형식 변환
      const birthdayDateTime = new Date(formData.userBirthday)
      const formattedBirthday = birthdayDateTime.toISOString().split('T')[0] + 'T00:00:00'

      // 회원가입 데이터 준비
      const userData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPassword: formData.userPassword,
        userNickname: formData.userNickname,
        userBirthday: formattedBirthday
      }

      // 회원가입 및 자동 로그인 처리
      const token = await UserAPI.register(userData);
      
      if (token) {
        dispatch(setToken(token));
        onClose();
      }
    } catch (error) {
      setError(error.message || '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-lg bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">회원가입</Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                type="text"
                name="userName"
                id="userName"
                value={formData.userName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  name="userEmail"
                  id="userEmail"
                  value={formData.userEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={handleEmailCheck}
                  className="mt-1 px-4 h-10 bg-gray-500 text-white rounded-md hover:bg-gray-600 whitespace-nowrap"
                >
                  중복확인
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                name="userPassword"
                id="userPassword"
                value={formData.userPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="userPasswordConfirm" className="block text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                type="password"
                name="userPasswordConfirm"
                id="userPasswordConfirm"
                value={formData.userPasswordConfirm}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label htmlFor="userNickname" className="block text-sm font-medium text-gray-700">
                닉네임
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="userNickname"
                  id="userNickname"
                  value={formData.userNickname}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  className="mt-1 px-4 h-10 bg-gray-500 text-white rounded-md hover:bg-gray-600 whitespace-nowrap"
                >
                  중복확인
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="userBirthday" className="block text-sm font-medium text-gray-700">
                생년월일
              </label>
              <input
                type="date"
                name="userBirthday"
                id="userBirthday"
                value={formData.userBirthday}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
              {isLoading ? '처리중...' : '회원가입'}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default RegisterModal;