import React, { useEffect } from "react";
import { LogOut, X } from "lucide-react";

const ExitConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isOpen) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePopState = (e) => {
      if (isOpen) {
        e.preventDefault();
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push initial state to prevent immediate back
    window.history.pushState(null, "", window.location.pathname);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              방을 나가시겠습니까?
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-400 mb-6">
            게임이 진행 중입니다. 정말로 나가시겠습니까?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              나가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;
