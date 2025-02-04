import axios from 'axios';
import { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';









const GameInfo = () => {


  const params= useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`https://boardjjigae.duckdns.org/api/game-info/${params.gameId}`)
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, [params]);

  return (
    <div>
      {/* 게임이름 */}
      <section>{data.game.gameName}</section>
      {/* 게임정보 */}
      <section>{data.gameInfoContent}</section>
    </div>
  )
};

export default GameInfo;