import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const useFriendSocket = (userId, onFriendRequestReceived) => {
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // WebSocket 연결
    const socket = new SockJS("http://boardjjigae.duckdns.org/ws");
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
        if (onFriendRequestReceived) {
          onFriendRequestReceived(receivedData);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("X WebSocket Error", frame.headers["message"]);
    };

    stompClient.activate;
    stompClientRef.current = stompClient;

    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [userId, onFriendRequestReceived]);

  // 친구 요청 보내기
  const sendFriendRequest = (targetUserId) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/request-friend",
        body: JSON.stringify({
          userId,
          friendId: targetUserId,
        }),
      });
    } else {
      console.error("STOMP client is not connected");
    }
  };

  const processFriendRequest = (friendId, action) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: "/app/process-request",
        body: JSON.stringify({
          friendId,
          requestId: userId, // 요청을 승인 or 거절하는 사용자
          requirements: action, // "ACCEPT" 또는 "DENY"
        }),
      });
    } else {
      console.error("STOMP client");
    }
  };
};
