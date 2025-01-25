import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserAPI } from "../../sources/api/UserAPI";

const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await UserAPI.getProfile(userId);
        setProfile(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProfile();
  }, [userId]);

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {profile.userNickname}님의 프로필
      </h1>
      <div>
        <p>이름: {profile.userName}</p>
        <p>이메일: {profile.userEmail}</p>
        <p>생년월일: {profile.userBirthday.slice(0, 10)}</p>
        <p>비밀번호: {profile.userPassword}</p>
        <p>레벨: {profile.userLevel}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
