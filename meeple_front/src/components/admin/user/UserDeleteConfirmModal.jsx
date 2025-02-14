// components/modal/UserDeleteConfirmModal.jsx
import React from 'react';
import { UserX } from 'lucide-react';

const UserDeleteConfirmModal = ({ isOpen, onClose, onConfirm, userNickname }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-[400px] transform transition-all">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserX className="text-slate-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">회원 삭제</h3>
          <p className="text-gray-400">
            <span className="font-semibold text-white">{userNickname}</span> 회원을<br />
            정말 삭제하시겠습니까?
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteConfirmModal;