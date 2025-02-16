import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Camera, CameraOff, Mic, MicOff, UserSearch } from "lucide-react";
import { OpenVidu } from "openvidu-browser";
import axios from "axios";
import { useSelector } from "react-redux";
import ProfileModal from "../../../user/ProfileModal";
import ReportFormModal from "../../../user/ReportFormModal";

const PlayerVideo = ({ playerInfo, sessionId }) => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const memoizedSubscribers = useMemo(() => subscribers, [subscribers]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);

  const tokenRef = useRef(null);
  const videoRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const userId = Number(useSelector((state) => state.user.userId));
  const isMyStream = playerInfo.playerId === Number(userId);

  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 10000; // 10초

  // 비디오 활성화 상태를 스트림별로 관리
  const [publisherVideoEnabled, setPublisherVideoEnabled] = useState(false);
  const [subscriberVideos, setSubscriberVideos] = useState({});

  const toggleVideo = () => {
    if (publisher) {
      publisher.publishVideo(!publisherVideoEnabled);
      setPublisherVideoEnabled(!publisherVideoEnabled);
      publisher.stream.getMediaStream().getVideoTracks()[0].enabled =
        !publisherVideoEnabled;
    }
  };

  const cleanupSession = async (currentSession) => {
    try {
      if (publisher) {
        currentSession?.unpublish(publisher);
      }
      subscribers.forEach((subscriber) => {
        currentSession?.unsubscribe(subscriber);
      });
      await currentSession?.disconnect();
      setSubscribers([]);
      setSession(null);
      setPublisher(null);
      setCurrentStream(null);
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  };

  const connectToSession = async () => {
    if (!sessionId || !playerInfo || isConnecting) return;

    try {
      setIsConnecting(true);

      // 이전 세션 정리
      if (session) {
        await cleanupSession(session);
      }

      const OV = new OpenVidu();
      const currentSession = OV.initSession();
      setSession(currentSession);

      currentSession.on("streamCreated", (event) => {
        const connectionData = JSON.parse(event.stream.connection.data);
        if (
          connectionData.clientData === playerInfo.playerName &&
          !isMyStream
        ) {
          const subscriber = currentSession.subscribe(event.stream, undefined);
          setSubscribers((prev) => [...prev, subscriber]);
          setCurrentStream(subscriber.stream);
          // 구독자의 비디오 상태 초기화
          setSubscriberVideos((prev) => ({
            ...prev,
            [subscriber.stream.streamId]: true,
          }));
        }
      });
      currentSession.on("streamDestroyed", (event) => {
        setSubscribers((prev) =>
          prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
        );
        if (currentStream?.streamId === event.stream.streamId) {
          setCurrentStream(null);
        }
      });

      currentSession.on("streamPropertyChanged", (event) => {
        if (event.changedProperty === "videoActive") {
          // 다른 참가자의 비디오 상태가 변경됨
          const streamId = event.stream.streamId;
          if (!isMyStream) {
            setVideoEnabled(event.newValue);
          }
        }
      });

      // 토큰 가져오기
      if (!tokenRef.current) {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/video/generate-token/${sessionId}`,
          {},
          { headers: { "Content-Type": "application/json" }, timeout: 30000 }
        );

        if (!response.data?.token) {
          throw new Error("No token received from server");
        }
        tokenRef.current = response.data.token;
      }

      await currentSession.connect(tokenRef.current, {
        clientData: playerInfo.playerName,
      });

      if (isMyStream) {
        const newPublisher = await OV.initPublisher(undefined, {
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 10,
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
      }

      setConnectionError(null);
    } catch (error) {
      console.error("Error in video connection:", error);
      setConnectionError(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    connectToSession();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (session) {
        cleanupSession(session);
        tokenRef.current = null;
      }
    };
  }, [sessionId, playerInfo.playerName, isMyStream]);

  const reconnectToSession = async () => {
    setConnectionError(null);
    setIsConnecting(true);
    try {
      // 기존 세션 정리 후 재연결 시도
      if (session) {
        await session.disconnect();
      }
      // 새로운 세션 연결
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
      setCurrentStream(null);
    } catch (error) {
      console.error("Error during reconnection:", error);
      setConnectionError("재연결 실패");
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleAudio = () => {
    if (publisher) {
      publisher.publishAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  useEffect(() => {
    if (session) {
      session.on("streamPropertyChanged", (event) => {
        if (event.changedProperty === "videoActive") {
          setVideoEnabled(event.newValue);
        }
      });
    }
  }, [session]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session) {
        session.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (session) {
        session.disconnect();
      }
    };
  }, [session]);

  // 프로필 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const buttonRef = useRef();

  const getAnchorRect = useCallback(() => {
    return buttonRef.current?.getBoundingClientRect();
  }, []);

  const handleReport = () => {
    setIsModalOpen(false);
    setShowReportForm(true);
  };

  const handleReportSubmit = async (formData) => {
    setShowReportForm(false);
  };

  return (
    <div className="bg-white rounded-md w-full flex flex-col h-32 border-2 border-violet-400">
      <div className="relative bg-black w-full rounded-t-sm h-28 sm:h-20 md:h-24 overflow-hidden flex items-center justify-center">
        {currentStream ? (
          <>
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
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-sm">
                <CameraOff className="w-4 h-4 mr-2" /> 카메라 꺼짐
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-white text-sm">
            {connectionError ? (
              <>
                <p>{connectionError}</p>
                <button
                  onClick={reconnectToSession}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  재연결 시도
                </button>
              </>
            ) : (
              <p>비디오 연결 중...</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-3 py-1 flex-shrink-0">
        <button
          ref={buttonRef}
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-bold text-blue-500 hover:underline flex items-center gap-1"
        >
          {playerInfo.playerName} {isMyStream ? "(나)" : ""}
          {!isMyStream && <UserSearch className="w-4 h-4 text-gray-400" />}
        </button>

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

      {isModalOpen && (
        <ProfileModal
          onClose={() => setIsModalOpen(false)}
          userNickname={playerInfo.playerName}
          userLevel={1}
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

  // return (
  //   <div>
  //     <div>플레이어 창입니다.</div>
  //   </div>
  // );
};

export default PlayerVideo;
