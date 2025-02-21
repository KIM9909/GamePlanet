import React, { act, useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { requestFriendList } from "../../sources/api/FriendApi";
import ReceivedFriendRequest from "./ReceivedFriendRequest";
import RequestingFriend from "./RequestingFriend";
import FriendList from "./FriendList";
import BlockingFriend from "./BlockingFriend";
import { FriendSocketContext } from "../layout/FriendSocketLayout";

const AllFriend = () => {
  const userId = useSelector((state) => state.user.userId);
  const [activeTab, setActiveTab] = useState("friendList");

  const { connected } = useContext(FriendSocketContext);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "friendList":
        return <FriendList />;

      case "blockingList":
        return <BlockingFriend />;
      default:
        return <FriendList />;
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-80 p-4 rounded-b-lg">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
            activeTab === "friendList"
              ? "bg-cyan-500/20 text-cyan-400 shadow-md border border-cyan-400/60"
              : "bg-gray-800 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
          }`}
          onClick={() => handleTabChange("friendList")}
        >
          친구 목록
        </button>
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
            activeTab === "blockingList"
              ? "bg-cyan-500/20 text-cyan-400 shadow-md border border-cyan-400/60"
              : "bg-gray-800 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
          }`}
          onClick={() => handleTabChange("blockingList")}
        >
          차단 목록
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-4 min-h-[40vh] border border-cyan-500/30">
        <div className="flex justify-center items-center">
          <div className="h-[35vh] overflow-y-auto w-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllFriend;
