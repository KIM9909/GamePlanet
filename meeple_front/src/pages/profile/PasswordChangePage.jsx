import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword } from "../../sources/api/store/slices/ProfileSlice";
import { Eye, EyeOff } from "lucide-react";

const PasswordChangePage = ({ userId, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.profile);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // password: 영문, 숫자, 특수문자 포함 9-16자
  const REGEX = {
    password:
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{9,16}$/,
  };

  const [validations, setValidations] = useState({
    validNewPassword: true,
    passwordMatch: true,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [formError, setFormError] = useState("");

  // 입력값 변경 시 유효성 검사사
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 새 비밀번호 입력 시 유효성 검사사
    if (name === "newPassword") {
      setValidations((prev) => ({
        ...prev,
        validNewPassword: REGEX.password.test(value),
        passwordMatch: value === formData.confirmNewPassword,
      }));
    }

    // 비밀번호 확인 입력 시 일치 여부 검사사
    if (name === "confirmNewPassword") {
      setValidations((prev) => ({
        ...prev,
        passwordMatch: value === formData.newPassword,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!REGEX.password.test(formData.newPassword)) {
      setFormData(
        "새 비밀번호는 영문, 숫자, 특수문자를 포함한 9-16자여야 합니다."
      );
    }

    // 새 비밀번호 확인
    if (formData.newPassword !== formData.confirmNewPassword) {
      setFormError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await dispatch(
        updatePassword({
          userId,
          data: formData,
        })
      ).unwrap();

      onClose();
      alert("비밀번호가 성공적으로 변경되었습니다.");
    } catch (error) {
      setFormError(error.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">비밀번호 변경</h2>

        {(formError || error) && (
          <p className="text-red-500 mb-4">{formError || error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              현재 비밀번호
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                placeholder="현재 비밀번호를 입력해주세요"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              새 비밀번호
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  formData.newPassword && !validations.validNewPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                placeholder="영문, 숫자, 특수문자 포함 9-16자"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.newPassword && !validations.validNewPassword && (
              <p className="text-sm text-red-500 mt-1">
                비밀번호는 영문, 숫자, 특수문자를 포함한 9-16자여야 합니다.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              새 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmNewPassword ? "text" : "password"}
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${
                  formData.newPassword && !validations.validNewPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                required
                placeholder="새 비밀번호를 한번 더 입력해주세요"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmNewPassword(!showConfirmNewPassword)
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmNewPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
            {formData.confirmNewPassword && !validations.passwordMatch && (
              <p className="text-sm text-red-500 mt-1">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={
                isLoading ||
                !validations.validNewPassword ||
                !validations.passwordMatch
              }
            >
              {isLoading ? "변경 중..." : "변경하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangePage;
