import React, { useEffect } from "react";
import { CircleX } from "lucide-react";

const NotificationList = ({
  notiList,
  setNotificationList,
  setNotificationCount,
}) => {
  useEffect(() => {
    if (notiList.length > 0) {
      setTimeout(() => {
        setNotificationList([]); // 알림 목록 비우기
        setNotificationCount(0); // 카운트 초기화
      }, 3500); // 3.5초 후 초기화 (사용자가 확인할 시간 주기)
    }
  }, [notiList, setNotificationList, setNotificationCount]);
  return (
    <div className="absolute top-16 right-16 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <div className="absolute -top-1 right-20 w-4 h-4 bg-white transform rotate-45" />
      <div className="relative bg-white h-32 overflow-y-auto">
        {notiList?.length > 0 ? (
          notiList.map((notification, index) => (
            <div
              key={`noti-${index}-${notification}`}
              className="flex justify-between items-center p-4 border-b hover:bg-yellow-100 transition-colors duration-200"
            >
              <div className="text-gray-800 text-sm flex-grow pr-2">
                {notification}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-gray-500 text-sm text-center">
            새로운 알람이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;
