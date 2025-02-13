
const GameVideoPage = () => {
  return (
    <div>
      <div className="min-h-screen p-8 bg-[#0a0a2a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-cyan-500/50 max-h-[650px] overflow-y-auto custom-scrollbar">
            {/* 영상 표시 */}
            <h1 className="text-5xl font-bold text-cyan-400 mb-4 tracking-wide">
              Video
            </h1>
            <video src="/videos/pokerexample.mp4" type="video/mp4" className="flex-1" controls></video>
          </div>
        </div>
      </div>
    </div>
  )
};

export default GameVideoPage;