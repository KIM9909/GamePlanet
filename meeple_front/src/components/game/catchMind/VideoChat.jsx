import React, { useEffect, useRef, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import { VideoAPI } from "../../../sources/api/CatchMindAPI";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

/**
 * VideoChat 컴포넌트
 * OpenVidu를 사용한 실시간 화상 채팅 기능을 제공
 *
 * @param {Object} props
 * @param {string} props.userId - 현재 유저의 ID
 */
const VideoChat = ({ userId }) => {
  // 상태 관리
  const [session, setSession] = useState(null); // OpenVidu 세션
  const [publisher, setPublisher] = useState(null); // 비디오 스트림 게시자
  const [isMicOn, setIsMicOn] = useState(true); // 마이크 상태
  const [isCameraOn, setIsCameraOn] = useState(true); // 카메라 상태
  const [error, setError] = useState(null); // 에러 상태

  // DOM 요소 참조
  const videoContainerRef = useRef(null); // 비디오 컨테이너
  const publisherRef = useRef(null); // 게시자 컨테이너

  /**
   * 마이크 켜기/끄기 토글
   */
  const toggleMic = () => {
    if (publisher) {
      const newMicState = !isMicOn;
      publisher.publishAudio(newMicState);
      setIsMicOn(newMicState);
    }
  };

  /**
   * 카메라 켜기/끄기 토글
   */
  const toggleCamera = () => {
    if (publisher) {
      const newCameraState = !isCameraOn;
      publisher.publishVideo(newCameraState);
      setIsCameraOn(newCameraState);
    }
  };

  // OpenVidu 세션 초기화 및 연결
  useEffect(() => {
    let currentSession = null;
    let currentPublisher = null;

    /**
     * OpenVidu 세션을 초기화하고 연결하는 함수
     */
    const initializeSession = async () => {
      try {
        // OpenVidu 객체 생성 및 세션 초기화
        const OV = new OpenVidu();
        const sessionResponse = await VideoAPI.createSession();
        currentSession = OV.initSession();
        setSession(currentSession);

        // 스트림 생성 이벤트 핸들러 설정
        currentSession.on("streamCreated", (event) => {
          const subscriber = currentSession.subscribe(
            event.stream,
            videoContainerRef.current
          );
          // 비디오 요소 스타일 설정
          subscriber.on("videoElementCreated", (event) => {
            event.element.classList.add("w-full", "h-full", "object-cover");
          });
        });

        // 세션 토큰 생성 및 연결
        const tokenResponse = await VideoAPI.generateToken(
          sessionResponse.sessionId
        );
        await currentSession.connect(tokenResponse.token, {
          clientData: userId,
        });

        // 게시자 옵션 설정
        const publisherOptions = {
          audioSource: undefined, // 기본 오디오 소스 사용
          videoSource: undefined, // 기본 비디오 소스 사용
          publishAudio: true, // 오디오 활성화
          publishVideo: true, // 비디오 활성화
          resolution: "640x480", // 해상도 설정
          frameRate: 30, // 프레임레이트 설정
          insertMode: "APPEND", // 삽입 모드
          mirror: false, // 미러링 비활성화
        };

        // 게시자 초기화
        currentPublisher = OV.initPublisher(
          publisherRef.current,
          publisherOptions
        );

        // 게시자 비디오 요소 스타일 설정
        currentPublisher.on("videoElementCreated", (event) => {
          event.element.classList.add("w-full", "h-full", "object-cover");
        });

        // 세션에 게시자 연결
        await currentSession.publish(currentPublisher);
        setPublisher(currentPublisher);
      } catch (error) {
        console.error("비디오 초기화 중 오류:", error);
        setError("비디오 연결에 실패했습니다.");
      }
    };

    // 세션 초기화 실행
    initializeSession();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (currentPublisher) {
        try {
          if (currentSession) {
            currentSession.unpublish(currentPublisher);
          }
          currentPublisher.off("videoElementCreated");
          // OpenVidu 스트림 정리
          if (currentPublisher.stream) {
            currentPublisher.stream.disposeWebRtcPeer();
            currentPublisher.stream.disposeMediaStream();
          }
        } catch (error) {
          console.error("퍼블리셔 정리 중 오류:", error);
        }
      }

      if (currentSession) {
        try {
          currentSession.disconnect();
        } catch (error) {
          console.error("세션 연결 해제 중 오류:", error);
        }
      }
    };
  }, [userId]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* 비디오 컨테이너들 */}
      <div ref={publisherRef} className="absolute inset-0" />
      <div ref={videoContainerRef} className="absolute inset-0" />

      {/* 컨트롤 버튼들 */}
      <div className="absolute bottom-2 right-2 flex gap-2 z-10">
        {/* 마이크 토글 버튼 */}
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
        {/* 카메라 토글 버튼 */}
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

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
