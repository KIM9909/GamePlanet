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
  const [connected, setConnected] = useState(false);

  // stompClient 상태 추가
  const [stompClient, setStompClient] = useState(null);

  const connect = useCallback(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8090/ws"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);
      setStompClient(client);

      client.subscribe(`/topic/messages/${roomId}`, (message) => {
        console.log("Received message:", message.body);
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [
          ...prev,
          {
            content: newMessage.content,
            sender: newMessage.sender,
            timestamp: newMessage.timestamp,
          },
        ]);
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
      setStompClient(null); // 연결 해제시 stompClient null로 설정
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
      if (!clientRef.current?.connected) {
        console.error("WebSocket not connected");
        return;
      }

      try {
        console.log("Sending message:", messageData);

        // 채팅 메시지 처리
        if (!messageData.type) {
          // 채팅 메시지는 type이 없음
          clientRef.current.publish({
            destination: `/app/game/chat/${roomId}`,
            body: JSON.stringify(messageData),
          });
          return;
        }

        // PASS_CARD 처리
        if (messageData.type === "PASS_CARD") {
          clientRef.current.publish({
            destination: `/app/game/pass-card/${roomId}`,
            body: JSON.stringify(messageData.data),
          });
          return;
        }

        // 다른 게임 메시지 처리
        clientRef.current.publish({
          destination: `/app/game/${messageData.type.toLowerCase()}/${roomId}`,
          body: JSON.stringify(messageData.data),
        });
      } catch (error) {
        console.error("Error sending message:", error);
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

      return new Promise((resolve) => {
        const subscription = clientRef.current.subscribe(
          `/topic/game/${roomId}`,
          (message) => {
            const response = JSON.parse(message.body);
            console.log("게임 시작 응답:", response);
            subscription.unsubscribe();
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
    connected,
    sendMessage,
    messages,
    startGame,
    stompClient: stompClient,
  };
};

export default useSocket;
