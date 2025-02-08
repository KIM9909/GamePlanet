import React, { useEffect, useRef, useState, useCallback } from "react";
import { OpenVidu } from "openvidu-browser";
import { VideoAPI } from "../../../../sources/api/CatchMindAPI";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const VideoChat = ({ nickname }) => {
  const { roomId } = useParams();
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentUser = useSelector((state) => state.profile.profileData);
  const isCurrentUser = currentUser?.userNickname === nickname;

  const publisherRef = useRef(null);
  const subscribersRef = useRef(null);
  const sessionRef = useRef(null);
  const publisherObjRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);

  // Publisher 설정
  const getPublisherOptions = () => ({
    audioSource: undefined,
    videoSource: undefined,
    publishAudio: true,
    publishVideo: true,
    resolution: "640x480",
    frameRate: 30,
    insertMode: "APPEND",
    mirror: false,
    videoSimulcast: false,
    NetworkQualityLevels: true,
  });

  // 스트림 생성 핸들러
  const handleStreamCreated = async (session, event, mounted) => {
    if (!mounted) return;

    try {
      const connectionData = JSON.parse(event.stream.connection.data);
      const streamNickname = connectionData.clientData;

      if (streamNickname === nickname) return;

      console.log(`Subscribing to stream from ${streamNickname}`);
      const subscriber = session.subscribe(
        event.stream,
        subscribersRef.current
      );

      subscriber.on("videoElementCreated", (e) => {
        const videoElement = e.element;
        videoElement.classList.add("w-full", "h-full", "object-cover");

        videoElement.addEventListener("loadedmetadata", () => {
          console.log(`Video metadata loaded for ${streamNickname}`);
        });

        videoElement.addEventListener("playing", () => {
          console.log(`Video started playing for ${streamNickname}`);
        });
      });

      subscriber.on("streamPlaying", () => {
        console.log(`Stream is playing for ${streamNickname}`);
      });

      subscriber.on("streamPlayingFailed", (error) => {
        console.error(`Stream playing failed for ${streamNickname}:`, error);
        try {
          subscriber.stream?.disposeWebRtcPeer();
          session.subscribe(event.stream, subscribersRef.current);
        } catch (retryError) {
          console.error("Error during stream resubscription:", retryError);
        }
      });

      setSubscribers((prev) => [...prev, subscriber]);
    } catch (error) {
      console.error("Error in streamCreated handler:", error);
    }
  };

  // 세션 정리
  const cleanupSession = async () => {
    console.log("Cleaning up session...");
    try {
      if (subscribers.length > 0) {
        subscribers.forEach((subscriber) => {
          try {
            if (subscriber.stream) {
              subscriber.stream.disposeWebRtcPeer();
            }
          } catch (error) {
            console.warn("Error disposing subscriber:", error);
          }
        });
      }

      if (publisherObjRef.current) {
        try {
          if (publisherObjRef.current.stream) {
            publisherObjRef.current.stream.disposeWebRtcPeer();
          }
          publisherObjRef.current = null;
        } catch (error) {
          console.warn("Error disposing publisher:", error);
        }
      }

      if (sessionRef.current && isConnectedRef.current) {
        try {
          await sessionRef.current.disconnect();
          console.log("Session disconnected successfully");
        } catch (error) {
          console.warn("Error disconnecting session:", error);
        }
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      sessionRef.current = null;
      isConnectedRef.current = false;
      setSession(null);
      setPublisher(null);
      setSubscribers([]);
    }
  };

  // 마이크 토글
  const toggleMic = useCallback(() => {
    if (!publisher || !isCurrentUser) return;
    try {
      const newMicState = !isMicOn;
      publisher.publishAudio(newMicState);
      setIsMicOn(newMicState);
    } catch (error) {
      console.error("Error toggling mic:", error);
    }
  }, [publisher, isCurrentUser, isMicOn]);

  // 카메라 토글
  const toggleCamera = useCallback(() => {
    if (!publisher || !isCurrentUser || !session) return;
    try {
      const newCameraState = !isCameraOn;
      publisher.publishVideo(newCameraState);
      setIsCameraOn(newCameraState);

      if (publisherRef.current) {
        const videoElements =
          publisherRef.current.getElementsByTagName("video");
        if (videoElements.length > 0) {
          videoElements[0].style.display = newCameraState ? "block" : "none";
        }
      }
    } catch (error) {
      console.error("Error toggling camera:", error);
    }
  }, [publisher, isCurrentUser, session, isCameraOn]);

  // 메인 초기화 효과
  useEffect(() => {
    let mounted = true;

    const initializeSession = async () => {
      if (isInitializing) return;

      setIsInitializing(true);
      setError(null);

      try {
        await cleanupSession();

        console.log("Initializing OpenVidu session...");
        const OV = new OpenVidu();

        OV.setAdvancedConfiguration({
          forceMediaReconnectionAfterNetworkDrop: true,
          timeoutInterval: 30000,
          backoffPeriod: 1000,
          retryOnFailure: 3,
          iceServers: [
            { urls: ["stun:stun.l.google.com:19302"] },
            { urls: ["stun:stun1.l.google.com:19302"] },
          ],
        });

        const session = OV.initSession();
        sessionRef.current = session;

        if (!mounted) return;
        setSession(session);

        // 이벤트 리스너 설정
        session.on("streamCreated", (event) =>
          handleStreamCreated(session, event, mounted)
        );

        session.on("streamDestroyed", (event) => {
          if (!mounted) return;
          console.log("Stream destroyed:", event.stream.streamId);
          setSubscribers((prev) =>
            prev.filter((sub) => sub.stream.streamId !== event.stream.streamId)
          );
        });

        session.on("sessionDisconnected", () => {
          if (!mounted) return;
          console.log("Session disconnected");
          isConnectedRef.current = false;
          cleanupSession();
        });

        session.on("exception", (exception) => {
          console.warn("Session exception:", exception);
        });

        // 토큰 생성 및 연결
        console.log("Generating token...");
        const tokenResponse = await VideoAPI.generateToken(roomId);

        console.log("Connecting to session...");
        await session.connect(tokenResponse.token, { clientData: nickname });
        console.log("Connected to session");
        isConnectedRef.current = true;

        // Publisher 초기화
        console.log("Initializing publisher...");
        const publisher = OV.initPublisher(
          publisherRef.current,
          getPublisherOptions()
        );

        publisherObjRef.current = publisher;

        publisher.on("videoElementCreated", (event) => {
          const videoElement = event.element;
          videoElement.classList.add("w-full", "h-full", "object-cover");

          videoElement.addEventListener("loadedmetadata", () => {
            console.log("Publisher video metadata loaded");
          });

          videoElement.addEventListener("playing", () => {
            console.log("Publisher video started playing");
          });
        });

        publisher.on("streamPropertyChanged", (event) => {
          if (event.changedProperty === "videoActive" && !event.newValue) {
            console.warn("Publisher video quality degraded");
          }
        });

        await session.publish(publisher);
        console.log("Publisher started");

        if (mounted) {
          setPublisher(publisher);
          retryCountRef.current = 0;
        }
      } catch (error) {
        console.error("Error initializing session:", error);
        setError("비디오 연결에 실패했습니다.");

        if (retryCountRef.current < 3) {
          retryCountRef.current += 1;
          console.log(
            `Retrying initialization (attempt ${
              retryCountRef.current + 1
            }/3)...`
          );
          retryTimeoutRef.current = setTimeout(() => {
            if (mounted) {
              setIsInitializing(false);
              initializeSession();
            }
          }, 2000);
        } else {
          setError(
            "연결 재시도 횟수를 초과했습니다. 페이지를 새로고침해주세요."
          );
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    if (nickname && roomId) {
      initializeSession();
    }

    return () => {
      mounted = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      cleanupSession();
    };
  }, [nickname, roomId]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-gray-400 text-lg">카메라 OFF</div>
        </div>
      )}

      <div ref={publisherRef} className="absolute inset-0" />
      <div ref={subscribersRef} className="absolute inset-0" />

      {isCurrentUser && (
        <div className="absolute bottom-2 right-2 flex gap-2 z-20">
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

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-30">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
