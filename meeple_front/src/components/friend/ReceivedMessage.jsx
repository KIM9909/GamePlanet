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
    <div className="p-4">
      {!showDetail && (
        <div>
          {messageList.length > 0 ? (
            <ul className="space-y-3">
              {messageList.map((msg) => (
                <li
                  key={msg.friendMessageId}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 flex justify-between items-center"
                >
                  <p className="text-gray-700 font-medium">
                    {msg.sender.userNickname}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => goToDetailMessage(msg)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => handleDelete(msg.friendMessageId)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-gray-500">
              <p>받은 쪽지가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {showDetail && (
        <div className="p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            쪽지 상세 내용
          </h3>
          <p className="text-gray-700">
            <span className="font-semibold">작성자:</span>{" "}
            {message.sender.userName}
          </p>
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            {message.content}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={() => setShowDetail(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
            >
              닫기
            </button>
            <button
              onClick={() => handleDelete(message.friendMessageId)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              삭제
            </button>
            <button
              onClick={() => onReply(message.sender.userId)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
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
