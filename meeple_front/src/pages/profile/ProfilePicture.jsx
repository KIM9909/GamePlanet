import React, { useState } from "react";
import { Camera } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';

const ProfilePicture = ({ initialImageUrl, onSave, defaultImageUrl }) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      // userProfilePicture로 키 이름 변경
      formDataToSend.append("userProfilePicture", file);

      const userInfo = {};
      const userInfoBlob = new Blob([JSON.stringify(userInfo)], {
        type: "application/json",
      });
      formDataToSend.append("userInfo", userInfoBlob);

      await onSave(formDataToSend);
    } catch (error) {
      console.error("프로필 이미지 업데이트 실패:", error);
      toast.error("프로필 이미지 업데이트에 실패했습니다.");
    }
  };

  return (
    <div
      className="relative w-36 h-36"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="w-full h-full bg-white rounded-full overflow-hidden border-4 border-cyan-500 shadow-xl">
        <img
          src={initialImageUrl || defaultImageUrl}
          alt="프로필"
          className="w-full h-full object-cover"
        />
      </div>

      {/* 호버 시 나타나는 카메라 아이콘과 파일 입력 */}
      {isHovering && (
        <label
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer group"
          htmlFor="profile-picture-input"
        >
          <Camera className="w-8 h-8 text-white opacity-75 group-hover:opacity-100 transition-opacity" />
        </label>
      )}
      <input
        type="file"
        id="profile-picture-input"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default ProfilePicture;
