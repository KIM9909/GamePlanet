import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GameInfoAPI from "../../sources/api/GameInfoAPI";
import { Star } from "lucide-react";

const GameInfoPage = () => {
  const { gameInfoId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGameInfo = async () => {
      try {
        setLoading(true);
        const gameData = await GameInfoAPI.getGameInfo(gameInfoId);
        console.log("게임 데이터 : ", gameData);
        setData(gameData);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameInfo();
  }, [gameInfoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0a2a]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-75" />
          <div className="w-4 h-4 bg-white rounded-full animate-pulse delay-150" />
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-[#0a0a2a]">
        에러가 발생했습니다.
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0a2a]">
        데이터가 없습니다.
      </div>
    );

  const formatContent = (content) => {
    if (!content) return "";
    return content.split("\\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="min-h-screen p-8 bg-[#0a0a2a]/50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 max-h-[650px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left side - Image */}
            <div className="relative group">
              <div className="h-96 overflow-hidden rounded-xl border border-cyan-500/60 transition-all duration-300">
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                  <img src={data.game.gameInfoFile} alt="게임 사진" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-500/20 opacity-0 transition-opacity duration-300" />
              </div>
            </div>

            {/* Right side - Game Info */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 text-yellow-400" />
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">
                  {data.game.gameName}
                </h1>
              </div>
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-300 leading-relaxed text-lg">
                  {formatContent(data.gameInfoContent)}
                </div>
              </div>
            </div>
          </div>

          {/* Game Rules Section */}
          <div className="border-t border-cyan-500/30 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">
                게임 규칙
              </h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-300 leading-relaxed text-lg">
                {formatContent(data.gameRule)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfoPage;
