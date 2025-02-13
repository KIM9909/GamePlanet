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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      {!showDetail && (
        <div>
          {messageList.length > 0 ? (
            <ul className="space-y-4">
              {messageList.map((msg) => (
                <li
                  key={msg.friendMessageId}
                  className="p-4 bg-gray-100 rounded-lg shadow-md flex justify-between items-center hover:bg-gray-200 transition-all duration-300"
                >
                  <p className="text-gray-800 font-medium">
                    {msg.sender.userNickname}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToDetailMessage(msg)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => handleDelete(msg.friendMessageId)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-600 mt-6">
              <p>받은 쪽지가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {showDetail && (
        <div className="p-6 bg-gray-50 rounded-lg shadow-lg border">
          <h3 className="text-lg font-bold text-gray-900">쪽지 상세 내용</h3>
          <p className="text-gray-700 mt-2">
            <span className="font-semibold">작성자:</span>{" "}
            {message.sender.userName}
          </p>
          <div className="mt-4 p-3 bg-white rounded-lg shadow-inner border">
            {message.content}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowDetail(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
            >
              닫기
            </button>
            <button
              onClick={() => handleDelete(message.friendMessageId)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              삭제
            </button>
            <button
              onClick={() => onReply(message.sender.userId)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            >
              답장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceivedMessage;
