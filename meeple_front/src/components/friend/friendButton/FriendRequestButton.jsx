import React from "react";
import useFriendSocket from "../../../hooks/useFriendSocket";
import { useSelector } from "react-redux";

const FriendRequestButton = ({ friendId }) => {
  const userId = useSelector((state) => state.user.userId);
  const { sendFriendRequest, connected } = useFriendSocket(userId, (data) =>
    console.log("친구 요청 알림 수신 :", data)
  );

  return (
    <button onClick={() => sendFriendRequest(friendId)} disabled={!connected}>
      은수에게 친구요청 보내기
    </button>
  );
};

export default FriendRequestButton;
