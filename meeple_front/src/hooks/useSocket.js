import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// global 객체가 없을 경우를 대비한 폴리필
if (typeof global === "undefined") {
  window.global = window;
}

const useSocket = (roomId) => {
  const clientRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8090/ws"),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");

      // 채팅 메시지 구독
      client.subscribe(`/topic/messages/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });

      // 게임 상태 구독
      client.subscribe(`/topic/game/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        // 게임 상태 처리 콜백
      });
    };

    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    clientRef.current = client;
    client.activate();
  }, [roomId]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }
  }, []);

  const sendMessage = useCallback(
    (messageData) => {
      if (clientRef.current?.connected) {
        clientRef.current.publish({
          destination: `/app/chat/${roomId}`,
          body: JSON.stringify({
            message: messageData.message,
            sender: messageData.sender,
          }),
        });
      }
    },
    [roomId]
  );

  const startGame = useCallback(() => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination: `/app/game/start-game/${roomId}`,
        body: JSON.stringify({}),
      });
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId) {
      connect();
      return () => disconnect();
    }
  }, [roomId, connect, disconnect]);

  return {
    connected: !!clientRef.current?.connected,
    sendMessage,
    messages,
    startGame,
  };
};

export default useSocket;
