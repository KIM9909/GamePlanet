import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

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
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/messages/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });

      client.subscribe(`/topic/game/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
      });
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
      console.log("게임 시작 요청 전송");
      clientRef.current.publish({
        destination: `/app/game/start-game/${roomId}`,
        body: JSON.stringify({}),
      });

      // 게임 시작 응답을 받기 위한 구독
      return new Promise((resolve) => {
        const subscription = clientRef.current.subscribe(
          `/topic/game/${roomId}`,
          (message) => {
            const response = JSON.parse(message.body);
            console.log("게임 시작 응답:", response);
            subscription.unsubscribe(); // 응답을 받은 후 구독 해제
            resolve({ data: response });
          }
        );
      });
    } else {
      throw new Error("WebSocket이 연결되어 있지 않습니다.");
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
