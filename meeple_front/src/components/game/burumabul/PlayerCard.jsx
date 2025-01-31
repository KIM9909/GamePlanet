import React from "react";
import virgo from "../../../assets/burumabul_images/virgo.png";

const PlayerCard = (playerInfo) => {
  //  백엔드 연결 필요
  return (
    <div className="w-64 h-36 bg-white rounded-lg flex flex-row justify-center items-center">
      <div className="mx-3">
        <img
          src={virgo}
          alt="플레이어 이미지"
          className="max-w-16 max-h-16 w-16 h-16 rounded-full "
        />
      </div>
      <div className="mx-3 flex flex-col justify-center items-center">
        <p className="my-1">플레이어 이름</p>
        <p className="my-1">플레이어 실적</p>
        <button className="bg-blue-300 rounded my-1 px-2 text-slate-500">
          친구 추가
        </button>
        {/* <button className="bg-pink-300 rounded my-1 px-2 text-slate-500">
          친구 중
        </button> */}
      </div>
    </div>
  );
};

export default PlayerCard;
