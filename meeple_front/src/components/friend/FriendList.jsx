import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFriends,
  removeFriend,
} from "../../sources/store/slices/FriendSlice";

const FriendList = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user.userId);
  const { friends, status, error } = useSelector((state) => state.friend);
  const [newFriendName, setNewFriendName] = useState("");

  useEffect(() => {
    if (userId) {
      console.log("🔄 친구 목록 불러오기...");
      dispatch(fetchFriends(userId));
    }
  }, [dispatch, userId]);

  console.log(friends);

  const handleDeleteFriend = (friendId) => {
    dispatch(removeFriend(friendId));
  };
  if (status === "loading") return <p>불러오는 중...</p>;
  if (status === "failed") return <p>{error}</p>;

  return (
    <div className="">
      <h2 className="text-2xl text-center my-2">친구 목록</h2>
      <div className="bg-slate-100 h-80 rounded-lg overflow-y-auto">
        <ul className="mt-2 space-y-2">
          {friends && friends.length > 0 ? (
            friends.map((friend, index) => (
              <li
                key={index}
                className="p-2 bg-gray-200 rounded flex justify-between items-center"
              >
                {friend.friend.nickname}
                <button
                  onClick={() => dispatch(removeFriend(friend.friendId))}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  친구 취소
                </button>
              </li>
            ))
          ) : (
            <p>친구가 없습니다.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FriendList;
