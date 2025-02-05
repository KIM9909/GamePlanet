import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
      <span className="text-2xl">서버와 연결 중...</span>
    </div>
  );
};

export default LoadingSpinner;
