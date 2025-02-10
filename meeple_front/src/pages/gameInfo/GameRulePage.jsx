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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">규칙</h1>
      <div className="prose prose-lg">
        {data.gameRule}
      </div>
    </div>
  );
};

export default GameRulePage;
