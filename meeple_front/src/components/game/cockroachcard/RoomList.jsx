import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import CreateRoomModal from "./modal/CreateRoomModal";

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [password, setPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user.userId);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // WebSocket 연결 설정
  const setupWebSocket = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8090/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("WebSocket 연결 성공");
      setConnected(true);
      stompClientRef.current = client;

      // 방 목록 업데이트 구독
      client.subscribe("/topic/game/rooms", (message) => {
        try {
          const roomList = JSON.parse(message.body);
          setRooms((prevRooms) => {
            const newRooms = roomList.sort((a, b) => b.roomId - a.roomId);
            // 방 목록이 실제로 변경되었을 때만 상태 업데이트
            return JSON.stringify(prevRooms) !== JSON.stringify(newRooms)
              ? newRooms
              : prevRooms;
          });
        } catch (error) {
          console.error("방 목록 업데이트 처리 실패:", error);
        }
      });
    };

    client.onDisconnect = () => {
      console.log("WebSocket 연결 해제");
      setConnected(false);
      stompClientRef.current = null;
    };

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = setupWebSocket();
    return cleanup;
  }, [setupWebSocket]);

  // 방 목록 조회
  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8090/game/rooms");
      if (!response.ok) {
        throw new Error("방 목록 조회에 실패했습니다.");
      }
      const data = await response.json();
      setRooms(data.sort((a, b) => b.roomId - a.roomId));
    } catch (error) {
      console.error("방 목록 조회 실패:", error);
    }
  }, []);

  useEffect(() => {
    fetchRooms(); // 초기 방 목록 로딩만 유지
  }, [fetchRooms]);

  // 방 참여 처리
  const handleJoinRoom = useCallback(
    async (roomId, isPrivate, password = "") => {
      try {
        if (!connected) {
          throw new Error("서버와의 연결이 끊어졌습니다.");
        }

        // 유저 프로필과 방 정보를 병렬로 조회
        const [profileResponse, roomCheckResponse] = await Promise.all([
          fetch(`http://localhost:8090/profile/${userId}`),
          fetch(`http://localhost:8090/game/room/${roomId}`),
        ]);

        if (!profileResponse.ok || !roomCheckResponse.ok) {
          throw new Error("프로필 또는 방 정보 조회에 실패했습니다.");
        }

        const [profileData, roomData] = await Promise.all([
          profileResponse.json(),
          roomCheckResponse.json(),
        ]);

        const userNickname = profileData.userNickname;

        // 이미 참여 중인 경우 바로 이동
        if (roomData.players.includes(userNickname)) {
          navigate(`/game/cockroach/${roomId}`);
          return;
        }

        if (stompClientRef.current) {
          // 방 참여 응답을 받기 위한 구독 설정
          const subscription = stompClientRef.current.subscribe(
            `/topic/game/${roomId}`,
            (message) => {
              try {
                const response = JSON.parse(message.body);
                if (response.code === 200) {
                  navigate(`/game/cockroach/${roomId}`);
                } else {
                  throw new Error(
                    response.message || "방 참여에 실패했습니다."
                  );
                }
              } catch (error) {
                console.error("방 참여 응답 처리 실패:", error);
                alert(error.message);
              } finally {
                subscription.unsubscribe();
              }
            }
          );

          // WebSocket으로 방 참여 요청
          stompClientRef.current.publish({
            destination: "/app/game/join-room",
            body: JSON.stringify({
              roomId: roomId,
              playerName: userNickname,
              password: password,
            }),
          });
          console.log(roomId, userNickname, password);
        }
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
    [connected, navigate, userId, showPasswordModal]
  );

  // 방 렌더링 최적화
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

  const handleCreateRoom = (roomData) => {
    // Implementation of handleCreateRoom
  };

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

      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={handleCreateRoom}
        stompClientRef={stompClientRef}
      />
    </div>
  );
};

export default RoomList;
