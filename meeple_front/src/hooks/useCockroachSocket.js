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
      console.log("WebSocket connected");
      setConnected(true);
      setStompClient(client);
      isConnecting.current = false;

      // 게임 메시지 구독
      if (!subscriptionsRef.current.has("game")) {
        const gameSubscription = client.subscribe(
          `/topic/game/${roomId}`,
          (message) => {
            console.log("Game message received:", message.body);
            const response = JSON.parse(message.body);
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
    };

    client.onDisconnect = () => {
      console.log("WebSocket disconnected");
      if (isGameStartedRef.current) {
        console.log("Game is in progress - attempting to reconnect");
        setTimeout(() => connect(), 1000);
        return;
      }
      setConnected(false);
      setStompClient(null);
      isConnecting.current = false;
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
    return new Promise((resolve, reject) => {
      if (!clientRef.current?.connected) {
        reject(new Error("WebSocket not connected"));
        return;
      }

      console.log("Sending game start request");

      // 게임 시작 요청 전송
      clientRef.current.publish({
        destination: `/app/game/start-game/${roomId}`,
        body: JSON.stringify({}),
      });

      // 게임 시작 응답은 기본 구독에서 처리됨
      resolve();
    });
  }, [roomId]);

  const sendMessage = useCallback(
    (messageData) => {
      if (!clientRef.current?.connected) {
        console.error("WebSocket not connected");
        return;
      }

      try {
        if (!messageData.type) {
          clientRef.current.publish({
            destination: `/app/game/chat/${roomId}`,
            body: JSON.stringify({
              message: messageData.message,
              sender: messageData.sender,
            }),
          });
          return;
        }

        let destination;
        let body = messageData.data;

        switch (messageData.type) {
          case "GUESS_CARD":
            destination = `/app/game/single-card/${roomId}`;
            break;
          case "GIVE_CARD":
          case "PASS_CARD":
            destination = `/app/game/give-card/${roomId}`;
            break;
          case "MULTI_CARD":
            destination = `/app/game/multi-card/${roomId}`;
            break;
          case "HAND_CHECK":
            destination = `/app/game/hand-check/${roomId}`;
            break;
          case "GAME_END":
            destination = `/app/game/game-end/${roomId}`;
            break;
          case "UPDATE_ROOM":
            destination = `/app/game/update-room/${roomId}`;
            break;
          default:
            destination = `/app/game/${messageData.type.toLowerCase()}/${roomId}`;
        }

        clientRef.current.publish({
          destination,
          body: JSON.stringify(body),
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
