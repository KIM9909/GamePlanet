import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FriendList from "./FriendList";
import RequestFriend from "./RequestFriend";
import { UsersRound, MessageSquareMore, Handshake } from "lucide-react";
import Message from "./Message";

const FriendModal = () => {
  const userId = useSelector((state) => state.user.userId);

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
