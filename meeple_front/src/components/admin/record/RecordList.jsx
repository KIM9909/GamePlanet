import React, { useState, useEffect } from 'react';
import { Search, Play, Pause } from 'lucide-react';
import { AdminAPI } from "../../../sources/api/AdminAPI";
import Pagination from '../Pagination';

const RecordList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
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
        // response에서 voiceLogList를 추출
        if (response && response.voiceLogList) {
          setRecords(response.voiceLogList);
          console.log('음성 로그 데이터:', response); // 데이터 확인용 로그
        } else {
          setRecords([]);
          console.log('응답 전체:', response); // 응답 구조 확인용 로그
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

  // 검색 필터링
  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    return record.userNickname.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecords.slice(startIndex, endIndex);
  };

  // 검색 시 페이지 리셋
  const handleSearch = () => {
    setCurrentPage(1);
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
        
        // voiceFileUrl을 사용하도록 수정
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
      alert('음성 파일 재생에 실패했습니다.');
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
      <div className="flex justify-end mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="닉네임 검색..."
            className="px-4 py-2 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 w-80"
          />
          <button 
            onClick={handleSearch}
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
                녹음 파일
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
                  {record.user.userName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {record.voiceLog}
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