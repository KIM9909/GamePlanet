import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, User, Play, Pause } from 'lucide-react';
import { AdminAPI } from '../../../sources/api/AdminAPI';
import { toast } from 'react-toastify';

const RecordDetail = () => {
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processStatus, setProcessStatus] = useState('');
  const [playing, setPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { recordId } = useParams();

  const getStatusText = (record) => {
    if (record.voiceProcessStatus === 'N') return '미처리';
    if (record.voiceProcessStatus === 'Y' && record.user?.userDeletedAt) return '영구제재';
    if (record.voiceProcessStatus === 'Y') return '무혐의';
    return '미처리';
  };
  
  const getStatusColor = (record) => {
    if (record.voiceProcessStatus === 'N') return 'bg-yellow-500';
    if (record.voiceProcessStatus === 'Y' && record.user?.userDeletedAt) return 'bg-red-500';
    if (record.voiceProcessStatus === 'Y') return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  useEffect(() => {
    const fetchVoiceLog = async () => {
      try {
        setLoading(true);
        const response = await AdminAPI.getVoiceLog(recordId);
        setRecord(response.voiceLog);
        if (response.voiceLog?.voiceProcessStatus === 'N') {
          setProcessStatus('');
        }
      } catch (err) {
        setError('음성 로그를 불러오는데 실패했습니다.');
        console.error('Error fetching voice log:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoiceLog();
  }, [recordId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePlayRecord = async () => {
    try {
      if (playing) {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        setPlaying(false);
      } else {
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
        
        const audio = new Audio(record?.voiceFileUrl);
        setAudioElement(audio);
        
        audio.addEventListener('ended', () => {
          setPlaying(false);
        });
        
        await audio.play();
        setPlaying(true);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      toast.error('음성 파일 재생에 실패했습니다.');
    }
  };

  const handleProcessVoiceLog = async () => {
    if (!processStatus) {
      toast.error('처리 상태를 선택해주세요.');
      return;
    }
  
    try {
      setSubmitting(true);
      const processData = {
        voiceLogId: parseInt(recordId),
        voiceLogProcessStatus: processStatus
      };
  
      const response = await AdminAPI.processVoiceLog(processData);
      if (response.code === 200) {
        toast.success('처리가 완료되었습니다.');
        navigate(-1);
      } else {
        toast.error('처리에 실패했습니다.');
      }
    } catch (err) {
      toast.error('처리에 실패했습니다.');
      console.error('Error processing voice log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-300">음성 로그를 불러오는 중...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;
  if (!record) return <div className="text-center py-8 text-gray-300">음성 로그를 찾을 수 없습니다.</div>;

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handleGoBack}
          className="text-gray-300 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          돌아가기
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-gray-300">
              {record.voiceTime ? new Date(record.voiceTime).toLocaleString() : '시간 정보 없음'}
            </span>
          </div>
          <span className={`px-3 py-1 text-white text-sm rounded-full ${getStatusColor(record)}`}>
            {getStatusText(record)}
          </span>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <User size={20} className="text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">사용자 정보</h3>
        </div>
        <div className="space-y-2">
          <p className="text-gray-300">
            닉네임: {record.user?.userName || '정보 없음'}
          </p>
          <p className="text-gray-300">
            이메일: {record.user?.userEmail || '정보 없음'}
          </p>
        </div>
      </div>

      {/* 음성 정보 */}
      <div className="bg-slate-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">음성 정보</h3>
        <div className="space-y-4">
          {record.voiceFileUrl && (
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePlayRecord}
                className="px-4 py-2 bg-slate-800 text-cyan-400 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                {playing ? (
                  <>
                    <Pause size={20} />
                    일시정지
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    재생
                  </>
                )}
              </button>
              <span className="text-gray-300">음성 파일</span>
            </div>
          )}
          <div className="bg-slate-800 p-4 rounded-lg">
            <p className="text-gray-300">
              {record.voiceLog || '변환된 텍스트 없음'}
            </p>
          </div>
        </div>
      </div>

      {/* 처리 양식 */}
      {record.voiceProcessStatus === 'N' && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">처리</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">처리 상태</label>
              <select
                value={processStatus}
                onChange={(e) => setProcessStatus(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="">선택해주세요</option>
                <option value="NORMAL">무혐의</option>
                <option value="BAN">영구제재</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                disabled={submitting}
              >
                취소
              </button>
              <button
                onClick={handleProcessVoiceLog}
                disabled={submitting}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {submitting ? '처리 중...' : '처리 완료'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordDetail;