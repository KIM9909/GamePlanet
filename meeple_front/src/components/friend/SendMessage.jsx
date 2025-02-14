import React, { useState, useEffect } from "react";
import { fetchFriendList, sendMessage } from "../../sources/api/FriendApi";
import { useSelector } from "react-redux";

const SendMessage = ({ selectedFriend }) => {
  const userId = useSelector((state) => state.user.userId);
  const [friendList, setFriendList] = useState([]);
  const [selectFriend, setSelectFriend] = useState("");
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    if (selectedFriend) {
      setSelectFriend(selectedFriend);
    }
  }, [selectedFriend]);

  // 친구 목록 불러오기
  useEffect(() => {
    const getFriends = async () => {
      try {
        const response = await fetchFriendList(userId);
        setFriendList(response);
      } catch (error) {
        console.error("친구 목록 로드 중 에러:", error);
      }
    };
    getFriends();
  }, [userId]);

  // 쪽지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!selectedFriend) {
      alert("보낼 친구를 선택해주세요!");
      return;
    }

    if (!messageText.trim()) {
      alert("쪽지 내용을 입력해주세요!");
      return;
    }

    console.log("쪽지 전송:", { to: selectedFriend, message: messageText });
    if (userId && messageText) {
      try {
        const response = sendMessage(messageText, selectedFriend, userId);
        console.log(response);
      } catch (error) {
        console.log("메세지 발송 중 오류:", error);
        throw error;
      }
    }
    setMessageText(""); // 입력창 초기화
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md h-[43.5vh]">
      {/* 친구 선택 드롭다운 */}
      <label className="block text-gray-700 font-medium mb-2">받는 사람</label>
      <select
        className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 "
        value={selectedFriend}
        onChange={(e) => setSelectFriend(e.target.value)}
      >
        <option value="">친구를 선택하세요</option>
        {friendList.length > 0 ? (
          friendList.map((friend) => (
            <option key={friend.id} value={friend.friend.userId}>
              {friend.friend.nickname} ({friend.friend.userId})
            </option>
          ))
        ) : (
          <option disabled>친구 목록이 없습니다.</option>
        )}
      </select>

      {/* 쪽지 입력 폼 */}
      <form onSubmit={handleSendMessage}>
        <label className="block text-gray-700 font-medium mb-2">
          쪽지 내용
        </label>
        <textarea
          className="w-full h-24 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="쪽지를 입력하세요..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        ></textarea>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200"
        >
          보내기
        </button>
      </form>
    </div>
  );
};

export default SendMessage;
