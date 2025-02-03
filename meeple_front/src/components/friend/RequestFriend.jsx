import { button, div } from "framer-motion/client";
import React from "react";
import FriendRequestButton from "./friendButton/FriendRequestButton";
import { useSelector } from "react-redux";

const RequestFriend = () => {
  const userId = useSelector((state) => state.user.userId);
  return <FriendRequestButton friendId={1} />;
};

export default RequestFriend;
