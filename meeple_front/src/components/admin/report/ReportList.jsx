import React, { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminAPI } from "../../../sources/api/AdminAPI";
import Pagination from "../Pagination";

const ReportList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // API로 신고 목록 데이터 가져오기
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await AdminAPI.getReportList();
        // API 응답 데이터 형식에 맞게 변환
        const formattedReports = response.map((report) => ({
          reportId: report.reportId,
          reportTime: report.reportTime,
          reportReason: report.reportReason,
          reportTitle: report.reportTitle,
          status: getStatusText(report.processStatus),
        }));
        setReports(formattedReports);
        setError(null);
      } catch (err) {
        setError("신고 목록을 불러오는데 실패했습니다.");
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // 상태 텍스트 변환 함수
  const getStatusText = (status) => {
    switch (status) {
      case "WAIT":
        return "대기중";
      case "PASS":
        return "완료(무혐의)";
      case "WARNING":
        return "완료(경고)";
      case "BAN":
        return "완료(제재)";
      default:
        return status;
    }
  };

  // 검색 및 상태 필터링
  const filteredReports = reports.filter((report) => {
    if (!report) return false;

    const matchesSearch =
      !searchTerm ||
      report.reportTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "전체" ||
      (statusFilter === "대기중"
        ? report.status === "대기중"
        : statusFilter === "완료"
        ? report.status?.includes("완료")
        : false);

    return matchesSearch && matchesStatus;
  });

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "대기중":
        return "bg-red-500";
      case "완료(제재)":
        return "bg-green-500";
      case "완료(경고)":
        return "bg-green-500";
      case "완료(무혐의)":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusCount = (status) => {
    if (!reports) return 0;

    if (status === "전체") return reports.length;
    if (status === "대기중")
      return reports.filter((report) => report?.status === "대기중").length;
    if (status === "완료")
      return reports.filter((report) => report?.status?.includes("완료"))
        .length;
    return 0;
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-300">불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        {/* 상태 필터 버튼들 */}
        <div className="flex gap-2">
          {["전체", "대기중", "완료"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                handleFilterChange();
              }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm
                ${
                  statusFilter === status
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
            >
              {status}
              <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs">
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>

        {/* 검색 영역 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange();
            }}
            placeholder="신고 제목 검색..."
            className="px-4 py-2 bg-slate-700 text-white placeholder-gray-400 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 w-64"
          />
          <button
            onClick={handleFilterChange}
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
                신고 시간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                신고 제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                처리상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                상세조회
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {getCurrentPageData().map((report) => (
              <tr
                key={report.reportId}
                className="hover:bg-slate-600 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(report.reportTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {report.reportTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-white bg-gray-500">
                    {getReasonText(report.reportReason)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => navigate(`/admin/report/${report.reportId}`)}
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
        totalItems={filteredReports.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ReportList;
