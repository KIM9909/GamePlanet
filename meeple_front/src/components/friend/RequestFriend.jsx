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
    <div className="bg-gray-100 p-4 rounded-b-lg">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-6 rounded-lg font-medium transition-all duration-200 
            ${
              activeTab === "requestedList"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-blue-50"
            }`}
          onClick={() => handleTabChange("requestedList")}
        >
          받은 요청
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 
            ${
              activeTab === "requestingList"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-blue-50"
            }`}
          onClick={() => handleTabChange("requestingList")}
        >
          보낸 요청
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 min-h-[40vh]">
        {!response ? (
          <div className="flex justify-center items-center h-[40vh]">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        ) : (
          <div className="h-[35vh] overflow-y-auto">{renderContent()}</div>
        )}
      </div>
    </div>
  );
};

export default RequestFriend;
