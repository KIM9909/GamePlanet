import React, { useState, useEffect, useRef } from "react";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import { useSelector } from "react-redux";

const PlayerVideo = ({ playerInfo, sessionId }) => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const tokenRef = useRef(null);
  const videoRef = useRef(null);

  const userId = Number(useSelector((state) => state.user.userId));
  // 현재 플레이어가 본인인지 확인
  const isMyStream = playerInfo.playerId === Number(userId);

  useEffect(() => {
    if (!sessionId || !playerInfo || isConnecting) return;

    const OV = new OpenVidu();
    let currentSession = null;

    const connectToSession = async () => {
      try {
        setIsConnecting(true);
        console.log("Initializing session with ID:", sessionId);
        currentSession = OV.initSession();
        setSession(currentSession);

        // 스트림 생성 이벤트 핸들러
        currentSession.on("streamCreated", (event) => {
          const connectionData = JSON.parse(event.stream.connection.data);
          console.log("Stream created for:", connectionData.clientData);

          // 현재 playerInfo와 일치하는 스트림인지 확인
          if (
            connectionData.clientData === playerInfo.playerName &&
            !isMyStream
          ) {
            const subscriber = currentSession.subscribe(
              event.stream,
              undefined
            );
            setSubscribers((prev) => {
              const newSubscribers = [...prev, subscriber];
              console.log(
                "Updated subscribers for",
                playerInfo.playerName,
                ":",
                newSubscribers.length
              );
              setCurrentStream(subscriber.stream);
              return newSubscribers;
            });
          }
        });

        currentSession.on("streamDestroyed", (event) => {
          console.log("Stream destroyed:", event.stream.connection.data);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
          );
          if (currentStream?.streamId === event.stream.streamId) {
            setCurrentStream(null);
          }
        });

        // 토큰 가져오기
        if (!tokenRef.current) {
          const response = await axios.post(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/video/generate-token/${sessionId}`,
            {},
            {
              headers: { "Content-Type": "application/json" },
              timeout: 30000,
            }
          );

          if (!response.data?.token) {
            throw new Error("No token received from server");
          }
          tokenRef.current = response.data.token;
        }

        // 세션 연결
        await currentSession.connect(tokenRef.current, {
          clientData: playerInfo.playerName,
        });

        // 본인의 스트림인 경우에만 Publisher 생성
        if (isMyStream) {
          console.log("Creating publisher for:", playerInfo.playerName);
          const newPublisher = await OV.initPublisher(undefined, {
            audioSource: undefined,
            videoSource: undefined,
            publishAudio: true,
            publishVideo: true,
            resolution: "640x480",
            frameRate: 30,
            insertMode: "APPEND",
            mirror: false,
            publisherProperties: {
              mediaConstraints: {
                audio: {
                  echoCancellation: true,
                  noiseSuppression: true,
                  autoGainControl: true,
                },
                video: {
                  width: { ideal: 640 },
                  height: { ideal: 480 },
                  frameRate: { ideal: 30 },
                },
              },
            },
          });

          newPublisher.on("streamPropertyChanged", (event) => {
            if (event.changedProperty === "videoActive") {
              setVideoEnabled(event.newValue);
            } else if (event.changedProperty === "audioActive") {
              setAudioEnabled(event.newValue);
            }
          });

          await currentSession.publish(newPublisher);
          setPublisher(newPublisher);
          setCurrentStream(newPublisher.stream);
          console.log(
            "Publisher created successfully for:",
            playerInfo.playerName
          );
        }
      } catch (error) {
        console.error("Error in video connection:", error);
        setConnectionError(error.message);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToSession();

    return () => {
      if (currentSession) {
        try {
          if (publisher) {
            currentSession.unpublish(publisher);
          }
          subscribers.forEach((subscriber) => {
            currentSession.unsubscribe(subscriber);
          });
          currentSession.disconnect();
          setSubscribers([]);
          setSession(null);
          setPublisher(null);
          setCurrentStream(null);
          tokenRef.current = null;
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      }
    };
  }, [sessionId, playerInfo.playerName, isMyStream]);

  const toggleAudio = () => {
    if (publisher) {
      publisher.publishAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (publisher) {
      publisher.publishVideo(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  if (connectionError) {
    return (
      <div className="bg-white rounded-md w-full flex flex-col h-32 border-2 border-violet-400">
        <div className="bg-black w-full rounded-t-sm h-28 sm:h-20 md:h-24 text-white flex items-center justify-center">
          <p className="text-red-400 text-sm">{connectionError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md w-full flex flex-col h-32 border-2 border-violet-400">
      <div className="relative bg-black w-full rounded-t-sm h-28 sm:h-20 md:h-24 overflow-hidden">
        {currentStream ? (
          <video
            ref={(video) => {
              if (video) {
                video.srcObject = currentStream.getMediaStream();
                video.muted = isMyStream;
              }
              videoRef.current = video;
            }}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${
              !videoEnabled ? "hidden" : ""
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-sm">비디오 연결 중...</div>
          </div>
        )}
        {!videoEnabled && currentStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-sm">카메라 꺼짐</div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center px-3 py-1 flex-shrink-0">
        <p className="text-sm truncate">
          {playerInfo.playerName} {isMyStream ? "(나)" : ""}
        </p>
        {isMyStream && (
          <div className="flex flex-row items-center space-x-1">
            <button
              onClick={toggleAudio}
              className="hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              {audioEnabled ? (
                <Mic className="w-4 h-4 text-gray-600" />
              ) : (
                <MicOff className="w-4 h-4 text-red-500" />
              )}
            </button>
            <button
              onClick={toggleVideo}
              className="hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              {videoEnabled ? (
                <Camera className="w-4 h-4 text-gray-600" />
              ) : (
                <CameraOff className="w-4 h-4 text-red-500" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerVideo;
