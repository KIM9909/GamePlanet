// components/modal/DeleteConfirmModal.jsx
import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ 
  onClose, 
  onConfirm, 
  title = "삭제", // 기본값 설정
  message, // 삭제할 항목 메시지
  targetName, // 삭제할 대상의 이름
  confirmButtonText = "삭제", // 기본값 설정
  cancelButtonText = "취소" // 기본값 설정
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-[400px] transform transition-all">
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Trash2 className="text-slate-500" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-400">
            {targetName && <span className="font-semibold text-white">{targetName}</span>}
            {message && <><br />{message}</>}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-slate-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;