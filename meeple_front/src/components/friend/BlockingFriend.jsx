import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFriends } from "../../sources/store/slices/FriendSlice";
import { blockingFriendList, liftBlocking } from "../../sources/api/FriendApi";
import axios from "axios";
import { UserRoundMinus } from "lucide-react";

const BlockingFriend = () => {
  const userId = useSelector((state) => state.user.userId);
  const [blokingList, setBlokingList] = useState([]);

  const loadingBlockingFriends = async (userId) => {
    if (userId) {
      try {
        const response = await blockingFriendList(userId);
        setBlokingList(response);
      } catch (error) {
        console.error("차단 목록 로딩 중 에러:", error);
      }
    }
  };

  useEffect(() => {
    loadingBlockingFriends(userId);
  }, [userId]);

  useEffect(() => {
    console.log("✅ 업데이트된 차단한 친구 목록:", blokingList);
  }, [blokingList]);

  const handleLiftBlocking = async (friendId) => {
    if (friendId) {
      try {
        await liftBlocking(friendId);
        loadingBlockingFriends(userId);
      } catch (error) {
        console.error("친구 차단 해제 중 오류:", error);
      }
    }
  };

  return (
    <div className="h-full flex flex-col w-full">
      {blokingList && blokingList.length > 0 ? (
        <ul className="overflow-y-auto h-full space-y-2 w-full flex justify-center items-start">
          {blokingList.map((friend, index) => (
            <li
              key={index}
              className=" w-[250px] bg-gray-800 rounded-lg flex items-center justify-between shadow-sm border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300"
            >
              <div className="text-cyan-400 font-medium ml-3">
                {friend.friend.nickname}
              </div>
              <button
                className="px-4 py-2 bg-gray-500/80 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
                onClick={() => handleLiftBlocking(friend.friendId)}
              >
                차단 해제
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>차단한 친구가 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default BlockingFriend;
