import React, { useState, useEffect } from 'react';
import { Search, Play, Pause, Eye } from 'lucide-react';
import { AdminAPI } from "../../../sources/api/AdminAPI";
import { useNavigate } from 'react-router-dom';
import Pagination from '../Pagination';
import { toast } from 'react-toastify';

const RecordList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [playing, setPlaying] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const itemsPerPage = 10;

  // API로 음성 로그 목록 가져오기
  useEffect(() => {
    const fetchVoiceLogs = async () => {
      try {
        setLoading(true);
        const response = await AdminAPI.getVoiceLogList();
        console.log(response);
        
        if (response && response.voiceLogList) {
          setRecords(response.voiceLogList);
        } else {
          setRecords([]);
        }
        setError(null);
      } catch (err) {
        setError('음성 로그 목록을 불러오는데 실패했습니다.');
        console.error('Error fetching voice logs:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchVoiceLogs();
  }, []);

  // 상태 텍스트 변환
  const getStatusText = (status, userDeletedAt) => {
    if (status === "Y") {
      return userDeletedAt ? "영구제재" : "무혐의";
    }
    return "미처리";
  };

  // 상태 색상 설정
  const getStatusColor = (status) => {
    switch (status) {
      case 'Y':
        return 'bg-green-500';
      default:
        return 'bg-red-500';
    }
  };

  // 상태별 카운트
  const getStatusCount = (status) => {
    if (!records) return 0;
    
    if (status === '전체') return records.length;
    if (status === '미처리') return records.filter(record => record.voiceProcessStatus === 'N').length;
    if (status === '처리완료') return records.filter(record => record.voiceProcessStatus === 'Y').length;
    return 0;
  };

  // 필터링된 레코드
  const filteredStatus = records.filter(record => {
    const matchesStatus = statusFilter === '전체' || 
      (statusFilter === '미처리' ? record.voiceProcessStatus === 'N' : 
       statusFilter === '처리완료' ? record.voiceProcessStatus === 'Y' : false);

    return matchesStatus;
  });

  // 검색 필터링
  const filteredRecords = filteredStatus.filter(record => {
    if (!searchTerm) return true;
    return record.user?.userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  };

  const handlePlayRecord = async (record) => {
    try {
      if (playing === record.voiceLogId) {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        setPlaying(null);
      } else {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        
        const audio = new Audio(record.voiceFileUrl);
        setAudioElement(audio);
        
        audio.addEventListener('ended', () => {
          setPlaying(null);
        });
        
        await audio.play();
        setPlaying(record.voiceLogId);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      toast.error('음성 파일 재생에 실패했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-300">음성 로그를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* 상태 필터 버튼들 */}
        <div className="flex gap-2">
          {['전체', '미처리', '처리완료'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm
                ${statusFilter === status 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
            >
              {status}
              <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs">
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>

        {/* 검색 영역 */}
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="닉네임 검색..."
            className="px-4 py-2 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 w-80"
          />
          <button 
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            검색
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-slate-700 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-slate-600">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                시간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                닉네임
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                텍스트 변환
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                처리상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                녹음 파일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                상세조회
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {getCurrentPageData().map((record) => (
              <tr key={record.voiceLogId} className="hover:bg-slate-600 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(record.voiceTime).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {record.user?.userNickname}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {record.voiceLog}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(record.voiceProcessStatus)}`}>
                    {getStatusText(record.voiceProcessStatus, record.user.userDeletedAt)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => handlePlayRecord(record)}
                    className="px-3 py-2 bg-slate-800 text-cyan-400 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    {playing === record.voiceLogId ? (
                      <>
                        <Pause size={16} />
                        일시정지
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        재생
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button 
                    onClick={() => navigate(`/admin/record/${record.voiceLogId}`)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                  >
                    <Eye size={16} />
                    상세보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalItems={filteredRecords.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default RecordList;