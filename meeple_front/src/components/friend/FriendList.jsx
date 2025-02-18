import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchFriendList, deleteFriend } from "../../sources/api/FriendApi";

const FriendList = () => {
  const userId = useSelector((state) => state.user.userId);
  const [friendList, setFriendList] = useState([]);

  // 친구 목록 불러오기
  const loadingFriends = async (userId) => {
    if (userId) {
      try {
        const response = await fetchFriendList(userId);
        setFriendList(response);
      } catch (error) {
        console.error("친구 목록 로딩 중 에러 : ", error);
      }
    }
  };

  useEffect(() => {
    loadingFriends(userId);
  }, [userId]);

  useEffect(() => {
    console.log("✅ 업데이트된 친구 목록:", friendList);
  }, [friendList]);

  // 친구 삭제 처리
  const handleDeleteFriend = async (friendId) => {
    if (friendId) {
      try {
        await deleteFriend(friendId);
        loadingFriends(userId);
      } catch (error) {
        console.error("친구 삭제 중 오류 : ", error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col w-full">
      {friendList && friendList.length > 0 ? (
        <ul className="overflow-y-auto h-full space-y-2 w-full flex flex-col items-start">
          {friendList.map((friend, index) => (
            <li
              key={index}
              className=" w-[220px] bg-gray-800 rounded-lg flex items-center justify-between shadow-sm border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300"
            >
              <div className="text-cyan-400 font-medium ml-3">
                {friend.friend.nickname}
              </div>
              <button
                className="px-4 py-2 bg-gray-500/80 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                onClick={() => handleDeleteFriend(friend.friendId)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>아직 친구가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default FriendList;
