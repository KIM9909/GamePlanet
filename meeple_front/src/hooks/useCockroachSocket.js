import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

if (typeof global === "undefined") {
  window.global = window;
}

const useSocket = (roomId) => {
  const clientRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const isConnecting = useRef(false);
  const subscriptionsRef = useRef(new Map());
  const isGameStartedRef = useRef(false);

  const connect = useCallback(() => {
    if (isConnecting.current) return;
    isConnecting.current = true;

    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8090/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("웹소켓 연결 완료");
      setConnected(true);
      setStompClient(client);
      isConnecting.current = false;

      // 게임 메시지 구독
      if (!subscriptionsRef.current.has("game")) {
        const gameSubscription = client.subscribe(
          `/topic/game/${roomId}`,
          (message) => {
            const response = JSON.parse(message.body);
            console.log("Game message received:", response);
            // 게임 시작 메시지 처리
            if (response.gameData?.isGameStart) {
              console.log("Game start message received");
              isGameStartedRef.current = true;
            }
          }
        );
        subscriptionsRef.current.set("game", gameSubscription);
      }

      // 채팅 메시지 구독
      if (!subscriptionsRef.current.has("chat")) {
        const chatSubscription = client.subscribe(
          `/topic/messages/${roomId}`,
          (message) => {
            console.log("Chat message received:", message.body);
            const newMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
          }
        );
        subscriptionsRef.current.set("chat", chatSubscription);
      }

      // 입장 메시지 전송
      client.publish({
        destination: `/app/game/join/${roomId}`,
        body: JSON.stringify({ type: "JOIN" }),
      });
    };

    client.onDisconnect = () => {
      console.log("WebSocket disconnected");
      setConnected(false);
      setStompClient(null);
      isConnecting.current = false;

      if (isGameStartedRef.current) {
        console.log("Game is in progress - attempting to reconnect");
        setTimeout(() => connect(), 1000);
      }
    };

    client.onWebSocketError = (error) => {
      console.error("WebSocket error:", error);
    };

    clientRef.current = client;
    client.activate();
  }, [roomId]);

  const disconnect = useCallback(() => {
    if (isGameStartedRef.current) {
      console.log("Game is in progress - maintaining connection");
      return;
    }

    subscriptionsRef.current.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error("Error unsubscribing:", error);
      }
    });
    subscriptionsRef.current.clear();

    if (clientRef.current) {
      clientRef.current.deactivate();
    }
  }, []);

  const startGame = useCallback(() => {
    if (!clientRef.current?.connected) {
      return Promise.reject(new Error("웹소켓 연결 끊김"));
    }

    return new Promise((resolve) => {
      clientRef.current.publish({
        destination: `/app/game/start-game/${roomId}`,
        body: JSON.stringify({}),
      });
      resolve();
    });
  }, [roomId]);

  const sendMessage = useCallback(
    (messageData) => {
      if (!clientRef.current?.connected) {
        console.error("WebSocket not connected");
        return;
      }

      const destination = messageData.type
        ? `/app/game/${messageData.type.toLowerCase()}/${roomId}`
        : `/app/game/chat/${roomId}`;

      try {
        clientRef.current.publish({
          destination,
          body: JSON.stringify(messageData.data || messageData),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [roomId]
  );

  useEffect(() => {
    if (roomId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [roomId, connect, disconnect]);

  return {
    connected,
    sendMessage,
    messages,
    startGame,
    stompClient,
  };
};

export default useSocket;