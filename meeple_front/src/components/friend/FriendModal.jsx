import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FriendList from "./FriendList";
import RequestFriend from "./RequestFriend";
import { UsersRound, MessageSquareMore, Handshake } from "lucide-react";
import Message from "./Message";
import { FriendSocketContext } from "../layout/FriendSocketLayout";
import AllFriend from "./AllFriend";
const FriendModal = () => {
  const userId = useSelector((state) => state.user.userId);

  const { connected, responseSocket, stompClientRef } =
    useContext(FriendSocketContext);

  useEffect(() => {
    if (responseSocket) {
      console.log("새로운 소켓 응답:", responseSocket);
    }
  }, [responseSocket]);

  const [activeTab, setActiveTab] = useState("friendList");

  const renderContent = () => {
    switch (activeTab) {
      case "allFriend":
        return <AllFriend />;
      case "allRequest":
        return <RequestFriend />;
      case "message":
        return <Message />;
      default:
        return <AllFriend />;
    }
  };

  return (
    <>
      <div className="flex justify-around items-center p-3 bg-gray-900 bg-opacity-80 rounded-t-lg w-full border-b border-cyan-500/30">
        <button
          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
            activeTab === "allFriend"
              ? "bg-cyan-500/20 shadow-lg border border-cyan-400/60"
              : "hover:bg-cyan-500/10"
          }`}
          onClick={() => setActiveTab("allFriend")}
        >
          <UsersRound className="text-cyan-400" strokeWidth={2} />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
            activeTab === "allRequest"
              ? "bg-cyan-500/20 shadow-lg border border-cyan-400/60"
              : "hover:bg-cyan-500/10"
          }`}
          onClick={() => setActiveTab("allRequest")}
        >
          <Handshake className="text-cyan-400" strokeWidth={2} />
        </button>
        <button
          className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
            activeTab === "message"
              ? "bg-cyan-500/20 shadow-lg border border-cyan-400/60"
              : "hover:bg-cyan-500/10"
          }`}
          onClick={() => setActiveTab("message")}
        >
          <MessageSquareMore className="text-cyan-400" strokeWidth={2} />
        </button>
      </div>
      <div className="bg-gray-900 bg-opacity-80 h-[40vh]">
        {renderContent()}
      </div>
    </>
  );
};
export default FriendModal;
