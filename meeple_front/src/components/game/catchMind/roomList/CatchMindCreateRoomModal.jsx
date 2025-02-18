import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CatchMindAPI } from "../../../../sources/api/CatchMindAPI";
import { fetchProfile } from "../../../../sources/store/slices/ProfileSlice";
import { toast } from "react-toastify";
import CustomToastContent from "../../../CustomToastContent";

const CatchMindCreateRoomModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.user.userId);
  const profileData = useSelector((state) => state.profile.profileData);
  const token = useSelector((state) => state.user.token);

  // 폼 제출 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 컴포넌트 마운트 시 프로필 정보 가져오기
  useEffect(() => {
    if (userId) {
      dispatch(fetchProfile(userId));
    }
  }, [userId, dispatch]);

  const [formData, setFormData] = useState({
    roomTitle: "",
    isPrivate: false,
    password: "",
    maxPeople: "2",
    timeLimit: "90",
    quizCount: "5",
  });

  const handleClose = () => {
    setFormData({
      roomTitle: "",
      isPrivate: false,
      password: "",
      maxPeople: "2",
      timeLimit: "90",
      quizCount: "5",
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const localToken = localStorage.getItem("token");
      if (!localToken || !token || localToken !== token) {
        setIsSubmitting(false);
        return;
      }

      const requestData = {
        roomTitle: formData.roomTitle,
        creator: profileData?.userNickname,
        isPrivate: formData.isPrivate,
        password: formData.password,
        maxPeople: parseInt(formData.maxPeople),
        timeLimit: parseInt(formData.timeLimit),
        quizCount: parseInt(formData.quizCount),
        gameId: 1,
      };

      const response = await CatchMindAPI.createRoom(requestData);

      if (response.roomId) {
        navigate(`/catch-mind/${response.roomId}`);
      }
    } catch (error) {
      if (error.response?.status === 500) {
        toast(
          ({ closeToast }) => <CustomToastContent closeToast={closeToast} />,
          {
            position: "top-center",
            autoClose: false,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            className: "!bg-transparent !p-0 !shadow-none",
            toastClassName: "!bg-transparent !p-0",
            bodyClassName: "!p-0 !m-0",
            closeButton: false, // 기본 닫기 버튼 비활성화
            style: {
              background: "transparent",
              padding: 0,
            },
          }
        );
        handleClose();
      }

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 ${
        !isOpen && "hidden"
      }`}
    >
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-96 border-2 border-cyan-500/60 shadow-2xl transform transition-all duration-300">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-400">
            방 만들기
          </h2>
          <button
            onClick={handleClose}
            className="text-cyan-400 hover:text-cyan-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 방 제목 입력 */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              🎯 방 제목
            </label>
            <input
              type="text"
              value={formData.roomTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  roomTitle: e.target.value,
                }))
              }
              className="w-full p-3 bg-slate-700 border-2 border-cyan-400/30 rounded-lg 
                       text-white placeholder-slate-400
                       focus:outline-none focus:border-cyan-400 transition-colors"
              placeholder="방 제목을 입력하세요"
              required
            />
          </div>

          {/* 비밀방 설정 */}
          {/* <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-cyan-400/20">
            <label className="text-sm font-medium text-cyan-400">
              🔒 비밀방
            </label>
            <div
              className="relative inline-flex items-center cursor-pointer"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  isPrivate: !prev.isPrivate,
                }))
              }
            >
              <div
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                  formData.isPrivate ? "bg-cyan-500" : "bg-slate-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
                    formData.isPrivate ? "translate-x-6" : "translate-x-1"
                  } mt-0.5`}
                />
              </div>
            </div>
          </div> */}

          {/* 비밀번호 입력 */}
          {/* {formData.isPrivate && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                🔑 비밀번호
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 8) {
                    setFormData((prev) => ({
                      ...prev,
                      password: value,
                    }));
                  }
                }}
                className="w-full p-3 bg-slate-700 border-2 border-cyan-400/30 rounded-lg 
                         text-white placeholder-slate-400
                         focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="숫자 8자리 이하"
                required={formData.isPrivate}
              />
            </div>
          )} */}

          {/* 게임 설정 그리드 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 최대 인원 선택 */}
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                👥 최대 인원
              </label>
              <select
                value={formData.maxPeople}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxPeople: e.target.value,
                  }))
                }
                className="w-full p-3 bg-slate-700 border-2 border-cyan-400/30 rounded-lg 
                         text-white appearance-none cursor-pointer
                         focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="2">2인</option>
                <option value="3">3인</option>
                <option value="4">4인</option>
              </select>
            </div>

            {/* 제한 시간 설정 */}
            <div>
              <label className="block text-sm font-medium text-cyan-400 mb-2">
                ⏱️ 제한 시간
              </label>
              <select
                value={formData.timeLimit}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    timeLimit: e.target.value,
                  }))
                }
                className="w-full p-3 bg-slate-700 border-2 border-cyan-400/30 rounded-lg 
                         text-white appearance-none cursor-pointer
                         focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="60">60초</option>
                <option value="90">90초</option>
                <option value="120">120초</option>
              </select>
            </div>
          </div>

          {/* 퀴즈 개수 설정 */}
          <div>
            <label className="block text-sm font-medium text-cyan-400 mb-2">
              📝 퀴즈 개수
            </label>
            <select
              value={formData.quizCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  quizCount: e.target.value,
                }))
              }
              className="w-full p-3 bg-slate-700 border-2 border-cyan-400/30 rounded-lg 
                       text-white appearance-none cursor-pointer
                       focus:outline-none focus:border-cyan-400 transition-colors"
            >
              <option value="3">3개</option>
              <option value="7">7개</option>
              <option value="10">10개</option>
            </select>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white
                     transform transition-all duration-300
                     ${
                       isSubmitting
                         ? "bg-slate-600 cursor-not-allowed"
                         : "bg-gradient-to-r from-cyan-500 to-cyan-500 hover:from-cyan-400 hover:to-cyan-400 active:scale-95"
                     }
                     border border-cyan-400/50 shadow-lg`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                방 생성 중...
              </span>
            ) : (
              "🎮 방 만들기"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CatchMindCreateRoomModal;
