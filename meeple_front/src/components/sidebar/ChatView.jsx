// ChatView.jsx
import React, { useState, useEffect, useRef } from "react";

const ChatView = ({ connected, sendMessage, messages }) => {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  // 임시 유저 정보 (실제 구현 시에는 Redux store에서 가져올 예정)
  const currentUser = {
    userNickname: "TestUser", // 테스트용 임시 닉네임
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !connected) return;

    // 채팅 메시지 전송
    sendMessage({
      message: chatInput,
      sender: currentUser.userNickname,
    });

    setChatInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1.5 mb-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === currentUser.userNickname
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg p-2 max-w-[75%] ${
                  msg.sender === currentUser.userNickname
                    ? "bg-gray-600 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                <div className="text-xs opacity-75 mb-0.5">{msg.sender}</div>
                <div className="break-words text-sm">{msg.content}</div>
                <div className="text-[10px] opacity-50 mt-0.5">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-2">
        <div className="relative">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="채팅을 입력하세요..."
            className="w-full bg-gray-700 rounded px-3 py-2 text-sm focus:outline-none"
            disabled={!connected}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            disabled={!connected}
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;
