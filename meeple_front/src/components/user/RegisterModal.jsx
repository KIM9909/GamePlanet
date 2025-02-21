import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, Eye, EyeOff } from "lucide-react";
import { UserAPI } from "../../sources/api/UserAPI";
import { useDispatch } from "react-redux";
import { setToken } from "../../sources/store/slices/UserSlice";

const RegisterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  // 유효성 검사용 정규식
  // email: 이메일 형식
  // password: 영문, 숫자, 특수문자 포함 9-16자
  // nickname: 한글, 영문, 숫자 2-10자
  // name: 한글 2-5자
  const REGEX = {
    email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
    password:
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{9,16}$/,
    nickname: /^[a-zA-Z0-9가-힣]{2,10}$/,
    name: /^[가-힣]{2,5}$/,
  };

  // 폼 데이터 초기값
  const initialFormData = {
    userName: "",
    userEmail: "",
    userPassword: "",
    userPasswordConfirm: "",
    userNickname: "",
    userBirthday: "",
  };

  // 유효성 검사 상태 초기값
  const initialValidations = {
    email: false, // 이메일 중복검사 통과 여부
    emailChecked: false, // 이메일 중복검사 수행 여부
    nickname: false, // 닉네임 중복검사 통과 여부
    nicknameChecked: false, // 닉네임 중복검사 수행 여부
    passwordMatch: true, // 비밀번호 확인 일치 여부
    validName: false, // 이름 형식 검사
    validNickname: false, // 닉네임 형식 검사
    validPassword: false, // 비밀번호 형식 검사
    validEmail: false, // 이메일 형식 검사
  };

  // 상태 관리
  const [formData, setFormData] = useState(initialFormData);
  const [validations, setValidations] = useState(initialValidations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailCheckMessage, setEmailCheckMessage] = useState("");
  const [nicknameCheckMessage, setNicknameCheckMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState({
    terms: false, // 이용약관 동의
    privacy: false, // 개인정보 동의
    device: false, // 기기접근 동의
    AI: false,
  });

  // 모달 닫기 시 초기화
  const handleClose = () => {
    setFormData(initialFormData);
    setValidations(initialValidations);
    setError(null);
    onClose();
  };

  // 스크롤 이벤트 전파 방지
  const handleWheel = (e) => {
    e.stopPropagation();
  };

  // 필드별 유효성 검사
  const validateField = (name, value) => {
    switch (name) {
      case "userName":
        return REGEX.name.test(value);
      case "userPassword":
        return REGEX.password.test(value);
      case "userEmail":
        return REGEX.email.test(value);
      case "userNickname":
        return REGEX.nickname.test(value);
      default:
        return true;
    }
  };

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const isValid = validateField(name, value);

    // 필드별 유효성 검사 상태 업데이트
    if (name === "userEmail") {
      setValidations((prev) => ({
        ...prev,
        email: false,
        emailChecked: false,
        validEmail: isValid,
      }));
      setEmailCheckMessage("");
    } else if (name === "userNickname") {
      setValidations((prev) => ({
        ...prev,
        nickname: false,
        nicknameChecked: false,
        validNickname: isValid,
      }));
      setNicknameCheckMessage("");
    } else if (name === "userName") {
      setValidations((prev) => ({
        ...prev,
        validName: isValid,
      }));
    } else if (name === "userPassword") {
      setValidations((prev) => ({
        ...prev,
        validPassword: isValid,
        passwordMatch: value === formData.userPasswordConfirm,
      }));
    } else if (name === "userPasswordConfirm") {
      setValidations((prev) => ({
        ...prev,
        passwordMatch: value === formData.userPassword,
      }));
    }
  };

  // 이메일 중복 검사
  const handleEmailCheck = async () => {
    try {
      const isDuplicate = await UserAPI.checkEmail(formData.userEmail);
      setValidations((prev) => ({
        ...prev,
        email: !isDuplicate,
        emailChecked: true,
      }));
      setEmailCheckMessage(
        isDuplicate
          ? "이미 사용 중인 이메일입니다."
          : "사용 가능한 이메일입니다."
      );
    } catch (error) {
      setError("이메일 중복 검사 중 오류가 발생했습니다.");
    }
  };

  // 닉네임 중복 검사
  const handleNicknameCheck = async () => {
    try {
      const isDuplicate = await UserAPI.checkNickname(formData.userNickname);
      setValidations((prev) => ({
        ...prev,
        nickname: !isDuplicate,
        nicknameChecked: true,
      }));
      setNicknameCheckMessage(
        isDuplicate
          ? "이미 사용 중인 닉네임입니다."
          : "사용 가능한 닉네임입니다."
      );
    } catch (error) {
      setError("닉네임 중복 검사 중 오류가 발생했습니다.");
    }
  };

  // 폼 전체 유효성 검사
  const isFormValid = () => {
    return (
      validations.validName && // 이름 형식
      validations.validPassword && // 비밀번호 형식
      validations.validEmail && // 이메일 형식
      validations.validNickname && // 닉네임 형식
      validations.passwordMatch && // 비밀번호 확인
      validations.email && // 이메일 중복검사
      validations.nickname && // 닉네임 중복검사
      formData.userBirthday && // 생년월일
      termsAgreed.terms && // 이용약관
      termsAgreed.privacy && // 개인정보
      termsAgreed.device && // 기기접근
      termsAgreed.AI // AI 프로그램 설치
    );
  };

  // 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("모든 필드를 올바르게 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // 생년월일 형식 변환 (YYYY-MM-DDT00:00:00)
      const birthdayDateTime = new Date(formData.userBirthday);
      const formattedBirthday =
        birthdayDateTime.toISOString().split("T")[0] + "T00:00:00";

      const userData = {
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPassword: formData.userPassword,
        userNickname: formData.userNickname,
        userBirthday: formattedBirthday,
      };

      // 회원가입 및 자동 로그인 시도
      const success = await UserAPI.register(userData);
      if (success) {
        // 회원가입 성공 시 자동 로그인
        const loginData = {
          email: formData.userEmail,
          password: formData.userPassword,
        };
        const token = await UserAPI.login(loginData);
        if (token) {
          dispatch(setToken(token));
          handleClose();
        }
      }
    } catch (error) {
      setError(error.message || "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .thin-scrollbar::-webkit-scrollbar { width: 5px; padding-right: 12px; position: absolute; right: 0;}
        .thin-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .thin-scrollbar::-webkit-scrollbar-thumb { background: rgba(6, 182, 212, 0.5); border-radius: 15px;}
        .thin-scrollbar::-webkit-scrollbar-track { display: none; }
        .thin-scrollbar { padding-right: 10px; }
      `}</style>
      <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            className="relative w-full max-w-[550px] rounded-lg bg-gradient-to-b from-gray-900 to-gray-800 p-6 border-2 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.3)] overflow-visible"
            onWheel={handleWheel}
          >
            {/* 게임스러운 상단 장식 */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />

            <div className="flex justify-between items-center mb-3">
              <div className="flex-1 text-center">
                <Dialog.Title className="text-4xl font-bold text-transparent ml-6 bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
                  MEEPLE SIGNUP
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
              CREATE YOUR ACCOUNT
            </div>

            <div className="max-h-[65vh] overflow-y-auto thin-scrollbar pr-1">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="group">
                  <label
                    htmlFor="userName"
                    className="block text-xl text-cyan-400 group-hover:text-cyan-300"
                  >
                    NAME
                  </label>
                  <input
                    type="text"
                    name="userName"
                    id="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                    required
                    placeholder="이름을 입력하세요."
                  />
                  {formData.userName && !validations.validName && (
                    <p className="mt-1 text-sm text-red-500 animate-pulse">
                      이름은 2-5자의 한글만 가능합니다.
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="userBirthday"
                    className="block text-xl text-cyan-400 group-hover:text-cyan-300"
                  >
                    BIRTHDAY
                  </label>
                  <input
                    type="date"
                    name="userBirthday"
                    id="userBirthday"
                    value={formData.userBirthday}
                    onChange={handleChange}
                    onKeyDown={(e) => e.preventDefault()}
                    className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 [&::-webkit-calendar-picker-indicator]:filter-white"
                    required
                  />
                </div>

                <div className="group">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="userNickname"
                      className="block text-xl text-cyan-400 group-hover:text-cyan-300"
                    >
                      NICKNAME
                    </label>
                    <button
                      type="button"
                      onClick={handleNicknameCheck}
                      className="px-4 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      CHECK
                    </button>
                  </div>
                  <input
                    type="text"
                    name="userNickname"
                    id="userNickname"
                    value={formData.userNickname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                    required
                    placeholder="사용할 닉네임을 입력하세요."
                  />
                  {formData.userNickname && !validations.validNickname && (
                    <p className="mt-1 text-sm text-red-500 animate-pulse">
                      닉네임은 2-10자의 한글, 영문, 숫자만 가능합니다.
                    </p>
                  )}
                  {nicknameCheckMessage && (
                    <p
                      className={`mt-1 text-sm ${
                        nicknameCheckMessage.includes("사용 가능")
                          ? "text-green-500"
                          : "text-red-500"
                      } animate-pulse`}
                    >
                      {nicknameCheckMessage}
                    </p>
                  )}
                </div>

                <div className="group">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="userEmail"
                      className="block text-xl text-cyan-400 group-hover:text-cyan-300"
                    >
                      EMAIL
                    </label>
                    <button
                      type="button"
                      onClick={handleEmailCheck}
                      className="px-4 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105 text-sm"
                    >
                      CHECK
                    </button>
                  </div>
                  <input
                    type="email"
                    name="userEmail"
                    id="userEmail"
                    value={formData.userEmail}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                    required
                    placeholder="사용할 이메일을 입력하세요."
                  />
                  {formData.userEmail && !validations.validEmail && (
                    <p className="mt-1 text-sm text-red-500 animate-pulse">
                      유효한 이메일 형식이 아닙니다.
                    </p>
                  )}
                  {emailCheckMessage && (
                    <p
                      className={`mt-1 text-sm ${
                        emailCheckMessage.includes("사용 가능")
                          ? "text-green-500"
                          : "text-red-500"
                      } animate-pulse`}
                    >
                      {emailCheckMessage}
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="userPassword"
                    className="block text-xl text-cyan-400 group-hover:text-cyan-300"
                  >
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="userPassword"
                      id="userPassword"
                      value={formData.userPassword}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                      required
                      placeholder="사용할 비밀번호를 입력하세요."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {formData.userPassword && !validations.validPassword && (
                    <p className="mt-1 text-sm text-red-500 animate-pulse">
                      비밀번호는 영문, 숫자, 특수문자를 포함한 9-16자여야
                      합니다.
                    </p>
                  )}
                </div>

                <div className="group">
                  <label
                    htmlFor="userPasswordConfirm"
                    className="block text-xl text-cyan-400 group-hover:text-cyan-300"
                  >
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirm ? "text" : "password"}
                      name="userPasswordConfirm"
                      id="userPasswordConfirm"
                      value={formData.userPasswordConfirm}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md bg-gray-800 px-4 py-3 text-cyan-400 border border-cyan-700 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300 placeholder:text-gray-500"
                      required
                      placeholder="비밀번호를 다시 입력하세요."
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                    >
                      {showPasswordConfirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {formData.userPasswordConfirm &&
                    !validations.passwordMatch && (
                      <p className="mt-1 text-sm text-red-500 animate-pulse">
                        비밀번호가 일치하지 않습니다.
                      </p>
                    )}
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center animate-pulse">
                    {error}
                  </p>
                )}

                <div className="border border-cyan-800 rounded-lg p-4 bg-gray-900/50">
                  <div className="text-cyan-400 text-lg mb-4 text-center">
                    REQUIRED PERMISSIONS
                  </div>
                  <div className="space-y-2 text-gray-300 text-sm ">
                    <p className="ml-4">
                      1️⃣ 본 서비스는 화상 카메라 및 마이크 사용이 필수적입니다.
                    </p>
                    <p className="ml-4">
                      2️⃣ 이용을 위한 카메라 및 마이크 기기 접근에 동의해주세요.
                    </p>
                    <p className="ml-4">
                      3️⃣ 청정한 소통 위한 욕설감지 AI프로그램 설치에
                      동의해주세요.
                    </p>
                  </div>

                  <div className="mt-4 text-red-400 text-center">
                    <div className="text-xl">⚠️WARNING⚠️</div>
                    <div className="text-sm">
                      서비스 이용시 욕설을 할 경우 음성이 녹음될 수 있습니다.
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-gray-300">
                  <div className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-300 mb-2 pb-2 border-b border-cyan-800">
                    <input
                      type="checkbox"
                      id="allAgreement"
                      checked={Object.values(termsAgreed).every(Boolean)}
                      onChange={(e) =>
                        setTermsAgreed({
                          terms: e.target.checked,
                          privacy: e.target.checked,
                          device: e.target.checked,
                          AI: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-500"
                    />
                    <label
                      htmlFor="allAgreement"
                      className="text-md font-semibold"
                    >
                      이용약관 전체동의
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-300">
                    <input
                      type="checkbox"
                      id="termsAgreement"
                      checked={termsAgreed.terms}
                      onChange={(e) =>
                        setTermsAgreed((prev) => ({
                          ...prev,
                          terms: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-500"
                      required
                    />
                    <label htmlFor="termsAgreement" className="flex text-sm">
                      서비스 이용약관 동의{" "}
                      <div className="text-gray-500 ml-2">[필수]</div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-300">
                    <input
                      type="checkbox"
                      id="privacyAgreement"
                      checked={termsAgreed.privacy}
                      onChange={(e) =>
                        setTermsAgreed((prev) => ({
                          ...prev,
                          privacy: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-500"
                      required
                    />
                    <label htmlFor="privacyAgreement" className="flex text-sm">
                      개인정보 수집 및 이용 동의{" "}
                      <div className="text-gray-500 ml-2">[필수]</div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-300">
                    <input
                      type="checkbox"
                      id="deviceAgreement"
                      checked={termsAgreed.device}
                      onChange={(e) =>
                        setTermsAgreed((prev) => ({
                          ...prev,
                          device: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-500"
                      required
                    />
                    <label htmlFor="deviceAgreement" className="flex text-sm">
                      화상/음성 채팅 이용 동의{" "}
                      <div className="text-gray-500 ml-2">[필수]</div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-300">
                    <input
                      type="checkbox"
                      id="AIAgreement"
                      checked={termsAgreed.AI}
                      onChange={(e) =>
                        setTermsAgreed((prev) => ({
                          ...prev,
                          AI: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 rounded border-cyan-700 text-cyan-500 focus:ring-cyan-500"
                      required
                    />
                    <label htmlFor="AIAgreement" className="flex text-sm">
                      AI 욕설 감지 프로그램 설치 동의{" "}
                      <div className="text-gray-500 ml-2">[필수]</div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid()}
                  className="w-full rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-white text-xl font-bold focus:outline-none disabled:opacity-50 hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 transform shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                >
                  {isLoading ? "CREATING ACCOUNT..." : "JOIN WITH US"}
                </button>
              </form>
            </div>

            {/* 게임스러운 하단 장식 */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default RegisterModal;
