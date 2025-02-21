import React, { useState } from "react";
import { CockroachAPI } from "../../../../sources/api/CockroachAPI";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";

const PasswordModal = ({ isOpen, onClose, roomId, roomTitle, onSuccessfulEntry }) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileData = useSelector((state) => state.profile.profileData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const userNickname = profileData.userNickname
      
      await CockroachAPI.joinRoom({
        roomId,
        playerName: userNickname,
        password
      });

      onSuccessfulEntry(roomId);
      handleClose();
    } catch (error) {
      console.error("방 입장 오류:", error);
      toast.error("비밀번호가 일치하지 않습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-96 border-2 border-blue-500/60 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">
            비밀번호 입력
          </h2>
          <button
            onClick={handleClose}
            className="text-blue-400 hover:text-blue-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg text-white mb-2">{roomTitle}</h3>
          <p className="text-sm text-blue-300">비밀번호를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              if (value.length <= 8) {
                setPassword(value);
              }
            }}
            className="w-full p-3 bg-slate-700 border-2 border-blue-400/30 rounded-lg 
                     text-white placeholder-slate-400
                     focus:outline-none focus:border-blue-400 transition-colors"
            placeholder="숫자 8자리 이하"
            required
            autoFocus
          />

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-300"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg font-medium text-white
                       transform transition-all duration-300
                       ${
                         isSubmitting
                           ? "bg-slate-600 cursor-not-allowed"
                           : "bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400 active:scale-95"
                       }
                       border border-blue-400/50 shadow-lg`}
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
                  확인 중...
                </span>
              ) : (
                "확인"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;