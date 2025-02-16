import React, { useState, useRef, useCallback, useEffect } from "react";
import virgo from "../../../../assets/burumabul_images/virgo.png";
import { sendFriendRequest } from "../../../../sources/api/FriendApi";
import { useSelector } from "react-redux";
import ProfileModal from "../../../user/ProfileModal";
import ReportFormModal from "../../../user/ReportFormModal";
import UserAPI from "../../../../sources/api/UserAPI";

const PlayerCard = ({ playerInfo, onClick }) => {
  const userId = Number(useSelector((state) => state.user.userId));
  const playerId = Number(playerInfo?.playerId);
  const { getProfile } = UserAPI;
  const [userNickName, setUserNickName] = useState(null);

  // 유저 프로필 조회
  useEffect(() => {
    const getUserInfo = async () => {
      if (playerId) {
        try {
          const response = await getProfile(String(playerId));
          console.log("프로필 응답:", response);
          setUserNickName(response.userNickname);
        } catch (error) {
          console.log("유저 조회 중 오류:", error);
        }
      }
    };

    getUserInfo();
  }, [playerId, userId]);

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
    // 기존 submit 로직
    setShowReportForm(false);
  };

  return (
    <div className="w-36 h-48 flex-shrink-0 bg-white bg-opacity-70 rounded-lg flex flex-col items-center justify-center">
      <div className="mb-3">
        <img
          src={virgo}
          alt="플레이어 이미지"
          className="w-16 h-16 rounded-full cursor-pointer"
          ref={buttonRef}
          onClick={
            userId !== playerId ? () => setIsModalOpen((prev) => !prev) : null
          }
        />
      </div>
      <div className="text-center">
        <p className="font-medium truncate w-28">{userNickName}</p>
      </div>

      {isModalOpen && (
        <ProfileModal
          onClose={() => setIsModalOpen(false)}
          userNickname={userNickName}
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
};

export default PlayerCard;
