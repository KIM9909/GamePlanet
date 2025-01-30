import React from "react";

const PlayerVideo = ({ playerInfo }) => {
  return (
    <div className="bg-white rounded-md w-full p-2 flex flex-col ">
      <div className="bg-black w-full h-24 sm:h-20 md:h-24 text-white flex items-center justify-center">
        화상 영역
      </div>
      <div className="flex justify-between">
        <p>이름</p>
        <p>잔액</p>
      </div>
    </div>
  );
};

export default PlayerVideo;
