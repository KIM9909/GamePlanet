import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, User, UserX } from "lucide-react";
import { AdminAPI } from "../../../sources/api/AdminAPI";

const ReportDetail = () => {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processStatus, setProcessStatus] = useState("");
  const [processMemo, setProcessMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReportDetail = async () => {
      try {
        setLoading(true);
        const response = await AdminAPI.getReport(reportId);
        setReport(response);
        setError(null);
      } catch (err) {
        setError("신고 정보를 불러오는데 실패했습니다.");
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [reportId]);

  const handleGoBack = () => {
    navigate(-1);
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSubmit = async () => {
    if (!processStatus) {
      alert("처리 방식을 선택해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      const processData = {
        reportId: parseInt(reportId),
        reportResult: processStatus.toUpperCase(),
      };

      await AdminAPI.processReport(processData);
      alert("신고가 처리되었습니다.");
      navigate(-1);
    } catch (err) {
      alert("신고 처리에 실패했습니다.");
      console.error("Error processing report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-300">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-300">신고 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-300">{formatDate(report.reportTime)}</span>
        </div>
      </div>

      {/* 신고 기본 정보 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {report.reportTitle}
        </h2>
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
            <p className="text-gray-300">
              닉네임: {report.reporter?.userNickname}
            </p>
            <p className="text-gray-300">
              이메일: {report.reporter?.userEmail}
            </p>
          </div>
        </div>

        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <UserX size={20} className="text-red-400" />
            <h3 className="text-lg font-semibold text-white">
              신고 대상자 정보
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-gray-300">닉네임: {report.user?.userNickname}</p>
            <p className="text-gray-300">이메일: {report.user?.userEmail}</p>
          </div>
        </div>
      </div>

      {/* 신고 내용 */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">신고 내용</h3>
        <div className="bg-slate-700 p-4 rounded-lg">
          <p className="text-gray-300">{report.reportContent}</p>
        </div>
      </div>

      {/* 처리 양식 */}
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

          <div className="flex justify-end gap-3">
            <button
              onClick={handleGoBack}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
              disabled={submitting}
            >
              취소
            </button>
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
    </div>
  );
};
// HOTFIX
export default ReportDetail;
