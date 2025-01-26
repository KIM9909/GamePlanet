// React와 필요한 훅, 컴포넌트들을 임포트
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PasswordChangePage from "./PasswordChangePage";
// Redux 액션들과 API 임포트
import {
  fetchProfile,
  updateProfile,
  setEditing,
  setPasswordModalOpen,
  resetUpdateSuccess,
  clearError,
} from "../../sources/api/store/slices/ProfileSlice";
import { UserAPI } from "../../sources/api/UserAPI";

const ProfilePage = () => {
  // URL 파라미터에서 userId를 추출하고 Redux dispatch 함수 가져오기
  const { userId } = useParams();
  const dispatch = useDispatch();

  // 입력값 검증을 위한 정규식 패턴 정의
  const REGEX = {
    nickname: /^[a-zA-Z0-9가-힣]{2,10}$/, // 2-10자의 한글, 영문, 숫자
    name: /^[가-힣]{2,5}$/, // 2-5자의 한글
  };

  // 각 필드의 유효성 상태를 관리하는 state
  const [validations, setValidations] = useState({
    validName: true, // 이름 형식의 유효성
    validNickname: true, // 닉네임 형식의 유효성
    nicknameChecked: false, // 닉네임 중복 검사 수행 여부
    nicknameDuplicate: false, // 닉네임 중복 여부
  });

  // Redux store에서 필요한 상태들을 가져오기
  const {
    profileData: profile,
    isLoading,
    error,
    isEditing,
    isPasswordModalOpen,
    updateSuccess,
  } = useSelector((state) => state.profile);

  // LocalDateTime 형식과 input date 형식 간의 변환 함수들
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // "2024-01-26T00:00:00" -> "2024-01-26"
  };

  const formatDateForApi = (dateString) => {
    if (!dateString) return null;
    return `${dateString}T00:00:00`; // "2024-01-26" -> "2024-01-26T00:00:00"
  };

  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    userName: "",
    userNickname: "",
    userBirthday: "",
  });

  // 각 필드별 유효성 검사 함수
  const validateField = (name, value) => {
    switch (name) {
      case "userName":
        return REGEX.name.test(value);
      case "userNickname":
        return REGEX.nickname.test(value);
      default:
        return true;
    }
  };

  // 닉네임 중복 검사 처리 함수
  const handleNicknameCheck = async () => {
    // 닉네임 형식이 유효하지 않으면 중복 검사 수행하지 않음
    if (!validations.validNickname) {
      alert("닉네임 형식을 확인해주세요.");
      return;
    }

    try {
      // API를 통해 닉네임 중복 검사 수행
      const isDuplicate = await UserAPI.checkNickname(formData.userNickname);
      setValidations((prev) => ({
        ...prev,
        nicknameChecked: true,
        nicknameDuplicate: isDuplicate,
      }));

      // 검사 결과에 따른 알림 표시
      if (isDuplicate) {
        alert("이미 사용 중인 닉네임입니다.");
      } else {
        alert("사용 가능한 닉네임입니다.");
      }
    } catch (error) {
      alert("닉네임 중복 검사 중 오류가 발생했습니다.");
    }
  };

  // 컴포넌트 마운트 시 프로필 데이터 로드
  useEffect(() => {
    dispatch(fetchProfile(userId));
  }, [dispatch, userId]);

  // 프로필 데이터가 로드되면 폼 데이터 업데이트
  useEffect(() => {
    if (profile) {
      setFormData({
        userName: profile.userName,
        userNickname: profile.userNickname,
        userBirthday: formatDateForInput(profile.userBirthday),
      });
    }
  }, [profile]);

  // 입력 필드 값 변경 처리 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 이름이나 닉네임 필드가 변경될 때 유효성 검사 수행
    if (name === "userName" || name === "userNickname") {
      const isValid = validateField(name, value);
      setValidations((prev) => ({
        ...prev,
        [name === "userName" ? "validName" : "validNickname"]: isValid,
        // 닉네임이 변경되면 중복 검사 상태 초기화
        ...(name === "userNickname"
          ? {
              nicknameChecked: false,
              nicknameDuplicate: false,
            }
          : {}),
      }));
    }
  };

  // 폼 제출 처리 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!validations.validName || !validations.validNickname) {
      alert("입력된 정보를 다시 확인해주세요.");
      return;
    }

    // 닉네임 중복 검사 확인
    if (!validations.nicknameChecked) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }

    if (validations.nicknameDuplicate) {
      alert("이미 사용 중인 닉네임입니다.");
      return;
    }

    // API 요청을 위한 데이터 준비
    const apiData = {
      ...formData,
      userBirthday: formatDateForApi(formData.userBirthday),
    };

    try {
      // 프로필 업데이트 요청 전송
      await dispatch(
        updateProfile({
          userId,
          data: apiData,
        })
      ).unwrap();
      alert("프로필이 성공적으로 수정되었습니다.");
    } catch (error) {
      alert(error.message || "프로필 수정에 실패했습니다.");
    }
  };

  // 취소 버튼 핸들러
  const handleCancel = () => {
    // 폼 데이터를 원래 프로필 데이터로 복원
    setFormData({
      userName: profile.userName,
      userNickname: profile.userNickname,
      userBirthday: formatDateForInput(profile.userBirthday),
    });

    // 유효성 검사 상태도 초기화
    setValidations({
      validName: true,
      validNickname: true,
      nicknameChecked: false,
      nicknameDuplicate: false,
    });

    // 수정 모드 종료
    dispatch(setEditing(false));
  };

  // 프로필 수정 성공 시 처리
  useEffect(() => {
    if (updateSuccess) {
      alert("변경이 완료되었습니다.");
      dispatch(resetUpdateSuccess());
    }
  }, [updateSuccess, dispatch]);

  // 에러 발생 시 처리
  useEffect(() => {
    if (error) {
      alert(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // 로딩 상태 처리
  if (isLoading && !profile) return <div className="p-4">Loading...</div>;
  if (error && !profile)
    return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!profile) return null;

  // UI 렌더링
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        {/* 프로필 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {profile.userNickname}님의 프로필
          </h1>
          {!isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={() => dispatch(setPasswordModalOpen(true))}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                비밀번호 변경
              </button>
              <button
                onClick={() => dispatch(setEditing(true))}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                수정하기
              </button>
            </div>
          )}
        </div>

        {/* 수정 모드 / 조회 모드 전환 */}
        {isEditing ? (
          // 수정 폼
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 입력 필드 */}
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  formData.userName && !validations.validName
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="2-5자의 한글만 입력 가능합니다"
              />
              {formData.userName && !validations.validName && (
                <p className="text-sm text-red-500 mt-1">
                  이름은 2-5자의 한글만 가능합니다.
                </p>
              )}
            </div>

            {/* 닉네임 입력 필드 */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium mb-1">닉네임</label>
                <button
                  type="button"
                  onClick={handleNicknameCheck}
                  className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                >
                  중복확인
                </button>
              </div>
              <input
                type="text"
                name="userNickname"
                value={formData.userNickname}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  formData.userNickname &&
                  (!validations.validNickname || validations.nicknameDuplicate)
                    ? "border-red-500"
                    : validations.nicknameChecked &&
                      !validations.nicknameDuplicate
                    ? "border-green-500"
                    : "border-gray-300"
                }`}
                placeholder="2-10자의 한글, 영문, 숫자만 입력 가능합니다"
              />
              {formData.userNickname && !validations.validNickname && (
                <p className="text-sm text-red-500 mt-1">
                  닉네임은 2-10자의 한글, 영문, 숫자만 가능합니다.
                </p>
              )}
              {formData.userNickname &&
                validations.nicknameChecked &&
                validations.nicknameDuplicate && (
                  <p className="text-sm text-red-500 mt-1">
                    이미 사용 중인 닉네임입니다.
                  </p>
                )}
            </div>

            {/* 생년월일 입력 필드 */}
            <div>
              <label className="block text-sm font-medium mb-1">생년월일</label>
              <input
                type="date"
                name="userBirthday"
                value={formData.userBirthday}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>

            {/* 폼 버튼 */}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={
                  isLoading ||
                  !validations.validName ||
                  !validations.validNickname ||
                  !validations.nicknameChecked ||
                  validations.nicknameDuplicate
                }
              >
                {isLoading ? "저장 중..." : "저장"}
              </button>
            </div>
          </form>
        ) : (
          // 조회 모드
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="font-medium">{profile.userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="font-medium">{profile.userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">생년월일</p>
                <p className="font-medium">
                  {formatDateForInput(profile.userBirthday)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">레벨</p>
                <p className="font-medium">{profile.userLevel}</p>
              </div>
            </div>
          </div>
        )}

        {/* 비밀번호 변경 모달 */}
        {isPasswordModalOpen && (
          <PasswordChangePage
            userId={userId}
            onClose={() => dispatch(setPasswordModalOpen(false))}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
