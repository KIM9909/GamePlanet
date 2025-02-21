import React, { useContext, useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import {
  processFriendRequest,
  requestFriendList,
} from "../../sources/api/FriendApi";
import { FriendSocketContext } from "../layout/FriendSocketLayout";

const ReceivedFriendRequest = ({ requestedList }) => {
  const userId = useSelector((state) => state.user.userId);
  console.log(requestedList);
  const [requestList, setRequestList] = useState();

  useEffect(() => {
    setRequestList(requestedList);
  }, [requestedList]);

  const { connected, responseSocket, stompClientRef } =
    useContext(FriendSocketContext);

  useEffect(() => {
    if (responseSocket) {
      console.log("새로운 소켓 응답:", responseSocket);
    }
  }, [responseSocket]);

  const handleAccept = async (friendId) => {
    if (requestList && userId) {
      try {
        const requirements = "ACCEPT";
        const responseAPI = await processFriendRequest(friendId, requirements);
        console.log(responseAPI);
        console.log(connected);
        if (connected) {
          console.log(responseSocket);
        }
        console.log(responseSocket);

        const response = await requestFriendList(userId);
        setRequestList(response.requestedList);
      } catch (error) {
        console.error("친구 요청 승인 중 오류 : ", error);
        throw error;
      }
    }
  };

  const handleDeny = async (friendId) => {
    if (requestList && userId) {
      try {
        const requirements = "DENY";
        await processFriendRequest(friendId, requirements);
        const response = await requestFriendList(userId);
        setRequestList(response.requestedList);
      } catch (error) {
        console.error("친구 요청 거절 중 에러 : ", error);
        throw error;
      }
    }
  };

  const handleBlock = async (friendId) => {
    if (requestList && userId) {
      try {
        const requirements = "BLOCK";
        await processFriendRequest(friendId, requirements);
        const response = await requestFriendList(userId);
        setRequestList(response.requestedList);
      } catch (error) {
        console.error("친구 차단 중 에러:", error);
        throw error;
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-start w-full overflow-y-auto">
      {requestList && requestList.length > 0 ? (
        <ul className="space-y-2 w-full">
          {requestList.map((list, index) => (
            <li
              key={index}
              className="p-2 bg-gray-800 rounded-lg flex items-center justify-between border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300"
            >
              <p
                className="font-medium text-cyan-400 truncate mr-4 overflow-hidden whitespace-nowrap"
                title={list.user.userNickname} // 툴팁으로 전체 이름 표시
              >
                {list.user.userNickname}
              </p>

              <div className="flex gap-1 shrink-0">
                <button
                  className="px-2 py-1 text-sm bg-cyan-500/90 text-white rounded hover:bg-cyan-600 transition-all duration-300"
                  onClick={() => handleAccept(list.friendId)}
                >
                  승인
                </button>
                <button
                  className="px-2 py-1 text-sm bg-cyan-500/60 text-white rounded hover:bg-cyan-600 transition-all duration-300"
                  onClick={() => handleDeny(list.friendId)}
                >
                  거절
                </button>
                <button
                  className="px-2 py-1 text-sm bg-cyan-500/40 text-white rounded hover:bg-cyan-600 transition-all duration-300"
                  onClick={() => handleBlock(list.friendId)}
                >
                  차단
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>받은 친구 요청이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ReceivedFriendRequest;
