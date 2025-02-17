import React, { useState, useRef, useEffect, useContext } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useSelector } from "react-redux";
import { SocketContext } from "../../../../layout/SocketLayout";
import UserAPI from "../../../../../sources/api/UserAPI";

const WaitingChat = ({ roomId, players }) => {
  const [newMessage, setNewMessage] = useState("");
  const chatBoxRef = useRef(null);
  const userId = Number(useSelector((state) => state.user.userId));

  const { connected, chatMessage, chatWaitingRoom, roomNotifi, setRoomNotifi } =
    useContext(SocketContext);
  const { getProfile } = UserAPI;

  // 닉네임 조회
  const getNickname = async (playerId) => {
    if (playerId) {
      try {
        const response = await getProfile(playerId);
        console.log("닉네임정보찾기: ", response);
        return response.userNickname;
      } catch (error) {
        console.error("닉네임 정보 찾기 중 오류:", error);
      }
    }
  };

  const [messages, setMessages] = useState([
    {
      type: "system",
      sender: "system",
      content: "유저들과 소통하세요!!",
    },
  ]);

  useEffect(() => {
    if (roomNotifi) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "system", sender: "system", content: roomNotifi },
      ]);
      setRoomNotifi("");
    }
  }, [roomNotifi]);

  // 채팅 메시지
  useEffect(() => {
    if (chatMessage && chatMessage.type === "chat") {
      const { sender, content } = chatMessage;

      // 플레이어 정보에서 발신자의 닉네임을 찾습니다
      const senderInfo = players.find(
        (player) => Number(player.playerId) === Number(sender)
      );
      console.log("senderInfo: ", senderInfo);
      // senderInfo의 playerId로 닉네임 조회
      const fetchNickname = async () => {
        let senderName = "알 수 없음";
        if (senderInfo) {
          try {
            senderName = await getNickname(senderInfo.playerId);
          } catch (error) {
            console.error("닉네임 가져오기 실패:", error);
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            type: "chat",
            sender: sender,
            senderName: senderName,
            content: content,
            isMe: sender === userId,
          },
        ]);

        console.log("현재 유저 목록:", players);
        console.log("닉네임 찾기 결과:", senderName);
      };
      fetchNickname();
    }
  }, [chatMessage, players]);

  // 새 메시지가 추가될 때마다 스크롤을 아래로 이동
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSend = (e) => {
    e.preventDefault();
    if (!connected || !newMessage.trim()) return;
    const chatInfo = {
      type: "chat",
      sender: userId,
      content: newMessage.trim(),
    };
    // STOMP로 메시지 전송
    chatWaitingRoom(chatInfo);
    setNewMessage("");
  };

  return (
    <div className="h-[600px] w-[300px] bg-gray-900 bg-opacity-90 rounded-xl border border-cyan-500/60 flex flex-col shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-cyan-500/30 bg-gray-900/95">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">
            Chat Room
          </h2>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div
        ref={chatBoxRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 thin-scrollbar bg-gray-900/50"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              msg.type === "system"
                ? "items-center"
                : msg.isMe
                ? "items-end"
                : "items-start"
            } transition-all duration-200`}
          >
            {msg.type !== "system" && (
              <span
                className={`text-xs text-cyan-300/80 mb-1 px-2 ${
                  msg.isMe ? "text-right" : "text-left"
                }`}
              >
                {msg.isMe ? "나" : msg.senderName}
              </span>
            )}
            <div
              className={`px-4 py-2 rounded-xl max-w-[220px] ${
                msg.type === "system"
                  ? "bg-gray-800/80 text-cyan-300 text-sm"
                  : msg.isMe
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-800 text-gray-100"
              } break-words shadow-lg hover:shadow-cyan-500/10 transition-all duration-200`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Area */}
      <form
        onSubmit={handleSend}
        className="p-2 border-t border-cyan-500/30 bg-gray-900/95"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            className="flex-1 px-2 py-2 rounded-xl bg-gray-800 border border-cyan-500/30 
              text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400
              focus:ring-1 focus:ring-cyan-400 transition-colors"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!connected || !newMessage.trim()}
            className="p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 
              transition-colors disabled:bg-gray-700 disabled:text-gray-500 
              disabled:cursor-not-allowed shadow-lg hover:shadow-cyan-500/20"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default WaitingChat;
