import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Plus, Trash2 } from 'lucide-react';
import { CustomAPI } from "../../../sources/api/CustomAPI"
import buruMabulImage from '../../../assets/images/games/MainImage/BuruMabul.png';
import CustomTutorial from './modal/TutorialModal';
import DeleteConfirmModal from './modal/DeleteConfirmModal';




const Custom = () => {
  const [deleteGame, setDeleteGame] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [customGames, setCustomGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const gameInfo = location.state?.gameInfo;

  useEffect(() => {
    const fetchCustomElements = async () => {
      try {
        setIsLoading(true);
        const response = await CustomAPI.getAllElements();
        
        // API 응답을 커스텀 게임 형식으로 변환
        const formattedGames = response.map(element => ({
          id: element.customId,
          title: element.customName,
          createdAt: new Date(element.createdAt).toLocaleDateString(),
          thumbnail: buruMabulImage
        }));
        
        setCustomGames(formattedGames);
      } catch (err) {
        console.error('커스텀 게임 로딩 실패:', err);
        setError('커스텀 게임을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomElements();
  }, []);

  const handleCreateCustomGame = async () => {
    try {
      // 새 게임 생성 후 editor로 이동
      const response = await CustomAPI.createElement({
        customName: "나만의 부루마불"
      });

      navigate(`/game-info/${gameInfo.gameInfoId}/custom/editor`, { 
        state: { 
          gameInfo,
          customId: response.customId 
        } 
      });
    } catch (err) {
      console.error('커스텀 게임 생성 실패:', err);
      setError('새 게임 생성에 실패했습니다.');
    }
  };

  const handleDeleteGame = async (e, game) => {
    e.stopPropagation();
    setDeleteGame(game);
  };

  const handleConfirmDelete = async () => {
    try {
      await CustomAPI.deleteElement(deleteGame.id);
      setCustomGames(prev => prev.filter(game => game.id !== deleteGame.id));
      setDeleteGame(null);
    } catch (err) {
      console.error('커스텀 게임 삭제 실패:', err);
      setError('게임 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-slate-900 opacity-90 flex items-center justify-center">
        <div className="text-cyan-400 text-xl">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-slate-900 opacity-90 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-slate-900 opacity-90">
      <div className="mb-12 text-center relative">
        <h1 className="text-5xl font-bold text-cyan-400 mb-4 tracking-wide">나만의 커스텀 게임</h1>
        <p className="text-gray-300 text-lg tracking-wider">당신만의 특별한 보드게임을 만들어보세요!</p>
        {customGames.length === 0 ? (
          <button 
            className="flex items-center gap-2 px-8 py-4 bg-purple-500 animate-pulse hover:bg-purple-600 text-white rounded-lg transition-colors mb-8 text-lg"
            onClick={() => setShowTutorial(true)}
          >
            <Gamepad2 size={24} />
            게임 제작 가이드
          </button>
        ) : (
          <button 
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors mb-8"
            onClick={() => setShowTutorial(true)}
          >
            <Gamepad2 size={20} />
            게임 제작 가이드
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customGames.map((game) => (
            <div 
              key={game.id}
              className="bg-slate-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform cursor-pointer relative group"
              onClick={() => navigate(`/game-info/${gameInfo.gameInfoId}/custom/detail/${game.id}`, {
                state: { 
                  gameInfo,
                  customGame: game 
                }
              })}
            >
              <img 
                src={game.thumbnail} 
                alt={game.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white mb-2">{game.title}</h3>
                <p className="text-gray-400">제작일: {game.createdAt}</p>
              </div>
                <button
                onClick={(e) => handleDeleteGame(e, game)}
                className="absolute bottom-4 right-4 p-2 bg-opacity-0 group-hover:bg-opacity-100 bg-slate-500 hover:bg-slate-600 text-white rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="게임 삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}



        <div 
          onClick={handleCreateCustomGame}
          className="bg-slate-800 rounded-lg overflow-hidden border-2 border-dashed border-cyan-500 flex items-center justify-center h-64 cursor-pointer hover:bg-slate-700 transition-colors"
        >
          <div className="text-center">
            <Plus size={40} className="text-cyan-500 mx-auto mb-2" />
            <p className="text-cyan-500 text-lg">새로운 게임 만들기</p>
          </div>
        </div>
      </div>

      {customGames.length === 0 && (
        <div className="text-center py-13">
          <Gamepad2 size={60} className="text-gray-500 mx-auto mb-4" />
          <h2 className="text-3xl font-semibold text-gray-300 mb-2">아직 제작한 게임이 없네요!</h2>
          <p className="text-gray-400 mb-4">당신만의 특별한 게임을 만들어보세요</p>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg w-11/12 max-w-6xl h-5/6 p-5">
            <CustomTutorial onClose={() => setShowTutorial(false)} />
          </div>
        </div>
        )}
      {deleteGame && (
      <DeleteConfirmModal
        gameName={deleteGame.title}
        onClose={() => setDeleteGame(null)}
        onConfirm={handleConfirmDelete}
      />
    )}
  </div>
);
}
export default Custom;