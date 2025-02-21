import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PasswordChangePage from "./PasswordChangePage";
import UserDeletePage from "./UserDeletePage";
import Heejun from "../../assets/images/pixel_character/pixel-heejun.png";
import Hongbeom from "../../assets/images/pixel_character/pixel-hongbeom.png";
import ProfilePicture from "./ProfilePicture";
import { Shield, Sword, Crown, Sparkles, Gem, Info } from "lucide-react";
import { toast } from 'react-toastify';

// Redux 액션들과 API 임포트
import {
  fetchProfile,
  setPasswordModalOpen,
  resetUpdateSuccess,
  clearError,
  setDeleteModalOpen,
  updateProfile,
} from "../../sources/store/slices/ProfileSlice";
import MyAward from "./MyAward";
import MyFavoriteGame from "./MyFavoriteGame";
import MyCustomRequest from "./MyCustomRequest";
import MyInformation from "./MyInformation";
import ProfileBio from "./ProfileBio";

const ProfilePage = () => {
  // URL 파라미터에서 userId를 추출하고 Redux dispatch 함수 가져오기
  const { userId } = useParams();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("info");
  const [showTooltip, setShowTooltip] = useState(false);

  // Redux store에서 필요한 상태들을 가져오기
  const {
    profileData: profile,
    isLoading,
    error,
    isPasswordModalOpen,
    isDeleteModalOpen,
    updateSuccess,
  } = useSelector((state) => state.profile);

  // LocalDateTime 형식과 input date 형식 간의 변환 함수들
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return dateString.split("T")[0]; // "2024-01-26T00:00:00" -> "2024-01-26"
  };

  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    userName: "",
    userNickname: "",
    userBirthday: "",
  });

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
        userBio: profile.userBio,
      });
    }
  }, [profile]);

  // 프로필 업데이트 후에도 경험치 정보를 유지하기 위한 상태
  const [expData, setExpData] = useState({
    userExp: 0,
    userLevel: 0,
  });

  // 컴포넌트 마운트 시 프로필 데이터 로드
  useEffect(() => {
    dispatch(fetchProfile(userId));
  }, [dispatch, userId]);

  // 프로필 데이터가 로드되면 경험치 정보도 업데이트
  useEffect(() => {
    if (profile) {
      setExpData({
        userExp: profile.userExp,
        userLevel: profile.userLevel,
      });
    }
  }, [profile]);

  // 경험치 바 퍼센트 계산 함수를 수정된 상태를 사용하도록 변경
  const calculateExpPercentage = () => {
    const maxExp = 300;
    // 레벨이 30이면 100% 반환
    if (expData.userLevel >= 30) {
      return 100;
    }
    return (expData.userExp / maxExp) * 100;
  };

  // 프로필 업데이트 핸들러
  const handleProfileUpdate = async (formData) => {
    try {
      const result = await dispatch(
        updateProfile({ userId, data: formData })
      ).unwrap();
      // 업데이트 성공 후 전체 프로필을 다시 불러옴
      await dispatch(fetchProfile(userId));
    } catch (error) {
      console.error("프로필 업데이트 실패:", error);
      toast.error("프로필 업데이트에 실패했습니다.");
    }
  };

  // 에러 발생 시 처리
  useEffect(() => {
    if (error) {
      toast.error(error);
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
    <div className="min-h-screen mt-10">
      <div className="max-w-3xl mx-auto bg-zinc-900/80 rounded-[40px] border border-cyan-400/40">
        <div className="max-w-3xl mx-auto py-6 px-8">
          {/* 프로필 헤더 */}
          <div className="mb-8">
            <div className="rounded-xl p-7 bg-zinc-900/60 shadow-lg backdrop-blur-sm border border-zinc-700/50">
              <div className="flex items-start gap-8">
                {/* 프로필 이미지 */}
                <div className="mt-2">
                  <ProfilePicture
                    initialImageUrl={profile.userProfilePictureUrl}
                    defaultImageUrl={Heejun}
                    onSave={handleProfileUpdate}
                  />
                </div>

                {/* 사용자 정보 */}
                <div className="flex-1">
                  <div className="flex flex-col space-y-3">
                    {/* 닉네임과 레벨 영역 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-white">
                          {profile.userNickname}
                        </h1>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/80 rounded-full border border-cyan-500/20">
                          {profile.userLevel <= 9 ? (
                            <Shield size={16} className="text-cyan-400" />
                          ) : profile.userLevel <= 19 ? (
                            <Sword size={16} className="text-emerald-400" />
                          ) : profile.userLevel <= 29 ? (
                            <Crown size={16} className="text-yellow-400" />
                          ) : (
                            <Gem size={16} className="text-red-400" />
                          )}
                          <span className="text-cyan-400 text-sm font-semibold">
                            {profile.userLevel >= 30
                              ? `Lv.MAX`
                              : `Lv.${profile.userLevel}`}
                          </span>
                        </div>
                        <div className="relative">
                          <button
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            <Info className="text-gray-400/80 w-5 h-5 -ml-1.5 mt-2" />
                          </button>

                          {showTooltip && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg min-w-[180px]">
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-zinc-700" />
                              <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-r-[7px] border-r-zinc-800" />
                              <h3 className="text-sm font-semibold text-white mb-2">
                                레벨별 등급
                              </h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Shield size={16} className="text-cyan-400" />
                                  <span className="text-sm text-zinc-300">
                                    Lv.0-9 뉴비
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Sword
                                    size={16}
                                    className="text-emerald-400"
                                  />
                                  <span className="text-sm text-zinc-300">
                                    Lv.10-19 중수
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Crown
                                    size={16}
                                    className="text-yellow-400"
                                  />
                                  <span className="text-sm text-zinc-300">
                                    Lv.20-29 고수
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Gem size={16} className="text-red-400" />
                                  <span className="text-sm text-zinc-300">
                                    Lv.30(Max) 마스터
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 자기소개 영역 */}
                    <div className="mt-4">
                      <ProfileBio
                        initialBio={profile?.userBio}
                        onSave={async (newBio) => {
                          const formDataToSend = new FormData();
                          const userInfo = { userBio: newBio };
                          const userInfoBlob = new Blob(
                            [JSON.stringify(userInfo)],
                            {
                              type: "application/json",
                            }
                          );
                          formDataToSend.append("userInfo", userInfoBlob);
                          await handleProfileUpdate(formDataToSend);
                        }}
                      />
                    </div>

                    {/* 경험치 바 영역 */}
                    <div className="w-full mt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-md text-zinc-400">
                          {expData.userLevel >= 30
                            ? `Level MAX`
                            : `Level ${expData.userLevel}`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-cyan-400" />
                          <span className="text-md font-medium text-cyan-400">
                            {expData.userLevel >= 30
                              ? "300/300"
                              : `${expData.userExp}/300`}
                          </span>
                        </div>
                      </div>

                      <div className="relative h-8">
                        <div className="absolute top-3 left-0 w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculateExpPercentage()}%`,
                            }}
                          />
                        </div>
                        <img
                          src={Hongbeom}
                          alt="Heejun character"
                          className="absolute w-8 h-8 object-contain"
                          style={{
                            left: `${calculateExpPercentage()}%`,
                            transform: "translateX(-50%)",
                            textShadow:
                              "0 0 20px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.2)",
                            filter:
                              "drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))",
                          }}
                        />
                      </div>

                      {expData.userLevel >= 30 ? (
                        <div className="text-center mt-1.5">
                          <span className="text-sm text-zinc-500">
                            Level MAX
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between mt-1.5">
                          <span className="text-sm text-zinc-500">
                            Lv.{expData.userLevel}
                          </span>
                          <span className="text-sm text-zinc-500">
                            Lv.{expData.userLevel + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 마이페이지 네비게이션 */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "내 정보", id: "info" },
                { name: "내 업적", id: "achievements" },
                { name: "내 요청", id: "requests" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition-all
                    ${
                      activeTab === item.id
                        ? "bg-cyan-500 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div>
            {activeTab === "info" && <MyInformation />}
            {activeTab === "achievements" && <MyAward />}
            {activeTab === "requests" && <MyCustomRequest />}
          </div>
        </div>
      </div>

      {/* 모달 컴포넌트들 */}
      {isPasswordModalOpen && (
        <PasswordChangePage
          userId={userId}
          onClose={() => dispatch(setPasswordModalOpen(false))}
        />
      )}
      {isDeleteModalOpen && (
        <UserDeletePage
          userId={userId}
          onClose={() => dispatch(setDeleteModalOpen(false))}
        />
      )}
    </div>
  );
};

export default ProfilePage;
