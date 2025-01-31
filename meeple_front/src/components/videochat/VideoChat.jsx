import React from "react";

const VideoChat = ({ playerCount }) => {
  return (
    <div
      className="grid gap-2 h-full p-2"
      style={{
        gridTemplateColumns: `repeat(${playerCount}, 1fr)`,
      }}
    >
      {Array(playerCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            className="bg-gray-900 rounded-lg flex items-center justify-center"
          >
            <div className="text-gray-500 text-sm">Player {i + 1}</div>
          </div>
        ))}
    </div>
  );
};

export default VideoChat;
