import React, { useState } from "react";
import { X, Lock, Users } from "lucide-react";

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    roomTitle: "",
    isPrivate: false,
    password: "",
    maxPeople: "4"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateRoom({
        ...formData,
        maxPeople: parseInt(formData.maxPeople)
      });
    } catch (error) {
      console.error("방 생성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      roomTitle: "",
      isPrivate: false,
      password: "",
      maxPeople: "4"
    });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 w-96 
                    border-2 border-blue-500/60 shadow-2xl transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-400">
            방 만들기
          </h2>
          <button
            onClick={handleClose}
            className="text-blue-400 hover:text-blue-300 transition-colors w-8 h-8 
                     flex items-center justify-center rounded-full hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Room Title */}
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-2">
              🎯 방 제목
            </label>
            <input
              type="text"
              value={formData.roomTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, roomTitle: e.target.value }))}
              maxLength={20}
              placeholder="방 제목을 입력하세요"
              required
              className="w-full p-3 bg-slate-700 border-2 border-blue-400/30 rounded-lg 
                       text-white placeholder-slate-400
                       focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Private Room Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-blue-400/20">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <label className="text-sm font-medium text-blue-400">비밀방</label>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
              className="relative inline-flex items-center cursor-pointer"
            >
              <div
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                  formData.isPrivate ? "bg-blue-500" : "bg-slate-600"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 mt-0.5
                           ${formData.isPrivate ? "translate-x-6" : "translate-x-1"}`}
                />
              </div>
            </button>
          </div>

          {/* Password Input (Conditional) */}
          {formData.isPrivate && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-blue-400 mb-2">
                🔑 비밀번호
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  if (value.length <= 8) {
                    setFormData(prev => ({ ...prev, password: value }));
                  }
                }}
                placeholder="숫자 8자리 이하"
                required={formData.isPrivate}
                className="w-full p-3 bg-slate-700 border-2 border-blue-400/30 rounded-lg 
                         text-white placeholder-slate-400
                         focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          )}

          {/* Max People Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                최대 인원
              </div>
            </label>
            <select
              value={formData.maxPeople}
              onChange={(e) => setFormData(prev => ({ ...prev, maxPeople: e.target.value }))}
              className="w-full p-3 bg-slate-700 border-2 border-blue-400/30 rounded-lg 
                       text-white appearance-none cursor-pointer
                       focus:outline-none focus:border-blue-400 transition-colors"
            >
              <option value="2">2인</option>
              <option value="3">3인</option>
              <option value="4">4인</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white
                     transform transition-all duration-300 
                     ${isSubmitting 
                       ? "bg-slate-600 cursor-not-allowed" 
                       : "bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400 active:scale-95"}
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

export default CreateRoomModal;