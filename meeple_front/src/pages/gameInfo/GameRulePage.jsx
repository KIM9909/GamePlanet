import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GameInfoAPI from '../../sources/api/GameInfoAPI';

const GameRulePage = () => {
  const { gameInfoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameRule = async () => {
      try {
        setLoading(true);
        const gameData = await GameInfoAPI.getGameInfo(gameInfoId);
        setData(gameData);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameRule();
  }, [gameInfoId]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div className="min-h-screen relative overflow-hidden">
    <div className="min-h-screen p-8 relative z-5">
      <div className="max-w-7xl mx-auto h-full">
        <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-indigo-500/30">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {data.game.gameName} 규칙
          </h1>
          <p className='text-white'>
            {data.gameRule}
          </p>
          
        </div>
      </div>
    </div>
    </div>
  );
};

export default GameRulePage;
