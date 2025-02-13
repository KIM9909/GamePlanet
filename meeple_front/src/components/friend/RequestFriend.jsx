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
    <div className="p-3 mt-5 bg-white/80 rounded-lg">
      {/* 탭 버튼 영역 */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
            ${
              activeTab === "requestedList"
                ? "bg-[#7a90ff] text-white shadow-md transform hover:shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          onClick={() => handleTabChange("requestedList")}
        >
          받은 요청
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 
            ${
              activeTab === "requestingList"
                ? "bg-[#7a90ff] text-white shadow-md transform hover:shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          onClick={() => handleTabChange("requestingList")}
        >
          보낸 요청
        </button>
      </div>

      {/* 콘텐츠 영역 */}
      <div className="bg-white rounded-lg shadow-sm p-2 min-h-[300px]">
        {/* 로딩 상태 표시 */}
        {!response ? (
          <div className="flex justify-center items-center h-[300px]">
            <div className="text-gray-400">로딩 중...</div>
          </div>
        ) : (
          // 실제 콘텐츠
          <div className="h-[300px] overflow-y-auto">{renderContent()}</div>
        )}
      </div>
    </div>
  );
};

export default RequestFriend;
