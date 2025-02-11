import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const BackGroundMusic = () => {
  const audioRef = useRef(null);
  const location = useLocation();

  // BGM을 활성화할 페이지 경로 목록
  const enabledPages = [
    "/home",
    "/catch-mind",
    "/game/burumabul/start",
    "/test/cockroach",
    "/profile",
    "/game-info",
    "/burumabul",
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.loop = true;
    }
  });

  // 페이지 변경 시 BGM 상태 관리
  useEffect(() => {
    // catch-mind는 정확한 경로 매칭, 나머지는 startsWith 사용
    const shouldPlay = enabledPages.some((page) => {
      if (page === "/catch-mind") {
        return location.pathname === page;
      }
      return location.pathname.startsWith(page);
    });

    if (audioRef.current) {
      if (shouldPlay) {
        audioRef.current
          .play()
          .catch((e) => console.log("자동 재생이 차단되었습니다."));
      } else {
        audioRef.current.pause();
      }
    }
  }, [location]);

  // enabledPages에 포함된 페이지에서만 컴포넌트를 렌더링
  const isEnabledPage = enabledPages.some((page) => {
    if (page === "/catch-mind") {
      return location.pathname === page;
    }
    return location.pathname.startsWith(page);
  });

  if (!isEnabledPage) {
    return null;
  }

  return <audio ref={audioRef} src="../src/assets/bgm/MainBGM.mp3" autoPlay />;
};

export default BackGroundMusic;
