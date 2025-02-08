import React, { useEffect, useState, useRef } from "react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import PlayerCard from "./PlayerCard";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

const VideoChat = ({ nickname, sessionId, isCurrentUser }) => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [players, setPlayers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const tokenRef = useRef(null);

  // 오디오 상태 토글
  const toggleAudio = () => {
    if (publisher) {
      publisher.publishAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  // 비디오 상태 토글
  const toggleVideo = () => {
    if (publisher) {
      publisher.publishVideo(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  // Media Control Button 컴포넌트
  const MediaControlButton = ({ onClick, enabled, Icon, DisabledIcon }) => (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-full transition-all duration-200 backdrop-blur-md
        ${
          enabled
            ? "bg-white/10 hover:bg-white/20 text-white shadow-lg"
            : "bg-red-500/20 hover:bg-red-500/30 text-red-500 shadow-lg"
        }
        group flex items-center justify-center
        hover:scale-110 active:scale-95
        border ${enabled ? "border-white/20" : "border-red-500/30"}
      `}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {enabled ? <Icon size={16} /> : <DisabledIcon size={16} />}
      </div>
    </button>
  );

  // players 상태 업데이트 함수
  const updatePlayers = (publisher, subscribers) => {
    const allPlayers = [];

    // 현재 사용자(publisher) 추가
    if (publisher) {
      allPlayers.push({
        stream: publisher.stream,
        nickname: nickname,
        isCurrentUser: true,
        score: 0,
        isCurrentTurn: false,
        audioEnabled: audioEnabled,
        videoEnabled: videoEnabled,
      });
    }

    // 다른 참가자들(subscribers) 추가
    subscribers.forEach((subscriber) => {
      const connectionData = JSON.parse(subscriber.stream.connection.data);
      allPlayers.push({
        stream: subscriber.stream,
        nickname: connectionData.clientData,
        isCurrentUser: false,
        score: 0,
        isCurrentTurn: false,
        audioEnabled: subscriber.stream.audioActive,
        videoEnabled: subscriber.stream.videoActive,
      });
    });

    setPlayers(allPlayers);
  };

  useEffect(() => {
    console.log("Subscribers 상태 변경:", {
      count: subscribers.length,
      subscribers: subscribers.map((sub) => ({
        connectionId: sub.stream.connection.connectionId,
        streamId: sub.stream.streamId,
        connectionData: JSON.parse(sub.stream.connection.data),
      })),
    });

    updatePlayers(publisher, subscribers);
  }, [subscribers, publisher, audioEnabled, videoEnabled]);

  useEffect(() => {
    if (!sessionId || !nickname || !isCurrentUser || isConnecting) {
      return;
    }

    const OV = new OpenVidu();
    let currentSession = null;

    const connectToSession = async () => {
      try {
        setIsConnecting(true);
        console.log("Initializing session with ID:", sessionId);
        currentSession = OV.initSession();
        setSession(currentSession);

        currentSession.on("streamCreated", (event) => {
          console.log("New stream created", event.stream.connection.data);
          const connectionData = JSON.parse(event.stream.connection.data);

          if (connectionData.clientData !== nickname) {
            console.log("구독 시도:", {
              streamId: event.stream.streamId,
              connectionData: connectionData,
            });

            const subscriber = currentSession.subscribe(
              event.stream,
              undefined
            );

            setSubscribers((prev) => {
              const exists = prev.find(
                (sub) =>
                  sub.stream.connection.connectionId ===
                  subscriber.stream.connection.connectionId
              );
              return exists ? prev : [...prev, subscriber];
            });
          }
        });

        currentSession.on("streamDestroyed", (event) => {
          console.log("Stream destroyed", {
            connectionData: event.stream.connection.data,
            streamId: event.stream.streamId,
          });

          setSubscribers((prev) =>
            prev.filter(
              (sub) =>
                sub.stream.connection.connectionId !==
                event.stream.connection.connectionId
            )
          );
        });

        currentSession.on("sessionDisconnected", () => {
          console.log("Session disconnected, clearing subscribers");
          setSubscribers([]);
          setIsConnecting(false);
          tokenRef.current = null;
        });

        if (!tokenRef.current) {
          const response = await axios.post(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/video/generate-token/${sessionId}`,
            {},
            {
              headers: { "Content-Type": "application/json" },
              timeout: 10000,
            }
          );

          if (!response.data?.token) {
            throw new Error("No token received from server");
          }

          tokenRef.current = response.data.token;
        }

        await currentSession.connect(tokenRef.current, {
          clientData: nickname,
        });

        const newPublisher = await OV.initPublisher(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: audioEnabled,
          publishVideo: videoEnabled,
          resolution: "640x480",
          frameRate: 15,
          insertMode: "APPEND",
          mirror: false,
        });

        await currentSession.publish(newPublisher);
        setPublisher(newPublisher);
      } catch (error) {
        console.error("Error in video chat connection:", error);
        setConnectionError(
          error.response?.status === 500
            ? "서버 오류가 발생했습니다."
            : `연결 오류: ${error.message}`
        );
        tokenRef.current = null;
      } finally {
        setIsConnecting(false);
      }
    };

    connectToSession();

    return () => {
      if (currentSession) {
        try {
          console.log("Cleaning up video session...");
          if (publisher) {
            currentSession.unpublish(publisher);
          }
          subscribers.forEach((subscriber) => {
            currentSession.unsubscribe(subscriber);
          });
          currentSession.disconnect();
          setSubscribers([]);
          setIsConnecting(false);
          tokenRef.current = null;
          setSession(null);
          setPublisher(null);
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [sessionId, nickname, isCurrentUser]);

  if (connectionError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <p className="text-sm text-red-400">{connectionError}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {players.map((player) => (
        <PlayerCard
          key={player.stream.connection?.connectionId || player.nickname}
          userNickname={player.nickname}
          isCurrentTurn={player.isCurrentTurn}
          score={player.score}
          isCurrentUser={player.isCurrentUser}
          sessionId={sessionId}
        >
          <div className="relative w-full h-full group">
            <video
              autoPlay
              ref={(video) => {
                if (video) video.srcObject = player.stream.getMediaStream();
              }}
              className={`w-full h-full object-cover rounded-lg ${
                !player.videoEnabled ? "hidden" : ""
              }`}
            />
            {!player.videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                <div className="text-white text-lg">카메라 꺼짐</div>
              </div>
            )}

            {/* 미디어 상태 표시 */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              <div className="bg-black/50 px-2 py-1 rounded text-white">
                {player.isCurrentUser
                  ? `나 (${player.nickname})`
                  : player.nickname}
              </div>
              {!player.audioEnabled && (
                <div className="bg-red-500/80 p-1 rounded-full">
                  <MicOff size={16} className="text-white" />
                </div>
              )}
            </div>

            {/* 미디어 컨트롤 버튼 (현재 사용자만) */}
            {player.isCurrentUser && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="flex gap-3 bg-black/20 backdrop-blur-md p-1.5 rounded-full">
                  <MediaControlButton
                    onClick={toggleAudio}
                    enabled={audioEnabled}
                    Icon={Mic}
                    DisabledIcon={MicOff}
                  />
                  <MediaControlButton
                    onClick={toggleVideo}
                    enabled={videoEnabled}
                    Icon={Video}
                    DisabledIcon={VideoOff}
                  />
                </div>
              </div>
            )}
          </div>
        </PlayerCard>
      ))}
    </div>
  );
};

export default VideoChat;
