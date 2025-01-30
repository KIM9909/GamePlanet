/*
1. 채팅 메시지 표시
2. 메시지 입력 및 전송
3. 정답 체크 기능
4. 시스템 메시지 표시
5. 스크롤 자동 조절
*/

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import useCatchSocket from "../../../hooks/useCatchSocket";

const ChatBox = ({ roomId, currentUser, correctAnswer }) => {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef(null);
  const { messages, sendMessage } = useCatchSocket(roomId);

  // 채팅창 자동 스크롤
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage({
        message: message.trim(),
        sender: currentUser,
        correctAnswer: correctAnswer,
      });
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* 채팅 메시지 영역 */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.sender === currentUser ? "items-end" : "items-start"
            }`}
          >
            {/* 발신자 이름 */}
            <span className="text-sm text-gray-400">{msg.sender}</span>

            {/* 메시지 내용 */}
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] ${
                msg.isCorrect
                  ? "bg-green-500 text-white"
                  : msg.sender === currentUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              <p>{msg.content}</p>
              {msg.isCorrect && (
                <div className="text-xs mt-1 text-green-200">
                  🎉 정답입니다! +{msg.score}점
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
