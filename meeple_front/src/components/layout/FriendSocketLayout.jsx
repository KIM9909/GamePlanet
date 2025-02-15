import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import FriendModalLayout from "./FriendModalLayout";

// Context 생성
export const FriendSocketContext = createContext({
  connected: false,
  responseSocket: null,
  stompClientRef: { current: null },
});

// Provider 컴포넌트
export const FriendSocketLayout = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const [responseSocket, setResponseSocket] = useState("");

  const userId = useSelector((state) => state.user.userId);
  const rawToken = localStorage.getItem("token");
  const token = rawToken ? rawToken.trim() : "";

  useEffect(() => {
    if (!userId) return;

    console.log("🌐 STOMP Client 생성 중...");
    const stompClient = new Client({
      webSocketFactory: () => {
        console.log("🌍 SockJS WebSocket 팩토리 실행됨!");
        return new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log("🛠 STOMP Debug:", str);
      },
    });

    stompClient.onConnect = () => {
      setConnected(true);
      console.log("✅ WebSocket 연결 성공");

      // 친구 요청 및 쪽지 알림 구독
      stompClient.subscribe(`/topic/user/${userId}`, (message) => {
        const receivedData = message.body;
        console.log("📩 받은 메시지:", receivedData);
        setResponseSocket(receivedData);
        console.log(receivedData);
      });
    };

    stompClient.onDisconnect = () => {
      console.warn("❌ WebSocket 연결이 끊어졌습니다!");
      setConnected(false);
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
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
        setConnected(false);
      }
    };
  }, [userId]);

  if (!userId || !token || location.pathname === "/") {
    return children;
  } else {
    return (
      <FriendSocketContext.Provider
        value={{ connected, responseSocket, stompClientRef }}
      >
        {children}
      </FriendSocketContext.Provider>
    );
  }
};

export default FriendSocketLayout;
