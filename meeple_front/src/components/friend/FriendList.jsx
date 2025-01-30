import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFriends,
  sendFriendRequest,
  handleFriendRequest,
  removeFriend,
} from "../../sources/store/slices/FriendSlice";

const FriendList = ({ userId }) => {
  const dispatch = useDispatch();
  const { friends, status, error } = useSelector((state) => state.friend);
  const [newFriendName, setNewFriendName] = useState("");

  useEffect(() => {
    dispatch(fetchFriends(userId));
  }, [dispatch, userId]);

  if (status === "loading") return <p>불러오는 중...</p>;
  //   if (status === "failed") return <p>{error}</p>;
  return (
    <div className="">
      <h2 className="text-2xl text-center my-2">친구 목록</h2>
      <div className="bg-slate-100 h-80 rounded-lg">
        <ul className="mt-2 space-y-2">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <li
                key={friend.id}
                className="p-2 bg-gray-200 rounded flex justify-between items-center"
              >
                {friend.name}
                <button
                  onClick={() => dispatch(removeFriend(friend.id))}
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
