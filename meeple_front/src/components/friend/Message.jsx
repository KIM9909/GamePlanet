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
    <div className="bg-gray-900 bg-opacity-80 p-4 rounded-b-lg">
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300
          ${
            activeTab === "ReceivedMessage"
              ? "bg-cyan-500/20 text-cyan-400 shadow-md border border-cyan-400/60"
              : "bg-gray-800 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
          }`}
          onClick={() => handleTabChange("ReceivedMessage")}
        >
          받은 쪽지
        </button>
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 
          ${
            activeTab === "SendMessage"
              ? "bg-cyan-500/20 text-cyan-400 shadow-md border border-cyan-400/60"
              : "bg-gray-800 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400"
          }`}
          onClick={() => handleTabChange("SendMessage")}
        >
          쪽지 쓰기
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

export default Message;
