import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ReceivedMessage from "./ReceivedMessage";
import SendMessage from "./SendMessage";
import { messageList } from "../../sources/api/FriendApi";

const Message = () => {
  const userId = useSelector((state) => state.user.userId);
  if (!userId) {
    console.error("유저 아이디가 없어서 메세지를 조회하지 못 했습니다.");
  }

  const [messages, setMessages] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(""); // 선택된 친구

  const loadMessageData = async () => {
    try {
      const response = await messageList(userId);
      setMessages(response);
    } catch (error) {
      console.error("쪽지 목록을 불러오지 못 했습니다.");
    }
  };

  useEffect(() => {
    loadMessageData();
  }, []);

  const [activeTab, setActiveTab] = useState("ReceivedMessage");
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadMessageData();
  };

  // 답장 버튼을 클릭하면 `SendMessage`로 전환하고, 친구 정보 저장
  const handleReply = (friendId) => {
    setSelectedFriend(friendId); // 답장할 친구 저장
    setActiveTab("SendMessage"); // 탭 변경
  };

  const renderContent = () => {
    switch (activeTab) {
      case "ReceivedMessage":
        return <ReceivedMessage messages={messages} onReply={handleReply} />;
      case "SendMessage":
        return <SendMessage selectedFriend={selectedFriend} />;
      default:
        return <ReceivedMessage messages={messages} onReply={handleReply} />;
    }
  };
  return (
    <div className="bg-white h-[55vh] rounded-lg">
      <div className="flex justify-around items-center mt-3">
        <button
          className={`px-4 py-2 mx-2 mt-3 rounded-lg font-semibold transit4on-all duration-300 
          ${
            activeTab === "ReceivedMessage"
              ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg scale-90 border-2 border-blue-700"
              : "bg-gray-500 text-gray-200 hover:bg-gray-600 scale-75 hover:text-white"
          }`}
          onClick={() => handleTabChange("ReceivedMessage")}
        >
          받은 쪽지함
        </button>
        <button
          className={`px-4 py-2 mx-2 mt-3 rounded-lg font-semibold transition-all duration-300 
          ${
            activeTab === "SendMessage"
              ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg scale-90 border-2 border-blue-700"
              : "bg-gray-500 text-gray-200 hover:bg-gray-600 scale-75 hover:text-white"
          }`}
          onClick={() => handleTabChange("SendMessage")}
        >
          쪽지 보내기
        </button>
      </div>
      {renderContent()}
    </div>
  );
};

export default Message;
