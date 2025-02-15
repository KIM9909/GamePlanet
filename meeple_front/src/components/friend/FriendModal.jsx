import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FriendList from "./FriendList";
import RequestFriend from "./RequestFriend";
import { UsersRound, MessageSquareMore, Handshake } from "lucide-react";
import Message from "./Message";
import useFriendSocket from "../../hooks/useFriendSocket";
import { FriendSocketContext } from "../layout/FriendSocketLayout";
const FriendModal = () => {
  const userId = useSelector((state) => state.user.userId);

  const { connected, responseSocket, stompClientRef } =
    useContext(FriendSocketContext);

  useEffect(() => {
    if (connected) {
      console.log("소켓이 연결되었습니다.");
    } else {
      console.error("소켓 연결 에러");
      // 재연결 시도
      const reconnectSocket = async () => {
        if (stompClientRef.current) {
          try {
            await stompClientRef.current.activate();
          } catch (error) {
            console.error("재연결 실패:", error);
          }
        }
      };
      reconnectSocket();
    }
  }, [connected]);

  useEffect(() => {
    if (responseSocket) {
      console.log("새로운 소켓 응답:", responseSocket);
    }
  }, [responseSocket]);

  const [activeTab, setActiveTab] = useState("friendList");

  const renderContent = () => {
    switch (activeTab) {
      case "friendList":
        return <FriendList userId={userId} />;
      case "allRequest":
        return <RequestFriend />;
      case "message":
        return <Message />;
      default:
        return <FriendList userId={userId} />;
    }
  };

  return (
    <>
      <div className="flex justify-around items-center p-3 bg-white rounded-t-lg">
        <button
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeTab === "friendList"
              ? "bg-blue-50 shadow-md"
              : "hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("friendList")}
        >
          <UsersRound color="#3B82F6" strokeWidth={2} />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeTab === "allRequest"
              ? "bg-blue-50 shadow-md"
              : "hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("allRequest")}
        >
          <Handshake color="#3B82F6" strokeWidth={2} />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-200 ${
            activeTab === "message"
              ? "bg-blue-50 shadow-md"
              : "hover:bg-blue-50"
          }`}
          onClick={() => setActiveTab("message")}
        >
          <MessageSquareMore color="#3B82F6" strokeWidth={2} />
        </button>
      </div>
      <div>{renderContent()}</div>
    </>
  );
};

export default FriendModal;
