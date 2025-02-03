import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Timer,
  Pencil,
  Eraser,
  Trash2,
  Users,
  Lock,
  LogOut,
  Flag,
} from "lucide-react";
import Canvas from "./Canvas";
import ChatBox from "./ChatBox";
import PlayerCard from "./PlayerCard";
import { updatePlayers } from "../../../../sources/store/slices/CatchMindSlice";
import { fetchProfile } from "../../../../sources/store/slices/ProfileSlice";
import { CatchMindAPI } from "../../../../sources/api/CatchMindAPI";
import useCatchSocket from "../../../../hooks/useCatchSocket";

const GameInfo = ({ round, word, roomInfo, handleExitRoom }) => {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg border-b border-gray-700">
      {/* 왼쪽: 방 제목과 잠금 아이콘 */}
      <div className="flex items-center space-x-2 min-w-[200px]">
        <h2 className="text-xl font-bold truncate">{roomInfo?.roomTitle}</h2>
        {roomInfo?.isPrivate && (
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* 중앙: 게임 상태 정보 */}
      <div className="flex items-center justify-center space-x-6 flex-1 mx-4">
        <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-full">
          <Flag className="w-4 h-4 text-blue-400" />
          <span className="font-medium">
            Round {round}/{roomInfo?.quizCount || 10}
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2 rounded-full">
          <Timer className="w-4 h-4 text-blue-400" />
          <span className="font-medium">{roomInfo?.timeLimit}초</span>
        </div>

        {word && (
          <div className="px-6 py-2 bg-blue-500/20 rounded-full border border-blue-400/30">
            <span className="font-medium text-blue-100">제시어: {word}</span>
          </div>
        )}
      </div>

      {/* 오른쪽: 플레이어 수와 나가기 버튼 */}
      <div className="flex items-center space-x-4 min-w-[200px] justify-end">
        <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-full">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-gray-200">
            {roomInfo?.players?.length || 0}/{roomInfo?.maxPeople}
          </span>
        </div>
        <button
          onClick={handleExitRoom}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>나가기</span>
        </button>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState(null);
  const [isInitialJoin, setIsInitialJoin] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const gameState = useSelector((state) => state.catchmind);
  const profileData = useSelector((state) => state.profile.profileData);
  const userId = useSelector((state) => state.user.userId);

  // useCatchSocket hook 사용
  const { sendMessage, client } = useCatchSocket(roomId);

  // 드로잉 도구 상태 관리
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedWidth, setSelectedWidth] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(null);

  // 현재 턴인 플레이어 찾기
  const currentPlayer = useSelector((state) =>
    state.catchmind.players.find((p) => p.isTurn)
  );

  const getCurrentUserNickname = useCallback(() => {
    return profileData?.userNickname || "Player 1";
  }, [profileData?.userNickname]);

  // 방 나가기 처리
  const handleExitRoom = useCallback(async () => {
    if (!roomId || !profileData?.userNickname || isExiting || !client) return;

    try {
      setIsExiting(true);
      console.log("[ExitRoom] Starting exit process");

      // 방장인지 확인하고 방장이면 업데이트 먼저 수행
      if (roomInfo?.creator === profileData.userNickname) {
        // 다른 플레이어 중 첫 번째 플레이어에게 방장 권한 넘기기
        const nextCreator = roomInfo.players.find(
          (player) => player !== profileData.userNickname
        );
        if (nextCreator) {
          try {
            // 방 정보 업데이트 (새로운 방장 설정)
            await client.publish({
              destination: `/app/update-room/${roomId}`,
              body: JSON.stringify({
                roomTitle: roomInfo.roomTitle,
                creator: nextCreator,
                maxPeople: roomInfo.maxPeople,
                timeLimit: roomInfo.timeLimit,
                quizCount: roomInfo.quizCount,
                isPrivate: roomInfo.isPrivate,
                password: roomInfo.password,
                players: roomInfo.players,
              }),
              headers: { "content-type": "application/json" },
            });

            // 업데이트가 적용될 시간을 주기 위해 잠시 대기
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error("[ExitRoom] Error updating room creator:", error);
          }
        }
      }

      // 이후 방 나가기 메시지 전송
      client.publish({
        destination: `/app/exit-room/${roomId}`,
        body: profileData.userNickname, // userName만 문자열로 전송
        headers: { "content-type": "text/plain" },
      });

      console.log("[ExitRoom] Exit message sent to server");

      // 상태 초기화 및 로비로 이동
      setTimeout(() => {
        setIsExiting(false);
        console.log("[ExitRoom] Navigating to lobby");
        navigate("/catch-mind");
      }, 500);
    } catch (error) {
      console.error("[ExitRoom] Error during exit:", error);
      setIsExiting(false);
    }
  }, [
    roomId,
    profileData?.userNickname,
    client,
    navigate,
    isExiting,
    roomInfo,
  ]);

  // WebSocket을 통한 방 업데이트 구독
  useEffect(() => {
    if (roomId) {
      sendMessage({
        destination: `/topic/catch-mind/${roomId}`,
        subscribe: true,
        callback: (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data.players) {
              // 플레이어 목록 업데이트
              const players = data.players.map((player, index) => ({
                id: index + 1,
                nickname: player,
                score: 0,
                isTurn: index === 0,
                isCurrentUser: player === profileData?.userNickname,
              }));
              dispatch(updatePlayers({ players }));
              setRoomInfo((prev) => ({ ...prev, players: data.players }));
            }
          } catch (error) {
            console.error("메시지 파싱 오류:", error);
          }
        },
      });
    }
  }, [roomId, dispatch, profileData?.userNickname, sendMessage]);

  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      if (isExiting) {
        console.log("[ExitRoom] Component cleanup initiated");
      }
    };
  }, [isExiting]);

  // 프로필 정보 가져오기
  useEffect(() => {
    if (userId) {
      dispatch(fetchProfile(userId));
    }
  }, [userId, dispatch]);

  // 방 정보 가져오기
  useEffect(() => {
    const fetchRoomInfo = async () => {
      try {
        const response = await CatchMindAPI.getRoomList();
        const currentRoom = response.find(
          (room) => room.roomId === parseInt(roomId)
        );

        if (currentRoom) {
          const cleanedRoom = {
            ...currentRoom,
            players: Array.isArray(currentRoom.players)
              ? [...new Set(currentRoom.players.filter(Boolean))]
              : [],
          };

          // roomInfo가 실제로 변경되었을 때만 상태 업데이트
          setRoomInfo((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(cleanedRoom)) {
              return cleanedRoom;
            }
            return prev;
          });

          const currentUserNickname = getCurrentUserNickname();
          const players = cleanedRoom.players.map((player, index) => ({
            id: index + 1,
            nickname: player,
            score: currentRoom.gameInfo?.playerScore?.[player] || 0,
            isTurn: currentRoom.gameInfo?.currentTurn // currentTurn이 있으면 그 값을 사용
              ? player === currentRoom.gameInfo.currentTurn
              : index === 0, // 없으면 첫 번째 플레이어가 턴
            isCurrentUser: player === currentUserNickname,
          }));

          // players 정보가 실제로 변경되었을 때만 dispatch
          if (JSON.stringify(gameState.players) !== JSON.stringify(players)) {
            dispatch(updatePlayers({ players }));
          }
        }
      } catch (error) {
        console.error("방 정보 가져오기 실패:", error);
      }
    };

    if (roomId && profileData?.userNickname && !isExiting) {
      fetchRoomInfo();
      const intervalId = setInterval(fetchRoomInfo, 2000);
      return () => clearInterval(intervalId);
    }
  }, [
    roomId,
    profileData?.userNickname,
    isExiting,
    dispatch,
    getCurrentUserNickname,
  ]);

  // 최초 방 입장 처리
  useEffect(() => {
    const handleInitialJoin = async () => {
      if (!isInitialJoin || !profileData?.userNickname || !roomId) return;

      try {
        const response = await CatchMindAPI.joinRoom(
          roomId,
          profileData.userNickname,
          roomInfo?.password || ""
        );

        if (response.success) {
          setIsInitialJoin(false);
        }
      } catch (error) {
        console.error("방 입장 처리 실패:", error);
      }
    };

    handleInitialJoin();
  }, [roomId, profileData?.userNickname, roomInfo?.password, isInitialJoin]);

  // 제시어 가져오기
  const getCurrentWord = useCallback(() => {
    const isCurrentUsersTurn =
      currentPlayer?.nickname === getCurrentUserNickname();
    return isCurrentUsersTurn ? gameState?.currentWord : "???";
  }, [currentPlayer?.nickname, getCurrentUserNickname, gameState?.currentWord]);

  const isCurrentUsersTurn = useCallback(() => {
    return currentPlayer?.nickname === getCurrentUserNickname();
  }, [currentPlayer?.nickname, getCurrentUserNickname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 p-4">
        <div className="h-full flex flex-col bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <GameInfo
            round={gameState?.currentRound || 1}
            word={getCurrentWord()}
            roomInfo={roomInfo}
            handleExitRoom={handleExitRoom}
          />
          <div className="flex-1 p-6">
            <div className="h-full bg-white rounded-xl border border-gray-200">
              <Canvas />
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/3 flex flex-col gap-4 p-4 border-l border-gray-700">
        <div className="grid grid-cols-2 gap-3">
          {gameState?.players?.map((player) => {
            console.log("Rendering PlayerCard:", player);
            return (
              <PlayerCard
                key={player.id}
                userId={player.id}
                userNickname={player.nickname}
                isCurrentTurn={player.isTurn}
                score={player.score}
              />
            );
          })}
        </div>

        <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <ChatBox
            roomId={roomId}
            currentUser={getCurrentUserNickname()}
            correctAnswer={gameState?.currentWord || ""}
          />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
