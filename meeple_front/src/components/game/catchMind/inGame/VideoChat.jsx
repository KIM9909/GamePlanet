import React, { useEffect, useRef, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import { VideoAPI } from "../../../../sources/api/CatchMindAPI";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useSelector } from "react-redux";

const VideoChat = ({ nickname }) => {
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.profile.profileData);
  const isCurrentUser = currentUser?.userNickname === nickname;

  const videoContainerRef = useRef(null);
  const publisherRef = useRef(null);

  // OpenVidu 세션 저장용 ref
  const sessionRef = useRef(null);
  const publisherObjRef = useRef(null);

  // 마이크 토글
  const toggleMic = () => {
    if (publisher && isCurrentUser) {
      const newMicState = !isMicOn;
      publisher.publishAudio(newMicState);
      setIsMicOn(newMicState);
    }
  };

  // 카메라 토글
  const toggleCamera = async () => {
    if (!publisher || !isCurrentUser || !session) return;

    const newCameraState = !isCameraOn;

    try {
      // 1. 로컬 비디오 상태 변경
      publisher.publishVideo(newCameraState);

      // 2. 시그널 전송을 위한 데이터 준비
      const signalData = {
        nickname: nickname,
        enabled: newCameraState,
        connectionId: session.connection.connectionId,
      };

      // 3. 시그널 전송
      await session.signal({
        type: "camera-state-change",
        data: JSON.stringify(signalData),
      });

      // 4. 로컬 UI 업데이트
      if (publisherRef.current) {
        const videoElements =
          publisherRef.current.getElementsByTagName("video");
        if (videoElements.length > 0) {
          videoElements[0].style.display = newCameraState ? "block" : "none";
        }
      }

      setIsCameraOn(newCameraState);
    } catch (error) {
      console.error("카메라 상태 변경 중 오류:", error);
      publisher.publishVideo(isCameraOn);
    }
  };

  // 세션 초기화 및 연결 관리
  useEffect(() => {
    let isComponentMounted = true;

    const initializeSession = async () => {
      try {
        // 이전 세션 정리
        if (sessionRef.current) {
          await cleanupSession();
        }

        const OV = new OpenVidu();
        const sessionResponse = await VideoAPI.createSession();
        const session = OV.initSession();
        sessionRef.current = session;

        if (!isComponentMounted) return;
        setSession(session);

        // 이벤트 핸들러 설정
        session.on("streamCreated", (event) => {
          if (!isComponentMounted) return;

          const subscriber = session.subscribe(
            event.stream,
            videoContainerRef.current
          );
          subscriber.on("videoElementCreated", (e) => {
            e.element.classList.add("w-full", "h-full", "object-cover");
          });

          try {
            const streamData = JSON.parse(event.stream.connection.data);
            const subscriberNickname = streamData.clientData;

            subscriber.on("videoElementCreated", (e) => {
              e.element.style.width = "100%";
              e.element.style.height = "100%";
              e.element.style.objectFit = "cover";
              if (!event.stream.videoActive) {
                e.element.style.display = "none";
              }
            });
          } catch (error) {
            console.error("구독자 비디오 초기화 중 오류:", error);
          }

          if (isComponentMounted) {
            setSubscribers((prev) => [...prev, subscriber]);
          }
        });

        session.on("streamDestroyed", (event) => {
          if (isComponentMounted) {
            setSubscribers((prev) =>
              prev.filter(
                (sub) => sub.stream.streamId !== event.stream.streamId
              )
            );
          }
        });

        session.on("exception", (error) => {
          console.warn("세션 예외 발생:", error);
        });

        // 토큰 생성 및 세션 연결
        const tokenResponse = await VideoAPI.generateToken(
          sessionResponse.sessionId
        );
        await session.connect(tokenResponse.token, { clientData: nickname });

        // 퍼블리셔 초기화
        const publisher = OV.initPublisher(publisherRef.current, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });

        publisherObjRef.current = publisher;

        publisher.on("videoElementCreated", (event) => {
          event.element.classList.add("w-full", "h-full", "object-cover");
        });

        publisher.on("streamPropertyChanged", (event) => {
          if (event.changedProperty === "videoActive") {
            const videoElements =
              publisherRef.current?.getElementsByTagName("video");
            if (videoElements?.length > 0) {
              videoElements[0].style.display = event.newValue
                ? "block"
                : "none";
            }
          }
        });

        await session.publish(publisher);
        if (isComponentMounted) {
          setPublisher(publisher);
        }
      } catch (error) {
        console.error("비디오 초기화 중 오류:", error);
        if (isComponentMounted) {
          setError("비디오 연결에 실패했습니다.");
        }
      }
    };

    const cleanupSession = async () => {
      try {
        // 구독자 정리
        subscribers.forEach((subscriber) => {
          if (subscriber.stream) {
            try {
              subscriber.stream.disposeWebRtcPeer();
              subscriber.stream.disposeMediaStream();
            } catch (err) {
              console.warn("구독자 정리 중 오류:", err);
            }
          }
        });

        // 퍼블리셔 정리
        if (publisherObjRef.current) {
          try {
            if (sessionRef.current) {
              await sessionRef.current.unpublish(publisherObjRef.current);
            }
            publisherObjRef.current.off("videoElementCreated");
            publisherObjRef.current.off("streamPropertyChanged");
            if (publisherObjRef.current.stream) {
              publisherObjRef.current.stream.disposeWebRtcPeer();
              publisherObjRef.current.stream.disposeMediaStream();
            }
          } catch (err) {
            console.warn("퍼블리셔 정리 중 오류:", err);
          }
        }

        // 세션 정리
        if (sessionRef.current) {
          try {
            await sessionRef.current.disconnect();
            sessionRef.current = null;
          } catch (err) {
            console.warn("세션 연결 해제 중 오류:", err);
          }
        }

        setSubscribers([]);
        setPublisher(null);
        setSession(null);
      } catch (error) {
        console.error("정리 중 오류:", error);
      }
    };

    initializeSession();

    return () => {
      isComponentMounted = false;
      cleanupSession();
    };
  }, [nickname, subscribers]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-gray-400 text-lg">카메라 OFF</div>
        </div>
      )}

      <div ref={publisherRef} className="absolute inset-0" />
      <div ref={videoContainerRef} className="absolute inset-0" />

      {isCurrentUser && (
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

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
