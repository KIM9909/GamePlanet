import React from "react";
import useFriendSocket from "../../hooks/useFriendSocket";
import { useSelector, useDispatch } from "react-redux";

const ReceivedFriendRequest = () => {
  const userId = useSelector((state) => state.user.userId);
  const dispatch = useDispatch();
  const friendRequests = useSelector((state) => state.friend.friendRequests);

  const { processFriendRequest, connected } = useFriendSocket((data) => {
    console.log("친구 요청 알림 수신", data);
  });

  console.log(friendRequests);

  if (!friendRequests.length || friendRequests.length === 0) {
    return <div>받은 친구 요청이 없습니다.</div>;
  }
  return (
    <div>
      <ul>
        {friendRequests.map((request) => (
          <>
            <li key={request.senderName}>
              <span>{request.senderName}님이 친구요청을 보냈습니다.</span>
            </li>
            <button
              onClick={() =>
                processFriendRequest(
                  request.senderId,
                  request.friendId,
                  "ACCEPT"
                )
              }
              disabled={!connected}
            >
              친구 요청 승인 O
            </button>
            <button
              onClick={() =>
                processFriendRequest(request.senderId, request.friendId, "DENY")
              }
            >
              친구 요청 거절 X
            </button>
          </>
        ))}
      </ul>
    </div>
  );
};

export default ReceivedFriendRequest;
