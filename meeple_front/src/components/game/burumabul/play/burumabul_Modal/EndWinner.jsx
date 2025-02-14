import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from "../../../../layout/SocketLayout";

const EndWinner = ({ onClose }) => {
  const { socketWinner } = useContext(SocketContext);
  const [winner, setWinner] = useState(socketWinner);

  useEffect(() => {
    if (socketWinner) {
      setWinner(socketWinner);
    }
  }, [socketWinner]);

  return (
    <div>
      <h1>{winner}</h1>
      <div>승자입니다.</div>
      <p>대기방으로 이동합니다.</p>
      <button onClick={onClose}>확인</button>
    </div>
  );
};

export default EndWinner;
