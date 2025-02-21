// GameToast.jsx
import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BurumabulToast = ({ closeToast, title, message }) => {
  return (
    <div className="flex flex-col items-center bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-lg shadow-2xl border-2 border-cyan-500/60 relative">
      {/* 닫기 버튼 */}
      <button
        onClick={closeToast}
        className="absolute top-2 right-2 text-cyan-400 hover:text-cyan-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
      >
        ✕
      </button>

      <div className="mb-4 text-xl text-cyan-300">
        <div className="flex items-center gap-2">
          <span className="animate-pulse">⚠️</span>
          <span>{title}</span>
        </div>
      </div>
      <p className="flex flex-col mb-4 text-gray-300 text-center">{message}</p>
    </div>
  );
};

// 토스트 표시 함수들
export const showGameToast = (title, message) => {
  return toast(
    ({ closeToast }) => (
      <BurumabulToast closeToast={closeToast} title={title} message={message} />
    ),
    {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      className: "!bg-transparent !p-0 !shadow-none",
      toastClassName: "!bg-transparent !p-0",
      bodyClassName: "!p-0 !m-0",
      closeButton: false,
      style: {
        background: "transparent",
        padding: 0,
        marginTop: "4rem",
      },
    }
  );
};

export default BurumabulToast;
