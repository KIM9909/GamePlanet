import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.userId);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:8090/game/rooms');
      const data = await response.json();
      // 최신 방 6개만 표시
      const sortedRooms = data.sort((a, b) => b.roomId - a.roomId).slice(0, 6);
      setRooms(sortedRooms);
    } catch (error) {
      console.error('방 목록 조회 실패:', error);
    }
  };

  const handleJoinRoom = async (roomId, isPrivate, password = '') => {
    if (!roomId) {
      console.error('유효하지 않은 방 ID');
      return;
    }
  
    try {
      const formData = new URLSearchParams();
      formData.append('roomId', roomId.toString());
      formData.append('playerName', userId.toString());
      formData.append('password', password);

      console.log("Joining room with data:", {
        roomId: roomId,
        playerName: userId,
        password: password
      });

      const response = await fetch('http://localhost:8090/game/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const responseData = await response.json();
      console.log("Join room response:", responseData);
  
      if (response.ok && responseData.code === 200) {
        navigate(`/game/cockroach/${roomId}`);
      } else {
        console.error('방 참가 실패:', responseData.message);
        alert(responseData.message || '방 참가에 실패했습니다.');
      }
    } catch (error) {
      console.error('방 참가 실패:', error);
      alert('방 참가 중 오류가 발생했습니다.');
    } finally {
      if (showPasswordModal) {
        setShowPasswordModal(false);
        setPassword('');
      }
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">참가 가능한 방</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(rooms) ? rooms.map((room) => {
          const uniqueKey = `room-${room.roomId}`;
          const currentPlayers = Array.isArray(room.players) ? room.players.length : 0;
          
          return (
            <div key={uniqueKey} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">
                {room.roomTitle || room.gameType}
              </h3>
              <div className="text-sm text-gray-600 mb-2">
                참가자: {currentPlayers} / {room.maxPeople}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                방장: {room.creator}
              </div>
              <button
                onClick={() => {
                  if (room.isPrivate) {
                    setSelectedRoom(room.roomId);
                    setShowPasswordModal(true);
                  } else {
                    handleJoinRoom(room.roomId, false);
                  }
                }}
                disabled={currentPlayers >= room.maxPeople}
                className={`w-full px-4 py-2 rounded text-white
                  ${currentPlayers >= room.maxPeople 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {room.isPrivate ? '비밀번호 입력' : '참가하기'}
              </button>
            </div>
          );
        }) : (
          <div>방이 없습니다.</div>
        )}
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="font-bold mb-4">비밀번호 입력</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 mb-4"
              placeholder="비밀번호를 입력하세요"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleJoinRoom(selectedRoom, true, password)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                확인
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;