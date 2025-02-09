import React, { useEffect, useContext, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRoomId } from "../../../sources/store/slices/BurumabulGameSlice";
import { SocketContext } from "../../layout/SocketLayout";
import { createPortal } from "react-dom";
import EnterSecretRoom from "../../game/burumabul/play/burumabul_Modal/EnterSecretRoom";
import { CircleX } from "lucide-react";
import WrongPasswordModal from "./play/burumabul_Modal/WrongPasswordModal";
const BurumabulRoomListCard = ({ roomInfo }) => {
  const { enterSecretWaitingRoom, roomSocketData, socketStatus } =
    useContext(SocketContext);
  console.log("socketStatus 값:", socketStatus);
  const navigate = useNavigate();
  const roomId = roomInfo.roomId;
  console.log(roomId);
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const [passwordModal, setPasswordModal] = useState(false);
  const [enterPassword, setEnterPassword] = useState(null);
  const [errorMessage, setErrorMessage] = useState(false);

  const goToGeneralWaitingRoom = async (roomId) => {
    dispatch(setRoomId(roomInfo.roomId));
    navigate(`/game/burumabul/start/${roomId}`);
  };

  const goToSecretWaitingRoom = async (roomId) => {
    dispatch(setRoomId(roomInfo.roomId));
    setPasswordModal(true);

    setEnterPassword("");
  };

  useEffect(() => {
    if (enterPassword !== null) {
      enterSecretWaitingRoom(enterPassword);
    }
  }, [enterPassword]);

  useEffect(() => {
    console.log("socketStatus 값:", socketStatus);
    if (socketStatus && socketStatus === 500) {
      setErrorMessage(true);
    }
  }, [socketStatus]);

  useEffect(() => {
    if (roomSocketData && roomSocketData.roomId === roomId) {
      navigate(`/game/burumabul/start/${roomId}`);
    }
  }, [roomSocketData]);

  return (
    <>
      {roomInfo?.maxPlayers !== roomInfo?.players?.length && (
        <div className="flex justify-center items-center border-4 border-indigo-900 bg-white rounded-lg w-[400px] h-[120px] mx-2">
          <div className="flex items-center justify-between p-4 border-4 border-indigo-900 rounded-lg w-[350px] h-[80px]">
            <div className="break-words w-full max-w-[200px]">
              <div className="text-xl flex w-full">
                <div>Room.{roomId}</div>
                <div className="mx-3 overflow-hidden truncate ">
                  {roomInfo.roomName}
                </div>
              </div>
              <div>방장 : {roomInfo.creator.playerName}</div>
            </div>
            <div className="flex items-center ">
              <div className="mx-4 text-lg">
                {roomInfo.players.length}/{roomInfo.maxPlayers}
              </div>
              {!roomInfo.private ? (
                <button
                  onClick={() => goToGeneralWaitingRoom(roomId)}
                  className="bg-indigo-800 text-white text-xl w-[52px] h-[52px] flex justify-center items-center rounded-lg"
                >
                  입장
                </button>
              ) : (
                <button
                  onClick={() => goToSecretWaitingRoom(roomId)}
                  className="bg-indigo-800 w-[52px] h-[52px] flex justify-center items-center rounded-lg"
                >
                  <LockKeyhole size={44} color="#ffffff" strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {passwordModal &&
        createPortal(
          <div className="fixed inset-0 z-50 w-full text-center flex items-center justify-center">
            <EnterSecretRoom
              setEnterPassword={setEnterPassword}
              onClose={() => setPasswordModal(false)}
            />
          </div>,
          document.body
        )}
      {errorMessage &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-row justify-center items-center ">
            <WrongPasswordModal onClose={() => setErrorMessage(false)} />
          </div>,
          document.body
        )}
    </>
  );
};

export default BurumabulRoomListCard;
