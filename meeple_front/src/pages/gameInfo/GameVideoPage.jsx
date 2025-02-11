import PlayVideo from "../../components/info/PlayVideo"

const GameVideoPage = () => {
  return (
    <div>
      <div className="min-h-screen relative overflow-hidden">
      <div className="min-h-screen p-8 relative z-5">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl p-8 backdrop-blur-lg border border-indigo-500/30">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Video
            </h1>
            <video src="/videos/pokerexample.mp4" type="video/mp4" className="flex-1" controls></video>
          </div>
        </div>
      </div>
      </div>
      <PlayVideo />
    </div>
  )
};

export default GameVideoPage;