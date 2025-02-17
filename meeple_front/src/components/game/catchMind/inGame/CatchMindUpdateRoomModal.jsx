import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const CatchMindUpdateRoomModal = ({ isOpen, onClose, roomInfo, client }) => {
  const [formData, setFormData] = useState({
    roomTitle: "",
    isPrivate: false,
    password: "",
    maxPeople: "2",
    timeLimit: "90",
    quizCount: "5",
  });

  // 컴포넌트 마운트 시 현재 방 정보로 폼 초기화
  useEffect(() => {
    if (roomInfo) {
      setFormData({
        roomTitle: roomInfo.roomTitle || "",
        isPrivate: Boolean(roomInfo.isPrivate), // boolean 값 보장
        password: roomInfo.password || "",
        maxPeople: String(roomInfo.maxPeople || 2),
        timeLimit: String(roomInfo.timeLimit || 90),
        quizCount: String(roomInfo.quizCount || 5),
      });
    }
  }, [roomInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // RoomInfoDTO 구조에 맞게 데이터 구성
      const requestData = {
        roomTitle: formData.roomTitle.trim(),
        isPrivate: formData.isPrivate,
        password: formData.isPrivate ? formData.password : "", // 비공개가 아닐 경우 빈 문자열
        maxPeople: parseInt(formData.maxPeople),
        timeLimit: parseInt(formData.timeLimit),
        quizCount: parseInt(formData.quizCount),
      };

      // WebSocket을 통해 방 정보 업데이트 메시지 전송
      if (client) {
        client.publish({
          destination: `/app/update-room/${roomInfo.roomId}`,
          body: JSON.stringify(requestData),
          headers: { "content-type": "application/json" },
        });
      }

      onClose();
    } catch (error) {}
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-800 rounded-xl p-8 w-[448px] border-2 border-cyan-400 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-400">
            방 설정 수정
          </h2>
          <button
            onClick={onClose}
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
                <option value="5">5초</option>
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
              <option value="5">5개</option>
              <option value="7">7개</option>
              <option value="10">10개</option>
            </select>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg font-medium text-white
                     bg-gradient-to-r from-cyan-500 to-cyan-500 
                     hover:from-cyan-400 hover:to-blue-400 
                     transform transition-all duration-300 
                     active:scale-95
                     border border-cyan-400/50 shadow-lg"
          >
            💾 설정 저장
          </button>
        </form>
      </div>
    </div>
  );
};

export default CatchMindUpdateRoomModal;
