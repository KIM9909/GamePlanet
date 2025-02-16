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
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [connectionError, setConnectionError] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentStream, setCurrentStream] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const tokenRef = useRef(null);
  const videoRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const userId = Number(useSelector((state) => state.user.userId));
  const isMyStream = playerInfo.playerId === Number(userId);

  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 10000; // 10초

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

      // 토큰 가져오기
      if (!tokenRef.current) {
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/video/generate-token/${sessionId}`,
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
      setReconnectAttempts(0);
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
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("Max reconnect attempts reached.");
      return;
    }

    console.log(`Reconnecting... Attempt ${reconnectAttempts + 1}`);
    setReconnectAttempts((prev) => prev + 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectToSession();
    }, RECONNECT_DELAY);
  };

  useEffect(() => {
    if (connectionError) {
      reconnectToSession();
    }
  }, [connectionError]);

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
            <div className="text-white text-sm">
              {connectionError || "비디오 연결 중..."}
            </div>
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
