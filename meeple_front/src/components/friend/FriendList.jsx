import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchFriends } from "../../sources/store/slices/FriendSlice";
import { fetchFriendList, deleteFriend } from "../../sources/api/FriendApi";
import axios from "axios";
import { UserRoundMinus } from "lucide-react";

const FriendList = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const { friends, status, error } = useSelector((state) => state.friend);
  const [friendList, setFriendList] = useState([]);

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
  }, [friendList]); // ✅ friendList 변경될 때마다 실행

  const handleDeleteFriend = async (friendId) => {
    if (friendId) {
      try {
        await deleteFriend(friendId);
        loadingFriends(userId);
      } catch (error) {
        console.error("친구 삭제 중 오류 : ", error);
        throw error;
      }
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-b-lg">
      <div className="bg-white rounded-lg shadow-sm h-[48vh] overflow-y-auto">
        <ul className="p-4 space-y-3">
          {friendList && friendList.length > 0 ? (
            friendList.map((friend, index) => (
              <li
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex justify-between items-center border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-700 hover:text-blue-500 transition-colors">
                    {friend.friend.nickname}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteFriend(friend.friendId)}
                  className="p-2 rounded-full hover:bg-red-50 transition-all duration-200 group"
                >
                  <UserRoundMinus
                    className="text-gray-400 group-hover:text-red-500 transition-colors"
                    size={20}
                  />
                </button>
              </li>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-[40vh] text-gray-500">
              <p>아직 친구가 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">
                새로운 친구를 추가해보세요!
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FriendList;
