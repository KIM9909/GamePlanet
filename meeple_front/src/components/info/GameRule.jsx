import axios from 'axios';
import { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';

const GameRule = () => {

  const params= useParams();

  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get(`https://boardjjigae.duckdns.org/api/game-info/${params.gameId}`)
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, [params]);

  return (
    
    <div>
      <h1>규칙</h1>
      <p>
        {data.gameRule}
      </p>
    </div>
  )
};

export default GameRule;

