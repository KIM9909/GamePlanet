import React, { useEffect, useRef, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import axios from "axios";

const OPENVIDU_SERVER_URL = "https://localhost:4443";
const OPENVIDU_SERVER_SECRET = "MY_SECRET";

const VideoChat = ({ playerCount, userId }) => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState(null);
  const [subscribers, setSubscribers] = useState([]);

  const videoRefs = useRef([]);

  const toggleMic = () => {
    if (publisher) {
      const newMicState = !isMicOn;
      publisher.publishAudio(newMicState);
      setIsMicOn(newMicState);
    }
  };

  const toggleCamera = () => {
    if (publisher) {
      const newCameraState = !isCameraOn;
      publisher.publishVideo(newCameraState);
      setIsCameraOn(newCameraState);
    }
  };

  const createSession = async (sessionId) => {
    try {
      const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions`,
        { customSessionId: sessionId },
        {
          headers: {
            Authorization:
              "Basic " + btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`),
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );

      if (response.status === 409) {
        return sessionId;
      }
      if (response.status !== 200) {
        throw new Error(`Failed to create session: ${response.status}`);
      }
      return response.data.id;
    } catch (error) {
      if (
        error.message.includes("certificate") ||
        error.code === "ERR_BAD_REQUEST"
      ) {
        console.warn("Certificate/request error, proceeding with session ID");
        return sessionId;
      }
      throw error;
    }
  };

  const createToken = async (sessionId) => {
    try {
      const response = await axios.post(
        `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${sessionId}/connection`,
        {},
        {
          headers: {
            Authorization:
              "Basic " + btoa(`OPENVIDUAPP:${OPENVIDU_SERVER_SECRET}`),
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`Failed to create token: ${response.status}`);
      }
      return response.data.token;
    } catch (error) {
      console.error("Token creation error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const OV = new OpenVidu();
        console.log("OpenVidu object created:", OV);

        // 세션 생성
        const sessionId = await createSession(userId);
        console.log("Session ID created:", sessionId);

        const session = OV.initSession();
        console.log("Session initialized");

        setSession(session);

        // 토큰 생성
        const token = await createToken(sessionId);
        console.log("Token created");

        // 이벤트 리스너 설정
        session.on("streamCreated", (event) => {
          console.log("Stream created event:", event);
          // 스트림의 연결 데이터에서 사용자 ID 확인
          const streamUserId = JSON.parse(
            event.stream.connection.data
          ).clientData;

          // 자신의 스트림은 구독하지 않음
          if (streamUserId !== userId) {
            // 빈 슬롯을 찾아서 거기에 subscriber 할당
            const emptySlot = videoRefs.current.findIndex(
              (ref, index) =>
                index > 0 &&
                !subscribers.some(
                  (sub) =>
                    sub.stream.streamManager.stream.streamId ===
                    event.stream.streamId
                )
            );

            if (emptySlot !== -1) {
              const subscriber = session.subscribe(
                event.stream,
                videoRefs.current[emptySlot],
                {
                  insertMode: "APPEND",
                }
              );
              setSubscribers((prev) => [
                ...prev,
                { ...subscriber, slotIndex: emptySlot },
              ]);
            }
          }
        });

        session.on("streamDestroyed", (event) => {
          console.log("Stream destroyed event:", event);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
          );
        });

        session.on("exception", (exception) => {
          console.warn("Session exception:", exception);
        });

        // 세션 연결
        await session.connect(token, { clientData: userId });
        console.log("Session connected");

        // 퍼블리셔 초기화
        const publisher = await OV.initPublisher(videoRefs.current[0], {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });

        // 스트림 발행
        await session.publish(publisher);
        console.log("Publisher created and stream published");
        setPublisher(publisher);
      } catch (error) {
        console.error("Session initialization error:", error);
        setError(error.message || "비디오 초기화 중 오류 발생");
      }
    };

    initializeSession();

    return () => {
      if (session) {
        console.log("Cleaning up session");
        session.disconnect();
      }
    };
  }, [userId]);

  const renderVideoElement = (index) => {
    // 첫 번째 칸은 자신의 비디오 (publisher)
    if (index === 0) {
      return (
        <div
          key={index}
          ref={(el) => (videoRefs.current[index] = el)}
          className="relative bg-gray-900 rounded-lg flex items-center justify-center h-40 overflow-hidden"
        >
          <div className="absolute top-2 left-2 bg-gray-900/70 px-2 py-1 rounded text-xs text-white z-10">
            {userId} (나)
          </div>

          {!publisher && <div className="text-gray-500 text-sm">내 비디오</div>}
          {publisher && (
            <div className="absolute bottom-2 right-2 flex gap-2 z-10">
              <button
                onClick={toggleMic}
                className="p-1.5 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition-colors"
              >
                {isMicOn ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <MicOff className="w-4 h-4 text-red-500" />
                )}
              </button>
              <button
                onClick={toggleCamera}
                className="p-1.5 bg-gray-800/80 rounded-full hover:bg-gray-700/80 transition-colors"
              >
                {isCameraOn ? (
                  <Camera className="w-4 h-4 text-white" />
                ) : (
                  <CameraOff className="w-4 h-4 text-red-500" />
                )}
              </button>
            </div>
          )}
        </div>
      );
    }

    // 나머지 칸은 다른 참가자의 비디오 (subscribers)
    const subscriber = subscribers.find((sub) => sub.slotIndex === index);

    // 구독자의 사용자 정보 가져오기
    const subscriberData = subscriber?.stream?.connection?.data
      ? JSON.parse(subscriber.stream.connection.data).clientData
      : `Player ${index}`;

    return (
      <div
        key={index}
        ref={(el) => (videoRefs.current[index] = el)}
        className="relative bg-gray-900 rounded-lg flex items-center justify-center h-40 overflow-hidden"
      >
        <div className="absolute top-2 left-2 bg-gray-900/70 px-2 py-1 rounded text-xs text-white z-10">
          {subscriberData}
        </div>

        {!subscriber && <div className="text-gray-500 text-sm">대기 중...</div>}
      </div>
    );
  };

  return (
    <div
      className="grid gap-2 h-full p-2"
      style={{
        gridTemplateColumns: `repeat(${playerCount}, 1fr)`,
      }}
    >
      {Array(playerCount)
        .fill(null)
        .map((_, i) => renderVideoElement(i))}
    </div>
  );
};

export default VideoChat;
