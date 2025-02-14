// CustomDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CustomAPI } from '../../../sources/api/CustomAPI';
import { Edit, ArrowLeft } from 'lucide-react';

const CustomDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tileImages, setTileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customData, setCustomData] = useState(null);

  const { gameInfo, customGame } = location.state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 타일 이미지 데이터 로드
        const imagesResponse = await CustomAPI.getTileImages(customGame.id);
        const tileImageMap = imagesResponse.reduce((acc, tile) => {
          acc[tile.tileNumber] = tile.tileImageUrl;
          return acc;
        }, {});
        setTileImages(tileImageMap);

        // 커스텀 게임 기본 정보 로드
        const customResponse = await CustomAPI.getElementById(customGame.id);
        setCustomData(customResponse);
      } catch (err) {
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customGame.id]);

  const getIndex = (position) => {
    if (position >= 0 && position <= 10) return 30 - position;
    else if (position >= 11 && position <= 19) return 20 + position;
    else if (position >= 20 && position <= 30) return position - 20;
    else return position - 20;
  };

  const getTileSize = (position) => {
    if ((position >= 0 && position <= 10) || (position >= 20 && position <= 30)) {
      return 'w-[90px] h-[125px]';
    } else {
      return 'w-[125px] h-[90px]';
    }
  };

  const renderTile = (position) => {
    const index = getIndex(position);
    const tileSize = getTileSize(position);
    const tileImage = tileImages[index];
    
    return (
      <div 
        key={position} 
        className={`
          ${tileSize} border border-slate-600
          ${tileImage ? 'bg-slate-800' : 'bg-slate-700/30'}
          group cursor-pointer relative
        `}
      >
        {tileImage ? (
          <div className="relative w-full h-full">
            <img 
              src={tileImage}
              alt={`타일 ${index}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 
                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-[300px] h-[300px] bg-slate-800 rounded-lg p-2 shadow-xl">
                <img 
                  src={tileImage}
                  alt={`타일 ${index} 확대`}
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            {index}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="text-cyan-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 p-8 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      {/* 헤더 섹션 */}
      <div className="max-w-[1200px] mx-auto mb-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/game-info/${gameInfo.gameInfoId}/custom`, {
              state: { gameInfo }
            })}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>목록으로</span>
          </button>
          <h1 className="text-3xl font-bold text-cyan-400 text-center">
            {customData?.customName || customGame.title}
          </h1>
          <button
            onClick={() => navigate(`/game-info/${gameInfo.gameInfoId}/custom/editor`, {
              state: { 
                gameInfo,
                customId: customGame.id,
                isNew: false
              }
            })}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Edit size={20} />
            <span>수정하기</span>
          </button>
        </div>
      </div>
      
      <div className="max-w-[1200px] mx-auto">
        <div className="relative bg-slate-800/50 rounded-2xl p-8">
          {/* 상단 줄 */}
          <div className="flex justify-center">
            <div className="flex -space-x-[1px]">
              {Array.from({ length: 11 }, (_, i) => renderTile(20 + i))}
            </div>
          </div>
          
          {/* 중간 섹션 */}
          <div className="flex justify-between -mt-[1px]">
            <div className="flex flex-col -space-y-[1px]">
              {Array.from({ length: 9 }, (_, i) => renderTile(19 - i))}
            </div>
            
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-cyan-400">
                  커스텀 게임 #{customGame.id}
                </h2>
                <p className="text-slate-400">
                  {customData?.customName}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col -space-y-[1px]">
              {Array.from({ length: 9 }, (_, i) => renderTile(31 + i))}
            </div>
          </div>
          
          {/* 하단 줄 */}
          <div className="flex justify-center -mt-[1px]">
            <div className="flex -space-x-[1px]">
              {Array.from({ length: 11 }, (_, i) => renderTile(i))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDetail;