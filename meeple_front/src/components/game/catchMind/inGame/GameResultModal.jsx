import React from "react";
import { Trophy, X } from "lucide-react";

const GameResultModal = ({ isOpen, onClose, results }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl p-8 w-96 transform transition-all shadow-xl border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">게임 결과</h2>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg ${
                index === 0
                  ? "bg-yellow-500/20 border border-yellow-500/50"
                  : index === 1
                  ? "bg-gray-400/20 border border-gray-400/50"
                  : index === 2
                  ? "bg-amber-700/20 border border-amber-700/50"
                  : "bg-gray-800/50 border border-gray-700"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`text-lg font-bold ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-400"
                      : index === 2
                      ? "text-amber-700"
                      : "text-gray-300"
                  }`}
                >
                  {index + 1}등
                </span>
                <span className="text-white font-medium">{result.player}</span>
              </div>
              <span className="text-lg font-bold text-blue-400">
                {result.point}점
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default GameResultModal;
