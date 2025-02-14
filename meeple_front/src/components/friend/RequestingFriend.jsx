import React from "react";

const RequestingFriend = ({ requestingList }) => {
  console.log(requestingList);

  return (
    <div className="space-y-3">
      {requestingList && requestingList.length > 0 ? (
        <ul className="space-y-3">
          {requestingList.map((list, index) => (
            <li
              key={index}
              className="p-4 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-all duration-200"
            >
              <p className="font-medium text-gray-700">
                {list.friend.userNickname}
              </p>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                onClick={() => handleCancel(list.friendId)}
              >
                취소
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex justify-center items-center h-[30vh] text-gray-500">
          <p>보낸 친구 요청이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default RequestingFriend;
