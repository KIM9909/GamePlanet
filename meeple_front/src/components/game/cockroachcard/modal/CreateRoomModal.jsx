import React, { useState } from "react";
import { useSelector } from "react-redux"; // Redux 추가

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom }) => {
  const [roomTitle, setRoomTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [maxPeople, setMaxPeople] = useState(4);
  
  // 현재 유저 정보 가져오기
  const currentUser = useSelector((state) => state.user.userId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const roomData = {
      gameId: 1,
      roomTitle,
      creator: currentUser, // 하드코딩된 'testUser' 대신 실제 유저 ID 사용
      private: isPrivate,
      password: isPrivate ? password : "",
      maxPeople: maxPeople,
    };
    await onCreateRoom(roomData);
    onClose();
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">방 만들기</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value)}
            placeholder="방 이름을 입력하세요"
            className="w-full p-2 border rounded mb-4"
            required
          />
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mr-2"
              />
              비밀방으로 만들기
            </label>
          </div>
          {isPrivate && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full p-2 border rounded mb-4"
              required
            />
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 인원
            </label>
            <select
              value={maxPeople}
              onChange={(e) => setMaxPeople(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={2}>2명</option>
              <option value={3}>3명</option>
              <option value={4}>4명</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
