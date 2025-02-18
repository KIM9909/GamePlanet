import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, User, UserX, Image as ImageIcon, X, Info } from "lucide-react";
import { AdminAPI } from "../../../sources/api/AdminAPI";
import toast from "react-hot-toast";

const ReportDetail = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processStatus, setProcessStatus] = useState("");
  const [processMemo, setProcessMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'evidence'

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        const response = await AdminAPI.getReport(reportId);        
        setReport(response);
        setProcessMemo(response.reportMemo || "");
        setError(null);
        console.log(response);
      } catch (err) {
        setError("신고 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
      
    };

    fetchReportDetail();
  }, [reportId]);

  const getReasonText = (reason) => {
    const reasonMap = {
      CHAT: "채팅",
      GAME: "게임",
      VOICE: "음성",
      VIDEO: "비디오",
      ETC: "기타",
    };
    return reasonMap[reason] || reason;
  };

  const getStatusText = (status) => {
    const statusMap = {
      'WAIT': '대기중',
      'PASS': '무혐의',
      'WARNING': '경고',
      'BAN': '영구제재'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'WAIT': 'bg-yellow-500',
      'PASS': 'bg-blue-500',
      'WARNING': 'bg-orange-500',
      'BAN': 'bg-red-500'
    };
    return colorMap[status] || 'bg-gray-500';
  };

  const handleSubmit = async () => {
    if (!processStatus && report.processStatus === 'WAIT') {
      toast.error("처리 방식을 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      if (report.processStatus === 'WAIT') {
        // 최초 처리
        const processData = {
          reportId: parseInt(reportId),
          reportResult: processStatus.toUpperCase(),
          reportMemo: processMemo
        };
        await AdminAPI.processReport(processData);
      } else {
        // 처리 내역 수정
        const updateData = {
          reportProcessId: report.reportId,
          reportResult: processStatus.toUpperCase() || report.processStatus,
          reportMemo: processMemo
        };
        await AdminAPI.updateReportProcess(updateData);
      }
      
      toast.success(isEditing ? "처리 내역이 수정되었습니다." : "신고가 처리되었습니다.");
      window.location.reload(); // 페이지 새로고침
    } catch (err) {
      toast.error(isEditing ? "처리 내역 수정에 실패했습니다." : "신고 처리에 실패했습니다.");
      console.error("Error processing report:", err);
    } finally {
      setSubmitting(false);
      setIsEditing(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="text-gray-300">로딩 중...</div></div>;
  if (error) return <div className="flex justify-center items-center h-64"><div className="text-red-400">{error}</div></div>;
  if (!report) return <div className="flex justify-center items-center h-64"><div className="text-gray-300">신고 정보를 찾을 수 없습니다.</div></div>;

  return (
    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-300 hover:text-white flex items-center gap-2">
          <ArrowLeft size={20} />
          돌아가기
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-gray-300">{new Date(report.reportTime).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-white text-sm rounded-full ${getStatusColor(report.processStatus)}`}>
              {getStatusText(report.processStatus)}
            </span>
            {report.processStatus !== 'WAIT' && report.reportMemo && (
              <div className="relative group">
                <button className="p-1 hover:bg-slate-700 rounded-full transition-colors">
                  <Info size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-700 rounded-lg shadow-lg invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <p className="text-sm text-white">{report.reportMemo}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 신고 기본 정보 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">{report.reportTitle}</h2>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-gray-500 text-white text-sm rounded-full">
            {getReasonText(report.reportReason)}
          </span>
        </div>
      </div>

      {/* 신고자/피신고자 정보 */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={20} className="text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">신고자 정보</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-300">닉네임: {report.reporter?.userNickname}</p>
            <p className="text-gray-300">이메일: {report.reporter?.userEmail}</p>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserX size={20} className="text-red-400" />
            <h3 className="text-lg font-semibold text-white">신고 대상자 정보</h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-300">닉네임: {report.user?.userNickname}</p>
            <p className="text-gray-300">이메일: {report.user?.userEmail}</p>
          </div>
        </div>
      </div>

{/* 신고 내용 및 증빙 자료 탭 */}
<div className="mb-8">
        <div className="flex gap-1 mb-4 bg-slate-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'content' 
                ? 'bg-slate-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-slate-600/50'}`}
          >
            신고 내용
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === 'evidence' 
                ? 'bg-slate-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-slate-600/50'}`}
          >
            증빙 자료
            {report.reportDocumentUrl && (
              <span className="ml-2 w-2 h-2 bg-cyan-500 rounded-full inline-block"></span>
            )}
          </button>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          {activeTab === 'content' ? (
            <div className="animate-fadeIn">
              <p className="text-gray-300">{report.reportContent}</p>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {report.reportDocumentUrl ? (
                <div className="space-y-4">
                  <div className="relative aspect-video flex items-center justify-center bg-slate-800 rounded-lg overflow-hidden">
                    <img
                      src={report.reportDocumentUrl}
                      alt="신고 첨부 이미지"
                      className="max-w-full max-h-full object-contain cursor-pointer"
                      onClick={() => setShowFullImage(true)}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  첨부된 증빙 자료가 없습니다.
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* 처리 양식 (대기 상태일 때만 표시) */}
      {report.processStatus === 'WAIT' && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">신고 처리</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">처리 방식</label>
              <select
                value={processStatus}
                onChange={(e) => setProcessStatus(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="">선택해주세요</option>
                <option value="pass">무혐의</option>
                <option value="warning">경고</option>
                <option value="ban">영구제재</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">처리 메모</label>
              <textarea
                value={processMemo}
                onChange={(e) => setProcessMemo(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 h-32 resize-none"
                placeholder="처리 사유나 메모를 입력해주세요..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {submitting ? "처리 중..." : "처리 완료"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 모달 */}
      {showFullImage && report.reportDocumentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            <img
              src={report.reportDocumentUrl}
              alt="신고 첨부 이미지 원본"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;