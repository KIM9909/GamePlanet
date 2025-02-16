// CompletionCelebration.jsx
import React, { useEffect } from 'react';
import { Sparkles, CheckCircle2, PartyPopper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompletionCelebration = ({ onClose, gameInfoId }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const navigate = useNavigate();

  const handleComplete = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        <div className="absolute -top-4 -left-4">
          <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slow" />
        </div>
        <div className="absolute -bottom-4 -right-4">
          <PartyPopper className="w-12 h-12 text-cyan-400 animate-bounce" />
        </div>
        
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            커스터마이징 완료!
          </h2>
          <div className="space-y-2">
            <p className="text-slate-300">
              모든 타일과 카드가 성공적으로 만들어졌습니다.
            </p>
            <p className="text-slate-300">
              관리자 검토 후 승인되면 게임이 출시됩니다.
            </p>
          </div>
          
          <div className="pt-4">
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              검토 요청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionCelebration;