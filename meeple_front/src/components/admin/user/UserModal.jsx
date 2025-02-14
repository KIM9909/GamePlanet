import React, { useState, useEffect } from "react";
import AdminAPI from "../../../sources/api/AdminAPI";

const UserModal = ({ isOpen, onClose, user, onSave }) => {
  const [userName, setUserName] = useState("");
  const [userNickname, setUserNickname] = useState("");
  const [userBio, setUserBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modal이 열릴 때마다 사용자 정보를 초기화
  useEffect(() => {
    if (user) {
      setUserName(user.userName || "");
      setUserNickname(user.userNickname || "");
      setUserBio(user.userBio || "");
    }
  }, [user]);

  // 사용자 정보 수정
  const handleSave = async () => {
    setIsLoading(true);
    const updatedUser = {
      userName,
      userNickname,
      userBio,
    };

    try {
      await AdminAPI.updateUserProfile(user.userId, updatedUser);
      alert("사용자 정보가 수정되었습니다.");
      onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error("사용자 정보 수정에 실패했습니다.", error);
      alert("수정 실패: " + (error.message || "알 수 없는 오류"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-[480px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          사용자 정보 수정
        </h2>
  
        {/* 이름 입력 필드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            이름
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg 
            focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
  
        {/* 닉네임 입력 필드 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            닉네임
          </label>
          <input
            type="text"
            value={userNickname}
            onChange={(e) => setUserNickname(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg 
            focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
  
        {/* 사용자 소개 입력 필드 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            자기소개
          </label>
          <textarea
            value={userBio}
            onChange={(e) => setUserBio(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg 
            focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
            rows="4"
          />
        </div>
  
        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 text-white rounded-lg transition-colors
            ${isLoading 
              ? "bg-slate-600 cursor-not-allowed" 
              : "bg-cyan-500 hover:bg-cyan-600"}`}
            disabled={isLoading}
          >
            {isLoading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
