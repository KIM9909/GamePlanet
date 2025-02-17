// ReportFormModal.jsx
import React, { useState } from "react";
import { XCircle } from "lucide-react";

const ReportFormModal = ({ onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    reportReason: "CHAT",
    reportTitle: "",
    reportContent: "",
    reportDocument: null,
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      // 필수 필드들 추가
      formData.append("reportReason", form.reportReason);
      formData.append("reportTitle", form.reportTitle);
      formData.append("reportContent", form.reportContent);

      // 파일 처리
      if (form.reportDocument) {
        formData.append("reportDocument", form.reportDocument);
      } else {
        const emptyBlob = new Blob([], { type: "application/octet-stream" });
        formData.append("reportDocument", emptyBlob, "empty.txt");
      }

      await onSubmit(formData);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-zinc-900 rounded-xl w-[500px] overflow-hidden border border-cyan-500/20">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">신고하기</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-300">신고 사유</label>
            <select
              name="reportReason"
              value={form.reportReason}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="CHAT">채팅</option>
              <option value="VIDEO">비디오</option>
              <option value="VOICE">음성</option>
              <option value="GAME">게임</option>
              <option value="ETC">기타</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">제목</label>
            <input
              type="text"
              name="reportTitle"
              value={form.reportTitle}
              onChange={handleChange}
              placeholder="신고 제목을 입력하세요"
              className="w-full px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">내용</label>
            <textarea
              name="reportContent"
              value={form.reportContent}
              onChange={handleChange}
              placeholder="신고 내용을 상세히 입력해주세요"
              className="w-full h-32 px-3 py-2 bg-zinc-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-300">첨부 자료</label>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                name="reportDocument"
                onChange={handleChange}
                className="hidden"
                id="file-upload"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 text-sm text-gray-300 bg-zinc-800 border border-gray-700 rounded-lg hover:border-cyan-500 cursor-pointer transition-colors"
              >
                파일 선택
              </label>
              <span className="text-sm text-gray-400">
                {form.reportDocument
                  ? form.reportDocument.name
                  : "선택된 파일 없음"}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-gray-700/50 transition-all"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-red-50 bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리중..." : "신고하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFormModal;
