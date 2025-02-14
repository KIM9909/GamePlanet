import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useDispatch, useSelector } from "react-redux";
import { addFriendRequest } from "../sources/store/slices/FriendSlice";

const useFriendSocket = () => {
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const [responseSocket, setResponseSocket] = useState("");

  const friendsRequsets = useSelector((state) => state.friend.friendRequests);
  const userId = useSelector((state) => state.user.userId);
  const dispatch = useDispatch();
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? rawToken.trim() : "";

  useEffect(() => {
    if (!userId) return;

    // WebSocket 연결
    console.log("🌐 STOMP Client 생성 중...");
    const stompClient = new Client({
      webSocketFactory: () => {
        console.log("🌍 SockJS WebSocket 팩토리 실행됨!");
        // return new SockJS(`${import.meta.env.VITE_SOCKET_LOCAL_API_BASE_URL}`);
        return new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("🛠 STOMP Debug:", str); // 강제 디버깅 출력
      },
    });

    stompClient.onConnect = () => {
      setConnected(true);

      // 친구 요청 + 쪽지 알림 구독
      stompClient.subscribe(`/topic/user/${userId}`, (message) => {
        const receivedData = message.body;
        console.log("원본 메시지:", message);
        console.log("메시지 헤더:", message.headers);
        console.log("메시지 바디:", message.body);
        console.log("알림 수신 : ", receivedData);
        setResponseSocket(receivedData);
        console.log(receivedData);
      });
    };

    stompClient.onDisconnect = () => {
      console.warn("❌ WebSocket 연결이 끊어졌습니다!");
    };
    stompClient.onWebSocketError = (error) => {
      console.error("WebSocket Error:", error);
    };

    stompClient.onUnhandledMessage = (message) => {
      console.log("Unhandled Message:", message);
    };

    stompClient.onStompError = (frame) => {
      console.error("WebSocket Error", frame.headers["message"]);

      setConnected(false);
    };
    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      if (stompClientRef.current && stompClientRef.current.connected) {
        stompClientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [userId]);

  return {
    connected,
    responseSocket,
    stompClientRef,
  };
};

export default useFriendSocket;
