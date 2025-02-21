import React, { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useBurumabulSocket from "../../../hooks/useBurumabulSocket";
import WaitingRoom from "../../../components/game/burumabul/waiting/WaitingRoom";
import BurumabulPlay from "../../../components/game/burumabul/play/BurumabulPlay";
import { useSelector } from "react-redux";
import { findBurumabulRoom } from "../../../sources/api/BurumabulRoomAPI";
import { SocketContext } from "../../../components/layout/SocketLayout";

const BurumabulPage = () => {
  const roomId = useSelector((state) => state.burumabul.roomId);
  console.log(roomId);

  const navigate = useNavigate();
  const userId = Number(useSelector((state) => state.user.userId));
  const [currentRoomInfo, setCurrentRoomInfo] = useState({});
  // 초기 게임 플레이 데이터
  const [playData, setPlayData] = useState(null);
  const [gameStatus, setGameStatus] = useState(null);

  useEffect(() => {
    const getRoomInfo = async () => {
      if (roomId) {
        try {
          const response = await findBurumabulRoom(roomId);
          setCurrentRoomInfo(response || {});
        } catch (error) {
          console.error("방 정보 조회 중 오류 발생 : ", error);
        }
      }
    };
    getRoomInfo();
    console.log("BurumabulPage received roomId:", roomId);
  }, [roomId]);

  const [isStart, setIsStart] = useState(false);
  const [roomMessage, setRoomMessage] = useState("");

  const { connected, enterWaitingRoom, roomSocketData, gamePlaySocketData } =
    useContext(SocketContext);

  useEffect(() => {
    const initializeRoom = async () => {
      if (!roomId) return;

      try {
        const response = await findBurumabulRoom(roomId);
        console.log("방정보 조회 결과 :", response);
        setCurrentRoomInfo(response);

        if (connected && response) {
          const isCreator = response.creator?.playerId === userId;
          const isExistingPlayer = response.players?.some(
            (player) => player.playerId === userId
          );
          if (!isCreator && !isExistingPlayer) {
            console.log("새로운 플레이어 입장 시도:", {
              userId,
              roomId,
              isCreator,
              isExistingPlayer,
            });
            enterWaitingRoom();
          }
        }
      } catch (error) {
        console.error("방 정보 조회/입장 중 오류:", error);
      }
    };
    initializeRoom();
  }, [roomId, connected, userId]);

  useEffect(() => {
    if (gamePlaySocketData) {
      console.log("새로운 gamePalySocetData 수신:", gamePlaySocketData);
      setPlayData(gamePlaySocketData);
      setGameStatus(gamePlaySocketData.gameStatus);
      setIsStart(true);
    }
  }, [gamePlaySocketData]);

  useEffect(() => {
    console.log("현재 roomSocketData 상태:", roomSocketData);
    if (roomSocketData) {
      setCurrentRoomInfo((prev) => ({
        ...prev,
        ...roomSocketData,
      }));
    }
  }, [roomSocketData]);

  return (
    <>
      {Object.keys(currentRoomInfo).length === 0 ? (
        <div>Loading...</div>
      ) : playData ? (
        // playData가 있는 경우
        gameStatus === "IN_PROGRESS" ? (
          // 게임 진행 중
          <BurumabulPlay
            roomId={roomId}
            currentRoomInfo={currentRoomInfo}
            setIsStart={setIsStart}
            playData={playData}
            setGameStatus={setGameStatus}
          />
        ) : gameStatus === "GAME_END" ? (
          // 게임 종료
          <WaitingRoom
            roomId={roomId}
            roomInfo={currentRoomInfo}
            setIsStart={setIsStart}
            setPlayData={setPlayData}
            gameStatus={gameStatus}
          />
        ) : (
          // 그 외의 상태 (대기 중)
          <WaitingRoom
            roomId={roomId}
            roomInfo={currentRoomInfo}
            setIsStart={setIsStart}
            setPlayData={setPlayData}
            gameStatus={gameStatus}
          />
        )
      ) : (
        // playData가 없는 경우 (초기 상태)
        <WaitingRoom
          roomId={roomId}
          roomInfo={currentRoomInfo}
          setIsStart={setIsStart}
          setPlayData={setPlayData}
          gameStatus={gameStatus}
        />
      )}
    </>
  );
};

export default BurumabulPage;
