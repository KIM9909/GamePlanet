import React, { act, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { requestFriendList } from "../../sources/api/FriendApi";
import ReceivedFriendRequest from "./ReceivedFriendRequest";
import RequestingFriend from "./RequestingFriend";

const RequestFriend = () => {
  const userId = useSelector((state) => state.user.userId);
  const [activeTab, setActiveTab] = useState("requestedList");
  const [response, setResponse] = useState({
    requestingList: [],
    requestedList: [],
  });

  const fetchData = async () => {
    try {
      const data = await requestFriendList(userId);
      setResponse(data);
    } catch (error) {
      console.error("친구 요청 목록을 불러오지 못했습니다.", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchData();
  };

  const requestingList = response.requestingList;
  const requestedList = response.requestedList;

  const renderContent = () => {
    switch (activeTab) {
      case "requestedList":
        return response ? (
          <ReceivedFriendRequest requestedList={requestedList} />
        ) : null;

      case "requestingList":
        return response ? (
          <RequestingFriend requestingList={requestingList} />
        ) : null;
      default:
        return <ReceivedFriendRequest requestedList={requestedList} />;
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-80 p-4 rounded-b-lg">
      <div className="flex justify-center gap-4 mb-4 ">
        <button
          className={`px-3 rounded-lg font-medium transition-all duration-300 
            ${
              activeTab === "requestedList"
                ? "bg-cyan-500/20 text-cyan-400 shadow-md border border-cyan-400/60"
                : "bg-gray-800 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
            }`}
          onClick={() => handleTabChange("requestedList")}
        >
          받은 요청
        </button>
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 
            ${
              activeTab === "requestingList"
                ? "bg-cyan-500/20 text-cyan-400 shadow-md border border-cyan-400/60"
                : "bg-gray-800 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
            }`}
          onClick={() => handleTabChange("requestingList")}
        >
          보낸 요청
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-4 min-h-[40vh] border border-cyan-500/30">
        {!response ? (
          <div className="flex justify-center items-center">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        ) : (
          <div className="h-[35vh] overflow-y-auto w-full">
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestFriend;
