import React, { useEffect, useRef, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import { VideoAPI } from "../../../sources/api/CatchMindAPI";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";

/**
 * OpenVidu를 이용한 비디오 채팅 컴포넌트
 * 비디오/오디오 스트림 처리 및 제어 기능 제공
 */
const VideoChat = ({ userId }) => {
  // OpenVidu 세션 및 게시자 상태 관리
  const [session, setSession] = useState(null);
  const [publisher, setPublisher] = useState(null);
  // 마이크/카메라 상태 관리
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState(null);
  // 비디오 요소를 위한 참조
  const parentRef = useRef(null);

  /**
   * 마이크 켜기/끄기 토글 함수
   */
  const toggleMic = () => {
    if (publisher) {
      const newMicState = !isMicOn;
      publisher.publishAudio(newMicState);
      setIsMicOn(newMicState);
    }
  };

  /**
   * 카메라 켜기/끄기 토글 함수
   */
  const toggleCamera = () => {
    if (publisher) {
      const newCameraState = !isCameraOn;
      publisher.publishVideo(newCameraState);
      setIsCameraOn(newCameraState);
    }
  };

  // OpenVidu 세션 초기화 및 연결 설정
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // OpenVidu 객체 생성 및 세션 초기화
        const OV = new OpenVidu();
        const sessionResponse = await VideoAPI.createSession();
        const session = OV.initSession();
        setSession(session);

        // 세션 토큰 생성
        const tokenResponse = await VideoAPI.generateToken(
          sessionResponse.sessionId
        );

        // 스트림 생성 이벤트 핸들러
        session.on("streamCreated", (event) => {
          // 기존 비디오 요소 정리
          if (parentRef.current) {
            const existingVideos =
              parentRef.current.getElementsByTagName("video");
            while (existingVideos.length > 0) {
              parentRef.current.removeChild(existingVideos[0]);
            }
          }

          // 새 스트림 구독
          const subscriber = session.subscribe(
            event.stream,
            parentRef.current,
            {
              insertMode: "APPEND",
            }
          );
        });

        // 세션 연결 및 게시자 설정
        await session.connect(tokenResponse.token, { clientData: userId });

        // 게시자 옵션 설정
        const publisherOptions = {
          audioSource: undefined, // 기본 마이크
          videoSource: undefined, // 기본 카메라
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        };

        // 게시자 초기화
        const publisher = OV.initPublisher(
          parentRef.current,
          publisherOptions,
          (error) => {
            if (error) {
              setError(error.message);
            }
          }
        );

        await session.publish(publisher);
        setPublisher(publisher);
      } catch (error) {
        setError(error.message || "비디오 초기화 중 오류 발생");
      }
    };

    initializeSession();

    // 컴포넌트 언마운트 시 세션 정리
    return () => {
      if (session) {
        session.disconnect();
      }
    };
  }, [userId]);

  return (
    <div ref={parentRef} className="relative">
      {/* 비디오 컨트롤 버튼 */}
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
    </div>
  );
};

export default VideoChat;
