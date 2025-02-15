import React from "react";

const RequestingFriend = ({ requestingList }) => {
  console.log(requestingList);

  return (
    <div className="h-full flex flex-col items-center justify-start w-full overflow-y-auto">
      {requestingList && requestingList.length > 0 ? (
        <ul className="space-y-2 w-full">
          {requestingList.map((list, index) => (
            <li
              key={index}
              className="p-4 bg-gray-800 rounded-lg flex items-center justify-between border border-cyan-500/30 hover:border-cyan-400/60 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
            >
              <p className="font-medium text-cyan-400">
                {list.user.userNickname}
              </p>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300"
                  onClick={() => handleCancel(list.friendId)}
                >
                  요청 취소
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>보낸 친구 요청이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default RequestingFriend;
