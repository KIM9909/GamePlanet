import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { deleteMessage } from "../../sources/api/FriendApi";

const ReceivedMessage = ({ messages, onReply }) => {
  const userId = useSelector((state) => state.user.userId);
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    setMessageList(messages);
  }, [messages]);

  const [showDetail, setShowDetail] = useState(false);
  const [message, setMessage] = useState({});

  const goToDetailMessage = (message) => {
    setShowDetail(true);
    setMessage(message);
  };

  const handleDelete = async (friendMessageId) => {
    try {
      await deleteMessage(friendMessageId);
      setShowDetail(false);
      setMessageList((prev) =>
        prev.filter((msg) => msg.friendMessageId !== friendMessageId)
      );
    } catch (error) {
      console.error("쪽지 삭제 중 에러 발생:", error);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start w-full ">
      {!showDetail && (
        <div className="h-full w-full">
          {messageList.length > 0 ? (
            <div className="h-full overflow-y-auto">
              <ul className="space-y-3 p-1">
                {messageList.map((msg) => (
                  <li
                    key={msg.friendMessageId}
                    className="p-2 bg-gray-800 rounded-lg flex items-center justify-between border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
                  >
                    <p
                      className="text-cyan-400 font-medium truncate"
                      title={msg.sender.userNickname}
                    >
                      {msg.sender.userNickname}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToDetailMessage(msg)}
                        className="px-1 text-sm bg-cyan-500/80 text-white rounded-lg hover:bg-cyan-600 hover:scale-105 transition-all duration-300"
                      >
                        상세 보기
                      </button>
                      <button
                        onClick={() => handleDelete(msg.friendMessageId)}
                        className="px-1 text-sm bg-gray-500/80 text-white rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-300"
                      >
                        삭제
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <p>받은 쪽지가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {showDetail && (
        <div className="flex-1 overflow-hidden w-full">
          <div className="p-4 bg-gray-800 rounded-lg border border-cyan-500/30 shadow-lg overflow-y-auto">
            <p className="text-cyan-400">
              <span className="font-semibold">작성자:</span>{" "}
              {message.sender.userName}
            </p>
            <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-cyan-500/20 shadow-inner">
              <p className="text-gray-300">{message.content}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDetail(false)}
                className="px-2 py-1.5 text-[15px] bg-gray-600/80 text-white rounded-lg hover:bg-gray-700  transition-all duration-300"
              >
                닫기
              </button>
              <button
                onClick={() => handleDelete(message.friendMessageId)}
                className="px-2 py-1.5 text-[15px] bg-gray-600/80 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
              >
                삭제
              </button>
              <button
                onClick={() => onReply(message.sender.userId)}
                className="px-2 py-1.5 text-[15px] bg-cyan-500/80 text-white rounded-lg hover:bg-cyan-600 transition-all duration-300"
              >
                답장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivedMessage;
