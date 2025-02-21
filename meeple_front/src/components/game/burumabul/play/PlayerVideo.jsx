import React, { useState, useEffect, useRef, useCallback } from "react";
import { Camera, CameraOff, Mic, MicOff, UserSearch } from "lucide-react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import { useSelector } from "react-redux";
import UserAPI from "../../../../sources/api/UserAPI";
import ProfileModal from "../../../user/ProfileModal";
import ReportFormModal from "../../../user/ReportFormModal";

const PlayerVideo = ({ playerInfo, sessionId, onGameEnd }) => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false); // 초기값을 false로 설정
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [reconnectRequired, setReconnectRequired] = useState(false);
  const tokenRef = useRef(null);
  const videoRef = useRef(null);
  const { getProfile } = UserAPI;

  // 미니프로필
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const buttonRef = useRef();

  const getAnchorRect = useCallback(() => {
    return buttonRef.current?.getBoundingClientRect();
  }, []);

  const handleReport = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setShowReportForm(true);
    }, 0);
  };

  const handleReportSubmit = async (formData) => {
    // 기존 submit 로직
    setShowReportForm(false);
  };

  const userId = Number(useSelector((state) => state.user.userId));
  const isMyStream = playerInfo.playerId === Number(userId);
  const [userNickName, setUserNickName] = useState(null);
  const [userLevel, setUserLevel] = useState(null);

  useEffect(() => {
    const getPlayerNickname = async (playerId) => {
      if (playerId) {
        try {
          const response = await getProfile(playerId);
          setUserNickName(response.userNickname);
          setUserLevel(response.userLevel);
        } catch (error) {
          console.error("닉네임 조회 중 오류:", error);
        }
      }
    };
    getPlayerNickname(playerInfo.playerId);
  }, [userId]);

  const connectToSession = async () => {
    if (!sessionId || !playerInfo || isConnecting) return;

    const OV = new OpenVidu();
    let currentSession = null;

    try {
      setIsConnecting(true);
      setConnectionError(null);
      setReconnectRequired(false);

      console.log("Initializing session with ID:", sessionId);
      currentSession = OV.initSession();
      setSession(currentSession);

      // 스트림 생성 이벤트 핸들러
      currentSession.on("streamCreated", (event) => {
        const connectionData = JSON.parse(event.stream.connection.data);
        console.log("Stream created for:", connectionData.clientData);

        if (
          connectionData.clientData === playerInfo.playerName &&
          !isMyStream
        ) {
          const subscriber = currentSession.subscribe(event.stream, undefined);
          subscriber.on("streamPropertyChanged", (propertyChangeEvent) => {
            console.log("Subscriber property changed:", propertyChangeEvent);
            if (propertyChangeEvent.changedProperty === "videoActive") {
              setVideoEnabled(propertyChangeEvent.newValue);
            } else if (propertyChangeEvent.changedProperty === "audioActive") {
              setAudioEnabled(propertyChangeEvent.newValue);
            }
          });

          setSubscribers((prev) => {
            const newSubscribers = [...prev, subscriber];
            setCurrentStream(subscriber.stream);
            // 초기 상태 설정
            setVideoEnabled(subscriber.stream.videoActive);
            setAudioEnabled(subscriber.stream.audioActive);
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

      // 스트림 속성 변경 이벤트 핸들러 추가
      currentSession.on("streamPropertyChanged", (event) => {
        console.log(
          "Stream property changed:",
          event.changedProperty,
          event.newValue
        );
        const isRemoteStream =
          !isMyStream &&
          event.stream.connection.connectionId ===
            currentSession?.connection?.connectionId;
        const isLocalStream =
          isMyStream &&
          event.stream.connection.connectionId ===
            currentSession?.connection?.connectionId;

        if (
          event.changedProperty === "videoActive" ||
          event.changedProperty === "audioActive"
        ) {
          if (isRemoteStream || isLocalStream) {
            if (event.changedProperty === "videoActive") {
              setVideoEnabled(event.newValue);
            } else if (event.changedProperty === "audioActive") {
              setAudioEnabled(event.newValue);
            }
          }
        }
      });

      // 연결 끊김 이벤트 핸들러
      currentSession.on("sessionDisconnected", (event) => {
        console.log("Session disconnected:", event);
        setConnectionError("연결이 끊어졌습니다.");
        setReconnectRequired(true);
        cleanup();
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
          publishVideo: false, // 초기에는 비디오를 끈 상태로 시작
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
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
      setReconnectRequired(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const cleanup = () => {
    if (session) {
      try {
        if (publisher) {
          session.unpublish(publisher);
        }
        subscribers.forEach((subscriber) => {
          session.unsubscribe(subscriber);
        });
        session.disconnect();
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

  useEffect(() => {
    connectToSession();
    return cleanup;
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

  const handleReconnect = () => {
    connectToSession();
  };

  if (connectionError) {
    return (
      <div className="bg-white rounded-md w-full flex flex-col h-32 border-2 border-violet-400">
        <div className="bg-black w-full rounded-t-sm h-28 sm:h-20 md:h-24 text-white flex flex-col items-center justify-center gap-2">
          <p className="text-red-400 text-sm">재연결을 시도하세요.</p>
          {reconnectRequired && (
            <button
              onClick={handleReconnect}
              className="px-4 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
            >
              재연결 시도
            </button>
          )}
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
        <div className="flex flex-row items-center space-x-1">
          {!isMyStream && (
            <button
              ref={buttonRef}
              onClick={() => setIsModalOpen((prev) => !prev)}
              className="p-1 rounded-full hover:bg-gray-600 transition-colors"
            >
              <UserSearch className="w-4 h-4 text-gray-400 hover:text-gray-200" />
            </button>
          )}
          {isMyStream && (
            <>
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
            </>
          )}
        </div>
        <p
          className="text-sm truncate "
          title={`${userNickName}${isMyStream ? " (나)" : ""}`}
        >
          {userNickName} {isMyStream ? "(나)" : ""}
        </p>
      </div>
      {isModalOpen && !showReportForm && (
        <ProfileModal
          onClose={() => setIsModalOpen(false)}
          userNickname={userNickName}
          userLevel={userLevel}
          getAnchorRect={getAnchorRect}
          onReport={handleReport}
        />
      )}

      {showReportForm && (
        <ReportFormModal
          onClose={() => setShowReportForm(false)}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
};

export default PlayerVideo;
