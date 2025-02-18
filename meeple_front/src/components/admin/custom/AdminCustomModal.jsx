import React, { useState, useEffect } from 'react';
import { CustomAPI } from '../../../sources/api/CustomAPI';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminCustomModal = ({ isOpen, onClose, customId, onStatusUpdate,getStatusColor  }) => {
  const [tileImages, setTileImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customData, setCustomData] = useState(null);
  const [completeTiles, setCompleteTiles] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !customId) return;
      try {
        setLoading(true);
        const [imagesResponse, customResponse, completeTilesResponse] = await Promise.all([
          CustomAPI.getTileImages(customId),
          CustomAPI.getElementById(customId),
          CustomAPI.getCompleteTiles(customId)
        ]);

        const tileImageMap = imagesResponse.reduce((acc, tile) => {
          acc[tile.tileNumber] = tile.tileImageUrl;
          return acc;
        }, {});
        
        setTileImages(tileImageMap);
        setCustomData(customResponse);
        setCompleteTiles(completeTilesResponse?.customCompleteList || []);
      } catch (err) {
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, customId]);

  const handleStatusUpdate = async () => {
    try {
      setIsUpdating(true);
      let nextStatus;
      
      if (customData.customStatus === '신청완료') {
        nextStatus = 'IN_REVIEW';
      } else if (customData.customStatus === '심사진행중') {
        nextStatus = 'COMPLETED';
      }

      if (nextStatus) {
        await CustomAPI.updateStatus(customId, nextStatus);
        const updatedCustom = await CustomAPI.getElementById(customId);
        setCustomData(updatedCustom);
        
        // 상태 업데이트 후 부모 컴포넌트의 목록 새로고침
        await onStatusUpdate();
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('상태 업데이트에 실패했습니다.');
    } finally {
      setIsUpdating(false);
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
      return 'w-12 h-16'; // 더 작은 크기로 조정
    }
    else if (position === 0 || position === 10 || position === 20 || position === 30) {
      return 'w-16 h-16'; // 더 작은 크기로 조정
    }
    else {
      return 'w-16 h-12'; // 더 작은 크기로 조정
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
            group relative
          `}
        >
          {tileImage ? (
            <div className="relative w-full h-full">
              <img 
                src={tileImage}
                alt={`타일 ${index}`}
                className="w-full h-full object-cover"
              />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                            absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                            z-[200] pointer-events-none">
                <div className="bg-slate-800 rounded-lg p-2 shadow-xl w-[250px] h-[250px]">
                  <img 
                    src={tileImage}
                    alt={`타일 ${index} 확대`}
                    className="w-full h-full object-contain rounded"
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
  
    if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute top-[100%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-slate-900 w-[900px] max-h-[100vh] overflow-hidden
                    border-2 border-cyan-500/50 rounded-lg
                    before:absolute before:inset-0 before:border-4 before:border-slate-800 before:rounded-lg
                    after:absolute after:inset-0 after:border after:border-cyan-400/20 after:rounded-lg">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-800/50 border-b border-cyan-500/20 
                      flex justify-between items-center relative z-10">
          <div>
            <h2 className="text-xl font-bold text-cyan-400 mb-1">
              {customData?.customName || '커스텀 게임 상세'}
            </h2>
            <div className="text-sm text-slate-300">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(customData?.customStatus)}`}>
                {customData?.customStatus || '상태 없음'}
                  </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400 hover:text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-70px)] relative z-10">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-cyan-400">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-red-400">{error}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 유저 정보 및 상태 변경 */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="grid grid-cols-3 gap-4 pl-14">
                  <div className="pl-8">
                    <p className="text-slate-400 text-sm">신청일</p>
                    <p className="text-white font-medium">
                      {customData?.createdAt ? new Date(customData.createdAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                  <div className="pl-12">
                    <p className="text-slate-400 text-sm">제작자</p>
                    <p className="text-white font-medium">{customData?.userNickName || '-'}</p>
                  </div>
                  <div className="flex flex-col pl-5">
                    {/* 심사 완료 상태가 아닐 때만 버튼 표시 */}
                    {customData?.customStatus !== '심사완료' && (
                        <button
                        onClick={handleStatusUpdate}
                        disabled={isUpdating}
                        className={`
                            px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                            flex items-center justify-center gap-2 w-32
                            ${customData?.customStatus === '신청완료'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30'
                            }
                            ${isUpdating ? 'opacity-75 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98]'}
                        `}
                        >
                        {isUpdating ? (
                            <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                            처리 중...
                            </div>
                        ) : customData?.customStatus === '신청완료' ? (
                            '심사 시작하기'
                        ) : (
                            '심사 완료하기'
                        )}
                        </button>
                    )}
                    
                    {/* 심사 완료 상태일 때는 완료 메시지 표시 */}
                    {customData?.customStatus === '심사완료' && (
                        <div className="flex items-center gap-2 text-green-400 font-medium">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        심사가 완료되었습니다
                        </div>
                    )}
                    </div>
                </div>
              </div>

                {/* 보드판 */}
                <div className="bg-slate-800/50 rounded-xl p-8 border border-cyan-500/20">
                <div className="flex flex-col items-center gap-6">
                  {/* 상단 줄 */}
                  <div className="flex -space-x-[1px] translate-y-6">
                    {Array.from({ length: 11 }, (_, i) => renderTile(20 + i))}
                  </div>
                  
                    {/* 중간 섹션 */}
                    <div className="flex justify-between w-full px-32"> 
                    {/* 왼쪽 줄 */}
                    <div className="flex flex-col -space-y-[1px] -translate-x-3">
                        {Array.from({ length: 9 }, (_, i) => renderTile(19 - i))}
                    </div>

                    {/* 오른쪽 줄 */}
                    <div className="flex flex-col -space-y-[1px] translate-x-3">
                        {Array.from({ length: 9 }, (_, i) => renderTile(31 + i))}
                    </div>
                    </div>
                  
                  {/* 하단 줄 */}
                  <div className="flex -space-x-[1px] -translate-y-6">
                    {Array.from({ length: 11 }, (_, i) => renderTile(i))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCustomModal;