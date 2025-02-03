import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import useCatchSocket from "../../../../hooks/useCatchSocket";
import { useSelector } from "react-redux";

const ChatBox = ({ roomId, currentUser, correctAnswer }) => {
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef(null);
  const { messages, sendMessage } = useCatchSocket(roomId);

  const currentUserTurn = useSelector(
    (state) =>
      state.catchmind.players.find((p) => p.isTurn)?.nickname === currentUser
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const isCorrect =
      message.trim().toLowerCase() === correctAnswer?.toLowerCase();

    console.log("입력한 답:", message.trim().toLowerCase());
    console.log("정답:", correctAnswer?.toLowerCase());
    console.log("정답 일치 여부:", isCorrect);
    console.log("현재 턴 여부:", currentUserTurn);

    if (currentUserTurn && isCorrect) {
      console.log("출제자가 정답을 입력했습니다 - 무시됨");
      setMessage("");
      return;
    }

    // 채팅 메시지 전송 - 정답 체크는 서버에서 처리
    sendMessage({
      message: message.trim(),
      sender: currentUser,
      correctAnswer: correctAnswer,
    });

    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
      >
        {messages.map((msg, index) => {
          // Notice 메시지
          if (msg.isNotice || msg.sender === "SYSTEM") {
            return (
              <div key={index} className="flex justify-center">
                <div className="bg-yellow-500/20 text-yellow-200 px-4 py-2 rounded text-sm">
                  {msg.content}
                </div>
              </div>
            );
          }

          // 일반 채팅 메시지
          return (
            <div
              key={index}
              className={`flex flex-col ${
                msg.sender === currentUser ? "items-end" : "items-start"
              }`}
            >
              <span className="text-sm text-gray-400">{msg.sender}</span>
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
                    🎉 정답을 맞추셨습니다! +{msg.score}점
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              currentUserTurn
                ? "출제자는 정답을 맞출 수 없습니다"
                : "정답을 입력하세요..."
            }
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={currentUserTurn}
          />
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
              currentUserTurn
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-600"
            }`}
            disabled={currentUserTurn}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
