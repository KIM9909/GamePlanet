import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser,
  setDeleteModalOpen,
  resetDeleteSuccess,
} from "../../sources/api/store/slices/ProfileSlice";
import { logout } from "../../sources/api/store/slices/UserSlice";
import { Eye, EyeOff } from "lucide-react";

const UserDeletePage = ({ userId, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, deleteSuccess } = useSelector(
    (state) => state.profile
  );

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleDeleteRequest = (e) => {
    e.preventDefault();
    if (!password) {
      return;
    }
    setShowConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await dispatch(
        deleteUser({ userId, password })
      ).unwrap();

      if (response) {
        dispatch(logout());
        localStorage.removeItem("token");

        setShowConfirmModal(false);
        onClose();

        navigate("/");
        alert("회원 탈퇴가 완료되었습니다.");
      }
    } catch (error) {
      // console.log("회원 탈퇴 실패 : ", error);
      alert(error.message || "회원 탈퇴에 실패했습니다.");
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">회원 탈퇴</h2>

        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <h3 className="text-lg font-semibold text-red-700 mb-2">
            회원 탈퇴 전 꼭 확인해주세요!
          </h3>
          <ul className="text-red-600 list-disc list-inside space-y-2">
            <li>탈퇴 후에는 계정을 복구할 수 없습니다.</li>
            <li>작성한 게시글과 댓글은 삭제되지 않습니다.</li>
            <li>동일한 이메일로 재가입이 불가능합니다.</li>
          </ul>
        </div>

        <form onSubmit={handleDeleteRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded"
                placeholder="현재 비밀번호를 입력해주세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={isLoading || !password}
            >
              회원 탈퇴
            </button>
          </div>
        </form>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold mb-4">정말 탈퇴하시겠습니까?</h3>
              <p className="text-gray-600 mb-6">
                탈퇴 후에는 계정을 복구할 수 없으며, 동일한 이메일로 재가입이
                불가능합니다.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  disabled={isLoading}
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? "처리중..." : "탈퇴하기"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDeletePage;
