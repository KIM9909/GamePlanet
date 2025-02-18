import React, { useEffect, useState } from "react";
import {
  deleteFriendRequest,
  requestFriendList,
} from "../../sources/api/FriendApi";
import { useSelector } from "react-redux";

const RequestingFriend = ({ requestingList }) => {
  const userId = useSelector((state) => state.user.userId);
  const [firendRequestingList, setFriendRequestingList] =
    useState(requestingList);

  const fetchRequestFriendList = async (userId) => {
    if (userId) {
      try {
        const response = await requestFriendList(userId);
        setFriendRequestingList(response.requestingList);
      } catch (error) {
        console.error("친구 요청 목록 로드 중 에러:", error);
      }
    }
  };

  console.log(requestingList);

  useEffect(() => {
    fetchRequestFriendList(userId);
  }, [userId]);

  const handleCancel = async (friendId) => {
    if (friendId) {
      console.log(friendId);
      try {
        const response = await deleteFriendRequest(friendId);
        fetchRequestFriendList(userId);
        return response;
      } catch (error) {
        console.error("친구 요청 거절 중 에러 발생:", error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start w-full overflow-y-auto">
      {firendRequestingList && firendRequestingList.length > 0 ? (
        <ul className="space-y-2 w-full">
          {firendRequestingList.map((list, index) => (
            <li
              key={index}
              className="p-2 bg-gray-800 rounded-lg flex items-center justify-between border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
            >
              <p className="font-medium text-cyan-400">
                {list.friend.userNickname}
              </p>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 bg-gray-500/80 text-white rounded-lg hover:bg-gray-700 hover:scale-105 transition-all duration-300"
                  onClick={() => handleCancel(list.friendId)}
                >
                  요청 취소
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>보낸 친구 요청이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default RequestingFriend;
