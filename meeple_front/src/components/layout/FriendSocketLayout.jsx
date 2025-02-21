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
import { useLocation } from "react-router-dom";

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
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;

    const stompClient = new Client({
      webSocketFactory: () => {
        return new SockJS(`${import.meta.env.VITE_SOCKET_API_BASE_URL}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
      },
    });

    stompClient.onConnect = () => {
      setConnected(true);

      // 친구 요청 및 쪽지 알림 구독
      stompClient.subscribe(`/topic/user/${userId}`, (message) => {
        const receivedData = message.body;
        setResponseSocket(receivedData);
      });
    };

    stompClient.onDisconnect = () => {
      setConnected(false);
    };

    stompClient.onWebSocketError = (error) => {
    };
    stompClient.onUnhandledMessage = (message) => {
    };

    stompClient.onStompError = (frame) => {

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

  if (
    !userId ||
    !token ||
    (location.pathname === "/" &&
      location.pathname.match(/^\/game\/burumabul\/[\w-]+$/) &&
      location.pathname.match(/^\/catch-mind\/[\w-]+$/))
  ) {
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
