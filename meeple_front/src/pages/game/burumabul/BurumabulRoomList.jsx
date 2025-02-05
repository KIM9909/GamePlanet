import React from "react";
import BurumabulListCard from "../../../components/game/burumabul/BurumabulListCard";

const BurumabulRoomList = () => {
  const roomInfo = null;
  return (
    <div>
      <h1 className="text-white text-2xl text-center mt-5">
        부루마불 게임 목록
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <BurumabulListCard roomInfo={roomInfo} />
      </div>
    </div>
  );
};

export default BurumabulRoomList;
