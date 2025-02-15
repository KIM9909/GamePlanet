import "react-toastify/dist/ReactToastify.css";
import Jaeeun from "../assets/images/pixel_character/pixel-jaeeun.png";

const CustomToastContent = ({ closeToast }) => (
  <div className="flex flex-col items-center bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-lg shadow-2xl border-2 border-cyan-500/60 relative">
    {/* 닫기 버튼 */}
    <button
      onClick={closeToast}
      className="absolute top-2 right-2 text-cyan-400 hover:text-cyan-300 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-700"
    >
      ✕
    </button>

    <div className="mb-4 text-xl text-cyan-300">
      <div className="flex items-center gap-2">
        <span className="animate-pulse">⚠️</span>
        <span>연결 실패</span>
      </div>
    </div>
    <p className="flex flex-col mb-4 text-gray-300 text-center">
      게임방 입장을 위해서 <span>Meeple 앱 로그인이 필요합니다.</span>
    </p>
    <span className="text-sm mb-1">혹시 Meeple 앱이 없으신가요?</span>

    <a
      href="https://meeple-file-server-2.s3.ap-northeast-2.amazonaws.com/static-files/Meeple+Setup+1.4.5.exe"
      target="_blank"
      rel="noopener noreferrer"
      className="group px-6 py-1 bg-cyan-600 text-white rounded-lg 
                   transform transition-all duration-300
                   hover:bg-cyan-500 w-[280px]
                   active:scale-95
                   shadow-lg
                   tracking-wide
                   border border-cyan-500/60 hover:border-cyan-400/60
                   flex items-center gap-2"
    >
      <span className="text-xl hover:scale-110">
        <img src={Jaeeun} alt="재은" className="w-9 h-9" />
      </span>
      <span>Meeple 앱 다운로드</span>
    </a>
  </div>
);

export default CustomToastContent;
