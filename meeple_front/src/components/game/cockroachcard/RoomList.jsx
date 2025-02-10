import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useCockroachSocket from "../../../hooks/useCockroachSocket";
import CreateRoomModal from "./modal/CreateRoomModal";

const RoomList = () => {
  const userId = useSelector((state) => state.user.userId);
  const userNickname = useSelector((state) => state.user.userNickname);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { connected, rooms, joinRoom } = useCockroachSocket("rooms");

  const handleJoinRoom = useCallback(
    async (roomId, isPrivate, password = "") => {
      try {
        if (!connected) throw new Error("서버 연결 끊김");
        if (!userNickname) throw new Error("사용자 정보 없음");

        await joinRoom({
          roomId,
          playerName: userNickname,
          password,
        });

        navigate(`/game/cockroach/${roomId}`);
      } catch (error) {
        console.error("방 참가 실패:", error);
        alert(error.message);
      } finally {
        if (showPasswordModal) {
          setShowPasswordModal(false);
          setPassword("");
          setSelectedRoom(null);
        }
      }
    },
    [connected, navigate, userNickname, joinRoom, showPasswordModal]
  );

  const renderRoom = useCallback(
    (room, index) => {
      const uniqueKey = room.roomId
        ? `room-${room.roomId}`
        : `temp-room-${index}`;
      const currentPlayers = Array.isArray(room.players)
        ? room.players.length
        : 0;
      const isFull = currentPlayers >= room.maxPeople;

      return (
        <div key={uniqueKey} className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">
            {room.roomId} {room.roomTitle || room.gameType}
          </h3>
          <div className="text-sm text-gray-600 mb-2">
            참가자: {currentPlayers} / {room.maxPeople}
          </div>
          <div className="text-sm text-gray-500 mb-2">방장: {room.creator}</div>
          <button
            onClick={() => {
              if (room.isPrivate) {
                setSelectedRoom(room.roomId);
                setShowPasswordModal(true);
              } else {
                handleJoinRoom(room.roomId, false);
              }
            }}
            disabled={isFull}
            className={`w-full px-4 py-2 rounded text-white ${
              isFull
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {room.isPrivate ? "비밀번호 입력" : "참가하기"}
          </button>
        </div>
      );
    },
    [handleJoinRoom]
  );

  // Debugging log
  console.log("방 제목 :", { userId, userNickname, connected, rooms });

  // Loading checks
  if (!connected) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">서버에 연결 중...</h2>
      </div>
    );
  }

  if (!rooms) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">방 목록을 불러오는 중...</h2>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">참가 가능한 방</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(rooms) && rooms.length > 0 ? (
          rooms.map(renderRoom)
        ) : (
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
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleJoinRoom(selectedRoom, true, password)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                확인
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                  setSelectedRoom(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
