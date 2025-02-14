import React, { useState, useRef, useEffect } from "react";
import { CircleX } from "lucide-react";

const NotificationList = ({ notiList, setNotiList }) => {
  const deleteNotifi = (indexToDelete) => {
    console.log("삭제 시도:", indexToDelete);
    setNotiList((prevList) => {
      console.log("삭제 전 목록:", prevList);
      const newList = prevList.filter((_, index) => index !== indexToDelete);
      console.log("삭제 후 목록:", newList);
      return newList;
    });
  };

  useEffect(() => {
    console.log("업데이트된 알림 목록:", notiList);
  }, [notiList]);

  return (
    <div className="absolute top-16 right-16 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="absolute -top-1 right-20 w-4 h-4 bg-white transform rotate-45" />
      <div className=" relative bg-white h-32 overflow-y-auto">
        {notiList.length > 0 ? (
          notiList.map((notification, index) => (
            <div
              key={index}
              className="flex justify-between p-4 border-b hover:bg-yellow-300"
            >
              <div className="text-gray-800 text-sm">{notification}</div>
              <button
                onClick={() => deleteNotifi(index)}
                aria-label="알림 삭제"
              >
                <CircleX
                  size={28}
                  color="#7a7a7a"
                  strokeWidth={2.5}
                  className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                />
              </button>
            </div>
          ))
        ) : (
          <div className="p-4 text-gray-500 text-sm text-center">
            새로운 알람이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
