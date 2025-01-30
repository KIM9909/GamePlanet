import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFriends,
  sendFriendRequest,
  handleFriendRequest,
  removeFriend,
} from "../../sources/store/slices/FriendSlice";
import { AiFillMessage } from "react-icons/ai";
import FriendList from "./FriendList";
import ReceivedRequest from "./ReceivedRequest";
import RequestFriend from "./RequestFriend";

const FriendModal = ({ userId }) => {
  const dispatch = useDispatch();
  const { friends, status, error } = useSelector((state) => state.friend);
  const [newFriendName, setNewFriendName] = useState("");
  const [activeTab, setActiveTab] = useState("friendList");

  const renderContent = () => {
    switch (activeTab) {
      case "friendList":
        return <FriendList userId={userId} />;
      case "receivedRequest":
        return <ReceivedRequest userId={userId} />;
      case "sentRequest":
        return <RequestFriend userId={userId} />;
      default:
        return <FriendList userId={userId} />;
    }
  };

  useEffect(() => {
    dispatch(fetchFriends(userId));
  }, [dispatch, userId]);

  // if (status === "loading") return <p>불러오는 중...</p>;
  // if (status === "failed") return <p>{error}</p>;

  return (
    <>
      <div className="flex justify-between items-center ">
        <button
          className={`rounded p-1 bg-gray-500 ${
            activeTab === "friendList"
              ? "text-black border-2 border-black"
              : "text-white"
          }`}
          onClick={() => setActiveTab("friendList")}
        >
          친구 목록
        </button>
        <button
          className={`rounded p-1 bg-gray-500 ${
            activeTab === "receivedRequest"
              ? "text-black border-2 border-black"
              : "text-white"
          }`}
          onClick={() => setActiveTab("receivedRequest")}
        >
          받은 요청
        </button>
        <button
          className={`rounded p-1 bg-gray-500 ${
            activeTab === "sentRequest"
              ? "text-black border-2 border-black"
              : "text-white"
          }`}
          onClick={() => setActiveTab("sentRequest")}
        >
          보낸 요청
        </button>
        <button>
          <AiFillMessage size={20} />
        </button>
      </div>
      <div>{renderContent()}</div>
    </>
  );
};

export default FriendModal;
