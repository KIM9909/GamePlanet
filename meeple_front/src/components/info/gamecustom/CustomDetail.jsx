// CustomDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CustomAPI } from '../../../sources/api/CustomAPI';
import { Edit, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const CustomDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tileImages, setTileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customData, setCustomData] = useState(null);
  const [completeTiles, setCompleteTiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { gameInfo, customGame } = location.state;

  const customizableTiles = [1, 3, 4, 5, 6, 8, 9, 11, 12, 14, 16, 18, 19, 21, 22, 24, 25, 26, 27, 28, 31, 32, 34, 36, 38, 39];

  const getStatusText = (status) => {
    switch(status) {
      case '신청전': return '신청전';
      case '신청완료': return '신청완료';
      case '심사진행중': return '심사진행중';
      case '심사완료': return '심사완료';
      default: return '신청전';
    }
  };

  const status = customData?.customStatus ?? '신청전';
  
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

        // 완성된 타일 목록 로드
        const completeTilesResponse = await CustomAPI.getCompleteTiles(customGame.id);
        // customCompleteList 배열 추출
        const completedTileNumbers = completeTilesResponse?.customCompleteList || [];
        setCompleteTiles(completedTileNumbers);
      } catch (err) {
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customGame.id]);


  // 완성된 커스터마이징 가능한 타일 수 계산
  const getCompletedCustomTilesCount = () => {
    if (!Array.isArray(completeTiles)) {
      return 0;
    }
    
    // 완성된 타일 중 커스터마이징 가능한 타일의 수를 계산
    return completeTiles.filter(tileNumber => 
      customizableTiles.includes(tileNumber)
    ).length;
  };

  const handleSubmit = async () => {
    const completedCount = getCompletedCustomTilesCount();
    if (completedCount < customizableTiles.length) {
      toast.error('모든 커스터마이징 가능한 타일을 완성해야 신청할 수 있습니다.');
      return;
    }

    try {
      setIsSubmitting(true);
      await CustomAPI.updateStatus(customGame.id, 'SUBMITTED');
      // 상태 업데이트 후 데이터 새로고침
      const updatedCustom = await CustomAPI.getElementById(customGame.id);
      setCustomData(updatedCustom);
    } catch (error) {
      toast.error('신청 중 오류가 발생했습니다.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const getIndex = (position) => {
    if (position >= 0 && position <= 10) return 30 - position;
    else if (position >= 11 && position <= 19) return 20 + position;
    else if (position >= 20 && position <= 30) return position - 20;
    else return position - 20;
  };

  const getTileSize = (position) => {
    if ((position > 0 && position < 10) || (position > 20 && position < 30)) {
      return 'w-20 h-32'; // 180px x 250px (w-44: 176px, h-64: 256px)
    }
    else if (position === 0 || position === 10 || position === 20 || position === 30) {
      return 'w-32 h-32'; // 250px x 250px (w-64: 256px)
    }
    else {
      return 'w-32 h-20'; // 250px x 180px
    }
  };

  const renderTile = (position) => {
    const index = getIndex(position);
    const tileSize = getTileSize(position);
    const tileImage = tileImages[index];
    
    // 호버 시 보여질 이미지 크기를 위치에 따라 다르게 설정
    const getHoverSize = (pos) => {
      if ((pos > 0 && pos < 10) || (pos > 20 && pos < 30)) {
        return 'w-[180px] h-[250px]';  // 상단과 하단의 타일 (세로가 더 길게)
      }
      else if (pos === 0 || pos === 10 || pos === 20 || pos === 30) {
        return 'w-[250px] h-[250px]';  // 모서리 타일 (정사각형)
      }
      else {
        return 'w-[250px] h-[180px]';  // 좌우 타일 (가로가 더 길게)
      }
    };
    
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
              <div className={`${getHoverSize(position)} bg-slate-800 rounded-lg p-2 shadow-xl`}>
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
          <div className="flex -mt-[1px] relative h-[712px]"> {/* 기존 justify-between 제거 */}
            <div className="flex flex-col -space-y-[1px] absolute left-[54px]"> {/* absolute와 left 값 추가 */}
              {Array.from({ length: 9 }, (_, i) => renderTile(19 - i))}
            </div>

            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center space-y-6 max-w-xl w-full">
                <div className="bg-slate-800/50 rounded-xl p-8 space-y-6">
                {status === '신청전' && (
                  <>
                    <h2 className="text-2xl font-bold text-cyan-400">커스텀 게임 신청</h2>
                    <p className="text-slate-300">
                      커스텀 게임을 공개하기 위해서는 관리자의 검토가 필요합니다.
                      아래 버튼을 눌러 신청해주세요.
                    </p>
                    <div className="text-slate-300 mt-2">
                      심사신청까지 남은 타일의 개수 : {customizableTiles.length-getCompletedCustomTilesCount()}
                    </div>
                    {getCompletedCustomTilesCount() < customizableTiles.length && (
                      <div className="text-amber-400 mt-2">
                        신청하기 위해서는 모든 커스터마이징 가능한 타일을 완성해야 합니다.
                      </div>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || getCompletedCustomTilesCount() < customizableTiles.length}
                      className={`px-6 py-3 ${
                        isSubmitting || getCompletedCustomTilesCount() < customizableTiles.length
                          ? 'bg-slate-500 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-600'
                      } text-white rounded-lg font-bold transition-all active:scale-95`}
                    >
                      {isSubmitting ? '신청 중...' : '신청하기'}
                    </button>
                  </>
                )}

                  {status === '신청완료' && (
                    <>
                      <h2 className="text-2xl font-bold text-cyan-400">신청완료</h2>
                      <p className="text-slate-300">
                        신청이 완료되었습니다. 곧 심사가 진행될 예정입니다.
                      </p>
                      <div className="text-sm text-slate-400">
                        신청일: {customData.createdAt ? new Date(customData.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </>
                  )}

                  {status === '심사진행중' && (
                    <>
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-cyan-400">심사 진행중</h2>
                      <p className="text-slate-300">
                        관리자가 검토 중입니다. 심사에는 1-2일 정도 소요될 수 있습니다.
                      </p>
                      <div className="text-sm text-slate-400">
                        심사 시작일: {customData?.updatedAt ? new Date(customData.updatedAt).toLocaleDateString() : '-'}
                      </div>
                    </>
                  )}

                  {status === '심사완료' && (
                    <>
                      <div className="flex items-center justify-center text-green-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-green-400">심사 완료</h2>
                      <p className="text-slate-300">
                        심사가 완료되었습니다. 결과를 확인해 주세요.
                      </p>
                      <div className="text-sm text-slate-400">
                        완료일: {customData?.updatedAt ? new Date(customData.updatedAt).toLocaleDateString() : '-'}
                      </div>
                    </>
                  )}
                </div>

                {/* 상태 진행바 */}
                <div className="flex justify-center gap-2 text-sm">
                  {['신청전', '신청완료', '심사진행중', '심사완료'].map((statusText) => (
                    <div
                      key={statusText}
                      className={`px-3 py-1 rounded-full ${
                        statusText === getStatusText(status)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {statusText}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            
            <div className="flex flex-col -space-y-[1px] absolute right-[54px]">
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