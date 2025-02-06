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
  const [isInitializing, setIsInitializing] = useState(false);

  const currentUser = useSelector((state) => state.profile.profileData);
  const isCurrentUser = currentUser?.userNickname === nickname;

  const videoContainerRef = useRef(null);
  const publisherRef = useRef(null);
  const sessionRef = useRef(null);
  const publisherObjRef = useRef(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  const toggleMic = () => {
    if (publisher && isCurrentUser) {
      const newMicState = !isMicOn;
      publisher.publishAudio(newMicState);
      setIsMicOn(newMicState);
    }
  };

  const toggleCamera = async () => {
    if (!publisher || !isCurrentUser || !session) return;

    const newCameraState = !isCameraOn;

    try {
      publisher.publishVideo(newCameraState);

      const signalData = {
        nickname: nickname,
        enabled: newCameraState,
        connectionId: session.connection.connectionId,
      };

      await session.signal({
        type: "camera-state-change",
        data: JSON.stringify(signalData),
      });

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

  const cleanupSession = async () => {
    try {
      console.log("세션 정리 시작...");

      if (subscribers.length > 0) {
        console.log("구독자 정리 중...");
        subscribers.forEach((subscriber) => {
          if (subscriber.stream) {
            try {
              subscriber.stream.disposeWebRtcPeer();
              subscriber.stream.disposeMediaStream();
            } catch (err) {
              console.warn("구독자 정리 중 무시할 수 있는 오류:", err);
            }
          }
        });
      }

      if (publisherObjRef.current) {
        try {
          console.log("퍼블리셔 정리 중...");

          // 먼저 스트림 상태 확인
          const isStreaming =
            publisherObjRef.current.stream &&
            publisherObjRef.current.stream.getMediaStream() &&
            publisherObjRef.current.stream.getMediaStream().active;

          // 스트림이 활성 상태일 때만 트랙 중지
          if (isStreaming) {
            publisherObjRef.current.stream
              .getMediaStream()
              .getTracks()
              .forEach((track) => {
                track.stop();
              });
          }

          // 이벤트 리스너 제거
          publisherObjRef.current.off("videoElementCreated");
          publisherObjRef.current.off("streamPropertyChanged");

          // 세션이 존재하고 스트림이 활성 상태일 때만 unpublish 시도
          if (sessionRef.current && isStreaming) {
            try {
              await sessionRef.current.unpublish(publisherObjRef.current);
            } catch (unpublishError) {
              if (unpublishError.code !== 105) {
                // 105가 아닌 에러만 로깅
                console.warn("퍼블리셔 언퍼블리시 중 오류:", unpublishError);
              }
            }
          }

          // 스트림 정리 (isStreaming 체크 없이 수행)
          if (publisherObjRef.current.stream) {
            try {
              publisherObjRef.current.stream.disposeWebRtcPeer();
              publisherObjRef.current.stream.disposeMediaStream();
            } catch (streamError) {
              console.warn("스트림 정리 중 무시할 수 있는 오류:", streamError);
            }
          }
        } catch (err) {
          console.warn("퍼블리셔 정리 중 무시할 수 있는 오류:", err);
        }
      }

      if (sessionRef.current) {
        try {
          console.log("세션 연결 해제 중...");
          await sessionRef.current.disconnect();
        } catch (err) {
          console.warn("세션 연결 해제 중 무시할 수 있는 오류:", err);
        }
        sessionRef.current = null;
      }

      setSubscribers([]);
      setPublisher(null);
      setSession(null);
      setIsInitializing(false);

      console.log("세션 정리 완료");
    } catch (error) {
      console.error("세션 정리 중 오류:", error);
    }
  };

  useEffect(() => {
    let isComponentMounted = true;

    const initializeSession = async () => {
      if (isInitializing || retryCountRef.current >= 3) return;

      try {
        setIsInitializing(true);
        setError(null);

        if (sessionRef.current) {
          await cleanupSession();
        }

        const OV = new OpenVidu();
        const sessionResponse = await VideoAPI.createSession();
        const session = OV.initSession();
        sessionRef.current = session;

        if (!isComponentMounted) return;
        setSession(session);

        // streamCreated 이벤트 핸들러 수정
        session.on("streamCreated", (event) => {
          if (!isComponentMounted) return;

          const streamNickname = JSON.parse(
            event.stream.connection.data
          ).clientData;

          // 현재 사용자의 스트림은 구독하지 않음
          if (streamNickname === nickname) {
            return;
          }

          // 새로운 div 엘리먼트를 생성하여 subscriber를 위한 컨테이너로 사용
          const subscriberContainer = document.createElement("div");
          subscriberContainer.className = "absolute inset-0";
          subscriberContainer.id = `subscriber-${event.stream.streamId}`;

          const subscriber = session.subscribe(
            event.stream,
            subscriberContainer
          );

          subscriber.on("videoElementCreated", (e) => {
            e.element.classList.add("w-full", "h-full", "object-cover");
          });

          // subscribers 배열에 추가하기 전에 컨테이너를 DOM에 추가
          if (publisherRef.current?.parentElement) {
            publisherRef.current.parentElement.appendChild(subscriberContainer);
          }

          setSubscribers((prev) => [
            ...prev,
            {
              stream: subscriber,
              nickname: streamNickname,
              containerId: subscriberContainer.id,
            },
          ]);
        });

        // streamDestroyed 이벤트 핸들러 수정
        session.on("streamDestroyed", (event) => {
          if (isComponentMounted) {
            // DOM에서 subscriber 컨테이너 제거
            const containerId = `subscriber-${event.stream.streamId}`;
            const container = document.getElementById(containerId);
            if (container) {
              container.remove();
            }

            setSubscribers((prev) =>
              prev.filter(
                (sub) => sub.stream.stream.streamId !== event.stream.streamId
              )
            );
          }
        });

        session.on("exception", (error) => {
          console.warn("세션 예외 발생:", error);
        });

        const tokenResponse = await VideoAPI.generateToken(
          sessionResponse.sessionId
        );
        // 연결 시 닉네임 정보 포함
        await session.connect(tokenResponse.token, { clientData: nickname });

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
          retryCountRef.current = 0;
        }
      } catch (error) {
        console.error("비디오 초기화 중 오류:", error);
        if (isComponentMounted) {
          setError("비디오 연결에 실패했습니다.");
          retryCountRef.current += 1;

          if (retryCountRef.current < 3) {
            retryTimeoutRef.current = setTimeout(() => {
              setIsInitializing(false);
              initializeSession();
            }, 2000);
          }
        }
      } finally {
        if (isComponentMounted) {
          setIsInitializing(false);
        }
      }
    };

    if (nickname) {
      initializeSession();
    }

    return () => {
      isComponentMounted = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      cleanupSession();
    };
  }, [nickname]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="text-gray-400 text-lg">카메라 OFF</div>
        </div>
      )}

      {/* Publisher 컨테이너 */}
      {isCurrentUser && <div ref={publisherRef} className="absolute inset-0" />}

      {/* 컨트롤 버튼 */}
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
