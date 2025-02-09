import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import GameInfoAPI from '../../sources/api/GameInfoAPI';

const GameInfoPage = () => {
  const { gameId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        setLoading(true);
        const gameData = await GameInfoAPI.getGameInfo(gameId);
        setData(gameData);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameInfo();
  }, [gameId]);

  if (loading) return <div>로딩중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <section className="mb-6">
        <h1 className="text-2xl font-bold">{data.game.gameName}</h1>
      </section>
      <section className="prose prose-lg">
        <div className="whitespace-pre-wrap">
          {data.gameInfoContent}
        </div>
      </section>
    </div>
  );
};

export default GameInfoPage;
