import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateRoomModal = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:8090/api/game/create-room?roomId=${roomName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        onClose();
        navigate(`/game/cockroach/${roomName}`);
      } else {
        console.error('방 생성 실패');
      }
    } catch (error) {
      console.error('방 생성 중 오류 발생:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">방 만들기</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="방 이름을 입력하세요"
            className="w-full p-2 border rounded mb-4"
            required
          />
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