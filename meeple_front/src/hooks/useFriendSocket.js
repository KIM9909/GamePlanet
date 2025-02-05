import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import {
  addFriendRequest,
  removeFriendRequest,
  fetchFriends,
} from "../sources/store/slices/FriendSlice";

const useFriendSocket = (userId) => {
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);

  const friendsRequsets = useSelector((state) => state.friend.friendRequests);

  const dispatch = useDispatch();
  useEffect(() => {
    if (!userId) return;

    // WebSocket 연결
    const socket = new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`); // 배포 서버 소켓 통신
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("WebSocket Connected");
      setConnected(true);

      // 친구 요청 알림 구독
      stompClient.subscribe(`/topic/friend/${userId}`, (message) => {
        const receivedData = JSON.parse(message.body);
        console.log("친구 요청 알림 수신 : ", receivedData);

        // ✅ 요청을 보낸 사람(senderId)과 요청을 받은 사람(targetId)이 같은 경우만 필터링
        if (
          (receivedData.senderId !== userId) &
          (receivedData.targetId === userId)
        ) {
          console.log("⚠️ 자기 자신이 보낸 요청이므로 리스트에 추가 안 함.");
          return;
        }
        dispatch(addFriendRequest(receivedData));
        console.log("🔄 업데이트된 친구 요청 목록:", friendsRequsets);
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("X WebSocket Error", frame.headers["message"]);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [userId, dispatch]);

  // 친구 요청 보내기
  const sendFriendRequest = (friendId) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: `/app/request-friend/${userId}`,
        body: JSON.stringify({
          friendId: friendId,
        }),
      });
      console.log(`친구 요청 보냄 : ${userId} -> ${friendId} `);
    } else {
      console.error("❌ STOMP client is not connected");
    }
  };

  // 친구요청 처리
  const processFriendRequest = (friendId, action) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: `/app/process-request/${friendId}`,
        body: JSON.stringify({
          friendId,
          requirements: action, // "ACCEPT" 또는 "DENY"
        }),
      });
      console.log("친구 요청 확인 완료", action);
    } else {
      console.error("STOMP client");
    }
  };

  return {
    sendFriendRequest,
    processFriendRequest,
    connected,
    friendsRequsets,
  };
};

export default useFriendSocket;
